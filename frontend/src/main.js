import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Landing from './views/Landing.vue'
import Console from './views/Console.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Landing },
    { path: '/console/process/:projectId', component: Console, props: true }
  ]
})

createApp(App).use(router).mount('#app')
