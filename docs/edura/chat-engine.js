/**
 * Edura · Chat Engine
 * ─────────────────────────────────────────────────────────────────
 * Wizard מבוסס כפתורים + טקסט חופשי (Gemini proxy).
 * משתמש ב-API_URL של Apps Script — אותו endpoint של האתר הראשי.
 *
 * שימוש:
 *   const chat = new EduraChat(rootElement);
 *   chat.start();
 */

window.EDURA_API_URL = 'https://script.google.com/macros/s/AKfycbxFqT828xAhAAhe9mJ6h55Kt9i6zKjcRZBscMYjrPkUV1BUuKhqT_n7ZLqC7cNZs7wR-Q/exec';

(function () {
  'use strict';

  const REGIONS = ['ירושלים', 'מרכז', 'צפון', 'דרום', 'שפלה'];
  const ROLES = ['מורה', 'מחנך/ת', 'רכז/ת', 'יועץ/ת', 'מנהל/ת'];
  const SUBJECTS = ['מתמטיקה', 'אנגלית', 'עברית', 'תנ"ך', 'היסטוריה', 'אזרחות',
                    'פיזיקה', 'כימיה', 'ביולוגיה', 'מחשבים', 'מדעים', 'ספורט',
                    'אומנות', 'מוזיקה', 'ערבית'];
  const LEVELS = ['יסודי', 'חט"ב', 'תיכון'];

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
      this.botMsg('שלום! 👋 אני עוזר/ת למצוא משרת הוראה.');
      this.setStatus('טוען משרות...');
      try {
        const res = await fetch(window.EDURA_API_URL);
        const data = await res.json();
        this.allJobs = (data.jobs || []).filter(j => j.title && j.url);
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
        ...LEVELS.map(l => ({ label: l, onClick: () => this.setAndNext('level', l, 'showResults') })),
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
      this.botMsg('מצאתי ' + matches.length + ' משרות' + (summary ? ' עבור: ' + summary : '') + '.');
      if (matches.length === 0) {
        this.botMsg('אין התאמה מדויקת. רוצה לרכך סינון?', [
          { label: 'בלי אזור', onClick: () => { this.filters.region = ''; this.showResults(); } },
          { label: 'בלי מקצוע', onClick: () => { this.filters.subject = ''; this.showResults(); } },
          { label: 'התחל מחדש', onClick: () => this.reset() }
        ]);
        return;
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
      const f = this.filters;
      return this.allJobs.filter(j => {
        if (f.region && j.region !== f.region) return false;
        if (f.level && !(j.levels || []).includes(f.level)) return false;
        if (f.subject && !(j.subjects || []).includes(f.subject)) return false;
        if (f.role && !(j.role || '').includes(f.role.replace('/ת', ''))) return false;
        return true;
      }).sort((a, b) => new Date(b.firstSeen || 0) - new Date(a.firstSeen || 0));
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
        if (!saved.find(s => s.url === job.url)) {
          saved.unshift({ url: job.url, title: job.title, sourceName: job.sourceName, savedAt: Date.now() });
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
      const region = j.region ? '<span class="ec-tag">' + esc(j.region) + '</span>' : '';
      const role = j.role ? '<span class="ec-tag">' + esc(String(j.role).split(',')[0]) + '</span>' : '';
      const lvl = (j.levels || [])[0] ? '<span class="ec-tag">' + esc(j.levels[0]) + '</span>' : '';
      const subj = (j.subjects || [])[0] ? '<span class="ec-tag">' + esc(j.subjects[0]) + '</span>' : '';
      card.innerHTML =
        '<div class="ec-job-card">' +
          '<div class="ec-job-source">' + esc(j.sourceName || '') + '</div>' +
          '<h4 class="ec-job-title">' + esc(j.title) + '</h4>' +
          '<div class="ec-job-tags">' + region + role + lvl + subj + '</div>' +
          (j.snippet ? '<p class="ec-job-snippet">' + esc(String(j.snippet).slice(0, 180)) + '</p>' : '') +
          '<div class="ec-job-actions">' +
            '<a class="ec-job-cta" href="' + esc(j.url) + '" target="_blank" rel="noopener">פנו עכשיו ←</a>' +
            '<button class="ec-job-save" type="button" data-url="' + esc(j.url) + '">שמור</button>' +
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
