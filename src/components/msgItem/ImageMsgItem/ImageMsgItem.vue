<template>
  <img class="image-msg" :src="imgUrl" @load="loaded" @click="clicked" />
</template>

<script>

export default {
  name: 'image-msg-item',
  props: ['context'],
  computed: {
    imgUrl () {
      return this.context.context
    }
  },
  methods: {
    loaded () {
      this.$emit('loaded')
    },
    clicked () {
      this.$emit('img-clicked', this.imgUrl)
    }
  }
}
</script>

<style scoped lang="stylus">
  @import 'ImageMsgItem.styl';
</style>
