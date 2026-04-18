import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/tussenstand',
      name: 'tussenstand',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/TussenstandView.vue')
    },
    {
      path: '/grafiek',
      name: 'grafiek',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ChartView.vue')
    },
    {
      path: '/deelnemers',
      name: 'deelnemers',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ParticipantListView.vue')
    },
    {
      path: '/resultaat',
      name: 'resultaat',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ResultView.vue')
    },
    {
      path: '/halloffame',
      name: 'hall of fame',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HallOfFameView.vue')
    },
    {
      path: '/hallofshame',
      name: 'hall of shame',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HallOfShameView.vue')
    }
  ]
})

export default router
