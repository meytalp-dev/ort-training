import fs from 'fs';
const detailed = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data-detailed.json', 'utf8'));
const compact = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data.json', 'utf8'));

const key = Object.keys(detailed).find(k => k.includes('באר שבע'));
console.log('Key:', key);
const s = detailed[key];

Object.assign(s.committee, {
  principal: 'מאיר אבן שימול',
  inspector: 'שרונה בלוך',
  supervisorName: 'קטרינה ברבשטיין',
  therapeuticInspector: 'שרית תורג׳מן-יפה',
  networkRep: 'איתי יבין',
  studentCount: 175,
  studentHistory: {"תשפ\"ג":136,"תשפ\"ד":151,"תשפ\"ה":168,"תשפ\"ו":175},
  classCount: 11,
  teacherCount: 20,
  adminStaff: 5,
  teachersBA: 12,
  teachersMA: 5,
  teachersCertified: 1,
  teachersOutOfCert: 1,
  tracks: ['מערכות הנדסיות / עיצוב תעשייתי', 'ניהול לוגיסטיקה וטכנולוגיה', 'מדיה חזותית'],
  populationDesc: 'תלמידים מגוונים, בעלי חלומות ושאיפות, גאים במורשתם, בעלי כישורים ומיומנויות המאה ה-21',
  bagrutData: {
    "תשפ\"ג": {graduates:20,vocationalCert:20},
    "תשפ\"ד": {graduates:22,vocationalCert:22,techBagrut:1},
    "תשפ\"ה": {graduates:31,vocationalCert:30,techBagrut:6},
    "צפי תשפ\"ו": {graduates:34,vocationalCert:30,techBagrut:8}
  },
  employmentData: {tracks:[
    {name:'מערכות הנדסיות',enrolled:19,employed:19},
    {name:'ניהול לוגיסטיקה וטכנולוגיה',enrolled:16,employed:16}
  ]},
  employmentRate: 100, // נושק ל-100%
  vocationalCertRate: 100, // נושק ל-100%
  militaryRate: 92, // 92% גיוס, 31% קרבי
  inclusionStudents: 42,
  inclusionPercent: 35,
  inclusionHours: 168,
  inclusionTeachers: 4,
  dropoutData: {
    'ט': {total:20,leavers:0,voluntary:1},
    'י': {total:30,leavers:0,voluntary:0},
    'יא': {total:36,leavers:0,voluntary:2},
    'יב': {total:34,leavers:0,voluntary:2}
  },
  dropoutRate: 1.5, // יעד: לא יעלה על 1.5%
  roleHolders: {
    'רכזת פדגוגית':'אסתי ליליאן',
    'רכזת חניכות':'מורן שמעוני',
    'רכזת חברתית':'לודה לוקשנקו',
    'יועצת':'אילנה לרר',
    'מתל/רכז הכלה ושילוב':'דני שיש',
    'רכז מגמת מערכות הנדסיות':'אבי אוחיון',
    'רכזת לוגיסטיקה':'אירנה גריגורוביץ',
    'רכזת מדיה חזותית':'שמרית אמזלג'
  },
  trackDetails: {
    'מערכות הנדסיות': {
      coordinator: 'אבי אוחיון',
      workshopStatus: 'מדוגמת',
      partners: 'ICL, אדמה-מכתשים, נטפים, סודה-סטרים',
      projects: '150 כלובי סביבה, 1500 משרוקיות חירום תלת-מימד, שיא גינס עולמי עם פארק קרסו למדע',
      studentsTotal: 53
    },
    'ניהול לוגיסטיקה וטכנולוגיה': {
      coordinator: 'אירנה גריגורוביץ',
      workshopStatus: 'חדר מחשבים מצוין',
      partners: 'ICL, אדמה-מכתשים, נטפים, סודה-סטרים',
      projects: 'אולימפיאדת מגמות, האקטונים',
      studentsTotal: 47
    },
    'מדיה חזותית': {
      coordinator: 'שמרית אמזלג',
      workshopStatus: 'חדר מחשבים, נדרשים מחשבי נייח חדשים',
      partners: 'ההסתדרות הלאומית, עיריית באר-שבע, נשות עסקים צעירות, מכללת שנקר',
      projects: 'קורס צילום, תערוכות במוזיאונים, שטר ה-70 עם בנק ישראל, כרזה ליד ושם'
    }
  },
  prides: '3 דברים שאנחנו גאים בהם: | 1. תקן בינלאומי לאיכות ומצוינות בחינוך - התיכון הראשון והיחידי בארץ, ביה"ס מדגים ברמה הארצית לחינוך יוצר | 2. שיא גינס עולמי לדגל הגדול בעולם מחלקי תלת-ממד, נתוני העסקה נושקים ל-100% ב-12 מפעלים מובילים בתעשייה הטכנולוגית | 3. נתוני גיוס 92% (31% קרבי), זכאות לתעודות גמר ומקצוע נושקת ל-100%, נתוני אקלים גבוהים במיוחד 3 שנים',
  leaps: 'קפיצות מדרגה: | 1. העלאת מספר התלמידים הזכאים להסמכה טכנולוגית 2.1 - עלייה של 10% | 2. שמירה על המדדים הגבוהים הקיימים והמשך עשייה חינוכית מיטבית במגוון התחומים',
});

Object.assign(s.summary, {
  studentCount: 175,
  principal: 'מאיר אבן שימול',
  employmentRate: 100,
  vocationalCertRate: 100,
  bagrutRate: null, // no full bagrut data
  supervisor: 'קטרינה ברבשטיין'
});

if (compact[key]) {
  Object.assign(compact[key].committee, s.committee);
  delete compact[key].committee.slides;
  delete compact[key].committee.fullText;
  Object.assign(compact[key].summary, s.summary);
}

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');

console.log('Updated באר שבע:');
console.log('  Students:', s.summary.studentCount, '(136→151→168→175)');
console.log('  Employment: ~100%');
console.log('  Military: 92% (31% combat)');
console.log('  Tracks:', s.committee.tracks.join(', '));
console.log('  Inclusion: 42 students (35%)');
console.log('  Guinness World Record holder!');
