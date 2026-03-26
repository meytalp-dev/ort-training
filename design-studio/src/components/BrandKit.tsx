import { useWizard } from '@/store/wizard';
import type { ProductType } from '@/store/wizard';
import { Copy, Check, Download, RotateCcw, FileDown, MessageSquare, CalendarDays, FileText, CreditCard, Globe, Presentation, ImageDown, Pencil, ChevronDown, Eye, ArrowRight, Sparkles, Heart, Star, Zap, Target, TrendingUp, Users, BarChart3, Mail, Phone, MapPin, Clock, Send, Palette, Layers, Award } from 'lucide-react';
import { colorPalettes, designStyles, fontCombos, buttonStyles } from '@/data/studio';
import ColorCustomizer, { type ColorOverrides } from '@/components/products/ColorCustomizer';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { generateBrandPptx } from '@/lib/generatePptx';
import { getStyleFamily, getPreviewDecorations } from '@/lib/styleDecorations';
import { getBgFromPalette } from '@/lib/paletteBg';
import ProductPost from '@/components/products/ProductPost';
import ProductInvitation from '@/components/products/ProductInvitation';
import ProductWorksheet from '@/components/products/ProductWorksheet';
import ProductBusinessCard from '@/components/products/ProductBusinessCard';
import ProductLanding from '@/components/products/ProductLanding';
import ProductPresentation from '@/components/products/ProductPresentation';
import { fontFamilyMap } from '@/lib/fontFamily';

function OrgInfoPanel() {
  const { orgInfo, setOrgInfo } = useWizard();
  const [open, setOpen] = useState(!!orgInfo.name);
  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-right hover:bg-secondary/50 transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-lg">🏫</span>
          <span className="font-bold text-foreground">פרטי הארגון</span>
          {!orgInfo.name && <span className="text-xs text-muted-foreground">(אופציונלי – ישולבו בתוצרים)</span>}
        </span>
        <span className={`transition-transform text-primary ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">שם הארגון / בית הספר</span>
              <input
                value={orgInfo.name}
                onChange={e => setOrgInfo({ name: e.target.value })}
                placeholder="למשל: בית ספר אורט בית הערבה"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">תפקיד / תת-כותרת</span>
              <input
                value={orgInfo.role}
                onChange={e => setOrgInfo({ role: e.target.value })}
                placeholder="למשל: מנהלת בית הספר"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">טלפון</span>
              <input
                value={orgInfo.phone}
                onChange={e => setOrgInfo({ phone: e.target.value })}
                placeholder="050-0000000"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">אימייל</span>
              <input
                value={orgInfo.email}
                onChange={e => setOrgInfo({ email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} הועתק!`);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="העתק">
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function EditPanel({ title, field, openPanel, setOpenPanel, children }: { title: string; field: string; openPanel: string | null; setOpenPanel: (f: string | null) => void; children: React.ReactNode }) {
  const isOpen = openPanel === field;
  return (
    <div>
      <button
        onClick={() => setOpenPanel(isOpen ? null : field)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span>{title}</span>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

type PreviewTab = 'overview' | ProductType;

const productTabs: { id: PreviewTab; icon: typeof Eye; title: string }[] = [
  { id: 'overview', icon: Eye, title: 'סקירה כללית' },
  { id: 'post', icon: MessageSquare, title: 'פוסט' },
  { id: 'invitation', icon: CalendarDays, title: 'הזמנה' },
  { id: 'worksheet', icon: FileText, title: 'דף עבודה' },
  { id: 'business-card', icon: CreditCard, title: 'כרטיס ביקור' },
  { id: 'landing', icon: Globe, title: 'דף נחיתה' },
  { id: 'presentation', icon: Presentation, title: 'מצגת' },
];

export default function BrandKit() {
  const { palette, style, fontCombo, buttonStyle, reset, activeProduct, setActiveProduct, setStep, setPalette, setStyle, setFontCombo, setButtonStyle, selectAll, outputs, orgInfo } = useWizard();
  const previewRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  // Map selected outputs to relevant product tabs
  const getRelevantTabs = (): PreviewTab[] => {
    if (selectAll) return ['overview', 'post', 'invitation', 'worksheet', 'business-card', 'landing', 'presentation'];
    const tabs = new Set<PreviewTab>();
    tabs.add('overview');
    for (const o of outputs) {
      if (o.category === 'social') tabs.add('post');
      if (o.category === 'presentations') tabs.add('presentation');
      if (o.category === 'print') { tabs.add('worksheet'); tabs.add('invitation'); tabs.add('business-card'); }
      if (o.category === 'web') tabs.add('landing');
    }
    return Array.from(tabs);
  };
  const relevantTabs = getRelevantTabs();
  const showAll = selectAll;

  const [activeTab, setActiveTab] = useState<PreviewTab>(showAll ? 'overview' : (relevantTabs.length === 2 ? relevantTabs[1] : 'overview'));

  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const defaultOverrides = (): ColorOverrides => {
    const cols = palette!.colors;
    const darkest = [...cols].sort((a, b) => getLuminance(a.hex) - getLuminance(b.hex))[0];
    const autoHeading = getLuminance(cols[0].hex) > 0.55 ? darkest.hex : cols[0].hex;
    return {
      heading: autoHeading,
      background: getBgFromPalette(cols),
      accent: cols[0].hex,
      button: cols[0].hex,
      text: '#555555',
    };
  };

  const [colorOverrides, setColorOverrides] = useState<ColorOverrides>(defaultOverrides);

  if (!palette || !style || !fontCombo || !buttonStyle) return null;

  // If a product is active (full-screen mode from tab), show it
  if (activeProduct === 'post') return <ProductPost onBack={() => setActiveProduct(null)} />;
  if (activeProduct === 'invitation') return <ProductInvitation onBack={() => setActiveProduct(null)} />;
  if (activeProduct === 'worksheet') return <ProductWorksheet onBack={() => setActiveProduct(null)} />;
  if (activeProduct === 'business-card') return <ProductBusinessCard onBack={() => setActiveProduct(null)} />;
  if (activeProduct === 'landing') return <ProductLanding onBack={() => setActiveProduct(null)} />;
  if (activeProduct === 'presentation') return <ProductPresentation onBack={() => setActiveProduct(null)} />;

  const c = palette.colors;
  const ov = colorOverrides;

  const headingFamily = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFamily = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;

  const isOutline = buttonStyle.category === 'outline';
  const isGradient = buttonStyle.category === 'gradient';
  const btnBg = isOutline ? 'transparent' : isGradient ? `linear-gradient(135deg, ${ov.button}, ${c[3]?.hex || c[1]?.hex})` : ov.button;
  const btnColor = isOutline ? ov.button : '#fff';
  const btnBorder = isOutline ? `2px solid ${ov.button}` : 'none';

  const family = getStyleFamily(style);
  const decorations = getPreviewDecorations(family, c.map(col => col.hex));

  const summaryText = `🎨 Brand Kit – ${palette.name}
━━━━━━━━━━━━━━━━━━━━

📎 פלטת צבעים:
${c.map(color => `   ${color.name}: ${color.hex}`).join('\n')}

✍️ פונטים:
   כותרת: ${fontCombo.heading}
   גוף: ${fontCombo.body}
   🔗 ${fontCombo.heading}: https://fonts.google.com/specimen/${fontCombo.heading.replace(/ /g, '+')}
   🔗 ${fontCombo.body}: https://fonts.google.com/specimen/${fontCombo.body.replace(/ /g, '+')}

🔘 כפתורים: ${buttonStyle.name}

🎭 סגנון: ${style.name}
   ${style.description}
`;

  const handleDownloadSummary = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-kit-${palette.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('קובץ Brand Kit הורד!');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    toast.success('Brand Kit הועתק! אפשר להדביק בכל מקום');
  };

  const handleOpenProduct = (tab: PreviewTab) => {
    if (tab === 'presentation') {
      toast.loading('מייצר תבנית PPTX…');
      generateBrandPptx(palette, style, fontCombo, buttonStyle, orgInfo)
        .then(() => { toast.dismiss(); toast.success('התבנית הורדה!'); })
        .catch(() => { toast.dismiss(); toast.error('שגיאה'); });
    } else if (tab !== 'overview') {
      setActiveProduct(tab as ProductType);
    }
  };

  const renderDecoration = (el: ReturnType<typeof getPreviewDecorations>['elements'][number], i: number) => {
    if (el.type === 'frame') {
      return (
        <div key={i} className="absolute pointer-events-none" style={{ left: el.x, top: el.y, width: el.w, height: el.h, border: `1px solid ${el.color}`, opacity: el.opacity, borderRadius: el.borderRadius }} />
      );
    }
    return (
      <div key={i} className="absolute pointer-events-none" style={{ left: el.x, top: el.y, width: el.w, height: el.h, backgroundColor: el.color, opacity: el.opacity, borderRadius: el.borderRadius, transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined }} />
    );
  };

  const renderOverviewMockups = () => (
    <div ref={previewRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Phone Mockup */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-[220px] h-[440px] rounded-[32px] border-[6px] shadow-2xl overflow-hidden" style={{ borderColor: '#222', backgroundColor: ov.background }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-[#222] rounded-b-xl z-20" />
          <div className="relative z-10 pt-8 px-4 pb-4 flex flex-col h-full text-right" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: ov.accent }} />
              <span className="text-xs font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>המותג שלך</span>
            </div>
            <h4 className="text-base font-bold leading-snug mb-1" style={{ fontFamily: headingFamily, color: ov.heading }}>כותרת ראשית</h4>
            <p className="text-[10px] leading-relaxed mb-3" style={{ fontFamily: bodyFamily, color: ov.text }}>טקסט לדוגמה שמציג את הפונט והצבעים שבחרת למותג שלך.</p>
            <div className="rounded-lg mb-3 flex-1 min-h-[80px]" style={{ backgroundColor: `${c[2]?.hex || c[1]?.hex}30` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full opacity-40" style={{ backgroundColor: c[1]?.hex || c[0].hex }} />
              </div>
            </div>
            <div className="flex items-center justify-center text-[10px] font-bold w-full" style={{ ...buttonStyle.css, background: btnBg, color: btnColor, border: btnBorder, padding: '6px 12px', height: 'auto', width: '100%', minWidth: 'unset' }}>כפתור ראשי</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">מובייל</span>
      </div>

      {/* Laptop Mockup */}
      <div className="flex flex-col items-center gap-2 md:col-span-1">
        <div className="w-full max-w-[340px]">
          <div className="rounded-t-xl border-[5px] border-b-0 overflow-hidden" style={{ borderColor: '#333' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ backgroundColor: '#333' }}>
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="flex-1 mx-2 h-4 rounded bg-white/10 flex items-center justify-center">
                <span className="text-[8px] text-white/40">yourbrand.com</span>
              </div>
            </div>
            <div className="p-4 text-right" dir="rtl" style={{ backgroundColor: ov.background, minHeight: 180 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <span className="text-[8px]" style={{ fontFamily: bodyFamily, color: '#888' }}>אודות</span>
                  <span className="text-[8px]" style={{ fontFamily: bodyFamily, color: '#888' }}>שירותים</span>
                  <span className="text-[8px]" style={{ fontFamily: bodyFamily, color: '#888' }}>צור קשר</span>
                </div>
                <span className="text-[10px] font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>המותג</span>
              </div>
              <h4 className="text-lg font-bold leading-tight mb-1" style={{ fontFamily: headingFamily, color: ov.heading }}>הכותרת הראשית שלך</h4>
              <p className="text-[9px] mb-3 max-w-[200px]" style={{ fontFamily: bodyFamily, color: ov.text }}>טקסט גוף לדוגמה – כאן אפשר לראות איך הפונטים, הצבעים והכפתורים עובדים יחד באתר.</p>
              <div className="flex gap-2">
                <div className="flex items-center justify-center text-[8px] font-bold" style={{ ...buttonStyle.css, background: btnBg, color: btnColor, border: btnBorder, padding: '4px 12px', height: 'auto', width: 'auto', minWidth: 'unset' }}>התחל עכשיו</div>
                <div className="flex items-center justify-center text-[8px]" style={{ ...buttonStyle.css, background: 'transparent', color: ov.accent, border: `1.5px solid ${ov.accent}`, padding: '4px 12px', height: 'auto', width: 'auto', minWidth: 'unset' }}>למד עוד</div>
              </div>
            </div>
          </div>
          <div className="h-3 rounded-b-lg mx-[-2px]" style={{ backgroundColor: '#444' }} />
          <div className="h-1.5 rounded-b mx-8" style={{ backgroundColor: '#555' }} />
        </div>
        <span className="text-xs text-muted-foreground">אתר</span>
      </div>

      {/* Business Card Mockup */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-[240px] h-[140px] rounded-xl shadow-xl overflow-hidden relative" style={{ backgroundColor: ov.background }}>
          <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: ov.accent }} />
          <div className="p-4 pr-5 text-right h-full flex flex-col justify-between" dir="rtl">
            <div>
              <h4 className="text-sm font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>שם מלא</h4>
              <p className="text-[9px]" style={{ fontFamily: bodyFamily, color: c[1]?.hex || '#888' }}>תפקיד מקצועי</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px]" style={{ fontFamily: bodyFamily, color: '#777' }}>050-1234567</p>
              <p className="text-[8px]" style={{ fontFamily: bodyFamily, color: '#777' }}>email@brand.com</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-tr-full opacity-15" style={{ backgroundColor: c[2]?.hex || c[0].hex }} />
        </div>
        <span className="text-xs text-muted-foreground">כרטיס ביקור</span>
      </div>
    </div>
  );

  const renderProductPreview = (type: string) => {
    if (type === 'post') return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden relative" style={{ backgroundColor: ov.background }}>
          {decorations.elements.map(renderDecoration)}
          {/* Decorative icons */}
          <Sparkles className="absolute top-4 left-4 opacity-10" style={{ color: ov.accent }} size={28} />
          <Star className="absolute bottom-16 right-4 opacity-10" style={{ color: c[1]?.hex || ov.accent }} size={20} />
          <Heart className="absolute top-12 right-8 opacity-8" style={{ color: c[2]?.hex || ov.accent }} size={16} />
          <div className="relative z-10 p-8 flex flex-col h-full justify-between text-right" dir="rtl">
            <h4 className="text-2xl font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>כותרת הפוסט</h4>
            <p className="text-sm mt-2" style={{ fontFamily: bodyFamily, color: ov.text }}>טקסט לדוגמה – כך ייראה הפוסט שלך</p>
            <div className="mt-auto pt-4">
              <div className="inline-flex items-center gap-2 justify-center text-sm font-bold" style={{ ...buttonStyle.css, background: btnBg, color: btnColor, border: btnBorder, padding: '8px 24px', height: 'auto', minWidth: 'unset' }}>
                <Send size={14} />
                קריאה לפעולה
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setActiveProduct('post')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
          <Pencil className="w-4 h-4" /> פתח לעריכה מלאה
        </button>
      </div>
    );
    if (type === 'invitation') return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-[360px] rounded-xl overflow-hidden relative" style={{ backgroundColor: ov.background, aspectRatio: '1080/1350' }}>
          {decorations.elements.map(renderDecoration)}
          {/* Decorative icons */}
          <Sparkles className="absolute top-6 left-6 opacity-10" style={{ color: ov.accent }} size={24} />
          <Star className="absolute top-8 right-6 opacity-8" style={{ color: c[2]?.hex || ov.accent }} size={18} />
          <Heart className="absolute bottom-20 left-8 opacity-10" style={{ color: c[1]?.hex || ov.accent }} size={22} />
          <Award className="absolute bottom-24 right-6 opacity-8" style={{ color: c[3]?.hex || ov.accent }} size={16} />
          <div className="relative z-10 p-8 flex flex-col h-full justify-center items-center text-center gap-4" dir="rtl">
            <p className="text-xs flex items-center gap-1" style={{ fontFamily: bodyFamily, color: ov.text }}>
              <CalendarDays size={12} style={{ color: ov.accent }} />
              הנכם מוזמנים ל
            </p>
            <h4 className="text-3xl font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>אירוע מיוחד</h4>
            <div className="w-16 h-0.5 rounded" style={{ backgroundColor: ov.accent }} />
            <p className="text-sm flex items-center gap-1" style={{ fontFamily: bodyFamily, color: ov.text }}>
              <Clock size={12} style={{ color: ov.accent }} />
              יום שלישי, 20:00
            </p>
            <p className="text-xs flex items-center gap-1" style={{ fontFamily: bodyFamily, color: ov.text }}>
              <MapPin size={12} style={{ color: ov.accent }} />
              אולם האירועים
            </p>
          </div>
        </div>
        <button onClick={() => setActiveProduct('invitation')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
          <Pencil className="w-4 h-4" /> פתח לעריכה מלאה
        </button>
      </div>
    );
    if (type === 'worksheet') return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-[360px] rounded-xl overflow-hidden relative border border-border" style={{ backgroundColor: '#fff', aspectRatio: '210/297' }}>
          <div className="p-6 text-right" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ov.accent}15` }}>
                <Layers size={16} style={{ color: ov.accent }} />
              </div>
              <h4 className="text-lg font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>דף עבודה</h4>
            </div>
            <div className="w-full h-0.5 mb-4" style={{ backgroundColor: ov.accent, opacity: 0.3 }} />
            <p className="text-xs mb-3" style={{ fontFamily: bodyFamily, color: ov.text }}>שם: _______________ &nbsp;&nbsp; תאריך: ___________</p>
            {[1, 2, 3].map(n => (
              <div key={n} className="mb-3">
                <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ fontFamily: headingFamily, color: ov.heading }}>
                  <Target size={10} style={{ color: ov.accent }} />
                  שאלה {n}:
                </p>
                <div className="h-6 border-b" style={{ borderColor: `${ov.accent}40` }} />
              </div>
            ))}
          </div>
          {/* Decorative icons */}
          <Sparkles className="absolute bottom-4 left-4 opacity-8" style={{ color: ov.accent }} size={20} />
          <Star className="absolute bottom-4 right-4 opacity-8" style={{ color: c[1]?.hex || ov.accent }} size={16} />
        </div>
        <button onClick={() => setActiveProduct('worksheet')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
          <Pencil className="w-4 h-4" /> פתח לעריכה מלאה
        </button>
      </div>
    );
    if (type === 'business-card') return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-[320px] h-[190px] rounded-xl shadow-xl overflow-hidden relative" style={{ backgroundColor: ov.background }}>
          <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: ov.accent }} />
          <div className="p-6 pr-7 text-right h-full flex flex-col justify-between" dir="rtl">
            <div>
              <h4 className="text-lg font-bold" style={{ fontFamily: headingFamily, color: ov.heading }}>שם מלא</h4>
              <p className="text-xs" style={{ fontFamily: bodyFamily, color: c[1]?.hex || '#888' }}>תפקיד מקצועי</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] flex items-center gap-1" style={{ fontFamily: bodyFamily, color: ov.text }}>
                <Phone size={8} style={{ color: ov.accent }} /> 050-1234567
              </p>
              <p className="text-[10px] flex items-center gap-1" style={{ fontFamily: bodyFamily, color: ov.text }}>
                <Mail size={8} style={{ color: ov.accent }} /> email@brand.com
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-tr-full opacity-15" style={{ backgroundColor: c[2]?.hex || c[0].hex }} />
          <Palette className="absolute bottom-3 left-3 opacity-10" style={{ color: c[2]?.hex || ov.accent }} size={18} />
        </div>
        <button onClick={() => setActiveProduct('business-card')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
          <Pencil className="w-4 h-4" /> פתח לעריכה מלאה
        </button>
      </div>
    );
    if (type === 'landing') return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-[500px] rounded-xl overflow-hidden border border-border" style={{ backgroundColor: ov.background }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <div className="flex gap-3">
              <span className="text-[10px]" style={{ fontFamily: bodyFamily, color: ov.text }}>אודות</span>
              <span className="text-[10px]" style={{ fontFamily: bodyFamily, color: ov.text }}>שירותים</span>
            </div>
            <span className="text-sm font-bold flex items-center gap-1" style={{ fontFamily: headingFamily, color: ov.heading }}>
              <Globe size={12} style={{ color: ov.accent }} />
              המותג שלך
            </span>
          </div>
          <div className="p-8 text-right" dir="rtl">
            <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: headingFamily, color: ov.heading }}>הכותרת הראשית שלך</h4>
            <p className="text-sm mb-4 max-w-[300px]" style={{ fontFamily: bodyFamily, color: ov.text }}>טקסט לדוגמה – כך ייראה דף הנחיתה שלך.</p>
            <div className="flex gap-3">
              <div className="inline-flex items-center gap-1 justify-center text-sm font-bold" style={{ ...buttonStyle.css, background: btnBg, color: btnColor, border: btnBorder, padding: '8px 24px', height: 'auto', minWidth: 'unset' }}>
                <Zap size={14} />
                התחל עכשיו
              </div>
            </div>
          </div>
          {/* Feature icons row */}
          <div className="flex justify-around px-6 pb-4 border-t border-border pt-3">
            {[
              { icon: Target, label: 'ממוקד' },
              { icon: TrendingUp, label: 'צמיחה' },
              { icon: Users, label: 'קהילה' },
            ].map(({ icon: Ic, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c[i % c.length]?.hex}15` }}>
                  <Ic size={14} style={{ color: c[i % c.length]?.hex }} />
                </div>
                <span className="text-[9px]" style={{ fontFamily: bodyFamily, color: ov.text }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setActiveProduct('landing')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
          <Pencil className="w-4 h-4" /> פתח לעריכה מלאה
        </button>
      </div>
    );
    if (type === 'presentation') return (
      <div className="flex flex-col items-center gap-4">
        {/* Slide 1: Title */}
        <div className="w-full max-w-[540px] rounded-xl overflow-hidden shadow-xl relative" style={{ backgroundColor: ov.background, aspectRatio: '16/9' }}>
          {decorations.elements.map(renderDecoration)}
          <Sparkles className="absolute top-4 left-4 opacity-10" style={{ color: ov.accent }} size={20} />
          <div className="relative z-10 p-10 flex flex-col h-full justify-center text-right" dir="rtl">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] mb-3 self-start" style={{ backgroundColor: `${ov.accent}15`, color: ov.accent, fontFamily: bodyFamily }}>
              <Presentation size={10} />
              {style.tags[0] || 'מצגת'}
            </div>
            <h4 className="text-3xl font-bold mb-2" style={{ fontFamily: headingFamily, color: ov.heading }}>{orgInfo.name || 'כותרת המצגת'}</h4>
            <p className="text-base" style={{ fontFamily: bodyFamily, color: ov.text }}>{orgInfo.role || 'תת-כותרת או תיאור קצר'}</p>
            <div className="flex gap-2 mt-4">
              <div className="inline-flex items-center gap-1 justify-center text-xs font-bold" style={{ ...buttonStyle.css, background: btnBg, color: btnColor, border: btnBorder, padding: '6px 16px', height: 'auto', minWidth: 'unset', fontSize: '11px' }}>כפתור ראשי</div>
              <div className="inline-flex items-center gap-1 justify-center text-xs font-bold" style={{ ...buttonStyle.css, background: 'transparent', color: ov.accent, border: `1.5px solid ${ov.accent}`, padding: '6px 16px', height: 'auto', minWidth: 'unset', fontSize: '11px' }}>כפתור משני</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">שקף 1 – כותרת</p>

        {/* Slide 2: Data & Charts */}
        <div className="w-full max-w-[540px] rounded-xl overflow-hidden shadow-xl relative" style={{ backgroundColor: ov.background, aspectRatio: '16/9' }}>
          {decorations.elements.map(renderDecoration)}
          <div className="relative z-10 p-8 flex flex-col h-full text-right" dir="rtl">
            <h4 className="text-xl font-bold mb-4" style={{ fontFamily: headingFamily, color: ov.heading }}>נתונים ותרשימים</h4>
            <div className="flex gap-4 flex-1">
              {/* KPI Cards */}
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { icon: Users, value: '350', label: 'תלמידים', colorIdx: 0 },
                  { icon: TrendingUp, value: '95%', label: 'זכאות בגרות', colorIdx: 1 },
                  { icon: BarChart3, value: '12', label: 'מגמות לימוד', colorIdx: 2 },
                ].map(({ icon: Ic, value, label, colorIdx }, i) => (
                  <div key={i} className="rounded-lg p-2 flex items-center gap-2" style={{ backgroundColor: `${c[colorIdx]?.hex || c[0].hex}10` }}>
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${c[colorIdx]?.hex || c[0].hex}20` }}>
                      <Ic size={12} style={{ color: c[colorIdx]?.hex || c[0].hex }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ fontFamily: headingFamily, color: c[colorIdx]?.hex || c[0].hex }}>{value}</p>
                      <p className="text-[8px]" style={{ fontFamily: bodyFamily, color: ov.text }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bar chart simulation */}
              <div className="flex-1 flex items-end gap-2 pb-2">
                {[0.6, 0.8, 0.55, 0.95].map((pct, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold" style={{ color: c[i % c.length]?.hex || ov.accent }}>{Math.round(pct * 100)}%</span>
                    <div className="w-full rounded-t" style={{ height: `${pct * 80}px`, backgroundColor: c[i % c.length]?.hex || ov.accent, opacity: 0.85 }} />
                    <span className="text-[7px]" style={{ fontFamily: bodyFamily, color: ov.text }}>Q{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">שקף 2 – נתונים ותרשימים</p>

        <div className="flex gap-2 flex-wrap justify-center">
          <button onClick={() => setActiveProduct('presentation')} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all text-sm">
            <Eye className="w-4 h-4" /> תצוגה מקדימה מלאה
          </button>
          <button onClick={() => handleOpenProduct('presentation')} className="flex items-center gap-2 px-5 py-2.5 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
            <FileDown className="w-4 h-4" /> הורד PPTX
          </button>
        </div>
      </div>
    );
    return null;
  };

  const renderProductCard = (type: string, title: string) => (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-secondary/20">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <div className="w-full">{renderProductPreview(type)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold studio-gradient-text font-heebo">ערכת המיתוג שלכם מוכנה!</h2>
        <p className="text-muted-foreground">בחרו תוצר לתצוגה מקדימה, התאימו צבעים, ולחצו לפתוח ולערוך</p>
      </div>

      {/* ========== PRODUCT TABS ========== */}
      <div className="flex flex-wrap justify-center gap-2">
        {productTabs.filter(t => relevantTabs.includes(t.id)).map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Icon className="w-4 h-4" />
            {title}
          </button>
        ))}
      </div>

      {/* ========== TWO-COLUMN LAYOUT: Sticky Preview + Scrollable Edit ========== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* RIGHT (in RTL): Sticky Preview */}
        <div className="w-full lg:w-3/5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <section className="bg-card rounded-2xl p-6 border border-border">
            {activeTab === 'overview' ? (
              <>
                <h3 className="text-lg font-bold mb-4">📱 תצוגה מקדימה – סגנון: {style.name}</h3>
                {showAll ? (
                  <div className="space-y-8">
                    {renderOverviewMockups()}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-6">
                      {renderProductCard('post', 'פוסט לרשתות')}
                      {renderProductCard('invitation', 'הזמנה לאירוע')}
                      {renderProductCard('presentation', 'מצגת')}
                      {renderProductCard('worksheet', 'דף עבודה')}
                      {renderProductCard('business-card', 'כרטיס ביקור')}
                      {renderProductCard('landing', 'דף נחיתה')}
                    </div>
                  </div>
                ) : (
                  renderOverviewMockups()
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">📄 תצוגה מקדימה – {productTabs.find(t => t.id === activeTab)?.title}</h3>
                {renderProductPreview(activeTab as Exclude<PreviewTab, 'overview'>)}
              </>
            )}

            {/* Palette strip */}
            <div className="flex gap-1.5 mt-5 h-6 rounded-lg overflow-hidden max-w-md mx-auto">
              {c.map((color, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: color.hex }} />
              ))}
            </div>

            {/* Color customizer */}
            <div className="mt-4">
              <ColorCustomizer
                paletteColors={c}
                defaultBg={getBgFromPalette(c)}
                overrides={colorOverrides}
                onChange={(newOverrides) => setColorOverrides(newOverrides)}
              />
            </div>
          </section>
        </div>

        {/* LEFT (in RTL): Scrollable Edit & Details */}
        <div className="w-full lg:w-2/5 space-y-6">
          {/* Edit Elements */}
          <div className="flex justify-center lg:justify-start">
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-bold transition-all ${
                editing ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-foreground hover:bg-secondary'
              }`}
            >
              <Pencil className="w-4 h-4" />
              {editing ? 'סגור עריכה' : 'שנה פלטה / סגנון / פונטים / כפתורים'}
            </button>
          </div>

          {editing && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
              <EditPanel title="🎨 פלטת צבעים" field="palette" openPanel={openPanel} setOpenPanel={setOpenPanel}>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {colorPalettes.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPalette(p);
                        const dark = [...p.colors].sort((a, b) => getLuminance(a.hex) - getLuminance(b.hex))[0];
                        const autoH = getLuminance(p.colors[0].hex) > 0.55 ? dark.hex : p.colors[0].hex;
                        setColorOverrides({ heading: autoH, background: getBgFromPalette(p.colors), accent: p.colors[0].hex, button: p.colors[0].hex, text: '#555555' });
                      }}
                      className={`rounded-lg p-2 text-right transition-all border-2 ${palette.id === p.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}`}
                    >
                      <div className="flex gap-0.5 h-6 rounded overflow-hidden mb-1">
                        {p.colors.map((col, i) => <div key={i} className="flex-1" style={{ backgroundColor: col.hex }} />)}
                      </div>
                      <span className="text-xs font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>
              </EditPanel>

              <EditPanel title="🖌️ סגנון" field="style" openPanel={openPanel} setOpenPanel={setOpenPanel}>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {designStyles.map(s => (
                    <button key={s.id} onClick={() => setStyle(s)} className={`rounded-lg p-2 text-right transition-all border-2 ${style.id === s.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}`}>
                      <div className="h-8 rounded mb-1" style={{ backgroundColor: s.bgColor }} />
                      <span className="text-xs font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </EditPanel>

              <EditPanel title="✍️ פונטים" field="fonts" openPanel={openPanel} setOpenPanel={setOpenPanel}>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                  {fontCombos.map(f => {
                    const hf = fontFamilyMap[f.heading] || `'${f.heading}', sans-serif`;
                    const bf = fontFamilyMap[f.body] || `'${f.body}', sans-serif`;
                    return (
                      <button key={f.id} onClick={() => setFontCombo(f)} className={`rounded-lg p-3 text-right transition-all border-2 ${fontCombo.id === f.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}`}>
                        <p className="text-base font-bold" style={{ fontFamily: hf }}>{f.heading}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: bf }}>{f.body} – טקסט לדוגמה</p>
                      </button>
                    );
                  })}
                </div>
              </EditPanel>

              <EditPanel title="🔘 כפתורים" field="buttons" openPanel={openPanel} setOpenPanel={setOpenPanel}>
                <div className="flex flex-wrap gap-3 justify-center max-h-[300px] overflow-y-auto py-2">
                  {buttonStyles.map(b => {
                    const isSelected = buttonStyle.id === b.id;
                    const bg = b.category === 'outline' ? 'transparent' : b.category === 'gradient' ? `linear-gradient(135deg, ${c[0].hex}, ${c[1]?.hex})` : c[0].hex;
                    const color = b.category === 'outline' ? c[0].hex : '#fff';
                    const border = b.category === 'outline' ? `2px solid ${c[0].hex}` : 'none';
                    return (
                      <button key={b.id} onClick={() => setButtonStyle(b)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}`}>
                        <div className="flex items-center justify-center text-xs font-medium" style={{ ...b.css, background: bg, color, border, minWidth: b.css.width ? undefined : '80px' }}>
                          {b.css.width ? '→' : 'דוגמה'}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </EditPanel>
            </div>
          )}

          {/* Org Info */}
          <OrgInfoPanel />

          {/* Brand Details */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold mb-4">🎨 פלטת צבעים – {palette.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.map((color, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                  <div className="w-8 h-8 rounded-lg shrink-0 border border-border" style={{ backgroundColor: color.hex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{color.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                  <CopyButton text={color.hex} label={color.name} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold mb-4">✍️ פונטים – {fontCombo.name}</h3>
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">כותרת</p>
                <p className="text-2xl mb-2" style={{ fontFamily: headingFamily, color: ov.heading }}>אבגדהו שלום עולם</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{fontCombo.heading}</span>
                  <CopyButton text={fontCombo.heading} label="שם הפונט" />
                  <a href={`https://fonts.google.com/specimen/${fontCombo.heading.replace(/ /g, '+')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">Google Fonts ↗</a>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">גוף טקסט</p>
                <p className="text-lg mb-2" style={{ fontFamily: bodyFamily }}>אבגדהו שלום עולם – טקסט לדוגמה בגוף הטקסט</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{fontCombo.body}</span>
                  <CopyButton text={fontCombo.body} label="שם הפונט" />
                  <a href={`https://fonts.google.com/specimen/${fontCombo.body.replace(/ /g, '+')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">Google Fonts ↗</a>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={async () => {
                if (!previewRef.current) return;
                toast.loading('מייצר תמונה…');
                try {
                  const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
                  const link = document.createElement('a');
                  link.download = `brand-kit-${palette.id}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                  toast.dismiss();
                  toast.success('התמונה הורדה!');
                } catch {
                  toast.dismiss();
                  toast.error('שגיאה ביצירת התמונה');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <ImageDown className="w-4 h-4" />
              הורד כתמונה (PNG)
            </button>
            <button onClick={handleCopySummary} className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all">
              <Copy className="w-4 h-4" />
              העתק Brand Kit
            </button>
            <button onClick={handleDownloadSummary} className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border-2 border-border text-foreground font-medium hover:bg-secondary transition-all">
              <Download className="w-4 h-4" />
              הורד כקובץ טקסט
            </button>
            <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all">
              <RotateCcw className="w-4 h-4" />
              התחל מחדש
            </button>
          </div>

          {/* Google Slides Instructions */}
          <div className="bg-card rounded-2xl p-5 border border-border text-right space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2 justify-end">💡 איך לפתוח את התבנית ב-Google Slides?</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside pr-2">
              <li>הורידו את קובץ ה-PPTX בלחיצה על הכפתור למעלה</li>
              <li>פתחו את{' '}<a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Google Drive ↗</a>{' '}והעלו את הקובץ</li>
              <li>לחצו פעמיים על הקובץ – הוא ייפתח אוטומטית ב-Google Slides</li>
              <li>הפונטים מ-Google Fonts ייטענו אוטומטית ✨</li>
            </ol>
            <p className="text-xs text-muted-foreground/70">💬 טיפ: ב-PowerPoint הפונטים יעבדו רק אם הם מותקנים על המחשב. ב-Google Slides זה עובד מהקופסה!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
