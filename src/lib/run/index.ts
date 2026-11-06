import JsWorker from './js.worker.ts?worker';
import PyWorker from './py.worker.ts?worker';
import LuaWorker from './lua.worker.ts?worker';

export type RunResult = { out: string; error?: string; timedOut?: boolean };
export type CodeLang = 'python' | 'javascript' | 'lua' | 'sql';

let pyWorker: Worker | null = null; // kept alive so Python only loads once
let pyReady = false;

function runIn(make: () => Worker, code: string, ms: number, keep = false): Promise<RunResult> {
  return new Promise((res) => {
    const w = keep ? (pyWorker = pyWorker || make()) : make();
    const t = setTimeout(() => { w.terminate(); if (keep) pyWorker = null; res({ out: '', error: 'Your code took too long. Check for a loop that never ends.', timedOut: true }); }, ms);
    w.onmessage = (e) => { clearTimeout(t); if (!keep) w.terminate(); res(e.data as RunResult); };
    w.onerror = (e) => { clearTimeout(t); if (!keep) w.terminate(); res({ out: '', error: e.message || 'Could not run the code.' }); };
    w.postMessage(code);
  });
}

async function runSQL(setup: string, query: string): Promise<RunResult> {
  try {
    const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')]);
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    const db = new SQL.Database();
    if (setup) db.run(setup);
    const res = db.exec(query);
    db.close();
    const last = res[res.length - 1];
    return { out: last ? last.values.map((r) => r.join('|')).join('\n') : '' };
  } catch (err) { return { out: '', error: String(err) }; }
}

export function runCode(lang: CodeLang, code: string, setup = ''): Promise<RunResult> {
  if (lang === 'javascript') return runIn(() => new JsWorker(), code, 3000);
  if (lang === 'lua') return runIn(() => new LuaWorker(), code, 3000);
  if (lang === 'python') return runIn(() => new PyWorker(), code, pyReady ? 15000 : 120000, true).then((r) => { if (!r.timedOut) pyReady = true; return r; });
  return runSQL(setup, code);
}

export const norm = (s: string) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim();
