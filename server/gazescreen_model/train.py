"""Pre-specified participant-level baseline experiment; no model search."""
from __future__ import annotations

import argparse
import json
import platform
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.base import clone
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, balanced_accuracy_score, confusion_matrix, roc_auc_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from .features import FEATURES, BEHAVIOR_FEATURES, DEFINITIONS, PROTOCOL, SCHEMA

SEED = 20261023


def logistic():
    return make_pipeline(SimpleImputer(strategy="median"), StandardScaler(),
                         LogisticRegression(C=0.1, class_weight="balanced", solver="liblinear",
                                            max_iter=2000, random_state=SEED))


def metrics(y, scores):
    pred = (scores >= .5).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel()
    return {"n": len(y), "accuracy": float(accuracy_score(y, pred)),
            "balanced_accuracy": float(balanced_accuracy_score(y, pred)),
            "sensitivity": float(tp / (tp + fn)), "specificity": float(tn / (tn + fp)),
            "roc_auc": float(roc_auc_score(y, scores)),
            "confusion_matrix": {"true_negative": int(tn), "false_positive": int(fp),
                                 "false_negative": int(fn), "true_positive": int(tp)}}


def bootstrap_intervals(y, scores, repeats=2000):
    rng = np.random.default_rng(SEED)
    groups = [np.flatnonzero(y == cls) for cls in [0, 1]]
    values = {key: [] for key in ["accuracy", "balanced_accuracy", "sensitivity", "specificity", "roc_auc"]}
    for _ in range(repeats):
        idx = np.concatenate([rng.choice(g, len(g), replace=True) for g in groups])
        result = metrics(y[idx], scores[idx])
        for k in values:
            values[k].append(result[k])
    return {k: [float(x) for x in np.percentile(v, [2.5, 97.5])] for k, v in values.items()}


def bundle(pipeline, participants, ranges, audit):
    return {"pipeline": pipeline, "feature_names": FEATURES, "schema": SCHEMA, "protocol": PROTOCOL,
            "model_version": "logistic-v1", "training_participants": [int(x) for x in participants],
            "feature_training_ranges": ranges, "source_sha256": audit["source_sha256"],
            "diagnostic_use_validated": False, "webcam_use_validated": False}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path("data"))
    parser.add_argument("--out", type=Path, default=Path("artifacts"))
    parser.add_argument("--permutations", type=int, default=199)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    all_rows = pd.read_csv(args.data / "session_features.csv")
    audit = json.loads((args.data / "extraction_audit.json").read_text(encoding="utf-8"))
    if audit["extraction_errors"]:
        raise ValueError("Resolve extraction failures before training")
    cohort = all_rows[all_rows.group.isin(["off-ADHD", "Ctrl"])].copy()
    selected = cohort[cohort.quality_pass].reset_index(drop=True)
    if selected.participant_id.duplicated().any():
        raise ValueError("Baseline expects one session per participant")
    if selected[FEATURES].isna().any().any():
        raise ValueError("Unexpected missing feature after quality screening")
    y = (selected.group == "off-ADHD").astype(int).to_numpy()
    if min(np.bincount(y)) < 10:
        raise ValueError("Too few participants for the planned experiment")
    X = selected[FEATURES]
    splitter = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    splits = list(splitter.split(X, y))
    methods = {
        "majority_baseline": (DummyClassifier(strategy="most_frequent"), FEATURES),
        "logistic_behavior_only": (logistic(), BEHAVIOR_FEATURES),
        "logistic_combined_primary": (logistic(), FEATURES),
        "random_forest_comparison": (make_pipeline(SimpleImputer(strategy="median"),
            RandomForestClassifier(n_estimators=300, max_depth=3, min_samples_leaf=5,
                                   class_weight="balanced", random_state=SEED, n_jobs=1)), FEATURES),
    }
    scores_by_method = {}
    results, folds, demo = {}, [], []
    for name, (estimator, cols) in methods.items():
        scores = np.full(len(y), np.nan)
        fold_results = []
        for fold, (train, test) in enumerate(splits):
            train_ids = selected.participant_id.iloc[train].tolist()
            test_ids = selected.participant_id.iloc[test].tolist()
            assert not set(train_ids) & set(test_ids)
            fitted = clone(estimator).fit(selected.iloc[train][cols], y[train])
            score = fitted.predict_proba(selected.iloc[test][cols])[:, 1]
            scores[test] = score
            fold_results.append(metrics(y[test], score))
            if name == "logistic_combined_primary":
                ranges = {c: [float(selected.iloc[train][c].min()), float(selected.iloc[train][c].max())] for c in FEATURES}
                model_file = f"fold_{fold + 1}.joblib"
                joblib.dump(bundle(fitted, train_ids, ranges, audit), args.out / model_file)
                folds.append({"fold": fold + 1, "train_participants": train_ids, "test_participants": test_ids})
                for pos, p in zip(test, score):
                    row = selected.iloc[pos]
                    demo.append({"sample_id": f"participant-{int(row.participant_id):02d}",
                                 "participant_id": int(row.participant_id), "fold": fold + 1,
                                 "model_file": model_file, "age": int(row.age),
                                 "features": {c: float(row[c]) for c in FEATURES},
                                 "quality": {c: float(row[c]) for c in ["gaze_valid_fraction", "pupil_valid_fraction"]},
                                 "observed_group": "ADHD" if y[pos] else "control",
                                 "oof_model_score": float(p)})
        scores_by_method[name] = scores
        results[name] = {**metrics(y, scores), "fold_results": fold_results}
        print(name, json.dumps(metrics(y, scores)), flush=True)
    primary = scores_by_method["logistic_combined_primary"]
    results["logistic_combined_primary"]["conditional_bootstrap_95_intervals"] = bootstrap_intervals(y, primary)
    print("Running label permutation check...", flush=True)
    rng = np.random.default_rng(SEED + 1)
    permuted_aucs = []
    for p in range(args.permutations):
        yp = rng.permutation(y)
        out = np.zeros(len(y))
        for train, test in splitter.split(X, yp):
            fitted = logistic().fit(X.iloc[train], yp[train])
            out[test] = fitted.predict_proba(X.iloc[test])[:, 1]
        permuted_aucs.append(float(roc_auc_score(yp, out)))
        if (p + 1) % 50 == 0:
            print(f"Permutation {p+1}/{args.permutations}", flush=True)
    auc = results["logistic_combined_primary"]["roc_auc"]
    permutation = {"n_permutations": args.permutations,
                   "p_value": float((1 + np.sum(np.asarray(permuted_aucs) >= auc)) / (1 + args.permutations)),
                   "null_aucs": permuted_aucs}
    full = logistic().fit(X, y)
    ranges = {c: [float(X[c].min()), float(X[c].max())] for c in FEATURES}
    joblib.dump(bundle(full, selected.participant_id.tolist(), ranges, audit), args.out / "research_model.joblib")
    demo.sort(key=lambda row: row["participant_id"])
    (args.out / "demo_records.json").write_text(json.dumps(demo, indent=2), encoding="utf-8")
    oof = selected[["participant_id", "group", "age"]].copy()
    for name, scores in scores_by_method.items():
        oof[name] = scores
    oof.to_csv(args.out / "out_of_fold_predictions.csv", index=False)
    report = {
        "experiment": "Pre-specified fixed models; no feature/model/hyperparameter selection from evaluation results",
        "primary_model": "logistic_combined_primary", "random_seed": SEED,
        "participants_before_quality_filter": len(cohort), "participants_evaluated": len(selected),
        "groups_evaluated": selected.group.value_counts().to_dict(),
        "excluded_low_quality": cohort[~cohort.quality_pass][["participant_id", "group", "gaze_valid_fraction", "pupil_valid_fraction"]].to_dict("records"),
        "medicated_sessions_excluded": int((all_rows.group == "on-ADHD").sum()),
        "age_by_group": selected.groupby("group").age.agg(["mean", "min", "max"]).to_dict("index"),
        "features": DEFINITIONS, "protocol": PROTOCOL, "schema": SCHEMA,
        "validation": "5-fold stratified participant-level cross-validation; all preprocessing fitted within each training fold",
        "threshold": .5, "folds": folds, "results": results, "permutation_test": permutation,
        "coefficients": dict(zip(FEATURES, full[-1].coef_[0].tolist())),
        "source_sha256": audit["source_sha256"],
        "versions": {"python": platform.python_version(), "sklearn": sklearn.__version__,
                     "numpy": np.__version__, "pandas": pd.__version__, "joblib": joblib.__version__},
        "limitations": ["Small single-study cohort, ages 8-13; quality exclusions may bias results",
                        "Cross-validation is internal validation, not an independent clinical study",
                        "Bootstrap intervals condition on saved out-of-fold predictions; they omit refit and CV dependence uncertainty",
                        "Scores are uncalibrated classifier outputs, not individual ADHD probabilities",
                        "Original EyeLink 1000 task only; no validated webcam, adult, or autism use",
                        "Age, recording quality, light, task familiarity and other confounding may affect features",
                        "The combined model uses behavioral task performance as well as eye measurements",
                        "The full model is refitted on all eligible participants; evaluate demo cases using their fold models only"]
    }
    (args.out / "evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    card = ["# GazeScreen research model — measured results", "",
            f"Trained on the local Figshare dataset. {len(selected)} participants passed the predefined quality threshold (at least 50% usable pupil and on-screen gaze samples).",
            "", "This is a research classifier for the original laboratory task. Clinical and webcam use are unvalidated.", "",
            "| Model | Accuracy | Balanced accuracy | Sensitivity | Specificity | ROC-AUC |",
            "|---|---:|---:|---:|---:|---:|"]
    for name, result in results.items():
        card.append(f"| {name} | {result['accuracy']:.1%} | {result['balanced_accuracy']:.1%} | {result['sensitivity']:.1%} | {result['specificity']:.1%} | {result['roc_auc']:.3f} |")
    r = results["logistic_combined_primary"]
    card += ["", f"Primary model: fixed logistic regression, C=0.1, balanced class weights. Decision threshold: 0.5.",
             f"Label permutation check: p={permutation['p_value']:.3f} using {args.permutations} permutations.",
             "", "The comparison models were not used to select or retune the delivered model.", "",
             "## Primary model errors", "", json.dumps(r["confusion_matrix"]), "",
             "## Internal validation intervals", "", "Approximate 95% bootstrap intervals, conditional on the out-of-fold predictions:", ""]
    for key, bounds in r["conditional_bootstrap_95_intervals"].items():
        card.append(f"- {key}: {bounds[0]:.3f}–{bounds[1]:.3f}")
    card += ["", "## Data and limitations", ""] + [f"- {s}" for s in report["limitations"]]
    card += [f"- Excluded recordings: {report['excluded_low_quality']}",
             f"- Source SHA-256: `{audit['source_sha256']}`", "",
             "Source: [Figshare dataset](https://doi.org/10.6084/m9.figshare.7218725), CC BY 4.0; Rojas-Líbano, Wainstein and Ossandón.",
             "Study: [Scientific Data, 2019](https://doi.org/10.1038/s41597-019-0037-2).", ""]
    (args.out.parent / "MODEL_REPORT.md").write_text("\n".join(card), encoding="utf-8")
    print("Saved model, fold models, demo recordings, evaluation and report.", flush=True)


if __name__ == "__main__":
    main()
