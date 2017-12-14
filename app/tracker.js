/* global ImageData */
import _ from 'lodash'
import Pixel from './pixel'
import Color from './color'
import Target from './target'
import Path from './path'

const SQUARE_SIZE = 3
const SQUARE_OFFSET = Math.floor(SQUARE_SIZE / 2)

class Tracker {
  constructor (element) {
    this.element = element
    this.targets = []
    this.active = true
    this.rAdjust = 0
    this.gAdjust = 0
    this.bAdjust = 0
    this.frame = -1
    const video = this.video = element.querySelector('video')
    const canvas = this.canvas = element.querySelector('canvas')
    const width = this.width = canvas.width = video.offsetWidth
    const height = this.height = canvas.height = video.offsetHeight
    const area = this.area = width * height
    const pixels = this.pixels = new Array(area)
    const squares = this.squares = new Array(area / Math.pow(SQUARE_SIZE, 2))
    for (let i = 0; i < area; i++) {
      const x = i % width
      const y = Math.floor(i / width)
      pixels[i] = new Pixel(this, i, x, y)
    }
    for (let y = 0, n = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = pixels[n++]
        pixel.adjacent = [
          x < width - 1 ? pixels[n + 1] : 0,
          y < height - 1 ? pixels[n + width] : 0,
          x > 0 ? pixels[n - 1] : 0,
          y > 0 ? pixels[n - width] : 0
        ]
      }
    }
    for (let y = SQUARE_OFFSET, n = 0; y < height; y += SQUARE_SIZE) {
      for (let x = SQUARE_OFFSET; x < width; x += SQUARE_SIZE) {
        const pixel = pixels[y * width + x]
        squares[n++] = pixel
      }
    }

    this.context = canvas.getContext('2d')

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        // Find the camera that faces outward.
        _.each(devices, device => {
          if (device.kind === 'videoinput') {
            this.deviceId = this.deviceId || device.deviceId
          }
        })
        // Start streaming video.
        navigator.getUserMedia({
          video: { deviceId: this.deviceId },
          audio: false
        }, stream => {
          try {
            video.src = window.URL.createObjectURL(stream)
          } catch (ignore) {
            video.src = stream
          }
          this.draw()
        }, console.error)
      })
  }

  target (options) {
    const target = new Target(this, options)
    this.targets.push(target)
    return this
  }

  // Copy video contents to canvas, and update using the RGBA data array.
  draw () {
    try {
      const context = this.context
      const width = this.width
      const height = this.height
      context.drawImage(this.video, 0, 0, width, height)
      this.frame++
      this.data = context.getImageData(0, 0, width, height).data
      this.update(this.data)
    } catch (err) {
      console.error(err)
    }
    if (this.active) {
      window.requestAnimationFrame(() => {
        setTimeout(() => this.draw(), 100)
      })
    }
  }

  stop () {
    this.active = false
  }

  update () {
    this.updateSquares()
    this.findSpheres()
  }

  /**
   * Find color spheres.
   */
  findSpheres () {
    const targets = this.targets
    const squares = this.squares
    const length = squares.length
    const size = SQUARE_SIZE
    const offset = SQUARE_OFFSET
    targets.forEach(target => { target.paths = [] })
    for (let i = 0; i < length; i++) {
      const pixel = squares[i]
      const candidates = []
      targets.forEach(target => {
        const diff = target.hueDiff(pixel)
        if (diff < target.tolerance) {
          console.log(diff, target.name)
          const path = new Path(this, target, pixel)
          candidates.push({ target, diff })
        }
      })
      candidates.sort((a, b) => b.match - a.match)
      const best = candidates[0]
      if (best) {
        const target = best.target
        this.context.fillStyle = `rgba(${target.r}, ${target.g}, ${target.b}, ${pixel.saturation / 100})`
        this.context.fillRect(pixel.x - offset, pixel.y - offset, size, size)
      }
    }
  }

  /**
   * Iterate over square regions, updating their center pixel.
   */
  updateSquares () {
    const data = this.data
    const squares = this.squares
    const length = squares.length
    // const size = SQUARE_SIZE
    // const offset = SQUARE_OFFSET
    this.clearData()
    let rSum = 0
    let gSum = 0
    let bSum = 0
    for (let i = 0; i < length; i++) {
      const pixel = squares[i]
      const j = pixel.dataIndex
      const r = data[j]
      const g = data[j + 1]
      const b = data[j + 2]
      pixel.update(r, g, b)
      // this.context.fillStyle = `hsl(${pixel.hue}, 100%, 50%)
      // this.context.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
      // this.context.fillRect(pixel.x - offset, pixel.y - offset, size, size)
      rSum += r
      gSum += g
      bSum += b
    }
    Color.base(rSum / length, gSum / length, bSum / length)
  }

  updateEdges (data) {
    const length = data.length
    const pixels = this.pixels
    const width = this.width
    const area = this.area
    this.clearData()
    for (let i = 0; i < length; i++) {
      pixels[i / 4].update(data[i++], data[i++], data[i++])
    }
    for (let i = 0; i < area; i++) {
      const pixel = pixels[i]
      const diff =
        (
          pixel.diff(pixels[i - 1]) +
          pixel.diff(pixels[i + 1]) +
          pixel.diff(pixels[i - width]) +
          pixel.diff(pixels[i + width])
        ) * 2 +
        pixel.diff(pixels[i - 1 - width]) +
        pixel.diff(pixels[i + 1 - width]) +
        pixel.diff(pixels[i - 1 + width]) +
        pixel.diff(pixels[i + 1 + width])
      const v = Math.floor(Math.min(diff / 3, 255))
      const j = i * 4
      data[j] = data[j + 1] = data[j + 2] = v
    }
    this.putData(data)
  }

  updateMovement (data) {
    this.clearData()
    const length = data.length
    for (let i = 0; i < length; i++) {
      const pixel = this.pixels[i / 4]
      const r = data[i++]
      const g = data[i++]
      const b = data[i++]
      const v = Math.floor(Math.min(pixel.update(r, g, b) / 2, 255))
      data[i - 3] = data[i - 2] = data[i - 1] = v
    }
    this.putData(data)
  }

  putData (data) {
    data = new ImageData(data, this.width, this.height)
    this.context.putImageData(data, 0, 0)
  }

  clearData () {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  static track (selector) {
    const element = document.querySelector(selector)
    const tracker = new Tracker(element)
    return tracker
  }
}

export default Tracker
