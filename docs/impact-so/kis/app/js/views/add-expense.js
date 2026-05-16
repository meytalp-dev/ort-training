// add-expense.js — מודאל הוספת הוצאה ב-3 קליקים + validation לתסריטי כשל

import { Store, dreamProgress, expensesThisMonth } from '../storage.js';
import { t } from '../i18n.js';
import { openModal, closeModal, toast, fmtMoney, vibrate } from '../ui.js';

const HUGE_THRESHOLD = 9999;
const LARGE_THRESHOLD = 200;
const LATE_NIGHT_HOUR = 23;

export function openAddExpense(onSave) {
  let category = '';
  let emotion = '';
  let isSaving = false; // debounce double-clicks

  openModal((body, close) => {
    body.innerHTML = `
      <h2 class="modal-title">${t('expense.modal_title')}</h2>
      <p class="modal-subtitle">${t('expense.modal_subtitle')}</p>

      <div class="field field-large modal-amount-input" style="position:relative;">
        <div class="currency-input">
          <input id="exp-amount" type="number" inputmode="numeric" min="0" placeholder="${t('expense.amount_placeholder')}" autofocus>
        </div>
      </div>

      <div id="amount-warning" class="amount-warning" hidden></div>

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
    const warningEl = body.querySelector('#amount-warning');
    const saveBtn = body.querySelector('#save-expense');

    function showWarning(text) {
      warningEl.hidden = false;
      warningEl.textContent = text;
    }
    function hideWarning() {
      warningEl.hidden = true;
      warningEl.textContent = '';
    }

    function getAmount() {
      const raw = parseFloat(amountInput.value);
      if (isNaN(raw)) return null;
      return raw;
    }

    function validateAmount() {
      const amt = getAmount();
      if (amt === null) { hideWarning(); return false; }
      if (amt < 0) {
        showWarning(t('expense.amount_negative'));
        return false;
      }
      if (amt === 0) {
        showWarning(t('expense.amount_zero'));
        return false;
      }
      hideWarning();
      return true;
    }

    function validateAll() {
      const amountOk = validateAmount();
      const valid = amountOk && category && emotion;
      saveBtn.disabled = !valid;
      saveBtn.style.opacity = valid ? '1' : '0.5';
    }

    amountInput.addEventListener('input', validateAll);

    body.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        category = btn.dataset.cat;
        body.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        vibrate(5);
        validateAll();
      });
    });

    body.querySelectorAll('[data-emo]').forEach(btn => {
      btn.addEventListener('click', () => {
        emotion = btn.dataset.emo;
        body.querySelectorAll('[data-emo]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        vibrate(5);
        validateAll();
      });
    });

    saveBtn.addEventListener('click', async () => {
      if (isSaving) return;
      isSaving = true;
      saveBtn.disabled = true;

      const amt = getAmount();
      if (!validateAmount() || !category || !emotion) {
        isSaving = false;
        return;
      }

      // אישור על סכום עצום (>9999)
      if (amt > HUGE_THRESHOLD) {
        const confirmed = await confirmHugeAmount(body, amt);
        if (!confirmed) {
          isSaving = false;
          saveBtn.disabled = false;
          return;
        }
      }

      Store.addExpense({ amount: amt, category, emotion });
      vibrate(15);

      // הצגת הודעה הקשרית
      const feedback = pickFeedback(amt, emotion);
      toast(feedback, 'success');

      close();
      if (onSave) onSave();
    });

    validateAll();
  }, 'expense-modal');
}

function confirmHugeAmount(body, amt) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'inline-confirm';
    overlay.innerHTML = `
      <div class="inline-confirm-card">
        <h3>${t('expense.amount_huge_title', { amount: fmtMoney(amt) })}</h3>
        <p>${t('expense.amount_huge_body')}</p>
        <div class="inline-confirm-actions">
          <button class="btn btn-secondary" data-act="no">${t('expense.amount_huge_no')}</button>
          <button class="btn btn-primary" data-act="yes">${t('expense.amount_huge_yes')}</button>
        </div>
      </div>
    `;
    body.appendChild(overlay);
    overlay.querySelector('[data-act="yes"]').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.querySelector('[data-act="no"]').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
  });
}

function pickFeedback(amt, emotion) {
  const hour = new Date().getHours();
  const todayCount = expensesThisMonth().filter(e => {
    const d = new Date(e.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const amtFmt = fmtMoney(amt);

  // 4+ הוצאות היום (כולל זו שכרגע נוסף)
  if (todayCount >= 4) return t('expense.feedback_4_today');

  // הוצאה גדולה + רגש מתחרט
  if (amt >= LARGE_THRESHOLD && emotion === 'regret') {
    return t('expense.feedback_large_emotion_regret');
  }

  // הוצאה גדולה (≥200)
  if (amt >= LARGE_THRESHOLD) return t('expense.feedback_large', { amount: amtFmt });

  // לילה מאוחר (אחרי 23:00 או לפני 4:00)
  if (hour >= LATE_NIGHT_HOUR || hour < 4) {
    return t('expense.feedback_late_night', { amount: amtFmt });
  }

  // הוצאה קטנה לפי רגש
  if (emotion === 'happy') return t('expense.feedback_small_emotion_happy');
  if (emotion === 'regret') return t('expense.feedback_small_emotion_regret', { amount: amtFmt });

  return t('expense.feedback_medium', { amount: amtFmt });
}
