<template>
<div class="editinfo">
  <mu-appbar style="width: 100%" color="primary">
    <mu-button icon slot="left" @click="back">
      <mu-icon value="reply"></mu-icon>
    </mu-button>
    编辑资料
    <mu-button flat slot="right" @click="udpateUserdata">完成</mu-button>
  </mu-appbar>
    <mu-container>
        <mu-form ref="form" :model="validateForm" class="mu-demo-form" label-position="left">
          <mu-form-item label="群聊头像" >
              <input ref='avatar' type="file" @change='changeAvatar' style="display:none">
              <mu-avatar size="56" @click='chooseAvatar'>
                <img :src="validateForm.avatar">
              </mu-avatar>
          </mu-form-item>

          <mu-form-item label="群聊昵称"  prop="roomname" :rules="usernameRules">
            <mu-text-field v-model="validateForm.roomname" prop="roomname"></mu-text-field>
          </mu-form-item>

          <mu-form-item label="群公告" >
            <mu-text-field v-model="validateForm.poster" multi-line :rows="3"></mu-text-field>
          </mu-form-item>

        </mu-form>
    </mu-container>
</div>
</template>
<script>
import { http } from '../../libs/http'

export default {
  name: 'editgroup',
  props: ['oldData'],
  data: function () {
    return {
      usernameRules: [
        { validate: (val) => !!val,
          message: '不能为空'},
        {validate: (val) => val.trim().indexOf(' ') === -1,
          message: '不能包含空格'}
      ],
      validateForm: this.oldData
    }
  },
  watch: {
    oldData (newVal, oldVal) {
      this.validateForm = newVal
    }
  },
  methods: {
    changeAvatar (e) {
      console.log(e.target.files[0])
      var reader = new FileReader()
      var that = this
      reader.onload = function () {
        that.validateForm.avatar = this.result
        // console.log(this.result)
      }
      reader.readAsDataURL(e.target.files[0])
    },
    chooseAvatar () {
      this.$refs.avatar.click()
    },
    back () {
      this.$emit('backclick')
    },
    async udpateUserdata () {
      const result = await this.$refs.form.validate()
      if (!result) return
      const res = await http('/editgroup', {
        data: {...this.validateForm},
        method: 'post'
      })
      console.log(res)
    }
  }
}
</script>
<style lang="stylus" scoped>
    .editinfo
      position:fixed
      width: 100%
      height: 100%
      background: url(../../assets/login.jpg) no-repeat ;
      top 0
      .mu-demo-form
        margin-top: 10vh
        .mu-list
          background none
          border-bottom 1px solid
      .mu-appbar
        display: flex
        justify-content : space-between
        text-align center
</style>
