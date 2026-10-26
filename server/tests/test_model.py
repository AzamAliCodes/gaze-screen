import json
from pathlib import Path
import unittest

from fastapi.testclient import TestClient
import joblib
import numpy as np

from gazescreen_model.api import create_app, predict_bundle
from gazescreen_model.features import PROTOCOL, SCHEMA, behavior_features

ROOT = Path(__file__).resolve().parents[1]


class ResearchModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = json.loads((ROOT / "artifacts/demo_records.json").read_text())
        cls.evaluation = json.loads((ROOT / "artifacts/evaluation.json").read_text())

    def test_every_demo_is_unseen_and_matches_evaluation(self):
        seen = []
        models = {i: joblib.load(ROOT / f"artifacts/fold_{i}.joblib") for i in range(1, 6)}
        for row in self.records:
            seen.append(row['participant_id'])
            model = models[row['fold']]
            self.assertNotIn(row['participant_id'], model['training_participants'])
            result = predict_bundle(model, row['features'])
            self.assertAlmostEqual(result['model_score'], row['oof_model_score'], places=12)
        self.assertEqual(len(seen), len(set(seen)))
        self.assertEqual(len(seen), self.evaluation['participants_evaluated'])

    def test_full_model_contains_only_eligible_unique_participants(self):
        model = joblib.load(ROOT / 'artifacts/research_model.joblib')
        self.assertEqual(set(model['training_participants']), {r['participant_id'] for r in self.records})

    def test_missing_response_is_not_fabricated(self):
        perform = np.array([1.] * 20 + [0.] * 5 + [np.nan] * 5)
        rt = np.array([500.] * 25 + [np.nan] * 5)
        load = np.array([1, 2] * 15)
        values = behavior_features(perform, rt, load)
        self.assertAlmostEqual(values['accuracy_responded'], .8)
        self.assertAlmostEqual(values['omission_fraction'], 5/30)
        self.assertAlmostEqual(values['median_correct_rt_ms'], 500.)

    def test_api_valid_and_invalid_inputs(self):
        with TestClient(create_app(ROOT / 'artifacts')) as client:
            self.assertEqual(client.get('/health').status_code, 200)
            self.assertEqual(len(client.get('/api/demo-samples').json()), len(self.records))
            sample = self.records[0]
            demo = client.post('/api/predict-demo', json={'sample_id': sample['sample_id']})
            self.assertEqual(demo.status_code, 200)
            self.assertTrue(demo.json()['participant_excluded_from_training'])
            self.assertFalse(demo.json()['diagnostic_use_validated'])
            self.assertEqual(client.post('/api/predict-demo', json={'sample_id': '../research_model.joblib'}).status_code, 404)
            payload = {'protocol': PROTOCOL, 'schema_version': SCHEMA, 'acquisition': 'EyeLink1000',
                       'sample_rate_hz': 1000, 'age_years': sample['age'], 'trial_count': 160,
                       **sample['quality'], 'features': sample['features']}
            self.assertEqual(client.post('/api/predict', json=payload).status_code, 200)
            for changed in [{'acquisition': 'webcam'}, {'age_years': 25}, {'gaze_valid_fraction': .1},
                            {'sample_rate_hz': 30}, {'features': {}}, {'protocol': 'social-video'}]:
                self.assertEqual(client.post('/api/predict', json={**payload, **changed}).status_code, 422)
            self.assertEqual(client.post('/api/predict', json={**payload, 'features': {**sample['features'], 'accuracy_responded': 4}}).status_code, 422)


if __name__ == '__main__':
    unittest.main()
