/**
 * Training Supervision — Apps Script Backend
 * מערכת פיקוח הדרכות משרד העבודה
 *
 * Sheets schema (8 tabs):
 *   networks    — id, name, color, contactEmail
 *   schools     — id, name, network, principalName, principalEmail, principalPhone
 *   teachers    — id, school, network, name, subject, type, sector, seniority,
 *                 units, students, phone, email, moeApproval, moeFile,
 *                 pdActive, pdFile, pdYear, createdAt
 *   trainings   — id, date, subject, guideName, guideEmail, network, sector, location, notes
 *   attendance  — id, trainingId, teacherId, status (present/absent), notes, timestamp
 *   pd          — id, teacherId, subject, year, status, fileUrl, addedAt
 *   questions   — id, teacherId, question, answer, status (open/answered), createdAt, answeredAt
 *   knowledge   — id, title, category, audience, link, description, addedAt
 *
 * Deploy: Web App → Anyone → Execute as Me
 */

// ============================================================
// SETUP
// ============================================================

const TABS = ['networks','schools','teachers','trainings','attendance','pd','questions','knowledge'];

const SCHEMA = {
  networks:   ['id','name','color','contactEmail'],
  schools:    ['id','name','network','principalName','principalEmail','principalPhone'],
  teachers:   ['id','school','network','name','subject','type','sector','seniority',
               'units','students','phone','email','moeApproval','moeFile',
               'pdActive','pdFile','pdYear','createdAt'],
  trainings:  ['id','date','subject','guideName','guideEmail','network','sector','location','notes'],
  attendance: ['id','trainingId','teacherId','status','notes','timestamp'],
  pd:         ['id','teacherId','subject','year','status','fileUrl','addedAt'],
  questions:  ['id','teacherId','question','answer','status','createdAt','answeredAt'],
  knowledge:  ['id','title','category','audience','link','description','addedAt']
};

const SEED_NETWORKS = [
  ['net_ort',     'אורט',  'ort',     ''],
  ['net_amal',    'עמל',   'amal',    ''],
  ['net_atid',    'עתיד',  'atid',    ''],
  ['net_sakhnin', 'סכנין', 'sakhnin', ''],
  ['net_dror',    'דרור',  'dror',    '']
];

function setupSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  TABS.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SCHEMA[name]);
      sheet.getRange(1, 1, 1, SCHEMA[name].length)
           .setFontWeight('bold')
           .setBackground('#f5f7fa');
      sheet.setFrozenRows(1);
    }
  });

  // Seed networks
  const netsSheet = ss.getSheetByName('networks');
  if (netsSheet.getLastRow() === 1) {
    SEED_NETWORKS.forEach(row => netsSheet.appendRow(row));
  }

  // Sample school + sample teacher (delete later)
  const schools = ss.getSheetByName('schools');
  if (schools.getLastRow() === 1) {
    schools.appendRow(['sch_ort_beit_haarava', 'אורט בית הערבה', 'net_ort', 'מיטל פלג', 'meytalp@bethaarava.ort.org.il', '']);
  }

  SpreadsheetApp.getUi().alert('✓ הסכמה הוקמה. הסשן מוכן לפריסה.');
}

// ============================================================
// ROUTING (GET + POST)
// ============================================================

function doGet(e) {
  return handleRequest(e.parameter);
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { body = e.parameter || {}; }
  return handleRequest(body);
}

function handleRequest(params) {
  const action = params.action || '';
  try {
    let result;
    switch (action) {
      case 'networks.list':       result = listNetworks(); break;
      case 'schools.list':        result = listSchools(params.network); break;
      case 'school.get':          result = getSchool(params.id); break;
      case 'school.create':       result = createSchool(params); break;

      case 'teachers.list':       result = listTeachers(params); break;
      case 'teacher.get':         result = getTeacher(params.id); break;
      case 'teachers.create':     result = createTeacher(params); break;
      case 'teachers.update':     result = updateTeacher(params); break;

      case 'trainings.list':      result = listTrainings(params); break;
      case 'training.create':     result = createTraining(params); break;

      case 'attendance.record':   result = recordAttendance(params); break;
      case 'attendance.bulk':     result = recordBulkAttendance(params); break;
      case 'attendance.monthly':  result = monthlyAttendance(params); break;
      case 'attendance.teacher':  result = teacherAttendance(params.teacherId); break;

      case 'pd.list':             result = listPD(params.teacherId); break;
      case 'pd.create':           result = createPD(params); break;

      case 'questions.list':      result = listQuestions(params); break;
      case 'questions.create':    result = createQuestion(params); break;
      case 'questions.answer':    result = answerQuestion(params); break;

      case 'knowledge.list':      result = listKnowledge(params); break;
      case 'knowledge.create':    result = createKnowledge(params); break;

      case 'reports.school':      result = schoolReport(params); break;
      case 'reports.network':     result = networkReport(params); break;
      case 'reports.ministry':    result = ministryReport(params); break;

      default: result = { ok: false, error: 'unknown_action: ' + action };
    }
    return jsonOut(result);
  } catch (err) {
    return jsonOut({ ok: false, error: err.message, stack: err.stack });
  }
}

// ============================================================
// HELPERS
// ============================================================

function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function readAll(name) {
  const s = sheet(name);
  if (!s) return [];
  const range = s.getDataRange().getValues();
  if (range.length < 2) return [];
  const headers = range[0];
  return range.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendRow(name, obj) {
  const s = sheet(name);
  const headers = SCHEMA[name];
  const row = headers.map(h => {
    if (obj[h] === undefined) return '';
    if (typeof obj[h] === 'boolean') return obj[h] ? 'TRUE' : 'FALSE';
    return obj[h];
  });
  s.appendRow(row);
  return obj;
}

function updateRowById(name, id, updates) {
  const s = sheet(name);
  const range = s.getDataRange().getValues();
  const headers = range[0];
  const idCol = headers.indexOf('id');
  for (let i = 1; i < range.length; i++) {
    if (range[i][idCol] === id) {
      Object.keys(updates).forEach(k => {
        const col = headers.indexOf(k);
        if (col >= 0) {
          let v = updates[k];
          if (typeof v === 'boolean') v = v ? 'TRUE' : 'FALSE';
          s.getRange(i + 1, col + 1).setValue(v);
        }
      });
      return true;
    }
  }
  return false;
}

function newId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return /^(true|1|yes|on)$/i.test(v.trim());
  return !!v;
}

function thisMonthKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function monthKey(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

// ============================================================
// NETWORKS
// ============================================================

function listNetworks() {
  return { ok: true, data: readAll('networks') };
}

// ============================================================
// SCHOOLS
// ============================================================

function listSchools(network) {
  let data = readAll('schools');
  if (network) data = data.filter(s => s.network === network);
  return { ok: true, data };
}
function getSchool(id) {
  const found = readAll('schools').find(s => s.id === id);
  return { ok: true, data: found || null };
}
function createSchool(p) {
  const obj = {
    id: newId('sch'),
    name: p.name,
    network: p.network,
    principalName: p.principalName || '',
    principalEmail: p.principalEmail || '',
    principalPhone: p.principalPhone || ''
  };
  appendRow('schools', obj);
  return { ok: true, data: obj };
}

// ============================================================
// TEACHERS
// ============================================================

function listTeachers(p) {
  let data = readAll('teachers').map(t => ({...t, moeApproval: toBool(t.moeApproval), pdActive: toBool(t.pdActive)}));
  if (p.school)   data = data.filter(t => t.school === p.school);
  if (p.network)  data = data.filter(t => t.network === p.network);
  if (p.subject)  data = data.filter(t => t.subject === p.subject);
  if (p.sector)   data = data.filter(t => t.sector === p.sector);
  return { ok: true, data };
}

function getTeacher(id) {
  const found = readAll('teachers').find(t => t.id === id);
  if (found) {
    found.moeApproval = toBool(found.moeApproval);
    found.pdActive = toBool(found.pdActive);
  }
  return { ok: true, data: found || null };
}

function createTeacher(p) {
  const obj = {
    id: newId('tch'),
    school: p.school || '',
    network: p.network || '',
    name: p.name,
    subject: p.subject,
    type: p.type || 'bagrut',
    sector: p.sector || 'kelali',
    seniority: parseInt(p.seniority || 0, 10),
    units: p.units || '',
    students: parseInt(p.students || 0, 10),
    phone: p.phone || '',
    email: p.email || '',
    moeApproval: toBool(p.moeApproval),
    moeFile: p.moeFile || '',
    pdActive: toBool(p.pdActive),
    pdFile: p.pdFile || '',
    pdYear: p.pdYear || '',
    createdAt: new Date().toISOString()
  };
  appendRow('teachers', obj);
  return { ok: true, data: obj };
}

function updateTeacher(p) {
  if (!p.id) return { ok: false, error: 'missing_id' };
  const updates = {};
  ['name','subject','type','sector','seniority','units','students','phone','email','moeApproval','moeFile','pdActive','pdFile','pdYear'].forEach(k => {
    if (p[k] !== undefined && p[k] !== '') updates[k] = p[k];
  });
  if (p.moeApproval !== undefined) updates.moeApproval = toBool(p.moeApproval);
  if (p.pdActive !== undefined) updates.pdActive = toBool(p.pdActive);
  const ok = updateRowById('teachers', p.id, updates);
  return { ok };
}

// ============================================================
// TRAININGS
// ============================================================

function listTrainings(p) {
  let data = readAll('trainings');
  if (p.network)  data = data.filter(t => t.network === p.network);
  if (p.sector)   data = data.filter(t => t.sector === p.sector);
  if (p.month)    data = data.filter(t => monthKey(t.date) === p.month);
  if (p.guide)    data = data.filter(t => t.guideEmail === p.guide);
  return { ok: true, data };
}

function createTraining(p) {
  const obj = {
    id: newId('trn'),
    date: p.date || new Date().toISOString().slice(0,10),
    subject: p.subject,
    guideName: p.guideName || '',
    guideEmail: p.guideEmail || '',
    network: p.network || '',
    sector: p.sector || '',
    location: p.location || '',
    notes: p.notes || ''
  };
  appendRow('trainings', obj);
  return { ok: true, data: obj };
}

// ============================================================
// ATTENDANCE
// ============================================================

function recordAttendance(p) {
  const obj = {
    id: newId('att'),
    trainingId: p.trainingId,
    teacherId: p.teacherId,
    status: p.status || 'present',
    notes: p.notes || '',
    timestamp: new Date().toISOString()
  };
  appendRow('attendance', obj);
  return { ok: true, data: obj };
}

function recordBulkAttendance(p) {
  const records = p.records || [];
  if (typeof records === 'string') {
    try { records = JSON.parse(records); } catch (e) {}
  }
  const created = [];
  records.forEach(r => {
    created.push(recordAttendance({
      trainingId: p.trainingId,
      teacherId: r.teacherId,
      status: r.status,
      notes: r.notes || ''
    }).data);
  });
  return { ok: true, count: created.length };
}

function monthlyAttendance(p) {
  // returns { teacherId: { thisMonth: 'present'/'missed', lastMissedDate: '...' } }
  const month = p.month || thisMonthKey();
  const trainings = readAll('trainings').filter(t => monthKey(t.date) === month);
  if (p.network)  trainings.filter(t => t.network === p.network);
  const trainingIds = new Set(trainings.map(t => t.id));
  const attRecords = readAll('attendance').filter(a => trainingIds.has(a.trainingId));

  // Get relevant teachers
  let teachers = readAll('teachers');
  if (p.school)   teachers = teachers.filter(t => t.school === p.school);
  if (p.network)  teachers = teachers.filter(t => t.network === p.network);

  const out = {};
  teachers.forEach(t => {
    const rec = attRecords.filter(a => a.teacherId === t.id);
    const present = rec.find(a => a.status === 'present');
    out[t.id] = {
      thisMonth: present ? 'present' : (trainings.length ? 'missed' : null),
      lastMissedDate: trainings.length && !present ? trainings.map(tr => tr.date).sort().pop() : null,
      trainingsCount: trainings.length,
      attendedCount: rec.filter(a => a.status === 'present').length
    };
  });
  return { ok: true, data: out };
}

function teacherAttendance(teacherId) {
  const records = readAll('attendance').filter(a => a.teacherId === teacherId);
  const trainingIds = records.map(r => r.trainingId);
  const trainings = readAll('trainings').filter(t => trainingIds.includes(t.id));
  const trainingsById = Object.fromEntries(trainings.map(t => [t.id, t]));
  const enriched = records.map(r => ({
    ...r,
    training: trainingsById[r.trainingId] || null
  })).sort((a,b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  return { ok: true, data: enriched };
}

// ============================================================
// PD (Professional Development / השתלמויות)
// ============================================================

function listPD(teacherId) {
  let data = readAll('pd');
  if (teacherId) data = data.filter(p => p.teacherId === teacherId);
  return { ok: true, data };
}

function createPD(p) {
  const obj = {
    id: newId('pd'),
    teacherId: p.teacherId,
    subject: p.subject,
    year: p.year || new Date().getFullYear(),
    status: p.status || 'active',
    fileUrl: p.fileUrl || '',
    addedAt: new Date().toISOString()
  };
  appendRow('pd', obj);
  // Update teacher pdActive flag
  if (obj.status === 'active') {
    updateRowById('teachers', p.teacherId, { pdActive: true, pdFile: obj.fileUrl, pdYear: obj.year });
  }
  return { ok: true, data: obj };
}

// ============================================================
// QUESTIONS (Teacher → Guide)
// ============================================================

function listQuestions(p) {
  let data = readAll('questions');
  if (p.teacherId) data = data.filter(q => q.teacherId === p.teacherId);
  if (p.status)    data = data.filter(q => q.status === p.status);
  return { ok: true, data };
}

function createQuestion(p) {
  const obj = {
    id: newId('q'),
    teacherId: p.teacherId,
    question: p.question,
    answer: '',
    status: 'open',
    createdAt: new Date().toISOString(),
    answeredAt: ''
  };
  appendRow('questions', obj);
  return { ok: true, data: obj };
}

function answerQuestion(p) {
  const ok = updateRowById('questions', p.id, {
    answer: p.answer,
    status: 'answered',
    answeredAt: new Date().toISOString()
  });
  return { ok };
}

// ============================================================
// KNOWLEDGE BASE
// ============================================================

function listKnowledge(p) {
  let data = readAll('knowledge');
  if (p.category) data = data.filter(k => k.category === p.category);
  if (p.audience) data = data.filter(k => !k.audience || k.audience === 'all' || k.audience === p.audience);
  return { ok: true, data };
}

function createKnowledge(p) {
  const obj = {
    id: newId('kn'),
    title: p.title,
    category: p.category || '',
    audience: p.audience || 'all',
    link: p.link || '',
    description: p.description || '',
    addedAt: new Date().toISOString()
  };
  appendRow('knowledge', obj);
  return { ok: true, data: obj };
}

// ============================================================
// REPORTS (Aggregated views)
// ============================================================

function schoolReport(p) {
  const teachers = readAll('teachers').filter(t => t.school === p.school);
  const attRes = monthlyAttendance({ school: p.school, month: p.month });
  const attData = attRes.data;
  const present = teachers.filter(t => attData[t.id]?.thisMonth === 'present').length;
  const missed = teachers.filter(t => attData[t.id]?.thisMonth === 'missed').length;
  const inPD = teachers.filter(t => toBool(t.pdActive)).length;
  return {
    ok: true,
    data: {
      total: teachers.length,
      present, missed, inPD,
      rate: teachers.length ? Math.round((present / teachers.length) * 100) : 0,
      missedTeachers: teachers.filter(t => attData[t.id]?.thisMonth === 'missed')
    }
  };
}

function networkReport(p) {
  const schools = readAll('schools').filter(s => s.network === p.network);
  const teachers = readAll('teachers').filter(t => t.network === p.network);
  const attRes = monthlyAttendance({ network: p.network, month: p.month });
  const attData = attRes.data;
  const bySector = { haredi: 0, arab: 0, kelali: 0 };
  teachers.forEach(t => { if (bySector[t.sector] !== undefined) bySector[t.sector]++; });
  const present = teachers.filter(t => attData[t.id]?.thisMonth === 'present').length;
  const missed = teachers.filter(t => attData[t.id]?.thisMonth === 'missed').length;
  return {
    ok: true,
    data: {
      schools: schools.length,
      teachers: teachers.length,
      present, missed,
      inPD: teachers.filter(t => toBool(t.pdActive)).length,
      rate: teachers.length ? Math.round((present / teachers.length) * 100) : 0,
      bySector,
      schoolBreakdown: schools.map(s => {
        const schTeachers = teachers.filter(t => t.school === s.id);
        const schPresent = schTeachers.filter(t => attData[t.id]?.thisMonth === 'present').length;
        return {
          id: s.id,
          name: s.name,
          teachers: schTeachers.length,
          present: schPresent,
          rate: schTeachers.length ? Math.round((schPresent / schTeachers.length) * 100) : 0
        };
      })
    }
  };
}

function ministryReport(p) {
  const networks = readAll('networks');
  const teachers = readAll('teachers');
  const attRes = monthlyAttendance({ month: p.month });
  const attData = attRes.data;
  return {
    ok: true,
    data: {
      networks: networks.length,
      schools: readAll('schools').length,
      teachers: teachers.length,
      present: teachers.filter(t => attData[t.id]?.thisMonth === 'present').length,
      missed: teachers.filter(t => attData[t.id]?.thisMonth === 'missed').length,
      inPD: teachers.filter(t => toBool(t.pdActive)).length,
      networkBreakdown: networks.map(n => {
        const netTeachers = teachers.filter(t => t.network === n.id);
        const netPresent = netTeachers.filter(t => attData[t.id]?.thisMonth === 'present').length;
        const sector = { haredi: 0, arab: 0, kelali: 0 };
        netTeachers.forEach(t => { if (sector[t.sector] !== undefined) sector[t.sector]++; });
        return {
          id: n.id,
          name: n.name,
          color: n.color,
          teachers: netTeachers.length,
          present: netPresent,
          missed: netTeachers.length - netPresent,
          rate: netTeachers.length ? Math.round((netPresent / netTeachers.length) * 100) : 0,
          sector
        };
      })
    }
  };
}

// ============================================================
// MONTHLY EMAIL TRIGGER (run on the 1st of each month)
// ============================================================

function monthlyEmailReports() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const monthStr = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0');

  // To school principals
  readAll('schools').forEach(s => {
    if (!s.principalEmail) return;
    const rpt = schoolReport({ school: s.id, month: monthStr }).data;
    const body = [
      `דוח חודשי — ${s.name}`,
      ``,
      `מורים: ${rpt.total}`,
      `נוכחות: ${rpt.rate}% (${rpt.present}/${rpt.total})`,
      `פספסו: ${rpt.missed}`,
      `בהשתלמות: ${rpt.inPD}`,
      ``,
      rpt.missedTeachers.length ? `מורים שפספסו:\n${rpt.missedTeachers.map(t => '- ' + t.name + ' (' + t.subject + ')').join('\n')}` : '',
    ].filter(Boolean).join('\n');
    MailApp.sendEmail(s.principalEmail, `דוח הדרכות חודשי — ${s.name}`, body);
  });
}

// helper: install a time trigger that runs monthlyEmailReports on the 1st at 08:00
function installMonthlyTrigger() {
  ScriptApp.newTrigger('monthlyEmailReports')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();
  SpreadsheetApp.getUi().alert('✓ הטריגר החודשי הותקן.');
}
