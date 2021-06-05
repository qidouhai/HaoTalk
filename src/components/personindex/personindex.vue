<template>
  <div class="index">
    <div class="top" :style="{backgroundImage: `url(${userData.backavatar})`}">
      <mu-appbar :zDepth="0">
        <mu-button slot="left" @click="back" >
          <mu-icon value="arrow_back"></mu-icon>
        </mu-button>
        <div class="right-top"
             slot="right">
          <mu-icon value="more_vert" style="background:white;"/>
        </div>
      </mu-appbar>
      <div class="c">
        <mu-avatar :size="96">
          <img :src="userData.avatar">
        </mu-avatar>
        <span class="name">{{userData.username}}</span>
      </div>
      <mu-tabs :value="activeTab" @change="handleTabChange" full-width>
        <mu-tab value="tab1">个人信息</mu-tab>
        <mu-tab value="tab2">个性标签</mu-tab>
        <mu-tab value="tab3">个人兴趣</mu-tab>
      </mu-tabs>
    </div>
    <div class="content">
      <div v-if="activeTab === 'tab1'">
        <mu-form :model="userData" label-position="left">
          <mu-form-item label="昵称">
            <mu-text-field v-model="userData.username" ></mu-text-field>
          </mu-form-item>
          <mu-form-item label="性别">
            <mu-text-field v-model="userData.sex" ></mu-text-field>
          </mu-form-item>
          <mu-form-item label="生日">
            <mu-text-field v-model="userData.birthday" ></mu-text-field>
          </mu-form-item>
          <mu-form-item label="地址">
            <mu-text-field v-model="userData.address" ></mu-text-field>
          </mu-form-item>
          <mu-form-item label="签名">
            <mu-text-field v-model="userData.motto" ></mu-text-field>
          </mu-form-item>
          <mu-form-item label="简介">
            <mu-text-field v-model="userData.introduction" ></mu-text-field>
          </mu-form-item>
        </mu-form>
      </div>
      <div v-if="activeTab === 'tab2'" style="padding-left:30px;">
      </div>
      <div v-if="activeTab === 'tab3'" style="padding-left:30px;">
      </div>
    </div>
    <mu-tabs v-if="isMyself||isFriend" class="bottom" full-width color="blue">
      <mu-tab v-if="isMyself">
        个性名片
      </mu-tab>
      <mu-tab v-else>
        音视频通话
      </mu-tab>
      <mu-tab v-if="isMyself" @click="showEditinfo">
        编辑资料
      </mu-tab>
      <mu-tab v-else>
        送礼物
      </mu-tab>
      <mu-tab @click="goDialog">
        发消息
      </mu-tab>
    </mu-tabs>
    <mu-tabs v-else class="bottom" full-width color="blue">
      <mu-tab>
        加好友
      </mu-tab>
    </mu-tabs>
    <editinfo v-show="showEdit" :personData="userData" @backclick="closeEditinfo"></editinfo>
  </div>
</template>
<script>
import editinfo from './editinfo.vue'
import { http } from '../../libs/http'
import {addIdList} from '../../libs/utils'
export default {
  name: 'personindex',
  data () {
    return {
      activeTab: 'tab1',
      userData: {},
      paramId: '',
      showEdit: false
    }
  },
  components: {
    editinfo
  },
  created () {
    this.$nextTick(() => {
      this.init()
    })
  },
  computed: {
    isMyself () {
      return this.$route.params.uid == this.$store.state.userdata.userid
    },
    isFriend () {
      return this.$store.state.friendList.find(item => {
        return item.friendid == this.$route.params.uid
      })
    }
  },
  methods: {
    handleTabChange (val) {
      this.activeTab = val
    },
    back () {
      this.$router.go(-1)
    },
    goDialog () {
      let personid = this.$route.params.uid
      let target = this.$store.state.messageList.filter(item => {
        return item.uid == personid
      })
      if (!target.length) {
        let res = this.$store.state.friendList.find(item => { return item.friendid == personid })
        let data = {
          avatar: res.avatar,
          name: res.username,
          list: [],
          uid: res.friendid,
          littlename: res.littlename
        }
        this.$store.commit('increaseMessagelist', data)
      }
      addIdList(this.$route.params.uid)
      this.$router.replace({path: `/dialog/${this.$route.params.uid}`})
    },
    showEditinfo () {
      this.showEdit = !this.showEdit
    },
    async closeEditinfo () {
      await this.init()
      this.showEdit = !this.showEdit
    },
    async init () {
      const res = await http('/getuserdata', {
        data: {
          uid: this.$route.params.uid
        }
      })
      this.userData = res.respData[0]
    }
  },
  watch: {
    // 监听路由
    $route (to, from) {
      if (this.$route.params.uid !== null) {
        if (to.path.startsWith('/personinfo')) { this.paramId = this.$route.params.uid }
      }
    },
    paramId (newVal, oldVal) {
      if (newVal !== undefined && newVal !== null) {
        // 初始化数据
        this.init()
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.index
  overflow-y scroll
  position: absolute
  z-index: 999
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: color-g
  .top
    position: relative
    height: 38vh
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
  .bottom
    position: fixed
    left: 0
    bottom: 0
    background: color-w
</style>
