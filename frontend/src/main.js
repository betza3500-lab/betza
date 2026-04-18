import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'
import router from './router'
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'


import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(createBootstrap())
app.use(VueLoading, {
  // props
  color: "#00bd7e"
});
app.mount('#app')
