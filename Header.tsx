import React from 'react';
import {
  GraduationCap,
  Sparkles,
  PlusCircle,
  BarChart3,
  Layers,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface Props {
  activeTab: 'universities' | 'subjects' | 'analytics';
  onSelectTab: (tab: 'universities' | 'subjects' | 'analytics') => void;
  onOpenAddModal: () => void;
  onOpenDownloadModal: () => void;
  totalQuestionsCount: number;
  unseenQuestionsCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenDownloadModal,
  totalQuestionsCount,
  unseenQuestionsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel-elevated border-b border-violet-500/30 shadow-[0_4px_30px_rgba(139,92,246,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top brand row */}
        <div className="flex items-center justify-between py-3.5 gap-4">
          {/* Logo & Universities list */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              title="Vertex Exam Portal"
              className="w-11 h-11 rounded-2xl bg-linear-to-tr from-cyan-400 via-fuchsia-500 to-violet-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)] shrink-0 hover:scale-105 transition-transform"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <a
                  href="/"
                  title="Vertex Exam Portal"
                  className="font-black text-base sm:text-lg text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-pink-300 tracking-tight flex items-center gap-1.5 transition-colors"
                >
                  <span>Vertex Exam Portal</span>
                </a>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  ২০২৬-২৭ সেশন
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/70 font-medium hidden sm:block">
                নিয়মিত অনুশীলনের মাধ্যমে প্রস্তুতি হোক পূর্ণাঙ্গ • লাইভ মডেল টেস্ট ও নির্ভুল মূল্যায়ন
              </p>
            </div>
          </div>

          {/* Quick stats, Download & Add question button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel border border-violet-500/30 text-xs shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-slate-300">অদেখা প্রশ্ন:</span>
              <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-emerald-300">{unseenQuestionsCount}টি</span>
            </div>

            {/* Download / Install App button */}
            <button
              onClick={onOpenDownloadModal}
              className="px-3 sm:px-3.5 py-2 rounded-xl glass-panel hover:bg-white/10 text-cyan-300 border border-cyan-500/40 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              title="অ্যাপ ইনস্টল ও প্রশ্ন ডাউনলোড করুন"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping hidden sm:inline-block" />
              <span>ডাউনলোড</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3 sm:px-4 py-2 rounded-xl bg-linear-to-r from-fuchsia-500 via-pink-500 to-violet-600 hover:from-fuchsia-400 hover:to-violet-500 text-white font-black text-xs shadow-[0_0_20px_rgba(217,70,239,0.45)] hover:shadow-[0_0_30px_rgba(217,70,239,0.65)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">নতুন প্রশ্ন যোগ</span>
              <span className="sm:hidden">প্রশ্ন যোগ</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (100% Bengali) */}
        <div className="flex items-center gap-1.5 border-t border-violet-500/20 pt-1.5 pb-2.5 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          <button
            onClick={() => onSelectTab('universities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'universities'
                ? 'bg-linear-to-r from-cyan-500/20 via-violet-500/25 to-fuchsia-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === 'universities' ? 'text-amber-400 animate-bounce duration-1000' : 'text-amber-400/80'}`} />
            <span>বিশ্ববিদ্যালয় স্পেশাল মডেল টেস্ট</span>
          </button>

          <button
            onClick={() => onSelectTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-linear-to-r from-cyan-500/20 via-violet-500/25 to-fuchsia-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'subjects' ? 'text-cyan-400 animate-pulse' : 'text-cyan-400/80'}`} />
            <span>বিষয় ও অধ্যায়ভিত্তিক পরীক্ষা</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-linear-to-r from-cyan-500/20 via-violet-500/25 to-fuchsia-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-fuchsia-400' : 'text-fuchsia-400/80'}`} />
            <span>ফলাফল ও পূর্ববর্তী পরীক্ষার হিস্ট্রি</span>
          </button>
        </div>
      </div>
    </header>
  );
};
