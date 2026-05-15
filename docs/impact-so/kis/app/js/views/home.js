// home.js — מסך בית: ברכה · כרטיס חלום · סיכום חודש · הוצאות אחרונות

import { Store, dreamProgress, dreamPace, spentThisMonth, balanceThisMonth, expensesThisMonth } from '../storage.js';
import { t } from '../i18n.js';
import { fmtMoney, fmtDate, greeting } from '../ui.js';

const CAT_LABEL = {
  must: 'expense.cat_must',
  want: 'expense.cat_want',
  luxury: 'expense.cat_luxury',
};

export function renderHome(root, navigate) {
  const data = Store.get();
  const profile = data.profile || {};
  const dream = data.dream;
  const progress = dreamProgress();
  const pace = dreamPace();
  const spent = spentThisMonth();
  const balance = balanceThisMonth();
  const recent = expensesThisMonth().slice(0, 5);

  root.innerHTML = `
    <div class="home-header">
      <div class="home-greeting">${t(greeting())}</div>
      <div class="home-name">${escapeText(profile.name || 'חבר')}</div>
    </div>

    ${dream ? renderDreamCard(dream, progress, pace) : renderNoDreamCard()}

    <div class="month-summary">
      <div class="summary-card">
        <div class="summary-card-label">${t('home.summary_spent')} ${t('common.this_month')}</div>
        <div class="summary-card-value">${fmtMoney(spent)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">${t('home.summary_balance')}</div>
        <div class="summary-card-value" style="color:${balance < 0 ? 'var(--danger)' : 'var(--success)'};">${fmtMoney(balance)}</div>
      </div>
    </div>

    <h2 class="section-title">${t('home.recent_title')}</h2>
    <div class="expense-list" id="recent-list">
      ${recent.length === 0
        ? `<div class="empty-state">${t('home.empty_expenses')}</div>`
        : recent.map(renderExpenseItem).join('')}
    </div>
  `;

  // Bind dream card click → dashboard
  const dreamCard = root.querySelector('.dream-card');
  if (dreamCard) dreamCard.addEventListener('click', () => navigate('dashboard'));

  // Bind no-dream CTA
  const noDreamCta = root.querySelector('#no-dream-cta');
  if (noDreamCta) noDreamCta.addEventListener('click', () => navigate('dream-wizard'));
}

function renderDreamCard(dream, progress, pace) {
  const pctText = progress ? `${Math.round(progress.pct)}%` : '0%';
  const pctWidth = progress ? Math.max(2, progress.pct) : 0;
  const daysLeft = pace ? pace.daysLeft : 0;
  const perDay = pace ? fmtMoney(pace.perDay) : '—';

  return `
    <div class="dream-card">
      <div class="dream-card-label">${t('home.dream_label')}</div>
      <div class="dream-card-title">${escapeText(dream.title)}</div>

      <div class="dream-card-amounts">
        <div class="dream-card-progress">${fmtMoney(progress.saved)}</div>
        <div class="dream-card-target">${t('home.dream_target_prefix')} ${fmtMoney(progress.target)}</div>
      </div>

      <div class="dream-card-bar">
        <div class="dream-card-bar-fill" style="width:${pctWidth}%;"></div>
      </div>

      <div class="dream-card-meta">
        <span>${pctText}</span>
        <span>${daysLeft} ${t('home.dream_days_left')} · ${perDay} ${t('home.dream_per_day')}</span>
      </div>
    </div>
  `;
}

function renderNoDreamCard() {
  return `
    <div class="no-dream-card">
      <h2>${t('home.no_dream_title')}</h2>
      <p>${t('home.no_dream_body')}</p>
      <button id="no-dream-cta" class="btn btn-primary btn-block">${t('home.no_dream_cta')}</button>
    </div>
  `;
}

function renderExpenseItem(e) {
  const catKey = CAT_LABEL[e.category] || 'expense.cat_want';
  return `
    <div class="expense-item">
      <span class="expense-dot ${e.category}"></span>
      <div class="expense-info">
        <span class="expense-cat">${t(catKey)}</span>
        <span class="expense-date">${fmtDate(e.date)}</span>
      </div>
      <span class="expense-amount">${fmtMoney(e.amount)}</span>
    </div>
  `;
}

function escapeText(s) {
  return String(s ?? '').replace(/[<>"&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c]));
}
