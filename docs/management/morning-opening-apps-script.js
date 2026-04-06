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
 * שולח תזכורת WhatsApp למורה שמעביר/ה פתיחת בוקר מחר
 */
function sendDailyReminder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tomorrow = getNextSchoolDay();

  if (!tomorrow) {
    Logger.log('אין יום לימודים מחר');
    return;
  }

  // מצא מי בתורנות מחר
  const tomorrowStr = Utilities.formatDate(tomorrow, 'Asia/Jerusalem', 'yyyy-MM-dd');
  const scheduleSheet = ss.getSheetByName('שיבוצים');
  const scheduleData = scheduleSheet.getDataRange().getValues();

  let tomorrowTeacher = null;
  for (let i = 1; i < scheduleData.length; i++) {
    const rowDate = Utilities.formatDate(new Date(scheduleData[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === tomorrowStr) {
      tomorrowTeacher = scheduleData[i][1];
      break;
    }
  }

  if (!tomorrowTeacher) {
    Logger.log('אין שיבוץ למחר: ' + tomorrowStr);
    return;
  }

  // מצא פרטי טלפון
  const staffInfo = getStaffInfo(ss, tomorrowTeacher);
  if (!staffInfo) {
    Logger.log('חסרים פרטי טלפון/apiKey עבור: ' + tomorrowTeacher);
    return;
  }

  // מצא את הממד הנוכחי לפי תאריך
  const dimText = getDimensionForDate(tomorrow);

  // שלח תזכורת
  const dayName = formatDateHebrew(tomorrowStr);
  const message = `שלום ${tomorrowTeacher},\n\nתזכורת: מחר (${dayName}) את/ה מעביר/ה פתיחת בוקר.\n${dimText ? 'הממד: ' + dimText + '\n' : ''}\nרעיונות והשראה:\n${FORM_URL}#ideas\n\nבהצלחה!`;
  sendWhatsApp(staffInfo.phone, staffInfo.apiKey, message);
  Logger.log('תזכורת נשלחה ל: ' + tomorrowTeacher + ' (מחר ' + tomorrowStr + ')');
}

/**
 * מחזיר את יום הלימודים הבא (מחר, או ראשון אם היום חמישי)
 */
function getNextSchoolDay() {
  const now = new Date();
  const today = now.getDay(); // 0=Sun...6=Sat

  let daysToAdd = 1;
  if (today === 4) daysToAdd = 3; // חמישי → ראשון
  if (today === 5) daysToAdd = 2; // שישי → ראשון
  if (today === 6) daysToAdd = 1; // שבת → ראשון

  const next = new Date(now);
  next.setDate(next.getDate() + daysToAdd);

  // בדוק שלא חופשה (פסח, יום העצמאות וכו')
  const holidays = getHolidays();
  const nextStr = Utilities.formatDate(next, 'Asia/Jerusalem', 'yyyy-MM-dd');
  if (holidays.includes(nextStr)) {
    // חפש את היום הבא אחרי החופשה
    for (let i = 0; i < 30; i++) {
      next.setDate(next.getDate() + 1);
      const checkStr = Utilities.formatDate(next, 'Asia/Jerusalem', 'yyyy-MM-dd');
      const checkDay = next.getDay();
      if (checkDay >= 0 && checkDay <= 4 && !holidays.includes(checkStr)) {
        return next;
      }
    }
    return null;
  }

  return next;
}

/**
 * רשימת ימי חופשה (לעדכון ידני כל שנה)
 */
function getHolidays() {
  return [
    // פסח 2026
    '2026-04-14','2026-04-15','2026-04-16','2026-04-17','2026-04-18',
    '2026-04-19','2026-04-20','2026-04-21','2026-04-22','2026-04-23',
    '2026-04-24','2026-04-25','2026-04-26','2026-04-27','2026-04-28',
    // יום העצמאות
    '2026-05-06',
  ];
}

/**
 * מחזיר את שם הממד לפי תאריך
 */
function getDimensionForDate(date) {
  const month = date.getMonth(); // 0=Jan
  if (month === 8 || month === 9) return 'שייכות';       // ספט-אוקט
  if (month === 10 || month === 11) return 'כבוד';       // נוב-דצ
  if (month === 0 || month === 1) return 'מוטיבציה פנימית'; // ינו-פבר
  if (month === 2 || month === 3) return 'מסוגלות ומימוש עצמי'; // מרץ-אפר
  if (month === 4 || month === 5) return 'אוטונומיה';     // מאי-יוני
  return '';
}

/**
 * מחזיר פרטי צוות (טלפון + apiKey)
 */
function getStaffInfo(ss, name) {
  const staffSheet = ss.getSheetByName('צוות');
  const staffData = staffSheet.getDataRange().getValues();
  for (let i = 1; i < staffData.length; i++) {
    if (staffData[i][0] === name) {
      const phone = String(staffData[i][1]);
      const apiKey = String(staffData[i][2]);
      if (phone && apiKey) return { phone, apiKey };
      return null;
    }
  }
  return null;
}

/**
 * רץ כל יום ב-16:00
 * בודק אם המורה מילא את הטופס, אם לא — שולח עדכון למיטל
 */
function checkAndNotifyManager() {
  // לא רץ בסוף שבוע
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) return; // שישי/שבת

  const today = getTodayString();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // בדוק שלא חופשה
  if (getHolidays().includes(today)) return;

  // מצא מי בתורנות היום
  const todayTeacher = getTeacherForDate(ss, today);
  if (!todayTeacher) return;

  // בדוק אם מילא
  if (hasDocForToday(ss, todayTeacher, today)) {
    Logger.log(todayTeacher + ' מילא/ה — הכל בסדר');
    return;
  }

  // לא מילא — שלח למיטל
  if (MEYTAL_PHONE && MEYTAL_API_KEY) {
    const msg = `${todayTeacher} לא מילא/ה את טופס פתיחת הבוקר של היום (${formatDateHebrew(today)}).\n\nקישור לטופס:\n${FORM_URL}`;
    sendWhatsApp(MEYTAL_PHONE, MEYTAL_API_KEY, msg);
    Logger.log('עדכון נשלח למיטל: ' + todayTeacher + ' לא מילא/ה');
  } else {
    Logger.log('חסרים פרטי WhatsApp של מיטל');
  }
}

/**
 * מחזיר את שם המורה המשובץ לתאריך נתון
 */
function getTeacherForDate(ss, dateStr) {
  const scheduleSheet = ss.getSheetByName('שיבוצים');
  const scheduleData = scheduleSheet.getDataRange().getValues();
  for (let i = 1; i < scheduleData.length; i++) {
    const rowDate = Utilities.formatDate(new Date(scheduleData[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === dateStr) return scheduleData[i][1];
  }
  return null;
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
