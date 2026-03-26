import { useBrand } from '../context/BrandContext'
import { studioTemplates } from '../data/studioTemplates'
import { IconArrowLeft, IconCheck } from '../components/Icons'
import { useState } from 'react'

export default function TemplateSelect() {
  const { brand, logo, navigate, setBrand } = useBrand()
  const [selected, setSelected] = useState(null)

  const colors = brand?.colors || {
    primary: '#2A9D8F', secondary: '#3CC5B5', accent: '#E9C46A',
    neutralLight: '#F0F4F8', neutralDark: '#0F172A',
  }

  const handleContinue = () => {
    if (!selected) return
    const tmpl = studioTemplates.find(t => t.id === selected)
    // Merge template structure into brand (colors stay from brand)
    setBrand(prev => ({
      ...prev,
      template: tmpl,
      fonts: { heading: tmpl.typography.heading.family, body: tmpl.typography.body.family },
      headingWeight: tmpl.typography.heading.weight,
      bodyWeight: tmpl.typography.body.weight,
    }))
    navigate('brand-system')
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('snapshot')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm"
      >
        <IconArrowLeft className="w-4 h-4 rotate-180" />
        חזרה
      </button>

      {/* Brand indicator */}
      {logo && (
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
          <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
            <IconCheck className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs text-brand-600 font-medium">צבעים חולצו מהלוגו</span>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        בחרי את הסגנון העיצובי
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {logo
          ? 'הצבעים מהלוגו שלך. הסגנון קובע טיפוגרפיה, פריסה ואלמנטים ויזואליים.'
          : 'הסגנון קובע את המראה של כל התוצרים שלך.'}
      </p>

      {/* Template grid */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {studioTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setSelected(tmpl.id)}
            className={`rounded-3xl border-2 overflow-hidden text-right transition-all cursor-pointer card-hover ${
              selected === tmpl.id
                ? 'border-brand-500 shadow-lg'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <TemplateCard template={tmpl} colors={colors} logo={logo} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-bold ${
                  selected === tmpl.id ? 'text-brand-600' : 'text-gray-800'
                }`}>{tmpl.name}</span>
                <span className="text-[10px] text-gray-400">
                  {tmpl.typography.heading.family} + {tmpl.typography.body.family}
                </span>
              </div>
              <span className="block text-xs text-gray-400 leading-relaxed">{tmpl.description}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          selected
            ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg cursor-pointer'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        צור מערכת עיצובית
      </button>
    </div>
  )
}

function TemplateCard({ template, colors, logo }) {
  const { layout, typography } = template
  const p = colors.primary, a = colors.accent, nl = colors.neutralLight, nd = colors.neutralDark
  const hFont = `'${typography.heading.family}', sans-serif`
  const bFont = `'${typography.body.family}', sans-serif`

  return (
    <div className="h-44 p-4 flex flex-col overflow-hidden relative" style={{ backgroundColor: nl, direction: 'rtl' }}>
      {/* Logo in preview */}
      {logo && (
        <img src={logo} alt="" className="absolute top-3 left-3 w-6 h-6 rounded object-contain opacity-40" />
      )}

      {/* Header */}
      {layout.headerStyle === 'full-color' ? (
        <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: p }}>
          <div style={{ fontFamily: hFont, fontWeight: typography.heading.weight, color: nl, fontSize: '15px', lineHeight: 1.2 }}>
            כותרת ראשית
          </div>
          <div style={{ fontFamily: bFont, color: nl, opacity: 0.5, fontSize: '9px', marginTop: '4px' }}>תת-כותרת</div>
        </div>
      ) : layout.headerStyle === 'warm-gradient' ? (
        <div className="rounded-xl p-3 mb-2" style={{ background: `linear-gradient(135deg, ${nl}, ${p}20)` }}>
          <div style={{ fontFamily: hFont, fontWeight: typography.heading.weight, color: p, fontSize: '17px', lineHeight: 1.2 }}>
            כותרת ראשית
          </div>
          <div style={{ fontFamily: bFont, color: nd, opacity: 0.35, fontSize: '9px', marginTop: '4px' }}>תת-כותרת</div>
        </div>
      ) : layout.headerStyle === 'underline' ? (
        <div className="pb-2 mb-2" style={{ borderBottom: `2px solid ${nd}20` }}>
          <div style={{ fontFamily: hFont, fontWeight: typography.heading.weight, color: nd, fontSize: '14px', lineHeight: 1.2 }}>
            כותרת ראשית
          </div>
          <div style={{ fontFamily: bFont, color: nd, opacity: 0.3, fontSize: '9px', marginTop: '4px' }}>תת-כותרת</div>
        </div>
      ) : (
        <div className="mb-2">
          <div className="h-1 w-8 rounded-full mb-2" style={{ backgroundColor: p }} />
          <div style={{ fontFamily: hFont, fontWeight: typography.heading.weight, color: nd, fontSize: '15px', lineHeight: 1.2 }}>
            כותרת ראשית
          </div>
          <div style={{ fontFamily: bFont, color: nd, opacity: 0.35, fontSize: '9px', marginTop: '4px' }}>תת-כותרת</div>
        </div>
      )}

      {/* Content skeleton */}
      <div className="flex-1">
        {['נקודה ראשונה', 'נקודה שנייה'].map((t, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a }} />
            <span style={{ fontFamily: bFont, color: nd, opacity: 0.25, fontSize: '8px' }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Font label */}
      <div className="flex items-center gap-1.5 mt-1" style={{ borderTop: `1px solid ${nd}06` }}>
        <span style={{ fontFamily: hFont, fontSize: '7px', color: nd, opacity: 0.2 }}>{typography.heading.family}</span>
        <span style={{ fontSize: '7px', color: nd, opacity: 0.1 }}>+</span>
        <span style={{ fontFamily: bFont, fontSize: '7px', color: nd, opacity: 0.2 }}>{typography.body.family}</span>
      </div>
    </div>
  )
}
