/**
 * מערכת נוכחות — אורט בית הערבה
 * Apps Script Backend
 *
 * תפקידו: קבלת דיווחי נוכחות, שמירה ב-Google Sheet,
 * ושליחת התראות אוטומטיות ב-13:30 אם כיתה לא מילאה.
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
 * 7) הפעלת טריגר 13:30:
 *    - חזרי לעורך הקוד
 *    - הריצי פעם אחת את הפונקציה "setupReminderTrigger"
 *    - מעכשיו כל יום עבודה ב-13:30 תרוץ ההתראה אוטומטית
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
  ['class_ט1','','שם בת השירות של ט1'],
  ['class_ט2','','שם בת השירות של ט2'],
  ['class_י1','','שם בת השירות של י1'],
  ['class_י2','','שם בת השירות של י2'],
  ['class_י3','','שם בת השירות של י3'],
  ['class_יא1','','שם בת השירות של יא1'],
  ['class_יא2','','שם בת השירות של יא2'],
  ['class_יא3','','שם בת השירות של יא3'],
  ['class_יב1','','שם בת השירות של יב1'],
  ['class_יב2','','שם בת השירות של יב2'],
  ['class_יב3','','שם בת השירות של יב3']
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
    setup();
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
    setup();
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
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
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
  const recipientNames = cfg.reminder_recipient_names || 'המנהלת';

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
