/**
 * Google Apps Script — מפת המערכות (קווטרט)
 *
 * שמירת סטטוס + עריכות שיתופיות לכל מערכת. שינוי של אחד נשמר לכולם.
 *
 * ════════════════════════════════════════════════════════════
 * הוראות התקנה (פעם אחת, ~5 דקות)
 * ════════════════════════════════════════════════════════════
 *
 * 1. Google Drive → New → Google Sheets → שם: "מפת המערכות — עריכות"
 * 2. Sheet ID = החלק ב-URL בין /d/ ל-/edit, להעתיק
 * 3. Extensions → Apps Script
 * 4. למחוק את כל הקוד ב-Editor, להדביק את הקוד הזה
 * 5. לעדכן SHEET_ID למטה (שורה 18)
 * 6. להריץ פעם אחת setupSheet() — כפתור Run למעלה (לאשר הרשאות)
 * 7. Deploy → New deployment → Web app
 *    Description: "Quartet Map v1"
 *    Execute as: Me
 *    Who has access: Anyone
 *    Deploy → לאשר הרשאות → להעתיק את ה-Web app URL
 * 8. בקובץ docs/quartet/index.html — לעדכן את הקבוע APPS_SCRIPT_URL בקוד JS
 *
 * ════════════════════════════════════════════════════════════
 */

var SHEET_ID = '1J8ipt8IG4JbsFEcXH4NwrcaylKoF5IfkXE06UeCRsb4';

var FIELDS = ['name', 'desc', 'pain', 'flow', 'tech'];
var STATUSES = ['relevant', 'maybe', 'not'];

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || 'getAll';
  try {
    var result;
    switch (action) {
      case 'getAll':           result = getAll_(); break;
      case 'getHistory':       result = getHistory_(e.parameter.id); break;
      case 'save':             result = saveOne_(e.parameter); break;
      case 'addNote':          result = addNote_(e.parameter); break;
      case 'addRequest':       result = addRequest_(e.parameter); break;
      case 'markRequestDone':  result = markRequestDone_(e.parameter); break;
      default:                 result = { result: 'ok', message: 'quartet API v3' };
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
    var result;
    switch (data.action || 'save') {
      case 'save':             result = saveOne_(data); break;
      case 'addNote':          result = addNote_(data); break;
      case 'addRequest':       result = addRequest_(data); break;
      case 'markRequestDone':  result = markRequestDone_(data); break;
      default:                 result = { result: 'error', message: 'unknown action: ' + data.action };
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
// SETUP — חד פעמי
// ============================================

function setupSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('edits');
  if (!sh) sh = ss.insertSheet('edits');
  var headers = ['id', 'status', 'name', 'desc', 'pain', 'flow', 'tech', 'updated_at', 'updated_by'];
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E8E3F5');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 200);
    for (var i = 2; i <= 7; i++) sh.setColumnWidth(i, 220);
  }
  // log sheet
  var log = ss.getSheetByName('log');
  if (!log) {
    log = ss.insertSheet('log');
    log.getRange(1, 1, 1, 5).setValues([['timestamp', 'id', 'action', 'editor', 'payload']]).setFontWeight('bold');
    log.setFrozenRows(1);
  }
  // notes sheet
  var notesSheet = ss.getSheetByName('notes');
  if (!notesSheet) {
    notesSheet = ss.insertSheet('notes');
    notesSheet.getRange(1, 1, 1, 4).setValues([['id', 'editor', 'ts', 'text']]).setFontWeight('bold').setBackground('#D4F0EA');
    notesSheet.setFrozenRows(1);
    notesSheet.setColumnWidth(1, 250);
    notesSheet.setColumnWidth(2, 120);
    notesSheet.setColumnWidth(3, 130);
    notesSheet.setColumnWidth(4, 500);
  }
  // requests sheet (chat bot change requests)
  var reqSheet = ss.getSheetByName('requests');
  if (!reqSheet) {
    reqSheet = ss.insertSheet('requests');
    reqSheet.getRange(1, 1, 1, 7).setValues([['req_id', 'ts', 'editor', 'system_id', 'system_name', 'text', 'status']]).setFontWeight('bold').setBackground('#FCE4EC');
    reqSheet.setFrozenRows(1);
    reqSheet.setColumnWidth(1, 200);
    reqSheet.setColumnWidth(2, 130);
    reqSheet.setColumnWidth(3, 120);
    reqSheet.setColumnWidth(4, 220);
    reqSheet.setColumnWidth(5, 200);
    reqSheet.setColumnWidth(6, 500);
    reqSheet.setColumnWidth(7, 100);
  }
  SpreadsheetApp.getUi().alert('מוכן! הטאבים edits / log / notes / requests מוכנים. אפשר להמשיך ל-Deploy.');
}

// ============================================
// READ
// ============================================

function getAll_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('edits');
  var edits = {};
  if (sh && sh.getLastRow() >= 2) {
    var data = sh.getDataRange().getValues();
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        if (row[j] !== '' && row[j] !== null) obj[headers[j]] = row[j];
      }
      if (obj.id) edits[obj.id] = obj;
    }
  }
  // attach history map: id → [{editor, ts, fields, status}, ...]
  var history = {};
  var log = ss.getSheetByName('log');
  if (log && log.getLastRow() >= 2) {
    var ldata = log.getDataRange().getValues();
    for (var i = 1; i < ldata.length; i++) {
      var ts = ldata[i][0], id = ldata[i][1], action = ldata[i][2], editor = ldata[i][3], payloadStr = ldata[i][4];
      if (!id) continue;
      if (!history[id]) history[id] = [];
      var fields = [];
      var status = '';
      try {
        var p = JSON.parse(payloadStr || '{}');
        if (p.status !== undefined) status = p.status;
        ['name','desc','pain','flow','tech'].forEach(function (k) { if (p[k] !== undefined) fields.push(k); });
      } catch (e) {}
      history[id].push({ editor: editor || 'אנונימי', ts: ts, fields: fields, status: status });
    }
  }
  // notes map: id → [{editor, ts, text}, ...]
  var notes = {};
  var notesSheet = ss.getSheetByName('notes');
  if (notesSheet && notesSheet.getLastRow() >= 2) {
    var ndata = notesSheet.getDataRange().getValues();
    for (var i = 1; i < ndata.length; i++) {
      var nid = ndata[i][0];
      if (!nid) continue;
      if (!notes[nid]) notes[nid] = [];
      notes[nid].push({
        editor: ndata[i][1] || 'אנונימי',
        ts: ndata[i][2],
        text: ndata[i][3] || ''
      });
    }
  }
  // requests array: [{id, ts, editor, system_id, system_name, text, status}, ...]
  var requests = [];
  var reqSheet = ss.getSheetByName('requests');
  if (reqSheet && reqSheet.getLastRow() >= 2) {
    var rdata = reqSheet.getDataRange().getValues();
    for (var i = 1; i < rdata.length; i++) {
      if (!rdata[i][0]) continue;
      requests.push({
        id: rdata[i][0],
        ts: rdata[i][1],
        editor: rdata[i][2] || 'אנונימי',
        system_id: rdata[i][3] || '',
        system_name: rdata[i][4] || '',
        text: rdata[i][5] || '',
        status: rdata[i][6] || 'pending'
      });
    }
  }
  return { result: 'success', edits: edits, history: history, notes: notes, requests: requests };
}

function getHistory_(id) {
  if (!id) return { result: 'error', message: 'חסר id' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var log = ss.getSheetByName('log');
  if (!log || log.getLastRow() < 2) return { result: 'success', history: [] };
  var data = log.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) !== String(id)) continue;
    var fields = [], status = '';
    try {
      var p = JSON.parse(data[i][4] || '{}');
      if (p.status !== undefined) status = p.status;
      ['name','desc','pain','flow','tech'].forEach(function (k) { if (p[k] !== undefined) fields.push(k); });
    } catch (e) {}
    rows.push({ ts: data[i][0], editor: data[i][3] || 'אנונימי', fields: fields, status: status });
  }
  return { result: 'success', history: rows };
}

// ============================================
// WRITE — upsert
// ============================================

function saveOne_(data) {
  if (!data.id) return { result: 'error', message: 'חסר id' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסי שוב' };
  }

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('edits');
    if (!sh) return { result: 'error', message: 'הטאב edits לא קיים — להריץ setupSheet' };

    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var idCol = headers.indexOf('id');
    var lastRow = sh.getLastRow();
    var rowIdx = -1;
    if (lastRow >= 2) {
      var ids = sh.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(data.id)) { rowIdx = i + 2; break; }
      }
    }

    var now = new Date();
    var ts = Utilities.formatDate(now, 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm');
    var editor = (data.editor || 'אנונימי').toString().substring(0, 80);

    // Build full row aligned to headers
    var values = headers.map(function (h) {
      switch (h) {
        case 'id':         return data.id;
        case 'status':     return STATUSES.indexOf(data.status) >= 0 ? data.status : (data.status === '' ? '' : '');
        case 'name':       return data.name != null ? data.name : '';
        case 'desc':       return data.desc != null ? data.desc : '';
        case 'pain':       return data.pain != null ? data.pain : '';
        case 'flow':       return data.flow != null ? data.flow : '';
        case 'tech':       return data.tech != null ? data.tech : '';
        case 'updated_at': return ts;
        case 'updated_by': return editor;
        default:           return '';
      }
    });

    if (rowIdx > 0) {
      // Merge with existing — only overwrite fields that came in this request
      var existing = sh.getRange(rowIdx, 1, 1, headers.length).getValues()[0];
      for (var k = 0; k < headers.length; k++) {
        var h = headers[k];
        if (h === 'id' || h === 'updated_at' || h === 'updated_by') continue;
        if (data[h] === undefined) values[k] = existing[k];
      }
      sh.getRange(rowIdx, 1, 1, headers.length).setValues([values]);
    } else {
      sh.appendRow(values);
    }

    // log
    var log = ss.getSheetByName('log');
    if (log) log.appendRow([ts, data.id, 'save', editor, JSON.stringify(data).substring(0, 500)]);

    return { result: 'success', id: data.id, updated_at: ts };
  } catch (e) {
    return { result: 'error', message: e.toString().substring(0, 200) };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// NOTES — append-only thread per system
// ============================================

function addNote_(data) {
  if (!data.id) return { result: 'error', message: 'חסר id' };
  if (!data.text || !String(data.text).trim()) return { result: 'error', message: 'חסר טקסט' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסי שוב' };
  }

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('notes');
    if (!sh) {
      sh = ss.insertSheet('notes');
      sh.getRange(1, 1, 1, 4).setValues([['id', 'editor', 'ts', 'text']]).setFontWeight('bold').setBackground('#D4F0EA');
      sh.setFrozenRows(1);
    }

    var ts = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm');
    var editor = (data.editor || 'אנונימי').toString().substring(0, 80);
    var text = String(data.text).substring(0, 2000);

    sh.appendRow([data.id, editor, ts, text]);

    var log = ss.getSheetByName('log');
    if (log) log.appendRow([ts, data.id, 'note', editor, text.substring(0, 300)]);

    return { result: 'success', id: data.id, ts: ts, editor: editor, text: text };
  } catch (e) {
    return { result: 'error', message: e.toString().substring(0, 200) };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// REQUESTS — chat bot change requests queue
// ============================================

function addRequest_(data) {
  if (!data.system_id) return { result: 'error', message: 'חסר system_id' };
  if (!data.text || !String(data.text).trim()) return { result: 'error', message: 'חסר תיאור שינוי' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסי שוב' };
  }

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('requests');
    if (!sh) {
      sh = ss.insertSheet('requests');
      sh.getRange(1, 1, 1, 7).setValues([['req_id', 'ts', 'editor', 'system_id', 'system_name', 'text', 'status']]).setFontWeight('bold').setBackground('#FCE4EC');
      sh.setFrozenRows(1);
    }

    var ts = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm');
    var editor = (data.editor || 'אנונימי').toString().substring(0, 80);
    var reqId = data.id || ('req_' + new Date().getTime() + '_' + Math.floor(Math.random() * 100000));
    var text = String(data.text).substring(0, 3000);
    var systemName = String(data.system_name || '').substring(0, 200);
    var systemIdStr = String(data.system_id).substring(0, 200);

    sh.appendRow([reqId, ts, editor, systemIdStr, systemName, text, 'pending']);

    var log = ss.getSheetByName('log');
    if (log) log.appendRow([ts, systemIdStr, 'request', editor, text.substring(0, 300)]);

    return { result: 'success', id: reqId, ts: ts };
  } catch (e) {
    return { result: 'error', message: e.toString().substring(0, 200) };
  } finally {
    lock.releaseLock();
  }
}

function markRequestDone_(data) {
  if (!data.id) return { result: 'error', message: 'חסר id' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסי שוב' };
  }

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('requests');
    if (!sh || sh.getLastRow() < 2) return { result: 'error', message: 'אין בקשות' };

    var data_rows = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
    for (var i = 0; i < data_rows.length; i++) {
      if (String(data_rows[i][0]) === String(data.id)) {
        sh.getRange(i + 2, 7).setValue('done');
        return { result: 'success', id: data.id };
      }
    }
    return { result: 'error', message: 'בקשה לא נמצאה' };
  } catch (e) {
    return { result: 'error', message: e.toString().substring(0, 200) };
  } finally {
    lock.releaseLock();
  }
}
