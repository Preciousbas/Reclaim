import { useEffect, useRef } from 'react';

function spawnStars(container) {
  container.innerHTML = '';
  for (let i = 0; i < 80; i += 1) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.8;
    const gold = Math.random() < 0.3;
    s.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `--d:${2 + Math.random() * 5}s`,
      `--dl:-${Math.random() * 5}s`,
      `background:${gold ? '#d2b48a' : '#efe8dc'}`,
      `box-shadow:0 0 ${size * 3}px ${gold ? 'rgba(210,180,138,0.65)' : 'rgba(239,232,220,0.4)'}`,
    ].join(';');
    container.appendChild(s);
  }
}

export default function StarsBackground() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) spawnStars(ref.current);
  }, []);

  return <div className="stars" ref={ref} aria-hidden="true" />;
}
