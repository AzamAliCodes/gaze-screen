"""Local research API. No raw video, live diagnosis, or user-supplied model loading."""
from __future__ import annotations

from contextlib import asynccontextmanager
import json
import os
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from .features import FEATURES, DEFINITIONS, PROTOCOL, SCHEMA, validate_features

DEFAULT_ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"


class DemoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sample_id: str = Field(min_length=1, max_length=64)


class FeatureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    protocol: Literal[PROTOCOL]
    schema_version: Literal[SCHEMA]
    acquisition: Literal["EyeLink1000"]
    sample_rate_hz: Literal[1000]
    age_years: int = Field(ge=8, le=13)
    trial_count: Literal[160]
    pupil_valid_fraction: float = Field(ge=.5, le=1, allow_inf_nan=False)
    gaze_valid_fraction: float = Field(ge=.5, le=1, allow_inf_nan=False)
    features: dict[str, float]


def predict_bundle(bundle, values):
    validate_features(values)
    if bundle["feature_names"] != FEATURES or bundle["schema"] != SCHEMA or bundle["protocol"] != PROTOCOL:
        raise ValueError("Saved model schema mismatch")
    X = pd.DataFrame([[values[name] for name in FEATURES]], columns=FEATURES)
    score = float(bundle["pipeline"].predict_proba(X)[0, 1])
    outside = [name for name, (lo, hi) in bundle["feature_training_ranges"].items()
               if values[name] < lo or values[name] > hi]
    return {"status": "ok", "model_version": bundle["model_version"], "research_class": "ADHD" if score >= .5 else "control",
            "model_score": score, "score_meaning": "Uncalibrated classifier score; not a personal ADHD probability",
            "features_outside_training_range": outside,
            "diagnostic_use_validated": False, "webcam_use_validated": False}


def create_app(artifact_dir=None):
    root = Path(artifact_dir or os.environ.get("GAZESCREEN_ARTIFACTS", DEFAULT_ARTIFACTS))

    @asynccontextmanager
    async def lifespan(app):
        # These files are generated locally by train.py and are trusted. Never
        # load pickled/joblib files supplied by API users.
        app.state.full_model = joblib.load(root / "research_model.joblib")
        app.state.fold_models = {i: joblib.load(root / f"fold_{i}.joblib") for i in range(1, 6)}
        app.state.records = {r["sample_id"]: r for r in json.loads((root / "demo_records.json").read_text(encoding="utf-8"))}
        app.state.evaluation = json.loads((root / "evaluation.json").read_text(encoding="utf-8"))
        yield

    app = FastAPI(title="GazeScreen research classifier", version="0.1.0", lifespan=lifespan)
    origins = [s.strip() for s in os.environ.get("GAZESCREEN_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if s.strip()]
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False,
                       allow_methods=["GET", "POST"], allow_headers=["Content-Type"])

    @app.get("/health")
    def health():
        return {"status": "ok", "model_loaded": True, "model_version": "logistic-v1"}

    @app.get("/api/model-info")
    def model_info():
        evaluation = app.state.evaluation
        return {"protocol": PROTOCOL, "schema_version": SCHEMA, "features": DEFINITIONS,
                "participants_evaluated": evaluation["participants_evaluated"],
                "validation": evaluation["validation"], "results": evaluation["results"],
                "limitations": evaluation["limitations"]}

    @app.get("/api/demo-samples")
    def samples():
        return [{"sample_id": r["sample_id"], "age": r["age"], "fold": r["fold"]}
                for r in app.state.records.values()]

    @app.post("/api/predict-demo")
    def demo(request: DemoRequest):
        record = app.state.records.get(request.sample_id)
        if record is None:
            raise HTTPException(404, "Unknown research sample")
        model = app.state.fold_models[record["fold"]]
        if record["participant_id"] in model["training_participants"]:
            raise HTTPException(500, "Invalid demonstration split")
        result = predict_bundle(model, record["features"])
        return {**result, "mode": "out_of_fold_research_demo", "sample_id": request.sample_id,
                "participant_excluded_from_training": True, "observed_group": record["observed_group"],
                "correct": result["research_class"] == record["observed_group"], "quality": record["quality"]}

    @app.post("/api/predict")
    def predict(request: FeatureRequest):
        try:
            result = predict_bundle(app.state.full_model, request.features)
        except ValueError as exc:
            raise HTTPException(422, str(exc)) from exc
        return {**result, "mode": "compatible_research_features",
                "input_provenance": "Caller-declared acquisition; this API cannot verify hardware or clinical labels",
                "generalization_to_new_recordings_validated": False}

    return app


app = create_app()
