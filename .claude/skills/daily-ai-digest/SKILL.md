---
name: daily-ai-digest
description: "סקירת בוקר Learni — סוכן יומי שסורק חדשות AI ברשת, שואב פריטים מבוט טלגרם, ושולח מייל מעוצב ב-HTML. רץ אוטומטית ב-5:00 בבוקר או ידנית עם /daily-ai-digest."
---

# סקירת בוקר — Learni Daily AI Digest

אתה סוכן שיוצר דייג'סט AI יומי עבור מיטל פלג (Learni).
המטרה: לסרוק את הרשת + פריטים מבוט טלגרם, לסנן בקפדנות, ולשלוח מייל מעוצב.

---

## שלב 1 — איסוף מקורות (במקביל)

### 1A. חיפוש חדשות AI ברשת

חפש במקביל (WebSearch) את כל אלה:

```
"AI news today April 2026"
"new AI tools free 2026"
"OpenAI Google Anthropic announcement today"
"AI tools for education management marketing 2026"
"Claude Code new features 2026"
"generative AI updates this week"
"AI tips tricks productivity 2026"
"best AI prompts techniques this week"
"new free AI features Google Gemini ChatGPT Claude"
"AI video image generation new features 2026"
```

עבור כל תוצאה מעניינת — קרא את התוכן עם WebFetch. **קרא לפחות 6-8 כתבות לעומק** כדי לחלץ טיפים, פיצ'רים נסתרים, וטריקים מעשיים.

**מקורות מועדפים:** OpenAI blog, Google AI blog, TechCrunch AI, The Decoder, The Verge AI, Anthropic blog, Reddit r/ClaudeAI, Product Hunt, Ben's Bites, The Rundown AI

### 1B. שאיבת פריטים מבוט טלגרם

קרא את ה-Sheet של בוט האיסוף:

```
WebFetch URL: https://docs.google.com/spreadsheets/d/1NzLcB9jr6iuWCzj8huGVdyCDjJEGOgz-eotxJRgN3js/gviz/tq?tqx=out:csv
```

**פרסור:**
- עמודות: תאריך (DD/MM/YYYY HH:MM) | תוכן | URL | פלטפורמה
- סנן רק פריטים מ-48 השעות האחרונות
- התעלם משורות עם `/start`

עבור כל פריט עם URL — קרא אותו עם WebFetch לקבלת תוכן מלא.

---

## שלב 2 — ניתוח וסינון

מכל המקורות (חיפוש + טלגרם), בחר **10-12 פריטים**.

### מיקס תוכן — חובה לגוון!

**הדייג'סט חייב לכלול מיקס של סוגי פריטים:**
- **3-4 פיצ'רים חדשים** — עדכונים ושיפורים בכלים קיימים (Claude, Gemini, ChatGPT, Canva, Adobe וכו')
- **2-3 טיפים וטריקים** — דברים שאפשר ליישם עכשיו, פרומפטים חכמים, shortcuts, תכונות נסתרות
- **2-3 כלים חדשים** — כלים חינמיים או עם free tier שאנשים רגילים יכולים לנסות היום
- **1-2 חדשות/מגמות** — נתונים מעניינים, דוחות, שינויים בשוק
- **1 "וואו"** — משהו ויזואלי, מפתיע, או שובר מוסכמות

### כללי סינון

**קהל היעד:** מורים, מנהלים, יזמים, משווקים — אנשים רגילים, לא מפתחים.

**מתוך 10-12 פריטים:**
- **2-3 פריטים** מקבלים content_actions + platforms מלאים — פריטים בולטים שבאמת שווה לייצר עליהם תוכן
- **2-3 פריטים** מקבלים רק ["ניוזלטר"] — טוב לדעת
- **השאר** מקבלים [] ריק — רקע מעניין

**שאל את עצמך:** האם קהל מיטל (מורים, מנהלים, יזמים) באמת יעצור לגלול בשביל זה? יש כלי חינמי שאפשר לנסות היום? זה ויזואלי/מרגש מספיק לרילס? **יש טיפ קונקרטי שאפשר ליישם ב-5 דקות?**

**העדפות:**
- טיפים מעשיים > חדשות תעשייה
- כלים חינמיים > כלים בתשלום
- פיצ'רים שאפשר לנסות > הכרזות כלליות
- דברים ויזואליים/מפתיעים > דוחות יבשים

**סנן החוצה:**
- גיוסי הון, רכישות, דוחות רבעוניים — אלא אם משפיע ישירות על המשתמש
- כלים למפתחים בלבד (API, SDK, CLI) — חוץ מ-Claude Code
- כלים ארגוניים (Slack, Salesforce, Jira)

---

## שלב 3 — מבנה פריטים

עבור כל פריט, צור JSON:

```json
{
  "title": "כותרת קצרה בעברית (עד 15 מילים)",
  "summary": "2-3 משפטים בעברית",
  "detail": "הסבר מעמיק 3-5 משפטים — מה בדיוק, מספרים, תאריכים, השוואה",
  "tag": "כלי חדש|עדכון|גיוס|וידאו AI|פרודוקטיביות|אבטחה|מחקר|טרנד",
  "why_marketing": "משפט אחד — למה חשוב לשיווק",
  "why_management": "משפט אחד — למה חשוב לניהול",
  "why_entrepreneurship": "משפט אחד — למה חשוב ליזמות",
  "why_education": "משפט אחד — למה חשוב לחינוך",
  "why_general": "משפט אחד — למה חשוב לשימוש כללי",
  "content_actions": [],
  "platforms": []
}
```

---

## שלב 4 — בניית HTML ושליחה

### 4A. בנה את ה-HTML

בנה HTML email מלא לפי התבנית הזו. **חשוב: העתק את המבנה בדיוק.**

**המרת תאריך לעברית:**
חודשים: 1=בינואר, 2=בפברואר, 3=במרץ, 4=באפריל, 5=במאי, 6=ביוני, 7=ביולי, 8=באוגוסט, 9=בספטמבר, 10=באוקטובר, 11=בנובמבר, 12=בדצמבר
פורמט: "15 באפריל 2026"

**פלטת צבעים לפריטים (7, חוזר מחדש):**

| # | bg | num | tag_bg | accent |
|---|-----|------|---------|---------|
| 1 | #e6f7fd | #00b4d8 | #c8eef8 | #0096b7 |
| 2 | #fce9f4 | #e84393 | #f9c8e3 | #be185d |
| 3 | #e5faf9 | #00cec9 | #b8f0ee | #0f766e |
| 4 | #eeecfc | #6c5ce7 | #d8d4f7 | #5b21b6 |
| 5 | #fdf0f5 | #fd79a8 | #f9d0e3 | #be185d |
| 6 | #e6f7fd | #00b4d8 | #c8eef8 | #0096b7 |
| 7 | #fce9f4 | #e84393 | #f9c8e3 | #be185d |

**סגנונות תגיות פעולה:**
- טיפ: bg=#fef3c7 color=#92400e
- הכרת כלי: bg=#dbeafe color=#1e40af
- מצגת הדרכה: bg=#d1fae5 color=#065f46
- ניוזלטר: bg=#ede9fe color=#5b21b6
- מאמר: bg=#fce7f3 color=#9d174d
- רילס: bg=#ffe4e6 color=#be123c

**סגנונות פלטפורמות:**
- Facebook: bg=#e8f0fe color=#1877f2 border=1px solid #b8d0fb
- Instagram: bg=#fde8f4 color=#e1306c border=1px solid #f5b8d8
- LinkedIn: bg=#e8f3fb color=#0a66c2 border=1px solid #b3d4ef
- Newsletter: bg=#e0f7fc color=#0096b7 border=1px solid #9de2ef

**תגיות קהל (למה זה חשוב):**
- why_marketing: label="שיווק" color=#00b4d8
- why_management: label="ניהול" color=#00cec9
- why_entrepreneurship: label="יזמות" color=#e84393
- why_education: label="חינוך" color=#6c5ce7
- why_general: label="שימוש כללי" color=#64748b

**מבנה ה-HTML המלא:**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>סקירת בוקר — Learni | {תאריך_עברי}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Heebo', Arial, sans-serif; }
    h1, h3 { font-family: 'Rubik', Arial, sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Heebo',Arial,Helvetica,sans-serif;direction:rtl;text-align:right">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden">סקירת בוקר Learni — {תאריך_עברי} | {מספר} חידושים שכדאי להכיר</div>

  <div style="max-width:640px;margin:24px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.10)">

    <!-- Gradient top border -->
    <div style="height:5px;background:linear-gradient(90deg,#00b4d8,#e84393,#00cec9)"></div>

    <!-- Header -->
    <div style="padding:28px 32px 22px;background:#ffffff">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td><span style="font-family:'Heebo',Arial,sans-serif;font-weight:800;font-size:18px;color:#1e293b">Learni</span></td>
          <td style="text-align:left"><span style="background:#f0f4f8;color:#64748b;padding:4px 14px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid rgba(0,0,0,.06)">{תאריך_עברי}</span></td>
        </tr>
      </table>
      <h1 style="margin:16px 0 6px;font-size:26px;font-weight:800;color:#1e293b;line-height:1.4;font-family:'Rubik',Arial,sans-serif">
        {מספר} חידושי <span style="color:#00b4d8">AI</span> שכדאי להכיר
      </h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6">הסיכום היומי שלך — מה חדש בעולם הבינה המלאכותית</p>
    </div>

    <!-- Items -->
    <div style="padding:4px 28px 8px">
      <!-- לכל פריט: -->
      <div style="background:{bg};border-radius:14px;border:1px solid rgba(0,0,0,.04);margin-bottom:14px;overflow:hidden">
        <table cellpadding="0" cellspacing="0" width="100%" style="padding:18px 22px 14px">
          <tr>
            <td style="width:40px;vertical-align:top;padding-left:0">
              <span style="font-family:'Rubik',Arial,sans-serif;font-weight:800;font-size:26px;color:{num};line-height:1">{מספר_סידורי}</span>
            </td>
            <td style="vertical-align:top">
              <span style="display:inline-block;background:{tag_bg};color:{accent};padding:2px 10px;border-radius:8px;font-size:11px;font-weight:700">{tag}</span>
              <h3 style="margin:7px 0 4px;font-size:16px;font-weight:700;color:#1e293b;line-height:1.5;font-family:'Rubik',Arial,sans-serif">{title}</h3>
              <!-- תגיות פעולה + פלטפורמות (אם יש) -->
              <p style="margin:8px 0 0">
                <span style="display:inline-block;padding:2px 9px;border-radius:6px;font-size:10px;font-weight:700;{ACTION_STYLE}">{action}</span>
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#475569;line-height:1.7">{summary}</p>
            </td>
          </tr>
        </table>
        <!-- פירוט (אם יש) -->
        <div style="margin:0 22px 4px;border-top:1px dashed rgba(0,0,0,.10);padding-top:12px">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.6px;text-transform:uppercase">פירוט</p>
          <p style="margin:0;font-size:13px;color:#334155;line-height:1.75">{detail}</p>
        </div>
        <!-- למה זה חשוב -->
        <div style="margin:12px 22px 20px">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.6px;text-transform:uppercase">למה זה חשוב</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <!-- שורה לכל קהל -->
            <tr>
              <td style="padding:5px 8px 5px 0;vertical-align:top;width:76px">
                <span style="display:inline-block;background:{audience_color};color:#fff;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap">{audience_label}</span>
              </td>
              <td style="padding:5px 0;font-size:13px;color:#475569;line-height:1.65">{audience_text}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1e293b;padding:20px 28px">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td><span style="font-family:'Heebo',Arial,sans-serif;font-weight:700;color:#ffffff;font-size:14px">Learni</span></td>
          <td style="text-align:left"><span style="font-size:11px;color:rgba(255,255,255,.4)">סקירת בוקר | {תאריך} | Claude Code</span></td>
        </tr>
      </table>
    </div>
  </div>

  <div style="text-align:center;padding:12px">
    <p style="font-size:11px;color:#94a3b8;font-family:Arial,sans-serif">קיבלת את הדייג'סט הזה כי את/ה רשומ/ה לעדכונים של Learni</p>
  </div>
</body>
</html>
```

### 4B. שלח את המייל דרך Gmail MCP

שלח את המייל ישירות דרך כלי Gmail MCP (לא דרך Apps Script/curl — אלה שכבות ביניים שבורות שננטשו).

**כלי:** `mcp__claude_ai_Gmail__send_email` (או `mcp__Gmail__send_email` — הכלי המחובר לחשבון `mlypeleg@gmail.com`).

**קריאה:**
```
to: "mlypeleg@gmail.com"
subject: "סקירת בוקר Learni — {תאריך_עברי}"
body: <THE FULL HTML FROM STEP 4A>
bodyType: "html"
```

אם הכלי דורש שדה `from` — להשאיר ריק, Gmail ישתמש בחשבון המחובר.

**טיפול בשגיאות:**
- אם הכלי מחזיר שגיאה — **לא** לנסות פלולבק ל-curl/Apps Script. להודיע שגיאה ולעצור.
- אם הכלי לא קיים בסשן הזה — להודיע שחסר MCP connector ולעצור (לא להמציא חלופות).

---

## שלב 5 — דוח סיום

הצג למיטל:
- כמה פריטים נמצאו מחיפוש ברשת
- כמה פריטים נשאבו מטלגרם
- כמה פריטים נכנסו לדייג'סט הסופי
- האם המייל נשלח בהצלחה
- אם יש פריט אחד מומלץ לתוכן — ציין אותו

---

## הערות חשובות

- **שפה:** הכל בעברית (חוץ משמות כלים באנגלית)
- **סינון קפדני:** רוב הידיעות רקע. לא Slack, לא גיוסים, לא כלים למפתחים
- **קהלים מגוונים:** תמיד לכלול why לכל 5 הקהלים (שיווק, ניהול, יזמות, חינוך, כללי)
- **אל תשלח מייל ריק:** אם אין לפחות 7 פריטים איכותיים, אל תשלח — הודע למיטל
- **גיוון:** ודא שיש מיקס של טיפים, כלים, פיצ'רים וחדשות — לא רק חדשות תעשייה
