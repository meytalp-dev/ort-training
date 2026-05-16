// dream-wizard.js — 8 שלבים. מתמטיקה הוגנת (פנוי לחיסכון, לא הכנסה ברוטו).

import { Store, availableForSavings } from '../storage.js';
import { t } from '../i18n.js';
import { toast, confetti, fireworks, heroCelebration, fmtMoney, vibrate, containsBlockedContent, openModal, closeModal } from '../ui.js';
import { coinHTML } from '../coin.js';

const TOTAL_STEPS = 8;
const MAX_TITLE_LEN = 100;
const MAX_WHY_LEN = 200;
const HUGE_AMOUNT = 3000000;

// אייקונים לחלום — emojis פופולריים, צבעוניים, מקובלים אצל נוער
const DREAM_ICONS = ['⭐', '📱', '🎧', '👟', '🎮', '✈️', '🚗', '🎸', '📷', '💻', '🎨', '🏀', '⚽', '🎤', '🍕', '🎬', '👕', '🏖️', '💍', '🎁'];

function showBlockedModal() {
  vibrate([20, 30, 20]);
  openModal((body) => {
    body.innerHTML = `
      <div class="blocked-modal">
        <h2>${t('expense.blocked_title')}</h2>
        <p>${t('expense.blocked_body')}</p>
        <p class="muted">${t('expense.blocked_help_intro')}</p>
        <div class="blocked-help">
          <div class="blocked-help-line">📞 <a href="tel:1201">${t('expense.blocked_help_eran')}</a></div>
          <div class="blocked-help-line">📞 <a href="tel:1800120140">${t('expense.blocked_help_sahar')}</a></div>
        </div>
        <button class="btn btn-primary btn-block btn-lg" id="blocked-close">${t('expense.blocked_cta')}</button>
      </div>
    `;
    body.querySelector('#blocked-close').addEventListener('click', closeModal);
  });
}

export function renderDreamWizard(root, navigate) {
  let step = 1;
  const profile = Store.get().profile || {};
  const draft = {
    title: '',
    why_matters: '',
    icon: '⭐',
    target_amount: 0,
    current_saved: 0,
    target_date: '',
    fixed_expenses: Number(profile.fixed_expenses || 0),
    extra_income: 0,
    adjustments: [],
  };

  function render() {
    const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => {
      const idx = i + 1;
      const cls = idx < step ? 'is-done' : idx === step ? 'is-current' : '';
      return `<span class="wizard-progress-dot ${cls}"></span>`;
    }).join('');

    root.innerHTML = `
      <div class="wizard">
        <div class="wizard-progress">${dots}</div>
        <div class="wizard-step" id="wizard-step"></div>
      </div>
    `;
    renderStep();
  }

  function renderStep() {
    const stepEl = root.querySelector('#wizard-step');
    const fn = { 1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4, 5: renderStep5, 6: renderStep6, 7: renderStep7, 8: renderStep8 }[step];
    fn(stepEl);
  }

  function actions(prevLabel, nextLabel) {
    return `
      <div class="wizard-actions">
        ${prevLabel ? `<button class="btn btn-secondary" id="prev-btn" style="flex:1;">${prevLabel}</button>` : ''}
        <button class="btn btn-primary" id="next-btn" style="flex:2;">${nextLabel}</button>
      </div>
    `;
  }
  function bindNav(el, onPrev, onNext) {
    if (onPrev) el.querySelector('#prev-btn')?.addEventListener('click', onPrev);
    el.querySelector('#next-btn')?.addEventListener('click', onNext);
  }

  // === Math helpers ===
  function computeMonths() {
    const today = new Date();
    const target = new Date(draft.target_date);
    const days = Math.max(1, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
    return { days, months: Math.max(1, Math.ceil(days / 30)), weeks: Math.max(1, Math.ceil(days / 7)) };
  }
  function neededPerMonth() {
    const remaining = Math.max(0, draft.target_amount - draft.current_saved);
    return Math.ceil(remaining / computeMonths().months);
  }
  function availableNow() {
    const income = Number(profile.income_estimate || 0);
    const extra = Number(draft.extra_income || 0);
    return Math.max(0, income + extra - Number(draft.fixed_expenses || 0));
  }
  function feasibility() {
    const needed = neededPerMonth();
    const available = availableNow();
    if (available === 0) return 'red';
    const ratio = needed / available;
    if (ratio <= 0.5) return 'green';
    if (ratio <= 1.0) return 'yellow';
    return 'red';
  }

  // ===== Step 1 — Dream =====
  function renderStep1(el) {
    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step1_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step1_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step1_help')}</p>

      <div class="wizard-step-body">
        <div class="field">
          <label for="dw-title">${t('dream_wizard.title_label')}</label>
          <input id="dw-title" type="text" placeholder="${t('dream_wizard.title_placeholder')}" value="${escAttr(draft.title)}">
        </div>
        <div class="field">
          <label>בחר אייקון לחלום</label>
          <div class="icon-picker">
            ${DREAM_ICONS.map(icon => `
              <button type="button" class="icon-pick ${draft.icon === icon ? 'is-active' : ''}" data-icon="${icon}">${icon}</button>
            `).join('')}
          </div>
        </div>
        <div class="field">
          <label for="dw-why">${t('dream_wizard.why_label')}</label>
          <textarea id="dw-why" placeholder="${t('dream_wizard.why_placeholder')}">${escText(draft.why_matters)}</textarea>
        </div>
      </div>
      ${actions(null, t('common.next'))}
    `;
    // איקון picker
    el.querySelectorAll('.icon-pick').forEach(btn => {
      btn.addEventListener('click', () => {
        draft.icon = btn.dataset.icon;
        el.querySelectorAll('.icon-pick').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        vibrate(5);
      });
    });

    bindNav(el, null, () => {
      let title = el.querySelector('#dw-title').value.trim();
      let why = el.querySelector('#dw-why').value.trim();

      if (!title) {
        toast(t('dream_wizard.title_required'), 'warning');
        return;
      }

      // חסימת מילים אסורות (כולל בשדה "למה")
      if (containsBlockedContent(title) || containsBlockedContent(why)) {
        showBlockedModal();
        return;
      }

      // חיתוך אוטומטי של תווים מרובים
      if (title.length > MAX_TITLE_LEN) {
        title = title.slice(0, MAX_TITLE_LEN);
        toast(t('dream_wizard.title_truncated'), 'default');
      }
      if (why.length > MAX_WHY_LEN) {
        why = why.slice(0, MAX_WHY_LEN);
      }

      draft.title = title;
      draft.why_matters = why;
      vibrate(10);
      step = 2; render();
    });
  }

  // ===== Step 2 — Cost =====
  function renderStep2(el) {
    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step2_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step2_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step2_help')}</p>

      <div class="wizard-step-body">
        <div class="field field-large">
          <label for="dw-amount">${t('dream_wizard.amount_label')}</label>
          <div class="currency-input">
            <input id="dw-amount" type="number" inputmode="numeric" min="0" placeholder="${t('dream_wizard.amount_placeholder')}" value="${draft.target_amount || ''}">
          </div>
        </div>
        <div class="field">
          <label for="dw-saved">${t('dream_wizard.current_saved_label')}</label>
          <div class="currency-input">
            <input id="dw-saved" type="number" inputmode="numeric" min="0" placeholder="${t('dream_wizard.current_saved_placeholder')}" value="${draft.current_saved || ''}">
          </div>
        </div>
      </div>
      ${actions(t('common.back'), t('common.next'))}
    `;
    bindNav(el, () => { step = 1; render(); }, () => {
      const amt = parseInt(el.querySelector('#dw-amount').value, 10);
      const saved = parseInt(el.querySelector('#dw-saved').value, 10) || 0;

      if (!amt || amt <= 0) {
        toast(t('dream_wizard.amount_zero_body'), 'warning');
        return;
      }

      if (amt > HUGE_AMOUNT) {
        toast(t('dream_wizard.amount_huge_body'), 'warning');
        // לא חוסמים — רק מתריעים. נמשיך אם המשתמש לוחץ שוב.
      }

      draft.target_amount = amt;
      draft.current_saved = saved;
      vibrate(10);
      step = 3; render();
    });
  }

  // ===== Step 3 — Date =====
  function renderStep3(el) {
    const today = new Date();
    const minDate = today.toISOString().slice(0, 10);
    const six = new Date(today); six.setMonth(six.getMonth() + 6);
    const defaultDate = draft.target_date || six.toISOString().slice(0, 10);

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step3_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step3_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step3_help')}</p>

      <div class="wizard-step-body">
        <div class="field">
          <label for="dw-date">${t('dream_wizard.date_label')}</label>
          <input id="dw-date" type="date" min="${minDate}" value="${defaultDate}">
        </div>
      </div>
      ${actions(t('common.back'), t('common.next'))}
    `;
    bindNav(el, () => { step = 2; render(); }, () => {
      const date = el.querySelector('#dw-date').value;
      if (!date) { toast('בחרו תאריך', 'warning'); return; }
      draft.target_date = date;
      step = 4; render();
    });
  }

  // ===== Step 4 — Fixed expenses (NEW) =====
  function renderStep4(el) {
    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step4_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step4_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step4_help')}</p>

      <div class="wizard-step-body">
        <div class="field field-large">
          <label for="dw-fixed">${t('dream_wizard.fixed_expenses_label')}</label>
          <div class="currency-input">
            <input id="dw-fixed" type="number" inputmode="numeric" min="0" placeholder="${t('dream_wizard.fixed_expenses_placeholder')}" value="${draft.fixed_expenses || ''}">
          </div>
          <div class="field-hint">${t('dream_wizard.fixed_expenses_hint')}</div>
        </div>
      </div>
      ${actions(t('common.back'), t('common.next'))}
    `;
    bindNav(el, () => { step = 3; render(); }, () => {
      const fixed = parseInt(el.querySelector('#dw-fixed').value, 10) || 0;
      draft.fixed_expenses = fixed;
      // persist fixed expenses to profile so home/dashboard use it too
      Store.setProfile({ ...(Store.get().profile || {}), fixed_expenses: fixed });
      step = 5; render();
    });
  }

  // ===== Step 5 — The numbers (visible breakdown) =====
  function renderStep5(el) {
    const income = Number(profile.income_estimate || 0);
    const available = availableNow();
    const needed = neededPerMonth();
    const m = computeMonths();
    const remaining = Math.max(0, draft.target_amount - draft.current_saved);

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step5_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step5_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step5_help')}</p>

      <div class="wizard-step-body">
        <div class="card mb-3">
          <div class="flex-row" style="justify-content:space-between; margin-bottom: var(--s-2);">
            <span class="muted">${t('dream_wizard.income_summary')}</span>
            <strong>${fmtMoney(income)}</strong>
          </div>
          <div class="flex-row" style="justify-content:space-between; margin-bottom: var(--s-2);">
            <span class="muted">${t('dream_wizard.fixed_summary')}</span>
            <strong style="color:var(--text-muted);">−${fmtMoney(draft.fixed_expenses)}</strong>
          </div>
          <hr style="border:none;border-top:1px solid var(--border);margin: var(--s-3) 0;">
          <div class="flex-row" style="justify-content:space-between;">
            <span class="strong">${t('dream_wizard.available_summary')}</span>
            <strong style="color: var(--success); font-size: 22px;">${fmtMoney(available)}</strong>
          </div>
        </div>

        <div class="card" style="background: var(--brand-gradient-soft); border-color: var(--border-strong);">
          <div class="flex-row" style="justify-content:space-between; margin-bottom: var(--s-2);">
            <span class="muted">${t('dream_wizard.needed_summary')}</span>
            <strong style="font-size: 22px;">${fmtMoney(needed)}</strong>
          </div>
          <p class="muted" style="font-size: var(--fs-small);">
            ${fmtMoney(remaining)} בסך הכל · על פני ${m.months} חודשים
          </p>
        </div>
      </div>
      ${actions(t('common.back'), 'בא נראה')}
    `;
    bindNav(el, () => { step = 4; render(); }, () => { step = 6; render(); });
  }

  // ===== Step 6 — Feasibility (honest + encouraging) =====
  function renderStep6(el) {
    const status = feasibility();
    const needed = neededPerMonth();
    const available = availableNow();
    const gap = Math.max(0, needed - available);

    const titles = {
      green: t('dream_wizard.feasibility_green_title'),
      yellow: t('dream_wizard.feasibility_yellow_title'),
      red: t('dream_wizard.feasibility_red_title'),
    };
    const bodies = {
      green: t('dream_wizard.feasibility_green_body'),
      yellow: t('dream_wizard.feasibility_yellow_body'),
      red: t('dream_wizard.feasibility_red_body'),
    };

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step6_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step6_title')}</h1>

      <div class="wizard-step-body">
        <div class="traffic-light ${status}" style="flex-direction:column;align-items:flex-start;">
          <div class="flex-row gap-3" style="margin-bottom: var(--s-2);">
            <div class="traffic-light-icon" style="width:32px;height:32px;"></div>
            <div class="traffic-light-text" style="font-size: var(--fs-h3);">${titles[status]}</div>
          </div>
          <p style="margin-right: 44px; line-height: var(--lh-normal); color: var(--text);">
            ${bodies[status]}
          </p>
        </div>

        ${status === 'red' ? `
          <div class="card" style="margin-top: var(--s-4); border-color: var(--danger);">
            <p class="muted" style="margin-bottom: var(--s-2);">${t('dream_wizard.feasibility_gap_help', { needed: fmtMoney(needed), available: fmtMoney(available) })}</p>
            <p style="font-size: 22px; font-weight: var(--fw-black); color: var(--danger);">
              ${t('dream_wizard.feasibility_gap', { gap: fmtMoney(gap) })}
            </p>
          </div>
        ` : ''}

        ${status === 'yellow' ? `
          <div class="card" style="margin-top: var(--s-4);">
            <p>הפנוי שלך: <strong>${fmtMoney(available)}</strong> · החיסכון הנדרש: <strong>${fmtMoney(needed)}</strong></p>
            <p class="muted" style="font-size: var(--fs-small); margin-top: var(--s-2);">נשאר לך ${fmtMoney(Math.max(0, available - needed))} בחודש לכיף. הדוק, אבל אפשרי.</p>
          </div>
        ` : ''}
      </div>
      ${actions(t('common.back'), status === 'green' ? t('common.next') : 'בא ננצח את זה')}
    `;
    bindNav(el, () => { step = 5; render(); }, () => {
      step = status === 'green' ? 8 : 7;
      render();
    });
  }

  // ===== Step 7 — Closing the gap (collaborative) =====
  function renderStep7(el) {
    const needed = neededPerMonth();
    const available = availableNow();
    const gap = Math.max(0, needed - available);

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step7_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step7_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step7_help')}</p>

      <div class="wizard-step-body">
        ${gap > 0 ? `<p class="muted center mb-4">הפער שצריך לסגור: <strong style="color: var(--text-strong);">${fmtMoney(gap)}</strong> בחודש</p>` : ''}

        <div class="adjust-options">
          <button class="adjust-option" data-adjust="timeline">
            <div class="adjust-option-title">${t('dream_wizard.adjust_timeline')}</div>
            <div class="adjust-option-help">${t('dream_wizard.adjust_timeline_help')}</div>
          </button>
          <button class="adjust-option" data-adjust="scope">
            <div class="adjust-option-title">${t('dream_wizard.adjust_scope')}</div>
            <div class="adjust-option-help">${t('dream_wizard.adjust_scope_help')}</div>
          </button>
          <button class="adjust-option" data-adjust="income">
            <div class="adjust-option-title">${t('dream_wizard.adjust_income')}</div>
            <div class="adjust-option-help">${t('dream_wizard.adjust_income_help')}</div>
          </button>
        </div>

        <div id="extra-income-block" hidden style="margin-top: var(--s-4);">
          <div class="field field-large">
            <label for="dw-extra">${t('dream_wizard.income_extra_label')}</label>
            <div class="currency-input">
              <input id="dw-extra" type="number" inputmode="numeric" min="0" placeholder="${t('dream_wizard.income_extra_placeholder')}" value="${draft.extra_income || ''}">
            </div>
          </div>
        </div>
      </div>
      ${actions(t('common.back'), t('common.next'))}
    `;

    el.querySelectorAll('[data-adjust]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.adjust;
        if (type === 'timeline') {
          toast('בא נחזור לתאריך', 'success');
          step = 3; render();
        } else if (type === 'scope') {
          toast('בא נחזור למחיר', 'success');
          step = 2; render();
        } else if (type === 'income') {
          el.querySelector('#extra-income-block').hidden = false;
          el.querySelector('#dw-extra').focus();
        }
      });
    });

    bindNav(el, () => { step = 6; render(); }, () => {
      const extra = parseInt(el.querySelector('#dw-extra')?.value, 10) || 0;
      draft.extra_income = extra;
      Store.setProfile({ ...(Store.get().profile || {}), extra_income: extra });
      // re-check feasibility — if now green/yellow, proceed; if still red, allow continuing anyway with awareness
      step = 8; render();
    });
  }

  // ===== Step 8 — SMART =====
  function renderStep8(el) {
    const needed = neededPerMonth();
    const remaining = Math.max(0, draft.target_amount - draft.current_saved);
    const sentence = t('dream_wizard.smart_template', {
      amount: fmtMoney(remaining),
      date: new Date(draft.target_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }),
      what: draft.title,
      monthly: fmtMoney(needed),
    });

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step8_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step8_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step8_help')}</p>

      <div class="wizard-step-body">
        <div class="smart-quote">
          <p class="personal-line">${sentence}</p>
        </div>
        <p class="muted center" style="font-size: var(--fs-small);">${t('dream_wizard.smart_share_parent')}</p>
      </div>
      ${actions(t('common.back'), t('dream_wizard.smart_finish'))}
    `;
    bindNav(el, () => { step = feasibility() === 'green' ? 6 : 7; render(); }, () => {
      Store.setDream({
        title: draft.title,
        why_matters: draft.why_matters,
        target_amount: draft.target_amount,
        current_saved: draft.current_saved,
        target_date: draft.target_date,
        icon: draft.icon || '⭐',
        smart_sentence: sentence,
        started_at: new Date().toISOString(),
        status: 'active',
      });
      // Tier 4 celebration — חגיגה מלאה: זיקוקים + confetti + מטבע + hero
      vibrate([20, 30, 20, 30, 50]);
      fireworks(4);
      confetti(80);
      heroCelebration({
        title: 'יש לך חלום',
        subtitle: draft.title,
        coinHTML: coinHTML('xl', 'celebrate'),
        onClose: () => navigate('home'),
      });
    });
  }

  render();
}

function escAttr(s) { return String(s ?? '').replace(/"/g, '&quot;'); }
function escText(s) { return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
