// Runs learner JavaScript in a worker and returns what it printed.
self.onmessage = (e: MessageEvent<string>) => {
  const out: string[] = [];
  const fmt = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v) ?? String(v));
  const con = { log: (...a: unknown[]) => out.push(a.map(fmt).join(' ')), error: (...a: unknown[]) => out.push(a.map(fmt).join(' ')), warn: (...a: unknown[]) => out.push(a.map(fmt).join(' ')) };
  try {
    new Function('console', e.data)(con);
    postMessage({ out: out.join('\n') });
  } catch (err) {
    postMessage({ out: out.join('\n'), error: String(err) });
  }
};
