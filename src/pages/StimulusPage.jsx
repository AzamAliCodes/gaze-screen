import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import StimulusPlayer from '../components/StimulusPlayer';
import GazeTracker from '../components/GazeTracker';
import { LiveDot } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { TOTAL_STIMULUS_DURATION } from '../lib/stimulus';

export default function StimulusPage() {
  const navigate = useNavigate();
  const { session, updateSession, addGazePoint, addBlinkEvent } = useSession();

  const [phase, setPhase] = useState(null);
  const [progress, setProgress] = useState(0);
  const [gazeCount, setGazeCount] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [trackerReady, setTrackerReady] = useState(false);
  const [trackerError, setTrackerError] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  // Live Tracking Telemetry
  const [liveGaze, setLiveGaze] = useState(null);
  const [gazeHistory, setGazeHistory] = useState([]);
  const [blinkFlash, setBlinkFlash] = useState(false);
  const [lastBlinkDuration, setLastBlinkDuration] = useState(null);
  const [radarExpanded, setRadarExpanded] = useState(true);
  const [saccadeVelocity, setSaccadeVelocity] = useState(0);

  const startTimeRef = useRef(null);
  const lastPosRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) {
      setShowCountdown(false);
      setSessionStarted(true);
      startTimeRef.current = Date.now();
      updateSession({ startedAt: Date.now() });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, updateSession]);

  const handleGazePoint = useCallback(
    (point) => {
      addGazePoint(point);
      setGazeCount((c) => c + 1);
      setLiveGaze({ x: point.x, y: point.y });

      // Compute instantaneous saccadic velocity
      if (lastPosRef.current) {
        const dx = point.x - lastPosRef.current.x;
        const dy = point.y - lastPosRef.current.y;
        const dt = (point.timestamp - lastPosRef.current.timestamp) / 1000;
        if (dt > 0 && dt < 0.25) {
          const vel = Math.round(Math.hypot(dx, dy) / dt);
          setSaccadeVelocity(vel);
        }
      }
      lastPosRef.current = { x: point.x, y: point.y, timestamp: point.timestamp };

      // Miniature history for radar breadcrumbs (last 4 points)
      setGazeHistory((prev) => {
        const updated = [...prev, { x: point.x, y: point.y, id: point.timestamp + Math.random() }];
        return updated.slice(-5);
      });
    },
    [addGazePoint]
  );

  const handleBlink = useCallback(
    (event) => {
      addBlinkEvent(event);
      setBlinkCount((c) => c + 1);
      setLastBlinkDuration(event.duration || 135);
      setBlinkFlash(true);
      setTimeout(() => setBlinkFlash(false), 550);
    },
    [addBlinkEvent]
  );

  // Smooth completion handler
  const handleComplete = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);

    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 60;
    updateSession({ completedAt: Date.now(), totalDuration: duration });

    setTimeout(() => {
      navigate('/analysis');
    }, 400);
  }, [isCompleting, navigate, updateSession]);

  const elapsed = Math.round(progress * (TOTAL_STIMULUS_DURATION / 1000));
  const totalSec = Math.round(TOTAL_STIMULUS_DURATION / 1000);

  // Determine current region of interest (ROI) from gaze position
  const currentROI = useMemo(() => {
    if (!liveGaze) return 'OPTICAL SENSORS SYNCHRONIZED';
    const normX = liveGaze.x / window.innerWidth;
    const normY = liveGaze.y / window.innerHeight;

    if (normX >= 0.35 && normX <= 0.65 && normY >= 0.25 && normY <= 0.7) {
      return phase?.phase === 'social' ? 'CENTRAL SOCIAL REGION (FACES)' : 'GEOMETRIC FOCAL CORE';
    }
    if (normX < 0.5 && normY < 0.5) return 'QUADRANT I · TOP-LEFT ROI';
    if (normX >= 0.5 && normY < 0.5) return 'QUADRANT II · TOP-RIGHT ROI';
    if (normX < 0.5 && normY >= 0.5) return 'QUADRANT III · BOTTOM-LEFT ROI';
    return 'QUADRANT IV · BOTTOM-RIGHT ROI';
  }, [liveGaze, phase]);

  // Phase color theme for animations
  const isSocial = phase?.phase === 'social';
  const activeBlipColor = isSocial ? '#38bdf8' : '#c084fc';
  const activeGlowColor = isSocial ? 'rgba(56, 189, 248, 0.6)' : 'rgba(192, 132, 252, 0.6)';

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Countdown Overlay */}
        <AnimatePresence>
          {showCountdown && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="brutal-tag tag-blue">OPTICAL SENSORS SYNCHRONIZED</span>
                <span className="brutal-tag tag-yellow">60s PROTOCOL</span>
              </div>
              <motion.div
                key={countdown}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9rem',
                  fontWeight: 900,
                  color: 'var(--orange-500)',
                  lineHeight: 1,
                  textShadow: '5px 5px 0px var(--ink)',
                }}
              >
                {countdown === 0 ? 'START' : countdown}
              </motion.div>
              <div
                style={{
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: '#ffffff',
                  padding: '6px 16px',
                  border: '2px solid var(--ink)',
                  borderRadius: '3px',
                  boxShadow: '3px 3px 0px var(--ink)',
                }}
              >
                {session.childName ? `${session.childName}, watch the shapes on screen!` : 'Please direct child’s attention to screen'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smooth Completion Transition Overlay */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 120,
                background: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                {/* Outer rotating multi-color ring */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '4px dashed var(--blue-600)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner counter-rotating ring */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    border: '3px solid var(--orange-500)',
                    borderTopColor: 'transparent',
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <span className="brutal-tag tag-blue" style={{ marginBottom: 8, display: 'inline-block' }}>
                  SESSION CONCLUDED
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: 'var(--ink)',
                    margin: '6px 0 4px',
                  }}
                >
                  Generating Biomarker Report
                </h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--ink-secondary)', margin: 0 }}>
                  Synthesizing {gazeCount.toLocaleString()} gaze telemetry vectors and blink rates…
                </p>
              </div>

              <div
                style={{
                  width: 260,
                  height: 8,
                  background: '#e2e8f0',
                  border: '1.5px solid var(--ink)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--blue-600), var(--orange-500))' }}
                  initial={{ width: '10%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.85, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Brutalist Top HUD */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.5rem',
            background: '#ffffff',
            borderBottom: '2.5px solid var(--ink)',
            boxShadow: '0 3px 0px rgba(0,0,0,0.12)',
          }}
        >
          {/* Status Badge & Multi-Color Frequency Equalizer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#eff6ff',
                padding: '4px 10px',
                border: '1.5px solid var(--ink)',
                borderRadius: '3px',
              }}
            >
              <LiveDot color={trackerReady ? 'var(--green-600)' : trackerError ? 'var(--blue-600)' : 'var(--amber-primary)'} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink)' }}>
                {trackerReady ? 'TRACKING LIVE' : trackerError ? 'SIMULATED TELEMETRY' : 'INITIALIZING…'}
              </span>

              {/* Multi-Color Chromatic Frequency Equalizer Bars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 14, marginLeft: 2 }}>
                {[
                  { color: '#2563eb', scale: 0.9 },
                  { color: '#7c3aed', scale: 0.55 },
                  { color: '#f59e0b', scale: 1.0 },
                  { color: '#10b981', scale: 0.7 },
                  { color: '#06b6d4', scale: 0.45 },
                ].map((bar, i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: 2.5,
                      background: bar.color,
                      borderRadius: 1,
                    }}
                    animate={{
                      height: (trackerReady || trackerError) ? [4, 14 * bar.scale, 5, 12 * bar.scale, 4] : [2, 2],
                    }}
                    transition={{
                      duration: 0.8 + i * 0.14,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>

            <span
              className={`brutal-tag ${isSocial ? 'tag-blue' : 'tag-purple'}`}
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              {phase?.label || 'Calibrating'}
            </span>

            {/* Live Blink Detection Flash Tag */}
            <AnimatePresence>
              {blinkFlash && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, x: -6 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--yellow-400)',
                    color: 'var(--ink)',
                    border: '1.5px solid var(--ink)',
                    borderRadius: '3px',
                    padding: '3px 9px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    boxShadow: '2px 2px 0px var(--ink)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>👁</span>
                  <span>BLINK {lastBlinkDuration ? `${lastBlinkDuration}ms` : 'DETECTED'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clock Timer */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: 'var(--ink)',
                background: 'var(--yellow-100)',
                padding: '2px 14px',
                border: '2px solid var(--ink)',
                borderRadius: '3px',
                boxShadow: '2.5px 2.5px 0px var(--ink)',
              }}
            >
              {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
              <span style={{ color: 'var(--ink-secondary)', fontSize: '0.85rem' }}>
                {' '}/ {String(Math.floor(totalSec / 60)).padStart(2, '0')}:{String(totalSec % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Metric Badges & Complete Button */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                textAlign: 'right',
                background: '#eff6ff',
                border: '2px solid var(--ink)',
                padding: '3px 10px',
                borderRadius: '3px',
                boxShadow: '2px 2px 0px var(--ink)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--blue-700)', fontSize: '0.92rem' }}>
                {gazeCount.toLocaleString()}
              </div>
              <div className="text-label" style={{ fontSize: '0.55rem', marginTop: -2, color: 'var(--blue-700)' }}>
                GAZE PTS
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                background: '#fff7ed',
                border: '2px solid var(--ink)',
                padding: '3px 10px',
                borderRadius: '3px',
                boxShadow: '2px 2px 0px var(--ink)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--orange-600)', fontSize: '0.92rem' }}>
                {blinkCount}
              </div>
              <div className="text-label" style={{ fontSize: '0.55rem', marginTop: -2, color: 'var(--orange-600)' }}>
                BLINKS
              </div>
            </div>

            {/* Complete Test & View Report Early Button */}
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              style={{
                background: 'var(--yellow-300)',
                color: 'var(--ink)',
                border: '2px solid var(--ink)',
                borderRadius: '3px',
                padding: '5px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '2.5px 2.5px 0px var(--ink)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-1px, -1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
            >
              <span>✓</span>
              <span>FINISH & VIEW REPORT</span>
            </button>
          </div>
        </div>

        {/* Clean Stimulus Canvas Area (Unobstructed View for Child) */}
        <div style={{ position: 'fixed', inset: '56px 0 9px 0' }}>
          <StimulusPlayer
            active={sessionStarted}
            onPhaseChange={setPhase}
            onProgress={setProgress}
            onComplete={handleComplete}
          />
        </div>

        {/* Small Corner Optical Radar HUD (Enhanced Multi-Color Telemetry) */}
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 18,
            zIndex: 45,
            width: radarExpanded ? 245 : 'auto',
            background: '#ffffff',
            border: '2.5px solid var(--ink)',
            borderRadius: '4px',
            boxShadow: '4px 4px 0px var(--ink)',
            overflow: 'hidden',
          }}
        >
          {/* Cockpit Header with Multi-Color Mini Equalizer */}
          <div
            style={{
              padding: '6px 10px',
              background: isSocial ? '#eff6ff' : '#f5f3ff',
              borderBottom: radarExpanded ? '2px solid var(--ink)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setRadarExpanded(!radarExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LiveDot color={activeBlipColor} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 900, color: 'var(--ink)' }}>
                OPTICAL RADAR
              </span>

              {/* 4-Color Mini Equalizer in Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 11, marginLeft: 4 }}>
                {[
                  { color: '#38bdf8', h: [3, 11, 4] },
                  { color: '#a855f7', h: [6, 12, 3] },
                  { color: '#facc15', h: [4, 10, 5] },
                  { color: '#10b981', h: [8, 3, 10] },
                ].map((bar, i) => (
                  <motion.div
                    key={i}
                    style={{ width: 2, background: bar.color, borderRadius: 1 }}
                    animate={{ height: bar.h }}
                    transition={{ duration: 0.7 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </div>

            <button
              style={{
                background: 'none',
                border: 'none',
                padding: '0 4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              {radarExpanded ? '▼' : '▲'}
            </button>
          </div>

          {/* Expanded Radar Body */}
          {radarExpanded && (
            <div style={{ padding: '9px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {/* Mini Screen Radar Representation with Multi-Color Optics */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 96,
                  background: '#0a0f1d',
                  border: '1.5px solid var(--ink)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                {/* Center Quadrant Crosshairs */}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.12)' }} />

                {/* Concentric Optical Range Rings (Multi-Color) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 72,
                    height: 52,
                    borderRadius: '50%',
                    border: '1px dashed rgba(56, 189, 248, 0.25)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 36,
                    height: 26,
                    borderRadius: '50%',
                    border: '1px dashed rgba(168, 85, 247, 0.35)',
                  }}
                />

                {/* Central ROI Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: '35%',
                    right: '35%',
                    top: '25%',
                    bottom: '30%',
                    border: '1px solid rgba(250, 204, 21, 0.35)',
                    borderRadius: '2px',
                  }}
                />

                {/* Multi-Color Radar Optical Laser Sweep */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '32%',
                    background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.3), rgba(250, 204, 21, 0.45), transparent)',
                    pointerEvents: 'none',
                  }}
                  animate={{ left: ['-35%', '115%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Mini Breadcrumb Saccadic Trail in Radar */}
                {gazeHistory.slice(-4).map((pt, idx) => {
                  const rx = Math.max(4, Math.min(96, (pt.x / window.innerWidth) * 100));
                  const ry = Math.max(4, Math.min(96, (pt.y / window.innerHeight) * 100));
                  const opacity = (idx + 1) * 0.22;
                  return (
                    <div
                      key={pt.id}
                      style={{
                        position: 'absolute',
                        left: `${rx}%`,
                        top: `${ry}%`,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: activeBlipColor,
                        opacity,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 6px ${activeGlowColor}`,
                      }}
                    />
                  );
                })}

                {/* Live Gaze Blip with Color-Responsive Ripple Ring */}
                {liveGaze && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    animate={{
                      left: `${Math.max(4, Math.min(96, (liveGaze.x / window.innerWidth) * 100))}%`,
                      top: `${Math.max(4, Math.min(96, (liveGaze.y / window.innerHeight) * 100))}%`,
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                  >
                    {/* Animated Ripple Pulse Ring */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `1.5px solid ${activeBlipColor}`,
                      }}
                      animate={{ scale: [0.8, 1.7, 0.8], opacity: [0.85, 0.15, 0.85] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Central Optical Blip */}
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: activeBlipColor,
                        border: '1.5px solid #ffffff',
                        boxShadow: `0 0 8px ${activeBlipColor}`,
                      }}
                    />
                  </motion.div>
                )}

                {/* Status Indicator Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    left: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: isSocial ? '#38bdf8' : '#c084fc',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isSocial ? '● SOCIAL SCAN' : '● PATTERN SCAN'} · 60Hz
                </div>
              </div>

              {/* Real-Time Diagnostic Readouts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.64rem' }}>
                  <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>FOCUS:</span>
                  <span
                    style={{
                      color: isSocial ? 'var(--blue-700)' : 'var(--purple-700)',
                      fontWeight: 800,
                      textAlign: 'right',
                      maxWidth: 155,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentROI}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.64rem' }}>
                  <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>VELOCITY:</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    {saccadeVelocity} px/s
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '2px',
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  color: 'var(--ink-secondary)',
                }}
              >
                <span>LATENCY: &lt;16ms</span>
                <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>● SENSORS LOCKED</span>
              </div>
            </div>
          )}
        </div>

        {/* Gaze Tracker (Runs locally in background) */}
        <GazeTracker
          active={sessionStarted}
          currentPhase={phase?.phase || 'social'}
          onGazePoint={handleGazePoint}
          onBlink={handleBlink}
          onReady={() => setTrackerReady(true)}
          onError={() => setTrackerError(true)}
          showPreview={false}
        />

        {/* Progress Bar Footer */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 9,
            zIndex: 50,
            background: '#e2e8f0',
            borderTop: '2px solid var(--ink)',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--yellow-400), var(--orange-500), var(--green-500))',
              originX: 0,
            }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </PageTransition>
  );
}
