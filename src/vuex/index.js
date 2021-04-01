import Vue from 'vue'
import Vuex from 'vuex'
import { http } from '../libs/http'
import { blobToFile } from '../libs/utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userdata: {
      userid: '1033170126',
      avatar: '/static/images/avatar_me.jpg',
      username: '吴彦祖',
      motto: 'i was supposed to chart and celebrate',
      phone: '',
      address: '',
      birthday: '',
      introduction: ''
    },
    friendList: [],
    messageList: [],
    ischatting: false,
    sidebar: false,
    personindex: false,
    search: false,
    headerTitle: 'message',
    data: {},
    isAjax: false,
    activeId: '',
    chatList: []
  },
  getters: {
    nowFriendList: (state) => {
      return state.friendList.map(item => {
        return {...item, avatar: item.avatar || 'static/images/avatar.jpg', name: item.name || '彭于晏'}
      })
    },
    nowMessageList: (state) => {
      return state.messageList.map(item => {
        return {...item, name: item.name || '彭于晏', avatar: item.avatar || '/static/images/avatar.jpg'}
      })
    },
    nowUserData: (state) => {
      return {...state.userdata,
        avatar: state.userdata.avatar || '/static/images/avatar_me.jpg',
        username: state.userdata.username || '吴彦祖'}
    },
    nowChatList: (state) => {
      return state.chatList.map(item => {

      })
    }
  },
  mutations: {
    setUid: (state, id) => {
      state.userdata.userid = id
    },
    showSidebar: (state, {flag} = {}) => {
      state.sidebar = !state.sidebar
    },
    showPersonindex: (state) => {
      state.personindex = !state.personindex
    },
    showSearch: (state) => {
      state.search = !state.search
    },
    getData: (state, data) => {
      state.data = data
      state.isAjax = true
    },
    changeTitle: (state, {title}) => {
      state.headerTitle = title
    },
    getActiveId: (state, {activeId}) => {
      state.activeId = activeId
    },
    changeList: (state, obj) => {
      let now = new Date()
      let time = `${now.getHours()}:${now.getMinutes()}`
      if (obj.self) {
        state.messageList.forEach((item, index, arr) => {
          if (item._id === obj._id) {
            obj._id = 0
            item.list.push({...obj, time})
          }
        })
      } else {
        state.messageList.forEach((item, index, arr) => {
          if (item._id === obj._id) {
            item.list.push({ ...obj, time })
          }
        })
      }
    },
    removeMessage: (state, {_id}) => {
      state.messageList.forEach((item, index, arr) => {
        if (item._id === _id) {
          arr.splice(index, 1)
        }
      })
    },
    updateMessageList: (state, msg) => {
      console.log(msg)
      msg.forEach(item => {
        item.list.forEach(data => {
          blobToFile(data)
        })
      })
      state.messageList = msg
      state.isAjax = true
    },
    updateFriendList: (state, data) => {
      state.friendList = data
    },
    updateUserData: (state, data) => {
      state.userdata = data[0]
    },
    addToChatList: (state, msg) => {
      state.chatList.push(msg)
    },
    clearChatList: (state) => {
      state.chatList = []
    }
  },
  actions: {
    async getMessage (context) {
      const res = await http('/getmessage', {
        data: {
          idList: ['1033170127'],
          uid: context.state.userdata.userid
        },
        method: 'post'
      })
      context.commit('updateMessageList', res.respData)
      // console.log(res)
    },
    async getFriends (context) {
      console.log(context.state.userdata.userid)
      const res = await http('/getfriends', {
        data: {
          uid: context.state.userdata.userid
        }
      })
      context.commit('updateFriendList', res.respData)
      // console.log(res)
    },
    async getUserdata (context) {
      const res = await http('/getuserdata', {
        data: {
          uid: context.state.userdata.userid
        }
      })
      context.commit('updateUserData', res.respData)
      // console.log(res)
    }
  }
})
