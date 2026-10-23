import React, { useState, useEffect } from 'react';
import { University, Subject, Exam, ExamAttemptResult, Question } from './types/exam';
import { Header } from './components/Header';
import { UniversityExamGrid } from './components/UniversityExamGrid';
import { SubjectChapterView } from './components/SubjectChapterView';
import { LiveExamScreen } from './components/LiveExamScreen';
import { ResultScoreboard } from './components/ResultScoreboard';
import { RevisionPortal } from './components/RevisionPortal';
import { AnalyticsView } from './components/AnalyticsView';
import { AddQuestionModal } from './components/AddQuestionModal';
import { DownloadModal } from './components/DownloadModal';
import { ScreenCaptureProtection } from './components/ScreenCaptureProtection';
import {
  createDynamicExam,
  saveExamResult,
  getAllQuestions,
  getSeenQuestionIds,
  getExamHistory
} from './services/questionService';
import {
  Clock,
  Lock,
  Sparkles,
  BookOpen,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Layers,
  Download
} from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'live_exam' | 'result' | 'revision'>('home');
  const [activeTab, setActiveTab] = useState<'universities' | 'subjects' | 'analytics'>('universities');
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentResult, setCurrentResult] = useState<ExamAttemptResult | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTarget, setAddModalTarget] = useState<{ subject?: Subject; chapter?: string } | undefined>(undefined);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [loadingText, setLoadingText] = useState('প্রশ্নপত্র তৈরি হচ্ছে...');
  const [loadingProgress, setLoadingProgress] = useState(25);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = (prefill?: { subject?: Subject; chapter?: string }) => {
    setAddModalTarget(prefill);
    setIsAddModalOpen(true);
  };

  const allQuestions = getAllQuestions();
  const seenIds = getSeenQuestionIds();
  const unseenCount = Math.max(0, allQuestions.length - seenIds.length);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen, activeTab]);

  // Start any dynamic or curated exam (Fast 2-3 second guaranteed load time)
  const handleStartExam = async (options: {
    university?: University;
    subject?: Subject;
    chapter?: string;
    title?: string;
    category?: 'university_live' | 'subject_wise' | 'chapter_wise' | 'ai_dynamic';
  }) => {
    setIsLoadingExam(true);
    setLoadingProgress(25);
    setLoadingText('২০২৬-২৭ সেশনের বিগত বছরের ট্রেন্ড থেকে ৩৫টি ইউনিক প্রশ্ন সাজানো হচ্ছে...');

    const startTime = Date.now();

    try {
      // Instantly prepare 35 questions from question bank
      const examPromise = createDynamicExam({
        ...options,
        preferUnseen: true,
      });

      // Smooth staged progress across 2.2 seconds
      const t1 = setTimeout(() => {
        setLoadingProgress(65);
        setLoadingText('৩৫টি প্রশ্ন, ৪টি অপশন ও OMR লকড ফরম্যাট দ্রুত সিঙ্ক হচ্ছে...');
      }, 750);

      const t2 = setTimeout(() => {
        setLoadingProgress(92);
        setLoadingText('১৮ মিনিটের টাইমার প্রস্তুত... পরীক্ষা এখনই শুরু হচ্ছে!');
      }, 1500);

      const exam = await examPromise;

      // Ensure total load time strictly lands around 2.2 seconds (২-৩ সেকেন্ডের মধ্যে দ্রুত শুরু)
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 2200 - elapsed);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      clearTimeout(t1);
      clearTimeout(t2);
      setLoadingProgress(100);

      setCurrentExam(exam);
      setScreen('live_exam');
    } catch (error) {
      console.error('Failed to create exam', error);
      alert('পরীক্ষা লোড করতে কিছুটা সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoadingExam(false);
      setLoadingProgress(0);
    }
  };

  // Exam completion handler
  const handleFinishExam = (result: ExamAttemptResult) => {
    saveExamResult(result);
    setCurrentResult(result);
    setScreen('result');
    setRefreshTrigger(prev => prev + 1);
  };

  // Retake exam with brand new questions from the same subject and chapter
  const handleRetakeWithNewQuestions = () => {
    if (!currentResult) return;
    const firstQ = currentResult.questions[0];
    handleStartExam({
      university: currentResult.university,
      subject: firstQ?.subject,
      chapter: firstQ?.chapter,
      category: currentResult.category || 'subject_wise',
      title: `${currentResult.examTitle} (নতুন প্রশ্ন সেট)`,
    });
  };

  // Retake only the missed/wrong questions
  const handleRetakeMistakesOnly = (mistakeQuestions: Question[]) => {
    if (mistakeQuestions.length === 0) return;

    const seen = new Set<string>();
    const sanitizedMistakes = mistakeQuestions.map((q, idx) => {
      let qId = q.id || `mistake-${Date.now()}-${idx}`;
      if (seen.has(qId)) {
        qId = `${qId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(qId);
      return { ...q, id: qId };
    });

    const mistakeExam: Exam = {
      id: `mistake-exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'ভুল উত্তরগুলোর বিশেষ সংশোধনী পরীক্ষা',
      subtitle: `${sanitizedMistakes.length}টি ভুল প্রশ্ন • প্রতিটি প্রশ্নের নির্ভুলতা নিশ্চিত করুন`,
      university: currentResult?.university || 'ALL',
      universityNameBangla: 'ভুল উত্তর রিভিশন টেস্ট',
      totalQuestions: sanitizedMistakes.length,
      durationMinutes: Math.max(5, Math.ceil(sanitizedMistakes.length * 0.6)), // proportional time
      marksPerQuestion: 1,
      negativeMarks: 0.25,
      isLive: true,
      category: 'subject_wise',
      questions: sanitizedMistakes,
    };

    setCurrentExam(mistakeExam);
    setScreen('live_exam');
  };

  // View a past exam from analytics
  const handleReviewPastExam = (examResultId: string) => {
    const history = getExamHistory();
    const target = history.find(h => h.id === examResultId);
    if (target) {
      setCurrentResult(target);
      setScreen('revision');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-clip">
      {/* Ambient Neon Glow Orbs */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-violet-600/25 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-32 w-96 h-96 bg-fuchsia-600/25 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="fixed -bottom-32 left-1/4 w-96 h-96 bg-cyan-600/25 rounded-full blur-[100px] pointer-events-none -z-10" />

      <ScreenCaptureProtection isExamActive={screen === 'live_exam'} />
      {/* Show header on Home, Result, Revision screens */}
      {screen !== 'live_exam' && (
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          totalQuestionsCount={allQuestions.length}
          unseenQuestionsCount={unseenCount}
        />
      )}

      {/* Main Container */}
      <div className="flex-1">
        {/* Loading Overlay (২-৩ সেকেন্ডের মসৃণ ও দ্রুত লোডার) */}
        {isLoadingExam && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="relative mb-5">
              <div className="w-18 h-18 rounded-3xl bg-linear-to-tr from-cyan-400 via-fuchsia-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(217,70,239,0.5)] animate-spin">
                <RefreshCw className="w-9 h-9" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-lg shadow-cyan-400/50">
                35
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-pink-300 mb-2 flex items-center gap-2">
              <span>পরীক্ষা দ্রুত লোড হচ্ছে</span>
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-cyan-200/90 max-w-md text-center leading-relaxed mb-4 font-medium">
              {loadingText}
            </p>

            {/* Quick 2-3 second animated loading progress line */}
            <div className="w-72 max-w-full bg-slate-900/90 rounded-full h-2.5 overflow-hidden p-0.5 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <div
                className="h-full bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="text-xs text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-emerald-300 mt-3 font-bold">
              ⚡ ২-৩ সেকেন্ডে লাইভ টেস্ট শুরু হচ্ছে...
            </div>
          </div>
        )}

        {/* SCREEN 1: HOME */}
        {screen === 'home' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            {/* Admission Hero Highlight Banner */}
            <div className="relative overflow-hidden rounded-3xl glass-panel-elevated neon-border-violet p-6 sm:p-8 shadow-2xl">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Vertex Exam Portal — ২০২৬-২৭ সেশন</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-200 via-fuchsia-200 to-pink-300 leading-tight mb-6">
                  নিয়মিত অনুশীলনের মাধ্যমে প্রস্তুতি হোক পূর্ণাঙ্গ
                </h2>

                {/* Key admission rules summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-6">
                  <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>
                      <strong className="text-emerald-300 font-bold">অপরিবর্তনীয় উত্তর:</strong> একবার অপশন দিলে তা তাৎক্ষণিক লক হবে
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>
                      <strong className="text-amber-300 font-bold">বিস্তারিত ব্যাখ্যা:</strong> সাবমিটের পর প্রতিটি প্রশ্নের বিশদ সমাধান
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span>
                      <strong className="text-cyan-300 font-bold">ইউনিক প্রশ্ন:</strong> একবার পরীক্ষা দেওয়া প্রশ্ন আর পুনরায় আসবে না
                    </span>
                  </div>
                </div>

                {/* Fast Action CTA */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="px-5 py-3.5 rounded-2xl bg-linear-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>অ্যাপ ডাউনলোড / অফলাইন ইনস্টল</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'universities' && (
              <UniversityExamGrid
                onStartExam={options => handleStartExam(options)}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectChapterView
                onStartExam={options => handleStartExam(options)}
                onOpenAddModal={handleOpenAddModal}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                onReviewExam={handleReviewPastExam}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
            )}
          </main>
        )}

        {/* SCREEN 2: LIVE EXAM */}
        {screen === 'live_exam' && currentExam && (
          <LiveExamScreen
            exam={currentExam}
            onFinishExam={handleFinishExam}
            onCancelExam={() => setScreen('home')}
          />
        )}

        {/* SCREEN 3: RESULT SCOREBOARD */}
        {screen === 'result' && currentResult && (
          <main className="py-8">
            <ResultScoreboard
              result={currentResult}
              onOpenRevision={() => setScreen('revision')}
              onRetakeWithNewQuestions={handleRetakeWithNewQuestions}
              onGoHome={() => setScreen('home')}
            />
          </main>
        )}

        {/* SCREEN 4: REVISION PORTAL (ভুল উত্তরের সঠিক ব্যাখ্যা দেখার জন্য রিভিশন অপশন) */}
        {screen === 'revision' && currentResult && (
          <main className="py-8">
            <RevisionPortal
              result={currentResult}
              onBackToScoreboard={() => setScreen('result')}
              onRetakeMistakesOnly={handleRetakeMistakesOnly}
            />
          </main>
        )}
      </div>

      {/* Add New Question Modal */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalTarget(undefined);
        }}
        onQuestionAdded={() => setRefreshTrigger(prev => prev + 1)}
        initialSubject={addModalTarget?.subject}
        initialChapter={addModalTarget?.chapter}
      />

      {/* Download Center Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        latestResult={currentResult}
      />

      {/* Footer */}
      {screen !== 'live_exam' && (
        <footer className="mt-auto border-t border-white/25 glass-panel-elevated py-6 text-center text-xs text-white/80">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white">
                Vertex Exam Portal
              </span>
              <span className="text-white/70 ml-1.5 font-medium">
                ২০২৬-২৭ সেশন • নিয়মিত অনুশীলনের মাধ্যমে প্রস্তুতি হোক পূর্ণাঙ্গ
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>অ্যাপ ইনস্টল ও ডাউনলোড</span>
              </button>
              <span>•</span>
              <span>৩৫টি প্রশ্ন • ১৮ মিনিট</span>
              <span>•</span>
              <span>OMR লকড সিস্টেম</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
