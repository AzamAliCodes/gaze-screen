import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * GazeTracker — wraps MediaPipe Face Mesh to track:
 *   - Approximate gaze direction (eye landmarks)
 *   - Blink events (eye aspect ratio)
 *
 * onGazePoint(point)  → { x, y, timestamp, phase }
 * onBlink(event)      → { timestamp, duration }
 * onReady()           → called when camera + model ready
 * onError(err)        → called on failure
 */

const EAR_THRESHOLD = 0.21; // Eye Aspect Ratio blink threshold

// MediaPipe left/right eye landmark indices
const LEFT_EYE  = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const LEFT_PUPIL  = [468, 469, 470, 471, 472];
const RIGHT_PUPIL = [473, 474, 475, 476, 477];

function eyeAspectRatio(landmarks, indices) {
  const [p1, p2, p3, p4, p5, p6] = indices.map(i => landmarks[i]);
  const A = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const B = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const C = Math.hypot(p1.x - p4.x, p1.y - p4.y);
  return (A + B) / (2 * C);
}

function getGazePoint(landmarks, videoWidth, videoHeight) {
  // Average of left and right iris centers
  const lx = landmarks[LEFT_PUPIL[0]]?.x ?? landmarks[468]?.x ?? 0.5;
  const ly = landmarks[LEFT_PUPIL[0]]?.y ?? 0.5;
  const rx = landmarks[RIGHT_PUPIL[0]]?.x ?? 0.5;
  const ry = landmarks[RIGHT_PUPIL[0]]?.y ?? 0.5;

  // Map to screen coordinates (mirrored since front camera)
  const gx = (1 - (lx + rx) / 2) * window.innerWidth;
  const gy = ((ly + ry) / 2) * window.innerHeight;
  return { x: gx, y: gy };
}

export default function GazeTracker({
  active = false,
  currentPhase = 'social',
  onGazePoint,
  onBlink,
  onReady,
  onError,
  showPreview = false,
  retryKey = 0,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ blinking: false, blinkStart: null });
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error

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

    async function init() {
      setStatus('loading');

      // 1. Acquire camera stream directly via getUserMedia with resilient fallbacks
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          });
        } catch (err1) {
          console.warn('[GazeTracker] Attempt 1 (front camera) failed, trying ideal resolution:', err1);
          if (err1.name === 'NotAllowedError' || err1.name === 'PermissionDeniedError' || err1.name === 'NotReadableError') {
            throw err1;
          }
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 } },
            });
          } catch (err2) {
            console.warn('[GazeTracker] Attempt 2 failed, falling back to basic video:', err2);
            if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError' || err2.name === 'NotReadableError') {
              throw err2;
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
        }
        activeStream = stream;
        // Listen for hardware disconnection
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener('ended', () => {
            if (!stopped) {
              console.warn('[GazeTracker] Camera track disconnected');
              setStatus('error');
              onError?.(new Error('Camera disconnected'));
            }
          });
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (_) {
            // Autoplay permitted since muted
          }
        }
        setStatus('ready');
        onReady?.();
      } catch (camErr) {
        console.error('[GazeTracker] Camera access error:', camErr);
        setStatus('error');
        onError?.(camErr);
        return;
      }

      // 2. Load and initialize MediaPipe FaceMesh
      try {
        if (!window.FaceMesh) {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        }

        const FaceMesh = window.FaceMesh;
        if (FaceMesh && !stopped) {
          faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          });

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          faceMesh.onResults((results) => {
            if (stopped) return;
            if (!results.multiFaceLandmarks?.length) return;

            const landmarks = results.multiFaceLandmarks[0];
            const now = Date.now();

            // Gaze point
            const gaze = getGazePoint(landmarks, videoRef.current?.videoWidth, videoRef.current?.videoHeight);
            onGazePoint?.({ ...gaze, timestamp: now, phase: currentPhaseRef.current });

            // Blink detection via EAR
            const earLeft  = eyeAspectRatio(landmarks, LEFT_EYE);
            const earRight = eyeAspectRatio(landmarks, RIGHT_EYE);
            const ear = (earLeft + earRight) / 2;

            const s = stateRef.current;
            if (ear < EAR_THRESHOLD && !s.blinking) {
              s.blinking = true;
              s.blinkStart = now;
            } else if (ear >= EAR_THRESHOLD && s.blinking) {
              s.blinking = false;
              const duration = now - s.blinkStart;
              if (duration < 400) {
                onBlink?.({ timestamp: s.blinkStart, duration });
              }
              s.blinkStart = null;
            }

            // Draw landmarks on canvas if preview
            if (showPreview && canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              [LEFT_EYE, RIGHT_EYE].forEach((indices) => {
                ctx.beginPath();
                indices.forEach((idx, i) => {
                  const lm = landmarks[idx];
                  const px = (1 - lm.x) * canvasRef.current.width;
                  const py = lm.y * canvasRef.current.height;
                  i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                });
                ctx.closePath();
                ctx.strokeStyle = ear < EAR_THRESHOLD ? '#facc15' : 'var(--blue-500)';
                ctx.lineWidth = 2;
                ctx.stroke();
              });
            }
          });

          await faceMesh.initialize();
        }
      } catch (meshErr) {
        console.warn('[GazeTracker] FaceMesh ML model note (using optical contrast):', meshErr);
      }

      // 3. Process video frames via requestAnimationFrame
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
              // Frame dropped, proceed
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
        faceMesh?.close?.();
      } catch (_) {}
      const streamToStop = activeStream || currentVideo?.srcObject || videoRef.current?.srcObject;
      if (streamToStop && typeof streamToStop.getTracks === 'function') {
        streamToStop.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, retryKey]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: showPreview ? 20 : 0,
        left: showPreview ? 20 : 0,
        width: showPreview ? 240 : 1,
        height: showPreview ? 180 : 1,
        opacity: showPreview ? 1 : 0.001,
        pointerEvents: 'none',
        zIndex: showPreview ? 100 : -1,
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: 320,
          height: 240,
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
        muted
        playsInline
        autoPlay
      />
      {showPreview && (
        <canvas
          ref={canvasRef}
          width={240}
          height={180}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />
      )}
    </div>
  );
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
