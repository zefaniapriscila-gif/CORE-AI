import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteView } from '../engine/siteTypes';

interface Props {
  onNavigate: (view: SiteView) => void;
}

/** Tombol pil sekunder — putih dengan cincin tipis, khas halaman muka. */
const PillButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="h-12 px-6 rounded-full text-[14px] font-medium text-hi bg-white/85 backdrop-blur-sm
      shadow-[inset_0_0_0_1px_rgba(16,24,60,.13),0_2px_10px_-4px_rgba(16,24,60,.18)]
      hover:bg-white hover:shadow-[inset_0_0_0_1px_rgba(16,24,60,.22),0_6px_18px_-6px_rgba(16,24,60,.25)]
      active:scale-[.98] transition-all"
  >
    {children}
  </button>
);

/**
 * Halaman muka — satu layar penuh, tanpa scroll. Titik-titik latar digambar
 * di App supaya tetap hidup saat berpindah antar halaman statis.
 */
export const LandingView: React.FC<Props> = ({ onNavigate }) => (
  <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-6 pb-[76px] text-center">
    <h1
      className="font-display font-extrabold -tracking-[.035em] leading-[1.06]
        text-[clamp(38px,6.4vw,80px)] text-hi anim-rise"
    >
      Menahan Cognitive <span className="text-core-500">Offloading</span>
      <br />
      Mengembalikan{' '}
      <span className="text-mode-reflective">Proses Berpikir</span>
    </h1>

    <p className="mt-7 max-w-[640px] text-[15px] md:text-[16px] leading-[1.7] text-mid anim-rise delay-2">
      Ekstensi peramban yang menunda jawaban instan dan menggantinya dengan alur
      kognitif bertahap — interception, pertanyaan Socratic, rangkuman
      tervalidasi, hingga scaffolding.
    </p>

    <div className="mt-10 flex flex-wrap items-center justify-center gap-3 anim-rise delay-3">
      <button
        onClick={() => onNavigate('simulasi')}
        className="h-12 px-7 rounded-full text-[14px] font-semibold text-white bg-core-500
          shadow-[0_10px_26px_-8px_color-mix(in_srgb,var(--color-core-500)_70%,transparent)]
          inline-flex items-center gap-2.5 hover:bg-core-600 active:scale-[.98] transition-all"
      >
        Buka Simulasi
        <ArrowRight className="w-4 h-4" />
      </button>

      <PillButton onClick={() => onNavigate('metodologi')}>Metodologi</PillButton>
      <PillButton onClick={() => onNavigate('tentang')}>Tentang Kami</PillButton>
    </div>
  </main>
);
