import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export const SoundToggle: React.FC = () => {
  const [muted, setMuted] = useState(() => soundEngine.getMuted());

  useEffect(() => {
    // Subscribe to soundEngine changes across all instances
    const unsubscribe = soundEngine.subscribe((isMuted) => {
      setMuted(isMuted);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.toggleMute();
  };

  return (
    <button
      onClick={handleToggle}
      data-no-sound="true"
      title={muted ? 'Aktifkan Suara Effect (Low & Crunchy)' : 'Matikan Suara Effect'}
      aria-label="Toggle Sound Effects"
      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
        muted
          ? 'text-lo hover:text-mid hover:bg-black/[.06]'
          : 'text-core-600 hover:bg-core-500/10 active:scale-95'
      }`}
    >
      {muted ? <VolumeX className="w-5 h-5 opacity-60" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
};
