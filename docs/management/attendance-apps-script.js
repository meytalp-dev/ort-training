/**
 * מערכת נוכחות — אורט בית הערבה
 * Apps Script Backend
 *
 * תפקידו: קבלת דיווחי נוכחות, שמירה ב-Google Sheet,
 * תזכורת ב-10:30 לבנות השירות שלא מילאו,
 * והתראה ב-13:30 להנהלה אם כיתה לא מילאה.
 *
 * ═══════════════════════════════════════════════════════════════
 *  הוראות התקנה (פעם אחת):
 * ═══════════════════════════════════════════════════════════════
 *
 * 1) יצירת Google Sheet חדש:
 *    - היכנסי ל-sheets.google.com
 *    - צרי גיליון חדש
 *    - שנה שם ל: "ort-attendance"
 *
 * 2) הדבקת הקוד:
 *    - בגיליון → Extensions → Apps Script
 *    - מחקי את כל הקוד הקיים
 *    - הדביקי את הקוד הזה (את כל הקובץ)
 *    - שמרי (Ctrl+S)
 *
 * 3) הרצה ראשונית:
 *    - בראש המסך יש כפתור Run
 *    - בחרי בתפריט "setup" ולחצי Run
 *    - תתבקשי לאשר הרשאות — אשרי (Authorize access → Advanced → Go to project → Allow)
 *    - זה ייצור את 3 הטאבים בגיליון: attendance, config, log
 *
 * 4) מילוי config:
 *    - חזרי לגיליון → לטאב "config"
 *    - מלאי את שדות ההתראה (טלפונים של יסכה/אופירה/מיטל)
 *    - מלאי עבור כל כיתה את שם בת השירות
 *    - שומר אוטומטית
 *
 * 5) פריסה כ-Web App:
 *    - חזרי ל-Apps Script
 *    - Deploy → New deployment → Type: Web app
 *    - Execute as: Me (your email)
 *    - Who has access: Anyone
 *    - Deploy → תועתק URL
 *    - את ה-URL הזה את תדביקי בהגדרות של attendance.html ו-bnot-attendance-form.html
 *
 * 6) הגדרת Green API Token:
 *    - Apps Script → Project Settings (icon גלגל שיניים בצד) → Script Properties
 *    - Add script property:
 *        GREEN_API_ID_INSTANCE = <ה-Instance ID שלך מ-Green API>
 *        GREEN_API_TOKEN_INSTANCE = <ה-Token שלך מ-Green API>
 *    - Save
 *
 * 7) הפעלת טריגרים:
 *    - חזרי לעורך הקוד
 *    - הריצי פעם אחת את "setupBnotReminderTrigger" — תזכורת 10:30 לבנות שירות
 *    - הריצי פעם אחת את "setupReminderTrigger" — התראה 13:30 להנהלה
 *    - מעכשיו שני הטריגרים רצים אוטומטית כל יום עבודה
 *
 * ═══════════════════════════════════════════════════════════════
 */

// ============================================================
// CONFIG
// ============================================================
const SHEET_ATTENDANCE = 'attendance';
const SHEET_CONFIG = 'config';
const SHEET_LOG = 'log';

const ATTENDANCE_HEADERS = [
  'timestamp','date','student_id','student_name','class','status','reason','reporter','source'
];

const CLASSES = ['ט1','ט2','י1','י2','י3','יא1','יא2','יא3','יב1','יב2','יב3'];

// Default config rows created on first setup
const DEFAULT_CONFIG = [
  ['key','value','description'],
  ['reminder_recipient_names','יסכה,אופירה,מיטל','שמות המקבלים את ההתראה'],
  ['reminder_recipient_phones','','טלפונים מופרדים בפסיקים — 0527111111,0528222222,0529333333'],
  ['reminder_time','13:30','שעת הרצת ההתראה (לא משמש בקוד — קובע דרך טריגר)'],
  ['green_api_enabled','no','yes/no — האם לשלוח בפועל דרך Green API'],
  ['','',''],
  ['class_ט1','טליה חתנייב','שם בת השירות של ט1'],
  ['class_ט1_phone','0556878115','טלפון בת השירות של ט1'],
  ['class_ט2','שירה סרוסי','שם בת השירות של ט2'],
  ['class_ט2_phone','0585232328','טלפון בת השירות של ט2'],
  ['class_י1','אפרת לוי','שם בת השירות של י1'],
  ['class_י1_phone','0584115122','טלפון בת השירות של י1'],
  ['class_י2','דניאל בר ששת','שם בת השירות של י2'],
  ['class_י2_phone','0555580966','טלפון בת השירות של י2'],
  ['class_י3','מוריה עוז','שם בת השירות של י3'],
  ['class_י3_phone','0506303836','טלפון בת השירות של י3'],
  ['class_יא1','אסתר שטרן','שם בת השירות של יא1'],
  ['class_יא1_phone','0586314314','טלפון בת השירות של יא1'],
  ['class_יא2','תמר בלו','שם בת השירות של יא2'],
  ['class_יא2_phone','0584223826','טלפון בת השירות של יא2'],
  ['class_יא3','שירה עזריה','שם בת השירות של יא3'],
  ['class_יא3_phone','0505222688','טלפון בת השירות של יא3'],
  ['class_יב1','שני אלבז','שם בת השירות של יב1'],
  ['class_יב1_phone','0507111410','טלפון בת השירות של יב1'],
  ['class_יב2','','שם בת השירות של יב2 — חסרה!'],
  ['class_יב2_phone','','טלפון בת השירות של יב2'],
  ['class_יב3','אלומה קשת','שם בת השירות של יב3'],
  ['class_יב3_phone','0585557890','טלפון בת השירות של יב3'],
  ['','',''],
  ['bnot_reminder_enabled','yes','yes/no — האם לשלוח תזכורת ב-10:30 לבנות השירות'],
  ['','',''],
  ['counselor_צהיי_phone','','טלפון יועצת — הריצי fillPhoneNumbers למילוי'],
  ['counselor_ליאת_phone','','טלפון יועצת — הריצי fillPhoneNumbers למילוי'],
  ['counselor_דורית_phone','','טלפון יועצת — הריצי fillPhoneNumbers למילוי'],
  ['yiskah_phone','','טלפון יסכה — הריצי fillPhoneNumbers למילוי'],
  ['meytal_phone','','טלפון מיטל — הריצי fillPhoneNumbers למילוי'],
  ['daily_summary_enabled','yes','yes/no — האם לשלוח סיכום יומי לחיסורים רצופים']
];

// ============================================================
// SETUP — run once to create sheets
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Attendance sheet
  let aSheet = ss.getSheetByName(SHEET_ATTENDANCE);
  if (!aSheet) aSheet = ss.insertSheet(SHEET_ATTENDANCE);
  if (aSheet.getLastRow() === 0) {
    aSheet.appendRow(ATTENDANCE_HEADERS);
    aSheet.getRange('1:1').setFontWeight('bold').setBackground('#F5F0E8');
    aSheet.setFrozenRows(1);
    aSheet.setColumnWidth(1, 160); // timestamp
    aSheet.setColumnWidth(2, 90);  // date
    aSheet.setColumnWidth(4, 140); // student_name
    aSheet.setColumnWidth(7, 220); // reason
  }

  // Config sheet
  let cSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!cSheet) {
    cSheet = ss.insertSheet(SHEET_CONFIG);
    cSheet.getRange(1, 1, DEFAULT_CONFIG.length, DEFAULT_CONFIG[0].length).setValues(DEFAULT_CONFIG);
    cSheet.getRange('1:1').setFontWeight('bold').setBackground('#F5F0E8');
    cSheet.setFrozenRows(1);
    cSheet.setColumnWidth(1, 220);
    cSheet.setColumnWidth(2, 280);
    cSheet.setColumnWidth(3, 320);
  }

  // Log sheet
  let lSheet = ss.getSheetByName(SHEET_LOG);
  if (!lSheet) {
    lSheet = ss.insertSheet(SHEET_LOG);
    lSheet.appendRow(['timestamp','type','message','details']);
    lSheet.getRange('1:1').setFontWeight('bold').setBackground('#F5F0E8');
    lSheet.setFrozenRows(1);
  }

  return 'setup complete — 3 sheets created';
}

// ============================================================
// doGET — fetch attendance records
// ============================================================
function doGet(e) {
  try {
    // setup() removed — run manually once. Sheets already exist.
    const params = (e && e.parameter) || {};
    const action = params.action || 'all';

    if (action === 'ping') {
      return respond({ok: true, timestamp: new Date().toISOString()});
    }
    if (action === 'all') {
      return respond({records: fetchAll()});
    }
    if (action === 'today') {
      return respond({records: fetchByDate(todayKey())});
    }
    if (action === 'config') {
      return respond({config: fetchConfig()});
    }
    if (action === 'class-reporter') {
      const cls = params.cls;
      const cfg = fetchConfig();
      return respond({class: cls, reporter: cfg['class_' + cls] || ''});
    }
    return respond({error: 'unknown action: ' + action});
  } catch (err) {
    logError('doGet', err);
    return respond({error: err.toString()});
  }
}

// ============================================================
// doPOST — save records (or delete)
// ============================================================
function doPost(e) {
  try {
    // setup() removed — run manually once. Sheets already exist.
    // Body is text/plain JSON (no CORS preflight)
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'save';

    if (action === 'save') {
      const result = saveRecords(body.records || []);
      logInfo('save', body.records.length + ' records', body.reporter || '');
      return respond(result);
    }
    if (action === 'delete-day') {
      const result = deleteDay(body.date, body.class);
      return respond(result);
    }
    if (action === 'update-config') {
      const result = updateConfig(body.updates || []);
      return respond(result);
    }
    return respond({error: 'unknown action: ' + action});
  } catch (err) {
    logError('doPost', err);
    return respond({error: err.toString()});
  }
}

// ============================================================
// STORAGE — attendance records
// ============================================================
function fetchAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const records = data.slice(1).map(function(row) {
    const rec = {};
    headers.forEach(function(h, i) { rec[h] = row[i]; });
    // Fix date — Google Sheets auto-converts to Date object, normalize to YYYY-MM-DD
    if (rec.date instanceof Date) {
      var d = rec.date;
      rec.date = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    if (rec.timestamp instanceof Date) {
      rec.timestamp = rec.timestamp.toISOString();
    }
    return rec;
  });
  // Dedupe — keep latest per (date, student_id)
  const latest = {};
  records.forEach(function(r) {
    const key = r.date + '|' + r.student_id;
    if (!latest[key] || new Date(r.timestamp) > new Date(latest[key].timestamp)) {
      latest[key] = r;
    }
  });
  return Object.values(latest);
}

function fetchByDate(date) {
  return fetchAll().filter(function(r) { return String(r.date) === String(date); });
}

function saveRecords(records) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);
  const now = new Date().toISOString();
  const rows = records.map(function(r) {
    return [
      now,
      r.date || todayKey(),
      r.student_id || '',
      r.student_name || '',
      r.class || '',
      r.status || '',
      r.reason || '',
      r.reporter || 'unknown',
      r.source || 'form'
    ];
  });
  if (rows.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    var range = sheet.getRange(startRow, 1, rows.length, rows[0].length);
    range.setNumberFormat('@'); // force text to prevent date auto-conversion
    range.setValues(rows);
  }
  return {saved: rows.length, timestamp: now};
}

function deleteDay(date, cls) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);
  const data = sheet.getDataRange().getValues();
  const toDelete = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === String(date) && String(data[i][4]) === String(cls)) {
      toDelete.push(i + 1);
    }
  }
  toDelete.forEach(function(rowNum) { sheet.deleteRow(rowNum); });
  return {deleted: toDelete.length};
}

// ============================================================
// CONFIG
// ============================================================
function fetchConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
  const data = sheet.getDataRange().getValues();
  const cfg = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0] || '').trim();
    if (!key) continue;
    cfg[key] = String(data[i][1] || '').trim();
  }
  return cfg;
}

function updateConfig(updates) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
  const data = sheet.getDataRange().getValues();
  var updated = 0;
  updates.forEach(function(u) {
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === u.key) {
        var cell = sheet.getRange(i + 1, 2);
        cell.setNumberFormat('@');
        cell.setValue(String(u.value));
        data[i][1] = u.value;
        updated++;
        return;
      }
    }
  });
  return { result: 'success', updated: updated };
}

// ============================================================
// LOG helpers
// ============================================================
function logInfo(type, msg, details) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
    sheet.appendRow([new Date().toISOString(), type, msg, details || '']);
  } catch (e) {}
}
function logError(type, err) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
    sheet.appendRow([new Date().toISOString(), 'ERROR: ' + type, err.toString(), err.stack || '']);
  } catch (e) {}
}

// ============================================================
// REMINDER — runs at 13:30 daily
// ============================================================
function setupReminderTrigger() {
  // Remove any existing trigger for this function
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendReminderCheck') ScriptApp.deleteTrigger(t);
  });
  // Create new daily trigger at 13:30
  ScriptApp.newTrigger('sendReminderCheck')
    .timeBased()
    .atHour(13)
    .nearMinute(30)
    .everyDays(1)
    .create();
  logInfo('trigger', 'reminder trigger created for 13:30 daily', '');
  return 'trigger installed';
}

// ============================================================
// BNOT SHERUT REMINDER — runs at 10:30 daily
// ============================================================
function setupBnotReminderTrigger() {
  // Remove any existing trigger for this function
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendBnotReminder') ScriptApp.deleteTrigger(t);
  });
  // Create new daily trigger at 10:30
  ScriptApp.newTrigger('sendBnotReminder')
    .timeBased()
    .atHour(10)
    .nearMinute(30)
    .everyDays(1)
    .create();
  logInfo('trigger', 'bnot sherut reminder trigger created for 10:30 daily', '');
  return 'bnot sherut trigger installed';
}

function sendBnotReminder() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sunday, 6=Saturday
  // Skip Friday (5) and Saturday (6)
  if (dow === 5 || dow === 6) {
    logInfo('bnot-reminder', 'skipped weekend', 'dow=' + dow);
    return 'weekend skipped';
  }

  const cfg = fetchConfig();
  const enabled = (cfg.bnot_reminder_enabled || '').toLowerCase() === 'yes';
  if (!enabled) {
    logInfo('bnot-reminder', 'disabled in config', '');
    return 'bnot reminder disabled';
  }

  const greenEnabled = (cfg.green_api_enabled || '').toLowerCase() === 'yes';

  const today = todayKey();
  const records = fetchByDate(today);
  const loggedClasses = {};
  records.forEach(function(r) { loggedClasses[r.class] = (loggedClasses[r.class] || 0) + 1; });

  // Send reminder only to bnot sherut whose class hasn't been filled yet
  const missingClasses = CLASSES.filter(function(c) { return !loggedClasses[c]; });

  if (missingClasses.length === 0) {
    logInfo('bnot-reminder', 'all classes already logged by 10:30', '');
    return 'all logged';
  }

  let sentCount = 0;
  const skipped = [];

  missingClasses.forEach(function(cls) {
    const name = cfg['class_' + cls] || '';
    const phone = cfg['class_' + cls + '_phone'] || '';

    if (!phone) {
      skipped.push(cls + ' (אין טלפון)');
      return;
    }

    const message =
      'בוקר טוב' + (name ? ' ' + name : '') + '! 🌞\n\n' +
      'תזכורת — בבקשה מלאי את טופס הנוכחות של כיתה ' + cls + ' להיום.\n\n' +
      'תודה רבה! 💙\n' +
      'הודעה אוטומטית — מערכת נוכחות אורט בית הערבה';

    if (greenEnabled) {
      try {
        sendGreenApiMessage(phone, message);
        sentCount++;
      } catch (err) {
        logError('sendBnotReminder', err);
      }
    } else {
      logInfo('bnot-reminder-dry', cls + ' ' + name + ' (' + phone + ')', message);
    }
  });

  const summary = 'missing=' + missingClasses.length + ' sent=' + sentCount + (skipped.length ? ' skipped=' + skipped.join(',') : '');
  logInfo('bnot-reminder', summary, '');
  return summary;
}

function sendReminderCheck() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sunday, 6=Saturday
  // Skip Friday (5) and Saturday (6)
  if (dow === 5 || dow === 6) {
    logInfo('reminder', 'skipped weekend', 'dow=' + dow);
    return 'weekend skipped';
  }

  const today = todayKey();
  const records = fetchByDate(today);
  const loggedClasses = {};
  records.forEach(function(r) { loggedClasses[r.class] = (loggedClasses[r.class] || 0) + 1; });

  const missingClasses = CLASSES.filter(function(c) { return !loggedClasses[c]; });

  if (missingClasses.length === 0) {
    logInfo('reminder', 'all classes logged', '');
    return 'all logged';
  }

  const cfg = fetchConfig();
  const recipientPhones = (cfg.reminder_recipient_phones || '').split(',').map(function(p) { return p.trim(); }).filter(Boolean);
  const missingDetails = missingClasses.map(function(c) {
    const reporter = cfg['class_' + c] || '(לא הוגדר)';
    return c + ' — ' + reporter;
  });

  const message =
    '🔔 תזכורת נוכחות — אורט בית הערבה\n\n' +
    'השעה 13:30 והכיתות הבאות טרם דיווחו נוכחות היום:\n\n' +
    missingDetails.map(function(d) { return '• ' + d; }).join('\n') +
    '\n\nבבקשה ודאו שבנות השירות ימלאו בהקדם.\n\nהודעה זו נשלחה אוטומטית מהמערכת.';

  // Send via Green API
  const enabled = (cfg.green_api_enabled || '').toLowerCase() === 'yes';
  let sentCount = 0;
  recipientPhones.forEach(function(phone) {
    if (!phone) return;
    if (enabled) {
      try {
        sendGreenApiMessage(phone, message);
        sentCount++;
      } catch (err) {
        logError('sendReminderCheck', err);
      }
    } else {
      logInfo('reminder-skipped', 'green_api_enabled=no', phone + ' | would send: ' + message);
    }
  });

  logInfo('reminder', 'missing=' + missingClasses.length + ' sent=' + sentCount, missingDetails.join(' / '));
  return 'sent to ' + sentCount + ' recipients; missing: ' + missingClasses.join(',');
}

// ============================================================
// DAILY SUMMARY — סיכום יומי חיסורים רצופים ליועצות וליסכה
// ============================================================
// מיפוי כיתות ליועצות
const COUNSELOR_BY_CLASS = {
  'ט1':'צהיי','ט2':'ליאת',
  'י1':'דורית','י2':'דורית','י3':'דורית',
  'יא1':'ליאת','יא2':'ליאת','יא3':'ליאת',
  'יב1':'צהיי','יב2':'צהיי','יב3':'צהיי'
};

function setupDailySummaryTrigger() {
  // Remove any existing trigger
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendDailySummary') ScriptApp.deleteTrigger(t);
  });
  // Run daily at 14:00 (after 13:30 reminder, so data is complete)
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .atHour(14)
    .nearMinute(0)
    .everyDays(1)
    .create();
  logInfo('trigger', 'daily summary trigger created for 14:00', '');
  return 'daily summary trigger installed';
}

function getWorkingDays(count) {
  // Return last N working days (Sun-Thu) before today, newest first
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() - 1); // start from yesterday
  while (days.length < count) {
    const dow = d.getDay();
    if (dow >= 0 && dow <= 4) { // Sun-Thu
      days.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'));
    }
    d.setDate(d.getDate() - 1);
  }
  return days; // newest first
}

function getClassReportingDays(records) {
  // Build a map: class → Set of dates where the class reported
  // A class "reported" if it has at least one record for that date
  const classDays = {};
  records.forEach(function(r) {
    const cls = r.class || r.cls;
    if (!cls) return;
    if (!classDays[cls]) classDays[cls] = {};
    classDays[cls][r.date] = true;
  });
  return classDays;
}

function getConsecutiveAbsences(records, studentId, classReportingDays) {
  // Returns {streak, startDate, lastReason} — consecutive absent days from most recent backward
  // KEY LOGIC: skip days where the student's CLASS didn't report at all
  //   (bat sherut didn't fill) — don't break or count those days.
  //   Only count days where class DID report and student was absent/sick.
  const days = getWorkingDays(10); // check up to 10 days back
  const studentRecords = {};
  let studentClass = '';
  records.forEach(function(r) {
    if (String(r.student_id) === String(studentId)) {
      studentRecords[r.date] = { status: r.status, reason: r.reason || '' };
      if (!studentClass) studentClass = r.class || r.cls || '';
    }
  });

  const classDays = classReportingDays[studentClass] || {};

  let streak = 0;
  let startDate = '';
  let lastReason = '';
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const classReported = classDays[day];

    if (!classReported) {
      continue; // class didn't report — skip
    }

    const rec = studentRecords[day];
    const status = rec ? rec.status : '';
    if (status === 'absent' || status === 'sick') {
      streak++;
      startDate = day; // keeps updating — last one will be the earliest
      if (!lastReason && rec.reason) lastReason = rec.reason;
    } else {
      break; // streak broken
    }
  }
  return { streak: streak, startDate: startDate, lastReason: lastReason };
}

function sendDailySummary() {
  const now = new Date();
  const dow = now.getDay();
  // Skip Friday and Saturday
  if (dow === 5 || dow === 6) {
    logInfo('daily-summary', 'skipped weekend', 'dow=' + dow);
    return 'weekend skipped';
  }

  const cfg = fetchConfig();
  const enabled = (cfg.daily_summary_enabled || '').toLowerCase() === 'yes';
  const greenEnabled = (cfg.green_api_enabled || '').toLowerCase() === 'yes';

  if (!enabled) {
    logInfo('daily-summary', 'disabled in config', '');
    return 'daily summary disabled';
  }

  // Fetch all records
  const allRecords = fetchAll();

  if (allRecords.length === 0) {
    logInfo('daily-summary', 'no attendance records in sheet — nothing to check', '');
    return 'no records';
  }

  // Get unique student IDs with their names and classes
  const students = {};
  allRecords.forEach(function(r) {
    if (!students[r.student_id]) {
      students[r.student_id] = { id: r.student_id, name: r.student_name, cls: r.class };
    }
  });

  // Build class reporting map — which classes reported on which days
  const classReportingDays = getClassReportingDays(allRecords);

  // Calculate streaks for all students
  const counselorAlerts = {}; // counselor name → [{name, cls, streak}]
  const criticalAlerts = [];  // [{name, cls, streak, counselor}]

  Object.values(students).forEach(function(s) {
    const result = getConsecutiveAbsences(allRecords, s.id, classReportingDays);
    const counselor = COUNSELOR_BY_CLASS[s.cls] || 'לא מוגדר';

    if (result.streak >= 3) {
      criticalAlerts.push({ name: s.name, cls: s.cls, streak: result.streak, counselor: counselor, startDate: result.startDate, reason: result.lastReason });
    }
    if (result.streak >= 2) {
      if (!counselorAlerts[counselor]) counselorAlerts[counselor] = [];
      counselorAlerts[counselor].push({ name: s.name, cls: s.cls, streak: result.streak, startDate: result.startDate, reason: result.lastReason });
    }
  });

  const today = now.toLocaleDateString('he-IL');
  let sentCount = 0;

  // --- Send to each counselor ---
  const counselors = ['צהיי', 'ליאת', 'דורית'];
  counselors.forEach(function(name) {
    const alerts = counselorAlerts[name];
    if (!alerts || alerts.length === 0) return;

    const phone = cfg['counselor_' + name + '_phone'];
    if (!phone) {
      logInfo('daily-summary', 'no phone for counselor ' + name, alerts.length + ' alerts');
      return;
    }

    // Sort by streak descending
    alerts.sort(function(a, b) { return b.streak - a.streak; });

    let msg = 'סיכום נוכחות יומי — ' + today + '\n';
    msg += 'שלום ' + name + ',\n\n';
    msg += 'התלמידים הבאים בכיתות שלך עם חיסורים רצופים:\n\n';
    alerts.forEach(function(a) {
      const icon = a.streak >= 3 ? '🚨' : '⚠️';
      var line = icon + ' ' + a.name + ' (' + a.cls + ') — ' + a.streak + ' ימים';
      if (a.startDate) line += ' (מ-' + a.startDate.substring(5).replace('-', '/') + ')';
      if (a.reason) line += ' | ' + a.reason;
      msg += line + '\n';
    });
    msg += '\nסה"כ: ' + alerts.length + ' תלמידים דורשים תשומת לב\n';
    msg += '\nבבקשה צרי קשר עם ההורים ועדכני במערכת.\n';
    msg += 'הודעה אוטומטית — מערכת נוכחות אורט בית הערבה';

    if (greenEnabled) {
      try {
        sendGreenApiMessage(phone, msg);
        sentCount++;
        logInfo('daily-summary', 'sent to counselor ' + name, alerts.length + ' students');
      } catch (err) {
        logError('daily-summary-counselor', err);
      }
    } else {
      logInfo('daily-summary-dry', 'counselor ' + name + ' (' + phone + ')', msg);
    }
  });

  // --- Send to Yiskah (critical: 3+ days) ---
  if (criticalAlerts.length > 0) {
    const yiskahPhone = cfg.yiskah_phone;
    const meytalPhone = cfg.meytal_phone;

    // Sort by streak descending
    criticalAlerts.sort(function(a, b) { return b.streak - a.streak; });

    let msg = '🚨 סיכום התראות קריטיות — ' + today + '\n\n';
    msg += 'תלמידים עם 3+ ימי חיסור רצופים:\n\n';
    criticalAlerts.forEach(function(a) {
      var line = '• ' + a.name + ' (' + a.cls + ') — ' + a.streak + ' ימים';
      if (a.startDate) line += ' (מ-' + a.startDate.substring(5).replace('-', '/') + ')';
      line += ' | יועצת: ' + a.counselor;
      if (a.reason) line += ' | ' + a.reason;
      msg += line + '\n';
    });
    msg += '\nסה"כ: ' + criticalAlerts.length + ' תלמידים דורשים טיפול מיידי\n';
    msg += '\nנדרש: יצירת קשר עם הורים + תיעוד בשיחות אישיות.\n';
    msg += 'הודעה אוטומטית — מערכת נוכחות אורט בית הערבה';

    [yiskahPhone, meytalPhone].forEach(function(phone) {
      if (!phone) return;
      if (greenEnabled) {
        try {
          sendGreenApiMessage(phone, msg);
          sentCount++;
        } catch (err) {
          logError('daily-summary-critical', err);
        }
      } else {
        logInfo('daily-summary-dry', 'critical to ' + phone, msg);
      }
    });

    logInfo('daily-summary', 'critical alerts: ' + criticalAlerts.length, criticalAlerts.map(function(a){return a.name}).join(', '));
  }

  const summary = 'counselor alerts: ' + Object.keys(counselorAlerts).map(function(k){return k+'='+counselorAlerts[k].length}).join(',') + ' | critical: ' + criticalAlerts.length + ' | sent: ' + sentCount;
  logInfo('daily-summary', summary, '');
  return summary;
}

// Run once — fills phone numbers in existing config sheet
function fillPhoneNumbers() {
  const phones = [
    {key: 'counselor_צהיי_phone', value: '0527783903', desc: 'טלפון יועצת — צהיי (ממו גטהון)'},
    {key: 'counselor_ליאת_phone', value: '0528980191', desc: 'טלפון יועצת — ליאת (בנבג׳י רוזנר)'},
    {key: 'counselor_דורית_phone', value: '0523464235', desc: 'טלפון יועצת — דורית (ויגדור מועלם)'},
    {key: 'yiskah_phone', value: '0526995309', desc: 'טלפון יסכה — רכזת נשירה וטיפול (הגר)'},
    {key: 'meytal_phone', value: '0536256653', desc: 'טלפון מיטל — מנהלת (פלג)'},
    {key: 'daily_summary_enabled', value: 'yes', desc: 'האם לשלוח סיכום יומי לחיסורים רצופים'},
    // בנות שירות
    {key: 'class_ט1', value: 'טליה חתנייב', desc: 'שם בת השירות של ט1'},
    {key: 'class_ט1_phone', value: '0556878115', desc: 'טלפון בת השירות של ט1'},
    {key: 'class_ט2', value: 'שירה סרוסי', desc: 'שם בת השירות של ט2'},
    {key: 'class_ט2_phone', value: '0585232328', desc: 'טלפון בת השירות של ט2'},
    {key: 'class_י1', value: 'אפרת לוי', desc: 'שם בת השירות של י1'},
    {key: 'class_י1_phone', value: '0584115122', desc: 'טלפון בת השירות של י1'},
    {key: 'class_י2', value: 'דניאל בר ששת', desc: 'שם בת השירות של י2'},
    {key: 'class_י2_phone', value: '0555580966', desc: 'טלפון בת השירות של י2'},
    {key: 'class_י3', value: 'מוריה עוז', desc: 'שם בת השירות של י3'},
    {key: 'class_י3_phone', value: '0506303836', desc: 'טלפון בת השירות של י3'},
    {key: 'class_יא1', value: 'אסתר שטרן', desc: 'שם בת השירות של יא1'},
    {key: 'class_יא1_phone', value: '0586314314', desc: 'טלפון בת השירות של יא1'},
    {key: 'class_יא2', value: 'תמר בלו', desc: 'שם בת השירות של יא2'},
    {key: 'class_יא2_phone', value: '0584223826', desc: 'טלפון בת השירות של יא2'},
    {key: 'class_יא3', value: 'שירה עזריה', desc: 'שם בת השירות של יא3'},
    {key: 'class_יא3_phone', value: '0505222688', desc: 'טלפון בת השירות של יא3'},
    {key: 'class_יב1', value: 'שני אלבז', desc: 'שם בת השירות של יב1'},
    {key: 'class_יב1_phone', value: '0507111410', desc: 'טלפון בת השירות של יב1'},
    {key: 'class_יב3', value: 'אלומה קשת', desc: 'שם בת השירות של יב3'},
    {key: 'class_יב3_phone', value: '0585557890', desc: 'טלפון בת השירות של יב3'}
  ];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
  const data = sheet.getDataRange().getValues();
  const existingKeys = data.map(function(row) { return String(row[0]).trim(); });

  phones.forEach(function(p) {
    const idx = existingKeys.indexOf(p.key);
    if (idx >= 0) {
      // Update existing row
      sheet.getRange(idx + 1, 2).setNumberFormat('@').setValue(p.value);
      sheet.getRange(idx + 1, 3).setValue(p.desc);
    } else {
      // Add new row
      sheet.appendRow([p.key, p.value, p.desc]);
    }
  });

  logInfo('fillPhoneNumbers', 'phone numbers filled', phones.length + ' entries');
  return 'done — ' + phones.length + ' phone numbers filled';
}

// Test — run manually to see what the summary would contain
function testDailySummaryDryRun() {
  const allRecords = fetchAll();
  const students = {};
  allRecords.forEach(function(r) {
    if (!students[r.student_id]) {
      students[r.student_id] = { id: r.student_id, name: r.student_name, cls: r.class };
    }
  });

  const classReportingDays = getClassReportingDays(allRecords);
  const results = { counselor: {}, critical: [] };
  Object.values(students).forEach(function(s) {
    const result = getConsecutiveAbsences(allRecords, s.id, classReportingDays);
    const counselor = COUNSELOR_BY_CLASS[s.cls] || '?';
    if (result.streak >= 3) results.critical.push({ name: s.name, cls: s.cls, streak: result.streak, startDate: result.startDate, reason: result.lastReason, counselor: counselor });
    if (result.streak >= 2) {
      if (!results.counselor[counselor]) results.counselor[counselor] = [];
      results.counselor[counselor].push({ name: s.name, cls: s.cls, streak: result.streak, startDate: result.startDate, reason: result.lastReason });
    }
  });

  const cfg = fetchConfig();
  const output = {
    today: todayKey(),
    totalRecords: allRecords.length,
    totalStudents: Object.keys(students).length,
    counselorPhones: {
      צהיי: cfg['counselor_צהיי_phone'] || '(not set)',
      ליאת: cfg['counselor_ליאת_phone'] || '(not set)',
      דורית: cfg['counselor_דורית_phone'] || '(not set)'
    },
    yiskahPhone: cfg.yiskah_phone || '(not set)',
    meytalPhone: cfg.meytal_phone || '(not set)',
    results: results
  };
  Logger.log(JSON.stringify(output, null, 2));
  return output;
}

// ============================================================
// GREEN API
// ============================================================
function sendGreenApiMessage(phone, message) {
  const props = PropertiesService.getScriptProperties();
  const idInstance = props.getProperty('GREEN_API_ID_INSTANCE');
  const apiToken = props.getProperty('GREEN_API_TOKEN_INSTANCE');
  if (!idInstance || !apiToken) {
    throw new Error('Green API credentials not set. Add GREEN_API_ID_INSTANCE and GREEN_API_TOKEN_INSTANCE in Script Properties.');
  }

  // Normalize phone to international format (972...)
  let chatId = phone.replace(/\D/g, '');
  if (chatId.startsWith('0')) chatId = '972' + chatId.substring(1);
  if (!chatId.startsWith('972')) chatId = '972' + chatId;
  chatId = chatId + '@c.us';

  const url = 'https://api.green-api.com/waInstance' + idInstance + '/sendMessage/' + apiToken;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({chatId: chatId, message: message}),
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Green API returned ' + code + ': ' + response.getContentText());
  }
  return JSON.parse(response.getContentText());
}

// Test function — run manually to verify Green API works
function testGreenApi() {
  const cfg = fetchConfig();
  const phones = (cfg.reminder_recipient_phones || '').split(',').map(function(p) { return p.trim(); }).filter(Boolean);
  if (phones.length === 0) return 'no phones in config';
  sendGreenApiMessage(phones[0], '✅ בדיקה — Green API עובד. ' + new Date().toLocaleString('he-IL'));
  return 'test sent to ' + phones[0];
}

// Test the reminder logic without actually sending
function testReminderDryRun() {
  const today = todayKey();
  const records = fetchByDate(today);
  const loggedClasses = {};
  records.forEach(function(r) { loggedClasses[r.class] = (loggedClasses[r.class] || 0) + 1; });
  const missing = CLASSES.filter(function(c) { return !loggedClasses[c]; });
  const cfg = fetchConfig();
  return {
    today: today,
    logged: loggedClasses,
    missing: missing,
    reporters: missing.map(function(c) { return c + ': ' + (cfg['class_' + c] || '(not set)'); }),
    recipients: cfg.reminder_recipient_phones || '(not set)',
    greenApiEnabled: cfg.green_api_enabled
  };
}

// ============================================================
// UTILS
// ============================================================
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
