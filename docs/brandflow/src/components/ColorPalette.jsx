export default function ColorPalette({ colors, size = 'md' }) {
  const colorList = [
    { key: 'primary', label: 'ראשי' },
    { key: 'secondary', label: 'משני' },
    { key: 'accent', label: 'הדגשה' },
    { key: 'neutralLight', label: 'רקע' },
    { key: 'neutralDark', label: 'טקסט' },
  ]

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex gap-2">
      {colorList.map(({ key, label }, i) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <div
            className={`${sizeClasses[size]} rounded-xl border border-black/5 ${i === 0 ? 'ring-2 ring-offset-2 ring-black/10' : ''}`}
            style={{ backgroundColor: colors[key] }}
            title={label}
          />
          {size !== 'sm' && (
            <span className="text-[10px] text-gray-400">{label}</span>
          )}
        </div>
      ))}
    </div>
  )
}
