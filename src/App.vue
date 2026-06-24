<script setup>
import { computed, onErrorCaptured, onMounted, onBeforeUnmount, provide, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import FloatingCustomerService from '@/components/chat/FloatingCustomerService.vue'

const route = useRoute()
const router = useRouter()
const appError = ref('')

const showFloatingCustomerService = computed(() => {
  return route.name !== 'chat' && !String(route.path || '').startsWith('/admin')
})

const sendToChat = async (text = '', openAI = 0) => {
  const query = {}
  const normalizedText = String(text || '').trim()

  if (normalizedText) {
    query.q = normalizedText
  }

  query.mode = openAI === 1 ? 'ai' : 'service'

  await router.push({
    name: 'chat',
    query,
  })
}

provide('sendToChat', sendToChat)

const handleWindowError = (event) => {
  appError.value = event?.error?.message || event?.message || 'Unknown runtime error'
}

const handleUnhandledRejection = (event) => {
  appError.value = event?.reason?.message || String(event?.reason || 'Unhandled promise rejection')
}

onErrorCaptured((error) => {
  appError.value = error?.message || String(error)
  console.error('App runtime error:', error)
  return false
})

onMounted(() => {
  window.addEventListener('error', handleWindowError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onBeforeUnmount(() => {
  window.removeEventListener('error', handleWindowError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})
</script>

<template>
  <div v-if="appError" class="app-error-screen">
    <strong>Page failed to load</strong>
    <span>{{ appError }}</span>
  </div>
  <template v-else>
    <LandingHeader />
    <RouterView />
    <FloatingCustomerService v-if="showFloatingCustomerService" />
  </template>
</template>

<style>
#app {
  font-family: 'Inter', 'Lato', 'Ubuntu', sans-serif;
  -moz-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-error-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  color: #111827;
  background: #ffffff;
  font-size: 15px;
}

.app-error-screen strong {
  font-size: 22px;
}
</style>
