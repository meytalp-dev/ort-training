# רֶצֶף — מודל הנתונים המשותף (סכימה אחת לכל התצוגות)

**גרסה:** 3.0 · **תאריך:** 15.7.2026 · **סטטוס:** אפיון עבודה
**מזהה משימה:** W0-01 · **מסמך-אב:** `prd.md` 3.0 · **נספח פרטיות:** `security-minimization.md` · **עיצוב:** `tokens.css`
**מיקום:** `_drafts/emergency-learning/`

> **מה זה:** מסד נתונים **אחד** שמשרת את **כל** התצוגות (תלמיד · מורה · מחנך · מנהל · מפקח · פיקוח ארצי · Admin) דרך **שכבת שירותים אחת** (prd §4). פרסונה = תצוגה מעל השירותים, לא טבלאות נפרדות. אין כפילות לוגיקה, אין שלושה מסדי נתונים.

## מה השתנה מ-1.3 (T0.2 → W0-01) — קראו לפני שמשתמשים

הגרסה הקודמת (1.3, נכתבה מול `spec.md`) הייתה טובה מבנית אבל **קדמה ל-PRD 3.0 ולהחלטת המינימיזציה**. שלושה תיקונים מהותיים, כל אחד עם נימוק:

| # | מה השתנה | למה (מקור) |
|---|----------|------------|
| 1 | **`est_minutes int` (="צעד=10 דק'") הוסר** → הוחלף במודל `LearningDuration` גמיש (§2). | prd §5 — "הריגת 10 הדקות ה-hard-coded". אסור לקבע משך בשם רכיב, במודל או בלוגיקה. |
| 2 | **check-in רגשי = מתריע ונמחק** (סטטוס חד-פעמי, בלי היסטוריה). `FlagEvent` (מטא לשנה) + תפקיד `counselor` **הועברו לנספח "מורחב — לא ב-MVP-A"** (§10). | prd §10 + `security-minimization.md` §3 שורה 3: "מתריע ונמחק… **לא נבנית היסטוריה רגשית.** סטטוס חד-פעמי, לא לוג". שמירת מטא-דגלים לשנה סותרת את גרסת "בטוחה-לביקורת". |
| 3 | **יומן קשר + הערת מחנך = שדות מובנים בלבד** — הוסר שדה טקסט חופשי מ-MVP. | `security-minimization.md` §3 שורה 4: "שדה חופשי הוא הכי מסוכן… שדות מובנים בלבד (ערוץ / תוצאה / משימת המשך)". |
| 4 (15.7.2026) | **`ContentUnit.level` נוסף — 3 רמות** (`basic`/`standard`/`advanced`), מתלכד עם `support_level` (`with_you`/`on_own`/`ahead`). §3.4. | הכרעת מיטל 15.7 + הדמו הדיפרנציאלי. יישור מול `content-standard.md` §2 ותמיכה במגמות המקצועיות (`taxonomy.md` §8). התלמיד לא רואה את שם הרמה. |

**עקרון "לא מוחקים עבודה":** מה שהוסר מ-MVP-A לא נמחק — הוא יושב ב-§10 (נספח מורחב/דחוי) עם תנאי החזרה (בדיקת פרטיות נפרדת). הסכימה של MVP-A היא **תת-קבוצה בטוחה-לביקורת** של החזון הרחב.

> ⚠️ **תלות במסמכים נלווים:** `flags-protocol.md`, `governance.md` ודמו `educator-pulse.html` נכתבו על מודל 1.3 והם עדיין מתייחסים ל-`FlagEvent`/יועצת. **תיאום ביניהם לגרסה 3.0 הוא משימה נפרדת** (ראו דיווח למתכלל) — מחוץ לסקופ של W0-01.

---

## 0. חמשת עקרונות המודל

1. **`mode` על כל אירוע.** כל רשומה שמתעדת *התרחשות* (check-in, שליחת משימה, הגשה, פנייה, הודעה, מעבר מצב) נושאת `mode ∈ {routine, remote, emergency}`. זה **ציר הניתוח המרכזי** — כל דוח/מגמה נחתך לפיו. ישויות *סטטיות* (תלמיד, כיתה, בית ספר, איש צוות) אינן אירועים ואין להן `mode`.
2. **מקור אמת יחיד — אפס שכפול.** התוכן נכתב פעם אחת ב-`ContentUnit`. הקצאה (`Assignment`) *מפנה* אליו ב-FK. סטטוס אישי (`Submission`) מפנה להקצאה. הדשבורדים (מחנך/מנהל/פיקוח) הם **שאילתות מסננות על אותן שורות** — לא טבלאות סיכום.
3. **RBAC נאכף בשאילתה, לא בכפילות טבלאות.** אותה טבלה, היקף גישה שונה לפי `StaffRole`. פיקוח ארצי קורא מ**היטל מצרפי נגזר** (`NationalPulseView`, §11) שאין בו עמודת זהות ואף FK לתלמיד — **drill לתלמיד בודד אינו אסור, הוא בלתי-אפשרי מבנית** (prd §10; מטריצה מלאה = W0-02).
4. **משך גמיש — בלי "10 דקות" בשום מקום.** המשך יושב ב-`LearningDuration` (§2). ברירת המחדל במסך תלמיד/חירום היא **מנה קצרה ומפורקת** — גמישות בתשתית, עמדה פדגוגית בברירת המחדל.
5. **מזעור מובנה על קטינים (תיקון 13).** כל שדה שנוגע בקטין מסומן בעמודת **מינימיזציה** (מה לא נשמר ולמה). אוספים את המינימום לתפעול; מצב פעילות = **יומי גס** (פעיל/חלקי/לא נראה), בלי מעקב-שניות — **נאכף במבנה ב-§3.9 (W0-S1):** רשומה אחת ליום פר-תלמיד, בלי `activeSeconds`/`lastActiveAt`/חותמות-זמן מדויקות; check-in רגשי מתריע ונמחק.

---

## 1. מפת הישויות

**14 ישויות הליבה** (מהמשימה: משתמשים · בתי ספר · כיתות · יחידות · הקצאות · הגשות · ציונים · אירועים · check-in · יומן קשר) + ישויות תמיכה שמחברות אותן בלי כפילות:

| קבוצה | ישויות |
|-------|--------|
| **משתמשים** (זהות + הרשאה) | `Student` · `StaffMember` · `StaffRole` |
| **ארגון** | `School` · `Class` |
| **יחידות ותוכן** | `ContentUnit` (עם `LearningDuration` מוטבע) · `Topic` · `Skill` · `LearningSequence` · `EnrichmentTrack` |
| **הקצאות והגשות** | `Assignment` · `Submission` (נושאת **ציון**) · `Attachment` · `StudentProgress` · `SupportProfile` |
| **check-in וניטור** | `CheckIn` · `DailyPresence` (מצב יומי גס) · `SystemMode` |
| **יומן קשר והודעות** | `ContactLog` · `Notification` |
| **אירועים (מערכת)** | `AuditEvent` (לוג ביקורת מינימלי) |

> **הערה:** "משתמשים" = `Student` **או** `StaffMember`; אין טבלת-על אחת כי הפרדת התלמיד מהצוות היא עצמה בקרת פרטיות (תלמיד לא נכנס לטבלת הצוות ולהפך). התפקיד תמיד ב-`StaffRole` — כך אדם אחד מחזיק כמה תפקידים (מורה מקצועי שהוא גם מחנך) בלי שכפול רשומה.

### דיאגרמת ישויות (Mermaid erDiagram)

```mermaid
erDiagram
    SCHOOL ||--o{ CLASS : "מכיל כיתות"
    SCHOOL ||--o{ SYSTEM_MODE : "יומן מצבים"
    STAFF_MEMBER ||--o{ STAFF_ROLE : "מחזיק תפקידים (כמה)"
    SCHOOL ||--o{ STAFF_ROLE : "היקף (null לפיקוח ארצי)"

    CLASS ||--o{ STUDENT : "משבץ תלמידים"
    CLASS }o--|| STAFF_MEMBER : "מחנך"

    STAFF_MEMBER ||--o{ ASSIGNMENT : "שולח"
    CLASS ||--o{ ASSIGNMENT : "יעד"
    CONTENT_UNIT ||--o{ ASSIGNMENT : "מופנה מ (ללא העתקה)"
    CONTENT_UNIT ||--o{ CONTENT_UNIT : "גרסה נגישה של"

    ASSIGNMENT ||--o{ SUBMISSION : "מייצר סטטוס"
    STUDENT ||--o{ SUBMISSION : "מגיש"
    ASSIGNMENT ||--o{ ATTACHMENT : "חומר שהמורה צירף"

    ENRICHMENT_TRACK ||--o{ CONTENT_UNIT : "מסלול העשרה (5-6 יחידות)"
    LEARNING_SEQUENCE ||--o{ CONTENT_UNIT : "רצף מסודר (יחידה N מ-M)"
    TOPIC ||--o{ LEARNING_SEQUENCE : "נושא בתוכנית הלימודים"
    TOPIC ||--o{ CONTENT_UNIT : "היחידה מלמדת נושא"
    SKILL ||--o{ CONTENT_UNIT : "היחידה בונה מיומנות"
    STUDENT ||--o{ STUDENT_PROGRESS : "מפת התקדמות (פר-מסלול)"
    LEARNING_SEQUENCE ||--o{ STUDENT_PROGRESS : "מיקום ברצף"
    STUDENT ||--o{ SUPPORT_PROFILE : "רמת תמיכה פר-מקצוע"

    STUDENT ||--o{ CHECKIN : "עושה"
    STUDENT ||--o{ DAILY_PRESENCE : "מצב יומי גס (נגזר)"
    STUDENT ||--o{ CONTACT_LOG : "נושא הפנייה"
    STAFF_MEMBER ||--o{ CONTACT_LOG : "מתעד"
    STUDENT ||--o{ NOTIFICATION : "נמען (או הורה)"
    STAFF_MEMBER ||--o{ NOTIFICATION : "נמען"
    STAFF_MEMBER ||--o{ AUDIT_EVENT : "פעולה מתועדת"

    SCHOOL {
        string id PK
        string name
        string network "רשת"
        string district "מחוז"
    }
    CLASS {
        string id PK
        string school_id FK
        string name "י'3"
        string grade "ט/י/יא/יב"
        string homeroom_teacher_id FK "מחנך"
    }
    STUDENT {
        string id PK
        string first_name "שם פרטי בלבד"
        string class_id FK
        string phone "לקישור אישי"
        string guardian_phone "רשות — יידוע הורה"
        bool guardian_opted_out "opt-out יידוע הורה"
        string access_token "כניסה בלי סיסמה"
        bool registered "נרשם לשכבת הלמידה"
        bool active "מצבת פעילה"
        datetime created_at
    }
    STAFF_MEMBER {
        string id PK
        string first_name
        string phone
        string access_token
        bool active
    }
    STAFF_ROLE {
        string id PK
        string staff_id FK
        string role "homeroom/subject/principal/supervisor"
        string school_id FK "היקף (null לפיקוח)"
        string subject "למפקח מקצועי (nullable)"
        bool active
    }
    CONTENT_UNIT {
        string id PK
        string title
        string subject
        string grade
        string body "פתיח + מטלה"
        string unit_type "task/assessment/reference"
        string track_id FK "מסלול העשרה (nullable)"
        string sequence_id FK "מסלול למידה (nullable)"
        string topic_id FK "נושא (nullable)"
        string skill_ids "מערך מיומנויות"
        int sequence_order "מיקום ברצף"
        string content_source "internal/external"
        string external_ref "קמפוס IL/מטח (nullable)"
        json duration "LearningDuration — §2"
        string modes_allowed "מערך routine/remote/emergency"
        bool accessibility "מותאם ללקויות למידה"
        string parent_unit_id FK "גרסה נגישה — מפנה למקור"
        string curated_by FK "אוצרות אנושית"
        bool active
    }
    TOPIC {
        string id PK
        string subject
        string grade
        string title "מערכת הצורות / הרשות המחוקקת"
        string curriculum_ref "עיגון תכל (nullable)"
        int display_order
    }
    SKILL {
        string id PK
        string subject
        string title "זיהוי נושא ונשוא"
        string topic_id FK "nullable"
    }
    LEARNING_SEQUENCE {
        string id PK
        string subject
        string grade
        string topic_id FK "nullable"
        string title "מסלול אזרחות י׳"
        int unit_count "M ב-N מתוך M"
        string curriculum_ref "nullable"
        string authored_by FK "מי בנה"
    }
    ENRICHMENT_TRACK {
        string id PK
        string title "צילום / פיננסי / יזמות"
        string theme
        string description
    }
    ASSIGNMENT {
        string id PK
        string content_unit_id FK "הפניה — לא העתקה"
        string class_id FK
        string assigned_by FK
        string mode "מוטבע מ-SystemMode"
        date scheduled_for "יכול להיות עתידי"
        string override_body "התאמת AI חד-פעמית (nullable)"
        json duration_override "LearningDuration חלופי (nullable)"
        datetime created_at
    }
    SUBMISSION {
        string id PK
        string assignment_id FK
        string student_id FK
        string status "not_started/started/completed"
        string feedback "משוב מילולי רשות"
        string grade "ציון — רק על assessment (nullable)"
        string support_level "with_you/on_own/ahead"
        string mastery "core/full"
        bool hint_used "בוליאני גס — לא לוג"
        bool recovered_after_error
        bool rescue_path
        bool seen_by_teacher "ראיתי → 'המורה ראה'"
        string mode
        datetime completed_at
    }
    ATTACHMENT {
        string id PK
        string assignment_id FK "חומר המורה — לא מתלמיד"
        string uploaded_by FK "מורה בלבד"
        string filename
        string storage_ref
        int size_kb
        datetime created_at
    }
    STUDENT_PROGRESS {
        string id PK
        string student_id FK
        string sequence_id FK
        int current_order
        string next_unit_id FK "הצעד הבא"
        string next_source "sequence/rescue/enrichment"
        string skills_acquired "מערך skill_id"
        string skills_pending "מערך skill_id"
        bool teacher_approved "ברירת מחדל true"
        datetime updated_at
    }
    SUPPORT_PROFILE {
        string id PK
        string student_id FK
        string subject "פר-מקצוע — לא תווית"
        string chosen_level "with_you/on_own/ahead"
        string recommended_level "nullable"
        string active_level
        string set_by "self/system"
        datetime updated_at
    }
    CHECKIN {
        string id PK
        string student_id FK
        date day
        string mode
        string type "presence/emotional"
        string mood "1 מ-4 — חירום בלבד — רגיש"
        bool distress_flag "דגל למחנך — עכשיו"
        bool is_sensitive
        bool alert_sent "התראה נשלחה למחנך"
        bool seen_by_educator "המחנך ראה"
        date purge_after "רגשי: יצירה + טווח קצר"
        datetime created_at
    }
    DAILY_PRESENCE {
        string id PK
        string student_id FK
        date day
        string state "active/partial/not_seen — גס בלבד"
        string mode
    }
    SYSTEM_MODE {
        string id PK
        string school_id FK
        string mode "routine/remote/emergency"
        string activated_by FK "מנהל / national"
        date scheduled_for "nullable"
        string note "חובה במעבר"
        datetime activated_at
    }
    CONTACT_LOG {
        string id PK
        string student_id FK
        string staff_id FK "מחנך"
        date day
        string mode
        string outcome "contacted/no_answer/referred_to_parent"
        string channel "whatsapp/sms/phone"
        string followup "none/retry/parent/escalate — שדה מובנה"
        date delete_after "מחיקה אוטומטית"
        datetime created_at
    }
    NOTIFICATION {
        string id PK
        string recipient_kind "student/parent/staff"
        string recipient_id FK
        string channel "whatsapp/sms"
        string kind "personal_link/task/weekly_parent/mode_change/daily_report/teacher_saw"
        string mode
        string payload_ref "הפניה — לא העתקת תוכן"
        string status "queued/sent/delivered/read"
        datetime created_at
    }
    AUDIT_EVENT {
        string id PK
        string actor_id FK "staff/admin"
        string action "login/mode_change/export/access_grant/purge"
        string entity_ref "על מה הפעולה"
        string mode
        date delete_after "מדיניות שמירה"
        datetime created_at
    }
```

---

## 2. `LearningDuration` — מודל המשך הגמיש (הריגת "10 דקות")

**זה השדרוג המרכזי של W0-01.** אין `est_minutes` ואין "10 דק'" מקובעים. המשך הוא **אובייקט מוטבע** על `ContentUnit.duration` (וניתן לדריסה חד-פעמית ב-`Assignment.duration_override` **בלי לשנות את המקור**), בדיוק לפי prd §5:

```ts
type DurationMode = "fixed" | "estimated" | "self_paced" | "teacher_controlled";

interface LearningDuration {
  mode: DurationMode;        // איך נקבע הזמן
  minMinutes?: number;       // רשות
  targetMinutes?: number;    // רשות — "כ-X דקות"
  maxMinutes?: number;       // רשות
  allowExtension: boolean;   // מותר לחרוג/להאריך
}
```

**כלל ההצגה לתלמיד (נגזר מ-`mode`, אף פעם לא badge ריק, אף פעם לא טיימר מלחיץ כברירת מחדל):**

| `mode` | דוגמת נתונים | מה התלמיד רואה |
|--------|--------------|-----------------|
| `estimated` | `target=5, allowExtension:true` | "כ-5 דקות · אפשר לעצור ולהמשיך" |
| `estimated` | `min=15, max=25` | "בערך 15–25 דקות" |
| `self_paced` | — | "בקצב שלך" |
| `teacher_controlled` | — | "בהנחיית המורה" |
| `fixed` (מופע הערכה) | `target=20` | "20 דקות" (טיימר מוצג רק כאן) |

- **ברירת המחדל במסך תלמיד/חירום = מנה קצרה ומפורקת.** בחירום ברירת המחדל קצרה יותר; מסלול הצלה קצר משמעותית מהמסלול המלא. (עמדה פדגוגית בברירת המחדל — לקהל עם קשיי קשב, היעדר עמדה הוא באג.)
- **פיצול יחידה למקטעים** ושינוי משך בהקצאה נעשים ב-`duration_override` / `sequence_order` — **המקור לא משתנה**.
- מי קובע: יוצר היחידה / המורה המקצה / תוכנית הלימודים / מצב המערכת — או המלצה בלבד.

---

## 3. טבלאות שדות + החלטת מינימיזציה

> עמודת **מינימיזציה** מופיעה בכל שדה שנוגע בקטין. 🔴=לא נאסף ב-MVP · 🟡=מצומצם/נעול · 🟢=נאסף (מוצדק, מינימלי). שאר הסוכנים כפופים לעמודה הזו.

### 3.1 Student — תלמיד
| שדה | טיפוס | תיאור | מינימיזציה |
|------|-------|--------|-------------|
| id | PK | מזהה פנימי | 🟢 מזהה פנימי, לא ת"ז |
| first_name | string | שם פרטי בלבד | 🟡 אין שם משפחה/ת"ז/כתובת |
| class_id | FK→Class | הכיתה | 🟢 שיוך תפעולי |
| phone | string | לשליחת הקישור האישי | 🟢 מינימום לקשר |
| guardian_phone | string? | טלפון הורה — יידוע בלבד | 🟡 **השדה היחיד על הורה**. אין פרופיל/לוגין הורה |
| guardian_opted_out | bool | ההורה ביקש להסיר יידוע | 🟢 חובה חוקית (opt-out) |
| access_token | string | כניסה בקישור בלי סיסמה | 🟡 סוד — לא נחשף בדשבורדים |
| registered | bool | נרשם לשכבת הלמידה. `false` = עדיין יכול לעשות check-in | 🟢 הרשמה קלה, מינימום מזהה |
| active | bool | במצבת הפעילה | 🟢 |

**אין:** ממוצע פומבי · ת"ז · כתובת · **תיוג רמת תלמיד** (חלש/בינוני/חזק — 🔴 אסור בכלל; תמיכה מוגדרת ברמת רגע/מיומנות, לא תלמיד) · **פרופיל מיומנויות מתמשך** (🟡 בלי היסטוריה נצברת ב-MVP).

### 3.2 StaffMember — בעל תפקיד (זהות האדם)
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id / first_name / phone / access_token / active | | זהות האדם בלבד; התפקידים ב-`StaffRole`. **אין שדה `gender`** — נוסח נייטרלי מגדרית לכל פנייה למחנך. |

### 3.3 StaffRole — תפקיד (כמה לאדם) · בסיס ה-RBAC
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| staff_id | FK→StaffMember | אותו אדם — כמה שורות |
| role | enum | `homeroom` (מחנך) / `subject` (מורה מקצועי) / `principal` (מנהל) / `supervisor` (מפקח) |
| school_id | FK→School? | היקף התפקיד; `null` לפיקוח ארצי |
| subject | string? | תחום הדעת (למפקח מקצועי) |
| active | bool | |

> הגישה בפועל = **איחוד** הרשאות התפקידים הפעילים. הרזולוציה יורדת ככל שעולים בהיררכיה (מחנך=פרטני בכיתתו → מנהל=מצרפי בית-ספרי → פיקוח=מצרפי ארצי). המטריצה המלאה = **W0-02** (`roles.html`). `role=counselor` — ראו §10 (מורחב).

### 3.4 ContentUnit — יחידת ספרייה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id / title / subject / grade | | |
| body | text | פתיח + מטלה ברורה |
| unit_type | enum | `task` / `assessment` (נושא ציון) / `reference` (הפניה חיצונית) |
| track_id | FK→EnrichmentTrack? | `null` = תוכן ליבה |
| sequence_id | FK→LearningSequence? | `null` = יחידה עצמאית |
| topic_id | FK→Topic? | מחבר מקצוע→נושא→יחידה |
| skill_ids | array | מיומנויות שהיחידה בונה |
| sequence_order | int? | מיקום ברצף (N מתוך M) |
| content_source | enum | `internal` / `external` |
| external_ref | string? | קישור לקמפוס IL/מטח — כשזה `reference` |
| **duration** | `LearningDuration` | **§2 — מחליף את `est_minutes`. בלי "10 דק'" מקובע** |
| modes_allowed | array | כולל תיוג "מתאים לחירום" |
| accessibility | bool | מותאם ללקויות למידה |
| **level** | enum | **וריאנט הרמה: `basic` / `standard` / `advanced` (3 רמות).** מתלכד עם רמת התמיכה של התלמיד: `basic`↔`with_you` · `standard`↔`on_own` · `advanced`↔`ahead`. `standard` = ברירת מחדל. התלמיד לא רואה את שם הרמה (content-standard §2). |
| parent_unit_id | FK→ContentUnit? | גרסה נגישה — מפנה למקור, לא מעתיקה. יחד עם `level` מקשר את שלושת הווריאנטים של אותה מנה |
| curated_by | FK→StaffMember | אוצרות אנושית |
| active | bool | |

### 3.5 Topic / Skill / LearningSequence / EnrichmentTrack
`Topic` (נושא בתכל: subject/grade/title/curriculum_ref/display_order) · `Skill` (מיומנות: subject/title/topic_id) · `LearningSequence` (רצף מסודר: subject/grade/topic_id/title/unit_count/curriculum_ref/authored_by) · `EnrichmentTrack` (אוסף 5-6 יחידות בכל סדר: title/theme/description). *מבנה זהה ל-1.3 — לא השתנה.* המסלול נגזר בשאילתה: יחידות עם אותו `sequence_id`, ממוינות לפי `sequence_order`.

### 3.6 Assignment — שליחת משימה לכיתה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| content_unit_id | FK→ContentUnit | **הפניה** — מקור אמת יחיד |
| class_id | FK→Class | כיתת יעד |
| assigned_by | FK→StaffMember | |
| mode | enum | מוטבע מ-`SystemMode` הנוכחי בעת השליחה |
| scheduled_for | date | יכול להיות עתידי |
| override_body | text? | התאמת AI מאושרת חד-פעמית. `null` = משתמשים ב-`body` המקורי |
| **duration_override** | `LearningDuration`? | משך חלופי להקצאה זו **בלי לשנות את המקור** (§2) |

### 3.7 Submission — סטטוס תלמיד + ציון
| שדה | טיפוס | תיאור | מינימיזציה |
|------|-------|--------|-------------|
| assignment_id / student_id | FK | | |
| status | enum | `not_started`/`started`/`completed` | 🟢 סטטוס גס |
| feedback | text? | משוב מילולי-רשות מהמורה | 🟢 |
| **grade** | string? | ציון — **רק** כש-`unit_type=assessment`. `null` על משימה רגילה | 🟢 אישי (תלמיד+מורה), בלי ממוצע פומבי, בלי השוואה |
| support_level | enum? | `with_you`/`on_own`/`ahead` — באיזו רמה נעשתה | 🟡 בין תלמיד למורה, לא פומבי |
| mastery | enum? | `core`/`full` — הבין ליבה או ליבה+הרחבות | 🟡 מידע פדגוגי, לא כישלון |
| hint_used | bool | נעזר ברמז | 🟡 **בוליאני גס אחד** — לא לוג, בלי `hintsUsed` נספר, בלי חותמת זמן |
| recovered_after_error | bool | טעה ואז הצליח | 🟡 בוליאני גס |
| rescue_path | bool | נעשתה בגרסת מסלול ההצלה | 🟡 |
| seen_by_teacher | bool | "ראיתי" → מפעיל "המורה ראה" | 🟢 |
| mode | enum | מוטבע לניתוח | |
| completed_at | datetime? | חותמת סיום הגשה — **אירועית, לא רציפה** | 🟡 **W0-S1:** חותמת חד-פעמית פר-הגשה, לא מעקב. שממנה נגזר רק ה-`day` ל-`DailyPresence`. **אין** נתיב שאילתה שמפיק ממנה משך-משימה / שעת-פעילות / `activeSeconds` לתלמיד. אם אין צורך בסדר תוך-יומי — לצמצם ל-`date` |

> חמשת שדות הלמידה (`support_level`/`mastery`/`hint_used`/`recovered_after_error`/`rescue_path`) הם **מדדי הלמידה האמיתיים** — מבדילים בין "לחץ עד הסוף" ל"הבין". הם **בוליאנים/enum גסים פר-הגשה**, לא מעקב ברזולוציית שנייה — ולכן עומדים בעקרון המצב-הגס (`security-minimization.md` §3 שורה 2). ראו שאלה פתוחה §9.3.

### 3.8 CheckIn — צ'ק-אין (מתריע ונמחק)
| שדה | טיפוס | תיאור | מינימיזציה |
|------|-------|--------|-------------|
| student_id | FK | | |
| day | date | | |
| mode | enum | | ציר ניתוח |
| type | enum | `presence` ("אני כאן") / `emotional` ("איך אתה היום?", חירום) | |
| mood | enum? | 1 מ-4 — **חירום בלבד** | 🟡 **רגיש** — נמחק (ראו למטה) |
| distress_flag | bool | מצוקה — דגל למחנך בלבד, סימן ולא תיעוד קליני | 🟡 נגזר מ-mood, נמחק |
| is_sensitive | bool | `true` כאשר `type=emotional` | |
| alert_sent | bool | ההתראה למחנך יצאה | 🟢 עובדה תפעולית |
| seen_by_educator | bool | "המחנך ראה" | 🟢 |
| purge_after | date? | ל-check-in רגשי: `created_at` + טווח קצר (ברירת מחדל **מוקדם ככל האפשר** — סעיף אחסון §9). בתאריך זה `mood`+`distress_flag` **מתאפסים**. | 🟡 תיקון 13 |
| created_at | datetime | | |

> **מדיניות MVP-A (3.0, בטוחה-לביקורת):** ה-check-in הרגשי **מתריע למחנך עכשיו (`alert_sent`) ואז התוכן הרגשי נמחק** — **לא נבנית היסטוריה רגשית על קטין**. סטטוס חד-פעמי, לא לוג (`security-minimization.md` §3 שורה 3). עובדת הנוכחות הבסיסית (שהתלמיד נראה ביום X) איננה רגישה ונשמרת ב-`DailyPresence` (§3.9). **שמירת מטא-דגלים לאורך זמן (`FlagEvent`) והתפקיד שצורך אותה (יועצת) — לא ב-MVP-A. ראו §10.**

### 3.9 DailyPresence — מצב יומי גס (החלופה למעקב-שניות) · **W0-S1**
| שדה | טיפוס | תיאור | מינימיזציה |
|------|-------|--------|-------------|
| student_id | FK | | |
| day | date | **תאריך בלבד — בלי חלק שעה** | 🟢 גרעיניות יום |
| state | enum | **`active`** (עשה check-in + פעולה) / **`partial`** (נכנס, בלי פעולה) / **`not_seen`** (אין אות) | 🟡 **הרזולוציה היחידה** של פעילות |
| mode | enum | | |

> זהו **מקור האות היחיד** לשאלות "מי נראה / מי נעלם" בכל הדשבורדים. נגזר יומית מקיום `CheckIn`/`Submission`, ומגלם את דרישת המינימיזציה: **פעיל/חלקי/לא נראה — בלי `activeSeconds`, בלי `lastActiveAt`, בלי חותמות זמן מדויקות** (`security-minimization.md` §3 שורה 2). המערכת לא יודעת "כמה שניות במסך".
>
> **אכיפת W0-S1 (מצב יומי גס — לא מעקב-שניות) — נאכף במבנה:**
> - **מפתח הרשומה = `(student_id, day)`** — לכל תלמיד **רשומה אחת ליום לכל היותר**. אין שורות תוך-יומיות, אין לוג אירועי פעילות. שינוי המצב במהלך היום = **עדכון אותה שורה** (`not_seen`→`partial`→`active`), לא רשומה חדשה.
> - **אין שדה `created_at`/`updated_at`/חותמת-זמן** על `DailyPresence` — בכוונה. השדה היחיד לזמן הוא `day` (תאריך). הוספת חותמת-זמן כאן = חריגה מ-W0-S1.
> - **שדות אסורים במפורש** (לא קיימים ולא ייווספו ב-MVP-A): `activeSeconds` · `activeMinutes` · `timeOnTask` · `lastActiveAt` · `firstSeenAt` · `sessionCount` · `screenTime` · כל מונה/חותמת ברזולוציית שנייה/דקה.
> - **`state` הוא enum גס משלושה ערכים** — לא סקלה, לא אחוז, לא ציון פעילות. `partial`/`active` נגזרים מ**קיום** אות (check-in / הגשה), לא מ**כמות** או **משך**.
> - הדשבורדים (מחנך/מנהל/פיקוח) קוראים אך ורק את `state` + `day`; **אין נתיב שאילתה** שמחזיר משך/שניות/שעת-פעילות של תלמיד (עקבי עם §5–§6).

### 3.10 SystemMode — יומן מצבי המערכת (פר בית ספר)
`school_id · mode · activated_by (null+note="national" בהפעלה ארצית) · scheduled_for? · note (חובה במעבר) · activated_at`. **מקור האמת למצב הנוכחי** = הרשומה האחרונה של בית הספר. בעת יצירת כל אירוע, ה-`mode` **מוטבע** ממנה קדימה — אין עדכון בדיעבד. מעבר מצב הוא עצמו אירוע.

### 3.11 ContactLog — יומן קשר (שדות מובנים בלבד)
| שדה | טיפוס | תיאור | מינימיזציה |
|------|-------|--------|-------------|
| student_id | FK | על מי הפנייה | |
| staff_id | FK | המחנך שפנה | |
| day | date | | |
| mode | enum | | |
| outcome | enum | `contacted` / `no_answer` / `referred_to_parent` | 🟢 מובנה |
| channel | enum | `whatsapp` / `sms` / `phone` | 🟢 מובנה |
| followup | enum | `none` / `retry` / `parent` / `escalate` — משימת המשך | 🟢 מובנה |
| delete_after | date | מחיקה אוטומטית | 🟡 תיקון 13 |

> **שינוי מ-1.3:** הוסר שדה הטקסט החופשי `note`. יומן הקשר = **שדות מובנים בלבד** (ערוץ / תוצאה / משימת המשך) — "שדה חופשי הוא הכי מסוכן" (`security-minimization.md` §3 שורה 4). גישה למחנך המורשה בלבד (W0-02). הערת-טקסט חופשית (`StudentNote`) — ראו §10.

### 3.12 Attachment — חומר שהמורה צירף
`assignment_id · uploaded_by (מורה) · filename · storage_ref · size_kb · created_at`. 🔴 **קבצים מ-מורה בלבד** — **בלי העלאת קבצים מתלמיד ב-MVP** (`security-minimization.md` §3 שורה 6). מה שמגיע לתלמיד חייב לעבוד ברשת חלשה (מוקל/מומר).

### 3.13 StudentProgress / SupportProfile
`StudentProgress` (מפת התקדמות פר-מסלול: current_order/next_unit_id/next_source/skills_acquired/skills_pending/teacher_approved) ו-`SupportProfile` (רמת תמיכה פר-מקצוע: chosen/recommended/active_level/set_by) — *מבנה זהה ל-1.3.* 🟡 **הכבוד לתלמיד נאכף במבנה:** אין נתיב שאילתה שמחזיר את הרמות לתצוגה פומבית או להשוואה בין תלמידים; המורה רואה **פילוח מצרפי** לכיתתו בלבד. `SupportProfile` **אינו** פרופיל מיומנויות מתמשך — הוא רמה-לפעילות-הזו, בלי היסטוריה נצברת (`security-minimization.md` §3 שורה 7). *(שדות `rescue_entries`/`rescue_recoveries` המצטברים מ-1.3 → נדחים ל-§10 כדי לא לצבור היסטוריה על קטין ב-MVP.)*

### 3.14 Notification / AuditEvent
`Notification` (recipient_kind student/parent/staff · channel · kind · mode · payload_ref **הפניה, לא העתקת תוכן** · status). **אין ישות הורה** — נמען `parent` = `guardian_phone` של התלמיד. · `AuditEvent` (actor_id · action login/mode_change/export/access_grant/purge · entity_ref · mode · delete_after) — 🟢 לוג ביקורת **מינימלי**, גישה מוגבלת, מדיניות שמירה+מחיקה מוגדרת (`security-minimization.md` §3 שורה 12). זו ישות ה"אירועים" של המערכת.

---

## 4. seed JSON לדוגמה — ישות אחת לכל טבלה (לפרוטוטייפ)

> אובייקט לדוגמה לכל ישות, מוכן להזרמה ל-state של הפרוטוטייפ. תאריכים ILlustrative. שמות עבריים מגוונים.

```json
{
  "schools": [
    { "id": "sch_01", "name": "אורט בית הערבה", "network": "אורט", "district": "מחוז דרום" }
  ],
  "classes": [
    { "id": "cls_i2", "school_id": "sch_01", "name": "י'2", "grade": "י", "homeroom_teacher_id": "stf_dana" }
  ],
  "students": [
    { "id": "std_yuval", "first_name": "יובל", "class_id": "cls_i2", "phone": "0500000001",
      "guardian_phone": "0500000002", "guardian_opted_out": false, "access_token": "tok_yuval_128bit",
      "registered": true, "active": true, "created_at": "2026-09-01T08:00:00+03:00" }
  ],
  "staff_members": [
    { "id": "stf_dana", "first_name": "דנה", "phone": "0500000010", "access_token": "tok_dana_128bit", "active": true }
  ],
  "staff_roles": [
    { "id": "rol_01", "staff_id": "stf_dana", "role": "homeroom", "school_id": "sch_01", "subject": null, "active": true },
    { "id": "rol_02", "staff_id": "stf_dana", "role": "subject", "school_id": "sch_01", "subject": "לשון", "active": true }
  ],
  "topics": [
    { "id": "top_mishpat", "subject": "לשון", "grade": "י", "title": "משפט פשוט ומורכב", "curriculum_ref": "011281", "display_order": 3 }
  ],
  "skills": [
    { "id": "skl_nosenasu", "subject": "לשון", "title": "זיהוי נושא ונשוא", "topic_id": "top_mishpat" }
  ],
  "learning_sequences": [
    { "id": "seq_lashon_i", "subject": "לשון", "grade": "י", "topic_id": "top_mishpat",
      "title": "מסלול לשון י׳", "unit_count": 6, "curriculum_ref": "011281", "authored_by": "stf_dana" }
  ],
  "enrichment_tracks": [
    { "id": "trk_photo", "title": "מסלול צילום", "theme": "מדיה", "description": "6 יחידות עצמאיות בכל סדר" }
  ],
  "content_units": [
    { "id": "unt_mishpat_1", "title": "משפט פשוט מול משפט מורכב", "subject": "לשון", "grade": "י",
      "body": "פתיח: איך יודעים אם משפט פשוט או מורכב? ...", "unit_type": "task",
      "track_id": null, "sequence_id": "seq_lashon_i", "topic_id": "top_mishpat",
      "skill_ids": ["skl_nosenasu"], "sequence_order": 1, "content_source": "internal", "external_ref": null,
      "duration": { "mode": "estimated", "targetMinutes": 5, "allowExtension": true },
      "modes_allowed": ["routine", "remote", "emergency"], "accessibility": true,
      "parent_unit_id": null, "curated_by": "stf_dana", "active": true },
    { "id": "unt_mishpat_test", "title": "בוחן: זיהוי סוג משפט", "subject": "לשון", "grade": "י",
      "body": "5 משפטים — סווגו פשוט/מורכב.", "unit_type": "assessment",
      "track_id": null, "sequence_id": "seq_lashon_i", "topic_id": "top_mishpat",
      "skill_ids": ["skl_nosenasu"], "sequence_order": 6, "content_source": "internal", "external_ref": null,
      "duration": { "mode": "fixed", "targetMinutes": 20, "allowExtension": false },
      "modes_allowed": ["routine", "remote"], "accessibility": true,
      "parent_unit_id": null, "curated_by": "stf_dana", "active": true }
  ],
  "assignments": [
    { "id": "asg_01", "content_unit_id": "unt_mishpat_1", "class_id": "cls_i2", "assigned_by": "stf_dana",
      "mode": "emergency", "scheduled_for": "2026-11-12", "override_body": null,
      "duration_override": { "mode": "self_paced", "allowExtension": true }, "created_at": "2026-11-12T07:30:00+03:00" }
  ],
  "submissions": [
    { "id": "sub_01", "assignment_id": "asg_01", "student_id": "std_yuval", "status": "completed",
      "feedback": "יפה, שים לב למילת הקישור.", "grade": null, "support_level": "on_own", "mastery": "core",
      "hint_used": true, "recovered_after_error": true, "rescue_path": false, "seen_by_teacher": true,
      "mode": "emergency", "completed_at": "2026-11-12T09:10:00+03:00" }
  ],
  "attachments": [
    { "id": "att_01", "assignment_id": "asg_01", "uploaded_by": "stf_dana", "filename": "dapei-avoda.pdf",
      "storage_ref": "store/att_01", "size_kb": 180, "created_at": "2026-11-12T07:31:00+03:00" }
  ],
  "student_progress": [
    { "id": "prg_01", "student_id": "std_yuval", "sequence_id": "seq_lashon_i", "current_order": 2,
      "next_unit_id": "unt_mishpat_2", "next_source": "sequence",
      "skills_acquired": [], "skills_pending": ["skl_nosenasu"], "teacher_approved": true,
      "updated_at": "2026-11-12T09:10:00+03:00" }
  ],
  "support_profiles": [
    { "id": "sup_01", "student_id": "std_yuval", "subject": "לשון", "chosen_level": "on_own",
      "recommended_level": "with_you", "active_level": "on_own", "set_by": "self",
      "updated_at": "2026-11-12T09:10:00+03:00" }
  ],
  "checkins": [
    { "id": "chk_01", "student_id": "std_yuval", "day": "2026-11-12", "mode": "emergency", "type": "emotional",
      "mood": "hard", "distress_flag": true, "is_sensitive": true, "alert_sent": true,
      "seen_by_educator": true, "purge_after": "2026-11-19", "created_at": "2026-11-12T08:05:00+03:00" }
  ],
  "daily_presence": [
    { "id": "dp_01", "student_id": "std_yuval", "day": "2026-11-12", "state": "active", "mode": "emergency" }
  ],
  "system_modes": [
    { "id": "sm_01", "school_id": "sch_01", "mode": "emergency", "activated_by": "stf_principal",
      "scheduled_for": null, "note": "הפעלת חירום — הנחיית פיקוד העורף", "activated_at": "2026-11-12T06:00:00+03:00" }
  ],
  "contact_logs": [
    { "id": "cl_01", "student_id": "std_yuval", "staff_id": "stf_dana", "day": "2026-11-12", "mode": "emergency",
      "outcome": "contacted", "channel": "whatsapp", "followup": "retry", "delete_after": "2027-11-12",
      "created_at": "2026-11-12T10:20:00+03:00" }
  ],
  "notifications": [
    { "id": "ntf_01", "recipient_kind": "parent", "recipient_id": "std_yuval", "channel": "whatsapp",
      "kind": "weekly_parent", "mode": "emergency", "payload_ref": "weekly/std_yuval/2026-W46",
      "status": "sent", "created_at": "2026-11-13T16:00:00+03:00" }
  ],
  "audit_events": [
    { "id": "aud_01", "actor_id": "stf_principal", "action": "mode_change", "entity_ref": "sm_01",
      "mode": "emergency", "delete_after": "2027-11-12", "created_at": "2026-11-12T06:00:00+03:00" }
  ]
}
```

---

## 5. איך הזרימה עובדת בלי שכפול נתונים

```
ספרייה            מורה מקצועי         תלמיד              דשבורדים (עדשות, לא עותקים)
ContentUnit  ──►  Assignment    ──►  Submission   ──►  מחנך: CheckIn+DailyPresence+ContactLog (כיתתו, הווה)
(תוכן, פעם     (FK ל-content,     (FK ל-assignment,   מנהל: אגרגט על School (סטטוסים, לא תוכן)
 אחת)           mode מוטבע)        status+mode)        פיקוח: אגרגט על network/district (COUNT/% — אין שם תלמיד)
```

- **התוכן חי במקום אחד** (`ContentUnit`); כל השרשרת מפנה אליו ב-FK. שינוי ניסוח = שורה אחת.
- **הדשבורדים הם שאילתות מסננות** על אותן שורות `Submission`/`CheckIn`/`DailyPresence`/`ContactLog`, ברזולוציות שונות לפי `StaffRole`. ההפרדה נאכפת בהיקף השאילתה — לא בהעתקת נתונים.
- **`mode` מוטבע** על כל אירוע → כל דוח נחתך לפי מצב בלי טבלה נפרדת.

---

## 6. שאילתות לדוגמה (במלל)

1. **"מי לא נראה יומיים בכיתה י'2?"** (דופק מחנך) — כל `Student` פעיל בכיתה עם `DailyPresence.state='not_seen'` ליומיים אחרונים → צהוב; שלושה ימים ומעלה, או `CheckIn.distress_flag` היום → אדום.
2. **"רשימת האדומים בבית הספר היום + המחנך + האם פנו."** (מנהל) — `Student` אדום דרך `Class.school_id`, מצורף ל-`homeroom_teacher_id`, ובדיקה אם קיים `ContactLog` מ-24ש'. אין → "ממתין לפנייה".
3. **"שלושת המספרים של המנהל היום."** — (א) `Student` עם `DailyPresence.state IN (active,partial)` היום; (ב) מספר האדומים; (ג) `StaffMember` פעילים היום. חיתוך לפי `mode` הנוכחי.
4. **"אילו בתי ספר ירדו בדופק 3 ימים ברצף?"** (פיקוח) — לכל `School`, % נוכחות = (`DailyPresence` ≠ not_seen) / (פעילים), 3 ימים. יורד רצוף → "מוצע לתמיכה". **מצרפי בלבד — אין שם תלמיד/מורה ברזולוציה הזו.**
5. **"כמה נראו היום ארצית בבתי ספר במצב חירום?"** — כל `School` שרשומת `SystemMode` האחרונה = `emergency`; ספירת `DailyPresence.state≠not_seen` היום. מוחזר כמספר/אחוז ארצי, אופציונלית לפי `district` — בלי שמות.
6. **"אילו check-ins היום עוד לא ראה המחנך?"** — כל `CheckIn` של כיתתי מהיום עם `seen_by_educator=false`. אישור → מפעיל "המורה ראה".

---

## 7. הגדרת סיום — כל מסך → הישויות שהוא קורא/כותב (תמצית)

| תצוגה (prd §8) | קורא | כותב |
|----------------|------|------|
| תלמיד — check-in | CheckIn, SystemMode | CheckIn (מתריע), DailyPresence |
| תלמיד — יחידה (משך גמיש) | Assignment, ContentUnit(`duration`), Attachment | Submission (status) |
| תלמיד — מופע הערכה | Assignment→ContentUnit(`assessment`) | Submission (grade — אישי) |
| מורה — שלח משימה | ContentUnit, Class | Assignment (+`duration_override`) |
| מורה — לוח הגשות + הערכה | Submission, Student | Submission.seen_by_teacher/grade, Notification |
| מחנך — דופק כיתתי | DailyPresence, CheckIn, Student, Class | CheckIn.seen_by_educator |
| מחנך — יומן קשר | ContactLog | ContactLog (מובנה) |
| מנהל — 3 מספרים + מתג מצב | DailyPresence, Submission, StaffMember, SystemMode | SystemMode, Notification |
| ספרייה | ContentUnit, EnrichmentTrack, LearningSequence | ContentUnit (אוצרות) |
| פיקוח ארצי — מצרפי | **`NationalPulseView` בלבד** (§11 — היטל מצרפי, בלי עמודת זהות) | Notification (broadcast לפי scope) |
| הורים — יידוע | Student.guardian_phone | Notification (weekly_parent) |
| Admin / מערכת | AuditEvent | AuditEvent |

---

## 8. שאלות פתוחות (לסגירה מול המשרד / מיטל)

1. **🔴 אחסון (Data Residency).** איפה הנתונים יושבים פיזית? להניח **ישראל** (הנחיית רמו"ט + נוהג משה"ח לרשומות קטינים), לוודא מול המשרד לפני כל הבטחה. משפיע על `storage_ref` ב-`Attachment` (`security-minimization.md` §4.1).
2. **🔴 טווח `purge_after` ל-check-in רגשי.** ברירת המחדל של 3.0 היא **מוקדם ככל האפשר** ("מתריע ונמחק"). כמה זמן בדיוק מחזיקים את ה-`mood` לפני איפוס — יום? עד סוף היום? להכריע עם מיטל/DPO (1.3 קבע 30 יום — נראה ארוך מדי לגרסת "בטוחה-לביקורת").
3. **🟡 `hint_used`/`recovered_after_error`.** נשמרו כבוליאנים גסים פר-הגשה (ערך פדגוגי). `security-minimization.md` §3 שורה 2 מזכיר `hintsUsed` כדבר למזער — לאשר שבוליאני-גס-אחד מקובל (בניגוד לספירה/חותמת זמן), או להסיר גם אותם.
4. **🟡 מדיניות שמירה ל-`ContactLog`/`AuditEvent`.** `delete_after` מוגדר כשדה — הערך המספרי (למשל שנה) טעון אישור DPO.
5. **🟡 ערך `k` ל-k-אנונימיות ב-`NationalPulseView`** (§11.3). סף הדחקת תא קטן במצרפי הארצי — מוצע `k ≥ 5`, טעון אישור DPO מול המשרד.

---

## 9. הערות מבניות

- **`School`** לא הופיע ברשימת עשר ישויות-הליבה, אך נדרש מבנית כדי שהזרימה לפיקוח (אגרגציה לפי בית ספר/רשת/מחוז) תעבוד **בלי טבלת סיכום נפרדת**. מוחזק דק (4 שדות), עוגן היררכיה בלבד.
- **"משתמשים"** = `Student` ∪ `StaffMember`; ההפרדה מכוונת (בקרת פרטיות). "אירועים" = `SystemMode` (מעברי מצב) + `AuditEvent` (לוג ביקורת).
- **RBAC** מוגדר כאן ברמת עיקרון (§0.3, `StaffRole`); המטריצה המלאה נאכפת ב-**W0-02**.

---

## 10. נספח — מורחב / דחוי (לא ב-MVP-A · נשמר, לא נמחק)

עבודת עיצוב מ-1.3 שהוצאה מ-MVP-A כדי לעמוד ב-3.0 "בטוחה-לביקורת". **חוזרת רק אחרי בדיקת פרטיות נפרדת ואישור DPO** (prd §9 "דחוי במפורש — נדחה, לא נאסר").

| רכיב 1.3 | מה זה | למה נדחה מ-MVP-A | תנאי החזרה |
|----------|-------|------------------|-------------|
| **`FlagEvent`** | מטא-דגל (trigger + `lit_on`) שנשמר לשנה, לזיהוי דפוס ארוך | מחזיק רשומה התנהגותית לאורך זמן על קטין הנגזרת מ-check-in רגשי — מתוח מול 3.0 "מתריע ונמחק בלי היסטוריה רגשית" | אישור DPO שמטא-בלבד (בלי `mood`) אינו מב"ר + מדיניות שמירה |
| **`role=counselor` (יועצת)** | תפקיד שצורך את `FlagEvent` לדפוס חוצה-כיתות | תלוי ב-`FlagEvent`; אינו בפרסונות של prd §8 | יחד עם `FlagEvent` |
| **`ContactLog.note` / `StudentNote`** | הערת טקסט חופשית של מחנך | "שדה חופשי הוא הכי מסוכן" (`security-minimization.md` §3 שורה 4) — הוחלף בשדות מובנים | אם בכלל — עם הגבלת אורך, גישה ומחיקה מוקשחות |
| **`SupportProfile.rescue_entries/recoveries`** | מונים מצטברים של כניסות/יציאות ממסלול הצלה | צובר היסטוריה על קטין; §3 שורה 7 (בלי פרופיל מתמשך) | כשיאושר פרופיל מתמשך |

> הגדרות השדות המלאות של הרכיבים האלה נשמרות בהיסטוריית git של גרסה 1.3 של הקובץ הזה — לא אבדו. תיאום `flags-protocol.md`/`governance.md` לגרסה 3.0 = משימה נפרדת.

---

## 11. גבול המצרפיות הארצית — נאכף במבנה (W0-S6)

**מזהה משימה:** W0-S6 · **מסמכי-אב:** prd §8 (פיקוח ארצי), §10 (`dashboard ארצי מצרפי — נאכף במודל הנתונים`) · `security-minimization.md` §3 שורה 5 · `governance.md` §1.2, §3.4

> **הבעיה:** עד כאן המצרפיות הארצית נשענה על **מוסכמת שאילתה** — "הפיקוח שואב `COUNT/%` בלבד" (§0.3, §6 שאילתות 4–5). זו **הצהרה**: מפתח שיכתוב `SELECT first_name` בטעות שובר אותה. הדרישה של W0-S6 היא **מבנית** — שהמבנה עצמו לא *יוכל* להחזיר תלמיד בודד, לא שיבטיח לא לעשות זאת.

### 11.1 העיקרון — אי אפשר לרדת (drill) לעמודה שאינה קיימת

התצוגה הארצית **לא ניגשת לטבלאות האירועים** (`Submission` · `CheckIn` · `DailyPresence` · `ContactLog`). היא ניגשת אך ורק ל**היטל מצרפי נגזר** (projection / view) בשם **`NationalPulseView`**, שאין בו — **מעצם צורתו** — אף עמודת זהות ואף FK לתלמיד/צוות/כיתה. drill לתלמיד בודד דורש או עמודת מזהה או מעקב FK אל `Student`; בהיטל אין לא זה ולא זה. **אין מה לבחור ואין אחרי מה לעקוב** — האיסור אינו כלל שזוכרים לאכוף, הוא היעדר מבני.

### 11.2 `NationalPulseView` — הסכימה (היטל מצרפי בלבד)

היטל קריאה נגזר (materialized view / read-model), **הישות היחידה** ש-`StaffRole` ארצי (§11.4) קורא ממנה:

| שדה | טיפוס | תיאור |
|------|-------|--------|
| scope_level | enum | `national` / `district` / `network` — **גאוגרפי/ארגוני בלבד** |
| scope_key | string | קוד מחוז/רשת. **לעולם לא מזהה אדם, כיתה או בית ספר בודד ברמת הפרט** |
| mode | enum | `routine`/`remote`/`emergency` — ציר הניתוח (§0.1) |
| period | date/range | יום או טווח |
| n_schools | int | בתי ספר בהיקף |
| n_schools_emergency | int | מתוכם במצב חירום |
| n_active / n_partial / n_not_seen | int | ספירת נוכחות מצרפית (מ-`DailyPresence`, מקובצת) |
| pct_seen | float | % שנראו |
| pct_completed | float | % השלמת משימות (מ-`Submission.status`, מקובץ) |

**נעדר מעצם הבנייה (לא "מוסתר" — פשוט לא קיים בהיטל):** `student_id` · `first_name` · `phone` · `access_token` · `staff_id` · `class_id` · `submission.grade` · כל תוכן `CheckIn`/`ContactLog`. אין FK מ-`NationalPulseView` לאף ישות זהות.

> **מבני מול הצהרתי:** שאילתה גולמית מעל `Student` עם מדיניות "רק `COUNT`" = הצהרתית (טעות אחת חושפת שם). היטל שאין בו עמודת זהות = מבנית (אין שם מה לחשוף). זה ההבדל ש-W0-S6 דורש.

### 11.3 k-אנונימיות — סגירת דליפת התא הקטן

מצרפיות **הכרחית אך לא מספקת**: תא בגודל 1 מזהה מחדש (מחוז עם בית ספר יחיד בחירום; בית ספר עם תלמיד פעיל יחיד → "המספר הזה = הילד הזה"). לכן ב-`NationalPulseView`:

- כל תא שאוכלוסיית הבסיס שלו `< k` — **מודחק** (מוחזר כ־`—/מוסך`) או **מתמזג כלפי מעלה** לרמת ה-scope ההורה, עד שהתא ≥ `k`.
- הכלל אכוף **בהגדרת ההיטל**, לא ב-UI — ה-UI לא יכול לבקש את התא המודחק כי ההיטל לא מחזיר אותו.
- **ערך `k` = שאלה פתוחה ל-DPO** (§8, סעיף חדש 5). מוצע סף שמרני (למשל `k ≥ 5`); ההכרעה מול המשרד.

### 11.4 קשירת ה-RBAC — למי מותר לקרוא מה

| `StaffRole` | `school_id` | ניגש ל | drill לתלמיד |
|-------------|-------------|--------|:---:|
| `supervisor` (פיקוח ארצי) | `null` | **`NationalPulseView` בלבד** (`scope_level=national/district`) | ✕ מבני |
| `supervisor` (מפקח מקצועי) | `null` + `subject` | היטל מצרפי לפי בית ספר/רשת בתחום הדעת — ללא עמודת זהות | ✕ מבני |
| `principal` | בית ספר | טבלאות האירועים בהיקף בית ספרו — **רשימת אדומים בלבד** ברזולוציית פרט (§6 שאילתה 2) | ✓ רק אדומים, בבית ספרו |

מפתח הפתרון (resolver): `StaffRole.school_id = null` **אינו** נפתר להיקף "כל בתי הספר בטבלאות האירועים" — הוא נפתר **אך ורק** ל-`NationalPulseView`. אין מסלול קוד שממפה תפקיד ארצי אל שורות `Student`.

### 11.5 הודעה ארצית = כתיבה בהיקף, לא קריאת יחידים

"הודעות ארציות" (prd §8) הן **כתיבת `Notification`** ממוקדת לפי `scope_key` (מחוז/רשת), שמפוזרת ע"י שירות ההתראות — הפיקוח הארצי **לא מקבל את רשימת הנמענים הקטינים**. broadcast לפי היקף, בלי enumerate של אנשים.

### 11.6 הגדרת סיום (W0-S6)

- ✅ תצוגה ארצית קוראת מ-`NationalPulseView` בלבד; אין FK/עמודת זהות בהיטל.
- ✅ `StaffRole` ארצי (`school_id=null`) נפתר להיטל בלבד — לא לטבלאות האירועים.
- ✅ k-anonymity אכוף בהיטל (ערך `k` = שאלה פתוחה ל-DPO).
- ✅ `governance.md` §1.2/§3.4 מפנים למנגנון המבני הזה (במקום ל-`§4.4` שלא היה קיים).
- ⏳ צריכת ההיטל ב-`national-map.html` = משימה נפרדת ודחויה (prd §9) — כשתיבנה, **חובה** שתקרא מ-`NationalPulseView`, לא מ-`Student`.
