import type { Mood } from '../lib/types';

/**
 * Tock, the hourglass explorer. Drawn as one SVG so it stays sharp at any size.
 * Design follows the character sheet: glass hourglass with amber sand, wood caps,
 * brown pith helmet, stubby brown arms and feet, leather satchel on a cross strap.
 */
const O = '#4a2e14';
const WOOD = '#9a5b27', WOODL = '#b97536', WOODD = '#7a4519';
const HAT = '#a87a4d', HATD = '#8a5f37', HATL = '#c29766';
const ARM = '#8b5a2b';
const SAND = '#fbbf24', SANDD = '#f59e0b';
const GLASS = '#eaf7fb', GLASSD = '#cdeaf3';

const sw = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function face(m: Mood) {
  const eye = (x: number, y: number, dy = 0) =>
    `<ellipse cx="${x}" cy="${y + dy}" rx="3.8" ry="4.6" fill="#1f160d"/><circle cx="${x + 1.3}" cy="${y + dy - 1.6}" r="1.4" fill="#fff"/>`;
  const cheeks = `<ellipse cx="44" cy="66" rx="4" ry="2.4" fill="#ff9aa2" opacity=".75"/><ellipse cx="76" cy="66" rx="4" ry="2.4" fill="#ff9aa2" opacity=".75"/>`;
  const line = (d: string, w = 2.8) => `<path d="${d}" stroke="#1f160d" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  switch (m) {
    case 'cheer':
      return cheeks + line('M45 61q5-6 10 0M65 61q5-6 10 0', 3) + `<path d="M52 66h16q-1 9-8 9t-8-9z" fill="#7a2b2b"/><path d="M55 72q5-3 10 0q-2 3-5 3t-5-3z" fill="#ff8a8a"/>`;
    case 'sad':
      return cheeks + eye(50, 61, 1) + eye(70, 61, 1) + line('M44 53l9 3M76 53l-9 3') + line('M54 72q6-5 12 0') + `<path d="M79 52q4 6 0 9q-4-3 0-9z" fill="#60c5f1"/>`;
    case 'think':
      return cheeks + `<ellipse cx="51" cy="59" rx="3.8" ry="4.6" fill="#1f160d"/><ellipse cx="71" cy="59" rx="3.8" ry="4.6" fill="#1f160d"/><circle cx="52.5" cy="56.5" r="1.4" fill="#fff"/><circle cx="72.5" cy="56.5" r="1.4" fill="#fff"/>` + line('M45 52q5-3 10 0') + line('M56 70q3-2 6 0t5-1');
    case 'fire':
      return cheeks + eye(50, 62) + eye(70, 62) + line('M43 53l11 5M77 53l-11 5', 3.2) + `<path d="M51 67h18q-1.5 8-9 8t-9-8z" fill="#7a2b2b"/><path d="M52 67h16v3H52z" fill="#fff"/>`;
    case 'sleepy':
      return cheeks + line('M45 61q5 4 10 0M65 61q5 4 10 0') + `<ellipse cx="60" cy="71" rx="2.6" ry="3" fill="#7a2b2b"/>`;
    case 'trophy':
      return cheeks + line('M45 61q5-6 10 0M65 61q5-6 10 0', 3) + `<path d="M51 66h18q-1.5 8-9 8t-9-8z" fill="#7a2b2b"/><path d="M52 66h16v3H52z" fill="#fff"/>`;
    default:
      return cheeks + eye(50, 60) + eye(70, 60) + line('M54 69q6 5 12 0');
  }
}

function arms(m: Mood) {
  const arm = (d: string) => `<path d="${d}" stroke="${O}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${ARM}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
  const L_DOWN = 'M36 98q-10 6-11 18', R_DOWN = 'M84 98q10 6 11 18';
  const L_UP = 'M36 96q-12-8-13-26', R_UP = 'M84 96q12-8 13-26';
  switch (m) {
    case 'idle': return arm(L_DOWN) + arm('M84 96q14-6 15-26') + `<path d="M106 62q4 4 3 9M110 56q6 6 4 15" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'cheer': case 'fire': case 'trophy': return arm(L_UP) + arm(R_UP);
    case 'think': return arm(L_DOWN) + arm('M84 98q4-12-12-20');
    default: return arm(L_DOWN) + arm(R_DOWN);
  }
}

function hat(m: Mood) {
  if (m === 'sleepy')
    return `<path d="M30 42q4-30 40-32q18 0 30 14q-14-4-22 0q-30 6-48 18z" fill="#d1d5db" ${sw}/>
      <path d="M44 22q14-8 30-8M37 32q20-12 44-12" stroke="#9ca3af" stroke-width="5" fill="none"/>
      <circle cx="101" cy="24" r="7" fill="#f3f4f6" ${sw}/>
      <path d="M27 42q33-10 66 0" stroke="${O}" stroke-width="3" fill="#e5e7eb"/>`;
  return `<ellipse cx="60" cy="40" rx="42" ry="7.5" fill="${HATD}" ${sw}/>
    <path d="M31 38C31 14 44 5 60 5S89 14 89 38z" fill="${HAT}" ${sw}/>
    <path d="M62 6C78 8 87 20 88 37H72C72 22 68 12 62 6z" fill="${HATD}" opacity=".55"/>
    <path d="M40 18C44 11 50 8 56 8" stroke="${HATL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M31.5 30h57v8h-57z" fill="${WOODD}"/>
    <path d="M31 38C31 14 44 5 60 5S89 14 89 38" fill="none" ${sw}/>`;
}

function extras(m: Mood) {
  const star = (x: number, y: number, r: number) =>
    `<path d="M${x} ${y - r}l${r * 0.28} ${r * 0.72} ${r * 0.72} ${r * 0.28}-${r * 0.72} ${r * 0.28}-${r * 0.28} ${r * 0.72}-${r * 0.28}-${r * 0.72}-${r * 0.72}-${r * 0.28} ${r * 0.72}-${r * 0.28}z" fill="#facc15" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/>`;
  switch (m) {
    case 'cheer': return star(12, 50, 9) + star(108, 44, 8) + star(100, 18, 5) + star(18, 22, 4);
    case 'think': return `<g transform="translate(96 4)"><circle cx="10" cy="10" r="9" fill="#fde047" ${sw}/><rect x="6" y="18" width="8" height="6" rx="1.5" fill="#9ca3af" ${sw}/><path d="M10 -4v-4M-3 3l-4-3M23 3l4-3M-5 13h-4M25 13h4" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/></g>`;
    case 'sleepy': return ['z', 86, 14, 13, 'z', 95, 4, 17, 'Z', 104, -10, 22].reduce((a, _, i, arr) => (i % 4 ? a : a + `<text x="${arr[i + 1]}" y="${arr[i + 2]}" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${arr[i + 3]}" fill="#3b82f6">${arr[i]}</text>`), '');
    case 'trophy': return `<g transform="translate(86 34)"><path d="M0 0h22v8a11 11 0 0 1-22 0z" fill="#facc15" ${sw}/><path d="M0 3h-5a5 5 0 0 0 5 8M22 3h5a5 5 0 0 1-5 8" fill="none" stroke="${O}" stroke-width="2.5"/><rect x="8.5" y="18" width="5" height="7" fill="#eab308" ${sw}/><rect x="3" y="24" width="16" height="6" rx="2" fill="#ca8a04" ${sw}/></g>` + star(14, 48, 8);
    default: return '';
  }
}

export function tockSVG(m: Mood = 'idle') {
  const flame = m === 'fire'
    ? `<path d="M18 128q-16-34 4-60q-2 18 10 22q-4-30 18-50q-2 22 12 28q4-26 24-36q-6 26 6 40q10-8 8-22q22 30 4 78z" fill="#3b82f6"/><path d="M30 126q-10-24 4-40q0 12 8 14q0-20 14-32q0 16 10 20q4-16 16-22q-4 18 4 28q8-4 6-14q12 22 0 46z" fill="#93c5fd"/>`
    : '';
  const badge = m === 'fire' ? `<g transform="translate(86 6) rotate(12)"><text x="0" y="0" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="20" fill="#1d4ed8" stroke="#fff" stroke-width="4" paint-order="stroke">5x</text></g>` : '';
  return `<svg class="tock" viewBox="-6 -24 132 186" role="img" aria-label="Tock the hourglass, ${m}">
  ${flame}
  <ellipse cx="60" cy="155" rx="34" ry="4.5" fill="rgba(0,0,0,.1)"/>
  <rect x="38" y="138" width="16" height="14" rx="6" fill="${ARM}" ${sw}/><rect x="66" y="138" width="16" height="14" rx="6" fill="${ARM}" ${sw}/>
  <path d="M31 50H89C89 74 66 82 64 90C66 98 91 106 91 126H29C29 106 54 98 56 90C54 82 31 74 31 50Z" fill="${GLASS}" ${sw}/>
  <path d="M37 69Q60 84 83 69C80 77 66 82 63 88H57C54 82 40 77 37 69Z" fill="${SAND}"/>
  <path d="M60 89v20" stroke="${SAND}" stroke-width="2.6" stroke-dasharray="2.5 3" stroke-linecap="round"/>
  <path d="M33 125Q60 96 87 125Z" fill="${SANDD}"/><path d="M60 104Q76 110 87 125H60z" fill="#d97706" opacity=".5"/>
  <path d="M86 56Q84 70 70 78M88 108Q80 102 72 100" stroke="${GLASSD}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M37 56q0 8 6 13" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  ${face(m)}
  <path d="M44 92L84 112" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M44 92L84 112" stroke="#6b3f17" stroke-width="4" stroke-linecap="round"/>
  <rect x="22" y="124" width="76" height="16" rx="7" fill="${WOOD}" ${sw}/><rect x="24" y="126" width="72" height="4" rx="2" fill="${WOODL}"/>
  <rect x="24" y="40" width="72" height="13" rx="6.5" fill="${WOOD}" ${sw}/><rect x="26" y="42" width="68" height="4" rx="2" fill="${WOODL}"/>
  ${hat(m)}
  <g transform="translate(76 104)"><rect x="0" y="0" width="24" height="20" rx="5" fill="#a0612b" ${sw}/><path d="M0 6a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v5H0z" fill="#7a4519" ${sw}/><rect x="10" y="9" width="4" height="4" rx="1" fill="#facc15"/></g>
  ${arms(m)}
  ${extras(m)}${badge}
  </svg>`;
}

/* Tock's look comes from the Gemini character sheet; each mood is a cut-out PNG in src/assets/tock. */
const TOCK_IMG = import.meta.glob('../assets/tock/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const tockUrl = (m: Mood) => TOCK_IMG[`../assets/tock/${m}.png`] || TOCK_IMG['../assets/tock/idle.png'];

export function Tock({ mood = 'idle', size, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const url = tockUrl(mood);
  if (!url) return <span className={`tock-wrap ${className}`} style={size ? { width: size } : undefined} dangerouslySetInnerHTML={{ __html: tockSVG(mood) }} />;
  return <span className={`tock-wrap ${className}`} style={size ? { width: size } : undefined}><img src={url} alt={`Tock, ${mood}`} draggable={false} /></span>;
}
