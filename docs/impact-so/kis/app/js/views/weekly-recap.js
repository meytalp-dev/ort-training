// weekly-recap.js — סיכום שבועי שמוצג ביום ראשון, screenshot-shareable

import { Store, byCategoryThisMonth, expensesThisMonth, dreamProgress, dreamPace } from '../storage.js';
import { fmtMoney } from '../ui.js';
import { coinHTML } from '../coin.js';

const CAT_LABEL = { must: 'חובה', want: 'רצוי', luxury: 'מותרות' };
const CAT_COLOR = { must: 'var(--cat-must)', want: 'var(--cat-want)', luxury: 'var(--cat-luxury)' };

export function renderWeeklyRecap(root, navigate) {
  const data = Store.get();
  const expenses = expensesThisMonth();

  // הוצאות 7 ימים אחרונים
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekExpenses = data.expenses.filter(e => new Date(e.date).getTime() >= weekAgo);
  const weekTotal = weekExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // חלוקה לפי קטגוריה
  const cats = { must: 0, want: 0, luxury: 0 };
  weekExpenses.forEach(e => {
    if (cats[e.category] !== undefined) cats[e.category] += Number(e.amount || 0);
  });

  // הוצאה הכי גדולה השבוע
  const biggest = weekExpenses.length > 0
    ? weekExpenses.reduce((a, b) => Number(a.amount) > Number(b.amount) ? a : b)
    : null;

  // ימים בלי הוצאה
  const daysWithSpending = new Set(weekExpenses.map(e => new Date(e.date).toDateString())).size;
  const daysWithoutSpending = 7 - daysWithSpending;

  // יום הכי "כבד"
  const byDay = {};
  weekExpenses.forEach(e => {
    const key = new Date(e.date).toDateString();
    byDay[key] = (byDay[key] || 0) + Number(e.amount || 0);
  });
  const heaviestDay = Object.keys(byDay).length > 0
    ? Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]
    : null;

  // התקדמות חלום (אם יש)
  const dream = data.dream;
  const progress = dreamProgress();

  // בחירת כותרת לפי המצב
  let mainTitle = 'השבוע שלך';
  let mainSubtitle = '';
  if (daysWithoutSpending >= 5) {
    mainTitle = 'שבוע רגוע';
    mainSubtitle = `${daysWithoutSpending} ימים בלי הוצאה. וואו.`;
  } else if (weekTotal === 0) {
    mainTitle = 'שבוע בלי הוצאות';
    mainSubtitle = 'הכל אצלך, או ששכחת לרשום?';
  } else if (cats.luxury > cats.must + cats.want) {
    mainTitle = 'שבוע של מותרות';
    mainSubtitle = 'אם זה היה שווה — שווה.';
  } else if (cats.must > weekTotal * 0.7) {
    mainTitle = 'שבוע סטנדרטי';
    mainSubtitle = 'רוב ההוצאות חובה. זה בסדר.';
  }

  root.innerHTML = `
    <div class="weekly-recap">
      <div class="recap-share-card" id="share-card">
        <div class="recap-header">
          <div class="recap-period">השבוע שלך · ${formatWeekRange()}</div>
          ${coinHTML('lg', 'idle')}
          <h1 class="recap-main-title">${mainTitle}</h1>
          ${mainSubtitle ? `<p class="recap-main-subtitle">${mainSubtitle}</p>` : ''}
        </div>

        <div class="recap-stats">
          <div class="recap-stat">
            <div class="recap-stat-value">${fmtMoney(weekTotal)}</div>
            <div class="recap-stat-label">הוצאת השבוע</div>
          </div>
          <div class="recap-stat">
            <div class="recap-stat-value">${weekExpenses.length}</div>
            <div class="recap-stat-label">רישומים</div>
          </div>
          <div class="recap-stat">
            <div class="recap-stat-value">${daysWithoutSpending}</div>
            <div class="recap-stat-label">ימים נקיים</div>
          </div>
        </div>

        ${weekTotal > 0 ? renderCatBars(cats, weekTotal) : ''}

        ${biggest ? `
          <div class="recap-section">
            <div class="recap-section-label">ההוצאה הכי גדולה</div>
            <div class="recap-big-expense">
              <span class="recap-big-amount">${fmtMoney(biggest.amount)}</span>
              <span class="recap-big-cat">${CAT_LABEL[biggest.category]}</span>
            </div>
          </div>
        ` : ''}

        ${dream && progress ? `
          <div class="recap-section recap-dream-section">
            <div class="recap-section-label">החלום שלך</div>
            <div class="recap-dream">
              <span class="recap-dream-icon">${dream.icon || '⭐'}</span>
              <div class="recap-dream-info">
                <div class="recap-dream-title">${escapeText(dream.title)}</div>
                <div class="recap-dream-pct">${Math.round(progress.pct)}% מהדרך</div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="recap-footer">
          <div class="recap-logo">כיס</div>
          <div class="recap-tag">החלום שלך, אצלך בטלפון.</div>
        </div>
      </div>

      <div class="recap-actions">
        <button class="btn btn-primary btn-block btn-lg" id="recap-share">📸 צלם screenshot ושתף</button>
        <button class="btn btn-secondary btn-block" id="recap-close">סגור</button>
      </div>
    </div>
  `;

  root.querySelector('#recap-close').addEventListener('click', () => navigate('home'));
  root.querySelector('#recap-share').addEventListener('click', () => {
    alert('צלם screenshot של הכרטיס למעלה ושתף בסטורי. הנתונים שלך לא יוצאים מהטלפון.');
  });

  // סימון שראיתי את ה-recap השבוע
  markRecapSeen();
}

function renderCatBars(cats, total) {
  const must = (cats.must / total) * 100;
  const want = (cats.want / total) * 100;
  const luxury = (cats.luxury / total) * 100;
  return `
    <div class="recap-section">
      <div class="recap-section-label">לאן הלך הכסף</div>
      <div class="recap-bar-stack">
        ${cats.must > 0 ? `<div class="recap-bar-seg" style="background: var(--cat-must); width: ${must}%" title="חובה ${fmtMoney(cats.must)}"></div>` : ''}
        ${cats.want > 0 ? `<div class="recap-bar-seg" style="background: var(--cat-want); width: ${want}%" title="רצוי ${fmtMoney(cats.want)}"></div>` : ''}
        ${cats.luxury > 0 ? `<div class="recap-bar-seg" style="background: var(--cat-luxury); width: ${luxury}%" title="מותרות ${fmtMoney(cats.luxury)}"></div>` : ''}
      </div>
      <div class="recap-cat-legend">
        ${cats.must > 0 ? `<div class="recap-cat-item"><span class="recap-cat-dot" style="background: var(--cat-must);"></span>חובה ${fmtMoney(cats.must)}</div>` : ''}
        ${cats.want > 0 ? `<div class="recap-cat-item"><span class="recap-cat-dot" style="background: var(--cat-want);"></span>רצוי ${fmtMoney(cats.want)}</div>` : ''}
        ${cats.luxury > 0 ? `<div class="recap-cat-item"><span class="recap-cat-dot" style="background: var(--cat-luxury);"></span>מותרות ${fmtMoney(cats.luxury)}</div>` : ''}
      </div>
    </div>
  `;
}

function formatWeekRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  const fmt = (d) => d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(today)}`;
}

function escapeText(s) {
  return String(s ?? '').replace(/[<>"&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c]));
}

// בדיקה אם להציג Weekly Recap
export function shouldShowWeeklyRecap() {
  const data = Store.get();
  // מציגים ביום ראשון, אם יש לפחות 3 הוצאות, ואם לא הוצג כבר השבוע
  const today = new Date();
  if (today.getDay() !== 0) return false; // 0 = ראשון
  if (data.expenses.length < 3) return false;
  const lastSeen = localStorage.getItem('kis_recap_last_seen');
  if (!lastSeen) return true;
  const lastSeenDate = new Date(lastSeen);
  const daysAgo = Math.floor((today - lastSeenDate) / (1000 * 60 * 60 * 24));
  return daysAgo >= 6;
}

function markRecapSeen() {
  try {
    localStorage.setItem('kis_recap_last_seen', new Date().toISOString());
  } catch {}
}
