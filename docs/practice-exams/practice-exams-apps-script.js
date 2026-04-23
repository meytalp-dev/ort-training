/**
 * מערכת תרגול מבחני גמר — אורט בית הערבה
 * Apps Script Backend
 *
 * תפקיד: קבלת הגשות מבחן מתלמידים, שמירה ב-Google Sheet,
 * ניהול מחוונים, ועדכון ציונים ידניים ע"י מורה.
 *
 * ═══════════════════════════════════════════════════════════════
 *  הוראות התקנה (פעם אחת):
 * ═══════════════════════════════════════════════════════════════
 *
 * 1) יצירת Google Sheet חדש:
 *    - sheets.google.com → יצירת גיליון חדש
 *    - שם: "ort-practice-exams"
 *
 * 2) הדבקת הקוד:
 *    - Extensions → Apps Script
 *    - מחקי את הקוד הקיים, הדביקי את כל הקובץ הזה
 *    - Save (Ctrl+S)
 *
 * 3) הרצת setup:
 *    - בחרי "setup" בתפריט ולחצי Run
 *    - אשרי הרשאות (Authorize → Advanced → Allow)
 *    - ייווצרו 3 טאבים: submissions, answer_keys, log
 *
 * 4) פריסה כ-Web App:
 *    - Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy → העתיקי את ה-URL
 *
 * 5) הדבקת ה-URL:
 *    - פתחי את student.html ו-teacher.html
 *    - מצאי: const APPS_SCRIPT_URL = '';
 *    - הדביקי את ה-URL בין הגרשיים בשני הקבצים
 *
 * 6) (אופציונלי) החלפת PIN המורה:
 *    - teacher.html → const DEFAULT_PIN = '2024';
 *    - שני ל-PIN משלך
 *
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_SUBMISSIONS = 'submissions';
const SHEET_ANSWER_KEYS = 'answer_keys';
const SHEET_LOG = 'log';

const SUBMISSION_HEADERS = [
  'submission_id', 'timestamp', 'exam_id', 'exam_title', 'sector', 'subject',
  'student_name', 'student_class', 'student_id',
  'start_time', 'end_time', 'duration_sec',
  'correct', 'total_mc', 'earned_points', 'total_points_with_key',
  'pending_review', 'final_score', 'total_exam_points', 'review_status',
  'reviewed_by', 'reviewed_at', 'answers_json'
];

const ANSWER_KEY_HEADERS = ['exam_id', 'question_id', 'correct_answer', 'updated_at'];
const LOG_HEADERS = ['timestamp', 'action', 'details'];

// ============================================================
// setup — run once
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_SUBMISSIONS, SUBMISSION_HEADERS);
  ensureSheet_(ss, SHEET_ANSWER_KEYS, ANSWER_KEY_HEADERS);
  ensureSheet_(ss, SHEET_LOG, LOG_HEADERS);
  log_('setup', 'Sheets initialized');
  SpreadsheetApp.getUi().alert('מוכן! 3 טאבים נוצרו. עכשיו Deploy כ-Web App.');
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
}

// ============================================================
// doPost — receive submissions and updates
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'submit') {
      appendSubmission_(body.data);
      log_('submit', body.data.submissionId + ' · ' + body.data.student.name);
    } else if (action === 'update') {
      updateSubmission_(body.data);
      log_('update', body.data.submissionId);
    } else if (action === 'delete') {
      deleteSubmission_(body.submissionId);
      log_('delete', body.submissionId);
    } else if (action === 'save-answer-key') {
      saveAnswerKey_(body.examId, body.key);
      log_('save-answer-key', body.examId + ' · ' + Object.keys(body.key).length + ' answers');
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    log_('error', String(err));
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// doGet — fetch submissions + answer keys for teacher dashboard
// ============================================================
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'submissions';
  try {
    if (action === 'submissions') {
      return jsonOut_({ submissions: readSubmissions_() });
    } else if (action === 'answer-keys') {
      return jsonOut_({ keys: readAnswerKeys_() });
    }
    return jsonOut_({ error: 'unknown action' });
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// submissions
// ============================================================
function appendSubmission_(data) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SUBMISSIONS);
  const s = data.autoScore || {};
  sh.appendRow([
    data.submissionId,
    new Date(),
    data.examId,
    data.examTitle,
    data.sector,
    data.subject,
    data.student.name,
    data.student.class,
    data.student.id || '',
    data.startTime,
    data.endTime,
    data.durationSec,
    s.correct || 0,
    s.totalMC || 0,
    s.earnedPoints || 0,
    s.totalPointsWithKey || 0,
    s.pendingReview || 0,
    data.finalScore != null ? data.finalScore : '',
    s.totalExamPoints || 0,
    data.reviewStatus,
    '',
    '',
    JSON.stringify(data.answers)
  ]);
}

function updateSubmission_(data) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SUBMISSIONS);
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.submissionId) {
      const s = data.autoScore || {};
      sh.getRange(i + 1, 13, 1, 11).setValues([[
        s.correct || 0,
        s.totalMC || 0,
        s.earnedPoints || 0,
        s.totalPointsWithKey || 0,
        s.pendingReview || 0,
        data.finalScore != null ? data.finalScore : '',
        s.totalExamPoints || 0,
        data.reviewStatus,
        data.reviewedBy || '',
        data.reviewedAt || '',
        JSON.stringify(data.answers)
      ]]);
      return;
    }
  }
  // Not found — append
  appendSubmission_(data);
}

function deleteSubmission_(submissionId) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SUBMISSIONS);
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === submissionId) {
      sh.deleteRow(i + 1);
      return;
    }
  }
}

function readSubmissions_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SUBMISSIONS);
  const values = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[0]) continue;
    let answers = [];
    try { answers = JSON.parse(r[22] || '[]'); } catch (e) {}
    out.push({
      submissionId: r[0],
      examId: r[2],
      examTitle: r[3],
      sector: r[4],
      subject: r[5],
      student: { name: r[6], class: r[7], id: r[8] },
      startTime: r[9],
      endTime: r[10],
      durationSec: r[11],
      autoScore: {
        correct: r[12], totalMC: r[13],
        earnedPoints: r[14], totalPointsWithKey: r[15],
        pendingReview: r[16], totalExamPoints: r[18]
      },
      finalScore: r[17] === '' ? null : Number(r[17]),
      reviewStatus: r[19],
      reviewedBy: r[20],
      reviewedAt: r[21],
      answers
    });
  }
  return out;
}

// ============================================================
// answer keys
// ============================================================
function saveAnswerKey_(examId, keyObj) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ANSWER_KEYS);
  const values = sh.getDataRange().getValues();
  // Remove existing keys for this exam
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][0] === examId) {
      sh.deleteRow(i + 1);
    }
  }
  // Append new rows
  const now = new Date();
  const rows = Object.entries(keyObj).map(([qid, ans]) => [examId, qid, ans, now]);
  if (rows.length > 0) {
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
  }
}

function readAnswerKeys_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ANSWER_KEYS);
  const values = sh.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < values.length; i++) {
    const [examId, qid, ans] = values[i];
    if (!examId) continue;
    if (!out[examId]) out[examId] = {};
    out[examId][qid] = ans;
  }
  return out;
}

// ============================================================
// log
// ============================================================
function log_(action, details) {
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
    sh.appendRow([new Date(), action, details]);
  } catch (e) {}
}
