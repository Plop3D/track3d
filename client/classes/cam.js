/* global ImageData */
import Pixel from './pixel'
import Path from './path'

const DRAW_TIMEOUT = 0
const ASPECT_RATIO = 0.75
const MIN_FITNESS = 100

class Cam {
  constructor (tracker, scale) {
    this.tracker = tracker
    this.scale = scale || 1
    this.sat = 0
    this.frame = -1
    const container = tracker.container
    const width = this.width = Math.round(container.clientWidth * this.scale)
    const height = this.height = Math.round(width * ASPECT_RATIO)
    const video = this.video = this.tag('video')
    const canvas = this.canvas = this.tag('canvas')
    const area = this.area = width * height
    const pixels = this.pixels = new Array(area)
    for (let i = 0; i < area; i++) {
      const x = i % width
      const y = Math.floor(i / width)
      pixels[i] = new Pixel(this, i, x, y)
    }
    for (let y = 0, n = -1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = pixels[++n]
        pixel.adjacent = [
          x < width - 1 ? pixels[n + 1] : 0,
          y < height - 1 ? pixels[n + width] : 0,
          x > 0 ? pixels[n - 1] : 0,
          y > 0 ? pixels[n - width] : 0
        ]
      }
    }

    this.context = canvas.getContext('2d')
    this.search = -1

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        // Find a camera.
        devices.forEach(device => {
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

  tag (tagName) {
    const element = document.createElement(tagName)
    const width = this.width
    const height = this.height
    const style = element.style
    style.left = 0
    style.top = 0
    style.width = `${width}px`
    style.height = `${height}px`
    element.width = width
    element.height = height
    style.position = 'absolute'
    this.tracker.container.appendChild(element)
    return element
  }

  // Copy video contents to canvas, and update using the RGBA data array.
  draw () {
    try {
      const { context, width, height } = this
      context.drawImage(this.video, 0, 0, width, height)
      this.update()
    } catch (err) {
      console.error(err)
    }
    if (this.tracker.active) {
      window.requestAnimationFrame(() => {
        setTimeout(() => this.draw(), DRAW_TIMEOUT)
      })
    }
  }

  update () {
    this.frame++
    if (this.scale === 1) {
      this.drawMain()
    } else {
      this.updateData(0, 0, this.width - 1, this.height - 1)
    }
  }

  updateData (x1, y1, x2, y2) {
    const width = x2 - x1 + 1
    const height = y2 - y1 + 1
    const data = this.context.getImageData(x1, y1, width, height).data
    this.updatePixels(data, x1, y1, x2, y2)
    Path.search(this, x1, y1, x2, y2)
  }

  updatePixels (data, x1, y1, x2, y2) {
    const width = this.width
    const pixels = this.pixels
    let n = 0
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const i = y * width + x
        const pixel = pixels[i]
        let r = data[n]
        let g = data[n + 1]
        let b = data[n + 2]
        let min = r < g ? r : g
        min = min < b ? min : b
        let max = r > g ? r : g
        max = max > b ? max : b
        const sat = pixel.sat = max - min
        pixel.hue = sat < 1 ? 0
          : max === r ? (g - b) / sat + (g < b ? 6 : 0)
          : max === g ? (b - r) / sat + 2
          : (r - g) / sat + 4
        pixel.r = r
        pixel.g = g
        pixel.b = b
        n += 4
      }
    }
  }

  drawMain () {
    const size = Math.round(1 / this.tracker.miniCam.scale)
    const offset = size / 2
    const context = this.context
    this.tracker.targets.forEach(target => {
      target.paths.forEach((path, index) => {
        path.pixels.forEach(pixel => {
          context.fillStyle = `rgb(${target.r},${target.g},${target.b})`
          context.fillRect(pixel.x * size, pixel.y * size, size, size)
        })
        if (path.perps) {
          path.perps.forEach(perp => {
            context.strokeStyle = '#fff'
            context.lineWidth = 0.8
            context.beginPath()
            context.moveTo(perp.x1 * size + offset, perp.y1 * size + offset)
            context.lineTo(perp.x2 * size + offset, perp.y2 * size + offset)
            context.stroke()
          })
        }
        if (path.intersections) {
          path.intersections.forEach(intersection => {
            if (intersection) {
              context.fillStyle = '#f00'
              context.fillRect(intersection.x * size - offset, intersection.y * size - offset, size + offset * 2, size + offset * 2)
            }
          })
        }
        const colors = [ '#3f9', '#f0f' ]
        if (path.arcs) {
          const a = []
          path.arcs.forEach((arc, i) => {
            context.strokeStyle = colors[i % 2]
            context.lineWidth = 5
            context.beginPath()
            let n = 0
            arc.forEach((point, j) => {
              context[j ? 'lineTo' : 'moveTo'](point.x * size + offset, point.y * size + offset)
              n++
            })
            context.stroke()
            a[i] = n
          })
        }
        if (index < target.limit && path.fitness > MIN_FITNESS) {
          path.outer.forEach(pixel => {
            context.fillStyle = '#fff'
            context.fillRect(pixel.x * size, pixel.y * size, size, size)
          })
          path.pairs.forEach(pair => {
            context.strokeStyle = '#000'
            context.lineWidth = 2
            context.beginPath()
            context.moveTo(pair.a.x * size + offset, pair.a.y * size + offset)
            context.lineTo(pair.b.x * size + offset, pair.b.y * size + offset)
            context.stroke()
          })
          context.strokeStyle = '#fff'
          context.lineWidth = 2
          context.beginPath()
          context.arc(path.x * size + offset, path.y * size + offset, path.radius * size + offset + size, 0, 2 * Math.PI)
          context.stroke()
        }
      })
    })
  }

  // TODO: Make this work on an area.
  updateEdges () {
    const data = this.context.getImageData(0, 0, this.width, this.height).data
    const length = data.length
    const pixels = this.pixels
    const width = this.width
    const area = this.area
    this.clearData()
    for (let i = 0; i < length; i++) {
      pixels[i / 4].setRgb(data[i++], data[i++], data[i++])
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
      const v = Math.floor(Math.min(pixel.setRgb(r, g, b) / 2, 255))
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
}

export default Cam
