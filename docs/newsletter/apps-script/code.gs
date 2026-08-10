// Apps Script של אתר Learni — תפוצת מייל + טופס יצירת קשר
// מחליף את הקוד הקיים בפרויקט המחובר לגיליון ההרשמות.
// כל פנייה מטופס "יצירת קשר" באתר: נשמרת בטאב "יצירת קשר" + נשלחת למייל של מיטל.

var NOTIFY_EMAIL = 'meytalp@bethaarava.ort.org.il';

// אם הסקריפט אינו מוצמד לגיליון (standalone) — להדביק כאן את מזהה הגיליון מה-URL שלו.
// אם הסקריפט פתוח מתוך הגיליון (Extensions → Apps Script) — להשאיר ריק.
var SHEET_ID = '';

function getSpreadsheet() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (p.action === 'contact') {
      out = handleContact(p);
    } else {
      out = handleNewsletter(p);
    }
  } catch (err) {
    out = { result: 'error', message: String(err) };
  }
  var json = JSON.stringify(out);
  if (p.callback) {
    return ContentService
      .createTextOutput(p.callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// הרשמה לתפוצה — שומר על ההתנהגות הקיימת (שורה בטאב הראשון, זיהוי כפילויות) ומחזיר "registered"
function handleNewsletter(p) {
  var sheet = getSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (p.email && data[i][2] === p.email) {
      return { result: 'success', message: 'already_registered' };
    }
  }
  sheet.appendRow([new Date(), p.name || '', p.email || '', p.org || '', p.role || '']);
  // אם כבר מגיעה התראת מייל על הרשמות (כלל התראות של Sheets) והמייל הזה כפול — אפשר למחוק את השורות הבאות
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: '🔔 הרשמה חדשה לתפוצת Learni — ' + (p.name || 'ללא שם'),
    body: 'שם: ' + (p.name || '') + '\nאימייל: ' + (p.email || '') + '\nארגון: ' + (p.org || '') + '\nתפקיד: ' + (p.role || '')
  });
  return { result: 'success', message: 'registered' };
}

// פנייה מטופס יצירת קשר — טאב "יצירת קשר" + מייל עם reply-to של הפונה
function handleContact(p) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('יצירת קשר') || ss.insertSheet('יצירת קשר');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['תאריך', 'שם', 'אימייל', 'נושא', 'הודעה']);
  }
  sheet.appendRow([new Date(), p.name || '', p.email || '', p.subject || '', p.msg || '']);
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: p.email || NOTIFY_EMAIL,
    subject: '✉️ פנייה מאתר Learni: ' + (p.subject || 'ללא נושא') + ' — ' + (p.name || ''),
    body: 'שם: ' + (p.name || '') + '\nאימייל: ' + (p.email || '') + '\nנושא: ' + (p.subject || '') +
          '\n\n' + (p.msg || '') +
          '\n\n— נשלח מטופס יצירת הקשר באתר Learni. אפשר להשיב ישירות למייל הזה.'
  });
  return { result: 'success', message: 'contact_sent' };
}
