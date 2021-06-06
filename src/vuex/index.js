import Vue from 'vue'
import Vuex from 'vuex'
import { http } from '../libs/http'
import INDEXDB from '../libs/indexDB'
import { addIdList } from '../libs/utils'
/* eslint-disable eqeqeq */
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
    activeId: '',
    chatList: []// 当前消息
  },
  getters: {
    newmsgNum: (state) => {
      let res = 0
      state.messageList.forEach(item => {
        res += item.newsnum == null ? 0 : item.newsnum
      })
      return String(res)
    },
    newfriendNum: (state) => {
      return '0'
    },
    newdiscoverNum: (state) => {
      return '0'
    },
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
      let target = state.messageList.filter(item => {
        return item.uid == state.activeId
      })
      if (target.length) {
        target[0].list.forEach(data => {
          data.fromSelf = data.sender == state.userdata.userid
        })
      } else {
        return []
      }
      return target[0].list
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
    removeNewmsgnum: (state, uid) => {
      state.messageList.forEach(item => {
        if (item.uid == uid) { item.newsnum = 0 }
      })
    },
    showSidebar: (state, {flag} = {}) => {
      state.sidebar = !state.sidebar
    },
    changeTitle: (state, {title}) => {
      state.headerTitle = title
    },
    getActiveId: (state, {activeId}) => {
      state.activeId = activeId
    },
    removeMessage: (state, {index}) => {
      state.messageList.splice(index, 1)
    },
    updateMessageList: (state, msg) => {
      msg.forEach(item => {
        item.newsnum = 0
        item.list.forEach(data => {
          if (data.contexttype == 'video') {
            INDEXDB.setItem(data.sender + data.sendtime, data.context.split('|')[0])
            data.context = data.context.split('|')[1]
          }
        })
      })
      state.messageList = msg
    },
    increaseMessagelist: (state, msg) => {
      state.messageList.unshift(msg)
    },
    updateFriendList: (state, data) => {
      state.friendList = data
    },
    updateGroupList: (state, data) => {
      state.groupList = data
    },
    updateUserData: (state, data) => {
      state.userdata = data[0]
    },
    addToChatlist: (state, data) => {
      state.chatList.push(data)
    },
    addToMessagelist: (state, data) => {
      let target = state.messageList.find(item => {
        if (data.receiver.startsWith('x')) {
          return item.uid == data.receiver
        } else { return item.uid == data.sender }
      })
      if (target) {
        target.list.push(data)
        target.newsnum == null ? target.newsnum = 1 : target.newsnum += 1
      } else {
        data.receiver.startsWith('x') ? addIdList(data.receiver) : addIdList(data.sender)
        var res = data.receiver.startsWith('x')
          ? state.groupList.find(item => { return item.roomid == data.receiver })
          : state.friendList.find(item => { return item.friendid == data.sender })
        state.messageList.push({
          avatar: res.avatar,
          name: data.receiver.startsWith('x') ? res.roomname : res.username,
          list: [data],
          uid: data.receiver.startsWith('x') ? res.roomid : res.friendid,
          creater: data.receiver.startsWith('x') ? res.creater : null,
          littlename: data.receiver.startsWith('x') ? null : res.littlename,
          newsnum: 1
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
      if (data.contexttype == 'video') {
        INDEXDB.setItem(data.sender + data.sendtime, data.context.split('|')[0])
        data.context = data.context.split('|')[1]
      }
      if (data.sender == context.state.activeId || data.receiver == context.state.activeId) {
        if (data.sender == context.state.userdata.userid) return
        context.commit('addToChatlist', data)
      } else {
        context.commit('addToMessagelist', data)
      }
    }
    /* SOCKET_OFFLINEMSG (context, data) {
      if (data.contexttype == 'video') {
        INDEXDB.setItem(data.sender + data.sendtime, data.context.split('|')[0])
        data.context = data.context.split('|')[1]
      }
      if (data.sender == context.state.activeId || data.receiver == context.state.activeId) {
        if (data.sender == context.state.userdata.userid) return
        context.commit('addToChatlist', data)
      } else {
        context.commit('addToMessagelist', data)
      }
    } */
  }
})
