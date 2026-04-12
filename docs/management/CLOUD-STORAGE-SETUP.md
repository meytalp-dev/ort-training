# מדריך התקנה — סנכרון בין מחשבים

**למייטל · 5 דקות · פעם אחת**

זה מחבר 6 מערכות לשמירה ב-Google Sheet כדי שהנתונים יעברו בין מחשבים:

- בנות שירות
- בגרויות וזכאות
- תיק תלמיד (הערות, שיחות, ממדים, מיומנויות)
- מצבת תלמידים
- דוחות חודשיים
- טיפולים

---

## שלב 1 — יוצרים את ה-Sheet (1 דקה)

1. נכנסים ל-[Google Drive](https://drive.google.com)
2. **New → Google Sheets**
3. שם: `ניהול בית ספר — אורט בית הערבה`
4. מעתיקים את ה-Sheet ID מה-URL:
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXX/edit
                                          ^^^^^^^^^^^^^
                                          זה ה-ID — מעתיקים
   ```

---

## שלב 2 — מדביקים את הקוד (2 דקות)

1. ב-Sheet שיצרת: **Extensions → Apps Script**
2. מוחקים את כל הקוד שיש ב-Editor
3. פותחים את הקובץ [`cloud-storage-apps-script.js`](cloud-storage-apps-script.js), מעתיקים הכל ומדביקים
4. מחפשים את השורה:
   ```js
   var SHEET_ID = '__PASTE_YOUR_SHEET_ID_HERE__';
   ```
   ומחליפים את `__PASTE_YOUR_SHEET_ID_HERE__` ב-Sheet ID שהעתקת
5. שומרים (Ctrl+S) — נותנים לפרויקט שם: `Cloud Storage`

---

## שלב 3 — מריצים setup (1 דקה)

1. בתפריט העליון של ה-Editor, בוחרים בפונקציה **`setupSheets`**
2. לוחצים **Run** (▶)
3. Google יבקש הרשאות — לאשר ("Review permissions" → הבחירה שלך → Advanced → Go to… → Allow)
4. מופיעה הודעה "✓ מוכן! טאב kv_store נוצר"

---

## שלב 4 — Deploy כ-Web App (1 דקה)

1. בפינה הימנית העליונה: **Deploy → New deployment**
2. לוחצים על גלגל השיניים (⚙) ליד "Select type" → **Web app**
3. מגדירים:
   - **Description:** `Cloud Storage v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. **Deploy** → מאשרים הרשאות
5. **מעתיקים את ה-Web app URL** — נראה ככה:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## שלב 5 — מדביקים את ה-URL בקוד (30 שניות)

1. פותחים את הקובץ [`docs/management/cloud-storage.js`](cloud-storage.js)
2. מחפשים את השורה:
   ```js
   var CLOUD_STORAGE_URL = '';
   ```
3. מדביקים את ה-URL בין הגרשיים:
   ```js
   var CLOUD_STORAGE_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. שומרים — זהו.

---

## איך יודעים שזה עובד?

פותחים אחת מהמערכות בדפדפן (למשל [טיפולים](therapy.html)). בפינה השמאלית התחתונה יופיע תג סטטוס:

- **● מסונכרן** — ירוק · הכל שמור בענן
- **◐ נשמר מקומית** — כתום · בעיית רשת, שמור רק במחשב הזה
- **◌ שומר לענן…** — סגול · בתהליך

מבצעים איזשהו שינוי קטן (למשל משנים משהו ב-dashboard), פותחים מחשב אחר, ונכנסים לאותה מערכת — השינוי אמור להופיע.

---

## תחזוקה שוטפת

- **אם משנים את הקוד ב-Apps Script** — צריך `Deploy → Manage deployments → Edit (✏) → Version: New → Deploy`. אותו URL נשאר.
- **כדי לראות את הנתונים** — פותחים את ה-Sheet, עוברים לטאב `kv_store`. כל שורה היא מערכת אחת, עמודת `value` מכילה JSON. לא עורכים ידנית (חוץ ממקרים חריגים) כי זה JSON.
- **גיבוי** — Google Sheets גיבוי אוטומטית. אפשר גם File → Make a copy אחת לחודש ליתר ביטחון.

---

## מה קורה אם Google Sheets לא זמין?

- המערכות ממשיכות לעבוד כרגיל (נשמר ל-localStorage כ-cache)
- תג הסטטוס יציג "◐ נשמר מקומית"
- ברגע שהרשת/השרת חוזר — השינוי הבא מסונכרן אוטומטית
- שינויים ישנים שנעשו במצב offline **לא מסתנכרנים אוטומטית** — הם נשארים על המחשב הזה עד ששומרים אותם שוב

---

## בעיות נפוצות

**"CORS error" ב-console**
→ אפשר להתעלם, בדרך כלל זה אזהרה של הדפדפן. אם הנתונים באמת לא נשמרים, לוודא ש-`Who has access: Anyone` ב-Deploy.

**"You do not have permission to call SpreadsheetApp"**
→ לא אישרת הרשאות ב-setup. חוזרים על שלב 3.

**תג הסטטוס תמיד "offline"**
→ ה-URL בקובץ `cloud-storage.js` שגוי או ריק. לוודא שיש URL מלא שמתחיל ב-`https://script.google.com/`.

**המערכת טוענת אבל ריקה**
→ פתח את ה-Sheet, בדוק שהטאב `kv_store` קיים. אם לא — חוזרים לשלב 3 (`setupSheets`).
