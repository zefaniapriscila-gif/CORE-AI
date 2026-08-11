import React from 'react';
import { Sparkles, BookOpen, Search, MessageCircleHeart, HelpCircle, ShieldCheck } from 'lucide-react';
import { UserGoal, UserGoalOption } from '../../engine/coeTypes';

const GOAL_OPTIONS: UserGoalOption[] = [
  {
    id: 'instrumental',
    label: 'Untuk belajar atau memahami materi',
    sublabel: 'Mengerjakan tugas, menjawab pertanyaan kompleks, memahami konsep',
    iconName: 'BookOpen',
  },
  {
    id: 'trivia',
    label: 'Hanya mencari informasi singkat',
    sublabel: 'Pertanyaan trivia, fakta cepat, definisi',
    iconName: 'Search',
  },
  {
    id: 'interaksional',
    label: 'Berdiskusi atau ngobrol',
    sublabel: 'Percakapan santai, brainstorming, curhat',
    iconName: 'MessageCircleHeart',
  },
  {
    id: 'other',
    label: 'Lainnya',
    sublabel: 'Tujuan lain yang tidak tercantum di atas',
    iconName: 'HelpCircle',
  },
];

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  BookOpen, Search, MessageCircleHeart, HelpCircle,
};

interface WelcomeScreenProps {
  onSelectGoal: (goal: UserGoal) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectGoal }) => {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-md w-full">
        {/* CORE AI Extension Modal Overlay */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/8 border border-[#E3DDD3] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F4680A] to-[#F99D45] p-5 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-heading font-extrabold text-white tracking-tight">
              Halo! Apa tujuanmu<br/>menggunakan AI hari ini?
            </h2>
            <p className="text-white/80 text-[11px] mt-1.5 font-medium">
              CORE AI akan menyesuaikan pengalaman berdasarkan tujuanmu
            </p>
          </div>

          {/* Badge */}
          <div className="flex justify-center -mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-lg shadow-black/5 border border-[#E3DDD3] text-[10px] font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cognitive Orchestration Engine Aktif
            </div>
          </div>

          {/* Goal Options */}
          <div className="p-4 space-y-2 mt-2">
            {GOAL_OPTIONS.map((option) => {
              const Icon = iconMap[option.iconName] || HelpCircle;
              return (
                <button
                  key={option.id}
                  onClick={() => onSelectGoal(option.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#E3DDD3] bg-[#FAF8F6] hover:bg-[#FFF4EC] hover:border-[#F99D45] transition-all duration-200 text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF4EC] to-[#FFECDF] flex items-center justify-center text-[#F4680A] group-hover:from-[#F4680A] group-hover:to-[#F99D45] group-hover:text-white transition-all shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-800 group-hover:text-[#D95300] transition-colors">
                      {option.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {option.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-4 pb-4">
            <p className="text-[9px] text-slate-400 text-center leading-tight">
              Pilihan "Untuk belajar" akan mengaktifkan alur kognitif CORE AI.
              Pilihan lain akan menonaktifkan ekstensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
