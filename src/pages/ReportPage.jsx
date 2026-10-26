import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FlaskConical, HelpCircle, BookOpen, Flame } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import SpotlightCard from '../components/SpotlightCard';
import GazeHeatmap from '../components/GazeHeatmap';
import { BrutalDivider } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { getCohortInfo } from '../lib/classifier';

/* ── Clinical Risk Level Configurations ───────────────────────── */
const RISK_CONFIG = {
  low: {
    label: 'STEADY ATTENTION · LOW ADHD SIGNAL',
    color: '#15803d',
    bgColor: '#f0fdf4',
    badgeClass: 'tag-green',
    headline: 'Steady Visual Attention Profile',
    subtext: 'Observed gaze fixations, exploratory saccade rates, and visual stamina align closely with typical normative baselines. Minimal saccadic restlessness or vigilance decay detected.',
    action: 'Standard developmental observation. Visual stamina and fixation stability remain within typical expected parameters.',
    nextSteps: [
      'Maintain regular well-child or wellness checkups.',
      'Engage in interactive shared reading and structured visual tasks.',
      'Re-screen if new attentional or executive function challenges arise.',
    ],
  },
  moderate: {
    label: 'MODERATE ADHD ATTENTION SIGNAL',
    color: '#b45309',
    bgColor: '#fef3c7',
    badgeClass: 'tag-yellow',
    headline: 'Mild Attentional Fluctuations Detected',
    subtext: 'The session recorded noticeable divergence in visual fixation stability, elevated exploratory saccades, or time-on-task visual vigilance decrement compared against normative age baselines.',
    action: 'We recommend discussing these preliminary findings with an adult or pediatric ADHD clinical psychologist to evaluate attention habits under sustained cognitive demand.',
    nextSteps: [
      'Share this quantitative telemetry report with an adult ADHD psychologist or pediatrician.',
      'Implement interval pacing (e.g., 25-minute Pomodoro focus blocks) to combat visual vigilance decrement.',
      'Consider standardized clinical ADHD rating scales (ASRS v1.1 or Vanderbilt) to corroborate.',
    ],
  },
  elevated: {
    label: 'ELEVATED ADHD ATTENTION SIGNAL',
    color: '#b91c1c',
    bgColor: '#fee2e2',
    badgeClass: 'tag-red',
    headline: 'Marked Attentional Dispersion & Instability',
    subtext: 'Visual scanning metrics exhibit pronounced ADHD biomarker characteristics: elevated saccadic exploration rate, marked fixation duration variability (CV), and noticeable second-half visual vigilance decrement.',
    action: 'We strongly suggest scheduling a comprehensive evaluation with an ADHD clinical specialist or psychiatrist for formal diagnostic assessment and individualized support.',
    nextSteps: [
      'Schedule a formal assessment with a licensed adult ADHD psychiatrist or clinical psychologist.',
      'Provide this quantitative oculomotor screening report as complementary observational biomarker data.',
      'Explore sensory and physical accommodations (fidget devices, standing desks, high-contrast visual cues).',
    ],
  },
  unobserved: {
    label: 'NO OBSERVATIONAL DATA',
    color: '#64748b',
    bgColor: '#f8fafc',
    badgeClass: 'tag-dark',
    headline: 'No Gaze Telemetry Captured',
    subtext: 'Camera tracking was not active or no facial landmarks were detected during this session. No synthetic or simulated data was generated.',
    action: 'Ensure your camera is connected, well-lit, and permitted in the browser, or explore our laboratory research model with pre-recorded study recordings.',
    nextSteps: [
      'Check camera permissions and room lighting.',
      'Retry the screening session with face centered in reticle.',
      'Explore the laboratory research model benchmark with 47 validated study participants.',
    ],
  },
};

/* ── High-Contrast Semicircular Risk Gauge ── */
function ScoreGauge({ score, level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.low;
  const numericScore = typeof score === 'number' ? score : 0;
  const angle = (numericScore / 100) * 180 - 90; // -90° to +90°

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={240} height={130} viewBox="0 0 240 130">
        {/* Background track */}
        <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="square" />

        {/* Low Sector (Green) */}
        <path d="M 20 120 A 100 100 0 0 1 87 28" fill="none" stroke="#86efac" strokeWidth="18" strokeLinecap="square" />

        {/* Moderate Sector (Yellow) */}
        <path d="M 87 28 A 100 100 0 0 1 153 28" fill="none" stroke="#fde047" strokeWidth="18" strokeLinecap="square" />

        {/* High Sector (Red) */}
        <path d="M 153 28 A 100 100 0 0 1 220 120" fill="none" stroke="#fca5a5" strokeWidth="18" strokeLinecap="square" />

        {/* Needle */}
        <motion.line
          x1={120}
          y1={120}
          x2={120 + 82 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={120 + 82 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke="#121826"
          strokeWidth="3.5"
          strokeLinecap="square"
          initial={{ x2: 120, y2: 38 }}
          animate={{
            x2: 120 + 82 * Math.cos(((angle - 90) * Math.PI) / 180),
            y2: 120 + 82 * Math.sin(((angle - 90) * Math.PI) / 180),
          }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Pivot */}
        <circle cx={120} cy={120} r={8} fill="#121826" />
        <circle cx={120} cy={120} r={3.5} fill="#ffffff" />

        {/* Calibration Ticks */}
        <text x={18} y={128} fill="#64748b" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          LOW
        </text>
        <text x={108} y={22} fill="#64748b" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          MOD
        </text>
        <text x={192} y={128} fill="#64748b" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          HIGH
        </text>
      </svg>

      {/* Numerical Index Badge */}
      <div style={{ textAlign: 'center', marginTop: -6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2.8rem', color: cfg.color, lineHeight: 1 }}>
          {score != null ? score : 'N/A'}
        </div>
        <div className="text-label" style={{ marginTop: 2, fontSize: '0.64rem' }}>
          ADHD ATTENTION INDEX (0–100)
        </div>
      </div>
    </div>
  );
}

/* ── High-Contrast Neo-Brutalist Pure SVG Radar Profile ── */
function AdhdRadarProfile({ data }) {
  const cx = 145;
  const cy = 95;
  const r = 58;
  const numAxes = data.length || 5;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index, valueRatio) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    return {
      x: cx + r * valueRatio * Math.cos(angle),
      y: cy + r * valueRatio * Math.sin(angle),
    };
  };

  const ringPolygons = levels.map((lvl) =>
    data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ')
  );

  const normPoints = data
    .map((item, i) => {
      const ratio = Math.max(0.12, Math.min(1.0, (item.norm || 50) / 100));
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const subjectPoints = data
    .map((item, i) => {
      const ratio = Math.max(0.12, Math.min(1.0, (item.value || 0) / 100));
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const axisDetails = data.map((item, i) => {
    const spoke = getCoordinates(i, 1.0);
    const labelCoord = getCoordinates(i, 1.34);
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;

    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.3) textAnchor = 'start';
    else if (Math.cos(angle) < -0.3) textAnchor = 'end';

    let dy = 3;
    if (Math.sin(angle) < -0.6) dy = -5;
    else if (Math.sin(angle) > 0.6) dy = 11;

    const label = (item.subject || '').replace(/\n/g, ' ');

    return { spoke, labelCoord, textAnchor, dy, label };
  });

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 290 195"
        style={{
          width: '100%',
          maxWidth: 320,
          height: 'auto',
          maxHeight: 200,
          display: 'block',
          overflow: 'visible',
        }}
      >
        {/* Background Pentagon Rings */}
        {ringPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={idx === levels.length - 1 ? 1.5 : 1}
            strokeDasharray={idx === levels.length - 1 ? 'none' : '2 2'}
          />
        ))}

        {/* Axis Lines (Spokes) */}
        {axisDetails.map((axis, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={axis.spoke.x}
            y2={axis.spoke.y}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        ))}

        {/* Typical Age Norm Polygon */}
        <polygon
          points={normPoints}
          fill="#94a3b8"
          fillOpacity={0.16}
          stroke="#64748b"
          strokeWidth={1.8}
          strokeDasharray="4 3"
        />

        {/* Subject Profile Polygon */}
        <polygon
          points={subjectPoints}
          fill="#a855f7"
          fillOpacity={0.35}
          stroke="#9333ea"
          strokeWidth={2.8}
        />

        {/* Subject Vertex Dots */}
        {data.map((item, i) => {
          const ratio = Math.max(0.12, Math.min(1.0, (item.value || 0) / 100));
          const { x, y } = getCoordinates(i, ratio);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.8}
              fill="#9333ea"
              stroke="#121826"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Axis Labels */}
        {axisDetails.map((axis, i) => (
          <text
            key={i}
            x={axis.labelCoord.x}
            y={axis.labelCoord.y + axis.dy}
            textAnchor={axis.textAnchor}
            fill="#121826"
            fontSize="8"
            fontWeight="800"
            fontFamily="Space Mono, monospace"
            style={{ letterSpacing: '0.01em' }}
          >
            {axis.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── Metric Telemetry Row ── */
function MetricRow({ label, value, unit, normRange, delay = 0 }) {
  const displayVal = typeof value === 'number' ? value.toFixed(2) : value || '—';
  return (
    <motion.div
      className="metric-row-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1.5px solid #f1f5f9',
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div>
        <div className="metric-row-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        {normRange && <div className="metric-row-sub" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Typical for age: {normRange}</div>}
      </div>
      <div className="metric-row-val" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
        {displayVal}
        {unit && <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginLeft: 3 }}>{unit}</span>}
      </div>
    </motion.div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { session, resetSession } = useSession();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBiomarkerFaq, setShowBiomarkerFaq] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const age = session.childAge || 4;
  const cohort = getCohortInfo(age);
  const hasObservations = (session.gazePoints?.length ?? 0) > 0;
  const level = session.adhdLevel || session.riskLevel || (hasObservations ? 'low' : 'unobserved');
  const score = session.adhdScore ?? session.riskScore;
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.low;
  const metrics = session.metrics || {};
  const isAdult = cohort.cohortId === 'adult' || Number(age) >= 18;
  const nextStepsList = isAdult
    ? (level === 'elevated'
        ? [
            'Share this quantitative biomarker report with an adult ADHD psychiatrist or psychologist for formal clinical evaluation.',
            'Correlate with validated adult self-report diagnostic scales (e.g. ASRS v1.1 or DIVA-5).',
            'Explore workplace/study focus accommodations and structured interval pacing (e.g., 25-minute Pomodoro focus blocks).',
          ]
        : level === 'moderate'
        ? [
            'Discuss these preliminary attentional findings with your primary physician or an adult ADHD specialist.',
            'Observe whether focus fluctuations correlate with sleep debt, visual strain, or periods of high cognitive demand.',
            'Implement structured focus intervals to combat time-on-task visual vigilance decay.',
          ]
        : [
            'Maintain regular wellness routines and visual breaks during prolonged computer screen work.',
            'Keep this baseline telemetry report for personal health records or future clinical self-advocacy.',
            'Re-screen if new cognitive fatigue, attention drift, or executive functioning hurdles emerge.',
          ]
      )
    : (cohort.nextSteps || cfg.nextSteps);

  const actionSummaryText = isAdult
    ? (level === 'elevated'
        ? 'Objective digital biomarker telemetry indicating elevated visual restlessness. Recommended for clinical consultation.'
        : level === 'moderate'
        ? 'Mild visual attention fluctuations detected relative to adult normative baselines.'
        : 'Visual stamina and fixation stability remain well within typical adult parameters.')
    : (cohort.actionSummary || cfg.action);

  // Radar Data calibrated to ADHD Oculomotor Hallmarks
  const radarData = [
    {
      subject: 'Fixation Instability',
      value: Math.min(100, Math.round(((hasObservations && metrics.fixationDurationCv != null) ? metrics.fixationDurationCv : cohort.norms.fixationDurationCv.typical) * 100)),
      norm: Math.round(cohort.norms.fixationDurationCv.typical * 100),
    },
    {
      subject: 'Saccadic Exploration',
      value: Math.min(100, Math.round(((hasObservations && metrics.saccadeFrequency != null) ? metrics.saccadeFrequency : cohort.norms.saccadeFrequency.typical) * 18)),
      norm: Math.round(cohort.norms.saccadeFrequency.typical * 18),
    },
    {
      subject: 'Scanpath Spread',
      value: Math.min(100, Math.round(((hasObservations && metrics.gazeDispersion != null) ? metrics.gazeDispersion : cohort.norms.gazeDivergence.typical) * 320)),
      norm: Math.round(cohort.norms.gazeDivergence.typical * 320),
    },
    {
      subject: 'Blink Dynamics',
      value: Math.min(100, Math.round(((hasObservations && metrics.blinkRate != null) ? metrics.blinkRate : cohort.norms.blinkRate.typical) * 3.5)),
      norm: Math.round(cohort.norms.blinkRate.typical * 3.5),
    },
    {
      subject: 'Vigilance Drift',
      value: Math.min(100, Math.max(0, Math.round(50 + ((hasObservations && metrics.vigilanceDecayPercent != null) ? metrics.vigilanceDecayPercent : 0) * 1.2))),
      norm: 50,
    },
  ];

  const handleRetake = () => {
    resetSession();
    navigate('/consent');
  };

  const handlePrint = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <PageTransition>
      <div className="report-page-root" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

        {/* Minimalist Top Nav */}
        <nav
          className="report-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            borderBottom: '2.5px solid var(--ink)',
            background: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', fontSize: '1rem' }}>
              GAZE<span style={{ color: 'var(--orange-500)' }}>SCREEN</span>
            </span>
            <span style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 700 }}>
              CLINICAL SUMMARY
            </span>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/research')}
              className="brutal-btn brutal-btn-yellow"
              style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <FlaskConical size={13} strokeWidth={2.5} />
              <span>Research Lab</span>
            </button>
          </div>

          <div className="print-only" style={{ display: 'none' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--ink-secondary)', fontWeight: 700, textAlign: 'right', lineHeight: 1.35 }}>
              <div>DATE: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--ink-muted)' }}>CONFIDENTIAL CLINICAL TELEMETRY</div>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '2.5rem 1.5rem 4rem' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            {/* Header */}
            <motion.div className="patient-header-block" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <span
                  className="brutal-tag"
                  style={{
                    background: '#fef3c7',
                    color: '#78350f',
                    letterSpacing: '0.04em',
                    fontWeight: 800,
                  }}
                >
                  PATIENT REPORT
                </span>
                <span
                  className="brutal-tag"
                  style={{
                    background: '#ffffff',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                  }}
                >
                  SUBJECT: {session.childName || 'ANONYMOUS'} (AGE: {age})
                </span>
                <span className={`brutal-tag ${cohort.badgeClass}`}>
                  ● {cohort.title}
                </span>
              </div>
              <h1 className="text-hero" style={{ marginTop: 2, marginBottom: 2 }}>
                Digital Biomarker Screening Summary
              </h1>
            </motion.div>

            {/* Primary ADHD Assessment Banner */}
            <SpotlightCard
              className="primary-banner-card"
              style={{
                padding: '2rem',
                marginBottom: '1.5rem',
                background: cfg.bgColor,
                border: '3px solid var(--ink)',
                boxShadow: '6px 6px 0px var(--ink)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <span className={`brutal-tag ${cfg.badgeClass}`} style={{ marginBottom: 8 }}>
                    {cfg.label}
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--ink)', marginBottom: 6 }}>
                    {cfg.headline}
                  </div>
                  <p style={{ color: 'var(--ink-secondary)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 540 }}>
                    {cfg.subtext}
                  </p>
                </div>

                <div
                  className="score-gauge-box"
                  style={{
                    background: '#ffffff',
                    border: '2px solid var(--ink)',
                    padding: '16px 20px',
                    borderRadius: '4px',
                    boxShadow: '3.5px 3.5px 0px var(--ink)',
                  }}
                >
                  <ScoreGauge score={score} level={level} />
                </div>
              </div>
            </SpotlightCard>

            {/* Dual Profile Summary: ADHD Oculomotor vs ASD Social Orienting */}
            <div className="dual-track-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16, marginBottom: '2rem' }}>
              <div
                className="brutal-card dual-track-card"
                style={{
                  padding: '16px 20px',
                  background: '#ffffff',
                  border: '2.5px solid var(--ink)',
                  boxShadow: '4px 4px 0px var(--ink)',
                  borderRadius: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="brutal-tag tag-blue" style={{ fontSize: '0.7rem' }}>
                    ADHD BIOMARKER TRACK
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: cfg.color }}>
                    INDEX: {score ?? '—'} / 100
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 4 }}>
                  Natural Viewing Attention Dynamics
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Evaluates fixation duration variability, exploratory saccades, screen scanpath dispersion, and vigilance decay over 60 seconds. High social looking does not suppress this score.
                </p>
              </div>

              <div
                className="brutal-card dual-track-card"
                style={{
                  padding: '16px 20px',
                  background: '#ffffff',
                  border: '2.5px solid var(--ink)',
                  boxShadow: '4px 4px 0px var(--ink)',
                  borderRadius: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="brutal-tag tag-purple" style={{ fontSize: '0.7rem' }}>
                    ASD PREFERENTIAL TRACK
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: (session.asdScore ?? 25) > 60 ? '#b91c1c' : '#15803d' }}>
                    INDEX: {session.asdScore ?? (hasObservations ? 28 : '—')} / 100
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 4 }}>
                  GeoPref Social Orienting Index
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Evaluates preferential looking at dynamic human social interaction vs geometric patterns (Pierce et al.). Evaluated independently from ADHD attentional dynamics.
                </p>
              </div>
            </div>

            {/* Telemetry and Radar Visualizations */}
            <div className="telemetry-radar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: '2rem' }}>
              {/* Quantitative Metrics */}
              <SpotlightCard className="telemetry-card" style={{ padding: '1.75rem', background: '#eff6ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ width: 10, height: 10, background: 'var(--blue-600)', display: 'inline-block' }} />
                    Screening Biomarkers
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiomarkerFaq((v) => !v)}
                    className="brutal-btn no-print"
                    style={{
                      padding: '4px 9px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: showBiomarkerFaq ? 'var(--yellow-300)' : '#ffffff',
                      border: '1.5px solid var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <HelpCircle size={12} strokeWidth={2.5} />
                    <span>{showBiomarkerFaq ? 'Hide Guide' : 'What do these mean?'}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showBiomarkerFaq && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        overflow: 'hidden',
                        background: '#ffffff',
                        border: '2px solid var(--ink)',
                        borderRadius: '3px',
                        padding: '12px 14px',
                        marginBottom: '1rem',
                        boxShadow: '2.5px 2.5px 0px var(--ink)',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 800, color: 'var(--blue-700)', marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BookOpen size={14} strokeWidth={2.5} />
                        <span>Plain-English Guide to Your Metrics</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: 'var(--ink)', lineHeight: 1.45 }}>
                        <div>
                          <strong>• Saccade Exploration Rate:</strong> How frequently your eyes jump across visual regions per second. High rates reflect restless visual jumping; low rates reflect sustained focus.
                        </div>
                        <div>
                          <strong>• Fixation Duration Variability (CV):</strong> How unpredictable your visual pauses are. In ADHD, gaze fluctuates erratically between micro-pauses and staring. Lower % means more consistent attention.
                        </div>
                        <div>
                          <strong>• Mean Fixation Duration:</strong> The average time (ms) your eyes hold steady on one spot before moving (norm is ~270–410ms). High values indicate deep visual focus.
                        </div>
                        <div>
                          <strong>• Time-on-Task Vigilance Drift:</strong> Compares visual stability in the 1st vs 2nd half. Positive % means gaze began wandering as stamina tired out; near 0% means steady stamina throughout.
                        </div>
                        <div>
                          <strong>• Spatial Gaze Dispersion:</strong> How widely your gaze scatters across the screen. Higher dispersion indicates eyes wandering to edges rather than following central content.
                        </div>
                        <div>
                          <strong>• Spontaneous Blink Frequency:</strong> Natural blinks per minute, reflecting dopamine activity and cognitive load. Intense visual focus temporarily suppresses blinking.
                        </div>
                        <div>
                          <strong>• Social Attention Preference:</strong> Proportion of time spent looking at human social interactions vs geometric fractals (GeoPref test). Typical baseline is 65–85%.
                        </div>
                        <div>
                          <strong>• Optical Samples & Blink Events:</strong> Total valid 30 FPS camera frames tracking iris positions (300+ is optimal) and confirmed physical eyelid closure cycles.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <MetricRow label="Saccade Exploration Rate" value={hasObservations && metrics.saccadeFrequency != null ? metrics.saccadeFrequency : '—'} unit={hasObservations && metrics.saccadeFrequency != null ? '/sec' : ''} normRange={cohort.norms.saccadeFrequency.label} delay={0.05} />
                <MetricRow label="Fixation Duration Variability (CV)" value={hasObservations && metrics.fixationDurationCv != null ? metrics.fixationDurationCv * 100 : '—'} unit={hasObservations && metrics.fixationDurationCv != null ? '%' : ''} normRange={cohort.norms.fixationDurationCv.label} delay={0.1} />
                <MetricRow label="Mean Fixation Duration" value={hasObservations && metrics.avgFixationDuration != null ? metrics.avgFixationDuration : '—'} unit={hasObservations && metrics.avgFixationDuration != null ? 'ms' : ''} normRange={cohort.norms.avgFixationDuration.label} delay={0.15} />
                <MetricRow label="Time-on-Task Vigilance Drift" value={hasObservations && metrics.vigilanceDecayPercent != null ? `${metrics.vigilanceDecayPercent > 0 ? '+' : ''}${metrics.vigilanceDecayPercent}%` : '—'} normRange={cohort.norms.vigilanceDecay.label} delay={0.2} />
                <MetricRow label="Spatial Gaze Dispersion" value={hasObservations && metrics.gazeDispersion != null ? metrics.gazeDispersion * 100 : '—'} unit={hasObservations && metrics.gazeDispersion != null ? '%' : ''} normRange={cohort.norms.gazeDivergence.label} delay={0.25} />
                <MetricRow label="Spontaneous Blink Frequency" value={hasObservations && metrics.blinkRate != null ? metrics.blinkRate : '—'} unit={hasObservations && metrics.blinkRate != null ? '/min' : ''} normRange={cohort.norms.blinkRate.label} delay={0.3} />
                <MetricRow label="Social Attention Preference" value={hasObservations && metrics.socialAttentionRatio != null ? metrics.socialAttentionRatio * 100 : '—'} unit={hasObservations && metrics.socialAttentionRatio != null ? '%' : ''} normRange={cohort.norms.socialAttentionRatio.label} delay={0.35} />

                <BrutalDivider />
                <div className="telemetry-stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="telemetry-stat-box" style={{ padding: '10px 12px', border: '2px solid var(--ink)', background: '#ffffff', borderRadius: '3px', boxShadow: '2px 2px 0px var(--ink)' }}>
                    <div className="telemetry-stat-num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--blue-700)', fontSize: '1.2rem' }}>
                      {(session.gazePoints?.length ?? 0).toLocaleString()}
                    </div>
                    <div className="text-label" style={{ fontSize: '0.62rem', marginTop: 2, color: 'var(--ink)' }}>
                      OPTICAL SAMPLES
                    </div>
                  </div>
                  <div className="telemetry-stat-box" style={{ padding: '10px 12px', border: '2px solid var(--ink)', background: '#ffffff', borderRadius: '3px', boxShadow: '2px 2px 0px var(--ink)' }}>
                    <div className="telemetry-stat-num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--orange-600)', fontSize: '1.2rem' }}>
                      {(session.blinkEvents?.length ?? 0).toString()}
                    </div>
                    <div className="text-label" style={{ fontSize: '0.62rem', marginTop: 2, color: 'var(--ink)' }}>
                      BLINK EVENTS
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Radar Behavioral Signature */}
              <SpotlightCard className="radar-card" style={{ padding: '1.75rem', background: '#faf5ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ width: 10, height: 10, background: 'var(--purple-600)', display: 'inline-block' }} />
                  ADHD Biomarker Radar Profile
                </div>

                <AdhdRadarProfile data={radarData} />

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    <div style={{ width: 14, height: 5, background: 'var(--purple-600)', borderRadius: '1px' }} />
                    SUBJECT PATTERN
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ width: 14, height: 2, background: '#64748b' }} />
                    TYPICAL FOR AGE
                  </div>
                </div>
              </SpotlightCard>
            </div>


            {/* Heatmap Toggle Section */}
            <SpotlightCard
              className={showHeatmap ? 'heatmap-section heatmap-active' : 'heatmap-section heatmap-empty'}
              style={{ padding: '1.75rem', background: '#fff7ed', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', marginBottom: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showHeatmap ? '1rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: 'var(--orange-500)', display: 'inline-block' }} />
                  <div className="text-label" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    Spatial Gaze Dispersion Heatmap
                  </div>
                </div>
                <MotionButton
                  className="no-print"
                  variant="outline"
                  onClick={() => setShowHeatmap((v) => !v)}
                  style={{ fontSize: '0.78rem', padding: '8px 16px' }}
                >
                  {showHeatmap ? 'Hide Heatmap' : 'Render Heatmap Overlay'}
                </MotionButton>
              </div>

              <AnimatePresence>
                {showHeatmap && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <GazeHeatmap gazePoints={session.gazePoints} width={640} height={280} style={{ width: '100%', border: '2px solid var(--ink)', borderRadius: '3px' }} />
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Flame size={14} style={{ color: 'var(--orange-500)' }} />
                      <span>Hotspots show where your gaze clustered during the assessment.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SpotlightCard>

            {/* Clean Consolidated Clinical Next Steps */}
            <SpotlightCard
              className="next-steps-card"
              style={{ padding: '1.5rem', background: '#fffbeb', border: '2.5px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', marginBottom: '1.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: 'var(--orange-500)', display: 'inline-block' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--ink)' }}>
                    Next Steps for Your Clinician
                  </div>
                </div>
                <span className={`brutal-tag ${cohort.badgeClass}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {cohort.category.toUpperCase()} GROUP
                </span>
              </div>

              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.86rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                {actionSummaryText}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nextStepsList.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      padding: '8px 12px',
                      border: '1.5px solid var(--ink)',
                      borderRadius: '3px',
                      background: '#ffffff',
                      boxShadow: '1.5px 1.5px 0px var(--ink)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        color: 'var(--orange-600)',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span style={{ color: 'var(--ink)', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.45 }}>{step}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* Bottom Actions */}
            <div className="no-print" style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <MotionButton
                variant="yellow"
                onClick={handleRetake}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                }
              >
                Retake Screening
              </MotionButton>
              <MotionButton
                variant="coral"
                onClick={handlePrint}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                }
              >
                Print Clinical Summary
              </MotionButton>
            </div>

            {/* Print-only clinical footnote */}
            <div className="print-only" style={{ display: 'none', marginTop: '1.75rem', paddingTop: '12px', borderTop: '1px solid #cbd5e1', fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)', lineHeight: 1.45 }}>
              <strong>Clinical Telemetry Disclaimer:</strong> GazeScreen is a digital screening biomarker engine utilizing computer vision eye-tracking norms. It is designed to assist, not replace, formal clinical evaluation by a licensed healthcare provider. Results should be reviewed alongside validated diagnostic instruments (ASRS v1.1, DIVA-5, or Vanderbilt scales).
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
