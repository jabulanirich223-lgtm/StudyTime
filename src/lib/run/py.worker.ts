// Runs learner Python with Pyodide (downloaded once from the jsDelivr CDN, then cached).
type Py = { runPythonAsync: (c: string, o?: never) => Promise<unknown>; setStdout: (o: { batched: (s: string) => void }) => void; setStderr: (o: { batched: (s: string) => void }) => void };
let py: Promise<Py> | null = null;
const PYO_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';
self.onmessage = async (e: MessageEvent<string>) => {
  const out: string[] = [];
  try {
    py = py || import(/* @vite-ignore */ PYO_URL).then((m) => m.loadPyodide() as Promise<Py>);
    const p = await py;
    p.setStdout({ batched: (s) => out.push(s) });
    p.setStderr({ batched: (s) => out.push(s) });
    await p.runPythonAsync(e.data, { globals: (p as unknown as { globals: { get: (k: string) => () => unknown } }).globals.get('dict')() } as never);
    postMessage({ out: out.join('\n') });
  } catch (err) {
    const msg = String(err).split('\n').filter((l) => l.trim()).slice(-1)[0] || String(err);
    postMessage({ out: out.join('\n'), error: msg });
  }
};
