<template>
  <!--判定ajax结束后，且有消息列表存在才开始渲染组件，防止报错-->
  <mu-list  class="msglist">
    <!--设置列表删除时动态效果-->
    <div v-for="(item, index) in nowMessageList" class="wrap"
         @click="openDialog(item)"
         ref="child"
         :key="index">
      <mu-list-item :ripple="true"
                    class="list-item"
                    avatar>
        <!--头像-->
        <mu-list-item-action>
          <mu-avatar>
            <img :src="item.avatar">
          </mu-avatar>
        </mu-list-item-action>
          <mu-list-item-content>
          <mu-list-item-title>{{item.littlename||item.name}}</mu-list-item-title>
          <mu-list-item-sub-title>
            <span v-if="item.uid.startsWith('x')" style="color: rgba(0, 0, 0, .87);">
              {{item.list[item.list.length-1].sendername+': '}}
            </span>
            {{item.list[item.list.length-1]|showLastmsg}}
          </mu-list-item-sub-title>
          </mu-list-item-content>
        <div class="item-right">
          <span class="time">{{item.list.length && item.list[item.list.length-1].sendtime|formattime}}</span>
          <mu-badge v-if="item.newsnum" :content="`${item.newsnum}`" color='#f44336' />
        </div>
      </mu-list-item>
      <div class="delete" @click.stop="removeM(index)">删除</div>
    </div>
  </mu-list>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { timeFormat, removeIdList } from '../../libs/utils'
import VueSocketIO from 'vue-socket.io'
import Vue from 'vue'
import store from '../../vuex/index'

const matchDay = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  0: '星期天'
}

export default {
  name: 'message',
  data () {
    return {
      x: '',
      y: '',
      X: '',
      Y: '',
      swipeX: '',
      swipeY: '',
      oldEle: '',
      nodeEle: ''
    }
  },
  async created () {
    console.log('message新建')
    await this.$store.dispatch('getUserdata')
    await this.$store.dispatch('getFriends')
    await this.$store.dispatch('getGroups')
    await this.$store.dispatch('getMessage')
    Vue.use(new VueSocketIO({
      debug: true,
      // 服务器端地址
      connection: 'http://localhost:7001/',
      vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
      },
      options: {
        query: {
          userId: this.$store.state.userdata.userid
        }
      }
    }))
  },
  mounted () {
    setTimeout(() => {
      // 判断是否存在信息列表
      let msglist = document.getElementsByClassName('msglist')[0]
      msglist.addEventListener('touchstart', e => {
        this.oldEle && this.nodeEle.classList.remove('swipeleft')
        this.nodeEle = this.findRootNode(e.target)
        this.oldEle = this.nodeEle
        this.x = e.changedTouches[0].pageX
        this.y = e.changedTouches[0].pageY
        this.swipeX = true
        this.swipeY = true
      })
      msglist.addEventListener('touchmove', e => {
        this.X = e.changedTouches[0].pageX
        this.Y = e.changedTouches[0].pageY
        if (this.swipeX && Math.abs(this.X - this.x) - Math.abs(this.Y - this.y) > 0) {
          // 阻止默认事件
          e.stopPropagation()
          // 右滑
          if (this.X - this.x > 10) {
            e.preventDefault()
            this.nodeEle.classList.remove('swipeleft')
          }
          if (this.x - this.X > 10) {
            e.preventDefault()
            this.nodeEle.classList.add('swipeleft')
          }
          this.swipeY = false
        }
        if (this.swipeY && Math.abs(this.X - this.x) - Math.abs(this.Y - this.y) < 0) {
          this.swipeX = false
        }
      })
    }, 1000)
  },
  computed: {
    ...mapGetters(['nowMessageList', 'nowFriendList'])
  },
  methods: {
    ...mapMutations(['getActiveId', 'removeMessage']),
    // 获取点击的friend的_id
    openDialog (item) {
      this.$store.commit('removeNewmsgnum', item.uid)
      this.getActiveId({ activeId: item.uid })
      this.$router.push({path: `/dialog/${item.uid}`})
    },
    // 删除信息
    removeM (index) {
      removeIdList(this.nowMessageList[index].uid)
      this.removeMessage({ index })
    },
    findRootNode (node) {
      if (node.classList.contains('wrap')) return node
      else {
        return this.findRootNode(node.parentNode)
      }
    }
  },
  filters: {
    formattime (time) {
      if (!time) return
      let nowtime = Date.now()
      let seconds = (nowtime - time) / 1000
      var result
      if (seconds < 300) {
        result = '刚刚'
      } else if (seconds >= 300 && seconds < 600) {
        result = '五分钟前'
      } else if (seconds >= 600 && seconds < 1800) {
        result = '10分钟前'
      } else if (seconds >= 1800 && seconds < 3600) {
        result = '30分钟前'
      } else if (seconds >= 3600 && seconds / 3600 / 24 < 7) {
        if (seconds / 3600 / 24 < 1) {
          result = timeFormat(time, 'hh:MM')
        } else {
          result = matchDay[new Date().getDay() + (7 - seconds / 3600 / 24)]
        }
      } else {
        result = timeFormat(time, 'yyyy-mm-dd')
      }
      return result
    },
    showLastmsg (item) {
      if (!item) return
      let name = ''
      switch (item.contexttype) {
        case 'text':
          name = item.context
          break
        case 'video':
          name = '【视频】'
          break
        case 'audio':
          name = '【音频】'
          break
        case 'image':
          name = '【图片】'
          break
        default:
          break
      }
      return name
    }
  },
  beforeRouteLeave (to, from, next) {
    this.nodeEle && this.nodeEle.classList.remove('swipeleft')
    next()
  }
}
</script>
<style lang="stylus">
@import '../../common/stylus/mixin.styl'
.mu-list
  overflow: hidden
  background: color-g
  // 左滑删除
  .swipeleft
    transform:translateX(-20%)
  .wrap
    width: 125%
    overflow: hidden
    transition:all 0.3s linear
    border-1px()
    .list-item
      position:relative
      float:left
      width:80%
      height: 10vh
      background: color-w
      transition:all 0.3s linear
      .item-right
        position:absolute
        top: 10px
        right: 20px
        .time
          display: inline-block
        .mu-badge
          display: inline-block
          position: absolute
          top: 10px
          left: -10px
          border-radius: 5px
    .delete
      float: right
      display: block
      height: 10vh
      line-height: 10vh
      width: 20%
      text-align: center
      font-size: 1.2em
      font-weight: 500
      color: color-w
      background: #ff1744
</style>
