# Brief ל-Lovable: מחולל מערך שיעור מופלא

## החזון
מחולל אחד שבו המורה כותבת **נושא + מקצוע + כיתה + רמה** → ו-AI מייצר **מערך שיעור מלא** – מצגת, פעילויות פתיחה, שאלון, משחק וסרטון סיכום. הכל אוטומטי, הכל בעברית, הכל מותאם לתלמידי תיכון מקצועי.

---

## 1. זרימת המשתמש (UX Flow)

```
דף הבית / תפריט
     ↓
"מחולל מערך שיעור" (כפתור בולט)
     ↓
┌──────────────────────────────────┐
│  שלב 1: קלט                     │
│  ┌──────────────────────────┐    │
│  │ נושא: [בניין התפעל    ] │    │
│  │ מקצוע: [עברית ▼        ] │    │
│  │ כיתה:  [ט ▼            ] │    │
│  │ רמה:   [רגיל ▼         ] │    │
│  └──────────────────────────┘    │
│                                  │
│  [✨ צור מערך שיעור]             │
└──────────────────────────────────┘
     ↓  (AI עובד 30-60 שניות)
     ↓  (מסך טעינה עם אנימציה)
     ↓
┌──────────────────────────────────┐
│  שלב 2: תצוגה + עריכה          │
│                                  │
│  📊 מצגת | 🎯 פתיחה | 📝 שאלון │
│  🎮 משחק | 🎬 סרטון             │
│  ──────────────────────────      │
│  [תוכן הלשונית הנבחרת]          │
│  [כפתור עריכה בכל לשונית]       │
│                                  │
│  [📥 הורד הכל] [☁️ פרסם] [📱 QR]│
└──────────────────────────────────┘
```

---

## 2. קלט המורה

| שדה | סוג | חובה | דוגמה |
|-----|------|------|-------|
| נושא | text | כן | "בניין התפעל" |
| מקצוע | select | כן | עברית / מתמטיקה / היסטוריה / אזרחות / תנ"ך / אנגלית / ספרות / מדעים / תספורת / אחר |
| כיתה | select | כן | ט / י / יא / יב |
| רמה | select | לא | בסיסי / רגיל / מתקדם (ברירת מחדל: רגיל) |

**זה הכל.** AI עושה את השאר.

---

## 3. מה ה-AI מייצר (5 רכיבים)

### 3.1 מצגת (Presentation)

**JSON Schema:**
```json
{
  "presentation": {
    "title": "בניין התפעל",
    "slides": [
      {
        "type": "title",
        "title": "בניין התפעל",
        "subtitle": "עברית – כיתה ט׳",
        "emoji": "📝"
      },
      {
        "type": "intro",
        "title": "מה נלמד היום?",
        "points": ["מה זה בניין התפעל", "איך מזהים אותו", "דוגמאות מחיי היום-יום"]
      },
      {
        "type": "content",
        "title": "מה זה בניין התפעל?",
        "points": ["פועל שהפעולה חוזרת לעושה אותה", "תמיד מתחיל ב-הִתְ...", "דוגמה: הִתְרַחֵץ = רחץ את עצמו"],
        "highlight": "הִתְ... = הסימן של התפעל!"
      },
      {
        "type": "question",
        "question": "איזה פועל שייך לבניין התפעל?",
        "options": ["כתב", "התלבש", "הלביש", "לבש"],
        "correctIndex": 1,
        "explanation": "התלבש = לבש את עצמו → פועל חוזר = התפעל"
      },
      {
        "type": "summary",
        "title": "סיכום",
        "points": ["התפעל = פעולה שחוזרת לעושה", "סימן: הִתְ... בהתחלה", "דוגמאות: התרחץ, התלבש, התעורר"]
      }
    ]
  }
}
```

**כללים למצגת:**
- 8-14 שקפים
- שקף אחד = רעיון אחד
- מקסימום 4 נקודות בשקף
- משפטים קצרים (עד 10 מילים)
- שאלת הבנה אחרי כל 2-3 שקפי תוכן
- שקף סיכום בסוף (3 רעיונות מרכזיים)

---

### 3.2 פעילויות פתיחה (Openers)

**JSON Schema:**
```json
{
  "openers": [
    {
      "type": "riddle",
      "icon": "🔍",
      "name": "חידה – גלו את הבניין!",
      "time": 3,
      "teacherNote": "חשפו רמז אחד בכל פעם...",
      "data": {
        "question": "מי אני?",
        "hints": ["תמיד מתחיל ב-הִתְ...", "הפעולה חוזרת לעושה אותה", "דוגמה: התרחץ, התלבש"],
        "answer": "בניין התפעל!"
      }
    },
    {
      "type": "vote",
      "icon": "📊",
      "name": "סקר כיתתי",
      "time": 3,
      "shared": true,
      "teacherNote": "הקרינו על המסך...",
      "data": {
        "question": "איזה משפט משתמש בהתפעל?",
        "options": ["הילד לבש חולצה", "הילד התלבש לבד", "אמא הלבישה את הילד", "הילד לובש חולצה"]
      }
    },
    {
      "type": "wordcloud",
      "icon": "☁️",
      "name": "ענן מילים",
      "time": 3,
      "shared": true,
      "teacherNote": "כל תלמיד כותב פועל אחד...",
      "data": {
        "prompt": "כתבו פועל אחד בבניין התפעל!"
      }
    }
  ]
}
```

**12 סוגי פעילויות אפשריים:**
| סוג | type | שיתוף QR | תיאור |
|-----|------|----------|-------|
| שאלה מעוררת חשיבה | `question` | לא | שאלה + טיימר + רמז + תשובה |
| סיפור/עובדה מפתיעה | `story` | לא | טקסט + שאלה לדיון |
| הצבעה/סקר כיתתי | `vote` | **כן** | כפתורי הצבעה + גרף |
| חידה/ניחוש | `riddle` | לא | רמזים מתגלים |
| נכון/לא נכון | `truefalse` | לא | כרטיסים מתהפכים |
| מה היית עושה? | `dilemma` | **כן** | דילמה + הצבעה |
| תמונה מדברת | `image` | לא | אמוג׳י + שאלה |
| ענן מילים | `wordcloud` | **כן** | קלט + ענן |
| גלגל מזל | `wheel` | לא | הגרלה מרשימה |
| השלמת משפט | `fillblank` | לא | מילה חסרה |
| ניחוש מספר | `guessnumber` | **כן** | כמה לדעתכם? |
| שני אמתות ושקר | `twotruths` | לא | 3 טענות – מצאו השקר |

**AI בוחר אוטומטית 3 פעילויות** – לפחות אחת עם שיתוף ואחת אישית.

---

### 3.3 שאלון דיפרנציאלי (Quiz)

**JSON Schema:**
```json
{
  "quiz": {
    "diagnosticQuestions": [
      {
        "text": "מהו בניין התפעל?",
        "options": ["בניין שמתאר פעולה שחוזרת לעושה", "בניין שמתאר ציווי", "בניין שמתאר עבר", "בניין שמתאר עתיד"],
        "correctIndex": 0,
        "explanation": "בניין התפעל = הפעולה חוזרת לעושה אותה"
      },
      {
        "text": "איזה פועל בבניין התפעל?",
        "options": ["כתב", "התרחץ", "הרחיץ", "רוחץ"],
        "correctIndex": 1,
        "explanation": "התרחץ = רחץ את עצמו"
      }
    ],
    "questionSets": {
      "basic": [
        {
          "text": "שאלה ברמה בסיסית...",
          "options": ["א", "ב", "ג", "ד"],
          "correctIndex": 2,
          "explanation": "הסבר..."
        }
      ],
      "medium": [],
      "advanced": []
    }
  }
}
```

**כללים לשאלון:**
- 2 שאלות אבחון (מוסתר מהתלמיד)
- 0 נכונות → רמה בסיסית, 1 → בינונית, 2 → מתקדמת
- 8 שאלות בכל רמה
- תשובה נכונה = אחרת בכל שאלה (לא תמיד A!)
- משוב מיידי אחרי כל שאלה
- ניקוד + שליחה ל-Google Sheets

**Google Sheets endpoint:**
```
POST https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
```

---

### 3.4 משחק לימודי (Game)

**JSON Schema:**
```json
{
  "game": {
    "type": "trivia",
    "name": "טריוויה – בניין התפעל",
    "items": [
      {
        "text": "איזה פועל בבניין התפעל?",
        "options": ["כתב", "התלבש", "הלביש", "לבש"],
        "correct": 1,
        "explanation": "התלבש = לבש את עצמו"
      }
    ]
  }
}
```

**12 סוגי משחקים אפשריים:**
| סוג | type | תיאור |
|-----|------|-------|
| טריוויה | `trivia` | שאלות 4 תשובות |
| התאמה | `matching` | זוגות (מושג ↔ הגדרה) |
| סדר נכון | `ordering` | סדרו פריטים |
| חדר בריחה | `escape` | חידות שלב אחרי שלב |
| זיכרון | `memory` | כרטיסים מתהפכים |
| גלגל המזל | `wheel` | שאלה אקראית |
| נכון/לא נכון | `truefalse` | טענות |
| השלמת חסר | `fillblank` | מילה חסרה |
| סדר משפט | `sentence` | סדרו מילים |
| קבוצות | `groups` | מיון ל-4 קטגוריות |
| נחשו מילה | `hangman` | אות-אות |
| מיליונר | `millionaire` | רמת קושי עולה |

**AI בוחר סוג משחק מתאים לנושא** (או המורה יכולה לבחור).

---

### 3.5 סרטון סיכום (Video Summary)

**JSON Schema:**
```json
{
  "video": {
    "title": "בניין התפעל ב-60 שניות",
    "frames": [
      {
        "duration": 5,
        "title": "מה זה התפעל?",
        "content": "פעולה שחוזרת לעושה",
        "emoji": "🔄",
        "animation": "fadeUp"
      },
      {
        "duration": 5,
        "title": "הסימן",
        "content": "תמיד מתחיל ב-הִתְ...",
        "emoji": "🔑",
        "animation": "scaleIn"
      }
    ],
    "totalDuration": 60
  }
}
```

**כללים לסרטון:**
- 8-12 פריימים
- כל פריים = 4-8 שניות
- סה"כ ~60 שניות
- אנימציות: fadeUp, scaleIn, slideRight
- auto-play עם אפשרות להקלטת מסך

---

## 4. ה-Prompt ל-AI

### Prompt מרכזי (לשלוח ל-AI)

```
אתה מומחה פדגוגי בבית ספר תיכון מקצועי בישראל (אורט בית הערבה).
צור מערך שיעור מלא על הנושא שניתן לך.

קהל יעד: תלמידי תיכון מקצועי כיתה {grade} עם קשיי קשב וריכוז ולקויות למידה.

כללים מחייבים:
- שפה פשוטה וברורה
- משפטים קצרים (עד 10 מילים)
- הרבה דוגמאות מחיי היום-יום
- חלוקה למנות ידע קטנות
- לא לכתוב "כמובן", "בואו", "חשוב לציין" או מילות מילוי
- תשובות נכונות בשאלון: correctIndex שונה בכל שאלה (לא תמיד 0!)
- הכל בעברית

נושא: {topic}
מקצוע: {subject}
כיתה: {grade}
רמה: {level}

צור JSON עם 5 חלקים:
1. presentation – מצגת 10-14 שקפים
2. openers – 3 פעילויות פתיחה (סוגים שונים)
3. quiz – שאלון דיפרנציאלי (2 אבחון + 8 בכל רמה)
4. game – משחק לימודי (בחר סוג מתאים)
5. video – סרטון סיכום 60 שניות (10 פריימים)

{JSON schemas from above}
```

---

## 5. Backend – Google Sheets Integration

### Endpoints קיימים (כבר עובדים)

| Endpoint | פעולה | שימוש |
|----------|-------|-------|
| `POST saveQuiz` | שמירת שאלון | מחולל שאלונים |
| `GET getQuiz` | טעינת שאלון (JSONP) | דף תלמידים |
| `POST saveGame` | שמירת משחק | מחולל משחקים |
| `GET getGame` | טעינת משחק (JSONP) | נגן משחקים |

### Endpoints חדשים (צריך להוסיף)

| Endpoint | פעולה | שימוש |
|----------|-------|-------|
| `POST saveOpener` | שמירת פעילות פתיחה | מחולל פעילויות |
| `GET getOpener` | טעינת פעילות (JSONP) | דף תלמידים |
| `POST openerVote` | שמירת הצבעה | תלמיד מצביע |
| `POST openerWord` | שמירת מילה | ענן מילים |
| `POST saveLesson` | שמירת מערך שלם | מחולל מערך שיעור |
| `GET getLesson` | טעינת מערך (JSONP) | צפייה/שיתוף |

### URL של ה-Apps Script:
```
https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
```

### Spreadsheet ID:
```
1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw
```

---

## 6. UI/UX Spec

### ניווט
- נתיב: `/generators/lesson-builder`
- כפתור בולט בדף הבית ובעמוד הגנרטורים

### מסך קלט
- 4 שדות בלבד (נושא, מקצוע, כיתה, רמה)
- כפתור "✨ צור מערך שיעור" בולט
- הסבר קצר: "הזינו נושא ו-AI יכין הכל – מצגת, משחק, שאלון, פתיחה וסרטון"

### מסך טעינה (30-60 שניות)
- אנימציה של progress bar
- הודעות משתנות: "יוצר מצגת...", "בונה שאלון...", "מייצר משחק...", "מכין סרטון..."
- לא לתת להרגיש שנתקע – תמיד אנימציה

### מסך תוצאה
- 5 לשוניות (מצגת / פתיחה / שאלון / משחק / סרטון)
- בכל לשונית:
  - תצוגה מקדימה אינטראקטיבית
  - כפתור "✏️ ערוך" – פותח מודאל עריכה
  - כפתור "📥 הורד HTML"
  - כפתור "☁️ פרסם" (שומר ב-Google Sheets + נותן קישור)
- כפתורים גלובליים:
  - "📥 הורד הכל כ-ZIP"
  - "☁️ פרסם הכל"
  - "📱 QR לשיתוף"

### עיצוב
- להמשיך את הסגנון הקיים של Lovable (glass cards, gradients)
- צבעים: ORT theme (תכלת #2A9D8F, טורקיז, ירוק #52B788)
- RTL מלא
- רספונסיבי (מובייל + דסקטופ)

---

## 7. סיכום טכני

### Lovable צריך:
1. **דף חדש**: `LessonBuilderPage.tsx` עם route `/generators/lesson-builder`
2. **קריאת AI**: Supabase Edge Function (או ישירות מהקליינט) שקוראת ל-Gemini/OpenAI
3. **רנדור 5 רכיבים**: כל אחד עם תצוגה מקדימה + עריכה + הורדה + פרסום
4. **Google Sheets**: POST/GET ל-endpoint הקיים (CORS-free via no-cors)
5. **QR Code**: ספרייה כמו `qrcode.react`

### מה לא צריך:
- לא צריך authentication
- לא צריך database (Google Sheets = ה-DB)
- לא צריך file upload (הכל מ-AI)
- לא צריך routing מסובך (דף אחד עם לשוניות)

---

## 8. דוגמת פלט מלאה

**קלט:** נושא="בניין התפעל", מקצוע="עברית", כיתה="ט", רמה="רגיל"

**פלט מצופה:** ראו את הקבצים הקיימים כדוגמה:
- מצגת: `docs/presentations/` (כל index.html)
- פעילויות פתיחה: `docs/openers/hebrew-hitpael/index.html`
- שאלון: `docs/quizzes/` (כל index.html)
- משחק: נוצר דרך `docs/game-builder/`
- סרטון: `docs/videos/` (כל index.html)

---

## 9. קוד מקור – מחולל פעילויות פתיחה (Opener Builder)

### 9.1 הגדרת 12 סוגי פעילויות

```javascript
const TYPES = {
  question:   { icon: '🤔', name: 'שאלה מעוררת חשיבה', desc: 'שאלה + טיימר + רמז', shared: false },
  story:      { icon: '📖', name: 'סיפור / עובדה מפתיעה', desc: 'טקסט + שאלה לדיון', shared: false },
  vote:       { icon: '📊', name: 'הצבעה / סקר כיתתי', desc: 'הצבעה + גרף בזמן אמת', shared: true },
  riddle:     { icon: '🔍', name: 'חידה / ניחוש', desc: 'רמזים מתגלים', shared: false },
  truefalse:  { icon: '✅', name: 'נכון / לא נכון', desc: 'כרטיסים מתהפכים', shared: false },
  dilemma:    { icon: '🎭', name: 'מה היית עושה?', desc: 'דילמה + הצבעה', shared: true },
  image:      { icon: '🖼️', name: 'תמונה מדברת', desc: 'ויזואל + שאלה', shared: false },
  wordcloud:  { icon: '☁️', name: 'מילה אחת (ענן מילים)', desc: 'ענן מילים כיתתי', shared: true },
  wheel:      { icon: '🎲', name: 'גלגל מזל / הגרלה', desc: 'בחירה אקראית מרשימה', shared: false },
  fillblank:  { icon: '🧩', name: 'השלמת משפט', desc: 'מילה חסרה להשלמה', shared: false },
  guessnumber:{ icon: '🏆', name: 'ניחוש מספר', desc: 'כמה לדעתכם? הקרוב מנצח', shared: true },
  twotruths:  { icon: '💬', name: 'שני אמתות ושקר', desc: '3 טענות – מצאו את השקר', shared: false }
};
```

### 9.2 מבנה DATA לכל סוג פעילות

AI צריך לייצר JSON עם שדות ה-`data` הבאים לכל סוג:

| סוג | שדות data |
|-----|-----------|
| `question` | `{ text, hint, answer }` |
| `story` | `{ text, discussionQuestion }` |
| `vote` | `{ question, options: ["א","ב","ג","ד"] }` |
| `riddle` | `{ question, hints: ["רמז1","רמז2","רמז3"], answer }` |
| `truefalse` | `{ statements: [{ text, isTrue, explanation }] }` (3-4 טענות) |
| `dilemma` | `{ scenario, options: [{ text, result }] }` (2-3 אפשרויות) |
| `image` | `{ emoji, question }` |
| `wordcloud` | `{ prompt }` |
| `wheel` | `{ question, items: ["פריט1","פריט2",...] }` (6-10 פריטים) |
| `fillblank` | `{ sentence, answer, options: ["מסיח1","מסיח2"] }` |
| `guessnumber` | `{ question, answer: 42, unit: "ק"מ" }` |
| `twotruths` | `{ statements: [{ text, isLie }] }` (3 טענות, 1 שקר) |

### 9.3 פונקציית יצירת HTML לפעילות בודדת

כל פעילות מתורגמת ל-HTML אינטראקטיבי עצמאי. דוגמאות מפתח:

**הצבעה / סקר (vote):**
```javascript
// HTML: שאלה + 4 כפתורי הצבעה צבעוניים + גרף עמודות
// JS:
var voteData = {};
function doVote(actIdx, optIdx) {
  if (!voteData[actIdx]) voteData[actIdx] = {};
  voteData[actIdx][optIdx] = (voteData[actIdx][optIdx] || 0) + 1;
  // מעדכן רוחב עמודות לפי אחוזים
  var total = 0;
  Object.values(voteData[actIdx]).forEach(v => total += v);
  Object.keys(voteData[actIdx]).forEach(k => {
    var bar = document.getElementById('vbar_' + actIdx + '_' + k);
    if (bar) {
      var pct = Math.round((voteData[actIdx][k] / total) * 100);
      bar.style.width = pct + '%';
      bar.querySelector('span').textContent = voteData[actIdx][k];
    }
  });
}
```

**חידה / ניחוש (riddle):**
```javascript
// HTML: שאלה + 3-4 כרטיסי רמז מוסתרים + כפתור "גלה תשובה"
// JS: גילוי רמזים אחד אחד בלחיצה
function revealRiddleHint(actIdx, hintIdx) {
  // מגלה רמז רק אם הקודם כבר נחשף
  if (hintIdx > riddleState[actIdx].revealed) return;
  el.classList.add('revealed');
  el.innerHTML = '<span class="hint-num">' + (hintIdx+1) + '</span><span>' + hints[hintIdx] + '</span>';
  riddleState[actIdx].revealed = hintIdx + 1;
  // מציג כפתור "גלה תשובה" אחרי שכל הרמזים נחשפו
  if (riddleState[actIdx].revealed >= hints.length) {
    document.getElementById('rbtn_' + actIdx).style.display = 'inline-flex';
  }
}
```

**ענן מילים (wordcloud):**
```javascript
// HTML: שדה קלט + כפתור "הוסף" + אזור ענן
// JS: ספירת תדירות מילים → גודל פונט משתנה
var wcData = {};
function addWC(actIdx) {
  var word = input.value.trim();
  wcData[actIdx][word] = (wcData[actIdx][word] || 0) + 1;
  renderWC(actIdx);
}
function renderWC(actIdx) {
  // מילים חוזרות = פונט גדול יותר
  // 4 רמות: s1=0.9rem, s2=1.2rem, s3=1.6rem, s4=2.2rem
  // 8 צבעי gradient מסתובבים
}
```

**גלגל מזל (wheel):**
```javascript
// HTML: Canvas 320x320 + כפתור "סובב!"
// JS: ציור pie chart צבעוני על Canvas + אנימציית סיבוב
function spinWheel(idx) {
  var spins = 3 + Math.random() * 3; // 3-6 סיבובים
  var duration = 3000; // 3 שניות
  // cubic ease-out animation
  var eased = 1 - Math.pow(1 - progress, 3);
  // חישוב תוצאה לפי זווית הסיום
}
```

**נכון/לא נכון (truefalse):**
```javascript
// HTML: כרטיסים מתהפכים (flip card) עם CSS 3D transform
function flipTF(actIdx, stmtIdx) {
  card.classList.add('flipped');
  card.classList.add(isTrue ? 'correct' : 'wrong');
  // ירוק = נכון, אדום = לא נכון
}
```

**ניחוש מספר (guessnumber):**
```javascript
// 4 רמות משוב לפי אחוז הפרש:
// 0% = מדויק (ירוק), <10% = כמעט (ירוק), <30% = לא רע (כתום), >30% = רחוק (אדום)
function guessNumber(idx, correct, unit) {
  var diff = Math.abs(guess - correct);
  var pct = (diff / Math.abs(correct)) * 100;
  // מציג משוב עם gradient מתאים
}
```

### 9.4 מבנה ה-HTML הסופי (לשוניות)

```html
<!-- כל פעילות = לשונית נפרדת -->
<div class="tabs">
  <button class="tab active" onclick="switchTab(0)">🔍 חידה</button>
  <button class="tab" onclick="switchTab(1)">📊 סקר</button>
  <button class="tab" onclick="switchTab(2)">☁️ ענן מילים</button>
</div>

<!-- פאנלים -->
<div class="panel active" id="panel_0">[תוכן חידה]</div>
<div class="panel" id="panel_1">[תוכן סקר]</div>
<div class="panel" id="panel_2">[תוכן ענן מילים]</div>

<!-- כל פאנל כולל: -->
<!-- 1. הנחיה למורה (מוסתרת) -->
<!-- 2. תוכן אינטראקטיבי -->
<!-- 3. כפתורי "הנחיה למורה" + "מסך מלא" -->
```

### 9.5 פרסום ושיתוף

```javascript
async function publishOpener() {
  const openerId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
  const openerJSON = JSON.stringify({ activities, types: selectedTypes });

  await fetch(SHEETS_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'saveOpener',
      id: openerId,
      name: details.name,
      subject: details.subject,
      grade: details.grade,
      teacher: user.name,
      email: user.email,
      openerJSON: openerJSON
    })
  });

  // יצירת קישור + QR
  const url = PLAYER_BASE_URL + '?id=' + openerId;
  QRCode.toCanvas(canvas, url, { width: 200, margin: 2 });
}
```

---

## 10. קוד מקור – מחולל משחקים (Game Builder)

### 10.1 הגדרת 12 סוגי משחקים

```javascript
const GT = {
  trivia:    { name:'טריוויה',         icon:'🎯', desc:'שאלות עם 4 תשובות',       min:3, max:20, def:8,  label:'שאלות' },
  matching:  { name:'התאמה',           icon:'🔗', desc:'חיבור בין זוגות',          min:4, max:15, def:8,  label:'זוגות' },
  ordering:  { name:'סדר נכון',        icon:'📋', desc:'סידור בסדר הנכון',         min:3, max:12, def:6,  label:'פריטים' },
  escape:    { name:'חדר בריחה',       icon:'🔐', desc:'פתרו חידות כדי לברוח',    min:3, max:8,  def:5,  label:'חדרים' },
  memory:    { name:'זיכרון',          icon:'🧠', desc:'מצאו זוגות תואמים',       min:4, max:12, def:6,  label:'זוגות' },
  wheel:     { name:'גלגל המזל',       icon:'🎡', desc:'סובבו וענו על שאלות',     min:4, max:15, def:8,  label:'שאלות' },
  truefalse: { name:'נכון / לא נכון', icon:'✅', desc:'האם המשפט נכון?',          min:5, max:20, def:10, label:'משפטים' },
  fillblank: { name:'השלמת חסר',       icon:'✏️', desc:'מלאו את המילה החסרה',     min:3, max:15, def:8,  label:'משפטים' },
  sentence:  { name:'סדר את המשפט',   icon:'🔤', desc:'סדרו מילים למשפט',        min:3, max:10, def:6,  label:'משפטים' },
  groups:    { name:'קבוצות',          icon:'🎨', desc:'מיינו פריטים לקבוצות',    min:3, max:5,  def:4,  label:'קבוצות' },
  hangman:   { name:'נחשו את המילה',   icon:'🔮', desc:'נחשו אות אחרי אות',      min:3, max:15, def:8,  label:'מילים' },
  millionaire:{ name:'מיליונר',        icon:'💰', desc:'ענו נכון, התקדמו לפרס',   min:5, max:15, def:10, label:'שאלות' }
};
```

### 10.2 מבנה item לכל סוג משחק

| סוג | שדות item |
|-----|-----------|
| `trivia` | `{ text, options: [4], correct: 0-3, explanation }` |
| `matching` | `{ right: "מושג", left: "הגדרה" }` |
| `ordering` | `{ text: "פריט" }` (הסדר = מיקום במערך) |
| `escape` | `{ title, story, riddle, answer, hint }` |
| `memory` | `{ front: "מושג", back: "הגדרה" }` |
| `wheel` | `{ text, options: [4], correct: 0-3 }` |
| `truefalse` | `{ text, correct: true/false, explanation }` |
| `fillblank` | `{ sentence: "___", answer, hint }` |
| `sentence` | `{ sentence: "המילים בסדר הנכון" }` |
| `groups` | `{ name: "שם קבוצה", items: [4] }` |
| `hangman` | `{ word, hint }` |
| `millionaire` | `{ text, options: [4], correct: 0-3, explanation }` |

### 10.3 יצירת HTML למשחק (generatePlayerHTML)

הפונקציה מקבלת config ומחזירה HTML עצמאי מלא:

```javascript
function generatePlayerHTML(cfg) {
  // cfg = { title, subject, grade, icon, gameConfig, sheetName, teacherEmail, ... }
  return `<!DOCTYPE html>
  <html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <style>/* CSS מלא עם ORT theme */</style>
  </head>
  <body>
    <!-- מסך כניסה: שם + כיתה -->
    <div id="introScreen">...</div>

    <!-- מסך משחק: תוכן דינמי לפי סוג -->
    <div id="gameScreen">...</div>

    <!-- מסך ציון: ניקוד + כפתור שליחה -->
    <div id="scoreScreen">...</div>

    <script>
      const gameConfig = ${cfg.gameConfig};
      const SHEETS_URL = '...';
      // לוגיקת המשחק מוטמעת מלאה
      // כולל: shuffle, scoring, Google Sheets submit
    </script>
  </body></html>`;
}
```

### 10.4 פרסום משחק

```javascript
async function publishGame() {
  const gameId = generateGameId();
  const gameJSON = JSON.stringify({
    gameType, items,
    settings: { shuffleItems: true },
    columnRightTitle: details.columnRightTitle || 'מושג',
    columnLeftTitle: details.columnLeftTitle || 'הגדרה',
    instruction: details.instruction || 'סדרו את הפריטים'
  });

  await fetch(SHEETS_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'saveGame',
      id: gameId, name: details.gameName,
      gameType, subject: details.subject,
      grade: details.grade,
      teacher: user.name, email: user.email,
      gameJSON
    })
  });

  // 2 שניות המתנה לשמירה → הצגת קישור
  const url = PLAYER_BASE_URL + '?id=' + gameId;
}
```

---

## 11. קוד מקור – מחולל שאלונים (Quiz Builder)

### 11.1 מודל נתונים

```javascript
let diagnosticQuestions = [];  // 2 שאלות אבחון
let questionSets = {
  basic: [],      // 8 שאלות רמה בסיסית
  medium: [],     // 8 שאלות רמה בינונית
  advanced: []    // 8 שאלות רמה מתקדמת
};

// כל שאלה:
{
  text: "טקסט השאלה",
  options: ["א", "ב", "ג", "ד"],
  correct: 0-3,           // אינדקס תשובה נכונה (חייב להיות שונה בכל שאלה!)
  explanation: "הסבר קצר"
}
```

### 11.2 לוגיקת אבחון דיפרנציאלי (הלב של השאלון!)

```javascript
// שלב 1: התלמיד עונה על 2 שאלות אבחון (לא יודע שזה אבחון)
// שלב 2: לפי מספר התשובות הנכונות → ניתוב לרמה

if (currentQ === diagnosticQuestions.length - 1) {
  if (diagnosticCorrect === 0) {
    detectedLevel = 'בסיסי';
    activeQuestions = diagnosticQuestions.concat(basicQuestions);
  } else if (diagnosticCorrect === 1) {
    detectedLevel = 'בינוני';
    activeQuestions = diagnosticQuestions.concat(mediumQuestions);
  } else {  // diagnosticCorrect === 2
    detectedLevel = 'מתקדם';
    activeQuestions = diagnosticQuestions.concat(advancedQuestions);
  }
  totalQuestions = activeQuestions.length;
}

// חשוב: התלמיד לא רואה את הרמה שזוהתה!
// רק המורה רואה בגוגל שיטס
```

### 11.3 יצירת HTML לשאלון

```javascript
function generateQuizHTML() {
  return `<!DOCTYPE html>
  <html lang="he" dir="rtl">
  <head>...</head>
  <body>
    <!-- 3 מסכים: intro, questionScreen, scoreScreen -->
    <script>
      // נתוני השאלון מוטמעים ישירות:
      const diagnosticQuestions = ${JSON.stringify(diag)};
      const basicQuestions = ${JSON.stringify(sets.basic)};
      const mediumQuestions = ${JSON.stringify(sets.medium)};
      const advancedQuestions = ${JSON.stringify(sets.advanced)};

      // לוגיקת אבחון + ניתוב + ניקוד + משוב
    </script>
  </body></html>`;
}
```

### 11.4 שליחת ציונים לגוגל שיטס

```javascript
function sendResults() {
  var p = Math.round(score / totalQuestions * 100);
  var params = new URLSearchParams({
    action: 'submit',
    quizName: sheetName,          // יוצר טאב נפרד בשיט
    studentName: studentName,
    classroom: studentClass,
    score: p,                      // אחוז 0-100
    totalQuestions: totalQuestions,
    correctAnswers: score,
    level: detectedLevel,          // מוסתר מהתלמיד, נשלח למורה
    teacherEmail: teacherEmail     // מזהה את המורה
  });

  // שולח via JSONP (script tag) לעקוף CORS:
  var s = document.createElement('script');
  s.src = SHEETS_URL + '?' + params.toString();
  document.body.appendChild(s);
}
```

### 11.5 חוקי פיזור תשובות

**כלל ברזל: correctIndex חייב להיות שונה בכל שאלה!**

```
אם 8 שאלות:
Position 0 (א) → ~2 פעמים
Position 1 (ב) → ~2 פעמים
Position 2 (ג) → ~2 פעמים
Position 3 (ד) → ~2 פעמים

דוגמה: [1, 3, 1, 0, 2, 1, 2, 3]
אסור: [0, 0, 0, 1, 0, 0, 2, 0]  ← תמיד תשובה א'!
```

---

## 12. קוד מקור – Gemini AI Integration

### 12.1 Pattern משותף לכל המחוללים

```javascript
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function generateWithAI(topic, subject, grade, typeSpecificPrompt) {
  const apiKey = getGeminiKey(); // מ-localStorage או prompt

  const res = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',  // חשוב! מחזיר JSON ישירות
        temperature: 0.7  // 0.7 למשחקים, 0.8 לפעילויות פתיחה
      }
    })
  });

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

function getGeminiKey() {
  let key = localStorage.getItem('gemini_api_key');
  if (!key) {
    key = prompt('הזינו Gemini API Key:');
    if (key) localStorage.setItem('gemini_api_key', key);
  }
  return key;
}
```

### 12.2 Prompt Template (פעילויות פתיחה)

```
אתה מורה יצירתי בבית ספר תיכון מקצועי "אורט בית הערבה".
נושא: "${topic}"
מקצוע: ${subject}
כיתה: ${grade}

צור תוכן עבור הפעילויות הבאות:
- riddle: חידה / ניחוש
- vote: הצבעה / סקר כיתתי
- wordcloud: מילה אחת (ענן מילים)

כללים:
- שפה פשוטה וברורה, מתאימה לבני נוער עם קשיי קשב
- משפטים קצרים (עד 10 מילים)
- תוכן מעניין ומפתיע שיוצר סקרנות
- דוגמאות מחיי היום-יום

החזר JSON:
{ "activities": [{ type, data }] }
```

### 12.3 Prompt Template (משחקים)

```
אתה מורה מנוסה בבית ספר תיכון מקצועי "אורט בית הערבה".
נושא: "${topic}"
מקצוע: ${subject}
כיתה: ${grade}
הנחיות: שפה פשוטה וברורה, מתאימה לתלמידי תיכון עם קשיי קשב ולקויות למידה.

// ← כאן prompt ספציפי לסוג המשחק (trivia / matching / escape וכו')

החזר JSON:
{ "items": [...] }
```

---

## 13. CSS Theme – ORT Design System

```css
:root {
  --primary: #2A9D8F;        /* תכלת-טורקיז – צבע ראשי */
  --primary-light: #E0F5F1;  /* רקע בהיר */
  --primary-dark: #1E7A6E;   /* כהה יותר */
  --secondary: #E76F7A;      /* אדום רך – שגיאות */
  --accent: #52B788;         /* ירוק – הצלחה */
  --orange: #F4A261;         /* כתום – אזהרה */
  --dark: #1E293B;           /* טקסט כהה */
  --gray: #64748B;           /* טקסט משני */
  --light-gray: #F1F5F9;     /* רקע */
  --white: #FFFFFF;
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
  --radius: 16px;
}

/* פונטים */
font-family: 'Heebo', sans-serif;    /* טקסט רגיל */
font-family: 'Rubik', sans-serif;    /* כותרות */

/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Rubik:wght@400;500;700&display=swap');

/* אנימציות סטנדרטיות */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* כפתורים */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border-radius: 12px;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(42,157,143,0.3);
}
```

---

## 14. Google Sheets – Apps Script Reference

### קוד שצריך להוסיף ל-Apps Script (להעתקה ידנית)

**doPost handlers:**
```javascript
// שמירת מערך שיעור שלם
if (data.action === 'saveLesson') {
  var sheet = getOrCreateSheet('_lessonData', ['ID','שם','מקצוע','כיתה','מורה','מייל','תאריך','נתונים']);
  var row = [data.id, data.name, data.subject, data.grade, data.teacher, data.email, new Date(), data.lessonJSON];
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({success:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

// שמירת הצבעת תלמיד (סקר / דילמה)
if (data.action === 'openerVote') {
  var sheet = getOrCreateSheet('_openerVotes', ['מזהה','מספר פעילות','שם תלמיד','אפשרות','תאריך']);
  sheet.appendRow([data.openerId, data.activityIndex, data.student, data.optionIndex, new Date()]);
  return ContentService.createTextOutput('ok');
}

// שמירת מילה (ענן מילים)
if (data.action === 'openerWord') {
  var sheet = getOrCreateSheet('_openerWords', ['מזהה','מספר פעילות','שם תלמיד','מילה','תאריך']);
  sheet.appendRow([data.openerId, data.activityIndex, data.student, data.word, new Date()]);
  return ContentService.createTextOutput('ok');
}
```

**doGet handlers:**
```javascript
// טעינת מערך שיעור (JSONP)
if (action === 'getLesson') {
  var id = e.parameter.id;
  var callback = e.parameter.callback;
  var sheet = ss.getSheetByName('_lessonData');
  // ... חיפוש לפי ID, החזרת JSON עטוף ב-callback
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// קריאת תוצאות בזמן אמת (polling כל 3 שניות)
if (action === 'getOpenerResults') {
  // מחזיר: { votes: {actIdx: {optIdx: count}}, words: {actIdx: {word: count}}, guesses: [...] }
}
```
