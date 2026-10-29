import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Database, Sliders, CheckCircle2, AlertTriangle, ExternalLink, ChevronUp, FlaskConical } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import { loadResearchModel, runResearchSample } from '../lib/researchModel';
import {
  LaptopCoderMascot,
  KantamRoboMascot,
  ActionPunchMascot,
  CrayonCreatorMascot,
  ShinchanShiroRelaxMascot,
  ComicBgPattern,
} from '../components/shinchan/ShinchanMascots';
import ComicStamp from '../components/shinchan/ComicStamp';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import ThemeToggle from '../components/ThemeToggle';

const percent = (v) => `${(v * 100).toFixed(1)}%`;

const FEATURE_META = {
  accuracy_responded: { label: 'WM Task Accuracy', desc: 'Correct responses on active trials' },
  omission_fraction: { label: 'Omission Rate', desc: 'Unanswered stimulus trials' },
  median_correct_rt_ms: { label: 'Median RT', desc: 'Reaction time on correct trials (ms)' },
  iqr_correct_rt_ms: { label: 'RT Variability', desc: 'Reaction time interquartile range (ms)' },
  high_load_accuracy_cost: { label: 'High Load Cost', desc: 'Accuracy drop under higher load' },
  pupil_iqr_over_median: { label: 'Pupil Fluctuation', desc: 'Normalized pupil dilation variability' },
  gaze_x_iqr_screen_fraction: { label: 'Gaze X Spread', desc: 'Horizontal screen dispersion' },
  gaze_y_iqr_screen_fraction: { label: 'Gaze Y Spread', desc: 'Vertical screen dispersion' },
};

export default function ResearchPage() {
  const navigate = useNavigate();
  const { isShinchanTheme } = useTheme();
  const { session, resetSession } = useSession();

  const handleStartScreening = () => {
    if (session?.completed) {
      resetSession();
    }
    navigate('/consent');
  };
  const [bundle, setBundle] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [activeDeepDive, setActiveDeepDive] = useState(null); // 'biomarkers' | 'weights' | null
  const requestRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const evaluateSample = useCallback(async (modelBundle, sampleId) => {
    if (!modelBundle || !sampleId) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError('');

    try {
      const data = await runResearchSample(modelBundle, sampleId, controller.signal);
      if (!controller.signal.aborted) {
        setResult(data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Inference failed. Please retry.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadResearchModel(controller.signal)
      .then((data) => {
        setBundle(data);
        if (data.records?.length > 0) {
          const firstId = data.records[0].sample_id;
          setSelectedId(firstId);
          evaluateSample(data, firstId);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load research model bundle.');
        }
      });

    return () => {
      controller.abort();
      requestRef.current?.abort();
    };
  }, [retry, evaluateSample]);

  const handleSelectSample = (sampleId) => {
    setSelectedId(sampleId);
    if (bundle) {
      evaluateSample(bundle, sampleId);
    }
  };

  const handleFilterChange = (filterId) => {
    setGroupFilter(filterId);
    const matches = (bundle?.records || []).filter((r) => filterId === 'all' || r.observed_group === filterId);
    if (matches.length > 0 && !matches.some((r) => r.sample_id === selectedId)) {
      handleSelectSample(matches[0].sample_id);
    }
  };

  const handleDownload = () => {
    if (!result || !bundle) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...result,
            evaluation: bundle.evaluation?.results?.logistic_combined_primary,
            attribution: bundle.attribution,
            limitations: bundle.evaluation?.limitations,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gazescreen-research-${selectedId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const records = bundle?.records || [];
  const filteredRecords = records.filter((r) => {
    if (groupFilter !== 'all' && r.observed_group !== groupFilter) return false;
    return true;
  });

  const currentRecord = records.find((r) => r.sample_id === selectedId);
  const primaryMetrics = bundle?.evaluation?.results?.logistic_combined_primary;
  const currentFoldModel = currentRecord && bundle?.fold_models ? bundle.fold_models[String(currentRecord.fold)] : null;

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: isShinchanTheme ? '#FFFEEF' : '#ffffff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <ComicBgPattern variant="doodle" opacity={0.26} />
        {/* Navigation Bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 2rem',
            borderBottom: '2.5px solid var(--ink)',
            background: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/')}
              type="button"
              title="Navigate to Home"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--ink)',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              GAZE<span style={{ color: 'var(--orange-500)' }}>SCREEN</span>
            </button>
            <span style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 700 }}>
              RESEARCH BENCHMARK
            </span>
            <ComicStamp text="47 BENCHMARKS" size="sm" rotate={-1} color="#059669" bgColor="#ECFDF5" />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <ThemeToggle />
            <MotionButton
              variant="coral"
              onClick={handleStartScreening}
              style={{ padding: '6px 14px', fontSize: '0.74rem' }}
            >
              Start Screening →
            </MotionButton>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem 1.5rem 3rem', position: 'relative' }}>
          {/* Kantam Robo — bold decorative right-margin accent from recruitment.githubsrmist.in */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(0.5rem, 2.5vw, 3.5rem)',
              top: '17rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.92,
            }}
          >
            <KantamRoboMascot size={220} alt="Kantam Robo AI Engine" style={{ width: 'clamp(140px, 15vw, 220px)', filter: 'drop-shadow(5px 7px 0px rgba(18,24,38,0.26))' }} />
          </div>

          {/* Action Punch Shinchan — bold decorative left-margin accent */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(0.5rem, 2.5vw, 3.5rem)',
              top: '17rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.92,
            }}
          >
            <ActionPunchMascot size={170} alt="Action Punch Benchmark" style={{ width: 'clamp(120px, 13vw, 180px)', filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.24))' }} />
          </div>
          <div style={{ maxWidth: 1060, margin: '0 auto', position: 'relative', zIndex: 5 }}>
            {/* Shinchan Researcher Lab Note Banner — clean single-mascot composition */}
            {isShinchanTheme && (
              <div
                className="shinchan-hide-mobile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: '1.25rem',
                  padding: '10px 14px',
                  background: '#FEF9C3',
                  border: '2px solid var(--ink)',
                  borderRadius: '4px',
                  boxShadow: '3px 3px 0px var(--ink)',
                }}
              >
                <LaptopCoderMascot size={56} alt="Prof. Shinchan" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.18))' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--ink)', fontWeight: 800 }}>
                    Prof. Shinchan's Lab Benchmark Note:
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)', lineHeight: 1.35 }}>
                    Trained on real EyeLink 1000 infrared pupillometry data (47 children aged 8–13) across validated clinical folds!
                  </div>
                </div>
              </div>
            )}

            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <span className="brutal-tag tag-purple" style={{ fontSize: '0.66rem', padding: '2px 8px' }}>
                  5-FOLD HELD-OUT CROSS VALIDATION
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <a
                    href="https://www.nature.com/articles/s41597-019-0037-2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-tag tag-green"
                    style={{ textDecoration: 'none', fontSize: '0.68rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <FileText size={11} strokeWidth={2.5} />
                    <span>Reference PDF</span>
                    <ExternalLink size={10} strokeWidth={2.5} />
                  </a>
                  <a
                    href="https://www.nature.com/articles/s41597-019-0037-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-tag tag-blue"
                    style={{ textDecoration: 'none', fontSize: '0.68rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <BookOpen size={11} strokeWidth={2.5} />
                    <span>Article</span>
                    <ExternalLink size={10} strokeWidth={2.5} />
                  </a>
                  <a
                    href="https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-tag tag-yellow"
                    style={{ textDecoration: 'none', fontSize: '0.68rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Database size={11} strokeWidth={2.5} />
                    <span>Dataset</span>
                    <ExternalLink size={10} strokeWidth={2.5} />
                  </a>
                </div>
              </div>

              <h1 className="text-section" style={{ fontSize: '1.8rem', marginBottom: 4 }}>
                <ShinyText color="var(--ink)" shineColor="var(--blue-600)" speed={3.5}>
                  Laboratory Research Model
                </ShinyText>
              </h1>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.88rem', maxWidth: 780, lineHeight: 1.55 }}>
                Evaluated on the EyeLink 1000 working-memory study (<a href="https://www.nature.com/articles/s41597-019-0037-2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-700)', fontWeight: 700, textDecoration: 'underline' }}>Rojas-Líbano et al., 2019</a>, <em>Scientific Data</em>) from the open <a href="https://figshare.com/articles/dataset/ADHD_Pupil_Size_Dataset/7218725/3?file=14298953" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-700)', fontWeight: 700, textDecoration: 'underline' }}>ADHD Pupil Size & Eye-Tracking Dataset</a> on Figshare. Captures trial-by-trial pupil size dilation time-series, fixation dispersion, and response dynamics across 47 participants. Select any participant below to view measured features and held-out prediction.
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fee2e2',
                  border: '2px solid var(--ink)',
                  borderRadius: '3px',
                  boxShadow: '2.5px 2.5px 0px var(--ink)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: '#b91c1c', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} strokeWidth={2.5} /> {error}
                </span>
                <button
                  onClick={() => {
                    setError('');
                    setRetry((x) => x + 1);
                  }}
                  className="brutal-btn brutal-btn-outline"
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {!bundle && !error && (
              <SpotlightCard style={{ padding: '2rem', textAlign: 'center', border: '2.5px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Loading research model weights & 47 participant records…
                </div>
              </SpotlightCard>
            )}

            {bundle && primaryMetrics && (
              <>
                {/* Clean Low-Profile Benchmark Metric Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    background: '#ffffff',
                    border: '2px solid var(--ink)',
                    borderRadius: '4px',
                    boxShadow: '3px 3px 0px var(--ink)',
                    marginBottom: '1.5rem',
                    overflow: 'hidden',
                  }}
                >
                  {[
                    { label: 'CV ACCURACY', val: percent(primaryMetrics.accuracy), sub: '34 / 47', color: 'var(--green-700)' },
                    { label: 'SENSITIVITY', val: percent(primaryMetrics.sensitivity), sub: '15 / 26 ADHD', color: 'var(--blue-700)' },
                    { label: 'SPECIFICITY', val: percent(primaryMetrics.specificity), sub: '19 / 21 Control', color: 'var(--purple-700)' },
                    { label: 'ROC-AUC', val: primaryMetrics.roc_auc.toFixed(3), sub: '5-Fold CV', color: 'var(--amber-primary)' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRight: i < 3 ? '1.5px solid #e2e8f0' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 800, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>
                        {stat.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 900, color: stat.color, lineHeight: 1.15, margin: '2px 0' }}>
                        {stat.val}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)' }}>
                        {stat.sub}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Main Interactive Inspector Card */}
                <SpotlightCard
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: '#ffffff',
                    border: '2.5px solid var(--ink)',
                    boxShadow: '4px 4px 0px var(--ink)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {/* Top Control Bar: Cohort Tabs + Dropdown Selector */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 16,
                      paddingBottom: 14,
                      borderBottom: '1.5px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--ink-muted)', marginRight: 2 }}>
                        FILTER:
                      </span>
                      {[
                        { id: 'all', label: `All (${records.length})` },
                        { id: 'ADHD', label: 'ADHD (26)' },
                        { id: 'control', label: 'Control (21)' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleFilterChange(tab.id)}
                          style={{
                            background: groupFilter === tab.id ? 'var(--ink)' : '#f1f5f9',
                            color: groupFilter === tab.id ? '#ffffff' : 'var(--ink)',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '3px',
                            padding: '3px 9px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ minWidth: 260, flex: 1, maxWidth: 360 }}>
                      <select
                        value={selectedId}
                        disabled={busy || filteredRecords.length === 0}
                        onChange={(e) => handleSelectSample(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '2px solid var(--ink)',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          background: '#ffffff',
                          boxShadow: '2px 2px 0px var(--ink)',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {filteredRecords.map((r) => (
                          <option key={r.sample_id} value={r.sample_id}>
                            {r.sample_id} · Age {r.age}y ({r.observed_group === 'ADHD' ? 'ADHD' : 'Control'}, Fold {r.fold})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2-Column Inspector: Measurements (Left) vs Inference (Right) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
                    {/* Left: Extracted Physiological Measurements */}
                    <div>
                      {/* Compact Subject Badge */}
                      {currentRecord && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: '#f8fafc',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            marginBottom: 10,
                          }}
                        >
                          <span>Age: <strong>{currentRecord.age}y</strong></span>
                          <span>Held-Out: <strong>Fold {currentRecord.fold}</strong></span>
                          <span>Valid Gaze: <strong style={{ color: 'var(--green-700)' }}>{percent(currentRecord.quality.gaze_valid_fraction)}</strong></span>
                        </div>
                      )}

                      {/* Clean Flat Features Table */}
                      <div style={{ border: '1.5px solid var(--ink)', borderRadius: '3px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                          <tbody>
                            {currentRecord &&
                              Object.entries(currentRecord.features).map(([name, val], idx) => (
                                <tr
                                  key={name}
                                  style={{
                                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                    borderBottom: idx < 7 ? '1px solid #e2e8f0' : 'none',
                                  }}
                                >
                                  <td style={{ padding: '6px 10px', color: 'var(--ink)', fontWeight: 600 }}>
                                    {FEATURE_META[name]?.label || name}
                                  </td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--ink)' }}>
                                    {typeof val === 'number' ? (Math.abs(val) < 1 ? val.toFixed(3) : val.toFixed(1)) : val}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Held-Out Model Inference & Verdict */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {busy && (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', border: '1.5px solid var(--ink)', background: '#fffbeb', borderRadius: '3px', marginBottom: 12 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--orange-600)' }}>
                              Evaluating Fold {currentRecord?.fold} Model…
                            </span>
                          </div>
                        )}

                        {result && !busy && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Match Result Banner */}
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: '3px',
                                border: '2px solid var(--ink)',
                                background: result.correct ? '#dcfce7' : '#fef3c7',
                                color: result.correct ? '#15803d' : '#b45309',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                boxShadow: '2px 2px 0px var(--ink)',
                                marginBottom: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                {result.correct ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertTriangle size={14} strokeWidth={2.5} />}
                                <span>{result.correct ? 'MATCH' : 'MISCLASSIFIED'}</span>
                              </span>
                              <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>
                                {result.correct
                                  ? 'Prediction matches documented study diagnosis.'
                                  : `Classified as ${result.research_class} (${result.observed_group === 'ADHD' ? 'False Negative' : 'False Positive'}).`}
                              </span>
                            </div>

                            {/* Comparison Side-by-Side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                              <div style={{ padding: '8px 10px', border: '1.5px solid var(--ink)', borderRadius: '3px', background: '#eff6ff' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800, color: 'var(--ink-muted)' }}>
                                  STUDY GROUND TRUTH
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.05rem', color: 'var(--blue-700)', marginTop: 2 }}>
                                  {result.observed_group === 'ADHD' ? 'ADHD' : 'Control'}
                                </div>
                              </div>

                              <div
                                style={{
                                  padding: '8px 10px',
                                  border: '1.5px solid var(--ink)',
                                  borderRadius: '3px',
                                  background: result.research_class === 'ADHD' ? '#fee2e2' : '#f0fdf4',
                                }}
                              >
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800, color: 'var(--ink-muted)' }}>
                                  HELD-OUT PREDICTION
                                </div>
                                <div
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 900,
                                    fontSize: '1.05rem',
                                    color: result.research_class === 'ADHD' ? '#b91c1c' : '#15803d',
                                    marginTop: 2,
                                  }}
                                >
                                  {result.research_class === 'ADHD' ? 'ADHD' : 'Control'}
                                </div>
                              </div>
                            </div>

                            {/* Probability Gauge Bar */}
                            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1.5px solid var(--ink)', borderRadius: '3px', marginBottom: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginBottom: 4 }}>
                                <span style={{ color: 'var(--ink-secondary)' }}>Sigmoid Score:</span>
                                <strong style={{ color: 'var(--ink)' }}>{result.model_score.toFixed(4)}</strong>
                              </div>
                              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${Math.min(100, Math.max(0, result.model_score * 100))}%`,
                                    height: '100%',
                                    background: result.model_score >= 0.5 ? 'var(--red-primary)' : 'var(--green-600)',
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-muted)', marginTop: 3 }}>
                                <span>0.00 (Control)</span>
                                <span>0.50 (Cutoff)</span>
                                <span>1.00 (ADHD)</span>
                              </div>
                            </div>

                            <p style={{ fontSize: '0.7rem', color: 'var(--ink-secondary)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                              Participant {currentRecord?.participant_id} was strictly held out during training of the Fold {currentRecord?.fold} model.
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Export Button with Shinchan & Shiro relaxing mascot */}
                      {result && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={handleDownload}
                            className="brutal-btn"
                            style={{
                              flex: 1,
                              padding: '8px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              background: 'var(--yellow-300)',
                              border: '1.5px solid var(--ink)',
                              boxShadow: '2px 2px 0px var(--ink)',
                              cursor: 'pointer',
                            }}
                          >
                            Export Participant JSON Telemetry
                          </button>
                          <div className="shinchan-hide-mobile" style={{ flexShrink: 0 }}>
                            <ShinchanShiroRelaxMascot size={64} alt="Shinchan and Shiro Relaxing" style={{ filter: 'drop-shadow(2px 2.5px 0px rgba(18,24,38,0.22))' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SpotlightCard>

                {/* Decluttered Deep-Dive Section Toggle */}
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      background: '#ffffff',
                      border: '2px solid var(--ink)',
                      borderRadius: '4px',
                      boxShadow: '2.5px 2.5px 0px var(--ink)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDeepDive(activeDeepDive === 'biomarkers' ? null : 'biomarkers')}
                      style={{
                        padding: '7px 16px',
                        background: activeDeepDive === 'biomarkers' ? 'var(--blue-600)' : '#ffffff',
                        color: activeDeepDive === 'biomarkers' ? '#ffffff' : 'var(--ink)',
                        border: 'none',
                        borderRight: '1.5px solid var(--ink)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {activeDeepDive === 'biomarkers' ? <ChevronUp size={13} strokeWidth={2.5} /> : <BookOpen size={13} strokeWidth={2.5} />}
                      <span>{activeDeepDive === 'biomarkers' ? 'Hide Biomarker Guide' : 'Biomarker Guide'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDeepDive(activeDeepDive === 'weights' ? null : 'weights')}
                      style={{
                        padding: '7px 16px',
                        background: activeDeepDive === 'weights' ? 'var(--blue-600)' : '#ffffff',
                        color: activeDeepDive === 'weights' ? '#ffffff' : 'var(--ink)',
                        border: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {activeDeepDive === 'weights' ? <ChevronUp size={13} strokeWidth={2.5} /> : <Sliders size={13} strokeWidth={2.5} />}
                      <span>{activeDeepDive === 'weights' ? 'Hide Fold Weights' : 'Learned Weights & Coefficients'}</span>
                    </button>
                  </div>
                </div>

                {/* Deep Dive Panel Drawer */}
                <AnimatePresence>
                  {activeDeepDive === 'biomarkers' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{
                        background: '#ffffff',
                        border: '2px solid var(--ink)',
                        borderRadius: '4px',
                        boxShadow: '3px 3px 0px var(--ink)',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 900, color: 'var(--blue-700)', marginBottom: 10 }}>
                        BIOMARKER DICTIONARY & CLINICAL INTERPRETATION
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, fontSize: '0.78rem', color: 'var(--ink)' }}>
                        <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                          <strong>1. RT Variability (`iqr_correct_rt_ms`):</strong> Spread of response times. Children with ADHD show higher variability (fast impulsive answers alternating with attentional lapses). <em>#1 predictor (AUC ~0.80 alone).</em>
                        </div>
                        <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                          <strong>2. Omission Rate (`omission_fraction`):</strong> Percentage of trials timed out with zero response. Reflects transient prefrontal lapses in attentional engagement.
                        </div>
                        <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                          <strong>3. Pupil Fluctuation (`pupil_iqr_over_median`):</strong> Measured at 1,000 Hz. Quantifies autonomic arousal instability in the locus coeruleus norepinephrine (LC-NE) pathway during working memory retention.
                        </div>
                        <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                          <strong>4. Gaze Dispersion (`gaze_x_spread` & `gaze_y_spread`):</strong> How widely eye positions wander across screen rather than maintaining steady fixation during retention intervals.
                        </div>
                        <div style={{ padding: '8px 10px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '3px', gridColumn: '1 / -1' }}>
                          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <FlaskConical size={13} style={{ color: 'var(--blue-700)' }} />
                            <span>Relation to 60s Webcam Screening:</span>
                          </strong> The laboratory model uses 1,000 Hz infrared hardware on a 160-trial task. GazeScreen translates these same neuro-visual principles (fixation stability, saccade restlessness, gaze dispersion) onto standard mobile cameras using MediaPipe face mesh, benchmarked against the 1,246-subject HBN dataset.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeDeepDive === 'weights' && currentFoldModel && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{
                        background: '#ffffff',
                        border: '2px solid var(--ink)',
                        borderRadius: '4px',
                        boxShadow: '3px 3px 0px var(--ink)',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="shinchan-hide-mobile">
                            <CrayonCreatorMascot size={38} alt="Crayon model sketcher" style={{ filter: 'drop-shadow(1.5px 2px 0px rgba(18,24,38,0.2))' }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 900, color: 'var(--ink)' }}>
                            FOLD {currentRecord?.fold} MODEL COEFFICIENTS (L2-Regularized, C=0.1)
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
                          Intercept (bias): {currentFoldModel.intercept.toFixed(3)}
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', border: '1px solid #e2e8f0' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--ink)' }}>
                              <th style={{ textAlign: 'left', padding: '5px 8px' }}>Feature Name</th>
                              <th style={{ textAlign: 'right', padding: '5px 8px' }}>Mean</th>
                              <th style={{ textAlign: 'right', padding: '5px 8px' }}>Scale</th>
                              <th style={{ textAlign: 'right', padding: '5px 8px' }}>Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentFoldModel.feature_names.map((name, i) => (
                              <tr key={name} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{name}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--ink-secondary)' }}>{currentFoldModel.mean[i].toFixed(3)}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--ink-secondary)' }}>{currentFoldModel.scale[i].toFixed(3)}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 800, color: currentFoldModel.coefficients[i] > 0 ? '#b91c1c' : '#15803d' }}>
                                  {currentFoldModel.coefficients[i] > 0 ? '+' : ''}
                                  {currentFoldModel.coefficients[i].toFixed(3)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
