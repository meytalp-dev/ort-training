import pptxgen from 'pptxgenjs';
import type { ColorPalette, DesignStyle, FontCombo, ButtonStyle } from '@/data/studio';
import { getStyleFamily, type StyleFamily } from '@/lib/styleDecorations';
import { getBgFromPalette } from '@/lib/paletteBg';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function stripHash(hex: string) {
  return hex.replace('#', '');
}

// Map display font names to the exact names Google Slides recognizes
const pptxFontMap: Record<string, string> = {
  'Playpen Sans Hebrew': 'Playpen Sans',
};

function pptxFont(name: string): string {
  return pptxFontMap[name] || name;
}


function addOrganicDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Soft blobs in corners
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -0.5, y: -0.5, w: 3.5, h: 3.5,
    fill: { type: 'solid', color: colors[1] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10, y: 5.5, w: 4, h: 3,
    fill: { type: 'solid', color: colors[2] },
    opacity: 0.06,
  } as pptxgen.ShapeProps);
  // Scattered dots
  [{ x: 1.5, y: 5.8, s: 0.2 }, { x: 2.5, y: 1.2, s: 0.15 }, { x: 8, y: 1.5, s: 0.18 }, { x: 11, y: 4, s: 0.12 }].forEach((d, i) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: d.x, y: d.y, w: d.s, h: d.s,
      fill: { type: 'solid', color: colors[i % colors.length] },
      opacity: 0.2,
    } as pptxgen.ShapeProps);
  });
}

function addGeometricDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Top and bottom thin lines
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.06,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.15,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.44, w: 13.33, h: 0.06,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.15,
  } as pptxgen.ShapeProps);
  // Corner squares
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 0.4, w: 0.4, h: 0.4,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 1.0, w: 0.25, h: 0.25,
    fill: { type: 'solid', color: colors[1] },
    opacity: 0.06,
  } as pptxgen.ShapeProps);
  // Right side accent
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.6, y: 0, w: 0.73, h: 7.5,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.06,
  } as pptxgen.ShapeProps);
}

function addPlayfulDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Large playful circles
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -1, y: 4.5, w: 3, h: 3,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10, y: -1, w: 4, h: 4,
    fill: { type: 'solid', color: colors[2] },
    opacity: 0.07,
  } as pptxgen.ShapeProps);
  // Fun scattered dots
  const dots = [
    { x: 1.2, y: 1.5, s: 0.35, c: colors[1] },
    { x: 2.5, y: 5.8, s: 0.45, c: colors[3] || colors[0] },
    { x: 11.5, y: 3.8, s: 0.3, c: colors[0] },
    { x: 8.5, y: 6, s: 0.5, c: colors[4] || colors[1] },
    { x: 6.5, y: 0.8, s: 0.25, c: colors[2] },
  ];
  dots.forEach(d => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: d.x, y: d.y, w: d.s, h: d.s,
      fill: { type: 'solid', color: d.c },
      opacity: 0.18,
    } as pptxgen.ShapeProps);
  });
  // Bottom wave-like shape
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -2, y: 6.5, w: 17, h: 2,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.04,
  } as pptxgen.ShapeProps);
}

function addBoldDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Large diagonal block
  slide.addShape(pptx.ShapeType.rect, {
    x: -2, y: -1, w: 6, h: 10,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.05,
    rotate: -15,
  } as pptxgen.ShapeProps);
  // Bold accent bars at bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 6.8, w: 5, h: 0.15,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.4,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.05, w: 3, h: 0.1,
    fill: { type: 'solid', color: colors[1] },
    opacity: 0.3,
  } as pptxgen.ShapeProps);
  // Corner accent
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 11, y: -1.5, w: 4, h: 4,
    fill: { type: 'solid', color: colors[2] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
}

function addElegantDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Thin border frame
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 0.3, w: 12.53, h: 6.9,
    fill: { type: 'solid', color: 'FFFFFF' },
    opacity: 0,
    line: { color: colors[0], width: 0.5 },
  } as pptxgen.ShapeProps);
  // Small diamond at top center
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.4, y: 0.1, w: 0.25, h: 0.25,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.15,
    rotate: 45,
  } as pptxgen.ShapeProps);
  // Thin bottom line
  slide.addShape(pptx.ShapeType.rect, {
    x: 4, y: 7.0, w: 5.33, h: 0.03,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.12,
  } as pptxgen.ShapeProps);
}

function addEarthyDecorations(slide: pptxgen.Slide, pptx: pptxgen, colors: string[]) {
  // Top earth bands
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.45,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.12,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.45, w: 13.33, h: 0.2,
    fill: { type: 'solid', color: colors[1] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
  // Bottom organic shape
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -1, y: 6, w: 15, h: 3,
    fill: { type: 'solid', color: colors[2] },
    opacity: 0.04,
  } as pptxgen.ShapeProps);
  // Side texture marks
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.5, y: 2.5, w: 0.06, h: 0.6,
    fill: { type: 'solid', color: colors[0] },
    opacity: 0.12,
  } as pptxgen.ShapeProps);
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.7, y: 2.8, w: 0.06, h: 0.35,
    fill: { type: 'solid', color: colors[1] },
    opacity: 0.08,
  } as pptxgen.ShapeProps);
}

function addStyleDecorations(slide: pptxgen.Slide, pptx: pptxgen, family: StyleFamily, colors: string[]) {
  switch (family) {
    case 'organic': return addOrganicDecorations(slide, pptx, colors);
    case 'geometric': return addGeometricDecorations(slide, pptx, colors);
    case 'playful': return addPlayfulDecorations(slide, pptx, colors);
    case 'bold': return addBoldDecorations(slide, pptx, colors);
    case 'elegant': return addElegantDecorations(slide, pptx, colors);
    case 'earthy': return addEarthyDecorations(slide, pptx, colors);
  }
}

// ============ Main generator ============

export type OrgInfo = {
  name: string;
  role: string;
  phone: string;
  email: string;
  logoUrl: string | null;
};

export async function generateBrandPptx(
  palette: ColorPalette,
  style: DesignStyle,
  fontCombo: FontCombo,
  buttonStyle: ButtonStyle,
  orgInfo?: OrgInfo
) {
  const org = orgInfo || { name: '', role: '', phone: '', email: '', logoUrl: null };
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'CUSTOM_16x9', width: 13.33, height: 7.5 });
  pptx.layout = 'CUSTOM_16x9';

  const c = palette.colors;
  const bgHex = stripHash(getBgFromPalette(c));
  const primary = stripHash(c[0].hex);
  const secondary = stripHash(c[1]?.hex || c[0].hex);
  const tertiary = stripHash(c[2]?.hex || c[0].hex);
  const colorHexes = c.map(col => stripHash(col.hex));

  const headingFont = pptxFont(fontCombo.heading);
  const bodyFont = pptxFont(fontCombo.body);
  const family = getStyleFamily(style);

  const isRoundedBtn = parseInt(buttonStyle.css.borderRadius || '0') > 20;
  const btnRadius = isRoundedBtn ? 0.3 : 0.08;

  // ====== SLIDE 1: Title Slide ======
  const slide1 = pptx.addSlide();
  slide1.background = { color: bgHex };
  addStyleDecorations(slide1, pptx, family, colorHexes);

  // Tag badge
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 8.5, y: 1.0, w: 2.5, h: 0.45,
    fill: { type: 'solid', color: lighten(c[1]?.hex || c[0].hex, 0.85) },
    rectRadius: 0.2,
  });
  slide1.addText(style.tags[0] || 'מצגת', {
    x: 8.5, y: 1.0, w: 2.5, h: 0.45,
    align: 'center', fontFace: bodyFont, fontSize: 12, color: secondary, rtlMode: true,
  });

  // Main heading
  slide1.addText(org.name || 'הכותרת הראשית שלכם', {
    x: 2, y: 2.0, w: 9.5, h: 1.2,
    align: 'right', fontFace: headingFont, fontSize: 48, bold: true, color: primary, rtlMode: true,
  });

  // Sub heading
  slide1.addText(org.role || 'כותרת משנית – ערכו אותה לפי הצרכים שלכם', {
    x: 2, y: 3.2, w: 9.5, h: 0.7,
    align: 'right', fontFace: headingFont, fontSize: 26, color: secondary, rtlMode: true,
  });

  // Body text
  slide1.addText('כאן אפשר לכתוב הסבר קצר על בית הספר, המגמה או הנושא.\nהטקסט הזה ניתן לעריכה – לחצו פעמיים על כל טקסט כדי לשנות.', {
    x: 4, y: 4.2, w: 7.5, h: 1.2,
    align: 'right', fontFace: bodyFont, fontSize: 16, color: '555555', rtlMode: true, lineSpacingMultiple: 1.4,
  });

  // Buttons
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 9.0, y: 5.8, w: 2.5, h: 0.6,
    fill: { type: 'solid', color: primary }, rectRadius: btnRadius,
  });
  slide1.addText('כפתור ראשי', {
    x: 9.0, y: 5.8, w: 2.5, h: 0.6,
    align: 'center', fontFace: bodyFont, fontSize: 14, bold: true, color: 'FFFFFF',
  });
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 6.2, y: 5.8, w: 2.5, h: 0.6,
    fill: { type: 'solid', color: bgHex }, line: { color: primary, width: 2 }, rectRadius: btnRadius,
  });
  slide1.addText('כפתור משני', {
    x: 6.2, y: 5.8, w: 2.5, h: 0.6,
    align: 'center', fontFace: bodyFont, fontSize: 14, bold: true, color: primary,
  });

  // Color dots
  c.forEach((color, i) => {
    slide1.addShape(pptx.ShapeType.ellipse, {
      x: 1.2 + i * 0.8, y: 6.4, w: 0.5, h: 0.5,
      fill: { type: 'solid', color: stripHash(color.hex) }, line: { color: 'CCCCCC', width: 0.5 },
    });
    slide1.addText(color.hex, {
      x: 0.95 + i * 0.8, y: 6.95, w: 1, h: 0.3,
      align: 'center', fontSize: 7, color: '999999', fontFace: bodyFont,
    });
  });

  // ====== SLIDE 2: Content Cards ======
  const slide2 = pptx.addSlide();
  slide2.background = { color: bgHex };
  addStyleDecorations(slide2, pptx, family, colorHexes);

  slide2.addText('נושא השקף', {
    x: 2, y: 0.6, w: 9.5, h: 0.9,
    align: 'right', fontFace: headingFont, fontSize: 36, bold: true, color: primary, rtlMode: true,
  });

  const cardColors = [primary, secondary, tertiary];
  const cardTitles = ['ערך ראשון', 'ערך שני', 'ערך שלישי'];
  const cardTexts = [
    'הוסיפו כאן את התוכן שלכם – ערך, חזון או יעד.',
    'ערכו את הטקסט בקלות – לחיצה כפולה על כל אלמנט.',
    'שנו צבעים, גודל, מיקום – הכל ניתן להתאמה.',
  ];

  for (let i = 0; i < 3; i++) {
    const cardX = 9.3 - i * 3.5;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: cardX, y: 2.0, w: 3.2, h: 4.0,
      fill: { type: 'solid', color: lighten('#' + cardColors[i], 0.92) }, rectRadius: 0.15,
    });
    slide2.addShape(pptx.ShapeType.rect, {
      x: cardX + 2.8, y: 2.3, w: 0.12, h: 1.0,
      fill: { type: 'solid', color: cardColors[i] },
    });
    slide2.addShape(pptx.ShapeType.ellipse, {
      x: cardX + 1.2, y: 2.5, w: 0.7, h: 0.7,
      fill: { type: 'solid', color: cardColors[i] },
    });
    slide2.addText(`${i + 1}`, {
      x: cardX + 1.2, y: 2.5, w: 0.7, h: 0.7,
      align: 'center', fontFace: headingFont, fontSize: 22, bold: true, color: 'FFFFFF',
    });
    slide2.addText(cardTitles[i], {
      x: cardX + 0.3, y: 3.5, w: 2.6, h: 0.6,
      align: 'right', fontFace: headingFont, fontSize: 18, bold: true, color: cardColors[i], rtlMode: true,
    });
    slide2.addText(cardTexts[i], {
      x: cardX + 0.3, y: 4.1, w: 2.6, h: 1.2,
      align: 'right', fontFace: bodyFont, fontSize: 13, color: '666666', rtlMode: true, lineSpacingMultiple: 1.3,
    });
  }

  // ====== SLIDE 3: Diagram / Data Slide ======
  const slide3 = pptx.addSlide();
  slide3.background = { color: bgHex };
  addStyleDecorations(slide3, pptx, family, colorHexes);

  slide3.addText('נתונים ומספרים', {
    x: 2, y: 0.4, w: 9.5, h: 0.8,
    align: 'right', fontFace: headingFont, fontSize: 32, bold: true, color: primary, rtlMode: true,
  });
  slide3.addText('ערכו את המספרים והטקסטים בהתאם לנתונים שלכם', {
    x: 2, y: 1.1, w: 9.5, h: 0.5,
    align: 'right', fontFace: bodyFont, fontSize: 14, color: '888888', rtlMode: true,
  });

  // Bar chart simulation
  const barData = [
    { label: 'שנה א׳', pct: 0.6 },
    { label: 'שנה ב׳', pct: 0.8 },
    { label: 'שנה ג׳', pct: 0.55 },
    { label: 'שנה ד׳', pct: 0.95 },
  ];
  const chartX = 7.5;
  const chartY = 2.0;
  const chartH = 3.5;
  const barW = 1.0;
  const barGap = 0.3;

  barData.forEach((bar, i) => {
    const bx = chartX + i * (barW + barGap);
    const bh = chartH * bar.pct;
    const by = chartY + (chartH - bh);
    const barColor = colorHexes[i % colorHexes.length];

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: by, w: barW, h: bh,
      fill: { type: 'solid', color: barColor }, rectRadius: 0.06,
    });
    // Percentage on top
    slide3.addText(`${Math.round(bar.pct * 100)}%`, {
      x: bx, y: by - 0.35, w: barW, h: 0.35,
      align: 'center', fontFace: headingFont, fontSize: 14, bold: true, color: barColor,
    });
    // Label below
    slide3.addText(bar.label, {
      x: bx, y: chartY + chartH + 0.1, w: barW, h: 0.3,
      align: 'center', fontFace: bodyFont, fontSize: 10, color: '888888', rtlMode: true,
    });
  });

  // Chart baseline
  slide3.addShape(pptx.ShapeType.rect, {
    x: chartX - 0.1, y: chartY + chartH, w: barData.length * (barW + barGap), h: 0.03,
    fill: { type: 'solid', color: 'CCCCCC' },
  });

  // KPI numbers on left side
  const kpis = [
    { value: '350', label: 'תלמידים', color: colorHexes[0] },
    { value: '95%', label: 'זכאות בגרות', color: colorHexes[1] },
    { value: '12', label: 'מגמות לימוד', color: colorHexes[2] },
  ];

  kpis.forEach((kpi, i) => {
    const ky = 2.2 + i * 1.3;
    // KPI card
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 1.0, y: ky, w: 4.5, h: 1.05,
      fill: { type: 'solid', color: lighten('#' + kpi.color, 0.92) }, rectRadius: 0.1,
    });
    // Accent bar
    slide3.addShape(pptx.ShapeType.rect, {
      x: 5.2, y: ky + 0.15, w: 0.1, h: 0.75,
      fill: { type: 'solid', color: kpi.color },
    });
    // Value
    slide3.addText(kpi.value, {
      x: 1.2, y: ky + 0.05, w: 4, h: 0.6,
      align: 'right', fontFace: headingFont, fontSize: 28, bold: true, color: kpi.color, rtlMode: true,
    });
    // Label
    slide3.addText(kpi.label, {
      x: 1.2, y: ky + 0.6, w: 4, h: 0.35,
      align: 'right', fontFace: bodyFont, fontSize: 12, color: '888888', rtlMode: true,
    });
  });

  // ====== SLIDE 4: Process / Timeline ======
  const slide4 = pptx.addSlide();
  slide4.background = { color: bgHex };
  addStyleDecorations(slide4, pptx, family, colorHexes);

  slide4.addText('תהליך העבודה', {
    x: 2, y: 0.4, w: 9.5, h: 0.8,
    align: 'right', fontFace: headingFont, fontSize: 32, bold: true, color: primary, rtlMode: true,
  });

  // Timeline steps (RTL: right to left)
  const steps = [
    { num: '01', title: 'שלב ראשון', desc: 'תיאור קצר של השלב' },
    { num: '02', title: 'שלב שני', desc: 'תיאור קצר של השלב' },
    { num: '03', title: 'שלב שלישי', desc: 'תיאור קצר של השלב' },
    { num: '04', title: 'שלב רביעי', desc: 'תיאור קצר של השלב' },
  ];

  const timelineY = 3.0;
  // Connecting line
  slide4.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: timelineY + 0.45, w: 10, h: 0.04,
    fill: { type: 'solid', color: lighten('#' + primary, 0.7) },
  });

  steps.forEach((step, i) => {
    const sx = 10 - i * 2.8;
    const stepColor = colorHexes[i % colorHexes.length];

    // Circle with number
    slide4.addShape(pptx.ShapeType.ellipse, {
      x: sx, y: timelineY, w: 0.95, h: 0.95,
      fill: { type: 'solid', color: stepColor },
    });
    slide4.addText(step.num, {
      x: sx, y: timelineY, w: 0.95, h: 0.95,
      align: 'center', fontFace: headingFont, fontSize: 18, bold: true, color: 'FFFFFF',
    });
    // Title
    slide4.addText(step.title, {
      x: sx - 0.5, y: timelineY + 1.2, w: 2, h: 0.5,
      align: 'center', fontFace: headingFont, fontSize: 14, bold: true, color: stepColor, rtlMode: true,
    });
    // Description
    slide4.addText(step.desc, {
      x: sx - 0.5, y: timelineY + 1.7, w: 2, h: 0.6,
      align: 'center', fontFace: bodyFont, fontSize: 11, color: '888888', rtlMode: true, lineSpacingMultiple: 1.2,
    });
  });

  // ====== SLIDE 5: Quote / CTA ======
  const slide5 = pptx.addSlide();
  slide5.background = { color: primary };

  // Style-specific decoration on dark bg too
  if (family === 'elegant') {
    slide5.addShape(pptx.ShapeType.rect, {
      x: 0.6, y: 0.5, w: 12.13, h: 6.5,
      fill: { type: 'solid', color: 'FFFFFF' },
      opacity: 0,
      line: { color: lighten('#' + primary, 0.3), width: 0.5 },
    } as pptxgen.ShapeProps);
  } else if (family === 'playful') {
    [{ x: 1, y: 1, s: 1.5 }, { x: 10, y: 5, s: 2 }, { x: 8, y: 0.5, s: 1 }].forEach(d => {
      slide5.addShape(pptx.ShapeType.ellipse, {
        x: d.x, y: d.y, w: d.s, h: d.s,
        fill: { type: 'solid', color: lighten('#' + primary, 0.15) },
        opacity: 0.3,
      } as pptxgen.ShapeProps);
    });
  }

  slide5.addText('״', {
    x: 8.5, y: 0.8, w: 3, h: 2.5,
    align: 'center', fontFace: headingFont, fontSize: 120, color: lighten('#' + primary, 0.2),
  });
  slide5.addText('כאן אפשר לשים ציטוט מעורר השראה,\nאו הודעה חשובה שתרצו להדגיש.', {
    x: 2, y: 2.5, w: 9, h: 2,
    align: 'center', fontFace: headingFont, fontSize: 32, bold: true, color: 'FFFFFF', rtlMode: true, lineSpacingMultiple: 1.5,
  });
  slide5.addText(org.name ? `– ${org.name}` : '– השם שלכם או מקור הציטוט', {
    x: 2, y: 4.6, w: 9, h: 0.6,
    align: 'center', fontFace: bodyFont, fontSize: 16, color: lighten('#' + primary, 0.5), rtlMode: true,
  });
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 5.6, w: 3, h: 0.7,
    fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: btnRadius,
  });
  slide5.addText('לחצו כאן לפעולה', {
    x: 5.2, y: 5.6, w: 3, h: 0.7,
    align: 'center', fontFace: bodyFont, fontSize: 16, bold: true, color: primary,
  });

  // Bottom color strip
  const stripWidth = 13.33 / c.length;
  c.forEach((color, i) => {
    slide5.addShape(pptx.ShapeType.rect, {
      x: i * stripWidth, y: 7.1, w: stripWidth, h: 0.4,
      fill: { type: 'solid', color: stripHash(color.hex) },
    });
  });

  // Generate and download
  const fileName = `brand-template-${palette.id}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
