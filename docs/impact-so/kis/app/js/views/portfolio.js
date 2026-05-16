// portfolio.js — "תיק התקציב": כל מה שהתלמיד בנה במקום אחד + הדפסה ל-PDF

import { Store, dreamProgress, byCategoryThisMonth, spentThisMonth } from '../storage.js';
import { t } from '../i18n.js';
import { fmtMoney, fmtDate } from '../ui.js';

export function renderPortfolio(root, navigate) {
  const data = Store.get();
  const profile = data.profile || {};
  const dream = data.dream;
  const budget = data.budgets.find(b => b.type === 'personal');
  const canvas = data.lean_canvas;
  const lastReflection = data.reflections[0];
  const progress = dreamProgress();
  const cats = byCategoryThisMonth();

  root.innerHTML = `
    <div class="home-header no-print">
      <div class="home-name">${t('portfolio.title')}</div>
      <p class="muted" style="margin-top: var(--s-1); font-size: var(--fs-small);">${t('portfolio.subtitle')}</p>
    </div>

    <button id="print-btn" class="btn btn-primary btn-block no-print" style="margin-bottom: var(--s-5);">${t('portfolio.print_btn')}</button>

    <div class="portfolio-section">
      <h3>${t('portfolio.section_profile')}</h3>
      <div class="portfolio-row"><span class="label">שם</span><span class="value">${escText(profile.name || '—')}</span></div>
      <div class="portfolio-row"><span class="label">גיל</span><span class="value">${profile.age || '—'}</span></div>
      <div class="portfolio-row"><span class="label">הכנסה חודשית</span><span class="value">${fmtMoney(profile.income_estimate || 0)}</span></div>
      <div class="portfolio-row"><span class="label">הוצאות חובה</span><span class="value">${fmtMoney(profile.fixed_expenses || 0)}</span></div>
    </div>

    ${dream ? `
      <div class="portfolio-section">
        <h3>${t('portfolio.section_dream')}</h3>
        <div class="portfolio-row"><span class="label">החלום</span><span class="value">${escText(dream.title)}</span></div>
        <div class="portfolio-row"><span class="label">מחיר</span><span class="value">${fmtMoney(dream.target_amount)}</span></div>
        <div class="portfolio-row"><span class="label">תאריך יעד</span><span class="value">${new Date(dream.target_date).toLocaleDateString('he-IL')}</span></div>
        <div class="portfolio-row"><span class="label">כבר חסכתי</span><span class="value">${fmtMoney(progress.saved)}</span></div>
        <div class="portfolio-row"><span class="label">התקדמות</span><span class="value">${Math.round(progress.pct)}%</span></div>
        ${dream.smart_sentence ? `
          <p style="margin-top: var(--s-3); padding: var(--s-3); background: var(--bg-base); border-radius: var(--r-md); font-style: italic; line-height: var(--lh-normal);">"${escText(dream.smart_sentence)}"</p>
        ` : ''}
      </div>
    ` : ''}

    ${budget ? `
      <div class="portfolio-section">
        <h3>${t('portfolio.section_budget')}</h3>
        <div class="portfolio-row"><span class="label">שיטה</span><span class="value">${budget.method}</span></div>
        <div class="portfolio-row"><span class="label">חובה</span><span class="value">${fmtMoney(budget.allocations.must || 0)}</span></div>
        <div class="portfolio-row"><span class="label">רצוי</span><span class="value">${fmtMoney(budget.allocations.want || 0)}</span></div>
        <div class="portfolio-row"><span class="label">מותרות</span><span class="value">${fmtMoney(budget.allocations.luxury || 0)}</span></div>
        <div class="portfolio-row"><span class="label">חיסכון</span><span class="value">${fmtMoney(budget.allocations.save || 0)}</span></div>
      </div>
    ` : ''}

    ${canvas ? `
      <div class="portfolio-section">
        <h3>${t('portfolio.section_canvas')}</h3>
        <div class="portfolio-row"><span class="label">מה אני מציע</span><span class="value">${escText(canvas.offer || '—')}</span></div>
        <div class="portfolio-row"><span class="label">למי</span><span class="value">${escText(canvas.audience || '—')}</span></div>
        <div class="portfolio-row"><span class="label">עלות</span><span class="value">${escText(canvas.cost || '—')}</span></div>
        <div class="portfolio-row"><span class="label">מחיר</span><span class="value">${escText(canvas.price || '—')}</span></div>
      </div>
    ` : ''}

    <div class="portfolio-section">
      <h3>${t('portfolio.section_summary')}</h3>
      <div class="portfolio-row"><span class="label">סה"כ הוצאתי</span><span class="value">${fmtMoney(spentThisMonth())}</span></div>
      <div class="portfolio-row"><span class="label">חובה</span><span class="value">${fmtMoney(cats.must)}</span></div>
      <div class="portfolio-row"><span class="label">רצוי</span><span class="value">${fmtMoney(cats.want)}</span></div>
      <div class="portfolio-row"><span class="label">מותרות</span><span class="value">${fmtMoney(cats.luxury)}</span></div>
    </div>

    ${lastReflection ? `
      <div class="portfolio-section">
        <h3>${t('portfolio.section_reflection')}</h3>
        <p style="line-height: var(--lh-normal);">${escText(lastReflection.free_text || lastReflection.q4 || '—')}</p>
        <p class="muted" style="margin-top: var(--s-2); font-size: var(--fs-xs);">${fmtDate(lastReflection.saved_at)}</p>
      </div>
    ` : ''}

    <p class="muted center no-print" style="font-size: var(--fs-xs); margin-top: var(--s-6);">
      ${t('app.footer_signature')}
    </p>
  `;

  root.querySelector('#print-btn').addEventListener('click', () => {
    window.print();
  });
}

function escText(s) {
  return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}
