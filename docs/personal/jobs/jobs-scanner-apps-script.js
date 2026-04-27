/**
 * סקירת משרות יומית — Apps Script Backend
 * מיטל פלג · לוח משרות אישי
 *
 * ═══════════════════════════════════════════════════════════════
 *  הוראות הקמה (פעם אחת):
 * ═══════════════════════════════════════════════════════════════
 *
 * 1) פתחי Google Sheet חדש · שם: "סקירת משרות — מיטל"
 * 2) Extensions → Apps Script
 * 3) מחקי את הקוד הקיים, הדביקי את כל הקובץ הזה
 * 4) Save (Ctrl+S)
 * 5) הריצי setup() — ייווצרו 3 טאבים: jobs · seen · log
 * 6) הריצי installDailyTrigger() — מתקין הרצה יומית 06:30
 * 7) Deploy → New deployment → Web app:
 *      Execute as: Me · Who has access: Anyone
 *      → Deploy → העתיקי URL → ב-jobs.html: עדכני SCAN_API_URL
 * 8) הריצי runScan() ידנית פעם ראשונה כדי לאמת שהכל עובד
 *
 *  כל שינוי בקוד → Deploy → Manage deployments → עפרון → New version
 *
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_JOBS = 'jobs';
const SHEET_SEEN = 'seen';
const SHEET_LOG = 'log';
const RECIPIENT = 'mlypeleg@gmail.com';
const PAGE_URL = 'https://meytalp-dev.github.io/ort-training/personal/jobs/';

// ============================================================
// Filters — 3 cumulative gates: job-listing? · role-match? · location?
// All matched against LINK TEXT only (not surrounding context)
// ============================================================

// Gate 1 — markers that confirm a link is a job listing.
// Either a Hebrew job-listing word, a role-title pattern, or a job URL pattern.
const JOB_LISTING_WORDS = [
  'דרוש', 'דרושה', 'דרושים', 'דרושות', 'משרה', 'משרת', 'משרות',
  'תפקיד', 'מועמדות', 'הגשת מועמדות'
];
const JOB_TITLE_PATTERNS = [
  'מנהל/ת', 'מנהל ', 'מנהלת', 'רכז/ת', 'רכז ', 'רכזת',
  'סגן/ית', 'סגן ', 'סגנית', 'ראש תחום', 'ראש צוות',
  'מנכ"ל', 'מנכ״ל', 'מנכל', 'מנכלית', 'מוביל/ה', 'מוביל ', 'מובילה',
  'רפרנט/ית', 'רפרנט ', 'רפרנטית', 'מפקח/ת', 'מפקחת'
];
const JOB_URL_PATTERNS = ['/job', '/drush', '/career', '/position', '/wanted', '/employment', '/vacanc', '/jobs/'];

// Gate 2 — role focus. Must contain a FULL phrase (not "AI" alone — too noisy).
const RELEVANT_PHRASES = [
  'חדשנות חינוכית', 'חדשנות וטכנולוגיה', 'מרכז חדשנות', 'יחידת חדשנות', 'יחידה לחדשנות',
  'טכנו-פדגוג', 'טכנו פדגוג', 'פדגוגיה דיגיטלית', 'פדגוגית דיגיטלית',
  'בינה מלאכותית', 'כשירות AI', 'AI בחינוך',
  'ניהול חינוכי', 'מינהל חינוכי', 'מנהל/ת מרכז', 'מנהלת מרכז', 'מנהל מרכז',
  'רכז/ת תוכניות', 'רכזת תוכניות', 'רכז תוכניות',
  'מנהל/ת פרויקט', 'מנהלת פרויקט', 'מנהל פרויקט',
  'ראש תחום חינוך', 'ראש תחום דיגיטל', 'ראש תחום טכנולוגיה',
  'טכנולוגיה חינוכית', 'תקשוב'
];

// Gate 3 — location. If link mentions a non-allowed city, reject. Empty location = allowed (national/unknown).
const ALLOWED_LOCATIONS = ['ירושלים', 'אזור ירושלים', 'ארצי', 'היברידי', 'מרכז', 'גוש דן'];
const REJECTED_LOCATIONS = ['תל אביב', 'תל-אביב', 'חיפה', 'באר שבע', 'באר-שבע', 'השרון', 'צפון', 'דרום', 'אילת', 'הגליל', 'הנגב'];

// Negative filters — skip even if all gates pass
const NEGATIVE = [
  'בוגר תואר ראשון בלבד', 'משרה זמנית לחודש',
  'מורה ל', 'סייע/ת', 'סייעת', 'מתנדב/ת', 'מתנדבת', 'סטודנט/ית', 'סטודנטית',
  'משרת אם', 'שכר מינימום'
];

// Navigation/footer link text patterns to strip out before any gate
const NAV_NOISE = [
  'דף הבית', 'עמוד הבית', 'אודות', 'צור קשר', 'יצירת קשר', 'קטגוריות', 'תפריט',
  'כל הזכויות', 'הרשמה', 'התחבר', 'התחברות', 'הרשם', 'תקנון', 'מדיניות',
  'הצהרת נגישות', 'נגישות', 'מפת אתר', 'הקודם', 'הבא', 'עוד', 'קרא עוד',
  'לפרטים', 'לחצו כאן', 'הצטרפו אלינו', 'הירשמו'
];

// Sources to scan. type=html for plain page parsing.
const SOURCES = [
  {
    id: 'jlm-menhai',
    name: 'עושים חינוך ירושלמי',
    url: 'https://teacher.jlm.org.il/home/wanted-in-menhai/',
    type: 'html'
  },
  {
    id: 'cet-head',
    name: 'מט"ח · ראש תחום',
    url: 'https://cet.ac.il/jobs_categories/head/',
    type: 'html'
  },
  {
    id: 'joint',
    name: 'ג׳וינט ישראל',
    url: 'https://www.thejoint.org.il/career/',
    type: 'html'
  },
  {
    id: 'edu-tech',
    name: 'משרד החינוך · חדשנות',
    url: 'https://edu-tech.education.gov.il/',
    type: 'html'
  },
  {
    id: 'achiya',
    name: 'אחיה ידע',
    url: 'https://achiyayeda.org/drushim/',
    type: 'html'
  },
  {
    id: 'jerusalem-muni',
    name: 'עיריית ירושלים',
    url: 'https://www.jerusalem.muni.il/he/residents/employment/jobs/',
    type: 'html'
  },
  {
    id: 'edjobs-mgmt',
    name: 'EdJobs · ניהול',
    url: 'https://www.edjobs.co.il/%D7%9C%D7%95%D7%97-%D7%93%D7%A8%D7%95%D7%A9%D7%99%D7%9D?filter_type=%D7%9E%D7%A0%D7%94%D7%9C%2F%D7%AA',
    type: 'html'
  },
  {
    id: 'mandel',
    name: 'מכון מנדל',
    url: 'https://www.mandel.org.il/',
    type: 'html'
  }
];

const JOBS_HEADERS = ['first_seen', 'source_id', 'source_name', 'title', 'url', 'snippet', 'matched_keywords', 'sent_in_email'];
const SEEN_HEADERS = ['url_hash', 'url', 'first_seen'];
const LOG_HEADERS = ['timestamp', 'action', 'details'];

// ============================================================
// setup — run once
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_JOBS, JOBS_HEADERS);
  ensureSheet_(ss, SHEET_SEEN, SEEN_HEADERS);
  ensureSheet_(ss, SHEET_LOG, LOG_HEADERS);
  log_('setup', 'Sheets initialized');
  try {
    SpreadsheetApp.getUi().alert('✓ מוכן! 3 טאבים נוצרו.\n\nעכשיו:\n1. installDailyTrigger() — להתקנת הטריגר היומי\n2. runScan() — להרצה ראשונה ידנית\n3. Deploy → New deployment → Web app');
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
// install daily trigger — 06:30 IL
// ============================================================
function installDailyTrigger() {
  // Remove old triggers first
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runScan') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runScan')
    .timeBased()
    .atHour(6).nearMinute(30)
    .everyDays(1)
    .inTimezone('Asia/Jerusalem')
    .create();
  log_('trigger', 'Daily trigger installed @ 06:30 IL');
  try { SpreadsheetApp.getUi().alert('✓ הטריגר הותקן! ירוץ כל בוקר ב-06:30.'); } catch (e) {}
}

// ============================================================
// runScan — main entry, runs daily
// ============================================================
function runScan() {
  const startTime = new Date();
  log_('scan-start', 'Daily scan started');
  let newJobs = [];

  for (const src of SOURCES) {
    try {
      const found = scanSource_(src);
      const fresh = found.filter(j => !alreadySeen_(j.url));
      fresh.forEach(j => {
        markSeen_(j.url);
        appendJob_(j);
      });
      newJobs = newJobs.concat(fresh);
      log_('scan', src.id + ' · found ' + found.length + ' · new ' + fresh.length);
    } catch (err) {
      log_('scan-error', src.id + ' · ' + String(err));
    }
  }

  if (newJobs.length > 0) {
    try {
      sendDigestEmail_(newJobs);
      newJobs.forEach(j => markEmailed_(j.url));
      log_('email', 'Sent ' + newJobs.length + ' new jobs to ' + RECIPIENT);
    } catch (mailErr) {
      log_('email-error', String(mailErr));
    }
  } else {
    log_('email-skip', 'No new jobs to email');
  }

  const elapsed = Math.round((new Date() - startTime) / 1000);
  log_('scan-end', 'Done in ' + elapsed + 's · ' + newJobs.length + ' new');
}

// ============================================================
// scan a single source
// ============================================================
function scanSource_(src) {
  const opts = {
    method: 'get',
    muteHttpExceptions: true,
    followRedirects: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MeytalJobsBot/1.0)'
    }
  };
  const res = UrlFetchApp.fetch(src.url, opts);
  if (res.getResponseCode() !== 200) {
    throw new Error('HTTP ' + res.getResponseCode());
  }
  const html = res.getContentText();

  // Extract candidate links + nearby text
  const candidates = extractLinks_(html, src.url);
  const matches = [];

  candidates.forEach(c => {
    const linkText = (c.text || '').trim();

    // Filter on link text only — context is too noisy
    if (matchesNegative_(linkText)) return;
    if (isNavNoise_(linkText)) return;

    // Gate 1 — must look like a job listing (text or URL)
    if (!isJobListing_(linkText, c.url)) return;

    // Gate 2 — must match a relevant role phrase
    const matched = matchKeywords_(linkText);
    if (matched.length === 0) return;

    // Gate 3 — location must not be explicitly outside Jerusalem area
    if (isRejectedLocation_(linkText) && !isAllowedLocation_(linkText)) return;

    matches.push({
      sourceId: src.id,
      sourceName: src.name,
      title: linkText.slice(0, 200),
      url: c.url,
      snippet: (c.context || '').trim().slice(0, 300),
      keywords: matched
    });
  });

  // Dedupe by URL within source
  const seen = new Set();
  return matches.filter(m => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });
}

function extractLinks_(html, baseUrl) {
  // Strip scripts/styles
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const linkRegex = /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  const out = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[2];
    const inner = (m[4] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Tightened length: short = nav, very long = paragraph
    if (inner.length < 15 || inner.length > 150) continue;

    // Resolve relative URLs
    let absUrl = href;
    if (href.startsWith('/')) {
      const base = baseUrl.match(/^https?:\/\/[^\/]+/)[0];
      absUrl = base + href;
    } else if (!href.startsWith('http')) {
      continue;
    }

    // Get context — text within ±300 chars
    const idx = m.index;
    const ctxStart = Math.max(0, idx - 200);
    const ctxEnd = Math.min(html.length, idx + m[0].length + 200);
    const context = html.slice(ctxStart, ctxEnd).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    out.push({ url: absUrl, text: inner, context: context });
  }
  return out;
}

function matchKeywords_(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const phrase of RELEVANT_PHRASES) {
    if (lower.indexOf(phrase.toLowerCase()) !== -1) matches.push(phrase);
  }
  return matches;
}

function matchesNegative_(text) {
  const lower = text.toLowerCase();
  for (const n of NEGATIVE) {
    if (lower.indexOf(n.toLowerCase()) !== -1) return true;
  }
  return false;
}

function isNavNoise_(text) {
  const trimmed = text.trim();
  for (const n of NAV_NOISE) {
    if (trimmed === n) return true;
  }
  return false;
}

// Gate 1 — must contain job-listing word, role-title pattern, or job URL pattern
function isJobListing_(text, url) {
  const lowerText = text.toLowerCase();
  const lowerUrl = (url || '').toLowerCase();

  for (const w of JOB_LISTING_WORDS) {
    if (lowerText.indexOf(w) !== -1) return true;
  }
  for (const p of JOB_TITLE_PATTERNS) {
    if (lowerText.indexOf(p.toLowerCase()) !== -1) return true;
  }
  for (const u of JOB_URL_PATTERNS) {
    if (lowerUrl.indexOf(u) !== -1) return true;
  }
  return false;
}

function isRejectedLocation_(text) {
  for (const loc of REJECTED_LOCATIONS) {
    if (text.indexOf(loc) !== -1) return true;
  }
  return false;
}

function isAllowedLocation_(text) {
  for (const loc of ALLOWED_LOCATIONS) {
    if (text.indexOf(loc) !== -1) return true;
  }
  return false;
}

// ============================================================
// seen tracking
// ============================================================
function alreadySeen_(url) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SEEN);
  const last = sh.getLastRow();
  if (last < 2) return false;
  const hash = hashUrl_(url);
  const data = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === hash) return true;
  }
  return false;
}

function markSeen_(url) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SEEN);
  sh.appendRow([hashUrl_(url), url, new Date()]);
}

function appendJob_(j) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_JOBS);
  sh.appendRow([
    new Date(),
    j.sourceId,
    j.sourceName,
    j.title,
    j.url,
    j.snippet,
    j.keywords.join(', '),
    false
  ]);
}

function markEmailed_(url) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_JOBS);
  const last = sh.getLastRow();
  if (last < 2) return;
  const data = sh.getRange(2, 5, last - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === url) {
      sh.getRange(i + 2, 8).setValue(true);
      return;
    }
  }
}

function hashUrl_(url) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, url);
  return bytes.map(b => ((b & 0xff) + 0x100).toString(16).slice(1)).join('').slice(0, 16);
}

// ============================================================
// email digest
// ============================================================
function sendDigestEmail_(jobs) {
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd/MM/yyyy');
  const dateHe = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'EEEE');

  let cards = '';
  jobs.forEach(j => {
    const kws = j.keywords.map(function (k) {
      return '<span style="display:inline-block;font-size:11px;padding:3px 9px;background:#eaf4f1;color:#2d7a6e;border-radius:999px;margin-inline-end:4px;font-weight:600;">' + escapeHtml_(k) + '</span>';
    }).join('');
    cards +=
      '<div style="background:#fff;border:1px solid #e4ddd0;border-radius:14px;padding:18px 20px;margin-bottom:12px;">' +
        '<div style="font-size:11px;font-weight:600;color:#2d7a6e;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">' + escapeHtml_(j.sourceName) + '</div>' +
        '<div style="font-size:16px;font-weight:700;color:#1e3a5f;line-height:1.4;margin-bottom:8px;">' + escapeHtml_(j.title) + '</div>' +
        '<div style="margin-bottom:10px;">' + kws + '</div>' +
        '<a href="' + j.url + '" style="display:inline-block;padding:8px 16px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">פתח משרה ←</a>' +
      '</div>';
  });

  const html =
'<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"></head>' +
'<body style="margin:0;padding:0;background:#faf7f2;font-family:Heebo,Arial,sans-serif;color:#1e3a5f;">' +
  '<div style="max-width:560px;margin:0 auto;padding:32px 20px;">' +
    '<div style="text-align:center;margin-bottom:24px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:3px;color:#2d7a6e;text-transform:uppercase;margin-bottom:6px;">סקירת משרות יומית</div>' +
      '<h1 style="margin:0;font-size:24px;font-weight:800;color:#1e3a5f;">' + jobs.length + ' משרות חדשות הבוקר</h1>' +
      '<div style="font-size:13px;color:#4a6a8a;margin-top:4px;">' + dateHe + ' · ' + dateStr + '</div>' +
    '</div>' +
    cards +
    '<div style="text-align:center;margin-top:24px;">' +
      '<a href="' + PAGE_URL + '" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#1e3a5f,#2d7a6e);color:#fff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;">לוח המשרות המלא ←</a>' +
    '</div>' +
    '<div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e4ddd0;font-size:11px;color:#9b99ac;">' +
      'סקירה אוטומטית · ' + SOURCES.length + ' מקורות · מילות מפתח: ' + KEYWORDS.slice(0, 5).join(', ') + '…' +
    '</div>' +
  '</div>' +
'</body></html>';

  MailApp.sendEmail({
    to: RECIPIENT,
    subject: '☀ ' + jobs.length + ' משרות חדשות · ' + dateStr,
    htmlBody: html,
    body: jobs.length + ' משרות חדשות. ראי את הלוח: ' + PAGE_URL,
    name: 'סקירת משרות · מיטל'
  });
}

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================================
// doGet — JSON endpoint for the page
// ============================================================
function doGet(e) {
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_JOBS);
    const last = sh.getLastRow();
    if (last < 2) return json_({ ok: true, jobs: [], updated: new Date().toISOString() });

    const data = sh.getRange(2, 1, last - 1, JOBS_HEADERS.length).getValues();
    // Sort newest first
    data.sort(function (a, b) { return new Date(b[0]) - new Date(a[0]); });

    // Limit to last 50
    const jobs = data.slice(0, 50).map(row => ({
      firstSeen: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      sourceId: row[1],
      sourceName: row[2],
      title: row[3],
      url: row[4],
      snippet: row[5],
      keywords: String(row[6] || '').split(',').map(s => s.trim()).filter(Boolean)
    }));

    return json_({ ok: true, jobs: jobs, count: jobs.length, updated: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
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

// ============================================================
// utility — clear seen URLs (re-scan everything)
// ============================================================
function resetSeen() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SEEN);
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, SEEN_HEADERS.length).clearContent();
  log_('reset', 'Cleared seen URLs');
}
