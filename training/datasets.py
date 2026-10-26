"""
Dataset loaders: builds subject-level feature matrices from the two public datasets.

- ADHD : aeye-lab/ecml-ADHD (GitHub) — HBN free-viewing eye tracking, labels in
         Data/sub_info/sub_sel_classif.csv, raw gaze in Data/X_px/*.npy
- ASD  : Cilia et al. 2022 (figshare 10.6084/m9.figshare.20113592) —
         Metadata_Participants.csv + Eye-tracking Output/*.csv
"""

import glob
import os

import numpy as np
import pandas as pd

from features import extract_oculomotor_features

ECML_SCREEN = (800.0, 600.0)
# Cilia stimulus display: observed POR max ~1407x1126 with calibration overshoot
CILIA_SCREEN = (1440.0, 1080.0)

# AOI names in the Cilia dataset that denote a human (face/body/hands)
SOCIAL_AOIS = {
    'corps', 'visage', 'visage1', 'yeux', 'yeux (1)',
    'bouche joie', 'bouche neutre', 'bouche triste',
    'joie droite', 'joie gauche', 'neutre', 'neutre fichier b',
    'triste droite', 'triste gauche',
    'yeux joie', 'yeux neutre', 'yeux triste',
    'coucou', 'mains', 'bouche', 'AOI 001',
}


def _normalize(x, y, screen_w, screen_h):
    nx = np.clip(np.asarray(x, dtype=np.float64) / screen_w, 0.0, 1.0)
    ny = np.clip(np.asarray(y, dtype=np.float64) / screen_h, 0.0, 1.0)
    return nx, ny


# --------------------------------------------------------------------------- #
# ADHD dataset (ECML / HBN)
# --------------------------------------------------------------------------- #
def load_adhd_dataset(ecml_root):
    info = pd.read_csv(
        os.path.join(ecml_root, 'Data', 'sub_info', 'sub_sel_all.csv'),
        sep='\t',
    )
    rows = []
    for _, sub in info.iterrows():
        subject = sub['Patient_ID']
        per_video = []
        for video in ['Diary_of_a_Wimpy_Kid_Trailer', 'Fractals', 'Despicable_Me', 'The_Present']:
            if str(sub.get(f'video_{video}', 'False')) != 'True':
                continue
            path = os.path.join(ecml_root, 'Data', 'X_px', f'X_px_{subject}_Video_{video}.npy')
            if not os.path.exists(path):
                continue
            arr = np.load(path)
            if arr.ndim != 2 or arr.shape[0] < 30:
                continue
            t = arr[:, 1]
            x, y = arr[:, 2], arr[:, 3]
            ok = np.isfinite(t) & np.isfinite(x) & np.isfinite(y)
            t, x, y = t[ok], x[ok], y[ok]
            order = np.argsort(t, kind='stable')
            t, x, y = t[order], x[order], y[order]
            nx, ny = _normalize(x, y, *ECML_SCREEN)
            feats = extract_oculomotor_features(nx, ny, t)
            if feats:
                per_video.append(feats)
        if not per_video:
            continue
        agg = {}
        for key in per_video[0]:
            if key.startswith('_'):
                continue
            agg[key] = float(np.mean([f[key] for f in per_video]))
        rows.append({
            'subject': subject,
            'age': float(sub['Age']),
            'label': int(sub['label']),
            'n_recordings': len(per_video),
            **agg,
        })
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- #
# ASD dataset (Cilia et al., figshare)
# --------------------------------------------------------------------------- #
def load_asd_dataset(asd_root):
    meta = pd.read_csv(os.path.join(asd_root, 'Metadata_Participants.csv'))
    labels = {
        int(r.ParticipantID): (1 if str(r.Class).strip() == 'ASD' else 0)
        for r in meta.itertuples()
    }
    ages = {int(r.ParticipantID): float(r.Age) for r in meta.itertuples()}

    files = sorted(
        glob.glob(os.path.join(asd_root, 'Eye-tracking Output', '*.csv')),
        key=lambda p: int(os.path.splitext(os.path.basename(p))[0]),
    )
    per_subject = {}

    usecols = [
        'Participant', 'RecordingTime [ms]',
        'Point of Regard Right X [px]', 'Point of Regard Right Y [px]',
        'Point of Regard Left X [px]', 'Point of Regard Left Y [px]',
        'AOI Name Right',
    ]
    for path in files:
        try:
            df = pd.read_csv(path, low_memory=False, usecols=usecols)
        except ValueError:
            continue  # file without AOI columns

        df['_pid'] = df['Participant'].astype(str)
        pids = [p for p in df['_pid'].unique() if p.isdigit() and int(p) in labels]
        if not pids:
            continue

        for pid_str in pids:
            pid = int(pid_str)
            sub_df = df[df['_pid'] == pid_str]

            t = pd.to_numeric(sub_df['RecordingTime [ms]'], errors='coerce').to_numpy(dtype=np.float64)
            xr = pd.to_numeric(sub_df['Point of Regard Right X [px]'], errors='coerce').to_numpy()
            yr = pd.to_numeric(sub_df['Point of Regard Right Y [px]'], errors='coerce').to_numpy()
            xl = pd.to_numeric(sub_df['Point of Regard Left X [px]'], errors='coerce').to_numpy()
            yl = pd.to_numeric(sub_df['Point of Regard Left Y [px]'], errors='coerce').to_numpy()

            # fall back to left eye where right eye invalid
            x = np.where(np.isfinite(xr), xr, xl)
            y = np.where(np.isfinite(yr), yr, yl)
            ok = np.isfinite(t) & np.isfinite(x) & np.isfinite(y)
            t, x, y = t[ok], x[ok], y[ok]
            if len(t) < 30:
                continue
            order = np.argsort(t, kind='stable')
            t, x, y = t[order], x[order], y[order]

            nx, ny = _normalize(x, y, *CILIA_SCREEN)
            feats = extract_oculomotor_features(nx, ny, t)
            if not feats:
                continue

            # social attention ratio: dt-weighted time on human AOIs
            aoi = sub_df['AOI Name Right'].astype(str).to_numpy()[ok]
            t_full = pd.to_numeric(sub_df['RecordingTime [ms]'], errors='coerce').to_numpy(dtype=np.float64)
            dt_full = np.clip(np.diff(t_full, prepend=t_full[0]), 0, 500)[ok]
            valid_aoi = aoi != '-'
            total = dt_full[valid_aoi].sum()
            social = dt_full[valid_aoi & np.isin(aoi, list(SOCIAL_AOIS))].sum()
            social_ratio = float(social / total) if total > 0 else np.nan

            per_subject.setdefault(pid, []).append({
                **feats, 'social_attention_ratio': social_ratio,
            })

    rows = []
    for pid, recs in per_subject.items():
        agg = {}
        for key in recs[0]:
            vals = [r[key] for r in recs if np.isfinite(r[key])]
            agg[key] = float(np.mean(vals)) if vals else np.nan
        rows.append({
            'subject': pid,
            'age': ages.get(pid, np.nan),
            'label': labels[pid],
            'n_recordings': len(recs),
            **agg,
        })
    return pd.DataFrame(rows)
