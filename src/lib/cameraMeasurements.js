const EYES = [[33, 160, 158, 133, 153, 144], [362, 385, 387, 263, 373, 380]];
export function eyeAspectRatio(landmarks, width, height) {
  if (!(width > 0 && height > 0)) return null;
  const values = EYES.map(indices => {
    const points = indices.map(i => landmarks[i]);
    if (points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return NaN;
    const distance = (a, b) => Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
    const denominator = 2 * distance(points[0], points[3]);
    return denominator > 0 ? (distance(points[1], points[5]) + distance(points[2], points[4])) / denominator : NaN;
  });
  return values.every(Number.isFinite) ? (values[0] + values[1]) / 2 : null;
}
// A blink requires observed open -> closed -> open eyes, without a tracking gap.
// Fixed EAR thresholds are approximate, not an individualized calibration.
export class BlinkDetector {
  constructor() { this.reset(); }
  reset() { this.lastTime = null; this.closedAt = null; this.wasOpen = false; }
  update(ear, timestamp) {
    if (!Number.isFinite(ear) || (this.lastTime !== null && timestamp - this.lastTime > 250)) this.reset();
    this.lastTime = timestamp;
    if (!Number.isFinite(ear)) return null;
    if (ear >= 0.24) {
      const duration = this.closedAt === null ? null : timestamp - this.closedAt;
      this.wasOpen = true; this.closedAt = null;
      return duration !== null && duration >= 50 && duration <= 400 ? { timestamp, duration } : null;
    }
    if (ear < 0.21 && this.wasOpen && this.closedAt === null) { this.closedAt = timestamp; this.wasOpen = false; }
    return null;
  }
}
export function summarizeCamera(session, endedAt) {
  if (session.startedAt === null || !session.frames) throw new Error('No measured frames to report.');
  const seconds = Math.max(0, (endedAt - session.startedAt) / 1000);
  const coverage = session.trackedFrames / session.frames;
  const trackedSeconds = session.trackedMs / 1000;
  return { type: 'camera_observations', createdAt: new Date().toISOString(), durationSeconds: seconds,
    frames: session.frames, trackedFrames: session.trackedFrames, faceCoverage: coverage, trackedSeconds,
    processedFps: seconds > 0 ? session.frames / seconds : 0, estimatedBlinks: session.blinks,
    estimatedBlinksPerMinute: trackedSeconds >= 10 && coverage >= 0.7 ? session.blinks * 60 / trackedSeconds : null,
    diagnosticPrediction: null, limitations: ['Face and blink estimates only; no screen gaze or pupil diameter is measured.',
      'Blink estimates use fixed eye-openness thresholds and can miss or falsely count blinks.',
      'These observations are incompatible with the laboratory research model and do not assess ADHD.'] };
}

