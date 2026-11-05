import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  RotateCcw,
  Eye,
  Music,
  Volume2,
  VolumeX,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StimulusPlayer from '../components/StimulusPlayer';
import GazeTracker from '../components/GazeTracker';
import { LiveDot } from '../components/UI';
import { useSession } from '../context/SessionContext';
import { TOTAL_STIMULUS_DURATION } from '../lib/stimulus';
import soundEngine from '../lib/soundEngine';
import { deriveMetrics, computeRiskScore } from '../lib/classifier';
import { ComicBgPattern } from '../components/shinchan/ShinchanMascots';
import { MinionBgPattern } from '../components/minion/MinionMascots';
import { useTheme } from '../context/ThemeContext';

export default function StimulusPage() {
  const navigate = useNavigate();
  const { session, updateSession, addGazePoint, addBlinkEvent } = useSession();
  const { isMinionTheme, isShinchanTheme } = useTheme();

  // Screen State Machine: 'initializing' | 'ready' | 'active' | 'paused'
  const [screenState, setScreenState] = useState('initializing');
  const [initChecks, setInitChecks] = useState({
    camera: 'loading',   // 'loading' | 'ok' | 'error'
    model: 'pending',    // 'pending' | 'loading' | 'ok' | 'error'
    pipeline: 'pending', // 'pending' | 'loading' | 'ok' | 'error'
  });
  const [initProgressMsg, setInitProgressMsg] = useState('Connecting front camera video stream…');
  const [initError, setInitError] = useState(null);
  const [countdown, setCountdown] = useState(2);
  const [retryKey, setRetryKey] = useState(0);
  const [cameraWarm, setCameraWarm] = useState(false);

  // Active Session State
  const [phase, setPhase] = useState(null);
  const [progress, setProgress] = useState(0);
  const [gazeCount, setGazeCount] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
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

  // Ensure session has required details (supports direct /stimulus access or page refresh)
  useEffect(() => {
    if (!session?.childName || !session?.consentGiven) {
      updateSession({
        consentGiven: true,
        parentName: session?.parentName || 'Parent / Clinician',
        childName: session?.childName || 'Participant',
        childAge: session?.childAge || '5',
      });
    }
  }, [session, updateSession]);

  // Subscribe to sound engine state
  useEffect(() => {
    return soundEngine.subscribe(({ isRunning, isMuted: engineMuted }) => {
      setAudioRunning(isRunning);
      setIsMuted(engineMuted);
    });
  }, []);

  // Global user gesture listener: unlock audio immediately upon any screen click/tap/keypress
  useEffect(() => {
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

  // Countdown advances ONLY when in 'ready' state
  useEffect(() => {
    if (screenState !== 'ready') return;

    if (countdown <= 0) {
      setScreenState('active');
      setSessionStarted(true);
      startTimeRef.current = Date.now();
      updateSession({ startedAt: Date.now() });
      return;
    }

    const t = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [screenState, countdown, updateSession]);

  // Ambient Sound & Melody Lifecycle: only runs while screening is actively running
  useEffect(() => {
    if (sessionStarted && screenState === 'active' && !isCompleting) {
      soundEngine.startMelody();
    }
    return () => {
      soundEngine.stopMelody();
    };
  }, [sessionStarted, screenState, isCompleting]);

  const handleToggleSound = useCallback(() => {
    soundEngine.resumeContext();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted && sessionStarted && screenState === 'active' && !isCompleting) {
      soundEngine.startMelody();
    }
  }, [sessionStarted, screenState, isCompleting]);

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

      // Instantaneous saccadic velocity
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

      // Miniature history for radar breadcrumbs (last 5 points)
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

  // Initialization progress callback from GazeTracker
  const handleInitProgress = useCallback(({ stage, message }) => {
    setInitProgressMsg(message);
    setInitChecks((prev) => {
      const next = { ...prev };
      if (stage === 'camera') {
        next.camera = 'loading';
      } else if (stage === 'camera_ok') {
        next.camera = 'ok';
        setTimeout(() => setCameraWarm(true), 1800);
        if (next.model === 'pending') next.model = 'loading';
      } else if (stage === 'model') {
        next.camera = 'ok';
        next.model = 'loading';
      } else if (stage === 'model_ok') {
        next.camera = 'ok';
        next.model = 'ok';
        if (next.pipeline === 'pending') next.pipeline = 'loading';
      } else if (stage === 'pipeline') {
        next.camera = 'ok';
        next.model = 'ok';
        next.pipeline = 'loading';
      } else if (stage === 'ready') {
        next.camera = 'ok';
        next.model = 'ok';
        next.pipeline = 'ok';
      }
      return next;
    });
  }, []);

  // Called strictly when camera + network model + pipeline are 100% verified
  const handleTrackerReady = useCallback(() => {
    setInitChecks({
      camera: 'ok',
      model: 'ok',
      pipeline: 'ok',
    });
    setInitError(null);
    setScreenState((curr) => {
      if (curr === 'initializing') {
        return 'ready';
      }
      if (curr === 'paused') {
        setSessionStarted(true);
        return 'active';
      }
      return curr;
    });
  }, []);

  // Called when any initialization or runtime error occurs
  const handleTrackerError = useCallback((err) => {
    console.error('[StimulusPage] Tracker error received:', err);
    setScreenState((curr) => {
      if (curr === 'active') {
        setSessionStarted(false);
        soundEngine.stopMelody();
        return 'paused';
      }
      const msg = err?.message || 'Initialization failed. Please check network and camera.';
      setInitError(msg);
      setInitChecks((prev) => {
        const next = { ...prev };
        if (msg.includes('Camera') || msg.includes('webcam') || msg.includes('permission')) {
          next.camera = 'error';
        } else if (msg.includes('Network') || msg.includes('CDN') || msg.includes('FaceMesh') || msg.includes('internet')) {
          next.model = 'error';
        } else {
          next.pipeline = 'error';
        }
        return next;
      });
      return 'initializing';
    });
  }, []);

  // Clean retry action
  const handleRetryInit = useCallback(() => {
    setInitError(null);
    setInitChecks({
      camera: 'loading',
      model: 'pending',
      pipeline: 'pending',
    });
    setInitProgressMsg('Reconnecting camera and refreshing neural model assets…');
    setCountdown(2);
    setCameraWarm(false);
    setRetryKey((k) => k + 1);
  }, []);

  // Complete handler
  const handleComplete = useCallback(() => {
    try {
      soundEngine.stopAudio();
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

  // Region of interest computation
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

  // Completing screen
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

  const isSocial = phase?.phase === 'social';
  const activeBlipColor = isSocial ? '#38bdf8' : '#c084fc';

  const calcInitPercent = () => {
    let pts = 0;
    if (initChecks.camera === 'ok') pts += 35;
    else if (initChecks.camera === 'loading') pts += 15;

    if (initChecks.model === 'ok') pts += 35;
    else if (initChecks.model === 'loading') pts += 15;

    if (initChecks.pipeline === 'ok') pts += 30;
    else if (initChecks.pipeline === 'loading') pts += 15;
    return pts;
  };

  const isInitializing = screenState === 'initializing' || screenState === 'ready';

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ============================================================== */}
        {/* SCREEN 1: MINIMAL PRE-TEST OPTICAL CALIBRATION & VERIFICATION CARD */}
        {/* ============================================================== */}
        <AnimatePresence>
          {isInitializing && (
            <motion.div
              key="init-backdrop"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 120,
                background: isMinionTheme ? '#fffdf0' : isShinchanTheme ? '#fffbeb' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              {isMinionTheme && <MinionBgPattern opacity={0.24} fixed />}
              {isShinchanTheme && <ComicBgPattern opacity={0.22} fixed />}

              {/* Minimal Centered Card — Frames the Live Camera Feed */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                style={{
                  background: '#ffffff',
                  border: '3px solid var(--ink)',
                  boxShadow: '7px 7px 0px var(--ink)',
                  borderRadius: '6px',
                  maxWidth: 440,
                  width: '100%',
                  padding: '1.25rem 1.4rem',
                  position: 'relative',
                  zIndex: 125,
                  textAlign: 'center',
                }}
              >
                {/* Header Tag & Step Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    className={`brutal-tag ${
                      initError ? 'tag-red' : screenState === 'ready' ? 'tag-green' : 'tag-blue'
                    }`}
                    style={{ fontSize: '0.7rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <LiveDot color={initError ? 'var(--red-primary)' : screenState === 'ready' ? 'var(--green-600)' : 'var(--blue-600)'} />
                    {initError ? 'NEEDS ATTENTION' : screenState === 'ready' ? 'SENSORS CALIBRATED & READY' : 'INITIALIZING SENSORS'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      background: 'var(--yellow-100)',
                      padding: '2px 7px',
                      border: '1.5px solid var(--ink)',
                      borderRadius: '3px',
                    }}
                  >
                    STEP 3/4
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--ink)',
                    lineHeight: 1.25,
                    marginBottom: 4,
                  }}
                >
                  {screenState === 'ready'
                    ? 'Sensors Calibrated & Ready!'
                    : initError
                    ? 'Camera / Model Check'
                    : 'Optical Eye Tracking Setup'}
                </h1>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--ink-secondary)',
                    lineHeight: 1.45,
                    marginBottom: 10,
                  }}
                >
                  {screenState === 'ready'
                    ? 'Front camera and neural eye-tracking are locked. The 60-second timer will start only when screening begins.'
                    : initError
                    ? 'Webcam or neural network connection issue. Click Retry below to re-establish tracking.'
                    : 'Connecting front camera and MediaPipe neural eye-tracking. Timer starts only after tracking is verified.'}
                </p>

                {/* Reserved 320x240 Camera Viewport Slot (GazeTracker floats precisely over this) */}
                <div
                  style={{
                    width: 320,
                    height: 240,
                    margin: '0 auto 10px auto',
                    background: '#0a0a0a',
                    borderRadius: '4px',
                    border: '2px solid var(--ink)',
                    boxShadow: '3px 3px 0px var(--ink)',
                  }}
                />

                {/* 3 Compact Inline Diagnostic Status Badges */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    className={`brutal-tag ${initChecks.camera === 'ok' ? 'tag-green' : initChecks.camera === 'error' ? 'tag-red' : 'tag-blue'}`}
                    style={{ fontSize: '0.66rem', padding: '2px 7px' }}
                  >
                    {initChecks.camera === 'ok' ? '✓ Cam 640×480' : initChecks.camera === 'error' ? '! Camera Error' : '… Camera'}
                  </span>
                  <span
                    className={`brutal-tag ${initChecks.model === 'ok' ? 'tag-green' : initChecks.model === 'error' ? 'tag-red' : 'tag-yellow'}`}
                    style={{ fontSize: '0.66rem', padding: '2px 7px' }}
                  >
                    {initChecks.model === 'ok' ? '✓ MediaPipe AI' : initChecks.model === 'error' ? '! Model Error' : '… AI Model'}
                  </span>
                  <span
                    className={`brutal-tag ${initChecks.pipeline === 'ok' ? 'tag-green' : initChecks.pipeline === 'error' ? 'tag-red' : 'tag-purple'}`}
                    style={{ fontSize: '0.66rem', padding: '2px 7px' }}
                  >
                    {initChecks.pipeline === 'ok' ? '✓ Gaze & Iris' : initChecks.pipeline === 'error' ? '! Pipeline' : '… Pipeline'}
                  </span>
                </div>

                {/* Live Blink Test Pill — Interactive Feedback before Screening Starts */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '6px 12px',
                    background: blinkFlash ? '#fef08a' : '#f8fafc',
                    border: '1.5px solid var(--ink)',
                    borderRadius: '3px',
                    boxShadow: '2px 2px 0px var(--ink)',
                    marginBottom: 12,
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Eye size={13} color="var(--ink)" strokeWidth={2.5} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {blinkFlash
                      ? `✓ BLINK DETECTED (${lastBlinkDuration ? `${lastBlinkDuration}ms` : 'VERIFIED'})`
                      : 'BLINK SENSOR: TRY BLINKING TO TEST'}
                  </span>
                </div>

                {/* Theme Mascot Dialogue Notice */}
                {isMinionTheme && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--blue-700)', marginBottom: 10 }}>
                    🍌 Dr. Nefario: "Lenses calibrated! Ready for screening!"
                  </div>
                )}
                {isShinchanTheme && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--blue-700)', marginBottom: 10 }}>
                    ⚡ Action Kamen: "Action radar locked! Watch the moving shapes!"
                  </div>
                )}

                {/* Status / Actions */}
                {screenState === 'ready' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.resumeContext();
                        setScreenState('active');
                        setSessionStarted(true);
                        startTimeRef.current = Date.now();
                        updateSession({ startedAt: Date.now() });
                      }}
                      className="brutal-btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        background: 'var(--green-600, #16a34a)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <span>Start 60-Second Screening →</span>
                    </button>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                      Starting automatically in {countdown === 0 ? '1' : countdown}s…
                    </div>
                  </div>
                )}

                {screenState === 'initializing' && !initError && (
                  <div>
                    <div
                      style={{
                        height: 6,
                        background: '#e2e8f0',
                        border: '1.5px solid var(--ink)',
                        borderRadius: 2,
                        overflow: 'hidden',
                        marginBottom: 6,
                      }}
                    >
                      <motion.div
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--blue-600), var(--green-500))' }}
                        animate={{ width: `${calcInitPercent()}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--blue-600)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                      <span>{initProgressMsg}</span>
                    </div>

                    {cameraWarm && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.resumeContext();
                            setScreenState('active');
                            setSessionStarted(true);
                            startTimeRef.current = Date.now();
                            updateSession({ startedAt: Date.now() });
                          }}
                          style={{
                            background: '#fef08a',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '3px',
                            padding: '4px 10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: 'var(--ink)',
                            cursor: 'pointer',
                            boxShadow: '1.5px 1.5px 0px var(--ink)',
                          }}
                        >
                          Camera Active · Skip AI wait &amp; Start Now →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {initError && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleRetryInit}
                      className="brutal-btn btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: 'var(--blue-600)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <RotateCcw size={12} strokeWidth={2.5} />
                      <span>Retry Initialization</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/calibration')}
                      className="brutal-btn btn-outline"
                      style={{ padding: '9px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* SCREEN 2: ACTIVE SCREENING SESSION ("Regular Timer & Call Page") */}
        {/* ============================================================== */}
        {(screenState === 'active' || screenState === 'paused') && (
          <>
            {/* Minimalist Brutalist Top HUD (Visible during Active Screening) */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1.5rem',
                background: '#ffffff',
                borderBottom: '2.5px solid var(--ink)',
                boxShadow: '0 3px 0px rgba(0,0,0,0.12)',
              }}
            >
              {/* Status Badge & Blink Alert */}
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
                  <LiveDot color={screenState === 'active' ? 'var(--green-600)' : 'var(--amber-primary)'} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {screenState === 'active' ? 'TRACKING LIVE (AI VERIFIED)' : 'CONNECTING…'}
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

              {/* Clock Timer — STARTS ONLY AFTER INITIALIZATION IS VERIFIED */}
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

              {/* Metric Badges & Action Controls */}
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

                {/* Interactive Music Toggle Button */}
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
                >
                  {isMuted ? <VolumeX size={13} strokeWidth={2.5} /> : !audioRunning ? <Volume2 size={13} strokeWidth={2.5} /> : <Music size={13} strokeWidth={2.5} />}
                  <span>{isMuted ? 'MUSIC OFF' : !audioRunning ? 'PLAY MUSIC' : 'MUSIC ON'}</span>
                </button>

                {/* Complete Test & View Report Early */}
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
                >
                  <Check size={14} strokeWidth={3} />
                  <span>Finish & View Report →</span>
                </button>
              </div>
            </div>

            {/* Clean Stimulus Canvas Area */}
            <div style={{ position: 'fixed', inset: '56px 0 9px 0' }}>
              <StimulusPlayer
                active={sessionStarted && screenState === 'active'}
                onPhaseChange={handlePhaseChange}
                onProgress={setProgress}
                onComplete={handleComplete}
              />
            </div>

            {/* Corner Optical Radar HUD */}
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
              {/* Radar Header */}
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

                  {/* 4-Color Mini Equalizer */}
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
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 120,
                      background: '#090d16',
                      borderRadius: '3px',
                      border: '1.5px solid var(--ink)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Crosshairs & Circular Grid */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }}>
                      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#38bdf8' }} />
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#38bdf8' }} />
                      <div style={{ position: 'absolute', left: '15%', right: '15%', top: '15%', bottom: '15%', border: '1px dashed #38bdf8', borderRadius: '50%' }} />
                    </div>

                    {/* Breadcrumbs Trail */}
                    {gazeHistory.map((pt, i) => (
                      <div
                        key={pt.id}
                        style={{
                          position: 'absolute',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: activeBlipColor,
                          opacity: 0.15 + (i / gazeHistory.length) * 0.4,
                          left: `${Math.max(8, Math.min(92, (pt.x / window.innerWidth) * 100))}%`,
                          top: `${Math.max(8, Math.min(92, (pt.y / window.innerHeight) * 100))}%`,
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}

                    {/* Live Gaze Position in Radar */}
                    {liveGaze && (
                      <motion.div
                        style={{
                          position: 'absolute',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: activeBlipColor,
                          boxShadow: `0 0 8px ${activeBlipColor}`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                          left: `${Math.max(8, Math.min(92, (liveGaze.x / window.innerWidth) * 100))}%`,
                          top: `${Math.max(8, Math.min(92, (liveGaze.y / window.innerHeight) * 100))}%`,
                        }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                      />
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        left: 6,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: isSocial ? '#38bdf8' : '#c084fc',
                      }}
                    >
                      {isSocial ? '● SOCIAL SCAN' : '● PATTERN SCAN'}
                    </div>
                  </div>

                  {/* Diagnostic Readouts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.64rem' }}>
                      <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>FOCUS:</span>
                      <span style={{ color: isSocial ? 'var(--blue-700)' : 'var(--purple-700)', fontWeight: 800 }}>
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
                </div>
              )}
            </div>

            {/* Mid-Screening Camera Interruption Modal */}
            <AnimatePresence>
              {screenState === 'paused' && (
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
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fecaca', border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={28} color="var(--red-primary)" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--red-primary)', marginBottom: 8 }}>
                      SCREENING PAUSED — CAMERA OFFLINE
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
                      Front-camera tracking was interrupted. The stimulus timer has been frozen so your screening results remain clinically valid.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
          </>
        )}

        {/* ============================================================== */}
        {/* ROOT LEVEL PERSISTENT GAZE TRACKER — NEVER UNMOUNTS */}
        {/* Transitions smoothly from calibration center to screening PIP */}
        {/* ============================================================== */}
        <GazeTracker
          active={true}
          retryKey={retryKey}
          mode={screenState === 'active' || screenState === 'paused' ? 'screening' : 'calibration'}
          currentPhase={phase?.phase || 'social'}
          onGazePoint={handleGazePoint}
          onBlink={handleBlink}
          onReady={handleTrackerReady}
          onError={handleTrackerError}
          onInitProgress={handleInitProgress}
        />
      </div>
    </PageTransition>
  );
}
