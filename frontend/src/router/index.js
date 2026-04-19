import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '../composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
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

/**
 * Global navigation guard.
 *
 * On first navigation the session has not been checked yet (loading is true).
 * We wait for checkSession() to resolve (it is called in main.js before the
 * app is mounted) so the guard always has fresh auth state.
 *
 * Routes with `meta.requiresAuth === false` are always accessible (e.g. /login).
 * All other routes require an authenticated session.
 */
router.beforeEach(async (to) => {
  const { isAuthenticated, loading, checkSession } = useAuth();

  // Wait for the initial session check to finish.
  if (loading.value) {
    await checkSession();
  }

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !isAuthenticated.value) {
    return { name: 'login' };
  }

  // Redirect already-authenticated users away from the login page.
  if (to.name === 'login' && isAuthenticated.value) {
    return { name: 'home' };
  }
});

export default router

