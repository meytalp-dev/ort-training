import { useBrand } from '../context/BrandContext'
import { IconPalette, IconBrush } from '../components/Icons'

export default function OpeningScreen() {
  const { navigate } = useBrand()

  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo / Brand */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center">
          <IconBrush className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800 tracking-tight">
          Learni <span className="text-brand-500">BrandFlow</span>
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
        עיצוב ממותג
        <br />
        <span className="text-brand-500">בכמה לחיצות</span>
      </h1>

      <p className="text-lg text-gray-500 text-center mb-12 max-w-md">
        בחרי צבעים, סגנון, גופנים ותוצר — ואנחנו נעצב בשבילך
      </p>

      {/* Two cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Card 1 - Has logo */}
        <button
          onClick={() => navigate('complete-brand')}
          className="card-hover bg-white rounded-3xl p-8 text-right border border-gray-100 shadow-sm group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-6 group-hover:bg-brand-200 transition-colors">
            <IconPalette className="w-7 h-7 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            יש לי לוגו
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            נחלץ צבעים מהלוגו ונבנה עיצוב מותאם
          </p>
          <span className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 transition-all">
            העלי לוגו
            <svg className="w-4 h-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
            </svg>
          </span>
        </button>

        {/* Card 2 - Go to studio directly */}
        <button
          onClick={() => navigate('studio')}
          className="card-hover bg-white rounded-3xl p-8 text-right border border-gray-100 shadow-sm group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
            <IconBrush className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            בואי נעצב ביחד
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            בחרי צבעים, סגנון וגופנים מהסטודיו שלנו
          </p>
          <span className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
            לסטודיו
            <svg className="w-4 h-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
            </svg>
          </span>
        </button>
      </div>

      <p className="mt-16 text-xs text-gray-300">
        Learni BrandFlow v0.2 — Powered by Learni Design Studio
      </p>
    </div>
  )
}
