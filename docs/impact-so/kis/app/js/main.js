// main.js — bootstrap + router

import { Store } from './storage.js';
import { loadLanguage } from './i18n.js';
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
};

let currentView = 'home';

function navigate(name) {
  if (!VIEWS[name]) {
    console.warn('unknown view:', name);
    name = 'home';
  }
  currentView = name;
  const hideNav = name === 'onboarding' || name === 'dream-wizard';
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
  view.innerHTML = '';
  VIEWS[name](view, navigate);
  window.scrollTo(0, 0);
}

fab.addEventListener('click', () => {
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
  else navigate('home');
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW failed', err));
  });
}

window.__kis = { Store, navigate };
