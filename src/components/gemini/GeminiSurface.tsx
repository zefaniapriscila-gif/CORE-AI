import React, { useEffect, useRef, useState } from 'react';
import {
  Menu,
  SquarePen,
  History,
  Settings,
  ChevronDown,
  Plus,
  Mic,
  MicOff,
  AudioLines,
  ArrowUp,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Check,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Radio,
  SlidersHorizontal,
  X,
  Volume2,
  BrainCircuit,
  MessageSquare,
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

  /** Aksi chat baru / reset chat ke tampilan awal. */
  onNewChat?: () => void;
  /** Pilihan model Gemini. */
  selectedModel?: string;
  onSelectModel?: (model: string) => void;

  /** Toast feedback. */
  onToast?: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

const MODELS = [
  {
    id: '2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Cepat & Multimodal',
    desc: 'Respons instan, efisien untuk penalaran harian dan multimodalitas.',
  },
  {
    id: '2.5-pro',
    name: 'Gemini 2.5 Pro',
    tag: 'Penalaran Lanjut',
    desc: 'Kemampuan sintesis mendalam, analisis konseptual, dan coding kompleks.',
  },
  {
    id: '2.0-thinking',
    name: 'Gemini 2.0 Thinking Exp',
    tag: 'Refleksi Langkah-demi-Langkah',
    desc: 'Memperlihatkan penalaran internal sebelum merumuskan jawaban.',
  },
];

const STARTER_PROMPTS = [
  {
    title: 'Pencegahan Cognitive Offloading',
    subtitle: 'Bagaimana mencegah ketergantungan berlebih pada AI saat belajar?',
    prompt: 'Bagaimana cara mencegah cognitive offloading saat menggunakan AI dalam proses belajar?',
  },
  {
    title: 'Metakognisi & Pembelajaran AI',
    subtitle: 'Peran self-regulation dalam interaksi manusia dan model bahasa',
    prompt: 'Jelaskan peran metakognisi dalam mengoptimalkan pemahaman saat berinteraksi dengan AI.',
  },
  {
    title: 'Socratic Dialogue Framework',
    subtitle: 'Strategi mengajukan pertanyaan untuk menstimulasi critical thinking',
    prompt: 'Bagaimana pendekatan Socratic method dapat meningkatkan kedalaman analisis kognitif?',
  },
  {
    title: 'Desain Scaffolding Adaptif',
    subtitle: 'Struktur bantuan bertahap untuk menjaga beban kognitif produktif',
    prompt: 'Bagaimana konsep scaffolding diaplikasikan untuk mendukung independent problem-solving?',
  },
];

export const GeminiSurface: React.FC<Props> = ({
  turns,
  draft,
  onDraftChange,
  onSubmit,
  intercepted = false,
  locked = false,
  thinking = false,
  coeActive = false,
  onNewChat,
  selectedModel = 'Gemini 2.5 Flash',
  onSelectModel,
  onToast,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Surface states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCoeInspector, setShowCoeInspector] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const modelRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const coeBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [turns.length, thinking]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (modelRef.current && !modelRef.current.contains(target)) {
        setShowModelMenu(false);
      }
      if (attachRef.current && !attachRef.current.contains(target)) {
        setShowAttachMenu(false);
      }
      if (coeBadgeRef.current && !coeBadgeRef.current.contains(target)) {
        setShowCoeInspector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice recording simulation
  const toggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      onToast?.('Merekam Audio...', 'Bicara sekarang, mendeteksi suara...', 'info');

      // Simulate voice typing after 1.8 seconds
      setTimeout(() => {
        setIsRecording(false);
        const voiceText =
          'Bagaimana cara mencegah cognitive offloading saat menggunakan AI dalam proses belajar?';
        onDraftChange(voiceText);
        onToast?.('Transkripsi Berhasil', 'Pertanyaan suara telah dimuat ke composer', 'success');
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const handleCopy = (text: string, id: string, isTextLocked?: boolean) => {
    if (isTextLocked && locked) {
      onToast?.(
        'Teks Dikunci CORE AI',
        'Teks dikunci pada fase Reflective Mode untuk melatih active recall mandiri',
        'warning'
      );
      return;
    }

    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    onToast?.('Teks Disalin', 'Teks telah disalin ke papan klip', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    onToast?.(
      'Tautan Disalin',
      'Tautan sesi percakapan Gemini disalin ke papan klip',
      'success'
    );
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [id]: prev[id] === type ? (undefined as any) : type,
    }));
    onToast?.(
      type === 'up' ? 'Terima kasih atas umpan balik Anda!' : 'Masukan Anda telah dicatat untuk evaluasi model.',
      undefined,
      'info'
    );
  };

  return (
    <div className="flex-1 min-w-0 flex bg-white relative overflow-hidden">
      {/* ---- Left Rail Gemini ---- */}
      <div className="w-[68px] bg-[#f0f4f9] flex flex-col items-center py-3 gap-1.5 shrink-0 border-r border-paper-200 z-10">
        {/* Tombol Hamburger Menu (Toggle Sidebar Sejarah Chat) */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            sidebarOpen ? 'bg-[#d3e3fd] text-[#041e49]' : 'text-[#444746] hover:bg-[#e3e7eb]'
          }`}
          title="Buka / Tutup Menu Utama"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="h-2" />

        {/* Tombol New Chat (Pen Icon) */}
        <button
          onClick={() => {
            onNewChat?.();
            onToast?.('Obrolan Baru', 'Sesi Gemini siap untuk pertanyaan baru', 'info');
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors bg-[#d3e3fd] text-[#041e49] hover:bg-[#c2d7f8]"
          title="Mulai Obrolan Baru"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        {/* Tombol History */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#e3e7eb] transition-colors"
          title="Riwayat Percakapan"
        >
          <History className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Tombol Settings Gemini */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#e3e7eb] transition-colors"
          title="Setelan Gemini"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ---- Collapsible Gemini Sidebar Drawer ---- */}
      {sidebarOpen && (
        <aside className="w-[260px] bg-[#f0f4f9] border-r border-paper-200 flex flex-col shrink-0 z-10 anim-panel">
          <div className="p-3 border-b border-paper-200 flex items-center justify-between">
            <button
              onClick={() => {
                onNewChat?.();
                setSidebarOpen(false);
              }}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-white text-paper-ink text-[13px] font-medium shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 text-core-500" />
              Obrolan Baru
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 ml-1 rounded-full flex items-center justify-center text-paper-mid hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 scroll-paper text-[12.5px]">
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-paper-mid uppercase tracking-wider">
                Terbaru
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onToast?.('Memuat obrolan', 'Pencegahan Cognitive Offloading', 'info');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/80 font-medium text-paper-ink flex items-center gap-2 truncate shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-core-500 shrink-0" />
                  <span className="truncate">Cognitive Offloading & AI</span>
                </button>
                <button
                  onClick={() => {
                    onToast?.('Memuat obrolan', 'Metakognisi dalam Pembelajaran AI', 'info');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 text-paper-mid flex items-center gap-2 truncate"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Metakognisi & Pembelajaran</span>
                </button>
                <button
                  onClick={() => {
                    onToast?.('Memuat obrolan', 'Perancangan Prompt Socratic', 'info');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 text-paper-mid flex items-center gap-2 truncate"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Perancangan Prompt Socratic</span>
                </button>
                <button
                  onClick={() => {
                    onToast?.('Memuat obrolan', 'Teori Fischer & Bjork (1994)', 'info');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 text-paper-mid flex items-center gap-2 truncate"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Teori Fischer & Bjork</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-paper-200 text-[12px] space-y-1">
            <button
              onClick={() => {
                setShowSettingsModal(true);
                setSidebarOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 text-paper-mid flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Setelan
            </button>
            <button
              onClick={() => {
                onToast?.('Aktivitas Gemini', 'Riwayat aktivitas disimpan di Google Account', 'info');
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 text-paper-mid flex items-center gap-2"
            >
              <Radio className="w-4 h-4" /> Aktivitas Gemini
            </button>
          </div>
        </aside>
      )}

      {/* ---- Kolom Utama Chat ---- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header Gemini */}
        <div className="h-[56px] shrink-0 flex items-center gap-2 px-5 border-b border-paper-100">
          {/* Model Switcher Dropdown */}
          <div className="relative" ref={modelRef}>
            <button
              onClick={() => setShowModelMenu((v) => !v)}
              className="flex items-center gap-1.5 h-9 px-3 -ml-3 rounded-xl hover:bg-paper-100 transition-colors"
              title="Ganti Model Gemini"
            >
              <span className="text-[17px] text-[#444746] font-medium">Gemini</span>
              <span className="text-[13px] text-paper-mid font-normal">
                {selectedModel.replace('Gemini ', '')}
              </span>
              <ChevronDown className="w-4 h-4 text-paper-mid" />
            </button>

            {/* Model Dropdown Menu */}
            {showModelMenu && (
              <div className="absolute top-[44px] left-0 z-50 w-[320px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-2 text-paper-ink anim-pop">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-paper-mid uppercase tracking-wider">
                  Pilih Model
                </div>
                <div className="space-y-1">
                  {MODELS.map((m) => {
                    const isSelected = selectedModel.includes(m.name.replace('Gemini ', ''));
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel?.(m.name);
                          setShowModelMenu(false);
                          onToast?.(`Model Aktif: ${m.name}`, m.tag, 'info');
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                          isSelected ? 'bg-blue-50/80 ring-1 ring-core-500/20' : 'hover:bg-paper-100'
                        }`}
                      >
                        <Sparkles
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isSelected ? 'text-core-500' : 'text-paper-mid'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-paper-ink">
                              {m.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-core-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-core-600 font-medium mt-0.5">
                            {m.tag}
                          </div>
                          <div className="text-[11.5px] text-paper-mid mt-0.5 leading-snug">
                            {m.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Indicator CORE AI Mengamati Sesi */}
          {coeActive && (
            <div className="ml-auto relative" ref={coeBadgeRef}>
              <button
                onClick={() => setShowCoeInspector((v) => !v)}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full anim-rise whitespace-nowrap hover:shadow-xs transition-all"
                style={{
                  color: 'var(--color-core-600)',
                  background: 'color-mix(in srgb, var(--color-core-500) 12%, transparent)',
                  boxShadow:
                    'inset 0 0 0 1px color-mix(in srgb, var(--color-core-500) 26%, transparent)',
                }}
                title="Status Ekstensi CORE AI"
              >
                <CoreMark className="w-3.5 h-3.5" strokeWidth={2.4} />
                <span className="text-[11.5px] font-medium">
                  CORE AI mengamati sesi ini
                </span>
              </button>

              {/* Inspector Popover */}
              {showCoeInspector && (
                <div className="absolute top-[36px] right-0 z-50 w-[300px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-3.5 text-paper-ink text-[12px] anim-pop">
                  <div className="flex items-center gap-2 pb-2 border-b border-paper-200">
                    <CoreMark className="w-5 h-5 text-core-500" />
                    <div>
                      <div className="font-semibold text-[13px]">CORE AI Inspector</div>
                      <div className="text-[11px] text-paper-mid">Telemetri Intervensi Kognitif</div>
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-paper-mid">DOM Interceptor</span>
                      <span className="font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Aktif
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-paper-mid">Dual-Layer Validator</span>
                      <span className="font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Standby
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-paper-mid">Anti Copy-Paste Guard</span>
                      <span className="font-medium text-core-600">Reflective Mode</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thread Percakapan */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto scroll-paper px-5"
        >
          <div className="max-w-[720px] mx-auto py-4 space-y-7">
            {/* Layar Awal Saat Chat Kosong */}
            {turns.length === 0 && !thinking && (
              <div className="pt-[8vh] pb-4 anim-rise space-y-6">
                <div>
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

                {/* Prompt Starter Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {STARTER_PROMPTS.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onDraftChange(starter.prompt);
                        onSubmit();
                        onToast?.('Pertanyaan Dimuat', starter.title, 'info');
                      }}
                      className="p-3.5 rounded-2xl bg-[#f0f4f9] hover:bg-[#e4ecf7] text-left transition-all border border-paper-200/60 group"
                    >
                      <div className="text-[13px] font-semibold text-paper-ink group-hover:text-core-600 transition-colors flex items-center justify-between">
                        {starter.title}
                        <ArrowUp className="w-3.5 h-3.5 rotate-45 text-paper-mid group-hover:text-core-500 transition-colors" />
                      </div>
                      <div className="text-[11.5px] text-paper-mid mt-1 leading-snug">
                        {starter.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bubble Percakapan */}
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
                      <span
                        className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-mode-intercept text-white flex items-center justify-center shadow-md cursor-help"
                        title="Pertanyaan ditahan oleh DOM Interceptor untuk mencegah cognitive offloading"
                      >
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

                    {/* Penanda Kunci Anti Copy-Paste */}
                    {t.locked && locked && (
                      <div className="mt-4 inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-[#fff1ec] text-[#a83a1b] ring-1 ring-[#ff6b4a]/30">
                        <Lock className="w-3 h-3" strokeWidth={2.6} />
                        <span className="text-[11px] font-semibold">
                          Teks dikunci CORE AI — tidak bisa diseleksi untuk melatih active recall
                        </span>
                      </div>
                    )}

                    {/* Message Actions (Thumbs Up, Down, Share, Copy) */}
                    <div className="mt-3 flex items-center gap-1 text-paper-mid">
                      {/* Thumbs Up */}
                      <button
                        onClick={() => handleFeedback(t.id, 'up')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          feedbackGiven[t.id] === 'up'
                            ? 'text-core-600 bg-blue-50'
                            : 'hover:bg-paper-100'
                        }`}
                        title="Respons yang baik"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>

                      {/* Thumbs Down */}
                      <button
                        onClick={() => handleFeedback(t.id, 'down')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          feedbackGiven[t.id] === 'down'
                            ? 'text-rose-600 bg-rose-50'
                            : 'hover:bg-paper-100'
                        }`}
                        title="Respons kurang memuaskan"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>

                      {/* Share */}
                      <button
                        onClick={handleShare}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper-100 transition-colors"
                        title="Bagikan respons"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(t.text, t.id, t.locked)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-paper-100 transition-colors"
                        title="Salin teks respons"
                      >
                        {copiedId === t.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Node yang disuntikkan CORE AI ke dalam thread */
                <div key={t.id} className="flex gap-4 anim-rise">
                  <span className="w-[26px] h-[26px] shrink-0 mt-0.5 rounded-full bg-ink-850 text-core-500 flex items-center justify-center shadow-xs">
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
                      <div className="font-mono text-[10.5px] text-core-500 mb-1.5 font-semibold">
                        CORE-AI · Respons dialihkan secara bertahap
                      </div>
                      {t.role === 'core' ? (
                        <p
                          className="text-[13.5px] leading-[1.7] text-hi/90"
                          dangerouslySetInnerHTML={{ __html: t.text }}
                        />
                      ) : (
                        <p className="text-[13.5px] leading-[1.7] text-hi/90 whitespace-pre-line">
                          {t.text}
                        </p>
                      )}
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
              className={`flex items-end gap-2 rounded-[26px] bg-[#f0f4f9] px-3 py-2 transition-all shadow-sm ${
                intercepted ? 'opacity-35 blur-[1.5px] saturate-50' : ''
              }`}
            >
              {/* Tombol Attachment (+) */}
              <div className="relative shrink-0" ref={attachRef}>
                <button
                  onClick={() => setShowAttachMenu((v) => !v)}
                  disabled={intercepted}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746] hover:bg-black/5 transition-colors"
                  title="Tambahkan lampiran"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Popover Lampiran */}
                {showAttachMenu && (
                  <div className="absolute bottom-[44px] left-0 z-50 w-[220px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-2 text-paper-ink text-[12.5px] anim-pop">
                    <button
                      onClick={() => {
                        onToast?.('Lampirkan Dokumen', 'Pilih berkas PDF atau teks', 'info');
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-paper-100 flex items-center gap-2.5"
                    >
                      <FileText className="w-4 h-4 text-core-500" /> Dokumen (PDF, Doc)
                    </button>
                    <button
                      onClick={() => {
                        onToast?.('Lampirkan Gambar', 'Pilih foto atau diagram', 'info');
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-paper-100 flex items-center gap-2.5"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" /> Gambar / Screenshot
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea Input */}
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
                placeholder={isRecording ? 'Mendengarkan ucapan Anda...' : 'Tanya Gemini'}
                className={`flex-1 bg-transparent resize-none outline-none text-[15px] text-paper-ink placeholder-paper-mid py-2 max-h-28 scroll-paper ${
                  isRecording ? 'text-core-600 italic font-medium' : ''
                }`}
              />

              {/* Action Buttons: Mic & Send */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Tombol Microphone */}
                <button
                  onClick={toggleVoiceRecording}
                  disabled={intercepted}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-md'
                      : 'text-[#444746] hover:bg-black/5'
                  }`}
                  title={isRecording ? 'Berhenti merekam' : 'Gunakan input suara'}
                >
                  {isRecording ? (
                    <MicOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Mic className="w-[18px] h-[18px]" />
                  )}
                </button>

                {/* Tombol Kirim / Gemini Live */}
                <button
                  onClick={() => {
                    if (draft.trim()) {
                      onSubmit();
                    } else {
                      setShowLiveModal(true);
                    }
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    draft.trim()
                      ? 'bg-paper-ink text-white hover:bg-black'
                      : 'text-[#444746] hover:bg-[#e3e7eb]'
                  }`}
                  title={draft.trim() ? 'Kirim pesan (Enter)' : 'Mulai Gemini Live Audio'}
                >
                  {draft.trim() ? (
                    <ArrowUp className="w-5 h-5" />
                  ) : (
                    <AudioLines className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Overlay Interception CORE AI */}
            {intercepted && <InterceptOverlay />}

            <p className="text-center text-[11px] text-paper-mid mt-2">
              Gemini dapat membuat kesalahan, jadi periksa kembali responsnya.
            </p>
          </div>
        </div>
      </div>

      {/* ---- Settings Modal Gemini ---- */}
      {showSettingsModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 anim-pop">
          <div className="w-[420px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden text-paper-ink">
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-core-500" />
                <h3 className="font-semibold text-[15px]">Setelan Gemini</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-paper-mid hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Model Default</div>
                  <div className="text-[11.5px] text-paper-mid">Pilihan model otomatis</div>
                </div>
                <span className="text-core-600 font-semibold">{selectedModel}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Respons Suara</div>
                  <div className="text-[11.5px] text-paper-mid">Kecepatan audio alami</div>
                </div>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Normal
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Ekstensi Terhubung</div>
                  <div className="text-[11.5px] text-paper-mid">CORE AI Orchestrator</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-core-600 text-[11px] font-semibold border border-blue-200">
                  Terhubung
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Tema Tampilan</div>
                  <div className="text-[11.5px] text-paper-mid">Gaya visual antarmuka</div>
                </div>
                <span className="text-paper-ink font-medium">Terang (Default)</span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-paper-50 border-t border-paper-200 flex justify-end">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  onToast?.('Setelan Disimpan', 'Konfigurasi Gemini diperbarui', 'success');
                }}
                className="px-5 py-2 rounded-full bg-core-500 text-white font-medium text-[12.5px] hover:bg-core-600 transition-colors shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Gemini Live Audio Modal ---- */}
      {showLiveModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 anim-pop">
          <div className="w-[360px] rounded-3xl bg-ink-950 text-white p-6 shadow-2xl ring-1 ring-white/10 flex flex-col items-center text-center relative overflow-hidden">
            <div
              className="aurora"
              style={{
                ['--tint' as string]: 'var(--color-core-500)',
                ['--tint2' as string]: '#9B72CB',
              }}
            />
            <div className="relative z-10 flex flex-col items-center w-full">
              <button
                onClick={() => setShowLiveModal(false)}
                className="absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-core-500 via-[#9B72CB] to-[#D96570] flex items-center justify-center my-6 shadow-xl animate-pulse">
                <AudioLines className="w-10 h-10 text-white" />
              </div>

              <h3 className="font-semibold text-[17px]">Gemini Live</h3>
              <p className="text-[12.5px] text-white/70 mt-1 max-w-[260px]">
                Percakapan suara dua arah secara langsung dengan model Gemini.
              </p>

              <button
                onClick={() => {
                  setShowLiveModal(false);
                  onToast?.('Sesi Gemini Live Berakhir', undefined, 'info');
                }}
                className="mt-6 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[13px] font-medium transition-colors"
              >
                Tutup Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Lapisan yang dipasang content script tepat di atas composer Gemini. */
const InterceptOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center anim-pop pointer-events-none">
    <div className="relative rounded-[26px] overflow-hidden bg-ink-950 shadow-lg pointer-events-auto">
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
