/**
 * מערכת איחורי בוקר ומרכז למידה — אורט בית הערבה
 * ================================================
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "איחורי בוקר — אורט בית הערבה"
 * 2. Extensions → Apps Script, הדביקי את כל הקוד
 * 3. עדכני את SHEET_ID למטה
 * 4. הריצי setupTardinessSheets() פעם אחת
 * 5. הריצי setupTardinessTriggers() פעם אחת (מגדיר 2 טריגרים יומיים)
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL ל-APPS_SCRIPT_URL ב-check-in.html, learning-center.html, tardiness.html
 *
 * אחרי ההתקנה: מלאי את גיליון "staff-map" עם מחנכות, יועצות, רכזות שכבה וטלפונים.
 */

// ==================== הגדרות ====================
var SHEET_ID = '1tw9RPopzW5OVEjuygpUzAn9BvlItMirfJIWYGLVFdC0';

// שעת תחילת לימודים — מי שנכנס אחרי זה = איחור
var SCHOOL_START_HOUR = 8;
var SCHOOL_START_MINUTE = 0;

// שעת פתיחת מרכז הלמידה (לתזכורת בלבד — לא נאכפת)
var LEARNING_CENTER_OPEN_HOUR = 13;
var LEARNING_CENTER_OPEN_MINUTE = 30;

// כלל ההשלמה: דקות השלמה = דקות איחור, עד מקסימום שעה
var REQUIRED_MAX = 60;
var GRACE_MINUTES = 15;    // חלון חסד לפני סימון abandoned

// ציון עובר לשאלון
var PASSING_SCORE = 70;

// cache למטלות: כמה ימים שאלה נחשבת "טרייה"
var TASK_CACHE_DAYS = 7;

// Green-API (מאותו חשבון של morning-opening)
var GREEN_API_INSTANCE = '7107577196';
var GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
var GREEN_API_URL = 'https://7107.api.greenapi.com';

// טלפון מנו (שומר הכניסה) + מייטל (מנהלת) — לקבלת התראות no-show
var MANU_PHONE = '972505852852';     // מנו — עמנואל דהאן
var MEYTAL_PHONE = '972536256653';

// Gemini לשאלות (נקרא גם מה-frontend אבל אפשר גם מכאן אם צריך)
var GEMINI_API_KEY = 'AIzaSyDKNEikoSozZIDOFN2lR6S6yc9MDPy74ok';

// ==================== Web App ====================
function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';
  try {
    var result;
    switch (action) {
      case 'todayEvents':
        result = todayEvents_();
        break;
      case 'studentHistory':
        result = studentHistory_(e.parameter.studentId);
        break;
      case 'openDebts':
        result = openDebts_();
        break;
      case 'staffMap':
        result = getStaffMap_();
        break;
      default:
        result = { ok: true, message: 'tardiness API active' };
    }
    return jsonpOut_(callback, result);
  } catch (err) {
    return jsonpOut_(callback, { ok: false, error: err.toString().substring(0, 300) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';
    var result;
    switch (action) {
      case 'checkin':
        result = checkin_(data);
        break;
      case 'startLearningCenter':
        result = startLearningCenter_(data);
        break;
      case 'getTask':
        result = getTask_(data);
        break;
      case 'submitAnswer':
        result = submitAnswer_(data);
        break;
      case 'signOut':
        result = signOut_(data);
        break;
      case 'justify':
        result = justify_(data);
        break;
      case 'forceRelease':
        result = forceRelease_(data);
        break;
      case 'cancelEvent':
        result = cancelEvent_(data);
        break;
      default:
        result = { ok: false, error: 'unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString().substring(0, 300) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function jsonpOut_(callback, obj) {
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(obj) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ==================== CHECK-IN ====================
function checkin_(data) {
  if (!data.studentId) return { ok: false, error: 'missing studentId' };
  var student = data.student || {};  // {id, name, cls, megama, parentPhone, teacherPhone}
  var now = new Date();
  var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SCHOOL_START_HOUR, SCHOOL_START_MINUTE, 0);
  var lateMinutes = Math.floor((now - startOfDay) / 60000);

  if (lateMinutes <= 0) {
    return { ok: true, status: 'on_time', studentName: student.name };
  }

  // לא יוצרים אירוע כפול באותו יום
  var existing = findTodayEvent_(data.studentId);
  if (existing) {
    return { ok: true, status: 'already_registered', event: existing };
  }

  var requiredMinutes = Math.min(lateMinutes, REQUIRED_MAX);
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var id = 'T' + Date.now();

  sheet.appendRow([
    id,
    now,                     // timestamp_arrived (morning check-in time)
    data.studentId,
    student.name || '',
    student.cls || '',
    student.megama || '',
    lateMinutes,
    requiredMinutes,
    '',                      // task_subject
    '',                      // task_level
    '',                      // task_score
    '',                      // timestamp_completed
    'pending_lc',            // status — ממתין לבוא למרכז למידה
    false,                   // justified
    '',                      // justified_by
    '',                      // justification_reason
    '',                      // parent_notified_date
    0,                       // escalation_level — מתחיל 0, עולה ל-1 רק אם abandoned
    ''                       // learning_center_start
  ]);

  // התראה מיידית למחנכת
  var teacherPhone = lookupTeacherPhone_(student.cls);
  if (teacherPhone) {
    var msg = 'איחור בוקר: ' + student.name + ' (' + student.cls + ') איחר ' + lateMinutes + ' דקות. צריך להישאר במרכז למידה אחרי הלימודים ' + requiredMinutes + ' דקות.';
    sendWhatsApp_(teacherPhone, msg);
    logNotification_(id, 'initial', 'teacher', teacherPhone);
  }

  return {
    ok: true,
    status: 'late',
    eventId: id,
    lateMinutes: lateMinutes,
    requiredMinutes: requiredMinutes,
    studentName: student.name,
    lcOpens: LEARNING_CENTER_OPEN_HOUR + ':' + String(LEARNING_CENTER_OPEN_MINUTE).padStart(2, '0')
  };
}

// ==================== START LEARNING CENTER ====================
// התלמיד נכנס פיזית למרכז למידה אחר הצהריים — כאן השעון מתחיל לרוץ
function startLearningCenter_(data) {
  if (!data.eventId) return { ok: false, error: 'missing eventId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };
  var status = sheet.getRange(rowIdx, 13).getValue();
  if (status === 'completed' || status === 'justified') {
    return { ok: false, error: 'already closed' };
  }
  sheet.getRange(rowIdx, 13).setValue('in_learning_center');
  sheet.getRange(rowIdx, 19).setValue(new Date());
  return { ok: true };
}

// ==================== TASKS ====================
function getTask_(data) {
  // data: {studentId, eventId, grade, level, subject}
  if (!data.grade || !data.subject) return { ok: false, error: 'missing params' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var cache = ss.getSheetByName('tasks-cache');

  // חפש שאלה מהשבוע האחרון עם אותם פרמטרים שלא ניתנה עדיין לתלמיד הזה
  var cutoff = new Date(Date.now() - TASK_CACHE_DAYS * 24 * 60 * 60 * 1000);
  var rows = cache.getLastRow() > 1 ? cache.getRange(2, 1, cache.getLastRow() - 1, 7).getValues() : [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r[1] === data.grade && r[2] === (data.level || 'basic') && r[3] === data.subject && new Date(r[6]) > cutoff) {
      try {
        var payload = JSON.parse(r[4]);
        return { ok: true, taskId: r[0], task: payload, cached: true };
      } catch (err) { /* skip bad row */ }
    }
  }

  // קריאה ל-Gemini
  var task;
  try {
    task = generateTaskViaGemini_(data.grade, data.level || 'basic', data.subject);
  } catch (err) {
    return { ok: false, error: 'gemini failed: ' + err };
  }

  var taskId = 'Q' + Date.now();
  cache.appendRow([taskId, data.grade, data.level || 'basic', data.subject, JSON.stringify(task), '', new Date()]);
  return { ok: true, taskId: taskId, task: task, cached: false };
}

function generateTaskViaGemini_(grade, level, subject) {
  var subjectHebrew = { math: 'מתמטיקה', hebrew: 'עברית', english: 'אנגלית' }[subject] || subject;
  var prompt = 'צור שאלה אמריקאית אחת בנושא ' + subjectHebrew + ' לתלמיד כיתה ' + grade + ' ברמה ' + level + ' בבית ספר תיכון מקצועי. ' +
    'השאלה צריכה להיות קצרה, ברורה, ובשפה פשוטה. החזר רק JSON (ללא טקסט נוסף) במבנה: ' +
    '{"question": "נוסח השאלה", "options": ["אפשרות א","אפשרות ב","אפשרות ג","אפשרות ד"], "correct_index": 0, "explanation": "הסבר קצר לתשובה הנכונה"}';

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;
  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
  };
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  var text = body.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

function submitAnswer_(data) {
  // data: {eventId, subject, level, score}
  if (!data.eventId) return { ok: false, error: 'missing eventId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };
  sheet.getRange(rowIdx, 9).setValue(data.subject || '');
  sheet.getRange(rowIdx, 10).setValue(data.level || '');
  sheet.getRange(rowIdx, 11).setValue(data.score || 0);
  return { ok: true };
}

// ==================== SIGN-OUT ====================
function signOut_(data) {
  if (!data.eventId) return { ok: false, error: 'missing eventId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };

  var row = sheet.getRange(rowIdx, 1, 1, 19).getValues()[0];
  var lcStart = row[18] ? new Date(row[18]) : null;
  var requiredMinutes = Number(row[7]);
  var score = Number(row[10]) || 0;
  var now = new Date();
  if (!lcStart) {
    return { ok: false, error: 'לא התחלת את מרכז הלמידה. לחצי "התחלתי" קודם.' };
  }
  var elapsedMinutes = Math.floor((now - lcStart) / 60000);

  if (elapsedMinutes < requiredMinutes) {
    return { ok: false, error: 'טרם עבר הזמן הנדרש', remaining: requiredMinutes - elapsedMinutes };
  }
  if (score < PASSING_SCORE) {
    return { ok: false, error: 'טרם הגעת לציון עובר', required: PASSING_SCORE, current: score };
  }

  sheet.getRange(rowIdx, 12).setValue(now);      // timestamp_completed
  sheet.getRange(rowIdx, 13).setValue('completed');
  sheet.getRange(rowIdx, 18).setValue(0);        // escalation_level → 0
  return { ok: true };
}

// ==================== CANCEL EVENT ====================
// ביטול רישום שנעשה בטעות (מנו/שומר). בטווח של 5 דקות מהרישום.
function cancelEvent_(data) {
  if (!data.eventId) return { ok: false, error: 'missing eventId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };
  var arrivedAt = new Date(sheet.getRange(rowIdx, 2).getValue());
  var mins = (Date.now() - arrivedAt.getTime()) / 60000;
  if (mins > 5) {
    return { ok: false, error: 'לא ניתן לבטל — חלפו מעל 5 דקות' };
  }
  sheet.deleteRow(rowIdx);
  return { ok: true };
}

// ==================== FORCE RELEASE ====================
// שחרור מוקדם לפני שהזמן נגמר. רק מנו / מיטל / מזכירה.
function forceRelease_(data) {
  if (!data.eventId || !data.role) return { ok: false, error: 'missing fields' };
  if (data.role !== 'guard' && data.role !== 'principal' && data.role !== 'secretary') {
    return { ok: false, error: 'unauthorized role' };
  }
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };
  sheet.getRange(rowIdx, 12).setValue(new Date());       // timestamp_completed
  sheet.getRange(rowIdx, 13).setValue('completed');
  sheet.getRange(rowIdx, 18).setValue(0);                 // escalation 0
  sheet.getRange(rowIdx, 16).setValue('שחרור מוקדם ע"י ' + (data.staffName || data.role) + (data.reason ? ': ' + data.reason : ''));
  logNotification_(data.eventId, 'force_release_by_' + data.role, data.staffName || '', '');
  return { ok: true };
}

// ==================== JUSTIFY ====================
function justify_(data) {
  // data: {eventId, role, staffName, reason}
  if (!data.eventId || !data.role || !data.reason) return { ok: false, error: 'missing fields' };
  if (data.role !== 'teacher' && data.role !== 'principal' && data.role !== 'guard') {
    return { ok: false, error: 'unauthorized role' };
  }
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  var rowIdx = findEventRow_(sheet, data.eventId);
  if (rowIdx < 0) return { ok: false, error: 'event not found' };
  sheet.getRange(rowIdx, 13).setValue('justified');
  sheet.getRange(rowIdx, 14).setValue(true);
  sheet.getRange(rowIdx, 15).setValue(data.staffName || data.role);
  sheet.getRange(rowIdx, 16).setValue(data.reason);
  sheet.getRange(rowIdx, 18).setValue(0);
  logNotification_(data.eventId, 'justified_by_' + data.role, data.staffName || '', '');
  return { ok: true };
}

// ==================== QUERIES ====================
function todayEvents_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return { ok: true, events: [] };
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var events = [];
  for (var i = 0; i < data.length; i++) {
    if (!data[i][0]) continue;
    var ts = new Date(data[i][1]);
    if (ts < today) continue;
    events.push(rowToEvent_(data[i]));
  }
  return { ok: true, events: events };
}

function studentHistory_(studentId) {
  if (!studentId) return { ok: false, error: 'missing studentId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return { ok: true, events: [] };
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var events = [];
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][2]) === String(studentId)) events.push(rowToEvent_(data[i]));
  }
  return { ok: true, events: events };
}

function openDebts_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return { ok: true, debts: [] };
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var debts = [];
  for (var i = 0; i < data.length; i++) {
    var lvl = Number(data[i][17]) || 0;
    var status = data[i][12];
    if (lvl > 0 && status !== 'completed' && status !== 'justified') {
      debts.push(rowToEvent_(data[i]));
    }
  }
  return { ok: true, debts: debts };
}

function rowToEvent_(row) {
  return {
    id: row[0],
    timestampArrived: row[1],
    studentId: row[2],
    studentName: row[3],
    cls: row[4],
    megama: row[5],
    lateMinutes: row[6],
    requiredMinutes: row[7],
    taskSubject: row[8],
    taskLevel: row[9],
    taskScore: row[10],
    timestampCompleted: row[11],
    status: row[12],
    justified: row[13],
    justifiedBy: row[14],
    justificationReason: row[15],
    parentNotifiedDate: row[16],
    escalationLevel: row[17],
    learningCenterStart: row[18]
  };
}

function findTodayEvent_(studentId) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return null;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);
  for (var i = data.length - 1; i >= 0; i--) {
    if (String(data[i][2]) !== String(studentId)) continue;
    var ts = new Date(data[i][1]);
    if (ts >= today) return rowToEvent_(data[i]);
  }
  return null;
}

function findEventRow_(sheet, eventId) {
  if (sheet.getLastRow() < 2) return -1;
  var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === eventId) return i + 2;
  }
  return -1;
}

// ==================== STAFF MAP LOOKUP ====================
function getStaffMap_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('staff-map');
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, map: [] };
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  var map = data.map(function(r) {
    return { role: r[0], cls: r[1], grade: r[2], name: r[3], phone: r[4] };
  });
  return { ok: true, map: map };
}

function lookupTeacherPhone_(cls) {
  if (!cls) return null;
  var rows = getStaffMap_().map || [];
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].role === 'teacher' && rows[i].cls === cls) return rows[i].phone;
  }
  return null;
}

function lookupGradePhones_(cls) {
  // מחזיר רכזת שכבה + יועצת של השכבה (grade = first char of cls: ט/י/יא/יב)
  var grade = extractGrade_(cls);
  var rows = getStaffMap_().map || [];
  var phones = [];
  for (var i = 0; i < rows.length; i++) {
    if ((rows[i].role === 'coordinator' || rows[i].role === 'counselor') && rows[i].grade === grade) {
      phones.push({ name: rows[i].name, phone: rows[i].phone, role: rows[i].role });
    }
  }
  return phones;
}

function extractGrade_(cls) {
  if (!cls) return '';
  if (cls.indexOf('יב') === 0) return 'יב';
  if (cls.indexOf('יא') === 0) return 'יא';
  return cls.charAt(0);
}

// ==================== TRIGGERS ====================
function endOfDayCheck() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var now = new Date();

  for (var i = 0; i < data.length; i++) {
    if (!data[i][0]) continue;
    var ts = new Date(data[i][1]);
    if (ts < today) continue;
    var st = data[i][12];
    if (st === 'completed' || st === 'justified' || st === 'abandoned') continue;
    // abandoned = לא השלים עד סוף היום (כולל מי שלא התחיל בכלל במרכז למידה)

    // מסמן abandoned
    var rowIdx = i + 2;
    sheet.getRange(rowIdx, 13).setValue('abandoned');
    sheet.getRange(rowIdx, 18).setValue(1);

    // התראה למחנכת + מנו
    var studentName = data[i][3];
    var cls = data[i][4];
    var msg = 'תלמיד שלא השלים: ' + studentName + ' (' + cls + ') לא נשאר היום במרכז למידה. נדרשת התייחסות.';
    var teacherPhone = lookupTeacherPhone_(cls);
    if (teacherPhone) { sendWhatsApp_(teacherPhone, msg); logNotification_(data[i][0], 'no_show', 'teacher', teacherPhone); }
    if (MANU_PHONE && MANU_PHONE.indexOf('REPLACE') < 0) { sendWhatsApp_(MANU_PHONE, msg); logNotification_(data[i][0], 'no_show', 'manu', MANU_PHONE); }
  }
}

function morningEscalationCheck() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();

  // מביא רשימת תלמידים מ-student-data (דרך student-data sheet אם קיים, אחרת מדלג על הודעת הורים)
  var parentsMap = getParentsMap_();

  for (var i = 0; i < data.length; i++) {
    if (!data[i][0]) continue;
    var status = data[i][12];
    if (status === 'completed' || status === 'justified') continue;
    var level = Number(data[i][17]) || 0;
    if (level === 0) continue;

    var rowIdx = i + 2;
    var studentName = data[i][3];
    var cls = data[i][4];
    var studentId = data[i][2];

    if (level === 1) {
      // level 1 → 2: הודעה להורים
      var parentPhone = parentsMap[studentId];
      if (parentPhone) {
        var msg = 'הודעה מבית הספר אורט בית הערבה: ' + studentName + ' (' + cls + ') איחר לבית הספר ולא נשאר להשלים במרכז למידה. נבקש לשוחח עם הילד/ה ולוודא שיגיע בזמן. תודה.';
        sendWhatsApp_(parentPhone, msg);
        logNotification_(data[i][0], 'parent', 'parent', parentPhone);
      }
      sheet.getRange(rowIdx, 17).setValue(new Date());
      sheet.getRange(rowIdx, 18).setValue(2);
    } else if (level === 2) {
      // level 2 → 3: יועצת + רכזת שכבה
      var phones = lookupGradePhones_(cls);
      var msgEsc = 'התראת מדרג: ' + studentName + ' (' + cls + ') לא נשאר במרכז למידה 3 ימים ברצף. נדרש טיפול.';
      for (var p = 0; p < phones.length; p++) {
        sendWhatsApp_(phones[p].phone, msgEsc);
        logNotification_(data[i][0], 'escalation', phones[p].role, phones[p].phone);
      }
      sheet.getRange(rowIdx, 18).setValue(3);
    }
  }
}

// ==================== PRE-LEARNING-CENTER REMINDER (13:00) ====================
// שולח למנו ולמייטל רשימה של כל התלמידים שצריכים להגיע למרכז למידה היום
function preLearningCenterReminder() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('events');
  if (sheet.getLastRow() < 2) return;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 19).getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);

  var pending = [];
  var totalMinutes = 0;
  for (var i = 0; i < data.length; i++) {
    if (!data[i][0]) continue;
    var ts = new Date(data[i][1]);
    if (ts < today) continue;
    var status = data[i][12];
    if (status === 'completed' || status === 'justified') continue;
    pending.push({
      name: data[i][3],
      cls: data[i][4],
      lateMin: data[i][6],
      required: data[i][7]
    });
    totalMinutes += Number(data[i][7]) || 0;
  }

  var msg;
  if (pending.length === 0) {
    msg = 'צהריים טובים! היום אין תלמידים שצריכים להישאר במרכז למידה. יום שקט.';
  } else {
    msg = 'צהריים טובים! היום ב-13:30 במרכז למידה:\n\n';
    pending.forEach(function(p, idx) {
      msg += (idx + 1) + '. ' + p.name + ' — ' + p.cls + ' — ' + p.required + ' דק\n';
    });
    msg += '\nסה"כ: ' + pending.length + ' תלמידים, ' + totalMinutes + ' דקות סה"כ.';
  }

  if (MANU_PHONE && MANU_PHONE.indexOf('REPLACE') < 0) {
    sendWhatsApp_(MANU_PHONE, msg);
    logNotification_('daily_' + today.toISOString().slice(0, 10), 'pre_lc_reminder', 'manu', MANU_PHONE);
  }
  if (MEYTAL_PHONE) {
    sendWhatsApp_(MEYTAL_PHONE, msg);
    logNotification_('daily_' + today.toISOString().slice(0, 10), 'pre_lc_reminder', 'principal', MEYTAL_PHONE);
  }
}

function getParentsMap_() {
  // אופציונלי: קרא גיליון student-phones אם אוכלס. מצפה לעמודות: studentId | parentPhone
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('student-phones');
  var map = {};
  if (!sheet || sheet.getLastRow() < 2) return map;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0]) map[String(data[i][0])] = String(data[i][1]);
  }
  return map;
}

// ==================== WHATSAPP ====================
function sendWhatsApp_(phone, message) {
  if (!phone) return false;
  var url = GREEN_API_URL + '/waInstance' + GREEN_API_INSTANCE + '/sendMessage/' + GREEN_API_TOKEN;
  var payload = { chatId: phone + '@c.us', message: message };
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    return res.getResponseCode() === 200;
  } catch (err) {
    Logger.log('WhatsApp error: ' + err);
    return false;
  }
}

function logNotification_(eventId, type, recipient, phone) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('notifications-log');
  if (!sheet) return;
  sheet.appendRow([new Date(), eventId, type, recipient, phone]);
}

// ==================== SETUP ====================
function setupTardinessSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var events = getOrCreate_(ss, 'events');
  if (events.getLastRow() === 0) {
    events.appendRow([
      'id', 'timestamp_arrived', 'student_id', 'student_name', 'class', 'megama',
      'late_minutes', 'required_minutes', 'task_subject', 'task_level', 'task_score',
      'timestamp_completed', 'status', 'justified', 'justified_by', 'justification_reason',
      'parent_notified_date', 'escalation_level', 'learning_center_start'
    ]);
    events.getRange(1, 1, 1, 19).setFontWeight('bold');
    events.setFrozenRows(1);
  }

  var cache = getOrCreate_(ss, 'tasks-cache');
  if (cache.getLastRow() === 0) {
    cache.appendRow(['id', 'grade', 'level', 'subject', 'task_json', 'reserved', 'created_at']);
    cache.getRange(1, 1, 1, 7).setFontWeight('bold');
    cache.setFrozenRows(1);
  }

  var staff = getOrCreate_(ss, 'staff-map');
  if (staff.getLastRow() === 0) {
    staff.appendRow(['role', 'class', 'grade', 'name', 'phone']);
    staff.getRange(1, 1, 1, 5).setFontWeight('bold');
    staff.setFrozenRows(1);
    // שורות דוגמה — מייטל תחליף
    staff.appendRow(['teacher', 'ט1', 'ט', 'מחנכת ט1', '9725XXXXXXXX']);
    staff.appendRow(['coordinator', '', 'ט', 'רכזת שכבה ט', '9725XXXXXXXX']);
    staff.appendRow(['counselor', '', 'ט', 'דורית ויגדור', '9725XXXXXXXX']);
  }

  var phones = getOrCreate_(ss, 'student-phones');
  if (phones.getLastRow() === 0) {
    phones.appendRow(['student_id', 'parent_phone']);
    phones.getRange(1, 1, 1, 2).setFontWeight('bold');
    phones.setFrozenRows(1);
  }

  var log = getOrCreate_(ss, 'notifications-log');
  if (log.getLastRow() === 0) {
    log.appendRow(['timestamp', 'event_id', 'type', 'recipient_role', 'phone']);
    log.getRange(1, 1, 1, 5).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('כל הגיליונות נוצרו. אכלסי את staff-map ו-student-phones.');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}

function setupTardinessTriggers() {
  var handlers = ['endOfDayCheck', 'morningEscalationCheck', 'preLearningCenterReminder'];
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (handlers.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('endOfDayCheck').timeBased().everyDays(1).atHour(17).create();
  ScriptApp.newTrigger('morningEscalationCheck').timeBased().everyDays(1).atHour(7).nearMinute(45).create();
  ScriptApp.newTrigger('preLearningCenterReminder').timeBased().everyDays(1).atHour(13).create();
  Logger.log('Triggers set: preLearningCenterReminder 13:00, endOfDayCheck 17:00, morningEscalationCheck 07:45');
}

// ==================== IMPORT PARENT PHONES (one-time) ====================
// הריצי פעם אחת אחרי setupTardinessSheets כדי לטעון טלפוני הורים מ-student-data.js.
// נכון ל-13.4.2026 — 174 תלמידים עם טלפוני הורים (מתוך 176).
function importParentPhonesOnce() {
  var DATA = [
    [1, "972503226666"],
    [2, "972502615148"],
    [3, "972507808106"],
    [4, "972587850722"],
    [5, "972507475408"],
    [6, "972526642152"],
    [7, "972506443619"],
    [8, "972506675613"],
    [9, "972549018413"],
    [10, "972587911119"],
    [11, "972542352600"],
    [12, "972506222068"],
    [13, "972506456444"],
    [14, "972545539074"],
    [15, "972505788750"],
    [16, "972504405585"],
    [17, "972542524904"],
    [18, "972509419321"],
    [19, "972545637997"],
    [20, "972527658881"],
    [21, "972523450681"],
    [22, "972527043919"],
    [23, "972502070048"],
    [24, "972537379115"],
    [25, "972546161435"],
    [26, "972524802210"],
    [27, "972505222248"],
    [28, "972509198994"],
    [29, "972524718412"],
    [30, "972527755330"],
    [31, "972503400306"],
    [32, "972529207445"],
    [33, "972507789103"],
    [34, "972508565683"],
    [35, "972527521153"],
    [36, "972533314409"],
    [37, "972524248894"],
    [38, "972587335873"],
    [39, "972546926199"],
    [40, "972525305271"],
    [41, "972504708957"],
    [42, "972523219669"],
    [43, "972525811011"],
    [44, "972527388064"],
    [45, "972503219652"],
    [46, "972508539005"],
    [47, "972532283696"],
    [48, "972533879991"],
    [49, "972546612966"],
    [50, "972543857469"],
    [51, "972537400794"],
    [52, "972505402402"],
    [53, "972509754273"],
    [54, "972547534204"],
    [55, "972502252595"],
    [56, "972548025918"],
    [57, "972547912109"],
    [58, "972549791595"],
    [59, "972504048501"],
    [60, "972528886544"],
    [61, "972556663694"],
    [62, "972503310383"],
    [63, "972559708848"],
    [64, "972502294271"],
    [65, "972544535278"],
    [66, "972549483016"],
    [67, "972506453781"],
    [68, "972502851873"],
    [69, "972528506234"],
    [70, "972537772288"],
    [71, "972505797462"],
    [72, "972502700762"],
    [73, "972522058477"],
    [74, "972526171479"],
    [75, "972524477341"],
    [76, "972506822020"],
    [77, "972586011983"],
    [78, "972546106104"],
    [79, "972525624479"],
    [80, "972537215243"],
    [81, "972526369691"],
    [82, "972502889927"],
    [83, "972533440073"],
    [84, "972547638848"],
    [85, "972524014964"],
    [86, "972535554362"],
    [87, "972528654142"],
    [88, "972504900071"],
    [89, "972544578580"],
    [90, "972502408387"],
    [91, "972556656700"],
    [92, "972586272520"],
    [93, "972515729500"],
    [94, "972527332344"],
    [95, "972545272880"],
    [96, "972584260275"],
    [97, "972522878160"],
    [98, "972584396875"],
    [99, "972528431944"],
    [100, "972508907015"],
    [101, "972538222258"],
    [102, "972507257561"],
    [103, "972587719511"],
    [104, "972524047755"],
    [105, "972548017802"],
    [106, "972539532344"],
    [107, "972507722988"],
    [108, "972505950801"],
    [109, "972547448937"],
    [110, "972524827681"],
    [111, "972528638993"],
    [112, "972509199673"],
    [113, "972525858311"],
    [114, "972544871614"],
    [115, "972506207343"],
    [116, "972505849925"],
    [117, "972502299079"],
    [118, "972507991011"],
    [119, "972544672100"],
    [120, "972524311487"],
    [121, "972506212499"],
    [122, "972508647733"],
    [123, "972506443619"],
    [124, "972552253740"],
    [125, "972585352235"],
    [126, "972526992433"],
    [127, "972533031605"],
    [128, "972584441171"],
    [129, "972537435361"],
    [130, "972545599993"],
    [131, "972504555666"],
    [132, "972534329676"],
    [133, "972539307544"],
    [134, "972506223348"],
    [135, "972506729417"],
    [136, "972543116631"],
    [137, "972546000690"],
    [138, "972503318870"],
    [139, "972584992626"],
    [140, "972523790203"],
    [141, "972504249452"],
    [142, "972527306055"],
    [143, "972528111306"],
    [144, "972545656559"],
    [145, "972545432031"],
    [146, "972545432031"],
    [147, "972542605437"],
    [148, "972546130662"],
    [149, "972556669354"],
    [150, "972546965496"],
    [151, "972535248418"],
    [152, "972522639324"],
    [153, "972543147870"],
    [155, "972528883394"],
    [156, "972502400616"],
    [157, "972505797462"],
    [158, "972537789990"],
    [159, "972528689393"],
    [160, "972547534204"],
    [161, "972526580562"],
    [162, "972528600664"],
    [163, "972503034392"],
    [164, "972526071690"],
    [165, "972504770061"],
    [166, "972505777712"],
    [167, "972503739671"],
    [169, "972506246258"],
    [170, "972525522002"],
    [171, "972527250910"],
    [172, "972542081341"],
    [173, "972506001002"],
    [174, "972543228283"],
    [175, "972545337830"],
    [176, "972523406030"]
  ];
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('student-phones');
  if (!sheet) { Logger.log('student-phones sheet missing — run setupTardinessSheets first'); return; }
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  sheet.getRange(2, 1, DATA.length, 2).setValues(DATA);
  Logger.log('Imported ' + DATA.length + ' parent phones');
}

// ==================== IMPORT STAFF MAP (one-time) ====================
// הריצי פעם אחת — ממלא את staff-map עם מחנכות, יועצות, רכזי שכבה + טלפונים.
// נכון ל-13.4.2026 לפי רשימת הצוות שמייטל שלחה.
function importStaffMapOnce() {
  var DATA = [
    // מחנכים/מחנכות — role, class, grade, name, phone
    ['teacher', 'ט1', 'ט', 'משה צברי', '972547195033'],
    ['teacher', 'ט2', 'ט', 'אושר אהרוני', '972508882402'],
    ['teacher', 'י1', 'י', 'רעיה יצחקי', '972504726066'],
    ['teacher', 'י2', 'י', 'אופירה מלכה', '972534438414'],
    ['teacher', 'י3', 'י', 'פרלה שאזו', '972525115337'],
    ['teacher', 'יא1', 'יא', 'יעקב גרונספלד', '972546995254'],
    ['teacher', 'יא2', 'יא', 'נעמה קוסטן', '972524295181'],
    ['teacher', 'יא3', 'יא', 'גיא נתנאל', '972542007155'],
    ['teacher', 'יב1', 'יב', 'יוסף רבבשי', '972506563344'],
    ['teacher', 'יב2', 'יב', 'יואב רוט', '972527218003'],
    ['teacher', 'יב3', 'יב', 'עמנואל דהאן (מנו)', '972505852852'],
    // יועצות — כל יועצת מכסה כמה שכבות, שורה לכל שכבה
    ['counselor', '', 'ט', 'ליאת בנבג\'י רוזנר', '972528980191'],
    ['counselor', '', 'י', 'ליאת בנבג\'י רוזנר', '972528980191'],
    ['counselor', '', 'ט', 'דורית ויגדור מועלם', '972523464235'],
    ['counselor', '', 'י', 'דורית ויגדור מועלם', '972523464235'],
    ['counselor', '', 'יא', 'צהיי ממו גטהון', '972527783903'],
    ['counselor', '', 'יב', 'צהיי ממו גטהון', '972527783903'],
    ['counselor', '', 'יא', 'ליאת בנבג\'י רוזנר', '972528980191'],
    ['counselor', '', 'יב', 'דורית ויגדור מועלם', '972523464235'],
    // רכזי שכבה
    ['coordinator', '', 'יא', 'גיא נתנאל', '972542007155'],
    ['coordinator', '', 'יב', 'יואב רוט', '972527218003']
  ];
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('staff-map');
  if (!sheet) { Logger.log('staff-map sheet missing — run setupTardinessSheets first'); return; }
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
  sheet.getRange(2, 1, DATA.length, 5).setValues(DATA);
  Logger.log('Imported ' + DATA.length + ' staff-map rows');
}
