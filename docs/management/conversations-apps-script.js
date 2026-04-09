/**
 * Apps Script — שיחות אישיות
 *
 * הוראות התקנה:
 * 1. צרי Google Sheet חדש
 * 2. העתיקי את הקוד הזה ל-Apps Script (Extensions > Apps Script)
 * 3. שני את SHEET_ID למזהה של ה-Sheet
 * 4. Deploy > New Deployment > Web App > Anyone
 * 5. העתיקי את ה-URL ל-APPS_SCRIPT_URL בקובץ personal-conversations.html
 */

const SHEET_ID = '1CWQMWcr7P0lQkQzmSqQXWoV5HrZkguGXkm9Q0mJ5CSI';

function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  let result = {};

  if (action === 'getConversations') {
    result = getAllConversations();
  }

  const output = callback
    ? ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'saveConversation') {
      saveConversation(data.data);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // שיחות
  let sheet = ss.getSheetByName('שיחות');
  if (!sheet) {
    sheet = ss.insertSheet('שיחות');
    sheet.appendRow([
      'id', 'תאריך', 'תלמיד', 'כיתה', 'מחנך/מורה', 'תפקיד',
      'סוג שיחה', 'משך', 'אקדמי', 'רגשי', 'חברתי', 'התנהגותי', 'אישי',
      'מיומנויות', 'נושאים', 'קול התלמיד', 'חוזקות', 'תובנות',
      'הפניה', 'פירוט הפניה', 'יעדים', 'שיחה הבאה', 'הערות להמשך',
      'נוצר', 'עודכן'
    ]);
    sheet.getRange(1, 1, 1, 25).setFontWeight('bold').setBackground('#F5F0E8');
    sheet.setFrozenRows(1);
  }

  // לוג
  let logSheet = ss.getSheetByName('לוג');
  if (!logSheet) {
    logSheet = ss.insertSheet('לוג');
    logSheet.appendRow(['תאריך', 'משתמש', 'פעולה', 'פרטים']);
    logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
}

function saveConversation(conv) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('שיחות');
  if (!sheet) { setupSheets(); sheet = ss.getSheetByName('שיחות'); }

  // Check if exists (update) or new (append)
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === conv.id) { rowIndex = i + 1; break; }
  }

  const dims = conv.dims || {};
  const row = [
    conv.id,
    conv.date,
    conv.studentName,
    conv.studentClass,
    conv.teacher,
    conv.teacherRole,
    conv.type,
    conv.duration,
    dims.academic || '',
    dims.emotional || '',
    dims.social || '',
    dims.behavioral || '',
    dims.personal || '',
    (conv.skills || []).join(', '),
    conv.topics,
    conv.studentVoice || '',
    conv.strengths || '',
    conv.insights || '',
    conv.referral || '',
    conv.referralNote || '',
    (conv.goals || []).map(g => g.text).join(' | '),
    conv.nextDate || '',
    conv.nextNotes || '',
    conv.createdAt,
    conv.updatedAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  // Log
  const logSheet = ss.getSheetByName('לוג');
  if (logSheet) {
    logSheet.appendRow([
      new Date().toISOString(),
      conv.teacher,
      rowIndex > 0 ? 'עדכון שיחה' : 'שיחה חדשה',
      conv.studentName + ' (' + conv.studentClass + ')'
    ]);
  }
}

function getAllConversations() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('שיחות');
  if (!sheet) return { conversations: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { conversations: [] };

  const conversations = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    conversations.push({
      id: r[0],
      date: r[1],
      studentName: r[2],
      studentClass: r[3],
      teacher: r[4],
      teacherRole: r[5],
      type: r[6],
      duration: r[7],
      dims: {
        academic: r[8] || 0,
        emotional: r[9] || 0,
        social: r[10] || 0,
        behavioral: r[11] || 0,
        personal: r[12] || 0
      },
      skills: r[13] ? r[13].split(', ') : [],
      topics: r[14],
      studentVoice: r[15] || '',
      strengths: r[16] || '',
      insights: r[17] || '',
      referral: r[18] || '',
      referralNote: r[19] || '',
      goals: r[20] ? r[20].split(' | ').map(t => ({text: t, dim: '', achieved: false})) : [],
      nextDate: r[21] || '',
      nextNotes: r[22] || '',
      createdAt: r[23],
      updatedAt: r[24]
    });
  }

  return { conversations };
}
