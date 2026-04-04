/**
 * Google Apps Script — מיומנויות לחיים | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "מיומנויות לחיים — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupSkillsSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL ושימי אותו ב-APPS_SCRIPT_URL בקובץ skills.html
 */

var SHEET_ID = 'YOUR_SHEET_ID_HERE';

var SKILLS = ['comm', 'resp', 'time', 'tikun', 'create'];
var SKILL_NAMES = {
  comm: 'תקשורת אפקטיבית',
  resp: 'אחריות ויוזמה',
  time: 'ניהול זמן ועצמי',
  tikun: 'תיקון עולם',
  create: 'יצירתיות וחדשנות'
};

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getClassAssessments':
        result = getClassAssessments_(e.parameter.cls);
        break;
      case 'getAllClassSummary':
        result = getAllClassSummary_();
        break;
      case 'getMoments':
        result = getMoments_(e.parameter.skill || '', e.parameter.limit || 50);
        break;
      default:
        result = { result: 'ok', message: 'skills API active' };
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
      case 'saveAssessments':
        result = saveAssessments_(data.cls, data.students);
        break;
      case 'saveMoment':
        result = saveMoment_(data.moment);
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
// READ — getClassAssessments
// ============================================

function getClassAssessments_(cls) {
  if (!cls) return { result: 'error', message: 'missing class' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('הערכות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', students: [] };

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== cls) continue;
    students.push({
      name: data[i][1],
      skills: {
        comm: data[i][2] || 0,
        resp: data[i][3] || 0,
        time: data[i][4] || 0,
        tikun: data[i][5] || 0,
        create: data[i][6] || 0
      },
      note: data[i][7] || '',
      lastUpdate: data[i][8] || ''
    });
  }

  return { result: 'success', students: students };
}

// ============================================
// READ — getAllClassSummary (for dashboard)
// ============================================

function getAllClassSummary_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('הערכות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', summary: {} };

  var data = sheet.getDataRange().getValues();
  var classes = {};

  for (var i = 1; i < data.length; i++) {
    var cls = data[i][0];
    if (!cls) continue;
    if (!classes[cls]) {
      classes[cls] = { count: 0, sums: { comm: 0, resp: 0, time: 0, tikun: 0, create: 0 }, leaders: 0 };
    }
    classes[cls].count++;
    SKILLS.forEach(function(sk, idx) {
      var val = data[i][idx + 2] || 0;
      classes[cls].sums[sk] += val;
      if (val === 4) classes[cls].leaders++;
    });
  }

  // Calculate averages
  var summary = {};
  for (var c in classes) {
    summary[c] = {
      count: classes[c].count,
      leaders: classes[c].leaders,
      avgs: {}
    };
    SKILLS.forEach(function(sk) {
      summary[c].avgs[sk] = classes[c].count > 0
        ? (classes[c].sums[sk] / classes[c].count).toFixed(1)
        : 0;
    });
  }

  return { result: 'success', summary: summary };
}

// ============================================
// READ — getMoments
// ============================================

function getMoments_(skillFilter, limit) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('רגעי מיומנות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', moments: [] };

  var data = sheet.getDataRange().getValues();
  var moments = [];

  for (var i = data.length - 1; i >= 1 && moments.length < limit; i--) {
    if (skillFilter && data[i][4] !== skillFilter) continue;
    moments.push({
      date: data[i][0],
      teacher: data[i][1],
      cls: data[i][2],
      subject: data[i][3],
      skill: data[i][4],
      desc: data[i][5],
      students: data[i][6] || ''
    });
  }

  return { result: 'success', moments: moments };
}

// ============================================
// WRITE — saveAssessments
// ============================================

function saveAssessments_(cls, students) {
  if (!cls || !students) return { result: 'error', message: 'missing data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('הערכות');
  if (!sheet) return { result: 'error', message: 'missing sheet' };

  // Delete existing rows for this class
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === cls) {
      sheet.deleteRow(i + 1);
    }
  }

  // Write new rows
  var rows = [];
  students.forEach(function(st) {
    rows.push([
      cls,
      st.name,
      st.skills.comm || 0,
      st.skills.resp || 0,
      st.skills.time || 0,
      st.skills.tikun || 0,
      st.skills.create || 0,
      st.note || '',
      new Date()
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  logAction_(ss, 'assessment', cls + ' — ' + rows.length + ' students');
  return { result: 'success', message: 'Saved ' + rows.length + ' assessments for ' + cls };
}

// ============================================
// WRITE — saveMoment
// ============================================

function saveMoment_(moment) {
  if (!moment || !moment.desc) return { result: 'error', message: 'missing moment data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('רגעי מיומנות');
  if (!sheet) return { result: 'error', message: 'missing sheet' };

  sheet.appendRow([
    new Date(),
    moment.teacher || '',
    moment.cls || '',
    moment.subject || '',
    moment.skill || '',
    moment.desc,
    moment.students || ''
  ]);

  logAction_(ss, 'moment', (moment.teacher || '') + ' — ' + (SKILL_NAMES[moment.skill] || moment.skill));
  return { result: 'success', message: 'Moment saved' };
}

// ============================================
// HELPERS
// ============================================

function logAction_(ss, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupSkillsSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. הערכות — טבלת הערכות מיומנויות לכל תלמיד
  var assess = getOrCreate_(ss, 'הערכות');
  if (assess.getLastRow() === 0) {
    assess.appendRow([
      'כיתה', 'שם תלמיד/ה',
      'תקשורת (1-4)', 'אחריות (1-4)', 'ניהול זמן (1-4)',
      'תיקון עולם (1-4)', 'יצירתיות (1-4)',
      'הערת מורה', 'עדכון אחרון'
    ]);
    assess.getRange(1, 1, 1, 9).setFontWeight('bold');
    assess.setFrozenRows(1);
    assess.setColumnWidth(2, 150);
    assess.setColumnWidth(8, 200);
  }

  // 2. רגעי מיומנות — תיעוד רגעים מהשיעורים
  var moments = getOrCreate_(ss, 'רגעי מיומנות');
  if (moments.getLastRow() === 0) {
    moments.appendRow(['תאריך', 'מורה', 'כיתה', 'מקצוע', 'מיומנות', 'תיאור', 'תלמידים']);
    moments.getRange(1, 1, 1, 7).setFontWeight('bold');
    moments.setFrozenRows(1);
    moments.setColumnWidth(6, 300);
  }

  // 3. פורטפוליו — קישורים לעדויות מיומנות
  var portfolio = getOrCreate_(ss, 'פורטפוליו');
  if (portfolio.getLastRow() === 0) {
    portfolio.appendRow(['כיתה', 'שם תלמיד/ה', 'מיומנות', 'סוג עדות', 'תיאור', 'קישור', 'תאריך']);
    portfolio.getRange(1, 1, 1, 7).setFontWeight('bold');
    portfolio.setFrozenRows(1);
  }

  // 4. Self-Assessment — שאלוני עצמי חודשיים
  var selfAssess = getOrCreate_(ss, 'הערכה עצמית');
  if (selfAssess.getLastRow() === 0) {
    selfAssess.appendRow([
      'תאריך', 'כיתה', 'שם תלמיד/ה',
      'תקשורת (1-4)', 'אחריות (1-4)', 'ניהול זמן (1-4)',
      'תיקון עולם (1-4)', 'יצירתיות (1-4)',
      'מה עשיתי הכי טוב?', 'מה אשפר?'
    ]);
    selfAssess.getRange(1, 1, 1, 10).setFontWeight('bold');
    selfAssess.setFrozenRows(1);
  }

  // 5. לוג
  var log = getOrCreate_(ss, 'לוג');
  if (log.getLastRow() === 0) {
    log.appendRow(['תאריך', 'פעולה', 'פרטים']);
    log.getRange(1, 1, 1, 3).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('מערכת מיומנויות — כל הטאבים נוצרו!');
  Logger.log('טאבים: הערכות, רגעי מיומנות, פורטפוליו, הערכה עצמית, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
