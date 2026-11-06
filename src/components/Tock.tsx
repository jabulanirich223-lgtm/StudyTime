import type { Mood as OldMood } from '../lib/types';
import { MOODS, eyesEl, browsEl, mouthEl, extrasEl, useTalking, armPath, TrophyProp, type Mood, type Mouth } from './Buddy';

/* Tock, the hourglass explorer, matched 1:1 to the character sheet:
   tan pith helmet with seams + top button, dark-brown brim and caps, pale glass,
   amber sand in both bulbs, black button eyes, chunky mitten arms, boots, satchel on the right hip.
   Drawn in SVG so every expression and pose works and animates. */
const OLD: Record<OldMood, Mood> = { idle: 'wave', cheer: 'cheer', sad: 'sad', think: 'think', fire: 'fire', sleepy: 'sleepy', trophy: 'trophy' };

const HAT = '#b5834f', HATD = '#8f6236', HATL = '#cfa06c';
const CAP = '#6e4322', CAPL = '#8a5630';
const GLASS = '#e4f6f7', RIM = '#9fd3d8', SHINE = '#ffffff';
const SAND = '#f8b532', SANDL = '#fcd066', SANDD = '#e99b14';
const ARM = '#a9773f', ARMD = '#87592b';
const BAG = '#9c6234', BAGD = '#7b4a25';
const EYE = '#24160c';

const TOP = 'M46 52 H154 Q162 116 110 156 H90 Q38 116 46 52Z';
const BOT = 'M90 160 H110 Q162 196 154 250 H46 Q38 196 90 160Z';

function TockEyes({ kind }: { kind: string }) {
  if (kind === 'open' || kind === 'up' || kind === 'wide' || kind === 'sad') {
    const dy = kind === 'up' ? -4 : kind === 'sad' ? 2 : 0;
    const big = kind === 'wide' ? 1.25 : 1;
    const e = (x: number) => (
      <g key={x}>
        <ellipse cx={x} cy={88 + dy} rx={9 * big} ry={11 * big} fill={EYE} />
        <circle cx={x + 3} cy={84 + dy} r={3.4} fill="#fff" /><circle cx={x - 2.5} cy={92 + dy} r={1.6} fill="#fff" opacity={0.8} />
      </g>
    );
    return <g className="eyes blink">{e(78)}{e(122)}{kind === 'sad' && <><path d="M64 80 L90 71" stroke={EYE} strokeWidth={5} strokeLinecap="round" /><path d="M136 80 L110 71" stroke={EYE} strokeWidth={5} strokeLinecap="round" /></>}</g>;
  }
  return eyesEl(kind as never, 100, 88, 22);
}

export function Tock({ mood = 'idle', size, className = '', talking }: { mood?: OldMood | Mood; size?: number; className?: string; talking?: boolean }) {
  const m: Mood = (OLD as Record<string, Mood>)[mood] || (mood as Mood);
  const f = MOODS[m] || MOODS.neutral;
  const talk = useTalking('tock', talking);
  const mouth = (talk || f.mouth) as Mouth;
  const pose = f.pose === 'down' && talk ? 'wave' : f.pose;
  const sleepy = f.extras.includes('zzz');
  const fire = f.extras.includes('flame');
  const arm = (side: -1 | 1, front: boolean) => {
    const sx = side === -1 ? 50 : 150, sy = 170;
    const a = armPath(pose, side, sx, sy);
    if (!!a.front !== front) return null;
    return (
      <g key={side} className={pose === 'wave' && side === 1 ? 'arm-wave' : undefined} style={{ transformOrigin: `${sx}px ${sy}px` }}>
        <path d={a.d} stroke={ARMD} strokeWidth={27} strokeLinecap="round" fill="none" />
        <path d={a.d} stroke={ARM} strokeWidth={21} strokeLinecap="round" fill="none" />
        <circle cx={a.hx} cy={a.hy} r={16} fill={ARMD} /><circle cx={a.hx} cy={a.hy} r={13} fill={ARM} />
        <circle cx={a.hx + side * 9} cy={a.hy - 8} r={6} fill={ARM} stroke={ARMD} strokeWidth={3} />
      </g>
    );
  };
  return (
    <span className={`tock-wrap ${className}`} style={size ? { width: size } : undefined}>
      <svg className={`buddy anim-${f.anim}`} viewBox="-20 -40 240 340" style={{ ['--lid' as string]: GLASS }} role="img" aria-label="Tock">
        <defs>
          <clipPath id="tock-top"><path d={TOP} /></clipPath>
          <clipPath id="tock-bot"><path d={BOT} /></clipPath>
        </defs>
        <ellipse cx={100} cy={290} rx={58} ry={7} fill="rgba(30,30,60,.1)" />
        <g className="body">
          {fire && (
            <g className="fx-flicker">
              <path d="M100 280 C40 280 4 236 8 170 C12 120 36 96 30 50 C56 74 62 96 64 110 C66 60 84 20 100 -34 C116 20 134 60 136 110 C138 96 144 74 170 50 C164 96 188 120 192 170 C196 236 160 280 100 280Z" fill="#2f7bf0" />
              <path d="M100 270 C54 270 26 234 30 180 C33 140 52 120 50 90 C66 108 72 124 74 136 C78 96 88 62 100 24 C112 62 122 96 126 136 C128 124 134 108 150 90 C148 120 167 140 170 180 C174 234 146 270 100 270Z" fill="#62a8ff" />
              <path d="M100 258 C66 258 50 230 52 196 C54 168 66 150 70 136 C80 150 84 160 86 168 C88 140 94 116 100 92 C106 116 112 140 114 168 C116 160 120 150 130 136 C134 150 146 168 148 196 C150 230 134 258 100 258Z" fill="#c4e1ff" />
            </g>
          )}
          {[-1, 1].map((s) => arm(s as -1 | 1, false))}
          {/* boots */}
          <rect x={60} y={258} width={34} height={24} rx={11} fill={ARMD} /><rect x={62} y={258} width={30} height={20} rx={10} fill={ARM} />
          <rect x={106} y={258} width={34} height={24} rx={11} fill={ARMD} /><rect x={108} y={258} width={30} height={20} rx={10} fill={ARM} />
          {/* bottom bulb */}
          <path d={BOT} fill={GLASS} />
          <g clipPath="url(#tock-bot)">
            <path d="M30 252 V214 Q100 196 170 214 V252Z" fill={SAND} />
            <path d="M30 214 Q100 196 170 214 Q100 206 30 222Z" fill={SANDL} />
            <path d="M40 252 Q100 236 160 252Z" fill={SANDD} opacity={0.5} />
            <path d="M74 226 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z M126 234 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6z" fill="#fff6c8" />
          </g>
          <path d={BOT} fill="none" stroke={RIM} strokeWidth={4} />
          <path d="M58 208 Q54 228 60 244" stroke={SHINE} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.9} />
          <rect x={97} y={150} width={6} height={60} rx={3} fill={SAND} />
          {/* satchel */}
          <path d="M60 166 L150 236" stroke={BAGD} strokeWidth={11} strokeLinecap="round" />
          <path d="M60 166 L150 236" stroke={BAG} strokeWidth={6} strokeLinecap="round" />
          <rect x={128} y={216} width={52} height={42} rx={10} fill={BAGD} /><rect x={131} y={219} width={46} height={36} rx={8} fill={BAG} />
          <path d="M131 227 Q154 220 177 227 V238 Q154 246 131 238Z" fill={BAGD} /><circle cx={154} cy={240} r={4} fill={SANDL} />
          {/* bottom cap */}
          <rect x={34} y={246} width={132} height={20} rx={9} fill={CAP} /><rect x={40} y={248} width={120} height={5} rx={2.5} fill={CAPL} />
          {/* top bulb (the head) */}
          <path d={TOP} fill={GLASS} />
          <g clipPath="url(#tock-top)">
            <path d="M30 100 Q100 92 170 100 V170 H30Z" fill={SAND} />
            <path d="M30 100 Q100 92 170 100 Q100 104 30 108Z" fill={SANDL} />
            <path d="M60 150 Q100 138 140 150 L120 170 H80Z" fill={SANDD} opacity={0.45} />
            <path d="M58 116 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z M140 124 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6z" fill="#fff6c8" />
          </g>
          <path d={TOP} fill="none" stroke={RIM} strokeWidth={4} />
          <path d="M58 64 Q54 84 58 98" stroke={SHINE} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.95} />
          <ellipse cx={64} cy={110} rx={9} ry={5.5} fill="#ff8a6a" opacity={0.45} />
          <ellipse cx={136} cy={110} rx={9} ry={5.5} fill="#ff8a6a" opacity={0.45} />
          <TockEyes kind={f.eyes} />
          {f.eyes !== 'open' && f.eyes !== 'up' && f.eyes !== 'sad' && f.eyes !== 'wide' && browsEl(f.brows, 100, 70, EYE, 22)}
          {(f.brows === 'angry' || f.brows === 'one') && (f.eyes === 'open' || f.eyes === 'up') && browsEl(f.brows, 100, 70, EYE, 22)}
          {mouthEl(mouth, 100, 110)}
          {/* hat or nightcap */}
          {sleepy ? (
            <g>
              <path d="M44 48 C46 4 90 -16 150 -6 C176 0 186 20 178 40 C160 20 140 18 130 24 L156 48Z" fill="#9aa3b2" />
              <path d="M70 10 L150 0 M60 26 L156 18 M52 40 L154 36" stroke="#e6e9ef" strokeWidth={8} strokeLinecap="round" />
              <circle cx={180} cy={44} r={12} fill="#e6e9ef" />
              <rect x={38} y={40} width={124} height={16} rx={8} fill="#e6e9ef" />
            </g>
          ) : (
            <g>
              <path d="M50 44 C50 -10 150 -10 150 44Z" fill={HAT} />
              <path d="M100 -6 C82 4 76 24 76 44 M100 -6 C118 4 124 24 124 44" stroke={HATD} strokeWidth={4} fill="none" />
              <path d="M62 30 Q70 6 92 0" stroke={HATL} strokeWidth={6} strokeLinecap="round" fill="none" />
              <circle cx={100} cy={-6} r={6} fill={HATD} />
              <rect x={54} y={30} width={92} height={10} fill={HATD} />
              <rect x={30} y={38} width={140} height={18} rx={9} fill={CAP} /><rect x={38} y={40} width={124} height={5} rx={2.5} fill={CAPL} />
            </g>
          )}
          {[-1, 1].map((s) => arm(s as -1 | 1, true))}
          {f.extras.includes('trophy') && <TrophyProp x={100} y={70} />}
          {extrasEl(f.extras.filter((x) => x !== 'trophy' && x !== 'flame'), 100, 34)}
        </g>
      </svg>
    </span>
  );
}
