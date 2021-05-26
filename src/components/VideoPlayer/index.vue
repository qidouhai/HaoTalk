<template>
  <div>
    <div v-show="show" class="videoMask">
      <video
        ref="videoPlayer"
        class="video"
        webkit-playsinline
        playsinline
        x5-mse-live-streaming
        x-webkit-airplay="allow"
        controls
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        @play="getWidthAndHeight"
        @canplaythrough="getWidthAndHeight"
        @playing="showClose"
        @pause="showClose"
        @click="showClose"
      ></video>
      <div class="control" v-show="showControl">
        <mu-appbar style="width: 100%;" color="black">
          <mu-button icon slot="left" @click="hideVideo">
            <mu-icon value="clear"></mu-icon>
          </mu-button>
          <mu-button flat slot="right">
            <mu-icon value="menu"></mu-icon>
          </mu-button>
        </mu-appbar>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: () => {
        return false
      },
      required: true
    },
    videoUrl: {
      type: String,
      default: () => {
        return ''
      },
      required: true
    }
  },
  data () {
    return {
      curVideoUrl: '',
      playPromise: null,
      showControl: true
    }
  },
  computed: {
  },
  watch: {
    show (newValue) {
      if (newValue) {
        this.showVideo()
      }
    }
  },
  methods: {
    judgeUrlChange () {
      const pre = this.curVideoUrl.substring(this.curVideoUrl.length - 8)
      const now = this.videoUrl.substring(this.videoUrl.length - 8)
      return pre !== now
    },
    showClose () {
      this.showControl = !this.showControl
    },
    showVideo () {
      const playUrl = this.videoUrl
      if (this.judgeUrlChange()) {
        console.log('选择的视频改变！！')
        this.$refs.videoPlayer.innerHTML = ''
        this.curVideoUrl = playUrl
      }
      const node = document.createElement('source')
      while (this.$refs.videoPlayer.lastChild) {
        this.$refs.videoPlayer.removeChild(this.$refs.videoPlayer.lastChild)
      }
      node.src = playUrl
      // node.type = 'video/mp4'
      this.$refs.videoPlayer.appendChild(node)
      this.$refs.videoPlayer.load()
      this.playPromise = this.$refs.videoPlayer.play()
    },
    hideVideo () {
      if (this.playPromise) {
        this.playPromise
          .then(() => {
            this.closeVideoPlayer()
          })
          .catch((e) => {
            console.log('关闭视频时产生异常信息:', e)
          })
      } else {
        this.closeVideoPlayer()
      }
      this.$emit('hide')
    },
    closeVideoPlayer () {
      try {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.pause()
        }
      } catch (e) {
        console.log('closeVideoPlayer', e)
      }
    },
    getWidthAndHeight (e) {
      const width = e.target.videoWidth
      const height = e.target.videoHeight
      console.log('视频宽高：', width, height)
    }
  }
}
</script>
<style scoped lang="stylus">
$px = 1 / 75rem;
  .videoMask
    position: fixed;
    display: flex;
    display: -webkit-flex;
    display: -webkit-box;
    justify-content: center;
    align-items: center;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    z-index: 100000;
    background-color: rgba(0, 0, 0, 0.9);
    .video
      width: 100%;
    .control
      position absolute
      top 0
      width 100%
</style>
