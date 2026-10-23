import React from 'react';
import { Lock, Bookmark, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number>; // questionIndex -> selectedOption
  markedForReview: Record<number, boolean>;
  onSelectQuestion: (index: number) => void;
  onSubmitPrompt: () => void;
}

export const OMRPalette: React.FC<Props> = ({
  totalQuestions,
  currentIndex,
  answers,
  markedForReview,
  onSelectQuestion,
  onSubmitPrompt,
}) => {
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const remainingCount = totalQuestions - answeredCount;

  return (
    <div className="glass-panel-elevated neon-border-violet rounded-3xl p-5 shadow-[0_0_30px_rgba(139,92,246,0.22)] flex flex-col h-full relative overflow-hidden">
      {/* Decorative top neon gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-[0_0_10px_rgba(6,182,212,0.7)]" />

      {/* Title & Stats */}
      <div className="pb-3.5 border-b border-violet-500/20">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-pink-300 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            OMR প্রশ্ন প্যালেট (৩৫টি প্রশ্ন)
          </h4>
          <span className="text-xs font-mono-digits font-extrabold px-3 py-1 rounded-full bg-linear-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            {answeredCount}/{totalQuestions}
          </span>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-cyan-200/80 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-[0_0_8px_rgba(16,185,129,0.6)]">
              ✓
            </span>
            <span>উত্তর সংরক্ষিত ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-[0_0_8px_rgba(245,158,11,0.6)]">
              ★
            </span>
            <span>রিভিউ মার্কড ({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg border-2 border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span>বর্তমান প্রশ্ন</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg glass-panel border border-slate-700/80" />
            <span>অনুত্তরিত ({remainingCount})</span>
          </div>
        </div>
      </div>

      {/* Bubble Grid (35 items) */}
      <div className="flex-1 overflow-y-auto py-3.5">
        <div className="grid grid-cols-7 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const isCurrent = currentIndex === i;
            const isAnswered = answers[i] !== undefined;
            const isMarked = !!markedForReview[i];

            let buttonClass = 'relative flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black transition-all duration-150 active:scale-95 cursor-pointer ';

            if (isCurrent) {
              buttonClass += 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.55)] ';
            }

            if (isAnswered) {
              buttonClass += 'bg-linear-to-tr from-emerald-400 to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.55)] border border-emerald-300/80';
            } else if (isMarked) {
              buttonClass += 'bg-linear-to-tr from-amber-400 to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.55)] border border-amber-300/80';
            } else if (isCurrent) {
              buttonClass += 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80';
            } else {
              buttonClass += 'glass-panel hover:bg-white/10 text-slate-200 hover:text-white border border-slate-700/80 hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)]';
            }

            return (
              <button
                key={i}
                onClick={() => onSelectQuestion(i)}
                className={buttonClass}
                title={`প্রশ্ন ${i + 1} এ যান`}
              >
                <span>{i + 1}</span>
                {isAnswered && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-950 text-emerald-400 rounded-full border border-emerald-400 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.8)]">
                    <Lock className="w-2 h-2 text-emerald-400" />
                  </span>
                )}
                {!isAnswered && isMarked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lock Warning Note & Submit Button */}
      <div className="pt-3 border-t border-violet-500/20 mt-auto">
        <div className="p-3 rounded-2xl glass-panel border border-amber-400/40 text-[11px] text-amber-200 flex items-start gap-2 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-medium">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">সতর্কতা:</strong> একটি অপশনে ক্লিক করলেই উত্তর স্থায়ীভাবে লক হবে, পরবর্তীতে আর পরিবর্তন করা যাবে না!
          </span>
        </div>

        <button
          onClick={onSubmitPrompt}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_25px_rgba(16,185,129,0.55)] hover:shadow-[0_0_35px_rgba(6,182,212,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>পরীক্ষা সাবমিট করুন ({answeredCount}/{totalQuestions})</span>
        </button>
      </div>
    </div>
  );
};
