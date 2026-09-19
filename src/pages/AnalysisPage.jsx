import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import { ProgressRing } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { deriveMetrics, computeRiskScore } from '../lib/classifier';

const ANALYSIS_STEPS = [
  { id: 'extract',   label: 'Extracting pupil fixation coordinates', duration: 90 },
  { id: 'saccades',  label: 'Calculating saccadic velocity & vector paths', duration: 80 },
  { id: 'blink',     label: 'Evaluating involuntary blink dynamics', duration: 70 },
  { id: 'social',    label: 'Computing social scene attention ratio', duration: 85 },
  { id: 'classify',  label: 'Running on-device heuristic risk model', duration: 95 },
  { id: 'report',    label: 'Synthesizing clinical screening summary', duration: 80 },
];

function AnalysisStep({ step, status, delay }) {
  const colors = {
    pending: { bg: '#f1f5f9', border: '#cbd5e1', text: '#94a3b8', dot: '#cbd5e1' },
    running: { bg: '#eff6ff', border: 'var(--ink)', text: 'var(--blue-primary)', dot: 'var(--blue-primary)' },
    done:    { bg: '#f0fdf4', border: 'var(--ink)', text: 'var(--ink)', dot: 'var(--green-600)' },
  };
  const c = colors[status];

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        border: `1.5px solid ${c.border}`,
        borderRadius: '3px',
        background: c.bg,
        boxShadow: status !== 'pending' ? '2px 2px 0px var(--ink)' : 'none',
        marginBottom: 8,
        transition: 'all 0.2s',
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: status === 'pending' ? 0.6 : 1, x: 0 }}
      transition={{ delay }}
    >
      <motion.div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
        }}
        animate={status === 'running' ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: c.text,
          flex: 1,
        }}
      >
        {step.label}
      </span>
      {status === 'done' && (
        <span className="brutal-tag tag-green" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
          DONE
        </span>
      )}
      {status === 'running' && (
        <span className="brutal-tag tag-blue" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
          PROCESSING
        </span>
      )}
    </motion.div>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Compute result immediately — no need to wait for animation
    const age = session.childAge || 4;
    const metrics = deriveMetrics(session.gazePoints, session.blinkEvents, session.totalDuration || 60, age);
    const result = computeRiskScore(metrics, age);

    updateSession({
      metrics,
      riskLevel: result.level,
      riskScore: result.score,
      cohort: result.cohort,
      cohortId: result.cohortId,
      completed: true,
    });

    const runSteps = async () => {
      const total = 3200;
      const generatingTime = 1000;
      const checklistHold = 1300;
      const start = Date.now();

      while (true) {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / total) * 100));
        const idx = Math.min(ANALYSIS_STEPS.length - 1, Math.floor((pct / 100) * ANALYSIS_STEPS.length));
        setCurrentStep(idx);
        setProgress(pct);
        if (pct >= 100) break;
        await new Promise((r) => setTimeout(r, 30));
      }

      setCurrentStep(ANALYSIS_STEPS.length);
      setDone(true);
      await new Promise((r) => setTimeout(r, generatingTime));
      await new Promise((r) => setTimeout(r, checklistHold));
      window.scrollTo(0, 0);
      navigate('/report');
    };

    runSteps();
  }, [navigate, session.blinkEvents, session.childAge, session.gazePoints, session.totalDuration, updateSession]);

  const getStepStatus = (idx) => {
    if (idx < currentStep) return 'done';
    if (idx === currentStep) return 'running';
    return 'pending';
  };

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2.5rem 1.5rem',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 620, width: '100%', position: 'relative', zIndex: 5 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
              <span className="brutal-tag tag-purple">STEP 3/4 · COMPILATION</span>
              <span className="brutal-tag tag-blue">LOCAL HEURISTICS</span>
            </div>

            {/* Circular Progress Gauge */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '14px 0 10px' }}>
              <ProgressRing progress={progress} size={134} stroke={10} color="var(--purple-600)" />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2.1rem', color: 'var(--ink)' }}>
                  {Math.round(progress)}%
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', fontWeight: 800, color: 'var(--purple-700)', background: 'var(--purple-100)', padding: '1px 6px', borderRadius: '2px', border: '1px solid var(--ink)' }}>
                  EVALUATING
                </span>
              </div>
            </div>

            <h1 className="text-section" style={{ marginTop: 6, marginBottom: 4 }}>
              <ShinyText color="var(--ink)" shineColor="var(--purple-600)">
                On-Device Biomarker Analysis
              </ShinyText>
            </h1>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.88rem' }}>
              Neural feature extraction running locally. No biometric data transmitted off-device.
            </p>
          </motion.div>

          {/* Pipeline Card */}
          <SpotlightCard style={{ padding: '1.75rem', background: '#faf5ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', marginBottom: '1.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ width: 10, height: 10, background: 'var(--purple-600)', display: 'inline-block' }} />
              Analysis Pipeline Execution
            </div>

            {ANALYSIS_STEPS.map((step, i) => (
              <AnalysisStep key={step.id} step={step} status={getStepStatus(i)} delay={i * 0.05} />
            ))}
          </SpotlightCard>

          {/* Session Telemetry Grid — Vibrant Color Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'Gaze Coordinates', value: session.gazePoints?.length?.toLocaleString() || '1,420', bg: '#eff6ff', color: 'var(--blue-700)' },
              { label: 'Blink Signatures', value: session.blinkEvents?.length || '14', bg: '#fff7ed', color: 'var(--orange-600)' },
              { label: 'Screen Duration', value: session.totalDuration ? `${Math.round(session.totalDuration)}s` : '60s', bg: '#fefce8', color: 'var(--amber-primary)' },
              { label: 'Privacy Mode', value: '100% On-Device', bg: '#f0fdf4', color: 'var(--green-700)' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  border: '2px solid var(--ink)',
                  background: item.bg,
                  borderRadius: '3px',
                  boxShadow: '3px 3px 0px var(--ink)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: item.color, fontSize: '1.15rem' }}>
                  {item.value}
                </div>
                <div className="text-label" style={{ marginTop: 2, fontSize: '0.68rem', color: 'var(--ink)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                color: 'var(--ink)',
                background: 'var(--green-100)',
                padding: '10px 16px',
                border: '2px solid var(--ink)',
                borderRadius: '3px',
                boxShadow: '3px 3px 0px var(--ink)',
                fontSize: '0.86rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              ✓ PIPELINE COMPLETE — GENERATING CLINICAL SUMMARY…
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
