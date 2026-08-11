import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { PrimaryButton, SectionLabel } from '../../ui/primitives';
import { MODE_COLOR } from '../../../engine/coeTypes';
import { SCAFFOLD_HINTS, SCAFFOLD_PARTIAL } from '../../../engine/coeScript';

interface Props {
  question: string;
  onEnd: () => void;
}

const TONE = MODE_COLOR.scaffold;

export const ScaffoldStep: React.FC<Props> = ({ question, onEnd }) => (
  <PanelBody
    eyebrow="Sub-modul 3 · Scaffold Prompt Builder"
    tone={TONE}
    title={<>Jawabannya sengaja belum utuh</>}
    lede={
      <>
        Bantuan bertahap dan sementara: cukup untuk membawamu ke wilayah yang
        belum bisa kamu kerjakan sendiri, lalu ditarik lagi.
      </>
    }
    action={
      <PrimaryButton onClick={onEnd} tone={TONE}>
        Akhiri sesi & beri rating
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
    }
  >
    <div className="rounded-2xl glass-soft px-4 py-3.5">
      <div className="text-[11.5px] font-medium text-lo mb-1.5">Pertanyaanmu</div>
      <p className="text-[12.5px] leading-[1.65] text-mid">{question}</p>
    </div>

    <SectionLabel tone={TONE}>Petunjuk bertahap</SectionLabel>

    <ol className="relative space-y-4 pl-[28px]">
      <span
        className="absolute left-[9px] top-2 bottom-2 w-px"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${TONE} 45%, transparent), transparent)`,
        }}
      />
      {SCAFFOLD_HINTS.map((h, i) => (
        <li
          key={h}
          className="relative anim-rise"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span
            className="absolute -left-[28px] top-[1px] w-[19px] h-[19px] rounded-full
              flex items-center justify-center font-mono text-[9.5px] font-medium backdrop-blur-md"
            style={{
              color: TONE,
              background: `color-mix(in srgb, ${TONE} 18%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${TONE} 40%, transparent)`,
            }}
          >
            {i + 1}
          </span>
          <p className="text-[13px] leading-[1.65] text-mid">{h}</p>
        </li>
      ))}
    </ol>

    <SectionLabel tone={TONE}>Jawaban parsial</SectionLabel>

    <div
      className="rounded-2xl px-4 py-4 core-no-copy backdrop-blur-md glass-tint"
      style={{ ['--tint' as string]: TONE }}
    >
      <p className="text-[13px] leading-[1.75] text-hi">{SCAFFOLD_PARTIAL}</p>
      <div className="mt-3.5 pt-3.5 hairline-t flex items-center gap-2">
        <Lock className="w-3 h-3 shrink-0" style={{ color: TONE }} />
        <span className="font-mono text-[10.5px]" style={{ color: TONE }}>
          tidak dapat diseleksi
        </span>
      </div>
    </div>
  </PanelBody>
);
