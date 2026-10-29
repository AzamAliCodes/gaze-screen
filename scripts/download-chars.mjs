/**
 * Targeted approach: scrape all image URLs from recruitment site's JS chunks
 * and probe known open image sources that don't block server requests
 */
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'shinchan');
fs.mkdirSync(OUT_DIR, { recursive: true });

function get(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
        'Accept': '*/*',
        ...opts.headers,
      },
      timeout: 15000,
    }, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        get(res.headers.location, opts).then(resolve).catch(reject);
        return;
      }
      let data = [];
      res.on('data', c => data.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(data), headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function downloadBinary(url, dest) {
  const r = await get(url);
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
  const ct = r.headers['content-type'] || '';
  if (!ct.includes('image') && !ct.includes('octet')) throw new Error(`Not image: ${ct}`);
  if (r.body.length < 4000) throw new Error(`Too small: ${r.body.length}`);
  fs.writeFileSync(dest, r.body);
  return r.body.length;
}

async function save(name, url) {
  const dest = path.join(OUT_DIR, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log(`✓ EXISTS ${name}`);
    return true;
  }
  try {
    const sz = await downloadBinary(url, dest);
    console.log(`✓ ${name} — ${(sz/1024).toFixed(1)} KB`);
    return true;
  } catch(e) {
    console.error(`✗ ${name}: ${e.message}`);
    return false;
  }
}

// ── Recruitment site deeper scrape ─────────────────────────────────────────
// The site at https://recruitment.githubsrmist.in/ has more characters.
// Probe the known Next.js _next/static/media/ directory pattern
async function scrapeRecruitmentSite() {
  console.log('\n── Probing recruitment site for additional characters ──');
  const base = 'https://recruitment.githubsrmist.in';

  // Fetch the homepage JS chunks list
  const homeR = await get(base);
  const homeHtml = homeR.body.toString();

  // Extract all _next chunk script paths
  const chunkMatches = [...homeHtml.matchAll(/\/_next\/static\/chunks\/([^"']+\.js)/g)];
  const chunks = [...new Set(chunkMatches.map(m => `${base}/_next/static/chunks/${m[1]}`))];
  console.log(`  Found ${chunks.length} JS chunks`);

  // Also get the main page JS
  const allUrls = new Set();

  for (const chunkUrl of chunks.slice(0, 20)) {
    try {
      const r = await get(chunkUrl);
      const js = r.body.toString();
      // Find all /_next/static/media/*.png or /assets/*.png references
      const pngMatches = [...js.matchAll(/["'](\/_next\/static\/[^"']+\.(?:png|webp|jpg))["']/g)];
      const assetMatches = [...js.matchAll(/["'](\/assets\/[^"']+\.(?:png|webp|jpg))["']/g)];
      pngMatches.forEach(m => allUrls.add(base + m[1]));
      assetMatches.forEach(m => allUrls.add(base + m[1]));
    } catch {}
  }

  // Also parse the homepage HTML for image src attributes
  const imgMatches = [...homeHtml.matchAll(/src=["']([^"']+\.(?:png|webp|jpg))[^"']*["']/g)];
  imgMatches.forEach(m => {
    const src = m[1];
    if (src.startsWith('http')) allUrls.add(src);
    else if (src.startsWith('/')) allUrls.add(base + src);
  });

  console.log(`  Found ${allUrls.size} total image URLs on recruitment site`);

  const pngs = [...allUrls].filter(u => u.includes('.png'));
  console.log(`  PNG assets: ${pngs.length}`);
  pngs.forEach(u => console.log(`    ${u}`));

  return pngs;
}

// ── Open image sources ──────────────────────────────────────────────────────
// Wikimedia Commons and other truly open sources
const OPEN_SOURCES = [
  // Try various open/public character sheets
  {
    name: 'nohara-family.png',
    urls: [
      // Try the recruitment site's own assets with different paths
      'https://recruitment.githubsrmist.in/assets/nohara-family.png',
      'https://recruitment.githubsrmist.in/images/family.png',
    ]
  },
];

(async () => {
  // Step 1: Deep scrape recruitment site
  const recruitmentPngs = await scrapeRecruitmentSite();

  // Download all found PNGs to inspect them
  if (recruitmentPngs.length > 0) {
    console.log('\n── Downloading all recruitment site PNGs ──');
    for (const url of recruitmentPngs) {
      const fname = path.basename(url.split('?')[0]);
      const dest = path.join(OUT_DIR, 'recruit-' + fname);
      if (!fs.existsSync(dest)) {
        try {
          const sz = await downloadBinary(url, dest);
          console.log(`  ✓ recruit-${fname} — ${(sz/1024).toFixed(1)} KB`);
        } catch(e) {
          console.log(`  ✗ recruit-${fname}: ${e.message}`);
        }
      }
    }
  }

  // Final inventory
  console.log('\n=== Asset Inventory ===');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png') || f.endsWith('.webp'));
  files.forEach(f => {
    const sz = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  ${f.padEnd(50)} ${(sz/1024).toFixed(1)} KB`);
  });
})();
