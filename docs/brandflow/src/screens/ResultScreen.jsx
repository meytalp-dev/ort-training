import { useMemo } from 'react'
import { useBrand } from '../context/BrandContext'
import OutputPreview from '../components/OutputPreview'
import { IconArrowLeft, IconSparkle, IconCheck } from '../components/Icons'

export default function ResultScreen() {
  const { navigate, logo } = useBrand()

  const outputData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('bf_output') || '{}')
    } catch {
      return {}
    }
  }, [])

  const { type, brand: activeBrand, formData, template: templateName } = outputData

  if (!type || !activeBrand || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">לא נמצא תוצר</p>
          <button onClick={() => navigate('create')} className="text-brand-500 font-medium cursor-pointer">
            חזרה ליצירת תוצר
          </button>
        </div>
      </div>
    )
  }

  const typeLabels = {
    presentation: 'מצגת',
    post: 'פוסט',
    summary: 'סיכום',
    document: 'דף מידע',
    whatsapp: 'הזמנה',
  }

  const handleDownload = () => {
    alert('בגרסה הבאה תוכלי להוריד את התוצר כ-PNG / HTML / PDF')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: formData.title || 'תוצר ממותג', text: formData.text || '' }).catch(() => {})
    } else {
      const text = `${formData.title || ''}\n\n${formData.text || ''}`
      navigator.clipboard.writeText(text).then(() => alert('הטקסט הועתק ללוח'))
    }
  }

  return (
    <div className="screen-enter min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('create')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-8 text-sm"
        >
          <IconArrowLeft className="w-4 h-4 rotate-180" />
          חזרה לעריכה
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <IconSparkle className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            התוצר שלך מוכן
          </h1>
          <p className="text-gray-500">
            אפשר להשתמש בו מיד או ליצור גרסה נוספת
          </p>
        </div>

        {/* Brand connection bar */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {logo && (
            <img src={logo} alt="" className="w-7 h-7 rounded-lg object-contain" />
          )}
          <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
            <IconCheck className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs text-brand-600 font-medium">מותאם למותג שלך</span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
            {typeLabels[type] || type}
          </span>
          {templateName && (
            <>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">{templateName}</span>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex justify-center">
            <OutputPreview type={type} brand={activeBrand} formData={formData} />
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleDownload}
            className="flex-1 py-4 rounded-2xl font-semibold text-base bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            הורידי
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-2xl font-semibold text-base bg-gray-900 text-white hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
            שתפי
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => navigate('create')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            צרי וריאציה נוספת
          </button>
          <button
            onClick={() => navigate('create')}
            className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            ערכי תוכן
          </button>
        </div>

        {/* More outputs */}
        <div className="bg-brand-50 rounded-3xl p-6 mb-4">
          <h3 className="font-bold text-gray-900 mb-2">
            רוצה עוד תוצרים באותו סגנון?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            המיתוג שלך שמור. אפשר ליצור מצגת, פוסט, דף מידע או הזמנה נוספת בלחיצה.
          </p>
          <button
            onClick={() => { sessionStorage.removeItem('bf_output'); navigate('create') }}
            className="px-6 py-3 rounded-2xl font-semibold text-sm bg-brand-500 text-white hover:bg-brand-600 transition-all cursor-pointer"
          >
            צור תוצר נוסף
          </button>
        </div>
      </div>
    </div>
  )
}
