import React from 'react';
import { Globe, ChevronLeft, ChevronRight, RotateCw, Lock, Star, MoreVertical, X, Minus, Square, Sparkles } from 'lucide-react';

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  extensionActive?: boolean;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  url = 'gemini.google.com',
  extensionActive = true,
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl border border-[#D1CCC4] shadow-2xl shadow-black/5 overflow-hidden">
      {/* Title bar */}
      <div className="h-9 bg-[#F0EDEA] flex items-center justify-between px-3 border-b border-[#D1CCC4] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Minus className="w-3.5 h-3.5" />
          <Square className="w-3 h-3" />
          <X className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="h-8 bg-[#E8E4DF] flex items-end px-2 shrink-0">
        <div className="flex items-center gap-2 bg-white rounded-t-lg px-3 h-7 min-w-[180px] border border-b-0 border-[#D1CCC4] shadow-sm">
          <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-4 h-4" alt="Gemini" />
          <span className="text-[11px] font-medium text-slate-700 truncate">Gemini</span>
          <X className="w-3 h-3 text-slate-400 ml-auto" />
        </div>
      </div>

      {/* Address bar */}
      <div className="h-10 bg-white flex items-center px-3 gap-2 border-b border-[#D1CCC4] shrink-0">
        <div className="flex items-center gap-1 text-slate-400">
          <ChevronLeft className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
          <RotateCw className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 h-7 bg-[#F5F2EE] rounded-full flex items-center gap-2 px-3">
          <Lock className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] text-slate-600">{url}</span>
        </div>
        {extensionActive && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FFF4EC] to-[#FFECDF] rounded-full border border-[#F99D45]/40">
            <Sparkles className="w-3 h-3 text-[#F4680A]" />
            <span className="text-[9px] font-bold text-[#D95300]">CORE AI</span>
          </div>
        )}
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto bg-[#FAF8F6]">
        {children}
      </div>
    </div>
  );
};
