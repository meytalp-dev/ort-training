import { useMemo } from 'react'
import { useBrand } from '../context/BrandContext'
import { generateRecommendations } from '../data/mockBrands'
import ColorPalette from '../components/ColorPalette'
import { IconArrowLeft, IconStar, iconMap } from '../components/Icons'

export default function BrandingRecommendations() {
  const { navigate, setBrand } = useBrand()

  const style = sessionStorage.getItem('bf_style') || 'calm'
  const orgType = sessionStorage.getItem('bf_orgType') || 'school'

  const recommendations = useMemo(
    () => generateRecommendations(orgType, style),
    [orgType, style]
  )

  const handleSelect = (rec) => {
    setBrand({
      name: rec.name,
      colors: rec.colors,
      fonts: rec.fonts,
      headingWeight: rec.headingWeight,
      bodyWeight: rec.bodyWeight,
      styleMode: rec.styleMode,
    })
    navigate('snapshot')
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('questions')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm"
      >
        <IconArrowLeft className="w-4 h-4 rotate-180" />
        חזרה
      </button>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          הנה 3 כיוונים שנבחרו עבורך
        </h1>
        <p className="text-gray-500">
          בחרי את הכיוון שהכי מדבר אליך
        </p>
      </div>

      {/* 3 recommendation cards */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`card-hover bg-white rounded-3xl p-6 md:p-8 border-2 relative ${
              rec.recommended
                ? 'border-brand-400 shadow-md'
                : 'border-gray-100 shadow-sm'
            }`}
          >
            {/* Recommended badge */}
            {rec.recommended && (
              <div className="absolute -top-3 right-6 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                <IconStar className="w-3.5 h-3.5" />
                מומלץ עבורך
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {rec.name}
                </h2>

                {/* Palette */}
                <div className="mb-4">
                  <ColorPalette colors={rec.colors} size="md" />
                </div>

                {/* Fonts */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">כותרת</span>
                    <span className="font-bold" style={{ fontWeight: rec.headingWeight }}>
                      {rec.fonts.heading} {rec.headingWeight}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">גוף</span>
                    <span style={{ fontWeight: rec.bodyWeight }}>
                      {rec.fonts.body} {rec.bodyWeight}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {rec.description}
                </p>

                {/* Use cases */}
                <div className="flex gap-2 mb-4">
                  {rec.useCases.map((uc) => {
                    const Icon = iconMap[uc]
                    return Icon ? (
                      <div
                        key={uc}
                        className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center"
                        title={uc}
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : null
                  })}
                </div>

                {/* Warning */}
                <div className="bg-amber-50 rounded-xl px-4 py-2.5 text-xs text-amber-700 leading-relaxed">
                  {rec.warning}
                </div>
              </div>

              {/* Right: preview swatch */}
              <div className="md:w-48 flex flex-col justify-between">
                <div
                  className="rounded-2xl p-5 mb-4 flex-1 flex flex-col justify-center"
                  style={{ backgroundColor: rec.colors.neutralLight }}
                >
                  <div
                    className="text-lg font-bold mb-2"
                    style={{ color: rec.colors.primary, fontWeight: rec.headingWeight }}
                  >
                    כותרת לדוגמה
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: rec.colors.neutralDark, fontWeight: rec.bodyWeight }}
                  >
                    טקסט גוף לדוגמה שממחיש את הסגנון העיצובי
                  </div>
                  <div
                    className="mt-3 h-1 w-12 rounded"
                    style={{ backgroundColor: rec.colors.accent }}
                  />
                </div>

                <button
                  onClick={() => handleSelect(rec)}
                  className="w-full py-3 rounded-2xl font-semibold text-sm cursor-pointer transition-all"
                  style={{
                    backgroundColor: rec.recommended ? rec.colors.primary : 'transparent',
                    color: rec.recommended ? rec.colors.neutralLight : rec.colors.primary,
                    border: rec.recommended ? 'none' : `2px solid ${rec.colors.primary}`,
                  }}
                >
                  בחרי כיוון זה
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
