/**
 * Google Apps Script — מערכת שעות | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet (אותו Sheet של CRM או חדש)
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupTimetableSheets() פעם אחת — ייצור את כל הטאבים
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL — זה ה-endpoint
 */

var SHEET_ID = '1ZHK6BNOlAR4F-CaJNT4XEiGiaRfIDLGiuqk5pfwiDi8';

// PIN codes — שנו לפי הצורך
var ADMIN_PINS = {
  '2024': 'מיטל',
  '2025': 'רוית'
};

var CLASSES = ['ט1','ט2','י1','י2','י3','יא1','יא2','יא3','יב1','יב2','יב3'];
var DAYS = ['ראשון','שני','שלישי','רביעי','חמישי'];

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;

    switch(action) {
      case 'getTimetable':
        result = getTimetable_();
        break;
      case 'getAbsences':
        result = getAbsences_(e.parameter.from, e.parameter.to);
        break;
      case 'verifyPin':
        result = verifyPin_(e.parameter.pin);
        break;
      case 'saveCell':
        result = requirePin_(e.parameter.pin, function(admin) {
          return saveCell_(e.parameter.day, e.parameter.cls, e.parameter.lesson, e.parameter.value, admin);
        });
        break;
      case 'saveAbsence':
        result = requirePin_(e.parameter.pin, function(admin) {
          return saveAbsence_(e.parameter.teacher, e.parameter.date, e.parameter.type, e.parameter.lessons, e.parameter.reason, admin);
        });
        break;
      case 'deleteAbsence':
        result = requirePin_(e.parameter.pin, function(admin) {
          return deleteAbsence_(e.parameter.teacher, e.parameter.date);
        });
        break;
      case 'saveSub':
        result = requirePin_(e.parameter.pin, function(admin) {
          return saveSub_(e.parameter, admin);
        });
        break;
      case 'saveTeacher':
        result = requirePin_(e.parameter.pin, function(admin) {
          return saveTeacher_(e.parameter.name, e.parameter.color, e.parameter.phone);
        });
        break;
      default:
        result = { result: 'ok', message: 'timetable API active' };
    }

    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch(err) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ result: 'error', message: err.toString().substring(0, 200) }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';
    var result;

    switch(action) {
      case 'saveTimetable':
        result = requirePin_(data.pin, function(admin) {
          return saveTimetable_(data.timetable, admin);
        });
        break;
      default:
        result = { result: 'error', message: 'unknown action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString().substring(0, 200) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// PIN Verification
// ============================================

function verifyPin_(pin) {
  if (!pin) return { result: 'error', message: 'no pin' };
  var admin = ADMIN_PINS[pin];
  if (admin) return { result: 'success', admin: admin };
  return { result: 'error', message: 'invalid pin' };
}

function requirePin_(pin, action) {
  var admin = ADMIN_PINS[pin];
  if (!admin) return { result: 'error', message: 'PIN שגוי' };
  return action(admin);
}

// ============================================
// READ — getTimetable
// ============================================

function getTimetable_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Read timetable
  var timetable = {};
  var ttSheet = ss.getSheetByName('מערכת_שעות');
  if (ttSheet && ttSheet.getLastRow() > 1) {
    var ttData = ttSheet.getDataRange().getValues();
    for (var i = 1; i < ttData.length; i++) {
      var day = ttData[i][0];
      var cls = ttData[i][1];
      if (!day || !cls) continue;
      if (!timetable[day]) timetable[day] = {};
      if (!timetable[day][cls]) timetable[day][cls] = {};
      for (var l = 1; l <= 8; l++) {
        var val = ttData[i][l + 1]; // columns C-J = lessons 1-8
        if (val && String(val).trim()) {
          timetable[day][cls][l] = String(val).trim();
        }
      }
    }
  }

  // Read teachers
  var teachers = {};
  var tSheet = ss.getSheetByName('מורים');
  if (tSheet && tSheet.getLastRow() > 1) {
    var tData = tSheet.getDataRange().getValues();
    for (var j = 1; j < tData.length; j++) {
      if (tData[j][0]) teachers[tData[j][0]] = { color: tData[j][1] || '', phone: tData[j][2] || '' };
    }
  }

  // Read today's absences
  var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
  var absences = [];
  var aSheet = ss.getSheetByName('העדרויות');
  if (aSheet && aSheet.getLastRow() > 1) {
    var aData = aSheet.getDataRange().getValues();
    for (var k = 1; k < aData.length; k++) {
      var absDate = aData[k][1];
      if (absDate instanceof Date) absDate = Utilities.formatDate(absDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
      else absDate = String(absDate).substring(0, 10);
      if (absDate === today) {
        absences.push({
          teacher: aData[k][0],
          date: absDate,
          type: aData[k][2] || 'יום_מלא',
          lessons: aData[k][3] ? String(aData[k][3]) : '',
          reason: aData[k][4] || ''
        });
      }
    }
  }

  // Read today's subs
  var subs = [];
  var sSheet = ss.getSheetByName('מילויים');
  if (sSheet && sSheet.getLastRow() > 1) {
    var sData = sSheet.getDataRange().getValues();
    for (var m = 1; m < sData.length; m++) {
      var subDate = sData[m][0];
      if (subDate instanceof Date) subDate = Utilities.formatDate(subDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
      else subDate = String(subDate).substring(0, 10);
      if (subDate === today) {
        subs.push({
          date: subDate,
          day: sData[m][1],
          lesson: Number(sData[m][2]),
          cls: sData[m][3],
          absentTeacher: sData[m][4],
          subTeacher: sData[m][5],
          materials: sData[m][6] || ''
        });
      }
    }
  }

  // Lesson times
  var lessonTimes = {
    1:'08:30–09:15', 2:'09:20–10:05', 3:'10:10–10:55', 4:'11:05–11:50',
    5:'11:55–12:40', 6:'12:45–13:30', 7:'13:35–14:20', 8:'14:25–15:10'
  };

  return {
    result: 'success',
    timetable: timetable,
    teachers: teachers,
    absences: absences,
    substitutions: subs,
    lessonTimes: lessonTimes
  };
}

// ============================================
// READ — getAbsences (date range)
// ============================================

function getAbsences_(from, to) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('העדרויות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', absences: [] };

  var data = sheet.getDataRange().getValues();
  var absences = [];
  for (var i = 1; i < data.length; i++) {
    var d = data[i][1];
    if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Jerusalem', 'yyyy-MM-dd');
    else d = String(d).substring(0, 10);
    if ((!from || d >= from) && (!to || d <= to)) {
      absences.push({
        teacher: data[i][0],
        date: d,
        type: data[i][2] || 'יום_מלא',
        lessons: data[i][3] ? String(data[i][3]) : '',
        reason: data[i][4] || '',
        enteredBy: data[i][5] || ''
      });
    }
  }
  return { result: 'success', absences: absences };
}

// ============================================
// WRITE — saveCell (single cell edit)
// ============================================

function saveCell_(day, cls, lesson, value, admin) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מערכת_שעות');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  var data = sheet.getDataRange().getValues();
  var lessonCol = Number(lesson) + 2; // lesson 1 = col C (index 2)

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === day && data[i][1] === cls) {
      sheet.getRange(i + 1, lessonCol + 1).setValue(value || '');
      return { result: 'success', message: 'cell saved' };
    }
  }

  // Row doesn't exist — create it
  var newRow = [day, cls];
  for (var l = 1; l <= 8; l++) {
    newRow.push(l == lesson ? (value || '') : '');
  }
  sheet.appendRow(newRow);
  return { result: 'success', message: 'row created' };
}

// ============================================
// WRITE — saveTimetable (full replace via POST)
// ============================================

function saveTimetable_(timetable, admin) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מערכת_שעות');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  // Clear data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).clearContent();
  }

  // Write all rows
  var rows = [];
  DAYS.forEach(function(day) {
    if (!timetable[day]) return;
    CLASSES.forEach(function(cls) {
      var lessons = timetable[day][cls] || {};
      var row = [day, cls];
      for (var l = 1; l <= 8; l++) {
        row.push(lessons[l] || '');
      }
      rows.push(row);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }
  return { result: 'success', message: rows.length + ' rows saved by ' + admin };
}

// ============================================
// WRITE — absences
// ============================================

function saveAbsence_(teacher, date, type, lessons, reason, admin) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('העדרויות');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  sheet.appendRow([teacher, date, type || 'יום_מלא', lessons || '', reason || '', admin, new Date()]);
  return { result: 'success', message: 'absence saved' };
}

function deleteAbsence_(teacher, date) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('העדרויות');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var d = data[i][1];
    if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Jerusalem', 'yyyy-MM-dd');
    else d = String(d).substring(0, 10);
    if (data[i][0] === teacher && d === date) {
      sheet.deleteRow(i + 1);
      return { result: 'success', message: 'deleted' };
    }
  }
  return { result: 'error', message: 'not found' };
}

// ============================================
// WRITE — substitutions
// ============================================

function saveSub_(params, admin) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מילויים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  sheet.appendRow([
    params.date || Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd'),
    params.day || '',
    Number(params.lesson) || 0,
    params.cls || '',
    params.absent || '',
    params.sub || '',
    params.materials || '',
    admin,
    new Date()
  ]);
  return { result: 'success', message: 'sub saved' };
}

// ============================================
// WRITE — teacher management
// ============================================

function saveTeacher_(name, color, phone) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('מורים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  // Check if teacher exists — update
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      if (color) sheet.getRange(i + 1, 2).setValue(color);
      if (phone) sheet.getRange(i + 1, 3).setValue(phone);
      return { result: 'success', message: 'updated' };
    }
  }

  // New teacher
  sheet.appendRow([name, color || '#888888', phone || '']);
  return { result: 'success', message: 'added' };
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupTimetableSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Tab 1: מערכת_שעות
  var tt = getOrCreate_(ss, 'מערכת_שעות');
  if (tt.getLastRow() === 0) {
    tt.appendRow(['יום','כיתה','שעה 1','שעה 2','שעה 3','שעה 4','שעה 5','שעה 6','שעה 7','שעה 8']);
    tt.getRange(1, 1, 1, 10).setFontWeight('bold');
    tt.setFrozenRows(1);
  }

  // Tab 2: מורים
  var t = getOrCreate_(ss, 'מורים');
  if (t.getLastRow() === 0) {
    t.appendRow(['שם','צבע','טלפון']);
    t.getRange(1, 1, 1, 3).setFontWeight('bold');
    t.setFrozenRows(1);
  }

  // Tab 3: העדרויות
  var a = getOrCreate_(ss, 'העדרויות');
  if (a.getLastRow() === 0) {
    a.appendRow(['מורה','תאריך','סוג','שעות','סיבה','הוזן ע"י','חותמת זמן']);
    a.getRange(1, 1, 1, 7).setFontWeight('bold');
    a.setFrozenRows(1);
  }

  // Tab 4: מילויים
  var s = getOrCreate_(ss, 'מילויים');
  if (s.getLastRow() === 0) {
    s.appendRow(['תאריך','יום','שעה','כיתה','מורה נעדר','מחליפ/ה','חומרים','הוזן ע"י','חותמת זמן']);
    s.getRange(1, 1, 1, 9).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('עכשיו הריצי populateInitialData() למילוי הנתונים');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}

// ============================================
// POPULATE — מילוי נתונים ראשוני מה-TIMETABLE הקיים
// ============================================

function populateInitialData() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Timetable data — copied from the existing HTML
  var DATA = {
    'ראשון': {
      'ט1': {1:'חינוך — משה',2:'חינוך — משה',4:'תנ"ך — משה',5:'הבעה עברית — אופירה',6:'הבעה עברית — אופירה'},
      'ט2': {1:'חינוך — אושר',2:'חינוך — אושר',4:'אזרחות — אושר',5:'מתמטיקה — נעמה',6:'מתמטיקה — נעמה'},
      'י1': {1:'חינוך — רעיה',2:'חינוך — רעיה',4:'היסטוריה — רעיה',5:'מתמטיקה — אושר',6:'מתמטיקה — אושר'},
      'י2': {1:'חינוך — אופירה',2:'כישורי חיים — אופירה ודורית',4:'מייקרס — מירב',5:'אזרחות — משה',6:'אזרחות — משה'},
      'י3': {1:'כישורי חיים — פרלה ודורית',2:'חינוך — פרלה',4:'עברית — אפרת',5:'מייקרס — מירב',6:'מייקרס — מירב'},
      'יא1': {1:'חינוך — יעקב',2:'כישורי חיים — יעקב וליאת',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יא2': {1:'חינוך — נעמה',2:'מייקרס — מירב ונעמה',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יא3': {1:'חינוך — גיא',2:'חינוך — גיא',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יב1': {1:'כישורי חיים — יוסי וצהי',2:'חינוך — יוסי',4:'מתמטיקה — רווית',5:'ספרות — ויקי',6:'ספרות — ויקי'},
      'יב2': {1:'חינוך — יואב',2:'כישורי חיים — יואב וצהי',4:'אזרחות — יואב',5:'עברית — גיא',6:'עברית — גיא'},
      'יב3': {1:'מתמטיקה — ויקי',2:'מתמטיקה — ויקי',4:'ספרות — ויקי',5:'תנ"ך — יואב',6:'תנ"ך — יואב'}
    },
    'שני': {
      'ט1': {1:'מגמות',2:'מגמות',3:'מתמטיקה — נעמה',4:'מתמטיקה — נעמה ומשה',5:'כישורי חיים — דורית ומשה',6:'חינוך — משה',7:'מתמטיקה — נעמה'},
      'ט2': {},
      'י1': {1:'ספרות — רעיה',2:'ספרות — רעיה',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות',7:'מבוא לטכנולוגיה — יואב'},
      'י2': {1:'אסטרטגיות למידה — יעל ומשה',2:'אסטרטגיות למידה — יעל ומשה',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות',7:'מתמטיקה — שמעון'},
      'י3': {1:'מתמטיקה — אושר',2:'מתמטיקה — אושר',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות',7:'מבוא לטכנולוגיה — יואב'},
      'יא1': {1:'מתמטיקה — רווית',2:'מתמטיקה — רווית ואושר',3:'תנ"ך — יעקב',4:'לשון — אפרת',5:'מעגלים — יעל ויעקב',6:'לשון — אפרת',7:'מתמטיקה — ויקי'},
      'יא2': {1:'יום תעסוקה',5:'כישורי חיים — נעמה וליאת'},
      'יא3': {1:'לשון — אפרת ושירה',2:'לשון — אפרת ושירה',3:'היסטוריה — גיא',4:'היסטוריה — גיא',5:'מתמטיקה — ויקי ואושר',6:'מעגלים — גיא',7:'עברית — אפרת'},
      'יב1': {},
      'יב2': {},
      'יב3': {1:'מתמטיקה — ויקי',2:'מתמטיקה — ויקי',3:'תנ"ך — יואב',4:'תנ"ך — יואב',5:'חינוך — מנו',6:'כישורי חיים — מנו וצהי'}
    },
    'שלישי': {
      'ט1': {2:'תנ"ך — משה',3:'היסטוריה — משה',4:'חינוך פיננסי — גיא',5:'אזרחות — משה',6:'אזרחות — משה'},
      'ט2': {2:'תנ"ך — משה',3:'מתמטיקה — נעמה',4:'מתמטיקה — נעמה'},
      'י1': {2:'מגמות',3:'מדעי הטכנולוגיה — יואב',4:'מדעי הטכנולוגיה — יואב',5:'כישורי חיים — רעיה ודורית',6:'חינוך — רעיה'},
      'י2': {2:'מגמות',3:'הבעה עברית — אופירה',4:'הבעה עברית — אופירה',5:'חינוך פיננסי — גיא',6:'חינוך פיננסי — גיא'},
      'י3': {2:'מגמות',3:'ספרות — רעיה',4:'תנ"ך — רעיה',5:'עברית — אושר',6:'עברית — אושר'},
      'יא1': {2:'היסטוריה — יעקב',3:'אנגלית — מריאן',4:'אנגלית — יהודית',5:'לשון — אפרת',6:'לשון — אפרת'},
      'יא2': {2:'מייקרס — נעמה ומירב',3:'עברית — מירב',4:'עברית — מירב',5:'מעגלים — נעמה ויעל',6:'מדעי הטכנולוגיה — יואב'},
      'יא3': {2:'לשון — אפרת',3:'אנגלית — מריאן',4:'אנגלית — יהודית',5:'מתמטיקה — ויקי',6:'מתמטיקה — ויקי'},
      'יב1': {2:'אנגלית — מריאן',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יב2': {2:'מעגלים — יעל ואושר',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יב3': {2:'אנגלית — מריאן',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות'}
    },
    'רביעי': {
      'ט1': {1:'סלטה — משה',2:'סלטה — משה',3:'חינוך פיננסי — גיא',4:'חינוך פיננסי — גיא',5:'מתמטיקה — נעמה',6:'מתמטיקה — נעמה'},
      'ט2': {3:'חינוך פיננסי — גיא',4:'חינוך פיננסי — גיא',5:'כישורי חיים — אושר וליאת',6:'תנ"ך — אושר'},
      'י1': {1:'עברית — אפרת',2:'תנ"ך — רעיה',3:'עברית — אופירה',4:'עברית — אופירה',5:'ספרות — רעיה',6:'ספרות — רעיה'},
      'י2': {1:'עברית — אופירה',2:'עברית — אופירה',3:'תנ"ך — רעיה',4:'תנ"ך — רעיה',5:'היסטוריה — פרלה',6:'היסטוריה — פרלה'},
      'י3': {1:'מתמטיקה — אושר',2:'מתמטיקה — אושר',3:'היסטוריה — פרלה',4:'היסטוריה — פרלה',5:'חינוך תעבורתי — מנו',6:'אזרחות — פרלה'},
      'יא1': {1:'היסטוריה — יעקב',2:'היסטוריה — יעקב',3:'אנגלית — מריאן',4:'אנגלית — יהודית',5:'מתמטיקה — רווית',6:'מתמטיקה — רווית'},
      'יא2': {1:'חינוך — נעמה',2:'חינוך — נעמה',3:'עברית — מירב',4:'עברית — מירב',5:'חינוך פיננסי — גיא',6:'חינוך פיננסי — גיא'},
      'יא3': {1:'היסטוריה — גיא',2:'היסטוריה — גיא',3:'אנגלית — מריאן',4:'אנגלית — יהודית',5:'תנ"ך — משה',6:'תנ"ך — משה'},
      'יב1': {1:'מתמטיקה — רווית ואפרת',2:'מתמטיקה — רווית ואפרת',3:'מעגלים — יוסי ויעל',4:'אזרחות — אושר',5:'אנגלית — מריאן',6:'אנגלית — יהודית'},
      'יב2': {1:'מגמות',2:'מגמות',3:'מגמות',4:'מגמות',5:'מגמות',6:'מגמות'},
      'יב3': {1:'מתמטיקה — ויקי',2:'מתמטיקה — ויקי',3:'ספרות — ויקי',4:'מעגלים — מנו ויעל',5:'אנגלית — מריאן',6:'אנגלית — יהודית'}
    },
    'חמישי': {
      'ט1': {1:'אזרחות — משה',2:'אזרחות — משה',3:'מייקרס — מירב ומשה',4:'מייקרס — מירב ומשה',5:'מתמטיקה — נעמה',6:'חינוך — משה'},
      'ט2': {1:'אנגלית — מלי',2:'אנגלית — מלי',3:'מתמטיקה — נעמה',4:'חינוך פיננסי — גיא',5:'אזרחות — אושר',6:'חינוך — אושר'},
      'י1': {1:'חינוך פיננסי — גיא',2:'חינוך פיננסי — גיא',3:'אנגלית — מלי',4:'חינוך תעבורתי — מנו',5:'מדעי הטכנולוגיה — יואב',6:'מדעי הטכנולוגיה — יואב'},
      'י2': {1:'מתמטיקה — נעמה',2:'מתמטיקה — נעמה',3:'חינוך תעבורתי — יוסי',4:'אנגלית — מלי',5:'מדעי הטכנולוגיה — יואב',6:'מדעי הטכנולוגיה — יואב'},
      'י3': {1:'מדעי הטכנולוגיה — יואב',2:'מדעי הטכנולוגיה — יואב',3:'חינוך פיננסי — גיא',4:'חינוך תעבורתי — מנו',5:'אנגלית — מלי',6:'אנגלית — מלי'},
      'יא1': {},
      'יא2': {1:'כישורי חיים — אושר וליאת'},
      'יא3': {},
      'יב1': {1:'מגמות'},
      'יב2': {},
      'יב3': {}
    }
  };

  // Write timetable
  var ttSheet = ss.getSheetByName('מערכת_שעות');
  var rows = [];
  ['ראשון','שני','שלישי','רביעי','חמישי'].forEach(function(day) {
    ['ט1','ט2','י1','י2','י3','יא1','יא2','יא3','יב1','יב2','יב3'].forEach(function(cls) {
      var lessons = (DATA[day] || {})[cls] || {};
      var row = [day, cls];
      for (var l = 1; l <= 8; l++) row.push(lessons[l] || '');
      rows.push(row);
    });
  });
  if (ttSheet.getLastRow() > 1) ttSheet.getRange(2, 1, ttSheet.getLastRow() - 1, 10).clearContent();
  ttSheet.getRange(2, 1, rows.length, 10).setValues(rows);

  // Write teachers
  var TEACHERS = {
    'משה':'#5E8DB8','אפרת':'#C06090','אופירה':'#7AA868','אושר':'#D47A35',
    'פרלה':'#8855CC','יעקב':'#3A9999','נעמה':'#D45577','גיא':'#558844',
    'רעיה':'#AA6644','מירב':'#CC5588','מריאן':'#4477AA','יהודית':'#6699CC',
    'בת שבע':'#8899DD','רווית':'#CC7733','שמוליק':'#667788','שי':'#996655',
    'ויקי':'#AA4466','מנו':'#337766','יוסי':'#884499','יואב':'#2288AA',
    'מלי':'#DD7799','ליאת':'#BB9933','דורית':'#8877AA','מאיה':'#CC4444',
    'יעל':'#669944','צהי':'#AA8833','אביעד':'#554488','שירה':'#DD88AA',
    'שמעון':'#556677','אלה':'#779966','לינוי':'#BB6677'
  };
  var tSheet = ss.getSheetByName('מורים');
  var tRows = [];
  for (var name in TEACHERS) {
    tRows.push([name, TEACHERS[name], '']);
  }
  if (tSheet.getLastRow() > 1) tSheet.getRange(2, 1, tSheet.getLastRow() - 1, 3).clearContent();
  tSheet.getRange(2, 1, tRows.length, 3).setValues(tRows);

  Logger.log('נתונים ראשוניים הוזנו — ' + rows.length + ' שורות מערכת, ' + tRows.length + ' מורים');
}
