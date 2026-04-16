// ==================== STUDENT DATA — SECURE LOADER ====================
// Loads student data from Google Sheet via Apps Script API.
// Replaces the old static file that contained all PII publicly.
// =====================================================================

var STUDENT_DATA_API = 'https://script.google.com/macros/s/AKfycbzIr--0e7so0uhjBwEwlauA0_toLwutvW_RW-2zLSWa0vQxIwpS8bs0nQZOr8bu9kS7/exec';

const MEGAMA = {"90306":"מחשבים","90603":"עיצוב שיער","91206":"אוטוטרוניקה","91207":"חשמל רכב"};

var STUDENTS = (function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', STUDENT_DATA_API + '?action=students', false);
  try {
    xhr.send();
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      var students = data.students || data || [];
      // Cache for offline fallback
      try { localStorage.setItem('ort-students-cache', JSON.stringify(students)); } catch(e) {}
      return students;
    }
  } catch(e) {
    // Fallback to cached version
    try {
      var cached = localStorage.getItem('ort-students-cache');
      if (cached) return JSON.parse(cached);
    } catch(e2) {}
  }
  return [];
})();
