// simulation.js — 3 פרופילי תרגול + קוד מורה

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast, fmtMoney } from '../ui.js';

const PROFILES = {
  soldier: { name_key: 'simulation.profile_soldier_name', desc_key: 'simulation.profile_soldier_desc', income: 3500, fixed: 200 },
  student: { name_key: 'simulation.profile_student_name', desc_key: 'simulation.profile_student_desc', income: 4200, fixed: 1500 },
  worker: { name_key: 'simulation.profile_worker_name', desc_key: 'simulation.profile_worker_desc', income: 5200, fixed: 2200 },
};

// קוד מורה -> profile mapping (פשטני: 6 ספרות, 1XX=soldier, 2XX=student, 3XX=worker)
const TEACHER_CODES = {
  '100001': 'soldier', '100002': 'soldier', '100003': 'soldier',
  '200001': 'student', '200002': 'student', '200003': 'student',
  '300001': 'worker', '300002': 'worker', '300003': 'worker',
};

export function renderSimulation(root, navigate) {
  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('simulation.title')}</div>
      <p class="muted" style="margin-top: var(--s-1); font-size: var(--fs-small);">${t('simulation.subtitle')}</p>
    </div>

    <h3 class="section-title">${t('simulation.teacher_code_title')}</h3>
    <p class="muted mb-3" style="font-size: var(--fs-small);">${t('simulation.teacher_code_help')}</p>
    <div class="field">
      <input id="t-code" class="teacher-code-input" type="text" inputmode="numeric" maxlength="6" placeholder="${t('simulation.teacher_code_placeholder')}">
    </div>
    <button id="apply-code" class="btn btn-secondary btn-block mb-5">${t('simulation.teacher_code_btn')}</button>

    <h3 class="section-title">פרופילים זמינים</h3>
    ${Object.entries(PROFILES).map(([key, p]) => `
      <div class="sim-profile">
        <div class="sim-profile-name">${t(p.name_key)}</div>
        <div class="sim-profile-desc">${t(p.desc_key)}</div>
        <div class="flex-row" style="gap: var(--s-4); margin-bottom: var(--s-3);">
          <div><span class="muted" style="font-size: var(--fs-xs);">הכנסה</span><br><strong>${fmtMoney(p.income)}</strong></div>
          <div><span class="muted" style="font-size: var(--fs-xs);">חובה</span><br><strong>${fmtMoney(p.fixed)}</strong></div>
          <div><span class="muted" style="font-size: var(--fs-xs);">פנוי</span><br><strong style="color: var(--success);">${fmtMoney(p.income - p.fixed)}</strong></div>
        </div>
        <button class="btn btn-primary btn-block" data-profile="${key}">${t('simulation.load_btn')}</button>
      </div>
    `).join('')}
  `;

  root.querySelectorAll('[data-profile]').forEach(btn => {
    btn.addEventListener('click', () => loadProfile(btn.dataset.profile));
  });

  root.querySelector('#apply-code').addEventListener('click', () => {
    const code = root.querySelector('#t-code').value.trim();
    const profileKey = TEACHER_CODES[code];
    if (!profileKey) {
      toast(t('simulation.teacher_code_invalid'), 'warning');
      return;
    }
    Store.setSetting('teacher_code', code);
    loadProfile(profileKey);
  });

  function loadProfile(key) {
    const p = PROFILES[key];
    if (!p) return;
    const simBudget = {
      id: 'sim-' + key,
      name: t(p.name_key),
      type: 'simulation',
      method: '50/30/20',
      income: p.income,
      fixed_expenses: p.fixed,
      allocations: {
        must: Math.round(p.income * 0.5),
        want: Math.round(p.income * 0.3),
        luxury: 0,
        save: Math.round(p.income * 0.2),
      },
    };
    Store.setBudget(simBudget);
    toast(t('simulation.loaded_toast'), 'success');
    setTimeout(() => navigate('budget'), 700);
  }
}
