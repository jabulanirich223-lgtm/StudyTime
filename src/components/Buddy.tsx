import { useEffect, useState, type ReactElement } from 'react';
import { onSpeaking } from '../lib/speech';
import { Tock } from './Tock';

/* Flat, geometric cartoon characters drawn in SVG.
   No outlines, bold flat colours, chunky shapes, big expressive faces.
   Every character shares one face/pose rig, so all of them get every expression. */

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

function Arms({ pose, sleeve, skin, sx, sy, which, thumbUp }: { pose: Pose; sleeve: string; skin: string; sx: number; sy: number; which: 'back' | 'front'; thumbUp?: boolean }) {
  const out: ReactElement[] = [];
  ([-1, 1] as const).forEach((side) => {
    const a = armPath(pose, side, side === -1 ? 100 - sx : 100 + sx, sy);
    if (!!a.front !== (which === 'front')) return;
    const thumb = thumbUp && side === 1 && pose === 'thumb';
    out.push(
      <g key={side} className={pose === 'wave' && side === 1 ? 'arm-wave' : undefined} style={{ transformOrigin: `${100 + side * sx}px ${sy}px` }}>
        <path d={a.d} stroke={dk(sleeve)} strokeWidth={21} strokeLinecap="round" fill="none" />
        <path d={a.d} stroke={sleeve} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={a.hx} cy={a.hy} r={11.5} fill={dk(skin, 0.14)} />
        <circle cx={a.hx} cy={a.hy} r={9.5} fill={skin} />
        {thumb
          ? <rect x={a.hx - 4} y={a.hy - 22} width={8} height={16} rx={4} fill={skin} stroke={dk(skin, 0.14)} strokeWidth={2} />
          : <circle cx={a.hx + side * 7} cy={a.hy - 5} r={4.5} fill={skin} stroke={dk(skin, 0.14)} strokeWidth={2} />}
      </g>,
    );
  });
  return <>{out}</>;
}

function PropEl({ prop }: { prop: Prop }) {
  if (prop === 'books') return (
    <g>
      <rect x={70} y={170} width={62} height={15} rx={3} fill="#ef4444" /><rect x={70} y={170} width={62} height={5} rx={2} fill="#f87171" />
      <rect x={64} y={184} width={72} height={16} rx={3} fill="#3b82f6" /><rect x={64} y={184} width={72} height={5} rx={2} fill="#60a5fa" />
      <rect x={68} y={199} width={66} height={15} rx={3} fill="#22c55e" /><rect x={68} y={199} width={66} height={5} rx={2} fill="#4ade80" />
      <path d="M126 172 V183 M130 187 V198 M128 202 V212" stroke="#fff" strokeWidth={3} opacity={0.6} />
    </g>
  );
  if (prop === 'book') return (
    <g>
      <path d="M100 182 L58 170 V214 L100 226Z" fill="#e8d9b6" /><path d="M100 182 L142 170 V214 L100 226Z" fill="#f5ead1" />
      <path d="M100 182 L56 168 V172 M100 182 L144 168 V172" stroke="#8a5a2b" strokeWidth={4} />
      <path d="M66 182 L94 189 M66 192 L94 199 M66 202 L94 209 M106 189 L134 182 M106 199 L134 192 M106 209 L134 202" stroke="#b9a684" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M100 182 V226" stroke="#c9b48c" strokeWidth={2} />
    </g>
  );
  return null;
}

// ---------- hair ----------
function HairBack({ l }: { l: Look }) {
  const c = l.hairC;
  switch (l.hair) {
    case 'ponytail': return <path d="M140 44 C182 50 186 120 168 170 C160 150 150 120 146 92Z" fill={c} />;
    case 'afro': return <g fill={c}><circle cx={100} cy={64} r={70} /><circle cx={44} cy={92} r={30} /><circle cx={156} cy={92} r={30} /></g>;
    case 'dreads': return <g stroke={c} strokeWidth={11} strokeLinecap="round"><path d="M52 70 L40 150" /><path d="M148 70 L160 150" /><path d="M58 64 L52 158" /><path d="M142 64 L150 158" /></g>;
    case 'hijab': return <path d="M100 18 C162 18 172 78 168 120 C166 160 178 190 150 214 H50 C22 190 34 160 32 120 C28 78 38 18 100 18Z" fill={c} />;
    case 'bun': return <circle cx={100} cy={20} r={20} fill={c} />;
    case 'bob': return <path d="M36 96 C30 36 66 20 100 20 C134 20 170 36 164 96 C166 128 160 150 150 158 H50 C40 150 34 128 36 96Z" fill={c} stroke={dk(c)} strokeWidth={3} />;
    default: return null;
  }
}
function HairFront({ l }: { l: Look }) {
  const c = l.hairC;
  switch (l.hair) {
    case 'dreads': return <g fill={c}><path d="M46 78 C44 38 70 24 100 24 C130 24 156 38 154 78 C140 62 120 56 100 56 C80 56 60 62 46 78Z" />
      <g stroke={c} strokeWidth={10} strokeLinecap="round"><path d="M100 26 L84 -4" /><path d="M100 26 L100 -8" /><path d="M100 26 L116 -4" /><path d="M100 26 L128 4" /><path d="M100 26 L72 4" /></g><circle cx={100} cy={26} r={11} /></g>;
    case 'ponytail': return <path d="M44 82 C40 34 72 22 104 24 C138 26 160 44 156 84 C150 70 140 60 128 56 C112 70 80 74 60 64 C52 70 48 76 44 82Z" fill={c} />;
    case 'spiky': return <path d="M44 84 C38 52 52 34 62 32 L58 14 L80 26 L86 4 L102 24 L118 6 L124 28 L146 18 L140 38 C156 48 160 66 156 84 C148 66 134 58 120 56 L112 68 L104 56 L94 68 L86 56 C70 58 54 66 44 84Z" fill={c} />;
    case 'afro': return <path d="M48 76 C54 46 76 36 100 36 C124 36 146 46 152 76 C136 62 118 58 100 58 C82 58 64 62 48 76Z" fill={c} />;
    case 'bowl': return <path d="M42 90 C36 40 66 22 100 22 C134 22 164 40 158 90 L150 90 C146 74 138 64 128 60 L126 72 L112 62 L100 72 L88 62 L74 72 L72 60 C62 64 54 74 50 90Z" fill={c} />;
    case 'bun': return <path d="M44 84 C40 40 70 26 100 26 C130 26 160 40 156 84 C146 64 128 54 100 54 C72 54 54 64 44 84Z" fill={c} />;
    case 'hijab': return <path d="M100 30 C140 30 154 56 154 84 C150 60 130 46 100 46 C70 46 50 60 46 84 C46 56 60 30 100 30Z" fill={c} />;
    case 'bob': return <path d="M42 92 C38 42 68 24 100 24 C132 24 162 42 158 92 C150 70 136 56 118 52 C106 64 82 70 62 64 C52 72 46 80 42 92Z" fill={c} />;
    default: return null;
  }
}

// ---------- main ----------
export function Buddy({ who, mood = 'neutral', pose, talking, size, flip, className }: { who: string; mood?: Mood; pose?: Pose; talking?: boolean; size?: number; flip?: boolean; className?: string }) {
  const l = LOOKS[who] || LOOKS.malik;
  const f = MOODS[mood] || MOODS.neutral;
  const talk = useTalking(who, talking);
  const p = pose || (talk && f.pose === 'down' ? 'wave' : f.pose);
  const mouth = talk || f.mouth;
  const bw = l.bodyW || 0;
  const hijab = l.hair === 'hijab';
  const legs = l.legs || l.bottom;
  const P: Pose = pose || (mood === 'neutral' && l.sig ? l.sig : p);
  const prop = l.prop && (P === 'hug' || P === 'chin') ? l.prop : 'none';
  const hemY = l.long ? 252 : 236;
  const rim = (c: string) => ({ stroke: dk(c), strokeWidth: 3.5 });
  return (
    <svg className={`buddy anim-${f.anim} ${className || ''}`} viewBox="-20 -40 240 340" style={{ ['--lid' as string]: l.skin, width: size, transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <ellipse cx={100} cy={291} rx={56} ry={7} fill="rgba(30,30,60,.1)" className="shadow" />
      <g className="body">
        <HairBack l={l} />
        {/* legs + sneakers */}
        <rect x={72} y={212} width={23} height={70} rx={11} fill={legs} {...rim(legs)} />
        <rect x={105} y={212} width={23} height={70} rx={11} fill={legs} {...rim(legs)} />
        {l.legs && <><rect x={72} y={212} width={23} height={30} fill={l.bottom} /><rect x={105} y={212} width={23} height={30} fill={l.bottom} /></>}
        {[64, 104].map((x) => <g key={x}><path d={`M${x} 286 V278 Q${x} 268 ${x + 12} 268 H${x + 22} Q${x + 34} 270 ${x + 34} 282 V286Z`} fill={l.shoe} {...rim(l.shoe === '#ffffff' ? '#d6dae3' : l.shoe)} /><rect x={x - 1} y={283} width={36} height={6} rx={3} fill={l.shoe === '#ffffff' ? '#cfd5df' : '#ffffff'} /></g>)}
        {/* torso */}
        <path d={`M${68 - bw} 150 H${132 + bw} Q${146 + bw} 150 ${147 + bw} 166 L${150 + bw} ${hemY - 14} Q${150 + bw} ${hemY} ${134 + bw} ${hemY} H${66 - bw} Q${50 - bw} ${hemY} ${50 - bw} ${hemY - 14} L${53 - bw} 166 Q${54 - bw} 150 ${68 - bw} 150Z`} fill={l.top} {...rim(l.top)} />
        {l.legs && !l.long && <path d={`M${54 - bw} 206 H${146 + bw} L${152 + bw} 244 Q${152 + bw} 248 ${148 + bw} 248 H${52 - bw} Q${48 - bw} 248 ${48 - bw} 244Z`} fill={l.bottom} {...rim(l.bottom)} />}
        {!l.legs && !l.long && <rect x={54 - bw} y={220} width={92 + 2 * bw} height={18} rx={7} fill={l.bottom} {...rim(l.bottom)} />}
        {l.long && <><path d="M88 150 L100 170 L112 150 V236 H88Z" fill="#fff7ef" /><circle cx={84} cy={186} r={3} fill={dk(l.top, 0.3)} /><circle cx={84} cy={206} r={3} fill={dk(l.top, 0.3)} /><circle cx={84} cy={226} r={3} fill={dk(l.top, 0.3)} /><path d="M58 236 H142" stroke={dk(l.top)} strokeWidth={3} /></>}
        {l.extra === 'overalls' && <><path d="M68 184 H132 V238 H68Z" fill={l.bottom} {...rim(l.bottom)} /><rect x={72} y={150} width={11} height={40} fill={l.bottom} /><rect x={117} y={150} width={11} height={40} fill={l.bottom} /><circle cx={78} cy={190} r={4.5} fill="#fff" /><circle cx={122} cy={190} r={4.5} fill="#fff" /><rect x={86} y={198} width={28} height={18} rx={4} fill={dk(l.bottom, 0.12)} /></>}
        {l.extra === 'jacket' && <><path d="M86 150 H114 L108 236 H92Z" fill="#ffffff" /><path d="M86 150 L96 176 L92 236 M114 150 L104 176 L108 236" stroke={dk(l.top)} strokeWidth={3} fill="none" /></>}
        {l.extra === 'hood' && <><path d="M70 148 Q100 176 130 148 Q100 162 70 148Z" fill={l.topD} /><path d="M90 160 V186 M110 160 V186" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" /><circle cx={90} cy={188} r={3} fill="#fff" /><circle cx={110} cy={188} r={3} fill="#fff" /><path d="M72 202 H128 L122 220 H78Z" fill={l.topD} /></>}
        {l.extra === 'collar' && !l.long && <path d="M80 148 L100 166 L120 148Z" fill="#ffffff" />}
        {l.extra === 'backpack' && <><rect x={62} y={150} width={10} height={62} rx={5} fill="#e23d3d" /><rect x={128} y={150} width={10} height={62} rx={5} fill="#e23d3d" /><rect x={60} y={186} width={14} height={8} rx={3} fill="#b52a2a" /><rect x={126} y={186} width={14} height={8} rx={3} fill="#b52a2a" /></>}
        <Arms pose={P} sleeve={l.sleeve} skin={l.skin} sx={42 + bw} sy={166} which="back" thumbUp />
        {/* neck + head */}
        <rect x={88} y={134} width={24} height={24} fill={l.shade} />
        {!hijab && l.hair !== 'bob' && <>{[46, 154].map((x) => <g key={x}><circle cx={x} cy={98} r={12} fill={l.skin} {...rim(l.skin)} /><circle cx={x} cy={98} r={5} fill={l.shade} /></g>)}</>}
        {hijab
          ? <path d="M100 40 C134 40 146 66 146 96 C146 128 126 150 100 150 C74 150 54 128 54 96 C54 66 66 40 100 40Z" fill={l.skin} />
          : <rect x={46} y={30} width={108} height={120} rx={44} fill={l.skin} stroke={dk(l.skin, 0.12)} strokeWidth={3} />}
        {hijab && <path d="M48 104 C46 176 154 176 152 104 L158 168 Q100 196 42 168Z" fill={l.hairC} {...rim(l.hairC)} />}
        <ellipse cx={68} cy={118} rx={11} ry={6.5} fill="#ff7f8f" opacity={0.32} />
        <ellipse cx={132} cy={118} rx={11} ry={6.5} fill="#ff7f8f" opacity={0.32} />
        <path d="M100 100 q7 8 0 14" stroke={l.shade} strokeWidth={5} strokeLinecap="round" fill="none" />
        <g className="face">
          {eyesEl(f.eyes, 100, 92)}
          {l.glasses && <g stroke={l.glasses} strokeWidth={4.5} fill="none"><circle cx={79} cy={92} r={17} /><circle cx={121} cy={92} r={17} /><path d="M96 90 Q100 86 104 90" /><path d="M62 90 L50 86 M138 90 L150 86" /></g>}
          {browsEl(f.brows, 100, l.glasses ? 66 : 72, hijab ? '#4a2f22' : l.hair === 'bob' || l.hair === 'bun' ? '#8d8f98' : l.hairC === '#ffcf3a' ? '#c98f1d' : l.hairC)}
          {mouthEl(mouth as Mouth, 100, 124)}
        </g>
        <HairFront l={l} />
        <PropEl prop={prop === 'pencil' ? 'none' : prop} />
        <Arms pose={P} sleeve={l.sleeve} skin={l.skin} sx={42 + bw} sy={166} which="front" />
        {prop === 'pencil' && <g transform={`translate(${100 + 42 + bw - 16} ${166 - 24}) rotate(-30)`}><rect x={-4} y={-30} width={8} height={30} rx={2} fill="#ffc800" /><path d="M-4 -30 L0 -40 L4 -30Z" fill="#f5d0a0" /><rect x={-4} y={-2} width={8} height={6} rx={2} fill="#ff86a8" /></g>}
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
