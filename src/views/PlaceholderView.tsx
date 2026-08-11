import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SiteView } from '../engine/siteTypes';

interface Props {
  title: string;
  onNavigate: (view: SiteView) => void;
}

/**
 * Kerangka halaman statis (Metodologi, Tentang Kami).
 * Isinya sengaja dikosongkan — strukturnya sudah ada, tinggal diisi.
 */
export const PlaceholderView: React.FC<Props> = ({ title, onNavigate }) => (
  <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-6 pb-[76px] text-center">
    <h1 className="font-display font-extrabold -tracking-[.03em] leading-[1.08] text-[clamp(34px,5vw,60px)] text-hi anim-rise">
      {title}
    </h1>

    <p className="mt-4 text-[14px] text-lo anim-rise delay-2">
      Konten halaman ini belum diisi.
    </p>

    <button
      onClick={() => onNavigate('landing')}
      className="mt-9 h-11 px-5 rounded-full text-[13.5px] font-medium text-mid bg-white/85 backdrop-blur-sm
        shadow-[inset_0_0_0_1px_rgba(16,24,60,.13)] inline-flex items-center gap-2
        hover:text-hi hover:bg-white active:scale-[.98] transition-all anim-rise delay-3"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali ke beranda
    </button>
  </main>
);
