import { useGame } from '../lib/store';
import { useUI } from '../lib/ui';
import { snd } from '../lib/sound';
import { confetti } from '../lib/fx';
import { Tock } from '../components/Tock';
import { Buddy } from '../components/Buddy';
import { Svg, SVG } from '../components/Icons';

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '$6.99', per: '/ month', note: 'Cancel any time' },
  { id: 'yearly', name: 'Yearly', price: '$59.99', per: '/ year', note: 'Just $5 a month · save 28%', best: true },
  { id: 'family', name: 'Family', price: '$99.99', per: '/ year', note: 'Up to 6 people' },
];
const PERKS: [string, string, string][] = [
  [SVG.heart, 'Unlimited hearts', 'Make as many mistakes as you need. Lessons never stop.'],
  [SVG.freeze, 'A free streak freeze every week', 'Miss a day and your streak is safe.'],
  [SVG.gem, '50% more gems from chests', 'Unlock the shop faster.'],
  [SVG.star, 'Pro avatar backgrounds and badge', 'Golden frames and colours only Pro members get.'],
  [SVG.bolt, 'Every Challenge, every course', 'All 114 courses, code challenges and AP exam sims.'],
];

/** StudyTime Pro: plans and perks. Billing is not connected in this build, so starting a plan unlocks Pro on this computer. */
export function ProView() {
  const g = useGame();
  const ui = useUI();
  const start = (plan: string) => {
    g.set({ pro: true, proPlan: plan, proSince: Date.now(), hearts: 5 });
    snd('level'); confetti();
    ui.open(<div className="center"><Tock mood="trophy" size={150} /><h2>Welcome to Pro!</h2><p className="muted">Unlimited hearts are on, and your first streak freeze is ready.</p><button className="btn wide" onClick={() => ui.close()}>Let's go</button></div>);
  };
  if (g.pro) return (
    <div className="pro">
      <div className="pro-hero"><div className="pro-hero-art"><Tock mood="trophy" /></div><div><span className="pro-badge">PRO</span><h1>You're a Pro member</h1><p>{PLANS.find((p) => p.id === g.proPlan)?.name || 'Pro'} plan · since {new Date(g.proSince).toLocaleDateString()}</p></div></div>
      <div className="pro-perks">{PERKS.map(([ic, t, d]) => <div className="perk" key={t}><Svg html={ic} /><div><b>{t}</b><span>{d}</span></div><Svg className="ok" html={SVG.check} /></div>)}</div>
      <button className="btn ghost" onClick={() => g.set({ pro: false, proPlan: null })}>Cancel Pro</button>
    </div>
  );
  return (
    <div className="pro">
      <div className="pro-hero">
        <div className="pro-hero-art"><Tock mood="fire" /></div>
        <div><span className="pro-badge">PRO</span><h1>Learn without limits</h1><p>Unlimited hearts, weekly streak freezes and more gems. Try it free for 7 days.</p></div>
        <div className="pro-crew"><Buddy who="imani" mood="cheer" /><Buddy who="leo" mood="love" /></div>
      </div>
      <div className="pro-perks">{PERKS.map(([ic, t, d]) => <div className="perk" key={t}><Svg html={ic} /><div><b>{t}</b><span>{d}</span></div></div>)}</div>
      <h2 style={{ margin: '26px 0 12px' }}>Choose a plan</h2>
      <div className="plans">
        {PLANS.map((p) => (
          <button key={p.id} className={`plan ${p.best ? 'best' : ''}`} onClick={() => start(p.id)}>
            {p.best && <span className="plan-flag">BEST VALUE</span>}
            <b>{p.name}</b><span className="plan-price">{p.price}<small>{p.per}</small></span><span className="muted small">{p.note}</span>
            <span className="btn wide">{p.best ? 'Start 7-day free trial' : 'Choose'}</span>
          </button>
        ))}
      </div>
      <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>Payments aren't connected in this version, so no card is needed and nothing is charged. Pro is unlocked on this computer.</p>
    </div>
  );
}

/** Small upsell card for the right rail. */
export function ProCard() {
  const g = useGame();
  const ui = useUI();
  if (g.pro) return null;
  return (
    <button className="card pro-card" onClick={() => ui.go('pro')}>
      <div className="pro-card-art"><Tock mood="fire" /></div>
      <div><span className="pro-badge">PRO</span><h3>Try Pro free</h3><p>Unlimited hearts, weekly streak freezes and more.</p></div>
    </button>
  );
}
