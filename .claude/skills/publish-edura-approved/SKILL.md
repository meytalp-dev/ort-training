---
name: publish-edura-approved
description: "פרסום משרות מאושרות ל-Edura לאחר אישור ידני בעמוד staging. מעביר משרות מ-jobs-pending.json ל-jobs.json, מסיר דחויות, מעדכן ספירות, commit+push. הפעל עם /publish-edura-approved approved=id1,id2,... rejected=id3,id4,..."
---

# פרסום משרות מאושרות ל-Edura

מקבל החלטות אישור/דחייה ממיטל (אחרי שעברה על staging.html), מעביר את המאושרים מהקובץ pending אל הקובץ החי, ומסיר את הדחויים.

**הריפו:** `c:/Users/meyta/Downloads/edura/`

---

## ארגומנטים

הסקיל מוזמן בפורמט:
```
/publish-edura-approved approved=<id1,id2,...> rejected=<id3,id4,...>
```

- `approved=` — רשימת IDs מופרדת בפסיקים שיועברו ל-jobs.json
- `rejected=` — רשימת IDs שיוסרו מ-pending (אופציונלי, יכול להיות ריק)

אם `approved=` ריק/חסר — אל תעשה כלום, הצג שגיאה ידידותית.

---

## שלב 1 — סנכרון הריפו

```bash
cd /c/Users/meyta/Downloads/edura
git pull --rebase
```

---

## שלב 2 — קריאת הקבצים

קרא:
- `data/jobs-pending.json` → `pending`
- `data/jobs.json` → `live`

אם `data/jobs-pending.json` לא קיים, הצג שגיאה: "אין סקירה ממתינה. תרוץ הסקירה הבאה ב-06:00."

---

## שלב 3 — חלוקת המשרות

מ-`pending.jobs[]`:
- **toPublish** = משרות שה-id שלהן ב-`approved`
- **toReject** = משרות שה-id שלהן ב-`rejected`
- **toKeepPending** = השאר (לא הוחלט עליהן עדיין)

ולידציה:
- אם `toPublish.length === 0` — הצג: "0 משרות מאושרות. לא בוצעה פעולה." וצא.
- אם יש id ב-`approved` שלא קיים ב-pending — דווח (probably stale). אל תפסיק.

---

## שלב 4 — עדכון jobs.json (החי)

prepend את `toPublish` לתחילת `live.jobs[]`.

**הסר** את שדה `_scanned_at` מכל משרה לפני ההעברה (זה שדה עבודה של pending בלבד).

חשב מחדש את כל המטא-נתונים:
- `updated_at` = היום (YYYY-MM-DD, שעון ישראל)
- `total` = `live.jobs.length`
- `by_source` = ספירה לפי `job.source`
- `by_region` = ספירה לפי `job.region` (אם ריק → "(לא זוהה)")
- `by_role` = ספירה לפי `job.role`
- `by_level` = ספירה לפי `job.level`
- `by_subject` = ספירה לפי `job.subject` (כל הערכים, ממוין יורד)

כתוב חזרה ל-`data/jobs.json` עם indent=2, UTF-8, עברית כתווים גולמיים (לא `\uXXXX`).

---

## שלב 5 — עדכון jobs-pending.json

`pending.jobs` = `toKeepPending` בלבד.

- `scanned_at` = שמור כפי שהיה
- `total_pending` = `toKeepPending.length`
- `by_source` = ספירה חדשה של `toKeepPending`

אם `toKeepPending.length === 0` — שמור את הקובץ עם `jobs: []` (אל תמחק את הקובץ; הסקירה הבאה תכתוב אליו).

---

## שלב 6 — Commit + Push

```bash
git add data/jobs.json data/jobs-pending.json
git commit -m "publish: +N approved · -M rejected · K still pending"
git push
```

עם N = `toPublish.length`, M = `toReject.length`, K = `toKeepPending.length`.

---

## שלב 7 — דוח סיכום

```
✓ פורסם בהצלחה
─────────────────
פורסמו: N משרות (igm:X · itu:Y · שתיל:Z)
נדחו:    M משרות
ממתינות: K משרות לאישור הבא
─────────────────
האתר: https://edura.co.il/
```

הוסף הערה: "GitHub Pages יסיים deploy בעוד ~1-2 דקות. אפשר לבדוק עם `?v=<timestamp>` לעקוף cache."

---

## טיפול בשגיאות

- **git pull נכשל (conflict):** הצג את השגיאה, בקש ממיטל לפתור ידנית. אל תמשיך.
- **id לא נמצא ב-pending:** דלג עליו עם warning, המשך עם השאר.
- **קובץ לא נטען (JSON שבור):** עצור, אל תכתוב שום דבר.
- **push נכשל (אין הרשאות):** הצג את השגיאה. הקבצים נשמרו מקומית, את יכולה לדחוף ידנית אחר כך.

---

## הערות

- אסור לעבוד על שום קובץ אחר בריפו edura.
- אם המשתמשת מזמינה את הסקיל בלי ארגומנטים — הצג עזרה: "השתמש ב-staging.html, לחצי 'פרסם מאושרים', העתיקי את הפקודה והדביקי כאן."
- הסקיל לא סורק שום מקור — זה תפקיד הסקירה היומית.
