import { useGame } from './store';
import type { Item } from './types';

let listeners: ((on: boolean) => void)[] = [];
export let speaking = false;
const setSpeaking = (on: boolean) => { speaking = on; listeners.forEach((l) => l(on)); };
export const onSpeaking = (fn: (on: boolean) => void) => { listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn); }; };

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export function voiceScore(v: SpeechSynthesisVoice) {
  let n = 0;
  if (/natural|neural|online/i.test(v.name)) n += 10;
  if (/premium|enhanced/i.test(v.name)) n += 8;
  if (/Google/i.test(v.name)) n += 5;
  if (/Aria|Jenny|Guy|Ava|Andrew|Emma|Brian|Samantha|Daniel|Serena|Libby|Sonia/i.test(v.name)) n += 3;
  if (/en-US/i.test(v.lang)) n += 1;
  if (/espeak|Albert|Bad News|Bells|Boing|Bubbles|Cellos|Jester|Organ|Trinoids|Whisper|Zarvox|Wobble|Superstar/i.test(v.name)) n -= 20;
  return n;
}
export const enVoices = () => (canSpeak() ? speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)) : []);
export function pickVoice() {
  const all = enVoices(), name = useGame.getState().voiceName;
  return (name && all.find((v) => v.name === name)) || all[0] || null;
}
export function speak(text: string) {
  if (!text || !canSpeak()) return;
  const s = useGame.getState();
  speechSynthesis.cancel();
  const clean = text.replace(/→/g, ', then ').replace(/c\. (\d)/g, 'circa $1').replace(/(\d+) BCE/g, '$1 B C E').replace(/\s+/g, ' ');
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = s.ttsRate; u.pitch = s.ttsPitch; u.lang = 'en-US';
  const v = pickVoice(); if (v) u.voice = v;
  u.onend = u.onerror = () => setSpeaking(false);
  speechSynthesis.speak(u); setSpeaking(true);
}
export function stopSpeak() { if (canSpeak()) speechSynthesis.cancel(); setSpeaking(false); }

export function itemText(it: Item, order?: number[]) {
  if (it.t === 'card') return `${it.h}. ${it.b}`;
  let t = ('stim' in it && it.stim ? `Source: ${it.stim} From ${'src' in it ? it.src : ''}. ` : '') + it.q + ' ';
  if (it.t === 'mc' || it.t === 'year') t += (order || it.o.map((_, i) => i)).map((oi, n) => `Option ${n + 1}: ${it.o[oi]}.`).join(' ');
  if (it.t === 'tf') t += 'True or false?';
  if (it.t === 'match') t += `Match these: ${it.pairs.map((p) => p[0]).join(', ')}. With: ${it.pairs.map((p) => p[1]).join(', ')}.`;
  if (it.t === 'order') t += `Events: ${it.items.map((x) => x[0]).join('. ')}.`;
  return t;
}
