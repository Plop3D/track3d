/* global it */
import cam from './helpers/cam.mock'
import Blob from '../client/classes/blob'
import Path from '../client/classes/path'
const bench = global.bench || (() => {})

bench('finding', function () {
  it('paths', function () {
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
    Path.search(cam, 0, 0, 95, 71)
  })
  it('blobs', function () {
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
    Blob.search(cam, 0, 0, 95, 71)
  })
})
