import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { PrimaryButton, SectionLabel } from '../../ui/primitives';
import { MODE_COLOR } from '../../../engine/coeTypes';

interface Props {
  question: string;
  hints: string[];
  partial: string;
  onEnd: () => void;
}

const TONE = MODE_COLOR.scaffold;

export const ScaffoldStep: React.FC<Props> = ({
  question,
  hints,
  partial,
  onEnd,
}) => (
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

    <SectionLabel tone={TONE}>Penjelasan</SectionLabel>

    <div
      className="rounded-2xl px-4 py-4 core-no-copy backdrop-blur-md glass-tint"
      style={{ ['--tint' as string]: TONE }}
    >
      <p className="text-[13px] leading-[1.75] text-hi">
        <strong>Scaffolding Mode memberikan bantuan yang disesuaikan dengan kebutuhan dan kemampuan pengguna.</strong> Ketika pertanyaan lanjutan diajukan, CORE AI tidak lagi memberikan jawaban secara menyeluruh, melainkan mengurangi tingkat bantuan dan menyajikan petunjuk secara bertahap berdasarkan informasi yang telah diberikan sebelumnya. Dengan demikian, pengguna tetap memiliki ruang untuk menghubungkan informasi dan membangun pemahamannya sendiri.
      </p>
    </div>
  </PanelBody>
);
