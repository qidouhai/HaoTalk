<template>
  <div>
    <!-- <video-player :video-url="videoUrl" :show="show" $hide="hideVideo" /> -->
    <div class="image-msg-wrapper">
      <img class="image-msg" :src="imgUrl" @load="loaded" @click="clicked" />
      <img class="video-icon" src="./images/video_play.png" @load="loaded" @click="clicked" />
    </div>
  </div>
</template>

<script>

export default {
  name: 'video-msg-item',
  props: ['context'],
  data () {
    return {
      show: false
    }
  },
  components: {
    // VideoPlayer,
  },
  computed: {
    imgUrl () {
      const [videoString, videoCoverString] = this.context.text && this.context.text.split('|')
      return videoCoverString
    },
    videoUrl () {
      const [videoString, videoCoverString] = this.context.text && this.context.text.split('|')
      return videoString
    }
  },
  methods: {
    loaded () {
      this.$emit('loaded')
    },
    clicked () {
      this.show = true
      this.$emit('video-clicked', this.videoUrl)
    }
    // hideVideo() {
    //   this.show = false
    // },
  }
}
</script>

<style scoped lang="stylus">
  $px = 1 / 75rem;
  .image-msg-wrapper {
    // display: flex;
    position: relative;
    width: 255 * $px;
    height: 255 * $px;
    .image-msg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      // max-width: 255 * $px;
      // height: auto;
    }
    .video-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 220 * 0.36 * $px;
      height: 200 * 0.36 * $px;
    }
  }
</style>
