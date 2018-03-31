import Color from './color'

class Pixel extends Color {
  constructor (cam, index, x, y) {
    super(0, 0, 0)
    this.cam = cam
    this.index = index
    this.x = x
    this.y = y
    this.hue = 0
    this.sat = 0
    this.sort = 0
  }

  distanceTo (o) {
    const dx = o.x - this.x
    const dy = o.y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  add (vector) {
    this.x += vector.x
    this.y += vector.y
  }

  subtract (vector) {
    this.x -= vector.x
    this.y -= vector.y
  }

  get foregroundness () {
    const hueDiff = this.hue - this.backgroundHue
    const satDiff = this.sat - this.backgroundSat
    return Math.abs(hueDiff * satDiff)
  }
}

export default Pixel
