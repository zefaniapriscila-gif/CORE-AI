import React from 'react';
import { PanelBody } from '../CorePanel';

interface Props {
  eyebrow: string;
  tone: string;
  title: React.ReactNode;
  lede: React.ReactNode;
}

/**
 * Tampilan sementara saat model masih menyusun isi tahap.
 *
 * Kerangkanya sengaja meniru proporsi isi aslinya supaya panel tidak melompat
 * tinggi begitu jawabannya tiba.
 */
export const LoadingStep: React.FC<Props> = ({ eyebrow, tone, title, lede }) => (
  <PanelBody eyebrow={eyebrow} tone={tone} title={title} lede={lede}>
    <div className="flex items-center pt-1">
      <span className="font-mono text-[10.5px]" style={{ color: tone }}>
        gemini-2.5-flash menyusun respons…
      </span>
    </div>

    <div className="space-y-2 pt-1">
      {[100, 88, 94, 72].map((w, i) => (
        <div
          key={i}
          className="relative h-3 rounded-full bg-black/[.06] overflow-hidden anim-sweep"
          style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>

    <div className="rounded-2xl glass-soft px-4 py-4 space-y-2">
      {[92, 78, 85].map((w, i) => (
        <div
          key={i}
          className="relative h-3 rounded-full bg-black/[.06] overflow-hidden anim-sweep"
          style={{ width: `${w}%`, animationDelay: `${(i + 4) * 90}ms` }}
        />
      ))}
    </div>
  </PanelBody>
);
