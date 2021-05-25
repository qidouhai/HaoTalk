<template>
  <mu-bottom-nav :value="bottomNav" @change="handleChange" class="bottom-tab">
    <mu-bottom-nav-item value="消息" title="消息" icon="chat_bubble_outline" replace to="/message"/>
    <mu-badge v-show="newmsgNum!='0'" circle color="secondary" :content="newmsgNum" class="badge" ></mu-badge>
    <mu-bottom-nav-item value="朋友" title="朋友" icon="people" replace to="/friends"/>
    <mu-badge v-show="newfriendNum!='0'" circle color="secondary" :content="newfriendNum" class="badge"></mu-badge>
    <mu-bottom-nav-item value="发现" title="动态" icon="explore" replace to="/discover"/>
    <mu-badge v-show="newdiscoverNum!='0'" circle color="secondary" :content="newdiscoverNum" class="badge"></mu-badge>
  </mu-bottom-nav>
</template>
<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
export default {
  name: 'bottomTab',
  data () {
    return {
      bottomNav: '消息'
    }
  },
  computed: {
    ...mapGetters(['newmsgNum', 'newfriendNum', 'newdiscoverNum'])
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
    position absolute
    top 0
    &:nth-of-type(1)
      left 25%
    &:nth-of-type(2)
      left 56%
    &:nth-of-type(3)
      left 90%
    .mu-bottom-item
      display block
      width 100%
      height 100%
      font-size 15px
</style>
