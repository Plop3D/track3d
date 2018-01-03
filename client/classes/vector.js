class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  get angle () {
    return Math.atan2(this.y, this.x)
  }

  add (vector) {
    this.x += vector.x
    this.y += vector.y
    return this
  }

  subtract (vector) {
    this.x -= vector.x
    this.y -= vector.y
    return this
  }

  static between (a, b) {
    return new Vector(b.x - a.x, b.y - a.y)
  }
}

export default Vector
