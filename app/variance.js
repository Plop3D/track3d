class Variance {
  constructor () {
    this.mean = 0
    this.variance = 0
  }

  update (v) {
    const diff = v - this.mean
    this.variance += 0.1 * (diff * diff - this.variance)
    this.mean += 0.1 * diff
    return this.variance
  }
}

export default Variance
