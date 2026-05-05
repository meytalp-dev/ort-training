/**
 * Apps Script v3 — מיפוי שימוש במערכות פדגוגיות
 * שאלות ארכיטיפ (לא תלונות): תפקיד, מערכת, תדירות, מתי, מטרה, מחוץ למערכת
 * 2 גיליונות נפרדים: מורות + מנהלות
 */

const SHEET_ID = '1Nrn4rLyLkq2pSRAUuwHOZTcKao2_gCG9ttagWRsHR5E';
const NOTIFY_EMAIL = 'mlypeleg@gmail.com';

const HEADERS_TEACHER = [
  'תאריך','תפקיד','שלב','שלב-אחר','גודל','מערכת','מערכת-אחר',
  'נוכחות','ציונים','התנהגות','הודעות הורים','תיעוד שיעורים','מעקב אישי','הערכות',
  'מתי','מתי-אחר','מטרה עיקרית','מטרה-אחר',
  'מחוץ למערכת','מחוץ-אחר','דקות בשבוע',
  'ארכיטיפ','שם','מייל','מקור'
];

const HEADERS_PRINCIPAL = [
  'תאריך','תפקיד','שלב','שלב-אחר','גודל','מערכת','מערכת-אחר',
  'דוחות','ניהול צוות','תקשורת הורים','ועדות','תקציב','תכנון','רגולציה',
  'מתי','מתי-אחר','מטרה עיקרית','מטרה-אחר',
  'מחוץ למערכת','מחוץ-אחר','דקות ביום',
  'ארכיטיפ','שם','מייל','מקור'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet(data.audience);
    const isTeacher = data.audience === 'teacher';

    let row;
    if (isTeacher) {
      row = [
        new Date(),
        roleLabel(data.role, true),
        stageLabel(data.stage),
        data.stageOther || '',
        sizeLabel(data.schoolSize),
        systemLabel(data.system),
        data.systemOther || '',
        freqLabel(data.modules.attendance),
        freqLabel(data.modules.grades),
        freqLabel(data.modules.behavior),
        freqLabel(data.modules.parents_msg),
        freqLabel(data.modules.lesson_plan),
        freqLabel(data.modules.individual),
        freqLabel(data.modules.assessments),
        whenLabel(data.whenUse),
        data.whenOther || '',
        purposeLabel(data.purpose, true),
        data.purposeOther || '',
        (data.outsideSystem || []).join(' | '),
        data.outsideOther || '',
        data.minutesPerDay,
        data.personaName || data.persona,
        data.name || '(אנונימי)',
        data.email || '',
        data.referrer || 'direct'
      ];
    } else {
      row = [
        new Date(),
        roleLabel(data.role, false),
        stageLabel(data.stage),
        data.stageOther || '',
        sizeLabel(data.schoolSize),
        systemLabel(data.system),
        data.systemOther || '',
        freqLabel(data.modules.reports_data),
        freqLabel(data.modules.staff_mgmt),
        freqLabel(data.modules.parents_comm),
        freqLabel(data.modules.committees),
        freqLabel(data.modules.budget_admin),
        freqLabel(data.modules.planning),
        freqLabel(data.modules.regulation),
        whenLabel(data.whenUse),
        data.whenOther || '',
        purposeLabel(data.purpose, false),
        data.purposeOther || '',
        (data.outsideSystem || []).join(' | '),
        data.outsideOther || '',
        data.minutesPerDay,
        data.personaName || data.persona,
        data.name || '(אנונימי)',
        data.email || '',
        data.referrer || 'direct'
      ];
    }

    sheet.appendRow(row);

    if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      try { sendUserEmail(data); } catch(err) { console.error('user email failed', err); }
    }
    try { notifyMeytal(data); } catch(err) { console.error('notify failed', err); }

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(audience) {
  const sheetName = audience === 'teacher' ? 'מורות' : 'מנהלות';
  const headers = audience === 'teacher' ? HEADERS_TEACHER : HEADERS_PRINCIPAL;
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground(audience === 'teacher' ? '#DEF3EE' : '#EDE5FA')
      .setHorizontalAlignment('right');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendUserEmail(data) {
  const name = data.name || 'שלום';
  const persona = data.personaName || data.persona;
  const activeCount = Object.values(data.modules).filter(v => v === 'daily' || v === 'often').length;
  const audienceLabel = data.audience === 'teacher' ? 'מורות' : 'מנהלות';
  const purposeText = purposeLabel(data.purpose, data.audience === 'teacher') + (data.purposeOther ? ` (${data.purposeOther})` : '');

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B2A3A;background:#FDFCFA">
      <div style="background:#3a2b8a;color:#fff;padding:36px 24px;border-radius:24px;text-align:center;margin-bottom:24px">
        <div style="font-size:13px;opacity:.8;letter-spacing:2px;margin-bottom:8px">הארכיטיפ שלך</div>
        <div style="font-family:Arial;font-size:36px;font-weight:800;margin-bottom:6px">${persona}</div>
        <div style="font-size:13px;opacity:.7">קהל המחקר: ${audienceLabel}</div>
      </div>
      <div style="background:#fff;border-radius:18px;padding:24px;border:1px solid #ECE6DC">
        <h2 style="font-size:18px;margin:0 0 14px 0">היי ${name},</h2>
        <p style="font-size:15px;line-height:1.6;color:#5C6B7A;margin:0 0 16px 0">
          תודה שהשתתפת במחקר על שימוש במערכות פדגוגיות.<br>
          המטרה העיקרית שלך במערכת: <strong>${purposeText}</strong>.
        </p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;border-top:1px solid #ECE6DC;border-bottom:1px solid #ECE6DC">
          <tr>
            <td align="center" style="padding:16px;width:33%">
              <div style="font-size:24px;font-weight:800;color:#6B5BD8">${activeCount}</div>
              <div style="font-size:11px;color:#9AA5B0;margin-top:4px">מודולים פעילים</div>
            </td>
            <td align="center" style="padding:16px;width:33%">
              <div style="font-size:24px;font-weight:800;color:#6B5BD8">${(data.outsideSystem||[]).length}</div>
              <div style="font-size:11px;color:#9AA5B0;margin-top:4px">מחוץ למערכת</div>
            </td>
            <td align="center" style="padding:16px;width:33%">
              <div style="font-size:24px;font-weight:800;color:#6B5BD8">${data.minutesPerDay}</div>
              <div style="font-size:11px;color:#9AA5B0;margin-top:4px">דקות</div>
            </td>
          </tr>
        </table>
        <p style="font-size:14px;line-height:1.6;color:#5C6B7A;margin:0 0 16px 0">
          כשנגיע ל-50 משיבים אשלח לך את הסיכום המצרפי — איפה הקהל שלך נמצא יחסית לאחרים, ומה הארכיטיפים השכיחים.
        </p>
        <div style="margin-top:20px;text-align:center">
          <a href="https://meytalp-dev.github.io/ort-training/school-management-venture/usage-mapping/" style="display:inline-block;background:#6B5BD8;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">שלחי לקולגה</a>
        </div>
      </div>
      <div style="text-align:center;font-size:12px;color:#9AA5B0;padding:12px;line-height:1.5">
        <strong>מיטל פלג</strong> · מנהלת תיכון 5 שנים<br>
        מחקר במסגרת שתיים — ייעוץ למוסדות חינוך
      </div>
    </div>`;

  const plainBody = `היי ${name},\n\nהארכיטיפ שלך: ${persona}\nמטרה עיקרית: ${purposeText}\n\nתודה שהשתתפת במחקר.\n\nמיטל פלג · שתיים`;

  MailApp.sendEmail({
    to: data.email,
    subject: `הארכיטיפ שלך — ${persona}`,
    htmlBody: html,
    body: plainBody,
    name: 'מיטל פלג · שתיים'
  });
}

function notifyMeytal(data) {
  const persona = data.personaName || data.persona;
  const audienceLabel = data.audience === 'teacher' ? 'מורה' : 'מנהל/ת';
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `מיפוי חדש: ${audienceLabel} → ${persona}`,
    htmlBody: `<div dir="rtl" style="font-family:Arial;padding:16px">
      <h3>תשובה חדשה למיפוי שימוש</h3>
      <ul style="line-height:1.8">
        <li><b>קהל:</b> ${audienceLabel}</li>
        <li><b>ארכיטיפ:</b> ${persona}</li>
        <li><b>שם:</b> ${data.name || '(אנונימי)'}</li>
        <li><b>מייל:</b> ${data.email || '—'}</li>
        <li><b>תפקיד:</b> ${roleLabel(data.role, data.audience === 'teacher')}</li>
        <li><b>שלב:</b> ${stageLabel(data.stage)}${data.stageOther ? ` — "${data.stageOther}"` : ''}</li>
        <li><b>גודל:</b> ${sizeLabel(data.schoolSize)}</li>
        <li><b>מערכת:</b> ${systemLabel(data.system)}${data.systemOther ? ` — "${data.systemOther}"` : ''}</li>
        <li><b>מתי במערכת:</b> ${whenLabel(data.whenUse)}${data.whenOther ? ` — "${data.whenOther}"` : ''}</li>
        <li><b>מטרה עיקרית:</b> ${purposeLabel(data.purpose, data.audience === 'teacher')}${data.purposeOther ? ` — "${data.purposeOther}"` : ''}</li>
        <li><b>זמן:</b> ${data.minutesPerDay} דקות</li>
        <li><b>מחוץ למערכת:</b> ${(data.outsideSystem||[]).length} פריטים${data.outsideOther ? ` — "${data.outsideOther}"` : ''}</li>
      </ul>
    </div>`
  });
}

function roleLabel(v, isTeacher) {
  const teacherMap = {
    subject:'מורה מקצוע', homeroom:'מחנך/ת', inclusion:'שילוב/חינוך מיוחד',
    counselor:'יועץ/ת', coord_subject:'רכז/ת מקצוע', coord_grade:'רכז/ת שכבה'
  };
  const principalMap = {
    principal:'מנהל/ת', vice:'סגן/ית', admin:'אדמיניסטרטיבי/ת',
    pedagog_lead:'רכז/ת פדגוגי/ת', secretary:'מזכיר/ה פדגוגי/ת'
  };
  return (isTeacher ? teacherMap : principalMap)[v] || v;
}

function stageLabel(v) {
  return {
    kindergarten:'גן ילדים', elementary:'יסודי', middle:'חט"ב', high:'תיכון',
    vocational:'מקצועי', special:'חינוך מיוחד', mixed:'משולב', other:'אחר'
  }[v] || v;
}

function sizeLabel(v) {
  return {
    xs:'עד 200', s:'200-500', m:'500-800', l:'800-1200', xl:'מעל 1200', unknown:'לא יודע/ת'
  }[v] || v;
}

function systemLabel(v) {
  return {
    manbas:'מנב"סנט', mashov:'משוב', smart:'סמארט סקול', tiktak:'תיק תק',
    pilon:'פילון', iscool:'Iscool', multi:'משלב כמה', other:'אחר'
  }[v] || v;
}

function whenLabel(v) {
  return {
    morning:'תחילת יום', breaks:'בהפסקות', end_school:'בסוף יום בבי"ס',
    evening:'בערב/בבית', allday:'לאורך היום', weekend:'בעיקר בסופ"ש', other:'אחר'
  }[v] || v || '';
}

function purposeLabel(v, isTeacher) {
  const teacherMap = {
    documenting:'תיעוד', communication:'תקשורת', individual:'מעקב אישי',
    mandates:'חובות מערכתיות', teaching:'הוראה ולמידה', feedback:'משוב והערכה', other:'אחר'
  };
  const principalMap = {
    analysis:'ניתוח נתונים', communication:'תקשורת', operations:'תפעול שוטף',
    planning:'תכנון ויעדים', mandates:'חובות רגולציה', committees:'ועדות', other:'אחר'
  };
  return (isTeacher ? teacherMap : principalMap)[v] || v || '';
}

function freqLabel(v) {
  return {
    daily:'כל יום', often:'כמה פעמים בשבוע', weekly:'פעם בשבוע',
    rare:'מדי פעם', never:'לא משתמש'
  }[v] || '—';
}
