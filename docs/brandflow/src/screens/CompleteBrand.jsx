import { useState, useRef, useEffect } from 'react'
import { useBrand } from '../context/BrandContext'
import { IconArrowLeft } from '../components/Icons'
import ColorPalette from '../components/ColorPalette'
import { extractColorsFromImage } from '../utils/extractColors'

export default function CompleteBrand() {
  const { navigate, setLogo } = useBrand()
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [extractedColors, setExtractedColors] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [showColorEditor, setShowColorEditor] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!logoPreview) { setExtractedColors(null); return }
    setExtracting(true)
    extractColorsFromImage(logoPreview).then((colors) => {
      setExtracting(false)
      if (colors) setExtractedColors(colors)
    })
  }, [logoPreview])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleContinue = () => {
    setLogo(logoPreview)
    navigate('studio')
  }

  const handleColorChange = (key, value) => {
    setExtractedColors(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8 max-w-xl mx-auto">
      <button onClick={() => navigate('opening')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm">
        <IconArrowLeft className="w-4 h-4 rotate-180" />
        חזרה
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          העלי את הלוגו שלך
        </h1>
        <p className="text-gray-500">נחלץ צבעים ונמשיך לסטודיו</p>
      </div>

      {/* Logo upload */}
      <div className="mb-8">
        {logoPreview ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                <img src={logoPreview} alt="לוגו" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 mb-1">{logoFile?.name}</p>
                <p className="text-xs text-gray-400 mb-3">{(logoFile?.size / 1024).toFixed(0)} KB</p>
                <button onClick={() => { setLogoPreview(null); setLogoFile(null); setExtractedColors(null) }} className="text-xs text-red-400 hover:text-red-500 cursor-pointer">
                  החליפי לוגו
                </button>
              </div>
            </div>

            {extracting && (
              <div className="flex items-center gap-2 text-sm text-brand-500 py-3">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                מזהה צבעים...
              </div>
            )}

            {extractedColors && !extracting && (
              <div className="mt-2 pt-4 border-t border-gray-100 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                    <span className="text-sm font-medium text-brand-600">זיהינו צבעים מהלוגו</span>
                  </div>
                  <button onClick={() => setShowColorEditor(!showColorEditor)} className="text-xs text-brand-500 hover:text-brand-600 cursor-pointer font-medium">
                    {showColorEditor ? 'הסתירי' : 'התאימי צבעים'}
                  </button>
                </div>

                <ColorPalette colors={extractedColors} size="md" />

                {showColorEditor && (
                  <div className="mt-4 space-y-2 animate-[fadeInUp_0.2s_ease-out]">
                    {[
                      { key: 'primary', label: 'ראשי' },
                      { key: 'secondary', label: 'משני' },
                      { key: 'accent', label: 'הדגשה' },
                      { key: 'neutralLight', label: 'רקע' },
                      { key: 'neutralDark', label: 'טקסט' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <input type="color" value={extractedColors[key]} onChange={(e) => handleColorChange(key, e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                        <span className="text-xs text-gray-500 w-12">{label}</span>
                        <span className="text-xs text-gray-300 font-mono">{extractedColors[key]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
              dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">גררי לוגו לכאן</p>
            <p className="text-xs text-gray-400 mb-4">PNG, JPG, SVG</p>
            <span className="inline-block px-5 py-2.5 rounded-2xl bg-brand-500 text-white text-sm font-medium">העלי לוגו</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        )}
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!logoPreview}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          logoPreview ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md cursor-pointer' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        המשיכי לסטודיו
      </button>
    </div>
  )
}
