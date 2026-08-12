import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Star,
  Puzzle,
  MoreVertical,
  Plus,
  X,
  Minus,
  Square,
  PanelRight,
} from 'lucide-react';
import { CoreMark } from '../brand/CoreMark';
import { GeminiSpark } from '../gemini/GeminiSpark';

interface Props {
  children: React.ReactNode;
  /** Popup ekstensi yang di-anchor ke ikon toolbar. */
  popup?: React.ReactNode;
  /** Ikon CORE AI menyala saat ekstensi bekerja. */
  extensionActive?: boolean;
  /** Denyut pada ikon toolbar untuk menarik perhatian juri. */
  attention?: boolean;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
}

const NavIcon: React.FC<{ children: React.ReactNode; dim?: boolean }> = ({
  children,
  dim,
}) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
      dim ? 'text-paper-300' : 'text-paper-mid hover:bg-paper-200'
    }`}
  >
    {children}
  </div>
);

export const BrowserChrome: React.FC<Props> = ({
  children,
  popup,
  extensionActive = false,
  attention = false,
  panelOpen = false,
  onTogglePanel,
}) => {
  return (
    <div className="relative flex flex-col h-full w-full rounded-[14px] overflow-hidden bg-white shadow-[0_30px_70px_-24px_rgba(16,24,60,.35)] ring-1 ring-[rgba(16,24,60,.12)]">
      {/* ---- Tab strip ---- */}
      <div className="h-[38px] bg-[#d8dce2] flex items-end shrink-0 pl-2 pr-0 select-none">
        <div className="flex items-center gap-2 h-[30px] pl-3 pr-2 min-w-[228px] bg-white rounded-t-[10px] shadow-[0_-1px_2px_rgba(0,0,0,.06)]">
          <GeminiSpark className="w-[15px] h-[15px] shrink-0" />
          <span className="text-[12px] text-paper-ink truncate flex-1">
            Gemini
          </span>
          <X className="w-3.5 h-3.5 text-paper-mid shrink-0" />
        </div>
        <div className="w-8 h-[30px] flex items-center justify-center text-paper-mid">
          <Plus className="w-4 h-4" />
        </div>

        <div className="ml-auto flex items-stretch h-[38px] text-paper-mid">
          <div className="w-11 flex items-center justify-center hover:bg-black/5">
            <Minus className="w-3.5 h-3.5" />
          </div>
          <div className="w-11 flex items-center justify-center hover:bg-black/5">
            <Square className="w-3 h-3" />
          </div>
          <div className="w-11 flex items-center justify-center hover:bg-[#e81123] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ---- Toolbar ---- */}
      <div className="h-[44px] bg-white flex items-center gap-1 px-2 shrink-0 border-b border-paper-200">
        <NavIcon>
          <ArrowLeft className="w-[18px] h-[18px]" />
        </NavIcon>
        <NavIcon dim>
          <ArrowRight className="w-[18px] h-[18px]" />
        </NavIcon>
        <NavIcon>
          <RotateCw className="w-[15px] h-[15px]" />
        </NavIcon>

        {/* Omnibox */}
        <div className="flex-1 h-8 mx-1.5 bg-paper-100 hover:bg-paper-200 transition-colors rounded-full flex items-center gap-2 px-3.5 min-w-0">
          <Lock className="w-3 h-3 text-paper-mid shrink-0" />
          <span className="text-[13px] text-paper-ink truncate">
            gemini.google.com
            <span className="text-paper-mid">/app</span>
          </span>
          <Star className="w-3.5 h-3.5 text-paper-mid ml-auto shrink-0" />
        </div>

        {/* Area ekstensi */}
        <NavIcon>
          <Puzzle className="w-[17px] h-[17px]" />
        </NavIcon>

        {/* Ikon CORE AI yang di-pin — jangkar popup */}
        <button
          onClick={onTogglePanel}
          data-core-toolbar-icon
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
            extensionActive
              ? 'bg-ink-850 text-core-500'
              : 'text-paper-mid hover:bg-paper-200'
          } ${attention ? 'anim-ring' : ''}`}
          title="CORE AI"
        >
          <CoreMark className="w-[19px] h-[19px]" strokeWidth={2.3} />
          {extensionActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-core-500 ring-2 ring-white" />
          )}
        </button>

        {panelOpen !== undefined && (
          <NavIcon>
            <PanelRight
              className={`w-[17px] h-[17px] ${panelOpen ? 'text-ink-900' : ''}`}
            />
          </NavIcon>
        )}

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285F4] to-[#9B72CB] text-white text-[11px] font-semibold flex items-center justify-center ml-1 shrink-0">
          Z
        </div>
        <NavIcon>
          <MoreVertical className="w-[17px] h-[17px]" />
        </NavIcon>
      </div>

      {/* ---- Viewport ---- */}
      <div className="flex-1 min-h-0 flex bg-white">{children}</div>

      {/* ---- Popup ekstensi, menempel di bawah ikon toolbar ---- */}
      {popup && (
        <div className="absolute top-[80px] right-[104px] z-40 anim-pop">
          {/* Caret penunjuk ke ikon */}
          <div className="absolute -top-[6px] right-[14px] w-3.5 h-3.5 rotate-45 rounded-[3px] bg-[#f7f9fd] shadow-[inset_1px_1px_0_rgba(16,24,60,.1)]" />
          {popup}
        </div>
      )}
    </div>
  );
};
