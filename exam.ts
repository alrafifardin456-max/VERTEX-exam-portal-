export type University = 'RU' | 'CU' | 'KU' | 'CoU' | 'GST' | 'ALL';

export type Subject = 
  | 'physics' 
  | 'chemistry' 
  | 'math' 
  | 'biology' 
  | 'bangla' 
  | 'english' 
  | 'ict_gk';

export interface Question {
  id: string;
  stem: string; // The Bengali question text
  options: [string, string, string, string]; // Exactly 4 options
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string; // Detailed Bengali step-by-step solution
  subject: Subject;
  subjectBangla: string;
  chapter: string;
  universityTag: string; // e.g. "RU '23-24 (A Unit)", "CU '22-23", "GST '23-24"
  year?: string;
  difficulty?: 'সহজ' | 'মাঝারি' | 'মানসম্মত ভর্তি পরীক্ষা' | 'কঠিন';
  shortcutTip?: string; // Quick admission hack/trick
}

export interface Exam {
  id: string;
  title: string;
  subtitle: string;
  university: University;
  universityNameBangla: string;
  totalQuestions: number; // 35
  durationMinutes: number; // 18
  marksPerQuestion: number; // 1.0
  negativeMarks: number; // 0.25
  isLive: boolean;
  category: 'university_live' | 'subject_wise' | 'chapter_wise' | 'ai_dynamic';
  questions: Question[];
  badgeColor?: string;
}

export interface UserAnswerRecord {
  questionIndex: number;
  questionId: string;
  selectedOption: number | null; // 0..3 or null if skipped
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface ExamAttemptResult {
  id: string;
  examId: string;
  examTitle: string;
  university: University;
  category?: 'university_live' | 'subject_wise' | 'chapter_wise' | 'ai_dynamic';
  timestamp: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  wrongCount: number;
  score: number; // correct * 1 - wrong * 0.25
  maxScore: number; // 35
  accuracy: number; // percentage
  timeTakenSeconds: number;
  userAnswers: UserAnswerRecord[];
  questions: Question[];
  estimatedMeritRank: number;
  totalSimulatedCandidates: number;
}
