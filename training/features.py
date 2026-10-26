"""
Shared gaze feature extraction — mirrors src/lib/features.js exactly.

IMPORTANT: any change here must be mirrored in src/lib/features.js and the
models must be retrained (python train.py).
"""

import numpy as np

# --- Feature extraction constants (MUST match src/lib/features.js) ---
DISP_THRESH = 0.08        # I-DT dispersion threshold: (x_range + y_range) in normalized units
MIN_FIX_DUR_MS = 100      # minimum fixation duration
MAX_GAP_MS = 500          # gap that splits samples into separate segments
MIN_SACCADE_AMP = 0.03    # normalized amplitude below this = drift, not saccade
MIN_SACCADE_TIME_MS = 20  # floor for saccade velocity computation
PI = 3.141592653589793
E = 2.718281828459045

FEATURE_NAMES_BASE = [
    'age',
    'avg_fix_dur_ms',
    'fix_dur_cv',
    'saccade_freq_hz',
    'mean_saccade_amp',
    'p95_saccade_vel',
    'gaze_dispersion',
    'log_ellipse_area',
    'blink_gap_per_min',
    'fix_loc_entropy',
    'long_fix_frac',
    'vigilance_fix_decay',
    'vigilance_disp_decay',
    'fix_return_frac',
    'sacc_amp_cv',
    'fix_dur_skew',
    'gaze_autocorr',
]
FEATURE_NAME_SOCIAL = 'social_attention_ratio'


def _segments(ts):
    """Split sample indices into contiguous segments where dt <= MAX_GAP_MS."""
    n = len(ts)
    if n == 0:
        return []
    segs = []
    start = 0
    for i in range(1, n):
        dt = ts[i] - ts[i - 1]
        if dt > MAX_GAP_MS or dt <= 0:
            if i - start >= 2:
                segs.append((start, i))
            start = i
    if n - start >= 2:
        segs.append((start, n))
    return segs


def detect_fixations(nx, ny, ts):
    """
    Greedy I-DT on normalized coordinates.
    Returns list of dicts: {cx, cy, t0, t1, i0, i1} (centers, times in ms).
    """
    fixations = []
    for (s, e) in _segments(ts):
        i = s
        while i < e:
            j = i + 1
            min_x = max_x = nx[i]
            min_y = max_y = ny[i]
            while j < e:
                xj, yj = nx[j], ny[j]
                nmin_x = min(min_x, xj); nmax_x = max(max_x, xj)
                nmin_y = min(min_y, yj); nmax_y = max(max_y, yj)
                if (nmax_x - nmin_x) + (nmax_y - nmin_y) > DISP_THRESH:
                    break
                min_x, max_x, min_y, max_y = nmin_x, nmax_x, nmin_y, nmax_y
                j += 1
            # window is samples [i, j-1], maximal dispersion <= threshold
            if ts[j - 1] - ts[i] >= MIN_FIX_DUR_MS:
                fixations.append({
                    'cx': float(np.mean(nx[i:j])),
                    'cy': float(np.mean(ny[i:j])),
                    't0': float(ts[i]),
                    't1': float(ts[j - 1]),
                    'i0': i,
                    'i1': j - 1,
                })
            i = j
    return fixations


def extract_oculomotor_features(nx, ny, ts):
    """
    nx, ny: normalized coordinates in [0,1]; ts: timestamps in ms (sorted, valid).
    Returns dict of base features (no age, no social ratio) or None if too little data.
    """
    n = len(ts)
    if n < 30:
        return None
    span = ts[-1] - ts[0]
    if span < 9000:
        return None

    fixations = detect_fixations(nx, ny, ts)

    # Fixation durations
    durs = np.array([f['t1'] - f['t0'] for f in fixations], dtype=np.float64)
    if len(durs) > 0:
        avg_fix_dur = float(np.mean(durs))
        fix_dur_cv = float(np.std(durs) / avg_fix_dur) if avg_fix_dur > 0 else 0.0
    else:
        avg_fix_dur = 0.0
        fix_dur_cv = 0.0

    # Saccades: transitions between consecutive fixations
    amps = []
    vels = []
    for k in range(len(fixations) - 1):
        a, b = fixations[k], fixations[k + 1]
        gap = b['t0'] - a['t1']
        if gap > MAX_GAP_MS or gap < 0:
            continue
        amp = float(np.hypot(b['cx'] - a['cx'], b['cy'] - a['cy']))
        if amp < MIN_SACCADE_AMP:
            continue
        dt_s = max(gap, MIN_SACCADE_TIME_MS) / 1000.0
        amps.append(amp)
        vels.append(amp / dt_s)

    total_s = span / 1000.0
    saccade_freq = len(amps) / total_s if total_s > 0 else 0.0
    mean_amp = float(np.mean(amps)) if amps else 0.0
    p95_vel = float(np.percentile(vels, 95)) if vels else 0.0

    # Gaze dispersion
    x = np.asarray(nx, dtype=np.float64)
    y = np.asarray(ny, dtype=np.float64)
    gaze_dispersion = float(np.sqrt(np.var(x) + np.var(y)))

    # Blink/tracker-loss gap rate: gaps between 100 and 500 ms, per minute
    dts = np.diff(ts)
    n_gaps = int(np.sum((dts >= 100) & (dts < MAX_GAP_MS)))
    blink_gap_per_min = float(n_gaps / (total_s / 60.0)) if total_s > 0 else 0.0

    # Fixation location entropy on a 4x4 grid (normalized to [0,1])
    if fixations:
        gx = np.minimum((np.array([f['cx'] for f in fixations]) * 4).astype(int), 3)
        gy = np.minimum((np.array([f['cy'] for f in fixations]) * 4).astype(int), 3)
        grid = gx * 4 + gy
        counts = np.bincount(grid, minlength=16).astype(np.float64)
        p = counts[counts > 0] / counts.sum()
        fix_loc_entropy = float(-(p * np.log(p)).sum() / np.log(16))
    else:
        fix_loc_entropy = 0.0

    # Long fixation fraction (>= 600 ms)
    long_fix_frac = float(np.mean(durs >= 600)) if len(durs) else 0.0

    # Vigilance decrement: second half vs first half of the recording
    mid = ts[0] + span / 2.0
    half1 = [f for f in fixations if (f['t0'] + f['t1']) / 2.0 <= mid]
    half2 = [f for f in fixations if (f['t0'] + f['t1']) / 2.0 > mid]
    if half1 and half2:
        d1 = np.mean([f['t1'] - f['t0'] for f in half1])
        d2 = np.mean([f['t1'] - f['t0'] for f in half2])
        vigilance_fix_decay = float((d2 - d1) / max(d1, 1.0))
        disp1 = float(np.sqrt(np.var(nx[: np.searchsorted(ts, mid)]) +
                              np.var(ny[: np.searchsorted(ts, mid)])))
        disp2 = float(np.sqrt(np.var(nx[np.searchsorted(ts, mid):]) +
                              np.var(ny[np.searchsorted(ts, mid):])))
        vigilance_disp_decay = float(disp2 - disp1)
    else:
        vigilance_fix_decay = float('nan')
        vigilance_disp_decay = float('nan')

    # Fixation revisiting fraction: returns to within 0.03 of an earlier location
    fix_return_frac = 0.0
    if len(fixations) > 2:
        prev = []
        returns = 0
        for f in fixations:
            if prev:
                d = np.hypot(np.array([p['cx'] for p in prev]) - f['cx'],
                             np.array([p['cy'] for p in prev]) - f['cy'])
                if np.any(d < 0.03):
                    returns += 1
            prev.append(f)
        fix_return_frac = returns / (len(fixations) - 1)

    # Saccade amplitude variability (coefficient of variation)
    if len(amps) >= 2:
        mean_amp_all = float(np.mean(amps))
        sacc_amp_cv = float(np.std(amps) / mean_amp_all) if mean_amp_all > 0 else 0.0
    else:
        sacc_amp_cv = 0.0

    # Fixation duration skewness (population standardized 3rd moment)
    if len(durs) >= 3:
        md = float(np.mean(durs))
        sd = float(np.std(durs))
        fix_dur_skew = float(np.mean((durs - md) ** 3) / (sd ** 3 + 1e-9)) if sd > 0 else 0.0
    else:
        fix_dur_skew = 0.0

    # Lag-1 autocorrelation of gaze position (path smoothness)
    def _lag1_corr(a):
        if len(a) < 3:
            return 0.0
        u, v = a[:-1], a[1:]
        du, dv = u - u.mean(), v - v.mean()
        denom = float(np.sqrt(np.mean(du * du) * np.mean(dv * dv)))
        if denom < 1e-12:
            return 0.0
        return float(np.mean(du * dv) / denom)

    gaze_autocorr = (_lag1_corr(x) + _lag1_corr(y)) / 2.0

    # Log ellipse area (2x2 covariance eigenvalues product)
    if n > 1:
        cov_xx = float(np.var(x))
        cov_yy = float(np.var(y))
        cov_xy = float(np.mean((x - x.mean()) * (y - y.mean())))
        tr = cov_xx + cov_yy
        det = cov_xx * cov_yy - cov_xy * cov_xy
        disc = max(tr * tr / 4.0 - det, 0.0)
        l1 = tr / 2.0 + np.sqrt(disc)
        l2 = tr / 2.0 - np.sqrt(disc)
        ellipse = PI * 1.5 * np.sqrt(max(l1, 0.0) * max(l2, 0.0))
        log_ellipse = float(np.log(ellipse + 1e-9))
    else:
        log_ellipse = float(np.log(1e-9))

    return {
        'avg_fix_dur_ms': avg_fix_dur,
        'fix_dur_cv': fix_dur_cv,
        'saccade_freq_hz': float(saccade_freq),
        'mean_saccade_amp': mean_amp,
        'p95_saccade_vel': p95_vel,
        'gaze_dispersion': gaze_dispersion,
        'log_ellipse_area': log_ellipse,
        'blink_gap_per_min': blink_gap_per_min,
        'fix_loc_entropy': fix_loc_entropy,
        'long_fix_frac': long_fix_frac,
        'vigilance_fix_decay': vigilance_fix_decay,
        'vigilance_disp_decay': vigilance_disp_decay,
        'fix_return_frac': fix_return_frac,
        'sacc_amp_cv': sacc_amp_cv,
        'fix_dur_skew': fix_dur_skew,
        'gaze_autocorr': gaze_autocorr,
        '_n_fixations': len(fixations),
        '_n_saccades': len(amps),
        '_n_samples': n,
        '_span_ms': span,
    }


def build_feature_vector(features, age, social_ratio, feature_names):
    """Assemble numeric vector in the model's feature order. NaN for missing."""
    vec = []
    for name in feature_names:
        if name == 'age':
            vec.append(float(age))
        elif name == FEATURE_NAME_SOCIAL:
            v = social_ratio
            vec.append(float(v) if v is not None and not np.isnan(v) else float('nan'))
        else:
            v = features.get(name) if features else None
            vec.append(float(v) if v is not None else float('nan'))
    return vec
