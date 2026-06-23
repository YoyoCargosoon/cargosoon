<script setup>
import { computed, onMounted, ref } from 'vue'
import { Box, Document, Promotion, Search, Ship } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getLocal } from '@/utils/common'
import { getGuestTrackingUsage } from '@/services/trackingService.js'

const router = useRouter()

const trackingNumber = ref('')
const inputError = ref('')
const guestUsage = ref(getGuestTrackingUsage())

const searchableTypes = [
  { label: 'CargoSoon order', icon: Document },
  { label: 'International express', icon: Promotion },
  { label: 'Container number', icon: Box },
  { label: 'Ocean B/L or Air AWB', icon: Ship },
]

const exampleNumbers = ['CSO-DDP-SEA-1001', '1Z999AA10123456784', 'MSKU1234567', '3PL-ORDER-889900']

const isAuthenticated = computed(() => Boolean(getLocal('TOKEN')))
const guestSearchLabel = computed(() => {
  const usage = guestUsage.value
  return `${usage.remaining} of ${usage.limit} free guest searches remaining`
})

const refreshGuestUsage = () => {
  guestUsage.value = getGuestTrackingUsage()
}

const submitTracking = () => {
  const value = trackingNumber.value.trim()

  if (!value) {
    inputError.value = 'Please enter a tracking number.'
    return
  }

  inputError.value = ''
  router.push({
    name: 'track-result',
    query: { q: value },
  })
}

const applyExample = (value) => {
  trackingNumber.value = value
  inputError.value = ''
}

const goLogin = () => {
  window.location.href = '/login'
}

const goRegister = () => {
  window.location.href = '/register'
}

onMounted(refreshGuestUsage)
</script>

<template>
  <div class="track-page">
    <section class="track-shell">
      <header class="track-hero">
        <div class="hero-copy">
          <span class="track-kicker">CargoSoon Tracking</span>
          <h1>Track CargoSoon shipments and global logistics numbers</h1>
          <p>
            Search CargoSoon orders, international express, container numbers, ocean B/L, air AWB,
            and logistics company order IDs in one place.
          </p>
        </div>

        <div class="hero-note">
          <strong>Not arranged by CargoSoon?</strong>
          <span>You can still search the tracking number here.</span>
        </div>
      </header>

      <form class="track-search-panel" @submit.prevent="submitTracking">
        <label for="tracking-number">Tracking number</label>

        <div class="track-search-row">
          <input
            id="tracking-number"
            v-model="trackingNumber"
            type="text"
            autocomplete="off"
            placeholder="CargoSoon order, express tracking, container, B/L, AWB, or logistics order ID"
            @input="inputError = ''"
          />
          <button type="submit">
            <Search class="track-button-icon" aria-hidden="true" />
            Track Now
          </button>
        </div>

        <p v-if="inputError" class="track-input-error">{{ inputError }}</p>

        <div class="track-example-row">
          <span>Examples</span>
          <button
            v-for="item in exampleNumbers"
            :key="item"
            type="button"
            class="example-chip"
            @click="applyExample(item)"
          >
            {{ item }}
          </button>
        </div>
      </form>

      <section class="searchable-grid" aria-label="Supported tracking types">
        <article v-for="item in searchableTypes" :key="item.label" class="searchable-card">
          <component :is="item.icon" class="searchable-icon" aria-hidden="true" />
          <strong>{{ item.label }}</strong>
        </article>
      </section>

      <div v-if="!isAuthenticated" class="track-guest-panel">
        <div>
          <strong>{{ guestSearchLabel }}</strong>
          <p>Log in to view full order details, customs status, delivery status, and documents.</p>
        </div>
        <div class="track-auth-actions">
          <button type="button" class="track-light-btn" @click="goLogin">Log In</button>
          <button type="button" class="track-primary-link" @click="goRegister">
            Create Account
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.track-page {
  min-height: calc(100vh - 60px);
  background:
    radial-gradient(circle at top, rgba(242, 106, 27, 0.08), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%);
  color: #1f2430;
}

.track-shell {
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 56px 20px 54px;
}

.track-hero {
  display: grid;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-copy {
  text-align: center;
}

.track-kicker {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff3ea;
  color: #f26a1b;
  font-size: 12px;
  font-weight: 800;
}

.hero-copy h1 {
  width: min(100%, 720px);
  margin: 16px auto 12px;
  color: #20242d;
  font-size: 46px;
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: 0;
}

.hero-copy p {
  width: min(100%, 720px);
  margin: 0 auto;
  color: #687284;
  font-size: 16px;
  line-height: 1.55;
}

.hero-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 12px 16px;
  border: 1px solid #ffd8bf;
  border-radius: 8px;
  background: #fff8f2;
}

.hero-note strong {
  color: #e45f14;
  font-size: 14px;
  font-weight: 800;
}

.hero-note span {
  color: #4d586a;
  font-size: 14px;
}

.track-search-panel {
  padding: 20px;
  border: 1px solid rgba(242, 106, 27, 0.2);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(31, 36, 48, 0.08);
}

.track-search-panel label {
  display: block;
  margin-bottom: 10px;
  color: #2f3644;
  font-size: 13px;
  font-weight: 800;
}

.track-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.track-search-row input {
  width: 100%;
  min-width: 0;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #dfe4ec;
  border-radius: 8px;
  outline: 0;
  color: #20242d;
  font-size: 15px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.track-search-row input:focus {
  border-color: #f26a1b;
  box-shadow: 0 0 0 3px rgba(242, 106, 27, 0.12);
}

.track-search-row input::placeholder {
  color: #9aa4b5;
}

.track-search-row button,
.example-chip,
.track-light-btn,
.track-primary-link {
  border: 0;
  cursor: pointer;
  white-space: nowrap;
}

.track-search-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 152px;
  height: 52px;
  padding: 0 22px;
  border-radius: 8px;
  background: #f26a1b;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(242, 106, 27, 0.18);
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.track-search-row button:hover {
  background: #e45f14;
  transform: translateY(-1px);
}

.track-button-icon {
  width: 17px;
  height: 17px;
}

.track-input-error {
  margin: 10px 0 0;
  color: #c93a22;
  font-size: 13px;
}

.track-example-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.track-example-row span {
  color: #8791a1;
  font-size: 12px;
  font-weight: 800;
}

.example-chip {
  height: 28px;
  padding: 0 11px;
  border: 1px solid #e5eaf1;
  border-radius: 999px;
  background: #f7f8fb;
  color: #5f697a;
  font-size: 12px;
  font-weight: 800;
}

.example-chip:hover {
  background: #fff3ea;
  color: #e45f14;
}

.searchable-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.searchable-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 0 14px;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  background: #ffffff;
}

.searchable-icon {
  width: 17px;
  height: 17px;
  color: #f26a1b;
  flex: 0 0 auto;
}

.searchable-card strong {
  color: #293241;
  font-size: 13px;
  line-height: 1.3;
  font-weight: 800;
}

.track-guest-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  background: #ffffff;
}

.track-guest-panel strong {
  color: #293241;
  font-size: 14px;
}

.track-guest-panel p {
  margin: 5px 0 0;
  color: #707b8c;
  font-size: 13px;
  line-height: 1.4;
}

.track-auth-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.track-light-btn,
.track-primary-link {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
}

.track-light-btn {
  background: #fff3ea;
  color: #e45f14;
}

.track-primary-link {
  background: #1f2430;
  color: #ffffff;
}

@media (max-width: 860px) {
  .searchable-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .track-shell {
    padding: 42px 16px 36px;
  }

  .hero-copy h1 {
    font-size: 34px;
  }

  .hero-note {
    align-items: flex-start;
    flex-direction: column;
  }

  .track-search-row {
    grid-template-columns: 1fr;
  }

  .track-search-row button {
    width: 100%;
  }

  .track-guest-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .track-auth-actions {
    width: 100%;
  }

  .track-light-btn,
  .track-primary-link {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .track-shell {
    padding-top: 30px;
  }

  .hero-copy h1 {
    font-size: 30px;
  }

  .hero-copy p,
  .hero-note span {
    font-size: 14px;
  }

  .track-search-panel {
    padding: 14px;
  }

  .searchable-grid {
    grid-template-columns: 1fr;
  }
}
</style>
