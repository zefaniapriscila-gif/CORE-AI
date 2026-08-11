import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Lock, 
  Puzzle, 
  Sparkles, 
  X, 
  Minus, 
  Square
} from 'lucide-react';

interface ChromeBrowserFrameProps {
  children: React.ReactNode;
  isExtensionOpen: boolean;
  onToggleExtension: () => void;
  activeModeLabel: string;
}

export const ChromeBrowserFrame: React.FC<ChromeBrowserFrameProps> = ({
  children,
  isExtensionOpen,
  onToggleExtension,
}) => {
  const [url] = useState('https://gemini.google.com/app');

  return (
    <div className="w-full h-screen bg-[#F0EBE5] flex items-center justify-center sm:p-3 overflow-hidden font-sans">
      {/* Outer Chrome Window Frame (Light Theme) */}
      <div className="w-full h-full sm:rounded-2xl bg-[#E8E2D9] border border-[#D5CDC2] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* 1. Chrome Titlebar & Window Controls */}
        <div className="h-10 bg-[#E0D9CD] border-b border-[#D5CDC2] px-4 flex items-center justify-between select-none">
          {/* Left: macOS Window Controls */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-90 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-90 transition cursor-pointer" />
          </div>

          {/* Active Tab */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] border-t-2 border-[#F4680A] px-4 py-1.5 rounded-t-lg text-xs text-slate-800 max-w-xs w-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F4680A] shrink-0" />
            <span className="truncate font-semibold">Gemini - Google AI</span>
            <X className="w-3 h-3 text-slate-400 ml-auto cursor-pointer hover:text-slate-600" />
          </div>

          {/* Right Window Controls */}
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <Minus className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" />
            <Square className="w-3 h-3 cursor-pointer hover:text-slate-700" />
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" />
          </div>
        </div>

        {/* 2. Chrome Address Bar & Toolbar */}
        <div className="h-12 bg-[#F0EBE5] border-b border-[#D5CDC2] px-3 flex items-center gap-3 select-none">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 text-slate-600">
            <button className="p-1.5 rounded-lg hover:bg-[#E5DFD5] transition text-slate-400 cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#E5DFD5] transition text-slate-400 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#E5DFD5] transition text-slate-600">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-full px-4 py-1.5 flex items-center justify-between text-xs text-slate-800 shadow-inner">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 truncate">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium">{url}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-[#F0EBE5] px-2 py-0.5 rounded font-sans font-medium">SSL Secure</span>
            </div>
          </div>

          {/* Extensions Area */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#D5CDC2]">
            <button 
              className="p-1.5 rounded-lg hover:bg-[#E5DFD5] transition text-slate-600"
              title="Browser Extensions"
            >
              <Puzzle className="w-4 h-4" />
            </button>

            {/* CORE AI Extension Toggle Icon */}
            <button
              onClick={onToggleExtension}
              className={`relative p-1.5 px-3 rounded-xl border transition flex items-center gap-2 shadow-sm ${
                isExtensionOpen
                  ? 'bg-gradient-to-r from-[#F4680A] to-[#F99D45] border-[#F4680A] text-white shadow-orange-500/20'
                  : 'bg-white border-[#CBD5E1] text-slate-700 hover:border-[#F4680A]'
              }`}
              title="Toggle CORE AI Extension Sidebar"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isExtensionOpen ? 'bg-white/20 text-white' : 'bg-[#F4680A] text-white'}`}>
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold font-heading hidden md:inline">
                CORE AI
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E9DB8] animate-ping absolute -top-0.5 -right-0.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E9DB8] absolute -top-0.5 -right-0.5 border-2 border-white" />
            </button>
          </div>
        </div>

        {/* 3. Main Browser Viewport */}
        <div className="flex-1 relative overflow-hidden bg-[#FFFFFF]">
          {children}
        </div>
      </div>
    </div>
  );
};
