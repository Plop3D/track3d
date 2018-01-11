class Color {
  constructor (r, g, b) {
    this.setRgb(r, g, b)
  }

  setRgb (r, g, b) {
    this.r = r
    this.g = g
    this.b = b
    let min = r < g ? r : g
    min = min < b ? min : b
    let max = r > g ? r : g
    max = max > b ? max : b
    this.sat = max - min
    this.hue = this.sat < 1 ? 0
      : max === r ? (g - b) / this.sat + (g < b ? 6 : 0)
      : max === g ? (b - r) / this.sat + 2
      : (r - g) / this.sat + 4
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
    return Math.sqrt(this.sat / color.sat) / ((diff < 3 ? diff : 6 - diff) + 1)
  }

  hueDiff (color) {
    let diff = Math.abs(this.hue - color.hue)
    return diff < 3 ? diff : 6 - diff
  }
}

export default Color
