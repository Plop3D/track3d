import Vector from './vector'

const MIN_LENGTH = 4
const MIN_CIRCULARITY = 10
const PI = Math.PI
const RAD = 2 * PI

let meanCircularity = 15
const stats = { centroid: 0, pairs: 0, skipped: 0 }

// let tracker
// setInterval(() => {
//   if (tracker && tracker.active) console.log(stats)
// }, 1e3)

class Path {
  constructor (cam, target, start, search) {
    // tracker = cam.tracker
    this.cam = cam
    this.target = target
    this.x = 0
    this.y = 0
    this.radius = 0
    this.diff = 0
    this.circularity = 0
    this.constructing = true
    start.search = search
    start.path = this
    const pixels = this.pixels = [start]
    let direction = 0
    let pixel = start
    let t = 0
    while (++t < 1e3) {
      const a = pixel.adjacent
      for (let i = 0; i < 4; i++) {
        const p = a[(direction + i) % 4]
        if (p && target.match(p)) {
          p.search = search
          direction = (direction + i + 3) % 4
          pixel = p
          if (pixels[pixels.length - 2] === p) {
            pixels.pop().path = null
          } else {
            p.path = this
            pixels.push(p)
          }
          break
        }
      }
      if (pixel === start) {
        break
      }
    }
    if (pixels.length < MIN_LENGTH) {
      return
    }
    if (global.describe) {
      return target.paths.push(this)
    }
    // this.trimTails()
    this.findConvexCircle()
    this.findCentroidCircle()
    if (this.circularity > meanCircularity) {
      this.method = 'skipped'
    } else {
      this.findPairsCircle()
    }
    const paths = target.paths
    for (let i = 0, l = paths.length; i < l; i++) {
      const path = paths[i]
      if (this.distanceTo(path) < path.radius) {
        return
      }
    }
    const { method, circularity } = this
    if (circularity < MIN_CIRCULARITY) {
      return
    }
    stats[method]++
    meanCircularity += 0.01 * (circularity - meanCircularity)
    stats.mean = Math.round(meanCircularity)
    paths.push(this)
    this.constructing = false
  }

  static search (cam, x1, y1, x2, y2) {
    cam.tracker.targets.forEach(target => Path.searchTarget(target, cam, x1, y1, x2, y2))
  }

  static searchTarget (target, cam, x1, y1, x2, y2) {
    cam.search++
    const pixels = cam.pixels
    const length = pixels.length
    const width = cam.width
    let paths = target.paths = []
    for (let i = 0; i < length; i++) {
      let pixel = pixels[i]
      if (target.match(pixel)) {
        if (pixel.search === cam.search) continue
        if (target.match(pixels[i - width])) continue
        cam.newPath = new Path(cam, target, pixel, cam.search)
      }
    }
    paths.sort((a, b) => b.circularity - a.circularity)
    paths.length = Math.min(paths.length, target.limit)
  }

  trimTails () {
    const pixels = this.pixels
    let length = pixels.length
    let found = false
    for (let i = 0; i < length; i++) {
      const p = pixels[i]
      const adjacent = p.adjacent
      let n = 0
      for (let j = 0; j < 4; j++) {
        const a = adjacent[j]
        if (a.path === this) {
          n++
        }
      }
      if (n === 1) {
        found = true
        pixels.splice(i, 1)
        length--
        i--
      }
    }
    if (found) {
      this.trimTails()
    }
  }

  findConvexCircle () {
    const pixels = this.pixels
    const length = pixels.length
    const size = Math.round(1 / this.cam.scale)
    const offset = Math.floor(size / 2)
    const curveOffset = 5
    if (length < size + curveOffset * 2) return
    const smooths = new Array(length)
    const smooth = new Vector(0, 0)
    for (let t = -offset; t < offset; t++) {
      smooth.add(pixels[(t + length) % length])
    }
    for (let i = 0; i < length; i++) {
      smooth.add(pixels[(i + offset) % length])
      pixels[i].smooth = smooths[i] = new Vector(smooth.x, smooth.y)
      smooth.subtract(pixels[(i - offset + length) % length])
    }
    for (let i = 0; i < length; i++) {
      const a = smooths[(i + length - curveOffset) % length]
      const b = smooths[i]
      const c = smooths[(i + curveOffset) % length]
      const d = Vector.between(a, b).angle - Vector.between(b, c).angle
      const pixel = pixels[i]
      pixel.curve = d < -PI ? d + RAD : d > PI ? d - RAD : d
    }
  }

  findCentroidCircle () {
    const pixels = this.pixels
    const length = pixels.length
    let xSum = 0
    let ySum = 0
    for (let i = 0; i < length; i++) {
      const pixel = pixels[i]
      xSum += pixel.x
      ySum += pixel.y
    }
    const x = xSum / length
    const y = ySum / length
    let sum = 0
    for (let i = 0; i < length; i++) {
      const pixel = pixels[i]
      const dx = x - pixel.x
      const dy = y - pixel.y
      sum += dx * dx + dy * dy
    }
    const radius = Math.sqrt(sum / length)
    this.evaluateCircle({ x, y, radius, method: 'centroid' })
  }

  findCulledPairsCircle () {
    const pixels = this.pixels
    const length = pixels.length
    const half = Math.floor(length / 2)
    const pairs = []
    const sMin = this.radius * this.radius * 4
    for (let i = 0; i < half; i++) {
      const a = pixels[i]
      const b = pixels[i + half]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const s = dx * dx + dy * dy
      if (s > sMin) {
        pairs.push({ a, b, s })
      }
    }
    pairs.sort(function (a, b) {
      return b.s - a.s
    })
    let xSum = 0
    let ySum = 0
    let dSum = 0
    const n = Math.max(2, Math.floor(half / 4))
    pairs.slice(0, n).forEach(function (pair) {
      const a = pair.a
      const b = pair.b
      xSum += a.x + b.x
      ySum += a.y + b.y
      dSum += Math.sqrt(pair.s)
    })
    const x = xSum / n / 2
    const y = ySum / n / 2
    const radius = dSum / n / 2
    this.evaluateCircle({ x, y, radius, method: 'culledPairs' })
  }

  findPairsCircle () {
    const pixels = this.pixels
    const length = pixels.length
    const half = Math.floor(length / 2)
    const pairs = []
    for (let i = 0; i < half; i++) {
      const a = pixels[i]
      const b = pixels[i + half]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const s = dx * dx + dy * dy
      pairs.push({ a, b, s })
    }
    pairs.sort(function (a, b) {
      return b.s - a.s
    })
    let xSum = 0
    let ySum = 0
    let dSum = 0
    const n = Math.max(2, Math.floor(half / 4))
    pairs.slice(0, n).forEach(function (pair) {
      const a = pair.a
      const b = pair.b
      xSum += a.x + b.x
      ySum += a.y + b.y
      dSum += Math.sqrt(pair.s)
    })
    const x = xSum / n / 2
    const y = ySum / n / 2
    const radius = dSum / n / 2
    this.evaluateCircle({ x, y, radius, method: 'pairs' })
  }

  evaluateCircle (circle) {
    if (!this.constructing) {
      return
    }
    const radius = circle.radius
    const pixels = this.pixels
    const length = pixels.length
    let circularity = 0
    for (let i = 0; i < length; i++) {
      const pixel = pixels[i]
      const d = pixel.distanceTo(circle)
      circularity += 1 / (Math.abs(1 - d / radius) + 0.1)
    }
    circularity /= Math.pow(length, 0.75)
    if (circularity > this.circularity) {
      this.x = circle.x
      this.y = circle.y
      this.radius = radius
      this.circularity = circularity
      this.method = circle.method
    }
  }

  distanceTo (o) {
    const dx = o.x - this.x
    const dy = o.y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }
}

export default Path
