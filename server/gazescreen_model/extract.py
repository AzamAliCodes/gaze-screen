"""Read this dataset's v7.3 tables without requiring MATLAB.

This intentionally supports only Task_data and Task_epocs in the inspected
Pupil_data structure. It validates the MCOS table blocks, dimensions, names and
trial timestamps; it is not a general MATLAB object decoder. MCOS layout
reference: https://github.com/WilliamGarrow/mat73-reader/blob/main/FORMAT.md
No source code from that package is required or bundled.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import h5py
import numpy as np
import pandas as pd

from .features import FEATURES, SCHEMA, PROTOCOL, behavior_features, iqr


def text(ds):
    return "".join(chr(int(x)) for x in ds[()].ravel())


def table_columns(f, ref, expected):
    table = f[ref]
    header = table[()].ravel()
    if table.attrs.get("MATLAB_class") != b"table" or len(header) != 6 or header[0] != 0xDD000000:
        raise ValueError("Unsupported MATLAB table header")
    instance = int(header[4])
    if not 1 <= instance <= 134:
        raise ValueError("Reader is restricted to this dataset's raw/epoch tables")
    refs = f["#subsystem#/MCOS"][()].ravel()
    base = 2 + (instance - 1) * 7
    nrows = int(f[refs[base + 2]][()].item())
    ncols = int(f[refs[base + 4]][()].item())
    colrefs = f[refs[base]][()].ravel()
    namerefs = f[refs[base + 5]][()].ravel()
    names = [text(f[r]) for r in namerefs]
    if names != expected or ncols != len(expected) or len(colrefs) != ncols:
        raise ValueError(f"Unexpected table layout: {names}")
    columns = {name: f[r] for name, r in zip(names, colrefs)}
    if any(ds.shape[-1] != nrows for ds in columns.values()):
        raise ValueError("Column lengths disagree with table row count")
    return columns, nrows


def trial_intervals(f, pupil_cells, ntrials):
    if pupil_cells.shape != (2, ntrials):
        raise ValueError("Expected two pupil cell entries per trial")
    intervals = []
    # The file's storage order differs from the prose documentation: identify
    # timestamps by monotonic integer milliseconds, not by cell position.
    for trial in range(ntrials):
        vectors = [f[r][()].ravel() for r in pupil_cells[:, trial]]
        candidates = [a[np.isfinite(a)] for a in vectors if len(a) == 8000
                      and np.isfinite(a).sum() >= 100
                      and np.all(np.diff(a[np.isfinite(a)]) > 0)
                      and np.allclose(a[np.isfinite(a)], np.round(a[np.isfinite(a)]))
                      and np.median(np.diff(a[np.isfinite(a)])) == 1.0]
        if not candidates and all(np.isfinite(a).sum() < 100 for a in vectors):
            continue
        if len(candidates) != 1:
            raise ValueError(f"Ambiguous timestamp vector in trial {trial + 1}")
        t = candidates[0]
        intervals.append(t)
    if len(intervals) < 80:
        raise ValueError("Too few trial timestamp vectors")
    return intervals


def extract_session(f, index):
    data = f["Pupil_data"]
    scalar = lambda name: float(f[data[name][index, 0]][()].item())
    row = {"session_index": index + 1, "participant_id": int(scalar("Subject")),
           "age": scalar("Age"), "group": text(f[data["Group"][index, 0]])}
    epochs, ntrials = table_columns(f, data["Task_epocs"][index, 0],
                                  ["Trial", "Load", "Distractor", "CorrResponse", "Perform", "Rtime", "Pupil"])
    if ntrials != 160 or not np.array_equal(epochs["Trial"][()].ravel(), np.arange(1, 161)):
        raise ValueError("Unexpected trial count or order")
    perform, rt, load = [epochs[name][()].ravel() for name in ("Perform", "Rtime", "Load")]
    row.update(behavior_features(perform, rt, load))
    intervals = trial_intervals(f, epochs["Pupil"], ntrials)
    raw, nsamples = table_columns(f, data["Task_data"][index, 0], ["Time", "Diameter", "Position", "Events"])
    timestamps = raw["Time"][()].ravel()
    diameter = raw["Diameter"][()].ravel()
    gaze = raw["Position"][()]
    time_rows = np.flatnonzero(np.isfinite(timestamps))
    finite_time = timestamps[time_rows]
    if gaze.shape != (2, nsamples) or np.any(np.diff(finite_time) <= 0):
        raise ValueError("Unexpected gaze dimensions or unordered recording timestamps")
    mask = np.zeros(nsamples, dtype=bool)
    for trial_timestamps in intervals:
        positions = np.searchsorted(finite_time, trial_timestamps)
        if np.any(positions >= len(finite_time)) or not np.array_equal(finite_time[positions], trial_timestamps):
            raise ValueError("Epoch timestamps do not match raw recording")
        mask[time_rows[positions]] = True
    pupil_valid = mask & np.isfinite(diameter) & (diameter > 0)
    gaze_valid = pupil_valid & np.isfinite(gaze).all(axis=0)
    gaze_valid &= (gaze[0] >= 0) & (gaze[0] <= 1920) & (gaze[1] >= 0) & (gaze[1] <= 1080)
    row.update({
        "pupil_iqr_over_median": iqr(diameter[pupil_valid]) / float(np.median(diameter[pupil_valid])),
        "gaze_x_iqr_screen_fraction": iqr(gaze[0, gaze_valid]) / 1920,
        "gaze_y_iqr_screen_fraction": iqr(gaze[1, gaze_valid]) / 1080,
        "n_trials": ntrials,
        "n_trial_windows": len(intervals),
        "n_responded": int(np.isfinite(perform).sum()),
        "n_correct_usable_rt": int(((perform == 1) & (rt >= 100) & (rt <= 1500)).sum()),
        "n_raw_samples": nsamples,
        "n_trial_samples": int(mask.sum()),
        "pupil_valid_fraction": float(pupil_valid.sum() / mask.sum()),
        "gaze_valid_fraction": float(gaze_valid.sum() / mask.sum()),
        "median_sample_interval_ms": float(np.median(np.diff(finite_time))),
    })
    row["quality_pass"] = bool(row["pupil_valid_fraction"] >= .5 and row["gaze_valid_fraction"] >= .5
                               and np.isfinite([row[x] for x in FEATURES]).all())
    return row


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mat", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=Path("data"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    rows, errors = [], []
    with h5py.File(args.mat, "r") as f:
        count = f["Pupil_data/Subject"].shape[0]
        for i in range(count):
            try:
                row = extract_session(f, i)
            except ValueError as exc:
                errors.append({"session_index": i + 1, "error": str(exc)})
                print(f"Failed session {i+1}: {exc}", flush=True)
                continue
            rows.append(row)
            print(f"Extracted {i+1}/{count}: participant {row['participant_id']}, {row['group']}, "
                  f"gaze coverage {row['gaze_valid_fraction']:.1%}", flush=True)
    frame = pd.DataFrame(rows)
    frame.to_csv(args.out / "session_features.csv", index=False)
    with args.mat.open("rb") as source:
        digest = hashlib.file_digest(source, "sha256").hexdigest()
    report = {"source_filename": args.mat.name, "source_sha256": digest, "source_bytes": args.mat.stat().st_size,
              "protocol": PROTOCOL, "schema": SCHEMA, "sessions": len(frame),
              "participants": int(frame.participant_id.nunique()), "groups": frame.group.value_counts().to_dict(),
              "quality_pass_sessions": int(frame.quality_pass.sum()),
              "extraction_errors": errors,
              "feature_missing_counts": frame[FEATURES].isna().sum().to_dict(),
              "reader_scope": "Validated Task_data and Task_epocs; Wisc deliberately excluded",
              "pupil_cell_order": "Finite monotonic integer milliseconds in padded 8000-sample cells; exact timestamp matching preserves gaps"}
    (args.out / "extraction_audit.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)


if __name__ == "__main__":
    main()
