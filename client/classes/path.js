const MIN_LENGTH = 7

class Path {
  constructor (tracker, color, start) {
    this.tracker = tracker
    this.color = color
    const data = tracker.data
    const list = this.pixels = [start]
    let direction = 0
    let pixel = start
    let t = 0
    while (++t < 1e3) {
      const a = pixel.adjacent
      for (let i = 0, aCount = a.length; i < aCount; i++) {
        const p = a[(direction + i) % aCount]
        if (p) {
          const d = p.dataIndex
          p.update(data[d], data[d + 1], data[d + 2])
          if (p.hueDiff(color) < color.hueTolerance) {
            direction = (direction + i + 3) % aCount
            pixel = p
            p.path = this
            list.push(p)
            break
          }
        }
      }
      if (pixel === start) {
        break
      }
    }
    if (list.length > MIN_LENGTH) {
      console.log(list.length)
      this.update()
      color.paths.push(this)
    }
  }

  update () {
    const list = this.pixels
    const pairs = []
    const l = Math.floor(list.length / 2)
    for (let i = 0; i < l; i++) {
      const a = list[i]
      const b = list[i + l]
      const dx = a.x - b.x
      const dy = a.y - b.y
      pairs.push({a: a, b: b, s: dx * dx + dy * dy})
    }
    pairs.sort(function (a, b) {
      return b.s - a.s
    })
    let xSum = 0
    let ySum = 0
    let dSum = 0
    const n = Math.floor(l / 4)
    pairs.slice(0, n).forEach(function (pair) {
      const a = pair.a
      const b = pair.b
      xSum += a.x + b.x
      ySum += a.y + b.y
      dSum += Math.sqrt(pair.s)
    })
    const x = this.x = xSum / n / 2
    const y = this.y = ySum / n / 2
    const radius = this.radius = dSum / n / 2
    let score = 0
    for (let i = 0, l = list.length; i < l; i++) {
      const pixel = list[i]
      const dx = x - pixel.x
      const dy = y - pixel.y
      score += 1 / (Math.abs(radius - Math.sqrt(dx * dx + dy * dy)) + 1)
    }
    this.score = score
    this.circularity = score / l
  }
}

export default Path
