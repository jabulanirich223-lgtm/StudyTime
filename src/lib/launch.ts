import { SUBJECTS, unitStyle, unitName } from '../data';
import { useGame } from './store';
import { useUI } from './ui';
import { shuffle, fmtYear } from './util';
import type { Item, MC, NodeKind, Question, TF } from './types';

const sub = () => SUBJECTS[useGame.getState().subject];
export const nid = (ui: number, k: string) => `${useGame.getState().subject}:${ui}:${k}`;
const copy = <T,>(a: T[]) => a.map((x) => ({ ...x }));

export function allQs(filter?: (q: Question) => boolean) {
  return sub().units.flatMap((u) => u.qs.filter((q) => !filter || filter(q)));
}

export function nodeItems(ui: number, k: NodeKind): Item[] {
  const u = sub().units[ui];
  const half = Math.ceil(u.qs.length / 2);
  if (k === 'p1') return u.qs.slice(0, half);
  if (k === 'p2') return u.qs.slice(half);
  if (k === 'test') return shuffle(u.qs);
  const quick = u.qs.filter((q) => q.t === 'mc' || q.t === 'tf').slice(0, 3);
  return [...u.learn.map((c) => ({ t: 'card' as const, ...c })), ...quick];
}

export function startNode(ui: number, k: NodeKind) {
  const s = useGame.getState();
  s.syncHearts();
  const u = sub().units[ui];
  if (!s.unlimited && s.hearts <= 0) return 'no-hearts';
  useUI.getState().start({
    kind: 'lesson', title: `${unitName(sub(), ui)} · ${u.title}`, color: unitStyle(s.subject, ui).c,
    items: copy(nodeItems(ui, k)), hearts: true, requeue: true, nodeId: nid(ui, k), nodeK: k, unit: ui,
  });
  return 'ok';
}

export function startAPSim() {
  const pool = [...shuffle(sub().apq), ...shuffle(allQs((q) => q.t === 'mc'))];
  useUI.getState().start({ kind: 'apsim', title: 'Exam Sim', items: copy(pool.slice(0, 20)), exam: true, timer: 25 * 60 });
}
export const startDrill = () => useUI.getState().start({ kind: 'drill', title: 'Source Drills', items: copy(shuffle(sub().apq)) });
export const startUnit = (ui: number) => useUI.getState().start({ kind: 'drill', title: `Unit focus · ${sub().units[ui].title}`, items: copy(shuffle(sub().units[ui].qs)), unit: ui });

export function startLightning() {
  const gen = (): Item[] => shuffle<MC | TF>([
    ...(allQs((q) => q.t === 'mc' || q.t === 'tf') as (MC | TF)[]),
    ...sub().apq.map((q) => ({ ...q, stim: null })),
  ]).map((x) => ({ ...x }));
  useUI.getState().start({ kind: 'lightning', title: 'Lightning Round', items: gen(), endless: gen, timer: 60, fast: true });
}

export function startDateDash() {
  const ev = new Map<string, number>();
  for (const q of allQs((q) => q.t === 'order')) if (q.t === 'order') q.items.forEach(([l, y]) => { if (Math.abs(y) > 100) ev.set(l, y); });
  const items: Item[] = shuffle([...ev.entries()]).slice(0, 12).map(([l, y]) => {
    const set = new Set([y]);
    const d = [3, 7, 12, 20, 30, 45, 60];
    while (set.size < 4) { const v = y + (Math.random() < 0.5 ? -1 : 1) * d[Math.floor(Math.random() * d.length)]; if (v <= 2026 && v !== 0) set.add(v); }
    const o = shuffle([...set]).map(fmtYear);
    return { t: 'year', q: `When did this happen? ${l}`, o, a: o.indexOf(fmtYear(y)), why: `${l}: ${fmtYear(y)}.` };
  });
  useUI.getState().start({ kind: 'date', title: 'Date Dash', items, fast: true });
}

export function startReview() {
  const s = useGame.getState();
  const m = s.mistakes.filter((x) => x.s === s.subject);
  if (!m.length) { useUI.getState().go('review'); return; }
  useUI.getState().start({ kind: 'review', title: 'Review', items: shuffle(m).slice(0, 15).map((x) => ({ ...x.q })) });
}

export function flashDeck() {
  return sub().units.flatMap((u, ui) => u.qs.flatMap((q) => (q.t === 'match' ? q.pairs.map(([f, b]) => ({ f, b, u: ui })) : [])));
}

export const hasDates = () => allQs((q) => q.t === 'order' && q.items.every(([, y]) => Math.abs(y) > 100)).length > 0;
