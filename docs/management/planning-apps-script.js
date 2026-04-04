/**
 * Google Apps Script — טופס תכנון שנתי | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "תכנון שנתי תשפ"ז — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupPlanningSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL — זה ה-endpoint לטופס
 */

var SHEET_ID = '1WO9MsWIUwdBUu0TkpbhUXHeqE_rMgauJP7Z-ybQ7b0U';

var ROLES = ['ravit', 'yaakov', 'counselor', 'ofira', 'homeroom'];
var ROLE_LABELS = {
  ravit: 'רוית — סגנית/פדגוגית',
  yaakov: 'יעקב — רכז חברתי',
  counselor: 'יועצת',
  ofira: 'אופירה — שורשי ישראל',
  homeroom: 'מחנכת'
};

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getPlan':
        result = getPlan_(e.parameter.role);
        break;
      case 'getAllPlans':
        result = getAllPlans_();
        break;
      default:
        result = { result: 'ok', message: 'planning API active' };
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
      case 'savePlan':
        result = savePlan_(data.role, data.plan);
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
// READ — getPlan (single role)
// ============================================

function getPlan_(role) {
  if (!role) return { result: 'error', message: 'no role specified' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var plan = {
    role: role,
    profile: readProfile_(ss, role),
    vision: readVision_(ss, role),
    goals: readGoals_(ss, role),
    activities: readActivities_(ss, role),
    evaluation: readEvaluation_(ss, role),
    summary: readSummary_(ss, role)
  };

  return { result: 'success', plan: plan };
}

// ============================================
// READ — getAllPlans (for dashboard)
// ============================================

function getAllPlans_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var plans = {};

  ROLES.forEach(function (role) {
    plans[role] = {
      role: role,
      label: ROLE_LABELS[role],
      profile: readProfile_(ss, role),
      goals: readGoals_(ss, role),
      activities: readActivities_(ss, role),
      evaluation: readEvaluation_(ss, role)
    };
  });

  return { result: 'success', plans: plans };
}

// ============================================
// WRITE — savePlan (full save from form)
// ============================================

function savePlan_(role, plan) {
  if (!role || !plan) return { result: 'error', message: 'missing role or plan' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Save profile
  if (plan.profile) saveProfile_(ss, role, plan.profile);

  // Save vision
  if (plan.vision) saveVision_(ss, role, plan.vision);

  // Save goals (per area)
  if (plan.goals) saveGoals_(ss, role, plan.goals);

  // Save activities (per trimester)
  if (plan.activities) saveActivities_(ss, role, plan.activities);

  // Save evaluation
  if (plan.evaluation) saveEvaluation_(ss, role, plan.evaluation);

  // Save summary
  if (plan.summary) saveSummary_(ss, role, plan.summary);

  // Log
  logAction_(ss, role, 'save', 'Plan saved');

  return { result: 'success', message: 'Plan saved for ' + role };
}

// ============================================
// PROFILE — read/write
// ============================================

function readProfile_(ss, role) {
  var sheet = ss.getSheetByName('פרופיל');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      return {
        name: data[i][1] || '',
        role: data[i][0],
        responsibilities: data[i][2] || '',
        grades: data[i][3] || '',
        hours: data[i][4] || '',
        selectedAreas: data[i][5] ? String(data[i][5]).split(',') : []
      };
    }
  }
  return {};
}

function saveProfile_(ss, role, profile) {
  var sheet = ss.getSheetByName('פרופיל');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) { rowIndex = i + 1; break; }
  }
  var row = [
    role,
    profile.name || '',
    profile.responsibilities || '',
    profile.grades || '',
    profile.hours || '',
    (profile.selectedAreas || []).join(','),
    new Date()
  ];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

// ============================================
// VISION — read/write
// ============================================

function readVision_(ss, role) {
  var sheet = ss.getSheetByName('חזון');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      return {
        vision: data[i][1] || '',
        values: data[i][2] ? String(data[i][2]).split(',') : []
      };
    }
  }
  return {};
}

function saveVision_(ss, role, vision) {
  var sheet = ss.getSheetByName('חזון');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) { rowIndex = i + 1; break; }
  }
  var row = [role, vision.vision || '', (vision.values || []).join(','), new Date()];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

// ============================================
// GOALS — read/write (per area)
// ============================================

function readGoals_(ss, role) {
  var sheet = ss.getSheetByName('מטרות');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var goals = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      var area = data[i][1] || 'כללי';
      if (!goals[area]) goals[area] = [];
      goals[area].push({
        domain: data[i][2] || '',
        principle: data[i][3] || '',
        what: data[i][4] || '',
        measures: data[i][5] || '',
        partners: data[i][6] || '',
        extra_needs: data[i][7] || ''
      });
    }
  }
  return goals;
}

function saveGoals_(ss, role, goals) {
  var sheet = ss.getSheetByName('מטרות');
  if (!sheet) return;

  // Delete existing rows for this role
  deleteRoleRows_(sheet, role);

  // Write new rows
  var rows = [];
  for (var area in goals) {
    var areaGoals = goals[area];
    if (!Array.isArray(areaGoals)) continue;
    areaGoals.forEach(function (g) {
      rows.push([
        role, area,
        g.domain || '', g.principle || '',
        g.what || '', g.measures || '',
        g.partners || '', g.extra_needs || '',
        new Date()
      ]);
    });
  }
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// ============================================
// ACTIVITIES — read/write (per trimester, with tasks)
// ============================================

function readActivities_(ss, role) {
  var sheet = ss.getSheetByName('פעילויות');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var taskSheet = ss.getSheetByName('פעולות');
  var taskData = taskSheet && taskSheet.getLastRow() > 1 ? taskSheet.getDataRange().getValues() : [];

  var activities = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== role) continue;
    var trim = data[i][1] || 'A';
    if (!activities[trim]) activities[trim] = [];
    var actIdx = activities[trim].length;
    var act = {
      month: data[i][2] || '',
      activity: data[i][3] || '',
      audience: data[i][4] || '',
      responsible: data[i][5] || '',
      cost: data[i][6] || '',
      notes: data[i][7] || '',
      tasks: []
    };

    // Find tasks for this activity
    var actId = data[i][8] || '';
    if (actId && taskData.length > 1) {
      for (var t = 1; t < taskData.length; t++) {
        if (taskData[t][0] === actId) {
          act.tasks.push({
            done: taskData[t][1] === true || taskData[t][1] === 'TRUE',
            desc: taskData[t][2] || '',
            responsible: taskData[t][3] || '',
            cost: taskData[t][4] || ''
          });
        }
      }
    }
    activities[trim].push(act);
  }
  return activities;
}

function saveActivities_(ss, role, activities) {
  var sheet = ss.getSheetByName('פעילויות');
  var taskSheet = ss.getSheetByName('פעולות');
  if (!sheet || !taskSheet) return;

  // Delete existing
  deleteRoleRows_(sheet, role);
  // Delete tasks for this role's activities
  var existingActs = sheet.getDataRange().getValues();
  var actIdsToDelete = [];
  for (var x = 1; x < existingActs.length; x++) {
    if (existingActs[x][0] === role && existingActs[x][8]) {
      actIdsToDelete.push(existingActs[x][8]);
    }
  }
  if (actIdsToDelete.length > 0) {
    var taskData = taskSheet.getDataRange().getValues();
    for (var d = taskData.length - 1; d >= 1; d--) {
      if (actIdsToDelete.indexOf(taskData[d][0]) > -1) {
        taskSheet.deleteRow(d + 1);
      }
    }
  }

  // Re-delete after task cleanup
  deleteRoleRows_(sheet, role);

  // Write new
  for (var trim in activities) {
    var acts = activities[trim];
    if (!Array.isArray(acts)) continue;
    acts.forEach(function (a, idx) {
      var actId = role + '_' + trim + '_' + idx + '_' + Date.now();
      sheet.appendRow([
        role, trim,
        a.month || '', a.activity || '',
        a.audience || '', a.responsible || '',
        a.cost || '', a.notes || '',
        actId, new Date()
      ]);

      // Write tasks
      if (a.tasks && a.tasks.length > 0) {
        a.tasks.forEach(function (t) {
          if (t.desc && String(t.desc).trim()) {
            taskSheet.appendRow([
              actId,
              t.done ? true : false,
              t.desc || '',
              t.responsible || '',
              t.cost || '',
              new Date()
            ]);
          }
        });
      }
    });
  }
}

// ============================================
// EVALUATION — read/write
// ============================================

function readEvaluation_(ss, role) {
  var sheet = ss.getSheetByName('רפלקציה');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  var eval_ = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      var trim = data[i][1]; // a, b, c
      eval_[trim] = {
        success: data[i][2] || '',
        challenges: data[i][3] || '',
        learned: data[i][4] || '',
        changes: data[i][5] || '',
        progress: data[i][6] || '',
        status: data[i][7] || '',
        score: data[i][8] || 5
      };
    }
  }
  return eval_;
}

function saveEvaluation_(ss, role, evaluation) {
  var sheet = ss.getSheetByName('רפלקציה');
  if (!sheet) return;
  deleteRoleRows_(sheet, role);

  ['a', 'b', 'c'].forEach(function (trim) {
    var ev = evaluation[trim];
    if (!ev) return;
    sheet.appendRow([
      role, trim,
      ev.success || '', ev.challenges || '',
      ev.learned || '', ev.changes || '',
      ev.progress || '', ev.status || '',
      ev.score || 5, new Date()
    ]);
  });
}

// ============================================
// SUMMARY — read/write
// ============================================

function readSummary_(ss, role) {
  var sheet = ss.getSheetByName('סיכום');
  if (!sheet || sheet.getLastRow() < 2) return {};
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      return {
        achieved: data[i][1] || '',
        not_achieved: data[i][2] || '',
        lessons: data[i][3] || '',
        score: data[i][4] || 5
      };
    }
  }
  return {};
}

function saveSummary_(ss, role, summary) {
  var sheet = ss.getSheetByName('סיכום');
  if (!sheet) return;
  deleteRoleRows_(sheet, role);
  sheet.appendRow([
    role,
    summary.achieved || '', summary.not_achieved || '',
    summary.lessons || '', summary.score || 5,
    new Date()
  ]);
}

// ============================================
// HELPERS
// ============================================

function deleteRoleRows_(sheet, role) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === role) {
      sheet.deleteRow(i + 1);
    }
  }
}

function logAction_(ss, role, action, details) {
  var sheet = ss.getSheetByName('לוג');
  if (!sheet) return;
  sheet.appendRow([new Date(), role, ROLE_LABELS[role] || role, action, details]);
}

// ============================================
// SETUP — הרצה חד פעמית
// ============================================

function setupPlanningSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. פרופיל
  var p = getOrCreate_(ss, 'פרופיל');
  if (p.getLastRow() === 0) {
    p.appendRow(['תפקיד', 'שם', 'תחומי אחריות', 'שכבות', 'שעות', 'תחומים נבחרים', 'עדכון אחרון']);
    p.getRange(1, 1, 1, 7).setFontWeight('bold');
    p.setFrozenRows(1);
  }

  // 2. חזון
  var v = getOrCreate_(ss, 'חזון');
  if (v.getLastRow() === 0) {
    v.appendRow(['תפקיד', 'חזון אישי', 'עקרונות נבחרים', 'עדכון אחרון']);
    v.getRange(1, 1, 1, 4).setFontWeight('bold');
    v.setFrozenRows(1);
  }

  // 3. מטרות
  var g = getOrCreate_(ss, 'מטרות');
  if (g.getLastRow() === 0) {
    g.appendRow(['תפקיד', 'תחום אחריות', 'תחום', 'עקרון', 'מה רוצה שיקרה', 'מדדים', 'שותפים', 'צרכים', 'עדכון אחרון']);
    g.getRange(1, 1, 1, 9).setFontWeight('bold');
    g.setFrozenRows(1);
  }

  // 4. פעילויות
  var a = getOrCreate_(ss, 'פעילויות');
  if (a.getLastRow() === 0) {
    a.appendRow(['תפקיד', 'שליש', 'חודש', 'פעילות', 'קהל יעד', 'אחראי', 'עלות', 'הערות', 'מזהה', 'עדכון אחרון']);
    a.getRange(1, 1, 1, 10).setFontWeight('bold');
    a.setFrozenRows(1);
  }

  // 5. פעולות (sub-tasks)
  var t = getOrCreate_(ss, 'פעולות');
  if (t.getLastRow() === 0) {
    t.appendRow(['מזהה פעילות', 'בוצע', 'פעולה', 'אחראי', 'עלות', 'עדכון אחרון']);
    t.getRange(1, 1, 1, 6).setFontWeight('bold');
    t.setFrozenRows(1);
  }

  // 6. רפלקציה
  var e = getOrCreate_(ss, 'רפלקציה');
  if (e.getLastRow() === 0) {
    e.appendRow(['תפקיד', 'שליש', 'הצלחות', 'אתגרים', 'מה למדתי', 'שינויים', 'מול מטרות', 'סטטוס', 'ציון', 'עדכון אחרון']);
    e.getRange(1, 1, 1, 10).setFontWeight('bold');
    e.setFrozenRows(1);
  }

  // 7. סיכום שנתי
  var s = getOrCreate_(ss, 'סיכום');
  if (s.getLastRow() === 0) {
    s.appendRow(['תפקיד', 'מה הושג', 'מה לא הושג', 'לקחים', 'ציון', 'עדכון אחרון']);
    s.getRange(1, 1, 1, 6).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  // 8. לוג
  var l = getOrCreate_(ss, 'לוג');
  if (l.getLastRow() === 0) {
    l.appendRow(['תאריך', 'תפקיד', 'שם', 'פעולה', 'פרטים']);
    l.getRange(1, 1, 1, 5).setFontWeight('bold');
    l.setFrozenRows(1);
  }

  Logger.log('כל הטאבים נוצרו בהצלחה!');
  Logger.log('טאבים: פרופיל, חזון, מטרות, פעילויות, פעולות, רפלקציה, סיכום, לוג');
}

function getOrCreate_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  return ss.insertSheet(name);
}
