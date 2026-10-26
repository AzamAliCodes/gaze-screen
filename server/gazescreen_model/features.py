"""Frozen feature definitions shared by extraction, training and inference."""
from __future__ import annotations

import numpy as np

PROTOCOL = "figshare-7218725-eyelink-wm-v1"
SCHEMA = "session-features-v1"
FEATURES = [
    "accuracy_responded",
    "omission_fraction",
    "median_correct_rt_ms",
    "iqr_correct_rt_ms",
    "high_load_accuracy_cost",
    "pupil_iqr_over_median",
    "gaze_x_iqr_screen_fraction",
    "gaze_y_iqr_screen_fraction",
]
BEHAVIOR_FEATURES = FEATURES[:5]
DEFINITIONS = {
    FEATURES[0]: "Mean Perform across trials with a recorded 0/1 response; omissions excluded.",
    FEATURES[1]: "Fraction of trials with non-finite Rtime (documented no response).",
    FEATURES[2]: "Median Rtime on correct trials with 100 <= Rtime <= 1500 ms.",
    FEATURES[3]: "75th minus 25th percentile of those same correct-trial reaction times, ms.",
    FEATURES[4]: "Responded-trial accuracy at Load=1 minus responded-trial accuracy at Load=2.",
    FEATURES[5]: "IQR/median of positive finite raw pupil Diameter within recorded trial windows, arbitrary units cancel in ratio.",
    FEATURES[6]: "IQR of gaze x / 1920 within trial windows with positive pupil and on-screen finite gaze.",
    FEATURES[7]: "IQR of gaze y / 1080 on the same valid samples.",
}
BOUNDS = {
    FEATURES[0]: (0, 1), FEATURES[1]: (0, 1), FEATURES[2]: (100, 1500),
    FEATURES[3]: (0, 1400), FEATURES[4]: (-1, 1), FEATURES[5]: (0, None),
    FEATURES[6]: (0, 1), FEATURES[7]: (0, 1),
}


def iqr(values):
    values = np.asarray(values, dtype=float)
    values = values[np.isfinite(values)]
    return float(np.diff(np.percentile(values, [25, 75]))[0]) if values.size else float("nan")


def behavior_features(perform, rt, load):
    perform, rt, load = [np.asarray(x, dtype=float).ravel() for x in (perform, rt, load)]
    if not (len(perform) == len(rt) == len(load)):
        raise ValueError("Trial arrays have inconsistent lengths")
    if not np.isin(perform[np.isfinite(perform)], [0, 1]).all():
        raise ValueError("Unexpected Perform codes")
    if not np.isin(load, [1, 2]).all():
        raise ValueError("Unexpected Load codes")
    valid = np.isfinite(perform)
    usable_rt = rt[(perform == 1) & np.isfinite(rt) & (rt >= 100) & (rt <= 1500)]
    if valid.sum() < 20 or usable_rt.size < 10:
        raise ValueError("Insufficient behavioral measurements")
    accuracy = lambda level: float(np.mean(perform[valid & (load == level)]))
    return {
        "accuracy_responded": float(np.mean(perform[valid])),
        "omission_fraction": float(np.mean(~np.isfinite(rt))),
        "median_correct_rt_ms": float(np.median(usable_rt)),
        "iqr_correct_rt_ms": iqr(usable_rt),
        "high_load_accuracy_cost": accuracy(1) - accuracy(2),
    }


def validate_features(values):
    if set(values) != set(FEATURES):
        raise ValueError("Feature names must exactly match the published schema")
    for name in FEATURES:
        x = values[name]
        if x is None or not np.isfinite(x):
            raise ValueError(f"Missing or non-finite feature: {name}")
        lo, hi = BOUNDS[name]
        if x < lo or (hi is not None and x > hi):
            raise ValueError(f"Out-of-range feature: {name}")

