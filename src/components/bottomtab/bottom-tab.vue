<template>
  <mu-bottom-nav :value="bottomNav" @change="handleChange" class="bottom-tab">
    <mu-badge circle color="secondary" content="0" class="badge" >
      <mu-bottom-nav-item value="消息" title="消息" icon="chat_bubble_outline" replace to="/message"/>
    </mu-badge>
    <mu-badge circle color="secondary" content="1" class="badge">
      <mu-bottom-nav-item value="朋友" title="朋友" icon="people" replace to="/friends"/>
    </mu-badge>
    <mu-badge circle color="secondary" content="1" class="badge">
      <mu-bottom-nav-item value="发现" title="动态" icon="explore" replace to="/discover"/>
    </mu-badge>
  </mu-bottom-nav>
</template>
<script>
export default {
  name: 'bottomTab',
  data () {
    return {
      bottomNav: '消息'
    }
  },
  computed: {
  },
  methods: {
    // 点击按钮
    handleChange (val) {
      this.bottomNav = val
      // 改变title
      this.$store.commit('changeTitle', { title: val })
    }
  }
}
</script>
<style lang="stylus" scoped>
.bottom-tab
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  .badge
    width: 33.3%
    .mu-bottom-item
      display block
      width 100%
      height 100%
      font-size 15px
/deep/.badge em
    top 0
    right 20px
</style>
