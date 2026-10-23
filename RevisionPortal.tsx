import React, { useState } from 'react';
import { ExamAttemptResult, Question } from '../types/exam';
import { toggleBookmarkQuestion, getBookmarkedIds } from '../services/questionService';
import { stripOptionPrefix } from '../utils/questionParser';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  RotateCcw,
  GraduationCap
} from 'lucide-react';

interface Props {
  result: ExamAttemptResult;
  onBackToScoreboard: () => void;
  onRetakeMistakesOnly?: (mistakeQuestions: Question[]) => void;
}

type FilterType = 'wrong' | 'unanswered' | 'correct' | 'all' | 'bookmarked';

export const RevisionPortal: React.FC<Props> = ({
  result,
  onBackToScoreboard,
  onRetakeMistakesOnly,
}) => {
  const [filter, setFilter] = useState<FilterType>('wrong');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarkedIds());
  const [expandedAiExplanations, setExpandedAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

  // Toggle bookmark handler
  const handleBookmark = (questionId: string) => {
    toggleBookmarkQuestion(questionId);
    setBookmarkedIds(getBookmarkedIds());
  };

  // Ask AI Tutor for deeper shortcut or explanation
  const handleAskAiMentor = async (q: Question, studentAns: number | null) => {
    if (expandedAiExplanations[q.id]) {
      // Toggle collapse
      setExpandedAiExplanations(prev => {
        const next = { ...prev };
        delete next[q.id];
        return next;
      });
      return;
    }

    setLoadingAiId(q.id);
    try {
      const resp = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.stem,
          options: q.options,
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setExpandedAiExplanations(prev => ({
          ...prev,
          [q.id]: data.explanation || 'কোনো ব্যাখ্যা পাওয়া যায়নি।',
        }));
      } else {
        setExpandedAiExplanations(prev => ({
          ...prev,
          [q.id]: 'AI ব্যাখ্যা বর্তমানে অফলাইন। নিচের স্ট্যান্ডার্ড ব্যাখ্যাটি লক্ষ্য করুন।',
        }));
      }
    } catch (e) {
      setExpandedAiExplanations(prev => ({
        ...prev,
        [q.id]: 'সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। সাধারণ ব্যাখ্যা দেখুন।',
      }));
    } finally {
      setLoadingAiId(null);
    }
  };

  // Filter questions based on selection
  const filteredList = result.questions.map((q, idx) => {
    const record = result.userAnswers[idx];
    const isAnswered = record?.selectedOption !== null && record?.selectedOption !== undefined;
    const isCorrect = record?.isCorrect ?? false;
    const isWrong = isAnswered && !isCorrect;
    const isUnanswered = !isAnswered;
    const isBookmarked = bookmarkedIds.includes(q.id);

    return {
      question: q,
      index: idx,
      record,
      isCorrect,
      isWrong,
      isUnanswered,
      isBookmarked,
    };
  }).filter(item => {
    if (filter === 'wrong') return item.isWrong;
    if (filter === 'unanswered') return item.isUnanswered;
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'bookmarked') return item.isBookmarked;
    return true; // 'all'
  });

  const mistakeQuestions = result.questions.filter((_, idx) => {
    const record = result.userAnswers[idx];
    return record?.selectedOption !== null && !record?.isCorrect;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-500/30">
        <button
          onClick={onBackToScoreboard}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer w-fit px-3 py-1.5 rounded-xl glass-panel border border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>স্কোরবোর্ডে ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-white to-pink-300">
            ভুল উত্তরের বিশদ সমাধান ও রিভিশন মোড
          </h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-panel-elevated neon-border-violet">
        <button
          onClick={() => setFilter('wrong')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            filter === 'wrong'
              ? 'bg-linear-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-400'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>ভুল উত্তরসমূহ ({result.wrongCount})</span>
        </button>

        <button
          onClick={() => setFilter('unanswered')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            filter === 'unanswered'
              ? 'bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ছেড়ে দেওয়া ({result.unansweredCount})</span>
        </button>

        <button
          onClick={() => setFilter('correct')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            filter === 'correct'
              ? 'bg-linear-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>সঠিক উত্তর ({result.correctCount})</span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-300'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>সব প্রশ্ন ({result.totalQuestions})</span>
        </button>

        <button
          onClick={() => setFilter('bookmarked')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            filter === 'bookmarked'
              ? 'bg-linear-to-r from-amber-300 to-yellow-400 text-slate-950 shadow-lg shadow-amber-400/30 ring-1 ring-amber-200'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>বুকমার্ক ({bookmarkedIds.length})</span>
        </button>
      </div>

      {/* Retake mistakes button */}
      {mistakeQuestions.length > 0 && onRetakeMistakesOnly && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel-elevated border border-rose-500/50 shadow-lg shadow-rose-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-rose-500 via-red-400 to-pink-500" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                ভুল হওয়া {mistakeQuestions.length}টি প্রশ্ন দিয়ে রি-টেস্ট
              </h4>
              <p className="text-xs text-slate-300">
                ভুল সংশোধন করে শতভাগ নির্ভুল প্রস্তুতি নিশ্চিত করুন
              </p>
            </div>
          </div>
          <button
            onClick={() => onRetakeMistakesOnly(mistakeQuestions)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black shadow-md shadow-rose-600/30 transition-all cursor-pointer shrink-0"
          >
            ভুল প্রশ্নগুলোর পরীক্ষা দিন
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel-elevated neon-border-violet">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              এই ফিল্টারে কোনো প্রশ্ন নেই!
            </h3>
            <p className="text-xs text-slate-300">
              আপনি চমৎকার উত্তর দিয়েছেন অথবা এই ক্যাটাগরিতে কোনো প্রশ্ন চিহ্নিত নেই।
            </p>
          </div>
        ) : (
          filteredList.map(({ question: q, index, record, isCorrect, isWrong, isUnanswered, isBookmarked }) => {
            const studentAns = record?.selectedOption ?? null;
            const isAiExpanded = !!expandedAiExplanations[q.id];
            const isAiLoading = loadingAiId === q.id;

            return (
              <div
                key={`${q.id || 'rev'}-${index}`}
                className={`rounded-3xl glass-panel-elevated p-5 sm:p-6 transition-all relative overflow-hidden ${
                  isWrong
                    ? 'border border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : isCorrect
                    ? 'border border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'neon-border-violet'
                }`}
              >
                {/* Decorative neon top border */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-linear-to-r ${
                    isWrong
                      ? 'from-rose-500 via-pink-500 to-amber-500'
                      : isCorrect
                      ? 'from-emerald-400 via-teal-400 to-cyan-400'
                      : 'from-violet-500 via-fuchsia-500 to-cyan-500'
                  }`}
                />

                {/* Question Top Meta */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-violet-500/20 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3.5 py-1 rounded-xl bg-violet-900/40 text-cyan-300 text-xs font-bold border border-cyan-500/40 shadow-sm">
                      প্রশ্ন নং {index + 1}
                    </span>
                    {q.subjectBangla && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-linear-to-r from-violet-500/20 to-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold border border-fuchsia-500/30">
                        {q.subjectBangla}
                      </span>
                    )}
                    {q.chapter && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/60 text-slate-300 text-xs border border-violet-500/20">
                        {q.chapter}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isCorrect && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+১.০)
                      </span>
                    )}
                    {isWrong && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1 shadow-sm shadow-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> ভুল উত্তর (-০.২৫)
                      </span>
                    )}
                    {isUnanswered && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-medium border border-violet-500/20">
                        ছেড়ে দেওয়া (০.০)
                      </span>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmark(q.id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-linear-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30'
                          : 'glass-panel text-slate-400 hover:text-white border-violet-500/30'
                      }`}
                      title="রিভিশনের জন্য বুকমার্ক করুন"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Stem */}
                <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug mb-2.5 sm:mb-3">
                  {q.stem}
                </h3>

                {/* 4 Options Grid */}
                <div className="space-y-2 mb-5">
                  {q.options.map((optText, optIdx) => {
                    const isStudentChosen = studentAns === optIdx;
                    const isRealCorrect = q.correctAnswer === optIdx;

                    let optStyle = 'p-3 sm:p-3.5 rounded-2xl border text-sm flex items-center justify-between gap-3 transition-all ';

                    if (isRealCorrect) {
                      optStyle += 'bg-emerald-950/70 border-emerald-400 text-emerald-100 font-semibold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50';
                    } else if (isStudentChosen && !isRealCorrect) {
                      optStyle += 'bg-rose-950/70 border-rose-400 text-rose-100 font-semibold shadow-md shadow-rose-500/20 ring-1 ring-rose-400/50';
                    } else {
                      optStyle += 'glass-panel border-violet-500/20 text-slate-300 hover:border-violet-500/40';
                    }

                    return (
                      <div key={optIdx} className={optStyle}>
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                              isRealCorrect
                                ? 'bg-linear-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-sm'
                                : isStudentChosen
                                ? 'bg-linear-to-r from-rose-500 to-red-500 text-white shadow-sm'
                                : 'bg-slate-800/80 text-cyan-300 border border-violet-500/30 font-bold'
                            }`}
                          >
                            {optionLabels[optIdx]}
                          </span>
                          <span>{stripOptionPrefix(optText)}</span>
                        </div>

                        {isRealCorrect && (
                          <span className="text-xs text-emerald-300 font-bold shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> সঠিক উত্তর
                          </span>
                        )}
                        {isStudentChosen && !isRealCorrect && (
                          <span className="text-xs text-rose-300 font-bold shrink-0 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> আপনার দেওয়া উত্তর
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Step-by-Step Explanation Box */}
                <div className="p-4 sm:p-5 rounded-2xl glass-panel-elevated border border-amber-400/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-yellow-200 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                    <span>বিস্তারিত ব্যাখ্যা ও সমাধান</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {q.explanation}
                  </p>

                  {/* Shortcut Tip if available */}
                  {q.shortcutTip && (
                    <div className="mt-3 p-3.5 rounded-xl bg-linear-to-r from-amber-500/15 via-orange-500/15 to-pink-500/10 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">এডমিশন শর্টকাট ট্রিকস:</strong> {q.shortcutTip}
                      </div>
                    </div>
                  )}

                  {/* Ask AI Tutor Button */}
                  <div className="pt-2.5 border-t border-violet-500/20 flex items-center justify-between">
                    <button
                      onClick={() => handleAskAiMentor(q, studentAns)}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-200 hover:text-white font-bold py-1.5 px-3 rounded-xl bg-linear-to-r from-violet-600/30 via-indigo-600/30 to-fuchsia-600/30 hover:brightness-125 border border-cyan-400/40 shadow-sm shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{isAiLoading ? 'এআই টিউটর বিশ্লেষণ করছে...' : isAiExpanded ? 'এআই ব্যাখ্যা বন্ধ করুন' : 'এআই মেন্টরের কাছে আরও বিস্তারিত জানুন'}</span>
                    </button>
                  </div>

                  {/* AI Explanation Expanded Box */}
                  {isAiExpanded && (
                    <div className="p-4 rounded-xl bg-violet-950/60 border border-violet-500/40 text-xs text-violet-200 leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                        <GraduationCap className="w-4 h-4 text-cyan-300" />
                        <span>এডমিশন এআই মেন্টর মতামত:</span>
                      </div>
                      {expandedAiExplanations[q.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
