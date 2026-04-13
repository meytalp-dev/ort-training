/**
 * Google Apps Script — מערכת אירועי משמעת | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "אירועי משמעת — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupDisciplineSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL — זה ה-endpoint למערכת
 */

var SHEET_ID = 'YOUR_SHEET_ID_HERE';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getAllEvents':
        result = getAllEvents_();
        break;
      case 'getStudentEvents':
        result = getStudentEvents_(e.parameter.studentId);
        break;
      case 'getSummary':
        result = getSummary_();
        break;
      default:
        result = { result: 'ok', message: 'discipline API active' };
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
      case 'saveEvent':
        result = saveEvent_(data.event);
        break;
      case 'addAction':
        result = addAction_(data.eventId, data.action);
        break;
      case 'deleteEvent':
        result = deleteEvent_(data.eventId);
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
// READ — getAllEvents
// ============================================

function getAllEvents_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('אירועים');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', events: [] };

  var data = sheet.getDataRange().getValues();
  var events = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    events.push({
      id: row[0],
      source: row[1],
      studentId: row[2],
      eventType: row[3],
      eventLabel: row[4],
      date: row[5],
      time: row[6] || '',
      period: row[7] || '',
      subject: row[8] || '',
      notes: row[9] || '',
      actions: row[10] ? String(row[10]).split(';;') : [],
      reporter: row[11] || '',
      created: row[12] || ''
    });
  }

  return { result: 'success', events: events };
}

// ============================================
// READ — getStudentEvents
// ============================================

function getStudentEvents_(studentId) {
  if (!studentId) return { result: 'error', message: 'no studentId' };
  var sid = parseInt(studentId);
  var all = getAllEvents_();
  var filtered = all.events.filter(function(e) { return e.studentId === sid; });
  return { result: 'success', events: filtered };
}

// ============================================
// READ — getSummary (for dashboard)
// ============================================

function getSummary_() {
  var all = getAllEvents_();
  var events = all.events;

  var byStudent = {};
  events.forEach(function(e) {
    if (!byStudent[e.studentId]) {
      byStudent[e.studentId] = { total: 0, types: {}, lastDate: '', actions: [] };
    }
    var s = byStudent[e.studentId];
    s.total++;
    s.types[e.eventType] = (s.types[e.eventType] || 0) + 1;
    if (!s.lastDate || e.date > s.lastDate) s.lastDate = e.date;
    if (e.actions) s.actions = s.actions.concat(e.actions);
  });

  return {
    result: 'success',
    totalEvents: events.length,
    totalStudents: Object.keys(byStudent).length,
    byStudent: byStudent
  };
}

// ============================================
// WRITE — saveEvent
// ============================================

function saveEvent_(event) {
  if (!event) return { result: 'error', message: 'no event data' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('אירועים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  sheet.appendRow([
    event.id || Date.now(),
    event.source || '',
    event.studentId || '',
    event.eventType || '',
    event.eventLabel || '',
    event.date || '',
    event.time || '',
    event.period || '',
    event.subject || '',
    event.notes || '',
    (event.actions || []).join(';;'),
    event.reporter || '',
    event.created || new Date().toISOString()
  ]);

  // Log
  logAction_(ss, event.source, 'save', 'Event: ' + event.eventLabel + ' for student ' + event.studentId);

  return { result: 'success', message: 'Event saved' };
}

// ============================================
// WRITE — addAction to existing event
// ============================================

function addAction_(eventId, actionText) {
  if (!eventId || !actionText) return { result: 'error', message: 'missing eventId or action' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('אירועים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId)) {
      var existingActions = data[i][10] ? String(data[i][10]) : '';
      var newActions = existingActions ? existingActions + ';;' + actionText : actionText;
      sheet.getRange(i + 1, 11).setValue(newActions);

      logAction_(ss, 'system', 'addAction', 'Action: ' + actionText + ' for event ' + eventId);
      return { result: 'success', message: 'Action added' };
    }
  }
  return { result: 'error', message: 'event not found' };
}

// ============================================
// WRITE — deleteEvent
// ============================================

function deleteEvent_(eventId) {
  if (!eventId) return { result: 'error', message: 'no eventId' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('אירועים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(eventId)) {
      sheet.deleteRow(i + 1);
      logAction_(ss, 'system', 'delete', 'Deleted event ' + eventId);
      return { result: 'success', message: 'Event deleted' };
    }
  }
  return { result: 'error', message: 'event not found' };
}

// ============================================
// HELPERS
// ============================================

function logAction_(ss, source, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), source, action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupDisciplineSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. אירועים
  var events = getOrCreate_(ss, 'אירועים');
  if (events.getLastRow() === 0) {
    events.appendRow([
      'מזהה', 'מקור', 'מזהה תלמיד', 'סוג אירוע', 'תיאור אירוע',
      'תאריך', 'שעה', 'שעת שיעור', 'מקצוע', 'הערות',
      'פעולות', 'מדווח', 'נוצר'
    ]);
    events.getRange(1, 1, 1, 13).setFontWeight('bold');
    events.setFrozenRows(1);

    // Set column widths
    events.setColumnWidth(1, 130); // מזהה
    events.setColumnWidth(2, 80);  // מקור
    events.setColumnWidth(3, 80);  // מזהה תלמיד
    events.setColumnWidth(4, 120); // סוג אירוע
    events.setColumnWidth(5, 150); // תיאור
    events.setColumnWidth(6, 100); // תאריך
    events.setColumnWidth(9, 100); // מקצוע
    events.setColumnWidth(10, 200); // הערות
    events.setColumnWidth(11, 250); // פעולות
    events.setColumnWidth(12, 100); // מדווח
  }

  // 2. לוג
  var log = getOrCreate_(ss, 'לוג');
  if (log.getLastRow() === 0) {
    log.appendRow(['תאריך', 'מקור', 'פעולה', 'פרטים']);
    log.getRange(1, 1, 1, 4).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('טאבים נוצרו בהצלחה: אירועים, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}