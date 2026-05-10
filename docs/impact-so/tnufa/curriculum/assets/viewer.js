/**
 * Markdown Viewer for ImpactOS Tnufa Curriculum
 *
 * טוען קובץ MD ומרנדר אותו עם marked.js + Tailwind prose styles.
 * בונה TOC אוטומטי, מטפל ב-anchors, ומוסיף עיצוב מקצועי.
 *
 * Usage in HTML:
 *   <script>
 *     window.MD_SOURCE = 'hebrew-grade4.md';
 *     window.MD_TITLE = 'תוכנית פדגוגית · עברית · כיתה ד\'';
 *   </script>
 *   <script src="assets/viewer.js"></script>
 */

(async function () {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js');
  } catch (err) {
    showError('לא ניתן לטעון את ספריית הרינדור. בדקו את החיבור לאינטרנט ונסו שוב.');
    return;
  }

  const source = window.MD_SOURCE;
  if (!source) {
    showError('חסר MD_SOURCE');
    return;
  }

  if (window.MD_TITLE) {
    document.title = window.MD_TITLE + ' · ImpactOS';
  }

  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error('לא נמצא קובץ: ' + source);
    const md = await response.text();

    marked.setOptions({ gfm: true, breaks: false });

    const html = marked.parse(md);

    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = html;

    addHeadingIds();
    wrapTables();
    isolateInlineCode();
    buildTOC();
    makeLinksOpenInNewTab();
    setupSmoothScroll();
    setupReadingProgress();

    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

  } catch (error) {
    showError(error.message);
    console.error('Viewer error:', error);
  }

  // ===== Helpers =====

  function showError(message) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    document.getElementById('content').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 my-8" role="alert">
        <h3 class="font-bold text-red-700 mb-2">שגיאה בטעינת המסמך</h3>
        <p class="text-red-600 text-sm">${escapeHtml(message)}</p>
        <p class="text-gray-600 text-sm mt-3">נסה.י לרענן את העמוד. אם הבעיה ממשיכה — צור.י קשר: <a href="mailto:meytalp@bethaarava.ort.org.il" class="underline">meytalp@bethaarava.ort.org.il</a></p>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load: ' + src));
      document.head.appendChild(script);
    });
  }

  function buildTOC() {
    const tocs = document.querySelectorAll('#toc, #toc-mobile');
    if (tocs.length === 0) return;

    const headings = document.querySelectorAll('#content h2, #content h3');
    if (headings.length === 0) {
      tocs.forEach(t => t.innerHTML = '<p class="text-sm text-gray-500">אין ראשי פרקים</p>');
      return;
    }

    const items = [];
    headings.forEach((h, idx) => {
      if (!h.id) h.id = 'section-' + idx;
      items.push({ id: h.id, text: h.textContent.trim(), level: parseInt(h.tagName.charAt(1)) });
    });

    const tocHTML = items.map(item => {
      const cls = item.level === 3 ? 'toc-h3' : '';
      return `<a href="#${item.id}" class="${cls}">${escapeHtml(item.text)}</a>`;
    }).join('');

    tocs.forEach(t => t.innerHTML = tocHTML);

    setupScrollSpy(items);
  }

  function addHeadingIds() {
    document.querySelectorAll('#content h1, #content h2, #content h3, #content h4').forEach((h, idx) => {
      if (!h.id) h.id = 'h-' + idx;
    });
  }

  // עוטף כל טבלה ב-div עם overflow-x:auto כדי שהטבלאות הרחבות לא ישברו במובייל
  function wrapTables() {
    document.querySelectorAll('#content table').forEach(table => {
      if (table.parentElement.classList.contains('table-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  // קוד inline באנגלית בתוך טקסט עברי — לחייב כיוון LTR
  function isolateInlineCode() {
    document.querySelectorAll('#content code').forEach(code => {
      if (code.parentElement.tagName === 'PRE') return;
      code.setAttribute('dir', 'ltr');
    });
  }

  function makeLinksOpenInNewTab() {
    document.querySelectorAll('#content a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        let target;
        try { target = document.querySelector(href); } catch (_) { return; }
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', href);
          // סגור drawer אם פתוח (מובייל)
          const drawer = document.getElementById('toc-drawer');
          if (drawer && drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            document.body.classList.remove('drawer-open');
          }
        }
      });
    });
  }

  function setupScrollSpy(items) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('#toc a, #toc-mobile a').forEach(a => a.classList.remove('active'));
          const id = entry.target.id;
          document.querySelectorAll(`#toc a[href="#${id}"], #toc-mobile a[href="#${id}"]`).forEach(link => link.classList.add('active'));
        }
      });
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
  }

  // פס התקדמות קריאה בראש העמוד
  function setupReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

})();

// ===== Print button =====

function printPage() {
  window.print();
}

// ===== Mobile TOC drawer =====

function toggleTocDrawer() {
  const drawer = document.getElementById('toc-drawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  document.body.classList.toggle('drawer-open');
}
