// add-expense.js — מודאל הוספת הוצאה ב-3 קליקים

import { Store, daysSetbackFromExpense } from '../storage.js';
import { t } from '../i18n.js';
import { openModal, closeModal, toast, fmtMoney } from '../ui.js';

export function openAddExpense(onSave) {
  let amount = '';
  let category = '';
  let emotion = '';

  openModal((body, close) => {
    body.innerHTML = `
      <h2 class="modal-title">${t('expense.modal_title')}</h2>
      <p class="modal-subtitle">${t('expense.modal_subtitle')}</p>

      <div class="field field-large modal-amount-input" style="position:relative;">
        <div class="currency-input">
          <input id="exp-amount" type="number" inputmode="numeric" min="0" placeholder="${t('expense.amount_placeholder')}" autofocus>
        </div>
      </div>

      <div id="impact-line" class="dream-impact" hidden></div>

      <div class="cat-grid">
        <button class="cat-card" data-cat="must">
          <span class="cat-icon" style="color:var(--cat-must);">●</span>
          <span>${t('expense.cat_must')}</span>
        </button>
        <button class="cat-card" data-cat="want">
          <span class="cat-icon" style="color:var(--cat-want);">●</span>
          <span>${t('expense.cat_want')}</span>
        </button>
        <button class="cat-card" data-cat="luxury">
          <span class="cat-icon" style="color:var(--cat-luxury);">●</span>
          <span>${t('expense.cat_luxury')}</span>
        </button>
      </div>

      <div class="emotion-row">
        <button class="emotion-btn" data-emo="happy">
          <span class="emotion-emoji">😊</span>
          <span>${t('expense.emotion_happy')}</span>
        </button>
        <button class="emotion-btn" data-emo="ok">
          <span class="emotion-emoji">😐</span>
          <span>${t('expense.emotion_ok')}</span>
        </button>
        <button class="emotion-btn" data-emo="regret">
          <span class="emotion-emoji">😕</span>
          <span>${t('expense.emotion_regret')}</span>
        </button>
      </div>

      <button id="save-expense" class="btn btn-primary btn-lg btn-block" disabled>${t('expense.save_btn')}</button>
    `;

    const amountInput = body.querySelector('#exp-amount');
    const impactEl = body.querySelector('#impact-line');
    const saveBtn = body.querySelector('#save-expense');

    function updateImpact() {
      const amt = parseFloat(amountInput.value);
      if (!amt || amt <= 0) { impactEl.hidden = true; return; }
      const days = daysSetbackFromExpense(amt);
      if (days > 0) {
        impactEl.hidden = false;
        impactEl.textContent = t('expense.impact_setback', { days });
      } else {
        impactEl.hidden = true;
      }
    }

    function validate() {
      const amt = parseFloat(amountInput.value);
      const valid = amt > 0 && category && emotion;
      saveBtn.disabled = !valid;
      saveBtn.style.opacity = valid ? '1' : '0.5';
    }

    amountInput.addEventListener('input', () => { amount = amountInput.value; updateImpact(); validate(); });

    body.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        category = btn.dataset.cat;
        body.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        validate();
      });
    });

    body.querySelectorAll('[data-emo]').forEach(btn => {
      btn.addEventListener('click', () => {
        emotion = btn.dataset.emo;
        body.querySelectorAll('[data-emo]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        validate();
      });
    });

    saveBtn.addEventListener('click', () => {
      const amt = parseFloat(amountInput.value);
      if (!amt || !category || !emotion) return;
      Store.addExpense({ amount: amt, category, emotion });
      toast(t('expense.saved_toast'), 'success');
      close();
      if (onSave) onSave();
    });

    validate();
  }, 'expense-modal');
}
