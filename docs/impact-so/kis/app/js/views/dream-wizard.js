// dream-wizard.js — 7 שלבי אשף החלום, לב המוצר

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast, confetti, fmtMoney } from '../ui.js';

const TOTAL_STEPS = 7;

export function renderDreamWizard(root, navigate) {
  let step = 1;
  const draft = {
    title: '',
    why_matters: '',
    target_amount: 0,
    current_saved: 0,
    target_date: '',
    chosenAdjust: null,
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
    if (step === 1) renderStep1(stepEl);
    else if (step === 2) renderStep2(stepEl);
    else if (step === 3) renderStep3(stepEl);
    else if (step === 4) renderStep4(stepEl);
    else if (step === 5) renderStep5(stepEl);
    else if (step === 6) renderStep6(stepEl);
    else if (step === 7) renderStep7(stepEl);
  }

  function actions(prevLabel, nextLabel, onPrev, onNext) {
    return `
      <div class="wizard-actions">
        ${onPrev ? `<button class="btn btn-secondary" id="prev-btn" style="flex:1;">${prevLabel}</button>` : ''}
        <button class="btn btn-primary" id="next-btn" style="flex:2;">${nextLabel}</button>
      </div>
    `;
  }

  function bindNav(el, onPrev, onNext) {
    if (onPrev) el.querySelector('#prev-btn')?.addEventListener('click', onPrev);
    el.querySelector('#next-btn')?.addEventListener('click', onNext);
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
          <input id="dw-title" type="text" placeholder="${t('dream_wizard.title_placeholder')}" value="${draft.title}">
        </div>

        <div class="field">
          <label for="dw-why">${t('dream_wizard.why_label')}</label>
          <textarea id="dw-why" placeholder="${t('dream_wizard.why_placeholder')}">${draft.why_matters}</textarea>
        </div>
      </div>
      ${actions('', t('common.next'), null, () => {
        draft.title = el.querySelector('#dw-title').value.trim();
        draft.why_matters = el.querySelector('#dw-why').value.trim();
        if (!draft.title) { toast('צריך לכתוב את החלום', 'warning'); return; }
        step = 2; render();
      })}
    `;
    bindNav(el, null, () => {
      draft.title = el.querySelector('#dw-title').value.trim();
      draft.why_matters = el.querySelector('#dw-why').value.trim();
      if (!draft.title) { toast('צריך לכתוב את החלום', 'warning'); return; }
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
      if (!amt || amt <= 0) { toast('הזינו מחיר', 'warning'); return; }
      draft.target_amount = amt;
      draft.current_saved = saved;
      step = 3; render();
    });
  }

  // ===== Step 3 — Date =====
  function renderStep3(el) {
    const today = new Date();
    const minDate = today.toISOString().slice(0, 10);
    const sixMonthsFromNow = new Date(today.setMonth(today.getMonth() + 6));
    const defaultDate = draft.target_date || sixMonthsFromNow.toISOString().slice(0, 10);

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

  // ===== Step 4 — Reality check =====
  function renderStep4(el) {
    const remaining = Math.max(0, draft.target_amount - draft.current_saved);
    const targetDate = new Date(draft.target_date);
    const today = new Date();
    const days = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
    const months = Math.max(1, Math.ceil(days / 30));
    const weeks = Math.max(1, Math.ceil(days / 7));
    const perMonth = Math.ceil(remaining / months);
    const perWeek = Math.ceil(remaining / weeks);
    const perDay = Math.ceil(remaining / days);

    draft._perMonth = perMonth;
    draft._perWeek = perWeek;
    draft._perDay = perDay;

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step4_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step4_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step4_help')}</p>

      <div class="wizard-step-body">
        <div class="reality-check">
          <div class="reality-tile">
            <div class="reality-tile-label">${t('dream_wizard.per_month')}</div>
            <div class="reality-tile-value">${fmtMoney(perMonth)}</div>
          </div>
          <div class="reality-tile">
            <div class="reality-tile-label">${t('dream_wizard.per_week')}</div>
            <div class="reality-tile-value">${fmtMoney(perWeek)}</div>
          </div>
          <div class="reality-tile">
            <div class="reality-tile-label">${t('dream_wizard.per_day')}</div>
            <div class="reality-tile-value">${fmtMoney(perDay)}</div>
          </div>
        </div>

        <div class="card" style="text-align:center;">
          <p class="muted" style="margin-bottom: var(--s-2);">לסיכום:</p>
          <p>צריך לחסוך <strong style="color:var(--text-strong);font-size:20px;">${fmtMoney(remaining)}</strong> תוך <strong>${months} חודשים</strong></p>
        </div>
      </div>
      ${actions(t('common.back'), t('common.next'))}
    `;
    bindNav(el, () => { step = 3; render(); }, () => { step = 5; render(); });
  }

  // ===== Step 5 — Feasibility light =====
  function renderStep5(el) {
    const income = Store.get().profile?.income_estimate || 0;
    const perMonth = draft._perMonth || 0;
    const ratio = income > 0 ? perMonth / income : 1;
    let color, text;
    if (ratio < 0.20) { color = 'green'; text = t('dream_wizard.light_green'); }
    else if (ratio < 0.40) { color = 'yellow'; text = t('dream_wizard.light_yellow'); }
    else { color = 'red'; text = t('dream_wizard.light_red'); }
    draft._feasibility = color;

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step5_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step5_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step5_help')}</p>

      <div class="wizard-step-body">
        <div class="traffic-light ${color}">
          <div class="traffic-light-icon"></div>
          <div class="traffic-light-text">${text}</div>
        </div>

        <div class="card" style="margin-bottom: var(--s-4);">
          <p class="muted" style="margin-bottom: var(--s-2);">החישוב שלכם:</p>
          <p><strong>${fmtMoney(perMonth)}</strong> בחודש = <strong>${Math.round(ratio * 100)}%</strong> מההכנסה שלכם (${fmtMoney(income)}).</p>
        </div>
      </div>
      ${actions(t('common.back'), color === 'green' ? t('common.next') : 'בואו נתאים')}
    `;
    bindNav(el, () => { step = 4; render(); }, () => {
      if (color === 'green') step = 7;
      else step = 6;
      render();
    });
  }

  // ===== Step 6 — Adjust =====
  function renderStep6(el) {
    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step6_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step6_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step6_help')}</p>

      <div class="wizard-step-body">
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
      </div>
      ${actions(t('common.back'), t('common.skip'))}
    `;

    el.querySelectorAll('[data-adjust]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.adjust;
        if (type === 'timeline') {
          step = 3;
        } else if (type === 'scope') {
          step = 2;
        } else if (type === 'income') {
          toast('הוסיפו עסק קטן — תוכלו לעקוב כתקציב פרויקט בכיס', 'success');
          draft.chosenAdjust = 'income';
          step = 7;
        }
        render();
      });
    });

    bindNav(el, () => { step = 5; render(); }, () => { step = 7; render(); });
  }

  // ===== Step 7 — SMART =====
  function renderStep7(el) {
    const sentence = t('dream_wizard.smart_template', {
      amount: fmtMoney(draft.target_amount - draft.current_saved),
      date: new Date(draft.target_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }),
      what: draft.title,
      monthly: fmtMoney(draft._perMonth),
    });

    el.innerHTML = `
      <div class="wizard-step-num">${t('dream_wizard.step7_num')}</div>
      <h1 class="wizard-step-title">${t('dream_wizard.step7_title')}</h1>
      <p class="wizard-step-help">${t('dream_wizard.step7_help')}</p>

      <div class="wizard-step-body">
        <div class="smart-quote">
          <p class="personal-line">${sentence}</p>
        </div>
        <p class="muted center" style="font-size: var(--fs-small);">${t('dream_wizard.smart_share_parent')}</p>
      </div>
      ${actions(t('common.back'), t('dream_wizard.smart_finish'))}
    `;
    bindNav(el, () => { step = draft._feasibility === 'green' ? 5 : 6; render(); }, () => {
      Store.setDream({
        title: draft.title,
        why_matters: draft.why_matters,
        target_amount: draft.target_amount,
        current_saved: draft.current_saved,
        target_date: draft.target_date,
        smart_sentence: sentence,
        started_at: new Date().toISOString(),
        status: 'active',
      });
      confetti(60);
      toast('החלום נשמר ✓', 'success');
      setTimeout(() => navigate('home'), 800);
    });
  }

  render();
}
