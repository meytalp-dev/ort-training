import { useMemo, useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { IconArrowLeft } from '../components/Icons'
import { buildDesignHTML } from '../engine/htmlGenerator'

export default function GenerateScreen() {
  const { brand, logo, navigate } = useBrand()

  if (!brand?.palette) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">לא נבחרו הגדרות עיצוב</p>
        <button onClick={() => navigate('studio')} className="text-brand-500 font-medium cursor-pointer mr-3">חזרה</button>
      </div>
    )
  }

  const { palette, style, fonts, output } = brand

  const html = useMemo(
    () => buildDesignHTML({ palette, style, fonts, output, logo }),
    [palette, style, fonts, output, logo]
  )

  const handleOpenInTab = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const handleDownloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `design-${output.id}-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate preview scale
  const maxPreviewW = 700
  const maxPreviewH = 600
  const scaleW = maxPreviewW / output.w
  const scaleH = maxPreviewH / output.h
  const previewScale = Math.min(scaleW, scaleH, 1)

  return (
    <div className="screen-enter min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('studio')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm">
            <IconArrowLeft className="w-4 h-4 rotate-180" />
            שני בחירות
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span>{palette.name}</span>
            <span className="text-gray-200">·</span>
            <span>{style.name}</span>
            <span className="text-gray-200">·</span>
            <span>{fonts.name}</span>
            <span className="text-gray-200">·</span>
            <span>{output.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">העיצוב שלך</h1>
          <p className="text-gray-500 text-sm">נוצר מהסטודיו, עם הבחירות שלך. לחצי "פתחי בחלון חדש" לראות בגודל מלא.</p>
        </div>

        {/* Preview - properly scaled */}
        <div className="flex justify-center mb-8">
          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 inline-block"
          >
            <div
              style={{
                width: output.w * previewScale,
                height: output.h * previewScale,
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              <iframe
                srcDoc={html}
                className="border-0"
                style={{
                  width: output.w,
                  height: output.h,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top right',
                }}
                title="Design Preview"
              />
            </div>
            <div className="text-center mt-3 text-xs text-gray-300">
              {output.w} x {output.h} · {output.ratio}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={handleOpenInTab}
            className="flex-1 py-4 rounded-2xl font-semibold text-base bg-brand-500 text-white hover:bg-brand-600 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            פתחי בחלון חדש
          </button>
          <button
            onClick={handleDownloadHTML}
            className="flex-1 py-4 rounded-2xl font-semibold text-base bg-gray-900 text-white hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            הורידי HTML
          </button>
        </div>

        <div className="flex gap-3 max-w-md mx-auto mt-3">
          <button onClick={() => navigate('studio')} className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
            שני בחירות
          </button>
          <button onClick={() => navigate('studio')} className="flex-1 py-3 rounded-2xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
            צור תוצר נוסף
          </button>
        </div>
      </div>
    </div>
  )
}
