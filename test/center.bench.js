/* global it */
import cam from './helpers/cam.mock'
const bench = global.bench || (() => {})
const paths = cam.paths

bench('centering', function () {
  it('centroid', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findCentroidCircle()
    }
  })
  it('pairs', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findPairsCircle()
    }
  })
  it('culled pairs', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findCulledPairsCircle()
    }
  })
})
