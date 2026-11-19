// The rules for the locale files (task P2-06). Pure and import-free so both the `i18n:check` script
// (Node) and the unit tests can load it.

export type Tree = { [key: string]: string | Tree };

export interface Finding {
  key: string;
  problem: string;
}

export function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    if (typeof v === 'string') out[prefix + k] = v;
    else Object.assign(out, flatten(v, `${prefix}${k}.`));
  }
  return out;
}

const placeholders = (s: string) =>
  [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

const BANGLA = /[ঀ-৿]/;

/** Prototype-only switch labels are English in both files and are not checked for script. */
const DEV_PREFIX = 'proto.';

/**
 * Every English key needs a Bangla key and the other way round; placeholders must match; no empty
 * text; no em dashes in user-facing copy; Bangla text must be in Bangla script, never romanised.
 */
export function checkLocales(en: Tree, bn: Tree): Finding[] {
  const e = flatten(en);
  const b = flatten(bn);
  const findings: Finding[] = [];
  for (const [key, text] of Object.entries(e)) {
    const other = b[key];
    if (other === undefined) {
      findings.push({ key, problem: 'missing in bn' });
      continue;
    }
    if (text.trim() === '' || other.trim() === '') findings.push({ key, problem: 'empty text' });
    if (placeholders(text) !== placeholders(other)) {
      findings.push({ key, problem: 'placeholders differ between en and bn' });
    }
    if (/—/.test(text) || /—/.test(other)) {
      findings.push({ key, problem: 'em dash in copy' });
    }
    if (!key.startsWith(DEV_PREFIX)) {
      const letters = other.replace(/\{\{\s*\w+\s*\}\}/g, '');
      if (/[A-Za-z]/.test(letters) && !BANGLA.test(letters)) {
        findings.push({ key, problem: 'bn text is not in Bangla script' });
      }
    }
  }
  for (const key of Object.keys(b)) {
    if (e[key] === undefined) findings.push({ key, problem: 'missing in en' });
  }
  return findings;
}
