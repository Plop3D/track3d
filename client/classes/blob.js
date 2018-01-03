import Chain from './chain'

class Blob {
  constructor (target) {
    this.target = target
    this.chains = []
    this.score = 0
    this.y1 = Infinity
    this.y2 = 0
  }

  static search (cam, x1, y1, x2, y2) {
    cam.tracker.targets.forEach(target => Blob.searchTarget(target, cam, x1, y1, x2, y2))
  }

  static searchTarget (target, cam, x1, y1, x2, y2) {
    const blobs = []
    const width = cam.width
    const pixels = cam.pixels
    let ups = []
    let chains
    let chain = null
    let score = 0
    function add () {
      chains.push(chain)
      ups.forEach(up => {
        if ((up.x1 >= chain.x1 && up.x1 <= chain.x2) ||
            (up.x2 >= chain.x1 && up.x2 <= chain.x2) ||
            (up.x1 < chain.x1 && up.x2 > chain.x2)) {
          if (chain.blob) {
            if (up.blob !== chain.blob) {
              chain.blob.addBlob(up.blob)
            }
          } else {
            up.blob.addChain(chain, score)
          }
        }
      })
      if (!chain.blob) {
        const blob = new Blob(target)
        blob.addChain(chain, score)
        blobs.push(blob)
      }
      chain = null
      score = 0
    }
    for (let y = y1; y <= y2; y++) {
      chains = []
      for (let x = x1; x <= x2; x++) {
        const i = y * width + x
        const pixel = pixels[i]
        const pixelScore = target.score(pixel)
        if (pixelScore) {
          if (chain) {
            chain.x2 = x
            score += pixelScore
          } else {
            chain = new Chain(x, y)
          }
        } else if (chain) {
          add()
        }
      }
      if (chain) {
        add()
      }
      ups = chains
    }
    blobs.sort((a, b) => b.fitness - a.fitness)
    blobs.length = Math.min(blobs.length, target.limit)
    blobs.forEach(blob => {
      blob.findCircle()
    })
    target.blobs = blobs
  }

  addChain (chain, score) {
    this.chains.push(chain)
    this.score += score
    chain.blob = this
    if (chain.y < this.y1) this.y1 = chain.y
    if (chain.y > this.y1) this.y2 = chain.y
  }

  addBlob (blob) {
    blob.chains.forEach(chain => this.addChain(chain))
    blob.score = 0
  }

  findCircle () {
    let xSum = 0
    let ySum = 0
    let area = 0
    this.chains.forEach(chain => {
      const length = chain.x2 - chain.x1 + 1
      xSum += (chain.x1 + chain.x2) * length / 2
      ySum += chain.y * length
      area += length
    })
    this.x = xSum / area
    this.y = ySum / area
    this.area = area
    this.radius = Math.sqrt(area / Math.PI)
    this.fitness = this.score
  }
}

Blob.MIN_SCORE = 1000

export default Blob
