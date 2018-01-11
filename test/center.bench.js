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
  it('outer', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findOuterCircle()
    }
  })
  it('chord', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findChordCircle()
    }
  })
})
