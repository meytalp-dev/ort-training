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

// KFAR ZEITIM
const zKey = Object.keys(detailed).find(k => k.includes('כפר זיתים'));
update(zKey, {
  committee: {
    principal: 'יצחק שבתאי', inspector: 'יששכר חפץ', therapeuticInspector: 'ד"ר מיכל גלסר',
    networkRep: 'איתמר פוזן', supervisorName: 'שלמה גץ',
    studentCount: 221, studentHistory: {"תשפ\"ג":176,"תשפ\"ד":187,"תשפ\"ה":218,"תשפ\"ו":221},
    classCount: 13, teacherCount: 29, adminStaff: 8,
    teachersBA: 14, teachersMA: 5, teachersCertified: 10, teachersOutOfCert: 2,
    tracks: ['חשמל מוסמך', 'נגרות / מפעיל CNC בעץ', 'בנייה אקולוגית'],
    populationDesc: 'נוער חרדי/דתי, פנימייה, מענה ייחודי לזרמים שונים באוכלוסיה החרדית-דתית',
    bagrutData: {"תשפ\"ג":{graduates:16,vocationalCert:14},"תשפ\"ד":{graduates:40,vocationalCert:27},"תשפ\"ה":{graduates:38,vocationalCert:30},"צפי תשפ\"ו":{graduates:35,vocationalCert:35}},
    inclusionStudents: 36, inclusionHours: 141.7, inclusionTeachers: 4,
    roleHolders: {'רכז פדגוגי':'חנניה שמש הלפרין','רכז חניכות':'אליהו בליניק','רכז חברתי':'יעקב כהן','יועץ/מתל':'ישעיה דדון','רכזת הכלה ושילוב':'שרה דויטש'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. צמיחת ומגוון התלמידים (176→187→218→221) | 2. פתיחת מגמה חדשה בנייה אקולוגית | 3. שילוב של למעלה מ-50% תלמידים בפעילויות משק/חווה/חקלאות של הישיבה לחיזוק השייכות',
    leaps: 'קפיצות מדרגה: | 1. העמקת הפדגוגיה הדואלית (עיוני + מעשי) - כל שכבת י תלמד שיעור מעשי בשבוע | 2. חיזוק תחושת שייכות - 50% תלמידים בתפקיד קבוע | 3. קידום מוכנות לתעסוקה - סדנת הכנה לראיון עבודה ותיק עבודות דיגיטלי',
    vocationalCertRate: 83.6, // ממוצע 3 שנים
  },
  summary: { studentCount: 221, principal: 'יצחק שבתאי', vocationalCertRate: 84, supervisor: 'יששכר חפץ' }
});

// CHANOCH LANAR
const cKey = Object.keys(detailed).find(k => k.includes('חנוך לנער'));
update(cKey, {
  committee: {
    principal: 'הרב שלמה אזרף', inspector: 'יששכר חפץ', therapeuticInspector: 'ד"ר מיכל גלסר',
    networkRep: 'הר\' שניאור ליפסקר', supervisorName: 'שלמה גץ',
    studentCount: 179, studentHistory: {"תשפ\"ג":156,"תשפ\"ד":156,"תשפ\"ה":169,"תשפ\"ו":179},
    classCount: 10, teacherCount: 23, adminStaff: 5,
    teachersBA: 12, teachersMA: 9, teachersCertified: 2,
    tracks: ['מחשבים, רשתות תקשורת', 'חשמלאי מוסמך'],
    populationDesc: 'תלמידים מבתים חרדיים, מניעת נשירה מעולם הישיבות, פנימייה בצפת. מקום בטוח שמצמיח חסידים שמחים',
    bagrutData: {"תשפ\"ג":{graduates:30,vocationalCert:20,techBagrut:15},"תשפ\"ד":{graduates:30,vocationalCert:20,techBagrut:15,fullBagrut:2},"תשפ\"ה":{graduates:40,vocationalCert:35,techBagrut:25,fullBagrut:5},"צפי תשפ\"ו":{graduates:45,vocationalCert:40,techBagrut:40,fullBagrut:8}},
    inclusionStudents: 16, inclusionPercent: 13, inclusionHours: 73.8, inclusionTeachers: 1,
    roleHolders: {'רכז פדגוגי':'הרב דורון','רכז חניכות':'שלמה הלר','רכז חברתי':'יוסף פוגל','יועצים':'הרב מאיר דוד, הרב יוסי כהן','מתלית/רכז שילוב':'ידעיה לוק'},
    trackDetails: {
      'מחשבים': {coordinator:'אריה קוסקס',teachers:5,workshopStatus:'3 חדרי מחשבים, מעבדת מח"ט פעילה',partners:'C.P CAL',projects:'מעבדת מח"ט, עמדות IT תמיכה מרחוק'},
      'חשמל': {coordinator:'שמואל מיכאל',workshopStatus:'2 סדנאות חשמל + מעבדת חשמל + אנרגיה סולארית',projects:'פרויקט בגרות 5 יח"ל - חניון עם פיקוד ובקרים'}
    },
    prides: '4 דברים שאנחנו גאים בהם: | 1. לימודים: דחיפה להצטיינות כלל התלמידים, פעם שלישית מספר 1 בישראל | 2. פרויקטים קהילתיים - ערב שבועי, שוק פורים, יום סיור בצפת | 3. הדרכות מקצועיות: כלל הצוות מודרך פעם בשבוע | 4. פנימיה איכותית - עולם בפני עצמו, צוות מעולה',
    leaps: 'קפיצות מדרגה: | 1. שימור תלמידים במוסד ומניעת נשירה - תוכנית יכולות | 2. הוספת תחום הנדסאי אלקטרוניקה | 3. שינוי ההוראה במגמת תקשוב - הוראה מרחוק, מורים מעולם ההייטק, הרחבה לסייבר ו-AI',
  },
  summary: { studentCount: 179, principal: 'הרב שלמה אזרף', supervisor: 'יששכר חפץ' }
});

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! Kfar Zeitim + Chanoch LaNaar updated.');
