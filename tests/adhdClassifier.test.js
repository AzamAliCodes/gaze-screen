import test from 'node:test';
import assert from 'node:assert/strict';
import { getCohortInfo, deriveMetrics, computeRiskScore, HBN_ADHD_MODEL } from '../src/lib/classifier.js';

test('HBN ADHD model metadata and parameters are defined', () => {
  assert.equal(HBN_ADHD_MODEL.featureNames.length, 17);
  assert.equal(HBN_ADHD_MODEL.imputed.length, 17);
  assert.equal(HBN_ADHD_MODEL.offset.length, 17);
  assert.equal(HBN_ADHD_MODEL.scale.length, 17);
  assert.equal(HBN_ADHD_MODEL.coefficients.length, 17);
  assert.equal(typeof HBN_ADHD_MODEL.intercept, 'number');
});

test('cohort definitions span all age groups with realistic norms', () => {
  const child = getCohortInfo(4);
  const school = getCohortInfo(9);
  const teen = getCohortInfo(15);
  const adult = getCohortInfo(24);

  assert.equal(child.cohortId, 'preschool');
  assert.equal(school.cohortId, 'school');
  assert.equal(teen.cohortId, 'teen');
  assert.equal(adult.cohortId, 'adult');

  assert.ok(adult.norms.avgFixationDuration.typical > child.norms.avgFixationDuration.typical);
});

test('empty or insufficient gaze observations return hasData: false without fabrication', () => {
  const empty = deriveMetrics([], [], 60, 4);
  assert.equal(empty.hasData, false);
  assert.equal(empty.sampleCount, 0);

  const res = computeRiskScore(empty, 4);
  assert.equal(res.hasData, false);
  assert.equal(res.level, 'unobserved');
  assert.equal(res.score, null);
});

test('ADHD subject with high social attention correctly receives a moderate/elevated ADHD attention score', () => {
  const points = [];
  const start = 100000;
  let t = start;
  let cluster = 0;
  while (t < start + 30000) {
    const isSecondHalf = (t - start) > 15000;
    const dwell = 5 + (cluster % 4); // variable short fixations (132 - 231ms)
    const cx = 0.5 + ((cluster * 11) % 9 - 4) * 0.09;
    const cy = 0.5 + ((cluster * 13) % 9 - 4) * 0.09;
    const spread = isSecondHalf ? 0.06 : 0.02;
    for (let s = 0; s < dwell && t < start + 30000; s++) {
      const x = Math.max(0.05, Math.min(0.95, cx + (Math.random() - 0.5) * spread));
      const y = Math.max(0.05, Math.min(0.95, cy + (Math.random() - 0.5) * spread));
      // Normal social attention preference (looking at faces)
      points.push({ x, y, timestamp: t, phase: 'social' });
      t += 33;
    }
    cluster++;
  }

  const blinks = [{ timestamp: start + 5000, duration: 120 }, { timestamp: start + 15000, duration: 110 }];
  const metrics = deriveMetrics(points, blinks, 30, 22);

  assert.ok(metrics.hasData);
  assert.ok(metrics.socialAttentionRatio > 0.75); // High social attention
  assert.ok(metrics.saccadeFrequency > 3.0);

  const result = computeRiskScore(metrics, 22);
  assert.ok(result.hasData);
  // An ADHD individual MUST NOT be penalized into typical low-risk because of looking at faces!
  assert.ok(result.adhdScore >= 50, `Expected ADHD score >= 50, got ${result.adhdScore}`);
  assert.ok(result.adhdLevel === 'moderate' || result.adhdLevel === 'elevated');
});

test('neurotypical steady gaze profile yields typical low-risk attention index', () => {
  const points = [];
  const start = 100000;
  let t = start;
  let cluster = 0;
  while (t < start + 30000) {
    const dwell = 11 + (cluster % 4); // steady long fixations (~360 - 450ms)
    const cx = 0.5 + ((cluster * 3) % 5 - 2) * 0.04;
    const cy = 0.5 + ((cluster * 5) % 5 - 2) * 0.04;
    for (let s = 0; s < dwell && t < start + 30000; s++) {
      const x = Math.max(0.1, Math.min(0.9, cx + (Math.random() - 0.5) * 0.02));
      const y = Math.max(0.1, Math.min(0.9, cy + (Math.random() - 0.5) * 0.02));
      points.push({ x, y, timestamp: t, phase: 'social' });
      t += 33;
    }
    cluster++;
  }

  const metrics = deriveMetrics(points, [], 30, 22);
  const result = computeRiskScore(metrics, 22);
  assert.ok(result.adhdScore < 45, `Expected typical score < 45, got ${result.adhdScore}`);
  assert.equal(result.adhdLevel, 'low');
});
