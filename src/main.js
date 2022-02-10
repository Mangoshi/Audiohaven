// Default imports
import Vue from 'vue'
import App from './App.vue'

// Vue frameworks
import vuetify from './plugins/vuetify'

// Vue libraries
import router from "./router";
import store from "./store"

// Vue mixins
import titleMixin from './mixins/titleMixin'
Vue.mixin(titleMixin)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
