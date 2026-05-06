---
name: publish-edura-approved
description: "פרסום משרות מאושרות ל-Edura אחרי אישור ב-staging (jobs-pending → jobs.json), או דחייה של הגשות ישירות ב-Apps Script. הפעל עם /publish-edura-approved approved=id1,id2 rejected=id3 — או /publish-edura-approved submission-reject=JOB-...,TCH-..."
---

# ניהול משרות ב-Edura — פרסום ודחייה

הסקיל מטפל בשני זרמים נפרדים:

**זרם A — סורק יומי:** משרות שנאספו מ-igm/itu/shatil ל-`jobs-pending.json`, ומיטל מאשרת ב-staging.html. הסקיל מעביר ל-`jobs.json` ודוחף.

**זרם B — הגשות ישירות:** משרות/מורות שמנהלים+מורים שלחו דרך publish-job.html, נשמרות ב-Google Sheet של Apps Script, ומיטל מאשרת/דוחה דרך לינק במייל. אם הגיע אישור בטעות (בדיקה, ספאם וכו׳) — הסקיל יודע **לדחות** את ההגשה דרך Apps Script (מסמן את הרשומה כ-rejected, היא נעלמת מ-`?action=approved` והאתר מפסיק להציג).

**הריפו:** `c:/Users/meyta/Downloads/edura/`

---

## ארגומנטים

```
/publish-edura-approved approved=<id1,id2,...> rejected=<id3,id4,...>
/publish-edura-approved submission-reject=<JOB-...,TCH-...>
```

**זרם A:**
- `approved=` — IDs מ-jobs-pending.json שיועברו ל-jobs.json
- `rejected=` — IDs מ-jobs-pending.json שיוסרו (אופציונלי)

**זרם B:**
- `submission-reject=` — refs של הגשות ישירות שכבר אושרו ויש לסמן כ-rejected. ה-refs מתחילים ב-`JOB-` או `TCH-`. הסקיל גוזר את הסוג מהקידומת.

אם הוזמן בלי שום ארגומנט שיש לו ערך — הצג עזרה.

**אם יש `submission-reject=` — דלג על שלב 1-7 (זרם A) ועבור ישר ל-"זרם B" בסוף.**

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

---

## זרם B — דחיית הגשות ישירות (Apps Script)

**מתי משתמשים:** מיטל אישרה הגשה דרך לינק במייל ועכשיו רוצה לבטל (בדיקה, ספאם, טעות).

**איך זה עובד:** ה-Apps Script שומר את ההגשות בגיליון Google Sheet ועובד עם טוקן SHA-256 חתום. הסקיל מחשב את הטוקן באופן מקומי ושולח GET request עם `decision=reject`. ה-Sheet מתעדכן ל-`status=rejected`, הרשומה נעלמת מהפיד `?action=approved`, ותוך 1-2 דקות (אחרי טעינה מחודשת של האתר) — נעלמת גם משם. **לא נדרש commit/push** כי זה לא נוגע לריפו.

### קבועים

```
APPS_SCRIPT_URL = https://script.google.com/macros/s/AKfycbwleldcwH8c5k9OZ8EMDIKZ8veRbrtO1M7XwYFWg7HHbEV-SrZkLTElbFRiq4cHPlyarw/exec
APPROVE_SECRET  = edura-approve-2026-meytal
```

### גזירת הסוג מה-ref

- `JOB-...` → `type=job`
- `TCH-...` → `type=teacher`
- כל שאר התחיליות → דווח שגיאה לאותו ref ודלג, אל תעצור על השאר.

### חישוב הטוקן

```python
import hashlib
raw = (type + '|' + ref + '|' + APPROVE_SECRET).encode('utf-8')
token = hashlib.sha256(raw).hexdigest()[:24]   # 24 תווים הקסדצימליים ראשונים
```

(זה בדיוק הפורמט של `signToken_` ב-`submissions-apps-script.gs` בריפו edura.)

### שליחת הבקשה

```
GET {APPS_SCRIPT_URL}?action=approve&decision=reject&type={type}&ref={ref}&token={token}
```

קוד תגובה תקין: HTTP 200. גוף התגובה הוא דף HTML — שגרת ההצלחה היא שמופיע אחד מהביטויים: `נדחתה`, `כבר נדחתה`, או `rejected`. אם רואים `שגיאת אימות` — הטוקן לא תואם (בדוק שאין רווחים מסביב ל-ref).

### סקריפט מומלץ

```python
import hashlib, urllib.request, urllib.parse

URL = 'https://script.google.com/macros/s/AKfycbwleldcwH8c5k9OZ8EMDIKZ8veRbrtO1M7XwYFWg7HHbEV-SrZkLTElbFRiq4cHPlyarw/exec'
SECRET = 'edura-approve-2026-meytal'

def reject(ref):
    if ref.startswith('JOB-'):    typ = 'job'
    elif ref.startswith('TCH-'):  typ = 'teacher'
    else:                          return ('skip', ref, 'unknown prefix')
    raw = (typ + '|' + ref + '|' + SECRET).encode('utf-8')
    token = hashlib.sha256(raw).hexdigest()[:24]
    qs = urllib.parse.urlencode({'action':'approve','decision':'reject','type':typ,'ref':ref,'token':token})
    with urllib.request.urlopen(URL + '?' + qs, timeout=30) as r:
        body = r.read().decode('utf-8', errors='replace')
        ok = ('נדחתה' in body) or ('rejected' in body.lower())
        return ('ok' if ok else 'fail', ref, body[:200])

for ref in REFS_FROM_ARG:
    print(reject(ref.strip()))
```

### וידוא

אחרי שכל הדחיות הסתיימו — קרא את הפיד שוב ואשר שהן באמת ירדו:

```
GET {APPS_SCRIPT_URL}?action=approved
```

בדוק שאף אחד מה-refs שדחית לא מופיע יותר ב-`jobs[]` או ב-`teachers[]`.

### דוח סיכום (זרם B)

```
✓ דחייה הסתיימה
─────────────────
נדחו: N הגשות (jobs:X · teachers:Y)
דווחו שגיאות: M
─────────────────
האתר יעדכן את עצמו תוך 1-2 דקות (כשתישלח טעינה הבאה).
```

### טיפול בשגיאות (זרם B)

- **Apps Script לא מגיב / timeout:** דווח על ה-ref הספציפי, המשך עם השאר.
- **`שגיאת אימות` בתגובה:** סימן שה-`APPROVE_SECRET` השתנה. עצור והודע למיטל.
- **ref לא מתחיל ב-JOB-/TCH-:** דלג עם הודעה.
- **ref לא נמצא במערכת:** ה-Apps Script מחזיר "לא נמצא" — דווח ולא נחשב כהצלחה.

### חשוב

- לא נדרש `git pull`, `git commit`, או `git push` בזרם B. הוא נוגע **רק** ב-Apps Script.
- אסור להפעיל את `decision=reject` על ref שלא הוסכם עם מיטל. זו פעולה בלתי הפיכה דרך ה-skill הזה (אין undo — צריך להריץ עם `decision=approve` כדי להחזיר, וזה לא חלק מהסקיל הנוכחי).
