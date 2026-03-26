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

// BEIT DAVID
const bdKey = Object.keys(detailed).find(k => k.includes('בית דוד'));
update(bdKey, {
  committee: {
    principal: 'הרב מנחם בן מעש', inspector: 'יששכר חפץ', therapeuticInspector: "שרית תורג'מן-יפה",
    networkRep: 'בנימין זיזו', supervisorName: 'שרונה בלוך',
    studentCount: 44, studentHistory: {"תשפ\"ה":28,"תשפ\"ו":44},
    classCount: 3, teacherCount: 8, adminStaff: 2, teachersMA: 4,
    tracks: ['בניית אתרים', 'עיצוב תעשייתי'],
    populationDesc: 'ישיבה חב"דית, בני נוער חב"דיים. שילוב תורה וחסידות עם הכשרה מקצועית. לימודים עד 18:00',
    inclusionStudents: 8, inclusionPercent: 18, inclusionHours: 24.1,
    roleHolders: {'מנהל':'הרב מנחם בן מעש','רכז פדגוגי':'מוטי פרבר','רכז חברתי':'שניאור צנעני','יועץ/מתל/רכז שילוב':'משה שוורץ'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. מיצוב הישיבה בשדה החב"די - כתובת משמעותית וחדשנית | 2. תהליכי עומק בפן הטיפולי רגשי - תלמיד עם חרדה חברתית שנפתח ונשא דברים בפני כל ההורים | 3. למידה פרטנית מיטבית - חליפה מדויקת לכל תמים',
    leaps: 'קפיצות מדרגה: | 1. הרחבת חשיפה ודיוק בגיוס - עלייה 30% בפניות, 75 תלמידים בתשפ"ז | 2. פדגוגיה מותאמת לרמת התלמידים - 3 רמות למידה בכל מקצוע | 3. פיתוח מיומנויות למידה והכנה לעולם העבודה',
  },
  summary: { studentCount: 44, principal: 'הרב מנחם בן מעש', supervisor: 'יששכר חפץ' }
});

// OR MENACHEM
const omKey = Object.keys(detailed).find(k => k.includes('אור מנחם'));
if (!omKey) {
  const omKey2 = Object.keys(detailed).find(k => k.includes('חבד אור מנחם'));
  update(omKey2, {
    committee: {
      principal: 'הרב בנימין ועקנין', inspector: 'יששכר חפץ', therapeuticInspector: "שרית יפה",
      networkRep: 'בני זיזו', supervisorName: 'שרון בלוך',
      studentCount: 148, studentHistory: {"תשפ\"ג":117,"תשפ\"ד":125,"תשפ\"ה":144,"תשפ\"ו":148},
      classCount: 8, teacherCount: 25, adminStaff: 2, teachersBA: 25, teachersMA: 15, teachersCertified: 25, teachersOutOfCert: 2,
      tracks: ['CNC', 'חשמל'],
      populationDesc: 'ישיבה חרדית, שילוב תורה וחסידות עם הכשרה מקצועית. בוגר: בן תורה ירא שמים עם תעודת זהות ערכית ומקצועית',
      bagrutData: {"תשפ\"ג":{graduates:22,vocationalCert:15,techBagrut:8,fullBagrut:9},"תשפ\"ד":{graduates:20,vocationalCert:11,techBagrut:7,fullBagrut:9},"תשפ\"ה":{graduates:30,vocationalCert:19,techBagrut:13,fullBagrut:14},"צפי תשפ\"ו":{graduates:31,vocationalCert:25,techBagrut:13,fullBagrut:15}},
      inclusionStudents: 15, inclusionPercent: 10, inclusionHours: 67.1, inclusionTeachers: 17,
      roleHolders: {'מנהל':'הרב בנימין ועקנין','ראש ישיבה/רכז פדגוגי':'הרב גיל אוריאן','סגן':'אריה פרוס','יועץ':'יוסי אנקונינה','יועץ':'איתמר שיינר','רכז חברתי':'פרץ חן'},
      prides: 'הגאווה שלנו: | 1. מודלי תעסוקה - התלמידים מרגישים שייכות מהעבודה בפרויקט שותפים | 2. צוות חדור תחושת שליחות | 3. התוועדויות ליל שישי, אווירה של משפחה',
      leaps: 'קפיצות מדרגה: | 1. תעסוקה כשפה בישיבה - שיבוץ כלל תלמידי יא במודלים + תלמידי י בקיץ | 2. בניית תכניות דיפרנציאלית מותאמות כבר מכיתה ט | 3. תכנית התערבות למניעת נשירה סמויה וגלויה',
    },
    summary: { studentCount: 148, principal: 'הרב בנימין ועקנין', supervisor: 'יששכר חפץ' }
  });
} else {
  update(omKey, {
    committee: { principal: 'הרב בנימין ועקנין', studentCount: 148 },
    summary: { studentCount: 148, principal: 'הרב בנימין ועקנין', supervisor: 'יששכר חפץ' }
  });
}

// OR HAATID GAN YAVNE
const ogKey = Object.keys(detailed).find(k => k.includes('אור העתיד'));
update(ogKey, {
  committee: {
    principal: 'מאיר ענתבי', inspector: 'יששכר חפץ', therapeuticInspector: 'שרית יפה',
    networkRep: 'בני זיזו', supervisorName: 'גדעון זקן',
    studentCount: 155, studentHistory: {"תשפ\"ג":130,"תשפ\"ד":136,"תשפ\"ה":150,"תשפ\"ו":155},
    classCount: 8, teacherCount: 23, adminStaff: 3, teachersBA: 12, teachersMA: 9, teachersCertified: 2,
    tracks: ['חשמלאי מוסמך', 'תפעול מערכות תקשוב'],
    populationDesc: 'נוער מבתים חרדים להשלמת לימודי קודש וחול. נוער שמשנה מסגרת לימודית וקהילתית',
    bagrutData: {"תשפ\"ג":{graduates:34,vocationalCert:28,techBagrut:7,fullBagrut:17},"תשפ\"ד":{graduates:30,vocationalCert:25,techBagrut:7,fullBagrut:18},"תשפ\"ה":{graduates:34,vocationalCert:32,techBagrut:6,fullBagrut:22},"צפי תשפ\"ו":{graduates:35,vocationalCert:33,techBagrut:6,fullBagrut:22}},
    inclusionStudents: 10, inclusionHours: 46.7, inclusionTeachers: 10,
    roleHolders: {'רכז פדגוגי/חניכות':'עדיאל שרעבי','רכז חברתי':'יעקב תורגמן','יועצת':'סימה דהן','מתלית/רכז שילוב':'מאיר זוהר'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. צוות שוקד להבנות תמונת עתיד יצרני, ערכי ורוחני כולל מסלול הנדסאים בישיבת הסדר | 2. ביה"ס מהווה מרחב גדילה וצמיחה לצוות ולתלמידים | 3. מרחב מוגן ובטוח עם שומרי סף אקטיביים',
    leaps: 'קפיצות מדרגה: | 1. טיפוח כישורים פרו-חברתיים - עלייה בתחושת שייכות וביטחון | 2. פיתוח אקלים חברתי רגשי ושיפור מוגנות | 3. בניית זהות מקצועית-תעסוקתית - עלייה בהישגים ובלימודי המשך',
    militaryRate: 94,
  },
  summary: { studentCount: 155, principal: 'מאיר ענתבי', supervisor: 'יששכר חפץ' }
});

// GALIL YERKA BOYS
const gyKey = Object.keys(detailed).find(k => k.includes('ירכא בנים'));
update(gyKey, {
  committee: {
    principal: 'אחמד חמזה', inspector: 'יסמין אמון', therapeuticInspector: 'אסתי רייפר',
    networkRep: 'איתי יבין', supervisorName: 'שלמה גץ',
    studentCount: 250, studentHistory: {"תשפ\"ג":290,"תשפ\"ד":289,"תשפ\"ה":278,"תשפ\"ו":250},
    classCount: 11, teacherCount: 48, adminStaff: 6, teachersBA: 23, teachersMA: 21,
    tracks: ['אוטוטרוניקה', 'תפעול מערכות תקשוב וסולאר', 'מערכות תיכון וייצור CNC', 'קונדיטאות ואפייה', 'מבנאות אלומיניום', 'עיצוב מדיה וקריאייטיב'],
    populationDesc: 'תלמידים מ-28 יישובים, 97% בנים 3% בנות, הטרוגנית: מוסלמים, דרוזים, נוצרים. חלק נשרו מבתי ספר ממלכתיים',
    bagrutData: {"תשפ\"ג":{graduates:64,vocationalCert:42,techBagrut:31,fullBagrut:3},"תשפ\"ד":{graduates:84,vocationalCert:60,techBagrut:39,fullBagrut:2},"תשפ\"ה":{graduates:70,vocationalCert:54,techBagrut:40,fullBagrut:7},"צפי תשפ\"ו":{graduates:69,vocationalCert:59,techBagrut:40,fullBagrut:25}},
    inclusionStudents: 12, inclusionHours: 49.5, inclusionTeachers: 4,
    roleHolders: {'מנהל':'אחמד חמזה','רכז פדגוגי':'סלימאן שחאדה','רכזי חניכות':'סוהיל יאסין, אמאני רישה, מרלין אבו טריף','יועצים':'אשרף סנונו, רנין רבאח, ניהאל חוסין','מתלית/רכזת שילוב':'נורא טאהא','רכז חינוך חברתי':'סוהיל יאסין'},
    prides: '5 דברים שאנחנו גאים בהם: | 1. מקום ראשון ושני בתחרות האלקטיוד העולמית (אוטוטרוניקה) | 2. מקום ראשון ב-2 מגמות באולימפיאדות רשת עתיד | 3. שיתוף פעולה עם משטרת ישראל - טורניר כדורגל | 4. דיווחי מעסיקים על רמת אחריות ומקצועיות גבוהה | 5. 40-45% ממשיכים להנדסאים י"ג-י"ד',
    leaps: 'קפיצות מדרגה: | 1. הוראה מעשית וחדשנית - תלמיד יוצר, פרואקטיבי, מעורב בקהילה | 2. חיזוק תחושת שייכות ואחריות - ירידה 25% באירועי משמעת | 3. פיתוח והעצמת הצוות החינוכי - מורים מובילים שינוי',
    militaryRate: 7,
  },
  summary: { studentCount: 250, principal: 'אחמד חמזה', supervisor: 'יסמין אמון' }
});

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! All 4 final schools updated. ALL 22 PDFs COMPLETE!');
