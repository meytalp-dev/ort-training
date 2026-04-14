/**
 * Google Apps Script — מערכת ניהול בחינות | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "לוח בחינות תשפ"ו — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupExamSheets() פעם אחת
 * 6. הריצי setupExamTriggers() פעם אחת
 * 7. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 8. העתיקי את ה-URL ושימי אותו ב-APPS_SCRIPT_URL בקובץ exam-schedule.html
 */

// ============================================
// Configuration
// ============================================
var SHEET_ID = 'YOUR_SHEET_ID_HERE';

var GREEN_API_INSTANCE = '7107577196';
var GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
var GREEN_API_URL = 'https://7107.api.greenapi.com';
var MESSAGE_DELAY_MS = 2500;

// Management phones (972 format, no +)
var MEYTAL_PHONE = '972536256653';
var RAVIT_PHONE = '972503993021';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getExams':
        result = getExams_(e.parameter.grade);
        break;
      case 'getReview':
        result = getReview_(e.parameter.examId);
        break;
      case 'getGrades':
        result = getGrades_(e.parameter.examId);
        break;
      case 'getConfirmations':
        result = getConfirmations_();
        break;
      default:
        result = { result: 'ok', message: 'exam-management API active' };
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
      case 'saveExam':
        result = saveExam_(data.exam);
        break;
      case 'deleteExam':
        result = deleteExam_(data.examId);
        break;
      case 'saveReview':
        result = saveReview_(data.review);
        break;
      case 'confirmExam':
        result = confirmExam_(data.confirmation);
        break;
      case 'saveGrades':
        result = saveGrades_(data.examId, data.grades, data.teacherName);
        break;
      case 'sendScheduleWhatsApp':
        result = sendScheduleWhatsApp_(data.phones, data.message);
        break;
      case 'sendReviewWhatsApp':
        result = sendReviewWhatsApp_(data.phones, data.message);
        break;
      case 'uploadFile':
        result = uploadFile_(data.fileName, data.fileData, data.mimeType, data.examId);
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
// EXAMS — CRUD
// ============================================

function getExams_(grade) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('בחינות');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', exams: [] };
  var data = sheet.getDataRange().getValues();
  var exams = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var exam = {
      id: data[i][0],
      date: data[i][1],
      subject: data[i][2] || '',
      type: data[i][3] || '',
      time: data[i][4] || '',
      code: data[i][5] || '',
      grade: data[i][6] || '',
      classes: data[i][7] || '',
      teacher: data[i][8] || '',
      teacherPhone: data[i][9] || '',
      notes: data[i][10] || '',
      reminderSent: data[i][11] || false
    };
    if (!grade || exam.grade === grade) {
      exams.push(exam);
    }
  }
  return { result: 'success', exams: exams };
}

function saveExam_(exam) {
  if (!exam) return { result: 'error', message: 'missing exam data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('בחינות');
  if (!sheet) return { result: 'error', message: 'missing exams sheet' };

  var id = exam.id || ('EX' + Date.now());

  // Check if exists
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { rowIndex = i + 1; break; }
  }

  var row = [
    id,
    exam.date || '',
    exam.subject || '',
    exam.type || '',
    exam.time || '',
    exam.code || '',
    exam.grade || '',
    exam.classes || '',
    exam.teacher || '',
    exam.teacherPhone || '',
    exam.notes || '',
    exam.reminderSent || false
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  logAction_(ss, 'saveExam', exam.teacher || 'system', exam.subject + ' / ' + exam.date);
  return { result: 'success', id: id, message: 'Exam saved' };
}

function deleteExam_(examId) {
  if (!examId) return { result: 'error', message: 'missing examId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('בחינות');
  if (!sheet) return { result: 'error', message: 'missing exams sheet' };

  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === examId) {
      sheet.deleteRow(i + 1);
      logAction_(ss, 'deleteExam', 'system', examId);
      return { result: 'success', message: 'Exam deleted' };
    }
  }
  return { result: 'error', message: 'exam not found' };
}

// ============================================
// REVIEW MATERIALS
// ============================================

function getReview_(examId) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('דפי_חזרה');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', reviews: [] };
  var data = sheet.getDataRange().getValues();
  var reviews = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var review = {
      id: data[i][0],
      examId: data[i][1] || '',
      topics: data[i][2] || '',
      links: data[i][3] || '',
      files: data[i][4] || '',
      teacherNotes: data[i][5] || '',
      createdAt: data[i][6] || '',
      updatedAt: data[i][7] || ''
    };
    if (!examId || review.examId === examId) {
      reviews.push(review);
    }
  }
  return { result: 'success', reviews: reviews };
}

function saveReview_(review) {
  if (!review) return { result: 'error', message: 'missing review data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('דפי_חזרה');
  if (!sheet) return { result: 'error', message: 'missing review sheet' };

  var now = new Date();
  var id = review.id || ('RV' + Date.now());

  // Check if exists
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id || (review.examId && data[i][1] === review.examId)) {
      rowIndex = i + 1;
      id = data[i][0]; // keep existing id
      break;
    }
  }

  var row = [
    id,
    review.examId || '',
    review.topics || '',
    review.links || '',
    review.files || '',
    review.teacherNotes || '',
    rowIndex > 0 ? data[rowIndex - 1][6] : now,
    now
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  logAction_(ss, 'saveReview', 'teacher', review.examId);
  return { result: 'success', id: id, message: 'Review saved' };
}

// ============================================
// FILE UPLOAD to Google Drive
// ============================================

function uploadFile_(fileName, fileData, mimeType, examId) {
  if (!fileData || !fileName) return { result: 'error', message: 'missing file data' };

  try {
    // Create or find exam files folder
    var folderName = 'בחינות — אורט בית הערבה';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    // Decode base64 data
    var decoded = Utilities.base64Decode(fileData);
    var blob = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', fileName);

    // Create file in Drive
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileUrl = file.getUrl();
    var downloadUrl = 'https://drive.google.com/uc?export=download&id=' + file.getId();

    logAction_(SpreadsheetApp.openById(SHEET_ID), 'uploadFile', 'teacher', fileName + ' → ' + (examId || 'no-exam'));

    return {
      result: 'success',
      fileUrl: fileUrl,
      downloadUrl: downloadUrl,
      fileName: fileName,
      fileId: file.getId()
    };
  } catch (err) {
    return { result: 'error', message: 'Upload failed: ' + err.toString().substring(0, 200) };
  }
}

// ============================================
// GRADES
// ============================================

function getGrades_(examId) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ציונים');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', grades: [] };
  var data = sheet.getDataRange().getValues();
  var grades = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var g = {
      id: data[i][0],
      examId: data[i][1] || '',
      studentId: data[i][2] || '',
      studentName: data[i][3] || '',
      cls: data[i][4] || '',
      grade: data[i][5],
      hardQuestions: data[i][6] || '',
      easyQuestions: data[i][7] || '',
      notes: data[i][8] || '',
      enteredAt: data[i][9] || ''
    };
    if (!examId || g.examId === examId) {
      grades.push(g);
    }
  }
  return { result: 'success', grades: grades };
}

function saveGrades_(examId, grades, teacherName) {
  if (!examId || !grades || !grades.length) return { result: 'error', message: 'missing grades data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('ציונים');
  if (!sheet) return { result: 'error', message: 'missing grades sheet' };

  var now = new Date();

  // Get existing grades for this exam to update
  var data = sheet.getDataRange().getValues();
  var existingMap = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === examId) {
      existingMap[data[i][2]] = i + 1; // studentId → row number
    }
  }

  var savedCount = 0;
  for (var j = 0; j < grades.length; j++) {
    var g = grades[j];
    if (g.grade === null || g.grade === undefined || g.grade === '') continue;

    var id = 'GR' + Date.now() + '_' + j;
    var row = [
      id,
      examId,
      g.studentId || '',
      g.studentName || '',
      g.cls || '',
      Number(g.grade),
      g.hardQuestions || '',
      g.easyQuestions || '',
      g.notes || '',
      now
    ];

    var existingRow = existingMap[g.studentId];
    if (existingRow) {
      row[0] = data[existingRow - 1][0]; // keep existing id
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    savedCount++;
  }

  // Calculate analytics for WhatsApp summary
  var scores = grades.filter(function(g) { return g.grade !== null && g.grade !== '' && g.grade !== undefined; })
                     .map(function(g) { return Number(g.grade); });

  if (scores.length > 0) {
    var avg = Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);
    var max = Math.max.apply(null, scores);
    var min = Math.min.apply(null, scores);
    var passCount = scores.filter(function(s) { return s >= 55; }).length;
    var failCount = scores.length - passCount;

    // Get exam details
    var examSheet = ss.getSheetByName('בחינות');
    var examData = examSheet.getDataRange().getValues();
    var examInfo = null;
    for (var k = 1; k < examData.length; k++) {
      if (examData[k][0] === examId) {
        examInfo = { subject: examData[k][2], type: examData[k][3], date: examData[k][1], classes: examData[k][7] };
        break;
      }
    }

    var subjectName = examInfo ? examInfo.subject : 'לא ידוע';
    var typeName = examInfo ? examInfo.type : '';
    var className = examInfo ? examInfo.classes : '';

    // Send summary to management
    var summary = '📊 ציונים הוזנו\n'
      + '📝 ' + subjectName + (typeName ? ' (' + typeName + ')' : '') + '\n'
      + '🏫 כיתה: ' + className + '\n'
      + '👨‍🏫 מורה: ' + (teacherName || 'לא צוין') + '\n\n'
      + '📈 ממוצע: ' + avg + '\n'
      + '✅ עוברים: ' + passCount + '/' + scores.length + '\n'
      + '❌ נכשלים: ' + failCount + '\n'
      + '🏆 גבוה: ' + max + '\n'
      + '📉 נמוך: ' + min;

    sendWhatsApp_(MEYTAL_PHONE, summary);
    Utilities.sleep(MESSAGE_DELAY_MS);
    sendWhatsApp_(RAVIT_PHONE, summary);
  }

  logAction_(ss, 'saveGrades', teacherName || 'teacher', examId + ' — ' + savedCount + ' grades');
  return { result: 'success', saved: savedCount, message: savedCount + ' grades saved' };
}

// ============================================
// EXAM CONFIRMATION
// ============================================

function getConfirmations_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('אישורי_בחינה');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', confirmations: [] };
  var data = sheet.getDataRange().getValues();
  var confirmations = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    confirmations.push({
      examId: data[i][0],
      teacher: data[i][1] || '',
      cls: data[i][2] || '',
      examDate: data[i][3] || '',
      confirmedAt: data[i][4] || ''
    });
  }
  return { result: 'success', confirmations: confirmations };
}

function confirmExam_(confirmation) {
  if (!confirmation || !confirmation.examId) return { result: 'error', message: 'missing confirmation data' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('אישורי_בחינה');
  if (!sheet) return { result: 'error', message: 'missing confirmations sheet' };

  var now = new Date();

  // Check if already confirmed
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === confirmation.examId && data[i][2] === confirmation.cls) {
      return { result: 'success', message: 'Already confirmed' };
    }
  }

  sheet.appendRow([
    confirmation.examId,
    confirmation.teacher || '',
    confirmation.cls || '',
    confirmation.examDate || '',
    now
  ]);

  // Send WhatsApp notification to management
  var msg = '✅ בחינה בוצעה\n'
    + '👨‍🏫 מורה: ' + (confirmation.teacher || '') + '\n'
    + '📝 מקצוע: ' + (confirmation.subject || '') + (confirmation.type ? ' (' + confirmation.type + ')' : '') + '\n'
    + '🏫 כיתה: ' + (confirmation.cls || '') + '\n'
    + '📅 תאריך: ' + (confirmation.examDate || '');

  sendWhatsApp_(MEYTAL_PHONE, msg);
  Utilities.sleep(MESSAGE_DELAY_MS);
  sendWhatsApp_(RAVIT_PHONE, msg);

  logAction_(ss, 'confirmExam', confirmation.teacher || 'teacher', confirmation.examId + ' / ' + confirmation.cls);
  return { result: 'success', message: 'Exam confirmed, management notified' };
}

// ============================================
// WHATSAPP SENDING
// ============================================

function sendWhatsApp_(phone, message) {
  if (!phone || !message) return;
  var cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '972' + cleanPhone.substring(1);
  if (!cleanPhone.startsWith('972')) cleanPhone = '972' + cleanPhone;

  var url = GREEN_API_URL + '/waInstance' + GREEN_API_INSTANCE + '/sendMessage/' + GREEN_API_TOKEN;
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chatId: cleanPhone + '@c.us',
        message: message
      }),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log('WhatsApp send error: ' + err.toString());
  }
}

function sendScheduleWhatsApp_(phones, message) {
  if (!phones || !phones.length || !message) return { result: 'error', message: 'missing phones or message' };
  var sent = 0;
  for (var i = 0; i < phones.length; i++) {
    sendWhatsApp_(phones[i], message);
    sent++;
    if (i < phones.length - 1) Utilities.sleep(MESSAGE_DELAY_MS);
  }
  logAction_(SpreadsheetApp.openById(SHEET_ID), 'sendScheduleWA', 'system', sent + ' messages sent');
  return { result: 'success', sent: sent };
}

function sendReviewWhatsApp_(phones, message) {
  if (!phones || !phones.length || !message) return { result: 'error', message: 'missing phones or message' };
  var sent = 0;
  for (var i = 0; i < phones.length; i++) {
    sendWhatsApp_(phones[i], message);
    sent++;
    if (i < phones.length - 1) Utilities.sleep(MESSAGE_DELAY_MS);
  }
  logAction_(SpreadsheetApp.openById(SHEET_ID), 'sendReviewWA', 'system', sent + ' messages sent');
  return { result: 'success', sent: sent };
}

// ============================================
// DAILY REMINDER — Trigger at 18:00
// ============================================

function dailyExamReminder() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('בחינות');
  if (!sheet || sheet.getLastRow() < 2) return;

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = Utilities.formatDate(tomorrow, 'Asia/Jerusalem', 'yyyy-MM-dd');

  var data = sheet.getDataRange().getValues();
  var sentCount = 0;

  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;

    // Check if exam is tomorrow and reminder not sent
    var examDate = data[i][1];
    if (examDate instanceof Date) {
      examDate = Utilities.formatDate(examDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
    }
    if (examDate !== tomorrowStr) continue;
    if (data[i][11] === true || data[i][11] === 'TRUE') continue;

    var subject = data[i][2] || '';
    var type = data[i][3] || '';
    var time = data[i][4] || '';
    var grade = data[i][6] || '';
    var classes = data[i][7] || '';
    var teacher = data[i][8] || '';
    var teacherPhone = data[i][9] || '';

    var dateFormatted = Utilities.formatDate(tomorrow, 'Asia/Jerusalem', 'dd.MM.yyyy');

    // Build student reminder message
    var studentMsg = '📚 תזכורת — מחר יש בחינה!\n\n'
      + '📝 ' + subject + (type ? ' (' + type + ')' : '') + '\n'
      + '📅 ' + dateFormatted + (time ? ' | ⏰ ' + time : '') + '\n'
      + '👨‍🏫 מורה: ' + teacher + '\n\n'
      + 'בהצלחה! 🍀\nאורט בית הערבה';

    // Build teacher reminder message
    var teacherMsg = '📋 תזכורת — מחר יש לך בחינה\n\n'
      + '📝 ' + subject + (type ? ' (' + type + ')' : '') + '\n'
      + '📅 ' + dateFormatted + (time ? ' | ⏰ ' + time : '') + '\n'
      + '🏫 כיתות: ' + classes + '\n\n'
      + 'אורט בית הערבה';

    // Send to teacher
    if (teacherPhone) {
      sendWhatsApp_(teacherPhone, teacherMsg);
      Utilities.sleep(MESSAGE_DELAY_MS);
    }

    // Send to students — load from students sheet or use class matching
    // For now, send to class group. Student phones loaded from client side.
    // TODO: load student phones from a students sheet tab

    // Mark reminder as sent
    sheet.getRange(i + 1, 12).setValue(true);
    sentCount++;
  }

  if (sentCount > 0) {
    logAction_(ss, 'dailyReminder', 'system', sentCount + ' exam reminders sent for ' + tomorrowStr);
  }
}

// ============================================
// HELPERS
// ============================================

function logAction_(ss, action, user, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), action, user, details]);
}

// ============================================
// SETUP — one time
// ============================================

function setupExamSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. בחינות
  var ex = getOrCreate_(ss, 'בחינות');
  if (ex.getLastRow() === 0) {
    ex.appendRow(['מזהה', 'תאריך', 'מקצוע', 'סוג', 'שעה', 'סמל_שאלון', 'שכבה', 'כיתות', 'מורה', 'טלפון_מורה', 'הערות', 'נשלחה_תזכורת']);
    ex.getRange(1, 1, 1, 12).setFontWeight('bold');
    ex.setFrozenRows(1);
  }

  // 2. דפי חזרה
  var rv = getOrCreate_(ss, 'דפי_חזרה');
  if (rv.getLastRow() === 0) {
    rv.appendRow(['מזהה', 'מזהה_בחינה', 'נושאי_לימוד', 'קישורים', 'קבצים', 'הערות_מורה', 'תאריך_יצירה', 'עדכון_אחרון']);
    rv.getRange(1, 1, 1, 8).setFontWeight('bold');
    rv.setFrozenRows(1);
  }

  // 3. ציונים
  var gr = getOrCreate_(ss, 'ציונים');
  if (gr.getLastRow() === 0) {
    gr.appendRow(['מזהה', 'מזהה_בחינה', 'מזהה_תלמיד', 'שם_תלמיד', 'כיתה', 'ציון', 'שאלות_קשות', 'שאלות_קלות', 'הערות', 'תאריך_הזנה']);
    gr.getRange(1, 1, 1, 10).setFontWeight('bold');
    gr.setFrozenRows(1);
  }

  // 4. אישורי בחינה
  var cf = getOrCreate_(ss, 'אישורי_בחינה');
  if (cf.getLastRow() === 0) {
    cf.appendRow(['מזהה_בחינה', 'מורה', 'כיתה', 'תאריך_ביצוע', 'תאריך_אישור']);
    cf.getRange(1, 1, 1, 5).setFontWeight('bold');
    cf.setFrozenRows(1);
  }

  // 5. לוג
  var log = getOrCreate_(ss, 'לוג');
  if (log.getLastRow() === 0) {
    log.appendRow(['תאריך', 'פעולה', 'משתמש', 'פרטים']);
    log.getRange(1, 1, 1, 4).setFontWeight('bold');
    log.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
}

function setupExamTriggers() {
  // Delete existing triggers for our functions
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'dailyExamReminder') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Daily at 18:00 — check tomorrow's exams, send reminders
  ScriptApp.newTrigger('dailyExamReminder')
    .timeBased()
    .atHour(18)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('Asia/Jerusalem')
    .create();

  Logger.log('Trigger created: dailyExamReminder at 18:00 daily');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
