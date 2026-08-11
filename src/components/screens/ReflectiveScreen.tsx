import React, { useState, useCallback } from 'react';
import { Send, PenTool, Lock, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { countWords, validateUserSummary } from '../../engine/dualLayerValidator';
import { DualLayerValidationResult } from '../../engine/coeTypes';

interface ReflectiveScreenProps {
  aiOriginalResponse: string;
  onSubmitSummary: (summary: string) => void;
  isSubmitted: boolean;
}

export const ReflectiveScreen: React.FC<ReflectiveScreenProps> = ({
  aiOriginalResponse,
  onSubmitSummary,
  isSubmitted,
}) => {
  const [summaryText, setSummaryText] = useState('');
  const [validation, setValidation] = useState<DualLayerValidationResult | null>(null);
  const [showError, setShowError] = useState(false);

  const wordCount = countWords(summaryText);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }, []);

  const handleSubmit = () => {
    const result = validateUserSummary(summaryText, aiOriginalResponse);
    setValidation(result);
    if (result.isValid) {
      onSubmitSummary(summaryText.trim());
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-300/50">
          <PenTool className="w-3 h-3 text-emerald-600" />
          <span className="text-[9px] font-bold text-emerald-700">Reflective Mode</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* CORE AI instruction */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-emerald-200/50 max-w-[90%]">
            <p className="text-[10px] font-bold text-emerald-800 mb-2 uppercase tracking-wider">
              CORE AI · Reflective Mode
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
              Sekarang, rangkum jawaban AI sebelumnya <strong>dengan kata-katamu sendiri</strong>. Jangan copy-paste — proses ini melatih <em>retrieval practice</em> dan memperkuat konsolidasi memori.
            </p>
            <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2 border border-emerald-200/30">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-[9px] text-emerald-700 font-semibold">
                Anti Copy-Paste: Teks AI tidak dapat diseleksi • Paste diblokir di textarea
              </p>
            </div>
          </div>
        </div>

        {/* Summary textarea */}
        {!isSubmitted && (
          <div className="ml-10 max-w-[85%]">
            <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 p-3 space-y-2">
              <textarea
                value={summaryText}
                onChange={e => setSummaryText(e.target.value)}
                onPaste={handlePaste}
                placeholder="Tulis rangkumanmu di sini dengan kata-katamu sendiri..."
                className="w-full h-24 bg-[#FAFDF9] rounded-xl p-3 text-[12px] text-slate-800 outline-none resize-none border border-emerald-200/50 focus:border-emerald-400 transition-colors placeholder-slate-400"
                rows={4}
              />
              
              {/* Word count */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${wordCount >= 20 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {wordCount}/20 kata min.
                  </span>
                  {wordCount >= 20 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={wordCount < 5}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold rounded-lg hover:shadow-md hover:shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  Kirim Rangkuman
                </button>
              </div>

              {/* Paste blocked alert */}
              {showError && (
                <div className="flex items-center gap-2 bg-red-50 rounded-lg p-2 border border-red-200 animate-shake">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-[10px] text-red-700 font-semibold">
                    Copy-paste terdeteksi & diblokir! Tulis dengan kata-katamu sendiri.
                  </p>
                </div>
              )}

              {/* Validation result */}
              {validation && !validation.isValid && (
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-800 font-bold">Dual-Layer Validation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className={`flex items-center gap-1 ${validation.isLengthValid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {validation.isLengthValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      Layer 1: {validation.wordCount} kata {validation.isLengthValid ? '✓' : '(min 20)'}
                    </div>
                    <div className={`flex items-center gap-1 ${validation.isSimilarityValid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {validation.isSimilarityValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      Layer 2: {Math.round(validation.similarityScore * 100)}% similarity {validation.isSimilarityValid ? '✓' : '(max 80%)'}
                    </div>
                  </div>
                  <p className="text-[9px] text-amber-700 mt-1">{validation.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submitted state */}
        {isSubmitted && (
          <div className="ml-10 max-w-[85%]">
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-[10px] font-bold text-emerald-800">Rangkuman tervalidasi!</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <span className="text-emerald-700">✓ Layer 1: Panjang ≥ 20 kata</span>
                <span className="text-emerald-700">✓ Layer 2: Kemiripan &lt; 80%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
