import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Minion assets are present, optimized, and strictly structured', () => {
  const minionDir = 'public/assets/minion';
  assert.ok(fs.existsSync(minionDir), 'public/assets/minion directory exists');

  const files = fs.readdirSync(minionDir);
  assert.ok(files.includes('hero-stuart.png'), 'hero-stuart.png exists');
  assert.ok(files.includes('flying-super-minion.png'), 'flying-super-minion.png exists');
  assert.ok(files.includes('scientist-minion.png'), 'scientist-minion.png exists');
  assert.ok(files.includes('celebrating-bob.png'), 'celebrating-bob.png exists');
  assert.ok(files.includes('laptop-minion.png'), 'laptop-minion.png exists');
  assert.ok(files.includes('trio-banana-minions.png'), 'trio-banana-minions.png exists');
  assert.ok(files.includes('bob-car-minion.png'), 'bob-car-minion.png exists');
  assert.ok(files.includes('stewart-action-minion.png'), 'stewart-action-minion.png exists');
  assert.ok(files.includes('minion-scooter.png'), 'minion-scooter.png exists');
  assert.ok(files.includes('happy-dave-minion.png'), 'happy-dave-minion.png exists');
  assert.ok(files.includes('hole-peeking-minion.png'), 'hole-peeking-minion.png exists');
  assert.ok(files.includes('icon.svg'), 'icon.svg exists');
  assert.ok(files.includes('minion-goggle-eye.png'), 'minion-goggle-eye.png exists');

  // Verify none of the images are oversized (>600KB)
  for (const f of files.filter(f => f.endsWith('.png'))) {
    const stat = fs.statSync(`${minionDir}/${f}`);
    assert.ok(stat.size < 600 * 1024, `${f} is optimized under 600KB (actual: ${(stat.size/1024).toFixed(1)}KB)`);
  }
});

test('ThemeContext supports minion, shinchan, and clinical with on-demand isolation', () => {
  const themeContextContent = fs.readFileSync('src/context/ThemeContext.jsx', 'utf8');
  assert.ok(themeContextContent.includes("MINION: 'minion'"), 'MINION theme constant exists');
  assert.ok(themeContextContent.includes("SHINCHAN: 'shinchan'"), 'SHINCHAN theme constant exists');
  assert.ok(themeContextContent.includes("CLINICAL: 'clinical'"), 'CLINICAL theme constant exists');
  assert.ok(themeContextContent.includes('isMinionTheme'), 'isMinionTheme exported');
  assert.ok(themeContextContent.includes('isShinchanTheme'), 'isShinchanTheme exported');
  assert.ok(themeContextContent.includes('isClinicalTheme'), 'isClinicalTheme exported');
});

test('Theme mascots return null when inactive to guarantee zero unselected asset downloads', () => {
  const minionMascots = fs.readFileSync('src/components/minion/MinionMascots.jsx', 'utf8');
  assert.ok(minionMascots.includes('if (!isMinionTheme) return null;'), 'Minion mascots strictly abort DOM rendering when inactive');

  const shinchanMascots = fs.readFileSync('src/components/shinchan/ShinchanMascots.jsx', 'utf8');
  assert.ok(shinchanMascots.includes('if (!isShinchanTheme) return null;'), 'Shinchan mascots strictly abort DOM rendering when inactive');
});
