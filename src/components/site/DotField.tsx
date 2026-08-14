import React, { useEffect, useRef } from 'react';

interface Props {
  /** Jarak antar titik dalam piksel CSS. */
  spacing?: number;
  /** Radius pengaruh kursor. */
  radius?: number;
  /** Dorongan maksimum di titik terdekat kursor. */
  push?: number;
  /** Faktor kecepatan parallax saat halaman di-scroll (default: 0.5). */
  parallax?: number;
  className?: string;
}

interface Comet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  angle: number;
  life: number;
  maxLife: number;
  size: number;
  theme: {
    head: string;
    tail: string;
    aura: string;
  };
}

/**
 * Latar titik-titik asli yang menjauh dari kursor dan mengikuti scroll (parallax),
 * dilengkapi kilau mikro-komet kecil, cepat, dan transparan di latar belakang.
 */
export const DotField: React.FC<Props> = ({
  spacing = 26,
  radius = 140,
  push = 15,
  parallax = 0.5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    /* Kursor asli vs kursor yang di-ease. */
    let targetX = -9999;
    let targetY = -9999;
    let easeX = -9999;
    let easeY = -9999;
    /** 0 saat kursor di luar area, 1 saat di dalam. */
    let targetStrength = 0;
    let strength = 0;

    /* Posisi scroll aktual vs yang di-ease. */
    let targetScrollY = 0;
    let easeScrollY = 0;

    /* Partikel komet mikro: kecil, transparan 70%, cepat */
    const comets: Comet[] = [];
    let cometTimeout = 0;

    let frame = 0;
    let running = false;

    // Nilai warna titik-titik asli (tidak diubah)
    const BASE = 'rgba(16, 24, 60, 0.13)';
    const NEAR = 'rgba(47, 75, 220, 0.42)';

    // Tema komet: transparan (~30% opacity / 70% transparansi)
    const COMET_THEMES = [
      {
        head: 'rgba(59, 130, 246, 0.35)',
        tail: 'rgba(47, 75, 220, 0)',
        aura: 'rgba(59, 130, 246, 0.12)',
      },
      {
        head: 'rgba(16, 185, 129, 0.32)',
        tail: 'rgba(10, 154, 134, 0)',
        aura: 'rgba(16, 185, 129, 0.10)',
      },
      {
        head: 'rgba(99, 102, 241, 0.35)',
        tail: 'rgba(79, 70, 229, 0)',
        aura: 'rgba(99, 102, 241, 0.12)',
      },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const spawnComet = () => {
      if (reduced || w === 0 || h === 0 || comets.length >= 3) return;

      const angle = (Math.PI / 180) * (25 + Math.random() * 25);
      const speed = 5.6 + Math.random() * 3.2; // Cepat & gesit
      const length = 45 + Math.random() * 40; // Ukuran kecil & ramping (45-85px)

      const startFromTop = Math.random() > 0.35;
      const startX = startFromTop ? Math.random() * (w * 0.85) : -30;
      const startY = startFromTop ? -30 : Math.random() * (h * 0.45);

      const theme = COMET_THEMES[Math.floor(Math.random() * COMET_THEMES.length)];
      const maxLife = Math.round((Math.max(w, h) * 1.1) / speed);

      comets.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length,
        angle,
        life: 0,
        maxLife,
        size: 1.0, // Ketebalan garis sangat kecil/halus
        theme,
      });

      start();
    };

    const scheduleNextComet = (initialDelay?: number) => {
      if (reduced) return;
      const delay = initialDelay ?? (2200 + Math.random() * 2400);
      cometTimeout = window.setTimeout(() => {
        spawnComet();
        scheduleNextComet();
      }, delay);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (w === 0 || h === 0) return;

      /* 1. Gambar Komet Mikro (Kecil, Cepat, 70% Transparan) */
      if (comets.length > 0) {
        for (let i = comets.length - 1; i >= 0; i--) {
          const c = comets[i];
          c.x += c.dx;
          c.y += c.dy;
          c.life++;

          const progress = c.life / c.maxLife;
          let alpha = 1;
          if (progress < 0.12) {
            alpha = progress / 0.12;
          } else if (progress > 0.7) {
            alpha = (1 - progress) / 0.3;
          }
          alpha = Math.max(0, Math.min(1, alpha));

          const tailX = c.x - Math.cos(c.angle) * c.length;
          const tailY = c.y - Math.sin(c.angle) * c.length;

          const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
          grad.addColorStop(0, c.theme.tail);
          grad.addColorStop(1, c.theme.head);

          ctx.save();
          ctx.globalAlpha = alpha;

          // Ekor komet yang sangat tipis & elegan
          ctx.strokeStyle = grad;
          ctx.lineWidth = c.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();

          // Titik kepala komet
          ctx.fillStyle = c.theme.head;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Pendaran halus kepala
          ctx.fillStyle = c.theme.aura;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size * 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          if (c.life >= c.maxLife || (c.x > w + 120 && c.y > h + 120)) {
            comets.splice(i, 1);
          }
        }
      }

      /* 2. Gambar Matriks Titik-Titik Asli */
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 3;
      const offX = (w - (cols - 1) * spacing) / 2;
      const baseOffY = (h - (rows - 3) * spacing) / 2;

      const scrollShift = easeScrollY * parallax;
      const shiftY = ((scrollShift % spacing) + spacing) % spacing;

      const r2 = radius * radius;
      const active = strength > 0.001;
      const size = 2;
      const half = size / 2;

      /* Lintasan 1 — semua titik dengan warna dan ukuran dasar asli */
      ctx.fillStyle = BASE;
      for (let iy = -1; iy < rows - 1; iy++) {
        const by = baseOffY + iy * spacing - shiftY;
        for (let ix = 0; ix < cols; ix++) {
          const bx = offX + ix * spacing;
          let x = bx;
          let y = by;

          if (active) {
            const dx = bx - easeX;
            const dy = by - easeY;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const f = 1 - d / radius;
              const amount = f * f * push * strength;
              x += (dx / d) * amount;
              y += (dy / d) * amount;
            }
          }

          ctx.fillRect(x - half, y - half, size, size);
        }
      }

      if (!active) return;

      /* Lintasan 2 — titik di sekitar kursor asli */
      ctx.fillStyle = NEAR;
      const ix0 = Math.max(0, Math.floor((easeX - radius - offX) / spacing));
      const ix1 = Math.min(cols - 1, Math.ceil((easeX + radius - offX) / spacing));
      const iy0 = Math.max(-1, Math.floor((easeY - radius - baseOffY + shiftY) / spacing));
      const iy1 = Math.min(rows - 1, Math.ceil((easeY + radius - baseOffY + shiftY) / spacing));

      for (let iy = iy0; iy <= iy1; iy++) {
        const by = baseOffY + iy * spacing - shiftY;
        for (let ix = ix0; ix <= ix1; ix++) {
          const bx = offX + ix * spacing;
          const dx = bx - easeX;
          const dy = by - easeY;
          const d2 = dx * dx + dy * dy;
          if (d2 >= r2 || d2 <= 0.0001) continue;

          const d = Math.sqrt(d2);
          const f = 1 - d / radius;
          const amount = f * f * push * strength;
          const x = bx + (dx / d) * amount;
          const y = by + (dy / d) * amount;
          const s = size + f * 1.4;
          ctx.globalAlpha = f * strength;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      const dx = targetX - easeX;
      const dy = targetY - easeY;
      const ds = targetStrength - strength;
      const dScroll = targetScrollY - easeScrollY;

      easeX += dx * 0.16;
      easeY += dy * 0.16;
      strength += ds * 0.1;
      easeScrollY += dScroll * 0.18;

      draw();

      /* Berhenti jika kursor, scroll, dan komet sudah tuntas */
      const settled =
        Math.abs(dx) < 0.4 &&
        Math.abs(dy) < 0.4 &&
        Math.abs(ds) < 0.004 &&
        Math.abs(dScroll) < 0.2 &&
        comets.length === 0;

      if (settled) {
        easeX = targetX;
        easeY = targetY;
        strength = targetStrength;
        easeScrollY = targetScrollY;
        running = false;
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (strength === 0 && targetStrength === 0) {
        easeX = x;
        easeY = y;
      }
      targetX = x;
      targetY = y;
      targetStrength = 1;
      start();
    };

    const onLeave = () => {
      targetStrength = 0;
      start();
    };

    const onScroll = (e: Event) => {
      const target = e.target;
      if (target && target instanceof HTMLElement) {
        targetScrollY = target.scrollTop;
      } else if (target === document || target === window) {
        targetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      }
      start();
    };

    const syncCurrentScroll = () => {
      const scrollable = document.querySelector('.overflow-y-auto');
      if (scrollable instanceof HTMLElement) {
        targetScrollY = scrollable.scrollTop;
      } else {
        targetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      }
      start();
    };

    resize();
    syncCurrentScroll();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mo = new MutationObserver(() => {
      syncCurrentScroll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
      window.addEventListener('scroll', onScroll, { capture: true, passive: true });

      scheduleNextComet(800);
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(cometTimeout);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [spacing, radius, push, parallax]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
