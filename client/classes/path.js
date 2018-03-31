const MIN_LENGTH = 4
const MIN_CIRCULARITY = 1
const PI = Math.PI
const RAD = PI * 2

// const DIRECTION_LEFT = 0
// const DIRECTION_AHEAD = 1
const DIRECTION_RIGHT = 2
const DIRECTION_BACK = 3

const stats = {
  range: 0,
  centroid: 0,
  outer: 0,
  chords: 0,
  gravity: 0
}

let tracker
setInterval(() => {
  if (tracker && tracker.active) console.log(JSON.stringify(stats, 0, ' '))
}, 1e3)

class Path {
  constructor (cam, target, start, search) {
    tracker = cam.tracker
    this.cam = cam
    this.target = target
    this.x = 0
    this.y = 0
    this.radius = 0
    this.diff = 0
    this.colorScore = 0
    this.circularity = 0
    this.constructing = true
    this.pairs = []
    this.outer = []
    this.arcs = []
    start.search = search
    start.path = this
    const pixels = this.pixels = [start]
    const corners = [start]
    const width = cam.width
    let direction = 0
    let pixel = start
    let t = 0
    let lastScore = 0
    let lastCorner = null
    let lastCornerOffset = 0
    let minX = Infinity
    let maxX = 0
    let minY = Infinity
    let maxY = 0
    while (++t < 1e3) {
      const adjacent = pixel.adjacent
      for (let turn = 0; turn < 4; turn++) {
        const candidate = adjacent[(direction + turn) % 4]
        if (!candidate) continue
        const score = target.score(candidate)
        if (!score) continue
        if (turn === DIRECTION_RIGHT) {
          if (lastCorner) {
            const offset = pixel.index - lastCorner.index
            if (offset === lastCornerOffset) {
              corners.pop()
            }
            lastCornerOffset = offset
          }
          corners.push(pixel)
          lastCorner = pixel
        }
        candidate.search = search
        direction = (direction + turn + 3) % 4
        pixel = candidate
        if (turn === DIRECTION_BACK) {
          pixels.pop().path = null
          this.colorScore -= lastScore
        } else {
          candidate.path = this
          pixels.push(candidate)
          this.colorScore += score
          if (candidate.x < minX) minX = candidate.x
          else if (candidate.x > maxX) maxX = candidate.x
          if (candidate.y < minY) minY = candidate.y
          else if (candidate.y > maxY) maxY = candidate.y
        }
        lastScore = score
        break
      }
      if (pixel === start) {
        break
      }
    }
    const length = pixels.length
    if (length < MIN_LENGTH) return
    if (global.describe) {
      return target.paths.push(this)
    }
    this.colorScore /= length
    const circle = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      radius: Math.sqrt((maxX - minX) * (maxY - minY)) / 2,
      method: 'range',
      outer: corners
    }
    this.evaluateCircle(circle)
    this.findOuter(corners)
    if (!this.outer.length) return
    this.findArcCircle()
    this.findCentroidCircle()
    this.findOuterCircle()
    this.findChordCircle()
    for (let i = 0; i < 25; i++) {
      this.findGravityCircle()
    }
    const paths = target.paths
    for (let i = 0, l = paths.length; i < l; i++) {
      const path = paths[i]
      if (this.distanceTo(path) < path.radius) {
        return
      }
    }
    const { method, methodTry, circularity } = this
    if (circularity < MIN_CIRCULARITY) {
      return
    }
    if (methodTry === undefined) {
      stats[method]++
    } else {
      stats[method][methodTry]++
    }
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
    if (global.describe) return
    paths.sort((a, b) => b.fitness - a.fitness)
    let fitnesses = []
    paths.forEach(path => fitnesses.push(path.fitness))
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
    const center = { x, y }
    let ddSum = 0
    for (let i = 0; i < length; i++) {
      ddSum += distanceSquared(center, pixels[i])
    }
    const radius = Math.sqrt(ddSum / length)
    this.evaluateCircle({ x, y, radius, method: 'centroid' })
  }

  findOuter (corners) {
    const outer = this.outer
    const length = corners.length
    const end = length - 1
    const angleTo = []
    let last = corners[end]
    for (let i = 0; i < length; i++) {
      const pixel = corners[i]
      const dx = pixel.x - last.x
      const dy = pixel.y - last.y
      angleTo[i] = Math.atan2(dy, dx)
      last = pixel
    }
    let lastAngle = angleTo[end]
    outer.length = 0
    for (let i = 0; i < length; i++) {
      const angle = angleTo[i]
      const diff = angle - lastAngle
      const angleBetween = diff < -PI ? diff + RAD : diff > PI ? diff - RAD : diff
      if (angleBetween > 0) {
        this.outer.push(corners[i])
      }
      lastAngle = angle
    }
  }

  findOuterCircle () {
    const { outer } = this
    const n = outer.length
    const pairs = this.pairs = []
    for (let i = 0; i < n; i++) {
      const a = outer[i]
      let ddMax = 0
      let furthest
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const b = outer[j % n]
          const dd = distanceSquared(a, b)
          if (dd > ddMax) {
            ddMax = dd
            furthest = b
          }
        }
      }
      if (furthest) {
        pairs.push({ a, b: furthest, dd: ddMax })
      }
    }
    const l = pairs.length
    if (l) {
      pairs.sort((a, b) => a.d - b.d)
      let x = 0
      let y = 0
      let radius = 0
      pairs.forEach(p => {
        x += (p.a.x + p.b.x) / 2
        y += (p.a.y + p.b.y) / 2
        radius += Math.sqrt(p.dd) / 2
      })
      x /= l
      y /= l
      radius /= l
      pairs.length = Math.max(Math.floor(l / 4), 4)
      this.evaluateCircle({ x, y, radius, method: 'outer' })
    }
  }

  findChordCircle (time) {
    const limit = 8
    const { outer } = this
    const pixels = Array.prototype.slice.call(outer)
    if (pixels.length > limit) {
      pixels.sort((a, b) => b.fit - a.fit)
      pixels.length = limit
    }
    const length = pixels.length
    const end = length - 1
    const perps = this.perps = []
    for (let i = 0; i < end; i++) {
      const a = pixels[i]
      for (let j = i + 1; j < length; j++) {
        const b = pixels[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const tx = a.x + b.x
        const ty = a.y + b.y
        const x1 = (tx - dy) / 2
        const y1 = (ty + dx) / 2
        const x2 = (tx + dy) / 2
        const y2 = (ty - dx) / 2
        let slope = -dx / dy
        if (!isFinite(slope)) slope = true
        const intercept = slope === true ? x1 : y1 - slope * x1
        const fit = a.fit + b.fit
        const perp = { fit, x1, y1, x2, y2, slope, intercept }
        perps.push(perp)
      }
    }
    let xSum = 0
    let ySum = 0
    let n = 0
    for (let i = 0, l = perps.length; i < l - 1; i++) {
      const { slope: a, intercept: c } = perps[i]
      for (let j = i + 1; j < l; j++) {
        const { slope: b, intercept: d } = perps[j]
        if (a === b) continue
        const x = a === true ? c : b === true ? d : (d - c) / (a - b)
        const y = b === true ? a * x + c : b * x + d
        if (isNaN(x) || isNaN(y)) continue
        xSum += x
        ySum += y
        n++
      }
    }
    const circle = { x: xSum / n, y: ySum / n }
    let rSum = 0
    for (let i = 0; i < length; i++) {
      rSum += outer[i].distanceTo(circle)
    }
    circle.radius = rSum / length
    circle.method = 'chords'
    this.chordCircle = circle
    this.evaluateCircle(circle)
  }

  findGravityCircle (time) {
    const { outer, x, y, radius } = this
    const rr = radius * radius
    let xSum = 0
    let ySum = 0
    let rSum = 0
    let fSum = 0
    for (let i = 0, l = outer.length; i < l; i++) {
      const pixel = outer[i]
      const dx = pixel.x - x
      const dy = pixel.y - y
      const dd = dx * dx + dy * dy
      const d = Math.sqrt(dd)
      const f = 1 / (Math.abs(rr - dd) + 0.01)
      const a = (d - radius) / radius
      xSum += (x + a * dx) * f
      ySum += (y + a * dy) * f
      rSum += d * f
      fSum += f
    }
    const circle = {
      x: xSum / fSum,
      y: ySum / fSum,
      radius: rSum / fSum,
      method: 'gravity',
      methodTry: time
    }
    this.evaluateCircle(circle)
  }

  findArcCircle () {
    const pixels = this.outer
    let length = pixels.length
    const perps = this.perps = new Array(length)
    let p1 = pixels[length - 1]
    for (let i = 0; i < length; i++) {
      const p2 = pixels[i]
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const tx = p1.x + p2.x
      const ty = p1.y + p2.y
      const x = (tx - dy) / 2
      const y = (ty + dx) / 2
      let slope = -dx / dy
      if (!isFinite(slope)) slope = true
      const intercept = (slope === true ? x : y - slope * x)
      perps[i] = { slope, intercept, end: p2 }
      p1 = p2
    }
    const intersections = this.intersections = []
    let { slope: a, intercept: c, end: vertex } = perps[length - 1]
    for (let i = 0; i < length; i++) {
      const { slope: b, intercept: d, end } = perps[i]
      if (a !== b) {
        const x = a === true ? c : b === true ? d : (d - c) / (a - b)
        const y = b === true ? a * x + c : b * x + d
        intersections.push({ x, y, vertex })
      }
      a = b
      c = d
      vertex = end
    }
    length = intersections.length
    const dd = new Array(length)
    let ddSum = 0
    let last = intersections[length - 1]
    for (let i = 0; i < length; i++) {
      const intersection = intersections[i]
      dd[i] = distanceSquared(intersection, last)
      ddSum += dd[i]
      last = intersection
    }
    const ddMean = ddSum / length
    let arc = [intersections[length - 1].vertex]
    const arcs = this.arcs = [arc]
    for (let i = 0; i < length; i++) {
      const pixel = intersections[i].vertex
      if (dd[i] < ddMean) {
        arc.push(pixel)
      } else {
        arcs.push(arc = [pixel])
      }
    }
    arcs.sort((a, b) => b.length - a.length)
  }

  evaluateCircle (circle) {
    if (!this.constructing) {
      return
    }
    const radius = circle.radius
    const rr = radius * radius
    const pixels = circle.outer || this.outer
    const length = pixels.length
    let circularity = 0
    for (let i = 0; i < length; i++) {
      const pixel = pixels[i]
      const dd = distanceSquared(pixel, circle)
      const fit = 1 / (Math.abs(1 - dd / rr) + 0.01)
      circularity += (pixel.fit = fit)
    }
    circularity /= length
    if (circularity > this.circularity) {
      this.x = circle.x
      this.y = circle.y
      this.radius = radius
      this.circularity = circularity
      this.method = circle.method
      this.methodTry = circle.methodTry
    }
  }

  distanceTo (o) {
    const dx = o.x - this.x
    const dy = o.y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  get fitness () {
    return this.circularity * this.colorScore * Math.sqrt(this.radius)
  }
}

function distanceSquared (a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export default Path
