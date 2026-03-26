/**
 * Extract dominant colors from an image using Canvas pixel sampling.
 * Returns a brand-ready palette: { primary, secondary, accent, neutralLight, neutralDark }
 */

export function extractColorsFromImage(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Scale down for performance
      const maxSize = 100
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = Math.floor(img.width * scale)
      canvas.height = Math.floor(img.height * scale)

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // Collect non-white, non-black, non-transparent pixels
      const colorBuckets = {}

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        // Skip transparent pixels
        if (a < 128) continue

        // Skip near-white and near-black
        const brightness = (r + g + b) / 3
        if (brightness > 240 || brightness < 15) continue

        // Quantize to reduce color space (bucket by 24)
        const qr = Math.round(r / 24) * 24
        const qg = Math.round(g / 24) * 24
        const qb = Math.round(b / 24) * 24

        const key = `${qr},${qg},${qb}`
        if (!colorBuckets[key]) {
          colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0, sumR: 0, sumG: 0, sumB: 0 }
        }
        colorBuckets[key].count++
        colorBuckets[key].sumR += r
        colorBuckets[key].sumG += g
        colorBuckets[key].sumB += b
      }

      // Sort by frequency
      const sorted = Object.values(colorBuckets)
        .sort((a, b) => b.count - a.count)

      if (sorted.length === 0) {
        // Fallback if no colors found
        resolve(null)
        return
      }

      // Get top colors with actual average values
      const topColors = sorted.slice(0, 10).map(bucket => ({
        r: Math.round(bucket.sumR / bucket.count),
        g: Math.round(bucket.sumG / bucket.count),
        b: Math.round(bucket.sumB / bucket.count),
        count: bucket.count,
      }))

      // Filter to get distinct colors (minimum distance between them)
      const distinct = getDistinctColors(topColors, 3)

      // Build palette
      const primary = distinct[0]
      const secondary = distinct[1] || lighten(primary, 0.3)
      const accent = distinct[2] || getComplementary(primary)

      resolve({
        primary: rgbToHex(primary.r, primary.g, primary.b),
        secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
        accent: rgbToHex(accent.r, accent.g, accent.b),
        neutralLight: generateNeutralLight(primary),
        neutralDark: generateNeutralDark(primary),
      })
    }

    img.onerror = () => resolve(null)
    img.src = imageSrc
  })
}

// Get N distinct colors from a list (ensuring visual difference)
function getDistinctColors(colors, count) {
  if (colors.length <= count) return colors

  const result = [colors[0]]

  for (let i = 1; i < colors.length && result.length < count; i++) {
    const candidate = colors[i]
    const isDistinct = result.every(existing =>
      colorDistance(existing, candidate) > 60
    )
    if (isDistinct) {
      result.push(candidate)
    }
  }

  // If we didn't find enough distinct colors, fill with derived colors
  while (result.length < count) {
    const base = result[0]
    if (result.length === 1) {
      result.push(lighten(base, 0.35))
    } else {
      result.push(getComplementary(base))
    }
  }

  return result
}

// Euclidean distance in RGB space
function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  )
}

function lighten(color, amount) {
  return {
    r: Math.min(255, Math.round(color.r + (255 - color.r) * amount)),
    g: Math.min(255, Math.round(color.g + (255 - color.g) * amount)),
    b: Math.min(255, Math.round(color.b + (255 - color.b) * amount)),
  }
}

function getComplementary(color) {
  // Rotate hue by ~120 degrees via simple RGB shift
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
  const newH = (h + 0.33) % 1
  const { r, g, b } = hslToRgb(newH, Math.min(s, 0.7), Math.max(l, 0.45))
  return { r, g, b }
}

function generateNeutralLight(primary) {
  // Warm tinted light background based on primary
  const { h } = rgbToHsl(primary.r, primary.g, primary.b)
  const { r, g, b } = hslToRgb(h, 0.08, 0.97)
  return rgbToHex(r, g, b)
}

function generateNeutralDark(primary) {
  // Tinted dark based on primary
  const { h } = rgbToHsl(primary.r, primary.g, primary.b)
  const { r, g, b } = hslToRgb(h, 0.15, 0.15)
  return rgbToHex(r, g, b)
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c =>
    Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')
  ).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h, s, l }
}

function hslToRgb(h, s, l) {
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}
