/**
 * Google Apps Script — מערכת מאוחדת | אורט בית הערבה
 * ══════════════════════════════════════════════════
 *
 * כולל:
 *   1. פתיחות בוקר — שיבוצים, תזכורות, תיעוד
 *   2. תורנויות — הפסקות (07:30) + צהריים (12:00)
 *   3. תזכורות מרכזיות — דוחות, ציונים, אירועים (07:00)
 *
 * הוראות התקנה:
 *   1. פתחי את ה-Sheet: https://docs.google.com/spreadsheets/d/1YySZl7g1ABfSY-oP18jANolg113Whz5s-wBWegMmqyk
 *   2. Extensions > Apps Script
 *   3. מחקי את כל הקבצים הקיימים
 *   4. הדביקי את הקוד הזה בקובץ Code.gs
 *   5. הריצי setupAllTriggers() פעם אחת
 *   6. Deploy > New deployment > Web app (Execute as Me, Anyone)
 *
 * טריגרים (5):
 *   • 07:00 — תזכורות מרכזיות (דוחות, ציונים)
 *   • 07:30 — תזכורת תורנות הפסקות
 *   • 12:00 — תזכורת תורנות צהריים
 *   • 14:30 — תזכורת פתיחת בוקר למורה של מחר
 *   • 16:00 — בדיקה אם מורה של היום מילא טופס
 */

// ╔══════════════════════════════════════════════╗
// ║           הגדרות משותפות                     ║
// ╚══════════════════════════════════════════════╝

const GREEN_API_INSTANCE = '7107577196';
const GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
const GREEN_API_URL = 'https://7107.api.greenapi.com';

const MEYTAL_PHONE = '972536256653';
const MORNING_FORM_URL = 'https://meytalp-dev.github.io/ort-training/management/morning-opening.html';
const DUTY_PAGE_URL = 'https://meytalp-dev.github.io/ort-training/management/duties.html';

const DAY_NAMES_HEB = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

// ╔══════════════════════════════════════════════╗
// ║           WhatsApp — שליחה משותפת            ║
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
// ║           Web App — פתיחות בוקר              ║
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
// ║      פתיחות בוקר — תזכורות (14:30 + 16:00)  ║
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

  const phone = getStaffPhoneByFullName_(ss, tomorrowTeacher);
  if (!phone) { Logger.log('חסר טלפון עבור: ' + tomorrowTeacher); return; }

  const dimText = getDimensionForDate_(tomorrow);
  const dayName = formatDateHebrew_(tomorrowStr);

  const message = `שלום ${tomorrowTeacher},\n\nתזכורת: מחר (${dayName}) את/ה מעביר/ה פתיחת בוקר.${dimText ? '\nהממד: ' + dimText : ''}\n\nמה צריך לעשות?\nלתעד מה תהיה הפתיחה שלך מחר — נושא, סוג פעילות וממד.\nלחצ/י על הקישור, הוא ייפתח ישר בטופס התיעוד:\n${MORNING_FORM_URL}?tab=form\n\nצריכ/ה רעיונות והשראה?\nיש טאב "בנק רעיונות" ממש ליד טופס התיעוד — שווה להציץ!\n\nבהצלחה!`;

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

  const msg = `${todayTeacher} לא מילא/ה את טופס פתיחת הבוקר של היום (${formatDateHebrew_(today)}).\n\nקישור לטופס:\n${MORNING_FORM_URL}`;
  sendWhatsApp(MEYTAL_PHONE, msg);
  Logger.log('עדכון נשלח למיטל: ' + todayTeacher + ' לא מילא/ה');
}

// ╔══════════════════════════════════════════════╗
// ║      פתיחות בוקר — פונקציות עזר             ║
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

function getStaffPhoneByFullName_(ss, name) {
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
    '2026-04-06','2026-04-07','2026-04-08',
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
// ║      תורנויות — נתונים                       ║
// ╚══════════════════════════════════════════════╝

const AREA_EQUIPMENT = {
  'כדורגל — דשא + פינג פונג': 'כדורגל + מחבטי פינג פונג וכדורים',
  'כדורסל — פרגולה': 'כדורסל',
  'דמקה — מספרה': 'לוחות דמקה + כלים',
  'שש בש — כיתות 1-2-3': 'לוחות שש בש + קוביות',
  'כדורעף — סדנא + 7-8-9': 'כדורעף + רשת'
};

const RECESS_SCHEDULE = {
  'כדורגל — דשא + פינג פונג': {
    0: ['יוסי'], 1: ['מנו'], 2: ['גיא'], 3: ['יוסי'], 4: ['יואב']
  },
  'כדורסל — פרגולה': {
    0: ['מנו'], 1: ['אושר'], 2: ['אופירה'], 3: ['ויקי'], 4: ['נעמה']
  },
  'דמקה — מספרה': {
    0: ['מאיה'], 1: ['פרלה'], 2: ['יעל','גיא'], 3: ['לינוי'], 4: []
  },
  'שש בש — כיתות 1-2-3': {
    0: ['אפרת'], 1: ['משה'], 2: ['יואב'], 3: ['מירב'], 4: ['אליאל']
  },
  'כדורעף — סדנא + 7-8-9': {
    0: ['רעיה'], 1: ['אליאל','שי'], 2: [], 3: ['יעקב'], 4: ['שי']
  }
};

const LUNCH_SCHEDULE = {
  0: [],
  1: ['רווית', 'יסכה'],
  2: ['דורית', 'יואב'],
  3: ['רווית', 'מנו'],
  4: ['אופירה']
};

// ╔══════════════════════════════════════════════╗
// ║      תורנויות — תזכורות (07:30 + 12:00)     ║
// ╚══════════════════════════════════════════════╝

/** רץ כל יום ב-07:30 — תזכורת הפסקות */
function sendRecessReminder() {
  const dayIdx = getDutyDayIndex_();
  if (dayIdx < 0) return;

  const dayName = DAY_NAMES_HEB[dayIdx];
  const teacherDuties = {};

  for (const area in RECESS_SCHEDULE) {
    const teachers = RECESS_SCHEDULE[area][dayIdx] || [];
    teachers.forEach(name => {
      if (!teacherDuties[name]) teacherDuties[name] = [];
      teacherDuties[name].push(area);
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const name in teacherDuties) {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) { Logger.log('חסר טלפון: ' + name); continue; }

    const areas = teacherDuties[name];
    const areasText = areas.map(a => `• ${a}`).join('\n');
    const equipList = areas.map(a => AREA_EQUIPMENT[a]).filter(Boolean);
    const equipText = [...new Set(equipList)].join(', ');

    const message =
      `בוקר טוב ${name},\n\n` +
      `תזכורת: היום (יום ${dayName}) יש לך תורנות הפסקות:\n` +
      `${areasText}\n\n` +
      `אל תשכח/י לקחת איתך: ${equipText}\n\n` +
      `תודה רבה!\n` +
      `${DUTY_PAGE_URL}`;

    sendWhatsApp(phone, message);
    Logger.log('תזכורת הפסקות נשלחה ל: ' + name);
  }
}

/** רץ כל יום ב-12:00 — תזכורת צהריים */
function sendLunchReminder() {
  const dayIdx = getDutyDayIndex_();
  if (dayIdx < 0) return;

  const dayName = DAY_NAMES_HEB[dayIdx];
  const teachers = LUNCH_SCHEDULE[dayIdx] || [];
  if (teachers.length === 0) { Logger.log('אין תורנות צהריים היום'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  teachers.forEach(name => {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) { Logger.log('חסר טלפון: ' + name); return; }

    const message =
      `שלום ${name},\n\n` +
      `תזכורת: היום (יום ${dayName}) יש לך תורנות צהריים.\n` +
      `נא להגיע לחדר האוכל.\n\n` +
      `תודה רבה!`;

    sendWhatsApp(phone, message);
    Logger.log('תזכורת צהריים נשלחה ל: ' + name);
  });
}

// ╔══════════════════════════════════════════════╗
// ║      תורנויות — פונקציות עזר                 ║
// ╚══════════════════════════════════════════════╝

function getDutyDayIndex_() {
  const jsDay = new Date().getDay();
  if (jsDay === 5 || jsDay === 6) return -1;
  return jsDay;
}

function getStaffPhoneByFirst_(ss, firstName) {
  const sheet = ss.getSheetByName('צוות');
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const fullName = String(data[i][0]);
    if (fullName === firstName ||
        fullName.startsWith(firstName + ' ') ||
        fullName.endsWith(' ' + firstName) ||
        fullName.includes(' ' + firstName + ' ')) {
      return String(data[i][1]);
    }
  }
  return null;
}

// ╔══════════════════════════════════════════════╗
// ║      תזכורות מרכזיות (07:00)                ║
// ╚══════════════════════════════════════════════╝

/** רץ כל יום ב-07:00 — תזכורות מגיליון "תזכורות" */
function checkAndSendReminders() {
  const today = new Date();
  const todayStr = getTodayString_();
  const dayOfWeek = today.getDay();

  if (dayOfWeek === 5 || dayOfWeek === 6) { Logger.log('סוף שבוע'); return; }
  if (getHolidays_().includes(todayStr)) { Logger.log('חג'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('תזכורות');
  if (!sheet) { Logger.log('גיליון "תזכורות" לא נמצא'); return; }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) { Logger.log('אין תזכורות'); return; }

  const todayDay = today.getDate();
  let sentCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const type = String(row[1]).trim();
    const dayInMonth = Number(row[2]);
    const specificDate = row[3];
    const daysBefore = Number(row[4]);
    const groupName = String(row[5]).trim();
    const messageTemplate = String(row[6]).trim();
    const active = String(row[7]).trim();
    const lastSent = row[8];

    if (active !== 'כן') continue;

    let shouldSend = false;

    if (type === 'חודשית') {
      if (todayDay === dayInMonth) {
        if (!lastSent || !isSameMonth_(lastSent, today)) shouldSend = true;
      }
    } else if (type === 'לפני_אירוע') {
      if (specificDate) {
        const targetDate = new Date(specificDate);
        targetDate.setDate(targetDate.getDate() - (daysBefore || 0));
        const targetStr = Utilities.formatDate(targetDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
        if (todayStr === targetStr) {
          const lastSentStr = lastSent ? Utilities.formatDate(new Date(lastSent), 'Asia/Jerusalem', 'yyyy-MM-dd') : '';
          if (lastSentStr !== todayStr) shouldSend = true;
        }
      }
    } else if (type === 'חד_פעמית') {
      if (specificDate) {
        const eventStr = Utilities.formatDate(new Date(specificDate), 'Asia/Jerusalem', 'yyyy-MM-dd');
        if (todayStr === eventStr && !lastSent) shouldSend = true;
      }
    }

    if (!shouldSend) continue;

    const members = getGroupMembers_(groupName);
    if (members.length === 0) { Logger.log('קבוצה ריקה: ' + groupName); continue; }

    let groupSentOk = false;
    for (const member of members) {
      const firstName = member.name.split(' ')[0];
      const personalMessage = messageTemplate.replace(/\{שם\}/g, firstName);
      const ok = sendWhatsApp(member.phone, personalMessage);
      if (ok) { groupSentOk = true; sentCount++; }
      Utilities.sleep(1000);
    }

    if (groupSentOk) sheet.getRange(i + 1, 9).setValue(new Date());
  }

  Logger.log('סיום — נשלחו ' + sentCount + ' הודעות תזכורת');
}

function isSameMonth_(dateValue, referenceDate) {
  const d = new Date(dateValue);
  return d.getMonth() === referenceDate.getMonth() && d.getFullYear() === referenceDate.getFullYear();
}

function getGroupMembers_(groupName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('קבוצות');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const members = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === groupName) {
      members.push({ name: String(data[i][1]).trim(), phone: String(data[i][2]).trim() });
    }
  }
  return members;
}

function sendReminderNow(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('תזכורות');
  if (!sheet) return;
  const actualRow = rowIndex + 1;
  if (actualRow > sheet.getLastRow()) return;

  const row = sheet.getRange(actualRow, 1, 1, 9).getValues()[0];
  const groupName = String(row[5]).trim();
  const messageTemplate = String(row[6]).trim();
  if (!messageTemplate) return;

  const members = getGroupMembers_(groupName);
  let sentCount = 0;
  for (const member of members) {
    const firstName = member.name.split(' ')[0];
    const personalMessage = messageTemplate.replace(/\{שם\}/g, firstName);
    if (sendWhatsApp(member.phone, personalMessage)) sentCount++;
    Utilities.sleep(1000);
  }
  sheet.getRange(actualRow, 9).setValue(new Date());
  Logger.log('תזכורת ידנית — ' + sentCount + '/' + members.length + ' לקבוצה ' + groupName);
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

  // שלב 2: 14.4–12.5 בלי יואב — ממשיך מהרוטציה המקורית (ליאת הבאה בתור)
  const staffNoYoav = [
    { name: 'ליאת רוזנר', off: [] },
    { name: 'אפרת בר אשר', off: [3] }, { name: 'רווית גל', off: [] },
    { name: 'יעקב גרונספלד', off: [] }, { name: 'עמנואל דהאן', off: [] },
    { name: 'יסכה הגר', off: [] }, { name: 'דורית ויגדור', off: [4] },
    { name: 'מריאן זרצקי', off: [] }, { name: 'יעל טטנבאום', off: [] },
    { name: 'רעיה יצחקי', off: [4] }, { name: 'מיטל לאלום', off: [] },
    { name: 'אופירה מלכה', off: [1] }, { name: 'צהיי גטהון', off: [4] },
    { name: 'גיא נתנאל', off: [] }, { name: 'משה צברי', off: [] },
    { name: 'נעמה קוסטן', off: [] }, { name: 'ויקטוריה קלדרון', off: [4] },
    { name: 'יוסף רבבשי', off: [] }, { name: 'פרלה שאזו', off: [4] },
    { name: 'מיטל פלג', off: [] }, { name: 'אושר אהרוני', off: [] },
    { name: 'שי בגלר', off: [] }, { name: 'מירב בטיטו', off: [1] },
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
// ║      התקנת טריגרים — בטוח! לא מוחק אחרים   ║
// ╚══════════════════════════════════════════════╝

// כל הפונקציות שמנוהלות ע"י המערכת הזו
const MANAGED_FUNCTIONS = [
  'sendDailyReminder',      // פתיחות בוקר 14:30
  'checkAndNotifyManager',  // פתיחות בוקר 16:00
  'checkAndSendReminders',  // תזכורות מרכזיות 07:00
  'sendRecessReminder',     // תורנויות הפסקות 07:30
  'sendLunchReminder',      // תורנויות צהריים 12:00
];

/**
 * הריצי פעם אחת — יוצר את כל 5 הטריגרים
 * מוחק רק טריגרים של המערכת הזו, לא נוגע באחרים!
 */
function setupAllTriggers() {
  // מחק רק טריגרים שלנו
  ScriptApp.getProjectTriggers().forEach(t => {
    if (MANAGED_FUNCTIONS.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 07:00 — תזכורות מרכזיות
  ScriptApp.newTrigger('checkAndSendReminders')
    .timeBased().atHour(7).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 07:30 — תורנויות הפסקות
  ScriptApp.newTrigger('sendRecessReminder')
    .timeBased().atHour(7).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 12:00 — תורנויות צהריים
  ScriptApp.newTrigger('sendLunchReminder')
    .timeBased().atHour(12).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 14:30 — פתיחת בוקר למורה של מחר
  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased().atHour(14).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 16:00 — בדיקה אם מולא טופס
  ScriptApp.newTrigger('checkAndNotifyManager')
    .timeBased().atHour(16).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  Logger.log('5 טריגרים הוגדרו: 07:00 תזכורות, 07:30 הפסקות, 12:00 צהריים, 14:30 פתיחת בוקר, 16:00 בדיקת טופס');
}

// ╔══════════════════════════════════════════════╗
// ║      התקנה ראשונית + גיליונות תזכורות        ║
// ╚══════════════════════════════════════════════╝

function setupReminderSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let groupSheet = ss.getSheetByName('קבוצות');
  if (!groupSheet) { groupSheet = ss.insertSheet('קבוצות'); } else { groupSheet.clear(); }

  groupSheet.getRange(1, 1, 1, 3).setValues([['שם_קבוצה', 'שם', 'טלפון']]);
  groupSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#B7E1CD');

  const groupData = [
    ['מחנכות', 'אושר אהרוני', '972508882402'],
    ['מחנכות', 'משה צברי', '972547195033'],
    ['מחנכות', 'רעיה יצחקי', '972504726066'],
    ['מחנכות', 'אופירה מלכה', '972534438414'],
    ['מחנכות', 'פרלה שאזו', '972525115337'],
    ['מחנכות', 'יעקב גרונספלד', '972546995254'],
    ['מחנכות', 'נעמה קוסטן', '972524295181'],
    ['מחנכות', 'גיא נתנאל', '972542007155'],
    ['מחנכות', 'עמנואל דהאן', '972505852852'],
    ['מחנכות', 'יוסף רבבשי', '972506563344'],
    ['מחנכות', 'יואב רוט', '972527218003'],
    ['יועצות', 'ליאת רוזנר', '972528980191'],
    ['יועצות', 'דורית ויגדור', '972523464235'],
    ['יועצות', 'צהיי גטהון', '972527783903'],
    ['הנהלה', 'מיטל פלג', '972536256653'],
    ['הנהלה', 'רווית גל', '972503993021'],
    ['בעלי_תפקידים', 'יסכה הגר', '972526995309'],
    ['בעלי_תפקידים', 'יעקב גרונספלד', '972546995254'],
    ['בעלי_תפקידים', 'רווית גל', '972503993021'],
    ['בעלי_תפקידים', 'אופירה מלכה', '972534438414'],
    ['כל_הצוות', 'אושר אהרוני', '972508882402'],
    ['כל_הצוות', 'שי בגלר', '972522285773'],
    ['כל_הצוות', 'מירב בטיטו', '972584807906'],
    ['כל_הצוות', 'ליאת רוזנר', '972528980191'],
    ['כל_הצוות', 'אפרת בר אשר', '972522460684'],
    ['כל_הצוות', 'רווית גל', '972503993021'],
    ['כל_הצוות', 'יעקב גרונספלד', '972546995254'],
    ['כל_הצוות', 'עמנואל דהאן', '972505852852'],
    ['כל_הצוות', 'יסכה הגר', '972526995309'],
    ['כל_הצוות', 'דורית ויגדור', '972523464235'],
    ['כל_הצוות', 'מריאן זרצקי', '972507596570'],
    ['כל_הצוות', 'יעל טטנבאום', '972527078485'],
    ['כל_הצוות', 'רעיה יצחקי', '972504726066'],
    ['כל_הצוות', 'מיטל לאלום', '972506239018'],
    ['כל_הצוות', 'אופירה מלכה', '972534438414'],
    ['כל_הצוות', 'צהיי גטהון', '972527783903'],
    ['כל_הצוות', 'גיא נתנאל', '972542007155'],
    ['כל_הצוות', 'משה צברי', '972547195033'],
    ['כל_הצוות', 'נעמה קוסטן', '972524295181'],
    ['כל_הצוות', 'ויקטוריה קלדרון', '972586528820'],
    ['כל_הצוות', 'יוסף רבבשי', '972506563344'],
    ['כל_הצוות', 'יואב רוט', '972527218003'],
    ['כל_הצוות', 'פרלה שאזו', '972525115337'],
  ];

  groupSheet.getRange(2, 1, groupData.length, 3).setValues(groupData);
  groupSheet.setRightToLeft(true);
  groupSheet.setColumnWidth(1, 140);
  groupSheet.setColumnWidth(2, 180);
  groupSheet.setColumnWidth(3, 150);

  let reminderSheet = ss.getSheetByName('תזכורות');
  if (!reminderSheet) { reminderSheet = ss.insertSheet('תזכורות'); } else { reminderSheet.clear(); }

  reminderSheet.getRange(1, 1, 1, 9).setValues([['id', 'סוג', 'יום_בחודש', 'תאריך', 'ימים_לפני', 'קבוצה', 'הודעה', 'פעיל', 'נשלח_לאחרונה']]);
  reminderSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#D9D2E9');

  const reminderData = [
    [1, 'חודשית', 28, '', '', 'מחנכות', 'שלום {שם}, תזכורת: יש למלא דוח מחנך חודשי עד סוף החודש.\nקישור: https://meytalp-dev.github.io/ort-training/management/monthly-reports.html', 'כן', ''],
    [2, 'חודשית', 28, '', '', 'יועצות', 'שלום {שם}, תזכורת: יש למלא דוח יועצת חודשי עד סוף החודש.\nקישור: https://meytalp-dev.github.io/ort-training/management/monthly-reports.html', 'כן', ''],
    [3, 'חודשית', 25, '', '', 'מחנכות', 'שלום {שם}, תזכורת: יש לעדכן ציונים במערכת עד סוף החודש.', 'כן', ''],
    [4, 'חודשית', 1, '', '', 'הנהלה', 'שלום {שם}, תחילת חודש חדש. סיכום חודש קודם זמין בדשבורד הדוחות.', 'כן', ''],
  ];

  reminderSheet.getRange(2, 1, reminderData.length, 9).setValues(reminderData);
  reminderSheet.setRightToLeft(true);
  reminderSheet.setColumnWidth(1, 40);
  reminderSheet.setColumnWidth(2, 100);
  reminderSheet.setColumnWidth(3, 90);
  reminderSheet.setColumnWidth(4, 110);
  reminderSheet.setColumnWidth(5, 80);
  reminderSheet.setColumnWidth(6, 110);
  reminderSheet.setColumnWidth(7, 400);
  reminderSheet.setColumnWidth(8, 60);
  reminderSheet.setColumnWidth(9, 130);

  Logger.log('גיליונות תזכורות וקבוצות נוצרו!');
}

// ╔══════════════════════════════════════════════╗
// ║      בדיקות                                  ║
// ╚══════════════════════════════════════════════╝

function testWhatsApp() {
  const ok = sendWhatsApp(MEYTAL_PHONE, 'בדיקת מערכת מאוחדת — פתיחות בוקר + תורנויות — הכל עובד!');
  Logger.log(ok ? 'הודעה נשלחה' : 'שליחה נכשלה');
}

function testMorningReminder() { sendDailyReminder(); }
function testManagerNotify() { checkAndNotifyManager(); }
function testRecessReminder() { sendRecessReminder(); }
function testLunchReminder() { sendLunchReminder(); }
function testCentralReminders() { checkAndSendReminders(); }

function testAllReminders() {
  Logger.log('=== פתיחת בוקר ===');
  sendDailyReminder();
  Logger.log('=== הפסקות ===');
  sendRecessReminder();
  Logger.log('=== צהריים ===');
  sendLunchReminder();
  Logger.log('=== תזכורות מרכזיות ===');
  checkAndSendReminders();
}

function showSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('שיבוצים');
  const data = sheet.getDataRange().getValues();
  data.slice(1).forEach(row => Logger.log(row[0] + ' → ' + row[1]));
}
