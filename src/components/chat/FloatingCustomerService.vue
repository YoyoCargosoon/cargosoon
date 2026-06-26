<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDownBold, Headset } from '@element-plus/icons-vue'
import { getLocal } from '@/utils/common'

const router = useRouter()
const collapsed = ref(true)
const serviceAvatar = ref('')

const loadServiceAvatar = () => {
  try {
    const userInfo = getLocal('userInfo')
    const chatInfo = getLocal('chat_info')
    const manageNew = getLocal('manageNew')

    const candidates = [
      userInfo ? JSON.parse(userInfo)?.manage?.image_url : '',
      manageNew ? JSON.parse(manageNew)?.image_url : '',
      chatInfo ? JSON.parse(chatInfo)?.manage?.image_url : '',
    ].filter(Boolean)

    serviceAvatar.value = candidates[0] || ''
  } catch (error) {
    serviceAvatar.value = ''
  }
}

const openCustomerService = () => {
  router.push({
    name: 'chat',
    query: {
      mode: 'service',
    },
  })
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const wrapperClass = computed(() => (
  collapsed.value ? 'service-pill is-collapsed' : 'service-pill'
))

onMounted(() => {
  loadServiceAvatar()
})
</script>

<template>
  <div :class="wrapperClass">
    <button
      v-if="collapsed"
      type="button"
      class="service-pill-mini"
      aria-label="Show customer service"
      @click="toggleCollapsed"
    >
      <span class="mini-dot"></span>
      <Headset class="mini-icon" aria-hidden="true" />
    </button>

    <template v-else>
      <button
        type="button"
        class="service-pill-main"
        @click="openCustomerService"
      >
        <span :class="['service-photo', { 'has-image': serviceAvatar }]">
          <img v-if="serviceAvatar" :src="serviceAvatar" alt="">
          <Headset v-else class="service-photo-icon" aria-hidden="true" />
        </span>

        <span class="service-text">
          <strong>Customer Service</strong>
          <small>
            <span class="online-dot"></span>
            We&apos;re online
          </small>
        </span>
      </button>

      <button
        type="button"
        class="service-pill-toggle"
        aria-label="Collapse customer service entry"
        @click="toggleCollapsed"
      >
        <ArrowDownBold class="toggle-icon" aria-hidden="true" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.service-pill {
  position: fixed;
  right: 18px;
  bottom: 26px;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-pill-main,
.service-pill-toggle,
.service-pill-mini {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.service-pill-main {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px 8px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14px 40px rgba(28, 34, 48, 0.12);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.service-pill-main:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 44px rgba(28, 34, 48, 0.16);
}

.service-photo {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff6f0 0%, #f7ebe3 100%);
  color: #c96c2c;
  overflow: hidden;
}

.service-photo.has-image {
  background: #f3f3f3;
}

.service-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-photo-icon {
  width: 18px;
  height: 18px;
}

.service-text {
  display: grid;
  text-align: left;
  line-height: 1.15;
}

.service-text strong {
  color: #23252b;
  font-size: 14px;
  font-weight: 700;
}

.service-text small {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: #8a8e98;
  font-size: 12px;
}

.online-dot,
.mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f26a1b;
  flex: 0 0 auto;
}

.service-pill-toggle {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.97);
  color: #8c919d;
  box-shadow: 0 12px 28px rgba(28, 34, 48, 0.1);
}

.toggle-icon {
  width: 14px;
  height: 14px;
}

.service-pill-mini {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.97);
  color: #d06a29;
  box-shadow: 0 14px 34px rgba(28, 34, 48, 0.12);
}

.mini-dot {
  position: absolute;
  top: 11px;
  right: 11px;
  width: 7px;
  height: 7px;
}

.mini-icon {
  width: 19px;
  height: 19px;
}

@media (max-width: 640px) {
  .service-pill {
    right: 14px;
    bottom: 18px;
  }

  .service-pill-main {
    min-height: 54px;
    padding-right: 12px;
  }

  .service-text strong {
    font-size: 13px;
  }
}
</style>
