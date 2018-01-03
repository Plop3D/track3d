import Vue from 'vue'
import Router from 'vue-router'
import App from './views/app'
import Home from './views/home'
import Video from './views/video'
import client from 'socket.io-client'

window.io = client('//' + window.location.host)

Vue.use(Router)

const app = new Vue({
  el: '#app',
  render: h => h(App),
  router: new Router({
    mode: 'history',
    routes: [{
      path: '/',
      component: Home
    }, {
      path: '/video',
      component: Video
    }]
  })
})

export default app
