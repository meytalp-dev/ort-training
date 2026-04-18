/**
 * Google Apps Script — פתיחות בוקר | אורט בית הערבה
 * ══════════════════════════════════════════════════
 *
 * מערכת נפרדת לפתיחות בוקר בלבד.
 * שיבוצים, תיעוד, ותזכורות WhatsApp למורים.
 *
 * הוראות התקנה:
 *   1. פתחי Google Sheet חדש בשם "פתיחות בוקר — אורט בית הערבה"
 *   2. Extensions > Apps Script
 *   3. הדביקי את הקוד הזה בקובץ Code.gs
 *   4. הריצי initialSetup() פעם אחת — ייצור גיליונות + שיבוצים
 *   5. הריצי updateScheduleYoavMiluim() — עדכון מילואים יואב
 *   6. הריצי setupTriggers() פעם אחת
 *   7. Deploy > New deployment > Web app (Execute as Me, Anyone)
 *   8. העתיקי את ה-URL ועדכני ב-morning-opening.html בשורת APPS_SCRIPT_URL
 *
 * טריגרים (2):
 *   • 14:30 — תזכורת פתיחת בוקר למורה של מחר
 *   • 16:00 — בדיקה אם מורה של היום מילא טופס
 *
 * גיליונות (3):
 *   • צוות — שם | טלפון
 *   • שיבוצים — תאריך | שם
 *   • תיעוד — id | תאריך | שם_מורה | נושא | סוג | ממד | מיומנות | מטרה | הערות | קישור
 */

// ╔══════════════════════════════════════════════╗
// ║           הגדרות                              ║
// ╚══════════════════════════════════════════════╝

const GREEN_API_INSTANCE = PropertiesService.getScriptProperties().getProperty('GREEN_API_ID_INSTANCE') || '';
const GREEN_API_TOKEN = PropertiesService.getScriptProperties().getProperty('GREEN_API_TOKEN_INSTANCE') || '';
const GREEN_API_URL = 'https://7107.api.greenapi.com';

const MEYTAL_PHONE = '972536256653';
const FORM_URL = 'https://meytalp-dev.github.io/ort-training/management/morning-opening.html';

const DAY_NAMES_HEB = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

// ╔══════════════════════════════════════════════╗
// ║           WhatsApp — Green-API                ║
// ╚══════════════════════════════════════════════╝

function sendWhatsApp(phone, message) {
  const url = `${GREEN_API_URL}/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chatId: phone + '@c.us', message: message }),
      muteHttpExceptions: true
    });
    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('WhatsApp sent to ' + phone);
      return true;
    } else {
      Logger.log('WhatsApp error: ' + code + ' — ' + response.getContentText());
      return false;
    }
  } catch(err) {
    Logger.log('WhatsApp fetch error: ' + err.message);
    return false;
  }
}

// ╔══════════════════════════════════════════════╗
// ║           Web App — doPost / doGet            ║
// ╚══════════════════════════════════════════════╝

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'syncSchedule') {
      syncScheduleToSheet_(ss, data.schedule);
      return ContentService.createTextOutput(JSON.stringify({ok: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveDoc') {
      saveDocToSheet_(ss, data.entry);
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

// ╔══════════════════════════════════════════════╗
// ║           סנכרון נתונים                       ║
// ╚══════════════════════════════════════════════╝

function syncScheduleToSheet_(ss, scheduleData) {
  const sheet = ss.getSheetByName('שיבוצים');
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  }
  const rows = scheduleData.map(s => [s.date, s.name]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function saveDocToSheet_(ss, entry) {
  const sheet = ss.getSheetByName('תיעוד');
  sheet.appendRow([
    entry.id || Date.now(), entry.date, entry.teacher, entry.topic,
    entry.type, entry.dim, entry.skill, entry.goal || '',
    entry.notes || '', entry.link || ''
  ]);
}

// ╔══════════════════════════════════════════════╗
// ║      תזכורות — 14:30 + 16:00                 ║
// ╚══════════════════════════════════════════════╝

/** רץ כל יום ב-14:30 — תזכורת למורה של מחר */
function sendDailyReminder() {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tomorrow = getNextSchoolDay_();
  if (!tomorrow) { Logger.log('אין יום לימודים מחר'); return; }

  const tomorrowStr = Utilities.formatDate(tomorrow, 'Asia/Jerusalem', 'yyyy-MM-dd');
  const tomorrowTeacher = getTeacherForDate_(ss, tomorrowStr);
  if (!tomorrowTeacher) { Logger.log('אין שיבוץ למחר: ' + tomorrowStr); return; }

  const phone = getStaffPhone_(ss, tomorrowTeacher);
  if (!phone) { Logger.log('חסר טלפון עבור: ' + tomorrowTeacher); return; }

  const dimText = getDimensionForDate_(tomorrow);
  const dayName = formatDateHebrew_(tomorrowStr);

  const message = `שלום ${tomorrowTeacher},\n\nתזכורת: מחר (${dayName}) את/ה מעביר/ה פתיחת בוקר.${dimText ? '\nהממד: ' + dimText : ''}\n\nמה צריך לעשות?\nלתעד מה תהיה הפתיחה שלך מחר — נושא, סוג פעילות וממד.\nלחצ/י על הקישור, הוא ייפתח ישר בטופס התיעוד:\n${FORM_URL}?tab=form\n\nצריכ/ה רעיונות והשראה?\nיש טאב "בנק רעיונות" ממש ליד טופס התיעוד — שווה להציץ!\n\nבהצלחה!`;

  sendWhatsApp(phone, message);
  Logger.log('תזכורת פתיחת בוקר נשלחה ל: ' + tomorrowTeacher);
}

/** רץ כל יום ב-16:00 — בדיקה אם מולא טופס */
function checkAndNotifyManager() {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) return;

  const today = getTodayString_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (getHolidays_().includes(today)) return;

  const todayTeacher = getTeacherForDate_(ss, today);
  if (!todayTeacher) return;

  if (hasDocForToday_(ss, todayTeacher, today)) {
    Logger.log(todayTeacher + ' מילא/ה — הכל בסדר');
    return;
  }

  const msg = `${todayTeacher} לא מילא/ה את טופס פתיחת הבוקר של היום (${formatDateHebrew_(today)}).\n\nקישור לטופס:\n${FORM_URL}`;
  sendWhatsApp(MEYTAL_PHONE, msg);
  Logger.log('עדכון נשלח למיטל: ' + todayTeacher + ' לא מילא/ה');
}

// ╔══════════════════════════════════════════════╗
// ║           פונקציות עזר                        ║
// ╚══════════════════════════════════════════════╝

function getTeacherForDate_(ss, dateStr) {
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowDate = Utilities.formatDate(new Date(data[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (rowDate === dateStr) return data[i][1];
  }
  return null;
}

function getStaffPhone_(ss, name) {
  const sheet = ss.getSheetByName('צוות');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === name) return String(data[i][1]);
  }
  return null;
}

function hasDocForToday_(ss, teacherName, today) {
  const sheet = ss.getSheetByName('תיעוד');
  if (sheet.getLastRow() <= 1) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === today && String(data[i][2]) === teacherName) return true;
  }
  return false;
}

function getNextSchoolDay_() {
  const now = new Date();
  const today = now.getDay();
  let daysToAdd = 1;
  if (today === 4) daysToAdd = 3;
  if (today === 5) daysToAdd = 2;
  if (today === 6) daysToAdd = 1;

  const next = new Date(now);
  next.setDate(next.getDate() + daysToAdd);

  const holidays = getHolidays_();
  for (let i = 0; i < 30; i++) {
    const checkStr = Utilities.formatDate(next, 'Asia/Jerusalem', 'yyyy-MM-dd');
    const checkDay = next.getDay();
    if (checkDay >= 0 && checkDay <= 4 && !holidays.includes(checkStr)) return next;
    next.setDate(next.getDate() + 1);
  }
  return null;
}

function getHolidays_() {
  return [
    '2026-03-24','2026-03-25','2026-03-26','2026-03-27','2026-03-28',
    '2026-03-29','2026-03-30','2026-03-31',
    '2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05',
    // בית הספר חזר ב-6.4
    '2026-04-21','2026-04-22',
  ];
}

function getDimensionForDate_(date) {
  const month = date.getMonth();
  if (month === 8 || month === 9) return 'שייכות';
  if (month === 10 || month === 11) return 'כבוד';
  if (month === 0 || month === 1) return 'מוטיבציה פנימית';
  if (month === 2 || month === 3) return 'מסוגלות ומימוש עצמי';
  if (month === 4 || month === 5) return 'אוטונומיה';
  return '';
}

function getTodayString_() {
  return Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
}

function formatDateHebrew_(dateStr) {
  const d = new Date(dateStr);
  return `יום ${DAY_NAMES_HEB[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

// ╔══════════════════════════════════════════════╗
// ║      עדכון שיבוצים — יואב רוט מילואים       ║
// ╚══════════════════════════════════════════════╝

/**
 * הריצי פעם אחת — יואב במילואים 14.4–12.5, חוזר 13.5
 */
function updateScheduleYoavMiluim() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();

  const keepRows = [];
  for (let i = 1; i < data.length; i++) {
    const dateStr = Utilities.formatDate(new Date(data[i][0]), 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (dateStr < '2026-04-14') keepRows.push([dateStr, data[i][1]]);
  }

  // שלב 2: 14.4–12.5 בלי יואב
  const staffNoYoav = [
    { name: 'אפרת בר אשר', off: [3] }, { name: 'רווית גל', off: [] },
    { name: 'יעקב גרונספלד', off: [] }, { name: 'עמנואל דהאן', off: [] },
    { name: 'יסכה הגר', off: [] }, { name: 'דורית ויגדור', off: [4] },
    { name: 'מריאן זרצקי', off: [] }, { name: 'יעל טטנבאום', off: [] },
    { name: 'רעיה יצחקי', off: [4] }, { name: 'מיטל לאלום', off: [] },
    { name: 'אופירה מלכה', off: [1] }, { name: 'צהיי גטהון', off: [4] },
    { name: 'גיא נתנאל', off: [] }, { name: 'משה צברי', off: [] },
    { name: 'נעמה קוסטן', off: [] }, { name: 'ויקטוריה קלדרון', off: [4] },
    { name: 'פרלה שאזו', off: [4] },  // לפני יוסף — תיקון באג רוטציה
    { name: 'יוסף רבבשי', off: [] },
    { name: 'אושר אהרוני', off: [] }, { name: 'שי בגלר', off: [] },
    { name: 'מירב בטיטו', off: [1] }, { name: 'ליאת רוזנר', off: [] },
  ];

  const holidays = getHolidays_();
  const phase2Rows = generateScheduleRows_(staffNoYoav, new Date(2026,3,14), new Date(2026,4,12), holidays);

  // שלב 3: 13.5–19.6 עם יואב חזרה
  const staffWithYoav = [
    { name: 'יואב רוט', off: [3] },
    ...staffNoYoav
  ];
  const phase3Rows = generateScheduleRows_(staffWithYoav, new Date(2026,4,13), new Date(2026,5,19), holidays);

  const allRows = keepRows.concat(phase2Rows).concat(phase3Rows);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  if (allRows.length > 0) sheet.getRange(2, 1, allRows.length, 2).setValues(allRows);

  Logger.log('שיבוצים עודכנו! ' + keepRows.length + ' נשמרו, ' + phase2Rows.length + ' בלי יואב, ' + phase3Rows.length + ' עם יואב');
}

function generateScheduleRows_(staffList, startDate, endDate, holidays) {
  const rows = [];
  let idx = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 5 || day === 6) continue;
    const dateStr = Utilities.formatDate(d, 'Asia/Jerusalem', 'yyyy-MM-dd');
    if (holidays.includes(dateStr)) continue;

    let attempts = 0;
    while (attempts < staffList.length) {
      const staff = staffList[idx % staffList.length];
      if (!staff.off.includes(day)) {
        rows.push([dateStr, staff.name]);
        idx++;
        break;
      }
      idx++;
      attempts++;
    }
  }
  return rows;
}

// ╔══════════════════════════════════════════════╗
// ║           טריגרים                             ║
// ╚══════════════════════════════════════════════╝

const MANAGED_FUNCTIONS = ['sendDailyReminder', 'checkAndNotifyManager'];

/** הריצי פעם אחת */
function setupTriggers() {
  // מחק רק טריגרים שלנו
  ScriptApp.getProjectTriggers().forEach(t => {
    if (MANAGED_FUNCTIONS.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 14:30 — תזכורת למורה של מחר
  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased().atHour(14).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 16:00 — בדיקה אם מולא טופס
  ScriptApp.newTrigger('checkAndNotifyManager')
    .timeBased().atHour(16).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  Logger.log('2 טריגרים הוגדרו: 14:30 תזכורת פתיחת בוקר, 16:00 בדיקת טופס');
}

// ╔══════════════════════════════════════════════╗
// ║           התקנה ראשונית                       ║
// ╚══════════════════════════════════════════════╝

/** הריצי פעם אחת — יוצר גיליונות + צוות + שיבוצים */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // === גיליון צוות ===
  let staffSheet = ss.getSheetByName('צוות');
  if (!staffSheet) { staffSheet = ss.insertSheet('צוות'); } else { staffSheet.clear(); }

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
  if (!schedSheet) { schedSheet = ss.insertSheet('שיבוצים'); } else { schedSheet.clear(); }

  schedSheet.getRange(1, 1, 1, 2).setValues([['תאריך', 'שם']]);
  schedSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#C9DAF8');

  // שיבוצים ראשוניים (לפני עדכון מילואים)
  const staffWithDays = [
    { name: 'אושר אהרוני', off: [] }, { name: 'שי בגלר', off: [] },
    { name: 'מירב בטיטו', off: [1] }, { name: 'ליאת רוזנר', off: [] },
    { name: 'אפרת בר אשר', off: [3] }, { name: 'רווית גל', off: [] },
    { name: 'יעקב גרונספלד', off: [] }, { name: 'עמנואל דהאן', off: [] },
    { name: 'יסכה הגר', off: [] }, { name: 'דורית ויגדור', off: [4] },
    { name: 'מריאן זרצקי', off: [] }, { name: 'יעל טטנבאום', off: [] },
    { name: 'רעיה יצחקי', off: [4] }, { name: 'מיטל לאלום', off: [] },
    { name: 'אופירה מלכה', off: [1] }, { name: 'צהיי גטהון', off: [4] },
    { name: 'גיא נתנאל', off: [] }, { name: 'משה צברי', off: [] },
    { name: 'נעמה קוסטן', off: [] }, { name: 'ויקטוריה קלדרון', off: [4] },
    { name: 'יוסף רבבשי', off: [] }, { name: 'יואב רוט', off: [3] },
    { name: 'פרלה שאזו', off: [4] },
  ];

  const holidays = getHolidays_();
  const schedRows = generateScheduleRows_(staffWithDays, new Date(2026,3,9), new Date(2026,5,19), holidays);

  if (schedRows.length > 0) {
    schedSheet.getRange(2, 1, schedRows.length, 2).setValues(schedRows);
  }
  schedSheet.setColumnWidth(1, 120);
  schedSheet.setColumnWidth(2, 180);

  // === גיליון תיעוד ===
  let docSheet = ss.getSheetByName('תיעוד');
  if (!docSheet) { docSheet = ss.insertSheet('תיעוד'); } else { docSheet.clear(); }

  const headers = ['id', 'תאריך', 'שם_מורה', 'נושא', 'סוג', 'ממד', 'מיומנות', 'מטרה', 'הערות', 'קישור'];
  docSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  docSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#FCE5CD');

  // מחק גיליון ברירת מחדל
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (defaultSheet && ss.getSheets().length > 3) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('ההתקנה הושלמה! ' + staffData.length + ' אנשי צוות, ' + schedRows.length + ' שיבוצים.');
  Logger.log('עכשיו הריצי: updateScheduleYoavMiluim() ואז setupTriggers()');
}

// ╔══════════════════════════════════════════════╗
// ║           בדיקות                              ║
// ╚══════════════════════════════════════════════╝

function testWhatsApp() {
  const ok = sendWhatsApp(MEYTAL_PHONE, 'בדיקת מערכת פתיחות בוקר (Sheet נפרד) — הכל עובד!');
  Logger.log(ok ? 'הודעה נשלחה' : 'שליחה נכשלה');
}

function testMorningReminder() { sendDailyReminder(); }
function testManagerNotify() { checkAndNotifyManager(); }

function showSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();
  data.slice(1).forEach(row => Logger.log(row[0] + ' → ' + row[1]));
}
