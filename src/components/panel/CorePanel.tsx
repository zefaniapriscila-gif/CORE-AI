import React from 'react';
import { Minus, MoreHorizontal, X } from 'lucide-react';
import { CoreMark, ModeGlyph } from '../brand/CoreMark';
import {
  MODE_COLOR,
  MODE_LABEL,
  ModeKey,
  SUBMODULE_LABEL,
  SubModule,
} from '../../engine/coeTypes';
import { Pulse } from '../ui/primitives';

interface Props {
  mode: ModeKey | null;
  module: SubModule;
  consoleLines: string[];
  children: React.ReactNode;
}

/**
 * Side panel ekstensi — mengikuti Chrome Side Panel API: ter-dock di kanan,
 * setinggi viewport. Permukaannya kaca di atas cahaya aurora yang warnanya
 * ikut mode kognitif aktif, jadi pergantian mode terbaca tanpa membaca label.
 */
export const CorePanel: React.FC<Props> = ({
  mode,
  module,
  consoleLines,
  children,
}) => {
  const tone = mode ? MODE_COLOR[mode] : 'var(--color-core-500)';
  const tone2 = mode ? 'var(--color-core-500)' : 'var(--color-mode-comparison)';

  return (
    <aside className="w-[400px] shrink-0 h-full relative overflow-hidden bg-ink-950 anim-panel">
      {/* Cahaya di balik kaca */}
      <div
        className="aurora"
        style={{ ['--tint' as string]: tone, ['--tint2' as string]: tone2 }}
      />

      <div className="relative h-full flex flex-col glass">
        {/* ---- Kepala ---- */}
        <header className="h-[54px] shrink-0 flex items-center gap-2.5 pl-5 pr-3 hairline">
          <span className="text-core-400 shrink-0">
            <CoreMark className="w-[21px] h-[21px]" />
          </span>
          <span className="font-display text-[14.5px] font-semibold text-hi -tracking-[.01em] shrink-0">
            CORE AI
          </span>

          {mode && (
            <span
              className="ml-1.5 inline-flex items-center gap-1.5 h-[27px] px-2.5 rounded-full min-w-0 backdrop-blur-md glass-tint"
              style={{ ['--tint' as string]: tone, color: tone }}
            >
              <ModeGlyph mode={mode} className="w-[15px] h-[15px] shrink-0" />
              <span className="text-[11.5px] font-medium truncate">
                {MODE_LABEL[mode]}
              </span>
            </span>
          )}

          <div className="ml-auto flex items-center gap-0.5 text-ink-500 shrink-0">
            {[MoreHorizontal, Minus, X].map((Ic, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/7 hover:text-mid transition-colors"
              >
                <Ic className="w-[15px] h-[15px]" />
              </div>
            ))}
          </div>
        </header>

        {/* ---- Isi ---- */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-ink">{children}</div>

        {/* ---- Telemetri COE ---- */}
        <footer className="shrink-0 hairline-t">
          <div className="flex items-center gap-2 px-5 h-9">
            <Pulse tone={module === 'idle' ? 'var(--color-lo)' : tone} />
            <span className="text-[11.5px] font-medium text-mid truncate">
              {SUBMODULE_LABEL[module]}
            </span>
          </div>
          <div className="px-5 pb-3 space-y-[3px] max-h-[70px] overflow-hidden">
            {consoleLines.slice(-3).map((line, i, arr) => (
              <div
                key={`${line}-${i}`}
                className="font-mono text-[10px] leading-[1.5] text-lo truncate anim-rise"
                style={{ opacity: 0.35 + (i / Math.max(arr.length - 1, 1)) * 0.55 }}
              >
                <span className="text-ink-500">›</span> {line}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </aside>
  );
};

/* -------------------------------------------------------------------------- */

/**
 * Blok isi standar tiap tahap. `action` menempel di dasar panel supaya
 * tombol utama selalu terlihat, berapa pun tinggi layar presentasi.
 */
export const PanelBody: React.FC<{
  eyebrow?: string;
  tone?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}> = ({
  eyebrow,
  tone = 'var(--color-core-500)',
  title,
  lede,
  children,
  action,
}) => (
  <div className="flex flex-col min-h-full">
    <div className="px-5 pt-4 pb-3 space-y-3 flex-1">
      {eyebrow && (
        <span
          className="inline-flex items-center gap-1.5 h-[25px] px-2.5 rounded-full text-[11px] font-medium backdrop-blur-md glass-tint anim-rise"
          style={{ ['--tint' as string]: tone, color: tone }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: tone, boxShadow: `0 0 8px ${tone}` }}
          />
          {eyebrow}
        </span>
      )}

      <h2 className="font-display text-[24px] font-semibold leading-[1.2] -tracking-[.02em] text-hi anim-rise delay-1">
        {title}
      </h2>

      {lede && (
        <p className="text-[13.5px] leading-[1.65] text-mid anim-rise delay-2">
          {lede}
        </p>
      )}

      {children}
    </div>

    {action && (
      <div
        className="sticky bottom-0 px-5 pt-10 pb-4 backdrop-blur-lg"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, #000 42px, #000 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 42px, #000 100%)',
          background:
            'linear-gradient(to top, rgba(6,7,12,.9) 40%, rgba(6,7,12,0))',
        }}
      >
        {action}
      </div>
    )}
  </div>
);
