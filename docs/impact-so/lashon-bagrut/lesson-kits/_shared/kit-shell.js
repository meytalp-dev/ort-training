/* ════════════════════════════════════════════════════
   Impact SO — Kit Shell JS
   - Injects sidebar + mobile drawer
   - Provides shared share modal (WhatsApp / QR / copy / email)
   - Helpers used by all kit pages
   ════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Default sidebar nav items (back to app.html) ───
  const SIDEBAR_ITEMS = [
    { hash: 'day',          label: 'היום שלי',        icon: 'M12 6v6l4 2' },
    { hash: 'week',         label: 'השבוע שלי',       icon: 'rect' },
    { hash: 'year',         label: 'השנה שלי',        icon: 'cal' },
    { hash: 'classes',      label: 'הכיתות שלי',      icon: 'users' },
    { hash: 'curriculum',   label: 'תוכנית לימודים',  icon: 'book' },
    { hash: 'schedule',     label: 'מערכת שעות',      icon: 'sched' },
    { hash: 'progress',     label: 'התקדמות',         icon: 'chart' },
    { hash: 'assessments',  label: 'הערכות',          icon: 'check' },
  ];

  const SVG_ICONS = {
    'M12 6v6l4 2': '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    'rect':        '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>',
    'cal':         '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    'users':       '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'book':        '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    'sched':       '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'chart':       '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'check':       '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  };

  // ─── HTML escape ───
  function esc(s) {
    if (s === null || s === undefined) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // ─── Build sidebar HTML ───
  function buildSidebarHtml(opts) {
    const appHref = (opts.appHref || '../../app.html');
    return (
      '<div class="mobile-header">' +
        '<span class="en" style="font-weight:700;font-size:18px;letter-spacing:-1px;color:var(--text)">Impact<span style="color:var(--accent)">SO</span></span>' +
        '<button class="menu-toggle" onclick="KitShell.toggleSidebar()">&#9776;</button>' +
      '</div>' +
      '<div class="sidebar-overlay" id="sidebarOverlay" onclick="KitShell.toggleSidebar()"></div>' +
      '<aside class="sidebar" id="sidebar">' +
        '<a href="' + appHref + '" style="text-decoration:none">' +
          '<div class="sidebar-brand">' +
            '<div class="sidebar-brand-text">Impact<span>SO</span></div>' +
            '<div class="sidebar-brand-sub">לשון 70% · בגרות תשפ"ז</div>' +
          '</div>' +
        '</a>' +
        '<nav class="sidebar-nav">' +
          SIDEBAR_ITEMS.map(item =>
            '<a class="nav-item" href="' + appHref + '#' + item.hash + '">' +
              SVG_ICONS[item.icon] +
              esc(item.label) +
            '</a>'
          ).join('') +
        '</nav>' +
        '<div class="sidebar-footer">' +
          '<div class="sidebar-user">' +
            '<div class="sidebar-avatar">מ</div>' +
            '<div><div class="sidebar-user-name">מורה</div><div class="sidebar-user-role">לשון 70% · כיתות י"א</div></div>' +
          '</div>' +
        '</div>' +
      '</aside>'
    );
  }

  // ─── Build share modal (one-time, hidden) ───
  function buildShareModal() {
    if (document.getElementById('share-overlay')) return;
    const div = document.createElement('div');
    div.innerHTML =
      '<div class="share-overlay" id="share-overlay">' +
        '<div class="share-card">' +
          '<button class="share-close" onclick="KitShell.closeShare()">×</button>' +
          '<div class="share-card-title" id="share-title">שתפי</div>' +
          '<div class="share-card-sub" id="share-sub"></div>' +
          '<div class="share-link-row">' +
            '<input type="text" id="share-link" readonly>' +
            '<button class="btn btn-primary" onclick="KitShell.copyLink()" id="share-copy-btn" style="padding:10px 14px">העתיקי</button>' +
          '</div>' +
          '<div class="share-qr-wrap"><img id="share-qr" alt="QR Code"></div>' +
          '<div class="share-buttons">' +
            '<a id="share-wa" class="share-btn-wa" target="_blank">📲 WhatsApp</a>' +
            '<a id="share-em" class="share-btn-em" target="_blank">✉️ מייל</a>' +
            '<a id="share-tg" class="share-btn-tg" target="_blank">📱 Telegram</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div.firstChild);
    // Click outside to close
    document.getElementById('share-overlay').addEventListener('click', e => {
      if (e.target.id === 'share-overlay') closeShare();
    });
  }

  // ─── Open share modal ───
  function openShare(opts) {
    buildShareModal();
    const url = opts.url || location.href;
    const title = opts.title || 'שיתוף';
    const message = (opts.message || (title + '\n' + url));
    document.getElementById('share-title').textContent = '📤 ' + title;
    document.getElementById('share-sub').textContent = opts.subtitle || 'העתיקי קישור או שלחי ישירות';
    document.getElementById('share-link').value = url;
    document.getElementById('share-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(url);
    document.getElementById('share-wa').href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(message);
    document.getElementById('share-em').href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(message);
    document.getElementById('share-tg').href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
    document.getElementById('share-overlay').classList.add('open');
  }
  function closeShare() {
    const o = document.getElementById('share-overlay');
    if (o) o.classList.remove('open');
  }
  function copyLink() {
    const input = document.getElementById('share-link');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      const btn = document.getElementById('share-copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ הועתק';
      setTimeout(() => { btn.textContent = orig; }, 1600);
    });
  }

  // ─── Toggle mobile sidebar ───
  function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('open');
  }

  // ─── Inject sidebar + wrap content into .app/.main shell ───
  function init(opts) {
    opts = opts || {};
    // If body already has .app, skip wrapping
    if (!document.querySelector('.app')) {
      // Wrap existing body content into .main > .page-shell
      const body = document.body;
      const inner = document.createElement('div');
      inner.className = 'app';
      const main = document.createElement('div');
      main.className = 'main';
      const pageShell = document.createElement('div');
      pageShell.className = 'page-shell';
      // Move all current children into pageShell
      while (body.firstChild) pageShell.appendChild(body.firstChild);
      main.appendChild(pageShell);
      inner.appendChild(main);
      // Prepend sidebar HTML (string) before .app
      const sidebarWrap = document.createElement('div');
      sidebarWrap.innerHTML = buildSidebarHtml(opts);
      while (sidebarWrap.firstChild) body.appendChild(sidebarWrap.firstChild);
      body.appendChild(inner);
    }
  }

  // ─── Public API ───
  window.KitShell = {
    init,
    openShare,
    closeShare,
    copyLink,
    toggleSidebar,
    esc,
  };
})();
