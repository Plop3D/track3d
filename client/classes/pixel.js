import Variance from './variance'
import Color from './color'

class Pixel extends Color {
  constructor (tracker, index, x, y) {
    super(tracker, 0, 0, 0)
    this.index = index
    this.dataIndex = index * 4
    this.x = x
    this.y = y
    // this.rVariance = new Variance()
    // this.gVariance = new Variance()
    // this.bVariance = new Variance()
    // this.varianceCounter = 0
    // this.variance = 0
  }

  updateVariance (r, g, b) {
    this.variance =
      this.rVariance.update(this.r) +
      this.gVariance.update(this.g) +
      this.bVariance.update(this.b)
  }
}

export default Pixel
