// i18n.js — מערכת תרגום עם תמיכה במגדר {m, f, n}

let strings = {};
let currentLang = 'he';

export async function loadLanguage(lang = 'he') {
  currentLang = lang;
  try {
    const res = await fetch(`i18n/${lang}.json`);
    strings = await res.json();
  } catch (e) {
    console.warn('i18n load failed', e);
    strings = {};
  }
}

// קריאה ישירה מ-localStorage כדי למנוע circular import עם storage.js
function getGenderForm() {
  try {
    const raw = localStorage.getItem('kis_data_v1');
    if (!raw) return 'n';
    const parsed = JSON.parse(raw);
    return parsed?.profile?.gender_form || 'n';
  } catch {
    return 'n';
  }
}

export function t(path, params = {}) {
  const keys = path.split('.');
  let val = strings;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) return path;
  }

  // אם זה אובייקט עם {m, f, n} — בחר את הגרסה הנכונה לפי המגדר
  if (val && typeof val === 'object' && !Array.isArray(val) && (val.m || val.f || val.n)) {
    const gender = getGenderForm();
    val = val[gender] || val.n || val.m || val.f || '';
  }

  if (typeof val !== 'string') return path;
  return val.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? params[key] : `{${key}}`;
  });
}

export function lang() { return currentLang; }
