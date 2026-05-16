// main.js — bootstrap + router + error boundary

import { Store } from './storage.js';
import { loadLanguage, t } from './i18n.js';
import { coinHTML } from './coin.js';
import { vibrate } from './ui.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderDreamWizard } from './views/dream-wizard.js';
import { renderHome } from './views/home.js';
import { renderDashboard } from './views/dashboard.js';
import { renderBudget } from './views/budget.js';
import { renderSettings } from './views/settings.js';
import { renderMenu } from './views/menu.js';
import { renderReflection } from './views/reflection.js';
import { renderCanvas } from './views/canvas.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderSimulation } from './views/simulation.js';
import { renderToolbox } from './views/toolbox.js';
import { renderWeeklyRecap, shouldShowWeeklyRecap } from './views/weekly-recap.js';
import { renderWelcomeBack, shouldShowWelcomeBack } from './views/welcome-back.js';
import { openAddExpense } from './views/add-expense.js';

const view = document.getElementById('view');
const bottomNav = document.getElementById('bottom-nav');
const fab = document.getElementById('fab');

const VIEWS = {
  onboarding: renderOnboarding,
  'dream-wizard': renderDreamWizard,
  home: renderHome,
  dashboard: renderDashboard,
  budget: renderBudget,
  settings: renderSettings,
  menu: renderMenu,
  reflection: renderReflection,
  canvas: renderCanvas,
  portfolio: renderPortfolio,
  simulation: renderSimulation,
  toolbox: renderToolbox,
  'weekly-recap': renderWeeklyRecap,
  'welcome-back': renderWelcomeBack,
};

let currentView = 'home';

function navigate(name) {
  if (!VIEWS[name]) {
    console.warn('unknown view:', name);
    name = 'home';
  }
  currentView = name;
  const hideNav = name === 'onboarding' || name === 'dream-wizard' || name === 'weekly-recap' || name === 'welcome-back';
  bottomNav.hidden = hideNav;
  bottomNav.querySelectorAll('[data-view]').forEach(btn => {
    const v = btn.dataset.view;
    let isActive = false;
    if (v === 'home' && name === 'home') isActive = true;
    else if (v === 'dream' && (name === 'dashboard' || name === 'dream-wizard')) isActive = true;
    else if (v === 'budget' && name === 'budget') isActive = true;
    else if (v === 'menu' && ['menu','reflection','canvas','portfolio','simulation','toolbox','settings'].includes(name)) isActive = true;
    btn.classList.toggle('is-active', isActive);
  });
  try {
    view.innerHTML = '';
    VIEWS[name](view, navigate);
    window.scrollTo(0, 0);
  } catch (err) {
    console.error('view render failed', err);
    showErrorBoundary(err);
  }
}

// Error Boundary גלובלי
function showErrorBoundary(err) {
  bottomNav.hidden = true;
  view.innerHTML = `
    <div class="error-boundary">
      ${coinHTML('lg', 'idle')}
      <h1>${t('errors.boundary_title') || 'משהו נשבר. סליחה.'}</h1>
      <p>${t('errors.boundary_body') || 'זה לא אתה. זה אנחנו.'}</p>
      <button class="btn btn-primary btn-lg" id="reload-btn">${t('errors.boundary_reload') || 'טען מחדש'}</button>
    </div>
  `;
  view.querySelector('#reload-btn').addEventListener('click', () => {
    vibrate(10);
    location.reload();
  });
}

// תפיסת שגיאות לא מטופלות
window.addEventListener('error', (e) => {
  console.error('window.error', e.error || e.message);
  if (!document.querySelector('.error-boundary')) {
    showErrorBoundary(e.error || new Error(e.message));
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('unhandledrejection', e.reason);
});

fab.addEventListener('click', () => {
  vibrate(10);
  openAddExpense(() => {
    if (currentView === 'home' || currentView === 'dashboard') navigate(currentView);
  });
});

bottomNav.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.view;
    if (v === 'home') navigate('home');
    else if (v === 'dream') {
      const dream = Store.get().dream;
      navigate(dream ? 'dashboard' : 'dream-wizard');
    }
    else if (v === 'budget') navigate('budget');
    else if (v === 'menu') navigate('menu');
  });
});

(async function boot() {
  await loadLanguage('he');
  const state = Store.get();
  // apply theme
  if (state.settings.theme === 'light') document.body.classList.add('light-mode');
  if (!state.settings.onboarded) navigate('onboarding');
  else if (shouldShowWeeklyRecap()) navigate('weekly-recap');
  else if (shouldShowWelcomeBack()) navigate('welcome-back');
  else navigate('home');
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW failed', err));
  });
}

window.__kis = { Store, navigate };
