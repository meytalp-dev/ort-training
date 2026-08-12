/* Learni AI — ספריית כלי ה-AI: מקור אמת יחיד. נטען על ידי index.html ועל ידי נווט הכלים (tool-finder). */
var tools=[
/* ===== צ'אט ועוזרים כלליים ===== */
{category:"צ'אט ועוזרים כלליים",name:"ChatGPT",link:"https://chatgpt.com",desc:"כלי בינה מלאכותית לשיחה, כתיבה, יצירת רעיונות, בניית מערכי שיעור, תרגולים ומשובים.",advantages:["קל מאוד לשימוש","מגוון שימושים רחב","מתאים להכנת חומרי למידה"],limitations:["דורש ניסוח פרומפט טוב","עלול לייצר מידע שגוי לפעמים"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"צ'אט ועוזרים כלליים",name:"Claude",link:"https://claude.ai",training:"training/claude/presentation.html",desc:"עוזר ה-AI של Anthropic — עברית מצוינת, כתיבה איכותית, ו-Artifacts: יצירת משחקים, מצגות וכלים אינטראקטיביים ישירות בצ'אט.",advantages:["עברית מהטובות בשוק","Artifacts — תוצרים אינטראקטיביים בצ'אט","מצוין לכתיבה, ניסוח ומסמכים"],limitations:["מכסת שימוש מוגבלת בחינם","חלק מהיכולות רק בתשלום"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"צ'אט ועוזרים כלליים",name:"Gemini",link:"https://gemini.google.com",training:"presentations/gemini/index.html",desc:"ה-AI של גוגל — שיחה, יצירת תמונות וסרטונים, ושילוב מלא עם Docs, Gmail ו-Drive שכבר עובדים איתם בבית הספר ובארגון.",advantages:["חינמי ונדיב","משתלב בסביבת Google","יוצר גם תמונות וסרטונים"],limitations:["דורש חשבון Google","התוצאות משתנות בין מצבי המודל"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"צ'אט ועוזרים כלליים",name:"Microsoft Copilot",link:"https://copilot.microsoft.com",desc:"העוזר של מיקרוסופט — מובנה ב-Windows ובדפדפן Edge, כולל יצירת תמונות. נפוץ בארגונים ובמשרדים.",advantages:["חינמי","מובנה ב-Windows וב-Edge","מוכר בסביבות ארגוניות"],limitations:["עברית טובה אך לא מושלמת","פחות גמיש מהמתחרים"],hebrew:"כן",pricing:"חינמי + בתשלום"},
/* ===== מחקר וסיכום ===== */
{category:"מחקר וסיכום",name:"Perplexity",link:"https://www.perplexity.ai",desc:"מנוע חיפוש AI שעונה עם מקורות מצוטטים — לעבודות חקר, בדיקת עובדות, סקירת שוק ליזמים ומחקר מתחרים.",advantages:["מציג מקורות לכל תשובה","מידע עדכני מהרשת","מתאים למחקר אקדמי ועסקי"],limitations:["המקורות לרוב באנגלית","מספר חיפושים מעמיקים מוגבל בחינם"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"מחקר וסיכום",name:"NotebookLM",link:"https://notebooklm.google.com",training:"training/notebooklm/presentation.html",desc:"המחברת החכמה של גוגל — מעלים מסמכים ומקבלים סיכומים, פודקאסטים, אינפוגרפיקות ומבחנים, הכל מבוסס רק על המקורות שלכם.",advantages:["חינמי","עונה רק מתוך המקורות שלך — פחות המצאות","פודקאסט גם בעברית"],limitations:["דורש להכין חומרים מראש","ממשק באנגלית"],hebrew:"כן",pricing:"חינמי + בתשלום"},
/* ===== מצגות, עיצוב ותמונות ===== */
{category:"מצגות, עיצוב ותמונות",name:"Gamma",link:"https://gamma.app",training:"training/gamma/presentation.html",desc:"כלי ליצירת מצגות אוטומטיות בעזרת AI - פשוט להזין נושא ולקבל מצגת מעוצבת.",advantages:["יוצר מצגות מהר מאוד","עיצוב מודרני ומרשים","ממשק פשוט"],limitations:["דורש עריכה לאחר יצירה","מוגבל בהתאמה אישית בחינם"],hebrew:"חלקי",pricing:"חינמי + בתשלום"},
{category:"מצגות, עיצוב ותמונות",name:"Canva AI",link:"https://www.canva.com",training:"training/canva/presentation.html",desc:"פלטפורמה ליצירת מצגות, תמונות וחומרים חזותיים עם כלי AI מובנים.",advantages:["ספריית תבניות ענקית","כלי עריכה אינטואיטיביים","יצירת תמונות עם AI"],limitations:["חלק מהתכונות בתשלום","דורש זמן ללמוד את האפשרויות"],hebrew:"כן",pricing:"חינמי + Pro בתשלום"},
{category:"מצגות, עיצוב ותמונות",name:"Claude Design",link:"https://claude.ai/design",training:"training/claude-design/presentation.html",desc:"סטודיו העיצוב של Claude — מתארים בשיחה מה צריכים ומקבלים מצגת, דשבורד או דף נחיתה מעוצבים, עם עריכה ישירה על הקנבס.",advantages:["עיצוב מקצועי בלי להיות מעצבים","עריכה ישירה — הערות, סליידרים וצבעים","ייצוא ל-PDF, PPTX, HTML ו-Canva"],limitations:["דורש מנוי Claude Pro ומעלה","אין תוכנית חינמית"],hebrew:"כן",pricing:"בתשלום (מנוי Claude)"},
{category:"מצגות, עיצוב ותמונות",name:"Napkin AI",link:"https://www.napkin.ai",desc:"הופך טקסט לאינפוגרפיקה ותרשימים בקליק — למצגות שיעור, דוחות הנהלה ופוסטים ברשתות.",advantages:["מהיר מאוד — מדביקים טקסט ומקבלים ויזואל","תוצאות מקצועיות","נדיב בחינם"],limitations:["תמיכה חלקית בעברית","פחות שליטה עיצובית מלאה"],hebrew:"חלקי",pricing:"חינמי + בתשלום"},
{category:"מצגות, עיצוב ותמונות",name:"Ideogram",link:"https://ideogram.ai",desc:"יצירת תמונות עם טקסט קריא בתוך התמונה — כרזות לכיתה, שלטים, לוגואים וגרפיקה שיווקית.",advantages:["טקסט בתמונה יוצא קריא","מהיר וקל","חינמי מוגבל"],limitations:["טקסט בעברית עדיין לא מושלם","ממשק באנגלית"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
{category:"מצגות, עיצוב ותמונות",name:"Google Stitch",link:"https://stitch.withgoogle.com",training:"training/stitch/presentation.html",desc:"כלי של Google Labs שמעצב מסכי אפליקציות ואתרים מתיאור בטקסט — מהרעיון לעיצוב מסכים מלא בדקות.",advantages:["חינמי","מסכים מעוצבים מתיאור פשוט","ייצוא לקוד ול-Figma"],limitations:["ממשק באנגלית","עדיין בשלב ניסיוני"],hebrew:"חלקי",pricing:"חינמי"},
/* ===== וידאו ===== */
{category:"וידאו",name:"Google Flow (Veo)",link:"https://labs.google/flow",training:"training/google-flow/presentation.html",desc:"סטודיו הווידאו של גוגל — יצירת סרטונים מטקסט ומתמונות עם מודל Veo. לפתיחי שיעור, סרטוני הסברה וסרטוני תדמית.",advantages:["איכות וידאו מהטובות בעולם","עבודה בסצנות כמו סטודיו אמיתי","כולל גם סאונד ודיבור"],limitations:["דורש מנוי Google AI","דיבור בעברית עדיין מוגבל"],hebrew:"חלקי",pricing:"בתשלום (מנוי Google AI)"},
{category:"וידאו",name:"HeyGen",link:"https://www.heygen.com",training:"training/heygen/presentation.html",desc:"אווטארים מדברים ודיבוב סרטונים לעברית — סרטוני הסבר והדרכה בלי מצלמה ובלי אולפן.",advantages:["דיבוב וסנכרון שפתיים לעברית","אווטארים מציאותיים","מתאים גם להדרכות ארגוניות ושיווק"],limitations:["מוגבל מאוד בחינם","הגייה בעברית דורשת בדיקה"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
{category:"וידאו",name:"D-ID",israeli:true,link:"https://www.d-id.com",desc:"חברה ישראלית שהופכת תמונה לדמות מדברת — דמויות היסטוריות שמדברות לכיתה, פרזנטור לעסק, סרטוני ברכה.",advantages:["כחול-לבן","תומך עברית","פשוט מאוד לשימוש"],limitations:["מוגבל בחינם","התוצאה לעיתים נראית מלאכותית"],hebrew:"כן",pricing:"חינמי מוגבל + בתשלום"},
{category:"וידאו",name:"CapCut",link:"https://www.capcut.com",training:"training/capcut/presentation.html",desc:"עריכת וידאו חינמית עם כלי AI — כתוביות אוטומטיות, הסרת רקע וטמפלטים. לסרטוני כיתה, רילס ותוכן שיווקי.",advantages:["חינמי ועשיר ביכולות","כתוביות אוטומטיות בעברית","גרסאות מחשב ונייד"],limitations:["חלק מהיכולות ב-Pro","ממשק עמוס למתחילים"],hebrew:"כן",pricing:"חינמי + Pro בתשלום"},
{category:"וידאו",name:"LTX Studio",israeli:true,link:"https://ltx.studio",desc:"מבית Lightricks הישראלית — מתסריט לסרטון שלם: סטוריבורד, דמויות עקביות ושליטה בכל סצנה.",advantages:["כחול-לבן","שליטה מלאה בכל שוט","דמויות עקביות לאורך הסרטון"],limitations:["עקומת למידה","מוגבל בחינם"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
/* ===== שמע ומוזיקה ===== */
{category:"שמע ומוזיקה",name:"Suno",link:"https://suno.com",desc:"יצירת שירים שלמים מטקסט — גם בעברית! שירי חזרה למבחן, שירי סוף שנה, ג'ינגלים לעסק והמנונים לצוות.",advantages:["שר בעברית","מילים + לחן + ביצוע בדקה","קל ומהנה לשימוש"],limitations:["הגייה בעברית לא תמיד מדויקת","שימוש מסחרי רק בתשלום"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"שמע ומוזיקה",name:"ElevenLabs",link:"https://elevenlabs.io",desc:"קריינות AI באיכות גבוהה — גם בעברית. קול לסרטונים, פודקאסטים, הנגשת טקסטים לתלמידים ותוכן שיווקי.",advantages:["עברית טבעית מהטובות שיש","מגוון קולות וסגנונות","מהיר מאוד"],limitations:["חינמי מוגבל מאוד","ניקוד עוזר לדייק את ההגייה"],hebrew:"כן",pricing:"חינמי מוגבל + בתשלום"},
{category:"שמע ומוזיקה",name:"TurboScribe",link:"https://turboscribe.ai",desc:"כלי לתמלול אוטומטי של הקלטות ושיעורים - הופך דיבור לטקסט. גם לישיבות צוות ופגישות עסקיות.",advantages:["תמלול מדויק","תומך בשפות רבות","מהיר ופשוט"],limitations:["איכות תלויה בהקלטה","מוגבל בדקות בחינם"],hebrew:"כן",pricing:"חינמי מוגבל + בתשלום"},
/* ===== כלים למורים ===== */
{category:"כלים למורים",name:"MagicSchool AI",link:"https://www.magicschool.ai",desc:"עשרות כלים מוכנים למורים — מחוללי מערכים, התאמות לתלמידים, משוב ותקשורת להורים. תומך פלט בעברית.",advantages:["בנוי במיוחד למורים","אפשר לקבל תוצרים בעברית","חינמי נדיב"],limitations:["הממשק באנגלית","דורש בדיקת התוצרים"],hebrew:"חלקי",pricing:"חינמי + בתשלום"},
{category:"כלים למורים",name:"Wizer.me",israeli:true,link:"https://wizer.me",desc:"דפי עבודה אינטראקטיביים עם AI — חברה ישראלית, עברית מלאה, כולל בדיקה אוטומטית ומעקב אחרי תלמידים.",advantages:["כחול-לבן, עברית מלאה","יצירת דף עבודה מכל חומר לימוד","בדיקה אוטומטית"],limitations:["מוגבל בחינם","חלק מהיכולות דורשות מנוי בית-ספרי"],hebrew:"כן",pricing:"חינמי + בתשלום"},
{category:"כלים למורים",name:"Diffit",link:"https://diffit.me",desc:"מתאים כל טקסט לרמות קריאה שונות — פתרון מהיר לכיתה הטרוגנית ולהנגשת חומרים.",advantages:["דיפרנציאציה בקליק","עובד גם עם עברית","מוסיף שאלות הבנה אוטומטית"],limitations:["הממשק באנגלית","העברית לא תמיד מדויקת"],hebrew:"חלקי",pricing:"חינמי + בתשלום"},
/* ===== בנייה בלי קוד ===== */
{category:"בנייה בלי קוד",name:"Claude Code",link:"https://claude.com/claude-code",training:"training/claude-code/intro.html",desc:"הכלי שמאחורי לרני — יוצרים מצגות, אתרים, משחקים ודשבורדים בשיחה חופשית על המחשב שלכם. יש קורס מלא בעברית באתר!",advantages:["חופש יצירה בלתי מוגבל","התוצרים נשארים אצלכם","קורס מלא בעברית באתר"],limitations:["דורש התקנה ראשונית","בתשלום"],hebrew:"כן",pricing:"בתשלום (מנוי Claude)"},
{category:"בנייה בלי קוד",name:"Claude Cowork",link:"https://claude.com",training:"training/cowork/presentation.html",desc:"סביבת העבודה של Claude למשימות משרדיות — נותנים משימה על קבצים ותיקיות והוא מבצע מקצה לקצה: מסמכים, ניתוחים, מצגות וסדר בקבצים.",advantages:["עובד ישירות על הקבצים שלכם","מתאים לעבודה ניהולית ומשרדית","מבצע משימות מקצה לקצה"],limitations:["בתשלום בלבד","דורש את אפליקציית Claude למחשב"],hebrew:"כן",pricing:"בתשלום (מנוי Claude)"},
{category:"בנייה בלי קוד",name:"Base44",israeli:true,link:"https://base44.com",desc:"סטארטאפ ישראלי שנרכש על ידי Wix — בונים אפליקציות שלמות בצ'אט: מערכות שיבוץ, טפסים, כלים בית-ספריים ואפליקציות עסקיות, כולל בסיס נתונים ומשתמשים.",advantages:["כחול-לבן","אפליקציה שלמה כולל בסיס נתונים","מבין מצוין פרומפטים בעברית"],limitations:["מספר הודעות מוגבל בחינם","הממשק באנגלית"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
{category:"בנייה בלי קוד",name:"Lovable",link:"https://lovable.dev",training:"presentations/lovable/index.html",desc:"בניית אתרים ואפליקציות בצ'אט — מרעיון למוצר עובד בדקות. לכלים כיתתיים, דפי נחיתה ומיזמים.",advantages:["מהיר מאוד","תוצאה מעוצבת מהרגע הראשון","אפשר לחבר בסיס נתונים"],limitations:["מכסה יומית בחינם","הממשק באנגלית"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
{category:"בנייה בלי קוד",name:"Google AI Studio",link:"https://aistudio.google.com",desc:"סביבת העבודה של גוגל ליוצרים — גישה חינמית למודלים המתקדמים, בניית אפליקציות וניסויים בפרומפטים.",advantages:["חינמי לחלוטין","גישה למודלים מתקדמים","כולל בניית אפליקציות (Build)"],limitations:["ממשק טכני יחסית","דורש חשבון Google"],hebrew:"כן",pricing:"חינמי"},
{category:"בנייה בלי קוד",name:"Genspark",link:"https://www.genspark.ai",training:"training/genspark/presentation.html",desc:"סופר-סוכן שמאחד כלי AI רבים — מצגות, מחקר, יצירת תמונות ותוכן במקום אחד.",advantages:["הרבה כלים בממשק אחד","יוצר מצגות ומסמכים שלמים","קרדיטים חינם כל יום"],limitations:["הממשק באנגלית","איכות משתנה בין הכלים"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
{category:"בנייה בלי קוד",name:"Manus",link:"https://manus.im",training:"presentations/manus/index.html",desc:"סוכן AI אוטונומי — נותנים משימה והוא מבצע אותה מקצה לקצה: מחקר, מצגות, ניתוח נתונים ובניית אתרים.",advantages:["עובד לבד מקצה לקצה","מתאים למשימות מורכבות","מציג את תהליך העבודה"],limitations:["קרדיטים מוגבלים בחינם","לוקח זמן למשימות גדולות"],hebrew:"חלקי",pricing:"חינמי מוגבל + בתשלום"},
/* ===== שיווק ===== */
{category:"שיווק",name:"Pomelli",link:"https://labs.google.com/pomelli",training:"training/pomelli/presentation.html",desc:"כלי של Google Labs לקריאייטיבים שיווקיים — מזינים את האתר שלכם ומקבלים Business DNA ותמונות מותאמות מותג. לעסקים, עמותות ובתי ספר.",advantages:["חינמי","לומד את המותג שלך מהאתר","תמונות שיווקיות מקצועיות"],limitations:["ממשק באנגלית","עדיין בשלב ניסיוני"],hebrew:"חלקי",pricing:"חינמי"},
{category:"שיווק",name:"Munch",israeli:true,link:"https://www.getmunch.com",desc:"חברה ישראלית — הופכת סרטון ארוך לקליפים קצרים לרשתות, עם זיהוי אוטומטי של הרגעים החזקים.",advantages:["כחול-לבן","חוסך שעות עריכה","כתוביות אוטומטיות"],limitations:["בתשלום אחרי תקופת ניסיון","מתאים בעיקר לתוכן מדובר"],hebrew:"כן",pricing:"ניסיון חינם + בתשלום"}
];

var toolMeta={
"ChatGPT":{tasks:["כתיבה","מחקר","שאלונים"],depth:["מהיר","איכותי"]},
"Claude":{tasks:["כתיבה","מחקר","שאלונים","אפליקציה"],depth:["איכותי"]},
"Gemini":{tasks:["כתיבה","מחקר","תמונות"],depth:["מהיר"]},
"Microsoft Copilot":{tasks:["כתיבה","מחקר","תמונות"],depth:["מהיר"]},
"Perplexity":{tasks:["מחקר"],depth:["מהיר","איכותי"]},
"NotebookLM":{tasks:["מחקר","תמלול"],depth:["איכותי"]},
"Gamma":{tasks:["מצגת"],depth:["מהיר"]},
"Canva AI":{tasks:["מצגת","תמונות","שיווק"],depth:["מהיר","איכותי"]},
"Napkin AI":{tasks:["תמונות","מצגת"],depth:["מהיר"]},
"Ideogram":{tasks:["תמונות","שיווק"],depth:["מהיר"]},
"Google Flow (Veo)":{tasks:["סרטון"],depth:["איכותי"]},
"HeyGen":{tasks:["סרטון"],depth:["איכותי"]},
"D-ID":{tasks:["סרטון"],depth:["מהיר"]},
"CapCut":{tasks:["סרטון","שיווק"],depth:["מהיר","איכותי"]},
"LTX Studio":{tasks:["סרטון"],depth:["איכותי"]},
"Suno":{tasks:["מוזיקה","שיווק"],depth:["מהיר"]},
"ElevenLabs":{tasks:["מוזיקה","סרטון"],depth:["איכותי"]},
"TurboScribe":{tasks:["תמלול"],depth:["מהיר"]},
"MagicSchool AI":{tasks:["שאלונים","כתיבה"],depth:["מהיר"]},
"Wizer.me":{tasks:["שאלונים"],depth:["איכותי"]},
"Diffit":{tasks:["שאלונים"],depth:["מהיר"]},
"Claude Code":{tasks:["אפליקציה","מצגת","סרטון"],depth:["איכותי"]},
"Claude Cowork":{tasks:["כתיבה","מצגת","תמלול"],depth:["איכותי"]},
"Claude Design":{tasks:["מצגת","תמונות"],depth:["מהיר","איכותי"]},
"Google Stitch":{tasks:["אפליקציה","תמונות"],depth:["מהיר"]},
"Base44":{tasks:["אפליקציה"],depth:["מהיר","איכותי"]},
"Lovable":{tasks:["אפליקציה"],depth:["מהיר"]},
"Google AI Studio":{tasks:["אפליקציה","מחקר"],depth:["איכותי"]},
"Genspark":{tasks:["מצגת","מחקר","תמונות"],depth:["מהיר"]},
"Manus":{tasks:["מחקר","מצגת","אפליקציה"],depth:["איכותי"]},
"Pomelli":{tasks:["שיווק","תמונות"],depth:["מהיר"]},
"Munch":{tasks:["שיווק","סרטון"],depth:["מהיר"]}
};
var roleBoost={
"מורה":["MagicSchool AI","Wizer.me","Diffit","ChatGPT","NotebookLM","Gamma","Suno"],
"מנהל":["NotebookLM","Claude","Gamma","Perplexity","TurboScribe","Microsoft Copilot","Napkin AI"],
"אחר":["Pomelli","Munch","Base44","Lovable","Ideogram","Suno","Perplexity","Claude"]
};
var toolCombos={
"כתיבה":{steps:["Perplexity","Claude"],why:"אוספים מידע ומקורות ב-Perplexity ← כותבים ומנסחים ברמה גבוהה ב-Claude."},
"מצגת":{steps:["NotebookLM","Gamma","Canva AI"],why:"מסכמים את החומר ב-NotebookLM ← מפיקים מצגת ב-Gamma ← מלטשים את העיצוב ב-Canva."},
"סרטון":{steps:["Claude","ElevenLabs","Google Flow (Veo)","CapCut"],why:"כותבים תסריט ב-Claude ← מקליטים קריינות בעברית ב-ElevenLabs ← מפיקים וידאו ב-Flow ← עורכים ומוסיפים כתוביות ב-CapCut."},
"מחקר":{steps:["Perplexity","NotebookLM"],why:"מחפשים עם מקורות ב-Perplexity ← מרכזים הכל ב-NotebookLM ומקבלים סיכום, פודקאסט ושאלות חזרה."},
"אפליקציה":{steps:["Claude","Base44"],why:"מאפיינים את הרעיון בשיחה עם Claude ← בונים את האפליקציה ב-Base44. למי שרוצה שליטה מלאה — Claude Code (יש קורס באתר!)."},
"תמונות":{steps:["Ideogram","Canva AI"],why:"יוצרים תמונה עם טקסט ב-Ideogram ← משלבים בעיצוב מקצועי ב-Canva."},
"שאלונים":{steps:["Claude","Wizer.me"],why:"מנסחים שאלות מתוך החומר ב-Claude ← הופכים לדף עבודה אינטראקטיבי עם בדיקה אוטומטית ב-Wizer."},
"מוזיקה":{steps:["Claude","Suno"],why:"כותבים מילים ב-Claude ← מלחינים ומבצעים ב-Suno. לקריינות מקצועית — ElevenLabs."},
"תמלול":{steps:["TurboScribe","Claude"],why:"מתמללים את ההקלטה ב-TurboScribe ← מסכמים לנקודות והחלטות ב-Claude."},
"שיווק":{steps:["Pomelli","Munch","Suno"],why:"קריאייטיבים ממותגים ב-Pomelli ← קליפים לרשתות ב-Munch ← ג'ינגל משלכם ב-Suno."}
};

function toolByName(n){for(var i=0;i<tools.length;i++)if(tools[i].name===n)return tools[i];return null;}
function toolSlug(n){return 'tool-'+n.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
function scoreTools(task,depth,role,freeOnly){
var scored=[];
for(var i=0;i<tools.length;i++){
var t=tools[i],m=toolMeta[t.name];
if(!m||m.tasks.indexOf(task)===-1)continue;
if(freeOnly&&t.pricing.indexOf('חינמי')===-1)continue;
var s=1;
if(m.depth.indexOf(depth)!==-1)s+=3;
if(roleBoost[role]&&roleBoost[role].indexOf(t.name)!==-1)s+=2;
if(t.training)s+=1;
if(t.hebrew==='כן')s+=1;
if(m.tasks.length===1)s+=1;
scored.push({t:t,s:s});
}
scored.sort(function(a,b){return b.s-a.s;});
return scored;
}
