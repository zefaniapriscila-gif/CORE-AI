import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Check } from 'lucide-react';
import { SiteView } from '../../engine/siteTypes';

interface Props {
  view: SiteView;
  onNavigate: (view: SiteView) => void;
}

const MENU: { id: SiteView; label: string }[] = [
  { id: 'landing', label: 'Beranda' },
  { id: 'simulasi', label: 'Simulasi' },
  { id: 'metodologi', label: 'Metodologi' },
  { id: 'tentang', label: 'Tentang Kami' },
];

/**
 * Logo institusi — placeholder sampai berkas aslinya masuk.
 * Sengaja bergaris putus-putus supaya jelas ini belum final.
 */
const LogoSlot: React.FC<{ label: string }> = ({ label }) => (
  <div
    title={`Placeholder logo — ${label}`}
    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center
      border border-dashed border-ink-600 bg-white/70 text-[8px] font-mono
      tracking-wider text-lo select-none"
  >
    LOGO
  </div>
);

export const SiteHeader: React.FC<Props> = ({ view, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Tutup menu saat klik di luar atau tekan Escape. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="relative z-30 shrink-0 h-[76px] px-6 md:px-9 flex items-center">
      {/* Kiri — dua slot logo institusi */}
      <div className="flex items-center gap-2.5">
        <LogoSlot label="institusi 1" />
        <LogoSlot label="institusi 2" />
      </div>

      {/* Tengah — wordmark */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute left-1/2 -translate-x-1/2 font-display text-[21px] md:text-[23px]
          font-extrabold tracking-[.34em] text-core-500 pl-[.34em] transition-opacity hover:opacity-70"
      >
        CORE AI
      </button>

      {/* Kanan — menu */}
      <div ref={wrapRef} className="ml-auto relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-hi
            hover:bg-black/[.05] active:scale-95 transition-all"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {open && (
          <nav className="absolute right-0 top-[52px] w-[212px] rounded-2xl overflow-hidden glass anim-pop">
            {MENU.map((m) => {
              const active = m.id === view;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setOpen(false);
                    onNavigate(m.id);
                  }}
                  className={`w-full h-11 px-4 flex items-center gap-2 text-left text-[13.5px] transition-colors ${
                    active
                      ? 'text-core-600 font-medium bg-black/[.04]'
                      : 'text-mid hover:bg-black/[.04] hover:text-hi'
                  }`}
                >
                  {m.label}
                  {active && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
