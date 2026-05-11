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
      // Send the receipt by email if the user gave one
      const toEmail = (body.data.personal && body.data.personal.email) || '';
      if (toEmail) {
        try {
          sendReceiptEmail_(body.data);
          log_('mail', body.data.submissionId + ' → ' + toEmail);
        } catch (mailErr) {
          log_('mail-error', body.data.submissionId + ' · ' + String(mailErr));
        }
      }
      return json_({ ok: true, submissionId: body.data.submissionId, mailed: !!toEmail });
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

// ============================================================
// send the receipt as an HTML email
// ============================================================
function sendReceiptEmail_(data) {
  const p = data.personal || {};
  const to = p.email;
  if (!to) return;

  const items = (data.items || []).slice().sort(function (a, b) {
    return (b.severity || 0) - (a.severity || 0);
  });
  const top = items[0] || {};
  const totalSev = items.reduce(function (s, x) { return s + (x.severity || 0); }, 0);
  const totalHours = totalSev * 3;
  const sectorLabel = data.sector === 'education' ? 'מנהל/ת בית ספר' : 'מנהל/ת ארגון חברתי';
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd/MM/yyyy');
  const recNum = ((data.submissionId || '').split('-').pop() || '').toUpperCase();

  function titleOf(it) {
    if (it.isCustom) return it.customTitle || it.title || '(כאב מותאם)';
    return it.title || it.id || '';
  }

  let rowsHtml = '';
  items.forEach(function (it, idx) {
    const hrs = (it.severity || 0) * 3;
    const highlight = idx === 0
      ? 'background:#FFF4ED;border-right:3px solid #E8836B;'
      : (idx === 1 ? 'background:#FDF8F2;' : (idx === 2 ? 'background:#FBF9F5;' : ''));
    rowsHtml +=
      '<tr>' +
        '<td style="padding:10px 14px;font-size:14px;color:#6B6980;width:32px;' + highlight + '">' + (idx + 1) + '.</td>' +
        '<td style="padding:10px 14px;font-size:14px;color:#2D2B3A;' + highlight + '">' + escapeHtmlAs_(titleOf(it)) + '</td>' +
        '<td style="padding:10px 14px;font-size:14px;color:#2D2B3A;text-align:left;font-weight:600;' + highlight + '">' + hrs + ' <span style="font-size:11px;color:#9B99AC;font-weight:400;">שעות</span></td>' +
      '</tr>';
  });

  const html =
'<!DOCTYPE html>' +
'<html lang="he" dir="rtl"><head><meta charset="UTF-8"></head>' +
'<body style="margin:0;padding:0;background:#FAF8F5;font-family:\'Heebo\',Arial,sans-serif;color:#2D2B3A;">' +
  '<div style="max-width:560px;margin:0 auto;padding:32px 20px;">' +

    // Brand
    '<div style="text-align:center;margin-bottom:24px;">' +
      '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#7B5EA7;vertical-align:middle;"></span>' +
      '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#E8836B;margin-inline-start:-4px;vertical-align:middle;"></span>' +
      '<span style="margin-inline-start:8px;font-size:18px;font-weight:700;vertical-align:middle;">שתיים</span>' +
      '<span style="color:#9B99AC;margin:0 6px;">·</span>' +
      '<span style="font-size:12px;color:#6B6980;">חשבון השנה</span>' +
    '</div>' +

    // Hero
    '<div style="text-align:center;margin-bottom:24px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:4px;color:#E8836B;text-transform:uppercase;margin-bottom:8px;">· הכאב הראשי שלך ·</div>' +
      '<h2 style="margin:0 0 8px;font-size:18px;font-weight:400;color:#6B6980;">השנה הכאיבה לך הכי הרבה ב:</h2>' +
      '<div style="font-size:28px;font-weight:700;color:#2D2B3A;line-height:1.2;">' + escapeHtmlAs_(titleOf(top)) + '</div>' +
    '</div>' +

    // Receipt card
    '<div style="background:#FFFCF6;border:1px solid #E8E4DD;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 4px 14px rgba(0,0,0,0.04);">' +
      '<div style="text-align:center;padding-bottom:16px;border-bottom:1px dashed #E8E4DD;margin-bottom:14px;">' +
        '<div style="font-size:15px;font-weight:700;color:#2D2B3A;">חנות המנהל/ת · ' + (data.sector === 'education' ? 'סניף בית ספר' : 'סניף ארגון חברתי') + '</div>' +
        '<div style="font-size:11px;color:#E8836B;letter-spacing:2px;text-transform:uppercase;margin-top:3px;">קבלה אישית · תשפ"ו</div>' +
        '<div style="font-size:11px;color:#9B99AC;margin-top:3px;">קבלה #' + recNum + ' · ' + dateStr + '</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;">' + rowsHtml + '</table>' +
      '<div style="border-top:2px solid #2D2B3A;margin-top:14px;padding-top:14px;display:flex;justify-content:space-between;align-items:baseline;">' +
        '<div style="font-size:13px;color:#6B6980;letter-spacing:1px;">סה"כ לתשלום</div>' +
        '<div style="font-size:24px;font-weight:700;color:#2D2B3A;">' + totalHours.toLocaleString() + ' <span style="font-size:11px;font-weight:400;color:#9B99AC;">שעות שחיקה</span></div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:16px;font-size:11px;color:#9B99AC;">תודה שחלקת/ה · לא לבלוע עם קפה</div>' +
    '</div>' +

    // Back link
    '<div style="text-align:center;margin:20px 0;">' +
      '<a href="https://meytalp-dev.github.io/ort-training/shtayim/cheshbon-hasana/" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7B5EA7,#E8836B);color:#fff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;">לקבלה האינטראקטיבית ←</a>' +
    '</div>' +

    // Discreet contact footer
    '<div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #E8E4DD;font-size:11px;color:#9B99AC;line-height:1.8;">' +
      '<div style="margin-bottom:4px;">' +
        '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#7B5EA7;vertical-align:middle;"></span>' +
        '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#E8836B;margin-inline-start:-3px;vertical-align:middle;"></span>' +
        '<span style="margin-inline-start:5px;font-size:11px;font-weight:600;color:#6B6980;vertical-align:middle;">שתיים</span>' +
      '</div>' +
      '<div>רוצים לשמוע פרטים על פתרונות לכאבים?</div>' +
      '<div style="margin-top:2px;">' +
        '<a href="https://api.whatsapp.com/send?phone=972536256653" style="color:#6B6980;text-decoration:none;">053-625-6653</a>' +
        '<span style="color:#D4D0C8;margin:0 6px;">·</span>' +
        '<a href="mailto:mlypeleg@gmail.com" style="color:#6B6980;text-decoration:none;">mlypeleg@gmail.com</a>' +
      '</div>' +
      '<div style="margin-top:4px;">' +
        '<a href="https://meytalp-dev.github.io/ort-training/" style="color:#6B6980;text-decoration:none;">תיק עבודות · Learni ←</a>' +
      '</div>' +
      '<div style="margin-top:6px;">' +
        '<a href="https://www.instagram.com/learni.ai" style="color:#9B99AC;text-decoration:none;margin:0 4px;">Instagram</a>·' +
        '<a href="https://www.facebook.com/profile.php?id=61578395142579" style="color:#9B99AC;text-decoration:none;margin:0 4px;">Facebook</a>·' +
        '<a href="https://www.linkedin.com/in/meytal-peleg-839265378" style="color:#9B99AC;text-decoration:none;margin:0 4px;">LinkedIn</a>' +
      '</div>' +
      '<div style="margin-top:8px;font-size:10px;color:#B8B5C2;">מיטל פלג</div>' +
    '</div>' +

  '</div>' +
'</body></html>';

  const subject = 'הקבלה שלך · חשבון השנה · ' + sectorLabel;
  const plain =
    'הקבלה האישית שלך מחשבון השנה של שתיים.\n\n' +
    'הכאב הראשי: ' + titleOf(top) + '\n' +
    'סה"כ השנה עלתה לך: ' + totalHours + ' שעות שחיקה\n\n' +
    'לקבלה האינטראקטיבית: https://meytalp-dev.github.io/ort-training/shtayim/cheshbon-hasana/\n\n' +
    'רוצים לשמוע פרטים על פתרונות לכאבים?\nמיטל פלג · 053-625-6653 · mlypeleg@gmail.com\n' +
    'תיק עבודות · Learni: https://meytalp-dev.github.io/ort-training/';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html,
    body: plain,
    name: 'שתיים · חשבון השנה'
  });
}

function escapeHtmlAs_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
