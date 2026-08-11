import React from 'react';
import { ArrowRight, Check, Power } from 'lucide-react';
import { CoreMark } from '../brand/CoreMark';
import { GOALS } from '../../engine/coeScript';
import { UserGoal } from '../../engine/coeTypes';

interface Props {
  onSelect: (goal: UserGoal) => void;
  selected?: UserGoal | null;
}

/**
 * Popup ekstensi — menempel di ikon toolbar seperti popup Chrome sungguhan.
 * Kaca di atas aurora, jadi ia terbaca sebagai lapisan terpisah dari halaman.
 */
export const ExtensionPopup: React.FC<Props> = ({ onSelect, selected }) => (
  <div className="relative w-[348px] rounded-3xl overflow-hidden bg-ink-950">
    <div
      className="aurora"
      style={{
        ['--tint' as string]: 'var(--color-core-500)',
        ['--tint2' as string]: 'var(--color-mode-reflective)',
      }}
    />

    <div className="relative glass rounded-3xl">
      {/* Kepala */}
      <div className="flex items-center gap-2.5 px-4 h-[54px] hairline">
        <span className="text-core-400">
          <CoreMark className="w-[22px] h-[22px]" />
        </span>
        <div className="leading-none">
          <div className="font-display text-[14.5px] font-semibold text-hi -tracking-[.01em]">
            CORE AI
          </div>
          <div className="font-mono text-[10px] text-lo mt-1">
            v0.9 · gemini.google.com
          </div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-mid">
          <span
            className="w-1.5 h-1.5 rounded-full bg-mode-reflective"
            style={{ boxShadow: '0 0 8px var(--color-mode-reflective)' }}
          />
          Aktif
        </span>
      </div>

      {/* Pertanyaan tujuan */}
      <div className="px-4 pt-4">
        <h2 className="font-display text-[21px] font-semibold leading-[1.25] -tracking-[.02em] text-hi">
          Apa tujuanmu membuka
          <br />
          Gemini sekarang?
        </h2>
        <p className="text-[12.5px] text-mid leading-snug mt-2">
          CORE AI hanya ikut campur kalau kamu sedang belajar. Selain itu ia
          menyingkir.
        </p>
      </div>

      {/* Opsi */}
      <div className="p-3 space-y-1">
        {GOALS.map((g, i) => {
          const isSel = selected === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              className={`group w-full text-left rounded-2xl px-3 py-2.5 flex items-start gap-3 transition-all anim-rise ${
                isSel ? 'glass-soft' : 'hover:bg-black/[.045]'
              }`}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <span
                className="mt-[3px] w-[16px] h-[16px] rounded-full shrink-0 flex items-center justify-center transition-all"
                style={
                  isSel
                    ? {
                        background: 'var(--color-core-500)',
                        boxShadow:
                          '0 0 12px color-mix(in srgb, var(--color-core-500) 55%, transparent)',
                      }
                    : { boxShadow: 'inset 0 0 0 1.5px rgba(16,24,60,.22)' }
                }
              >
                {isSel && (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-hi leading-snug">
                  {g.label}
                </span>
                <span className="block text-[11.5px] text-lo leading-snug mt-0.5">
                  {g.sub}
                </span>
              </span>

              {g.activatesCoe ? (
                <span
                  className="mt-0.5 shrink-0 h-[19px] px-2 rounded-full font-mono text-[9.5px] flex items-center"
                  style={{
                    color: 'var(--color-core-400)',
                    background:
                      'color-mix(in srgb, var(--color-core-500) 16%, transparent)',
                    boxShadow:
                      'inset 0 0 0 1px color-mix(in srgb, var(--color-core-500) 32%, transparent)',
                  }}
                >
                  COE
                </span>
              ) : (
                <Power className="w-3.5 h-3.5 text-ink-500 mt-1 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Kaki */}
      <div className="px-4 py-3 hairline-t flex items-center gap-2">
        <span className="font-mono text-[10px] text-core-400">COE</span>
        <p className="text-[11.5px] text-lo leading-snug">
          menyala hanya untuk tujuan instrumental
        </p>
        <ArrowRight className="w-3.5 h-3.5 text-ink-500 ml-auto" />
      </div>
    </div>
  </div>
);
