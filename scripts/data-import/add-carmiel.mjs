import fs from 'fs';
const detailed = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data-detailed.json', 'utf8'));
const compact = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data.json', 'utf8'));

const key = Object.keys(detailed).find(k => k.includes('כרמיאל'));
console.log('Key:', key);
const s = detailed[key];

Object.assign(s.committee, {
  principal: 'שיראל פרץ',
  inspector: 'שלמה גץ',
  supervisorName: 'רביב שוורץ',
  therapeuticInspector: 'אסתי הרפר',
  networkRep: 'איתי יבין',
  studentCount: 177,
  studentHistory: {"תשפ\"ג":130,"תשפ\"ד":147,"תשפ\"ה":180,"תשפ\"ו":177},
  classCount: 9,
  teacherCount: 28,
  adminStaff: 3,
  teachersBA: 13,
  teachersMA: 10,
  teachersCertified: 5,
  teachersOutOfCert: 2,
  tracks: ['עיצוב שיער ואיפור', 'ספורט', 'טכנאות שיניים', 'קונדיטוריה'],
  populationDesc: 'בית ספר פתוח לקהילה, תלמידים ערכיים ומקצועיים, מודל חינוך יוצר מדגים',
  bagrutData: {
    "תשפ\"ג": {graduates:35,vocationalCert:25,techBagrut:6,fullBagrut:5},
    "תשפ\"ד": {graduates:33,vocationalCert:30,techBagrut:14,fullBagrut:7},
    "תשפ\"ה": {graduates:43,vocationalCert:41,techBagrut:15,fullBagrut:11},
    "צפי תשפ\"ו": {graduates:48,vocationalCert:43,techBagrut:21,fullBagrut:15}
  },
  employmentData: {tracks:[
    {name:'עיצוב שיער ואיפור',enrolled:22,employed:17},
    {name:'ספורט',enrolled:6,employed:8},
    {name:'טכנאות שיניים',enrolled:12,employed:4},
    {name:'קונדיטוריה',enrolled:12,employed:9}
  ]},
  employmentRate: 75, // 73/97 = 75%
  inclusionStudents: 24,
  inclusionHours: 99.5,
  inclusionTeachers: 3,
  dropoutRate: 3, // target under 3%
  dropoutData: {
    'ט': {total:21,leavers:0,voluntary:1},
    'י': {total:13,leavers:0,voluntary:0},
    'יא': {total:11,leavers:1,voluntary:2},
    'יב': {total:1,leavers:0,voluntary:2}
  },
  roleHolders: {
    'מנהלת':'שיראל פרץ','סגן':'דודו דהן',
    'רכזת פדגוגית':'הילה גיל','רכזת חניכות':'מירב בוקריס, לבנה בן חמו',
    'רכזת חברתית':'לבנה בן חמו','יועצות':'לימור דן טלמון, רויה נבון',
    'מתלית':"ג'ניה לחיאני",'רכז הכלה ושילוב':'גרישה ליבק'
  },
  trackDetails: {
    'עיצוב שיער ואיפור': {coordinator:'מירב בוקריס',teachers:5,projects:'עתיד ביוטי, מספרה קהילתית ניידת, תחרות עיצוב שיער, מיופי לתקווה - נשים מחלימות סרטן'},
    'ספורט': {coordinator:'נעמה נשיא',teachers:4,workshopStatus:'חדר כושר חדיש, מתקני ספורט בטבע, מגרש כדורגל תקני',projects:'עתיד ספורטיבי - הפעלת שיעורים וחוגים בבתי ספר, עתיד ימי הולדת, נבחרת כדורגל'},
    'טכנאות שיניים': {coordinator:'פאול רייבו',teachers:1,workshopStatus:'סדנא חדשנית ומאובזרת',projects:'תזמורת בית ספרית, קורסי סייעי שיניים'},
    'קונדיטוריה': {coordinator:'מאיה סולימני',teachers:2,workshopStatus:'סדנא חדשה ומאובזרת',projects:'גיבורים קטנים (29 חניכים), מפעלון בית ספרי, האקתון'}
  },
  prides: '4 דברים שאנחנו גאים בהם: | 1. חיבור עם הקהילה ומוסדות - הכרה והערכה, שילוב מלא, פעילויות משותפות, מעורבות חברתית | 2. ביה"ס כבית ערכי לתלמידים - סביבה מוגנת ואוהבת, קשר עם ההורים, גאוות יחידה | 3. הצלחות לימודיות והזדמנויות מקצועיות - אחוז בגרויות, תעודות מקצוע, הסמכות משלימות | 4. חינוך ופיתוח עסקי - עתיד ספורטיבי, עתיד ביוטי, סדנאות קונדיטוריה, ימי הולדת',
  leaps: 'קפיצות מדרגה: | 1. הטמעת החינוך היוצר בפדגוגיה הבית ספרית - תוכנית מורה פורץ דרך, הרחבת תעודות הסמכה | 2. הרחבת מעגלי שיתוף הפעולה בקהילה - מיצוב כביס מעורב חברתית | 3. העלאת אחוז הזכאים לבגרות מלאה והסמכה מקצועית',
  militaryRate: 84, // 84% גיוס
});

Object.assign(s.summary, {
  studentCount: 177,
  principal: 'שיראל פרץ',
  employmentRate: 75,
  vocationalCertRate: 95, // 41/43
  supervisor: 'רביב שוורץ'
});

if (compact[key]) {
  Object.assign(compact[key].committee, s.committee);
  delete compact[key].committee.slides;
  delete compact[key].committee.fullText;
  Object.assign(compact[key].summary, s.summary);
}

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');

console.log('Updated כרמיאל (עתיד מגשימים):');
console.log('  Students:', s.summary.studentCount);
console.log('  Tracks:', s.committee.tracks.join(', '));
console.log('  Employment: 75%');
console.log('  Vocational cert: ~95%');
console.log('  Military: 84%');
