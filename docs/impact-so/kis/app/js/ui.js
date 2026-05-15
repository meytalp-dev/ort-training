// ui.js — קוטגיות utility: toasts, modals, confetti, formatting

export function fmtMoney(amount) {
  const n = Math.round(Number(amount) || 0);
  return '₪' + n.toLocaleString('he-IL');
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

export function toast(message, type = 'default') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 300ms, transform 300ms';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-20px)';
    setTimeout(() => el.remove(), 320);
  }, 2400);
}

export function openModal(contentBuilder, classNames = '') {
  closeModal();
  const root = document.getElementById('modal-root');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal ${classNames}"><div class="modal-handle"></div></div>`;
  const modalEl = backdrop.querySelector('.modal');
  const body = document.createElement('div');
  body.className = 'modal-body';
  modalEl.appendChild(body);
  contentBuilder(body, () => closeModal());

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  root.appendChild(backdrop);
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
}

export function confetti(amount = 40) {
  const colors = ['#8B5CF6', '#EC4899', '#FACC15', '#06B6D4', '#84CC16'];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'home.greeting_morning';
  if (h < 16) return 'home.greeting_afternoon';
  if (h < 21) return 'home.greeting_evening';
  return 'home.greeting_night';
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== false && v !== null && v !== undefined) {
      node.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  }
  return node;
}
