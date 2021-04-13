<template>
  <div id="app">
    <div class="container-top">
      <div class="drawer" @click="showSidebar()"></div>
      <top-nav></top-nav>
    </div>
    <div class="container-content">
      <div class="patch"></div>
      <keep-alive>
      <router-view></router-view>
      </keep-alive>
      <div class="patch"></div>
    </div>
    <div class="container-bottom">
      <bottom-tab class="tab"></bottom-tab>
    </div>
    <my-sidebar style="z-index:101;"></my-sidebar>
    <my-search v-if="search"></my-search>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import bottomTab from './components/bottomtab/bottom-tab'
import topNav from './components/topnav/top-nav'
import mySidebar from './components/sidebar/sidebar'
import myPersonindex from './components/personindex/personindex'
import mySearch from './components/search/search'
export default {
  name: 'App',
  components: {
    bottomTab,
    topNav,
    mySidebar,
    myPersonindex,
    mySearch
  },
  computed: {
    ...mapState(['personindex', 'search'])
  },
  methods: {
    showSidebar (flag) {
      this.$store.commit('showSidebar', {flag})
    }
  }
}
</script>

<style lang='stylus'>
@import './common/stylus/base.styl'
#app
  position relative
  min-height 100vh
  width 100%
  background color-g
  .color-b
    color: color-b
  .container-top
    position fixed
    z-index 101
    top 0
    left 0
    width 100%
    height 10%
    .drawer
      position fixed
      z-index 1
      top 0
      left 0
      width 6vh
      height 100%
  .container-bottom
    position fixed
    z-index 1
    bottom 0
    left 0
    width 100%
    height 10%
  .container-content
    width 100%
    .patch
      position relative
      top 0
      left 0
      width 100%
      height 10.2vh
    .t-1
      color color-b
    .mu-tab-text.has-icon
      margin-top: -4px
    .i-1
      font-size: 2.5em
      color: #64dd17
    .i-2
      font-size: 2.5em
      color: #f44336
    .i-3
      font-size: 2.5em
      color: #00bfa5
    .ii-1
      font-size: 2.5em
      color: #ffd600
    .ii-2
      font-size: 2.5em
      color: #ec407a
    .ii-3
      font-size: 2.5em
      color: #2962ff

</style>
