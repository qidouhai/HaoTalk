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
import INDEXDB from '../../../libs/indexDB'
export default {
  name: 'video-msg-item',
  props: ['context'],
  data () {
    return {}
  },
  computed: {
    imgUrl () {
      const videoCoverString = this.context.context
      return videoCoverString
    }
  },
  methods: {
    loaded () {
      this.$emit('loaded')
    },
    clicked () {
      INDEXDB.getItem(this.context.sender + this.context.sendtime, (res) => {
        this.$emit('video-clicked', res)
      })
    }
  }
}
</script>

<style scoped lang="stylus">
  $px = 1 / 30rem;
  .image-msg-wrapper {
    position: relative;
    max-width: 255 * $px;
    .image-msg {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
