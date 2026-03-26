import type { DesignStyle } from '@/data/studio';

// Maps each style to a visual "family" that determines decoration approach
export type StyleFamily = 'organic' | 'geometric' | 'playful' | 'bold' | 'elegant' | 'earthy';

export function getStyleFamily(style: DesignStyle): StyleFamily {
  switch (style.id) {
    case 'watercolor':
    case 'pastel-soft':
    case 'field-flowers':
      return 'organic';
    case 'clean-mgmt':
    case 'edu-presentation':
      return 'geometric';
    case 'playful':
    case 'lime-fresh':
    case 'coral-warm':
      return 'playful';
    case 'splash-bold':
    case 'splash-dramatic':
      return 'bold';
    case 'dusty-rose':
      return 'elegant';
    case 'earthy-warm':
      return 'earthy';
    default:
      return 'geometric';
  }
}

// CSS decorations for each style family (used in BrandKit live preview)
export function getPreviewDecorations(family: StyleFamily, colors: string[]) {
  const c0 = colors[0];
  const c1 = colors[1] || c0;
  const c2 = colors[2] || c0;
  const c3 = colors[3] || c1;
  const c4 = colors[4] || c2;

  switch (family) {
    case 'organic':
      return {
        sideAccent: 'none',
        elements: [
          // Soft blobs in corners
          { type: 'blob' as const, x: '-5%', y: '-8%', w: '35%', h: '35%', color: c1, opacity: 0.12, borderRadius: '60% 40% 50% 70% / 50% 60% 40% 50%', rotate: 0 },
          { type: 'blob' as const, x: '70%', y: '65%', w: '40%', h: '40%', color: c2, opacity: 0.1, borderRadius: '50% 60% 40% 70% / 40% 50% 60% 50%', rotate: 15 },
          // Scattered small dots
          { type: 'dot' as const, x: '15%', y: '70%', w: '8px', h: '8px', color: c3, opacity: 0.3, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '25%', y: '15%', w: '6px', h: '6px', color: c4, opacity: 0.25, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '60%', y: '20%', w: '10px', h: '10px', color: c1, opacity: 0.2, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '80%', y: '45%', w: '5px', h: '5px', color: c2, opacity: 0.3, borderRadius: '50%', rotate: 0 },
        ],
        contentLayout: 'centered' as const,
      };

    case 'geometric':
      return {
        sideAccent: 'grid',
        elements: [
          // Grid lines
          { type: 'line' as const, x: '0', y: '0', w: '100%', h: '3px', color: c0, opacity: 0.08, borderRadius: '0', rotate: 0 },
          { type: 'line' as const, x: '0', y: '100%', w: '100%', h: '3px', color: c0, opacity: 0.08, borderRadius: '0', rotate: 0 },
          // Corner squares
          { type: 'rect' as const, x: '3%', y: '5%', w: '30px', h: '30px', color: c0, opacity: 0.1, borderRadius: '4px', rotate: 0 },
          { type: 'rect' as const, x: '3%', y: '12%', w: '20px', h: '20px', color: c1, opacity: 0.08, borderRadius: '4px', rotate: 0 },
          // Right side accent blocks
          { type: 'rect' as const, x: '92%', y: '60%', w: '40px', h: '40px', color: c2, opacity: 0.08, borderRadius: '4px', rotate: 45 },
          { type: 'rect' as const, x: '88%', y: '70%', w: '25px', h: '25px', color: c0, opacity: 0.06, borderRadius: '4px', rotate: 0 },
        ],
        contentLayout: 'structured' as const,
      };

    case 'playful':
      return {
        sideAccent: 'dots',
        elements: [
          // Large playful circles
          { type: 'blob' as const, x: '-8%', y: '55%', w: '25%', h: '25%', color: c0, opacity: 0.12, borderRadius: '50%', rotate: 0 },
          { type: 'blob' as const, x: '75%', y: '-10%', w: '30%', h: '30%', color: c2, opacity: 0.1, borderRadius: '50%', rotate: 0 },
          // Scattered fun dots
          { type: 'dot' as const, x: '10%', y: '20%', w: '14px', h: '14px', color: c1, opacity: 0.3, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '20%', y: '75%', w: '18px', h: '18px', color: c3, opacity: 0.25, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '85%', y: '50%', w: '12px', h: '12px', color: c0, opacity: 0.2, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '65%', y: '80%', w: '20px', h: '20px', color: c4, opacity: 0.15, borderRadius: '50%', rotate: 0 },
          { type: 'dot' as const, x: '50%', y: '10%', w: '10px', h: '10px', color: c2, opacity: 0.2, borderRadius: '50%', rotate: 0 },
          // Wavy bottom accent
          { type: 'wave' as const, x: '0', y: '90%', w: '100%', h: '10%', color: c0, opacity: 0.06, borderRadius: '100% 100% 0 0', rotate: 0 },
        ],
        contentLayout: 'centered' as const,
      };

    case 'bold':
      return {
        sideAccent: 'none',
        elements: [
          // Large dramatic diagonal block
          { type: 'rect' as const, x: '-15%', y: '-20%', w: '50%', h: '140%', color: c0, opacity: 0.07, borderRadius: '0', rotate: -15 },
          // Bold accent strips
          { type: 'line' as const, x: '0', y: '85%', w: '40%', h: '8px', color: c0, opacity: 0.5, borderRadius: '4px', rotate: 0 },
          { type: 'line' as const, x: '0', y: '88%', w: '25%', h: '5px', color: c1, opacity: 0.4, borderRadius: '4px', rotate: 0 },
          // Accent corner triangle
          { type: 'rect' as const, x: '85%', y: '0', w: '20%', h: '20%', color: c2, opacity: 0.1, borderRadius: '0 0 0 100%', rotate: 0 },
        ],
        contentLayout: 'offset' as const,
      };

    case 'elegant':
      return {
        sideAccent: 'thin-line',
        elements: [
          // Thin gold-like border frame
          { type: 'frame' as const, x: '3%', y: '4%', w: '94%', h: '92%', color: c0, opacity: 0.12, borderRadius: '0', rotate: 0 },
          // Small diamond accent
          { type: 'rect' as const, x: '48%', y: '3%', w: '20px', h: '20px', color: c0, opacity: 0.2, borderRadius: '2px', rotate: 45 },
          // Subtle bottom flourish
          { type: 'line' as const, x: '30%', y: '92%', w: '40%', h: '2px', color: c0, opacity: 0.15, borderRadius: '0', rotate: 0 },
          { type: 'dot' as const, x: '49%', y: '91.5%', w: '6px', h: '6px', color: c0, opacity: 0.2, borderRadius: '50%', rotate: 0 },
        ],
        contentLayout: 'centered' as const,
      };

    case 'earthy':
      return {
        sideAccent: 'none',
        elements: [
          // Horizontal earth-tone bands
          { type: 'rect' as const, x: '0', y: '0', w: '100%', h: '6%', color: c0, opacity: 0.15, borderRadius: '0', rotate: 0 },
          { type: 'rect' as const, x: '0', y: '6%', w: '100%', h: '3%', color: c1, opacity: 0.1, borderRadius: '0', rotate: 0 },
          // Organic bottom shape
          { type: 'blob' as const, x: '-5%', y: '80%', w: '110%', h: '25%', color: c2, opacity: 0.06, borderRadius: '50% 50% 0 0', rotate: 0 },
          // Small texture marks
          { type: 'rect' as const, x: '85%', y: '30%', w: '4px', h: '40px', color: c0, opacity: 0.15, borderRadius: '2px', rotate: 0 },
          { type: 'rect' as const, x: '88%', y: '35%', w: '4px', h: '25px', color: c1, opacity: 0.1, borderRadius: '2px', rotate: 0 },
        ],
        contentLayout: 'structured' as const,
      };
  }
}
