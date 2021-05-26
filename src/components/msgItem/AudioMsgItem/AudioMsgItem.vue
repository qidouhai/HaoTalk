<template>
   <div class="audio-msg-content" :style="{'--showleft':context.fromSelf?'hidden':'visible',
    '--showright':context.fromSelf?'visible':'hidden','background':context.fromSelf?'#43ad7f7f':'#F5F5DC'}" >
        <audio :src="context.context" ref="audio" style="display:none"></audio>
        <div class="self__audio">
            <div class="audio__duration"
            :style="{'--showleft':context.fromSelf?'left':'right'}">{{duration}}"</div>
            <div class="audio__trigger" @click="playAudioHandler"
            :style="{'--showreverse':context.fromSelf?'none':'scaleX(-1) ',
                     '--showleft':context.fromSelf?'right':'left'}">
                <div
                :class="{
                    'wifi-symbol':true,
                    'wifi-symbol--avtive':isPlaying
                }"
                >
                    <div class="wifi-circle first"></div>
                    <div class="wifi-circle second"></div>
                    <div class="wifi-circle third"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

export default({
  name: 'audio-msg-item',
  props: ['context'],
  data () {
    return {
      isPlaying: false,
      duration: ''
    }
  },
  methods: {
    playAudioHandler () {
      this.isPlaying = !this.isPlaying
      const player = this.$refs.audio
      if (this.isPlaying) {
        // player.load()
        player.play()
      } else {
        player.pause()
      }
    }
  },
  mounted () {
    const player = this.$refs.audio
    const vm = this
    player.oncanplay = function () {
      vm.duration = Math.ceil(player.duration)
    }
  }
})
</script>

<style lang="stylus" scoped>
    @import 'AudioMsgItem.styl';
</style>
