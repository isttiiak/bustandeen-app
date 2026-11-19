// `npm run i18n:check`: every English string has a Bangla string and the two agree (see
// src/locales/check.ts for the rules). Loads the TypeScript file directly (Node strips the types).
import { readFileSync } from 'node:fs';

import { checkLocales } from '../src/locales/check.ts';

const load = (lang) =>
  JSON.parse(readFileSync(new URL(`../src/locales/${lang}/common.json`, import.meta.url), 'utf8'));
const findings = checkLocales(load('en'), load('bn'));
if (findings.length > 0) {
  for (const f of findings) process.stderr.write(`${f.key}: ${f.problem}\n`);
  process.stderr.write(`i18n:check failed: ${findings.length} problem(s).\n`);
  process.exit(1);
}
process.stdout.write('i18n:check passed.\n');
