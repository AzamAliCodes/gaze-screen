import test from 'node:test';
import assert from 'node:assert/strict';
import { BlinkDetector, eyeAspectRatio, summarizeCamera } from '../src/lib/cameraMeasurements.js';
test('blink detection requires open-closed-open and resets across lost faces', () => {
  const detector = new BlinkDetector();
  assert.equal(detector.update(.1, 0), null);
  assert.equal(detector.update(.3, 100), null);
  assert.equal(detector.update(.1, 150), null);
  assert.deepEqual(detector.update(.3, 250), { timestamp: 250, duration: 100 });
  detector.update(.1, 300); detector.update(null, 350);
  assert.equal(detector.update(.3, 400), null);
  detector.update(.1, 450);
  assert.equal(detector.update(.3, 900), null);
});
test('eye ratios use pixel geometry, not distorted normalized coordinates', () => {
  const points = [];
  const coordinates = [[0,0],[.1,.2],[.3,.2],[.4,0],[.3,-.2],[.1,-.2]];
  for (const indices of [[33,160,158,133,153,144],[362,385,387,263,373,380]]) {
    indices.forEach((index, i) => { points[index] = { x: coordinates[i][0], y: coordinates[i][1] }; });
  }
  assert.ok(Math.abs(eyeAspectRatio(points, 640, 480) - .75) < 1e-12);
  assert.equal(eyeAspectRatio([], 640, 480), null);
});
test('no-face and short sessions do not invent blink rates or diagnostic scores', () => {
  const report = summarizeCamera({ startedAt:0, frames:10, trackedFrames:0, trackedMs:0, blinks:0 }, 1000);
  assert.equal(report.faceCoverage,0); assert.equal(report.estimatedBlinksPerMinute,null);
  assert.equal(report.diagnosticPrediction,null);
  assert.throws(() => summarizeCamera({startedAt:null,frames:0},1000), /No measured frames/);
  const tracked = summarizeCamera({ startedAt:0, frames:200, trackedFrames:180, trackedMs:10000, blinks:2 }, 12000);
  assert.equal(tracked.estimatedBlinksPerMinute,12);
});
