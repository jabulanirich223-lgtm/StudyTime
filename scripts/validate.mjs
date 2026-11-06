// Checks a course JSON file: node scripts/validate.mjs src/data/courses/<file>.json
import fs from 'fs';
const f = process.argv[2];
const data = JSON.parse(fs.readFileSync(f, 'utf8'));
const errs = [];
let units = 0, qs = 0, labs = 0;
const codeTasks = [];
for (const [id, c] of Object.entries(data)) {
  if (!c.name) errs.push(`${id}: missing name`);
  if (!Array.isArray(c.units) || c.units.length < 3) errs.push(`${id}: needs at least 3 units`);
  (c.units || []).forEach((u, ui) => {
    units++;
    const at = `${id} unit ${ui + 1}`;
    if (!u.title) errs.push(`${at}: missing title`);
    if (!Array.isArray(u.learn) || u.learn.length < 2) errs.push(`${at}: needs 2+ learn cards`);
    (u.learn || []).forEach((l) => { if (!l.h || !l.b) errs.push(`${at}: learn card needs h and b`); });
    if (!Array.isArray(u.qs) || u.qs.length < 6) errs.push(`${at}: needs 6+ questions`);
    if (!Array.isArray(u.qs) || u.qs.length < 6) errs.push(`${at}: needs 6+ questions`);
    const check = (q, w) => {
      if (!q.q) errs.push(`${w}: missing q`);
      if (q.t === 'mc') { if (!Array.isArray(q.o) || q.o.length !== 4) errs.push(`${w}: mc needs 4 options`); if (!(q.a >= 0 && q.a < 4)) errs.push(`${w}: bad answer index`); if (new Set(q.o).size !== q.o?.length) errs.push(`${w}: duplicate options`); if (q.code != null && typeof q.code !== 'string') errs.push(`${w}: code must be a string`); }
      else if (q.t === 'tf') { if (typeof q.a !== 'boolean') errs.push(`${w}: tf answer must be true/false`); }
      else if (q.t === 'match') { if (!Array.isArray(q.pairs) || q.pairs.length !== 4 || q.pairs.some((p) => p.length !== 2)) errs.push(`${w}: match needs 4 pairs`); }
      else if (q.t === 'order') { if (!Array.isArray(q.items) || q.items.length !== 4 || q.items.some((p) => typeof p[1] !== 'number')) errs.push(`${w}: order needs 4 [label, number] items`); else if (q.items.some((p, i) => i && p[1] <= q.items[i - 1][1])) errs.push(`${w}: order items must be listed in correct order with increasing numbers`); }
      else if (q.t === 'input') { if (!Array.isArray(q.a) || !q.a.length || q.a.some((x) => typeof x !== 'string' || !x.trim())) errs.push(`${w}: input needs a: [accepted answers]`); }
      else if (q.t === 'parsons') { if (!Array.isArray(q.lines) || q.lines.length < 3 || q.lines.length > 8) errs.push(`${w}: parsons needs 3-8 lines`); else if (new Set(q.lines).size !== q.lines.length) errs.push(`${w}: parsons lines must be unique`); }
      else if (q.t === 'code') {
        if (!['python', 'javascript', 'lua', 'sql'].includes(q.lang)) errs.push(`${w}: code lang must be python/javascript/lua/sql`);
        if (!q.solution) errs.push(`${w}: code needs solution`);
        if (!Array.isArray(q.tests) || !q.tests.length || q.tests.some((t) => typeof t.expect !== 'string')) errs.push(`${w}: code needs tests [{pre?,post?,expect}]`);
        else codeTasks.push({ w, lang: q.lang, solution: q.solution, starter: q.starter || '', setup: q.setup || '', tests: q.tests });
      }
      else errs.push(`${w}: unknown type ${q.t}`);
    };
    (u.qs || []).forEach((q, k) => { qs++; check(q, `${at} q${k + 1}`); });
    (u.lab || []).forEach((q, k) => { labs++; check(q, `${at} lab${k + 1}`); });
  });
}
if (codeTasks.length) {
  const { execFileSync } = await import('child_process');
  const tmp = `/tmp/st-code-${process.pid}.json`;
  fs.writeFileSync(tmp, JSON.stringify(codeTasks));
  try { const r = execFileSync('python3', [new URL('./check_code.py', import.meta.url).pathname, tmp], { encoding: 'utf8', maxBuffer: 1e8 }); if (r.trim()) errs.push(...r.trim().split('\n')); }
  catch (e) { errs.push('code checker crashed: ' + (e.stdout || e.message)); }
}
if (errs.length) { console.log(`FAIL (${errs.length} problems)\n` + errs.slice(0, 40).join('\n')); process.exit(1); }
console.log(`OK: ${Object.keys(data).length} courses, ${units} units, ${qs} questions, ${labs} challenge tasks (${codeTasks.length} runnable, all solutions pass)`);
