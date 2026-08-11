import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { PrimaryButton, SectionLabel } from '../../ui/primitives';
import { MODE_COLOR } from '../../../engine/coeTypes';
import { countWords } from '../../../engine/dualLayerValidator';

interface Props {
  questions: string[];
  initialAnswer?: string;
  onSubmit: (answer: string) => void;
}

const TONE = MODE_COLOR.socratic;
const MIN_WORDS = 8;

export const SocraticStep: React.FC<Props> = ({
  questions,
  initialAnswer = '',
  onSubmit,
}) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [focused, setFocused] = useState(false);
  const words = countWords(answer);
  const ready = words >= MIN_WORDS;

  return (
    <PanelBody
      eyebrow="Sub-modul 3 · Socratic Prompt Builder"
      tone={TONE}
      title={<>Sebelum bertanya lagi, jawab ini dulu</>}
      lede={
        <>
          Pertanyaan pemantik memaksa retrieval dasar: menarik kembali apa yang
          baru saja kamu baca, bukan sekadar mengenalinya.
        </>
      }
      action={
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[11px]"
              style={{ color: ready ? TONE : 'var(--color-lo)' }}
            >
              {words} / {MIN_WORDS} kata
            </span>
            {ready && <Check className="w-3.5 h-3.5" style={{ color: TONE }} />}
          </div>
          <PrimaryButton
            onClick={() => onSubmit(answer)}
            disabled={!ready}
            tone={TONE}
          >
            Kirim jawaban
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </div>
      }
    >
      <SectionLabel tone={TONE}>Pertanyaan utama</SectionLabel>

      <p className="font-display text-[17px] font-medium leading-[1.4] -tracking-[.01em] text-hi">
        {questions[0]}
      </p>

      <div
        className="rounded-2xl glass-soft transition-shadow"
        style={
          focused || ready
            ? {
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${TONE} 55%, transparent), inset 0 1px 0 rgba(255,255,255,.1), 0 0 24px -6px color-mix(in srgb, ${TONE} 45%, transparent)`,
              }
            : undefined
        }
      >
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Jawab dengan bahasamu sendiri…"
          rows={5}
          className="w-full bg-transparent outline-none resize-none px-4 py-3.5
            text-[13.5px] leading-[1.7] text-hi placeholder-ink-500 scroll-ink"
        />
      </div>

      <SectionLabel>Antre setelah ini</SectionLabel>
      <ol className="space-y-2.5">
        {questions.slice(1).map((q, i) => (
          <li key={q} className="flex gap-2.5 text-[12.5px] text-lo leading-snug">
            <span className="font-mono text-[10.5px] text-ink-500 mt-px shrink-0">
              0{i + 2}
            </span>
            {q}
          </li>
        ))}
      </ol>
    </PanelBody>
  );
};
