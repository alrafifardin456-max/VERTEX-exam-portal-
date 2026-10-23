import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { exec } from 'node:child_process';
import { GoogleGenAI, Type } from '@google/genai';
import { QUESTION_BANK } from './src/data/questionBank';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini API initialization
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
  });
} else {
  try {
    ai = new GoogleGenAI({});
  } catch (e) {
    ai = null;
  }
}

function normalizeSubject(s: string | undefined): string {
  if (!s) return '';
  const str = s.toLowerCase().trim();
  if (str === 'physics' || str.includes('পদার্থ')) return 'physics';
  if (str === 'chemistry' || str.includes('রসায়ন') || str.includes('রসাযন')) return 'chemistry';
  if (str === 'math' || str.includes('গণিত') || str.includes('ম্যাথ')) return 'math';
  if (str === 'biology' || str.includes('জীব')) return 'biology';
  if (str === 'bangla' || str.includes('বাংলা')) return 'bangla';
  if (str === 'english' || str.includes('ইংরেজি') || str.includes('ইংরেজি')) return 'english';
  if (str === 'ict_gk' || str.includes('আইসিটি') || str.includes('জ্ঞান')) return 'ict_gk';
  return str;
}

function stripOptionPrefixServer(text: string): string {
  if (!text) return '';
  let cleaned = String(text).trim();
  const prefixRegex = /^[[(]?[কখগঘabcdABCD1234১-৪][\]).:\-\s]+\s*/;
  let iterations = 0;
  while (prefixRegex.test(cleaned) && iterations < 5) {
    cleaned = cleaned.replace(prefixRegex, '').trim();
    iterations++;
  }
  return cleaned;
}

// Resilient multi-model generator with automatic fallback
async function generateWithFallback(options: {
  contents: string;
  systemInstruction?: string;
  schema?: any;
}) {
  if (!ai) throw new Error('Gemini not initialized');
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastErr = null;
  for (const m of models) {
    try {
      const config: any = {
        responseMimeType: 'application/json',
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.schema) {
        config.responseSchema = options.schema;
      }
      const res = await ai.models.generateContent({
        model: m,
        contents: options.contents,
        config,
      });
      if (res && res.text) {
        return res;
      }
    } catch (err: any) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr || new Error('All Gemini models unavailable');
}

// Endpoint to generate dynamic fresh university admission questions
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { 
      subject, 
      chapter, 
      university = 'ALL', 
      count = 35,
      excludeQuestionIds = []
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API Key is not configured on the server. Falling back to local dynamic bank.',
        fallback: true
      });
    }

    const subjectText = subject ? `Subject: ${subject}` : 'Combined (Physics, Chemistry, Math, Biology, Bangla, English, ICT)';
    const chapterText = chapter ? `Specific Chapter: ${chapter}` : 'Full Syllabus high-yield admission topics';
    const universityText = university !== 'ALL' ? `Target University style: ${university} (Rajshahi, Chittagong, Khulna, Comilla, GST cluster)` : 'Mixed RU, CU, KU, CoU, GST styles';

    const systemPrompt = `You are a premier senior question setter for Bangladeshi Public University Admission Tests for session 2026-27.
Generate exactly ${count} multiple choice questions (MCQ) in authentic Bengali language.
CRITICAL RULE 1 (Strict Chapter & Subject Alignment): The questions MUST belong strictly and exclusively to Subject: "${subject || 'General'}" and Specific Chapter: "${chapter || 'General'}". Do NOT mix up topics or generate questions from any other chapter or subject (e.g., if chapter is 'সমন্বয় ও নিয়ন্ত্রণ' or any specific biology/physics chapter, questions must strictly be about that exact chapter and never about unrelated chapters like vectors or mechanics).
CRITICAL RULE 2: Do NOT include any university names (such as রাজশাহী বিশ্ববিদ্যালয়, চট্টগ্রাম বিশ্ববিদ্যালয়, ঢাকা বিশ্ববিদ্যালয়, ইত্যাদি) inside the question stem or options.
Each question MUST follow genuine admission standards:
- Clear scientific/literary Bengali stem
- 4 plausible options (ক, খ, গ, ঘ)
- 1 definitely correct answer index (0, 1, 2, or 3)
- Thorough, step-by-step Bengali explanation (বিস্তারিত ব্যাখ্যা)
- Practical admission shortcut or tip (শর্টকাট ট্রিকস)
- Chapter name set strictly to "${chapter || 'General'}" and subject set strictly to "${subject || 'physics'}".
Focus on: ${subjectText}, ${chapterText}, ${universityText}.
Generate strictly valid JSON format.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          stem: { type: Type.STRING, description: 'Question stem in Bengali' },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Exactly 4 options in Bengali'
          },
          correctAnswer: { type: Type.INTEGER, description: '0 to 3' },
          explanation: { type: Type.STRING, description: 'Detailed Bengali step-by-step solution' },
          shortcutTip: { type: Type.STRING, description: 'Quick admission hack' },
          subject: { type: Type.STRING, description: 'physics, chemistry, math, biology, bangla, english, or ict_gk' },
          subjectBangla: { type: Type.STRING, description: 'বিষয় নাম বাংলায়' },
          chapter: { type: Type.STRING, description: 'অধ্যায় নাম' },
          universityTag: { type: Type.STRING, description: 'e.g. RU C-Unit, CU A-Unit, GST' },
          difficulty: { type: Type.STRING, description: 'সহজ, মাঝারি, মানসম্মত ভর্তি পরীক্ষা' }
        },
        required: ['stem', 'options', 'correctAnswer', 'explanation', 'subject', 'chapter', 'universityTag']
      }
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timeout')), 35000)
    );

    let response: any;
    try {
      response = await Promise.race([
        generateWithFallback({
          contents: `Generate ${count} completely unique varsity admission MCQs matching the 2026-27 pattern for ${subjectText} - ${chapterText}. Every single question stem must be different.`,
          systemInstruction: systemPrompt,
          schema
        }),
        timeoutPromise
      ]);
    } catch (timeoutErr) {
      const normSub = normalizeSubject(subject);
      const matchingPool = QUESTION_BANK.filter(q => {
        if (normSub && normalizeSubject(q.subject) !== normSub) return false;
        if (chapter && q.chapter !== chapter) return false;
        return true;
      });

      const fallbackPool = matchingPool.length > 0 
        ? matchingPool 
        : (normSub ? QUESTION_BANK.filter(q => normalizeSubject(q.subject) === normSub) : QUESTION_BANK);

      const fallbackQs: any[] = [];
      const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random());
      while (fallbackQs.length < count && fallbackPool.length > 0) {
        for (const q of shuffled) {
          if (fallbackQs.length < count) {
            fallbackQs.push({
              ...q,
              id: `fb-${Date.now()}-${fallbackQs.length}-${Math.random().toString(36).substring(2, 7)}`,
              subject: normSub || q.subject,
              chapter: chapter || q.chapter
            });
          }
        }
      }
      return res.json({ success: true, questions: fallbackQs, fallback: true });
    }

    const questionsJson = response.text ? JSON.parse(response.text) : [];
    
    // Strict stem deduplication
    const seenStems = new Set<string>();
    const sanitizedQuestions: any[] = [];
    questionsJson.forEach((q: any, idx: number) => {
      if (!q || !q.stem) return;
      const stemKey = q.stem.trim().toLowerCase();
      if (seenStems.has(stemKey)) return;
      seenStems.add(stemKey);
      const rawOptions = (q.options && q.options.length === 4) ? q.options : ['ক', 'খ', 'গ', 'ঘ'];
      const cleanOptions = rawOptions.map((opt: any) => stripOptionPrefixServer(String(opt)));
      sanitizedQuestions.push({
        ...q,
        id: q.id || `ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        options: cleanOptions,
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
      });
    });

    return res.json({
      success: true,
      questions: sanitizedQuestions
    });

  } catch (error: any) {
    console.error('Gemini question generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate questions via AI',
      fallback: true
    });
  }
});

// Endpoint to get AI-powered detailed explanation or shortcut for any question
app.post('/api/ai-explain', async (req, res) => {
  try {
    const { questionText, options, studentAnswer, correctAnswer } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini not configured' });
    }

    const prompt = `You are a Bangladeshi university admission mentor (RU, CU, GST, KU, CoU).
Question: "${questionText}"
Options: ${JSON.stringify(options)}
Student's Chosen Option: ${studentAnswer !== null ? options[studentAnswer] : 'Not answered (skipped)'}
Correct Option: ${options[correctAnswer]}

Explain clearly in Bengali:
1. Why the correct option is right (with formula/concept).
2. Why the student's chosen option is a common trap (if wrong).
3. Admission shortcut/mnemonic trick (এডমিশন শর্টকাট ট্রিকস) to solve in under 25 seconds during the exam.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ explanation: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to generate questions from natural language Bengali user prompt
app.post('/api/generate-from-user-prompt', async (req, res) => {
  try {
    const { userPrompt, count = 35, subject, chapter } = req.body;
    console.log('Gemini prompt generation request:', { userPrompt, count, subject, chapter });

    if (!ai) {
      return res.status(503).json({ error: 'Gemini not configured on server' });
    }

    const normSub = normalizeSubject(subject);
    const systemPrompt = `You are a premier senior question setter for Bangladeshi University Admission Tests (session 2026-27).
Generate exactly ${count} completely unique, individual, non-repeating multiple choice questions (MCQ) in authentic Bengali.
ABSOLUTE RULES:
1. EVERY SINGLE QUESTION MUST BE DISTINCT AND UNIQUE. Never generate the same question or stem twice!
2. All questions MUST belong strictly to Subject: "${normSub || 'physics'}" and Chapter: "${chapter || 'General'}".
3. Each question object must have:
   - stem: unique question in clear scientific/literary Bengali
   - options: array of 4 distinct choices [ক, খ, গ, ঘ]
   - correctAnswer: integer 0, 1, 2, or 3
   - explanation: step-by-step Bengali solution
   - shortcutTip: admission hack/trick
   - subject: "${normSub || 'physics'}"
   - chapter: "${chapter || 'সাধারণ এডমিশন টপিক'}"
Return strictly valid JSON array.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          stem: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswer: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          shortcutTip: { type: Type.STRING },
          subject: { type: Type.STRING },
          subjectBangla: { type: Type.STRING },
          chapter: { type: Type.STRING },
          universityTag: { type: Type.STRING },
          difficulty: { type: Type.STRING },
        },
        required: ['stem', 'options', 'correctAnswer', 'explanation', 'subject', 'chapter'],
      },
    };

    // Give Gemini up to 75 seconds so all 35 distinct questions can be generated without cutoff
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timeout')), 75000)
    );

    let response: any;
    try {
      response = await Promise.race([
        generateWithFallback({
          contents: `Generate ${count} completely unique admission MCQs for Subject: "${normSub || 'physics'}" and Chapter: "${chapter}". Prompt details: "${userPrompt}". Every single question must be unique.`,
          systemInstruction: systemPrompt,
          schema
        }),
        timeoutPromise
      ]);
    } catch (timeoutErr) {
      // Do NOT repeat the same question 35 times!
      // Return whatever unique questions exist for this chapter/subject in bank without duplicate stems
      const normSub = normalizeSubject(subject);
      const matchingPool = QUESTION_BANK.filter(q => {
        if (normSub && normalizeSubject(q.subject) !== normSub) return false;
        if (chapter && q.chapter !== chapter) return false;
        return true;
      });

      const fallbackPool = matchingPool.length > 0 
        ? matchingPool 
        : (normSub ? QUESTION_BANK.filter(q => normalizeSubject(q.subject) === normSub) : []);

      const seen = new Set<string>();
      const uniqueFallback: any[] = [];
      for (const q of fallbackPool) {
        const stemKey = (q.stem || '').trim();
        if (!seen.has(stemKey)) {
          seen.add(stemKey);
          uniqueFallback.push({
            ...q,
            id: `bank-unique-${Date.now()}-${uniqueFallback.length}-${Math.random().toString(36).substring(2, 7)}`,
            subject: normSub || q.subject,
            chapter: chapter || q.chapter
          });
        }
      }

      if (uniqueFallback.length > 0) {
        return res.json({
          success: true,
          questions: uniqueFallback,
          fallback: true,
          message: 'এআই সার্ভারে সাময়িক বিলম্ব হওয়ায় ব্যাংকে বিদ্যমান ইউনিক প্রশ্নগুলো দেওয়া হলো।'
        });
      }

      return res.status(503).json({
        success: false,
        error: 'এআই সার্ভারে অতিরিক্ত চাপ রয়েছে। অনুগ্রহ করে কয়েক মুহূর্ত পর পুনরায় চেষ্টা করুন।'
      });
    }

    const parsed = response.text ? JSON.parse(response.text) : [];
    const normSubFinal = normalizeSubject(subject);
    
    // Strict stem-based deduplication: NEVER allow identical questions!
    const seenStems = new Set<string>();
    const sanitized: any[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      if (!q || !q.stem) continue;
      const stemKey = q.stem.trim().toLowerCase();
      if (seenStems.has(stemKey)) continue; // skip duplicates!
      seenStems.add(stemKey);

      const rawOptions = (q.options && q.options.length === 4) ? q.options : ['ক', 'খ', 'গ', 'ঘ'];
      const cleanOptions = rawOptions.map((opt: any) => stripOptionPrefixServer(String(opt)));
      sanitized.push({
        ...q,
        id: q.id || `ai-prompt-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        subject: normSubFinal || normalizeSubject(q.subject) || 'physics',
        chapter: chapter || q.chapter || 'সাধারণ এডমিশন টপিক',
        options: cleanOptions,
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      });
    }

    return res.json({ success: true, questions: sanitized });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'প্রশ্ন তৈরিতে ত্রুটি হয়েছে' });
  }
});

// Endpoint to download the entire project as a ZIP file
app.get('/api/download-source-zip', (req, res) => {
  try {
    const zipPath = '/tmp/varsity-admission-exam-portal.zip';
    
    // Create zip excluding heavy or temporary folders
    const cmd = `python3 -c "import zipfile, os
with zipfile.ZipFile('${zipPath}', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.aistudio', '.cache']]
        for file in files:
            p = os.path.join(root, file)
            zf.write(p, p)
"`;

    exec(cmd, (err: any) => {
      if (err) {
        console.error('Failed to create zip', err);
        return res.status(500).send('Failed to package project zip');
      }
      res.download(zipPath, 'varsity-admission-exam-portal-2026.zip');
    });
  } catch (e: any) {
    res.status(500).send('Error generating zip: ' + e.message);
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live Admission Exam Portal server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
