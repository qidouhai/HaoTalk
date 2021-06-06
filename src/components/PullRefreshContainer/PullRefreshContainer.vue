<template>
  <div class="pull-refresh-container">
    <div class="content-wrapper" :style="{ transform: 'translateY(' + pullDist + 'px)' }">
      <div v-show="showRefreshNote" class="refresh-note">
        <div class="text">您上次的对话因超时被关闭，下拉可查看</div>
        <!-- <img class="pull-note" src="../../assets/pull_note.png" /> -->
      </div>
      <slot></slot>
    </div>
    <div class="top-state" :style="{ height: pullDist + 'px' }">
      <div v-show="isInPulling && canAction" class="state-info">继续下拉可加载历史消息</div>
      <div v-show="isInPulling && !canAction" class="state-info">没有更多历史消息了</div>
      <div v-show="isInPullingReady" class="state-info">释放加载</div>
      <div v-show="isInFetching" class="state-info">加载中...</div>
    </div>
  </div>
</template>

<script>

const pullRefreshState = {
  NONE: 0,
  PULLING: 0x1,
  // CANCEL: 0x2,
  PULLING_READY: 0x3,
  FETCHING: 0x4
  // FINISHED: 0xF
}

const READY_HEIGHT = 60

export default {
  name: 'PullRefreshContainer',
  props: {
    canAction: {
      type: Boolean,
      default: true
    },
    canRefresh: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      startY: 0,
      lastY: 0,
      canPulling: false,
      isPulling: false,
      pullDist: 0,
      pullState: pullRefreshState.NONE,
      showNoteInitVal: true
    }
  },
  computed: {
    isInPulling () {
      return this.pullState === pullRefreshState.PULLING
    },
    isInPullingReady () {
      return this.pullState === pullRefreshState.PULLING_READY
    },
    isInFetching () {
      return this.pullState === pullRefreshState.FETCHING
    },
    showRefreshNote () {
      return this.canRefresh && this.showNoteInitVal
    }
  },
  methods: {
    touchStart (e) {
      if (this.pullState !== pullRefreshState.NONE) return

      const container = document.querySelector('.pull-refresh-container')
      if (container.scrollTop === 0) {
        container.scrollTop += 1
      } else if (container.scrollTop + container.offsetHeight >= this.scrollHeight) {
        container.scrollTop -= 1
      }

      if (document.querySelector('.pull-refresh-container').scrollTop <= 1) {
        this.canPulling = true
      }

      this.lastY = this.startY = e.targetTouches[0].clientY
    },
    touchMove (e) {
      if (!this.canPulling) return

      const contentRect = document.querySelector('.content-wrapper').getBoundingClientRect()
      const currentY = e.targetTouches[0].clientY
      const lastY = this.lastY

      if (
        currentY <= lastY &&
          !(
            this.pullState === pullRefreshState.PULLING ||
            this.pullState === pullRefreshState.PULLING_READY
          )
      ) {
        return
      }

      if (this.pullState === pullRefreshState.NONE && currentY > lastY) {
        this.pullState = pullRefreshState.PULLING
      }

      this.lastY = currentY

      this.isPulling = contentRect.top > 0 || (contentRect.top <= 0 && currentY > lastY)

      if (!(this.canPulling && this.isPulling)) return

      const delY = currentY - lastY
      this.pullDist += delY

      if (this.pullDist < 0) {
        this.pullDist = 0
      } else if (this.pullDist > READY_HEIGHT && this.canAction) {
        this.pullState = pullRefreshState.PULLING_READY
        // console.log('pulling ready...', this.pullDist);
      } else {
        this.pullState = pullRefreshState.PULLING
        // console.log('pulling...', this.pullDist);
      }

      e.preventDefault()
    },
    touchEnd (e) {
      this.canPulling = false

      if (this.pullState === pullRefreshState.FETCHING) {
        return
      }

      if (this.pullState === pullRefreshState.PULLING) {
        this.pullDist = 0
        this.pullState = pullRefreshState.NONE
      }
      if (this.pullState === pullRefreshState.PULLING_READY) {
        this.pullDist = READY_HEIGHT
        this.pullState = pullRefreshState.FETCHING
        // eslint-disable-next-line
        let timeOut = false
        let done = false
        this.$emit('pull-ready', () => {
          done = true
          this.showNoteInitVal = false
          this.pullDist = 0
          this.pullState = pullRefreshState.NONE
        })
        setTimeout(() => {
          timeOut = true
          if (done) {
            this.pullDist = 0
            this.pullState = pullRefreshState.NONE
          }
        }, 1000)
        setTimeout(() => {
          if (done) return

          this.pullDist = 0
          this.pullState = pullRefreshState.NONE
          this.$toast.error(`拉取历史消息超时`)
        }, 3000)
      }
    }
  },
  mounted () {
    const container = document.querySelector('.pull-refresh-container')
    container.addEventListener('touchstart', this.touchStart, true)
    container.addEventListener('touchmove', this.touchMove, true)
    container.addEventListener('touchend', this.touchEnd, true)
  }
}
</script>

<style lang="stylus" scoped>
  @import 'PullRefreshContainer.styl';
</style>
