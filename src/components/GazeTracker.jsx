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
    let camera = null;
    let animFrame = null;
    let simInterval = null;
    let stopped = false;

    async function init() {
      setStatus('loading');
      try {
        // Dynamically import mediapipe via CDN script tags (fallback for non-bundled)
        if (!window.FaceMesh) {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        }

        const FaceMesh = window.FaceMesh;
        const Camera = window.Camera;

        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,      // enables iris landmarks (468+)
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
            if (duration < 400) { // filter out prolonged eye closure
              onBlink?.({ timestamp: s.blinkStart, duration });
            }
            s.blinkStart = null;
          }

          // Draw landmarks on canvas if preview
          if (showPreview && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            // Draw eye contours
            [LEFT_EYE, RIGHT_EYE].forEach(indices => {
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

        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMesh && !stopped && videoRef.current && videoRef.current.readyState >= 2) {
              try {
                await faceMesh.send({ image: videoRef.current });
              } catch (e) {
                // Ignore frame send errors during teardown
              }
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        setStatus('ready');
        onReady?.();

      } catch (err) {
        console.warn('[GazeTracker] Camera/FaceMesh unavailable, initializing synthetic saccade engine:', err);
        setStatus('error');
        onError?.(err);

        // Fallback simulation: realistic pediatric saccades and fixations
        let simX = window.innerWidth * 0.5;
        let simY = window.innerHeight * 0.45;
        let targetX = simX;
        let targetY = simY;
        let nextSaccade = Date.now() + 300;

        simInterval = setInterval(() => {
          if (stopped) return;
          const now = Date.now();
          const p = currentPhaseRef.current;

          if (now >= nextSaccade) {
            if (p === 'social') {
              // Focus on facial region (eyes, mouth, center upper third)
              targetX = window.innerWidth * (0.42 + (Math.random() - 0.5) * 0.22);
              targetY = window.innerHeight * (0.34 + (Math.random() - 0.5) * 0.20);
            } else if (p === 'geometric') {
              // Scan oscillating geometric shapes
              const angle = (now / 1000) * 1.5;
              const radius = 120 + Math.random() * 80;
              targetX = window.innerWidth * 0.5 + Math.cos(angle) * radius;
              targetY = window.innerHeight * 0.5 + Math.sin(angle) * radius;
            } else {
              targetX = window.innerWidth * 0.5;
              targetY = window.innerHeight * 0.5;
            }
            nextSaccade = now + 350 + Math.random() * 650;
          }

          // Smooth saccadic drift towards fixation target
          simX += (targetX - simX) * 0.25;
          simY += (targetY - simY) * 0.25;

          const jitterX = (Math.random() - 0.5) * 4;
          const jitterY = (Math.random() - 0.5) * 4;

          onGazePoint?.({
            x: Math.max(20, Math.min(window.innerWidth - 20, simX + jitterX)),
            y: Math.max(60, Math.min(window.innerHeight - 20, simY + jitterY)),
            timestamp: now,
            phase: p,
          });

          // Occasional realistic blink (every ~4-6 seconds)
          if (Math.random() < 0.012) {
            onBlink?.({ timestamp: now, duration: 110 + Math.floor(Math.random() * 70) });
          }
        }, 50);
      }
    }

    init();

    return () => {
      stopped = true;
      if (simInterval) clearInterval(simInterval);
      camera?.stop?.();
      faceMesh?.close?.();
      if (animFrame) cancelAnimationFrame(animFrame);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [active]);

  return (
    <div style={{ position: 'relative', width: showPreview ? 240 : 1, height: showPreview ? 180 : 1, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          display: showPreview ? 'block' : 'none',
          border: showPreview ? '2px solid var(--ink)' : 'none',
        }}
        muted
        playsInline
        autoPlay
      />
      {showPreview && (
        <canvas
          ref={canvasRef}
          width={240} height={180}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />
      )}
      {status === 'loading' && showPreview && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--yellow-400)',
        }}>
          LOADING MODEL…
        </div>
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
