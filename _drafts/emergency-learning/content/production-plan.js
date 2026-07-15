/* מדף הרציפות — תוכנית ייצור תוכן מלאה
 * מקור: סל תוכניות תשפ"ז (ZIP · פרטי) + מסגרת משרד העבודה (_curriculum-framework.md)
 * עוגן תקן: content-standard.md §0.4 · taxonomy.md · data-model.md
 * כל יחידה: 3 רמות (basic/standard/advanced) · ~5 יח' למודולה · נשארת [לאימות] עד חתימת מפקח.
 * status של מודולה: planned | doing | draft | review | verified
 * unitsEst = הערכת מס' יחידות (task + assessment). done = כמה נכתבו בפועל.
 */
window.PRODUCTION_PLAN = {
  meta: {
    updated: '2026-07-16',
    source: 'תוכניות לימודים — סל תשפ"ז (משרד העבודה · ORT · פרטי)',
    note: 'מקצועות הליבה ההומניסטיים/שפתיים = אזור-סכנה → Perplexity + מקור סמכותי + verify-pedagogy.'
  },

  tiers: {
    2: { name: 'מגמות מקצועיות', color: '#3AA65A', soft: '#EBF8EF',
         desc: 'נגזר ממסמך המקור בלבד · בלי אימות חיצוני · הכי מהיר לסקאלה' },
    3: { name: 'העשרה (קציר)', color: '#7A5CF0', soft: '#F0ECFE',
         desc: 'המרת נכסים קיימים (פיננסקלאס) ליחידות רצף' },
    4: { name: 'ליבה — אזור-סכנה', color: '#D9574F', soft: '#FDEEEC',
         desc: 'כל קביעה: Perplexity + מקור סמכותי (אקדמיה ללשון/משה"ח) + verify-pedagogy' },
    5: { name: 'ליבה — עיוני/הפניה', color: '#D99A18', soft: '#FFF7E8',
         desc: 'דיוק קריטי · עטיפת reference (קמפוס IL/מטח) + קציר' }
  },

  subjects: [
    /* ============ טיר 2 — מגמות מקצועיות (12) ============ */
    { id:'hair-design', name:'עיצוב שיער סוג 1', cat:'מגמה', domain:'טיפוח חן', code:'603',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'טיפוח חן/עיצוב שיער סוג 1/תוכנית לימודים — עיצוב שיער סוג 1.docx',
      modules:[
        {n:'מ1', t:'יסודות המקצוע, בטיחות והיגיינה', units:6, done:1, status:'doing'},
        {n:'מ2', t:'ביולוגיה, טריקולוגיה וכימיה של השיער', units:5, status:'planned'},
        {n:'מ3', t:'חפיפה, פן ותסרוקות', units:5, status:'planned'},
        {n:'מ4', t:'תספורות בכל הזוויות', units:5, status:'planned'},
        {n:'מ5', t:'צביעה והבהרה', units:6, status:'planned'},
        {n:'מ6', t:'סלסול והחלקה', units:5, status:'planned'},
        {n:'מ7', t:'שירות, תקשורת ואתיקה מקצועית', units:4, status:'planned'},
        {n:'מ8', t:'יזמות, שיווק דיגיטלי וניהול עסק', units:5, status:'planned'},
        {n:'מ9', t:'חניכות והתנסות מעשית מודרכת (סטאז\')', units:4, status:'planned'},
        {n:'מ10', t:'מטלת גמר: עיצוב שיער מלא ללקוח', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'confectionery', name:'קונדיטאות ואפייה', cat:'מגמה', domain:'קולינריה ותיירות',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'קולינריה ותיירות/קונדיטאות ואפייה לנוער/תוכנית לימודים — קונדיטאות ואפייה לנוער.docx',
      modules:[
        {n:'מ1', t:'יסודות המקצוע, בטיחות ועזרה ראשונה', units:5, status:'planned'},
        {n:'מ2', t:'תברואה, בטיחות מזון וכשרות', units:5, status:'planned'},
        {n:'מ3', t:'תורת החומרים, ציוד וכלים', units:5, status:'planned'},
        {n:'מ4', t:'שיטות אפייה ובישול והכנות בסיסיות', units:5, status:'planned'},
        {n:'מ5', t:'בצקי שמרים, לחמים ומחמצת', units:5, status:'planned'},
        {n:'מ6', t:'בצקי עלים, פריך ורבוך', units:5, status:'planned'},
        {n:'מ7', t:'עיסות בחושות, מוקצפות, מרנגים וקרמים', units:5, status:'planned'},
        {n:'מ8', t:'עוגות, רולדות וקלאסיקה', units:5, status:'planned'},
        {n:'מ9', t:'מנות קינוח, קינוחי כוסות וקינוחי מסעדה', units:5, status:'planned'},
        {n:'מ10', t:'לימודים תומכים', units:4, status:'planned'},
        {n:'מ11', t:'מטלת גמר', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'media-design', name:'עיצוב מדיה וקריאייטיב', cat:'מגמה', domain:'עיצוב ומדיה',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'עיצוב ומדיה/עיצוב מדיה וקריאייטיב/תוכנית לימודים — עיצוב מדיה וקריאייטיב.docx',
      modules:[
        {n:'מ1', t:'יסודות העיצוב והשפה החזותית', units:5, status:'planned'},
        {n:'מ2', t:'גרפיקה וקטורית ועיבוד תמונה', units:5, status:'planned'},
        {n:'מ3', t:'עיצוב גרפי, טיפוגרפיה וקומפוזיציה', units:5, status:'planned'},
        {n:'מ4', t:'צילום ועריכת וידאו', units:5, status:'planned'},
        {n:'מ5', t:'פרסום, שיווק וקריאייטיב', units:5, status:'planned'},
        {n:'מ6', t:'מיתוג וספר מותג', units:5, status:'planned'},
        {n:'מ7', t:'עיצוב ממשק ואתרים רספונסיביים (UX/UI)', units:5, status:'planned'},
        {n:'מ8', t:'אנימציה ומדיה תנועתית', units:5, status:'planned'},
        {n:'מ9', t:'בינה מלאכותית יוצרת בזרימת העבודה', units:5, status:'planned'},
        {n:'מ10', t:'פרזנטציה, ניהול לקוח ותיק עבודות', units:4, status:'planned'},
        {n:'מ11', t:'מטלת גמר: פרויקט עיצוב מדיה מקיף', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'textile-design', name:'עיצוב טקסטיל', cat:'מגמה', domain:'עיצוב ומדיה',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'עיצוב ומדיה/עיצוב טקסטיל/תוכנית לימודים — עיצוב טקסטיל.docx',
      modules:[
        {n:'מ1', t:'מיומנויות בסיסיות בעיצוב, ציור ורישום', units:5, status:'planned'},
        {n:'מ2', t:'תוכנות עיצוב גרפיות וכלי תכנון דוגמה', units:5, status:'planned'},
        {n:'מ3', t:'חומרים, סיבים ובטיחות בעבודה', units:5, status:'planned'},
        {n:'מ4', t:'מבוא לעולם הטקסטיל, היסטוריה וקיימות', units:5, status:'planned'},
        {n:'מ5', t:'עיצוב מוצר, קונספט ויזמות', units:5, status:'planned'},
        {n:'מ6', t:'טכניקות סריגה, קליעה וליבוד', units:5, status:'planned'},
        {n:'מ7', t:'טכניקות צביעה (טבעית ואקו-פרינט)', units:5, status:'planned'},
        {n:'מ8', t:'טכניקות אריגה', units:5, status:'planned'},
        {n:'מ9', t:'טכניקות הדפס', units:5, status:'planned'},
        {n:'מ10', t:'טכניקות תפירה, אופנה ותדמיתנות', units:5, status:'planned'},
        {n:'מ11', t:'מטלת גמר: תיק עבודות ופרויקט מסכם', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'ict-systems', name:'תפעול מערכות תקשוב', cat:'מגמה', domain:'מחשבים ותקשוב',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'מחשבים ותקשוב/תפעול מערכות תקשוב/תוכנית לימודים — תפעול מערכות תקשוב.docx',
      modules:[
        {n:'מ1', t:'יסודות החשמל, האלקטרוניקה ורשתות התקשורת', units:5, status:'planned'},
        {n:'מ2', t:'יישומי מחשב ואינטרנט', units:5, status:'planned'},
        {n:'מ3', t:'תחזוקת מחשבים נייחים וניידים', units:5, status:'planned'},
        {n:'מ4', t:'מערכות הפעלה למחשב האישי', units:5, status:'planned'},
        {n:'מ5', t:'רשתות תקשורת', units:5, status:'planned'},
        {n:'מ6', t:'מערכות הפעלה לשרתים', units:5, status:'planned'},
        {n:'מ7', t:'תשתיות ענן', units:5, status:'planned'},
        {n:'מ8', t:'אבטחת מידע והגנת סייבר', units:5, status:'planned'},
        {n:'מ9', t:'תמיכה טכנית וניהול תקלות', units:4, status:'planned'},
        {n:'מ10', t:'מטלת הגמר — תכנון והקמה של רשת מחשבים', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'green-building', name:'בנייה חדשנית ואקולוגית', cat:'מגמה', domain:'בניין וסביבה', code:'286',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'בנייה/בנייה חדשנית ואקולוגית/תוכנית לימודים — בנייה חדשנית ואקולוגית.docx',
      modules:[
        {n:'מ1', t:'יסודות תחיקת הבנייה, קריאה ושרטוט תוכניות', units:5, status:'planned'},
        {n:'מ2', t:'חומרי בנייה ותורת הבנייה', units:5, status:'planned'},
        {n:'מ3', t:'פרטי בניין וקונסטרוקציית בניין', units:5, status:'planned'},
        {n:'מ4', t:'טפסנות מעץ ומפלדה, ברזלנות, זיון ויציקה', units:5, status:'planned'},
        {n:'מ5', t:'בנייה קלה, מחיצות גבס וגימור (צבעות)', units:5, status:'planned'},
        {n:'מ6', t:'טכנולוגיות מתקדמות בבנייה טרומית ומתועשת', units:5, status:'planned'},
        {n:'מ7', t:'תכנון אקולוגי ובנייה ירוקה', units:5, status:'planned'},
        {n:'מ8', t:'בטיחות בעבודות בנייה', units:5, status:'planned'},
        {n:'מ9', t:'ארגון וניהול הבנייה', units:4, status:'planned'},
        {n:'מ10', t:'מטלת גמר: פרויקט בנייה חדשנית ואקולוגית', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'auto-tech', name:'אוטו טק אוטוטרוניקה', cat:'מגמה', domain:'רכב',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'רכב/אוטו טק אוטוטרוניקה/תוכנית לימודים — אוטו טק אוטוטרוניקה.docx',
      modules:[
        {n:'מ1', t:'יסודות חשמל, אלקטרוניקה ובטיחות בסדנה', units:5, status:'planned'},
        {n:'מ2', t:'המנוע ומערכותיו', units:5, status:'planned'},
        {n:'מ3', t:'מערכת ההנעה, ההעברה והמרכב', units:5, status:'planned'},
        {n:'מ4', t:'מערכות חשמל, אלקטרוניקה, מיזוג ובקרת אקלים', units:5, status:'planned'},
        {n:'מ5', t:'תקשורת מחשבים, מערכות בקרה ואבחון סייבר ברכב', units:5, status:'planned'},
        {n:'מ6', t:'מערכות עזר לנהג (ADAS) ורכב אוטונומי', units:5, status:'planned'},
        {n:'מ7', t:'רכב חשמלי והיברידי ומערכות מתח גבוה (HV-02)', units:5, status:'planned'},
        {n:'מ8', t:'אבחון, תחזוקה ומטלת גמר יישומית בסדנה', units:3, status:'planned', kind:'assessment'}
      ]},
    { id:'welding', name:'ריתוך בשילוב עיצוב חומרים', cat:'מגמה', domain:'מסגרות, ייצור ומיכון',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'מסגרות, ייצור ומיכון/ריתוך בשילוב עיצוב חומרים/תוכנית לימודים — ריתוך בשילוב עיצוב חומרים.docx',
      modules:[
        {n:'מ1', t:'בטיחות בסדנת מתכת והיכרות עם הציוד', units:5, status:'planned'},
        {n:'מ2', t:'קריאת שרטוט טכני ותורת החומרים', units:5, status:'planned'},
        {n:'מ3', t:'מסגרות ועיבוד מתכת', units:5, status:'planned'},
        {n:'מ4', t:'ריתוך פלדה באלקטרודה מצופה (MMA)', units:5, status:'planned'},
        {n:'מ5', t:'ריתוך בגז מוגן MIG/MAG ו-TIG', units:5, status:'planned'},
        {n:'מ6', t:'עיצוב ושילוב חומרים', units:5, status:'planned'},
        {n:'מ7', t:'בקרת איכות והכנה לבחינת הסמכה', units:4, status:'planned'},
        {n:'מ8', t:'מטלת גמר: פרויקט ריתוך ועיצוב מסכם', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'cooling-hvac', name:'התקנה ושירות למתקני קירור ומ״א', cat:'מגמה', domain:'חשמל ובקרת אקלים',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'חשמל ובקרת אקלים/התקנה ושירות למתקני קירור ומ״א וחשמלאי שירות/תוכנית לימודים — התקנה ושירות למתקני קירור ומ״א וחשמלאי שירות.docx',
      modules:[
        {n:'מ1', t:'יסודות בקרת אקלים ובטיחות', units:5, status:'planned'},
        {n:'מ2', t:'תורת החשמל ומערכות חשמל במתקן קירור', units:5, status:'planned'},
        {n:'מ3', t:'תרמודינמיקה ותורת הקירור', units:5, status:'planned'},
        {n:'מ4', t:'טכנולוגיית קירור, קררים חדשים ומיחזורם', units:5, status:'planned'},
        {n:'מ5', t:'התקנת מזגנים ומערכות לפי ת"י 994', units:5, status:'planned'},
        {n:'מ6', t:'שירות, אחזקה ואיתור תקלות', units:5, status:'planned'},
        {n:'מ7', t:'סדנת קירור ומיזוג + סדנת חשמל שירות', units:4, status:'planned'},
        {n:'מ8', t:'מטלת הגמר המסכמת', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'logistics', name:'לוג_יטק (לוגיסטיקה ותפעול)', cat:'מגמה', domain:'ניהול, לוגיסטיקה ופיננסים',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'ניהול, לוגיסטיקה ופיננסים/לוג_יטק/תוכנית לימודים — לוג_יטק.docx',
      modules:[
        {n:'מ1', t:'יסודות התפעול הארגוני, רכש, לוגיסטיקה וניהול', units:5, status:'planned'},
        {n:'מ2', t:'ניהול מחסנים חכמים וטכנולוגיה יישומית', units:5, status:'planned'},
        {n:'מ3', t:'תהליכי רכש ואספקה בסביבה הגלובלית', units:5, status:'planned'},
        {n:'מ4', t:'יישומים דיגיטליים בעולם העבודה', units:5, status:'planned'},
        {n:'מ5', t:'בטיחות וניהול סיכונים בתפעול מחסן', units:4, status:'planned'}
      ]},
    { id:'driving-instruction', name:'הוראת נהיגה לבוגרים', cat:'מגמה', domain:'תחבורה',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'תחבורה/הוראת נהיגה לבוגרים/תוכנית לימודים — הוראת נהיגה לבוגרים.docx',
      modules:[
        {n:'מ1', t:'דיני תעבורה למורה נהיגה', units:6, status:'planned'},
        {n:'מ2', t:'נוהלי רישוי', units:4, status:'planned'},
        {n:'מ3', t:'פסיכולוגיה יישומית', units:5, status:'planned'},
        {n:'מ4', t:'הגורם האנושי בנהיגה', units:4, status:'planned'},
        {n:'מ5', t:'דידקטיקה כללית', units:5, status:'planned'},
        {n:'מ6', t:'נהיגה נכונה למורה נהיגה', units:5, status:'planned'},
        {n:'מ7', t:'מתודיקה של הוראת הנהיגה', units:6, status:'planned'},
        {n:'מ8', t:'הנדסת תנועה', units:3, status:'planned'},
        {n:'מ9', t:'הכרת הרכב המודרני ומערכות הבטיחות', units:4, status:'planned'},
        {n:'מ10', t:'תורת המבחנים', units:3, status:'planned'},
        {n:'מ11', t:'הכרת מערכת "ברוש" ומקצועות תומכים', units:4, status:'planned'}
      ]},
    { id:'football', name:'אימון ושיפוט כדורגל', cat:'מגמה', domain:'ספורט',
      tier:2, cert:'תעודת מקצוע', taxRef:'§8',
      src:'ספורט/אימון ושיפוט כדורגל/תוכנית לימודים — אימון ושיפוט כדורגל.docx',
      modules:[
        {n:'מ1', t:'מושגי יסוד בספורט', units:4, status:'planned'},
        {n:'מ2', t:'מבוא לכדורגל', units:5, status:'planned'},
        {n:'מ3', t:'מדעי גוף האדם', units:5, status:'planned'},
        {n:'מ4', t:'הכשרת שופטי כדורגל', units:5, status:'planned'},
        {n:'מ5', t:'היבטים פסיכולוגיים וחברתיים', units:4, status:'planned'},
        {n:'מ6', t:'טכניקה וטקטיקה', units:5, status:'planned'},
        {n:'מ7', t:'המאמן כמנהיג', units:4, status:'planned'},
        {n:'מ8', t:'אנליסטיקה בסיסית וסקאוטינג', units:4, status:'planned'},
        {n:'מ9', t:'טכנולוגיה וכדורגל', units:4, status:'planned'},
        {n:'מ10', t:'הכשרת מאמנים UEFA C', units:5, status:'planned'},
        {n:'מ11', t:'מגיש עזרה ראשונה', units:4, status:'planned'},
        {n:'מ12', t:'התמחות מקצועית (בחירה)', units:3, status:'planned', kind:'assessment'}
      ]},

    /* ============ טיר 4 — ליבה · אזור-סכנה (9) ============ */
    { id:'hebrew', name:'עברית — לשון והבעה', cat:'ליבה', domain:'שפות', danger:true,
      tier:4, cert:'ליבה · בגרות 22024', taxRef:'§1', verify:'אקדמיה ללשון + משה"ח',
      src:'לימודי ליבה/שפות/עברית/תוכנית לימודים — עברית.docx',
      modules:[
        {n:'מ1', t:'להבין (הבנת הנקרא ואיתור מידע)', units:5, status:'planned'},
        {n:'מ2', t:'לארגן (סיכום, מיון, מבנה)', units:5, status:'planned'},
        {n:'מ3', t:'לכתוב (הבעה בכתב)', units:5, status:'planned'},
        {n:'מ4', t:'לדבר (הבעה בעל פה והצגה)', units:4, status:'planned'},
        {n:'מ5', t:'לבדוק (אמינות מידע וביקורתיות)', units:6, done:1, status:'doing'},
        {n:'מ6', t:'לטעון (עמדה, נימוק, שכנוע)', units:5, status:'planned'},
        {n:'מ7', t:'ליצור (יצירת תוכן)', units:5, status:'planned'},
        {n:'מ8', t:'לעבוד עם בינה מלאכותית', units:5, status:'planned'},
        {n:'מ9', t:'לפעול בחיים (שפה שימושית)', units:5, status:'planned'},
        {n:'מ10', t:'להשפיע (מטלת גמר ובחינת גמר)', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'arabic', name:'ערבית', cat:'ליבה', domain:'שפות', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'מקור סמכותי בערבית',
      src:'לימודי ליבה/שפות/ערבית/תוכנית לימודים — ערבית.docx',
      modules:[
        {n:'מ1', t:'יסודות השפה ואהבת הערבית', units:5, status:'planned'},
        {n:'מ2', t:'דקדוק ומבנים לשוניים', units:5, status:'planned'},
        {n:'מ3', t:'הבנת הנקרא והנשמע', units:5, status:'planned'},
        {n:'מ4', t:'הבעה בכתב ובעל פה', units:5, status:'planned'},
        {n:'מ5', t:'ספרות קלאסית: שירה ופרוזה', units:5, status:'planned'},
        {n:'מ6', t:'ספרות מודרנית וסיפור קצר', units:5, status:'planned'},
        {n:'מ7', t:'תוכן דיגיטלי ובינה מלאכותית', units:4, status:'planned'},
        {n:'מ8', t:'מטלת גמר (פרויקט אישי מסכם)', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'english', name:'אנגלית', cat:'ליבה', domain:'שפות', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'מקור סמכותי באנגלית',
      src:'לימודי ליבה/שפות/אנגלית/תוכנית לימודים — אנגלית.docx',
      modules:[
        {n:'מ1', t:'אלפבית, צלילים ודיגרפים', units:5, status:'planned'},
        {n:'מ2', t:'אוצר מילים שכיח (Band I)', units:5, status:'planned'},
        {n:'מ3', t:'משפט פשוט ודקדוק פונקציונלי', units:5, status:'planned'},
        {n:'מ4', t:'קריאת טקסט קצר מדורג', units:5, status:'planned'},
        {n:'מ5', t:'שיח בסיסי בעל-פה', units:4, status:'planned'},
        {n:'מ6', t:'כתיבה קצרה וכלים דיגיטליים', units:5, status:'planned'},
        {n:'מ7', t:'מטלת גמר מסכמת', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'civics', name:'אזרחות', cat:'ליבה', domain:'הומניסטיקה וחברה', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'משה"ח · חוקי יסוד',
      src:'לימודי ליבה/הומניסטיקה, חברה ואזרחות/אזרחות (בדיקה)/תוכנית לימודים — אזרחות.docx',
      modules:[
        {n:'מ1', t:'להיות אזרחים בישראל', units:5, status:'planned'},
        {n:'מ2', t:'הדמוקרטיה: עקרונות ומתחים', units:5, status:'planned'},
        {n:'מ3', t:'שלטון החוק', units:5, status:'planned'},
        {n:'מ4', t:'מוסדות השלטון', units:5, status:'planned'},
        {n:'מ5', t:'הפרדת רשויות וריסונים הדדיים', units:5, status:'planned'},
        {n:'מ6', t:'חשיבה ביקורתית ואוריינות מידע', units:4, status:'planned'},
        {n:'מ7', t:'מטלת הגמר: מיזם אזרחי ונייר עמדה', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'literature', name:'ספרות ממלכתי', cat:'ליבה', domain:'הומניסטיקה וחברה', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'מקור ספרותי מוסמך',
      src:'לימודי ליבה/הומניסטיקה, חברה ואזרחות/ספרות ממלכתי/תוכנית לימודים — ספרות ממלכתי.docx',
      modules:[
        {n:'מ1', t:'יסודות קריאת היצירה ומושגי הליבה', units:5, status:'planned'},
        {n:'מ2', t:'הדמות: זהות, התבגרות ויחסים', units:5, status:'planned'},
        {n:'מ3', t:'שירה: קול, רגש ואמצעים אמנותיים', units:5, status:'planned'},
        {n:'מ4', t:'חברה בישראל: בין שבר לאיחוי', units:5, status:'planned'},
        {n:'מ5', t:'הבעה, כתיבה ויצירה בעידן ה-AI', units:5, status:'planned'},
        {n:'מ6', t:'מטלת הגמר: מיזם תרבותי מבוסס-יצירה', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'history-arabic', name:'היסטוריה לדוברי ערבית', cat:'ליבה', domain:'הומניסטיקה וחברה', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'משה"ח · מקור היסטורי',
      src:'לימודי ליבה/הומניסטיקה, חברה ואזרחות/היסטוריה לדוברי ערבית/תוכנית לימודים — היסטוריה לדוברי ערבית.docx',
      modules:[
        {n:'מ1', t:'יסודות החשיבה ההיסטורית וניתוח מקורות', units:5, status:'planned'},
        {n:'מ2', t:'ראשית האסלאם, הח\'ליפות והמדינה המוסלמית', units:5, status:'planned'},
        {n:'מ3', t:'השאלה המזרחית והמרחב העות\'מאני', units:5, status:'planned'},
        {n:'מ4', t:'המנדטים והתעצבות המזה"ת המודרני', units:5, status:'planned'},
        {n:'מ5', t:'לאומיות, מלחמות העולם והשואה', units:5, status:'planned'},
        {n:'מ6', t:'מטלת גמר — מחקר היסטורי מסכם', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'history-diploma', name:'היסטוריה לתעודת גמר', cat:'ליבה', domain:'הומניסטיקה וחברה', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'משה"ח · מקור היסטורי',
      src:'לימודי ליבה/הומניסטיקה, חברה ואזרחות/היסטוריה לתעודת גמר/תוכנית לימודים — היסטוריה לתעודת גמר.docx',
      modules:[
        {n:'מ1', t:'זמן, מרחב וזהות', units:5, status:'planned'},
        {n:'מ2', t:'היסטוריה שאפשר לגעת בה (ארכיאולוגיה וממצא)', units:5, status:'planned'},
        {n:'מ3', t:'זכור ימות עולם: מהמקומי לגלובלי', units:5, status:'planned'},
        {n:'מ4', t:'ארגז הכלים (תחקיר, רטוריקה, AI)', units:5, status:'planned'},
        {n:'מ5', t:'השיא: סוכן הזיכרון (מטלת הגמר)', units:2, status:'planned', kind:'assessment'}
      ]},
    { id:'kodesh', name:'מקצועות קודש', cat:'ליבה', domain:'יהדות ורוח', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'מקור הלכתי מוסמך',
      src:'לימודי ליבה/יהדות ורוח/מקצועות קודש/תוכנית לימודים — מקצועות קודש.docx',
      modules:[
        {n:'מ1', t:'ארון הספרים והמתודה', units:5, status:'planned'},
        {n:'מ2', t:'שבת וטכנולוגיה', units:5, status:'planned'},
        {n:'מ3', t:'כשרות ופוד-טק', units:5, status:'planned'},
        {n:'מ4', t:'חושן משפט בעידן הדיגיטלי', units:5, status:'planned'},
        {n:'מ5', t:'בל תשחית, קיימות ואנרגיה', units:5, status:'planned'},
        {n:'מ6', t:'כבוד הבריות וטכנולוגיה מסייעת', units:4, status:'planned'}
      ]},
    { id:'tanach', name:'תנ"ך כללי', cat:'ליבה', domain:'יהדות ורוח', danger:true,
      tier:4, cert:'ליבה', taxRef:'§1', verify:'מקרא + מפרשים',
      src:'לימודי ליבה/יהדות ורוח/תנ_ך כללי/תוכנית לימודים — תנ_ך כללי.docx',
      modules:[
        {n:'מ1', t:'שורשים', units:5, status:'planned'},
        {n:'מ2', t:'משעבוד לחירות', units:5, status:'planned'},
        {n:'מ3', t:'מצפן ומוסר', units:5, status:'planned'},
        {n:'מ4', t:'תנ"ך מחוץ לספר', units:5, status:'planned'},
        {n:'מ5', t:'השיא: חוקרים ויוצרים (מטלת גמר)', units:2, status:'planned', kind:'assessment'}
      ]},

    /* ============ טיר 5 — ליבה · עיוני/דיוק קריטי (1) ============ */
    { id:'math', name:'מתמטיקה', cat:'ליבה', domain:'מתמטיקה ומדעים', danger:true,
      tier:5, cert:'ליבה · 3/4/5 יח"ל', taxRef:'§1', verify:'דיוק חישובי · קמפוס IL/מטח',
      src:'לימודי ליבה/מתמטיקה ומדעים/מתמטיקה/תוכנית לימודים — מתמטיקה.docx',
      modules:[
        {n:'מ1', t:'ביטחון מספרי', units:5, status:'planned'},
        {n:'מ2', t:'קוראים את המספרים (קריאת נתונים)', units:5, status:'planned'},
        {n:'מ3', t:'קשרים ודפוסים (פונקציות ומודלים)', units:5, status:'planned'},
        {n:'מ4', t:'מנתונים להחלטות (סטטיסטיקה והסקה)', units:5, status:'planned'},
        {n:'מ5', t:'הסתברות בחיים (סיכוי וסיכון)', units:5, status:'planned'},
        {n:'מ6', t:'מתמטיקה שרואים (מישור ומרחב)', units:5, status:'planned'},
        {n:'מ7', t:'מתרגמים מציאות למתמטיקה (בעיות מילוליות)', units:5, status:'planned'},
        {n:'מ8', t:'מתמטיקה של כסף (חשיבה פיננסית)', units:5, status:'planned'},
        {n:'מ9', t:'מתמטיקה עם כלים חכמים (טכנולוגיה ו-AI)', units:4, status:'planned'},
        {n:'מ10', t:'מספרים יוצרים שינוי (מטלת גמר)', units:2, status:'planned', kind:'assessment'}
      ]},

    /* ============ טיר 3 — העשרה · קציר (1 קיים) ============ */
    { id:'financial', name:'חינוך פיננסי (פיננסקלאס)', cat:'העשרה', domain:'ניהול, לוגיסטיקה ופיננסים',
      tier:3, cert:'העשרה', taxRef:'§ העשרה', harvest:'docs/learni/financial-teacher-kit/ (8 יח\' מוכנות)',
      src:'קציר — לא מה-ZIP',
      modules:[
        {n:'י1', t:'תקציב אישי', units:4, status:'planned', harvestFrom:'unit-01-budget'},
        {n:'י2', t:'בנקאות', units:4, status:'planned', harvestFrom:'unit-02-banking'},
        {n:'י3', t:'כלכלת משפחה', units:4, status:'planned', harvestFrom:'unit-03-family-finance'},
        {n:'י4', t:'הלוואות ואשראי', units:4, status:'planned', harvestFrom:'unit-04-loans'},
        {n:'י5', t:'חיסכון', units:4, status:'planned', harvestFrom:'unit-05-savings'},
        {n:'י6', t:'השקעות', units:4, status:'planned', harvestFrom:'unit-06-investments'},
        {n:'י7', t:'זכויות צרכן', units:4, status:'planned', harvestFrom:'unit-07-consumer-rights'},
        {n:'י8', t:'פרסום והוגנות', units:4, status:'planned', harvestFrom:'unit-08-ads-fairness'}
      ]}
  ]
};
