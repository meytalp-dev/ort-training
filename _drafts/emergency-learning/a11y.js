/* ============================================================
   רֶצֶף — עוזרי נגישות משותפים (W0-D9)
   a11y.js · נלווה ל: a11y.css · וניל, בלי תלויות. טען עם defer.
   ------------------------------------------------------------
   נותן API קטן ומשותף תחת window.rzA11y:
     rzA11y.announce(msg, assertive?)  — שידור מילולי לקורא-מסך (aria-live)
     rzA11y.trapFocus(container)       — כליאת מיקוד בתוך Modal/Drawer; מחזיר release()
     rzA11y.getFocusable(container)    — כל האלמנטים המקבלים פוקוס בתוך אב
   בנוסף, בטעינה:
     • מוודא שקיים אזור-חי אחד (.a11y-live) לשידורים.
     • מחווט skip-link → מעביר פוקוס ליעד (#main / href) בלי לאבד מקלדת.
   כלל: לא לגעת בנתוני תלמיד. עוזרי-UI בלבד.
   ============================================================ */
(function () {
  'use strict';
  var W = window;
  if (W.rzA11y) return; // idempotent

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    'summary', '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(',');

  function getFocusable(container) {
    if (!container) return [];
    var list = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE));
    return list.filter(function (el) {
      // מסונן: מוסתר או ללא גודל (למשל בתוך [hidden])
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  /* ---------- אזור-חי לשידור סטטוס מילולי ---------- */
  var liveEl = null;
  function ensureLive() {
    if (liveEl && document.body.contains(liveEl)) return liveEl;
    liveEl = document.querySelector('.a11y-live[data-rz-live]');
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.className = 'a11y-live';
      liveEl.setAttribute('data-rz-live', '');
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveEl);
    }
    return liveEl;
  }

  function announce(msg, assertive) {
    var el = ensureLive();
    el.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    // איפוס כדי לאלץ הקראה חוזרת של אותו טקסט
    el.textContent = '';
    W.requestAnimationFrame(function () { el.textContent = String(msg || ''); });
  }

  /* ---------- כליאת מיקוד (Modal / Drawer) ---------- */
  function trapFocus(container) {
    if (!container) return function () {};
    var prevActive = document.activeElement;
    var focusables = getFocusable(container);
    var first = focusables[0] || container;
    // אם למיכל אין tabindex — נאפשר לו לקבל פוקוס ראשוני
    if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
    (focusables[0] || container).focus();

    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = getFocusable(container);
      if (!items.length) { e.preventDefault(); container.focus(); return; }
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      var active = document.activeElement;
      if (e.shiftKey) {
        if (active === firstEl || !container.contains(active)) {
          e.preventDefault(); lastEl.focus();
        }
      } else {
        if (active === lastEl || !container.contains(active)) {
          e.preventDefault(); firstEl.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey, true);

    return function release() {
      document.removeEventListener('keydown', onKey, true);
      if (prevActive && typeof prevActive.focus === 'function') {
        prevActive.focus();
      }
    };
  }

  /* ---------- חיווט skip-link ---------- */
  function wireSkipLinks() {
    document.querySelectorAll('a.skip-link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = id && document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus();
        // גלילה עדינה (מכובדת ע"י reduced-motion ב-CSS)
        target.scrollIntoView({ block: 'start' });
      });
    });
  }

  function init() {
    ensureLive();
    wireSkipLinks();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  W.rzA11y = {
    announce: announce,
    trapFocus: trapFocus,
    getFocusable: getFocusable
  };
})();
