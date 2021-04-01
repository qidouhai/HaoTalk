<template>
  <img class="image-msg" :src="imgUrl" @load="loaded" @click="clicked" />
</template>

<script>

export default {
  name: 'image-msg-item',
  props: ['context'],
  computed: {
    imgUrl () {
      return this.context.text
    }
  },
  methods: {
    loaded () {
      this.$emit('loaded')
    },
    clicked () {
      this.$emit('img-clicked', this.context)
    }
  }
}
</script>

<style scoped lang="stylus">
  @import 'ImageMsgItem.styl';
</style>
