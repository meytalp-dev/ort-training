/* ============================================================
   רֶצֶף — פלטפורמת רציפות ולמידה דיפרנציאלית · מקור אמת למשימות
   tasks-data.js  ·  תואם אפיון 3.0 + בריף עיצוב רֶצֶף
   ------------------------------------------------------------
   מזין: worlds-hub.html (סקירה) · world-board.html (לוח לכל תצוגה)
   מודל עבודה: מתכלל (orchestrator-prompt.md) ממנה סוכן-משימה אחד לכל
   משימה, נותן לו את הפרומפט המוכן (כפתור "העתק פרומפט"), והסוכן מעדכן
   את status כאן בסיום. גל A (חירום עצמאי "בטוח לביקורת") נבנה עכשיו.
   ============================================================ */

/* ---------- פרומפט משותף: תחילית + סיומת (מורכב אוטומטית בכפתור ההעתקה) ---------- */
window.PROMPT_PREAMBLE =
  'את/ה סוכן משימה יחיד במערכת רֶצֶף — פלטפורמת רציפות ולמידה דיפרנציאלית לחטיבה ותיכון (משרד העבודה). ' +
  'קרא/י לפני שמתחילים: prd.md (אפיון 3.0), worlds-detailed-spec.md (איפיון מפורט), design-system-brief.md + tokens.css ' +
  '(שפה עיצובית — רֶצֶף, טורקיז, מוטיב "קו הרצף", Heebo/Assistant, רקע בהיר, בוגר ולא ילדותי). ' +
  'אם המשימה נוגעת בנתוני תלמידים — קרא/י גם security-minimization.md. ' +
  'סטאק: וניל HTML/CSS/JS, RTL מלא, הפלט ל-_drafts/emergency-learning/. ' +
  'חובה: טוקנים מ-tokens.css בלבד (בלי צבעים קשיחים) · נגישות WCAG AA (מגע 44px, focus ברור, aria, reduced-motion, לא-רק-צבע) · ' +
  'מובייל-first לתלמיד / דסקטופ למורה+מנהל. אל תבנה/י מעבר לגבולות המשימה, ואל תיגע/י במשימות אחרות.';

window.PROMPT_FOOTER =
  'בסיום — חובה: (1) עדכן/י את לוח המשימות: ב-tasks-data.js שנה/י את status של המשימה ל-"done" (או "doing" אם חלקי) ועדכן/י שדה file אם יצרת קובץ. ' +
  '(2) דווח/י למתכלל (ראו orchestrator-prompt.md): מה נבנה, אילו החלטות עיצוב/סקופ קיבלת, ומה נשאר פתוח. ' +
  '(3) אל תשבור/י קישורים קיימים ואל תרחיב/י סקופ מעבר לגל הנוכחי.';

/* ---------- התצוגות (פרסונות) + שכבת התשתית ---------- */
window.WORLDS = [
  { id: 0, num: '∞', key: 'infra',      name: 'תשתית · עיצוב · אבטחה', user: 'מערכת', color: '#64748b', goal: 'שירותים משותפים, Design System רֶצֶף, מצבי מערכת, Feature Flags ומינימיזציה — הבסיס לכל התצוגות.' },
  { id: 1, num: '1', key: 'student',    name: 'תלמיד',          user: 'תלמיד',                   color: '#0B8F98', goal: 'ללמוד עצמאית מהבית — פשוט, רציף, מותאם. מסך נקי, פעולה אחת, בלי תיוג רמה.' },
  { id: 2, num: '2', key: 'teacher',    name: 'מורה + מחנך',     user: 'מורה מקצועי / מחנך',     color: '#0e7c86', goal: 'לנהל הוראה מרחוק, לעקוב אחרי תלמידים, לשמור קשר.' },
  { id: 3, num: '3', key: 'principal',  name: 'מנהל בית הספר',   user: 'מנהל / סגן / רכז',       color: '#4CAF6A', goal: 'תמונת מצב של הרציפות + מתג מצב המערכת + יידוע הורים.' },
  { id: 4, num: '4', key: 'inspector',  name: 'מפקח מקצועי',     user: 'מפקח תחום דעת',          color: '#a855f7', goal: 'להוביל הוראה בתחום הדעת ולאשר תוכן. (גל B)' },
  { id: 5, num: '5', key: 'national',   name: 'פיקוח ארצי',      user: 'מפקחת ארצית / הנהלה',    color: '#6366f1', goal: 'תמונה ארצית — מצרפית בלבד, נאכף בנתונים. (רובו דחוי)' },
  { id: 6, num: '6', key: 'library',    name: 'ספריית התוכן',    user: 'מורים / מפקחים',         color: '#F28A2E', goal: 'מאגר חומרי הוראה. בגל A — ספרייה בסיסית. מיטל מנפיקה תוכן.' },
  { id: 7, num: '7', key: 'enrichment', name: 'קורסי העשרה',     user: 'תלמידים / מורים',        color: '#ec4899', goal: 'הרחבת אופקים על אותו מנוע יחידות. בגל A — קורס אחד.' },
  { id: 8, num: '8', key: 'ai',         name: 'שירות AI',        user: 'צד מורה בלבד (ב-MVP)',   color: '#8b5cf6', goal: 'שכבת שירות, לא עולם. ב-MVP: צד מורה על חומר לימוד בלבד. AI-לתלמיד דחוי.' },
  { id: 9, num: '9', key: 'admin',      name: 'ניהול מערכת',     user: 'Administrator',          color: '#475569', goal: 'ניהול טכני בלבד, בלי תפקיד פדגוגי. (דחוי)' },
];

/* ---------- מילון קטגוריות, גלים ומצבים ---------- */
window.CATEGORIES = {
  screen:   { label: 'מסך',           color: '#0B8F98' },
  data:     { label: 'נתונים',        color: '#F28A2E' },
  ai:       { label: 'AI',            color: '#8b5cf6' },
  flow:     { label: 'תהליך',         color: '#0e7c86' },
  integ:    { label: 'אינטגרציה',     color: '#64748b' },
  design:   { label: 'עיצוב',         color: '#ec4899' },
  security: { label: 'פרטיות/אבטחה',  color: '#F28A2E' },
};
window.PHASES = {
  mvpA:  { label: 'גל A — חירום עצמאי', color: '#4CAF6A' },
  mvpB:  { label: 'גל B — שגרה',        color: '#F28A2E' },
  later: { label: 'דחוי (לא MVP)',      color: '#a855f7' },
};
window.STATUSES = {
  todo:  { label: 'לביצוע',   color: '#94a3b8' },
  doing: { label: 'בתהליך',   color: '#0B8F98' },
  done:  { label: 'הושלם',    color: '#4CAF6A' },
};

/* ---------- המשימות ----------
   שדות: id · world · title · desc · cat · phase · status · file · prompt (גוף המשימה לסוכן) */
window.TASKS = [

  /* ===== תצוגה 0 — שירותי תשתית ===== */
  { id:'W0-01', world:0, title:'מסד נתונים משותף', desc:'סכימה אחת לכל התצוגות — בלי כפילות לוגיקה.', cat:'data', phase:'mvpA', status:'done', file:'data-model.md',
    prompt:'הגדר/י סכימת נתונים אחת (data-model.md) לישויות: משתמשים, בתי ספר, כיתות, יחידות, הקצאות, הגשות, ציונים, אירועים, check-in, יומן קשר. ודא/י התאמה למינימיזציה (מצב יומי גס, בלי מעקב-שניות). ספק/י מבנה JSON לדוגמה לכל ישות, לשימוש כ-seed בפרוטוטייפ.' },
  { id:'W0-02', world:0, title:'הרשאות RBAC + הפרדת בתי ספר', desc:'מי רואה מה לפי תפקיד וגבול ארגוני.', cat:'flow', phase:'mvpA', status:'done', file:'roles.html',
    prompt:'הגדר/י מטריצת הרשאות לפי תפקיד (תלמיד/מורה/מחנך/מנהל/מפקח/ארצי/admin) וגבול ארגוני (כיתה/ביה"ס/תחום/ארצי). עדכן/י את roles.html שיציג את המטריצה. ודא/י: תלמיד רואה רק את עצמו; פיקוח ארצי מצרפי בלבד; מורה מחליף בלי אבחונים.' },
  { id:'W0-03', world:0, title:'Feature Flags — 3 מוצרים', desc:'חירום / שגרה / העשרה נדלקים בנפרד.', cat:'flow', phase:'mvpA', status:'done', file:'feature-flags.html',
    prompt:'ממש/י מנגנון Feature Flags (חירום/שגרה/דיפרנציאליות/העשרה/aiAuthoring/parentMessaging/certificates/nationalDashboard) הנשלט ברמת התקנה/ארגון/ביה"ס/שכבה/משתמש/פיילוט. כלל ברזל: אין פריטי ניווט למודול כבוי. עדכן/י flags-protocol.md.' },
  { id:'W0-04', world:0, title:'מצבי מערכת (שגרה/מרחוק/חירום)', desc:'מתג אחד שמשנה כללי הפעלה בכל התצוגות.', cat:'flow', phase:'mvpA', status:'done', file:'system-mode.js + system-modes.html',
    prompt:'ממש/י מצב מערכת גלובלי (routine/remote/emergency) כ-data-mode על <html>, שמושך צבעי מצב מ-tokens.css. המצב משנה כללי הפעלה (עומס, check-in, ברירת משך), לא רק צבע. חירום = כתום רגוע, לא אדום.' },
  { id:'W0-05', world:0, title:'מודל משך גמיש + DurationPicker', desc:'הריגת "10 דקות" המקובע.', cat:'flow', phase:'mvpA', status:'done', file:'duration-picker.html',
    prompt:'בנה/י רכיב DurationPicker ומודל LearningDuration (fixed/estimated/self_paced/teacher_controlled + min/target/max). תווית לתלמיד לפי הנתונים ("כ-5 דקות"/"בקצב שלך"/"אפשר לעצור ולהמשיך"). ברירת מחדל קצרה במסך תלמיד/חירום. בלי badge ריק, בלי טיימר מלחיץ. אפשר לשנות משך בהקצאה בלי לשנות מקור.' },
  { id:'W0-06', world:0, title:'רכיב Dashboard משותף', desc:'תבנית דשבורד שכל תצוגה ממלאת.', cat:'screen', phase:'mvpA', status:'done', file:'dashboard-template.html (+ components.css §Dashboard)',
    prompt:'בנה/י תבנית Dashboard משותפת (grid רספונסיבי, שורת KPI, אזורי כרטיסים) שכל תצוגה (מורה/מנהל) ממלאת בתוכן שלה. עד 4 KPI, עד 2 גרפים במסך ראשון. עיצוב לפי design-system-brief.md.' },
  { id:'W0-07', world:0, title:'מרכז התראות משותף', desc:'התראות + פעולה נדרשת.', cat:'screen', phase:'mvpB', status:'done', file:'components.css §AlertCard/AlertCenter + alert-center.html',
    prompt:'בנה/י רכיב מרכז התראות משותף: כל התראה עם טקסט+אייקון+צבע (לא רק צבע) וכפתור פעולה. שימוש חוצה-תצוגות (מורה/מנהל).' },
  { id:'W0-08', world:0, title:'חיפוש חכם משותף', desc:'חיפוש אחיד בכל התצוגות.', cat:'screen', phase:'mvpB', status:'done', file:'search-service.js + search-field.html (+ components.css §Search)',
    prompt:'בנה/י רכיב חיפוש אחיד (SearchField) לשימוש בספרייה, בכיתות ובניהול. חיפוש לפי כותרת/תיאור/תגית, נגיש ומקלדתי.' },

  /* --- עיצוב: Design System רֶצֶף --- */
  { id:'W0-D1', world:0, title:'Design Tokens (tokens.css)', desc:'צבעי מותג/מצב/טקסט, רדיוסים, צללים, מרווחים.', cat:'design', phase:'mvpA', status:'done', file:'tokens.css',
    prompt:'הטוקנים קיימים ב-tokens.css לפי הבריף. ודא/י שכל רכיב חדש צורך אותם בלבד. אם חסר טוקן — הוסף/י אותו כאן, לא בקומפוננטה.' },
  { id:'W0-D2', world:0, title:'לוגו רֶצֶף + וריאציות', desc:'wordmark + סימן 3 קווים מעוגלים.', cat:'design', phase:'mvpA', status:'done', file:'logo.html',
    prompt:'צור/י את הלוגו כ-SVG inline: המילה "רֶצֶף" + סימן של שלושה קווים מעוגלים מקבילים בתנועה אופקית (זרימה/אות דיגיטלית). וריאציות: אופקי מלא, סמל בלבד, כהה-על-בהיר, לבן-על-כהה, favicon, מובייל. אסור: חצים/דמות/ספר/כובע/נורה/פאזל/לב. גדלים לפי הבריף (logo-full 36px, symbol 34x24).' },
  { id:'W0-D3', world:0, title:'מוטיב "קו הרצף" (SequenceLine/Step)', desc:'החתימה הוויזואלית של המערכת.', cat:'design', phase:'mvpA', status:'done', file:'sequence-line.html',
    prompt:'בנה/י רכיבי SequenceLine ו-SequenceStep: קו 2px טורקיז מעוגל עם נקודות (14px, מסגרת 3px). 4 שימושים: שלבי יחידה, פס התקדמות, תהליך "העלאה→ניתוח→התאמה→אישור→הקצאה", ציר זמן, ומצב-ריק (נקודה פעילה + המשך דהוי). אסור: קו בכל כרטיס, גלים ברקע, קווים מאחורי טקסט, דגלי סיום/כוכבים.' },
  { id:'W0-D4', world:0, title:'App Shells + ניווט', desc:'Student/Teacher/Principal Shell, Sidebar, Topbar, BottomNav.', cat:'design', phase:'mvpA', status:'done', file:'components.css, app-shells.html',
    prompt:'בנה/י את שלדי האפליקציה: StudentShell (מובייל, BottomNavigation עד 4: בית/משימות/קורסים/התקדמות) + TeacherShell/PrincipalShell (Sidebar 248px רקע לבן פריט 44px פעיל=brand-soft, Topbar 68px עם שם כיתה/בורר מצב/חיפוש/התראות/אווטאר, Main עד 1440px). רספונסיבי מלא.' },
  { id:'W0-D5', world:0, title:'רכיבי UI בסיס', desc:'Button, Card, Chip, Progress, Modal, Drawer, Toast, Skeleton.', cat:'design', phase:'mvpA', status:'done', file:'components.css, ui-components.html',
    prompt:'בנה/י את ספריית ה-UI: Button (ראשי טורקיז 44px/משני/ghost/מסוכן-אדום), Card, StatusChip, ProgressBar, CircularProgress, Badge, Modal, Drawer, Toast, Skeleton — הכל מטוקנים, קצוות מעוגלים, צל עדין, בלי גרדיאנט כבד. לפי סעיפים 7-8 בבריף.' },
  { id:'W0-D6', world:0, title:'ModeSelector + ModeChip', desc:'בורר 3 מצבי מערכת + תג מצב.', cat:'design', phase:'mvpA', status:'done', file:'components.css, ui-components.html',
    prompt:'בנה/י ModeSelector (grid 3: שגרה/מרחוק/חירום, רקע surface-muted, הפעיל=רקע soft+גבול-מצב+אייקון-קו — לא כפתור צבע-מלא) ו-ModeChip קטן להצגת המצב הפעיל. מחובר ל-data-mode ולצבעי המצב.' },
  { id:'W0-D7', world:0, title:'עמוד Design System חי', desc:'מקור האמת הוויזואלי — 15 מקטעים.', cat:'design', phase:'mvpA', status:'done', file:'design-system.html',
    prompt:'עדכן/י את design-system.html למותג רֶצֶף לפי design-system-brief.md + tokens.css: לוגו, צבעים, טיפוגרפיה (Heebo/Assistant), כפתורים, chips, כרטיס יחידה, KPI cards, סטטוסים, טבלאות, קו הרצף, מצבי מערכת, גרפים, Empty States, מובייל, נגישות. זהו המסך המדגים לכל שאר הסוכנים.' },
  { id:'W0-D8', world:0, title:'טבלאות + Empty States + גרפים', desc:'טבלה 52px, מצב-ריק גאומטרי, גרף קווי נקי.', cat:'design', phase:'mvpB', status:'done', file:'components.css, data-components.html',
    prompt:'בנה/י Table (שורה 52px, עד 6 עמודות, במובייל→כרטיסים, status-chip, תפריט 3-נקודות), EmptyState (קו רצף קצר + נקודות, בלי דמויות), ורכיב גרף קווי נקי (טורקיז ראשי, grid בהיר, בלי 3D/גרדיאנט/קפיצות; קו הרצף יכול לשמש כגרף התקדמות).' },
  { id:'W0-D9', world:0, title:'נגישות WCAG AA (רוחבי)', desc:'focus, מקלדת, aria, ניגודיות, reduced-motion.', cat:'design', phase:'mvpA', status:'done', file:'a11y.css · a11y.js · a11y-checklist.md · accessibility.html',
    prompt:'הגדר/י שכבת נגישות משותפת ובדוק/י אותה על הרכיבים: מגע 44px, focus-visible ברור, ניווט מקלדת מלא, aria-label, אין הסתמכות על צבע בלבד (טקסט+אייקון), ניגודיות AA, הגדלת טקסט, prefers-reduced-motion, טקסט חלופי לגרפים, תיאור סטטוס מילולי. ספק/י צ\'קליסט לשאר הסוכנים.' },
  { id:'W0-D10', world:0, title:'סבב האחדה — כל המסכים לספרייה המשותפת', desc:'סבב אחרון: כל מסך צורך את components.css, בלי כפילות רכיבים ובלי צבעים קשיחים.', cat:'design', phase:'mvpA', status:'todo', file:'',
    prompt:'סבב האחדה חוצה-מסכים (עיצוב בלבד, בלי שינוי תוכן/התנהגות). עבור/י על כל מסכי גל A ואַחֵד אותם לספרייה המשותפת: (1) כל מסך חייב לקשר גם ל-components.css (לא רק tokens.css) ולצרוך את הרכיבים המשותפים (Button, Card, StatusChip, ProgressBar, SequenceLine/Step, MetricCard, ModeChip, CheckInPanel וכו\') במקום להעתיק סגנונות מקומית. (2) הסר/י צבעים קשיחים והחלף/י בטוקנים מ-tokens.css (fallback בתוך var() מותר רק אם הטוקן לא זמין ב-SVG). (3) ודא/י שקו-הרצף מופיע היכן שרלוונטי (מסלול/התקדמות) מהרכיב המשותף, לא כהעתק. אתרים ידועים לתיקון: student-subjects.html (6 hex, בלי components.css), practice-engine.html/checkin-panel.html/messages-center.html/demo-unit-hebrew.html (בלי components.css), student-tasks.html (2 hex). אל תשבור/י פריסה/RTL/נגישות AA — רק להאחיד. סרוק/י את כל קבצי ה-*.html של המסכים ותקן/י כל חריגה. בסיום — דווח/י רשימת מסכים שאוחדו ומה שונה.' },

  /* --- מינימיזציה ואבטחה --- */
  { id:'W0-S1', world:0, title:'מצב יומי גס — לא מעקב-שניות', desc:'רק פעיל/חלקי/לא נראה.', cat:'security', phase:'mvpA', status:'done', file:'data-model.md',
    prompt:'ודא/י שהמערכת שומרת רק מצב יומי גס (פעיל/חלקי/לא נראה) — בלי activeSeconds/hintsUsed/חותמות זמן מדויקות על תלמיד. עדכן/י את מודל הנתונים בהתאם. זהו סעיף 3#2 ב-security-minimization.md.' },
  { id:'W0-S2', world:0, title:'check-in מתריע ונמחק', desc:'בלי היסטוריה רגשית על קטין.', cat:'security', phase:'mvpA', status:'done', file:'checkin-service.js',
    prompt:'ממש/י את ה-check-in הרגשי כך שהוא מפעיל התראה למחנך ואז נמחק — אין רשומת היסטוריה רגשית מתמשכת (מב"ר לפי תיקון 13). סטטוס חד-פעמי בלבד. תעד/י בקוד למה.' },
  { id:'W0-S3', world:0, title:'יומן קשר — שדות מובנים בלבד', desc:'בלי הערת טקסט חופשית.', cat:'security', phase:'mvpA', status:'done', file:'contact-log.js, contact-log.html',
    prompt:'ממש/י את יומן הקשר עם שדות מובנים בלבד (ערוץ/תוצאה/משימת המשך) — בלי שדה טקסט חופשי (שם מחלחל מידע רווחה/משפחה). גישה למחנך מורשה בלבד, מחיקה אוטומטית אחרי תקופה מוגדרת.' },
  { id:'W0-S4', world:0, title:'גבול ארכיטקטוני — בלי AI על נתוני תלמיד', desc:'נתוני קטין לא יוצאים למודל.', cat:'security', phase:'mvpA', status:'done', file:'ai-data-boundary.md, ai-boundary.js',
    prompt:'הגדר/י גבול ארכיטקטוני נאכף: שום נתון תלמיד לא נשלח למודל AI חיצוני. AI מותר רק על חומר לימוד בצד המורה. תעד/י את הגבול כך שכל סוכן AI עתידי כפוף לו.' },
  { id:'W0-S5', world:0, title:'אחסון בישראל + סיווג רמת אבטחה', desc:'בירור מול המשרד.', cat:'security', phase:'mvpA', status:'done', file:'security-handoff-dpo.md',
    prompt:'הכן/י מסמך החלטות אבטחה למסירה לגורם אבטחת מידע/DPO במשרד: להניח רמת אבטחה "גבוהה" (מב"ר), אחסון בישראל, DPO, רישום מאגר, מבחני חדירה כל 18 חודשים, מדיניות שמירה/מחיקה. בסיס: סעיף 4 ב-security-minimization.md. אלה שאלות פתוחות לסגירה — לא לממש בקוד.' },
  { id:'W0-S6', world:0, title:'אכיפת מצרפיות ארצית בנתונים', desc:'פיקוח ארצי — מספרים, בלי drill לתלמיד.', cat:'security', phase:'mvpB', status:'done', file:'data-model.md §11, governance.md',
    prompt:'ודא/י במודל הנתונים שהתצוגה הארצית חושפת מצרפים בלבד — אין נתיב drill לתלמיד בודד. נאכף במבנה, לא בהצהרה. עדכן/י governance.md.' },
  { id:'W0-S7', world:0, title:'Audit Log + מדיניות שמירה/מחיקה', desc:'תיעוד גישה מינימלי + ציות תיקון 13.', cat:'security', phase:'mvpB', status:'done', file:'privacy.md',
    prompt:'הגדר/י Audit Log מינימלי (גישה לנתוני קטין), מדיניות שמירה ומחיקה מוגדרת לכל סוג נתון (check-in לא נשמר, יומן קשר מוגבל, לוגים מוגבלים). עדכן/י privacy.md בהתאם לתיקון 13.' },

  /* ===== תצוגה 1 — תלמיד ===== */
  { id:'W1-01', world:1, title:'דף הבית של התלמיד', desc:'"מה יש לי היום" + check-in + הצעד הבא.', cat:'screen', phase:'mvpA', status:'done', file:'student-home.html',
    prompt:'עדכן/י את student-home.html למותג רֶצֶף: TopBar (אווטאר/שם/כיתה, פעמון, עזרה), ברכה בוגרת, ModeChip, כרטיס "המשימה הבאה" בולט (זמן גמיש, פס התקדמות, כפתור טורקיז), "מה מספיק להיום", באנר "המורה ראה", BottomNav. בלי שפה ילדותית, בלי איורים.' },
  { id:'W1-02', world:1, title:'מסך "המקצועות שלי"', desc:'מקצוע + מיקום ברצף.', cat:'screen', phase:'mvpA', status:'done', file:'student-subjects.html',
    prompt:'בנה/י מסך "המקצועות שלי": כרטיס לכל מקצוע עם מיקום ברצף (אחרונה שהושלמה/נוכחית/כמה נשאר קרוב) ופס רצף (SequenceLine). כרטיסים גדולים, גלילה אנכית, מובייל.' },
  { id:'W1-03', world:1, title:'מסך יחידת למידה (משך גמיש)', desc:'מנה אחת בכל פעם + מסלול הצלה.', cat:'screen', phase:'mvpA', status:'done', file:'demo-unit-hebrew.html',
    prompt:'עדכן/י את demo-unit-hebrew.html: פתיח קצר (למה חשוב+דוגמה), גוף כמנה אחת בכל פעם (הסבר→דוגמה→רעיון מודגש, בלי גלילה אינסופית), תווית זמן גמישה (בלי "10 דקות"), בורר רמת תמיכה עדין (איתי/לבד/קדימה, בלי תיוג), מסלול הצלה (רמז→פירוק), כפתור "סיימתי". שלבים מחוברים בקו רצף.' },
  { id:'W1-04', world:1, title:'מסך "המשימות שלי"', desc:'פתוחות/הוגשו/נצפו + הגשה מהטלפון.', cat:'screen', phase:'mvpA', status:'done', file:'student-tasks.html',
    prompt:'בנה/י מסך "המשימות שלי": רשימה (פתוחות בראש) עם תג דחיפות וסטטוס "הוגש→המורה ראה→משוב". הגשה = טקסט/"סיימתי" בלבד (בלי העלאת קובץ מתלמיד ב-MVP). עובד ברשת חלשה.' },
  { id:'W1-05', world:1, title:'מנוע תרגול ובוחן + משוב מיידי', desc:'משוב אחרי כל שאלה, בלי עונש.', cat:'flow', phase:'mvpA', status:'done', file:'practice-engine.html',
    prompt:'בנה/י מנוע תרגול: שאלות קצרות עם משוב מיידי (בלי עונש על טעות) + מופע הערכה עם ציון אישי שנשמר לתלמיד ולמורה בלבד. בלי לוח מובילים, בלי השוואה פומבית.' },
  { id:'W1-06', world:1, title:'מסך "ההתקדמות שלי"', desc:'מסלול beads + סיכום שבועי.', cat:'screen', phase:'mvpA', status:'done', file:'student-progress.html',
    prompt:'בנה/י מסך "ההתקדמות שלי": מסלול beads (סיימתי/היום/הבא) כקו רצף שנשמר בין ימים + סיכום שבועי (כמה יחידות/ימים רצופים) בטון מעודד רגוע. אפשר לעצור ולהמשיך.' },
  { id:'W1-07', world:1, title:'check-in יומי', desc:'שגרה=מה נלמד; חירום=4 אפשרויות.', cat:'flow', phase:'mvpA', status:'done', file:'checkin-panel.html',
    prompt:'בנה/י רכיב CheckInPanel: בשגרה "מה נלמד היום"; בחירום 4 אפשרויות בלחיצה (מוכן/להתחיל לאט/צריך עזרה/לא יכול עכשיו) עם אייקוני-קו (לא אימוג\'י). מפעיל התראה למחנך ונמחק — בלי היסטוריה (ר\' W0-S2).' },
  { id:'W1-08', world:1, title:'מרכז הודעות + "המורה ראה"', desc:'הודעות מהמורים + אישור אנושי.', cat:'screen', phase:'mvpA', status:'done', file:'messages-center.html',
    prompt:'בנה/י מרכז הודעות לתלמיד: הודעות מהמורים + התראת "המורה ראה" (נראות, לא ציון). סימון על חדשות, מובייל.' },
  { id:'W1-09', world:1, title:'משחקי למידה', desc:'משחקון מגע קצר.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) משחקון מגע קצר לחיזוק — בוגר, לא משחקי-ילדותי, בלי כוכבים/גביעים. לבנות רק אחרי אישור גל A.' },
  { id:'W1-10', world:1, title:'מסך סרטונים', desc:'סרטוני הסבר, רשת חלשה.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) מסך סרטוני הסבר קצרים, איכות משתנה לרשת חלשה, חלופה טקסטואלית. לבנות רק אחרי גל A.' },
  { id:'W1-11', world:1, title:'שילוב שיעור זום', desc:'כניסה לשיעור מקוון.', cat:'integ', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) כפתור הצטרפות לזום + זמן. בלי הקלטת קטין ללא היתר. לא ב-MVP.' },
  { id:'W1-12', world:1, title:'הישגים ותעודות', desc:'ציון בית, תעודות סיום.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) מסך הישגים: ריכוז ציונים פרטי + תעודת סיום קורס. לא ב-MVP.' },

  /* ===== תצוגה 2 — מורה + מחנך ===== */
  { id:'W2-01', world:2, title:'Dashboard מורה', desc:'הכיתות + "מה דורש אותי היום".', cat:'screen', phase:'mvpA', status:'done', file:'teacher-dashboard.html',
    prompt:'בנה/י Dashboard מורה בדסקטופ (TeacherShell): שורת KPI (תלמידים/פעילים/זקוקים לתמיכה/לא התחילו — דונאט נקי), "מה דורש אותי היום" (הגשות חדשות, נעלמים), וקיצורים "שלח משימה"/"דופק כיתתי". זה המסך הראשון לבנייה לפי הבריף.' },
  { id:'W2-02', world:2, title:'לוח הגשות "הכיתה שלי"', desc:'מי התחיל/תקוע/סיים/נעלם.', cat:'screen', phase:'mvpA', status:'done', file:'teacher-class-board.html',
    prompt:'בנה/י לוח הגשות: טבלה/כרטיסים של מי סיים/התחיל/לא נכנס + פאנל "דופק למידה" (הבינו/זקוקים לדוגמה/מסלול הצלה) עם המלצת פעולה בלחיצה. פילוח בלחיצה.' },
  { id:'W2-03', world:2, title:'שליחת משימה (< 3 דק\')', desc:'יחידה → כיתה → שליחה מהטלפון.', cat:'flow', phase:'mvpA', status:'done', file:'teacher-flow.html',
    prompt:'עדכן/י את teacher-flow.html למותג רֶצֶף: בחירת יחידה (מהספרייה/אחרונות), נמענים (כיתה/קבוצה/תלמיד — רק שלו), תזמון+מסר קצר, אישור "נשלח ל-N". אפשר לשנות משך בהקצאה בלי לשנות מקור. פחות מ-3 דקות, מהטלפון.' },
  { id:'W2-04', world:2, title:'"המורה ראה" — כפתור ראיתי', desc:'אישור אנושי אצל התלמיד.', cat:'flow', phase:'mvpA', status:'done', file:'seen-service.js + seen-flow.html',
    prompt:'ממש/י את זרימת "ראיתי": לחיצה על הגשה מפעילה את באנר "המורה ראה" אצל התלמיד (W1-01). נראות אנושית, בלי ציון.' },
  { id:'W2-05', world:2, title:'דופק כיתתי (מחנך)', desc:'ירוק/צהוב/אדום לכל תלמיד.', cat:'screen', phase:'mvpA', status:'done', file:'educator-pulse.html',
    prompt:'עדכן/י את educator-pulse.html למותג רֶצֶף: דופק ירוק/צהוב/אדום לכל תלמיד (טקסט+אייקון, לא רק צבע), אדום בראש. קליק → פעולה. שפה רגועה ("נדרש קשר", לא "בסיכון").' },
  { id:'W2-06', world:2, title:'מסך יומן קשר (מחנך)', desc:'מסך המחנך שצורך את שירות יומן-הקשר הקיים. שדות מובנים בלבד.', cat:'flow', phase:'mvpA', status:'done', file:'contact-log-teacher.html',
    prompt:'בנה/י את מסך המחנך ליומן קשר שצורך את השירות הקיים contact-log.js + contact-log.html (נבנו ב-W0-S3): שדות מובנים בלבד (ערוץ/תוצאה/משימת המשך — בלי טקסט חופשי), גישה מוגבלת למחנך, מחיקה אוטומטית. אל תבנה/י מחדש את הלוגיקה — עטוף/י את השירות הקיים בתוך TeacherShell (app-shells.html). ⚠️ פרוטוקול הדגלים הרגשיים (flags-protocol.md, "קשה לי 3 ברצף", FlagEvent, יועצת) — נדחה כולו מגל A (החלטת מיטל). בגל A רק שני טריגרי-קשר: "רוצה לדבר" (התראה מיידית ונמחקת) ו"היעדרות 48ש\'". אל תבנה/י דגלים רגשיים ואל תיגע/י ב-flags-protocol.md.' },
  { id:'W2-07', world:2, title:'יצירת שיעור', desc:'שרשור יחידות + חומרים.', cat:'flow', phase:'mvpB', status:'done', file:'lesson-create.html',
    prompt:'(גל B) בנה/י יצירת שיעור: שרשור יחידות מהספרייה לרצף (SequenceStep), צירוף חומר, תצוגה מקדימה. גרסת התלמיד חייבת לעבוד בטלפון.' },
  { id:'W2-08', world:2, title:'בונה בוחנים', desc:'שאלות + מפתח + מעקב.', cat:'flow', phase:'mvpB', status:'done', file:'quiz-builder.html',
    prompt:'(גל B) בנה/י בונה בוחנים: שאלות (אמריקאי/פתוח קצר) + מפתח, תוצאות לכיתה ומעקב לאורך זמן. פרטי לכיתה.' },
  { id:'W2-09', world:2, title:'העלאת קבצי מורה + 3 רמות תמיכה', desc:'דף עבודה/מצגת → יחידה.', cat:'flow', phase:'mvpB', status:'done', file:'file-to-unit.html',
    prompt:'(גל B) בנה/י FileUploader למורה (דף עבודה/מצגת/קישור/טקסט/תוכנית לימודים) שהופך לחומר יחידה + יצירת 3 רמות תמיכה (תמיכה/ליבה/אתגר). 〰️ קו הרצף לתהליך "העלאה→ניתוח→התאמה→אישור→הקצאה". לפי content-standard.md.' },
  { id:'W2-10', world:2, title:'מסך דוחות + ייצוא', desc:'התקדמות כיתה לאורך זמן.', cat:'screen', phase:'mvpB', status:'todo', file:'',
    prompt:'(גל B) בנה/י מסך דוחות מורה: התקדמות כיתה לאורך זמן (גרף קווי נקי) + ייצוא. פרטי לכיתה.' },
  { id:'W2-11', world:2, title:'ניהול שיעורי זום', desc:'תזמון, קישור, נוכחות.', cat:'integ', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) ניהול שיעורי זום: תזמון/קישור/נוכחות. לא ב-MVP.' },
  { id:'W2-12', world:2, title:'שיתוף תכנים בין מורים', desc:'שיתוף יחידה/משימה עם עמית.', cat:'flow', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) שיתוף יחידה/משימה עם מורה אחר. לא ב-MVP.' },

  /* ===== תצוגה 3 — מנהל בית הספר ===== */
  { id:'W3-01', world:3, title:'Dashboard מנהל — דופק ביה"ס', desc:'4 KPI + רשימת "נדרש קשר".', cat:'screen', phase:'mvpA', status:'done', file:'principal-pulse.html',
    prompt:'עדכן/י את principal-pulse.html למותג רֶצֶף: 4 KPI (שיעור השתתפות/תלמידים פעילים/כיתות פעילות/נדרש קשר), רשימת "נדרש קשר" בראש (קליק→מחנך), דופק צוות, מגמת השתתפות כקו רצף. עד 2 גרפים. שפה רגועה.' },
  { id:'W3-02', world:3, title:'מתג מצב מערכת', desc:'שגרה/מרחוק/חירום → כל התצוגות.', cat:'flow', phase:'mvpA', status:'done', file:'mode-switch.html',
    prompt:'בנה/י מסך החלפת מצב מערכת (ModeSelector) שמשנה את מצב כל התצוגות (W0-04), עם אישור לפני מעבר והודעה למשתמשים. לא כפתורי צבע-מלא גדולים.' },
  { id:'W3-03', world:3, title:'יידוע הורים (פונקציה)', desc:'הודעה רגועה, בלי אפליקציה.', cat:'flow', phase:'mvpB', status:'done', file:'parent-weekly.html',
    prompt:'(גל B) בנה/י פונקציית יידוע הורים: הודעה שבועית רגועה על פעילות הילד, יוצאת מהמחנך/מנהל. בלי לוגין הורה, בלי גישה ל-check-in/יומן קשר. דגל parentMessaging. לפי parent-weekly.md.' },
  { id:'W3-04', world:3, title:'מסך פעילות מורים', desc:'מי מלמד, איפה שקט.', cat:'screen', phase:'mvpB', status:'done', file:'teacher-activity.html',
    prompt:'(גל B) מסך פעילות מורים: מי שולח משימות ובאיזו תדירות, איפה שקט מתמשך. מצרפי.' },
  { id:'W3-05', world:3, title:'מסך פעילות תלמידים', desc:'השתתפות, מגמות, נעלמים.', cat:'screen', phase:'mvpB', status:'todo', file:'',
    prompt:'(גל B) מסך פעילות תלמידים: אחוזי check-in והגשה, מגמות, נעלמים. מצרפי + drill לכיתה (לא לחשיפת מב"ר).' },
  { id:'W3-06', world:3, title:'מעקב כיתות + מרכז התראות', desc:'תמונת כיתה + אדומים עם פעולה.', cat:'screen', phase:'mvpB', status:'done', file:'class-tracking.html',
    prompt:'(גל B) מעקב כיתות (פעילה/נחלשת לכל כיתה) + מרכז התראות (אדומים/מקצועות לא פעילים → כפתור פעולה).' },
  { id:'W3-07', world:3, title:'דוחות + דוח יומי לוואטסאפ', desc:'3 מספרים בשעה קבועה.', cat:'integ', phase:'mvpB', status:'done', file:'daily-report.html',
    prompt:'(גל B) בנה/י דוח יומי אוטומטי מצרפי ב-3 מספרים לוואטסאפ בשעה קבועה (daily-report-format.md). מצרפי, בלי שמות פומבי. api.whatsapp.com.' },

  /* ===== תצוגה 4 — מפקח מקצועי (גל B) ===== */
  { id:'W4-01', world:4, title:'עורך יחידות לימוד', desc:'טופס מובנה לפי סטנדרט תוכן.', cat:'flow', phase:'mvpB', status:'todo', file:'content-standard.md',
    prompt:'(גל B) בנה/י עורך יחידות בטופס מובנה לפי content-standard.md (פתיח, מנות קצרות, דוגמה, תרגול, רמות תמיכה). לא WYSIWYG מלא בשלב זה.' },
  { id:'W4-02', world:4, title:'תהליך אישור תכנים', desc:'טיוטה → אישור → פרסום.', cat:'flow', phase:'mvpB', status:'todo', file:'',
    prompt:'(גל B) ממש/י workflow אישור: טיוטה→אישור→פרסום, סטטוס לכל יחידה. תוכן AI מסומן, אישור אנושי חובה לפני פרסום.' },
  { id:'W4-03', world:4, title:'פרסום לספרייה', desc:'מאושר → אוטומטית לספרייה.', cat:'integ', phase:'mvpB', status:'todo', file:'',
    prompt:'(גל B) חבר/י פרסום: יחידה מאושרת מופיעה אוטומטית בספריית התוכן (תצוגה 6).' },
  { id:'W4-04', world:4, title:'Dashboard מקצועי + אנליטיקה', desc:'אילו יחידות עובדות (מצרפי).', cat:'data', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) Dashboard מקצועי: מצב תחום הדעת, יחידות מצליחות מול ננטשות. מצרפי, בלי נתוני קטין אישיים.' },
  { id:'W4-05', world:4, title:'זיהוי פערים מקצועיים', desc:'איפה חסר תוכן.', cat:'data', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) זיהוי פערים: איפה חסר תוכן / איפה תלמידים נתקעים. מצרפי.' },

  /* ===== תצוגה 5 — פיקוח ארצי (רובו דחוי) ===== */
  { id:'W5-01', world:5, title:'Dashboard ארצי — מצרפי', desc:'מספרים בלבד, בלי drill לתלמיד.', cat:'screen', phase:'later', status:'todo', file:'national-map.html',
    prompt:'(דחוי) עדכן/י את national-map.html: תמונה ארצית מצרפית (מספרים), איפה מחזיק/נחלש. אין drill לתלמיד בודד (W0-S6). סימון מצוקה/תמיכה, לא דירוג פומבי.' },
  { id:'W5-02', world:5, title:'מפת בתי הספר', desc:'מצב כל ביה"ס (מצרפי).', cat:'screen', phase:'later', status:'todo', file:'national-map.html',
    prompt:'(דחוי) מפת בתי ספר עם מצב מצרפי לכל ביה"ס. בלי דירוג פומבי.' },
  { id:'W5-03', world:5, title:'דוחות + הודעות ארציות', desc:'דוחות מצרפיים + הודעה ארצית.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) הפקת דוחות מצרפיים (מחוז/מקצוע/זמן) + פרסום הודעה ארצית.' },
  { id:'W5-04', world:5, title:'הרשאות + ניהול משתמשים ארצי', desc:'מטריצת תפקידים ארצית.', cat:'flow', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) ניהול תפקידים והרשאות ומשתמשים ברמה ארצית.' },

  /* ===== תצוגה 6 — ספריית התוכן ===== */
  { id:'W6-01', world:6, title:'מסך חיפוש/גלריה', desc:'עמוד ראשי של המאגר.', cat:'screen', phase:'mvpA', status:'done', file:'library.html',
    prompt:'בנה/י את עמוד הספרייה: גלריית משאבים + חיפוש בראש. כרטיסי משאב (סוג/מקצוע/שכבה). מובייל=עמודה אחת.' },
  { id:'W6-02', world:6, title:'מנוע סינון + סכימת סוגי תוכן', desc:'מקצוע/שכבה/רמה/סוג.', cat:'data', phase:'mvpA', status:'done', file:'library-filters.js + library-filters.html',
    prompt:'בנה/י מנוע סינון (מקצוע/שכבה/רמה/סוג לפי taxonomy.md) + סכימת סוגי תוכן אחידה (יחידה/מצגת/סרטון/בוחן/דף עבודה/סימולציה/קישור). שילוב מסננים.' },
  { id:'W6-03', world:6, title:'עמוד משאב', desc:'תצוגה מקדימה + שבץ לכיתה.', cat:'screen', phase:'mvpA', status:'done', file:'resource-page.html',
    prompt:'בנה/י עמוד משאב: תצוגה מקדימה לפי סוג + פעולת "שבץ לכיתה" (למורה) + מטא (יוצר/תאריך אישור/שימושים).' },
  { id:'W6-04', world:6, title:'מועדפים + שיתוף', desc:'אוסף אישי ושיתוף.', cat:'flow', phase:'mvpB', status:'todo', file:'',
    prompt:'(גל B) מועדפים (אוסף אישי לכל משתמש) + שיתוף משאב.' },
  { id:'W6-05', world:6, title:'דיווח + הצעת תוכן', desc:'דגל + תור אישור מפקח.', cat:'flow', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) דיווח על תוכן בעייתי (דגל→מפקח) + מורה מציע תוכן→תור אישור.' },

  /* ===== תצוגה 7 — קורסי העשרה ===== */
  { id:'W7-01', world:7, title:'קורס העשרה אחד (מקצה לקצה)', desc:'עמוד קורס → שיעור → מעקב.', cat:'screen', phase:'mvpA', status:'done', file:'enrichment-course.html',
    prompt:'בנה/י קורס העשרה יחיד מקצה-לקצה על מנוע היחידות: עמוד קורס (תיאור/יעדים/רשימת שיעורים), מסך שיעור (מבנה מנה קצרה כמו תצוגה 1), מעקב התקדמות. CourseCard לפי הבריף.' },
  { id:'W7-02', world:7, title:'קטלוג קורסים', desc:'קטגוריות מרובות.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) קטלוג קורסים (AI/יזמות/פיננסים/אנגלית/עיצוב…) עם סינון תחום/רמה.' },
  { id:'W7-03', world:7, title:'תעודת סיום', desc:'דגל certificates.', cat:'screen', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) תעודת סיום קורס (דגל certificates). לא ב-MVP.' },
  { id:'W7-04', world:7, title:'שילוב קורסים קיימים', desc:'קורס AI לתלמידים, פיננסקלאס.', cat:'integ', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) לבדוק שילוב קורס-AI-לתלמידים ופיננסקלאס במקום כפילות.' },

  /* ===== תצוגה 8 — שירות AI (צד מורה ב-MVP) ===== */
  { id:'W8-01', world:8, title:'AI למורה — חומר לימוד בלבד', desc:'חילוץ מטרות, פירוק מצגת, שאלות.', cat:'ai', phase:'mvpB', status:'todo', file:'ai-teacher-prompts.md',
    prompt:'(גל B) בנה/י פאנל AI למורה על חומר לימוד בלבד: חילוץ מטרות ממסמך, פירוק מצגת ליחידה, יצירת שאלות/משוב, קיצור/התאמת שפה, 3 רמות תמיכה, כרטיס יציאה. אף פעם על נתוני תלמיד (W0-S4). לפי ai-teacher-prompts.md + ai-redlines.md.' },
  { id:'W8-02', world:8, title:'AI למנהל/מפקח — מצרפי', desc:'זיהוי מגמות על מצרפי.', cat:'ai', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) AI על נתונים מצרפיים בלבד: זיהוי מגמות והמלצות. לא על קטין בודד.' },
  { id:'W8-03', world:8, title:'AI פונה-לתלמיד', desc:'חסום ב-MVP.', cat:'ai', phase:'later', status:'todo', file:'ai-redlines.md',
    prompt:'(דחוי — חסום ב-MVP) AI לתלמיד. אסור בגל A/B: נתוני קטין לא יוצאים למודל חיצוני (W0-S4). לפתוח רק עם תשתית מאושרת ואישור אבטחת מידע.' },
  { id:'W8-04', world:8, title:'מסך ניהול redlines/prompts', desc:'ניהול גבולות AI.', cat:'flow', phase:'later', status:'todo', file:'ai-redlines.md',
    prompt:'(דחוי) מסך ניהול redlines/prompts למנהל מערכת (ai-redlines.md).' },

  /* ===== תצוגה 9 — ניהול מערכת (דחוי) ===== */
  { id:'W9-01', world:9, title:'ניהול משתמשים ובתי ספר', desc:'חשבונות + הקמת בתי ספר.', cat:'flow', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) ניהול משתמשים (חשבונות/איפוסים/חסימות) + בתי ספר (הקמה/עדכון/שיוך).' },
  { id:'W9-02', world:9, title:'הרשאות/תפקידים + הגדרות', desc:'מטריצת הרשאות + קונפיג.', cat:'flow', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) מטריצת הרשאות/תפקידים + הגדרות מערכת גלובליות.' },
  { id:'W9-03', world:9, title:'אינטגרציות + גיבויים', desc:'זום/וואטסאפ/משרד + גיבוי.', cat:'integ', phase:'later', status:'todo', file:'',
    prompt:'(דחוי) אינטגרציות (זום/וואטסאפ/מערכות משרד) + גיבוי ושחזור.' },
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
/* ---------- תלויות בין משימות ----------
   deps[id] = רשימת משימות שחייבות להיות 'done' לפני שאפשר להתחיל.
   משימה בלי רשומה כאן = בלי תלות (פנויה מיידית, כפוף לסטטוס). */
window.DEPS = {
  /* עיצוב — תשתית */
  'W0-D2':['W0-D1'], 'W0-D3':['W0-D1'], 'W0-D5':['W0-D1'], 'W0-D6':['W0-D1'],
  'W0-D4':['W0-D2','W0-D5','W0-D6'], 'W0-D7':['W0-D2','W0-D3','W0-D5','W0-D6'],
  'W0-D8':['W0-D1','W0-D5'], 'W0-D9':['W0-D5'],
  /* שירותי תשתית */
  'W0-04':['W0-D1'], 'W0-05':['W0-D1'], 'W0-06':['W0-D4','W0-D5'],
  'W0-07':['W0-D5'], 'W0-08':['W0-D5'],
  /* אבטחה שנוגעת במסד הנתונים */
  'W0-S1':['W0-01'], 'W0-S2':['W0-01'], 'W0-S3':['W0-01'], 'W0-S6':['W0-01'], 'W0-S7':['W0-01'],
  /* תלמיד */
  'W1-01':['W0-D4','W0-D5','W0-01'], 'W1-02':['W0-D4','W0-D5','W0-D3'],
  'W1-03':['W0-D5','W0-05','W0-D3'], 'W1-04':['W0-D4','W0-D5','W0-01'],
  'W1-05':['W0-D5','W0-01'], 'W1-06':['W0-D4','W0-D5','W0-D3'],
  'W1-07':['W0-D5','W0-S2'], 'W1-08':['W0-D4','W0-D5'],
  /* מורה + מחנך */
  'W2-01':['W0-D4','W0-06','W0-01'], 'W2-02':['W0-D4','W0-D5','W0-01'],
  'W2-03':['W0-D5','W0-01'], 'W2-04':['W2-02'], 'W2-05':['W0-D4','W0-D5','W0-01'],
  'W2-06':['W0-D5','W0-S3'], 'W2-07':['W0-D4','W0-D5'], 'W2-08':['W0-D5','W0-01'],
  'W2-09':['W0-D5'], 'W2-10':['W0-06','W0-01'],
  /* מנהל */
  'W3-01':['W0-D4','W0-06','W0-01'], 'W3-02':['W0-04','W0-D6'],
  'W3-03':['W0-D5'], 'W3-04':['W0-06','W0-01'], 'W3-05':['W0-06','W0-01'],
  'W3-06':['W0-07','W0-01'], 'W3-07':['W0-01'],
  /* מפקח */
  'W4-01':['W0-D5'], 'W4-02':['W4-01'], 'W4-03':['W4-02','W6-03'],
  /* ספרייה */
  'W6-01':['W0-D4','W0-D5','W0-08'], 'W6-02':['W0-01'], 'W6-03':['W0-D5','W0-01'], 'W6-04':['W6-03'],
  /* העשרה */
  'W7-01':['W0-D4','W0-D5','W0-01'],
  /* AI (גל B) */
  'W8-01':['W0-D5'],
  /* סבב האחדה — אחרי שכל מסכי גל A נבנו */
  'W0-D10':['W1-01','W1-02','W1-03','W1-04','W1-05','W1-06','W1-07','W1-08','W2-01','W2-02','W2-03','W2-05','W2-06','W3-01','W3-02','W6-01','W6-02','W6-03','W7-01'],
};
window.depsOf = function (id) { return window.DEPS[id] || []; };
/* משימות אחרות שכותבות לאותו קובץ (אסור להריץ במקביל) */
window.sharedFile = function (id) {
  var t = window.TASKS.filter(function (x) { return x.id === id; })[0];
  if (!t || !t.file) return [];
  return window.TASKS.filter(function (x) { return x.id !== id && x.file === t.file; })
                     .map(function (x) { return x.id; });
};

/* ---------- הרכבת הפרומפט המלא למשימה (לכפתור "העתק פרומפט") ---------- */
window.fullPrompt = function (t) {
  return window.PROMPT_PREAMBLE +
    '\n\n## המשימה: ' + t.id + ' — ' + t.title +
    '\n' + t.desc +
    '\n\nמה לבנות: ' + (t.prompt || t.desc) +
    '\n\n' + window.PROMPT_FOOTER;
};
