import React from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { GhostButton, PrimaryButton, SectionLabel } from '../../ui/primitives';
import { MODE_COLOR } from '../../../engine/coeTypes';
import { COMPARISON } from '../../../engine/coeScript';

interface Props {
  summary: string;
  onContinue: () => void;
  onEnd: () => void;
}

const TONE = MODE_COLOR.comparison;
const OK = MODE_COLOR.reflective;

export const ComparisonStep: React.FC<Props> = ({ summary, onContinue, onEnd }) => (
  <PanelBody
    eyebrow="Sub-modul 3 · Reflective Prompt Builder"
    tone={TONE}
    title={<>Sekarang bandingkan</>}
    lede={
      <>
        Rangkumanmu disandingkan dengan respons mentah tadi. Menilai selisih
        antara dua versi ini melatih evaluasi metakognitif dan meruntuhkan
        illusion of certainty.
      </>
    }
    action={
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <PrimaryButton onClick={onContinue} tone={TONE}>
          Lanjutkan sesi
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
        <GhostButton onClick={onEnd}>Akhiri</GhostButton>
      </div>
    }
  >
    {/* Rangkuman pengguna */}
    <div className="rounded-2xl glass-soft px-4 py-3.5">
      <div className="text-[11.5px] font-medium text-lo mb-2">Rangkumanmu</div>
      <p className="text-[12.5px] leading-[1.7] text-mid line-clamp-3">
        {summary}
      </p>
    </div>

    {/* Yang tertangkap */}
    <SectionLabel tone={OK}>Sudah tertangkap</SectionLabel>
    <ul className="space-y-2.5">
      {COMPARISON.hit.map((h, i) => (
        <li
          key={h}
          className="flex gap-2.5 anim-rise"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span
            className="w-[18px] h-[18px] rounded-full shrink-0 mt-px flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${OK} 20%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${OK} 35%, transparent)`,
            }}
          >
            <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: OK }} />
          </span>
          <span className="text-[12.5px] leading-[1.6] text-mid">{h}</span>
        </li>
      ))}
    </ul>

    {/* Yang terlewat */}
    <SectionLabel tone={TONE}>Belum tercakup</SectionLabel>
    <div className="space-y-2">
      {COMPARISON.miss.map((m, i) => (
        <div
          key={m.title}
          className="rounded-2xl px-4 py-3.5 anim-rise backdrop-blur-md glass-tint"
          style={{
            ['--tint' as string]: TONE,
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div className="flex items-start gap-2 mb-1.5">
            <Plus
              className="w-3.5 h-3.5 mt-px shrink-0"
              strokeWidth={2.6}
              style={{ color: TONE }}
            />
            <h3 className="font-display text-[13.5px] font-semibold text-hi leading-snug -tracking-[.01em]">
              {m.title}
            </h3>
          </div>
          <p className="text-[12.5px] leading-[1.65] text-mid pl-[22px]">
            {m.body}
          </p>
        </div>
      ))}
    </div>

    {/* Intisari */}
    <div className="rounded-2xl glass-soft px-4 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-1 h-1 rounded-full"
          style={{ background: TONE, boxShadow: `0 0 8px ${TONE}` }}
        />
        <span className="text-[11.5px] font-medium text-lo">Intisari</span>
      </div>
      <p className="font-display text-[15.5px] font-medium leading-[1.5] -tracking-[.01em] text-hi">
        {COMPARISON.takeaway}
      </p>
    </div>
  </PanelBody>
);
