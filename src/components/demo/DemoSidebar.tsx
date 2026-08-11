import React from 'react';
import { CheckCircle2, Circle, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { CognitiveMode, DEMO_STEPS } from '../../engine/coeTypes';

interface DemoSidebarProps {
  currentMode: CognitiveMode;
  onNavigateStep: (mode: CognitiveMode) => void;
  completedSteps: Set<string>;
}

export const DemoSidebar: React.FC<DemoSidebarProps> = ({
  currentMode,
  onNavigateStep,
  completedSteps,
}) => {
  const currentIdx = DEMO_STEPS.findIndex(s => s.id === currentMode);
  const progress = currentIdx >= 0 ? Math.round(((currentIdx + 1) / DEMO_STEPS.length) * 100) : 0;

  return (
    <aside className="w-[340px] bg-white border-r border-[#E3DDD3] flex flex-col shrink-0 h-full font-sans">
      {/* Header / Essay Info */}
      <div className="p-5 border-b border-[#E3DDD3]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base text-slate-900 tracking-tight leading-tight">
              CORE AI
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Browser Extension Prototype
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Ekstensi browser berbasis <strong className="text-[#F4680A]">Cognitive Orchestration Engine</strong> untuk memitigasi <em>cognitive offloading</em> pada mahasiswa pengguna Generative AI.
        </p>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
          <GraduationCap className="w-3.5 h-3.5 text-[#4E9DB8]" />
          <span className="font-medium">PSYFIC 2026 · Universitas Gadjah Mada</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 py-3 border-b border-[#E3DDD3]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tahap Demo Saat Ini</span>
          <span className="text-[10px] font-bold text-[#F4680A]">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-[#F0EBE5] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F4680A] to-[#F99D45] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {DEMO_STEPS.map((step, idx) => {
          const isActive = currentMode === step.id;
          const isCompleted = completedSteps.has(step.id);
          const isPast = idx < currentIdx;

          return (
            <button
              key={step.id}
              onClick={() => onNavigateStep(step.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                isActive
                  ? 'bg-[#FFF4EC] border-[#F99D45] shadow-sm'
                  : isPast || isCompleted
                  ? 'bg-[#F8F5F1] border-[#E3DDD3] hover:bg-[#F0EBE5]'
                  : 'bg-white border-[#E3DDD3] hover:bg-[#F8F5F1] opacity-70'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Step indicator */}
                <div className="mt-0.5">
                  {isCompleted || isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <div className="w-4 h-4 rounded-full bg-[#F4680A] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-heading text-xs font-bold ${isActive ? 'text-[#D95300]' : 'text-slate-800'}`}>
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight mb-1">
                    {step.description}
                  </p>
                  {isActive && (
                    <p className="text-[9px] text-[#4E9DB8] font-semibold leading-tight italic">
                      📖 {step.theory}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#E3DDD3] text-center">
        <p className="text-[10px] text-slate-500 font-medium">
          Zefania Priscila · Risyah Eka S. · Sarah Putri N.
        </p>
        <p className="text-[9px] text-slate-400 mt-0.5">
          Pembimbing: Satriyo Priyo Adi, S.Psi., M.Sc.
        </p>
      </div>
    </aside>
  );
};
