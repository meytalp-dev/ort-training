/**
 * ImpactOS אוריינות מידע — Diagnostic
 *
 * אבחון פתיחה היברידי, ~15-20 דק'.
 * 4 חלקים, 15 שאלות:
 *   A. הרגלי AI (5)            — מודד aiHabits
 *   B. סינריו הערכת מקור (5)   — מודד 1.1, 1.2, 1.3, 1.4, 1.5
 *   C. משימת חקר זוטא (1)      — מודד 2.1, 2.2
 *   D. הצגה (4)                — מודד 3.1, 3.2, 3.3
 *
 * תוצאה: componentLevels (1-4 לכל אחד מ-13 רכיבים), aiHabits, overallLevel.
 */

// ============================================================
// QUESTIONS
// ============================================================

const DIAGNOSTIC_QUESTIONS = [

  // ===== חלק א · הרגלי AI =====

  {
    id: 'a1',
    section: 'A',
    type: 'choice',
    question: 'כמה פעמים בשבוע את.ה משתמש.ת בכלי AI כמו ChatGPT, Claude או Gemini?',
    options: [
      { value: 0, label: 'אף פעם — לא פתחתי' },
      { value: 1, label: '1–2 פעמים' },
      { value: 2, label: '3–7 פעמים' },
      { value: 3, label: 'כל יום' },
    ],
    measures: { aiHabits: { usesAI: 'value > 0' } },
  },

  {
    id: 'a2',
    section: 'A',
    type: 'choice',
    question: 'כשאת.ה מקבל.ת תשובה מ-AI, מה את.ה עושה?',
    options: [
      { value: 1, label: 'מעתיק.ה ומגיש.ה — זה נראה הגיוני' },
      { value: 2, label: 'קורא.ת ומחליט.ה אם זה נראה אמין' },
      { value: 3, label: 'בודק.ת לפעמים מול גוגל או ויקיפדיה' },
      { value: 4, label: 'מאמת.ת תמיד מול לפחות מקור אחר אחד' },
    ],
    measures: { aiHabits: { verifies: 'value >= 3' }, components: { '1.4': 'value' } },
  },

  {
    id: 'a3',
    section: 'A',
    type: 'choice',
    question: 'האם תיעדת אי פעם prompt ששאלת AI ושמרת אותו?',
    options: [
      { value: 1, label: 'מה זה תיעוד?' },
      { value: 2, label: 'לא, אני סוגר.ת את הצ\'אט אחרי שמסיים.ה' },
      { value: 3, label: 'לפעמים שומר.ת prompts טובים' },
      { value: 4, label: 'כן, יש לי תיעוד מסודר' },
    ],
    measures: { aiHabits: { documents: 'value >= 3' } },
  },

  {
    id: 'a4',
    section: 'A',
    type: 'choice',
    question: 'מתי הייתה הפעם האחרונה שזיהית טעות במה ש-AI אמר?',
    options: [
      { value: 1, label: 'לא נתקלתי בטעויות — הוא תמיד צודק' },
      { value: 2, label: 'אני לא ממש בודק.ת' },
      { value: 3, label: 'מצאתי טעות אחת או שתיים' },
      { value: 4, label: 'תפסתי "המצאות" כמה פעמים — אני יודע.ת לזהות' },
    ],
    measures: { components: { '1.4': 'value' } },
  },

  {
    id: 'a5',
    section: 'A',
    type: 'choice',
    question: 'כשמורה נותנת מטלה חדשה, מה את.ה עושה ב-15 הדקות הראשונות?',
    options: [
      { value: 1, label: 'פותח.ת ChatGPT ושואל.ת מיד' },
      { value: 2, label: 'מחפש.ת בגוגל ומעתיק.ה' },
      { value: 3, label: 'קורא.ת את ההוראה וחושב.ת מה ידוע לי' },
      { value: 4, label: 'כותב.ת מה אני יודע.ת, מה לא ברור, ומה אני רוצה לברר' },
    ],
    measures: { components: { '1.1': 'value', '2.1': 'value' } },
  },

  // ===== חלק ב · הערכת מקור =====

  {
    id: 'b1',
    section: 'B',
    type: 'choice',
    question: 'ראית בטיקטוק סרטון שאומר: "מדענים גילו שאכילת תפוז ב-22:00 גורמת לשינה טובה יותר". מה הצעד הראשון שלך?',
    options: [
      { value: 1, label: 'משתף.ת חברים — מעניין!' },
      { value: 2, label: 'מאמין.ה — מדענים גילו זה אמין' },
      { value: 3, label: 'מחפש.ת בגוגל "תפוז שינה" לראות אם יש מאמרים' },
      { value: 4, label: 'בודק.ת מי המדענים, איפה פורסם המחקר, האם הקובץ עצמו זמין' },
    ],
    measures: { components: { '1.2': 'value' } },
  },

  {
    id: 'b2',
    section: 'B',
    type: 'choice',
    question: 'שני אתרים מציגים מספרים שונים על אותו אירוע (אחד אומר 50, השני אומר 200). מה הצעד הראשון שלך?',
    options: [
      { value: 1, label: 'בוחר.ת את המספר שנשמע יותר הגיוני' },
      { value: 2, label: 'לוקח.ת ממוצע' },
      { value: 3, label: 'בודק.ת איזה אתר מצטט מקור, ומי הכותב' },
      { value: 4, label: 'מחפש.ת מקור שלישי, רצוי ראשוני (דוח רשמי, נתונים מקוריים)' },
    ],
    measures: { components: { '1.3': 'value' } },
  },

  {
    id: 'b3',
    section: 'B',
    type: 'choice',
    question: 'ChatGPT אמר לך: "במלחמת ששת הימים נהרגו 1,800 חיילים ישראלים". לא נתן מקור. מה את.ה עושה?',
    options: [
      { value: 1, label: 'משתמש.ת בנתון — זה מ-AI, זה אמין' },
      { value: 2, label: 'שואל.ת אותו "באמת?" והוא מאשר' },
      { value: 3, label: 'מחפש.ת בויקיפדיה לוודא' },
      { value: 4, label: 'בודק.ת באתר רשמי (משרד הביטחון/יד ושם) — זה תחום שבו AI עלול להמציא' },
    ],
    measures: { components: { '1.4': 'value' } },
  },

  {
    id: 'b4',
    section: 'B',
    type: 'choice',
    question: 'מאמר על נושא שנוי במחלוקת מציג רק צד אחד של הסיפור. מה זה אומר לך?',
    options: [
      { value: 1, label: 'זה כנראה הצד הנכון, אם רק עליו כותבים' },
      { value: 2, label: 'אני לא בטוח.ה' },
      { value: 3, label: 'יכול להיות שיש הטיה — כדאי לחפש את הצד השני' },
      { value: 4, label: 'בודק.ת מי כתב, את מי הוא מייצג, ומה האינטרס שלו' },
    ],
    measures: { components: { '1.5': 'value' } },
  },

  {
    id: 'b5',
    section: 'B',
    type: 'choice',
    question: 'את.ה רוצה לחקור על זיהום אוויר בירושלים. איך תנסח.י את שאלת החיפוש הראשונה?',
    options: [
      { value: 1, label: '"זיהום אוויר"' },
      { value: 2, label: '"זיהום אוויר ישראל"' },
      { value: 3, label: '"זיהום אוויר ירושלים 2025"' },
      { value: 4, label: '"דוח זיהום אוויר ירושלים site:gov.il OR site:env.gov.il"' },
    ],
    measures: { components: { '1.1': 'value' } },
  },

  // ===== חלק ג · חקר זוטא =====

  {
    id: 'c1',
    section: 'C',
    type: 'open',
    question: 'תרחיש: ראית בעיתון את הכותרת:\n\n"מחקר חדש: 70% מהנוער בישראל לא יודע לזהות פייק ניוז".\n\nכתוב.י 3 צעדים שתעשה.י כדי לוודא אם הטענה נכונה (לא תוכן הכותרת, אלא תהליך הבדיקה).',
    placeholder: 'צעד 1...\nצעד 2...\nצעד 3...',
    minWords: 15,
    measures: { components: { '1.1': 'wordCount', '1.2': 'wordCount', '2.1': 'wordCount', '2.2': 'wordCount' } },
  },

  // ===== חלק ד · הצגה =====

  {
    id: 'd1',
    section: 'D',
    type: 'choice',
    question: 'את.ה צריך.ה להסביר את אותו נושא לסבא בן 80 ולחבר בכיתה. מה משתנה?',
    options: [
      { value: 1, label: 'כלום — אותו תוכן' },
      { value: 2, label: 'משנה.ה את הקצב' },
      { value: 3, label: 'משנה.ה שפה ודוגמאות' },
      { value: 4, label: 'משנה.ה גם דוגמאות, גם מבנה, גם איך אני פותח.ת' },
    ],
    measures: { components: { '3.1': 'value' } },
  },

  {
    id: 'd2',
    section: 'D',
    type: 'choice',
    question: 'איזה תוצר היית בוחר.ת כדי להציג מחקר על אנרגיה ירוקה?',
    options: [
      { value: 1, label: 'מסמך וורד' },
      { value: 2, label: 'מצגת רגילה' },
      { value: 3, label: 'אינפוגרפיקה או סרטון קצר' },
      { value: 4, label: 'תלוי לקהל — לתלמידים סרטון, לפיקוח דוח, להורים פוסט' },
    ],
    measures: { components: { '3.2': 'value' } },
  },

  {
    id: 'd3',
    section: 'D',
    type: 'choice',
    question: 'איפה היית מפרסם.ת תוצר על קמפיין למודעות בקרב נוער?',
    options: [
      { value: 1, label: 'מגיש.ה למורה' },
      { value: 2, label: 'מציג.ה בכיתה' },
      { value: 3, label: 'מעלה לאינסטגרם של ביה"ס' },
      { value: 4, label: 'בוחר.ת פלטפורמה לפי הקהל — רילס לבני נוער, פוסט לינקדאין למבוגרים' },
    ],
    measures: { components: { '3.3': 'value' } },
  },

  {
    id: 'd4',
    section: 'D',
    type: 'choice',
    question: 'כשאת.ה מסיים.ת מצגת — איך את.ה יודע.ת שהיא מוצלחת?',
    options: [
      { value: 1, label: 'יש בה כל המידע שאספתי' },
      { value: 2, label: 'היא יפה ובלי שגיאות' },
      { value: 3, label: 'הקהל הבין את המסר' },
      { value: 4, label: 'הקהל יכול לפעול אחרי — לזכור, לשנות דעה, או להמשיך לחקור' },
    ],
    measures: { components: { '3.1': 'value', '3.2': 'value' } },
  },

];

// ============================================================
// SCORING ENGINE
// ============================================================

function computeProfile(responses) {
  const componentLevels = {};
  const aiHabits = {
    usesAI: false,
    verifies: false,
    documents: false,
    pausesBeforeAI: false,
  };

  // Init all components to empty arrays for averaging
  const componentScores = {};
  ['1.1','1.2','1.3','1.4','1.5','2.1','2.2','2.3','2.4','2.5','3.1','3.2','3.3'].forEach(c => {
    componentScores[c] = [];
  });

  // Process each response
  DIAGNOSTIC_QUESTIONS.forEach(q => {
    const resp = responses[q.id];
    if (resp === undefined || resp === null) return;

    if (q.type === 'choice') {
      const value = Number(resp);

      // AI habits
      if (q.measures.aiHabits) {
        Object.entries(q.measures.aiHabits).forEach(([key, expr]) => {
          const result = evalSimple(expr, value);
          if (result) aiHabits[key] = true;
        });
      }

      // Components
      if (q.measures.components) {
        Object.entries(q.measures.components).forEach(([comp, source]) => {
          if (source === 'value') {
            componentScores[comp].push(value);
          }
        });
      }
    }

    if (q.type === 'open') {
      // Score open response by:
      // - did they write more than minWords?
      // - heuristic: number of distinct steps mentioned
      const text = String(resp).trim();
      const words = text.split(/\s+/).filter(Boolean).length;
      const minWords = q.minWords || 10;

      let score = 1;
      if (words >= minWords) score = 2;
      if (words >= minWords * 2) score = 3;

      // Bonus: looks like a structured response (has numbers, bullet markers)
      if (/[1-9][.\)]\s|•|-/.test(text)) score = Math.min(4, score + 1);

      // Apply to all components measured by this question
      if (q.measures.components) {
        Object.keys(q.measures.components).forEach(comp => {
          componentScores[comp].push(score);
        });
      }
    }
  });

  // Special: if user reported they pause/think first (a5 score >= 3) → pausesBeforeAI
  if (Number(responses.a5) >= 3) aiHabits.pausesBeforeAI = true;

  // Compute average per component
  Object.keys(componentScores).forEach(c => {
    if (componentScores[c].length > 0) {
      const avg = componentScores[c].reduce((a,b) => a+b, 0) / componentScores[c].length;
      componentLevels[c] = Math.round(avg);
    } else {
      componentLevels[c] = 1;  // default: beginner if not measured
    }
  });

  // Overall level: weighted average across 3 dimensions
  const dim1 = avgComponents(componentLevels, ['1.1','1.2','1.3','1.4','1.5']);
  const dim2 = avgComponents(componentLevels, ['2.1','2.2','2.3','2.4','2.5']);
  const dim3 = avgComponents(componentLevels, ['3.1','3.2','3.3']);
  const overall = Math.round(0.45 * dim1 + 0.35 * dim2 + 0.20 * dim3);

  return {
    componentLevels,
    aiHabits,
    overallLevel: Math.max(1, Math.min(4, overall)),
    dimensionLevels: { 1: dim1, 2: dim2, 3: dim3 },
  };
}

function avgComponents(levels, keys) {
  const vals = keys.map(k => levels[k] || 0).filter(x => x > 0);
  if (!vals.length) return 1;
  return vals.reduce((a,b) => a+b, 0) / vals.length;
}

function evalSimple(expr, value) {
  // Very limited expression evaluator: "value > N", "value >= N", "value < N", "value <= N", "value === N"
  const m = expr.match(/^value\s*(>=|<=|>|<|===|!==|==|!=)\s*(-?\d+)$/);
  if (!m) return false;
  const op = m[1];
  const n = Number(m[2]);
  switch (op) {
    case '>':   return value >  n;
    case '>=':  return value >= n;
    case '<':   return value <  n;
    case '<=':  return value <= n;
    case '===':
    case '==':  return value === n;
    case '!==':
    case '!=':  return value !== n;
  }
  return false;
}

// ============================================================
// UI / FLOW
// ============================================================

let currentQuestionIndex = 0;
let responses = {};
let startedAt = null;

function startDiagnostic() {
  startedAt = Date.now();
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('question-screen').classList.remove('hidden');
  showQuestion(0);
}

function showQuestion(index) {
  if (index >= DIAGNOSTIC_QUESTIONS.length) {
    finishDiagnostic();
    return;
  }

  currentQuestionIndex = index;
  const q = DIAGNOSTIC_QUESTIONS[index];

  // Progress
  const total = DIAGNOSTIC_QUESTIONS.length;
  document.getElementById('progress-text').textContent = `שאלה ${index + 1} מתוך ${total}`;
  document.getElementById('progress-bar').style.width = `${((index + 1) / total) * 100}%`;

  // Section badge
  const sectionNames = {
    A: { label: 'הרגלי AI', color: 'think' },
    B: { label: 'הערכת מקור', color: 'truth' },
    C: { label: 'חקר זוטא', color: 'truth' },
    D: { label: 'הצגה ושיתוף', color: 'voice' },
  };
  const section = sectionNames[q.section];
  const badge = document.getElementById('q-section-badge');
  badge.textContent = section.label;
  badge.className = `text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-${section.color}-100 text-${section.color}-700`;

  // Question content
  document.getElementById('question-content').innerHTML = `
    <h2 class="text-xl md:text-2xl font-bold leading-relaxed whitespace-pre-line">${escapeHtml(q.question)}</h2>
  `;

  // Answer area
  const answerArea = document.getElementById('answer-area');
  answerArea.innerHTML = '';

  if (q.type === 'choice') {
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-right p-4 border-2 border-gray-200 rounded-xl hover:border-truth-400 hover:bg-truth-50 transition cursor-pointer';
      btn.textContent = opt.label;
      btn.onclick = () => selectAnswer(q.id, opt.value);
      answerArea.appendChild(btn);
    });
  } else if (q.type === 'open') {
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full p-4 border-2 border-gray-200 rounded-xl focus:border-truth-500 focus:outline-none min-h-[200px] text-base leading-relaxed';
    textarea.placeholder = q.placeholder || 'כתוב.י כאן...';
    textarea.id = 'open-answer';
    textarea.value = responses[q.id] || '';
    answerArea.appendChild(textarea);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'w-full bg-truth-600 hover:bg-truth-700 text-white py-3 rounded-xl font-semibold transition';
    submitBtn.textContent = 'המשך לשאלה הבאה';
    submitBtn.onclick = () => {
      const val = document.getElementById('open-answer').value.trim();
      if (val.length < 10) {
        alert('כתוב.י לפחות תשובה קצרה — זה עוזר לאבחון');
        return;
      }
      selectAnswer(q.id, val);
    };
    answerArea.appendChild(submitBtn);
  }
}

function selectAnswer(questionId, value) {
  responses[questionId] = value;
  setTimeout(() => showQuestion(currentQuestionIndex + 1), 200);
}

function skipQuestion() {
  const q = DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
  responses[q.id] = null;  // skipped
  showQuestion(currentQuestionIndex + 1);
}

async function finishDiagnostic() {
  document.getElementById('question-screen').classList.add('hidden');
  document.getElementById('results-screen').classList.remove('hidden');

  const profile = computeProfile(responses);
  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

  // Display results
  const levelInfo = CONFIG.LEVELS[profile.overallLevel] || CONFIG.LEVELS[1];
  document.getElementById('result-level-num').textContent = profile.overallLevel;
  document.getElementById('result-level-name').textContent = levelInfo.name;
  document.getElementById('result-level-desc').textContent = levelInfo.desc;

  // Dimensions
  const dims = profile.dimensionLevels;
  document.getElementById('dim-1-level').textContent = dims[1].toFixed(1);
  document.getElementById('dim-2-level').textContent = dims[2].toFixed(1);
  document.getElementById('dim-3-level').textContent = dims[3].toFixed(1);

  // Strengths (top-3 components by level)
  const sortedComps = Object.entries(profile.componentLevels).sort((a,b) => b[1] - a[1]);
  const strengths = sortedComps.slice(0, 3).filter(([,lvl]) => lvl >= 3);
  const weaknesses = sortedComps.slice(-3).filter(([,lvl]) => lvl <= 2);

  const strengthsEl = document.getElementById('result-strengths');
  if (strengths.length) {
    strengthsEl.innerHTML = strengths.map(([id, lvl]) => `
      <div class="flex items-center gap-2 p-2 bg-truth-50 rounded-lg">
        <span class="font-semibold text-truth-700">${id}</span>
        <span>${CONFIG.COMPONENTS[id].name}</span>
        <span class="text-xs text-truth-600 mr-auto">רמה ${lvl}</span>
      </div>
    `).join('');
  } else {
    strengthsEl.innerHTML = '<div class="text-sm text-gray-500 p-2">עדיין לא זוהו חוזקות בולטות — נמצא יחד.</div>';
  }

  const weakEl = document.getElementById('result-weaknesses');
  if (weaknesses.length) {
    weakEl.innerHTML = weaknesses.map(([id, lvl]) => `
      <div class="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
        <span class="font-semibold text-amber-700">${id}</span>
        <span>${CONFIG.COMPONENTS[id].name}</span>
        <span class="text-xs text-amber-600 mr-auto">רמה ${lvl}</span>
      </div>
    `).join('');
  } else {
    weakEl.innerHTML = '<div class="text-sm text-gray-500 p-2">פרופיל מאוזן — נעבוד על העמקה.</div>';
  }

  // AI habits summary
  const habits = profile.aiHabits;
  const habitsEl = document.getElementById('result-ai-habits');
  habitsEl.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="${habits.usesAI ? 'text-truth-700' : 'text-gray-500'}">${habits.usesAI ? '✓' : '○'} משתמש.ת ב-AI</div>
      <div class="${habits.verifies ? 'text-truth-700' : 'text-gray-500'}">${habits.verifies ? '✓' : '○'} מאמת.ת תשובות</div>
      <div class="${habits.documents ? 'text-truth-700' : 'text-gray-500'}">${habits.documents ? '✓' : '○'} מתעד.ת prompts</div>
      <div class="${habits.pausesBeforeAI ? 'text-truth-700' : 'text-gray-500'}">${habits.pausesBeforeAI ? '✓' : '○'} עוצר.ת לחשוב לפני</div>
    </div>
  `;

  // Submit to backend (silently — UI already shown)
  if (!isDemoMode()) {
    try {
      await API.submitDiagnostic({
        responses,
        computedProfile: profile,
        durationSeconds,
      });
    } catch (err) {
      console.warn('Diagnostic submit failed:', err.message);
      // Save locally as fallback
      localStorage.setItem('impactos_il_diagnostic_pending', JSON.stringify({ responses, profile, durationSeconds }));
    }
  } else {
    // Demo mode: save profile locally
    localStorage.setItem(CONFIG.STORAGE_KEYS.PROFILE, JSON.stringify({
      overallLevel: profile.overallLevel,
      diagnosticCompletedAt: new Date().toISOString(),
      componentLevels: profile.componentLevels,
      currentStage: 'open',
      aiHabits: profile.aiHabits,
    }));
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Require auth (student only)
  const user = requireAuth(['student']);
  if (!user) return;
});
