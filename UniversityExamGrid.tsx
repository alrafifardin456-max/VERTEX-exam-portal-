import React from 'react';
import { University } from '../types/exam';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface Props {
  onStartExam: (options: {
    university: University;
    title: string;
    subtitle?: string;
  }) => void;
}

interface VarsityCard {
  university: University;
  nameBangla: string;
  unit: string;
  gradient: string;
  border: string;
  accent: string;
  description: string;
  pastYearsTag: string;
  tagline: string;
}

const VARSITY_CARDS: VarsityCard[] = [
  {
    university: 'RU',
    nameBangla: 'রাজশাহী বিশ্ববিদ্যালয় (RU)',
    unit: 'A ও C ইউনিট স্পেশাল',
    gradient: 'from-rose-950/60 via-slate-900 to-slate-950',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    accent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'বিগত ৫ বছরের RU C-Unit ও A-Unit প্রশ্ন প্যাটার্ন ও অধ্যায়ভিত্তিক ওয়েটেজ অনুসারে প্রস্তুত ৩৫ প্রশ্নের লাইভ টেস্ট।',
    pastYearsTag: 'RU 2019-2024 Analysis',
    tagline: 'আইসিটি, সাধারণ জ্ঞান ও বিজ্ঞান কম্বাইন্ড',
  },
  {
    university: 'CU',
    nameBangla: 'চট্টগ্রাম বিশ্ববিদ্যালয় (CU)',
    unit: 'A ও D ইউনিট স্পেশাল',
    gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    accent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'চবির ঐতিহ্যবাহী ট্রিকি প্রশ্ন, ইংরেজি ও বিজ্ঞানের মৌলিক ধারণানির্ভর ৩৫টি মানসম্মত প্রশ্নের সমন্বয়ে তৈরি।',
    pastYearsTag: 'CU 2020-2024 Analysis',
    tagline: 'নেগেটিভ মার্কিং নিয়ন্ত্রণের স্পেশাল টেস্ট',
  },
  {
    university: 'GST',
    nameBangla: 'জিএসটি (GST) গুচ্ছ ভর্তি পরীক্ষা',
    unit: 'সমন্বিত বিজ্ঞান ইউনিট',
    gradient: 'from-indigo-950/60 via-slate-900 to-slate-950',
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    accent: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'গুচ্ছভুক্ত ২২টি পাবলিক বিশ্ববিদ্যালয়ের কমন সিলেবাস ও উচ্চ-ফলনশীল অধ্যায় থেকে সংকলিত পূর্ণাঙ্গ লাইভ মডেল টেস্ট।',
    pastYearsTag: 'GST All Sessions 2021-2024',
    tagline: 'পদার্থ, রসায়ন, গণিত ও বায়োলজি',
  },
  {
    university: 'KU',
    nameBangla: 'খুলনা বিশ্ববিদ্যালয় (KU)',
    unit: 'বিজ্ঞান ও প্রকৌশল স্কুল',
    gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    accent: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'কুবি-র নির্ভুল ক্যালকুলেশন এবং রসায়ন ও গণিতের কনসেপচুয়াল প্রশ্ন নিয়ে সাজানো ৩৫টি প্রশ্নের বিশেষ পরীক্ষা।',
    pastYearsTag: 'KU Past Years Special',
    tagline: 'কনসেপ্ট ও দ্রুত নির্ভুল সমাধান',
  },
  {
    university: 'CoU',
    nameBangla: 'কুমিল্লা বিশ্ববিদ্যালয় (CoU)',
    unit: 'A ও B ইউনিট লাইভ টেস্ট',
    gradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    accent: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'কুমিল্লা বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার অতীত প্রশ্নাবলি ও সম্ভাব্য হট টপিক বিশ্লেষণের নিখুঁত মডেল টেস্ট।',
    pastYearsTag: 'CoU 2020-2024 Trend',
    tagline: 'কমন টপিক ও শর্টকাট টেকনিক',
  },
  {
    university: 'ALL',
    nameBangla: 'টপ ৫০ র‍্যাংক চ্যালেঞ্জ (কম্বাইন্ড)',
    unit: 'RU + CU + GST + KU + CoU',
    gradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    accent: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'পাঁচটি বিশ্ববিদ্যালয়ের সবচেয়ে স্ট্যান্ডার্ড ও চ্যালেঞ্জিং প্রশ্ন একত্রিত করে ৩৫ প্রশ্নের মেধা যাচাই লাইভ মডেল টেস্ট।',
    pastYearsTag: 'All Combined 2026-27',
    tagline: 'মেধা অবস্থান ও কাটমার্ক টার্গেট',
  },
];

export const UniversityExamGrid: React.FC<Props> = ({ onStartExam }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-pink-300 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce duration-1000" />
            <span>বিশ্ববিদ্যালয়ভিত্তিক লাইভ মডেল টেস্ট (২০২৬-২৭ সেশন)</span>
          </h3>
          <p className="text-xs text-cyan-200/70 font-medium">
            বিগত বছরের প্রশ্ন এনালাইসিস করে RU, CU, GST, KU ও CoU এর গুরুত্বপূর্ণ টপিকভিত্তিক ৩৫টি প্রশ্ন ও ১৮ মিনিটের পরীক্ষা
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {VARSITY_CARDS.map(card => (
          <div
            key={card.university}
            className="group rounded-3xl glass-panel-elevated neon-border-violet hover:border-cyan-400/80 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top neon decorative line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-violet-500 opacity-90 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-linear-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {card.university} স্পেশাল
                </span>
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 glass-panel px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ১৮ মিনিট • ৩৫ প্রশ্ন
                </span>
              </div>

              <h4 className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-slate-100 mb-1 group-hover:from-cyan-300 group-hover:to-fuchsia-300 transition-colors">
                {card.nameBangla}
              </h4>
              <div className="text-xs font-bold text-fuchsia-300 mb-2">{card.unit}</div>
              <p className="text-xs text-cyan-100/70 leading-relaxed mb-4 font-medium">{card.description}</p>
            </div>

            <div className="pt-4 border-t border-violet-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>লকড উত্তর</span>
              </div>

              <button
                onClick={() =>
                  onStartExam({
                    university: card.university,
                    title: `${card.nameBangla} লাইভ মডেল টেস্ট`,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-linear-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>লাইভ শুরু করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
