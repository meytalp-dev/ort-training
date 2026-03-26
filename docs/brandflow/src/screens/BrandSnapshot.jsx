import { useBrand } from '../context/BrandContext'
import ColorPalette from '../components/ColorPalette'
import { IconArrowLeft, IconCheck, IconEdit, IconSparkle } from '../components/Icons'

export default function BrandSnapshot() {
  const { brand, logo, navigate } = useBrand()

  // Default brand if user came from "I have a logo" path
  const activeBrand = brand || {
    name: 'המותג שלי',
    colors: { primary: '#4BA68C', secondary: '#7BC4AD', accent: '#E8C547', neutralLight: '#F5F0E8', neutralDark: '#2D3436' },
    fonts: { heading: 'Heebo', body: 'Heebo' },
    headingWeight: '700',
    bodyWeight: '400',
    styleMode: 'calm',
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('opening')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm"
      >
        <IconArrowLeft className="w-4 h-4 rotate-180" />
        חזרה להתחלה
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-3xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <IconSparkle className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          המותג שלך מוכן
        </h1>
        <p className="text-gray-500">
          {activeBrand.name}
        </p>
        <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
          המיתוג הזה ישמש אותך בכל התוצרים שתיצרי מכאן והלאה
        </p>
      </div>

      {/* Brand card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Brand header bar */}
        <div
          className="p-6 flex items-center gap-4"
          style={{ backgroundColor: activeBrand.colors.primary }}
        >
          {/* Logo */}
          {logo ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
              <img src={logo} alt="לוגו" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ backgroundColor: `${activeBrand.colors.neutralLight}30`, color: activeBrand.colors.neutralLight }}
            >
              {activeBrand.name.charAt(0)}
            </div>
          )}
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: activeBrand.colors.neutralLight, fontWeight: activeBrand.headingWeight }}
            >
              {activeBrand.name}
            </h2>
            <p className="text-sm opacity-75" style={{ color: activeBrand.colors.neutralLight }}>
              {activeBrand.styleMode === 'calm' && 'סגנון רגוע'}
              {activeBrand.styleMode === 'professional' && 'סגנון מקצועי'}
              {activeBrand.styleMode === 'modern' && 'סגנון מודרני'}
              {activeBrand.styleMode === 'warm' && 'סגנון חם'}
              {activeBrand.styleMode === 'bold' && 'סגנון נועז'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Colors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">פלטת צבעים</h3>
            <ColorPalette colors={activeBrand.colors} size="lg" />
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">טיפוגרפיה</h3>
            <div className="bg-gray-50 rounded-2xl p-5">
              <div
                className="text-2xl mb-2"
                style={{
                  fontFamily: `${activeBrand.fonts.heading}, sans-serif`,
                  fontWeight: activeBrand.headingWeight,
                  color: activeBrand.colors.primary,
                }}
              >
                כותרת לדוגמה
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: `${activeBrand.fonts.body}, sans-serif`,
                  fontWeight: activeBrand.bodyWeight,
                  color: activeBrand.colors.neutralDark,
                }}
              >
                טקסט גוף רגיל – כך ייראו הפסקאות, התיאורים והתוכן השוטף בכל התוצרים שלך.
                הפונט נבחר כדי להיות קריא ונעים לעין.
              </div>
            </div>
          </div>

          {/* Brand personality */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">אישיות המותג</h3>
            <div className="flex flex-wrap gap-2">
              {getPersonalityTags(activeBrand.styleMode).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${activeBrand.colors.primary}15`, color: activeBrand.colors.primary }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended outputs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">שימושים מומלצים</h3>
            <div className="flex gap-2">
              {getRecommendedOutputs(activeBrand.styleMode).map(({ label, active }) => (
                <span
                  key={label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    active
                      ? 'bg-brand-50 text-brand-600'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {active && <IconCheck className="w-3 h-3" />}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('template-select')}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          בחרי סגנון עיצובי
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('complete-brand')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <IconEdit className="w-4 h-4" />
            ערכי צבעים
          </button>
          <button
            onClick={() => navigate('questions')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            בחרי כיוון אחר
          </button>
        </div>
      </div>
    </div>
  )
}

function getPersonalityTags(styleMode) {
  const map = {
    calm: ['רגוע', 'אמין', 'טבעי', 'נגיש', 'מרגיע'],
    professional: ['מקצועי', 'מדויק', 'אמין', 'יציב', 'רציני'],
    modern: ['עכשווי', 'חד', 'דינמי', 'חדשני', 'טרנדי'],
    warm: ['חם', 'מזמין', 'ביתי', 'אישי', 'נעים'],
    bold: ['נועז', 'בולט', 'אנרגטי', 'חזק', 'זכיר'],
  }
  return map[styleMode] || map.calm
}

function getRecommendedOutputs(styleMode) {
  const all = [
    { label: 'מצגות', key: 'presentations' },
    { label: 'פוסטים', key: 'posts' },
    { label: 'מסמכים', key: 'documents' },
    { label: 'וואטסאפ', key: 'whatsapp' },
  ]

  const activeMap = {
    calm: ['presentations', 'documents'],
    professional: ['presentations', 'documents'],
    modern: ['posts', 'presentations'],
    warm: ['posts', 'whatsapp'],
    bold: ['posts', 'presentations'],
  }

  const activeKeys = activeMap[styleMode] || activeMap.calm
  return all.map(item => ({ ...item, active: activeKeys.includes(item.key) }))
}
