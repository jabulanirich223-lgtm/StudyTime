import { useEffect, useState } from 'react';
import { SUBJECTS, unitName } from '../data';
import { courseIcon } from '../data/catalog';
import { useGame, TIERS, tierIdx, BADGES, levelOf } from '../lib/store';
import { useUI } from '../lib/ui';
import { startAPSim, startDrill, startUnit, startLightning, startDateDash, startReview, hasDates } from '../lib/launch';
import { snd } from '../lib/sound';
import { speak, CHARACTER_VOICE, onVoiceStatus, voiceStatus, loadVoices, type VoiceStatus } from '../lib/speech';
import { Tock } from '../components/Tock';
import { Svg, SVG, CourseIcon } from '../components/Icons';
import { CAST } from '../data/cast';
import { Buddy, Avatar } from '../components/Buddy';
import { Guidebook } from './Learn';

function Mode({ color, icon, title, text, tag, btn, onGo, children }: { color: string; icon: string; title: string; text: string; tag?: string; btn: string; onGo: () => void; children?: React.ReactNode }) {
  return (
    <div className="mode">
      <div className="ico" style={{ background: color }}><Svg html={icon} /></div>
      <h3>{title}</h3><p>{text}</p>{tag && <span className="tag">{tag}</span>}{children}
      <button className="btn" style={{ ['--c' as string]: color, ['--cd' as string]: 'rgba(0,0,0,.25)' }} onClick={onGo}>{btn}</button>
    </div>
  );
}

export function APView() {
  const g = useGame();
  const s = SUBJECTS[g.subject];
  const [unit, setUnit] = useState(0);
  const best = g.best.ap[g.subject];
  return (
    <>
      <h1 className="view-h">Test Prep</h1>
      <p className="muted">{s.apq.length ? `Practice the way the real ${s.name} exam asks: a source first, then a question about it.` : `Timed, exam-style practice for ${s.name}.`}</p>
      <div className="grid">
        <Mode color="#4f46e5" icon={SVG.target} title="Exam Sim" text="20 mixed multiple-choice questions, a 25-minute clock, no hints. Get a score estimate and a full review." tag={best ? `Best: ${best}` : undefined} btn="Start exam" onGo={startAPSim} />
        {s.apq.length > 0 && <Mode color="#a855f7" icon={SVG.book} title="Source Drills" text="Stimulus questions with instant feedback and an explanation after each one." btn="Start drill" onGo={startDrill} />}
        <Mode color="#14b8a6" icon={SVG.star} title="Unit Focus" text="Pick one unit and practice every question from it, shuffled." btn="Practice unit" onGo={() => startUnit(unit)}>
          <select aria-label="Unit" value={unit} onChange={(e) => setUnit(Number(e.target.value))}>{s.units.map((u, i) => <option key={i} value={i}>{unitName(s, i)}: {u.title}</option>)}</select>
        </Mode>
      </div>
      <p className="muted small" style={{ marginTop: 20 }}>Score estimates are rough guides based on percent correct, not official College Board scoring.</p>
    </>
  );
}

export function CramView() {
  const g = useGame();
  const ui = useUI();
  return (
    <>
      <h1 className="view-h">Cram</h1>
      <p className="muted">Short, fast rounds for the night before a test. No hearts lost here.</p>
      <div className="grid">
        <Mode color="#f97316" icon={SVG.bolt} title="Lightning Round" text="60 seconds. Answer as many as you can from every unit." tag={`Best: ${g.best.lightning} correct`} btn="Go" onGo={startLightning} />
        {hasDates() && <Mode color="#ef4444" icon={SVG.cal} title="Date Dash" text="Pick the right year for 12 key events. Dates are the easiest points to lose." btn="Start" onGo={startDateDash} />}
        <Mode color="#a855f7" icon={SVG.cards} title="Flashcards" text="Every key term and person in the course. Tap to flip, keep the ones you miss." btn="Open deck" onGo={() => ui.start({ kind: 'flash', title: 'Flashcards', items: [] })} />
        <Mode color="#14b8a6" icon={SVG.scroll} title="Cram Sheet" text="All the unit notes on one page for a fast read-through." btn="Read" onGo={() => ui.open(<CramSheet />)} />
      </div>
    </>
  );
}

function CramSheet() {
  const g = useGame();
  const s = SUBJECTS[g.subject];
  return (
    <>
      <h2>Cram Sheet</h2><p className="muted small">{s.name} · every guidebook note</p>
      {s.units.map((_, i) => <div key={i} style={{ marginTop: 22 }}><Guidebook ui={i} /></div>)}
    </>
  );
}

export function LeagueView() {
  const g = useGame();
  const ti = tierIdx(g.weekXP);
  return (
    <>
      <h1 className="view-h">Leagues</h1>
      <p className="muted">Earn XP this week to climb. The ladder resets every Monday. You have {g.weekXP} XP this week.</p>
      <div className="tiers" style={{ marginTop: 14 }}>
        {TIERS.map((t, i) => ({ t, i })).reverse().map(({ t, i }) => (
          <div key={t[0]} className={`tier ${i === ti ? 'cur' : i < ti ? 'past' : ''}`} style={{ ['--tc' as string]: t[2] }}>
            <span className="svg" style={{ color: t[2], width: 34, height: 34 }} dangerouslySetInnerHTML={{ __html: SVG.trophy }} />
            <b>{t[0]}</b>{i === ti && <span className="tag">You are here</span>}
            <span className="need">{i <= ti ? 'Reached' : `${t[1] - g.weekXP} XP to go`}</span>
          </div>
        ))}
      </div>
      <h2 className="view-h" style={{ fontSize: 26, marginTop: 30 }}>Badges</h2>
      <p className="muted">Each badge pays 20 gems.</p>
      <div className="badges">{BADGES.map((b) => {
        const v = Math.min(b.goal, b.val(g)), got = g.badges[b.id];
        return <div key={b.id} className={`badge ${got ? 'got' : ''}`}><span className="bi"><Svg html={SVG.medal} /></span><b>{b.name}</b><span>{b.desc}</span>
          {got ? <span className="tag">Earned</span> : <><div className="bar gold"><i style={{ width: `${(v / b.goal) * 100}%` }} /></div><span>{v}/{b.goal}</span></>}</div>;
      })}</div>
    </>
  );
}

export function ShopView() {
  const g = useGame();
  const ui = useUI();
  const items = [
    { id: 'hearts', name: 'Refill hearts', desc: 'Get all 5 hearts back right now.', cost: 40, icon: SVG.heart, block: g.unlimited || g.hearts >= 5 ? 'Hearts are full' : null, apply: () => ({ hearts: 5, heartTs: Date.now() }) },
    { id: 'freeze', name: 'Streak Freeze', desc: 'Keeps your streak if you miss a day. Hold up to 2.', cost: 50, icon: SVG.freeze, block: g.freezes >= 2 ? 'You have 2 already' : null, apply: () => ({ freezes: g.freezes + 1 }) },
    { id: 'double', name: 'Double XP, 15 min', desc: 'Every XP you earn counts twice for 15 minutes.', cost: 80, icon: SVG.bolt, block: Date.now() < g.dblUntil ? 'Already active' : null, apply: () => ({ dblUntil: Date.now() + 15 * 60e3 }) },
  ];
  return (
    <>
      <h1 className="view-h">Shop</h1>
      <div className="masc-row" style={{ margin: '10px 0 18px' }}><Tock mood="idle" /><div className="speech left">Welcome, traveler! You have <span style={{ color: 'var(--blue-d)' }}>{g.gems} gems</span>. Earn more from lessons, chests, Cram rounds and badges.</div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{items.map((it) => (
        <div className="shop-item" key={it.id}>
          <Svg html={it.icon} /><div><h3>{it.name}</h3><p>{it.block || it.desc}</p></div>
          <button className="btn blue price" disabled={!!it.block || g.gems < it.cost}
            onClick={() => { g.set({ gems: g.gems - it.cost, ...it.apply() }); snd('buy'); ui.toast(it.name, 'Purchased', it.icon); }}><Svg html={SVG.gem} />{it.cost}</button>
        </div>
      ))}</div>
      <p className="muted small" style={{ marginTop: 14 }}>Streak freezes owned: {g.freezes}</p>
    </>
  );
}

export function ReviewView() {
  const g = useGame();
  const m = g.mistakes.filter((x) => x.s === g.subject);
  if (!m.length) return (
    <>
      <h1 className="view-h">Review</h1>
      <div className="empty"><Tock mood="cheer" /><h2>No mistakes to fix!</h2><p>Questions you miss in lessons land here. Finishing a review also refills your hearts.</p></div>
    </>
  );
  return (
    <>
      <h1 className="view-h">Review</h1>
      <p className="muted">{m.length} questions you missed. Get them right to clear them, and finish to refill your hearts.</p>
      <button className="btn purple" onClick={startReview}>Practice mistakes</button>
      <div className="rev" style={{ marginTop: 18 }}>{m.slice(0, 30).map((x, i) => <div key={i} className="rev-item" style={{ ['--c' as string]: 'var(--purple)' }}>{x.q.q}</div>)}</div>
    </>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return <div className="toggle-row"><span>{label}</span><button className={`sw ${on ? 'on' : ''}`} aria-pressed={on} aria-label={label} onClick={onClick} /></div>;
}

export function ProfileView() {
  const g = useGame();
  const ui = useUI();
  return (
    <>
      <div className="prof-head">
        <button className="prof-av" onClick={() => ui.open(<AvatarPicker />)} aria-label="Change profile picture"><Avatar who={g.avatar} bg={g.avatarBg} size={120} pro={g.pro} /><span className="prof-edit">✎</span></button>
        <div style={{ minWidth: 0 }}>
          <input className="prof-name" value={g.name} maxLength={24} onChange={(e) => g.set({ name: e.target.value })} aria-label="Your name" />
          <div className="row" style={{ gap: 8, marginTop: 6 }}>{g.pro ? <span className="pro-badge">PRO</span> : <button className="pro-badge ghosty" onClick={() => ui.go('pro')}>GET PRO</button>}<span className="muted small">Level {levelOf(g.xp)} · {g.stats.lessons} lessons</span></div>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => ui.open(<AvatarPicker />)}>Change avatar</button>
        </div>
      </div>
      <div className="tiles" style={{ maxWidth: 'none', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', marginTop: 12 }}>
        <div className="tile" style={{ ['--c' as string]: '#f97316', ['--cd' as string]: '#c2410c' }}><div className="t">Streak</div><div className="v">{g.streak}</div></div>
        <div className="tile" style={{ ['--c' as string]: '#eab308', ['--cd' as string]: '#a16207' }}><div className="t">Total XP</div><div className="v">{g.xp}</div></div>
        <div className="tile" style={{ ['--c' as string]: '#4f46e5', ['--cd' as string]: '#3730a3' }}><div className="t">Level</div><div className="v">{levelOf(g.xp)}</div></div>
        <div className="tile" style={{ ['--c' as string]: '#22c55e', ['--cd' as string]: '#16a34a' }}><div className="t">Lessons</div><div className="v">{g.stats.lessons}</div></div>
      </div>

      <h2 style={{ marginTop: 28, fontSize: 24 }}>Course</h2>
      <div className="row" style={{ marginTop: 10 }}><CourseIcon icon={courseIcon(g.subject)} size={48} /><b style={{ flex: 1 }}>{SUBJECTS[g.subject]?.name}</b><button className="btn" onClick={() => ui.go('courses')}>Change course</button></div>

      <h2 style={{ marginTop: 28, fontSize: 24 }}>Your study crew</h2>
      <p className="muted small">Tap anyone to hear their voice.</p>
      <div className="crew pick">
        <button className="crew-mem" onClick={() => speak("Hi, I'm Tock! Let's make every minute count.", 'tock')}><span className="tock-wrap" style={{ width: 70 }}><Tock mood="cheer" /></span><b>Tock</b><span className="muted small">{CHARACTER_VOICE.tock.label}</span></button>
        {CAST.map((c) => <button key={c.id} className="crew-mem" onClick={() => speak(`Hi, I'm ${c.name}. Ready to study?`, c.id)}><span className="crew-b"><Buddy who={c.id} mood="wave" /></span><b>{c.name}</b><span className="muted small">{CHARACTER_VOICE[c.id]?.label}</span></button>)}
      </div>

      <h2 style={{ marginTop: 28, fontSize: 24 }}>Settings</h2>
      <div className="toggle-row"><span>Daily goal</span><select value={g.goal} onChange={(e) => g.set({ goal: Number(e.target.value) })}>{[10, 20, 30, 50, 80].map((n) => <option key={n} value={n}>{n} XP</option>)}</select></div>
      <Toggle on={g.autoRead} label="Read questions aloud automatically" onClick={() => { g.set({ autoRead: !g.autoRead }); if (!g.autoRead) speak('Read aloud is on. I will read each question for you.'); }} />
      <VoiceState />
      <div className="toggle-row"><span>Reading speed</span><select value={g.ttsRate} onChange={(e) => { g.set({ ttsRate: Number(e.target.value) }); setTimeout(() => speak('This is how fast I will read.'), 50); }}>{[[0.8, 'Slow'], [1, 'Normal'], [1.2, 'Fast'], [1.5, 'Very fast']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="toggle-row"><span>Voice pitch</span><select value={g.ttsPitch} onChange={(e) => { g.set({ ttsPitch: Number(e.target.value) }); setTimeout(() => speak("Hi, I'm Tock. How does this sound?"), 50); }}>{[[0.8, 'Lower'], [1, 'Normal'], [1.15, 'Higher']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="toggle-row"><span>Reset all progress</span><button className="btn ghost" onClick={() => ui.open(
        <div className="center"><Tock mood="sad" size={120} /><h2>Reset all progress?</h2><p className="muted">This clears XP, streak, finished lessons and saved mistakes on this computer.</p>
          <div className="row" style={{ justifyContent: 'center' }}><button className="btn red" onClick={() => { g.reset(); ui.close(); ui.go('learn'); }}>Reset everything</button><button className="btn ghost" onClick={() => ui.close()}>Cancel</button></div></div>)}>Reset</button></div>
      <p className="muted small">Progress is saved on this computer.</p>
    </>
  );
}

function VoiceState() {
  const [st, setSt] = useState<VoiceStatus>(voiceStatus());
  useEffect(() => onVoiceStatus(setSt), []);
  const msg = { off: '', idle: 'Downloads once (about 90 MB) the first time someone speaks.', loading: 'Downloading voices… (one time only)', ready: 'Voices ready', failed: "Couldn't download voices. Check your internet; using your computer's voice for now." }[st];
  return <div className="toggle-row"><span className="muted small">{msg}</span>{st !== 'ready' && st !== 'loading' && <button className="btn ghost" onClick={() => void loadVoices()}>Download now</button>}</div>;
}

const AV_WHO = ['tock', 'malik', 'sophie', 'leo', 'imani', 'kenji', 'amira', 'ms-hart'];
const AV_BG: [string, boolean][] = [['#ddf4ff', false], ['#d7ffb8', false], ['#ffe7b3', false], ['#ffd6e7', false], ['#eadcff', false], ['#ffdfd6', false],
  ['linear-gradient(135deg,#ffd84d,#ff9600)', true], ['linear-gradient(135deg,#7c5cff,#1cb0f6)', true], ['linear-gradient(135deg,#ff4b8b,#ffb84d)', true], ['linear-gradient(135deg,#1f2433,#4f46e5)', true]];
function AvatarPicker() {
  const g = useGame();
  const ui = useUI();
  return (
    <div>
      <h2>Your avatar</h2>
      <div className="center" style={{ margin: '14px 0' }}><Avatar who={g.avatar} bg={g.avatarBg} size={130} pro={g.pro} /></div>
      <div className="av-grid">{AV_WHO.map((w) => <button key={w} className={`av-opt ${g.avatar === w ? 'on' : ''}`} onClick={() => { snd('tap'); g.set({ avatar: w }); }}><Avatar who={w} bg={g.avatarBg} size={64} /></button>)}</div>
      <h3 style={{ margin: '16px 0 8px' }}>Background</h3>
      <div className="bg-grid">{AV_BG.map(([c, pro]) => (
        <button key={c} className={`bg-opt ${g.avatarBg === c ? 'on' : ''}`} style={{ background: c }} aria-label={pro ? 'Pro background' : 'Background colour'}
          onClick={() => { if (pro && !g.pro) { snd('bad'); ui.close(); ui.go('pro'); return; } snd('tap'); g.set({ avatarBg: c }); }}>{pro && !g.pro && <span className="lock">PRO</span>}</button>))}</div>
      <button className="btn wide" style={{ marginTop: 18 }} onClick={() => ui.close()}>Done</button>
    </div>
  );
}
