import React, { useState } from 'react';
import { Send, MessageCircleQuestion, Sparkles, User, Bot, CheckCircle2 } from 'lucide-react';

interface SocraticScreenProps {
  socraticQuestions: string[];
  onSubmitAnswer: (answer: string) => void;
  isAnswered: boolean;
}

export const SocraticScreen: React.FC<SocraticScreenProps> = ({
  socraticQuestions,
  onSubmitAnswer,
  isAnswered,
}) => {
  const [answerText, setAnswerText] = useState('');

  const handleSubmit = () => {
    if (answerText.trim()) {
      onSubmitAnswer(answerText.trim());
      setAnswerText('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 rounded-full border border-violet-300/50">
          <MessageCircleQuestion className="w-3 h-3 text-violet-600" />
          <span className="text-[9px] font-bold text-violet-700">Socratic Mode</span>
        </div>
      </div>

      {/* Chat area with Socratic questions */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* CORE AI System message */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="bg-gradient-to-br from-[#FFF4EC] to-[#FFECDF] rounded-2xl rounded-tl-sm px-4 py-3 border border-[#F99D45]/30 max-w-[90%]">
            <p className="text-[10px] font-bold text-[#D95300] mb-2 uppercase tracking-wider">
              CORE AI · Socratic Method
            </p>
            <p className="text-[11px] text-slate-700 mb-3 leading-relaxed">
              Sebelum melanjutkan, coba jawab pertanyaan pemantik berikut untuk menguji pemahamanmu terhadap jawaban AI sebelumnya:
            </p>

            <div className="space-y-2.5">
              {socraticQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/70 rounded-xl p-2.5 border border-[#F99D45]/20">
                  <div className="w-5 h-5 rounded-full bg-[#F4680A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug font-medium">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User's answer if submitted */}
        {isAnswered && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#4E9DB8] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="bg-[#F0EBE5] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
              <p className="text-[12px] text-slate-800 leading-relaxed">
                Menurut saya, perbedaan utamanya adalah cognitive offloading mengurangi beban working memory secara pasif, sementara retrieval practice justru menantang working memory secara aktif untuk memperkuat konsolidasi memori jangka panjang...
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-bold text-emerald-700">Jawaban diterima</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {!isAnswered && (
        <div className="p-3 border-t border-[#E3DDD3]">
          <p className="text-[10px] text-[#D95300] font-bold mb-2 px-2">
            ✍️ Jawab pertanyaan di atas dengan kata-katamu sendiri:
          </p>
          <div className="flex items-center gap-2 bg-[#F5F2EE] rounded-2xl px-4 py-2 border border-violet-300/50 focus-within:border-violet-500 transition-colors">
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Ketik jawabanmu di sini..."
              className="flex-1 bg-transparent text-[12px] text-slate-800 placeholder-slate-400 outline-none resize-none min-h-[40px]"
              rows={2}
            />
            <button
              onClick={handleSubmit}
              className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white hover:shadow-md hover:shadow-violet-500/20 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
