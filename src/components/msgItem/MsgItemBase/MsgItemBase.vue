<template>
  <div class="msg-item-base">
    <div
      v-if="(!isSpecialMsg) && context.sendTime && context.showTime"
      class="timestamp"
    >
      <span>{{ timeFormat }}</span>
    </div>

    <!-- 消息类型 -->
    <div v-if="!isSpecialMsg" class="base-container">
      <div
        v-if="showAvatarAndName"
        class="avatar"
        :style="{ backgroundImage: `url(${context.avatar})` }"
      ></div>
      <div v-else-if="showAvatarHolder" class="avatar-holder"></div>
      <div class="base-content" :class="msgSide">
        <div v-if="showAvatarAndName" class="name">
          {{ context.name }}
          <span v-if="nameFlag !== ''">{{ nameFlag }}</span>
        </div>
        <slot></slot>
        <img
          v-show="context.fromSelf && context.isSending && !context.sendFailed"
          class="state"
          src="../../../assets/sending.gif"
        />
        <img
          v-show="context.fromSelf && context.sendFailed"
          class="state"
          src="../../../assets/send_fail.png"
          @click="resend"
        />
      </div>
      <div class="empty-clear"></div>
    </div>

    <!-- 系统消息 -->
    <div v-if="isSysMsg" class="sys-msg-content">
      <span>{{ context.text }}</span>
    </div>

    <!-- 系统提示 -->
    <div v-if="isConvNote" class="sys-msg-note">
      <span>{{ context.text }}</span>
    </div>

    <!-- 图文混排消息 -->
    <div v-if="isMixedPicTextMsg" class="mixed-pic-text">
      <MixedPicTextItem :context="context"></MixedPicTextItem>
    </div>
  </div>
</template>

<script>
import MixedPicTextItem from '../MixedPicTextItem'
import { timeFormat } from '../../../libs/utils'
export default {
  name: 'msg-item-base',
  props: ['context'],
  data () {
    return {
    }
  },
  components: {
    MixedPicTextItem
  },
  computed: {
    msgSide () {
      return {
        'float-left': !this.context.fromSelf,
        'float-right': this.context.fromSelf
      }
    },
    avatar () {
      return this.context.avatar
    },
    // 是否系统消息
    isSysMsg () {
      return this.context.msgtype === 'SYSTEM'
    },
    isConvNote () {
      return this.context.msgtype === 'CONVERSATION_NOTE'
    },
    isMixedPicTextMsg () {
      return this.context.msgtype === 'MIXED_PIC_TEXT'
    },
    isSpecialMsg () {
      return (
        this.isSysMsg || this.isMixedPicTextMsg || this.isConvNote
      )
    },
    timeFormat () {
      return timeFormat(new Date(this.context.sendTime), 'YYYY-MM-DD HH:mm') //  2018-02-21 16:20
    },
    nameFlag () {
      return this.context.msgTag || ''
    },
    // 显示头像和名称
    showAvatarAndName () {
      return true
      // return !this.context.fromSelf
    },
    showAvatarHolder () {
      return false
      // return !this.context.fromSelf
    }
  },
  methods: {
    scrollToBottom () {
      this.$emit('scrollToBottom', true)
    },
    resend () {
      this.$emit('resend')
    }
  }
}
</script>

<style scoped lang="stylus">
  @import 'MsgItemBase.styl';
</style>
