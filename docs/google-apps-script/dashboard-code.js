// =============================================================
// Google Apps Script – קוד מלא לשאלונים + דשבורד מורים + פרסום שאלונים
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
// =============================================================

const SPREADSHEET_ID = '1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw';

function doGet(e) {
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
