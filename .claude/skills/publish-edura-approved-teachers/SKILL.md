---
name: publish-edura-approved-teachers
description: "פרסום מורים מאושרים ל-Edura לאחר אישור ידני בעמוד staging (טאב מורים). מעביר רשומות מ-teachers-pending.json ל-teachers.json, מסיר דחויים, מעדכן ספירות, commit+push. הפעל עם /publish-edura-approved-teachers approved=id1,id2,... rejected=id3,id4,..."
---

# פרסום מורים מאושרים ל-Edura

מקבל החלטות אישור/דחייה ממיטל (אחרי שעברה על staging.html → טאב "מורים"), מעביר את המאושרים מהקובץ pending אל מאגר המורים החי, ומסיר את הדחויים.

**הריפו:** `c:/Users/meyta/Downloads/edura/`

---

## ארגומנטים

```
/publish-edura-approved-teachers approved=<id1,id2,...> rejected=<id3,id4,...>
```

- `approved=` — IDs להעברה ל-teachers.json
- `rejected=` — IDs להסרה מ-pending (אופציונלי)

אם `approved=` ריק/חסר — אל תעשה כלום, הצג שגיאה ידידותית.

---

## שלב 1 — סנכרון

```bash
cd /c/Users/meyta/Downloads/edura
git pull --rebase
```

---

## שלב 2 — קריאת הקבצים

קרא:
- `data/teachers-pending.json` → `pending`
- `data/teachers.json` → `live`

אם `data/teachers-pending.json` לא קיים — שגיאה: "אין סקירה ממתינה למורים."

---

## שלב 3 — חלוקה

מ-`pending.teachers[]`:
- **toPublish** = רשומות שה-id שלהן ב-`approved`
- **toReject** = רשומות שה-id שלהן ב-`rejected`
- **toKeepPending** = השאר (ללא החלטה)

ולידציה:
- אם `toPublish.length === 0` → "0 מורים מאושרים. לא בוצעה פעולה."
- IDs ב-`approved` שלא קיימים ב-pending — דווח (stale), המשך.

---

## שלב 4 — עדכון teachers.json (החי)

prepend את `toPublish` לתחילת `live.teachers[]`.

הסר את שדה `_scanned_at` מכל רשומה לפני ההעברה.

חשב מחדש מטא-נתונים:
- `updated_at` = היום (YYYY-MM-DD)
- `total` = `live.teachers.length`
- `by_source` = ספירה לפי `source`
- `by_region` = ספירה לפי `region` (אם ריק → "(לא זוהה)")
- `by_subject` = ספירה לפי `subject` (כל הערכים, ממוין יורד)

כתוב ל-`data/teachers.json` עם indent=2, UTF-8, עברית גולמית.

---

## שלב 5 — עדכון teachers-pending.json

`pending.teachers` = `toKeepPending` בלבד.

- `total_pending` = `toKeepPending.length`
- `by_source` = ספירה חדשה
- אם ריק — שמור `teachers: []` (אל תמחק את הקובץ)

---

## שלב 6 — Commit + Push

```bash
git add data/teachers.json data/teachers-pending.json
git commit -m "publish: +N teachers approved · -M rejected · K pending"
git push
```

---

## שלב 7 — סיכום

```
✓ פורסם בהצלחה
─────────────────
פורסמו: N מורים
נדחו:    M מורים
ממתינים: K מורים לאישור
─────────────────
מאגר המורים החי כעת: <total>
האתר: https://edura.co.il/teachers.html
```

הוסף הערה: "מנהלים יראו את המורים החדשים בהתאמה אוטומטית במשרות שלהם לפי matching.js."

---

## טיפול בשגיאות

- git pull conflict → בקש פתרון ידני, אל תמשיך.
- id לא נמצא → warning, המשך עם השאר.
- JSON שבור → עצור, אל תכתוב.
- push נכשל → הצג שגיאה, הקבצים נשמרו מקומית.

---

## הערות

- אסור לגעת בקבצים אחרים ב-edura.
- בלי ארגומנטים → "השתמש ב-staging.html (טאב מורים), לחצי 'פרסם מאושרים', העתיקי הפקודה והדביקי כאן."
- הסקיל לא סורק שום מקור — תפקיד הסריקה.
