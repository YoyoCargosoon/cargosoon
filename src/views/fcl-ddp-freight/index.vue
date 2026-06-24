<script setup>
import { computed, reactive, ref } from 'vue'
import { ArrowRight, Box, Search, Setting, Van, Present } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { quoteByUnifiedEngine } from '@/services/quoteEngine'
import { getLocal } from '@/utils/common'

const router = useRouter()

const COUNTRY_PROFILES = {
  US: {
    countryCode: 'US',
    marketLabel: 'United States',
    recommendationTitle: 'Recommended for your US account',
    recommendationNote: 'US accounts usually prioritize Sea DDP, Amazon FBA replenishment, and West Coast delivery paths.',
    pricingTier: 'North America tier',
    pinnedRoutes: [
      { title: 'China to USA Sea DDP', note: 'Recommended for US accounts with regular replenishment cycles.' },
      { title: 'Amazon FBA to Los Angeles', note: 'Priority flow for Amazon sellers shipping into US West warehouses.' },
      { title: 'LCL to New York', note: 'Useful for lower-volume freight when a full container is not required.' },
    ],
    quickActions: ['sea_ddp', 'fba_ddp', 'lcl'],
  },
  UK: {
    countryCode: 'UK',
    marketLabel: 'United Kingdom',
    recommendationTitle: 'Recommended for your UK account',
    recommendationNote: 'UK accounts often compare LCL, Sea DDP, and Amazon FBA delivery into local fulfilment routes.',
    pricingTier: 'UK / Europe tier',
    pinnedRoutes: [
      { title: 'China to UK Sea DDP', note: 'A common quote path for lower-cost door delivery into the UK market.' },
      { title: 'Amazon FBA to Birmingham', note: 'Useful for Amazon replenishment into UK fulfilment centres.' },
      { title: 'LCL to Felixstowe', note: 'Best for lower-volume sea freight without a full container booking.' },
    ],
    quickActions: ['sea_ddp', 'fba_sea', 'lcl'],
  },
  DE: {
    countryCode: 'DE',
    marketLabel: 'Germany',
    recommendationTitle: 'Recommended for your Germany account',
    recommendationNote: 'Germany-focused accounts often use Rail DDP, Sea DDP, and Amazon FBA replenishment into Europe.',
    pricingTier: 'EU rail / sea tier',
    pinnedRoutes: [
      { title: 'China to Germany Rail DDP', note: 'Balanced cost and timing for inland Europe delivery.' },
      { title: 'China to Hamburg Sea DDP', note: 'Useful for larger freight moving into Germany by sea.' },
      { title: 'Amazon FBA to Leipzig', note: 'Recommended for Amazon inventory into Germany and surrounding EU markets.' },
    ],
    quickActions: ['rail_ddp', 'sea_ddp', 'fba_air'],
  },
}

const DEFAULT_COUNTRY_PROFILE = COUNTRY_PROFILES.US

const quoteTypes = [
  { key: 'fcl', label: 'FCL', helper: 'Full container load', service: 'fcl', quoteType: 'FCL', module: 'fcl-page', containerType: '40HQ' },
  { key: 'lcl', label: 'LCL', helper: 'Less than container load', service: 'fcl', quoteType: 'LCL', module: 'lcl-page', containerType: 'LCL Shared Space' },
  { key: 'air_ddp', label: 'Air DDP', helper: 'Fast door delivery', service: 'ddp', quoteType: 'AIR_DDP', module: 'air-ddp-page', containerType: 'Air Cargo' },
  { key: 'sea_ddp', label: 'Sea DDP', helper: 'Cost-effective door delivery', service: 'ddp', quoteType: 'SEA_DDP', module: 'sea-ddp-page', containerType: 'Sea DDP' },
  { key: 'rail_ddp', label: 'Rail DDP', helper: 'Balanced speed and budget', service: 'ddp', quoteType: 'RAIL_DDP', module: 'rail-ddp-page', containerType: 'Rail DDP' },
  { key: 'truck_ddp', label: 'Truck DDP', helper: 'Regional ground solution', service: 'ddp', quoteType: 'TRUCK_DDP', module: 'truck-ddp-page', containerType: 'Truck DDP' },
  { key: 'fba_sea', label: 'FBA Sea', helper: 'Planned Amazon replenishment', service: 'ddp', quoteType: 'FBA_SEA', module: 'fba-sea-page', containerType: 'Amazon FBA Sea' },
  { key: 'fba_air', label: 'FBA Air', helper: 'Urgent FBA restock', service: 'ddp', quoteType: 'FBA_AIR', module: 'fba-air-page', containerType: 'Amazon FBA Air' },
  { key: 'fba_ddp', label: 'FBA DDP', helper: 'Door-to-Amazon delivery', service: 'ddp', quoteType: 'FBA_DDP', module: 'fba-ddp-page', containerType: 'Amazon FBA DDP' },
]

const quoteGroups = [
  {
    key: 'fcl-lcl',
    title: 'FCL / LCL',
    summary: 'For containerized sea freight, whether you need a full container or shared container space.',
    icon: Box,
    accent: 'navy',
    items: ['fcl', 'lcl'],
  },
  {
    key: 'ddp',
    title: 'DDP Shipping',
    summary: 'Door-to-door shipping with customs and delivery support across air, sea, rail, and truck channels.',
    icon: Van,
    accent: 'orange',
    items: ['air_ddp', 'sea_ddp', 'rail_ddp', 'truck_ddp'],
  },
  {
    key: 'fba',
    title: 'Amazon FBA',
    summary: 'Purpose-built quote flows for Amazon sellers shipping inventory from China to FBA warehouses.',
    icon: Present,
    accent: 'blue',
    items: ['fba_sea', 'fba_air', 'fba_ddp'],
  },
]

const scenarioCards = [
  {
    key: 'fba',
    title: 'Ship to Amazon FBA',
    description: 'Ideal for sellers who need sea, air, or DDP delivery into Amazon warehouses.',
    quoteKey: 'fba_ddp',
  },
  {
    key: 'door-to-door',
    title: 'Door-to-Door DDP',
    description: 'Best when you want customs support and final delivery handled together.',
    quoteKey: 'sea_ddp',
  },
  {
    key: 'full-container',
    title: 'Full Container Shipping',
    description: 'Use FCL when your shipment volume is large enough for dedicated container space.',
    quoteKey: 'fcl',
  },
  {
    key: 'small-cargo',
    title: 'Small Cargo / LCL',
    description: 'Use shared container space for lower-volume shipments that do not need a full container.',
    quoteKey: 'lcl',
  },
  {
    key: 'urgent-air',
    title: 'Urgent Air Shipment',
    description: 'Fast-moving quote path for urgent freight or stock recovery.',
    quoteKey: 'air_ddp',
  },
  {
    key: 'sourcing',
    title: '1688 Purchase + Shipping',
    description: 'For supplier coordination, inspection, consolidation, and export delivery from China.',
    quoteKey: 'fba_ddp',
  },
]

const quoteForm = reactive({
  quoteKey: 'fcl',
  origin: '',
  destination: '',
  cargo: '',
  volume: '',
})

const selectedQuote = computed(() => {
  return quoteTypes.find((item) => item.key === quoteForm.quoteKey) || quoteTypes[0]
})

const resultItems = ref([])
const isLoading = ref(false)
const hasSearched = ref(false)

const parseLocalJson = (key) => {
  const raw = getLocal(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const storedUserInfo = computed(() => parseLocalJson('userInfo'))
const storedGuestChatInfo = computed(() => parseLocalJson('chat_info'))
const isAuthenticated = computed(() => Boolean(getLocal('TOKEN')))

const inferCountryCode = () => {
  const userInfo = storedUserInfo.value || {}
  const guestInfo = storedGuestChatInfo.value || {}
  const candidates = [
    userInfo.countryCode,
    userInfo.country_code,
    userInfo.country,
    userInfo.market,
    guestInfo.countryCode,
    guestInfo.country_code,
    guestInfo.country,
    guestInfo.market,
  ]

  const matched = candidates
    .map((value) => String(value || '').trim().toUpperCase())
    .find((value) => value && COUNTRY_PROFILES[value])

  return matched || DEFAULT_COUNTRY_PROFILE.countryCode
}

const accountCountryCode = computed(() => inferCountryCode())
const activeCountryProfile = computed(() => COUNTRY_PROFILES[accountCountryCode.value] || DEFAULT_COUNTRY_PROFILE)

const activeAccountLabel = computed(() => {
  const userInfo = storedUserInfo.value || {}
  const firstName = String(userInfo.first_name || '').trim()
  const lastName = String(userInfo.last_name || '').trim()
  const companyName = String(userInfo.company_name || userInfo.company || '').trim()

  if (companyName) return companyName
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName) return fullName
  if (isAuthenticated.value && userInfo.id) return `Customer ${userInfo.id}`
  if (!isAuthenticated.value && storedGuestChatInfo.value?.chat_id) return `Guest ${storedGuestChatInfo.value.chat_id}`
  return 'Guest visitor'
})

const activeUserId = computed(() => {
  const userInfo = storedUserInfo.value || {}
  const guestInfo = storedGuestChatInfo.value || {}
  return userInfo.id || guestInfo.chat_id || 'CUS-PORTAL'
})

const activeCustomerName = computed(() => {
  return activeAccountLabel.value
})

const personalizedRoutes = computed(() => activeCountryProfile.value.pinnedRoutes)
const personalizedQuickTypes = computed(() => {
  return activeCountryProfile.value.quickActions
    .map((key) => quoteTypes.find((item) => item.key === key))
    .filter(Boolean)
})

const accountPricingTitle = computed(() => {
  return isAuthenticated.value
    ? activeCountryProfile.value.recommendationTitle
    : 'Preview of account-specific pricing'
})

const accountPricingDescription = computed(() => {
  return isAuthenticated.value
    ? `${activeCountryProfile.value.recommendationNote} Pricing tier: ${activeCountryProfile.value.pricingTier}.`
    : 'After login, this area can switch from public quote guidance to country-specific rates, preferred routes, and customer-level pricing recommendations.'
})

const accountStatusLabel = computed(() => {
  return isAuthenticated.value ? 'Logged-in account' : 'Guest view'
})

const setQuoteType = (quoteKey) => {
  quoteForm.quoteKey = quoteKey
}

const toResults = (records) => {
  return records.map((item) => ({
    id: item.id,
    route: `${quoteForm.origin || 'Any origin'} -> ${quoteForm.destination || 'Any destination'}`,
    service: selectedQuote.value.label,
    transit: item.transitDays,
    note: `${item.supplierName} / ${item.standardChannelName} / ${item.pricingDetail}`,
    finalPrice: `${item.currency} ${item.finalPrice}`,
  }))
}

const searchQuotes = async () => {
  hasSearched.value = true
  isLoading.value = true

  await new Promise((resolve) => window.setTimeout(resolve, 650))

  const { resultRecords } = quoteByUnifiedEngine({
    serviceType: selectedQuote.value.service,
    quoteType: selectedQuote.value.quoteType,
    sourceEntry: 'quote_hub',
    sourceModule: selectedQuote.value.module,
    userId: activeUserId.value,
    customerName: activeCustomerName.value,
    countryCode: activeCountryProfile.value.countryCode,
    origin: quoteForm.origin,
    destination: quoteForm.destination,
    cargoType: quoteForm.cargo,
    weightVolume: quoteForm.volume,
    containerType: selectedQuote.value.containerType,
    queryText: `${quoteForm.origin} ${quoteForm.destination} ${quoteForm.cargo}`.trim(),
  })

  resultItems.value = toResults(resultRecords)
  isLoading.value = false
}

const goToQuoteChat = (presetTopic = '') => {
  const query = {
    mode: 'service',
  }

  if (presetTopic) {
    query.topic = presetTopic
  } else {
    query.topic = selectedQuote.value.key
  }

  router.push({
    name: 'chat',
    query,
  })
}

const openAssistant = () => {
  router.push({
    name: 'chat',
    query: {
      mode: 'ai',
      q: `Help me choose the right quote type for ${quoteForm.destination || 'my shipment'}`,
    },
  })
}
</script>

<template>
  <div class="quote-page">
    <section class="quote-shell">
      <header class="quote-hero">
        <span class="quote-kicker">Quote Hub</span>
        <h1>Freight Pricing, In One Place</h1>
        <p>
          Check FCL, LCL, DDP, and Amazon FBA pricing paths from a single quote workspace.
        </p>
      </header>

      <section class="hero-grid">
        <article class="quote-query-card">
          <div class="panel-heading panel-heading-tight">
            <div>
              <span class="panel-label">Unified Search</span>
              <h2>Search by shipment type</h2>
            </div>
            <p>Pick a quote type, then add the basic shipment details.</p>
          </div>

          <div class="quote-type-grid">
            <button
              v-for="item in quoteTypes"
              :key="item.key"
              type="button"
              class="quote-type-chip"
              :class="{ 'is-active': quoteForm.quoteKey === item.key }"
              @click="setQuoteType(item.key)"
            >
              <strong>{{ item.label }}</strong>
              <small>{{ item.helper }}</small>
            </button>
          </div>

          <div class="query-form">
            <label>
              Origin
              <input
                v-model="quoteForm.origin"
                type="text"
                placeholder="e.g. Shenzhen"
              />
            </label>
            <label>
              Destination
              <input
                v-model="quoteForm.destination"
                type="text"
                placeholder="e.g. Los Angeles"
              />
            </label>
            <label>
              Cargo
              <input
                v-model="quoteForm.cargo"
                type="text"
                placeholder="e.g. furniture, electronics"
              />
            </label>
            <label>
              Weight / Volume
              <input
                v-model="quoteForm.volume"
                type="text"
                placeholder="e.g. 320kg or 1 x 40HQ"
              />
            </label>
          </div>

          <div class="panel-actions">
            <button type="button" class="search-btn" @click="searchQuotes">
              <Search class="btn-icon" aria-hidden="true" />
              Search Quote
            </button>
            <button type="button" class="assistant-btn" @click="openAssistant">
              <Setting class="btn-icon" aria-hidden="true" />
              Start AI Quote
            </button>
            <button type="button" class="quote-btn" @click="goToQuoteChat()">
              Customer Service
              <ArrowRight class="btn-icon" aria-hidden="true" />
            </button>
          </div>
        </article>

        <article class="quote-results-card">
          <div class="panel-heading panel-heading-tight">
            <div>
              <span class="panel-label">Search Results</span>
              <h2>{{ selectedQuote.label }} results</h2>
            </div>
            <p>Current results are routed through the shared quote engine and can later be replaced with live account pricing.</p>
          </div>

          <div v-if="isLoading" class="state-card">
            <strong>Loading results...</strong>
            <p>Preparing matching quote samples for {{ selectedQuote.label }}.</p>
          </div>

          <div v-else-if="!hasSearched" class="state-card">
            <strong>No search yet</strong>
            <p>Choose a quote type and fill any known shipment details to preview available pricing directions.</p>
          </div>

          <div v-else-if="!resultItems.length" class="state-card">
            <strong>No mock matches for this input</strong>
            <p>Try origin, destination, cargo, or weight details to load the current placeholder result set.</p>
          </div>

          <div v-else class="results-list">
            <article v-for="item in resultItems" :key="item.id" class="result-card">
              <div class="result-badge">{{ item.service }}</div>
              <h3>{{ item.route }}</h3>
              <p>{{ item.note }}</p>
              <div class="result-meta">
                <span>{{ item.finalPrice }} | Transit: {{ item.transit }}</span>
                <button type="button" class="inline-quote-btn" @click="goToQuoteChat(selectedQuote.key)">
                  Continue Quote
                </button>
              </div>
            </article>
          </div>
        </article>
      </section>

      <section class="quote-groups">
        <article
          v-for="group in quoteGroups"
          :key="group.key"
          class="quote-group-card"
          :class="`accent-${group.accent}`"
        >
          <div class="quote-group-head">
            <component :is="group.icon" class="group-icon" aria-hidden="true" />
            <div>
              <h2>{{ group.title }}</h2>
              <p>{{ group.summary }}</p>
            </div>
          </div>

          <div class="group-item-grid">
            <button
              v-for="itemKey in group.items"
              :key="itemKey"
              type="button"
              class="group-item-chip"
              @click="setQuoteType(itemKey)"
            >
              <strong>{{ quoteTypes.find((item) => item.key === itemKey)?.label }}</strong>
              <small>{{ quoteTypes.find((item) => item.key === itemKey)?.helper }}</small>
            </button>
          </div>
        </article>
      </section>

      <section class="scenario-section">
        <div class="section-heading">
          <span class="panel-label">Quick Start</span>
          <h2>Common shipping needs</h2>
          <p>Start from a business scenario instead of a logistics term.</p>
        </div>

        <div class="scenario-grid">
          <article
            v-for="scenario in scenarioCards"
            :key="scenario.key"
            class="scenario-card"
          >
            <h3>{{ scenario.title }}</h3>
            <p>{{ scenario.description }}</p>
            <button type="button" class="scenario-btn" @click="setQuoteType(scenario.quoteKey)">
              Use this flow
            </button>
          </article>
        </div>
      </section>

      <section class="account-section">
        <article class="account-card">
          <div class="section-heading section-heading-left">
            <span class="panel-label">Account Pricing</span>
            <h2>{{ accountPricingTitle }}</h2>
            <p>{{ accountPricingDescription }}</p>
          </div>

          <div class="account-summary-bar">
            <div class="account-summary-item">
              <small>Status</small>
              <strong>{{ accountStatusLabel }}</strong>
            </div>
            <div class="account-summary-item">
              <small>Account</small>
              <strong>{{ activeCustomerName }}</strong>
            </div>
            <div class="account-summary-item">
              <small>Market</small>
              <strong>{{ activeCountryProfile.marketLabel }}</strong>
            </div>
            <div class="account-summary-item">
              <small>Pricing Tier</small>
              <strong>{{ activeCountryProfile.pricingTier }}</strong>
            </div>
          </div>

          <div class="account-action-row">
            <button
              v-for="item in personalizedQuickTypes"
              :key="item.key"
              type="button"
              class="account-action-chip"
              @click="setQuoteType(item.key)"
            >
              {{ item.label }}
            </button>
          </div>

          <div class="account-route-list">
            <article v-for="route in personalizedRoutes" :key="route.title" class="account-route-card">
              <strong>{{ route.title }}</strong>
              <p>{{ route.note }}</p>
            </article>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>

<style scoped>
.quote-page {
  min-height: calc(100vh - 60px);
  background:
    linear-gradient(180deg, #fffaf7 0%, #ffffff 220px, #f7f9fc 100%);
  color: #1f2430;
}

.quote-shell {
  width: min(1140px, calc(100% - 40px));
  margin: 0 auto;
  padding: 42px 0 72px;
}

.quote-hero {
  text-align: center;
  margin-bottom: 26px;
}

.quote-kicker,
.panel-label,
.result-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.quote-kicker,
.panel-label {
  background: #fff3ea;
  color: #f26a1b;
}

.quote-hero h1 {
  margin: 16px 0 10px;
  color: #1d2533;
  font-size: clamp(34px, 4.7vw, 50px);
  line-height: 1.06;
  font-weight: 800;
}

.quote-hero p {
  width: min(100%, 700px);
  margin: 0 auto;
  color: #667286;
  font-size: 15px;
  line-height: 1.55;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 18px;
}

.quote-query-card,
.quote-results-card,
.quote-group-card,
.account-card {
  padding: 24px;
  border: 1px solid rgba(17, 47, 102, 0.07);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 32px rgba(22, 39, 71, 0.06);
}

.panel-heading,
.section-heading {
  display: grid;
  gap: 8px;
}

.panel-heading-tight {
  margin-bottom: 18px;
}

.panel-heading h2,
.section-heading h2 {
  margin: 10px 0 0;
  color: #1d2533;
  font-size: 24px;
  font-weight: 800;
}

.panel-heading p,
.section-heading p {
  margin: 0;
  color: #687284;
  font-size: 14px;
  line-height: 1.55;
}

.quote-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.quote-type-chip,
.group-item-chip,
.search-btn,
.assistant-btn,
.quote-btn,
.inline-quote-btn,
.scenario-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.quote-type-chip,
.group-item-chip {
  min-height: 72px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e7ebf2;
  display: grid;
  gap: 4px;
  text-align: left;
}

.quote-type-chip strong,
.group-item-chip strong {
  color: #1e293b;
  font-size: 14px;
  font-weight: 800;
}

.quote-type-chip small,
.group-item-chip small {
  color: #667286;
  font-size: 12px;
  line-height: 1.45;
}

.quote-type-chip.is-active {
  background: linear-gradient(180deg, #fff8f3 0%, #fff3ea 100%);
  box-shadow: inset 0 0 0 1px rgba(242, 106, 27, 0.22), 0 8px 18px rgba(242, 106, 27, 0.09);
}

.query-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.query-form label {
  display: grid;
  gap: 8px;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

.query-form input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #dde4ee;
  border-radius: 12px;
  outline: 0;
  color: #20242d;
  font-size: 14px;
  background: #ffffff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.query-form input:focus {
  border-color: #f26a1b;
  box-shadow: 0 0 0 3px rgba(242, 106, 27, 0.12);
}

.panel-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.search-btn,
.assistant-btn,
.quote-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 148px;
  height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
}

.search-btn {
  background: #112f66;
  color: #ffffff;
}

.assistant-btn {
  background: #fff3ea;
  color: #d9651e;
}

.quote-btn {
  background: #f26a1b;
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(242, 106, 27, 0.16);
}

.search-btn:hover,
.assistant-btn:hover,
.quote-btn:hover,
.inline-quote-btn:hover,
.scenario-btn:hover,
.quote-type-chip:hover,
.group-item-chip:hover {
  transform: translateY(-1px);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.state-card,
.result-card,
.scenario-card,
.account-route-card {
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fbfcfe;
}

.state-card {
  padding: 22px 18px;
}

.state-card strong,
.result-card h3,
.scenario-card h3,
.account-route-card strong {
  color: #20242d;
}

.state-card p,
.result-card p,
.scenario-card p,
.account-route-card p {
  margin: 8px 0 0;
  color: #6b7688;
  line-height: 1.6;
}

.results-list {
  display: grid;
  gap: 14px;
}

.result-card {
  padding: 18px;
}

.result-badge {
  background: rgba(17, 47, 102, 0.08);
  color: #112f66;
}

.result-card h3 {
  margin: 12px 0 0;
  font-size: 20px;
  font-weight: 800;
}

.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
  color: #112f66;
  font-size: 13px;
  font-weight: 700;
}

.inline-quote-btn,
.scenario-btn {
  min-width: 126px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #fff3ea;
  color: #e45f14;
  font-size: 13px;
  font-weight: 800;
}

.quote-groups,
.scenario-section,
.account-section {
  margin-top: 22px;
}

.quote-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.quote-group-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.group-icon {
  width: 22px;
  height: 22px;
  margin-top: 3px;
  flex: 0 0 auto;
}

.quote-group-head h2 {
  margin: 0;
  color: #20242d;
  font-size: 20px;
  font-weight: 800;
}

.quote-group-head p {
  margin: 8px 0 0;
  color: #667286;
  font-size: 14px;
  line-height: 1.6;
}

.group-item-grid {
  display: grid;
  gap: 10px;
}

.accent-navy .group-icon {
  color: #112f66;
}

.accent-orange .group-icon {
  color: #f26a1b;
}

.accent-blue .group-icon {
  color: #2c6bed;
}

.scenario-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.scenario-card {
  padding: 18px;
}

.scenario-card h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.scenario-btn {
  margin-top: 16px;
}

.section-heading-left {
  text-align: left;
}

.account-route-list {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.account-summary-bar {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.account-summary-item {
  padding: 14px 16px;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  background: #ffffff;
  display: grid;
  gap: 4px;
}

.account-summary-item small {
  color: #8a93a3;
  font-size: 12px;
  line-height: 1.2;
}

.account-summary-item strong {
  color: #1f2937;
  font-size: 14px;
  line-height: 1.35;
}

.account-action-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.account-action-chip {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #f2decf;
  border-radius: 999px;
  background: #fff8f3;
  color: #cb641f;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.account-action-chip:hover {
  transform: translateY(-1px);
  background: #fff3ea;
  border-color: #efc9ab;
}

.account-route-card {
  padding: 16px;
}

@media (max-width: 1100px) {
  .hero-grid,
  .quote-groups,
  .scenario-grid,
  .account-route-list,
  .account-summary-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .quote-shell {
    width: min(100% - 24px, 1180px);
    padding-top: 34px;
  }

  .quote-type-grid,
  .query-form {
    grid-template-columns: 1fr;
  }

  .panel-actions {
    flex-direction: column;
  }

  .search-btn,
  .assistant-btn,
  .quote-btn {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .quote-query-card,
  .quote-results-card,
  .quote-group-card,
  .account-card {
    padding: 18px;
    border-radius: 18px;
  }

  .quote-hero p,
  .panel-heading p,
  .section-heading p,
  .state-card p,
  .result-card p,
  .scenario-card p,
  .account-route-card p {
    font-size: 14px;
  }
}
</style>
