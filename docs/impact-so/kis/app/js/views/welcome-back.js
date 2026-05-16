// welcome-back.js — מסך פתיחה למשתמשת חוזרת (פעם ביום)
// מציג את החלום הקיים ונותן לבחור: להמשיך · חלום חדש · רק להוסיף הוצאה

import { Store, dreamProgress, dreamPace } from '../storage.js';
import { fmtMoney, vibrate, greeting } from '../ui.js';
import { coinHTML } from '../coin.js';
import { t } from '../i18n.js';

const LAST_VISIT_KEY = 'kis_last_visit';

export function renderWelcomeBack(root, navigate) {
  const data = Store.get();
  const dream = data.dream;
  const progress = dreamProgress();
  const pace = dreamPace();

  const greetingKey = greeting();
  const greetingTime = t(greetingKey);

  // אם אין חלום — לעבור ישר ל-home
  if (!dream) {
    markVisited();
    navigate('home');
    return;
  }

  root.innerHTML = `
    <div class="welcome-back">
      <div class="welcome-hero">
        <div class="welcome-greeting">${greetingTime} טוב</div>
        <h1 class="welcome-title">חזרת!</h1>
        <p class="welcome-subtitle">על מה היום?</p>
      </div>

      <button class="welcome-card welcome-card-primary" id="continue-dream">
        <div class="welcome-card-icon">${dream.icon || '⭐'}</div>
        <div class="welcome-card-body">
          <div class="welcome-card-label">החלום שלך</div>
          <div class="welcome-card-title">${escapeText(dream.title)}</div>
          <div class="welcome-card-meta">
            <span class="welcome-card-progress">${progress ? Math.round(progress.pct) : 0}%</span>
            ${pace ? `<span class="welcome-card-pace">${pace.daysLeft} ימים · ${fmtMoney(pace.perDay)} ליום</span>` : ''}
          </div>
          ${progress ? `
            <div class="welcome-card-bar">
              <div class="welcome-card-bar-fill" style="width: ${Math.max(2, progress.pct)}%;"></div>
            </div>
          ` : ''}
        </div>
        <div class="welcome-card-cta">המשך →</div>
      </button>

      <div class="welcome-secondary">
        <button class="welcome-mini-card" id="new-dream">
          <div class="welcome-mini-icon">✨</div>
          <div class="welcome-mini-text">
            <div class="welcome-mini-title">חלום חדש</div>
            <div class="welcome-mini-help">הקיים יישמר בארכיון</div>
          </div>
        </button>

        <button class="welcome-mini-card" id="just-expenses">
          <div class="welcome-mini-icon">${coinHTML('sm', 'idle')}</div>
          <div class="welcome-mini-text">
            <div class="welcome-mini-title">רק להוסיף הוצאות</div>
            <div class="welcome-mini-help">נחזור לחלום מתי שתרצה</div>
          </div>
        </button>
      </div>
    </div>
  `;

  // המשך חלום קיים → dashboard
  root.querySelector('#continue-dream').addEventListener('click', () => {
    vibrate(10);
    markVisited();
    navigate('dashboard');
  });

  // חלום חדש → confirm → archive + dream-wizard
  root.querySelector('#new-dream').addEventListener('click', () => {
    vibrate(10);
    showNewDreamConfirm(root, navigate);
  });

  // רק הוצאות → home
  root.querySelector('#just-expenses').addEventListener('click', () => {
    vibrate(10);
    markVisited();
    navigate('home');
  });
}

function showNewDreamConfirm(root, navigate) {
  const dream = Store.get().dream;
  const confirmHTML = `
    <div class="welcome-confirm">
      <div class="welcome-confirm-card">
        <div class="welcome-confirm-icon">${dream.icon || '⭐'}</div>
        <h2>מה לעשות עם "${escapeText(dream.title)}"?</h2>
        <p class="muted">בחר איך להמשיך:</p>

        <button class="btn btn-primary btn-block btn-lg" data-action="archive">
          לשמור בארכיון ולהתחיל חדש
        </button>

        <button class="btn btn-secondary btn-block" data-action="replace">
          להחליף לגמרי (הקיים יימחק)
        </button>

        <button class="btn btn-ghost btn-block" data-action="cancel">
          רגע, נשארתי עם הישן
        </button>
      </div>
    </div>
  `;

  root.insertAdjacentHTML('beforeend', confirmHTML);
  const overlay = root.querySelector('.welcome-confirm');

  overlay.querySelector('[data-action="archive"]').addEventListener('click', () => {
    Store.archiveCurrentDream();
    markVisited();
    vibrate(15);
    navigate('dream-wizard');
  });

  overlay.querySelector('[data-action="replace"]').addEventListener('click', () => {
    if (confirm('בטוח? החלום הקיים יימחק לגמרי, בלי ארכיון.')) {
      Store.setDream(null);
      markVisited();
      vibrate(15);
      navigate('dream-wizard');
    }
  });

  overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    overlay.remove();
  });
}

function escapeText(s) {
  return String(s ?? '').replace(/[<>"&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c]));
}

function markVisited() {
  try {
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
  } catch {}
}

// תנאי הצגה: יש onboarded, יש חלום פעיל, ולא נכנסת היום
export function shouldShowWelcomeBack() {
  const data = Store.get();
  if (!data.settings.onboarded) return false;
  if (!data.dream) return false; // אם אין חלום, אין צורך לבחור — נכנסים ישר

  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  if (!lastVisit) return true; // משתמשת חוזרת ראשונה אחרי גרסה חדשה — להציג

  const last = new Date(lastVisit);
  const today = new Date();
  // אם זה אותו יום — לא להציג שוב
  return last.toDateString() !== today.toDateString();
}
