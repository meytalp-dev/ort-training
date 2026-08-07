/* AI NAVI — מנוע המצגת */
(function () {
  "use strict";

  var ORDER = window.NAVI_SLIDE_ORDER || [];
  var META = window.NAVI_SLIDES || {};
  var SECTIONS = window.NAVI_SECTIONS || [];
  var LS = "aiNavi.deck.";

  var slides = ORDER.map(function (id) {
    return document.querySelector('[data-slide="' + id + '"]');
  }).filter(Boolean);

  var current = 0;
  var startedAt = null;
  var timerInterval = null;

  /* ---------- עזרים ---------- */
  function store(key, val) { try { localStorage.setItem(LS + key, JSON.stringify(val)); } catch (e) {} }
  function load(key, fallback) {
    try {
      var v = localStorage.getItem(LS + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function sectionOf(id) {
    var m = META[id] || {};
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === m.section) return SECTIONS[i];
    return SECTIONS[0] || { name: "", colorKey: "teal" };
  }

  /* ---------- פס התקדמות מפולח ---------- */
  var rail = document.getElementById("progress-rail");
  var segFills = {};
  SECTIONS.forEach(function (sec) {
    var seg = document.createElement("div");
    seg.className = "progress-seg";
    seg.setAttribute("data-color", sec.colorKey);
    var fill = document.createElement("div");
    fill.className = "fill";
    seg.appendChild(fill);
    rail.appendChild(seg);
    segFills[sec.id] = fill;
  });
  function updateProgress() {
    SECTIONS.forEach(function (sec) {
      var idxs = [];
      ORDER.forEach(function (id, i) { if ((META[id] || {}).section === sec.id) idxs.push(i); });
      if (!idxs.length) return;
      var done = idxs.filter(function (i) { return i < current; }).length;
      var partial = idxs.indexOf(current) !== -1 ? 0.6 : 0;
      segFills[sec.id].style.transform = "scaleX(" + Math.min(1, (done + partial) / idxs.length) + ")";
    });
  }

  /* ---------- ניווט ---------- */
  var hudCount = document.getElementById("hud-count");
  var hudSection = document.getElementById("hud-section");
  var hudSectionName = document.getElementById("hud-section-name");

  function revealables(slide) {
    return Array.prototype.slice.call(slide.querySelectorAll("[data-reveal]"))
      .sort(function (a, b) { return (+a.getAttribute("data-reveal")) - (+b.getAttribute("data-reveal")); });
  }
  function nextHidden(slide) {
    return revealables(slide).filter(function (el) { return !el.classList.contains("revealed"); })[0] || null;
  }

  function goTo(i, showAllReveals) {
    if (i < 0 || i >= slides.length) return;
    slides.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
    var wasBack = i < current;
    current = i;
    var id = ORDER[i];
    var sec = sectionOf(id);

    // בחזרה אחורה — הכול חשוף; קדימה — מתחילים נקי (אלא אם כבר נחשף)
    if (wasBack || showAllReveals) {
      revealables(slides[i]).forEach(function (el) { el.classList.add("revealed"); applyRevealHooks(el); });
    }

    hudCount.textContent = (i + 1) + " / " + slides.length;
    hudSectionName.textContent = sec.name;
    hudSection.setAttribute("data-color", sec.colorKey);
    document.title = "AI NAVI · " + ((META[id] || {}).title || "");

    location.hash = id;
    store("pos", i);
    updateProgress();
    renderNotes();
    renderJumpCurrent();
    if (!startedAt && i > 0) startTimer();
  }

  function advance() {
    var el = nextHidden(slides[current]);
    if (el) { el.classList.add("revealed"); applyRevealHooks(el); return; }
    goTo(current + 1);
  }
  function back() {
    goTo(current - 1);
  }

  /* חשיפות עם תופעות לוואי */
  function applyRevealHooks(el) {
    var slideId = ORDER[current];
    if (slideId === "flood") {
      var wall = document.getElementById("flood-wall");
      if (wall) wall.classList.add("cleared");
    }
  }

  /* חשיפת תשובה (A) */
  function revealAnswer() {
    var slide = slides[current];
    var ans = slide.querySelector("[data-answer]");
    if (!ans) { advance(); return; }
    ans.hidden = false;
    var poll = slide.querySelector("[data-poll]");
    if (poll) {
      var correct = poll.getAttribute("data-correct");
      if (correct) {
        var btn = poll.querySelector('[data-opt="' + correct + '"]');
        if (btn) btn.classList.add("correct");
      }
    }
  }

  /* ---------- הצבעות ---------- */
  function pollVotes(pollId) { return load("poll." + pollId, {}); }
  function renderPoll(pollEl) {
    var pollId = pollEl.getAttribute("data-poll");
    var votes = pollVotes(pollId);
    var max = 1;
    Object.keys(votes).forEach(function (k) { max = Math.max(max, votes[k]); });
    Array.prototype.forEach.call(pollEl.querySelectorAll(".poll-opt"), function (btn) {
      var opt = btn.getAttribute("data-opt");
      var n = votes[opt] || 0;
      btn.querySelector(".count").textContent = n;
      btn.querySelector(".bar").style.transform = "scaleX(" + (n ? n / max : 0) + ")";
    });
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".poll-opt");
    if (!btn) return;
    var pollEl = btn.closest("[data-poll]");
    var pollId = pollEl.getAttribute("data-poll");
    var votes = pollVotes(pollId);
    var opt = btn.getAttribute("data-opt");
    votes[opt] = (votes[opt] || 0) + 1;
    store("poll." + pollId, votes);
    btn.classList.add("chosen");
    renderPoll(pollEl);
  });
  function resetPolls(scope) {
    var polls = scope ? scope.querySelectorAll("[data-poll]") : document.querySelectorAll("[data-poll]");
    Array.prototype.forEach.call(polls, function (pollEl) {
      store("poll." + pollEl.getAttribute("data-poll"), {});
      renderPoll(pollEl);
      Array.prototype.forEach.call(pollEl.querySelectorAll(".poll-opt"), function (b) {
        b.classList.remove("chosen", "correct");
      });
      var slide = pollEl.closest(".slide");
      var ans = slide && slide.querySelector("[data-answer]");
      if (ans) ans.hidden = true;
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-poll]"), renderPoll);

  /* ---------- בחרו רק שניים ---------- */
  var pickWrap = document.getElementById("pick-two");
  if (pickWrap) {
    var note = document.getElementById("pick-two-note");
    pickWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".opt-tile");
      if (!btn) return;
      var pressed = btn.getAttribute("aria-pressed") === "true";
      var count = pickWrap.querySelectorAll('[aria-pressed="true"]').length;
      if (!pressed && count >= 2) {
        note.textContent = "רק שניים! כדי לבחור את זה — צריך לוותר על משהו.";
        note.className = "pick-two-note over";
        return;
      }
      btn.setAttribute("aria-pressed", String(!pressed));
      count = pickWrap.querySelectorAll('[aria-pressed="true"]').length;
      if (count === 2) {
        var picked = Array.prototype.map.call(pickWrap.querySelectorAll('[aria-pressed="true"]'), function (b) {
          return b.textContent.trim();
        }).join(" + ");
        note.textContent = "הבחירה: " + picked + " — ועל כל השאר ויתרתם. זו השיטה.";
        note.className = "pick-two-note done";
      } else {
        note.textContent = count === 1 ? "עוד אחד…" : "";
        note.className = "pick-two-note";
      }
    });
  }

  /* ---------- אתגר התקציב ---------- */
  var budgetCards = document.getElementById("budget-cards");
  if (budgetCards) {
    var BUDGET = 10;
    var fill = document.getElementById("budget-fill");
    var used = document.getElementById("budget-used");
    var meter = document.getElementById("budget-meter");
    var msg = document.getElementById("budget-msg");
    budgetCards.addEventListener("click", function (e) {
      var card = e.target.closest(".budget-card");
      if (!card) return;
      card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
      var total = 0, hasHuman = false, any = false;
      Array.prototype.forEach.call(budgetCards.querySelectorAll('[aria-pressed="true"]'), function (c) {
        total += +c.getAttribute("data-cost");
        any = true;
        if (c.getAttribute("data-role") === "human") hasHuman = true;
      });
      used.textContent = total;
      fill.style.width = Math.min(100, (total / BUDGET) * 100) + "%";
      meter.classList.toggle("over", total > BUDGET);
      if (total > BUDGET) {
        msg.textContent = "❌ חריגה מהתקציב (" + total + "/10) — צריך לוותר על משהו. בדיוק כמו בעבודה.";
        msg.style.color = "var(--risk)";
      } else if (any && !hasHuman) {
        msg.textContent = "⚠️ אין במסלול בודק אנושי — מי בודק את התוצר לפני שהוא מגיע להנהלה?";
        msg.style.color = "var(--warn)";
      } else if (any) {
        msg.textContent = "✅ מסלול עם עין אנושית, בתוך התקציב (" + total + "/10). נסו עכשיו הרכב אחר.";
        msg.style.color = "var(--ok)";
      } else {
        msg.textContent = "";
      }
    });
  }

  /* ---------- מפת המשפחות ---------- */
  var board = document.getElementById("family-board");
  var detail = document.getElementById("family-detail");
  if (board && window.NAVI_FAMILIES) {
    window.NAVI_FAMILIES.forEach(function (f) {
      var btn = document.createElement("button");
      btn.className = "family-line";
      btn.setAttribute("data-color", f.colorKey);
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML =
        '<span class="line-badge" aria-hidden="true">' + f.line + "</span>" +
        '<span><span class="name">' + f.name + '</span><br><span class="tag">' + f.tagline + "</span></span>";
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        Array.prototype.forEach.call(board.querySelectorAll(".family-line"), function (b) {
          b.setAttribute("aria-expanded", "false");
        });
        if (open) { detail.hidden = true; return; }
        btn.setAttribute("aria-expanded", "true");
        detail.hidden = false;
        detail.setAttribute("data-color", f.colorKey);
        detail.innerHTML =
          "<h3><span class='line-badge' style='background:var(--c)' aria-hidden='true'>" + f.line + "</span>" + f.name + "</h3>" +
          "<div class='uses'>" + f.uses.map(function (u) { return "<span class='chip'>" + u + "</span>"; }).join("") + "</div>" +
          "<div class='fit'>" +
          "<div class='verdict-card plus'><b>מתאימה במיוחד</b>" + f.goodWhen + "</div>" +
          "<div class='verdict-card minus'><b>פחות מתאימה</b>" + f.lessWhen + "</div>" +
          "</div>";
        detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      board.appendChild(btn);
    });
  }

  /* ---------- מגירת מנחה ---------- */
  var drawer = document.getElementById("notes-drawer");
  function renderNotes() {
    var id = ORDER[current];
    var m = META[id] || {};
    var sec = sectionOf(id);
    document.getElementById("notes-sec").textContent = sec.name;
    document.getElementById("notes-head").setAttribute("data-color", sec.colorKey);
    document.getElementById("notes-title").textContent = (current + 1) + " · " + (m.title || "");
    document.getElementById("notes-duration").textContent = m.duration ? m.duration + " דק׳" : "—";
    document.getElementById("notes-interaction").textContent = m.interaction ? "🎮 " + m.interaction : "";
    var list = document.getElementById("notes-list");
    list.innerHTML = (m.notes || []).map(function (n) { return "<li>" + n + "</li>"; }).join("");
    document.getElementById("notes-list").parentElement.setAttribute("data-color", sec.colorKey);
    var nextId = ORDER[current + 1];
    document.getElementById("notes-next").innerHTML = nextId
      ? "הבאה: <b>" + ((META[nextId] || {}).title || nextId) + "</b>"
      : "זו השקופית האחרונה 🎉";
  }
  function toggleDrawer() { drawer.classList.toggle("open"); }
  document.getElementById("notes-close").addEventListener("click", toggleDrawer);

  function startTimer() {
    startedAt = Date.now();
    timerInterval = setInterval(function () {
      var s = Math.floor((Date.now() - startedAt) / 1000);
      var mm = String(Math.floor(s / 60)).padStart(2, "0");
      var ss = String(s % 60).padStart(2, "0");
      document.getElementById("notes-timer").textContent = mm + ":" + ss;
    }, 1000);
  }

  /* ---------- רשת קפיצה ---------- */
  var jumpGrid = document.getElementById("jump-grid");
  var jumpList = document.getElementById("jump-list");
  ORDER.forEach(function (id, i) {
    var m = META[id] || {};
    var sec = sectionOf(id);
    var btn = document.createElement("button");
    btn.className = "jump-item";
    btn.setAttribute("data-color", sec.colorKey);
    btn.innerHTML = '<span class="n">' + (i + 1) + "</span><span>" + (m.title || id) + "</span>" +
      (m.interaction ? '<span class="game-tag">אינטראקציה</span>' : "");
    btn.addEventListener("click", function () {
      jumpGrid.classList.remove("open");
      goTo(i);
    });
    jumpList.appendChild(btn);
  });
  function renderJumpCurrent() {
    Array.prototype.forEach.call(jumpList.children, function (el, i) {
      el.classList.toggle("current", i === current);
    });
  }

  /* ---------- קישור הכלי ---------- */
  var urlEl = document.getElementById("tool-url");
  if (urlEl) {
    var href = new URL("navigator.html", location.href).href;
    if (location.protocol !== "file:") urlEl.textContent = href;
  }

  /* ---------- מקלדת ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    var k = e.key;
    if (k === "ArrowLeft" || k === " " || k === "PageDown" || k === "Enter") {
      if (k === " " || k === "Enter") { if (e.target.closest("button, a")) return; }
      e.preventDefault(); advance();
    } else if (k === "ArrowRight" || k === "PageUp") {
      e.preventDefault(); back();
    } else if (k === "Home") { e.preventDefault(); goTo(0);
    } else if (k === "End") { e.preventDefault(); goTo(slides.length - 1);
    } else if (k === "f" || k === "F" || k === "כ") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(function () {});
    } else if (k === "n" || k === "N" || k === "מ") { toggleDrawer();
    } else if (k === "g" || k === "G" || k === "ע") { jumpGrid.classList.toggle("open");
    } else if (k === "a" || k === "A" || k === "ש") { revealAnswer();
    } else if (k === "d" || k === "D" || k === "ג") {
      var demoLink = document.getElementById("open-navigator");
      window.open("navigator.html", "_blank");
    } else if ((k === "r" || k === "R" || k === "ר") && e.shiftKey) {
      resetPolls(null);
    } else if (k === "r" || k === "R" || k === "ר") {
      resetPolls(slides[current]);
    } else if (k === "Escape") {
      jumpGrid.classList.remove("open");
      drawer.classList.remove("open");
    }
  });

  /* לחיצה על שקופית = התקדמות (רק ברקע, לא על כפתורים) */
  document.getElementById("deck").addEventListener("click", function (e) {
    if (e.target.closest("button, a, input, textarea, .poll, .budget-cards, .family-board, .family-detail, #pick-two")) return;
    advance();
  });

  /* ---------- אתחול ---------- */
  var startAt = 0;
  var hash = location.hash.replace("#", "");
  if (hash && ORDER.indexOf(hash) !== -1) startAt = ORDER.indexOf(hash);
  else {
    var saved = load("pos", 0);
    if (typeof saved === "number" && saved > 0 && saved < slides.length) startAt = saved;
  }
  goTo(startAt, startAt > 0);
})();
