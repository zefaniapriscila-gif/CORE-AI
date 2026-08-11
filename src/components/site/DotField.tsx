import React, { useEffect, useRef } from 'react';

interface Props {
  /** Jarak antar titik dalam piksel CSS. */
  spacing?: number;
  /** Radius pengaruh kursor. */
  radius?: number;
  /** Dorongan maksimum di titik terdekat kursor. */
  push?: number;
  className?: string;
}

/**
 * Latar titik-titik yang menjauh dari kursor.
 *
 * Sengaja stateless per titik: posisi tiap titik dihitung ulang dari posisi
 * kursor yang sudah di-ease, bukan dari simulasi partikel. Jadi tidak ada
 * array kecepatan yang harus diperbarui, dan rAF hanya berjalan selama kursor
 * yang di-ease belum menyusul kursor asli — diam berarti nol pekerjaan.
 */
export const DotField: React.FC<Props> = ({
  spacing = 26,
  radius = 140,
  push = 15,
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

    /* Kursor asli vs kursor yang di-ease. Selisihnya yang menggerakkan rAF. */
    let targetX = -9999;
    let targetY = -9999;
    let easeX = -9999;
    let easeY = -9999;
    /** 0 saat kursor di luar area, 1 saat di dalam — juga di-ease. */
    let targetStrength = 0;
    let strength = 0;

    let frame = 0;
    let running = false;

    const BASE = 'rgba(16, 24, 60, 0.13)';
    const NEAR = 'rgba(47, 75, 220, 0.42)';

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

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (w === 0 || h === 0) return;

      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const offX = (w - (cols - 1) * spacing) / 2;
      const offY = (h - (rows - 1) * spacing) / 2;

      const r2 = radius * radius;
      const active = strength > 0.001;
      const size = 2;
      const half = size / 2;

      /* Lintasan 1 — semua titik dengan warna dasar, satu fillStyle saja. */
      ctx.fillStyle = BASE;
      for (let iy = 0; iy < rows; iy++) {
        const by = offY + iy * spacing;
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

      /* Lintasan 2 — hanya titik di sekitar kursor, ditandai warna brand.
         Dibatasi ke kotak pembatas radius, jadi biayanya konstan kecil. */
      ctx.fillStyle = NEAR;
      const ix0 = Math.max(0, Math.floor((easeX - radius - offX) / spacing));
      const ix1 = Math.min(cols - 1, Math.ceil((easeX + radius - offX) / spacing));
      const iy0 = Math.max(0, Math.floor((easeY - radius - offY) / spacing));
      const iy1 = Math.min(rows - 1, Math.ceil((easeY + radius - offY) / spacing));

      for (let iy = iy0; iy <= iy1; iy++) {
        const by = offY + iy * spacing;
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

      easeX += dx * 0.16;
      easeY += dy * 0.16;
      strength += ds * 0.1;

      draw();

      /* Berhenti begitu kursor yang di-ease sudah menyusul. */
      const settled =
        Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4 && Math.abs(ds) < 0.004;
      if (settled) {
        easeX = targetX;
        easeY = targetY;
        strength = targetStrength;
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
        /* Masuk pertama kali: tempatkan langsung supaya tidak menyapu layar. */
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

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [spacing, radius, push]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
