import Vue from 'vue'
import Vuex from 'vuex'
import { http } from '../libs/http'
import { updateIdList } from '../libs/utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userdata: {
      userid: localStorage.getItem('uid'),
      avatar: '',
      username: '',
      motto: '',
      phone: '',
      address: '',
      birthday: '',
      introduction: ''
    },
    friendList: [],
    messageList: [],
    groupList: [],
    sidebar: false,
    headerTitle: '消息',
    isAjax: true,
    activeId: '',
    chatList: []// 当前消息
  },
  getters: {
    nowFriendList: (state) => {
      return state.friendList.map(item => {
        return {...item, avatar: item.avatar || 'static/images/avatar.jpg', name: item.username || '用户' + item.friendid}
      })
    },
    nowMessageList: (state) => {
      return state.messageList.map(item => {
        return {...item, name: item.name || '用户' + item.uid, avatar: item.avatar || '/static/images/avatar.jpg'}
      })
    },
    nowUserData: (state) => {
      return {...state.userdata,
        avatar: state.userdata.avatar || '/static/images/avatar.jpg',
        username: state.userdata.username || '用户' + state.userdata.userid}
    },
    nowChatList: (state) => {
      return state.chatList.map(item => {
        return {...item, fromSelf: item.sender == state.userdata.userid}
      })
    },
    nowHistoryList: (state) => {
      if (state.activeId == null) {
        return []
      }
      let list = state.messageList.filter(item => {
        return item.uid == state.activeId
      })[0].list
      // console.log('打印historylist', list)
      list.forEach(data => {
        data.fromSelf = data.sender == state.userdata.userid
      })
      return list
    },
    nowGroupList: (state) => {
      return state.groupList.map(item => {
        return {...item, avatar: item.avatar || 'static/images/avatar.jpg', name: item.roomname || '群聊'}
      })
    },
    activeName: (state) => {
      if (!state.activeId) return ''
      let res = state.friendList.find(item => {
        return item.friendid == state.activeId
      })
      return res ? res.username : state.groupList.find(item => {
        return item.roomid == state.activeId
      }).roomname
    }
  },
  mutations: {
    showSidebar: (state, {flag} = {}) => {
      state.sidebar = !state.sidebar
    },
    changeTitle: (state, {title}) => {
      state.headerTitle = title
    },
    getActiveId: (state, {activeId}) => {
      state.activeId = activeId
    },
    removeMessage: (state, {_id}) => {
      state.messageList.forEach((item, index, arr) => {
        if (item._id === _id) {
          arr.splice(index, 1)
        }
      })
    },
    updateMessageList: (state, msg) => {
      state.messageList = msg
      state.isAjax = true
    },
    updateFriendList: (state, data) => {
      state.friendList = data
      let idList = state.friendList.map(item => { return item.friendid })
      updateIdList(idList)
    },
    updateGroupList: (state, data) => {
      state.groupList = data
      let idList = state.groupList.map(item => { return item.roomid })
      updateIdList(idList)
    },
    updateUserData: (state, data) => {
      state.userdata = data[0]
    },
    addToChatlist: (state, data) => {
      if (data.sender == state.userdata.userid) return
      state.chatList.push(data)
    },
    addToMessagelist: (state, data) => {
      if (data.sender == state.userdata.userid) return
      let target = state.messageList.find(item => {
        return item.uid == data.sender || item.uid == data.receiver
      })
      if (target) {
        target.list.push(data)
        target.list.splice(0, target.list.length - 10)
      } else {
        var res = data.receiver.startsWith('x')
          ? state.groupList.find(item => { return item.roomid == data.receiver })
          : state.friendList.find(item => { return item.friendid == data.sender })
        state.messageList.push({
          avatar: res.avatar,
          name: data.receiver.startsWith('x') ? res.roomname : res.username,
          list: [data],
          uid: data.receiver.startsWith('x') ? res.roomid : res.friendid,
          creater: data.receiver.startsWith('x') ? res.creater : null,
          littlename: data.receiver.startsWith('x') ? null : res.littlename
        })
      }
    },
    clearChatlist: (state) => {
      state.messageList.forEach(msg => {
        if (msg.uid == state.activeId) {
          msg.list.push(...state.chatList)
          msg.list.splice(0, msg.list.length - 10)
        }
      })
      state.chatList = []
    }
  },
  actions: {
    async getMessage (context) {
      const res = await http('/getmessage', {
        data: {
          idList: JSON.parse(localStorage.getItem('idList')),
          uid: context.state.userdata.userid
        },
        method: 'post'
      })
      context.commit('updateMessageList', res.respData)
      console.log('获取消息列表', res)
    },
    async getFriends (context) {
      const res = await http('/getfriends', {
        data: {
          uid: context.state.userdata.userid
        }
      })
      context.commit('updateFriendList', res.respData)
      console.log('获取朋友列表', res)
    },
    async getGroups (context) {
      const res = await http('/getgroups', {
        data: {
          uid: context.state.userdata.userid
        }
      })
      context.commit('updateGroupList', res.respData)
      console.log('获取群组列表', res)
    },
    async getUserdata (context) {
      const res = await http('/getuserdata', {
        data: {
          uid: context.state.userdata.userid
        }
      })
      context.commit('updateUserData', res.respData)
      console.log('获取个人信息', res)
    },
    SOCKET_MESSAGE (context, data) {
      if (data.sender == context.state.activeId) {
        context.commit('addToChatlist', data)
      } else {
        context.commit('addToMessagelist', data)
      }
    }
  }
})
