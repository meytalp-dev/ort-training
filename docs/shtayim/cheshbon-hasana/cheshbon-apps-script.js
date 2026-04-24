/**
 * חשבון השנה — Apps Script Backend
 * שתיים · מיפוי כאבים למנהלים
 *
 * ═══════════════════════════════════════════════════════════════
 *  הוראות הקמה (פעם אחת):
 * ═══════════════════════════════════════════════════════════════
 *
 * 1) פתחי Google Sheet חדש · שם: "חשבון השנה — תשובות שתיים"
 * 2) Extensions → Apps Script
 * 3) מחקי את הקוד הקיים, הדביקי את כל הקובץ הזה
 * 4) Save (Ctrl+S)
 * 5) הריצי setup() — ייווצר טאב 'submissions' עם כותרות
 * 6) Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    → Deploy → העתיקי את ה-URL
 * 7) ב-quiz.js: החליפי את API_URL בכתובת שהועתקה
 *
 *  כל שינוי בקוד → Deploy → Manage deployments → עפרון → New version
 *
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_SUBMISSIONS = 'submissions';
const SHEET_LOG = 'log';

// Wide schema: up to 15 pain items per submission.
// Each item has 4 columns: id, freq, intensity, severity.
const MAX_ITEMS = 15;

function buildHeaders_() {
  const headers = [
    'timestamp', 'submission_id', 'sector',
    'name', 'role', 'org_type', 'email'
  ];
  for (let i = 1; i <= MAX_ITEMS; i++) {
    headers.push(`pain_${i}_id`, `pain_${i}_freq`, `pain_${i}_intensity`, `pain_${i}_severity`);
  }
  headers.push('top_pain_id', 'top_pain_title', 'top_severity', 'total_severity', 'items_count', 'user_agent');
  return headers;
}

const LOG_HEADERS = ['timestamp', 'action', 'details'];

// ============================================================
// setup — run once
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_SUBMISSIONS, buildHeaders_());
  ensureSheet_(ss, SHEET_LOG, LOG_HEADERS);
  log_('setup', 'Sheets initialized');
  try {
    SpreadsheetApp.getUi().alert('מוכן! טאב submissions נוצר. עכשיו Deploy → New deployment → Web app.');
  } catch (e) {}
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else {
    // keep existing data but update header row if column count changed
    const existing = sh.getRange(1, 1, 1, sh.getLastColumn() || 1).getValues()[0];
    if (existing.length !== headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }
  }
}

// ============================================================
// doPost — capture submissions
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'saveCheshbon') {
      appendSubmission_(body.data);
      log_('submit', body.data.submissionId + ' · ' + body.data.sector);
      return json_({ ok: true, submissionId: body.data.submissionId });
    }

    return json_({ ok: false, error: 'unknown action: ' + action });
  } catch (err) {
    log_('error', String(err));
    return json_({ ok: false, error: String(err) });
  }
}

// ============================================================
// doGet — light health check
// ============================================================
function doGet(e) {
  return json_({ ok: true, service: 'cheshbon-hasana', ts: new Date().toISOString() });
}

// ============================================================
// append a submission
// ============================================================
function appendSubmission_(data) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SUBMISSIONS);
  const p = data.personal || {};
  const items = (data.items || []).slice(0, MAX_ITEMS);
  const top = data.topPain || {};

  const row = [
    new Date(),
    data.submissionId || '',
    data.sector || '',
    p.name || '',
    p.role || '',
    p.orgType || '',
    p.email || ''
  ];

  for (let i = 0; i < MAX_ITEMS; i++) {
    const it = items[i];
    if (it) row.push(it.id || '', it.freq || '', it.intensity || '', it.severity || '');
    else    row.push('', '', '', '');
  }

  row.push(
    top.id || '',
    top.title || '',
    top.severity || '',
    data.totalSeverity || 0,
    items.length,
    (data.userAgent || '').slice(0, 250)
  );

  sh.appendRow(row);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function log_(action, details) {
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
    if (sh) sh.appendRow([new Date(), action, details]);
  } catch (e) {}
}
