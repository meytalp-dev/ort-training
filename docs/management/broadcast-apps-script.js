/**
 * מערכת הודעות לתפוצה — Apps Script + Green-API
 * ================================================
 *
 * הוראות התקנה:
 * 1. פתחי את Google Sheet של פתיחות בוקר:
 *    https://docs.google.com/spreadsheets/d/1YySZl7g1ABfSY-oP18jANolg113Whz5s-wBWegMmqyk
 *
 * 2. צרי גיליונות חדשים לפי הקבוצות:
 *    - "מחנכות" — עמודות: שם | טלפון | כיתה
 *    - "קבסים" — עמודות: שם | טלפון
 *    - "הורים" — עמודות: שם_הורה | טלפון | שם_תלמיד | כיתה
 *    - "צוות" — כבר קיים (שם | טלפון)
 *    - אפשר להוסיף גיליונות נוספים לפי הצורך
 *
 * 3. Extensions → Apps Script
 * 4. הוסיפי קובץ חדש (+ → Script) והדביקי את הקוד הזה
 * 5. Deploy → New deployment → Web app → Anyone can access
 * 6. העתיקי את ה-URL והדביקי ב-broadcast.html בשורת APPS_SCRIPT_URL
 *
 * 7. הריצי setupBroadcastMenu() פעם אחת — יוסיף תפריט ב-Sheet
 */

// ==================== הגדרות ====================

const BROADCAST_GREEN_API_INSTANCE = '7107577196';
const BROADCAST_GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
const BROADCAST_GREEN_API_URL = 'https://7107.api.greenapi.com';

// השהיה בין הודעות (מילישניות) — למנוע חסימה
const MESSAGE_DELAY_MS = 2500;

// גיליונות מוגדרים כקבוצות
const GROUP_SHEETS = {
  'צוות':    { nameCol: 0, phoneCol: 1, label: 'צוות בית הספר' },
  'מחנכות':  { nameCol: 0, phoneCol: 1, label: 'מחנכות כיתות', classCol: 2 },
  'קבסים':   { nameCol: 0, phoneCol: 1, label: 'קבסים' },
  'הורים':   { nameCol: 0, phoneCol: 1, label: 'הורי תלמידים', classCol: 3 }
};

// ==================== Web App ====================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'sendBroadcast') {
      const result = sendBroadcast_(data.group, data.message, data.filterClass || null);
      return jsonResponse_(result);
    }

    return jsonResponse_({ error: 'unknown action' });
  } catch(err) {
    return jsonResponse_({ error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getGroups') {
      return jsonResponse_(getGroupsInfo_(ss));
    }

    if (action === 'getContacts') {
      const group = e.parameter.group;
      const filterClass = e.parameter.filterClass || null;
      return jsonResponse_(getContacts_(ss, group, filterClass));
    }

    return jsonResponse_({ error: 'unknown action' });
  } catch(err) {
    return jsonResponse_({ error: err.message });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== קבלת מידע ====================

function getGroupsInfo_(ss) {
  const groups = [];

  for (const sheetName in GROUP_SHEETS) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    const config = GROUP_SHEETS[sheetName];
    const data = sheet.getDataRange().getValues();
    const count = data.length - 1; // minus header

    // אם יש עמודת כיתה — לאסוף כיתות ייחודיות
    let classes = [];
    if (config.classCol !== undefined) {
      const classSet = new Set();
      for (let i = 1; i < data.length; i++) {
        const cls = String(data[i][config.classCol]).trim();
        if (cls) classSet.add(cls);
      }
      classes = Array.from(classSet).sort();
    }

    groups.push({
      id: sheetName,
      label: config.label,
      count: count,
      classes: classes
    });
  }

  return { ok: true, groups: groups };
}

function getContacts_(ss, groupName, filterClass) {
  const config = GROUP_SHEETS[groupName];
  if (!config) return { error: 'קבוצה לא נמצאה: ' + groupName };

  const sheet = ss.getSheetByName(groupName);
  if (!sheet) return { error: 'גיליון לא נמצא: ' + groupName };

  const data = sheet.getDataRange().getValues();
  const contacts = [];

  for (let i = 1; i < data.length; i++) {
    const name = String(data[i][config.nameCol]).trim();
    const phone = String(data[i][config.phoneCol]).trim();

    if (!name || !phone) continue;

    // סינון לפי כיתה אם צריך
    if (filterClass && config.classCol !== undefined) {
      const cls = String(data[i][config.classCol]).trim();
      if (cls !== filterClass) continue;
    }

    contacts.push({ name: name, phone: phone });
  }

  return { ok: true, contacts: contacts, count: contacts.length };
}

// ==================== שליחת הודעות ====================

function sendBroadcast_(groupName, messageTemplate, filterClass) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactsResult = getContacts_(ss, groupName, filterClass);

  if (contactsResult.error) return contactsResult;
  if (contactsResult.count === 0) return { error: 'אין אנשי קשר בקבוצה' };

  const contacts = contactsResult.contacts;
  const results = { sent: 0, failed: 0, errors: [] };

  // לוג שליחה
  logBroadcast_(ss, groupName, filterClass, messageTemplate, contacts.length);

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    // החלפת {שם} בשם איש הקשר
    const personalMessage = messageTemplate.replace(/\{שם\}/g, contact.name);

    const success = sendBroadcastWhatsApp_(contact.phone, personalMessage);

    if (success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(contact.name);
    }

    // השהיה בין הודעות
    if (i < contacts.length - 1) {
      Utilities.sleep(MESSAGE_DELAY_MS);
    }
  }

  results.ok = true;
  results.total = contacts.length;
  return results;
}

// ==================== תיעוד ====================

function logBroadcast_(ss, group, filterClass, message, count) {
  let logSheet = ss.getSheetByName('יומן_שליחות');
  if (!logSheet) {
    logSheet = ss.insertSheet('יומן_שליחות');
    logSheet.appendRow(['תאריך', 'שעה', 'קבוצה', 'סינון כיתה', 'מספר נמענים', 'הודעה']);
  }

  const now = new Date();
  logSheet.appendRow([
    Utilities.formatDate(now, 'Asia/Jerusalem', 'dd/MM/yyyy'),
    Utilities.formatDate(now, 'Asia/Jerusalem', 'HH:mm'),
    group,
    filterClass || 'הכל',
    count,
    message.substring(0, 200)
  ]);
}

// ==================== WhatsApp ====================

function sendBroadcastWhatsApp_(phone, message) {
  const url = `${BROADCAST_GREEN_API_URL}/waInstance${BROADCAST_GREEN_API_INSTANCE}/sendMessage/${BROADCAST_GREEN_API_TOKEN}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chatId: phone + '@c.us',
        message: message
      }),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('OK → ' + phone);
      return true;
    } else {
      Logger.log('ERROR ' + code + ' → ' + phone + ': ' + response.getContentText());
      return false;
    }
  } catch(err) {
    Logger.log('FETCH ERROR → ' + phone + ': ' + err.message);
    return false;
  }
}

// ==================== תפריט Sheet ====================

function setupBroadcastMenu() {
  SpreadsheetApp.getUi().createMenu('הודעות תפוצה')
    .addItem('שלח לצוות', 'menuSendToStaff_')
    .addItem('שלח למחנכות', 'menuSendToHomeroom_')
    .addItem('שלח לקבסים', 'menuSendToKabsim_')
    .addItem('שלח להורים', 'menuSendToParents_')
    .addSeparator()
    .addItem('הצג יומן שליחות', 'menuShowLog_')
    .addToUi();
}

function onOpen() {
  setupBroadcastMenu();
}

function menuSendToStaff_() {
  const ui = SpreadsheetApp.getUi();
  const msgResult = ui.prompt('שליחה לצוות', 'הקלידי את ההודעה (השתמשי ב-{שם} לשם אישי):', ui.ButtonSet.OK_CANCEL);
  if (msgResult.getSelectedButton() !== ui.Button.OK) return;

  const confirm = ui.alert('אישור', 'לשלוח את ההודעה לכל הצוות?', ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;

  const result = sendBroadcast_('צוות', msgResult.getResponseText(), null);
  ui.alert('תוצאה', `נשלחו: ${result.sent} | נכשלו: ${result.failed}`, ui.ButtonSet.OK);
}

function menuSendToHomeroom_() {
  const ui = SpreadsheetApp.getUi();
  const msgResult = ui.prompt('שליחה למחנכות', 'הקלידי את ההודעה (השתמשי ב-{שם} לשם אישי):', ui.ButtonSet.OK_CANCEL);
  if (msgResult.getSelectedButton() !== ui.Button.OK) return;

  const confirm = ui.alert('אישור', 'לשלוח את ההודעה לכל המחנכות?', ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;

  const result = sendBroadcast_('מחנכות', msgResult.getResponseText(), null);
  ui.alert('תוצאה', `נשלחו: ${result.sent} | נכשלו: ${result.failed}`, ui.ButtonSet.OK);
}

function menuSendToKabsim_() {
  const ui = SpreadsheetApp.getUi();
  const msgResult = ui.prompt('שליחה לקבסים', 'הקלידי את ההודעה (השתמשי ב-{שם} לשם אישי):', ui.ButtonSet.OK_CANCEL);
  if (msgResult.getSelectedButton() !== ui.Button.OK) return;

  const confirm = ui.alert('אישור', 'לשלוח את ההודעה לכל הקבסים?', ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;

  const result = sendBroadcast_('קבסים', msgResult.getResponseText(), null);
  ui.alert('תוצאה', `נשלחו: ${result.sent} | נכשלו: ${result.failed}`, ui.ButtonSet.OK);
}

function menuSendToParents_() {
  const ui = SpreadsheetApp.getUi();
  const classResult = ui.prompt('שליחה להורים', 'הקלידי כיתה (או השאירי ריק לכולם):', ui.ButtonSet.OK_CANCEL);
  if (classResult.getSelectedButton() !== ui.Button.OK) return;

  const msgResult = ui.prompt('הודעה', 'הקלידי את ההודעה (השתמשי ב-{שם} לשם אישי):', ui.ButtonSet.OK_CANCEL);
  if (msgResult.getSelectedButton() !== ui.Button.OK) return;

  const filterClass = classResult.getResponseText().trim() || null;
  const confirm = ui.alert('אישור', `לשלוח את ההודעה להורים${filterClass ? ' כיתה ' + filterClass : ' — כולם'}?`, ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;

  const result = sendBroadcast_('הורים', msgResult.getResponseText(), filterClass);
  ui.alert('תוצאה', `נשלחו: ${result.sent} | נכשלו: ${result.failed}`, ui.ButtonSet.OK);
}

function menuShowLog_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName('יומן_שליחות');
  if (logSheet) {
    ss.setActiveSheet(logSheet);
  } else {
    SpreadsheetApp.getUi().alert('אין עדיין יומן שליחות');
  }
}

// ==================== בדיקה ידנית ====================

function testBroadcast() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // הצגת קבוצות
  Logger.log('=== קבוצות ===');
  const groups = getGroupsInfo_(ss);
  Logger.log(JSON.stringify(groups, null, 2));

  // הצגת אנשי קשר בצוות
  Logger.log('=== צוות ===');
  const contacts = getContacts_(ss, 'צוות', null);
  Logger.log(JSON.stringify(contacts, null, 2));
}
