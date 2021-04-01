<template>
  <div class="emoji-area">
    <div v-for="(emoji, index) in emojiList" :key="index" class="emoticon" @click="emojiClicked(emoji)">
      <span>{{ emoji }}</span>
    </div>
    <div class="empty"></div>
  </div>
</template>

<script>
export default {
  name: 'tool-box',
  data () {
    return {
      emojiList: [
        '😄',
        '😊',
        '😃',
        '😉',
        '😍',
        '😘',
        '😚',
        '😳',
        '😌',
        '😁',
        '😜',
        '😝',
        '😒',
        '😏',
        '😓',
        '😔',
        '😞',
        '😖',
        '😥',
        '😰',
        '😨',
        '😣',
        '😢',
        '😭',
        '😂',
        '😲',
        '😱',
        '😠',
        '😡',
        '😪',
        '😷',
        '👿',
        '👽',
        '💛',
        '💙',
        '💜',
        '💗',
        '💚',
        '❤',
        '💔',
        '💓',
        '💘',
        '✨',
        '🌟',
        '💢',
        '❕',
        '❔',
        '💤',
        '💨',
        '💦',
        '🎶',
        '🎵',
        '🔥',
        '💩',
        '👍',
        '👎',
        '👌',
        '👊',
        '✊'
      ]
    }
  },
  methods: {
    emojiClicked (emoji) {
      this.$emit('emoji-click', emoji)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import 'EmojiArea.styl'
</style>
