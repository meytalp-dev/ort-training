/**
 * Fixed design templates from the Learni Design Studio.
 * Templates define STRUCTURE only (typography, layout, spacing, color usage rules).
 * Colors come from the user's brand (logo extraction or style-based).
 *
 * Each template has a distinct font pairing aligned with its visual identity.
 */

export const studioTemplates = [
  {
    id: 'clean-edu',
    name: 'נקי חינוכי',
    description: 'בהיר, מרווח, קריא. מושלם להדרכות ותוכן לימודי.',
    typography: {
      heading: { family: 'Suez One', weight: '400' },   // Suez One only has 400
      body: { family: 'Assistant', weight: '400', lineHeight: '1.7' },
    },
    layout: {
      structure: 'linear',
      headerStyle: 'accent-bar',
      cardRadius: '18px',
    },
    colorUsage: {
      mode: 'subtle',
      headerBg: 'neutralLight',
      headerText: 'primary',
      accentUse: 'dividers',
    },
    spacing: { cardPadding: '2rem', itemGap: '1rem' },
  },
  {
    id: 'modern-soft',
    name: 'מודרני רך',
    description: 'כותרות חזקות, צבע דומיננטי. מתאים לפוסטים וסיכומים.',
    typography: {
      heading: { family: 'Rubik Mono One', weight: '400' }, // Rubik Mono One only has 400
      body: { family: 'Rubik', weight: '400', lineHeight: '1.6' },
    },
    layout: {
      structure: 'blocks',
      headerStyle: 'full-color',
      cardRadius: '20px',
    },
    colorUsage: {
      mode: 'bold',
      headerBg: 'primary',
      headerText: 'neutralLight',
      accentUse: 'highlights',
    },
    spacing: { cardPadding: '1.75rem', itemGap: '0.75rem' },
  },
  {
    id: 'formal-clean',
    name: 'מוסדי נקי',
    description: 'מקצועי ומדויק. מתאים למסמכים רשמיים ודוחות.',
    typography: {
      heading: { family: 'Heebo', weight: '900' },
      body: { family: 'Heebo', weight: '400', lineHeight: '1.65' },
    },
    layout: {
      structure: 'hierarchy',
      headerStyle: 'underline',
      cardRadius: '12px',
    },
    colorUsage: {
      mode: 'minimal',
      headerBg: 'neutralLight',
      headerText: 'neutralDark',
      accentUse: 'borders-only',
    },
    spacing: { cardPadding: '1.5rem', itemGap: '0.75rem' },
  },
  {
    id: 'warm-community',
    name: 'קהילתי חם',
    description: 'חם, מזמין, ביתי. מושלם לתוכן להורים ולקהילה.',
    typography: {
      heading: { family: 'Amatic SC', weight: '700' },
      body: { family: 'Assistant', weight: '400', lineHeight: '1.75' },
    },
    layout: {
      structure: 'cards',
      headerStyle: 'warm-gradient',
      cardRadius: '24px',
    },
    colorUsage: {
      mode: 'warm',
      headerBg: 'warmGradient',
      headerText: 'primary',
      accentUse: 'decorative',
    },
    spacing: { cardPadding: '2rem', itemGap: '1rem' },
  },
]
