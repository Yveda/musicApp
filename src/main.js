// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'//引入vuex的store的初始化文件
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import 'common/stylus/index.styl'//渲染主页面的样式

// 推荐用法，整个body里面的点击没有300毫秒的延时
fastclick.attach(document.body)

Vue.config.productionTip = false
Vue.use(VueLazyLoad,{//懒加载
  loading:require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  store,
  router
})
