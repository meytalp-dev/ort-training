/**
 * קוד Apps Script לפעילויות פתיחה
 * ==============================
 *
 * הוראות התקנה:
 * 1. פתחו את Google Apps Script הקיים (שכבר מחובר ל-Spreadsheet)
 * 2. העתיקו את הפונקציות למטה והוסיפו אותן לקוד הקיים
 * 3. לחצו Deploy → New Deployment (או עדכנו את ה-deployment הקיים)
 * 4. אם זה deployment חדש – העתיקו את ה-URL החדש
 *
 * הפונקציות מוסיפות 3 יכולות:
 * - saveOpener: שמירת פעילות חדשה (מהמחולל)
 * - getOpener: טעינת פעילות (לדף תלמידים)
 * - שמירת הצבעות/מילים/ניחושים (מהתלמידים)
 */

// ====================================================
// הוסיפו את הקוד הבא לתוך הפונקציה doPost(e) הקיימת:
// (אחרי ה-if האחרון, לפני ה-return)
// ====================================================

/*
  // --- OPENER: Save new opener ---
  if (data.action === 'saveOpener') {
    var sheet = getOrCreateSheet('_openerData', ['ID', 'שם', 'מקצוע', 'כיתה', 'מורה', 'מייל', 'תאריך', 'נתונים']);
    var row = [data.id, data.name, data.subject, data.grade, data.teacher, data.email, new Date(), data.openerJSON];

    // Check if ID already exists
    var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    var existingRow = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.id) { existingRow = i + 2; break; }
    }

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // --- OPENER: Save vote ---
  if (data.action === 'openerVote') {
    var sheetName = '_openerVotes';
    var sheet = getOrCreateSheet(sheetName, ['מזהה פעילות', 'מספר פעילות', 'שם תלמיד', 'אפשרות שנבחרה', 'תאריך']);
    sheet.appendRow([data.openerId, data.activityIndex, data.student, data.optionIndex, new Date()]);
    return ContentService.createTextOutput('ok');
  }

  // --- OPENER: Save word ---
  if (data.action === 'openerWord') {
    var sheetName = '_openerWords';
    var sheet = getOrCreateSheet(sheetName, ['מזהה פעילות', 'מספר פעילות', 'שם תלמיד', 'מילה', 'תאריך']);
    sheet.appendRow([data.openerId, data.activityIndex, data.student, data.word, new Date()]);
    return ContentService.createTextOutput('ok');
  }

  // --- OPENER: Save guess ---
  if (data.action === 'openerGuess') {
    var sheetName = '_openerGuesses';
    var sheet = getOrCreateSheet(sheetName, ['מזהה פעילות', 'מספר פעילות', 'שם תלמיד', 'ניחוש', 'תאריך']);
    sheet.appendRow([data.openerId, data.activityIndex, data.student, data.guess, new Date()]);
    return ContentService.createTextOutput('ok');
  }

  // --- OPENER: Save dilemma choice ---
  if (data.action === 'openerDilemma') {
    var sheetName = '_openerVotes'; // Same sheet as votes
    var sheet = getOrCreateSheet(sheetName, ['מזהה פעילות', 'מספר פעילות', 'שם תלמיד', 'אפשרות שנבחרה', 'תאריך']);
    sheet.appendRow([data.openerId, data.activityIndex, data.student, data.optionIndex, new Date()]);
    return ContentService.createTextOutput('ok');
  }
*/

// ====================================================
// הוסיפו את הקוד הבא לתוך הפונקציה doGet(e) הקיימת:
// (אחרי ה-if האחרון, לפני ה-return)
// ====================================================

/*
  // --- OPENER: Get opener data ---
  if (action === 'getOpener') {
    var id = e.parameter.id;
    var callback = e.parameter.callback;
    var sheet = ss.getSheetByName('_openerData');

    if (!sheet) {
      var response = callback + '(' + JSON.stringify({ error: 'Sheet not found' }) + ')';
      return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    var data = sheet.getDataRange().getValues();
    var result = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        result = {
          id: data[i][0],
          name: data[i][1],
          subject: data[i][2],
          grade: data[i][3],
          teacher: data[i][4],
          email: data[i][5],
          date: data[i][6],
          openerJSON: data[i][7]
        };
        break;
      }
    }

    if (!result) {
      var response = callback + '(' + JSON.stringify({ error: 'Not found' }) + ')';
      return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    var response = callback + '(' + JSON.stringify(result) + ')';
    return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // --- OPENER: Get results (for teacher polling) ---
  if (action === 'getOpenerResults') {
    var id = e.parameter.id;
    var callback = e.parameter.callback;
    var results = { votes: {}, words: {}, guesses: {} };

    // Get votes
    var votesSheet = ss.getSheetByName('_openerVotes');
    if (votesSheet) {
      var voteData = votesSheet.getDataRange().getValues();
      for (var i = 1; i < voteData.length; i++) {
        if (voteData[i][0] === id) {
          var actIdx = voteData[i][1];
          if (!results.votes[actIdx]) results.votes[actIdx] = {};
          var optIdx = voteData[i][3];
          results.votes[actIdx][optIdx] = (results.votes[actIdx][optIdx] || 0) + 1;
        }
      }
    }

    // Get words
    var wordsSheet = ss.getSheetByName('_openerWords');
    if (wordsSheet) {
      var wordData = wordsSheet.getDataRange().getValues();
      for (var i = 1; i < wordData.length; i++) {
        if (wordData[i][0] === id) {
          var actIdx = wordData[i][1];
          if (!results.words[actIdx]) results.words[actIdx] = {};
          var word = wordData[i][3];
          results.words[actIdx][word] = (results.words[actIdx][word] || 0) + 1;
        }
      }
    }

    // Get guesses
    var guessSheet = ss.getSheetByName('_openerGuesses');
    if (guessSheet) {
      var guessData = guessSheet.getDataRange().getValues();
      for (var i = 1; i < guessData.length; i++) {
        if (guessData[i][0] === id) {
          var actIdx = guessData[i][1];
          if (!results.guesses[actIdx]) results.guesses[actIdx] = [];
          results.guesses[actIdx].push({ name: guessData[i][2], guess: guessData[i][3] });
        }
      }
    }

    var response = callback + '(' + JSON.stringify(results) + ')';
    return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
*/

// ====================================================
// פונקציית עזר – הוסיפו אם לא קיימת כבר:
// ====================================================

/*
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById('1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    if (name === '_openerData') {
      sheet.setColumnWidth(8, 400); // Wide column for JSON
    }
  }
  return sheet;
}
*/
