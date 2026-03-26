import { useState } from 'react';
import { getBgFromPalette } from '@/lib/paletteBg';

export interface ColorOverrides {
  heading: string;
  background: string;
  accent: string;
  button: string;
  text: string;
}

interface Props {
  paletteColors: { hex: string; name: string }[];
  defaultBg: string;
  overrides: ColorOverrides;
  onChange: (overrides: ColorOverrides) => void;
}

const fields: { key: keyof ColorOverrides; label: string; icon: string }[] = [
  { key: 'heading', label: 'כותרת', icon: '🔤' },
  { key: 'background', label: 'רקע', icon: '🎨' },
  { key: 'accent', label: 'אקסנט', icon: '✦' },
  { key: 'button', label: 'כפתור', icon: '🔘' },
  { key: 'text', label: 'טקסט', icon: '📝' },
];

export default function ColorCustomizer({ paletteColors, overrides, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const extraColors = [
    { hex: '#ffffff', name: 'לבן' },
    { hex: '#f5f5f5', name: 'אפור בהיר' },
    { hex: '#333333', name: 'כהה' },
    { hex: '#000000', name: 'שחור' },
  ];

  const allColors = [...paletteColors, ...extraColors];

  return (
    <div className="w-full">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 hover:border-primary/50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <span className="font-bold text-foreground">התאמת צבעים</span>
          <span className="text-xs text-muted-foreground">(לחצו על צבע כדי לשנות)</span>
        </span>
        <span className={`transition-transform text-primary ${collapsed ? '' : 'rotate-180'}`}>▾</span>
      </button>

      {!collapsed && (
        <div className="mt-2 p-4 rounded-xl border-2 border-primary/20 bg-card space-y-3 animate-fade-in shadow-sm">
          {fields.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs w-16 text-muted-foreground text-right flex items-center gap-1 justify-end font-medium">
                <span>{icon}</span>
                <span>{label}</span>
              </span>
              <div className="flex gap-1.5 flex-wrap flex-1">
                {allColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => onChange({ ...overrides, [key]: color.hex })}
                    title={color.name}
                    className="w-7 h-7 rounded-full border-2 transition-all hover:scale-125 flex-shrink-0"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: overrides[key] === color.hex ? '#000' : color.hex === '#ffffff' ? '#ddd' : 'transparent',
                      boxShadow: overrides[key] === color.hex ? '0 0 0 2px white, 0 0 0 4px hsl(var(--primary))' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const defaults: ColorOverrides = {
                heading: paletteColors[0]?.hex || '#333',
                background: getBgFromPalette(paletteColors),
                accent: paletteColors[0]?.hex || '#333',
                button: paletteColors[0]?.hex || '#333',
                text: '#555555',
              };
              onChange(defaults);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center pt-2 font-medium"
          >
            ↩️ איפוס לברירת מחדל
          </button>
        </div>
      )}
    </div>
  );
}
