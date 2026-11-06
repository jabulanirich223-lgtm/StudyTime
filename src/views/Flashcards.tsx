import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, unitName } from '../data';
import { useGame } from '../lib/store';
import { useUI } from '../lib/ui';
import { flashDeck } from '../lib/launch';
import { shuffle } from '../lib/util';
import { snd } from '../lib/sound';
import { confetti } from '../lib/fx';
import { stopSpeak } from '../lib/speech';
import { Tock } from '../components/Tock';
import { Svg, SVG } from '../components/Icons';
import { SpeakBtn } from './Lesson';

export function Flashcards() {
  const ui = useUI();
  const s = SUBJECTS[useGame((g) => g.subject)];
  const total = useMemo(() => flashDeck().length, []);
  const [deck, setDeck] = useState(() => shuffle(flashDeck()));
  const [flip, setFlip] = useState(false);
  const known = total - deck.length;
  const c = deck[0];
  const got = () => { stopSpeak(); snd('ok'); setFlip(false); setDeck(deck.slice(1)); };
  const again = () => { stopSpeak(); snd('tap'); setFlip(false); setDeck([...deck.slice(1), deck[0]]); };
  useEffect(() => {
    if (deck.length) return;
    const g = useGame.getState();
    g.addXP(10); g.set({ gems: useGame.getState().gems + 5, daily: { ...useGame.getState().daily, crams: useGame.getState().daily.crams + 1 } });
    snd('done'); confetti();
  }, [deck.length]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setFlip((f) => !f); snd('flip'); }
      if (e.key === 'ArrowRight' || e.key === 'Enter') got();
      if (e.key === 'ArrowLeft') again();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  return (
    <div className="lesson">
      <div className="l-top">
        <button className="l-x" aria-label="Close" onClick={() => { stopSpeak(); ui.endSession(); }}><Svg html={SVG.close} /></button>
        <div className="bar"><i style={{ width: `${(known / total) * 100}%`, background: 'var(--purple)' }} /></div>
        <span className="muted small">{known}/{total}</span>
      </div>
      <div className="l-body"><div className="l-inner">
        {c ? (
          <>
            <div className="qhead"><span className="qkind"><i />Flashcards · {unitName(s, c.u)}</span><SpeakBtn text={() => (flip ? c.b : c.f)} /></div>
            <div className={`flip ${flip ? 'on' : ''}`} role="button" tabIndex={0} aria-label="Flip card" onClick={() => { setFlip(!flip); snd('flip'); }}>
              <div className="flip-in"><div className="face"><div className="big">{c.f}</div><div className="hint">Tap or press space to flip</div></div><div className="face back"><div className="big">{c.b}</div></div></div>
            </div>
            <div className="row" style={{ justifyContent: 'center' }}><button className="btn red" onClick={again}>Again</button><button className="btn green" onClick={got}>Got it</button></div>
          </>
        ) : (
          <div className="res"><Tock mood="cheer" size={170} /><h2>Deck cleared!</h2><p className="sub">You worked through all {total} cards. +10 XP, +5 gems</p>
            <button className="btn orange big wide" style={{ maxWidth: 460 }} onClick={() => ui.endSession()}>Continue</button></div>
        )}
      </div></div>
    </div>
  );
}
