# ImpactOS ↔ SmartSchool — תוסף Chrome

תוסף שמעביר ציוני תרגול מ-ImpactOS לטפסי SmartSchool בלחיצה אחת.

> **סטטוס:** שלד עובד (פאזה 1 — דמו).
> צריך השלמת DOM selectors של SmartSchool — דורש כניסה לחשבון אמיתי לבדיקה.

---

## מבנה הקבצים

```
smart-school-extension/
├── manifest.json              ← הגדרות התוסף (Manifest V3)
├── background.js              ← Service worker (message broker)
├── popup/
│   ├── popup.html             ← ה-UI של התוסף (לחיצה על האייקון בדפדפן)
│   └── popup.js               ← לוגיקה: טעינת ציונים, מילוי טופס
├── content/
│   ├── smartschool-detector.js ← רץ בכל דף SmartSchool, מזהה סוג מסך + שדות
│   └── overlay.css            ← תג קטן בפינה שמראה שהתוסף פעיל
├── assets/
│   └── icon-{16,48,128}.png   ← אייקונים (חסר עוד — לבנות)
└── README.md                  ← מסמך זה
```

---

## איך להתקין (לפיתוח)

1. פתח Chrome → `chrome://extensions`
2. הפעל "Developer mode" בפינה
3. לחץ "Load unpacked"
4. בחר את התיקייה `smart-school-extension/`
5. האייקון יופיע בסרגל הכלים

---

## איך לבדוק את השלד

1. פתח את הדמו של ImpactOS: `https://impact-os.app/learning-engine/demo.html?pack=tanach`
2. לחץ על אייקון התוסף → "משוך ציונים מ-ImpactOS" — תופיע רשימת 5 ציונים דמו
3. נווט ל-SmartSchool (כל דף שלו)
4. אמור להופיע תג ירוק בפינה: "⚡ ImpactOS פעיל"
5. פתח את התוסף שוב → "מלא טופס" — יחפש שדות number/grade בדף

---

## מה דורש השלמה (פאזה 2)

### 🔴 קריטי — DOM selectors של SmartSchool

צריך להיכנס ל-SmartSchool אמיתי ולגלות:

1. **URL pattern של מסך ציוני כיתה** — מה ה-URL נראה כשמורה מזין ציונים?
   - לדוגמה: `https://app.smart-school.co.il/teacher/grades/class/123/assignment/456`
   - נעדכן את `manifest.json` `host_permissions` ו-`content_scripts.matches` בהתאם.

2. **מבנה השורה של תלמיד בטופס** — איך מזוהה תלמיד?
   - לפי שם? `<tr data-name="אסולין ליאל">`
   - לפי ת.ז? `<tr data-tz="219851425">`
   - לפי מס' סידורי? `<tr data-student-id="1">`
   
3. **ה-selector של שדה הציון** — איך נראה ה-input?
   - `<input type="number" name="grade-123">`
   - או `<input data-field="score" data-student-id="1">`
   - או משהו אחר?
   
4. **דרך לשמור** — האם השמירה אוטומטית (`onblur`), או דורשת לחיצה על כפתור?

### 🟡 חשוב — endpoint ב-ImpactOS שמחזיר ציונים

כיום הציונים נשמרים ב-`localStorage` בלבד (פר מכשיר). לתוסף צריך:

- אופציה א: **endpoint JSON** — `https://impactos.com/api/grades?class=t1&lesson=ch28`
- אופציה ב: **postMessage** — כשהמורה פותחת את ImpactOS וגם את SmartSchool בטאבים שכנים, התוסף עוצב בטאב SmartSchool יכול לבקש ציונים מהטאב של ImpactOS
- אופציה ג: **ייצוא ידני** — המורה מוריד JSON מ-ImpactOS, מעלה לתוסף

### 🟢 נחמד שיהיה — אייקונים

צריך 3 קבצי PNG:
- `assets/icon-16.png` (16×16) — לסרגל הכלים
- `assets/icon-48.png` (48×48) — לחנות התוספים
- `assets/icon-128.png` (128×128) — לחנות התוספים + תצוגה

עיצוב מומלץ: לוגו ImpactOS עם חץ ⇄ ל-SmartSchool, בצבעי `--teal #2E7D8C` ו-`--leaf #4A9B7F`.

---

## הפלו המלא (כשיהיה מוכן)

1. **בכיתה — תלמידים מתרגלים** ב-ImpactOS, הציונים נשמרים בענן.
2. **אחרי השיעור — משה פותח SmartSchool** ובוחר את הכיתה.
3. **לוחץ על אייקון התוסף** → רואה את 19 הציונים מ-ImpactOS.
4. **לוחץ "מלא טופס"** → התוסף קורא את שמות התלמידים מהטופס + מזהה ב-ImpactOS + ממלא את הציונים.
5. **משה רק לוחץ "שמור"** ב-SmartSchool — הציונים נכנסים למערכת בית הספר.

זמן חיסכון: 19 הקלדות → 2 לחיצות. **~95%.**

---

## אבטחה ופרטיות

- **אין שליחת נתונים החוצה.** הציונים נשמרים מקומית ב-`chrome.storage.local`.
- **התוסף רק קורא וכותב** — לא שולח לשרת חיצוני.
- **הרשאות מינימליות:** `storage` (לשמירת ציונים), `activeTab` (לקריאה מהטאב הפעיל), `scripting` (להזרקת קוד מילוי).
- **רק על דומיינים של SmartSchool** — לא רץ בכל דף.

---

## פאזות בעתיד

| פאזה | משימה | זמן משוער |
|---|---|---|
| 1 | שלד עובד עם דמו (✓ עכשיו) | יום |
| 2 | DOM selectors אמיתיים של SmartSchool | יום-יומיים (אחרי גישה) |
| 3 | endpoint JSON מ-ImpactOS לציונים אמיתיים | יום |
| 4 | אייקונים + הפצה ב-Chrome Web Store | שבוע (כולל ביקורת Google) |
| 5 | תמיכה בעוד מערכות (משוב, מגיק בוקס) | חודש |

---

**נכתב:** 16.5.2026 · **גרסה:** 0.1.0
