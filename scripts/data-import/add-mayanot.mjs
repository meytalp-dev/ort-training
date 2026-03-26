import fs from 'fs';
const detailed = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data-detailed.json', 'utf8'));
const compact = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data.json', 'utf8'));

const key = Object.keys(detailed).find(k => k.includes('מעיינות'));
console.log('Key:', key);
const s = detailed[key];

Object.assign(s.committee, {
  principal: 'אסתי שלקובסקי',
  inspector: 'יששכר חפץ',
  therapeuticInspector: 'אסתי רייפר המרמן',
  networkRep: 'חגית רימוך',
  studentCount: 67,
  studentHistory: {"תשפ\"ד":66,"תשפ\"ה":70,"תשפ\"ו":67},
  classCount: 4,
  teacherCount: 17,
  adminStaff: 4,
  teachersBA: 10,
  teachersMA: 7,
  tracks: ['פרסום ושיווק דיגיטלי'],
  populationDesc: 'בנות במגזר החרדי, בית ספר ממותג כאופציה ללימודים ברמה גבוהה מקצועית ואקדמית. הוקם על רקע נשירה גבוהה בקרב בנות',
  inclusionStudents: 13,
  inclusionHours: 41,
  inclusionTeachers: 6,
  bagrutData: {
    "תשפ\"ב": {graduates:17,vocationalCert:13,fullBagrut:7},
    "תשפ\"ג": {graduates:18,vocationalCert:17,fullBagrut:8},
    "תשפ\"ד": {graduates:21,vocationalCert:21,fullBagrut:16},
    "תשפ\"ה": {graduates:14,vocationalCert:14,fullBagrut:8}
  },
  vocationalCertRate: 100, // תשפד-תשפה
  roleHolders: {
    'מנהלת':'אסתי שלקובסקי',
    'רכזת פדגוגית':'פנינה בן מוחא',
    'יועצת':'איילת לוי',
    'מטפלת רגשית':'אירית אגמון',
    'רכזת הכלה ושילוב':'חני טויב',
    'רכזת ביקור סדיר':'אביטל שעאר'
  },
  prides: 'הגאווה שלנו: | בית ספר עשיר בתוכניות לימוד מיוחדות, למידה במרחבי חיים, פרויקטים לימודיים, פיתוח חשיבה באמצעות אומנות ומשחקי חשיבה, תוכנית מנהיגות, מערך שלם של פיתוח החוסן האישי והרגשי',
  leaps: 'קפיצות מדרגה: | 1. מעבר מהנעה חיצונית להנעה פנימית ופיתוח תחושת מסוגלות | 2. העמקת ערבות הדדית ושייכות דרך חינוך יוצר - מסעות וחסד | 3. ביסוס מעטפת תומכת ושותפות מיטבית עם הורים וצוות',
  dropoutData: {"תשפ\"ג":{total:66,leavers:3},"תשפ\"ד":{total:65,leavers:6},"תשפ\"ה":{total:67,leavers:3}},
});

Object.assign(s.summary, {
  studentCount: 67,
  principal: 'אסתי שלקובסקי',
  vocationalCertRate: 100,
  supervisor: 'יששכר חפץ'
});

if (compact[key]) {
  Object.assign(compact[key].committee, s.committee);
  delete compact[key].committee.slides; delete compact[key].committee.fullText;
  Object.assign(compact[key].summary, s.summary);
}

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('Updated מעיינות צפת: 67 students, vocational cert 100%');
