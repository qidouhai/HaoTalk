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
        <mu-list-item-content>
            <mu-list-item-title>print.pdf</mu-list-item-title>
        </mu-list-item-content>
        <div class="item-right">
          <span class="time">2019.10.1</span>
        </div>
      </mu-list-item>
      </mu-list>
    </div>
    <mu-tabs :value.sync="active" inverse color="secondary" text-color="rgba(0, 0, 0, .54)"  full-width class="sticky">
      <mu-tab>好友</mu-tab>
      <mu-tab>分组</mu-tab>
      <mu-tab>群聊</mu-tab>
    </mu-tabs>
    <div class="title-3">
      <div class="demo-text" v-if="active === 0">
        <mu-list>
          <!--动态渲染-->
          <div v-for="(item,index) in friends" class="item" :key="index">
            <mu-list-item avatar button @click="showPersonindex(item.friendid)"
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
      <div class="demo-text" v-if="active === 1">
          <mu-expansion-panel class="expansion">
            <div slot="header">朋友</div>
          <mu-list>
          <div v-for="(item,index) in friends" class="item" :key="index">
            <mu-list-item avatar button @click="showPersonindex(item.friendid)"
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
          </mu-expansion-panel>
          <mu-expansion-panel class="expansion">
            <div slot="header">家人</div>
          </mu-expansion-panel>
          <mu-expansion-panel class="expansion">
            <div slot="header">同学</div>
          </mu-expansion-panel>
      </div>
      <div class="demo-text" v-if="active === 2">
        <mu-list>
          <!--动态渲染-->
          <div v-for="(item,index) in groups" class="item" :key="index">
            <mu-list-item avatar button @click="showGroupindex(item.roomid)"
                          :ripple="true">
              <mu-list-item-action>
                <mu-avatar>
                  <img :src="item.avatar">
                </mu-avatar>
              </mu-list-item-action>
              <mu-list-item-title>{{item.roomname}}</mu-list-item-title>
              <mu-list-item-action>
                <mu-icon value="chat_bubble"></mu-icon>
              </mu-list-item-action>
            </mu-list-item>
            <mu-divider inset/>
          </div>
        </mu-list>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'friend',
  data () {
    return {
      active: 0
    }
  },
  computed: {
    // 获取全部好友
    friends () {
      return this.$store.getters.nowFriendList
    },
    groups () {
      return this.$store.getters.nowGroupList
    }
  },
  created () {
    this.$store.dispatch('getFriends')
  },
  methods: {
    // 点击展示个人主页
    showPersonindex (e) {
      this.$store.commit('getActiveId', { activeId: e })
      this.$router.push({path: `/personinfo/${e}`})
    },
    showGroupindex (e) {
      this.$store.commit('getActiveId', { activeId: e })
      this.$router.push({path: `/groupinfo/${e}`})
    }
  }
}
</script>
<style lang="stylus"  scoped>
@import '../../common/stylus/base.styl'
.friend
  overflow-y scroll
  position:relative
  height:80vh
  .item
    background color-w
  .title-1
    position:relative
    height: 8vh
    line-height: 8vh
    text-align:center
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
    line-height: 5vh
  .sticky
    position: sticky
    top 0

</style>
