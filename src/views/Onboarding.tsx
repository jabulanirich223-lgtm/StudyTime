import { useState } from 'react';
import { CATEGORIES } from '../data/catalog';
import { CoursePicker } from '../components/CoursePicker';
import { useGame } from '../lib/store';
import { snd } from '../lib/sound';
import { Tock } from '../components/Tock';
import { Svg, SVG, CourseIcon } from '../components/Icons';
import { CAST } from '../data/cast';

const GOALS: [number, string, string][] = [[10, 'Casual', '5 min / day'], [20, 'Regular', '10 min / day'], [30, 'Serious', '15 min / day'], [50, 'Intense', '25 min / day']];

function Logo() {
  return <div className="logo" style={{ padding: 0 }}><span className="logo-mark"><Tock mood="idle" /></span><span>Study<b>Time</b></span></div>;
}

export function Onboarding() {
  const g = useGame();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState<string | null>(null);
  const [goal, setGoal] = useState(30);
  const pos = [
    { c: CAST[0], x: '2%', y: '28%', h: 230, r: -6 },
    { c: CAST[1], x: '22%', y: '0%', h: 220, r: 4 },
    { c: CAST[3], x: '48%', y: '44%', h: 230, r: 0 },
    { c: CAST[2], x: '66%', y: '4%', h: 210, r: 6 },
    { c: CAST[5], x: '26%', y: '52%', h: 200, r: -3 },
  ];

  if (step === 0) return (
    <div className="onb">
      <div className="onb-top"><Logo /><span className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>Academics · Languages · Coding · Money · Tech</span></div>
      <div className="onb-hero">
        <div className="onb-art" aria-hidden="true">
          {pos.map((p) => <img key={p.c.id} src={p.c.img} alt="" style={{ left: p.x, top: p.y, height: p.h, transform: `rotate(${p.r}deg)` }} />)}
          <div className="tock-wrap" style={{ position: 'absolute', left: '78%', top: '48%', width: 120 }}><Tock mood="cheer" /></div>
        </div>
        <div className="onb-copy">
          <h1>The most fun way to learn school subjects, languages, coding and money skills!</h1>
          <button className="btn big" onClick={() => { snd('tap'); setStep(1); }}>Get started</button>
          <button className="btn ghost big" style={{ color: 'var(--brand)' }} onClick={() => { snd('tap'); g.set({ onboarded: true }); }}>Skip to my path</button>
        </div>
      </div>
      <div className="onb-strip">
        {CATEGORIES.map((c) => <span key={c.id}><CourseIcon icon={c.icon} size={34} />{c.name}</span>)}
      </div>
    </div>
  );

  const bar = (pct: number) => (
    <div className="onb-top">
      <button className="iconbtn" aria-label="Back" onClick={() => setStep(step - 1)}><Svg html={SVG.close} /></button>
      <div className="bar onb-bar"><i style={{ width: `${pct}%`, background: 'var(--green)' }} /></div><span />
    </div>
  );

  if (step === 1) return (
    <div className="onb">
      {bar(40)}
      <div className="onb-pick wide">
        <h1>What do you want to learn?</h1>
        <CoursePicker current={subject || undefined} onPick={(id) => { setSubject(id); setStep(2); }} />
      </div>
    </div>
  );

  return (
    <div className="onb">
      {bar(80)}
      <div className="onb-q">
        <div className="masc-row"><Tock mood="think" /><div className="speech left">How much do you want to study each day?</div></div>
        <div className="goal-grid">
          {GOALS.map(([n, l, t]) => <button key={n} className={`goal ${goal === n ? 'sel' : ''}`} onClick={() => { snd('tap'); setGoal(n); }}>{l}<span>{t}</span></button>)}
        </div>
      </div>
      <div className="onb-foot"><button className="btn big" onClick={() => { snd('done'); g.set({ onboarded: true, subject: subject || 'world', goal }); }}>Start learning</button></div>
    </div>
  );
}
