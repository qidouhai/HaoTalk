<template>
  <div class="mixed-wrap">
    <div class="mixed-wrap-img" :style="{ backgroundImage: `url('${imgUrl}')` }"></div>
    <div class="mixed-wrap-content">
      <p class="title">
        {{ infoData.title }}
        <span class="title-sub" @click="jumpToOtherPage">{{ infoData.linkDesc }}</span>
      </p>
      <p class="mixed-wrap-content-text">{{ infoData.msgContent }}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'mixed-pic-text-item',
  props: {
    context: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    infoData () {
      return this.context.infoData
    },
    imgUrl () {
      return this.infoData.picUrl
    }
  },
  methods: {
    jumpToOtherPage () {
      const targetUrl = this.infoData.linkUrl
      console.log(targetUrl)
      window.open(targetUrl)
    }
  }
}
</script>

<style scoped lang="stylus">
  @import 'index.styl';
</style>
