import React, { useMemo, useState } from 'react';
import { ArrowRight, ClipboardX, Lock, TriangleAlert } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { Meter, PrimaryButton } from '../../ui/primitives';
import { MODE_COLOR, ValidationResult } from '../../../engine/coeTypes';
import {
  calculateSemanticSimilarity,
  countWords,
  MAX_SIMILARITY,
  MIN_WORDS,
  validateUserSummary,
} from '../../../engine/dualLayerValidator';

interface Props {
  rawResponse: string;
  initialSummary?: string;
  onSubmit: (summary: string) => void;
}

const TONE = MODE_COLOR.reflective;
const DANGER = MODE_COLOR.intercept;

export const ReflectiveStep: React.FC<Props> = ({
  rawResponse,
  initialSummary = '',
  onSubmit,
}) => {
  const [text, setText] = useState(initialSummary);
  const [focused, setFocused] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const words = countWords(text);
  const similarity = useMemo(
    () => Math.round(calculateSemanticSimilarity(text, rawResponse) * 100),
    [text, rawResponse]
  );

  const lengthOk = words >= MIN_WORDS;
  const similarityOk = similarity < MAX_SIMILARITY;

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setPasteBlocked(true);
    window.setTimeout(() => setPasteBlocked(false), 2600);
  };

  const handleSubmit = () => {
    const r = validateUserSummary(text, rawResponse);
    setResult(r);
    if (r.isValid) onSubmit(text.trim());
  };

  const fieldGlow = pasteBlocked
    ? DANGER
    : focused
    ? TONE
    : null;

  return (
    <PanelBody
      eyebrow="Sub-modul 2 · Dual-Layer Validator"
      tone={TONE}
      title={<>Tulis ulang isinya, dari kepalamu</>}
      lede={
        <>
          Mengingat kembali jauh lebih berat daripada mengenali. Beban itulah
          yang memperkuat jejak memori.
        </>
      }
      action={
        <div className="space-y-3">
          {/* Gauge dua lapis ikut menempel supaya selalu terbaca saat mengetik */}
          <div className="grid grid-cols-2 gap-3">
            <LayerGauge
              name="Length"
              reading={`${words}`}
              target={`/ ${MIN_WORDS} kata`}
              ok={lengthOk}
              value={words}
              max={MIN_WORDS}
              tone={TONE}
            />
            <LayerGauge
              name="Similarity"
              reading={`${similarity}%`}
              target={`maks ${MAX_SIMILARITY}%`}
              ok={similarityOk}
              value={similarity}
              max={100}
              tone={TONE}
              danger={!similarityOk}
            />
          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={words < 5}
            tone={lengthOk && similarityOk ? TONE : 'var(--color-core-500)'}
          >
            Validasi rangkuman
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </div>
      }
    >
      <div
        className="rounded-xl px-3 py-2 flex items-center gap-2 backdrop-blur-md glass-tint"
        style={{ ['--tint' as string]: DANGER }}
      >
        <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: DANGER }} />
        <p className="text-[11.5px] text-mid truncate">
          <span className="font-mono text-[10.5px]" style={{ color: DANGER }}>
            user-select: none
          </span>{' '}
          aktif · paste diblokir
        </p>
      </div>

      {/* Kolom rangkuman */}
      <div
        className={`rounded-2xl glass-soft transition-shadow ${
          pasteBlocked ? 'anim-nudge' : ''
        }`}
        style={
          fieldGlow
            ? {
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${fieldGlow} 55%, transparent), inset 0 1px 0 rgba(255,255,255,.1), 0 0 24px -6px color-mix(in srgb, ${fieldGlow} 50%, transparent)`,
              }
            : undefined
        }
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={4}
          placeholder="Rangkum jawaban tadi dengan kalimatmu sendiri…"
          className="w-full bg-transparent outline-none resize-none px-4 py-3.5
            text-[13.5px] leading-[1.7] text-hi placeholder-ink-500 scroll-ink"
        />
      </div>

      {pasteBlocked && (
        <div
          className="flex items-center gap-2 text-[12px] font-medium anim-rise"
          style={{ color: DANGER }}
        >
          <ClipboardX className="w-3.5 h-3.5 shrink-0" />
          Paste diblokir. Rangkuman harus kamu susun sendiri.
        </div>
      )}

      {result && !result.isValid && (
        <div
          className="rounded-2xl px-3.5 py-3 flex items-start gap-2.5 anim-rise backdrop-blur-md glass-tint"
          style={{ ['--tint' as string]: DANGER }}
        >
          <TriangleAlert
            className="w-3.5 h-3.5 mt-0.5 shrink-0"
            style={{ color: DANGER }}
          />
          <p className="text-[12.5px] leading-relaxed text-hi">
            {result.errorMessage}
          </p>
        </div>
      )}
    </PanelBody>
  );
};

/* -------------------------------------------------------------------------- */

/** Gauge ringkas — dua berdampingan supaya muat di zona aksi yang menempel. */
const LayerGauge: React.FC<{
  name: string;
  reading: string;
  target: string;
  ok: boolean;
  value: number;
  max: number;
  tone: string;
  danger?: boolean;
}> = ({ name, reading, target, ok, value, max, tone, danger }) => (
  <div className="space-y-1.5 min-w-0">
    <div className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-[11.5px] text-lo shrink-0">{name}</span>
      <span
        className="ml-auto font-mono text-[12px] shrink-0"
        style={{ color: ok ? tone : danger ? DANGER : 'var(--color-mid)' }}
      >
        {reading}
      </span>
      <span className="font-mono text-[9.5px] text-ink-500 shrink-0">
        {target}
      </span>
    </div>
    <Meter value={value} max={max} tone={tone} danger={danger} />
  </div>
);
