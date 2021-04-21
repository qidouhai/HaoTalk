<template>
  <div class="msg-item-base">
    <div
      v-if="(!isSpecialMsg) && context.sendtime && context.showTime"
      class="timestamp"
    >
      <span>{{ time }}</span>
    </div>

    <!-- 消息类型 -->
    <div v-if="!isSpecialMsg" class="base-container">
      <div
        class="avatar"
        :class="msgSide"
        :style="{'margin-right':!context.fromSelf && 0.6+'rem',
                'margin-left':context.fromSelf && 0.6+'rem'}"
      >
        <img :src="context.avatar" >
      </div>
      <!-- <div v-else-if="showAvatarHolder" class="avatar-holder"></div> -->
      <div class="base-content" :class="msgSide">
        <div v-if="showAvatarAndName" class="name">
          {{ context.name }}
          <span v-if="nameFlag !== ''">{{ nameFlag }}</span>
        </div>
        <slot></slot>
        <img
          v-show="context.fromSelf && isSending && !sendFailed"
          class="state"
          src="../../../assets/sending.gif"
        />
        <img
          v-show="context.fromSelf && sendFailed"
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
    <div v-if="isSysNote" class="sys-msg-note">
      <span>{{ context.context }}</span>
    </div>

  </div>
</template>

<script>
import { timeFormat } from '../../../libs/utils'
export default {
  name: 'msg-item-base',
  props: ['context'],
  data () {
    return {
    }
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
    isSysNote () {
      return this.context.msgtype === 'SYSTEM_NOTE'
    },
    isMixedPicTextMsg () {
      return this.context.msgtype === 'MIXED_PIC_TEXT'
    },
    isSpecialMsg () {
      return (
        this.isSysMsg || this.isMixedPicTextMsg || this.isSysNote
      )
    },
    time () {
      return timeFormat(this.context.sendtime, 'yyyy-mm-dd hh:MM') //  2018-02-21 16:20
    },
    nameFlag () {
      return this.context.msgTag || ''
    },
    // 显示头像和名称
    showAvatarAndName () {
      return false
      // return !this.context.fromSelf
    },
    showAvatarHolder () {
      return false
      // return !this.context.fromSelf
    },
    isSending () {
      return this.context.isSending
    },
    sendFailed () {
      return this.context.sendFailed
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
