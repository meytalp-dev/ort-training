/**
 * Google Apps Script — תוכנית שנתית למורה | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "תוכנית מורים תשפ"ז — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupTeacherPlanSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL ושימי אותו ב-APPS_SCRIPT_URL בקובץ teacher-plan.html
 */

var SHEET_ID = '1HdO7WDtNRP1T3wMoRf1X8RCha59DLfTSPADTiPJuNuA';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getTeacherPlan':
        result = getTeacherPlan_(e.parameter.teacherId);
        break;
      case 'getAllTeacherPlans':
        result = getAllTeacherPlans_();
        break;
      case 'getApprovalQueue':
        result = getApprovalQueue_();
        break;
      default:
        result = { result: 'ok', message: 'teacher-plan API active' };
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
      case 'saveTeacherPlan':
        result = saveTeacherPlan_(data.teacherId, data.plan);
        break;
      case 'submitForReview':
        result = submitForReview_(data.teacherId);
        break;
      case 'updateApproval':
        result = updateApproval_(data.teacherId, data.status, data.reviewer, data.notes);
        break;
      default:
        result = { result: 'error', message: 'unknown action' };
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
// READ — getTeacherPlan (single teacher)
// ============================================

function getTeacherPlan_(teacherId) {
  if (!teacherId) return { result: 'error', message: 'no teacherId specified' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var plan = {
    teacherId: teacherId,
    profile: readTeacherProfile_(ss, teacherId),
    overview: readOverview_(ss, teacherId),
    internalExams: readInternalExams_(ss, teacherId),
    topics: readTopics_(ss, teacherId),
    weeklyPlans: readWeeklyPlans_(ss, teacherId),
    pbl: readPbl_(ss, teacherId),
    status: readStatus_(ss, teacherId)
  };

  return { result: 'success', plan: plan };
}

// ============================================
// READ — getAllTeacherPlans (for dashboard)
// ============================================

function getAllTeacherPlans_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var profileSheet = ss.getSheetByName('פרטי מורה');
  if (!profileSheet || profileSheet.getLastRow() < 2) return { result: 'success', plans: {} };

  var data = profileSheet.getDataRange().getValues();
  var plans = {};

  for (var i = 1; i < data.length; i++) {
    var teacherId = data[i][0];
    if (!teacherId) continue;
    plans[teacherId] = {
      teacherId: teacherId,
      name: data[i][1] || '',
      subject: data[i][2] || '',
      grades: data[i][3] || '',
      status: readStatus_(ss, teacherId)
    };
  }

  return { result: 'success', plans: plans };
}

// ============================================
// READ — getApprovalQueue (for Ravit/Meytal)
// ============================================

function getApprovalQueue_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var statusSheet = ss.getSheetByName('סטטוס');
  if (!statusSheet || statusSheet.getLastRow() < 2) return { result: 'success', queue: [] };

  var data = statusSheet.getDataRange().getValues();
  var queue = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === 'submitted' || data[i][1] === 'reviewed') {
      queue.push({
        teacherId: data[i][0],
        status: data[i][1],
        submittedAt: data[i][2],
        reviewedBy: data[i][3] || '',
        reviewNotes: data[i][4] || '',
        approvedBy: data[i][5] || ''
      });
    }
  }

  return { result: 'success', queue: queue };
}

// ============================================
// WRITE — saveTeacherPlan (full save)
// ============================================

function saveTeacherPlan_(teacherId, plan) {
  if (!teacherId || !plan) return { result: 'error', message: 'missing teacherId or plan' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Save profile
  if (plan.profile) saveTeacherProfile_(ss, teacherId, plan.profile);

  // Save overview (goals, methods, help)
  if (plan.overview) saveOverview_(ss, teacherId, plan.overview);

  // Save internal exams per trimester
  if (plan.internalExams) saveInternalExams_(ss, teacherId, plan.internalExams);

  // Save topics
  if (plan.topics) saveTopics_(ss, teacherId, plan.topics);

  // Save weekly plans
  if (plan.weeklyPlans) saveWeeklyPlans_(ss, teacherId, plan.weeklyPlans);

  // Save PBL
  if (plan.pbl) savePbl_(ss, teacherId, plan.pbl);

  // Save notes
  if (plan.notes !== undefined) saveNotes_(ss, teacherId, plan.notes);

  // Ensure status row exists
  ensureStatus_(ss, teacherId, 'draft');

  // Log
  logAction_(ss, teacherId, 'save', 'Plan saved');

  return { result: 'success', message: 'Plan saved for ' + teacherId };
}

// ============================================
// WRITE — submitForReview
// ============================================

function submitForReview_(teacherId) {
  if (!teacherId) return { result: 'error', message: 'missing teacherId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  updateStatus_(ss, teacherId, 'submitted');
  logAction_(ss, teacherId, 'submit', 'Submitted for review');

  // Send email notification to Ravit
  try {
    var profile = readTeacherProfile_(ss, teacherId);
    var subject = 'תוכנית חדשה לבדיקה — ' + (profile.name || teacherId);
    var body = 'שלום רוית,\n\n' +
      (profile.name || '') + ' הגיש/ה תוכנית שנתית ב' + (profile.subject || '') + '.\n' +
      'יש לבדוק ולאשר בדשבורד.\n\n' +
      'אורט בית הערבה — מערכת תכנון';
    // Uncomment and set Ravit's email:
    // MailApp.sendEmail('ravit@example.com', subject, body);
  } catch (emailErr) {
    // Email is optional — don't fail the submit
  }

  return { result: 'success', message: 'Submitted for review' };
}

// ============================================
// WRITE — updateApproval (Ravit reviews / Meytal approves)
// ============================================

function updateApproval_(teacherId, status, reviewer, notes) {
  if (!teacherId) return { result: 'error', message: 'missing teacherId' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('סטטוס');
  if (!sheet) return { result: 'error', message: 'missing status sheet' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(status); // status
      if (status === 'reviewed') {
        sheet.getRange(row, 4).setValue(reviewer || ''); // reviewedBy
        sheet.getRange(row, 5).setValue(notes || ''); // reviewNotes
        sheet.getRange(row, 8).setValue(new Date()); // reviewedAt
      }
      if (status === 'approved') {
        sheet.getRange(row, 6).setValue(reviewer || ''); // approvedBy
        sheet.getRange(row, 9).setValue(new Date()); // approvedAt
      }
      if (status === 'returned') {
        sheet.getRange(row, 5).setValue(notes || ''); // return notes
        sheet.getRange(row, 8).setValue(new Date());
      }
      sheet.getRange(row, 7).setValue(new Date()); // lastUpdated
      break;
    }
  }

  logAction_(ss, teacherId, status, (reviewer || '') + ': ' + (notes || ''));
  return { result: 'success', message: 'Status updated to ' + status };
}

// ============================================
// PROFILE — read/write
// ============================================

function readTeacherProfile_(ss, teacherId) {
  var sheet = ss.getSheetByName('פרטי מורה');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      return {
        name: data[i][1] || '',
        subject: data[i][2] || '',
        grades: data[i][3] || '',
        weeklyHours: data[i][4] || '',
        specificClasses: data[i][5] || '',
        materials: data[i][6] || '',
        selectedExams: data[i][7] ? String(data[i][7]).split(',') : [],
        notes: data[i][8] || ''
      };
    }
  }
  return {};
}

function saveTeacherProfile_(ss, teacherId, profile) {
  var sheet = ss.getSheetByName('פרטי מורה');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) { rowIndex = i + 1; break; }
  }
  var row = [
    teacherId,
    profile.name || '',
    profile.subject || '',
    profile.grades || '',
    profile.weeklyHours || '',
    profile.specificClasses || '',
    profile.materials || '',
    (profile.selectedExams || []).join(','),
    profile.notes || '',
    new Date()
  ];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

// ============================================
// OVERVIEW — read/write (goals, methods, help)
// ============================================

function readOverview_(ss, teacherId) {
  var sheet = ss.getSheetByName('מטרות וגיוון');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      return {
        goals: data[i][1] || '',
        yearTopics: data[i][2] || '',
        teachingMethods: data[i][3] || '',
        methodsDetail: data[i][4] || '',
        helpNeeded: data[i][5] || '',
        gapsFromLastYear: data[i][6] || '',
        equipmentNeeded: data[i][7] || ''
      };
    }
  }
  return {};
}

function saveOverview_(ss, teacherId, overview) {
  var sheet = ss.getSheetByName('מטרות וגיוון');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) { rowIndex = i + 1; break; }
  }
  var row = [
    teacherId,
    overview.goals || '',
    overview.yearTopics || '',
    overview.teachingMethods || '',
    overview.methodsDetail || '',
    overview.helpNeeded || '',
    overview.gapsFromLastYear || '',
    overview.equipmentNeeded || '',
    new Date()
  ];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

// ============================================
// INTERNAL EXAMS — read/write (per trimester)
// ============================================

function readInternalExams_(ss, teacherId) {
  var sheet = ss.getSheetByName('מבחנים ובחנים');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var exams = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      var trim = data[i][1] || 'a';
      exams[trim] = {
        exam1: data[i][2] || '', exam1date: data[i][3] || '', exam1type: data[i][4] || '',
        exam2: data[i][5] || '', exam2date: data[i][6] || '', exam2type: data[i][7] || '',
        quiz1: data[i][8] || '', quiz1date: data[i][9] || '', quiz1type: data[i][10] || '',
        quiz2: data[i][11] || '', quiz2date: data[i][12] || '', quiz2type: data[i][13] || ''
      };
    }
  }
  return exams;
}

function saveInternalExams_(ss, teacherId, internalExams) {
  var sheet = ss.getSheetByName('מבחנים ובחנים');
  if (!sheet) return;
  deleteTeacherRows_(sheet, teacherId);

  var rows = [];
  ['a', 'b', 'c'].forEach(function(trim) {
    var ex = internalExams[trim];
    if (!ex) return;
    rows.push([
      teacherId, trim,
      ex.exam1 || '', ex.exam1date || '', ex.exam1type || '',
      ex.exam2 || '', ex.exam2date || '', ex.exam2type || '',
      ex.quiz1 || '', ex.quiz1date || '', ex.quiz1type || '',
      ex.quiz2 || '', ex.quiz2date || '', ex.quiz2type || '',
      new Date()
    ]);
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// ============================================
// TOPICS — read/write
// ============================================

function readTopics_(ss, teacherId) {
  var sheet = ss.getSheetByName('נושאים');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data = sheet.getDataRange().getValues();
  var topics = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      topics.push({
        order: data[i][1] || 0,
        name: data[i][2] || '',
        weeks: data[i][3] || 2,
        trim: data[i][4] || 'a'
      });
    }
  }
  return topics.sort(function(a, b) { return a.order - b.order; });
}

function saveTopics_(ss, teacherId, topics) {
  var sheet = ss.getSheetByName('נושאים');
  if (!sheet) return;
  deleteTeacherRows_(sheet, teacherId);

  if (!Array.isArray(topics)) return;
  var rows = [];
  topics.forEach(function(t, idx) {
    rows.push([teacherId, idx + 1, t.name || '', t.weeks || 2, t.trim || 'a', new Date()]);
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// ============================================
// WEEKLY PLANS — read/write
// ============================================

function readWeeklyPlans_(ss, teacherId) {
  var sheet = ss.getSheetByName('לוח שבועי');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var plans = {};

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== teacherId) continue;
    var trim = data[i][1] || 'a';
    if (!plans[trim]) plans[trim] = [];
    plans[trim].push({
      week: data[i][2] || 1,
      topic: data[i][3] || '',
      lesson: data[i][4] || '',
      activity: data[i][5] || '',
      assessment: data[i][6] || '',
      notes: data[i][7] || ''
    });
  }

  // Sort each trimester by week
  for (var t in plans) {
    plans[t].sort(function(a, b) { return a.week - b.week; });
  }
  return plans;
}

function saveWeeklyPlans_(ss, teacherId, weeklyPlans) {
  var sheet = ss.getSheetByName('לוח שבועי');
  if (!sheet) return;
  deleteTeacherRows_(sheet, teacherId);

  var rows = [];
  ['a', 'b', 'c'].forEach(function(trim) {
    var weeks = weeklyPlans[trim];
    if (!Array.isArray(weeks)) return;
    weeks.forEach(function(w) {
      rows.push([
        teacherId, trim,
        w.week || 0, w.topic || '',
        w.lesson || '', w.activity || '',
        w.assessment || '', w.notes || '',
        new Date()
      ]);
    });
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// ============================================
// PBL — read/write
// ============================================

function readPbl_(ss, teacherId) {
  var sheet = ss.getSheetByName('PBL');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data = sheet.getDataRange().getValues();
  var projects = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      projects.push({
        name: data[i][1] || '',
        trim: data[i][2] || '',
        duration: data[i][3] || '',
        desc: data[i][4] || '',
        milestones: data[i][5] || ''
      });
    }
  }
  return projects;
}

function savePbl_(ss, teacherId, pbl) {
  var sheet = ss.getSheetByName('PBL');
  if (!sheet) return;
  deleteTeacherRows_(sheet, teacherId);

  if (!Array.isArray(pbl)) return;
  var rows = [];
  pbl.forEach(function(p) {
    if (p.name) {
      rows.push([teacherId, p.name || '', p.trim || '', p.duration || '', p.desc || '', p.milestones || '', new Date()]);
    }
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// ============================================
// STATUS — read/write
// ============================================

function readStatus_(ss, teacherId) {
  var sheet = ss.getSheetByName('סטטוס');
  if (!sheet || sheet.getLastRow() < 2) return { status: 'new' };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      return {
        status: data[i][1] || 'draft',
        submittedAt: data[i][2] || '',
        reviewedBy: data[i][3] || '',
        reviewNotes: data[i][4] || '',
        approvedBy: data[i][5] || '',
        lastUpdated: data[i][6] || ''
      };
    }
  }
  return { status: 'new' };
}

function ensureStatus_(ss, teacherId, defaultStatus) {
  var sheet = ss.getSheetByName('סטטוס');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) return; // already exists
  }
  sheet.appendRow([teacherId, defaultStatus, '', '', '', '', new Date(), '', '']);
}

function updateStatus_(ss, teacherId, status) {
  var sheet = ss.getSheetByName('סטטוס');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      sheet.getRange(i + 1, 2).setValue(status);
      if (status === 'submitted') {
        sheet.getRange(i + 1, 3).setValue(new Date()); // submittedAt
      }
      sheet.getRange(i + 1, 7).setValue(new Date()); // lastUpdated
      return;
    }
  }
  // New row
  sheet.appendRow([teacherId, status, status === 'submitted' ? new Date() : '', '', '', '', new Date(), '', '']);
}

// ============================================
// NOTES — save to profile
// ============================================

function saveNotes_(ss, teacherId, notes) {
  var sheet = ss.getSheetByName('פרטי מורה');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === teacherId) {
      sheet.getRange(i + 1, 9).setValue(notes || '');
      return;
    }
  }
}

// ============================================
// HELPERS
// ============================================

function deleteTeacherRows_(sheet, teacherId) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === teacherId) {
      sheet.deleteRow(i + 1);
    }
  }
}

function logAction_(ss, teacherId, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), teacherId, action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupTeacherPlanSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. פרטי מורה
  var p = getOrCreate_(ss, 'פרטי מורה');
  if (p.getLastRow() === 0) {
    p.appendRow(['מזהה', 'שם', 'מקצוע', 'שכבות', 'שעות שבועיות', 'כיתות', 'חומרים', 'בחינות נבחרות', 'הערות', 'עדכון אחרון']);
    p.getRange(1, 1, 1, 10).setFontWeight('bold');
    p.setFrozenRows(1);
  }

  // 2. מטרות וגיוון
  var o = getOrCreate_(ss, 'מטרות וגיוון');
  if (o.getLastRow() === 0) {
    o.appendRow(['מזהה', 'מטרות', 'נושאים כלליים', 'כלי הוראה', 'פירוט גיוון', 'צריך עזרה', 'פערים מהשנה הקודמת', 'ציוד נדרש', 'עדכון אחרון']);
    o.getRange(1, 1, 1, 9).setFontWeight('bold');
    o.setFrozenRows(1);
  }

  // 3. מבחנים ובחנים
  var x = getOrCreate_(ss, 'מבחנים ובחנים');
  if (x.getLastRow() === 0) {
    x.appendRow(['מזהה', 'שליש', 'מבחן 1', 'תאריך 1', 'סוג 1', 'מבחן 2', 'תאריך 2', 'סוג 2', 'בוחן 1', 'תאריך ב1', 'סוג ב1', 'בוחן 2', 'תאריך ב2', 'סוג ב2', 'עדכון אחרון']);
    x.getRange(1, 1, 1, 15).setFontWeight('bold');
    x.setFrozenRows(1);
  }

  // 4. נושאים
  var t = getOrCreate_(ss, 'נושאים');
  if (t.getLastRow() === 0) {
    t.appendRow(['מזהה', 'סדר', 'נושא', 'שבועות', 'שליש', 'עדכון אחרון']);
    t.getRange(1, 1, 1, 6).setFontWeight('bold');
    t.setFrozenRows(1);
  }

  // 3. לוח שבועי
  var w = getOrCreate_(ss, 'לוח שבועי');
  if (w.getLastRow() === 0) {
    w.appendRow(['מזהה', 'שליש', 'שבוע', 'נושא', 'מערך שיעור', 'סוג פעילות', 'הערכה', 'הערות', 'עדכון אחרון']);
    w.getRange(1, 1, 1, 9).setFontWeight('bold');
    w.setFrozenRows(1);
  }

  // 4. PBL
  var b = getOrCreate_(ss, 'PBL');
  if (b.getLastRow() === 0) {
    b.appendRow(['מזהה', 'שם פרויקט', 'שליש', 'משך (שבועות)', 'תיאור', 'אבני דרך', 'עדכון אחרון']);
    b.getRange(1, 1, 1, 7).setFontWeight('bold');
    b.setFrozenRows(1);
  }

  // 5. סטטוס
  var s = getOrCreate_(ss, 'סטטוס');
  if (s.getLastRow() === 0) {
    s.appendRow(['מזהה', 'סטטוס', 'תאריך שליחה', 'בודק/ת', 'הערות בדיקה', 'מאשר/ת', 'עדכון אחרון', 'תאריך בדיקה', 'תאריך אישור']);
    s.getRange(1, 1, 1, 9).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  // 6. לוג
  var l = getOrCreate_(ss, 'לוג');
  if (l.getLastRow() === 0) {
    l.appendRow(['תאריך', 'מזהה', 'פעולה', 'פרטים']);
    l.getRange(1, 1, 1, 4).setFontWeight('bold');
    l.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: פרטי מורה, מטרות וגיוון, מבחנים ובחנים, נושאים, לוח שבועי, PBL, סטטוס, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
