import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions' //es6的import语法
import * as getters from './getters' //es6的import语法
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)//注册插件

const debug = process.env.NODE_ENV !== 'production'//vuex的调试工具

export default new Vuex.Store({//传入下面这些参数
    actions,
    getters,
    state,
    mutations,
    strict:debug,
    plugins:debug?[createLogger()]:[]
})


