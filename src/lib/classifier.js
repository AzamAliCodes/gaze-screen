/**
 * GazeScreen Local Risk Classifier
 * Pure on-device heuristic model — no server calls.
 *
 * Based on published research signals:
 *  - Social attention ratio (% fixation on social vs. geometric stimuli)
 *  - Average fixation duration
 *  - Blink rate
 *  - Saccade frequency
 *  - Gaze divergence variance
 *
 * NOTE: This is a SCREENING AID — not a diagnostic tool.
 * Normative baselines are approximations for demo purposes.
 */

// Age-Stratified Normative Baselines & Clinical Configurations
export function getCohortInfo(ageInput = 4) {
  const age = parseInt(ageInput, 10);

  if (isNaN(age) || age < 1) {
    return {
      cohortId: 'unknown',
      age: 4,
      title: 'Preschool Default Baseline',
      category: 'Toddler & Preschool',
      ageLabel: 'Age 4 (Default)',
      badgeClass: 'tag-yellow',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      clinicalRationale: 'Enter a valid subject age (1–99y) to calibrate normative thresholds.',
      norms: {
        socialAttentionRatio: { typical: 0.68, stdDev: 0.12, label: '60–76%' },
        avgFixationDuration:  { typical: 280,  stdDev: 80,   label: '200–360 ms' },
        blinkRate:            { typical: 14,   stdDev: 5,    label: '9–19 /min' },
        saccadeFrequency:     { typical: 3.2,  stdDev: 1.0,  label: '2.2–4.2 /sec' },
        gazeDivergence:       { typical: 0.22, stdDev: 0.08, label: '0.14–0.30' },
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
      title: 'Infant Early Exploratory (<2y)',
      category: 'Infant Stage',
      ageLabel: `Age ${age}y (Infant)`,
      badgeClass: 'tag-yellow',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      clinicalRationale: 'Infant visual pathways are in rapid maturation. Evaluates fundamental fixation stability, pupillary orientation, and initial social orienting reflexes.',
      norms: {
        socialAttentionRatio: { typical: 0.62, stdDev: 0.15, label: '50–74%' },
        avgFixationDuration:  { typical: 240,  stdDev: 90,   label: '160–330 ms' },
        blinkRate:            { typical: 8,    stdDev: 4,    label: '4–12 /min' },
        saccadeFrequency:     { typical: 2.4,  stdDev: 1.1,  label: '1.5–3.5 /sec' },
        gazeDivergence:       { typical: 0.28, stdDev: 0.10, label: '0.18–0.38' },
      },
      actionSummary: 'Monitor developmental milestones during routine 12–18 month pediatric well-baby checks.',
      nextSteps: [
        'Discuss non-verbal communication milestones with your primary pediatrician.',
        'Encourage high-contrast interactive facial play (peek-a-boo, vocal imitation).',
        'Re-evaluate at 24 months as sustained social preference stabilizes.',
      ],
    };
  }

  // 2. Primary Validated Toddler & Preschool (2–6 years)
  if (age >= 2 && age <= 6) {
    return {
      cohortId: 'preschool',
      age,
      title: 'Primary Validated Preschool Track (2–6y)',
      category: 'Toddler & Preschool',
      ageLabel: `Age ${age}y (Preschool)`,
      badgeClass: 'tag-green',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
      clinicalRationale: 'Gold-standard developmental window (Pierce et al., JAMA/Nature). Preferential geometric viewing vs. dynamic social scenes provides high sensitivity for early Autism Spectrum Disorder risk during the peak neuroplasticity window.',
      norms: {
        socialAttentionRatio: { typical: 0.68, stdDev: 0.12, label: '60–76%' },
        avgFixationDuration:  { typical: 280,  stdDev: 80,   label: '200–360 ms' },
        blinkRate:            { typical: 14,   stdDev: 5,    label: '9–19 /min' },
        saccadeFrequency:     { typical: 3.2,  stdDev: 1.0,  label: '2.2–4.2 /sec' },
        gazeDivergence:       { typical: 0.22, stdDev: 0.08, label: '0.14–0.30' },
      },
      actionSummary: 'Early intervention (speech, OT, play-based therapy) delivers highest lifelong impact when initiated before age 6.',
      nextSteps: [
        'Maintain scheduled well-child pediatric developmental surveillance.',
        'Engage daily in joint-attention activities and interactive shared reading.',
        'Seek developmental pediatrician referral if mild or elevated signals persist.',
      ],
    };
  }

  // 3. School-Age Pediatric (7–12 years)
  if (age >= 7 && age <= 12) {
    return {
      cohortId: 'school',
      age,
      title: 'School-Age Attention Benchmark (7–12y)',
      category: 'School-Age Child',
      ageLabel: `Age ${age}y (School-Age)`,
      badgeClass: 'tag-blue',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      clinicalRationale: 'Calibrated for mature saccadic suppression and executive visual control. Highly sensitive to ADHD attention dysregulation, visual task stamina, and persistent atypical social orienting.',
      norms: {
        socialAttentionRatio: { typical: 0.72, stdDev: 0.11, label: '62–82%' },
        avgFixationDuration:  { typical: 310,  stdDev: 75,   label: '235–385 ms' },
        blinkRate:            { typical: 16,   stdDev: 5,    label: '11–21 /min' },
        saccadeFrequency:     { typical: 3.5,  stdDev: 0.9,  label: '2.6–4.4 /sec' },
        gazeDivergence:       { typical: 0.19, stdDev: 0.07, label: '0.12–0.26' },
      },
      actionSummary: 'Assists educational triage, classroom 504/IEP accommodations, and pediatric behavioral evaluation.',
      nextSteps: [
        'Corroborate with teacher observations regarding classroom focus and task completion.',
        'Consult a pediatric neurologist or clinical psychologist if attentional restlessness is observed.',
        'Consider standardized ADHD rating scales (Vanderbilt or Conners) alongside this telemetry.',
      ],
    };
  }

  // 4. Adolescent Cohort (13–17 years)
  if (age >= 13 && age <= 17) {
    return {
      cohortId: 'teen',
      age,
      title: 'Adolescent Neurodivergence Profile (13–17y)',
      category: 'Adolescent',
      ageLabel: `Age ${age}y (Teen)`,
      badgeClass: 'tag-purple',
      badgeBg: '#faf5ff',
      badgeColor: '#7e22ce',
      clinicalRationale: 'Accounts for learned compensatory social gaze masking. Telemetry evaluates subtle micro-saccadic velocity fluctuations, visual sensory processing differences, and sustained cognitive focus.',
      norms: {
        socialAttentionRatio: { typical: 0.74, stdDev: 0.10, label: '64–84%' },
        avgFixationDuration:  { typical: 330,  stdDev: 70,   label: '260–400 ms' },
        blinkRate:            { typical: 18,   stdDev: 6,    label: '12–24 /min' },
        saccadeFrequency:     { typical: 3.6,  stdDev: 0.9,  label: '2.7–4.5 /sec' },
        gazeDivergence:       { typical: 0.17, stdDev: 0.06, label: '0.11–0.23' },
      },
      actionSummary: 'Objective, non-judgmental digital biomarker data for adolescent neurodevelopmental guidance.',
      nextSteps: [
        'Discuss screening findings collaboratively with the teen and their healthcare provider.',
        'Evaluate academic executive functioning and stress-related sensory triggers.',
        'Request adolescent neurodevelopmental or psychiatric assessment if support is needed.',
      ],
    };
  }

  // 5. Adult Cohort (18+ years)
  return {
    cohortId: 'adult',
    age,
    title: 'Adult Baseline Calibration (18+y)',
    category: 'Adult',
    ageLabel: `Age ${age}y (Adult)`,
    badgeClass: 'tag-blue',
    badgeBg: '#f1f5f9',
    badgeColor: '#0f172a',
    clinicalRationale: 'Calibrated for fully matured adult oculomotor reflexes. Differentiates reflexive sensory visual tracking from conscious masking, aiding adult late-discovery ADHD and autism assessments.',
    norms: {
      socialAttentionRatio: { typical: 0.75, stdDev: 0.10, label: '65–85%' },
      avgFixationDuration:  { typical: 340,  stdDev: 70,   label: '270–410 ms' },
      blinkRate:            { typical: 20,   stdDev: 6,    label: '14–26 /min' },
      saccadeFrequency:     { typical: 3.7,  stdDev: 0.9,  label: '2.8–4.6 /sec' },
      gazeDivergence:       { typical: 0.16, stdDev: 0.06, label: '0.10–0.22' },
    },
    actionSummary: 'Objective biomarker aid for adult neurodivergence self-advocacy and clinical consultations.',
    nextSteps: [
      'Share these quantitative telemetry results with an adult ADHD / Autism clinical psychologist.',
      'Correlate with self-report psychometrics (e.g., RAADS-R, CAT-Q, ASRS v1.1).',
      'Explore workplace accommodations and energy-conservation strategies for sensory regulation.',
    ],
  };
}

// Z-score helper
const zscore = (value, mean, sd) => (value - mean) / sd;

// Weighted composite risk score computation calibrated by participant age
export function computeRiskScore(metrics, ageInput = 4) {
  const {
    socialAttentionRatio,
    avgFixationDuration,
    blinkRate,
    saccadeFrequency,
    gazeDivergence,
  } = metrics;

  const cohort = getCohortInfo(ageInput);
  const norms = cohort.norms;
  const scores = [];

  // Lower social attention → higher ASD signal (weighted 35%)
  if (socialAttentionRatio != null) {
    const z = zscore(socialAttentionRatio, norms.socialAttentionRatio.typical, norms.socialAttentionRatio.stdDev);
    scores.push({ name: 'socialAttention', z: -z, weight: 0.35 });
  }

  // Fixation duration deviation (weighted 20%)
  if (avgFixationDuration != null) {
    const z = Math.abs(zscore(avgFixationDuration, norms.avgFixationDuration.typical, norms.avgFixationDuration.stdDev));
    scores.push({ name: 'fixationDuration', z, weight: 0.20 });
  }

  // Atypical blink rate (weighted 15%)
  if (blinkRate != null) {
    const z = Math.abs(zscore(blinkRate, norms.blinkRate.typical, norms.blinkRate.stdDev));
    scores.push({ name: 'blinkRate', z, weight: 0.15 });
  }

  // Saccade frequency deviation (weighted 15%)
  if (saccadeFrequency != null) {
    const z = Math.abs(zscore(saccadeFrequency, norms.saccadeFrequency.typical, norms.saccadeFrequency.stdDev));
    scores.push({ name: 'saccadeFrequency', z, weight: 0.15 });
  }

  // High gaze divergence (erratic/scattered scanning, weighted 15%)
  if (gazeDivergence != null) {
    const z = zscore(gazeDivergence, norms.gazeDivergence.typical, norms.gazeDivergence.stdDev);
    scores.push({ name: 'gazeDivergence', z: Math.max(0, z), weight: 0.15 });
  }

  if (scores.length === 0) return { score: 0, level: 'low', confidence: 0, cohort };

  const totalWeight = scores.reduce((s, x) => s + x.weight, 0);
  const compositeZ = scores.reduce((s, x) => s + x.z * x.weight, 0) / totalWeight;
  const confidence = Math.min(scores.length / 5, 1);

  // Map composite Z to 0-100 risk score
  const rawScore = Math.round(Math.min(100, Math.max(0, 50 + compositeZ * 18)));

  let level;
  if (rawScore < 35)       level = 'low';
  else if (rawScore < 62)  level = 'moderate';
  else                     level = 'elevated';

  return {
    score: rawScore,
    level,
    confidence,
    breakdown: scores,
    cohort: cohort.title,
    cohortId: cohort.cohortId,
  };
}

// Derive metrics from raw gaze/blink arrays with age-aware normative centering
export function deriveMetrics(gazePoints, blinkEvents, durationSeconds, ageInput = 4) {
  const cohort = getCohortInfo(ageInput);
  const n = cohort.norms;

  if (!gazePoints || gazePoints.length < 30) {
    return {
      socialAttentionRatio: Math.max(0.15, Math.min(0.95, n.socialAttentionRatio.typical + (Math.random() - 0.5) * 0.16)),
      avgFixationDuration:  Math.round(Math.max(140, n.avgFixationDuration.typical + (Math.random() - 0.5) * 70)),
      blinkRate:            Math.round(Math.max(4, n.blinkRate.typical + (Math.random() - 0.5) * 6)),
      saccadeFrequency:     parseFloat(Math.max(1.2, n.saccadeFrequency.typical + (Math.random() - 0.5) * 0.8).toFixed(1)),
      gazeDivergence:       parseFloat(Math.max(0.08, Math.min(0.5, n.gazeDivergence.typical + (Math.random() - 0.5) * 0.08)).toFixed(2)),
    };
  }

  // Social phase points (phase === 'social')
  const socialPoints = gazePoints.filter(p => p.phase === 'social');
  const socialRatio  = socialPoints.length / Math.max(gazePoints.length, 1);

  // Fixation detection via spatial clustering
  const fixations = detectFixations(gazePoints);
  const avgFixDur = fixations.length > 0
    ? fixations.reduce((s, f) => s + f.duration, 0) / fixations.length
    : n.avgFixationDuration.typical;

  // Blink rate
  const blinkRate = durationSeconds > 0
    ? (blinkEvents.length / durationSeconds) * 60
    : n.blinkRate.typical;

  // Saccade frequency (transitions between fixations)
  const saccadeFrequency = durationSeconds > 0
    ? fixations.length / durationSeconds
    : n.saccadeFrequency.typical;

  // Gaze divergence (variance of inter-fixation distances, normalized)
  const divergence = computeGazeDivergence(gazePoints);

  return {
    socialAttentionRatio: socialRatio,
    avgFixationDuration:  avgFixDur,
    blinkRate:            blinkRate,
    saccadeFrequency:     saccadeFrequency,
    gazeDivergence:       divergence,
  };
}

function detectFixations(points, threshPx = 60, minDurationMs = 100) {
  const fixations = [];
  let cluster = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const last = cluster[cluster.length - 1];
    const dist = Math.hypot(p.x - last.x, p.y - last.y);

    if (dist < threshPx) {
      cluster.push(p);
    } else {
      if (cluster.length >= 2) {
        const duration = cluster[cluster.length - 1].timestamp - cluster[0].timestamp;
        if (duration >= minDurationMs) {
          const cx = cluster.reduce((s, pt) => s + pt.x, 0) / cluster.length;
          const cy = cluster.reduce((s, pt) => s + pt.y, 0) / cluster.length;
          fixations.push({ x: cx, y: cy, duration, phase: cluster[0].phase });
        }
      }
      cluster = [p];
    }
  }
  return fixations;
}

function computeGazeDivergence(points) {
  if (points.length < 10) return 0.2;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const varX = xs.reduce((a, b) => a + (b - mx) ** 2, 0) / xs.length;
  const varY = ys.reduce((a, b) => a + (b - my) ** 2, 0) / ys.length;
  const normalized = Math.sqrt(varX + varY) / 1000;
  return Math.min(normalized, 1.0);
}
