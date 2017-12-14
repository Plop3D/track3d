<template>
  <div class="video">
    <video/>
    <canvas/>
  </div>
</template>

<script>
  import Tracker from '../app/tracker'

  export default {
    mounted () {
      console.clear()
      if (window.tracker) {
        window.tracker.stop()
      }
      window.tracker =
        Tracker.track('.video')
          .target({ hex: '#1a5', tolerance: 1, name: 'green' })
          .target({ hex: '#14d', tolerance: 1, name: 'blue' })
          .target({ hex: '#dd1', tolerance: 1, name: 'yellow' })
          // .target({ hex: '#d13', tolerance: 1, name: 'red' })
    }
  }
</script>

<style>
  video, canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 240px;
    height: 180px;
    border: 0;
    margin: 0;
  }
</style>
