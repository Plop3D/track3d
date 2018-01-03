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
          .target({ hex: '#096', hueTolerance: 40, minSat: 15, name: 'green', limit: 2 })
          .target({ hex: '#14d', hueTolerance: 40, minSat: 20, name: 'blue', limit: 2 })
          .target({ hex: '#ff2', hueTolerance: 40, minSat: 25, name: 'yellow', limit: 2 })
    }
  }
</script>

<style>
  html, body {
    margin: 0;
  }
</style>
