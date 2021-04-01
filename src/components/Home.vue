<template>
  <div class="home">
    <pull-refresh-container
      class="msg-list-container"
      :class="{ open: isExtensionOpen, ipx: isIPX }"
      tabindex="-1"
      :can-action="hasMoreHistory"
      :can-refresh="noteLastConv"
      @pull-ready="fetchHistory"
      @focus.native="containerFocused"
      @click.native="containerFocused"
    >
      <div v-if="showInterfaceLoading && platform === 'zlj'" class="interface-loading">
        <img src="../assets/interface_loading.gif" />
      </div>
      <!-- 历史聊天记录 -->
      <msg-item-base
        v-for="(item, index) in historyList"
        :key="'history' + index"
        class="common-msg-item"
        :context="item"
        :platform="platform"
      >
        <component
          :is="getMsgItemType(item)"
          :context="item"
          :platform="platform"
          @img-clicked="picClicked"
          @video-clicked="videoClicked"
          @img-link-clicked="onImageLinkClick"
          @option-click="robotOptionClicked"
          @link-click="robotLinkClicked"
          @rich-text-click="richTextClicked"
        >
        </component>
      </msg-item-base>

      <!-- 当前聊天记录 -->

      <msg-item-base
        v-for="(item, index) in chatList"
        :key="'chat' + index"
        class="common-msg-item"
        :context="item"
        :platform="platform"
        @quit-clicked="quitQueue"
        @confirm-quit="confirmQuitQueue"
        @quit-hold-clicked="quitAndHoldQueue"
        @resend="resendMsg(item)"
        @rengong="transferToRengong"
        @sendUserMsg="sendUserMsg"
        @scrollToBottom="scrollToBottom"
      >
        <component
          :is="getMsgItemType(item)"
          :context="item"
          :data-msgid="item.msgId"
          :platform="platform"
          @loaded="scrollToBottom"
          @img-clicked="picClicked"
          @video-clicked="videoClicked"
          @img-link-clicked="onImageLinkClick"
          @option-click="robotOptionClicked"
          @link-click="robotLinkClicked"
          @rengong-click="transferToRengong"
          @rich-text-click="richTextClicked"
        >
        </component>
      </msg-item-base>
      <div class="container-bottom-line"></div>
    </pull-refresh-container>

    <Bubble v-if="isInConversation && platform !== 'checkapp'"></Bubble>
    <CheckBubble v-if="isInConversation && platform == 'checkapp'"></CheckBubble>

    <!-- 挂断悬浮按钮 -->
    <img
      v-if="platform !== 'checkapp'"
      v-show="isInConversation && userCloseConvSwitch"
      ref="hangupIcon"
      class="hangup"
      src="../assets/quit.png"
    />
    <live-stream ref="liveStream" :show="showStream" @hide="onHideStream" />
    <div
      v-show="messageTipFlag || messageScrollFlag"
      class="new-message-tip"
      :class="{ shorter: messageScrollFlag && !messageTipFlag }"
      @click="scrollToBottom"
    >
      <img src="../assets/double_triangle_down.png" />
      <span v-if="messageTipFlag">有新的消息</span>
      <span v-else-if="messageScrollFlag">回到底部</span>
    </div>

    <bottom-fixed-area
      :user-state="state"
      :btn-config="bottomBtnConfig"
      :platform="platform"
      @btnClick="handleFixedAreaClick"
    ></bottom-fixed-area>

    <!-- 聊天框底部栏 -->
    <footer
      :class="{
        open: isExtensionOpen,
        ipx: isIPX,
        checkapp: platform === 'checkapp',
        whs: platform === 'whs',
        caihuoxia: isZZhunter,
      }"
    >
      <!-- 聊天输入框 -->
      <div class="send-box">
        <div class="msg-area">
          <textarea
            v-model="msgTxt"
            type="text"
            :disabled="disabledInput"
            placeholder="输入聊天内容"
            rows="1"
            @focus="txtBoxFocused"
            @blur="txtBoxBlur"
            @input="updateTxtBoxHeight"
          ></textarea>
        </div>
        <div class="emoji-btn" @click="toggleEmojiArea"></div>
        <div v-show="!canSend" class="toolbox-btn" @click="toggleToolbox"></div>
        <div v-show="canSend" class="send-btn" @mousedown.prevent="sendTextMsg">
          <span>发送</span>
        </div>
      </div>
      <!-- 发送工具框 -->
      <toolbox
        v-show="isToolboxOpen"
        tabindex="-1"
        :platform="platform"
        @album="onLaunchAlbum"
        @takeShot="onTakeShot"
        @recordVideo="onRecordVideo"
        @send-image="onSendImage"
        @goods="onLaunchGoodsPage"
        @goods-visited="onLaunchGoodsVisitedPage"
        @order="onLaunchOrderPage"
        @evaluate="onAddEvaluationMsg"
      >
      </toolbox>
      <emoji-area v-show="isEmojiAreaOpen" tabindex="-1" @emoji-click="addEmoji"> </emoji-area>
    </footer>
    <!-- 弹窗蒙层 -->
    <div v-show="isOverlayVisible" class="over-lay" @click.stop="overLayClicked"></div>
    <!-- 查看大图 -->
    <div v-if="isBigPicsVisible" class="big-pic-area" @click="bigPicClicked">
      <div class="big-pic" :style="{ backgroundImage: 'url(' + bigPicUrl + ')' }"></div>
    </div>
    <!-- 会话已结束提示框 -->
    <div v-if="isFinishSessionLayerVisible" class="finish-session">
      <div class="content">会话已结束</div>
      <footer>
        <div class="close-btn" @click="closePage">
          <span>关闭</span>
        </div>
      </footer>
    </div>
    <!-- 商品列表上滑框 -->
    <transition name="fade">
      <component
        :is="getProducListType()"
        v-if="isMyPublishPickListLayerVisible"
        @close="overLayClicked"
        @selected="goodsSelected"
      >
      </component>
    </transition>
    <!-- 足迹列表上滑框 -->
    <transition name="fade">
      <component
        :is="getVisitedProducListType()"
        v-if="isMyVisitedPublishPickListLayerVisible"
        @close="overLayClicked"
        @selected="goodsVisitedSelected"
      >
      </component>
    </transition>
    <!-- 订单列表上滑框 -->
    <transition name="fade">
      <component
        :is="getOrderListType()"
        v-if="isOrderPickListLayerVisible"
        @selected="orderSelected"
        @emitLoading="emitLoading"
      >
      </component>
    </transition>
    <!-- 反问动作上滑框 -->
    <transition name="fade">
      <action-pop-up
        v-if="isReAskActionShow"
        :infos="reAskOptData"
        @select="reAskSelected"
      ></action-pop-up>
    </transition>
    <!-- 雅典娜选择其他订单上滑框 -->
    <transition name="fade">
      <fetch-pop-up
        v-if="fetchPopUpShow"
        :action-type="fetchActionType"
        :business-id="chooseOtherOrderBizId"
        :user-send-text="curUserSendText"
        @select="fetchPopUpSelected"
        @close="fetchPopUpClosed"
      ></fetch-pop-up>
    </transition>
    <transition name="fade">
      <leave-message-pop-up
        v-if="leaveMessagePopUpShow"
        :guestbookId="leaveMessageId"
        :infos="leaveMessageList"
        :status="leaveMessageStatus"
        :platform="platform"
        @close="leaveMessagePopUpClosed"
        @confirm="leaveMessageConfirm"
        @video-clicked="videoClicked"
        @img-link-clicked="onImageLinkClick"
        @link-click="robotLinkClicked"
      ></leave-message-pop-up>
    </transition>
    <!-- 退出确认弹窗（会话中） -->
    <quit-conv-dialog
      v-if="isQuitConvDialogVisible"
      @quit-clicked="quitConv"
      @hold-clicked="holdConv"
      @close="closeQuitConvDialog"
    >
    </quit-conv-dialog>
    <!-- 退出确认弹窗（排队中） -->
    <quit-queue-dialog
      v-if="isQuitQueueDialogVisible"
      @quit-clicked="quitQueue"
      @hold-clicked="closeQuitQueueDialog"
      @close="closeQuitQueueDialog"
    ></quit-queue-dialog>
    <ZZLoading :isLodingVisible="isLodingVisible"></ZZLoading>
    <div
      v-if="showLoading"
      class="loading-wrapper"
      :style="{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
      }"
    >
      <img
        src="../assets/loading-common2.gif"
        :style="{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
        }"
      />
    </div>
    <video-player :video-url="curVideoString" :show="showVideoPlayer" @hide="onHideVideoPlayer" />
  </div>
</template>

<script>
import 'intersection-observer'
import native from '@zz-common/native-adapter'
import { lego } from '@zz-common/lego'
import setPicSize from '@zz-app/setPicSize'
import {
  $,
  choiceLogin,
  forceLogin,
  queryParams,
  isIphoneX,
  isMiniProgram,
  debounce,
  RAFMove,
  isZZhunter,
  getPlatform,
  isZljNative,
  isRealLogin,
  getCookie,
  setCookie
} from '../libs/utils'
import { historyConvType, packageType } from '../dal/constants'
import {
  imUIMsgType,
  imUserState,
  convertMsgType_UIToRaw,
  getMsgItemTypeByObj
} from '../libs/common'
import { chatHistory, getSkillConfigByCurrentConv } from '@api/resourceApi'
import {
  toast,
  uploadPhotos,
  isZZApp,
  closeZljRefresh,
  getSystemCamera,
  getVideoRecorder,
  hideShareButton
} from '../native'
import convertHistoryMsg from '../dal/convertHistoryMsg'
import CurrentConversation from '../dal/CurrentConversation'
import { initHangUpMove } from '../libs/hangUpMove'
import PullRefreshContainer from './PullRefreshContainer/PullRefreshContainer'
import MsgItemBase from './msgItem/MsgItemBase/MsgItemBase'
import TextMsgItem from './msgItem/TextMsgItem/TextMsgItem'
import ImageMsgItem from './msgItem/ImageMsgItem/ImageMsgItem'
import VideoMsgItem from './msgItem/VideoMsgItem/VideoMsgItem'
import ImageLinkMsgItem from './msgItem/ImageLinkMsgItem/ImageLinkMsgItem'
import GoodsMsgItem from './msgItem/GoodsMsgItem/GoodsMsgItem'
import RichTextMsgItem from './msgItem/RichTextMsgItem/RichTextMsgItem'
import PureRichTextItem from './msgItem/PureRichTextItem/PureRichTextMsgItem'
import AthenaMsgItem from './msgItem/AthenaMsgItem/AthenaMsgItem'
import Toolbox from './Toolbox/Toolbox'
import EmojiArea from './EmojiArea/EmojiArea'
import Bubble from './Bubble/Bubble'
import MyPublishPickList from './MyPublishPickList/MyPublishPickList'
import MyVisitedPublishPickList from './MyVisitedPublishPickList/MyVisitedPublishPickList'
import OrderPickList from './OrderPickList/OrderPickList'
import QuitConvDialog from './dialog/QuitConvDialog/QuitConvDialog'
import QuitQueueDialog from './dialog/QuitQueueDialog/QuitQueueDialog'
import ZZLoading from './common/Loading/Loading'
import CheckProductList from './Check/ProductList'
import CheckOrderList from './Check/OrderList'
import CheckBubble from './Check/CheckBubble'
import ActionPopUp from './ActionPopUp'
import LeaveMessagePopUp from './LeaveMessagePopUp'
import BottomFixedArea from './BottomFixedArea'
import FetchPopUp from './ActionPopUp/fetch-popup'
import VideoPlayer from '../components/VideoPlayer'
import LiveStream from '../components/LiveStream/LiveStream.vue'
// import { Loading } from '@zz-common/zz-ui'
import XssFilter from 'xss'
// import Vue from 'vue'
// 导入eventbus
import Eventbus from '../libs/eventbus'
// Vue.use(Loading)
// const VARIBLE_PX = 1.0 / 75;        //  rem
const kefuAvatarImg = 'https://img1.zhuanstatic.com/common/img/kefu_72x72.png'

const skillId = queryParams().skillId
const robot = queryParams().robot
const clientId = queryParams().clientid
const infoId = queryParams().infoId
const orderId = queryParams().orderId
const legoBackup = {
  skill: skillId,
  robot: robot,
  entryid: clientId,
  infoid: infoId,
  orderid: orderId
}
const zzv = queryParams().zzv
const vers = zzv && zzv.split('.').map((v) => Number(v))
let io = null

export default {
  name: 'Home',
  components: {
    ZZLoading,
    PullRefreshContainer,
    MsgItemBase,
    TextMsgItem,
    ImageMsgItem,
    GoodsMsgItem,
    RichTextMsgItem,
    PureRichTextItem,
    AthenaMsgItem,
    Toolbox,
    EmojiArea,
    Bubble,
    MyPublishPickList,
    MyVisitedPublishPickList,
    OrderPickList,
    QuitConvDialog,
    QuitQueueDialog,
    CheckProductList,
    CheckOrderList,
    CheckBubble,
    ActionPopUp,
    BottomFixedArea,
    FetchPopUp,
    ImageLinkMsgItem,
    VideoMsgItem,
    VideoPlayer,
    LeaveMessagePopUp,
    LiveStream
  },
  data () {
    return {
      uid: '',
      avatar: '',
      kefuAvatar: kefuAvatarImg,
      historyList: [],
      historyPageNo: 1,
      hasMoreHistory: true,
      chatList: [],
      sendingList: [],
      bigPicUrl: '',
      msgTxt: '',
      state: imUserState.NONE,
      isLodingVisible: false,
      isRobotMode: false,
      noteLastConv: false,
      //  交互状态
      isTxtBoxFocusing: false,
      isToolboxOpen: false,
      isEmojiAreaOpen: false,
      isOverlayLock: true, //  锁定半透明遮罩层，点击无法关闭弹窗
      isBigPicsVisible: false,
      isFinishSessionLayerVisible: false,
      isMyPublishPickListLayerVisible: false, // 商品列表显示flag
      isMyVisitedPublishPickListLayerVisible: false, // 足迹列表显示flag
      isOrderPickListLayerVisible: false, // 订单列表显示flag
      isQuitConvDialogVisible: false,
      isQuitQueueDialogVisible: false,
      isReAskActionShow: false, // 反问动作弹层flag
      robotCardState: {
        wsState: 0, // 标识websocket消息有没有返回
        historyState: 0, // 标识拉取历史消息接口有没有返回
        hadDisplay: false // 卡片是否已显示
      },
      platform: getPlatform(), // 获取当前客户端平台，默认为转转
      docHeight:
          window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      docWidth:
          window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      reAskOptData: {}, // 反问弹层数据
      bottomBtnConfig: [
        {
          text: '我要问其他订单',
          display: false,
          callback: () => {
            this.fetchPopUpShow = true
            this.isOverlayLock = true
          }
        },
        {
          text: '选择其他业务线',
          display: false,
          callback: () => {
            this.fetchPopUpShow = true
            this.isOverlayLock = true
          }
        }
      ],
      chooseOtherOrderBizId: '',
      fetchPopUpShow: false,
      fetchActionType: '',
      curUserSendText: '', // 用户最近发送的一条text消息（雅典娜业务线订单识别用）
      showVideoPlayer: false,
      curVideoString: '',
      showLoading: false,
      cancelAnonymous: 0, // 是否为匿名登录转实名登录
      isRealLoginSocket: false, // 当前socket连接是否为实名制
      showInterfaceLoading: true, // 接口loading
      userCloseConvSwitch: false, // 用户关闭会话按钮显示开关
      disabledInput: false, // 禁用用户输入
      leaveMessagePopUpShow: false, // 留言上滑弹窗控制
      leaveMessageId: '', // 留言id
      leaveMessageList: [], // 留言列表
      leaveMessageStatus: 0, // 0 过期 1正常
      messageTipFlag: false, // 新消息提示显示开关
      messageScrollFlag: false, // 滚动高度过高，出现自动滚到底部辅助按钮
      showStream: false // 新增的直播入口
    }
  },
  watch: {
    isExtensionOpen (newVal) {
      if (newVal) {
        this.scrollToBottom()
      }
    },
    isInQueue (newVal) {
      if (newVal) {
        this.chatList.push({
          imMsgType: imUIMsgType.QUEUE_STATE,
          waitNum: ''
        })
      } else {
        const queue_msg_item = this.chatList.filter(
          (m) => m.imMsgType === imUIMsgType.QUEUE_STATE
        )[0]
        const index = this.chatList.indexOf(queue_msg_item)
        this.chatList.splice(index, 1)
      }
    },
    // 处理是否显示机器人接入卡片
    robotCardState (newVal) {
      if (newVal.wsState == 1 && newVal.historyState == 1 && !newVal.hadDisplay) {
        // 每次进入页面拉取当前会话消息时，如果是机器人消息，显示机器人接入卡片
        if (this.isRobotMode) {
          // 当前渲染会话列表是否有消息，没有直接插入，有则放到最上方
          if (this.chatList.length == 0) {
            this.chatList.push({ isRobotCard: true })
          } else {
            // 让机器人下方一条消息不显示时间
            const topMsg = this.chatList[0]
            this.chatList[0] = Object.assign(topMsg, { showTime: false })
            this.chatList.unshift({ isRobotCard: true })
          }
          this.scrollToBottom()
          this.robotCardState.hadDisplay = true
        }
      }
    }
  },
  computed: {
    isOverlayVisible () {
      return (
        this.isBigPicsVisible ||
          this.isFinishSessionLayerVisible ||
          this.isMyPublishPickListLayerVisible ||
          this.isMyVisitedPublishPickListLayerVisible ||
          this.isOrderPickListLayerVisible ||
          this.isQuitConvDialogVisible ||
          this.isQuitQueueDialogVisible ||
          this.isReAskActionShow ||
          this.fetchPopUpShow ||
          this.showVideoPlayer ||
          this.leaveMessagePopUpShow ||
          false
      )
    },
    isExtensionOpen () {
      return this.isToolboxOpen || this.isEmojiAreaOpen
    },
    isIdleState () {
      return this.state === imUserState.IDLE
    },
    isInQueue () {
      return this.state === imUserState.IN_QUEUE
    },
    isInConversation () {
      return this.state === imUserState.IN_SESSION
    },
    isIPX () {
      return isIphoneX() && !this.isTxtBoxFocusing
    },
    canSend () {
      return this.msgTxt.length > 0
    },
    isZZhunter () {
      return isZZhunter()
    }
  },
  methods: {
    // 判断是否显示直播入口
    checkStream () {
      const { athenaChannel = null } = queryParams()
      const time = new Date()
      if (time.getHours() >= 9 && time.getHours() <= 20 && athenaChannel == 121) {
        const value = getCookie('liveStream')
        if (!value) {
          this.showStream = true
          this.$nextTick(() => {
            initHangUpMove(this.$refs.liveStream.$el, this.docWidth, this.docHeight, () => {})
          })
        }
      }
    },
    onHideStream () {
      this.showStream = false
    },
    onHideVideoPlayer () {
      this.showVideoPlayer = false
    },
    lego (actiontype, backup) {
      lego.send({
        pagetype: 'KEFUIM_HOME',
        actiontype: actiontype,
        backup: Object.assign({}, legoBackup, backup)
      })
    },
    sendLegoErr (errName, backup) {
      lego.send({
        pagetype: 'KEFUIM_HOME',
        actiontype: 'ERROR',
        backup: Object.assign(
          {
            name: errName
          },
          legoBackup,
          backup
        )
      })
    },
    getOrderListType () {
      return this.platform == 'checkapp' ? 'CheckOrderList' : 'OrderPickList'
    },
    getProducListType () {
      return this.platform == 'checkapp' ? 'CheckProductList' : 'MyPublishPickList'
    },
    getVisitedProducListType () {
      return 'MyVisitedPublishPickList'
    },
    // 根据不同消息type渲染不同的UI组件
    getMsgItemType (item) {
      return getMsgItemTypeByObj(item)
    },
    closeExtensionArea () {
      this.isToolboxOpen = false
      this.isEmojiAreaOpen = false
    },
    toggleToolbox () {
      if (this.disabledInput) return
      this.isEmojiAreaOpen = false
      this.isToolboxOpen = !this.isToolboxOpen
    },
    toggleEmojiArea () {
      if (this.disabledInput) return
      this.isToolboxOpen = false
      this.isEmojiAreaOpen = !this.isEmojiAreaOpen
    },
    txtBoxFocused () {
      this.isTxtBoxFocusing = true
      this.closeExtensionArea()
      setTimeout(() => {
        document.body.scrollTop = document.body.scrollHeight
      }, 500)
    },
    txtBoxBlur () {
      this.isTxtBoxFocusing = false
      setTimeout(() => {
        document.body.scrollTop = document.body.scrollHeight
        this.fixIOSKeyBoardBug()
      }, 100)
    },
    updateTxtBoxHeight (e) {
      const elem = $('.msg-area > textarea')
      elem.style.height = 'auto'
      elem.style.height = elem.scrollHeight + 'px'
      elem.scrollTop = elem.scrollHeight
      $('.msg-list-container').scrollTop = $('.msg-list-container').scrollHeight + 520
      this.sendUserEditingMsg(e)
    },
    containerFocused () {
      this.closeExtensionArea()
    },
    emitLoading (value) {
      this.isLodingVisible = value
    },
    overLayClicked () {
      if (this.isOverlayLock) return
      this.isBigPicsVisible = false
      this.isFinishSessionLayerVisible = false
      this.isMyPublishPickListLayerVisible = false
      this.isMyVisitedPublishPickListLayerVisible = false
      this.isOrderPickListLayerVisible = false
      this.isReAskActionShow = false
    },
    sendUserEditingMsg (e) {
      if (!e) return
      const { target = {} } = e
      const { value } = target
      this.imClientMgr.sendEditingMsg(value)
    },
    onSendImage (url) {
      if (!url) return
      this.sendUserMsg({ text: url }, imUIMsgType.NORMAL_PIC)
      this.lego('UPLOAD_PHOTOS_SUCCESS')
    },

    reSetupSocket () {
      // 判断当前用户是否为实名登录
      if (!this.isRealLoginSocket) {
        // this.imClientMgr.sendQuit()
        // CurrentConversation.instance.clearCurrent()
        this.cancelAnonymous = 1
        this.initIMClient(this.cancelAnonymous)
      }
    },
    onLaunchAlbum () {
      forceLogin().then(() => {
        // 断开socket 然后重新建立socket连接
        this.reSetupSocket()
        this.lego('LAUNCH_ALBUM')
        // 小程序上传5张以上图片会有些问题
        uploadPhotos({
          maxAllowCount: isMiniProgram() ? 4 : 9,
          callbackLoading: (showLoading) => {
            this.showLoading = showLoading
          }
        })
          .then((pics) => {
            pics &&
                pics.forEach((p) => {
                  this.sendUserMsg({ text: p }, imUIMsgType.NORMAL_PIC)
                })
            this.lego('UPLOAD_PHOTOS_SUCCESS')
          })
          .catch((err) => {
            this.sendLegoErr('uploadphotos_fail')
            console.error(err)
          })
      })
    },
    onTakeShot () {
      forceLogin().then(() => {
        this.reSetupSocket()
        // 拍摄()
        getSystemCamera({
          callbackLoading: (showLoading) => {
            this.showLoading = showLoading
          }
        })
          .then((pics) => {
            pics &&
                pics.forEach((p) => {
                  this.sendUserMsg({ text: p }, imUIMsgType.NORMAL_PIC)
                })
            this.lego('UPLOAD_PHOTOS_SUCCESS')
          })
          .catch((err) => {
            this.sendLegoErr('uploadphotos_fail')
            console.error(err)
          })
      })
    },
    onRecordVideo () {
      forceLogin().then(() => {
        this.reSetupSocket()
        // 录像()
        getVideoRecorder({
          callbackLoading: (showLoading) => {
            this.showLoading = showLoading
          }
        }).then((ret) => {
          // 将视频转化为视频消息
          this.sendUserMsg({ text: ret }, imUIMsgType.NORMAL_VIDEO)
        })
      })
    },
    onLaunchGoodsPage () {
      // forceLogin().then(() => {
      //   this.reSetupSocket()
      this.lego('LAUNCH_GOODS')
      this.isMyPublishPickListLayerVisible = true
      this.isOverlayLock = false
      // })
    },
    onLaunchGoodsVisitedPage () {
      forceLogin()
        .then(() => {
          this.reSetupSocket()
          this.lego('LAUNCH_GOODS')
          this.isMyVisitedPublishPickListLayerVisible = true
          this.isOverlayLock = false
        })
        .catch((e) => {
          alert('登录失败~1')
        })
    },
    onLaunchOrderPage () {
      forceLogin().then(() => {
        this.reSetupSocket()
        this.lego('LAUNCH_ORDER')
        this.isOrderPickListLayerVisible = true
        this.isOverlayLock = false
      })
    },
    // 发送评价消息到消息流
    onAddEvaluationMsg () {
      forceLogin().then(() => {
        this.reSetupSocket()
        this.lego('EVALUATION_CLICK')
        this.addToChatList({
          imMsgType: imUIMsgType.INTERACT_EVALUATION,
          avatar: this.kefuAvatar,
          fromSelf: false,
          sendTime: Date.now(),
          showTime: true
        })
        this.closeExtensionArea()
      })
    },
    // 点击了商品
    goodsSelected (item) {
      console.info(`select type: ${item.type}, id: ${item.id}`, item)
      this.isMyPublishPickListLayerVisible = false
      this.sendUserMsg(
        {
          text: item.id,
          info: item
        },
        imUIMsgType.GOODS
      )
    },
    // 点击了足迹中的商品
    goodsVisitedSelected (item) {
      const { productType } = item
      this.isMyVisitedPublishPickListLayerVisible = false
      this.sendUserMsg(
        {
          text: item.id,
          info: item
        },
        imUIMsgType.GOODS,
        { productType }
      )
    },
    // 点击了订单
    orderSelected (item) {
      console.info(
        `select type: ${item.type}, id: ${item.id}, orderType: ${item.orderType}`,
        item
      )
      this.isOrderPickListLayerVisible = false
      this.sendUserMsg(
        {
          text: item.id,
          info: item
        },
        imUIMsgType.ORDER,
        { orderType: item.orderType }
      )
    },
    // 反问弹层 选择后
    reAskSelected (item) {
      this.isReAskActionShow = false
      this.isOverlayLock = false
      if (item.imMsgType === imUIMsgType.RE_ASK_SHOW_ORDER) {
        this.sendUserMsg(
          {
            text: item.id,
            info: item
          },
          imUIMsgType.RE_ASK_SHOW_ORDER,
          {
            ...(item.customUiType ? { customUiType: item.customUiType } : {})
          }
        )
      } else if (item.imMsgType === imUIMsgType.RE_ASK_SHOW_BIZ) {
        this.sendUserMsg(
          {
            text: item.bizName,
            info: item
          },
          imUIMsgType.RE_ASK_SHOW_BIZ,
          { businessId: item.bizId }
        )
      } else if (item.imMsgType === imUIMsgType.RE_ASK_SHOW_QUESTION) {
        this.sendUserMsg(
          {
            text: item.text,
            info: item
          },
          imUIMsgType.RE_ASK_SHOW_QUESTION
        )
      }
    },
    // 雅典娜选择其他订单/业务线 选择后
    fetchPopUpSelected (item) {
      this.fetchPopUpShow = false
      this.isOverlayLock = false
      if (item.popUpActionType === 'order') {
        this.sendUserMsg(
          {
            text: item.id,
            info: item
          },
          {},
          {
            sendAthenaOrderMsg: true,
            businessId: item.businessId,
            ...(item.customUiType ? { customUiType: item.customUiType } : {})
          }
        )
      } else if (item.popUpActionType === 'business') {
        this.sendUserMsg(
          {
            text: item.bizName,
            info: item
          },
          {},
          {
            sendAthenaBizMsg: true,
            businessId: item.bizId
          }
        )
      }
    },
    fetchPopUpClosed () {
      this.isOverlayLock = false
      this.fetchPopUpShow = false
    },
    leaveMessagePopUpClosed () {
      console.log('取消留言弹窗')
      this.leaveMessagePopUpShow = false
      this.leaveMessageId = ''
      this.leaveMessageList = []
    },
    // 用户选择回复留言
    leaveMessageConfirm (id) {
      console.log(id)
      this.imClientMgr.sendUserLeaveMessageConfrimCov(id)
      this.leaveMessagePopUpClosed()
    },
    // 富文本消息点击
    richTextClicked (e) {
      const target = e.target
      if (!target) return
      // 如果点击图片，则放大
      if (target.nodeName.toLowerCase() == 'img') {
        // 这里的图片路径由后端处理，不使用setPicSize，图片路径存在没有后缀名的情况，使用会报错
        const picUrl = target.getAttribute('src')
        this.bigPicUrl = picUrl
        this.isBigPicsVisible = true
      }
    },
    robotOptionClicked (text) {
      this.lego('MSG_OPTION_CLICK')
      this.sendUserMsg({ text: text }, imUIMsgType.NORMAL_TEXT)
    },
    robotLinkClicked (url) {
      this.lego('MSG_LINK_CLICK')
      native.skipToUrl({
        targetUrl: url
      })
    },
    transferToRengong (param) {
      const skill = typeof param === 'object' ? param.skillId : param
      this.lego('TRANSFER_RENGONG_CLICK', {
        skill: skill
      })
      //  机器人模式下，发送请求排队消息，转移到指定人工技能组，或 skill 为空，当前技能组
      console.info('robot to rengong: ', skill)
      console.log('当前用户交互状态', this.state)
      if (this.isIdleState) {
        this.imClientMgr.requestQueue(param)
      }
    },
    // 发送消息句柄
    sendTextMsg () {
      if (this.disabledInput) return
      this.lego('SEND_CLICK')
      if (this.msgTxt.length > 600) {
        toast({
          msg: '发送消息过长',
          position: 'bottom',
          style: '2',
          forceHtml: true
        })
        return
      }
      if (this.msgTxt.trim()) {
        console.log(`SEND TEXT MSG ${imUIMsgType.NORMAL_TEXT}`)
        this.sendUserMsg({ text: this.msgTxt }, imUIMsgType.NORMAL_TEXT)
      } else {
        toast({
          msg: '发送内容不能为空',
          style: '2'
        })
      }
      this.msgTxt = ''
      this.$nextTick(() => {
        this.updateTxtBoxHeight()
      })
    },
    addEmoji (emoji) {
      this.lego('EMOJI_CLICK')
      this.msgTxt = this.msgTxt + emoji
      this.$nextTick(() => {
        this.updateTxtBoxHeight()
      })
    },
    // 用户发送socket消息
    sendUserMsg (item, type, otherParams) {
      console.log(`send sockect msg:::: item: ${item}, type: ${type}} `)
      this.lego('SEND_MSG', {
        type: type
      })
      let sendTime = 0
      if (otherParams && otherParams.sendAthenaOrderMsg) {
        sendTime = this.imClientMgr.sendAthenaOrderMsg(item.text, { ...otherParams })
      } else if (otherParams && otherParams.sendAthenaBizMsg) {
        sendTime = this.imClientMgr.sendAthenaBizMsg(item.text, { ...otherParams })
      } else if (this.isIdleState && !this.isRobotMode) {
        this.lego('REQUEST_QUEUE_MSG')
        sendTime = this.imClientMgr.requestQueue(
          item.text,
          convertMsgType_UIToRaw(type),
          otherParams
        )
      } else {
        this.lego('SEND_NORMAL_MSG')
        this.saveCurUserText(item.text, type)
        sendTime = this.imClientMgr.sendNormalMsg(
          item.text,
          convertMsgType_UIToRaw(type),
          otherParams
        )
      }
      const msg = {
        fromSelf: true,
        avatar: this.avatar,
        imMsgType: type,
        sendTime: sendTime,
        text: XssFilter(item.text),
        info: item.info,
        showTime: true,
        ...(otherParams ? { otherParams } : {})
      }
      this.pushToSendingMsgList(msg)
      this.closeExtensionArea()
    },
    // 保存用户最近发送的一条消息内容
    saveCurUserText (text, type) {
      // 反问弹窗发出的消息不保存
      if (type !== imUIMsgType.RE_ASK_SHOW_ORDER && type !== imUIMsgType.RE_ASK_SHOW_BIZ) {
        this.curUserSendText = text
      }
      console.log('用户发送的最新一条消息内容：', text)
    },
    closePage () {
      native.wrap('close')()
    },
    // 滚动到聊天区域最下面
    scrollToBottom (animate) {
      // 滚动区域增大，适配评价
      if (!requestAnimationFrame || !animate) {
        setTimeout(() => {
          $('.msg-list-container').scrollTop = $('.msg-list-container').scrollHeight
          // 滚到底部后隐藏新消息提示
          this.messageTipFlag = false
        }, 0)
      } else {
        this.easeInScrollMove(500)
      }
    },
    // 滚动逻辑
    easeInScrollMove (duration) {
      const baseHeight = $('.msg-list-container').scrollTop
      const totalHeight = $('.msg-list-container').scrollHeight
      const aimHeight = totalHeight - baseHeight
      RAFMove(
        (process) => {
          $('.msg-list-container').scrollTop =
              baseHeight + parseInt(aimHeight * process * process)
        },
        () => {
          // 到达滚动设置时间后直接到底部
          $('.msg-list-container').scrollTop = totalHeight
          // 滚到底部后隐藏新消息提示
          this.messageTipFlag = false
        },
        duration
      )
    },
    // 点击图片
    picClicked (item) {
      const hl = this.historyList
        .filter((m) => m.imMsgType === imUIMsgType.NORMAL_PIC)
        .map((m) => setPicSize(m.text))
      const cl = this.chatList
        .filter((m) => m.imMsgType === imUIMsgType.NORMAL_PIC)
        .map((m) => setPicSize(m.text))
      const urls = hl.concat(cl)
      const picUrl = setPicSize(item.text)
      if (isZZApp() || this.platform == 'checkapp') {
        native.enlargeImage({
          imgUrls: urls.join('|'),
          selectedIndex: urls.indexOf(picUrl)
        })
      } else {
        this.bigPicUrl = picUrl
        this.isBigPicsVisible = true
      }
    },
    videoClicked (videoUrl) {
      this.showVideoPlayer = true
      this.curVideoString = videoUrl
    },
    // 点击大图
    bigPicClicked () {
      //  非转转 App 端内
      this.bigPicUrl = ''
      this.isBigPicsVisible = false
    },
    // 点击图片链接消息
    onImageLinkClick (item) {
      const { jumpUrl } = item
      native.wrap('skipToUrl')({
        targetUrl: jumpUrl
      })
      this.lego('IMAGE_LINK_MSG_CLICKED')
    },
    // 如果新收到的消息是图片链接消息,则先移除已有的图片链接消息
    removeImgLinkMessage (msg) {
      if (msg.imMsgType === imUIMsgType.PIC_LINK) {
        this.chatList = this.chatList.filter((item) => item.imMsgType !== imUIMsgType.PIC_LINK)
      }
    },
    /**
       * @description 手动添加消息到消息流中
       * @param isSysNew 是否是收到的服务端的消息
       */
    addToChatList (msg, isServerNew) {
      this.removeImgLinkMessage(msg)
      msg.msgId = msg.msgId || ''
      const lastMsg = this.chatList[this.chatList.length - 1]
      if (lastMsg && msg.sendTime - lastMsg.sendTime < 2 * 60 * 1000) {
        msg.showTime = false
      }
      this.chatList.push(msg)
      if (!this.isIdleState && this.state !== imUserState.NONE) {
        CurrentConversation.instance.addToCurrentConversation(msg)
      }

      this.$nextTick(() => {
        const box = $('.msg-list-container')
        // 如果是收到的系统的消息 判断现在消息框是滚动到底才执行新消息滚动
        if (isServerNew) {
          if (box.scrollTop + box.clientHeight >= box.scrollHeight - 100) {
            this.scrollToBottom(true)
          }
        } else {
          this.scrollToBottom(true)
        }
        this.showMessageTip()
        if (Number(msg.msgId)) {
          const newestMsgItem = $(`[data-msgid="${msg.msgId}"]`)
          if (newestMsgItem instanceof Element) {
            io.observe(newestMsgItem)
          } else {
            console.warn(`msg ${msg.msgId} is not a valid Message Element.`, newestMsgItem)
          }
        }
      })
    },
    pushToSendingMsgList (msg) {
      this.lego('SENDING_MSG')
      msg.isSending = true
      msg.sendFailed = false
      this.sendingList.push(msg)
      this.addToChatList(msg)
      setTimeout(() => {
        const item = this.sendingList.filter((m) => m.sendTime === msg.sendTime)[0]
        if (!item) return
        item.isSending = false
        item.sendFailed = true
        this.lego('SENDING_MSG_FAIL')
        console.info('send failed.\t', item.text || item.id)
      }, 3000)
    },
    resendMsg (msg) {
      this.lego('RESEND_MSG')
      const { productType } = msg
      const msg_item = this.chatList.filter((m) => m.sendTime === msg.sendTime)[0]
      const index = this.chatList.indexOf(msg_item)
      this.chatList.splice(index, 1)

      msg_item.isSending = true
      msg_item.sendFailed = false
      const info = msg && msg.info
      if (msg.otherParams && msg.otherParams.sendAthenaOrderMsg) {
        msg_item.sendTime = this.imClientMgr.sendAthenaOrderMsg(msg.text, { ...msg.otherParams })
      } else if (msg.otherParams && msg.otherParams.sendAthenaBizMsg) {
        msg_item.sendTime = this.imClientMgr.sendAthenaBizMsg(msg.text, { ...msg.otherParams })
      } else if (info && info.orderType) {
        // 修复重发订单报错，重发消息如果有orderType，带上orderType
        msg_item.sendTime = this.imClientMgr.sendNormalMsg(
          msg_item.text,
          convertMsgType_UIToRaw(msg_item.imMsgType),
          { orderType: info.orderType, productType }
        )
      } else {
        // 发送通用消息主逻辑
        msg_item.sendTime = this.imClientMgr.sendNormalMsg(
          msg_item.text,
          convertMsgType_UIToRaw(msg_item.imMsgType),
          { productType }
        )
      }
      this.addToChatList(msg_item)

      setTimeout(() => {
        const item = this.sendingList.filter((m) => m.sendTime === msg_item.sendTime)[0]
        if (!item) return
        item.isSending = false
        item.sendFailed = true
        this.lego('RESEND_MSG_FAIL')
        console.info('resend failed.\t', item.text || item.id)
      }, 3000)
    },
    // 拉历史消息
    fetchHistory (resolve) {
      this.lego('FETCH_HISTORY', {
        pageNo: this.historyPageNo,
        isRobot: this.isIdleState
      })
      chatHistory({
        pageNo: this.historyPageNo++
      })
        .then((data) => {
          if (
            data.messages &&
              data.messages instanceof Array &&
              data.messages.length === 0 &&
              data.subCid === null
          ) {
            this.lego('FETCH_HISTORY_ZERO', {
              pageNo: this.historyPageNo
            })
            this.hasMoreHistory = false
          }

          const containerElem = $('.msg-list-container')
          const scrollBottom = containerElem.scrollHeight - containerElem.scrollTop

          const historyMsg = []
          data.messages &&
              data.messages instanceof Array &&
              data.messages.forEach((item) => {
                const msg = item && convertHistoryMsg(item)
                historyMsg.unshift(JSON.parse(JSON.stringify(msg || {})))
                if (msg) {
                  if (msg.fromSelf) {
                    msg.avatar = msg.avatar || this.avatar
                  } else {
                    msg.avatar = msg.avatar || this.kefuAvatar
                  }
                  msg.showTime = true
                  msg.isHistory = true

                  const firstMsg = this.historyList[0]
                  // firstMsg && console.info(`del: ${firstMsg.sendTime - msg.sendTime}`);
                  if (firstMsg && firstMsg.sendTime - msg.sendTime < 2 * 60 * 1000) {
                    firstMsg.showTime = false
                  }
                  this.historyList.unshift(msg)
                }
              })

          console.info(`data.conversationType: ${data.conversationType}`)
          if (data.conversationType === historyConvType.PERSON) {
            this.historyList.unshift({
              imMsgType: imUIMsgType.CONVERSATION_NOTE,
              text: `连线人工客服${data.kefuName}`
            })
          } else if (data.conversationType === historyConvType.ROBOT) {
            this.historyList.unshift({
              imMsgType: imUIMsgType.CONVERSATION_NOTE,
              text: `咨询智能客服`
            })
          } else if (data.conversationType === historyConvType.LEAVE_MESSAGE) {
            this.historyList.unshift({
              imMsgType: imUIMsgType.CONVERSATION_NOTE,
              text: `智能服务留言`
            })
          }
          setTimeout(() => {
            containerElem.scrollTop = containerElem.scrollHeight - scrollBottom - 40
          }, 0)

          resolve()
        })
        .catch((err) => {
          this.sendLegoErr('fetch_history')
          resolve()
          console.error(err)
        })
    },
    // 拉当前消息
    fetchCurrent (callback) {
      this.lego('FETCH_CURRENT')
      chatHistory({
        pageNo: 0
      })
        .then((data) => {
          if (!(data.messages && data.messages instanceof Array && data.messages.length >= 0)) {
            this.lego('FETCH_CURRENT_ZERO')
            // 没有数据也处理是否显示机器人卡片
            this.dealIsDisplayRobotCard({ type: 'history' })
            return
          }
          // 遍历历史消息
          const list = []
          data.messages.forEach((item) => {
            const msg = item && convertHistoryMsg(item)
            if (msg) {
              if (msg.fromSelf) {
                msg.avatar = msg.avatar || this.avatar
              } else {
                msg.avatar = msg.avatar || this.kefuAvatar
              }
              msg.showTime = true
              msg.isHistory = true

              if (list.length > 0) {
                const firstMsg = list[0]
                // firstMsg && console.info(`del: ${firstMsg.sendTime - msg.sendTime}`);
                if (firstMsg && firstMsg.sendTime - msg.sendTime < 2 * 60 * 1000) {
                  firstMsg.showTime = false
                }
              }
              list.unshift(msg)
            }
          })

          if (data.conversationType === historyConvType.PERSON) {
            //  客服接入提示卡片
            if (this.isInConversation) {
              list.unshift({
                imMsgType: imUIMsgType.IN_SERVICE_NOTE,
                text: `客服${data.kefuName}正在为您服务`
              })
            }
          }

          callback && callback(list)
        })
        .catch((err) => {
          this.sendLegoErr('fetch_current')
          console.error(err)
        })
    },
    // 初始化
    initIMClient (cancelAnonymous) {
      // 判断当前用户是否为实名创建socket连接
      if (isRealLogin()) {
        // 如果用户当前已经使用转转实名登录,则标记当前socket连接已经是实名制
        this.isRealLoginSocket = true
      }
      const query = queryParams()
      query.clientid = null
      query.__tt = null
      console.info(
        `query: `,
        Object.keys(query)
          .map((k) => `${k}=${query[k]}`)
          .join('&')
      )
      this.imClientMgr.setup(skillId, robot, query, cancelAnonymous)

      io = null // 重新初始化io
      // 可视区域判断已读未读
      io = new window.IntersectionObserver(
        (entries) => {
          // console.info(entries);
          const msgIds = []
          entries.forEach((entry) => {
            const target = entry.target
            const hasRead = Boolean(target.getAttribute('data-read'))
            if (hasRead) return
            target.setAttribute('data-read', true)
            io.unobserve(target)

            const msgId = target.getAttribute('data-msgid')
            if (!Number(msgId)) return
            msgIds.push(msgId)
          })
          this.imClientMgr.sendMsgesRead(msgIds)
        },
        {
          threshold: [0.3]
        }
      )
      io.POLL_INTERVAL = 100
      // 收到消息
      this.imClientMgr.onIMMsg((msg) => {
        // 关闭接口loading
        this.showInterfaceLoading = false
        this.lego('MSG_RECIEVED')
        msg.fromSelf = false
        if (!msg.fromSelf) {
          this.kefuAvatar = setPicSize(msg.avatar) || this.kefuAvatar
        }
        // msg.avatar = this.kefuAvatar
        msg.showTime = true
        // 收到客服转移会话的消息重新拉取技能组配置信息接口
        if (msg.pkgType && msg.pkgType === packageType.TRANSFER_SESSION) {
          this.getSkillConfig()
        }
        this.addToChatList(msg, true)

        this.dealIsDisplayRobotCard({ type: 'ws' })
        // 处理是否是触发动作的消息（反问动作弹框、雅典娜选择其他订单弹框）
        this.dealIsActionMsg(msg)
        // 底部悬浮按钮逻辑
        this.dealBottomAreaShow(msg)
      })
      // 撤回消息
      this.imClientMgr.onMsgRetract((msg) => {
        this.lego('RETRACT_MSG')
        const item = this.chatList.filter((m) => m.msgId === msg.msgId)[0]
        if (!item) return
        const index = this.chatList.indexOf(item)
        this.chatList.splice(index, 1)
      })
      // 初始化消息
      this.imClientMgr.onInitialMsg((msg) => {
        this.avatar = setPicSize(msg.avatar)
        this.isRobotMode = msg.isRobotMode
        this.noteLastConv = msg.noteLastConv
        if (msg.text) {
          this.addToChatList(msg, true)
          // 关闭接口loading
          this.showInterfaceLoading = false
        }
        this.dealIsDisplayRobotCard({ type: 'ws' })
        this.lego('IM_INITED')
      })
      // 状态改变
      this.imClientMgr.onStateChange((obj) => {
        let lower5_2 = false
        if (vers && ((vers[0] === 5 && vers[1] < 2) || vers[0] < 5)) {
          lower5_2 = true
        }
        this.state = obj.state
        if (this.isInConversation) {
          this.getSkillConfig() // 进线拉取技能组配置
        }
        // 处理各种状态的native后退拦截弹窗事件
        this.wrapNativeBack()
        if (this.isInQueue) {
          this.lego('IM_INQUEUE')
          this.$nextTick(() => {
            const queue_msg_item = this.chatList.filter(
              (m) => m.imMsgType === imUIMsgType.QUEUE_STATE
            )[0]
            if (queue_msg_item) {
              queue_msg_item.waitNum = obj.waitNum
              queue_msg_item.waitText = obj.text || ''
            }
            this.scrollToBottom()
          })
        }
      })
      // 消息回执
      this.imClientMgr.onMsgAck((ack) => {
        const item = this.sendingList.filter((m) => m.sendTime === ack.sendTime)[0]
        if (!item) return
        item.isSending = false
        item.sendFailed = false
        item.msgId = ack.msgId
        const index = this.sendingList.indexOf(item)
        this.sendingList.splice(index, 1)
      })
      // 会话关闭
      this.imClientMgr.onSessionClose(() => {
        this.isFinishSessionLayerVisible = true
        this.lego('SESSION_CLOSED')
        CurrentConversation.instance.clearCurrent()
        // 用于解决软键盘吊起后的弹窗失焦后，软键盘收起但是页面没掉下去的bug
        window.scrollTo(0, document.documentElement.clientHeight)
      })

      this.imClientMgr.onSystemControl(() => {
        console.log('系统控制消息到达')
        this.disabledInput = true
      })

      this.imClientMgr.onLeaveMessage((msgObj) => {
        const { text, guestbookMsgList, guestbookStatus } = msgObj.content.data || {}
        console.log('触发留言消息', msgObj)
        this.leaveMessageId = text
        this.leaveMessageList = guestbookMsgList
        this.leaveMessageStatus = guestbookStatus
        this.leaveMessagePopUpShow = true
      })

      // 下一次宏任务再请求接口，兼容4g下网速快，IntersectionObserver还没创建好的情况
      setTimeout(() => {
        // 获取当前会话历史消息
        this.fetchCurrent((currList) => {
          // 关闭接口loading
          this.showInterfaceLoading = false
          for (let i = currList.length - 1; i >= 0; i--) {
            const item = currList[i]
            this.chatList.unshift(item)
            this.$nextTick(() => {
              if (Number(item.msgId)) {
                const newestMsgItem = $(`[data-msgid="${item.msgId}"]`)
                if (newestMsgItem instanceof Element) {
                  io.observe(newestMsgItem)
                } else {
                  console.warn(`msg ${item.msgId} is not a valid Message Element.`, newestMsgItem)
                }
              }
            })
          }
          this.dealIsDisplayRobotCard({ type: 'history' })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        })
      }, 0)
    },
    initWindowEvent () {
      // 滚动函数防抖
      this.easeInScrollMove = debounce(this.easeInScrollMove, 150, true)
      this.sendUserEditingMsg = debounce(this.sendUserEditingMsg, 300, false)
      this.dealScrollHeight = debounce(this.dealScrollHeight, 200, false)
      // 监听用户息屏事件
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState == 'hidden') {
          console.log('用户息屏')
        } else {
          // 如果正在和客服通话，重新唤起屏幕，更新最新历史消息
          if (this.isInConversation) {
            setTimeout(() => {
              // 更新当前会话历史消息
              this.refreshCurrentAndScroll()
            }, 200)
          }
        }
      })
      // 用于安卓吊起软键盘后，滚动到底部
      window.addEventListener('resize', () => {
        this.scrollToBottom()
      })

      $('.msg-list-container').addEventListener('scroll', () => {
        this.dealScrollHeight()
      })

      // 切克没有挂断按钮
      if (this.platform !== 'checkapp') {
        // 初始化挂断按钮的拖动函数，拖动完毕后判断按钮所在位置执行自动回位动画
        initHangUpMove(this.$refs.hangupIcon, this.docWidth, this.docHeight, this.hangup)
      }
    },
    refreshCurrentAndScroll () {
      this.fetchCurrent((currList) => {
        this.chatList = []
        for (let i = currList.length - 1; i >= 0; i--) {
          const item = currList[i]
          this.chatList.unshift(item)
          this.$nextTick(() => {
            if (Number(item.msgId)) {
              const newestMsgItem = $(`[data-msgid="${item.msgId}"]`)
              if (newestMsgItem instanceof Element) {
                io.observe(newestMsgItem)
              } else {
                console.warn(`msg ${item.msgId} is not a valid Message Element.`, newestMsgItem)
              }
            }
          })
        }
        this.dealIsDisplayRobotCard({ type: 'history' })
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })
    },
    //  会话状态控制
    quitQueue (isAppQuit) {
      this.lego('QUIT_QUEUE', {
        type: isAppQuit ? 'app_back' : 'm'
      })
      this.imClientMgr.sendQuit()
      CurrentConversation.instance.clearCurrent()
      this.closePage()
    },
    quitAndHoldQueue () {
      this.lego('QUIT_HOLD_QUEUE')
      this.closePage()
    },
    quitConv () {
      this.lego('QUIT_SESSION', {
        type: 'm'
      })
      this.imClientMgr.sendQuit()
      this.state = imUserState.IDLE
      CurrentConversation.instance.clearCurrent()
      this.closePage()
      this.isQuitConvDialogVisible = false
    },
    holdConv () {
      this.lego('QUIT_KEEP_SESSION', {
        type: 'm'
      })
      this.imClientMgr.sendQuitKeepSession()
      this.isQuitConvDialogVisible = false
      this.closePage()
    },
    closeQuitConvDialog () {
      this.lego('CLOSE_HANGUP_DIALOG')
      this.isQuitConvDialogVisible = false
    },
    closeQuitQueueDialog () {
      this.lego('CLOSE_QUEUE_DIALOG')
      this.isQuitQueueDialogVisible = false
    },
    hangup () {
      this.lego('HANGUP_CLICK')
      this.isQuitConvDialogVisible = true
    },
    confirmQuitQueue () {
      this.lego('QUIT_QUEUE_CLICK')
      this.isQuitQueueDialogVisible = true
    },
    wrapNativeBack () {
      let lower5_2 = false
      if (vers && ((vers[0] === 5 && vers[1] < 2) || vers[0] < 5)) {
        lower5_2 = true
      }
      if (this.isInQueue) {
        const config = {
          title: '退出提示',
          content: '现在退出排队会导致会话结束，如您再次申请人工服务需要重新排队，请您三思哦~',
          imageStyle: '3', // 0:顶部小 1: 顶部大 2: 标题与内容中间 3: 无图片 4:全图片
          popStyle: '0',
          btns: [
            {
              btnClick: lower5_2 ? '1' : '0', // 0：关闭弹窗，1：关闭页面，2：仅回调
              isHighLight: '0',
              btnText: '狠心退出'
            },
            {
              btnClick: '0',
              isHighLight: '1',
              btnText: '继续排队'
            }
          ],
          source: 'kefu_im',
          alwaysShow: '1'
        }
        native.wrap('setBackInterceptPop')(config, (res) => {
          console.info('back res:', res)
          if (res && res.clickType === 'left') {
            this.quitQueue(true)
          }
        })
      } else if (this.isInConversation) {
        this.lego('IM_INSESSION')
        const config = {
          title: '您需要结束人工对话吗？',
          imageStyle: '3',
          popStyle: '0',
          btns: [
            {
              btnClick: lower5_2 ? '1' : '0',
              isHighLight: '0',
              btnText: '确认退出'
            },
            {
              btnClick: lower5_2 ? '1' : '0',
              isHighLight: '1',
              btnText: '保持3分钟'
            }
          ],
          source: 'kefu_im',
          alwaysShow: '1'
        }
        native.wrap('setBackInterceptPop')(config, (res) => {
          if (res && res.clickType === 'right') {
            this.imClientMgr.sendQuitKeepSession()
            this.lego('QUIT_KEEP_SESSION', {
              type: 'app_back'
            })
            native.wrap('close')()
          } else if (res && res.clickType === 'left') {
            this.imClientMgr.sendQuit()
            CurrentConversation.instance.clearCurrent()
            this.lego('QUIT_SESSION', {
              type: 'app_back'
            })
            native.wrap('close')()
          }
        })
      } else if (this.isIdleState) {
        this.lego('IM_INIDLE')
        CurrentConversation.instance.clearCurrent()
        native.wrap('cancelBackInterceptPop')({}, (res) => {
          console.log('cancelBackInterceptPop:', res)
        })
      }
    },
    // 自动滚动提示处理
    dealScrollHeight () {
      const container = $('.msg-list-container')
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
    // 更新接口返回状态，以便处理是否显示机器人接入卡片
    dealIsDisplayRobotCard (info) {
      if (info && info.type) {
        if (info.type == 'ws' && this.robotCardState.wsState == 0) {
          this.robotCardState = Object.assign({}, this.robotCardState, { wsState: 1 })
        }
        if (info.type == 'history') {
          this.robotCardState = Object.assign({}, this.robotCardState, { historyState: 1 })
        }
      }
    },
    dealIsActionMsg (msg) {
      // 是否是反问动作消息(问订单、问业务线、问问题)
      if (
        msg.imMsgType === imUIMsgType.RE_ASK_SHOW_ORDER ||
          msg.imMsgType === imUIMsgType.RE_ASK_SHOW_BIZ ||
          msg.imMsgType === imUIMsgType.RE_ASK_SHOW_QUESTION
      ) {
        this.reAskOptData = msg
        this.isReAskActionShow = true
        // 锁定蒙层不让关闭
        this.isOverlayLock = true
        return
      }
      // 雅典娜推荐选择其他订单动作弹窗消息
      if (msg.imMsgType === imUIMsgType.ATHENA_CHOOSE_ORDER) {
        this.chooseOtherOrderBizId = msg.businessId
        this.fetchActionType = 'order'
        this.isOverlayLock = true
        this.fetchPopUpShow = true
      }
    },
    dealBottomAreaShow (msg) {
      // 根据最新一条雅典娜消息判断订单和业务线选择按钮是否显示 （机器人模式才显示）
      if (msg.imMsgType === imUIMsgType.ATHENA_RICH_TEXT && this.isIdleState) {
        const { showOrder, showBiz, businessId } = msg
        if (showBiz) {
          this.fetchActionType = 'business'
          this.bottomBtnConfig[1].display = true
        } else {
          this.bottomBtnConfig[1].display = false
        }
        if (showOrder) {
          this.chooseOtherOrderBizId = businessId
          this.fetchActionType = 'order'
          this.bottomBtnConfig[0].display = true
        } else {
          this.bottomBtnConfig[0].display = false
        }
      }
    },
    // 吸底按钮区域按钮点击
    handleFixedAreaClick (index) {
      const btn = this.bottomBtnConfig[index]
      btn.callback()
    },
    initEventBus () {
      // 接受eventbus来的消息
      Eventbus.$on('like', (likeobj) => {
        if (!likeobj.islike) {
          console.log('点击了不喜欢')
          // 无用反馈
          this.addToChatList({
            imMsgType: imUIMsgType.COLLECT_EVALUATION,
            avatar: this.kefuAvatar,
            fromSelf: false,
            sendTime: Date.now(),
            showTime: true,
            precontext: likeobj.context
          })
          this.closeExtensionArea()
        }
      })
      // 雅典娜转人工点击
      Eventbus.$on('rengong-click', (param) => {
        this.transferToRengong(param)
      })
    },
    // 兼容ios13软键盘收起后页面不回弹
    fixIOSKeyBoardBug () {
      window.scrollTo(0, window.pageYOffset)
    },
    async getSkillConfig () {
      const res = await getSkillConfigByCurrentConv({})
      if (!res) return
      const { data = {} } = res
      const { userCloseConvSwitch } = data
      this.userCloseConvSwitch = +userCloseConvSwitch === 1
    },
    showMessageTip () {
      const container = $('.msg-list-container')
      if (container.scrollHeight - container.scrollTop - container.clientHeight >= 800) {
        this.messageTipFlag = true
      }
    },
    // 找靓机匿名转登录后url会带上token，这时候socket url上得打上标
    dealZljHtmlAnoymousLogin () {
      const urlToken = queryParams().token || ''
      // 找靓机登录后登录信息是以token带在Url上的。判断其已经带上，再调adapter
      if (urlToken && urlToken.indexOf('UID') > -1) {
        this.cancelAnonymous = 1
      }
    }
  },
  mounted () {
    closeZljRefresh()
    hideShareButton()
    native.setTitle({
      title: '在线客服'
    })
    this.lego('PAGE_SHOW')
    this.dealZljHtmlAnoymousLogin()
    choiceLogin()
      .then(() => {
        this.lego('LOGIN_SUCCESS')
        this.initIMClient(this.cancelAnonymous)
        // 初始化消息监听
        this.initEventBus()
        // 注册页面事件
        this.initWindowEvent()
        //  set keyboard
        if (window.navigator.userAgent.indexOf('Android') > -1) return
        native.wrap('setKeyboardFrameChangeCallback')((res) => {
          if (!res.kbState) return
          setTimeout(() => {
            document.body.scrollTop = document.body.scrollHeight
          }, 500)
          if (res.kbState === '1') {
            this.scrollToBottom()
          }
        })
      })
      .catch((err) => {
        this.sendLegoErr('login')
        console.error(err)
        //  用户取消，直接关闭页面
        if (Number(err.code) === -1) {
          native.close()
          return
        }
        toast({
          msg: `${err.msg}\ncode: ${err.code}`,
          style: '2'
        })
      })
    $('.msg-area > textarea').blur()
  },
  beforeDestroy () {
    this.lego('PAGE_DESTROY')
    this.imClientMgr.close()
  },
  created () {
    this.checkStream()
  }
}
</script>

<style lang="less" scoped>
  @import 'Home.less';
</style>
