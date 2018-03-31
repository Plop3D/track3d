/* global it */
import cam from './helpers/cam.mock'
const bench = global.bench || (() => {})
const paths = cam.paths

bench('centering', function () {
  it('centroid', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
      paths[i].findCentroidCircle()
    }
  })
  it('outer', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
      paths[i].findOuterCircle()
    }
  })
  it('chord', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
      paths[i].findChordCircle()
    }
  })
  it('arc', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
      paths[i].findArcCircle()
    }
  })
  it('gravity', function () {
    for (let i = 0, l = paths.length; i < l; i++) {
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
      paths[i].findGravityCircle()
    }
  })
})
