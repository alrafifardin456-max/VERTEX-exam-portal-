import React, { useState } from 'react';
import { Subject, University } from '../types/exam';
import { SUBJECTS_LIST, CHAPTERS_DATA, ChapterMeta } from '../data/chaptersData';
import { getSeenQuestionIds, getAllQuestions } from '../services/questionService';
import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Award,
  Search,
  Filter,
  X,
  Plus
} from 'lucide-react';

interface Props {
  onStartExam: (options: {
    subject?: Subject;
    chapter?: string;
    university?: University;
    title?: string;
    category?: 'subject_wise' | 'chapter_wise';
  }) => void;
  onOpenAddModal: (prefill?: { subject?: Subject; chapter?: string }) => void;
}

export const SubjectChapterView: React.FC<Props> = ({ onStartExam, onOpenAddModal }) => {
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'math' | 'biology'>('physics');
  const [selectedPaper, setSelectedPaper] = useState<'all' | '1st' | '2nd'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const seenIds = new Set(getSeenQuestionIds());
  const allQuestions = getAllQuestions();

  const currentSubjectMeta = SUBJECTS_LIST.find(s => s.id === selectedSubject)!;
  const allSubjectChapters = CHAPTERS_DATA.filter(c => c.subjectId === selectedSubject);

  const chaptersForSubject = allSubjectChapters.filter(c => {
    if (selectedPaper !== 'all' && c.paper !== selectedPaper) return false;
    if (
      searchQuery.trim() &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const firstPaperCount = allSubjectChapters.filter(c => c.paper === '1st').length;
  const secondPaperCount = allSubjectChapters.filter(c => c.paper === '2nd').length;

  const getSubjectIcon = (id: string) => {
    switch (id) {
      case 'physics':
        return <Atom className="w-5 h-5" />;
      case 'chemistry':
        return <FlaskConical className="w-5 h-5" />;
      case 'math':
        return <Calculator className="w-5 h-5" />;
      case 'biology':
        return <Dna className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Compute stats for current subject
  const subjectTotalQuestions = allQuestions.filter(q => q.subject === selectedSubject).length;
  const subjectSeenCount = allQuestions.filter(q => q.subject === selectedSubject && seenIds.has(q.id)).length;
  const subjectUnseenCount = subjectTotalQuestions - subjectSeenCount;

  return (
    <div className="space-y-6">
      {/* Subject Tabs Navigation */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS_LIST.map(sub => {
          const isSelected = selectedSubject === sub.id;
          const chapterCount = CHAPTERS_DATA.filter(c => c.subjectId === sub.id).length;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setSelectedPaper('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-linear-to-r from-cyan-400 via-fuchsia-500 to-violet-600 text-slate-950 font-black shadow-[0_0_25px_rgba(217,70,239,0.5)] scale-[1.02]'
                  : 'glass-panel hover:bg-white/10 text-slate-300 hover:text-white border border-violet-500/30 hover:border-cyan-400/50'
              }`}
            >
              <span>{getSubjectIcon(sub.id)}</span>
              <span>{sub.nameBangla}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isSelected ? 'bg-slate-950/40 text-white' : 'glass-panel text-cyan-300 border border-cyan-400/30'}`}>
                {chapterCount}টি অধ্যায়
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Card for Selected Subject */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated neon-border-violet p-6 sm:p-7 text-white shadow-2xl">
        {/* Top neon decorative line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-linear-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>এডমিশন ২০২৬-২৭ সেশন স্পেশাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-fuchsia-200 mb-1">
              {currentSubjectMeta.nameBangla} ({currentSubjectMeta.nameEnglish})
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/80 max-w-xl font-medium">
              {currentSubjectMeta.description} • সম্পূর্ণ বিষয় থেকে ৩৫টি প্রশ্নের লাইভ পরীক্ষা দিন অথবা নিচে নির্দিষ্ট অধ্যায় বেছে নিন।
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-xl glass-panel border border-violet-500/30 font-bold text-slate-200 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
                মোট প্রশ্ন ব্যাংক: {subjectTotalQuestions}+
              </span>
              <span className="px-3 py-1 rounded-xl glass-panel border border-emerald-400/40 font-bold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                নতুন/অদেখা প্রশ্ন: {subjectUnseenCount}টি
              </span>
              <span className="px-3 py-1 rounded-xl glass-panel border border-amber-400/40 font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                লকড OMR • ১৮ মিনিট
              </span>
            </div>
          </div>

          {/* Full Subject Exam Button */}
          <button
            onClick={() =>
              onStartExam({
                subject: selectedSubject,
                title: `${currentSubjectMeta.nameBangla} পূর্ণাঙ্গ বিষয়ভিত্তিক টেস্ট`,
                category: 'subject_wise',
              })
            }
            className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>সম্পূর্ণ {currentSubjectMeta.nameBangla} লাইভ টেস্ট দিন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-white">
          {getSubjectIcon(selectedSubject)}
        </div>
      </div>

      {/* Chapter Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-fuchsia-300 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{currentSubjectMeta.nameBangla} অধ্যায়ভিত্তিক টেস্ট তালিকা</span>
            </h3>
            <p className="text-xs text-cyan-200/70 font-medium">
              নির্দিষ্ট অধ্যায়ের ৩৫টি প্রশ্ন দিয়ে ১৮ মিনিটের রিয়েল টাইম মডেল টেস্ট দিন
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal({ subject: selectedSubject })}
            className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>নতুন প্রশ্ন যোগ করুন</span>
          </button>
        </div>

        {/* Paper Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 glass-panel p-3 rounded-2xl border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          {/* Paper filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedPaper('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedPaper === 'all'
                  ? 'bg-linear-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                  : 'glass-panel text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              সব অধ্যায় ({allSubjectChapters.length}টি)
            </button>
            <button
              onClick={() => setSelectedPaper('1st')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedPaper === '1st'
                  ? 'bg-linear-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                  : 'glass-panel text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              ১ম পত্র ({firstPaperCount}টি)
            </button>
            <button
              onClick={() => setSelectedPaper('2nd')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedPaper === '2nd'
                  ? 'bg-linear-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                  : 'glass-panel text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              ২য় পত্র ({secondPaperCount}টি)
            </button>
          </div>

          {/* Quick Chapter Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="অধ্যায়ের নাম বা টপিক খুঁজুন..."
              className="w-full pl-8 pr-8 py-1.5 rounded-xl glass-panel border border-cyan-500/30 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {chaptersForSubject.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl glass-panel border border-violet-500/30 text-slate-300">
            <p className="text-sm font-bold mb-2">এই ফিল্টারে কোনো অধ্যায় পাওয়া যায়নি</p>
            <button
              onClick={() => {
                setSelectedPaper('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              সব ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chaptersForSubject.map((ch, idx) => {
              return (
                <div
                  key={ch.id}
                  className="group relative rounded-2xl glass-panel-elevated neon-border-violet hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] p-5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg glass-panel text-cyan-300 border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                        অধ্যায় {idx + 1} • {ch.paper === '1st' ? '১ম পত্র' : '২য় পত্র'}
                      </span>
                      <span className="text-[11px] font-bold text-amber-300">
                        {ch.admissionImportance}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base font-black text-transparent bg-clip-text bg-linear-to-r from-white to-slate-100 group-hover:from-cyan-300 group-hover:to-fuchsia-300 transition-colors">
                        {ch.name}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddModal({ subject: ch.subjectId, chapter: ch.name });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-panel text-cyan-300 hover:text-white border border-cyan-400/40 text-xs font-black transition-all cursor-pointer shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)] hover:shadow-[0_0_15px_rgba(6,182,212,0.45)] group/aq active:scale-95"
                        title={`${ch.name} অধ্যায়ের জন্য আলাদা প্রশ্ন যোগ করুন (AQ - Add Question)`}
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover/aq:rotate-90 transition-transform" />
                        <span>AQ</span>
                      </button>
                    </div>
                    <p className="text-xs text-cyan-100/70 leading-relaxed mb-4 font-medium">
                      {ch.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-violet-500/20 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-cyan-300/80 font-bold">
                      ৩৫ প্রশ্ন • ১৮ মিনিট
                    </div>

                    <button
                      onClick={() =>
                        onStartExam({
                          subject: selectedSubject,
                          chapter: ch.name,
                          title: `${ch.name} (অধ্যায়ভিত্তিক টেস্ট - ${currentSubjectMeta.nameBangla})`,
                          category: 'chapter_wise',
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>টেস্ট শুরু করুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
