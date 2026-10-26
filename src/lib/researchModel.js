export function predictLinear(model, features) {
  if (!model?.feature_names?.length || Object.keys(features).length !== model.feature_names.length) {
    throw new Error('This recording has an incompatible feature schema.');
  }
  let logit = model.intercept;
  model.feature_names.forEach((name, index) => {
    const value = features[name];
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Missing measurement: ${name}`);
    if (!(model.scale[index] > 0) || !Number.isFinite(model.coefficients[index])) throw new Error('Invalid model weights.');
    logit += ((value - model.mean[index]) / model.scale[index]) * model.coefficients[index];
  });
  const score = logit >= 0 ? 1 / (1 + Math.exp(-logit)) : Math.exp(logit) / (1 + Math.exp(logit));
  if (!Number.isFinite(score)) throw new Error('Model could not produce a finite result.');
  return { model_score: score, research_class: score >= 0.5 ? 'ADHD' : 'control' };
}

export function predictResearchSample(bundle, sampleId) {
  if (bundle.format !== 'gazescreen-logistic-v1') throw new Error('Unsupported model format.');
  const record = bundle.records.find(row => row.sample_id === sampleId);
  if (!record) throw new Error('Unknown research recording.');
  const model = bundle.fold_models[String(record.fold)];
  if (!model || model.training_participants.includes(record.participant_id)) {
    throw new Error('This recording was not excluded from model training.');
  }
  const result = predictLinear(model, record.features);
  return { ...result, sample_id: sampleId, observed_group: record.observed_group,
    correct: result.research_class === record.observed_group, mode: 'out_of_fold_research_demo',
    participant_excluded_from_training: true, model_version: model.version,
    diagnostic_use_validated: false, webcam_use_validated: false, quality: record.quality };
}

export async function loadResearchModel(signal) {
  const response = await fetch(`${import.meta.env.BASE_URL}models/research-v1.json`, { signal });
  if (!response.ok) throw new Error('The research model could not be loaded. Please retry.');
  const bundle = await response.json();
  if (bundle.format !== 'gazescreen-logistic-v1' || !bundle.records?.length) throw new Error('The model file is incomplete.');
  return bundle;
}

export async function runResearchSample(bundle, sampleId, signal) {
  const api = import.meta.env.VITE_RESEARCH_API_URL?.replace(/\/$/, '');
  if (!api) return { ...predictResearchSample(bundle, sampleId), inference_location: 'browser' };
  const response = await fetch(`${api}/api/predict-demo`, { method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sample_id: sampleId }) });
  if (!response.ok) throw new Error('The prediction service is unavailable. Please retry.');
  const result = await response.json();
  if (result.sample_id !== sampleId || result.participant_excluded_from_training !== true || !Number.isFinite(result.model_score)) {
    throw new Error('The prediction service returned an incompatible result.');
  }
  return { ...result, inference_location: 'server' };
}
