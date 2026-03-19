// ============================================
// הדביקי את הקוד הזה ב-Apps Script שלך
// (script.google.com → הפרויקט הקיים)
// ============================================

// ===== שמירת משימות =====
// הוסיפי את הקוד הבא בתוך הפונקציה doPost שלך,
// ב-switch או if שמטפל ב-action:

/*
  בתוך doPost, הוסיפי:

  if (data.action === 'saveTasks') {
    saveTasks(data.tasks);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'deleteTask') {
    deleteTaskById(data.id);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  בתוך doGet, הוסיפי:

  if (action === 'getTasks') {
    var tasks = loadTasks();
    var cb = e.parameter.callback;
    return ContentService.createTextOutput(cb + '(' + JSON.stringify({tasks:tasks}) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
*/

// ===== פונקציות עזר =====

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.openById('1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(['id','title','dueDate','priority','status','category','createdAt','updatedAt']);
  }
  return sheet;
}

function saveTasks(tasks) {
  var sheet = getOrCreateSheet('tasks');
  // נקה הכל חוץ מכותרות
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).clearContent();
  }
  // כתוב את כל המשימות
  tasks.forEach(function(t) {
    sheet.appendRow([
      t.id || '',
      t.title || '',
      t.dueDate || '',
      t.priority || 'medium',
      t.status || 'pending',
      t.category || 'כללי',
      t.createdAt || '',
      t.updatedAt || ''
    ]);
  });
}

function loadTasks() {
  var sheet = getOrCreateSheet('tasks');
  var rows = sheet.getDataRange().getValues();
  var tasks = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue; // דלג על שורות ריקות
    tasks.push({
      id: rows[i][0],
      title: rows[i][1],
      dueDate: rows[i][2],
      priority: rows[i][3],
      status: rows[i][4],
      category: rows[i][5],
      createdAt: rows[i][6],
      updatedAt: rows[i][7]
    });
  }
  return tasks;
}

function deleteTaskById(id) {
  var sheet = getOrCreateSheet('tasks');
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

// ============================================
// שליחת תזכורת יומית במייל
// ============================================

function sendTaskReminders() {
  var tasks = loadTasks();
  var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');

  var pending = tasks.filter(function(t) {
    return t.status !== 'done';
  });

  // אם אין משימות פתוחות בכלל - לא שולח
  if (pending.length === 0) return;

  var overdue = pending.filter(function(t) {
    return t.dueDate && t.dueDate < today;
  });

  var dueToday = pending.filter(function(t) {
    return t.dueDate === today;
  });

  // בניית המייל
  var priorityEmoji = {high: '🔴', medium: '🟡', low: '🟢'};
  var priorityLabel = {high: 'גבוהה', medium: 'בינונית', low: 'נמוכה'};

  var html = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">';
  html += '<div style="background:linear-gradient(135deg,#0D9488,#14B8A6);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">';
  html += '<h1 style="margin:0;font-size:24px">🔔 תזכורת משימות</h1>';
  html += '<p style="margin:8px 0 0;opacity:.9">אורט בית הערבה – מערכת ניהול</p>';
  html += '</div>';
  html += '<div style="background:#fff;padding:20px;border:1px solid #e5e7eb">';

  if (overdue.length > 0) {
    html += '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:16px">';
    html += '<h3 style="color:#DC2626;margin:0 0 8px">⚠️ ' + overdue.length + ' משימות באיחור!</h3>';
    overdue.forEach(function(t) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #FECACA">';
      html += priorityEmoji[t.priority] + ' <strong>' + t.title + '</strong>';
      if (t.dueDate) {
        var d = new Date(t.dueDate + 'T00:00:00');
        html += ' <span style="color:#999;font-size:13px">(עד ' + d.toLocaleDateString('he-IL') + ')</span>';
      }
      if (t.category) html += ' <span style="background:#F3F4F6;padding:2px 8px;border-radius:4px;font-size:12px">' + t.category + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (dueToday.length > 0) {
    html += '<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:14px;margin-bottom:16px">';
    html += '<h3 style="color:#2563EB;margin:0 0 8px">📌 ' + dueToday.length + ' משימות להיום:</h3>';
    dueToday.forEach(function(t) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #BFDBFE">';
      html += priorityEmoji[t.priority] + ' <strong>' + t.title + '</strong>';
      if (t.category) html += ' <span style="background:#F3F4F6;padding:2px 8px;border-radius:4px;font-size:12px">' + t.category + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  // סיכום כללי
  html += '<div style="background:#F9FAFB;border-radius:8px;padding:14px;text-align:center">';
  html += '<p style="margin:0;color:#6B7280">סה"כ משימות פתוחות: <strong>' + pending.length + '</strong></p>';
  html += '<a href="https://meytalp-dev.github.io/ort-training/management/" style="display:inline-block;margin-top:10px;background:#0D9488;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold">פתחי את מערכת הניהול →</a>';
  html += '</div>';

  html += '</div>';
  html += '<div style="text-align:center;padding:12px;color:#9CA3AF;font-size:12px">נשלח אוטומטית ממערכת הניהול של אורט בית הערבה</div>';
  html += '</div>';

  MailApp.sendEmail({
    to: 'meytalp@bethaarava.ort.org.il',
    subject: '🔔 תזכורת: ' + (overdue.length ? overdue.length + ' משימות באיחור' : dueToday.length + ' משימות להיום') + ' – אורט בית הערבה',
    htmlBody: html
  });
}

// ============================================
// הגדרת טריגר יומי (להריץ פעם אחת בלבד!)
// ============================================

function createDailyTrigger() {
  // מוחק טריגרים קיימים של תזכורות
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'sendTaskReminders') {
      ScriptApp.deleteTrigger(t);
    }
  });
  // יוצר טריגר חדש – כל יום בשעה 7:00-8:00
  ScriptApp.newTrigger('sendTaskReminders')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}
