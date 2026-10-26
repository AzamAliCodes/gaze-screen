import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const server = resolve(root, 'server');
const venv = resolve(server, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const systemPython = process.env.PYTHON || 'python';
const env = { ...process.env, PYTHONPATH: [server, process.env.PYTHONPATH].filter(Boolean).join(delimiter) };
function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
const action = process.argv[2];
if (action === 'setup') {
  if (!existsSync(venv)) run(systemPython, ['-m', 'venv', resolve(server, '.venv')]);
  run(venv, ['-m', 'pip', 'install', '-r', resolve(server, 'requirements.txt')]);
} else {
  const python = existsSync(venv) ? venv : systemPython;
  if (action === 'train') {
    const mat = resolve(root, process.argv[3] || 'Pupil_dataset.mat');
    if (!existsSync(mat)) { console.error('Dataset not found: ' + mat); process.exit(1); }
    run(python, ['-u', '-m', 'gazescreen_model.extract', '--mat', mat, '--out', 'server/data']);
    run(python, ['-u', '-m', 'gazescreen_model.train', '--data', 'server/data', '--out', 'server/artifacts']);
    run(python, ['-m', 'gazescreen_model.export_web']);
  } else if (action === 'export') {
    run(python, ['-m', 'gazescreen_model.export_web']);
  } else if (action === 'serve') {
    run(python, ['-m', 'uvicorn', 'gazescreen_model.api:app', '--host', '127.0.0.1', '--port', '8000']);
  } else if (action === 'test') {
    run(python, ['-m', 'unittest', 'discover', '-s', 'server/tests', '-v']);
  } else {
    console.error('Use setup, train, export, serve or test.'); process.exit(1);
  }
}
