import { useEffect, useRef } from 'react';

const COLORS = ['#d2b48a', '#efe8dc', '#c17f5c', '#8a9a7c', '#b8956a'];

function makePieces(width, height, count, yJitter = 80) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * yJitter,
    w: 5 + Math.random() * 8,
    h: 3 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 3,
    vy: 1.5 + Math.random() * 2.5,
    opacity: 1,
    glitter: Math.random() > 0.65,
  }));
}

export function launchConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = makePieces(canvas.width, canvas.height, 120);
  const start = Date.now();
  let secondWave = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - start;
    if (!secondWave && elapsed > 400) {
      pieces.push(...makePieces(canvas.width, canvas.height, 80, 40));
      secondWave = true;
    }
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      if (elapsed > 2200) p.opacity -= 0.012;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.glitter) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });
    const alive = pieces.filter((p) => p.opacity > 0 && p.y < canvas.height + 20);
    pieces.length = 0;
    pieces.push(...alive);
    if (pieces.length > 0) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

export default function ConfettiCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <canvas ref={ref} id="confetti-canvas" className="confetti-canvas" aria-hidden="true" />;
}

export function useConfetti() {
  const ref = useRef(null);
  const fire = () => launchConfetti(ref.current);
  return { canvasRef: ref, fire };
}
