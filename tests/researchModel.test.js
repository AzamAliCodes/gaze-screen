import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { predictLinear, predictResearchSample } from '../src/lib/researchModel.js';
const bundle = JSON.parse(readFileSync(new URL('../public/models/research-v1.json', import.meta.url), 'utf8'));
test('all 47 browser predictions match held-out Python scores and reported errors', () => {
  let correct = 0, fn = 0, fp = 0;
  assert.equal(bundle.records.length, 47);
  const participants = new Set();
  for (const record of bundle.records) {
    const result = predictResearchSample(bundle, record.sample_id);
    assert.ok(Math.abs(result.model_score - record.oof_model_score) < 1e-12);
    assert.equal(result.diagnostic_use_validated, false);
    assert.equal(result.webcam_use_validated, false);
    assert.ok(!participants.has(record.participant_id));
    participants.add(record.participant_id);
    if (result.correct) correct++;
    if (result.observed_group === 'ADHD' && result.research_class === 'control') fn++;
    if (result.observed_group === 'control' && result.research_class === 'ADHD') fp++;
  }
  assert.equal(correct, 34); assert.equal(fn, 11); assert.equal(fp, 2);
});
test('training leakage and unknown samples are rejected', () => {
  assert.throws(() => predictResearchSample(bundle, 'missing'), /Unknown/);
  const changed = structuredClone(bundle), row = changed.records[0];
  changed.fold_models[String(row.fold)].training_participants.push(row.participant_id);
  assert.throws(() => predictResearchSample(changed, row.sample_id), /not excluded/);
});
test('missing, invalid and extra measurements cannot produce a prediction', () => {
  const row = bundle.records[0], model = bundle.fold_models[String(row.fold)], feature = model.feature_names[0];
  const missing = { ...row.features }; delete missing[feature];
  for (const values of [missing, { ...row.features, [feature]: null }, { ...row.features, [feature]: NaN },
    { ...row.features, unrelated: 10 }]) assert.throws(() => predictLinear(model, values));
});
