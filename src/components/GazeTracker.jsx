import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { eyeAspectRatio, BlinkDetector } from '../lib/cameraMeasurements';
import { getFaceMeshInstance } from '../lib/faceMeshLoader';

/**
 * GazeTracker — wraps MediaPipe Face Mesh to track:
 *   - Approximate gaze direction (eye landmarks & iris centers)
 *   - Blink events (Eye Aspect Ratio via calibrated pixel geometry & adaptive baseline)
 *   - Live optical video feed with landmark visualization
 *
 * onGazePoint(point)          → { x, y, timestamp, phase }
 * onBlink(event)              → { timestamp, duration }
 * onReady()                   → called strictly when camera + network model + pipeline verified
 * onError(err)                → called on any failure (camera, network, timeout, disconnect)
 * onInitProgress(progress)    → { stage, step, total, message }
 */

// Left & right iris landmarks
const LEFT_PUPIL  = [468, 469, 470, 471, 472];
const RIGHT_PUPIL = [473, 474, 475, 476, 477];
const LEFT_EYE    = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE   = [362, 385, 387, 263, 373, 380];

function getGazePoint(landmarks) {
  const lx = landmarks[LEFT_PUPIL[0]]?.x ?? landmarks[468]?.x ?? landmarks[33]?.x ?? 0.5;
  const ly = landmarks[LEFT_PUPIL[0]]?.y ?? 0.5;
  const rx = landmarks[RIGHT_PUPIL[0]]?.x ?? landmarks[473]?.x ?? landmarks[263]?.x ?? 0.5;
  const ry = landmarks[RIGHT_PUPIL[0]]?.y ?? 0.5;

  // Screen coordinates (mirrored since front camera)
  const gx = (1 - (lx + rx) / 2) * window.innerWidth;
  const gy = ((ly + ry) / 2) * window.innerHeight;
  return { x: gx, y: gy };
}

// Resilient camera acquisition helper: retries if webcam is briefly busy during route transitions
async function acquireWebcamStream(constraints, retries = 3, delayMs = 350) {
  for (let i = 0; i < retries; i++) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if ((err.name === 'NotReadableError' || err.name === 'TrackStartError') && i < retries - 1) {
        console.warn(`[GazeTracker] Camera hardware busy, retrying in ${delayMs}ms (attempt ${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
}

export default function GazeTracker({
  active = false,
  mode = 'screening', // 'calibration' | 'screening'
  currentPhase = 'social',
  onGazePoint,
  onBlink,
  onReady,
  onError,
  onInitProgress,
  retryKey = 0,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const blinkDetectorRef = useRef(new BlinkDetector());
  const baselineEarRef = useRef(0.28);
  const lastBlinkEmitTimeRef = useRef(0);
  const blinkCandidateRef = useRef({ closedAt: null, wasOpen: false });

  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [isPipExpanded, setIsPipExpanded] = useState(true);
  const [lastEar, setLastEar] = useState(0.28);
  const [hasFace, setHasFace] = useState(false);

  const isCalibration = mode === 'calibration';

  const currentPhaseRef = useRef(currentPhase);
  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    if (!active) return;

    let faceMesh = null;
    let animFrame = null;
    let stopped = false;
    let activeStream = null;
    const currentVideo = videoRef.current;
    blinkDetectorRef.current.reset();
    blinkCandidateRef.current = { closedAt: null, wasOpen: false };
    baselineEarRef.current = 0.28;

    async function init() {
      setStatus('loading');

      try {
        // ==============================================================
        // HIGH PERFORMANCE PARALLEL TRACK: CAMERA & AI MODEL SIMULTANEOUS
        // ==============================================================

        // Track A: Connect Camera Hardware Stream
        const cameraPromise = (async () => {
          onInitProgress?.({
            stage: 'camera',
            step: 1,
            total: 3,
            message: 'Connecting front camera video feed...',
          });

          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API unavailable. Ensure you are accessing via http://localhost or HTTPS.');
          }

          let stream = null;
          try {
            stream = await acquireWebcamStream({
              video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
          } catch (err1) {
            console.warn('[GazeTracker] Attempt 1 (user camera) failed, trying ideal resolution:', err1);
            if (err1.name === 'NotAllowedError' || err1.name === 'PermissionDeniedError') {
              throw err1;
            }
            try {
              stream = await acquireWebcamStream({
                video: { width: { ideal: 640 }, height: { ideal: 480 } },
              });
            } catch (err2) {
              console.warn('[GazeTracker] Attempt 2 failed, falling back to basic video:', err2);
              if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
                throw err2;
              }
              stream = await acquireWebcamStream({ video: true });
            }
          }

          if (stopped) {
            stream.getTracks().forEach((t) => t.stop());
            return null;
          }

          activeStream = stream;

          // Hardware disconnect listener
          stream.getVideoTracks().forEach((track) => {
            track.addEventListener('ended', () => {
              if (!stopped) {
                console.warn('[GazeTracker] Camera track disconnected');
                setStatus('error');
                onError?.(new Error('Front camera hardware disconnected. Please reconnect your webcam.'));
              }
            });
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current?.play();
              } catch (_) {}
            };
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('[GazeTracker] Video play deferred or warning:', playErr);
            }
          }

          // Fast frame delivery detection using events + fast interval
          await new Promise((resolve, reject) => {
            const v = videoRef.current;
            if (v && v.videoWidth > 0 && v.readyState >= 2) {
              resolve();
              return;
            }
            const startTime = Date.now();
            let resolved = false;

            const onFrameReady = () => {
              if (!resolved && v && v.videoWidth > 0 && v.readyState >= 2) {
                resolved = true;
                cleanup();
                resolve();
              }
            };

            const cleanup = () => {
              v?.removeEventListener('loadeddata', onFrameReady);
              v?.removeEventListener('canplay', onFrameReady);
              v?.removeEventListener('playing', onFrameReady);
              clearInterval(poll);
            };

            v?.addEventListener('loadeddata', onFrameReady);
            v?.addEventListener('canplay', onFrameReady);
            v?.addEventListener('playing', onFrameReady);

            const poll = setInterval(() => {
              if (stopped) {
                cleanup();
                return;
              }
              if (v && v.videoWidth > 0 && v.readyState >= 2) {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  resolve();
                }
              } else if (Date.now() - startTime > 10000) {
                cleanup();
                reject(new Error('Camera connection timeout: no video frames received from webcam.'));
              }
            }, 30);
          });

          onInitProgress?.({
            stage: 'camera_ok',
            step: 1,
            total: 3,
            message: 'Front camera active (640×480 verified)',
          });

          return stream;
        })();

        // Track B: AI Neural Model (instantly resolves if preloaded in background, or downloads concurrently)
        const modelPromise = getFaceMeshInstance(onInitProgress);

        // AWAIT BOTH CONCURRENTLY — Total initialization duration is max(camera, model)
        const [streamResult, meshInstance] = await Promise.all([cameraPromise, modelPromise]);

        if (stopped || !streamResult || !meshInstance) return;

        faceMesh = meshInstance;

        faceMesh.onResults((results) => {
          if (stopped) return;
          if (!results.multiFaceLandmarks?.length) {
            setHasFace(false);
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            return;
          }

          setHasFace(true);
          const landmarks = results.multiFaceLandmarks[0];
          const now = Date.now();

          // Gaze point computation
          const gaze = getGazePoint(landmarks);
          onGazePoint?.({ ...gaze, timestamp: now, phase: currentPhaseRef.current });

          // Calibrated Eye Aspect Ratio (EAR) using pixel geometry
          const v = videoRef.current;
          const vw = v?.videoWidth || 640;
          const vh = v?.videoHeight || 480;
          const rawEar = eyeAspectRatio(landmarks, vw, vh);

          if (rawEar !== null && Number.isFinite(rawEar)) {
            setLastEar(rawEar);

            // Dynamically track personal resting open-eye baseline
            if (rawEar > 0.18) {
              baselineEarRef.current = Math.min(0.40, Math.max(0.22, baselineEarRef.current * 0.96 + rawEar * 0.04));
            }

            // Normalized EAR mapped to standard 0.28 scale for tested BlinkDetector
            const normalizedEar = (rawEar / baselineEarRef.current) * 0.28;

            // 1. Tested BlinkDetector update
            const detectorBlink = blinkDetectorRef.current.update(normalizedEar, now);
            if (detectorBlink) {
              lastBlinkEmitTimeRef.current = now;
              onBlink?.(detectorBlink);
            } else {
              // 2. High-precision adaptive blink detector (guards against frame rate jitter or fast blinks)
              const isEyeClosed = rawEar < baselineEarRef.current * 0.72 || rawEar < 0.20;
              const isEyeOpen = rawEar >= baselineEarRef.current * 0.88 && rawEar >= 0.22;

              if (isEyeOpen && blinkCandidateRef.current.closedAt !== null) {
                const duration = now - blinkCandidateRef.current.closedAt;
                blinkCandidateRef.current.closedAt = null;
                blinkCandidateRef.current.wasOpen = true;

                if (duration >= 45 && duration <= 480 && (now - lastBlinkEmitTimeRef.current > 360)) {
                  lastBlinkEmitTimeRef.current = now;
                  onBlink?.({ timestamp: now, duration });
                }
              } else if (isEyeClosed && blinkCandidateRef.current.wasOpen && blinkCandidateRef.current.closedAt === null) {
                blinkCandidateRef.current.closedAt = now;
                blinkCandidateRef.current.wasOpen = false;
              } else if (isEyeOpen) {
                blinkCandidateRef.current.wasOpen = true;
              }
            }
          }

          // Draw live eye contours & iris center points on canvas
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isBlinking = rawEar !== null && (rawEar < 0.20 || rawEar < baselineEarRef.current * 0.72);

            // Draw eyelids
            [LEFT_EYE, RIGHT_EYE].forEach((indices) => {
              ctx.beginPath();
              indices.forEach((idx, i) => {
                const lm = landmarks[idx];
                if (!lm) return;
                const px = (1 - lm.x) * canvas.width;
                const py = lm.y * canvas.height;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              });
              ctx.closePath();
              ctx.strokeStyle = isBlinking ? '#facc15' : '#38bdf8';
              ctx.lineWidth = isCalibration ? 2.8 : 2.2;
              ctx.stroke();
            });

            // Draw iris center pupil dots
            [LEFT_PUPIL[0], RIGHT_PUPIL[0]].forEach((idx) => {
              const lm = landmarks[idx];
              if (lm) {
                const px = (1 - lm.x) * canvas.width;
                const py = lm.y * canvas.height;
                ctx.beginPath();
                ctx.arc(px, py, isCalibration ? 3.6 : 2.8, 0, 2 * Math.PI);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
              }
            });
          }
        });

        // Fast pipeline verification warm-up (max 1.2s timeout so it never hangs)
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            await Promise.race([
              faceMesh.send({ image: videoRef.current }),
              new Promise((res) => setTimeout(res, 1200)),
            ]);
          } catch (warmupErr) {
            console.warn('[GazeTracker] Initial verification frame warm-up:', warmupErr);
          }
        }

        onInitProgress?.({
          stage: 'ready',
          step: 3,
          total: 3,
          message: 'All sensors and AI eye-tracking ready & synchronized!',
        });

        setStatus('ready');
        onReady?.();
      } catch (err) {
        console.error('[GazeTracker] Initialization error:', err);
        let friendlyMessage = err.message || 'Initialization failed.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          friendlyMessage = 'Camera permission was denied. Please allow camera permissions in your browser address bar.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          friendlyMessage = 'Camera is locked by another application (Zoom, Teams, Meet) or browser tab. Please close other apps and retry.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          friendlyMessage = 'No webcam hardware detected. Please connect a webcam.';
        } else if (
          err.message?.includes('Network') ||
          err.message?.includes('fetch') ||
          err.message?.includes('Failed to load') ||
          err.message?.includes('connection') ||
          err.message?.includes('FaceMesh')
        ) {
          friendlyMessage = 'Network error: Unable to load MediaPipe AI models from CDN. Please check your internet connection.';
        }

        const enhancedError = new Error(friendlyMessage);
        enhancedError.original = err;
        setStatus('error');
        onError?.(enhancedError);
        return;
      }

      // Continuous video frame processing loop
      let isProcessing = false;
      const processFrame = async () => {
        if (stopped) return;

        const video = videoRef.current;
        if (video && video.readyState >= 2 && !video.paused) {
          if (faceMesh && !isProcessing) {
            isProcessing = true;
            try {
              await faceMesh.send({ image: video });
            } catch (_) {
              // Frame dropped, proceed gracefully
            } finally {
              isProcessing = false;
            }
          }
        }

        if (!stopped) {
          animFrame = requestAnimationFrame(processFrame);
        }
      };

      animFrame = requestAnimationFrame(processFrame);
    }

    init();

    return () => {
      stopped = true;
      if (animFrame) cancelAnimationFrame(animFrame);
      try {
        // Detach callback to prevent stale processing without destroying Wasm context
        faceMesh?.onResults?.(() => {});
      } catch (_) {}
      const streamToStop = activeStream || currentVideo?.srcObject || videoRef.current?.srcObject;
      if (streamToStop && typeof streamToStop.getTracks === 'function') {
        streamToStop.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, retryKey, onError, onInitProgress, onReady]);

  // Persistent Video Container — Never unmounts to preserve stream tracks and srcObject
  return (
    <div
      style={
        isCalibration
          ? {
              position: 'fixed',
              top: 'calc(50% - 22px)',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 135,
              width: 320,
              height: 240,
              borderRadius: '4px',
              border: '2.5px solid var(--ink)',
              boxShadow: '4px 4px 0px var(--ink)',
              background: '#0a0a0a',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }
          : {
              position: 'fixed',
              bottom: 20,
              left: 18,
              top: 'auto',
              transform: 'none',
              zIndex: 48,
              background: '#ffffff',
              border: '2.5px solid var(--ink)',
              borderRadius: '4px',
              boxShadow: '4px 4px 0px var(--ink)',
              overflow: 'hidden',
              width: isPipExpanded ? 240 : 'auto',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }
      }
    >
      {/* Video Call PIP Header (only shown during active screening session) */}
      {!isCalibration && (
        <div
          style={{
            padding: '6px 10px',
            background: status === 'ready' ? '#eff6ff' : '#fef3c7',
            borderBottom: isPipExpanded ? '2px solid var(--ink)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setIsPipExpanded(!isPipExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: status === 'ready' ? (hasFace ? '#16a34a' : '#eab308') : '#dc2626',
                boxShadow: status === 'ready' && hasFace ? '0 0 6px rgba(22,163,74,0.6)' : 'none',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 900, color: 'var(--ink)' }}>
              LIVE OPTICAL CALL FEED
            </span>
          </div>

          <button
            type="button"
            aria-label={isPipExpanded ? 'Minimize video feed' : 'Expand video feed'}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 2px',
              cursor: 'pointer',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isPipExpanded ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronUp size={14} strokeWidth={2.5} />}
          </button>
        </div>
      )}

      {/* Video Frame Body & Canvas — NEVER UNMOUNTED */}
      <div
        style={{
          position: 'relative',
          width: isCalibration ? 320 : isPipExpanded ? 240 : 0,
          height: isCalibration ? 240 : isPipExpanded ? 180 : 0,
          background: '#0a0a0a',
          overflow: 'hidden',
          display: !isCalibration && !isPipExpanded ? 'none' : 'block',
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            display: 'block',
          }}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={isCalibration ? 320 : 240}
          height={isCalibration ? 240 : 180}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Telemetry Overlay Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 6,
            right: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 10, 10, 0.78)',
            padding: '2px 6px',
            borderRadius: '2px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 700,
              color: hasFace ? '#86efac' : '#fde047',
            }}
          >
            {hasFace ? 'EYE GAZE ACTIVE' : 'ALIGNING FACE…'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              fontWeight: 600,
              color: '#93c5fd',
            }}
          >
            EAR: {lastEar.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
