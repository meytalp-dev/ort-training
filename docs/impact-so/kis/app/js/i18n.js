// i18n.js — מערכת תרגום מינימלית

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

export function t(path, params = {}) {
  const keys = path.split('.');
  let val = strings;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) return path;
  }
  if (typeof val !== 'string') return path;
  return val.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? params[key] : `{${key}}`;
  });
}

export function lang() { return currentLang; }
