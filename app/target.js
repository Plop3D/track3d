import Color from './color'

class Target extends Color {
  constructor (tracker, options) {
    super(tracker, 0, 0, 0)
    this.hex = options.hex
    this.tolerance = options.tolerance
    this.name = options.name
  }

  set hex (hex) {
    this._hex = hex = '#' +
      hex.toLowerCase()
        .replace(/[^0-9a-f]/g, '')
        .replace(/^(.)(.)(.)$/, '#$1$1$2$2$3$3')
    const r = hexToDecimal(hex.substr(0, 2))
    const g = hexToDecimal(hex.substr(2, 2))
    const b = hexToDecimal(hex.substr(4, 2))
    this.update(r, g, b)
  }

  get hex () {
    return this._hex
  }

  hueDiff (color) {
    let diff = Math.abs(this.hue - color.hue)
    return diff < 3 ? diff : 6 - diff
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
