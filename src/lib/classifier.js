/**
 * GazeScreen Natural Viewing Biomarker Classifier
 * Pure on-device ML & heuristic inference — no server calls.
 *
 * Implements:
 * 1. 17-feature natural viewing oculomotor extraction based on Deng et al. 2022
 *    (Healthy Brain Network HBN ADHD study; ECML-PKDD).
 * 2. Pre-trained Logistic Regression inference (matching public/models/adhd.onnx parameters
 *    trained on 1,246 subjects).
 * 3. Dedicated ADHD Attention Biomarker Index (fixation instability, saccade frequency,
 *    spatial dispersion, and time-on-task vigilance decrement).
 * 4. Distinct ASD Social Orienting Profile (Pierce et al. GeoPref preferential looking).
 *
 * NOTE: Screening aid only — observational digital biomarker, not a clinical diagnosis.
 */

// Natural Viewing Model Parameters (decoded directly from public/models/adhd.onnx)
// Trained on 1,246 participants (729 ADHD positive, 517 control) from the HBN dataset.
export const HBN_ADHD_MODEL = {
  version: 1,
  dataset: 'Deng et al. 2022 (Healthy Brain Network natural viewing eye tracking)',
  nSubjects: 1246,
  featureNames: [
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
  ],
  imputed: [
    10.016255, 346.1747, 0.73402, 1.99883, 0.18775, 14.86156, 0.19875, -2.52701,
    0.0, 0.57893, 0.12214, 0.03137, -0.02274, 0.81102, 0.98439, 2.43275, 0.97112,
  ],
  offset: [
    10.774765, 344.79443, 0.74088, 1.99958, 0.19772, 17.71997, 0.19986, -2.53890,
    0.0, 0.57586, 0.12227, 0.03335, -0.02353, 0.80935, 0.98393, 2.77676, 0.96237,
  ],
  scale: [
    0.29237, 0.01294, 7.72543, 2.84333, 21.83400, 0.12060, 33.75286, 3.72735,
    1.0, 19.36459, 15.07802, 9.03939, 38.90704, 26.91632, 10.58560, 0.81275, 34.09996,
  ],
  // Coefficients for class 1 (ADHD positive)
  coefficients: [
    -0.220546, -0.006213, -0.024327, 0.000982, -0.43635, 0.125732, 0.596833, -0.313414,
    0.0, 0.131317, 0.0, 0.089204, 0.038810, 0.085197, -0.018065, -0.086891, 0.053923,
  ],
  intercept: 0.35452,
  thresholds: {
    low: 0.35,
    moderate: 0.50,
    elevated: 0.62,
  },
};

// Age-Stratified Normative Baselines & Clinical Configurations
export function getCohortInfo(ageInput = 4) {
  const age = parseInt(ageInput, 10);

  if (isNaN(age) || age < 1) {
    return {
      cohortId: 'unknown',
      age: 4,
      title: 'Preschool (Ages 2–6)',
      category: 'Preschool',
      ageLabel: 'Age 4 (Default)',
      badgeClass: 'tag-yellow',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      clinicalRationale: 'Enter a valid subject age (1–99y) to calibrate age-specific norms.',
      norms: {
        socialAttentionRatio: { typical: 0.68, stdDev: 0.12, label: '60–76%' },
        avgFixationDuration:  { typical: 280,  stdDev: 80,   label: '200–360 ms' },
        fixationDurationCv:   { typical: 0.62, stdDev: 0.14, label: '0.48–0.76' },
        blinkRate:            { typical: 14,   stdDev: 5,    label: '9–19 /min' },
        saccadeFrequency:     { typical: 3.2,  stdDev: 0.8,  label: '2.4–4.0 /sec' },
        gazeDivergence:       { typical: 0.18, stdDev: 0.06, label: '0.12–0.24' },
        vigilanceDecay:       { typical: 0.04, stdDev: 0.08, label: '-0.04 to +0.12' },
      },
      actionSummary: 'Standard developmental observation and surveillance.',
      nextSteps: [
        'Confirm participant age with parent or guardian.',
        'Ensure steady ambient room lighting and webcam elevation.',
        'Re-screen if tracking was interrupted or incomplete.',
      ],
    };
  }

  // 1. Infant Exploratory (< 2 years)
  if (age < 2) {
    return {
      cohortId: 'infant',
      age,
      title: 'Infants (Under 2)',
      category: 'Infant',
      ageLabel: `Age ${age}y (Infant)`,
      badgeClass: 'tag-yellow',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      clinicalRationale: 'Evaluates early visual attention, fixation stability, and natural social orienting in babies under 2.',
      norms: {
        socialAttentionRatio: { typical: 0.62, stdDev: 0.15, label: '50–74%' },
        avgFixationDuration:  { typical: 240,  stdDev: 90,   label: '160–330 ms' },
        fixationDurationCv:   { typical: 0.68, stdDev: 0.16, label: '0.52–0.84' },
        blinkRate:            { typical: 8,    stdDev: 4,    label: '4–12 /min' },
        saccadeFrequency:     { typical: 2.6,  stdDev: 0.9,  label: '1.7–3.5 /sec' },
        gazeDivergence:       { typical: 0.22, stdDev: 0.08, label: '0.14–0.30' },
        vigilanceDecay:       { typical: 0.05, stdDev: 0.10, label: '-0.05 to +0.15' },
      },
      actionSummary: 'Track early visual milestones with your pediatrician during routine well-baby visits.',
      nextSteps: [
        'Discuss non-verbal communication milestones with your primary pediatrician.',
        'Encourage high-contrast interactive facial play and shared tracking.',
        'Re-evaluate at 24 months as sustained attention networks mature.',
      ],
    };
  }

  // 2. Toddler & Preschool (2–6 years)
  if (age >= 2 && age <= 6) {
    return {
      cohortId: 'preschool',
      age,
      title: 'Toddler & Preschool (Ages 2–6)',
      category: 'Preschool',
      ageLabel: `Age ${age}y (Preschool)`,
      badgeClass: 'tag-green',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
      clinicalRationale: 'Evaluates early social looking preference and gaze stability during early childhood.',
      norms: {
        socialAttentionRatio: { typical: 0.68, stdDev: 0.12, label: '60–76%' },
        avgFixationDuration:  { typical: 280,  stdDev: 80,   label: '200–360 ms' },
        fixationDurationCv:   { typical: 0.62, stdDev: 0.14, label: '0.48–0.76' },
        blinkRate:            { typical: 14,   stdDev: 5,    label: '9–19 /min' },
        saccadeFrequency:     { typical: 3.2,  stdDev: 0.8,  label: '2.4–4.0 /sec' },
        gazeDivergence:       { typical: 0.18, stdDev: 0.06, label: '0.12–0.24' },
        vigilanceDecay:       { typical: 0.04, stdDev: 0.08, label: '-0.04 to +0.12' },
      },
      actionSummary: 'Early support (speech, occupational, or behavioral) has the highest impact when identified early.',
      nextSteps: [
        'Maintain scheduled well-child pediatric developmental surveillance.',
        'Engage daily in joint-attention activities and interactive shared reading.',
        'Seek clinical consultation if marked attention inconsistency is observed.',
      ],
    };
  }

  // 3. School-Age Pediatric (7–12 years)
  if (age >= 7 && age <= 12) {
    return {
      cohortId: 'school',
      age,
      title: 'School-Age (Ages 7–12)',
      category: 'School-Age',
      ageLabel: `Age ${age}y (School-Age)`,
      badgeClass: 'tag-blue',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      clinicalRationale: 'Calibrated for visual focus and gaze stability in elementary and middle school children.',
      norms: {
        socialAttentionRatio: { typical: 0.72, stdDev: 0.11, label: '62–82%' },
        avgFixationDuration:  { typical: 310,  stdDev: 75,   label: '235–385 ms' },
        fixationDurationCv:   { typical: 0.58, stdDev: 0.12, label: '0.46–0.70' },
        blinkRate:            { typical: 16,   stdDev: 5,    label: '11–21 /min' },
        saccadeFrequency:     { typical: 3.4,  stdDev: 0.8,  label: '2.6–4.2 /sec' },
        gazeDivergence:       { typical: 0.17, stdDev: 0.05, label: '0.12–0.22' },
        vigilanceDecay:       { typical: 0.03, stdDev: 0.07, label: '-0.04 to +0.10' },
      },
      actionSummary: 'Helpful for discussing classroom focus and learning accommodations with teachers and pediatricians.',
      nextSteps: [
        'Corroborate with teacher observations regarding classroom focus and task completion.',
        'Consult a pediatric neurologist or clinical psychologist specializing in ADHD if elevated.',
        'Consider standardized ADHD rating scales (Vanderbilt or Conners) alongside this telemetry.',
      ],
    };
  }

  // 4. Adolescent Cohort (13–17 years)
  if (age >= 13 && age <= 17) {
    return {
      cohortId: 'teen',
      age,
      title: 'Teens (Ages 13–17)',
      category: 'Teen',
      ageLabel: `Age ${age}y (Teen)`,
      badgeClass: 'tag-purple',
      badgeBg: '#faf5ff',
      badgeColor: '#7e22ce',
      clinicalRationale: 'Evaluates sustained screen focus, visual stamina, and gaze wandering in teenagers.',
      norms: {
        socialAttentionRatio: { typical: 0.74, stdDev: 0.10, label: '64–84%' },
        avgFixationDuration:  { typical: 330,  stdDev: 70,   label: '260–400 ms' },
        fixationDurationCv:   { typical: 0.56, stdDev: 0.12, label: '0.44–0.68' },
        blinkRate:            { typical: 18,   stdDev: 6,    label: '12–24 /min' },
        saccadeFrequency:     { typical: 3.5,  stdDev: 0.8,  label: '2.7–4.3 /sec' },
        gazeDivergence:       { typical: 0.16, stdDev: 0.05, label: '0.11–0.21' },
        vigilanceDecay:       { typical: 0.03, stdDev: 0.06, label: '-0.03 to +0.09' },
      },
      actionSummary: 'Useful context for discussing study habits, attention fatigue, and executive functioning.',
      nextSteps: [
        'Discuss findings collaboratively with the teen and their healthcare provider.',
        'Evaluate academic executive functioning and study habits under sustained load.',
        'Request adolescent neurodevelopmental or psychiatric assessment if attention struggles persist.',
      ],
    };
  }

  // 5. Adult Cohort (18+ years)
  return {
    cohortId: 'adult',
    age,
    title: 'Adults (Ages 18+)',
    category: 'Adult',
    ageLabel: `Age ${age}y (Adult)`,
    badgeClass: 'tag-blue',
    badgeBg: '#f1f5f9',
    badgeColor: '#0f172a',
    clinicalRationale: 'Calibrated for mature screen focus, visual restlessness, and sustained attention in adults.',
    norms: {
      socialAttentionRatio: { typical: 0.75, stdDev: 0.10, label: '65–85%' },
      avgFixationDuration:  { typical: 340,  stdDev: 70,   label: '270–410 ms' },
      fixationDurationCv:   { typical: 0.55, stdDev: 0.11, label: '0.44–0.66' },
      blinkRate:            { typical: 20,   stdDev: 6,    label: '14–26 /min' },
      saccadeFrequency:     { typical: 3.6,  stdDev: 0.8,  label: '2.8–4.4 /sec' },
      gazeDivergence:       { typical: 0.15, stdDev: 0.05, label: '0.10–0.20' },
      vigilanceDecay:       { typical: 0.02, stdDev: 0.06, label: '-0.04 to +0.08' },
    },
    actionSummary: 'Objective attention metrics to support self-advocacy and consultations with healthcare professionals.',
    nextSteps: [
      'Share these quantitative telemetry results with an adult ADHD clinical psychologist or psychiatrist.',
      'Correlate with adult self-report assessments (e.g., ASRS v1.1, DIVA 2.0).',
      'Implement interval pacing (e.g. 25-minute focus intervals) to mitigate visual vigilance decay.',
    ],
  };
}

const zscore = (value, mean, sd) => (sd > 0 ? (value - mean) / sd : 0);

// I-DT Fixation Detection (greedy dispersion algorithm)
function detectFixations(nx, ny, ts, dispThresh = 0.08, minDurMs = 100, maxGapMs = 500) {
  const fixations = [];
  const n = ts.length;
  if (n < 2) return fixations;

  let i = 0;
  while (i < n) {
    let j = i + 1;
    let minX = nx[i], maxX = nx[i];
    let minY = ny[i], maxY = ny[i];

    while (j < n) {
      if (ts[j] - ts[j - 1] > maxGapMs || ts[j] <= ts[j - 1]) break;
      minX = Math.min(minX, nx[j]);
      maxX = Math.max(maxX, nx[j]);
      minY = Math.min(minY, ny[j]);
      maxY = Math.max(maxY, ny[j]);
      if ((maxX - minX) + (maxY - minY) > dispThresh) break;
      j++;
    }

    const dur = ts[j - 1] - ts[i];
    if (dur >= minDurMs) {
      let sumX = 0, sumY = 0;
      for (let k = i; k < j; k++) {
        sumX += nx[k];
        sumY += ny[k];
      }
      const count = j - i;
      fixations.push({
        cx: sumX / count,
        cy: sumY / count,
        t0: ts[i],
        t1: ts[j - 1],
        duration: dur,
        startIndex: i,
        endIndex: j - 1,
      });
    }
    i = j;
  }
  return fixations;
}

// Derive full 17-feature natural viewing metrics from raw gaze and blink streams
export function deriveMetrics(gazePoints, blinkEvents = [], durationSeconds = 60, ageInput = 4) {
  const cohort = getCohortInfo(ageInput);
  const n = cohort.norms;

  if (!gazePoints || gazePoints.length < 15) {
    return {
      hasData: false,
      sampleCount: gazePoints ? gazePoints.length : 0,
      socialAttentionRatio: null,
      avgFixationDuration: null,
      fixationDurationCv: null,
      saccadeFrequency: null,
      meanSaccadeAmplitude: null,
      p95SaccadeVelocity: null,
      gazeDispersion: null,
      logEllipseArea: null,
      blinkRate: null,
      blinkGapPerMin: null,
      fixationLocationEntropy: null,
      longFixationFraction: null,
      vigilanceFixationDecay: null,
      vigilanceDispersionDecay: null,
      vigilanceDecayPercent: null,
      fixationReturnFraction: null,
      saccadeAmplitudeCv: null,
      fixationDurationSkew: null,
      gazeAutocorrelation: null,
      featureVector: null,
    };
  }

  // Determine coordinate space (normalize if pixel coordinates)
  let maxX = 1, maxY = 1;
  for (let k = 0; k < gazePoints.length; k++) {
    if (gazePoints[k].x > maxX) maxX = gazePoints[k].x;
    if (gazePoints[k].y > maxY) maxY = gazePoints[k].y;
  }
  const normX = maxX > 1.5 ? (typeof window !== 'undefined' ? window.innerWidth : maxX) : 1;
  const normY = maxY > 1.5 ? (typeof window !== 'undefined' ? window.innerHeight : maxY) : 1;

  const validPoints = gazePoints
    .filter(p => p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y))
    .sort((a, b) => a.timestamp - b.timestamp);

  const numPts = validPoints.length;
  if (numPts < 15) {
    return { hasData: false, sampleCount: numPts };
  }

  const nx = new Float64Array(numPts);
  const ny = new Float64Array(numPts);
  const ts = new Float64Array(numPts);

  for (let i = 0; i < numPts; i++) {
    nx[i] = Math.max(0, Math.min(1, validPoints[i].x / normX));
    ny[i] = Math.max(0, Math.min(1, validPoints[i].y / normY));
    ts[i] = validPoints[i].timestamp;
  }

  const spanMs = ts[numPts - 1] - ts[0];
  const effectiveSec = spanMs > 2000 ? spanMs / 1000 : Math.max(durationSeconds, 1);

  // Social phase calculation (GeoPref metric)
  const socialPoints = validPoints.filter(p => p.phase === 'social');
  const socialRatio = socialPoints.length / Math.max(numPts, 1);

  // I-DT Fixation Extraction
  const fixations = detectFixations(nx, ny, ts, 0.08, 100, 500);

  // 1. Fixation durations
  const durations = fixations.map(f => f.duration);
  let avgFixDur = n.avgFixationDuration.typical;
  let fixDurCv = n.fixationDurationCv.typical;
  let longFixFrac = 0.12;
  let fixDurSkew = 2.4;

  if (durations.length > 0) {
    const sumDur = durations.reduce((a, b) => a + b, 0);
    avgFixDur = sumDur / durations.length;

    if (durations.length > 1) {
      const variance = durations.reduce((acc, d) => acc + (d - avgFixDur) ** 2, 0) / durations.length;
      const std = Math.sqrt(variance);
      fixDurCv = avgFixDur > 0 ? std / avgFixDur : 0;

      // Fixation duration skewness
      if (std > 0) {
        const m3 = durations.reduce((acc, d) => acc + (d - avgFixDur) ** 3, 0) / durations.length;
        fixDurSkew = m3 / (std ** 3 + 1e-9);
      }
    }
    longFixFrac = durations.filter(d => d >= 600).length / durations.length;
  }

  // 2. Saccades (transitions between consecutive fixations)
  const amplitudes = [];
  const velocities = [];

  for (let k = 0; k < fixations.length - 1; k++) {
    const a = fixations[k];
    const b = fixations[k + 1];
    const gap = b.t0 - a.t1;
    if (gap > 500 || gap < 0) continue;

    const amp = Math.hypot(b.cx - a.cx, b.cy - a.cy);
    if (amp < 0.03) continue; // micro-drift filter

    const dtSec = Math.max(gap, 20) / 1000;
    amplitudes.push(amp);
    velocities.push(amp / dtSec);
  }

  const saccadeFreq = amplitudes.length > 0
    ? amplitudes.length / effectiveSec
    : 0;

  const meanSaccadeAmp = amplitudes.length > 2
    ? amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length
    : HBN_ADHD_MODEL.offset[4];

  let saccAmpCv = 0.98;
  if (amplitudes.length > 1 && meanSaccadeAmp > 0) {
    const ampVar = amplitudes.reduce((acc, a) => acc + (a - meanSaccadeAmp) ** 2, 0) / amplitudes.length;
    saccAmpCv = Math.sqrt(ampVar) / meanSaccadeAmp;
  }

  let p95Vel = 15.0;
  if (velocities.length > 0) {
    const sortedVel = [...velocities].sort((a, b) => a - b);
    const p95Idx = Math.min(sortedVel.length - 1, Math.floor(sortedVel.length * 0.95));
    p95Vel = sortedVel[p95Idx];
  }

  // 3. Gaze dispersion & spatial spread
  let meanX = 0, meanY = 0;
  for (let i = 0; i < numPts; i++) {
    meanX += nx[i];
    meanY += ny[i];
  }
  meanX /= numPts;
  meanY /= numPts;

  let varX = 0, varY = 0, covXY = 0;
  for (let i = 0; i < numPts; i++) {
    const dx = nx[i] - meanX;
    const dy = ny[i] - meanY;
    varX += dx * dx;
    varY += dy * dy;
    covXY += dx * dy;
  }
  varX /= numPts;
  varY /= numPts;
  covXY /= numPts;

  const gazeDispersion = Math.sqrt(varX + varY);

  // Bivariate log ellipse area (bounded to prevent out-of-distribution runaways)
  const tr = varX + varY;
  const det = varX * varY - covXY * covXY;
  const disc = Math.max(tr * tr / 4.0 - det, 0);
  const l1 = tr / 2.0 + Math.sqrt(disc);
  const l2 = Math.max(0, tr / 2.0 - Math.sqrt(disc));
  const ellipseArea = Math.PI * 1.5 * Math.sqrt(Math.max(l1, 1e-9) * Math.max(l2, 1e-9));
  const rawLogEllipse = Math.log(ellipseArea + 1e-9);
  const logEllipseArea = Math.max(-4.5, Math.min(0.0, rawLogEllipse));

  // 4. Spatial Fixation Location Entropy on 4x4 Grid
  let fixEntropy = 0.58;
  if (fixations.length > 0) {
    const gridCounts = new Array(16).fill(0);
    for (const f of fixations) {
      const gx = Math.min(3, Math.max(0, Math.floor(f.cx * 4)));
      const gy = Math.min(3, Math.max(0, Math.floor(f.cy * 4)));
      gridCounts[gx * 4 + gy]++;
    }
    const totalFix = fixations.length;
    let ent = 0;
    for (let c of gridCounts) {
      if (c > 0) {
        const p = c / totalFix;
        ent -= p * Math.log(p);
      }
    }
    fixEntropy = ent / Math.log(16);
  }

  // 5. Fixation Return Fraction (revisiting previously viewed regions)
  let fixReturnFrac = 0.81;
  if (fixations.length > 2) {
    let returns = 0;
    for (let i = 1; i < fixations.length; i++) {
      const cur = fixations[i];
      let revisited = false;
      for (let j = 0; j < i; j++) {
        const prev = fixations[j];
        if (Math.hypot(cur.cx - prev.cx, cur.cy - prev.cy) < 0.05) {
          revisited = true;
          break;
        }
      }
      if (revisited) returns++;
    }
    fixReturnFrac = returns / (fixations.length - 1);
  }

  // 6. Time-on-Task Vigilance Decrement (Second Half vs First Half of 60s)
  const midTime = ts[0] + spanMs / 2.0;
  let midIdx = 0;
  while (midIdx < numPts && ts[midIdx] < midTime) midIdx++;

  let vigDispDecay = 0.0;
  let vigFixDecay = 0.0;
  let vigPercent = 0.0;

  if (midIdx > 5 && midIdx < numPts - 5) {
    // 1st half dispersion
    let m1X = 0, m1Y = 0;
    for (let i = 0; i < midIdx; i++) { m1X += nx[i]; m1Y += ny[i]; }
    m1X /= midIdx; m1Y /= midIdx;
    let v1X = 0, v1Y = 0;
    for (let i = 0; i < midIdx; i++) { v1X += (nx[i] - m1X) ** 2; v1Y += (ny[i] - m1Y) ** 2; }
    const disp1 = Math.sqrt((v1X + v1Y) / midIdx);

    // 2nd half dispersion
    const len2 = numPts - midIdx;
    let m2X = 0, m2Y = 0;
    for (let i = midIdx; i < numPts; i++) { m2X += nx[i]; m2Y += ny[i]; }
    m2X /= len2; m2Y /= len2;
    let v2X = 0, v2Y = 0;
    for (let i = midIdx; i < numPts; i++) { v2X += (nx[i] - m2X) ** 2; v2Y += (ny[i] - m2Y) ** 2; }
    const disp2 = Math.sqrt((v2X + v2Y) / len2);

    vigDispDecay = disp2 - disp1;
    vigPercent = disp1 > 0 ? Math.round(((disp2 - disp1) / disp1) * 100) : 0;

    // Fixation duration decay
    const half1Fix = fixations.filter(f => (f.t0 + f.t1) / 2 <= midTime);
    const half2Fix = fixations.filter(f => (f.t0 + f.t1) / 2 > midTime);
    if (half1Fix.length > 0 && half2Fix.length > 0) {
      const d1 = half1Fix.reduce((s, f) => s + f.duration, 0) / half1Fix.length;
      const d2 = half2Fix.reduce((s, f) => s + f.duration, 0) / half2Fix.length;
      vigFixDecay = (d2 - d1) / Math.max(d1, 1);
    }
  }

  // 7. Lag-1 Autocorrelation (path smoothness)
  let gazeAutocorr = 0.97;
  if (numPts > 5) {
    let numX = 0, numY = 0, denX1 = 0, denX2 = 0, denY1 = 0, denY2 = 0;
    for (let i = 0; i < numPts - 1; i++) {
      const dx1 = nx[i] - meanX;
      const dx2 = nx[i + 1] - meanX;
      const dy1 = ny[i] - meanY;
      const dy2 = ny[i + 1] - meanY;
      numX += dx1 * dx2;
      numY += dy1 * dy2;
      denX1 += dx1 * dx1;
      denX2 += dx2 * dx2;
      denY1 += dy1 * dy1;
      denY2 += dy2 * dy2;
    }
    const rX = Math.sqrt(denX1 * denX2) > 1e-9 ? numX / Math.sqrt(denX1 * denX2) : 0;
    const rY = Math.sqrt(denY1 * denY2) > 1e-9 ? numY / Math.sqrt(denY1 * denY2) : 0;
    gazeAutocorr = Math.max(-1, Math.min(1, (rX + rY) / 2));
  }

  // 8. Blinks
  let blinkRate = n.blinkRate.typical;
  if (blinkEvents && blinkEvents.length > 0) {
    blinkRate = (blinkEvents.length / effectiveSec) * 60;
  }

  // Blink gap occurrences
  let gapCount = 0;
  for (let i = 1; i < numPts; i++) {
    const dt = ts[i] - ts[i - 1];
    if (dt >= 100 && dt < 500) gapCount++;
  }
  const blinkGapPerMin = (gapCount / effectiveSec) * 60;

  // Build the complete 17-feature vector for the HBN ADHD Model
  const age = cohort.age;
  const featureVector = [
    age,
    avgFixDur,
    fixDurCv,
    saccadeFreq,
    meanSaccadeAmp,
    p95Vel,
    gazeDispersion,
    logEllipseArea,
    blinkGapPerMin,
    fixEntropy,
    longFixFrac,
    vigFixDecay,
    vigDispDecay,
    fixReturnFrac,
    saccAmpCv,
    fixDurSkew,
    gazeAutocorr,
  ];

  return {
    hasData: true,
    sampleCount: numPts,
    socialAttentionRatio: socialRatio,
    avgFixationDuration: Math.round(avgFixDur),
    fixationDurationCv: parseFloat(fixDurCv.toFixed(3)),
    saccadeFrequency: parseFloat(saccadeFreq.toFixed(2)),
    meanSaccadeAmplitude: parseFloat(meanSaccadeAmp.toFixed(3)),
    p95SaccadeVelocity: parseFloat(p95Vel.toFixed(1)),
    gazeDispersion: parseFloat(gazeDispersion.toFixed(3)),
    logEllipseArea: parseFloat(logEllipseArea.toFixed(2)),
    blinkRate: Math.round(blinkRate),
    blinkGapPerMin: parseFloat(blinkGapPerMin.toFixed(1)),
    fixationLocationEntropy: parseFloat(fixEntropy.toFixed(3)),
    longFixationFraction: parseFloat(longFixFrac.toFixed(3)),
    vigilanceFixationDecay: parseFloat(vigFixDecay.toFixed(3)),
    vigilanceDispersionDecay: parseFloat(vigDispDecay.toFixed(3)),
    vigilanceDecayPercent: vigPercent,
    fixationReturnFraction: parseFloat(fixReturnFrac.toFixed(3)),
    saccadeAmplitudeCv: parseFloat(saccAmpCv.toFixed(3)),
    fixationDurationSkew: parseFloat(fixDurSkew.toFixed(3)),
    gazeAutocorrelation: parseFloat(gazeAutocorr.toFixed(3)),
    featureVector,
  };
}

// Execute pre-trained HBN ADHD Logistic Regression model
export function predictHbnAdhdModel(featureVector) {
  if (!featureVector || featureVector.length !== 17) {
    return { probability: 0.5, logit: 0, status: 'invalid_features' };
  }

  let logit = HBN_ADHD_MODEL.intercept;
  for (let i = 0; i < 17; i++) {
    let val = (featureVector[i] == null || isNaN(featureVector[i]))
      ? HBN_ADHD_MODEL.imputed[i]
      : featureVector[i];

    // Clamp age to model's valid calibration window [6, 18] to avoid adult age suppression
    if (i === 0) {
      val = Math.min(18, Math.max(6, val));
    }

    let scaled = (val - HBN_ADHD_MODEL.offset[i]) * HBN_ADHD_MODEL.scale[i];
    // Clamp scaled features to [-3.5, 3.5] standard deviations to prevent out-of-distribution extremes
    scaled = Math.max(-3.5, Math.min(3.5, scaled));

    logit += scaled * HBN_ADHD_MODEL.coefficients[i];
  }

  const probability = 1.0 / (1.0 + Math.exp(-logit));
  return { probability, logit, status: 'ok' };
}

// Compute comprehensive ADHD & ASD Screening Scores
export function computeRiskScore(metrics, ageInput = 4) {
  const cohort = getCohortInfo(ageInput);
  const norms = cohort.norms;

  if (!metrics || !metrics.hasData) {
    return {
      score: null,
      level: 'unobserved',
      confidence: 0,
      hasData: false,
      adhdScore: null,
      adhdLevel: 'unobserved',
      asdScore: null,
      asdLevel: 'unobserved',
      cohort: cohort.title,
      cohortId: cohort.cohortId,
      breakdown: [],
      disclaimer: 'No camera telemetry captured.',
    };
  }

  // 1. Run the HBN Natural Viewing 17-feature Model
  const hbnResult = predictHbnAdhdModel(metrics.featureVector);
  const modelProb = hbnResult.probability; // typical ~0.30 - 0.40, ADHD ~0.60 - 0.85

  // 2. Compute the 4 Cardinal ADHD Oculomotor Hallmarks
  // Hallmark A: Fixation Instability (Elevated Fixation Duration CV & shorter duration)
  const zFixCv = zscore(metrics.fixationDurationCv, norms.fixationDurationCv.typical, norms.fixationDurationCv.stdDev);
  const zFixDur = -zscore(metrics.avgFixationDuration, norms.avgFixationDuration.typical, norms.avgFixationDuration.stdDev);
  const fixationInstabilityZ = Math.max(-2.0, Math.min(3.5, (zFixCv * 1.2 + Math.max(-1.0, zFixDur) * 0.8) / 2));

  // Hallmark B: Saccadic Exploration Rate (Frequency of jumps across regions)
  const zSaccade = zscore(metrics.saccadeFrequency, norms.saccadeFrequency.typical, norms.saccadeFrequency.stdDev);
  const saccadeZ = Math.max(-2.0, Math.min(3.5, zSaccade));

  // Hallmark C: Gaze Dispersion (Broad spatial scattering)
  const zDisp = zscore(metrics.gazeDispersion, norms.gazeDivergence.typical, norms.gazeDivergence.stdDev);
  const dispersionZ = Math.max(-2.0, Math.min(3.5, zDisp));

  // Hallmark D: Time-on-Task Vigilance Decrement (Dispersion drift in 2nd half)
  const zVig = zscore(metrics.vigilanceDispersionDecay, norms.vigilanceDecay.typical, norms.vigilanceDecay.stdDev);
  const vigilanceZ = Math.max(-2.0, Math.min(3.5, zVig));

  // Hallmark E: Spontaneous Blink Rate
  const zBlink = zscore(metrics.blinkRate, norms.blinkRate.typical, norms.blinkRate.stdDev);
  const blinkZ = Math.max(-2.0, Math.min(3.0, zBlink));

  // ADHD Composite Score (Fixation Instability 30%, Saccades 25%, Dispersion 25%, Vigilance Decay 15%, Blink 5%)
  // NOTICE: Social attention is strictly excluded from the ADHD score so normal social looking does NOT penalize ADHD!
  const adhdOculomotorZ = (
    fixationInstabilityZ * 0.30 +
    saccadeZ * 0.25 +
    dispersionZ * 0.25 +
    vigilanceZ * 0.15 +
    blinkZ * 0.05
  );

  // Map HBN model probability (calibrated with 1,246 subjects) & Oculomotor Z to 0-100 Index
  // HBN Logistic Regression threshold is 0.50 (binary decision boundary).
  // When modelProb < 0.50 (classified as typical / non-ADHD), maps smoothly into the 12 - 40 typical range.
  // When modelProb >= 0.50 (ADHD positive signal), maps into the 50 - 95 moderate/elevated range.
  let calibratedModelScore;
  if (modelProb < 0.50) {
    calibratedModelScore = 12 + (modelProb / 0.50) * 28;
  } else {
    calibratedModelScore = 52 + ((modelProb - 0.50) / 0.50) * 44;
  }

  // Oculomotor Dynamics: Z <= 0 corresponds to a typical low baseline (~10 - 24)
  let heuristicScore;
  if (adhdOculomotorZ <= 0) {
    // Steadier than typical average (negative Z: minimal restlessness)
    heuristicScore = Math.max(10, 24 + adhdOculomotorZ * 12);
  } else {
    // Elevated restlessness / instability
    heuristicScore = Math.min(94, 32 + adhdOculomotorZ * 36);
  }

  // Blend: 55% Trained HBN Model + 45% Oculomotor Attention Dynamics
  const rawAdhdScore = Math.round(calibratedModelScore * 0.55 + heuristicScore * 0.45);
  const adhdScore = Math.min(96, Math.max(10, rawAdhdScore));

  let adhdLevel;
  if (adhdScore < 45)       adhdLevel = 'low';
  else if (adhdScore < 65)  adhdLevel = 'moderate';
  else                     adhdLevel = 'elevated';

  // 3. Separate ASD Social Orienting Profile (Pierce et al. GeoPref Index)
  // Evaluates preferential looking (social scenes vs geometric patterns)
  // Normal social looking (>=70%) yields low ASD orienting signal (8 - 20)
  // Low social looking (<45%, geometric preference) indicates elevated geometric orienting
  let rawAsdScore;
  if (metrics.socialAttentionRatio >= 0.70) {
    rawAsdScore = Math.round(10 + Math.max(0, (0.85 - metrics.socialAttentionRatio) * 40));
  } else if (metrics.socialAttentionRatio >= 0.45) {
    rawAsdScore = Math.round(20 + ((0.70 - metrics.socialAttentionRatio) / 0.25) * 25);
  } else {
    rawAsdScore = Math.round(45 + Math.min(50, ((0.45 - metrics.socialAttentionRatio) / 0.35) * 50));
  }
  const asdScore = Math.min(95, Math.max(8, rawAsdScore));

  let asdLevel;
  if (asdScore < 35)       asdLevel = 'low';
  else if (asdScore < 60)  asdLevel = 'moderate';
  else                     asdLevel = 'elevated';

  const breakdown = [
    {
      name: 'Fixation Instability',
      label: 'Fixation Duration Variability',
      z: fixationInstabilityZ,
      weight: 0.30,
      value: `${(metrics.fixationDurationCv * 100).toFixed(0)}% CV`,
      status: fixationInstabilityZ > 1.0 ? 'elevated' : fixationInstabilityZ > 0.3 ? 'moderate' : 'typical',
    },
    {
      name: 'Saccadic Exploration',
      label: 'Saccade Exploration Rate',
      z: saccadeZ,
      weight: 0.25,
      value: `${metrics.saccadeFrequency} /sec`,
      status: saccadeZ > 1.0 ? 'elevated' : saccadeZ > 0.3 ? 'moderate' : 'typical',
    },
    {
      name: 'Spatial Dispersion',
      label: 'Gaze Scanpath Spread',
      z: dispersionZ,
      weight: 0.25,
      value: `${(metrics.gazeDispersion * 100).toFixed(1)}%`,
      status: dispersionZ > 1.0 ? 'elevated' : dispersionZ > 0.3 ? 'moderate' : 'typical',
    },
    {
      name: 'Vigilance Decrement',
      label: 'Time-on-Task Vigilance Drift',
      z: vigilanceZ,
      weight: 0.15,
      value: `${metrics.vigilanceDecayPercent > 0 ? '+' : ''}${metrics.vigilanceDecayPercent}% drift`,
      status: vigilanceZ > 1.0 ? 'elevated' : vigilanceZ > 0.3 ? 'moderate' : 'typical',
    },
    {
      name: 'Blink Dynamics',
      label: 'Spontaneous Blink Frequency',
      z: blinkZ,
      weight: 0.05,
      value: `${metrics.blinkRate} /min`,
      status: Math.abs(blinkZ) > 1.2 ? 'atypical' : 'typical',
    },
  ];

  return {
    score: adhdScore,
    level: adhdLevel,
    adhdScore,
    adhdLevel,
    adhdProbability: modelProb,
    asdScore: rawAsdScore,
    asdLevel,
    confidence: Math.min(1.0, metrics.sampleCount / 600),
    hasData: true,
    breakdown,
    cohort: cohort.title,
    cohortId: cohort.cohortId,
    isDiagnostic: false,
    disclaimer: 'Observational digital screening telemetry; not a formal clinical diagnosis.',
  };
}
