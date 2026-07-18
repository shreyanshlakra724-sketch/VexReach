import { createRouter, createWebHistory } from 'vue-router'
import MainDashboard from './components/MainDashboard.vue'
import Home from './components/Home.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: MainDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router