/* פיננסקלאס · מעטפת קורס משותפת
 * Course shell — sidebar tree, progress tracking, mobile menu, block scroll-spy.
 * Reads body[data-current-lesson] like "1.1" or "unit-1" or "course-home".
 */
(function () {
  'use strict';

  // ===== מבנה הקורס (single source of truth) =====
  const COURSE = {
    name: 'פיננסקלאס',
    sub: 'קורס חינוך פיננסי · כיתה ט\'',
    units: [
      {
        id: 1, slug: 'unit-01-budget', month: 'ספטמבר', title: 'תקציב אישי ומשפחתי',
        published: true,
        lessons: [
          { id: '1.1', slug: 'shiur-1-1.html', title: 'איפה הכסף שלי?', tag: 'הקנייה', time: '50 דק׳',
            blocks: [
              { id: 'b1', n: 1, title: 'פתיחה — הסיפור של נועה', time: '10 דק׳' },
              { id: 'b2', n: 2, title: 'סימולציה — חודש בחיים שלך', time: '10 דק׳' },
              { id: 'b3', n: 3, title: 'מטריצת 2×2', time: '10 דק׳' },
              { id: 'b4', n: 4, title: 'כיס — 4 הקטגוריות', time: '20 דק׳' },
              { id: 'b5', n: 5, title: 'סיכום', time: '4 דק׳' }
            ]},
          { id: '1.2', slug: 'shiur-1-2.html', title: 'מאיפה הכסף, ולאן הוא הולך?', tag: 'תרגול', time: '50 דק׳',
            blocks: [
              { id: 'b1', n: 1, title: 'שיתוף בזוגות', time: '8 דק׳' },
              { id: 'b2', n: 2, title: 'AI מנתח דף חשבון', time: '18 דק׳' },
              { id: 'b3', n: 3, title: '3 שיטות תקציב', time: '12 דק׳' },
              { id: 'b4', n: 4, title: '4 שאלות לרעיון עסקי', time: '8 דק׳' },
              { id: 'b5', n: 5, title: 'סיכום', time: '4 דק׳' }
            ]},
          { id: '1.3', slug: 'shiur-1-3.html', title: 'תקציב שעובד', tag: 'תוצר ראשון', time: '50 דק׳',
            blocks: [
              { id: 'b1', n: 1, title: 'פתיחה', time: '8 דק׳' },
              { id: 'b2', n: 2, title: 'בניית התקציב', time: '18 דק׳' },
              { id: 'b3', n: 3, title: 'AI כיועץ סוקרטי', time: '14 דק׳' },
              { id: 'b4', n: 4, title: 'יעד SMART אישי', time: '8 דק׳' },
              { id: 'b5', n: 5, title: 'סיכום', time: '4 דק׳' }
            ]},
          { id: '1.4', slug: 'shiur-1-4.html', title: 'מה אם הכל משתבש?', tag: 'הפנמה', time: '50 דק׳',
            blocks: [
              { id: 'b1', n: 1, title: 'דילמת נועה', time: '10 דק׳' },
              { id: 'b2', n: 2, title: 'Bean Game פיזי', time: '13 דק׳' },
              { id: 'b3', n: 3, title: 'תקציב יזמי', time: '15 דק׳' },
              { id: 'b4', n: 4, title: '4 שאלות + רפלקציה', time: '12 דק׳' }
            ]}
        ]
      },
      { id: 2, slug: 'unit-02-banking', month: 'אוקטובר', title: 'בנקאות', published: true,
        lessons: [
          { id: '2.1', slug: 'shiur-2-1.html', title: 'למה בכלל צריך חשבון בנק?', tag: 'הקנייה', time: '50 דק׳' },
          { id: '2.2', slug: 'shiur-2-2.html', title: 'איזה בנק? 5 השאלות הנכונות', tag: 'תרגול', time: '50 דק׳' },
          { id: '2.3', slug: 'shiur-2-3.html', title: 'לקרוא דף חשבון בלי לפחד', tag: 'הערכה', time: '50 דק׳' },
          { id: '2.4', slug: 'shiur-2-4.html', title: 'בנק לעסק? לרעיון של שקד?', tag: 'הפנמה · יזמות', time: '50 דק׳' }
        ]},
      { id: 3, slug: 'unit-03-family-finance', month: 'נובמבר', title: 'שיח פיננסי במשפחה', published: true,
        lessons: [
          { id: '3.1', slug: 'shiur-3-1.html', title: 'פותחים את השיחה', tag: 'הקנייה', time: '50 דק׳' },
          { id: '3.2', slug: 'shiur-3-2.html', title: 'כשפורצת בעיה', tag: 'תרגול · AI', time: '50 דק׳' },
          { id: '3.3', slug: 'shiur-3-3.html', title: 'מציעים רעיון', tag: 'הפנמה · יזמות', time: '50 דק׳' }
        ]},
      { id: 4, slug: 'unit-04-loans', month: 'דצמבר', title: 'הלוואות', published: false, lessons: [] },
      { id: 5, slug: 'unit-05-savings', month: 'ינואר', title: 'חסכונות', published: false, lessons: [] },
      { id: 6, slug: 'unit-06-investments', month: 'פברואר', title: 'השקעות', published: false, lessons: [] },
      { id: 7, slug: 'unit-07-consumer-rights', month: 'מרץ', title: 'זכויות צרכן', published: false, lessons: [] },
      { id: 8, slug: 'unit-08-ads-fairness', month: 'אפריל', title: 'פרסומות והגינות', published: false, lessons: [] }
    ]
  };

  // ===== Progress (localStorage) =====
  const STORE_KEY = 'finansklass.progress.v1';
  function getProg(){ try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(e){ return {}; } }
  function setProg(p){ try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch(e){} }
  function isDone(id){ return !!(getProg()[id] && getProg()[id].done); }
  function markDone(id, val){
    const p = getProg();
    if (val) p[id] = { done: true, at: Date.now() };
    else delete p[id];
    setProg(p);
  }

  // ===== Helpers =====
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

  // Detect current lesson from body[data-current-lesson]
  const currentRaw = document.body.dataset.currentLesson || '';
  // Examples: "1.1", "unit-1", "course-home"
  let currentUnit = null, currentLesson = null, mode = 'home';
  if (/^\d+\.\d+$/.test(currentRaw)) {
    mode = 'lesson';
    const [u, l] = currentRaw.split('.').map(Number);
    currentUnit = u;
    currentLesson = currentRaw;
  } else if (/^unit-\d+$/.test(currentRaw)) {
    mode = 'unit';
    currentUnit = parseInt(currentRaw.split('-')[1], 10);
  } else {
    mode = 'home';
  }

  // ===== Build sidebar HTML =====
  function unitHref(u){ return mode === 'lesson' ? `../${u.slug}/index.html` : `${u.slug}/index.html`; }
  function lessonHref(u, lesson){
    if (mode === 'lesson') {
      return u.id === currentUnit ? lesson.slug : `../${u.slug}/${lesson.slug}`;
    }
    return `${u.slug}/${lesson.slug}`;
  }

  function renderSidebar(target){
    const totalLessons = COURSE.units.reduce((s,u)=>s+u.lessons.length,0);
    const doneCount = Object.keys(getProg()).filter(k => k.includes('.') && getProg()[k].done).length;
    const pct = totalLessons ? Math.round((doneCount/totalLessons)*100) : 0;

    const courseHomeHref = mode === 'lesson' ? '../index.html' : (mode === 'unit' ? '../index.html' : 'index.html');

    const html = `
      <div class="sb-top">
        <a href="${courseHomeHref}" class="sb-back" aria-label="חזרה למפת הקורס">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          חזרה למפת הקורס
        </a>
        <div class="sb-course">
          <div class="sb-course-name">${COURSE.name}</div>
          <div class="sb-course-sub">${COURSE.sub}</div>
          <div class="sb-progress-row">
            <div class="sb-progress-track"><div class="sb-progress-fill" style="width:${pct}%"></div></div>
            <span class="sb-progress-pct">${pct}%</span>
          </div>
          <div class="sb-progress-meta">${doneCount} מתוך ${totalLessons} שיעורים</div>
        </div>
      </div>
      <div class="sb-h">8 היחידות</div>
      <nav class="sb-units" aria-label="מבנה הקורס">
        ${COURSE.units.map(u => renderUnit(u)).join('')}
      </nav>
    `;
    target.innerHTML = html;
  }

  function renderUnit(u){
    const isCurrent = u.id === currentUnit;
    const isOpen = isCurrent;
    const locked = !u.published;
    const lessonsHtml = u.lessons.length
      ? `<div class="sb-lessons">${u.lessons.map((l,idx) => renderLesson(u, l, idx)).join('')}</div>`
      : `<div class="sb-lessons"><div class="sb-empty">בתכנון — משתחרר בהמשך השנה</div></div>`;
    return `
      <div class="sb-unit${isCurrent?' current':''}${isOpen?' open':''}${locked?' locked':''}" data-unit="${u.id}">
        <button class="sb-unit-h" type="button" aria-expanded="${isOpen}">
          <span class="sb-unit-num">${u.id}</span>
          <span class="sb-unit-body">
            <span class="sb-unit-title">${u.title}</span>
            <span class="sb-unit-meta">${u.lessons.length || 0} שיעורים · ${u.month}${locked?' · בתכנון':''}</span>
          </span>
          <svg class="sb-unit-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        ${lessonsHtml}
      </div>
    `;
  }

  function renderLesson(u, l, idx){
    const isCurrent = l.id === currentLesson;
    const done = isDone(l.id);
    const blocksHtml = (isCurrent && l.blocks)
      ? `<div class="sb-blocks">${l.blocks.map(b => `
          <a href="#${b.id}" class="sb-block" data-block="${b.id}">
            <span class="sb-block-num">${b.n}</span>
            <span class="sb-block-title">${b.title}</span>
            <span class="sb-block-time">${b.time}</span>
          </a>`).join('')}</div>`
      : '';
    return `
      <a href="${lessonHref(u, l)}" class="sb-lesson${isCurrent?' current':''}${done?' done':''}" data-lesson="${l.id}">
        <span class="sb-lesson-dot" aria-hidden="true"></span>
        <span class="sb-lesson-body">
          <span class="sb-lesson-title">שיעור ${l.id} · ${l.title}</span>
          <span class="sb-lesson-meta">${l.time} · ${l.tag}</span>
        </span>
      </a>
      ${blocksHtml}
    `;
  }

  // ===== Footer nav (prev/next + mark complete) =====
  function renderLessonFooter(target){
    if (mode !== 'lesson') return;
    const unit = COURSE.units.find(u => u.id === currentUnit);
    if (!unit) return;
    const idx = unit.lessons.findIndex(l => l.id === currentLesson);
    const prev = idx > 0 ? unit.lessons[idx-1] : null;
    let next = idx < unit.lessons.length - 1 ? unit.lessons[idx+1] : null;
    let nextHref = null, nextLabel = null;
    if (next) {
      nextHref = next.slug;
      nextLabel = `שיעור ${next.id} · ${next.title}`;
    } else {
      // Try next unit
      const nextUnit = COURSE.units.find(u => u.id === currentUnit + 1 && u.published);
      if (nextUnit) {
        nextHref = `../${nextUnit.slug}/index.html`;
        nextLabel = `יחידה ${nextUnit.id} · ${nextUnit.title}`;
      } else {
        nextHref = '../index.html';
        nextLabel = 'חזרה לקורס';
      }
    }
    target.innerHTML = `
      <div class="lesson-footer">
        ${prev
          ? `<a class="lf-side lf-prev" href="${prev.slug}"><span class="lf-dir">→ הקודם</span><span class="lf-name">שיעור ${prev.id} · ${prev.title}</span></a>`
          : `<a class="lf-side lf-prev" aria-disabled="true"><span class="lf-dir">→ הקודם</span><span class="lf-name">תחילת היחידה</span></a>`}
        <button type="button" class="lf-mark" id="markComplete" data-lesson="${currentLesson}">סמנו כשיעור הושלם</button>
        <a class="lf-side lf-next" href="${nextHref}"><span class="lf-dir">הבא ←</span><span class="lf-name">${nextLabel}</span></a>
      </div>
    `;
  }

  // ===== Topbar (breadcrumb + progress) =====
  function renderTopbar(target){
    const unit = currentUnit ? COURSE.units.find(u => u.id === currentUnit) : null;
    const lesson = currentLesson && unit ? unit.lessons.find(l => l.id === currentLesson) : null;
    const totalLessons = COURSE.units.reduce((s,u)=>s+u.lessons.length,0);
    const doneCount = Object.keys(getProg()).filter(k => k.includes('.') && getProg()[k].done).length;
    const pct = totalLessons ? Math.round((doneCount/totalLessons)*100) : 0;

    const homeHref = mode === 'lesson' ? '../index.html' : (mode === 'unit' ? '../index.html' : 'index.html');
    const unitHref = mode === 'lesson' ? 'index.html' : (mode === 'unit' ? 'index.html' : (unit ? `${unit.slug}/index.html` : '#'));

    let crumb = `<a href="${homeHref}">${COURSE.name}</a>`;
    if (unit) {
      crumb += `<span class="tb-crumb-sep">·</span>`;
      if (mode === 'lesson') {
        crumb += `<a href="${unitHref}">יחידה ${unit.id}</a>`;
        if (lesson) {
          crumb += `<span class="tb-crumb-sep">·</span><span class="tb-crumb-cur">שיעור ${lesson.id}</span>`;
        }
      } else {
        crumb += `<span class="tb-crumb-cur">יחידה ${unit.id} · ${unit.title}</span>`;
      }
    }

    target.innerHTML = `
      <div class="tb-left">
        <button type="button" class="tb-menu" id="tbMenu" aria-label="פתחי תפריט קורס" aria-controls="sidebar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <a href="${homeHref}" class="tb-brand">
          <span class="tb-brand-mark" aria-hidden="true">L</span>
          <span class="tb-brand-text">${COURSE.name}</span>
        </a>
        <nav class="tb-crumb" aria-label="פירורי לחם">${crumb}</nav>
      </div>
      <div class="tb-right">
        <div class="tb-progress" title="${doneCount} מתוך ${totalLessons}">התקדמות בקורס · <strong id="tbProgPct">${pct}%</strong></div>
      </div>
      <div class="tb-progress-bar"><div class="tb-progress-fill" id="tbProgFill"></div></div>
    `;
  }

  // ===== Bind interactions =====
  function bind(){
    // Unit accordion
    $$('.sb-unit-h').forEach(h => {
      h.addEventListener('click', () => {
        const u = h.closest('.sb-unit');
        if (u.classList.contains('locked')) return;
        const open = u.classList.toggle('open');
        h.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // Mobile menu toggle
    const menu = $('#tbMenu');
    const sidebar = $('#sidebar');
    const backdrop = el('<div class="sb-backdrop" id="sbBackdrop" aria-hidden="true"></div>');
    document.body.appendChild(backdrop);
    function closeSidebar(){ sidebar?.classList.remove('open'); backdrop.classList.remove('on'); }
    function openSidebar(){ sidebar?.classList.add('open'); backdrop.classList.add('on'); }
    menu?.addEventListener('click', () => {
      if (sidebar?.classList.contains('open')) closeSidebar(); else openSidebar();
    });
    backdrop.addEventListener('click', closeSidebar);
    sidebar?.addEventListener('click', e => {
      if (e.target.closest('a[href]')) closeSidebar();
    });

    // Scroll progress
    const fill = $('#tbProgFill');
    if (fill) {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        fill.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Block scroll-spy
    const blocks = $$('.block[id]');
    const blockLinks = $$('.sb-block');
    if (blocks.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            blockLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
          }
        });
      }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
      blocks.forEach(b => io.observe(b));
    }

    // Mark complete
    const markBtn = $('#markComplete');
    if (markBtn) {
      const id = markBtn.dataset.lesson;
      function paint(){
        const done = isDone(id);
        markBtn.classList.toggle('done', done);
        markBtn.innerHTML = done
          ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> הושלם · יופי!`
          : `סמנו כשיעור הושלם`;
        // Update sidebar lesson row
        $$('.sb-lesson[data-lesson="' + id + '"]').forEach(el => el.classList.toggle('done', done));
        // Update progress pct
        const totalLessons = COURSE.units.reduce((s,u)=>s+u.lessons.length,0);
        const doneCount = Object.keys(getProg()).filter(k => k.includes('.') && getProg()[k].done).length;
        const pct = totalLessons ? Math.round((doneCount/totalLessons)*100) : 0;
        const pctEl = $('#tbProgPct');
        if (pctEl) pctEl.textContent = pct + '%';
        $$('.sb-progress-fill').forEach(el => el.style.width = pct + '%');
        $$('.sb-progress-pct').forEach(el => el.textContent = pct + '%');
        $$('.sb-progress-meta').forEach(el => el.textContent = `${doneCount} מתוך ${totalLessons} שיעורים`);
      }
      paint();
      markBtn.addEventListener('click', () => { markDone(id, !isDone(id)); paint(); });
    }
  }

  // ===== Init =====
  function init(){
    const topbar = $('#tbHeader');
    const sidebar = $('#sidebar');
    const footer = $('#lessonFooter');
    if (topbar) renderTopbar(topbar);
    if (sidebar) renderSidebar(sidebar);
    if (footer) renderLessonFooter(footer);
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
