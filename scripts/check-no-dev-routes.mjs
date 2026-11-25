// Fails when a production bundle contains development-only screens (task P2-04). Exports the app the
// way a release build bundles it (`__DEV__` false, minified) and searches the bundle for strings
// that only exist in dev-only code. Usage: npm run check:dev-routes
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// One marker per dev-only screen. Add the marker string when a new dev route is added.
const MARKERS = ['Design gallery', 'Storage spike (G7)', 'Crash test (dev)'];

const out = mkdtempSync(join(tmpdir(), 'bustandeen-export-'));
try {
  execFileSync('npx', ['expo', 'export', '--platform', 'android', '--output-dir', out], {
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(hbc|js|bundle)$/.test(name)) files.push(p);
    }
  };
  walk(out);
  if (files.length === 0) throw new Error('No bundle found in the export output.');

  const hits = [];
  for (const file of files) {
    const text = readFileSync(file).toString('latin1');
    for (const marker of MARKERS) if (text.includes(marker)) hits.push(`${marker} in ${file}`);
  }
  if (hits.length > 0) {
    console.error(`Dev-only code found in the production bundle:\n${hits.join('\n')}`);
    process.exit(1);
  }
  process.stdout.write(`OK: ${files.length} bundle file(s) checked, no dev-only screens.\n`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
