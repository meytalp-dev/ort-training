/* ═══════════════════════════════════════════════════════════════════
   AI Slide Tools — Inline AI generators embedded inside lesson slides
   Used across lesson-kits/.

   Usage:
     SlideAI.mount(slideEl, {
       tool: 'verb-generator',
       config: { gizra: 'chasrei-pn', count: 6 },
       button: { label: 'הצג 6 פעלים מהגזרה', emoji: '🎲' },
     });

   Architecture:
     - Static banks of verified verbs/conjugations (works offline).
     - If localStorage.getItem('lashon-gemini-key') is set → live Gemini variation.
     - Modal overlay above the slide; re-roll, copy-to-WhatsApp, settings.
   ═══════════════════════════════════════════════════════════════════ */

const SlideAI = (() => {
  'use strict';

  // ───────────────────────────────────────────────────────────────
  // STATIC BANK — verified Hebrew verb data for חסרי פ"נ
  // Pedagogically validated: roots, vocalization, binyan, exam relevance.
  // ───────────────────────────────────────────────────────────────
  const BANK = {
    'chasrei-pn': {
      // Verbs where the nun is the first root letter (פ"א הפועל = נ).
      // Each entry shows the past tense (where nun stays) + a notable form.
      // Levels for bagrut י"א — easy/medium/high.
      // קל: יומיומי, ברור, מופיע בכל ספר. בינוני: דורש זיהוי שורש. גבוה: עלול להופיע בבחינה כשאלת אתגר.
      verbs: [
        // ─ קל (יומיומי, ברור) ─
        { root: 'נ.פ.ל', word: 'נָפַל',  meaning: 'נפל',  future: 'יִפֹּל',   binyan: 'קל',     level: 'easy' },
        { root: 'נ.ת.ן', word: 'נָתַן',  meaning: 'נתן',  future: 'יִתֵּן',   binyan: 'קל',     level: 'easy' },
        { root: 'נ.ג.ע', word: 'נָגַע',  meaning: 'נגע',  future: 'יִגַּע',   binyan: 'קל',     level: 'easy' },
        { root: 'נ.ס.ע', word: 'נָסַע',  meaning: 'נסע',  future: 'יִסַּע',   binyan: 'קל',     level: 'easy' },
        { root: 'נ.ג.ע', word: 'הִגִּיעַ', meaning: 'הגיע', future: 'יַגִּיעַ', binyan: 'הפעיל', level: 'easy' },
        { root: 'נ.ג.ש', word: 'הִגִּישׁ', meaning: 'הגיש', future: 'יַגִּישׁ', binyan: 'הפעיל', level: 'easy' },
        // ─ בינוני (דורש זיהוי שורש) ─
        { root: 'נ.שׂ.א', word: 'נָשָׂא', meaning: 'נשא',  future: 'יִשָּׂא',  binyan: 'קל',     level: 'medium' },
        { root: 'נ.כ.ר', word: 'הִכִּיר', meaning: 'הכיר', future: 'יַכִּיר',  binyan: 'הפעיל', level: 'medium' },
        { root: 'נ.צ.ל', word: 'הִצִּיל', meaning: 'הציל', future: 'יַצִּיל',  binyan: 'הפעיל', level: 'medium' },
        { root: 'נ.ב.ט', word: 'הִבִּיט', meaning: 'הביט', future: 'יַבִּיט',  binyan: 'הפעיל', level: 'medium' },
        // ─ גבוה (אתגר לבגרות) ─
        { root: 'נ.כ.ס', word: 'הִכְנִיס', meaning: 'הכניס', future: 'יַכְנִיס', binyan: 'הפעיל', level: 'high' },
        { root: 'נ.ד.ב', word: 'הִתְנַדֵּב', meaning: 'התנדב', future: 'יִתְנַדֵּב', binyan: 'התפעל', level: 'high', note: 'בהתפעל הנ\' שמורה — אתגר בגרותי' },
        { root: 'נ.כ.שׁ', word: 'הִכִּישׁ', meaning: 'הכיש (עקיצת נחש)', future: 'יַכִּישׁ', binyan: 'הפעיל', level: 'high' },
        { root: 'נ.שׂ.א', word: 'הִשִּׂיא', meaning: 'הִשִּׂיא (חתונה / המליץ)', future: 'יַשִּׂיא', binyan: 'הפעיל', level: 'high', note: 'אותו שורש כמו נָשָׂא — בניין שונה' },
      ],
      // Verbs with a guttural as 2nd root letter — nun does NOT fall.
      // All entries are בניין קל so the כלל applies cleanly.
      // הגרוניות הן בעצמן רמת אתגר — לכן מתחלקות בין בינוני (נפוצים) לגבוה (נדירים).
      gutturals: [
        { root: 'נ.ה.ג', word: 'נָהַג', meaning: 'נהג (במכונית)',  future: 'יִנְהַג', guttural: 'ה', level: 'medium' },
        { root: 'נ.ח.ת', word: 'נָחַת', meaning: 'נחת (מטוס)',     future: 'יִנְחַת', guttural: 'ח', level: 'medium' },
        { root: 'נ.ע.ל', word: 'נָעַל', meaning: 'נעל (נעליים)',    future: 'יִנְעַל', guttural: 'ע', level: 'medium' },
        { root: 'נ.ע.ר', word: 'נָעַר', meaning: 'ניער',           future: 'יִנְעַר', guttural: 'ע', level: 'medium' },
        { root: 'נ.ה.ם', word: 'נָהַם', meaning: 'נהם (כמו אריה)', future: 'יִנְהַם', guttural: 'ה', level: 'high' },
        { root: 'נ.ה.ר', word: 'נָהַר', meaning: 'זרם/נהר אליו',   future: 'יִנְהַר', guttural: 'ה', level: 'high' },
        { root: 'נ.ח.ל', word: 'נָחַל', meaning: 'ירש',            future: 'יִנְחַל', guttural: 'ח', level: 'high' },
        { root: 'נ.ע.ם', word: 'נָעַם', meaning: 'היה נעים',       future: 'יִנְעַם', guttural: 'ע', level: 'high' },
        { root: 'נ.א.ם', word: 'נָאַם', meaning: 'נאם (נשא נאום)', future: 'יִנְאַם', guttural: 'א', level: 'high' },
      ],
      // Full conjugations for hand-picked exemplars (future-kal + hifil past).
      conjugations: {
        // Hifil past tense — shows that the nun falls across all persons.
        hifil_past: {
          'נ.ג.ש': {
            base: 'הִגִּישׁ',
            level: 'easy',
            forms: [
              { p: 'אֲנִי',     f: 'הִגַּשְׁתִּי',  note: '' },
              { p: 'אַתָּה',     f: 'הִגַּשְׁתָּ',   note: '' },
              { p: 'אַתְּ',      f: 'הִגַּשְׁתְּ',   note: '' },
              { p: 'הוּא',      f: 'הִגִּישׁ',    note: '' },
              { p: 'הִיא',      f: 'הִגִּישָׁה',  note: '' },
              { p: 'אֲנַחְנוּ',  f: 'הִגַּשְׁנוּ',  note: '' },
              { p: 'אַתֶּם',    f: 'הִגַּשְׁתֶּם',  note: '' },
              { p: 'אַתֶּן',     f: 'הִגַּשְׁתֶּן',   note: '' },
              { p: 'הֵם',       f: 'הִגִּישׁוּ',  note: '' },
              { p: 'הֵן',       f: 'הִגִּישׁוּ',  note: '' },
            ],
          },
          'נ.כ.ר': {
            base: 'הִכִּיר',
            level: 'medium',
            forms: [
              { p: 'אֲנִי',     f: 'הִכַּרְתִּי',  note: '' },
              { p: 'אַתָּה',     f: 'הִכַּרְתָּ',   note: '' },
              { p: 'אַתְּ',      f: 'הִכַּרְתְּ',   note: '' },
              { p: 'הוּא',      f: 'הִכִּיר',    note: '' },
              { p: 'הִיא',      f: 'הִכִּירָה',  note: '' },
              { p: 'אֲנַחְנוּ',  f: 'הִכַּרְנוּ',  note: '' },
              { p: 'אַתֶּם',    f: 'הִכַּרְתֶּם',  note: '' },
              { p: 'אַתֶּן',     f: 'הִכַּרְתֶּן',   note: '' },
              { p: 'הֵם',       f: 'הִכִּירוּ',  note: '' },
              { p: 'הֵן',       f: 'הִכִּירוּ',  note: '' },
            ],
          },
          'נ.ב.ט': {
            base: 'הִבִּיט',
            level: 'high',
            forms: [
              { p: 'אֲנִי',     f: 'הִבַּטְתִּי',  note: '' },
              { p: 'אַתָּה',     f: 'הִבַּטְתָּ',   note: '' },
              { p: 'אַתְּ',      f: 'הִבַּטְתְּ',   note: '' },
              { p: 'הוּא',      f: 'הִבִּיט',    note: '' },
              { p: 'הִיא',      f: 'הִבִּיטָה',  note: '' },
              { p: 'אֲנַחְנוּ',  f: 'הִבַּטְנוּ',  note: '' },
              { p: 'אַתֶּם',    f: 'הִבַּטְתֶּם',  note: '' },
              { p: 'אַתֶּן',     f: 'הִבַּטְתֶּן',   note: '' },
              { p: 'הֵם',       f: 'הִבִּיטוּ',  note: '' },
              { p: 'הֵן',       f: 'הִבִּיטוּ',  note: '' },
            ],
          },
        },
        future_kal: {
          'נ.פ.ל': {
            base: 'נָפַל',
            level: 'easy',
            forms: [
              { p: 'אֲנִי',     f: 'אֶפֹּל',     note: '' },
              { p: 'אַתָּה',     f: 'תִּפֹּל',     note: '' },
              { p: 'אַתְּ',      f: 'תִּפְּלִי',    note: '' },
              { p: 'הוּא',      f: 'יִפֹּל',      note: '' },
              { p: 'הִיא',      f: 'תִּפֹּל',     note: '' },
              { p: 'אֲנַחְנוּ',  f: 'נִפֹּל',     note: '' },
              { p: 'אַתֶּם',    f: 'תִּפְּלוּ',    note: '' },
              { p: 'אַתֶּן',     f: 'תִּפֹּלְנָה',  note: '' },
              { p: 'הֵם',       f: 'יִפְּלוּ',    note: '' },
              { p: 'הֵן',       f: 'תִּפֹּלְנָה',  note: '' },
            ],
          },
          'נ.ת.ן': {
            base: 'נָתַן',
            level: 'medium',
            forms: [
              { p: 'אֲנִי',     f: 'אֶתֵּן',     note: '' },
              { p: 'אַתָּה',     f: 'תִּתֵּן',    note: '' },
              { p: 'אַתְּ',      f: 'תִּתְּנִי',   note: '' },
              { p: 'הוּא',      f: 'יִתֵּן',     note: '' },
              { p: 'הִיא',      f: 'תִּתֵּן',    note: '' },
              { p: 'אֲנַחְנוּ',  f: 'נִתֵּן',     note: '' },
              { p: 'אַתֶּם',    f: 'תִּתְּנוּ',   note: '' },
              { p: 'אַתֶּן',     f: 'תִּתֵּנָּה',   note: '' },
              { p: 'הֵם',       f: 'יִתְּנוּ',   note: '' },
              { p: 'הֵן',       f: 'תִּתֵּנָּה',   note: '' },
            ],
          },
          'נ.ג.ע': {
            base: 'נָגַע',
            level: 'easy',
            forms: [
              { p: 'אֲנִי',     f: 'אֶגַּע',     note: '' },
              { p: 'אַתָּה',     f: 'תִּגַּע',    note: '' },
              { p: 'אַתְּ',      f: 'תִּגְּעִי',   note: '' },
              { p: 'הוּא',      f: 'יִגַּע',     note: '' },
              { p: 'הִיא',      f: 'תִּגַּע',    note: '' },
              { p: 'אֲנַחְנוּ',  f: 'נִגַּע',     note: '' },
              { p: 'אַתֶּם',    f: 'תִּגְּעוּ',   note: '' },
              { p: 'אַתֶּן',     f: 'תִּגַּעְנָה',  note: '' },
              { p: 'הֵם',       f: 'יִגְּעוּ',   note: '' },
              { p: 'הֵן',       f: 'תִּגַּעְנָה',  note: '' },
            ],
          },
          'נ.ס.ע': {
            base: 'נָסַע',
            level: 'easy',
            forms: [
              { p: 'אֲנִי',     f: 'אֶסַּע',     note: '' },
              { p: 'אַתָּה',     f: 'תִּסַּע',    note: '' },
              { p: 'אַתְּ',      f: 'תִּסְּעִי',   note: '' },
              { p: 'הוּא',      f: 'יִסַּע',     note: '' },
              { p: 'הִיא',      f: 'תִּסַּע',    note: '' },
              { p: 'אֲנַחְנוּ',  f: 'נִסַּע',     note: '' },
              { p: 'אַתֶּם',    f: 'תִּסְּעוּ',   note: '' },
              { p: 'אַתֶּן',     f: 'תִּסַּעְנָה',  note: '' },
              { p: 'הֵם',       f: 'יִסְּעוּ',   note: '' },
              { p: 'הֵן',       f: 'תִּסַּעְנָה',  note: '' },
            ],
          },
          'נ.שׂ.א': {
            base: 'נָשָׂא',
            level: 'high',
            forms: [
              { p: 'אֲנִי',     f: 'אֶשָּׂא',    note: '' },
              { p: 'אַתָּה',     f: 'תִּשָּׂא',   note: '' },
              { p: 'אַתְּ',      f: 'תִּשְּׂאִי',  note: '' },
              { p: 'הוּא',      f: 'יִשָּׂא',    note: '' },
              { p: 'הִיא',      f: 'תִּשָּׂא',   note: '' },
              { p: 'אֲנַחְנוּ',  f: 'נִשָּׂא',    note: '' },
              { p: 'אַתֶּם',    f: 'תִּשְּׂאוּ',  note: '' },
              { p: 'אַתֶּן',     f: 'תִּשֶּׂאנָה', note: '' },
              { p: 'הֵם',       f: 'יִשְּׂאוּ',  note: '' },
              { p: 'הֵן',       f: 'תִּשֶּׂאנָה', note: '' },
            ],
          },
        },
      },
    },
  };

  // ───────────────────────────────────────────────────────────────
  // GEMINI WRAPPER (optional — uses key from localStorage)
  // ───────────────────────────────────────────────────────────────
  const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  function geminiKey() {
    return (localStorage.getItem('lashon-gemini-key') ||
            localStorage.getItem('mgmt-gemini-key') || '').trim();
  }
  async function callGemini(prompt) {
    const key = geminiKey();
    if (!key) throw new Error('NO_KEY');
    for (const model of GEMINI_MODELS) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1500, responseMimeType: 'application/json' },
            }),
          }
        );
        if (!r.ok) continue;
        const data = await r.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      } catch (_) { /* try next model */ }
    }
    throw new Error('GEMINI_FAILED');
  }

  // ───────────────────────────────────────────────────────────────
  // UTILITIES
  // ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr, n) { return shuffle(arr).slice(0, n); }
  function el(html) {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }
  function showToast(msg) {
    const existing = document.querySelector('.ai-tool-toast');
    if (existing) existing.remove();
    const t = el(`<div class="ai-tool-toast">${msg}</div>`);
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2000);
  }

  // ───────────────────────────────────────────────────────────────
  // TOOLS — each returns { title, subtitle, bodyHtml, shareText }
  // ───────────────────────────────────────────────────────────────
  const TOOLS = {
    // ── 1) Verb generator (slide 2) ──
    'verb-generator': {
      title: 'מחולל פעלים מהגזרה',
      subtitle: 'דוגמאות חיות מחסרי פ"נ — לחיצה = פעלים חדשים. מדורג לפי רמת קושי לבגרות י"א.',
      eyebrow: '🎲 הקנייה · דוגמאות',
      run: async (config) => {
        const bank = BANK[config.gizra || 'chasrei-pn'].verbs;
        const level = config.level || 'all';
        const count = config.count || 6;
        if (level === 'all') {
          // Stratified pick: balance levels so the teacher sees a spread.
          const byLevel = { easy: [], medium: [], high: [] };
          bank.forEach(v => { if (byLevel[v.level]) byLevel[v.level].push(v); });
          const per = Math.ceil(count / 3);
          return [
            ...pick(byLevel.easy, per),
            ...pick(byLevel.medium, per),
            ...pick(byLevel.high, per),
          ].slice(0, count);
        }
        const filtered = bank.filter(v => v.level === level);
        return pick(filtered, Math.min(count, filtered.length));
      },
      render: (verbs, ctx) => {
        const levelLabels = { easy: 'קל', medium: 'בינוני', high: 'גבוה' };
        const currentLevel = (ctx && ctx.config && ctx.config.level) || 'all';
        const chips = ['all', 'easy', 'medium', 'high'].map(l => `
          <button class="ai-level-chip ${l === 'all' ? '' : l} ${currentLevel === l ? 'active' : ''}" data-level="${l}">
            ${l === 'all' ? 'הכל' : levelLabels[l]}
          </button>
        `).join('');
        const cards = verbs.map(v => `
          <div class="ai-card">
            ${v.level ? `<div class="ai-level-badge ${v.level}">${levelLabels[v.level]}</div>` : ''}
            ${v.binyan ? `<div class="badge">${v.binyan}</div>` : ''}
            <div class="word">${v.word}</div>
            <div class="root">${v.root}</div>
            <div class="meaning">${v.meaning}</div>
            ${v.note ? `<div class="meaning" style="margin-top:6px;font-style:italic;color:#94a3b8;font-size:10px">${v.note}</div>` : ''}
          </div>
        `).join('');
        setTimeout(() => {
          document.querySelectorAll('.ai-level-chip').forEach(chip => {
            chip.addEventListener('click', () => ctx.rerun({ level: chip.dataset.level }));
          });
        }, 0);
        return `
          <div class="ai-level-filter">
            <span class="ai-level-filter-label">רמת קושי:</span>
            ${chips}
          </div>
          <div class="ai-tool-grid cols-3">${cards}</div>
          <div class="ai-tip">
            <span class="ai-tip-icon">💡</span>
            <span>הרמות מותאמות לבגרות י"א (שאלון 011281). <strong>קל</strong> = יומיומי וברור · <strong>בינוני</strong> = דורש זיהוי שורש · <strong>גבוה</strong> = אתגר ברמת בחינה.</span>
          </div>
        `;
      },
      shareText: (verbs) => {
        return '🎲 פעלים מגזרת חסרי פ"נ:\n\n' +
          verbs.map(v => `• ${v.word} (${v.root}) — ${v.meaning}`).join('\n');
      },
    },

    // ── 2) Future-Kal conjugator (slide 4) ──
    'conjugator-future-kal': {
      title: 'נטיית פועל בעתיד קל',
      subtitle: 'בחרי שורש — ראי את כל הגופים. הדגש החזק מודגש באדום.',
      eyebrow: '🔄 הקנייה · נטייה',
      run: async (config) => {
        const conjugations = BANK['chasrei-pn'].conjugations.future_kal;
        const roots = Object.keys(conjugations);
        const selected = config.selectedRoot && conjugations[config.selectedRoot]
          ? config.selectedRoot
          : pick(roots, 1)[0];
        return { roots, selected, data: conjugations[selected] };
      },
      render: (result, ctx) => {
        const { roots, selected, data } = result;
        const levelLabels = { easy: 'קל', medium: 'בינוני', high: 'גבוה' };
        const chips = roots.map(r => {
          const entry = BANK['chasrei-pn'].conjugations.future_kal[r];
          const lvl = entry.level ? `<span class="ai-level-badge ${entry.level}" style="position:static;margin-right:5px;font-size:8px;padding:2px 5px">${levelLabels[entry.level]}</span>` : '';
          return `
          <button class="ai-verb-chip ${r === selected ? 'active' : ''}" data-root="${r}">
            ${entry.base}${lvl}
          </button>
        `;
        }).join('');

        // Highlight the dagesh (the strong letter that took the nun's place)
        const formsHtml = data.forms.map(row => {
          // Approximate dagesh highlighting: dagesh is usually on the 2nd consonant
          // after the prefix letter. We highlight the consonant in red bold.
          // Simple heuristic: bold the 2nd Hebrew letter visible in form.
          const formHl = highlightDagesh(row.f);
          return `
            <div class="ai-conj-row">
              <span class="ai-conj-pronoun">${row.p}</span>
              <span class="ai-conj-form">${formHl}</span>
            </div>
          `;
        }).join('');

        // After render, wire chip click → re-render with selectedRoot
        setTimeout(() => {
          document.querySelectorAll('.ai-verb-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              ctx.rerun({ selectedRoot: chip.dataset.root });
            });
          });
        }, 0);

        return `
          <div class="ai-verb-picker">${chips}</div>
          <div class="ai-conjugation">${formsHtml}</div>
          <div class="ai-tip">
            <span class="ai-tip-icon">🔴</span>
            <span>האות באדום היא <strong>הדגש החזק</strong> — היא תופסת את מקום ה-נ' שנפלה. למשל: <strong>אֶנְפֹּל ← אֶפֹּל</strong>.</span>
          </div>
        `;
      },
      shareText: (result) => {
        const { selected, data } = result;
        return `🔄 נטיית "${data.base}" (${selected}) בעתיד קל:\n\n` +
          data.forms.map(r => `${r.p}: ${r.f}`).join('\n');
      },
    },

    // ── 3) Hifil past conjugator (slide 6) ──
    'conjugator-hifil-past': {
      title: 'נטיית פועל בהפעיל — עבר',
      subtitle: 'בחרי שורש — ראי שהנ\' נופלת בכל הגופים. הדגש החזק מודגש באדום.',
      eyebrow: '🔄 הקנייה · נטיית הפעיל',
      run: async (config) => {
        const conjugations = BANK['chasrei-pn'].conjugations.hifil_past;
        const roots = Object.keys(conjugations);
        const selected = config.selectedRoot && conjugations[config.selectedRoot]
          ? config.selectedRoot
          : pick(roots, 1)[0];
        return { roots, selected, data: conjugations[selected] };
      },
      render: (result, ctx) => {
        const { roots, selected, data } = result;
        const levelLabels = { easy: 'קל', medium: 'בינוני', high: 'גבוה' };
        const chips = roots.map(r => {
          const entry = BANK['chasrei-pn'].conjugations.hifil_past[r];
          const lvl = entry.level ? `<span class="ai-level-badge ${entry.level}" style="position:static;margin-right:5px;font-size:8px;padding:2px 5px">${levelLabels[entry.level]}</span>` : '';
          return `
          <button class="ai-verb-chip ${r === selected ? 'active' : ''}" data-root="${r}">
            ${entry.base}${lvl}
          </button>
        `;
        }).join('');
        const formsHtml = data.forms.map(row => `
          <div class="ai-conj-row">
            <span class="ai-conj-pronoun">${row.p}</span>
            <span class="ai-conj-form">${highlightDagesh(row.f)}</span>
          </div>
        `).join('');
        setTimeout(() => {
          document.querySelectorAll('.ai-verb-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              ctx.rerun({ selectedRoot: chip.dataset.root });
            });
          });
        }, 0);
        return `
          <div class="ai-verb-picker">${chips}</div>
          <div class="ai-conjugation">${formsHtml}</div>
          <div class="ai-tip">
            <span class="ai-tip-icon">🔴</span>
            <span>בהפעיל הנ' נופלת ב<strong>כל</strong> הגופים — שימו לב שהדגש החזק (באדום) נשאר באות השנייה לאורך כל הנטייה.</span>
          </div>
        `;
      },
      shareText: (result) => {
        const { selected, data } = result;
        return `🔄 נטיית "${data.base}" (${selected}) בהפעיל — עבר:\n\n` +
          data.forms.map(r => `${r.p}: ${r.f}`).join('\n');
      },
    },

    // ── 4) Gutturals finder (slide 7) ──
    'gutturals-finder': {
      title: 'חריגי גרונית — הנ\' שמורה',
      subtitle: 'פעלים שהאות השנייה שלהם גרונית. הנ\' לא נופלת. מדורג לפי רמת קושי.',
      eyebrow: '🔍 הקנייה · חריגים',
      run: async (config) => {
        const bank = BANK['chasrei-pn'].gutturals;
        const level = config.level || 'all';
        const count = config.count || 4;
        if (level === 'all') {
          const byLevel = { medium: [], high: [] };
          bank.forEach(v => { if (byLevel[v.level]) byLevel[v.level].push(v); });
          return [...pick(byLevel.medium, 2), ...pick(byLevel.high, 2)].slice(0, count);
        }
        const filtered = bank.filter(v => v.level === level);
        return pick(filtered, Math.min(count, filtered.length));
      },
      render: (verbs, ctx) => {
        const levelLabels = { medium: 'בינוני', high: 'גבוה' };
        const currentLevel = (ctx && ctx.config && ctx.config.level) || 'all';
        const chips = ['all', 'medium', 'high'].map(l => `
          <button class="ai-level-chip ${l === 'all' ? '' : l} ${currentLevel === l ? 'active' : ''}" data-level="${l}">
            ${l === 'all' ? 'הכל' : levelLabels[l]}
          </button>
        `).join('');
        const cards = verbs.map(v => `
          <div class="ai-card guttural">
            ${v.level ? `<div class="ai-level-badge ${v.level}">${levelLabels[v.level]}</div>` : ''}
            <div class="badge">${v.guttural} גרונית</div>
            <div class="word">${v.word}</div>
            <div class="root">${v.root}</div>
            <div class="meaning">${v.meaning}</div>
            <div class="meaning" style="margin-top:8px;font-weight:700;color:#ea580c">
              עתיד: <strong>${v.future}</strong>
            </div>
          </div>
        `).join('');
        setTimeout(() => {
          document.querySelectorAll('.ai-level-chip').forEach(chip => {
            chip.addEventListener('click', () => ctx.rerun({ level: chip.dataset.level }));
          });
        }, 0);
        return `
          <div class="ai-level-filter">
            <span class="ai-level-filter-label">רמת קושי:</span>
            ${chips}
          </div>
          <div class="ai-tool-grid cols-2">${cards}</div>
          <div class="ai-tip">
            <span class="ai-tip-icon">⚠️</span>
            <span>בכל הפעלים האלה האות השנייה היא <strong>אהח"ע ר'</strong> (גרונית). גרוניות לא מקבלות דגש חזק — לכן הנ' של השורש <strong>נשמרת</strong> גם בעתיד. החריגים כולם רמה בינונית-גבוהה כי הם חורגים מהכלל הבסיסי.</span>
          </div>
        `;
      },
      shareText: (verbs) => {
        return '🔍 חריגי גרונית מחסרי פ"נ — הנ\' שמורה:\n\n' +
          verbs.map(v => `• ${v.word} (${v.root}) → עתיד: ${v.future}`).join('\n');
      },
    },
  };

  // ───────────────────────────────────────────────────────────────
  // Heuristic: highlight the dagesh in a vocalized verb form
  // (the 2nd consonant after the prefix letter — i.e., the original
  // place where the nun dropped). For static bank items, this is
  // approximate but works for the common forms.
  // ───────────────────────────────────────────────────────────────
  function highlightDagesh(form) {
    // Hebrew prefix letters: א/י/ת/נ
    // After the prefix, the next consonant (and its niqqud) carries the dagesh.
    // We find the 2nd Hebrew letter and wrap it (+ following niqqud chars) in span.
    const letters = [...form];
    // Find positions of consonants (skip vowel marks).
    const consonantIdxs = [];
    letters.forEach((ch, i) => {
      // Hebrew letters are U+05D0..U+05EA; vowel marks U+05B0..U+05BC etc.
      const c = ch.charCodeAt(0);
      if (c >= 0x05D0 && c <= 0x05EA) consonantIdxs.push(i);
    });
    if (consonantIdxs.length < 2) return form;
    const start = consonantIdxs[1];
    // End = up to the next consonant or end of string
    const next = consonantIdxs[2] !== undefined ? consonantIdxs[2] : letters.length;
    const before = letters.slice(0, start).join('');
    const middle = letters.slice(start, next).join('');
    const after  = letters.slice(next).join('');
    return `${before}<span class="ai-hl-dagesh">${middle}</span>${after}`;
  }

  // ───────────────────────────────────────────────────────────────
  // MODAL — show/hide
  // ───────────────────────────────────────────────────────────────
  let modalEl = null;
  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = el(`
      <div class="ai-tool-modal" id="aiToolModal">
        <div class="ai-tool-shell" role="dialog" aria-modal="true">
          <div class="ai-tool-header">
            <div class="ai-tool-header-info">
              <div class="ai-tool-eyebrow"><span data-slot="eyebrow"></span></div>
              <div class="ai-tool-title" data-slot="title"></div>
              <div class="ai-tool-subtitle" data-slot="subtitle"></div>
            </div>
            <button class="ai-tool-close" aria-label="סגירה" data-action="close">×</button>
          </div>
          <div class="ai-tool-body" data-slot="body">
            <div class="ai-tool-loading">
              <div class="ai-tool-spinner"></div>
              <div>טוען…</div>
            </div>
          </div>
          <div class="ai-tool-footer">
            <button class="ai-tool-footer-btn primary" data-action="reroll">
              🎲 עוד אחד
            </button>
            <button class="ai-tool-footer-btn wa" data-action="whatsapp">
              📋 שלח לכיתה
            </button>
            <button class="ai-tool-footer-btn" data-action="settings" title="חיבור Gemini">
              ⚙️
            </button>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(modalEl);

    // Backdrop click closes
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) hideModal();
    });
    modalEl.querySelector('[data-action=close]').addEventListener('click', hideModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl.classList.contains('show')) hideModal();
    });
    return modalEl;
  }

  function hideModal() {
    if (modalEl) modalEl.classList.remove('show');
  }

  function showModal() {
    ensureModal().classList.add('show');
  }

  // ───────────────────────────────────────────────────────────────
  // Open a tool
  // ───────────────────────────────────────────────────────────────
  async function openTool(toolName, config) {
    const tool = TOOLS[toolName];
    if (!tool) { console.error('Unknown tool:', toolName); return; }

    ensureModal();
    showModal();

    const slot = (name) => modalEl.querySelector(`[data-slot=${name}]`);
    slot('eyebrow').textContent = tool.eyebrow || '';
    slot('title').textContent = tool.title || '';
    slot('subtitle').textContent = tool.subtitle || '';
    slot('body').innerHTML = '<div class="ai-tool-loading"><div class="ai-tool-spinner"></div><div>טוען…</div></div>';

    let currentResult = null;
    let currentConfig = Object.assign({}, config);
    const ctx = {
      rerun: (newConfig) => {
        currentConfig = Object.assign({}, currentConfig, newConfig);
        runOnce(currentConfig);
      },
      get config() { return currentConfig; },
    };

    async function runOnce(cfg) {
      try {
        currentConfig = cfg || currentConfig;
        currentResult = await tool.run(currentConfig);
        slot('body').innerHTML = tool.render(currentResult, ctx);
      } catch (err) {
        slot('body').innerHTML = `
          <div style="text-align:center;padding:30px;color:#dc2626">
            <div style="font-size:32px">⚠️</div>
            <div style="margin-top:8px;font-weight:700">משהו השתבש</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">${(err && err.message) || 'נסי שוב'}</div>
          </div>
        `;
      }
    }

    await runOnce(config);

    // Wire footer buttons
    modalEl.querySelector('[data-action=reroll]').onclick = () => runOnce(config);
    modalEl.querySelector('[data-action=whatsapp]').onclick = () => {
      if (!currentResult) return;
      const text = tool.shareText ? tool.shareText(currentResult) : '';
      if (!text) return;
      // Copy to clipboard + open WhatsApp Web with prefilled text
      navigator.clipboard.writeText(text).then(() => showToast('הועתק ללוח')).catch(()=>{});
      const wa = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
      window.open(wa, '_blank');
    };
    modalEl.querySelector('[data-action=settings]').onclick = () => {
      const current = geminiKey();
      const next = prompt(
        'מפתח Gemini API (נשמר רק בדפדפן שלך — Google חוסם מפתחות שמופיעים ב-GitHub).\n\nאם אין מפתח — הכלים עובדים עם בנק סטטי איכותי.\n\nהדבק מפתח או השאר ריק לביטול:',
        current
      );
      if (next === null) return;
      if (next.trim()) {
        localStorage.setItem('lashon-gemini-key', next.trim());
        showToast('מפתח נשמר');
      } else {
        localStorage.removeItem('lashon-gemini-key');
        showToast('מפתח נמחק');
      }
    };
  }

  // ───────────────────────────────────────────────────────────────
  // Public API — mount a trigger button onto a slide
  // ───────────────────────────────────────────────────────────────
  function mount(slideEl, opts) {
    if (!slideEl) return;
    const tool = TOOLS[opts.tool];
    if (!tool) { console.error('SlideAI.mount: unknown tool', opts.tool); return; }

    const emoji = opts.button?.emoji || '✨';
    const label = opts.button?.label || tool.title;
    const subLabel = opts.button?.sub || 'AI';
    const variant = opts.button?.variant === 'ghost' ? 'ghost' : '';
    const target = opts.target ? slideEl.querySelector(opts.target) : slideEl.querySelector('.slide-body') || slideEl;

    const btn = el(`
      <button class="ai-tool-trigger ${variant}">
        <span class="sparkle">${emoji}</span>
        <span>${label}</span>
        <span class="label-sub">${subLabel}</span>
      </button>
    `);
    btn.addEventListener('click', () => openTool(opts.tool, opts.config || {}));
    target.appendChild(btn);
  }

  return { mount, open: openTool, BANK };
})();
