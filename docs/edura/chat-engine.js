/**
 * Edura · Chat Engine
 * ─────────────────────────────────────────────────────────────────
 * Wizard מבוסס כפתורים + טקסט חופשי (Gemini proxy).
 * משתמש ב-jobs.json — 440 משרות אמיתיות מ-shatil/itu/igm.
 *
 * שימוש:
 *   const chat = new EduraChat(rootElement);
 *   chat.start();
 */

window.EDURA_JOBS_URL = 'data/jobs.json';
window.EDURA_API_URL = 'https://script.google.com/macros/s/AKfycbxFqT828xAhAAhe9mJ6h55Kt9i6zKjcRZBscMYjrPkUV1BUuKhqT_n7ZLqC7cNZs7wR-Q/exec';

(function () {
  'use strict';

  const REGIONS = ['ירושלים', 'מרכז', 'צפון', 'דרום', 'שפלה'];
  const ROLES = ['מורה', 'מחנך/ת', 'רכז/ת', 'יועץ/ת', 'מנהל/ת'];
  const SUBJECTS = ['מתמטיקה', 'אנגלית', 'עברית', 'תנ"ך', 'היסטוריה', 'אזרחות',
                    'פיזיקה', 'כימיה', 'ביולוגיה', 'מחשבים', 'מדעים', 'ספורט',
                    'אומנות', 'מוזיקה', 'ערבית', 'לשון', 'ספרות', 'חינוך מיוחד'];
  const LEVELS = ['יסודי', 'חטיבת ביניים', 'תיכון'];

  // טיפול בשגיאות כתיב נפוצות בדאטה ("מתימטיקה" → "מתמטיקה")
  const SUBJECT_ALIASES = {
    'מתימטיקה': 'מתמטיקה',
    'מתמט': 'מתמטיקה',
    'מתמטיק': 'מתמטיקה',
    'אנגל': 'אנגלית',
    'תנך': 'תנ"ך',
    'חט"ב': 'חטיבת ביניים'
  };
  function normalizeText(s) {
    s = String(s || '').trim();
    return SUBJECT_ALIASES[s] || s;
  }

  const STORAGE_KEY = 'edura.chat.state.v1';
  const SAVED_KEY = 'edura.chat.saved.v1';

  class EduraChat {
    constructor(root) {
      this.root = root;
      this.allJobs = [];
      this.filters = { region: '', role: '', subject: '', level: '', scope: '' };
      this.shownCount = 0;
      this.state = 'init';
    }

    async start() {
      this.render();
      this.botMsg('שלום! אני עוזר/ת למצוא משרת הוראה.');
      this.setStatus('טוען משרות...');
      try {
        const res = await fetch(window.EDURA_JOBS_URL);
        const data = await res.json();
        this.allJobs = (data.jobs || []).map(j => ({
          ...j,
          subject: normalizeText(j.subject),
          level: normalizeText(j.level)
        }));
        this.setStatus('');
        this.botMsg('יש ' + this.allJobs.length + ' משרות פתוחות עכשיו. בואו נמצא לך את המתאימה.');
        this.askMode();
      } catch (err) {
        this.setStatus('');
        this.botMsg('בעיה זמנית בטעינה. נסו לרענן.');
        console.error(err);
      }
    }

    askMode() {
      this.botMsg('איך נוח לך לחפש?', [
        { label: 'בחר/י מהרשימה', onClick: () => this.askRegion() },
        { label: 'אכתוב בעצמי', onClick: () => this.askFreeText() }
      ]);
    }

    askFreeText() {
      this.botMsg('מצוין. תתאר/י במשפט אחד מה את/ה מחפש/ת — אזור, תפקיד, מקצוע, שכבה. למשל: "מורה למתמטיקה בירושלים תיכון".');
      this.showInput((text) => this.handleFreeText(text));
    }

    async handleFreeText(text) {
      this.userMsg(text);
      this.setStatus('מנתח/ת...');
      try {
        const res = await fetch(window.EDURA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'parse', text: text })
        });
        const data = await res.json();
        this.setStatus('');
        if (data.ok && data.filters) {
          Object.assign(this.filters, data.filters);
          const summary = this.summarizeFilters();
          this.botMsg('הבנתי: ' + (summary || 'לא הצלחתי לזהות פרטים — בואו ננסה אחרת.'));
          if (!summary) { this.askRegion(); return; }
          this.botMsg('רוצה לחדד עוד פרט או לראות את ההתאמות?', [
            { label: 'הראה משרות', onClick: () => this.showResults() },
            { label: 'אזור', onClick: () => this.askRegion() },
            { label: 'תפקיד', onClick: () => this.askRole() },
            { label: 'מקצוע', onClick: () => this.askSubject() },
            { label: 'שכבה', onClick: () => this.askLevel() }
          ]);
        } else {
          this.botMsg('לא הצלחתי לפענח. בואו נעבור על זה ביחד:');
          this.askRegion();
        }
      } catch (err) {
        this.setStatus('');
        this.botMsg('בעיה זמנית. נמשיך עם הרשימה:');
        this.askRegion();
        console.error(err);
      }
    }

    askRegion() {
      this.botMsg('באיזה אזור?', [
        ...REGIONS.map(r => ({ label: r, onClick: () => this.setAndNext('region', r, 'askRole') })),
        { label: 'גמיש', onClick: () => this.setAndNext('region', '', 'askRole') }
      ]);
    }

    askRole() {
      this.botMsg('איזה תפקיד?', [
        ...ROLES.map(r => ({ label: r, onClick: () => this.setAndNext('role', r, this.needsSubject_(r) ? 'askSubject' : 'askLevel') })),
        { label: 'גמיש', onClick: () => this.setAndNext('role', '', 'askLevel') }
      ]);
    }

    askSubject() {
      const opts = SUBJECTS.map(s => ({ label: s, onClick: () => this.setAndNext('subject', s, 'askLevel') }));
      opts.push({ label: 'אחר / גמיש', onClick: () => this.setAndNext('subject', '', 'askLevel') });
      this.botMsg('איזה מקצוע?', opts);
    }

    askLevel() {
      this.botMsg('איזה שכבה?', [
        { label: 'יסודי', onClick: () => this.setAndNext('level', 'יסודי', 'showResults') },
        { label: 'חט"ב', onClick: () => this.setAndNext('level', 'חטיבת ביניים', 'showResults') },
        { label: 'תיכון', onClick: () => this.setAndNext('level', 'תיכון', 'showResults') },
        { label: 'גמיש', onClick: () => this.setAndNext('level', '', 'showResults') }
      ]);
    }

    needsSubject_(role) {
      return role === 'מורה' || role === 'מחנך/ת';
    }

    setAndNext(key, value, nextFn) {
      this.filters[key] = value;
      this.userMsg(value || 'גמיש');
      this.persist();
      if (typeof this[nextFn] === 'function') this[nextFn]();
    }

    showResults() {
      const matches = this.matchJobs();
      this.shownCount = 0;
      const summary = this.summarizeFilters();
      this.botMsg('מצאתי ' + matches.length + ' משרות רלוונטיות' + (summary ? ' עבור: ' + summary : '') + '.');
      if (matches.length === 0) {
        this.botMsg('אין התאמה. הרבה משרות מגיעות עם פרטים חלקיים — בואו נרכך סינון:', [
          { label: 'בלי אזור', onClick: () => { this.filters.region = ''; this.showResults(); } },
          { label: 'בלי מקצוע', onClick: () => { this.filters.subject = ''; this.showResults(); } },
          { label: 'בלי שכבה', onClick: () => { this.filters.level = ''; this.showResults(); } },
          { label: 'התחל מחדש', onClick: () => this.reset() }
        ]);
        return;
      }
      if (matches.length <= 3) {
        this.botMsg('מציין שלחלק מהמשרות חסרים פרטים מלאים — אם משהו לא רלוונטי, פתחי וקראי במקור.');
      }
      this.showNextBatch(matches);
    }

    showNextBatch(matches) {
      const batch = matches.slice(this.shownCount, this.shownCount + 3);
      batch.forEach(j => this.jobCard(j));
      this.shownCount += batch.length;
      const remaining = matches.length - this.shownCount;
      const actions = [];
      if (remaining > 0) actions.push({ label: 'הראה ' + Math.min(3, remaining) + ' נוספות', onClick: () => this.showNextBatch(matches) });
      actions.push({ label: 'שנה סינון', onClick: () => this.askMode() });
      actions.push({ label: 'התחל מחדש', onClick: () => this.reset() });
      this.botMsg(remaining > 0 ? 'רוצה לראות עוד?' : 'אלה כל ההתאמות.', actions);
    }

    matchJobs() {
      // סינון רך עם ניקוד. במקום AND קשיח — כל משרה מקבלת score.
      // מטה-דאטה דלילה (חסר אזור/שכבה) לא פוסל — נותן הזדמנות עם ניקוד נייטרלי.
      // ההגיון: עדיף להראות התאמות חלקיות מאשר רשימה ריקה.
      const f = this.filters;
      // משקלים: התאמה מאומתת > דאטה חסרה > סתירה
      // קריטי שדאטה חסרה לא תקפוץ מעל התאמה אמיתית.
      // הדאטה החדשה: subject/level הם strings (לא arrays), יש city/sub_area/contact
      const scored = this.allJobs.map(j => {
        let score = 0;
        let blocker = false;
        let exactMatches = 0;

        if (f.region) {
          if (j.region === f.region) { score += 100; exactMatches++; }
          else if (!j.region || j.region === 'ארצי') score += 5;
        }

        if (f.subject) {
          const sub = normalizeText(j.subject);
          if (sub === f.subject) { score += 80; exactMatches++; }
          else if (!sub || sub === 'מורה' || sub === 'אחר') score += 5;
          else blocker = true;
        }

        if (f.level) {
          const lvl = normalizeText(j.level);
          if (lvl === f.level) { score += 40; exactMatches++; }
          else if (!lvl || lvl === '(לא זוהה)') score += 3;
        }

        if (f.role) {
          const role = j.role || '';
          const roleBase = f.role.replace('/ת', '');
          if (role.includes(roleBase)) { score += 50; exactMatches++; }
          else if (!role || role === 'אחר') score += 5;
        }

        // טריות לפי date_iso
        if (j.date_iso) {
          const days = (Date.now() - new Date(j.date_iso)) / 86400000;
          if (days < 7) score += 5;
          else if (days < 30) score += 2;
        }

        return { job: j, score: score, blocker: blocker, exactMatches: exactMatches };
      });

      const hasAnyFilter = !!(f.region || f.level || f.subject || f.role);
      // דרישת מינימום: לפחות 1 התאמה מאומתת אמיתית (לא רק דאטה חסרה)
      const filtered = scored
        .filter(s => !s.blocker)
        .filter(s => !hasAnyFilter || s.exactMatches >= 1)
        .sort((a, b) => b.exactMatches - a.exactMatches || b.score - a.score);

      return filtered.map(s => s.job);
    }

    summarizeFilters() {
      const f = this.filters;
      const parts = [];
      if (f.role) parts.push(f.role);
      if (f.subject) parts.push(f.subject);
      if (f.level) parts.push(f.level);
      if (f.region) parts.push('ב' + f.region);
      if (f.scope) parts.push('משרה ' + f.scope);
      return parts.join(' · ');
    }

    reset() {
      this.filters = { region: '', role: '', subject: '', level: '', scope: '' };
      this.shownCount = 0;
      this.persist();
      this.askMode();
    }

    persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.filters)); } catch (e) {}
    }

    saveJob(job) {
      try {
        const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
        const key = job.id || (job.school + job.email);
        if (!saved.find(s => s.id === key)) {
          saved.unshift({
            id: key,
            title: job.school || job.title || '',
            email: job.email || '',
            phone: job.phone || '',
            sourceName: job.source_name || job.source || '',
            savedAt: Date.now()
          });
          localStorage.setItem(SAVED_KEY, JSON.stringify(saved.slice(0, 50)));
        }
      } catch (e) {}
    }

    // ─── UI helpers ───────────────────────────────────────────
    render() {
      this.root.innerHTML = '' +
        '<div class="ec-stream" id="ec-stream"></div>' +
        '<div class="ec-status" id="ec-status"></div>' +
        '<div class="ec-input-row" id="ec-input-row" hidden>' +
          '<input type="text" id="ec-input" placeholder="כתוב/י כאן..." autocomplete="off" />' +
          '<button id="ec-send" class="ec-send-btn" type="button">שלח</button>' +
        '</div>';
      this.stream = this.root.querySelector('#ec-stream');
      this.statusEl = this.root.querySelector('#ec-status');
      this.inputRow = this.root.querySelector('#ec-input-row');
      this.inputEl = this.root.querySelector('#ec-input');
      this.sendBtn = this.root.querySelector('#ec-send');
    }

    botMsg(text, actions) {
      const wrap = document.createElement('div');
      wrap.className = 'ec-msg ec-msg-bot';
      const bubble = document.createElement('div');
      bubble.className = 'ec-bubble';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      if (actions && actions.length) {
        const actRow = document.createElement('div');
        actRow.className = 'ec-actions';
        actions.forEach(a => {
          const btn = document.createElement('button');
          btn.className = 'ec-action';
          btn.type = 'button';
          btn.textContent = a.label;
          btn.addEventListener('click', () => {
            actRow.querySelectorAll('button').forEach(b => b.disabled = true);
            a.onClick();
          });
          actRow.appendChild(btn);
        });
        wrap.appendChild(actRow);
      }
      this.stream.appendChild(wrap);
      this.scrollDown();
    }

    userMsg(text) {
      const wrap = document.createElement('div');
      wrap.className = 'ec-msg ec-msg-user';
      const bubble = document.createElement('div');
      bubble.className = 'ec-bubble';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      this.stream.appendChild(wrap);
      this.scrollDown();
    }

    jobCard(j) {
      const card = document.createElement('div');
      card.className = 'ec-msg ec-msg-bot';
      const cityArea = [j.city, j.sub_area].filter(Boolean).join(' · ');
      const region = j.region ? '<span class="ec-tag">' + esc(j.region) + (cityArea ? ' · ' + esc(cityArea) : '') + '</span>' :
                                (cityArea ? '<span class="ec-tag">' + esc(cityArea) + '</span>' : '');
      const role = j.role ? '<span class="ec-tag">' + esc(j.role) + '</span>' : '';
      const lvl = j.level && j.level !== '(לא זוהה)' ? '<span class="ec-tag">' + esc(j.level) + '</span>' : '';
      const subj = j.subject ? '<span class="ec-tag">' + esc(j.subject) + '</span>' : '';
      const scope = j.scope ? '<span class="ec-tag">' + esc(j.scope) + '</span>' : '';
      const dateStr = j.date ? '<span class="ec-job-date">' + esc(j.date) + '</span>' : '';

      // CTA חכם: עדיפות למייל, אז טלפון, אז קישור
      let cta = '';
      if (j.email) {
        const mailSubj = encodeURIComponent('פנייה דרך אדורה — ' + (j.school || j.title || ''));
        cta = '<a class="ec-job-cta" href="mailto:' + esc(j.email) + '?subject=' + mailSubj + '">שלחו מייל ←</a>';
      } else if (j.phone) {
        cta = '<a class="ec-job-cta" href="tel:' + esc(j.phone.replace(/\s+/g,'')) + '">חייגו ' + esc(j.phone) + '</a>';
      } else if (j.url) {
        cta = '<a class="ec-job-cta" href="' + esc(j.url) + '" target="_blank" rel="noopener">פתחו במקור ←</a>';
      } else {
        cta = '<span class="ec-job-cta" style="opacity:.5;cursor:default">פרטי קשר חסרים</span>';
      }

      const contact = j.contact_name ? '<div class="ec-job-contact">איש קשר: ' + esc(j.contact_name) + '</div>' : '';
      const phone = j.phone && j.email ? '<div class="ec-job-contact">טלפון: <a href="tel:' + esc(j.phone.replace(/\s+/g,'')) + '">' + esc(j.phone) + '</a></div>' : '';

      card.innerHTML =
        '<div class="ec-job-card">' +
          '<div class="ec-job-source">' + esc(j.source_name || j.source || '') + (dateStr ? ' · ' + dateStr : '') + '</div>' +
          '<h4 class="ec-job-title">' + esc(j.school || j.title || '') + '</h4>' +
          '<div class="ec-job-tags">' + region + role + subj + lvl + scope + '</div>' +
          (j.snippet ? '<p class="ec-job-snippet">' + esc(String(j.snippet).slice(0, 220)) + '</p>' : '') +
          contact + phone +
          '<div class="ec-job-actions">' +
            cta +
            '<button class="ec-job-save" type="button">שמור</button>' +
          '</div>' +
        '</div>';
      const saveBtn = card.querySelector('.ec-job-save');
      saveBtn.addEventListener('click', () => {
        this.saveJob(j);
        saveBtn.textContent = 'נשמר';
        saveBtn.disabled = true;
      });
      this.stream.appendChild(card);
      this.scrollDown();
    }

    showInput(handler) {
      this.inputRow.hidden = false;
      this.inputEl.focus();
      const submit = () => {
        const v = this.inputEl.value.trim();
        if (!v) return;
        this.inputEl.value = '';
        this.inputRow.hidden = true;
        handler(v);
      };
      this.sendBtn.onclick = submit;
      this.inputEl.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
    }

    setStatus(text) {
      this.statusEl.textContent = text || '';
      this.statusEl.style.display = text ? 'block' : 'none';
    }

    scrollDown() {
      requestAnimationFrame(() => {
        this.stream.scrollTop = this.stream.scrollHeight;
      });
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  window.EduraChat = EduraChat;
})();
