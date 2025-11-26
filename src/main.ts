import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// @ts-expect-error - router is JS file
import router from './router'

createApp(App).use(router).mount('#app')
