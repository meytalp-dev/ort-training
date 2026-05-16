// coin.js — מטבע כיס. רכיב SVG inline + 5 אנימציות.
// שימוש: coinHTML('md', 'idle') → string של HTML שאפשר לשים בכל מקום.

const SIZES = { sm: 'coin-sm', md: 'coin-md', lg: 'coin-lg', xl: 'coin-xl' };
const ANIMS = { bounce: 'coin-bounce', spin: 'coin-spin', celebrate: 'coin-celebrate', idle: 'coin-idle', drop: 'coin-drop' };

const SVG_DEFS_ID = 'kis-coin-defs';

function ensureDefs() {
  if (document.getElementById(SVG_DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = SVG_DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <linearGradient id="kis-coin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#EC4899"/>
      </linearGradient>
      <radialGradient id="kis-coin-shine" cx="35%" cy="35%" r="40%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
  `;
  document.body.appendChild(svg);
}

export function coinHTML(size = 'md', anim = '') {
  ensureDefs();
  const sizeClass = SIZES[size] || SIZES.md;
  const animClass = ANIMS[anim] || '';
  return `
    <div class="coin ${sizeClass} ${animClass}">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="url(#kis-coin-grad)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <circle cx="50" cy="50" r="46" fill="url(#kis-coin-shine)"/>
        <text x="50" y="62" text-anchor="middle" font-family="Heebo, sans-serif" font-size="38" font-weight="900" fill="white">₪</text>
      </svg>
    </div>
  `;
}

// אנימציה חוזרת — מסיר ומוסיף את הקלאס כדי לאפשר re-trigger
export function replayAnim(coinEl, anim = 'bounce') {
  const cls = ANIMS[anim];
  if (!cls || !coinEl) return;
  coinEl.classList.remove(cls);
  void coinEl.offsetWidth; // force reflow
  coinEl.classList.add(cls);
}
