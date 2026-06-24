import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home2/index.vue'

const legacyRedirect = (to) => {
  const strippedPath = to.path.replace(/^\/new/, '') || '/'
  return {
    path: strippedPath,
    query: to.query,
    hash: to.hash,
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/new/:pathMatch(.*)*',
      redirect: legacyRedirect,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home2',
      name: 'home2',
      component: () => import('../views/home2/index.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/chat/index.vue'),
    },
    {
      path: '/track',
      name: 'track',
      component: () => import('../views/track/index.vue'),
    },
    {
      path: '/track/result',
      name: 'track-result',
      component: () => import('../views/track/result.vue'),
    },
    {
      path: '/fcl-ddp-freight',
      name: 'fcl-ddp-freight',
      component: () => import('../views/fcl-ddp-freight/index.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} | Cargosoon` : 'Cargosoon'
})

export default router
