// settings.js — מסך הגדרות + גיבוי/ייבוא/איפוס

import { Store } from '../storage.js';
import { t } from '../i18n.js';
import { toast } from '../ui.js';

const VERSION = '0.1.0';

export function renderSettings(root, navigate) {
  const data = Store.get();

  root.innerHTML = `
    <div class="home-header">
      <div class="home-name">${t('settings.title')}</div>
    </div>

    <div class="field">
      <label for="set-email">${t('settings.email_label')}</label>
      <input id="set-email" type="email" placeholder="email@example.com" value="${data.settings.email || ''}">
      <div class="field-hint">${t('settings.email_help')}</div>
    </div>

    <h2 class="section-title" style="margin-top: var(--s-6);">${t('settings.export_label')}</h2>
    <button id="export-btn" class="btn btn-secondary btn-block mb-3">${t('settings.export_btn')}</button>
    <button id="import-btn" class="btn btn-secondary btn-block mb-3">${t('settings.import_btn')}</button>
    <input type="file" id="import-file" accept="application/json" hidden>

    <h2 class="section-title" style="margin-top: var(--s-6); color: var(--danger);">${t('settings.reset_label')}</h2>
    <button id="reset-btn" class="btn btn-ghost btn-block" style="color: var(--danger);">${t('settings.reset_btn')}</button>

    <p class="muted center" style="margin-top: var(--s-8); font-size: var(--fs-xs);">
      ${t('settings.version', { v: VERSION })}<br>
      ${t('app.footer_signature')}
    </p>
  `;

  const emailInput = root.querySelector('#set-email');
  emailInput.addEventListener('change', () => {
    const v = emailInput.value.trim();
    Store.setSetting('email', v || null);
    if (v) toast('המייל נשמר', 'success');
  });

  root.querySelector('#export-btn').addEventListener('click', () => {
    const json = Store.exportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `kis-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('הגיבוי הורד ✓', 'success');
  });

  const fileInput = root.querySelector('#import-file');
  root.querySelector('#import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = Store.importJson(text);
    if (ok) {
      toast('הגיבוי יובא ✓', 'success');
      setTimeout(() => navigate('home'), 600);
    } else {
      toast('הקובץ לא תקין', 'warning');
    }
  });

  root.querySelector('#reset-btn').addEventListener('click', () => {
    if (confirm('למחוק את כל הנתונים? פעולה זו לא הפיכה.')) {
      Store.reset();
      toast('הכל אופס', 'success');
      setTimeout(() => navigate('onboarding'), 600);
    }
  });
}
