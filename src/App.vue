<script setup>
import { ref, provide, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Layout from './layout/index.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { getLocal } from '@/utils/common'

const route = useRoute()
// hide the floating chat widget on the dedicated full-page chat route
const showFloatingChat = computed(() => route.name !== 'chat')

const userInfo = getLocal('TOKEN') ? JSON.parse(getLocal('userInfo')) : null
const manage = ref(userInfo?.manage || { id: '', image_url: '', englishname: '', whatsappp: '', service_email: '' })

const chatPanelRef = ref(null)

const onManageReady = (m) => {
  manage.value = m
}

// allow any page to push a message into the global chat
const sendToChat = (text, openAI) => {
  chatPanelRef.value?.sendFromExternal(text, openAI)
}
provide('sendToChat', sendToChat)
</script>

<template>
  <div id="app" class="common-layout">
    <el-container>
      <el-header style="--el-header-padding: 0">
        <Layout></Layout>
      </el-header>
      <el-main style="background: #F4F5F9;min-width: 1280px;padding: 0;">
        <RouterView />
      </el-main>
    </el-container>

    <template v-if="showFloatingChat">
      <!-- WhatsApp float -->
      <div class="fixed bottom-5 right-10">
        <a
          :href="'https://api.whatsapp.com/send?phone=+86' + manage.whatsappp + '&text=Hello, ' + manage.englishname"
          target="_blank"
        >
          <img src="@/assets/chat/whatsapp.svg" class="w-14 h-14 cursor-pointer" alt="">
        </a>
      </div>

      <!-- chat panel (floating button + window) -->
      <ChatPanel ref="chatPanelRef" :userInfo="userInfo" @manage-ready="onManageReady" />
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
