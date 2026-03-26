export default function OutputPreview({ type, brand, formData }) {
  if (!brand || !formData) return null

  const { colors, fonts, headingWeight = '700', bodyWeight = '400', templateRules } = brand
  const rules = templateRules || {}
  const layout = rules.layout || {}
  const colorUsage = rules.colorUsage || {}
  const spacing = rules.spacing || {}

  // Auto-expand: generate subtitle and fallback bullets if user left them empty
  const title = formData.title || 'כותרת לדוגמה'
  const text = formData.text || ''
  const userBullets = formData.bullets ? formData.bullets.split('\n').filter(b => b.trim()) : []
  const bullets = userBullets.length > 0 ? userBullets : [
    'נקודה ראשונה עם מידע חשוב',
    'נקודה שנייה עם פרטים נוספים',
    'נקודה שלישית לסיכום',
  ]
  const subtitle = text || 'תוכן קצר שמלווה את הכותרת ומסביר בקצרה'

  // Resolve template style
  const isClean = layout.headerStyle === 'accent-bar'
  const isModern = layout.headerStyle === 'full-color'
  const isFormal = layout.headerStyle === 'underline'
  const isWarm = layout.headerStyle === 'warm-gradient'

  const radius = layout.cardRadius || '18px'
  const headingFont = `'${fonts.heading}', sans-serif`
  const bodyFont = `'${fonts.body}', sans-serif`

  // ── CLEAN EDUCATIONAL ──
  if (isClean) {
    return renderClean({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius, spacing })
  }

  // ── MODERN BOLD ──
  if (isModern) {
    return renderModern({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius, spacing })
  }

  // ── FORMAL INSTITUTIONAL ──
  if (isFormal) {
    return renderFormal({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius, spacing })
  }

  // ── WARM COMMUNITY ──
  if (isWarm) {
    return renderWarm({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius, spacing })
  }

  // Fallback
  return renderClean({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius, spacing })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLEAN EDUCATIONAL — subtle divider, light content blocks, spacious
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderClean({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius }) {
  const base = { fontFamily: bodyFont, backgroundColor: colors.neutralLight, color: colors.neutralDark, direction: 'rtl', borderRadius: radius }

  if (type === 'post') {
    return (
      <div style={{ ...base, backgroundColor: '#fff' }} className="aspect-square max-w-[320px] shadow-lg overflow-hidden flex flex-col">
        {/* Top accent bar */}
        <div className="h-2" style={{ backgroundColor: colors.primary }} />
        <div className="flex-1 flex flex-col justify-center p-8 text-center">
          <div className="w-10 h-0.5 mx-auto rounded-full mb-5" style={{ backgroundColor: colors.accent }} />
          <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.primary }} className="text-2xl mb-3 leading-tight">{title}</h1>
          <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.6 }} className="text-sm leading-relaxed">{subtitle}</p>
        </div>
        <div className="h-1" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
      </div>
    )
  }

  return (
    <div style={base} className="overflow-hidden shadow-lg">
      {/* Accent bar top */}
      <div className="h-1.5" style={{ backgroundColor: colors.primary }} />

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="w-10 h-0.5 rounded-full mb-4" style={{ backgroundColor: colors.accent }} />
        <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.primary }} className="text-2xl mb-2">{title}</h1>
        <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.5 }} className="text-sm">{subtitle}</p>
      </div>

      {/* Subtle divider */}
      <div className="mx-8" style={{ height: '1px', backgroundColor: colors.neutralDark, opacity: 0.08 }} />

      {/* Content in light block */}
      <div className="p-8 pt-6">
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: `0 1px 4px ${colors.neutralDark}08` }}>
          <ul className="space-y-4">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: colors.accent }} />
                <span style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODERN BOLD — abstract blob, layered layout, strong color
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderModern({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius }) {
  const base = { fontFamily: bodyFont, color: colors.neutralDark, direction: 'rtl', borderRadius: radius }

  // SVG blob as decorative background element
  const Blob = ({ color, opacity = 0.1, className = '' }) => (
    <svg className={`absolute ${className}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} fillOpacity={opacity} d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.3,29.1,73.1,42.1C64.9,55.1,54.1,66.5,41,74.3C27.9,82.1,12.5,86.3,-2.2,89.8C-16.8,93.3,-33.7,96.1,-47.6,89.3C-61.5,82.6,-72.4,66.3,-79.2,49.5C-86,32.7,-88.6,15.3,-87.5,0.6C-86.4,-14.1,-81.6,-28.3,-73.6,-40.4C-65.6,-52.5,-54.4,-62.5,-41.5,-70.3C-28.6,-78.1,-14.3,-83.7,0.6,-84.7C15.5,-85.8,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
  )

  if (type === 'post') {
    return (
      <div style={{ ...base, backgroundColor: colors.primary }} className="aspect-square max-w-[320px] shadow-lg overflow-hidden relative flex flex-col justify-center p-8 text-center">
        <Blob color={colors.accent} opacity={0.15} className="w-48 h-48 -top-10 -left-10" />
        <Blob color={colors.neutralLight} opacity={0.08} className="w-36 h-36 bottom-0 right-0" />
        <div className="relative z-10">
          <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.neutralLight }} className="text-3xl mb-3 leading-tight">{title}</h1>
          <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralLight, opacity: 0.7 }} className="text-sm">{subtitle}</p>
          <div className="w-12 h-1 mx-auto rounded mt-5" style={{ backgroundColor: colors.accent }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...base, backgroundColor: colors.neutralLight }} className="overflow-hidden shadow-lg">
      {/* Header with blob */}
      <div className="relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
        <Blob color={colors.accent} opacity={0.15} className="w-56 h-56 -top-16 -left-16" />
        <Blob color={colors.neutralLight} opacity={0.06} className="w-40 h-40 -bottom-8 right-4" />
        <div className="relative z-10 p-8">
          <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.neutralLight }} className="text-2xl mb-2">{title}</h1>
          <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralLight, opacity: 0.6 }} className="text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Layered content blocks */}
      <div className="p-6 -mt-3 relative z-20">
        <div className="space-y-3">
          {bullets.map((b, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: '#fff',
                boxShadow: `0 2px 8px ${colors.neutralDark}06`,
                borderRight: `3px solid ${colors.accent}`,
              }}
            >
              <span
                className="text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.primary, color: colors.neutralLight }}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMAL INSTITUTIONAL — top color bar, structured sections, precise
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderFormal({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius }) {
  const base = { fontFamily: bodyFont, backgroundColor: '#FFFFFF', color: colors.neutralDark, direction: 'rtl', borderRadius: radius }

  if (type === 'post') {
    return (
      <div style={base} className="aspect-square max-w-[320px] shadow-lg overflow-hidden flex flex-col border" bordercolor={`${colors.neutralDark}15`}>
        <div className="h-3" style={{ backgroundColor: colors.primary }} />
        <div className="flex-1 flex flex-col justify-center p-8">
          <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.neutralDark }} className="text-2xl mb-3 leading-tight">{title}</h1>
          <div className="w-16 h-0.5 mb-3" style={{ backgroundColor: colors.neutralDark, opacity: 0.15 }} />
          <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.5 }} className="text-sm leading-relaxed">{subtitle}</p>
        </div>
        <div className="px-8 pb-6">
          <div className="h-px w-full" style={{ backgroundColor: colors.neutralDark, opacity: 0.08 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={base} className="overflow-hidden shadow-lg border" >
      {/* Top color bar */}
      <div className="h-3" style={{ backgroundColor: colors.primary }} />

      {/* Header */}
      <div className="p-8 pb-5">
        <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.neutralDark }} className="text-2xl mb-2">{title}</h1>
        <div className="w-20 h-0.5 mb-3" style={{ backgroundColor: colors.neutralDark, opacity: 0.12 }} />
        <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.5 }} className="text-sm">{subtitle}</p>
      </div>

      {/* Section divider */}
      <div className="mx-8" style={{ height: '1px', backgroundColor: colors.neutralDark, opacity: 0.08 }} />

      {/* Structured sections */}
      <div className="p-8 pt-5 space-y-0">
        {bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-4 py-3"
            style={{ borderBottom: i < bullets.length - 1 ? `1px solid ${colors.neutralDark}0A` : 'none' }}
          >
            <div
              className="shrink-0 w-1 h-full min-h-[20px] rounded-full"
              style={{ backgroundColor: colors.primary, opacity: 0.6 - i * 0.15 }}
            />
            <span className="text-sm leading-relaxed" style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WARM COMMUNITY — soft decorative elements, rounded, inviting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderWarm({ type, title, subtitle, bullets, colors, headingFont, bodyFont, headingWeight, bodyWeight, radius }) {
  const warmBg = `linear-gradient(135deg, ${colors.neutralLight}, ${colors.secondary}18)`
  const base = { fontFamily: bodyFont, color: colors.neutralDark, direction: 'rtl', borderRadius: radius }

  // Decorative leaf SVG
  const Leaf = ({ color, className = '' }) => (
    <svg className={`absolute opacity-[0.08] ${className}`} viewBox="0 0 100 100" fill={color}>
      <path d="M50 5C50 5 90 25 90 60C90 80 72 95 50 95C28 95 10 80 10 60C10 25 50 5 50 5Z" />
      <path d="M50 20C50 20 50 95 50 95" stroke={color} strokeWidth="2" fill="none" opacity="0.3" />
    </svg>
  )

  // Decorative dots
  const Dots = ({ color, className = '' }) => (
    <svg className={`absolute ${className}`} width="60" height="60" viewBox="0 0 60 60" fill={color} opacity="0.06">
      {[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => (
        <circle key={`${r}-${c}`} cx={6 + c * 12} cy={6 + r * 12} r="2" />
      )))}
    </svg>
  )

  if (type === 'post') {
    return (
      <div style={{ ...base, background: warmBg }} className="aspect-square max-w-[320px] shadow-lg overflow-hidden relative flex flex-col justify-center p-8 text-center">
        <Leaf color={colors.accent} className="w-24 h-24 -top-2 -right-2 rotate-45" />
        <Leaf color={colors.primary} className="w-20 h-20 -bottom-4 -left-4 -rotate-30" />
        <Dots color={colors.neutralDark} className="top-4 left-4" />
        <div className="relative z-10">
          <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.primary }} className="text-3xl mb-3 leading-tight">{title}</h1>
          <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.55 }} className="text-sm leading-relaxed">{subtitle}</p>
          <div className="flex justify-center gap-1.5 mt-5">
            {[colors.primary, colors.accent, colors.secondary].map((c, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.5 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...base, background: warmBg }} className="overflow-hidden shadow-lg relative">
      <Leaf color={colors.accent} className="w-28 h-28 -top-4 -right-4 rotate-12" />
      <Dots color={colors.neutralDark} className="bottom-4 left-4" />

      {/* Header */}
      <div className="relative z-10 p-8 pb-5">
        <div className="flex items-center gap-2 mb-4">
          {[colors.primary, colors.accent, colors.secondary].map((c, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.5 }} />
          ))}
        </div>
        <h1 style={{ fontFamily: headingFont, fontWeight: headingWeight, color: colors.primary }} className="text-2xl mb-2">{title}</h1>
        <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, color: colors.neutralDark, opacity: 0.5 }} className="text-sm">{subtitle}</p>
      </div>

      {/* Content cards */}
      <div className="relative z-10 px-8 pb-8 space-y-3">
        {bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: `1px solid ${colors.accent}20`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${colors.accent}20` }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {i === 0 && <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>}
                {i === 1 && <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></>}
                {i >= 2 && <><polyline points="20,6 9,17 4,12" /></>}
              </svg>
            </div>
            <span className="text-sm leading-relaxed" style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
