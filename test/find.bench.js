/* global it */
import cam from './helpers/cam.mock'
const bench = global.bench || (() => {})

bench('finding', function () {
  it('paths', function () {
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
    cam.findPaths()
  })
  it('blobs', function () {
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
    cam.findBlobs(0, 0, 95, 71)
  })
})
