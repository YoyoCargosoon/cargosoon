<script setup>
import { computed, onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getLocal } from '@/utils/common'
import { getGuestTrackingUsage } from '@/services/trackingService'

const router = useRouter()

const trackingNumber = ref('')
const inputError = ref('')
const guestUsage = ref(getGuestTrackingUsage())

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
      <header class="track-heading">
        <span class="track-kicker">Shipment Tracking</span>
        <h1>Track any shipment number</h1>
        <p>
          Search CargoSoon orders, international express, container numbers, ocean B/L, air AWB, and
          logistics company order IDs.
        </p>
      </header>

      <div class="global-note">
        <strong>Not arranged by CargoSoon?</strong>
        <span>You can still enter the tracking number here.</span>
      </div>

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

        <div class="track-supports" aria-label="Supported tracking types">
          <span>CargoSoon orders</span>
          <span>International express</span>
          <span>Container No.</span>
          <span>Ocean B/L</span>
          <span>Air AWB</span>
          <span>Logistics order ID</span>
        </div>
      </form>

      <div v-if="!isAuthenticated" class="track-guest-panel">
        <div>
          <strong>{{ guestSearchLabel }}</strong>
          <p>Log in to view full order details, documents, customs, and delivery status.</p>
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
  background: linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%);
  color: #1f2430;
}

.track-shell {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 58px 20px 52px;
}

.track-heading {
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

.track-heading h1 {
  margin: 16px 0 12px;
  color: #20242d;
  font-size: 44px;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: 0;
}

.track-heading p {
  width: min(100%, 680px);
  margin: 0 auto;
  color: #687284;
  font-size: 16px;
  line-height: 1.55;
}

.global-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: min(100%, 760px);
  margin: 22px auto 0;
  padding: 12px 16px;
  border: 1px solid #ffd8bf;
  border-radius: 8px;
  background: #fff8f2;
}

.global-note strong {
  color: #e45f14;
  font-size: 14px;
  font-weight: 800;
}

.global-note span {
  color: #4d586a;
  font-size: 14px;
}

.track-search-panel {
  margin: 20px auto 0;
  padding: 18px;
  border: 1px solid rgba(242, 106, 27, 0.22);
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
  height: 50px;
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
  min-width: 148px;
  height: 50px;
  padding: 0 22px;
  border-radius: 8px;
  background: #f26a1b;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(242, 106, 27, 0.2);
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

.track-supports {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.track-supports span {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f5f7fb;
  color: #687284;
  font-size: 12px;
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

@media (max-width: 720px) {
  .track-shell {
    padding: 42px 16px 36px;
  }

  .track-heading h1 {
    font-size: 34px;
  }

  .global-note {
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

@media (max-width: 480px) {
  .track-shell {
    padding-top: 30px;
  }

  .track-heading h1 {
    font-size: 30px;
  }

  .track-heading p,
  .global-note span {
    font-size: 14px;
  }

  .track-search-panel {
    padding: 14px;
  }
}
</style>
