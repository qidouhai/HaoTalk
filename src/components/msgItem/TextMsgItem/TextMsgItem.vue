<template>
    <div class="text-msg-content" @click="onClick" v-html="context.text"></div>
</template>

<script>

export default {
  name: 'text-msg-item',
  props: ['context'],
  methods: {
    // 如果用户输入的文本是url,则进行跳转
    onClick () {
      const { text } = this.context
      if (text && (text.indexOf('http') !== -1 || text.indexOf('https') !== -1)) {
        try {
          const url = new URL(text)
          window.open(url.href)
        } catch (error) {
          console.log(`转换url出错:${error}`)
        }
      }
    }
  }
}
</script>

<style lang="stylus">
  @import 'TextMsgItem.styl';
</style>
