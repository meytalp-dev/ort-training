/**
 * student-data-secure.js
 *
 * קובץ זה מחליף את student-data.js הישן.
 * במקום לאחסן נתוני תלמידים בקובץ סטטי ציבורי,
 * הוא טוען אותם מ-Google Sheet מאובטח דרך Apps Script.
 *
 * שימוש: אחרי פריסת ה-Apps Script, שנה את ה-URL למטה
 * ואז שנה שם הקובץ ל-student-data.js (החלף את הישן).
 */

// ══════════════════════════════════════════════
//  IMPORTANT: Replace this URL after deploying
//  the student-data-apps-script.js to Google
// ══════════════════════════════════════════════
var STUDENT_DATA_API = '';  // <-- paste your Apps Script URL here

// ============================================================
// MEGAMA — not sensitive, kept locally for instant access
// ============================================================
const MEGAMA = {"90306":"מחשבים","90603":"עיצוב שיער","91206":"אוטוטרוניקה","91207":"חשמל רכב"};

// ============================================================
// STUDENTS — loaded from API
// ============================================================
var STUDENTS = [];

(function() {
  // Try to get URL from localStorage (can be set in deployment)
  var url = STUDENT_DATA_API || localStorage.getItem('ort-student-data-url') || '';

  if (!url) {
    console.warn('[student-data] No API URL configured. Set STUDENT_DATA_API or localStorage ort-student-data-url');
    return;
  }

  // Load synchronously to maintain compatibility with all 14+ systems
  // that expect STUDENTS to be available immediately
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=students', false);
  try {
    xhr.send();
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      STUDENTS = data.students || data || [];
      console.log('[student-data] Loaded ' + STUDENTS.length + ' students from secure API');
    } else {
      console.error('[student-data] API returned status ' + xhr.status);
    }
  } catch (e) {
    console.error('[student-data] Failed to load from API:', e);
    // Fallback: try cached version
    var cached = localStorage.getItem('ort-students-cache');
    if (cached) {
      try {
        STUDENTS = JSON.parse(cached);
        console.warn('[student-data] Using cached data (' + STUDENTS.length + ' students)');
      } catch (e2) {}
    }
  }

  // Cache for offline fallback
  if (STUDENTS.length > 0) {
    try {
      localStorage.setItem('ort-students-cache', JSON.stringify(STUDENTS));
    } catch (e) {}
  }
})();
