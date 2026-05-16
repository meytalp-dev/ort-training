// onboarding.js — 5 מסכים: שם · גיל · מגדר · תחקיר הכנסה · חלום

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { vibrate } from '../ui.js';

const STEPS = ['intro', 'age', 'gender', 'income', 'dream'];

export function renderOnboarding(root, navigate) {
  const state = {
    step: 'intro',
    age: null,
    gender_form: null,
    income: { allowance: 0, gifts_yearly: 0, side_job: 0, other: 0 },
  };

  function render() {
    root.innerHTML = '';
    const fns = { intro, age, gender, income, dream };
    fns[state.step]();
  }

  function next() {
    const idx = STEPS.indexOf(state.step);
    if (idx < STEPS.length - 1) {
      state.step = STEPS[idx + 1];
      render();
    }
  }

  function intro() {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero">
          <div class="onboarding-logo">${t('onboarding.step1_title')}</div>
          <div class="onboarding-tagline">${t('onboarding.step1_subtitle')}</div>
        </div>
        <div class="onboarding-steps" style="margin-top: var(--s-8);">
          <button class="btn btn-primary btn-block btn-lg" id="ob-start">יאללה</button>
        </div>
      </div>
    `;
    root.querySelector('#ob-start').addEventListener('click', () => {
      vibrate(10);
      next();
    });
  }

  function age() {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero" style="padding-bottom: var(--s-4);">
          <h1>${t('onboarding.age_label')}</h1>
          <p class="muted">${t('onboarding.age_help')}</p>
        </div>
        <div class="onboarding-steps">
          <div class="field field-large">
            <input id="ob-age" type="number" inputmode="numeric" min="10" max="22" placeholder="15" autofocus>
          </div>
          <button class="btn btn-primary btn-block btn-lg" id="ob-age-next">המשך</button>
        </div>
      </div>
    `;
    const input = root.querySelector('#ob-age');
    const btn = root.querySelector('#ob-age-next');

    function submit() {
      const age = parseInt(input.value, 10);
      if (!age || age < 10 || age > 22) {
        input.focus();
        return;
      }
      if (age < 13 || age > 18) {
        renderAgeOutOfRange(age);
        return;
      }
      state.age = age;
      vibrate(10);
      next();
    }

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
    });
  }

  function renderAgeOutOfRange(age) {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero">
          <h1>${t('onboarding.age_out_of_range_title')}</h1>
          <p class="muted">${t('onboarding.age_out_of_range_body')}</p>
        </div>
        <div class="onboarding-steps">
          <button class="btn btn-primary btn-block btn-lg" id="ob-age-yes">${t('onboarding.age_out_of_range_continue')}</button>
          <button class="btn btn-ghost btn-block" id="ob-age-no">${t('onboarding.age_out_of_range_back')}</button>
        </div>
      </div>
    `;
    root.querySelector('#ob-age-yes').addEventListener('click', () => {
      state.age = age;
      vibrate(10);
      next();
    });
    root.querySelector('#ob-age-no').addEventListener('click', () => {
      state.step = 'age';
      render();
    });
  }

  function gender() {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero" style="padding-bottom: var(--s-4);">
          <h1>${t('onboarding.gender_title')}</h1>
        </div>
        <div class="onboarding-steps">
          <button class="btn btn-secondary btn-block btn-lg" data-g="m">${t('onboarding.gender_male')}</button>
          <button class="btn btn-secondary btn-block btn-lg" data-g="f">${t('onboarding.gender_female')}</button>
          <button class="btn btn-ghost btn-block" data-g="n">${t('onboarding.gender_neutral')}</button>
        </div>
      </div>
    `;
    root.querySelectorAll('[data-g]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.gender_form = btn.dataset.g;
        // שומרים מיד לזיכרון כדי שה-i18n יוכל להשתמש במגדר מיד
        Store.updateProfile({ gender_form: state.gender_form });
        vibrate(10);
        next();
      });
    });
  }

  function income() {
    const Q = [
      { key: 'allowance', label: t('onboarding.income_q_allowance'), opts: [0, 50, 100, 200, 500] },
      { key: 'gifts_yearly', label: t('onboarding.income_q_gifts'), hint: t('onboarding.income_q_gifts_hint'), opts: [0, 200, 600, 1500] },
      { key: 'side_job', label: t('onboarding.income_q_job'), opts: [0, 200, 500, 1000, 2000] },
      { key: 'other', label: t('onboarding.income_q_other'), opts: [0, 100, 300] },
    ];

    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero" style="padding-bottom: var(--s-4);">
          <h1>${t('onboarding.income_title')}</h1>
          <p class="muted">${t('onboarding.income_subtitle')}</p>
        </div>
        <div class="onboarding-steps">
          ${Q.map(q => `
            <div class="income-q">
              <label class="income-q-label">${q.label}${q.hint ? ` <span class="muted">${q.hint}</span>` : ''}</label>
              <div class="chips income-chips" data-key="${q.key}">
                ${q.opts.map(v => `<button class="chip" data-v="${v}">${v === 0 ? '0' : '₪' + v.toLocaleString()}</button>`).join('')}
                <button class="chip" data-other="1">${t('onboarding.income_other_label')}</button>
              </div>
              <input type="number" class="income-other-input" data-key="${q.key}" inputmode="numeric" min="0" placeholder="₪__" hidden>
            </div>
          `).join('')}

          <div class="income-total-card">
            <div class="muted">${t('onboarding.income_total')}</div>
            <div class="number-display gradient-text" id="income-total">₪0</div>
            <div class="field-hint">${t('onboarding.income_total_help')}</div>
          </div>

          <button class="btn btn-primary btn-block btn-lg" id="ob-income-next">${t('common.next')}</button>
        </div>
      </div>
    `;

    const totalEl = root.querySelector('#income-total');

    function recalc() {
      const total = state.income.allowance + Math.round(state.income.gifts_yearly / 12) + state.income.side_job + state.income.other;
      totalEl.textContent = '₪' + total.toLocaleString();
    }

    root.querySelectorAll('.income-chips').forEach(chips => {
      const key = chips.dataset.key;
      chips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chips.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          const otherInput = root.querySelector(`.income-other-input[data-key="${key}"]`);
          if (chip.dataset.other) {
            otherInput.hidden = false;
            otherInput.focus();
            state.income[key] = parseInt(otherInput.value, 10) || 0;
          } else {
            otherInput.hidden = true;
            state.income[key] = parseInt(chip.dataset.v, 10);
          }
          vibrate(5);
          recalc();
        });
      });
    });

    root.querySelectorAll('.income-other-input').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        state.income[key] = parseInt(input.value, 10) || 0;
        recalc();
      });
    });

    root.querySelector('#ob-income-next').addEventListener('click', () => {
      vibrate(10);
      next();
    });
  }

  function dream() {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero" style="padding-bottom: var(--s-4);">
          <h1>${t('onboarding.dream_question_title')}</h1>
        </div>
        <div class="onboarding-steps">
          <button class="btn btn-primary btn-block btn-lg" data-dream="yes">
            ${t('onboarding.dream_yes')}
          </button>
          <button class="btn btn-secondary btn-block btn-lg" data-dream="later">
            ${t('onboarding.dream_later')}
          </button>
          <button class="btn btn-ghost btn-block" data-dream="why">
            ${t('onboarding.dream_why')}
          </button>
        </div>
      </div>
    `;

    root.querySelectorAll('[data-dream]').forEach(btn => {
      btn.addEventListener('click', () => {
        save();
        vibrate(10);
        if (btn.dataset.dream === 'yes') {
          navigate('dream-wizard');
        } else if (btn.dataset.dream === 'why') {
          renderWhyDream();
        } else {
          navigate('home');
        }
      });
    });
  }

  function renderWhyDream() {
    root.innerHTML = `
      <div class="view-onboarding">
        <div class="onboarding-hero">
          <h1>למה חלום?</h1>
        </div>
        <div class="onboarding-steps">
          <p class="muted" style="font-size: var(--fs-body); line-height: var(--lh-loose); margin-bottom: var(--s-6);">
            בלי חלום, כל פלאפל מרגיש אותו דבר. עם חלום, אתה רואה איפה אתה — ואיפה אתה הולך.
            <br><br>
            כיס בלי חלום זה בעיקר מחברת. אפשר להתחיל גם בלי, ולהוסיף חלום מתי שתרצה.
          </p>
          <button class="btn btn-primary btn-block btn-lg" data-dream-after="yes">בא לי חלום עכשיו</button>
          <button class="btn btn-ghost btn-block" data-dream-after="later">בלי חלום בינתיים</button>
        </div>
      </div>
    `;
    root.querySelectorAll('[data-dream-after]').forEach(btn => {
      btn.addEventListener('click', () => {
        vibrate(10);
        if (btn.dataset.dreamAfter === 'yes') navigate('dream-wizard');
        else navigate('home');
      });
    });
  }

  function save() {
    const monthlyIncome = state.income.allowance + Math.round(state.income.gifts_yearly / 12) + state.income.side_job + state.income.other;
    Store.setProfile({
      age: state.age,
      gender_form: state.gender_form || 'n',
      income_breakdown: state.income,
      income_estimate: monthlyIncome,
      fixed_expenses: 0,
      extra_income: 0,
      created_at: new Date().toISOString(),
    });
    Store.markOnboarded();
  }

  render();
}
