let rMin = 0
let rMax = 255
let gMin = 0
let gMax = 255
let bMin = 0
let bMax = 255

class Color {
  constructor (tracker, r, g, b) {
    this.tracker = tracker
    this.update(r, g, b)
  }

  static base (r, g, b) {
    const avg = (r + g + b) / 3
    rMax = 255 + (rMin = Math.round((r - avg) / 2))
    gMax = 255 + (gMin = Math.round((g - avg) / 2))
    bMax = 255 + (bMin = Math.round((b - avg) / 2))
  }

  update (r, g, b) {
    this.r = r = r < rMin ? 0 : r > rMax ? 255 : r - rMin
    this.g = g = g < gMin ? 0 : g > gMax ? 255 : g - gMin
    this.b = b = b < bMin ? 0 : b > bMax ? 255 : b - bMin
    const min = Math.min(r, g, b)
    const max = Math.max(r, g, b)
    const diff = max - min
    let hue
    if (diff) {
      switch (max) {
        case r:
          hue = (g - b) / diff + (g < b ? 6 : 0)
          break
        case g:
          hue = (b - r) / diff + 2
          break
        case b:
          hue = (r - g) / diff + 4
          break
      }
    } else {
      hue = 0
    }
    this.hue = hue
    this.saturation = diff
  }

  updateVariance (r, g, b) {
    this.variance =
      this.rVariance.update(this.r) +
      this.gVariance.update(this.g) +
      this.bVariance.update(this.b)
  }

  diff (color) {
    if (!color) return 0
    const dR = this.r - color.r
    const dG = this.g - color.g
    const dB = this.b - color.b
    return Math.sqrt(dR * dR + dG * dG + dB * dB)
  }

  hueMatch (color) {
    let diff = Math.abs(this.hue - color.hue)
    return Math.sqrt(this.saturation / color.saturation) / ((diff < 3 ? diff : 6 - diff) + 1)
  }

  hueDiff (color) {
    let diff = Math.abs(this.hue - color.hue)
    return diff < 3 ? diff : 6 - diff
  }
}

export default Color
