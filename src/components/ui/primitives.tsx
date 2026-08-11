import React from 'react';

type Tone = { tone?: string };

/**
 * Tombol utama. Kaca bertinta, bukan blok warna penuh — supaya menyatu
 * dengan permukaan panel dan tidak berteriak seperti tombol iklan.
 */
export const PrimaryButton: React.FC<
  Tone & {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    full?: boolean;
    className?: string;
  }
> = ({
  children,
  onClick,
  disabled,
  tone = 'var(--color-core-500)',
  full = true,
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={
      disabled
        ? undefined
        : {
            background: `linear-gradient(175deg, color-mix(in srgb, ${tone} 30%, transparent), color-mix(in srgb, ${tone} 13%, transparent))`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px color-mix(in srgb, ${tone} 42%, transparent), 0 8px 24px -8px color-mix(in srgb, ${tone} 55%, transparent)`,
          }
    }
    className={`${full ? 'w-full' : ''} h-11 px-5 rounded-2xl text-[13.5px] font-medium text-white
      inline-flex items-center justify-center gap-2 transition-all duration-200 backdrop-blur-md
      hover:brightness-125 active:scale-[.985]
      disabled:bg-white/4 disabled:text-lo disabled:shadow-none disabled:cursor-not-allowed
      disabled:hover:brightness-100 ${className}`}
  >
    {children}
  </button>
);

/** Tombol sekunder — kaca polos. */
export const GhostButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`h-11 px-5 rounded-2xl text-[13.5px] font-medium text-mid glass-soft backdrop-blur-md
      inline-flex items-center justify-center gap-2 transition-all duration-200
      hover:bg-white/8 hover:text-hi active:scale-[.985] ${className}`}
  >
    {children}
  </button>
);

/** Label seksi: titik berwarna + teks kalimat biasa + garis rambut. */
export const SectionLabel: React.FC<{
  children: React.ReactNode;
  tone?: string;
}> = ({ children, tone = 'var(--color-lo)' }) => (
  <div className="flex items-center gap-2.5 pt-1">
    <span
      className="w-1 h-1 rounded-full shrink-0"
      style={{ background: tone }}
    />
    <span className="text-[11.5px] font-medium tracking-wide text-lo shrink-0">
      {children}
    </span>
    <span className="h-px flex-1 bg-white/7" />
  </div>
);

/** Chip kaca kecil. */
export const Chip: React.FC<{
  children: React.ReactNode;
  tone?: string;
}> = ({ children, tone = 'var(--color-core-500)' }) => (
  <span
    className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-[11.5px] font-medium whitespace-nowrap backdrop-blur-md"
    style={{
      color: tone,
      background: `color-mix(in srgb, ${tone} 14%, transparent)`,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 26%, transparent), inset 0 1px 0 rgba(255,255,255,.1)`,
    }}
  >
    {children}
  </span>
);

/** Titik status berdenyut dengan halo lembut. */
export const Pulse: React.FC<{ tone?: string; size?: number }> = ({
  tone = 'var(--color-core-500)',
  size = 6,
}) => (
  <span
    className="rounded-full anim-blink shrink-0"
    style={{
      width: size,
      height: size,
      background: tone,
      boxShadow: `0 0 10px ${tone}`,
    }}
  />
);

/** Meteran tipis untuk metrik validasi. */
export const Meter: React.FC<{
  value: number;
  max?: number;
  tone: string;
  danger?: boolean;
}> = ({ value, max = 100, tone, danger = false }) => {
  const c = danger ? 'var(--color-mode-intercept)' : tone;
  return (
    <div className="h-1.5 w-full rounded-full bg-white/7 overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          background: `linear-gradient(90deg, color-mix(in srgb, ${c} 55%, transparent), ${c})`,
          boxShadow: `0 0 12px color-mix(in srgb, ${c} 60%, transparent)`,
        }}
      />
    </div>
  );
};
