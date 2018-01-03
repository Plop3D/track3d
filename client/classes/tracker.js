import Target from './target'
import Cam from './cam'

class Tracker {
  constructor (container) {
    this.container = container
    this.targets = []
    this.active = true
    this.rAdjust = 0
    this.gAdjust = 0
    this.bAdjust = 0
    this.search = -1
    this.mainCam = new Cam(this)
    this.miniCam = new Cam(this, 1 / 5)
  }

  target (options) {
    const target = new Target(this, options)
    this.targets.push(target)
    return this
  }

  stop () {
    this.active = false
  }

  static track (selector) {
    const element = document.querySelector(selector)
    const tracker = new Tracker(element)
    return tracker
  }
}

export default Tracker
