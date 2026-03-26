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
    delete compact[key].committee.slides;
    delete compact[key].committee.fullText;
    Object.assign(compact[key].summary, data.summary);
  }
  console.log('Updated', key, ':', data.summary.studentCount, 'students');
}

// ===== CHOSHEN =====
const cKey = Object.keys(detailed).find(k => k.includes('חושן'));
update(cKey, {
  committee: {
    principal: 'שרי שמבורסקי', inspector: 'גדעון זקן', supervisorName: 'רויטל אמיר',
    therapeuticInspector: "שרית תורג'מן", networkRep: 'גליה רז',
    studentCount: 148, studentHistory: {"תשפ\"ג":153,"תשפ\"ד":145,"תשפ\"ה":145,"תשפ\"ו":148},
    classCount: 11, teacherCount: 38, adminStaff: 2, teachersBA: 35, teachersMA: 25, teachersCertified: 35, teachersOutOfCert: 5,
    tracks: ['אומנות הבישול', 'קוסמטיקה', 'סאונד', 'צילום'],
    populationDesc: 'ירושלים כמקום מפגש בין אוכלוסיות, תיכון ממלכתי, מגוון גיאוגרפי ואופי תלמידים',
    bagrutData: {"תשפ\"ג":{graduates:39,vocationalCert:36,techBagrut:12},"תשפ\"ד":{graduates:33,vocationalCert:28,techBagrut:16},"תשפ\"ה":{graduates:40,vocationalCert:34,techBagrut:20},"צפי תשפ\"ו":{graduates:40,vocationalCert:36,techBagrut:25}},
    employmentData: {tracks:[
      {name:'אומנות הבישול',enrolled:10,employed:8},{name:'קוסמטיקה',enrolled:12,employed:8},
      {name:'סאונד+צילום',enrolled:9,employed:8},{name:'צילום',enrolled:9,employed:8}
    ]},
    employmentRate: 55,
    inclusionStudents: 44, inclusionPercent: 29, inclusionHours: 186.5, inclusionTeachers: 5,
    roleHolders: {'מנהלת':'שרי שמבורסקי','רכזת פדגוגית/סגנית':'חנה פנחס','רכזת חינוכית':'נעה זכריה','רכז חניכות':'אריאנה בוניאל','רכזת חברתית':'ברכי בר לב','יועצים':'ירון בן גיגי, מיכל משיח, שיר אטינגר','מתלית':'רות גרין','רכזת הכלה ושילוב':'עינת שמש'},
    trackDetails: {
      'אומנות הבישול': {coordinator:'אריאנה בוניאל',teachers:3,workshopStatus:'מתוחזקת היטב',partners:'קבוצת מחנה יהודה, שפים מהקהילה, פרויקט כרובית',projects:'פרויקט שקשוקה, מנה ראשונה, מסעדה, כרובית, תערוכת אביב'},
      'צילום': {coordinator:'אריאל אילון',teachers:4,workshopStatus:'בתהליכי שיפוץ',partners:'קשרים עם דמויות מרכזיות בתרבות הירושלמית',projects:'תערוכת אביב'},
      'קוסמטיקה': {coordinator:'יודפת לב',workshopStatus:'מתוחזקת היטב, קבלת קהל בשעות אחה"צ',projects:'העצמה נשית, איתור נפגעות'},
      'סאונד': {coordinator:'יריב ברנשטיין',teachers:4,workshopStatus:'טוב, נדרשת התחדשות מחשבים',partners:'להקות צעירות, חוגים לקידום נוער',projects:'אולפני פיוז, תקלוט מסיבה ללא אלכוהול'}
    },
    prides: '3 דברים שאנחנו גאים בהם: | 1. צוות בית הספר | 2. תלמידי בית הספר | 3. העבודה הקשה של כולם',
    leaps: 'קפיצות מדרגה: | 1. פיתוח יכולת שיחה בתוך הצוות ועם התלמידים - שיחה ערכית חברתית במציאות מקוטבת | 2. עבודה תהליכית איכותית על פרויקטים חברתיים - תערוכת אביב | 3. התמודדות עם סיכוניות וטראומה - מענים רגשיים רחבים, הפיכת התלמידים לשותפים',
  },
  summary: { studentCount: 148, principal: 'שרי שמבורסקי', employmentRate: 55, supervisor: 'רויטל אמיר', vocationalCertRate: 85 }
});

// ===== TAL HERMON =====
const tKey = Object.keys(detailed).find(k => k.includes('טל חרמון'));
update(tKey, {
  committee: {
    principal: 'ישראל היזמי', inspector: 'יששכר חפץ', therapeuticInspector: 'מיכל גלזר',
    supervisorName: 'שלמה גץ', networkRep: 'הרה"ג יחיאל יעיש פרץ',
    studentCount: 224, studentHistory: {"תשפ\"ג":196,"תשפ\"ד":210,"תשפ\"ה":224,"צפי תשפ\"ז":"230-240"},
    classCount: 13, teacherCount: 26, adminStaff: 15,
    teachersBA: 15, teachersMA: 11, teachersCertified: 2,
    tracks: ['חשמל מוסמך', 'מסגרות מבנים (ריתוך)', 'מחשבים (סייבר)', 'אקו-ים'],
    populationDesc: 'אוכלוסייה חרדית, פנימייה ברמת הגולן, נוער חרדי. דמות הבוגר: בחור ירא שמיים, קשור לתורה, תורם לחברה הישראלית',
    inclusionStudents: 15, inclusionHours: 60.5, inclusionTeachers: 2,
    dropoutData: {"תשפ\"ג":{total:196,leavers:30},"תשפ\"ד":{total:210,leavers:30},"תשפ\"ה":{total:224,leavers:34}},
    roleHolders: {'מנהל':'ישראל היזמי','סגן':'ישראל אוחנה','רכזת פדגוגית':'בת אל ששי','רכזת טיפול':'הדר גולדיטש','רכז חברתי':'ליאור חזן'},
    trackDetails: {
      'חשמל מוסמך': {coordinator:'שמואל מיכאל',teachers:4,workshopStatus:'מתכננים להגדיל ולשפץ'},
      'ריתוך ועיצוב בחומרים': {coordinator:'שמואל נוסבאום',teachers:2,workshopStatus:'6 תאי עבודה + 2 עתידיים'},
      'תפעול מערכות תקשוב': {coordinator:'ירון דן',teachers:3,workshopStatus:'מחשבים ושרתים מעולים',projects:'קידום וטיפול בתשתית קופות חולים ברמת הגולן'}
    },
    prides: 'הצלחות מרכזיות: | 1. התקדמות לימודית של תלמידים בעלי לקויות למידה ופיתוח תחושת מסוגלות | 2. הצלחה בתוכנית רגשית של כלבנות טיפולית - פיתוח יכולות אמפתיה | 3. שילוב בין למידה תורנית ללמידה כללית-ערכית',
    leaps: 'קפיצות מדרגה: | 1. שילוב בין למידה תורנית ללמידה כללית-ערכית (תכנית ליבו חפץ) | 2. יצירתיות ולקיחת אחריות אישית - מיזם אישי לכל תלמיד, יום שיא יצירתי תורה ואמנות | 3. הקמת מועדון בוגרים ופיתוח מיומנויות עסקיות',
  },
  summary: { studentCount: 224, principal: 'ישראל היזמי', supervisor: 'יששכר חפץ' }
});

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! Choshen + Tal Hermon updated.');
