<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isHome2 = computed(() => route.name === 'home2' || route.name === 'home')
const isTrackPage = computed(() => route.name === 'track' || route.name === 'track-result')
const isFreightPage = computed(() => route.name === 'fcl-ddp-freight')
const usesLandingNav = computed(() => isHome2.value || isTrackPage.value || isFreightPage.value)

const activeLandingKey = ref('')
const openLandingMenu = ref('')

const goLogin = () => {
  window.location.href = 'https://app.cargosoon.com/login'
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
  const target = router.resolve({ name: 'chat', query: { mode: 'ai' } })

  if (route.fullPath === target.fullPath) {
    return
  }

  router.push(target).catch(() => {
    window.location.href = target.href
  })
}

const openTrackingPage = () => {
  router.push({ name: 'track' })
}

const handleExternalJump = (path) => {
  window.location.href = path
}

const goCodrop = () => {
  window.open('https://codropshipping.com/', '_blank')
}

const syncLandingNavState = () => {
  if (route.name === 'chat') {
    activeLandingKey.value = 'assistant'
    return
  }

  if (route.name === 'track' || route.name === 'track-result' || route.name === 'fcl-ddp-freight') {
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
  <header v-if="usesLandingNav" class="landing-nav">
    <nav class="landing-links">
      <button
        :class="{ 'is-active': activeLandingKey === 'assistant' }"
        @click="activateLanding('assistant', openAssistantPage)"
      >
        AI Assistant
      </button>

      <div
        class="landing-dropdown"
        :class="{ 'is-active': activeLandingKey === 'quote', 'is-open': openLandingMenu === 'quote' }"
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
          <button type="button" @click.stop="handleLandingItemClick('quote', goQuote)">FCL/DDP freight</button>
          <button type="button" @click.stop="handleLandingItemClick('quote', () => handleExternalJump('/order/shippingOrder'))">Order</button>
          <button type="button" @click.stop="handleLandingItemClick('quote', openTrackingPage)">Tracking</button>
        </div>
      </div>

      <div
        class="landing-dropdown"
        :class="{ 'is-active': activeLandingKey === 'warehouse', 'is-open': openLandingMenu === 'warehouse' }"
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
          <button type="button" @click.stop="handleLandingItemClick('warehouse', () => handleExternalJump('/warehouse/SKUManagement'))">Product</button>
          <button type="button" @click.stop="handleLandingItemClick('warehouse', () => handleExternalJump('/warehouse/PreloadManagement'))">Box</button>
          <button type="button" @click.stop="handleLandingItemClick('warehouse', () => handleExternalJump('/warehouse/Apply'))">Apply</button>
          <button type="button" @click.stop="handleLandingItemClick('warehouse', () => handleExternalJump('/warehouse/InventoryStatistics'))">Inventory</button>
          <button type="button" @click.stop="handleLandingItemClick('warehouse', () => handleExternalJump('/warehouse/CargoManagements'))">Transfer inventory</button>
        </div>
      </div>

      <div
        class="landing-dropdown"
        :class="{ 'is-active': activeLandingKey === 'dropshipping', 'is-open': openLandingMenu === 'dropshipping' }"
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
          <button type="button" @click.stop="handleLandingItemClick('dropshipping', goCodrop)">CoDropshipping</button>
          <button type="button" @click.stop="handleLandingItemClick('dropshipping', () => handleExternalJump('/account/Shopify'))">Store</button>
          <button type="button" @click.stop="handleLandingItemClick('dropshipping', () => handleExternalJump('/account/storeOrder'))">Store Order</button>
        </div>
      </div>

      <button :class="{ 'is-active': activeLandingKey === 'billing' }" @click="activateLanding('billing', () => handleExternalJump('/account/Bill'))">
        Billing
      </button>
      <button :class="{ 'is-active': activeLandingKey === 'about' }" @click="activateLanding('about', () => handleExternalJump('/aboutUs'))">
        About Us
      </button>
    </nav>

    <div class="landing-actions">
      <button class="landing-link-btn" @click="goLogin">Log in</button>
    </div>
  </header>
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
  margin-right: auto;
}

.landing-links button,
.landing-dropdown-trigger,
.landing-dropdown-menu button,
.landing-link-btn {
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
.landing-links button.is-active,
.landing-dropdown-trigger:hover,
.landing-dropdown-trigger:focus-visible,
.landing-dropdown-trigger.is-active,
.landing-dropdown:hover .landing-dropdown-trigger,
.landing-dropdown.is-open .landing-dropdown-trigger {
  color: #f26a1b;
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
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
  z-index: 30;
}

.landing-dropdown:hover .landing-dropdown-menu,
.landing-dropdown.is-open .landing-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
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
  transition: background 0.16s ease, color 0.16s ease;
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
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
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
