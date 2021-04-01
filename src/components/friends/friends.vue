<template>
  <div class="friend">
    <div class="title-1">
      <mu-list>
      <mu-list-item>
        <mu-list-item-action>
          <mu-icon value="assignment_ind" color="#64dd17"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>同步电话联系人</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      </mu-list>
    </div>
    <div class="tab">
      <mu-tabs full-width>
        <mu-tab value="tab1" disabled>
          <mu-icon value="person_add" color='green'></mu-icon>
          新朋友
        </mu-tab>
        <mu-tab value="tab2" disabled>
          <mu-icon value="people" color='orange'></mu-icon>
          群组
        </mu-tab>
        <mu-tab value="tab3" disabled>
          <mu-icon value="person" color='orange'></mu-icon>
          可能认识的人
        </mu-tab>
      </mu-tabs>
    </div>
    <div class="title-2">
      <span style="color: rgba(0, 0, 0, .8)">我的设备</span>
    </div>
    <div class="mac">
      <mu-list>
      <mu-list-item>
        <mu-list-item-action>
          <mu-avatar text-color="orange200" color="pink400">
            <mu-icon value="folder"  :size="40" :iconSize="20" ></mu-icon>
          </mu-avatar>
        </mu-list-item-action>
        <span>
          <span style="color: rgba(0, 0, 0, .5)">print.pdf</span>
        </span>
        <div class="item-right">
          <span class="time">2019.10.1</span>
        </div>
      </mu-list-item>
      </mu-list>
    </div>
    <div class="title-3">
      <span style="color: rgba(0, 0, 0, .8)">我的朋友</span>
    </div>
    <mu-list>
      <!--动态渲染-->
      <div v-for="(item,index) in friends" class="item" :key="index">
        <mu-list-item avatar button @click="showPersonindex(item._id)"
                      :ripple="true">
          <mu-list-item-action>
            <mu-avatar>
              <img :src="item.avatar">
            </mu-avatar>
          </mu-list-item-action>
          <mu-list-item-title>{{item.name}}</mu-list-item-title>
          <mu-list-item-action>
            <mu-icon value="chat_bubble"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
        <mu-divider inset/>
      </div>
    </mu-list>
  </div>
</template>
<script>
export default {
  name: 'friend',
  computed: {
    // 获取全部好友
    friends () {
      return this.$store.getters.nowFriendList
    }
  },
  created () {
    console.log('friends新建')
    this.$store.dispatch('getFriends')
  },
  methods: {
    // 点击展示个人主页
    showPersonindex (e) {
      this.$store.commit('getActiveId', { activeId: e })
      this.$store.commit('showPersonindex')
    }
  }
}
</script>
<style lang="stylus"  scoped>
@import '../../common/stylus/base.styl'
.friend
  .item
    background color-w
  .title-1
    position:relative
    height: 8vh
    line-height: 8vh
    text-align:center
    // .mu-icon
    //   position: absolute;
    //   top:50%;
    //   left: 10%;
    //   transform:translate(-50%, -50%);
    //   color: color-b
    .text
      display: inline-block
      vertical-align: top
      font-size: 1.2em
  .tab
    height: 12vh
    overflow:hidden
    background: color-w
    .mu-tabs
      background:color-w
      color:color-b
  .title-2
    padding-left:4vw
    height: 6vh
    line-height: 6vh
  .mac
    position:relative
    height: 10vh
    background: color-w
    .item-right
      float: right
  .title-3
    padding-left:4vw
    height: 4vh
    line-height: 5vh
</style>
