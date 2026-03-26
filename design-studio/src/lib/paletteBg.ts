/**
 * Generate a very light background tint from a hex color.
 * Takes a color and returns a near-white version with just a hint of the hue.
 */
export function generatePaletteBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Blend 8% of the color with 92% white
  const mix = 0.08;
  const br = Math.round(255 * (1 - mix) + r * mix);
  const bg = Math.round(255 * (1 - mix) + g * mix);
  const bb = Math.round(255 * (1 - mix) + b * mix);

  return `#${br.toString(16).padStart(2, '0')}${bg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

/**
 * Pick the best background from a palette's colors.
 * Uses the lightest color in the palette to derive a tint,
 * or falls back to the primary color.
 */
export function getBgFromPalette(colors: { hex: string }[]): string {
  if (!colors.length) return '#FFFFFF';

  // Find the lightest color in the palette
  let lightest = colors[0];
  let maxLightness = 0;

  for (const c of colors) {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    const lightness = (r + g + b) / 3;
    if (lightness > maxLightness) {
      maxLightness = lightness;
      lightest = c;
    }
  }

  // If the lightest color is already very light (>220 avg), use it directly with slight tint
  if (maxLightness > 220) {
    return generatePaletteBg(lightest.hex);
  }

  // Otherwise, create a very light tint from the primary color
  return generatePaletteBg(colors[0].hex);
}
