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

// HADAR
const hKey = Object.keys(detailed).find(k => k.includes('הדר'));
update(hKey, {
  committee: {
    principal: 'אלישבע מונסונגו', inspector: 'יששכר חפץ', therapeuticInspector: "שרית תורג'מן",
    networkRep: 'הרב בניהו דביר', supervisorName: 'גדעון זקן',
    studentCount: 195, studentHistory: {"תשפ\"ג":50,"תשפ\"ד":80,"תשפ\"ה":130,"תשפ\"ו":195},
    classCount: 12, teacherCount: 42, adminStaff: 6,
    teachersBA: 38, teachersMA: 8, teachersCertified: 42,
    tracks: ['צילום ועריכת וידאו', 'בניית אתרים', 'אקו חקלאות'],
    populationDesc: 'בנות נושרות מהמגזר החרדי, צרכים ייחודיים: חיבור לקהילה, עבודה עם הורים',
    bagrutData: {"תשפ\"ג":{graduates:12,vocationalCert:12},"תשפ\"ד":{graduates:18,vocationalCert:18},"תשפ\"ה":{graduates:25,vocationalCert:25},"צפי תשפ\"ו":{graduates:25,vocationalCert:25}},
    vocationalCertRate: 100,
    inclusionStudents: 13, inclusionHours: 46, inclusionTeachers: 10,
    roleHolders: {'רכזת פדגוגית':'אסתי מהרשל','רכזת חניכות':'אודל פינטו / רחל אולמן','רכזת חברתית':'אלישבע פריי','יועצות':'רחל שטרנהרץ, אפרת אלקובי, לייקי פטרובר','מתלית/רכזת שילוב':'הודיה נקש'},
    trackDetails: {
      'צילום ועריכת וידאו': {coordinator:'אודל פינטו (חל"ד), פנינה שנקר מ"מ',workshopStatus:'טובה, חסר ציוד',projects:'עסק ותיק צילום שבא מהלב, פודקסטים'},
      'בניית אתרים': {coordinator:'רחלי אולמן',workshopStatus:'מצוין, 16 לקוחות במקביל',projects:'חברה מסודרת לעיצוב/בנייה/קידום'},
      'אקו חקלאות': {coordinator:'לאה לוי',workshopStatus:'טובה מאד',projects:'שיקום גינה קהילתית בשיתוף עיריית ירושלים'}
    },
    prides: '3 דברים שאנחנו גאים בהם: | 1. צוות המורות המסור, בנות שרות נהדרות | 2. התקדמות הבנות מבחינה לימודית, מקצועית, רגשית ותעסוקתית | 3. התקדמות התיכון מבחינה פיזית: מבנה, ציוד',
    leaps: 'קפיצות מדרגה: | 1. מענה טיפולי מדויק ואישי לכל אחת מהבנות - טבלה שיתופית הנהלה/יועצות | 2. מרכז תעסוקה מפותח ומתרחב - התיכון פעיל כל אחה"צ, הבנות עובדות רק בעסקים שלנו | 3. הטמעת תוכנית מנטוריות - לכל קבוצה של 10 בנות מנטורית',
  },
  summary: { studentCount: 195, principal: 'אלישבע מונסונגו', vocationalCertRate: 100, supervisor: 'יששכר חפץ' }
});

// BAT AMI
const bKey = Object.keys(detailed).find(k => k.includes('בת עמי'));
update(bKey, {
  committee: {
    principal: 'קארן סגל', inspector: 'יששכר חפץ', therapeuticInspector: 'מיכל גלזר',
    networkRep: 'עדנה מרום', supervisorName: 'שלמה גץ',
    studentCount: 52, studentHistory: {"תשפ\"ד":21,"תשפ\"ה":37,"תשפ\"ו":52},
    classCount: 4, teacherCount: 21, adminStaff: 3,
    teachersBA: 20,
    tracks: ['עיצוב טקסטיל'],
    populationDesc: 'אוכלוסיה מעורבת של בעלי תשובה, חרדים ודתיים לאומיים. אולפנה לבנות',
    bagrutData: {"תשפ\"ד":{graduates:7},"צפי תשפ\"ו":{graduates:11,vocationalCert:10}},
    inclusionStudents: 12, inclusionHours: 30, inclusionTeachers: 3,
    roleHolders: {'רכזת פדגוגית':'הדס שרון','רכזת חניכות':'אלה מנדיל','רכזת חברתית':'מרים כהן','יועצת':'מוריה שלוש','מתלית/רכזת שילוב':'רעיה יהב'},
    prides: '3 דברים שאנחנו גאים בהם: | 1. הצלחנו לייצר מקום שהוא בית - מקום בטוח ומעצים את תחושת שייכות | 2. מקום שיש בו עבודה פנימית ושיח רגשי לכל בת - גיבוש זהות אישית | 3. למידה רב תחומית - שילוב אומנות ולימודי ליבה לביטוי עולמם הפנימי',
    leaps: 'קפיצות מדרגה: | 1. הטמעת מגמה חדשה עיצוב טקסטיל בשיתוף שנקר - תוכנית תלת שנתית | 2. שיפור הישגים לימודיים - הכשרת צוות ללמידה רב תחומית | 3. ביסוס תוכנית שותפים - בית למלאכות בגליל כעסק רווחי',
  },
  summary: { studentCount: 52, principal: 'קארן סגל', supervisor: 'יששכר חפץ' }
});

fs.writeFileSync('docs/schools-dashboard/schools-data-detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
fs.writeFileSync('docs/schools-dashboard/schools-data.json', JSON.stringify(compact, null, 2), 'utf8');
console.log('\nDone! Hadar + Bat Ami updated.');
