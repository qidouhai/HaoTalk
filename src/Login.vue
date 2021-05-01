<template>
    <div class="login">
      <mu-container v-if="isLogin">
        <mu-form ref="form" :model="validateForm" class="mu-demo-form">
          <mu-form-item label="账号" help-text="首次登录请点击注册" prop="userid" :rules="useridRules">
            <mu-text-field v-model="validateForm.userid" prop="userid"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="密码" prop="password" :rules="passwordRules">
            <mu-text-field type="password" v-model="validateForm.password" prop="password"></mu-text-field>
          </mu-form-item>
          <mu-form-item prop="isAgree" :rules="argeeRules">
            <mu-checkbox label="同意用户协议" v-model="validateForm.isAgree"></mu-checkbox>
            <p @click="isLogin=!isLogin" style="width:100%;text-align:right">没有账号?点击注册</p>
          </mu-form-item>
          <mu-form-item>
            <mu-button  color="primary" @click="login">登录</mu-button>
          </mu-form-item>
        </mu-form>
      </mu-container>
      <mu-container v-else>
        <mu-form ref="form" :model="validateForm" class="mu-demo-form">
          <mu-form-item label="输入用户名" help-text="不超过26位" prop="username" :rules="usernameRules">
            <mu-text-field v-model="validateForm.username" prop="username"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="账号" prop="userid" :rules="useridRules">
            <mu-text-field v-model="validateForm.userid" prop="userid"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="密码" prop="password" :rules="passwordRules">
            <mu-text-field type="password" v-model="validateForm.password" prop="password"></mu-text-field>
          </mu-form-item>
          <mu-form-item prop="isAgree" :rules="argeeRules">
            <mu-checkbox label="同意用户协议" v-model="validateForm.isAgree"></mu-checkbox>
            <p @click='isLogin=!isLogin' style="width:100%;text-align:right">返回登陆</p>
          </mu-form-item>
          <mu-form-item>
            <mu-button @click="signUp">注册</mu-button>
          </mu-form-item>
        </mu-form>
      </mu-container>
    </div>
</template>

<script>
import {http} from './libs/http'

export default {
  name: 'login',
  data () {
    return {
      usernameRules: [
        { validate: (val) => !!val,
          message: '请填写用户名'},
        {validate: (val) => val.trim().indexOf(' ') === -1,
          message: '不能包含空格'}
      ],
      useridRules: [
        { validate: (val) => !!val,
          message: '必须填写账号'},
        { validate: (val) => val.length >= 3,
          message: '账号长度大于3'}
      ],
      passwordRules: [
        { validate: (val) => !!val,
          message: '必须填写密码'},
        { validate: (val) => val.length >= 3 && val.length <= 10,
          message: '密码长度大于3小于10'}
      ],
      argeeRules: [{ validate: (val) => !!val,
        message: '必须同意用户协议'}],
      validateForm: {
        userid: '',
        username: '',
        password: '',
        isAgree: false
      },
      isLogin: true
    }
  },
  methods: {
    async login () {
      const result = await this.$refs.form.validate()
      if (!result) {
        return
      }
      const res = await http('/login', {data: this.validateForm, method: 'post'})
      if (res.respCode === 0) {
        localStorage.setItem('token', res.respData)
        localStorage.setItem('uid', this.validateForm.userid)
        await this.$toast.success(res.respMsg)
        this.$router.replace('/message')
      } else {
        this.$toast.error(res.respMsg)
      }
    },
    async signUp () {
      const result = await this.$refs.form.validate()
      if (!result) {
        return
      }
      const res = await http('/signup', {data: this.validateForm, method: 'post'})
      if (res.respCode === 0) {
        localStorage.setItem('token', res.respData)
        localStorage.setItem('uid', this.validateForm.userid)
        await this.$toast.success(res.respMsg)
        this.$router.replace('/message')
      } else {
        this.$toast.error(res.respMsg)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.login
  position:fixed
  width: 100%
  height: 100%
  z-index: 999
  background: url(./assets/login.jpg) no-repeat ;
  top 0
  .mu-demo-form
    margin-top: 20vh

</style>
