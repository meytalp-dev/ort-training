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

// === Fireworks (Tier 4 — celebration שמורה ל-rare events) ===
export function fireworks(bursts = 3) {
  const colors = ['#8B5CF6', '#EC4899', '#FACC15', '#06B6D4', '#84CC16', '#FB923C'];

  for (let b = 0; b < bursts; b++) {
    setTimeout(() => {
      const centerX = 20 + Math.random() * 60; // % from left
      const centerY = 20 + Math.random() * 30; // % from top
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Rocket trail (קצר)
      const rocket = document.createElement('div');
      rocket.className = 'firework firework-rocket';
      rocket.style.left = centerX + '%';
      rocket.style.bottom = '0';
      rocket.style.background = color;
      rocket.style.boxShadow = `0 0 8px ${color}`;
      document.body.appendChild(rocket);
      setTimeout(() => rocket.remove(), 700);

      // Burst particles (30 חלקיקים בעיגול)
      setTimeout(() => {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = 80 + Math.random() * 60;
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;

          const particle = document.createElement('div');
          particle.className = 'firework firework-particle';
          particle.style.left = centerX + '%';
          particle.style.top = centerY + '%';
          particle.style.background = color;
          particle.style.boxShadow = `0 0 6px ${color}`;
          particle.style.setProperty('--dx', dx + 'px');
          particle.style.setProperty('--dy', dy + 'px');
          document.body.appendChild(particle);
          setTimeout(() => particle.remove(), 1400);
        }
      }, 500);
    }, b * 400);
  }
}

// === Hero celebration — מסך חגיגי מלא ===
// title — כותרת גדולה
// subtitle — משפט אישי (אופציונלי)
// onClose — callback בלחיצה
// duration — אם 0, ממתין ללחיצה. אחרת מסתיים אוטומטית
export function heroCelebration({ title, subtitle, coinHTML, onClose, duration = 0 }) {
  const overlay = document.createElement('div');
  overlay.className = 'hero-celebration';
  overlay.innerHTML = `
    ${coinHTML || ''}
    <h1>${title || ''}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
    <button class="btn btn-secondary" id="hero-close">סגור</button>
  `;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.style.transition = 'opacity 300ms';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 320);
  };

  overlay.querySelector('#hero-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  if (duration > 0) {
    setTimeout(close, duration);
  }

  return close;
}

// haptic feedback למובייל — שקט כשלא נתמך, אין שגיאה
export function vibrate(ms = 10) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    // silent
  }
}

// בדיקת מילים אסורות בקלט משתמש
const BLOCKED_PATTERNS = [
  /\bסם\b/i, /סמים/i, /קוקאין/i, /גראס/i, /הרואין/i, /אקסטזי/i,
  /\bאקדח\b/i, /רובה/i, /סכין\s+(כדי|על|ל)/i,
  /אובדנות/i, /להרוג/i, /\bרצח\b/i, /התאבדות/i,
  /להעלים\s+את\s+עצמ/i, /\bאנס\b/i,
];

export function containsBlockedContent(text) {
  if (!text || typeof text !== 'string') return false;
  return BLOCKED_PATTERNS.some(rx => rx.test(text));
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
