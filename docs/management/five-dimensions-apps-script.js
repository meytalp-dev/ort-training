/**
 * Google Apps Script — חמשת הממדים | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "חמשת הממדים תשפ"ז — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupDimensionsSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL ושימי אותו ב-APPS_SCRIPT_URL בקובץ five-dimensions.html
 */

var SHEET_ID = '1V2XphqBZw_uAX9eubPtgiGLGGaPtGCp-KAmU64HwjRI';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getPulse':
        result = getPulse_(e.parameter.dim, e.parameter.type, e.parameter.className);
        break;
      case 'getLessons':
        result = getLessons_(e.parameter.dim, e.parameter.layer, e.parameter.grade);
        break;
      case 'getAllPulse':
        result = getAllPulse_();
        break;
      case 'getForm':
        result = getForm_(e.parameter.sheet);
        break;
      default:
        result = { result: 'ok', message: 'five-dimensions API active' };
    }
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';
    var result;

    switch (action) {
      case 'savePulse':
        result = savePulse_(data.pulse);
        break;
      case 'saveLesson':
        result = saveLesson_(data.lesson);
        break;
      case 'deleteLesson':
        result = deleteLesson_(data.lessonId);
        break;
      case 'saveForm':
        result = saveForm_(data.sheet, data.fields);
        break;
      case 'getForm':
        result = getForm_(data.sheet);
        break;
      default:
        result = { result: 'error', message: 'unknown action' };
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// PULSE — read/write
// ============================================

function getAllPulse_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('פולס');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', pulses: [] };
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var roleCol = headers.indexOf('תפקיד');
  var pulses = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var answers = {};
    try { answers = JSON.parse(data[i][4]); } catch (e) {}
    pulses.push({
      id: data[i][0],
      dim: data[i][1] || '',
      type: data[i][2] || '',
      class: data[i][3] || '',
      answers: answers,
      date: data[i][5] || '',
      role: roleCol >= 0 ? (data[i][roleCol] || 'student') : 'student'
    });
  }
  return { result: 'success', pulses: pulses };
}

function getPulse_(dim, type, className) {
  var all = getAllPulse_();
  var filtered = all.pulses;
  if (dim) filtered = filtered.filter(function(p) { return p.dim === dim; });
  if (type) filtered = filtered.filter(function(p) { return p.type === type; });
  if (className) filtered = filtered.filter(function(p) { return p.class === className; });
  return { result: 'success', pulses: filtered };
}

function savePulse_(pulse) {
  if (!pulse) return { result: 'error', message: 'missing pulse data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('פולס');
  if (!sheet) return { result: 'error', message: 'missing pulse sheet' };

  var id = pulse.id || ('P' + Date.now());
  sheet.appendRow([
    id,
    pulse.dim || '',
    pulse.type || '',
    pulse.class || '',
    JSON.stringify(pulse.answers || {}),
    new Date(),
    pulse.role || 'student'
  ]);

  logAction_(ss, 'pulse', id, 'save', pulse.dim + ' / ' + pulse.type + ' / ' + pulse.class + ' / ' + (pulse.role || 'student'));
  return { result: 'success', id: id, message: 'Pulse saved' };
}

// ============================================
// LESSONS — read/write/delete
// ============================================

function getLessons_(dim, layer, grade) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('מערכי שיעור');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', lessons: [] };
  var data = sheet.getDataRange().getValues();
  var lessons = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var lesson = {
      id: data[i][0],
      title: data[i][1] || '',
      dim: data[i][2] || '',
      layer: data[i][3] || '',
      grade: data[i][4] || '',
      duration: data[i][5] || '',
      goals: data[i][6] || '',
      desc: data[i][7] || '',
      notes: data[i][8] || '',
      createdAt: data[i][9] || ''
    };
    var match = true;
    if (dim && lesson.dim !== dim) match = false;
    if (layer && lesson.layer !== layer) match = false;
    if (grade && lesson.grade !== grade && lesson.grade !== 'כולם') match = false;
    if (match) lessons.push(lesson);
  }
  return { result: 'success', lessons: lessons };
}

function saveLesson_(lesson) {
  if (!lesson) return { result: 'error', message: 'missing lesson data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מערכי שיעור');
  if (!sheet) return { result: 'error', message: 'missing lessons sheet' };

  var id = lesson.id || ('L' + Date.now());
  var now = new Date();

  // Check if exists
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { rowIndex = i + 1; break; }
  }

  var row = [
    id,
    lesson.title || '',
    lesson.dim || '',
    lesson.layer || '',
    lesson.grade || '',
    lesson.duration || '',
    lesson.goals || '',
    lesson.desc || '',
    lesson.notes || '',
    rowIndex > 0 ? data[rowIndex - 1][9] : now, // createdAt
    now // updatedAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  logAction_(ss, 'lesson', id, 'save', lesson.title);
  return { result: 'success', id: id, message: 'Lesson saved' };
}

function deleteLesson_(lessonId) {
  if (!lessonId) return { result: 'error', message: 'missing lessonId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מערכי שיעור');
  if (!sheet) return { result: 'error', message: 'missing lessons sheet' };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === lessonId) {
      sheet.deleteRow(i + 1);
      logAction_(ss, 'lesson', lessonId, 'delete', '');
      return { result: 'success', message: 'Lesson deleted' };
    }
  }
  return { result: 'error', message: 'lesson not found' };
}

// ============================================
// GENERIC FORM — saveForm / getForm
// ============================================

/**
 * שמירה גנרית — כל טופס חדש שולח שם גיליון + שדות,
 * והפונקציה יוצרת את הגיליון אוטומטית אם הוא לא קיים.
 *
 * payload: { action:'saveForm', sheet:'פולס חזרה', fields:{ name:'...', energy:4, ... } }
 */
function saveForm_(sheetName, fields) {
  if (!sheetName || !fields) return { result: 'error', message: 'missing sheet name or fields' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  // הוספת תאריך אוטומטי
  fields['תאריך'] = new Date();

  var keys = Object.keys(fields);

  // יצירת גיליון חדש עם כותרות אם לא קיים
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(keys);
    sheet.getRange(1, 1, 1, keys.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // בדיקה שכל העמודות קיימות — הוספת חדשות בסוף
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  keys.forEach(function(key) {
    if (headers.indexOf(key) === -1) {
      var newCol = headers.length + 1;
      sheet.getRange(1, newCol).setValue(key).setFontWeight('bold');
      headers.push(key);
    }
  });

  // כתיבת שורה חדשה לפי סדר הכותרות
  var row = headers.map(function(h) { return fields[h] !== undefined ? fields[h] : ''; });
  sheet.appendRow(row);

  logAction_(ss, 'form', sheetName, 'save', JSON.stringify(fields).substring(0, 200));
  return { result: 'success', message: 'saved to ' + sheetName };
}

/**
 * קריאה גנרית — מחזיר את כל השורות מגיליון כלשהו
 *
 * payload: { action:'getForm', sheet:'כרטיס סיום שנה' }
 */
function getForm_(sheetName) {
  if (!sheetName) return { result: 'error', message: 'missing sheet name' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', rows: [] };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return { result: 'success', rows: rows };
}

// ============================================
// HELPERS
// ============================================

function logAction_(ss, entity, entityId, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), entity, entityId, action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupDimensionsSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. פולס
  var p = getOrCreate_(ss, 'פולס');
  if (p.getLastRow() === 0) {
    p.appendRow(['מזהה', 'ממד', 'סוג', 'כיתה', 'תשובות (JSON)', 'תאריך', 'תפקיד']);
    p.getRange(1, 1, 1, 7).setFontWeight('bold');
    p.setFrozenRows(1);
  }

  // 2. מערכי שיעור
  var l = getOrCreate_(ss, 'מערכי שיעור');
  if (l.getLastRow() === 0) {
    l.appendRow(['מזהה', 'שם', 'ממד', 'שכבת עבודה', 'שכבת גיל', 'משך', 'מטרות', 'תיאור', 'הערות', 'תאריך יצירה', 'עדכון אחרון']);
    l.getRange(1, 1, 1, 11).setFontWeight('bold');
    l.setFrozenRows(1);
  }

  // 3. לוג
  var log = getOrCreate_(ss, 'לוג');
  if (log.getLastRow() === 0) {
    log.appendRow(['תאריך', 'סוג', 'מזהה', 'פעולה', 'פרטים']);
    log.getRange(1, 1, 1, 5).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: פולס, מערכי שיעור, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
