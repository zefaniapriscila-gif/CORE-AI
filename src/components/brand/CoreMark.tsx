import React from 'react';
import { ModeKey } from '../../engine/coeTypes';

/**
 * Logo CORE AI.
 * Cincin terbuka (orkestrasi yang menyisakan celah untuk masukan AI),
 * inti padat di tengah (kognisi pengguna yang dijaga tetap aktif),
 * satu satelit di mulut celah.
 */
export const CoreMark: React.FC<{ className?: string; strokeWidth?: number }> = ({
  className = 'w-6 h-6',
  strokeWidth = 2.1,
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M18.4 6.1A8.6 8.6 0 1 0 20.6 12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <circle cx="20.1" cy="4.6" r="2.15" fill="currentColor" />
  </svg>
);

/** Versi kotak untuk ikon toolbar browser — punya latar sendiri. */
export const CoreIconTile: React.FC<{
  className?: string;
  active?: boolean;
}> = ({ className = 'w-7 h-7', active = false }) => (
  <div
    className={`${className} rounded-lg flex items-center justify-center transition-colors ${
      active
        ? 'bg-ink-900 text-core-500'
        : 'bg-paper-200 text-paper-mid hover:bg-paper-300'
    }`}
  >
    <CoreMark className="w-[68%] h-[68%]" strokeWidth={2.4} />
  </div>
);

/* --------------------------------------------------------------------------
   Glyph per mode kognitif. Digambar sendiri agar tiap mode punya bentuk
   yang tidak tertukar — bukan ikon generik yang dipakai ulang.
   -------------------------------------------------------------------------- */

type GlyphProps = { className?: string };

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Aliran yang membentur dinding — pengiriman ditahan. */
const InterceptGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M2.5 10h7M7 7.2 9.8 10 7 12.8" {...S} />
    <path d="M14 3.6v12.8" {...S} strokeWidth={2.6} />
    <path d="M17 6.4v7.2" {...S} strokeWidth={1.4} opacity={0.5} />
  </svg>
);

/** Tanda tanya geometris — pertanyaan pemantik. */
const SocraticGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M6.6 6.9a3.4 3.4 0 1 1 3.4 3.5v1.9" {...S} />
    <circle cx="10" cy="15.6" r="1.15" fill="currentColor" />
  </svg>
);

/** Lingkaran yang kembali ke pusat — retrieval practice. */
const ReflectiveGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M16.2 8.4A6.5 6.5 0 1 0 15.4 13" {...S} />
    <path d="M16.6 4.6v3.9h-3.9" {...S} />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
  </svg>
);

/** Lingkaran terbelah — dua pemahaman disandingkan. */
const ComparisonGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <circle cx="10" cy="10" r="6.6" {...S} />
    <path d="M10 3.4a6.6 6.6 0 0 1 0 13.2z" fill="currentColor" />
  </svg>
);

/** Anak tangga menanjak, pijakan terakhir putus — bantuan bertahap. */
const ScaffoldGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M2.6 16h4.2v-4.4h4.2V7.2" {...S} />
    <path d="M11 7.2h4.2V3.4" {...S} strokeDasharray="2.4 2.4" />
    <circle cx="15.2" cy="3.4" r="1.5" fill="currentColor" />
  </svg>
);

const GLYPHS: Record<ModeKey, React.FC<GlyphProps>> = {
  intercept: InterceptGlyph,
  socratic: SocraticGlyph,
  reflective: ReflectiveGlyph,
  comparison: ComparisonGlyph,
  scaffold: ScaffoldGlyph,
};

export const ModeGlyph: React.FC<{ mode: ModeKey; className?: string }> = ({
  mode,
  className = 'w-5 h-5',
}) => {
  const G = GLYPHS[mode];
  return <G className={className} />;
};
