/* AI NAVI — מנוע המלצות מבוסס חוקים
   קלט: answers = {
     taskText, tasks[], material, output, priorities[] (עד 2),
     time, experience, sensitive
   }
   פלט: buildResult(answers) → { summary, route, steps[], alternatives, warnings[], prompt, recommendedAlt }
*/
(function () {
  "use strict";

  var TOOLS = window.NAVI_TOOLS || [];
  var ROUTES = window.NAVI_ROUTES || [];
  var FAMILIES = window.NAVI_FAMILIES || [];

  function familyOf(id) {
    for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i].id === id) return FAMILIES[i];
    return null;
  }

  /* ---------- ניקוד כלי ---------- */
  function scoreTool(tool, answers) {
    var s = 0;
    (answers.tasks || []).forEach(function (t) {
      if (tool.bestFor.indexOf(t) !== -1) s += 3;
    });
    if (answers.material && tool.inputs.indexOf(answers.material) !== -1) s += 3;
    if (answers.output && tool.outputs.indexOf(answers.output) !== -1) s += 3;
    (answers.priorities || []).forEach(function (p) {
      if ((tool.priorities || []).indexOf(p) !== -1) s += 2;
    });

    // ניסיון מול קושי
    var exp = answers.experience || "beginner";
    if (tool.difficulty === "advanced") s += exp === "advanced" ? 1 : exp === "intermediate" ? -2 : -5;
    if (tool.difficulty === "intermediate" && exp === "beginner") s -= 1;

    // זמן קצר → כלים פשוטים
    if (answers.time === "10min") {
      if (tool.difficulty === "beginner") s += 2;
      if (tool.difficulty === "advanced") s -= 2;
    }

    // מחיר
    if ((answers.priorities || []).indexOf("price") !== -1) {
      if (tool.pricing === "free") s += 2;
      else if (tool.pricing === "freemium") s += 1;
      else s -= 3;
    }

    // פרטיות
    var sensitive = answers.sensitive === "yes" || answers.sensitive === "unsure";
    if (sensitive || (answers.priorities || []).indexOf("privacy") !== -1) {
      if (tool.privacyLevel === "organizationOnly") s += 4;
      else if (tool.privacyLevel === "standard") s += 2;
      else s -= 2;
    }

    if (tool.supportsHebrew) s += 2;
    return s;
  }

  function pickToolForRole(role, answers) {
    var candidates = TOOLS.filter(function (t) { return (t.roles || []).indexOf(role) !== -1; });
    if (!candidates.length) return { tool: null, alt: null };
    var ranked = candidates.map(function (t) { return { t: t, s: scoreTool(t, answers) }; })
      .sort(function (a, b) { return b.s - a.s; });
    return { tool: ranked[0].t, alt: ranked[1] ? ranked[1].t : null };
  }

  /* ---------- בחירת מסלול ---------- */
  function scoreRoute(route, answers) {
    var s = 0;
    (answers.tasks || []).forEach(function (t) {
      if (route.match.tasks.indexOf(t) !== -1) s += 3;
    });
    if (answers.material && route.match.materials.indexOf(answers.material) !== -1) s += 4;
    if (answers.output && route.match.outputs.indexOf(answers.output) !== -1) s += 4;
    return s;
  }

  var ROLE_LABEL = {
    research: "מחקר", extract: "חילוץ תובנות", ideate: "חשיבה ותכנון", write: "כתיבה",
    analyze: "ניתוח", slides: "מצגת ועיצוב", design: "המחשה ועיצוב", image: "תמונה",
    video: "וידאו", voice: "קריינות", music: "מוזיקה", transcribe: "תמלול",
    build: "בנייה", automate: "אוטומציה", organize: "ארגון", human: "בדיקה אנושית"
  };

  var TASK_TO_ROLE = {
    think: "ideate", research: "research", write: "write", analyze: "analyze",
    design: "design", image: "image", presentation: "slides", build: "build",
    automate: "automate", organize: "organize"
  };

  function genericRoute(answers) {
    // אין מסלול מוכן שמתאים מספיק → כלי אחד או שניים לפי המשימה
    var mainTask = (answers.tasks || [])[0] || "think";
    var role = TASK_TO_ROLE[mainTask] || "ideate";
    if (mainTask === "av") role = answers.output === "audio" ? "voice" : "video";
    var steps = [
      { role: role, title: ROLE_LABEL[role], ai: "מבצע את עיקר העבודה לפי הנחיה מדויקת שלך", human: "מנסחת בקשה ברורה: מה יש, מה רוצים, למי", check: "התוצר עונה על מה שביקשת — או על משהו דומה לו?" },
      { role: "human", title: "בדיקה אנושית", ai: "", human: "עוברת על התוצר: עובדות, ניסוח, התאמה לקהל", check: "אפשר לעמוד מאחורי כל משפט?" }
    ];
    return {
      id: "generic",
      name: "משימה ממוקדת — כלי אחד + בדיקה",
      input: answers.taskText || "המשימה שלך",
      output: "תוצר ראשוני + בדיקה",
      steps: steps,
      warnings: [],
      prompt: "",
      alternatives: {
        fast: "לבצע הכול בכלי שיחה אחד, בשיחה אחת.",
        pro: "לפצל לשני כלים: אחד לתוכן ואחד לעיבוד הסופי, עם בדיקה בין השלבים.",
        budget: "כלי חינמי אחד + תבנית קיימת של הארגון."
      }
    };
  }

  /* ---------- אזהרות ---------- */
  function buildWarnings(route, answers, steps) {
    var w = [];
    if (answers.sensitive === "yes" || answers.sensitive === "unsure") {
      w.push({ level: "risk", text: "סימנת שייתכן מידע רגיש: לפני העלאה — לבדוק את מדיניות הארגון, להעדיף כלי מאושר ארגונית, ולהסיר פרטים מזהים. כשיש ספק: לא מעלים." });
    }
    (route.warnings || []).forEach(function (t) { w.push({ level: "warn", text: t }); });
    if ((answers.priorities || []).indexOf("sources") !== -1) {
      w.push({ level: "warn", text: "ביקשת מקורות: לוודא שכל טענה בתוצר נשארת צמודה למקור שלה — ולקרוא את המקורות המרכזיים בעצמך." });
    }
    if (["presentation", "image", "video", "site"].indexOf(answers.output) !== -1) {
      w.push({ level: "warn", text: "עיצוב יפה אינו מבטיח דיוק — לבדוק את התוכן בנפרד מהמראה." });
    }
    var nonHebrew = steps.filter(function (st) { return st.tool && !st.tool.supportsHebrew; });
    if (nonHebrew.length) {
      w.push({ level: "info", text: "חלק מהכלים במסלול (" + nonHebrew.map(function (st) { return st.tool.name; }).join(", ") + ") חזקים יותר באנגלית — לבדוק את התוצר בעברית, כולל כיווניות." });
    }
    w.push({ level: "info", text: "לעבור על התוצר המלא לפני הפצה — האחריות על התוצר היא תמיד שלך." });
    return w;
  }

  /* ---------- פרומפט ---------- */
  function buildPrompt(route, answers) {
    if (route.prompt) return route.prompt;
    var p = "המשימה שלי: " + (answers.taskText || "[תיאור המשימה]") + ".\n";
    p += "יש לי: " + (MATERIAL_LABEL[answers.material] || "רעיון") + ". ";
    p += "התוצר הרצוי: " + (OUTPUT_LABEL[answers.output] || "תשובה") + ".\n";
    p += "חשוב לי במיוחד: " + (answers.priorities || []).map(function (x) { return PRIORITY_LABEL[x] || x; }).join(" + ") + ".\n";
    p += "התחל בשאלות הבהרה אם חסר לך מידע, ואז הצע מבנה לתוצר לפני שאתה כותב אותו במלואו.";
    return p;
  }

  var MATERIAL_LABEL = {
    none: "אין חומר גלם", idea: "רעיון", "short-text": "טקסט קצר", doc: "מסמך",
    "multi-docs": "כמה מסמכים", data: "נתונים", image: "תמונה", audio: "אודיו",
    video: "וידאו", links: "קישורים ואתרים"
  };
  var OUTPUT_LABEL = {
    answer: "תשובה", doc: "מסמך", presentation: "מצגת", image: "תמונה", video: "סרטון",
    audio: "אודיו", table: "טבלה", report: "דוח", site: "אתר", app: "אפליקציה", automation: "תהליך אוטומטי"
  };
  var PRIORITY_LABEL = {
    speed: "מהירות", quality: "איכות", accuracy: "דיוק", sources: "מקורות", design: "עיצוב",
    ease: "קלות", price: "מחיר", privacy: "פרטיות", control: "שליטה"
  };
  var TASK_LABEL = {
    think: "חשיבה ותכנון", research: "מחקר", write: "כתיבה", analyze: "ניתוח", design: "עיצוב",
    image: "תמונה", av: "וידאו או אודיו", presentation: "מצגת", build: "בניית אפליקציה",
    automate: "אוטומציה", organize: "ארגון"
  };

  /* ---------- הרכבת תוצאה ---------- */
  function buildResult(answers) {
    var ranked = ROUTES.map(function (r) { return { r: r, s: scoreRoute(r, answers) }; })
      .sort(function (a, b) { return b.s - a.s; });
    var best = ranked[0];
    var route = best && best.s >= 6 ? best.r : genericRoute(answers);

    var steps = route.steps.map(function (st) {
      if (st.role === "human") {
        return { def: st, tool: null, alt: null, label: ROLE_LABEL.human };
      }
      var pick = pickToolForRole(st.role, answers);
      return { def: st, tool: pick.tool, alt: pick.alt, label: ROLE_LABEL[st.role] || st.role };
    });

    // סיכום המשימה
    var summary = "";
    if (answers.taskText) summary = "״" + answers.taskText.trim() + "״ — ";
    summary += (answers.tasks || []).map(function (t) { return TASK_LABEL[t] || t; }).join(" + ");
    if (answers.material) summary += " · מתוך " + (MATERIAL_LABEL[answers.material] || "");
    if (answers.output) summary += " · אל " + (OUTPUT_LABEL[answers.output] || "");
    if ((answers.priorities || []).length) {
      summary += " · בדגש על " + answers.priorities.map(function (p) { return PRIORITY_LABEL[p]; }).join(" ו");
    }

    var recommendedAlt = null;
    if (answers.time === "10min") recommendedAlt = "fast";
    else if ((answers.priorities || []).indexOf("price") !== -1) recommendedAlt = "budget";
    else if ((answers.priorities || []).indexOf("accuracy") !== -1 || (answers.priorities || []).indexOf("sources") !== -1) recommendedAlt = "pro";

    return {
      routeName: route.name,
      summary: summary,
      input: route.input,
      output: route.output,
      steps: steps,
      alternatives: route.alternatives,
      recommendedAlt: recommendedAlt,
      warnings: buildWarnings(route, answers, steps),
      prompt: buildPrompt(route, answers)
    };
  }

  window.NaviEngine = {
    buildResult: buildResult,
    scoreTool: scoreTool,
    labels: {
      role: ROLE_LABEL, material: MATERIAL_LABEL, output: OUTPUT_LABEL,
      priority: PRIORITY_LABEL, task: TASK_LABEL
    },
    familyOf: familyOf
  };
})();
