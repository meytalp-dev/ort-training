/**
 * AI Service — Gemini-powered insights for ORT Beit HaArava management modules
 * Single reusable utility: teacher, counselor, management contexts
 */

const AIService = (() => {
  // ── API Configuration (single place for updates) ──
  const API_KEY = 'AIzaSyDKNEikoSozZIDOFN2lR6S6yc9MDPy74ok';
  const MODEL = 'gemini-2.5-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  // ── System Prompts by Context ──
  const SYSTEM_PROMPTS = {
    teacher: `אתה יועץ פדגוגי מומחה בבית ספר תיכון מקצועי לנוער בסיכון.

כשאתה מקבל נתוני מעקב של כיתה, תן תובנות למחנכת:

1. **תלמידים שדורשים תשומת לב** — מי עם ציונים נמוכים בנוכחות/תפקוד/רצינות? מי שלא קיבל שיחה אישית או מילה טובה להורים?
2. **מגמות כיתתיות** — מה חזק ומה חלש ברמת הכיתה? ממוצעי ממד, מיומנות, נוכחות
3. **הצלחות לחגוג** — מי בולט לטובה? מה עובד? חיזוקים חיוביים
4. **3 פעולות לשבוע הקרוב** — דברים קונקרטיים שהמחנכת יכולה לעשות מחר בבוקר

סולם הציונים: 0=לא מולא, 1=מתחיל, 2=בדרך, 3=עצמאי, 4=מוביל.
כתוב בעברית, בשפה פשוטה וברורה. משפטים קצרים.`,

    counselor: `אתה יועץ חינוכי מומחה בבית ספר תיכון מקצועי לנוער בסיכון.
התמקד ב:
- זיהוי דפוסים רגשיים והתנהגותיים
- דגלים אדומים שדורשים התערבות מיידית
- הצעות טיפוליות מותאמות לגיל ולאוכלוסייה
- חיזוק חוסן נפשי ותחושת שייכות
- קשר עם 5 הממדים: שייכות, כבוד, מוטיבציה, מסוגלות, אוטונומיה
כתוב בעברית. הדגש מה דחוף ומה יכול לחכות.`,

    management: `אתה יועץ ניהולי לבית ספר תיכון מקצועי.
התמקד ב:
- מגמות מערכתיות ודפוסים חוצי-כיתות
- הקצאת משאבים ותעדוף פעולות
- זיהוי נקודות חוזק ונקודות לשיפור ברמה הארגונית
- המלצות לקבלת החלטות מבוססות נתונים
- חיבור לתוכנית העבודה השנתית ולחמשת הממדים
כתוב בעברית. הצג תובנות ברמה אסטרטגית עם צעדים מעשיים.`,

    'personal-plan': `אתה מומחה לבניית תוכניות אישיות לתלמידים בבית ספר תיכון מקצועי לנוער בסיכון.

אתה מקבל נתונים משני מקורות:
1. **נתוני יועצת** — רקע רגשי-משפחתי, חוזקות, אתגרים, יעדים, מעקב התפתחות חודשי
2. **נתוני מחנכת** — תפקוד בכיתה, נוכחות, רצינות לימודית, מיומנויות חיים, מטרות שהושגו/לא

על בסיס **שני המקורות יחד**, בנה תוכנית אישית מותאמת שכוללת:

### מבנה התוכנית:
1. **תמונת מצב** — סיכום קצר של מי התלמיד/ה (3-4 משפטים). מה עובד, מה מאתגר.
2. **חוזקות לבנות עליהן** — 2-3 חוזקות ספציפיות שזוהו (גם רגשיות וגם תפקודיות)
3. **תחומים לחיזוק** — 2-3 תחומים, מדורגים לפי דחיפות (דחוף / חשוב / לטווח ארוך)
4. **תוכנית פעולה — 4 שבועות קרובים:**
   - שבוע 1-2: פעולה מיידית (דבר אחד קונקרטי)
   - שבוע 3-4: פעולה שנייה (בניית הרגל/מיומנות)
5. **חלוקת אחריות:**
   - מה עושה המחנכת (בכיתה/בשיעור)
   - מה עושה היועצת (שיחות/טיפול)
   - מה עושה התלמיד/ה (מחויבות אישית)
6. **ממד מוביל** — באיזה ממד מהחמישה (שייכות/כבוד/מוטיבציה/מסוגלות/אוטונומיה) כדאי להתמקד עכשיו ולמה
7. **נקודת בדיקה** — מתי ואיך בודקים התקדמות

כללי כתיבה:
- עברית פשוטה וברורה
- משפטים קצרים
- פעולות קונקרטיות (לא "לחזק את..." אלא "לקיים שיחה אישית פעם בשבוע על...")
- התייחס לפרופיל השכבה: ט=תמיכה רגשית, י=הדדיות, יא=דיון עמוק, יב=מנהיגות
- אם חסרים נתונים ממקור אחד — ציין מה חסר והמלץ להשלים`
  };

  /**
   * Send a request to Gemini API
   * @param {string} context - "teacher" | "counselor" | "management"
   * @param {object} data - The data to analyze
   * @param {string} [customPrompt] - Optional override for the user prompt
   * @returns {Promise<string>} - The AI response text
   */
  async function getInsights(context, data, customPrompt) {
    const systemPrompt = SYSTEM_PROMPTS[context];
    if (!systemPrompt) {
      throw new Error(`Unknown context: "${context}". Use: teacher, counselor, management`);
    }

    const userPrompt = customPrompt || `נתח את הנתונים הבאים ותן תובנות:\n${JSON.stringify(data, null, 2)}`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${err}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'לא התקבלה תשובה מה-AI';
  }

  return { getInsights, SYSTEM_PROMPTS };
})();


// ── AI Insight Button — Reusable UI Component ──

/**
 * Inject an "AI Insights" button into any container
 * @param {string} containerId - ID of the DOM element to inject into
 * @param {string} context - "teacher" | "counselor" | "management"
 * @param {function} dataGrabber - Function that returns the data object to analyze
 * @param {object} [options] - Optional: { buttonText, customPrompt }
 */
function injectAIButton(containerId, context, dataGrabber, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`injectAIButton: container #${containerId} not found`);
    return;
  }

  const buttonText = options.buttonText || 'תובנות AI';
  const btnId = `ai-btn-${containerId}`;
  const cardId = `ai-card-${containerId}`;

  // Build button HTML
  const wrapper = document.createElement('div');
  wrapper.className = 'ai-insight-wrapper';
  wrapper.innerHTML = `
    <button class="ai-insight-btn" id="${btnId}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
      <span>${buttonText}</span>
    </button>
    <div class="ai-insight-card" id="${cardId}" style="display:none">
      <div class="ai-card-header">
        <div class="ai-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <span>${buttonText}</span>
        </div>
        <div class="ai-card-actions">
          <button class="ai-copy-btn" title="העתקה">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button class="ai-close-btn" title="סגירה">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="ai-card-body">
        <div class="ai-loading">
          <div class="ai-spinner"></div>
          <span>חושב...</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  // Event: trigger AI
  const btn = document.getElementById(btnId);
  const card = document.getElementById(cardId);

  btn.addEventListener('click', async () => {
    card.style.display = 'block';
    const body = card.querySelector('.ai-card-body');
    body.innerHTML = `<div class="ai-loading"><div class="ai-spinner"></div><span>חושב...</span></div>`;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
      const data = typeof dataGrabber === 'function' ? dataGrabber() : dataGrabber;
      const result = await AIService.getInsights(context, data, options.customPrompt);
      body.innerHTML = `<div class="ai-result">${formatAIResponse(result)}</div>`;
    } catch (err) {
      body.innerHTML = `<div class="ai-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>שגיאה: ${err.message}</span>
      </div>`;
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });

  // Event: copy
  card.querySelector('.ai-copy-btn').addEventListener('click', () => {
    const text = card.querySelector('.ai-card-body').innerText;
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = card.querySelector('.ai-copy-btn');
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
      }, 2000);
    });
  });

  // Event: close
  card.querySelector('.ai-close-btn').addEventListener('click', () => {
    card.style.display = 'none';
  });
}

// ── Cross-System Data Helpers ──

const PORTFOLIO_LS_KEY = 'ort_portfolio_counselor_data';
const MONTHLY_LS_KEY = 'ort_monthly_reports_v2';

/**
 * Save counselor data from student-portfolio to localStorage
 * Call this from student-portfolio.html on load
 */
function syncPortfolioToLocalStorage(counselorBackground, counselorMonthly, shiluvTachi) {
  try {
    localStorage.setItem(PORTFOLIO_LS_KEY, JSON.stringify({
      background: counselorBackground || {},
      monthly: counselorMonthly || {},
      tachi: shiluvTachi || [],
      lastSync: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('syncPortfolioToLocalStorage failed:', e);
  }
}

/**
 * Get counselor data (from portfolio) — works from any page
 */
function getPortfolioCounselorData(studentFullName) {
  try {
    const raw = localStorage.getItem(PORTFOLIO_LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      background: data.background?.[studentFullName] || null,
      monthly: data.monthly?.[studentFullName] || null,
      tachi: (data.tachi || []).find(t => t.name === studentFullName) || null
    };
  } catch (e) { return null; }
}

/**
 * Get monthly report data (from monthly-reports) — works from any page
 */
function getMonthlyReportData(studentName, className) {
  try {
    const raw = localStorage.getItem(MONTHLY_LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const students = data.students?.[className] || [];
    const student = students.find(s => s.name === studentName);
    const reports = data.homeroomReports?.[className] || {};
    // Collect all monthly tracking data for this student
    const tracking = {};
    for (const [month, report] of Object.entries(reports)) {
      const st = report.studentTracking || {};
      const sid = student?.id;
      if (sid && st[sid]) {
        tracking[month] = {
          ...st[sid],
          classOverall: report.classOverall,
          flags: report.flagsForManagement,
          successes: report.successes
        };
      }
    }
    return {
      studentProfile: student || null,
      monthlyTracking: tracking,
      homeVisits: data.homeVisits?.[className] || {}
    };
  } catch (e) { return null; }
}

/**
 * Build a complete cross-system data package for personal plan generation
 */
function buildPersonalPlanData(studentFullName, className) {
  const counselorData = getPortfolioCounselorData(studentFullName);
  const monthlyData = getMonthlyReportData(studentFullName, className);

  return {
    studentName: studentFullName,
    class: className,
    counselorSource: counselorData ? {
      background: counselorData.background,
      developmentTracking: counselorData.monthly,
      tachi: counselorData.tachi ? {
        strengths: counselorData.tachi.cho,
        challenges: counselorData.tachi.lec,
        learningGoals: counselorData.tachi.g1,
        emotionalGoals: counselorData.tachi.g2,
        learningSupport: counselorData.tachi.sup,
        emotionalSupport: counselorData.tachi.emo
      } : null
    } : { note: 'אין נתוני יועצת — יש לפתוח את תיק התלמיד כדי לסנכרן' },
    teacherSource: monthlyData ? {
      profile: monthlyData.studentProfile ? {
        track: monthlyData.studentProfile.track,
        attendance: monthlyData.studentProfile.attendance,
        parentContact: monthlyData.studentProfile.parentContact,
        strengths: monthlyData.studentProfile.strengths,
        overallStatus: monthlyData.studentProfile.overallStatus,
        lifeSkills: monthlyData.studentProfile.lifeSkills
      } : null,
      monthlyTracking: monthlyData.monthlyTracking,
      homeVisits: monthlyData.homeVisits
    } : { note: 'אין נתוני דוח חודשי — יש לפתוח את הדוחות החודשיים כדי לסנכרן' }
  };
}

/**
 * Format AI markdown-like response to HTML
 */
function formatAIResponse(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[34]>)/g, '$1')
    .replace(/(<\/h[34]>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1');
}
