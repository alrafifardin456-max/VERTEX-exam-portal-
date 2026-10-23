import { Question, University, Subject, Exam, ExamAttemptResult } from '../types/exam';
import { QUESTION_BANK } from '../data/questionBank';
import { stripOptionPrefix } from '../utils/questionParser';

const CUSTOM_QUESTIONS_KEY = 'varsity_custom_questions_v1';
const SEEN_QUESTIONS_KEY = 'varsity_seen_questions_v1';
const EXAM_RESULTS_KEY = 'varsity_exam_results_v1';
const BOOKMARKS_KEY = 'varsity_bookmarked_questions_v1';

// Get custom user-added questions from localStorage
export function getCustomQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!raw) return [];
    const list: Question[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const sanitized: Question[] = [];
    let hasDuplicates = false;
    list.forEach((q, idx) => {
      if (!q || !q.stem) return;
      // Strip any contaminated legacy fallback questions that crossed subjects
      if (typeof q.id === 'string' && (q.id.startsWith('fast-fb-') || q.id.startsWith('fast-fb-prompt-'))) {
        hasDuplicates = true;
        return;
      }
      let qId = q.id || `custom-${idx}`;
      if (seen.has(qId)) {
        hasDuplicates = true;
        qId = `${qId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      }
      const cleanOptions = Array.isArray(q.options)
        ? (q.options.map(opt => stripOptionPrefix(opt).trim()) as [string, string, string, string])
        : q.options;
      sanitized.push({ ...q, id: qId, options: cleanOptions });
    });
    if (hasDuplicates) {
      try {
        localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(sanitized));
      } catch (e) {}
    }
    return sanitized;
  } catch (e) {
    console.error('Failed to load custom questions', e);
    return [];
  }
}

// Save a new question
export function saveCustomQuestion(question: Question): boolean {
  try {
    const existing = getCustomQuestions();
    const cleanOptions = Array.isArray(question.options)
      ? (question.options.map(opt => stripOptionPrefix(opt).trim()) as [string, string, string, string])
      : question.options;
    const cleanQuestion: Question = {
      ...question,
      options: cleanOptions,
    };
    // Filter out existing question with the same ID to prevent duplication
    const filtered = existing.filter(q => q.id !== cleanQuestion.id);
    const updated = [cleanQuestion, ...filtered];
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save custom question', e);
    return false;
  }
}

// Get all combined questions (Bank + Custom) with strict deduplication
export function getAllQuestions(): Question[] {
  const custom = getCustomQuestions();
  const uniqueCustom: Question[] = [];
  const customIds = new Set<string>();
  for (const q of custom) {
    if (q && q.id && !customIds.has(q.id)) {
      customIds.add(q.id);
      uniqueCustom.push(q);
    }
  }
  const filteredDefault = QUESTION_BANK.filter(q => !customIds.has(q.id)).map(q => ({
    ...q,
    options: (q.options.map(opt => stripOptionPrefix(opt).trim()) as [string, string, string, string]),
  }));
  return [...uniqueCustom, ...filteredDefault];
}

// Get seen question IDs
export function getSeenQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Mark question IDs as seen after exam completion
export function markQuestionsAsSeen(questionIds: string[]): void {
  try {
    const current = new Set(getSeenQuestionIds());
    questionIds.forEach(id => current.add(id));
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Failed to save seen question IDs', e);
  }
}

// Reset seen question IDs (so user can re-practice all questions from scratch)
export function resetSeenQuestions(): void {
  localStorage.removeItem(SEEN_QUESTIONS_KEY);
}

// Bookmarks management
export function getBookmarkedIds(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleBookmarkQuestion(questionId: string): boolean {
  try {
    const set = new Set(getBookmarkedIds());
    const wasBookmarked = set.has(questionId);
    if (wasBookmarked) {
      set.delete(questionId);
    } else {
      set.add(questionId);
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(set)));
    return !wasBookmarked;
  } catch (e) {
    return false;
  }
}

// Exam results history
export function getExamHistory(): ExamAttemptResult[] {
  try {
    const raw = localStorage.getItem(EXAM_RESULTS_KEY);
    if (!raw) return [];
    const list: ExamAttemptResult[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map(result => {
      if (!result || !Array.isArray(result.questions)) return result;
      const seen = new Set<string>();
      const sanitizedQs = result.questions.map((q, idx) => {
        let qId = q.id || `hist-${idx}`;
        if (seen.has(qId)) {
          qId = `${qId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
        }
        seen.add(qId);
        return { ...q, id: qId };
      });
      return { ...result, questions: sanitizedQs };
    });
  } catch (e) {
    return [];
  }
}

export function saveExamResult(result: ExamAttemptResult): void {
  try {
    const existing = getExamHistory();
    // Ensure all questions in result have unique IDs before saving
    const seen = new Set<string>();
    const sanitizedResultQuestions = (result.questions || []).map((q, idx) => {
      let qId = q.id || `res-${Date.now()}-${idx}`;
      if (seen.has(qId)) {
        qId = `${qId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(qId);
      return { ...q, id: qId };
    });
    const sanitizedResult: ExamAttemptResult = {
      ...result,
      questions: sanitizedResultQuestions,
    };
    const updated = [sanitizedResult, ...existing];
    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(updated));
    // Also mark these questions as seen
    markQuestionsAsSeen(sanitizedResultQuestions.map(q => q.id));
  } catch (e) {
    console.error('Failed to save exam result', e);
  }
}

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Synthesize or generate 35 questions tailored to requirements
export async function createDynamicExam(options: {
  university?: University;
  subject?: Subject;
  chapter?: string;
  title?: string;
  category?: 'university_live' | 'subject_wise' | 'chapter_wise' | 'ai_dynamic';
  preferUnseen?: boolean;
}): Promise<Exam> {
  const {
    university = 'ALL',
    subject,
    chapter,
    title,
    category = 'university_live',
    preferUnseen = true,
  } = options;

  const allQuestions = getAllQuestions();
  const seenIds = new Set(getSeenQuestionIds());

  // Filter matching criteria
  const targetSubject = subject?.trim().toLowerCase();
  const targetChapter = chapter?.trim();
  
  let eligibleQuestions = allQuestions.filter(q => {
    const qSubject = q.subject?.trim().toLowerCase();
    const qChapter = q.chapter?.trim();

    if (targetSubject && qSubject !== targetSubject) return false;
    if (targetChapter && qChapter !== targetChapter) return false;
    
    if (university !== 'ALL') {
      const tag = (q.universityTag || '').toUpperCase();
      if (!tag.includes(university)) return false;
    }
    return true;
  });

  // If specific university was requested and yielded less than 15, relax ONLY the university tag (never subject or chapter!)
  if (eligibleQuestions.length < 15 && university !== 'ALL') {
    eligibleQuestions = allQuestions.filter(q => {
      const qSubject = q.subject?.trim().toLowerCase();
      const qChapter = q.chapter?.trim();
      if (targetSubject && qSubject !== targetSubject) return false;
      if (targetChapter && qChapter !== targetChapter) return false;
      return true;
    });
  }

  // Separate unseen questions from seen questions
  let unseenPool = eligibleQuestions.filter(q => !seenIds.has(q.id));
  let chosenQuestions: Question[] = [];

  // Pick all unseen questions up to 35
  const shuffledUnseen = shuffle(unseenPool);
  chosenQuestions.push(...shuffledUnseen.slice(0, 35));

  // If still less than 35, pull from remaining eligible questions (seen)
  if (chosenQuestions.length < 35) {
    const remainingEligible = shuffle(eligibleQuestions.filter(q => !chosenQuestions.some(cq => cq.id === q.id)));
    for (const eq of remainingEligible) {
      if (chosenQuestions.length < 35) {
        chosenQuestions.push(eq);
      }
    }
  }

  // If still less than 35, try fetching fresh AI questions specifically for this chapter/subject
  if (chosenQuestions.length < 35) {
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 2500);
    try {
      const neededCount = 35 - chosenQuestions.length;
      const resp = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          subject: targetSubject,
          chapter: targetChapter,
          university,
          count: Math.min(neededCount + 5, 20),
          excludeQuestionIds: Array.from(seenIds),
        }),
      });
      clearTimeout(fetchTimeout);
      const data = await resp.json();
      if (data && data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q: Question) => {
          const qSub = (q.subject || '').toLowerCase().trim();
          const isSubMatch = !targetSubject || qSub === targetSubject;
          const isChapMatch = !targetChapter || (q.chapter || '').includes(targetChapter) || targetChapter.includes(q.chapter || '');
          if (isSubMatch && isChapMatch && chosenQuestions.length < 35) {
            saveCustomQuestion({
              ...q,
              subject: (targetSubject as Subject) || q.subject,
              chapter: targetChapter || q.chapter
            });
            chosenQuestions.push(q);
          }
        });
      }
    } catch (e) {
      clearTimeout(fetchTimeout);
    }
  }

  // STRICT FINAL GUARANTEE: NEVER LEAK OTHER CHAPTERS OR OTHER SUBJECTS
  if (targetChapter && chosenQuestions.length < 35 && eligibleQuestions.length > 0) {
    // ONLY cycle questions belonging strictly to this exact chapter
    while (chosenQuestions.length < 35) {
      for (const eq of shuffle(eligibleQuestions)) {
        if (chosenQuestions.length < 35) {
          chosenQuestions.push({
            ...eq,
            id: `${eq.id}-cln-${Math.random().toString(36).substring(2, 6)}`
          });
        }
      }
    }
  } else if (targetSubject && chosenQuestions.length < 35) {
    // ONLY cycle questions belonging strictly to this exact subject
    const sameSubjectQuestions = shuffle(allQuestions.filter(q => q.subject === targetSubject));
    while (chosenQuestions.length < 35 && sameSubjectQuestions.length > 0) {
      for (const ssq of sameSubjectQuestions) {
        if (chosenQuestions.length < 35) {
          chosenQuestions.push({
            ...ssq,
            id: `${ssq.id}-cln-${Math.random().toString(36).substring(2, 6)}`
          });
        }
      }
    }
  } else if (!targetSubject && !targetChapter && chosenQuestions.length < 35) {
    // Multi-subject university model test: fill from broader pool
    const broaderPool = shuffle(allQuestions);
    while (chosenQuestions.length < 35 && broaderPool.length > 0) {
      for (const bq of broaderPool) {
        if (chosenQuestions.length < 35) {
          chosenQuestions.push({
            ...bq,
            id: `${bq.id}-cln-${Math.random().toString(36).substring(2, 6)}`
          });
        }
      }
    }
  }

  // Absolute fallback: ensure 35 questions even if single chapter/subject pool was empty
  if (chosenQuestions.length < 35 && allQuestions.length > 0) {
    const fallbackPool = shuffle(allQuestions);
    while (chosenQuestions.length < 35 && fallbackPool.length > 0) {
      for (const fbq of fallbackPool) {
        if (chosenQuestions.length < 35) {
          chosenQuestions.push({
            ...fbq,
            id: `${fbq.id}-fb-${Math.random().toString(36).substring(2, 6)}`
          });
        }
      }
    }
  }

  // Ensure exactly 35 questions and enforce 100% unique IDs across the exam set
  const usedIds = new Set<string>();
  const finalQuestions = chosenQuestions.slice(0, 35).map((q, idx) => {
    let uniqueId = q.id || `q-${Date.now()}-${idx}`;
    if (usedIds.has(uniqueId)) {
      uniqueId = `${uniqueId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
    }
    usedIds.add(uniqueId);
    return { ...q, id: uniqueId };
  });

  let defaultTitle = 'এডমিশন লাইভ মডেল টেস্ট';
  let defaultSubtitle = '৩৫টি প্রশ্ন • ১৮ মিনিট • নেগেটিভ মার্কিং ০.২৫ • লকড অ্যানসার';
  let uniBangla = 'এডমিশন টেস্ট';

  if (category === 'university_live') {
    if (university === 'RU') {
      defaultTitle = 'রাজশাহী বিশ্ববিদ্যালয় (RU) স্পেশাল লাইভ মডেল টেস্ট';
      uniBangla = 'রাজশাহী বিশ্ববিদ্যালয় (RU)';
    } else if (university === 'CU') {
      defaultTitle = 'চট্টগ্রাম বিশ্ববিদ্যালয় (CU) স্পেশাল লাইভ মডেল টেস্ট';
      uniBangla = 'চট্টগ্রাম বিশ্ববিদ্যালয় (CU)';
    } else if (university === 'GST') {
      defaultTitle = 'জিএসটি (GST) সমন্বিত বিজ্ঞান পূর্ণাঙ্গ মডেল টেস্ট';
      uniBangla = 'জিএসটি গুচ্ছ বিশ্ববিদ্যালয়';
    } else if (university === 'KU') {
      defaultTitle = 'খুলনা বিশ্ববিদ্যালয় (KU) স্পেশাল লাইভ টেস্ট';
      uniBangla = 'খুলনা বিশ্ববিদ্যালয় (KU)';
    } else if (university === 'CoU') {
      defaultTitle = 'কুমিল্লা বিশ্ববিদ্যালয় (CoU) স্পেশাল লাইভ টেস্ট';
      uniBangla = 'কুমিল্লা বিশ্ববিদ্যালয় (CoU)';
    }
  }

  if (subject) {
    const subjectNames: Record<string, string> = {
      physics: 'পদার্থবিজ্ঞান',
      chemistry: 'রসায়ন',
      math: 'উচ্চতর গণিত',
      biology: 'জীববিজ্ঞান',
      bangla: 'বাংলা',
      english: 'ইংরেজি',
      ict_gk: 'আইসিটি ও সাধারণ জ্ঞান',
    };
    defaultTitle = `${subjectNames[subject] || subject} পূর্ণাঙ্গ বিষয়ভিত্তিক টেস্ট`;
    if (chapter) {
      defaultTitle = `${chapter} (অধ্যায়ভিত্তিক টেস্ট - ${subjectNames[subject] || ''})`;
      defaultSubtitle = '৩৫টি অধ্যায়ভিত্তিক প্রশ্ন • ১৮ মিনিট • রিয়েল এডমিশন স্ট্যান্ডার্ড';
    }
  }

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title || defaultTitle,
    subtitle: defaultSubtitle,
    university,
    universityNameBangla: uniBangla,
    totalQuestions: 35,
    durationMinutes: 18,
    marksPerQuestion: 1,
    negativeMarks: 0.25,
    isLive: true,
    category,
    questions: finalQuestions,
  };
}
