import { useState } from 'react';
import { SUBJECTS, SUBJECT_META } from '../data';
import { useGame } from '../lib/store';
import { snd } from '../lib/sound';
import { Tock } from '../components/Tock';
import { Svg, SVG, iconUrl } from '../components/Icons';
import { CAST } from '../data/cast';
import type { SubjectId } from '../lib/types';

const GOALS: [number, string, string][] = [[10, 'Casual', '5 min / day'], [20, 'Regular', '10 min / day'], [30, 'Serious', '15 min / day'], [50, 'Intense', '25 min / day']];

function Logo() {
  return <div className="logo" style={{ padding: 0 }}><span className="logo-mark"><Tock mood="idle" /></span><span>Study<b>Time</b></span></div>;
}

export function Onboarding() {
  const g = useGame();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState<SubjectId | null>(null);
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
      <div className="onb-top"><Logo /><span className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>AP World · AP US History</span></div>
      <div className="onb-hero">
        <div className="onb-art" aria-hidden="true">
          {pos.map((p) => <img key={p.c.id} src={p.c.img} alt="" style={{ left: p.x, top: p.y, height: p.h, transform: `rotate(${p.r}deg)` }} />)}
          <div className="tock-wrap" style={{ position: 'absolute', left: '78%', top: '48%', width: 120 }}><Tock mood="cheer" /></div>
        </div>
        <div className="onb-copy">
          <h1>The most fun way to study history and ace your AP exams!</h1>
          <button className="btn big" onClick={() => { snd('tap'); setStep(1); }}>Get started</button>
          <button className="btn ghost big" style={{ color: 'var(--brand)' }} onClick={() => { snd('tap'); g.set({ onboarded: true }); }}>Skip to my path</button>
        </div>
      </div>
      <div className="onb-strip">
        {(Object.keys(SUBJECTS) as SubjectId[]).map((k) => <span key={k}><img src={iconUrl(SUBJECT_META[k].icon)} alt="" />{SUBJECTS[k].name}</span>)}
        <span style={{ opacity: .6 }}><img src={iconUrl('temple')} alt="" />Ancient world</span>
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
      <div className="onb-pick">
        <h1>I want to study…</h1>
        <div className="subj-grid">
          {(Object.keys(SUBJECTS) as SubjectId[]).map((k) => (
            <button key={k} className="subj-card" style={subject === k ? { borderColor: '#a5b4fc', background: 'var(--brand-l)' } : undefined} onClick={() => { snd('tap'); setSubject(k); }}>
              <img src={iconUrl(SUBJECT_META[k].icon)} alt="" /><b>{SUBJECTS[k].name}</b><span>{SUBJECT_META[k].blurb}</span>
            </button>
          ))}
          <div className="subj-card soon"><img src={iconUrl('scroll')} alt="" /><b>AP Gov</b><span>Coming soon</span></div>
          <div className="subj-card soon"><img src={iconUrl('palace')} alt="" /><b>AP Euro</b><span>Coming soon</span></div>
        </div>
      </div>
      <div className="onb-foot"><button className="btn big" disabled={!subject} onClick={() => setStep(2)}>Continue</button></div>
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
