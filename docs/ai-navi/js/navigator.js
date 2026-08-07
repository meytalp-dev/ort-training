/* AI NAVI — הנווט: שאלון בן 7 שלבים + מסך תוצאה */
(function () {
  "use strict";

  var LS = "aiNavi.nav.state";
  var L = window.NaviEngine.labels;
  var FAMILIES = window.NAVI_FAMILIES || [];

  /* ---------- שאלות ---------- */
  var QUESTIONS = [
    {
      id: "tasks", type: "multi", max: 3,
      title: "מה סוג המשימה?",
      hint: "אפשר לבחור יותר מאחת — משימות אמיתיות מתפרקות לכמה סוגים.",
      options: [
        { v: "think", e: "💡", t: "חשיבה ותכנון" }, { v: "research", e: "🔎", t: "מחקר" },
        { v: "write", e: "✍️", t: "כתיבה" }, { v: "analyze", e: "📊", t: "ניתוח" },
        { v: "design", e: "🎨", t: "עיצוב" }, { v: "image", e: "🖼️", t: "תמונה" },
        { v: "av", e: "🎬", t: "וידאו או אודיו" }, { v: "presentation", e: "📽️", t: "מצגת" },
        { v: "build", e: "🧱", t: "בניית אפליקציה" }, { v: "automate", e: "🔁", t: "אוטומציה" }
      ]
    },
    {
      id: "material", type: "single",
      title: "מה חומר הגלם?",
      hint: "מה כבר יש לך ביד? זה משנה את הבחירה יותר מכל דבר אחר.",
      options: [
        { v: "none", e: "🫙", t: "אין לי חומר גלם" }, { v: "idea", e: "💭", t: "רעיון" },
        { v: "short-text", e: "📝", t: "טקסט קצר" }, { v: "doc", e: "📄", t: "מסמך" },
        { v: "multi-docs", e: "🗃️", t: "כמה מסמכים" }, { v: "data", e: "🔢", t: "נתונים" },
        { v: "image", e: "🖼️", t: "תמונה" }, { v: "audio", e: "🎙️", t: "אודיו" },
        { v: "video", e: "🎞️", t: "וידאו" }, { v: "links", e: "🔗", t: "קישורים או אתרים" }
      ]
    },
    {
      id: "output", type: "single",
      title: "מה התוצר?",
      hint: "מה מחזיקים ביד בסוף? איך נראית הצלחה?",
      options: [
        { v: "answer", e: "💬", t: "תשובה" }, { v: "doc", e: "📄", t: "מסמך" },
        { v: "presentation", e: "📽️", t: "מצגת" }, { v: "image", e: "🖼️", t: "תמונה" },
        { v: "video", e: "🎬", t: "וידאו" }, { v: "audio", e: "🎧", t: "אודיו" },
        { v: "table", e: "🧮", t: "טבלה" }, { v: "report", e: "📈", t: "דוח" },
        { v: "site", e: "🌐", t: "אתר" }, { v: "app", e: "📱", t: "אפליקציה" },
        { v: "automation", e: "⚙️", t: "תהליך אוטומטי" }
      ]
    },
    {
      id: "priorities", type: "multi", max: 2,
      title: "מה הכי חשוב?",
      hint: "עד שניים. בחירה בכלי היא גם בחירה בפשרה.",
      options: [
        { v: "speed", e: "⚡", t: "מהירות" }, { v: "quality", e: "💎", t: "איכות" },
        { v: "accuracy", e: "🎯", t: "דיוק" }, { v: "sources", e: "📚", t: "מקורות" },
        { v: "design", e: "🎨", t: "עיצוב" }, { v: "ease", e: "🪶", t: "קלות" },
        { v: "price", e: "💰", t: "מחיר" }, { v: "privacy", e: "🔒", t: "פרטיות" },
        { v: "control", e: "🎛️", t: "שליטה" }
      ]
    },
    {
      id: "time", type: "single",
      title: "כמה זמן יש?",
      hint: "הזמן קובע כמה תחנות ייכנסו למסלול.",
      options: [
        { v: "10min", e: "⏱️", t: "עד 10 דקות" }, { v: "hour", e: "🕐", t: "עד שעה" },
        { v: "hours", e: "🕓", t: "כמה שעות" }, { v: "day", e: "📅", t: "יום או יותר" }
      ]
    },
    {
      id: "experience", type: "single",
      title: "מה רמת הניסיון שלך עם כלי AI?",
      hint: "אין תשובה נכונה — יש מסלול מתאים.",
      options: [
        { v: "beginner", e: "🌱", t: "מתחילה" }, { v: "intermediate", e: "🌿", t: "בינונית" },
        { v: "advanced", e: "🌳", t: "מתקדמת" }
      ]
    },
    {
      id: "sensitive", type: "single",
      title: "האם המשימה כוללת מידע רגיש?",
      hint: "פרטים אישיים, מידע על תלמידים או עובדים, נתונים ארגוניים פנימיים.",
      options: [
        { v: "no", e: "✅", t: "לא" }, { v: "maybe", e: "🤔", t: "אולי" },
        { v: "yes", e: "🔒", t: "כן" }, { v: "unsure", e: "❓", t: "לא בטוחה" }
      ]
    }
  ];

  var EXAMPLES = [
    "להפוך מסמך למצגת", "לנתח שאלון", "ליצור סרטון פתיחה", "לבנות פעילות לתלמידים",
    "לסכם כמה מסמכים", "לבנות כלי דיגיטלי", "להפוך דיווח שבועי לאוטומטי", "להכין פוסט עם תמונה"
  ];

  /* ---------- מצב ---------- */
  var state = { taskText: "", answers: {}, qIndex: 0, view: "hero" };
  try {
    var saved = localStorage.getItem(LS);
    if (saved) state = Object.assign(state, JSON.parse(saved));
  } catch (e) {}
  function persist() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  var elHero = document.getElementById("view-hero");
  var elWizard = document.getElementById("view-wizard");
  var elResult = document.getElementById("view-result");

  function show(view) {
    state.view = view;
    elHero.hidden = view !== "hero";
    elWizard.hidden = view !== "wizard";
    elResult.hidden = view !== "result";
    document.body.classList.remove("present-mode");
    persist();
    window.scrollTo(0, 0);
  }

  /* ---------- מסך פתיחה ---------- */
  var taskInput = document.getElementById("task-input");
  taskInput.value = state.taskText || "";
  var exIdx = 0;
  var exEl = document.getElementById("hero-example");
  setInterval(function () {
    exIdx = (exIdx + 1) % EXAMPLES.length;
    exEl.textContent = EXAMPLES[exIdx];
  }, 2600);

  document.getElementById("start-btn").addEventListener("click", function () {
    state.taskText = taskInput.value.trim();
    state.qIndex = 0;
    persist();
    show("wizard");
    renderQuestion();
  });
  taskInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("start-btn").click();
    }
  });

  /* ---------- אשף ---------- */
  var progress = document.getElementById("wizard-progress");
  QUESTIONS.forEach(function () {
    var seg = document.createElement("div");
    seg.className = "wseg";
    seg.innerHTML = '<div class="fill"></div>';
    progress.appendChild(seg);
  });

  var qWrap = document.getElementById("wizard-q");
  var btnNext = document.getElementById("wiz-next");
  var btnBack = document.getElementById("wiz-back");

  function answered(q) {
    var a = state.answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return !!a;
  }

  function renderQuestion() {
    var q = QUESTIONS[state.qIndex];
    Array.prototype.forEach.call(progress.children, function (seg, i) {
      seg.className = "wseg" + (i < state.qIndex ? " done" : i === state.qIndex ? " now" : "");
    });

    var html = '<p class="eyebrow">שאלה ' + (state.qIndex + 1) + " מתוך " + QUESTIONS.length + "</p>";
    html += "<h2>" + q.title + "</h2>";
    html += '<p class="q-hint">' + q.hint + "</p>";
    html += '<div class="answers" role="group" aria-label="' + q.title + '">';
    q.options.forEach(function (o) {
      var sel = q.type === "multi"
        ? (state.answers[q.id] || []).indexOf(o.v) !== -1
        : state.answers[q.id] === o.v;
      html += '<button class="opt-tile" data-color="teal" data-v="' + o.v + '" aria-pressed="' + sel + '">' +
        '<span class="emoji" aria-hidden="true">' + o.e + "</span>" + o.t + "</button>";
    });
    html += "</div>";
    html += '<div id="q-note" role="status" aria-live="polite" style="margin-top:14px;min-height:1.5em"></div>';
    qWrap.innerHTML = html;

    updateSensitiveNote();
    btnBack.textContent = state.qIndex === 0 ? "→ למסך הפתיחה" : "→ חזרה";
    btnNext.textContent = state.qIndex === QUESTIONS.length - 1 ? "🧭 אל המסלול" : "המשך ←";
    updateNextState();
  }

  function updateNextState() {
    btnNext.disabled = !answered(QUESTIONS[state.qIndex]);
    btnNext.style.opacity = btnNext.disabled ? ".45" : "1";
  }

  function updateSensitiveNote() {
    var q = QUESTIONS[state.qIndex];
    var note = document.getElementById("q-note");
    if (!note) return;
    if (q.id === "sensitive" && (state.answers.sensitive === "yes" || state.answers.sensitive === "unsure")) {
      note.innerHTML = '<div class="notice notice--risk"><span class="notice-icon" aria-hidden="true">🔒</span>' +
        "<span><b>חשוב:</b> מידע רגיש לא מעלים לכלי ציבורי. במסלול שתקבלי יופיעו אזהרות מתאימות — ותמיד פועלים לפי מדיניות הארגון שלך.</span></div>";
    } else if (q.type === "multi" && q.max) {
      var n = (state.answers[q.id] || []).length;
      note.textContent = n >= q.max ? "נבחר המקסימום (" + q.max + ") — כדי לבחור אחר, בטלי בחירה קודמת." : "";
    } else {
      note.textContent = "";
    }
  }

  qWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".opt-tile");
    if (!btn) return;
    var q = QUESTIONS[state.qIndex];
    var v = btn.getAttribute("data-v");
    if (q.type === "multi") {
      var arr = state.answers[q.id] || [];
      var i = arr.indexOf(v);
      if (i !== -1) arr.splice(i, 1);
      else {
        if (q.max && arr.length >= q.max) { updateSensitiveNote(); return; }
        arr.push(v);
      }
      state.answers[q.id] = arr;
      btn.setAttribute("aria-pressed", String(i === -1));
    } else {
      state.answers[q.id] = v;
      Array.prototype.forEach.call(qWrap.querySelectorAll(".opt-tile"), function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
    }
    persist();
    updateSensitiveNote();
    updateNextState();
  });

  btnNext.addEventListener("click", function () {
    if (!answered(QUESTIONS[state.qIndex])) return;
    if (state.qIndex === QUESTIONS.length - 1) {
      renderResult();
      show("result");
    } else {
      state.qIndex++;
      persist();
      renderQuestion();
    }
  });
  btnBack.addEventListener("click", function () {
    if (state.qIndex === 0) { show("hero"); return; }
    state.qIndex--;
    persist();
    renderQuestion();
  });

  /* ---------- תוצאה ---------- */
  function toolPill(tool) {
    if (!tool) return "";
    var fam = window.NaviEngine.familyOf(tool.family);
    var color = fam ? fam.colorKey : "teal";
    return '<span class="tool-pill" data-color="' + color + '">🚉 ' + tool.name + "</span>";
  }

  function renderResult() {
    var a = {
      taskText: state.taskText,
      tasks: state.answers.tasks || [],
      material: state.answers.material,
      output: state.answers.output,
      priorities: state.answers.priorities || [],
      time: state.answers.time,
      experience: state.answers.experience,
      sensitive: state.answers.sensitive
    };
    var r = window.NaviEngine.buildResult(a);

    var html = '<div class="result-head"><p class="eyebrow" style="justify-content:center">' + r.routeName + "</p>" +
      "<h1>המסלול המומלץ עבורך</h1>" +
      '<div class="result-summary">' + r.summary + "</div></div>";

    /* המסלול */
    html += '<div class="result-section"><h2>תרשים המסלול</h2><div class="result-route">';
    r.steps.forEach(function (st, i) {
      var human = !st.tool;
      html += '<div class="result-stop"><div class="rail"><span class="station" style="border-color:' +
        (human ? "var(--mustard)" : "var(--teal)") + '"></span><span class="pipe"></span></div>';
      html += '<div class="stop-card card' + (human ? " human-stop" : "") + '">';
      html += '<div class="stop-top"><span class="role">' + (i + 1) + " · " + (st.def.title || st.label) + "</span>";
      html += human ? '<span class="tool-pill">👁️ את/ה — בלי כלי</span>' : toolPill(st.tool);
      html += "</div>";
      if (st.tool) {
        var strengths = st.tool.strengths || [];
        var strength = strengths[i % Math.max(1, strengths.length)] || strengths[0] || "";
        html += '<p class="why"><b>למה הכלי הזה:</b> ' + st.tool.recommendedRole +
          (strength ? " — " + strength : "") + "</p>";
      }
      html += '<div class="io">';
      if (st.def.ai) html += "<div><b>מה ה-AI עושה</b>" + st.def.ai + "</div>";
      if (st.def.human) html += "<div><b>מה האדם עושה</b>" + st.def.human + "</div>";
      html += "</div>";
      if (st.def.check) html += '<p class="check">🔎 מה לבדוק: ' + st.def.check + "</p>";
      if (st.alt) html += '<p style="margin-top:8px;font-size:.88rem;color:var(--muted)">חלופה טובה אם ' + st.tool.name + " לא זמין: <b>" + st.alt.name + "</b></p>";
      html += "</div></div>";
    });
    html += "</div></div>";

    /* חלופות */
    var ALT_META = { fast: ["⚡", "מסלול מהיר", "teal"], pro: ["💎", "מסלול מקצועי", "lavender"], budget: ["💰", "מסלול חסכוני", "sage"] };
    html += '<div class="result-section"><h2>שלוש דרכים לאותו יעד</h2><div class="alt-grid">';
    ["fast", "pro", "budget"].forEach(function (k) {
      var meta = ALT_META[k];
      var rec = r.recommendedAlt === k;
      html += '<div class="alt-card card" data-color="' + meta[2] + '"' + (rec ? ' style="outline:3px solid var(--c)"' : "") + ">";
      html += "<h3><span aria-hidden='true'>" + meta[0] + "</span>" + meta[1] +
        (rec ? ' <span class="chip" style="font-size:.72rem">מומלץ לך</span>' : "") + "</h3>";
      html += "<p>" + (r.alternatives[k] || "") + "</p></div>";
    });
    html += "</div></div>";

    /* אזהרות */
    html += '<div class="result-section"><h2>לפני שיוצאים לדרך</h2><div style="display:grid;gap:10px">';
    r.warnings.forEach(function (w) {
      var cls = w.level === "risk" ? " notice--risk" : w.level === "info" ? " notice--info" : "";
      var icon = w.level === "risk" ? "🔒" : w.level === "info" ? "ℹ️" : "⚠️";
      html += '<div class="notice' + cls + '"><span class="notice-icon" aria-hidden="true">' + icon + "</span><span>" + w.text + "</span></div>";
    });
    html += "</div></div>";

    /* פרומפט */
    html += '<div class="result-section"><h2>פרומפט פתיחה — מוכן להעתקה</h2>' +
      '<div class="prompt-box"><button class="copy-btn" id="copy-prompt">📋 העתקה</button>' +
      '<div id="prompt-text">' + r.prompt.replace(/\n/g, "<br>") + "</div></div></div>";

    /* פעולות */
    html += '<div class="result-actions">' +
      '<button class="btn btn--primary" id="act-new">🧭 ניווט חדש</button>' +
      '<button class="btn btn--ghost" id="act-edit">שינוי תשובות</button>' +
      '<button class="btn btn--ghost" id="act-print">🖨️ הדפסה / PDF</button>' +
      '<button class="btn btn--ghost" id="act-present">📽️ מצב הקרנה</button>' +
      "</div>";

    elResult.innerHTML = html;
    elResult.dataset.rawPrompt = r.prompt;

    document.getElementById("copy-prompt").addEventListener("click", copyPrompt);
    document.getElementById("act-new").addEventListener("click", function () {
      state = { taskText: "", answers: {}, qIndex: 0, view: "hero" };
      persist();
      taskInput.value = "";
      show("hero");
    });
    document.getElementById("act-edit").addEventListener("click", function () {
      state.qIndex = 0;
      persist();
      show("wizard");
      renderQuestion();
    });
    document.getElementById("act-print").addEventListener("click", function () { window.print(); });
    document.getElementById("act-present").addEventListener("click", function () {
      document.body.classList.toggle("present-mode");
    });
  }

  function copyPrompt() {
    var text = elResult.dataset.rawPrompt || "";
    var btn = document.getElementById("copy-prompt");
    function done() {
      btn.textContent = "✅ הועתק!";
      setTimeout(function () { btn.textContent = "📋 העתקה"; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- איפוס מלא ---------- */
  document.getElementById("reset-all").addEventListener("click", function () {
    if (!confirm("לאפס את כל התשובות ולהתחיל מחדש?")) return;
    try { localStorage.removeItem(LS); } catch (e) {}
    state = { taskText: "", answers: {}, qIndex: 0, view: "hero" };
    taskInput.value = "";
    show("hero");
  });

  /* ---------- אתחול ---------- */
  // ?demo=1 — תרחיש מוכן להדגמה חיה: מסמך → מצגת
  if (new URLSearchParams(location.search).get("demo") === "1") {
    state = {
      taskText: "להפוך מסמך של 40 עמודים למצגת קצרה לצוות מורים",
      answers: {
        tasks: ["write", "design", "presentation"], material: "doc", output: "presentation",
        priorities: ["accuracy", "design"], time: "hour", experience: "intermediate", sensitive: "no"
      },
      qIndex: QUESTIONS.length - 1, view: "result"
    };
    persist();
  }
  if (state.view === "wizard") { show("wizard"); renderQuestion(); }
  else if (state.view === "result" && state.answers.sensitive) { renderResult(); show("result"); }
  else show("hero");
})();
