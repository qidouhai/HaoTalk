<template>
<div class="groupindex">
  <mu-appbar style="width: 100%" color="primary">
    <mu-button icon slot="left" @click="back">
      <mu-icon value="reply"></mu-icon>
    </mu-button>
    群聊设置
    <mu-button flat slot="right">完成</mu-button>
  </mu-appbar>
  <mu-list>
    <mu-list-item avatar button :ripple="true" @click="openDialog">
      <mu-list-item-action>
          <mu-avatar>
              <img :src="groupData.avatar">
          </mu-avatar>
      </mu-list-item-action>
      <mu-list-item-title>{{groupData.roomname}}</mu-list-item-title>
      <mu-list-item-action >
          <mu-icon value="chat_bubble"></mu-icon>
      </mu-list-item-action>
    </mu-list-item>
  </mu-list>

  <mu-expansion-panel>
    <div slot="header">群聊成员</div>
    <mu-list>
        <!--动态渲染-->
        <div v-for="(item,index) in groupData.groupmember" class="item" :key="index">
            <mu-list-item avatar button @click="showPersonindex(item.userid)" :ripple="true">
              <mu-list-item-action>
                <mu-avatar>
                  <img :src="item.avatar">
                </mu-avatar>
              </mu-list-item-action>
              <mu-list-item-title>{{item.username}}</mu-list-item-title>
            </mu-list-item>
            <mu-divider inset/>
        </div>
    </mu-list>
  </mu-expansion-panel>
  <mu-button full-width color="primary" @click="openDialog" class="create-button">发消息</mu-button>
  <mu-button v-if="isCreater" full-width color="primary" @click="destroyroom" class="create-button">解散群聊</mu-button>
  <mu-button v-else full-width color="primary" @click="quitroom" class="create-button">退出群聊</mu-button>
</div>
</template>
<script>
import { http } from '../../libs/http'
export default {
  name: 'groupindex',
  data () {
    return {
      groupData: {},
      paramId: ''
    }
  },
  created () {
    this.$nextTick(() => {
      this.init()
    })
  },
  computed: {
    isCreater () {
      return this.$store.state.userdata.userid == this.groupData.creater
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    showPersonindex (id) {
      this.$router.push({path: `/personinfo/${id}`})
    },
    destroyroom () {

    },
    quitroom () {

    },
    openDialog () {
      this.$router.replace({path: `/dialog/${this.$route.params.uid}`})
    },
    async init () {
      const res = await http('/getgroupdata', {
        data: {
          uid: this.$route.params.uid
        }
      })
      this.groupData = res.respData
    }
  },
  watch: {
    // 监听路由
    $route (to, from) {
      if (this.$route.params.uid !== null) {
        if (to.path.startsWith('/groupinfo')) { this.paramId = this.$route.params.uid }
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
  .groupindex
    overflow-y scroll
    position: absolute
    z-index: 999
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: white
</style>
