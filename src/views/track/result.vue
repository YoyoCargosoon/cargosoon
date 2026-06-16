<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { getLocal } from '@/utils/common'
import {
  EMPTY_TRACKING_MESSAGE,
  TRACKING_SOURCE_LABELS,
  getGuestTrackingUsage,
  searchTracking,
} from '@/services/trackingService'

const route = useRoute()
const router = useRouter()

const trackingNumber = ref('')
const inputError = ref('')
const state = ref('idle')
const message = ref('')
const result = ref(null)
const guestUsage = ref(getGuestTrackingUsage())

const isAuthenticated = computed(() => Boolean(getLocal('TOKEN')))
const sourceLabel = computed(() =>
  result.value ? TRACKING_SOURCE_LABELS[result.value.source] || 'Tracking' : 'Tracking',
)
const visibleEvents = computed(() => {
  if (!result.value) return []
  return isAuthenticated.value ? result.value.events : result.value.events.slice(0, 2)
})
const statusClass = computed(() => {
  const status = result.value?.status || ''
  if (status === 'delivered') return 'is-delivered'
  if (status.includes('customs')) return 'is-warning'
  if (status.includes('warehouse')) return 'is-processing'
  return 'is-active'
})
const guestSearchLabel = computed(() => {
  const usage = guestUsage.value
  return `${usage.remaining} of ${usage.limit} free guest searches remaining`
})
const routeText = computed(() => {
  if (!result.value?.route?.length)
    return `${result.value?.origin || ''} to ${result.value?.destination || ''}`
  return result.value.route.join(' -> ')
})
const hasFullDetails = computed(
  () =>
    isAuthenticated.value &&
    result.value &&
    (result.value.orderInfo ||
      result.value.cargoInfo ||
      result.value.customs ||
      result.value.delivery ||
      result.value.documents?.length),
)

const labelMap = {
  orderNumber: 'Order number',
  incoterm: 'Incoterm',
  customerReference: 'Customer reference',
  serviceLevel: 'Service level',
  consignee: 'Consignee',
  commodity: 'Commodity',
  cartons: 'Cartons',
  grossWeight: 'Gross weight',
  volume: 'Volume',
  destinationZip: 'Destination ZIP',
  status: 'Status',
  note: 'Note',
  appointment: 'Appointment',
}

const formatDetailRows = (details) =>
  Object.entries(details || {}).map(([key, value]) => ({
    label:
      labelMap[key] ||
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase())
        .trim(),
    value,
  }))

const loadTracking = async (value) => {
  const trimmed = value.trim()

  if (!trimmed) {
    state.value = 'idle'
    message.value = ''
    result.value = null
    return
  }

  state.value = 'loading'
  message.value = ''
  result.value = null

  try {
    const response = await searchTracking({
      trackingNumber: trimmed,
      isAuthenticated: isAuthenticated.value,
    })

    guestUsage.value = response.usage

    if (response.status === 'found') {
      result.value = response.result
      state.value = 'found'
      return
    }

    state.value = response.status
    message.value = response.message
  } catch (error) {
    state.value = 'error'
    message.value = 'Tracking service is temporarily unavailable. Please try again.'
  }
}

const submitTracking = () => {
  const value = trackingNumber.value.trim()

  if (!value) {
    inputError.value = 'Please enter a tracking number.'
    return
  }

  inputError.value = ''

  if (route.query.q === value) {
    loadTracking(value)
    return
  }

  router.push({
    name: 'track-result',
    query: { q: value },
  })
}

const goBack = () => {
  router.push('/track')
}

const goLogin = () => {
  window.location.href = '/login'
}

const goRegister = () => {
  window.location.href = '/register'
}

watch(
  () => route.query.q,
  (query) => {
    const value = Array.isArray(query) ? query[0] || '' : query || ''
    trackingNumber.value = value
    inputError.value = ''
    loadTracking(value)
  },
  { immediate: true },
)
</script>

<template>
  <div class="track-result-page">
    <section class="track-result-shell">
      <button type="button" class="back-link" @click="goBack">
        <ArrowLeft class="back-icon" aria-hidden="true" />
        Back to Track
      </button>

      <div class="result-heading">
        <span class="track-kicker">Shipment tracking</span>
        <h1>Tracking Result</h1>
      </div>

      <form class="result-search-panel" @submit.prevent="submitTracking">
        <div class="result-search-row">
          <input
            v-model="trackingNumber"
            type="text"
            autocomplete="off"
            placeholder="CargoSoon order, express tracking, container, B/L, AWB, or logistics order ID"
            @input="inputError = ''"
          />
          <button type="submit">
            <Search class="result-button-icon" aria-hidden="true" />
            Track Now
          </button>
        </div>
        <p v-if="inputError" class="result-input-error">{{ inputError }}</p>
      </form>

      <div v-if="state === 'loading'" class="state-panel">
        <span class="loading-ring" aria-hidden="true"></span>
        <h2>Checking shipment status</h2>
        <p>
          We are searching CargoSoon orders, express, container, B/L, AWB and logistics order
          sources.
        </p>
      </div>

      <div v-else-if="state === 'idle'" class="state-panel">
        <h2>Enter a tracking number</h2>
        <p>Use the search box above to check the latest shipment status.</p>
      </div>

      <div v-else-if="state === 'empty'" class="state-panel">
        <h2>No result found</h2>
        <p>{{ message || EMPTY_TRACKING_MESSAGE }}</p>
      </div>

      <div v-else-if="state === 'error'" class="state-panel is-error">
        <h2>Something went wrong</h2>
        <p>{{ message }}</p>
        <button type="button" @click="submitTracking">Try Again</button>
      </div>

      <div v-else-if="state === 'limited'" class="state-panel is-limit">
        <h2>Free search limit reached</h2>
        <p>{{ message }}</p>
        <div class="state-actions">
          <button type="button" class="state-light-btn" @click="goLogin">Log In</button>
          <button type="button" class="state-primary-btn" @click="goRegister">
            Create Account
          </button>
        </div>
      </div>

      <template v-else-if="state === 'found' && result">
        <section class="result-summary-panel">
          <div class="summary-top">
            <div>
              <span class="source-tag">{{ sourceLabel }}</span>
              <h2>{{ result.displayNumber }}</h2>
            </div>
            <span :class="['status-pill', statusClass]">{{ result.statusLabel }}</span>
          </div>

          <p class="latest-update">{{ result.latestUpdate }}</p>

          <div class="summary-grid">
            <div>
              <span>Origin</span>
              <strong>{{ result.origin }}</strong>
            </div>
            <div>
              <span>Destination</span>
              <strong>{{ result.destination }}</strong>
            </div>
            <div>
              <span>Service</span>
              <strong>{{ result.service || '-' }}</strong>
            </div>
            <div>
              <span>Carrier</span>
              <strong>{{ result.carrier || '-' }}</strong>
            </div>
            <div>
              <span>ETD</span>
              <strong>{{ result.etd || '-' }}</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{{ result.eta || '-' }}</strong>
            </div>
          </div>

          <div class="route-strip">
            <span>Route</span>
            <strong>{{ routeText }}</strong>
          </div>

          <div v-if="!isAuthenticated" class="guest-result-callout">
            <div>
              <strong>{{ guestSearchLabel }}</strong>
              <p>
                Log in to view full timeline, order details, cargo info, documents, and delivery
                status.
              </p>
            </div>
            <div class="guest-actions">
              <button type="button" class="state-light-btn" @click="goLogin">Log In</button>
              <button type="button" class="state-primary-btn" @click="goRegister">
                Create Account
              </button>
            </div>
          </div>
        </section>

        <section class="timeline-panel">
          <div class="section-head">
            <h2>{{ isAuthenticated ? 'Full Tracking Timeline' : 'Latest Updates' }}</h2>
          </div>

          <div class="timeline-list">
            <article
              v-for="(event, index) in visibleEvents"
              :key="event.time + event.title"
              :class="['timeline-item', { 'is-first': index === 0 }]"
            >
              <div class="timeline-marker" aria-hidden="true"></div>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span>{{ event.time }}</span>
                  <span>{{ event.location }}</span>
                </div>
                <h3>{{ event.title }}</h3>
                <p>{{ event.description }}</p>
              </div>
            </article>
          </div>
        </section>

        <section v-if="hasFullDetails" class="details-grid">
          <article v-if="result.orderInfo" class="detail-panel">
            <h2>Order Information</h2>
            <dl>
              <template v-for="item in formatDetailRows(result.orderInfo)" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </template>
            </dl>
          </article>

          <article v-if="result.cargoInfo" class="detail-panel">
            <h2>Cargo Information</h2>
            <dl>
              <template v-for="item in formatDetailRows(result.cargoInfo)" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </template>
            </dl>
          </article>

          <article v-if="result.customs" class="detail-panel">
            <h2>Customs Status</h2>
            <dl>
              <template v-for="item in formatDetailRows(result.customs)" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </template>
            </dl>
          </article>

          <article v-if="result.delivery" class="detail-panel">
            <h2>Delivery Status</h2>
            <dl>
              <template v-for="item in formatDetailRows(result.delivery)" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </template>
            </dl>
          </article>

          <article v-if="result.documents?.length" class="detail-panel detail-documents">
            <h2>Documents</h2>
            <ul>
              <li v-for="document in result.documents" :key="document.name">
                <span>{{ document.name }}</span>
                <strong>{{ document.status }}</strong>
              </li>
            </ul>
          </article>
        </section>
      </template>
    </section>
  </div>
</template>

<style scoped>
.track-result-page {
  min-height: calc(100vh - 60px);
  background: #f7f8fb;
  color: #1f2430;
}

.track-result-shell {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: 34px 20px 56px;
}

.back-link,
.result-search-row button,
.state-panel button,
.guest-actions button {
  border: 0;
  cursor: pointer;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 24px;
  padding: 0;
  background: transparent;
  color: #687284;
  font-size: 13px;
  font-weight: 800;
}

.back-link:hover {
  color: #f26a1b;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.result-heading {
  margin-bottom: 18px;
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

.result-heading h1 {
  margin: 12px 0 0;
  color: #20242d;
  font-size: 32px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: 0;
}

.result-search-panel,
.result-summary-panel,
.timeline-panel,
.detail-panel,
.state-panel {
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(31, 36, 48, 0.06);
}

.result-search-panel {
  padding: 14px;
  margin-bottom: 18px;
}

.result-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.result-search-row input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #dfe4ec;
  border-radius: 8px;
  outline: 0;
  color: #20242d;
  font-size: 14px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.result-search-row input:focus {
  border-color: #f26a1b;
  box-shadow: 0 0 0 3px rgba(242, 106, 27, 0.12);
}

.result-search-row input::placeholder {
  color: #9aa4b5;
}

.result-search-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  min-width: 136px;
  padding: 0 18px;
  border-radius: 8px;
  background: #f26a1b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
}

.result-button-icon {
  width: 16px;
  height: 16px;
}

.result-input-error {
  margin: 9px 0 0;
  color: #c93a22;
  font-size: 13px;
}

.state-panel {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;
  padding: 32px;
  text-align: center;
}

.state-panel h2 {
  margin: 12px 0 8px;
  color: #20242d;
  font-size: 22px;
  font-weight: 800;
}

.state-panel p {
  width: min(100%, 500px);
  margin: 0;
  color: #687284;
  font-size: 14px;
  line-height: 1.55;
}

.loading-ring {
  width: 36px;
  height: 36px;
  border: 3px solid #ffe3d1;
  border-top-color: #f26a1b;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.state-panel.is-error {
  border-color: #f3c2b8;
}

.state-panel.is-limit {
  border-color: #ffd7bd;
}

.state-panel button,
.state-light-btn,
.state-primary-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.state-panel > button {
  margin-top: 16px;
  background: #f26a1b;
  color: #ffffff;
}

.state-actions,
.guest-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.state-light-btn {
  background: #fff3ea;
  color: #e45f14;
}

.state-primary-btn {
  background: #1f2430;
  color: #ffffff;
}

.result-summary-panel {
  padding: 22px;
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: #fff3ea;
  color: #f26a1b;
  font-size: 12px;
  font-weight: 800;
}

.summary-top h2 {
  margin: 10px 0 0;
  color: #20242d;
  font-size: 28px;
  line-height: 1.16;
  font-weight: 800;
  word-break: break-word;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.status-pill.is-active {
  background: #eef4ff;
  color: #2463ad;
}

.status-pill.is-delivered {
  background: #edf9f0;
  color: #23804a;
}

.status-pill.is-warning {
  background: #fff6df;
  color: #a66a00;
}

.status-pill.is-processing {
  background: #f1edff;
  color: #5a42a0;
}

.latest-update {
  margin: 18px 0 0;
  color: #465163;
  font-size: 15px;
  line-height: 1.5;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.summary-grid div,
.route-strip {
  min-width: 0;
  padding: 13px;
  border-radius: 8px;
  background: #f7f8fb;
}

.summary-grid span,
.route-strip span {
  display: block;
  margin-bottom: 5px;
  color: #8791a1;
  font-size: 12px;
  font-weight: 800;
}

.summary-grid strong,
.route-strip strong {
  color: #293241;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.route-strip {
  margin-top: 14px;
}

.guest-result-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 18px;
  padding: 15px;
  border-radius: 8px;
  background: #fff8f2;
}

.guest-result-callout strong {
  color: #293241;
  font-size: 14px;
}

.guest-result-callout p {
  margin: 4px 0 0;
  color: #707b8c;
  font-size: 13px;
  line-height: 1.45;
}

.timeline-panel {
  margin-top: 18px;
  padding: 22px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.section-head h2,
.detail-panel h2 {
  margin: 0;
  color: #20242d;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 800;
}

.timeline-list {
  position: relative;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 12px;
  padding: 0 0 18px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 18px;
  bottom: -2px;
  width: 2px;
  background: #e7ebf2;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-marker {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: 3px solid #ffd9bf;
  border-radius: 999px;
  background: #ffffff;
}

.timeline-item.is-first .timeline-marker {
  border-color: #f26a1b;
  background: #f26a1b;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #8791a1;
  font-size: 12px;
  font-weight: 800;
}

.timeline-content h3 {
  margin: 5px 0 5px;
  color: #293241;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 800;
}

.timeline-content p {
  margin: 0;
  color: #687284;
  font-size: 13px;
  line-height: 1.45;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.detail-panel {
  padding: 20px;
}

.detail-panel dl {
  display: grid;
  grid-template-columns: minmax(120px, 0.45fr) minmax(0, 1fr);
  gap: 10px 16px;
  margin: 16px 0 0;
}

.detail-panel dt {
  color: #8791a1;
  font-size: 12px;
  font-weight: 800;
}

.detail-panel dd {
  min-width: 0;
  margin: 0;
  color: #293241;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.detail-documents ul {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.detail-documents li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 12px;
  border-radius: 8px;
  background: #f7f8fb;
}

.detail-documents span {
  color: #293241;
  font-size: 13px;
  font-weight: 800;
}

.detail-documents strong {
  color: #f26a1b;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 820px) {
  .track-result-shell {
    padding: 24px 16px 40px;
  }

  .summary-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .guest-result-callout {
    align-items: stretch;
    flex-direction: column;
  }

  .guest-actions {
    justify-content: flex-start;
    margin-top: 0;
  }
}

@media (max-width: 560px) {
  .result-heading h1 {
    font-size: 28px;
  }

  .result-search-row {
    grid-template-columns: 1fr;
  }

  .result-search-row button {
    width: 100%;
  }

  .summary-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-top h2 {
    font-size: 23px;
  }

  .state-panel {
    min-height: 240px;
    padding: 24px 18px;
  }

  .state-actions,
  .guest-actions {
    width: 100%;
    flex-direction: column;
  }

  .state-light-btn,
  .state-primary-btn {
    width: 100%;
  }

  .detail-panel dl {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .detail-panel dd {
    margin-bottom: 8px;
  }
}
</style>
