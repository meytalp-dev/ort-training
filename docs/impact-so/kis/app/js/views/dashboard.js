// dashboard.js — מסך החלום: התקדמות, קצב, השפעה

import { Store, dreamProgress, dreamPace, byCategoryThisMonth } from '../storage.js';
import { t } from '../i18n.js';
import { fmtMoney } from '../ui.js';

export function renderDashboard(root, navigate) {
  const dream = Store.get().dream;
  if (!dream) {
    root.innerHTML = `
      <div class="empty-state" style="margin-top: var(--s-12);">
        <h2 style="margin-bottom: var(--s-3);">${t('home.no_dream_title')}</h2>
        <p class="muted" style="margin-bottom: var(--s-5);">${t('home.no_dream_body')}</p>
        <button id="go-wizard" class="btn btn-primary">${t('home.no_dream_cta')}</button>
      </div>
    `;
    root.querySelector('#go-wizard').addEventListener('click', () => navigate('dream-wizard'));
    return;
  }

  const progress = dreamProgress();
  const pace = dreamPace();
  const cats = byCategoryThisMonth();
  const totalSpent = cats.must + cats.want + cats.luxury;

  root.innerHTML = `
    <div class="dashboard-hero">
      <div class="dashboard-hero-label">${t('dashboard.title')}</div>
      <div class="dashboard-hero-title">${escapeText(dream.title)}</div>
      <div class="dashboard-hero-amount">${fmtMoney(progress.saved)}</div>
      <div class="dashboard-hero-of">${t('dashboard.of_target', { target: fmtMoney(progress.target) })}</div>
    </div>

    <div class="card mb-5">
      <div class="progress" style="margin-bottom: var(--s-3);">
        <div class="progress-bar" style="width:${Math.max(2, progress.pct)}%;"></div>
      </div>
      <div class="flex-row" style="justify-content:space-between;">
        <span class="muted">${Math.round(progress.pct)}%</span>
        <span class="muted">${fmtMoney(progress.remaining)} נשארו</span>
      </div>
    </div>

    <h2 class="section-title">${t('dashboard.pace_title')}</h2>
    <div class="card pace-card mb-5">
      <div class="pace-stats">
        <div class="pace-stat">
          <div class="pace-stat-num">${fmtMoney(pace.perDay)}</div>
          <div class="pace-stat-label">${t('dashboard.remaining_per_day')}</div>
        </div>
        <div class="pace-stat">
          <div class="pace-stat-num">${fmtMoney(pace.perWeek)}</div>
          <div class="pace-stat-label">${t('dashboard.remaining_per_week')}</div>
        </div>
        <div class="pace-stat">
          <div class="pace-stat-num">${fmtMoney(pace.perMonth)}</div>
          <div class="pace-stat-label">${t('dashboard.remaining_per_month')}</div>
        </div>
      </div>
      <p class="muted center" style="font-size: var(--fs-small);">
        ${pace.daysLeft} ימים נשארו · ${pace.weeksLeft} שבועות · ${pace.monthsLeft} חודשים
      </p>
    </div>

    <h2 class="section-title">חלוקת ההוצאות שלי החודש</h2>
    <div class="card mb-5">
      ${renderCategoryBars(cats, totalSpent)}
    </div>

    <div class="flex-col gap-2">
      <button id="edit-dream" class="btn btn-secondary btn-block">${t('dashboard.edit_dream')}</button>
      <button id="archive-dream" class="btn btn-ghost btn-block">${t('dashboard.archive_dream')}</button>
    </div>
  `;

  root.querySelector('#edit-dream')?.addEventListener('click', () => navigate('dream-wizard'));
  root.querySelector('#archive-dream')?.addEventListener('click', () => {
    if (confirm('להעביר את החלום לארכיון?')) {
      Store.archiveCurrentDream();
      navigate('home');
    }
  });
}

function renderCategoryBars(cats, total) {
  if (total === 0) return '<p class="muted center">עוד אין הוצאות החודש.</p>';

  const pct = c => total > 0 ? (cats[c] / total) * 100 : 0;
  const cls = c => c === 'must' ? 'must' : c === 'want' ? 'want' : 'luxury';
  const label = c => c === 'must' ? 'חובה' : c === 'want' ? 'רצוי' : 'מותרות';

  return ['must', 'want', 'luxury'].map(c => `
    <div class="budget-row">
      <div class="budget-row-dot ${cls(c)}"></div>
      <div>
        <div class="budget-row-name">${label(c)}</div>
        <div class="budget-row-pct">${Math.round(pct(c))}%</div>
      </div>
      <div class="budget-row-amount">${fmtMoney(cats[c])}</div>
    </div>
  `).join('');
}

function escapeText(s) {
  return String(s ?? '').replace(/[<>"&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c]));
}
