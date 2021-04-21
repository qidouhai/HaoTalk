import Vue from 'vue'
import Router from 'vue-router'
import message from '../components/message/message.vue'
import friends from '../components/friends/friends.vue'
import discover from '../components/discover/discover.vue'
import Login from '../Login.vue'
import chatWindow from '../components/dialog/dialog.vue'
import personinfo from '../components/personindex/personindex.vue'
import editinfo from '../components/personindex/editinfo.vue'
import search from '../components/search/search.vue'

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
      meta: {
        requireAuth: true
      },
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
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/personinfo/:uid',
      name: 'personinfo',
      component: personinfo,
      children: [
        {
          path: 'editinfo',
          name: 'editinfo',
          component: editinfo
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requireAuth)) { // 判断该路由是否需要登录权限
    if (localStorage.getItem('token')) { // 判断当前的token是否存在 ； 登录存入的token
      next()
    } else {
      next({path: '/login'})
    }
  } else {
    next()
  }
})

export default router
