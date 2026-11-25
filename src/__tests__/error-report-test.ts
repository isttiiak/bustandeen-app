import {
  MAX_PER_SESSION,
  buildReport,
  createReporter,
  routePattern,
  scrubMessage,
  type ClientErrorPayload,
} from '@/lib/errorReport';

const ctx = { route: '/zikr', version: '1.0.0' };

describe('crash report: what it may carry', () => {
  it('holds only kind, message, route and version, in the server format', () => {
    const r = buildReport(new TypeError('x is undefined'), 'render', ctx);
    expect(r).toEqual({
      kind: 'render',
      message: 'TypeError: x is undefined',
      route: '/zikr',
      version: '1.0.0',
    });
    expect(Object.keys(r!).sort()).toEqual(['kind', 'message', 'route', 'version']);
  });

  it('scrubs emails, links, tokens and coordinates out of the message', () => {
    const raw =
      'Failed for ayesha.k@example.com at https://api.example.com/users/42?token=eyJhbGciOiJIUzI1NiJ9 ' +
      'near 23.8103,90.4125 with id 1234567890';
    const m = scrubMessage(raw);
    expect(m).not.toMatch(/ayesha|example\.com\/users|eyJhbGci|8103|4125|1234567890/);
    expect(m).toContain('<email>');
    expect(m).toContain('https://api.example.com');
  });

  it('never puts screen values in the route', () => {
    expect(routePattern(['(tabs)', 'more'])).toBe('/more');
    expect(routePattern(['zikr', 'library'])).toBe('/zikr/library');
    expect(routePattern(['cycle', '[id]'])).toBe('/cycle/:id');
    expect(routePattern([])).toBe('/');
    expect(routePattern(['a b?'])).toBe('/unknown');
    expect(
      buildReport(new Error('x'), 'error', { route: '/day/2026 11 25', version: '1.0.0' })!.route
    ).toBe('/unknown');
  });

  it('skips network aborts and a version the server would refuse; clips long messages', () => {
    expect(buildReport(new Error('AbortError: aborted'), 'rejection', ctx)).toBeNull();
    expect(buildReport(new Error('x'), 'error', { route: '/', version: 'dev' })).toBeNull();
    expect(buildReport('a'.repeat(5000), 'error', ctx)!.message.length).toBe(1000);
    expect(buildReport({ weird: true }, 'rejection', ctx)!.message).toBe('{"weird":true}');
  });
});

describe('crash report: limits', () => {
  it('sends each distinct error once, and at most 10 a session', () => {
    const sent: ClientErrorPayload[] = [];
    const report = createReporter((p) => sent.push(p));
    const p = buildReport(new Error('same'), 'error', ctx)!;
    expect(report(p)).toBe(true);
    expect(report(p)).toBe(false);
    for (let i = 0; i < 20; i++) report(buildReport(new Error(`e${'x'.repeat(i)}`), 'error', ctx)!);
    expect(sent).toHaveLength(MAX_PER_SESSION);
  });

  it('never throws when delivery fails', () => {
    const report = createReporter(() => {
      throw new Error('offline');
    });
    expect(() => report(buildReport(new Error('a'), 'error', ctx)!)).not.toThrow();
  });
});
