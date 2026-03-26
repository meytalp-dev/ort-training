import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { orgTypes, stylePreferences } from '../data/mockBrands'
import { IconArrowLeft } from '../components/Icons'

export default function BrandingQuestions() {
  const { navigate } = useBrand()
  const [orgType, setOrgType] = useState('')
  const [style, setStyle] = useState('')

  const canContinue = orgType && style

  const handleContinue = () => {
    if (!canContinue) return
    // Store selections in sessionStorage for recommendations screen
    sessionStorage.setItem('bf_orgType', orgType)
    sessionStorage.setItem('bf_style', style)
    navigate('recommendations')
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8 max-w-xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('opening')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm"
      >
        <IconArrowLeft className="w-4 h-4 rotate-180" />
        חזרה
      </button>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ספרי לנו על עצמך
        </h1>
        <p className="text-gray-500">
          נתאים לך המלצות מיתוג על בסיס הסגנון שלך
        </p>
      </div>

      {/* Organization type */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          סוג הארגון
        </label>
        <select
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 text-sm appearance-none cursor-pointer hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
        >
          <option value="">בחרי סוג...</option>
          {orgTypes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Style preference */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          העדפת סגנון
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stylePreferences.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setStyle(value)}
              className={`rounded-2xl p-4 text-right border-2 transition-all cursor-pointer ${
                style === value
                  ? 'border-brand-500 bg-brand-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className={`block font-semibold text-sm mb-1 ${
                style === value ? 'text-brand-600' : 'text-gray-800'
              }`}>
                {label}
              </span>
              <span className="block text-xs text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          canContinue
            ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg cursor-pointer'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        המשך להמלצות
      </button>
    </div>
  )
}
