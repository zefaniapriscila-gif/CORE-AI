import React from 'react';
import { X, Quote } from 'lucide-react';
import { MODE_COLOR, Stage, stepOf, SUBMODULE_LABEL } from '../../engine/coeTypes';
import { ModeGlyph } from '../brand/CoreMark';

interface Props {
  stage: Stage;
  open: boolean;
  onClose: () => void;
}

/**
 * Lembar landasan teori. Menempelkan tahap yang sedang tampil ke sitasi di
 * esai, supaya juri bisa memverifikasi klaim tanpa membuka dokumen.
 */
export const TheorySheet: React.FC<Props> = ({ stage, open, onClose }) => {
  const step = stepOf(stage);
  if (!open || !step) return null;

  const tone = step.mode ? MODE_COLOR[step.mode] : 'var(--color-core-500)';

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Tutup"
      />

      <div className="relative w-full max-w-[900px] mb-6 mx-6 rounded-3xl overflow-hidden bg-ink-950 anim-rise">
        <div
          className="aurora"
          style={{
            ['--tint' as string]: tone,
            ['--tint2' as string]: 'var(--color-core-500)',
          }}
        />

        <div className="relative glass-deep rounded-3xl flex items-start gap-4 px-7 py-6">
          <span
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-md"
            style={{
              background: `color-mix(in srgb, ${tone} 16%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 34%, transparent), 0 0 30px -10px ${tone}`,
              color: tone,
            }}
          >
            {step.mode ? (
              <ModeGlyph mode={step.mode} className="w-5 h-5" />
            ) : (
              <Quote className="w-[18px] h-[18px]" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[11px]" style={{ color: tone }}>
                tahap {String(step.index).padStart(2, '0')}
              </span>
              <span className="text-[11.5px] font-medium text-lo truncate">
                {SUBMODULE_LABEL[step.module]}
              </span>
            </div>

            <h2 className="font-display text-[27px] font-semibold leading-[1.15] -tracking-[.025em] text-hi mb-1.5">
              {step.label}
            </h2>
            <p className="text-[13.5px] text-mid mb-5">{step.what}</p>

            <div className="grid md:grid-cols-[1fr_auto] gap-5 items-start">
              <p className="text-[14px] leading-[1.75] text-hi/90 max-w-[62ch]">
                {step.theory}
              </p>
              <div
                className="rounded-2xl px-4 py-3.5 shrink-0 md:max-w-[250px] backdrop-blur-md glass-tint"
                style={{ ['--tint' as string]: tone }}
              >
                <div className="text-[11.5px] font-medium text-lo mb-1.5">
                  Rujukan
                </div>
                <p className="text-[12.5px] leading-snug" style={{ color: tone }}>
                  {step.cite}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 hover:bg-white/7 hover:text-hi transition-colors shrink-0"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
