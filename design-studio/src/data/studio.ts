// ===================== COLOR PALETTES =====================
export type ColorPalette = {
  id: string;
  name: string;
  description: string;
  category: PaletteCategory;
  colors: { name: string; hex: string }[];
};

export type PaletteCategory = 'all' | 'warm' | 'pastel' | 'bold' | 'nature' | 'professional';

export const paletteCategories: { id: PaletteCategory; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'warm', label: 'חם' },
  { id: 'pastel', label: 'פסטל' },
  { id: 'bold', label: 'נועז' },
  { id: 'nature', label: 'טבע' },
  { id: 'professional', label: 'מקצועי' },
];

export const colorPalettes: ColorPalette[] = [
  {
    id: 'jerusalem-stone', name: 'אבן ירושלמית + תכלת',
    description: 'זהב אבן, תכלת שמיים, מרווה – מיתוג רשמי',
    category: 'professional',
    colors: [
      { name: 'זהב אבן', hex: '#D4A843' },
      { name: 'תכלת', hex: '#87CEEB' },
      { name: 'מרווה', hex: '#9DC183' },
      { name: 'חול', hex: '#C4A882' },
      { name: 'אקצנט', hex: '#E8963A' },
    ],
  },
  {
    id: 'watercolor-flowers', name: 'פרחי צבעי מים',
    description: 'ורוד, לבנדר, תכלת, מנטה – מהלוח שנה והמחברת',
    category: 'pastel',
    colors: [
      { name: 'ורוד פרח', hex: '#F4A7BB' },
      { name: 'תכלת', hex: '#A8D8EA' },
      { name: 'מנטה', hex: '#A8E6CF' },
      { name: 'סלמון', hex: '#F7C5A8' },
      { name: 'לבנדר', hex: '#C3AED6' },
    ],
  },
  {
    id: 'gum-mint', name: 'מסטיק ומנטה',
    description: 'ורוד בועה + חלב תות + מנטה רעננה',
    category: 'pastel',
    colors: [
      { name: 'מסטיק', hex: '#F8A4C8' },
      { name: 'חלב תות', hex: '#F7C8D8' },
      { name: 'מנטה', hex: '#7ECFC0' },
      { name: 'מנטה בהיר', hex: '#B5EAD7' },
      { name: 'וניל', hex: '#FFF5E4' },
    ],
  },
  {
    id: 'earth-terracotta', name: 'אדמה וטרקוטה',
    description: 'חומים חמים, טרקוטה, חול – אותנטי ועוצמתי',
    category: 'warm',
    colors: [
      { name: 'טרקוטה', hex: '#C4704B' },
      { name: 'חום רך', hex: '#A67B5B' },
      { name: 'אפור חם', hex: '#8B8589' },
      { name: 'פשתן', hex: '#E8DCC8' },
      { name: 'זהב', hex: '#C9A84C' },
    ],
  },
  {
    id: 'green-forest', name: 'יער ירוק',
    description: 'ירוקים עמוקים + פשתן – טבע, צמיחה, חינוך',
    category: 'nature',
    colors: [
      { name: 'ירוק כהה', hex: '#2D5F2D' },
      { name: 'יער', hex: '#4A7C59' },
      { name: 'מרווה', hex: '#87A878' },
      { name: 'פשתן', hex: '#E8DCC8' },
      { name: 'זהב', hex: '#C9A84C' },
    ],
  },
  {
    id: 'ocean-linen', name: 'אוקיינוס ופשתן',
    description: 'כחולים עמוקים + פשתן חם – רגוע ומקצועי',
    category: 'professional',
    colors: [
      { name: 'כחול עמוק', hex: '#1B4965' },
      { name: 'אוכמניות', hex: '#5FA8D3' },
      { name: 'תכלת', hex: '#BEE9E8' },
      { name: 'פשתן', hex: '#E8DCC8' },
      { name: 'זהב', hex: '#CAA53D' },
    ],
  },
  {
    id: 'italian-gelato', name: 'גלידה איטלקית',
    description: 'תות, לימון, תכלת, מנטה, לבנדר – עליז וצבעוני',
    category: 'bold',
    colors: [
      { name: 'תות', hex: '#FF6B6B' },
      { name: 'לימון', hex: '#FFE66D' },
      { name: 'תכלת', hex: '#4ECDC4' },
      { name: 'מנטה', hex: '#A8E6CF' },
      { name: 'לבנדר', hex: '#C3AED6' },
    ],
  },
  {
    id: 'lavender-peach', name: 'לבנדר ואפרסק',
    description: 'סגול רך + אפרסק + מנטה – עדין ומרגיע',
    category: 'pastel',
    colors: [
      { name: 'לבנדר', hex: '#C3AED6' },
      { name: 'אפרסק', hex: '#FFDAB9' },
      { name: 'מנטה', hex: '#B5EAD7' },
      { name: 'וניל', hex: '#FFF5E4' },
      { name: 'ורוד', hex: '#FFB7C5' },
    ],
  },
  {
    id: 'jerusalem-gold', name: 'זהב ירושלמי',
    description: 'זהב דומיננטי + כהה – חגיגי ומכובד',
    category: 'warm',
    colors: [
      { name: 'זהב', hex: '#D4A843' },
      { name: 'זהב כהה', hex: '#B8860B' },
      { name: 'זהב בהיר', hex: '#F0D68A' },
      { name: 'חול', hex: '#C4A882' },
      { name: 'כהה', hex: '#2C2C2C' },
    ],
  },
  {
    id: 'nectarine-bold', name: 'נקטרינה נועזת',
    description: 'כתום + סגול + ורוד – להתבלט ברשתות',
    category: 'bold',
    colors: [
      { name: 'נקטרינה', hex: '#FF6B35' },
      { name: 'ענבים', hex: '#7B4B94' },
      { name: 'לבנדר', hex: '#C3AED6' },
      { name: 'אפרסק', hex: '#FFDAB9' },
      { name: 'קרם', hex: '#FFF8F0' },
    ],
  },
  {
    id: 'warm-cream', name: 'קרם חם',
    description: 'teal חם + dusty rose – מערכות ודשבורדים',
    category: 'professional',
    colors: [
      { name: 'טורקיז חם', hex: '#2E8B8B' },
      { name: 'מרווה', hex: '#87A878' },
      { name: 'זהב חם', hex: '#C9A84C' },
      { name: 'ורוד עתיק', hex: '#D4A0A0' },
      { name: 'קרם', hex: '#FFF8F0' },
    ],
  },
  {
    id: 'pink-mint', name: 'ורוד ומנטה',
    description: 'ורוד + טורקיז + לימון – בולט ברשתות',
    category: 'bold',
    colors: [
      { name: 'מסטיק', hex: '#F8A4C8' },
      { name: 'תות חלב', hex: '#F7C8D8' },
      { name: 'מנטה', hex: '#7ECFC0' },
      { name: 'זהב', hex: '#F0D68A' },
      { name: 'מנטה בהיר', hex: '#B5EAD7' },
    ],
  },
  {
    id: 'turquoise-classic', name: 'טורקיז קלאסי',
    description: 'טורקיז + זהב חם – מקצועי אבל אישי',
    category: 'professional',
    colors: [
      { name: 'טורקיז', hex: '#40B5AD' },
      { name: 'טורקיז בהיר', hex: '#7DD8D0' },
      { name: 'זהב', hex: '#C9A84C' },
      { name: 'קרם', hex: '#FFF8F0' },
      { name: 'אקצנט', hex: '#E8963A' },
    ],
  },
  {
    id: 'warm-sunset', name: 'שקיעה חמה',
    description: 'סלמון + זהב + טורקיז – חם ומזמין',
    category: 'warm',
    colors: [
      { name: 'סלמון', hex: '#FA8072' },
      { name: 'זהב', hex: '#F0D68A' },
      { name: 'טורקיז', hex: '#40B5AD' },
      { name: 'קרם', hex: '#FFF8F0' },
      { name: 'ורוד', hex: '#FFB7C5' },
    ],
  },
  {
    id: 'minimal-clean', name: 'מינימלי נקי',
    description: 'לבן + צבע אחד בודד – נקי ומודרני',
    category: 'professional',
    colors: [
      { name: 'טורקיז', hex: '#40B5AD' },
      { name: 'טורקיז כהה', hex: '#2E8B8B' },
      { name: 'רקע', hex: '#FAFAFA' },
      { name: 'אפור', hex: '#9E9E9E' },
      { name: 'טקסט', hex: '#333333' },
    ],
  },
  {
    id: 'blue-sage', name: 'תכלת ומרווה',
    description: 'רגוע ומקצועי – תכלת + ירוק רך',
    category: 'nature',
    colors: [
      { name: 'תכלת', hex: '#87CEEB' },
      { name: 'תכלת בהיר', hex: '#BEE9E8' },
      { name: 'מרווה', hex: '#87A878' },
      { name: 'מרווה בהיר', hex: '#C1D5B0' },
      { name: 'חול', hex: '#C4A882' },
    ],
  },
  {
    id: 'orchid-mango', name: 'סחלב ומנגו',
    description: 'סחלב ורוד + מנגו + ג׳לי בין + משמש',
    category: 'bold',
    colors: [
      { name: 'סחלב', hex: '#DA70D6' },
      { name: 'מנגו', hex: '#FFB347' },
      { name: "ג'לי", hex: '#FF6B6B' },
      { name: 'משמש', hex: '#FBCEB1' },
    ],
  },
  {
    id: 'gum-vanilla', name: 'מסטיק וניל',
    description: 'מסטיק + מנטה + וניל + אבקה כחולה',
    category: 'pastel',
    colors: [
      { name: 'מסטיק', hex: '#F8A4C8' },
      { name: 'מנטה', hex: '#7ECFC0' },
      { name: 'וניל', hex: '#FFF5E4' },
      { name: 'אבקה', hex: '#B0C4DE' },
    ],
  },
  {
    id: 'oat-spice', name: 'שיבולת שועל ותבלין',
    description: 'שיבולת + עלה + שקד + תבלין – אדמתי חם',
    category: 'nature',
    colors: [
      { name: 'שיבולת', hex: '#D2B48C' },
      { name: 'עלה', hex: '#6B8E23' },
      { name: 'שקד', hex: '#EFDECD' },
      { name: 'תבלין', hex: '#8B4513' },
    ],
  },
  {
    id: 'dune-charcoal', name: 'דיונה ופחם',
    description: 'דיונה + פחם + בוץ + ערפל – ניטרלי חזק',
    category: 'professional',
    colors: [
      { name: 'דיונה', hex: '#C2B280' },
      { name: 'פחם', hex: '#36454F' },
      { name: 'בוץ', hex: '#796252' },
      { name: 'ערפל', hex: '#B8B8B8' },
    ],
  },
  {
    id: 'cotton-candy', name: 'סוכריית צמר גפן',
    description: 'סוכרייה + חלב תות + שמיים כחולים + פרוונקל',
    category: 'pastel',
    colors: [
      { name: 'סוכרייה', hex: '#FFB3DE' },
      { name: 'חלב תות', hex: '#F7C8D8' },
      { name: 'שמיים', hex: '#87CEEB' },
      { name: 'פרוונקל', hex: '#CCCCFF' },
    ],
  },
  {
    id: 'blush-berry', name: 'סומק ותות',
    description: 'סומק + קרם ורד + נשיקת תות + תות יער',
    category: 'warm',
    colors: [
      { name: 'סומק', hex: '#DE6FA1' },
      { name: 'קרם ורד', hex: '#F7CAC9' },
      { name: 'תות', hex: '#FF6B6B' },
      { name: 'תות יער', hex: '#8B0A50' },
    ],
  },
  {
    id: 'dusty-pink-silk', name: 'ורוד מאובק ומשי',
    description: 'ורוד מאובק + משי קרם + תכלת אבקה + פחם',
    category: 'professional',
    colors: [
      { name: 'ורוד מאובק', hex: '#D4A0A0' },
      { name: 'משי', hex: '#FFF8F0' },
      { name: 'תכלת אבקה', hex: '#B0C4DE' },
      { name: 'פחם', hex: '#36454F' },
    ],
  },
  {
    id: 'espresso-cream', name: 'קצף קרם ואספרסו',
    description: 'קצף + אגוזי לוז + מוקה + אספרסו – קפה!',
    category: 'warm',
    colors: [
      { name: 'קצף', hex: '#FFF8F0' },
      { name: 'אגוזי לוז', hex: '#C4A882' },
      { name: 'מוקה', hex: '#967259' },
      { name: 'אספרסו', hex: '#3C1414' },
    ],
  },
  {
    id: 'matcha-pistachio', name: "מאצ'ה ופיסטוק",
    description: "חלב מאצ'ה + מאצ'ה + פיסטוק + ירוק קרמיקה",
    category: 'nature',
    colors: [
      { name: 'חלב', hex: '#D4E7C5' },
      { name: "מאצ'ה", hex: '#7AB648' },
      { name: 'פיסטוק', hex: '#93C572' },
      { name: 'קרמיקה', hex: '#4A7C59' },
    ],
  },
  {
    id: 'strawberry-syrup', name: 'סירופ תות וורוד',
    description: 'סירופ + סנדיי + ורוד פופ + טוטי פרוטי – ורודים!',
    category: 'bold',
    colors: [
      { name: 'סירופ', hex: '#FF1493' },
      { name: 'סנדיי', hex: '#FF69B4' },
      { name: 'פופ', hex: '#FF85A2' },
      { name: 'טוטי', hex: '#FF6EB4' },
    ],
  },
];

// ===================== STYLES =====================
export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  bgColor: string;
  accentColor: string;
};

export const designStyles: DesignStyle[] = [
  { id: 'watercolor', name: 'פרחי צבעי מים', description: 'רקע קרם, פרחי שדה בפינות, עיגולים. רך ורומנטי.', tags: ['הזמנות', 'מחברות', 'חגים'], bgColor: '#FFF8F0', accentColor: '#F4A7BB' },
  { id: 'coral-warm', name: 'קורל חם', description: 'רקע אפרסק, ריבועים מעוגלים, נקודות דקורטיביות.', tags: ['הדרכות', 'פוסטים', 'דפי נחיתה'], bgColor: '#FFECD2', accentColor: '#FA8072' },
  { id: 'lime-fresh', name: 'ליים רענן', description: 'רקע ירוק-ליים, אליפסות, הדגשת מילה בסגנון TikTok.', tags: ['רשתות', 'טיקטוק', 'פרסום'], bgColor: '#F0FFF0', accentColor: '#7AB648' },
  { id: 'dusty-rose', name: 'ורוד עתיק', description: 'רקע dusty rose, מלבנים, סלוגן זכוכית מטושטשת.', tags: ['מצגות', 'אירועים', 'מיתוג'], bgColor: '#FFF0F5', accentColor: '#D4A0A0' },
  { id: 'clean-mgmt', name: 'ניהול נקי', description: 'רקע קרם, מסגרות צבעוניות, מסודר ומקצועי.', tags: ['דשבורד', 'מערכות', 'טבלאות'], bgColor: '#FAFAFA', accentColor: '#2E8B8B' },
  { id: 'edu-presentation', name: 'מצגת לימודית', description: 'צבעים ברורים, היררכיה חזקה, אייקונים גדולים.', tags: ['שקפים', 'שיעורים', 'חומרי לימוד'], bgColor: '#F5F5F5', accentColor: '#5FA8D3' },
  { id: 'playful', name: 'משחקי ועליז', description: 'פינות עגולות, צבעי פסטל, פונט ילדותי.', tags: ['משחקים', 'קלפים', 'פעילויות'], bgColor: '#FFF5E4', accentColor: '#FF6B6B' },
  { id: 'earthy-warm', name: 'אדמתי חם', description: 'טרקוטה, חול, חום. אותנטי, חזק, שורשי.', tags: ['שיווק', 'קמפיינים', 'מצגות'], bgColor: '#FDF5E6', accentColor: '#C4704B' },
  { id: 'pastel-soft', name: 'פסטל עדין', description: 'כתמים אורגניים מטושטשים בפינות, גבעולים, נקודות פזורות.', tags: ['הזמנות', 'מחברות', 'תכנון'], bgColor: '#FFF8F5', accentColor: '#C3AED6' },
  { id: 'splash-bold', name: 'כתמים נועזים', description: 'כתמי צבעי מים דרמטיים מהקצוות, ציפורים, פרפרים.', tags: ['כרזות', 'אירועים', 'פרסום'], bgColor: '#FFFFFF', accentColor: '#FF6B35' },
  { id: 'field-flowers', name: 'פרחי שדה', description: 'גן פרחי שדה בצבעי מים מלמטה, פתק נייר קרוע.', tags: ['לוחות שנה', 'יומנים', 'חגים'], bgColor: '#FFFDF7', accentColor: '#F4A7BB' },
  { id: 'splash-dramatic', name: 'התזות דרמטיות', description: 'התזות צבע גדולות מהקצוות, ציפורים SVG, מרכז נקי.', tags: ['פוסטרים', 'אמנות', 'אירועים'], bgColor: '#FFFFFF', accentColor: '#7B4B94' },
];

// ===================== FONT COMBOS =====================
export type FontCombo = {
  id: string;
  name: string;
  description: string;
  heading: string;
  body: string;
  tags: string[];
};

export const fontCombos: FontCombo[] = [
  { id: 'clear-voice', name: 'קול ברור', description: 'SecularOne תופס את העין, Heebo Light מאזן', heading: 'Secular One', body: 'Heebo', tags: ['מצגות', 'שקפים'] },
  { id: 'my-teacher', name: 'המורה שלי', description: 'כתב יד חם בכותרת, Assistant מסודר בגוף', heading: 'Playpen Sans Hebrew', body: 'Assistant', tags: ['דפי עבודה', 'תלמידים'] },
  { id: 'soft-authority', name: 'סמכות רכה', description: 'סריף מסורתי + Rubik עגלגל מרכך ומנגיש', heading: 'Suez One', body: 'Rubik', tags: ['מסמכים רשמיים', 'דוחות'] },
  { id: 'class-party', name: 'חגיגה בכיתה', description: 'Amatic מביא אנרגיה, VarelaRound שומר על קריאות', heading: 'Amatic SC', body: 'Varela Round', tags: ['אירועים', 'הזמנות'] },
  { id: 'morning-paper', name: 'עיתון הבוקר', description: 'סריף קלאסי בכותרת + סאן-סריף מודרני בגוף', heading: 'Frank Ruhl Libre', body: 'Heebo', tags: ['עלונים', 'מידע להורים'] },
  { id: 'block', name: 'בלוק', description: 'Heebo Black ישיר וחזק, MiriamLibre פשוט ומוכר', heading: 'Heebo', body: 'Miriam Libre', tags: ['הדרכות טכניות'] },
  { id: 'personal-letter', name: 'מכתב אישי', description: 'כתב יד אותנטי בכותרת, Rubik Light נותן מרחב', heading: 'Playpen Sans Hebrew', body: 'Rubik', tags: ['תוכן רגשי', 'רפלקציה'] },
  { id: 'bridge', name: 'גשר בין עולמות', description: 'Alef מודרני ונגיש ככותרת, David קלאסי בגוף', heading: 'Alef', body: 'David Libre', tags: ['בגרויות', 'חומרי לימוד'] },
  { id: 'youth-movement', name: 'תנועת נוער', description: 'SecularOne בולט, Assistant SemiBold שומר על נוכחות', heading: 'Secular One', body: 'Assistant', tags: ['רילס', 'טיקטוק', 'שיווק'] },
  { id: 'crown-shield', name: 'כתר ומגן', description: 'סריפים אלגנטיים חגיגיים, Heebo Medium יציב וקריא', heading: 'Suez One', body: 'Heebo', tags: ['טקסים', 'תעודות'] },
];

// ===================== BUTTONS =====================
export type ButtonStyle = {
  id: string;
  name: string;
  description: string;
  category: ButtonCategory;
  css: Record<string, string>;
  tags: string[];
};

export type ButtonCategory = 'all' | 'pill' | 'rounded' | 'circle' | 'square' | 'outline' | 'gradient' | 'tag' | 'special';

export const buttonCategories: { id: ButtonCategory; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'pill', label: 'גלולה' },
  { id: 'rounded', label: 'מעוגל' },
  { id: 'circle', label: 'עיגול' },
  { id: 'square', label: 'מרובע' },
  { id: 'outline', label: 'מתאר' },
  { id: 'gradient', label: 'גרדיאנט' },
  { id: 'tag', label: 'תגית' },
  { id: 'special', label: 'צורות מיוחדות' },
];

export const buttonStyles: ButtonStyle[] = [
  { id: 'pill-primary', name: 'גלולה – ראשי', description: 'כפתור ראשי מלא, פינות מעוגלות לגמרי', category: 'pill', tags: ['מצגות', 'CTA'], css: { padding: '12px 32px', borderRadius: '30px', fontWeight: '600' } },
  { id: 'pill-small', name: 'גלולה – קטן', description: 'כפתור גלולה קומפקטי לפעולות משניות', category: 'pill', tags: ['ניווט', 'פילטרים'], css: { padding: '6px 18px', borderRadius: '20px', fontSize: '0.8rem' } },
  { id: 'pill-shadow', name: 'גלולה – עם צל', description: 'כפתור גלולה מוגבה עם צל, תחושת 3D', category: 'pill', tags: ['משחקים', 'פעילויות'], css: { padding: '14px 36px', borderRadius: '30px', boxShadow: '0 4px 14px rgba(0,0,0,.2)', transform: 'translateY(-2px)' } },
  { id: 'rounded-card', name: 'מעוגל – כרטיס', description: 'כפתור מלבני עם פינות מעוגלות, תחושת כרטיסיה', category: 'rounded', tags: ['שאלונים', 'בחירה'], css: { padding: '14px 24px', borderRadius: '14px', border: '2px solid' } },
  { id: 'rounded-full', name: 'מעוגל – מלא', description: 'מלבן מעוגל מלא, נפוץ בשאלונים', category: 'rounded', tags: ['שאלונים', 'סקרים'], css: { padding: '14px 28px', borderRadius: '14px', fontWeight: '600' } },
  { id: 'circle-icon', name: 'עיגול – אייקון', description: 'כפתור עגול עם אייקון בלבד', category: 'circle', tags: ['ניווט', 'סגירה'], css: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'circle-number', name: 'עיגול – מספר', description: 'עיגול עם מספר או אות בפנים', category: 'circle', tags: ['שלבים', 'מספור'], css: { width: '44px', height: '44px', borderRadius: '50%', fontWeight: '800', fontSize: '18px' } },
  { id: 'square-classic', name: 'מרובע – קלאסי', description: 'כפתור מרובע עם פינות קטנות, סגנון פורמלי', category: 'square', tags: ['טפסים', 'דשבורדים'], css: { padding: '10px 24px', borderRadius: '6px', fontWeight: '600' } },
  { id: 'outline-pill', name: 'מתאר – גלולה', description: 'כפתור שקוף עם גבול צבעוני', category: 'outline', tags: ['כפתור משני', 'ביטול'], css: { padding: '10px 28px', borderRadius: '30px', border: '2px solid', background: 'transparent' } },
  { id: 'outline-rect', name: 'מתאר – מלבן', description: 'מלבן שקוף עם מסגרת', category: 'outline', tags: ['דשבורדים', 'סינון'], css: { padding: '10px 24px', borderRadius: '12px', border: '2px solid', background: 'transparent' } },
  { id: 'gradient-diagonal', name: 'גרדיאנט – אלכסוני', description: 'כפתור עם מעבר צבעים אלכסוני, מודרני ובולט', category: 'gradient', tags: ['CTA', 'הרשמה'], css: { padding: '14px 36px', borderRadius: '30px' } },
  { id: 'gradient-horizontal', name: 'גרדיאנט – אופקי', description: 'מעבר צבע אופקי עדין, אלגנטי', category: 'gradient', tags: ['כפתורים ראשיים', 'אירועים'], css: { padding: '12px 32px', borderRadius: '14px' } },
  { id: 'tag-small', name: 'תגית – קטנה', description: 'תגית קטנה לסימון קטגוריות', category: 'tag', tags: ['קטגוריות', 'פילטרים'], css: { padding: '3px 10px', borderRadius: '10px', fontSize: '0.7rem' } },
  { id: 'tag-medium', name: 'תגית – בינונית', description: 'תגית בינונית לפילטרים פעילים', category: 'tag', tags: ['פילטרים', 'ניווט'], css: { padding: '6px 16px', borderRadius: '20px', border: '2px solid' } },
  { id: 'tag-badge', name: 'תגית – badge', description: 'badge עם רקע צבעוני, למידע או סטטוס', category: 'tag', tags: ['סטטוס', 'מידע'], css: { padding: '8px 18px', borderRadius: '14px', fontWeight: '600' } },
  { id: 'blob', name: 'כתם אורגני – Blob', description: 'צורה חופשית ולא סימטרית, מודרנית', category: 'special', tags: ['רשתות', 'טיקטוק'], css: { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', padding: '16px 24px' } },
  { id: 'speech-bubble', name: 'בועת דיבור', description: 'בועה עגולה עם זנב קטן למטה', category: 'special', tags: ['ציטוטים', 'דיאלוג'], css: { borderRadius: '20px', padding: '14px 24px', position: 'relative' } },
  { id: 'arrow-steps', name: 'חץ – שלבים', description: 'צורת חץ/שברון, מושלם לתהליכים', category: 'special', tags: ['שלבים', 'תהליך'], css: { clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)', padding: '14px 30px 14px 40px' } },
];

// ===================== OUTPUT SIZES =====================
export type OutputSize = {
  id: string;
  name: string;
  dimensions: string;
  width: number;
  height: number;
  category: 'presentations' | 'social' | 'messaging' | 'print' | 'web';
};

export const outputCategories: { id: string; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'presentations', label: 'מצגות' },
  { id: 'social', label: 'רשתות' },
  { id: 'print', label: 'הדפסה' },
  { id: 'web', label: 'אתרים' },
];

export const outputSizes: OutputSize[] = [
  { id: 'slide-16-9', name: 'מצגת רגילה (16:9)', dimensions: '1920 × 1080 px', width: 1920, height: 1080, category: 'presentations' },
  { id: 'slide-4-3', name: 'מצגת קלאסית (4:3)', dimensions: '1024 × 768 px', width: 1024, height: 768, category: 'presentations' },
  { id: 'fb-square', name: 'פוסט פייסבוק (ריבועי)', dimensions: '1080 × 1080 px', width: 1080, height: 1080, category: 'social' },
  { id: 'ig-square', name: 'פוסט אינסטגרם (ריבועי)', dimensions: '1080 × 1080 px', width: 1080, height: 1080, category: 'social' },
  { id: 'ig-portrait', name: 'פוסט אינסטגרם (פורטרט)', dimensions: '1080 × 1350 px', width: 1080, height: 1350, category: 'social' },
  { id: 'story', name: 'סטורי / ריל', dimensions: '1080 × 1920 px', width: 1080, height: 1920, category: 'social' },
  { id: 'a4-portrait', name: 'A4 לאורך', dimensions: '2480 × 3508 px', width: 2480, height: 3508, category: 'print' },
  { id: 'a4-landscape', name: 'A4 לרוחב', dimensions: '3508 × 2480 px', width: 3508, height: 2480, category: 'print' },
  { id: 'landing-page', name: 'דף נחיתה', dimensions: '1440 × 900 px', width: 1440, height: 900, category: 'web' },
];

// ===================== MOOD/PROMPT MAPPING =====================
export type MoodPreset = {
  id: string;
  name: string;
  emoji: string;
  paletteIds: string[];
  styleIds: string[];
  fontIds: string[];
  buttonIds: string[];
};

export const moodPresets: MoodPreset[] = [
  {
    id: 'cheerful', name: 'עליז', emoji: '🎉',
    paletteIds: ['italian-gelato', 'gum-mint', 'pink-mint', 'cotton-candy'],
    styleIds: ['playful', 'lime-fresh', 'coral-warm', 'splash-bold'],
    fontIds: ['class-party', 'my-teacher', 'youth-movement', 'clear-voice'],
    buttonIds: ['pill-shadow', 'blob', 'speech-bubble', 'pill-primary'],
  },
  {
    id: 'romantic', name: 'רומנטי / עדין', emoji: '💐',
    paletteIds: ['watercolor-flowers', 'lavender-peach', 'dusty-pink-silk', 'blush-berry'],
    styleIds: ['watercolor', 'pastel-soft', 'field-flowers', 'dusty-rose'],
    fontIds: ['personal-letter', 'soft-authority', 'crown-shield', 'my-teacher'],
    buttonIds: ['rounded-card', 'outline-pill', 'tag-badge', 'gradient-horizontal'],
  },
  {
    id: 'professional', name: 'מקצועי / נקי', emoji: '💼',
    paletteIds: ['minimal-clean', 'warm-cream', 'ocean-linen', 'dune-charcoal'],
    styleIds: ['clean-mgmt', 'edu-presentation', 'dusty-rose', 'coral-warm'],
    fontIds: ['block', 'morning-paper', 'clear-voice', 'soft-authority'],
    buttonIds: ['square-classic', 'outline-rect', 'tag-medium', 'rounded-full'],
  },
  {
    id: 'dynamic', name: 'דינמי / נועז', emoji: '⚡',
    paletteIds: ['nectarine-bold', 'italian-gelato', 'strawberry-syrup', 'orchid-mango'],
    styleIds: ['lime-fresh', 'splash-bold', 'splash-dramatic', 'playful'],
    fontIds: ['youth-movement', 'block', 'clear-voice', 'class-party'],
    buttonIds: ['gradient-diagonal', 'blob', 'arrow-steps', 'pill-shadow'],
  },
  {
    id: 'earthy', name: 'אדמתי / אותנטי', emoji: '🌿',
    paletteIds: ['earth-terracotta', 'green-forest', 'oat-spice', 'espresso-cream'],
    styleIds: ['earthy-warm', 'field-flowers', 'clean-mgmt', 'watercolor'],
    fontIds: ['bridge', 'soft-authority', 'morning-paper', 'personal-letter'],
    buttonIds: ['square-classic', 'outline-pill', 'rounded-card', 'tag-badge'],
  },
  {
    id: 'festive', name: 'חגיגי / רשמי', emoji: '✨',
    paletteIds: ['jerusalem-gold', 'jerusalem-stone', 'dusty-pink-silk', 'ocean-linen'],
    styleIds: ['dusty-rose', 'splash-dramatic', 'earthy-warm', 'edu-presentation'],
    fontIds: ['crown-shield', 'soft-authority', 'morning-paper', 'bridge'],
    buttonIds: ['gradient-horizontal', 'gradient-diagonal', 'rounded-full', 'outline-pill'],
  },
];
