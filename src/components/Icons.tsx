/* Flat two-tone vector icons for navigation and stats (crisp at small sizes).
   Illustrated unit icons are PNGs made in ComfyUI, loaded by unitIcon(). */

const F = (vb: number, p: string) => `<svg viewBox="0 0 ${vb} ${vb}" aria-hidden="true">${p}</svg>`;

export const SVG = {
  fire: F(24, '<path d="M12 1.5c1.2 4.3 6.5 6 6.5 12.2a6.5 6.5 0 0 1-13 0c0-3.6 1.8-5.5 3-7.2.3 2.4 1.4 3.6 2.9 4.2C10.6 7.4 10.6 4.6 12 1.5z" fill="#f97316"/><path d="M12 11c.8 2 3.4 2.8 3.4 5.6a3.4 3.4 0 0 1-6.8 0c0-1.6 1-2.6 1.6-3.4.2 1 .8 1.6 1.4 1.8-.3-1.6-.3-2.6.4-4z" fill="#facc15"/>'),
  fireGrey: F(24, '<path d="M12 1.5c1.2 4.3 6.5 6 6.5 12.2a6.5 6.5 0 0 1-13 0c0-3.6 1.8-5.5 3-7.2.3 2.4 1.4 3.6 2.9 4.2C10.6 7.4 10.6 4.6 12 1.5z" fill="#d1d5db"/>'),
  gem: F(24, '<path d="M6.5 3h11L22 9 12 21.5 2 9z" fill="#0ea5e9"/><path d="M2 9h20L12 21.5z" fill="#0284c7"/><path d="M6.5 3 9 9h6l2.5-6z" fill="#7dd3fc"/><path d="M9 9h6l-3 12.5z" fill="#38bdf8"/>'),
  heart: F(24, '<path d="M12 21s-9-5.6-9-11.6A5 5 0 0 1 12 6.6a5 5 0 0 1 9 2.8C21 15.4 12 21 12 21z" fill="#ef4444"/><path d="M7.6 7a3 3 0 0 0-2.7 3.3" stroke="#fecaca" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  bolt: F(24, '<path d="M13.5 2 4 14h7l-1 8 10-12.5h-7z" fill="#facc15"/><path d="M13 9.5h7L10 22l1-8z" fill="#eab308"/>'),
  freeze: F(24, '<rect x="3" y="3" width="18" height="18" rx="5" fill="#7dd3fc"/><rect x="3" y="12" width="18" height="9" rx="5" fill="#38bdf8"/><path d="M12 6.5v11M7.2 9.2l9.6 5.6M16.8 9.2l-9.6 5.6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'),
  medal: F(24, '<path d="M7 2h4l2 5H9zM13 2h4l-2 5h-4z" fill="#ef4444"/><circle cx="12" cy="15" r="7" fill="#facc15"/><circle cx="12" cy="15" r="4.5" fill="#eab308"/><path d="m12 12 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#fff"/>'),
  crown: F(24, '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#facc15"/><path d="M5 19h14v2H5z" fill="#eab308"/>'),
  check: F(24, '<circle cx="12" cy="12" r="11" fill="#fff"/><path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  xmark: F(24, '<circle cx="12" cy="12" r="11" fill="#fff"/><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>'),
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-5v16l-5-5H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-5v16l-5-5H3z" fill="currentColor"/><path d="m16 9 6 6m0-6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2.5 2.5 0 0 1 2.5-2.5H20v15H6.5A2.5 2.5 0 0 0 4 20z" fill="currentColor"/><path d="M6.5 19.5H20V22H6.5A2.5 2.5 0 0 1 4 20.5z" fill="currentColor" opacity=".6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="currentColor"/></svg>',
  scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h11a2 2 0 0 1 0 4h-1v10a3 3 0 0 1-3 3H6a3 3 0 0 1 0-6h1zM10.5 9h4M10.5 13h4"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v2h3.5v3A4.5 4.5 0 0 1 16 12.5h-.3A5 5 0 0 1 13 15v3h3.5v3h-9v-3H11v-3a5 5 0 0 1-2.7-2.5H8A4.5 4.5 0 0 1 3.5 8V5H7zm0 4H5.5v1A2.5 2.5 0 0 0 7 10.3zm10 0v3.3A2.5 2.5 0 0 0 18.5 8V7z" fill="currentColor"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h13v14H3z" fill="currentColor"/><path d="M7 3h14v14h-3V5H7z" fill="currentColor" opacity=".6"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3v17H4V4h3zm-1 7v10h12V9z" fill="currentColor"/><path d="M8 11h3v3H8z" fill="currentColor"/></svg>',
};

export const NAV_ICON: Record<string, string> = {
  learn: F(32, '<path d="M3 7l8-3 10 3 8-3v21l-8 3-10-3-8 3z" fill="#fcd34d"/><path d="M11 4v21l10 3V7z" fill="#fbbf24"/><path d="M16 8.5c-2.5 0-4.5 2-4.5 4.4 0 3.4 4.5 8.1 4.5 8.1s4.5-4.7 4.5-8.1c0-2.4-2-4.4-4.5-4.4z" fill="#ef4444"/><circle cx="16" cy="12.9" r="1.8" fill="#fff"/>'),
  ap: F(32, '<path d="M7 15.5v6c0 2.2 4 4 9 4s9-1.8 9-4v-6l-9 4.4z" fill="#312e81"/><path d="M16 5 1.5 12 16 19l14.5-7z" fill="#4f46e5"/><path d="M16 5 1.5 12 16 12.6z" fill="#818cf8"/><path d="M27 13v8" stroke="#facc15" stroke-width="2.2" stroke-linecap="round"/><circle cx="27" cy="22.5" r="2.2" fill="#facc15"/>'),
  cram: F(32, '<path d="M18 2 5 18h9l-2 12 15-17h-9z" fill="#facc15"/><path d="M17.5 13H27L12 30l2-12z" fill="#eab308"/>'),
  league: F(32, '<path d="M9 6H5a5 5 0 0 0 5 7M23 6h4a5 5 0 0 1-5 7" stroke="#eab308" stroke-width="2.6" fill="none"/><path d="M9 3.5h14v8a7 7 0 0 1-14 0z" fill="#facc15"/><path d="M16 3.5h7v8a7 7 0 0 1-7 7z" fill="#eab308"/><rect x="14" y="18" width="4" height="5" fill="#ca8a04"/><rect x="9" y="23" width="14" height="5.5" rx="2.2" fill="#a16207"/>'),
  shop: F(32, '<path d="M11 13V9a5 5 0 0 1 10 0v4" stroke="#c2410c" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M5 11h22l-2 18H7z" fill="#fb923c"/><path d="M16 11h11l-2 18h-9z" fill="#f97316"/><path d="M16 15.5l4.5 4.5-4.5 5.5-4.5-5.5z" fill="#0ea5e9"/><path d="M16 15.5l4.5 4.5H11.5z" fill="#7dd3fc"/>'),
  review: F(32, '<circle cx="16" cy="16" r="14" fill="#a855f7"/><path d="M21.8 12.2A7 7 0 1 0 23 17" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M23.5 7.5v5h-5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  profile: F(32, '<circle cx="16" cy="16" r="14" fill="#e0e7ff"/><path d="M7.5 26.5a8.5 8.5 0 0 1 17 0A14 14 0 0 1 7.5 26.5z" fill="#4f46e5"/><circle cx="16" cy="13" r="5.2" fill="#fdba74"/><path d="M10.8 12.5a5.2 5.2 0 0 1 10.4 0c-2-1-4.5-1.6-10.4 0z" fill="#78350f"/>'),
};

const unitIcons = import.meta.glob('../assets/icons/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const flatIcons = import.meta.glob('../assets/flaticons/*.svg', { eager: true, import: 'default' }) as Record<string, string>;
/** Flat vector icon if there is one, otherwise the older painted PNG. */
export const iconUrl = (name: string) => flatIcons[`../assets/flaticons/${name}.svg`] || unitIcons[`../assets/icons/${name}.png`];

export function Svg({ html, className = '', size }: { html: string; className?: string; size?: number }) {
  return <span className={`svg ${className}`} style={size ? { width: size, height: size } : undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* Simple rounded flags for language tracks (drawn, not images). */
const FLAG: Record<string, string> = {
  es: '<rect width="60" height="44" rx="9" fill="#e53935"/><rect y="11" width="60" height="22" fill="#fbc02d"/>',
  fr: '<rect width="60" height="44" rx="9" fill="#e53935"/><rect width="40" height="44" fill="#fff"/><path d="M9 0h11v44H9a9 9 0 0 1-9-9V9a9 9 0 0 1 9-9z" fill="#1e5bbf"/>',
  de: '<rect width="60" height="44" rx="9" fill="#fbc02d"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v20H0z" fill="#e53935"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v6H0z" fill="#333"/>',
  it: '<rect width="60" height="44" rx="9" fill="#e53935"/><rect width="40" height="44" fill="#fff"/><path d="M9 0h11v44H9a9 9 0 0 1-9-9V9a9 9 0 0 1 9-9z" fill="#2e9e4f"/>',
  pt: '<rect width="60" height="44" rx="9" fill="#e53935"/><path d="M9 0h15v44H9a9 9 0 0 1-9-9V9a9 9 0 0 1 9-9z" fill="#2e7d32"/><circle cx="24" cy="22" r="8" fill="#fbc02d"/>',
  ru: '<rect width="60" height="44" rx="9" fill="#e53935"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v20H0z" fill="#1e5bbf"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v6H0z" fill="#fff"/>',
  ja: '<rect width="60" height="44" rx="9" fill="#fff" stroke="#e5e7eb" stroke-width="2"/><circle cx="30" cy="22" r="11" fill="#e53935"/>',
  zh: '<rect width="60" height="44" rx="9" fill="#e53935"/><path d="M14 8l2.6 6.4 6.9.4-5.3 4.4 1.7 6.7L14 22.2l-5.9 3.7 1.7-6.7-5.3-4.4 6.9-.4z" fill="#fbc02d"/>',
  ko: '<rect width="60" height="44" rx="9" fill="#fff" stroke="#e5e7eb" stroke-width="2"/><path d="M19 22a11 11 0 0 1 22 0z" fill="#e53935"/><path d="M19 22a11 11 0 0 0 22 0z" fill="#1e5bbf"/><path d="M19 22a5.5 5.5 0 0 0 11 0 5.5 5.5 0 0 1 11 0" fill="none"/>',
  hi: '<rect width="60" height="44" rx="9" fill="#2e9e4f"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v20H0z" fill="#fff"/><path d="M0 9a9 9 0 0 1 9-9h42a9 9 0 0 1 9 9v6H0z" fill="#ff9933"/><circle cx="30" cy="22" r="5" fill="none" stroke="#1a237e" stroke-width="1.6"/>',
};

/** Icon for a course or track: ComfyUI PNG, a drawn flag, or a colored code tile. */
export function CourseIcon({ icon, size = 48 }: { icon: string; size?: number }) {
  if (icon.startsWith('flag:')) {
    const f = FLAG[icon.slice(5)];
    return <span className="svg" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="-2 -10 64 64" aria-hidden="true"><rect x="0" y="6" width="60" height="44" rx="9" fill="rgba(0,0,0,.12)"/>${f}</svg>` }} />;
  }
  if (icon.startsWith('tile:')) {
    const [, label, color] = icon.split(':');
    const fs = label.length > 2 ? 17 : 22;
    return <span className="svg" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="2" y="6" width="52" height="48" rx="12" fill="rgba(0,0,0,.18)"/><rect x="2" y="2" width="52" height="48" rx="12" fill="${color}"/><text x="28" y="27" dominant-baseline="middle" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${fs}" fill="#fff">${label.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text></svg>` }} />;
  }
  const url = iconUrl(icon);
  return url ? <img src={url} alt="" style={{ width: size, height: size, objectFit: 'contain' }} /> : <span style={{ width: size, height: size }} />;
}
