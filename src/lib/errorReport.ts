// Crash reports without a third-party SDK (O5, doc 05): the same small report the website sends to its own
// `POST /api/client-errors` (web `frontend/src/utils/errorReporting.ts`, server checks in
// `backend/src/validation/clientError.schemas.ts`, both read at web main c50ce1fb on 2026-11-26).
//
// What a report holds: the kind, a scrubbed message, the screen's route PATTERN (never its values) and the
// app version. Never an account, token, email, place, cycle data, counts or anything the person logged.
// The message is scrubbed here as well as on the server (links cut to their origin, emails and long numbers
// removed). Nothing is sent yet: sending arrives with the API client (P2-10), see `deliver`.

export type ClientErrorKind = 'error' | 'rejection' | 'render';

export interface ClientErrorPayload {
  kind: ClientErrorKind;
  message: string;
  route: string;
  version: string;
}

/** The server's limits (clientError.schemas.ts). */
const MAX_MESSAGE = 1000;
const MAX_ROUTE = 100;
const ROUTE_RE = /^\/[\w/:.-]*$/;
const VERSION_RE = /^\d{1,3}\.\d{1,3}\.\d{1,4}$/;
/** The web sends at most 10 per page load; here per app session. */
export const MAX_PER_SESSION = 10;

const IGNORED_MESSAGES = [/^AbortError/i, /aborted/i, /Network request failed/i];

function messageOf(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error)?.slice(0, 300) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/** The server's scrub (clientError.service.ts `scrubMessage`), done on the phone too. */
export function scrubMessage(raw: string): string {
  return (
    raw
      .replace(/https?:\/\/[^\s'")]+/gi, (url) => {
        const m = /^(https?:\/\/[^/?#\s]+)/i.exec(url);
        return m ? m[1]! : '<url>';
      })
      .replace(/[^\s@'"<>]+@[^\s@'"<>]+\.[a-z]{2,}/gi, '<email>')
      .replace(/\d{3,}/g, '#')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_MESSAGE) || 'unknown'
  );
}

/**
 * The route pattern from expo-router segments: groups such as `(tabs)` dropped, dynamic segments kept
 * as their pattern (`[id]`, never the value). Anything the server would refuse becomes "/unknown".
 */
export function routePattern(segments: readonly string[]): string {
  const parts = segments.filter((s) => s && !/^\(.*\)$/.test(s));
  const path = `/${parts.map((s) => s.replace(/^\[(\.\.\.)?(.+)\]$/, ':$2')).join('/')}`;
  return path.length <= MAX_ROUTE && ROUTE_RE.test(path) ? path : '/unknown';
}

/** Builds the report, or null when this error should not be reported. */
export function buildReport(
  error: unknown,
  kind: ClientErrorKind,
  ctx: { route: string; version: string }
): ClientErrorPayload | null {
  const raw = messageOf(error);
  if (IGNORED_MESSAGES.some((re) => re.test(raw))) return null;
  if (!VERSION_RE.test(ctx.version)) return null;
  return {
    kind,
    message: scrubMessage(raw),
    route: ROUTE_RE.test(ctx.route) && ctx.route.length <= MAX_ROUTE ? ctx.route : '/unknown',
    version: ctx.version,
  };
}

/** Once per distinct error and at most MAX_PER_SESSION per session, like the web. */
export function createReporter(deliver: (payload: ClientErrorPayload) => void) {
  const seen = new Set<string>();
  let sent = 0;
  return (payload: ClientErrorPayload): boolean => {
    const key = `${payload.kind}|${payload.message}|${payload.route}`;
    if (seen.has(key) || sent >= MAX_PER_SESSION) return false;
    seen.add(key);
    sent += 1;
    try {
      deliver(payload);
    } catch {
      // Reporting must never throw.
    }
    return true;
  };
}
