// ============================================================
// Apps Script — הכנות תשפ"ז · אורט בית הערבה
// ============================================================
// קישור Sheet → Extensions → Apps Script
// העתיקי את כל הקובץ הזה, הדביקי, שמרי, Deploy → Web App
// ============================================================

const SHEET_NAME = 'tasks';

// ===== Web App entrypoints =====

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'prep API alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = {};
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'list')        result = { tasks: getTasks(data.role) };
    else if (action === 'all')    result = { byRole: getAllByRole() };
    else if (action === 'add')    result = { id: addTask(data.role, data.task) };
    else if (action === 'update') { updateTask(data.id, data.fields); result = { ok: true }; }
    else if (action === 'delete') { deleteTask(data.id); result = { ok: true }; }
    else if (action === 'seed')   result = { ids: seedTasks(data.role, data.tasks) };
    else result = { error: 'unknown_action' };

  } catch (err) {
    result = { error: String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== Sheet helpers =====

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.getRange(1, 1, 1, 8).setValues([[
      'id', 'role', 'title', 'description', 'deadline', 'done', 'order', 'updated_at'
    ]]);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, 8)
      .setFontWeight('bold')
      .setBackground('#EDE6D8');
  }
  return s;
}

function rowToTask_(r) {
  return {
    id: String(r[0]),
    role: String(r[1]),
    title: String(r[2] || ''),
    description: String(r[3] || ''),
    deadline: r[4] instanceof Date ? Utilities.formatDate(r[4], 'GMT', 'yyyy-MM-dd') : String(r[4] || ''),
    done: r[5] === true || r[5] === 'TRUE' || r[5] === 'true',
    order: Number(r[6]) || 0,
    updated_at: r[7] instanceof Date ? r[7].toISOString() : String(r[7] || ''),
  };
}

function getTasks(role) {
  const s = sheet_();
  const data = s.getDataRange().getValues();
  const rows = data.slice(1);
  return rows
    .filter(r => r[1] === role)
    .map(rowToTask_)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getAllByRole() {
  const s = sheet_();
  const data = s.getDataRange().getValues();
  const rows = data.slice(1);
  const byRole = {};
  rows.forEach(r => {
    if (!r[1]) return;
    const t = rowToTask_(r);
    if (!byRole[t.role]) byRole[t.role] = [];
    byRole[t.role].push(t);
  });
  // sort each role's tasks
  Object.keys(byRole).forEach(k => {
    byRole[k].sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  return byRole;
}

function addTask(role, task) {
  const s = sheet_();
  const id = Utilities.getUuid();
  const now = new Date();
  s.appendRow([
    id,
    role,
    task.title || '',
    task.description || '',
    task.deadline || '',
    task.done === true,
    Number(task.order) || 0,
    now,
  ]);
  return id;
}

function updateTask(id, fields) {
  const s = sheet_();
  const data = s.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      const row = i + 1;
      if ('title' in fields)       s.getRange(row, 3).setValue(fields.title);
      if ('description' in fields) s.getRange(row, 4).setValue(fields.description);
      if ('deadline' in fields)    s.getRange(row, 5).setValue(fields.deadline);
      if ('done' in fields)        s.getRange(row, 6).setValue(fields.done === true);
      if ('order' in fields)       s.getRange(row, 7).setValue(Number(fields.order) || 0);
      s.getRange(row, 8).setValue(new Date());
      return;
    }
  }
}

function deleteTask(id) {
  const s = sheet_();
  const data = s.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      s.deleteRow(i + 1);
      return;
    }
  }
}

function seedTasks(role, tasks) {
  const s = sheet_();
  const now = new Date();
  const ids = [];
  tasks.forEach((task, i) => {
    const id = Utilities.getUuid();
    s.appendRow([
      id,
      role,
      task.title || '',
      task.description || '',
      task.deadline || '',
      task.done === true,
      Number(task.order) || i,
      now,
    ]);
    ids.push(id);
  });
  return ids;
}

// ===== בדיקה ידנית (אופציונלי) — להריץ פעם אחת כדי לוודא שהכל עובד =====
function selfTest() {
  Logger.log('Sheet exists: ' + (sheet_() !== null));
  Logger.log('Tasks for rivit: ' + JSON.stringify(getTasks('rivit')));
}
