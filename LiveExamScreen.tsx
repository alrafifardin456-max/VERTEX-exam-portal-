import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exam, Question, ExamAttemptResult, UserAnswerRecord } from '../types/exam';
import { OMRPalette } from './OMRPalette';
import { CalculatorModal } from './CalculatorModal';
import { soundEffects } from '../utils/sound';
import { stripOptionPrefix } from '../utils/questionParser';
import {
  Clock,
  Maximize2,
  Minimize2,
  Calculator,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Flame,
  Layers,
  FileText,
  ArrowUp
} from 'lucide-react';

const OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ'] as const;

interface ScrollQuestionCardProps {
  q: Question;
  qIdx: number;
  totalQuestions: number;
  isAnswered: boolean;
  selectedOpt?: number;
  isMarked: boolean;
  onSelectOption: (qIndex: number, optionIndex: number) => void;
  onToggleReview: (qIndex: number) => void;
}

// Ultra high-performance memoized card with content-visibility to ensure 60-120fps smooth scrolling
const ScrollQuestionCard = React.memo<ScrollQuestionCardProps>(({
  q,
  qIdx,
  totalQuestions,
  isAnswered,
  selectedOpt,
  isMarked,
  onSelectOption,
  onToggleReview
}) => {
  return (
    <div
      id={`question-card-${qIdx}`}
      data-qindex={qIdx}
      className="mcq-outer-card h-auto flex flex-col justify-start rounded-2xl sm:rounded-3xl p-4 sm:p-5 sm:p-6 glass-panel-elevated neon-border-violet hover:border-violet-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-200 relative overflow-hidden group/card"
      style={{ height: 'auto', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
    >
      {/* Decorative top neon gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-violet-500 opacity-90 shadow-[0_0_10px_rgba(6,182,212,0.7)]" />

      {/* Question Header & Tags */}
      <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-violet-500/20 mb-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-linear-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-fuchsia-300 font-black text-xs sm:text-sm border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            প্রশ্ন নং {qIdx + 1} / {totalQuestions}
          </span>
          {q.subjectBangla && (
            <span className="px-2.5 py-0.5 rounded-lg glass-panel text-cyan-200 text-xs font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              {q.subjectBangla}
            </span>
          )}
          {q.chapter && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg glass-panel text-fuchsia-200 text-xs font-semibold border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]">
              {q.chapter}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleReview(qIdx)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMarked
                ? 'bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'glass-panel text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
            title="রিভিউ হিসেবে চিহ্নিত করুন"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isMarked ? 'রিভিউ মার্কড' : 'মার্ক করুন'}
            </span>
          </button>
        </div>
      </div>

      {/* Answer Locked Notification Banner */}
      {isAnswered && (
        <div className="mb-3 px-3.5 py-2 rounded-xl glass-panel border border-emerald-400/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs">
              <strong className="text-emerald-300">উত্তর সংরক্ষিত:</strong> অপশন ({OPTION_LABELS[selectedOpt!]}) নির্বাচন করা হয়েছে।
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-[10px] uppercase font-black tracking-wider shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            LOCKED
          </span>
        </div>
      )}

      {/* Question Title: flex-grow: 0, fixed bottom margin: 16px */}
      <div
        className="mcq-question-title grow-0 mb-4 shrink-0"
        style={{ flexGrow: 0, flexShrink: 0, marginTop: 0, marginBottom: '16px' }}
      >
        <h2 className="text-base sm:text-lg font-black text-white leading-snug font-sans drop-shadow-sm m-0">
          {q.stem}
        </h2>
      </div>

      {/* Options Container: directly underneath question title with small fixed gap: 12px (gap-3), NO empty spacer */}
      <div
        className="mcq-options-container flex flex-col gap-3 mt-0"
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 0, marginBottom: 0, flexGrow: 0, height: 'auto' }}
      >
        {q.options.map((optText, optIdx) => {
          const isSelected = selectedOpt === optIdx;

          let optionClass =
            'mcq-option-button group w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all duration-200 grow-0 h-auto ';

          if (isSelected) {
            optionClass +=
              'bg-emerald-500/40 border-[#39ff14] text-white shadow-[0_0_25px_rgba(57,255,20,0.6)] font-black cursor-default scale-[1.01]';
          } else if (isAnswered) {
            optionClass +=
              'glass-panel border-white/20 text-white/50 opacity-60 cursor-not-allowed';
          } else {
            optionClass +=
              'glass-panel hover:bg-white/25 border-white/35 hover:border-[#39ff14] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:scale-[1.01] text-white cursor-pointer active:scale-[0.99]';
          }

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelectOption(qIdx, optIdx)}
              disabled={isAnswered}
              className={optionClass}
              style={{ flexGrow: 0, height: 'auto' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-black flex items-center justify-center text-xs shrink-0 transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#39ff14] text-slate-950 shadow-[0_0_15px_rgba(57,255,20,0.8)]'
                      : isAnswered
                      ? 'bg-white/10 text-white/50 border border-white/20'
                      : 'bg-white/20 group-hover:bg-[#39ff14] group-hover:text-slate-950 border border-white/40 text-white shadow-sm'
                  }`}
                >
                  {OPTION_LABELS[optIdx]}
                </span>
                <span className="text-xs sm:text-sm leading-normal font-bold text-white">
                  {stripOptionPrefix(optText)}
                </span>
              </div>

              {isSelected && (
                <span className="flex items-center gap-1 text-xs text-[#39ff14] font-black shrink-0 shadow-sm">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">লকড</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

interface Props {
  exam: Exam;
  onFinishExam: (result: ExamAttemptResult) => void;
  onCancelExam: () => void;
}

export const LiveExamScreen: React.FC<Props> = ({ exam, onFinishExam, onCancelExam }) => {
  const [viewMode, setViewMode] = useState<'scroll' | 'single'>('scroll');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60); // 18 * 60 = 1080s
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimesRef = useRef<Record<number, number>>({});

  const timerRef = useRef<any>(null);
  const hasTriggeredWarning = useRef<boolean>(false);
  const hasSubmitted = useRef<boolean>(false);

  const currentQuestion: Question | undefined = exam.questions[currentIndex];
  const isCurrentAnswered = answers[currentIndex] !== undefined;
  const currentSelectedOption = answers[currentIndex];

  // Track time spent per question in ref without triggering re-renders
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    return () => {
      const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
      questionTimesRef.current[currentIndex] = (questionTimesRef.current[currentIndex] || 0) + elapsed;
    };
  }, [currentIndex]);

  // Timer countdown logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit('টাইম শেষ হয়ে গেছে!');
          return 0;
        }

        // Warning sound at 3 minutes (180s) and 1 minute (60s)
        if ((prev === 180 || prev === 60) && !hasTriggeredWarning.current) {
          soundEffects.playTimerAlert();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Lock answer handler (memoized with useCallback)
  const handleSelectOption = useCallback((qIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      if (prev[qIndex] !== undefined) return prev;
      soundEffects.playOptionLock();
      return {
        ...prev,
        [qIndex]: optionIndex,
      };
    });
  }, []);

  // Toggle review mark (memoized with useCallback)
  const handleToggleReview = useCallback((qIndex: number) => {
    soundEffects.playClick();
    setMarkedForReview(prev => ({
      ...prev,
      [qIndex]: !prev[qIndex],
    }));
  }, []);

  // Jump to specific question (smooth scroll in scroll mode)
  const handleSelectQuestion = (index: number) => {
    soundEffects.playClick();
    setCurrentIndex(index);
    if (viewMode === 'scroll') {
      const el = document.getElementById(`question-card-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Scroll to first question
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debounced Intersection observer to gently sync OMR palette active state without lagging scroll
  useEffect(() => {
    if (viewMode !== 'scroll') return;

    let debounceTimer: any = null;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(e => e.isIntersecting);
        if (!visible) return;
        const qIdStr = visible.target.getAttribute('data-qindex');
        if (qIdStr !== null) {
          const qId = parseInt(qIdStr, 10);
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            setCurrentIndex(prev => (prev === qId ? prev : qId));
          }, 150);
        }
      },
      { threshold: 0.2, rootMargin: '-10% 0px -60% 0px' }
    );

    exam.questions.forEach((_, i) => {
      const el = document.getElementById(`question-card-${i}`);
      if (el) observer.observe(el);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [viewMode, exam.questions.length]);

  // Navigation
  const handlePrev = () => {
    if (currentIndex > 0) {
      soundEffects.playClick();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      soundEffects.playClick();
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Submission calculation
  const handleAutoSubmit = (reason?: string) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    soundEffects.playCompletionFanfare();

    const totalQuestions = exam.questions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;

    const userAnswers: UserAnswerRecord[] = exam.questions.map((q, idx) => {
      const selected = answers[idx] ?? null;
      const isAnswered = selected !== null;
      const isCorrect = isAnswered && selected === q.correctAnswer;

      if (isAnswered) {
        answeredCount++;
        if (isCorrect) correctCount++;
        else wrongCount++;
      }

      return {
        questionIndex: idx,
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds: questionTimesRef.current[idx] || 0,
      };
    });

    const unansweredCount = totalQuestions - answeredCount;
    // Standard varsity marking: +1 for correct, -0.25 for wrong
    const rawScore = correctCount * exam.marksPerQuestion - wrongCount * exam.negativeMarks;
    const finalScore = Math.max(0, Number(rawScore.toFixed(2)));
    const accuracy = answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(1)) : 0;
    const timeTakenSeconds = exam.durationMinutes * 60 - secondsRemaining;

    // Estimate merit rank based on score among 15,000 simulated candidates
    const simulatedTotal = 15420;
    const scoreRatio = finalScore / exam.totalQuestions;
    const estimatedMeritRank = Math.max(1, Math.round(simulatedTotal * (1 - Math.pow(scoreRatio, 1.4)) * 0.95 + 1));

    const result: ExamAttemptResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      examTitle: exam.title,
      university: exam.university,
      category: exam.category,
      timestamp: Date.now(),
      totalQuestions,
      answeredCount,
      unansweredCount,
      correctCount,
      wrongCount,
      score: finalScore,
      maxScore: exam.totalQuestions,
      accuracy,
      timeTakenSeconds,
      userAnswers,
      questions: exam.questions,
      estimatedMeritRank,
      totalSimulatedCandidates: simulatedTotal,
    };

    onFinishExam(result);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.questions.length - answeredCount;
  const isTimeCritical = secondsRemaining <= 180; // 3 mins or less

  const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];
  const latinLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans select-none relative">
      {/* Top Header Bar (Sticky/Fixed at top so Countdown Timer, Score, and Actions remain pinned while scrolling) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/20 border-b border-white/30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.15)] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Exam Title & Tag */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-ping shrink-0" />
            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-black text-xs sm:text-base text-white truncate drop-shadow-sm">
                  {exam.title}
                </h1>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/40 shadow-sm shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/85 truncate hidden md:block font-bold">
                {exam.questions.length}টি প্রশ্ন • {exam.durationMinutes} মিনিট • OMR লকড সিস্টেম
              </p>
            </div>
          </div>

          {/* Center: Countdown Timer Display (Permanently visible while scrolling) */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border-2 font-mono-digits transition-all duration-300 shadow-md ${
                isTimeCritical
                  ? 'bg-rose-500/40 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'glass-panel border-white/50 text-white shadow-[0_0_20px_rgba(0,242,254,0.5)]'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${isTimeCritical ? 'text-rose-200 animate-spin' : 'text-[#39ff14] animate-pulse'}`} />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs text-white/90 font-bold hidden xs:inline">অবশিষ্ট সময়:</span>
                <span className="text-base sm:text-lg font-black tracking-widest text-white font-mono-digits drop-shadow-sm">
                  {formatTime(secondsRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Tools: View Switcher, Calculator, Fullscreen, Header Submit */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Switcher Toggle: Scroll vs Single */}
            <div className="glass-panel border border-violet-500/40 p-1 rounded-xl flex items-center shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              <button
                type="button"
                onClick={() => setViewMode('scroll')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'scroll'
                    ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="একটার নিচে আরেকটা সব প্রশ্ন স্ক্রল করে দেখুন"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">স্ক্রল ভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="একটি একটি করে প্রশ্ন দেখুন"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">একক ভিউ</span>
              </button>
            </div>

            {/* Calculator button */}
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl glass-panel hover:bg-white/10 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
              title="ক্যালকুলেটর খুলুন"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">ক্যালকুলেটর</span>
            </button>

            {/* Fullscreen button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl glass-panel hover:bg-white/10 text-slate-300 border border-violet-500/30 transition-all cursor-pointer hidden xs:flex active:scale-95 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
              title="ফুলস্ক্রিন মোড"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-fuchsia-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Header Submit button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-2.5 sm:px-4 py-1.5 rounded-xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সাবমিট <span className="font-mono-digits">({answeredCount}/{exam.questions.length})</span></span>
            </button>
          </div>
        </div>

        {/* Live Answer Progress Bar under Header */}
        <div className="w-full bg-slate-900/90 h-1.5 mt-2 sm:mt-2.5 rounded-full overflow-hidden border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          <div
            className="bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 h-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Questions Area (cols 12 on mobile, 8 on desktop) */}
        <div className="lg:col-span-8">
          {viewMode === 'scroll' ? (
            /* ======================================================== */
            /* 1. CONTINUOUS VERTICAL SCROLL FEED MODE (একটার নিচে আরেকটা) */
            /* ======================================================== */
            <div className="space-y-3.5 sm:space-y-4" style={{ overscrollBehavior: 'contain' }}>
              {exam.questions.map((q, qIdx) => (
                <ScrollQuestionCard
                  key={`${q.id || 'q'}-${qIdx}`}
                  q={q}
                  qIdx={qIdx}
                  totalQuestions={exam.questions.length}
                  isAnswered={answers[qIdx] !== undefined}
                  selectedOpt={answers[qIdx]}
                  isMarked={!!markedForReview[qIdx]}
                  onSelectOption={handleSelectOption}
                  onToggleReview={handleToggleReview}
                />
              ))}

              {/* Bottom Submit Section (একদম নিচে সাবমিট অংশ) */}
              <div className="mt-8 p-6 sm:p-8 rounded-3xl glass-panel-elevated border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.35)] space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-cyan-400 via-emerald-400 to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />

                <div className="max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>পরীক্ষার সকল প্রশ্ন সমাপ্ত</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-cyan-300 to-teal-200">
                    আপনি কি পরীক্ষা সাবমিট করতে প্রস্তুত?
                  </h3>
                  <p className="text-xs sm:text-sm text-cyan-200/70 font-medium">
                    সকল উত্তর ভালোভাবে দেখে নিয়ে নিচের বাটনে চাপ দিয়ে পরীক্ষা সমাপ্ত করুন।
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                  <div className="p-3.5 rounded-2xl glass-panel border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                    <div className="text-[11px] text-slate-300 font-medium">মোট প্রশ্ন</div>
                    <div className="text-lg font-black text-white font-mono-digits">{exam.questions.length}টি</div>
                  </div>
                  <div className="p-3.5 rounded-2xl glass-panel border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    <div className="text-[11px] text-emerald-300 font-medium">উত্তর সম্পন্ন</div>
                    <div className="text-lg font-black text-emerald-300 font-mono-digits">{answeredCount}টি</div>
                  </div>
                  <div className="p-3.5 rounded-2xl glass-panel border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <div className="text-[11px] text-amber-300 font-medium">রিভিউ মার্কড</div>
                    <div className="text-lg font-black text-amber-300 font-mono-digits">
                      {Object.values(markedForReview).filter(Boolean).length}টি
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl glass-panel border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                    <div className="text-[11px] text-cyan-300 font-medium">অবশিষ্ট সময়</div>
                    <div className={`text-lg font-black font-mono-digits ${isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
                      {formatTime(secondsRemaining)}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>চূড়ান্ত পরীক্ষা সাবমিট করুন ({answeredCount}/{exam.questions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScrollToTop}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl glass-panel hover:bg-white/10 text-cyan-300 hover:text-white font-extrabold text-xs sm:text-sm border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>উপরে প্রথম প্রশ্নে যান</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. SINGLE QUESTION PAGINATION MODE (একক প্রশ্ন ভিউ) */
            /* ======================================================== */
            <div
              className="mcq-outer-card h-auto flex flex-col justify-start glass-panel-elevated neon-border-violet rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.25)] relative overflow-hidden"
              style={{ height: 'auto', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
            >
              {/* Decorative top neon gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-violet-500 opacity-90 shadow-[0_0_10px_rgba(6,182,212,0.7)]" />

              <div className="h-auto flex flex-col justify-start">
                {/* Question Header & University Tag */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-violet-500/20 mb-3 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-linear-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-fuchsia-300 font-black text-xs sm:text-sm border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                      প্রশ্ন নং {currentIndex + 1} / {exam.questions.length}
                    </span>
                    {currentQuestion?.subjectBangla && (
                      <span className="px-2.5 py-0.5 rounded-lg glass-panel text-cyan-200 text-xs font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        {currentQuestion.subjectBangla}
                      </span>
                    )}
                    {currentQuestion?.chapter && (
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg glass-panel text-fuchsia-200 text-xs font-semibold border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                        {currentQuestion.chapter}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleReview(currentIndex)}
                      className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        markedForReview[currentIndex]
                          ? 'bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'glass-panel text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      }`}
                      title="রিভিউ হিসেবে চিহ্নিত করুন"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {markedForReview[currentIndex] ? 'রিভিউ মার্কড' : 'মার্ক করুন'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Answer Locked Notification Banner */}
                {isCurrentAnswered && (
                  <div className="mb-3 px-3.5 py-2 rounded-xl glass-panel border border-emerald-400/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in duration-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs">
                        <strong className="text-emerald-300">উত্তর সংরক্ষিত:</strong> অপশন ({optionLabels[currentSelectedOption!]}) নির্বাচন করা হয়েছে।
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-[10px] uppercase font-black tracking-wider shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      LOCKED
                    </span>
                  </div>
                )}

                {/* Question Title: flex-grow: 0, fixed bottom margin: 16px */}
                <div
                  className="mcq-question-title grow-0 mb-4 shrink-0"
                  style={{ flexGrow: 0, flexShrink: 0, marginTop: 0, marginBottom: '16px' }}
                >
                  <h2 className="text-base sm:text-lg font-black text-white leading-snug font-sans drop-shadow-sm m-0">
                    {currentQuestion?.stem}
                  </h2>
                </div>

                {/* Options Container: directly underneath question title with small fixed gap: 12px (gap-3), NO empty spacer */}
                <div
                  className="mcq-options-container flex flex-col gap-3 mt-0"
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 0, marginBottom: 0, flexGrow: 0, height: 'auto' }}
                >
                  {currentQuestion?.options.map((optText, optIdx) => {
                    const isSelected = currentSelectedOption === optIdx;

                    let optionClass =
                      'mcq-option-button group w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all duration-200 grow-0 h-auto ';

                    if (isSelected) {
                      optionClass +=
                        'bg-emerald-500/40 border-[#39ff14] text-white shadow-[0_0_25px_rgba(57,255,20,0.6)] font-black cursor-default scale-[1.01]';
                    } else if (isCurrentAnswered) {
                      optionClass +=
                        'glass-panel border-white/20 text-white/50 opacity-60 cursor-not-allowed';
                    } else {
                      optionClass +=
                        'glass-panel hover:bg-white/25 border-white/35 hover:border-[#39ff14] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:scale-[1.01] text-white cursor-pointer active:scale-[0.99]';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentIndex, optIdx)}
                        disabled={isCurrentAnswered}
                        className={optionClass}
                        style={{ flexGrow: 0, height: 'auto' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-black flex items-center justify-center text-xs shrink-0 transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#39ff14] text-slate-950 shadow-[0_0_15px_rgba(57,255,20,0.8)]'
                                : isCurrentAnswered
                                ? 'bg-white/10 text-white/50 border border-white/20'
                                : 'bg-white/20 group-hover:bg-[#39ff14] group-hover:text-slate-950 border border-white/40 text-white shadow-sm'
                            }`}
                          >
                            {optionLabels[optIdx]}
                          </span>
                          <span className="text-xs sm:text-sm leading-normal font-bold text-white">
                            {stripOptionPrefix(optText)}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs text-[#39ff14] font-black shrink-0 shadow-sm">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">লকড</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Controls in Single Mode */}
              <div className="mt-5 pt-3 border-t border-violet-500/20 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentIndex === 0
                      ? 'opacity-30 cursor-not-allowed glass-panel text-slate-600'
                      : 'glass-panel hover:bg-white/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>

                <div className="text-xs text-slate-300 font-bold hidden sm:block">
                  উত্তর সম্পন্ন: <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-emerald-300 font-extrabold">{answeredCount}</span> / {exam.questions.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === exam.questions.length - 1}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentIndex === exam.questions.length - 1
                      ? 'opacity-30 cursor-not-allowed glass-panel text-slate-600'
                      : 'bg-linear-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95'
                  }`}
                >
                  <span>পরবর্তী</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: OMR Palette (cols 4, sticky so it stays visible while scrolling) */}
        <div className="lg:col-span-4 h-full">
          <div className="lg:sticky lg:top-24">
            <OMRPalette
              totalQuestions={exam.questions.length}
              currentIndex={currentIndex}
              answers={answers}
              markedForReview={markedForReview}
              onSelectQuestion={handleSelectQuestion}
              onSubmitPrompt={() => setShowSubmitModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated border border-cyan-400/50 p-6 text-white shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />

            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 text-center mb-1">
              পরীক্ষা সমাপ্ত ও সাবমিট নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-cyan-200/70 text-center mb-5 font-medium">
              সাবমিট করার সাথে সাথেই প্রতিটি প্রশ্নের বিস্তারিত ব্যাখ্যা, সঠিক উত্তর এবং স্কোরবোর্ড দেখতে পাবেন।
            </p>

            {/* Quick summary grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
              <div className="p-3 rounded-2xl glass-panel border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="text-xl font-black font-mono-digits text-emerald-300">{answeredCount}</div>
                <div className="text-[11px] text-emerald-200/70 font-semibold">উত্তর দেওয়া</div>
              </div>
              <div className="p-3 rounded-2xl glass-panel border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <div className="text-xl font-black font-mono-digits text-rose-300">{unansweredCount}</div>
                <div className="text-[11px] text-rose-200/70 font-semibold">ছেড়ে দেওয়া</div>
              </div>
              <div className="p-3 rounded-2xl glass-panel border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <div className="text-xl font-black font-mono-digits text-amber-300">
                  {Object.values(markedForReview).filter(Boolean).length}
                </div>
                <div className="text-[11px] text-amber-200/70 font-semibold">রিভিউ মার্কড</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl glass-panel border border-amber-400/40 text-xs text-amber-200 mb-6 flex items-start gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                সময় অবশিষ্ট আছে: <strong className="font-mono-digits text-white font-bold">{formatTime(secondsRemaining)}</strong>। আপনি কি এখনই চূড়ান্ত সাবমিট করতে চান?
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl glass-panel hover:bg-white/10 text-slate-300 border border-slate-700/80 font-bold text-xs transition-all active:scale-95"
              >
                পরীক্ষায় ফিরে যান
              </button>
              <button
                onClick={() => handleAutoSubmit()}
                className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all active:scale-95"
              >
                হ্যাঁ, সাবমিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Component */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
