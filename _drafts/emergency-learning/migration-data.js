/* ============================================================
   רֶצֶף — מפת השכבות + מצב מיגרציה (מקור אמת יחיד)
   מזין את design-migration.html.
   ------------------------------------------------------------
   layer:    shell | learning   → קובע צבע פעולה (פטל / דיו) דרך data-layer
   register: marketing | form | content | ops | meta
             (רק ops דורש טיפול-צפיפות מיוחד — התבנית: system-health.html)
   flags:    tok/comp/loc/grad/btn  — מצב טכני שנדגם מהקוד
   status:   done | todo | fail
   flag:     ⚠ = סיווג-שכבה גבולי, מיטל מכריעה
   ------------------------------------------------------------
   סונכרן מחדש 19.7.2026 מול הקבצים בפועל: כלל מכני — טוקנים
   טעונים + אפס hex גולמי = done. נותרו todo רק קבצים עם hex
   גולמי (5 קורסי-העשרה שדולגו במודע + 4 מסמכי-פיתוח + roles).
   ============================================================ */
window.MIGRATION = {
  refs: { gate:'index.html', shell:'onboarding-wizard.html', ops:'system-health.html', brand:'design-system.html' },

  screens: [
    /* ---------- למידה (דיו · ברירת מחדל, ללא data-layer) ---------- */
    { f:'student-home.html',        layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0 },
    { f:'student-subjects.html',    layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'student-progress.html',    layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:1,btn:1 },
    { f:'student-tasks.html',       layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'student-videos.html',      layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:1,btn:0, note:'תוקן 19.7: כפתור .to-text עבר מ-var(--brand) ל-var(--action) (פעולת-למידה=דיו).' },
    { f:'student-my-day.html',      layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:3,btn:0 },
    { f:'worlds-hub.html',          layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0 },
    { f:'favorites.html',           layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'messages-center.html',     layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'checkin-panel.html',       layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'demo-unit-hebrew.html',    layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'demo-lashon-3levels.html', layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:1,btn:0 },
    { f:'demo-hair-m7-unit1.html',  layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0 },
    { f:'demo-media-m1-unit1.html', layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:1,btn:0 },
    { f:'mission-demo.html',        layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0 },
    { f:'enrichment-course.html',       layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:2,btn:0 },
    { f:'enrichment-course-ai.html',    layer:'learning', register:'content', status:'todo', tok:0,comp:0,loc:1,grad:2,btn:0, note:'קורס-העשרה — דולג במודע במיגרציה. ללא טוקנים + פלטה מקומית.' },
    { f:'enrichment-course-makeup.html',layer:'learning', register:'content', status:'todo', tok:0,comp:0,loc:1,grad:2,btn:0, note:'קורס-העשרה — דולג במודע. ללא טוקנים + פלטה מקומית.' },
    { f:'enrichment-course-money.html', layer:'learning', register:'content', status:'todo', tok:0,comp:0,loc:1,grad:2,btn:0, note:'קורס-העשרה — דולג במודע. ללא טוקנים + פלטה מקומית.' },
    { f:'enrichment-course-venture.html',layer:'learning',register:'content', status:'todo', tok:0,comp:0,loc:1,grad:2,btn:0, note:'קורס-העשרה — דולג במודע. ללא טוקנים + פלטה מקומית.' },
    { f:'enrichment-lesson-alive.html', layer:'learning', register:'content', status:'todo', tok:0,comp:0,loc:1,grad:1,btn:0, note:'פרוטוטייפ קורס-העשרה — דולג במודע. ללא טוקנים.' },
    { f:'lesson-create.html',       layer:'learning', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:1,btn:1 },
    { f:'quiz-builder.html',        layer:'learning', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'unit-editor.html',         layer:'learning', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'file-to-unit.html',        layer:'learning', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'practice-engine.html',     layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'learning-games.html',      layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'teacher-flow.html',        layer:'learning', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:2,btn:0 },
    { f:'teacher-class-board.html', layer:'learning', register:'ops',     status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'teacher-dashboard.html',   layer:'learning', register:'ops',     status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'למידה (§8 — בית של מורה). §4 CSS-only: rz-ambient הוסר, נורת-מצב בכותרת, המבנה נשמר.' },
    { f:'seen-flow.html',           layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'assign-practice.html',     layer:'learning', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:1,btn:0, note:'--teal ממופה ל-var(--action) (alias תקין).' },
    { f:'ai-teacher.html',          layer:'learning', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'live-lesson.html',         layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0, note:'--teal ממופה ל-var(--action) (alias תקין).' },
    { f:'substitute-mode.html',     layer:'learning', register:'content', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0, note:'--teal ממופה ל-var(--action) (alias תקין).' },
    { f:'resource-page.html',       layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:2,btn:1 },
    { f:'parent-weekly.html',       layer:'learning', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'מאושר: למידה — תצוגת הורה על למידת הילד.' },

    /* ---------- מעטפת (פטל · data-layer="shell") ---------- */
    { f:'onboarding-wizard.html',   layer:'shell', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0, note:'הומר ידנית — התבנית למעטפת' },
    { f:'admin-users-schools.html', layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'admin-roles-settings.html',layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'admin-integrations.html',  layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'ai-redlines-admin.html',   layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'library.html',             layer:'shell', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0, note:'הערת-עיצוב: נקודת "יחידה" (--brand) ו"סימולציה" (--type-sim) כמעט זהות — לשקול גיוון.' },
    { f:'library-filters.html',     layer:'shell', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'course-catalog.html',      layer:'shell', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0, note:'פאביקון נוסף. הערה: נקודת-מקצוע "בינה מלאכותית"=--brand בזמן שקיים --ai סגול ייעודי — לשקול.' },
    { f:'content-approval.html',    layer:'shell', register:'ops',     status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'content-production-board.html',layer:'shell',register:'ops',  status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'content-reports.html',     layer:'shell', register:'ops',     status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'content-sharing.html',     layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'publish-flow.html',        layer:'shell', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'gap-detection.html',       layer:'shell', register:'ops',     status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'feature-flags.html',       layer:'shell', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0, note:'✓/✗ הם גליפי-מצב טיפוגרפיים מ-JS (לא אימוג\'י ציורי) — קביל.' },
    { f:'mode-switch.html',         layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'system-modes.html',        layer:'shell', register:'content', status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'roles.html',               layer:'shell', register:'meta',    status:'todo', tok:1,comp:0,loc:0,grad:1,btn:0, note:'מסמך-פיתוח — עדיין hex גולמי (כותרות/גבולות תיבות). עדיפות נמוכה.' },
    { f:'national-roles.html',      layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'search-field.html',        layer:'shell', register:'content', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'duration-picker.html',     layer:'shell', register:'form',    status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'year-rollover.html',       layer:'shell', register:'form',    status:'done', tok:1,comp:1,loc:0,grad:0,btn:0, note:'הומר — התבנית לפלטה-מקומית' },

    /* ---------- תפעול (פטל + register:ops · התבנית: system-health) ---------- */
    { f:'system-health.html',       layer:'shell', register:'ops', status:'done', tok:1,comp:0,loc:0,grad:0,btn:0, note:'נבנה מחדש — התבנית לתפעול' },
    { f:'principal-pulse.html',     layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'class-tracking.html',      layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'student-activity.html',    layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'teacher-activity.html',    layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'subject-analytics.html',   layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'national-map.html',        layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:6,btn:0, note:'קו-מפה טורקיז = מוטיב-החוט (brand-line 0.7), מתועד ומכוון — לגיטימי (כמו אריג-החוטים ב-system-health).' },
    { f:'national-reports.html',    layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:3,btn:1 },
    { f:'daily-report.html',        layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'טורקיז ו-#fff במוקאפ-הוואטסאפ (.phone__/.btn--wa) = חריג-WhatsApp שהוכרע. ה-CTA הראשי (btn-send-top .btn--primary) = פטל תקין.' },
    { f:'reports.html',             layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'alert-center.html',        layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'ai-admin-insights.html',   layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'contact-log.html',         layer:'shell', register:'ops', status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'contact-log-teacher.html', layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'🔒 בשורת-הערה ב-JS = קונבנציית-קוד, לא UI — קביל.' },
    { f:'checkin-service.html',     layer:'shell', register:'ops', status:'done', tok:1,comp:0,loc:0,grad:0,btn:0 },
    { f:'educator-pulse.html',      layer:'shell', register:'ops', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'מאושר: תפעול. ⚠️ בשורות-הערה בלבד (לא UI) — קביל.' },

    /* ---------- מטא/פיתוח (שער-פנימי · עדיפות נמוכה) ---------- */
    { f:'index.html',           layer:'shell', register:'marketing', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0, note:'השער — התבנית לשיווקי' },
    { f:'design-system.html',   layer:'shell', register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1, note:'מקור האמת — עודכן' },
    { f:'screens.html',         layer:'shell', register:'meta', status:'done', tok:1,comp:0,loc:0,grad:1,btn:0 },
    { f:'ui-components.html',   layer:'shell', register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'data-components.html', layer:'shell', register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'app-shells.html',      layer:'shell', register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'dashboard-template.html',layer:'shell',register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'accessibility.html',   layer:'shell', register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:1 },
    { f:'sequence-line.html',   layer:'shell', register:'meta', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0, note:'טוקנים + אפס hex. הערה עיצובית: מתאר קו כחתימה — לשקול עדכון לנקודה (מוטיב §5), נפרד ממיגרציית-הטוקנים.' },
    { f:'logo.html',            layer:'shell', register:'meta', status:'todo', tok:0,comp:0,loc:0,grad:4,btn:0, note:'מסמך-פיתוח — hex גולמי + סימן 3-הגלים הישן. עדיפות נמוכה.' },
    { f:'brand-directions.html',layer:'shell', register:'meta', status:'todo', tok:0,comp:0,loc:0,grad:4,btn:0, note:'מסמך-פיתוח — כיווני זהות ישנים, hex גולמי. עדיפות נמוכה.' },
    { f:'checkin-panel-docs.html',layer:'shell',register:'meta', status:'done', tok:1,comp:1,loc:0,grad:0,btn:0 },
    { f:'spec.html',            layer:'shell', register:'meta', status:'todo', tok:0,comp:0,loc:1,grad:3,btn:0, note:'מסמך-פיתוח — ללא טוקנים + פלטה מקומית. עדיפות נמוכה.' },
    { f:'decisions.html',       layer:'shell', register:'meta', status:'todo', tok:0,comp:0,loc:1,grad:3,btn:0, note:'מסמך-פיתוח — ללא טוקנים + פלטה מקומית. עדיפות נמוכה.' },
    { f:'management.html',      layer:'shell', register:'ops',  status:'done', tok:0,comp:0,loc:1,grad:2,btn:0 },
    { f:'world-board.html',     layer:'shell', register:'ops',  status:'done', tok:1,comp:0,loc:1,grad:0,btn:0, note:'תוקן 19.7: אימוג\'י ⛔/⚠ ב-chips הוחלפו ב-SVG (כלל 8), עקבי עם ● ב-.rchip.ok.' },
    { f:'guided-tour.html',     layer:'shell', register:'meta', status:'done', tok:1,comp:0,loc:0,grad:1,btn:0, note:'--teal ממופה ל-var(--brand) (alias תקין).' },
    { f:'pilot-preview.html',   layer:'shell', register:'meta', status:'done', tok:1,comp:0,loc:0,grad:2,btn:0, note:'--teal ממופה ל-var(--brand) (alias תקין).' },
  ]
};
