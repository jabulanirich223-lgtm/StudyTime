import { Gallery } from './views/Gallery';
import { useEffect, useRef } from 'react';
import { SUBJECTS } from './data';
import { courseIcon, levelName, trackOf } from './data/catalog';
import { CoursePicker } from './components/CoursePicker';
import { useGame, levelOf, xpAt, TIERS, tierIdx, today } from './lib/store';
import { useUI, type View } from './lib/ui';
import { startReview } from './lib/launch';
import { Tock } from './components/Tock';
import { Svg, SVG, NAV_ICON, CourseIcon } from './components/Icons';
import { Learn } from './views/Learn';
import { APView, CramView, LeagueView, ShopView, ReviewView, ProfileView } from './views/Other';
import { Lesson } from './views/Lesson';
import { Flashcards } from './views/Flashcards';
import { Onboarding } from './views/Onboarding';
import { ProView, ProCard } from './views/Pro';
import { Avatar } from './components/Buddy';

const NAV: [View, string][] = [['learn', 'Learn'], ['ap', 'Test Prep'], ['cram', 'Cram'], ['league', 'Leagues'], ['shop', 'Shop'], ['review', 'Review'], ['profile', 'Profile']];

function Side() {
  const ui = useUI();
  const g = useGame();
  return (
    <nav className="side" aria-label="Main">
      <div className="logo"><span className="logo-mark"><Tock mood="idle" /></span><span>Study<b>Time</b></span></div>
      {NAV.map(([v, l]) => (
        <button key={v} className={`nav ${ui.view === v ? 'on' : ''}`} aria-label={l} aria-current={ui.view === v ? 'page' : undefined} onClick={() => ui.go(v)}>
          {v === 'profile' ? <Avatar who={g.avatar} bg={g.avatarBg} size={32} pro={g.pro} /> : <Svg html={NAV_ICON[v === 'league' ? 'league' : v]} />}<span>{l}</span>
        </button>
      ))}
      <button className={`nav nav-pro ${ui.view === 'pro' ? 'on' : ''}`} onClick={() => ui.go('pro')}><span className="pro-gem">PRO</span><span>{g.pro ? 'Pro' : 'Get Pro'}</span></button>
      <div className="side-foot"><Tock mood="think" /><span>Press <b>R</b> in a lesson to hear it read aloud.</span></div>
    </nav>
  );
}

function TopBar() {
  const g = useGame();
  const ui = useUI();
  const s = SUBJECTS[g.subject];
  const last = useRef(g.gems);
  const shine = g.gems > last.current;
  useEffect(() => { last.current = g.gems; });
  return (
    <div className="topbar">
      <button className="subject-pick" onClick={() => ui.go('courses')} aria-label="Change course">
        <CourseIcon icon={courseIcon(g.subject)} size={34} /><span><small>{trackOf(g.subject)?.name || 'Course'} · change</small>{levelName(g.subject) && levelName(g.subject) !== 'Full course' && !s.name.includes(levelName(g.subject)) ? `${s.name} · ${levelName(g.subject)}` : s.name}</span>
      </button>
      <div className="pills">
        <span className="pill fire" title="Day streak"><Svg html={g.lastDay === today() ? SVG.fire : SVG.fireGrey} />{g.streak}</span>
        <span className={`pill gem ${shine ? 'shine' : ''}`} title="Gems" key={g.gems}><Svg html={SVG.gem} />{g.gems}</span>
        <span className="pill heart" title="Hearts"><Svg html={SVG.heart} />{g.unlimited || g.pro ? '∞' : g.hearts}</span>
        {g.pro && <span className="pro-badge" title="StudyTime Pro">PRO</span>}
        <button className="iconbtn" aria-label={g.sound ? 'Mute sounds' : 'Turn sounds on'} onClick={() => g.set({ sound: !g.sound })}><Svg html={g.sound ? SVG.speaker : SVG.mute} /></button>
      </div>
    </div>
  );
}

function Rail() {
  const g = useGame();
  const ui = useUI();
  const L = levelOf(g.xp), lo = xpAt(L), hi = xpAt(L + 1), ti = tierIdx(g.weekXP), T = TIERS[ti], N = TIERS[ti + 1];
  const risk = g.streak > 0 && g.lastDay !== today(), doneToday = g.lastDay === today();
  const quests: [string, number, number][] = [[`Earn ${g.goal} XP`, g.daily.xp, g.goal], ['Finish 2 lessons', g.daily.lessons, 2], ['Do 1 cram round', g.daily.crams, 1]];
  const mistakes = g.mistakes.filter((m) => m.s === g.subject).length;
  return (
    <aside className="rail">
      <div className="card"><div className="masc-row"><Tock mood={risk ? 'sleepy' : doneToday ? 'cheer' : 'idle'} />
        <div><h3 style={{ margin: 0 }}>{g.streak}-day streak</h3><p className="muted small" style={{ margin: '4px 0 0' }}>
          {risk ? 'Tock is dozing off. Do one lesson today to keep it going.' : doneToday ? 'Done for today. See you tomorrow!' : 'Finish a lesson to start a streak.'}{g.freezes ? ` ${g.freezes} freeze${g.freezes > 1 ? 's' : ''} ready.` : ''}</p></div></div></div>
      <ProCard />
      <div className="card"><div className="row" style={{ gap: 14, flexWrap: 'nowrap' }}><div className="lvl-badge">{L}</div>
        <div style={{ flex: 1, minWidth: 0 }}><div className="spread"><b>Level {L}</b>{Date.now() < g.dblUntil && <span className="tag" style={{ background: '#fef3c7', color: '#a16207' }}>2× XP</span>}</div>
          <div className="bar lvl" style={{ margin: '6px 0 4px' }}><i style={{ width: `${((g.xp - lo) / (hi - lo)) * 100}%` }} /></div>
          <span className="muted small">{g.xp - lo}/{hi - lo} XP to level {L + 1}</span></div></div></div>
      <button className="card" style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit' }} onClick={() => ui.go('league')}>
        <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}><span className="svg" style={{ width: 40, height: 40, color: T[2] }} dangerouslySetInnerHTML={{ __html: SVG.trophy }} />
          <div><h3 style={{ margin: 0 }}>{T[0]} League</h3><span className="muted small">{g.weekXP} XP this week.{N ? ` ${N[1] - g.weekXP} XP to ${N[0]}.` : ' Top league!'}</span></div></div>
      </button>
      <div className="card"><div className="spread"><h3 style={{ margin: 0 }}>Daily goal</h3><span className="muted small">{g.daily.xp}/{g.goal} XP</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${Math.min(100, (g.daily.xp / g.goal) * 100)}%` }} /></div></div>
      <div className="card"><h3>Daily quests</h3>{quests.map(([t, v, m]) => (
        <div className="quest" key={t}><Svg html={SVG.bolt} /><div><div className="small">{t}</div><div className="bar gold"><i style={{ width: `${Math.min(100, (v / m) * 100)}%` }} /></div></div></div>))}</div>
      <div className="card"><h3>Mistakes to fix</h3><p className="muted small" style={{ marginTop: 0 }}>{mistakes} question{mistakes === 1 ? '' : 's'} waiting.</p>
        <button className="btn purple wide" onClick={startReview}>Review mistakes</button></div>
    </aside>
  );
}

function Overlays() {
  const ui = useUI();
  return (
    <>
      {ui.modal && <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) ui.close(); }}><div className="sheet" role="dialog" aria-modal="true">{ui.modal}</div></div>}
      <div className="toasts" role="status">{ui.toasts.map((t) => <div className="toast" key={t.id}><Svg html={t.icon} /><span>{t.title}{t.sub && <small>{t.sub}</small>}</span></div>)}</div>
    </>
  );
}

export default function App() {
  return location.hash.startsWith('#gallery') ? <Gallery /> : <Main />;
}

function Main() {
  const g = useGame();
  const ui = useUI();
  useEffect(() => {
    g.syncDay(); g.syncHearts();
    const s = useGame.getState();
    if (s.frozeUsed) { s.set({ frozeUsed: false }); ui.toast('Streak saved!', 'A Streak Freeze covered the day you missed', SVG.freeze, 600); }
    const iv = setInterval(() => { useGame.getState().syncHearts(); useGame.getState().syncDay(); }, 60e3);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.body.style.overflow = ui.session || ui.modal ? 'hidden' : ''; }, [ui.session, ui.modal]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && useUI.getState().modal) useUI.getState().close(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  if (!g.onboarded) return <><Onboarding /><Overlays /></>;
  return (
    <>
      <div className="app">
        <Side />
        <main className="main"><div className={`main-in ${ui.view === 'courses' ? 'wide' : ''}`}>
          <TopBar />
          {ui.view === 'learn' && <Learn />}
          {ui.view === 'ap' && <APView />}
          {ui.view === 'cram' && <CramView />}
          {ui.view === 'league' && <LeagueView />}
          {ui.view === 'shop' && <ShopView />}
          {ui.view === 'review' && <ReviewView />}
          {ui.view === 'profile' && <ProfileView />}
          {ui.view === 'pro' && <ProView />}
          {ui.view === 'courses' && <><h1 className="view-h">What do you want to learn?</h1><p className="muted">Pick a subject, then a level. Your progress in every course is kept.</p><div style={{ marginTop: 16 }}><CoursePicker current={g.subject} onPick={(id) => { g.set({ subject: id }); ui.go('learn'); }} /></div></>}
        </div></main>
        <Rail />
      </div>
      {ui.session && (ui.session.kind === 'flash' ? <Flashcards /> : <Lesson key={ui.session.id} cfg={ui.session} />)}
      <Overlays />
    </>
  );
}
