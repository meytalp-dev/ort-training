/* ============================================================
   רֶצֶף — מנגנון Feature Flags (מקור אמת יחיד ליכולות המוצר)
   feature-flags.js  ·  משימה W0-03  ·  תואם prd.md §2, security-minimization.md
   ------------------------------------------------------------
   מה זה: שכבת יכולות אחת. שלושת המוצרים (חירום/שגרה/העשרה) + יכולות-משנה
   נדלקים בנפרד או יחד — בלי לבנות שלוש מערכות. הדגלים נשלטים בשש רמות:
   התקנה → ארגון → בית ספר → שכבה → משתמש → פיילוט (הספציפי גובר).
   כלל ברזל: אין פריט ניווט למודול כבוי — navFor() מסנן במקור.
   שימוש: הוא לא מסתמך על DOM/מסגרת. import דרך <script src="feature-flags.js">
   ואז RETZEF_FLAGS.resolve(context) / RETZEF_FLAGS.navFor(persona, flags).
   ============================================================ */
(function (root) {
  'use strict';

  /* ---------- 1. שמונת הדגלים + מטא-דאטה ---------- */
  // product: לאיזה מוצר היכולת שייכת (A=חירום, B=שגרה, C=העשרה, X=רוחבי)
  // defaultOn: ברירת מחדל ברמת ההתקנה. מינימיזציה: הכל כבוי חוץ מחירום (opt-in).
  // requires: דגל שחייב להיות דלוק כדי שהדגל הזה יהיה משמעותי (תלות).
  var FLAG_META = {
    emergencyLearning: {
      label: 'רציפות בחירום',
      product: 'A',
      defaultOn: true,
      requires: null,
      desc: 'המוצר העצמאי — check-in, יחידות קצרות, מסלול הצלה, דופק, יומן קשר.',
      note: 'ברירת המחדל הדלוקה היחידה: זהו MVP-A, המוצר שנמסר.'
    },
    routineLearning: {
      label: 'למידה דיפרנציאלית בשגרה',
      product: 'B',
      defaultOn: false,
      requires: null,
      desc: 'העלאת חומר, בניית יחידות, מורה מחליף, שליחת משימות בשגרה.',
      note: 'אופציונלי. כשדלוק — משפר את ההתאמה גם בחירום.'
    },
    differentiation: {
      label: 'דיפרנציאליות מתמשכת',
      product: 'B',
      defaultOn: false,
      requires: 'routineLearning',
      desc: '3 רמות תמיכה לאותה יחידה (תמיכה / ליבה / אתגר).',
      note: 'תת-יכולת של שגרה. כבויה אוטומטית אם שגרה כבויה.'
    },
    enrichmentCourses: {
      label: 'קורסי העשרה',
      product: 'C',
      defaultOn: false,
      requires: null,
      desc: 'קטלוג קורסים על אותו מנוע יחידות. עצמאי — לא דורש שגרה.',
      note: 'כשכבוי — פריט "קורסים" נעלם מהניווט של התלמיד.'
    },
    aiAuthoring: {
      label: 'AI לצד המורה',
      product: 'X',
      defaultOn: false,
      requires: null,
      desc: 'AI ליוצר התוכן/המורה — על חומר לימוד בלבד. לעולם לא על נתוני תלמיד.',
      note: 'מינימיזציה: כבוי כברירת מחדל. אין AI פונה-לתלמיד ב-MVP.'
    },
    parentMessaging: {
      label: 'יידוע הורים',
      product: 'X',
      defaultOn: false,
      requires: null,
      desc: 'הודעת יידוע רגועה להורה. פונקציה, לא אפליקציה ולא לוגין הורה.',
      note: 'מינימיזציה: כבוי כברירת מחדל (הרחבת היקף PII). ללא גישה ל-check-in/יומן קשר.'
    },
    certificates: {
      label: 'תעודות',
      product: 'X',
      defaultOn: false,
      requires: null,
      desc: 'תעודת סיום קורס/מסלול. דחוי-חלקית — פשוט בלבד ב-MVP.',
      note: 'כשכבוי — פריט "תעודות" נעלם ממסך ההתקדמות ומההעשרה.'
    },
    nationalDashboard: {
      label: 'דשבורד ארצי',
      product: 'X',
      defaultOn: false,
      requires: null,
      desc: 'תמונה ארצית — מצרפית בלבד. אין drill לתלמיד בודד (נאכף בנתונים).',
      note: 'מינימיזציה: כבוי כברירת מחדל. כשכבוי — תצוגת הפיקוח הארצי כולה מוסתרת.'
    }
  };

  var FLAG_KEYS = Object.keys(FLAG_META);

  /* ---------- 2. שש רמות השליטה (מהכללי לספציפי) ---------- */
  // הסדר קובע קדימות: כל רמה גוברת על זו שלפניה. פיילוט גובר על הכל
  // כי הוא override מכוון לקבוצת ניסוי. ערך undefined ברמה = "ירושה".
  var LEVELS = ['installation', 'organization', 'school', 'grade', 'user', 'pilot'];
  var LEVEL_META = {
    installation: { label: 'התקנה',    desc: 'ברירת המחדל של כלל המערכת.' },
    organization: { label: 'ארגון',    desc: 'רשת/מחוז — משרד העבודה מדליק מוצר לכלל הרשת.' },
    school:       { label: 'בית ספר',  desc: 'המנהל מדליק/מכבה יכולת לבית ספרו.' },
    grade:        { label: 'שכבה',     desc: 'הפעלה לשכבה מסוימת בלבד (למשל י\'–י"ב).' },
    user:         { label: 'משתמש',    desc: 'חריג נקודתי למשתמש בודד.' },
    pilot:        { label: 'פיילוט',   desc: 'קבוצת ניסוי — גובר על הכל להרצת התנסות.' }
  };

  /* ---------- 3. ברירות מחדל ברמת ההתקנה ---------- */
  function installationDefaults() {
    var out = {};
    FLAG_KEYS.forEach(function (k) { out[k] = !!FLAG_META[k].defaultOn; });
    return out;
  }

  /* ---------- 4. אכיפת תלויות ---------- */
  // דגל שדורש דגל-אב שכבוי — נכבה בכפייה. מונע מצב לא-עקבי (דיפרנציאליות בלי שגרה).
  function enforceDependencies(flags) {
    FLAG_KEYS.forEach(function (k) {
      var req = FLAG_META[k].requires;
      if (req && !flags[req]) flags[k] = false;
    });
    return flags;
  }

  /* ---------- 5. הרזולוציה — לב המנגנון ----------
     context = { installation:{flag:bool}, organization:{...}, ... } — כל רמה חלקית.
     מחזיר { flags:{flag:bool}, source:{flag:levelName} } — הערך הסופי + הרמה שהכריעה.
     ------------------------------------------------------------ */
  function resolve(context) {
    context = context || {};
    var flags = installationDefaults();
    var source = {};
    FLAG_KEYS.forEach(function (k) { source[k] = 'installation'; });

    LEVELS.forEach(function (level) {
      var layer = context[level];
      if (!layer) return;
      FLAG_KEYS.forEach(function (k) {
        if (typeof layer[k] === 'boolean') {
          flags[k] = layer[k];
          source[k] = level;
        }
      });
    });

    // תלויות נאכפות אחרי כל הרמות; אם דגל נכבה בכפייה — מקורו מסומן 'dependency'.
    var before = {};
    FLAG_KEYS.forEach(function (k) { before[k] = flags[k]; });
    enforceDependencies(flags);
    FLAG_KEYS.forEach(function (k) {
      if (before[k] !== flags[k]) source[k] = 'dependency';
    });

    return { flags: flags, source: source };
  }

  function isEnabled(flag, context) {
    return !!resolve(context).flags[flag];
  }

  /* ---------- 6. מיפוי ניווט לכל פרסונה ----------
     כל פריט ניווט קשור ליכולת. requires = כל הדגלים חייבים דלוקים.
     requiresAny = לפחות אחד מהם דלוק. ללא שדה = תמיד מוצג.
     כלל הברזל מיושם ב-navFor(): פריט של מודול כבוי לא נכנס לרשימה.
     ------------------------------------------------------------ */
  var LEARNING = ['emergencyLearning', 'routineLearning']; // "יש בכלל מוצר למידה?"
  var NAV = {
    student: [
      { id: 'home',     label: 'בית' },
      { id: 'tasks',    label: 'משימות',   requiresAny: LEARNING },
      { id: 'courses',  label: 'קורסים',   requires: ['enrichmentCourses'] },
      { id: 'progress', label: 'התקדמות' },
      { id: 'certs',    label: 'תעודות',   requires: ['certificates'] }
    ],
    teacher: [
      { id: 'dashboard', label: 'לוח בקרה',      requiresAny: LEARNING },
      { id: 'class',     label: 'הכיתה שלי',     requiresAny: LEARNING },
      { id: 'send',      label: 'שליחת משימה',   requiresAny: LEARNING },
      { id: 'pulse',     label: 'דופק כיתתי',    requires: ['emergencyLearning'] },
      { id: 'content',   label: 'יצירת תוכן',    requires: ['routineLearning'] },
      { id: 'ai',        label: 'עוזר AI',       requires: ['aiAuthoring'] },
      { id: 'library',   label: 'ספרייה',        requiresAny: LEARNING }
    ],
    principal: [
      { id: 'dashboard', label: 'דופק בית הספר', requiresAny: LEARNING },
      { id: 'mode',      label: 'מצב מערכת' },
      { id: 'parents',   label: 'יידוע הורים',   requires: ['parentMessaging'] },
      { id: 'reports',   label: 'דוחות',         requiresAny: LEARNING }
    ],
    national: [
      { id: 'overview', label: 'תמונה ארצית', requires: ['nationalDashboard'] },
      { id: 'map',      label: 'מפה ארצית',   requires: ['nationalDashboard'] }
    ]
  };

  function itemVisible(item, flags) {
    if (item.requires && !item.requires.every(function (f) { return flags[f]; })) return false;
    if (item.requiresAny && !item.requiresAny.some(function (f) { return flags[f]; })) return false;
    return true;
  }

  // מחזיר את פריטי הניווט המותרים בלבד לפרסונה נתונה, לפי הדגלים המחושבים.
  function navFor(persona, flags) {
    var items = NAV[persona] || [];
    return items.filter(function (it) { return itemVisible(it, flags); });
  }

  // האם פרסונה שלמה מוסתרת (אין לה אף פריט ניווט) — כלל הברזל ברמת הפרסונה.
  function personaVisible(persona, flags) {
    return navFor(persona, flags).length > 0;
  }

  /* ---------- 7. ייצוא ---------- */
  root.RETZEF_FLAGS = {
    FLAG_KEYS: FLAG_KEYS,
    FLAG_META: FLAG_META,
    LEVELS: LEVELS,
    LEVEL_META: LEVEL_META,
    NAV: NAV,
    installationDefaults: installationDefaults,
    enforceDependencies: enforceDependencies,
    resolve: resolve,
    isEnabled: isEnabled,
    itemVisible: itemVisible,
    navFor: navFor,
    personaVisible: personaVisible
  };

  // תמיכה גם ב-CommonJS אם ירוץ בבדיקת Node.
  if (typeof module !== 'undefined' && module.exports) module.exports = root.RETZEF_FLAGS;

})(typeof window !== 'undefined' ? window : this);
