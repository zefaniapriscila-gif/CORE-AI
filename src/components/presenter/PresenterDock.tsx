import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Home,
} from 'lucide-react';
import { CoreMark } from '../brand/CoreMark';
import { MODE_COLOR, Stage, STEPS } from '../../engine/coeTypes';
import { SoundToggle } from '../ui/SoundToggle';

interface Props {
  stage: Stage;
  reached: Set<Stage>;
  onGo: (stage: Stage) => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  /** Keluar dari simulasi, kembali ke halaman muka. */
  onHome: () => void;
  theoryOpen: boolean;
  onToggleTheory: () => void;
}

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="font-mono text-[9px] px-1.5 py-px rounded-md bg-black/[.06] text-lo">
    {children}
  </kbd>
);

/**
 * Kontrol presenter. Diletakkan di luar jendela browser supaya tidak
 * tertukar dengan antarmuka produk saat demo di depan juri.
 */
export const PresenterDock: React.FC<Props> = ({
  stage,
  reached,
  onGo,
  onPrev,
  onNext,
  onReset,
  onHome,
  theoryOpen,
  onToggleTheory,
}) => {
  const idx = STEPS.findIndex((s) => s.stage === stage);

  return (
    <div className="shrink-0 flex justify-center px-6 pb-5 pt-1">
      <div className="flex items-center gap-3 h-14 pl-2.5 pr-3 rounded-[20px] glass">
        {/* Identitas */}
        <div className="flex items-center gap-2 pr-3 border-r border-black/[.09]">
          <button
            onClick={onHome}
            title="Kembali ke beranda"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-core-500
              hover:bg-black/[.055] active:scale-95 transition-all"
          >
            <Home className="w-[17px] h-[17px]" />
          </button>
          <span className="text-core-400 hidden xl:block">
            <CoreMark className="w-[18px] h-[18px]" />
          </span>
          <div className="leading-none hidden xl:block">
            <div className="font-display text-[12.5px] font-semibold text-hi -tracking-[.01em]">
              CORE AI
            </div>
            <div className="font-mono text-[9.5px] text-ink-500 mt-1">
              psyfic 2026 · ugm
            </div>
          </div>
        </div>

        {/* Rel tahap */}
        <div className="flex items-center gap-1">
          {STEPS.map((s) => {
            const active = s.stage === stage;
            const done = reached.has(s.stage) && !active;
            const tone = s.mode ? MODE_COLOR[s.mode] : 'var(--color-core-500)';
            return (
              <button
                key={s.stage}
                onClick={() => onGo(s.stage)}
                title={s.label}
                className={`h-9 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  active ? 'px-3' : 'w-9 justify-center hover:bg-black/[.055]'
                }`}
                style={
                  active
                    ? {
                        background: `color-mix(in srgb, ${tone} 16%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 32%, transparent), 0 0 20px -6px ${tone}`,
                      }
                    : undefined
                }
              >
                <span
                  className="font-mono text-[11px] shrink-0"
                  style={{
                    color: active
                      ? tone
                      : done
                      ? 'var(--color-mid)'
                      : 'var(--color-ink-500)',
                  }}
                >
                  {String(s.index).padStart(2, '0')}
                </span>
                {active && (
                  <span
                    className="text-[12.5px] font-medium whitespace-nowrap"
                    style={{ color: tone }}
                  >
                    {s.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigasi */}
        <div className="flex items-center gap-1 pl-2 border-l border-black/[.09]">
          <button
            onClick={onPrev}
            disabled={idx <= 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-mid hover:bg-black/[.055] hover:text-hi transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={onNext}
            disabled={idx >= STEPS.length - 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-mid hover:bg-black/[.055] hover:text-hi transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={onReset}
            title="Ulang dari awal"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 hover:bg-black/[.055] hover:text-mid transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <SoundToggle />
        </div>

        {/* Teori */}
        <button
          onClick={onToggleTheory}
          className="h-9 px-3 rounded-xl flex items-center gap-2 text-[12.5px] font-medium transition-all"
          style={
            theoryOpen
              ? {
                  color: 'var(--color-core-400)',
                  background:
                    'color-mix(in srgb, var(--color-core-500) 20%, transparent)',
                  boxShadow:
                    'inset 0 0 0 1px color-mix(in srgb, var(--color-core-500) 38%, transparent), 0 0 20px -6px var(--color-core-500)',
                }
              : { color: 'var(--color-mid)' }
          }
        >
          <BookOpen className="w-4 h-4" />
          Teori
          <Key>T</Key>
        </button>

        <div className="hidden 2xl:flex items-center gap-1 pl-2">
          <Key>←</Key>
          <Key>→</Key>
        </div>
      </div>
    </div>
  );
};
