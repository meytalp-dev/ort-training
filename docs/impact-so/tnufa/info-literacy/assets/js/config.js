/**
 * ImpactOS אוריינות מידע — Configuration
 *
 * הגדרות מערכת. עדכן את API_URL אחרי deploy של Apps Script.
 */

const CONFIG = {
  // Apps Script Web App URL — להחליף אחרי Deploy
  API_URL: 'https://script.google.com/macros/s/REPLACE_AFTER_DEPLOY/exec',

  // Brand
  APP_NAME: 'ImpactOS אוריינות מידע',
  APP_VERSION: '0.1.0-mvp',

  // Storage keys (prefix שונה מאנגלית כדי לא להתנגש)
  STORAGE_KEYS: {
    USER: 'impactos_il_user',
    TOKEN: 'impactos_il_token',
    PROFILE: 'impactos_il_profile',
  },

  // Feature flags
  FEATURES: {
    teacher_dashboard: true,
    portfolio: true,
    ai_log: true,
    parent_dashboard: false,  // V2
  },

  // 13 רכיבים ב-3 ממדים — מבנה הליבה של המערכת
  COMPONENTS: {
    // ממד 1 · איתור והערכה (Locate & Evaluate)
    '1.1': { dim: 1, name: 'ניסוח שאלות חיפוש', short: 'ניסוח שאלות' },
    '1.2': { dim: 1, name: 'ניתוח אמינות המקור', short: 'אמינות מקור' },
    '1.3': { dim: 1, name: 'השוואת מקורות', short: 'השוואת מקורות' },
    '1.4': { dim: 1, name: 'זיהוי חוסרים ו-hallucinations', short: 'זיהוי חוסרים' },
    '1.5': { dim: 1, name: 'זיהוי מניפולציות והטיות', short: 'זיהוי הטיות' },

    // ממד 2 · ארגון ועיבוד (Organize & Process)
    '2.1': { dim: 2, name: 'ארגון ומיון מידע', short: 'ארגון מידע' },
    '2.2': { dim: 2, name: 'ניתוח, השוואה ומסקנות', short: 'ניתוח ומסקנות' },
    '2.3': { dim: 2, name: 'הערכת איכות טיעונים', short: 'איכות טיעון' },
    '2.4': { dim: 2, name: 'קשרים בין תחומים', short: 'קשרים בין-תחומיים' },
    '2.5': { dim: 2, name: 'מיזוג מקורות סותרים', short: 'מיזוג מקורות' },

    // ממד 3 · הצגה (Present)
    '3.1': { dim: 3, name: 'הצגה לקהל יעד', short: 'הצגה לקהל' },
    '3.2': { dim: 3, name: 'הפקת תוצר', short: 'הפקת תוצר' },
    '3.3': { dim: 3, name: 'שיתוף בפלטפורמה', short: 'שיתוף' },
  },

  DIMENSIONS: {
    1: { name: 'איתור והערכה', short: 'איתור', color: 'truth', weight: 45 },
    2: { name: 'ארגון ועיבוד', short: 'ארגון', color: 'think', weight: 35 },
    3: { name: 'הצגה', short: 'הצגה', color: 'voice', weight: 20 },
  },

  // 5 שלבים שנתיים — "המסע שלי"
  STAGES: [
    { id: 'open',    name: 'שלב פתיחה',     short: 'פתיחה',     months: 'ספטמבר',          desc: 'יסודות: CRAAP, Lateral Reading, AI as a tool' },
    { id: 'core',    name: 'גרעין מיומנויות', short: 'גרעין',    months: 'אוקטובר–דצמבר',   desc: 'איתור, הערכה, השוואת מקורות' },
    { id: 'apply',   name: 'יישום מורכב',    short: 'יישום',     months: 'ינואר–מרץ',       desc: 'ארגון, ניתוח, מיזוג — AI כשותף' },
    { id: 'present', name: 'הצגה ושיתוף',    short: 'הצגה',      months: 'אפריל–מאי',       desc: 'פרויקט גמר חוצה-מקצועות' },
    { id: 'reflect', name: 'רפלקציה ומטא',   short: 'רפלקציה',   months: 'יוני',            desc: 'איך גדלתי כקורא.ת ויוצר.ת מידע' },
  ],

  // 4 רמות התקדמות (פר רכיב)
  LEVELS: {
    1: { name: 'מתחיל', desc: 'מבצע.ת בעזרה ניכרת' },
    2: { name: 'מתפקד', desc: 'עצמאי.ת במקרים פשוטים' },
    3: { name: 'מבוסס', desc: 'עצמאי.ת גם במורכב' },
    4: { name: 'מומחה-עמית', desc: 'מנחה עמיתים' },
  },

  // 4 כללי הזהב לעבודה עם AI
  AI_RULES: [
    { id: 1, name: 'ניסוח קודם', desc: 'לכתוב על דף מה אני שואל.ת ולמה — לפני שפותחים את ה-AI' },
    { id: 2, name: 'שני-מקורות', desc: 'כל פלט AI מאומת מול מקור אנושי לפחות אחד' },
    { id: 3, name: 'מה ה-AI החמיץ', desc: 'אחרי כל פלט: מה הוא לא אמר? איזו פרספקטיבה חסרה?' },
    { id: 4, name: 'שקיפות',     desc: 'לתעד: באיזה prompt השתמשתי, מה ה-AI ענה, מה עשיתי איתו' },
  ],
};

Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.COMPONENTS);
Object.freeze(CONFIG.DIMENSIONS);
Object.freeze(CONFIG.STAGES);
Object.freeze(CONFIG.LEVELS);
Object.freeze(CONFIG.AI_RULES);
