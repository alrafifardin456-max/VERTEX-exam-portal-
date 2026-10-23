import { Question, Subject } from '../types/exam';

export interface ParsedQuestionResult {
  stem: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  subject?: Subject;
  chapter?: string;
  universityTag?: string;
  shortcutTip?: string;
}

// Cleans duplicate/chained prefixes like "ক)", "ক.", "(ক)", "ক:", "A.", "1.", "ক. ক)", etc.
export function stripOptionPrefix(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  const prefixRegex = /^[[(]?[কখগঘabcdABCD1234১-৪][\]).:\-\s]+\s*/;
  let iterations = 0;
  while (prefixRegex.test(cleaned) && iterations < 5) {
    cleaned = cleaned.replace(prefixRegex, '').trim();
    iterations++;
  }
  return cleaned;
}

export function parsePastedQuestionText(text: string): ParsedQuestionResult | null {
  if (!text || text.trim().length < 10) return null;

  const raw = text.trim();

  // 1. Try parsing as JSON first if user pasted JSON
  try {
    const jsonObj = JSON.parse(raw);
    const item = Array.isArray(jsonObj) ? jsonObj[0] : jsonObj;
    if (item && item.stem && Array.isArray(item.options) && item.options.length >= 4) {
      return {
        stem: item.stem,
        options: [
          stripOptionPrefix(item.options[0]),
          stripOptionPrefix(item.options[1]),
          stripOptionPrefix(item.options[2]),
          stripOptionPrefix(item.options[3])
        ],
        correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
        explanation: item.explanation || 'সরাসরি সূত্র ও পাঠ্যপুস্তকের আলোচনা।',
        subject: item.subject,
        chapter: item.chapter,
        universityTag: item.universityTag,
        shortcutTip: item.shortcutTip,
      };
    }
  } catch (e) {
    // Not json, continue with text regex parsing
  }

  // 2. Intelligent Text Regex Parser
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  let stem = '';
  let options: string[] = [];
  let correctAnswer = 0;
  let explanation = '';
  let chapter = '';
  let universityTag = '';
  let shortcutTip = '';

  const optRegex = /^([কখগঘabcdABCD1234])[\)\.\:\-\s]+(.*)$/;

  let isReadingExplanation = false;
  let isReadingStem = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect correct answer line
    if (/^(সঠিক\s*উত্তর|উত্তর|উত্তরঃ|Answer|Ans)[\s\:\-\=]+([কখগঘabcdABCD1234])/i.test(line)) {
      const match = line.match(/^(?:সঠিক\s*উত্তর|উত্তর|উত্তরঃ|Answer|Ans)[\s\:\-\=]+([কখগঘabcdABCD1234])/i);
      if (match) {
        const char = match[1].toLowerCase();
        if (char === 'ক' || char === 'a' || char === '1') correctAnswer = 0;
        else if (char === 'খ' || char === 'b' || char === '2') correctAnswer = 1;
        else if (char === 'গ' || char === 'c' || char === '3') correctAnswer = 2;
        else if (char === 'ঘ' || char === 'd' || char === '4') correctAnswer = 3;
      }
      isReadingExplanation = false;
      continue;
    }

    // Detect explanation line
    if (/^(ব্যাখ্যা|বিস্তারিত\s*ব্যাখ্যা|সমাধান|Explanation|Solution)[\s\:\-\=]+(.*)$/i.test(line)) {
      isReadingExplanation = true;
      const match = line.match(/^(?:ব্যাখ্যা|বিস্তারিত\s*ব্যাখ্যা|সমাধান|Explanation|Solution)[\s\:\-\=]+(.*)$/i);
      explanation = match && match[1] ? match[1] : '';
      continue;
    }

    // If reading explanation, accumulate lines
    if (isReadingExplanation) {
      if (/^(শর্টকাট|ট্রিকস|Shortcut)[\s\:\-\=]+(.*)$/i.test(line)) {
        const match = line.match(/^(?:শর্টকাট|ট্রিকস|Shortcut)[\s\:\-\=]+(.*)$/i);
        shortcutTip = match && match[1] ? match[1] : '';
        isReadingExplanation = false;
      } else {
        explanation += (explanation ? '\n' : '') + line;
      }
      continue;
    }

    // Detect options
    const optMatch = line.match(optRegex);
    if (optMatch && options.length < 4) {
      isReadingStem = false;
      options.push(stripOptionPrefix(optMatch[2]));
      continue;
    }

    // If still in stem area
    if (isReadingStem) {
      // Strip initial prefix like "প্রশ্ন ১:" or "1." or "Q:"
      const cleaned = line.replace(/^(?:প্রশ্ন|Q|Ques|Question|\d+)[\s\d\:\.\-\)]+/i, '').trim();
      stem += (stem ? ' ' : '') + (cleaned || line);
    }
  }

  // Ensure 4 options
  while (options.length < 4) {
    options.push(`অপশন ${options.length + 1}`);
  }

  if (!stem) {
    stem = lines[0] || 'এডমিশন প্রশ্ন';
  }

  return {
    stem,
    options: [
      stripOptionPrefix(options[0]),
      stripOptionPrefix(options[1]),
      stripOptionPrefix(options[2]),
      stripOptionPrefix(options[3])
    ],
    correctAnswer,
    explanation: explanation || 'পাঠ্যপুস্তকের মৌলিক সূত্র ও তথ্যের ভিত্তিতে সঠিক উত্তর নির্বাচিত।',
    shortcutTip: shortcutTip || undefined,
  };
}

// Bulk text parser to parse up to 35+ questions at once
export function parseBulkQuestionsText(
  text: string,
  defaultSubject: Subject = 'physics',
  defaultChapter: string = 'সাধারণ এডমিশন টপিক',
  defaultUniversity: string = "RU/CU/GST Special '26"
): Question[] {
  if (!text || text.trim().length < 20) return [];

  const raw = text.trim();

  // Try parsing full JSON array first
  try {
    const jsonObj = JSON.parse(raw);
    if (Array.isArray(jsonObj) && jsonObj.length > 0) {
      const usedIds = new Set<string>();
      return jsonObj.map((item, idx) => {
        let uniqueId = item.id || `bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
        if (usedIds.has(uniqueId)) {
          uniqueId = `${uniqueId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
        }
        usedIds.add(uniqueId);
        return {
          id: uniqueId,
          stem: item.stem || item.question || `প্রশ্ন ${idx + 1}`,
          options: (item.options && item.options.length >= 4)
            ? [
                stripOptionPrefix(item.options[0]),
                stripOptionPrefix(item.options[1]),
                stripOptionPrefix(item.options[2]),
                stripOptionPrefix(item.options[3])
              ]
            : ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
          correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
          explanation: item.explanation || 'সরাসরি সূত্র ও পাঠ্যপুস্তকের আলোচনা।',
          shortcutTip: item.shortcutTip,
          subject: item.subject || defaultSubject,
          subjectBangla: item.subjectBangla || 'পদার্থবিজ্ঞান',
          chapter: item.chapter || defaultChapter,
          universityTag: item.universityTag || defaultUniversity,
          difficulty: item.difficulty || 'মানসম্মত ভর্তি পরীক্ষা',
        };
      });
    }
  } catch (e) {}

  // Split into individual question blocks
  // Regex looks for new question starts: "1." or "প্রশ্ন ১:" or "Q1:" or "\n\n1 "
  const questionSplitter = /(?:\r?\n)+(?=(?:(?:প্রশ্ন|Q|Ques|Question)\s*[\d০-৯]+[\:\.\-\)]|[\d০-৯]{1,2}[\.\:\-\)]\s*))/gi;
  let chunks = raw.split(questionSplitter).map(c => c.trim()).filter(c => c.length > 15);

  // If splitter didn't find enough, try double newlines
  if (chunks.length < 2) {
    chunks = raw.split(/\n\s*\n\s*\n/).map(c => c.trim()).filter(c => c.length > 15);
  }

  const results: Question[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const parsed = parsePastedQuestionText(chunks[i]);
    if (parsed && parsed.stem) {
      results.push({
        id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        stem: parsed.stem,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        shortcutTip: parsed.shortcutTip,
        subject: parsed.subject || defaultSubject,
        subjectBangla: 'ভর্তি পরীক্ষা',
        chapter: parsed.chapter || defaultChapter,
        universityTag: parsed.universityTag || defaultUniversity,
        difficulty: 'মানসম্মত ভর্তি পরীক্ষা',
      });
    }
  }

  return results;
}
