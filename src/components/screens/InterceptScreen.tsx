import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Send, Sparkles, User, Bot, Lock } from 'lucide-react';

interface InterceptScreenProps {
  originalQuestion: string;
  onProceedToSocratic: () => void;
}

export const InterceptScreen: React.FC<InterceptScreenProps> = ({
  originalQuestion,
  onProceedToSocratic,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Gemini-style header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-300/50">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          <span className="text-[9px] font-bold text-amber-700">Interception Active</span>
        </div>
      </div>

      {/* Intercept overlay */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          {/* Intercepted message */}
          <div className="mb-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#4E9DB8] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="bg-[#F0EBE5] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] relative">
              <p className="text-[12px] text-slate-800 leading-relaxed">{originalQuestion}</p>
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Interception modal */}
          <div className="bg-white rounded-2xl border-2 border-amber-400/50 shadow-xl shadow-amber-500/5 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading font-bold text-sm text-white">
                Pertanyaan Lanjutan Terdeteksi!
              </h3>
              <p className="text-white/80 text-[10px] mt-1">
                Sub-Modul 1: DOM Interceptor & Session Manager
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>CORE AI mendeteksi pertanyaan lanjutan.</strong> Sebelum melanjutkan, kamu perlu melewati alur kognitif terlebih dahulu untuk memastikan pemahamanmu terhadap jawaban sebelumnya.
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] text-slate-500">
                  Pengiriman pertanyaan ditahan sementara oleh ekstensi
                </p>
                <button
                  onClick={onProceedToSocratic}
                  className="w-full py-2.5 bg-gradient-to-r from-[#F4680A] to-[#F99D45] text-white text-[12px] font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  Mulai Alur Kognitif →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
