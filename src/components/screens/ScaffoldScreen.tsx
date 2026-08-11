import React, { useState } from 'react';
import { Layers, Sparkles, Bot, Send, User, HelpCircle, ChevronRight } from 'lucide-react';

interface ScaffoldScreenProps {
  scaffoldHints: string[];
  partialAnswer: string;
  onSubmitFollowUp: (q: string) => void;
  onEndSession: () => void;
}

export const ScaffoldScreen: React.FC<ScaffoldScreenProps> = ({
  scaffoldHints,
  partialAnswer,
  onSubmitFollowUp,
  onEndSession,
}) => {
  const [input, setInput] = useState('');
  const [questionAsked, setQuestionAsked] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      onSubmitFollowUp(input.trim());
      setQuestionAsked(true);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-300/50">
          <Layers className="w-3 h-3 text-indigo-600" />
          <span className="text-[9px] font-bold text-indigo-700">Scaffolding Mode</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* User's clarification question */}
        {questionAsked && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#4E9DB8] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="bg-[#F0EBE5] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
              <p className="text-[12px] text-slate-800 leading-relaxed">
                Bisa jelaskan lebih lanjut tentang bagaimana retrieval practice mempengaruhi konsolidasi memori?
              </p>
            </div>
          </div>
        )}

        {/* Scaffolded response from CORE AI */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-indigo-200/50 max-w-[90%] space-y-3">
            <p className="text-[10px] font-bold text-indigo-800 mb-1 uppercase tracking-wider">
              CORE AI · Scaffolded Response
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              Jawaban diberikan secara bertahap agar kamu membangun penalaran sendiri:
            </p>

            {/* Scaffolded hints */}
            <div className="space-y-2">
              {scaffoldHints.map((hint, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/60 rounded-xl p-2.5 border border-indigo-200/30">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">{hint}</p>
                </div>
              ))}
            </div>

            {/* Partial/guiding answer */}
            <div className="bg-white/60 rounded-xl p-3 border-l-3 border-indigo-500">
              <div className="flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3 h-3 text-indigo-600" />
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Jawaban Parsial</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed core-no-copy">
                {partialAnswer}
              </p>
            </div>
          </div>
        </div>

        {/* End session button */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 shrink-0" />
          <button
            onClick={onEndSession}
            className="py-2 px-4 bg-[#F0EBE5] text-slate-700 text-[11px] font-bold rounded-xl hover:bg-[#E3DDD3] transition-all flex items-center gap-1.5"
          >
            Akhiri Sesi & Beri Rating
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Input for follow-up */}
      {!questionAsked && (
        <div className="p-3 border-t border-[#E3DDD3]">
          <p className="text-[10px] text-indigo-600 font-bold mb-2 px-2">
            💡 Ketik pertanyaan klarifikasi atau elaborasi:
          </p>
          <div className="flex items-center gap-2 bg-[#F5F2EE] rounded-2xl px-4 py-2 border border-indigo-300/50 focus-within:border-indigo-500 transition-colors">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pertanyaan klarifikasi, elaborasi, atau eksplorasi..."
              className="flex-1 bg-transparent text-[12px] text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              onClick={handleSend}
              className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white hover:shadow-md hover:shadow-indigo-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
