import { useEffect, useRef } from "react";

type Props = {
  type: "rain" | "snow" | "clear";
};

export default function WeatherParticles({ type }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // ✅ FIX 1

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // ✅ FIX 2

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: any[] = [];
    particlesRef.current = particles;

    const count = type === "snow" ? 80 : type === "rain" ? 120 : 0;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: type === "rain" ? Math.random() * 20 + 10 : 0,
        speed:
          type === "snow" ? Math.random() * 1 + 0.5 : Math.random() * 6 + 4,
        size: type === "snow" ? Math.random() * 3 + 1 : 1,
      });
    }

    let animation: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const list = particlesRef.current;

      ctx.strokeStyle =
        type === "rain" ? "rgba(173,216,230,0.6)" : "rgba(255,255,255,0.8)";

      ctx.fillStyle = "rgba(255,255,255,0.8)";

      list.forEach((p) => {
        if (type === "rain") {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;

          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
        }

        if (type === "snow") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speed;
          p.x += Math.sin(p.y * 0.01);

          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
        }
      });

      animation = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  if (type === "clear") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
