export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  document.body.appendChild(c);
  const x = c.getContext('2d')!;
  c.width = innerWidth; c.height = innerHeight;
  const cols = ['#14b8a6', '#6366f1', '#facc15', '#ef4444', '#a855f7', '#f97316', '#22c55e'];
  const P = Array.from({ length: 160 }, () => ({
    x: c.width / 2 + (Math.random() - 0.5) * 80, y: c.height * 0.4,
    vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 5, r: Math.random() * 7 + 5,
    c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.35,
  }));
  let f = 0;
  (function loop() {
    x.clearRect(0, 0, c.width, c.height);
    for (const p of P) {
      p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore();
    }
    if (++f < 160) requestAnimationFrame(loop); else c.remove();
  })();
}
