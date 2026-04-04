/**
 * Google Apps Script — מערכת קבלת תלמידים | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "קבלת תלמידים תשפ"ז — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupAdmissionSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL ושימי אותו ב-APPS_SCRIPT_URL בקובץ student-admission.html
 */

var SHEET_ID = '1FZO-uQplURi_6rYzvkUJ9mrZBC0kAlX89ziokn3VOW8';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getLeads':
        result = getLeads_();
        break;
      case 'getInterview':
        result = getInterview_(e.parameter.leadId);
        break;
      case 'getChecklist':
        result = getChecklist_(e.parameter.leadId);
        break;
      case 'getStudentNotes':
        result = getStudentNotes_(e.parameter.leadId);
        break;
      case 'getIntros':
        result = getIntros_();
        break;
      default:
        result = { result: 'ok', message: 'admission API active' };
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
      case 'saveLead':
        result = saveLead_(data.lead);
        break;
      case 'deleteLead':
        result = deleteLead_(data.leadId);
        break;
      case 'saveInterview':
        result = saveInterview_(data.interview);
        break;
      case 'saveChecklist':
        result = saveChecklist_(data.leadId, data.items);
        break;
      case 'saveNote':
        result = saveNote_(data.leadId, data.note);
        break;
      case 'saveIntro':
        result = saveIntro_(data.intro);
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
// LEADS — read/write/delete
// ============================================

function getLeads_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('לידים');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', leads: [] };
  var data = sheet.getDataRange().getValues();
  var leads = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    leads.push({
      id: data[i][0],
      firstName: data[i][1] || '',
      lastName: data[i][2] || '',
      phone: data[i][3] || '',
      phone2: data[i][4] || '',
      source: data[i][5] || '',
      track: data[i][6] || '',
      status: data[i][7] || 'new',
      handler: data[i][8] || '',
      notes: data[i][9] || '',
      createdAt: data[i][10] || '',
      updatedAt: data[i][11] || ''
    });
  }
  return { result: 'success', leads: leads };
}

function saveLead_(lead) {
  if (!lead) return { result: 'error', message: 'missing lead data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('לידים');
  if (!sheet) return { result: 'error', message: 'missing leads sheet' };

  var id = lead.id || ('L' + Date.now());
  var now = new Date();

  // Check if exists
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { rowIndex = i + 1; break; }
  }

  var row = [
    id,
    lead.firstName || '',
    lead.lastName || '',
    lead.phone || '',
    lead.phone2 || '',
    lead.source || '',
    lead.track || '',
    lead.status || 'new',
    lead.handler || '',
    lead.notes || '',
    rowIndex > 0 ? data[rowIndex - 1][10] : now, // createdAt — keep original
    now // updatedAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  logAction_(ss, 'lead', id, 'save', lead.firstName + ' ' + lead.lastName);
  return { result: 'success', id: id, message: 'Lead saved' };
}

function deleteLead_(leadId) {
  if (!leadId) return { result: 'error', message: 'missing leadId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('לידים');
  if (!sheet) return { result: 'error', message: 'missing leads sheet' };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === leadId) {
      sheet.deleteRow(i + 1);
      logAction_(ss, 'lead', leadId, 'delete', '');
      return { result: 'success', message: 'Lead deleted' };
    }
  }
  return { result: 'error', message: 'lead not found' };
}

// ============================================
// INTRO FORMS — read/write
// ============================================

function getIntros_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('הכרת ביה"ס');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', intros: [] };
  var data = sheet.getDataRange().getValues();
  var intros = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    intros.push({
      id: data[i][0],
      studentName: data[i][1] || '',
      interests: data[i][2] || '',
      important: data[i][3] || '',
      concerns: data[i][4] || '',
      track: data[i][5] || '',
      parentName: data[i][6] || '',
      expectations: data[i][7] || '',
      parentConcerns: data[i][8] || '',
      parentPhone: data[i][9] || '',
      createdAt: data[i][10] || ''
    });
  }
  return { result: 'success', intros: intros };
}

function saveIntro_(intro) {
  if (!intro) return { result: 'error', message: 'missing intro data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('הכרת ביה"ס');
  if (!sheet) return { result: 'error', message: 'missing intro sheet' };

  var id = intro.id || ('I' + Date.now());
  sheet.appendRow([
    id,
    intro.studentName || '',
    intro.interests || '',
    intro.important || '',
    intro.concerns || '',
    intro.track || '',
    intro.parentName || '',
    intro.expectations || '',
    intro.parentConcerns || '',
    intro.parentPhone || '',
    new Date()
  ]);

  logAction_(ss, 'intro', id, 'save', intro.studentName);
  return { result: 'success', id: id, message: 'Intro form saved' };
}

// ============================================
// INTERVIEW — read/write
// ============================================

function getInterview_(leadId) {
  if (!leadId) return { result: 'error', message: 'no leadId' };
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ראיונות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', interview: null };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === leadId) {
      var interview = {};
      for (var c = 0; c < headers.length; c++) {
        interview[headers[c]] = data[i][c];
      }
      return { result: 'success', interview: interview };
    }
  }
  return { result: 'success', interview: null };
}

function saveInterview_(interview) {
  if (!interview) return { result: 'error', message: 'missing interview data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('ראיונות');
  if (!sheet) return { result: 'error', message: 'missing interview sheet' };

  var id = interview.id || ('INT' + Date.now());
  var now = new Date();

  // Fields in order matching the sheet headers
  var fields = [
    'id', 'intFirstName', 'intLastName', 'intIdNum', 'intAge', 'intBirthDate', 'intBirthCountry', 'intTrack',
    'intCity', 'intStreet', 'intApt', 'intZip', 'intHomePhone', 'intMobile',
    'intFatherName', 'intFatherId', 'intFatherPhone', 'intFatherBirth', 'intFatherCountry', 'intFatherEdu', 'intFatherWork', 'intFatherEmail',
    'intMotherName', 'intMotherId', 'intMotherPhone', 'intMotherBirth', 'intMotherCountry', 'intMotherEdu', 'intMotherWork', 'intMotherEmail',
    'intFamilyStatus', 'intSiblings', 'intBirthOrder', 'intEconomic', 'intHousing', 'intRooms', 'intEntitlements',
    'intLastSchool', 'intCertificate', 'intClassType', 'intMeds', 'intMedsType', 'intDiagnosis', 'intDiagType', 'intPlacement',
    'intPrevContactName', 'intPrevContactPhone', 'intPrevOpinion',
    'intReferrerName', 'intReferrerPhone', 'intKabs', 'intKabsPhone', 'intKabsNotes',
    'intAcademic', 'intTherapy', 'intSocial', 'intFamily', 'intHealth',
    'intMotivation', 'intDream', 'intParentView',
    'chkBounds', 'chkRegistrar', 'chkHomeroom', 'chkCoordination', 'chkGradual',
    'intRecommendations', 'intPresent', 'intImpression', 'intDecision',
    'createdAt', 'updatedAt'
  ];

  // Build row
  var row = fields.map(function(f) {
    if (f === 'id') return id;
    if (f === 'createdAt') return interview.createdAt || now;
    if (f === 'updatedAt') return now;
    return interview[f] !== undefined ? interview[f] : '';
  });

  // Check if exists
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { rowIndex = i + 1; break; }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  logAction_(ss, 'interview', id, 'save', (interview.intFirstName || '') + ' ' + (interview.intLastName || ''));
  return { result: 'success', id: id, message: 'Interview saved' };
}

// ============================================
// CHECKLIST — read/write
// ============================================

function getChecklist_(leadId) {
  if (!leadId) return { result: 'error', message: 'no leadId' };
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('קליטה');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', items: {} };

  var data = sheet.getDataRange().getValues();
  var items = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === leadId) {
      var idx = data[i][1];
      items[idx] = {
        done: data[i][2] === true || data[i][2] === 'TRUE',
        responsible: data[i][3] || '',
        date: data[i][4] || ''
      };
    }
  }
  return { result: 'success', items: items };
}

function saveChecklist_(leadId, items) {
  if (!leadId || !items) return { result: 'error', message: 'missing data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('קליטה');
  if (!sheet) return { result: 'error', message: 'missing checklist sheet' };

  // Delete existing rows for this student
  deleteRowsByCol_(sheet, 0, leadId);

  // Write new rows
  var rows = [];
  for (var idx in items) {
    var item = items[idx];
    rows.push([
      leadId,
      parseInt(idx),
      item.done ? true : false,
      item.responsible || '',
      item.date || '',
      new Date()
    ]);
  }
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  logAction_(ss, 'checklist', leadId, 'save', rows.length + ' items');
  return { result: 'success', message: 'Checklist saved' };
}

// ============================================
// STUDENT NOTES — read/write
// ============================================

function getStudentNotes_(leadId) {
  if (!leadId) return { result: 'error', message: 'no leadId' };
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('הערות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', notes: [] };

  var data = sheet.getDataRange().getValues();
  var notes = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === leadId) {
      notes.push({
        text: data[i][1] || '',
        author: data[i][2] || '',
        date: data[i][3] || ''
      });
    }
  }
  return { result: 'success', notes: notes };
}

function saveNote_(leadId, note) {
  if (!leadId || !note) return { result: 'error', message: 'missing data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('הערות');
  if (!sheet) return { result: 'error', message: 'missing notes sheet' };

  sheet.appendRow([
    leadId,
    note.text || '',
    note.author || '',
    new Date()
  ]);

  logAction_(ss, 'note', leadId, 'add', note.text.substring(0, 50));
  return { result: 'success', message: 'Note saved' };
}

// ============================================
// HELPERS
// ============================================

function deleteRowsByCol_(sheet, colIdx, value) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][colIdx] === value) {
      sheet.deleteRow(i + 1);
    }
  }
}

function logAction_(ss, entity, entityId, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), entity, entityId, action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupAdmissionSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. לידים
  var l = getOrCreate_(ss, 'לידים');
  if (l.getLastRow() === 0) {
    l.appendRow(['מזהה', 'שם פרטי', 'שם משפחה', 'טלפון', 'טלפון נוסף', 'ערוץ גיוס', 'מגמה', 'סטטוס', 'מי טיפל', 'הערות', 'תאריך יצירה', 'עדכון אחרון']);
    l.getRange(1, 1, 1, 12).setFontWeight('bold');
    l.setFrozenRows(1);
  }

  // 2. הכרת בית הספר
  var intro = getOrCreate_(ss, 'הכרת ביה"ס');
  if (intro.getLastRow() === 0) {
    intro.appendRow(['מזהה', 'שם תלמיד', 'תחומי עניין', 'מה חשוב', 'חששות', 'מגמה', 'שם הורה', 'ציפיות', 'חששות הורים', 'טלפון הורה', 'תאריך']);
    intro.getRange(1, 1, 1, 11).setFontWeight('bold');
    intro.setFrozenRows(1);
  }

  // 3. ראיונות
  var iv = getOrCreate_(ss, 'ראיונות');
  if (iv.getLastRow() === 0) {
    var headers = [
      'מזהה', 'שם פרטי', 'שם משפחה', 'ת.ז.', 'גיל', 'תאריך לידה', 'ארץ לידה', 'מגמה',
      'עיר', 'רחוב', 'דירה', 'מיקוד', 'טלפון בית', 'נייד',
      'שם אב', 'ת.ז. אב', 'נייד אב', 'ת.לידה אב', 'ארץ אב', 'השכלה אב', 'עבודה אב', 'מייל אב',
      'שם אם', 'ת.ז. אם', 'נייד אם', 'ת.לידה אם', 'ארץ אם', 'השכלה אם', 'עבודה אם', 'מייל אם',
      'מצב משפחתי', 'אחים', 'מקום במשפחה', 'מצב כלכלי', 'דיור', 'חדרים', 'זכאויות',
      'ביה"ס אחרון', 'תעודה', 'סוג כיתה', 'תרופתי', 'סוג תרופתי', 'אבחון', 'סוג אבחון', 'השמה',
      'קשר ביה"ס קודם', 'טלפון קשר', 'חוו"ד ביה"ס',
      'גורם מפנה', 'טלפון מפנה', 'קב"ס', 'טלפון קב"ס', 'המלצות קב"ס',
      'רקע לימודי', 'רקע טיפולי', 'תפקוד חברתי', 'רקע משפחתי', 'בריאות',
      'מוטיבציה', 'חלום', 'עמדת הורים',
      'בדיקת גבולות', 'רכז רישום', 'קשר מחנכת', 'תיאום', 'תכנית מדורגת',
      'המלצות', 'נוכחים', 'התרשמות', 'החלטה',
      'תאריך יצירה', 'עדכון אחרון'
    ];
    iv.appendRow(headers);
    iv.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    iv.setFrozenRows(1);
  }

  // 4. קליטה (צ'קליסט)
  var cl = getOrCreate_(ss, 'קליטה');
  if (cl.getLastRow() === 0) {
    cl.appendRow(['מזהה ליד', 'מספר פריט', 'בוצע', 'אחראי', 'תאריך', 'עדכון']);
    cl.getRange(1, 1, 1, 6).setFontWeight('bold');
    cl.setFrozenRows(1);
  }

  // 5. הערות
  var n = getOrCreate_(ss, 'הערות');
  if (n.getLastRow() === 0) {
    n.appendRow(['מזהה ליד', 'הערה', 'כותב', 'תאריך']);
    n.getRange(1, 1, 1, 4).setFontWeight('bold');
    n.setFrozenRows(1);
  }

  // 6. לוג
  var log = getOrCreate_(ss, 'לוג');
  if (log.getLastRow() === 0) {
    log.appendRow(['תאריך', 'סוג', 'מזהה', 'פעולה', 'פרטים']);
    log.getRange(1, 1, 1, 5).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: לידים, הכרת ביה"ס, ראיונות, קליטה, הערות, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
