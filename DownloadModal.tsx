import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getAllQuestions } from '../services/questionService';
import { ExamAttemptResult } from '../types/exam';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  FileText,
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Printer,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  latestResult?: ExamAttemptResult | null;
}

export const DownloadModal: React.FC<Props> = ({ isOpen, onClose, latestResult }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'project_zip' | 'app' | 'pdf' | 'bank'>('project_zip');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Direct download full project source code as ZIP
  const handleDownloadSourceZip = () => {
    window.location.href = '/api/download-source-zip';
  };

  // Download Question Bank as JSON
  const handleDownloadQuestionBank = () => {
    const questions = getAllQuestions();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `varsity_admission_question_bank_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download PDF / Print Exam Sheet
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel-elevated neon-border-violet shadow-2xl p-5 sm:p-7 text-white my-8 max-h-[90vh] overflow-y-auto overflow-hidden">
        {/* Top vibrant accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shadow-sm shadow-cyan-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-transparent bg-clip-text bg-linear-to-r from-cyan-200 to-white">
                ডাউনলোড ও ইনস্টলেশন সেন্টার
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                সম্পূর্ণ প্রজেক্ট জিপ (.zip) ডাউনলোড, মোবাইল অ্যাপ ইনস্টল ও প্রশ্নপত্র সেভ
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

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl glass-panel border border-violet-500/30 my-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('project_zip')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'project_zip'
                ? 'bg-linear-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>প্রজেক্ট ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('app')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'app'
                ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>মোবাইল অ্যাপ</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white font-black shadow-md shadow-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>প্রশ্ন PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>প্রশ্ন ব্যাংক</span>
          </button>
        </div>

        {/* TAB 0: PROJECT ZIP SOURCE CODE DOWNLOAD */}
        {activeTab === 'project_zip' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-950/70 via-teal-950/50 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  সম্পূর্ণ প্রজেক্ট সোর্স কোড (.ZIP) ডাউনলোড করুন
                </h4>
                <p className="text-slate-300">
                  সমস্ত রিঅ্যাক্ট কোড, সার্ভার কোড, ডিজাইন ও প্রশ্ন ব্যাংকসহ সম্পূর্ণ জিপ ফাইল
                </p>
              </div>
              <button
                onClick={handleDownloadSourceZip}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ZIP ফাইল ডাউনলোড করুন</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200 text-sm">💻 আপনার কম্পিউটারে যেভাবে চালাবেন:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>উপরের <strong>"ZIP ফাইল ডাউনলোড করুন"</strong> বাটনে ক্লিক করে ফাইলটি নামিয়ে নিন।</li>
                <li>ফাইলটি আনজিপ (Extract) করুন এবং VS Code বা যেকোনো এডিটরে ওপেন করুন।</li>
                <li>টার্মিনালে <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono">npm install</code> চালান।</li>
                <li>তারপর <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono">npm run dev</code> লিখলেই লোকালহোস্টে এক্সাম পোর্টালটি চালু হয়ে যাবে!</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="truncate text-slate-400 font-mono">
                {appUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: INSTALL AS PWA APP */}
        {activeTab === 'app' && (
          <div className="space-y-4">
            {/* Install Button if browser supports beforeinstallprompt */}
            {isInstallable && (
              <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    এক ক্লিকে আপনার ডিভাইসে ডাউনলোড ও ইনস্টল করুন
                  </h4>
                  <p className="text-xs text-slate-300">
                    এটি আপনার হোম স্ক্রিনে বা ডেস্কটপে ইনস্টল হবে এবং দ্রুত লোড হবে
                  </p>
                </div>
                <button
                  onClick={install}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  ইনস্টল করুন
                </button>
              </div>
            )}

            {isInstalled && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>অ্যাপটি আপনার ডিভাইসে সফলভাবে ইনস্টল করা আছে!</span>
              </div>
            )}

            {/* Step-by-Step Instructions for Android, iPhone & PC */}
            <div className="space-y-3 text-xs">
              {/* Android */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>অ্যান্ড্রয়েড ফোন (Android / Chrome) এ ডাউনলোড করার নিয়ম:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>গুগল ক্রোম (Chrome) ব্রাউজারে ডানদিকের উপরের <strong>তিনটি ডট (⋮)</strong> মেন্যুতে চাপ দিন।</li>
                  <li>মেন্যু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) অপশনটিতে চাপ দিন।</li>
                  <li>তারপর <strong>"Install"</strong> বাটনে ক্লিক করলেই আপনার ফোনে প্লে-স্টোর অ্যাপের মতো আইকন চলে আসবে।</li>
                </ol>
              </div>

              {/* iPhone / iPad */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm mb-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>আইফোন বা আইপ্যাড (iPhone / Safari) এ ডাউনলোড করার নিয়ম:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>সাফারি (Safari) ব্রাউজারের নিচে থাকা <strong>শেয়ার (Share / ⬆)</strong> আইকনে চাপ দিন।</li>
                  <li>নিচে স্ক্রোল করে <strong>"Add to Home Screen"</strong> অপশনটি বেছে নিন।</li>
                  <li>ডানদিকের উপরে <strong>"Add"</strong> চাপলেই ফোনের হোম স্ক্রিনে অ্যাপ ডাউনলোড হয়ে যাবে।</li>
                </ol>
              </div>

              {/* PC / Laptop */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm mb-1.5">
                  <Laptop className="w-4 h-4" />
                  <span>কম্পিউটার বা ল্যাপটপ (Windows / Mac) এ ডাউনলোড করার নিয়ম:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                  <li>ক্রোম বা এজ (Edge) ব্রাউজারের অ্যাড্রেস বারের ডানপাশে থাকা <strong>"Install App (ডাউনলোড আইকন)"</strong> এ ক্লিক করুন।</li>
                  <li>অথবা ব্রাউজারের ৩-ডট মেন্যু &gt; <strong>Save and Share</strong> &gt; <strong>Install this site as an app</strong> ক্লিক করুন।</li>
                </ol>
              </div>
            </div>

            {/* Share URL */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="truncate text-slate-400 font-mono">
                {appUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOAD AS PDF / PRINT SHEET */}
        {activeTab === 'pdf' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  প্রশ্নপত্র ও সমাধান শিট PDF হিসেবে সংরক্ষণ করুন
                </h4>
                <p className="text-slate-300">
                  পরীক্ষার ৩৫টি প্রশ্ন, অপশন ও প্রতিটি প্রশ্নের বিশদ ব্যাখ্যা এক ক্লিকেই প্রিন্ট বা PDF আকারে সেভ করতে পারবেন।
                </p>
              </div>
              <button
                onClick={handlePrintPdf}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PDF প্রিন্ট / সেভ করুন</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200 text-sm">💡 PDF ডাউনলোডের সহজ উপায়:</div>
              <p className="text-slate-400 leading-relaxed">
                ১. উপরের <strong>"PDF প্রিন্ট / সেভ করুন"</strong> বাটনে চাপ দিন।<br />
                ২. প্রিন্ট উইন্ডো খুললে <strong>Destination</strong> অপশনে <strong>"Save as PDF"</strong> নির্বাচন করুন।<br />
                ৩. <strong>Save</strong> চাপলেই আপনার কম্পিউটার বা ফোনের ফাইলস ফোল্ডারে সম্পূর্ণ বাংলা সমাধান শিট ডাউনলোড হয়ে যাবে।
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: EXPORT QUESTION BANK (JSON) */}
        {activeTab === 'bank' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-linear-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  সম্পূর্ণ প্রশ্ন ব্যাংক অফলাইন ব্যাকআপ ডাউনলোড
                </h4>
                <p className="text-slate-300">
                  আপনার সকল কাস্টম ও ডিফল্ট এডমিশন প্রশ্নমালা (.json ফাইল) ডাউনলোড করে নিরাপদে সংরক্ষণ করুন।
                </p>
              </div>
              <button
                onClick={handleDownloadQuestionBank}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ফাইল ডাউনলোড করুন</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h5 className="font-bold text-slate-200 mb-1">অফলাইন স্টোরেজ সুবিধা:</h5>
              <p className="text-slate-400 leading-relaxed">
                এই ফাইলে পদার্থবিজ্ঞান, রসায়ন, গণিত ও জীববিজ্ঞান সহ সকল অধ্যায়ের পূর্ণাঙ্গ প্রশ্ন সংরক্ষিত থাকবে। আপনি চাইলে অন্য কোনো ডিভাইসে বা যেকোনো সময় এটি ব্যবহার করতে পারবেন।
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
