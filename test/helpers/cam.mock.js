/* global HTMLCanvasElement */
import data from '../small'
import Cam from '../../client/classes/cam'
import Path from '../../client/classes/path'
import Blob from '../../client/classes/blob'
import Target from '../../client/classes/target'
import dom from 'jsdom-global'

dom()

navigator.mediaDevices = {
  enumerateDevices () {
    return {
      then (fn) {}
    }
  }
}

HTMLCanvasElement.prototype.getContext = () => {
  return {
    getImageData () {
      return { data }
    }
  }
}

const tracker = {
  container: {
    clientWidth: 480,
    appendChild () {
    }
  }
}

const targets = tracker.targets = [
  new Target(tracker, { hex: '#096', hueTolerance: 40, minSat: 15, name: 'green', limit: 2 }),
  new Target(tracker, { hex: '#14d', hueTolerance: 40, minSat: 20, name: 'blue', limit: 2 }),
  new Target(tracker, { hex: '#ff2', hueTolerance: 40, minSat: 25, name: 'yellow', limit: 2 })
]

const cam = new Cam(tracker, 0.2)
cam.updatePixels(data, 0, 0, 95, 71)
cam.paths = []
cam.blobs = []
Path.search(cam, 0, 0, 95, 71)
Blob.search(cam, 0, 0, 95, 71)
targets.forEach(target => {
  target.paths.forEach(path => cam.paths.push(path))
  target.blobs.forEach(blob => cam.blobs.push(blob))
})

export default cam
