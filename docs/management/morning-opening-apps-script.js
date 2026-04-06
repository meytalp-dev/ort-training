/**
 * מערכת פתיחות בוקר — Apps Script + Green-API
 * ==============================================
 *
 * הוראות התקנה:
 *
 * 1. צרי Google Sheet חדש עם 3 גיליונות:
 *    - "צוות" — עמודות: שם | טלפון
 *    - "שיבוצים" — עמודות: תאריך | שם
 *    - "תיעוד" — עמודות: id | תאריך | שם_מורה | נושא | סוג | ממד | מיומנות | מטרה | הערות | קישור
 *
 * 2. מלאי את גיליון "צוות" עם שמות + מספרי טלפון (פורמט: 972501234567)
 *
 * 3. פתחי Extensions > Apps Script, הדביקי את הקוד הזה
 *
 * 4. הריצי setupTriggers() פעם אחת (Run > setupTriggers)
 *
 * 5. Deploy > New deployment > Web app > Anyone can access
 *    העתיקי את ה-URL והדביקי ב-morning-opening.html בשורת APPS_SCRIPT_URL
 */

// ==================== הגדרות ====================
const FORM_URL = 'https://meytalp-dev.github.io/ort-training/management/morning-opening.html';
const MEYTAL_PHONE = '972536256653';

// Green-API credentials
const GREEN_API_INSTANCE = '7107577196';
const GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
const GREEN_API_URL = 'https://7107.api.greenapi.com';

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
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  }
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

// ==================== WhatsApp — Green-API ====================

/**
 * שליחת הודעת WhatsApp דרך Green-API
 * ההודעות יוצאות מהמספר של מיטל
 *
 * @param {string} phone - מספר טלפון בפורמט 972501234567
 * @param {string} message - תוכן ההודעה
 */
function sendWhatsApp(phone, message) {
  const url = `${GREEN_API_URL}/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`;

  const payload = {
    chatId: phone + '@c.us',
    message: message
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    const body = response.getContentText();

    if (code === 200) {
      Logger.log('WhatsApp sent to ' + phone + ': ' + body);
      return true;
    } else {
      Logger.log('WhatsApp error: ' + code + ' — ' + body);
      return false;
    }
  } catch(err) {
    Logger.log('WhatsApp fetch error: ' + err.message);
    return false;
  }
}

// ==================== תזכורות ====================

/**
 * רץ כל יום ב-14:30
 * שולח תזכורת WhatsApp למורה שמעביר/ה פתיחת בוקר מחר
 */
function sendDailyReminder() {
  // לא רץ בסוף שבוע
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tomorrow = getNextSchoolDay();

  if (!tomorrow) {
    Logger.log('אין יום לימודים מחר');
    return;
  }

  const tomorrowStr = Utilities.formatDate(tomorrow, 'Asia/Jerusalem', 'yyyy-MM-dd');
  const tomorrowTeacher = getTeacherForDate(ss, tomorrowStr);

  if (!tomorrowTeacher) {
    Logger.log('אין שיבוץ למחר: ' + tomorrowStr);
    return;
  }

  // מצא טלפון
  const phone = getStaffPhone(ss, tomorrowTeacher);
  if (!phone) {
    Logger.log('חסר טלפון עבור: ' + tomorrowTeacher);
    return;
  }

  const dimText = getDimensionForDate(tomorrow);
  const dayName = formatDateHebrew(tomorrowStr);

  const message = `שלום ${tomorrowTeacher},\n\nתזכורת: מחר (${dayName}) את/ה מעביר/ה פתיחת בוקר.${dimText ? '\nהממד: ' + dimText : ''}\n\nרעיונות והשראה:\n${FORM_URL}\n\nבהצלחה!`;

  sendWhatsApp(phone, message);
  Logger.log('תזכורת נשלחה ל: ' + tomorrowTeacher + ' (' + phone + ')');
}

/**
 * רץ כל יום ב-16:00
 * בודק אם המורה של היום מילא טופס, אם לא — WhatsApp למיטל
 */
function checkAndNotifyManager() {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) return;

  const today = getTodayString();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (getHolidays().includes(today)) return;

  const todayTeacher = getTeacherForDate(ss, today);
  if (!todayTeacher) return;

  if (hasDocForToday(ss, todayTeacher, today)) {
    Logger.log(todayTeacher + ' מילא/ה — הכל בסדר');
    return;
  }

  const msg = `${todayTeacher} לא מילא/ה את טופס פתיחת הבוקר של היום (${formatDateHebrew(today)}).\n\nקישור לטופס:\n${FORM_URL}`;
  sendWhatsApp(MEYTAL_PHONE, msg);
  Logger.log('עדכון נשלח למיטל: ' + todayTeacher + ' לא מילא/ה');
}

// ==================== עזר ====================

function getTeacherForDate(ss, dateStr) {
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowDate = Utilities.formatDate(new Date(data[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === dateStr) return data[i][1];
  }
  return null;
}

function getStaffPhone(ss, name) {
  const sheet = ss.getSheetByName('צוות');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === name) return String(data[i][1]);
  }
  return null;
}

function hasDocForToday(ss, teacherName, today) {
  const sheet = ss.getSheetByName('תיעוד');
  if (sheet.getLastRow() <= 1) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === today && String(data[i][2]) === teacherName) return true;
  }
  return false;
}

function getNextSchoolDay() {
  const now = new Date();
  const today = now.getDay();

  let daysToAdd = 1;
  if (today === 4) daysToAdd = 3; // חמישי → ראשון
  if (today === 5) daysToAdd = 2;
  if (today === 6) daysToAdd = 1;

  const next = new Date(now);
  next.setDate(next.getDate() + daysToAdd);

  const holidays = getHolidays();
  for (let i = 0; i < 30; i++) {
    const checkStr = Utilities.formatDate(next, 'Asia/Jerusalem', 'yyyy-MM-dd');
    const checkDay = next.getDay();
    if (checkDay >= 0 && checkDay <= 4 && !holidays.includes(checkStr)) {
      return next;
    }
    next.setDate(next.getDate() + 1);
  }
  return null;
}

function getHolidays() {
  return [
    '2026-04-14','2026-04-15','2026-04-16','2026-04-17','2026-04-18',
    '2026-04-19','2026-04-20','2026-04-21','2026-04-22','2026-04-23',
    '2026-04-24','2026-04-25','2026-04-26','2026-04-27','2026-04-28',
    '2026-05-06',
  ];
}

function getDimensionForDate(date) {
  const month = date.getMonth();
  if (month === 8 || month === 9) return 'שייכות';
  if (month === 10 || month === 11) return 'כבוד';
  if (month === 0 || month === 1) return 'מוטיבציה פנימית';
  if (month === 2 || month === 3) return 'מסוגלות ומימוש עצמי';
  if (month === 4 || month === 5) return 'אוטונומיה';
  return '';
}

function getTodayString() {
  return Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
}

function formatDateHebrew(dateStr) {
  const d = new Date(dateStr);
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return `יום ${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

// ==================== התקנת טריגרים ====================

/** הריצי פעם אחת */
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased().atHour(14).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  ScriptApp.newTrigger('checkAndNotifyManager')
    .timeBased().atHour(16).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  Logger.log('טריגרים הוגדרו: 14:30 תזכורת למורה של מחר, 16:00 בדיקה על מורה של היום');
}

// ==================== בדיקות ====================

/** שלח הודעת בדיקה למיטל */
function testWhatsApp() {
  const ok = sendWhatsApp(MEYTAL_PHONE, 'בדיקת מערכת פתיחות בוקר — הכל עובד!');
  Logger.log(ok ? 'הודעה נשלחה בהצלחה' : 'שליחה נכשלה');
}

/** בדיקת תזכורת */
function testReminder() { sendDailyReminder(); }

/** בדיקת עדכון למנהלת */
function testNotify() { checkAndNotifyManager(); }

/** הצג את לוח השיבוצים */
function showSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();
  data.slice(1).forEach(row => {
    Logger.log(row[0] + ' → ' + row[1]);
  });
}

// ==================== התקנה ראשונית ====================

/**
 * הריצי פעם אחת — יוצר את כל הגיליונות וממלא את רשימת הצוות + השיבוצים
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // === גיליון צוות ===
  let staffSheet = ss.getSheetByName('צוות');
  if (!staffSheet) {
    staffSheet = ss.insertSheet('צוות');
  } else {
    staffSheet.clear();
  }
  staffSheet.getRange(1, 1, 1, 2).setValues([['שם', 'טלפון']]);
  staffSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#D9EAD3');

  const staffData = [
    ['אושר אהרוני', '972508882402'],
    ['שי בגלר', '972522285773'],
    ['מירב בטיטו', '972584807906'],
    ['ליאת רוזנר', '972528980191'],
    ['אפרת בר אשר', '972522460684'],
    ['רווית גל', '972503993021'],
    ['יעקב גרונספלד', '972546995254'],
    ['עמנואל דהאן', '972505852852'],
    ['יסכה הגר', '972526995309'],
    ['דורית ויגדור', '972523464235'],
    ['מריאן זרצקי', '972507596570'],
    ['יעל טטנבאום', '972527078485'],
    ['רעיה יצחקי', '972504726066'],
    ['מיטל לאלום', '972506239018'],
    ['אופירה מלכה', '972534438414'],
    ['צהיי גטהון', '972527783903'],
    ['גיא נתנאל', '972542007155'],
    ['משה צברי', '972547195033'],
    ['נעמה קוסטן', '972524295181'],
    ['ויקטוריה קלדרון', '972586528820'],
    ['יוסף רבבשי', '972506563344'],
    ['יואב רוט', '972527218003'],
    ['פרלה שאזו', '972525115337'],
  ];
  staffSheet.getRange(2, 1, staffData.length, 2).setValues(staffData);
  staffSheet.setColumnWidth(1, 180);
  staffSheet.setColumnWidth(2, 150);

  // === גיליון שיבוצים ===
  let schedSheet = ss.getSheetByName('שיבוצים');
  if (!schedSheet) {
    schedSheet = ss.insertSheet('שיבוצים');
  } else {
    schedSheet.clear();
  }
  schedSheet.getRange(1, 1, 1, 2).setValues([['תאריך', 'שם']]);
  schedSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#C9DAF8');

  // ייצור שיבוצים אפריל-יוני 2026
  const staffWithDays = [
    { name: 'אושר אהרוני', off: [] },
    { name: 'שי בגלר', off: [] },
    { name: 'מירב בטיטו', off: [1] },
    { name: 'ליאת רוזנר', off: [] },
    { name: 'אפרת בר אשר', off: [3] },
    { name: 'רווית גל', off: [] },
    { name: 'יעקב גרונספלד', off: [] },
    { name: 'עמנואל דהאן', off: [] },
    { name: 'יסכה הגר', off: [] },
    { name: 'דורית ויגדור', off: [4] },
    { name: 'מריאן זרצקי', off: [] },
    { name: 'יעל טטנבאום', off: [] },
    { name: 'רעיה יצחקי', off: [4] },
    { name: 'מיטל לאלום', off: [] },
    { name: 'אופירה מלכה', off: [1] },
    { name: 'צהיי גטהון', off: [4] },
    { name: 'גיא נתנאל', off: [] },
    { name: 'משה צברי', off: [] },
    { name: 'נעמה קוסטן', off: [] },
    { name: 'ויקטוריה קלדרון', off: [4] },
    { name: 'יוסף רבבשי', off: [] },
    { name: 'יואב רוט', off: [3] },
    { name: 'פרלה שאזו', off: [4] },
  ];

  const holidays = getHolidays();
  const start = new Date(2026, 3, 6); // April 6
  const end = new Date(2026, 5, 19);  // June 19
  const schedRows = [];
  let idx = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 5 || day === 6) continue; // שישי/שבת
    const dateStr = Utilities.formatDate(d, 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (holidays.includes(dateStr)) continue;

    let attempts = 0;
    while (attempts < staffWithDays.length) {
      const staff = staffWithDays[idx % staffWithDays.length];
      if (!staff.off.includes(day)) {
        schedRows.push([dateStr, staff.name]);
        idx++;
        break;
      }
      idx++;
      attempts++;
    }
  }

  if (schedRows.length > 0) {
    schedSheet.getRange(2, 1, schedRows.length, 2).setValues(schedRows);
  }
  schedSheet.setColumnWidth(1, 120);
  schedSheet.setColumnWidth(2, 180);

  // === גיליון תיעוד ===
  let docSheet = ss.getSheetByName('תיעוד');
  if (!docSheet) {
    docSheet = ss.insertSheet('תיעוד');
  } else {
    docSheet.clear();
  }
  const headers = ['id', 'תאריך', 'שם_מורה', 'נושא', 'סוג', 'ממד', 'מיומנות', 'מטרה', 'הערות', 'קישור'];
  docSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  docSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#FCE5CD');

  // מחק גיליון ברירת מחדל אם קיים
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (defaultSheet && ss.getSheets().length > 3) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('ההתקנה הושלמה! ' + schedRows.length + ' שיבוצים נוצרו.');
  SpreadsheetApp.getUi().alert('ההתקנה הושלמה!\n\n' + staffData.length + ' אנשי צוות\n' + schedRows.length + ' שיבוצים (אפריל-יוני)\n\nעכשיו הריצי setupTriggers()');
}
