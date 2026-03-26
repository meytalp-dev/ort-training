import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { outputTypes } from '../data/mockBrands'
import { studioTemplates } from '../data/studioTemplates'
import { iconMap, IconArrowLeft, IconCheck } from '../components/Icons'
import OutputPreview from '../components/OutputPreview'

export default function CreateOutput() {
  const { brand, logo, navigate } = useBrand()
  const [step, setStep] = useState(1)
  const [outputType, setOutputType] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({ title: '', text: '', bullets: '' })
  const [refinement, setRefinement] = useState('')
  const [showRefinement, setShowRefinement] = useState(false)

  const baseBrand = brand || {
    name: 'ברירת מחדל',
    colors: { primary: '#2A9D8F', secondary: '#3CC5B5', accent: '#E9C46A', neutralLight: '#F0F4F8', neutralDark: '#0F172A' },
    fonts: { heading: 'Heebo', body: 'Heebo' },
    headingWeight: '700',
    bodyWeight: '400',
  }

  // Resolve template
  const template = studioTemplates.find(t => t.id === selectedTemplate)

  // Build active brand: user colors + template structure
  const activeBrand = template ? {
    ...baseBrand,
    colors: baseBrand.colors, // always from brand, never from template
    headingWeight: template.typography.heading.weight,
    bodyWeight: template.typography.body.weight,
    fonts: {
      heading: template.typography.heading.family,
      body: template.typography.body.family,
    },
    templateRules: {
      layout: template.layout,
      colorUsage: template.colorUsage,
      spacing: template.spacing,
    },
  } : baseBrand

  const fieldConfig = {
    presentation: { showTitle: true, showText: true, showBullets: true, titlePlaceholder: 'כותרת המצגת', textPlaceholder: 'תיאור או הקדמה', bulletsPlaceholder: 'נקודות (שורה לכל נקודה)' },
    post: { showTitle: true, showText: true, showBullets: false, titlePlaceholder: 'כותרת הפוסט', textPlaceholder: 'טקסט הפוסט' },
    info: { showTitle: true, showText: true, showBullets: true, titlePlaceholder: 'כותרת דף המידע', textPlaceholder: 'תוכן עיקרי', bulletsPlaceholder: 'נקודות מפתח' },
    summary: { showTitle: true, showText: true, showBullets: true, titlePlaceholder: 'כותרת הסיכום', textPlaceholder: 'סיכום כללי', bulletsPlaceholder: 'נקודות מרכזיות (שורה לכל נקודה)' },
    invitation: { showTitle: true, showText: true, showBullets: true, titlePlaceholder: 'כותרת ההזמנה', textPlaceholder: 'פרטי ההזמנה', bulletsPlaceholder: 'תאריך, שעה, מיקום' },
  }

  // Map new output types to preview types
  const previewTypeMap = {
    presentation: 'presentation',
    post: 'post',
    info: 'document',
    summary: 'summary',
    invitation: 'whatsapp',
  }

  const fields = outputType ? fieldConfig[outputType] : null

  const handleGenerate = () => {
    sessionStorage.setItem('bf_output', JSON.stringify({
      type: previewTypeMap[outputType] || outputType,
      brand: activeBrand,
      formData,
      template: template?.name || 'default',
    }))
    navigate('result')
  }

  const goToStep = (s) => setStep(s)

  return (
    <div className="screen-enter min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => step > 1 ? goToStep(step - 1) : navigate('snapshot')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-6 text-sm"
        >
          <IconArrowLeft className="w-4 h-4 rotate-180" />
          {step > 1 ? 'חזרה' : 'חזרה למותג'}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-brand-500 text-white' :
                s === step ? 'bg-brand-500 text-white shadow-md' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? <IconCheck className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-0.5 rounded ${s < step ? 'bg-brand-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
          <span className="text-xs text-gray-400 mr-3">
            {step === 1 && 'סוג תוצר'}
            {step === 2 && 'סגנון עיצוב'}
            {step === 3 && 'תוכן'}
            {step === 4 && 'תצוגה מקדימה'}
          </span>
        </div>

        {/* STEP 1: Output type */}
        {step === 1 && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">מה תרצי ליצור?</h1>
            <p className="text-gray-500 text-sm mb-8">בחרי את סוג התוצר</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
              {[
                { value: 'presentation', label: 'מצגת', desc: 'שקפים עם כותרת ותוכן', icon: 'slides' },
                { value: 'post', label: 'פוסט', desc: 'תמונה לרשתות חברתיות', icon: 'share' },
                { value: 'info', label: 'דף מידע', desc: 'מסמך מעוצב עם סעיפים', icon: 'file' },
                { value: 'summary', label: 'סיכום', desc: 'סיכום שבועי או נקודות מרכזיות', icon: 'list' },
                { value: 'invitation', label: 'הזמנה', desc: 'הזמנה לאירוע או פגישה', icon: 'message' },
              ].map(({ value, label, desc, icon }) => {
                const Icon = iconMap[icon]
                return (
                  <button
                    key={value}
                    onClick={() => { setOutputType(value); goToStep(2) }}
                    className={`card-hover bg-white rounded-2xl p-5 text-right border-2 transition-all cursor-pointer ${
                      outputType === value ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                      {Icon && <Icon className="w-5 h-5 text-brand-500" />}
                    </div>
                    <span className="block text-sm font-bold text-gray-800 mb-1">{label}</span>
                    <span className="block text-xs text-gray-400">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Template selection */}
        {step === 2 && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              בחרי איך המותג שלך ייראה
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              {logo
                ? 'העיצוב יתבסס על צבעי הלוגו שלך'
                : 'העיצוב יתבסס על צבעי המותג שבחרת'}
            </p>

            <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
              {studioTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplate(tmpl.id); goToStep(3) }}
                  className={`rounded-3xl border-2 overflow-hidden text-right transition-all cursor-pointer card-hover ${
                    selectedTemplate === tmpl.id
                      ? 'border-brand-500 shadow-lg'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Real preview using brand colors */}
                  <TemplatePreviewCard
                    template={tmpl}
                    colors={baseBrand.colors}
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold ${
                        selectedTemplate === tmpl.id ? 'text-brand-600' : 'text-gray-800'
                      }`}>
                        {tmpl.name}
                      </span>
                      {logo && (
                        <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                          מותאם למותג שלך
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-gray-400 leading-relaxed">
                      {tmpl.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Content */}
        {step === 3 && fields && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">הוסיפי תוכן</h1>
                <p className="text-gray-500 text-sm mb-8">
                  כתבי כמה מילים ואנחנו נבנה עבורך תוצר
                </p>

                {/* Brand indicator */}
                {logo && (
                  <div className="flex items-center gap-3 bg-brand-50 rounded-2xl p-3 mb-6">
                    <img src={logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
                    <div className="flex items-center gap-1.5">
                      <IconCheck className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-xs text-brand-600 font-medium">מותאם למותג שלך</span>
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 mb-4">
                  {fields.showTitle && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">כותרת</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={fields.titlePlaceholder}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                  )}
                  {fields.showText && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">טקסט</label>
                      <textarea
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder={fields.textPlaceholder}
                        rows={3}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                      />
                    </div>
                  )}
                  {fields.showBullets && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">נקודות</label>
                      <textarea
                        value={formData.bullets}
                        onChange={(e) => setFormData(prev => ({ ...prev, bullets: e.target.value }))}
                        placeholder={fields.bulletsPlaceholder}
                        rows={4}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Optional refinement */}
                <button
                  onClick={() => setShowRefinement(!showRefinement)}
                  className="text-xs text-brand-500 hover:text-brand-600 cursor-pointer font-medium mb-4"
                >
                  {showRefinement ? 'הסתירי' : 'רוצה לדייק יותר?'}
                </button>

                {showRefinement && (
                  <textarea
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    placeholder="כתבי כאן איך לשנות את הסגנון"
                    rows={2}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none mb-4 animate-[fadeInUp_0.2s_ease-out]"
                  />
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStep(4)}
                    className="flex-1 py-4 rounded-2xl font-semibold text-base bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    תצוגה מקדימה
                  </button>
                </div>
              </div>

              {/* Live mini preview */}
              <div className="hidden lg:block">
                <label className="block text-sm font-semibold text-gray-700 mb-3">תצוגה מקדימה חיה</label>
                <div className="sticky top-8 opacity-75 scale-90 origin-top-right">
                  <OutputPreview
                    type={previewTypeMap[outputType] || outputType}
                    brand={activeBrand}
                    formData={formData}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preview & generate */}
        {step === 4 && (
          <div className="animate-[fadeInUp_0.3s_ease-out] max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              ככה זה ייראה
            </h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              בדקי שהכל בסדר לפני שממשיכים
            </p>

            {/* Brand indicator */}
            {logo && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src={logo} alt="" className="w-6 h-6 rounded-lg object-contain" />
                <div className="flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-xs text-brand-600 font-medium">מותאם למותג שלך</span>
                </div>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-400">{template?.name}</span>
              </div>
            )}

            {/* Preview */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
              <div className="flex justify-center">
                <OutputPreview
                  type={previewTypeMap[outputType] || outputType}
                  brand={activeBrand}
                  formData={formData}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleGenerate}
                className="flex-1 py-4 rounded-2xl font-semibold text-base bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                סיימתי, קחו אותי לתוצר
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goToStep(3)}
                className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                ערכי תוכן
              </button>
              <button
                onClick={() => goToStep(2)}
                className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                שני סגנון
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Template preview card that renders real text in the template's actual fonts + user's brand colors
 */
function TemplatePreviewCard({ template, colors }) {
  const { layout, typography } = template
  const p = colors.primary
  const a = colors.accent
  const nl = colors.neutralLight
  const nd = colors.neutralDark

  const headingFont = `'${typography.heading.family}', sans-serif`
  const bodyFont = `'${typography.body.family}', sans-serif`

  return (
    <div
      className="h-40 p-4 flex flex-col overflow-hidden"
      style={{ backgroundColor: nl, direction: 'rtl' }}
    >
      {/* Header with real font */}
      {layout.headerStyle === 'full-color' ? (
        <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: p }}>
          <div style={{ fontFamily: headingFont, fontWeight: typography.heading.weight, color: nl, fontSize: '14px', lineHeight: 1.2 }}>
            כותרת לדוגמה
          </div>
          <div style={{ fontFamily: bodyFont, color: nl, opacity: 0.6, fontSize: '9px', marginTop: '3px' }}>
            טקסט גוף קצר
          </div>
        </div>
      ) : layout.headerStyle === 'warm-gradient' ? (
        <div className="rounded-xl p-3 mb-2" style={{ background: `linear-gradient(135deg, ${nl}, ${p}20)` }}>
          <div style={{ fontFamily: headingFont, fontWeight: typography.heading.weight, color: p, fontSize: '16px', lineHeight: 1.2 }}>
            כותרת לדוגמה
          </div>
          <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.4, fontSize: '9px', marginTop: '3px' }}>
            טקסט גוף קצר
          </div>
        </div>
      ) : layout.headerStyle === 'underline' ? (
        <div className="pb-2 mb-2" style={{ borderBottom: `2px solid ${nd}25` }}>
          <div style={{ fontFamily: headingFont, fontWeight: typography.heading.weight, color: nd, fontSize: '13px', lineHeight: 1.2 }}>
            כותרת לדוגמה
          </div>
          <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.35, fontSize: '9px', marginTop: '3px' }}>
            טקסט גוף קצר
          </div>
        </div>
      ) : (
        /* accent-bar */
        <div className="mb-2">
          <div className="h-1 w-8 rounded-full mb-2" style={{ backgroundColor: p }} />
          <div style={{ fontFamily: headingFont, fontWeight: typography.heading.weight, color: nd, fontSize: '14px', lineHeight: 1.2 }}>
            כותרת לדוגמה
          </div>
          <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.4, fontSize: '9px', marginTop: '3px' }}>
            טקסט גוף קצר
          </div>
        </div>
      )}

      {/* Content area with structure indicators */}
      <div className="flex-1">
        {layout.structure === 'blocks' ? (
          <div className="grid grid-cols-3 gap-1.5 h-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg p-1.5" style={{ backgroundColor: `${p}0A` }}>
                <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.3, fontSize: '7px', lineHeight: 1.4 }}>
                  תוכן בלוק
                </div>
              </div>
            ))}
          </div>
        ) : layout.structure === 'cards' ? (
          <div className="flex gap-1.5 h-full">
            {[1, 2].map(i => (
              <div key={i} className="flex-1 rounded-xl p-2 bg-white" style={{ border: `1px solid ${p}10` }}>
                <div className="h-1 w-6 rounded-full mb-1" style={{ backgroundColor: a, opacity: 0.5 }} />
                <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.25, fontSize: '7px', lineHeight: 1.4 }}>
                  טקסט כרטיס
                </div>
              </div>
            ))}
          </div>
        ) : layout.structure === 'hierarchy' ? (
          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5">
              <div className="w-1 h-4 rounded-full mt-0.5" style={{ backgroundColor: a }} />
              <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.35, fontSize: '8px', lineHeight: 1.4 }}>
                סעיף ראשי עם תוכן
              </div>
            </div>
            <div className="flex items-start gap-1.5 mr-3">
              <div className="w-1 h-3 rounded-full mt-0.5" style={{ backgroundColor: a, opacity: 0.3 }} />
              <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.2, fontSize: '7px' }}>
                תת-סעיף
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {['נקודה ראשונה', 'נקודה שנייה', 'נקודה שלישית'].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a }} />
                <div style={{ fontFamily: bodyFont, color: nd, opacity: 0.25 - i * 0.05, fontSize: '8px' }}>
                  {t}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Font name indicator */}
      <div className="mt-1.5 pt-1.5" style={{ borderTop: `1px solid ${nd}08` }}>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: a, opacity: 0.4 }} />
          <span style={{ fontFamily: headingFont, fontSize: '7px', color: nd, opacity: 0.2 }}>
            {typography.heading.family}
          </span>
          <span style={{ fontSize: '7px', color: nd, opacity: 0.12 }}>+</span>
          <span style={{ fontFamily: bodyFont, fontSize: '7px', color: nd, opacity: 0.2 }}>
            {typography.body.family}
          </span>
        </div>
      </div>
    </div>
  )
}
