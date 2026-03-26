# Brief ל-Lovable: מחולל משחקים לימודיים

## החזון
מחולל שבו המורה בוחר סוג משחק, כותב נושא → ו-AI (Gemini) מייצר משחק אינטראקטיבי מלא. 12 סוגי משחקים, פרסום לענן עם קישור + QR, שליחת ציונים ל-Google Sheets.

---

## 1. זרימת המשתמש (4 שלבים)

```
שלב 1: פרטים           שלב 2: תוכן             שלב 3: סקירה         שלב 4: תצוגה + פרסום
┌──────────────┐       ┌──────────────┐          ┌──────────────┐      ┌──────────────┐
│ שם המשחק     │       │ [✨ צור עם AI]│          │ סיכום + רשימת│      │ iframe תצוגה │
│ מקצוע [▼]    │  →    │              │    →     │ פריטים       │  →   │              │
│ כיתה [▼]     │       │ עורכי פריטים │          │              │      │ [☁️ פרסם]    │
│ סוג משחק     │       │ ידניים       │          │              │      │ [📥 הורד]    │
│ מספר פריטים  │       │              │          │              │      │ [📱 QR]      │
└──────────────┘       └──────────────┘          └──────────────┘      └──────────────┘
```

---

## 2. 12 סוגי משחקים – הגדרות

```typescript
interface GameType {
  key: string;
  name: string;       // שם בעברית
  icon: string;       // emoji
  desc: string;       // תיאור קצר
  min: number;        // מינימום פריטים
  max: number;        // מקסימום פריטים
  def: number;        // ברירת מחדל
  label: string;      // תווית ("שאלות", "זוגות", "פריטים"...)
}

const GAME_TYPES = {
  trivia:     { name:'טריוויה',           icon:'🎯', desc:'שאלות עם 4 תשובות',           min:3,  max:20, def:8,  label:'שאלות' },
  matching:   { name:'התאמה',             icon:'🔗', desc:'חיבור בין זוגות',              min:4,  max:15, def:8,  label:'זוגות' },
  ordering:   { name:'סדר נכון',          icon:'📋', desc:'סידור בסדר הנכון',             min:3,  max:12, def:6,  label:'פריטים' },
  escape:     { name:'חדר בריחה',         icon:'🔐', desc:'פתרו חידות כדי לברוח',         min:3,  max:8,  def:5,  label:'חדרים' },
  memory:     { name:'זיכרון',            icon:'🧠', desc:'מצאו זוגות תואמים',            min:4,  max:12, def:6,  label:'זוגות' },
  wheel:      { name:'גלגל המזל',         icon:'🎡', desc:'סובבו וענו על שאלות',          min:4,  max:15, def:8,  label:'שאלות' },
  truefalse:  { name:'נכון / לא נכון',    icon:'✅', desc:'האם המשפט נכון?',              min:5,  max:20, def:10, label:'משפטים' },
  fillblank:  { name:'השלמת חסר',         icon:'✏️', desc:'מלאו את המילה החסרה',          min:3,  max:15, def:8,  label:'משפטים' },
  sentence:   { name:'סדר את המשפט',      icon:'🔤', desc:'סדרו מילים למשפט',             min:3,  max:10, def:6,  label:'משפטים' },
  groups:     { name:'קבוצות',            icon:'🎨', desc:'מיינו פריטים לקבוצות',          min:3,  max:5,  def:4,  label:'קבוצות' },
  hangman:    { name:'נחשו את המילה',     icon:'🔮', desc:'נחשו אות אחרי אות',           min:3,  max:15, def:8,  label:'מילים' },
  millionaire:{ name:'מיליונר',           icon:'💰', desc:'ענו נכון, התקדמו לפרס',        min:5,  max:15, def:10, label:'שאלות' }
};
```

---

## 3. מבנה נתונים (Data Schema) לכל סוג

```typescript
// trivia / wheel / millionaire
interface TriviaItem {
  text: string;           // שאלה
  options: string[];      // 4 תשובות
  correct: number;        // אינדקס התשובה הנכונה (0-3)
  explanation?: string;   // הסבר (לא ב-wheel)
}

// matching
interface MatchingItem {
  right: string;          // מושג
  left: string;           // הגדרה
}
// + config-level: columnRightTitle, columnLeftTitle

// memory
interface MemoryItem {
  front: string;          // מושג (צד קדמי)
  back: string;           // הגדרה (צד אחורי)
}

// ordering
interface OrderingItem {
  text: string;           // פריט
  position: number;       // מיקום נכון (1-based)
}
// + config-level: instruction

// escape
interface EscapeItem {
  title: string;          // שם החדר
  story: string;          // סיפור (2-3 משפטים)
  riddle: string;         // חידה
  answer: string;         // תשובה (מילה אחת)
  hint: string;           // רמז
}

// truefalse
interface TrueFalseItem {
  text: string;           // טענה
  correct: boolean;       // נכון/לא נכון
  explanation: string;    // הסבר
}

// fillblank
interface FillBlankItem {
  sentence: string;       // משפט עם ___
  answer: string;         // מילה חסרה
  hint?: string;          // רמז (אופציונלי)
}

// sentence
interface SentenceItem {
  sentence: string;       // המשפט בסדר הנכון (המילים יעורבלו)
}

// groups
interface GroupItem {
  name: string;           // שם הקבוצה
  items: string[];        // 4 פריטים בקבוצה (תמיד 4)
}

// hangman
interface HangmanItem {
  word: string;           // המילה (3-8 אותיות בעברית)
  hint: string;           // רמז
}
```

---

## 4. Game Config Object

זהו האובייקט שנשמר ומועבר לנגן:

```typescript
interface GameConfig {
  gameType: string;             // אחד מ-12 המפתחות
  items: any[];                 // מערך פריטים לפי הסוג
  settings: {
    shuffleItems: boolean;      // האם לערבב (true ברירת מחדל)
  };
  columnRightTitle?: string;    // matching בלבד
  columnLeftTitle?: string;     // matching בלבד
  instruction?: string;         // ordering בלבד
}
```

---

## 5. שלב 1 – עורך פרטים

| שדה | סוג | חובה | אפשרויות |
|-----|------|------|----------|
| שם המשחק | text | כן | - |
| מקצוע | select | כן | עברית / מתמטיקה / היסטוריה / אזרחות / תנ"ך / אנגלית / ספרות / מדעים / תספורת / אחר |
| כיתה | select | כן | כיתה ט / כיתה י / כיתה יא / כיתה יב |
| סוג משחק | card grid | כן | 12 כרטיסים עם icon + שם + תיאור |
| מספר פריטים | range slider | כן | min–max לפי הסוג, ברירת מחדל def |

---

## 6. שלב 2 – עורך תוכן

### 6.1 יצירה עם AI (Gemini)

```
┌──────────────────────────────────────┐
│ ✨ יצירה עם AI                       │
│ ┌──────────────────────────────────┐ │
│ │ על מה המשחק? [________________] │ │
│ └──────────────────────────────────┘ │
│ [✨ צור תוכן]                        │
└──────────────────────────────────────┘
```

**API:** Gemini 2.5 Flash
**URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
**API Key:** מ-localStorage (`ort-gemini-key`), המשתמש מזין בפעם הראשונה
**Response format:** `responseMimeType: 'application/json'`
**Temperature:** 0.7

**Prompt template (כל הסוגים):**
```
אתה מורה מנוסה בבית ספר תיכון מקצועי "אורט בית הערבה".
נושא: "{topic}"
מקצוע: {subject}
כיתה: {grade}
הנחיות: שפה פשוטה וברורה, מתאימה לתלמידי תיכון עם קשיי קשב ולקויות למידה.

צור {count} {type-specific-instruction}.
החזר JSON בפורמט: {"items": [...]}
```

**הנחיות ספציפיות לכל סוג:**

| סוג | הנחיה ל-AI |
|-----|-----------|
| trivia | צור {n} שאלות טריוויה. כל שאלה עם 4 תשובות. **פזר את התשובה הנכונה** – לא תמיד 0. הוסף הסבר קצר. |
| matching | צור {n} זוגות התאמה. כל זוג = מושג + הגדרה. הוסף columnRightTitle + columnLeftTitle. |
| ordering | צור {n} פריטים בסדר הנכון. הוסף instruction. כל פריט = {text, position}. |
| escape | צור {n} חדרים. כל חדר = כותרת + סיפור (2-3 משפטים) + חידה + תשובה (מילה אחת) + רמז. |
| memory | צור {n} זוגות. כל זוג = front (מושג) + back (הגדרה קצרה). |
| wheel | צור {n} שאלות עם 4 תשובות (בלי הסבר). פזר correct. |
| truefalse | צור {n} משפטים, חלקם נכונים וחלקם לא. הוסף הסבר. |
| fillblank | צור {n} משפטים עם מילה חסרה (סמן ב-___). תשובה = מילה אחת. |
| sentence | צור {n} משפטים קצרים (4-8 מילים). נכונים דקדוקית. |
| groups | צור {n} קבוצות, כל אחת עם שם + 4 פריטים. הקבוצות צריכות להיות שונות מספיק. |
| hangman | צור {n} מילים (3-8 אותיות בעברית) עם רמזים. |
| millionaire | צור {n} שאלות **בסדר קושי עולה**. כל שאלה = 4 תשובות + הסבר. |

### 6.2 עריכה ידנית

כל פריט = אקורדיון/כרטיס נפתח עם טופס עריכה.

**Trivia / Wheel / Millionaire editor:**
- Textarea: שאלה
- 4 שדות טקסט (א, ב, ג, ד) + בחירת תשובה נכונה (radio)
- Textarea: הסבר (לא ב-wheel)

**Matching editor:**
- 2 שדות: מושג ← הגדרה

**Memory editor:**
- 2 שדות: צד קדמי ← צד אחורי

**Ordering editor:**
- שדה טקסט אחד: "פריט X (במיקום הנכון)"

**Escape editor:**
- שם חדר + textarea סיפור + textarea חידה + תשובה + רמז

**True/False editor:**
- Textarea: טענה + toggle נכון/לא נכון + textarea הסבר

**Fill Blank editor:**
- Textarea: משפט עם ___ + תשובה + רמז

**Sentence editor:**
- Textarea אחד: "המשפט בסדר הנכון (המילים יעורבלו)"

**Groups editor:**
- שם קבוצה + 4 שדות טקסט (פריטים)

**Hangman editor:**
- מילה + רמז

---

## 7. לוגיקת 12 המשחקים (Player)

### 7.1 TRIVIA (טריוויה)

**UI:** מונה שאלות + שאלה גדולה + 4 כרטיסי תשובה (א,ב,ג,ד) + משוב

**אינטראקציה:**
1. לחיצה על תשובה → כל התשובות מנוטרלות
2. תשובה נכונה = ירוק, לא נכונה = אדום
3. שאר התשובות מעומעמות (opacity 0.45)
4. הסבר מופיע מתחת
5. כפתור "הבא" מופיע

**ניקוד:** +1 לכל תשובה נכונה. ציון = אחוזים (correctItems / totalItems * 100).

**מיוחד:** פריטים מעורבבים (shuffle). אנימציית fadeUp בין שאלות.

---

### 7.2 MATCHING (התאמה)

**UI:** 2 עמודות – מושגים (ימין) ← הגדרות (שמאל). כל עמודה מעורבבת בנפרד.

**אינטראקציה:**
1. לחיצה על פריט בעמודה ימנית → נבחר (הדגשה טורקיז)
2. לחיצה על פריט בעמודה שמאלית → בדיקה
3. התאמה נכונה = שניהם ירוקים + לא לחיצים
4. לא נכון = שניהם רוטטים (shake animation) + חוזרים

**ניקוד:** +1 לכל זוג מותאם.

---

### 7.3 ORDERING (סדר נכון)

**UI:** רשימה אנכית עם מספר + טקסט + חצים למעלה/למטה.

**אינטראקציה:**
1. חצים מזיזים פריטים למעלה/למטה
2. כפתור "בדקו סדר" → כל פריט מקבל ירוק (נכון) או אדום (לא נכון)

**ניקוד:** +1 לכל פריט במיקום הנכון.

---

### 7.4 ESCAPE ROOM (חדר בריחה)

**UI:** מספר חדר + כותרת + סיפור + חידה (רקע צהוב) + שדה תשובה + כפתור רמז.

**אינטראקציה:**
1. הקלדת תשובה + "בדקו" (או Enter)
2. השוואה case-insensitive
3. נכון = ירוק + כפתור "החדר הבא"
4. לא נכון = shake לשדה הקלט, אפשר לנסות שוב
5. רמז = מופיע טקסט + כפתור רמז מושבת

**ניקוד:** +1 לחדר בלי רמז, +0.5 לחדר עם רמז. ניסיונות ללא הגבלה.

---

### 7.5 MEMORY (זיכרון)

**UI:** גריד 4 עמודות של כרטיסים. כל כרטיס = צד קדמי ("?") + צד אחורי (טקסט). אנימציית 3D flip.

**אינטראקציה:**
1. לחיצה = הפיכת כרטיס (rotateY 180deg)
2. מקסימום 2 כרטיסים הפוכים
3. אם pairId זהה = match (ירוק, נשארים גלויים)
4. אם לא = שניהם חוזרים אחרי 1000ms
5. נעילה בזמן בדיקה (memoryLocked)

**יצירת כרטיסים:** כל item → 2 כרטיסים (front + back), הכל מעורבב.

**ניקוד:** +1 לכל זוג.

---

### 7.6 WHEEL (גלגל המזל)

**UI:** Canvas עם גלגל צבעוני + חץ למעלה + כפתור "סובבו!"

**ציור הגלגל (Canvas):**
```javascript
const colors = ['#2A9D8F','#E76F7A','#E9A319','#52B788','#6366f1','#ec4899',
                '#f59e0b','#14b8a6','#8b5cf6','#f43f5e','#06b6d4','#84cc16'];
// פרוסות צבעוניות עם מספרים
// פרוסות שנענו = אפור (#cbd5e1)
// עיגול מרכזי לבן
```

**מכניקת סיבוב:**
- בחירת שאלה רנדומלית (מבין שטרם נענו)
- 4-6 סיבובים מלאים + נחיתה על הפרוסה הנכונה
- אנימציה ease-out cubic, 3000ms
- אחרי נחיתה: popup שאלה (כמו trivia)

**ניקוד:** +1 לכל תשובה נכונה.

---

### 7.7 TRUE/FALSE (נכון / לא נכון)

**UI:** טענה גדולה + 2 כפתורים: "✓ נכון" (ירוק) / "✗ לא נכון" (אדום)

**אינטראקציה:**
1. לחיצה על כפתור → שניהם מנוטרלים
2. תשובה נכונה = הדגשה ירוקה, לא נכונה = הדגשה אדומה
3. הסבר מופיע + כפתור "הבא"

**ניקוד:** +1 לכל תשובה נכונה.

---

### 7.8 FILL BLANK (השלמת חסר)

**UI:** משפט עם חסר (___) מודגש + שדה טקסט + "בדקו" + כפתור רמז.

**אינטראקציה:**
1. הקלדה + "בדקו" (או Enter)
2. השוואה case-insensitive
3. נכון = ירוק, החסר מתמלא
4. לא נכון = אדום, מציג תשובה נכונה
5. רמז לא מוריד ניקוד (בניגוד לחדר בריחה)

**ניקוד:** +1 לכל תשובה נכונה.

---

### 7.9 SENTENCE (סדר את המשפט)

**UI:** אזור יעד (מקווקו) + בנק מילים (chips מעורבבים)

**אינטראקציה:**
1. לחיצה על מילה בבנק → עוברת לאזור יעד
2. לחיצה על מילה באזור יעד → חוזרת לבנק
3. כשכל המילים הונחו → כפתור "בדקו"
4. בדיקה: השוואת הסדר למשפט המקורי
5. נכון = ירוק, לא נכון = אדום + "המשפט הנכון: ..."

**ניקוד:** +1 לכל משפט נכון (הכל או כלום).

---

### 7.10 GROUPS (קבוצות / Connections)

**UI:** לבבות (חיים) + קבוצות שנפתרו למעלה + גריד 4 עמודות של כל הפריטים

**אינטראקציה:**
1. בחירת 4 פריטים (הדגשה טורקיז)
2. "בדקו (X/4)" → בדיקה
3. נכון = הקבוצה מופיעה למעלה (צבע ייחודי) + פריטים נמחקים מהגריד
4. לא נכון = shake + הפסד חיים
5. 0 חיים = game over, כל הקבוצות נחשפות
6. 4 חיים בהתחלה

**4 צבעי קבוצות:** תכלת, ורוד, כתום, כחול

**ניקוד:** +1 לכל קבוצה שזוהתה.

---

### 7.11 HANGMAN (נחשו את המילה)

**UI:** אמוג'י פנים (משתנה) + נקודות חיים (6) + מילה עם קווים + רמז + מקלדת עברית

**אמוג'י לפי שלב:** 🙂 → 😐 → 😟 → 😰 → 😱 → 💀

**מקלדת עברית:**
```
א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת
```

**אינטראקציה:**
1. לחיצה על אות → בדיקה
2. נמצאה = ירוק + חשיפת כל המופעים
3. לא נמצאה = אדום + הפסד חיים
4. ניצחון = כל האותיות נחשפו
5. הפסד = 6 טעויות → חשיפת המילה

**ניקוד:** +1 לכל מילה שנוחשה. רווחים נחשפים אוטומטית.

---

### 7.12 MILLIONAIRE (מיליונר)

**UI:** שאלה (שמאל) + סולם כסף (ימין, 15 שלבים). כפתור 50:50.

**סולם כסף:**
```
₪1,000,000 | ₪500,000 | ₪250,000 | ₪125,000 | ₪64,000 | ₪32,000 |
₪16,000 | ₪8,000 | ₪4,000 | ₪2,000 | ₪1,000 | ₪500 | ₪300 | ₪200 | ₪100
```

**נקודות ביטחון:** שלב 5 (₪1,000) + שלב 10 (₪32,000)

**50:50:** פעם אחת – מסיר 2 תשובות שגויות

**אינטראקציה:**
1. תשובה נכונה = עלייה בסולם
2. תשובה שגויה = נפילה לנקודת ביטחון האחרונה
3. שאלות לא מעורבבות (סדר קושי עולה!)

**ניקוד:** מוצג כסכום כסף (₪), לא אחוזים.
- ₪1,000,000 = "מיליונר! ענקי!" 👑
- 70%+ = "כל הכבוד! הרווחתם יפה!" 💰
- 50%+ = "לא רע! אפשר לשפר!" 💵
- מתחת = "כדאי לחזור על החומר" 📖

---

## 8. מסך ציונים (משותף לכל המשחקים)

```
┌─────────────────────────────────┐
│         [emoji גדול]             │
│         [85%]                    │
│         מתוך 100                 │
│  ┌─────────────────────────────┐│
│  │ כל הכבוד! ביצוע טוב מאוד!  ││
│  └─────────────────────────────┘│
│                                  │
│  [8 ✓]    [2 ✗]    [10 סה"כ]   │
│  נכונות    שגויות    שאלות      │
│                                  │
│  [📤 שלחו תוצאות למורה]         │
│  [🔄 שחקו שוב]                  │
└─────────────────────────────────┘
```

**רמות ציון:**
- 90%+ → 🌟 "מצוין! שליטה מעולה!" (רקע ירוק)
- 70%+ → 👏 "כל הכבוד! ביצוע טוב מאוד!" (רקע תכלת)
- 50%+ → 💪 "אפשר לשפר – נסו שוב!" (רקע צהוב)
- מתחת → 📖 "כדאי לחזור על החומר" (רקע ורוד)

---

## 9. Google Sheets Integration

**URL:** `https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec`

### שמירת משחק (Publish)
```javascript
POST → body: JSON.stringify({
  action: 'saveGame',
  id: gameId,              // random ID: Math.random().toString(36).substring(2,10) + Date.now().toString(36).slice(-4)
  name: gameName,
  gameType: gameType,
  subject: subject,
  grade: grade,
  teacher: userName,
  email: userEmail,
  gameJSON: JSON.stringify(gameConfig)  // כל הנתונים של המשחק
})
// mode: 'no-cors'
```

### טעינת משחק (Player) – JSONP
```javascript
// יצירת tag script עם callback
const callbackName = 'gameCallback_' + Date.now();
window[callbackName] = function(data) {
  gameConfig = JSON.parse(data.gameJSON);
  // ... התחלת משחק
};
const script = document.createElement('script');
script.src = SHEETS_URL + '?action=getGame&id=' + gameId + '&callback=' + callbackName;
document.body.appendChild(script);
// timeout: 15 שניות
```

### שליחת ציונים
```javascript
// JSONP (GET via script tag)
const params = new URLSearchParams({
  action: 'submit',
  quizName: sheetName,        // "{gameName} – {grade}"
  studentName: studentName,
  classroom: studentClass,
  score: percentage,
  totalQuestions: totalItems,
  correctAnswers: correctItems,
  level: '',
  teacherEmail: teacherEmail
});
const s = document.createElement('script');
s.src = SHEETS_URL + '?' + params.toString();
document.body.appendChild(s);
```

---

## 10. מסך כניסה (Player)

```
┌─────────────────────────────────┐
│  [emoji מקצוע]                   │
│  משחק – [שם המשחק]              │
│  [מקצוע] | [כיתה] | אורט       │
│  ┌─────────┐                     │
│  │ 🎯 טריוויה │  ← badge סוג   │
│  └─────────┘                     │
│                                  │
│  שם: [______________]            │
│  כיתה: [ט1 ▼]                   │
│                                  │
│  [🎮 התחילו לשחק!]              │
└─────────────────────────────────┘
```

כיתות נגזרות מהגדרת הכיתה:
- כיתה ט → ט1, ט2, ט3, ט4
- כיתה י → י1, י2, י3, י4
- כיתה יא → יא1, יא2, יא3
- כיתה יב → יב1, יב2, יב3

---

## 11. CSS Theme

```css
:root {
  --bg: #F0F4F8;
  --card: #ffffff;
  --primary: #2A9D8F;
  --primary-l: #D4F3EF;
  --primary-d: #1a7a6d;
  --secondary: #E76F7A;
  --sec-l: #FDE8EA;
  --green: #52B788;
  --green-l: #D8F3DC;
  --blue: #4A90D9;
  --blue-l: #DBEAFE;
  --accent: #E9A319;
  --accent-l: #FEF3C7;
  --dark: #1E293B;
  --gray: #64748B;
  --gray-l: #94A3B8;
  --border: rgba(0,0,0,.06);
  --shadow: 0 2px 20px -4px rgba(0,0,0,.06);
  --shadow-md: 0 8px 28px rgba(0,0,0,.07);
  --r: 20px;
}
```

**Fonts:** Heebo (body) + Rubik (headings/numbers)

---

## 12. אנימציות

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes popIn { 0%{transform:scale(0)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes celebrate { 0%{transform:scale(1)} 25%{transform:scale(1.1) rotate(-3deg)} 50%{transform:scale(1.15) rotate(3deg)} 75%{transform:scale(1.1) rotate(-2deg)} 100%{transform:scale(1)} }
```

---

## 13. Helper Functions

```javascript
// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// HTML escape
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

---

## 14. Authentication

**Login פשוט (בלי OAuth):**
```
שם: [______________]
אימייל: [__________]
[כניסה]
```
נשמר ב-localStorage (`ort-game-user`). Auto-login בביקור חוזר.

---

## 15. Draft System

- Auto-save ל-localStorage (`ort-game-builder-draft`) בכל מעבר שלב
- באנר "יש לכם טיוטה" בכניסה חוזרת
- כפתורי "שחזר" / "התחל מחדש"

---

## 16. Responsive (Mobile)

- Matching: עמודות מוערמות (stack) במקום side-by-side
- Memory: 3 עמודות במקום 4
- Millionaire: סולם כסף מתחת לשאלה (column-reverse)
- Groups: גריד 4 עמודות נשמר, פונט קטן יותר
- Hangman: מקשים קטנים יותר (34px)
- Wheel: canvas קטן יותר (280px)
