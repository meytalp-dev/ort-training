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
const SHEET_LEADS = 'leads';
const SHEET_LOG = 'log';

// Wide schema: up to 32 pain items per submission (each sector has ~32 pains total).
// Each item has 4 columns: id, freq, intensity, severity.
const MAX_ITEMS = 32;

function buildHeaders_() {
  const headers = [
    'timestamp', 'submission_id', 'sector',
    'name', 'phone', 'email', 'role', 'org_type'
  ];
  for (let i = 1; i <= MAX_ITEMS; i++) {
    headers.push(
      `pain_${i}_id`, `pain_${i}_freq`, `pain_${i}_intensity`, `pain_${i}_severity`,
      `pain_${i}_custom_text`
    );
  }
  headers.push('top_pain_id', 'top_pain_title', 'top_severity', 'total_severity', 'items_count', 'custom_count', 'user_agent');
  return headers;
}

const LEAD_HEADERS = [
  'timestamp', 'submission_id', 'sector',
  'name', 'phone', 'email', 'role', 'org_type',
  'top_pain_title', 'total_severity', 'note', 'user_agent'
];

const LOG_HEADERS = ['timestamp', 'action', 'details'];

// ============================================================
// setup — run once
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_SUBMISSIONS, buildHeaders_());
  ensureSheet_(ss, SHEET_LEADS, LEAD_HEADERS);
  ensureSheet_(ss, SHEET_LOG, LOG_HEADERS);
  log_('setup', 'Sheets initialized');
  try {
    SpreadsheetApp.getUi().alert('מוכן! 3 טאבים: submissions · leads · log.\nעכשיו Deploy → Manage deployments → עפרון → New version.');
  } catch (e) {}
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
    return;
  }
  // rewrite header row if length or ordering changed
  const lastCol = Math.max(sh.getLastColumn(), headers.length);
  const existing = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  let needsRewrite = existing.length < headers.length;
  for (let i = 0; i < headers.length && !needsRewrite; i++) {
    if (String(existing[i] || '') !== headers[i]) needsRewrite = true;
  }
  if (needsRewrite) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
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

    if (action === 'saveLead') {
      appendLead_(body.data);
      log_('lead', (body.data.submissionId || '') + ' · ' + (body.data.name || '') + ' · ' + (body.data.phone || ''));
      return json_({ ok: true });
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
    p.phone || '',
    p.email || '',
    p.role || '',
    p.orgType || ''
  ];

  let customCount = 0;
  for (let i = 0; i < MAX_ITEMS; i++) {
    const it = items[i];
    if (it) {
      row.push(it.id || '', it.freq || '', it.intensity || '', it.severity || '',
               it.isCustom ? (it.customTitle || '') : '');
      if (it.isCustom) customCount++;
    } else {
      row.push('', '', '', '', '');
    }
  }

  row.push(
    top.id || '',
    top.title || '',
    top.severity || '',
    data.totalSeverity || 0,
    items.length,
    customCount,
    (data.userAgent || '').slice(0, 250)
  );

  sh.appendRow(row);
}

function appendLead_(data) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LEADS);
  if (!sh) return;
  sh.appendRow([
    new Date(),
    data.submissionId || '',
    data.sector || '',
    data.name || '',
    data.phone || '',
    data.email || '',
    data.role || '',
    data.orgType || '',
    data.topPainTitle || '',
    data.totalSeverity || '',
    data.note || '',
    (data.userAgent || '').slice(0, 250)
  ]);
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
