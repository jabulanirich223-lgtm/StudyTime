import { useEffect, useState } from 'react';
import { SUBJECTS, unitStyle, unitName } from '../data';
import { useGame, today, levelOf } from '../lib/store';
import { useUI } from '../lib/ui';
import { nid, startNode } from '../lib/launch';
import { snd } from '../lib/sound';
import { confetti, burst } from '../lib/fx';
import { Tock } from '../components/Tock';
import { Svg, SVG, iconUrl, CourseIcon } from '../components/Icons';
import type { NodeKind } from '../lib/types';

const NODES: NodeKind[] = ['learn', 'p1', 'p2', 'test'];
const nodesOf = (u: { lab?: unknown[] }): NodeKind[] => (u.lab?.length ? ['learn', 'p1', 'lab', 'p2', 'test'] : NODES);
const XP_OF = (k: NodeKind) => (k === 'test' ? 20 : k === 'lab' ? 15 : 10);
const NODE_NAME: Record<NodeKind, string> = { learn: 'Learn', p1: 'Practice 1', p2: 'Practice 2', lab: 'Challenge', test: 'Unit Test' };
const NODE_DESC: Record<NodeKind, string> = {
  learn: 'Read short notes on the big ideas, then answer a few quick checks.',
  p1: "Practice the first half of this unit's questions.",
  p2: "Practice the second half of this unit's questions.",
  lab: 'A hands-on challenge: write real code or type your own answers. You can skip any task.',
  test: 'Every question in the unit, shuffled.',
};
const NODE_ICON: Record<NodeKind, string> = { learn: SVG.scroll, p1: SVG.star, p2: SVG.dumbbell, lab: SVG.bolt, test: SVG.trophy };
const OFFS = [0, 52, 78, 52, 0, -52, -78, -52];
const ROW = 112;

export function Guidebook({ ui: idx }: { ui: number }) {
  const g = useGame();
  const s = SUBJECTS[g.subject], u = s.units[idx], st = unitStyle(g.subject, idx);
  return (
    <div style={{ ['--u' as string]: st.c }}>
      <div className="row" style={{ gap: 14 }}><CourseIcon icon={st.icon} size={64} /><div><div className="muted small">{unitName(s, idx)} · {u.period}</div><h2>{u.title}</h2></div></div>
      {u.learn.map((c) => <div className="gb" key={c.h}><h4>{c.h}</h4><p>{c.b}</p>{c.code && <pre className="snippet">{c.code}</pre>}</div>)}
      <button className="btn wide" style={{ marginTop: 16 }} onClick={() => useUI.getState().close()}>Got it</button>
    </div>
  );
}

export function Learn() {
  const g = useGame();
  const ui = useUI();
  const [open, setOpen] = useState<string | null>(null);
  const s = SUBJECTS[g.subject];
  useEffect(() => { const c = () => setOpen(null); window.addEventListener('scroll', c); return () => window.removeEventListener('scroll', c); }, []);
  let first: string | null = null;
  s.units.forEach((u0, ui2) => nodesOf(u0).forEach((k) => { if (!first && !g.done[nid(ui2, k)]) first = nid(ui2, k); }));
  const atRisk = g.streak > 0 && g.lastDay !== today();

  const go = (ui2: number, k: NodeKind) => {
    setOpen(null);
    if (startNode(ui2, k) === 'no-hearts') ui.open(<OutOfHearts />);
  };
  const openChest = (ui2: number) => {
    const cid = nid(ui2, 'chest');
    if (g.chests[cid]) return;
    if (!g.done[nid(ui2, 'test')]) { snd('bad'); ui.toast('Chest locked', `Pass the ${unitName(s, ui2)} test to open it`, SVG.medal); return; }
    const gems = 15 + Math.floor(Math.random() * 26);
    const bonus = Math.random() < 0.4 ? g.addXP(10) : 0;
    useGame.getState().set({ chests: { ...useGame.getState().chests, [cid]: today() }, gems: useGame.getState().gems + gems });
    snd('chest'); confetti(); burst(document.querySelector(`[aria-label^="${unitName(s, ui2)} treasure chest"]`), ['#ffc800', '#ff9600', '#ffffff'], 40);
    ui.open(<div className="center"><div className="chest-open"><div className="rays" /><img src={iconUrl('chestopen')} alt="Open treasure chest" /></div>
      <h2>Chest opened!</h2><p className="pill gem" style={{ display: 'inline-flex', fontSize: 20 }}><Svg html={SVG.gem} />+{gems} gems</p>
      {bonus > 0 && <p style={{ color: 'var(--orange-d)', fontWeight: 900 }}>+{bonus} bonus XP</p>}
      <button className="btn wide" onClick={() => ui.close()}>Nice</button></div>);
  };

  return (
    <>
      <div className="card mob-only" style={{ marginBottom: 16, alignItems: 'center', gap: 14 }}>
        <div className="lvl-badge">{levelOf(g.xp)}</div>
        <div style={{ flex: 1, minWidth: 0 }}><b>Daily goal</b><div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${Math.min(100, (g.daily.xp / g.goal) * 100)}%` }} /></div>
          <span className="muted small">{g.daily.xp}/{g.goal} XP today</span></div>
      </div>
      {s.units.map((u, ui2) => {
        const st = unitStyle(g.subject, ui2);
        const ns = nodesOf(u), n = ns.length + 1;
        const offs = Array.from({ length: n }, (_, k) => OFFS[(ui2 * 5 + k) % 8]);
        const pts = offs.map((o, k) => [150 + o, 26 + ROW / 2 + k * ROW]);
        let d = `M${pts[0][0]} ${pts[0][1]}`;
        for (let k = 1; k < pts.length; k++) d += ` C${pts[k - 1][0]} ${pts[k - 1][1] + ROW / 2} ${pts[k][0]} ${pts[k][1] - ROW / 2} ${pts[k][0]} ${pts[k][1]}`;
        const cid = nid(ui2, 'chest'), opened = g.chests[cid], ready = !opened && g.done[nid(ui2, 'test')];
        return (
          <section className="unit" key={ui2} style={{ ['--u' as string]: st.c, ['--ud' as string]: st.d }}>
            <div className="banner">
              <span className="banner-ico"><CourseIcon icon={st.icon} size={74} /></span>
              <div className="banner-txt"><h2>{unitName(s, ui2)}</h2><p>{u.title} · {u.period}</p></div>
              <button className="guide" onClick={() => ui.open(<Guidebook ui={ui2} />)}><Svg html={SVG.book} /><span>Guidebook</span></button>
            </div>
            <div className="path">
              <svg className="trail" viewBox={`0 0 300 ${26 + n * ROW}`} style={{ height: 26 + n * ROW }} aria-hidden="true"><path d={d} /></svg>
              {ns.map((k, ki) => {
                const id = nid(ui2, k), done = g.done[id], cur = id === first, off = offs[ki];
                return (
                  <div className="stop" key={k} style={{ transform: `translateX(${off}px)`, zIndex: open === id ? 9 : undefined }}>
                    {cur && <div className="start">{done ? 'AGAIN' : 'START'}</div>}
                    {cur && <div className={`side-masc ${off > 0 ? 'left' : 'right'}`}><Tock mood={atRisk ? 'sleepy' : 'idle'} /></div>}
                    <button className={`node ${k === 'lab' ? 'lab ' : ''}${done ? 'done' : cur ? 'cur' : 'later'}`} aria-label={`${unitName(s, ui2)} ${NODE_NAME[k]}${done ? ', completed' : ''}`}
                      onClick={() => { snd('tap'); setOpen(open === id ? null : id); }}><Svg html={NODE_ICON[k]} /></button>
                    <span className="stop-label">{NODE_NAME[k]}</span>
                    {open === id && (
                      <div className="pop" style={{ ['--pb' as string]: done ? '#eab308' : st.c, ['--ax' as string]: `${off}px`, translate: `calc(-50% - ${off}px) 0` }}>
                        <b>{NODE_NAME[k]} · {u.title}</b><p>{NODE_DESC[k]}</p>
                        <button className="btn white wide" onClick={() => go(ui2, k)}>{done ? 'Practice again' : 'Start'} +{XP_OF(k)} XP</button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="stop" style={{ transform: `translateX(${offs[n - 1]}px)` }}>
                <button className={`chest ${opened ? 'opened' : ready ? 'ready' : 'locked'}`} onClick={() => openChest(ui2)}
                  aria-label={`${unitName(s, ui2)} treasure chest${opened ? ', opened' : ready ? ', ready to open' : ', locked'}`}>
                  <img src={iconUrl(opened ? 'chestopen' : 'chest')} alt="" />
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

export function OutOfHearts() {
  const ui = useUI();
  return (
    <div className="center"><Tock mood="sad" size={130} /><h2>You're out of hearts</h2>
      <p className="muted">Practice your mistakes to refill them, use a Cram mode (no hearts), or buy a refill in the Shop.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn purple" onClick={() => { ui.close(); import('../lib/launch').then((m) => m.startReview()); }}>Review mistakes</button>
        <button className="btn ghost" onClick={() => ui.close()}>Close</button>
      </div>
    </div>
  );
}
