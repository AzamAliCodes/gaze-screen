import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import DecryptedText from '../components/DecryptedText';
import { LiveDot } from '../components/UI';

/* ── Interactive Clinical Eye Icon ── */
function EyeLogo() {
  return (
    <motion.div
      style={{ position: 'relative', width: 84, height: 84, margin: '0 auto' }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
    >
      {/* Outer subtle radar ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          border: '2px dashed #94a3b8',
          opacity: 0.4,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main Eye Container */}
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          background: '#ffffff',
          border: '3px solid var(--ink)',
          boxShadow: '4px 4px 0px var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3.5" stroke="var(--ink)" strokeWidth="2" fill="#f8fafc" />
          <motion.circle
            cx="12"
            cy="12"
            r="1.8"
            fill="var(--blue-600)"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: '2px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--yellow-400)',
                boxShadow: '2.5px 2.5px 0px var(--ink)',
                borderRadius: '3px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" fill="var(--ink)" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--ink)',
                fontSize: '1.05rem',
                letterSpacing: '0.04em',
              }}
            >
              GAZE<span style={{ color: 'var(--orange-500)' }}>SCREEN</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="brutal-tag tag-blue">HealthTech</span>
            <span className="brutal-tag tag-pink">Pediatric Screening</span>
            <span className="brutal-tag tag-yellow">Digital Biomarker</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                border: '1.5px solid var(--ink)',
                borderRadius: '3px',
                background: '#ffffff',
                boxShadow: '2px 2px 0px var(--ink)',
              }}
            >
              <LiveDot />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink)' }}>
                ON-DEVICE ML
              </span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 1.5rem 2.5rem',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ maxWidth: 840, width: '100%', textAlign: 'center' }}>
            <EyeLogo />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ marginTop: '1.75rem' }}
            >
              <div style={{ display: 'inline-flex', marginBottom: 14 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '6px 14px',
                    background: 'var(--yellow-100)',
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    boxShadow: '2.5px 2.5px 0px var(--ink)',
                    color: 'var(--ink)',
                  }}
                >
                  <DecryptedText text="GAZESCREEN · DIGITAL BIOMARKER ENGINE" speed={25} />
                </span>
              </div>

              <h1 className="text-display" style={{ marginBottom: 10 }}>
                <ShinyText color="var(--ink)" shineColor="var(--blue-600)" speed={3.5}>
                  GAZESCREEN
                </ShinyText>
              </h1>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--orange-600)',
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.01em',
                  display: 'inline-block',
                  background: 'var(--orange-50)',
                  padding: '4px 12px',
                  border: '1.5px solid var(--orange-400)',
                  borderRadius: '3px',
                }}
              >
                Front-Camera Screening Aid for Pediatric ASD & ADHD
              </div>

              <p
                style={{
                  maxWidth: 640,
                  margin: '0 auto 2.25rem',
                  color: 'var(--ink-secondary)',
                  fontSize: '0.98rem',
                  lineHeight: 1.7,
                }}
              >
                A free, 60-second, privacy-first pediatric screening tool. Uses standard smartphone
                front cameras to measure involuntary gaze fixations and blink metrics — computed
                100% on-device. Zero video leaves the phone.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}
            >
              <MotionButton
                variant="coral"
                onClick={() => navigate('/consent')}
                style={{ fontSize: '0.95rem', padding: '14px 34px' }}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              >
                Start Screening Now
              </MotionButton>
              <MotionButton
                variant="blue"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                style={{ fontSize: '0.95rem', padding: '14px 26px' }}
              >
                How It Works
              </MotionButton>
            </motion.div>

            {/* Stats Spotlight Grid — Neo-Brutalist Color Blocks */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 16,
                maxWidth: 760,
                margin: '0 auto',
              }}
            >
              {[
                { val: '60s', label: 'Session Time', bg: '#fff7ed', color: 'var(--orange-600)', border: 'var(--orange-400)' },
                { val: '100%', label: 'On-Device ML', bg: '#eff6ff', color: 'var(--blue-600)', border: 'var(--blue-400)' },
                { val: '0 kb', label: 'Data Uploaded', bg: '#faf5ff', color: 'var(--purple-600)', border: 'var(--purple-400)' },
                { val: 'All Ages', label: 'Any Age Group', bg: '#fefce8', color: 'var(--amber-primary)', border: 'var(--yellow-400)' },
              ].map((s, i) => (
                <SpotlightCard
                  key={i}
                  style={{
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    background: s.bg,
                    border: '2.5px solid var(--ink)',
                    boxShadow: '4px 4px 0px var(--ink)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      fontSize: s.val.length > 5 ? '1.55rem' : '1.85rem',
                      color: s.color,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.val}
                  </div>
                  <div className="text-label" style={{ marginTop: 6, color: 'var(--ink)' }}>
                    {s.label}
                  </div>
                </SpotlightCard>
              ))}
            </motion.div>
          </div>
        </main>

        {/* Feature Cards Section */}
        <section
          style={{
            padding: '3.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: '#fafaf9',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="brutal-tag tag-dark" style={{ marginBottom: 8 }}>
                Technical Architecture
              </span>
              <h2 className="text-section" style={{ marginTop: 6 }}>
                Clinically Informed, Privacy-First
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 20,
              }}
            >
              <SpotlightCard style={{ padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--green-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--green-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-green">Optical Engine</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Front-Camera Iris Tracking
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  MediaPipe Face Mesh computes pupil positions, fixation durations, and saccades directly in the browser.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--purple-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--purple-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <line x1="9" y1="1" x2="9" y2="4" />
                    <line x1="15" y1="1" x2="15" y2="4" />
                    <line x1="9" y1="20" x2="9" y2="23" />
                    <line x1="15" y1="20" x2="15" y2="23" />
                    <line x1="20" y1="9" x2="23" y2="9" />
                    <line x1="20" y1="14" x2="23" y2="14" />
                    <line x1="1" y1="9" x2="4" y2="9" />
                    <line x1="1" y1="14" x2="4" y2="14" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-purple">Edge Heuristics</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Local Neural Classifier
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Calculates composite Z-scores against published normative baselines without server dependencies.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--blue-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--blue-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-blue">Zero Telemetry</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Complete Privacy Guard
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Zero frames recorded or transmitted off-device. Fully aligns with pediatric data protection guidelines.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--yellow-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--amber-primary)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-yellow">Clinical Synthesis</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Plain-Language Report
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Categorizes directional risk (Low / Moderate / Elevated) with actionable guidance for pediatrician consultation.
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          style={{
            padding: '3.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: '#ffffff',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="brutal-tag tag-orange" style={{ marginBottom: 8 }}>
                Workflow Pipeline
              </span>
              <h2 className="text-section" style={{ marginTop: 6 }}>
                4 Steps. 90 Seconds. Zero Friction.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { num: '01', title: 'Parental Consent & Age Selection', desc: 'Confirm parental authorization, participant age, and clinical privacy consent.', color: 'var(--orange-500)', bg: '#fff7ed' },
                { num: '02', title: 'Optical & Reticle Calibration', desc: 'Verify ambient lighting, face framing, and real-time iris contrast centering.', color: 'var(--blue-600)', bg: '#eff6ff' },
                { num: '03', title: '60s Dual-Stimulus Protocol', desc: 'Child watches alternating social scenes and geometric fractal patterns to capture reflexive gaze preference.', color: 'var(--purple-600)', bg: '#faf5ff' },
                { num: '04', title: 'Instant Comprehensive Report', desc: 'Instant on-device risk assessment, behavioral radar profile, and printable clinician summary.', color: 'var(--green-600)', bg: '#f0fdf4' },
              ].map((step, idx) => (
                <SpotlightCard
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '1.25rem 1.5rem',
                    background: step.bg,
                    border: '2.5px solid var(--ink)',
                    boxShadow: '4px 4px 0px var(--ink)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      border: '2px solid var(--ink)',
                      borderRadius: '3px',
                      background: step.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      fontSize: '1rem',
                      flexShrink: 0,
                      boxShadow: '2px 2px 0px var(--ink)',
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.98rem', marginBottom: 2 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                      {step.desc}
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Clinical Disclaimer Footer */}
        <footer
          style={{
            padding: '2.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: 'var(--yellow-50)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ maxWidth: 940, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <span className="brutal-tag tag-yellow" style={{ flexShrink: 0, marginTop: 2, padding: '5px 10px', fontSize: '0.74rem' }}>
              ⚠ MANDATORY MEDICAL DISCLAIMER
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.7, margin: 0, flex: 1 }}>
              GazeScreen is an <strong style={{ color: 'var(--ink)' }}>early screening aid, not a formal diagnostic tool</strong>.
              Results are generated via experimental digital biomarker patterns and do not substitute for comprehensive neurodevelopmental
              assessment by a licensed developmental pediatrician or child psychologist.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
