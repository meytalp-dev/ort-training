import { useState, useMemo } from 'react'
import { useBrand } from '../context/BrandContext'
import { palettes, styles, fontPairings, outputSizes } from '../data/studio'
import { IconArrowLeft, IconCheck } from '../components/Icons'

export default function StudioWizard() {
  const { logo, navigate, setBrand } = useBrand()

  // If logo was uploaded, skip palette step (colors already extracted)
  const hasLogo = !!logo
  const totalSteps = hasLogo ? 3 : 4
  const stepLabels = hasLogo
    ? ['סגנון', 'גופנים', 'תוצר']
    : ['צבעים', 'סגנון', 'גופנים', 'תוצר']

  const [step, setStep] = useState(1)
  const [palette, setPalette] = useState(null)
  const [style, setStyle] = useState(null)
  const [fonts, setFonts] = useState(null)
  const [output, setOutput] = useState(null)

  // Resolve what step maps to what content
  const getStepContent = () => {
    if (hasLogo) {
      return { 1: 'style', 2: 'fonts', 3: 'output' }[step]
    }
    return { 1: 'palette', 2: 'style', 3: 'fonts', 4: 'output' }[step]
  }
  const content = getStepContent()

  const selectedPalette = palettes.find(p => p.id === palette)
  const selectedStyle = styles.find(s => s.id === style)
  const selectedFonts = fontPairings.find(f => f.id === fonts)
  const selectedOutput = outputSizes.find(o => o.id === output)

  // Preview colors: from logo extraction or palette
  const previewColors = useMemo(() => {
    if (selectedPalette) return selectedPalette
    // Fallback for logo users (use ORT palette as preview base)
    return palettes[0]
  }, [selectedPalette])

  const handleGenerate = () => {
    const p = selectedPalette || palettes[0]
    setBrand(prev => ({
      ...prev,
      palette: p,
      style: selectedStyle,
      fonts: selectedFonts,
      output: selectedOutput,
      colors: {
        primary: p.primary,
        accent: p.accent,
        bg: p.bg,
        text: p.text,
      },
    }))
    navigate('generate')
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
    else navigate('opening')
  }

  const nextStep = () => setStep(step + 1)

  return (
    <div className="screen-enter min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={goBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-6 text-sm">
          <IconArrowLeft className="w-4 h-4 rotate-180" />
          {step > 1 ? 'חזרה' : 'חזרה להתחלה'}
        </button>

        {/* Logo indicator */}
        {hasLogo && (
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
            <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
              <IconCheck className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs text-brand-600 font-medium">צבעים מהלוגו שלך</span>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => s < step && setStep(s)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s < step ? 'bg-brand-500 text-white cursor-pointer' :
                    s === step ? 'bg-brand-500 text-white shadow-md' :
                    'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s < step ? <IconCheck className="w-4 h-4" /> : s}
                </button>
                {i < stepLabels.length - 1 && <div className={`w-6 h-0.5 rounded ${s < step ? 'bg-brand-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
          <span className="text-xs text-gray-400 mr-3">{stepLabels[step - 1]}</span>
        </div>

        {/* ── PALETTE (only if no logo) ── */}
        {content === 'palette' && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">בחרי פלטת צבעים</h1>
            <p className="text-gray-500 text-sm mb-8">הצבעים שייקבעו את האווירה של כל התוצרים.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPalette(p.id); nextStep() }}
                  className={`rounded-2xl overflow-hidden border-2 transition-all cursor-pointer card-hover ${
                    palette === p.id ? 'border-brand-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="h-20 flex">
                    <div className="flex-1" style={{ backgroundColor: p.primary }} />
                    <div className="flex-1" style={{ backgroundColor: p.accent }} />
                    <div className="flex-1" style={{ backgroundColor: p.bg }} />
                  </div>
                  <div className="p-3">
                    <span className="block text-xs font-bold text-gray-800">{p.name}</span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">{p.mood}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STYLE ── */}
        {content === 'style' && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">בחרי סגנון עיצובי</h1>
            <p className="text-gray-500 text-sm mb-8">הסגנון קובע את הפריסה, האלמנטים והאווירה.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStyle(s.id); nextStep() }}
                  className={`rounded-2xl overflow-hidden border-2 transition-all cursor-pointer card-hover text-right ${
                    style === s.id ? 'border-brand-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <StylePreview style={s} palette={previewColors} />
                  <div className="p-4">
                    <span className="block text-sm font-bold text-gray-800 mb-1">{s.name}</span>
                    <span className="block text-xs text-gray-400 leading-relaxed">{s.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FONTS ── */}
        {content === 'fonts' && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">בחרי שילוב גופנים</h1>
            <p className="text-gray-500 text-sm mb-8">כל שילוב נבנה לסוג תוכן אחר. שימי לב להבדל בין כתב יד, סריף ו-sans.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {fontPairings.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => { setFonts(fp.id); nextStep() }}
                  className={`rounded-2xl p-5 border-2 transition-all cursor-pointer card-hover text-right ${
                    fonts === fp.id ? 'border-brand-500 shadow-md bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="mb-3" style={{ direction: 'rtl' }}>
                    <div style={{
                      fontFamily: `'${fp.heading.family}', 'Heebo', sans-serif`,
                      fontWeight: fp.heading.weight,
                      fontSize: '24px',
                      lineHeight: 1.15,
                      color: previewColors.primary,
                    }}>
                      כותרת ראשית
                    </div>
                    <div style={{
                      fontFamily: `'${fp.sub.family}', 'Heebo', sans-serif`,
                      fontWeight: fp.sub.weight,
                      fontSize: '15px',
                      color: previewColors.text,
                      opacity: 0.5,
                      marginTop: '6px',
                    }}>
                      תת-כותרת שמסבירה בקצרה
                    </div>
                    <div style={{
                      fontFamily: `'${fp.body.family}', 'Heebo', sans-serif`,
                      fontWeight: fp.body.weight,
                      fontSize: '13px',
                      color: previewColors.text,
                      opacity: 0.35,
                      marginTop: '8px',
                      lineHeight: 1.6,
                    }}>
                      טקסט גוף רגיל — כך ייראה התוכן השוטף בתוצרים שלך. הפונט נבחר לקריאות מרבית.
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-gray-700">{fp.name}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{fp.context}</span>
                    </div>
                    <div className="flex gap-1">
                      {[fp.heading, fp.sub, fp.body]
                        .filter((f, i, a) => a.findIndex(x => x.family === f.family) === i)
                        .map((f, i) => (
                          <span key={i} className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">{f.family}</span>
                        ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── OUTPUT ── */}
        {content === 'output' && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">מה תרצי ליצור?</h1>
            <p className="text-gray-500 text-sm mb-8">בחרי סוג תוצר וגודל.</p>

            {/* Summary */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedPalette && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedPalette.primary }} />
                  {selectedPalette.name}
                </span>
              )}
              {hasLogo && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-xs text-brand-600">
                  <IconCheck className="w-3 h-3" /> צבעים מהלוגו
                </span>
              )}
              {selectedStyle && <span className="px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600">{selectedStyle.name}</span>}
              {selectedFonts && <span className="px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600">{selectedFonts.name}</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {outputSizes.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOutput(o.id)}
                  className={`rounded-2xl p-4 border-2 transition-all cursor-pointer text-right ${
                    output === o.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="border border-gray-200 rounded" style={{
                      width: `${Math.min(o.w / o.h, 1) * 50}px`,
                      height: `${Math.min(o.h / o.w, 1) * 50}px`,
                      backgroundColor: previewColors.bg,
                    }} />
                  </div>
                  <span className="block text-xs font-bold text-gray-800">{o.name}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{o.w}x{o.h}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!output}
              className={`w-full mt-8 py-4 rounded-2xl font-semibold text-base transition-all ${
                output ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md cursor-pointer' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              צור עיצוב
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StylePreview({ style: s, palette }) {
  const p = palette?.primary || '#2A9D8F'
  const a = palette?.accent || '#E9C46A'
  const bg = palette?.bg || '#F0F4F8'
  const t = palette?.text || '#0F172A'

  return (
    <div className="h-28 p-3 flex flex-col overflow-hidden relative" style={{ backgroundColor: bg, direction: 'rtl' }}>
      {s.elements.includes('watercolor-blobs') && (
        <svg className="absolute top-1 left-1 w-12 h-12 opacity-10" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill={a} /></svg>
      )}
      {s.elements.includes('blobs') && (
        <>
          <svg className="absolute top-2 left-2 w-8 h-8 opacity-10" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill={a} /></svg>
          <svg className="absolute bottom-2 right-2 w-6 h-6 opacity-07" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill={p} /></svg>
        </>
      )}

      {s.elements.includes('accent-bar') && <div className="h-1 w-10 rounded-full mb-2" style={{ backgroundColor: p }} />}
      {s.elements.includes('full-color-header') && (
        <div className="rounded-lg p-2 mb-2" style={{ backgroundColor: p }}>
          <div className="h-2 w-12 rounded-full" style={{ backgroundColor: bg, opacity: 0.8 }} />
        </div>
      )}
      {s.elements.includes('underline-header') && (
        <div className="pb-1.5 mb-2" style={{ borderBottom: `2px solid ${t}20` }}>
          <div className="h-2 w-14 rounded-full" style={{ backgroundColor: t, opacity: 0.6 }} />
        </div>
      )}
      {s.elements.includes('structured-grid') && (
        <div className="h-2 w-14 rounded-full mb-2" style={{ backgroundColor: p, opacity: 0.5 }} />
      )}

      <div className="flex-1 space-y-1.5">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a }} />
            <div className="h-1 rounded-full" style={{ backgroundColor: t, opacity: 0.1, width: `${65 - i * 12}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
