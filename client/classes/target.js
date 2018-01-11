import Color from './color'

class Target extends Color {
  constructor (tracker, options) {
    super(0, 0, 0)
    this.tracker = tracker
    this.name = options.name
    this.hex = options.hex
    this.hueTolerance = (options.hueTolerance || 50) / 60
    this.minSat = (options.minSat || 10) / 100 * 255
    this.limit = options.limit || 1
    this.paths = []
    this.oldPaths = []
    this.blobs = []
  }

  set hex (hex) {
    this._hex = hex = '#' +
      hex.toLowerCase()
        .replace(/[^0-9a-f]/g, '')
        .replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3')
    const r = hexToDecimal(hex.substr(1, 2))
    const g = hexToDecimal(hex.substr(3, 2))
    const b = hexToDecimal(hex.substr(5, 2))
    this.setRgb(r, g, b)
  }

  get hex () {
    return this._hex
  }

  match (pixel) {
    if (!pixel) {
      return false
    }
    if (pixel.sat < this.minSat) {
      return false
    }
    const diff = this.hueDiff(pixel)
    if (diff > this.hueTolerance) {
      return false
    }
    return true
  }

  score (pixel) {
    if (!pixel) {
      return 0
    }
    const satDiff = pixel.sat - this.minSat
    if (satDiff < 0) {
      return 0
    }
    const hueDiff = this.hueDiff(pixel)
    if (hueDiff > this.hueTolerance) {
      return 0
    }
    return Math.sqrt(satDiff + 1) / (hueDiff + 0.2)
  }

  diff (pixel) {
    const dr = this.r - pixel.r
    const dg = this.g - pixel.g
    const db = this.b - pixel.b
    return dr * dr + dg * dg + db * db
  }
}

function hexToDecimal (hex) {
  let n = 0
  for (let i = 0, l = hex.length; i < l; i++) {
    n = n * 16 + ((hex.charCodeAt(i) - 48) % 39)
  }
  return n
}

export default Target
