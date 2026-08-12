import React, { useEffect, useRef } from 'react';
import {
  Menu,
  SquarePen,
  History,
  Settings,
  ChevronDown,
  Plus,
  Mic,
  AudioLines,
  ArrowUp,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
} from 'lucide-react';
import { GeminiSpark } from './GeminiSpark';
import { CoreMark } from '../brand/CoreMark';
import { Turn } from '../../engine/coeTypes';

interface Props {
  turns: Turn[];
  /** Teks di composer Gemini. */
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
  /** Composer dibekukan oleh DOM Interceptor. */
  intercepted?: boolean;
  /** Teks jawaban Gemini dikunci anti copy-paste (Reflective Mode). */
  locked?: boolean;
  thinking?: boolean;
  /** Ekstensi terpasang — memunculkan penanda halus di halaman. */
  coeActive?: boolean;
}

const RailButton: React.FC<{ children: React.ReactNode; active?: boolean }> = ({
  children,
  active,
}) => (
  <div
    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
      active
        ? 'bg-[#d3e3fd] text-[#041e49]'
        : 'text-[#444746] hover:bg-[#e3e7eb]'
    }`}
  >
    {children}
  </div>
);

export const GeminiSurface: React.FC<Props> = ({
  turns,
  draft,
  onDraftChange,
  onSubmit,
  intercepted = false,
  locked = false,
  thinking = false,
  coeActive = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [turns.length, thinking]);

  return (
    <div className="flex-1 min-w-0 flex bg-white">
      {/* ---- Rail kiri Gemini ---- */}
      <div className="w-[68px] bg-[#f0f4f9] flex flex-col items-center py-3 gap-1.5 shrink-0">
        <RailButton>
          <Menu className="w-5 h-5" />
        </RailButton>
        <div className="h-2" />
        <RailButton active>
          <SquarePen className="w-5 h-5" />
        </RailButton>
        <RailButton>
          <History className="w-5 h-5" />
        </RailButton>
        <div className="flex-1" />
        <RailButton>
          <Settings className="w-5 h-5" />
        </RailButton>
      </div>

      {/* ---- Kolom utama ---- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header halaman */}
        <div className="h-[56px] shrink-0 flex items-center gap-2 px-5">
          <button className="flex items-center gap-1.5 h-9 px-3 -ml-3 rounded-lg hover:bg-paper-100 transition-colors">
            <span className="text-[17px] text-[#444746] font-normal">Gemini</span>
            <span className="text-[13px] text-paper-mid">2.5 Flash</span>
            <ChevronDown className="w-4 h-4 text-paper-mid" />
          </button>

          {coeActive && (
            <span
              className="ml-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-full anim-rise whitespace-nowrap"
              style={{
                color: 'var(--color-core-600)',
                background:
                  'color-mix(in srgb, var(--color-core-500) 12%, transparent)',
                boxShadow:
                  'inset 0 0 0 1px color-mix(in srgb, var(--color-core-500) 26%, transparent)',
              }}
            >
              <CoreMark className="w-3.5 h-3.5" strokeWidth={2.4} />
              <span className="text-[11.5px] font-medium">
                CORE AI mengamati sesi ini
              </span>
            </span>
          )}
        </div>

        {/* Thread */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto scroll-paper px-5"
        >
          <div className="max-w-[720px] mx-auto py-2 space-y-7">
            {turns.length === 0 && !thinking && (
              <div className="pt-[14vh] anim-rise">
                <h1
                  className="text-[42px] leading-tight font-medium bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg,#4285F4 0%,#9B72CB 45%,#D96570 100%)',
                  }}
                >
                  Halo, Zefania
                </h1>
                <p className="text-[19px] text-paper-mid mt-1">
                  Ada yang bisa saya bantu hari ini?
                </p>
              </div>
            )}

            {turns.map((t) =>
              t.role === 'user' ? (
                <div key={t.id} className="flex justify-end anim-rise">
                  <div
                    className={`relative max-w-[80%] rounded-[20px] px-4 py-2.5 text-[15px] leading-relaxed ${
                      t.held
                        ? 'bg-[#fff1ec] text-[#7a2d16] ring-1 ring-[#ff6b4a]/35'
                        : 'bg-[#f0f4f9] text-paper-ink'
                    }`}
                  >
                    {t.text}
                    {t.held && (
                      <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-mode-intercept text-white flex items-center justify-center shadow-md">
                        <Lock className="w-3 h-3" strokeWidth={2.6} />
                      </span>
                    )}
                  </div>
                </div>
              ) : t.role === 'gemini' ? (
                <div key={t.id} className="flex gap-4 anim-rise">
                  <GeminiSpark className="w-[26px] h-[26px] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[15px] leading-[1.75] text-paper-ink whitespace-pre-line ${
                        t.locked && locked ? 'core-no-copy core-locked' : ''
                      }`}
                    >
                      {t.text}
                    </div>

                    {t.locked && locked && (
                      <div className="mt-4 inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-[#fff1ec] text-[#a83a1b] ring-1 ring-[#ff6b4a]/30">
                        <Lock className="w-3 h-3" strokeWidth={2.6} />
                        <span className="text-[11px] font-semibold">
                          Teks dikunci CORE AI — tidak bisa diseleksi
                        </span>
                      </div>
                    )}

                    {!(t.locked && locked) && (
                      <div className="mt-3 flex items-center gap-1 text-paper-mid">
                        {[ThumbsUp, ThumbsDown, Share2, Copy].map((Ic, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper-100 transition-colors"
                          >
                            <Ic className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Node yang disuntikkan ekstensi ke dalam DOM Gemini */
                <div key={t.id} className="flex gap-4 anim-rise">
                  <span className="w-[26px] h-[26px] shrink-0 mt-0.5 rounded-full bg-ink-850 text-core-500 flex items-center justify-center">
                    <CoreMark className="w-[15px] h-[15px]" strokeWidth={2.4} />
                  </span>
                  <div className="relative flex-1 rounded-2xl overflow-hidden bg-ink-950">
                    <div
                      className="aurora"
                      style={{
                        ['--tint' as string]: 'var(--color-mode-scaffold)',
                        ['--tint2' as string]: 'var(--color-core-500)',
                      }}
                    />
                    <div className="relative glass px-4 py-3.5">
                      <div className="font-mono text-[10.5px] text-core-500 mb-1.5">
                        core ai · respons dialihkan
                      </div>
                      <p className="text-[13.5px] leading-[1.7] text-hi/90 whitespace-pre-line">
                        {t.text}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}

            {thinking && (
              <div className="flex gap-4 anim-rise">
                <GeminiSpark className="w-[26px] h-[26px] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2.5 pt-1.5">
                  {[100, 92, 64].map((w, i) => (
                    <div
                      key={i}
                      className="relative h-3 rounded-full bg-paper-200 overflow-hidden anim-sweep"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="h-3" />
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-5 pb-4 pt-1">
          <div className="max-w-[720px] mx-auto relative">
            <div
              className={`flex items-end gap-2 rounded-[26px] bg-[#f0f4f9] px-3 py-2 transition-all ${
                intercepted ? 'opacity-35 blur-[1.5px] saturate-50' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746] shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <textarea
                value={draft}
                disabled={intercepted}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
                rows={1}
                placeholder="Tanya Gemini"
                className="flex-1 bg-transparent resize-none outline-none text-[15px] text-paper-ink placeholder-paper-mid py-2 max-h-24 scroll-paper"
              />
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746]">
                  <Mic className="w-[18px] h-[18px]" />
                </div>
                <button
                  onClick={onSubmit}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#e3e7eb] transition-colors"
                >
                  {draft.trim() ? (
                    <ArrowUp className="w-5 h-5" />
                  ) : (
                    <AudioLines className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Overlay interception — content script menutupi composer */}
            {intercepted && <InterceptOverlay />}

            <p className="text-center text-[11px] text-paper-mid mt-2">
              Gemini dapat membuat kesalahan, jadi periksa kembali responsnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Lapisan yang dipasang content script tepat di atas composer Gemini. */
const InterceptOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center anim-pop">
    <div className="relative rounded-[26px] overflow-hidden bg-ink-950">
      <div
        className="aurora"
        style={{
          ['--tint' as string]: 'var(--color-mode-intercept)',
          ['--tint2' as string]: 'var(--color-core-500)',
        }}
      />
      <div className="relative glass flex items-center gap-3 h-[54px] pl-4 pr-5">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            color: 'var(--color-mode-intercept)',
            background:
              'color-mix(in srgb, var(--color-mode-intercept) 18%, transparent)',
            boxShadow: '0 0 20px -4px var(--color-mode-intercept)',
          }}
        >
          <Lock className="w-4 h-4" strokeWidth={2.4} />
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-medium text-hi">
            Pengiriman ditahan CORE AI
          </div>
          <div className="font-mono text-[10.5px] text-mode-intercept mt-0.5">
            submit · preventDefault()
          </div>
        </div>
      </div>
    </div>
  </div>
);
