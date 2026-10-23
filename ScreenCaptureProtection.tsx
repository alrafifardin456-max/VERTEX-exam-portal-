import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, AlertTriangle, EyeOff, ArrowLeft } from 'lucide-react';

interface Props {
  isExamActive?: boolean;
}

export const ScreenCaptureProtection: React.FC<Props> = ({ isExamActive = false }) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const triggerScreenshotBlock = (reason: string) => {
    setWarningMessage(reason);
    setShowWarningModal(true);

    // Auto dismiss after 3.2 seconds
    setTimeout(() => {
      setShowWarningModal(false);
    }, 3200);
  };

  useEffect(() => {
    // 1. Intercept PrintScreen and common screenshot shortcut keys
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside form inputs or textareas
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock('PrintScreen বাটন শনাক্ত হয়েছে। স্ক্রিনশট নেওয়া সীমাবদ্ধ করা হয়েছে।');
        return false;
      }

      // Windows + Shift + S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock('স্নিপিং টুল শর্টকাট শনাক্ত হয়েছে।');
        return false;
      }

      // Mac: Command + Shift + 3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock('স্ক্রিন ক্যাপচার শর্টকাট শনাক্ত হয়েছে।');
        return false;
      }

      // Only block Ctrl+P when exam is actively ongoing
      if (isExamActive && (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock('লাইভ পরীক্ষা চলাকালীন প্রশ্নপত্র প্রিন্ট করা নিষিদ্ধ!');
        return false;
      }

      // Save page (Ctrl + S / Cmd + S) during exam
      if (isExamActive && (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S') && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 2. Block right-click context menu ONLY outside form input fields
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return; // Allow context menu in inputs and textareas
      }
      if (isExamActive) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Block copy events during active exam outside inputs
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (isExamActive) {
        e.preventDefault();
      }
    };

    // 4. Tab / Window visibility change during exam
    const handleVisibilityChange = () => {
      if (document.hidden && isExamActive) {
        setIsWindowBlurred(true);
      } else if (!document.hidden) {
        setIsWindowBlurred(false);
      }
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamActive]);

  // When exam is not active, reset blurred state
  useEffect(() => {
    if (!isExamActive) {
      setIsWindowBlurred(false);
    }
  }, [isExamActive]);

  return (
    <>
      {/* 1. Subtle, repeating watermark in background */}
      {isExamActive && (
        <div
          className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none opacity-[0.03] flex flex-wrap gap-12 p-8"
          aria-hidden="true"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="text-white text-xs font-bold tracking-widest uppercase transform -rotate-12 whitespace-nowrap"
            >
              🔒 VERTEX SECURE EXAM • ২০২৬-২৭ সেশন
            </div>
          ))}
        </div>
      )}

      {/* 2. Window Blur Shield with One-Click Resume so user is NEVER locked out */}
      {isWindowBlurred && isExamActive && (
        <div
          onClick={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl text-white select-none cursor-pointer"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 text-center">
            পরীক্ষা সাময়িকভাবে স্থগিত
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md text-center leading-relaxed mb-6">
            নিরাপত্তার স্বার্থে পোর্টাল উইন্ডো ফোকাস না থাকলে স্ক্রিন আবৃত রাখা হয়। পরীক্ষা চালিয়ে যেতে নিচের বাটনে চাপ দিন।
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsWindowBlurred(false);
            }}
            className="px-6 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>পরীক্ষায় ফিরে আসুন</span>
          </button>
        </div>
      )}

      {/* 3. Screen Capture Blocked Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-6 sm:p-7 text-white text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider inline-block mb-3">
              পরীক্ষা নিরাপত্তা সতর্কতা
            </span>

            <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2">
              স্ক্রিন ক্যাপচার সতর্কতা
            </h3>

            <p className="text-xs sm:text-sm text-amber-300 font-medium mb-3">
              {warningMessage || 'কোনো ডিভাইস দিয়ে এই পোর্টালের বা প্রশ্নের অননুমোদিত স্ক্রিনশট নেওয়া নিষেধ।'}
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
            >
              আমি বুঝতে পেরেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
