<template>
  <div class="index">
    <div class="top" :style="{backgroundImage: `url(${userData.avatar})`}">
      <mu-appbar :zDepth="0">
        <mu-icon-button icon="arrow_back"
                        slot="left"
                        @click="showPersonindex_x" style="background:white;"/>
        <div class="right-top"
             slot="right">
          <mu-icon-button icon="more_vert" style="background:white;"/>
        </div>
      </mu-appbar>
      <div class="c">
        <mu-avatar :src="userData.avatar"
                   :size="96" />
        <span class="name">{{userData.username}}</span>
      </div>
      <mu-tabs :value="activeTab"
               @change="handleTabChange">
        <mu-tab value="tab1">个人信息</mu-tab>
        <mu-tab value="tab2">个性标签</mu-tab>
        <mu-tab value="tab3">个人兴趣</mu-tab>
      </mu-tabs>
    </div>
    <div class="content">
      <div v-if="activeTab === 'tab1'">
        <mu-list>
          <mu-list-item :describeText="userData.phone">
            <mu-list-item-action>
              <mu-icon value="voicemail" color="#2e2c6b"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>电话</mu-list-item-title>
          </mu-list-item>
          <mu-list-item :describeText="userData.address">
            <mu-list-item-action>
              <mu-icon value="location_on" color="#2e2c6b"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>地区</mu-list-item-title>
          </mu-list-item>
          <mu-list-item :describeText="userData.birthday">
            <mu-list-item-action>
              <mu-icon value="cake" color="#2e2c6b"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>生日</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </div>
      <div v-if="activeTab === 'tab2'" style="padding-left:30px;">
        <h1>手机控</h1>
        <h1>低调</h1>
        <h1>真率</h1>
      </div>
      <div v-if="activeTab === 'tab3'" style="padding-left:30px;">
        <h1>听歌</h1>
        <h1>跑步</h1>
        <h1>学习</h1>
      </div>
    </div>
    <mu-tabs class="bottom" >
      <mu-tab value="tab1"
              icon="videocam" />
      <mu-tab value="tab2"
              icon="phone" color="#f00"/>
      <mu-tab value="tab3"
              icon="chat_bubble"
              @click="showDialog_x" />
    </mu-tabs>
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'personindex',
  data () {
    return {
      activeTab: 'tab1'
    }
  },
  computed: {
    ...mapState(['activeId', 'data']),
    ...mapGetters(['friend'],
      {userData: 'nowUserData'})
  },
  methods: {
    ...mapMutations(['getActiveId', 'showPersonindex', 'showDialog']),
    handleTabChange (val) {
      this.activeTab = val
    },
    showPersonindex_x () {
      this.getActiveId({ activeId: 0 })
      this.showPersonindex()
    },
    showDialog_x () {
      // 判定打开的是不是自己的主页，如果是则无法点击对话
      if (this.activeId !== 0) {
        this.showDialog()
        this.showPersonindex()
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.icons
  color:#f00
.index
  position: absolute
  z-index: 102
  top: 0
  left: 0
  width: 100%
  height: 100vh
  background: color-g
  .top
    position: relative
    height: 38vh
    // background-image: url('./avatar.jpg')
    background-size: cover
    .c
      position: absolute
      z-index: 1
      width: 100%
      text-align: center
      .name
        display: block
        margin-top: 4px
        font-size: 1.6em
        color: #fff
    &:after
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background: rgba(0,0,88,.5)
      content: ''
    .mu-appbar
      position: relative
      z-index:1
      background:rgba(0,0,0,0)
    .mu-tabs
      position: absolute
      bottom: 0
      left: 0
      z-index: 1
      background:rgba(0,0,0,0)
  .content
    .item
      margin-top: 6px
      margin-left: 20px
  .bottom
    position: absolute
    left: 0
    bottom: 0
    background: color-w
</style>
