// Maps Hebrew keywords to thematic emoji decorations
export interface ThematicDecoration {
  emoji: string;
  label: string;
  positions: { top?: string; bottom?: string; left?: string; right?: string; fontSize: string; opacity: number; rotate?: number }[];
}

interface ThemeKeywords {
  keywords: string[];
  decoration: ThematicDecoration;
}

const themes: ThemeKeywords[] = [
  {
    keywords: ['פסח', 'מצה', 'סדר', 'הגדה', 'חירות'],
    decoration: {
      emoji: '🫓',
      label: 'פסח',
      positions: [
        { top: '8%', right: '6%', fontSize: '48px', opacity: 0.25, rotate: -15 },
        { bottom: '10%', left: '5%', fontSize: '36px', opacity: 0.2, rotate: 10 },
        { top: '15%', left: '8%', fontSize: '28px', opacity: 0.15, rotate: 20 },
      ],
    },
  },
  {
    keywords: ['ראש השנה', 'שנה טובה', 'תפוח', 'דבש', 'שופר'],
    decoration: {
      emoji: '🍎',
      label: 'ראש השנה',
      positions: [
        { top: '6%', right: '5%', fontSize: '44px', opacity: 0.25, rotate: -10 },
        { bottom: '8%', left: '6%', fontSize: '38px', opacity: 0.2, rotate: 15 },
        { top: '12%', left: '10%', fontSize: '30px', opacity: 0.15 },
      ],
    },
  },
  {
    keywords: ['חנוכה', 'חנוכיה', 'סביבון', 'סופגניה', 'נר'],
    decoration: {
      emoji: '🕎',
      label: 'חנוכה',
      positions: [
        { top: '5%', right: '5%', fontSize: '50px', opacity: 0.25 },
        { bottom: '8%', left: '5%', fontSize: '32px', opacity: 0.18, rotate: -10 },
        { top: '50%', right: '3%', fontSize: '24px', opacity: 0.12, rotate: 15 },
      ],
    },
  },
  {
    keywords: ['פורים', 'תחפושת', 'משלוח מנות', 'מגילה', 'המן'],
    decoration: {
      emoji: '🎭',
      label: 'פורים',
      positions: [
        { top: '5%', right: '5%', fontSize: '48px', opacity: 0.25, rotate: -12 },
        { bottom: '8%', left: '6%', fontSize: '36px', opacity: 0.2, rotate: 8 },
        { top: '40%', left: '3%', fontSize: '28px', opacity: 0.15 },
      ],
    },
  },
  {
    keywords: ['סוכות', 'סוכה', 'לולב', 'אתרוג', 'ארבעת המינים'],
    decoration: {
      emoji: '🌿',
      label: 'סוכות',
      positions: [
        { top: '5%', right: '4%', fontSize: '44px', opacity: 0.25, rotate: -20 },
        { bottom: '6%', left: '5%', fontSize: '38px', opacity: 0.2, rotate: 15 },
        { top: '45%', right: '3%', fontSize: '26px', opacity: 0.15 },
      ],
    },
  },
  {
    keywords: ['שבועות', 'ביכורים', 'חלב', 'גבינה', 'תורה'],
    decoration: {
      emoji: '🧀',
      label: 'שבועות',
      positions: [
        { top: '6%', right: '5%', fontSize: '44px', opacity: 0.22 },
        { bottom: '10%', left: '6%', fontSize: '34px', opacity: 0.18, rotate: 10 },
      ],
    },
  },
  {
    keywords: ['יום הולדת', 'מסיבה', 'חגיגה', 'יומולדת'],
    decoration: {
      emoji: '🎂',
      label: 'יום הולדת',
      positions: [
        { top: '5%', right: '5%', fontSize: '48px', opacity: 0.25 },
        { bottom: '8%', left: '5%', fontSize: '36px', opacity: 0.2, rotate: -10 },
        { top: '35%', left: '3%', fontSize: '28px', opacity: 0.15, rotate: 15 },
      ],
    },
  },
  {
    keywords: ['חתונה', 'כלה', 'חתן', 'טקס', 'נישואין', 'אירוסין'],
    decoration: {
      emoji: '💍',
      label: 'חתונה',
      positions: [
        { top: '5%', right: '6%', fontSize: '44px', opacity: 0.22 },
        { bottom: '8%', left: '5%', fontSize: '36px', opacity: 0.18, rotate: 15 },
        { top: '50%', right: '3%', fontSize: '24px', opacity: 0.12 },
      ],
    },
  },
  {
    keywords: ['ברית', 'בריתה', 'ברית מילה'],
    decoration: {
      emoji: '👶',
      label: 'ברית',
      positions: [
        { top: '6%', right: '5%', fontSize: '44px', opacity: 0.22 },
        { bottom: '10%', left: '6%', fontSize: '32px', opacity: 0.18 },
      ],
    },
  },
  {
    keywords: ['בר מצווה', 'בת מצווה'],
    decoration: {
      emoji: '✡️',
      label: 'בר/בת מצווה',
      positions: [
        { top: '5%', right: '5%', fontSize: '44px', opacity: 0.2 },
        { bottom: '8%', left: '5%', fontSize: '34px', opacity: 0.18, rotate: 10 },
      ],
    },
  },
  {
    keywords: ['שבת', 'שבת שלום', 'נרות שבת'],
    decoration: {
      emoji: '🕯️',
      label: 'שבת',
      positions: [
        { top: '5%', right: '5%', fontSize: '40px', opacity: 0.22 },
        { bottom: '8%', left: '6%', fontSize: '32px', opacity: 0.18 },
      ],
    },
  },
  {
    keywords: ['טו בשבט', 'עצים', 'נטיעות'],
    decoration: {
      emoji: '🌳',
      label: 'טו בשבט',
      positions: [
        { top: '5%', right: '5%', fontSize: '48px', opacity: 0.25, rotate: -5 },
        { bottom: '6%', left: '4%', fontSize: '40px', opacity: 0.2, rotate: 8 },
        { top: '40%', left: '3%', fontSize: '30px', opacity: 0.12 },
      ],
    },
  },
  {
    keywords: ['יום העצמאות', 'עצמאות', 'ישראל'],
    decoration: {
      emoji: '🇮🇱',
      label: 'יום העצמאות',
      positions: [
        { top: '5%', right: '5%', fontSize: '44px', opacity: 0.25 },
        { bottom: '8%', left: '5%', fontSize: '36px', opacity: 0.2 },
      ],
    },
  },
];

/**
 * Detect thematic decorations based on text content.
 * Returns the first matching theme or null.
 */
export function detectTheme(text: string): ThematicDecoration | null {
  const normalized = text.toLowerCase();
  for (const theme of themes) {
    if (theme.keywords.some(kw => normalized.includes(kw))) {
      return theme.decoration;
    }
  }
  return null;
}

/**
 * Generate HTML decorative elements for the full-size template.
 */
export function generateDecorationHTML(decoration: ThematicDecoration): string {
  return decoration.positions
    .map(pos => {
      const style = [
        'position: absolute',
        'pointer-events: none',
        'user-select: none',
        `font-size: ${pos.fontSize}`,
        `opacity: ${pos.opacity}`,
        pos.top ? `top: ${pos.top}` : '',
        pos.bottom ? `bottom: ${pos.bottom}` : '',
        pos.left ? `left: ${pos.left}` : '',
        pos.right ? `right: ${pos.right}` : '',
        pos.rotate ? `transform: rotate(${pos.rotate}deg)` : '',
      ].filter(Boolean).join('; ');
      return `<div style="${style}">${decoration.emoji}</div>`;
    })
    .join('\n');
}

/**
 * Get extra emojis for the secondary theme associations.
 */
export function getSecondaryEmojis(text: string): string[] {
  const extras: string[] = [];
  if (text.includes('פסח')) extras.push('🫓', '🍷', '🥚');
  if (text.includes('ראש השנה')) extras.push('🍎', '🍯', '📯');
  if (text.includes('חנוכה')) extras.push('🕎', '🍩', '🪙');
  if (text.includes('פורים')) extras.push('🎭', '🍪', '👑');
  if (text.includes('סוכות')) extras.push('🌿', '🍋', '🛖');
  if (text.includes('יום הולדת')) extras.push('🎂', '🎈', '🎁');
  if (text.includes('חתונה')) extras.push('💍', '💐', '🥂');
  return extras;
}
