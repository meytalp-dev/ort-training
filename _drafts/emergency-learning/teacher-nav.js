/* ============================================================
   teacher-nav.js — מקור-אמת יחיד לניווט-הצד של דפי-המורה ברֶצֶף.
   כל דף-מורה כולל <script src="teacher-nav.js"></script>, והסקריפט
   בונה מחדש את תוכן ה-.sidebar__nav (אייקונים inline, בלי תלות ב-sprite).
   מצב "פעיל" נקבע לפי שם-הקובץ הנוכחי. לעדכון תפריט — עורכים כאן בלבד.
   ============================================================ */
(function () {
  var ICON = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8M8 15h5"/>',
    activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    checkc: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 15l.7 1.9L21.5 18l-1.8.7L19 20.5l-.7-1.8L16.5 18l1.8-.6Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    game: '<rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 11v2M6 12h2"/><path d="M15.5 11h.01M18 13.5h.01"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    filetext: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M9 13h6M9 17h4"/>'
  };

  /* s = כותרת-קבוצה · אחרת פריט ניווט (t=תווית, h=קישור, i=אייקון, badge=תג) */
  var ITEMS = [
    { t: 'לוח בקרה', h: 'teacher-dashboard.html', i: 'dashboard' },
    { t: 'הכיתה שלי', h: 'teacher-class-board.html', i: 'clipboard', badge: '5' },
    { t: 'דופק כיתתי', h: 'educator-pulse.html', i: 'activity' },
    { t: 'יומן קשר', h: 'contact-log-teacher.html', i: 'message' },
    { s: 'הוראה ויצירה' },
    { t: 'שליחת משימה', h: 'teacher-flow.html', i: 'send' },
    { t: 'יצירת שיעור', h: 'lesson-create.html', i: 'plus' },
    { t: 'מחומר ליחידה', h: 'file-to-unit.html', i: 'upload' },
    { t: 'בונה בוחנים', h: 'quiz-builder.html', i: 'checkc' },
    { t: 'עוזר AI', h: 'ai-teacher.html', i: 'spark' },
    { s: 'תרגול' },
    { t: 'מנוע תרגול', h: 'practice-engine.html', i: 'target' },
    { t: 'משחקוני תרגול', h: 'learning-games.html', i: 'game' },
    { s: 'תוכן ותכנון' },
    { t: 'ספריית התוכן', h: 'library.html', i: 'book' },
    { t: 'תוכניות לימודים', h: 'content/annual-plan.html', i: 'calendar' },
    { t: 'קטלוג העשרה', h: 'course-catalog.html', i: 'layers' },
    { t: 'זיהוי פערים', h: 'gap-detection.html', i: 'alert' },
    { s: 'דוחות' },
    { t: 'הדוח היומי', h: 'daily-report.html', i: 'filetext' }
  ];

  function build() {
    var nav = document.querySelector('.sidebar__nav');
    if (!nav) return;
    var here = (location.pathname.split('/').pop() || 'teacher-dashboard.html').toLowerCase();
    var svgOpen = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    var html = '';
    ITEMS.forEach(function (it) {
      if (it.s) { html += '<div class="sidebar__section">' + it.s + '</div>'; return; }
      var file = it.h.split('/').pop().toLowerCase();
      var cur = file === here ? ' aria-current="page"' : '';
      html += '<a class="sidebar__item" href="' + it.h + '"' + cur + ' aria-label="' + it.t + '">' +
                '<span class="sidebar__icon" aria-hidden="true">' + svgOpen + (ICON[it.i] || '') + '</svg></span>' +
                '<span class="sidebar__label">' + it.t + '</span>' +
                (it.badge ? '<span class="badge badge--soft sidebar__badge" aria-hidden="true">' + it.badge + '</span>' : '') +
              '</a>';
    });
    nav.innerHTML = html;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
