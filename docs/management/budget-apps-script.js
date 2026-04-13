/**
 * Google Apps Script — מערכת תקציבית | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "תקציב — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. הריצי setupBudgetSheets() פעם אחת
 * 5. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 6. העתיקי את ה-URL — זה ה-endpoint למערכת
 */

var SHEET_ID = 'REPLACE_WITH_YOUR_SHEET_ID';

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
      case 'getOperational':
        result = getSheet_('תפעול');
        break;
      case 'getTimeline':
        result = getSheet_('ציר זמן');
        break;
      case 'getConversions':
        result = getSheet_('המרות');
        break;
      case 'getSpecEd':
        result = getSheet_('סל שילוב');
        break;
      default:
        result = { result: 'ok', message: 'budget API active' };
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
      case 'syncAll':
        result = syncAll_(data);
        break;
      case 'saveOperationalRow':
        result = saveRow_('תפעול', data.row, data.row.date);
        break;
      case 'deleteOperationalRow':
        result = deleteRow_('תפעול', data.id);
        break;
      case 'saveTimelineRow':
        result = saveRow_('ציר זמן', data.row, data.row.date);
        break;
      case 'saveConversion':
        result = saveRow_('המרות', data.row, data.row.id);
        break;
      case 'deleteConversion':
        result = deleteRow_('המרות', data.id);
        break;
      case 'saveSpecEd':
        result = saveRow_('סל שילוב', data.row, data.row.id);
        break;
      case 'deleteSpecEd':
        result = deleteRow_('סל שילוב', data.id);
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
// GENERIC READ
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
// READ ALL
// ============================================

function getAll_() {
  var all = {
    operational: getSheet_('תפעול').rows || [],
    timeline: getSheet_('ציר זמן').rows || [],
    conversions: getSheet_('המרות').rows || [],
    specEd: getSheet_('סל שילוב').rows || []
  };
  return { result: 'success', data: all };
}

// ============================================
// GENERIC WRITE (upsert by col A)
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

  // Timestamp
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

  sheet.appendRow(values);
  logAction_(ss, sheetName, 'insert', 'Inserted ' + (id || 'new'));
  return { result: 'success', message: 'Inserted', id: id };
}

// ============================================
// GENERIC DELETE
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
// FULL SYNC — bulk write from client
// ============================================

function syncAll_(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var count = 0;

  var mapping = {
    operational: 'תפעול',
    timeline: 'ציר זמן',
    conversions: 'המרות',
    specEd: 'סל שילוב'
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

    var rows = data[key].map(function(item) {
      return headers.map(function(h) {
        var val = item[h];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
    });

    if (rows.length > 0) {
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

function setupBudgetSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. תפעול — שעות תפעול/מערכת
  var s1 = getOrCreate_(ss, 'תפעול');
  if (s1.getLastRow() === 0) {
    s1.appendRow(['date', 'type', 'budget', 'used', 'balance', 'notes', 'עדכון']);
    s1.getRange(1, 1, 1, 7).setFontWeight('bold');
    s1.setFrozenRows(1);
  }

  // 2. ציר זמן — פעילויות נוספות
  var s2 = getOrCreate_(ss, 'ציר זמן');
  if (s2.getLastRow() === 0) {
    s2.appendRow(['date', 'type', 'change', 'balance', 'notes', 'עדכון']);
    s2.getRange(1, 1, 1, 6).setFontWeight('bold');
    s2.setFrozenRows(1);
  }

  // 3. המרות
  var s3 = getOrCreate_(ss, 'המרות');
  if (s3.getLastRow() === 0) {
    s3.appendRow(['id', 'date', 'hours', 'amount', 'purpose', 'from', 'status', 'email', 'עדכון']);
    s3.getRange(1, 1, 1, 9).setFontWeight('bold');
    s3.setFrozenRows(1);
  }

  // 4. סל שילוב — חינוך מיוחד
  var s4 = getOrCreate_(ss, 'סל שילוב');
  if (s4.getLastRow() === 0) {
    s4.appendRow(['id', 'type', 'hours', 'workers', 'source', 'notes', 'עדכון']);
    s4.getRange(1, 1, 1, 7).setFontWeight('bold');
    s4.setFrozenRows(1);
  }

  // 5. לוג
  var sLog = getOrCreate_(ss, 'לוג');
  if (sLog.getLastRow() === 0) {
    sLog.appendRow(['תאריך', 'מקור', 'פעולה', 'פרטים']);
    sLog.getRange(1, 1, 1, 4).setFontWeight('bold');
    sLog.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: תפעול, ציר זמן, המרות, סל שילוב, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
