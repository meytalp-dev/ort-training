# מערכת נוכחות — מדריך התקנה

**זמן משוער לכל התהליך:** 20-30 דקות
**מה תצטרכי:** חשבון Google, חשבון Green API עם מפתחות (כבר יש לך)

---

## שלב 1 — יצירת Google Sheet (3 דקות)

1. היכנסי ל-[sheets.google.com](https://sheets.google.com)
2. לחצי **+ Blank** (גיליון חדש)
3. שני את השם ל-**`ort-attendance`** (למעלה שמאל)
4. השאירי את הטאב פתוח — נחזור אליו

---

## שלב 2 — הדבקת קוד Apps Script (5 דקות)

1. בגיליון החדש → תפריט **Extensions → Apps Script**
2. נפתח עורך קוד בטאב חדש
3. מחקי את כל הקוד הקיים שם (בדרך כלל יש שורה ריקה של `function myFunction() {}`)
4. פתחי את הקובץ [attendance-apps-script.js](docs/management/attendance-apps-script.js) במחשב שלך
5. **העתיקי את כל התוכן** והדביקי בעורך של Apps Script
6. שמרי: **Ctrl+S** (או כפתור הדיסק)
7. תתבקשי לתת שם לפרויקט — כתבי **`ort-attendance`**

---

## שלב 3 — הרצה ראשונית (5 דקות, כולל אישור הרשאות)

1. בעורך Apps Script, למעלה יש תפריט **"Select function to run"**
2. בחרי **`setup`**
3. לחצי **Run** (כפתור ▶)
4. יופיע דיאלוג של הרשאות:
   - **Review permissions** → בחרי את חשבון Google שלך
   - תראי מסך "Google hasn't verified this app" — זה נורמלי כי זה קוד שלך
   - לחצי **Advanced** → **Go to ort-attendance (unsafe)** → **Allow**
5. הקוד ירוץ — תראי בתחתית המסך "Execution completed"
6. חזרי לגיליון — תראי 3 טאבים חדשים: **attendance / config / log**

**אם משהו נכשל:** פתחי את הלוג (Apps Script → View → Executions) ושלחי לי צילום מסך.

---

## שלב 4 — מילוי config (3 דקות)

1. בגיליון → טאב **`config`**
2. מלאי את השורות הבאות:

| key | value |
|-----|-------|
| `reminder_recipient_phones` | מספרי הטלפון של יסכה, אופירה, מיטל — מופרדים בפסיק, ללא רווחים (לדוגמה: `0527111111,0528222222,0529333333`) |
| `green_api_enabled` | `yes` — כשתרצי שיישלחו באמת |
| `class_ט1` | שם בת השירות של ט1 (לדוגמה: `רונית כהן`) |
| `class_ט2` | ... וכן הלאה לכל 11 הכיתות |

**טיפ:** את יכולה להתחיל עם `green_api_enabled=no` למספר ימים, לראות בלוג מה היה נשלח, ורק אחר כך להפעיל באמת.

---

## שלב 5 — הגדרת מפתחות Green API (2 דקות)

1. ב-Apps Script (לא בגיליון) → אייקון **גלגל שיניים** בצד שמאל → **Script Properties**
2. לחצי **Add script property**:
   - Key: `GREEN_API_ID_INSTANCE`
   - Value: ה-Instance ID שלך מ-Green API
3. הוסיפי עוד אחד:
   - Key: `GREEN_API_TOKEN_INSTANCE`
   - Value: ה-API Token שלך
4. Save

**איפה למצוא את המפתחות?** בחשבון Green API שלך → Instance → יש שם Instance ID ו-API Token.

---

## שלב 6 — פריסה כ-Web App (3 דקות)

1. בעורך Apps Script → **Deploy → New deployment**
2. בחרי את סוג הפריסה: לחצי על גלגל שיניים קטן ליד "Select type" → **Web app**
3. מלאי:
   - **Description**: `ort attendance v1`
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ חשוב! זה לא מפרסם את הגיליון, רק מאפשר ל-HTML לקרוא
4. לחצי **Deploy**
5. יבקשו אישור הרשאות שוב — אשרי
6. תקבלי **Web app URL** — העתיקי אותו לקובץ טקסט זמני, תזדקקי לו בשלב הבא

**ה-URL נראה ככה:**
`https://script.google.com/macros/s/AKfycby.../exec`

---

## שלב 7 — הגדרת טריגר התראה ל-13:30 (1 דקה)

1. ב-Apps Script → חזרי לתפריט "Select function to run"
2. בחרי **`setupReminderTrigger`**
3. Run
4. יופיע דיאלוג הרשאות לגישה לטריגרים — אשרי
5. "Execution completed" → מעכשיו, כל יום עבודה ב-13:30, הסקריפט ירוץ אוטומטית

**בדיקה:** בתפריט שמאל של Apps Script → **Triggers** → אמור להופיע טריגר עם שם `sendReminderCheck` ושעה 13:00-14:00.

---

## שלב 8 — חיבור הדשבורד הראשי (1 דקה)

1. פתחי בדפדפן את [attendance.html](docs/management/attendance.html)
2. למעלה — לחצי **"הגדרות ענן"**
3. הדביקי את ה-Web app URL שהעתקת בשלב 6
4. לחצי **"בדיקת חיבור"** — אמור להופיע ✓ חיבור תקין
5. לחצי **"שמור"** → הדשבורד יתחיל לסנכרן אוטומטית

**מעכשיו:** כל שמירה בטאב "דיווח יומי" או "סימולטור בוט" → נשמרת גם ב-Google Sheet.

---

## שלב 9 — חיבור הטופס לבנות השירות (2 דקות)

לכל אחת מ-11 בנות השירות, צרי קישור ייחודי בפורמט:

```
https://meytalp-dev.github.io/ort-training/management/bnot-attendance-form.html?cls=ט1&url=ENCODED_URL
```

החלפי:
- `ט1` → הכיתה של אותה בת שירות
- `ENCODED_URL` → ה-URL מסעיף 6, **מוצפן** (השתמשי ב-[encodeURIComponent](https://www.urlencoder.org/))

**פתרון פשוט יותר:** כל בת שירות פותחת את הטופס פעם אחת, לוחצת ⚙ הגדרות, מדביקה את ה-URL הראשי + הכיתה שלה + שמה, לוחצת "שמור" — והסימניה נשמרת.

**שליחת הקישור לבנות השירות:**
```
היי [שם], הקישור לדיווח נוכחות:
[הקישור עם הכיתה שלה]

בבקשה לחצי על הקישור, הוסיפי למסך הבית של הטלפון (Share → Add to Home Screen), והשתמשי בו כל בוקר במקום לכתוב בקבוצה.

כל השאלות — אליי :)
```

---

## שלב 10 — בדיקה מקצה לקצה (5 דקות)

1. **מהטלפון של מישהי** (או מהדפדפן בתצוגת מובייל):
   - פתחי את `bnot-attendance-form.html?cls=ט1`
   - סמני 3-4 תלמידים בסטטוסים שונים
   - לחצי "שמור ושלח"
   - אמור להופיע מסך "תודה!"

2. **בגיליון Google:**
   - פתחי את הטאב `attendance`
   - אמורות להופיע 3-4 שורות חדשות עם הדיווחים

3. **בדשבורד הראשי:**
   - פתחי את `attendance.html`
   - לחצי "סנכרון מהענן"
   - הדיווחים אמורים להופיע ב-ט1 במטריצה

4. **בדיקת Green API:**
   - ב-Apps Script → בחרי פונקציה `testGreenApi` → Run
   - אמורה להגיע הודעת וואטסאפ לטלפון הראשון ברשימת הנמענים

5. **בדיקת התראת 13:30:**
   - ב-Apps Script → בחרי `testReminderDryRun` → Run
   - תקבלי בלוג (View → Logs) פירוט של: אילו כיתות חסרות היום, מי התלמידה שלהן, האם Green API מופעל

---

## מבנה המערכת בסיום

```
┌─ טופס לבנות שירות (נייד) ──────────┐
│  bnot-attendance-form.html?cls=ט1   │
│  ↓ POST                              │
└──────────────┬──────────────────────┘
               ▼
  ┌─ Apps Script Web App ──────────┐
  │  כתיבה + קריאה + התראות         │
  └──────────┬─────────────────────┘
             ▼
  ┌─ Google Sheet "ort-attendance" ┐
  │  attendance · config · log      │
  └──────────┬─────────────────────┘
             ▲
             │ GET/POST
  ┌──────────┴─────────────────────┐
  │  attendance.html (מיטל)         │
  │  הדשבורד — רק את רואה          │
  └─────────────────────────────────┘

  ┌─ Cron 13:30 ─────────────┐
  │  sendReminderCheck()      │
  │  → בודק מי לא מילא         │
  │  → שולח וואטסאפ ליסכה/    │
  │    אופירה/מיטל            │
  └───────────────────────────┘
```

---

## בעיות שכיחות

### "Permission denied" כשמריצים setup
- תקני: פתחי מחדש את Apps Script (אולי session פג), או נתקי ונסי שוב את Run

### הסנכרון מה-HTML נכשל
- ודאי שה-URL הוא exact (כולל `/exec` בסוף)
- ודאי שב-Deploy בחרת "Who has access: Anyone"
- אם לא עובד — Deploy → Manage deployments → ערכי את הפריסה → Version: New version → Deploy

### התראת 13:30 לא רצה
- Apps Script → Triggers → בדקי שהטריגר קיים ולא failed
- אם יש כשלונות — לחצי על השורה לראות את השגיאה
- לרוב: חסרים מפתחות Green API או `reminder_recipient_phones` ריק

### Green API עונה עם שגיאה
- ודאי שה-Instance ב-Green API הוא "Authorized" (לא "NotAuthorized")
- הרחיבי את התקופה בחשבון Green API אם פג (אני זוכרת שיש תאריך תפוגה 27/5/2026)

---

## עדכון הקוד בעתיד

כש-Apps Script צריך עדכון (למשל הוספת פיצ'ר):
1. Apps Script → מחליפים את הקוד
2. Save (Ctrl+S)
3. **Deploy → Manage deployments → Edit (עיפרון) → Version: New version → Deploy**
4. ה-URL לא משתנה — לא צריך לעדכן ב-HTML

---

## צ'קליסט מעבר לייצור

- [ ] Google Sheet נוצר
- [ ] Apps Script הודבק והורץ setup
- [ ] 3 הטאבים נוצרו (attendance / config / log)
- [ ] Config מולא — טלפונים, שמות בנות שירות
- [ ] Green API credentials מוגדרים ב-Script Properties
- [ ] Web app deployed (Who has access: Anyone)
- [ ] טריגר 13:30 פעיל
- [ ] attendance.html מחובר (בדיקת חיבור עבר ✓)
- [ ] bnot-attendance-form.html נבדק ממכשיר נייד אמיתי
- [ ] בדיקה end-to-end: דיווח מהטופס → הגיע לגיליון → נראה בדשבורד
- [ ] testGreenApi: הודעת בדיקה התקבלה
- [ ] נשלחו קישורים לבנות השירות

**כשכל זה ✓ — המערכת חיה וכל בוקר תתעדכן אוטומטית.**
