"""Export fitted sklearn logistic pipelines for exact browser inference."""
import argparse
import json
from pathlib import Path

import joblib


def portable(bundle):
    imputer, scaler, classifier = bundle['pipeline'].steps
    return {
        'feature_names': bundle['feature_names'], 'schema': bundle['schema'],
        'protocol': bundle['protocol'], 'version': bundle['model_version'],
        'mean': scaler[1].mean_.tolist(), 'scale': scaler[1].scale_.tolist(),
        'coefficients': classifier[1].coef_[0].tolist(), 'intercept': float(classifier[1].intercept_[0]),
        'imputer_statistics': imputer[1].statistics_.tolist(),
        'training_participants': bundle['training_participants'],
        'feature_ranges': bundle['feature_training_ranges'],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artifacts', type=Path, default=Path('server/artifacts'))
    parser.add_argument('--out', type=Path, default=Path('public/models/research-v1.json'))
    args = parser.parse_args()
    evaluation = json.loads((args.artifacts/'evaluation.json').read_text())
    records = json.loads((args.artifacts/'demo_records.json').read_text())
    models = {str(i): portable(joblib.load(args.artifacts/f'fold_{i}.joblib')) for i in range(1, 6)}
    export = {
        'format': 'gazescreen-logistic-v1', 'source_sha256': evaluation['source_sha256'],
        'full_model': portable(joblib.load(args.artifacts/'research_model.joblib')),
        'fold_models': models, 'records': records,
        'evaluation': {k: evaluation[k] for k in ['participants_evaluated', 'groups_evaluated', 'validation',
            'results', 'features', 'excluded_low_quality', 'limitations']},
        'attribution': {'url': 'https://doi.org/10.6084/m9.figshare.7218725', 'license': 'CC BY 4.0',
                        'authors': 'Rojas-Líbano, Wainstein and Ossandón'},
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(export, indent=2, allow_nan=False), encoding='utf-8')
    print(f'Exported learned coefficients and {len(records)} out-of-fold examples to {args.out}')


if __name__ == '__main__':
    main()
