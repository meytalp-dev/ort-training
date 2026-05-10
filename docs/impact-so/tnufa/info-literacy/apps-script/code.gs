/**
 * ImpactOS אוריינות מידע — Backend (Google Apps Script)
 * =====================================================
 *
 * Setup:
 * 1. Open Google Sheets, create new file: "ImpactOS Info Literacy DB"
 * 2. Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL → assets/js/config.js (API_URL)
 *
 * Script Properties (Project Settings → Script Properties):
 * - GEMINI_API_KEY: Your Gemini API key
 *
 * Sheets that will be created automatically:
 * - Users         — משתמשים
 * - Profiles      — פרופיל למידה לכל תלמיד
 * - Diagnostics   — תוצאות אבחון פתיחה
 * - Portfolio     — פריטי פורטפוליו ביצועים
 * - AILog         — לוג שימוש ב-AI (כלל השקיפות)
 * - Activities    — פעילויות בתוך יחידות
 * - Classes       — שיוך תלמידים-מורים-כיתות
 */

const SHEETS = {
  USERS: 'Users',
  PROFILES: 'Profiles',
  DIAGNOSTICS: 'Diagnostics',
  PORTFOLIO: 'Portfolio',
  AI_LOG: 'AILog',
  ACTIVITIES: 'Activities',
  CLASSES: 'Classes',
};

const HEADERS = {
  Users: ['userId', 'role', 'name', 'email', 'passwordHash', 'createdAt', 'token', 'classId'],
  Profiles: [
    'userId',
    'overallLevel',          // 1-4
    'diagnosticCompletedAt', // ISO date
    'componentLevels',       // JSON: {"1.1": 2, "1.2": 1, ...}
    'currentStage',          // 'open' | 'core' | 'apply' | 'present' | 'reflect'
    'aiHabits',              // JSON: {usesAI: bool, verifies: bool, ...}
    'preferences',           // JSON
  ],
  Diagnostics: [
    'diagnosticId',
    'userId',
    'completedAt',
    'rawResponses',          // JSON של כל התשובות
    'computedProfile',       // JSON: {componentLevels, overallLevel, aiHabits}
    'durationSeconds',
  ],
  Portfolio: [
    'itemId',
    'userId',
    'createdAt',
    'type',                  // 'inquiry' | 'project' | 'reflection' | 'unit-completion'
    'title',
    'subject',               // 'history' | 'civics' | 'hebrew' | 'science' | 'general'
    'componentsTouched',     // JSON array של רכיבים: ["1.2", "1.3", "2.5"]
    'description',
    'attachmentUrl',
    'rubricLevels',          // JSON: {"1.2": 3, "2.5": 2}
    'teacherFeedback',
    'studentReflection',
  ],
  AILog: [
    'logId',
    'userId',
    'createdAt',
    'tool',                  // 'ChatGPT' | 'Claude' | 'Gemini' | 'Perplexity' | 'other'
    'prompt',
    'output',
    'whatIDidWithIt',
    'verifiedAgainst',       // איך אימתי
    'whatAIMissed',          // תשובה לכלל 3
    'parentalConsent',       // bool — תאימות להנחיות משה"ח ינואר 2025
    'unitId',
  ],
  Activities: [
    'activityId',
    'userId',
    'createdAt',
    'unitId',
    'lessonId',
    'type',                  // 'unit-step' | 'reflection' | 'quiz'
    'studentResponse',
    'isComplete',
    'durationSeconds',
  ],
  Classes: [
    'classId',
    'name',                  // למשל "ט'1"
    'schoolId',
    'teacherUserId',         // userId של המורה
    'subject',               // המקצוע המוביל
    'createdAt',
  ],
};

// ===== Web App Entry Points =====

function doPost(e) { return handle(e); }
function doGet(e) { return handle(e); }

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
      case 'register':         result = register(payload); break;
      case 'login':            result = login(payload); break;
      case 'getProfile':       result = getProfile(payload); break;
      case 'saveProfile':      result = saveProfile(payload); break;
      case 'submitDiagnostic': result = submitDiagnostic(payload); break;
      case 'addPortfolioItem': result = addPortfolioItem(payload); break;
      case 'getPortfolio':     result = getPortfolio(payload); break;
      case 'logAIUse':         result = logAIUse(payload); break;
      case 'getAILog':         result = getAILog(payload); break;
      case 'logActivity':      result = logActivity(payload); break;
      case 'getProgress':      result = getProgress(payload); break;
      case 'getClassRoster':   result = getClassRoster(payload); break;
      case 'getClassHeatmap':  result = getClassHeatmap(payload); break;
      case 'aiFeedback':       result = aiFeedback(payload); break;
      case 'ping':             result = { ok: true, time: new Date().toISOString() }; break;
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
  return readAll(name).find(predicate) || null;
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

// ===== ID + Token =====

function genId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function genToken() {
  return Utilities.getUuid().replace(/-/g, '');
}

function hashPassword(password) {
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
  if (!['student', 'teacher'].includes(p.role)) {
    throw new Error('תפקיד לא תקין');
  }

  const email = p.email.trim().toLowerCase();
  const existing = findRow('Users', u => String(u.email).toLowerCase() === email);
  if (existing) throw new Error('משתמש עם אימייל זה כבר קיים');

  const userId = genId('usr');
  const token = genToken();

  appendRow('Users', {
    userId,
    role: p.role,
    name: p.name.trim(),
    email,
    passwordHash: hashPassword(p.password),
    createdAt: new Date().toISOString(),
    token,
    classId: p.classId || '',
  });

  if (p.role === 'student') {
    appendRow('Profiles', {
      userId,
      overallLevel: 1,
      diagnosticCompletedAt: '',
      componentLevels: '{}',
      currentStage: 'open',
      aiHabits: '{}',
      preferences: '{}',
    });
  }

  return {
    user: { userId, role: p.role, name: p.name, email },
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

  const newToken = genToken();
  updateRow('Users',
    u => u.userId === user.userId,
    u => Object.assign({}, u, { token: newToken })
  );

  return {
    user: { userId: user.userId, role: user.role, name: user.name, email: user.email },
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
      overallLevel: Number(profile.overallLevel) || 1,
      diagnosticCompletedAt: profile.diagnosticCompletedAt,
      componentLevels: tryParseJSON(profile.componentLevels, {}),
      currentStage: profile.currentStage || 'open',
      aiHabits: tryParseJSON(profile.aiHabits, {}),
      preferences: tryParseJSON(profile.preferences, {}),
    },
  };
}

function saveProfile(p) {
  authenticateRequest(p);
  const ok = updateRow('Profiles',
    x => x.userId === p.userId,
    x => Object.assign({}, x, {
      overallLevel: p.overallLevel || x.overallLevel,
      diagnosticCompletedAt: p.diagnosticCompletedAt || x.diagnosticCompletedAt,
      componentLevels: typeof p.componentLevels === 'object' ? JSON.stringify(p.componentLevels) : x.componentLevels,
      currentStage: p.currentStage || x.currentStage,
      aiHabits: typeof p.aiHabits === 'object' ? JSON.stringify(p.aiHabits) : x.aiHabits,
      preferences: typeof p.preferences === 'object' ? JSON.stringify(p.preferences) : x.preferences,
    })
  );
  return { saved: ok };
}

// ===== Diagnostic =====

function submitDiagnostic(p) {
  authenticateRequest(p);
  if (!p.responses || !p.computedProfile) {
    throw new Error('חסרים נתוני אבחון');
  }

  const diagnosticId = genId('diag');
  const now = new Date().toISOString();

  appendRow('Diagnostics', {
    diagnosticId,
    userId: p.userId,
    completedAt: now,
    rawResponses: JSON.stringify(p.responses),
    computedProfile: JSON.stringify(p.computedProfile),
    durationSeconds: p.durationSeconds || 0,
  });

  // Update profile with diagnostic results
  updateRow('Profiles',
    x => x.userId === p.userId,
    x => Object.assign({}, x, {
      diagnosticCompletedAt: now,
      overallLevel: p.computedProfile.overallLevel || 1,
      componentLevels: JSON.stringify(p.computedProfile.componentLevels || {}),
      aiHabits: JSON.stringify(p.computedProfile.aiHabits || {}),
    })
  );

  return { diagnosticId };
}

// ===== Portfolio =====

function addPortfolioItem(p) {
  authenticateRequest(p);
  const itemId = genId('port');
  appendRow('Portfolio', {
    itemId,
    userId: p.userId,
    createdAt: new Date().toISOString(),
    type: p.type || 'inquiry',
    title: p.title || '',
    subject: p.subject || 'general',
    componentsTouched: JSON.stringify(p.componentsTouched || []),
    description: p.description || '',
    attachmentUrl: p.attachmentUrl || '',
    rubricLevels: typeof p.rubricLevels === 'object' ? JSON.stringify(p.rubricLevels) : '{}',
    teacherFeedback: '',
    studentReflection: p.studentReflection || '',
  });
  return { itemId };
}

function getPortfolio(p) {
  authenticateRequest(p);
  const items = readAll('Portfolio')
    .filter(x => x.userId === p.userId)
    .map(x => ({
      itemId: x.itemId,
      createdAt: x.createdAt,
      type: x.type,
      title: x.title,
      subject: x.subject,
      componentsTouched: tryParseJSON(x.componentsTouched, []),
      description: x.description,
      attachmentUrl: x.attachmentUrl,
      rubricLevels: tryParseJSON(x.rubricLevels, {}),
      teacherFeedback: x.teacherFeedback,
      studentReflection: x.studentReflection,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { items };
}

// ===== AI Log =====

function logAIUse(p) {
  authenticateRequest(p);
  const logId = genId('ailog');
  appendRow('AILog', {
    logId,
    userId: p.userId,
    createdAt: new Date().toISOString(),
    tool: p.tool || 'other',
    prompt: p.prompt || '',
    output: p.output || '',
    whatIDidWithIt: p.whatIDidWithIt || '',
    verifiedAgainst: p.verifiedAgainst || '',
    whatAIMissed: p.whatAIMissed || '',
    parentalConsent: p.parentalConsent ? 'true' : 'false',
    unitId: p.unitId || '',
  });
  return { logId };
}

function getAILog(p) {
  authenticateRequest(p);
  const entries = readAll('AILog')
    .filter(x => x.userId === p.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { entries };
}

// ===== Activities =====

function logActivity(p) {
  authenticateRequest(p);
  const activityId = genId('act');
  appendRow('Activities', {
    activityId,
    userId: p.userId,
    createdAt: new Date().toISOString(),
    unitId: p.unitId || '',
    lessonId: p.lessonId || '',
    type: p.type || 'unit-step',
    studentResponse: typeof p.studentResponse === 'object' ? JSON.stringify(p.studentResponse) : (p.studentResponse || ''),
    isComplete: p.isComplete || false,
    durationSeconds: p.durationSeconds || 0,
  });
  return { activityId };
}

function getProgress(p) {
  authenticateRequest(p);
  const activities = readAll('Activities').filter(a => a.userId === p.userId);
  const portfolio = readAll('Portfolio').filter(x => x.userId === p.userId);
  const aiLogs = readAll('AILog').filter(x => x.userId === p.userId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    progress: {
      totalActivities: activities.length,
      portfolioItems: portfolio.length,
      aiLogEntries: aiLogs.length,
      recentActivities: activities.filter(a => new Date(a.createdAt) >= sevenDaysAgo).length,
    },
  };
}

// ===== Teacher =====

function getClassRoster(p) {
  const teacher = authenticateRequest(p);
  if (teacher.role !== 'teacher') throw new Error('רק מורים יכולים לראות כיתה');

  const classId = teacher.classId;
  if (!classId) return { students: [] };

  const students = readAll('Users')
    .filter(u => u.role === 'student' && u.classId === classId);

  const profiles = readAll('Profiles');

  const roster = students.map(s => {
    const profile = profiles.find(x => x.userId === s.userId);
    return {
      userId: s.userId,
      name: s.name,
      email: s.email,
      overallLevel: profile ? Number(profile.overallLevel) : 1,
      diagnosticCompletedAt: profile ? profile.diagnosticCompletedAt : '',
      currentStage: profile ? profile.currentStage : 'open',
      componentLevels: profile ? tryParseJSON(profile.componentLevels, {}) : {},
    };
  });

  return { students: roster };
}

function getClassHeatmap(p) {
  const teacher = authenticateRequest(p);
  if (teacher.role !== 'teacher') throw new Error('רק מורים יכולים לראות מפת חום');

  const classId = teacher.classId;
  if (!classId) return { heatmap: {} };

  const students = readAll('Users')
    .filter(u => u.role === 'student' && u.classId === classId);
  const profiles = readAll('Profiles');

  // Aggregate per component
  const components = ['1.1','1.2','1.3','1.4','1.5','2.1','2.2','2.3','2.4','2.5','3.1','3.2','3.3'];
  const heatmap = {};

  components.forEach(c => {
    const levels = students.map(s => {
      const profile = profiles.find(x => x.userId === s.userId);
      const cl = profile ? tryParseJSON(profile.componentLevels, {}) : {};
      return Number(cl[c]) || 0;
    }).filter(x => x > 0);

    heatmap[c] = {
      mean: levels.length ? (levels.reduce((a,b) => a+b, 0) / levels.length).toFixed(2) : 0,
      count: levels.length,
      total: students.length,
    };
  });

  return { heatmap };
}

// ===== AI (Gemini) =====

function aiFeedback(p) {
  authenticateRequest(p);
  if (!p.studentText || !p.taskType) {
    throw new Error('חסרים פרטים לפידבק');
  }

  const prompt = buildFeedbackPrompt(p.taskType, p.studentText, p.context);
  const response = callGemini(prompt);
  return { feedback: response };
}

function buildFeedbackPrompt(taskType, studentText, context) {
  return `את.ה מורה לאוריינות מידע נותן.ת פידבק לתלמיד.ת כיתה ט'.

סוג המשימה: ${taskType}
טקסט התלמיד.ה: "${studentText}"
הקשר: ${context || 'משימת חקר כללית'}

כללים:
1. למצוא נקודה אחת ספציפית לעבוד עליה (לא יותר).
2. לציין משהו ספציפי שהתלמיד.ה עשה.עשתה היטב — תחילה.
3. להסביר את הנקודה לשיפור בעברית פשוטה.
4. לתת רמז, לא תשובה.
5. עד 60 מילים.

החזר JSON:
{
  "praise": "מה עשו טוב (בעברית)",
  "focus_point": "נקודה אחת לשיפור (בעברית)",
  "hint": "איך לשפר (בעברית, קצר)"
}`;
}

function callGemini(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API key לא מוגדר');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
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
  try { return JSON.parse(str); } catch (e) { return fallback; }
}

function setupSheets() {
  Object.keys(SHEETS).forEach(k => getSheet(SHEETS[k]));
  Logger.log('Sheets ready: ' + Object.values(SHEETS).join(', '));
}
