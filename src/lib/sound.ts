import { useGame } from './store';

type Note = [freq: number, dur: number, type?: OscillatorType, vol?: number];
const SFX: Record<string, Note[]> = {
  tap: [[620, 0.05, 'triangle', 0.07]],
  ok: [[660, 0.09], [990, 0.18]],
  bad: [[196, 0.18, 'sawtooth', 0.06], [147, 0.28, 'sawtooth', 0.06]],
  done: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.32]],
  level: [[392, 0.11], [523, 0.11], [659, 0.11], [784, 0.11], [1047, 0.11], [1319, 0.4]],
  chest: [[880, 0.06], [1175, 0.06], [1568, 0.06], [2093, 0.25]],
  combo: [[784, 0.07], [988, 0.07], [1319, 0.16]],
  buy: [[523, 0.07], [784, 0.16]],
  tick: [[1250, 0.03, 'square', 0.025]],
  badge: [[659, 0.09], [880, 0.09], [1319, 0.3]],
  flip: [[440, 0.04, 'triangle', 0.05]],
};
let ctx: AudioContext | null = null;

export function snd(name: keyof typeof SFX) {
  if (!useGame.getState().sound) return;
  try {
    ctx = ctx || new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { return; }
  let t = ctx.currentTime + 0.01;
  for (const [f, d, type = 'sine', vol = 0.12] of SFX[name]) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03); t += d * 0.72;
  }
}
