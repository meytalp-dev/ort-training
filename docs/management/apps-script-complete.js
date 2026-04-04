// =============================================================
// Google Apps Script – קוד מלא לשאלונים + דשבורד מורים + פרסום שאלונים + משימות
// =============================================================
// הוראות:
// 1. ב-Google Sheets: Extensions → Apps Script
// 2. מחקי הכל (Ctrl+A, Delete)
// 3. הדביקי את כל הקוד הזה
// 4. Ctrl+S לשמור
// 5. Deploy → Manage deployments → עריכת הפריסה הקיימת
//    (או Deploy → New deployment → Web app)
//    Execute as: Me | Who has access: Anyone
// 6. Deploy ושמרי
// 7. בחרי את הפונקציה createDailyTrigger מהתפריט למעלה ולחצי Run (פעם אחת בלבד!)
// =============================================================

const SPREADSHEET_ID = '1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw';
const GEMINI_KEY = 'AIzaSyDKNEikoSozZIDOFN2lR6S6yc9MDPy74ok';

// ===== Gemini Proxy — עוקף הגבלת referrer =====
function geminiProxy(prompt) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY;
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
    }),
    muteHttpExceptions: true
  });
  var data = JSON.parse(response.getContentText());
  var text = (data.candidates || [])[0]?.content?.parts?.[0]?.text || '';
  return text;
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // === Gemini Proxy ===
  if (params.action === 'geminiProxy' && params.prompt) {
    var cb = (params.callback || 'cb').replace(/[^a-zA-Z0-9_]/g, '');
    try {
      var text = geminiProxy(decodeURIComponent(params.prompt));
      return ContentService.createTextOutput(cb + '(' + JSON.stringify({ result: 'success', text: text }) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } catch(err) {
      return ContentService.createTextOutput(cb + '(' + JSON.stringify({ result: 'error', error: err.toString() }) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }


  var params = (e && e.parameter) ? e.parameter : {};

  // === שליחת ציונים מהשאלון ===
  if (params.action === 'submit') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName(params.quizName);
      if (!sheet) {
        sheet = ss.insertSheet(params.quizName);
        sheet.appendRow(['שם תלמיד', 'כיתה', 'ציון', 'שאלות נכונות', 'סה"כ שאלות', 'רמה שזוהתה', 'מייל מורה', 'תאריך']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
      }
      sheet.appendRow([
        params.studentName || '',
        params.classroom || '',
        params.score || '',
        params.correctAnswers || '',
        params.totalQuestions || '',
        params.level || '',
        params.teacherEmail || '',
        new Date().toLocaleString('he-IL')
      ]);
      return ContentService.createTextOutput('OK');
    } catch (err) {
      return ContentService.createTextOutput('Error: ' + err.toString());
    }
  }

  // === טעינת משחק לפי ID ===
  if (params.action === 'getGame') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_gameData');
      var result;

      if (!sheet) {
        result = JSON.stringify({ error: 'not_found' });
      } else {
        var data = sheet.getDataRange().getValues();
        var found = false;
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === params.id) {
            result = JSON.stringify({
              id: data[i][0],
              name: data[i][1],
              gameType: data[i][2],
              subject: data[i][3],
              grade: data[i][4],
              teacher: data[i][5],
              email: data[i][6],
              date: data[i][7] ? data[i][7].toString() : '',
              gameJSON: data[i][8]
            });
            found = true;
            break;
          }
        }
        if (!found) {
          result = JSON.stringify({ error: 'not_found' });
        }
      }

      // JSONP support
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת שאלון לפי ID ===
  if (params.action === 'getQuiz') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_quizData');
      var result;

      if (!sheet) {
        result = JSON.stringify({ error: 'not_found' });
      } else {
        var data = sheet.getDataRange().getValues();
        var found = false;
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === params.id) {
            result = JSON.stringify({
              id: data[i][0],
              name: data[i][1],
              subject: data[i][2],
              grade: data[i][3],
              teacher: data[i][4],
              email: data[i][5],
              date: data[i][6] ? data[i][6].toString() : '',
              quizJSON: data[i][7]
            });
            found = true;
            break;
          }
        }
        if (!found) {
          result = JSON.stringify({ error: 'not_found' });
        }
      }

      // JSONP support
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === רשימת כל השאלונים המפורסמים ===
  if (params.action === 'listQuizzes') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_quizData');
      var quizzes = [];

      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          quizzes.push({
            id: data[i][0],
            name: data[i][1],
            subject: data[i][2],
            grade: data[i][3],
            teacher: data[i][4],
            date: data[i][6] ? data[i][6].toString() : ''
          });
        }
      }

      var result = JSON.stringify({ quizzes: quizzes });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת מערך שיעור לפי ID ===
  if (params.action === 'getLesson') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_lessonData');
      var result;

      if (!sheet) {
        result = JSON.stringify({ error: 'not_found' });
      } else {
        var data = sheet.getDataRange().getValues();
        var found = false;
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === params.id) {
            result = JSON.stringify({
              id: data[i][0],
              name: data[i][1],
              subject: data[i][2],
              grade: data[i][3],
              teacher: data[i][4],
              email: data[i][5],
              date: data[i][6] ? data[i][6].toString() : '',
              lessonJSON: data[i][7]
            });
            found = true;
            break;
          }
        }
        if (!found) {
          result = JSON.stringify({ error: 'not_found' });
        }
      }

      // JSONP support
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת משרות ===
  if (params.action === 'getPositions') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_positions');
      var positions = [];

      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          positions.push({
            id: data[i][0],
            name: data[i][1],
            subject: data[i][2],
            scope: data[i][3],
            positionType: data[i][4],
            status: data[i][5],
            notes: data[i][6],
            updatedAt: data[i][7] ? data[i][7].toString() : ''
          });
        }
      }

      var result = JSON.stringify({ positions: positions });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת אירועים ===
  if (params.action === 'getCalendarEvents') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_calendarEvents');
      var events = [];

      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          events.push({
            id: data[i][0],
            date: data[i][1],
            endDate: data[i][2],
            type: data[i][3],
            title: data[i][4],
            description: data[i][5],
            grade: data[i][6],
            createdBy: data[i][7],
            updatedAt: data[i][8] ? data[i][8].toString() : ''
          });
        }
      }

      var result = JSON.stringify({ events: events });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת טפסי מורים ===
  if (params.action === 'getTeacherForms') {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_teacherForms');
      var forms = [];

      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          forms.push({
            name: data[i][0],
            subject: data[i][1],
            currentScope: data[i][2],
            desiredScope: data[i][3],
            hasDay: data[i][4],
            currentDay: data[i][5],
            preferredDay: data[i][6],
            changes: data[i][7],
            requests: data[i][8],
            date: data[i][9] ? data[i][9].toString() : ''
          });
        }
      }

      var result = JSON.stringify({ forms: forms });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === טעינת משימות ===
  if (params.action === 'getTasks') {
    try {
      var tasksList = loadTasks();
      var result = JSON.stringify({ tasks: tasksList });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      var errResult = JSON.stringify({ error: err.toString() });
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === הרשמה לאירוע ===
  if (params.action === 'eventRegistration') {
    var cb = params.callback || 'callback';
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheetName = '_registrations';
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(['שם מלא', 'תפקיד', 'בית ספר', 'אימייל', 'טלפון', 'שם אירוע', 'מפגשים', 'תאריך הרשמה']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E8D5F5');
      }
      sheet.appendRow([
        params.fullName || '',
        params.role || '',
        params.school || '',
        params.email || '',
        params.phone || '',
        params.eventName || '',
        params.sessions || '',
        new Date().toLocaleString('he-IL')
      ]);
      return ContentService.createTextOutput(cb + '({"status":"ok"})').setMimeType(ContentService.MimeType.JAVASCRIPT);
    } catch (err) {
      return ContentService.createTextOutput(cb + '({"status":"error","message":"' + err.toString().replace(/"/g, '\\"') + '"})').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  // === דשבורד מורים ===
  return HtmlService.createHtmlOutput(getDashboardHTML())
    .setTitle('דשבורד ציונים – אורט בית הערבה')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(x) { data = e.parameter; }
    } else {
      data = e.parameter;
    }

    // === שמירת משחק חדש ===
    if (data.action === 'saveGame') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_gameData');
      if (!sheet) {
        sheet = ss.insertSheet('_gameData');
        sheet.appendRow(['ID', 'שם משחק', 'סוג', 'מקצוע', 'כיתה', 'שם מורה', 'מייל מורה', 'תאריך', 'נתוני משחק']);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#D4F3EF');
        sheet.setColumnWidth(9, 400);
      }

      // Check if game ID already exists (update)
      var dataRange = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] === data.id) {
          sheet.getRange(i + 1, 1, 1, 9).setValues([[
            data.id,
            data.name || '',
            data.gameType || '',
            data.subject || '',
            data.grade || '',
            data.teacher || '',
            data.email || '',
            new Date().toLocaleString('he-IL'),
            data.gameJSON || ''
          ]]);
          found = true;
          break;
        }
      }

      if (!found) {
        sheet.appendRow([
          data.id,
          data.name || '',
          data.gameType || '',
          data.subject || '',
          data.grade || '',
          data.teacher || '',
          data.email || '',
          new Date().toLocaleString('he-IL'),
          data.gameJSON || ''
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שמירת שאלון חדש ===
    if (data.action === 'saveQuiz') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_quizData');
      if (!sheet) {
        sheet = ss.insertSheet('_quizData');
        sheet.appendRow(['ID', 'שם שאלון', 'מקצוע', 'כיתה', 'שם מורה', 'מייל מורה', 'תאריך', 'נתוני שאלון']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
        sheet.setColumnWidth(8, 400);
      }

      // Check if quiz ID already exists (update)
      var dataRange = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] === data.id) {
          sheet.getRange(i + 1, 1, 1, 8).setValues([[
            data.id,
            data.name || '',
            data.subject || '',
            data.grade || '',
            data.teacher || '',
            data.email || '',
            new Date().toLocaleString('he-IL'),
            data.quizJSON || ''
          ]]);
          found = true;
          break;
        }
      }

      if (!found) {
        sheet.appendRow([
          data.id,
          data.name || '',
          data.subject || '',
          data.grade || '',
          data.teacher || '',
          data.email || '',
          new Date().toLocaleString('he-IL'),
          data.quizJSON || ''
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שמירת מערך שיעור חדש ===
    if (data.action === 'saveLesson') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_lessonData');
      if (!sheet) {
        sheet = ss.insertSheet('_lessonData');
        sheet.appendRow(['ID', 'שם שיעור', 'מקצוע', 'כיתה', 'שם מורה', 'מייל מורה', 'תאריך', 'נתוני שיעור']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
        sheet.setColumnWidth(8, 400);
      }
      sheet.appendRow([
        data.id,
        data.name || '',
        data.subject || '',
        data.grade || '',
        data.teacher || '',
        data.email || '',
        new Date().toLocaleString('he-IL'),
        data.lessonJSON || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === בקשת מערך שיעור (טופס בקשה) ===
    if (data.action === 'lessonRequest') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_lessonRequests');
      if (!sheet) {
        sheet = ss.insertSheet('_lessonRequests');
        sheet.appendRow(['שם מורה', 'מייל', 'נושא', 'מקצוע', 'כיתה', 'הערות', 'תאריך', 'סטטוס']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
      }
      sheet.appendRow([
        data.name || '',
        data.email || '',
        data.topic || '',
        data.subject || '',
        data.grade || '',
        data.notes || '',
        data.date || new Date().toLocaleString('he-IL'),
        'ממתין'
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שמירת משרה ===
    if (data.action === 'savePosition') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_positions');
      if (!sheet) {
        sheet = ss.insertSheet('_positions');
        sheet.appendRow(['ID', 'שם', 'מקצוע', 'היקף', 'סוג תקן', 'סטטוס', 'הערות', 'עדכון']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
      }
      var dataRange = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] === data.id) {
          sheet.getRange(i + 1, 1, 1, 8).setValues([[
            data.id, data.name || '', data.subject || '', data.scope || '',
            data.positionType || '', data.status || '', data.notes || '',
            new Date().toLocaleString('he-IL')
          ]]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([
          data.id, data.name || '', data.subject || '', data.scope || '',
          data.positionType || '', data.status || '', data.notes || '',
          new Date().toLocaleString('he-IL')
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === מחיקת משרה ===
    if (data.action === 'deletePosition') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_positions');
      if (sheet) {
        var dataRange = sheet.getDataRange().getValues();
        for (var i = 1; i < dataRange.length; i++) {
          if (dataRange[i][0] === data.id) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שמירת אירוע ===
    if (data.action === 'saveCalendarEvent') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_calendarEvents');
      if (!sheet) {
        sheet = ss.insertSheet('_calendarEvents');
        sheet.appendRow(['ID', 'תאריך', 'תאריך סיום', 'סוג', 'כותרת', 'תיאור', 'שכבה', 'נוצר ע"י', 'עדכון']);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#D4F3EF');
      }
      var dataRange = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] === data.id) {
          sheet.getRange(i + 1, 1, 1, 9).setValues([[
            data.id, data.date || '', data.endDate || '', data.type || '',
            data.title || '', data.description || '', data.grade || '',
            data.createdBy || '', new Date().toLocaleString('he-IL')
          ]]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([
          data.id, data.date || '', data.endDate || '', data.type || '',
          data.title || '', data.description || '', data.grade || '',
          data.createdBy || '', new Date().toLocaleString('he-IL')
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === מחיקת אירוע ===
    if (data.action === 'deleteCalendarEvent') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_calendarEvents');
      if (sheet) {
        var dataRange = sheet.getDataRange().getValues();
        for (var i = 1; i < dataRange.length; i++) {
          if (dataRange[i][0] === data.id) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === טופס מורים – תכנון לשנה הבאה ===
    if (data.action === 'teacherForm') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName('_teacherForms');
      if (!sheet) {
        sheet = ss.insertSheet('_teacherForms');
        sheet.appendRow(['שם', 'מקצוע', 'משרה נוכחית', 'משרה רצויה', 'יש יום חופשי', 'יום חופשי נוכחי', 'יום חופשי מבוקש', 'שינויים', 'בקשות מיוחדות', 'תאריך']);
        sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#D4F3EF');
      }
      sheet.appendRow([
        data.name || '',
        data.subject || '',
        data.currentScope || '',
        data.desiredScope || '',
        data.hasDay || '',
        data.currentDay || '',
        data.preferredDay || '',
        data.changes || '',
        data.requests || '',
        data.date || new Date().toLocaleString('he-IL')
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שמירת משימות ===
    if (data.action === 'saveTasks') {
      saveTasksToSheet(data.tasks);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === מחיקת משימה ===
    if (data.action === 'deleteTask') {
      deleteTaskById(data.id);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // === שליחת ציונים (קיים) ===
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheetName = data.sheet || data.quizName;
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['שם תלמיד', 'כיתה', 'ציון', 'שאלות נכונות', 'סה"כ שאלות', 'רמה שזוהתה', 'מייל מורה', 'תאריך']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
    }
    sheet.appendRow([
      data.studentName, data.classroom, data.score,
      data.correctAnswers, data.totalQuestions,
      data.level || '', data.teacherEmail || '',
      new Date().toLocaleString('he-IL')
    ]);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.toString());
  }
}

// =============================================================
// משימות – פונקציות עזר
// =============================================================

function getTasksSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('_tasks');
  if (!sheet) {
    sheet = ss.insertSheet('_tasks');
    sheet.appendRow(['id', 'title', 'dueDate', 'priority', 'status', 'category', 'createdAt', 'updatedAt']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#D4F3EF');
  }
  return sheet;
}

function saveTasksToSheet(tasks) {
  var sheet = getTasksSheet();
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).clearContent();
  }
  if (!tasks || !tasks.length) return;
  var rows = tasks.map(function(t) {
    return [t.id||'', t.title||'', t.dueDate||'', t.priority||'medium', t.status||'pending', t.category||'', t.createdAt||'', t.updatedAt||''];
  });
  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
}

function loadTasks() {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();
  var tasks = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    tasks.push({
      id: data[i][0],
      title: data[i][1],
      dueDate: data[i][2] ? data[i][2].toString() : '',
      priority: data[i][3],
      status: data[i][4],
      category: data[i][5],
      createdAt: data[i][6] ? data[i][6].toString() : '',
      updatedAt: data[i][7] ? data[i][7].toString() : ''
    });
  }
  return tasks;
}

function deleteTaskById(id) {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

// =============================================================
// תזכורת יומית במייל
// =============================================================

function sendTaskReminders() {
  var tasks = loadTasks();
  var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');

  var pending = tasks.filter(function(t) { return t.status !== 'done'; });

  // אם אין משימות פתוחות בכלל – לא שולח
  if (pending.length === 0) return;

  var overdue = pending.filter(function(t) {
    return t.dueDate && t.dueDate < today;
  });
  var dueToday = pending.filter(function(t) {
    return t.dueDate === today;
  });
  // משימות ב-7 הימים הקרובים (לא כולל היום)
  var nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  var nextWeek = Utilities.formatDate(nextWeekDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
  var upcoming = pending.filter(function(t) {
    return t.dueDate && t.dueDate > today && t.dueDate <= nextWeek;
  });
  // משימות בלי תאריך
  var noDate = pending.filter(function(t) {
    return !t.dueDate;
  });

  var priorityEmoji = {high: '🔴', medium: '🟡', low: '🟢'};
  var priorityOrder = {high: 0, medium: 1, low: 2};

  // מיון לפי עדיפות
  function sortByPriority(a, b) {
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  }
  overdue.sort(sortByPriority);
  dueToday.sort(sortByPriority);
  upcoming.sort(function(a, b) { return a.dueDate < b.dueDate ? -1 : 1; });

  var dayNames = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  var todayDate = new Date();
  var dayName = dayNames[todayDate.getDay()];
  var dateStr = todayDate.toLocaleDateString('he-IL');

  var parts = [
    '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">',
    '<div style="background:linear-gradient(135deg,#0D9488,#14B8A6);color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center">',
    '<h1 style="margin:0;font-size:22px">בוקר טוב מייטל! ☀️</h1>',
    '<p style="margin:8px 0 0;opacity:.85;font-size:14px">יום ' + dayName + ' | ' + dateStr + '</p>',
    '<div style="display:flex;justify-content:center;gap:24px;margin-top:16px">',
    '<div style="text-align:center"><div style="font-size:28px;font-weight:bold">' + pending.length + '</div><div style="font-size:12px;opacity:.8">פתוחות</div></div>',
    '<div style="text-align:center"><div style="font-size:28px;font-weight:bold;color:#FEE2E2">' + overdue.length + '</div><div style="font-size:12px;opacity:.8">באיחור</div></div>',
    '<div style="text-align:center"><div style="font-size:28px;font-weight:bold">' + dueToday.length + '</div><div style="font-size:12px;opacity:.8">להיום</div></div>',
    '</div>',
    '</div>',
    '<div style="background:#fff;padding:20px;border:1px solid #e5e7eb">'
  ];

  function renderTaskItem(t, borderColor) {
    var html = '<div style="padding:8px 0;border-bottom:1px solid ' + borderColor + ';display:flex;align-items:center;gap:6px">';
    html += '<span>' + (priorityEmoji[t.priority] || '🟡') + '</span>';
    html += '<strong style="flex:1">' + t.title + '</strong>';
    if (t.dueDate) {
      var d = new Date(t.dueDate + 'T00:00:00');
      html += '<span style="color:#999;font-size:12px">' + d.toLocaleDateString('he-IL') + '</span>';
    }
    if (t.category) html += '<span style="background:#F3F4F6;padding:2px 8px;border-radius:4px;font-size:11px;color:#6B7280">' + t.category + '</span>';
    html += '</div>';
    return html;
  }

  // באיחור
  if (overdue.length > 0) {
    parts.push('<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:14px">');
    parts.push('<h3 style="color:#DC2626;margin:0 0 8px;font-size:15px">⚠️ באיחור (' + overdue.length + ')</h3>');
    overdue.forEach(function(t) { parts.push(renderTaskItem(t, '#FECACA')); });
    parts.push('</div>');
  }

  // להיום
  if (dueToday.length > 0) {
    parts.push('<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:14px;margin-bottom:14px">');
    parts.push('<h3 style="color:#2563EB;margin:0 0 8px;font-size:15px">📌 להיום (' + dueToday.length + ')</h3>');
    dueToday.forEach(function(t) { parts.push(renderTaskItem(t, '#BFDBFE')); });
    parts.push('</div>');
  }

  // השבוע הקרוב
  if (upcoming.length > 0) {
    parts.push('<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px;margin-bottom:14px">');
    parts.push('<h3 style="color:#16A34A;margin:0 0 8px;font-size:15px">📅 השבוע הקרוב (' + upcoming.length + ')</h3>');
    upcoming.forEach(function(t) { parts.push(renderTaskItem(t, '#BBF7D0')); });
    parts.push('</div>');
  }

  // בלי תאריך
  if (noDate.length > 0) {
    parts.push('<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:14px;margin-bottom:14px">');
    parts.push('<h3 style="color:#6B7280;margin:0 0 8px;font-size:15px">📝 ללא תאריך (' + noDate.length + ')</h3>');
    noDate.forEach(function(t) { parts.push(renderTaskItem(t, '#E5E7EB')); });
    parts.push('</div>');
  }

  parts.push(
    '<div style="text-align:center;padding:16px 0">',
    '<a href="https://meytalp-dev.github.io/ort-training/management/" style="display:inline-block;background:#0D9488;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">פתחי את מערכת הניהול →</a>',
    '</div>',
    '</div>',
    '<div style="text-align:center;padding:12px;color:#9CA3AF;font-size:11px">נשלח אוטומטית בשעה 7:00 ממערכת הניהול של אורט בית הערבה</div>',
    '</div>'
  );

  // נושא המייל – מותאם למצב
  var subject = '📋 ';
  if (overdue.length > 0) subject += overdue.length + ' משימות באיחור! ';
  if (dueToday.length > 0) subject += dueToday.length + ' להיום ';
  subject += '(סה"כ ' + pending.length + ' פתוחות) – אורט בית הערבה';

  MailApp.sendEmail({
    to: 'meytalp@bethaarava.ort.org.il',
    subject: subject,
    htmlBody: parts.join('')
  });
}

// =============================================================
// הגדרת טריגר יומי – להריץ פעם אחת בלבד!
// בחרי createDailyTrigger מהתפריט למעלה ולחצי Run
// =============================================================

function createDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'sendTaskReminders') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('sendTaskReminders')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}

// =============================================================
// דשבורד ציונים
// =============================================================

function getMyData(email) {
  if (!email) email = Session.getActiveUser().getEmail();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  var result = {};
  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    if (sheetName.startsWith('_')) return; // skip internal sheets
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    var headers = data[0];
    var emailCol = headers.indexOf('מייל מורה');
    if (emailCol === -1) return;
    var rows = data.slice(1).filter(function(row) {
      return row[emailCol] && row[emailCol].toString().toLowerCase() === email.toLowerCase();
    });
    if (rows.length > 0) {
      result[sheetName] = {
        total: rows.length,
        avgScore: Math.round(rows.reduce(function(sum, r) { return sum + (Number(r[2]) || 0); }, 0) / rows.length),
        rows: rows.map(function(row) {
          return { name: row[0], class: row[1], score: row[2], correct: row[3], total: row[4], level: row[5], date: row[7] ? row[7].toString() : '' };
        })
      };
    }
  });
  return { email: email, quizzes: result };
}

function getDashboardHTML() {
  return '<!DOCTYPE html>\
<html lang="he" dir="rtl"><head><meta charset="UTF-8">\
<meta name="viewport" content="width=device-width,initial-scale=1.0">\
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">\
<style>\
*{margin:0;padding:0;box-sizing:border-box}\
body{font-family:Heebo,sans-serif;background:#F0F4F8;color:#1E293B;min-height:100vh}\
.header{background:linear-gradient(135deg,#2A9D8F,#1a7a6d);color:#fff;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}\
.header h1{font-size:1.6rem;font-weight:700}\
.header .email{background:rgba(255,255,255,.15);padding:6px 16px;border-radius:20px;font-size:.9rem}\
.container{max-width:1000px;margin:0 auto;padding:24px}\
.login-box{max-width:400px;margin:80px auto;background:#fff;border-radius:20px;padding:40px;box-shadow:0 2px 20px -4px rgba(0,0,0,.08);text-align:center}\
.login-box h2{font-size:1.4rem;color:#1a7a6d;margin-bottom:8px}\
.login-box p{color:#64748B;margin-bottom:24px;font-size:.95rem}\
.login-box input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-family:Heebo,sans-serif;font-size:1rem;text-align:center;direction:ltr;margin-bottom:16px}\
.login-box input:focus{outline:none;border-color:#2A9D8F}\
.login-btn{width:100%;padding:14px;background:#2A9D8F;color:#fff;border:none;border-radius:14px;font-family:Heebo,sans-serif;font-size:1.1rem;font-weight:600;cursor:pointer}\
.login-btn:hover{background:#1a7a6d}\
.loading{text-align:center;padding:60px;font-size:1.2rem;color:#64748B}\
.spinner{width:40px;height:40px;border:4px solid #D4F3EF;border-top:4px solid #2A9D8F;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px}\
@keyframes spin{to{transform:rotate(360deg)}}\
.empty{text-align:center;padding:80px 20px}\
.empty h2{font-size:1.3rem;color:#64748B;margin-bottom:8px}\
.empty p{color:#94A3B8}\
.quiz-card{background:#fff;border-radius:20px;padding:24px;margin-bottom:20px;box-shadow:0 2px 20px -4px rgba(0,0,0,.06)}\
.quiz-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}\
.quiz-name{font-size:1.2rem;font-weight:700}\
.quiz-stats{display:flex;gap:12px}\
.stat{background:#F0F4F8;padding:6px 14px;border-radius:12px;font-size:.85rem;color:#64748B}\
.stat strong{color:#2A9D8F}\
table{width:100%;border-collapse:collapse}\
th{background:#D4F3EF;color:#1a7a6d;padding:10px 12px;text-align:right;font-weight:600;font-size:.85rem}\
td{padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:.9rem}\
tr:hover td{background:#f8fffe}\
.score{font-weight:700;padding:4px 10px;border-radius:8px;display:inline-block;min-width:40px;text-align:center}\
.score-high{background:#D8F3DC;color:#2d6a4f}\
.score-mid{background:#FEF3C7;color:#92400e}\
.score-low{background:#FDE8EA;color:#9b1c31}\
.logout-btn{background:rgba(255,255,255,.2);border:none;color:#fff;padding:6px 16px;border-radius:20px;font-family:Heebo,sans-serif;font-size:.85rem;cursor:pointer}\
.logout-btn:hover{background:rgba(255,255,255,.3)}\
</style></head><body>\
<div class="header" id="mainHeader" style="display:none">\
<h1>דשבורד ציונים - אורט בית הערבה</h1>\
<div style="display:flex;align-items:center;gap:10px">\
<div class="email" id="userEmail"></div>\
<button class="logout-btn" onclick="logout()">התנתק</button>\
</div></div>\
<div class="container" id="content">\
<div class="login-box" id="loginBox">\
<h2>דשבורד ציונים</h2>\
<p>הכניסו את כתובת המייל שלכם כדי לראות ציוני תלמידים</p>\
<input type="email" id="emailInput" placeholder="your@email.com" dir="ltr">\
<button class="login-btn" onclick="login()">הצגת ציונים</button>\
</div></div>\
<script>\
var savedEmail=localStorage.getItem("dashEmail");\
if(savedEmail){document.getElementById("emailInput").value=savedEmail;login()}\
function login(){\
var email=document.getElementById("emailInput").value.trim();\
if(!email){alert("נא להזין כתובת מייל");return}\
localStorage.setItem("dashEmail",email);\
document.getElementById("loginBox").style.display="none";\
document.getElementById("content").innerHTML=\'<div class="loading"><div class="spinner"></div>טוען נתונים...</div>\';\
document.getElementById("mainHeader").style.display="flex";\
document.getElementById("userEmail").textContent=email;\
google.script.run.withSuccessHandler(render).withFailureHandler(err).getMyData(email);\
}\
function logout(){\
localStorage.removeItem("dashEmail");\
location.reload();\
}\
function err(e){document.getElementById("content").innerHTML=\'<div class="empty"><h2>שגיאה</h2><p>\'+e.message+"</p></div>"}\
function render(d){\
document.getElementById("userEmail").textContent=d.email;\
var k=Object.keys(d.quizzes);\
if(!k.length){document.getElementById("content").innerHTML=\'<div class="empty"><h2>אין תוצאות עדיין</h2><p>כשתלמידים ימלאו שאלונים שלך, התוצאות יופיעו כאן</p></div>\';return}\
var h="";\
k.forEach(function(n){var q=d.quizzes[n];\
h+=\'<div class="quiz-card"><div class="quiz-header"><div class="quiz-name">\'+n+\'</div><div class="quiz-stats"><div class="stat"><strong>\'+q.total+\'</strong> תלמידים</div><div class="stat">ממוצע: <strong>\'+q.avgScore+"</strong></div></div></div><table><thead><tr><th>שם</th><th>כיתה</th><th>ציון</th><th>נכונות</th><th>רמה</th><th>תאריך</th></tr></thead><tbody>";\
q.rows.forEach(function(r){var c=Number(r.score)>=80?"score-high":Number(r.score)>=60?"score-mid":"score-low";\
h+="<tr><td>"+r.name+"</td><td>"+r.class+\'</td><td><span class="score \'+c+\'">\'+r.score+"</span></td><td>"+r.correct+"/"+r.total+"</td><td>"+(r.level||"")+"</td><td>"+r.date+"</td></tr>"});\
h+="</tbody></table></div>"});\
document.getElementById("content").innerHTML=h}\
</script></body></html>';
}
