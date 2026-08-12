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
import { LoadingStep } from './components/panel/steps/LoadingStep';
import { PresenterDock } from './components/presenter/PresenterDock';
import { TheorySheet } from './components/presenter/TheorySheet';
import { PanelBody } from './components/panel/CorePanel';
import { PrimaryButton } from './components/ui/primitives';
import {
  MODE_COLOR,
  Stage,
  STAGE_ORDER,
  stepOf,
  Turn,
  UserGoal,
} from './engine/coeTypes';
import {
  CONSOLE_LINES,
  FOLLOW_UP,
  GOALS,
  QUESTION,
  REFLECTIVE_SAMPLE_SUMMARY,
  SOCRATIC_SAMPLE_ANSWER,
} from './engine/coeScript';
import { countWords, estimateTokens } from './engine/dualLayerValidator';
import { useCoe } from './engine/useCoe';

/** Tahapan yang menampilkan side panel. Sebelum ini, hanya popup toolbar. */
const PANEL_STAGES: Stage[] = STAGE_ORDER.filter((s) => s !== 'goal');

/**
 * Isi thread Gemini diturunkan dari tahap, bukan ditumpuk lewat mutasi.
 * Dengan begitu presenter bisa melompat maju-mundur tanpa state kotor.
 *
 * `answerReady` menahan gelembung jawaban selama model masih menyusun, supaya
 * naskah cadangan tidak sempat berkedip di layar sebelum ditimpa versi live.
 */
function buildTurns(stage: Stage, answer: string, answerReady: boolean): Turn[] {
  const q: Turn = { id: 'q', role: 'user', text: QUESTION };
  const a: Turn = { id: 'a', role: 'gemini', text: answer, locked: true };
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

  const answered = answerReady ? [a] : [];

  switch (stage) {
    case 'goal':
      return [];
    case 'normal':
      return [q, ...answered];
    case 'intercept':
    case 'socratic':
    case 'reflective':
    case 'comparison':
      return [q, ...answered, heldFollowUp];
    case 'scaffold':
    case 'rating':
      return [q, ...answered, sentFollowUp, handover];
    default:
      return [];
  }
}

/** Tugas COE yang mengisi tiap tahap — dipakai untuk skeleton dan telemetri. */
const STAGE_TASK = {
  normal: 'answer',
  socratic: 'socratic',
  comparison: 'comparison',
  scaffold: 'scaffold',
} as const;

export default function App() {
  const [stage, setStage] = useState<Stage>('goal');
  const [reached, setReached] = useState<Set<Stage>>(new Set(['goal']));
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [popupOpen, setPopupOpen] = useState(true);

  const [draft, setDraft] = useState('');

  const [socraticAnswer, setSocraticAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [theoryOpen, setTheoryOpen] = useState(false);

  const {
    content,
    source,
    loading,
    ensureAnswer,
    ensureSocratic,
    ensureComparison,
    ensureScaffold,
    resetCoe,
  } = useCoe();

  const step = stepOf(stage);
  const panelVisible = PANEL_STAGES.includes(stage);
  const coeOn = goal === 'instrumental';

  const answerReady = source.answer !== 'pending';
  const turns = useMemo(
    () => buildTurns(stage, content.answer, answerReady),
    [stage, content.answer, answerReady],
  );

  /* --- Navigasi ------------------------------------------------------- */

  const go = useCallback((next: Stage) => {
    setStage(next);
    setReached((prev) => new Set(prev).add(next));

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
    resetCoe();
  }, [resetCoe]);

  /* --- Pemicu panggilan model ------------------------------------------ */

  /**
   * Setiap tahap meminta isinya sendiri. Fungsi `ensure*` idempoten, jadi
   * bolak-balik lewat tombol presenter tidak menambah panggilan API.
   */
  useEffect(() => {
    if (!coeOn) return;
    switch (stage) {
      case 'normal':
      case 'intercept':
        void ensureAnswer();
        break;
      case 'socratic':
        void ensureSocratic();
        break;
      case 'reflective':
        void ensureAnswer();
        break;
      case 'comparison':
        void ensureComparison(summary || REFLECTIVE_SAMPLE_SUMMARY);
        break;
      case 'scaffold':
        void ensureScaffold();
        break;
    }
  }, [
    stage,
    coeOn,
    summary,
    ensureAnswer,
    ensureSocratic,
    ensureComparison,
    ensureScaffold,
  ]);

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
      setStage('normal');
      setReached((prev) => new Set(prev).add('normal'));
      // Pertanyaan lanjutan baru muncul di composer setelah jawaban terbaca —
      // urutan inilah yang membuat interception di tahap berikutnya masuk akal.
      void ensureAnswer().then(() => setDraft(FOLLOW_UP));
    }
  };

  /** Enter di composer Gemini saat Normal Mode memicu interception. */
  const submitDraft = () => {
    if (stage === 'normal' && draft.trim()) go('intercept');
  };

  const metrics = [
    { value: String(content.socratic.length), label: 'pertanyaan pemantik' },
    {
      value: `${countWords(summary || REFLECTIVE_SAMPLE_SUMMARY)} kata`,
      label: 'rangkuman tervalidasi',
    },
    {
      value: String(content.comparison.miss.length),
      label: 'counterargument ditinjau',
    },
    { value: '1', label: 'respons di-scaffold' },
  ];

  /* --- Telemetri -------------------------------------------------------- */

  /** Baris terakhir konsol menyatakan apakah tahap ini live atau naskah. */
  const consoleLines = useMemo(() => {
    const base = (CONSOLE_LINES[stage] ?? []).map((line) =>
      line.replace('{tokens}', String(estimateTokens(content.answer))),
    );
    const task = STAGE_TASK[stage as keyof typeof STAGE_TASK];
    if (!task) return base;

    const state = source[task];
    if (state === 'pending') return base;
    return [
      ...base,
      state === 'live'
        ? 'gemini-2.5-flash · respons live'
        : 'jalur live gagal · memakai naskah cadangan',
    ];
  }, [stage, source, content.answer]);

  /* --- Isi panel per tahap --------------------------------------------- */

  const renderPanel = () => {
    switch (stage) {
      case 'normal':
        return loading.answer ? (
          <LoadingStep
            eyebrow="Sub-modul 1 · DOM Interceptor"
            tone="var(--color-core-500)"
            title={<>Mengamati respons Gemini</>}
            lede={
              <>
                MutationObserver menunggu node jawaban selesai dirender sebelum
                teksnya diekstrak jadi respons mentah.
              </>
            }
          />
        ) : (
          <NormalStep extracted={content.answer} />
        );

      case 'intercept':
        return <InterceptStep heldQuestion={FOLLOW_UP} onProceed={goNext} />;

      case 'socratic':
        return loading.socratic ? (
          <LoadingStep
            eyebrow="Sub-modul 3 · Socratic Prompt Builder"
            tone={MODE_COLOR.socratic}
            title={<>Menyusun pertanyaan pemantik</>}
            lede={
              <>
                Pertanyaan dibangun dari respons yang barusan kamu baca, bukan
                dari daftar siap pakai.
              </>
            }
          />
        ) : (
          <SocraticStep
            questions={content.socratic}
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
            rawResponse={content.answer}
            initialSummary={summary}
            onSubmit={(s) => {
              setSummary(s);
              go('comparison');
            }}
          />
        );

      case 'comparison':
        return loading.comparison ? (
          <LoadingStep
            eyebrow="Sub-modul 3 · Reflective Prompt Builder"
            tone={MODE_COLOR.comparison}
            title={<>Membandingkan rangkumanmu</>}
            lede={
              <>
                Rangkumanmu disandingkan dengan respons mentah untuk menemukan
                apa yang tertangkap dan apa yang terlewat.
              </>
            }
          />
        ) : (
          <ComparisonStep
            summary={summary || REFLECTIVE_SAMPLE_SUMMARY}
            comparison={content.comparison}
            onContinue={() => go('scaffold')}
            onEnd={() => go('rating')}
          />
        );

      case 'scaffold':
        return loading.scaffold ? (
          <LoadingStep
            eyebrow="Sub-modul 3 · Scaffold Prompt Builder"
            tone={MODE_COLOR.scaffold}
            title={<>Memecah jawaban jadi petunjuk</>}
            lede={
              <>
                Respons untuk pertanyaan yang tadi ditahan sedang dipotong jadi
                bantuan bertahap, bukan jawaban utuh.
              </>
            }
          />
        ) : (
          <ScaffoldStep
            question={FOLLOW_UP}
            hints={content.scaffold.hints}
            partial={content.scaffold.partial}
            onEnd={() => go('rating')}
          />
        );

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
            thinking={coeOn && loading.answer}
            coeActive={coeOn && panelVisible}
          />

          {panelVisible && step && (
            <CorePanel
              mode={step.mode}
              module={step.module}
              consoleLines={consoleLines}
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
