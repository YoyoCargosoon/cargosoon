<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import Notice from './components/notice.vue'
import { getLocal } from '@/utils/common'
import LoadingVue from '@/components/common/loading.vue'
import { useLoadingStore } from '@/stores/loading'
import router from '@/router/index.js'

const route = useRoute()
const isHome2 = computed(() => route.name === 'home2' || route.name === 'home')
const isTrackPage = computed(() => route.name === 'track' || route.name === 'track-result')
const isFreightPage = computed(() => route.name === 'fcl-ddp-freight')
const usesLandingNav = computed(() => isHome2.value || isTrackPage.value || isFreightPage.value)
const sendToChat = inject('sendToChat', () => {})
const isCoLogisticsHost = window.location.host === 'app.cargosoon.com'

const activeIndex2 = ref('/')
const input = ref('')
const superLevel = ref('')
const userName = ref('')
const istoken = ref(false)
const userImg = ref('')
const activeLandingKey = ref('')
const openLandingMenu = ref('')
const loadingStore = useLoadingStore()

const parseLocalJson = (key) => {
  const raw = getLocal(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`Failed to parse local storage key: ${key}`, error)
    return null
  }
}

if (getLocal('TOKEN')) {
  const userInfo = parseLocalJson('userInfo')

  if (userInfo) {
    istoken.value = true
    userName.value = `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim()
    superLevel.value = userInfo.super_level || ''

    const dt = new Date()
    userImg.value = `${userInfo.img || ''}${userInfo.id || ''}_40_40.png?v=${dt.getTime()}`
  } else {
    istoken.value = false
  }
}

const logout = () => {
  localStorage.removeItem('loginto')
  window.location.href = '/login'
  window.localStorage.clear()
}

const handleSelect = (key) => {
  activeIndex2.value = key
  if (key == '/login') {
    logout()
    window.location.href = key
    return
  } else if (key == '0') {
    activeIndex2.value = '/'
    router.push('/')
  } else if (key == '/track') {
    router.push('/track')
  } else {
    window.location.href = key
  }
}

const legacyAppOrigin = 'https://app.cargosoon.com'

const goCodrop = () => {
  window.open('https://codropshipping.com/', '_blank')
}

const goLogin = () => {
  window.location.href = `${legacyAppOrigin}/login`
}

const goSignUp = () => {
  window.location.href = `${legacyAppOrigin}/login`
}

const goQuote = () => {
  if (isHome2.value) {
    const el = document.getElementById('ai-quote-box')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  router.push({ name: 'fcl-ddp-freight' })
}

const openAssistantPage = () => {
  router.push({
    name: 'chat',
    query: { mode: 'ai' },
  })
}

const openTrackingPage = () => {
  router.push({ name: 'track' })
}

const goWarehouse = () => {
  window.location.href = '/warehouse/SKUManagement'
}
const goWarehouseBox = () => {
  window.location.href = '/warehouse/PreloadManagement'
}
const goWarehouseApply = () => {
  window.location.href = '/warehouse/Apply'
}
const goWarehouseInventory = () => {
  window.location.href = '/warehouse/InventoryStatistics'
}
const goWarehouseTransfer = () => {
  window.location.href = '/warehouse/CargoManagements'
}
const goShippingOrder = () => {
  window.location.href = '/order/shippingOrder'
}
const goStore = () => {
  window.location.href = '/account/Shopify'
}
const goStoreOrder = () => {
  window.location.href = '/account/storeOrder'
}
const goBilling = () => {
  window.location.href = '/account/Bill'
}
const goAboutUs = () => {
  window.location.href = '/aboutUs'
}

const syncLandingNavState = () => {
  if (route.name === 'chat') {
    activeLandingKey.value = 'assistant'
    return
  }

  if (route.name === 'track' || route.name === 'track-result') {
    activeLandingKey.value = 'quote'
    return
  }

  if (route.name === 'fcl-ddp-freight') {
    activeLandingKey.value = 'quote'
    return
  }

  activeLandingKey.value = ''
}

const activateLanding = (key, handler) => {
  activeLandingKey.value = key
  openLandingMenu.value = ''
  handler()
}

const toggleLandingMenu = (key) => {
  openLandingMenu.value = openLandingMenu.value === key ? '' : key
}

const handleLandingItemClick = (key, handler) => {
  activeLandingKey.value = key
  openLandingMenu.value = ''
  handler()
}

const handleDocumentClick = (event) => {
  if (!event.target.closest('.landing-dropdown')) {
    openLandingMenu.value = ''
  }
}

onMounted(() => {
  syncLandingNavState()
  document.addEventListener('click', handleDocumentClick)
})

watch(() => route.name, syncLandingNavState, { immediate: true })

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="relative">
    <template v-if="usesLandingNav">
      <header class="landing-nav">
        <nav class="landing-links">
          <button
            :class="{ 'is-active': activeLandingKey === 'assistant' }"
            @click="activateLanding('assistant', openAssistantPage)"
          >
            AI Assistant
          </button>
          <div
            class="landing-dropdown"
            :class="{
              'is-active': activeLandingKey === 'quote',
              'is-open': openLandingMenu === 'quote',
            }"
          >
            <button
              type="button"
              class="landing-dropdown-trigger"
              :class="{ 'is-active': activeLandingKey === 'quote' }"
              @click.stop="toggleLandingMenu('quote')"
            >
              Quote
              <span class="landing-dropdown-caret" aria-hidden="true"></span>
            </button>
            <div class="landing-dropdown-menu">
              <button type="button" @click.stop="handleLandingItemClick('quote', goQuote)">
                FCL/DDP freight
              </button>
              <button type="button" @click.stop="handleLandingItemClick('quote', goShippingOrder)">
                Order
              </button>
              <button type="button" @click.stop="handleLandingItemClick('quote', openTrackingPage)">
                Tracking
              </button>
            </div>
          </div>
          <div
            class="landing-dropdown"
            :class="{
              'is-active': activeLandingKey === 'warehouse',
              'is-open': openLandingMenu === 'warehouse',
            }"
          >
            <button
              type="button"
              class="landing-dropdown-trigger"
              :class="{ 'is-active': activeLandingKey === 'warehouse' }"
              @click.stop="toggleLandingMenu('warehouse')"
            >
              Warehouse
              <span class="landing-dropdown-caret" aria-hidden="true"></span>
            </button>
            <div class="landing-dropdown-menu">
              <button type="button" @click.stop="handleLandingItemClick('warehouse', goWarehouse)">
                Product
              </button>
              <button
                type="button"
                @click.stop="handleLandingItemClick('warehouse', goWarehouseBox)"
              >
                Box
              </button>
              <button
                type="button"
                @click.stop="handleLandingItemClick('warehouse', goWarehouseApply)"
              >
                Apply
              </button>
              <button
                type="button"
                @click.stop="handleLandingItemClick('warehouse', goWarehouseInventory)"
              >
                Inventory
              </button>
              <button
                type="button"
                @click.stop="handleLandingItemClick('warehouse', goWarehouseTransfer)"
              >
                Transfer inventory
              </button>
            </div>
          </div>
          <div
            class="landing-dropdown"
            :class="{
              'is-active': activeLandingKey === 'dropshipping',
              'is-open': openLandingMenu === 'dropshipping',
            }"
          >
            <button
              type="button"
              class="landing-dropdown-trigger"
              :class="{ 'is-active': activeLandingKey === 'dropshipping' }"
              @click.stop="toggleLandingMenu('dropshipping')"
            >
              DropShipping
              <span class="landing-dropdown-caret" aria-hidden="true"></span>
            </button>
            <div class="landing-dropdown-menu">
              <button type="button" @click.stop="handleLandingItemClick('dropshipping', goCodrop)">
                CoDropshipping
              </button>
              <button type="button" @click.stop="handleLandingItemClick('dropshipping', goStore)">
                Store
              </button>
              <button
                type="button"
                @click.stop="handleLandingItemClick('dropshipping', goStoreOrder)"
              >
                Store Order
              </button>
            </div>
          </div>
          <button
            :class="{ 'is-active': activeLandingKey === 'billing' }"
            @click="activateLanding('billing', goBilling)"
          >
            Billing
          </button>
          <button
            :class="{ 'is-active': activeLandingKey === 'about' }"
            @click="activateLanding('about', goAboutUs)"
          >
            About Us
          </button>
        </nav>

        <div class="landing-actions">
          <button class="landing-link-btn" @click="goLogin">Log in</button>
        </div>
      </header>
    </template>

    <template v-else>
      <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#112f66"
        text-color="#fff"
        active-text-color="#e58d36"
        @select="handleSelect"
      >
        <el-menu-item index="0">
          <div class="flex ml-6 items-center">
            <a class="flex items-center" href="/" target="_blank">
              <img
                src="@/assets/logo/co-logistics.png"
                class="h-10"
                alt=""
                v-if="isCoLogisticsHost"
              />

              <div v-else class="flex items-center">
                <img
                  src="@/assets/logo/cargosoonLogo1.png"
                  class="h-8 mr-1 hidden sm:block"
                  alt=""
                />
                <img src="@/assets/logo/cargosoonLogo2.png" class="h-6" alt="" />
              </div>
            </a>

            <div class="mx-3 w-3xs">
              <el-input v-model="input" placeholder="Please input" :prefix-icon="Search" />
            </div>
          </div>
        </el-menu-item>

        <el-menu-item index="/">Home</el-menu-item>
        <el-sub-menu index="2">
          <template #title>Quote</template>
          <el-menu-item index="/main/pricelist">FCL/DDP freight</el-menu-item>
          <el-menu-item index="/order/shippingOrder">Order</el-menu-item>
          <el-menu-item index="/track">Tracking</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>Warehouse</template>
          <el-menu-item index="/warehouse/SKUManagement">Product</el-menu-item>
          <el-menu-item index="/warehouse/PreloadManagement">Box</el-menu-item>
          <el-menu-item index="/warehouse/Apply">Apply</el-menu-item>
          <el-menu-item index="/warehouse/InventoryStatistics">Inventory</el-menu-item>
          <el-menu-item index="/warehouse/CargoManagements">Transfer inventory</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>DropShipping</template>
          <div class="meun-item" @click="goCodrop">CoDropshipping</div>
          <el-menu-item index="/account/Shopify">Store</el-menu-item>
          <el-menu-item index="/account/storeOrder">Store Order</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/account/Bill">Billing</el-menu-item>
        <el-menu-item index="/aboutUs">About Us</el-menu-item>

        <div class="flex items-center absolute right-10 h-full">
          <div v-if="istoken" class="flex items-center">
            <Notice></Notice>
            <el-sub-menu index="5">
              <template #title>
                <div class="p-1 flex items-center">
                  <div class="relative">
                    <img :src="userImg" class="mr-1 sm:mr-4 w-10 h-10 rounded-full" alt="" />
                    <img
                      v-if="superLevel == 'L1'"
                      src="@/assets/logo/lv1.png"
                      class="absolute right-0 -bottom-1.5 w-7"
                      alt=""
                    />
                    <img
                      v-if="superLevel == 'L2'"
                      src="@/assets/logo/lv2.png"
                      class="absolute right-0 -bottom-1.5 w-7"
                      alt=""
                    />
                  </div>
                  <div class="max-w-200 overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {{ userName }}
                  </div>
                </div>
              </template>
              <el-menu-item index="/account/wallet">Wallet</el-menu-item>
              <el-menu-item index="/accountnav">Account</el-menu-item>
              <el-menu-item index="/main/issus">Feedback</el-menu-item>
              <el-menu-item index="/main/assessment">Assessment</el-menu-item>
              <el-menu-item index="/main/FBAwarehouse">FBA Warehouse Address</el-menu-item>
              <el-menu-item index="/login">Logout</el-menu-item>
            </el-sub-menu>
          </div>

          <div v-else class="mr-8">
            <button
              class="text-sm px-3 py-0.5 rounded bg-orange hover:bg-orange1 text-white"
              @click="goLogin"
            >
              Log in
            </button>
            <button
              class="ml-3 text-sm px-3 py-0.5 rounded bg-orange hover:bg-orange1 text-white"
              @click="goSignUp"
            >
              Sign up
            </button>
          </div>
        </div>
      </el-menu>
    </template>

    <LoadingVue v-show="loadingStore.showLoading"></LoadingVue>
    <router-view />
  </div>
</template>

<style scoped>
.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 10px;
  background: #ffffff;
}

.landing-links {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 0;
  margin-right: auto;
}

.landing-links button,
.landing-dropdown-trigger,
.landing-dropdown-menu button,
.landing-link-btn,
.landing-cta-btn {
  border: 0;
  cursor: pointer;
}

.landing-links button,
.landing-dropdown-trigger {
  position: relative;
  background: transparent;
  color: #222222;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  transition: color 0.18s ease;
}

.landing-links button:hover,
.landing-links button:focus-visible,
.landing-links button:active,
.landing-links button.is-active,
.landing-dropdown-trigger:hover,
.landing-dropdown-trigger:focus-visible,
.landing-dropdown-trigger.is-active,
.landing-dropdown:hover .landing-dropdown-trigger,
.landing-dropdown.is-open .landing-dropdown-trigger {
  color: #f26a1b;
}

.landing-links button:focus-visible,
.landing-dropdown-trigger:focus-visible {
  outline: 0;
}

.landing-links button.is-active::after,
.landing-dropdown-trigger.is-active::after,
.landing-dropdown:hover .landing-dropdown-trigger::after,
.landing-dropdown.is-open .landing-dropdown-trigger::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 2px;
  border-radius: 999px;
  background: #f26a1b;
}

.landing-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.landing-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.landing-dropdown-caret {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-1px);
  transition: transform 0.18s ease;
}

.landing-dropdown:hover .landing-dropdown-caret,
.landing-dropdown.is-open .landing-dropdown-caret {
  transform: rotate(225deg) translateY(-1px);
}

.landing-dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  min-width: 188px;
  padding: 8px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(242, 106, 27, 0.14);
  box-shadow: 0 18px 38px rgba(37, 32, 28, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s ease;
  z-index: 30;
}

.landing-dropdown:hover .landing-dropdown-menu,
.landing-dropdown.is-open .landing-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.landing-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 20px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-top: 1px solid rgba(242, 106, 27, 0.12);
  border-left: 1px solid rgba(242, 106, 27, 0.12);
  transform: rotate(45deg);
}

.landing-dropdown-menu button {
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: transparent;
  color: #2d2a27;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.25;
  border-radius: 10px;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.landing-dropdown-menu button:first-child {
  margin-top: 0;
}

.landing-dropdown-menu button:hover {
  background: #fff4ec;
  color: #f26a1b;
}

.landing-link-btn {
  min-width: 48px;
  height: 28px;
  padding: 0 13px;
  border-radius: 7px;
  background: #f26a1b;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.landing-link-btn:hover {
  background: #e45f14;
  box-shadow: 0 8px 20px rgba(242, 106, 27, 0.2);
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
}

.meun-item {
  height: 36px;
  line-height: 36px;
  padding: 0 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.meun-item:hover {
  outline: 0;
  background-color: rgb(14, 38, 82);
}

@media (max-width: 900px) {
  .landing-nav {
    padding: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .landing-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    gap: 14px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .landing-links::-webkit-scrollbar {
    display: none;
  }

  .landing-actions {
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .landing-links {
    gap: 9px;
  }

  .landing-links button,
  .landing-dropdown-trigger,
  .landing-link-btn {
    font-size: 11px;
  }

  .landing-dropdown-menu {
    min-width: 156px;
  }
}
</style>
