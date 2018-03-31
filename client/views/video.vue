<template>
  <div class="track3d" style="width:480px"></div>
</template>

<script>
  import Tracker from '../classes/tracker'

  export default {
    mounted () {
      console.clear()
      if (window.tracker) {
        window.tracker.stop()
      }
      window.tracker =
        Tracker.track('.track3d')
          .target({ hex: '#185', hueTolerance: 25, minSat: 25, name: 'green', limit: 2 })
          .target({ hex: '#14d', hueTolerance: 25, minSat: 35, name: 'blue', limit: 2 })
          .target({ hex: '#ff2', hueTolerance: 25, minSat: 40, name: 'yellow', limit: 2 })
    }
  }
</script>

<style>
  html, body {
    margin: 0;
  }
</style>
