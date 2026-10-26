# GazeScreen · Digital Biomarker Screening & Research Model

> **A privacy-first, fully on-device ADHD & ASD digital biomarker screening tool, paired with a validated laboratory research classifier trained on real EyeLink 1000 pupillometry and eye-tracking data.**

---

## ⚡ TL;DR

- **What is it?** A browser-based digital biomarker screening tool for pediatric and adult ADHD/ASD attention patterns that runs **100% on-device** (zero video leaves the user's computer).
- **Dual Architecture:**
  1. **Webcam Screening Engine:** Captures 17 natural viewing oculomotor features (fixation duration variability, saccadic exploration, spatial dispersion, time-on-task vigilance drift) via MediaPipe face mesh during a 60-second video stimulus.
  2. **Laboratory Research Model:** Pre-trained on 47 children (ages 8–13) performing a visuo-spatial working memory task with EyeLink 1000 infrared pupillometry (5-fold held-out CV, AUC 0.821).
- **Research Links:**
  - 📖 **Article:** [Nature Scientific Data (2019)](https://www.nature.com/articles/s41597-019-0037-2)
  - 📄 **Reference PDF:** [Open-Access Article PDF](https://www.nature.com/articles/s41597-019-0037-2.pdf)
  - 📦 **Dataset:** [Figshare ADHD Pupil Size Dataset](https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953)
- **Clinical Status:** Screening aid and triage tool only; not an FDA-cleared diagnostic device.

---

## Table of Contents

1. [What is GazeScreen?](#1-what-is-gazescreen)
2. [How ADHD Detection Works](#2-how-adhd-detection-works)
3. [Dataset Used for Training](#3-dataset-used-for-training)
4. [What the Dataset Contains](#4-what-the-dataset-contains)
5. [All Parameters & Features Explained](#5-all-parameters--features-explained)
6. [How the Data is Analysed — Step by Step](#6-how-the-data-is-analysed--step-by-step)
7. [Training Flow & Algorithm](#7-training-flow--algorithm)
8. [Validation Results](#8-validation-results)
9. [Repository Structure](#9-repository-structure)
10. [Application Flow — Page by Page](#10-application-flow--page-by-page)
    - [Device Compatibility & Mobile Responsiveness](#10b-device-compatibility--mobile-responsiveness)
11. [Quick Start](#11-quick-start)
12. [Python Server & Retraining](#12-python-server--retraining)
13. [Scientific Limitations](#13-scientific-limitations)

---

## 1. What is GazeScreen?

GazeScreen is a web application that uses a **front-facing camera + trained machine learning models** to measure involuntary eye movement patterns and flag potential digital biomarker indicators of ADHD and ASD in children, adolescents, and adults.

It runs **two independent detection systems**:

| System | Where | Input | Method | Supported Demographics |
|---|---|---|---|---|
| **Webcam Screening** | Browser (fully on-device, 0 network calls) | Live camera + MediaPipe Iris tracking | 17 natural viewing oculomotor features + age-stratified normative Z-scoring | **All ages supported:** Infant (<2y), Preschool (2–6y), School-Age (7–12y), Teen (13–17y), and Adult (18+) |
| **Research Classifier** | Browser bundle & local Python server | Figshare lab EyeLink 1000 dataset | 8 features from visuo-spatial WM task (pupil dilation IQR + gaze dispersion + RT variability) | **Strictly pediatric benchmark:** 47 children aged 8.0–12.9 years (held-out 5-fold CV) |

> Zero video or biometric data ever leaves the device during a screening session. Pure on-device computation.

---

## 2. How ADHD Detection Works

### The Core Idea

ADHD is not visible in any single measurement. It shows up as a **pattern** — specifically, a pattern of **attention breaking down under cognitive load**. GazeScreen measures that breakdown through eye movements, reaction times, and gaze stability.

There are **two completely separate detection engines** depending on where you run the app:

---

### 2A. Webcam Screening (Browser — `/stimulus` → `/report`)

The child watches a 60-second video stimulus on screen. The webcam tracks their eyes continuously using MediaPipe. No memory task is involved.

**What is being measured:**

```
The eyes tell us a lot about the brain's attention state.
ADHD eyes behave differently — they jump more, settle less,
drift faster, and tire quicker than neurotypical eyes.
```

The system extracts **17 oculomotor features** from the raw gaze stream:

#### Group A — Fixation Behaviour (how long eyes stay still)

| Parameter | What it is | ADHD vs Typical |
|---|---|---|
| `avg_fix_dur_ms` | Average duration of a stable fixation | **Shorter** — ADHD eyes don't settle as long |
| `fix_dur_cv` | Coefficient of variation of fixation durations | **Higher** — fixation length is erratic |
| `long_fix_frac` | Fraction of fixations lasting ≥ 600 ms | **Lower** — rarely holds gaze deeply |
| `fix_dur_skew` | Skewness of fixation duration distribution | **Higher** — skewed toward many short, few long |

#### Group B — Saccade Behaviour (how eyes jump between points)

| Parameter | What it is | ADHD vs Typical |
|---|---|---|
| `saccade_freq_hz` | Number of eye jumps per second | **Higher** — more frequent jumping |
| `mean_saccade_amp` | Average size of each eye jump (normalized) | **Larger** — bigger, more exploratory jumps |
| `p95_saccade_vel` | 95th percentile saccade velocity | **Higher** — faster jumps at the extreme |
| `sacc_amp_cv` | Coefficient of variation of jump sizes | **Higher** — inconsistent, unpredictable jumps |

#### Group C — Spatial Gaze Distribution (where eyes land)

| Parameter | What it is | ADHD vs Typical |
|---|---|---|
| `gaze_dispersion` | Overall spread of gaze across the screen | **Wider** — gaze scatters broadly |
| `log_ellipse_area` | Log area of the gaze covariance ellipse | **Larger** — larger spatial coverage |
| `fix_loc_entropy` | Entropy of fixation locations on a 4×4 grid | **Higher** — gaze spread randomly, not focused |
| `fix_return_frac` | Fraction of fixations revisiting past locations | **Lower** — less structured scanpath |

#### Group D — Vigilance Decay (does attention collapse over time?)

| Parameter | What it is | ADHD vs Typical |
|---|---|---|
| `vigilance_fix_decay` | Change in avg fixation duration: 2nd half vs 1st half | **More negative** — fixations shorten as attention fades |
| `vigilance_disp_decay` | Change in gaze dispersion: 2nd half vs 1st half | **More positive** — gaze wanders more in 2nd half |

#### Group E — Blink & Path Dynamics

| Parameter | What it is | ADHD vs Typical |
|---|---|---|
| `blink_gap_per_min` | Gaze gaps 100–500 ms per minute (blink proxy) | Variable |
| `gaze_autocorr` | Lag-1 autocorrelation of gaze path (smoothness) | **Lower** — jerkier path |
| `age` | Child's age in years | Used to calibrate normative thresholds |

**How the score is computed (Webcam path):**

```
Step 1: Raw gaze points → I-DT fixation detection algorithm
Step 2: Extract all 17 features from the fixation/saccade stream
Step 3: Run pre-trained HBN Logistic Regression (1,246 subjects)
        logit = intercept + Σ(coeff[i] × scaled_feature[i])
        probability = sigmoid(logit)
Step 4: Compute 4 oculomotor Z-scores vs age-matched norms:
        - Fixation Instability Z  (weight 30%)
        - Saccade Frequency Z     (weight 25%)
        - Gaze Dispersion Z       (weight 25%)
        - Vigilance Decay Z       (weight 15%)
        - Blink Dynamics Z        (weight  5%)
Step 5: Final ADHD score = 55% × model probability + 45% × oculomotor Z composite
Step 6: ASD score = social attention ratio Z (social scenes vs geometric patterns)
```

#### How Adult vs. Pediatric Screening Works

A common question is: *If the EyeLink 1000 dataset only has children up to 12.9 years, how does GazeScreen identify ADHD in adults?*

1. **The EyeLink dataset (47 subjects) is strictly a laboratory benchmark** and is only displayed in the `/research` tab. It is **never** used to classify adult webcam users.
2. **The Webcam Screener is trained on the 1,246-subject HBN dataset (Deng et al. 2022)**, which spans from childhood through young adulthood (ages 5–21+).
3. **5 Age-Stratified Developmental Cohorts:** As the human brain matures, typical adult fixation duration increases from ~280 ms (preschool) to ~340 ms (adult), fixation duration variability (CV) decreases from 0.62 to 0.55, and spontaneous blink rate increases from 14 to 20 blinks/min. Adults (18+) are evaluated strictly against **Adult normative baselines**, measuring adult visual restlessness ($Z_{\text{FixCV}} > +1.5$, scanpath scatter, and second-half vigilance decay), with clinical triage recommendations aligned to **ASRS v1.1** and **DIVA-5** clinical interview standards.

**Pre-trained model weights (HBN ADHD Logistic Regression):**

```
Feature              Coefficient   Direction
────────────────────────────────────────────
age                  -0.220546     ← older = lower ADHD probability
avg_fix_dur_ms       -0.006213     ← longer fixations = lower
fix_dur_cv           -0.024327     ← higher CV = lower (counterintuitive — suppressed)
saccade_freq_hz      +0.000982     ← more saccades = higher
mean_saccade_amp     -0.436350     ← larger jumps = lower
p95_saccade_vel      +0.125732     ← faster top velocity = higher
gaze_dispersion      +0.596833     ← wider scatter = higher (strongest feature)
log_ellipse_area     -0.313414     ← larger ellipse = lower
blink_gap_per_min     0.000000     ← zeroed out (suppressed)
fix_loc_entropy      +0.131317     ← more random locations = higher
long_fix_frac         0.000000     ← zeroed out (suppressed)
vigilance_fix_decay  +0.089204     ← decay in fixation = higher
vigilance_disp_decay +0.038810     ← increasing dispersion = higher
fix_return_frac      +0.085197     ← more revisits = higher
sacc_amp_cv          -0.018065     ← inconsistent amplitudes = slightly lower
fix_dur_skew         -0.086891     ← skewed duration distribution = lower
gaze_autocorr        +0.053923     ← smoother path = slightly higher
intercept            +0.354520
```

---

### 2B. Research Classifier (Python Server — `/research` page)

This uses a **completely different feature set** — behavioural task performance + pupil + gaze — extracted from the Figshare EyeLink laboratory dataset.

**What is being measured:**

A child performs a **160-trial visuo-spatial working memory task** on a computer. The EyeLink 1000 records their eye movements at 1,000 Hz. The system measures how their brain copes with increasing cognitive load.

```
Trial structure:
  [Memory item shown] → [Retention with distractor] → [Test probe] → [Response button]
  Load=1: remember 1 item    Load=2: remember 2 items (harder)
```

**The 8 features and their ADHD logic:**

#### Behavioural Features (5 features — PRIMARY signal)

| # | Feature | What it measures | ADHD Pattern | Why |
|---|---|---|---|---|
| 1 | `accuracy_responded` | % correct on trials where a response was made | **Lower** | Inattention causes more errors |
| 2 | `omission_fraction` | % trials with NO response at all | **Higher** | Impulsivity / attention lapses → missing responses |
| 3 | `median_correct_rt_ms` | Median reaction time on correct trials (100–1500ms) | **Longer** | Slower processing speed |
| 4 | `iqr_correct_rt_ms` | RT interquartile range (variability) | **Much Higher** ← **#1 ADHD signal** | Inconsistent attention = wildly variable speed |
| 5 | `high_load_accuracy_cost` | Accuracy at Load=1 minus accuracy at Load=2 | **Higher cost** | ADHD working memory capacity is more easily overwhelmed |

> **Key insight on RT variability:** A neurotypical child is consistently quick. An ADHD child answers fast sometimes (300ms) and extremely slow other times (1300ms). That `iqr_correct_rt_ms` gap is the clearest biological marker of attention dysregulation in the dataset.

#### Pupil Feature (1 feature — SUPPORTING signal)

| # | Feature | What it measures | ADHD Pattern | Why |
|---|---|---|---|---|
| 6 | `pupil_iqr_over_median` | Pupil diameter IQR ÷ median within trial windows | **Higher** | ADHD children show erratic arousal — pupil fluctuates instead of smoothly dilating with load |

> **Why pupil matters:** The pupil is controlled by the locus coeruleus–norepinephrine (LC-NE) system. A healthy brain shows clean pupil dilation as working memory load increases. ADHD brains have dysregulated LC-NE activity → noisier, more variable pupil traces.

> **What pupil is NOT:** Pupil data alone is a weak discriminator. The behaviour features (RT variability, omissions, load cost) carry far more signal. Without pupil, the model still reaches AUC 0.705.

#### Gaze Dispersion Features (2 features — SUPPORTING signal)

| # | Feature | What it measures | ADHD Pattern | Why |
|---|---|---|---|---|
| 7 | `gaze_x_iqr_screen_fraction` | Horizontal gaze spread (IQR of x ÷ 1920) | **Higher** | Eyes drift left/right instead of staying on task region |
| 8 | `gaze_y_iqr_screen_fraction` | Vertical gaze spread (IQR of y ÷ 1080) | **Higher** | Eyes drift up/down during retention interval |

**Signal contribution breakdown:**

```
Behaviour only (5 features, no pupil, no gaze):    AUC = 0.705
+ Pupil + Gaze (all 8 features):                   AUC = 0.821
                                                   ─────────────
Pupil + Gaze combined contribution:                +0.116 AUC
```

**The detection logic:**

```
All 8 features → Median Imputer → StandardScaler → Logistic Regression
                                                          ↓
                              score = sigmoid(w·x + b)  → 0.0 to 1.0
                                                          ↓
                                          ≥ 0.5  →  ADHD flagged
                                          < 0.5  →  Control
```

---

## 3. Dataset Used for Training

### Figshare ADHD Pupil Size Dataset

| Property | Value |
|---|---|
| **Title** | A pupil size, eye-tracking and neuropsychological dataset from ADHD children during a cognitive task |
| **Authors** | Daniel Rojas-Líbano, Gabriel Wainstein, Tomás Ossandón et al. |
| **Journal** | *Scientific Data*, Nature Publishing Group, 2019 |
| **Article** | [Nature Scientific Data (2019)](https://www.nature.com/articles/s41597-019-0037-2) |
| **Reference PDF** | [Open-Access Article PDF](https://www.nature.com/articles/s41597-019-0037-2.pdf) |
| **Dataset** | [Figshare ADHD Pupil Size Dataset](https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953) |
| **DOI (dataset)** | [10.6084/m9.figshare.7218725](https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953) |
| **DOI (paper)** | [10.1038/s41597-019-0037-2](https://doi.org/10.1038/s41597-019-0037-2) |
| **License** | CC BY 4.0 (open access) |
| **File** | `Pupil_dataset.mat` (MATLAB v7.3 / HDF5 format, ~1.26 GB, File ID: 14298953) |
| **SHA-256** | `44aa997e37815e7d2a003a4fc4e967f69438a86bdf04650b02f37aaa2a81819b` |
| **Eye Tracker** | EyeLink 1000 (infrared corneal reflection) |
| **Sample Rate** | **1,000 Hz** (one measurement every 1 ms) |
| **Screen Resolution** | 1920 × 1080 px |
| **Task** | Visuo-spatial working memory (Sternberg-type) task |
| **Total subjects** | 50 children |
| **Age range** | 8–13 years |

---

## 4. What the Dataset Contains

The `.mat` file is a MATLAB object array (`Pupil_data`) with one entry per recording session. Each session has three data structures:

### Subject Metadata

```
Pupil_data[i]
  ├── Subject      → integer participant ID (1–50)
  ├── Age          → float, years at time of test
  └── Group        → string label:
                      'Ctrl'     = neurotypical control
                      'off-ADHD' = ADHD child, NOT on medication  ← used for training
                      'on-ADHD'  = ADHD child, ON methylphenidate ← EXCLUDED from training
```

**Group counts:**
```
off-ADHD  →  28 sessions   (training target: ADHD=1)
Ctrl      →  22 sessions   (training target: ADHD=0)
on-ADHD   →  17 sessions   (excluded — medication normalises pupil & RT)
```

### Raw Time-Series (`Task_data`) — recorded at 1,000 Hz

```
Column       Unit          Description
─────────────────────────────────────────────────────
Time         ms            Monotonic integer timestamps (1 ms steps)
Diameter     a.u.          Raw pupil diameter from infrared reflection
Position     px (x, y)     Gaze coordinates on 1920×1080 screen
Events       marker        Stimulus onset/offset and response event tags
```

### Trial Epoch Data (`Task_epocs`) — 160 trials per session

```
Column         Description
──────────────────────────────────────────────────────────────────
Trial          Trial index 1–160
Load           Working memory load: 1 (easy, 1 item) or 2 (hard, 2 items)
Distractor     Type of distractor during retention interval
CorrResponse   The correct button to press
Perform        1 = correct, 0 = incorrect, NaN = omitted (no response)
Rtime          Reaction time in ms (NaN for omissions)
Pupil          Cell: 8,000-sample (8s @ 1kHz) timestamp window per trial
```

### Quality Filtering

Three participants were excluded for having < 50% usable samples:

| Participant | Group | Gaze valid | Pupil valid | Reason |
|---|---|---|---|---|
| #1 | off-ADHD | 36.6% | 95.8% | Gaze below threshold |
| #13 | off-ADHD | 0.0% | 81.5% | No valid gaze at all |
| #49 | Ctrl | 0.0% | 95.0% | No valid gaze at all |

**Final training cohort: 47 participants (26 ADHD, 21 Control)**

---

## 5. All Parameters & Features Explained

### Research Model — 8 Features

| # | Feature name | Type | Formula / Source | Normal range |
|---|---|---|---|---|
| 1 | `accuracy_responded` | Behavioural | Mean `Perform` on trials with finite response | 0–1 |
| 2 | `omission_fraction` | Behavioural | Fraction of 160 trials where `Rtime` is NaN | 0–1 |
| 3 | `median_correct_rt_ms` | Behavioural | Median `Rtime` on trials with `Perform=1`, 100≤RT≤1500 ms | 100–1500 ms |
| 4 | `iqr_correct_rt_ms` | Behavioural | 75th − 25th percentile of correct-trial RTs | 0–1400 ms |
| 5 | `high_load_accuracy_cost` | Behavioural | Accuracy(Load=1) − Accuracy(Load=2) | −1 to +1 |
| 6 | `pupil_iqr_over_median` | Pupil | IQR(diameter) ÷ median(diameter) within trial windows | 0+ |
| 7 | `gaze_x_iqr_screen_fraction` | Gaze | IQR(gaze_x) ÷ 1920, on valid trial samples | 0–1 |
| 8 | `gaze_y_iqr_screen_fraction` | Gaze | IQR(gaze_y) ÷ 1080, on valid trial samples | 0–1 |

### Webcam Model — 17 Features

| # | Feature name | Algorithm | Unit |
|---|---|---|---|
| 1 | `age` | Input from user | years |
| 2 | `avg_fix_dur_ms` | I-DT fixation detector | ms |
| 3 | `fix_dur_cv` | std(durations) / mean(durations) | ratio |
| 4 | `saccade_freq_hz` | saccade count / total seconds | Hz |
| 5 | `mean_saccade_amp` | mean Euclidean distance between fixation centres | normalized |
| 6 | `p95_saccade_vel` | 95th percentile of amplitude / gap_time | normalized/s |
| 7 | `gaze_dispersion` | √(Var(x) + Var(y)) | normalized |
| 8 | `log_ellipse_area` | log(π × 1.5 × √(λ₁λ₂)), covariance eigenvalues | log-normalized |
| 9 | `blink_gap_per_min` | gaps where 100ms ≤ Δt < 500ms, per minute | per min |
| 10 | `fix_loc_entropy` | Shannon entropy of fixation locations on 4×4 grid / log(16) | 0–1 |
| 11 | `long_fix_frac` | fraction of fixations ≥ 600ms | 0–1 |
| 12 | `vigilance_fix_decay` | (mean_dur_2nd_half − mean_dur_1st_half) / mean_dur_1st_half | ratio |
| 13 | `vigilance_disp_decay` | dispersion_2nd_half − dispersion_1st_half | normalized |
| 14 | `fix_return_frac` | fraction of fixations within 0.05 of a prior fixation | 0–1 |
| 15 | `sacc_amp_cv` | std(amplitudes) / mean(amplitudes) | ratio |
| 16 | `fix_dur_skew` | 3rd standardised moment of fixation durations | dimensionless |
| 17 | `gaze_autocorr` | mean lag-1 autocorrelation of x and y gaze series | −1 to +1 |

---

## 6. How the Data is Analysed — Step by Step

### Webcam Screening Analysis Pipeline

```
[Webcam Feed]
     │
     ▼  MediaPipe FaceMesh (browser, real-time)
[Raw gaze points: {x, y, timestamp}]  +  [Blink events]
     │
     ▼  Coordinate normalization (pixel → 0–1 range)
[Normalized gaze stream: nx[], ny[], ts[]]
     │
     ├──► I-DT Fixation Detection
     │      dispersion threshold = 0.08 (normalized units)
     │      min fixation duration = 100 ms
     │      max gap (segment break) = 500 ms
     │      → fixations[]: {cx, cy, t0, t1, duration}
     │
     ├──► Saccade Extraction
     │      for each consecutive fixation pair:
     │        amplitude = hypot(Δcx, Δcy)
     │        gap = next.t0 − prev.t1
     │        velocity = amplitude / max(gap, 20ms)
     │      filter: amplitude ≥ 0.03 (removes micro-drift)
     │
     ├──► Spatial Features
     │      dispersion = √(Var(nx) + Var(ny))
     │      ellipse area from 2×2 gaze covariance matrix eigenvalues
     │      entropy from 4×4 fixation location grid
     │
     ├──► Vigilance Decay
     │      split recording at midpoint timestamp
     │      compare fixation duration & dispersion: 1st half vs 2nd half
     │
     ├──► Autocorrelation
     │      lag-1 Pearson correlation of consecutive gaze positions
     │
     ▼
[17-feature vector]
     │
     ├──► HBN Logistic Regression (pre-trained, embedded in classifier.js)
     │      normalize: scaled = (val − offset) × scale
     │      clamp: max(−3.5, min(3.5, scaled))
     │      logit = intercept + Σ(coeff × scaled_feature)
     │      probability = 1 / (1 + e^−logit)
     │
     ├──► 5-Component Oculomotor Z-score
     │      each feature Z-scored against age-matched norms
     │      weighted composite: instability(30%) + saccades(25%)
     │                         + dispersion(25%) + vigilance(15%) + blink(5%)
     │
     ▼
[ADHD Score = 55% × model probability×100 + 45% × (50 + Z×18)]
[ASD Score  = social attention ratio Z-score]
     │
     ▼  /report page
[Clinical Summary Report]
```

### Research Classifier Analysis Pipeline

```
[Pupil_dataset.mat]
     │
     ▼  extract.py  (reads HDF5 via h5py)
[For each of 67 sessions]:
     ├── Parse Task_epocs (160 trials):
     │     perform[], rtime[], load[]  →  5 behavioral features
     ├── Identify trial timestamp windows from Pupil cell arrays
     ├── Parse Task_data (1kHz continuous stream):
     │     Diameter[] within trial windows  →  pupil_iqr_over_median
     │     Position[x,y] within valid windows →  gaze_x/y_iqr_screen_fraction
     └── Quality gate: pupil_valid ≥ 50% AND gaze_valid ≥ 50%
     │
     ▼  session_features.csv  (47 rows × 8 features + metadata)
     │
     ▼  train.py
     ├── Filter: off-ADHD + Ctrl only (exclude on-ADHD)
     ├── Stratified 5-Fold Cross-Validation (participant-level):
     │     For each fold:
     │       SimpleImputer(median)  ← fit on training fold only
     │       StandardScaler         ← fit on training fold only
     │       LogisticRegression(C=0.1, class_weight='balanced', solver='liblinear')
     │       → out-of-fold predictions stored
     ├── Metrics: accuracy, sensitivity, specificity, ROC-AUC, confusion matrix
     ├── Bootstrap 95% CI (2,000 resamples)
     ├── Permutation test (199 label shuffles) → p-value
     ├── Full model refit on all 47 participants
     └── Export: research_model.joblib, fold_1..5.joblib,
                 evaluation.json, demo_records.json, research-v1.json
```

---

## 7. Training Flow & Algorithm

```
┌──────────────────────────────────────────────────────────────┐
│           FIGSHARE DATASET  (Pupil_dataset.mat)              │
│   50 children · EyeLink 1000 · 1,000 Hz · 8–13 years        │
│   160-trial working memory task · CC BY 4.0                  │
└────────────────────────┬─────────────────────────────────────┘
                         │  extract.py
                         ▼
              ┌─────────────────────┐
              │   Quality Filter     │
              │  ≥50% pupil valid   │
              │  ≥50% gaze valid    │
              │  Exclude on-ADHD    │
              │  → 47 participants  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   8 Features        │
              │  5 behavioural      │
              │  1 pupil            │
              │  2 gaze dispersion  │
              └──────────┬──────────┘
                         │  train.py
                         ▼
         ┌───────────────────────────────┐
         │  Stratified 5-Fold CV         │
         │  (participant-level, no leak) │
         │                               │
         │  Each fold pipeline:          │
         │  SimpleImputer (median)       │
         │       ↓                       │
         │  StandardScaler               │
         │       ↓                       │
         │  LogisticRegression           │
         │  C=0.1, balanced weights      │
         └──────────────┬────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Evaluation                  │
         │  ROC-AUC     = 0.821         │
         │  Accuracy    = 72.3%         │
         │  Sensitivity = 57.7%         │
         │  Specificity = 90.5%         │
         │  Permutation p = 0.005       │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Full Refit (all 47)         │
         │  → research_model.joblib     │
         │  → fold_1..5.joblib          │
         │  → research-v1.json          │
         │  → evaluation.json           │
         └──────────────────────────────┘
```

**Competing models evaluated (comparison only — not used for selection):**

| Model | AUC | Sensitivity | Specificity |
|---|---|---|---|
| Majority baseline (always predict ADHD) | 0.500 | 100% | 0% |
| Logistic — behaviour only (5 features) | 0.705 | 53.8% | 85.7% |
| **Logistic — combined (8 features) ← PRIMARY** | **0.821** | **57.7%** | **90.5%** |
| Random Forest (comparison, not delivered) | 0.800 | 76.9% | 85.7% |

> The primary model was **pre-specified before evaluation** — no post-hoc model selection was performed.

---

## 8. Validation Results

### Cross-Validation Metrics (5-fold, participant-level)

| Metric | Value |
|---|---|
| Accuracy | 72.3% (34/47 correct) |
| Balanced accuracy | 74.1% |
| Sensitivity (ADHD recall) | 57.7% — correctly identified 15 of 26 ADHD children |
| Specificity (control recall) | 90.5% — correctly cleared 19 of 21 controls |
| ROC-AUC | **0.821** |
| False negatives (missed ADHD) | 11 children flagged as control |
| False positives (false alarms) | 2 controls flagged as ADHD |

### Bootstrap 95% Confidence Intervals

```
Accuracy:          59.6% – 83.0%
Balanced accuracy: 62.5% – 84.6%
Sensitivity:       38.5% – 76.9%
Specificity:       76.2% – 100%
ROC-AUC:           0.692 – 0.932
```

### Permutation Test
**p = 0.005** (199 random label shuffles) — the model's signal is statistically significant and not due to chance.

---

## 9. Repository Structure

```
GazeScreen/
│
├── README.md                        ← This file
├── Pupil_dataset.mat                ← Training data (git-ignored, ~1.26 GB)
├── package.json                     ← Node.js scripts & dependencies
├── vite.config.js                   ← Vite build config
├── index.html                       ← App entry point
│
├── public/
│   ├── models/
│   │   ├── adhd.onnx                ← Pre-trained ONNX (HBN free-viewing, 1246 subjects)
│   │   ├── asd.onnx                 ← Pre-trained ONNX (Cilia ASD dataset, 56 subjects)
│   │   ├── model_meta.json          ← ONNX model metadata & CV results
│   │   └── research-v1.json         ← Research classifier bundle (47 subjects, Figshare)
│   └── audio/
│       └── adhd_focus.mp3           ← Stimulus soundtrack
│
├── src/
│   ├── lib/
│   │   ├── classifier.js            ← 17-feature oculomotor extraction + HBN LR inference
│   │   ├── researchModel.js         ← Research model frontend integration
│   │   ├── cameraMeasurements.js    ← MediaPipe gaze/blink capture
│   │   ├── stimulus.js              ← Stimulus sequence controller
│   │   └── soundEngine.js          ← Audio playback
│   ├── pages/
│   │   ├── LandingPage.jsx          ← Home page
│   │   ├── ConsentPage.jsx          ← Parental consent + age input
│   │   ├── CalibrationPage.jsx      ← Camera setup + face alignment
│   │   ├── StimulusPage.jsx         ← 60s visual stimulus + gaze capture
│   │   ├── AnalysisPage.jsx         ← Feature extraction + classification
│   │   ├── ReportPage.jsx           ← Results dashboard
│   │   └── ResearchPage.jsx         ← Lab research model inspection
│   ├── components/                  ← Shared UI components
│   └── context/
│       └── SessionContext.jsx       ← Global session state
│
├── server/
│   ├── gazescreen_model/
│   │   ├── extract.py               ← Reads Pupil_dataset.mat → session_features.csv
│   │   ├── features.py              ← Frozen feature schema + behavioral feature functions
│   │   ├── train.py                 ← 5-fold CV + full refit + evaluation report
│   │   ├── export_web.py            ← Exports model to research-v1.json for frontend
│   │   └── api.py                   ← FastAPI server (4 endpoints)
│   ├── artifacts/
│   │   ├── research_model.joblib    ← Full trained model
│   │   ├── fold_1..5.joblib         ← Per-fold models for demo page
│   │   ├── demo_records.json        ← 47 participant records for /research page
│   │   └── evaluation.json          ← Full metrics, confusion matrix, CI, permutation
│   └── data/
│       ├── session_features.csv     ← Extracted features from .mat file
│       └── extraction_audit.json    ← SHA-256, counts, quality stats
│
├── training/                        ← Earlier ONNX experiment (HBN + Cilia datasets)
│   ├── train.py                     ← Trains adhd.onnx + asd.onnx
│   ├── features.py                  ← 17-feature oculomotor extractor (mirrors classifier.js)
│   ├── datasets.py                  ← HBN + Cilia dataset loaders
│   └── README.md
│
└── tests/
    ├── adhdClassifier.test.js       ← Browser model vs Python predictions (47 participants)
    ├── cameraMeasurements.test.js   ← Gaze capture unit tests
    └── researchModel.test.js        ← Research model API contract tests
```

---

## 10. Application Flow — Page by Page

```
User opens app
     │
     ▼
/ (Landing)
  Hero, scientific disclosure, entry to screening or research lab
     │
     ▼
/consent
  Parent enters child's name + age, confirms privacy consent
     │
     ▼
/calibration
  • Resilient 3-tier camera acquisition fallback (user-facing → resolution → basic video)
  • Hardware lock detection (NotReadableError) with in-app Retry & Bypass options
  • Real-time ambient illumination & face alignment verification
     │
     ▼
/stimulus   ← 60 seconds
  • Dual-stimulus visual protocol (Social Interaction vs Geometric Fractals)
  • MediaPipe iris landmark tracking at ~30 FPS on-device
  • Minimalist Top HUD with clock timer, live status, and focus music toggle
  • Zero-Lag Completion: clicking [FINISH & VIEW REPORT] immediately halts animations,
    audio, and tracking workers, computing on-device metrics with zero latency
     │
     ▼
/report
  • High-contrast ADHD Attention Index (0–100) & ASD GeoPref preferential score
  • 5 cardinal biomarker breakdowns (instability, saccades, dispersion, vigilance drift, blinks)
  • Interactive ADHD Biomarker Radar Profile calibrated to 5 age cohorts (Infant to Adult 18+)
  • Spatial Gaze Dispersion Heatmap with toggle
  • Printable clinical summary & age-tailored next steps (ASRS v1.1 triage for adults)
     │
     ▼ (optional)
/research
  • Select any of 47 real EyeLink participants
  • Run out-of-fold inference from their held-out model (strict zero-leakage validation)
  • Inspect all 8 features, standardized z-score coefficients (L2-regularized, C=0.1), and confusion matrix
  • Compare prediction vs ground truth clinical diagnosis label
  • Export evaluation JSON
```

---

## 10B. Device Compatibility & Mobile Responsiveness

Although sustained gaze tracking is clinically best performed on laptops or desktop computers with an elevated front camera at eye level (40–55 cm), **the entire GazeScreen web application is 100% mobile-responsive**:

* **Fluid Adaptive Grids:** Replaced static grid break points with fluid `minmax(min(100%, 280px), 1fr)` across all screens so content wraps naturally on iPhones and Android devices (360px–430px) without horizontal clipping.
* **Viewport Overflow Protection:** Global `max-width: 100vw; overflow-x: hidden;` prevents horizontal page shaking or jitter.
* **Responsive Screening Top HUD:** On phone viewports (`< 640px`), secondary live counters are hidden (`.hud-hide-mobile`) while keeping the timer, music toggle, and finish button accessible on a single row.
* **Canvas Auto-Scaling:** Gaze fixation heatmaps and animated stimulus canvases scale dynamically to 100% container width.
* **Touch-Friendly Controls:** Generous touch targets with tactile brutalist shadows scaled down for mobile screens.

---

## 11. Quick Start

**Requirements:** Node.js 20+

```bash
# Install dependencies
npm install

# Run tests (verifies 47 browser predictions match Python scores)
npm test

# Start dev server
npm run dev
# → http://localhost:5173
```

No Python, GPU, or MATLAB license needed for the frontend — all model weights and the 47 research records are bundled in `public/models/research-v1.json`.

---

## 12. Python Server & Retraining

### Setup
```bash
npm run model:setup
# Creates server/.venv with: scikit-learn, pandas, fastapi, h5py, uvicorn, joblib
```

### Retrain from Dataset
```bash
# Place Pupil_dataset.mat in repo root, then:
npm run model:train

# Custom path:
npm run model:train -- "C:\path\to\Pupil_dataset.mat"
```

Runs `extract.py` → `train.py` → updates `public/models/research-v1.json`

### API Server
```bash
npm run model:serve
# FastAPI at http://127.0.0.1:8000
```

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service status |
| GET | `/api/model-info` | Full model metadata, features, validation stats |
| GET | `/api/demo-samples` | List of 47 research sample IDs |
| POST | `/api/predict-demo` | Run held-out fold model on a demo sample |
| POST | `/api/predict` | Run full model on a custom 8-feature payload (EyeLink schema enforced) |

### Run All Tests
```bash
npm test              # JavaScript: 47-participant prediction accuracy
npm run model:test    # Python: fold isolation, extraction, API contract
npm run build         # Production build
```

---

## 13. Scientific Limitations

| Limitation | Detail |
|---|---|
| **Not a formal clinical diagnosis** | Scores are observational digital biomarker indicators and triage signals, not a clinical diagnosis or medical determination. |
| **Dual architecture age boundaries** | The EyeLink 1000 research model is validated strictly on children aged 8.0–12.9 years and does **not** evaluate adults. The 60-second webcam screening tool uses the 1,246-subject HBN dataset (ages 5–21+) and adult-normative Z-score baselines (correlating with ASRS v1.1 standards for triage self-advocacy), but is not an FDA-cleared diagnostic device. |
| **Internal validation only (EyeLink)** | AUC 0.821 is calculated from held-out 5-fold cross-validation on the same 47-child research cohort — no independent external laboratory test set. |
| **Small research cohort** | N=47 produces wide confidence intervals (AUC 95% CI: 0.692–0.932). |
| **EyeLink vs webcam hardware gap** | The laboratory research model requires 1,000 Hz infrared pupillometry during a working memory task; a 30 FPS standard webcam cannot replicate microscopic pupil diameter dynamics. |
| **Single study (EyeLink)** | All laboratory working memory data is from one clinic in Chile; geographic and demographic generalizability is limited. |
| **Medication excluded** | `on-ADHD` (medicated) sessions were excluded during model training; model behaviour on actively medicated individuals is uncharacterized. |
| **Age confound in EyeLink cohort** | In the 47-subject research data, the ADHD group (mean 10.3y) is slightly younger than Controls (mean 11.2y); minor developmental age variance may contribute to the measured variance. |
| **No fabricated data** | All synthetic data generators and arbitrary score mocks have been eliminated; all calculations stem strictly from live camera telemetry or real research recordings. |

---

*Dataset Paper: Rojas-Líbano D, Wainstein G, Carrasco X, Aboitiz A, Billeke P, Aboitiz F. A dataset of pupil size and behavioral recordings of children with attention deficit hyperactivity disorder during a visuo-spatial working memory task. Scientific Data 6, 37 (2019). [Article](https://www.nature.com/articles/s41597-019-0037-2) | [Reference PDF](https://www.nature.com/articles/s41597-019-0037-2.pdf) | [Dataset](https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953)*

*`Pupil_dataset.mat` is git-ignored. Never commit it — it is 1.26 GB and contains research participant data.*
