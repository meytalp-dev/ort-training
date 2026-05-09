/**
 * ImpactOS Tnufa English — Diagnostic Test
 *
 * אבחון פתיחה של 20 שאלות.
 * מודד 5 תחומים: Vocabulary, Grammar, Reading, Inference, Writing.
 * תוצאה: רמת CEFR + רכיבי חוזקה/חולשה.
 */

// ===== Question Bank =====
//
// 20 questions covering:
// - 5 Vocabulary (chunks + isolated words)
// - 5 Grammar (Present Simple, Past Simple, Modals)
// - 5 Reading (literal + inferential)
// - 3 Lexical chunks
// - 2 Writing (open-ended, scored by rubric)
//
// Difficulty levels (estimated):
// - 5 questions at A1 level
// - 10 questions at A2 level
// - 5 questions at B1 level
//
// CEFR Estimation Logic:
// - Score >= 16 (80%) → A2+ approaching B1
// - Score 12-15 (60-75%) → A2
// - Score 8-11 (40-55%) → A1+
// - Score < 8 → Pre-A1 / A1

const QUESTIONS = [
  // ===== Vocabulary (5) =====
  {
    id: 'v1',
    type: 'vocabulary',
    typeLabel: 'Vocabulary',
    level: 'A1',
    component: 'vocab_basic',
    question: "What's the missing word?",
    text: "I _____ to school every day.",
    options: ['go', 'goes', 'going', 'went'],
    correct: 0,
  },
  {
    id: 'v2',
    type: 'vocabulary',
    typeLabel: 'Vocabulary',
    level: 'A1',
    component: 'vocab_basic',
    question: "Which word means the same as 'big'?",
    options: ['small', 'large', 'old', 'new'],
    correct: 1,
  },
  {
    id: 'v3',
    type: 'vocabulary',
    typeLabel: 'Vocabulary',
    level: 'A2',
    component: 'vocab_chunks',
    question: "Which is correct?",
    options: ['I am 14 years', 'I have 14 years', "I'm 14 years old", 'I 14 old'],
    correct: 2,
  },
  {
    id: 'v4',
    type: 'vocabulary',
    typeLabel: 'Lexical chunks',
    level: 'A2',
    component: 'vocab_chunks',
    question: 'Complete: "I _____ a shower every morning."',
    options: ['do', 'make', 'take', 'have'],
    correct: 2,
  },
  {
    id: 'v5',
    type: 'vocabulary',
    typeLabel: 'Lexical chunks',
    level: 'B1',
    component: 'vocab_advanced',
    question: 'Complete: "On the _____ hand, I think it\'s a great idea."',
    options: ['one', 'other', 'second', 'next'],
    correct: 1,
  },

  // ===== Grammar (5) =====
  {
    id: 'g1',
    type: 'grammar',
    typeLabel: 'Grammar — Present',
    level: 'A1',
    component: 'grammar_present',
    question: 'Choose the correct form:',
    text: 'My sister _____ basketball on Saturdays.',
    options: ['play', 'plays', 'playing', 'played'],
    correct: 1,
  },
  {
    id: 'g2',
    type: 'grammar',
    typeLabel: 'Grammar — Present Continuous',
    level: 'A2',
    component: 'grammar_present',
    question: "What's right?",
    text: "Look! It _____ outside!",
    options: ['rain', 'rains', 'is raining', 'rained'],
    correct: 2,
  },
  {
    id: 'g3',
    type: 'grammar',
    typeLabel: 'Grammar — Past Simple',
    level: 'A2',
    component: 'grammar_past',
    question: 'Choose the correct past form:',
    text: 'Yesterday, I _____ to the cinema with my friends.',
    options: ['go', 'goes', 'went', 'gone'],
    correct: 2,
  },
  {
    id: 'g4',
    type: 'grammar',
    typeLabel: 'Grammar — Past Simple (irregular)',
    level: 'A2',
    component: 'grammar_past',
    question: 'Choose the correct form:',
    text: 'She _____ a great book last week.',
    options: ['readed', 'read', 'reads', 'reading'],
    correct: 1,
  },
  {
    id: 'g5',
    type: 'grammar',
    typeLabel: 'Grammar — Modals',
    level: 'B1',
    component: 'grammar_modals',
    question: "What's the best choice?",
    text: 'You _____ wear a helmet when you ride a bike. It\'s safer.',
    options: ['must', 'should', 'can', 'might'],
    correct: 1,
  },

  // ===== Reading - Literal (3) =====
  {
    id: 'r1',
    type: 'reading',
    typeLabel: 'Reading — Literal',
    level: 'A1',
    component: 'reading_literal',
    question: 'Read the message and answer:',
    text: 'Hi Maya! Don\'t forget — basketball practice today at 4 PM. Bring water!',
    questionPrompt: 'What time is the practice?',
    options: ['3 PM', '4 PM', '5 PM', '6 PM'],
    correct: 1,
  },
  {
    id: 'r2',
    type: 'reading',
    typeLabel: 'Reading — Literal',
    level: 'A2',
    component: 'reading_literal',
    question: 'Read the diary entry:',
    text: 'Today was amazing! I went to the beach with Lior. We swam, ate pizza, and watched the sunset. I felt so happy and relaxed.',
    questionPrompt: 'Who did the writer go with?',
    options: ['Mom', 'Dad', 'Lior', 'Alone'],
    correct: 2,
  },
  {
    id: 'r3',
    type: 'reading',
    typeLabel: 'Reading — Literal',
    level: 'A2',
    component: 'reading_literal',
    question: 'Read the ad:',
    text: 'PIZZA HEAVEN — Special Tuesday Deal! Buy 1 large pizza, get 1 medium FREE. Family size only 49 NIS. Open 12 PM - 11 PM.',
    questionPrompt: 'When does the special deal happen?',
    options: ['Every day', 'Tuesdays', 'Weekends', 'Family days'],
    correct: 1,
  },

  // ===== Reading - Inferential (3) =====
  {
    id: 'i1',
    type: 'reading',
    typeLabel: 'Reading — Inference',
    level: 'A2',
    component: 'reading_inference',
    question: 'Read this short story:',
    text: 'Daniel waited for the bus. He looked at his watch and frowned. He started running.',
    questionPrompt: 'Why is Daniel running?',
    options: [
      'He likes running for exercise',
      'He is going to be late',
      'He is racing his friend',
      'He is cold',
    ],
    correct: 1,
  },
  {
    id: 'i2',
    type: 'reading',
    typeLabel: 'Reading — Inference',
    level: 'B1',
    component: 'reading_inference',
    question: 'Read the email:',
    text: 'Hi Mom, I\'m at Tomer\'s house. We finished our science project. Can you pick me up at 7? Thanks. xxx',
    questionPrompt: 'What does the writer want?',
    options: [
      'Help with science project',
      'A ride home',
      'To stay overnight',
      'Money for dinner',
    ],
    correct: 1,
  },
  {
    id: 'i3',
    type: 'reading',
    typeLabel: 'Reading — Inference',
    level: 'B1',
    component: 'reading_inference',
    question: 'Read this:',
    text: 'The classroom was completely silent. Everyone was concentrating hard. Some students were biting their pencils. Others kept checking the clock.',
    questionPrompt: 'What is probably happening?',
    options: [
      'Free time',
      'A lecture',
      'A test',
      'A meeting',
    ],
    correct: 2,
  },

  // ===== Writing (2) =====
  {
    id: 'w1',
    type: 'writing',
    typeLabel: 'Writing',
    level: 'A1',
    component: 'writing_basic',
    question: 'Write 1-2 sentences in English:',
    questionPrompt: 'Tell us about your favorite hobby.',
    minLength: 5,
    maxLength: 200,
  },
  {
    id: 'w2',
    type: 'writing',
    typeLabel: 'Writing',
    level: 'A2',
    component: 'writing_intermediate',
    question: 'Write 2-3 sentences in English:',
    questionPrompt: 'What did you do last weekend?',
    minLength: 10,
    maxLength: 300,
  },

  // ===== Cohesive Devices (2) =====
  {
    id: 'c1',
    type: 'grammar',
    typeLabel: 'Connectors',
    level: 'A2',
    component: 'cohesive_devices',
    question: 'Complete the sentence:',
    text: 'I love pizza, _____ I don\'t like olives on it.',
    options: ['and', 'because', 'but', 'so'],
    correct: 2,
  },
  {
    id: 'c2',
    type: 'grammar',
    typeLabel: 'Connectors',
    level: 'B1',
    component: 'cohesive_devices',
    question: 'Choose the best connector:',
    text: 'She studied hard. _____, she got the highest grade.',
    options: ['However', 'But', 'As a result', 'Because'],
    correct: 2,
  },
];

// ===== State =====
let currentQuestionIndex = 0;
let answers = [];

// ===== Init =====

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth(['student']);
  if (!user) return;
  // Welcome screen is shown by default
});

function startDiagnostic() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('question-screen').classList.remove('hidden');
  showQuestion(0);
}

function showQuestion(index) {
  if (index >= QUESTIONS.length) {
    finishDiagnostic();
    return;
  }

  currentQuestionIndex = index;
  const q = QUESTIONS[index];

  // Update progress
  const progress = Math.round(((index) / QUESTIONS.length) * 100);
  document.getElementById('progress-bar').style.width = progress + '%';
  document.getElementById('progress-text').textContent = `שאלה ${index + 1} מתוך ${QUESTIONS.length}`;

  // Update type badge
  document.getElementById('q-type-badge').textContent = q.typeLabel;

  // Render question
  const questionContent = document.getElementById('question-content');
  let html = `<h2 class="text-lg font-semibold mb-3">${q.question}</h2>`;
  if (q.text) {
    html += `<div class="bg-gray-50 rounded-xl p-4 font-en text-base mb-4 leading-relaxed">${q.text}</div>`;
  }
  if (q.questionPrompt) {
    html += `<p class="text-base font-medium font-en">${q.questionPrompt}</p>`;
  }
  questionContent.innerHTML = html;

  // Render answer area
  const answerArea = document.getElementById('answer-area');
  if (q.type === 'writing') {
    answerArea.innerHTML = `
      <textarea id="writing-answer" rows="4" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lead-500 focus:outline-none font-en" placeholder="Write here..."></textarea>
      <button onclick="submitWriting()" class="w-full bg-lead-600 hover:bg-lead-700 text-white py-3 rounded-xl font-semibold transition mt-3">המשך</button>
    `;
    setTimeout(() => document.getElementById('writing-answer').focus(), 100);
  } else {
    // Multiple choice
    answerArea.innerHTML = q.options.map((opt, i) => `
      <button onclick="submitChoice(${i})" class="w-full text-right p-4 rounded-xl border-2 border-gray-200 hover:border-lead-400 hover:bg-lead-50 transition font-en">
        ${opt}
      </button>
    `).join('');
  }
}

function submitChoice(choiceIndex) {
  const q = QUESTIONS[currentQuestionIndex];
  answers.push({
    questionId: q.id,
    type: q.type,
    component: q.component,
    level: q.level,
    answer: choiceIndex,
    correct: choiceIndex === q.correct,
  });
  showQuestion(currentQuestionIndex + 1);
}

function submitWriting() {
  const q = QUESTIONS[currentQuestionIndex];
  const text = document.getElementById('writing-answer').value.trim();

  if (text.length < q.minLength) {
    alert(`כתבי לפחות ${q.minLength} תווים`);
    return;
  }

  // Simple length-based heuristic for writing
  // (V1 will use AI scoring)
  const wordCount = text.split(/\s+/).length;
  const score = wordCount >= 8 ? 1 : wordCount >= 4 ? 0.5 : 0;

  answers.push({
    questionId: q.id,
    type: q.type,
    component: q.component,
    level: q.level,
    answer: text,
    wordCount,
    correct: score >= 0.5,
  });

  showQuestion(currentQuestionIndex + 1);
}

function skipQuestion() {
  const q = QUESTIONS[currentQuestionIndex];
  answers.push({
    questionId: q.id,
    type: q.type,
    component: q.component,
    level: q.level,
    answer: null,
    skipped: true,
    correct: false,
  });
  showQuestion(currentQuestionIndex + 1);
}

async function finishDiagnostic() {
  // Hide question screen
  document.getElementById('question-screen').classList.add('hidden');
  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('progress-text').textContent = 'מנתח תוצאות...';

  // Compute CEFR level
  const correctCount = answers.filter(a => a.correct).length;
  const total = answers.length;
  const percentage = (correctCount / total) * 100;

  let cefrLevel = 'Pre-A1';
  let description = '';

  if (percentage >= 80) {
    cefrLevel = 'A2+';
    description = 'את.ה כבר מעבר לסף — נצא ישר ליחידות ה-A2 ונוסיף אתגר.';
  } else if (percentage >= 60) {
    cefrLevel = 'A2';
    description = 'את.ה ברמת A2 — בדיוק ביעד תנופה. נחזק את החולשות.';
  } else if (percentage >= 40) {
    cefrLevel = 'A1+';
    description = 'את.ה ברמת A1 גבוהה. ה-Bridge יקרב אותך ל-A2.';
  } else if (percentage >= 25) {
    cefrLevel = 'A1';
    description = 'את.ה ברמת A1 בסיסית. נבנה יסודות חזקים לפני שעולים.';
  } else {
    cefrLevel = 'Pre-A1';
    description = 'את.ה ברמה התחלתית. קח.י את זה לאט — לאט-לאט נבנה את האנגלית שלך.';
  }

  // Compute component strengths
  const componentStats = {};
  answers.forEach(a => {
    if (!componentStats[a.component]) {
      componentStats[a.component] = { correct: 0, total: 0 };
    }
    componentStats[a.component].total++;
    if (a.correct) componentStats[a.component].correct++;
  });

  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];
  for (const [component, stats] of Object.entries(componentStats)) {
    const pct = (stats.correct / stats.total) * 100;
    const label = COMPONENT_LABELS[component] || component;
    if (pct >= 70) strengths.push(label);
    else if (pct < 50) weaknesses.push(label);
  }

  // Save profile
  try {
    await API.saveProfile({
      cefrLevel,
      diagnosticCompletedAt: new Date().toISOString(),
      componentStrengths: componentStats,
    });
  } catch (error) {
    console.error('Save profile error:', error);
    showError('בעיה בשמירת התוצאה: ' + error.message);
  }

  // Show results
  showResults(cefrLevel, description, strengths, weaknesses);
}

function showResults(cefrLevel, description, strengths, weaknesses) {
  document.getElementById('progress-text').textContent = '';
  document.getElementById('results-screen').classList.remove('hidden');

  document.getElementById('result-cefr').textContent = cefrLevel;
  document.getElementById('result-description').textContent = description;

  const strengthsDiv = document.getElementById('result-strengths');
  if (strengths.length === 0) {
    strengthsDiv.innerHTML = '<div class="text-gray-500 text-sm">נמצא יחד תוך כדי הלימוד</div>';
  } else {
    strengthsDiv.innerHTML = strengths.map(s => `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-create-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>${s}</span>
      </div>
    `).join('');
  }

  const weaknessesDiv = document.getElementById('result-weaknesses');
  if (weaknesses.length === 0) {
    weaknessesDiv.innerHTML = '<div class="text-gray-500 text-sm">נמשיך לבדוק תוך כדי</div>';
  } else {
    weaknessesDiv.innerHTML = weaknesses.map(w => `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-dream-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>${w}</span>
      </div>
    `).join('');
  }
}

// ===== Component Labels =====

const COMPONENT_LABELS = {
  vocab_basic: 'אוצר מילים בסיסי',
  vocab_chunks: 'Lexical Chunks',
  vocab_advanced: 'אוצר מילים מתקדם',
  grammar_present: 'דקדוק — זמן הווה',
  grammar_past: 'דקדוק — זמן עבר',
  grammar_modals: 'Modal Verbs',
  reading_literal: 'הבנת הנקרא — מפורש',
  reading_inference: 'הבנת הנקרא — משתמע',
  writing_basic: 'כתיבה בסיסית',
  writing_intermediate: 'כתיבה מתקדמת',
  cohesive_devices: 'מילות קישור',
};
