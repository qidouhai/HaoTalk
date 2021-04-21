<template>
  <div class="top-wrap">
    <mu-appbar class="top-nav" :zDepth="0">
      <mu-avatar slot="left" :size="30" @click="showSidebar_x(true)" style="width: 50px;height: 50px;">
        <img :src="userdata.avatar"/>
      </mu-avatar>
      <div slot="default" class="title">
        <div class="title-item">{{headerTitle}}</div>
      </div>
      <mu-menu slot = "right" :open.sync="open">
        <mu-button fab small color="primary">
          <mu-icon value="add"></mu-icon>
        </mu-button>
        <mu-list slot="content">
          <mu-list-item button @click="showSearch(true)">
            <mu-icon value="add_comment"></mu-icon>
            <mu-list-item-title>创建群聊</mu-list-item-title>
          </mu-list-item>
          <mu-list-item button @click="showSearch()">
            <mu-icon value="person_add"></mu-icon>
            <mu-list-item-title>添加好友/群</mu-list-item-title>
          </mu-list-item>
          <mu-list-item button @click="showSearch()">
            <mu-icon value="search"></mu-icon>
            <mu-list-item-title>搜索</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </mu-menu>
    </mu-appbar>
  </div>
</template>
<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
export default {
  name: 'topNav',
  data () {
    return {
      open: false
    }
  },
  computed: {
    ...mapState({
      headerTitle: 'headerTitle'
    }),
    ...mapGetters({
      userdata: 'nowUserData'
    })
  },
  methods: {
    ...mapMutations(['showSidebar']),
    showSidebar_x (flag) {
      this.showSidebar({ flag })
    },
    showSearch (flag = false) {
      this.$router.push({name: 'search', params: {createroom: flag}})
      this.open = false
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.mu-appbar
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: color-w
    .mu-avatar
      margin-left:12px
    .title
      padding-right: 12px
      .title-item
        margin: 0 auto
        width: 48%
        height: 34px
        line-height: 30px
        text-align: center
        border: 1px solid color-b
        border-radius: 4px
        font-weight: 500
        background: color-b
        color: color-w
    .mu-menu
      height:auto
      margin-right : 10px
</style>
