<script setup>
import { ref, provide, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Layout from './layout/index.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { getLocal } from '@/utils/common'

const route = useRoute()
const router = useRouter()
// hide the floating chat widget on the dedicated full-page chat route
const showFloatingChat = computed(() => route.name !== 'chat')
const showLayoutHeader = computed(() => route.name !== 'chat')

const userInfo = getLocal('TOKEN') ? JSON.parse(getLocal('userInfo')) : null
const manage = ref(userInfo?.manage || { id: '', image_url: '', englishname: '', whatsappp: '', service_email: '' })

const chatPanelRef = ref(null)
const floatingDockCollapsed = ref(true)

const onManageReady = (m) => {
  manage.value = m
}

// allow any page to push a message into the global chat
const sendToChat = (text, openAI) => {
  chatPanelRef.value?.sendFromExternal(text, openAI)
}
provide('sendToChat', sendToChat)

const toggleFloatingDock = () => {
  floatingDockCollapsed.value = !floatingDockCollapsed.value
  if (floatingDockCollapsed.value) {
    chatPanelRef.value?.closePanel?.()
  }
}

const openFloatingChat = () => {
  router.push({
    name: 'chat',
    query: { mode: 'service' },
  })
}
</script>

<template>
  <div id="app" class="common-layout">
    <el-container>
      <el-header v-if="showLayoutHeader" style="--el-header-padding: 0">
        <Layout></Layout>
      </el-header>
      <el-main style="background: #F4F5F9;padding: 0;">
        <RouterView />
      </el-main>
    </el-container>

    <template v-if="showFloatingChat">
      <div class="floating-dock">
        <transition name="dock-actions">
          <div v-show="!floatingDockCollapsed" class="floating-dock-actions">
            <button type="button" class="floating-dock-chat" @click="openFloatingChat">
              <div class="floating-dock-chat-avatar">
                <img :src="manage.image_url" alt="">
              </div>
              <span>Customer Service</span>
              <svg class="floating-dock-action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"></path>
              </svg>
            </button>

            <a
              :href="'https://api.whatsapp.com/send?phone=+86' + manage.whatsappp + '&text=Hello, ' + manage.englishname"
              target="_blank"
              class="floating-whatsapp-link"
            >
              <img src="@/assets/chat/whatsapp.svg" class="floating-whatsapp-icon" alt="">
              <span>WhatsApp</span>
            </a>
          </div>
        </transition>

        <button type="button" class="floating-dock-toggle" @click="toggleFloatingDock">
          <svg class="floating-dock-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"></path>
          </svg>
          <span>{{ floatingDockCollapsed ? 'Support' : 'Hide' }}</span>
          <span class="floating-dock-toggle-arrow" aria-hidden="true">{{ floatingDockCollapsed ? '+' : '-' }}</span>
        </button>
      </div>

      <ChatPanel
        ref="chatPanelRef"
        :userInfo="userInfo"
        :external-launcher="true"
        :launcher-collapsed="floatingDockCollapsed"
        @manage-ready="onManageReady"
      />
    </template>
  </div>
</template>

<style>
#app {
  font-family: 'Inter', 'Lato', 'Ubuntu', sans-serif;
  /* background-color: #e6e6e6; */
  -moz-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<style scoped>
.floating-dock {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 58;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.floating-dock-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.floating-dock-toggle,
.floating-dock-chat,
.floating-whatsapp-link {
  border: 0;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-dock-toggle {
  gap: 8px;
  height: 48px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.96);
  color: #173f5f;
  box-shadow: 0 16px 34px rgba(23, 63, 95, 0.16);
  backdrop-filter: blur(10px);
}

.floating-dock-chat,
.floating-whatsapp-link {
  gap: 10px;
  padding: 0 14px 0 10px;
  height: 48px;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(23, 63, 95, 0.18);
  text-decoration: none;
}

.floating-dock-chat {
  background: linear-gradient(135deg, #ff8d39 0%, #f46a1a 100%);
}

.floating-whatsapp-link {
  background: #4dc247;
  box-shadow: 0 12px 24px rgba(77, 194, 71, 0.22);
}

.floating-dock-chat-avatar {
  width: 34px;
  height: 34px;
  overflow: hidden;
  border-radius: 999px;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.2);
}

.floating-dock-chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-whatsapp-icon {
  width: 24px;
  height: 24px;
}

.floating-dock-toggle-icon,
.floating-dock-action-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: currentColor;
}

.floating-dock-toggle-arrow {
  font-size: 16px;
  line-height: 1;
}

.dock-actions-enter-active,
.dock-actions-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dock-actions-enter-from,
.dock-actions-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 640px) {
  .floating-dock {
    right: 14px;
    bottom: 14px;
  }

  .floating-dock-toggle,
  .floating-dock-chat,
  .floating-whatsapp-link {
    height: 44px;
  }

  .floating-whatsapp-icon {
    width: 22px;
    height: 22px;
  }

  .floating-dock-toggle span,
  .floating-dock-chat span,
  .floating-whatsapp-link span {
    font-size: 12px;
  }
}
</style>
