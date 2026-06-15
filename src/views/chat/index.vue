<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import RecommendedPrices from '@/components/chat/RecommendedPrices.vue'
import { getLocal } from '@/utils/common'
import { getRecommendedPrice } from '@/api/tracking'

const router = useRouter()
const userInfo = getLocal('TOKEN') ? JSON.parse(getLocal('userInfo')) : null

const oceanData = ref([])
const doorData = ref([])
const expressData = ref([])

const loadRecommended = () => {
  getRecommendedPrice().then((res) => {
    const d = res.data.data || {}
    oceanData.value = d.ocean_freight || []
    doorData.value = d.ddp_ddu_freight || []
    expressData.value = d.express || []
  }).catch(() => {})
}

const onUserSend = () => {
  // refresh recommended prices shortly after the user sends a message
  setTimeout(loadRecommended, 800)
}

const bookingOrder = (row) => {
  router.push({
    name: 'shippingList',
    params: {
      chatBooking: JSON.stringify(row),
    },
  })
}

onMounted(() => {
  loadRecommended()
})
</script>

<template>
  <div class="chat-page">
    <div class="chat-page-inner">
      <div class="chat-wrap">
        <ChatPanel fullpage :userInfo="userInfo" @user-send="onUserSend" />
      </div>
      <div class="rec-wrap">
        <RecommendedPrices
          :oceanData="oceanData"
          :doorData="doorData"
          :expressData="expressData"
          @booking="bookingOrder"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  justify-content: center;
  padding: 24px;
  height: calc(100vh - 60px);
  background: linear-gradient(180deg, #eaf3fb 0%, #f6fafe 100%);
  box-sizing: border-box;
}
.chat-page-inner {
  width: 100%;
  max-width: 1100px;
  height: 100%;
  display: flex;
  flex-direction: row;
  background: #fff;
  border: 1px solid #e2ebf7;
  border-radius: 14px;
  box-shadow: 0 16px 44px rgba(22, 40, 77, 0.14);
  overflow: hidden;
}
.chat-wrap {
  flex: 1;
  min-width: 0;
}
.rec-wrap {
  flex-shrink: 0;
  width: 420px;
  overflow-y: auto;
  border-left: 1px solid #eef1f6;
  background: #fff;
}
</style>
