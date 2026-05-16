// menu.js — תפריט מרכזי לכל הכלים שאינם בניווט הראשי

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast } from '../ui.js';

export function renderMenu(root, navigate) {
  const theme = Store.get().settings.theme || 'dark';

  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('menu.title')}</div>
    </div>

    <h3 class="section-title">${t('menu.section_my_tools')}</h3>
    <div class="menu-list mb-5">
      <button class="menu-item" data-go="dashboard">
        <span class="menu-icon" style="background: var(--brand-gradient-soft); color: var(--brand-from);">★</span>
        <span class="menu-item-text">${t('menu.item_dream')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="budget">
        <span class="menu-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--cat-must);">▦</span>
        <span class="menu-item-text">${t('menu.item_budget')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="reflection">
        <span class="menu-icon" style="background: rgba(132, 204, 22, 0.15); color: var(--success);">✎</span>
        <span class="menu-item-text">${t('menu.item_reflection')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="canvas">
        <span class="menu-icon" style="background: rgba(250, 204, 21, 0.15); color: var(--cat-want);">◢</span>
        <span class="menu-item-text">${t('menu.item_canvas')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="portfolio">
        <span class="menu-icon" style="background: rgba(236, 72, 153, 0.15); color: var(--cat-luxury);">⎙</span>
        <span class="menu-item-text">${t('menu.item_portfolio')}</span>
        <span class="menu-arrow">‹</span>
      </button>
    </div>

    <h3 class="section-title">${t('menu.section_practice')}</h3>
    <div class="menu-list mb-5">
      <button class="menu-item" data-go="simulation">
        <span class="menu-icon" style="background: rgba(96, 165, 250, 0.15); color: var(--info);">◆</span>
        <span class="menu-item-text">${t('menu.item_simulation')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="toolbox">
        <span class="menu-icon" style="background: rgba(251, 146, 60, 0.15); color: var(--warning);">⚙</span>
        <span class="menu-item-text">${t('menu.item_toolbox')}</span>
        <span class="menu-arrow">‹</span>
      </button>
    </div>

    <h3 class="section-title">${t('menu.section_settings')}</h3>
    <div class="menu-list mb-5">
      <button class="menu-item" id="theme-toggle">
        <span class="menu-icon" style="background: var(--bg-surface); color: var(--text);">${theme === 'dark' ? '☀' : '☾'}</span>
        <span class="menu-item-text">${t('menu.item_light_dark')}</span>
        <span class="menu-arrow">‹</span>
      </button>
      <button class="menu-item" data-go="settings">
        <span class="menu-icon" style="background: var(--bg-surface); color: var(--text);">⚙</span>
        <span class="menu-item-text">${t('menu.item_settings')}</span>
        <span class="menu-arrow">‹</span>
      </button>
    </div>

    <p class="muted center" style="font-size: var(--fs-xs); margin-top: var(--s-8);">
      ${t('app.footer_signature')}
    </p>
  `;

  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.go));
  });

  root.querySelector('#theme-toggle').addEventListener('click', () => {
    const cur = Store.get().settings.theme || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    Store.setTheme(next);
    document.body.classList.toggle('light-mode', next === 'light');
    toast(next === 'light' ? 'מצב בהיר' : 'מצב כהה', 'success');
    navigate('menu'); // re-render
  });
}
