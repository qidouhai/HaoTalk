<template>
    <div class="text-msg-content" :style="{'--showleft':context.fromSelf?'hidden':'visible',
    '--showright':context.fromSelf?'visible':'hidden','background':context.fromSelf?'#43ad7f7f':'#F5F5DC'}" @click="onClick" v-html="context.context"></div>
</template>

<script>

export default ({
  name: 'text-msg-item',
  props: ['context'],
  methods: {
    // 如果用户输入的文本是url,则进行跳转
    onClick () {
      const { context } = this.context
      if (context && (context.indexOf('http') !== -1 || context.indexOf('https') !== -1)) {
        try {
          const url = new URL(context)
          window.open(url.href)
        } catch (error) {
          console.log(`转换url出错:${error}`)
        }
      }
    }
  }
})
</script>

<style lang="stylus">
  @import 'TextMsgItem.styl';
</style>
