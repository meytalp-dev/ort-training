/**
 * Google Apps Script — Cloud Storage מאוחד | אורט בית הערבה
 *
 * תשתית משותפת לכל המערכות שצריכות לשמור נתונים בין מחשבים:
 *   - bnot-sherut         (בנות שירות)
 *   - bagrut-eligibility  (ציונים וזכאות)
 *   - student-file        (תיק תלמיד — הערות, שיחות, ממדים)
 *   - student-roster      (מצבת תלמידים)
 *   - monthly-reports     (דוחות חודשיים)
 *   - therapy             (מערכת טיפולים)
 *
 * הרעיון: טאב אחד `kv_store` שמחזיק זוגות key→value (JSON).
 * כל מערכת קוראת/כותבת רק את ה-keys שלה. הסכמה גמישה — מערכות
 * חדשות לא דורשות שינוי קוד כאן.
 *
 * ════════════════════════════════════════════════════════════
 * הוראות התקנה (5 דקות, פעם אחת)
 * ════════════════════════════════════════════════════════════
 *
 * 1. Google Drive → New → Google Sheets
 *    שם: "ניהול בית ספר — אורט בית הערבה"
 * 2. העתיקי את ה-Sheet ID מה-URL (החלק בין /d/ ל-/edit)
 * 3. ב-Sheet: Extensions → Apps Script
 * 4. מחקי את כל הקוד שיש ב-Editor, הדביקי את כל הקוד מהקובץ הזה
 * 5. עדכני את SHEET_ID למטה (שורה 35)
 * 6. הריצי פעם אחת את setupSheets() — כפתור Run למעלה (תאשרי הרשאות)
 * 7. Deploy → New deployment → Web app
 *      Description: "Cloud Storage v1"
 *      Execute as:  Me
 *      Who has access: Anyone
 *    Deploy → אשרי הרשאות → העתיקי את ה-Web app URL
 * 8. פתחי את cloud-storage.js (הקובץ באתר), עדכני את CLOUD_STORAGE_URL
 *    עם ה-URL שהעתקת. זהו — כל המערכות מסונכרנות.
 *
 * ════════════════════════════════════════════════════════════
 */

var SHEET_ID = '1_X5hY1buOMXGj93JQout9Ew-TLONSHZ2915oGZwSVns';
var SHEET_NAME = 'kv_store';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = String(e.parameter.callback || '').replace(/[^a-zA-Z0-9_]/g, '');
  try {
    var action = e.parameter.action || 'ping';
    var result;
    switch (action) {
      case 'get':    result = getValue_(e.parameter.key); break;
      case 'getAll': result = getAll_(e.parameter.keys ? String(e.parameter.keys).split(',') : []); break;
      case 'list':   result = listKeys_(e.parameter.prefix || ''); break;
      default:       result = { result: 'success', message: 'cloud-storage v1' };
    }
    return respond_(callback, result);
  } catch (err) {
    return respond_(callback, { result: 'error', message: String(err).substring(0, 300) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result;
    switch (data.action) {
      case 'set':     result = setValue_(data.key, data.value, data.updated_by); break;
      case 'setMany': result = setMany_(data.items, data.updated_by); break;
      case 'delete':  result = deleteKey_(data.key); break;
      default:        result = { result: 'error', message: 'unknown action: ' + data.action };
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err).substring(0, 300) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function respond_(callback, obj) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// SETUP — הרצה חד-פעמית
// ============================================

function setupSheets() {
  if (SHEET_ID === '__PASTE_YOUR_SHEET_ID_HERE__') {
    throw new Error('עדכני קודם את SHEET_ID בראש הקוד!');
  }
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, 4)
      .setValues([['key', 'value', 'updated_at', 'updated_by']])
      .setFontWeight('bold')
      .setBackground('#E8E3F5');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 280);
    sh.setColumnWidth(2, 600);
    sh.setColumnWidth(3, 180);
    sh.setColumnWidth(4, 150);
  }
  SpreadsheetApp.getUi().alert('✓ מוכן! טאב kv_store נוצר.\n\nהשלב הבא: Deploy → New deployment → Web app.');
}

// ============================================
// READ
// ============================================

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('טאב kv_store לא קיים — הריצי setupSheets()');
  return sh;
}

function findRow_(sh, key) {
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(key)) return i + 1;
  }
  return -1;
}

function parseValue_(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  try { return JSON.parse(raw); } catch (e) { return raw; }
}

function getValue_(key) {
  if (!key) return { result: 'error', message: 'missing key' };
  var sh = getSheet_();
  var row = findRow_(sh, key);
  if (row < 0) return { result: 'success', found: false, value: null };
  var rng = sh.getRange(row, 2, 1, 3).getValues()[0];
  return {
    result: 'success',
    found: true,
    key: key,
    value: parseValue_(rng[0]),
    updated_at: rng[1],
    updated_by: rng[2]
  };
}

function getAll_(keys) {
  var sh = getSheet_();
  var data = sh.getDataRange().getValues();
  var out = {};
  if (!keys || !keys.length) {
    for (var i = 1; i < data.length; i++) {
      var k = String(data[i][0]);
      if (k) out[k] = { value: parseValue_(data[i][1]), updated_at: data[i][2], updated_by: data[i][3] };
    }
  } else {
    var set = {};
    keys.forEach(function (k) { set[k] = true; });
    for (var j = 1; j < data.length; j++) {
      var key = String(data[j][0]);
      if (set[key]) out[key] = { value: parseValue_(data[j][1]), updated_at: data[j][2], updated_by: data[j][3] };
    }
  }
  return { result: 'success', items: out };
}

function listKeys_(prefix) {
  var sh = getSheet_();
  var data = sh.getDataRange().getValues();
  var keys = [];
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0]);
    if (k && (!prefix || k.indexOf(prefix) === 0)) {
      keys.push({ key: k, updated_at: data[i][2], updated_by: data[i][3] });
    }
  }
  return { result: 'success', keys: keys };
}

// ============================================
// WRITE
// ============================================

function setValue_(key, value, updatedBy) {
  if (!key) return { result: 'error', message: 'missing key' };
  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (e) { return { result: 'error', message: 'המערכת עמוסה, נסו שוב' }; }
  try {
    var sh = getSheet_();
    var row = findRow_(sh, key);
    var json = typeof value === 'string' ? value : JSON.stringify(value);
    var ts = new Date().toISOString();
    var by = updatedBy || '';
    if (row < 0) {
      sh.appendRow([key, json, ts, by]);
    } else {
      sh.getRange(row, 2, 1, 3).setValues([[json, ts, by]]);
    }
    return { result: 'success', key: key, updated_at: ts };
  } finally {
    lock.releaseLock();
  }
}

function setMany_(items, updatedBy) {
  if (!items || !items.length) return { result: 'error', message: 'no items' };
  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (e) { return { result: 'error', message: 'busy' }; }
  try {
    var sh = getSheet_();
    var ts = new Date().toISOString();
    var by = updatedBy || '';
    items.forEach(function (item) {
      if (!item.key) return;
      var row = findRow_(sh, item.key);
      var json = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
      if (row < 0) sh.appendRow([item.key, json, ts, by]);
      else sh.getRange(row, 2, 1, 3).setValues([[json, ts, by]]);
    });
    return { result: 'success', count: items.length, updated_at: ts };
  } finally {
    lock.releaseLock();
  }
}

function deleteKey_(key) {
  if (!key) return { result: 'error', message: 'missing key' };
  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (e) { return { result: 'error', message: 'busy' }; }
  try {
    var sh = getSheet_();
    var row = findRow_(sh, key);
    if (row > 0) sh.deleteRow(row);
    return { result: 'success', deleted: row > 0 };
  } finally {
    lock.releaseLock();
  }
}
