// budget.js — בונה תקציב: 50/30/20 או Zero-Based

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { fmtMoney, toast } from '../ui.js';

const PRESET_50_30_20 = { must: 50, want: 30, save: 20, luxury: 0 };

export function renderBudget(root, navigate) {
  const profile = Store.get().profile || {};
  const existing = Store.get().budgets.find(b => b.type === 'personal');

  let method = existing?.method || '50/30/20';
  let income = existing?.income || profile.income_estimate || 0;
  let allocations = existing?.allocations || calcAllocations(method, income);

  function calcAllocations(m, inc) {
    if (m === '50/30/20') {
      return {
        must: Math.round(inc * PRESET_50_30_20.must / 100),
        want: Math.round(inc * PRESET_50_30_20.want / 100),
        luxury: 0,
        save: Math.round(inc * PRESET_50_30_20.save / 100),
      };
    }
    return existing?.allocations || { must: 0, want: 0, luxury: 0, save: 0 };
  }

  function render() {
    root.innerHTML = `
      <div class="home-header">
        <div class="home-name">${t('budget.title')}</div>
        <p class="muted" style="margin-top: var(--s-1);">${t('budget.subtitle')}</p>
      </div>

      <div class="method-tabs">
        <button class="method-tab ${method === '50/30/20' ? 'is-active' : ''}" data-m="50/30/20">${t('budget.method_50_30_20')}</button>
        <button class="method-tab ${method === 'zero' ? 'is-active' : ''}" data-m="zero">${t('budget.method_zero')}</button>
      </div>
      <p class="muted center mb-5" style="font-size: var(--fs-small);">${t(method === '50/30/20' ? 'budget.method_50_30_20_help' : 'budget.method_zero_help')}</p>

      <div class="field field-large mb-5">
        <label>${t('budget.income_label')}</label>
        <div class="currency-input">
          <input id="bud-income" type="number" inputmode="numeric" min="0" value="${income}">
        </div>
      </div>

      <div id="alloc-list"></div>

      <button id="save-budget" class="btn btn-primary btn-lg btn-block" style="margin-top: var(--s-5);">${t('budget.save_budget_btn')}</button>
    `;

    renderAllocs();

    root.querySelectorAll('[data-m]').forEach(btn => {
      btn.addEventListener('click', () => {
        method = btn.dataset.m;
        allocations = calcAllocations(method, income);
        render();
      });
    });

    const incomeInput = root.querySelector('#bud-income');
    incomeInput.addEventListener('input', () => {
      income = parseFloat(incomeInput.value) || 0;
      allocations = calcAllocations(method, income);
      renderAllocs();
    });

    root.querySelector('#save-budget').addEventListener('click', () => {
      Store.setBudget({
        id: existing?.id || 'b' + Date.now().toString(36),
        name: 'התקציב שלי',
        type: 'personal',
        method,
        income,
        allocations,
      });
      toast('התקציב נשמר ✓', 'success');
      setTimeout(() => navigate('home'), 600);
    });
  }

  function renderAllocs() {
    const wrapper = root.querySelector('#alloc-list');
    const total = (allocations.must || 0) + (allocations.want || 0) + (allocations.luxury || 0) + (allocations.save || 0);
    const remaining = income - total;

    if (method === '50/30/20') {
      wrapper.innerHTML = `
        ${row('must', t('budget.must_label'), allocations.must, '50%')}
        ${row('want', t('budget.want_label'), allocations.want, '30%')}
        ${row('save', t('budget.save_label'), allocations.save, '20%')}
      `;
    } else {
      wrapper.innerHTML = `
        ${editableRow('must', t('budget.must_label'), allocations.must)}
        ${editableRow('want', t('budget.want_label'), allocations.want)}
        ${editableRow('luxury', t('budget.luxury_label'), allocations.luxury)}
        ${editableRow('save', t('budget.save_label'), allocations.save)}
        <div class="card" style="margin-top: var(--s-4); ${remaining < 0 ? 'border-color:var(--danger);' : ''}">
          <div class="flex-row" style="justify-content:space-between;">
            <span class="muted">סך הכל הוקצה:</span>
            <strong>${fmtMoney(total)}</strong>
          </div>
          <div class="flex-row" style="justify-content:space-between; margin-top: var(--s-2);">
            <span class="muted">${remaining >= 0 ? 'נותר להקצות:' : 'חרגתם ב:'}</span>
            <strong style="color:${remaining < 0 ? 'var(--danger)' : 'var(--success)'};">${fmtMoney(Math.abs(remaining))}</strong>
          </div>
        </div>
      `;

      wrapper.querySelectorAll('[data-alloc]').forEach(input => {
        input.addEventListener('input', () => {
          allocations[input.dataset.alloc] = parseFloat(input.value) || 0;
          renderAllocs();
        });
      });
    }
  }

  function row(key, name, value, pct) {
    return `
      <div class="budget-row">
        <div class="budget-row-dot ${key}"></div>
        <div>
          <div class="budget-row-name">${name}</div>
          <div class="budget-row-pct">${pct}</div>
        </div>
        <div class="budget-row-amount">${fmtMoney(value)}</div>
      </div>
    `;
  }

  function editableRow(key, name, value) {
    return `
      <div class="budget-row">
        <div class="budget-row-dot ${key}"></div>
        <div>
          <div class="budget-row-name">${name}</div>
        </div>
        <input data-alloc="${key}" type="number" inputmode="numeric" min="0" value="${value}" style="width: 110px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--r-sm); padding: var(--s-2); text-align: center; font-weight: var(--fw-black); font-size: 18px; color: var(--text-strong);">
      </div>
    `;
  }

  render();
}
