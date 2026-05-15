// main.js — bootstrap + router

import { Store } from './storage.js';
import { loadLanguage } from './i18n.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderDreamWizard } from './views/dream-wizard.js';
import { renderHome } from './views/home.js';
import { renderDashboard } from './views/dashboard.js';
import { renderBudget } from './views/budget.js';
import { renderSettings } from './views/settings.js';
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
};

let currentView = 'home';

function navigate(name) {
  if (!VIEWS[name]) {
    console.warn('unknown view:', name);
    name = 'home';
  }
  currentView = name;
  // hide nav on onboarding + dream wizard (full screen)
  const hideNav = name === 'onboarding' || name === 'dream-wizard';
  bottomNav.hidden = hideNav;
  // active state
  bottomNav.querySelectorAll('[data-view]').forEach(btn => {
    const v = btn.dataset.view;
    const isActive = (v === 'home' && name === 'home') ||
                     (v === 'dream' && name === 'dashboard');
    btn.classList.toggle('is-active', isActive);
  });
  // re-render view
  view.innerHTML = '';
  VIEWS[name](view, navigate);
  // scroll to top
  window.scrollTo(0, 0);
  // remember
  try { sessionStorage.setItem('kis_view', name); } catch (_) {}
}

// FAB → open expense modal
fab.addEventListener('click', () => {
  openAddExpense(() => {
    if (currentView === 'home' || currentView === 'dashboard') {
      navigate(currentView); // re-render to reflect new expense
    }
  });
});

// Bottom nav buttons
bottomNav.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.view;
    if (v === 'home') navigate('home');
    else if (v === 'dream') {
      const dream = Store.get().dream;
      navigate(dream ? 'dashboard' : 'dream-wizard');
    }
  });
});

// Boot
(async function boot() {
  await loadLanguage('he');
  const state = Store.get();
  if (!state.settings.onboarded) {
    navigate('onboarding');
  } else {
    navigate('home');
  }
})();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW failed', err));
  });
}

// Expose for debugging
window.__kis = { Store, navigate };
