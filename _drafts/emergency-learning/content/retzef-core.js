/* רֶצֶף — לוגיקת ליבה משותפת (מסווג RED/GREEN · פלטות · מיפוי הערכה · בונה פרומפט)
 * נטען אחרי production-plan.js ו-curriculum-data.js. חושף window.RETZEF.
 * מקור-אמת יחיד ללוגיקה — annual-plan.html (עיון) + production-board.html (ניהול) משתמשים בו. */
window.RETZEF=(function(){
  var STATUS={planned:'מתוכנן',doing:'בעבודה',draft:'טיוטה',review:'בבדיקה',verified:'מאומת'};

  /* דרכי הערכה — 18 שיטות · 4 משפחות */
  var METHODS={
    mc:{lbl:'שאלה אמריקאית (בחירה מרובה)',fam:'sel'}, tf:{lbl:'נכון / לא נכון + הצדקה',fam:'sel'},
    match:{lbl:'שאלת התאמה (מושג ↔ הגדרה / כלי ↔ שימוש)',fam:'sel'}, sort:{lbl:'מיון פריטים לקטגוריות',fam:'sel'},
    order:{lbl:'סידור שלבים לפי הסדר הנכון',fam:'sel'}, fill:{lbl:'השלמת מונח חסר במשפט',fam:'sel'},
    label:{lbl:'זיהוי ותיוג על תרשים / תמונה',fam:'sel'}, explain:{lbl:'הסבר במילים שלך + דוגמה',fam:'open'},
    example:{lbl:'תן/י דוגמה משלך מהחיים',fam:'open'}, compare:{lbl:'טבלת השוואה (במה שונים?)',fam:'open'},
    perform:{lbl:'משימת ביצוע + רשימת תיוג (עבר/לא עבר)',fam:'perf'}, demo:{lbl:'הדגמה מצולמת של הביצוע',fam:'perf'},
    sim:{lbl:'תרגול מודרך / סימולציה',fam:'perf'}, calc:{lbl:'תרגיל פתור + הצגת דרך',fam:'perf'},
    scenario:{lbl:'תרחיש: "מה היית עושה?" + נימוק',fam:'high'}, cases:{lbl:'ניתוח מקרה / מקור',fam:'high'},
    reflect:{lbl:'רפלקציה קצרה / יומן למידה',fam:'high'}, oral:{lbl:'הצגה בעל-פה / ראיון קצר',fam:'high'}
  };
  var FAM={sel:{t:'בחירה',cls:'k'},open:{t:'בונה',cls:'s'},perf:{t:'ביצוע',cls:'r'},high:{t:'חשיבה',cls:'h'}};

  function pickMethod(text, trait, subj, rot){
    var t=text; function has(re){return re.test(t);}
    if(trait==='מיומנות'){
      if(has(/הדגמ|הצג|הצגת|הנחיה|ליווי/)) return 'demo';
      if(has(/חישוב|מדיד|כמות|יחס|מינון|תמחור|חשב/)) return 'calc';
      if(has(/תרגול|סימולצ|התנסות|הפעל/)) return 'sim';
      return ['perform','demo','sim'][rot%3];
    }
    if(trait==='אחריות') return ['scenario','reflect','oral'][rot%3];
    if(subj && subj.id==='math') return has(/גרף|נתונים|טבל|תרשים/)?'label':'calc';
    if(has(/שלב|שלבים|תהליך|רצף|נוהל|סדר\b|הכנת|מהלך/)) return 'order';
    if(has(/סוגי|סוגים|מיון|סיווג|קטגור|משפחות|קבוצות/)) return 'sort';
    if(has(/הבחנה|הבדל|לעומת|מול\b|שונה|השוואה|בין .* ל/)) return 'compare';
    if(has(/כלים|מכשיר|אביזר|מונח|מושג|הגדר|מינוח|טרמינ|רכיבים של/)) return 'match';
    if(has(/מבנה|אנטומי|חלקי|רכיבי|מפ[הת]|שרטוט|דיאגרמ|תרשים|צילום|תמונה|זיהוי/)) return 'label';
    if(has(/בטיחות|כלל|תקן|תקנה|חוק|אסור|מותר|זהירות|סיכון|היגיינ|סטריל|חיטוי/)) return 'tf';
    if(has(/מדוע|למה\b|חשיבות|משמעות|עקרון|מטרה|יתרון|השפעה|תפקיד|קשר בין|גורם/)) return 'explain';
    if(has(/שירות|לקוח|אתיק|דילמ|החלט|תקשורת|מקצועי[ת]? התנהג/)) return 'scenario';
    if(has(/דוגמ|יישום|בחיי|יומיומ|שימוש/)) return 'example';
    if(subj && subj.danger && has(/מקור|טקסט|יצירה|תעוד|עדות|רטורי|מניפולצ|ביקורת|פרשנ/)) return 'cases';
    return ['mc','fill','explain','match','tf'][rot%5];
  }

  var TIERCOLORS={2:'#3AA65A',3:'#7A5CF0',4:'#D9574F',5:'#D99A18'};
  function tierColor(t){return TIERCOLORS[t]||'#888';}

  /* יצרן=GPT · קציר=Gemini · בודק/מאמת=Claude (יצרן≠בודק) */
  var MODELS={
    gpt:{name:'GPT',c:'#0A7C6B',bg:'#E4F5F1'},
    gemini:{name:'Gemini',c:'#3B72E0',bg:'#EAF1FD'},
    claude:{name:'Claude',c:'#C96442',bg:'#FBEEE9'}
  };
  function producerOf(subj){ if(subj.tier===3) return 'gemini'; return 'gpt'; }

  /* שכבת גיוון — פלטה + עוגן-תוכן ילידי */
  var PALETTES={
    'hair-design':{p:'#C65D8E',s:'#FCEBF3',name:'רוז חם',hook:'תרחיש-לקוח/ה בסלון · כרטיס שירות · דילמת אתיקה מקצועית'},
    'confectionery':{p:'#B5793A',s:'#F6EEE2',name:'קרמל/אפייה',hook:'מתכון · מיזאנפלס · כרטיס הזמנה של לקוח'},
    'media-design':{p:'#0B8F98',s:'#E8F8F9',name:'תכלת מדיה',hook:'בריף עיצובי · כרטיס מותג · לוח השראה'},
    'textile-design':{p:'#8A5CC0',s:'#F1EAFB',name:'סגול טקסטיל',hook:'סקיצת דגם · לוח בדים · כרטיס אופנה'},
    'ict-systems':{p:'#2C7BE5',s:'#E9F1FD',name:'כחול תקשוב',hook:'תרחיש תקלה · כרטיס משתמש · לוג מערכת'},
    'green-building':{p:'#3F9B6D',s:'#EAF6EF',name:'ירוק בנייה',hook:'תוכנית אתר · כרטיס חומר · סקיצה אקולוגית'},
    'auto-tech':{p:'#D9663A',s:'#FBEDE5',name:'כתום מוסך',hook:'כרטיס אבחון תקלה · סכמת רכב'},
    'welding':{p:'#E0932B',s:'#FBF1DF',name:'ניצוץ תעשייתי',hook:'שרטוט מסגרת · כרטיס עבודה · בדיקת בטיחות'},
    'cooling-hvac':{p:'#2FA5B5',s:'#E6F6F8',name:'טורקיז קירור',hook:'סכמת מתקן · כרטיס תחזוקה'},
    'logistics':{p:'#556CD6',s:'#ECEEFB',name:'כחול לוגיסטי',hook:'תעודת משלוח · כרטיס מלאי · זרימת מחסן'},
    'driving-instruction':{p:'#C0453B',s:'#FBECEA',name:'אדום בטיחות-דרך',hook:'תרחיש כביש · כרטיס תמרור · דילמת נהיגה'},
    'football':{p:'#2E9E5B',s:'#E7F6EC',name:'ירוק מגרש',hook:'תרגיל אימון · כרטיס שיפוט · ניתוח מהלך'},
    'financial':{p:'#7A5CF0',s:'#F0ECFE',name:'סגול פיננסקלאס',hook:'סימולציית תקציב · כרטיס החלטה כלכלית'}
  };
  var PAL_DEFAULT={p:'#C99A2E',s:'#FBF3DE',name:'ליבה',hook:'טקסט-עוגן אותנטי · שאלת מקור'};
  function palOf(subj){ return PALETTES[subj.id]||PAL_DEFAULT; }

  /* מסווג RED/GREEN ברמת תת-הנושא */
  var HAZARD_DOMAINS=['cooling-hvac','auto-tech','welding','driving-instruction','green-building'];
  var RED_RULES=[
    {rx:/בטיחות|בטיחותי|היגיינ|חיטוי|סטריל|עיקור|ציוד מגן|מיגון|עזרה ראשונה|החייא|כיבוי|שריפ/, why:'בטיחות/היגיינה'},
    {rx:/כימי|כימיקל|חומצ|אמוני|רעל|ארסי|אלרג|דליק|חומרים מסוכנ/, why:'חומרים כימיים'},
    {rx:/חשמל|מתח גבוה|וולט|גז מוגן|גז דליק|לחץ גבוה|מיכל לחץ|כלי לחץ|לחץ אוויר|מנוע|בלמ|קירור|פריאון|מקרר|תרמודינמ/, why:'חשמל/מכני'},
    {rx:/כשרות|תברואה|בטיחות מזון|פתוגן|זיהום מזון|חיידק/, why:'בטיחות מזון'},
    {rx:/זכויות יוצר|קניין רוחני|רישוי|רישיון|דיני |ת"י|תקן ישראלי|תקנות|חוק העבודה|פטנט|סימן מסחר/, why:'משפט/זכויות'},
    /* 16.7: "מיסוי" ו"חוקי מדינה" חמקו כ-GREEN (מדיה מ10) — הופקו יחידות מס ומשפט בלי מומחה.
     * DNA §6 מגדיר משפט/רגולציה כ-RED. GPT התנהג למופת (אפס כללי-מס מומצאים), אבל הסיווג היה שגוי. */
    {rx:/מיסוי|מס הכנסה|מע"מ|מע״מ|חוקי מדינה|חוק\b|חוקים|משפטי|עוסק מורשה|עוסק פטור|ביטוח לאומי|דיווח לרשויות/, why:'מיסוי/משפט'},
    {rx:/רפוא|תרופ|אנטומי|פיזיולוג|מדעי גוף|פציע/, why:'רפואה/אנטומיה'},
    {rx:/נהיגה|תעבורה|לנהוג|תמרור|תאונ|הנדסת תנועה|בטיחות בדרכים|כביש/, why:'בטיחות בדרכים'}
  ];
  var SOFT_RX=/שירות|לקוח|תקשורת|אתיק|יזמות|שיווק|ניהול|מכיר|תמחור|מצג|פורטפוליו|תיעוד|רפלקצ|צוות|מנהיג|דיגיטל|ענן|נתונים|היסטורי|קונספט|השראה|פרסום|קמפיין|קופי|מותג|קריאייטיב|סיעור|קהל יעד/;
  function classifySub(text, subj){
    // ליבה הומנית (טיר 4/5): GREEN דרך verify-pedagogy (Perplexity+מקור סמכותי מחליפים מומחה תחום — החלטת מיטל)
    if(subj.cat==='ליבה'||subj.tier===4||subj.tier===5) return null;
    for(var i=0;i<RED_RULES.length;i++){ if(RED_RULES[i].rx.test(text)) return RED_RULES[i].why; }
    if(HAZARD_DOMAINS.indexOf(subj.id)>-1 && !SOFT_RX.test(text)) return 'תחום מסוכן-מיסודו';
    return null;
  }
  function classifyModule(subj,c,pm){
    var ks=[].concat((c&&c.knowledge)||[],(c&&c.skills)||[]);
    var g=0,r=0,whys={};
    ks.forEach(function(t){ var w=classifySub(t,subj); if(w){r++;whys[w]=1;}else g++; });
    var rg = ks.length===0 ? 'green' : (r===0?'green':(g===0?'red':'mixed'));
    return {rg:rg, green:g, red:r, why:Object.keys(whys).join(' · ')||'מיומנות/ניתוח'};
  }
  function subjRG(subj){
    var g=0,m=0,r=0;
    subj.modules.forEach(function(pm){ if(pm.kind==='assessment')return; var cl=classifyModule(subj,compFor(subj.id,pm.n),pm);
      if(cl.rg==='green')g++;else if(cl.rg==='mixed')m++;else r++; });
    return {green:g,mixed:m,red:r};
  }
  function greenQueue(){
    var out=[];
    window.PRODUCTION_PLAN.subjects.forEach(function(s){
      s.modules.forEach(function(pm){
        if(pm.kind==='assessment') return;
        var c=compFor(s.id,pm.n), cl=classifyModule(s,c,pm);
        if(cl.rg!=='red') out.push({subj:s,pm:pm,c:c,cl:cl});
      });
    });
    return out;
  }

  /* סוג GREEN: core (ליבה·verify-pedagogy) · soft (GPT מפיק מצוין) · technique (יוצא חלול בלי DOCX) */
  function greenType(subj,c){
    if(subj.cat==='ליבה'||subj.tier===4||subj.tier===5) return 'core';
    var ks=[].concat((c&&c.knowledge)||[],(c&&c.skills)||[]);
    if(!ks.length) return 'soft';
    var soft=0; ks.forEach(function(t){ if(SOFT_RX.test(t)) soft++; });
    return soft/ks.length>=0.4 ? 'soft' : 'technique';
  }

  function comp(id){ return (window.CURRICULUM[id]||{}).mods||[]; }
  function modNum(pmN){ var m=String(pmN).match(/\d+/); return m?parseInt(m[0]):null; }
  function compFor(id,pmN){ var n=modNum(pmN); return comp(id).find(function(m){return m.n===n;})||{knowledge:[],skills:[]}; }

  function subtopics(mod, subj){
    var out=[], rk=0, rs=0;
    (mod.knowledge||[]).forEach(function(k){ out.push({trait:'ידע',cls:'k',text:k,check:'יודע ומסביר: '+k,method:pickMethod(k,'ידע',subj,rk++),red:classifySub(k,subj)}); });
    (mod.skills||[]).forEach(function(s){ out.push({trait:'מיומנות',cls:'s',text:s,check:'מבצע בפועל: '+s,method:pickMethod(s,'מיומנות',subj,rs++),red:classifySub(s,subj)}); });
    return out;
  }
  function subjStats(subj){
    var cm=comp(subj.id), topics=subj.modules.length, subs=0, done=0;
    cm.forEach(function(m){ subs+=(m.knowledge||[]).length+(m.skills||[]).length; });
    subj.modules.forEach(function(m){ if(m.status==='verified'||m.status==='draft'||m.status==='doing') done+=(m.done||0); });
    var totalUnits=subj.modules.reduce(function(a,m){return a+(m.units||0);},0);
    return {topics:topics,subs:subs,units:totalUnits,done:done};
  }

  /* בונה את פרומפט-היצרן (מחרוזת) — משותף לשני הדפים */
  function buildPrompt(subj,mi){
    var pm=subj.modules[mi], c=compFor(subj.id,pm.n), subs=subtopics(c,subj);
    var cl=classifyModule(subj,c,pm), pal=palOf(subj);
    var lines=subs.map(function(s){ return '   '+(s.red?'🔴':'🟢')+' ['+s.trait+'] '+s.text+(s.red?' — RED('+s.red+'): שלד בלבד, [לאימות—מומחה]':'')+'  → הערכה: '+METHODS[s.method].lbl; }).join('\n');
    var danger = subj.danger ?
      ('6. אזור-סכנה: אל תמציא/י עובדות לשון/היסטוריה/הלכה. קביעה שאינך בטוח/ה בה 100% — כתוב/י [לאימות] (Claude יאמת מול מקור סמכותי). הישען/י על הכשירויות למטה.') :
      '6. המקור הקובע = רשימת הכשירויות למטה (חולצה מראש מה-DOCX). אל תדרוש/י את ה-DOCX ואל תמציא/י כשירויות שאינן ברשימה. תייג/י כל קביעה [מקור: '+subj.name+' · '+pm.n+'].';
    var gate;
    if(cl.rg==='green' && subj.danger)
      gate='🟢 סיווג: GREEN דרך אימות פדגוגי (ליבה הומנית). ניתן לייצור עכשיו — אך כל קביעה עוברת Perplexity + מקור סמכותי ('+(subj.verify||'אקדמיה ללשון/משה"ח')+') + הסקיל verify-pedagogy לפני חתימה. verify-pedagogy מחליף כאן מומחה תחום (החלטת מיטל). אל תמסור לתלמיד לפני אימות.';
    else if(cl.rg==='green')
      gate='🟢 סיווג: GREEN ('+cl.why+'). ניתן לייצור מלא. חתימה סופית: רכז מגמה (מורה המקצוע). כל קביעה מתויגת [מקור: '+subj.name+' · '+pm.n+'].';
    else if(cl.rg==='mixed')
      gate='🟠 סיווג: מעורב — '+cl.green+' תתי-נושאים GREEN (ייצור מלא) · '+cl.red+' RED ('+cl.why+'). ייצר במלואם רק את ה-🟢. את ה-🔴 הפק כשלד + [לאימות—מומחה] בלבד, אל תמסור לתלמיד לפני חתימת מומחה תחום.';
    else
      gate='🔴 סיווג: RED ('+cl.why+'). אין מומחה תחום זמין כרגע — הפק שלד פדגוגי בלבד. כל עובדה/נתון/כלל = [לאימות—מומחה]. אל תמסור לתלמיד לפני חתימת מומחה. Perplexity+מקור סמכותי חובה.';
    var nn=String(mi+1).padStart(2,'0'), prod=MODELS[producerOf(subj)];
    return 'צור יחידות תוכן ל"מדף הרציפות" (רֶצֶף · _drafts/emergency-learning).\n\n'+
      '🚨 הוראת-ביצוע — קרא/י ראשון:\n'+
      '• הפק/י עכשיו יחידות בפועל (טקסט Markdown מלא). אל תתאר/י תוכנית, אל תכתוב/י "אבנה"/"אבדוק קודם".\n'+
      '• 🚫 קריאה: אל תחפש/י מסמכי מקור (DOCX / תבנית / unit-dna) ואל תדרוש/י אותם — כל מה שצריך כתוב כאן למטה. חסר משהו? כתוב/י [לאימות] והמשך/י. אל תעצור/י בגלל "קובץ לא נמצא".\n'+
      '• ✍ כתיבה — **חוק הדחיפה. קרא/י אותו במלואו לפני שאת/ה כותב/ת שורה:**\n'+
      '   1. **השורה הראשונה בתשובתך** חייבת להיות אחת מהשתיים, בדיוק: `דוחף ל-main` **או** `אין לי גישת-דחיפה — מדפיס בצ\'אט`. בלי השורה הזו — אל תמשיך/י.\n'+
      '   2. יש גישה? **דחוף/י ישירות ל-main בלבד.** ריפו: meytalp-dev/ort-training · ענף: `main`.\n'+
      '   3. 🚫 **אסור ליצור ענף.** 🚫 **אסור לפתוח PR.** ענף צדדי = העבודה נעלמת מהלוח ואף אחד לא רואה אותה. זה קרה, וזו הייתה עבודה מבוזבזת.\n'+
      '   4. קומיט לכל יחידה, **בעברית**, בפורמט: `רצף: '+subj.name+' '+pm.n+' יחידה <n> — <כותרת>`.\n'+
      '   5. נתיב מלא: `_drafts/emergency-learning/content/'+subj.id+'/module-'+nn+'/` + עדכון `_manifest.md`.\n'+
      '   6. אין גישה? הדפס/י בצ\'אט — אבל אמור/אמרי זאת בשורה הראשונה (סעיף 1). אל תשתוק/י ואל תתחזה/י לדוחף/ת.\n'+
      '• 🔁 **היקף העבודה — את/ה מפיק/ה את המודולה כולה, לא יחידה אחת:**\n'+
      '   · יש '+subs.length+' תתי-נושאים למטה → **'+subs.length+' יחידות**. הפק/י את **כולן**, אחת אחרי השנייה, ברצף.\n'+
      '   · **דוחף/ת לריפו? אל תעצור/י בין יחידות ואל תבקש/י אישור.** סיימת יחידה → קומיט → **המשך/י מיד ליחידה הבאה.** בלי לשאול, בלי "כתבי המשך", בלי לחכות.\n'+
      '   · 🚫 **אסור לכתוב "כתבי המשך" / "להמשיך?" / "אמשיך ליחידה הבאה?".** מיטל לא מקלידה "המשך" '+subs.length+' פעמים. עצירה אחרי יחידה 1 = מודולה תקועה על 1/'+subs.length+' — זה קרה, וזו הייתה הבעיה הגדולה ביותר בפס-הייצור.\n'+
      '   · נגמר לך המקום באמצע? כתוב/י שורה אחת: `ממשיך מיחידה N` — והמשך/י בהודעה הבאה **מעצמך**.\n'+
      '   · בסוף המודולה כולה כתוב/י: `— הושלמה '+pm.n+' · <כמה> יחידות נדחפו ל-main`.\n'+
      '   · **מדפיס/ה בצ\'אט (אין דחיפה)?** רק אז מותר לעצור בין יחידות — כתוב/י "— סיום יחידה N · כתבי המשך".\n'+
      '• התחל/י מיד ביחידה 1. בלי הקדמות.\n'+
      '• (אם הודבקה בתחילת השיחה "ערכת-יצרן / gpt-producer-kit" — עקוב/י אחריה; היא מכילה DNA מלא + יחידת-דוגמה.)\n\n'+
      gate+'\n\n'+
      '📐 תבנית היחידה — מלא/י בדיוק לפי המבנה הזה (הכול כאן, אין צורך בשום קובץ חיצוני):\n'+
      '# יחידה <מס\'> — <כותרת תת-הנושא>\n'+
      'frontmatter (YAML): subject · module · unit_type: task · grade: [לאימות] · track_id · content_source: competencies-list · duration_mode: estimated · skill: <ידע|מיומנות> — <תת-נושא> · pedagogy_verified: [לאימות — רכז מגמה] · source: <מקצוע · מודולה>\n'+
      '> רעיון מרכזי אחד (מנה אחת): <משפט אחד>\n'+
      'רלוונטיות לקהל מגוון: <ניהול/יזמות/שיווק/חיים — לא רק ביה"ס>\n'+
      '## 🟢 basic (אני איתך): פתיח → הסבר (מנה 1) → דוגמה → 2 שאלות (+משוב ✅/💡) → סיכום\n'+
      '## 🔵 standard (מנסה לבד): פתיח → הסבר (שכבה 2) → דוגמה → 3 שאלות → סיכום\n'+
      '## 🟣 advanced (בא לי אתגר): פתיח → הסבר (עד 2 מנות) → דוגמה → 3 שאלות (ניתוח/יצירה/ביצוע) → סיכום\n'+
      '### הערת אימות\n'+
      'כללי-ברזל: ≤12 מילים/משפט · ≤40/מסך · מנה אחת (ספירה עקבית בין הרמות) · פנייה ניטרלית-מגדרית (רבים סתמי — לא "אתה"/"לבש") · בלי אימוג\'ים בגוף (רק 🟢🔵🟣 לרמות, ✅/💡 למשוב) · בלי "מים" — תוכן קונקרטי או [לאימות] · גַוֵּן שיטות הערכה (לא הכול אמריקאית/השלמה) · מיומנות→משימת ביצוע+רשימת תיוג · לכל מסיח בשאלת-ידע error_type מתוך {concept · rule-application · form-confusion · overgeneralization · attention}.\n'+
      '🚫 תוויות רמה: כתוב/י בדיוק "🟢 basic (אני איתך)" / "🔵 standard (מנסה לבד)" / "🟣 advanced (בא לי אתגר)". **אסור** "מתקשה" / "חלש" / "רמה נמוכה" — התלמיד רואה את הכותרת, ותווית-חסר פוגעת בו.\n'+
      '🚫 כותרת היחידה: אם תת-הנושא ברור — כתוב/י כותרת אמיתית. אל תשתול/י [לאימות] בכותרת כשהגוף מלא (זה גורם למחיקה שגויה של תוכן טוב). [לאימות] שייך לשדות ולקביעות, לא לכותרת.\n\n'+
      'מודל יצרן: '+prod.name+'. בודק/מאמת: Claude — הפרכה 6-צירית'+(subj.danger?' + verify-pedagogy':'')+'. יצרן≠בודק. חתימה: '+(subj.danger?'אימות פדגוגי':'רכז מגמה')+'.\n\n'+
      'שכבת גיוון (DNA §4a):\n'+
      '   · פלטת מקצוע: '+pal.name+' (צבע ראשי '+pal.p+', רך '+pal.s+') — בכל היחידות.\n'+
      '   · עוגן-תוכן ילידי: '+pal.hook+' — בנה/י את הדוגמאות סביבו.\n'+
      '   · סובב/י בין 18 שיטות ההערכה (לא הכול אמריקאית).\n\n'+
      'מקצוע: '+subj.name+' ('+subj.cat+') · נושא '+pm.n+' — '+(pm.t||c.title)+'\n'+
      'טיר: '+subj.tier+' ('+window.PRODUCTION_PLAN.tiers[subj.tier].name+')'+(subj.danger?' · אזור-סכנה':'')+'\n'+
      'מקור (למידע בלבד — אל תנסה/י לפתוח): '+(subj.src||'')+'\n'+
      'פורמט: בדיוק לפי התבנית למעלה.\n\n'+
      'תתי-הנושאים (מאפיין → איך נבחן):\n'+lines+'\n'+
      (c.assess?('   תוצר מודולה: '+c.assess+'\n'):'')+'\n'+
      'הוראות:\n'+
      '1. הכשירויות למטה סופיות ומחייבות — אל תחפש/י את ה-DOCX/GitHub/Drive. עבוד/י מהן ישירות.\n'+
      '2. כל תת-נושא → יחידת task ב-3 רמות. התלמיד לא רואה תוויות רמה.\n'+
      '3. הערכה לפי מאפיין: ידע→שאלה · מיומנות→ביצוע+תיוג · אחריות→תרחיש.\n'+
      '4. תיוג error_type לכל מסיח בשאלת-ידע (5 הקטגוריות שבכללי-הברזל למעלה).\n'+
      '5. תוצר המודולה → יחידת assessment בסוף.\n'+
      danger+'\n'+
      '7. כתוב/דחוף ל-_drafts/emergency-learning/content/'+subj.id+'/module-'+nn+'/unit-<nn>-<slug>.md + _manifest.md (ריפו meytalp-dev/ort-training, ענף main). הסטטוס [לאימות].\n';
  }

  return {STATUS:STATUS,METHODS:METHODS,FAM:FAM,pickMethod:pickMethod,tierColor:tierColor,
    MODELS:MODELS,producerOf:producerOf,PALETTES:PALETTES,PAL_DEFAULT:PAL_DEFAULT,palOf:palOf,
    HAZARD_DOMAINS:HAZARD_DOMAINS,classifySub:classifySub,classifyModule:classifyModule,subjRG:subjRG,
    greenQueue:greenQueue,comp:comp,modNum:modNum,compFor:compFor,subtopics:subtopics,subjStats:subjStats,
    greenType:greenType,buildPrompt:buildPrompt};
})();
