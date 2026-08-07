/* AI NAVI — מאגר הכלים
   קובץ תוכן: מוסיפים / מעדכנים / מוחקים כלים כאן בלבד — בלי לגעת בקוד.

   שדות:
   family        — מזהה משפחה מתוך families.js
   bestFor       — סוגי משימות: think | research | write | analyze | design | image | av | presentation | build | automate | organize
   inputs        — חומרי גלם: none | idea | short-text | doc | multi-docs | data | image | audio | video | links
   outputs       — תוצרים: answer | doc | presentation | image | video | audio | table | report | site | app | automation
   priorities    — מה הכלי משרת טוב: speed | quality | accuracy | sources | design | ease | price | privacy | control
   roles         — תפקידים במסלול: research | extract | ideate | write | analyze | slides | image | video | voice | music | transcribe | build | automate | organize
   pricing       — free | freemium | paid  (ללא מחירים מדויקים — הם משתנים)
   privacyLevel  — standard | caution | organizationOnly
   lastReviewed  — מתי נבדק לאחרונה שהתיאור עדכני
*/
window.NAVI_TOOLS = [
  {
    id: "chatgpt", name: "ChatGPT", family: "chat",
    bestFor: ["think", "write", "analyze", "organize", "image"],
    inputs: ["none", "idea", "short-text", "doc", "image", "data"],
    outputs: ["answer", "doc", "table", "image"],
    priorities: ["speed", "ease", "quality"],
    roles: ["ideate", "write", "extract", "analyze", "organize", "image"],
    strengths: ["רב־תכליתי: חשיבה, כתיבה, ניתוח ותמונות במקום אחד", "שיחה טבעית בעברית", "קל להתחיל"],
    limitations: ["עלול להמציא עובדות בביטחון מלא", "ידע לא תמיד עדכני בלי חיפוש", "טקסט שהועלה כפוף למדיניות הספק"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "שותף חשיבה וכתיבה",
    lastReviewed: "2026-08"
  },
  {
    id: "claude", name: "Claude", family: "chat",
    bestFor: ["think", "write", "analyze", "organize"],
    inputs: ["none", "idea", "short-text", "doc", "multi-docs", "image", "data"],
    outputs: ["answer", "doc", "table", "site"],
    priorities: ["quality", "accuracy", "control"],
    roles: ["ideate", "write", "extract", "analyze", "organize", "build"],
    strengths: ["חזק במסמכים ארוכים ובכתיבה מדויקת", "עברית איכותית", "Artifacts — תוצרים אינטראקטיביים מתוך השיחה"],
    limitations: ["ללא חיפוש רשת בחלק מהמצבים", "מכסות שימוש בתוכנית החינמית", "עלול להמציא — חובה לבדוק עובדות"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "עבודה עם מסמכים ארוכים וכתיבה",
    lastReviewed: "2026-08"
  },
  {
    id: "gemini", name: "Gemini", family: "chat",
    bestFor: ["think", "write", "research", "analyze", "image", "av"],
    inputs: ["none", "idea", "short-text", "doc", "image", "video", "audio", "links"],
    outputs: ["answer", "doc", "table", "image"],
    priorities: ["speed", "ease", "price"],
    roles: ["ideate", "write", "research", "extract", "analyze", "image"],
    strengths: ["משתלב עם Google Docs / Drive / Gmail", "מקבל וידאו ואודיו כקלט", "נדיב בתוכנית החינמית"],
    limitations: ["איכות משתנה בין משימות", "כפוף להגדרות הפרטיות של חשבון Google", "חובה לבדוק עובדות"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "שותף חשיבה בסביבת Google",
    lastReviewed: "2026-08"
  },
  {
    id: "notebooklm", name: "NotebookLM", family: "docs",
    bestFor: ["research", "analyze", "organize"],
    inputs: ["doc", "multi-docs", "links", "audio", "video"],
    outputs: ["answer", "doc", "report", "audio"],
    priorities: ["accuracy", "sources", "privacy"],
    roles: ["extract", "research", "organize"],
    strengths: ["עונה רק מתוך המקורות שהעליתם — עם ציטוטים", "מצוין לכמה מסמכים יחד", "יוצר סיכומי אודיו בסגנון פודקאסט"],
    limitations: ["לא יוצר תוכן חופשי מעבר למקורות", "פחות מתאים כשאין חומר גלם", "סיכומי האודיו — לא תמיד בעברית"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "חילוץ תובנות ממסמכים עם מקורות",
    lastReviewed: "2026-08"
  },
  {
    id: "perplexity", name: "Perplexity", family: "research",
    bestFor: ["research"],
    inputs: ["none", "idea", "short-text", "links"],
    outputs: ["answer", "report"],
    priorities: ["sources", "accuracy", "speed"],
    roles: ["research"],
    strengths: ["כל תשובה עם קישורי מקור", "מידע עדכני מהרשת", "טוב להשוואות וסקירות"],
    limitations: ["המקורות עצמם לא תמיד איכותיים — לבדוק מי כתב", "פחות חזק ביצירה ובכתיבה ארוכה", "עברית — סבירה אך לא תמיד מדויקת"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "מחקר עם מקורות",
    lastReviewed: "2026-08"
  },
  {
    id: "canva", name: "Canva", family: "slides",
    bestFor: ["design", "presentation", "image"],
    inputs: ["none", "idea", "short-text", "image", "doc"],
    outputs: ["presentation", "image", "video", "doc"],
    priorities: ["design", "ease", "speed"],
    roles: ["slides", "design", "image"],
    strengths: ["תבניות מעוצבות בעברית ו-RTL", "מוכר לרוב אנשי החינוך", "עורך מלא — שליטה על כל אלמנט"],
    limitations: ["הצעות ה-AI כלליות — דורשות התאמה", "חלק מהתכונות בתשלום", "קל להתפזר בין תבניות"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "standard",
    supportsHebrew: true, recommendedRole: "עיצוב מצגות וגרפיקה עם שליטה מלאה",
    lastReviewed: "2026-08"
  },
  {
    id: "gamma", name: "Gamma", family: "slides",
    bestFor: ["presentation", "design"],
    inputs: ["idea", "short-text", "doc"],
    outputs: ["presentation", "site", "doc"],
    priorities: ["speed", "design", "ease"],
    outputsNote: "מצגת, מסמך מעוצב או עמוד אינטרנט",
    roles: ["slides"],
    strengths: ["מטקסט למצגת מעוצבת בדקות", "מבנה ועיצוב אוטומטיים טובים", "קל לערוך אחרי היצירה"],
    limitations: ["העיצוב האוטומטי לא תמיד מדויק בעברית — לבדוק כיווניות", "שליטה עיצובית חלקית לעומת עורך מלא", "מכסת יצירה בתוכנית החינמית"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "טיוטת מצגת מהירה מתוך טקסט",
    lastReviewed: "2026-08"
  },
  {
    id: "napkin", name: "Napkin", family: "slides",
    bestFor: ["design"],
    inputs: ["short-text", "doc"],
    outputs: ["image"],
    priorities: ["design", "speed"],
    roles: ["design"],
    strengths: ["הופך פסקת טקסט לתרשים או אינפוגרפיקה", "מהיר מאוד להמחשות", "סגנונות ויזואליים מגוונים"],
    limitations: ["תמיכת העברית חלקית — לבדוק את התוצאה", "לא מחליף מצגת שלמה", "התרשים משקף את הטקסט — טקסט מבולבל, תרשים מבולבל"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "המחשות ותרשימים מטקסט",
    lastReviewed: "2026-08"
  },
  {
    id: "midjourney", name: "Midjourney", family: "image",
    bestFor: ["image"],
    inputs: ["idea", "short-text", "image"],
    outputs: ["image"],
    priorities: ["quality", "design"],
    roles: ["image"],
    strengths: ["איכות ויזואלית גבוהה במיוחד", "סגנון אמנותי עשיר", "קהילה גדולה של דוגמאות"],
    limitations: ["בתשלום בלבד", "עקומת למידה — פרומפטים באנגלית", "טקסט בתוך תמונה — לא אמין, בעברית במיוחד"],
    pricing: "paid", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "תמונות קונספט באיכות גבוהה",
    lastReviewed: "2026-08"
  },
  {
    id: "firefly", name: "Adobe Firefly", family: "image",
    bestFor: ["image"],
    inputs: ["idea", "short-text", "image"],
    outputs: ["image"],
    priorities: ["quality", "design"],
    roles: ["image"],
    strengths: ["מאומן על מאגרים ברישיון של Adobe — נוח לשימוש מסחרי", "משתלב עם Photoshop ו-Express", "עריכה גנרטיבית של תמונות קיימות"],
    limitations: ["פחות 'אמנותי פרוע' מכלים אחרים", "המיטב שלו בתוך המנוי של Adobe", "פרומפטים באנגלית עובדים טוב יותר"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "standard",
    supportsHebrew: false, recommendedRole: "תמונות לשימוש ארגוני ופרסומי",
    lastReviewed: "2026-08"
  },
  {
    id: "runway", name: "Runway", family: "av",
    bestFor: ["av"],
    inputs: ["idea", "short-text", "image", "video"],
    outputs: ["video"],
    priorities: ["quality", "control"],
    roles: ["video"],
    strengths: ["וידאו מטקסט או מתמונה", "כלי עריכה מתקדמים (הסרת רקע, מסכות)", "שליטה יחסית גבוהה בתוצאה"],
    limitations: ["קטעים קצרים — לא סרט שלם בלחיצה", "צריכת קרדיטים מהירה", "דורש סבבי ניסוי"],
    pricing: "freemium", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "קטעי וידאו מרעיון או מתמונה",
    lastReviewed: "2026-08"
  },
  {
    id: "veo", name: "Google Veo (Flow)", family: "av",
    bestFor: ["av"],
    inputs: ["idea", "short-text", "image"],
    outputs: ["video"],
    priorities: ["quality"],
    roles: ["video"],
    strengths: ["וידאו ריאליסטי באיכות גבוהה", "עקביות דמות בין סצנות (Flow)", "טוב לקטעי פתיחה ואווירה"],
    limitations: ["זמין דרך מנויי Google בתשלום", "קטעים קצרים — נדרש חיבור בעריכה", "דיבור בעברית בתוך הווידאו — לא אמין; עדיף קריינות נפרדת"],
    pricing: "paid", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "סצנות וידאו ריאליסטיות",
    lastReviewed: "2026-08"
  },
  {
    id: "elevenlabs", name: "ElevenLabs", family: "av",
    bestFor: ["av"],
    inputs: ["short-text", "doc", "audio"],
    outputs: ["audio"],
    priorities: ["quality"],
    roles: ["voice", "transcribe"],
    strengths: ["קריינות טבעית — גם בעברית", "מבחר קולות וסגנונות", "גם תמלול והפרדת דוברים"],
    limitations: ["עברית עם ניקוד ומספרים — דורשת ניסויים", "מכסה חינמית קטנה", "שיבוט קול — רק בהסכמה מפורשת של בעל הקול"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "קריינות והקראה",
    lastReviewed: "2026-08"
  },
  {
    id: "suno", name: "Suno", family: "av",
    bestFor: ["av"],
    inputs: ["idea", "short-text"],
    outputs: ["audio"],
    priorities: ["speed", "ease"],
    roles: ["music"],
    strengths: ["שיר שלם מתיאור קצר", "גם מילים בעברית", "מהיר ומשעשע — טוב לפתיחות ולטקסים"],
    limitations: ["זכויות שימוש תלויות בסוג המנוי — לבדוק לפני פרסום", "הגייה בעברית לא תמיד מדויקת", "שליטה מוגבלת בפרטים"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "standard",
    supportsHebrew: true, recommendedRole: "מוזיקה ושירים",
    lastReviewed: "2026-08"
  },
  {
    id: "sheets-ai", name: "Copilot / Gemini בגיליונות", family: "data",
    bestFor: ["analyze"],
    inputs: ["data"],
    outputs: ["table", "report"],
    priorities: ["control", "privacy", "accuracy"],
    roles: ["analyze"],
    strengths: ["ניתוח בתוך הסביבה המוכרת (Excel / Sheets)", "הנתונים נשארים בחשבון הארגוני", "נוסחאות, סיכומים וגרפים בשפה חופשית"],
    limitations: ["תלוי במנוי הארגוני שלכם", "פחות חזק בניתוח טקסט פתוח", "לבדוק כל נוסחה שהוא מציע"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "organizationOnly",
    supportsHebrew: true, recommendedRole: "ניתוח נתונים בסביבה ארגונית",
    lastReviewed: "2026-08"
  },
  {
    id: "claude-code", name: "Claude Code", family: "build",
    bestFor: ["build", "automate", "analyze"],
    inputs: ["idea", "short-text", "doc", "data"],
    outputs: ["site", "app", "automation", "report"],
    priorities: ["control", "quality"],
    roles: ["build", "automate", "analyze"],
    strengths: ["בונה פרויקטים שלמים, לא רק קטעי קוד", "עובד על הקבצים אצלך במחשב", "טוב גם לניתוח נתונים מקומי — הקבצים לא עוזבים את המחשב"],
    limitations: ["ממשק טרמינל / עורך קוד — דורש התרגלות", "בתשלום", "חובה לבדוק את התוצר לפני שימוש"],
    pricing: "paid", difficulty: "advanced", privacyLevel: "standard",
    supportsHebrew: true, recommendedRole: "בנייה מתקדמת עם שליטה מלאה",
    lastReviewed: "2026-08"
  },
  {
    id: "codex", name: "Codex", family: "build",
    bestFor: ["build", "automate"],
    inputs: ["idea", "short-text", "doc"],
    outputs: ["site", "app", "automation"],
    priorities: ["control", "quality"],
    roles: ["build", "automate"],
    strengths: ["סוכן קוד שמבצע משימות שלמות", "עובד ברקע על כמה משימות", "משתלב עם GitHub"],
    limitations: ["דורש היכרות עם סביבת פיתוח", "בתשלום", "תוצרים דורשים בדיקה"],
    pricing: "paid", difficulty: "advanced", privacyLevel: "standard",
    supportsHebrew: true, recommendedRole: "משימות פיתוח ברקע",
    lastReviewed: "2026-08"
  },
  {
    id: "lovable", name: "Lovable", family: "build",
    bestFor: ["build"],
    inputs: ["idea", "short-text"],
    outputs: ["site", "app"],
    priorities: ["speed", "ease", "design"],
    roles: ["build"],
    strengths: ["מרעיון בעברית פשוטה לאפליקציה עובדת", "בלי לגעת בקוד", "תוצאה מעוצבת כברירת מחדל"],
    limitations: ["שליטה מוגבלת כשרוצים משהו מדויק", "מכסת שימוש בתוכנית החינמית", "RTL בעברית — לבדוק ולתקן"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "אב־טיפוס מהיר בלי קוד",
    lastReviewed: "2026-08"
  },
  {
    id: "bolt", name: "Bolt", family: "build",
    bestFor: ["build"],
    inputs: ["idea", "short-text"],
    outputs: ["site", "app"],
    priorities: ["speed", "ease"],
    roles: ["build"],
    strengths: ["בנייה מהירה בדפדפן", "רואים את הקוד ואפשר לערוך", "טוב לניסויים ולאבות טיפוס"],
    limitations: ["פרויקטים גדולים נעשים מסורבלים", "מכסות בתוכנית החינמית", "RTL — לבדוק"],
    pricing: "freemium", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "אב־טיפוס עם גישה לקוד",
    lastReviewed: "2026-08"
  },
  {
    id: "replit", name: "Replit", family: "build",
    bestFor: ["build"],
    inputs: ["idea", "short-text"],
    outputs: ["site", "app"],
    priorities: ["ease", "speed"],
    roles: ["build"],
    strengths: ["סביבה מלאה בדפדפן כולל אחסון", "סוכן שבונה מפרומפט", "קל לשתף ולפרסם"],
    limitations: ["התוכנית החינמית מוגבלת", "אפליקציות מורכבות דורשות ידע", "לבדוק עלויות לפני פרסום רחב"],
    pricing: "freemium", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: true, recommendedRole: "בנייה ופרסום במקום אחד",
    lastReviewed: "2026-08"
  },
  {
    id: "make", name: "Make", family: "automation",
    bestFor: ["automate", "organize"],
    inputs: ["data", "links"],
    outputs: ["automation"],
    priorities: ["control", "price"],
    roles: ["automate"],
    strengths: ["חיבור ויזואלי בין מאות אפליקציות", "שליטה מפורטת בכל צעד", "תוכנית חינמית סבירה להתחלה"],
    limitations: ["עקומת למידה בתרחישים מורכבים", "תקלות דורשות ניטור", "כל מערכת מחוברת = עוד נקודת פרטיות לבדוק"],
    pricing: "freemium", difficulty: "intermediate", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "אוטומציה ויזואלית בין מערכות",
    lastReviewed: "2026-08"
  },
  {
    id: "zapier", name: "Zapier", family: "automation",
    bestFor: ["automate", "organize"],
    inputs: ["data", "links"],
    outputs: ["automation"],
    priorities: ["ease", "speed"],
    roles: ["automate"],
    strengths: ["הפשוט במשפחה — 'כשקורה X עשה Y'", "אלפי חיבורים מוכנים", "מהיר להקמה"],
    limitations: ["מתייקר עם הגדילה", "פחות גמיש בתרחישים מסועפים", "כל חיבור = הרשאות גישה למידע — לבדוק"],
    pricing: "freemium", difficulty: "beginner", privacyLevel: "caution",
    supportsHebrew: false, recommendedRole: "אוטומציות פשוטות ומהירות",
    lastReviewed: "2026-08"
  },
  {
    id: "n8n", name: "n8n", family: "automation",
    bestFor: ["automate"],
    inputs: ["data", "links"],
    outputs: ["automation"],
    priorities: ["control", "privacy", "price"],
    roles: ["automate"],
    strengths: ["קוד פתוח — אפשר להריץ על שרת שלכם", "שליטה מלאה בזרימת המידע", "חזק בתרחישים עם AI בפנים"],
    limitations: ["דורש ידע טכני להתקנה עצמית", "ממשק פחות ידידותי למתחילים", "אחריות התחזוקה עליכם"],
    pricing: "freemium", difficulty: "advanced", privacyLevel: "standard",
    supportsHebrew: false, recommendedRole: "אוטומציה בשליטה ארגונית מלאה",
    lastReviewed: "2026-08"
  }
];
