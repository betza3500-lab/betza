import { createApp } from 'vue'
import BootstrapVue3 from 'bootstrap-vue-3'
import App from './App.vue'
import router from './router'
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import { useAuth } from './composables/useAuth.js';


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'


import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(BootstrapVue3)
app.use(VueLoading, {
  // props
  color: "#00bd7e"
});

// Eagerly check the session so that the router guard has auth state
// available before the first navigation resolves.
const { checkSession } = useAuth();
checkSession().finally(() => {
  app.mount('#app');
});
