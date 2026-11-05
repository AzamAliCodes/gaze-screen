/**
 * faceMeshLoader.js — High-performance MediaPipe FaceMesh singleton loader
 *
 * Provides:
 *  - Parallel pre-warming: preloads script & wasm neural weights before /stimulus
 *  - WebGL context preservation: avoids context churn by reusing the single initialized instance
 *  - CDN fallback & resilient timeouts
 */

let scriptLoadingPromise = null;
let instancePromise = null;
let instanceRef = null;

export function loadFaceMeshScript(timeoutMs = 15000) {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.FaceMesh) return Promise.resolve(window.FaceMesh);
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="@mediapipe/face_mesh"]');
    if (existing && window.FaceMesh) {
      resolve(window.FaceMesh);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';
    script.async = true;

    const timer = setTimeout(() => {
      script.onload = null;
      script.onerror = null;
      scriptLoadingPromise = null;
      reject(new Error(`Network timeout: loading MediaPipe script exceeded ${timeoutMs / 1000}s`));
    }, timeoutMs);

    script.onload = () => {
      clearTimeout(timer);
      if (window.FaceMesh) {
        resolve(window.FaceMesh);
      } else {
        scriptLoadingPromise = null;
        reject(new Error('MediaPipe script loaded but window.FaceMesh was undefined.'));
      }
    };

    script.onerror = () => {
      clearTimeout(timer);
      scriptLoadingPromise = null;
      reject(new Error('Network error: failed to fetch MediaPipe FaceMesh from CDN. Check connection.'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function getFaceMeshInstance(onProgress) {
  if (instanceRef) {
    onProgress?.({ stage: 'model_ok', step: 2, total: 3, message: 'AI neural eye-tracking model ready (cached)' });
    return Promise.resolve(instanceRef);
  }
  if (instancePromise) {
    return instancePromise;
  }

  instancePromise = (async () => {
    onProgress?.({ stage: 'model', step: 2, total: 3, message: 'Loading MediaPipe AI model neural assets...' });
    await loadFaceMeshScript();

    const FaceMesh = window.FaceMesh;
    const instance = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    instance.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    onProgress?.({ stage: 'pipeline', step: 3, total: 3, message: 'Compiling neural WebAssembly pipeline...' });

    await Promise.race([
      instance.initialize(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MediaPipe neural network compilation timed out (15s)')), 15000)
      ),
    ]);

    instanceRef = instance;
    onProgress?.({ stage: 'ready', step: 3, total: 3, message: 'Sensors and neural AI tracking locked' });
    return instance;
  })().catch((err) => {
    instancePromise = null;
    throw err;
  });

  return instancePromise;
}

export function preloadFaceMesh() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  // Non-blocking pre-warm: starts background download & initialization
  return getFaceMeshInstance().catch((err) => {
    console.warn('[faceMeshLoader] Pre-warm notice (non-fatal):', err.message);
    return null;
  });
}
