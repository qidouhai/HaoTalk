<template>
  <div class="dialog">
    <mu-appbar :title="activeName"
               :zDepth="0">
      <mu-button color="primary" @click="closeDialog" slot="left">
        <mu-icon value="arrow_back"></mu-icon>
        返回
      </mu-button>
      <div class="right-top" slot="right">
        <mu-button icon color="primary">
          <mu-icon value="videocam"></mu-icon>
        </mu-button>
        <mu-button icon color="primary">
          <mu-icon value="call"></mu-icon>
        </mu-button>
        <mu-button icon color="primary" @click="showPersonindex">
          <mu-icon value="person"></mu-icon>
        </mu-button>
      </div>
    </mu-appbar>
    <!--对话内容-->
    <pull-refresh-container
      class="msg-list-container"
      :class="{ open: isExtensionOpen }"
      tabindex="-1"
      :can-action="hasMoreHistory"
      :can-refresh="noteLastConv"
      @pull-ready="fetchHistory"
      @focus.native="containerFocused"
      @click.native="containerFocused"
    >
      <!-- 历史聊天记录 -->
      <msg-item-base
        v-for="(item, index) in historyList"
        :key="'history' + index"
        class="common-msg-item"
        :context="item"
      >
        <component
          :is="getMsgItemType(item)"
          :context="item"
          @img-clicked="picClicked"
          @video-clicked="videoClicked"
        >
        </component>
      </msg-item-base>

      <!-- 当前聊天记录 -->

      <msg-item-base
        v-for="(item, index) in chatList"
        :key="'chat'+index"
        class="common-msg-item"
        :context="item"
        @resend="resendMsg(item)"
        @scrollToBottom="scrollToBottom"
      >
        <component
          :is="getMsgItemType(item)"
          :context="item"
          @loaded="scrollToBottom"
          @img-clicked="picClicked"
          @video-clicked="videoClicked"
        >
        </component>
      </msg-item-base>
      <div class="container-bottom-line"></div>
    </pull-refresh-container>
    <div class="footer" ref="footer">
      <div class="top">
        <mu-text-field v-model="msgTxt"
                       multi-line
                       :rows="1"
                       :rows-max="6"
                       @focus="focus"
                       @keyup.enter.native="send"/>
        <mu-button icon color="primary" @click="send">
          <mu-icon value="send"></mu-icon>
        </mu-button>
      </div>
      <div class="bottom">
        <mu-button icon color="primary" @click="openFile">
          <input type="file" accept="audio/*" capture='microphone' @change="uploadFile">
          <mu-icon value="mic_none"></mu-icon>
        </mu-button>
        <mu-button icon color="primary">
          <mu-icon value="photo_size_select_actual">
          </mu-icon>
        </mu-button>
        <mu-button icon color="primary" @click="openEmoji">
          <mu-icon value="tag_faces" ></mu-icon>
        </mu-button>
        <mu-button icon color="primary" @click="openFile">
          <input type="file" accept='video/*' capture='camcorder' @change="uploadFile">
          <mu-icon value="switch_video"></mu-icon>
        </mu-button>
        <!-- <mu-button icon color="primary">
          <mu-icon value="cloud_queue"></mu-icon>
        </mu-button> -->
        <mu-button icon color="primary" @click="openFile">
          <input type="file" accept="image/*" capture='camera' @change="uploadFile">
          <mu-icon value="photo_camera"></mu-icon>
        </mu-button>
        <mu-button icon color="primary" @click="openFile">
          <input type="file" multiple @change="uploadFile">
          <mu-icon value="folder_open"></mu-icon>
        </mu-button>
      </div>
      <emoji-area v-show="isEmojiAreaOpen" @emoji-click="addEmoji"></emoji-area>
    </div>
     <!-- 弹窗蒙层 -->
    <div v-show="isOverlayVisible" class="over-lay" @click.stop="overLayClicked"></div>
     <!-- 查看大图 -->
    <div v-if="isBigPicsVisible" class="big-pic-area" @click="bigPicClicked">
      <div class="big-pic" :style="{ backgroundImage: 'url(' + bigPicUrl + ')' }"></div>
    </div>
    <div
      v-show="messageTipFlag || messageScrollFlag"
      class="new-message-tip"
      @click="scrollToBottom"
    >
      <img src="../../assets/double_triangle_down.png" />
      <span v-if="messageTipFlag">有新的消息</span>
      <span v-else-if="messageScrollFlag">回到底部</span>
    </div>
    <video-player :video-url="curVideoString" :show="showVideoPlayer" @hide="onHideVideoPlayer" />
  </div>
</template>
<script>
import { http } from '../../libs/http'
import { mapState, mapMutations, mapGetters } from 'vuex'
import {debounce, getVideoCover, deepcopy} from '../../libs/utils'
import INDEXDB from '../../libs/indexDB'
import PullRefreshContainer from '../PullRefreshContainer/PullRefreshContainer'
import emojiArea from '../EmojiArea/EmojiArea.vue'
import VideoPlayer from '../VideoPlayer'
import MsgItemBase from '../msgItem/MsgItemBase/MsgItemBase'
import TextMsgItem from '../msgItem/TextMsgItem/TextMsgItem'
import ImageMsgItem from '../msgItem/ImageMsgItem/ImageMsgItem'
import VideoMsgItem from '../msgItem/VideoMsgItem/VideoMsgItem'
import AudioMsgItem from '../msgItem/AudioMsgItem/AudioMsgItem'

const msgTypeMap = {
  text: 'TextMsgItem',
  video: 'VideoMsgItem',
  image: 'ImageMsgItem',
  audio: 'AudioMsgItem'
}
export default {
  name: 'chatwindow',
  components: {
    emojiArea,
    PullRefreshContainer,
    VideoPlayer,
    MsgItemBase,
    TextMsgItem,
    ImageMsgItem,
    VideoMsgItem,
    AudioMsgItem
  },
  data () {
    return {
      msgTxt: '',
      isEmojiAreaOpen: false,
      isToolboxOpen: false,
      hasMoreHistory: true,
      noteLastConv: false,
      isBigPicsVisible: false,
      showVideoPlayer: false,
      messageTipFlag: false, // 新消息提示显示开关
      messageScrollFlag: false, // 滚动高度过高，出现自动滚到底部辅助按钮
      curVideoString: '',
      historyPageNo: 1,
      progressBar: 0,
      bigPicUrl: ''
    }
  },
  mounted () {
    this.initWindowEvent()
  },
  computed: {
    ...mapState({
      userData: 'userdata'
    }),
    ...mapGetters({
      historyList: 'nowHistoryList',
      chatList: 'nowChatList',
      activeName: 'activeName'
    }),
    isExtensionOpen () {
      return this.isToolboxOpen || this.isEmojiAreaOpen
    },
    isOverlayVisible () {
      return (
        this.isBigPicsVisible || this.showVideoPlayer || false
      )
    }
  },
  methods: {
    ...mapMutations(['getActiveId', 'showPersonindex', 'addToChatlist', 'clearChatlist']),
    showPersonindex () {
      if (this.$route.params.uid.startsWith('x')) {
        this.$router.push({path: `/groupinfo/${this.$route.params.uid}`})
      } else { this.$router.push({path: `/personinfo/${this.$route.params.uid}`}) }
    },
    async decorateMsg (item, type) {
      let videocover
      if (type == 'video') {
        videocover = await getVideoCover(item)
      }
      let msg = {}
      msg.context = type == 'video' ? item + '|' + videocover : item
      msg.contexttype = type
      msg.sendtime = Date.now()
      msg.msgtype = 'CONVERSATION_NOTE'
      msg.sender = this.userData.userid
      msg.sendername = this.userData.username
      msg.avatar = this.userData.avatar
      msg.receiver = this.$store.state.activeId
      msg.isSending = true
      msg.sendFailed = false
      return msg
    },
    async send (e) {
      if (this.msgTxt.trim()) {
        let msg = await this.decorateMsg(this.msgTxt.trim(), 'text')
        this.addMsg(msg)
        const res = await this.sendMsg(msg)
        if (res.respCode == 0) { msg.isSending = false } else {
          msg.sendFailed = true
          msg.isSending = false
        }
      } else {
        return
      }
      this.msgTxt = ''
    },
    async resendMsg (item) {
      this.chatList.forEach((m) => {
        if (m.sendtime === item.sendtime) {
          console.log(m)
          m.isSending = true
          m.sendFailed = false
        }
      })

      const res = await this.sendMsg(item)
      if (res.respCode == 0) {
        item.isSending = false
      } else {
        item.isSending = false
        item.sendFailed = true
      }
    },
    async sendMsg (item) {
      const res = await http('/sendmessage', {
        data: item,
        method: 'post'
      })
      return res
    },
    closeDialog () {
      this.$router.go(-1)
    },
    openEmoji () {
      this.isEmojiAreaOpen = !this.isEmojiAreaOpen
    },
    focus () {
      this.closeExtensionArea()
    },
    async fetchHistory (resolve) {
      let lasttime = this.historyList[0] ? this.historyList[0].sendtime : Date.now()
      const data = await http('/fetchHistory', {
        data: {time: lasttime,
          uid: this.userData.userid,
          roomid: this.$route.params.uid},
        method: 'post'
      })
      if (data.respCode !== 0) return
      console.log(data)
      if (data.respData.length < 10) {
        this.hasMoreHistory = false
      }

      const containerElem = document.querySelector('.msg-list-container')
      const scrollBottom = containerElem.scrollHeight - containerElem.scrollTop

      const historyMsg = []
      data.respData.forEach((item) => {
        const msg = item
        historyMsg.unshift(msg)
        if (msg) {
          msg.fromSelf = msg.sender == this.userData.userid
          msg.showTime = true

          const firstMsg = this.historyList[0]
          if (firstMsg && firstMsg.sendtime - msg.sendtime < 2 * 60 * 1000) {
            firstMsg.showTime = false
          }
          this.historyList.unshift(msg)
        }
      })
      resolve()
      setTimeout(() => {
        containerElem.scrollTop = containerElem.scrollHeight - scrollBottom - 40
      }, 0)
    },
    getFileData (item) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = function () {
          resolve(this.result)
        }
        reader.readAsDataURL(item)
      })
    },
    async uploadFile (e) {
      console.log(e.target.files)
      let check = Array.from(e.target.files).every(item => {
        return item.size <= 22475497
      })
      if (!check) {
        this.$toast.error('所选文件不能超过20MB')
        return
      }
      let files = e.target.files
      let filequeue = []
      let resqueue = []
      for (let item of files) {
        const file = await this.getFileData(item)
        let msg = await this.decorateMsg(file, /.*(?=\/)/.exec(item.type)[0])

        if (msg.contexttype == 'video') {
          let copymsg = deepcopy(msg)
          msg.context = msg.context.split('|')[1]
          this.addMsg(msg)
          filequeue.push(msg)
          INDEXDB.setItem(copymsg.sender + copymsg.sendtime, copymsg.context.split('|')[0])
          resqueue.push(await this.sendMsg(copymsg))
        } else {
          this.addMsg(msg)
          filequeue.push(msg)
          resqueue.push(await this.sendMsg(msg))
        }
      }
      resqueue.forEach((item, index) => {
        if (item.respCode == 0) {
          filequeue[index].isSending = false
        } else {
          filequeue[index].isSending = false
          filequeue[index].sendFailed = true
        }
      })
      /* let formData = new FormData()
      formData.append('file', files)
      const res = await this.sendMsg(formData)
      console.log(res) */
    },
    containerFocused () {
      this.closeExtensionArea()
    },
    closeExtensionArea () {
      this.isToolboxOpen = false
      this.isEmojiAreaOpen = false
    },
    addEmoji (emoji) {
      this.msgTxt = this.msgTxt + emoji
    },
    // 滚动到聊天区域最下面
    scrollToBottom (animate) {
      // 滚动区域增大，适配评价
      if (!requestAnimationFrame || !animate) {
        setTimeout(() => {
          document.querySelector('.msg-list-container').scrollTop = document.querySelector('.msg-list-container').scrollHeight
          // 滚到底部后隐藏新消息提示
          this.messageTipFlag = false
        }, 0)
      } else {
        this.easeInScrollMove(500)
      }
    },
    // 滚动逻辑
    easeInScrollMove (duration) {
      const baseHeight = document.querySelector('.msg-list-container').scrollTop
      const totalHeight = document.querySelector('.msg-list-container').scrollHeight
      const aimHeight = totalHeight - baseHeight
      let distance = aimHeight / 5
      let count = 0
      let timer = setInterval(() => {
        if (count === 5) {
          document.querySelector('.msg-list-container').scrollTop = totalHeight
          this.messageTipFlag = false
          clearInterval(timer)
        }
        document.querySelector('.msg-list-container').scrollTop += distance
        count++
      }, 100)
      // 到达滚动设置时间后直接到底部
      // $('.msg-list-container').scrollTop = totalHeight
    },
    // 自动滚动提示处理
    dealScrollHeight () {
      const container = document.querySelector('.msg-list-container')
      const offsetTop = container.scrollHeight - container.scrollTop - container.clientHeight
      if (offsetTop >= 1500) {
        this.messageScrollFlag = true
      } else {
        this.messageScrollFlag = false
      }
      if (offsetTop <= 800) {
        this.messageTipFlag = false
      }
    },
    onHideVideoPlayer () {
      this.showVideoPlayer = false
    },
    videoClicked (videoUrl) {
      this.showVideoPlayer = true
      this.curVideoString = videoUrl
    },
    // 点击图片
    picClicked (item) {
      this.bigPicUrl = item
      this.isBigPicsVisible = true
    },
    bigPicClicked () {
      this.bigPicUrl = ''
      this.isBigPicsVisible = false
    },
    addMsg (msg, isServerNew) {
      const lastMsg = this.chatList[this.chatList.length - 1] || this.historyList[this.historyList.length - 1]
      if (lastMsg && msg.sendtime - lastMsg.sendtime > 2 * 60 * 1000) {
        msg.showTime = true
      }
      this.addToChatlist(msg)
      this.$nextTick(() => {
        const box = document.querySelector('.msg-list-container')
        // 如果是收到的系统的消息 判断现在消息框是滚动到底才执行新消息滚动
        if (isServerNew) {
          if (box.scrollTop + box.clientHeight >= box.scrollHeight - 100) {
            this.scrollToBottom(true)
          }
        } else {
          this.scrollToBottom(true)
        }
        this.showMessageTip()
      })
    },
    openFile (e) {
      if (e.target.nextSibling.tagName === 'INPUT') {
        e.target.nextSibling.click()
      }
    },
    initWindowEvent () {
      // 滚动函数防抖
      this.easeInScrollMove = debounce(this.easeInScrollMove, 150, true)
      this.dealScrollHeight = debounce(this.dealScrollHeight, 200, false)
      // 监听用户息屏事件
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState == 'hidden') {
          console.log('用户息屏')
        }
      })
      // 用于安卓吊起软键盘后，滚动到底部
      window.addEventListener('resize', () => {
        this.scrollToBottom()
      })

      document.querySelector('.msg-list-container').addEventListener('scroll', () => {
        this.dealScrollHeight()
      })
    },
    getMsgItemType (item) {
      return msgTypeMap[item.contexttype]
    },
    showMessageTip () {
      const container = document.querySelector('.msg-list-container')
      if (container.scrollHeight - container.scrollTop - container.clientHeight >= 800) {
        this.messageTipFlag = true
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    this.clearChatlist()
    this.getActiveId({activeId: null})
    this.closeExtensionArea()
    this.hasMoreHistory = true
    next()
  },
  watch: {
    isExtensionOpen (newVal) {
      if (newVal) {
        this.scrollToBottom()
      }
    },
    $route (to, from) {
      if (to.path.startsWith('/dialog')) {
        this.getActiveId({activeId: this.$route.params.uid})
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '../../common/stylus/base.styl'
.dialog
  z-index: 999
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  display: -webkit-flex;
  display: -webkit-box;
  flex-direction: column;
  -webkit-flex-direction: column;
  background-color: #fafafa;
  .msg-list-container
    flex: 1 1 0;
    .container-bottom-line
      width: 100%;
  .msg-list-container:focus
    outline: none;
  .over-lay
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.6;
    background: #000;
  .big-pic-area
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #000;
    z-index: inherit;
    .big-pic
      width: 100%;
      height: 100%;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
  .new-message-tip {
    position: absolute;
    right: 0;
    margin-left: -95 * $px;
    padding: 10 * $px 20 * $px;
    text-align: center;
    background-color: #111;
    opacity: 0.7;
    border-radius: 30 * $px;
    img {
      float: left;
      width: 50 * $px;
      height: 50 * $px;
      margin-top: 15 * $px;
      margin-right: 10 * $px;
    }
    span {
      float: right;
      font-size: 24 * $px;
      color: #fff;
    }
  }
  .mu-appbar
    position: relative
    top: 0
    left: 0
    width: 100%
    background: color-w
    color: color-b
  .footer
    position: relative
    flex: 0 1 auto
    width: 100%
    text-align: center
    box-sizing: border-box
    background: color-w
    .top
      display: flex
      justify-content: center
      padding: 0 10px
      .mu-icon-button
        display: inline-block
        margin-left: 18px
        vertical-align: top
    .bottom
      margin-top: -14px
      color:rgba(0,0,0,.3)
      input
        display:none
</style>
