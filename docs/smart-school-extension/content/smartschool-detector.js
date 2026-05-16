// ImpactOS ↔ SmartSchool — Content script
// רץ על דפי SmartSchool. מזהה את סוג העמוד (טופס ציונים? מסך מורה? וכו') ומחזיר ל-background.

(function () {
  'use strict';

  // ⚠️ TODO: לזהות מסכי SmartSchool ספציפיים
  // לדוגמה: דף ציונים בכיתה / דף תלמיד יחיד / דף תעודה
  // צריך לראות את ה-DOM האמיתי כדי לדעת.

  function detectPageType() {
    const url = location.href;
    const body = document.body.textContent || '';

    // Placeholders — אחרי שמייטל תפתח SmartSchool, נדע מה לחפש
    if (url.includes('grades') || body.includes('ציוני תלמידים')) return 'grades-entry';
    if (url.includes('student') || body.includes('כרטיס תלמיד')) return 'student-card';
    if (url.includes('attendance') || body.includes('נוכחות')) return 'attendance';
    return 'unknown';
  }

  function findGradeInputs() {
    // ⚠️ TODO: selectors אמיתיים אחרי בדיקת SmartSchool
    // אופציות אפשריות:
    const candidates = [
      ...document.querySelectorAll('input[type="number"]'),
      ...document.querySelectorAll('input.grade-input'),
      ...document.querySelectorAll('[data-grade-input]'),
      ...document.querySelectorAll('input[name*="grade"]'),
      ...document.querySelectorAll('input[name*="score"]'),
    ];
    return [...new Set(candidates)];
  }

  function findStudentRows() {
    // ⚠️ TODO: selectors אמיתיים
    const candidates = [
      ...document.querySelectorAll('[data-student-id]'),
      ...document.querySelectorAll('tr.student-row'),
      ...document.querySelectorAll('.student-grade-row'),
    ];
    return [...new Set(candidates)];
  }

  // Add a subtle indicator that the extension is active
  function addExtensionBadge() {
    if (document.getElementById('impactos-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'impactos-badge';
    badge.className = 'impactos-ext-badge';
    badge.innerHTML = '<span>ImpactOS פעיל</span>';
    badge.title = 'התוסף ImpactOS ↔ SmartSchool פעיל. פתחי את האייקון בפינה לטעון ציונים.';
    document.body.appendChild(badge);
  }

  function reportPage() {
    const type = detectPageType();
    const inputs = findGradeInputs().length;
    const students = findStudentRows().length;
    console.log('[ImpactOS] SmartSchool page detected:', { type, inputs, students });
    chrome.runtime.sendMessage({
      type: 'IMPACTOS_PAGE_DETECTED',
      pageType: type,
      gradeInputs: inputs,
      studentRows: students,
      url: location.href,
    }).catch(() => { /* extension might be inactive */ });
  }

  // Listen for fill commands from popup
  window.addEventListener('message', (e) => {
    if (e.data?.source !== 'impactos-extension') return;
    const grades = e.data.grades || [];
    console.log('[ImpactOS] Received grades to fill:', grades);
    // ⚠️ TODO: actual fill logic once selectors are known
  });

  // Init
  addExtensionBadge();
  setTimeout(reportPage, 500);
})();
