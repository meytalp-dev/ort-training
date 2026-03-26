/**
 * HTML Design Generator — Learni BrandFlow
 * Produces full, rich HTML designs based on studio selections.
 */

export function buildDesignHTML({ palette, style, fonts, output, logo }) {
  const p = palette
  const f = fonts
  const s = style
  const o = output

  const googleFonts = [f.heading, f.sub, f.body]
    .filter(font => font.source === 'google')
    .map(font => font.family.replace(/ /g, '+'))
    .filter((v, i, a) => a.indexOf(v) === i)

  const googleLink = googleFonts.length > 0
    ? `<link href="https://fonts.googleapis.com/css2?${googleFonts.map(f => `family=${f}:wght@300;400;500;600;700;800`).join('&')}&display=swap" rel="stylesheet" />`
    : ''

  const logoImg = logo
    ? `<img src="${logo}" style="width:52px;height:52px;object-fit:contain;border-radius:14px" alt="logo" />`
    : ''

  const logoSmall = logo
    ? `<img src="${logo}" style="width:36px;height:36px;object-fit:contain;border-radius:10px" alt="logo" />`
    : ''

  // Decorative SVG elements based on style
  const decor = buildDecor(s.id, p)

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
${googleLink}
<style>
@import url('https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@300;400;700;800&family=Amatic+SC:wght@400;700&family=Suez+One&family=Assistant:wght@300;400;600;700&family=Rubik+Mono+One&family=Rubik:wght@400;500;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:${o.w}px; height:${o.h}px; overflow:hidden;
  direction:rtl; position:relative;
  font-family:'${f.body.family}','Heebo',sans-serif;
  font-weight:${f.body.weight};
  color:${p.text};
}
h1,.h1 {
  font-family:'${f.heading.family}','Heebo',sans-serif;
  font-weight:${f.heading.weight};
  line-height:1.1;
}
h2,.h2 {
  font-family:'${f.sub.family}','Heebo',sans-serif;
  font-weight:${f.sub.weight};
  line-height:1.3;
}
.body { line-height:1.7; }
</style>
</head>
<body>
${buildLayout(s.id, p, f, o, logoImg, logoSmall, decor)}
</body>
</html>`
}

function buildDecor(styleId, p) {
  const leaf = `<svg viewBox="0 0 200 200" fill="${p.accent}" opacity="0.07"><path d="M100 10C100 10 180 50 180 120C180 160 144 190 100 190C56 190 20 160 20 120C20 50 100 10 100 10Z"/></svg>`
  const blob = `<svg viewBox="0 0 200 200"><path fill="${p.accent}" fill-opacity="0.1" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.3,29.1,73.1,42.1C64.9,55.1,54.1,66.5,41,74.3C27.9,82.1,12.5,86.3,-2.2,89.8C-16.8,93.3,-33.7,96.1,-47.6,89.3C-61.5,82.6,-72.4,66.3,-79.2,49.5C-86,32.7,-88.6,15.3,-87.5,0.6C-86.4,-14.1,-81.6,-28.3,-73.6,-40.4C-65.6,-52.5,-54.4,-62.5,-41.5,-70.3C-28.6,-78.1,-14.3,-83.7,0.6,-84.7C15.5,-85.8,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)"/></svg>`
  const dots = `<svg width="120" height="120" viewBox="0 0 120 120" fill="${p.text}" opacity="0.04">${Array.from({length:36},(_, i) => `<circle cx="${10+(i%6)*20}" cy="${10+Math.floor(i/6)*20}" r="2.5"/>`).join('')}</svg>`

  switch (styleId) {
    case 'warm-botanical': return { topRight: leaf, bottomLeft: leaf, dots }
    case 'dramatic': return { topLeft: blob, bottomRight: blob }
    case 'playful': return { topLeft: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${p.accent}" opacity="0.08"/></svg>`, bottomRight: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${p.primary}" opacity="0.06"/></svg>`, dots }
    default: return {}
  }
}

function buildLayout(styleId, p, f, o, logoImg, logoSmall, decor) {
  const sc = Math.min(o.w, o.h) / 1080
  const sz = (v) => Math.round(v * sc)
  const pad = sz(60)
  const heroSz = sz(52)
  const subSz = sz(22)
  const bodySz = sz(16)

  const decorHTML = Object.entries(decor).map(([pos, svg]) => {
    const posStyle = {
      topRight: `top:-${sz(20)}px;right:-${sz(20)}px`,
      topLeft: `top:-${sz(30)}px;left:-${sz(30)}px`,
      bottomLeft: `bottom:-${sz(30)}px;left:-${sz(10)}px;transform:rotate(180deg)`,
      bottomRight: `bottom:-${sz(20)}px;right:-${sz(20)}px`,
      dots: `bottom:${sz(30)}px;left:${sz(30)}px`,
    }[pos] || ''
    const size = pos === 'dots' ? sz(100) : sz(180)
    return `<div style="position:absolute;${posStyle};width:${size}px;height:${size}px;pointer-events:none">${svg}</div>`
  }).join('')

  const bullets = ['נקודה ראשונה — מידע חשוב ומעניין', 'נקודה שנייה — פרטים נוספים', 'נקודה שלישית — סיכום']

  // ── WARM BOTANICAL ──
  if (styleId === 'warm-botanical') {
    return `
    <div style="width:100%;height:100%;background:linear-gradient(135deg,${p.bg},${p.accent}10);position:relative;overflow:hidden">
      ${decorHTML}
      <div style="position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:${pad}px">
        ${logoImg ? `<div style="margin-bottom:${sz(24)}px">${logoImg}</div>` : ''}
        <div style="width:${sz(50)}px;height:3px;background:${p.accent};border-radius:4px;margin-bottom:${sz(28)}px"></div>
        <h1 style="font-size:${heroSz}px;color:${p.primary};margin-bottom:${sz(12)}px">כותרת ראשית</h1>
        <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.5;margin-bottom:${sz(36)}px">תת-כותרת שמסבירה בקצרה על הנושא</h2>
        <div style="display:flex;flex-direction:column;gap:${sz(14)}px">
          ${bullets.map(b => `
            <div style="display:flex;align-items:flex-start;gap:${sz(14)}px;padding:${sz(18)}px;background:rgba(255,255,255,0.65);backdrop-filter:blur(12px);border-radius:${sz(16)}px;border:1px solid ${p.accent}25">
              <div style="width:${sz(10)}px;height:${sz(10)}px;border-radius:50%;background:${p.accent};margin-top:${sz(5)}px;flex-shrink:0"></div>
              <span class="body" style="font-size:${bodySz}px">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  }

  // ── EDU PRESENTATION ──
  if (styleId === 'edu-presentation') {
    return `
    <div style="width:100%;height:100%;background:${p.bg};position:relative;overflow:hidden">
      <div style="position:absolute;top:0;right:0;left:0;height:${sz(4)}px;background:linear-gradient(to left,${p.primary},${p.accent})"></div>
      <div style="width:100%;height:100%;display:flex;flex-direction:column;padding:${pad}px;padding-top:${sz(70)}px">
        <div style="display:flex;align-items:center;gap:${sz(16)}px;margin-bottom:${sz(24)}px">
          ${logoImg || ''}
          <div style="width:${sz(40)}px;height:3px;background:${p.accent};border-radius:4px"></div>
        </div>
        <h1 style="font-size:${heroSz}px;color:${p.primary};margin-bottom:${sz(8)}px">כותרת ראשית</h1>
        <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.45;margin-bottom:${sz(32)}px">תת-כותרת שמסבירה בקצרה</h2>
        <div style="height:1px;background:${p.text};opacity:0.06;margin-bottom:${sz(24)}px"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:${sz(14)}px">
          ${bullets.map((b, i) => `
            <div style="display:flex;align-items:flex-start;gap:${sz(14)}px;padding:${sz(18)}px;background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);border-radius:${sz(14)}px;border:1px solid ${p.primary}10;box-shadow:0 2px 8px ${p.text}06">
              <div style="width:${sz(30)}px;height:${sz(30)}px;border-radius:${sz(8)}px;background:${p.primary};color:${p.bg};display:flex;align-items:center;justify-content:center;font-size:${sz(14)}px;font-weight:700;flex-shrink:0">${i + 1}</div>
              <span class="body" style="font-size:${bodySz}px">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  }

  // ── DRAMATIC ──
  if (styleId === 'dramatic') {
    const isWide = o.w > o.h * 1.2
    return `
    <div style="width:100%;height:100%;display:flex;${isWide ? 'flex-direction:row' : 'flex-direction:column'};overflow:hidden;position:relative">
      ${decorHTML}
      <div style="flex:${isWide ? '0 0 50%' : '0 0 48%'};background:${p.primary};display:flex;flex-direction:column;justify-content:center;padding:${pad}px;position:relative;overflow:hidden">
        <div style="position:relative;z-index:2">
          ${logoImg ? `<div style="margin-bottom:${sz(20)}px">${logoImg}</div>` : ''}
          <h1 style="font-size:${sz(58)}px;color:${p.bg}">${isWide ? 'כותרת\nראשית' : 'כותרת ראשית'}</h1>
          <div style="width:${sz(60)}px;height:4px;background:${p.accent};border-radius:4px;margin-top:${sz(20)}px"></div>
        </div>
      </div>
      <div style="flex:1;background:${p.bg};display:flex;flex-direction:column;justify-content:center;padding:${pad}px">
        <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.6;margin-bottom:${sz(24)}px">תת-כותרת שמסבירה בקצרה</h2>
        <div style="display:flex;flex-direction:column;gap:${sz(16)}px">
          ${bullets.map(b => `
            <div style="display:flex;align-items:flex-start;gap:${sz(14)}px;padding-right:${sz(16)}px;border-right:3px solid ${p.accent}">
              <span class="body" style="font-size:${bodySz}px">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  }

  // ── PLAYFUL ──
  if (styleId === 'playful') {
    return `
    <div style="width:100%;height:100%;background:${p.bg};position:relative;overflow:hidden">
      ${decorHTML}
      <div style="position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${pad}px">
        ${logoImg ? `<div style="margin-bottom:${sz(24)}px">${logoImg}</div>` : ''}
        <h1 style="font-size:${sz(56)}px;color:${p.primary};margin-bottom:${sz(12)}px">כותרת ראשית</h1>
        <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.45;margin-bottom:${sz(32)}px">תת-כותרת שמסבירה בקצרה</h2>
        <div style="display:flex;gap:${sz(8)}px;margin-bottom:${sz(32)}px">
          ${[p.primary, p.accent, p.primary + '60'].map(c => `<div style="width:${sz(12)}px;height:${sz(12)}px;border-radius:50%;background:${c}"></div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:${sz(12)}px;width:100%;max-width:${sz(550)}px">
          ${bullets.map(b => `
            <div style="display:flex;align-items:center;gap:${sz(14)}px;padding:${sz(18)}px;background:rgba(255,255,255,0.75);backdrop-filter:blur(10px);border-radius:${sz(20)}px;border:1px solid ${p.accent}20;text-align:right">
              <div style="width:${sz(12)}px;height:${sz(12)}px;border-radius:50%;background:${p.accent};flex-shrink:0"></div>
              <span class="body" style="font-size:${bodySz}px">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  }

  // ── CLEAN MANAGEMENT ──
  if (styleId === 'clean-management') {
    return `
    <div style="width:100%;height:100%;background:#FFFFFF;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;right:0;left:0;height:${sz(5)}px;background:${p.primary}"></div>
      <div style="width:100%;height:100%;display:flex;flex-direction:column;padding:${pad}px;padding-top:${sz(70)}px">
        <div style="display:flex;align-items:center;gap:${sz(16)}px;margin-bottom:${sz(28)}px">
          ${logoImg || ''}
          <h1 style="font-size:${heroSz}px;color:${p.text}">כותרת ראשית</h1>
        </div>
        <div style="height:2px;background:${p.text};opacity:0.06;margin-bottom:${sz(24)}px"></div>
        <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.5;margin-bottom:${sz(32)}px">תת-כותרת שמסבירה בקצרה</h2>
        <div style="display:flex;flex-direction:column;gap:0">
          ${bullets.map((b, i) => `
            <div style="display:flex;align-items:flex-start;gap:${sz(18)}px;padding:${sz(16)}px 0;${i < bullets.length - 1 ? `border-bottom:1px solid ${p.text}08` : ''}">
              <div style="width:3px;min-height:${sz(24)}px;border-radius:2px;background:${p.primary};opacity:${0.8 - i * 0.2};flex-shrink:0;margin-top:2px"></div>
              <span class="body" style="font-size:${bodySz}px">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  }

  // ── PROFESSIONAL (default) ──
  return `
  <div style="width:100%;height:100%;background:${p.bg};position:relative;overflow:hidden">
    <div style="position:absolute;top:0;right:0;left:0;height:${sz(4)}px;background:${p.primary}"></div>
    <div style="width:100%;height:100%;display:flex;flex-direction:column;padding:${pad}px;padding-top:${sz(70)}px">
      <div style="display:flex;align-items:center;gap:${sz(16)}px;margin-bottom:${sz(28)}px">
        ${logoImg || ''}
        <div>
          <h1 style="font-size:${heroSz}px;color:${p.text}">כותרת ראשית</h1>
          <div style="width:${sz(80)}px;height:2px;background:${p.primary};opacity:0.2;margin-top:${sz(8)}px;border-radius:2px"></div>
        </div>
      </div>
      <h2 style="font-size:${subSz}px;color:${p.text};opacity:0.5;margin-bottom:${sz(36)}px">תת-כותרת שמסבירה בקצרה</h2>
      <div style="display:flex;flex-direction:column;gap:${sz(14)}px">
        ${bullets.map((b, i) => `
          <div style="display:flex;align-items:flex-start;gap:${sz(16)}px;padding:${sz(16)}px;border-right:3px solid ${p.primary};border-radius:0 ${sz(10)}px ${sz(10)}px 0;background:${p.primary}06">
            <span class="body" style="font-size:${bodySz}px">${b}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`
}
