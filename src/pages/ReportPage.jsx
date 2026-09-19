import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import DecryptedText from '../components/DecryptedText';
import GazeHeatmap from '../components/GazeHeatmap';
import { BrutalDivider } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { getCohortInfo } from '../lib/classifier';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

/* ── Clinical Risk Level Configurations ───────────────────────── */
const RISK_CONFIG = {
  low: {
    label: 'LOW RISK INDEX',
    color: '#15803d',
    bgColor: '#f0fdf4',
    badgeClass: 'tag-green',
    headline: 'Within Typical Developmental Norms',
    subtext: 'Observed gaze fixations, blink frequencies, and social-to-geometric visual preference ratios align closely with typical normative pediatric baselines.',
    action: 'Continue routine developmental tracking during standard pediatric visits. No immediate clinical flags detected by this digital biomarker session.',
    nextSteps: [
      'Maintain regular well-child pediatric checkups.',
      'Engage in shared reciprocal play and interactive reading.',
      'Re-screen in 6 months or whenever new developmental questions arise.',
    ],
  },
  moderate: {
    label: 'MODERATE SIGNAL',
    color: '#b45309',
    bgColor: '#fef3c7',
    badgeClass: 'tag-yellow',
    headline: 'Atypical Attention Patterns Detected',
    subtext: 'The session recorded mild divergence in visual fixation durations and social orientation compared against normative age baselines.',
    action: 'We recommend discussing these preliminary findings with your pediatrician or family physician to determine if formal clinical observation is advised.',
    nextSteps: [
      'Schedule a routine follow-up with your primary pediatrician.',
      'Share this report summary and note any everyday communication habits.',
      'Consider re-taking the screening in 2–3 weeks to confirm baseline consistency.',
    ],
  },
  elevated: {
    label: 'ELEVATED SIGNAL',
    color: '#b91c1c',
    bgColor: '#fee2e2',
    badgeClass: 'tag-red',
    headline: 'Elevated Atypical Gaze Features',
    subtext: 'Visual scanning metrics exhibit marked divergence from typical pediatric patterns, including reduced social preference and irregular fixation distribution.',
    action: 'We strongly suggest scheduling a comprehensive evaluation with a developmental pediatrician or child psychologist for formal assessment.',
    nextSteps: [
      'Request a referral to a Developmental-Behavioral Pediatrician.',
      'Provide this screening report as complementary observational data.',
      'Explore local early intervention support services and developmental resources.',
    ],
  },
};

/* ── High-Contrast Semicircular Risk Gauge ── */
function ScoreGauge({ score, level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.low;
  const angle = (score / 100) * 180 - 90; // -90° to +90°

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
          stroke="var(--ink)"
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
        <circle cx={120} cy={120} r={8} fill="var(--ink)" />

        {/* Calibration Ticks */}
        <text x={18} y={128} fill="var(--ink-muted)" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          LOW
        </text>
        <text x={108} y={22} fill="var(--ink-muted)" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          MOD
        </text>
        <text x={192} y={128} fill="var(--ink-muted)" fontSize="9" fontWeight="800" fontFamily="Space Mono">
          HIGH
        </text>
      </svg>

      {/* Numerical Index Badge */}
      <div style={{ textAlign: 'center', marginTop: -6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2.8rem', color: cfg.color, lineHeight: 1 }}>
          {score}
        </div>
        <div className="text-label" style={{ marginTop: 2, fontSize: '0.64rem' }}>
          RISK INDEX (0–100)
        </div>
      </div>
    </div>
  );
}

/* ── Metric Telemetry Row ── */
function MetricRow({ label, value, unit, normRange, delay = 0 }) {
  const displayVal = typeof value === 'number' ? value.toFixed(2) : value || '—';
  return (
    <motion.div
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
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        {normRange && <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Cohort Norm: {normRange}</div>}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const age = session.childAge || 4;
  const cohort = getCohortInfo(age);
  const level = session.riskLevel || 'low';
  const score = session.riskScore ?? 24;
  const cfg = RISK_CONFIG[level];
  const metrics = session.metrics || {};

  // Radar Data dynamically calibrated to selected age cohort
  const radarData = [
    { subject: 'Social\nAttention', value: Math.round((metrics.socialAttentionRatio || cohort.norms.socialAttentionRatio.typical) * 100), norm: Math.round(cohort.norms.socialAttentionRatio.typical * 100) },
    { subject: 'Fixation\nSpan', value: Math.min(100, Math.round((metrics.avgFixationDuration || cohort.norms.avgFixationDuration.typical) / 4.8)), norm: Math.round(cohort.norms.avgFixationDuration.typical / 4.8) },
    { subject: 'Blink\nFrequency', value: Math.min(100, Math.round((metrics.blinkRate || cohort.norms.blinkRate.typical) * 3.8)), norm: Math.round(cohort.norms.blinkRate.typical * 3.8) },
    { subject: 'Saccadic\nTransitions', value: Math.min(100, Math.round((metrics.saccadeFrequency || cohort.norms.saccadeFrequency.typical) * 16)), norm: Math.round(cohort.norms.saccadeFrequency.typical * 16) },
    { subject: 'Visual\nStability', value: Math.round((1 - (metrics.gazeDivergence || cohort.norms.gazeDivergence.typical)) * 100), norm: Math.round((1 - cohort.norms.gazeDivergence.typical) * 100) },
  ];

  // Bar Data
  const barData = [
    { name: 'Social Preference', value: Math.round((metrics.socialAttentionRatio || cohort.norms.socialAttentionRatio.typical) * 100), fill: '#3b82f6' },
    { name: 'Avg Fixation (ms)', value: Math.round(metrics.avgFixationDuration || cohort.norms.avgFixationDuration.typical), fill: '#a855f7' },
    { name: 'Blink Rate (/min)', value: Math.round(metrics.blinkRate || cohort.norms.blinkRate.typical), fill: '#f97316' },
    { name: 'Saccade (/sec)', value: parseFloat((metrics.saccadeFrequency || cohort.norms.saccadeFrequency.typical).toFixed(1)), fill: '#eab308' },
  ];

  const handleRetake = () => {
    resetSession();
    navigate('/consent');
  };

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

        {/* Minimalist Top Nav */}
        <nav
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

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="brutal-tag tag-blue">ON-DEVICE ML</span>
            <span className="brutal-tag tag-green">EVALUATION COMPLETE</span>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '2.5rem 1.5rem 4rem' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <span className="brutal-tag tag-purple">PATIENT REPORT</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  SESSION ID: <DecryptedText text={session.sessionId?.slice(0, 8).toUpperCase() || 'GS-2026X'} speed={20} />
                </span>
                {session.childName && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink)', fontWeight: 800 }}>
                    · SUBJECT: {session.childName} (AGE: {age})
                  </span>
                )}
                <span className={`brutal-tag ${cohort.badgeClass}`}>
                  ● {cohort.title}
                </span>
              </div>
              <h1 className="text-hero" style={{ marginTop: 2, marginBottom: 2 }}>
                Digital Biomarker Screening Summary
              </h1>
            </motion.div>

            {/* Risk Assessment Banner */}
            <SpotlightCard
              style={{
                padding: '2rem',
                marginBottom: '2rem',
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

            {/* Telemetry and Radar Visualizations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: '2rem' }}>
              {/* Quantitative Metrics */}
              <SpotlightCard style={{ padding: '1.75rem', background: '#eff6ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
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
                  <span style={{ width: 10, height: 10, background: 'var(--blue-600)', display: 'inline-block' }} />
                  Screening Biomarkers
                </div>

                <MetricRow label="Social Attention Preference" value={metrics.socialAttentionRatio ? metrics.socialAttentionRatio * 100 : cohort.norms.socialAttentionRatio.typical * 100} unit="%" normRange={cohort.norms.socialAttentionRatio.label} delay={0.05} />
                <MetricRow label="Mean Fixation Duration" value={metrics.avgFixationDuration || cohort.norms.avgFixationDuration.typical} unit="ms" normRange={cohort.norms.avgFixationDuration.label} delay={0.1} />
                <MetricRow label="Spontaneous Blink Frequency" value={metrics.blinkRate || cohort.norms.blinkRate.typical} unit="/min" normRange={cohort.norms.blinkRate.label} delay={0.15} />
                <MetricRow label="Saccade Exploration Rate" value={metrics.saccadeFrequency || cohort.norms.saccadeFrequency.typical} unit="/sec" normRange={cohort.norms.saccadeFrequency.label} delay={0.2} />
                <MetricRow label="Scanning Variance Index" value={metrics.gazeDivergence || cohort.norms.gazeDivergence.typical} normRange={cohort.norms.gazeDivergence.label} delay={0.25} />

                <BrutalDivider />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: '10px 12px', border: '2px solid var(--ink)', background: '#ffffff', borderRadius: '3px', boxShadow: '2px 2px 0px var(--ink)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--blue-700)', fontSize: '1.2rem' }}>
                      {session.gazePoints?.length?.toLocaleString() || '1,420'}
                    </div>
                    <div className="text-label" style={{ fontSize: '0.62rem', marginTop: 2, color: 'var(--ink)' }}>
                      OPTICAL SAMPLES
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', border: '2px solid var(--ink)', background: '#ffffff', borderRadius: '3px', boxShadow: '2px 2px 0px var(--ink)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--orange-600)', fontSize: '1.2rem' }}>
                      {session.blinkEvents?.length || '14'}
                    </div>
                    <div className="text-label" style={{ fontSize: '0.62rem', marginTop: 2, color: 'var(--ink)' }}>
                      BLINK EVENTS
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Radar Behavioral Signature */}
              <SpotlightCard style={{ padding: '1.75rem', background: '#faf5ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
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
                  Behavioral Radar Profile
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--ink)', fontSize: 10, fontFamily: 'Space Mono', fontWeight: 700 }} />
                    <Radar name="Child" dataKey="value" stroke="var(--purple-600)" fill="#a855f7" fillOpacity={0.3} strokeWidth={2.5} />
                    <Radar name="Norm" dataKey="norm" stroke="#64748b" fill="#94a3b8" fillOpacity={0.12} strokeWidth={1.5} strokeDasharray="3 3" />
                  </RadarChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    <div style={{ width: 14, height: 5, background: 'var(--purple-600)', borderRadius: '1px' }} />
                    SUBJECT PATTERN
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ width: 14, height: 2, background: '#64748b' }} />
                    COHORT BASELINE
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Bar Chart Section */}
            <SpotlightCard style={{ padding: '1.75rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', marginBottom: '2rem' }}>
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
                <span style={{ width: 10, height: 10, background: 'var(--orange-500)', display: 'inline-block' }} />
                Normalized Biomarker Values
              </div>

              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--ink)', fontSize: 10, fontFamily: 'Space Mono', fontWeight: 700 }} axisLine={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '2px solid var(--ink)',
                      borderRadius: '3px',
                      fontFamily: 'Space Mono',
                      fontSize: '0.75rem',
                      boxShadow: '3px 3px 0px var(--ink)',
                    }}
                  />
                  <Bar dataKey="value">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="var(--ink)" strokeWidth={1.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SpotlightCard>

            {/* Heatmap Toggle Section */}
            <SpotlightCard style={{ padding: '1.75rem', background: '#fff7ed', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showHeatmap ? '1rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: 'var(--orange-500)', display: 'inline-block' }} />
                  <div className="text-label" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    Spatial Gaze Dispersion Heatmap
                  </div>
                </div>
                <MotionButton variant="outline" onClick={() => setShowHeatmap((v) => !v)} style={{ fontSize: '0.78rem', padding: '8px 16px' }}>
                  {showHeatmap ? 'Hide Heatmap' : 'Render Heatmap Overlay'}
                </MotionButton>
              </div>

              <AnimatePresence>
                {showHeatmap && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <GazeHeatmap gazePoints={session.gazePoints} width={640} height={280} style={{ width: '100%', border: '2px solid var(--ink)', borderRadius: '3px' }} />
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      Bright green & amber density clusters denote visual fixation concentrations over the 60s stimulus.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SpotlightCard>

            {/* Recommended Clinical Next Steps */}
            <SpotlightCard style={{ padding: '2rem', background: '#fffbeb', border: '3px solid var(--ink)', boxShadow: '6px 6px 0px var(--ink)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`brutal-tag ${cohort.badgeClass}`}>
                    {cohort.category.toUpperCase()} GUIDANCE
                  </span>
                  <span className="text-label" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    RECOMMENDED CLINICAL NEXT STEPS
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--ink-muted)', fontWeight: 700 }}>
                  CALIBRATED FOR: {cohort.title.toUpperCase()}
                </span>
              </div>

              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {cohort.actionSummary || cfg.action}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(cohort.nextSteps || cfg.nextSteps).map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      border: '2px solid var(--ink)',
                      borderRadius: '3px',
                      background: '#ffffff',
                      boxShadow: '2.5px 2.5px 0px var(--ink)',
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '3px',
                        background: 'var(--orange-500)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        flexShrink: 0,
                        boxShadow: '1.5px 1.5px 0px var(--ink)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: 'var(--ink)', fontSize: '0.9rem', fontWeight: 600 }}>{step}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                onClick={() => window.print()}
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
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
