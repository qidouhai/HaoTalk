<template>
  <!--判定ajax结束后，且有消息列表存在才开始渲染组件，防止报错-->
  <mu-list v-if="isAjax&&nowMessageList">
    <!--设置列表删除时动态效果-->
    <div v-for="(item, index) in nowMessageList"
         :class="[{swipeleft: isSwipe[index]},'wrap']"
         @click="openDialog(item.uid)"
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
        <mu-list-item-title>这个周末一起吃饭么?</mu-list-item-title>
        <mu-list-item-sub-title>
          <span style="color: rgba(0, 0, 0, .87)">Myron Liu -</span>{{item.list[item.list.length-1].context}}
        </mu-list-item-sub-title>
      </mu-list-item-content>
        <!--时间与待处理-->
        <div class="item-right">
          <!--获取到当前聊天队列，最后一条内容的time-->
          <span class="time">{{item.list[item.list.length-1].sendtime|formattime}}</span>
          <!--数据需求是为字符串-->
          <mu-badge :content="`${item.list.length}`" color='#f44336' />
        </div>
      </mu-list-item>
      <!--分割线-->
      <!--阻止时间冒泡-->
      <div class="delete" @click.stop="removeM(item._id)">删除</div>
    </div>
  </mu-list>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { timeFormat } from '../../libs/utils'

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
      isSwipe: [false, false, false]
    }
  },
  computed: {
    ...mapGetters(['nowMessageList']),
    // ajax是否已经结束
    ...mapState(['isAjax'])
  },
  methods: {
    ...mapMutations(['getActiveId', 'removeMessage']),
    // 获取点击的friend的_id
    openDialog (id) {
      this.getActiveId({ activeId: id })
      this.$router.push({path: `/dialog/${id}`})
    },
    // 删除信息
    removeM (_id) {
      this.removeMessage({ _id })
    }
  },
  filters: {
    formattime (time) {
      let nowtime = Date.now()
      let seconds = (nowtime - time) / 1000
      console.log('打印time',time)
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
      console.log('打印result', result)
      return result
    }
  },
  created () {
    console.log('新建message')
    this.$store.dispatch('getMessage')
    this.$store.dispatch('getUserdata')
  },
  mounted () {
    setTimeout(() => {
      // 判断是否存在信息列表
      if (this.$refs.child) {
        this.$refs.child.forEach((element, index) => {
          let x, y, X, Y, swipeX, swipeY
          // 监听touchstart
          element.addEventListener('touchstart', e => {
            x = e.changedTouches[0].pageX
            y = e.changedTouches[0].pageY
            swipeX = true
            swipeY = true
            this.isSwipe = [false, false, false]
          })
          element.addEventListener('touchmove', e => {
            X = e.changedTouches[0].pageX
            Y = e.changedTouches[0].pageY
            if (swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0) {
              // 阻止默认事件
              e.stopPropagation()
              // 右滑
              if (X - x > 10) {
                e.preventDefault()
                this.isSwipe.splice(index, 1, false)
              }
              if (x - X > 10) {
                e.preventDefault()
                this.isSwipe.splice(index, 1, true)
              }
              swipeY = false
            }
            if (swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
              swipeX = false
            }
          })
        })
      }
    }, 1000)
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
        right: 20px
        .time
          display: inline-block
          position: absolute
          top: -10px
          left: -16px
        .mu-badge
          display: inline-block
          position: absolute
          top: 0
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
