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
    <mu-list v-if="!createroom">
      <mu-sub-header>输入账号，群号码,消息</mu-sub-header>
      <mu-sub-header v-if="stranger.length">陌生人/群</mu-sub-header>
      <div v-for="(item,index) in stranger" :key="index">
        <mu-list-item @click="showPersonindex_x(item._id)">
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
      <mu-sub-header v-if="oldfriend.length">好友/群</mu-sub-header>
      <div v-for="(item,index) in oldfriend" :key="index">
        <mu-list-item @click="showPersonindex_x(item._id)">
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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
      </mu-expansion-panel>
      <mu-expansion-panel>
        <div slot="header">家人</div>
        <mu-checkbox v-model="checkvals"/>
        <span> Lorem </span>
      </mu-expansion-panel>
      <mu-expansion-panel>
        <div slot="header">同学</div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
      </mu-expansion-panel>
    </mu-list>
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
    showPersonindex_x (id) {
      this.$router.push({path: `/personinfo/${id}`})
    },
    input (val) {
      // 判断输入的值是否是数字
      if (val === '') {
        this.friend = []
      } else if (isNaN(val)) {
        // 不是数字
        this.oldfriend = this.friends.filter(x => {
          if (x.name.indexOf(val) !== -1) {
            return true
          } else {
            return false
          }
        })
      } else {
        // 是数字
        this.friend = this.friends.filter(x => {
          if (x.phone.indexOf(val) !== -1) {
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
</style>
