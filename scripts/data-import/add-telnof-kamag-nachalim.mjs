import fs from 'fs';
const detailed = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data-detailed.json', 'utf8'));
const compact = JSON.parse(fs.readFileSync('docs/schools-dashboard/schools-data.json', 'utf8'));

function update(key, data) {
  const s = detailed[key];
  if (!s) { console.log('NOT FOUND:', key); return; }
  Object.assign(s.committee, data.committee);
  Object.assign(s.summary, data.summary);
  if (compact[key]) {
    Object.assign(compact[key].committee, data.committee);
    delete compact[key].committee.slides; delete compact[key].committee.fullText;
    Object.assign(compact[key].summary, data.summary);
  }
  console.log('Updated', key, ':', data.summary.studentCount, 'students');
}

// TEL NOF
const tnKey = Object.keys(detailed).find(k => k.includes('תל נוף'));
update(tnKey, {
  committee: {
    principal: 'אבי בז\'ה', inspector: 'יששכר חפץ', therapeuticInspector: 'שרית יפה תורגמן',
    networkRep: 'ענת דובר', supervisorName: 'סיגל דאי',
    studentCount: 372, studentHistory: {"תשפ\"ג":368,"תשפ\"ד":383,"תשפ\"ה":391,"תשפ\"ו":372},
    classCount: 18, teacherCount: 40, adminStaff: 11,
    teachersBA: 13, teachersMA: 18, teachersCertified: 40, teachersOutOfCert: 0,
    tracks: ['מבנאות', 'בדק כלי טיס', 'מכטרוניקה', 'חשמלאי מוסמך'],
    populationDesc: 'תלמידים שלא מצאו דרכם במשה"ח + מחפשי חינוך טכנולוגי מקצועי. שת"פ עם חיל האוויר',
    bagrutData: {"תשפ\"ג":{graduates:75,vocationalCert:61,techBagrut:24},"תשפ\"ד":{graduates:87,vocationalCert:80,techBagrut:34},"תשפ\"ה":{graduates:105,vocationalCert:98,techBagrut:38},"צפי תשפ\"ו":{graduates:105,vocationalCert:null,techBagrut:42}},
    employmentRate: 100, vocationalCertRate: 93, militaryRate: 100,
    inclusionStudents: 29, inclusionPercent: 7.8, inclusionHours: 93, inclusionTeachers: 9,
    roleHolders: {'מנהל פדגוגי':'ד"ר יוסי דבאח','מנהל טכני':'צביקה ישראלי','רכז חניכות':'רס"ב אבי רזיאל','רכזת חברתית':'אורלי ניר','יועצות':'מירב אבירם, אסנת לאל, אורית שרוני','מתלית':'הילה דלל','רכזת שילוב':'נורית בן שושה'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. שיתוף פעולה עם חיל האוויר - בוגרים משרתים כנגדים וקצינים בכירים | 2. התפתחות התלמיד מיום קליטתו ועד השתלבותו במסלול הנדסאים/הנדסה | 3. תשתיות ונראות ביה"ס + מעורבות בקהילה בבוגרים',
    leaps: 'קפיצות מדרגה: | 1. הכנסת בינה מלאכותית לתהליכי הוראה בכלל המגמות - לפחות 3 שיעורים בשנה, 50% מהסגל | 2. ריבוי תעודות - לפחות 4 קורסים | 3. יחסי מורים-תלמידים - שיפור מדד אח"מ',
  },
  summary: { studentCount: 372, principal: 'אבי בז\'ה', employmentRate: 100, vocationalCertRate: 93, supervisor: 'יששכר חפץ' }
});

// KMG
const kKey = Object.keys(detailed).find(k => k.includes('קמג') || k.includes('קמ"ג'));
update(kKey, {
  committee: {
    principal: 'יורם בן שטרית', inspector: 'יששכר חפץ', therapeuticInspector: 'שרית תורג\'מן',
    networkRep: 'בנימין זיזו', supervisorName: 'שרונה בלוך',
    studentCount: 76, studentHistory: {"תשפ\"ו":76},
    classCount: 4, teacherCount: 13, adminStaff: 3,
    teachersBA: 3, teachersMA: 10, teachersCertified: 2,
    tracks: ['אוטוטרוניקה', 'מסגרות מבנים (ריתוך)', 'עיבוד שבבי CNC', 'חשמל (חדשה)'],
    populationDesc: 'בית ספר במפעל הקריה למחקר גרעיני, מודל ייחודי של חינוך טכנולוגי משולב עבודה במפעל ביטחוני',
    bagrutData: {"תשפ\"ג":{graduates:19,vocationalCert:8},"תשפ\"ד":{graduates:13,vocationalCert:13},"תשפ\"ה":{graduates:18,vocationalCert:18},"צפי תשפ\"ו":{graduates:16,vocationalCert:16}},
    vocationalCertRate: 100, employmentRate: 94,
    inclusionStudents: 20, inclusionPercent: 26, inclusionHours: 66, inclusionTeachers: 2,
    prides: 'הגאווה שלנו: | 1. שיפור דרמטי במדדי מצוקה ואובדנות | 2. 100% הסמכה מקצועית בשלוש שנים | 3. 94% תעסוקה בשכבת יב, אקלים תומך מכיל וחם',
    leaps: 'יעדים: | 1. הגדלת מספר תלמידים ב-20% | 2. העלאת נגישה לבגרות ב-25% | 3. הגדלת מספר הבנות, גיוון האוכלוסייה',
    roleHolders: {'מנהל':'יורם בן שטרית','רכז פדגוגי':'קובי ויצמן','רכז חניכות':'סהר בוכריס','רכז חברתי':'נועם טויזר','יועצת':'נופיה לוי','מתלית':'נעמה פרידמן','רכז הכלה ושילוב':'נועם טויזר'},
  },
  summary: { studentCount: 76, principal: 'יורם בן שטרית', employmentRate: 94, vocationalCertRate: 100, supervisor: 'יששכר חפץ' }
});

// NACHALIM
const nKey = Object.keys(detailed).find(k => k.includes('נחלים'));
update(nKey, {
  committee: {
    principal: 'הרב אליהו טובול', inspector: 'יששכר חפץ', therapeuticInspector: 'שרית יפה תורג\'מן',
    networkRep: 'אודי נתיב', supervisorName: 'סיגלית דאי',
    studentCount: 240, studentHistory: {"תשפ\"ג":166,"תשפ\"ד":221,"תשפ\"ה":202,"תשפ\"ו":240},
    classCount: 15, teacherCount: 50, adminStaff: 11,
    teachersBA: 16, teachersMA: 15, teachersCertified: 15, teachersOutOfCert: 6,
    tracks: ['אוטוטרוניקה', 'חשמל ומיזוג אוויר', 'שיווק דיגיטלי'],
    populationDesc: 'ציבור דתי לאומי, תלמידים עם קשיים לימודיים רגשיים וחברתיים, פנימייה',
    bagrutData: {"תשפ\"ג":{graduates:30,vocationalCert:17,techBagrut:17,fullBagrut:14},"תשפ\"ד":{graduates:33,vocationalCert:19,techBagrut:19,fullBagrut:2},"תשפ\"ה":{graduates:37,vocationalCert:23,techBagrut:23,fullBagrut:24},"צפי תשפ\"ו":{graduates:38,vocationalCert:34,techBagrut:28,fullBagrut:28}},
    employmentData: {tracks:[
      {name:'אוטוטרוניקה',enrolled:12,employed:7},{name:'חשמל',enrolled:12,employed:7},{name:'שיווק דיגיטלי',enrolled:12,employed:5}
    ]},
    employmentRate: 53,
    inclusionStudents: 67, inclusionHours: 222.1, inclusionTeachers: 3,
    roleHolders: {'רכז פדגוגי':'נהוראי דרין','רכז חניכות':'עודד משה','רכז חברתי':'טל מילוא','יועצים':'יהודה הכהן, דניאל בנגאיב','מתלית':'מירי קובלבסקי','רכזת שילוב':'צפורה שיינטופ'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. צוות מגויס ויציב, משתף פעולה ומשפחתי | 2. עליית כמות תלמידים משנה לשנה (166→221→202→240) | 3. מגמות חדשות והתחדשות כל שנה + עמוד שדרה חברתי 4 שנתי',
    leaps: 'קפיצות מדרגה: | 1. שיפור האקלים בית ספרי - שאלוני אקלים ומצוקה | 2. מנטורינג להצלחה - מבוגר מלווה לכל תלמיד | 3. דיוק קבלת תלמידים למוסד',
  },
  summary: { studentCount: 240, principal: 'הרב אליהו טובול', employmentRate: 53, supervisor: 'יששכר חפץ' }
});

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! 3 schools updated.');
