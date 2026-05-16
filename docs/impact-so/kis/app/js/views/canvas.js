// canvas.js — Lean Canvas Lite: 4 משבצות + נקודת איזון

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast, fmtMoney } from '../ui.js';

export function renderCanvas(root, navigate) {
  const existing = Store.get().lean_canvas || {};

  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('canvas.title')}</div>
      <p class="muted" style="margin-top: var(--s-1); font-size: var(--fs-small);">${t('canvas.subtitle')}</p>
    </div>

    <div class="canvas-grid">
      <div class="canvas-cell">
        <span class="canvas-cell-label">${t('canvas.offer_label')}</span>
        <textarea id="c-offer" placeholder="${t('canvas.offer_placeholder')}">${escText(existing.offer || '')}</textarea>
      </div>
      <div class="canvas-cell">
        <span class="canvas-cell-label">${t('canvas.audience_label')}</span>
        <textarea id="c-audience" placeholder="${t('canvas.audience_placeholder')}">${escText(existing.audience || '')}</textarea>
      </div>
      <div class="canvas-cell">
        <span class="canvas-cell-label">${t('canvas.cost_label')}</span>
        <textarea id="c-cost" placeholder="${t('canvas.cost_placeholder')}">${escText(existing.cost || '')}</textarea>
      </div>
      <div class="canvas-cell">
        <span class="canvas-cell-label">${t('canvas.price_label')}</span>
        <textarea id="c-price" placeholder="${t('canvas.price_placeholder')}">${escText(existing.price || '')}</textarea>
      </div>
    </div>

    <div class="breakeven-card">
      <p class="muted" style="font-size: var(--fs-small);">${t('canvas.breakeven_title')}</p>
      <div class="breakeven-num" id="breakeven-display">—</div>
      <p style="font-size: var(--fs-small);">${t('canvas.breakeven_help')}</p>
    </div>

    <button id="save-canvas" class="btn btn-primary btn-lg btn-block" style="margin-top: var(--s-5);">${t('canvas.save_btn')}</button>
  `;

  function updateBreakeven() {
    const costText = root.querySelector('#c-cost').value;
    const priceText = root.querySelector('#c-price').value;
    const costNum = extractFirstNumber(costText);
    const priceNum = extractFirstNumber(priceText);
    const display = root.querySelector('#breakeven-display');
    if (costNum > 0 && priceNum > 0) {
      const units = Math.ceil(costNum / priceNum);
      display.textContent = `${units} יחידות`;
    } else {
      display.textContent = '—';
    }
  }

  ['c-offer', 'c-audience', 'c-cost', 'c-price'].forEach(id => {
    root.querySelector(`#${id}`).addEventListener('input', updateBreakeven);
  });
  updateBreakeven();

  root.querySelector('#save-canvas').addEventListener('click', () => {
    Store.setLeanCanvas({
      offer: root.querySelector('#c-offer').value.trim(),
      audience: root.querySelector('#c-audience').value.trim(),
      cost: root.querySelector('#c-cost').value.trim(),
      price: root.querySelector('#c-price').value.trim(),
    });
    toast(t('canvas.saved_toast'), 'success');
    setTimeout(() => navigate('menu'), 600);
  });
}

function extractFirstNumber(text) {
  const m = String(text || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function escText(s) {
  return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}
