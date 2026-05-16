// toolbox.js — ארגז כלים: 5 מחשבונים פיננסיים (יחידות 3-8 בקורס פיננסקלאס)

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast, fmtMoney, openModal, fmtDate } from '../ui.js';

export function renderToolbox(root, navigate) {
  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('toolbox.title')}</div>
      <p class="muted" style="margin-top: var(--s-1); font-size: var(--fs-small);">${t('toolbox.subtitle')}</p>
    </div>

    <button class="tool-card" data-tool="compound">
      <div class="tool-card-icon">∑</div>
      <div class="tool-card-info">
        <div class="tool-card-title">${t('toolbox.tool_compound')}</div>
        <div class="tool-card-desc">${t('toolbox.tool_compound_desc')}</div>
      </div>
      <span class="menu-arrow">‹</span>
    </button>

    <button class="tool-card" data-tool="loan">
      <div class="tool-card-icon">₪</div>
      <div class="tool-card-info">
        <div class="tool-card-title">${t('toolbox.tool_loan')}</div>
        <div class="tool-card-desc">${t('toolbox.tool_loan_desc')}</div>
      </div>
      <span class="menu-arrow">‹</span>
    </button>

    <button class="tool-card" data-tool="checklist">
      <div class="tool-card-icon">✓</div>
      <div class="tool-card-info">
        <div class="tool-card-title">${t('toolbox.tool_checklist')}</div>
        <div class="tool-card-desc">${t('toolbox.tool_checklist_desc')}</div>
      </div>
      <span class="menu-arrow">‹</span>
    </button>

    <button class="tool-card" data-tool="ads">
      <div class="tool-card-icon">◉</div>
      <div class="tool-card-info">
        <div class="tool-card-title">${t('toolbox.tool_ads')}</div>
        <div class="tool-card-desc">${t('toolbox.tool_ads_desc')}</div>
      </div>
      <span class="menu-arrow">‹</span>
    </button>

    <button class="tool-card" data-tool="scenario">
      <div class="tool-card-icon">💬</div>
      <div class="tool-card-info">
        <div class="tool-card-title">${t('toolbox.tool_scenario')}</div>
        <div class="tool-card-desc">${t('toolbox.tool_scenario_desc')}</div>
      </div>
      <span class="menu-arrow">‹</span>
    </button>
  `;

  root.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => openTool(btn.dataset.tool));
  });
}

function openTool(name) {
  if (name === 'compound') openCompound();
  else if (name === 'loan') openLoan();
  else if (name === 'checklist') openChecklist();
  else if (name === 'ads') openAdsLog();
  else if (name === 'scenario') openScenarios();
}

// === Compound interest ===
function openCompound() {
  openModal((body, close) => {
    body.innerHTML = `
      <h2 class="modal-title">${t('toolbox.tool_compound')}</h2>

      <div class="field"><label>${t('toolbox.compound_principal')}</label>
        <div class="currency-input"><input id="cp" type="number" inputmode="numeric" min="0" value="500"></div></div>
      <div class="field"><label>${t('toolbox.compound_monthly')}</label>
        <div class="currency-input"><input id="cm" type="number" inputmode="numeric" min="0" value="200"></div></div>
      <div class="field"><label>${t('toolbox.compound_years')}</label>
        <input id="cy" type="number" inputmode="numeric" min="1" max="50" value="10"></div>
      <div class="field"><label>${t('toolbox.compound_rate')}</label>
        <input id="cr" type="number" inputmode="decimal" min="0" max="20" step="0.5" value="5"></div>

      <div class="card" style="background: var(--brand-gradient-soft); margin-top: var(--s-4);">
        <p class="muted" style="font-size: var(--fs-small); margin-bottom: var(--s-2);">${t('toolbox.compound_result_title')}</p>
        <div class="number-display" id="c-total" style="margin-bottom: var(--s-3); color: var(--text-strong);">—</div>
        <div class="flex-row" style="justify-content: space-between; font-size: var(--fs-small);">
          <span><span class="muted">${t('toolbox.compound_principal_part')}:</span> <strong id="c-prn">—</strong></span>
        </div>
        <div class="flex-row" style="justify-content: space-between; font-size: var(--fs-small); margin-top: var(--s-1);">
          <span><span class="muted">${t('toolbox.compound_interest_part')}:</span> <strong id="c-int" style="color: var(--success);">—</strong></span>
        </div>
      </div>
    `;

    function calc() {
      const p = parseFloat(body.querySelector('#cp').value) || 0;
      const m = parseFloat(body.querySelector('#cm').value) || 0;
      const y = parseFloat(body.querySelector('#cy').value) || 0;
      const r = parseFloat(body.querySelector('#cr').value) || 0;
      const months = y * 12;
      const monthlyRate = r / 100 / 12;
      let balance = p;
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + m;
      }
      const principalTotal = p + m * months;
      const interest = balance - principalTotal;
      body.querySelector('#c-total').textContent = fmtMoney(balance);
      body.querySelector('#c-prn').textContent = fmtMoney(principalTotal);
      body.querySelector('#c-int').textContent = fmtMoney(interest);
    }
    ['cp','cm','cy','cr'].forEach(id => body.querySelector('#' + id).addEventListener('input', calc));
    calc();
  });
}

// === Loan ===
function openLoan() {
  openModal((body, close) => {
    body.innerHTML = `
      <h2 class="modal-title">${t('toolbox.tool_loan')}</h2>

      <div class="field"><label>${t('toolbox.loan_amount')}</label>
        <div class="currency-input"><input id="la" type="number" inputmode="numeric" min="0" value="3000"></div></div>
      <div class="field"><label>${t('toolbox.loan_months')}</label>
        <input id="ln" type="number" inputmode="numeric" min="1" max="120" value="12"></div>
      <div class="field"><label>${t('toolbox.loan_rate')}</label>
        <input id="lr" type="number" inputmode="decimal" min="0" max="50" step="0.5" value="10"></div>

      <div class="card" style="background: var(--brand-gradient-soft); margin-top: var(--s-4);">
        <div class="flex-row" style="justify-content:space-between; margin-bottom: var(--s-2);">
          <span class="muted">${t('toolbox.loan_monthly')}</span>
          <strong id="l-monthly" style="font-size: 22px;">—</strong>
        </div>
        <div class="flex-row" style="justify-content:space-between; margin-bottom: var(--s-2);">
          <span class="muted">${t('toolbox.loan_total')}</span>
          <strong id="l-total" style="font-size: 22px;">—</strong>
        </div>
        <div class="flex-row" style="justify-content:space-between;">
          <span class="muted">${t('toolbox.loan_interest')}</span>
          <strong id="l-interest" style="color: var(--danger); font-size: 22px;">—</strong>
        </div>
      </div>
      <p class="muted center" style="font-size: var(--fs-small); margin-top: var(--s-3);">תיקח, תחזיר. הריבית הוא המחיר.</p>
    `;

    function calc() {
      const amount = parseFloat(body.querySelector('#la').value) || 0;
      const n = parseFloat(body.querySelector('#ln').value) || 1;
      const r = parseFloat(body.querySelector('#lr').value) || 0;
      const mr = r / 100 / 12;
      let monthly;
      if (mr === 0) monthly = amount / n;
      else monthly = amount * mr / (1 - Math.pow(1 + mr, -n));
      const total = monthly * n;
      const interest = total - amount;
      body.querySelector('#l-monthly').textContent = fmtMoney(monthly);
      body.querySelector('#l-total').textContent = fmtMoney(total);
      body.querySelector('#l-interest').textContent = fmtMoney(interest);
    }
    ['la','ln','lr'].forEach(id => body.querySelector('#' + id).addEventListener('input', calc));
    calc();
  });
}

// === Checklist (smart buying) ===
function openChecklist() {
  openModal((body, close) => {
    const qs = [
      t('toolbox.checklist_q1'),
      t('toolbox.checklist_q2'),
      t('toolbox.checklist_q3'),
      t('toolbox.checklist_q4'),
      t('toolbox.checklist_q5'),
    ];
    body.innerHTML = `
      <h2 class="modal-title">${t('toolbox.tool_checklist')}</h2>
      <p class="modal-subtitle">${t('toolbox.tool_checklist_desc')}</p>
      <div id="checklist-list">
        ${qs.map((q, i) => `
          <div class="checklist-q" data-i="${i}">
            <div class="checklist-q-box">✓</div>
            <div>${q}</div>
          </div>
        `).join('')}
      </div>
      <div id="checklist-result" class="card" style="margin-top: var(--s-4); display: none;"></div>
    `;

    const state = qs.map(() => false);
    body.querySelectorAll('.checklist-q').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.i, 10);
        state[i] = !state[i];
        el.classList.toggle('checked', state[i]);
        updateResult();
      });
    });

    function updateResult() {
      const yes = state.filter(Boolean).length;
      const result = body.querySelector('#checklist-result');
      if (yes < 3) { result.style.display = 'none'; return; }
      result.style.display = 'block';
      if (yes === 5) {
        result.style.background = 'rgba(132, 204, 22, 0.15)';
        result.style.borderColor = 'var(--success)';
        result.innerHTML = `<p style="font-weight: var(--fw-bold); color: var(--success);">${t('toolbox.checklist_result_green')}</p>`;
      } else if (yes === 4) {
        result.style.background = 'rgba(250, 204, 21, 0.15)';
        result.style.borderColor = 'var(--warning)';
        result.innerHTML = `<p style="font-weight: var(--fw-bold); color: var(--warning);">${t('toolbox.checklist_result_yellow')}</p>`;
      } else {
        result.style.background = 'rgba(248, 113, 113, 0.15)';
        result.style.borderColor = 'var(--danger)';
        result.innerHTML = `<p style="font-weight: var(--fw-bold); color: var(--danger);">${t('toolbox.checklist_result_red')}</p>`;
      }
    }
  });
}

// === Ads log ===
function openAdsLog() {
  openModal((body, close) => {
    const log = Store.get().ads_log || [];
    body.innerHTML = `
      <h2 class="modal-title">${t('toolbox.tool_ads')}</h2>
      <p class="modal-subtitle">${t('toolbox.ads_today')}</p>

      <div class="field"><label>${t('toolbox.ads_what')}</label>
        <input id="ad-what" type="text" placeholder="חברה / מוצר / סלוגן"></div>
      <div class="field"><label>${t('toolbox.ads_how')}</label>
        <textarea id="ad-how" placeholder="צבעים? סלבים? פחד שאחמיץ? לחץ של הנחה?"></textarea></div>
      <div class="field"><label>${t('toolbox.ads_did_buy')}</label>
        <select id="ad-buy" style="width: 100%; padding: var(--s-3); border-radius: var(--r-md); border: 2px solid var(--border); background: var(--bg-surface); color: var(--text);">
          <option value="no">לא, רק זיהיתי</option>
          <option value="want">כן, גרם לי לרצות</option>
          <option value="bought">קניתי</option>
        </select></div>
      <button id="add-ad" class="btn btn-primary btn-block">${t('toolbox.ads_log_save')}</button>

      <h3 class="section-title" style="margin-top: var(--s-6);">${t('toolbox.ads_log_title')}</h3>
      <div id="ads-list">
        ${log.length === 0
          ? `<div class="empty-state" style="padding: var(--s-4);">${t('toolbox.ads_log_empty')}</div>`
          : log.slice(0, 10).map(a => `
              <div class="reflection-history-item">
                <div class="reflection-history-date">${fmtDate(a.saved_at)}</div>
                <div class="reflection-history-text"><strong>${escText(a.what)}</strong>${a.how ? ' · ' + escText(a.how) : ''}</div>
              </div>
            `).join('')}
      </div>
    `;
    body.querySelector('#add-ad').addEventListener('click', () => {
      const what = body.querySelector('#ad-what').value.trim();
      if (!what) { toast('מה הפרסומת?', 'warning'); return; }
      Store.addAdLog({
        what,
        how: body.querySelector('#ad-how').value.trim(),
        did_buy: body.querySelector('#ad-buy').value,
      });
      toast('נשמר ביומן ✓', 'success');
      close();
    });
  });
}

// === Scenarios ===
function openScenarios() {
  openModal((body, close) => {
    const scenarios = [
      { title: t('toolbox.scenario_1'), hint: t('toolbox.scenario_1_hint') },
      { title: t('toolbox.scenario_2'), hint: t('toolbox.scenario_2_hint') },
      { title: t('toolbox.scenario_3'), hint: t('toolbox.scenario_3_hint') },
    ];
    body.innerHTML = `
      <h2 class="modal-title">${t('toolbox.scenario_title')}</h2>
      <p class="modal-subtitle">${t('toolbox.scenario_subtitle')}</p>
      ${scenarios.map((s, i) => `
        <div class="card mb-3" style="text-align: right;">
          <h3 style="margin-bottom: var(--s-2);">${s.title}</h3>
          <p class="muted" style="font-size: var(--fs-small); line-height: var(--lh-normal);">${s.hint}</p>
        </div>
      `).join('')}
    `;
  });
}

function escText(s) {
  return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}
