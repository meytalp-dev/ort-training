const pageDecorations = [
  // ═══════════════════════════════════════
  // floral — פרחוני
  // ═══════════════════════════════════════
  {
    id: 'flower-branch',
    name: 'ענף פרחים',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 180 Q60 140 80 120 Q100 100 130 80 Q150 65 180 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M80 120 Q75 110 85 105" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M130 80 Q125 70 135 65" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="75" cy="115" r="6" fill="currentColor" opacity="0.3"/>
      <circle cx="75" cy="115" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="105" cy="95" r="7" fill="currentColor" opacity="0.25"/>
      <circle cx="105" cy="95" r="3.5" fill="currentColor" opacity="0.5"/>
      <circle cx="140" cy="68" r="5" fill="currentColor" opacity="0.3"/>
      <circle cx="140" cy="68" r="2.5" fill="currentColor" opacity="0.5"/>
      <circle cx="170" cy="40" r="6" fill="currentColor" opacity="0.25"/>
      <circle cx="170" cy="40" r="3" fill="currentColor" opacity="0.5"/>
      <ellipse cx="68" cy="130" rx="8" ry="4" transform="rotate(-40 68 130)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="90" cy="108" rx="7" ry="3.5" transform="rotate(-30 90 108)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="120" cy="85" rx="8" ry="4" transform="rotate(-25 120 85)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="150" cy="58" rx="7" ry="3.5" transform="rotate(-35 150 58)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="50" cy="150" rx="6" ry="3" transform="rotate(-50 50 150)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="42" cy="158" rx="6" ry="3" transform="rotate(-60 42 158)" fill="currentColor" opacity="0.2"/>
      <circle cx="55" cy="148" r="4" fill="currentColor" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'leaf-garland',
    name: 'גרלנדת עלים',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 120 Q50 80 100 100 Q150 120 190 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="30" cy="105" rx="10" ry="5" transform="rotate(-40 30 105)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="50" cy="93" rx="10" ry="5" transform="rotate(-30 50 93)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="70" cy="95" rx="10" ry="5" transform="rotate(-10 70 95)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="90" cy="100" rx="10" ry="5" transform="rotate(10 90 100)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="110" cy="105" rx="10" ry="5" transform="rotate(20 110 105)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="130" cy="107" rx="10" ry="5" transform="rotate(10 130 107)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="150" cy="102" rx="10" ry="5" transform="rotate(-15 150 102)" fill="currentColor" opacity="0.25"/>
      <ellipse cx="170" cy="92" rx="10" ry="5" transform="rotate(-30 170 92)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="40" cy="102" rx="8" ry="4" transform="rotate(40 40 102)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="80" cy="98" rx="8" ry="4" transform="rotate(50 80 98)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="120" cy="108" rx="8" ry="4" transform="rotate(-20 120 108)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="160" cy="96" rx="8" ry="4" transform="rotate(30 160 96)" fill="currentColor" opacity="0.15"/>
      <circle cx="60" cy="92" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="140" cy="106" r="2" fill="currentColor" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'flower-corner',
    name: 'פינת פרחים',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 190 Q10 100 10 50" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 190 Q100 190 150 190" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 190 Q30 170 50 150" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <circle cx="10" cy="50" r="8" fill="currentColor" opacity="0.2"/>
      <circle cx="10" cy="50" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="150" cy="190" r="8" fill="currentColor" opacity="0.2"/>
      <circle cx="150" cy="190" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="50" cy="150" r="10" fill="currentColor" opacity="0.15"/>
      <circle cx="50" cy="150" r="5" fill="currentColor" opacity="0.35"/>
      <ellipse cx="10" cy="80" rx="5" ry="10" transform="rotate(10 10 80)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="15" cy="110" rx="5" ry="10" transform="rotate(20 15 110)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="10" cy="140" rx="5" ry="10" transform="rotate(5 10 140)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="60" cy="190" rx="10" ry="5" transform="rotate(-10 60 190)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="100" cy="188" rx="10" ry="5" transform="rotate(-5 100 188)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="130" cy="190" rx="10" ry="5" fill="currentColor" opacity="0.15"/>
      <circle cx="30" cy="170" r="3" fill="currentColor" opacity="0.25"/>
      <circle cx="20" cy="160" r="2" fill="currentColor" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'rose-circle',
    name: 'זר ורדים',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="100" cy="30" r="8" fill="currentColor" opacity="0.25"/>
      <circle cx="100" cy="30" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="160" cy="60" r="7" fill="currentColor" opacity="0.2"/>
      <circle cx="160" cy="60" r="3.5" fill="currentColor" opacity="0.4"/>
      <circle cx="170" cy="100" r="8" fill="currentColor" opacity="0.25"/>
      <circle cx="170" cy="100" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="160" cy="140" r="7" fill="currentColor" opacity="0.2"/>
      <circle cx="160" cy="140" r="3.5" fill="currentColor" opacity="0.4"/>
      <circle cx="100" cy="170" r="8" fill="currentColor" opacity="0.25"/>
      <circle cx="100" cy="170" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="40" cy="140" r="7" fill="currentColor" opacity="0.2"/>
      <circle cx="40" cy="140" r="3.5" fill="currentColor" opacity="0.4"/>
      <circle cx="30" cy="100" r="8" fill="currentColor" opacity="0.25"/>
      <circle cx="30" cy="100" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="40" cy="60" r="7" fill="currentColor" opacity="0.2"/>
      <circle cx="40" cy="60" r="3.5" fill="currentColor" opacity="0.4"/>
      <ellipse cx="130" cy="38" rx="10" ry="4" transform="rotate(30 130 38)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="168" cy="80" rx="10" ry="4" transform="rotate(70 168 80)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="168" cy="120" rx="10" ry="4" transform="rotate(110 168 120)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="130" cy="160" rx="10" ry="4" transform="rotate(150 130 160)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="70" cy="160" rx="10" ry="4" transform="rotate(-150 70 160)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="32" cy="120" rx="10" ry="4" transform="rotate(-110 32 120)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="32" cy="80" rx="10" ry="4" transform="rotate(-70 32 80)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="70" cy="38" rx="10" ry="4" transform="rotate(-30 70 38)" fill="currentColor" opacity="0.12"/>
    </svg>`
  },
  {
    id: 'wildflower-scatter',
    name: 'פרחי בר מפוזרים',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="40" r="5" fill="currentColor" opacity="0.2"/>
      <circle cx="30" cy="40" r="2" fill="currentColor" opacity="0.45"/>
      <line x1="30" y1="45" x2="30" y2="65" stroke="currentColor" stroke-width="1" opacity="0.2"/>
      <circle cx="150" cy="25" r="4" fill="currentColor" opacity="0.15"/>
      <circle cx="150" cy="25" r="2" fill="currentColor" opacity="0.35"/>
      <line x1="150" y1="29" x2="148" y2="48" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="80" cy="70" r="6" fill="currentColor" opacity="0.2"/>
      <circle cx="80" cy="70" r="3" fill="currentColor" opacity="0.4"/>
      <line x1="80" y1="76" x2="82" y2="95" stroke="currentColor" stroke-width="1" opacity="0.2"/>
      <circle cx="170" cy="90" r="5" fill="currentColor" opacity="0.18"/>
      <circle cx="170" cy="90" r="2.5" fill="currentColor" opacity="0.38"/>
      <line x1="170" y1="95" x2="168" y2="112" stroke="currentColor" stroke-width="1" opacity="0.18"/>
      <circle cx="45" cy="130" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="45" cy="130" r="2" fill="currentColor" opacity="0.4"/>
      <line x1="45" y1="134" x2="47" y2="150" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="120" cy="140" r="6" fill="currentColor" opacity="0.15"/>
      <circle cx="120" cy="140" r="3" fill="currentColor" opacity="0.35"/>
      <line x1="120" y1="146" x2="118" y2="165" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="180" cy="160" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="180" cy="160" r="2" fill="currentColor" opacity="0.4"/>
      <ellipse cx="25" cy="42" rx="6" ry="3" transform="rotate(-30 25 42)" fill="currentColor" opacity="0.1"/>
      <ellipse cx="85" cy="72" rx="7" ry="3" transform="rotate(20 85 72)" fill="currentColor" opacity="0.1"/>
      <ellipse cx="115" cy="142" rx="7" ry="3" transform="rotate(-15 115 142)" fill="currentColor" opacity="0.1"/>
    </svg>`
  },
  {
    id: 'olive-branch',
    name: 'ענף זית',
    category: 'floral',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 170 Q60 130 100 110 Q140 90 175 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="45" cy="150" rx="12" ry="5" transform="rotate(-50 45 150)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="55" cy="148" rx="12" ry="5" transform="rotate(-30 55 148)" fill="currentColor" opacity="0.18"/>
      <ellipse cx="70" cy="132" rx="12" ry="5" transform="rotate(-45 70 132)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="80" cy="128" rx="12" ry="5" transform="rotate(-25 80 128)" fill="currentColor" opacity="0.18"/>
      <ellipse cx="95" cy="115" rx="12" ry="5" transform="rotate(-40 95 115)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="108" cy="108" rx="12" ry="5" transform="rotate(-20 108 108)" fill="currentColor" opacity="0.18"/>
      <ellipse cx="125" cy="95" rx="12" ry="5" transform="rotate(-45 125 95)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="140" cy="82" rx="12" ry="5" transform="rotate(-30 140 82)" fill="currentColor" opacity="0.18"/>
      <ellipse cx="155" cy="65" rx="12" ry="5" transform="rotate(-50 155 65)" fill="currentColor" opacity="0.2"/>
      <ellipse cx="165" cy="55" rx="10" ry="4" transform="rotate(-35 165 55)" fill="currentColor" opacity="0.18"/>
      <circle cx="60" cy="140" r="3.5" fill="currentColor" opacity="0.3"/>
      <circle cx="90" cy="118" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="115" cy="100" r="3.5" fill="currentColor" opacity="0.3"/>
      <circle cx="148" cy="72" r="3" fill="currentColor" opacity="0.3"/>
    </svg>`
  },

  // ═══════════════════════════════════════
  // geometric — גיאומטרי
  // ═══════════════════════════════════════
  {
    id: 'dots-scatter',
    name: 'נקודות מפוזרות',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="30" r="3" fill="currentColor" opacity="0.2"/>
      <circle cx="70" cy="18" r="5" fill="currentColor" opacity="0.15"/>
      <circle cx="130" cy="35" r="4" fill="currentColor" opacity="0.25"/>
      <circle cx="175" cy="20" r="3" fill="currentColor" opacity="0.2"/>
      <circle cx="45" cy="65" r="6" fill="currentColor" opacity="0.12"/>
      <circle cx="100" cy="55" r="3" fill="currentColor" opacity="0.22"/>
      <circle cx="160" cy="70" r="5" fill="currentColor" opacity="0.18"/>
      <circle cx="20" cy="100" r="4" fill="currentColor" opacity="0.2"/>
      <circle cx="85" cy="95" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="140" cy="105" r="6" fill="currentColor" opacity="0.1"/>
      <circle cx="185" cy="95" r="3" fill="currentColor" opacity="0.22"/>
      <circle cx="55" cy="135" r="5" fill="currentColor" opacity="0.15"/>
      <circle cx="115" cy="140" r="3" fill="currentColor" opacity="0.25"/>
      <circle cx="170" cy="145" r="4" fill="currentColor" opacity="0.18"/>
      <circle cx="30" cy="170" r="3" fill="currentColor" opacity="0.22"/>
      <circle cx="90" cy="175" r="6" fill="currentColor" opacity="0.12"/>
      <circle cx="150" cy="180" r="2" fill="currentColor" opacity="0.28"/>
      <circle cx="60" cy="50" r="2" fill="currentColor" opacity="0.18"/>
      <circle cx="180" cy="130" r="3" fill="currentColor" opacity="0.15"/>
      <circle cx="15" cy="150" r="2" fill="currentColor" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'circles-cluster',
    name: 'עיגולים',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="30" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
      <circle cx="110" cy="70" r="25" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.18"/>
      <circle cx="95" cy="110" r="28" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
      <circle cx="125" cy="105" r="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
      <circle cx="65" cy="105" r="18" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <circle cx="100" cy="85" r="12" fill="currentColor" opacity="0.08"/>
      <circle cx="75" cy="90" r="8" fill="currentColor" opacity="0.06"/>
      <circle cx="120" cy="90" r="15" fill="currentColor" opacity="0.05"/>
      <circle cx="90" cy="70" r="6" fill="currentColor" opacity="0.1"/>
      <circle cx="110" cy="120" r="10" fill="currentColor" opacity="0.06"/>
      <circle cx="140" cy="80" r="12" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12"/>
      <circle cx="60" cy="65" r="10" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12"/>
      <circle cx="130" cy="130" r="14" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.1"/>
    </svg>`
  },
  {
    id: 'diamond-pattern',
    name: 'דפוס יהלומים',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,20 120,50 100,80 80,50" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
      <polygon points="50,50 70,80 50,110 30,80" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>
      <polygon points="150,50 170,80 150,110 130,80" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>
      <polygon points="100,80 120,110 100,140 80,110" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <polygon points="50,110 70,140 50,170 30,140" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <polygon points="150,110 170,140 150,170 130,140" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
      <polygon points="100,140 120,170 100,200 80,170" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>
      <polygon points="100,50 108,65 100,80 92,65" fill="currentColor" opacity="0.08"/>
      <polygon points="50,80 58,95 50,110 42,95" fill="currentColor" opacity="0.06"/>
      <polygon points="150,80 158,95 150,110 142,95" fill="currentColor" opacity="0.06"/>
      <polygon points="100,110 108,125 100,140 92,125" fill="currentColor" opacity="0.05"/>
      <circle cx="100" cy="50" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="50" cy="80" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="150" cy="80" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="100" cy="110" r="2" fill="currentColor" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'line-art-frame',
    name: 'מסגרת קווית',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="15" y1="15" x2="15" y2="80" stroke="currentColor" stroke-width="2" opacity="0.25" stroke-linecap="round"/>
      <line x1="15" y1="15" x2="80" y2="15" stroke="currentColor" stroke-width="2" opacity="0.25" stroke-linecap="round"/>
      <line x1="20" y1="20" x2="20" y2="60" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <line x1="20" y1="20" x2="60" y2="20" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <line x1="185" y1="185" x2="185" y2="120" stroke="currentColor" stroke-width="2" opacity="0.25" stroke-linecap="round"/>
      <line x1="185" y1="185" x2="120" y2="185" stroke="currentColor" stroke-width="2" opacity="0.25" stroke-linecap="round"/>
      <line x1="180" y1="180" x2="180" y2="140" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <line x1="180" y1="180" x2="140" y2="180" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="185" cy="185" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="80" cy="15" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="15" cy="80" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="120" cy="185" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="185" cy="120" r="2" fill="currentColor" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'confetti-pattern',
    name: 'קונפטי',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="25" r="4" fill="currentColor" opacity="0.2"/>
      <rect x="70" y="15" width="8" height="5" rx="1" transform="rotate(25 74 17)" fill="currentColor" opacity="0.18"/>
      <polygon points="140,20 145,30 135,30" fill="currentColor" opacity="0.2"/>
      <circle cx="180" cy="35" r="3" fill="currentColor" opacity="0.15"/>
      <rect x="20" y="70" width="7" height="4" rx="1" transform="rotate(-15 23 72)" fill="currentColor" opacity="0.2"/>
      <polygon points="85,60 90,70 80,70" fill="currentColor" opacity="0.18"/>
      <circle cx="155" cy="65" r="5" fill="currentColor" opacity="0.12"/>
      <polygon points="100,30 103,22 97,22" fill="currentColor" opacity="0.15"/>
      <rect x="50" y="100" width="9" height="5" rx="1" transform="rotate(40 54 102)" fill="currentColor" opacity="0.18"/>
      <circle cx="120" cy="95" r="3" fill="currentColor" opacity="0.22"/>
      <polygon points="170,110 175,120 165,120" fill="currentColor" opacity="0.15"/>
      <rect x="25" y="140" width="7" height="4" rx="1" transform="rotate(-30 28 142)" fill="currentColor" opacity="0.2"/>
      <circle cx="90" cy="145" r="4" fill="currentColor" opacity="0.15"/>
      <polygon points="145,140 150,150 140,150" fill="currentColor" opacity="0.2"/>
      <rect x="175" y="150" width="8" height="5" rx="1" transform="rotate(15 179 152)" fill="currentColor" opacity="0.18"/>
      <circle cx="55" cy="175" r="3" fill="currentColor" opacity="0.2"/>
      <polygon points="120,170 125,180 115,180" fill="currentColor" opacity="0.18"/>
      <rect x="160" y="180" width="7" height="4" rx="1" transform="rotate(-20 163 182)" fill="currentColor" opacity="0.15"/>
      <polygon points="40,50 43,44 37,44" fill="currentColor" opacity="0.12"/>
      <rect x="110" y="55" width="6" height="4" rx="1" transform="rotate(60 113 57)" fill="currentColor" opacity="0.15"/>
    </svg>`
  },

  // ═══════════════════════════════════════
  // stars — כוכבים ואור
  // ═══════════════════════════════════════
  {
    id: 'stars-scatter',
    name: 'כוכבים מפוזרים',
    category: 'stars',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="35,15 38,25 48,25 40,31 43,41 35,35 27,41 30,31 22,25 32,25" fill="currentColor" opacity="0.2"/>
      <polygon points="120,10 122,17 130,17 124,22 126,29 120,25 114,29 116,22 110,17 118,17" fill="currentColor" opacity="0.15"/>
      <polygon points="175,45 178,55 188,55 180,61 183,71 175,65 167,71 170,61 162,55 172,55" fill="currentColor" opacity="0.2"/>
      <polygon points="25,90 27,96 34,96 29,100 31,106 25,102 19,106 21,100 16,96 23,96" fill="currentColor" opacity="0.18"/>
      <polygon points="90,70 93,80 103,80 95,86 98,96 90,90 82,96 85,86 77,80 87,80" fill="currentColor" opacity="0.12"/>
      <polygon points="160,120 162,127 170,127 164,131 166,138 160,134 154,138 156,131 150,127 158,127" fill="currentColor" opacity="0.18"/>
      <polygon points="50,150 52,156 59,156 54,160 56,166 50,162 44,166 46,160 41,156 48,156" fill="currentColor" opacity="0.2"/>
      <polygon points="130,160 133,170 143,170 135,176 138,186 130,180 122,186 125,176 117,170 127,170" fill="currentColor" opacity="0.15"/>
      <polygon points="185,150 187,155 192,155 188,158 189,163 185,160 181,163 182,158 178,155 183,155" fill="currentColor" opacity="0.2"/>
      <polygon points="70,40 72,45 77,45 73,48 74,53 70,50 66,53 67,48 63,45 68,45" fill="currentColor" opacity="0.15"/>
      <polygon points="15,170 17,175 22,175 18,178 19,183 15,180 11,183 12,178 8,175 13,175" fill="currentColor" opacity="0.18"/>
      <polygon points="100,130 102,135 107,135 103,138 104,143 100,140 96,143 97,138 93,135 98,135" fill="currentColor" opacity="0.12"/>
    </svg>`
  },
  {
    id: 'sparkle-burst',
    name: 'ניצוצות',
    category: 'stars',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="100" y1="60" x2="100" y2="140" stroke="currentColor" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
      <line x1="60" y1="100" x2="140" y2="100" stroke="currentColor" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
      <line x1="72" y1="72" x2="128" y2="128" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <line x1="128" y1="72" x2="72" y2="128" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.35"/>
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.1"/>
      <circle cx="100" cy="58" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="100" cy="142" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="58" cy="100" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="142" cy="100" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="72" cy="72" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="128" cy="72" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="72" cy="128" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="128" cy="128" r="1.5" fill="currentColor" opacity="0.2"/>
      <line x1="85" y1="65" x2="115" y2="135" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="65" y1="85" x2="135" y2="115" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="115" y1="65" x2="85" y2="135" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="65" y1="115" x2="135" y2="85" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'moon-stars',
    name: 'ירח וכוכבים',
    category: 'stars',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 50 A40 40 0 1 0 90 130 A30 30 0 1 1 90 50" fill="currentColor" opacity="0.15"/>
      <polygon points="140,40 142,47 150,47 144,51 146,58 140,54 134,58 136,51 130,47 138,47" fill="currentColor" opacity="0.25"/>
      <polygon points="160,70 162,75 167,75 163,78 164,83 160,80 156,83 157,78 153,75 158,75" fill="currentColor" opacity="0.2"/>
      <polygon points="130,80 131,83 135,83 132,85 133,88 130,86 127,88 128,85 125,83 129,83" fill="currentColor" opacity="0.18"/>
      <polygon points="155,100 157,105 162,105 158,108 159,113 155,110 151,113 152,108 148,105 153,105" fill="currentColor" opacity="0.15"/>
      <polygon points="170,50 171,53 174,53 172,55 173,58 170,56 167,58 168,55 166,53 169,53" fill="currentColor" opacity="0.2"/>
      <polygon points="145,115 146,118 149,118 147,120 148,123 145,121 142,123 143,120 141,118 144,118" fill="currentColor" opacity="0.12"/>
      <circle cx="120" cy="60" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="165" cy="90" r="1" fill="currentColor" opacity="0.18"/>
      <circle cx="135" cy="100" r="1.5" fill="currentColor" opacity="0.15"/>
      <circle cx="150" cy="55" r="1" fill="currentColor" opacity="0.22"/>
    </svg>`
  },
  {
    id: 'stardust',
    name: 'אבק כוכבים',
    category: 'stars',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 170 Q60 140 80 120 Q100 100 130 80 Q155 60 180 30" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round" stroke-dasharray="2 4"/>
      <circle cx="35" cy="165" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="45" cy="155" r="1" fill="currentColor" opacity="0.25"/>
      <circle cx="55" cy="145" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="62" cy="138" r="1" fill="currentColor" opacity="0.3"/>
      <circle cx="72" cy="128" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="80" cy="120" r="2" fill="currentColor" opacity="0.18"/>
      <circle cx="88" cy="112" r="1" fill="currentColor" opacity="0.25"/>
      <circle cx="98" cy="103" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="108" cy="95" r="1" fill="currentColor" opacity="0.28"/>
      <circle cx="118" cy="87" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="128" cy="80" r="1.5" fill="currentColor" opacity="0.22"/>
      <circle cx="140" cy="70" r="1" fill="currentColor" opacity="0.25"/>
      <circle cx="152" cy="60" r="2" fill="currentColor" opacity="0.18"/>
      <circle cx="165" cy="48" r="1" fill="currentColor" opacity="0.3"/>
      <circle cx="175" cy="38" r="1.5" fill="currentColor" opacity="0.2"/>
      <polygon points="50,150 51,153 54,153 52,155 53,158 50,156 47,158 48,155 46,153 49,153" fill="currentColor" opacity="0.2"/>
      <polygon points="100,105 101,107 104,107 102,109 103,111 100,110 97,111 98,109 96,107 99,107" fill="currentColor" opacity="0.18"/>
      <polygon points="160,52 161,55 164,55 162,57 163,59 160,58 157,59 158,57 156,55 159,55" fill="currentColor" opacity="0.22"/>
      <circle cx="42" cy="160" r="0.8" fill="currentColor" opacity="0.15"/>
      <circle cx="145" cy="68" r="0.8" fill="currentColor" opacity="0.15"/>
    </svg>`
  },

  // ═══════════════════════════════════════
  // ornamental — עיטורים קלאסיים
  // ═══════════════════════════════════════
  {
    id: 'scroll-corner',
    name: 'עיטור פינתי קלאסי',
    category: 'ornamental',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 180 Q20 120 20 80 Q20 50 40 35 Q55 25 60 40 Q65 55 50 55 Q38 55 35 45" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25" stroke-linecap="round"/>
      <path d="M20 180 Q80 180 120 180 Q150 180 165 160 Q175 145 160 140 Q145 135 145 150 Q145 162 155 165" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25" stroke-linecap="round"/>
      <path d="M30 170 Q30 130 35 100" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M30 170 Q70 170 100 165" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M25 90 Q28 80 35 75" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12" stroke-linecap="round"/>
      <path d="M110 175 Q120 172 130 165" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12" stroke-linecap="round"/>
      <circle cx="20" cy="180" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="35" cy="45" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="155" cy="165" r="1.5" fill="currentColor" opacity="0.2"/>
      <path d="M40 160 Q45 155 50 160 Q55 165 50 170" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.1" stroke-linecap="round"/>
      <path d="M25 140 Q30 135 28 128" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.1" stroke-linecap="round"/>
      <path d="M80 175 Q82 168 88 170" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.1" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'divider-ornate',
    name: 'מפריד מעוטר',
    category: 'ornamental',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="100" x2="80" y2="100" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-linecap="round"/>
      <line x1="120" y1="100" x2="180" y2="100" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-linecap="round"/>
      <path d="M80 100 Q90 85 100 80 Q110 85 120 100" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.25" stroke-linecap="round"/>
      <path d="M80 100 Q90 115 100 120 Q110 115 120 100" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.25" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="100" cy="80" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="100" cy="120" r="2" fill="currentColor" opacity="0.2"/>
      <path d="M30 97 Q35 92 40 97" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M50 97 Q55 92 60 97" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M140 97 Q145 92 150 97" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M160 97 Q165 92 170 97" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <circle cx="20" cy="100" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="180" cy="100" r="2" fill="currentColor" opacity="0.2"/>
      <path d="M85 92 Q90 88 95 85" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.12" stroke-linecap="round"/>
      <path d="M105 85 Q110 88 115 92" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.12" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'scroll-frame',
    name: 'מסגרת קלף',
    category: 'ornamental',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 25 Q15 25 15 40 Q15 55 30 55 Q20 55 20 40 Q20 25 35 25" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.22" stroke-linecap="round"/>
      <path d="M170 25 Q185 25 185 40 Q185 55 170 55 Q180 55 180 40 Q180 25 165 25" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.22" stroke-linecap="round"/>
      <path d="M30 175 Q15 175 15 160 Q15 145 30 145 Q20 145 20 160 Q20 175 35 175" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.22" stroke-linecap="round"/>
      <path d="M170 175 Q185 175 185 160 Q185 145 170 145 Q180 145 180 160 Q180 175 165 175" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.22" stroke-linecap="round"/>
      <line x1="35" y1="25" x2="165" y2="25" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <line x1="35" y1="175" x2="165" y2="175" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <line x1="20" y1="55" x2="20" y2="145" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <line x1="180" y1="55" x2="180" y2="145" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <line x1="35" y1="30" x2="165" y2="30" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="35" y1="170" x2="165" y2="170" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="25" y1="55" x2="25" y2="145" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <line x1="175" y1="55" x2="175" y2="145" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/>
      <circle cx="15" cy="40" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="185" cy="40" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="15" cy="160" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="185" cy="160" r="2" fill="currentColor" opacity="0.15"/>
    </svg>`
  },
  {
    id: 'filigree',
    name: 'פיליגרן',
    category: 'ornamental',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 40 Q80 60 80 80 Q80 100 100 100 Q120 100 120 80 Q120 60 100 40" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-linecap="round"/>
      <path d="M100 100 Q80 100 80 120 Q80 140 100 160" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-linecap="round"/>
      <path d="M100 100 Q120 100 120 120 Q120 140 100 160" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-linecap="round"/>
      <path d="M100 40 Q90 50 85 60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M100 40 Q110 50 115 60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M85 70 Q75 65 65 70 Q55 80 65 85 Q75 90 80 80" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M115 70 Q125 65 135 70 Q145 80 135 85 Q125 90 120 80" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M85 120 Q70 125 65 135 Q60 145 70 148 Q80 145 85 135" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12" stroke-linecap="round"/>
      <path d="M115 120 Q130 125 135 135 Q140 145 130 148 Q120 145 115 135" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.12" stroke-linecap="round"/>
      <circle cx="100" cy="40" r="2.5" fill="currentColor" opacity="0.25"/>
      <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.2"/>
      <circle cx="100" cy="160" r="2.5" fill="currentColor" opacity="0.25"/>
      <circle cx="65" cy="77" r="1.5" fill="currentColor" opacity="0.15"/>
      <circle cx="135" cy="77" r="1.5" fill="currentColor" opacity="0.15"/>
      <circle cx="67" cy="142" r="1.5" fill="currentColor" opacity="0.12"/>
      <circle cx="133" cy="142" r="1.5" fill="currentColor" opacity="0.12"/>
    </svg>`
  },
  {
    id: 'baroque-corner',
    name: 'פינת בארוק',
    category: 'ornamental',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 185 Q15 140 20 110 Q25 80 40 60 Q55 42 75 35" fill="none" stroke="currentColor" stroke-width="2" opacity="0.22" stroke-linecap="round"/>
      <path d="M15 185 Q50 185 80 180 Q110 175 135 160 Q155 148 165 130" fill="none" stroke="currentColor" stroke-width="2" opacity="0.22" stroke-linecap="round"/>
      <path d="M25 175 Q25 145 30 120 Q35 95 50 78" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <path d="M25 175 Q55 175 85 170 Q110 165 130 152" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <path d="M40 60 Q50 50 55 55 Q60 60 50 65 Q42 68 38 62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <path d="M75 35 Q82 30 85 38 Q88 46 80 45 Q72 44 75 38" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M165 130 Q170 122 165 118 Q160 115 155 120 Q152 128 160 132" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18" stroke-linecap="round"/>
      <path d="M135 160 Q142 158 145 152 Q148 146 142 144 Q136 146 135 155" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15" stroke-linecap="round"/>
      <path d="M30 150 Q35 140 32 132 Q30 140 35 148" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.1" stroke-linecap="round"/>
      <path d="M60 178 Q65 170 60 165 Q58 170 62 176" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.1" stroke-linecap="round"/>
      <circle cx="15" cy="185" r="3" fill="currentColor" opacity="0.28"/>
      <circle cx="50" cy="65" r="1.5" fill="currentColor" opacity="0.18"/>
      <circle cx="80" cy="40" r="1.5" fill="currentColor" opacity="0.15"/>
      <circle cx="160" cy="125" r="1.5" fill="currentColor" opacity="0.18"/>
      <circle cx="140" cy="155" r="1.5" fill="currentColor" opacity="0.15"/>
    </svg>`
  },

  // ═══════════════════════════════════════
  // nature — טבע
  // ═══════════════════════════════════════
  {
    id: 'butterfly-trail',
    name: 'שביל פרפרים',
    category: 'nature',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 160 Q60 130 90 110 Q120 90 160 50" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.08" stroke-linecap="round" stroke-dasharray="3 5"/>
      <!-- butterfly 1 -->
      <path d="M40 155 Q30 145 35 140 Q40 135 45 145" fill="currentColor" opacity="0.2"/>
      <path d="M40 155 Q50 145 45 140 Q40 135 35 145" fill="currentColor" opacity="0.15"/>
      <line x1="40" y1="152" x2="40" y2="160" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
      <!-- butterfly 2 -->
      <path d="M85 115 Q75 105 78 100 Q83 95 88 105" fill="currentColor" opacity="0.18"/>
      <path d="M85 115 Q95 105 92 100 Q87 95 82 105" fill="currentColor" opacity="0.13"/>
      <line x1="85" y1="112" x2="85" y2="120" stroke="currentColor" stroke-width="0.8" opacity="0.18"/>
      <!-- butterfly 3 -->
      <path d="M125 80 Q115 70 118 65 Q123 60 128 70" fill="currentColor" opacity="0.15"/>
      <path d="M125 80 Q135 70 132 65 Q127 60 122 70" fill="currentColor" opacity="0.12"/>
      <line x1="125" y1="77" x2="125" y2="85" stroke="currentColor" stroke-width="0.8" opacity="0.15"/>
      <!-- butterfly 4 -->
      <path d="M158 52 Q150 44 152 40 Q156 36 160 44" fill="currentColor" opacity="0.2"/>
      <path d="M158 52 Q166 44 164 40 Q160 36 156 44" fill="currentColor" opacity="0.15"/>
      <line x1="158" y1="50" x2="158" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'bird-branch',
    name: 'ציפור על ענף',
    category: 'nature',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 120 Q60 110 100 105 Q140 100 180 95" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2" stroke-linecap="round"/>
      <path d="M40 115 Q45 110 55 112" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <path d="M150 100 Q155 95 165 97" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <ellipse cx="50" cy="118" rx="8" ry="4" transform="rotate(-8 50 118)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="80" cy="112" rx="8" ry="4" transform="rotate(-5 80 112)" fill="currentColor" opacity="0.12"/>
      <ellipse cx="130" cy="103" rx="8" ry="4" transform="rotate(-3 130 103)" fill="currentColor" opacity="0.15"/>
      <ellipse cx="160" cy="99" rx="8" ry="4" transform="rotate(-2 160 99)" fill="currentColor" opacity="0.12"/>
      <!-- bird body -->
      <ellipse cx="108" cy="92" rx="10" ry="7" transform="rotate(-10 108 92)" fill="currentColor" opacity="0.2"/>
      <!-- bird head -->
      <circle cx="118" cy="85" r="5" fill="currentColor" opacity="0.22"/>
      <!-- beak -->
      <polygon points="123,84 130,83 123,86" fill="currentColor" opacity="0.25"/>
      <!-- tail -->
      <path d="M98 95 Q90 90 85 95" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.18" stroke-linecap="round"/>
      <path d="M98 96 Q88 94 84 100" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
      <!-- eye -->
      <circle cx="120" cy="84" r="1.5" fill="currentColor" opacity="0.35"/>
      <!-- wing -->
      <path d="M105 90 Q110 82 115 88" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" stroke-linecap="round"/>
      <!-- legs -->
      <line x1="106" y1="98" x2="106" y2="105" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
      <line x1="112" y1="97" x2="112" y2="105" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
    </svg>`
  },
  {
    id: 'cloud-sun',
    name: 'עננים ושמש',
    category: 'nature',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- sun -->
      <circle cx="150" cy="55" r="18" fill="currentColor" opacity="0.12"/>
      <circle cx="150" cy="55" r="12" fill="currentColor" opacity="0.08"/>
      <line x1="150" y1="28" x2="150" y2="18" stroke="currentColor" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
      <line x1="150" y1="82" x2="150" y2="92" stroke="currentColor" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
      <line x1="123" y1="55" x2="113" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
      <line x1="177" y1="55" x2="187" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
      <line x1="131" y1="36" x2="124" y2="29" stroke="currentColor" stroke-width="1" opacity="0.12" stroke-linecap="round"/>
      <line x1="169" y1="74" x2="176" y2="81" stroke="currentColor" stroke-width="1" opacity="0.12" stroke-linecap="round"/>
      <line x1="169" y1="36" x2="176" y2="29" stroke="currentColor" stroke-width="1" opacity="0.12" stroke-linecap="round"/>
      <line x1="131" y1="74" x2="124" y2="81" stroke="currentColor" stroke-width="1" opacity="0.12" stroke-linecap="round"/>
      <!-- cloud 1 -->
      <path d="M40 100 Q40 80 60 80 Q65 65 85 70 Q100 60 110 75 Q125 70 125 85 Q140 85 140 100 Q140 115 125 115 L55 115 Q40 115 40 100Z" fill="currentColor" opacity="0.1"/>
      <!-- cloud 2 -->
      <path d="M60 145 Q60 132 75 132 Q78 122 92 125 Q100 120 108 130 Q118 128 118 138 Q128 138 128 148 Q128 158 115 158 L72 158 Q60 158 60 145Z" fill="currentColor" opacity="0.07"/>
    </svg>`
  },
  {
    id: 'rainbow-small',
    name: 'קשת קטנה',
    category: 'nature',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 140 A70 70 0 0 1 170 140" fill="none" stroke="currentColor" stroke-width="3" opacity="0.12" stroke-linecap="round"/>
      <path d="M40 140 A60 60 0 0 1 160 140" fill="none" stroke="currentColor" stroke-width="3" opacity="0.1" stroke-linecap="round"/>
      <path d="M50 140 A50 50 0 0 1 150 140" fill="none" stroke="currentColor" stroke-width="3" opacity="0.08" stroke-linecap="round"/>
      <path d="M60 140 A40 40 0 0 1 140 140" fill="none" stroke="currentColor" stroke-width="3" opacity="0.06" stroke-linecap="round"/>
      <path d="M70 140 A30 30 0 0 1 130 140" fill="none" stroke="currentColor" stroke-width="3" opacity="0.05" stroke-linecap="round"/>
      <!-- clouds at base -->
      <circle cx="30" cy="142" r="8" fill="currentColor" opacity="0.08"/>
      <circle cx="22" cy="145" r="6" fill="currentColor" opacity="0.06"/>
      <circle cx="38" cy="146" r="7" fill="currentColor" opacity="0.07"/>
      <circle cx="170" cy="142" r="8" fill="currentColor" opacity="0.08"/>
      <circle cx="162" cy="145" r="6" fill="currentColor" opacity="0.06"/>
      <circle cx="178" cy="146" r="7" fill="currentColor" opacity="0.07"/>
      <!-- sparkles -->
      <circle cx="100" cy="68" r="1.5" fill="currentColor" opacity="0.2"/>
      <circle cx="75" cy="78" r="1" fill="currentColor" opacity="0.15"/>
      <circle cx="125" cy="78" r="1" fill="currentColor" opacity="0.15"/>
      <circle cx="55" cy="100" r="1.5" fill="currentColor" opacity="0.12"/>
      <circle cx="145" cy="100" r="1.5" fill="currentColor" opacity="0.12"/>
    </svg>`
  },
  {
    id: 'hearts-scatter',
    name: 'לבבות מפוזרים',
    category: 'nature',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 45 Q30 30 42 30 Q55 30 55 45 Q55 60 42 70 Q30 60 30 45Z" fill="currentColor" opacity="0.15" transform="rotate(-10 42 50)"/>
      <path d="M140 25 Q140 15 148 15 Q156 15 156 25 Q156 35 148 42 Q140 35 140 25Z" fill="currentColor" opacity="0.12" transform="rotate(15 148 28)"/>
      <path d="M80 80 Q80 68 90 68 Q100 68 100 80 Q100 92 90 100 Q80 92 80 80Z" fill="currentColor" opacity="0.1" transform="rotate(-5 90 84)"/>
      <path d="M165 75 Q165 67 172 67 Q179 67 179 75 Q179 83 172 89 Q165 83 165 75Z" fill="currentColor" opacity="0.18" transform="rotate(8 172 78)"/>
      <path d="M25 130 Q25 122 32 122 Q39 122 39 130 Q39 138 32 144 Q25 138 25 130Z" fill="currentColor" opacity="0.15" transform="rotate(-12 32 133)"/>
      <path d="M110 120 Q110 108 120 108 Q130 108 130 120 Q130 132 120 140 Q110 132 110 120Z" fill="currentColor" opacity="0.12" transform="rotate(5 120 124)"/>
      <path d="M55 155 Q55 147 62 147 Q69 147 69 155 Q69 163 62 169 Q55 163 55 155Z" fill="currentColor" opacity="0.18" transform="rotate(-8 62 158)"/>
      <path d="M155 150 Q155 140 163 140 Q171 140 171 150 Q171 160 163 167 Q155 160 155 150Z" fill="currentColor" opacity="0.1" transform="rotate(12 163 153)"/>
      <path d="M95 170 Q95 164 100 164 Q105 164 105 170 Q105 176 100 180 Q95 176 95 170Z" fill="currentColor" opacity="0.15"/>
      <path d="M175 115 Q175 111 179 111 Q183 111 183 115 Q183 119 179 122 Q175 119 175 115Z" fill="currentColor" opacity="0.12" transform="rotate(-15 179 116)"/>
    </svg>`
  }
];
