/**
 * Learni Design Studio – all design options.
 * Source of truth: .claude/skills/front-end-design/references/
 */

// ── PALETTES ──
export const palettes = [
  { id: 'ort', name: 'ORT', mood: 'מקצועי, חינוכי', bg: '#F0F4F8', primary: '#2A9D8F', accent: '#E9C46A', text: '#0F172A' },
  { id: 'botanical', name: 'בוטני חם', mood: 'טבעי, רענן', bg: '#F0FDF4', primary: '#16A34A', accent: '#CA8A04', text: '#14532D' },
  { id: 'editorial', name: 'עורכי חם', mood: 'ספרותי, עמוק', bg: '#FFFBF5', primary: '#92400E', accent: '#D97706', text: '#1C1917' },
  { id: 'ocean', name: 'אוקיינוס', mood: 'אמין, רגוע', bg: '#EFF6FF', primary: '#1E40AF', accent: '#0EA5E9', text: '#1E3A5F' },
  { id: 'desert', name: 'ורד מדברי', mood: 'אלגנטי, רך', bg: '#FDF4F5', primary: '#BE185D', accent: '#F59E0B', text: '#1C1917' },
  { id: 'golden', name: 'שעה זהובה', mood: 'חם, עשיר', bg: '#FFFBEB', primary: '#B45309', accent: '#F59E0B', text: '#1C1917' },
  { id: 'arctic', name: 'קרח', mood: 'חד, מדויק', bg: '#F0F9FF', primary: '#0284C7', accent: '#06B6D4', text: '#0C4A6E' },
  { id: 'minimal', name: 'מינימלי', mood: 'נקי, בטוח', bg: '#FFFFFF', primary: '#111111', accent: '#0066FF', text: '#111111' },
  { id: 'galaxy', name: 'גלקסיה', mood: 'דרמטי, קולנועי', bg: '#050B1A', primary: '#7C3AED', accent: '#F59E0B', text: '#F1F5F9' },
  { id: 'tech', name: 'טק כהה', mood: 'קוד, מדויק', bg: '#0D1117', primary: '#58A6FF', accent: '#3FB950', text: '#E6EDF3' },
]

// ── STYLES ──
export const styles = [
  {
    id: 'warm-botanical',
    name: 'בוטני חם',
    desc: 'הזמנות, ספר בית ספר, תוכן למורים',
    features: 'רקע קרם, עלים ופרחים עדינים, גוונים חמים',
    elements: 'watercolor-blobs, leaf-corners, paper-texture',
    radius: '24px',
  },
  {
    id: 'edu-presentation',
    name: 'מצגת חינוכית',
    desc: 'שקפים, חומרי לימוד, הדרכות',
    features: 'צבעים חיים אבל לא צעקניים, אייקונים ברורים',
    elements: 'accent-bar, clean-blocks, numbered-items',
    radius: '18px',
  },
  {
    id: 'clean-management',
    name: 'ניהולי נקי',
    desc: 'מערכות ניהול, דשבורדים, טבלאות',
    features: 'רקע קרם, מסגרות צבעוניות, hover ורוד מעושן',
    elements: 'structured-grid, color-borders, stat-cards',
    radius: '16px',
  },
  {
    id: 'dramatic',
    name: 'דרמטי',
    desc: 'היסטוריה, ספרות, אירועים מיוחדים',
    features: 'ניגוד גבוה, טיפוגרפיה חזקה',
    elements: 'full-color-header, bold-dividers, hero-text',
    radius: '12px',
  },
  {
    id: 'playful',
    name: 'משחקי',
    desc: 'משחקים, פעילויות, תוכן לתלמידים',
    features: 'צבעים שמחים, פינות מאוד מעוגלות, אלמנטים כיפיים',
    elements: 'blobs, confetti-dots, rounded-cards',
    radius: '28px',
  },
  {
    id: 'professional',
    name: 'מקצועי',
    desc: 'דוחות, מצגות הנהלה, מסמכים רשמיים',
    features: 'נקי, מינימלי, טיפוגרפיה קלאסית',
    elements: 'underline-header, thin-borders, hierarchy-bars',
    radius: '10px',
  },
]

// ── FONT PAIRINGS ──
export const fontPairings = [
  {
    id: 'warm-teacher',
    name: 'חם למורים',
    context: 'הזמנות, תוכן למורים, חגים',
    heading: { family: 'Playpen Sans Hebrew', weight: '700', source: 'google' },
    sub: { family: 'Cafe', weight: '400', source: 'local' },
    body: { family: 'Heebo', weight: '400', source: 'google' },
  },
  {
    id: 'edu-lesson',
    name: 'שיעור חינוכי',
    context: 'מצגות שיעור, חומרי לימוד',
    heading: { family: 'Shuneet3 Square Bold', weight: '700', source: 'local' },
    sub: { family: 'Petel Bold', weight: '700', source: 'local' },
    body: { family: 'Shuneet3 Medium', weight: '500', source: 'local' },
  },
  {
    id: 'dramatic-lit',
    name: 'דרמטי ספרותי',
    context: 'היסטוריה, ספרות, אירועים',
    heading: { family: 'Antiochus Bold', weight: '700', source: 'local' },
    sub: { family: 'Dybbuk', weight: '400', source: 'local' },
    body: { family: 'Heebo', weight: '400', source: 'google' },
  },
  {
    id: 'clean-tech',
    name: 'נקי טכני',
    context: 'דשבורדים, דוחות, מערכות',
    heading: { family: 'Heebo', weight: '800', source: 'google' },
    sub: { family: 'Heebo', weight: '400', source: 'google' },
    body: { family: 'Heebo', weight: '300', source: 'google' },
  },
  {
    id: 'suez-classic',
    name: 'קלאסי רשמי',
    context: 'מסמכים רשמיים, תעודות',
    heading: { family: 'Suez One', weight: '400', source: 'google' },
    sub: { family: 'Assistant', weight: '600', source: 'google' },
    body: { family: 'Assistant', weight: '400', source: 'google' },
  },
  {
    id: 'rubik-modern',
    name: 'מודרני בולט',
    context: 'פוסטים, סושיאל, סטארטאפ',
    heading: { family: 'Rubik Mono One', weight: '400', source: 'google' },
    sub: { family: 'Rubik', weight: '500', source: 'google' },
    body: { family: 'Rubik', weight: '400', source: 'google' },
  },
  {
    id: 'amatic-community',
    name: 'קהילתי חופשי',
    context: 'קהילה, הורים, אירועים חמים',
    heading: { family: 'Amatic SC', weight: '700', source: 'google' },
    sub: { family: 'Assistant', weight: '600', source: 'google' },
    body: { family: 'Assistant', weight: '400', source: 'google' },
  },
]

// ── OUTPUT SIZES ──
export const outputSizes = [
  { id: 'brand-kit', name: 'קו מיתוגי מלא', w: 1080, h: 1080, ratio: '1:1', desc: 'כל התוצרים ביחד', multi: true },
  { id: 'instagram-post', name: 'פוסט אינסטגרם', w: 1080, h: 1080, ratio: '1:1', desc: 'פוסט מרובע' },
  { id: 'facebook-cover', name: 'כיסוי פייסבוק', w: 1200, h: 630, ratio: '~2:1', desc: 'באנר עליון' },
  { id: 'presentation', name: 'שקף מצגת', w: 1920, h: 1080, ratio: '16:9', desc: 'שקף בודד' },
  { id: 'logo-page', name: 'דף לוגו', w: 1080, h: 1080, ratio: '1:1', desc: 'הלוגו על רקע ממותג' },
  { id: 'a4', name: 'A4 מסמך', w: 794, h: 1123, ratio: 'A4', desc: 'דף להדפסה' },
  { id: 'instagram-story', name: 'סטורי', w: 1080, h: 1920, ratio: '9:16', desc: 'אנכי לסטוריז' },
  { id: 'weekly-summary', name: 'סיכום שבועי', w: 1080, h: 1350, ratio: '4:5', desc: 'פורמט קרוסלה' },
  { id: 'business-card', name: 'כרטיס ביקור', w: 1050, h: 600, ratio: '7:4', desc: 'כרטיס מקצועי' },
  { id: 'whatsapp', name: 'הזמנה בוואטסאפ', w: 800, h: 800, ratio: '1:1', desc: 'תמונה לשיתוף' },
]
