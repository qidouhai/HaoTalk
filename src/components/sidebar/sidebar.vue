<template>
  <mu-container>
  <mu-drawer :open="sidebar"
             :docked="false"
             @close="showSidebar()">
    <div class="content">
      <div class="top">
        <mu-avatar :size="96" @click="showPersonindex_x" >
          <img :src="userdata.avatar" alt="">
        </mu-avatar>
        <span class="name">{{userdata.username}}</span>
      </div>
      <div class="bottom">
        <span>{{userdata.motto}}</span>
      </div>
    </div>
    <mu-list>
    <mu-list-item>
      <mu-list-item-action>
          <mu-icon value="inbox" color="#2e2c6b"></mu-icon>
      </mu-list-item-action>
      <mu-list-item-title>影集</mu-list-item-title>
    </mu-list-item>
    <mu-list-item>
      <mu-list-item-action>
        <mu-icon value="grade" color="#2e2c6b"></mu-icon>
      </mu-list-item-action>
      <mu-list-item-title>收藏夹</mu-list-item-title>
    </mu-list-item>
    <mu-list-item>
      <mu-list-item-action>
        <mu-icon value="send" color="#2e2c6b"></mu-icon>
      </mu-list-item-action>
      <mu-list-item-title>钱包</mu-list-item-title>
    </mu-list-item>
    <mu-list-item>
      <mu-list-item-action>
        <mu-icon value="drafts" color="#2e2c6b"></mu-icon>
      </mu-list-item-action>
      <mu-list-item-title>文件</mu-list-item-title>
    </mu-list-item>
    <mu-list-item  @click.native="showSidebar">
      <mu-list-item-action>
        <mu-icon value="close" color="#2e2c6b"></mu-icon>
      </mu-list-item-action>
      <mu-list-item-title>关闭</mu-list-item-title>
    </mu-list-item>
    </mu-list>
  </mu-drawer>
  </mu-container>
</template>
<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
export default {
  name: 'sidebar',
  computed: {
    ...mapState({
      sidebar: 'sidebar'
    }),
    ...mapGetters({
      userdata: 'nowUserData'
    })
  },
  methods: {
    ...mapMutations(['showSidebar', 'showPersonindex']),
    showPersonindex_x () {
      this.showSidebar()
      this.showPersonindex()
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.mu-drawer
  color: color-b
  .content
    position: relative
    height: 30vh
    padding-top: 1px
    margin-bottom: 50px
    .top
      padding: 20px
      .name
        position: absolute
        display: inline-block
        top: 5vh/*偏移*/
        left: 56% /*偏移*/
        font-size: 1.8em
    .bottom
      padding: 20px
      padding-left: 40px
</style>
