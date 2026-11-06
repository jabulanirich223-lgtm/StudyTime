import { useGame } from './store';

/* Sound effects, synthesised live with Web Audio (no audio files).
   Built from a few "instruments": a bell/marimba voice, a soft pop, a noise whoosh and a low bonk,
   all sent through a light echo so they sound round and friendly. */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain(); out.gain.value = 0.9;
    // light echo for warmth
    const dly = ctx.createDelay(); dly.delayTime.value = 0.11;
    const fb = ctx.createGain(); fb.gain.value = 0.18;
    const wet = ctx.createGain(); wet.gain.value = 0.22;
    out.connect(ctx.destination); out.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ac: ctx, dst: out! };
}

type V = { ac: AudioContext; dst: GainNode };
const env = (g: GainNode, t: number, peak: number, a: number, d: number) => {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
};
/** Bell / marimba note: fundamental + soft partials. */
function bell({ ac, dst }: V, f: number, t: number, d = 0.35, v = 0.16) {
  [[1, 1, 'sine'], [2, 0.32, 'sine'], [3.01, 0.12, 'triangle'], [4.2, 0.05, 'sine']].forEach(([m, a, type]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type as OscillatorType; o.frequency.setValueAtTime(f * (m as number), t);
    env(g, t, v * (a as number), 0.006, d / (m as number) ** 0.5);
    o.connect(g); g.connect(dst); o.start(t); o.stop(t + d + 0.1);
  });
}
/** Short bubbly pop with a falling pitch. */
function pop({ ac, dst }: V, f: number, t: number, v = 0.14, d = 0.09) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + d * 0.6);
  env(g, t, v, 0.004, d); o.connect(g); g.connect(dst); o.start(t); o.stop(t + d + 0.05);
}
/** Low cartoon "bonk" for a wrong answer. */
function bonk({ ac, dst }: V, t: number, f = 220) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.22);
  lp.type = 'lowpass'; lp.frequency.value = 900;
  env(g, t, 0.22, 0.008, 0.3); o.connect(lp); lp.connect(g); g.connect(dst); o.start(t); o.stop(t + 0.4);
}
/** Filtered noise sweep. */
function whoosh({ ac, dst }: V, t: number, d = 0.28, from = 400, to = 3000, v = 0.12) {
  const n = ac.createBufferSource(), buf = ac.createBuffer(1, ac.sampleRate * d, ac.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  n.buffer = buf;
  const bp = ac.createBiquadFilter(), g = ac.createGain();
  bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  n.connect(bp); bp.connect(g); g.connect(dst); n.start(t); n.stop(t + d);
}
const sparkle = (v: V, t: number, base = 1568, n = 5) => { for (let i = 0; i < n; i++) bell(v, base * 2 ** ([0, 4, 7, 12, 16, 19][i % 6] / 12), t + i * 0.045, 0.25, 0.05); };

const N = (s: string) => 440 * 2 ** ((({ C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 } as Record<string, number>)[s[0]] + (s[1] === '#' ? 1 : 0) + (Number(s.slice(-1)) - 4) * 12) / 12);

const SFX = {
  tap: (v: V, t: number) => pop(v, 620, t, 0.1),
  flip: (v: V, t: number) => { whoosh(v, t, 0.16, 800, 2400, 0.08); pop(v, 520, t + 0.05, 0.06); },
  tick: (v: V, t: number) => pop(v, 1400, t, 0.04, 0.03),
  ok: (v: V, t: number) => { bell(v, N('E6'), t, 0.3, 0.13); bell(v, N('A6'), t + 0.08, 0.5, 0.15); sparkle(v, t + 0.14, N('E7'), 3); },
  bad: (v: V, t: number) => { bonk(v, t, 240); bonk(v, t + 0.16, 180); },
  combo: (v: V, t: number) => { ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => bell(v, N(n), t + i * 0.06, 0.3, 0.13)); whoosh(v, t, 0.3, 600, 5000, 0.07); },
  done: (v: V, t: number) => {
    ['C5', 'E5', 'G5'].forEach((n, i) => bell(v, N(n), t + i * 0.11, 0.4, 0.14));
    ['C6', 'E6', 'G6'].forEach((n) => bell(v, N(n), t + 0.36, 0.9, 0.1)); bell(v, N('C5'), t + 0.36, 0.9, 0.12); sparkle(v, t + 0.5, N('C7'), 6);
  },
  level: (v: V, t: number) => {
    ['G4', 'C5', 'E5', 'G5', 'C6'].forEach((n, i) => bell(v, N(n), t + i * 0.09, 0.4, 0.14));
    ['C6', 'E6', 'G6', 'C7'].forEach((n) => bell(v, N(n), t + 0.5, 1.1, 0.09)); whoosh(v, t + 0.4, 0.5, 300, 6000, 0.08); sparkle(v, t + 0.6, N('E7'), 6);
  },
  chest: (v: V, t: number) => { whoosh(v, t, 0.3, 300, 2000, 0.1); pop(v, 300, t + 0.22, 0.16, 0.12); [0, 1, 2, 3, 4, 5].forEach((i) => bell(v, N('A6') * (1 + (i % 3) * 0.12), t + 0.3 + i * 0.05, 0.25, 0.08)); sparkle(v, t + 0.5, N('C7'), 6); },
  buy: (v: V, t: number) => { bell(v, N('B6'), t, 0.15, 0.1); bell(v, N('E7'), t + 0.07, 0.5, 0.12); },
  badge: (v: V, t: number) => { ['E5', 'G#5', 'B5', 'E6'].forEach((n, i) => bell(v, N(n), t + i * 0.08, 0.6, 0.13)); sparkle(v, t + 0.35, N('E7'), 5); },
  xp: (v: V, t: number) => { pop(v, 880, t, 0.08); bell(v, N('A6'), t + 0.03, 0.2, 0.06); },
  heart: (v: V, t: number) => { pop(v, 500, t, 0.12); bonk(v, t + 0.05, 330); },
  streak: (v: V, t: number) => { whoosh(v, t, 0.4, 200, 4000, 0.12); ['G5', 'C6', 'E6', 'G6'].forEach((n, i) => bell(v, N(n), t + 0.15 + i * 0.07, 0.5, 0.12)); },
  whoosh: (v: V, t: number) => whoosh(v, t),
  pop: (v: V, t: number) => pop(v, 700, t, 0.12),
};
export type Sfx = keyof typeof SFX;

export function snd(name: Sfx) {
  if (!useGame.getState().sound) return;
  try { const v = audio(); SFX[name](v, v.ac.currentTime + 0.01); } catch { /* audio not available */ }
}
