import React from 'react';
import { getExamHistory, getSeenQuestionIds, getAllQuestions, resetSeenQuestions } from '../services/questionService';
import {
  Trophy,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Target,
  Sparkles,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';

interface Props {
  onReviewExam: (examResultId: string) => void;
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<Props> = ({ onReviewExam, onRefresh }) => {
  const history = getExamHistory();
  const seenIds = getSeenQuestionIds();
  const allQuestions = getAllQuestions();

  const totalExams = history.length;
  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalExams > 0 ? (totalScore / totalExams).toFixed(2) : '0';
  const avgAccuracy = totalExams > 0
    ? (history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalExams).toFixed(1)
    : '0';

  const handleResetHistory = () => {
    if (confirm('আপনি কি পূর্ববর্তী দেখা প্রশ্নের তালিকা রিসেট করতে চান? এর ফলে সবগুলো প্রশ্ন পুনরায় নতুন হিসেবে পরীক্ষা দিতে পারবেন।')) {
      resetSeenQuestions();
      onRefresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel-elevated neon-border-violet text-center">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-cyan-300 border border-violet-500/30 flex items-center justify-center mx-auto mb-2 shadow-sm shadow-violet-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-white">{totalExams}</div>
          <div className="text-xs text-slate-300 mt-0.5 font-medium">মোট সম্পন্ন পরীক্ষা</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel-elevated neon-border-emerald text-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-sm shadow-emerald-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-emerald-400">{avgScore}</div>
          <div className="text-xs text-emerald-200/80 mt-0.5 font-medium">গড় নম্বর (৩৫ এ)</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel-elevated neon-border-cyan text-center">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 shadow-sm shadow-cyan-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-cyan-300">{avgAccuracy}%</div>
          <div className="text-xs text-cyan-200/80 mt-0.5 font-medium">গড় নির্ভুলতার হার</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel-elevated border border-amber-500/40 text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-sm shadow-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-amber-300">
            {seenIds.length} / {allQuestions.length}
          </div>
          <div className="text-xs text-amber-200/80 mt-0.5 font-medium">অনুশীলিত প্রশ্ন সংখ্যা</div>
        </div>
      </div>

      {/* Unique Question Serving Banner */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel-elevated neon-border-violet flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400" />
        <div>
          <h3 className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-200 via-white to-pink-200 text-sm sm:text-base mb-1">
            ইউনিক প্রশ্ন রোটেশন অ্যালগরিদম সক্রিয়
          </h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            নিয়মানুযায়ী একবার পরীক্ষা দেওয়া প্রশ্ন আর পুনরায় রিপিট হবে না। যদি আপনি আবার সম্পূর্ণ প্রশ্ন ব্যাংক পুনরায় প্র্যাকটিস করতে চান তবে নিচে রিসেট করতে পারেন।
          </p>
        </div>

        <button
          onClick={handleResetHistory}
          className="px-4 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-cyan-300 hover:text-white font-bold text-xs border border-cyan-500/40 shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>দেখা প্রশ্নের ইতিহাস রিসেট</span>
        </button>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-cyan-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>বিগত পরীক্ষার ফলাফল ও রিভিউ</span>
        </h3>

        {history.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel-elevated neon-border-violet text-center text-slate-300 text-xs">
            এখনও কোনো পরীক্ষা সম্পন্ন হয়নি। হোম স্ক্রিন থেকে যেকোনো লাইভ টেস্ট বা অধ্যায়ভিত্তিক টেস্ট শুরু করুন!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl glass-panel-elevated border border-violet-500/30 hover:border-cyan-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-violet-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      লাইভ টেস্ট
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {new Date(item.timestamp).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{item.examTitle}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="text-emerald-400 font-semibold">সঠিক: {item.correctCount}</span>
                    <span className="text-rose-400 font-semibold">ভুল: {item.wrongCount}</span>
                    <span className="text-cyan-300 font-semibold">নির্ভুলতা: {item.accuracy}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono-digits text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">
                      {item.score.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal"> / {item.maxScore}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">মেধা স্থান: {item.estimatedMeritRank}তম</div>
                  </div>

                  <button
                    onClick={() => onReviewExam(item.id)}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
                  >
                    রিভিউ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
