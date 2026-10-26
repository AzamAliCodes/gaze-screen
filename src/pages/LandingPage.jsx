import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';

/* ── Interactive Clinical Eye Icon with Synchronized Shiny Flare & Floating Motion ── */
function EyeLogo() {
  return (
    <motion.div
      style={{ position: 'relative', width: 90, height: 90, margin: '0 auto' }}
      whileHover={{ scale: 1.08 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        scale: { type: 'spring', stiffness: 350, damping: 20 },
      }}
    >
      {/* Outer Optical Radar Flare Aura */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -7,
          borderRadius: '50%',
          border: '2px dashed rgba(37, 99, 235, 0.45)',
          pointerEvents: 'none',
        }}
        animate={{ rotate: 360, scale: [0.97, 1.05, 0.97] }}
        transition={{
          rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Main Eye Container */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: '#ffffff',
          border: '3px solid var(--ink)',
          boxShadow: '4px 4px 0px var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Synchronized Shiny Flare Beam (Identical to GAZESCREEN title) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-100%',
              background:
                'linear-gradient(120deg, transparent 38%, rgba(37, 99, 235, 0.28) 46%, rgba(96, 165, 250, 0.8) 50%, rgba(37, 99, 235, 0.28) 54%, transparent 62%)',
              backgroundSize: '220% 100%',
              animation: 'shiny-sweep 3.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Clinical Eye SVG */}
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.8"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3.6" stroke="var(--ink)" strokeWidth="2" fill="#f8fafc" />
          <motion.circle
            cx="12"
            cy="12"
            r="2.1"
            fill="var(--blue-600)"
            animate={{
              scale: [1, 1.35, 1],
              fill: ['var(--blue-600)', '#60a5fa', 'var(--blue-600)'],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Twinkle Specular Glint */}
          <motion.circle
            cx="13.1"
            cy="10.9"
            r="0.8"
            fill="#ffffff"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
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
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ fontSize: '0.95rem', padding: '14px 26px' }}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
              >
                How It Works
              </MotionButton>
              <MotionButton
                variant="yellow"
                onClick={() => navigate('/research')}
                style={{ fontSize: '0.95rem', padding: '14px 28px' }}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                }
              >
                Explore Research Model
              </MotionButton>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
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
                4 Simple Steps.
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
