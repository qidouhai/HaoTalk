<template>
  <div class="search">
    <mu-appbar :zDepth="0">
      <mu-button icon slot="left" @click="back">
        <mu-icon value="arrow_back"></mu-icon>
      </mu-button>
      <mu-text-field class="appbar-search-field"
                     slot="default"
                     v-model="value"
                     @input="input" />
      <mu-button icon slot="right" @click="search">
        <mu-icon value="search"></mu-icon>
      </mu-button>
    </mu-appbar>
    <mu-sub-header>输入账号，群号码,消息</mu-sub-header>
    <mu-list>
      <mu-sub-header v-if="oldfriend.length">好友/群</mu-sub-header>
      <div v-for="(item,index) in oldfriend" :key="index">
        <mu-list-item @click="showMainindex(item)">
          <mu-checkbox v-if="createroom" v-model="checkvals"/>
          <mu-list-item-action>
            <mu-avatar>
              <img :src="item.avatar">
            </mu-avatar>
          </mu-list-item-action>
          <mu-list-item-title>{{item.username}}</mu-list-item-title>
          <mu-list-item-action>
            <mu-icon value="chat_bubble"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
      </div>
    </mu-list>

    <mu-list v-if="!createroom">
      <mu-sub-header v-if="stranger.length">陌生人/群</mu-sub-header>
      <div v-for="(item,index) in stranger" :key="index">
        <mu-list-item @click="showMainindex(item)">
          <mu-list-item-title>{{item.name}}</mu-list-item-title>
          <mu-list-item-action>
            <mu-avatar>
              <img :src="item.avatar">
            </mu-avatar>
          </mu-list-item-action>
          <mu-list-item-action>
            <mu-icon value="chat_bubble"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
      </div>
    </mu-list>

    <mu-list v-else>
      <mu-expansion-panel>
        <div slot="header">朋友</div>
        <mu-list>
          <div v-for="(item,index) in friends" :key="index">
          <mu-list-item @click="showMainindex(item)">
          <mu-checkbox v-model="checkvals"/>
          <mu-list-item-action>
            <mu-avatar>
              <img :src="item.avatar">
            </mu-avatar>
          </mu-list-item-action>
          <mu-list-item-title>{{item.username}}</mu-list-item-title>
          <mu-list-item-action>
            <mu-icon value="chat_bubble"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
          </div>
        </mu-list>
      </mu-expansion-panel>
      <mu-expansion-panel>
        <div slot="header">家人</div>
      </mu-expansion-panel>
      <mu-expansion-panel>
        <div slot="header">同学</div>
      </mu-expansion-panel>
    </mu-list>
    <mu-button v-if="createroom" full-width color="primary" @click="buildroom" class="create-button">创建群聊</mu-button>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'search',
  data () {
    return {
      value: '',
      stranger: [],
      oldfriend: [],
      checkvals: []
    }
  },
  computed: {
    ...mapState({
      friends: state => state.friendList
    }),
    createroom () {
      return this.$route.params.createroom
    }
  },
  methods: {
    ...mapMutations(['getActiveId']),
    // 点击展示个人主页
    showMainindex (item) {
      if (item.friendid) {
        this.$router.push({path: `/personinfo/${item.friendid}`})
      } else {
        this.$router.push({path: `/groupinfo/${item.groupid}`})
      }
    },
    input (val) {
      // 判断输入的值是否是数字
      if (val === '') {
        this.oldfriend = []
      } else if (isNaN(val)) {
        // 不是数字
        this.oldfriend = this.friends.filter(x => {
          if (x.username.indexOf(val) !== -1 || x.littlename.indexOf(val) !== -1) {
            return true
          } else {
            return false
          }
        })
      } else {
        // 是数字
        this.oldfriend = this.friends.filter(x => {
          if (x.friendid.indexOf(val) !== -1) {
            return true
          } else {
            return false
          }
        })
      }
    },
    back () {
      this.$router.go(-1)
    },
    search () {
      if (this.$route.params.createroom) {}
    },
    buildroom () {

    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.search
  position: absolute
  z-index: 102
  top: 0
  left: 0
  width: 100%
  height: 100vh
  background: color-g
  .mu-appbar
    height: 10vh
    color: #000
    background: color-w
  .create-button
    position fixed
    bottom 3vh
</style>
