# Runs every code challenge's solution against its tests (and checks the starter does NOT already pass).
import json, subprocess, sys, sqlite3, tempfile, os
tasks = json.load(open(sys.argv[1]))
norm = lambda s: '\n'.join(l.rstrip() for l in s.replace('\r', '').split('\n')).strip()
def run(lang, code, setup):
    try:
        if lang == 'python':
            r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=10)
            return r.stdout + r.stderr, r.returncode != 0
        if lang == 'javascript':
            r = subprocess.run(['node', '-e', code], capture_output=True, text=True, timeout=10)
            return r.stdout + r.stderr, r.returncode != 0
        if lang == 'lua':
            import lupa
            L = lupa.LuaRuntime(); out = []
            L.globals().print = lambda *a: out.append('\t'.join('nil' if x is None else ('true' if x is True else 'false' if x is False else (str(int(x)) if isinstance(x, float) and x.is_integer() and False else str(x))) for x in a))
            try: L.execute(code); return '\n'.join(out), False
            except Exception as e: return '\n'.join(out) + '\n' + str(e), True
        if lang == 'sql':
            db = sqlite3.connect(':memory:')
            if setup: db.executescript(setup)
            rows, cur = [], None
            stmts = [s for s in code.split(';') if s.strip()]
            for s in stmts: cur = db.execute(s)
            if cur and cur.description: rows = cur.fetchall()
            fmt = lambda v: '' if v is None else str(v)
            return '\n'.join('|'.join(fmt(v) for v in r) for r in rows), False
    except subprocess.TimeoutExpired: return 'timeout', True
    except Exception as e: return str(e), True
for t in tasks:
    def passes(src):
        for x in t['tests']:
            prog = src if t['lang'] == 'sql' else (x.get('pre') or '') + '\n' + src + '\n' + (x.get('post') or '')
            out, err = run(t['lang'], prog, t['setup'])
            if err or norm(out) != norm(x['expect']): return False, out
        return True, ''
    ok, out = passes(t['solution'])
    if not ok: print(f"{t['w']}: solution fails its tests (got: {out.strip()[:160]!r})")
    elif t['starter'].strip() and passes(t['starter'])[0]: print(f"{t['w']}: starter code already passes the tests")
