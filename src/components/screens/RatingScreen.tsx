import React, { useState } from 'react';
import { Star, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface RatingScreenProps {
  onSubmitRating: (rating: number) => void;
  isSubmitted: boolean;
}

export const RatingScreen: React.FC<RatingScreenProps> = ({
  onSubmitRating,
  isSubmitted,
}) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleSubmit = () => {
    if (selected > 0) {
      onSubmitRating(selected);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Kurang membantu',
    2: 'Cukup membantu',
    3: 'Lumayan membantu',
    4: 'Sangat membantu',
    5: 'Luar biasa membantu!',
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-sm w-full">
        {!isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/8 border border-[#E3DDD3] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F4680A] to-[#F99D45] p-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Sesi Selesai! 🎉
              </h3>
              <p className="text-white/80 text-[11px] mt-1">
                Bagaimana pengalamanmu menggunakan CORE AI?
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Star rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setSelected(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hovered || selected)
                            ? 'text-[#F4680A] fill-[#F4680A]'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hovered || selected) > 0 && (
                  <p className="text-[11px] text-slate-600 font-medium animate-fadeIn">
                    {ratingLabels[hovered || selected]}
                  </p>
                )}
              </div>

              {/* Session stats */}
              <div className="bg-[#FAF8F6] rounded-xl p-3 border border-[#E3DDD3]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ringkasan Sesi</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-600">Socratic terjawab</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-600">Refleksi tervalidasi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-600">Counterargument dieksplorasi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-600">Scaffold digunakan</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selected === 0}
                className="w-full py-2.5 bg-gradient-to-r from-[#F4680A] to-[#F99D45] text-white text-[12px] font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Kirim Rating & Sinkronkan
              </button>

              <p className="text-[9px] text-center text-slate-400">
                Data sesi akan disinkronkan ke akun pengguna
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/8 border border-[#E3DDD3] p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 mb-1">
              Terima Kasih!
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Rating {selected}★ telah dikirim dan sesi telah disinkronkan ke akun.
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-700 bg-emerald-50 rounded-lg py-2 px-3 border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              <span className="font-bold">CORE AI melatih working memory & retrieval-mu hari ini!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
