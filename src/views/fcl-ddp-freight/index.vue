<script setup>
import { computed, ref } from 'vue'
import { ArrowRight, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { quoteByUnifiedEngine } from '@/services/quoteEngine'

const router = useRouter()

const activeService = ref('fcl')
const isLoading = ref(false)
const hasSearched = ref(false)
const queryForm = ref({
  origin: '',
  destination: '',
  cargo: '',
  volume: '',
})

const resultItems = ref([])

const pageSummary = computed(() =>
  activeService.value === 'fcl'
    ? 'Compare FCL container routes by origin, destination, and container planning.'
    : 'Review DDP door-to-door options with mock landed-shipping results and next-step placeholders.',
)

const setService = (service) => {
  activeService.value = service
  hasSearched.value = false
  resultItems.value = []
}

const searchQuotes = async () => {
  hasSearched.value = true
  isLoading.value = true

  await new Promise((resolve) => window.setTimeout(resolve, 700))

  const { resultRecords } = quoteByUnifiedEngine({
    serviceType: activeService.value,
    quoteType: activeService.value.toUpperCase(),
    sourceEntry: 'fcl_page',
    sourceModule: activeService.value === 'fcl' ? 'fcl-page' : 'ddp-page',
    userId: 'CUS-PORTAL',
    customerName: 'Portal Visitor',
    countryCode: 'US',
    origin: queryForm.value.origin,
    destination: queryForm.value.destination,
    cargoType: queryForm.value.cargo,
    weightVolume: queryForm.value.volume,
    containerType: activeService.value === 'fcl' ? '40HQ' : 'Pallet',
    queryText: `${queryForm.value.origin} ${queryForm.value.destination} ${queryForm.value.cargo}`.trim(),
  })

  resultItems.value = resultRecords.map((item) => ({
    id: item.id,
    route: `${queryForm.value.origin || 'Any origin'} -> ${queryForm.value.destination || 'Any destination'}`,
    service: activeService.value === 'fcl' ? 'FCL Freight' : 'DDP Freight',
    transit: item.transitDays,
    note: `${item.supplierName} / ${item.standardChannelName} / ${item.pricingDetail}`,
    finalPrice: `${item.currency} ${item.finalPrice}`,
  }))
  isLoading.value = false
}

const goToQuoteChat = () => {
  router.push({
    name: 'chat',
    query: {
      mode: 'service',
      topic: activeService.value === 'fcl' ? 'fcl-freight' : 'ddp-freight',
    },
  })
}
</script>

<template>
  <div class="freight-page">
    <section class="freight-shell">
      <header class="freight-hero">
        <span class="freight-kicker">Quote Workspace</span>
        <h1>FCL &amp; DDP Freight</h1>
        <p>
          Compare FCL container rates and DDP door-to-door shipping options from China.
        </p>
      </header>

      <section class="service-switcher" aria-label="Freight service switcher">
        <button
          type="button"
          class="service-chip"
          :class="{ 'is-active': activeService === 'fcl' }"
          @click="setService('fcl')"
        >
          FCL Freight
        </button>
        <button
          type="button"
          class="service-chip"
          :class="{ 'is-active': activeService === 'ddp' }"
          @click="setService('ddp')"
        >
          DDP Freight
        </button>
      </section>

      <section class="freight-grid">
        <article class="query-panel">
          <div class="panel-heading">
            <div>
              <span class="panel-label">Query Area</span>
              <h2>{{ activeService === 'fcl' ? 'Search FCL options' : 'Search DDP options' }}</h2>
            </div>
            <p>{{ pageSummary }}</p>
          </div>

          <div class="query-form">
            <label>
              Origin
              <input
                v-model="queryForm.origin"
                type="text"
                placeholder="e.g. Shenzhen"
              />
            </label>
            <label>
              Destination
              <input
                v-model="queryForm.destination"
                type="text"
                placeholder="e.g. Los Angeles"
              />
            </label>
            <label>
              Cargo
              <input
                v-model="queryForm.cargo"
                type="text"
                placeholder="e.g. furniture, electronics"
              />
            </label>
            <label>
              Volume / Weight
              <input
                v-model="queryForm.volume"
                type="text"
                placeholder="e.g. 1 x 40HQ or 320kg"
              />
            </label>
          </div>

          <div class="panel-actions">
            <button type="button" class="search-btn" @click="searchQuotes">
              <Search class="btn-icon" aria-hidden="true" />
              Search Options
            </button>
            <button type="button" class="quote-btn" @click="goToQuoteChat">
              Get a Quote
              <ArrowRight class="btn-icon" aria-hidden="true" />
            </button>
          </div>
        </article>

        <article class="results-panel">
          <div class="panel-heading">
            <div>
              <span class="panel-label">Result Area</span>
              <h2>Query Results</h2>
            </div>
            <p>Current results are already routed through the shared quote backbone used by the admin console.</p>
          </div>

          <div v-if="isLoading" class="state-card">
            <strong>Loading mock results...</strong>
            <p>Preparing {{ activeService === 'fcl' ? 'FCL' : 'DDP' }} samples for the current filters.</p>
          </div>

          <div v-else-if="!hasSearched" class="state-card">
            <strong>No query submitted yet</strong>
            <p>Choose a service, fill any known shipment details, and click Search Options.</p>
          </div>

          <div v-else-if="!resultItems.length" class="state-card">
            <strong>No mock matches for this input</strong>
            <p>Try entering origin, destination, cargo, or volume to load the placeholder result set.</p>
          </div>

          <div v-else class="results-list">
            <article v-for="item in resultItems" :key="item.id" class="result-card">
              <div class="result-badge">{{ item.service }}</div>
              <h3>{{ item.route }}</h3>
              <p>{{ item.note }}</p>
              <div class="result-meta">
                <span>{{ item.finalPrice }} | Transit: {{ item.transit }}</span>
                <button type="button" class="inline-quote-btn" @click="goToQuoteChat">
                  Continue Quote
                </button>
              </div>
            </article>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>

<style scoped>
.freight-page {
  min-height: calc(100vh - 60px);
  background:
    radial-gradient(circle at top left, rgba(242, 106, 27, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
  color: #1f2430;
}

.freight-shell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0 64px;
}

.freight-hero {
  text-align: center;
}

.freight-kicker,
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

.freight-kicker,
.panel-label {
  background: #fff3ea;
  color: #f26a1b;
}

.freight-hero h1 {
  margin: 16px 0 10px;
  color: #20242d;
  font-size: 48px;
  line-height: 1.04;
  font-weight: 800;
}

.freight-hero p {
  width: min(100%, 760px);
  margin: 0 auto;
  color: #667286;
  font-size: 16px;
  line-height: 1.6;
}

.service-switcher {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 28px 0 24px;
  flex-wrap: wrap;
}

.service-chip,
.search-btn,
.quote-btn,
.inline-quote-btn {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.service-chip {
  min-width: 144px;
  height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  background: #ffffff;
  color: #4c5667;
  font-size: 14px;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px #e7ebf2;
}

.service-chip.is-active {
  background: #f26a1b;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(242, 106, 27, 0.22);
}

.freight-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 20px;
}

.query-panel,
.results-panel {
  padding: 24px;
  border: 1px solid rgba(17, 47, 102, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 44px rgba(22, 39, 71, 0.08);
}

.panel-heading {
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
}

.panel-heading h2 {
  margin: 12px 0 0;
  color: #1d2533;
  font-size: 26px;
  font-weight: 800;
}

.panel-heading p {
  margin: 0;
  color: #687284;
  font-size: 14px;
  line-height: 1.6;
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
  height: 48px;
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
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.search-btn,
.quote-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 158px;
  height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
}

.search-btn {
  background: #112f66;
  color: #ffffff;
}

.quote-btn {
  background: #f26a1b;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(242, 106, 27, 0.22);
}

.search-btn:hover,
.quote-btn:hover,
.inline-quote-btn:hover,
.service-chip:hover {
  transform: translateY(-1px);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.state-card,
.result-card {
  border: 1px solid #e8edf4;
  border-radius: 18px;
  background: #fbfcfe;
}

.state-card {
  padding: 22px 18px;
}

.state-card strong,
.result-card h3 {
  color: #20242d;
}

.state-card p,
.result-card p {
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

.inline-quote-btn {
  min-width: 126px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #fff3ea;
  color: #e45f14;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 980px) {
  .freight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .freight-shell {
    width: min(100% - 24px, 1120px);
    padding-top: 34px;
  }

  .freight-hero h1 {
    font-size: 36px;
  }

  .query-form {
    grid-template-columns: 1fr;
  }

  .search-btn,
  .quote-btn {
    flex: 1 1 100%;
  }
}

@media (max-width: 520px) {
  .freight-hero h1 {
    font-size: 30px;
  }

  .freight-hero p,
  .panel-heading p,
  .state-card p,
  .result-card p {
    font-size: 14px;
  }

  .query-panel,
  .results-panel {
    padding: 18px;
    border-radius: 18px;
  }
}
</style>
