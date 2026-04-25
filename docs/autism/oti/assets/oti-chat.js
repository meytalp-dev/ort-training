/* אוטי — צ'אט בוט
   טוען מצב bubble (ברירת מחדל) או inline (אם יש אלמנט #oti-chat-inline בדף).
*/
(function () {
  'use strict';

  const WORKER_URL = 'https://oti-llm-proxy.meytalp.workers.dev/';
  const STORAGE_KEY = 'oti-chat-history-v1';
  const WELCOME = 'היי, אני אוטי.\n\nאני פה לעזור לך למצוא מענה מתאים מהמאגר — בלי להעמיס, בלי להלחיץ.\n\nרוצה לספר לי קצת מה מצב? (גיל, איפה אתם גרים, מה הכי בוער עכשיו)';
  const inlineHost = document.getElementById('oti-chat-inline');
  const isInline = !!inlineHost;

  // ----- סגנון משותף -----
  const css = `
    .otichat-fab {
      position: fixed; inset-block-end: 22px; inset-inline-end: 22px;
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(135deg, #E8896A 0%, #C56A4E 100%);
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 8px 22px rgba(197,106,78,0.38), 0 2px 6px rgba(0,0,0,0.08);
      display: flex; align-items: center; justify-content: center;
      z-index: 9998; transition: transform 0.18s ease, box-shadow 0.18s ease;
      animation: otichat-pulse 2.6s ease-in-out infinite;
    }
    .otichat-fab:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 14px 32px rgba(197,106,78,0.5); }
    .otichat-fab svg { width: 28px; height: 28px; }
    .otichat-fab .badge {
      position: absolute; top: -2px; inset-inline-end: -2px;
      background: #fff; color: #C56A4E;
      width: 22px; height: 22px; border-radius: 50%;
      font-size: 13px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      font-family: 'Heebo', sans-serif;
    }
    @keyframes otichat-pulse {
      0%, 100% { box-shadow: 0 8px 22px rgba(197,106,78,0.38), 0 0 0 0 rgba(232,137,106,0.5); }
      50% { box-shadow: 0 8px 22px rgba(197,106,78,0.38), 0 0 0 14px rgba(232,137,106,0); }
    }

    .otichat-panel {
      position: fixed; inset-block-end: 100px; inset-inline-end: 22px;
      width: 380px; max-width: calc(100vw - 28px);
      height: 580px; max-height: calc(100vh - 130px);
      background: #FBF7F0; border-radius: 22px;
      box-shadow: 0 24px 60px rgba(60,40,25,0.22), 0 4px 14px rgba(0,0,0,0.06);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 9999; border: 1px solid #E5D9C8;
      transform-origin: bottom right;
      animation: otichat-pop 0.22s ease-out;
    }
    .otichat-panel.open { display: flex; }
    @keyframes otichat-pop {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .otichat-inline {
      width: 100%; height: 70vh; min-height: 500px;
      background: #FBF7F0; border-radius: 22px;
      box-shadow: 0 8px 28px rgba(60,40,25,0.10);
      display: flex; flex-direction: column; overflow: hidden;
      border: 1px solid #E5D9C8;
    }

    .otichat-header {
      padding: 14px 18px;
      background: linear-gradient(135deg, #E8896A 0%, #C56A4E 100%);
      color: #fff; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .otichat-header .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .otichat-header .meta { flex: 1; line-height: 1.2; }
    .otichat-header .name { font-weight: 700; font-size: 16px; font-family: 'Heebo', sans-serif; }
    .otichat-header .status { font-size: 12px; opacity: 0.9; }
    .otichat-header .status::before {
      content: ''; display: inline-block; width: 7px; height: 7px;
      border-radius: 50%; background: #98FF98;
      margin-inline-end: 6px; vertical-align: middle;
    }
    .otichat-header button {
      background: rgba(255,255,255,0.18); color: #fff;
      border: none; width: 32px; height: 32px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s ease;
    }
    .otichat-header button:hover { background: rgba(255,255,255,0.32); }

    .otichat-messages {
      flex: 1; overflow-y: auto; padding: 18px 16px;
      display: flex; flex-direction: column; gap: 10px;
      background:
        radial-gradient(circle at 90% 8%, rgba(232,137,106,0.05) 0%, transparent 45%),
        radial-gradient(circle at 5% 70%, rgba(143,168,118,0.06) 0%, transparent 40%),
        #FBF7F0;
    }
    .otichat-msg {
      max-width: 85%; padding: 11px 15px;
      border-radius: 16px; line-height: 1.5;
      font-size: 15px; font-family: 'Heebo', sans-serif;
      color: #2A2522; white-space: pre-wrap; word-wrap: break-word;
      animation: otichat-msg-in 0.22s ease-out;
    }
    @keyframes otichat-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .otichat-msg.user {
      align-self: flex-start;
      background: #C56A4E; color: #fff;
      border-end-start-radius: 5px;
    }
    .otichat-msg.bot {
      align-self: flex-end;
      background: #fff; color: #2A2522;
      border: 1px solid #E5D9C8;
      border-end-end-radius: 5px;
    }
    .otichat-msg.error {
      align-self: center; background: #FCEDE6; color: #8A3D26;
      font-size: 13px; max-width: 90%; text-align: center;
    }
    .otichat-typing {
      display: inline-flex; gap: 4px; padding: 14px 16px;
      background: #fff; border: 1px solid #E5D9C8;
      border-radius: 16px; align-self: flex-end;
      border-end-end-radius: 5px;
    }
    .otichat-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #C56A4E;
      animation: otichat-dot 1.3s ease-in-out infinite;
    }
    .otichat-typing span:nth-child(2) { animation-delay: 0.18s; }
    .otichat-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes otichat-dot {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
      40% { opacity: 1; transform: scale(1); }
    }

    .otichat-input-area {
      padding: 12px; background: #FEFAF3;
      border-top: 1px solid #EFE7D8; flex-shrink: 0;
    }
    .otichat-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .otichat-input-row textarea {
      flex: 1; resize: none; border: 1.5px solid #E5D9C8;
      border-radius: 18px; padding: 10px 14px;
      font-family: 'Heebo', sans-serif; font-size: 15px;
      max-height: 100px; outline: none;
      background: #fff; color: #2A2522;
      transition: border-color 0.15s ease;
    }
    .otichat-input-row textarea:focus { border-color: #C56A4E; }
    .otichat-input-row button.send {
      width: 42px; height: 42px; border-radius: 50%;
      background: #C56A4E; color: #fff; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s ease, transform 0.1s ease;
    }
    .otichat-input-row button.send:hover:not(:disabled) { background: #2A2522; }
    .otichat-input-row button.send:active:not(:disabled) { transform: scale(0.95); }
    .otichat-input-row button.send:disabled { background: #C5BBAC; cursor: not-allowed; }
    .otichat-disclaimer {
      font-size: 11px; color: #7A6B60; text-align: center;
      margin-block-start: 6px; font-family: 'Heebo', sans-serif;
    }
    .otichat-disclaimer a { color: #C56A4E; text-decoration: none; }
    .otichat-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px;
    }
    .otichat-suggestions button {
      background: #fff; border: 1px solid #E5D9C8; color: #5A4F47;
      padding: 7px 13px; border-radius: 999px;
      font-size: 13px; font-family: 'Heebo', sans-serif;
      cursor: pointer; transition: all 0.15s ease;
    }
    .otichat-suggestions button:hover { background: #FCEDE6; border-color: #E8896A; color: #C56A4E; }

    @media (max-width: 480px) {
      .otichat-panel {
        inset-block-end: 0; inset-inline-end: 0; inset-inline-start: 0;
        width: 100vw; max-width: 100vw; height: 100vh; max-height: 100vh;
        border-radius: 0; bottom: 0;
      }
      .otichat-fab { inset-block-end: 16px; inset-inline-end: 16px; width: 56px; height: 56px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ----- מצב פנימי -----
  let history = [];
  let isLoading = false;
  let panelEl, messagesEl, inputEl, sendBtnEl, suggestionsEl;

  // ----- אחסון מקומי -----
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  function saveHistory() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
  }
  function clearHistory() {
    history = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    renderMessages();
  }

  // ----- בנייה של הממשק -----
  function buildContainer() {
    const wrap = document.createElement('div');
    wrap.className = isInline ? 'otichat-inline' : 'otichat-panel';

    wrap.innerHTML = `
      <div class="otichat-header">
        <div class="avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="meta">
          <div class="name">אוטי</div>
          <div class="status">חברה לצד ההורות</div>
        </div>
        <button type="button" class="otichat-clear" title="התחלה מחדש" aria-label="התחלה מחדש">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        ${isInline ? '' : `
        <button type="button" class="otichat-close" title="סגירה" aria-label="סגירה">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>`}
      </div>
      <div class="otichat-messages" role="log" aria-live="polite"></div>
      <div class="otichat-suggestions"></div>
      <div class="otichat-input-area">
        <div class="otichat-input-row">
          <textarea placeholder="כתבי כאן את השאלה..." rows="1" aria-label="שדה הקלדה"></textarea>
          <button type="button" class="send" aria-label="שליחה">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        <div class="otichat-disclaimer">
          אוטי לא מאבחנת ולא מחליפה מטפל. במצוקה — אלו"ט: <a href="tel:1700501601">1-700-501-601</a>
        </div>
      </div>
    `;

    return wrap;
  }

  function renderMessages() {
    if (!messagesEl) return;
    messagesEl.innerHTML = '';

    const all = history.length === 0
      ? [{ role: 'assistant', content: WELCOME }]
      : history;

    for (const msg of all) {
      const div = document.createElement('div');
      div.className = 'otichat-msg ' + (msg.role === 'user' ? 'user' : 'bot');
      div.textContent = msg.content;
      messagesEl.appendChild(div);
    }

    if (isLoading) {
      const typing = document.createElement('div');
      typing.className = 'otichat-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(typing);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;

    // הצעות פתיחה (רק כשהשיחה ריקה)
    if (history.length === 0 && suggestionsEl) {
      const suggestions = [
        'הילד שלי אובחן השבוע',
        'אני מחפש מענה לבוגר 22+',
        'מה זה ועדת זכאות?',
        'איך מקבלים סייעת?',
      ];
      suggestionsEl.innerHTML = suggestions
        .map(s => `<button type="button" data-suggest="${s.replace(/"/g, '&quot;')}">${s}</button>`)
        .join('');
      suggestionsEl.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          inputEl.value = b.dataset.suggest;
          send();
        });
      });
    } else if (suggestionsEl) {
      suggestionsEl.innerHTML = '';
    }
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    history.push({ role: 'user', content: text });
    inputEl.value = '';
    inputEl.style.height = 'auto';
    isLoading = true;
    sendBtnEl.disabled = true;
    saveHistory();
    renderMessages();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בשרת');
      }

      const reply = data.text || 'מצטערת, לא הצלחתי לענות. אפשר לנסות שוב?';
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      const errDiv = { role: 'assistant', content: `אופס, משהו השתבש: ${err.message}\n\nאפשר לנסות שוב בעוד רגע, או להתקשר לאלו"ט: 1-700-501-601` };
      history.push(errDiv);
    } finally {
      isLoading = false;
      sendBtnEl.disabled = false;
      saveHistory();
      renderMessages();
      inputEl.focus();
    }
  }

  function attachHandlers(root) {
    messagesEl = root.querySelector('.otichat-messages');
    inputEl = root.querySelector('textarea');
    sendBtnEl = root.querySelector('button.send');
    suggestionsEl = root.querySelector('.otichat-suggestions');

    sendBtnEl.addEventListener('click', send);

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });

    const clearBtn = root.querySelector('.otichat-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('להתחיל שיחה חדשה? ההיסטוריה תימחק.')) clearHistory();
      });
    }

    const closeBtn = root.querySelector('.otichat-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panelEl.classList.remove('open');
      });
    }
  }

  // ----- הקמה -----
  history = loadHistory();

  if (isInline) {
    panelEl = buildContainer();
    inlineHost.appendChild(panelEl);
    attachHandlers(panelEl);
    renderMessages();
    setTimeout(() => inputEl?.focus(), 200);
  } else {
    // bubble mode
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'otichat-fab';
    fab.setAttribute('aria-label', 'פתיחת צ׳אט עם אוטי');
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span class="badge">!</span>
    `;
    document.body.appendChild(fab);

    panelEl = buildContainer();
    document.body.appendChild(panelEl);
    attachHandlers(panelEl);

    fab.addEventListener('click', () => {
      panelEl.classList.toggle('open');
      if (panelEl.classList.contains('open')) {
        renderMessages();
        setTimeout(() => inputEl?.focus(), 200);
        const badge = fab.querySelector('.badge');
        if (badge) badge.style.display = 'none';
      }
    });
  }
})();
