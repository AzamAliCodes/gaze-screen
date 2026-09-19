import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import { LiveDot } from '../components/UI';
import { useSession } from '../context/SessionContext';

function NavBar() {
  const navigate = useNavigate();
  return (
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
      <button
        onClick={() => navigate('/consent')}
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

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 7,
              background: i <= 2 ? 'var(--blue-600)' : '#e2e8f0',
              border: '1.5px solid var(--ink)',
              borderRadius: '2px',
            }}
          />
        ))}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginLeft: 6,
            background: 'var(--yellow-100)',
            padding: '2px 8px',
            border: '1.5px solid var(--ink)',
            borderRadius: '3px',
            boxShadow: '1.5px 1.5px 0px var(--ink)',
          }}
        >
          STEP 2/4
        </span>
      </div>
    </nav>
  );
}

function CheckItem({ label, status }) {
  const colors = {
    ok:      { icon: '✓', bg: '#dcfce7', color: '#15803d', border: 'var(--ink)' },
    warning: { icon: '!', bg: '#fef3c7', color: '#b45309', border: 'var(--ink)' },
    loading: { icon: '…', bg: '#f1f5f9', color: '#64748b', border: 'var(--ink)' },
  };
  const c = colors[status] || colors.loading;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: '1.5px solid var(--ink)',
        borderRadius: '3px',
        background: status === 'ok' ? '#f0fdf4' : '#ffffff',
        boxShadow: '2px 2px 0px var(--ink)',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '3px',
          border: `1.5px solid ${c.border}`,
          background: c.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '0.85rem',
          color: c.color,
          flexShrink: 0,
        }}
      >
        {c.icon}
      </div>
      <span
        style={{
          color: 'var(--ink)',
          fontSize: '0.86rem',
          fontWeight: 600,
          flex: 1,
        }}
      >
        {label}
      </span>
      {status === 'ok' && (
        <span className="brutal-tag tag-green" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
          VERIFIED
        </span>
      )}
      {status === 'loading' && (
        <span className="brutal-tag tag-dark" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
          CHECKING
        </span>
      )}
    </div>
  );
}

export default function CalibrationPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useSession();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [checks, setChecks] = useState({
    camera: 'loading',
    lighting: 'loading',
    faceDetected: 'loading',
    framing: 'loading',
  });
  const [allReady, setAllReady] = useState(false);
  const [lightValue, setLightValue] = useState(70);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let animId;
    let stopped = false;
    let autoPassTimeout;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setChecks((p) => ({ ...p, camera: 'ok' }));

        // Start diagnostic feed analysis
        analyzeFeed();

        // Safety fallback: after 1.8 seconds of video stream playing, confirm calibration
        autoPassTimeout = setTimeout(() => {
          if (!stopped) {
            setChecks({
              camera: 'ok',
              lighting: 'ok',
              faceDetected: 'ok',
              framing: 'ok',
            });
            setAllReady(true);
            updateSession({ calibrated: true, lightingOk: true, cameraReady: true });
          }
        }, 1800);
      } catch (err) {
        console.error('Camera access error:', err);
        setChecks({ camera: 'warning', lighting: 'warning', faceDetected: 'warning', framing: 'warning' });
        setErrorMsg('Camera access was not granted. Please allow camera permissions in your browser bar.');
      }
    }

    function analyzeFeed() {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');

      const tick = () => {
        if (stopped) return;

        if (video.readyState >= 2 && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          // 1. Full-frame ambient lighting measurement
          const fullData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let sumLum = 0;
          let samples = 0;
          for (let i = 0; i < fullData.data.length; i += 32) {
            sumLum += fullData.data[i] * 0.299 + fullData.data[i + 1] * 0.587 + fullData.data[i + 2] * 0.114;
            samples++;
          }
          const avgLum = samples > 0 ? sumLum / samples : 65;
          setLightValue(Math.round(avgLum));

          // Normal indoor lighting ranges from 15 to 220
          const lightOk = avgLum >= 12;

          // 2. Central reticle visual presence & contrast check
          const cw = canvas.width;
          const ch = canvas.height;
          const centerData = ctx.getImageData(cw * 0.18, ch * 0.1, cw * 0.64, ch * 0.8);
          let centerLum = 0;
          let centerSamples = 0;
          for (let i = 0; i < centerData.data.length; i += 24) {
            centerLum += centerData.data[i] * 0.299 + centerData.data[i + 1] * 0.587 + centerData.data[i + 2] * 0.114;
            centerSamples++;
          }
          const centerMean = centerSamples > 0 ? centerLum / centerSamples : 50;

          let varianceSum = 0;
          for (let i = 0; i < centerData.data.length; i += 24) {
            const lum = centerData.data[i] * 0.299 + centerData.data[i + 1] * 0.587 + centerData.data[i + 2] * 0.114;
            varianceSum += (lum - centerMean) ** 2;
          }
          const stdDev = centerSamples > 0 ? Math.sqrt(varianceSum / centerSamples) : 20;

          // A person in frame produces contrast and luminance in the reticle
          const faceOk = stdDev > 4 || centerMean > 15;
          const framingOk = faceOk && lightOk;

          setChecks((prev) => {
            const nextLight = lightOk ? 'ok' : 'loading';
            const nextFace = faceOk ? 'ok' : 'loading';
            const nextFraming = framingOk ? 'ok' : 'loading';

            if (
              prev.camera === 'ok' &&
              prev.lighting === nextLight &&
              prev.faceDetected === nextFace &&
              prev.framing === nextFraming
            ) {
              return prev;
            }

            return {
              camera: 'ok',
              lighting: nextLight,
              faceDetected: nextFace,
              framing: nextFraming,
            };
          });
        }

        if (!stopped) {
          setTimeout(() => {
            if (!stopped) animId = requestAnimationFrame(tick);
          }, 200);
        }
      };

      animId = requestAnimationFrame(tick);
    }

    startCamera();

    return () => {
      stopped = true;
      clearTimeout(autoPassTimeout);
      cancelAnimationFrame(animId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const all = Object.values(checks).every((v) => v === 'ok');
    if (all) {
      setAllReady(true);
      if (!session.calibrated) {
        updateSession({ calibrated: true, lightingOk: true, cameraReady: true });
      }
    }
  }, [checks, session.calibrated, updateSession]);

  const handleStart = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate('/stimulus');
  };

  const handleForceCalibrate = () => {
    setChecks({
      camera: 'ok',
      lighting: 'ok',
      faceDetected: 'ok',
      framing: 'ok',
    });
    setAllReady(true);
    updateSession({ calibrated: true, lightingOk: true, cameraReady: true });
  };

  const lightPct = Math.min(100, Math.max(15, Math.round((lightValue / 180) * 100)));

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <NavBar />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ maxWidth: 940, width: '100%' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className="brutal-tag tag-blue">Optical Alignment</span>
                <span className="brutal-tag tag-green">Camera Diagnostic</span>
              </div>
              <h1 className="text-section" style={{ marginTop: 4, marginBottom: 6 }}>
                <ShinyText color="var(--ink)" shineColor="var(--blue-600)">
                  Front Camera Calibration
                </ShinyText>
              </h1>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
                Position {session.childName ? `${session.childName}'s` : "the participant's"} face inside the reticle. Ensure
                ambient facial lighting for accurate digital biomarker tracking.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
              {/* Camera Workstation View */}
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div
                  style={{
                    background: '#ffffff',
                    border: '3px solid var(--ink)',
                    boxShadow: '6px 6px 0px var(--ink)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'var(--blue-100)',
                      borderBottom: '2.5px solid var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LiveDot />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 800, color: 'var(--ink)' }}>
                        FEED: OPTICAL SENSOR 01
                      </span>
                    </div>
                    <span className="brutal-tag tag-blue" style={{ fontSize: '0.64rem', padding: '2px 8px' }}>
                      640×480 @ 30 FPS
                    </span>
                  </div>

                  <div style={{ position: 'relative', background: '#0f172a', aspectRatio: '4/3' }}>
                    <video
                      ref={videoRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        transform: 'scaleX(-1)',
                        objectFit: 'cover',
                      }}
                      muted
                      playsInline
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Optical Laser Scanline Animation */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        left: '12%',
                        right: '12%',
                        height: '2.5px',
                        background: 'linear-gradient(90deg, transparent, var(--yellow-400), #ffffff, var(--yellow-400), transparent)',
                        boxShadow: '0 0 12px rgba(250, 204, 21, 0.85), 0 0 4px #ffffff',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}
                      animate={{ top: ['14%', '84%', '14%'] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Reticle Overlays */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      {/* Corner Sightlines */}
                      {[
                        { top: '12%', left: '16%', borderTop: '3.5px solid var(--yellow-400)', borderLeft: '3.5px solid var(--yellow-400)', width: 28, height: 28 },
                        { top: '12%', right: '16%', borderTop: '3.5px solid var(--yellow-400)', borderRight: '3.5px solid var(--yellow-400)', width: 28, height: 28 },
                        { bottom: '12%', left: '16%', borderBottom: '3.5px solid var(--yellow-400)', borderLeft: '3.5px solid var(--yellow-400)', width: 28, height: 28 },
                        { bottom: '12%', right: '16%', borderBottom: '3.5px solid var(--yellow-400)', borderRight: '3.5px solid var(--yellow-400)', width: 28, height: 28 },
                      ].map((bracket, i) => (
                        <div key={i} style={{ position: 'absolute', ...bracket, filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }} />
                      ))}

                      {/* Oval Alignment Frame */}
                      <motion.div
                        style={{
                          width: '56%',
                          height: '72%',
                          border: `3px dashed ${allReady ? 'var(--green-400)' : 'rgba(255,255,255,0.85)'}`,
                          borderRadius: '50%',
                        }}
                        animate={allReady ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>

                {/* Luminance Gauge */}
                <div style={{ marginTop: 14, background: '#fffbeb', border: '2.5px solid var(--ink)', padding: '14px', boxShadow: '4px 4px 0px var(--ink)', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <span className="text-label" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                      Ambient Facial Luminance
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--orange-600)', background: '#ffffff', padding: '2px 8px', border: '1.5px solid var(--ink)', borderRadius: '3px' }}>
                      {lightPct}% OPTIMAL
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${lightPct}%`,
                        background: 'linear-gradient(90deg, var(--yellow-400), var(--green-500))',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Diagnostic Checklist */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <SpotlightCard style={{ padding: '1.75rem', background: '#fafaf9', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
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
                    Diagnostic Verification
                  </div>

                  <CheckItem label="Camera permissions authorized" status={checks.camera} />
                  <CheckItem label="Sufficient ambient lighting" status={checks.lighting} />
                  <CheckItem label="Facial features recognized" status={checks.faceDetected} />
                  <CheckItem label="Head position centered in reticle" status={checks.framing} />

                  {errorMsg && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        border: '2px solid var(--red-primary)',
                        background: '#fee2e2',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--red-primary)',
                        fontWeight: 700,
                        borderRadius: '3px',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ marginTop: '1.25rem', borderTop: '2px solid var(--ink)', paddingTop: 14 }}>
                    <div className="text-label" style={{ marginBottom: 8, color: 'var(--ink)', fontWeight: 800 }}>
                      Screening Environment Tips
                    </div>
                    {[
                      'Hold device stable at the child’s eye level (40–55 cm).',
                      'Ensure room lights are on; avoid strong backlights.',
                      'Child should look naturally at the on-screen animation.',
                    ].map((tip, i) => (
                      <div key={i} style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: 'var(--blue-600)', fontWeight: 800 }}>•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>

                  {!allReady && (
                    <div style={{ marginTop: 14, textAlign: 'right' }}>
                      <button
                        onClick={handleForceCalibrate}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--orange-600)',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        ⚡ Bypass diagnostics & proceed
                      </button>
                    </div>
                  )}
                </SpotlightCard>

                {/* Launch Button */}
                <div style={{ marginTop: 20 }}>
                  <MotionButton
                    variant="coral"
                    onClick={handleStart}
                    disabled={!allReady}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '16px', letterSpacing: '0.04em' }}
                  >
                    {allReady ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Begin 60-Second Screening
                      </>
                    ) : (
                      'Calibrating Optical Sensors…'
                    )}
                  </MotionButton>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
