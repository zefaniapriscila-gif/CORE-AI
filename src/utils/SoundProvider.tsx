import React, { useEffect } from 'react';
import { soundEngine, findInteractiveElement } from './soundEngine';

/**
 * SoundProvider Component
 * Attaches global hover and click event listeners to play low, satisfying, crunchy sounds.
 */
export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    let lastHoveredElem: Element | null = null;
    let lastHoverTime = 0;

    const handlePointerOver = (e: PointerEvent | MouseEvent) => {
      if (soundEngine.getMuted()) return;

      const interactiveElem = findInteractiveElement(e.target);
      if (!interactiveElem) {
        lastHoveredElem = null;
        return;
      }

      // Prevent re-triggering sound if moving between child elements inside the same interactive target
      if (interactiveElem === lastHoveredElem) return;

      const now = performance.now();
      // Throttle minimum time between hover sound triggers (30ms)
      if (now - lastHoverTime < 30) return;

      lastHoveredElem = interactiveElem;
      lastHoverTime = now;

      soundEngine.playHover();
    };

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      soundEngine.initContext();
      if (soundEngine.getMuted()) return;

      const interactiveElem = findInteractiveElement(e.target);
      if (interactiveElem) {
        soundEngine.playClick();
      }
    };

    // Attach passive capture-phase listeners to capture interactions globally across all components
    window.addEventListener('pointerover', handlePointerOver, { capture: true, passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerover', handlePointerOver, { capture: true });
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    };
  }, []);

  return <>{children}</>;
};
