/**
 * ImpactOS Tnufa English — Backend (Google Apps Script)
 * ====================================================
 *
 * Setup:
 * 1. Open Google Sheets, create new file: "ImpactOS Tnufa English DB"
 * 2. Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL → assets/js/config.js (API_URL)
 *
 * Script Properties (Project Settings → Script Properties):
 * - GEMINI_API_KEY: Your Gemini API key (https://makersuite.google.com/app/apikey)
 *
 * Sheets that will be created automatically:
 * - Users     — משתמשים
 * - Profiles  — פרופיל למידה לכל תלמיד
 * - Sessions  — סשנים יומיים
 * - Activities — פעילויות בתוך סשנים
 * - Content   — מאגר טקסטים, שאלות, פעילויות
 */

const SHEETS = {
  USERS: 'Users',
  PROFILES: 'Profiles',
  SESSIONS: 'Sessions',
  ACTIVITIES: 'Activities',
  CONTENT: 'Content',
};

const HEADERS = {
  Users: ['userId', 'role', 'name', 'email', 'passwordHash', 'createdAt', 'token', 'classId'],
  Profiles: ['userId', 'cefrLevel', 'diagnosticCompletedAt', 'componentStrengths', 'vocabularyKnown', 'preferences'],
  Sessions: ['sessionId', 'userId', 'startedAt', 'endedAt', 'activitiesCompleted', 'timeOnTaskSeconds'],
  Activities: ['activityId', 'sessionId', 'userId', 'type', 'unitId', 'lessonId', 'studentResponse', 'aiFeedback', 'isCorrect', 'createdAt'],
  Content: ['contentId', 'type', 'cefrLevel', 'unitId', 'topic', 'chunksUsed', 'grammarFocus', 'rawContent'],
};

// ===== Web App Entry Points =====

function doPost(e) {
  return handle(e);
}

function doGet(e) {
  return handle(e);
}

function handle(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (_) {}
    }
    Object.assign(payload, (e && e.parameter) || {});

    const action = payload.action || '';
    let result;

    switch (action) {
      case 'register':       result = register(payload); break;
      case 'login':          result = login(payload); break;
      case 'getProfile':     result = getProfile(payload); break;
      case 'saveProfile':    result = saveProfile(payload); break;
      case 'startSession':   result = startSession(payload); break;
      case 'endSession':     result = endSession(payload); break;
      case 'logActivity':    result = logActivity(payload); break;
      case 'getProgress':    result = getProgress(payload); break;
      case 'aiFeedback':     result = aiFeedback(payload); break;
      case 'aiGenerateText': result = aiGenerateText(payload); break;
      case 'getClassRoster': result = getClassRoster(payload); break;
      case 'getClassStats':  result = getClassStats(payload); break;
      case 'getStudentDetail': result = getStudentDetail(payload); break;
      case 'ping':           result = { ok: true, time: new Date().toISOString() }; break;
      default: throw new Error('Unknown action: ' + action);
    }

    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err.message || err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== Sheet Helpers =====

function getSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll(name) {
  const sh = getSheet(name);
  const range = sh.getDataRange().getValues();
  if (range.length <= 1) return [];
  const headers = range[0];
  return range.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendRow(name, obj) {
  const sh = getSheet(name);
  const headers = HEADERS[name];
  sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
}

function findRow(name, predicate) {
  const items = readAll(name);
  return items.find(predicate) || null;
}

function updateRow(name, predicate, updater) {
  const sh = getSheet(name);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, j) => obj[h] = data[i][j]);
    if (predicate(obj)) {
      const newObj = updater(obj);
      headers.forEach((h, j) => sh.getRange(i + 1, j + 1).setValue(newObj[h] !== undefined ? newObj[h] : ''));
      return true;
    }
  }
  return false;
}

// ===== ID + Token Generators =====

function genId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function genToken() {
  return Utilities.getUuid().replace(/-/g, '');
}

function hashPassword(password) {
  // Simple SHA-256 hash. TODO: add salt for production.
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return bytes.map(b => ((b & 0xFF) + 0x100).toString(16).slice(1)).join('');
}

// ===== Auth =====

function register(p) {
  if (!p.name || !p.email || !p.password || !p.role) {
    throw new Error('יש למלא את כל השדות');
  }
  if (p.password.length < 6) {
    throw new Error('סיסמה חייבת להיות לפחות 6 תווים');
  }
  if (!['student', 'teacher', 'parent'].includes(p.role)) {
    throw new Error('תפקיד לא תקין');
  }

  const email = p.email.trim().toLowerCase();
  const existing = findRow('Users', u => String(u.email).toLowerCase() === email);
  if (existing) throw new Error('משתמש עם אימייל זה כבר קיים');

  const userId = genId('usr');
  const token = genToken();

  // classId logic:
  // - teacher: assigned a class code derived from userId (last 8 chars of UUID portion)
  // - student: optional classCode in payload — must match an existing teacher's classId
  let classId = '';
  if (p.role === 'teacher') {
    classId = userId.slice(-8);
  } else if (p.role === 'student' && p.classCode) {
    const code = String(p.classCode).trim();
    const teacher = findRow('Users', u => u.role === 'teacher' && u.classId === code);
    if (teacher) classId = code;
    // If no match, silently leave blank — student can be assigned later.
  }

  appendRow('Users', {
    userId,
    role: p.role,
    name: p.name.trim(),
    email,
    passwordHash: hashPassword(p.password),
    createdAt: new Date().toISOString(),
    token,
    classId,
  });

  if (p.role === 'student') {
    appendRow('Profiles', {
      userId,
      cefrLevel: 'unknown',
      diagnosticCompletedAt: '',
      componentStrengths: '{}',
      vocabularyKnown: '[]',
      preferences: '{}',
    });
  }

  return {
    user: { userId, role: p.role, name: p.name, email, classId },
    token,
  };
}

function login(p) {
  if (!p.email || !p.password) throw new Error('יש להזין אימייל וסיסמה');

  const email = p.email.trim().toLowerCase();
  const passwordHash = hashPassword(p.password);

  const user = findRow('Users', u =>
    String(u.email).toLowerCase() === email && u.passwordHash === passwordHash
  );

  if (!user) throw new Error('אימייל או סיסמה שגויים');

  // Refresh token
  const newToken = genToken();
  updateRow('Users',
    u => u.userId === user.userId,
    u => Object.assign({}, u, { token: newToken })
  );

  return {
    user: {
      userId: user.userId,
      role: user.role,
      name: user.name,
      email: user.email,
      classId: user.classId || '',
    },
    token: newToken,
  };
}

function authenticateRequest(p) {
  if (!p.token || !p.userId) throw new Error('לא מחובר');
  const user = findRow('Users', u => u.userId === p.userId && u.token === p.token);
  if (!user) throw new Error('סשן לא תקין — כניסה מחדש');
  return user;
}

// ===== Profile =====

function getProfile(p) {
  authenticateRequest(p);
  const profile = findRow('Profiles', x => x.userId === p.userId);
  if (!profile) return { profile: null };
  return {
    profile: {
      userId: profile.userId,
      cefrLevel: profile.cefrLevel,
      diagnosticCompletedAt: profile.diagnosticCompletedAt,
      componentStrengths: tryParseJSON(profile.componentStrengths, {}),
      vocabularyKnown: tryParseJSON(profile.vocabularyKnown, []),
      preferences: tryParseJSON(profile.preferences, {}),
    },
  };
}

function saveProfile(p) {
  authenticateRequest(p);
  const ok = updateRow('Profiles',
    x => x.userId === p.userId,
    x => Object.assign({}, x, {
      cefrLevel: p.cefrLevel || x.cefrLevel,
      diagnosticCompletedAt: p.diagnosticCompletedAt || x.diagnosticCompletedAt,
      componentStrengths: typeof p.componentStrengths === 'object' ? JSON.stringify(p.componentStrengths) : x.componentStrengths,
      vocabularyKnown: Array.isArray(p.vocabularyKnown) ? JSON.stringify(p.vocabularyKnown) : x.vocabularyKnown,
      preferences: typeof p.preferences === 'object' ? JSON.stringify(p.preferences) : x.preferences,
    })
  );
  return { saved: ok };
}

// ===== Sessions =====

function startSession(p) {
  authenticateRequest(p);
  const sessionId = genId('ses');
  appendRow('Sessions', {
    sessionId,
    userId: p.userId,
    startedAt: new Date().toISOString(),
    endedAt: '',
    activitiesCompleted: 0,
    timeOnTaskSeconds: 0,
  });
  return { sessionId };
}

function endSession(p) {
  authenticateRequest(p);
  const ok = updateRow('Sessions',
    x => x.sessionId === p.sessionId && x.userId === p.userId,
    x => Object.assign({}, x, {
      endedAt: new Date().toISOString(),
      activitiesCompleted: p.activitiesCompleted || 0,
      timeOnTaskSeconds: p.timeOnTaskSeconds || 0,
    })
  );
  return { saved: ok };
}

function logActivity(p) {
  authenticateRequest(p);
  const activityId = genId('act');
  appendRow('Activities', {
    activityId,
    sessionId: p.sessionId,
    userId: p.userId,
    type: p.type,
    unitId: p.unitId || '',
    lessonId: p.lessonId || '',
    studentResponse: typeof p.studentResponse === 'object' ? JSON.stringify(p.studentResponse) : (p.studentResponse || ''),
    aiFeedback: p.aiFeedback || '',
    isCorrect: p.isCorrect || false,
    createdAt: new Date().toISOString(),
  });
  return { activityId };
}

function getProgress(p) {
  authenticateRequest(p);
  const sessions = readAll('Sessions').filter(s => s.userId === p.userId);
  const activities = readAll('Activities').filter(a => a.userId === p.userId);

  const totalSessions = sessions.length;
  const totalActivities = activities.length;
  const totalTime = sessions.reduce((sum, s) => sum + (Number(s.timeOnTaskSeconds) || 0), 0);

  // Last 7 days streak
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSessions = sessions.filter(s => new Date(s.startedAt) >= sevenDaysAgo);

  return {
    progress: {
      totalSessions,
      totalActivities,
      totalTimeSeconds: totalTime,
      recentSessions: recentSessions.length,
    },
  };
}

// ===== Teacher Dashboard =====

const ACTIVITY_TYPES = ['vocabulary', 'reading', 'listening', 'grammar', 'writing'];
const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

function requireTeacher(p) {
  const teacher = authenticateRequest(p);
  if (teacher.role !== 'teacher') throw new Error('רק מורים יכולים לראות את הדשבורד הכיתתי');
  if (!teacher.classId) throw new Error('אין כיתה משויכת — צרי קשר עם הצוות');
  return teacher;
}

function getClassRoster(p) {
  const teacher = requireTeacher(p);
  const students = readAll('Users')
    .filter(u => u.role === 'student' && u.classId === teacher.classId);

  const profiles = readAll('Profiles');
  const sessions = readAll('Sessions');
  const activities = readAll('Activities');
  const now = Date.now();

  const roster = students.map(s => {
    const profile = profiles.find(x => x.userId === s.userId);
    const studentSessions = sessions.filter(x => x.userId === s.userId);
    const studentActs = activities.filter(x => x.userId === s.userId);

    const lastSession = studentSessions
      .filter(x => x.startedAt)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];

    const correctActs = studentActs.filter(a => a.isCorrect === true || a.isCorrect === 'true');
    const successRate = studentActs.length > 0 ? correctActs.length / studentActs.length : null;

    const recentSessions = studentSessions
      .filter(x => x.startedAt && (now - new Date(x.startedAt).getTime()) <= SEVEN_DAYS_MS).length;

    return {
      userId: s.userId,
      name: s.name,
      email: s.email,
      cefrLevel: profile ? (profile.cefrLevel || 'unknown') : 'unknown',
      diagnosticCompletedAt: profile ? profile.diagnosticCompletedAt : '',
      lastSessionAt: lastSession ? lastSession.startedAt : '',
      recentSessions: recentSessions,
      totalSessions: studentSessions.length,
      totalActivities: studentActs.length,
      successRate: successRate !== null ? Number(successRate.toFixed(2)) : null,
    };
  });

  return { classId: teacher.classId, students: roster };
}

function getClassStats(p) {
  const teacher = requireTeacher(p);
  const students = readAll('Users')
    .filter(u => u.role === 'student' && u.classId === teacher.classId);
  const studentIds = students.map(s => s.userId);

  const activities = readAll('Activities')
    .filter(a => studentIds.indexOf(a.userId) >= 0);

  // Heatmap by activity type
  const heatmap = {};
  ACTIVITY_TYPES.forEach(type => {
    const acts = activities.filter(a => a.type === type);
    const correct = acts.filter(a => a.isCorrect === true || a.isCorrect === 'true').length;
    heatmap[type] = {
      attempts: acts.length,
      correct,
      successRate: acts.length > 0 ? Number((correct / acts.length).toFixed(2)) : null,
      coverageRate: students.length > 0 ?
        Number((new Set(acts.map(a => a.userId)).size / students.length).toFixed(2)) : 0,
    };
  });

  // CEFR distribution
  const profiles = readAll('Profiles').filter(x => studentIds.indexOf(x.userId) >= 0);
  const cefrCounts = {};
  profiles.forEach(p => {
    const lvl = p.cefrLevel || 'unknown';
    cefrCounts[lvl] = (cefrCounts[lvl] || 0) + 1;
  });
  const diagnosticsCompleted = profiles.filter(p => p.diagnosticCompletedAt).length;

  return {
    classId: teacher.classId,
    studentCount: students.length,
    diagnosticsCompleted,
    heatmap,
    cefrDistribution: cefrCounts,
  };
}

function getStudentDetail(p) {
  const teacher = requireTeacher(p);
  if (!p.studentId) throw new Error('חסר מזהה תלמיד');

  const student = findRow('Users', u => u.userId === p.studentId);
  if (!student || student.classId !== teacher.classId) {
    throw new Error('התלמיד לא בכיתה שלך');
  }

  const profile = findRow('Profiles', x => x.userId === p.studentId);
  const sessions = readAll('Sessions')
    .filter(x => x.userId === p.studentId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, 10);

  const activities = readAll('Activities')
    .filter(a => a.userId === p.studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);

  const breakdown = {};
  ACTIVITY_TYPES.forEach(type => {
    const acts = activities.filter(a => a.type === type);
    const correct = acts.filter(a => a.isCorrect === true || a.isCorrect === 'true').length;
    breakdown[type] = {
      attempts: acts.length,
      correct,
      successRate: acts.length > 0 ? Number((correct / acts.length).toFixed(2)) : null,
    };
  });

  return {
    student: {
      userId: student.userId,
      name: student.name,
      email: student.email,
      cefrLevel: profile ? (profile.cefrLevel || 'unknown') : 'unknown',
      diagnosticCompletedAt: profile ? profile.diagnosticCompletedAt : '',
      vocabularyKnown: profile ? tryParseJSON(profile.vocabularyKnown, []) : [],
    },
    sessions,
    breakdown,
    recentActivities: activities.slice(0, 15).map(a => ({
      activityId: a.activityId,
      type: a.type,
      unitId: a.unitId,
      lessonId: a.lessonId,
      isCorrect: a.isCorrect,
      createdAt: a.createdAt,
    })),
  };
}

// ===== AI Integration (Gemini) =====

function aiFeedback(p) {
  authenticateRequest(p);
  if (!p.studentText || !p.taskType) {
    throw new Error('חסרים פרטים לפידבק');
  }

  const prompt = buildFeedbackPrompt(p.taskType, p.studentText, p.context);
  const response = callGemini(prompt);
  return { feedback: response };
}

function aiGenerateText(p) {
  authenticateRequest(p);
  const prompt = `Generate an English text for a Grade 9 student at CEFR ${p.cefrLevel || 'A2'} level.
Topic: ${p.topic || 'general'}
Length: ${p.length || '50-80'} words.
Type: ${p.textType || 'short article'}.

Use simple vocabulary and clear sentence structure. Include 2-3 lexical chunks naturally.

Return ONLY the text, no commentary.`;
  const text = callGemini(prompt);
  return { text };
}

function buildFeedbackPrompt(taskType, studentText, context) {
  return `You are an English teacher giving SELECTIVE feedback to a Grade 9 student at CEFR A2 level.

Task type: ${taskType}
Student's text: "${studentText}"
Context: ${context || 'general writing task'}

Rules:
1. Find ONE specific error to focus on (Selective Correction methodology).
2. Praise something specific they did well first.
3. Explain the error clearly in Hebrew (the student speaks Hebrew).
4. Give a hint, not the answer.
5. Keep it under 60 words.

Format your response as JSON:
{
  "praise": "What they did well (in Hebrew)",
  "focus_error": "The one error to fix (in Hebrew)",
  "hint": "How to fix it (in Hebrew, brief)"
}`;
}

function callGemini(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API key לא מוגדר. הוסיפי GEMINI_API_KEY ב-Script Properties.');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
  const requestBody = {
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500,
    },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Gemini error ' + code + ': ' + response.getContentText().slice(0, 300));
  }

  const data = JSON.parse(response.getContentText());
  const textOut = data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;

  if (!textOut) throw new Error('No response from Gemini');
  return textOut;
}

// ===== Utility =====

function tryParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

// ===== One-time setup =====

function setupSheets() {
  Object.keys(SHEETS).forEach(k => getSheet(SHEETS[k]));
  Logger.log('Sheets ready: ' + Object.values(SHEETS).join(', '));
}
