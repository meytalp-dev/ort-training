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
  // Load marked.js from CDN
  await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');

  const source = window.MD_SOURCE;
  if (!source) {
    document.getElementById('content').innerHTML = '<p class="text-red-600">חסר MD_SOURCE</p>';
    return;
  }

  try {
    // Fetch the MD file
    const response = await fetch(source);
    if (!response.ok) throw new Error('לא נמצא קובץ: ' + source);
    const md = await response.text();

    // Render to HTML
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });
    const html = marked.parse(md);

    // Insert into content container
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = html;

    // Build TOC from h2/h3 headings
    buildTOC();

    // Add IDs to all headings if missing
    addHeadingIds();

    // Make external links open in new tab
    makeLinksOpenInNewTab();

    // Setup smooth scroll for anchor links
    setupSmoothScroll();

    // Hide loader
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

  } catch (error) {
    document.getElementById('content').innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 my-8">
        <h3 class="font-bold text-red-700 mb-2">שגיאה בטעינת המסמך</h3>
        <p class="text-red-600 text-sm">${error.message}</p>
        <p class="text-gray-600 text-sm mt-3">נסה.י לרענן את העמוד. אם הבעיה ממשיכה — צור.י קשר.</p>
      </div>
    `;
    console.error('Viewer error:', error);
  }

  // ===== Helpers =====

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function buildTOC() {
    const toc = document.getElementById('toc');
    if (!toc) return;

    const headings = document.querySelectorAll('#content h2, #content h3');
    if (headings.length === 0) {
      toc.innerHTML = '<p class="text-sm text-gray-500">אין ראשי פרקים</p>';
      return;
    }

    const items = [];
    headings.forEach((h, idx) => {
      // Generate ID if missing
      if (!h.id) {
        h.id = 'section-' + idx;
      }
      const level = parseInt(h.tagName.charAt(1));
      const text = h.textContent.trim();
      items.push({ id: h.id, text, level });
    });

    const tocHTML = items.map(item => {
      const cls = item.level === 3 ? 'toc-h3' : '';
      return `<a href="#${item.id}" class="${cls}">${item.text}</a>`;
    }).join('');

    toc.innerHTML = tocHTML;

    // Highlight current section on scroll
    setupScrollSpy(items);
  }

  function addHeadingIds() {
    // marked.js with headerIds=true should do this, but make sure
    document.querySelectorAll('#content h1, #content h2, #content h3, #content h4').forEach((h, idx) => {
      if (!h.id) {
        h.id = 'h-' + idx;
      }
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
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', href);
        }
      });
    });
  }

  function setupScrollSpy(items) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Highlight matching TOC link
          document.querySelectorAll('#toc a').forEach(a => a.classList.remove('active'));
          const id = entry.target.id;
          const link = document.querySelector(`#toc a[href="#${id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, {
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0,
    });

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
  }

})();

// ===== Print button =====

function printPage() {
  window.print();
}
