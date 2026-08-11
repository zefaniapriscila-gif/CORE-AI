import React, { useState, useCallback } from 'react';
import { CognitiveMode, UserGoal } from './engine/coeTypes';
import { DemoSidebar } from './components/demo/DemoSidebar';
import { BrowserFrame } from './components/demo/BrowserFrame';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { NormalModeScreen } from './components/screens/NormalModeScreen';
import { InterceptScreen } from './components/screens/InterceptScreen';
import { SocraticScreen } from './components/screens/SocraticScreen';
import { ReflectiveScreen } from './components/screens/ReflectiveScreen';
import { ComparisonScreen } from './components/screens/ComparisonScreen';
import { ScaffoldScreen } from './components/screens/ScaffoldScreen';
import { RatingScreen } from './components/screens/RatingScreen';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { DEMO_STEPS } from './engine/coeTypes';

// --- Demo data matching the essay's cognitive offloading topic ---
const DEMO_USER_QUESTION = 'Jelaskan apa itu cognitive offloading dan dampaknya terhadap working memory mahasiswa';

const DEMO_AI_RESPONSE = `Cognitive offloading adalah kecenderungan individu untuk mengalihkan proses pengolahan informasi, penalaran, dan pengambilan keputusan kepada sistem eksternal seperti AI.

Dampak terhadap working memory mahasiswa:

1. Penurunan aktivasi DLPFC (Dorsolateral Prefrontal Cortex) — area otak yang bertanggung jawab untuk mempertahankan dan memanipulasi informasi dalam working memory.

2. Degradasi information retrieval — proses mengingat kembali informasi menjadi lebih lambat dan kurang akurat karena working memory tidak dilatih aktif.

3. Risiko digital amnesia — ketergantungan terhadap penyimpanan eksternal memicu synaptic pruning dan mengurangi konsolidasi memori jangka panjang.

4. Illusion of learning — mahasiswa merasa memahami materi padahal belum membangun konstruk pengetahuan yang mendalam.`;

const DEMO_FOLLOW_UP = 'Lalu bagaimana cara mencegah cognitive offloading saat menggunakan AI?';

const DEMO_SOCRATIC_QUESTIONS = [
  'Menurut pemahamanmu, apa perbedaan utama antara cognitive offloading dan retrieval practice dalam konteks penggunaan AI?',
  'Bagaimana menurutmu dampak jangka panjang dari tidak melatih working memory secara aktif?',
  'Dapatkah kamu memberikan contoh situasi di mana mahasiswa mengalami illusion of learning saat menggunakan GenAI?',
];

const DEMO_USER_SUMMARY = 'Cognitive offloading terjadi ketika mahasiswa terlalu bergantung pada AI untuk berpikir, sehingga working memory mereka melemah karena jarang dilatih. Ini menyebabkan kemampuan mengingat dan menganalisis menurun.';

const DEMO_AI_COUNTERARGUMENT = `Rangkumanmu sudah menangkap esensi utama, namun ada aspek penting yang belum tercakup:

• Kamu belum menyebutkan peran DLPFC — area spesifik otak yang terdampak langsung. Penurunan aktivasi DLPFC kanan adalah mekanisme neurologis utama, bukan sekadar "working memory melemah" secara umum.

• Illusion of learning juga perlu ditekankan — mahasiswa bukan hanya "kemampuannya menurun", tapi secara aktif percaya bahwa mereka memahami materi padahal tidak.

• Aspek synaptic pruning dan digital amnesia menunjukkan bahwa dampaknya bersifat fisiologis, bukan hanya kognitif.`;

const DEMO_KEY_TAKEAWAY = 'Cognitive offloading bukan sekadar "malas berpikir" — ia memiliki mekanisme neurologis yang terukur (penurunan DLPFC) dan berdampak permanen jika tidak dimitigasi melalui intervensi aktif seperti retrieval practice dan structured prompting.';

const DEMO_SCAFFOLD_HINTS = [
  'Pikirkan dulu: apa yang membedakan "menggunakan AI sebagai alat bantu" vs "bergantung pada AI"?',
  'Ingat kembali konsep retrieval practice dari jawaban sebelumnya — bagaimana prinsip ini bisa diterapkan saat berinteraksi dengan AI?',
  'Pertimbangkan: apakah mungkin mencegah cognitive offloading tanpa mengurangi kemudahan penggunaan AI?',
];

const DEMO_PARTIAL_ANSWER = 'Pencegahan cognitive offloading memerlukan intervensi pada ___ (tingkat apa?). Salah satu strateginya adalah ___ (metode yang memaksa pengguna mengaktifkan working memory), yang diimplementasikan melalui teknik seperti ___ (contoh: pertanyaan pemantik, rangkuman mandiri, dll). Coba lengkapi bagian yang kosong berdasarkan pemahamanmu...';

function App() {
  const [currentMode, setCurrentMode] = useState<CognitiveMode>('welcome');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);

  // Normal mode state
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');

  // Socratic
  const [socraticAnswered, setSocraticAnswered] = useState(false);

  // Reflective
  const [reflectiveSubmitted, setReflectiveSubmitted] = useState(false);

  // Rating
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const completeStep = useCallback((mode: CognitiveMode) => {
    setCompletedSteps(prev => new Set([...prev, mode]));
  }, []);

  const navigateToMode = useCallback((mode: CognitiveMode) => {
    // Reset states based on navigation
    setCurrentMode(mode);
    
    // For demo, pre-populate states for past steps
    if (mode === 'normal' || DEMO_STEPS.findIndex(s => s.id === mode) > DEMO_STEPS.findIndex(s => s.id === 'normal')) {
      setUserGoal('instrumental');
      setUserQuestion(DEMO_USER_QUESTION);
      setAiResponse(DEMO_AI_RESPONSE);
      setIsLoading(false);
    }
    if (DEMO_STEPS.findIndex(s => s.id === mode) > DEMO_STEPS.findIndex(s => s.id === 'socratic')) {
      setSocraticAnswered(true);
    }
    if (DEMO_STEPS.findIndex(s => s.id === mode) > DEMO_STEPS.findIndex(s => s.id === 'reflective')) {
      setReflectiveSubmitted(true);
    }
  }, []);

  // Step order for next/prev
  const modeOrder: CognitiveMode[] = ['welcome', 'normal', 'intercept', 'socratic', 'reflective', 'comparison', 'scaffold', 'rating'];
  const currentIdx = modeOrder.indexOf(currentMode);

  const goNext = () => {
    if (currentIdx < modeOrder.length - 1) {
      completeStep(currentMode);
      navigateToMode(modeOrder[currentIdx + 1]);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      navigateToMode(modeOrder[currentIdx - 1]);
    }
  };

  // --- Handlers for each mode ---
  const handleSelectGoal = (goal: UserGoal) => {
    setUserGoal(goal);
    completeStep('welcome');
    setCurrentMode('normal');
  };

  const handleSendQuestion = (q: string) => {
    setUserQuestion(q || DEMO_USER_QUESTION);
    setIsLoading(true);
    setTimeout(() => {
      setAiResponse(DEMO_AI_RESPONSE);
      setIsLoading(false);
    }, 1500);
  };

  const handleProceedToSocratic = () => {
    completeStep('intercept');
    setCurrentMode('socratic');
  };

  const handleSocraticAnswer = (answer: string) => {
    setSocraticAnswered(true);
    setTimeout(() => {
      completeStep('socratic');
      setCurrentMode('reflective');
    }, 800);
  };

  const handleReflectiveSummary = (summary: string) => {
    setReflectiveSubmitted(true);
    setTimeout(() => {
      completeStep('reflective');
      setCurrentMode('comparison');
    }, 800);
  };

  const handleContinueAfterComparison = () => {
    completeStep('comparison');
    setCurrentMode('scaffold');
  };

  const handleEndSession = () => {
    completeStep('comparison');
    completeStep('scaffold');
    setCurrentMode('rating');
  };

  const handleScaffoldFollowUp = (q: string) => {
    // In demo, just show the scaffold response
  };

  const handleScaffoldEnd = () => {
    completeStep('scaffold');
    setCurrentMode('rating');
  };

  const handleRating = (rating: number) => {
    setRatingSubmitted(true);
    completeStep('rating');
  };

  // Render current screen inside browser frame
  const renderScreen = () => {
    switch (currentMode) {
      case 'welcome':
        return <WelcomeScreen onSelectGoal={handleSelectGoal} />;
      case 'normal':
        return (
          <NormalModeScreen
            onSendQuestion={handleSendQuestion}
            aiResponse={aiResponse}
            isLoading={isLoading}
            userQuestion={userQuestion}
          />
        );
      case 'intercept':
        return (
          <InterceptScreen
            originalQuestion={DEMO_FOLLOW_UP}
            onProceedToSocratic={handleProceedToSocratic}
          />
        );
      case 'socratic':
        return (
          <SocraticScreen
            socraticQuestions={DEMO_SOCRATIC_QUESTIONS}
            onSubmitAnswer={handleSocraticAnswer}
            isAnswered={socraticAnswered}
          />
        );
      case 'reflective':
        return (
          <ReflectiveScreen
            aiOriginalResponse={DEMO_AI_RESPONSE}
            onSubmitSummary={handleReflectiveSummary}
            isSubmitted={reflectiveSubmitted}
          />
        );
      case 'comparison':
        return (
          <ComparisonScreen
            userSummary={DEMO_USER_SUMMARY}
            aiCounterargument={DEMO_AI_COUNTERARGUMENT}
            keyTakeaway={DEMO_KEY_TAKEAWAY}
            onContinue={handleContinueAfterComparison}
            onEndSession={handleEndSession}
          />
        );
      case 'scaffold':
        return (
          <ScaffoldScreen
            scaffoldHints={DEMO_SCAFFOLD_HINTS}
            partialAnswer={DEMO_PARTIAL_ANSWER}
            onSubmitFollowUp={handleScaffoldFollowUp}
            onEndSession={handleScaffoldEnd}
          />
        );
      case 'rating':
        return (
          <RatingScreen
            onSubmitRating={handleRating}
            isSubmitted={ratingSubmitted}
          />
        );
      default:
        return <WelcomeScreen onSelectGoal={handleSelectGoal} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#F0EDEA] overflow-hidden font-sans">
      {/* Left Sidebar */}
      <DemoSidebar
        currentMode={currentMode}
        onNavigateStep={navigateToMode}
        completedSteps={completedSteps}
      />

      {/* Right content: Browser Frame */}
      <main className="flex-1 flex flex-col p-5 overflow-hidden">
        {/* Top bar with navigation controls */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-sm font-bold text-slate-800">
              {DEMO_STEPS.find(s => s.id === currentMode)?.label || 'CORE AI Demo'}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {DEMO_STEPS.find(s => s.id === currentMode)?.theory || ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIdx <= 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-[#E3DDD3] text-[10px] font-bold text-slate-600 hover:bg-[#F0EBE5] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              Sebelumnya
            </button>
            <button
              onClick={goNext}
              disabled={currentIdx >= modeOrder.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#F4680A] to-[#F99D45] rounded-lg text-[10px] font-bold text-white hover:shadow-md hover:shadow-orange-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Selanjutnya
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Browser Frame */}
        <div className="flex-1 min-h-0">
          <BrowserFrame>
            {renderScreen()}
          </BrowserFrame>
        </div>
      </main>
    </div>
  );
}

export default App;
