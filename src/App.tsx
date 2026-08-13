import React, { useState } from 'react';
import { DotField } from './components/site/DotField';
import { SiteHeader } from './components/site/SiteHeader';
import { AboutView } from './views/AboutView';
import { LandingView } from './views/LandingView';
import { MethodologyView } from './views/MethodologyView';
import { SimulationView } from './views/SimulationView';
import { SiteView } from './engine/siteTypes';
import { SoundProvider } from './utils/SoundProvider';

/**
 * Cangkang situs. Simulasi mengambil alih layar penuh dengan kromnya sendiri;
 * halaman statis berbagi satu kerangka: kepala + isi setinggi layar, tanpa scroll.
 */
export default function App() {
  const [view, setView] = useState<SiteView>('landing');

  return (
    <SoundProvider>
      {view === 'simulasi' ? (
        <SimulationView onHome={() => setView('landing')} />
      ) : (
        <div className="h-full w-full flex flex-col bg-stage relative overflow-hidden">
          {/* Semburat warna panggung, di bawah titik-titik */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(80% 55% at 18% 0%, rgba(47,75,220,.09), transparent 60%), radial-gradient(70% 55% at 88% 100%, rgba(10,154,134,.08), transparent 62%)',
            }}
          />

          <DotField />

          <SiteHeader view={view} onNavigate={setView} />

          {view === 'landing' && <LandingView onNavigate={setView} />}
          {view === 'metodologi' && <MethodologyView onNavigate={setView} />}
          {view === 'tentang' && <AboutView onNavigate={setView} />}
        </div>
      )}
    </SoundProvider>
  );
}
