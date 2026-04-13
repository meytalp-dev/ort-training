/**
 * Google Apps Script — מערכת תעסוקה | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "תעסוקה — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupEmploymentSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL — זה ה-endpoint למערכת
 */

var SHEET_ID = '1Gl_5LhUsouKPQtGHZPBskWVnLTnA9Sur3iMFY1YrhJI';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getAll':
        result = getAll_();
        break;
      case 'getEmployers':
        result = getSheet_('מעסיקים');
        break;
      case 'getPotential':
        result = getSheet_('פוטנציאליים');
        break;
      case 'getPlacements':
        result = getSheet_('שיבוצים');
        break;
      case 'getAttendance':
        result = getSheet_('נוכחות');
        break;
      case 'getLessons':
        result = getSheet_('מערכי שיעור');
        break;
      case 'getVisits':
        result = getSheet_('ביקורים');
        break;
      case 'getLetters':
        result = getSheet_('מכתבים');
        break;
      case 'getForms':
        result = getSheet_('טפסים');
        break;
      case 'getSchedule':
        result = getSheet_('לוז שבועי');
        break;
      case 'getWorkshop':
        result = getSheet_('סדנה');
        break;
      case 'getPrepfile':
        result = getSheet_('תיק הכנה');
        break;
      case 'getRecommendations':
        result = getSheet_('המלצות');
        break;
      case 'getResumes':
        result = getSheet_('קורות חיים');
        break;
      case 'getMentorship':
        result = getSheet_('חניכות');
        break;
      case 'getDocuments':
        result = getSheet_('מסמכים');
        break;
      default:
        result = { result: 'ok', message: 'employment API active' };
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
      case 'saveEmployer':
        result = saveRow_('מעסיקים', data.row, data.row.id);
        break;
      case 'deleteEmployer':
        result = deleteRow_('מעסיקים', data.id);
        break;
      case 'savePotential':
        result = saveRow_('פוטנציאליים', data.row, data.row.id);
        break;
      case 'deletePotential':
        result = deleteRow_('פוטנציאליים', data.id);
        break;
      case 'savePlacement':
        result = saveRow_('שיבוצים', data.row, data.row.id);
        break;
      case 'deletePlacement':
        result = deleteRow_('שיבוצים', data.id);
        break;
      case 'saveAttendance':
        result = saveRow_('נוכחות', data.row, data.row.id);
        break;
      case 'deleteAttendance':
        result = deleteRow_('נוכחות', data.id);
        break;
      case 'saveLesson':
        result = saveRow_('מערכי שיעור', data.row, data.row.id);
        break;
      case 'deleteLesson':
        result = deleteRow_('מערכי שיעור', data.id);
        break;
      case 'saveVisit':
        result = saveRow_('ביקורים', data.row, data.row.id);
        break;
      case 'deleteVisit':
        result = deleteRow_('ביקורים', data.id);
        break;
      case 'saveLetter':
        result = saveRow_('מכתבים', data.row, data.row.id);
        break;
      case 'deleteLetter':
        result = deleteRow_('מכתבים', data.id);
        break;
      case 'saveForm':
        result = saveRow_('טפסים', data.row, data.row.placementId);
        break;
      case 'saveSchedule':
        result = saveRow_('לוז שבועי', data.row, data.row.id);
        break;
      case 'deleteSchedule':
        result = deleteRow_('לוז שבועי', data.id);
        break;
      case 'saveWorkshop':
        result = saveRow_('סדנה', data.row, data.row.id);
        break;
      case 'savePrepfile':
        result = saveRow_('תיק הכנה', data.row, data.row.studentId);
        break;
      case 'saveStudentmap':
        result = saveRow_('מיפוי', data.row, data.row.placementId);
        break;
      case 'saveRecommendation':
        result = saveRow_('המלצות', data.row, data.row.id);
        break;
      case 'deleteRecommendation':
        result = deleteRow_('המלצות', data.id);
        break;
      case 'saveResume':
        result = saveRow_('קורות חיים', data.row, data.row.studentId);
        break;
      case 'saveMentorship':
        result = saveRow_('חניכות', data.row, data.row.id);
        break;
      case 'deleteMentorship':
        result = deleteRow_('חניכות', data.id);
        break;
      case 'saveDocument':
        result = saveRow_('מסמכים', data.row, data.row.id);
        break;
      case 'deleteDocument':
        result = deleteRow_('מסמכים', data.id);
        break;
      case 'syncAll':
        result = syncAll_(data);
        break;
      default:
        result = { result: 'error', message: 'unknown action: ' + action };
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
// GENERIC READ — getSheet_ (returns all rows as JSON)
// ============================================

function getSheet_(sheetName) {
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
// READ — getAll_ (full sync for initial load)
// ============================================

function getAll_() {
  var sheetNames = [
    'מעסיקים', 'פוטנציאליים', 'שיבוצים', 'נוכחות',
    'מערכי שיעור', 'ביקורים', 'מכתבים', 'טפסים',
    'לוז שבועי', 'סדנה', 'תיק הכנה', 'מיפוי',
    'המלצות', 'קורות חיים', 'חניכות', 'מסמכים'
  ];

  var all = {};
  sheetNames.forEach(function(name) {
    var res = getSheet_(name);
    all[name] = res.rows || [];
  });

  return { result: 'success', data: all };
}

// ============================================
// GENERIC WRITE — saveRow_ (upsert by ID in col A)
// ============================================

function saveRow_(sheetName, rowData, id) {
  if (!rowData) return { result: 'error', message: 'no row data' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { result: 'error', message: 'sheet not found: ' + sheetName };

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = headers.map(function(h) {
    var val = rowData[h];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  });

  // Add timestamp
  var tsCol = headers.indexOf('עדכון');
  if (tsCol >= 0) values[tsCol] = new Date().toISOString();

  // Try to find existing row by ID (column A)
  if (id && sheet.getLastRow() > 1) {
    var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        sheet.getRange(i + 2, 1, 1, values.length).setValues([values]);
        logAction_(ss, sheetName, 'update', 'Updated ' + id);
        return { result: 'success', message: 'Updated', id: id };
      }
    }
  }

  // Insert new row
  sheet.appendRow(values);
  logAction_(ss, sheetName, 'insert', 'Inserted ' + (id || 'new'));
  return { result: 'success', message: 'Inserted', id: id };
}

// ============================================
// GENERIC DELETE — deleteRow_
// ============================================

function deleteRow_(sheetName, id) {
  if (!id) return { result: 'error', message: 'no id' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { result: 'error', message: 'sheet not found: ' + sheetName };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      logAction_(ss, sheetName, 'delete', 'Deleted ' + id);
      return { result: 'success', message: 'Deleted' };
    }
  }
  return { result: 'error', message: 'not found: ' + id };
}

// ============================================
// FULL SYNC — syncAll_ (bulk write from client)
// ============================================

function syncAll_(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var count = 0;

  var mapping = {
    employers: 'מעסיקים',
    potential: 'פוטנציאליים',
    placements: 'שיבוצים',
    attendance: 'נוכחות',
    lessons: 'מערכי שיעור',
    visits: 'ביקורים',
    letters: 'מכתבים',
    forms: 'טפסים',
    schedule: 'לוז שבועי',
    workshop: 'סדנה',
    prepfile: 'תיק הכנה',
    studentmap: 'מיפוי',
    recommendations: 'המלצות',
    resumes: 'קורות חיים',
    mentorship_current: 'חניכות',
    mentorship_next: 'חניכות',
    documents: 'מסמכים'
  };

  for (var key in mapping) {
    if (!data[key] || !Array.isArray(data[key])) continue;
    var sheetName = mapping[key];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Clear existing data (keep headers)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    // Write all rows
    var rows = data[key].map(function(item) {
      return headers.map(function(h) {
        var val = item[h];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
    });

    if (rows.length > 0) {
      // Ensure we have enough rows
      while (sheet.getLastRow() < rows.length + 1) {
        sheet.appendRow([]);
      }
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      count += rows.length;
    }
  }

  logAction_(ss, 'sync', 'syncAll', 'Synced ' + count + ' rows');
  return { result: 'success', message: 'Synced ' + count + ' rows', count: count };
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

function setupEmploymentSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. מעסיקים
  var s1 = getOrCreate_(ss, 'מעסיקים');
  if (s1.getLastRow() === 0) {
    s1.appendRow(['id', 'name', 'track', 'contact', 'phone', 'address', 'capacity', 'status', 'notes', 'עדכון']);
    s1.getRange(1, 1, 1, 10).setFontWeight('bold');
    s1.setFrozenRows(1);
  }

  // 2. פוטנציאליים
  var s2 = getOrCreate_(ss, 'פוטנציאליים');
  if (s2.getLastRow() === 0) {
    s2.appendRow(['id', 'name', 'track', 'contact', 'phone', 'contactDate', 'status', 'notes', 'עדכון']);
    s2.getRange(1, 1, 1, 9).setFontWeight('bold');
    s2.setFrozenRows(1);
  }

  // 3. שיבוצים
  var s3 = getOrCreate_(ss, 'שיבוצים');
  if (s3.getLastRow() === 0) {
    s3.appendRow(['id', 'studentName', 'grade', 'track', 'employerId', 'employerName', 'hours', 'days', 'startDate', 'status', 'phone', 'notes', 'עדכון']);
    s3.getRange(1, 1, 1, 13).setFontWeight('bold');
    s3.setFrozenRows(1);
  }

  // 4. נוכחות
  var s4 = getOrCreate_(ss, 'נוכחות');
  if (s4.getLastRow() === 0) {
    s4.appendRow(['id', 'placementId', 'date', 'timeIn', 'timeOut', 'status', 'notes', 'עדכון']);
    s4.getRange(1, 1, 1, 8).setFontWeight('bold');
    s4.setFrozenRows(1);
  }

  // 5. מערכי שיעור
  var s5 = getOrCreate_(ss, 'מערכי שיעור');
  if (s5.getLastRow() === 0) {
    s5.appendRow(['id', 'title', 'track', 'date', 'teacher', 'duration', 'topics', 'goals', 'עדכון']);
    s5.getRange(1, 1, 1, 9).setFontWeight('bold');
    s5.setFrozenRows(1);
  }

  // 6. ביקורים
  var s6 = getOrCreate_(ss, 'ביקורים');
  if (s6.getLastRow() === 0) {
    s6.appendRow(['id', 'employerId', 'employerName', 'date', 'visitor', 'rating', 'students', 'summary', 'status', 'עדכון']);
    s6.getRange(1, 1, 1, 10).setFontWeight('bold');
    s6.setFrozenRows(1);
  }

  // 7. מכתבים
  var s7 = getOrCreate_(ss, 'מכתבים');
  if (s7.getLastRow() === 0) {
    s7.appendRow(['id', 'employerId', 'date', 'to', 'body', 'status', 'עדכון']);
    s7.getRange(1, 1, 1, 7).setFontWeight('bold');
    s7.setFrozenRows(1);
  }

  // 8. טפסים
  var s8 = getOrCreate_(ss, 'טפסים');
  if (s8.getLastRow() === 0) {
    s8.appendRow(['placementId', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'עדכון']);
    s8.getRange(1, 1, 1, 8).setFontWeight('bold');
    s8.setFrozenRows(1);
  }

  // 9. לוז שבועי
  var s9 = getOrCreate_(ss, 'לוז שבועי');
  if (s9.getLastRow() === 0) {
    s9.appendRow(['id', 'week', 'day', 'tasks', 'notes', 'עדכון']);
    s9.getRange(1, 1, 1, 6).setFontWeight('bold');
    s9.setFrozenRows(1);
  }

  // 10. סדנה
  var s10 = getOrCreate_(ss, 'סדנה');
  if (s10.getLastRow() === 0) {
    s10.appendRow(['id', 'sessionNumber', 'activities', 'materials', 'date', 'status', 'participants', 'עדכון']);
    s10.getRange(1, 1, 1, 8).setFontWeight('bold');
    s10.setFrozenRows(1);
  }

  // 11. תיק הכנה
  var s11 = getOrCreate_(ss, 'תיק הכנה');
  if (s11.getLastRow() === 0) {
    s11.appendRow(['studentId', 'tests', 'strengths', 'tags', 'customSections', 'עדכון']);
    s11.getRange(1, 1, 1, 6).setFontWeight('bold');
    s11.setFrozenRows(1);
  }

  // 12. מיפוי (satisfaction ratings)
  var s12 = getOrCreate_(ss, 'מיפוי');
  if (s12.getLastRow() === 0) {
    s12.appendRow(['placementId', 'satisfaction', 'עדכון']);
    s12.getRange(1, 1, 1, 3).setFontWeight('bold');
    s12.setFrozenRows(1);
  }

  // 13. המלצות
  var s13 = getOrCreate_(ss, 'המלצות');
  if (s13.getLastRow() === 0) {
    s13.appendRow(['id', 'studentName', 'employerId', 'employerName', 'content', 'date', 'status', 'עדכון']);
    s13.getRange(1, 1, 1, 8).setFontWeight('bold');
    s13.setFrozenRows(1);
  }

  // 14. קורות חיים
  var s14 = getOrCreate_(ss, 'קורות חיים');
  if (s14.getLastRow() === 0) {
    s14.appendRow(['studentId', 'name', 'phone', 'email', 'address', 'dob', 'school', 'track', 'years', 'achievements', 'languages', 'computer', 'techSkills', 'softSkills', 'experience', 'references', 'עדכון']);
    s14.getRange(1, 1, 1, 17).setFontWeight('bold');
    s14.setFrozenRows(1);
  }

  // 15. חניכות
  var s15 = getOrCreate_(ss, 'חניכות');
  if (s15.getLastRow() === 0) {
    s15.appendRow(['id', 'year', 'mentorName', 'menteeName', 'goals', 'startDate', 'status', 'priority', 'notes', 'meetings', 'עדכון']);
    s15.getRange(1, 1, 1, 11).setFontWeight('bold');
    s15.setFrozenRows(1);
  }

  // 16. מסמכים (metadata only — files stay in localStorage/Drive)
  var s16 = getOrCreate_(ss, 'מסמכים');
  if (s16.getLastRow() === 0) {
    s16.appendRow(['id', 'tabType', 'parentId', 'fileName', 'fileType', 'uploadDate', 'עדכון']);
    s16.getRange(1, 1, 1, 7).setFontWeight('bold');
    s16.setFrozenRows(1);
  }

  // 17. לוג
  var sLog = getOrCreate_(ss, 'לוג');
  if (sLog.getLastRow() === 0) {
    sLog.appendRow(['תאריך', 'מקור', 'פעולה', 'פרטים']);
    sLog.getRange(1, 1, 1, 4).setFontWeight('bold');
    sLog.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: מעסיקים, פוטנציאליים, שיבוצים, נוכחות, מערכי שיעור, ביקורים, מכתבים, טפסים, לוז שבועי, סדנה, תיק הכנה, מיפוי, המלצות, קורות חיים, חניכות, מסמכים, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
