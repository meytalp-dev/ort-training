/**
 * Apps Script — קבלת תשובות שאלון "היום שלך במערכת"
 * שמירה ל-Google Sheet + שליחת מייל אישי עם הדיוקן
 */

const SHEET_ID = '1Nrn4rLyLkq2pSRAUuwHOZTcKao2_gCG9ttagWRsHR5E';
const SHEET_NAME = 'תשובות';
const NOTIFY_EMAIL = 'mlypeleg@gmail.com'; // מייל למיטל בכל תשובה חדשה

const HEADERS = [
  'תאריך',
  'תפקיד',
  'שלב חינוך',
  'גודל בי"ס',
  'נוכחות',
  'ציונים',
  'הורים',
  'מערכת שעות',
  'דוחות',
  'תכנון',
  'משמעת',
  'מחוץ למערכת',
  'דקות ביום',
  'דיוקן',
  'שם',
  'מייל',
  'מקור'
];

const PERSONAS = {
  contact:    { name:'איש הקשר',  tag:'מתחבר',           tagline:'הלב של בית הספר עובר דרכך — אתה זה שמדבר עם ההורים, מעדכן ומחבר.' },
  documenter: { name:'המתעד',     tag:'מדייק',           tagline:'נוכחות, ציונים, פרטים קטנים — אתה דואג שהכול יהיה במקום ובזמן.' },
  strategist: { name:'האסטרטג',   tag:'רואה רחוק',       tagline:'דוחות, יעדים ותכנון — אתה עובד על התמונה הגדולה, לא על הניהול היומי.' },
  pragmatist: { name:'הפרגמטי',   tag:'עוקף את הבירוקרטיה', tagline:'אקסל, וואטסאפ, גוגל שיטס — אתה משתמש במה שעובד, גם מחוץ למערכת.' },
  adaptive:   { name:'המסתגל',    tag:'מאזן בין השניים', tagline:'גם בתוך המערכת וגם בלעדיה. בוחר לכל משימה את הכלי הנכון.' },
  swift:      { name:'הזריז',     tag:'יעיל ולעניין',     tagline:'נכנס, עושה את שלך, יוצא. מעט מודולים — אבל בדיוק מה שצריך.' },
  mentor:     { name:'המנטור',    tag:'אישי וחם',         tagline:'הערות איכותיות, משוב, מעקב — אתה משקיע באנשים, לא רק בנתונים.' },
  starter:    { name:'המתחיל',    tag:'בתחילת הדרך',     tagline:'עוד גילית רק חלק מהמערכת. הרבה מקום לגדול — וגם לחסוך זמן.' },
  routine:    { name:'השגרתי',    tag:'יציב ועקבי',       tagline:'אותה שגרה, יום אחר יום, בכל המודולים. הבסיס שכולם נשענים עליו.' }
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    const persona = PERSONAS[data.persona] || { name: data.persona, tag: '', tagline: '' };

    sheet.appendRow([
      new Date(data.timestamp),
      roleLabel(data.role),
      stageLabel(data.stage),
      sizeLabel(data.schoolSize),
      freqLabel(data.modules.attendance),
      freqLabel(data.modules.grades),
      freqLabel(data.modules.parents),
      freqLabel(data.modules.timetable),
      freqLabel(data.modules.reports),
      freqLabel(data.modules.planning),
      freqLabel(data.modules.discipline),
      (data.outsideSystem || []).join(' | '),
      data.minutesPerDay,
      persona.name,
      data.name || '(אנונימי)',
      data.email || '',
      data.referrer || 'direct'
    ]);

    // Send personalized email to the respondent
    if (data.email && data.email.includes('@')) {
      sendUserEmail(data, persona);
    }

    // Notify Meytal
    notifyMeytal(data, persona);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Use POST to submit' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendUserEmail(data, persona) {
  const subject = `הדיוקן שלך — ${persona.name}`;
  const name = data.name || 'שלום';
  const activeCount = Object.values(data.modules).filter(v => v === 'daily' || v === 'often').length;
  const outsideCount = (data.outsideSystem || []).length;

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B2A3A;background:#FDFCFA">
      <div style="background:linear-gradient(135deg,#6B5BD8,#3a2b8a);color:#fff;padding:36px 24px;border-radius:24px;text-align:center;margin-bottom:24px">
        <div style="font-size:14px;opacity:.8;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">${persona.tag}</div>
        <div style="font-size:36px;font-weight:800;margin-bottom:14px">${persona.name}</div>
        <div style="font-size:15px;opacity:.9;line-height:1.5;max-width:380px;margin:0 auto">${persona.tagline}</div>
      </div>

      <div style="background:#fff;border-radius:18px;padding:24px;border:1px solid #ECE6DC;margin-bottom:20px">
        <h2 style="font-size:18px;margin:0 0 14px 0">היי ${name},</h2>
        <p style="font-size:15px;line-height:1.6;color:#5C6B7A;margin:0 0 16px 0">
          תודה שהשתתפת בפולס "היום שלך במערכת".<br>
          הדיוקן שלך הוא <strong>${persona.name}</strong> — ${persona.tagline}
        </p>

        <div style="display:flex;gap:20px;justify-content:space-around;margin:24px 0;padding:18px 0;border-top:1px solid #ECE6DC;border-bottom:1px solid #ECE6DC">
          <div style="text-align:center">
            <div style="font-size:24px;font-weight:800;color:#6B5BD8">${activeCount}</div>
            <div style="font-size:11px;color:#9AA5B0;margin-top:4px">מודולים פעילים</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:24px;font-weight:800;color:#6B5BD8">${outsideCount}</div>
            <div style="font-size:11px;color:#9AA5B0;margin-top:4px">פעולות מחוץ למערכת</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:24px;font-weight:800;color:#6B5BD8">${data.minutesPerDay}</div>
            <div style="font-size:11px;color:#9AA5B0;margin-top:4px">דקות ביום</div>
          </div>
        </div>

        <p style="font-size:14px;line-height:1.6;color:#5C6B7A;margin:0">
          אנחנו אוספים תובנות על השימוש בפועל במערכות הפדגוגיות בישראל. ככל שיותר אנשים יענו — התמונה תהיה מדויקת יותר ונוכל לבנות פתרונות שבאמת עוזרים.
        </p>

        <div style="margin-top:20px;text-align:center">
          <a href="https://meytalp-dev.github.io/ort-training/school-management-venture/usage-mapping/"
             style="display:inline-block;background:#6B5BD8;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            שלח לקולגה
          </a>
        </div>
      </div>

      <div style="text-align:center;font-size:12px;color:#9AA5B0;padding:12px">
        כלי של <strong>שתיים</strong> · מיפוי שימוש במערכות פדגוגיות<br>
        מיטל פלג
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: html,
    name: 'מיטל פלג · שתיים'
  });
}

function notifyMeytal(data, persona) {
  const subject = `פולס חדש: ${persona.name} (${data.name || 'אנונימי'})`;
  const body = `
    <div dir="rtl" style="font-family:Arial,sans-serif;padding:16px">
      <h3>תשובה חדשה לפולס "היום שלך במערכת"</h3>
      <ul style="line-height:1.8">
        <li><strong>דיוקן:</strong> ${persona.name}</li>
        <li><strong>שם:</strong> ${data.name || '(אנונימי)'}</li>
        <li><strong>מייל:</strong> ${data.email || '—'}</li>
        <li><strong>תפקיד:</strong> ${roleLabel(data.role)}</li>
        <li><strong>שלב:</strong> ${stageLabel(data.stage)}</li>
        <li><strong>גודל בי"ס:</strong> ${sizeLabel(data.schoolSize)}</li>
        <li><strong>דקות ביום:</strong> ${data.minutesPerDay}</li>
        <li><strong>מחוץ למערכת:</strong> ${(data.outsideSystem || []).length}</li>
      </ul>
    </div>
  `;
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    htmlBody: body
  });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#EDE5FA')
      .setHorizontalAlignment('right');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function roleLabel(v) {
  return { principal: 'מנהל/ת', vice: 'סגן/ית', coord: 'רכז/ת', teacher: 'מורה' }[v] || v;
}

function stageLabel(v) {
  return { elementary: 'יסודי', middle: 'חט"ב', high: 'תיכון', mixed: 'משולב' }[v] || v;
}

function sizeLabel(v) {
  return { xs: 'עד 300', s: '300-600', m: '600-900', l: 'מעל 900' }[v] || v;
}

function freqLabel(v) {
  return {
    daily: 'כל יום',
    often: 'כמה פעמים בשבוע',
    weekly: 'פעם בשבוע',
    rare: 'מדי פעם',
    never: 'לא משתמש'
  }[v] || '—';
}
