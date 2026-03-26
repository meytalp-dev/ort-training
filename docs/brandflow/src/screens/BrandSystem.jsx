import { useBrand } from '../context/BrandContext'
import ColorPalette from '../components/ColorPalette'
import { IconArrowLeft, IconCheck, IconSparkle } from '../components/Icons'

export default function BrandSystem() {
  const { brand, logo, navigate } = useBrand()

  const b = brand || {
    name: 'המותג שלי',
    colors: { primary: '#2A9D8F', secondary: '#3CC5B5', accent: '#E9C46A', neutralLight: '#F0F4F8', neutralDark: '#0F172A' },
    fonts: { heading: 'Heebo', body: 'Heebo' },
    headingWeight: '700', bodyWeight: '400',
    template: null,
  }
  const tmpl = b.template
  const c = b.colors
  const hFont = `'${b.fonts.heading}', sans-serif`
  const bFont = `'${b.fonts.body}', sans-serif`

  return (
    <div className="screen-enter min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('template-select')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
            <IconArrowLeft className="w-4 h-4 rotate-180" />
            שני סגנון
          </button>
          <div className="flex items-center gap-3">
            {logo && <img src={logo} alt="" className="w-7 h-7 rounded-lg object-contain" />}
            <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
              <IconCheck className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs text-brand-600 font-medium">המערכת העיצובית שלך</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <IconSparkle className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">המערכת העיצובית שלך</h1>
          <p className="text-gray-500 text-sm">כל מה שצריך כדי לשמור על עיצוב אחיד בכל התוצרים</p>
          {tmpl && <span className="inline-block mt-3 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">סגנון: {tmpl.name}</span>}
        </div>

        {/* ── SECTION 1: COLORS ── */}
        <Section title="פלטת צבעים">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'primary', label: 'ראשי' },
              { key: 'secondary', label: 'משני' },
              { key: 'accent', label: 'הדגשה' },
              { key: 'neutralLight', label: 'רקע' },
              { key: 'neutralDark', label: 'טקסט' },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl shadow-sm border border-black/5" style={{ backgroundColor: c[key] }} />
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <span className="text-[10px] text-gray-300 font-mono">{c[key]}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── SECTION 2: TYPOGRAPHY ── */}
        <Section title="טיפוגרפיה">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-3">HEADING</span>
              <div style={{ fontFamily: hFont, fontWeight: b.headingWeight, color: c.primary, fontSize: '28px', lineHeight: 1.2 }}>
                כותרת ראשית
              </div>
              <div style={{ fontFamily: hFont, fontWeight: b.headingWeight, color: c.neutralDark, fontSize: '20px', lineHeight: 1.3, marginTop: '8px' }}>
                כותרת משנית
              </div>
              <div className="mt-3 text-xs text-gray-400">{b.fonts.heading} · weight {b.headingWeight}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-3">BODY</span>
              <div style={{ fontFamily: bFont, fontWeight: b.bodyWeight, color: c.neutralDark, fontSize: '16px', lineHeight: 1.7 }}>
                טקסט גוף רגיל – כך ייראה התוכן השוטף בכל התוצרים שלך. הפונט נבחר כדי להיות קריא ונעים לעין.
              </div>
              <div className="mt-3 text-xs text-gray-400">{b.fonts.body} · weight {b.bodyWeight}</div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 3: COMPONENTS ── */}
        <Section title="רכיבים">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Button */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <span className="text-[10px] text-gray-400 block mb-4">כפתורים</span>
              <button className="w-full py-3 rounded-xl text-sm font-semibold mb-3 transition-all" style={{ backgroundColor: c.primary, color: c.neutralLight, fontFamily: bFont }}>
                כפתור ראשי
              </button>
              <button className="w-full py-3 rounded-xl text-sm font-medium border-2 transition-all" style={{ borderColor: c.primary, color: c.primary, fontFamily: bFont, backgroundColor: 'transparent' }}>
                כפתור משני
              </button>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <span className="text-[10px] text-gray-400 block mb-4">כרטיס</span>
              <div className="rounded-xl p-4" style={{ backgroundColor: c.neutralLight, borderRadius: tmpl?.layout?.cardRadius || '16px' }}>
                <div style={{ fontFamily: hFont, fontWeight: b.headingWeight, color: c.primary, fontSize: '14px' }}>כותרת כרטיס</div>
                <div style={{ fontFamily: bFont, fontWeight: b.bodyWeight, color: c.neutralDark, fontSize: '11px', opacity: 0.6, marginTop: '4px', lineHeight: 1.5 }}>
                  תוכן קצר שמסביר את הנושא
                </div>
                <div className="mt-3 h-0.5 rounded-full" style={{ backgroundColor: c.accent, width: '40%' }} />
              </div>
            </div>

            {/* Badge + divider */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <span className="text-[10px] text-gray-400 block mb-4">תגיות וקווים</span>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>תגית ראשונה</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.accent}20`, color: c.neutralDark }}>תגית שנייה</span>
              </div>
              <div className="h-px w-full rounded" style={{ backgroundColor: c.neutralDark, opacity: 0.08 }} />
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.accent }} />
                <span style={{ fontFamily: bFont, fontSize: '11px', color: c.neutralDark, opacity: 0.5 }}>פריט ברשימה</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 4: APPLICATION PREVIEWS ── */}
        <Section title="איך זה נראה בפועל">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Presentation mockup */}
            <AppMockup label="מצגת" type="presentation" brand={b} logo={logo} />
            {/* Post mockup */}
            <AppMockup label="פוסט" type="post" brand={b} logo={logo} />
            {/* Document mockup */}
            <AppMockup label="מסמך" type="document" brand={b} logo={logo} />
          </div>
        </Section>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={() => navigate('template-select')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            שני סגנון
          </button>
          <button
            onClick={() => navigate('snapshot')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            ערכי צבעים
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function AppMockup({ label, type, brand, logo }) {
  const c = brand.colors
  const hFont = `'${brand.fonts.heading}', sans-serif`
  const bFont = `'${brand.fonts.body}', sans-serif`
  const tmpl = brand.template
  const isModern = tmpl?.layout?.headerStyle === 'full-color'
  const isWarm = tmpl?.layout?.headerStyle === 'warm-gradient'
  const isFormal = tmpl?.layout?.headerStyle === 'underline'

  if (type === 'presentation') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="aspect-[16/10] overflow-hidden relative" style={{ backgroundColor: c.neutralLight, direction: 'rtl' }}>
          {/* Decorative elements per template */}
          {isModern && <svg className="absolute w-32 h-32 -top-8 -left-8 opacity-10" viewBox="0 0 200 200"><path fill={c.accent} d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.3,29.1,73.1,42.1C64.9,55.1,54.1,66.5,41,74.3C27.9,82.1,12.5,86.3,-2.2,89.8C-16.8,93.3,-33.7,96.1,-47.6,89.3C-61.5,82.6,-72.4,66.3,-79.2,49.5C-86,32.7,-88.6,15.3,-87.5,0.6C-86.4,-14.1,-81.6,-28.3,-73.6,-40.4C-65.6,-52.5,-54.4,-62.5,-41.5,-70.3C-28.6,-78.1,-14.3,-83.7,0.6,-84.7C15.5,-85.8,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" /></svg>}
          {isWarm && <svg className="absolute w-20 h-20 top-2 left-2 opacity-5" viewBox="0 0 100 100" fill={c.accent}><path d="M50 5C50 5 90 25 90 60C90 80 72 95 50 95C28 95 10 80 10 60C10 25 50 5 50 5Z" /></svg>}

          {isModern ? (
            <div className="h-full flex flex-col" style={{ backgroundColor: c.primary }}>
              <div className="flex-1 flex flex-col justify-center p-5 relative z-10">
                {logo && <img src={logo} alt="" className="w-8 h-8 rounded object-contain mb-3 opacity-80" />}
                <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.neutralLight, fontSize: '13px' }}>כותרת המצגת</div>
                <div style={{ fontFamily: bFont, color: c.neutralLight, opacity: 0.5, fontSize: '8px', marginTop: '3px' }}>תת-כותרת</div>
              </div>
            </div>
          ) : isFormal ? (
            <div className="h-full flex flex-col p-5">
              <div className="h-1.5 w-full mb-3" style={{ backgroundColor: c.primary }} />
              <div className="flex items-center gap-2 mb-2">
                {logo && <img src={logo} alt="" className="w-6 h-6 rounded object-contain opacity-60" />}
                <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.neutralDark, fontSize: '12px' }}>כותרת המצגת</div>
              </div>
              <div className="h-px mb-2" style={{ backgroundColor: c.neutralDark, opacity: 0.1 }} />
              <div style={{ fontFamily: bFont, color: c.neutralDark, opacity: 0.3, fontSize: '7px' }}>תוכן...</div>
            </div>
          ) : isWarm ? (
            <div className="h-full flex flex-col p-5 relative z-10" style={{ background: `linear-gradient(135deg, ${c.neutralLight}, ${c.secondary}15)` }}>
              {logo && <img src={logo} alt="" className="w-7 h-7 rounded object-contain mb-2 opacity-60" />}
              <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.primary, fontSize: '14px' }}>כותרת המצגת</div>
              <div style={{ fontFamily: bFont, color: c.neutralDark, opacity: 0.35, fontSize: '8px', marginTop: '3px' }}>תת-כותרת</div>
            </div>
          ) : (
            <div className="h-full flex flex-col p-5">
              <div className="h-1 w-8 rounded-full mb-3" style={{ backgroundColor: c.primary }} />
              {logo && <img src={logo} alt="" className="w-7 h-7 rounded object-contain mb-2 opacity-60" />}
              <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.primary, fontSize: '13px' }}>כותרת המצגת</div>
              <div style={{ fontFamily: bFont, color: c.neutralDark, opacity: 0.35, fontSize: '8px', marginTop: '3px' }}>תת-כותרת</div>
            </div>
          )}
        </div>
        <div className="px-4 py-3 text-center">
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      </div>
    )
  }

  if (type === 'post') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="aspect-square overflow-hidden relative" style={{ direction: 'rtl' }}>
          {isModern ? (
            <div className="h-full flex flex-col justify-center p-6 text-center relative" style={{ backgroundColor: c.primary }}>
              <svg className="absolute w-28 h-28 -top-6 -right-6 opacity-10" viewBox="0 0 200 200"><path fill={c.accent} d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.3,29.1,73.1,42.1C64.9,55.1,54.1,66.5,41,74.3C27.9,82.1,12.5,86.3,-2.2,89.8C-16.8,93.3,-33.7,96.1,-47.6,89.3C-61.5,82.6,-72.4,66.3,-79.2,49.5C-86,32.7,-88.6,15.3,-87.5,0.6C-86.4,-14.1,-81.6,-28.3,-73.6,-40.4C-65.6,-52.5,-54.4,-62.5,-41.5,-70.3C-28.6,-78.1,-14.3,-83.7,0.6,-84.7C15.5,-85.8,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" /></svg>
              {logo && <img src={logo} alt="" className="w-8 h-8 rounded object-contain mx-auto mb-3 opacity-80" />}
              <div className="relative z-10" style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.neutralLight, fontSize: '14px' }}>כותרת הפוסט</div>
              <div className="w-8 h-0.5 mx-auto mt-3 rounded" style={{ backgroundColor: c.accent }} />
            </div>
          ) : isWarm ? (
            <div className="h-full flex flex-col justify-center p-6 text-center relative" style={{ background: `linear-gradient(135deg, ${c.neutralLight}, ${c.secondary}15)` }}>
              <svg className="absolute w-16 h-16 top-1 right-1 opacity-5" viewBox="0 0 100 100" fill={c.accent}><path d="M50 5C50 5 90 25 90 60C90 80 72 95 50 95C28 95 10 80 10 60C10 25 50 5 50 5Z" /></svg>
              {logo && <img src={logo} alt="" className="w-7 h-7 rounded object-contain mx-auto mb-2 opacity-60" />}
              <div className="relative z-10" style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.primary, fontSize: '15px' }}>כותרת הפוסט</div>
            </div>
          ) : isFormal ? (
            <div className="h-full flex flex-col" style={{ backgroundColor: '#fff' }}>
              <div className="h-2" style={{ backgroundColor: c.primary }} />
              <div className="flex-1 flex flex-col justify-center p-6 text-center">
                {logo && <img src={logo} alt="" className="w-7 h-7 rounded object-contain mx-auto mb-2 opacity-60" />}
                <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.neutralDark, fontSize: '13px' }}>כותרת הפוסט</div>
                <div className="w-12 h-px mx-auto mt-2" style={{ backgroundColor: c.neutralDark, opacity: 0.12 }} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col" style={{ backgroundColor: '#fff' }}>
              <div className="h-1" style={{ backgroundColor: c.primary }} />
              <div className="flex-1 flex flex-col justify-center p-6 text-center">
                {logo && <img src={logo} alt="" className="w-7 h-7 rounded object-contain mx-auto mb-2 opacity-60" />}
                <div className="w-6 h-0.5 mx-auto rounded-full mb-3" style={{ backgroundColor: c.accent }} />
                <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: c.primary, fontSize: '13px' }}>כותרת הפוסט</div>
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-3 text-center"><span className="text-xs text-gray-400">{label}</span></div>
      </div>
    )
  }

  // Document
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-[3/4] overflow-hidden relative p-5" style={{ backgroundColor: '#fff', direction: 'rtl' }}>
        {isFormal && <div className="h-1.5 w-full mb-4 -mx-5 -mt-5 px-0" style={{ backgroundColor: c.primary, width: 'calc(100% + 2.5rem)', marginRight: '-1.25rem' }} />}
        {!isFormal && <div className="h-0.5 w-10 rounded-full mb-3" style={{ backgroundColor: c.primary }} />}

        <div className="flex items-center gap-2 mb-3">
          {logo && <img src={logo} alt="" className="w-5 h-5 rounded object-contain opacity-50" />}
          <div style={{ fontFamily: hFont, fontWeight: brand.headingWeight, color: isFormal ? c.neutralDark : c.primary, fontSize: '11px' }}>כותרת המסמך</div>
        </div>

        {isFormal ? (
          <div className="h-px mb-3" style={{ backgroundColor: c.neutralDark, opacity: 0.1 }} />
        ) : (
          <div className="h-px mb-3" style={{ backgroundColor: c.primary, opacity: 0.15 }} />
        )}

        {[1, 2, 3].map(i => (
          <div key={i} className="h-1.5 rounded-full mb-2" style={{ backgroundColor: c.neutralDark, opacity: 0.06, width: `${90 - i * 15}%` }} />
        ))}

        <div className="mt-4 space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
              <div className="h-1 rounded-full" style={{ backgroundColor: c.neutralDark, opacity: 0.05, width: `${70 - i * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 text-center"><span className="text-xs text-gray-400">{label}</span></div>
    </div>
  )
}
