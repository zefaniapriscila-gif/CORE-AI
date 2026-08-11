import React from 'react';

let uid = 0;

/** Bintang empat sudut khas Gemini, digambar sendiri agar tidak bergantung aset eksternal. */
export const GeminiSpark: React.FC<{ className?: string; flat?: string }> = ({
  className = 'w-5 h-5',
  flat,
}) => {
  const id = React.useMemo(() => `gspark-${++uid}`, []);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {!flat && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="45%" stopColor="#9B72CB" />
            <stop offset="100%" stopColor="#D96570" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 1.6c0 5.74 4.66 10.4 10.4 10.4-5.74 0-10.4 4.66-10.4 10.4 0-5.74-4.66-10.4-10.4-10.4C7.34 12 12 7.34 12 1.6Z"
        fill={flat ?? `url(#${id})`}
      />
    </svg>
  );
};
