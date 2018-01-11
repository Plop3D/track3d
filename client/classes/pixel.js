import Color from './color'

class Pixel extends Color {
  constructor (cam, index, x, y) {
    super(0, 0, 0)
    this.cam = cam
    this.index = index
    this.x = x
    this.y = y
    this.sort = 0
    this.baseHue = 0
    this.baseSat = 0
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
}

export default Pixel
