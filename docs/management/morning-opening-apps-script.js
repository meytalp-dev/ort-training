/**
 * מערכת פתיחות בוקר — Apps Script
 * ====================================
 *
 * הוראות התקנה:
 *
 * 1. צרי Google Sheet חדש עם 3 גיליונות:
 *    - "צוות" — עמודות: שם | טלפון | apiKey
 *    - "שיבוצים" — עמודות: תאריך | שם
 *    - "תיעוד" — עמודות: id | תאריך | שם_מורה | נושא | סוג | ממד | מיומנות | מטרה | הערות | קישור
 *
 * 2. מלאי את גיליון "צוות" עם שמות + מספרי טלפון (פורמט: 972501234567)
 *
 * 3. CallMeBot — הפעלה חד פעמית לכל מורה:
 *    כל מורה שולח הודעת WhatsApp ל: +34 644 71 86 63
 *    עם הטקסט: I allow callmebot to send me messages
 *    מקבלים בחזרה apiKey — מכניסים לעמודת apiKey בגיליון
 *    (גם את עצמך — כדי לקבל עדכון ב-16:00)
 *
 * 4. פתחי Extensions > Apps Script, הדביקי את הקוד הזה
 *
 * 5. הריצי setupTriggers() פעם אחת (Run > setupTriggers)
 *
 * 6. העתיקי את ה-Web App URL אחרי Deploy > New deployment > Web app
 *    והדביקי אותו בקובץ morning-opening.html בשורת APPS_SCRIPT_URL
 */

// ==================== הגדרות ====================
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const FORM_URL = 'https://meytalp-dev.github.io/ort-training/management/morning-opening.html';
const MEYTAL_PHONE = ''; // מספר של מיטל בפורמט 972...
const MEYTAL_API_KEY = ''; // apiKey של CallMeBot של מיטל

// ==================== Web App ====================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'syncSchedule') {
      syncScheduleToSheet(ss, data.schedule);
      return ContentService.createTextOutput(JSON.stringify({ok: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveDoc') {
      saveDocToSheet(ss, data.entry);
      return ContentService.createTextOutput(JSON.stringify({ok: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({error: 'unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getSchedule') {
    const sheet = ss.getSheetByName('שיבוצים');
    const data = sheet.getDataRange().getValues();
    const schedule = data.slice(1).map(row => ({
      date: Utilities.formatDate(new Date(row[0]), 'Asia/Jerusalem', 'yyyy-MM-dd'),
      name: row[1]
    }));
    return ContentService.createTextOutput(JSON.stringify({ok: true, schedule}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getDocs') {
    const sheet = ss.getSheetByName('תיעוד');
    const data = sheet.getDataRange().getValues();
    const docs = data.slice(1).map(row => ({
      id: row[0], date: row[1], teacher: row[2], topic: row[3],
      type: row[4], dim: row[5], skill: row[6], goal: row[7],
      notes: row[8], link: row[9]
    }));
    return ContentService.createTextOutput(JSON.stringify({ok: true, docs}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'unknown action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== סנכרון נתונים ====================
function syncScheduleToSheet(ss, scheduleData) {
  const sheet = ss.getSheetByName('שיבוצים');
  // נקה הכל חוץ מכותרת
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  }
  // הכנס נתונים חדשים
  const rows = scheduleData.map(s => [s.date, s.name]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function saveDocToSheet(ss, entry) {
  const sheet = ss.getSheetByName('תיעוד');
  sheet.appendRow([
    entry.id || Date.now(),
    entry.date,
    entry.teacher,
    entry.topic,
    entry.type,
    entry.dim,
    entry.skill,
    entry.goal || '',
    entry.notes || '',
    entry.link || ''
  ]);
}

// ==================== תזכורות WhatsApp ====================

/**
 * רץ כל יום ב-14:30
 * שולח תזכורת WhatsApp למורה שהיה בתורנות היום
 */
function sendDailyReminder() {
  const today = getTodayString();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // מצא מי בתורנות היום
  const scheduleSheet = ss.getSheetByName('שיבוצים');
  const scheduleData = scheduleSheet.getDataRange().getValues();

  let todayTeacher = null;
  for (let i = 1; i < scheduleData.length; i++) {
    const rowDate = Utilities.formatDate(new Date(scheduleData[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === today) {
      todayTeacher = scheduleData[i][1];
      break;
    }
  }

  if (!todayTeacher) {
    Logger.log('אין שיבוץ להיום: ' + today);
    return;
  }

  // בדוק אם כבר מילא
  if (hasDocForToday(ss, todayTeacher, today)) {
    Logger.log(todayTeacher + ' כבר מילא/ה היום');
    return;
  }

  // מצא פרטי טלפון
  const staffSheet = ss.getSheetByName('צוות');
  const staffData = staffSheet.getDataRange().getValues();

  let phone = null;
  let apiKey = null;
  for (let i = 1; i < staffData.length; i++) {
    if (staffData[i][0] === todayTeacher) {
      phone = String(staffData[i][1]);
      apiKey = String(staffData[i][2]);
      break;
    }
  }

  if (!phone || !apiKey) {
    Logger.log('חסרים פרטי טלפון/apiKey עבור: ' + todayTeacher);
    return;
  }

  // שלח תזכורת
  const message = `שלום ${todayTeacher} 👋\n\nתזכורת: היום העברת פתיחת בוקר.\nנא למלא את טופס התיעוד:\n${FORM_URL}\n\nתודה!`;
  sendWhatsApp(phone, apiKey, message);
  Logger.log('תזכורת נשלחה ל: ' + todayTeacher);
}

/**
 * רץ כל יום ב-16:00
 * בודק אם המורה מילא את הטופס, אם לא — שולח עדכון למיטל
 */
function checkAndNotifyManager() {
  const today = getTodayString();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // מצא מי בתורנות היום
  const scheduleSheet = ss.getSheetByName('שיבוצים');
  const scheduleData = scheduleSheet.getDataRange().getValues();

  let todayTeacher = null;
  for (let i = 1; i < scheduleData.length; i++) {
    const rowDate = Utilities.formatDate(new Date(scheduleData[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === today) {
      todayTeacher = scheduleData[i][1];
      break;
    }
  }

  if (!todayTeacher) return;

  // בדוק אם מילא
  if (hasDocForToday(ss, todayTeacher, today)) {
    Logger.log(todayTeacher + ' מילא/ה — הכל בסדר');
    // אפשר לשלוח למיטל עדכון חיובי
    if (MEYTAL_PHONE && MEYTAL_API_KEY) {
      const msg = `✅ ${todayTeacher} מילא/ה את טופס פתיחת הבוקר להיום.`;
      sendWhatsApp(MEYTAL_PHONE, MEYTAL_API_KEY, msg);
    }
    return;
  }

  // לא מילא — שלח למיטל
  if (MEYTAL_PHONE && MEYTAL_API_KEY) {
    const msg = `⚠️ ${todayTeacher} לא מילא/ה את טופס פתיחת הבוקר להיום (${formatDateHebrew(today)}).\n\nקישור לטופס: ${FORM_URL}`;
    sendWhatsApp(MEYTAL_PHONE, MEYTAL_API_KEY, msg);
    Logger.log('עדכון נשלח למיטל: ' + todayTeacher + ' לא מילא/ה');
  } else {
    Logger.log('חסרים פרטי WhatsApp של מיטל');
  }
}

// ==================== עזר ====================

function hasDocForToday(ss, teacherName, today) {
  const docSheet = ss.getSheetByName('תיעוד');
  if (docSheet.getLastRow() <= 1) return false;

  const data = docSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const docDate = String(data[i][1]);
    const docTeacher = String(data[i][2]);
    if (docDate === today && docTeacher === teacherName) {
      return true;
    }
  }
  return false;
}

function getTodayString() {
  return Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
}

function formatDateHebrew(dateStr) {
  const d = new Date(dateStr);
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return `יום ${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * שליחת הודעת WhatsApp דרך CallMeBot
 *
 * @param {string} phone - מספר טלפון בפורמט 972501234567
 * @param {string} apiKey - מפתח CallMeBot של הנמען
 * @param {string} message - תוכן ההודעה
 */
function sendWhatsApp(phone, apiKey, message) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;

  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('WhatsApp sent to ' + phone);
    } else {
      Logger.log('WhatsApp error: ' + code + ' — ' + response.getContentText());
    }
  } catch(err) {
    Logger.log('WhatsApp fetch error: ' + err.message);
  }
}

// ==================== התקנת טריגרים ====================

/**
 * הריצי פעם אחת כדי להגדיר את הטריגרים
 */
function setupTriggers() {
  // מחק טריגרים קיימים
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // תזכורת למורה — 14:30 כל יום
  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased()
    .atHour(14)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone('Asia/Jerusalem')
    .create();

  // בדיקה + עדכון למיטל — 16:00 כל יום
  ScriptApp.newTrigger('checkAndNotifyManager')
    .timeBased()
    .atHour(16)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('Asia/Jerusalem')
    .create();

  Logger.log('טריגרים הוגדרו: 14:30 תזכורת, 16:00 בדיקה');
}

// ==================== בדיקות ====================

/** בדיקה ידנית — שלח תזכורת עכשיו */
function testReminder() {
  sendDailyReminder();
}

/** בדיקה ידנית — שלח בדיקה למיטל עכשיו */
function testNotify() {
  checkAndNotifyManager();
}

/** בדיקת WhatsApp — שלח הודעת בדיקה */
function testWhatsApp() {
  if (!MEYTAL_PHONE || !MEYTAL_API_KEY) {
    Logger.log('הגדירי MEYTAL_PHONE ו-MEYTAL_API_KEY קודם');
    return;
  }
  sendWhatsApp(MEYTAL_PHONE, MEYTAL_API_KEY, 'בדיקת מערכת פתיחות בוקר — הכל עובד! ✅');
}
