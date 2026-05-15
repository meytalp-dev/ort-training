// storage.js — localStorage wrapper עם schema קבוע

const KEY = 'kis_data_v1';

const DEFAULT_STATE = {
  version: 1,
  created_at: null,
  profile: null,         // { age, income_estimate }
  dream: null,           // { title, why_matters, target_amount, target_date, current_saved, started_at, status }
  dreams_archive: [],
  expenses: [],          // [{ id, date, amount, category, tag_fixed, tag_business, emotion }]
  budgets: [],           // [{ id, name, type, method, income, allocations }]
  reflections: [],
  lean_canvas: null,
  settings: {
    email: null,
    onboarded: false,
  },
};

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      cache = structuredClone(DEFAULT_STATE);
      cache.created_at = new Date().toISOString();
      return cache;
    }
    const parsed = JSON.parse(raw);
    cache = { ...structuredClone(DEFAULT_STATE), ...parsed };
    return cache;
  } catch (e) {
    console.warn('storage read failed', e);
    cache = structuredClone(DEFAULT_STATE);
    return cache;
  }
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('storage write failed', e);
  }
}

export const Store = {
  get() { return read(); },

  setProfile(profile) {
    read();
    cache.profile = profile;
    write();
  },

  setDream(dream) {
    read();
    cache.dream = dream;
    write();
  },

  archiveCurrentDream() {
    read();
    if (cache.dream) {
      cache.dreams_archive.push({ ...cache.dream, archived_at: new Date().toISOString() });
      cache.dream = null;
      write();
    }
  },

  addExpense(expense) {
    read();
    const entry = {
      id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      ...expense,
    };
    cache.expenses.unshift(entry);
    write();
    return entry;
  },

  removeExpense(id) {
    read();
    cache.expenses = cache.expenses.filter(e => e.id !== id);
    write();
  },

  setBudget(budget) {
    read();
    const idx = cache.budgets.findIndex(b => b.id === budget.id);
    if (idx >= 0) cache.budgets[idx] = budget;
    else cache.budgets.push(budget);
    write();
  },

  setSetting(key, value) {
    read();
    cache.settings[key] = value;
    write();
  },

  markOnboarded() {
    read();
    cache.settings.onboarded = true;
    write();
  },

  // ייצוא JSON לגיבוי
  exportJson() {
    read();
    return JSON.stringify(cache, null, 2);
  },

  importJson(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') return false;
      cache = { ...structuredClone(DEFAULT_STATE), ...parsed };
      write();
      return true;
    } catch (e) {
      return false;
    }
  },

  reset() {
    cache = structuredClone(DEFAULT_STATE);
    cache.created_at = new Date().toISOString();
    write();
  },
};

// ===== Derived helpers =====

export function expensesThisMonth() {
  const data = Store.get();
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return data.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
}

export function spentThisMonth() {
  return expensesThisMonth().reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function balanceThisMonth() {
  const data = Store.get();
  const income = data.profile?.income_estimate || 0;
  return income - spentThisMonth();
}

export function byCategoryThisMonth() {
  const totals = { must: 0, want: 0, luxury: 0 };
  for (const e of expensesThisMonth()) {
    if (totals[e.category] !== undefined) totals[e.category] += Number(e.amount || 0);
  }
  return totals;
}

export function dreamProgress() {
  const dream = Store.get().dream;
  if (!dream) return null;
  const saved = Number(dream.current_saved || 0);
  const target = Number(dream.target_amount || 0);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  return { saved, target, pct, remaining: Math.max(0, target - saved) };
}

export function dreamPace() {
  const dream = Store.get().dream;
  if (!dream || !dream.target_date) return null;
  const remaining = Math.max(0, Number(dream.target_amount || 0) - Number(dream.current_saved || 0));
  const targetDate = new Date(dream.target_date);
  const today = new Date();
  const msDiff = targetDate - today;
  const daysLeft = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  return {
    daysLeft,
    weeksLeft,
    monthsLeft,
    perDay: Math.ceil(remaining / daysLeft),
    perWeek: Math.ceil(remaining / weeksLeft),
    perMonth: Math.ceil(remaining / monthsLeft),
  };
}

// כמה ימים אחורה דוחפת הוצאה את החלום
export function daysSetbackFromExpense(amount) {
  const pace = dreamPace();
  if (!pace || pace.perDay === 0) return 0;
  return Math.round(amount / pace.perDay);
}
