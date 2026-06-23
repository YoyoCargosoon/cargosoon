import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home2/index.vue'
import AdminLayout from '@/layout/admin.vue'
import { useAdminStore } from '@/stores/admin'

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
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/login.vue'),
      meta: {
        title: '后台登录',
        public: true,
      },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAdmin: true,
      },
      children: [
        { path: '', redirect: { name: 'admin-dashboard' } },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/dashboard.vue'),
          meta: { requiresAdmin: true, title: '总览', permission: 'dashboard.read' },
        },
        {
          path: 'pricing',
          name: 'admin-pricing',
          component: () => import('@/views/admin/pricing.vue'),
          meta: { requiresAdmin: true, title: '价格库', permission: 'price.read' },
        },
        {
          path: 'quotes',
          name: 'admin-quotes',
          component: () => import('@/views/admin/quotes.vue'),
          meta: { requiresAdmin: true, title: '查价记录', permission: 'quote.read' },
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/orders.vue'),
          meta: { requiresAdmin: true, title: '订单管理', permission: 'order.read' },
        },
        {
          path: 'recharges',
          name: 'admin-recharges',
          component: () => import('@/views/admin/recharges.vue'),
          meta: { requiresAdmin: true, title: '充值管理', permission: 'recharge.read' },
        },
        {
          path: 'feedback',
          name: 'admin-feedback',
          component: () => import('@/views/admin/feedback.vue'),
          meta: { requiresAdmin: true, title: '反馈工单', permission: 'feedback.read' },
        },
        {
          path: 'customers',
          name: 'admin-customers',
          component: () => import('@/views/admin/customers.vue'),
          meta: { requiresAdmin: true, title: '客户视图', permission: 'customer.read' },
        },
        {
          path: 'internal-chat',
          name: 'admin-internal-chat',
          component: () => import('@/views/admin/internal-chat.vue'),
          meta: { requiresAdmin: true, title: '内部沟通', permission: 'internal-chat.read' },
        },
        {
          path: 'internal-report',
          name: 'admin-internal-report',
          component: () => import('@/views/admin/internal-report.vue'),
          meta: { requiresAdmin: true, title: '汇总报告', permission: 'internal-report.read' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) {
    return true
  }

  const adminStore = useAdminStore()
  if (!adminStore.session) {
    return {
      name: 'admin-login',
      query: { redirect: to.fullPath },
    }
  }

  const isReady = await adminStore.bootstrap()
  if (!isReady) {
    return {
      name: 'admin-login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.permission && !adminStore.hasPermission(to.meta.permission)) {
    return {
      name: 'admin-dashboard',
    }
  }

  return true
})

export default router
