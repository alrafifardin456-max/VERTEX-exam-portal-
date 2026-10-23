import React, { useEffect } from 'react';
import { ExamAttemptResult } from '../types/exam';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Share2,
  HelpCircle,
  Sparkles,
  BarChart3,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';

interface Props {
  result: ExamAttemptResult;
  onOpenRevision: () => void;
  onRetakeWithNewQuestions: () => void;
  onGoHome: () => void;
}

export const ResultScoreboard: React.FC<Props> = ({
  result,
  onOpenRevision,
  onRetakeWithNewQuestions,
  onGoHome,
}) => {
  // Fire celebratory confetti on high accuracy
  useEffect(() => {
    try {
      if (result.score >= 20) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
        });
      }
    } catch (e) {}
  }, [result]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} মিনিট ${s} সেকেন্ড`;
  };

  // Performance tier determination
  const scorePercent = (result.score / result.maxScore) * 100;
  let statusBadge = {
    title: 'চমৎকার পারফরম্যান্স! শীর্ষ মেধাতালিকায় থাকার মতো!',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    advice: 'আপনার প্রস্তুতি রাজশাহী, চট্টগ্রাম ও জিএসটি এর কাঙ্ক্ষিত ইউনিটে চান্স পাওয়ার অত্যন্ত জোরালো অবস্থানে রয়েছে।',
  };

  if (scorePercent < 45) {
    statusBadge = {
      title: 'পুনরায় রিভিশন প্রয়োজন!',
      color: 'from-rose-500 to-red-600',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      advice: 'ভুল উত্তরগুলোর বিস্তারিত ব্যাখ্যা এখনই রিভিশন করুন এবং দুর্বল অধ্যায়গুলোতে আরও জোর দিন।',
    };
  } else if (scorePercent < 70) {
    statusBadge = {
      title: 'ভালো প্রস্তুতি! আরেকটু ঝালাই করলেই চান্স নিশ্চিত!',
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      advice: 'নেগেটিভ মার্কিং এড়াতে যেসব প্রশ্নে দ্বিধা থাকে সেগুলো সাবধানে দাগানোর কৌশল রপ্ত করুন।',
    };
  }

    return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner with Trophy */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated neon-border-violet p-6 sm:p-8 text-center shadow-2xl">
        {/* Top vibrant decorative gradient line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-pink-500" />
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 mb-4 animate-bounce duration-1000 ring-2 ring-amber-300/50">
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-linear-to-r from-violet-500/25 via-fuchsia-500/20 to-pink-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-semibold mb-2 shadow-sm">
              {result.category === 'university_live' && result.university !== 'ALL'
                ? `${result.university} স্পেশাল মডেল টেস্ট রিপোর্ট`
                : 'লাইভ মডেল টেস্ট রিপোর্ট'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-pink-200 mb-2">
            {result.examTitle}
          </h1>
          <p className={`text-sm sm:text-base font-bold ${statusBadge.text}`}>
            {statusBadge.title}
          </p>
          <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1">
            {statusBadge.advice}
          </p>

          {/* Main Score Callout */}
          <div className="mt-6 inline-flex flex-col items-center justify-center px-8 py-4 rounded-3xl bg-slate-950/70 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 relative">
            <div className="text-xs text-cyan-300 uppercase tracking-widest font-bold">প্রাপ্ত মোট নম্বর</div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono-digits text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 my-1">
              {result.score.toFixed(2)}
              <span className="text-xl sm:text-2xl font-normal text-slate-400"> / {result.maxScore}</span>
            </div>
            <div className="text-xs text-slate-400">
              নেগেটিভ মার্কিং সহ (ভুল উত্তরের জন্য -০.২৫)
            </div>
          </div>

          {/* Simulated Merit Rank Indicator */}
          <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-violet-950/50 border border-violet-500/40 text-xs text-slate-200 shadow-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              আনুমানিক মেধা অবস্থান: <strong className="text-white font-bold"><span className="font-mono-digits">{result.estimatedMeritRank}</span>তম</strong> (১৫,৪২০ জন পরীক্ষার্থীর মধ্যে)
            </span>
          </div>
        </div>
      </div>

      {/* 4-Stat Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Correct Answers */}
        <div className="p-4 rounded-2xl glass-panel-elevated neon-border-emerald text-center hover:scale-[1.02] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 shadow-sm shadow-emerald-500/30">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-emerald-400">
            {result.correctCount}
          </div>
          <div className="text-xs text-emerald-200/80 mt-0.5 font-medium">সঠিক উত্তর (+{result.correctCount})</div>
        </div>

        {/* Wrong Answers */}
        <div className="p-4 rounded-2xl glass-panel-elevated border border-rose-500/40 hover:border-rose-400/70 shadow-sm shadow-rose-500/10 text-center hover:scale-[1.02] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto mb-2 border border-rose-500/30 shadow-sm shadow-rose-500/30">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-rose-400">
            {result.wrongCount}
          </div>
          <div className="text-xs text-rose-200/80 mt-0.5 font-medium">ভুল উত্তর (-{(result.wrongCount * 0.25).toFixed(2)})</div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-2xl glass-panel-elevated neon-border-cyan text-center hover:scale-[1.02] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-2 border border-cyan-500/30 shadow-sm shadow-cyan-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono-digits text-cyan-300">
            {result.accuracy}%
          </div>
          <div className="text-xs text-cyan-200/80 mt-0.5 font-medium">নির্ভুলতার হার (Accuracy)</div>
        </div>

        {/* Time Taken */}
        <div className="p-4 rounded-2xl glass-panel-elevated border border-amber-500/40 hover:border-amber-400/70 shadow-sm shadow-amber-500/10 text-center hover:scale-[1.02] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2 border border-amber-500/30 shadow-sm shadow-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-lg font-black font-mono-digits text-amber-300 truncate">
            {formatTime(result.timeTakenSeconds)}
          </div>
          <div className="text-xs text-amber-200/80 mt-0.5 font-medium">সময় ব্যয় (১৮ মিনিটের মধ্যে)</div>
        </div>
      </div>

      {/* Prominent Action Bar for Revision & Next Exams */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel-elevated neon-border-violet shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-amber-400 via-pink-500 to-cyan-400" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-400 via-orange-500 to-pink-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-white to-pink-200 text-base">
              ভুল উত্তরের সঠিক ব্যাখ্যা ও রিভিশন পোর্টাল
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              ভুল হওয়া {result.wrongCount}টি এবং ছেড়ে দেওয়া {result.unansweredCount}টি প্রশ্নের বিশদ সমাধান ও ট্রিকস দেখুন
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRevision}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-amber-400 via-orange-500 to-pink-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>রিভিশন শুরু করুন</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Additional Secondary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onRetakeWithNewQuestions}
          className="p-4 rounded-2xl glass-panel-elevated border border-violet-500/30 hover:border-emerald-400/60 text-left flex items-center justify-between group transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">নতুন প্রশ্ন দিয়ে পরীক্ষা</div>
              <div className="text-xs text-slate-400">নতুন ৩৫টি প্রশ্ন আসবে</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={() => window.print()}
          className="p-4 rounded-2xl glass-panel-elevated border border-violet-500/30 hover:border-cyan-400/60 text-left flex items-center justify-between group transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-sm shadow-cyan-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">PDF ডাউনলোড / প্রিন্ট</div>
              <div className="text-xs text-slate-400">পরীক্ষার ফলাফল ও শিট সেভ করুন</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </button>

        <button
          onClick={onGoHome}
          className="p-4 rounded-2xl glass-panel-elevated border border-violet-500/30 hover:border-fuchsia-400/60 text-left flex items-center justify-between group transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30 flex items-center justify-center shadow-sm shadow-fuchsia-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">অন্যান্য বিষয় বা অধ্যায়</div>
              <div className="text-xs text-slate-400">অধ্যায়ভিত্তিক পরীক্ষা দিন</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};
