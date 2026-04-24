/* ============================================================
   חשבון השנה — quiz state machine
   5 מסכים: intro → triage → ranking → personalize → receipt
   ============================================================ */

(function () {
  'use strict';

  const API_URL = 'https://script.google.com/macros/s/AKfycbyvQhS_WifYFgneEUHgNcAblkM10dOsa9ca4uTu_wtKsjNBVVuXZeEYLJZgSavf3sqF/exec';
  window.__API_URL = API_URL;

  const state = {
    sector: null,           // 'education' | 'social'
    selected: new Map(),    // pain_id -> { freq, intensity }
    customPains: new Map(), // custom_id -> { title, categoryId }
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
    state.customPains.clear();
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

      // "אחר" — custom pain row per category
      catEl.appendChild(renderOtherRow(cat.id));
      root.appendChild(catEl);
    });

    updateTriageCta();
  }

  function renderOtherRow(categoryId) {
    const existing = Array.from(state.customPains.entries())
      .find(([, v]) => v.categoryId === categoryId);

    const wrap = document.createElement('div');
    wrap.className = 'other-row';
    wrap.dataset.categoryId = categoryId;

    if (existing) {
      // Show as a selected filled card
      const [id, data] = existing;
      const card = document.createElement('div');
      card.className = 'pain-card selected custom';
      card.innerHTML = `
        <div class="checkbox"></div>
        <div class="pain-content">
          <div class="pain-title">${escapeHtml(data.title)}</div>
          <div class="pain-hint">שלי · ניתן לערוך או להסיר</div>
        </div>
        <button class="pain-remove" aria-label="הסר" type="button">×</button>
      `;
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.pain-remove')) return;
        openOtherInput(categoryId, wrap, data.title);
      });
      card.querySelector('.pain-remove').addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.customPains.delete(id);
        state.selected.delete(id);
        wrap.replaceWith(renderOtherRow(categoryId));
        updateTriageCta();
      });
      wrap.appendChild(card);
    } else {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'pain-add-other';
      addBtn.innerHTML = '<span class="plus">+</span> אחר — הוסף/י כאב משלך';
      addBtn.addEventListener('click', () => openOtherInput(categoryId, wrap, ''));
      wrap.appendChild(addBtn);
    }
    return wrap;
  }

  function openOtherInput(categoryId, wrapEl, prefill) {
    const form = document.createElement('div');
    form.className = 'pain-add-form';
    form.innerHTML = `
      <input type="text" class="pain-add-input" maxlength="80"
             placeholder="מה הכאב שלא נמצא ברשימה?"
             value="${escapeHtml(prefill || '')}">
      <div class="pain-add-actions">
        <button class="btn-add-cancel" type="button">ביטול</button>
        <button class="btn-add-save" type="button">שמירה</button>
      </div>
    `;
    wrapEl.replaceChildren(form);
    const input = form.querySelector('.pain-add-input');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const save = () => {
      const val = input.value.trim();
      if (!val) return;
      // Remove old custom pain in this category if exists (edit mode)
      Array.from(state.customPains.entries())
        .filter(([, v]) => v.categoryId === categoryId)
        .forEach(([oldId]) => {
          state.customPains.delete(oldId);
          state.selected.delete(oldId);
        });
      const id = 'custom-' + categoryId + '-' + Date.now().toString(36);
      state.customPains.set(id, { title: val, categoryId });
      state.selected.set(id, { freq: 3, intensity: 3 });
      wrapEl.replaceWith(renderOtherRow(categoryId));
      updateTriageCta();
    };

    form.querySelector('.btn-add-save').addEventListener('click', save);
    form.querySelector('.btn-add-cancel').addEventListener('click', () => {
      wrapEl.replaceWith(renderOtherRow(categoryId));
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { wrapEl.replaceWith(renderOtherRow(categoryId)); }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
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
    if (state.customPains.has(painId)) {
      const c = state.customPains.get(painId);
      return { id: painId, title: c.title, hint: 'כאב שהוספת · ' + categoryLabel(c.categoryId) };
    }
    const bank = PAINS[state.sector];
    for (const cat of bank.categories) {
      for (const item of cat.items) {
        if (item.id === painId) return item;
      }
    }
    return null;
  }

  function categoryLabel(categoryId) {
    const cat = PAINS[state.sector].categories.find(c => c.id === categoryId);
    return cat ? cat.label.split(' — ')[0] : '';
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
      const isCustom = state.customPains.has(id);
      return {
        id, title: pain.title, hint: pain.hint,
        freq, intensity, severity: freq * intensity,
        isCustom,
        customCategoryId: isCustom ? state.customPains.get(id).categoryId : null
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
        items: items.map(x => ({
          id: x.id, freq: x.freq, intensity: x.intensity, severity: x.severity,
          isCustom: !!x.isCustom,
          customTitle: x.isCustom ? x.title : '',
          customCategoryId: x.customCategoryId || ''
        })),
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
