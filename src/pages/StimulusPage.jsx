import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RotateCcw, Eye, Music, Volume2, VolumeX, Check, ChevronDown, ChevronUp } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StimulusPlayer from '../components/StimulusPlayer';
import GazeTracker from '../components/GazeTracker';
import { LiveDot } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { TOTAL_STIMULUS_DURATION } from '../lib/stimulus';
import soundEngine from '../lib/soundEngine';
import { deriveMetrics, computeRiskScore } from '../lib/classifier';
import {
  PartyShinchanMascot,
} from '../components/shinchan/ShinchanMascots';
import { useTheme } from '../context/ThemeContext';
import SpeechBubble from '../components/shinchan/SpeechBubble';
import ComicStamp from '../components/shinchan/ComicStamp';

export default function StimulusPage() {
  const navigate = useNavigate();
  const { session, updateSession, addGazePoint, addBlinkEvent } = useSession();
  const { isShinchanTheme } = useTheme();

  const [phase, setPhase] = useState(null);
  const [progress, setProgress] = useState(0);
  const [gazeCount, setGazeCount] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [trackerReady, setTrackerReady] = useState(false);
  const [trackerError, setTrackerError] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [showCountdown, setShowCountdown] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [audioRunning, setAudioRunning] = useState(soundEngine.isAudioRunning());

  // Live Tracking Telemetry
  const [liveGaze, setLiveGaze] = useState(null);
  const [gazeHistory, setGazeHistory] = useState([]);
  const [blinkFlash, setBlinkFlash] = useState(false);
  const [lastBlinkDuration, setLastBlinkDuration] = useState(null);
  const [radarExpanded, setRadarExpanded] = useState(false);
  const [saccadeVelocity, setSaccadeVelocity] = useState(0);

  const startTimeRef = useRef(null);
  const lastPosRef = useRef(null);

  // Route guard: if user accesses /stimulus directly without filling participant details & consent, redirect to /consent
  const hasConsent = Boolean(
    session?.consentGiven &&
    session?.parentName?.trim() &&
    session?.childName?.trim() &&
    session?.childAge &&
    !isNaN(parseInt(session.childAge, 10)) &&
    parseInt(session.childAge, 10) >= 1 &&
    parseInt(session.childAge, 10) <= 99
  );

  useEffect(() => {
    if (!hasConsent) {
      navigate('/consent', { replace: true });
    }
  }, [hasConsent, navigate]);

  // Subscribe to sound engine state
  useEffect(() => {
    if (!hasConsent) return;
    return soundEngine.subscribe(({ isRunning, isMuted: engineMuted }) => {
      setAudioRunning(isRunning);
      setIsMuted(engineMuted);
    });
  }, [hasConsent]);

  // Global user gesture listener: unlock audio immediately upon any screen click/tap/keypress
  useEffect(() => {
    if (!hasConsent) return;
    const unlockAudio = () => {
      soundEngine.resumeContext();
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Countdown advances ONLY when optical camera tracking is verified ready and online
  useEffect(() => {
    // If camera is offline or still initializing, freeze countdown and DO NOT start!
    if (trackerError || !trackerReady) {
      return;
    }

    if (countdown <= 0) {
      setShowCountdown(false);
      setSessionStarted(true);
      startTimeRef.current = Date.now();
      updateSession({ startedAt: Date.now() });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, trackerReady, trackerError, updateSession]);

  // If camera goes offline mid-session, halt test immediately to protect measurement validity
  useEffect(() => {
    if (trackerError && sessionStarted) {
      setSessionStarted(false);
      soundEngine.stopMelody();
    }
  }, [trackerError, sessionStarted]);

  // Ambient Sound & Melody Lifecycle
  useEffect(() => {
    if (sessionStarted && !isCompleting) {
      soundEngine.startMelody();
    }
    return () => {
      soundEngine.stopMelody();
    };
  }, [sessionStarted, isCompleting]);

  const handleToggleSound = useCallback(() => {
    soundEngine.resumeContext();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted && sessionStarted && !isCompleting) {
      soundEngine.startMelody();
    }
  }, [sessionStarted, isCompleting]);

  const handlePhaseChange = useCallback((newPhase) => {
    setPhase(newPhase);
    soundEngine.setPhase(newPhase);
  }, []);

  const gazePointsRef = useRef(session.gazePoints || []);
  const blinkEventsRef = useRef(session.blinkEvents || []);

  const handleGazePoint = useCallback(
    (point) => {
      gazePointsRef.current.push(point);
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
      blinkEventsRef.current.push(event);
      addBlinkEvent(event);
      setBlinkCount((c) => c + 1);
      setLastBlinkDuration(event.duration || 135);
      setBlinkFlash(true);
      soundEngine.playBlinkChime();
      setTimeout(() => setBlinkFlash(false), 550);
    },
    [addBlinkEvent]
  );

  // Bulletproof completion handler
  const handleComplete = useCallback(() => {
    try {
      // 1. Immediately halt all audio and background tracking
      soundEngine.stopAudio();
      setShowCountdown(false);
      setIsCompleting(true);
      setSessionStarted(false);

      const duration = startTimeRef.current ? Math.max(1, (Date.now() - startTimeRef.current) / 1000) : 60;
      const age = session.childAge || 4;
      const gazeData = gazePointsRef.current.length > 0 ? gazePointsRef.current : (session.gazePoints || []);
      const blinkData = blinkEventsRef.current.length > 0 ? blinkEventsRef.current : (session.blinkEvents || []);

      let metrics, result;
      try {
        metrics = deriveMetrics(gazeData, blinkData, duration, age);
        result = computeRiskScore(metrics, age);
      } catch (calcErr) {
        console.error('[StimulusPage] Metric calculation note:', calcErr);
        metrics = { hasData: false, sampleCount: gazeData.length };
        result = { level: 'unobserved', score: null, adhdScore: null, adhdLevel: 'unobserved' };
      }

      updateSession({
        completedAt: Date.now(),
        totalDuration: duration,
        gazePoints: gazeData,
        blinkEvents: blinkData,
        metrics,
        riskLevel: result.level,
        riskScore: result.score,
        adhdScore: result.adhdScore,
        adhdLevel: result.adhdLevel,
        adhdProbability: result.adhdProbability,
        asdScore: result.asdScore,
        asdLevel: result.asdLevel,
        breakdown: result.breakdown,
        cohort: result.cohort,
        cohortId: result.cohortId,
        completed: true,
      });

      window.scrollTo(0, 0);
      try {
        navigate('/report', { replace: true });
      } catch (navErr) {
        window.location.replace('/report');
      }
    } catch (err) {
      console.error('[StimulusPage] handleComplete error:', err);
      window.scrollTo(0, 0);
      try {
        navigate('/report', { replace: true });
      } catch (_) {
        window.location.replace('/report');
      }
    }
  }, [navigate, session.childAge, session.gazePoints, session.blinkEvents, updateSession]);

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

  if (!hasConsent) {
    return null;
  }

  // If completing, halt all heavy canvas animations and camera immediately
  if (isCompleting) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: '#ffffff',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '4px solid var(--yellow-300)',
            borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900, color: 'var(--yellow-300)' }}>
          STOPPING SENSORS & GENERATING REPORT…
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#94a3b8' }}>
          Finalizing oculomotor gaze telemetry…
        </p>
      </div>
    );
  }

  // Phase color theme for animations
  const isSocial = phase?.phase === 'social';
  const activeBlipColor = isSocial ? '#38bdf8' : '#c084fc';
  const activeGlowColor = isSocial ? 'rgba(56, 189, 248, 0.6)' : 'rgba(192, 132, 252, 0.6)';

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Countdown & Camera Readiness Overlay */}
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
                padding: '1.5rem',
              }}
              onPointerDown={() => {
                soundEngine.resumeContext();
                if (trackerReady && !trackerError) {
                  setShowCountdown(false);
                  setSessionStarted(true);
                  startTimeRef.current = Date.now();
                  updateSession({ startedAt: Date.now() });
                }
              }}
              onClick={() => {
                soundEngine.resumeContext();
                if (trackerReady && !trackerError) {
                  setShowCountdown(false);
                  setSessionStarted(true);
                  startTimeRef.current = Date.now();
                  updateSession({ startedAt: Date.now() });
                }
              }}
            >
              {trackerError ? (
                /* Camera Offline Warning Card — Blocks Start Completely */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: '#fee2e2',
                    border: '3px solid var(--ink)',
                    boxShadow: '6px 6px 0px var(--ink)',
                    borderRadius: '4px',
                    padding: '28px 32px',
                    maxWidth: 520,
                    width: '100%',
                    textAlign: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px var(--ink)' }}>
                      <AlertTriangle size={30} color="var(--red-primary)" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: 'var(--red-primary)',
                      marginBottom: 10,
                      letterSpacing: '0.02em',
                    }}
                  >
                    CAMERA OFFLINE — TEST CANNOT START
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.92rem',
                      color: 'var(--ink-secondary)',
                      marginBottom: 22,
                      lineHeight: 1.6,
                    }}
                  >
                    Optical gaze tracking requires live front-camera video to measure involuntary fixations and blink rates. The screening test will not start without active camera permissions.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setTrackerError(false);
                        setTrackerReady(false);
                        setRetryKey((k) => k + 1);
                      }}
                      className="brutal-btn btn-primary"
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        background: 'var(--blue-600)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <RotateCcw size={13} strokeWidth={2.5} />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      onClick={() => navigate('/calibration')}
                      className="brutal-btn btn-outline"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ← Calibration
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleComplete();
                      }}
                      className="brutal-btn"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        background: 'var(--yellow-300)',
                        border: '2px solid var(--ink)',
                        boxShadow: '2px 2px 0px var(--ink)',
                        cursor: 'pointer',
                      }}
                    >
                      Finish & View Report →
                    </button>
                  </div>
                </motion.div>
              ) : !trackerReady ? (
                /* Camera Initializing State */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#ffffff',
                    border: '3px solid var(--ink)',
                    boxShadow: '6px 6px 0px var(--ink)',
                    borderRadius: '4px',
                    padding: '28px 32px',
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <motion.div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: '3.5px solid var(--blue-600)',
                      borderTopColor: 'transparent',
                      margin: '0 auto 16px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      color: 'var(--ink)',
                      marginBottom: 8,
                    }}
                  >
                    CONNECTING OPTICAL SENSORS…
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.88rem',
                      color: 'var(--ink-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Waiting for front-camera feed. The 60-second assessment will automatically initiate as soon as camera tracking is online.
                  </p>
                </motion.div>
              ) : (
                /* Camera Ready -> Verified Live Countdown */
                <>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <span className="brutal-tag tag-green">● TRACKING LIVE & VERIFIED</span>
                    <span className="brutal-tag tag-yellow">60s PROTOCOL</span>
                    <ComicStamp text="ACTION FOCUS" size="sm" rotate={-1} color="#2563EB" bgColor="#EFF6FF" />
                    <span className="brutal-tag tag-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Music size={11} strokeWidth={2.5} /> AUDIO MELODY READY
                    </span>
                  </div>

                  {/* Shinchan Mascot Encouragement during Countdown */}
                  {isShinchanTheme && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
                      <PartyShinchanMascot size={90} alt="Shinchan Peace Sign" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.24))' }} />
                      <SpeechBubble tail="left" variant="yellow" size="sm">
                        <span>Screening is about to start! Watch the moving shapes!</span>
                      </SpeechBubble>
                    </div>
                  )}

                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(4.5rem, 20vw, 8.5rem)',
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
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--ink-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Music size={12} strokeWidth={2.5} />
                      <span>ADHD Deep Focus & Relief music ready (tap anywhere if muted)</span>
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Brutalist Top HUD (Always on Top) */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 200,
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
              <LiveDot color={trackerReady ? 'var(--green-600)' : trackerError ? 'var(--red-primary)' : 'var(--amber-primary)'} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink)' }}>
                {trackerReady ? 'TRACKING LIVE' : trackerError ? 'CAMERA OFFLINE' : 'INITIALIZING…'}
              </span>
            </div>

            <span
              className={`brutal-tag ${isSocial ? 'tag-blue' : 'tag-purple'}`}
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              {phase?.label || 'Screening Active'}
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
                  <Eye size={13} strokeWidth={2.5} />
                  <span>BLINK {lastBlinkDuration ? `${lastBlinkDuration}ms` : 'DETECTED'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clock Timer */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              className="hud-hide-mobile"
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
              className="hud-hide-mobile"
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

            {/* Interactive ADHD Focus Music Toggle Button */}
            <button
              onClick={handleToggleSound}
              style={{
                background: isMuted ? '#f8fafc' : !audioRunning ? '#fef3c7' : '#ecfdf5',
                color: isMuted ? 'var(--ink-secondary)' : !audioRunning ? '#92400e' : '#065f46',
                border: '2px solid var(--ink)',
                borderRadius: '3px',
                padding: '5px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '2.5px 2.5px 0px var(--ink)',
                transition: 'all 0.15s ease',
              }}
              title={isMuted ? 'Unmute ADHD focus music' : !audioRunning ? 'Click to play ADHD focus music' : 'Mute ADHD focus music'}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-1px, -1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
            >
              {isMuted ? <VolumeX size={13} strokeWidth={2.5} /> : !audioRunning ? <Volume2 size={13} strokeWidth={2.5} /> : <Music size={13} strokeWidth={2.5} />}
              <span>{isMuted ? 'MUSIC OFF' : !audioRunning ? 'PLAY MUSIC' : 'MUSIC ON'}</span>
            </button>

            {/* Complete Test & View Report Early Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleComplete();
              }}
              style={{
                background: 'var(--yellow-300)',
                color: 'var(--ink)',
                border: '2px solid var(--ink)',
                borderRadius: '3px',
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '2.5px 2.5px 0px var(--ink)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-1px, -1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
            >
              <Check size={14} strokeWidth={3} />
              <span>FINISH & VIEW REPORT</span>
            </button>
          </div>
        </div>

        {/* Clean Stimulus Canvas Area (Unobstructed View for Child) */}
        <div style={{ position: 'fixed', inset: '56px 0 9px 0' }}>
          <StimulusPlayer
            active={sessionStarted}
            onPhaseChange={handlePhaseChange}
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
                cursor: 'pointer',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {radarExpanded ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronUp size={14} strokeWidth={2.5} />}
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

        {/* Camera Offline Interruption Modal (Mid-Screening Protection) */}
        <AnimatePresence>
          {trackerError && !showCountdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 150,
                background: 'rgba(10, 10, 10, 0.88)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  background: '#fee2e2',
                  border: '3px solid var(--ink)',
                  boxShadow: '6px 6px 0px var(--ink)',
                  borderRadius: '4px',
                  padding: '28px 32px',
                  maxWidth: 500,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px var(--ink)' }}>
                    <AlertTriangle size={30} color="var(--red-primary)" strokeWidth={2.5} />
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: 'var(--red-primary)',
                    marginBottom: 10,
                  }}
                >
                  SCREENING PAUSED — CAMERA OFFLINE
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.92rem',
                    color: 'var(--ink-secondary)',
                    marginBottom: 20,
                    lineHeight: 1.6,
                  }}
                >
                  Front-camera tracking was interrupted. The test timer and stimulus animation have been paused so the assessment results remain clinically valid.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setTrackerError(false);
                      setTrackerReady(false);
                      setRetryKey((k) => k + 1);
                    }}
                    className="brutal-btn btn-primary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      background: 'var(--blue-600)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    <span>Reconnect Camera & Resume</span>
                  </button>
                  <button
                    onClick={() => navigate('/calibration')}
                    className="brutal-btn btn-outline"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Exit to Calibration
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleComplete();
                    }}
                    className="brutal-btn"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      background: 'var(--yellow-300)',
                      border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0px var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    Finish & View Report →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gaze Tracker (Runs locally on-device in background) */}
        <GazeTracker
          active={true}
          retryKey={retryKey}
          currentPhase={phase?.phase || 'social'}
          onGazePoint={handleGazePoint}
          onBlink={handleBlink}
          onReady={() => {
            setTrackerReady(true);
            setTrackerError(false);
            if (!showCountdown) {
              setSessionStarted(true);
            }
          }}
          onError={() => {
            setTrackerReady(false);
            setTrackerError(true);
            setSessionStarted(false);
          }}
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
