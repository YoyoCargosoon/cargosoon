import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home2/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

export default router
