<template>
  <div id="app">
    <div class="container-top">
      <div class="drawer" @click="showSidebar()"></div>
      <top-nav></top-nav>
    </div>
    <div class="container-content">
      <div class="patch"></div>
      <!-- <transition :name="transitionName"> -->
      <keep-alive>
      <router-view></router-view>
      </keep-alive>
      <!-- </transition> -->
      <div class="patch"></div>
    </div>
    <div class="container-bottom">
      <bottom-tab class="tab"></bottom-tab>
    </div>
    <my-sidebar style="z-index:101;"></my-sidebar>
  </div>
</template>

<script>
import bottomTab from './components/bottomtab/bottom-tab'
import topNav from './components/topnav/top-nav'
import mySidebar from './components/sidebar/sidebar'
export default {
  name: 'App',
  data () {
    return {
      transitionName: ''
    }
  },
  components: {
    bottomTab,
    topNav,
    mySidebar
  },
  methods: {
    showSidebar (flag) {
      this.$store.commit('showSidebar', {flag})
    }
  },
  watch: {
    /* $route (to, from) {
      // 将不想有过渡动画效果的部分路由写进判断条件中
      if (!(to.name in ['message', 'friends', 'discover']) && !(from.name in ['message', 'friends', 'discover'])) {
        // 如果to索引大于from索引,判断为前进状态,反之则为后退状态
        if (to.meta.index < from.meta.index) {
        // 设置动画名称
          this.transitionName = 'slide-left'
        } else if (to.meta.index > from.meta.index) {
          this.transitionName = 'slide-right'
        } else if (to.meta.index == 99) {
          this.transitionName = ''
        }
      } else {
        this.transitionName = ''
      }
    } */
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
      height 10vh
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
