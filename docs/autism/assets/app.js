// מתחברים — לוגיקת מערכת
// שכבת נתונים: localStorage (MVP). בהמשך נחליף לחיבור Google Sheet.

const DB_KEY = 'mitchabrim_v1';

const INTERESTS = [
  'אנימה', 'מוזיקה', 'ציור ואיור', 'משחקי מחשב', 'קריאה', 'כתיבה',
  'סרטים וסדרות', 'חתולים וכלבים', 'צילום', 'בישול ואפייה', 'יצירה',
  'טבע וטיולים', 'היסטוריה', 'מדע וטכנולוגיה', 'ספורט', 'גיימינג',
  'פאזלים', 'אספנות', 'מנגה', 'Cosplay', 'דיג׳יי ומוזיקה אלקטרונית',
  'פסנתר', 'גיטרה', 'שירה', 'ריקוד', 'תיאטרון'
];

const COMM_PREFS = [
  { id: 'text', label: 'כתיבה בצ׳אט' },
  { id: 'voice', label: 'הודעות קוליות' },
  { id: 'video', label: 'שיחת וידאו' },
  { id: 'meet', label: 'מפגש פיזי' }
];

const LOOKING_FOR = [
  { id: 'friendship', label: 'חברות', icon: 'friends' },
  { id: 'relationship', label: 'זוגיות', icon: 'heart' },
  { id: 'group', label: 'קבוצת עניין', icon: 'group' }
];

const AREAS = [
  'ירושלים', 'תל אביב והמרכז', 'שרון', 'שפלה', 'חיפה והקריות',
  'צפון', 'ים המלח והערבה', 'דרום', 'ש״י', 'אחר'
];

// ——— DB ———

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return emptyDB();
    const db = JSON.parse(raw);
    if (!db.users) db.users = [];
    if (!db.matches) db.matches = [];
    if (!db.messages) db.messages = [];
    if (!db.contactRequests) db.contactRequests = [];
    return db;
  } catch (e) {
    return emptyDB();
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function emptyDB() {
  return { users: [], matches: [], messages: [], contactRequests: [] };
}

function resetDB() {
  if (confirm('לאפס את כל הנתונים?')) {
    localStorage.removeItem(DB_KEY);
    location.reload();
  }
}

// ——— Session ———

function getCurrentUser() {
  const id = localStorage.getItem('mitchabrim_current_user');
  if (!id) return null;
  const db = loadDB();
  return db.users.find(u => u.id === id) || null;
}

function setCurrentUser(id) {
  if (id) localStorage.setItem('mitchabrim_current_user', id);
  else localStorage.removeItem('mitchabrim_current_user');
}

function logout() {
  setCurrentUser(null);
  location.href = 'index.html';
}

function isAdmin() {
  return localStorage.getItem('mitchabrim_admin') === 'yes';
}

function setAdmin(on) {
  if (on) localStorage.setItem('mitchabrim_admin', 'yes');
  else localStorage.removeItem('mitchabrim_admin');
}

// ——— Users ———

function createUser(data) {
  const db = loadDB();
  const user = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    status: 'pending', // pending | approved | rejected
    ...data
  };
  db.users.push(user);
  saveDB(db);
  return user;
}

function updateUser(id, patch) {
  const db = loadDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...patch };
  saveDB(db);
  return db.users[idx];
}

function approvedUsers() {
  return loadDB().users.filter(u => u.status === 'approved');
}

// ——— Matching ———

function matchScore(me, other) {
  let score = 0;
  const reasons = [];
  // אזור
  if (me.area && other.area && me.area === other.area) {
    score += 40; reasons.push('אותו אזור');
  }
  // תחומי עניין משותפים
  const shared = (me.interests || []).filter(i => (other.interests || []).includes(i));
  if (shared.length) {
    score += shared.length * 10;
    reasons.push(`${shared.length} תחומי עניין משותפים`);
  }
  // מה מחפשים
  if (me.lookingFor && other.lookingFor && me.lookingFor === other.lookingFor) {
    score += 30; reasons.push('מחפשים את אותו דבר');
  }
  // גיל
  if (me.age && other.age) {
    const diff = Math.abs(parseInt(me.age) - parseInt(other.age));
    if (diff <= 3) { score += 20; reasons.push('גילאים קרובים'); }
    else if (diff <= 7) { score += 10; }
  }
  return { score, reasons, shared };
}

function recommendationsFor(me) {
  const others = approvedUsers().filter(u => u.id !== me.id);
  return others
    .map(o => ({ user: o, ...matchScore(me, o) }))
    .sort((a, b) => b.score - a.score);
}

// ——— Likes / Matches ———

function hasLiked(fromId, toId) {
  return loadDB().matches.some(m => m.from === fromId && m.to === toId);
}

function isMutualMatch(aId, bId) {
  const db = loadDB();
  return db.matches.some(m => m.from === aId && m.to === bId) &&
         db.matches.some(m => m.from === bId && m.to === aId);
}

function likeUser(fromId, toId) {
  const db = loadDB();
  if (!db.matches.some(m => m.from === fromId && m.to === toId)) {
    db.matches.push({ from: fromId, to: toId, at: new Date().toISOString() });
    saveDB(db);
  }
  return isMutualMatch(fromId, toId);
}

function mutualMatchesFor(userId) {
  const db = loadDB();
  const myLikes = db.matches.filter(m => m.from === userId).map(m => m.to);
  return myLikes.filter(otherId =>
    db.matches.some(m => m.from === otherId && m.to === userId)
  );
}

// ——— Messages ———

function conversationId(aId, bId) {
  return [aId, bId].sort().join('::');
}

function sendMessage(fromId, toId, text) {
  const db = loadDB();
  db.messages.push({
    id: 'm_' + Date.now(),
    conv: conversationId(fromId, toId),
    from: fromId, to: toId, text,
    at: new Date().toISOString()
  });
  saveDB(db);
}

function messagesFor(aId, bId) {
  const conv = conversationId(aId, bId);
  return loadDB().messages.filter(m => m.conv === conv);
}

// ——— Contact Requests (דרך הורה) ———

function requestContact(fromId, toId) {
  const db = loadDB();
  if (db.contactRequests.some(r => r.from === fromId && r.to === toId && r.status === 'pending')) {
    return false;
  }
  db.contactRequests.push({
    id: 'r_' + Date.now(),
    from: fromId, to: toId,
    status: 'pending',
    at: new Date().toISOString()
  });
  saveDB(db);
  return true;
}

// ——— Helpers ———

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// פלטה קבועה לכל משתמש לפי השם — לייחודיות ויזואלית
const PALETTES = ['coral', 'sage', 'teal', 'butter', 'lavender'];
function paletteFor(name) {
  if (!name) return 'teal';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'עכשיו';
  if (diff < 3600) return Math.floor(diff / 60) + ' דקות';
  if (diff < 86400) return Math.floor(diff / 3600) + ' שעות';
  return Math.floor(diff / 86400) + ' ימים';
}

function lookingForLabel(id) {
  const item = LOOKING_FOR.find(x => x.id === id);
  return item ? item.label : id;
}

function commPrefLabel(id) {
  const item = COMM_PREFS.find(x => x.id === id);
  return item ? item.label : id;
}

// ——— Demo data seed ———

function seedDemoData() {
  const db = loadDB();
  if (db.users.length > 0) return false;
  const demos = [
    { name: 'שקד', age: 22, area: 'ירושלים', interests: ['אנימה', 'ציור ואיור', 'מוזיקה', 'מנגה'], lookingFor: 'friendship', bio: 'אוהבת לצייר דמויות אנימה ולשמוע Lo-fi. מחפשת חבר/ה שיבינו אותי ויאהבו את אותם דברים.', commPrefs: ['text', 'voice'], parentName: 'רונית', parentPhone: '050-0000001', status: 'approved' },
    { name: 'דניאל', age: 24, area: 'ירושלים', interests: ['משחקי מחשב', 'אנימה', 'מנגה', 'גיימינג'], lookingFor: 'friendship', bio: 'גיימר מנוסה, אוהב סדרות אנימה ומשחקי RPG. מעדיף שיחות על משחקים והמלצות.', commPrefs: ['text'], parentName: 'אלי', parentPhone: '050-0000002', status: 'approved' },
    { name: 'טל', age: 21, area: 'תל אביב והמרכז', interests: ['מוזיקה', 'שירה', 'פסנתר', 'כתיבה'], lookingFor: 'relationship', bio: 'מנגן פסנתר וכותב שירים. מחפש מישהי שקטה ורגישה, שתהנה לשבת יחד ולהקשיב למוזיקה.', commPrefs: ['text', 'video'], parentName: 'יעל', parentPhone: '050-0000003', status: 'approved' },
    { name: 'נעמה', age: 23, area: 'תל אביב והמרכז', interests: ['ציור ואיור', 'צילום', 'יצירה', 'אנימה'], lookingFor: 'friendship', bio: 'יוצרת ומעצבת. אוהבת לטייל ולצלם. מחפשת חברות שלא מעיקה.', commPrefs: ['text', 'meet'], parentName: 'דנה', parentPhone: '050-0000004', status: 'approved' },
    { name: 'עמית', age: 25, area: 'חיפה והקריות', interests: ['מוזיקה', 'גיטרה', 'סרטים וסדרות', 'קריאה'], lookingFor: 'relationship', bio: 'מנגן גיטרה, אוהב ספרות פנטזיה. מחפש קשר אמיתי בקצב שלי.', commPrefs: ['text', 'voice'], parentName: 'רותם', parentPhone: '050-0000005', status: 'approved' },
    { name: 'רוני', age: 22, area: 'שרון', interests: ['ציור ואיור', 'חתולים וכלבים', 'Cosplay', 'אנימה'], lookingFor: 'group', bio: 'אוהבת Cosplay ואמנות. מחפשת קבוצה של אנשים שמתחברים לאנימה ורוצים להיפגש מדי פעם.', commPrefs: ['text', 'meet'], parentName: 'מיכל', parentPhone: '050-0000006', status: 'approved' }
  ];
  demos.forEach(d => createUser(d));
  return true;
}

// "Try it" — איפוס + סביבת דמו מלאה + כניסה כנויה
function createDemoActiveUser() {
  // איפוס נקי כדי להבטיח שהסביבה מלאה
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem('mitchabrim_current_user');
  seedDemoData();
  const user = createUser({
    name: 'נויה',
    age: 23,
    area: 'ירושלים',
    interests: ['אנימה', 'ציור ואיור', 'מוזיקה'],
    lookingFor: 'friendship',
    bio: 'אני אוהבת אנימה וציור. שקטה אבל מאוד נאמנה כחברה. מחפשת חברה או חבר שירצו לדבר על מה שמרגש אותנו.',
    commPrefs: ['text'],
    parentName: 'מיטל',
    parentPhone: '050-1234567',
    status: 'approved'
  });
  setCurrentUser(user.id);
  return user;
}

// expose for debug
window.Mitchabrim = {
  loadDB, saveDB, resetDB, seedDemoData, createDemoActiveUser,
  INTERESTS, COMM_PREFS, LOOKING_FOR, AREAS
};
