// voice-parse.js — מנתח קלט קולי בעברית להוצאה
// קלט: טקסט מ-SpeechRecognition
// פלט: { amount, category, raw }

// מילים → ספרות (לזיהוי "עשרים וחמש" → 25)
const NUM_WORDS = {
  'אפס': 0, 'אחד': 1, 'אחת': 1, 'שניים': 2, 'שתיים': 2, 'שלוש': 3, 'שלושה': 3,
  'ארבע': 4, 'ארבעה': 4, 'חמש': 5, 'חמישה': 5, 'שש': 6, 'שישה': 6,
  'שבע': 7, 'שבעה': 7, 'שמונה': 8, 'תשע': 9, 'תשעה': 9, 'עשר': 10, 'עשרה': 10,
  'עשרים': 20, 'שלושים': 30, 'ארבעים': 40, 'חמישים': 50, 'שישים': 60,
  'שבעים': 70, 'שמונים': 80, 'תשעים': 90, 'מאה': 100, 'מאתיים': 200,
  'אלף': 1000, 'אלפיים': 2000,
};

// קטגוריות עם keywords עבריים
const CAT_KEYWORDS = {
  must: [
    'אוטובוס', 'רכבת', 'מונית', 'תחבורה', 'נסיעה',
    'אוכל', 'ארוחה', 'סופר', 'שופרסל', 'רמי לוי', 'יוחננוף',
    'ספר', 'מחברת', 'תיק', 'ילקוט', 'בית ספר', 'חוג', 'מנוי',
    'תרופה', 'חיוני', 'חובה', 'תיקון', 'נעליים שחורות',
  ],
  want: [
    'פלאפל', 'שווארמה', 'פיצה', 'בורגר', 'מקדונלדס', 'בורגר ראנץ', 'בורגר קינג',
    'קפה', 'אייס קפה', 'שייק', 'גלידה', 'אבטיח',
    'סרט', 'סינמה', 'סינמה סיטי', 'בולינג', 'גולף', 'יציאה', 'בילוי',
    'חולצה', 'מכנסיים', 'נעליים', 'בגדים', 'קסטרו', 'זארה', 'H&M',
    'משחק', 'גיים', 'fortnite', 'פורטנייט', 'אוזניות',
    'מתנה', 'יומולדת', 'יום הולדת',
  ],
  luxury: [
    'אייפון', 'אייפד', 'מחשב', 'לפטופ', 'גלקסי',
    'פינוק', 'מותרות', 'יקר', 'אקסטרה',
    'נטפליקס', 'ספוטיפיי', 'spotify', 'netflix', 'יוטיוב פרמיום',
    'אלי אקספרס', 'aliexpress', 'אמזון', 'amazon',
  ],
};

// ניסיון לחלץ סכום מטקסט עברי
export function extractAmount(text) {
  if (!text) return null;
  const cleaned = text.replace(/[,.]/g, ' ');

  // 1. ספרות רגילות (₪25, 25 שקל, 25 ש"ח)
  const digitMatch = cleaned.match(/(\d+)/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  // 2. מספר במילים — חיפוש פשוט: "עשרים וחמש"
  const words = cleaned.split(/\s+/);
  let total = 0;
  let found = false;
  let i = 0;
  while (i < words.length) {
    const w = words[i].replace(/[״"',]/g, '');
    if (NUM_WORDS[w] !== undefined) {
      const val = NUM_WORDS[w];
      // אם הבא הוא "ו" + מספר — צירוף (עשרים וחמש = 25)
      if (i + 1 < words.length && (words[i + 1] === 'ו' || words[i + 1].startsWith('ו'))) {
        const nextWord = words[i + 1].replace(/^ו/, '');
        if (NUM_WORDS[nextWord] !== undefined) {
          total += val + NUM_WORDS[nextWord];
          i += 2;
          found = true;
          continue;
        }
      }
      total += val;
      i++;
      found = true;
      continue;
    }
    i++;
  }
  return found ? total : null;
}

// ניסיון לזהות קטגוריה לפי keywords
export function extractCategory(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return cat;
      }
    }
  }
  return null;
}

// הפונקציה הראשית
export function parseVoiceInput(text) {
  return {
    raw: text,
    amount: extractAmount(text),
    category: extractCategory(text),
  };
}

// בדיקה אם הדפדפן תומך ב-SpeechRecognition
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );
}

// יצירת מופע של SpeechRecognition מקונפג לעברית
export function createRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = 'he-IL';
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}
