import React from 'react';
import { ArrowRight, Hand } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { PrimaryButton, SectionLabel } from '../../ui/primitives';
import { MODE_COLOR } from '../../../engine/coeTypes';

interface Props {
  heldQuestion: string;
  onProceed: () => void;
}

const TONE = MODE_COLOR.intercept;

export const InterceptStep: React.FC<Props> = ({ heldQuestion, onProceed }) => (
  <PanelBody
    eyebrow="Sub-modul 1 · Session Manager"
    tone={TONE}
    title={<>Pertanyaanmu ditahan dulu</>}
    lede={
      <>
        Kamu menumpuk pertanyaan baru sebelum mengolah jawaban sebelumnya.
        Persis di sinilah cognitive offloading terjadi. Pengirimannya kami tahan
        — bukan dibatalkan.
      </>
    }
    action={
      <PrimaryButton onClick={onProceed} tone={TONE}>
        Mulai alur kognitif
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
    }
  >
    <SectionLabel tone={TONE}>Antrean tertahan</SectionLabel>

    <div
      className="rounded-2xl p-4 flex gap-3 backdrop-blur-md glass-tint"
      style={{ ['--tint' as string]: TONE }}
    >
      <Hand className="w-4 h-4 shrink-0 mt-0.5" style={{ color: TONE }} />
      <p className="text-[13px] leading-[1.6] text-hi">{heldQuestion}</p>
    </div>

    <div className="rounded-2xl glass-soft overflow-hidden">
      {[
        ['submit event', 'preventDefault()'],
        ['status antrean', 'HELD'],
        ['tujuan berikutnya', 'Socratic Mode'],
      ].map(([k, v], i) => (
        <div
          key={k}
          className={`flex items-center justify-between px-3.5 py-2.5 ${
            i < 2 ? 'hairline' : ''
          }`}
        >
          <span className="text-[12.5px] text-lo">{k}</span>
          <span className="font-mono text-[11px]" style={{ color: TONE }}>
            {v}
          </span>
        </div>
      ))}
    </div>

    <p className="text-[12.5px] text-lo leading-relaxed">
      Pertanyaan ini akan dikirim otomatis setelah kamu melewati alur kognitif.
      Tidak ada yang hilang.
    </p>
  </PanelBody>
);
