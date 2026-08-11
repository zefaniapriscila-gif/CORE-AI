import React, { useState } from 'react';
import { Check, CloudUpload, Star } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { PrimaryButton, SectionLabel } from '../../ui/primitives';
import { RATING_LABELS } from '../../../engine/coeScript';
import { CoreMark } from '../../brand/CoreMark';

interface Props {
  metrics: { label: string; value: string }[];
  onSubmit: (rating: number) => void;
  submitted: boolean;
  rating: number;
}

const TONE = 'var(--color-core-500)';

export const RatingStep: React.FC<Props> = ({
  metrics,
  onSubmit,
  submitted,
  rating,
}) => {
  const [hover, setHover] = useState(0);
  const [picked, setPicked] = useState(rating);
  const shown = hover || picked;

  if (submitted) {
    return (
      <PanelBody
        eyebrow="Sesi tersinkronisasi"
        title={<>Sampai jumpa di sesi berikutnya</>}
        lede={
          <>
            Rating {picked}/5 terkirim. Metrik sesi disimpan ke akunmu untuk
            menghitung Net Promoter Score dan skor usabilitas.
          </>
        }
      >
        <div className="rounded-2xl glass-soft p-5 text-center">
          <span
            className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-3.5 backdrop-blur-md"
            style={{
              color: 'var(--color-core-400)',
              background: `color-mix(in srgb, ${TONE} 18%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${TONE} 35%, transparent), 0 0 30px -8px ${TONE}`,
            }}
          >
            <CoreMark className="w-6 h-6" />
          </span>
          <p className="font-display text-[17px] font-semibold leading-[1.4] -tracking-[.01em] text-hi">
            Hari ini kamu menarik kembali empat hal dari ingatanmu sendiri.
          </p>
          <p className="text-[12.5px] text-lo mt-2.5 leading-relaxed">
            Bukan Gemini yang mengingatnya untukmu.
          </p>
        </div>

        <MetricGrid metrics={metrics} />

        <div className="flex items-center gap-2 text-[12px] text-lo">
          <CloudUpload className="w-3.5 h-3.5 shrink-0" />
          disinkronkan ke akun · {new Date().toLocaleDateString('id-ID')}
        </div>
      </PanelBody>
    );
  }

  return (
    <PanelBody
      eyebrow="Akhir sesi"
      title={<>Seberapa membantu tadi?</>}
      lede={
        <>
          Jawabanmu masuk ke perhitungan Net Promoter Score, indikator utama
          keberhasilan implementasi.
        </>
      }
      action={
        <PrimaryButton onClick={() => onSubmit(picked)} disabled={picked === 0}>
          Kirim & sinkronkan
          <CloudUpload className="w-4 h-4" />
        </PrimaryButton>
      }
    >
      <div className="rounded-2xl glass-soft py-4">
        <div className="flex items-center justify-center gap-2.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setPicked(s)}
              className="transition-transform duration-150 hover:scale-115 active:scale-95"
            >
              <Star
                className="w-8 h-8 transition-all"
                strokeWidth={1.5}
                style={{
                  color: s <= shown ? 'var(--color-core-400)' : 'var(--color-ink-600)',
                  fill: s <= shown ? 'var(--color-core-400)' : 'transparent',
                  filter: s <= shown ? `drop-shadow(0 0 10px ${TONE})` : undefined,
                }}
              />
            </button>
          ))}
        </div>

        <p
          className="text-center text-[13px] font-medium h-5 mt-3 transition-colors"
          style={{ color: shown ? 'var(--color-core-400)' : 'var(--color-ink-600)' }}
        >
          {shown ? RATING_LABELS[shown] : 'Pilih bintang'}
        </p>
      </div>

      <SectionLabel>Metrik sesi</SectionLabel>
      <MetricGrid metrics={metrics} />
    </PanelBody>
  );
};

const MetricGrid: React.FC<{ metrics: { label: string; value: string }[] }> = ({
  metrics,
}) => (
  <div className="grid grid-cols-2 gap-2">
    {metrics.map((m) => (
      <div key={m.label} className="rounded-2xl glass-soft px-3.5 py-3">
        <div className="flex items-center gap-1.5">
          <Check
            className="w-3 h-3 text-mode-reflective shrink-0"
            strokeWidth={3}
          />
          <span className="font-display text-[14px] font-semibold text-hi -tracking-[.01em]">
            {m.value}
          </span>
        </div>
        <div className="text-[11px] text-lo mt-1 leading-tight">{m.label}</div>
      </div>
    ))}
  </div>
);
