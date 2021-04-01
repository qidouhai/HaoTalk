import Vue from 'vue'
import Router from 'vue-router'
import message from '../components/message/message.vue'
import friends from '../components/friends/friends.vue'
import discover from '../components/discover/discover.vue'
import Login from '../Login.vue'
import chatWindow from '../components/dialog/dialog.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/message',
      name: 'message',
      /* meta: {
        requireAuth: true
      }, */
      component: message
    },
    {
      path: '/friends',
      name: 'friends',
      component: friends
    },
    {
      path: '/discover',
      name: 'discover',
      component: discover
    },
    {
      path: '/dialog/:uid',
      name: 'dialog',
      component: chatWindow
    }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log(to.fullPath)
  if (to.matched.some(record => record.meta.requireAuth)) { // 判断该路由是否需要登录权限
    console.log('需要登录')
    if (localStorage.getItem('token')) { // 判断当前的token是否存在 ； 登录存入的token
      next()
    } else {
      router.push({path: '/login'})
      // next({
      //   path: '/login',
      //   query: {redirect: router.currentRoute.fullPath} // 将跳转的路由path作为参数，登录成功后跳转到该路由
      // })
    }
  } else {
    next()
  }
})

export default router
