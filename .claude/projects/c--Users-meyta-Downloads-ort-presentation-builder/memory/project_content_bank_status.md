---
name: בנק תוכן — סטטוס
description: סטטוס בנק התוכן לסושיאל — 3 טיוטות, מה צריך תיקון, מה הבא
type: project
---

## בנק תוכן — סטטוס 3.4.2026

### טיוטות קיימות
1. **פוסט #1 — Google AI Pro 5TB** — `_drafts/social-post-01-google-5tb.html` — קרוסלה 6 שקפים, FB+IG
2. **פוסט #2 — טריקי גזלייטינג** — `_drafts/social-post-02-ai-gaslighting.html` — קרוסלה 5 שקפים, FB+IG
3. **פוסט #3 — הדלפת Claude Code** — `_drafts/social-post-03-claude-code-leak.html` — כרטיס בודד, FB+LI

### מה צריך לתקן — פוסט #2 (גזלייטינג)
- **שפה טכנית מדי**: "Complexity Parameterization" צריך להיות בעברית פשוטה
- **לנקות אנגלית**: כל מונח טכני צריך תרגום/הסבר פשוט
- **מודלים**: הטריקים עובדים בעיקר על ChatGPT, בינוני על Gemini, פחות על Claude. צריך לציין את זה בכנות
- **קהל יעד**: אנשים רגילים, לא מפתחים

### מה צריך לתקן — פוסט #3 (הדלפה)
- **להרחיב לקרוסלה**: מייטל רוצה פירוט על מה נמצא בהדלפה
- ממצאים מרכזיים שנחקרו:
  - KAIROS — סוכן רקע אוטונומי שעובד בזמן שהמשתמש לא פעיל, כולל autoDream (איחוד זיכרון)
  - Undercover Mode — מסתיר תרומות של עובדי Anthropic לקוד פתוח
  - Buddy — טמגוצ'י עם 18 מינים, מערכת נדירויות gacha, מתוכנן ל-1 באפריל
  - ULTRAPLAN — מצב תכנון מרוחק שמעביר משימות ל-Opus 4.6 בענן עד 30 דקות
  - 44 feature flags נסתרים
  - anti_distillation: fake_tools — מזריק כלים מזויפים למניעת גניבת נתוני אימון
  - Capybara = Claude 4.6, Fennec = Opus 4.6, Numbat = בבדיקות
- מקורות: VentureBeat, The New Stack, Alex Kim, Futurism, DEV Community

### הבא בתור
- רילסים מהפוסטים (מייטל הציעה) — דרך /create-reels
- פוסט /buddy אם רלוונטי

### הרשימה מנוהלת ב-design-drafts.json
