/* Visual effects: confetti, particle bursts, floating text, shakes. Pure DOM/canvas, no libraries. */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLS = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600', '#ff86d0'];

type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number; va: number; s: number; life: number; g: number };
let canvas: HTMLCanvasElement | null = null;
let parts: P[] = [];
let running = false;

function ensure() {
  if (!canvas) {
    canvas = document.createElement('canvas'); canvas.className = 'confetti'; document.body.appendChild(canvas);
    const fit = () => { if (canvas) { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; } };
    fit(); addEventListener('resize', fit);
  }
  if (!running) { running = true; requestAnimationFrame(loop); }
}
function drawStar(x: CanvasRenderingContext2D, r: number) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = (i * Math.PI) / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  x.closePath(); x.fill();
}
function loop() {
  if (!canvas) return;
  const x = canvas.getContext('2d')!, k = devicePixelRatio;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, canvas.width, canvas.height); x.scale(k, k);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) {
    p.vy += p.g; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 1;
    x.save(); x.globalAlpha = Math.min(1, p.life / 25); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c;
    if (p.s === 0) x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
    else if (p.s === 1) { x.beginPath(); x.arc(0, 0, p.r / 2.4, 0, 7); x.fill(); }
    else drawStar(x, p.r / 1.6);
    x.restore();
  }
  if (parts.length) requestAnimationFrame(loop); else { running = false; x.clearRect(0, 0, canvas.width, canvas.height); }
}

/** Big celebration: confetti cannons from both bottom corners plus a centre pop. */
export function confetti() {
  if (reduced()) return;
  ensure();
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < 190; i++) {
    const side = i % 3, fromX = side === 0 ? 0 : side === 1 ? W : W / 2, fromY = side === 2 ? H * 0.42 : H;
    const ang = side === 0 ? -Math.PI / 3 + (Math.random() - 0.5) * 0.7 : side === 1 ? (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.7 : Math.random() * Math.PI * 2;
    const sp = side === 2 ? Math.random() * 9 + 3 : Math.random() * 14 + 12;
    parts.push({ x: fromX, y: fromY, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: Math.random() * 8 + 7, c: COLS[i % COLS.length], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, s: i % 5 === 0 ? 2 : i % 2, life: 150 + Math.random() * 60, g: 0.32 });
  }
}

/** Small star/dot burst around an element (correct answer, chest, node). */
export function burst(el: Element | null, colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ffffff'], n = 26) {
  if (reduced() || !el) return;
  ensure();
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.3, sp = Math.random() * 6 + 5;
    parts.push({ x: cx + Math.cos(a) * r.width * 0.3, y: cy + Math.sin(a) * r.height * 0.3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, r: Math.random() * 7 + 6, c: colors[i % colors.length], a: 0, va: (Math.random() - 0.5) * 0.3, s: i % 3 === 0 ? 2 : 1, life: 34 + Math.random() * 16, g: 0.12 });
  }
}

/** Text that pops out of an element and floats up (+10 XP, 3 in a row!, -1 heart). */
export function floatText(el: Element | null, text: string, color = '#ff9600') {
  if (!el) return;
  const r = el.getBoundingClientRect(), d = document.createElement('div');
  d.className = 'float-txt'; d.textContent = text; d.style.color = color;
  d.style.left = `${r.left + r.width / 2}px`; d.style.top = `${r.top}px`;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1200);
}

/** Restartable CSS animation on an element (shake, pop, glow). */
export function kick(el: Element | null, cls: 'fx-shake' | 'fx-pop' | 'fx-glow') {
  if (!el) return;
  el.classList.remove(cls); void (el as HTMLElement).offsetWidth; el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 700);
}
