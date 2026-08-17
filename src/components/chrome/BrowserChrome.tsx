import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  Check,
  Pin,
  ExternalLink,
  Settings,
  HelpCircle,
  LogOut,
  Bookmark,
  History,
  Printer,
  Search,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Sliders,
  Globe,
} from 'lucide-react';
import { CoreMark } from '../brand/CoreMark';
import { GeminiSpark } from '../gemini/GeminiSpark';

export interface TabItem {
  id: string;
  title: string;
  active: boolean;
  closable?: boolean;
}

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

  /** Aksi menutup browser / kembali ke landing page (tombol red X). */
  onClose?: () => void;
  /** Aksi minimize window. */
  onMinimize?: () => void;
  /** Aksi toggle maximize / fullscreen window. */
  onToggleMaximize?: () => void;
  isMaximized?: boolean;

  /** Navigasi riwayat. */
  canGoBack?: boolean;
  onBack?: () => void;
  canGoForward?: boolean;
  onForward?: () => void;

  /** Reload / Refresh. */
  onReload?: () => void;
  isReloading?: boolean;

  /** Daftar tab peramban. */
  tabs?: TabItem[];
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onNewTab?: () => void;

  /** Notifikasi toast. */
  onToast?: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const BrowserChrome: React.FC<Props> = ({
  children,
  popup,
  extensionActive = false,
  attention = false,
  panelOpen = false,
  onTogglePanel,
  onClose,
  onMinimize,
  onToggleMaximize,
  isMaximized = false,
  canGoBack = false,
  onBack,
  canGoForward = false,
  onForward,
  onReload,
  isReloading = false,
  tabs = [{ id: 'gemini-main', title: 'Gemini', active: true }],
  onSelectTab,
  onCloseTab,
  onNewTab,
  onToast,
}) => {
  // Dropdowns / Modals state
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showExtensionsMenu, setShowExtensionsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [urlText, setUrlText] = useState('gemini.google.com/app');
  const [isPinned, setIsPinned] = useState(true);

  // Permissions state in security modal
  const [permissions, setPermissions] = useState({
    mic: true,
    clipboard: true,
    notifications: true,
  });

  const securityRef = useRef<HTMLDivElement>(null);
  const extensionsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (securityRef.current && !securityRef.current.contains(target)) {
        setShowSecurityModal(false);
      }
      if (extensionsRef.current && !extensionsRef.current.contains(target)) {
        setShowExtensionsMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookmarkToggle = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (next) {
      onToast?.(
        'Bookmark Ditambahkan',
        'Gemini telah disimpan ke "Bilah Bookmark"',
        'success'
      );
    } else {
      onToast?.('Bookmark Dihapus', 'Gemini dihapus dari bookmark', 'info');
    }
  };

  const handleZoomChange = (delta: number) => {
    const next = Math.min(150, Math.max(75, zoomLevel + delta));
    setZoomLevel(next);
    onToast?.(`Skala Tampilan: ${next}%`, undefined, 'info');
  };

  return (
    <div
      className={`relative flex flex-col h-full w-full overflow-hidden bg-white shadow-[0_30px_70px_-24px_rgba(16,24,60,.35)] ring-1 ring-[rgba(16,24,60,.12)] transition-all duration-300 ${
        isMaximized ? 'rounded-none' : 'rounded-[14px]'
      }`}
    >
      {/* ---- Tab Strip ---- */}
      <div className="h-[38px] bg-[#d8dce2] flex items-end shrink-0 pl-2 pr-0 select-none border-b border-[#cbd0d8]">
        <div className="flex items-end gap-1 min-w-0 max-w-[calc(100%-140px)]">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onSelectTab?.(tab.id)}
              className={`group relative flex items-center gap-2 h-[32px] pl-3 pr-2 min-w-[170px] max-w-[240px] rounded-t-[10px] cursor-pointer transition-all ${
                tab.active
                  ? 'bg-white text-paper-ink shadow-[0_-1px_3px_rgba(0,0,0,.08)] font-medium'
                  : 'bg-[#cfd4dc] text-[#555a64] hover:bg-[#e4e8ee]'
              }`}
            >
              <GeminiSpark className="w-[15px] h-[15px] shrink-0" />
              <span className="text-[12px] truncate flex-1 leading-none">
                {tab.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tabs.length === 1 && onClose) {
                    onClose();
                  } else {
                    onCloseTab?.(tab.id);
                  }
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-paper-mid hover:bg-black/10 hover:text-paper-ink transition-colors shrink-0"
                title="Tutup tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Tombol New Tab (+) */}
        <button
          onClick={onNewTab}
          className="w-7 h-[28px] mb-0.5 ml-1 rounded-full flex items-center justify-center text-[#555a64] hover:bg-black/10 transition-colors shrink-0"
          title="Tab baru (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Tombol Kontrol Jendela (Top-Right) */}
        <div className="ml-auto flex items-stretch h-[38px] text-paper-mid">
          <button
            onClick={onMinimize}
            className="w-11 flex items-center justify-center hover:bg-black/10 transition-colors"
            title="Minimalkan"
          >
            <Minus className="w-3.5 h-3.5 text-paper-ink" />
          </button>
          <button
            onClick={onToggleMaximize}
            className="w-11 flex items-center justify-center hover:bg-black/10 transition-colors"
            title={isMaximized ? 'Pulihkan' : 'Maksimalkan'}
          >
            <Square className="w-3 h-3 text-paper-ink" />
          </button>
          <button
            onClick={onClose}
            className="w-11 flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors group"
            title="Tutup peramban & kembali ke beranda"
          >
            <X className="w-3.5 h-3.5 group-hover:text-white text-paper-ink" />
          </button>
        </div>
      </div>

      {/* ---- Navigation Toolbar ---- */}
      <div className="h-[44px] bg-white flex items-center gap-1 px-2 shrink-0 border-b border-paper-200 relative">
        {/* Tombol Back */}
        <button
          onClick={canGoBack ? onBack : undefined}
          disabled={!canGoBack}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            canGoBack
              ? 'text-paper-mid hover:bg-paper-200 active:bg-paper-300'
              : 'text-paper-300 cursor-default'
          }`}
          title="Kembali (Alt + Panah Kiri)"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>

        {/* Tombol Forward */}
        <button
          onClick={canGoForward ? onForward : undefined}
          disabled={!canGoForward}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            canGoForward
              ? 'text-paper-mid hover:bg-paper-200 active:bg-paper-300'
              : 'text-paper-300 cursor-default'
          }`}
          title="Maju (Alt + Panah Kanan)"
        >
          <ArrowRight className="w-[18px] h-[18px]" />
        </button>

        {/* Tombol Reload */}
        <button
          onClick={onReload}
          className="w-8 h-8 rounded-full flex items-center justify-center text-paper-mid hover:bg-paper-200 transition-colors"
          title="Muat ulang halaman ini (Ctrl+R)"
        >
          <RotateCw
            className={`w-[15px] h-[15px] ${isReloading ? 'animate-spin text-core-500' : ''}`}
          />
        </button>

        {/* ---- Omnibox (Address Bar) ---- */}
        <div className="flex-1 h-8 mx-1 bg-paper-100 hover:bg-paper-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-core-500/40 transition-all rounded-full flex items-center gap-2 px-3 min-w-0 shadow-inner">
          {/* Tombol Ikon Keamanan / Gembok */}
          <button
            onClick={() => setShowSecurityModal((v) => !v)}
            className="flex items-center gap-1.5 text-paper-mid hover:text-paper-ink p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors"
            title="Lihat informasi situs"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </button>

          <input
            type="text"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onReload?.();
                onToast?.('Memuat URL...', urlText, 'info');
              }
            }}
            className="w-full bg-transparent border-none outline-none text-[13px] text-paper-ink truncate font-normal select-all"
            spellCheck={false}
          />

          {/* Tombol Bookmark (Bintang) */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-1 rounded-full hover:bg-black/5 transition-colors shrink-0 ${
              isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-paper-mid hover:text-paper-ink'
            }`}
            title={isBookmarked ? 'Edit bookmark' : 'Bookmark tab ini'}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* ---- Area Ekstensi ---- */}
        {/* Tombol Puzzle (Menu Ekstensi Chrome) */}
        <div className="relative" ref={extensionsRef}>
          <button
            onClick={() => setShowExtensionsMenu((v) => !v)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showExtensionsMenu ? 'bg-paper-200 text-paper-ink' : 'text-paper-mid hover:bg-paper-200'
            }`}
            title="Ekstensi Chrome"
          >
            <Puzzle className="w-[17px] h-[17px]" />
          </button>

          {/* Popover Ekstensi Chrome */}
          {showExtensionsMenu && (
            <div className="absolute top-[40px] right-0 z-50 w-[300px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-3 text-paper-ink anim-pop">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-paper-200">
                <span className="text-[13px] font-semibold">Ekstensi</span>
                <span className="text-[11px] text-paper-mid">1 terpasang</span>
              </div>
              <div className="mt-2 space-y-1">
                <div
                  onClick={() => {
                    onTogglePanel?.();
                    setShowExtensionsMenu(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-paper-100 cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-ink-850 text-core-500 flex items-center justify-center shrink-0">
                    <CoreMark className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-paper-ink truncate flex items-center gap-1.5">
                      CORE AI
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Aktif
                      </span>
                    </div>
                    <div className="text-[11px] text-paper-mid truncate">
                      v0.9.4 · Cognitive Friction
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPinned(!isPinned);
                      onToast?.(
                        isPinned ? 'CORE AI dilepas dari toolbar' : 'CORE AI disematkan ke toolbar',
                        undefined,
                        'info'
                      );
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      isPinned ? 'text-core-500' : 'text-paper-300 hover:text-paper-mid'
                    }`}
                    title={isPinned ? 'Lepas sematan' : 'Sematkan ke toolbar'}
                  >
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-paper-200 flex items-center justify-between px-2">
                <button
                  onClick={() => {
                    onToast?.('Pengelola Ekstensi Chrome', 'Semua ekstensi berjalan optimal', 'info');
                    setShowExtensionsMenu(false);
                  }}
                  className="text-[11.5px] text-core-500 hover:underline font-medium flex items-center gap-1"
                >
                  Kelola ekstensi <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ikon CORE AI yang di-pin di toolbar */}
        {isPinned && (
          <button
            onClick={onTogglePanel}
            data-core-toolbar-icon
            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
              extensionActive
                ? 'bg-ink-850 text-core-500 shadow-[0_0_10px_rgba(47,75,220,.2)]'
                : 'text-paper-mid hover:bg-paper-200'
            } ${attention ? 'anim-ring' : ''}`}
            title="Buka Menu CORE AI"
          >
            <CoreMark className="w-[19px] h-[19px]" strokeWidth={2.3} />
            {extensionActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-core-500 ring-2 ring-white" />
            )}
          </button>
        )}

        {/* Tombol Toggle Side Panel Chrome */}
        {panelOpen !== undefined && (
          <button
            onClick={onTogglePanel}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              panelOpen ? 'bg-paper-200 text-paper-ink' : 'text-paper-mid hover:bg-paper-200'
            }`}
            title={panelOpen ? 'Tutup panel samping' : 'Buka panel samping'}
          >
            <PanelRight
              className={`w-[17px] h-[17px] ${panelOpen ? 'text-core-600' : ''}`}
            />
          </button>
        )}

        {/* Profile Avatar (Z) */}
        <div className="relative ml-1 shrink-0" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285F4] to-[#9B72CB] text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-transparent hover:ring-paper-300 transition-all"
            title="Akun Google: Zefania Priscila"
          >
            Z
          </button>

          {/* Popover Akun Google */}
          {showProfileMenu && (
            <div className="absolute top-[40px] right-0 z-50 w-[290px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-4 text-paper-ink anim-pop">
              <div className="flex flex-col items-center text-center pb-3 border-b border-paper-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4285F4] to-[#9B72CB] text-white text-[18px] font-semibold flex items-center justify-center mb-2 shadow-md">
                  Z
                </div>
                <div className="text-[14px] font-semibold text-paper-ink">
                  Zefania Priscila
                </div>
                <div className="text-[12px] text-paper-mid mt-0.5">
                  zefaniapriscila@ugm.ac.id
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-core-600 text-[11px] font-medium border border-blue-100">
                  <Check className="w-3 h-3" /> Sinkronisasi Aktif
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    onToast?.('Akun Google', 'Membuka pengaturan akun...', 'info');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12.5px] hover:bg-paper-100 transition-colors flex items-center gap-2.5 text-paper-ink"
                >
                  <Settings className="w-4 h-4 text-paper-mid" /> Kelola Akun Google
                </button>
                <button
                  onClick={() => {
                    onToast?.('Beralih Profil', 'Mode Tamu aktif', 'info');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12.5px] hover:bg-paper-100 transition-colors flex items-center gap-2.5 text-paper-ink"
                >
                  <Globe className="w-4 h-4 text-paper-mid" /> Mode Tamu / Lainnya
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-paper-200">
                <button
                  onClick={() => {
                    onToast?.('Keluar Akun', 'Sesi tetap tersimpan di browser', 'info');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12.5px] text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Three Dots Menu (More) */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMoreMenu((v) => !v)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showMoreMenu ? 'bg-paper-200 text-paper-ink' : 'text-paper-mid hover:bg-paper-200'
            }`}
            title="Kustomisasi dan kontrol Google Chrome"
          >
            <MoreVertical className="w-[17px] h-[17px]" />
          </button>

          {/* Chrome 3-Dots Dropdown Menu */}
          {showMoreMenu && (
            <div className="absolute top-[40px] right-0 z-50 w-[240px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] py-1.5 text-paper-ink text-[12.5px] anim-pop">
              <button
                onClick={() => {
                  onNewTab?.();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center justify-between"
              >
                <span>Tab Baru</span>
                <span className="text-[11px] text-paper-mid">Ctrl+T</span>
              </button>
              <button
                onClick={() => {
                  onToast?.('Jendela Baru', 'Membuka jendela baru...', 'info');
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center justify-between"
              >
                <span>Jendela Baru</span>
                <span className="text-[11px] text-paper-mid">Ctrl+N</span>
              </button>

              <div className="my-1 border-t border-paper-200" />

              <button
                onClick={() => {
                  onToast?.('Riwayat Chrome', 'Menampilkan daftar riwayat...', 'info');
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center gap-2"
              >
                <History className="w-4 h-4 text-paper-mid" /> Riwayat
              </button>
              <button
                onClick={() => {
                  handleBookmarkToggle();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-paper-mid" /> Bookmark
              </button>

              <div className="my-1 border-t border-paper-200" />

              {/* Zoom Controls */}
              <div className="px-3.5 py-1.5 flex items-center justify-between">
                <span>Zoom</span>
                <div className="flex items-center gap-2 bg-paper-100 px-2 py-0.5 rounded-lg border border-paper-300">
                  <button
                    onClick={() => handleZoomChange(-10)}
                    className="hover:text-core-600 font-bold px-1"
                  >
                    -
                  </button>
                  <span className="text-[11px] font-mono font-medium">{zoomLevel}%</span>
                  <button
                    onClick={() => handleZoomChange(10)}
                    className="hover:text-core-600 font-bold px-1"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-paper-mid" /> Cetak...
              </button>

              <div className="my-1 border-t border-paper-200" />

              <button
                onClick={() => {
                  onTogglePanel?.();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center gap-2"
              >
                <Puzzle className="w-4 h-4 text-paper-mid" /> Ekstensi (CORE AI)
              </button>

              <button
                onClick={() => {
                  onToast?.('Tentang Google Chrome', 'Versi 134.0.6998 (Resmi 64-bit)', 'info');
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-paper-100 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-paper-mid" /> Bantuan
              </button>

              <div className="my-1 border-t border-paper-200" />

              {/* Tombol Keluar / Exit Browser */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onClose?.();
                }}
                className="w-full text-left px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" /> Keluar & Tutup Browser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Popover Informasi Keamanan Situs (Lock Icon Modal) ---- */}
      {showSecurityModal && (
        <div
          ref={securityRef}
          className="absolute top-[80px] left-12 z-50 w-[310px] rounded-2xl bg-white shadow-[0_12px_36px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] p-4 text-paper-ink anim-pop"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-paper-200">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight">
                Sambungan aman
              </div>
              <div className="text-[11px] text-paper-mid mt-0.5">
                gemini.google.com
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-[12px]">
            <div className="flex items-start justify-between text-paper-mid">
              <span>Sertifikat</span>
              <span className="text-emerald-700 font-medium text-right">
                Valid (Google Trust Services)
              </span>
            </div>
            <div className="flex items-start justify-between text-paper-mid">
              <span>Cookie & Data Situs</span>
              <span className="font-medium text-paper-ink">5 digunakan</span>
            </div>

            <div className="pt-2 border-t border-paper-200">
              <div className="text-[11.5px] font-semibold text-paper-ink mb-1.5">
                Izin Situs
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[11.5px] cursor-pointer">
                  <span>Mikrofon</span>
                  <input
                    type="checkbox"
                    checked={permissions.mic}
                    onChange={(e) =>
                      setPermissions((p) => ({ ...p, mic: e.target.checked }))
                    }
                    className="accent-core-500"
                  />
                </label>
                <label className="flex items-center justify-between text-[11.5px] cursor-pointer">
                  <span>Papan Klip</span>
                  <input
                    type="checkbox"
                    checked={permissions.clipboard}
                    onChange={(e) =>
                      setPermissions((p) => ({
                        ...p,
                        clipboard: e.target.checked,
                      }))
                    }
                    className="accent-core-500"
                  />
                </label>
                <label className="flex items-center justify-between text-[11.5px] cursor-pointer">
                  <span>Notifikasi</span>
                  <input
                    type="checkbox"
                    checked={permissions.notifications}
                    onChange={(e) =>
                      setPermissions((p) => ({
                        ...p,
                        notifications: e.target.checked,
                      }))
                    }
                    className="accent-core-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Viewport Konten ---- */}
      <div
        className="flex-1 min-h-0 flex bg-white"
        style={{ zoom: `${zoomLevel}%` }}
      >
        {children}
      </div>

      {/* ---- Popup Ekstensi Toolbar ---- */}
      {popup && (
        <div className="absolute top-[80px] right-[76px] z-40 anim-pop">
          {/* Caret penunjuk ke ikon toolbar */}
          <div className="absolute -top-[6px] right-[14px] w-3.5 h-3.5 rotate-45 rounded-[3px] bg-[#f7f9fd] shadow-[inset_1px_1px_0_rgba(16,24,60,.1)]" />
          {popup}
        </div>
      )}
    </div>
  );
};
