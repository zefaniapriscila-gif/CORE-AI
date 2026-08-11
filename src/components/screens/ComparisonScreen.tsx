import React from 'react';
import { GitCompare, ArrowRight, Sparkles, User, Bot, Lightbulb, ArrowRightLeft } from 'lucide-react';

interface ComparisonScreenProps {
  userSummary: string;
  aiCounterargument: string;
  keyTakeaway: string;
  onContinue: () => void;
  onEndSession: () => void;
}

export const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  userSummary,
  aiCounterargument,
  keyTakeaway,
  onContinue,
  onEndSession,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 rounded-full border border-sky-300/50">
          <GitCompare className="w-3 h-3 text-sky-600" />
          <span className="text-[9px] font-bold text-sky-700">Komparasi</span>
        </div>
      </div>

      {/* Comparison content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* CORE system message */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="rounded-2xl rounded-tl-sm max-w-[90%] space-y-3">
            <p className="text-[10px] font-bold text-[#D95300] uppercase tracking-wider">
              CORE AI · Komparasi & Counterargument
            </p>

            {/* Side by side comparison */}
            <div className="grid grid-cols-1 gap-2">
              {/* User's understanding */}
              <div className="bg-[#F0EBE5] rounded-xl p-3 border border-[#E3DDD3]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <User className="w-3 h-3 text-[#4E9DB8]" />
                  <span className="text-[9px] font-bold text-[#4E9DB8] uppercase tracking-wider">Pemahamanmu</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {userSummary}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRightLeft className="w-4 h-4 text-[#F4680A]" />
              </div>

              {/* AI Counterargument */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-3 border border-sky-200/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3 h-3 text-sky-600" />
                  <span className="text-[9px] font-bold text-sky-700 uppercase tracking-wider">Counterargument AI</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed core-no-copy">
                  {aiCounterargument}
                </p>
              </div>
            </div>

            {/* Key takeaway */}
            <div className="bg-gradient-to-r from-[#FFF4EC] to-[#FFECDF] rounded-xl p-3 border border-[#F99D45]/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#F4680A]" />
                <span className="text-[9px] font-bold text-[#D95300] uppercase tracking-wider">Poin Kunci</span>
              </div>
              <p className="text-[11px] text-slate-800 leading-relaxed font-medium">
                {keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Post-reflection options */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 shrink-0" />
          <div className="bg-white rounded-2xl p-3 border border-[#E3DDD3] w-full max-w-[90%]">
            <p className="text-[10px] font-bold text-slate-700 mb-2">
              🤔 Post Reflection — Apa langkah selanjutnya?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onContinue}
                className="flex-1 py-2 bg-gradient-to-r from-[#F4680A] to-[#F99D45] text-white text-[11px] font-bold rounded-xl hover:shadow-md hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                Lanjutkan Sesi
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onEndSession}
                className="flex-1 py-2 bg-[#F0EBE5] text-slate-700 text-[11px] font-bold rounded-xl hover:bg-[#E3DDD3] transition-all"
              >
                Akhiri Sesi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
