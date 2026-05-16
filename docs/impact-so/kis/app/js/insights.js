// insights.js — מודול תובנות יומיות אישיות
// משתמש בנתוני המשתמש לחישוב תובנה רלוונטית. משתנה לפי הקשר.
// לא רנדומלי — בוחר את התובנה הכי משמעותית כרגע.

import { Store, expensesThisMonth, spentThisMonth, byCategoryThisMonth, dreamProgress, dreamPace, daysSetbackFromExpense } from './storage.js';
import { fmtMoney } from './ui.js';

const CAT_LABEL = { must: 'חובה', want: 'רצוי', luxury: 'מותרות' };

// כל insight מחזיר { id, text, priority } או null אם לא רלוונטי
// priority גבוה = יותר חשוב. בוחרים את הגבוה ביותר.

function insightDreamPace() {
  const dream = Store.get().dream;
  const pace = dreamPace();
  if (!dream || !pace) return null;
  return {
    id: 'dream-pace',
    priority: 80,
    text: `${dream.icon || '⭐'} כדי להגיע ל"${dream.title}" אתה צריך לחסוך ${fmtMoney(pace.perDay)} ליום.`,
  };
}

function insightCategoryDominant() {
  const cats = byCategoryThisMonth();
  const total = cats.must + cats.want + cats.luxury;
  if (total < 100) return null;
  const max = Math.max(cats.must, cats.want, cats.luxury);
  const winner = ['must', 'want', 'luxury'].find(c => cats[c] === max);
  const pct = Math.round((max / total) * 100);
  return {
    id: 'cat-dominant',
    priority: 60,
    text: `הקטגוריה הכי כבדה החודש: ${CAT_LABEL[winner]} ב-${pct}% מההוצאות.`,
  };
}

function insightDayWithoutSpend() {
  const expenses = expensesThisMonth();
  if (expenses.length < 5) return null;
  // איזה יום בשבוע יש הכי מעט הוצאות?
  const byDay = [0, 0, 0, 0, 0, 0, 0];
  expenses.forEach(e => {
    const d = new Date(e.date).getDay();
    byDay[d]++;
  });
  const minIdx = byDay.indexOf(Math.min(...byDay));
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  if (byDay[minIdx] === 0) {
    return {
      id: 'day-zero',
      priority: 70,
      text: `יום ${days[minIdx]} — היום היחיד החודש בלי הוצאות. מקריך?`,
    };
  }
  return {
    id: 'day-cheap',
    priority: 40,
    text: `היום הזול שלך בשבוע: יום ${days[minIdx]} — רק ${byDay[minIdx]} הוצאות החודש.`,
  };
}

function insightLuxuryImpact() {
  const cats = byCategoryThisMonth();
  if (cats.luxury < 50) return null;
  const pace = dreamPace();
  if (!pace || pace.perDay === 0) return null;
  const daysSaved = Math.round(cats.luxury / pace.perDay);
  if (daysSaved < 1) return null;
  return {
    id: 'luxury-impact',
    priority: 75,
    text: `המותרות החודש (${fmtMoney(cats.luxury)}) שווים ${daysSaved} ימים פחות עד החלום. שווה לחשוב.`,
  };
}

function insightSpendPace() {
  const spent = spentThisMonth();
  const today = new Date();
  const dayOfMonth = today.getDate();
  if (dayOfMonth < 5 || spent < 100) return null;
  const dailyAvg = Math.round(spent / dayOfMonth);
  const projected = dailyAvg * 30;
  return {
    id: 'spend-pace',
    priority: 50,
    text: `אם תמשיך בקצב הזה — תוציא בערך ${fmtMoney(projected)} עד סוף החודש.`,
  };
}

function insightStreakLogging() {
  const expenses = Store.get().expenses;
  if (expenses.length === 0) return null;
  // ספירת ימים רצופים מהיום אחורה שהיו בהם רישומים
  const days = new Set();
  expenses.forEach(e => {
    days.add(new Date(e.date).toDateString());
  });
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  if (streak < 2) return null;
  return {
    id: 'streak',
    priority: 65,
    text: `🔥 ${streak} ימים ברצף של רישום. אתה בקטע.`,
  };
}

function insightTopMerchant() {
  // אם יש לפחות 10 הוצאות עם אותו category — תובנה
  const expenses = expensesThisMonth();
  if (expenses.length < 10) return null;
  const cats = byCategoryThisMonth();
  const total = cats.must + cats.want + cats.luxury;
  if (total === 0) return null;
  const wantPct = Math.round((cats.want / total) * 100);
  if (wantPct > 50) {
    return {
      id: 'want-heavy',
      priority: 55,
      text: `יותר מחצי מההוצאות שלך החודש הן ב"רצוי". זה הקטגוריה שהכי קל לחתוך.`,
    };
  }
  return null;
}

function insightFirstWeek() {
  const data = Store.get();
  const created = new Date(data.created_at || Date.now());
  const daysSince = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  if (daysSince < 7 || daysSince > 9) return null;
  if (data.expenses.length === 0) return null;
  return {
    id: 'first-week',
    priority: 90,
    text: `שבוע בכיס. אתה עכשיו יודע על הכסף שלך יותר מרוב האנשים סביבך.`,
  };
}

function insightOneMonth() {
  const data = Store.get();
  const created = new Date(data.created_at || Date.now());
  const daysSince = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  if (daysSince < 30 || daysSince > 32) return null;
  return {
    id: 'one-month',
    priority: 95,
    text: `חודש בכיס. זה לא טריוויאלי. רוב המבוגרים לא מצליחים.`,
  };
}

function insightWelcome() {
  const data = Store.get();
  const created = new Date(data.created_at || Date.now());
  const daysSince = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  if (daysSince > 2) return null;
  return {
    id: 'welcome',
    priority: 100,
    text: `ברוך הבא לכיס. שום דבר עוד לא קרה — וזה בסדר. תוסיף הוצאה אחת.`,
  };
}

const ALL_INSIGHTS = [
  insightWelcome,
  insightFirstWeek,
  insightOneMonth,
  insightDreamPace,
  insightLuxuryImpact,
  insightStreakLogging,
  insightDayWithoutSpend,
  insightCategoryDominant,
  insightTopMerchant,
  insightSpendPace,
];

// בוחר את התובנה הכי רלוונטית כרגע
export function pickInsight() {
  const candidates = ALL_INSIGHTS
    .map(fn => fn())
    .filter(Boolean);
  if (candidates.length === 0) return null;

  // אם יש insight בעל priority 90+, נחזיר אותו
  candidates.sort((a, b) => b.priority - a.priority);

  // אם הסביבה זהה ליום הקודם — נחזיר אותו (Insight יציב, לא מרצד)
  const cached = getCachedInsight();
  if (cached && isSameDay(cached.timestamp) && candidates.find(c => c.id === cached.id)) {
    return candidates.find(c => c.id === cached.id);
  }

  // אחרת — תובנה חדשה. שמירה ב-cache.
  const picked = candidates[0];
  cacheInsight(picked);
  return picked;
}

function getCachedInsight() {
  try {
    const raw = localStorage.getItem('kis_daily_insight');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheInsight(insight) {
  try {
    localStorage.setItem('kis_daily_insight', JSON.stringify({
      ...insight,
      timestamp: Date.now(),
    }));
  } catch {}
}

function isSameDay(timestamp) {
  const d1 = new Date(timestamp);
  const d2 = new Date();
  return d1.toDateString() === d2.toDateString();
}
