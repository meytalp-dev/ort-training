// Practice Engine — Live AI-integrated practice for Impact SO Lashon
// Handles: validation, dynamic difficulty, encouragement, AI tutor, scoring, progress.

(function () {
  'use strict';

  // ─────────────────────────────────────────
  // ENCOURAGEMENT LIBRARY
  // Pedagogically-validated reinforcement messages.
  // Source: positive psychology + Carol Dweck's growth mindset framework.
  // ─────────────────────────────────────────
  const ENCOURAGEMENT = {
    correct: {
      first: [
        "התחלה מצוינת! עברת את השאלה הראשונה.",
        "פתיחה חזקה. ככה אוהבים לראות.",
        "בול. אתה כבר בקצב."
      ],
      streak_3: [
        "3 ברצף! יש לך אינטואיציה טובה.",
        "🎯 רצף נדיר. ממשיך?",
        "3 נכון, ואתה רק התחלת. מרשים."
      ],
      streak_5: [
        "🔥 5 ברצף! זה לא במקרה — זה כישרון אמיתי.",
        "5 נכון רצוף = רמת בגרות אמיתית. בכבוד.",
        "אתה זורם. 5 ברצף!"
      ],
      streak_8: [
        "🏆 8 ברצף — אתה בליגה אחרת. כבוד.",
        "8 נכון רצוף. זה כבר לא מקרי. תמשיך!",
        "ברצף מטורף. אם תעבור את הבגרות ככה — סוף הקורס."
      ],
      after_struggle: [
        "פאדיחה! חזרת אחרי הטעות. זה הכי חשוב.",
        "✨ זאת חזרה אמיתית. זה המקום שבו לומדים.",
        "טעית — תיקנת. זה כל הסוד.",
        "הצלחת אחרי שהתקשית. בדיוק ככה לומדים."
      ],
      hard_question: [
        "🎓 שאלה ברמת אתגר — ועברת. רושם.",
        "זאת הייתה קשה אמיתית. וענית נכון.",
        "אפילו תלמידים חזקים נכשלים בשאלה כזו. אתה לא."
      ],
      generic: [
        "מצוין!", "בדיוק.", "זהו.", "עברת.", "נכון לגמרי.",
        "זיהית את זה.", "ראית את הנקודה.", "ניתוח טוב.",
        "תפסת את העיקר.", "💎 איכותי."
      ]
    },
    incorrect: {
      first: [
        "זה בסדר — שאלה ראשונה. בוא ננסה שוב, בלי לחץ.",
        "אל דאגה. השאלה הראשונה תמיד הכי קשה.",
        "טעות = למידה. זה התפקיד של הטעות. בוא נבין יחד."
      ],
      after_correct: [
        "החמצנו אחת. זה בסדר — היית בסטטוס מצוין.",
        "טעות אחרי רצף נכון? זה אנושי. ממשיכים.",
        "סטינו רגע. בוא נתמקד ונחזור לקצב."
      ],
      streak_2: [
        "שתיים ברצף — בוא נעצור רגע ונבין את החומר.",
        "💛 שתיים ברצף. אני כאן לעזור — צריך לקחת שאלה אחת לאט.",
        "שתי טעויות. זה סימן שצריך לחזק את הנושא הזה."
      ],
      streak_3: [
        "🤝 שלוש ברצף. אני יורד רמה — נחזק את הבסיס.",
        "שלוש טעויות = הזדמנות. בוא נחדד את היסודות.",
        "ניקח רמה אחורה. אין בושה — זה אסטרטגיה חכמה."
      ],
      generic: [
        "לא הפעם. בוא ננסה.", "תיקון קטן.", "🔍 בוא נחזור לטקסט.",
        "החמצנו פרט. נסתכל שוב.", "כמעט. יש פרט שפספסנו.",
        "ננסה זווית אחרת."
      ]
    }
  };

  function pickEncouragement(category, subcategory) {
    const pool = ENCOURAGEMENT[category]?.[subcategory] || ENCOURAGEMENT[category]?.generic || [];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ─────────────────────────────────────────
  // VALIDATION LOGIC
  // ─────────────────────────────────────────
  function normalizeHebrew(text) {
    return text.replace(/[֑-ׇ]/g, '').replace(/["'״׳]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function validateOpenText(userAnswer, expectedAnswer, expectedKeywords = []) {
    const ua = normalizeHebrew(userAnswer);
    const ea = normalizeHebrew(expectedAnswer);

    if (ua.length < 3) return { correct: false, score: 0, feedback: 'תשובה קצרה מדי. נסה לכתוב משפט מלא.' };

    // Direct match (very generous)
    if (ua === ea) return { correct: true, score: 100, feedback: 'תשובה מדויקת.' };
    if (ea.includes(ua) && ua.length > 10) return { correct: true, score: 95, feedback: 'תפסת את הרעיון.' };
    if (ua.includes(ea)) return { correct: true, score: 90, feedback: 'נכון — הרעיון נמצא בתשובה שלך.' };

    // Keyword-based
    const keywords = expectedKeywords.map(normalizeHebrew);
    const matched = keywords.filter(k => ua.includes(k));
    const ratio = keywords.length ? matched.length / keywords.length : 0;

    if (ratio >= 0.7) return { correct: true, score: 80, feedback: `יפה — תפסת את העיקר (${matched.length}/${keywords.length} מילות מפתח).` };
    if (ratio >= 0.4) return { correct: 'partial', score: 50, feedback: `כמעט — חסר חלק מהרעיון (${matched.length}/${keywords.length} מילות מפתח).`, missing: keywords.filter(k => !ua.includes(k)) };

    return { correct: false, score: 0, feedback: 'התשובה לא תפסה את התזה. נסה שוב או בקש רמז.', missing: keywords };
  }

  function validateMultipleChoice(selected, correct) {
    const isCorrect = selected === correct;
    return { correct: isCorrect, score: isCorrect ? 100 : 0, feedback: isCorrect ? 'תשובה נכונה.' : 'בחירה לא נכונה — נסה שוב או בקש רמז.' };
  }

  function validateTrueFalse(selected, correct) {
    const isCorrect = selected === correct;
    return { correct: isCorrect, score: isCorrect ? 100 : 0, feedback: isCorrect ? 'תשובה נכונה.' : 'לא נכון — חזור לטקסט וחשוב שוב.' };
  }

  // ─────────────────────────────────────────
  // AI TUTOR (Socratic — local fallback + Claude)
  // ─────────────────────────────────────────
  function localSocraticHint(question, attemptNumber, hintLevels) {
    if (!hintLevels || !hintLevels.length) {
      return 'נסה לקרוא שוב את הפסקה. איפה הכותב מסכם את הרעיון שלו?';
    }
    const idx = Math.min(attemptNumber, hintLevels.length - 1);
    return hintLevels[idx];
  }

  async function callClaudeTutor(question, userAttempt, hintsUsed, apiKey) {
    if (!apiKey) {
      return localSocraticHint(question, hintsUsed, question.hint_levels);
    }
    const systemPrompt = `אתה AI Tutor סוקרטי לתלמיד תיכון בלשון 70%. אסור לך לתת תשובה ישירה.
הכלל: תמיד שואל שאלה מנחה. אם התלמיד טעה, תזהה את הטעות ושאל אותו שאלה שתחזיר אותו לחשיבה נכונה.
אל תהיה דידקטי. תהיה חברי, קצר, ממוקד.`;
    const userPrompt = `שאלה: ${question.question}\nהקשר: ${question.context}\nתשובת התלמיד: "${userAttempt}"\nהתלמיד כבר ביקש ${hintsUsed} רמזים.\nתן רמז סוקרטי קצר (משפט אחד-שניים).`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 200,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });
      const data = await response.json();
      return data.content[0].text;
    } catch (e) {
      return localSocraticHint(question, hintsUsed, question.hint_levels);
    }
  }

  // ─────────────────────────────────────────
  // AI COACH — periodic feedback after N questions
  // ─────────────────────────────────────────
  function generateCoachFeedback(history) {
    const lastFive = history.slice(-5);
    const correctCount = lastFive.filter(h => h.correct === true).length;
    const usedHints = lastFive.filter(h => h.hintsUsed > 0).length;
    const partialCount = lastFive.filter(h => h.correct === 'partial').length;

    if (correctCount === 5) {
      return {
        title: '🌟 אתה בכיוון מעולה',
        body: '5 ברצף בלי רמזים. אתה שולט בנושא. אני מעלה רמת קושי.',
        action: 'difficulty_up'
      };
    }
    if (correctCount === 0) {
      return {
        title: 'אני רואה שזה קשה',
        body: 'אף תשובה לא יצאה. זה לא אתה — זה הנושא. בוא נחזור לבסיס יחד עם רמזים מלאים.',
        action: 'difficulty_down'
      };
    }
    if (correctCount >= 3 && usedHints >= 3) {
      return {
        title: '👍 אתה מצליח, אבל עם תמיכה',
        body: 'הצלחת ב-' + correctCount + ' מתוך 5, אבל ביקשת רמזים. זה בסדר — בוא ננסה את הבאות בלי רמזים.',
        action: 'reduce_hints'
      };
    }
    if (partialCount >= 2) {
      return {
        title: '🎯 כמעט שם — חסר ניואנס',
        body: 'התשובות שלך תופסות חלק מהרעיון אבל לא את כולו. בוא נחדד את הניסוח.',
        action: 'focus_precision'
      };
    }
    return {
      title: '📊 ביצועים סבירים',
      body: 'בקצב טוב. ' + correctCount + ' מתוך 5 נכונות. ממשיכים.',
      action: 'continue'
    };
  }

  // ─────────────────────────────────────────
  // FINAL GRADER
  // ─────────────────────────────────────────
  function generateFinalGrade(history) {
    const total = history.length;
    const correct = history.filter(h => h.correct === true).length;
    const partial = history.filter(h => h.correct === 'partial').length;
    const score = Math.round(((correct + partial * 0.5) / total) * 100);

    let level, message, recommendations;
    if (score >= 90) {
      level = 'מצוין';
      message = 'שליטה ברמה גבוהה. אתה מוכן לחומר הבא.';
      recommendations = ['המשך לרמת אתגר (סגול)', 'פתור בגרות עבר במלואה', 'תרגול שאלות פתוחות מורכבות'];
    } else if (score >= 75) {
      level = 'טוב';
      message = 'הבנה טובה. יש מקומות לחזק.';
      recommendations = ['חזרה על השאלות שטעית בהן', 'תרגול נוסף ברמה הנוכחית', 'מעבר לרמה מתקדמת בשבוע הבא'];
    } else if (score >= 60) {
      level = 'בינוני',
      message = 'הבנה חלקית. כדאי לחזור על העיקרון.';
      recommendations = ['קריאה חוזרת של ההסבר במערך השיעור', 'תרגול נוסף ברמה ירוקה', 'בקש מהמורה הסבר אישי'];
    } else {
      level = 'דורש חיזוק';
      message = 'הנושא עדיין לא ברור. זה בסדר — נחזור עליו.';
      recommendations = ['לחזור על מערך השיעור מהתחלה', 'לבקש הסבר מהמורה', 'תרגול ברמה ירוקה בלבד עם רמזים'];
    }

    // Topic-specific weaknesses
    const weakAreas = [];
    if (history.filter(h => h.questionType === 'open_text' && h.correct === false).length >= 2) {
      weakAreas.push('ניסוח עצמאי של תזה — דורש חיזוק');
    }
    if (history.filter(h => h.questionType === 'multiple_choice' && h.correct === false).length >= 2) {
      weakAreas.push('הבחנה בין תזה לטיעון — דורש חיזוק');
    }

    return {
      score,
      level,
      message,
      stats: {
        total,
        correct,
        partial,
        wrong: total - correct - partial,
        accuracy: Math.round((correct / total) * 100)
      },
      recommendations,
      weakAreas
    };
  }

  // ─────────────────────────────────────────
  // CONFETTI ENGINE (CSS-based, no library)
  // ─────────────────────────────────────────
  function fireConfetti(intensity = 'normal') {
    const container = document.getElementById('confetti-container') || createConfettiContainer();
    const count = intensity === 'big' ? 80 : intensity === 'small' ? 25 : 50;
    const colors = ['#a78bfa', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#fb923c'];
    const shapes = ['◆', '★', '●', '▲', '✦', '✧'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = Math.random() * 100 + '%';
      piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      piece.style.fontSize = (16 + Math.random() * 16) + 'px';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 3500);
    }
  }

  function createConfettiContainer() {
    const container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;overflow:hidden;';
    document.body.appendChild(container);
    return container;
  }

  // ─────────────────────────────────────────
  // PROGRESS / STATE MANAGER
  // ─────────────────────────────────────────
  function createSession({ topicId, questionBank }) {
    let state = {
      topicId,
      questionBank,
      currentTrack: 'blue',
      currentIndex: 0,
      streak: { correct: 0, incorrect: 0, total: 0 },
      score: 0,
      maxScore: 0,
      history: [],
      coachShownAt: 0,
      apiKey: null,
      flatQuestions: []
    };

    function flattenQuestions() {
      const tracks = ['green', 'blue', 'purple'];
      const result = [];
      for (const track of tracks) {
        const trackData = questionBank.tracks[track];
        if (trackData?.questions) {
          for (const q of trackData.questions) {
            result.push({ ...q, track });
          }
        }
      }
      state.flatQuestions = result;
    }
    flattenQuestions();

    function pickNextQuestion() {
      const available = state.flatQuestions.filter(q =>
        q.track === state.currentTrack &&
        !state.history.some(h => h.questionId === q.id)
      );
      if (available.length) return available[0];

      // Fallback: any unseen question on current or adjacent track
      const fallback = state.flatQuestions.filter(q => !state.history.some(h => h.questionId === q.id));
      return fallback[0] || null;
    }

    function recordAnswer(question, validation, hintsUsed) {
      state.history.push({
        questionId: question.id,
        questionType: question.type,
        correct: validation.correct,
        score: validation.score,
        hintsUsed,
        track: state.currentTrack
      });
      state.score += validation.score;
      state.maxScore += 100;

      if (validation.correct === true) {
        state.streak.correct++;
        state.streak.incorrect = 0;
      } else {
        state.streak.incorrect++;
        state.streak.correct = 0;
      }
      state.streak.total++;

      // Dynamic difficulty
      if (state.streak.correct >= 2 && state.currentTrack === 'green') state.currentTrack = 'blue';
      else if (state.streak.correct >= 2 && state.currentTrack === 'blue') state.currentTrack = 'purple';
      else if (state.streak.incorrect >= 2 && state.currentTrack === 'purple') state.currentTrack = 'blue';
      else if (state.streak.incorrect >= 2 && state.currentTrack === 'blue') state.currentTrack = 'green';
    }

    function shouldShowCoach() {
      const since = state.history.length - state.coachShownAt;
      return since >= 5;
    }

    function markCoachShown() {
      state.coachShownAt = state.history.length;
    }

    function getProgressPercent() {
      const total = state.flatQuestions.length;
      return total ? Math.round((state.history.length / total) * 100) : 0;
    }

    function getCurrentScore() {
      return state.maxScore ? Math.round((state.score / state.maxScore) * 100) : 0;
    }

    return {
      get state() { return state; },
      pickNextQuestion,
      recordAnswer,
      shouldShowCoach,
      markCoachShown,
      getProgressPercent,
      getCurrentScore,
      setApiKey(key) { state.apiKey = key; }
    };
  }

  // ─────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────
  window.PracticeEngine = {
    createSession,
    validateOpenText,
    validateMultipleChoice,
    validateTrueFalse,
    callClaudeTutor,
    localSocraticHint,
    generateCoachFeedback,
    generateFinalGrade,
    pickEncouragement,
    fireConfetti
  };
})();
