import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame, levelOf, checkBadges } from '../lib/store';
import { useUI, type SessionCfg } from '../lib/ui';
import { snd } from '../lib/sound';
import { speak, stopSpeak, itemText, onSpeaking } from '../lib/speech';
import { confetti } from '../lib/fx';
import { shuffle, fmtTime, fmtYear, pick } from '../lib/util';
import { CAST } from '../data/cast';
import { Tock } from '../components/Tock';
import { Svg, SVG } from '../components/Icons';
import type { Item, Mood, Question } from '../lib/types';

type It = Item & { _rq?: boolean };
type Log = { it: Question; ok: boolean; mine: string };
type Result = {
  head: string; sub: string; xp: number; gems: number; acc: number; secs: number; bonus: number; newBest: boolean;
  apScore: number | null; log: Log[]; outHearts: boolean; perfect: boolean; mood: Mood;
};

const PRAISE = ['Excellent!', 'Nice!', 'Correct!', 'You got it!', 'Nailed it!', 'Exactly right!'];
const FIRE = ["You're on fire!", 'Unstoppable!', 'Keep it going!'];

function answerText(it: Question) {
  if (it.t === 'mc' || it.t === 'year') return it.o[it.a];
  if (it.t === 'tf') return it.a ? 'True' : 'False';
  if (it.t === 'order') return it.items.map((x) => (Math.abs(x[1]) > 100 ? `${x[0]} (${fmtYear(x[1])})` : x[0])).join(' → ');
  return it.pairs.map((p) => `${p[0]} = ${p[1]}`).join('; ');
}

export function SpeakBtn({ text, icon }: { text: () => string; icon?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => onSpeaking(setOn), []);
  return (
    <button className="speak" aria-label={on ? 'Stop reading' : 'Read aloud'} title="Read aloud (R)" data-speak
      onClick={() => (on ? stopSpeak() : speak(text()))}>
      <Svg html={SVG.speaker} />{!icon && <span>{on ? 'Stop' : 'Read aloud'}</span>}
    </button>
  );
}

export function Lesson({ cfg }: { cfg: SessionCfg }) {
  const g = useGame();
  const ui = useUI();
  const [items, setItems] = useState<It[]>(cfg.items as It[]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [sel, setSel] = useState<string | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [mSel, setMSel] = useState<{ l?: number; r?: number }>({});
  const [mOk, setMOk] = useState<number[]>([]);
  const [mBad, setMBad] = useState<number[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastOk, setLastOk] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<Result | null>(null);
  const st = useRef({ correct: 0, wrong: [] as Question[], log: [] as Log[], bonus: 0, start: Date.now(), err: false, fb: '', end: cfg.timer ? Date.now() + cfg.timer * 1000 : 0, lastSec: 0, finished: false });
  const castSeed = useRef(Math.floor(Math.random() * CAST.length));

  const it = items[i];
  const ords = useRef(new Map<number, number[]>());
  const ord = useMemo(() => {
    if (!it || (it.t !== 'mc' && it.t !== 'year')) return [];
    if (!ords.current.has(i)) ords.current.set(i, shuffle(it.o.map((_, k) => k)));
    return ords.current.get(i)!;
  }, [i, it]);
  const matchCols = useMemo(() => (it?.t === 'match' ? { L: shuffle(it.pairs.map((_, k) => k)), R: shuffle(it.pairs.map((_, k) => k)) } : null), [i, it]);
  const pool = useMemo(() => (it?.t === 'order' ? shuffle(it.items.map((_, k) => k)) : []), [i, it]);

  // ----- finishing -----
  const finish = useCallback((outHearts = false) => {
    const s = st.current;
    if (s.finished) return;
    s.finished = true;
    stopSpeak();
    const game = useGame.getState();
    const qn = s.log.length, acc = qn ? Math.round((s.correct / qn) * 100) : 100;
    const secs = Math.round((Date.now() - s.start) / 1000);
    const mistakes = [...game.mistakes];
    for (const q of s.wrong) { const c = { ...q } as Question & { _rq?: boolean }; delete c._rq; if (!mistakes.some((m) => m.q.q === c.q)) mistakes.push({ s: game.subject, q: c }); }
    const patch: Partial<typeof game> = { mistakes };
    const stats = { ...game.stats };
    const daily = { ...game.daily };
    let hearts = game.hearts, heartTs = game.heartTs;
    if (cfg.kind === 'review') {
      const fixed = new Set(s.log.filter((l) => l.ok).map((l) => l.it.q));
      const before = mistakes.length;
      patch.mistakes = mistakes.filter((m) => !(m.s === game.subject && fixed.has(m.q.q)));
      stats.fixed += before - patch.mistakes.length;
      if (!outHearts) { hearts = 5; heartTs = Date.now(); }
    }
    const perfect = !outHearts && qn > 0 && s.wrong.length === 0;
    let xp = 0, gems = 0, newBest = false, apScore: number | null = null;
    const best = { ...game.best, ap: { ...game.best.ap } };
    if (!outHearts) {
      if (cfg.kind === 'lesson') {
        xp = cfg.nodeK === 'test' ? 20 : 10; gems = cfg.nodeK === 'test' ? 15 : 5;
        if (perfect) { xp += 5; gems += 5; stats.perfect++; }
        patch.done = { ...game.done, [cfg.nodeId!]: true };
        daily.lessons++; stats.lessons++;
      } else if (cfg.kind === 'lightning') {
        xp = s.correct * 2; gems = Math.floor(s.correct / 3); daily.crams++;
        if (s.correct > best.lightning) { best.lightning = s.correct; newBest = s.correct > 0; }
      } else if (cfg.kind === 'date') { xp = s.correct; gems = 3; daily.crams++; }
      else if (cfg.kind === 'apsim') { xp = s.correct; gems = 10; }
      else { xp = Math.max(5, s.correct); gems = 5; }
      xp += s.bonus;
    }
    if (cfg.kind === 'apsim') {
      apScore = acc >= 75 ? 5 : acc >= 60 ? 4 : acc >= 45 ? 3 : acc >= 30 ? 2 : 1;
      if (!best.ap[game.subject] || apScore > best.ap[game.subject]!) best.ap[game.subject] = apScore;
    }
    const lvBefore = levelOf(game.xp);
    game.set({ ...patch, stats, daily, best, hearts, heartTs, gems: game.gems + gems });
    xp = useGame.getState().addXP(xp);
    const lvAfter = levelOf(useGame.getState().xp);
    const badges = checkBadges();
    const head = outHearts ? 'Out of hearts' : cfg.kind === 'lightning' ? "Time's up!" : cfg.kind === 'apsim' ? 'Exam complete!' : perfect ? 'Perfect lesson!' : 'Lesson complete!';
    const mood: Mood = outHearts ? 'sad' : lvAfter > lvBefore ? 'trophy' : acc >= 60 || cfg.kind === 'lightning' ? 'cheer' : 'think';
    setResult({ head, sub: cfg.title, xp, gems, acc, secs, bonus: s.bonus, newBest, apScore, log: s.log, outHearts, perfect, mood });
    if (outHearts) snd('bad');
    else { snd('done'); if (perfect || cfg.kind === 'lightning' || cfg.kind === 'apsim') confetti(); }
    let d = 700;
    if (lvAfter > lvBefore) {
      setTimeout(() => {
        snd('level'); confetti();
        ui.open(<div className="center"><Tock mood="trophy" size={170} /><h2>Level {lvAfter}!</h2><p className="muted">Tock is proud of you. Keep climbing.</p><button className="btn wide" onClick={() => useUI.getState().close()}>Let's go</button></div>);
      }, d);
      d += 900;
    }
    badges.forEach((n) => { setTimeout(() => snd('badge'), d); ui.toast(`Badge earned: ${n}`, '+20 gems', SVG.medal, d); d += 900; });
  }, [cfg, ui]);

  // ----- timer -----
  useEffect(() => {
    if (!cfg.timer) return;
    const iv = setInterval(() => {
      const left = st.current.end - Date.now();
      setNow(Date.now());
      const sec = Math.ceil(left / 1000);
      if (sec <= 5 && sec > 0 && sec !== st.current.lastSec) { st.current.lastSec = sec; snd('tick'); }
      if (left <= 0) { clearInterval(iv); finish(); }
    }, 250);
    return () => clearInterval(iv);
  }, [cfg.timer, finish]);

  // auto-read new item
  useEffect(() => {
    stopSpeak();
    if (it && useGame.getState().autoRead && !cfg.fast && phase === 'answer') {
      const t = setTimeout(() => speak(itemText(it, ord)), 250);
      return () => clearTimeout(t);
    }
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRight = (v: string | null = sel): boolean => {
    if (!it || it.t === 'card') return true;
    if (it.t === 'mc' || it.t === 'year') return v != null && Number(v) === it.a;
    if (it.t === 'tf') return (v === '1') === it.a;
    if (it.t === 'order') return order.every((v, k) => v === k);
    return !st.current.err;
  };
  const mineText = (v: string | null = sel): string => {
    if (!it || it.t === 'card') return '';
    if (it.t === 'mc' || it.t === 'year') return v == null ? '—' : it.o[Number(v)];
    if (it.t === 'tf') return v === '1' ? 'True' : 'False';
    if (it.t === 'order') return order.map((k) => it.items[k][0]).join(' → ');
    return st.current.err ? 'Some pairs wrong' : 'All pairs right';
  };

  const next = useCallback(() => {
    const game = useGame.getState();
    if (cfg.hearts && !game.unlimited && game.hearts <= 0) { finish(true); return; }
    const n = i + 1;
    let list = items;
    if (cfg.endless && n >= items.length) { list = [...items, ...(cfg.endless() as It[])]; setItems(list); }
    if (!cfg.endless && n >= list.length) { finish(); return; }
    setI(n); setPhase('answer'); setSel(null); setOrder([]); setMSel({}); setMOk([]); setMBad([]); st.current.err = false;
  }, [cfg, i, items, finish]);

  const check = useCallback((skip = false, v: string | null = sel) => {
    if (!it || it.t === 'card' || phase !== 'answer') return;
    const ok = !skip && isRight(v);
    const s = st.current;
    if (ok) s.correct++; else s.wrong.push(it);
    s.log.push({ it, ok, mine: skip ? '(skipped)' : mineText(v) });
    let c = ok ? combo + 1 : 0;
    if (ok && c % 5 === 0) s.bonus += 3;
    setCombo(c);
    const game = useGame.getState();
    if (c > game.stats.maxCombo) game.set({ stats: { ...game.stats, maxCombo: c } });
    if (!ok && cfg.hearts) game.loseHeart();
    if (!ok && cfg.requeue && !it._rq) setItems((l) => [...l, { ...it, _rq: true }]);
    if (cfg.exam) { snd('tap'); next(); return; }
    snd(ok ? (c && c % 5 === 0 ? 'combo' : 'ok') : 'bad');
    setLastOk(ok); setPhase('feedback');
    s.fb = (ok ? 'Correct! ' : `Not quite. The correct answer is: ${answerText(it)}. `) + ('why' in it && it.why ? it.why : '');
    if (useGame.getState().autoRead && !cfg.fast) speak(s.fb); else stopSpeak();
    if (cfg.fast && ok) setTimeout(() => { if (!st.current.finished) nextRef.current(); }, 650);
  }, [it, phase, combo, cfg, next, sel]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextRef = useRef(next); nextRef.current = next;

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result) { if (e.key === 'Enter') ui.endSession(); return; }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) { (document.querySelector('.lesson [data-speak]') as HTMLButtonElement | null)?.click(); return; }
      if (phase === 'answer') {
        const n = Number(e.key);
        if (n >= 1 && n <= 4) (document.querySelectorAll('.lesson .opt')[n - 1] as HTMLButtonElement | undefined)?.click();
        if (e.key === 'Enter') { if (it?.t === 'card') next(); else if (ready()) check(); }
      } else if (e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const quit = () => {
    if (st.current.log.length === 0 || result) { stopSpeak(); ui.endSession(); return; }
    ui.open(<div className="center"><Tock mood="sad" size={120} /><h2>Quit this lesson?</h2><p className="muted">Your progress in this lesson will be lost.</p>
      <div className="row" style={{ justifyContent: 'center' }}><button className="btn red" onClick={() => { st.current.finished = true; stopSpeak(); ui.close(); ui.endSession(); }}>Quit</button><button className="btn ghost" onClick={() => ui.close()}>Keep going</button></div></div>);
  };

  const ready = () => {
    if (!it) return false;
    if (it.t === 'mc' || it.t === 'year' || it.t === 'tf') return sel != null;
    if (it.t === 'order') return order.length === it.items.length;
    return false;
  };

  // ----- match -----
  const tapMatch = (side: 'l' | 'r', k: number) => {
    if (phase !== 'answer' || mOk.includes(k + (side === 'l' ? 0 : 1000))) return;
    const nx = { ...mSel, [side]: k };
    if (nx.l != null && nx.r != null) {
      if (nx.l === nx.r) {
        const ok2 = [...mOk, nx.l, nx.r + 1000];
        setMOk(ok2); setMSel({}); snd('tap');
        if (it?.t === 'match' && ok2.length === it.pairs.length * 2) setTimeout(() => check(), 250);
      } else {
        st.current.err = true; snd('bad'); setMBad([nx.l, nx.r + 1000]); setMSel({});
        setTimeout(() => setMBad([]), 450);
      }
    } else { setMSel(nx); snd('tap'); }
  };

  // ----- render -----
  if (result) return <Results r={result} cfg={cfg} />;
  if (!it) return null;
  const total = items.length;
  const left = cfg.timer ? st.current.end - now : 0;
  const pct = cfg.timer ? Math.max(0, (left / (cfg.timer * 1000)) * 100) : (i / total) * 100;
  const asker = it.t !== 'card' && !('stim' in it && it.stim) && !cfg.fast && cfg.kind !== 'apsim' ? CAST[(i + castSeed.current) % CAST.length] : null;
  const kind = it.t === 'card' ? 'New idea' : it.t === 'mc' ? ('ap' in it && it.ap ? 'AP source question' : 'Choose the answer') : it.t === 'tf' ? 'True or false?' : it.t === 'match' ? 'Tap the matching pairs' : it.t === 'order' ? 'Put in order' : 'Date Dash';
  const footMood: Mood = lastOk ? (combo >= 5 ? 'fire' : 'cheer') : 'sad';

  return (
    <div className="lesson" style={{ ['--u' as string]: cfg.color || 'var(--brand)' }}>
      <div className="l-top">
        <button className="l-x" aria-label="Quit" onClick={quit}><Svg html={SVG.close} /></button>
        <div className={`bar${combo >= 3 && !cfg.exam ? ' hot' : ''}`}><i style={{ width: `${pct}%`, background: cfg.timer ? 'var(--orange)' : undefined }} /></div>
        {combo >= 3 && !cfg.exam && <span className="combo" key={combo}><Svg html={SVG.fire} />×{combo}</span>}
        {cfg.timer ? <span className="timer"><Svg html={SVG.clock} />{fmtTime(left)}</span>
          : cfg.hearts ? <span className="pill heart"><Svg html={SVG.heart} />{g.unlimited ? '∞' : g.hearts}</span>
          : <span className="muted small">{i + 1}/{total}</span>}
      </div>
      <div className="l-body">
        <div className="l-inner">
          {it.t === 'card' ? (
            <div className="learncard">
              <Tock mood="think" />
              <div className="qcard">
                <div className="qhead"><span className="qkind"><i />{cfg.title}</span><SpeakBtn text={() => itemText(it)} /></div>
                <h3>{it.h}</h3>
                <p>{it.b}</p>
              </div>
            </div>
          ) : (
            <div className="qcard">
              <div className="qhead"><span className="qkind"><i />{kind}</span>{!cfg.fast && <SpeakBtn text={() => itemText(it, ord)} />}</div>
              {'stim' in it && it.stim && <div className="stim">{it.stim}<span className="src">Source: {it.src}</span></div>}
              {asker ? (
                <div className="asker"><img src={asker.img} alt={asker.name} /><div className="speech"><span className="who">{asker.name}</span><h2 className="qtext">{it.q}</h2></div></div>
              ) : <h2 className="qtext">{it.q}</h2>}

              {(it.t === 'mc' || it.t === 'year') && (
                <div className="opts">{ord.map((oi, n) => {
                  const cls = phase === 'feedback' ? (oi === it.a ? 'right' : String(oi) === sel ? 'wrong' : '') : String(oi) === sel ? 'sel' : '';
                  return <button key={oi} className={`opt ${cls}`} disabled={phase !== 'answer'} onClick={() => { setSel(String(oi)); if (!cfg.fast) snd('tap'); if (cfg.fast) check(false, String(oi)); }}>
                    <span className="k">{'abcd'[n]})</span>{it.o[oi]}</button>;
                })}</div>
              )}
              {it.t === 'tf' && (
                <div className="tf">{['1', '0'].map((v) => {
                  const right = (v === '1') === it.a;
                  const cls = phase === 'feedback' ? (right ? 'right' : v === sel ? 'wrong' : '') : v === sel ? 'sel' : '';
                  return <button key={v} className={`opt ${cls}`} disabled={phase !== 'answer'} onClick={() => { setSel(v); if (!cfg.fast) snd('tap'); if (cfg.fast) check(false, v); }}>{v === '1' ? 'True' : 'False'}</button>;
                })}</div>
              )}
              {it.t === 'match' && matchCols && (
                <div className="match">
                  <div className="col">{matchCols.L.map((k) => <button key={k} className={`mt ${mOk.includes(k) ? 'ok' : mBad.includes(k) ? 'bad' : mSel.l === k ? 'sel' : ''}`} onClick={() => tapMatch('l', k)}>{it.pairs[k][0]}</button>)}</div>
                  <div className="col">{matchCols.R.map((k) => <button key={k} className={`mt ${mOk.includes(k + 1000) ? 'ok' : mBad.includes(k + 1000) ? 'bad' : mSel.r === k ? 'sel' : ''}`} onClick={() => tapMatch('r', k)}>{it.pairs[k][1]}</button>)}</div>
                </div>
              )}
              {it.t === 'order' && (
                <>
                  <div className="slots">{order.length ? order.map((k, n) => (
                    <button key={k} className="mt" disabled={phase !== 'answer'} onClick={() => setOrder(order.filter((x) => x !== k))}><span className="n">{n + 1}</span>{it.items[k][0]}{phase === 'feedback' && Math.abs(it.items[k][1]) > 100 && <span className="muted small" style={{ marginLeft: 'auto' }}>{fmtYear(it.items[k][1])}</span>}</button>
                  )) : <span className="muted small">Tap events below, earliest first</span>}</div>
                  <div className="pool">{pool.map((k) => <button key={k} className={`mt ${order.includes(k) ? 'used' : ''}`} onClick={() => { if (phase === 'answer') { setOrder([...order, k]); snd('tap'); } }}>{it.items[k][0]}</button>)}</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`l-foot ${phase === 'feedback' ? (lastOk ? 'ok' : 'bad') : ''}`}>
        <div className="l-foot-in">
          {it.t === 'card' ? (<><span /><button className="btn" onClick={next}>Continue</button></>)
          : phase === 'feedback' ? (
            <>
              <div className="fb"><Tock mood={footMood} /><div><b>{lastOk ? (combo >= 5 ? pick(FIRE) : combo >= 3 ? `${combo} in a row!` : PRAISE[i % PRAISE.length]) : 'Correct answer:'}</b>
                <span>{lastOk ? ('why' in it ? it.why : '') : answerText(it)}{!lastOk && 'why' in it && it.why ? <><br />{it.why}</> : null}</span></div></div>
              <div className="foot-btns">{!cfg.fast && <SpeakBtn icon text={() => st.current.fb} />}<button className="btn" onClick={next}>Continue</button></div>
            </>
          ) : it.t === 'match' ? (<><span className="muted small">Pairs check themselves as you go.</span><button className="btn" disabled>Check</button></>)
          : (<><button className="btn ghost" onClick={() => check(true)}>Skip</button><button className="btn green" disabled={!ready()} onClick={() => check()}>{cfg.exam ? 'Next' : 'Check'}</button></>)}
        </div>
      </div>
    </div>
  );
}

function Results({ r, cfg }: { r: Result; cfg: SessionCfg }) {
  const end = useUI((s) => s.endSession);
  const hero = useMemo(() => pick(CAST), []);
  const showRev = cfg.kind === 'apsim' || cfg.kind === 'lightning' || cfg.kind === 'date';
  return (
    <div className="lesson">
      <div className="l-body"><div className="l-inner">
        <div className="res">
          <div className="hero">{!r.outHearts && <img src={hero.img} alt={hero.name} />}<Tock mood={r.mood} /></div>
          <h2 style={r.outHearts ? { color: 'var(--red)' } : undefined}>{r.head}</h2>
          <p className="sub">{r.sub}</p>
          {r.outHearts && <p className="muted">Fix your mistakes in Review to refill hearts, or wait. One heart comes back every 20 minutes.</p>}
          {r.apScore != null && <><div className="muted small">Estimated AP score</div><div className="apscore">{r.apScore}</div></>}
          <div className="tiles">
            <div className="tile" style={{ ['--c' as string]: '#f97316', ['--cd' as string]: '#c2410c' }}><div className="t">XP gained</div><div className="v">+{r.xp}</div></div>
            <div className="tile" style={{ ['--c' as string]: '#22c55e', ['--cd' as string]: '#16a34a' }}><div className="t">{cfg.kind === 'lightning' ? 'Correct' : 'Accuracy'}</div><div className="v">{cfg.kind === 'lightning' ? r.log.filter((l) => l.ok).length : `${r.acc}%`}</div></div>
            <div className="tile" style={{ ['--c' as string]: '#eab308', ['--cd' as string]: '#a16207' }}><div className="t">Gems earned</div><div className="v">+{r.gems}</div></div>
            <div className="tile" style={{ ['--c' as string]: '#a855f7', ['--cd' as string]: '#7e22ce' }}><div className="t">Time</div><div className="v">{fmtTime(r.secs * 1000)}</div></div>
          </div>
          {r.bonus > 0 && <p className="muted" style={{ margin: 0 }}>Includes +{r.bonus} XP combo bonus</p>}
          {r.newBest && <p style={{ margin: 0, color: 'var(--orange-d)', fontWeight: 900 }}>New personal best!</p>}
          {showRev && <div className="rev">{r.log.map((l, k) => (
            <div key={k} className="rev-item" style={{ ['--c' as string]: l.ok ? 'var(--green)' : 'var(--red)' }}>
              <b>{l.it.q}</b><br />{l.ok ? 'Correct' : <>You: {l.mine}<br />Answer: {answerText(l.it)}{'why' in l.it && l.it.why ? <><br /><span className="muted">{l.it.why}</span></> : null}</>}
            </div>))}</div>}
          <button className="btn orange big wide" style={{ maxWidth: 460 }} onClick={end}>Continue</button>
        </div>
      </div></div>
    </div>
  );
}
