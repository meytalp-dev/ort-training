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
  console.log(`Updated ${key}: ${data.summary.studentCount} students, ${data.committee.tracks?.join(', ')}`);
}

// ===== MASADA =====
const mKey = Object.keys(detailed).find(k => k.includes('מסעדה'));
update(mKey, {
  committee: {
    principal: 'היבא זהוה', inspector: 'שלמה גץ', therapeuticInspector: 'אסתי רייפר',
    supervisorName: 'יסמין אמון', networkRep: 'איתי יבין',
    studentCount: 95, studentHistory: {"תשפ\"ג":17,"תשפ\"ד":50,"תשפ\"ה":76,"תשפ\"ו":95},
    classCount: 6, teacherCount: 15, adminStaff: 2, teachersBA: 7, teachersMA: 6, teachersCertified: 2, teachersOutOfCert: 0,
    tracks: ['חשמלאי מוסמך', 'שיווק דיגיטלי ובניית אתרים', 'טיפוח חן'],
    populationDesc: 'אוכלוסייה דרוזית, רובה ממשפחות המוכרות לשירותי הרווחה, מצב סוציו-אקונומי נמוך',
    bagrutData: {"תשפ\"ג":{graduates:17,vocationalCert:9},"תשפ\"ד":{graduates:0},"תשפ\"ה":{graduates:0},"צפי תשפ\"ו":{graduates:30,vocationalCert:30,techBagrut:30}},
    employmentData: {tracks:[{name:'חשמלאי מוסמך',enrolled:17,employed:12},{name:'שיווק דיגיטלי',enrolled:16,employed:16},{name:'טיפוח חן',enrolled:15,employed:9}]},
    employmentRate: Math.round((12+16+9)/(17+16+15)*100),
    inclusionStudents: 27, inclusionHours: 90, inclusionTeachers: 3,
    prides: '3 דברים שאנחנו גאים בהם: | 1. עלייה משמעותית באחוז התלמידים המועסקים | 2. צוות מתפתח מקצועית, יוזם ותורם | 3. פיתוח פרויקט חדשני עם מכון שמיר לפתיחת מגמת אדם וסביבה',
    leaps: 'קפיצות מדרגה: | 1. 100% תלמידים יקבלו תעודת גמר + מקצוע | 2. פיתוח מרחב למידה חדשני - מייקר ספייס, חממה חכמה | 3. מיצוב בית הספר בקהילה כחלק מהחינוך היוצר',
    roleHolders: {'רכז פדגוגי':'וליד עבד אלולי','רכז חניכות':'יאסמין זהוה','רכז חברתי':'אמיר מונדר','מתלית/רכז הכלה ושילוב':'עדאלה אל שאער'},
  },
  summary: { studentCount: 95, principal: 'היבא זהוה', employmentRate: Math.round((12+16+9)/(17+16+15)*100), supervisor: 'יסמין אמון' }
});

// ===== UMM AL-FAHM GIRLS =====
const uKey = Object.keys(detailed).find(k => k.includes('אום אל פחם בנות'));
update(uKey, {
  committee: {
    principal: 'נורה מחאגנה', inspector: 'שלמה גץ', supervisorName: 'ליאת צבר', therapeuticInspector: 'אסתי ריפיר',
    networkRep: 'מחמוד עבד אלחמיד + רוני ברנשטיין',
    studentCount: 163, studentHistory: {"תשפ\"ג":123,"תשפ\"ד":100,"תשפ\"ה":115,"תשפ\"ו":163},
    classCount: 9, teacherCount: 30, adminStaff: 3, teachersBA: 14, teachersMA: 11, teachersCertified: 5, teachersOutOfCert: 0,
    tracks: ['טיפוח חן (עיצוב שיער)', 'מחנכות שנות הינקות', 'שיווק דיגיטלי', 'קונדיטאות'],
    populationDesc: 'תלמידות במצב סוציואקונומי נמוך, יותר מ-50% לקויות למידה, קשיים רגשיים',
    bagrutData: {"תשפ\"ג":{graduates:41,vocationalCert:39,fullBagrut:1},"תשפ\"ד":{graduates:25,vocationalCert:20,fullBagrut:2},"תשפ\"ה":{graduates:16,vocationalCert:15,fullBagrut:3},"צפי תשפ\"ו":{graduates:28,vocationalCert:33}},
    employmentData: {tracks:[{name:'עיצוב שיער',enrolled:20,employed:19},{name:'מחנכות שנות הינקות',enrolled:10,employed:9},{name:'שיווק דיגיטלי',enrolled:8,employed:8},{name:'קונדיטאות',enrolled:16,employed:10}]},
    employmentRate: Math.round((19+9+8+10)/(20+10+8+16)*100),
    dropoutData: {'ט':{total:24,leavers:4},'י':{total:44,voluntary:4},'יא':{total:55,leavers:2,voluntary:5},'יב':{total:33,leavers:1}},
    roleHolders: {'רכזת פדגוגית':'סוהא מרזוק','רכזת חניכות':'סונדס מחאגנה','רכזת חברתית':'פאדיה מחאמיד','יועצת':'יאסמין מחאמיד','רכזת בגרות':'עורובה עתאמנה'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. שינוי בתדמית בית הספר בקהילה וגיבוש צוות | 2. עבודה פדגוגית חברתית טיפולית מערכתית 360 | 3. עליה באחוזי תלמידות זכאיות לתעודת גמר ובמספר הנרשמות',
    leaps: 'קפיצות מדרגה: | 1. 85% מהצוות יתכננו יחידת לימוד מבוססת פרויקטים PBL | 2. שיפור בביטחון בדיבור עברית מדוברת | 3. חיזוק שיתופי פעולה צוותיים ומעורבות הורים וקהילה',
    vocationalCertRate: 95, // from tashpag ratio
  },
  summary: { studentCount: 163, principal: 'נורה מחאגנה', employmentRate: Math.round((19+9+8+10)/(20+10+8+16)*100), supervisor: 'ליאת צבר', vocationalCertRate: 95 }
});

// ===== JULIS GIRLS =====
const jKey = Object.keys(detailed).find(k => k.includes('גוליס') || k.includes("ג'וליס"));
update(jKey || 'עתיד גוליס בנות', {
  committee: {
    principal: 'שאדיה נבואני', inspector: 'שלמה גץ', supervisorName: 'יאסמין אמון', therapeuticInspector: 'אסתי רייפר-המרמן',
    networkRep: 'איתי יבין',
    studentCount: 154, studentHistory: {"תשפ\"ג":148,"תשפ\"ד":108,"תשפ\"ה":149,"תשפ\"ו":154},
    classCount: 11, teacherCount: 29, adminStaff: 4, teachersBA: 8, teachersMA: 17, teachersCertified: 4, teachersOutOfCert: 0,
    tracks: ['עיצוב שיער ואיפור אומנותי', 'שיווק דיגיטלי', 'מחנכות שנות ינקות', 'תפירת אופנה וסטיילינג'],
    populationDesc: 'בית ספר רב תרבותי - דרוזיות, מוסלמיות ונוצריות. תלמידות עם קשיים לימודיים, רגשיים ואתגרים חברתיים',
    bagrutData: {"תשפ\"ג":{graduates:38,vocationalCert:31},"תשפ\"ד":{graduates:33,vocationalCert:32,fullBagrut:3},"תשפ\"ה":{graduates:28,vocationalCert:27,fullBagrut:2},"צפי תשפ\"ו":{graduates:19,vocationalCert:19,fullBagrut:4}},
    employmentData: {tracks:[
      {name:'עיצוב שיער ואיפור',enrolled:12,employed:12},
      {name:'שיווק דיגיטלי',enrolled:0,employed:0},
      {name:'מחנכות שנות ינקות',enrolled:5,employed:5},
      {name:'תפירה וסטיילינג',enrolled:5,employed:3}
    ]},
    employmentRate: Math.round((12+0+5+3)/(12+5+5)*100),
    roleHolders: {
      'מנהלת':'שאדיה נבואני','רכזת פדגוגית/מתלית':'מונה עאמר',
      'רכזת שיווק/משמעת':'כפאח קיס','יועצת':'פירוז דאוד',
      'רכזת חברתית/תעסוקה':'בהיה מולא','רכזת מגמת עיצוב שיער':'כמיליס סכס',
      'רכזת שיווק דיגיטלי':'מנאל דבס','רכזת תפירה':'נעמה עאסלה','רכזת מחנכות שנות ינקות':'נאהד שעבאן'
    },
    inclusionStudents: null, inclusionHours: 90.3, inclusionTeachers: 3,
    prides: '3 דברים שאנחנו גאים בהם: | 1. מרחב חינוכי מעצים ומוביל - סביבה ערכית ומכילה המעודדת מנהיגות נשית, שותפות ואחריות | 2. למידה מבוססת פרויקטים (PBL) בשילוב עם אומנות - הוראה איכותית עם יחס אישי, מעטפת תומכת ולמידה משמעותית | 3. התנסויות תעסוקתיות משמעותיות - חיבור לעולם העבודה ולקהילה',
    leaps: 'קפיצות מדרגה: | 1. עלייה באחוז הזכאויות לבגרות/תעודת מקצוע + הרחבת PBL למקצועות ליבה | 2. העמקת מיזם אומנות פורחת כמרחב לביטוי אישי, חוסן רגשי ומנהיגות | 3. הרחבת התנסויות תעסוקתיות וקהילתיות - כל תלמידה בפעילות משמעותית',
  },
  summary: { studentCount: 154, principal: 'שאדיה נבואני', employmentRate: Math.round((12+5+3)/(12+5+5)*100), supervisor: 'יאסמין אמון' }
});

// Save
fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! All 3 schools updated.');
