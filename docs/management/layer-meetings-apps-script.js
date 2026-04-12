/**
 * Google Apps Script — ישיבות רכזי שכבות | אורט בית הערבה
 *
 * תיעוד ישיבות רכזי שכבות עם מחנכות ויועצות —
 * מטרות ויעדים ב-5 תחומים, מעקב התקדמות, תלמידים בתשומת לב.
 *
 * ════════════════════════════════════════════════════════════
 * הוראות התקנה
 * ════════════════════════════════════════════════════════════
 *
 * 1. פתחי Google Drive → New → Google Sheets
 *    שם: "ישיבות רכזי שכבות — אורט בית הערבה"
 * 2. העתיקי את ה-Sheet ID מה-URL (בין /d/ ל-/edit)
 * 3. Extensions → Apps Script
 * 4. מחקי הכל והדביקי את הקוד הזה
 * 5. עדכני SHEET_ID למטה
 * 6. הריצי setupSheets() פעם אחת (כפתור Run)
 * 7. Deploy → New deployment → Web app
 *    Execute as: Me | Who has access: Anyone
 * 8. העתיקי URL → עדכני ב-layer-meetings.html
 *
 * ════════════════════════════════════════════════════════════
 */

var SHEET_ID = '1g3GXxYjK70SJqXLhHmeC6pULTKYsr7kitupiNQslbPg';

var DOMAINS = ['פדגוגי', 'חברתי', 'קשר אישי', 'רגשי', 'חמשת הממדים'];

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getMeetings':   result = getMeetings_(e.parameter.layer); break;
      case 'getMeeting':    result = getMeeting_(e.parameter.id); break;
      case 'getDashboard':  result = getDashboard_(e.parameter.layer); break;
      case 'getHistory':    result = getHistory_(e.parameter.layer); break;
      default:              result = { result: 'ok', message: 'layer-meetings API v1' };
    }
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';
    var result;

    switch (action) {
      case 'saveMeeting':     result = saveMeeting_(data); break;
      case 'updateStatus':    result = updateGoalStatus_(data); break;
      default:                result = { result: 'error', message: 'unknown action: ' + action };
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// SETUP
// ============================================

function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // meetings — פרטי ישיבה
  ensureSheet_(ss, 'meetings', [
    'id', 'timestamp', 'layer', 'coordinator', 'date', 'participants',
    'status_text', 'whats_good', 'whats_challenging', 'needs_from_management', 'notes'
  ]);

  // goals — יעדים לפי תחום
  ensureSheet_(ss, 'goals', [
    'id', 'meeting_id', 'layer', 'domain', 'goal', 'measurable_target',
    'action', 'responsible', 'deadline', 'status'
  ]);

  // attention_students — תלמידים בתשומת לב
  ensureSheet_(ss, 'attention_students', [
    'id', 'meeting_id', 'layer', 'student_name', 'student_class',
    'reason', 'plan', 'responsible', 'status'
  ]);

  SpreadsheetApp.getUi().alert('מוכן! 3 טאבים נוצרו.');
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#D4CEF0');
    sh.setFrozenRows(1);
  }
  return sh;
}

// ============================================
// WRITE — save meeting
// ============================================

function saveMeeting_(data) {
  if (!data.layer || !data.coordinator) return { result: 'error', message: 'חסרים פרטי שכבה/רכז' };
  if (!data.goals || data.goals.length === 0) return { result: 'error', message: 'חסרים יעדים' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסו שוב' };
  }

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var meetingId = data.id || ('MTG-' + Utilities.getUuid().substring(0, 8));
    var timestamp = new Date().toISOString();
    var isUpdate = !!data.id;

    if (isUpdate) {
      // עדכון ישיבה קיימת — מוחק שורות ישנות ומוסיף חדשות
      deleteRowsByMeetingId_(ss, 'goals', meetingId);
      deleteRowsByMeetingId_(ss, 'attention_students', meetingId);
      updateMeetingRow_(ss, meetingId, data, timestamp);
    } else {
      // ישיבה חדשה
      var shMeetings = ss.getSheetByName('meetings');
      shMeetings.appendRow([
        meetingId, timestamp, data.layer, data.coordinator, data.date || '',
        data.participants || '', data.status_text || '', data.whats_good || '',
        data.whats_challenging || '', data.needs_from_management || '', data.notes || ''
      ]);
    }

    // שמירת יעדים
    var shGoals = ss.getSheetByName('goals');
    data.goals.forEach(function (g) {
      shGoals.appendRow([
        Utilities.getUuid().substring(0, 8), meetingId, data.layer,
        g.domain, g.goal || '', g.measurable_target || '',
        g.action || '', g.responsible || '', g.deadline || '', g.status || 'לא התחיל'
      ]);
    });

    // שמירת תלמידים
    if (data.attention_students && data.attention_students.length > 0) {
      var shStudents = ss.getSheetByName('attention_students');
      data.attention_students.forEach(function (s) {
        shStudents.appendRow([
          Utilities.getUuid().substring(0, 8), meetingId, data.layer,
          s.student_name || '', s.student_class || '',
          s.reason || '', s.plan || '', s.responsible || '', s.status || 'פתוח'
        ]);
      });
    }

    return { result: 'success', id: meetingId, isUpdate: isUpdate };
  } finally {
    lock.releaseLock();
  }
}

function updateMeetingRow_(ss, meetingId, data, timestamp) {
  var sh = ss.getSheetByName('meetings');
  var all = sh.getDataRange().getValues();
  for (var i = 1; i < all.length; i++) {
    if (all[i][0] === meetingId) {
      var row = [
        meetingId, timestamp, data.layer, data.coordinator, data.date || '',
        data.participants || '', data.status_text || '', data.whats_good || '',
        data.whats_challenging || '', data.needs_from_management || '', data.notes || ''
      ];
      sh.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
}

function deleteRowsByMeetingId_(ss, sheetName, meetingId) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return;
  var data = sh.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === meetingId) {
      sh.deleteRow(i + 1);
    }
  }
}

// ============================================
// WRITE — update goal status
// ============================================

function updateGoalStatus_(data) {
  if (!data.goal_id || !data.status) return { result: 'error', message: 'חסר מזהה/סטטוס' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('goals');
  var all = sh.getDataRange().getValues();
  for (var i = 1; i < all.length; i++) {
    if (all[i][0] === data.goal_id) {
      sh.getRange(i + 1, 10).setValue(data.status);
      return { result: 'success' };
    }
  }
  return { result: 'error', message: 'יעד לא נמצא' };
}

// ============================================
// READ
// ============================================

function getMeetings_(layer) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var meetings = readSheet_(ss, 'meetings');
  if (layer) meetings = meetings.filter(function (m) { return m.layer === layer; });
  meetings.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
  return { result: 'success', meetings: meetings };
}

function getMeeting_(id) {
  if (!id) return { result: 'error', message: 'חסר מזהה' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var meetings = readSheet_(ss, 'meetings').filter(function (m) { return m.id === id; });
  if (meetings.length === 0) return { result: 'error', message: 'ישיבה לא נמצאה' };

  var goals = readSheet_(ss, 'goals').filter(function (g) { return g.meeting_id === id; });
  var students = readSheet_(ss, 'attention_students').filter(function (s) { return s.meeting_id === id; });

  return {
    result: 'success',
    meeting: meetings[0],
    goals: goals,
    attention_students: students
  };
}

function getDashboard_(layer) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var meetings = readSheet_(ss, 'meetings');
  var goals = readSheet_(ss, 'goals');
  var students = readSheet_(ss, 'attention_students');

  if (layer) {
    meetings = meetings.filter(function (m) { return m.layer === layer; });
    goals = goals.filter(function (g) { return g.layer === layer; });
    students = students.filter(function (s) { return s.layer === layer; });
  }

  // סטטיסטיקות יעדים
  var goalStats = { total: goals.length, completed: 0, inProgress: 0, notStarted: 0 };
  goals.forEach(function (g) {
    if (g.status === 'הושלם') goalStats.completed++;
    else if (g.status === 'בתהליך') goalStats.inProgress++;
    else goalStats.notStarted++;
  });

  // לפי שכבה
  var perLayer = {};
  meetings.forEach(function (m) {
    if (!perLayer[m.layer]) perLayer[m.layer] = { layer: m.layer, coordinator: m.coordinator, meetings: 0, lastDate: '' };
    perLayer[m.layer].meetings++;
    if (m.date > perLayer[m.layer].lastDate) perLayer[m.layer].lastDate = m.date;
  });

  // לפי תחום
  var perDomain = {};
  goals.forEach(function (g) {
    if (!perDomain[g.domain]) perDomain[g.domain] = { domain: g.domain, total: 0, completed: 0, inProgress: 0 };
    perDomain[g.domain].total++;
    if (g.status === 'הושלם') perDomain[g.domain].completed++;
    else if (g.status === 'בתהליך') perDomain[g.domain].inProgress++;
  });

  return {
    result: 'success',
    total_meetings: meetings.length,
    goal_stats: goalStats,
    per_layer: Object.keys(perLayer).map(function (k) { return perLayer[k]; }),
    per_domain: Object.keys(perDomain).map(function (k) { return perDomain[k]; }),
    attention_students: students.filter(function (s) { return s.status !== 'טופל'; }),
    recent_meetings: meetings.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; }).slice(0, 10)
  };
}

function getHistory_(layer) {
  if (!layer) return { result: 'error', message: 'חסרה שכבה' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var meetings = readSheet_(ss, 'meetings').filter(function (m) { return m.layer === layer; });
  var goals = readSheet_(ss, 'goals').filter(function (g) { return g.layer === layer; });
  var students = readSheet_(ss, 'attention_students').filter(function (s) { return s.layer === layer; });

  meetings.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });

  return {
    result: 'success',
    meetings: meetings.map(function (m) {
      return {
        meeting: m,
        goals: goals.filter(function (g) { return g.meeting_id === m.id; }),
        attention_students: students.filter(function (s) { return s.meeting_id === m.id; })
      };
    })
  };
}

// ============================================
// Helpers
// ============================================

function readSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}
