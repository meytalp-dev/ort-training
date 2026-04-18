/**
 * Google Apps Script — שתיים | מערכת גיוס משאבים
 * ═══════════════════════════════════════════════
 *
 * Sheet ID: 1MaOXuFr9bueGJj-xP1JxmV24ioZ_jXSEcWZRy-4GoPE
 * Sheet Name: שתיים — גיוס משאבים | הופה
 *
 * הוראות התקנה:
 *   1. פתחי את ה-Sheet > Extensions > Apps Script
 *   2. הדביקי את הקוד הזה בקובץ Code.gs
 *   3. הריצי initialSetup() פעם אחת — ייצור 6 גיליונות
 *   4. Deploy > New deployment > Web app (Execute as Me, Anyone)
 *   5. העתיקי את ה-URL ועדכני ב-engine.js בשורת APPS_SCRIPT_URL
 *
 * גיליונות (6):
 *   • פרופיל — פרטי העמותה (שם, מספר, תחום, אזור, תיאור)
 *   • קולות_קוראים — כל הקולות שהסוכן מצא + ידניים
 *   • קרנות — מאגר קרנות ומקורות מימון
 *   • הגשות — הגשות בתהליך (טיוטה/בכתיבה/הוגש/אושר)
 *   • פרויקטים — פרויקטים פעילים
 *   • תקציב — פירוט תקציבי לפי פרויקט
 *
 * API (doGet):
 *   ?action=getAll         — כל הנתונים (לטעינת דף)
 *   ?action=getCalls       — קולות קוראים בלבד
 *   ?action=getFunds       — קרנות בלבד
 *
 * API (doPost):
 *   action=saveCalls       — שמירת קולות קוראים (מסוכן סריקה)
 *   action=saveSubmission  — שמירת הגשה
 *   action=updateProfile   — עדכון פרופיל
 *   action=saveCall        — שמירת קול קורא בודד
 */

// ╔══════════════════════════════════════════════╗
// ║           Web App — doGet / doPost            ║
// ╚══════════════════════════════════════════════╝

function doGet(e) {
  const action = (e.parameter.action || 'getAll');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getAll') {
    return respond({
      ok: true,
      org: getProfile_(ss),
      calls: getCalls_(ss),
      funds: getFunds_(ss),
      submissions: getSubmissions_(ss),
      projects: getProjects_(ss),
      budget: getBudget_(ss)
    });
  }

  if (action === 'getCalls') {
    return respond({ ok: true, calls: getCalls_(ss) });
  }

  if (action === 'getFunds') {
    return respond({ ok: true, funds: getFunds_(ss) });
  }

  if (action === 'getProfile') {
    return respond({ ok: true, org: getProfile_(ss) });
  }

  if (action === 'getChecklist') {
    return respond({ ok: true, checklist: getChecklist_(ss) });
  }

  if (action === 'getFundNotes') {
    return respond({ ok: true, notes: getFundNotes_(ss) });
  }

  return respond({ error: 'unknown action: ' + action });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'saveCalls') {
      const count = saveCalls_(ss, data.calls);
      return respond({ ok: true, saved: count });
    }

    if (action === 'saveCall') {
      saveOneCall_(ss, data.call);
      return respond({ ok: true });
    }

    if (action === 'saveSubmission') {
      saveSubmission_(ss, data.submission);
      return respond({ ok: true });
    }

    if (action === 'updateProfile') {
      updateProfile_(ss, data.profile);
      return respond({ ok: true });
    }

    if (action === 'saveFunds') {
      const count = saveFunds_(ss, data.funds);
      return respond({ ok: true, saved: count });
    }

    if (action === 'saveChecklist') {
      saveChecklist_(ss, data.checklist);
      return respond({ ok: true });
    }

    if (action === 'saveFundNotes') {
      saveFundNotes_(ss, data.fundName, data.notes);
      return respond({ ok: true });
    }

    if (action === 'getChecklist') {
      return respond({ ok: true, checklist: getChecklist_(ss) });
    }

    if (action === 'getFundNotes') {
      return respond({ ok: true, notes: getFundNotes_(ss) });
    }

    if (action === 'clearDemo') {
      clearDemoData_(ss);
      return respond({ ok: true, cleared: ['הגשות', 'פרויקטים', 'תקציב'] });
    }

    return respond({ error: 'unknown action' });
  } catch (err) {
    return respond({ error: err.message });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ╔══════════════════════════════════════════════╗
// ║           קריאת נתונים                        ║
// ╚══════════════════════════════════════════════╝

function getProfile_(ss) {
  const sheet = ss.getSheetByName('פרופיל');
  const data = sheet.getDataRange().getValues();
  const profile = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) profile[String(data[i][0]).trim()] = String(data[i][1] || '');
  }
  return {
    name: profile['שם'] || '',
    number: profile['מספר_עמותה'] || '',
    fields: profile['תחומים'] || '',
    area: profile['אזור'] || '',
    email: profile['אימייל'] || '',
    phone: profile['טלפון'] || '',
    avatar: profile['אבטאר'] || '',
    plan: profile['חבילה'] || '',
    since: profile['שנת_הקמה'] || '',
    description: profile['תיאור'] || ''
  };
}

function getCalls_(ss) {
  const sheet = ss.getSheetByName('קולות_קוראים');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(r => r[0]).map(r => ({
    name: String(r[0] || ''),
    source: String(r[1] || ''),
    deadline: String(r[2] || ''),
    match: Number(r[3]) || 0,
    status: String(r[4] || 'open'),
    link: String(r[5] || ''),
    eligibility: String(r[6] || ''),
    amount: String(r[7] || ''),
    category: String(r[8] || ''),
    lastUpdated: String(r[9] || ''),
    notes: String(r[10] || '')
  }));
}

function getFunds_(ss) {
  const sheet = ss.getSheetByName('קרנות');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(r => r[0]).map(r => ({
    name: String(r[0] || ''),
    field: String(r[1] || ''),
    maxAmount: String(r[2] || ''),
    frequency: String(r[3] || ''),
    match: Number(r[4]) || 0,
    type: String(r[5] || ''),
    website: String(r[6] || ''),
    notes: String(r[7] || '')
  }));
}

function getSubmissions_(ss) {
  const sheet = ss.getSheetByName('הגשות');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(r => r[0]).map(r => ({
    name: String(r[0] || ''),
    fund: String(r[1] || ''),
    amount: String(r[2] || ''),
    date: String(r[3] || ''),
    status: String(r[4] || 'draft'),
    notes: String(r[5] || '')
  }));
}

function getProjects_(ss) {
  const sheet = ss.getSheetByName('פרויקטים');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(r => r[0]).map(r => ({
    name: String(r[0] || ''),
    sub: String(r[1] || ''),
    beneficiaries: Number(r[2]) || 0,
    submissions: Number(r[3]) || 0,
    progress: Number(r[4]) || 0,
    status: String(r[5] || 'open'),
    statusLabel: String(r[6] || '')
  }));
}

function getBudget_(ss) {
  const sheet = ss.getSheetByName('תקציב');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { requested: '0', approved: '0', pending: '0', items: [] };

  const items = data.slice(1).filter(r => r[0]).map(r => ({
    project: String(r[0] || ''),
    requested: String(r[1] || '0'),
    approved: String(r[2] || '0'),
    progress: Number(r[3]) || 0
  }));

  let totalReq = 0, totalApp = 0;
  items.forEach(i => {
    totalReq += parseInt(String(i.requested).replace(/[^\d]/g, '')) || 0;
    totalApp += parseInt(String(i.approved).replace(/[^\d]/g, '')) || 0;
  });

  return {
    requested: totalReq.toLocaleString() + ' ₪',
    approved: totalApp.toLocaleString() + ' ₪',
    pending: (totalReq - totalApp).toLocaleString() + ' ₪',
    items: items
  };
}

// ╔══════════════════════════════════════════════╗
// ║           כתיבת נתונים                        ║
// ╚══════════════════════════════════════════════╝

function saveCalls_(ss, calls) {
  const sheet = ss.getSheetByName('קולות_קוראים');
  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');

  let count = 0;
  calls.forEach(c => {
    // Check if already exists (by name + source)
    const existing = findRow_(sheet, c.name, c.source);
    if (existing > 0) {
      // Update existing row
      const row = existing;
      sheet.getRange(row, 3).setValue(c.deadline || '');
      sheet.getRange(row, 4).setValue(c.match || 0);
      sheet.getRange(row, 5).setValue(c.status || 'open');
      sheet.getRange(row, 6).setValue(c.link || '');
      sheet.getRange(row, 7).setValue(c.eligibility || '');
      sheet.getRange(row, 8).setValue(c.amount || '');
      sheet.getRange(row, 9).setValue(c.category || '');
      sheet.getRange(row, 10).setValue(now);
      sheet.getRange(row, 11).setValue(c.notes || '');
    } else {
      // New row
      sheet.appendRow([
        c.name, c.source, c.deadline || '', c.match || 0,
        c.status || 'open', c.link || '', c.eligibility || '',
        c.amount || '', c.category || '', now, c.notes || ''
      ]);
      count++;
    }
  });
  return count;
}

function saveOneCall_(ss, call) {
  saveCalls_(ss, [call]);
}

function saveFunds_(ss, funds) {
  const sheet = ss.getSheetByName('קרנות');
  let count = 0;
  funds.forEach(f => {
    const existing = findRow_(sheet, f.name);
    if (existing <= 0) {
      sheet.appendRow([
        f.name, f.field || '', f.maxAmount || '',
        f.frequency || '', f.match || 0,
        f.type || '', f.website || '', f.notes || ''
      ]);
      count++;
    }
  });
  return count;
}

function saveSubmission_(ss, sub) {
  const sheet = ss.getSheetByName('הגשות');
  sheet.appendRow([
    sub.name, sub.fund, sub.amount || '',
    sub.date || '', sub.status || 'draft', sub.notes || ''
  ]);
}

function updateProfile_(ss, profile) {
  const sheet = ss.getSheetByName('פרופיל');
  const data = sheet.getDataRange().getValues();
  const fields = {
    'שם': profile.name, 'מספר_עמותה': profile.number,
    'תחומים': profile.fields, 'אזור': profile.area,
    'אימייל': profile.email, 'טלפון': profile.phone,
    'אבטאר': profile.avatar, 'חבילה': profile.plan,
    'שנת_הקמה': profile.since, 'תיאור': profile.description
  };

  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    if (key in fields && fields[key] !== undefined) {
      sheet.getRange(i + 1, 2).setValue(fields[key]);
    }
  }
}

// ╔══════════════════════════════════════════════╗
// ║           checklist + הערות קרנות              ║
// ╚══════════════════════════════════════════════╝

function saveChecklist_(ss, checklist) {
  let sheet = ss.getSheetByName('checklist');
  if (!sheet) {
    sheet = ss.insertSheet('checklist');
    sheet.getRange(1, 1, 1, 3).setValues([['מסמך', 'מוכן', 'עדכון']]);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#E8F7F1');
  }
  // Clear and rewrite
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  const rows = Object.entries(checklist).map(([key, val]) => [key, val ? 'כן' : 'לא', now]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function getChecklist_(ss) {
  const sheet = ss.getSheetByName('checklist');
  if (!sheet || sheet.getLastRow() <= 1) return {};
  const data = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) result[String(data[i][0]).trim()] = String(data[i][1]) === 'כן';
  }
  return result;
}

function saveFundNotes_(ss, fundName, notes) {
  const sheet = ss.getSheetByName('קרנות');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(fundName).trim()) {
      sheet.getRange(i + 1, 8).setValue(notes); // column 8 = הערות
      return;
    }
  }
}

function getFundNotes_(ss) {
  const sheet = ss.getSheetByName('קרנות');
  const data = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][7]) {
      result[String(data[i][0]).trim()] = String(data[i][7]);
    }
  }
  return result;
}

// ╔══════════════════════════════════════════════╗
// ║           ניקוי נתוני דמו                     ║
// ╚══════════════════════════════════════════════╝

/** מנקה הגשות, פרויקטים ותקציב — משאיר רק כותרות */
function clearDemoData_(ss) {
  ['הגשות', 'פרויקטים', 'תקציב'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  });
  Logger.log('נתוני דמו נוקו: הגשות, פרויקטים, תקציב');
}

/** הריצי פעם אחת — מנקה נתוני דמו (הגשות, פרויקטים, תקציב) */
function clearDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  clearDemoData_(ss);
}

// ╔══════════════════════════════════════════════╗
// ║           פונקציות עזר                        ║
// ╚══════════════════════════════════════════════╝

/** מחפש שורה לפי ערך בעמודה 1 (ואופציונלית עמודה 2) */
function findRow_(sheet, val1, val2) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(val1).trim()) {
      if (val2 === undefined) return i + 1;
      if (String(data[i][1]).trim() === String(val2).trim()) return i + 1;
    }
  }
  return -1;
}

// ╔══════════════════════════════════════════════╗
// ║           התקנה ראשונית                       ║
// ╚══════════════════════════════════════════════╝

/** הריצי פעם אחת — יוצר 6 גיליונות עם כותרות + נתוני הופה */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // === פרופיל ===
  let profileSheet = ss.getSheetByName('פרופיל');
  if (!profileSheet) profileSheet = ss.insertSheet('פרופיל');
  else profileSheet.clear();
  profileSheet.getRange(1, 1, 1, 2).setValues([['שדה', 'ערך']]);
  profileSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#E8D5F5');
  const profileData = [
    ['שם', 'עמותת הופה'],
    ['מספר_עמותה', ''],
    ['תחומים', 'חינוך, נוער בסיכון, פיתוח קהילתי'],
    ['אזור', 'ירושלים, באר שבע, נתיבות'],
    ['אימייל', 'info@hoppa.org.il'],
    ['טלפון', ''],
    ['אבטאר', 'הפ'],
    ['חבילה', 'חבילת פרו'],
    ['שנת_הקמה', '2015'],
    ['תיאור', 'עמותת הופה פועלת מ-2015 בירושלים, באר שבע ונתיבות. תוכניות חינוכיות לנוער בסיכון — מניעת נשירה, חינוך טכנולוגי, מיומנויות חיים. 750 מוטבים ישירים, 2000 עקיפים, 92% שביעות רצון.']
  ];
  profileSheet.getRange(2, 1, profileData.length, 2).setValues(profileData);
  profileSheet.setColumnWidth(1, 140);
  profileSheet.setColumnWidth(2, 500);

  // === קולות קוראים ===
  let callsSheet = ss.getSheetByName('קולות_קוראים');
  if (!callsSheet) callsSheet = ss.insertSheet('קולות_קוראים');
  else callsSheet.clear();
  const callHeaders = ['שם', 'מקור', 'דדליין', 'התאמה%', 'סטטוס', 'לינק', 'תנאי_סף', 'סכום', 'קטגוריה', 'עדכון_אחרון', 'הערות'];
  callsSheet.getRange(1, 1, 1, callHeaders.length).setValues([callHeaders]);
  callsSheet.getRange(1, 1, 1, callHeaders.length).setFontWeight('bold').setBackground('#D9EAD3');
  // נתוני הופה
  const callsData = [
    ['שירותים בקהילה לילדים, נוער וצעירים בסיכון', 'ביטוח לאומי', '30.4.2026', 92, 'open', 'https://www.btl.gov.il/Funds/kolotkorim/Pages/new.aspx', 'עמותות/חל"צ, תחום נוער בסיכון', 'לא פורסם', 'ממשלתי', '2026-04-18', ''],
    ['"המקום" תשפ"ז — יוזמות חינוכיות', 'הקרן לעידוד יוזמות חינוכיות', '7.5.2026', 78, 'open', 'https://www.keren-yozmot.org.il/kolkore/', 'מורים/מחנכים עם יוזמה חינוכית', '5,000-10,000 ₪', 'קרן', '2026-04-18', '3 מסלולים: המקום הפתוח, לשינוי, השלם'],
    ['תמיכות למוסדות ציבור 2026', 'משרד ראש הממשלה', 'לבדוק', 65, 'open', 'https://www.gov.il/he/pages/kolkore161125', 'עמותות/חל"צ רשומות ופעילות', 'משתנה', 'ממשלתי', '2026-04-18', ''],
    ['התערבות ליקויי למידה', 'שפ"י — משרד החינוך', 'פתוח', 70, 'open', 'https://shefi.education.gov.il/publication/voices-calling/', 'חטיבות ביניים ברשויות מוגדרות', 'לא פורסם', 'ממשלתי', '2026-04-18', ''],
    ['ועדת העזבונות 2026', 'רשם העמותות / משרד המשפטים', 'צפוי בקרוב', 80, 'pending', '', 'עמותה פעילה 2+ שנים, מחזור 100K+', '~20 מיליון ₪ סה"כ', 'ממשלתי', '2026-04-18', ''],
    ['מענקים לבוגרי תוכניות', 'קרן אדמונד דה רוטשילד', 'פתוח', 35, 'pending', 'https://www.edrf.org.il/bogrim/', 'בוגרי תוכניות רוטשילד בלבד', '150,000-350,000 ₪', 'קרן', '2026-04-18', 'התאמה נמוכה'],
    ['Google.org Impact Challenge 2026', 'Google.org', 'לא ברור', 55, 'pending', '', 'ארגונים חברתיים + פתרון טכנולוגי', 'עד $3M', 'בינלאומי', '2026-04-18', '']
  ];
  if (callsData.length > 0) {
    callsSheet.getRange(2, 1, callsData.length, callHeaders.length).setValues(callsData);
  }

  // === קרנות ===
  let fundsSheet = ss.getSheetByName('קרנות');
  if (!fundsSheet) fundsSheet = ss.insertSheet('קרנות');
  else fundsSheet.clear();
  const fundHeaders = ['שם', 'תחום', 'סכום_מקסימלי', 'תדירות', 'התאמה%', 'סוג', 'אתר', 'הערות'];
  fundsSheet.getRange(1, 1, 1, fundHeaders.length).setValues([fundHeaders]);
  fundsSheet.getRange(1, 1, 1, fundHeaders.length).setFontWeight('bold').setBackground('#C9DAF8');
  const fundsData = [
    ['ביטוח לאומי — קרן ילדים ונוער', 'נוער בסיכון', 'לא פורסם', 'שנתי', 92, 'ממשלתי', 'btl.gov.il', ''],
    ['קרן ברנקו וייס', 'חינוך, חברה', '500,000 ₪', 'שנתי', 85, 'בהזמנה', '', 'פרטנר קיים'],
    ['קרן שעשוע', 'חינוך, חברה', 'לא פורסם', 'שנתי', 85, 'קול קורא', '', 'נסגר אפריל 2026, לעקוב'],
    ['JDC ישראל / אשלים', 'נוער, רווחה', '300,000 ₪', 'שנתי', 78, 'בהזמנה', '', 'פרטנר קיים'],
    ['הקרן לעידוד יוזמות חינוכיות', 'חינוך, חדשנות', '10,000 ₪', 'שנתי', 78, 'קול קורא', 'keren-yozmot.org.il', ''],
    ['ועדת העזבונות', 'כללי', '~20M סה"כ', 'שנתי', 80, 'ממשלתי', '', 'צפוי בקרוב'],
    ['קרן רשי', 'פיתוח קהילתי', '200,000 ₪', 'שנתי', 72, 'בהזמנה', 'rashi.org.il', ''],
    ['שפ"י — משרד החינוך', 'חינוך, מניעה', '100,000 ₪', 'שנתי', 70, 'ממשלתי', '', ''],
    ['קרן שוסטרמן', 'חינוך ישראלי', '250,000 ₪', 'בהזמנה', 60, 'בהזמנה', 'schusterman.org', 'לא מקבלים הצעות לא מוזמנות'],
    ['קרן גנדיר', 'צעירים בוגרים', '150,000 ₪', 'בהזמנה', 55, 'בהזמנה', 'gandyr.com', ''],
    ['Google.org', 'טכנולוגיה חברתית', '$3M', 'לא קבוע', 55, 'בינלאומי', '', '']
  ];
  if (fundsData.length > 0) {
    fundsSheet.getRange(2, 1, fundsData.length, fundHeaders.length).setValues(fundsData);
  }

  // === הגשות ===
  let subSheet = ss.getSheetByName('הגשות');
  if (!subSheet) subSheet = ss.insertSheet('הגשות');
  else subSheet.clear();
  const subHeaders = ['שם', 'קרן', 'סכום', 'תאריך_הגשה', 'סטטוס', 'הערות'];
  subSheet.getRange(1, 1, 1, subHeaders.length).setValues([subHeaders]);
  subSheet.getRange(1, 1, 1, subHeaders.length).setFontWeight('bold').setBackground('#FCE5CD');
  const subData = [
    ['תוכנית "אור בקצה"', 'קרן ברנקו וייס', '250,000 ₪', '', 'draft', ''],
    ['מניעת נשירה — שנה ב\'', 'JDC', '180,000 ₪', '', 'pending', ''],
    ['מענק לימודים — מחזור 2026', 'ביטוח לאומי', '45,000 ₪', '12.3.2026', 'submitted', '']
  ];
  subSheet.getRange(2, 1, subData.length, subHeaders.length).setValues(subData);

  // === פרויקטים ===
  let projSheet = ss.getSheetByName('פרויקטים');
  if (!projSheet) projSheet = ss.insertSheet('פרויקטים');
  else projSheet.clear();
  const projHeaders = ['שם', 'תיאור', 'מוטבים', 'הגשות', 'התקדמות%', 'סטטוס', 'תווית'];
  projSheet.getRange(1, 1, 1, projHeaders.length).setValues([projHeaders]);
  projSheet.getRange(1, 1, 1, projHeaders.length).setFontWeight('bold').setBackground('#D5A6BD');
  const projData = [
    ['תוכנית "אור בקצה"', 'חינוך לנוער בסיכון', 120, 3, 65, 'open', 'פעיל'],
    ['מעבדת מחשבים', 'STEM לפריפריה', 80, 1, 30, 'pending', 'בהקמה'],
    ['מניעת נשירה', 'שנה ב\' — המשך', 200, 2, 85, 'open', 'פעיל'],
    ['העצמת נשים', 'שיתוף פעולה עם שוסטרמן', 50, 0, 10, 'draft', 'תכנון'],
    ['ספרייה קהילתית', 'השאלת ספרים + חוגים', 300, 1, 100, 'approved', 'מאושר']
  ];
  projSheet.getRange(2, 1, projData.length, projHeaders.length).setValues(projData);

  // === תקציב ===
  let budgetSheet = ss.getSheetByName('תקציב');
  if (!budgetSheet) budgetSheet = ss.insertSheet('תקציב');
  else budgetSheet.clear();
  const budgetHeaders = ['פרויקט', 'מבוקש', 'מאושר', 'התקדמות%'];
  budgetSheet.getRange(1, 1, 1, budgetHeaders.length).setValues([budgetHeaders]);
  budgetSheet.getRange(1, 1, 1, budgetHeaders.length).setFontWeight('bold').setBackground('#FFF2CC');
  const budgetData = [
    ['תוכנית "אור בקצה"', '250,000 ₪', '0', 0],
    ['מניעת נשירה', '180,000 ₪', '0', 0],
    ['מענק לימודים', '45,000 ₪', '45,000 ₪', 100]
  ];
  budgetSheet.getRange(2, 1, budgetData.length, budgetHeaders.length).setValues(budgetData);

  // מחק גיליון ברירת מחדל
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (defaultSheet && ss.getSheets().length > 6) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('התקנה הושלמה! 6 גיליונות נוצרו עם נתוני הופה.');
  Logger.log('עכשיו: Deploy > New deployment > Web app');
}
