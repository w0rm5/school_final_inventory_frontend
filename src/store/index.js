import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const TokenKey = 'A_K'

export default new Vuex.Store({
  state: {
    token: localStorage.getItem(TokenKey),
    userInfo: {},
    routers: [],
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USERINFO: (state, info) => {
      state.userInfo = info
    },
    SET_ROUTERS: (state, routers) => {
      state.routers = routers
    },
  },
  actions: {
    Login({ commit }, token) {
      return new Promise(resolve => {
        commit('SET_TOKEN', token)
        resolve(token)
      })
    },
  },
  modules: {},
})
