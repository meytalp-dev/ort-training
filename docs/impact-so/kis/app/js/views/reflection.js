// reflection.js — Kakeibo שבועי: 4 שאלות + פסקה + היסטוריה

import { Store, thisWeekReflection } from '../storage.js';
import { t } from '../i18n.js';
import { toast, fmtDate } from '../ui.js';

export function renderReflection(root, navigate) {
  const data = Store.get();
  const existing = thisWeekReflection();

  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('reflection.title')}</div>
      <p class="muted" style="margin-top: var(--s-1); font-size: var(--fs-small);">${t('reflection.subtitle')}</p>
    </div>

    ${existing ? `
      <div class="card mb-4" style="background: rgba(132, 204, 22, 0.1); border-color: var(--success);">
        <p style="font-weight: var(--fw-bold); color: var(--success);">✓ כבר עשית את זה השבוע</p>
        <p class="muted" style="font-size: var(--fs-small); margin-top: var(--s-1);">אפשר לעדכן או פשוט לקרוא את ההיסטוריה למטה.</p>
      </div>
    ` : ''}

    <div class="kakeibo-question">
      <label class="kakeibo-q-label" for="rq1">${t('reflection.q1')}</label>
      <p class="kakeibo-q-help">${t('reflection.q1_help')}</p>
      <input id="rq1" class="kakeibo-q-input" type="number" inputmode="numeric" placeholder="₪" value="${existing?.q1 || ''}">
    </div>

    <div class="kakeibo-question">
      <label class="kakeibo-q-label" for="rq2">${t('reflection.q2')}</label>
      <p class="kakeibo-q-help">${t('reflection.q2_help')}</p>
      <input id="rq2" class="kakeibo-q-input" type="number" inputmode="numeric" placeholder="₪" value="${existing?.q2 || ''}">
    </div>

    <div class="kakeibo-question">
      <label class="kakeibo-q-label" for="rq3">${t('reflection.q3')}</label>
      <p class="kakeibo-q-help">${t('reflection.q3_help')}</p>
      <input id="rq3" class="kakeibo-q-input" type="number" inputmode="numeric" placeholder="₪" value="${existing?.q3 || ''}">
    </div>

    <div class="kakeibo-question">
      <label class="kakeibo-q-label" for="rq4">${t('reflection.q4')}</label>
      <p class="kakeibo-q-help">${t('reflection.q4_help')}</p>
      <textarea id="rq4" class="kakeibo-q-input" style="text-align: right; min-height: 80px; font-size: 15px;" placeholder="צעד אחד קטן">${existing?.q4 || ''}</textarea>
    </div>

    <div class="field">
      <label for="r-free">${t('reflection.free_text_label')}</label>
      <textarea id="r-free" placeholder="${t('reflection.free_text_placeholder')}" style="min-height: 140px;">${existing?.free_text || ''}</textarea>
    </div>

    <button id="save-reflection" class="btn btn-primary btn-lg btn-block">${t('reflection.save_btn')}</button>

    <h2 class="section-title" style="margin-top: var(--s-8);">${t('reflection.history_title')}</h2>
    <div id="history">
      ${data.reflections.length === 0
        ? `<div class="empty-state">${t('reflection.empty_history')}</div>`
        : data.reflections.slice(0, 10).map(r => `
            <div class="reflection-history-item">
              <div class="reflection-history-date">${fmtDate(r.saved_at)} · שבוע ${fmtDate(r.week)}</div>
              <div class="reflection-history-text">${escText(r.free_text || '—')}</div>
            </div>
          `).join('')}
    </div>
  `;

  root.querySelector('#save-reflection').addEventListener('click', () => {
    const q1 = parseFloat(root.querySelector('#rq1').value) || 0;
    const q2 = parseFloat(root.querySelector('#rq2').value) || 0;
    const q3 = parseFloat(root.querySelector('#rq3').value) || 0;
    const q4 = root.querySelector('#rq4').value.trim();
    const free = root.querySelector('#r-free').value.trim();

    if (!q4 && !free) {
      toast('בא נכתוב לפחות שורה אחת', 'warning');
      return;
    }

    Store.addReflection({ q1, q2, q3, q4, free_text: free });
    toast(t('reflection.saved_toast'), 'success');
    setTimeout(() => navigate('home'), 700);
  });
}

function escText(s) {
  return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}
