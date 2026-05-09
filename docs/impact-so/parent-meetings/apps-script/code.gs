/**
 * Parent-Meetings — Backend (Google Apps Script)
 * ================================================
 * דיפלוי:
 *  1. ב-Google Sheets, פתחי Extensions → Apps Script.
 *  2. הדביקי את כל הקובץ הזה.
 *  3. Deploy → New deployment → Web app.
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. העתיקי את ה-Web App URL ל-assets/config.js (PARENT_MEETINGS_API_URL).
 *
 * תזכורת אוטומטית:
 *  הפעילי פעם אחת את `installReminderTrigger()` בעורך —
 *  היא תיצור טריגר זמן שרץ פעם בשעה ובודק לאיזה אירוע מחר חסרה תזכורת.
 *
 * Sheets שייווצרו אוטומטית:
 *  - Events    — אירועים
 *  - Students  — רשימות תלמידים לכל אירוע
 *  - Bookings  — רישומים בפועל
 */

const SHEETS = {
  EVENTS: 'Events',
  STUDENTS: 'Students',
  BOOKINGS: 'Bookings',
};

const HEADERS = {
  Events: ['eventId','token','title','teacherName','teacherEmail','date','startTime','endTime','slotMinutes','reminderHour','createdAt'],
  Students: ['eventId','studentName','parentEmail','parentPhone'],
  Bookings: ['eventId','studentName','slot','parentName','parentEmail','parentPhone','bookedAt','reminderSent'],
};

// === Web App entry points ===
function doPost(e){
  return handle(e);
}
function doGet(e){
  return handle(e);
}

function handle(e){
  try {
    const action = (e.parameter && e.parameter.action) || '';
    let payload = {};
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch(_){}
    }
    Object.assign(payload, e.parameter || {});

    let result;
    switch(action){
      case 'createEvent':   result = createEvent(payload); break;
      case 'getEvent':      result = getEvent(payload); break;
      case 'bookSlot':      result = bookSlot(payload); break;
      case 'voiceBook':     result = voiceBook(payload); break;
      case 'getBookings':   result = getBookingsForTeacher(payload); break;
      case 'cancelBooking': result = cancelBooking(payload); break;
      default: throw new Error('Unknown action: ' + action);
    }
    return json({ ok:true, result });
  } catch(err){
    return json({ ok:false, error: String(err.message || err) });
  }
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// === Sheet helpers ===
function getSheet(name){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll(name){
  const sh = getSheet(name);
  const range = sh.getDataRange().getValues();
  if (range.length <= 1) return [];
  const headers = range[0];
  return range.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendRow(name, obj){
  const sh = getSheet(name);
  const headers = HEADERS[name];
  sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
}

function updateRow(name, predicate, updater){
  const sh = getSheet(name);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, j) => obj[h] = data[i][j]);
    if (predicate(obj)) {
      const newObj = updater(obj);
      headers.forEach((h, j) => sh.getRange(i+1, j+1).setValue(newObj[h] !== undefined ? newObj[h] : ''));
      return true;
    }
  }
  return false;
}

function deleteRow(name, predicate){
  const sh = getSheet(name);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  for (let i = data.length - 1; i >= 1; i--) {
    const obj = {};
    headers.forEach((h, j) => obj[h] = data[i][j]);
    if (predicate(obj)) {
      sh.deleteRow(i+1);
      return true;
    }
  }
  return false;
}

// === IDs ===
function genId(prefix){
  return prefix + '_' + Utilities.getUuid().replace(/-/g,'').slice(0,12);
}

// === Actions ===
function createEvent(p){
  if (!p.title || !p.date || !p.startTime || !p.endTime || !p.slotMinutes)
    throw new Error('חסרים פרטי אירוע');
  if (!Array.isArray(p.students) || p.students.length === 0)
    throw new Error('יש להזין לפחות תלמיד אחד');

  const eventId = genId('evt');
  const token = genId('tok');

  appendRow('Events', {
    eventId,
    token,
    title: p.title,
    teacherName: p.teacherName || '',
    teacherEmail: p.teacherEmail || Session.getActiveUser().getEmail() || '',
    date: p.date,
    startTime: p.startTime,
    endTime: p.endTime,
    slotMinutes: p.slotMinutes,
    reminderHour: p.reminderHour || '18:00',
    createdAt: new Date().toISOString(),
  });

  p.students.forEach(s => {
    appendRow('Students', {
      eventId,
      studentName: s.name,
      parentEmail: s.parentEmail || '',
      parentPhone: s.parentPhone || '',
    });
  });

  return { eventId, token };
}

function findEvent(eventId){
  const events = readAll('Events');
  const e = events.find(x => x.eventId === eventId);
  if (!e) throw new Error('האירוע לא נמצא');
  return e;
}

function getEvent(p){
  const e = findEvent(p.eventId);
  const students = readAll('Students').filter(s => s.eventId === p.eventId);
  const bookings = readAll('Bookings').filter(b => b.eventId === p.eventId);
  // Public-safe view
  return {
    eventId: e.eventId, title: e.title, teacherName: e.teacherName,
    date: formatDate(e.date), startTime: formatTime(e.startTime),
    endTime: formatTime(e.endTime), slotMinutes: Number(e.slotMinutes),
    students: students.map(s => ({ name: s.studentName })),
    taken: bookings.map(b => ({ slot: b.slot, studentName: b.studentName })),
  };
}

function bookSlot(p){
  if (!p.eventId || !p.studentName || !p.slot) throw new Error('פרטי הזמנה חסרים');
  const e = findEvent(p.eventId);

  // Lock to prevent double-booking under concurrency
  const lock = LockService.getDocumentLock();
  lock.waitLock(8000);
  try {
    const bookings = readAll('Bookings').filter(b => b.eventId === p.eventId);
    if (bookings.some(b => b.slot === p.slot))
      throw new Error('השעה הזו כבר תפוסה');
    if (bookings.some(b => b.studentName === p.studentName))
      throw new Error('כבר נרשמה פגישה לתלמיד הזה');

    appendRow('Bookings', {
      eventId: p.eventId,
      studentName: p.studentName,
      slot: p.slot,
      parentName: p.parentName || '',
      parentEmail: p.parentEmail || '',
      parentPhone: p.parentPhone || '',
      bookedAt: new Date().toISOString(),
      reminderSent: 'false',
    });
  } finally {
    lock.releaseLock();
  }

  // Send confirmation email
  if (p.parentEmail) {
    try {
      sendConfirmationEmail(e, p);
    } catch(err) {
      Logger.log('Mail error: ' + err);
    }
  }

  return { ok: true };
}

function getBookingsForTeacher(p){
  const e = findEvent(p.eventId);
  if (e.token !== p.token) throw new Error('אין הרשאה');
  const students = readAll('Students').filter(s => s.eventId === p.eventId);
  const bookings = readAll('Bookings').filter(b => b.eventId === p.eventId);
  return {
    eventId: e.eventId, title: e.title, teacherName: e.teacherName,
    date: formatDate(e.date), startTime: formatTime(e.startTime),
    endTime: formatTime(e.endTime), slotMinutes: Number(e.slotMinutes),
    reminderHour: formatTime(e.reminderHour), token: e.token,
    students: students.map(s => ({
      name: s.studentName, parentEmail: s.parentEmail, parentPhone: s.parentPhone,
    })),
    bookings: bookings.map(b => ({
      studentName: b.studentName, slot: b.slot,
      parentName: b.parentName, parentEmail: b.parentEmail, parentPhone: b.parentPhone,
      bookedAt: b.bookedAt,
    })),
  };
}

function cancelBooking(p){
  const e = findEvent(p.eventId);
  if (e.token !== p.token) throw new Error('אין הרשאה');
  const ok = deleteRow('Bookings', b => b.eventId === p.eventId && b.slot === p.slot);
  return { ok };
}

// === Format helpers (Sheets stores dates as Date objects) ===
function formatDate(v){
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v).slice(0,10);
}
function formatTime(v){
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(v).slice(0,5);
}

// === Emails ===
function sendConfirmationEmail(event, booking){
  const subject = `אישור פגישה — ${event.title}`;
  const date = formatDate(event.date);
  const teacher = event.teacherName || '';
  const html = `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#F9FAFB;padding:30px;color:#111827">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden">
        <div style="background:#111827;color:#fff;padding:18px 24px">
          <div style="font-size:20px;font-weight:800;letter-spacing:-1px">Impact<span style="color:#F9A8D4">OS</span></div>
          <div style="font-size:11px;opacity:.6">אישור פגישה — אסיפת הורים</div>
        </div>
        <div style="padding:26px 24px">
          <div style="font-size:13px;color:#6B7280;margin-bottom:6px">${escapeXml(teacher)}</div>
          <h1 style="font-size:22px;font-weight:800;margin:0 0 14px;color:#111827">${escapeXml(event.title)}</h1>
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:14px;margin:14px 0">
            <div style="font-size:13px;line-height:1.9">
              <strong>תלמיד/ה:</strong> ${escapeXml(booking.studentName)}<br>
              <strong>תאריך:</strong> ${date}<br>
              <strong>שעה:</strong> <span style="color:#EC4899;font-weight:700">${escapeXml(booking.slot)}</span>
            </div>
          </div>
          <p style="font-size:13px;color:#6B7280;line-height:1.7">
            תקבלו תזכורת אוטומטית במייל יום לפני האסיפה.
            במקרה של שינוי או ביטול אנא צרו קשר עם המורה.
          </p>
          <p style="font-size:11px;color:#9CA3AF;margin-top:24px">ImpactOS · אסיפות הורים · learni.ai</p>
        </div>
      </div>
    </div>`;
  MailApp.sendEmail({
    to: booking.parentEmail,
    subject,
    htmlBody: html,
  });
}

function sendReminderEmail(event, booking){
  const subject = `תזכורת — מחר פגישת הורים, ${booking.slot}`;
  const date = formatDate(event.date);
  const teacher = event.teacherName || '';
  const html = `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#F9FAFB;padding:30px;color:#111827">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden">
        <div style="background:#111827;color:#fff;padding:18px 24px">
          <div style="font-size:20px;font-weight:800;letter-spacing:-1px">Impact<span style="color:#F9A8D4">OS</span></div>
          <div style="font-size:11px;opacity:.6">תזכורת לפגישה — מחר</div>
        </div>
        <div style="padding:26px 24px">
          <div style="font-size:13px;color:#6B7280;margin-bottom:6px">${escapeXml(teacher)}</div>
          <h1 style="font-size:22px;font-weight:800;margin:0 0 14px;color:#111827">תזכורת: מחר אסיפת הורים</h1>
          <div style="background:#FCE7F3;border:1px solid #F9A8D4;border-radius:10px;padding:14px;margin:14px 0">
            <div style="font-size:13px;line-height:1.9">
              <strong>תלמיד/ה:</strong> ${escapeXml(booking.studentName)}<br>
              <strong>תאריך:</strong> ${date}<br>
              <strong>שעה:</strong> <span style="color:#EC4899;font-weight:700;font-size:18px">${escapeXml(booking.slot)}</span><br>
              <strong>אירוע:</strong> ${escapeXml(event.title)}
            </div>
          </div>
          <p style="font-size:13px;color:#6B7280;line-height:1.7">
            נתראה מחר! אם אתם צריכים לשנות או לבטל, פנו ישירות למורה.
          </p>
          <p style="font-size:11px;color:#9CA3AF;margin-top:24px">ImpactOS · אסיפות הורים · learni.ai</p>
        </div>
      </div>
    </div>`;
  MailApp.sendEmail({
    to: booking.parentEmail,
    subject,
    htmlBody: html,
  });
}

function escapeXml(s){
  return String(s||'').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
}

// === Reminder trigger ===
/**
 * הריצי פעם אחת ידנית כדי להתקין טריגר שעתי.
 */
function installReminderTrigger(){
  // Remove old triggers for this function
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendDueReminders')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendDueReminders')
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log('Reminder trigger installed (runs hourly).');
}

/**
 * רץ אוטומטית כל שעה. שולח תזכורות לכל הפגישות שמחר ועדיין לא נשלחה אליהן תזכורת,
 * אם השעה הנוכחית >= שעת התזכורת שהוגדרה באירוע.
 */
function sendDueReminders(){
  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = Utilities.formatDate(tomorrow, tz, 'yyyy-MM-dd');
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const events = readAll('Events');
  const bookings = readAll('Bookings');

  let sent = 0;
  events.forEach(e => {
    const eDate = formatDate(e.date);
    if (eDate !== tomorrowStr) return;
    const reminderHour = formatTime(e.reminderHour) || '18:00';
    const [rh, rm] = reminderHour.split(':').map(Number);
    const reminderMin = rh*60 + rm;
    if (nowMin < reminderMin) return; // not yet

    const eventBookings = bookings.filter(b => b.eventId === e.eventId && String(b.reminderSent) !== 'true' && b.parentEmail);
    eventBookings.forEach(b => {
      try {
        sendReminderEmail(e, b);
        updateRow('Bookings',
          x => x.eventId === b.eventId && x.studentName === b.studentName && x.slot === b.slot,
          x => Object.assign({}, x, { reminderSent: 'true' })
        );
        sent++;
      } catch(err) {
        Logger.log('Reminder failed for ' + b.parentEmail + ': ' + err);
      }
    });
  });
  Logger.log('Reminders sent: ' + sent);
  return sent;
}

// === One-time setup helper ===
function setupSheets(){
  Object.keys(SHEETS).forEach(k => getSheet(SHEETS[k]));
  Logger.log('Sheets ready: ' + Object.values(SHEETS).join(', '));
}

// === Voice booking (Gemini) ===
/**
 * מקבל הקלטה קולית מההורה, מחלץ פרטים דרך Gemini ומחזיר טופס מוכן לאישור.
 * payload: { eventId, audioBase64, mimeType }
 *
 * דרישה: הוסיפי GEMINI_API_KEY ב-Project Settings → Script Properties.
 */
function voiceBook(p){
  if (!p.eventId || !p.audioBase64) throw new Error('חסרים פרטי הקלטה');

  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API key לא מוגדר. הוסיפי GEMINI_API_KEY ב-Script Properties.');

  const e = findEvent(p.eventId);
  const students = readAll('Students').filter(s => s.eventId === p.eventId);
  const bookings = readAll('Bookings').filter(b => b.eventId === p.eventId);

  const startTime = formatTime(e.startTime);
  const endTime = formatTime(e.endTime);
  const slotMinutes = Number(e.slotMinutes);
  const allSlots = buildSlotsServer(startTime, endTime, slotMinutes);
  const taken = new Set(bookings.map(b => b.slot));
  const availableSlots = allSlots.filter(s => !taken.has(s));
  const studentsAvailable = students
    .map(s => s.studentName)
    .filter(name => !bookings.some(b => b.studentName === name));

  if (studentsAvailable.length === 0) throw new Error('אין תלמידים פנויים לרישום');
  if (availableSlots.length === 0) throw new Error('אין שעות פנויות');

  const systemPrompt =
    'את עוזרת רישום לאסיפת הורים. ההורה שלח/ה הודעה קולית בעברית. חלצי ממנה את הפרטים הבאים והחזירי JSON תקין בלבד.\n\n' +
    'רשימת תלמידים פנויים לרישום (חייב להתאים אחד מהם בדיוק):\n' +
    studentsAvailable.map((n,i) => (i+1) + '. ' + n).join('\n') + '\n\n' +
    'האסיפה מתקיימת בין ' + startTime + ' ל-' + endTime + ', סלוטים של ' + slotMinutes + ' דקות.\n' +
    'שעות פנויות: ' + availableSlots.join(', ') + '\n\n' +
    'החזירי JSON עם המפתחות הבאים:\n' +
    '{\n' +
    '  "studentName": "שם מדויק מהרשימה למעלה, או null אם לא ברור",\n' +
    '  "preferredSlot": "שעה משוערת בפורמט HH:MM (קרבי לרבע השעה הקרוב מתוך השעות הפנויות), או null",\n' +
    '  "parentName": "שם ההורה כפי שאמר/ה, או null",\n' +
    '  "parentPhone": "מספר טלפון של 10 ספרות (אם נאמר), או null",\n' +
    '  "parentEmail": "כתובת מייל אם הוזכרה, או null",\n' +
    '  "notes": "הערות חשובות נוספות שההורה אמר/ה (לא חובה)"\n' +
    '}\n\n' +
    'חשוב: אם ההורה אמר/ה רק חלק מהפרטים — מלאי את מה שיש והשאירי השאר null. אל תמציאי.';

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
  const requestBody = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { inline_data: { mime_type: p.mimeType || 'audio/webm', data: p.audioBase64 } },
      ],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Gemini error ' + code + ': ' + response.getContentText().slice(0, 300));
  }

  const data = JSON.parse(response.getContentText());
  const textOut = data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;

  if (!textOut) throw new Error('לא הצלחתי לחלץ פרטים מההקלטה');

  let parsed;
  try { parsed = JSON.parse(textOut); }
  catch(_){ throw new Error('תשובה לא תקינה מהמודל'); }

  let matchedStudent = null;
  if (parsed.studentName) {
    const exact = studentsAvailable.find(n => n === parsed.studentName);
    matchedStudent = exact
      || studentsAvailable.find(n => n.indexOf(parsed.studentName) >= 0)
      || studentsAvailable.find(n => parsed.studentName.indexOf(n) >= 0);
  }

  let suggestedSlot = null;
  if (parsed.preferredSlot && availableSlots.indexOf(parsed.preferredSlot) >= 0) {
    suggestedSlot = parsed.preferredSlot;
  } else if (parsed.preferredSlot) {
    suggestedSlot = nearestSlotServer(parsed.preferredSlot, availableSlots);
  }

  return {
    matchedStudent: matchedStudent || null,
    suggestedSlot: suggestedSlot || null,
    availableSlots,
    studentsAvailable,
    parentName: parsed.parentName || '',
    parentPhone: cleanPhoneServer(parsed.parentPhone) || '',
    parentEmail: parsed.parentEmail || '',
    notes: parsed.notes || '',
  };
}

function buildSlotsServer(startTime, endTime, slotMinutes){
  const t = function(s){ const a = s.split(':').map(Number); return a[0]*60 + a[1]; };
  const tt = function(m){
    return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
  };
  const s = t(startTime), e = t(endTime), step = Number(slotMinutes) || 10;
  const out = [];
  for (let i = s; i + step <= e; i += step) out.push(tt(i));
  return out;
}

function nearestSlotServer(target, slots){
  if (!slots.length) return null;
  const t = function(s){ const a = String(s).split(':').map(Number); return a[0]*60 + a[1]; };
  const targetMin = t(target);
  let best = slots[0], bestDiff = Math.abs(t(slots[0]) - targetMin);
  for (let i = 1; i < slots.length; i++) {
    const diff = Math.abs(t(slots[i]) - targetMin);
    if (diff < bestDiff) { best = slots[i]; bestDiff = diff; }
  }
  return best;
}

function cleanPhoneServer(s){
  if (!s) return '';
  const digits = String(s).replace(/[^\d]/g, '');
  if (digits.length === 9 && digits.charAt(0) !== '0') return '0' + digits;
  return digits;
}
