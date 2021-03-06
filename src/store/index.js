import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

const TokenKey = 'A_K'

export default new Vuex.Store({
  plugins: [createPersistedState({
    storage: window.sessionStorage,
  })],
  state: {
    token: localStorage.getItem(TokenKey),
    userInfo: {},
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USERINFO: (state, info) => {
      state.userInfo = info
    }
  },
  actions: {
    Login({ commit }, res) {
      return new Promise(resolve => {
        commit('SET_TOKEN', res.token)
        if(res.remember) {
          localStorage.setItem(TokenKey, res.token)
        }
        resolve()
      })
    },
    Logout({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_USERINFO', {})
        sessionStorage.clear()
        localStorage.removeItem(TokenKey)
        resolve()
      })
    },
    SetUserInfo({ commit }, info) {
      return new Promise(resolve => {
        commit('SET_USERINFO', info)
        resolve(info.is_admin)
      })
    },
  },
  getters: {
    userInfo: state => state.userInfo,
    token: state => state.token,
  },
})
