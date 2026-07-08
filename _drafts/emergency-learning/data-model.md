# מערכת רציפות למידה — מודל הנתונים המשותף

**גרסה:** 1.1 · **תאריך:** 8.7.2026 · **סטטוס:** טיוטה לאישור
**מזהה משימה:** T0.2 · **מסמך-אב:** `spec.md`
**עדכון 1.1:** יושר לאפיון המעודכן — נוספו ציונים (`Submission.grade` על `unit_type=assessment`), הרשמה (`Student.registered`), קבצים (`Attachment`), מסלולי העשרה (`EnrichmentTrack`), פריטי הפניה חיצוניים, והערת מחנך (`StudentNote`).
**מיקום:** `_drafts/emergency-learning/`

---

## 0. עקרונות המודל

ארבעה כללים שמעצבים כל שדה וכל קשר במסמך הזה. הם נגזרים ישירות מעקרונות-העל של המערכת (spec.md §3, §7.2):

1. **`mode` על כל אירוע.** כל רשומה שמתעדת *התרחשות* (check-in, שליחת משימה, הגשה, פנייה, הודעה, מעבר מצב) נושאת שדה `mode` בערך `routine` / `remote` / `emergency`. זהו **ציר הניתוח המרכזי** של המערכת — כל דוח, כל מגמה וכל השוואה נחתכים לפיו. ישויות *סטטיות* (תלמיד, כיתה, איש צוות, בית ספר) אינן אירועים ולכן אין להן `mode`.
2. **מקור אמת יחיד — אפס שכפול.** התוכן נכתב פעם אחת ב-`ContentUnit`. משימה שנשלחת (`Assignment`) *מפנה* אליו ב-FK, לא מעתיקה אותו. הסטטוס האישי (`Submission`) מפנה ל-`Assignment`. הדשבורדים (מחנך / מנהל / פיקוח) הם **שאילתות מסננות על אותן שורות** — לא טבלאות סיכום נפרדות. הזרימה פיקוח←ספרייה←מורה←תלמיד←דשבורדים כולה קוראת מאותו גרף נתונים.
3. **מזעור ומחיקה מובנים (תיקון 13).** אוספים מינימום שדות (§7.2). ה-check-in הרגשי במצב חירום מסומן `is_sensitive` ותוכנו הרגשי נמחק אוטומטית **30 יום** מיצירתו. הפרדת הגישה נאכפת במבנה, לא בהצהרה: פיקוח שואב אגרגטים בלבד — אין נתיב שאילתה שמחזיר שם תלמיד לרמת הפיקוח.
4. **שתי שכבות — קשר ולמידה.** שכבת הקשר (`CheckIn`, "המורה ראה") היא הליבה ונכנסת **בלי הרשמה**. שכבת הלמידה (`Assignment`/`Submission`, מופעי הערכה) דורשת תלמיד רשום (`Student.registered`). **ציון קיים רק על מופע הערכה** (`ContentUnit.unit_type='assessment'`) ונשמר ב-`Submission.grade` — אישי, בלי ממוצע פומבי ובלי השוואה. בחירום ההערכה זמינה אך רשות; הקשר תמיד קודם וההרשמה לעולם לא חוסמת check-in.

---

## 1. דיאגרמת ישויות (Mermaid erDiagram)

```mermaid
erDiagram
    SCHOOL ||--o{ CLASS : "מכיל כיתות"
    SCHOOL ||--o{ SYSTEM_MODE : "יומן מצבים"
    STAFF_MEMBER ||--o{ SYSTEM_MODE : "מפעיל מצב"

    CLASS ||--o{ STUDENT : "משבץ תלמידים"
    CLASS }o--|| STAFF_MEMBER : "מחנך"

    STAFF_MEMBER ||--o{ ASSIGNMENT : "שולח"
    CLASS ||--o{ ASSIGNMENT : "יעד"
    CONTENT_UNIT ||--o{ ASSIGNMENT : "מופנה מ (ללא העתקה)"
    CONTENT_UNIT ||--o{ CONTENT_UNIT : "גרסה נגישה של"

    ASSIGNMENT ||--o{ SUBMISSION : "מייצר סטטוס"
    STUDENT ||--o{ SUBMISSION : "מגיש"

    ENRICHMENT_TRACK ||--o{ CONTENT_UNIT : "מסלול העשרה (5-6 יחידות)"
    ASSIGNMENT ||--o{ ATTACHMENT : "חומר שהמורה צירף"
    STAFF_MEMBER ||--o{ ATTACHMENT : "העלה"

    STUDENT ||--o{ CHECKIN : "עושה"
    STAFF_MEMBER ||--o{ CHECKIN : "ראה (nullable)"

    STUDENT ||--o{ CONTACT_LOG : "נושא הפנייה"
    STAFF_MEMBER ||--o{ CONTACT_LOG : "מתעד"

    STUDENT ||--o{ STUDENT_NOTE : "נושא ההערה"
    STAFF_MEMBER ||--o{ STUDENT_NOTE : "כותב (מחנך)"

    STUDENT ||--o{ NOTIFICATION : "נמען (או הורה)"
    STAFF_MEMBER ||--o{ NOTIFICATION : "נמען"

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
        string guardian_phone "רשות — להודעת הורים"
        string access_token "כניסה בלי סיסמה"
        bool registered "נרשם לשכבת הלמידה (ציונים)"
        bool active "מצבת פעילה"
    }
    STAFF_MEMBER {
        string id PK
        string first_name
        string role "homeroom/subject/principal/supervisor"
        string school_id FK "null לפיקוח"
        string phone
        string access_token
        bool active
    }
    CONTENT_UNIT {
        string id PK
        string title
        string subject "מקצוע"
        string grade "שכבה"
        string body "פתיח + מטלה (צעד 10 דק')"
        string unit_type "task/assessment/reference"
        string track_id FK "מסלול העשרה (nullable)"
        string content_source "internal/external"
        string external_ref "קמפוס IL/מטח — לפריט הפניה"
        int est_minutes "צעד=10; משימה=שרשרת צעדים"
        string modes_allowed "מערך: routine/remote/emergency"
        bool accessibility "מותאם ללקויות למידה"
        string parent_unit_id FK "גרסה נגישה — מפנה למקור"
        string curated_by FK "אוצרות אנושית"
        bool active
    }
    ENRICHMENT_TRACK {
        string id PK
        string title "מסלול צילום / פיננסי / יזמות"
        string theme
        string description
    }
    ATTACHMENT {
        string id PK
        string assignment_id FK "חומר המורה למשלוח זה"
        string uploaded_by FK "מורה"
        string filename
        string storage_ref
        int size_kb "נשמר קליל — עובד ברשת חלשה"
        datetime created_at
    }
    STUDENT_NOTE {
        string id PK
        string student_id FK
        string staff_id FK "מחנך בלבד"
        string note "קצר, פרטי — לא קליני"
        date delete_after "תום שנה"
        datetime created_at
    }
    ASSIGNMENT {
        string id PK
        string content_unit_id FK "הפניה — לא העתקה"
        string class_id FK
        string assigned_by FK "מורה מקצועי"
        string mode "routine/remote/emergency"
        date scheduled_for "יכול להיות עתידי"
        string override_body "null — התאמת AI מאושרת חד-פעמית"
        datetime created_at
    }
    SUBMISSION {
        string id PK
        string assignment_id FK
        string student_id FK
        string status "not_started/started/completed"
        string feedback "משוב מילולי רשות"
        string grade "ציון — רק על unit_type=assessment (nullable)"
        bool seen_by_teacher "ראיתי → מפעיל המורה ראה"
        string mode "מוטבע לניתוח"
        datetime completed_at
    }
    CHECKIN {
        string id PK
        string student_id FK
        date day
        string mode "routine/remote/emergency"
        string type "presence/emotional"
        string mood "null — 1 מ-4, חירום בלבד — רגיש"
        bool distress_flag "דגל למחנך בלבד"
        bool is_sensitive
        date delete_after "יצירה + 30 יום (רגשי)"
        string seen_by FK "המורה ראה — null עד אישור"
        datetime created_at
    }
    SYSTEM_MODE {
        string id PK
        string school_id FK
        string mode "routine/remote/emergency"
        string activated_by FK "מנהל / national"
        date scheduled_for "null — מרחוק מתוכנן מראש"
        string note
        datetime activated_at
    }
    CONTACT_LOG {
        string id PK
        string student_id FK
        string staff_id FK "מחנך"
        date day
        string mode "routine/remote/emergency"
        string outcome "contacted/no_answer/referred_to_parent"
        string channel "whatsapp/sms/phone"
        string note "על הפנייה בלבד — לא תיאור רגשי"
        datetime created_at
    }
    NOTIFICATION {
        string id PK
        string recipient_kind "student/parent/staff"
        string recipient_id FK "student_id או staff_id"
        string channel "whatsapp/sms"
        string kind "personal_link/task/weekly_parent/mode_change/daily_report/teacher_saw"
        string mode "routine/remote/emergency"
        string payload_ref "הפניה — לא העתקת תוכן"
        string status "queued/sent/delivered/read"
        datetime created_at
    }
```

> **הערה על `SCHOOL`:** הישות לא הופיעה ברשימת עשר הישויות המבוקשות, אך היא נדרשת מבנית כדי שהזרימה לפיקוח (אגרגציה לפי בית ספר / רשת / מחוז) תעבוד **בלי טבלת סיכום נפרדת**. היא מוחזקת דקה (4 שדות) ומשמשת עוגן היררכיה בלבד.

---

## 2. טבלאות שדות

### 2.1 Student — תלמיד
| שדה | טיפוס | תיאור | פרטיות |
|------|-------|--------|---------|
| id | PK | מזהה פנימי | — |
| first_name | string | שם פרטי בלבד | מזעור — אין שם משפחה/ת"ז/כתובת |
| class_id | FK→Class | הכיתה | — |
| phone | string | לשליחת הקישור האישי | נחוץ לקשר |
| guardian_phone | string? | טלפון הורה — להודעה השבועית בלבד | **השדה היחיד על הורה במערכת** — אין פרופיל הורה |
| access_token | string | כניסה בקישור בלי סיסמה | סוד — לא נחשף בדשבורדים |
| registered | bool | נרשם לשכבת הלמידה (תיעוד תרגולים+ציונים). `false` = יכול עדיין לעשות check-in | הרשמה קלה, מינימום מזהה |
| active | bool | במצבת הפעילה (כולל נשירה סמויה) | — |
| created_at | datetime | | |

**אין:** ממוצע פומבי, ת"ז, כתובת. (ציון תרגול — כן, אישי; ראו Submission.)

### 2.2 Class — כיתה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| school_id | FK→School | |
| name | string | לדוגמה "י'3" |
| grade | enum | ט / י / יא / יב |
| homeroom_teacher_id | FK→StaffMember | המחנך של הכיתה |

### 2.3 StaffMember — בעל תפקיד
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| first_name | string | |
| role | enum | `homeroom` (מחנך) / `subject` (מורה מקצועי) / `principal` (מנהל) / `supervisor` (פיקוח) |
| school_id | FK→School? | `null` לפיקוח — פועל מעבר לבית ספר בודד |
| phone | string | |
| access_token | string | כניסה בלי סיסמה |
| active | bool | לדופק צוות — מי לא נכנס יומיים |

> מחנך הוא `StaffMember` שכיתה כלשהי מפנה אליו ב-`homeroom_teacher_id`; אותו אדם יכול גם לשלוח משימות כ-`subject`. אין שכפול רשומת אדם.

### 2.4 ContentUnit — משימת ספרייה ("מדף הרציפות")
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| title | string | |
| subject | string | מקצוע |
| grade | enum | שכבה |
| body | text | פתיח שורה + מטלה ברורה |
| **unit_type** | enum | `task` (משימת קשר/תרגול) / `assessment` (מופע הערכה — נושא ציון) / `reference` (פריט הפניה לתוכן חיצוני) |
| **track_id** | FK→EnrichmentTrack? | שייכות למסלול העשרה (צילום/פיננסי/יזמות). `null` = תוכן ליבה |
| **content_source** | enum | `internal` (נכתב אצלנו) / `external` (עטיפת תוכן חיצוני) |
| **external_ref** | string? | קישור לקמפוס IL/מטח/משה"ח — כשזה `reference`. המערכת מפנה, לא מחזיקה |
| est_minutes | int | תקן ה**צעד** = 10. משימה משמעותית = כמה צעדים; מספר הצעדים לפי מצב |
| modes_allowed | array | אילו מצבים מתאימים — כולל תיוג **"מתאים לחירום"** |
| accessibility | bool | מותאם ללקויות למידה |
| parent_unit_id | FK→ContentUnit? | אם זו גרסה נגישה — מפנה למקור, **לא מעתיקה** |
| curated_by | FK→StaffMember | אוצרות אנושית — אין תוכן גולמי |
| active | bool | |

**אין:** מחסן גולמי (המערכת מפנה למאגרים חיצוניים דרך `reference`, לא מחליפה אותם); תלות בספק חיצוני יחיד. **קבצים של המורה** נשמרים ב-`Attachment` (§2.11), לא בגוף היחידה.

### 2.5 Assignment — שליחת משימה לכיתה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| content_unit_id | FK→ContentUnit | **הפניה** לתוכן — מקור אמת יחיד |
| class_id | FK→Class | כיתת היעד |
| assigned_by | FK→StaffMember | המורה השולח |
| **mode** | enum | `routine`/`remote`/`emergency` — מוטבע מ-SystemMode הנוכחי של בית הספר בעת השליחה |
| scheduled_for | date | תאריך יעד — יכול להיות עתידי (יום מרחוק מתוכנן) |
| override_body | text? | התאמת AI מאושרת חד-פעמית (פישוט/קיצור). `null` = משתמשים ב-`body` המקורי |
| created_at | datetime | |

> Assignment הוא ברמת **כיתה**. הסטטוס האישי מפוצל ל-Submission פר-תלמיד — כך אין שכפול תוכן, רק סטטוסים.

### 2.6 Submission — סטטוס תלמיד למשימה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| assignment_id | FK→Assignment | |
| student_id | FK→Student | |
| status | enum | `not_started` / `started` / `completed` |
| feedback | text? | משוב מילולי-רשות מהמורה |
| **grade** | string? | ציון — **רק** כאשר `ContentUnit.unit_type='assessment'`. אישי (תלמיד+מורה), בלי ממוצע פומבי. `null` על משימת קשר רגילה |
| seen_by_teacher | bool | לחיצת "ראיתי" → מפעילה "המורה ראה" אצל התלמיד |
| mode | enum | מוטבע מה-Assignment לניתוח לפי מצב |
| completed_at | datetime? | |

### 2.7 CheckIn — צ'ק-אין יומי
| שדה | טיפוס | תיאור | פרטיות |
|------|-------|--------|---------|
| id | PK | | |
| student_id | FK→Student | | |
| day | date | יום ה-check-in | |
| **mode** | enum | `routine`/`remote`/`emergency` | ציר ניתוח |
| type | enum | `presence` ("אני כאן", שגרה/מרחוק) / `emotional` ("איך אתה היום?", חירום) | |
| mood | enum? | 1 מתוך 4 אפשרויות — **חירום בלבד** | **רגיש** |
| distress_flag | bool | מצוקה — דגל למחנך בלבד, סימן ולא תיעוד קליני | נגזר מ-mood |
| is_sensitive | bool | `true` כאשר `type=emotional` | |
| delete_after | date? | ל-check-in רגשי: `created_at + 30 יום`. בתאריך זה `mood` ו-`distress_flag` **מתאפסים אוטומטית**; עובדת הנוכחות (שהיה check-in) נשמרת עד תום שנה"ל | תיקון 13 |
| seen_by | FK→StaffMember? | "המורה ראה" — `null` עד אישור אנושי | |
| created_at | datetime | | |

> **מדיניות מחיקה (דרישה 3):** התוכן הרגשי (`mood`, `distress_flag`) הוא החלק הרגיש ולכן נמחק אחרי 30 יום. עובדת הנוכחות הבסיסית (האם התלמיד נראה ביום X) איננה רגישה ונשמרת לפי כלל שנה"ל של §7.2 — כדי שרצף אישי ומדדי קשר לא יימחקו בטרם עת. שתי המחיקות אוטומטיות ומובנות.

### 2.8 SystemMode — יומן מצבי המערכת (פר בית ספר)
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| school_id | FK→School | |
| mode | enum | `routine`/`remote`/`emergency` — המצב שהופעל |
| activated_by | FK→StaffMember? | המנהל, או `null`+`note="national"` בהפעלה ארצית |
| scheduled_for | date? | יום מרחוק שתוכנן מראש; `null` = מיידי |
| note | string? | |
| activated_at | datetime | |

> **מקור האמת למצב הנוכחי** של בית ספר = רשומת ה-SystemMode האחרונה שלו. בעת יצירת כל אירוע (CheckIn/Assignment/ContactLog/Notification), ה-`mode` **מוטבע** מהמצב הנוכחי — כך אין צורך לעדכן אירועים בדיעבד, וההיסטוריה נשמרת נאמנה. מעבר מצב הוא עצמו אירוע (עם ה-mode החדש).

### 2.9 ContactLog — יומן קשר של מחנך
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| student_id | FK→Student | על מי הפנייה |
| staff_id | FK→StaffMember | המחנך שפנה |
| day | date | |
| mode | enum | `routine`/`remote`/`emergency` |
| outcome | enum | `contacted` / `no_answer` / `referred_to_parent` |
| channel | enum | `whatsapp` / `sms` / `phone` |
| note | string? | על הפנייה בלבד — **אסור** תיאור מצב רגשי חופשי (§5.2) |
| created_at | datetime | |

> נשמר שנה אחת בלבד (§7.2), ואז נמחק אוטומטית.

### 2.10 Notification — הודעה יוצאת
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| recipient_kind | enum | `student` / `parent` / `staff` |
| recipient_id | FK | `student_id` (גם ל-`parent` — דרך `guardian_phone`) או `staff_id`. **אין ישות הורה** |
| channel | enum | `whatsapp` / `sms` (הקישור עובד בשניהם) |
| kind | enum | `personal_link` / `task` / `weekly_parent` / `mode_change` / `daily_report` / `teacher_saw` |
| mode | enum | `routine`/`remote`/`emergency` |
| payload_ref | string? | הפניה ל-assignment_id / checkin_id וכו' — **לא העתקת תוכן** |
| status | enum | `queued` / `sent` / `delivered` / `read` |
| created_at | datetime | |

### 2.11 Attachment — חומר שהמורה צירף
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| assignment_id | FK→Assignment | המשלוח שאליו צורף הקובץ (דף עבודה/מצגת) |
| uploaded_by | FK→StaffMember | המורה שהעלה |
| filename | string | |
| storage_ref | string | הפניה לאחסון — לא בגוף הרשומה |
| size_kb | int | נשמר קליל; גרסת התלמיד חייבת לעבוד בטלפון וברשת חלשה |
| created_at | datetime | |

> העלאת קבצים ומצגות **מותרת** (spec §5.3). המגבלה היחידה: מה שמגיע לתלמיד חייב לעמוד בעקרון "עובד ברשת חלשה" — קבצים כבדים מוקלים/מומרים, לא נחסמים.

### 2.12 EnrichmentTrack — מסלול העשרה
| שדה | טיפוס | תיאור |
|------|-------|--------|
| id | PK | |
| title | string | "מסלול צילום" / "חינוך פיננסי" / "יזמות" |
| theme | string | קטגוריה |
| description | string | |

> מסלול = אוסף של 5-6 `ContentUnit` (עם `track_id` זהה) שאפשר לעשות בכל סדר. **לא קורס רב-מפגשים ולא עץ תוכן** — אין נעילה בין יחידות.

### 2.13 StudentNote — הערת מחנך
| שדה | טיפוס | תיאור | פרטיות |
|------|-------|--------|---------|
| id | PK | | |
| student_id | FK→Student | על מי ההערה | |
| staff_id | FK→StaffMember | **מחנך בלבד** | ההערה פרטית לכותב; אין נתיב שאילתה שחושף אותה למנהל/פיקוח |
| note | string | הערה קצרה ("דיברתי, אבא איבד עבודה") — לא תיאור קליני | מוגבלת באורך |
| delete_after | date | תום שנת הלימודים | תיקון 13 — נמחקת אוטומטית |
| created_at | datetime | | |

---

## 3. איך הזרימה עובדת בלי שכפול נתונים (דרישה 2)

```
ספרייה            מורה מקצועי         תלמיד              דשבורדים
ContentUnit  ──►  Assignment    ──►  Submission   ──►  מחנך: CheckIn+Submission+ContactLog (כיתתו)
(תוכן, פעם     (FK ל-content,     (FK ל-assignment,   מנהל: אגרגט על School (סטטוסים, לא תוכן)
 אחת)           mode מוטבע)        status+mode)        פיקוח: אגרגט על School.network/district
                                    CheckIn             (COUNT/% בלבד — אין נתיב לשם תלמיד)
```

- **התוכן חי במקום אחד** (`ContentUnit`). כל שאר השרשרת מפנה אליו ב-FK. שינוי ניסוח משנה שורה אחת.
- **הדשבורדים הם עדשות, לא עותקים.** אותן שורות `CheckIn`/`Submission`/`ContactLog` נקראות בשלוש רזולוציות: מחנך (פרטני, כיתתו) → מנהל (סטטוסים מצרפיים, בית ספרו) → פיקוח (מצרף מלא לפי רשת/מחוז). ההפרדה נאכפת בהיקף השאילתה לפי `role`, לא בהעתקת נתונים.
- **`mode` אחיד** מוטבע על כל אירוע מ-`SystemMode` הנוכחי — ולכן כל דוח נחתך לפי מצב בלי טבלה נפרדת למצב.

---

## 4. חמש שאילתות לדוגמה (במלל)

1. **"מי לא נראה יומיים בכיתה י'3?"** (לוח הדופק של המחנך)
   כל `Student` שבו `class_id` = הכיתה ו-`active=true`, שאין לו אף `CheckIn` שבו `day` באחד מיומיים האחרונים. אלה הצהובים. מי שאין לו check-in שלושה ימים ומעלה — או שיש לו `CheckIn.distress_flag=true` היום — הוא אדום.

2. **"רשימת האדומים בבית הספר היום, מי המחנך של כל אחד, והאם כבר פנו אליו."** (עולם המנהל — רשימת אדומים)
   כל `Student` פעיל בבית הספר (דרך `Class.school_id`) שהוא אדום (ראו שאילתה 1), מצורף ל-`Class.homeroom_teacher_id` לשם המחנך, ומצורף לבדיקה האם קיים `ContactLog` שלו מ-24 השעות האחרונות. אין → "ממתין לפנייה".

3. **"שלושת המספרים של המנהל היום."** (דופק בית הספר + הדוח היומי לוואטסאפ)
   בהינתן בית ספר: (א) מספר ה-`Student` הנבדלים עם `CheckIn` שבו `day`=היום — "כמה ראינו"; (ב) מספר האדומים; (ג) מספר ה-`StaffMember` הפעילים (שיצרו היום `Assignment`/`ContactLog`/`seen`). אפשר לחתוך לפי `mode` הנוכחי מ-`SystemMode`.

4. **"אילו בתי ספר ירדו בדופק שלושה ימים ברצף?"** (עולם הפיקוח — דגל תמיכה)
   לכל `School`, אחוז ה-check-in היומי = (תלמידים נבדלים עם CheckIn ביום) חלקי (תלמידים פעילים), לשלושת הימים האחרונים. בתי ספר שבהם האחוז יורד שלושה ימים רצופים מסומנים "מוצע לתמיכה". התוצאה מצרפית בלבד — **אין שם תלמיד או מורה** ברזולוציה הזאת.

5. **"כמה תלמידים נראו היום ברמת המדינה, בבתי ספר שנמצאים במצב חירום?"** (תמונת חירום ארצית)
   כל `School` שרשומת ה-`SystemMode` האחרונה שלו = `emergency`; לכל אלה, ספירת ה-`Student` הנבדלים עם `CheckIn` שבו `day`=היום ו-`mode='emergency'`. מוחזר כמספר/אחוז ארצי, מקובץ אופציונלית לפי `district` — בלי שמות.

> שאילתה נוספת שימושית (לוח המחנך): **"אילו check-ins היום עוד לא אושרו על ידי המורה?"** — כל `CheckIn` של כיתתי מהיום שבו `seen_by IS NULL`. אישור מפעיל את "המורה ראה" אצל התלמיד.

---

## 5. הגדרת סיום — כל מסך מצביע על הישויות שהוא קורא/כותב

| עולם / מסך (spec §5) | קורא | כותב |
|----------------------|------|------|
| **תלמיד — check-in** | CheckIn (רצף), SystemMode (מצב→סוג) | CheckIn |
| **תלמיד — משימת 10 דק'** | Assignment, ContentUnit, Attachment, Submission | Submission (status/completed) |
| **תלמיד — מופע הערכה** | Assignment→ContentUnit(`unit_type=assessment`) | Submission (grade — אישי) |
| **תלמיד — הרשמה (שכבת למידה)** | Student | Student.registered |
| **תלמיד — "המורה ראה"** | CheckIn.seen_by, Submission.seen_by_teacher | — |
| **תלמיד — "תסביר אחרת" (AI)** | ContentUnit/Assignment (תוכן המשימה בלבד) | — (בלי זיכרון שיחה) |
| **מחנך — לוח דופק** | CheckIn, Student, Class, ContactLog | — |
| **מחנך — פנייה בלחיצה** | Student.phone, Class | Notification, ContactLog |
| **מחנך — דגלים רגשיים** | CheckIn.distress_flag (כיתתו בלבד) | CheckIn.seen_by |
| **מחנך — יומן קשר** | ContactLog | ContactLog |
| **מחנך — שדה הערה** | StudentNote (כיתתו, שלו בלבד) | StudentNote |
| **מורה מקצועי — שלח משימה** | ContentUnit, Class | Assignment |
| **מורה — צירוף חומרים** | Assignment | Attachment |
| **מורה — התאמת AI** | ContentUnit | Assignment.override_body |
| **מורה — לוח הגשות + הערכה** | Submission, Student | Submission.seen_by_teacher, Submission.grade, Notification (teacher_saw) |
| **מנהל — 3 מספרים** | CheckIn, Submission, StaffMember (אגרגט בית ספרו) | — |
| **מנהל — דופק צוות** | StaffMember.active, ContactLog, Assignment | — |
| **מנהל — רשימת אדומים** | Student, CheckIn, Class, ContactLog | — |
| **מנהל — דוח יומי לוואטסאפ** | CheckIn, Submission, StaffMember | Notification (daily_report) |
| **מנהל — כפתור מעבר מצב** | SystemMode (נוכחי) | SystemMode (רשומה חדשה), Notification (mode_change) |
| **ספרייה — מדף הרציפות** | ContentUnit (task/assessment/reference) | ContentUnit (אוצרות) |
| **ספרייה — מסלולי העשרה** | EnrichmentTrack, ContentUnit.track_id | EnrichmentTrack, ContentUnit |
| **ספרייה — פריט הפניה חיצוני** | ContentUnit(`source=external`, external_ref) | ContentUnit |
| **ספרייה — גרסה נגישה** | ContentUnit.parent_unit_id | ContentUnit (variant) |
| **פיקוח — תמונה מצרפית** | School, Class, Student, CheckIn (COUNT/% בלבד) | — |
| **פיקוח — דגל תמיכה** | School + מגמת CheckIn | — (הצעת עזרה, מחוץ למודל הנתונים) |
| **פיקוח — תמונת חירום ארצית** | SystemMode, School.district, CheckIn | — |
| **הורים — הודעה שבועית** | Student.guardian_phone, Class | Notification (weekly_parent) |
| **הורים — התראת מעבר מצב** | SystemMode, Student.guardian_phone | Notification (mode_change) |
| **AI — כפתור בכל עולם** | הישות של ההקשר בלבד (משימה/פנייה/דוח) | override_body / טיוטת Notification (לאישור אנושי) |

**כל מסך מהאפיון מצביע על הישויות שהוא קורא וכותב → הגדרת הסיום מתקיימת.**

---

## 6. שאלות פתוחות למיטל

1. **מחיקה כפולה של check-in רגשי:** הגדרתי ש-`mood`/`distress_flag` נמחקים אחרי 30 יום, בעוד עובדת הנוכחות נשמרת עד תום שנה"ל (§7.2). לאשר שההפרדה הזאת מקובלת — או שכל רשומת check-in רגשי נמחקת במלואה אחרי 30 יום.
2. **`guardian_phone`:** האם לאסוף טלפון הורה נפרד (עמידה מלאה במזעור אך שדה נוסף), או להשתמש בטלפון התלמיד גם להודעות הורים? נדרשת החלטה לפני ייעוץ משפטי (§7.2).
3. **ריבוי תפקידים לאיש צוות:** מידלתי `role` יחיד + זיהוי מחנך דרך `Class.homeroom_teacher_id`. אם מורה מכהן בכמה תפקידים חופפים (יועצת שהיא גם מחנכת) — לאשר שהמבנה הזה מספיק או שצריך טבלת תפקידים נפרדת.
