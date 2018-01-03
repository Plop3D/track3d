/* global describe it */
import cam from './helpers/cam.mock'
import is from 'exam/lib/is'
const paths = cam.paths

describe('cam', function () {
  it('works', function () {
    is(paths.length, 6)
  })
})
