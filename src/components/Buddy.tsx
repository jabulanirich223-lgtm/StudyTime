import { useEffect, useId, useState, type ReactElement } from 'react';
import { onSpeaking } from '../lib/speech';
import { Tock } from './Tock';

/* Layered flat-vector cartoon characters drawn in SVG (no outlines).
   Every shape has a darker shadow tone and a lighter highlight tone, lit from the top left,
   so the cast reads as finished illustration. All of them share one face/pose rig. */

export type Mood =
  | 'neutral' | 'happy' | 'cheer' | 'proud' | 'love' | 'smug' | 'wink'
  | 'sad' | 'oops' | 'shocked' | 'angry' | 'think' | 'sleepy' | 'fire' | 'trophy' | 'wave';
export type Pose = 'down' | 'wave' | 'up' | 'chin' | 'hips' | 'point' | 'facepalm' | 'hold' | 'hug' | 'thumb';

type Eyes = 'open' | 'happy' | 'closed' | 'wide' | 'sad' | 'half' | 'hearts' | 'wink' | 'up' | 'stars' | 'angry';
type Brows = 'none' | 'flat' | 'up' | 'worried' | 'angry' | 'one';
export type Mouth = 'smile' | 'grin' | 'frown' | 'o' | 'flat' | 'wavy' | 'shout' | 'smirk' | 'talkA' | 'talkB' | 'side' | 'tiny';
type Extra = 'sweat' | 'tears' | 'zzz' | 'sparkle' | 'hearts' | 'flame' | 'trophy' | 'question' | 'anger';

type Face = { eyes: Eyes; brows: Brows; mouth: Mouth; pose: Pose; extras: Extra[]; anim: string };
export const MOODS: Record<Mood, Face> = {
  neutral: { eyes: 'open', brows: 'flat', mouth: 'smile', pose: 'down', extras: [], anim: 'idle' },
  wave: { eyes: 'open', brows: 'up', mouth: 'grin', pose: 'wave', extras: [], anim: 'idle' },
  happy: { eyes: 'happy', brows: 'up', mouth: 'grin', pose: 'hips', extras: ['sparkle'], anim: 'hop' },
  cheer: { eyes: 'happy', brows: 'up', mouth: 'shout', pose: 'up', extras: ['sparkle'], anim: 'jump' },
  proud: { eyes: 'half', brows: 'up', mouth: 'smirk', pose: 'hips', extras: ['sparkle'], anim: 'idle' },
  love: { eyes: 'hearts', brows: 'up', mouth: 'grin', pose: 'up', extras: ['hearts'], anim: 'hop' },
  smug: { eyes: 'half', brows: 'one', mouth: 'smirk', pose: 'hips', extras: [], anim: 'idle' },
  wink: { eyes: 'wink', brows: 'one', mouth: 'grin', pose: 'point', extras: ['sparkle'], anim: 'idle' },
  sad: { eyes: 'sad', brows: 'worried', mouth: 'frown', pose: 'down', extras: ['tears'], anim: 'droop' },
  oops: { eyes: 'wide', brows: 'worried', mouth: 'wavy', pose: 'facepalm', extras: ['sweat'], anim: 'shake' },
  shocked: { eyes: 'wide', brows: 'up', mouth: 'o', pose: 'up', extras: ['sweat'], anim: 'shake' },
  angry: { eyes: 'angry', brows: 'angry', mouth: 'shout', pose: 'hips', extras: ['anger'], anim: 'shake' },
  think: { eyes: 'up', brows: 'one', mouth: 'side', pose: 'chin', extras: ['question'], anim: 'idle' },
  sleepy: { eyes: 'closed', brows: 'flat', mouth: 'tiny', pose: 'down', extras: ['zzz'], anim: 'droop' },
  fire: { eyes: 'angry', brows: 'angry', mouth: 'grin', pose: 'up', extras: ['flame'], anim: 'jump' },
  trophy: { eyes: 'happy', brows: 'up', mouth: 'shout', pose: 'hold', extras: ['trophy', 'sparkle'], anim: 'jump' },
};
export const MOOD_LIST = Object.keys(MOODS) as Mood[];

// ---------- characters ----------
type Hair = 'dreads' | 'ponytail' | 'spiky' | 'afro' | 'bowl' | 'hijab' | 'bun' | 'bob';
type Prop = 'books' | 'book' | 'pencil' | 'none';
type Look = {
  skin: string; shade: string; hair: Hair; hairC: string; top: string; topD: string; sleeve: string;
  bottom: string; legs?: string; shoe: string; glasses?: string; extra?: 'backpack' | 'collar' | 'overalls' | 'jacket' | 'hood';
  bodyW?: number; sig?: Pose; prop?: Prop; long?: boolean;
};
export const LOOKS: Record<string, Look> = {
  malik: { skin: '#b5703f', shade: '#9a5a30', hair: 'dreads', hairC: '#2a1d17', top: '#ff8a1f', topD: '#e5700a', sleeve: '#ff8a1f', bottom: '#2f3249', shoe: '#ffffff', extra: 'hood', sig: 'wave' },
  sophie: { skin: '#ffd8bd', shade: '#f4bc9c', hair: 'ponytail', hairC: '#ffcf3a', top: '#1fb5a8', topD: '#14968b', sleeve: '#1fb5a8', bottom: '#ffd23f', legs: '#ffd8bd', shoe: '#8b5cf6', extra: 'jacket', sig: 'hug', prop: 'books' },
  leo: { skin: '#ffcfa8', shade: '#f2b48a', hair: 'spiky', hairC: '#9a5b2e', top: '#58c43b', topD: '#45a32c', sleeve: '#58c43b', bottom: '#c9a46c', legs: '#ffcfa8', shoe: '#3b3f58', extra: 'backpack', sig: 'thumb' },
  imani: { skin: '#7c4a2c', shade: '#663a22', hair: 'afro', hairC: '#1f1714', top: '#ffc928', topD: '#f0b400', sleeve: '#ffc928', bottom: '#8b5cf6', shoe: '#ffffff', extra: 'overalls', sig: 'up' },
  kenji: { skin: '#f8d3b0', shade: '#eab792', hair: 'bowl', hairC: '#22252f', top: '#ffb61d', topD: '#eb9f00', sleeve: '#ffb61d', bottom: '#2e3a6e', shoe: '#e24b4b', glasses: '#3b2a24', extra: 'collar', sig: 'chin', prop: 'pencil' },
  amira: { skin: '#dba273', shade: '#c78a5a', hair: 'hijab', hairC: '#7cc4f2', top: '#ff7a8a', topD: '#ec5e70', sleeve: '#ff7a8a', bottom: '#3d7bd9', shoe: '#ffffff', sig: 'hips' },
  'ms-hart': { skin: '#f6d0ba', shade: '#e7b59c', hair: 'bob', hairC: '#c9ccd4', top: '#9b2350', topD: '#7d1a40', sleeve: '#9b2350', bottom: '#4b5563', shoe: '#6b3f22', glasses: '#e5313b', extra: 'collar', bodyW: 6, sig: 'hug', prop: 'book', long: true },
};

const EYE = '#1d1b2c';
const WHITE = '#ffffff';
const MOUTH_D = '#7a1f2e';
const TONGUE = '#ff7d8f';

export function useTalking(who: string, talking?: boolean) {
  const [on, setOn] = useState(false);
  const [frame, setFrame] = useState(false);
  useEffect(() => onSpeaking((s) => setOn(s.on && s.who === who)), [who]);
  const active = talking || on;
  useEffect(() => {
    if (!active) { setFrame(false); return; }
    const iv = setInterval(() => setFrame((f) => !f), 140);
    return () => clearInterval(iv);
  }, [active]);
  return active ? (frame ? 'talkA' : 'talkB') : null;
}

// ---------- face parts (centred on cx, eye line ey) ----------
export function eyesEl(kind: Eyes, cx: number, ey: number, gap = 21): ReactElement {
  const L = cx - gap, R = cx + gap;
  const open = (x: number, rx = 10.5, ry = 13, px = 2, py = 2, pr = 6.5) => (
    <g key={x}>
      <ellipse cx={x} cy={ey} rx={rx} ry={ry} fill={WHITE} />
      <circle cx={x + px} cy={ey + py} r={pr} fill={EYE} />
      <circle cx={x + px + 2.4} cy={ey + py - 2.6} r={2.1} fill={WHITE} />
    </g>
  );
  const arc = (x: number, up = true) => <path key={x} d={up ? `M${x - 10} ${ey + 3} Q${x} ${ey - 10} ${x + 10} ${ey + 3}` : `M${x - 10} ${ey - 2} Q${x} ${ey + 8} ${x + 10} ${ey - 2}`} stroke={EYE} strokeWidth={5} strokeLinecap="round" fill="none" />;
  switch (kind) {
    case 'happy': return <g className="eyes">{arc(L)}{arc(R)}</g>;
    case 'closed': return <g className="eyes">{arc(L, false)}{arc(R, false)}</g>;
    case 'wide': return <g className="eyes">{open(L, 12.5, 15, 0, 0, 4.2)}{open(R, 12.5, 15, 0, 0, 4.2)}</g>;
    case 'up': return <g className="eyes blink">{open(L, 10.5, 13, 2, -5)}{open(R, 10.5, 13, 2, -5)}</g>;
    case 'wink': return <g className="eyes">{open(L)}{arc(R)}</g>;
    case 'sad': return (
      <g className="eyes blink">{open(L, 10.5, 13, 0, 3)}{open(R, 10.5, 13, 0, 3)}
        <path d={`M${L - 12} ${ey - 13} L${L + 12} ${ey - 6} L${L + 12} ${ey - 16} L${L - 12} ${ey - 16}Z`} fill="var(--lid)" />
        <path d={`M${R + 12} ${ey - 13} L${R - 12} ${ey - 6} L${R - 12} ${ey - 16} L${R + 12} ${ey - 16}Z`} fill="var(--lid)" />
      </g>);
    case 'half': case 'angry': return (
      <g className="eyes">{open(L)}{open(R)}
        {kind === 'half'
          ? <><rect x={L - 12} y={ey - 15} width={24} height={13} fill="var(--lid)" /><rect x={R - 12} y={ey - 15} width={24} height={13} fill="var(--lid)" /></>
          : <><path d={`M${L - 12} ${ey - 16} L${L + 12} ${ey - 16} L${L + 12} ${ey - 2} Z`} fill="var(--lid)" /><path d={`M${R + 12} ${ey - 16} L${R - 12} ${ey - 16} L${R - 12} ${ey - 2} Z`} fill="var(--lid)" /></>}
      </g>);
    case 'hearts': {
      const h = (x: number) => <path key={x} d={`M${x} ${ey + 9} C${x - 16} ${ey - 2} ${x - 9} ${ey - 15} ${x} ${ey - 6} C${x + 9} ${ey - 15} ${x + 16} ${ey - 2} ${x} ${ey + 9}Z`} fill="#ff3d6e" />;
      return <g className="eyes">{h(L)}{h(R)}</g>;
    }
    case 'stars': {
      const st = (x: number) => <path key={x} d={`M${x} ${ey - 12} L${x + 3.5} ${ey - 3.5} L${x + 12} ${ey - 3} L${x + 5} ${ey + 3} L${x + 7.5} ${ey + 12} L${x} ${ey + 6.5} L${x - 7.5} ${ey + 12} L${x - 5} ${ey + 3} L${x - 12} ${ey - 3} L${x - 3.5} ${ey - 3.5}Z`} fill="#ffc800" />;
      return <g className="eyes">{st(L)}{st(R)}</g>;
    }
    default: return <g className="eyes blink">{open(L)}{open(R)}</g>;
  }
}

export function browsEl(kind: Brows, cx: number, by: number, color: string, gap = 21) {
  if (kind === 'none') return null;
  const L = cx - gap, R = cx + gap;
  const b = (x1: number, y1: number, x2: number, y2: number) => <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={6} strokeLinecap="round" />;
  switch (kind) {
    case 'up': return <g>{b(L - 9, by - 4, L + 9, by - 6)}{b(R - 9, by - 6, R + 9, by - 4)}</g>;
    case 'worried': return <g>{b(L - 9, by, L + 9, by - 7)}{b(R - 9, by - 7, R + 9, by)}</g>;
    case 'angry': return <g>{b(L - 9, by - 6, L + 9, by + 2)}{b(R - 9, by + 2, R + 9, by - 6)}</g>;
    case 'one': return <g>{b(L - 9, by, L + 9, by)}{b(R - 9, by - 7, R + 9, by - 9)}</g>;
    default: return <g>{b(L - 9, by, L + 9, by - 1)}{b(R - 9, by - 1, R + 9, by)}</g>;
  }
}

export function mouthEl(kind: Mouth, cx: number, my: number) {
  switch (kind) {
    case 'grin': return <g><path d={`M${cx - 17} ${my - 4} H${cx + 17} Q${cx + 16} ${my + 18} ${cx} ${my + 18} Q${cx - 16} ${my + 18} ${cx - 17} ${my - 4}Z`} fill={MOUTH_D} /><path d={`M${cx - 15} ${my - 4} H${cx + 15} V${my + 1} H${cx - 15}Z`} fill={WHITE} /><ellipse cx={cx} cy={my + 13} rx={8} ry={4.5} fill={TONGUE} /></g>;
    case 'shout': return <g><path d={`M${cx - 18} ${my - 6} Q${cx} ${my - 10} ${cx + 18} ${my - 6} Q${cx + 16} ${my + 24} ${cx} ${my + 24} Q${cx - 16} ${my + 24} ${cx - 18} ${my - 6}Z`} fill={MOUTH_D} /><path d={`M${cx - 15} ${my - 6} Q${cx} ${my - 9} ${cx + 15} ${my - 6} L${cx + 14} ${my - 1} H${cx - 14}Z`} fill={WHITE} /><ellipse cx={cx} cy={my + 17} rx={10} ry={5.5} fill={TONGUE} /></g>;
    case 'frown': return <path d={`M${cx - 12} ${my + 8} Q${cx} ${my - 4} ${cx + 12} ${my + 8}`} stroke={MOUTH_D} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
    case 'o': return <g><ellipse cx={cx} cy={my + 6} rx={8} ry={10} fill={MOUTH_D} /><ellipse cx={cx} cy={my + 11} rx={5} ry={3.5} fill={TONGUE} /></g>;
    case 'talkA': return <g><ellipse cx={cx} cy={my + 5} rx={11} ry={10} fill={MOUTH_D} /><ellipse cx={cx} cy={my + 11} rx={6.5} ry={3.5} fill={TONGUE} /><rect x={cx - 8} y={my - 5} width={16} height={4} rx={2} fill={WHITE} /></g>;
    case 'talkB': return <g><ellipse cx={cx} cy={my + 3} rx={10} ry={5} fill={MOUTH_D} /><rect x={cx - 7} y={my - 1.5} width={14} height={3} rx={1.5} fill={WHITE} /></g>;
    case 'flat': return <path d={`M${cx - 10} ${my + 2} H${cx + 10}`} stroke={MOUTH_D} strokeWidth={5} strokeLinecap="round" />;
    case 'tiny': return <ellipse cx={cx} cy={my + 3} rx={4} ry={3} fill={MOUTH_D} />;
    case 'wavy': return <path d={`M${cx - 14} ${my + 4} q3.5 -5 7 0 t7 0 t7 0 t7 0`} stroke={MOUTH_D} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    case 'smirk': return <path d={`M${cx - 10} ${my + 3} Q${cx + 4} ${my + 9} ${cx + 14} ${my - 3}`} stroke={MOUTH_D} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
    case 'side': return <path d={`M${cx - 2} ${my + 4} Q${cx + 7} ${my + 7} ${cx + 14} ${my + 1}`} stroke={MOUTH_D} strokeWidth={5} strokeLinecap="round" fill="none" />;
    default: return <path d={`M${cx - 13} ${my} Q${cx} ${my + 12} ${cx + 13} ${my}`} stroke={MOUTH_D} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
  }
}

export function extrasEl(list: Extra[], cx: number, top: number) {
  return list.map((x) => {
    switch (x) {
      case 'sweat': return <path key={x} className="fx-drip" d={`M${cx + 58} ${top + 18} q8 12 0 16 q-8 -4 0 -16Z`} fill="#62c6ff" />;
      case 'tears': return <g key={x} className="fx-drip"><path d={`M${cx - 26} ${top + 78} q6 10 0 14 q-6 -4 0 -14Z`} fill="#62c6ff" /><path d={`M${cx + 26} ${top + 80} q6 10 0 14 q-6 -4 0 -14Z`} fill="#62c6ff" /></g>;
      case 'zzz': return <g key={x} className="fx-float" fill="#8b9bd8" fontFamily="Fredoka, sans-serif" fontWeight={700}><text x={cx + 50} y={top + 6} fontSize={22}>z</text><text x={cx + 64} y={top - 12} fontSize={28}>Z</text></g>;
      case 'sparkle': return <g key={x} className="fx-twinkle" fill="#ffc800"><path d={`M${cx - 70} ${top + 10} l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z`} /><path d={`M${cx + 66} ${top - 4} l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z`} /></g>;
      case 'hearts': return <g key={x} className="fx-float" fill="#ff3d6e"><path d={`M${cx + 60} ${top + 10} c-10 -8 -4 -16 0 -10 c4 -6 10 2 0 10z`} transform={`scale(1.4) translate(${-(cx + 60) * 0.29} ${-(top + 10) * 0.29})`} /><path d={`M${cx - 64} ${top + 24} c-8 -6 -3 -13 0 -8 c3 -5 8 2 0 8z`} /></g>;
      case 'flame': return <g key={x} className="fx-flicker"><path d={`M${cx} ${top - 44} C${cx + 26} ${top - 20} ${cx + 18} ${top + 4} ${cx} ${top + 4} C${cx - 18} ${top + 4} ${cx - 26} ${top - 20} ${cx} ${top - 44}Z`} fill="#ff7a00" /><path d={`M${cx} ${top - 24} C${cx + 12} ${top - 10} ${cx + 9} ${top + 2} ${cx} ${top + 2} C${cx - 9} ${top + 2} ${cx - 12} ${top - 10} ${cx} ${top - 24}Z`} fill="#ffc800" /></g>;
      case 'question': return <text key={x} className="fx-float" x={cx + 52} y={top + 4} fontSize={34} fontFamily="Fredoka, sans-serif" fontWeight={700} fill="#8b5cf6">?</text>;
      case 'anger': return <g key={x} stroke="#ff4b4b" strokeWidth={4.5} strokeLinecap="round" className="fx-twinkle"><path d={`M${cx + 48} ${top + 8} l6 6 M${cx + 62} ${top + 8} l-6 6 M${cx + 48} ${top + 22} l6 -6 M${cx + 62} ${top + 22} l-6 -6`} /></g>;
      default: return null;
    }
  });
}

// ---------- arms ----------
export function armPath(pose: Pose, side: -1 | 1, sx: number, sy: number): { d: string; hx: number; hy: number; front?: boolean } {
  // side -1 = character's right (screen left), 1 = screen right
  const s = side;
  switch (pose) {
    case 'up': return { d: `M${sx} ${sy} Q${sx + s * 26} ${sy - 18} ${sx + s * 30} ${sy - 58}`, hx: sx + s * 30, hy: sy - 62 };
    case 'wave': return s === 1 ? { d: `M${sx} ${sy} Q${sx + 30} ${sy - 6} ${sx + 34} ${sy - 50}`, hx: sx + 34, hy: sy - 54 } : armPath('down', s, sx, sy);
    case 'hips': return { d: `M${sx} ${sy} L${sx + s * 24} ${sy + 28} L${sx + s * 4} ${sy + 52}`, hx: sx + s * 4, hy: sy + 52 };
    case 'chin': return s === 1 ? { d: `M${sx} ${sy} Q${sx + 18} ${sy + 34} ${sx - 14} ${sy - 18}`, hx: sx - 16, hy: sy - 24, front: true } : armPath('down', s, sx, sy);
    case 'point': return s === 1 ? { d: `M${sx} ${sy} Q${sx + 26} ${sy + 4} ${sx + 54} ${sy - 4}`, hx: sx + 58, hy: sy - 5 } : armPath('hips', s, sx, sy);
    case 'facepalm': return s === -1 ? { d: `M${sx} ${sy} Q${sx - 22} ${sy - 30} ${sx + 12} ${sy - 70}`, hx: sx + 16, hy: sy - 76, front: true } : armPath('down', s, sx, sy);
    case 'hug': return { d: `M${sx} ${sy} Q${sx + s * 10} ${sy + 30} ${100 + s * 34} ${sy + 36}`, hx: 100 + s * 34, hy: sy + 36, front: true };
    case 'thumb': return s === 1 ? { d: `M${sx} ${sy} Q${sx + 30} ${sy + 22} ${sx + 30} ${sy - 10}`, hx: sx + 30, hy: sy - 14 } : armPath('down', s, sx, sy);
    case 'hold': return { d: `M${sx} ${sy} Q${sx + s * 22} ${sy - 20} ${sx + s * 16} ${sy - 62}`, hx: sx + s * 14, hy: sy - 66 };
    default: return { d: `M${sx} ${sy} Q${sx + s * 14} ${sy + 26} ${sx + s * 8} ${sy + 54}`, hx: sx + s * 8, hy: sy + 56 };
  }
}

const dk = (hex: string, a = 0.18) => {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.round(v * (1 - a)));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
};

const lt = (hex: string, a = 0.22) => {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.min(255, Math.round(v + (255 - v) * a));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
};

/** Eye colour and whether the character gets lash flicks. */
const EYES: Record<string, { iris: string; lash?: boolean }> = {
  malik: { iris: '#6b3f22' }, sophie: { iris: '#3f9be0', lash: true }, leo: { iris: '#3d8a4a' },
  imani: { iris: '#4a2a18', lash: true }, kenji: { iris: '#3a2a22' }, amira: { iris: '#5a3a22', lash: true }, 'ms-hart': { iris: '#4b7fb5', lash: true },
};

// ---------- the cast's own face parts (Tock keeps the originals above) ----------
function bEye(x: number, ey: number, out: -1 | 1, o: { ry?: number; px?: number; py?: number; ir?: number; pr?: number } = {}) {
  const { ry = 14, px = 1.5, py = 1.5, ir = 8.4, pr = 5.2 } = o;
  const rx = 11.5;
  return (
    <g key={x}>
      <ellipse cx={x} cy={ey} rx={rx} ry={ry} fill={WHITE} />
      <ellipse cx={x} cy={ey - ry + 3} rx={rx - 1.5} ry={5} fill="#c9d3ee" opacity={0.45} />
      <circle cx={x + px} cy={ey + py} r={ir} fill="var(--iris)" />
      <circle cx={x + px} cy={ey + py + 2} r={ir - 2.6} fill="#000" opacity={0.12} />
      <circle cx={x + px} cy={ey + py} r={pr} fill={EYE} />
      <circle cx={x + px + 3.2} cy={ey + py - 3.8} r={3} fill={WHITE} />
      <circle cx={x + px - 3.2} cy={ey + py + 4} r={1.5} fill={WHITE} opacity={0.9} />
      <path d={`M${x - rx - 0.8} ${ey - 1} Q${x} ${ey - ry - 10} ${x + rx + 0.8} ${ey - 1}`} stroke={EYE} strokeWidth={4.4} strokeLinecap="round" fill="none" />
      <path d={`M${x + out * (rx + 0.6)} ${ey - 3} l${out * 6} -5`} stroke={EYE} strokeWidth={3.4} strokeLinecap="round" style={{ opacity: 'var(--lash, 0)' as never }} />
    </g>
  );
}
function bEyes(kind: Eyes, cx: number, ey: number, gap = 21): ReactElement {
  const L = cx - gap, R = cx + gap;
  const arc = (x: number, up = true) => <path key={x} d={up ? `M${x - 11} ${ey + 4} Q${x} ${ey - 12} ${x + 11} ${ey + 4}` : `M${x - 11} ${ey - 2} Q${x} ${ey + 9} ${x + 11} ${ey - 2}`} stroke={EYE} strokeWidth={5.4} strokeLinecap="round" fill="none" />;
  const lids = (a: string) => (a === 'sad'
    ? <><path d={`M${L - 14} ${ey - 16} L${L + 13} ${ey - 7} L${L + 13} ${ey - 20} L${L - 14} ${ey - 20}Z`} fill="var(--lid)" /><path d={`M${R + 14} ${ey - 16} L${R - 13} ${ey - 7} L${R - 13} ${ey - 20} L${R + 14} ${ey - 20}Z`} fill="var(--lid)" /><path d={`M${L - 12} ${ey - 14} L${L + 12} ${ey - 6} M${R + 12} ${ey - 14} L${R - 12} ${ey - 6}`} stroke={EYE} strokeWidth={4} strokeLinecap="round" /></>
    : a === 'angry'
      ? <><path d={`M${L - 14} ${ey - 18} L${L + 14} ${ey - 18} L${L + 14} ${ey - 1} Z`} fill="var(--lid)" /><path d={`M${R + 14} ${ey - 18} L${R - 14} ${ey - 18} L${R - 14} ${ey - 1} Z`} fill="var(--lid)" /><path d={`M${L - 12} ${ey - 13} L${L + 12} ${ey - 2} M${R + 12} ${ey - 13} L${R - 12} ${ey - 2}`} stroke={EYE} strokeWidth={4.2} strokeLinecap="round" /></>
      : <><rect x={L - 14} y={ey - 18} width={28} height={16} fill="var(--lid)" /><rect x={R - 14} y={ey - 18} width={28} height={16} fill="var(--lid)" /><path d={`M${L - 12} ${ey - 2} H${L + 12} M${R - 12} ${ey - 2} H${R + 12}`} stroke={EYE} strokeWidth={4.2} strokeLinecap="round" /></>);
  switch (kind) {
    case 'happy': return <g className="eyes">{arc(L)}{arc(R)}</g>;
    case 'closed': return <g className="eyes">{arc(L, false)}{arc(R, false)}</g>;
    case 'wide': return <g className="eyes">{bEye(L, ey, -1, { ry: 16, px: 0, py: 0, ir: 7, pr: 3.4 })}{bEye(R, ey, 1, { ry: 16, px: 0, py: 0, ir: 7, pr: 3.4 })}</g>;
    case 'up': return <g className="eyes blink">{bEye(L, ey, -1, { py: -5 })}{bEye(R, ey, 1, { py: -5 })}</g>;
    case 'wink': return <g className="eyes">{bEye(L, ey, -1)}{arc(R)}</g>;
    case 'sad': return <g className="eyes blink">{bEye(L, ey, -1, { py: 3, px: 0 })}{bEye(R, ey, 1, { py: 3, px: 0 })}{lids('sad')}</g>;
    case 'half': case 'angry': return <g className="eyes">{bEye(L, ey, -1)}{bEye(R, ey, 1)}{lids(kind)}</g>;
    case 'hearts': {
      const h = (x: number) => <g key={x}><path d={`M${x} ${ey + 10} C${x - 18} ${ey - 2} ${x - 10} ${ey - 16} ${x} ${ey - 6} C${x + 10} ${ey - 16} ${x + 18} ${ey - 2} ${x} ${ey + 10}Z`} fill="#ff3d6e" /><path d={`M${x - 9} ${ey - 5} q2 -5 6 -4`} stroke="#fff" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.8} /></g>;
      return <g className="eyes">{h(L)}{h(R)}</g>;
    }
    case 'stars': return eyesEl('stars', cx, ey, gap);
    default: return <g className="eyes blink">{bEye(L, ey, -1)}{bEye(R, ey, 1)}</g>;
  }
}
function bBrows(kind: Brows, cx: number, by: number, color: string, gap = 21) {
  if (kind === 'none') return null;
  const L = cx - gap, R = cx + gap;
  const b = (x1: number, y1: number, x2: number, y2: number, bow = -2) => <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + bow} ${x2} ${y2}`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" />;
  switch (kind) {
    case 'up': return <g>{b(L - 10, by - 3, L + 10, by - 7, -5)}{b(R - 10, by - 7, R + 10, by - 3, -5)}</g>;
    case 'worried': return <g>{b(L - 10, by + 1, L + 10, by - 8, 1)}{b(R - 10, by - 8, R + 10, by + 1, 1)}</g>;
    case 'angry': return <g>{b(L - 10, by - 7, L + 10, by + 3, 1)}{b(R - 10, by + 3, R + 10, by - 7, 1)}</g>;
    case 'one': return <g>{b(L - 10, by, L + 10, by, 1)}{b(R - 10, by - 8, R + 10, by - 11, -5)}</g>;
    default: return <g>{b(L - 10, by, L + 10, by - 1)}{b(R - 10, by - 1, R + 10, by)}</g>;
  }
}
function bMouth(kind: Mouth, cx: number, my: number) {
  const dimple = kind === 'smile' || kind === 'grin' || kind === 'shout' || kind === 'smirk';
  return (
    <g>
      {mouthEl(kind, cx, my)}
      {dimple && <path d={`M${cx - 23} ${my - 2} q-3 5 0 9 M${cx + 23} ${my - 2} q3 5 0 9`} stroke="#000" strokeOpacity={0.16} strokeWidth={3} strokeLinecap="round" fill="none" />}
    </g>
  );
}

// ---------- arms & hands ----------
function Hand({ x, y, side, skin, cuff, thumbUp }: { x: number; y: number; side: -1 | 1; skin: string; cuff: string; thumbUp?: boolean }) {
  const sd = dk(skin, 0.2);
  return (
    <g>
      <circle cx={x} cy={y} r={13.5} fill={cuff} />
      <circle cx={x} cy={y} r={10.8} fill={sd} />
      <circle cx={x - 1} cy={y - 1} r={10} fill={skin} />
      {thumbUp
        ? <rect x={x - 4.5} y={y - 24} width={9} height={18} rx={4.5} fill={skin} />
        : <ellipse cx={x + side * 8} cy={y - 4} rx={4.6} ry={6.4} fill={skin} transform={`rotate(${side * 25} ${x + side * 8} ${y - 4})`} />}
      <path d={`M${x - 5} ${y + 1} q1 5 3 7 M${x + 1} ${y + 1} q1 5 3 7`} stroke={sd} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Arms({ pose, sleeve, skin, sx, sy, which, thumbUp, cuff }: { pose: Pose; sleeve: string; skin: string; sx: number; sy: number; which: 'back' | 'front'; thumbUp?: boolean; cuff: string }) {
  const out: ReactElement[] = [];
  ([-1, 1] as const).forEach((side) => {
    const a = armPath(pose, side, side === -1 ? 100 - sx : 100 + sx, sy);
    if (!!a.front !== (which === 'front')) return;
    const thumb = thumbUp && side === 1 && pose === 'thumb';
    out.push(
      <g key={side} className={pose === 'wave' && side === 1 ? 'arm-wave' : undefined} style={{ transformOrigin: `${100 + side * sx}px ${sy}px` }}>
        <path d={a.d} stroke={dk(sleeve, 0.2)} strokeWidth={19} strokeLinecap="round" fill="none" transform="translate(2.4 2.8)" />
        <path d={a.d} stroke={sleeve} strokeWidth={18} strokeLinecap="round" fill="none" />
        <path d={a.d} stroke={lt(sleeve, 0.38)} strokeWidth={4} strokeLinecap="round" fill="none" transform="translate(-4.2 -2.4)" opacity={0.65} />
        <Hand x={a.hx} y={a.hy} side={side} skin={skin} cuff={cuff} thumbUp={thumb} />
      </g>,
    );
  });
  return <>{out}</>;
}

function PropEl({ prop }: { prop: Prop }) {
  if (prop === 'books') return (
    <g>
      <rect x={70} y={174} width={62} height={15} rx={3.5} fill="#ef4444" /><rect x={70} y={174} width={62} height={5} rx={2.5} fill="#f87171" /><rect x={70} y={184} width={62} height={5} rx={2} fill="#c62d2d" /><rect x={118} y={174} width={5} height={15} fill="#fecaca" opacity={0.7} />
      <rect x={64} y={188} width={72} height={16} rx={3.5} fill="#3b82f6" /><rect x={64} y={188} width={72} height={5} rx={2.5} fill="#7ab3ff" /><rect x={64} y={199} width={72} height={5} rx={2} fill="#2563c9" /><circle cx={78} cy={196} r={3} fill="#fde68a" />
      <rect x={68} y={203} width={66} height={15} rx={3.5} fill="#22c55e" /><rect x={68} y={203} width={66} height={5} rx={2.5} fill="#6fe39a" /><rect x={68} y={213} width={66} height={5} rx={2} fill="#169846" />
      <path d="M126 176 V187 M130 191 V202 M128 206 V216" stroke="#fff" strokeWidth={3} opacity={0.55} />
    </g>
  );
  if (prop === 'book') return (
    <g>
      <path d="M100 184 L56 172 V218 L100 230Z" fill="#e3d2aa" /><path d="M100 184 L144 172 V218 L100 230Z" fill="#f7edd5" />
      <path d="M100 184 L54 170 V175 M100 184 L146 170 V175" stroke="#8a5a2b" strokeWidth={5} strokeLinecap="round" />
      <path d="M64 185 L94 193 M64 196 L94 204 M64 207 L94 215 M106 193 L136 185 M106 204 L136 196 M106 215 L136 207" stroke="#b9a684" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M100 184 V230" stroke="#c4ae82" strokeWidth={2.5} /><path d="M100 184 V230 L106 228 V186Z" fill="#000" opacity={0.06} />
      <path d="M88 170 L88 182" stroke="#e5313b" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
  return null;
}

// ---------- hair ----------
function HairBack({ l }: { l: Look }) {
  const c = l.hairC;
  switch (l.hair) {
    case 'ponytail': return (
      <g>
        <path d="M134 46 C192 34 208 118 176 188 C170 162 160 138 148 118Z" fill={c} />
        <path d="M152 66 C178 72 190 116 174 168 C172 138 162 108 150 88Z" fill={dk(c, 0.14)} />
        <path d="M160 62 C182 80 186 120 176 150" stroke={lt(c, 0.55)} strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={0.7} />
        <ellipse cx={146} cy={64} rx={8} ry={12} fill="#ff5e9c" transform="rotate(25 146 64)" /><path d="M143 56 q-2 6 0 10" stroke="#ffb0cf" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      </g>);
    case 'afro': return (
      <g>
        <g fill={c}><circle cx={100} cy={66} r={72} /><circle cx={38} cy={94} r={30} /><circle cx={162} cy={94} r={30} /><circle cx={58} cy={26} r={32} /><circle cx={142} cy={26} r={32} /><circle cx={100} cy={4} r={32} /></g>
        <g fill={dk(c, 0.0)}><ellipse cx={156} cy={80} rx={26} ry={60} fill={lt(c, 0.12)} opacity={0.0} /></g>
        <g stroke={lt(c, 0.26)} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.7}><path d="M44 22 q10 -10 20 -2" /><path d="M100 -18 q12 -4 20 6" /><path d="M150 14 q10 6 12 18" /><path d="M24 80 q-2 12 6 20" /><path d="M170 78 q4 12 -2 22" /><path d="M72 -4 q8 -6 16 0" /></g>
      </g>);
    case 'dreads': return (
      <g>{[[50, 64, 36, 154], [58, 70, 48, 164], [150, 64, 164, 154], [142, 70, 152, 164], [46, 82, 30, 140], [154, 82, 170, 140]].map(([x1, y1, x2, y2], i) => (
        <g key={i} fill="none" strokeLinecap="round"><path d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (x1 < 100 ? -6 : 6)} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke={c} strokeWidth={13} /><path d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (x1 < 100 ? -6 : 6)} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke={dk(c, 0.45)} strokeWidth={13} strokeLinecap="butt" strokeDasharray="2.2 9" /></g>
      ))}</g>);
    case 'hijab': return (
      <g>
        <path d="M100 16 C164 16 176 78 172 122 C170 162 184 194 152 218 H48 C16 194 30 162 28 122 C24 78 36 16 100 16Z" fill={c} />
        <path d="M150 40 C170 70 174 110 170 140 C168 170 178 196 150 218 H132 C160 190 158 150 156 120 C154 90 152 60 150 40Z" fill={dk(c, 0.14)} />
      </g>);
    case 'bun': return <circle cx={100} cy={20} r={20} fill={c} />;
    case 'bob': return (
      <g>
        <path d="M34 98 C28 34 66 18 100 18 C134 18 172 34 166 98 C168 132 162 154 152 162 H48 C38 154 32 132 34 98Z" fill={c} />
        <path d="M140 40 C164 56 168 104 160 150 L152 162 H132 C148 130 148 80 140 40Z" fill={dk(c, 0.14)} />
      </g>);
    default: return null;
  }
}
function HairFront({ l }: { l: Look }) {
  const c = l.hairC;
  const hl = (d: string, a = 0.45) => <path d={d} stroke={lt(c, a)} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />;
  switch (l.hair) {
    case 'dreads': return (
      <g>
        {[-72, -48, -24, 0, 24, 48, 72].map((a, i) => {
          const r = (a * Math.PI) / 180, len = 44 - Math.abs(a) * 0.12, x0 = 100 + Math.sin(r) * 8, y0 = 38 - Math.cos(r) * 4, x1 = 100 + Math.sin(r) * len, y1 = 34 - Math.cos(r) * len + 6;
          const d = `M${x0} ${y0} Q${(x0 + x1) / 2 + Math.sin(r) * 6} ${(y0 + y1) / 2 - 4} ${x1} ${y1}`;
          return <g key={i} fill="none"><path d={d} stroke={c} strokeWidth={14} strokeLinecap="round" /><path d={d} stroke={dk(c, 0.45)} strokeWidth={14} strokeDasharray="2.2 9" /></g>;
        })}
        <path d="M42 90 C36 44 66 24 100 24 C134 24 164 44 158 90 C148 68 128 60 100 60 C72 60 52 68 42 90Z" fill={c} />
        {hl('M58 50 C72 36 92 32 110 34')}
        <path d="M70 60 C84 52 116 52 130 60" stroke={dk(c, 0.4)} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      </g>);
    case 'ponytail': return (
      <g>
        <path d="M40 90 C34 38 70 16 106 20 C142 24 166 46 160 90 C154 72 146 62 134 56 C124 74 94 82 66 68 C56 74 46 80 40 90Z" fill={c} />
        <path d="M66 68 C94 82 124 74 134 56 L134 62 C122 82 92 90 62 74Z" fill={dk(c, 0.16)} />
        {hl('M56 46 C72 30 100 26 124 32')}{hl('M46 66 C48 56 52 50 58 44', 0.4)}
        <path d="M100 22 C98 34 92 44 82 52" stroke={dk(c, 0.2)} strokeWidth={3} strokeLinecap="round" fill="none" />
      </g>);
    case 'spiky': return (
      <g>
        <path transform="translate(0 -5) scale(1 1.02)" d="M44 84 C38 52 52 34 62 32 L58 14 L80 26 L86 4 L102 24 L118 6 L124 28 L146 18 L140 38 C156 48 160 66 156 84 C148 66 134 58 120 56 L112 68 L104 56 L94 68 L86 56 C70 58 54 66 44 84Z" fill={dk(c, 0.26)} />
        <path d="M44 84 C38 52 52 34 62 32 L58 14 L80 26 L86 4 L102 24 L118 6 L124 28 L146 18 L140 38 C156 48 160 66 156 84 C148 66 134 58 120 56 L112 68 L104 56 L94 68 L86 56 C70 58 54 66 44 84Z" fill={c} />
        <path d="M66 34 L62 18 L74 28Z M88 22 L86 8 L98 22Z M120 26 L118 12 L128 30Z" fill={lt(c, 0.4)} opacity={0.75} />
        <path d="M136 50 C146 58 150 68 150 78 C142 66 134 60 122 57Z" fill={dk(c, 0.2)} />
      </g>);
    case 'afro': return (
      <g>
        <path d="M44 84 C46 40 72 30 100 30 C128 30 154 40 156 84 C140 64 122 58 100 58 C78 58 60 64 44 84Z" fill={c} />
        {[56, 78, 100, 122, 144].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 40 : 44} r={14} fill={c} />)}
        <path d="M44 66 Q100 36 156 66 L154 80 Q100 50 46 80Z" fill="#ff6b9d" />
        <path d="M46 72 Q100 42 154 72" stroke="#ffd0e0" strokeWidth={3} strokeLinecap="round" fill="none" strokeDasharray="1 9" />
        <path d="M60 60 Q80 50 100 49" stroke="#ffb3cf" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.8} />
      </g>);
    case 'bowl': return (
      <g>
        <path d="M40 92 C34 40 66 18 100 18 C134 18 166 40 160 92 L152 92 C148 76 140 64 130 60 L128 72 L114 62 L100 72 L86 62 L72 72 L70 60 C60 64 52 76 48 92Z" fill={c} />
        <path d="M130 60 L128 72 L114 62 L100 72 L86 62 L72 72 L70 60 L74 66 L86 70 L100 78 L114 70 L128 66Z" fill={dk(c, 0.3)} opacity={0.6} />
        {hl('M58 42 C76 28 108 26 130 36', 0.42)}{hl('M48 62 C48 54 50 48 54 42', 0.35)}
      </g>);
    case 'bun': return <path d="M44 84 C40 40 70 26 100 26 C130 26 160 40 156 84 C146 64 128 54 100 54 C72 54 54 64 44 84Z" fill={c} />;
    case 'hijab': return (
      <g>
        <path d="M100 28 C142 28 158 56 158 88 C152 62 132 46 100 46 C68 46 48 62 42 88 C42 56 58 28 100 28Z" fill={c} />
        <path d="M44 86 C50 62 70 48 100 48 C130 48 150 62 156 86 C148 66 130 56 100 56 C70 56 52 66 44 86Z" fill={dk(c, 0.16)} />
        <path d="M58 50 C72 38 92 34 108 34" stroke={lt(c, 0.5)} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        <path d="M80 150 C84 164 92 174 98 182 M118 150 C116 164 112 176 108 184" stroke={dk(c, 0.18)} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <g transform="translate(138 138)"><circle r={9} fill="#fff" /><circle r={9} fill="#ffd34d" opacity={0.0} /><path d="M0 -6 L2 -1 L7 0 L3 3 L4 8 L0 5 L-4 8 L-3 3 L-7 0 L-2 -1Z" fill="#ff7a8a" /></g>
      </g>);
    case 'bob': return (
      <g>
        <path d="M40 98 C36 42 68 20 100 20 C132 20 164 42 160 98 C152 74 138 56 120 50 C110 64 84 72 62 66 C52 74 44 84 40 98Z" fill={c} />
        <path d="M62 66 C84 72 110 64 120 50 L120 56 C108 72 82 80 58 72Z" fill={dk(c, 0.16)} />
        {hl('M58 42 C76 28 108 26 128 34', 0.55)}{hl('M44 70 C44 60 48 52 54 46', 0.5)}
      </g>);
    default: return null;
  }
}

// ---------- main ----------
export function Buddy({ who, mood = 'neutral', pose, talking, size, flip, className }: { who: string; mood?: Mood; pose?: Pose; talking?: boolean; size?: number; flip?: boolean; className?: string }) {
  const l = LOOKS[who] || LOOKS.malik;
  const eye = EYES[who] || EYES.malik;
  const f = MOODS[mood] || MOODS.neutral;
  const talk = useTalking(who, talking);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = pose || (talk && f.pose === 'down' ? 'wave' : f.pose);
  const mouth = talk || f.mouth;
  const bw = l.bodyW || 0;
  const hijab = l.hair === 'hijab';
  const legs = l.legs || l.bottom;
  const P: Pose = pose || (mood === 'neutral' && l.sig ? l.sig : p);
  const prop = l.prop && (P === 'hug' || P === 'chin') ? l.prop : 'none';
  const hem = l.long ? 254 : 236;
  const HEAD = 'M100 26 C138 26 158 54 158 94 C158 128 138 154 100 154 C62 154 42 128 42 94 C42 54 62 26 100 26Z';
  const TORSO = `M${64 - bw} 154 C${72 - bw} 147 ${84 - bw} 145 100 145 C${116 + bw} 145 ${128 + bw} 147 ${136 + bw} 154 C${148 + bw} 158 ${152 + bw} 172 ${152 + bw} 190 L${150 + bw} ${hem - 12} Q${150 + bw} ${hem} ${134 + bw} ${hem} H${66 - bw} Q${50 - bw} ${hem} ${50 - bw} ${hem - 12} L${48 - bw} 190 C${48 - bw} 172 ${52 - bw} 158 ${64 - bw} 154Z`;
  const browC = hijab ? '#4a2f22' : l.hair === 'bob' || l.hair === 'bun' ? '#8d8f98' : l.hairC === '#ffcf3a' ? '#c98f1d' : l.hairC;
  const cuff = dk(l.sleeve, 0.14);
  const shoeC = l.shoe, shoeW = shoeC === '#ffffff';
  return (
    <svg className={`buddy anim-${f.anim} ${className || ''}`} viewBox="-20 -40 240 340" style={{ ['--lid' as string]: l.skin, ['--iris' as string]: eye.iris, ['--lash' as string]: eye.lash ? 1 : 0, width: size, transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <defs>
        <clipPath id={`${uid}h`}><path d={HEAD} /></clipPath>
        <clipPath id={`${uid}t`}><path d={TORSO} /></clipPath>
      </defs>
      <ellipse cx={100} cy={291} rx={58} ry={7.5} fill="rgba(30,30,60,.13)" className="shadow" />
      <g className="body">
        <HairBack l={l} />
        {/* legs + sneakers */}
        {[72, 105].map((x) => <g key={x}>
          <rect x={x} y={212} width={23} height={72} rx={11} fill={legs} />
          <rect x={x + 12} y={212} width={11} height={72} rx={5.5} fill={dk(legs, 0.14)} opacity={0.85} />
          {!l.legs && <path d={`M${x + 3} 252 q8 5 17 0 M${x + 3} 262 q8 4 17 0`} stroke={dk(legs, 0.25)} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
          {l.legs && <rect x={x} y={262} width={23} height={9} rx={3} fill="#fff" opacity={0.92} />}
        </g>)}
        {l.legs && who === 'leo' && <>{[69, 104].map((x) => <g key={x}><rect x={x} y={214} width={27} height={44} rx={8} fill={l.bottom} /><rect x={x + 14} y={214} width={13} height={44} rx={6} fill={dk(l.bottom, 0.14)} /><path d={`M${x + 4} 254 h19`} stroke={dk(l.bottom, 0.25)} strokeWidth={2.6} strokeLinecap="round" /></g>)}</>}
        {[62, 104].map((x) => <g key={x}>
          <path d={`M${x} 288 V278 Q${x} 266 ${x + 14} 266 H${x + 24} Q${x + 40} 268 ${x + 40} 284 V288Z`} fill={shoeC} />
          <path d={`M${x + 22} 270 Q${x + 40} 272 ${x + 40} 284 V288 H${x + 20}Z`} fill={shoeW ? '#e8ecf5' : lt(shoeC, 0.3)} />
          <path d={`M${x + 8} 268 q3 -4 10 -3`} stroke={shoeW ? '#fff' : lt(shoeC, 0.5)} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
          <path d={`M${x + 11} 270 l8 3 M${x + 10} 275 l9 3`} stroke={shoeW ? '#aab4c8' : '#ffffff'} strokeWidth={2.4} strokeLinecap="round" />
          <rect x={x - 2} y={283} width={44} height={7.5} rx={3.75} fill={shoeW ? '#c9d0df' : '#ffffff'} />
        </g>)}
        {/* torso */}
        <path d={TORSO} fill={l.top} />
        <g clipPath={`url(#${uid}t)`}>
          <ellipse cx={162 + bw} cy={196} rx={34} ry={78} fill={l.topD} opacity={0.75} />
          <ellipse cx={100} cy={hem + 6} rx={70} ry={14} fill={dk(l.top, 0.2)} />
          <path d={`M${72 - bw} 196 q8 6 5 24 M${128 + bw} 192 q-9 8 -5 28`} stroke={dk(l.top, 0.22)} strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d={`M${66 - bw} 160 Q${80 - bw} 150 ${96} 150`} stroke={lt(l.top, 0.45)} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        </g>
        {l.legs && !l.long && who !== 'leo' && <><path d={`M${52 - bw} 206 H${148 + bw} L${156 + bw} 246 Q${156 + bw} 252 ${150 + bw} 252 H${50 - bw} Q${44 - bw} 252 ${44 - bw} 246Z`} fill={l.bottom} /><path d={`M${126 + bw} 206 H${148 + bw} L${156 + bw} 246 Q${156 + bw} 252 ${150 + bw} 252 H${120 + bw}Z`} fill={dk(l.bottom, 0.14)} /><path d={`M70 212 L66 250 M90 212 L88 250 M110 212 L112 250 M130 212 L134 250`} stroke={dk(l.bottom, 0.22)} strokeWidth={3} strokeLinecap="round" /></>}
        {(!l.legs || who === 'leo') && !l.long && <><rect x={52 - bw} y={220} width={96 + 2 * bw} height={20} rx={8} fill={l.bottom} /><rect x={52 - bw} y={220} width={96 + 2 * bw} height={7} rx={3.5} fill={dk(l.bottom, 0.28)} /><rect x={94} y={220} width={12} height={7} rx={2} fill="#ffd34d" /><path d={`M${100 + 30 + bw} 222 V240`} stroke={dk(l.bottom, 0.2)} strokeWidth={3} strokeLinecap="round" /></>}
        {l.long && <>
          <path d="M88 150 L100 172 L112 150 V248 H88Z" fill="#fff7ef" /><path d="M88 150 L100 172 L112 150 L108 150 L100 164 L92 150Z" fill="#ead9c6" />
          {[188, 208, 228].map((y) => <circle key={y} cx={84} cy={y} r={3.6} fill={dk(l.top, 0.35)} />)}
          <path d="M60 246 H140" stroke={dk(l.top, 0.3)} strokeWidth={3.5} />
          <path d={`M${112 + bw} 190 h14 v16 h-14z`} fill={dk(l.top, 0.12)} /><circle cx={100} cy={176} r={5} fill="#ffd34d" /><circle cx={100} cy={176} r={2.2} fill="#fff6c2" />
        </>}
        {l.extra === 'overalls' && <>
          <path d="M66 182 H134 V240 H66Z" fill={l.bottom} /><path d="M118 182 H134 V240 H118Z" fill={dk(l.bottom, 0.14)} />
          <rect x={70} y={150} width={12} height={40} rx={4} fill={l.bottom} /><rect x={118} y={150} width={12} height={40} rx={4} fill={dk(l.bottom, 0.1)} />
          <circle cx={76} cy={188} r={5} fill="#ffd34d" /><circle cx={124} cy={188} r={5} fill="#ffd34d" /><circle cx={74.6} cy={186.6} r={1.8} fill="#fff6c2" />
          <rect x={84} y={200} width={32} height={20} rx={5} fill={dk(l.bottom, 0.15)} /><path d="M88 204 H112" stroke={lt(l.bottom, 0.4)} strokeWidth={2.4} strokeDasharray="3 3" strokeLinecap="round" />
        </>}
        {l.extra === 'jacket' && <>
          <path d="M86 150 H114 L110 240 H90Z" fill="#ffffff" /><path d="M86 150 H100 L98 240 H90Z" fill="#eef2f7" opacity={0.7} />
          <path d="M86 150 L96 180 L90 240 M114 150 L104 180 L110 240" stroke={dk(l.top, 0.3)} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <rect x={102} y={208} width={5} height={12} rx={2.5} fill="#ffd34d" /><path d="M58 206 h20 M122 206 h20" stroke={dk(l.top, 0.28)} strokeWidth={3} strokeLinecap="round" />
        </>}
        {l.extra === 'hood' && <>
          <path d="M66 148 Q100 184 134 148 Q100 166 66 148Z" fill={l.topD} /><path d="M76 150 Q100 176 124 150" stroke={dk(l.top, 0.3)} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M91 166 V192 M109 166 V192" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" /><circle cx={91} cy={194} r={3.6} fill="#fff" /><circle cx={109} cy={194} r={3.6} fill="#fff" />
          <path d="M70 206 H130 L124 228 H76Z" fill={l.topD} /><path d="M70 206 H130" stroke={lt(l.top, 0.3)} strokeWidth={2.5} strokeLinecap="round" /><path d="M64 ${hem - 12} H136" stroke="none" />
          <path d={`M${52 - bw} ${hem - 10} H${148 + bw}`} stroke={dk(l.top, 0.28)} strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round" />
        </>}
        {l.extra === 'collar' && !l.long && <>
          <path d="M76 146 L100 170 L124 146 L118 144 L100 160 L82 144Z" fill="#ffffff" /><path d="M100 170 L124 146 L118 144 L100 160Z" fill="#dfe5ef" />
          <path d="M100 172 V236" stroke={dk(l.top, 0.22)} strokeWidth={3} strokeLinecap="round" />{[186, 204, 222].map((y) => <circle key={y} cx={100} cy={y} r={3} fill="#fff6dd" />)}
          <path d="M92 176 L100 188 L108 176Z" fill="#e24b4b" opacity={0.0} />
        </>}
        {l.extra === 'backpack' && <>
          <path d="M62 152 V212" stroke="#d93636" strokeWidth={11} strokeLinecap="round" /><path d="M138 152 V212" stroke="#d93636" strokeWidth={11} strokeLinecap="round" /><path d="M65 152 V212" stroke="#f26b6b" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          <rect x={57} y={188} width={16} height={9} rx={3} fill="#ffd34d" /><rect x={127} y={188} width={16} height={9} rx={3} fill="#ffd34d" />
          <rect x={62} y={176} width={76} height={9} fill={l.topD} opacity={0.0} /><path d="M72 206 H128 M72 214 H128" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
        </>}
        {l.extra === undefined && !l.long && <>
          <path d="M70 190 H130" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.0} />
          <path d={`M${58 - bw} 214 H${142 + bw}`} stroke={lt(l.top, 0.55)} strokeWidth={6} strokeLinecap="round" /><path d={`M${58 - bw} 226 H${142 + bw}`} stroke={lt(l.top, 0.35)} strokeWidth={4} strokeLinecap="round" />
          <path d="M80 148 Q100 164 120 148" stroke={dk(l.top, 0.3)} strokeWidth={4} strokeLinecap="round" fill="none" />
          <g transform="translate(100 190)"><path d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2 L7.5 11 L0 6 L-7.5 11 L-5.5 2 L-12 -3.5 L-3.5 -4Z" fill="#fff" opacity={0.95} /></g>
        </>}
        <Arms pose={P} sleeve={l.sleeve} skin={l.skin} sx={42 + bw} sy={166} which="back" thumbUp cuff={cuff} />
        {/* neck, ears, head */}
        <path d="M86 138 H114 V160 Q100 170 86 160Z" fill={l.shade} /><path d="M86 138 H114 V152 Q100 160 86 152Z" fill={dk(l.shade, 0.18)} />
        {!hijab && l.hair !== 'bob' && [42, 158].map((x) => <g key={x}><ellipse cx={x} cy={100} rx={11.5} ry={14} fill={l.skin} /><ellipse cx={x + (x < 100 ? 1 : -1)} cy={101} rx={5.5} ry={8} fill={l.shade} /></g>)}
        {hijab ? <path d={HEAD} fill={l.skin} clipPath={undefined} /> : <path d={HEAD} fill={l.skin} />}
        {hijab && <path d="M44 102 C42 182 158 182 156 102 L162 170 Q100 200 38 170Z" fill={l.hairC} />}
        {hijab && <path d="M104 150 C130 154 154 140 158 110 L162 170 Q132 196 100 196Z" fill={dk(l.hairC, 0.14)} opacity={0.8} />}
        <g clipPath={`url(#${uid}h)`}>
          <ellipse cx={168} cy={100} rx={36} ry={76} fill={l.shade} opacity={0.6} />
          <ellipse cx={100} cy={30} rx={68} ry={36} fill={l.shade} opacity={0.55} />
          <ellipse cx={100} cy={160} rx={46} ry={12} fill={l.shade} opacity={0.35} />
        </g>
        <ellipse cx={65} cy={118} rx={12.5} ry={7.5} fill="#ff6f86" opacity={0.4} />
        <ellipse cx={135} cy={118} rx={12.5} ry={7.5} fill="#ff6f86" opacity={0.4} />
        <ellipse cx={100} cy={108} rx={6.2} ry={4.6} fill={l.shade} /><ellipse cx={98.4} cy={106.4} rx={2.4} ry={1.4} fill="#fff" opacity={0.55} />
        <g className="face">
          {bEyes(f.eyes, 100, 92)}
          {l.glasses && <g fill="none"><circle cx={79} cy={92} r={18} fill="#cfe9ff" fillOpacity={0.16} stroke={l.glasses} strokeWidth={4.6} /><circle cx={121} cy={92} r={18} fill="#cfe9ff" fillOpacity={0.16} stroke={l.glasses} strokeWidth={4.6} /><path d="M96 90 Q100 85 104 90" stroke={l.glasses} strokeWidth={4.2} /><path d="M61 90 L48 86 M139 90 L152 86" stroke={l.glasses} strokeWidth={4.2} strokeLinecap="round" /><path d="M68 80 q4 -5 10 -5 M110 80 q4 -5 10 -5" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" opacity={0.75} /></g>}
          {bBrows(f.brows, 100, l.glasses ? 64 : 72, browC)}
          {bMouth(mouth as Mouth, 100, 126)}
        </g>
        <HairFront l={l} />
        <PropEl prop={prop === 'pencil' ? 'none' : prop} />
        <Arms pose={P} sleeve={l.sleeve} skin={l.skin} sx={42 + bw} sy={166} which="front" cuff={cuff} />
        {prop === 'pencil' && <g transform={`translate(${100 + 42 + bw - 16} ${166 - 24}) rotate(-30)`}><rect x={-4.5} y={-32} width={9} height={32} rx={2.5} fill="#ffc800" /><rect x={-4.5} y={-32} width={4} height={32} rx={2} fill="#ffe27a" /><path d="M-4.5 -32 L0 -43 L4.5 -32Z" fill="#f5d0a0" /><path d="M-1.6 -38 L0 -43 L1.6 -38Z" fill="#333" /><rect x={-4.5} y={-2} width={9} height={7} rx={2} fill="#ff86a8" /></g>}
        {f.extras.includes('trophy') && <TrophyProp x={100} y={64} />}
        {extrasEl(f.extras.filter((x) => x !== 'trophy'), 100, 30)}
      </g>
    </svg>
  );
}

export function TrophyProp({ x, y }: { x: number; y: number }) {
  return (
    <g className="prop" transform={`translate(${x - 26} ${y - 92})`}>
      <path d="M8 6 H44 V22 C44 38 34 46 26 46 C18 46 8 38 8 22Z" fill="#ffc800" />
      <path d="M26 6 H44 V22 C44 38 34 46 26 46Z" fill="#f0a800" />
      <path d="M8 10 C-6 10 -4 30 10 30 M44 10 C58 10 56 30 42 30" stroke="#ffb000" strokeWidth={5} fill="none" />
      <rect x={20} y={44} width={12} height={10} fill="#ffb000" /><rect x={10} y={52} width={32} height={10} rx={4} fill="#e09000" />
      <path d="M18 14 L22 26" stroke="#fff6c2" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

/** Map lesson moods to character moods. */
export const askMood = (phase: 'answer' | 'feedback', ok: boolean, combo: number): Mood =>
  phase === 'answer' ? 'neutral' : ok ? (combo >= 5 ? 'fire' : combo >= 3 ? 'cheer' : 'happy') : (combo === 0 && Math.random() < 0.5 ? 'oops' : 'sad');

/** Round profile picture: a character's head on a coloured background. */
export function Avatar({ who, bg = '#ddf4ff', size = 40, pro, className = '' }: { who: string; bg?: string; size?: number; pro?: boolean; className?: string }) {
  return (
    <span className={`avatar ${pro ? 'is-pro' : ''} ${className}`} style={{ width: size, height: size, background: bg }}>
      <span className="avatar-in">{who === 'tock' ? <Tock mood="neutral" /> : <Buddy who={who} mood="neutral" pose="down" />}</span>
    </span>
  );
}
