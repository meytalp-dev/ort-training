/* ============================================================
   מערכת רציפות חינוכית בחירום — מקור אמת למשימות
   tasks-data.js
   ------------------------------------------------------------
   זהו המסד המשותף היחיד שממנו נטענים לוחות הניהול:
     worlds-hub.html  — סקירת כל העולמות + התקדמות
     world-board.html — לוח משימות לכל עולם (?world=<id>)
   כל שינוי בסטטוס משימה נעשה כאן (או דרך persistence עתידי).
   ============================================================ */

/* ---------- העולמות ---------- */
window.WORLDS = [
  { id: 0, num: '∞', key: 'infra',      name: 'תשתית משותפת',   user: 'מערכת',                  color: '#64748b', goal: 'מסד נתונים, Design System והרשאות שכל העולמות נשענים עליהם.' },
  { id: 1, num: '1', key: 'student',    name: 'התלמיד',          user: 'תלמיד',                   color: '#0ea5e9', goal: 'ללמוד עצמאית מהבית — פשוט, רציף, מותאם.' },
  { id: 2, num: '2', key: 'teacher',    name: 'המורה',           user: 'מורה מקצועי / מחנך',     color: '#14b8a6', goal: 'לנהל הוראה מרחוק ולעקוב אחרי תלמידים.' },
  { id: 3, num: '3', key: 'principal',  name: 'מנהל בית הספר',    user: 'מנהל / סגן / רכז',       color: '#22c55e', goal: 'תמונת מצב מלאה של הרציפות בבית הספר.' },
  { id: 4, num: '4', key: 'inspector',  name: 'המפקח המקצועי',   user: 'מפקח תחום דעת',          color: '#a855f7', goal: 'להוביל הוראה בתחום הדעת ולהבטיח איכות.' },
  { id: 5, num: '5', key: 'national',   name: 'הפיקוח הארצי',     user: 'מפקחת ארצית / הנהלה',    color: '#6366f1', goal: 'לנהל את כלל המערכת ברמה הארצית.' },
  { id: 6, num: '6', key: 'library',    name: 'ספריית התוכן',     user: 'מורים / מפקחים / מנהלים', color: '#f59e0b', goal: 'מאגר לאומי של חומרי הוראה ולמידה.' },
  { id: 7, num: '7', key: 'enrichment', name: 'קורסי העשרה',      user: 'תלמידים / מורים',        color: '#ec4899', goal: 'הרחבת אופקים גם בזמן חירום.' },
  { id: 8, num: '8', key: 'ai',         name: 'AI',              user: 'כל המשתמשים',            color: '#8b5cf6', goal: 'עוזר חכם מותאם-תפקיד, בגבולות בטוחים.' },
  { id: 9, num: '9', key: 'admin',      name: 'ניהול מערכת',      user: 'Administrator',          color: '#475569', goal: 'ניהול טכני של כל המערכת.' },
];

/* ---------- מילון קטגוריות ומצבים ---------- */
window.CATEGORIES = {
  screen:  { label: 'מסך',        color: '#0ea5e9' },
  data:    { label: 'נתונים',     color: '#f59e0b' },
  ai:      { label: 'AI',         color: '#8b5cf6' },
  flow:    { label: 'תהליך',      color: '#14b8a6' },
  integ:   { label: 'אינטגרציה',  color: '#64748b' },
  design:  { label: 'עיצוב',      color: '#ec4899' },
};
window.PHASES = {
  gal1: { label: 'גל 1 — MVP', color: '#22c55e' },
  gal2: { label: 'גל 2',       color: '#f59e0b' },
  gal3: { label: 'גל 3',       color: '#a855f7' },
};
window.STATUSES = {
  todo:  { label: 'לביצוע',   color: '#94a3b8' },
  doing: { label: 'בתהליך',   color: '#0ea5e9' },
  done:  { label: 'הושלם',    color: '#22c55e' },
};

/* ---------- המשימות ----------
   שדות: id · world · title · desc · cat · phase · status · file (אם קיים כבר) */
window.TASKS = [

  /* ===== עולם 0 — תשתית משותפת ===== */
  { id:'W0-01', world:0, title:'מסד נתונים משותף', desc:'סכימה אחת: משתמשים, בתי ספר, יחידות, משימות, הגשות, ציונים, נוכחות, אירועים.', cat:'data', phase:'gal1', status:'todo', file:'data-model.md' },
  { id:'W0-02', world:0, title:'Design System אחיד', desc:'שפה עיצובית משותפת לכל העולמות — צבעים, טיפוגרפיה, רכיבים.', cat:'design', phase:'gal1', status:'doing', file:'design-system.html' },
  { id:'W0-03', world:0, title:'מנגנון הרשאות מותאם-תפקיד', desc:'מי רואה מה — לפי תפקיד וגבול ארגוני (כיתה/ביה"ס/תחום/ארצי).', cat:'flow', phase:'gal1', status:'doing', file:'roles.html' },
  { id:'W0-04', world:0, title:'רכיב Dashboard משותף', desc:'תבנית דשבורד שכל עולם ממלא בתוכן שלו.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W0-05', world:0, title:'מרכז התראות משותף', desc:'רכיב התראות + פעולות נדרשות, לשימוש בכל עולם.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W0-06', world:0, title:'חיפוש חכם משותף', desc:'רכיב חיפוש אחיד בכל העולמות.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W0-07', world:0, title:'מצבי מערכת (שגרה/מרחוק/חירום)', desc:'מתג אחד שמשנה התנהגות של כל העולמות; לא שלוש מערכות.', cat:'flow', phase:'gal1', status:'todo', file:'' },

  /* ===== עולם 1 — התלמיד ===== */
  { id:'W1-01', world:1, title:'דף הבית של התלמיד', desc:'"מה יש לי היום" + check-in בלחיצה + הצעד הבא במסלול.', cat:'screen', phase:'gal1', status:'doing', file:'student-home.html' },
  { id:'W1-02', world:1, title:'מסך "המקצועות שלי"', desc:'רשימת מקצועות, בכל אחד איפה אני ברצף.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W1-03', world:1, title:'מסך יחידת למידה (10 דק\')', desc:'פתיח קצר, מטלה ברורה, כפתור "סיימתי".', cat:'screen', phase:'gal1', status:'doing', file:'demo-unit-hebrew.html' },
  { id:'W1-04', world:1, title:'מסך "המשימות שלי"', desc:'משימות פתוחות, סטטוס, הגשה מהטלפון.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W1-05', world:1, title:'מנוע תרגול ובוחן + משוב מיידי', desc:'מופעי הערכה עם ציון אישי (נשמר לתלמיד ולמורה בלבד).', cat:'flow', phase:'gal1', status:'todo', file:'' },
  { id:'W1-06', world:1, title:'משחקי למידה', desc:'משחקונים קצרים מותאמי-מובייל.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W1-07', world:1, title:'מסך סרטונים', desc:'סרטוני הסבר קצרים, עובד ברשת חלשה.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W1-08', world:1, title:'שילוב שיעור זום', desc:'כניסה לשיעור מקוון מתוך המסך.', cat:'integ', phase:'gal2', status:'todo', file:'' },
  { id:'W1-09', world:1, title:'מסך "ההתקדמות שלי"', desc:'מסלול למידה: מה סיימתי, מה היום, מה הבא, מה "מספיק להיום".', cat:'screen', phase:'gal1', status:'doing', file:'student-home.html' },
  { id:'W1-10', world:1, title:'מסך הישגים ותעודות', desc:'ציון בית, סיכומי התקדמות, תעודות סיום.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W1-11', world:1, title:'מרכז הודעות', desc:'הודעות מהמורים + "המורה ראה".', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W1-12', world:1, title:'check-in יומי', desc:'שגרה — "מה נלמד היום"; חירום — רגשי, 4 אפשרויות בלחיצה.', cat:'flow', phase:'gal1', status:'todo', file:'' },

  /* ===== עולם 2 — המורה ===== */
  { id:'W2-01', world:2, title:'Dashboard מורה', desc:'מבט אחד על הכיתות, המשימות והתלמידים.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W2-02', world:2, title:'מסך "הכיתה שלי" — לוח הגשות', desc:'מי סיים, מי התחיל, מי נעלם.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W2-03', world:2, title:'שליחת משימה (< 3 דק\')', desc:'בחירת יחידה, כיתה, שליחה מהטלפון.', cat:'flow', phase:'gal1', status:'doing', file:'teacher-flow.html' },
  { id:'W2-04', world:2, title:'יצירת שיעור', desc:'הרכבת שיעור מיחידות + חומרים.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W2-05', world:2, title:'בונה בוחנים', desc:'יצירת בוחן עם ציון ומעקב.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W2-06', world:2, title:'העלאת קבצים וצירוף למשימה', desc:'דף עבודה/מצגת — נשמר קליל, עובד בטלפון.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W2-07', world:2, title:'ניהול שיעורי זום', desc:'תזמון, קישור, נוכחות.', cat:'integ', phase:'gal2', status:'todo', file:'' },
  { id:'W2-08', world:2, title:'מסך דוחות + ייצוא', desc:'התקדמות כיתה לאורך זמן; ייצוא.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W2-09', world:2, title:'שיתוף תכנים בין מורים', desc:'שיתוף יחידה/משימה עם מורה אחר.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W2-10', world:2, title:'פאנל AI למורה', desc:'בניית שיעור/בוחן/דף עבודה, התאמת רמה ושפה.', cat:'ai', phase:'gal3', status:'todo', file:'ai-teacher-prompts.md' },
  { id:'W2-11', world:2, title:'דופק כיתתי (מחנך)', desc:'מי בסדר, מי מדשדש, מי נעלם — בלחיצה.', cat:'screen', phase:'gal1', status:'doing', file:'educator-pulse.html' },
  { id:'W2-12', world:2, title:'יומן קשר + דגלים (מחנך)', desc:'תיעוד כל פנייה; דגלים רגשיים בחירום.', cat:'flow', phase:'gal1', status:'todo', file:'flags-protocol.md' },
  { id:'W2-13', world:2, title:'"המורה ראה" — כפתור ראיתי', desc:'לחיצה על הגשה מפעילה אישור אנושי אצל התלמיד.', cat:'flow', phase:'gal1', status:'todo', file:'' },

  /* ===== עולם 3 — מנהל בית הספר ===== */
  { id:'W3-01', world:3, title:'Dashboard מנהל — דופק ביה"ס', desc:'3 מספרים במבט אחד + רשימת אדומים בראש.', cat:'screen', phase:'gal1', status:'doing', file:'principal-pulse.html' },
  { id:'W3-02', world:3, title:'מסך פעילות מורים', desc:'מי מלמד, מי שולח משימות, איפה שקט.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W3-03', world:3, title:'מסך פעילות תלמידים', desc:'השתתפות, התקדמות, נעלמים.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W3-04', world:3, title:'מעקב כיתות', desc:'תמונה לכל כיתה — מי פעילה, מי נחלשת.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W3-05', world:3, title:'מרכז התראות', desc:'תלמידים אדומים, מקצועות לא פעילים — עם פעולה.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W3-06', world:3, title:'מסך הודעות', desc:'שליחת הודעות לצוות/כיתות/הורים.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W3-07', world:3, title:'דוחות + דוח יומי לוואטסאפ', desc:'דוח יומי אוטומטי ב-3 מספרים.', cat:'integ', phase:'gal2', status:'todo', file:'daily-report-format.md' },
  { id:'W3-08', world:3, title:'מתג מצב מערכת', desc:'שגרה / מרחוק / חירום — בלחיצה אחת, משנה את כל העולמות.', cat:'flow', phase:'gal1', status:'todo', file:'' },

  /* ===== עולם 4 — המפקח המקצועי ===== */
  { id:'W4-01', world:4, title:'Dashboard מקצועי', desc:'מצב תחום הדעת על פני בתי הספר.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W4-02', world:4, title:'עורך יחידות לימוד', desc:'טופס מובנה ליצירת יחידה לפי סטנדרט התוכן.', cat:'flow', phase:'gal2', status:'todo', file:'content-standard.md' },
  { id:'W4-03', world:4, title:'תהליך אישור תכנים', desc:'טיוטה → אישור → פרסום.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W4-04', world:4, title:'פרסום לספרייה', desc:'יחידה מאושרת מופיעה אוטומטית בעולם 6.', cat:'integ', phase:'gal2', status:'todo', file:'' },
  { id:'W4-05', world:4, title:'ניהול ספריית המקצוע', desc:'ארגון, עדכון והסרה של תכני התחום.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W4-06', world:4, title:'אנליטיקה מקצועית', desc:'אילו יחידות עובדות, מה ננטש.', cat:'data', phase:'gal2', status:'todo', file:'' },
  { id:'W4-07', world:4, title:'זיהוי פערים מקצועיים', desc:'איפה חסר תוכן / איפה תלמידים נתקעים.', cat:'data', phase:'gal3', status:'todo', file:'' },
  { id:'W4-08', world:4, title:'ניהול קורסי העשרה בתחום', desc:'קישור לעולם 7.', cat:'integ', phase:'gal3', status:'todo', file:'' },

  /* ===== עולם 5 — הפיקוח הארצי ===== */
  { id:'W5-01', world:5, title:'Dashboard ארצי', desc:'תמונה ארצית מצרפית — איפה מחזיק, איפה נחלש.', cat:'screen', phase:'gal2', status:'doing', file:'national-map.html' },
  { id:'W5-02', world:5, title:'מפת בתי הספר', desc:'מפה עם מצב כל בית ספר.', cat:'screen', phase:'gal2', status:'doing', file:'national-map.html' },
  { id:'W5-03', world:5, title:'דוחות ארציים', desc:'הפקת דוחות ברמת מחוז/ארץ.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W5-04', world:5, title:'מסך הרשאות', desc:'ניהול תפקידים והרשאות ארצי.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W5-05', world:5, title:'ניהול משתמשים (ארצי)', desc:'הוספה/הסרה/שיוך משתמשים.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W5-06', world:5, title:'הודעות ארציות', desc:'פרסום הודעה לכלל המערכת.', cat:'screen', phase:'gal3', status:'todo', file:'' },
  { id:'W5-07', world:5, title:'ניהול קורסים ארציים', desc:'קטלוג קורסי העשרה ארצי (עולם 7).', cat:'integ', phase:'gal3', status:'todo', file:'' },
  { id:'W5-08', world:5, title:'אכיפת "נתונים לתמיכה, לא לשיפוט"', desc:'העיקרון נאכף במבנה הנתונים, לא רק בהצהרה.', cat:'data', phase:'gal2', status:'todo', file:'governance.md' },

  /* ===== עולם 6 — ספריית התוכן ===== */
  { id:'W6-01', world:6, title:'מסך חיפוש/גלריה', desc:'עמוד ראשי של המאגר.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W6-02', world:6, title:'מנוע סינון', desc:'לפי מקצוע / שכבה / רמת קושי / סוג תוכן.', cat:'flow', phase:'gal1', status:'todo', file:'taxonomy.md' },
  { id:'W6-03', world:6, title:'עמוד משאב', desc:'תצוגת יחידה/מצגת/סרטון/משחק + פעולות.', cat:'screen', phase:'gal1', status:'todo', file:'' },
  { id:'W6-04', world:6, title:'מועדפים', desc:'שמירת משאבים אישית.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W6-05', world:6, title:'שיתוף והורדה', desc:'שיתוף משאב + הורדה.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W6-06', world:6, title:'דיווח על תוכן', desc:'דגל לתוכן בעייתי → למפקח.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W6-07', world:6, title:'הצעת תוכן חדש', desc:'מורה מציע תוכן → תור אישור מפקח.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W6-08', world:6, title:'סכימת סוגי תוכן', desc:'יחידות/מצגות/סרטונים/משחקים/בוחנים/דפי עבודה/סימולציות/קישורים.', cat:'data', phase:'gal1', status:'todo', file:'data-model.md' },

  /* ===== עולם 7 — קורסי העשרה ===== */
  { id:'W7-01', world:7, title:'קטלוג קורסים', desc:'AI, יזמות, פיננסים, אנגלית, עיצוב, צילום, בריאות ועוד.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W7-02', world:7, title:'עמוד קורס', desc:'תיאור, יעדים, רשימת שיעורים.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W7-03', world:7, title:'מסך שיעור', desc:'למידת שיעור בודד בקורס.', cat:'screen', phase:'gal2', status:'todo', file:'' },
  { id:'W7-04', world:7, title:'מעקב התקדמות', desc:'איפה התלמיד בקורס.', cat:'flow', phase:'gal2', status:'todo', file:'' },
  { id:'W7-05', world:7, title:'תעודת סיום', desc:'תעודה בסיום קורס.', cat:'screen', phase:'gal3', status:'todo', file:'' },
  { id:'W7-06', world:7, title:'שילוב קורסים קיימים', desc:'חיבור לקורס AI לתלמידים ולפיננסקלאס.', cat:'integ', phase:'gal3', status:'todo', file:'' },

  /* ===== עולם 8 — AI ===== */
  { id:'W8-01', world:8, title:'רכיב פאנל AI משותף', desc:'כפתור/פאנל מותאם-הקשר שמוטמע בכל עולם.', cat:'ai', phase:'gal3', status:'todo', file:'ai-layer-prompts.md' },
  { id:'W8-02', world:8, title:'AI לתלמיד', desc:'הסבר פשוט, שאלות, תרגול נוסף, משוב — בגבולות redlines.', cat:'ai', phase:'gal3', status:'todo', file:'ai-redlines.md' },
  { id:'W8-03', world:8, title:'AI למורה', desc:'שיעור, בוחן, דף עבודה, התאמת רמה/שפה, פעילויות זום.', cat:'ai', phase:'gal3', status:'todo', file:'ai-teacher-prompts.md' },
  { id:'W8-04', world:8, title:'AI למנהל', desc:'ניתוח נתונים, זיהוי בעיות, המלצות פעולה.', cat:'ai', phase:'gal3', status:'todo', file:'' },
  { id:'W8-05', world:8, title:'AI למפקח', desc:'ניתוח ארצי, זיהוי מגמות, המלצות פדגוגיות.', cat:'ai', phase:'gal3', status:'todo', file:'' },
  { id:'W8-06', world:8, title:'מסך ניהול redlines/prompts', desc:'ניהול גבולות והנחיות ה-AL (למנהל מערכת).', cat:'flow', phase:'gal3', status:'todo', file:'ai-redlines.md' },

  /* ===== עולם 9 — ניהול מערכת ===== */
  { id:'W9-01', world:9, title:'Dashboard ניהולי', desc:'בריאות המערכת במבט אחד.', cat:'screen', phase:'gal3', status:'todo', file:'' },
  { id:'W9-02', world:9, title:'ניהול משתמשים', desc:'חשבונות, איפוסים, חסימות.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W9-03', world:9, title:'ניהול בתי ספר', desc:'הקמה, עדכון, שיוך.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W9-04', world:9, title:'ניהול מקצועות ושכבות', desc:'טקסונומיה ארגונית.', cat:'data', phase:'gal3', status:'todo', file:'' },
  { id:'W9-05', world:9, title:'ניהול הרשאות/תפקידים', desc:'הגדרת מטריצת הרשאות.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W9-06', world:9, title:'הגדרות מערכת', desc:'קונפיגורציה גלובלית.', cat:'flow', phase:'gal3', status:'todo', file:'' },
  { id:'W9-07', world:9, title:'אינטגרציות', desc:'זום, וואטסאפ, מערכות משרד.', cat:'integ', phase:'gal3', status:'todo', file:'' },
  { id:'W9-08', world:9, title:'אבטחה ולוגים', desc:'תיעוד גישה, ציות לתיקון 13 (קטינים).', cat:'data', phase:'gal3', status:'todo', file:'privacy.md' },
  { id:'W9-09', world:9, title:'גיבויים', desc:'גיבוי ושחזור נתונים.', cat:'data', phase:'gal3', status:'todo', file:'' },
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
  // התקדמות: הושלם=100%, בתהליך=50%
  var pct = Math.round(((done + doing * 0.5) / ts.length) * 100);
  return { done: done, doing: doing, todo: todo, total: ts.length, pct: pct };
};
