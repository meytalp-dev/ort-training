# Brief ל-Lovable: פורטל תלמיד – תרגול בגרויות

## החזון
פורטל שבו התלמיד נכנס, מזין שם + כיתה + שם מורה + מייל מורה, ובוחר תרגול בגרות מהמאגר. התרגול נפתח ב-iframe, הציונים נשלחים אוטומטית למורה.

---

## 1. זרימת המשתמש (3 שלבים)

```
שלב 1: כניסה            שלב 2: בחירת תרגול       שלב 3: תרגול
┌──────────────┐        ┌──────────────┐          ┌──────────────┐
│ שם תלמיד     │        │ 🔍 חיפוש     │          │ iframe       │
│ כיתה [▼]     │   →    │              │    →     │              │
│ שם מורה      │        │ [הכל] [מתמ]  │          │ (תרגול מ-    │
│ מייל מורה    │        │ [אזר] [עבר]  │          │  GitHub Pages)│
│ [🚀 התחל]    │        │ כרטיסים...   │          │              │
└──────────────┘        └──────────────┘          └──────────────┘
```

---

## 2. שלב 1 – מסך כניסה

### עיצוב

```
┌─────────────────────────────────┐
│  📖                              │
│  תרגול בגרויות                   │
│  אורט בית הערבה                  │
│                                  │
│  שם תלמיד: [______________]     │
│  כיתה: [▼ בחרו כיתה      ]     │
│                                  │
│  ── פרטי מורה ──                 │
│  שם מורה: [______________]      │
│  מייל מורה: [____________]      │
│                                  │
│  [🚀 התחילו לתרגל!]             │
└─────────────────────────────────┘
```

### שדות

| שדה | סוג | חובה | הערות |
|-----|------|------|-------|
| שם תלמיד | text | כן | 2 תווים מינימום |
| כיתה | select (dropdown) | כן | ט1-ט4, י1-י4, יא1-יא3, יב1-יב3 |
| שם מורה | text | כן | שדה חופשי |
| מייל מורה | email | כן | שדה חופשי, validation של @ |

### רשימת כיתות (dropdown)

```
ט1, ט2, ט3, ט4
י1, י2, י3, י4
יא1, יא2, יא3
יב1, יב2, יב3
```

### שמירה

פרטי הכניסה נשמרים ב-`localStorage` (`ort-student-portal`):
```javascript
{
  studentName: "שם התלמיד",
  classroom: "יא2",
  teacherName: "שם המורה",
  teacherEmail: "teacher@school.org.il"
}
```

בכניסה חוזרת – השדות מתמלאים אוטומטית. כפתור "שנה פרטים" בראש דף הבחירה.

---

## 3. שלב 2 – בחירת תרגול

### עיצוב

```
┌─────────────────────────────────────────┐
│  👋 שלום, [שם]! (כיתה [כיתה])          │
│  [⚙ שנה פרטים]                          │
│                                          │
│  ── סינון לפי מקצוע ──                   │
│  [הכל] [מתמטיקה] [אזרחות] [היסטוריה]   │
│  [עברית] [תנ"ך]                          │
│                                          │
│  ┌──────────┐  ┌──────────┐              │
│  │ 🔢       │  │ 🏛️       │              │
│  │ מתמטיקה  │  │ אזרחות   │              │
│  │ 371      │  │ קיץ 2025 │              │
│  │ קיץ 2025 │  │ 22 שאלות │              │
│  │ 25 שאלות │  │          │              │
│  │ [התחל ▶] │  │ [התחל ▶] │              │
│  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐              │
│  │ 📜       │  │ ✡️       │              │
│  │ היסטוריה │  │ תנ"ך    │              │
│  │ קיץ 2025 │  │ 1261    │              │
│  │ 26 שאלות │  │ קיץ 2025│              │
│  │ [התחל ▶] │  │ 47 שאלות│              │
│  └──────────┘  └──────────┘              │
│  ┌──────────┐                            │
│  │ ✏️       │                            │
│  │ עברית    │                            │
│  │ קיץ 2025 │                            │
│  │ 36 שאלות │                            │
│  │ [התחל ▶] │                            │
│  └──────────┘                            │
└─────────────────────────────────────────┘
```

### מערך התרגולים (hardcoded)

```typescript
interface Practice {
  id: string;
  name: string;
  subject: string;
  session: string;
  questions: number;
  description: string;
  icon: string;
  color: string;
  url: string;  // GitHub Pages URL
}

const PRACTICES: Practice[] = [
  {
    id: 'math-371-summer-2025',
    name: 'בגרות מתמטיקה 371',
    subject: 'מתמטיקה',
    session: 'קיץ 2025',
    questions: 25,
    description: '3 יח"ל – גידול/קיטון אחוזי, הסתברות, גיאומטריה, טריגונומטריה, סטטיסטיקה',
    icon: '🔢',
    color: '#4A90D9',
    url: 'https://meytalp-dev.github.io/ort-training/bagrut/math-371-summer-2025/'
  },
  {
    id: 'citizenship-summer-2025',
    name: 'בגרות אזרחות',
    subject: 'אזרחות',
    session: 'קיץ 2025',
    questions: 22,
    description: 'פיקוח וביקורת, זכויות אדם, דמוקרטיה, ממשל פרלמנטרי',
    icon: '🏛️',
    color: '#2A9D8F',
    url: 'https://meytalp-dev.github.io/ort-training/bagrut/citizenship-summer-2025/'
  },
  {
    id: 'history-summer-2025',
    name: 'בגרות היסטוריה',
    subject: 'היסטוריה',
    session: 'קיץ 2025',
    questions: 26,
    description: 'מלה"ע השנייה והשואה, לאומיות וציונות, הקמת מדינת ישראל',
    icon: '📜',
    color: '#E9A319',
    url: 'https://meytalp-dev.github.io/ort-training/bagrut/history-summer-2025/'
  },
  {
    id: 'hebrew-summer-2025',
    name: 'בגרות עברית',
    subject: 'עברית',
    session: 'קיץ 2025',
    questions: 36,
    description: 'הבנה והבעה, שם המספר, אותיות השימוש, מערכת הצורות',
    icon: '✏️',
    color: '#7C3AED',
    url: 'https://meytalp-dev.github.io/ort-training/bagrut/hebrew-summer-2025/'
  },
  {
    id: 'tanach-1261-summer-2025',
    name: 'בגרות תנ"ך 1261',
    subject: 'תנ"ך',
    session: 'קיץ 2025',
    questions: 47,
    description: 'בראשית, שמות, שיבת ציון, נביא ונבואה, חוק וחברה, תהלים, איוב',
    icon: '✡️',
    color: '#DB2777',
    url: 'https://meytalp-dev.github.io/ort-training/bagrut/tanach-1261-summer-2025/'
  }
];
```

### סינון

כפתורי סינון לפי מקצוע:
- "הכל" (ברירת מחדל, פעיל)
- "מתמטיקה"
- "אזרחות"
- "היסטוריה"
- "עברית"
- "תנ\"ך"

כפתור פעיל = רקע `--primary` + לבן. לא פעיל = רקע לבן + בורדר.

---

## 4. שלב 3 – מסך תרגול (iframe)

### זרימה

כשהתלמיד לוחץ "התחל" על כרטיס תרגול:

1. בנה URL עם query params:
```javascript
const practiceUrl = practice.url + '?name=' + encodeURIComponent(studentName)
  + '&class=' + encodeURIComponent(classroom)
  + '&email=' + encodeURIComponent(teacherEmail)
  + '&teacher=' + encodeURIComponent(teacherName);
```

2. הצג iframe עם ה-URL:
```html
<iframe src="{practiceUrl}" style="width:100%;height:100vh;border:none"></iframe>
```

3. כפתור "🔙 חזרה למאגר" – למעלה, מעל ה-iframe

### עיצוב

```
┌─────────────────────────────────┐
│  [🔙 חזרה למאגר]   📖 עברית    │
│  ───────────────────────────────│
│  ┌─────────────────────────────┐│
│  │                             ││
│  │      iframe                 ││
│  │      (התרגול מ-GitHub Pages)││
│  │                             ││
│  │                             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### מה קורה בתרגול

התרגול ב-GitHub Pages מקבל את ה-URL params ו:
1. ממלא אוטומטית שם + כיתה
2. מתחיל את התרגול בלי מסך כניסה
3. בסיום – שולח ציונים ל-Google Sheets עם מייל המורה מה-URL

**הציונים נשלחים ישירות מהתרגול ל-Google Sheets – בלי צורך בהתערבות הפורטל.**

---

## 5. Google Sheets – שליחת ציונים

**URL:**
```
https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
```

השליחה מתבצעת מתוך התרגול עצמו (ב-GitHub Pages), לא מהפורטל.
הפורטל רק מעביר את `teacherEmail` כ-URL param.

### פרמטרים שהתרגול שולח:

```javascript
{
  action: 'submit',
  quizName: "תרגול בגרות – עברית – קיץ 2025",
  studentName: "שם התלמיד",      // מה-URL param
  classroom: "יא2",              // מה-URL param
  score: 85,
  totalQuestions: 36,
  correctAnswers: 30,
  hintsUsed: 3,
  level: "בגרות",
  teacherEmail: "teacher@mail.com" // מה-URL param
}
```

---

## 6. CSS Theme

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
  --purple: #7C3AED;
  --purple-l: #F3E8FF;
  --pink: #DB2777;
  --pink-l: #FCE7F3;
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

## 7. אנימציות

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px) }
  to { opacity: 1; transform: translateY(0) }
}
```

כל כרטיס תרגול מופיע עם `fadeUp` ו-`animation-delay` הדרגתי (0.05s × index).

---

## 8. Responsive (Mobile)

- מסך כניסה: שדות ברוחב 100%, padding מותאם
- כרטיסי תרגול: עמודה אחת (1fr) במובייל
- iframe: height: 100vh, width: 100%
- כפתור "חזרה" נשאר sticky למעלה

---

## 9. LocalStorage

```javascript
// שמירת פרטי תלמיד
localStorage.setItem('ort-student-portal', JSON.stringify({
  studentName: "...",
  classroom: "...",
  teacherName: "...",
  teacherEmail: "..."
}));
```

בכניסה חוזרת – אם יש נתונים שמורים:
- השדות מתמלאים אוטומטית
- כפתור "⚙ שנה פרטים" בדף הבחירה חוזר למסך הכניסה

---

## 10. RTL + עברית

- `<html dir="rtl" lang="he">`
- כל הטקסטים בעברית
- Layout מותאם ל-RTL (flex-direction, text-align)

---

## 11. לוגו

```html
<div style="position:fixed;bottom:18px;right:20px;z-index:200;opacity:.45;pointer-events:none">
  <img src="https://meytalp-dev.github.io/ort-training/logo.png" alt="Lerani" style="height:32px;width:auto">
</div>
```

---

## 12. הרחבה עתידית

המאגר הוא מערך hardcoded. להוספת תרגול חדש:
1. ליצור את התרגול ב-GitHub Pages (סקיל `/bagrut-practice`)
2. להוסיף אובייקט חדש למערך `PRACTICES` בקוד הפורטל
3. הסינון מתעדכן אוטומטית לפי ה-subjects הקיימים

---

## 13. סיכום טכני

| רכיב | טכנולוגיה |
|------|-----------|
| Framework | React + TypeScript (Lovable) |
| Styling | Tailwind CSS (Lovable default) + CSS variables |
| State | React useState + localStorage |
| תרגולים | iframe → GitHub Pages |
| ציונים | Google Sheets (נשלח מהתרגול, לא מהפורטל) |
| Auth | אין – פרטים ב-localStorage |
| Routing | React Router – 3 routes: /, /select, /practice/:id |
