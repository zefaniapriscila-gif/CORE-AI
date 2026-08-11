import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserChrome } from './components/chrome/BrowserChrome';
import { ExtensionPopup } from './components/chrome/ExtensionPopup';
import { GeminiSurface } from './components/gemini/GeminiSurface';
import { CorePanel } from './components/panel/CorePanel';
import { IdleStep, NormalStep } from './components/panel/steps/StandbyStep';
import { InterceptStep } from './components/panel/steps/InterceptStep';
import { SocraticStep } from './components/panel/steps/SocraticStep';
import { ReflectiveStep } from './components/panel/steps/ReflectiveStep';
import { ComparisonStep } from './components/panel/steps/ComparisonStep';
import { ScaffoldStep } from './components/panel/steps/ScaffoldStep';
import { RatingStep } from './components/panel/steps/RatingStep';
import { PresenterDock } from './components/presenter/PresenterDock';
import { TheorySheet } from './components/presenter/TheorySheet';
import { PanelBody } from './components/panel/CorePanel';
import { PrimaryButton } from './components/ui/primitives';
import { Stage, STAGE_ORDER, stepOf, Turn, UserGoal } from './engine/coeTypes';
import {
  CONSOLE_LINES,
  FOLLOW_UP,
  GEMINI_ANSWER,
  GOALS,
  QUESTION,
  REFLECTIVE_SAMPLE_SUMMARY,
  SOCRATIC_QUESTIONS,
  SOCRATIC_SAMPLE_ANSWER,
} from './engine/coeScript';
import { countWords } from './engine/dualLayerValidator';

/** Tahapan yang menampilkan side panel. Sebelum ini, hanya popup toolbar. */
const PANEL_STAGES: Stage[] = STAGE_ORDER.filter((s) => s !== 'goal');

/**
 * Isi thread Gemini diturunkan dari tahap, bukan ditumpuk lewat mutasi.
 * Dengan begitu presenter bisa melompat maju-mundur tanpa state kotor.
 */
function buildTurns(stage: Stage): Turn[] {
  const q: Turn = { id: 'q', role: 'user', text: QUESTION };
  const a: Turn = { id: 'a', role: 'gemini', text: GEMINI_ANSWER, locked: true };
  const heldFollowUp: Turn = {
    id: 'f',
    role: 'user',
    text: FOLLOW_UP,
    held: true,
  };
  const sentFollowUp: Turn = { id: 'f', role: 'user', text: FOLLOW_UP };
  const handover: Turn = {
    id: 'c',
    role: 'core',
    text: 'Pertanyaan yang tadi ditahan sudah dilepas. Responsnya tidak diberikan utuh — Scaffold Prompt Builder memecahnya jadi petunjuk bertahap di panel kanan.',
  };

  switch (stage) {
    case 'goal':
      return [];
    case 'normal':
      return [q, a];
    case 'intercept':
    case 'socratic':
    case 'reflective':
    case 'comparison':
      return [q, a, heldFollowUp];
    case 'scaffold':
    case 'rating':
      return [q, a, sentFollowUp, handover];
    default:
      return [];
  }
}

export default function App() {
  const [stage, setStage] = useState<Stage>('goal');
  const [reached, setReached] = useState<Set<Stage>>(new Set(['goal']));
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [popupOpen, setPopupOpen] = useState(true);

  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  const [socraticAnswer, setSocraticAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [theoryOpen, setTheoryOpen] = useState(false);

  const step = stepOf(stage);
  const turns = useMemo(() => buildTurns(stage), [stage]);
  const panelVisible = PANEL_STAGES.includes(stage);
  const coeOn = goal === 'instrumental';

  /* --- Navigasi ------------------------------------------------------- */

  const go = useCallback((next: Stage) => {
    setStage(next);
    setReached((prev) => new Set(prev).add(next));
    setThinking(false);

    // Lompat maju: isi state tahap sebelumnya dengan contoh agar layar utuh.
    const i = STAGE_ORDER.indexOf(next);
    if (i >= STAGE_ORDER.indexOf('normal')) setGoal('instrumental');
    if (i > STAGE_ORDER.indexOf('socratic')) {
      setSocraticAnswer((v) => v || SOCRATIC_SAMPLE_ANSWER);
    }
    if (i > STAGE_ORDER.indexOf('reflective')) {
      setSummary((v) => v || REFLECTIVE_SAMPLE_SUMMARY);
    }
    setPopupOpen(next === 'goal');
    setDraft(next === 'normal' ? FOLLOW_UP : '');
  }, []);

  const idx = STAGE_ORDER.indexOf(stage);
  const goPrev = useCallback(() => {
    if (idx > 0) go(STAGE_ORDER[idx - 1]);
  }, [idx, go]);
  const goNext = useCallback(() => {
    if (idx < STAGE_ORDER.length - 1) go(STAGE_ORDER[idx + 1]);
  }, [idx, go]);

  const reset = useCallback(() => {
    setStage('goal');
    setReached(new Set(['goal']));
    setGoal(null);
    setPopupOpen(true);
    setDraft('');
    setSocraticAnswer('');
    setSummary('');
    setRating(0);
    setRatingSubmitted(false);
    setTheoryOpen(false);
  }, []);

  /* --- Pintasan keyboard untuk presenter ------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement;

      if (e.key === 'Escape') return setTheoryOpen(false);
      if (typing) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key.toLowerCase() === 't') setTheoryOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  /* --- Aksi ------------------------------------------------------------ */

  const pickGoal = (g: UserGoal) => {
    setGoal(g);
    setPopupOpen(false);
    if (GOALS.find((o) => o.id === g)?.activatesCoe) {
      setThinking(true);
      setStage('normal');
      setReached((prev) => new Set(prev).add('normal'));
      window.setTimeout(() => {
        setThinking(false);
        setDraft(FOLLOW_UP);
      }, 1500);
    }
  };

  /** Enter di composer Gemini saat Normal Mode memicu interception. */
  const submitDraft = () => {
    if (stage === 'normal' && draft.trim()) go('intercept');
  };

  const metrics = [
    { value: String(SOCRATIC_QUESTIONS.length), label: 'pertanyaan pemantik' },
    {
      value: `${countWords(summary || REFLECTIVE_SAMPLE_SUMMARY)} kata`,
      label: 'rangkuman tervalidasi',
    },
    { value: '3', label: 'counterargument ditinjau' },
    { value: '1', label: 'respons di-scaffold' },
  ];

  /* --- Isi panel per tahap --------------------------------------------- */

  const renderPanel = () => {
    switch (stage) {
      case 'normal':
        return <NormalStep extracted={GEMINI_ANSWER} />;
      case 'intercept':
        return <InterceptStep heldQuestion={FOLLOW_UP} onProceed={goNext} />;
      case 'socratic':
        return (
          <SocraticStep
            questions={SOCRATIC_QUESTIONS}
            initialAnswer={socraticAnswer}
            onSubmit={(a) => {
              setSocraticAnswer(a);
              go('reflective');
            }}
          />
        );
      case 'reflective':
        return (
          <ReflectiveStep
            rawResponse={GEMINI_ANSWER}
            initialSummary={summary}
            onSubmit={(s) => {
              setSummary(s);
              go('comparison');
            }}
          />
        );
      case 'comparison':
        return (
          <ComparisonStep
            summary={summary || REFLECTIVE_SAMPLE_SUMMARY}
            onContinue={() => go('scaffold')}
            onEnd={() => go('rating')}
          />
        );
      case 'scaffold':
        return <ScaffoldStep question={FOLLOW_UP} onEnd={() => go('rating')} />;
      case 'rating':
        return (
          <RatingStep
            metrics={metrics}
            rating={rating}
            submitted={ratingSubmitted}
            onSubmit={(r) => {
              setRating(r);
              setRatingSubmitted(true);
            }}
          />
        );
      default:
        return <IdleStep />;
    }
  };

  /* --- Layar ------------------------------------------------------------ */

  return (
    <div className="h-full w-full flex flex-col bg-[#06060a] relative overflow-hidden">
      {/* Cahaya panggung */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(110% 70% at 22% -8%, rgba(123,140,255,.16), transparent 58%), radial-gradient(90% 60% at 85% 105%, rgba(76,194,255,.11), transparent 62%), radial-gradient(70% 50% at 65% 40%, rgba(157,139,255,.07), transparent 70%)',
        }}
      />

      <div className="flex-1 min-h-0 p-6 pb-2 relative">
        <BrowserChrome
          extensionActive={coeOn}
          attention={stage === 'goal' && !goal}
          panelOpen={panelVisible}
          onTogglePanel={() =>
            stage === 'goal' ? setPopupOpen((v) => !v) : undefined
          }
          popup={
            popupOpen && stage === 'goal' ? (
              <ExtensionPopup onSelect={pickGoal} selected={goal} />
            ) : undefined
          }
        >
          <GeminiSurface
            turns={turns}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={submitDraft}
            intercepted={stage === 'intercept'}
            locked={stage === 'reflective'}
            thinking={thinking}
            coeActive={coeOn && panelVisible}
          />

          {panelVisible && step && (
            <CorePanel
              mode={step.mode}
              module={step.module}
              consoleLines={CONSOLE_LINES[stage] ?? []}
            >
              {renderPanel()}
            </CorePanel>
          )}
        </BrowserChrome>

        {/* Panel penolakan saat tujuan non-instrumental dipilih */}
        {stage === 'goal' && goal && goal !== 'instrumental' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto relative w-[390px] rounded-3xl overflow-hidden bg-ink-950 anim-pop">
              <div
                className="aurora"
                style={{
                  ['--tint' as string]: 'var(--color-lo)',
                  ['--tint2' as string]: 'var(--color-core-500)',
                }}
              />
              <div className="relative glass rounded-3xl">
                <PanelBody
                  eyebrow="COE dinonaktifkan"
                  title={<>Kali ini CORE AI menyingkir</>}
                  lede={
                    <>
                      Tujuanmu bukan instrumental. Menambah friksi pada
                      percakapan ringan hanya membebani tanpa manfaat belajar —
                      jadi ekstensi tidak ikut campur.
                    </>
                  }
                >
                  <PrimaryButton onClick={() => setPopupOpen(true)}>
                    Pilih tujuan lain
                  </PrimaryButton>
                </PanelBody>
              </div>
            </div>
          </div>
        )}

        <TheorySheet
          stage={stage}
          open={theoryOpen}
          onClose={() => setTheoryOpen(false)}
        />
      </div>

      <PresenterDock
        stage={stage}
        reached={reached}
        onGo={go}
        onPrev={goPrev}
        onNext={goNext}
        onReset={reset}
        theoryOpen={theoryOpen}
        onToggleTheory={() => setTheoryOpen((v) => !v)}
      />
    </div>
  );
}
