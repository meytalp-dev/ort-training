// home.js — מסך בית: ברכה · כרטיס חלום · סיכום חודש · הוצאות אחרונות

import { Store, dreamProgress, dreamPace, spentThisMonth, balanceThisMonth, expensesThisMonth, thisWeekReflection } from '../storage.js';
import { t } from '../i18n.js';
import { fmtMoney, fmtDate, greeting } from '../ui.js';
import { coinHTML } from '../coin.js';
import { pickInsight } from '../insights.js';

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

  const isSunday = new Date().getDay() === 0;
  const weekRef = thisWeekReflection();
  const showReflectionCard = isSunday && !weekRef;

  // Empty state — בוחרים לפי משך השימוש
  const totalExpenses = data.expenses.length;
  const createdAt = new Date(data.created_at || Date.now());
  const daysSinceCreated = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));

  let emptyKey = 'home.empty_expenses_day1';
  if (totalExpenses === 0 && daysSinceCreated >= 30) emptyKey = 'home.empty_expenses_30days';
  else if (totalExpenses === 0 && daysSinceCreated >= 7) emptyKey = 'home.empty_expenses_week';

  const insight = pickInsight();

  root.innerHTML = `
    <div class="home-header">
      <div class="home-greeting">${t(greeting())} טוב</div>
    </div>

    ${insight ? `
      <div class="insight-card">
        <div class="insight-icon">${coinHTML('sm', 'idle')}</div>
        <div class="insight-text">${insight.text}</div>
      </div>
    ` : ''}

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
        ? `<div class="empty-state empty-state-coin">
            ${coinHTML('lg', 'idle')}
            <p>${t(emptyKey)}</p>
          </div>`
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

  const icon = dream.icon || '⭐';
  return `
    <div class="dream-card">
      <div class="dream-card-header">
        <span class="dream-card-icon">${icon}</span>
        <div>
          <div class="dream-card-label">${t('home.dream_label')}</div>
          <div class="dream-card-title">${escapeText(dream.title)}</div>
        </div>
      </div>

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
