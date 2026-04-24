/* ============================================================
   חשבון השנה — quiz state machine
   5 מסכים: intro → triage → ranking → personalize → receipt
   ============================================================ */

(function () {
  'use strict';

  const API_URL = 'REPLACE_WITH_APPS_SCRIPT_URL';

  const state = {
    sector: null,           // 'education' | 'social'
    selected: new Map(),    // pain_id -> { freq, intensity }
    rankingIndex: 0,        // index of current pain in ranking screen
    personal: { name: '', role: '', orgType: '', email: '' },
    submissionId: null
  };

  // ============================================================
  // DOM helpers
  // ============================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function show(screenId) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const screen = $('#' + screenId);
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  // Screen 1 — Intro / sector pick
  // ============================================================
  function initIntro() {
    $('#btn-edu').addEventListener('click', () => pickSector('education'));
    $('#btn-social').addEventListener('click', () => pickSector('social'));
  }

  function pickSector(sector) {
    state.sector = sector;
    state.selected.clear();
    renderTriage();
    show('screen-triage');
  }

  // ============================================================
  // Screen 2 — Triage
  // ============================================================
  function renderTriage() {
    const bank = PAINS[state.sector];
    const root = $('#triage-content');
    root.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'step-header';
    header.innerHTML = `
      <div class="step">שלב 1 מתוך 3</div>
      <h2>איפה כאב לך השנה?</h2>
      <p>סמן/י את הכאבים שנכחו. לא צריך לחשוב — הרגש.</p>
    `;
    root.appendChild(header);

    bank.categories.forEach(cat => {
      const catEl = document.createElement('div');
      catEl.className = 'category';
      catEl.innerHTML = `<div class="category-label">· ${cat.label}</div>`;
      cat.items.forEach(pain => {
        const card = document.createElement('div');
        card.className = 'pain-card';
        card.dataset.painId = pain.id;
        card.innerHTML = `
          <div class="checkbox"></div>
          <div class="pain-content">
            <div class="pain-title">${pain.title}</div>
            <div class="pain-hint">${pain.hint}</div>
          </div>
        `;
        card.addEventListener('click', () => togglePain(pain.id, card));
        catEl.appendChild(card);
      });
      root.appendChild(catEl);
    });

    updateTriageCta();
  }

  function togglePain(painId, cardEl) {
    if (state.selected.has(painId)) {
      state.selected.delete(painId);
      cardEl.classList.remove('selected');
    } else {
      state.selected.set(painId, { freq: 3, intensity: 3 });
      cardEl.classList.add('selected');
    }
    updateTriageCta();
  }

  function updateTriageCta() {
    const count = state.selected.size;
    const btn = $('#btn-triage-next');
    const counter = $('#triage-counter');
    btn.disabled = count === 0;
    if (count === 0) counter.textContent = 'בחר/י כאב אחד או יותר';
    else if (count === 1) counter.textContent = 'כאב אחד נבחר';
    else counter.textContent = `${count} כאבים נבחרו`;
  }

  function initTriage() {
    $('#btn-triage-back').addEventListener('click', () => show('screen-intro'));
    $('#btn-triage-next').addEventListener('click', () => {
      if (state.selected.size === 0) return;
      state.rankingIndex = 0;
      renderRanking();
      show('screen-ranking');
    });
  }

  // ============================================================
  // Screen 3 — Ranking (sliders per pain)
  // ============================================================
  function findPain(painId) {
    const bank = PAINS[state.sector];
    for (const cat of bank.categories) {
      for (const item of cat.items) {
        if (item.id === painId) return item;
      }
    }
    return null;
  }

  function renderRanking() {
    const ids = Array.from(state.selected.keys());
    const total = ids.length;
    const i = state.rankingIndex;
    const painId = ids[i];
    const pain = findPain(painId);
    const scores = state.selected.get(painId);

    $('#rank-progress').style.width = (((i) / total) * 100) + '%';
    $('#rank-progress-text').textContent = `שלב 2 · ${i + 1} מתוך ${total}`;

    const root = $('#rank-content');
    root.innerHTML = `
      <div class="rank-card">
        <div class="rank-title">${pain.title}</div>
        <div class="rank-hint">${pain.hint}</div>

        <div class="slider-group">
          <div class="slider-label">
            <span class="lbl">כמה פעמים זה קרה השנה?</span>
            <span class="val" id="freq-val">${scores.freq}</span>
          </div>
          <input type="range" id="freq" min="1" max="5" step="1" value="${scores.freq}">
          <div class="slider-range">
            <span>נדיר</span><span>יומיומי</span>
          </div>
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span class="lbl">כמה זה ניקז אותך?</span>
            <span class="val" id="int-val">${scores.intensity}</span>
          </div>
          <input type="range" id="intensity" min="1" max="5" step="1" value="${scores.intensity}">
          <div class="slider-range">
            <span>קל</span><span>מתיש</span>
          </div>
        </div>
      </div>
    `;

    $('#freq').addEventListener('input', e => {
      const v = parseInt(e.target.value);
      scores.freq = v;
      $('#freq-val').textContent = v;
    });
    $('#intensity').addEventListener('input', e => {
      const v = parseInt(e.target.value);
      scores.intensity = v;
      $('#int-val').textContent = v;
    });

    const nextBtn = $('#btn-rank-next');
    nextBtn.textContent = (i + 1 === total) ? 'לסיכום →' : 'הבא →';
  }

  function initRanking() {
    $('#btn-rank-back').addEventListener('click', () => {
      if (state.rankingIndex === 0) {
        show('screen-triage');
      } else {
        state.rankingIndex--;
        renderRanking();
      }
    });
    $('#btn-rank-next').addEventListener('click', () => {
      const ids = Array.from(state.selected.keys());
      if (state.rankingIndex + 1 < ids.length) {
        state.rankingIndex++;
        renderRanking();
      } else {
        show('screen-personalize');
      }
    });
  }

  // ============================================================
  // Screen 4 — Personalize (all optional)
  // ============================================================
  function initPersonalize() {
    $('#btn-pers-back').addEventListener('click', () => {
      const ids = Array.from(state.selected.keys());
      state.rankingIndex = ids.length - 1;
      renderRanking();
      show('screen-ranking');
    });
    $('#btn-pers-next').addEventListener('click', async () => {
      state.personal.name = $('#pers-name').value.trim();
      state.personal.role = $('#pers-role').value.trim();
      state.personal.orgType = $('#pers-orgtype').value.trim();
      state.personal.email = $('#pers-email').value.trim();
      await finishAndRender();
    });
  }

  // ============================================================
  // Finish — compute severity, render receipt, submit in background
  // ============================================================
  async function finishAndRender() {
    state.submissionId = 'cheshbon-' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 7);

    const ids = Array.from(state.selected.keys());
    const items = ids.map(id => {
      const pain = findPain(id);
      const { freq, intensity } = state.selected.get(id);
      return {
        id, title: pain.title, hint: pain.hint,
        freq, intensity, severity: freq * intensity
      };
    }).sort((a, b) => b.severity - a.severity);

    window.__receiptItems = items;
    window.__receiptState = state;

    renderReceipt(items);
    show('screen-receipt');

    // fire-and-forget submit
    submitToSheet(items).catch(err => console.warn('submit failed', err));
  }

  async function submitToSheet(items) {
    if (!API_URL || API_URL.indexOf('REPLACE_WITH') === 0) {
      console.log('[cheshbon] apps script URL not configured — skipping submit', items);
      return;
    }
    const statusEl = $('#submit-status');
    if (statusEl) {
      statusEl.innerHTML = '<span class="spinner"></span> שולח...';
      statusEl.className = 'status';
    }

    const total = items.reduce((s, x) => s + x.severity, 0);
    const payload = {
      action: 'saveCheshbon',
      data: {
        submissionId: state.submissionId,
        sector: state.sector,
        personal: state.personal,
        items: items.map(x => ({ id: x.id, freq: x.freq, intensity: x.intensity, severity: x.severity })),
        topPain: { id: items[0].id, title: items[0].title, severity: items[0].severity },
        totalSeverity: total,
        userAgent: navigator.userAgent
      }
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (statusEl) {
        statusEl.textContent = 'נשמר · תודה שחלקת/ה';
        statusEl.className = 'status ok';
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = 'השמירה נכשלה — המידע אצלך בקבלה';
        statusEl.className = 'status err';
      }
    }
  }

  // ============================================================
  // Boot
  // ============================================================
  function boot() {
    initIntro();
    initTriage();
    initRanking();
    initPersonalize();
    if (typeof initReceipt === 'function') initReceipt();
    show('screen-intro');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
