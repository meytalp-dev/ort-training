/* ============================================================
   פלטפורמת רציפות ולמידה דיפרנציאלית — מקור אמת למשימות
   tasks-data.js  ·  תואם אפיון 3.0 (שירותים משותפים + מצבים + Feature Flags)
   ------------------------------------------------------------
   מזין את לוחות הניהול:
     worlds-hub.html  — סקירת התצוגות + התקדמות
     world-board.html — לוח משימות לכל תצוגה (?world=<id>)
   שינוי מ-2.0: "עולם" = תצוגה/פרסונה מעל שירותים משותפים, לא מערכת עצמאית.
   הסקופ הנבנה עכשיו = גל A (חירום עצמאי, "בטוח לביקורת"). השאר נדחה במפורש.
   ============================================================ */

/* ---------- התצוגות (פרסונות) + שכבת התשתית ---------- */
window.WORLDS = [
  { id: 0, num: '∞', key: 'infra',      name: 'תשתית ושירותים משותפים', user: 'מערכת · אבטחה', color: '#64748b', goal: 'שירותים משותפים, מצבי מערכת, Feature Flags, הרשאות ומינימיזציה — הבסיס לכל התצוגות.' },
  { id: 1, num: '1', key: 'student',    name: 'תלמיד',          user: 'תלמיד',                   color: '#0ea5e9', goal: 'ללמוד עצמאית מהבית — פשוט, רציף, מותאם. מסך נקי, פעולה אחת, בלי תיוג רמה.' },
  { id: 2, num: '2', key: 'teacher',    name: 'מורה + מחנך',     user: 'מורה מקצועי / מחנך',     color: '#14b8a6', goal: 'לנהל הוראה מרחוק, לעקוב אחרי תלמידים, לשמור קשר.' },
  { id: 3, num: '3', key: 'principal',  name: 'מנהל בית הספר',   user: 'מנהל / סגן / רכז',       color: '#22c55e', goal: 'תמונת מצב של הרציפות + מתג מצב המערכת + יידוע הורים.' },
  { id: 4, num: '4', key: 'inspector',  name: 'מפקח מקצועי',     user: 'מפקח תחום דעת',          color: '#a855f7', goal: 'להוביל הוראה בתחום הדעת ולאשר תוכן. (דחוי — אחרי גל A)' },
  { id: 5, num: '5', key: 'national',   name: 'פיקוח ארצי',      user: 'מפקחת ארצית / הנהלה',    color: '#6366f1', goal: 'תמונה ארצית — מצרפית בלבד, נאכף בנתונים. (רובו דחוי)' },
  { id: 6, num: '6', key: 'library',    name: 'ספריית התוכן',    user: 'מורים / מפקחים',         color: '#f59e0b', goal: 'מאגר חומרי הוראה. בגל A — ספרייה בסיסית בלבד.' },
  { id: 7, num: '7', key: 'enrichment', name: 'קורסי העשרה',     user: 'תלמידים / מורים',        color: '#ec4899', goal: 'הרחבת אופקים על אותו מנוע יחידות. בגל A — קורס אחד.' },
  { id: 8, num: '8', key: 'ai',         name: 'שירות AI',        user: 'צד מורה בלבד (ב-MVP)',   color: '#8b5cf6', goal: 'שכבת שירות, לא עולם. ב-MVP: צד מורה על חומר לימוד בלבד. AI-לתלמיד דחוי.' },
  { id: 9, num: '9', key: 'admin',      name: 'ניהול מערכת',     user: 'Administrator',          color: '#475569', goal: 'ניהול טכני בלבד, בלי תפקיד פדגוגי. (דחוי)' },
];

/* ---------- מילון קטגוריות, גלים ומצבים ---------- */
window.CATEGORIES = {
  screen:   { label: 'מסך',        color: '#0ea5e9' },
  data:     { label: 'נתונים',     color: '#f59e0b' },
  ai:       { label: 'AI',         color: '#8b5cf6' },
  flow:     { label: 'תהליך',      color: '#14b8a6' },
  integ:    { label: 'אינטגרציה',  color: '#64748b' },
  design:   { label: 'עיצוב',      color: '#ec4899' },
  security: { label: 'פרטיות/אבטחה', color: '#e8722c' },
};
window.PHASES = {
  mvpA:  { label: 'גל A — חירום עצמאי', color: '#22c55e' },
  mvpB:  { label: 'גל B — שגרה',        color: '#f59e0b' },
  later: { label: 'דחוי (לא MVP)',      color: '#a855f7' },
};
window.STATUSES = {
  todo:  { label: 'לביצוע',   color: '#94a3b8' },
  doing: { label: 'בתהליך',   color: '#0ea5e9' },
  done:  { label: 'הושלם',    color: '#22c55e' },
};

/* ---------- המשימות ----------
   שדות: id · world · title · desc · cat · phase · status · file (אם קיים) */
window.TASKS = [

  /* ===== תצוגה 0 — תשתית ושירותים משותפים ===== */
  { id:'W0-01', world:0, title:'מסד נתונים משותף', desc:'סכימה אחת: משתמשים, בתי ספר, יחידות, הקצאות, הגשות, ציונים, אירועים. בלי כפילות לוגיקה לכל פרסונה.', cat:'data', phase:'mvpA', status:'todo', file:'data-model.md' },
  { id:'W0-02', world:0, title:'Design System אחיד', desc:'שפה עיצובית משותפת — טורקיז מותג, רקע בהיר, כתום רגוע לחירום (לא אדום), Playpen+Assistant.', cat:'design', phase:'mvpA', status:'doing', file:'design-system.html' },
  { id:'W0-03', world:0, title:'הרשאות RBAC + הפרדת בתי ספר', desc:'מי רואה מה לפי תפקיד וגבול ארגוני (כיתה/ביה"ס/תחום/ארצי).', cat:'flow', phase:'mvpA', status:'doing', file:'roles.html' },
  { id:'W0-04', world:0, title:'Feature Flags — 3 מוצרים', desc:'חירום / שגרה / העשרה נדלקים בנפרד או יחד. אין פריטי ניווט למודול כבוי.', cat:'flow', phase:'mvpA', status:'todo', file:'flags-protocol.md' },
  { id:'W0-05', world:0, title:'מצבי מערכת (שגרה/מרחוק/חירום)', desc:'מתג אחד שמשנה כללי הפעלה של כל התצוגות — לא שלוש מערכות.', cat:'flow', phase:'mvpA', status:'todo', file:'' },
  { id:'W0-06', world:0, title:'מודל משך גמיש + DurationPicker', desc:'הריגת "10 דקות" המקובע. מודל גמיש בקוד, ברירת מחדל קצרה במסך תלמיד/חירום. ניתן לפצל ולשנות בהקצאה בלי לשנות מקור.', cat:'flow', phase:'mvpA', status:'todo', file:'prd.md' },
  { id:'W0-07', world:0, title:'רכיב Dashboard משותף', desc:'תבנית דשבורד שכל תצוגה ממלאת בתוכן שלה.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W0-08', world:0, title:'מרכז התראות משותף', desc:'רכיב התראות + פעולות נדרשות, לשימוש בכל תצוגה.', cat:'screen', phase:'mvpB', status:'todo', file:'' },
  { id:'W0-09', world:0, title:'חיפוש חכם משותף', desc:'רכיב חיפוש אחיד.', cat:'screen', phase:'mvpB', status:'todo', file:'' },

  /* --- מינימיזציה ואבטחה (עמוד השדרה מול משרד העבודה) --- */
  { id:'W0-S1', world:0, title:'מצב יומי גס — לא מעקב-שניות', desc:'רק פעיל/חלקי/לא נראה. בלי activeSeconds / חותמות זמן מדויקות. מוריד היקף נתונים על קטינים.', cat:'security', phase:'mvpA', status:'todo', file:'security-minimization.md' },
  { id:'W0-S2', world:0, title:'check-in מתריע ונמחק', desc:'ה-check-in הרגשי מפעיל התראה למחנך ואז נמחק. אין היסטוריה רגשית על קטין (מב"ר).', cat:'security', phase:'mvpA', status:'todo', file:'security-minimization.md' },
  { id:'W0-S3', world:0, title:'יומן קשר — שדות מובנים בלבד', desc:'בלי הערת טקסט חופשית (שם מחלחל מידע רווחה/משפחה). גישה מוגבלת + מחיקה אוטומטית.', cat:'security', phase:'mvpA', status:'todo', file:'security-minimization.md' },
  { id:'W0-S4', world:0, title:'גבול ארכיטקטוני — בלי AI על נתוני תלמיד', desc:'שום נתון תלמיד לא יוצא למודל חיצוני. AI רק על חומר לימוד בצד המורה.', cat:'security', phase:'mvpA', status:'todo', file:'security-minimization.md' },
  { id:'W0-S5', world:0, title:'אחסון בישראל + סיווג רמת אבטחה', desc:'להניח רמה "גבוהה" (מב"ר). בירור מול המשרד: מקום אחסון, DPO, רישום מאגר, מבחני חדירה 18 חודשים.', cat:'security', phase:'mvpA', status:'todo', file:'security-minimization.md' },
  { id:'W0-S6', world:0, title:'אכיפת מצרפיות ארצית בנתונים', desc:'פיקוח ארצי רואה מספרים בלבד — אין drill לתלמיד. נאכף במבנה הנתונים, לא בהצהרה.', cat:'security', phase:'mvpB', status:'todo', file:'governance.md' },
  { id:'W0-S7', world:0, title:'Audit Log + מדיניות שמירה/מחיקה', desc:'תיעוד גישה מינימלי, מדיניות שמירה ומחיקה מוגדרת. ציות לתיקון 13.', cat:'security', phase:'mvpB', status:'todo', file:'privacy.md' },

  /* ===== תצוגה 1 — תלמיד ===== */
  { id:'W1-01', world:1, title:'דף הבית של התלמיד', desc:'"מה יש לי היום" + check-in בלחיצה + הצעד הבא במסלול.', cat:'screen', phase:'mvpA', status:'doing', file:'student-home.html' },
  { id:'W1-02', world:1, title:'מסך "המקצועות שלי"', desc:'רשימת מקצועות, בכל אחד איפה אני ברצף.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W1-03', world:1, title:'מסך יחידת למידה (משך גמיש)', desc:'פתיח קצר, מטלה ברורה, כפתור "סיימתי". תווית זמן לפי הנתונים — בלי "10 דקות" קבוע.', cat:'screen', phase:'mvpA', status:'doing', file:'demo-unit-hebrew.html' },
  { id:'W1-04', world:1, title:'מסך "המשימות שלי"', desc:'משימות פתוחות, סטטוס, הגשה מהטלפון.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W1-05', world:1, title:'מנוע תרגול ובוחן + משוב מיידי', desc:'מופעי הערכה עם ציון אישי (נשמר לתלמיד ולמורה בלבד, לא פומבי).', cat:'flow', phase:'mvpA', status:'todo', file:'' },
  { id:'W1-06', world:1, title:'מסך "ההתקדמות שלי"', desc:'מסלול: מה סיימתי, מה היום, מה הבא, מה "מספיק להיום". אפשר לעצור ולהמשיך.', cat:'screen', phase:'mvpA', status:'doing', file:'student-home.html' },
  { id:'W1-07', world:1, title:'check-in יומי', desc:'שגרה — "מה נלמד היום"; חירום — 4 אפשרויות בלחיצה. מתריע למחנך ונמחק (ר\' W0-S2).', cat:'flow', phase:'mvpA', status:'todo', file:'' },
  { id:'W1-08', world:1, title:'מרכז הודעות + "המורה ראה"', desc:'הודעות מהמורים + אישור אנושי (לא ציון).', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W1-09', world:1, title:'משחקי למידה', desc:'משחקונים קצרים מותאמי-מובייל.', cat:'screen', phase:'later', status:'todo', file:'' },
  { id:'W1-10', world:1, title:'מסך סרטונים', desc:'סרטוני הסבר קצרים, עובד ברשת חלשה.', cat:'screen', phase:'later', status:'todo', file:'' },
  { id:'W1-11', world:1, title:'שילוב שיעור זום', desc:'כניסה לשיעור מקוון מהמסך.', cat:'integ', phase:'later', status:'todo', file:'' },
  { id:'W1-12', world:1, title:'הישגים ותעודות', desc:'ציון בית, סיכומי התקדמות, תעודות סיום.', cat:'screen', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 2 — מורה + מחנך ===== */
  { id:'W2-01', world:2, title:'Dashboard מורה', desc:'מבט אחד על הכיתות, המשימות והתלמידים.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W2-02', world:2, title:'לוח הגשות "הכיתה שלי"', desc:'מי התחיל, מי תקוע, מי סיים, מי נעלם.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W2-03', world:2, title:'שליחת משימה (< 3 דק\')', desc:'בחירת יחידה, כיתה, שליחה מהטלפון.', cat:'flow', phase:'mvpA', status:'doing', file:'teacher-flow.html' },
  { id:'W2-04', world:2, title:'"המורה ראה" — כפתור ראיתי', desc:'לחיצה על הגשה מפעילה אישור אנושי אצל התלמיד.', cat:'flow', phase:'mvpA', status:'todo', file:'' },
  { id:'W2-05', world:2, title:'דופק כיתתי (מחנך)', desc:'מי בסדר, מי מדשדש, מי נעלם — בלחיצה.', cat:'screen', phase:'mvpA', status:'doing', file:'educator-pulse.html' },
  { id:'W2-06', world:2, title:'יומן קשר + דגלים (מחנך)', desc:'תיעוד פנייה בשדות מובנים בלבד (ר\' W0-S3); דגלים בחירום.', cat:'flow', phase:'mvpA', status:'todo', file:'flags-protocol.md' },
  { id:'W2-07', world:2, title:'יצירת שיעור', desc:'הרכבת שיעור מיחידות + חומרים.', cat:'flow', phase:'mvpB', status:'todo', file:'' },
  { id:'W2-08', world:2, title:'בונה בוחנים', desc:'יצירת בוחן עם ציון ומעקב.', cat:'flow', phase:'mvpB', status:'todo', file:'' },
  { id:'W2-09', world:2, title:'העלאת קבצי מורה + 3 רמות תמיכה', desc:'דף עבודה/מצגת → יחידה; יצירת רמת תמיכה/ליבה/אתגר.', cat:'flow', phase:'mvpB', status:'todo', file:'content-standard.md' },
  { id:'W2-10', world:2, title:'מסך דוחות + ייצוא', desc:'התקדמות כיתה לאורך זמן; ייצוא.', cat:'screen', phase:'mvpB', status:'todo', file:'' },
  { id:'W2-11', world:2, title:'ניהול שיעורי זום', desc:'תזמון, קישור, נוכחות.', cat:'integ', phase:'later', status:'todo', file:'' },
  { id:'W2-12', world:2, title:'שיתוף תכנים בין מורים', desc:'שיתוף יחידה/משימה עם מורה אחר.', cat:'flow', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 3 — מנהל בית הספר ===== */
  { id:'W3-01', world:3, title:'Dashboard מנהל — דופק ביה"ס', desc:'3 מספרים במבט אחד + רשימת אדומים בראש.', cat:'screen', phase:'mvpA', status:'doing', file:'principal-pulse.html' },
  { id:'W3-02', world:3, title:'מתג מצב מערכת', desc:'שגרה / מרחוק / חירום — בלחיצה, משנה את כל התצוגות.', cat:'flow', phase:'mvpA', status:'todo', file:'' },
  { id:'W3-03', world:3, title:'יידוע הורים (פונקציה)', desc:'הודעה רגועה על פעילות הילד — בלי אפליקציה/לוגין הורה, בלי גישה ל-check-in/יומן קשר. דגל parentMessaging.', cat:'flow', phase:'mvpB', status:'todo', file:'parent-weekly.md' },
  { id:'W3-04', world:3, title:'מסך פעילות מורים', desc:'מי מלמד, מי שולח משימות, איפה שקט.', cat:'screen', phase:'mvpB', status:'todo', file:'' },
  { id:'W3-05', world:3, title:'מסך פעילות תלמידים', desc:'השתתפות, התקדמות, נעלמים.', cat:'screen', phase:'mvpB', status:'todo', file:'' },
  { id:'W3-06', world:3, title:'מעקב כיתות + מרכז התראות', desc:'תמונה לכל כיתה + אדומים/מקצועות לא פעילים עם פעולה.', cat:'screen', phase:'mvpB', status:'todo', file:'' },
  { id:'W3-07', world:3, title:'דוחות + דוח יומי לוואטסאפ', desc:'דוח יומי אוטומטי ב-3 מספרים.', cat:'integ', phase:'mvpB', status:'todo', file:'daily-report-format.md' },

  /* ===== תצוגה 4 — מפקח מקצועי (דחוי — אחרי גל A) ===== */
  { id:'W4-01', world:4, title:'עורך יחידות לימוד', desc:'טופס מובנה ליצירת יחידה לפי סטנדרט התוכן.', cat:'flow', phase:'mvpB', status:'todo', file:'content-standard.md' },
  { id:'W4-02', world:4, title:'תהליך אישור תכנים', desc:'טיוטה → אישור → פרסום. תוכן AI מסומן, נדרש אישור אנושי.', cat:'flow', phase:'mvpB', status:'todo', file:'' },
  { id:'W4-03', world:4, title:'פרסום לספרייה', desc:'יחידה מאושרת מופיעה אוטומטית בספרייה.', cat:'integ', phase:'mvpB', status:'todo', file:'' },
  { id:'W4-04', world:4, title:'Dashboard מקצועי + אנליטיקה', desc:'מצב תחום הדעת; אילו יחידות עובדות, מה ננטש (מצרפי).', cat:'data', phase:'later', status:'todo', file:'' },
  { id:'W4-05', world:4, title:'זיהוי פערים מקצועיים', desc:'איפה חסר תוכן / איפה תלמידים נתקעים.', cat:'data', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 5 — פיקוח ארצי (רובו דחוי) ===== */
  { id:'W5-01', world:5, title:'Dashboard ארצי — מצרפי', desc:'תמונה ארצית, מספרים בלבד. איפה מחזיק, איפה נחלש. בלי drill לתלמיד.', cat:'screen', phase:'later', status:'doing', file:'national-map.html' },
  { id:'W5-02', world:5, title:'מפת בתי הספר', desc:'מפה עם מצב כל בית ספר (מצרפי).', cat:'screen', phase:'later', status:'doing', file:'national-map.html' },
  { id:'W5-03', world:5, title:'דוחות + הודעות ארציות', desc:'הפקת דוחות מצרפיים; פרסום הודעה ארצית.', cat:'screen', phase:'later', status:'todo', file:'' },
  { id:'W5-04', world:5, title:'הרשאות + ניהול משתמשים ארצי', desc:'ניהול תפקידים והרשאות ברמה ארצית.', cat:'flow', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 6 — ספריית התוכן ===== */
  { id:'W6-01', world:6, title:'מסך חיפוש/גלריה', desc:'עמוד ראשי של המאגר.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W6-02', world:6, title:'מנוע סינון + סכימת סוגי תוכן', desc:'לפי מקצוע/שכבה/רמה/סוג. יחידות/מצגות/סרטונים/בוחנים/דפי עבודה.', cat:'data', phase:'mvpA', status:'todo', file:'taxonomy.md' },
  { id:'W6-03', world:6, title:'עמוד משאב', desc:'תצוגת יחידה/מצגת/סרטון + פעולת שיבוץ.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W6-04', world:6, title:'מועדפים + שיתוף', desc:'שמירת משאבים אישית ושיתוף.', cat:'flow', phase:'mvpB', status:'todo', file:'' },
  { id:'W6-05', world:6, title:'דיווח + הצעת תוכן', desc:'דגל לתוכן בעייתי; מורה מציע → תור אישור מפקח.', cat:'flow', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 7 — קורסי העשרה ===== */
  { id:'W7-01', world:7, title:'קורס העשרה אחד (מקצה לקצה)', desc:'גל A: קורס יחיד על מנוע היחידות — עמוד קורס, שיעור, מעקב.', cat:'screen', phase:'mvpA', status:'todo', file:'' },
  { id:'W7-02', world:7, title:'קטלוג קורסים', desc:'AI, יזמות, פיננסים, אנגלית, עיצוב ועוד.', cat:'screen', phase:'later', status:'todo', file:'' },
  { id:'W7-03', world:7, title:'תעודת סיום', desc:'תעודה בסיום קורס (דגל certificates).', cat:'screen', phase:'later', status:'todo', file:'' },
  { id:'W7-04', world:7, title:'שילוב קורסים קיימים', desc:'חיבור לקורס AI לתלמידים ולפיננסקלאס.', cat:'integ', phase:'later', status:'todo', file:'' },

  /* ===== תצוגה 8 — שירות AI (צד מורה ב-MVP) ===== */
  { id:'W8-01', world:8, title:'AI למורה — חומר לימוד בלבד', desc:'חילוץ מטרות ממסמך, פירוק מצגת ליחידה, שאלות/משוב, קיצור/התאמת שפה, 3 רמות תמיכה, כרטיס יציאה.', cat:'ai', phase:'mvpB', status:'todo', file:'ai-teacher-prompts.md' },
  { id:'W8-02', world:8, title:'AI למנהל/מפקח — ניתוח מצרפי', desc:'זיהוי מגמות והמלצות פעולה, על נתונים מצרפיים בלבד.', cat:'ai', phase:'later', status:'todo', file:'' },
  { id:'W8-03', world:8, title:'AI פונה-לתלמיד', desc:'הסבר/רמז/דוגמה. דחוי — נתוני קטין לא יוצאים למודל חיצוני (ר\' W0-S4). חוזר עם תשתית מאושרת.', cat:'ai', phase:'later', status:'todo', file:'ai-redlines.md' },
  { id:'W8-04', world:8, title:'מסך ניהול redlines/prompts', desc:'ניהול גבולות והנחיות ה-AI (למנהל מערכת).', cat:'flow', phase:'later', status:'todo', file:'ai-redlines.md' },

  /* ===== תצוגה 9 — ניהול מערכת (דחוי) ===== */
  { id:'W9-01', world:9, title:'ניהול משתמשים ובתי ספר', desc:'חשבונות, איפוסים, הקמת בתי ספר ושיוך.', cat:'flow', phase:'later', status:'todo', file:'' },
  { id:'W9-02', world:9, title:'ניהול הרשאות/תפקידים + הגדרות', desc:'מטריצת הרשאות וקונפיגורציה גלובלית.', cat:'flow', phase:'later', status:'todo', file:'' },
  { id:'W9-03', world:9, title:'אינטגרציות + גיבויים', desc:'זום, וואטסאפ, מערכות משרד; גיבוי ושחזור.', cat:'integ', phase:'later', status:'todo', file:'' },
];

/* ---------- עזרי חישוב ---------- */
window.tasksByWorld = function (worldId) {
  return window.TASKS.filter(function (t) { return t.world === worldId; });
};
window.worldProgress = function (worldId) {
  var ts = window.tasksByWorld(worldId);
  if (!ts.length) return { done: 0, doing: 0, todo: 0, total: 0, pct: 0 };
  var done = ts.filter(function (t) { return t.status === 'done'; }).length;
  var doing = ts.filter(function (t) { return t.status === 'doing'; }).length;
  var todo = ts.filter(function (t) { return t.status === 'todo'; }).length;
  var pct = Math.round(((done + doing * 0.5) / ts.length) * 100);
  return { done: done, doing: doing, todo: todo, total: ts.length, pct: pct };
};
