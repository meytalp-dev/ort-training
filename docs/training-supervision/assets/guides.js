/* ============================================================
   רישום מדריכות — מקור אמת יחיד לפרטי כל מדריכה
   כל מדריכה: שם, מקצוע, מייל (אם יש), קישור Drive לחומרי הוראה,
   וקישור קבוע לזום (אם יש).
   הדשבורד נטען לפי ?g=<slug> או ?guide=<email>.
   ============================================================ */
window.TS_GUIDES = {
  shira: {
    name: 'שירה סיבוני',
    subject: 'מתמטיקה',
    email: 'Shiras@gram.ort.org.il',
    drive: '',
    zoom: ''
  },
  moria: {
    name: 'מוריה פלינט',
    subject: 'עברית',
    email: '',
    drive: 'https://drive.google.com/drive/folders/1uQKR8AmWZCv8-s6mD29SI0ngefxRjx-E?usp=sharing',
    zoom: 'https://edu-il.zoom.us/j/9525827563?omn=82061716992'
  },
  sivan: {
    name: 'סיון נחליאלי',
    subject: 'אנגלית',
    email: '',
    drive: 'https://drive.google.com/drive/folders/1XhUtPHFz2Pv2HrNj6X6TtB-nqp3kzmMJ?usp=sharing',
    zoom: ''
  }
};

/* מחזיר את קונפיג המדריכה לפי slug (?g=) או לפי email (?guide=) */
window.TS_resolveGuide = function (slug, email) {
  const guides = window.TS_GUIDES || {};
  if (slug && guides[slug]) return Object.assign({ slug }, guides[slug]);
  if (email) {
    const key = Object.keys(guides).find(k => (guides[k].email || '').toLowerCase() === email.toLowerCase());
    if (key) return Object.assign({ slug: key }, guides[key]);
  }
  return null;
};
