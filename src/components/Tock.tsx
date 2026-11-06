import type { Mood as OldMood } from '../lib/types';
import { MOODS, eyesEl, browsEl, mouthEl, extrasEl, useTalking, armPath, TrophyProp, type Mood, type Mouth } from './Buddy';

/* Tock, the hourglass explorer, in the same flat style as the crew:
   amber-sand hourglass, wooden caps, explorer helmet, satchel. */
const OLD: Record<OldMood, Mood> = { idle: 'neutral', cheer: 'cheer', sad: 'sad', think: 'think', fire: 'fire', sleepy: 'sleepy', trophy: 'trophy' };

const WOOD = '#a5652f', WOODD = '#874f21', HAT = '#ead7a4', HATD = '#d2b979', BAND = '#7c4a22';
const GLASS = '#b9e3fa', GLASSD = '#93d2f5', SAND = '#ffbf2e', SANDD = '#f5a300', GLOVE = '#fff3dd';

export function Tock({ mood = 'idle', size, className = '', talking }: { mood?: OldMood | Mood; size?: number; className?: string; talking?: boolean }) {
  const m: Mood = (OLD as Record<string, Mood>)[mood] || (mood as Mood);
  const f = MOODS[m] || MOODS.neutral;
  const talk = useTalking('tock', talking);
  const mouth = (talk || f.mouth) as Mouth;
  const pose = f.pose === 'down' && talk ? 'wave' : f.pose;
  const arm = (side: -1 | 1, front: boolean) => {
    const a = armPath(pose, side, side === -1 ? 56 : 144, 186);
    if (!!a.front !== front) return null;
    return <g key={side} className={pose === 'wave' && side === 1 ? 'arm-wave' : undefined} style={{ transformOrigin: `${side === -1 ? 56 : 144}px 186px` }}>
      <path d={a.d} stroke={WOODD} strokeWidth={13} strokeLinecap="round" fill="none" /><circle cx={a.hx} cy={a.hy} r={10} fill={GLOVE} /></g>;
  };
  return (
    <span className={`tock-wrap ${className}`} style={size ? { width: size } : undefined}>
      <svg className={`buddy anim-${f.anim}`} viewBox="-20 -40 240 340" style={{ ['--lid' as string]: GLASS }} role="img" aria-label="Tock">
        <ellipse cx={100} cy={290} rx={56} ry={7} fill="rgba(30,30,60,.09)" />
        <g className="body">
          {[-1, 1].map((s) => arm(s as -1 | 1, false))}
          {/* feet */}
          <rect x={60} y={270} width={34} height={16} rx={8} fill={WOODD} /><rect x={106} y={270} width={34} height={16} rx={8} fill={WOODD} />
          {/* bottom bulb with sand */}
          <path d="M88 160 H112 Q160 196 156 256 H44 Q40 196 88 160Z" fill={GLASS} />
          <path d="M52 256 Q58 214 100 206 Q142 214 148 256Z" fill={SAND} />
          <path d="M70 256 Q78 230 100 224 Q96 240 92 256Z" fill={SANDD} opacity={0.5} />
          <rect x={98} y={160} width={4} height={50} fill={SAND} />
          <path d="M60 196 Q56 222 60 244" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8} fill="none" />
          {/* satchel */}
          <path d="M58 180 L146 246" stroke={BAND} strokeWidth={9} strokeLinecap="round" />
          <rect x={128} y={232} width={38} height={30} rx={8} fill="#c27a3a" /><rect x={128} y={232} width={38} height={12} rx={6} fill="#a8612a" /><circle cx={147} cy={246} r={3.5} fill={SAND} />
          {/* caps */}
          <rect x={34} y={252} width={132} height={20} rx={10} fill={WOOD} />
          <rect x={34} y={48} width={132} height={20} rx={10} fill={WOOD} />
          {/* top bulb = head */}
          <path d="M44 66 H156 Q162 128 112 160 H88 Q38 128 44 66Z" fill={GLASS} />
          <path d="M84 150 Q100 146 116 150 L112 160 H88Z" fill={SAND} />
          <path d="M56 80 Q52 104 60 124" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.85} fill="none" />
          <path d="M156 72 Q160 120 120 156" stroke={GLASSD} strokeWidth={6} strokeLinecap="round" fill="none" />
          <ellipse cx={70} cy={116} rx={10} ry={6} fill="#ff8f8f" opacity={0.4} />
          <ellipse cx={130} cy={116} rx={10} ry={6} fill="#ff8f8f" opacity={0.4} />
          {eyesEl(f.eyes, 100, 96, 22)}
          {browsEl(f.brows, 100, 76, '#6b4a2b', 22)}
          {mouthEl(mouth, 100, 118)}
          {/* helmet */}
          <ellipse cx={100} cy={46} rx={72} ry={11} fill={HATD} />
          <path d="M50 44 C50 4 150 4 150 44Z" fill={HAT} />
          <rect x={50} y={30} width={100} height={10} fill={BAND} />
          <path d="M70 18 Q86 8 104 8" stroke="#fff6d6" strokeWidth={5} strokeLinecap="round" fill="none" />
          {[-1, 1].map((s) => arm(s as -1 | 1, true))}
          {f.extras.includes('trophy') && <TrophyProp x={100} y={78} />}
          {extrasEl(f.extras.filter((x) => x !== 'trophy'), 100, 34)}
        </g>
      </svg>
    </span>
  );
}
