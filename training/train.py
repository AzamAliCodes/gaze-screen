"""
Train ADHD + ASD screening models on public gaze datasets and export to ONNX.

Usage:
    python download_datasets.py     (once — fetches data into training/data/)
    python train.py                 (writes ../../public/models/*.onnx + model_meta.json)

Model selection: stratified 5-fold CV over two candidates per task
(logistic regression pipeline, histogram gradient boosting); the higher
mean ROC-AUC wins and is refit on the full dataset before export.
"""

import datetime
import json
import os
import sys

import numpy as np
import onnx
from skl2onnx.common.data_types import FloatTensorType
from skl2onnx import convert_sklearn
from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, balanced_accuracy_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from datasets import load_adhd_dataset, load_asd_dataset
from features import FEATURE_NAME_SOCIAL, FEATURE_NAMES_BASE

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')
OUT = os.path.normpath(os.path.join(HERE, '..', 'public', 'models'))

SEED = 42
FOLDS = 5

ADHD_CITATION = (
    'Deng et al. 2022, "Detection of ADHD based on Eye Movements during '
    'Natural Viewing" (ECML-PKDD) — github.com/aeye-lab/ecml-ADHD (HBN data)'
)
ASD_CITATION = (
    'Cilia et al. 2022, "Eye-tracking Dataset to Support the Research on '
    'Autism Spectrum Disorder", IJCAI-ECAI SDAIH — figshare 10.6084/m9.figshare.20113592'
)


def candidates():
    return {
        'logistic_l2': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=2000, C=1.0)),
        ]),
        'logistic_l1': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=2000, C=0.5, l1_ratio=1.0, solver='saga')),
        ]),
        'hist_gradient_boosting': HistGradientBoostingClassifier(
            max_depth=2,
            max_iter=120,
            learning_rate=0.06,
            min_samples_leaf=12,
            l2_regularization=1.0,
            random_state=SEED,
        ),
    }


def cv_evaluate(model, X, y, folds=FOLDS):
    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=SEED)
    aucs, accs, bal_accs = [], [], []
    for train_idx, test_idx in cv.split(X, y):
        m = clone(model)
        m.fit(X[train_idx], y[train_idx])
        proba = m.predict_proba(X[test_idx])[:, 1]
        pred = (proba >= 0.5).astype(int)
        aucs.append(roc_auc_score(y[test_idx], proba))
        accs.append(accuracy_score(y[test_idx], pred))
        bal_accs.append(balanced_accuracy_score(y[test_idx], pred))
    return {
        'auc_mean': float(np.mean(aucs)),
        'auc_std': float(np.std(aucs)),
        'acc_mean': float(np.mean(accs)),
        'bal_acc_mean': float(np.mean(bal_accs)),
    }


def export_onnx(model, feature_names, path):
    # skl2onnx's tree converter emits nodes_missing_value_tracks_true as a mixed
    # [uint8, False, ...] list, which onnx's make_attribute rejects for INTS.
    import onnx.helper as onnx_helper
    orig_attr = onnx_helper.make_attribute

    def _make_attribute(key, value):
        if isinstance(value, (list, tuple, np.ndarray)):
            vals = list(value)
            if any(isinstance(v, (bool, np.bool_)) for v in vals):
                value = [int(v) for v in vals]
        return orig_attr(key, value)

    initial = [('features', FloatTensorType([None, len(feature_names)]))]
    onnx_helper.make_attribute = _make_attribute
    try:
        onnx_model = convert_sklearn(
            model, initial_types=initial, target_opset=17,
            options={id(model): {'zipmap': False}},
        )
    finally:
        onnx_helper.make_attribute = orig_attr
    onnx.checker.check_model(onnx_model)
    onnx.save(onnx_model, path)


def train_task(task, frame, feature_names, citation):
    df = frame.dropna(subset=['age']).copy()
    cols = [c for c in feature_names if c in df.columns]
    X = df[cols].to_numpy(dtype=np.float32)
    y = df['label'].to_numpy(dtype=np.int64)
    missing = set(feature_names) - set(cols)
    if missing:
        raise RuntimeError(f'{task}: missing feature columns {missing}')

    print(f'\n=== {task.upper()} ===')
    print(f'subjects: {len(df)}  positive: {int(y.sum())}  negative: {int(len(y) - y.sum())}')
    print(f'features: {cols}')

    results = {}
    for name, model in candidates().items():
        stats = cv_evaluate(model, X, y)
        results[name] = stats
        print(f'  {name:26s} AUC {stats["auc_mean"]:.3f} +/- {stats["auc_std"]:.3f}  '
              f'acc {stats["acc_mean"]:.3f}  bal_acc {stats["bal_acc_mean"]:.3f}')

    best_name = max(results, key=lambda k: results[k]['auc_mean'])
    best_stats = results[best_name]
    print(f'  -> selected: {best_name}')

    final = clone(candidates()[best_name])
    final.fit(X, y)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f'{task}.onnx')
    export_onnx(final, cols, path)
    print(f'  exported: {path} ({os.path.getsize(path)} bytes)')

    return {
        'file': f'{task}.onnx',
        'engine': 'onnx',
        'algorithm': best_name,
        'features': cols,
        'cv': {'folds': FOLDS, 'seed': SEED, 'candidates': results, 'selected': best_name,
               **{k: best_stats[k] for k in ('auc_mean', 'auc_std', 'acc_mean', 'bal_acc_mean')}},
        'n_subjects': int(len(df)),
        'n_positive': int(y.sum()),
        'age_range': [float(df['age'].min()), float(df['age'].max())],
        'thresholds': {'low': 0.35, 'moderate': 0.62},
        'training_date': datetime.date.today().isoformat(),
        'dataset': citation,
    }


def main():
    ecml_root = os.path.join(DATA, 'ecml-ADHD')
    asd_root = os.path.join(DATA, 'asd')
    if not os.path.isdir(ecml_root) or not os.path.isdir(asd_root):
        sys.exit('Datasets missing — run: python download_datasets.py')

    print('Loading ADHD dataset (ECML/HBN)...')
    adhd_df = load_adhd_dataset(ecml_root)
    print('Loading ASD dataset (Cilia et al.)...')
    asd_df = load_asd_dataset(asd_root)

    meta = {
        'version': 1,
        'generated': datetime.datetime.now().isoformat(timespec='seconds'),
        'disclaimer': (
            'Screening aid only — not a medical diagnosis. Trained on public '
            'research datasets; validated with cross-validation on those datasets, '
            'not on webcam-quality gaze from this app.'
        ),
        'models': {
            'adhd': train_task('adhd', adhd_df, FEATURE_NAMES_BASE, ADHD_CITATION),
            'asd': train_task('asd', asd_df, FEATURE_NAMES_BASE + [FEATURE_NAME_SOCIAL], ASD_CITATION),
        },
    }
    meta_path = os.path.join(OUT, 'model_meta.json')
    with open(meta_path, 'w', encoding='utf-8') as fh:
        json.dump(meta, fh, indent=2)
    print(f'\nWrote {meta_path}')


if __name__ == '__main__':
    main()
