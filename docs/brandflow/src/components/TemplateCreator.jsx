import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { studioTemplates } from '../data/studioTemplates'

export default function TemplateCreator({ onDone }) {
  const { addTemplate } = useBrand()
  const [selected, setSelected] = useState(null)
  const [refinement, setRefinement] = useState('')
  const [showRefinement, setShowRefinement] = useState(false)

  const handleCreate = () => {
    if (!selected) return
    const base = studioTemplates.find(t => t.id === selected)
    addTemplate({
      ...base,
      refinement: refinement || null,
    })
    if (onDone) onDone()
  }

  return (
    <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          בואי נגדיר איך כל התוצרים שלך ייראו
        </h2>
        <p className="text-gray-500 text-sm">
          בחרי סגנון מתוך הסטודיו. התבנית תקבע טיפוגרפיה, פריסה ושימוש בצבע.
        </p>
      </div>

      {/* Template cards */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          בחרי סגנון מתוך הסטודיו
        </label>
        <div className="grid grid-cols-2 gap-4">
          {studioTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelected(tmpl.id)}
              className={`rounded-2xl border-2 overflow-hidden text-right transition-all cursor-pointer ${
                selected === tmpl.id
                  ? 'border-brand-500 shadow-md'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Real visual preview */}
              <TemplatePreview template={tmpl} />

              {/* Info */}
              <div className="p-4">
                <span className={`block text-sm font-bold mb-1 ${
                  selected === tmpl.id ? 'text-brand-600' : 'text-gray-800'
                }`}>
                  {tmpl.name}
                </span>
                <span className="block text-xs text-gray-400 leading-relaxed">
                  {tmpl.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional refinement */}
      <div>
        <button
          onClick={() => setShowRefinement(!showRefinement)}
          className="text-xs text-brand-500 hover:text-brand-600 cursor-pointer font-medium"
        >
          {showRefinement ? 'הסתירי' : 'רוצה לדייק יותר?'}
        </button>

        {showRefinement && (
          <div className="mt-3 animate-[fadeInUp_0.2s_ease-out]">
            <textarea
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              placeholder="כתבי כאן איך לשנות את הסגנון"
              rows={2}
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
            />
          </div>
        )}
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!selected}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          selected
            ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg cursor-pointer'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        צור תבנית
      </button>
    </div>
  )
}

/**
 * Real visual preview that renders the template's actual design rules
 */
function TemplatePreview({ template }) {
  const { preview, layout } = template
  const radius = layout.cardRadius

  return (
    <div
      className="h-32 p-3 flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: preview.bg }}
    >
      {/* Header area */}
      {layout.headerStyle === 'full-color' ? (
        <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ backgroundColor: preview.headerBar }}>
          <div className="h-2.5 w-14 rounded-full bg-white/90" />
          <div className="h-1.5 w-8 rounded-full bg-white/40" />
        </div>
      ) : layout.headerStyle === 'warm-gradient' ? (
        <div className="rounded-lg p-2.5" style={{ background: `linear-gradient(135deg, ${preview.bg}, ${preview.headerBar}30)` }}>
          <div className="h-2.5 w-16 rounded-full" style={{ backgroundColor: preview.headerBar }} />
          <div className="h-1.5 w-10 rounded-full mt-1.5 opacity-30" style={{ backgroundColor: preview.textPreview }} />
        </div>
      ) : layout.headerStyle === 'underline' ? (
        <div className="pb-2" style={{ borderBottom: `2px solid ${preview.headerBar}` }}>
          <div className="h-2.5 w-16 rounded-full" style={{ backgroundColor: preview.headerBar }} />
          <div className="h-1.5 w-10 rounded-full mt-1.5 opacity-20" style={{ backgroundColor: preview.textPreview }} />
        </div>
      ) : (
        /* accent-bar (clean-edu default) */
        <div>
          <div className="h-1 w-8 rounded-full mb-2" style={{ backgroundColor: preview.headerBar }} />
          <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: preview.textPreview }} />
          <div className="h-1.5 w-12 rounded-full mt-1.5 opacity-20" style={{ backgroundColor: preview.textPreview }} />
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 mt-2">
        {layout.structure === 'blocks' ? (
          <div className="grid grid-cols-3 gap-1.5 h-full">
            {preview.blocks.map((bg, i) => (
              <div key={i} className="rounded-md" style={{
                backgroundColor: bg,
                border: `1px solid ${preview.accent}20`,
              }}>
                <div className="p-1.5">
                  <div className="h-1 w-full rounded-full opacity-20" style={{ backgroundColor: preview.textPreview }} />
                  <div className="h-0.5 w-3/4 rounded-full mt-1 opacity-10" style={{ backgroundColor: preview.textPreview }} />
                </div>
              </div>
            ))}
          </div>
        ) : layout.structure === 'cards' ? (
          <div className="flex gap-1.5 h-full">
            {preview.blocks.slice(0, 2).map((bg, i) => (
              <div key={i} className="flex-1 rounded-lg p-1.5" style={{
                backgroundColor: bg,
                borderRadius: '12px',
              }}>
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: preview.accent, opacity: 0.5 }} />
                <div className="h-0.5 w-full rounded-full mt-1.5 opacity-15" style={{ backgroundColor: preview.textPreview }} />
                <div className="h-0.5 w-3/4 rounded-full mt-1 opacity-10" style={{ backgroundColor: preview.textPreview }} />
              </div>
            ))}
          </div>
        ) : layout.structure === 'hierarchy' ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: preview.accent }} />
              <div>
                <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: preview.textPreview, opacity: 0.5 }} />
                <div className="h-1 w-20 rounded-full mt-1 opacity-15" style={{ backgroundColor: preview.textPreview }} />
              </div>
            </div>
            <div className="flex items-center gap-2 mr-3">
              <div className="w-1 h-3 rounded-full opacity-40" style={{ backgroundColor: preview.accent }} />
              <div className="h-1 w-16 rounded-full opacity-10" style={{ backgroundColor: preview.textPreview }} />
            </div>
          </div>
        ) : (
          /* linear */
          <div className="space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preview.accent }} />
                <div className="h-1 rounded-full opacity-20" style={{ backgroundColor: preview.textPreview, width: `${75 - i * 10}%` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accent bar at bottom */}
      <div className="h-0.5 w-8 rounded-full mt-2" style={{ backgroundColor: preview.accent, opacity: 0.5 }} />
    </div>
  )
}
