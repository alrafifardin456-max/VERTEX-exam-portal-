import React, { useState, useEffect } from 'react';
import { Question, Subject, University } from '../types/exam';
import { saveCustomQuestion } from '../services/questionService';
import { parsePastedQuestionText, parseBulkQuestionsText, stripOptionPrefix } from '../utils/questionParser';
import { CHAPTERS_DATA } from '../data/chaptersData';
import {
  X,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lightbulb,
  Zap,
  BookOpen,
  ClipboardPaste,
  Copy,
  Send,
  Wand2,
  ArrowRight,
  Flame,
  Layers,
  CheckCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onQuestionAdded: () => void;
  initialSubject?: Subject;
  initialChapter?: string;
}

export const AddQuestionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onQuestionAdded,
  initialSubject,
  initialChapter,
}) => {
  // Tabs: 'gemini_direct' | 'smart_paste' | 'manual'
  const [activeTab, setActiveTab] = useState<'gemini_direct' | 'smart_paste' | 'manual'>('gemini_direct');

  // Manual Form States
  const [subject, setSubject] = useState<Subject>(initialSubject || 'physics');
  const [chapter, setChapter] = useState(initialChapter || '');
  const [stem, setStem] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [universityTag, setUniversityTag] = useState("ভর্তি পরীক্ষা স্পেশাল");
  const [explanation, setExplanation] = useState('');
  const [shortcutTip, setShortcutTip] = useState('');
  const [difficulty, setDifficulty] = useState<'সহজ' | 'মাঝারি' | 'মানসম্মত ভর্তি পরীক্ষা'>('মানসম্মত ভর্তি পরীক্ষা');

  // Smart Paste State
  const [pastedRawText, setPastedRawText] = useState('');
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState<Question[]>([]);

  // Gemini Direct Prompt State (Default 35 questions full set!)
  const [userGeminiPrompt, setUserGeminiPrompt] = useState(
    initialChapter
      ? `বিষয় ও '${initialChapter}' অধ্যায় থেকে ২০২৬-২৭ সেশনের ভর্তি পরীক্ষার অনুরূপ ৩৫টি প্রশ্ন, অপশন ও ব্যাখ্যা তৈরি করো`
      : 'পদার্থবিজ্ঞান ও রসায়ন থেকে ভর্তি পরীক্ষার অনুরূপ পূর্ণাঙ্গ ৩৫টি প্রশ্ন, অপশন ও ব্যাখ্যা তৈরি করো'
  );
  const [geminiCount, setGeminiCount] = useState<number>(35);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const [notification, setNotification] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const subjectNames: Record<Subject, string> = {
    physics: 'পদার্থবিজ্ঞান',
    chemistry: 'রসায়ন',
    math: 'উচ্চতর গণিত',
    biology: 'জীববিজ্ঞান',
    bangla: 'বাংলা',
    english: 'ইংরেজি',
    ict_gk: 'আইসিটি ও সাধারণ জ্ঞান',
  };

  useEffect(() => {
    if (isOpen) {
      if (initialSubject) {
        setSubject(initialSubject);
      }
      if (initialChapter) {
        setChapter(initialChapter);
        const subName = subjectNames[initialSubject || subject] || 'বিজ্ঞান';
        setUserGeminiPrompt(`${subName} বিষয়ের '${initialChapter}' অধ্যায় থেকে ২০২৬-২৭ সেশনের ভর্তি পরীক্ষার অনুরূপ ৩৫টি প্রশ্ন, অপশন ও ব্যাখ্যা তৈরি করো`);
      } else {
        setChapter('');
        setUserGeminiPrompt('পদার্থবিজ্ঞান ও রসায়ন থেকে ভর্তি পরীক্ষার অনুরূপ পূর্ণাঙ্গ ৩৫টি প্রশ্ন, অপশন ও ব্যাখ্যা তৈরি করো');
      }
      setParsedBulkQuestions([]);
      setGeneratedQuestions([]);
      setPastedRawText('');
      setPasteFeedback(null);
    }
  }, [isOpen, initialSubject, initialChapter]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[index] = val;
    setOptions(updated);
  };

  // Smart parse pasted text (detects single or up to 35 bulk questions)
  const handleParsePastedText = () => {
    if (!pastedRawText.trim()) {
      setPasteFeedback('অনুগ্রহ করে জিমিনির টেক্সট বা অপশনগুলো পেস্ট করুন।');
      return;
    }

    // Try bulk parsing first
    const bulkResults = parseBulkQuestionsText(pastedRawText, subject, chapter || 'সাধারণ এডমিশন টপিক', universityTag);
    if (bulkResults.length > 1) {
      setParsedBulkQuestions(bulkResults);
      setPasteFeedback(`সফলভাবে একসাথে ${bulkResults.length}টি প্রশ্ন চিহ্নিত করা হয়েছে! নিচে দেখে সেভ করুন।`);
      return;
    }

    // Single question fallback
    const parsed = parsePastedQuestionText(pastedRawText);
    if (!parsed) {
      setPasteFeedback('টেক্সট পার্স করতে সমস্যা হয়েছে। অনুগ্রহ করে প্রশ্ন ও অপশনগুলো স্পষ্ট করে দিন।');
      return;
    }

    setStem(parsed.stem);
    setOptions(parsed.options);
    setCorrectAnswer(parsed.correctAnswer);
    setExplanation(parsed.explanation);
    if (parsed.shortcutTip) setShortcutTip(parsed.shortcutTip);
    if (parsed.chapter) setChapter(parsed.chapter);
    if (parsed.subject) setSubject(parsed.subject);

    setPasteFeedback('সফলভাবে পার্স করা হয়েছে! নিচে ফর্মটি স্বয়ংক্রিয়ভাবে পূরণ হয়ে গেছে।');
    setActiveTab('manual');
  };

  // Save all bulk parsed questions (e.g. 35 questions)
  const handleSaveAllBulkQuestions = () => {
    if (parsedBulkQuestions.length === 0) return;
    parsedBulkQuestions.forEach(q => {
      saveCustomQuestion({
        ...q,
        subject: subject || q.subject,
        subjectBangla: subjectNames[subject] || q.subjectBangla || 'পদার্থবিজ্ঞান',
        chapter: chapter || q.chapter || 'সাধারণ এডমিশন টপিক',
      });
    });
    setNotification(`অভিনন্দন! একসাথে ${parsedBulkQuestions.length}টি প্রশ্নই সরাসরি প্রশ্ন ব্যাংকে যুক্ত হয়েছে!`);
    setTimeout(() => {
      setNotification(null);
      onQuestionAdded();
      onClose();
    }, 1500);
  };

  // Directly save all generated questions to bank (e.g. 35 questions)
  const handleSaveAllGenerated = () => {
    generatedQuestions.forEach(q => {
      saveCustomQuestion({
        ...q,
        subject: subject || q.subject,
        subjectBangla: subjectNames[subject] || q.subjectBangla || 'পদার্থবিজ্ঞান',
        chapter: chapter || q.chapter || 'সাধারণ এডমিশন টপিক',
      });
    });
    setNotification(`অভিনন্দন! একসাথে ${generatedQuestions.length}টি প্রশ্নই সরাসরি প্রশ্ন ব্যাংকে যুক্ত হয়েছে!`);
    setTimeout(() => {
      setNotification(null);
      onQuestionAdded();
      onClose();
    }, 1500);
  };

  // Ask Gemini with natural Bengali prompt for up to 35 questions
  const handleAskGemini = async () => {
    if (!userGeminiPrompt.trim()) return;
    setIsGeminiLoading(true);
    setNotification(`জিমিনি আপনার জন্য সম্পূর্ণ ইউনিক ${geminiCount}টি প্রশ্ন তৈরি করছে... এতে ২০-৩০ সেকেন্ড সময় লাগতে পারে, প্রতিটি প্রশ্ন স্বতন্ত্র হবে।`);

    try {
      const resp = await fetch('/api/generate-from-user-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: userGeminiPrompt.trim(),
          count: geminiCount,
          subject,
          chapter,
        }),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok && data && data.questions && data.questions.length > 0) {
        // Enforce strict stem-based uniqueness
        const seenStems = new Set<string>();
        const uniqueQs: Question[] = [];
        for (const q of data.questions) {
          const stemKey = (q.stem || '').trim().toLowerCase();
          if (!stemKey || seenStems.has(stemKey)) continue;
          seenStems.add(stemKey);
          uniqueQs.push({
            ...q,
            subject: subject || q.subject,
            subjectBangla: subjectNames[subject] || q.subjectBangla || 'পদার্থবিজ্ঞান',
            chapter: chapter || q.chapter
          });
        }

        setGeneratedQuestions(uniqueQs);
        if (data.message) {
          setNotification(data.message);
        } else {
          setNotification(`জিমিনি সফলভাবে ${uniqueQs.length}টি স্বতন্ত্র ও ইউনিক প্রশ্ন তৈরি করেছে! নিচে দেখে ব্যাংকে সেভ করুন।`);
        }
      } else {
        setNotification(data?.error || 'এআই সার্ভার সাময়িক ব্যস্ত রয়েছে। কয়েক মুহূর্ত পর আবার চেষ্টা করুন।');
      }
    } catch (e) {
      setNotification('কানেকশন সমস্যা হয়েছে। ইন্টারনেট বা সার্ভার চেক করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Copy standard prompt template to use on external gemini.google.com for 35 questions
  const handleCopyGeminiPrompt = () => {
    const promptTemplate = `তুমি শীর্ষ ভর্তি পরীক্ষার সিনিয়র প্রশ্ন প্রণেতা।
আমার জন্য ২০২৬-২৭ সেশনের ভর্তি পরীক্ষার অনুরূপ পূর্ণাঙ্গ ৩৫টি প্রশ্ন (MCQ) তৈরি করো।

বিষয় ও অধ্যায়: [এখানে লিখুন, যেমন: পদার্থবিজ্ঞান গতিবিদ্যা বা রসায়ন গুণগত রসায়ন]

হুবহু প্রতিটি প্রশ্নের ফরম্যাট এমন দাও:
১. প্রশ্ন...
ক) ...
খ) ...
গ) ...
ঘ) ...
সঠিক উত্তর: [ক/খ/গ/ঘ]
ব্যাখ্যা: [ধাপে ধাপে সমাধান ও সূত্র]
শর্টকাট: [এডমিশন টেকনিক]

(এভাবে ১ থেকে ৩৫ পর্যন্ত মোট ৩৫টি প্রশ্ন তৈরি করো)`;

    navigator.clipboard.writeText(promptTemplate);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Submit manual form
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem.trim()) {
      alert('অনুগ্রহ করে প্রশ্ন লিখুন।');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      alert('অনুগ্রহ করে ৪টি অপশনই পূরণ করুন।');
      return;
    }

    const newQuestion: Question = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      stem: stem.trim(),
      options: [
        stripOptionPrefix(options[0]).trim(),
        stripOptionPrefix(options[1]).trim(),
        stripOptionPrefix(options[2]).trim(),
        stripOptionPrefix(options[3]).trim(),
      ],
      correctAnswer,
      explanation: explanation.trim() || 'এই প্রশ্নের জন্য সরাসরি পাঠ্যপুস্তকের সূত্রাবলি প্রযোজ্য।',
      shortcutTip: shortcutTip.trim() || undefined,
      subject,
      subjectBangla: subjectNames[subject],
      chapter: chapter.trim() || 'সাধারণ এডমিশন টপিক',
      universityTag: universityTag.trim() || 'ভর্তি পরীক্ষা স্পেশাল',
      difficulty,
    };

    saveCustomQuestion(newQuestion);
    setNotification('প্রশ্ন সফলভাবে এডমিশন প্রশ্ন ব্যাংকে যুক্ত হয়েছে!');
    setTimeout(() => {
      setNotification(null);
      onQuestionAdded();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel-elevated neon-border-violet shadow-2xl p-5 sm:p-7 text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Top vibrant accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-transparent bg-clip-text bg-linear-to-r from-cyan-200 via-white to-pink-200">
                  {chapter ? `'${chapter}' অধ্যায়ে প্রশ্ন যোগ করুন (AQ)` : 'একসাথে ৩৫টি প্রশ্ন এড ও জিমিনি এআই জেনারেটর'}
                </h3>
                {chapter ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                    <span>📌 অধ্যায়: {chapter} ({subjectNames[subject] || 'বিজ্ঞান'})</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ৩৫ প্রশ্ন বাল্ক মোড
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {chapter 
                  ? `${subjectNames[subject] || 'বিজ্ঞান'} বিষয়ের '${chapter}' অধ্যায়ের জন্য জিমিনি দিয়ে ৩৫টি প্রশ্ন তৈরি করুন অথবা পেস্ট করুন`
                  : 'জিমিনিকে বলে এক ক্লিকে পূর্ণাঙ্গ ৩৫টি প্রশ্ন তৈরি করুন অথবা ৩৫টি প্রশ্নের টেক্সট একবারে পেস্ট করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="my-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in shadow-sm shadow-emerald-500/20">
            {notification}
          </div>
        )}

        {/* 3 Main Method Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl glass-panel border border-violet-500/30 my-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('gemini_direct')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gemini_direct'
                ? 'bg-linear-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>জিমিনি ৩৫ প্রশ্ন জেনারেটর</span>
          </button>

          <button
            onClick={() => setActiveTab('smart_paste')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'smart_paste'
                ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>একসাথে ৩৫ প্রশ্ন পেস্ট</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white font-black shadow-md shadow-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>একক প্রশ্ন ফর্ম</span>
          </button>
        </div>

        {/* TAB 1: GEMINI 35-QUESTION BULK GENERATOR */}
        {activeTab === 'gemini_direct' && (
          <div className="space-y-4 text-xs">
            {/* Quick Prompt Selector Chips */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">ক্লিক করে ৩৫ প্রশ্নের রেডিমেড নির্দেশ বাছুন:</div>
              <div className="flex flex-wrap gap-1.5">
                {(chapter ? [
                  `'${chapter}' অধ্যায়ের সর্বোচ্চ কমন ৩৫টি প্রশ্ন`,
                  `'${chapter}' অধ্যায় থেকে স্ট্যান্ডার্ড প্যাটার্নের ৩৫টি প্রশ্ন`,
                  `'${chapter}' শর্টকাট ও ট্রিকি প্রশ্নমালা`,
                  `'${chapter}' বিগত বছরের স্ট্যান্ডার্ড প্রশ্নমালা`
                ] : [
                  'পদার্থবিজ্ঞান ও রসায়ন পূর্ণাঙ্গ বিজ্ঞানের ৩৫টি প্রশ্ন',
                  'উচ্চতর গণিত ও জীববিজ্ঞান স্পেশাল ৩৫টি প্রশ্ন',
                  'কমন সিলেবাসভিত্তিক পূর্ণাঙ্গ মডেল টেস্টের ৩৫টি প্রশ্ন',
                  'উচ্চতর গণিত ক্যালকুলাস ও সরলরেখা থেকে ৩৫টি প্রশ্ন',
                  'জীববিজ্ঞান ও রসায়ন স্পেশাল ৩৫টি প্রশ্ন'
                ]).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserGeminiPrompt(chip + ' তৈরি করো')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
              <label className="block text-indigo-200 font-bold mb-1.5 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>জিমিনিকে আপনার নির্দেশ দিন:</span>
              </label>
              <textarea
                rows={3}
                value={userGeminiPrompt}
                onChange={e => setUserGeminiPrompt(e.target.value)}
                placeholder="যেমন: গতিবিদ্যা ও গুণগত রসায়ন থেকে ৩৫টি প্রশ্ন অপশন ও ব্যাখ্যাসহ বানাও..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 text-xs sm:text-sm leading-relaxed"
              />

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">প্রশ্নের সংখ্যা:</span>
                  {[35, 15, 5, 3].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGeminiCount(cnt)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        geminiCount === cnt
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cnt === 35 ? '🔥 ৩৫টি (পূর্ণাঙ্গ টেস্ট)' : `${cnt}টি`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyGeminiPrompt}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
                    title="বাইরের জিমিনির জন্য ৩৫ প্রশ্নের প্রম্পট কপি"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPrompt ? 'কপি হয়েছে!' : '৩৫ প্রশ্নের প্রম্পট কপি'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAskGemini}
                    disabled={isGeminiLoading}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isGeminiLoading ? 'জিমিনি তৈরি করছে...' : `একসাথে ${geminiCount}টি প্রশ্ন তৈরি করুন`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Questions List with Save All Button */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>জিমিনি সফলভাবে {generatedQuestions.length}টি প্রশ্ন তৈরি করেছে!</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      নিচের সবুজ বাটনে চাপ দিলে সবগুলো প্রশ্ন সরাসরি প্রশ্ন ব্যাংকে সেভ হয়ে যাবে।
                    </p>
                  </div>
                  <button
                    onClick={handleSaveAllGenerated}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>একসাথে {generatedQuestions.length}টি প্রশ্নই ব্যাংকে সেভ করুন</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {generatedQuestions.map((q, idx) => (
                    <div
                      key={`${q.id || 'gen'}-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-400">প্রশ্ন {idx + 1}: {q.chapter}</span>
                      </div>

                      <div className="text-white text-xs sm:text-sm leading-relaxed">{q.stem}</div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5 px-2 rounded-lg border ${
                              q.correctAnswer === oIdx
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {['ক', 'খ', 'গ', 'ঘ'][oIdx]}) {stripOptionPrefix(opt)}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                          <strong className="text-amber-400">ব্যাখ্যা:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SMART BULK 35 QUESTIONS PASTE */}
        {activeTab === 'smart_paste' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-emerald-400" />
                  <span>জিমিনি বা যেকোনো জায়গা থেকে ৩৫টি প্রশ্ন কপি করে এখানে পেস্ট করুন:</span>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const clipText = await navigator.clipboard.readText();
                      setPastedRawText(clipText);
                    } catch (e) {}
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ক্লিপবোর্ড থেকে পেস্ট
                </button>
              </div>

              <textarea
                rows={8}
                value={pastedRawText}
                onChange={e => setPastedRawText(e.target.value)}
                placeholder={`যেমন জিমিনি থেকে পুরো ৩৫টি প্রশ্ন কপি করে এখানে পেস্ট করুন:

১. মহাকর্ষীয় বিভবের মাত্রা কোনটি?
ক) [L² T⁻²]
খ) [M L² T⁻²]
গ) [M L T⁻²]
ঘ) [L² T⁻¹]
সঠিক উত্তর: ক
ব্যাখ্যা: V = W / m

২. 0.005 M H₂SO₄ দ্রবণের pH কত?
ক) 2.0
খ) 2.3
গ) 1.7
ঘ) 3.0
সঠিক উত্তর: ক
ব্যাখ্যা: [H⁺] = 2 × 0.005 = 0.01 ⇒ pH = 2.0

(এভাবে ১ থেকে ৩৫টি প্রশ্ন একবারে পেস্ট করতে পারেন)`}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm leading-relaxed"
              />

              {pasteFeedback && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {pasteFeedback}
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyGeminiPrompt}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>জিমিনির জন্য ৩৫ প্রশ্নের রেডিমেড প্রম্পট কপি করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>সবগুলো প্রশ্ন একসাথে পার্স ও আলাদা করুন</span>
                </button>
              </div>
            </div>

            {/* Bulk Parsed Questions Preview with 1-click Save All */}
            {parsedBulkQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>একসাথে {parsedBulkQuestions.length}টি প্রশ্ন শনাক্ত হয়েছে!</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      একটি ক্লিকেই সবকটি প্রশ্ন প্রশ্ন ব্যাংকে যুক্ত হয়ে যাবে।
                    </p>
                  </div>
                  <button
                    onClick={handleSaveAllBulkQuestions}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>একসাথে {parsedBulkQuestions.length}টি প্রশ্নই সেভ করুন</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {parsedBulkQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>প্রশ্ন {idx + 1}</span>
                        <span className="text-slate-400 font-normal">সঠিক উত্তর: {['ক', 'খ', 'গ', 'ঘ'][q.correctAnswer]}</span>
                      </div>
                      <div className="text-white">{q.stem}</div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={q.correctAnswer === oIdx ? 'text-emerald-300 font-bold' : ''}>
                            {['ক', 'খ', 'গ', 'ঘ'][oIdx]}) {stripOptionPrefix(opt)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANUAL EDIT FORM */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmitManual} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">বিষয়</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value as Subject)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="physics">পদার্থবিজ্ঞান</option>
                  <option value="chemistry">রসায়ন</option>
                  <option value="math">উচ্চতর গণিত</option>
                  <option value="biology">জীববিজ্ঞান</option>
                  <option value="bangla">বাংলা</option>
                  <option value="english">ইংরেজি</option>
                  <option value="ict_gk">আইসিটি ও সাধারণ জ্ঞান</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">অধ্যায়ের নাম</label>
                <input
                  type="text"
                  list="chapters-list"
                  placeholder="যেমন: কোষ রসায়ন, অণুজীব, স্থির তড়িৎ"
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
                />
                <datalist id="chapters-list">
                  {CHAPTERS_DATA.filter(c => c.subjectId === subject).map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.paper === '1st' ? '১ম পত্র' : '২য় পত্র'})
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">প্রশ্নের বিবরণ (Stem) *</label>
              <textarea
                rows={3}
                placeholder="প্রশ্নটি বাংলায় লিখুন..."
                value={stem}
                onChange={e => setStem(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500 text-sm leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                ৪টি অপশন এবং সঠিক উত্তর নির্বাচন *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {['ক', 'খ', 'গ', 'ঘ'].map((label, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      correctAnswer === idx
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctAnswer === idx}
                        onChange={() => setCorrectAnswer(idx)}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-xs">{label}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`অপশন ${label} এর উত্তর লিখুন`}
                      value={options[idx]}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      className="flex-1 bg-transparent border-0 text-white focus:outline-hidden text-xs"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">বিস্তারিত ব্যাখ্যা ও সমাধান সূত্রাবলি *</label>
              <textarea
                rows={3}
                placeholder="পরীক্ষা শেষে শিক্ষার্থী কীভাবে সহজে সমাধানটি বুঝবে তা বিস্তারিত লিখুন..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500 text-xs leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>প্রশ্ন সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
