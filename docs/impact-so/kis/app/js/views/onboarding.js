// onboarding.js — מסך פתיחה: 3 שדות + שאלת חלום

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast } from '../ui.js';

export function renderOnboarding(root, navigate) {
  root.innerHTML = `
    <div class="view-onboarding">
      <div class="onboarding-hero">
        <div class="onboarding-logo">כיס</div>
        <div class="onboarding-tagline">${t('onboarding.step1_subtitle')}</div>
      </div>

      <div class="onboarding-steps">
        <div class="field">
          <label for="ob-name">${t('onboarding.name_label')}</label>
          <input id="ob-name" type="text" placeholder="${t('onboarding.name_placeholder')}" autocomplete="given-name">
        </div>

        <div class="field">
          <label for="ob-age">${t('onboarding.age_label')}</label>
          <input id="ob-age" type="number" inputmode="numeric" min="10" max="22" placeholder="15">
        </div>

        <div class="field">
          <label for="ob-income">${t('onboarding.income_label')}</label>
          <div class="currency-input">
            <input id="ob-income" type="number" inputmode="numeric" min="0" placeholder="${t('onboarding.income_placeholder')}">
          </div>
          <div class="field-hint">${t('onboarding.income_hint')}</div>
        </div>

        <h2 style="margin-top: var(--s-6); margin-bottom: var(--s-2);">${t('onboarding.dream_question_title')}</h2>
        <p class="muted" style="margin-bottom: var(--s-4);">${t('onboarding.dream_question_subtitle')}</p>

        <div class="dream-yes-no">
          <button class="dream-option" data-dream="yes">
            <span class="dream-option-icon">★</span>
            <span>${t('onboarding.dream_yes')}</span>
          </button>
          <button class="dream-option" data-dream="later">
            <span class="dream-option-icon">○</span>
            <span>${t('onboarding.dream_later')}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const nameInput = root.querySelector('#ob-name');
  const ageInput = root.querySelector('#ob-age');
  const incomeInput = root.querySelector('#ob-income');

  function validate() {
    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value, 10);
    const income = parseInt(incomeInput.value, 10);
    if (!name) {
      nameInput.focus();
      toast('חסר שם', 'warning');
      return null;
    }
    if (!age || age < 10 || age > 22) {
      ageInput.focus();
      toast('הזינו גיל בין 10 ל-22', 'warning');
      return null;
    }
    if (isNaN(income) || income < 0) {
      incomeInput.focus();
      toast('הזינו הכנסה משוערת', 'warning');
      return null;
    }
    return { name, age, income };
  }

  root.querySelectorAll('[data-dream]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = validate();
      if (!data) return;
      Store.setProfile({
        name: data.name,
        age: data.age,
        income_estimate: data.income,
        created_at: new Date().toISOString(),
      });
      Store.markOnboarded();
      if (btn.dataset.dream === 'yes') {
        navigate('dream-wizard');
      } else {
        navigate('home');
      }
    });
  });
}
