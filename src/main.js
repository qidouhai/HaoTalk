// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './vuex/index'
import VueLazyload from 'vue-lazyload'

// 引入muse-ui
import MuseUi from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import './assets/material-icons.css'

// 引入progress
import NProgress from 'muse-ui-progress'
import 'muse-ui-progress/dist/muse-ui-progress.css'
// 引入loading
import Loading from 'muse-ui-loading'
import 'muse-ui-loading/dist/muse-ui-loading.css'
// 引入message
import Message from 'muse-ui-message'
import 'muse-ui-message/dist/muse-ui-message.css'
// 引入toast
import Toast from 'muse-ui-toast'

Vue.use(MuseUi)
Vue.use(Loading)
Vue.use(Message)
Vue.use(NProgress)
Vue.use(Toast)
Vue.use(VueLazyload, {
  preload: 1.3,
  error: 'static/images/lazy.jpg',
  loading: 'static/images/lazy.jpg',
  attempt: 1,
  listenEvents: ['scroll']
})
Vue.config.productionTip = false
router.replace('/message')
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
