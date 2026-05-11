import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
};

const palette = ["#ef4a57", "#3c8dff", "#f7c45f", "#82f6d8", "#ffffff"];

export const ConfettiCanvas = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const total = 160;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < total; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 2.6,
        vy: Math.random() * 2.6 + 2.1,
        size: Math.random() * 8 + 4,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.18,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    let frame = 0;
    let raf = 0;

    const loop = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.rot += p.spin;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 2.2 + 2.2;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < 340) {
        raf = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />;
};
