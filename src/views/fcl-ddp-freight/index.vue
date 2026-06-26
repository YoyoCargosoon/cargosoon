<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Promotion, Van, Box, Present, Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { quoteByUnifiedEngine } from '@/services/quoteEngine'
import { getFbaWarehouseOptions, getFbaWarehouseRecord, quoteOptionCatalog } from '@/data/quoteOptionCatalog'

const router = useRouter()

const topTabs = [
  { key: 'quote', label: 'Quote & Booking' },
  { key: 'schedule', label: 'Sailing Schedule' },
  { key: 'tracking', label: 'Cargo Tracking' },
]

const activeTopTab = ref('quote')

const serviceTabs = [
  {
    key: 'ddp',
    label: 'DDP',
    summary: 'Direct DDP pricing by China origin, destination country, ZIP code, cargo name, weight, volume, and carton count.',
    icon: Van,
    modes: [
      { key: 'sea_ddp', label: 'Sea DDP' },
      { key: 'air_ddp', label: 'Air DDP' },
      { key: 'rail_ddp', label: 'Rail DDP' },
      { key: 'road_ddp', label: 'Road Freight' },
      { key: 'truck_ddp', label: 'Truck Linehaul' },
    ],
    fields: ['origin', 'to', 'zipCode', 'cargo', 'weight', 'volume', 'pieces'],
    hotRoutes: [
      'SHENZHEN - DALLAS DOOR DELIVERY',
      'GUANGZHOU - TORONTO DDP',
      'YIWU - BERLIN RAIL DDP',
      'DONGGUAN - PARIS AIR DDP',
    ],
    quoteType: 'SEA_DDP',
    serviceType: 'ddp',
    module: 'quote-ddp',
  },
  {
    key: 'fba',
    label: 'FBA Delivery',
    summary: 'Amazon warehouse delivery search by warehouse code, address, cargo type, and shipment weight.',
    icon: Present,
    modes: [],
    fields: ['warehouse', 'address', 'cargo', 'weight', 'pieces'],
    hotRoutes: [
      'ONT8 / LAX9 / SBD1',
      'BHX4 / MAN1 / EMA1',
      'DTM2 / FRA7 / LEJ1',
      'YYZ7 / YVR2 / YOW3',
    ],
    quoteType: 'FBA_DDP',
    serviceType: 'ddp',
    module: 'quote-fba',
  },
  {
    key: 'ocean',
    label: 'Ocean FCL',
    summary: 'Direct port-to-port container pricing with fast container-type matching and route lookup.',
    icon: Box,
    modes: [{ key: 'port_to_port', label: 'Port to Port' }],
    fields: ['origin', 'destination', 'container', 'weight', 'volume', 'cargo'],
    hotRoutes: [
      'Yantian - Los Angeles - United States',
      'Ningbo - New York - United States',
      'Shanghai - Rotterdam - Netherlands',
      'Qingdao - Hamburg - Germany',
    ],
    quoteType: 'FCL',
    serviceType: 'fcl',
    module: 'quote-ocean-fcl',
  },
  {
    key: 'dangerous',
    label: 'Dangerous Goods',
    summary: 'Hazardous cargo inquiry for DG ocean and DG air routes with manual confirmation support.',
    icon: Warning,
    modes: [
      { key: 'dg_ocean', label: 'DG Ocean' },
      { key: 'dg_air', label: 'DG Air' },
    ],
    fields: ['origin', 'destination', 'cargo', 'unno', 'weight', 'pieces'],
    hotRoutes: [
      'SHANGHAI - LOS ANGELES DG',
      'NINGBO - HAMBURG DG',
      'SHENZHEN - NEW YORK DG',
      'GUANGZHOU - TORONTO DG',
    ],
    quoteType: 'AIR_DDP',
    serviceType: 'ddp',
    module: 'quote-dg',
  },
]

const fieldLabels = {
  origin: { label: 'Origin', placeholder: 'Port - City - China', type: 'select' },
  destination: { label: 'Destination', placeholder: 'Port - City - Country', type: 'select' },
  address: { label: 'Address / Country', placeholder: 'Select country or type delivery address', type: 'select' },
  to: { label: 'To', placeholder: 'Select destination country', type: 'select' },
  zipCode: { label: 'ZIP Code', placeholder: 'Enter ZIP / postal code' },
  cargo: { label: 'Cargo Name', placeholder: 'Optional product name' },
  container: { label: 'Container', placeholder: 'Select container type', type: 'select' },
  weight: { label: 'Weight', placeholder: 'Optional, e.g. 980 KG' },
  volume: { label: 'Volume', placeholder: 'Optional, e.g. 4.5 CBM' },
  pieces: { label: 'Pieces', placeholder: 'e.g. 120 CTNS' },
  market: { label: 'Amazon Market', placeholder: 'Auto-filled from warehouse code', type: 'readonly' },
  warehouse: { label: 'FBA Warehouse Code', placeholder: 'Type warehouse code, e.g. ONT8 (US)', type: 'select' },
  unno: { label: 'UN Number', placeholder: 'e.g. UN3481' },
}

const serviceFieldOverrides = {
  ddp: {
    origin: { label: 'China Origin', placeholder: 'Select China origin city', type: 'select' },
    to: { label: 'To', placeholder: 'Select destination country', type: 'select' },
    zipCode: { label: 'ZIP Code', placeholder: 'Enter ZIP / postal code' },
    cargo: { label: 'Cargo Name', placeholder: 'Enter product name' },
    weight: { label: 'Weight *', placeholder: 'Required, e.g. 980 KG' },
    volume: { label: 'Volume', placeholder: 'Enter shipment volume, e.g. 4.5 CBM' },
    pieces: { label: 'Pieces', placeholder: 'Enter carton count, e.g. 120 CTNS' },
  },
}

const originOptions = quoteOptionCatalog.origins
const ddpOriginOptions = quoteOptionCatalog.ddpChinaOrigins
const destinationPortOptions = quoteOptionCatalog.destinationPorts
const ddpCountryOptions = quoteOptionCatalog.ddpCountries
const containerOptions = quoteOptionCatalog.containerTypes
const amazonMarketOptions = quoteOptionCatalog.amazonMarkets
const fbaWarehouseOptions = computed(() => getFbaWarehouseOptions(form.market))

const fieldOptionsMap = {
  origin: originOptions,
  destination: destinationPortOptions,
  address: ddpCountryOptions,
  to: ddpCountryOptions,
  container: containerOptions,
  market: amazonMarketOptions,
}

const form = reactive({
  origin: '',
  destination: '',
  address: '',
  to: '',
  zipCode: '',
  cargo: '',
  container: '',
  weight: '',
  volume: '',
  pieces: '',
  market: '',
  warehouse: '',
  unno: '',
})

const scheduleForm = reactive({
  origin: '',
  destination: '',
})

const trackingForm = reactive({
  number: '',
})

const resultList = ref([])
const hasSearched = ref(false)
const isLoading = ref(false)
const activeServiceKey = ref('ddp')
const activeModeKey = ref('sea_ddp')
const ddpWeightNeedsAttention = ref(false)

const activeService = computed(() => {
  return serviceTabs.find((item) => item.key === activeServiceKey.value) || serviceTabs[0]
})

const activeModes = computed(() => activeService.value.modes)
const activeModeLabel = computed(() => activeModes.value.find((mode) => mode.key === activeModeKey.value)?.label || '')
const activeServiceSummary = computed(() => activeService.value.summary || '')
const isDdpService = computed(() => activeServiceKey.value === 'ddp')
const ddpFieldRows = computed(() => {
  if (!isDdpService.value) return []
  const fieldMap = new Map(visibleFields.value.map((field) => [field.key, field]))
  return [
    ['origin', 'to', 'zipCode'],
    ['cargo', 'weight', 'volume', 'pieces'],
  ]
    .map((row) => row.map((key) => fieldMap.get(key)).filter(Boolean))
    .filter((row) => row.length)
})
const visibleFields = computed(() => {
  return activeService.value.fields.map((key) => {
    const baseField = fieldLabels[key] || {}
    const overrideField = serviceFieldOverrides[activeServiceKey.value]?.[key] || {}
    const mergedField = {
      key,
      ...baseField,
      ...overrideField,
    }

    return {
      ...mergedField,
      type: activeServiceKey.value === 'fba' && key === 'address' ? 'readonly' : mergedField.type,
      options:
        key === 'warehouse'
          ? fbaWarehouseOptions.value
          : activeServiceKey.value === 'ddp' && key === 'origin'
            ? ddpOriginOptions
            : fieldOptionsMap[key] || [],
    }
  })
})

watch(
  () => form.warehouse,
  (warehouseCode) => {
    const matched = getFbaWarehouseRecord(warehouseCode)
    form.market = matched?.market || ''
    if (matched) {
      form.address = `${matched.country} | ${matched.address}`
    }
  },
)

const scheduleSamples = [
  { route: 'YANTIAN - LOS ANGELES', service: 'Matson Express', eta: '13-16 days', cutoff: 'Wed cutoff' },
  { route: 'NINGBO - NEW YORK', service: 'US East Weekly', eta: '26-31 days', cutoff: 'Sat cutoff' },
  { route: 'SHANGHAI - HAMBURG', service: 'EU Direct', eta: '31-36 days', cutoff: 'Tue cutoff' },
]

const trackingSamples = [
  { status: 'Picked Up', time: '2026-06-21 10:40', note: 'Cargo collected from supplier.' },
  { status: 'Loaded', time: '2026-06-22 18:10', note: 'Cargo loaded and prepared for linehaul.' },
  { status: 'Departed', time: '2026-06-24 09:20', note: 'Shipment departed from origin.' },
  { status: 'In Transit', time: '2026-06-25 16:30', note: 'Shipment is moving to the destination.' },
]

const setService = (key) => {
  activeServiceKey.value = key
  activeModeKey.value = serviceTabs.find((item) => item.key === key)?.modes[0]?.key || ''
  resultList.value = []
  hasSearched.value = false
}

const searchQuote = async () => {
  if (activeServiceKey.value === 'ddp' && !String(form.weight || '').trim()) {
    ddpWeightNeedsAttention.value = true
    hasSearched.value = false
    resultList.value = []
    ElMessage.warning('Weight is required for DDP pricing.')
    window.setTimeout(() => {
      ddpWeightNeedsAttention.value = false
    }, 1200)
    return
  }

  hasSearched.value = true
  isLoading.value = true

  await new Promise((resolve) => window.setTimeout(resolve, 400))

  const destination =
    activeServiceKey.value === 'ddp'
      ? [form.to, form.zipCode].filter(Boolean).join(' ')
      : form.destination || form.address || form.warehouse
  const quoteType =
    activeModeKey.value === 'air_ddp' || activeModeKey.value === 'dg_air'
      ? 'AIR_DDP'
      : activeService.value.quoteType

  const { resultRecords } = quoteByUnifiedEngine({
    serviceType: activeService.value.serviceType,
    quoteType,
    serviceModeKey: activeModeKey.value,
    sourceEntry: 'quote_home',
    sourceModule: activeService.value.module,
    userId: 'QUOTE-PAGE',
    customerName: 'Website visitor',
    countryCode: 'US',
    origin: form.origin,
    destination,
    cargoType: form.cargo,
    weightVolume: [form.weight, form.volume, form.pieces].filter(Boolean).join(' / '),
    containerType: form.container,
    warehouseCode: form.warehouse,
    market: form.to || form.market,
    zipCode: form.zipCode,
    queryText: [form.cargo, form.unno].filter(Boolean).join(' '),
  })

  resultList.value = (resultRecords.length ? resultRecords : [null]).map((item, index) => ({
    id: item?.id || `manual-${index}`,
    route: item?.originLabel && item?.destinationLabel ? `${item.originLabel} -> ${item.destinationLabel}` : `${form.origin || 'China'} - ${destination || 'Destination'}`,
    service: activeModeLabel.value ? `${activeService.value.label} / ${activeModeLabel.value}` : activeService.value.label,
    price: item?.finalPrice ? `${item.currency} ${item.finalPrice}${item.priceUnit ? ` / ${item.priceUnit}` : ''}` : 'Manual Quote',
    totalPriceLabel: item?.finalPrice ? `${item.currency} ${item.finalPrice}` : 'Manual Quote',
    transit: item?.transitDays || 'Pending review',
    transitLabel: item?.transitDays || 'Pending review',
    note: item?.pricingDetail || 'This shipment can be routed for a manual quote confirmation.',
    supplier: item?.supplierName || 'Cargosoon Pricing Team',
    channel: item?.channelName || item?.standardChannelName || activeModeLabel.value || 'DDP Channel',
    range: item?.bandLabel || (form.weight ? `Requested ${form.weight}` : 'Weight confirmation required'),
    enteredWeightLabel: item?.weightKg != null ? `${item.weightKg} KG` : form.weight || 'TBD',
    unitPriceLabel:
      item?.unitPrice != null ? `${item.currency} ${item.unitPrice} / KG` : item?.price || 'Pending review',
    quoteAccuracyLabel:
      activeServiceKey.value === 'ddp'
        ? form.zipCode
          ? 'ZIP matched pricing rule'
          : 'Estimated price, add ZIP for a more exact quote'
        : '',
    pricingSummary:
      activeServiceKey.value === 'ddp'
        ? [
            `Destination: ${form.to || 'TBD'}`,
            form.zipCode ? `ZIP: ${form.zipCode}` : 'ZIP: TBD',
            item?.weightKg != null ? `Entered Weight: ${item.weightKg} KG` : null,
          ]
            .filter(Boolean)
            .join('  |  ')
        : item?.pricingDetail || '',
  }))

  isLoading.value = false
}

const goToChat = () => {
  const topic = activeModeKey.value ? `${activeServiceKey.value}-${activeModeKey.value}` : activeServiceKey.value
  router.push({
    name: 'chat',
    query: {
      mode: 'service',
      topic,
    },
  })
}

const goToTracking = () => {
  router.push({
    name: 'track',
    query: {
      keyword: trackingForm.number,
    },
  })
}
</script>

<template>
  <div class="quote-page">
    <section class="quote-shell">
      <div class="hero-tabs">
        <button
          v-for="tab in topTabs"
          :key="tab.key"
          type="button"
          class="hero-tab"
          :class="{ 'is-active': activeTopTab === tab.key }"
          @click="activeTopTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <section class="quote-card">
        <template v-if="activeTopTab === 'quote'">
          <div class="service-tabs">
            <button
              v-for="service in serviceTabs"
              :key="service.key"
              type="button"
              class="service-tab"
              :class="{ 'is-active': activeServiceKey === service.key }"
              @click="setService(service.key)"
            >
              {{ service.label }}
            </button>
          </div>

          <div class="service-hero" :class="{ 'service-hero-ddp': isDdpService }">
            <div class="service-hero-copy">
              <span v-if="!isDdpService" class="service-eyebrow">Instant Freight Tools</span>
              <h2>{{ activeService.label }}</h2>
              <p>{{ activeServiceSummary }}</p>
            </div>
            <div v-if="!isDdpService" class="service-hero-badge">
              <span>Live Search</span>
              <strong>{{ activeModeLabel || 'Quote Search' }}</strong>
            </div>
          </div>

          <div v-if="activeModes.length" class="mode-switch">
            <label
              v-for="mode in activeModes"
              :key="mode.key"
              class="mode-option"
              :class="{ 'is-active': activeModeKey === mode.key }"
            >
              <input v-model="activeModeKey" type="radio" :value="mode.key" />
              <span>{{ mode.label }}</span>
            </label>
          </div>

          <div class="quote-workbench">
            <template v-if="isDdpService">
              <div class="ddp-layout">
                <div class="ddp-form-card">
                  <div v-for="(row, rowIndex) in ddpFieldRows" :key="`ddp-row-${rowIndex}`" class="ddp-field-row">
                    <div
                      v-for="field in row"
                      :key="field.key"
                      class="field-box ddp-field-box"
                      :class="{ 'field-box-required-missing': field.key === 'weight' && ddpWeightNeedsAttention }"
                    >
                      <span>{{ field.label }}</span>
                      <el-select
                        v-if="field.type === 'select'"
                        v-model="form[field.key]"
                        class="smart-select"
                        filterable
                        allow-create
                        default-first-option
                        :reserve-keyword="false"
                        :placeholder="field.placeholder"
                      >
                        <el-option
                          v-for="option in field.options"
                          :key="option.value || option"
                          :label="option.label || option"
                          :value="option.value || option"
                        />
                      </el-select>
                      <input
                        v-else
                        v-model="form[field.key]"
                        type="text"
                        :placeholder="field.placeholder"
                      />
                    </div>
                  </div>
                </div>

                <div class="action-block ddp-action-block">
                  <div class="action-card ddp-action-card">
                    <span class="action-card-title">DDP Instant Quote</span>
                    <button type="button" class="search-btn" @click="searchQuote">
                      <Search class="btn-icon" aria-hidden="true" />
                      Search Rate
                    </button>
                    <button type="button" class="inquiry-link" @click="goToChat">
                      Request Quote
                    </button>
                    <p class="action-note">Use destination country and ZIP code to match the most relevant DDP zone and weight band.</p>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="search-strip">
                <div class="search-fields">
                  <div
                    v-for="field in visibleFields"
                    :key="field.key"
                    class="field-box"
                    :class="{
                      'field-box-wide': activeServiceKey === 'ocean' && (field.key === 'origin' || field.key === 'destination'),
                    }"
                  >
                    <span>{{ field.label }}</span>
                    <el-select
                      v-if="field.type === 'select'"
                      v-model="form[field.key]"
                      class="smart-select"
                      filterable
                      allow-create
                      default-first-option
                      :reserve-keyword="false"
                      :placeholder="field.placeholder"
                    >
                      <el-option
                        v-for="option in field.options"
                        :key="option.value || option"
                        :label="option.label || option"
                        :value="option.value || option"
                      />
                    </el-select>
                    <input
                      v-else-if="field.type === 'readonly'"
                      :value="form[field.key]"
                      type="text"
                      :placeholder="field.placeholder"
                      readonly
                    />
                    <input
                      v-else
                      v-model="form[field.key]"
                      type="text"
                      :placeholder="field.placeholder"
                    />
                  </div>
                </div>

                <div class="action-block">
                  <div class="action-card">
                    <button type="button" class="search-btn" @click="searchQuote">
                      <Search class="btn-icon" aria-hidden="true" />
                      Search Rate
                    </button>
                    <button type="button" class="inquiry-link" @click="goToChat">
                      Request Quote
                    </button>
                    <p class="action-note">Search direct pricing first, then switch to manual support if the route needs confirmation.</p>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="!isDdpService" class="hot-lines">
              <span class="hot-label">Hot Routes</span>
              <button
                v-for="route in activeService.hotRoutes"
                :key="route"
                type="button"
                class="hot-chip"
              >
                {{ route }}
              </button>
            </div>
          </div>

          <div class="result-area" :class="{ 'result-area-ddp': isDdpService }">
            <div v-if="isLoading" class="empty-state">
              <strong>Matching available pricing...</strong>
              <p>We are checking the best route options for your shipment.</p>
            </div>

            <div v-else-if="!hasSearched" class="empty-state">
              <strong>Start with origin, destination, and shipment details</strong>
              <p>Select China origin, destination country, and shipment weight to generate a DDP quote.</p>
            </div>

            <div v-else class="result-list" :class="{ 'ddp-result-list': isDdpService }">
              <article v-for="item in resultList" :key="item.id" class="result-card" :class="{ 'ddp-quote-card': isDdpService }">
                <template v-if="isDdpService">
                  <div class="ddp-quote-sheet">
                    <div class="ddp-quote-table">
                      <div class="ddp-quote-column">
                        <label>Transit Time</label>
                        <strong>{{ item.transitLabel }}</strong>
                      </div>
                      <div class="ddp-quote-column">
                        <label>Channel</label>
                        <strong>{{ item.channel }}</strong>
                      </div>
                      <div class="ddp-quote-column">
                        <label>Entered Weight</label>
                        <strong>{{ item.enteredWeightLabel }}</strong>
                      </div>
                      <div class="ddp-quote-column">
                        <label>Matched Range</label>
                        <strong>{{ item.range }}</strong>
                      </div>
                      <div class="ddp-quote-column">
                        <label>Unit Price</label>
                        <strong>{{ item.unitPriceLabel }}</strong>
                      </div>
                      <div class="ddp-quote-column">
                        <label>Supplier</label>
                        <strong>{{ item.supplier }}</strong>
                      </div>
                    </div>

                    <div class="result-price-block ddp-price-panel">
                      <small>Total Price</small>
                      <span>{{ item.totalPriceLabel }}</span>
                    </div>
                  </div>
                  <details class="ddp-notes">
                    <summary>View details</summary>
                    <div class="ddp-notes-body">
                      <span class="ddp-accuracy-chip">{{ item.quoteAccuracyLabel }}</span>
                      <p class="result-summary">{{ item.pricingSummary }}</p>
                      <div class="ddp-notes-copy">
                        <label>Notes</label>
                        <small>{{ item.note }}</small>
                      </div>
                    </div>
                  </details>
                </template>
                <template v-else>
                  <div class="result-head">
                    <div class="result-title-block">
                      <strong>{{ item.route }}</strong>
                      <p>{{ item.service }}</p>
                    </div>
                    <div class="result-price-block">
                      <small>Total Price</small>
                      <span>{{ item.totalPriceLabel }}</span>
                    </div>
                  </div>
                  <small>{{ item.note }}</small>
                </template>
              </article>
            </div>
          </div>
        </template>

        <template v-else-if="activeTopTab === 'schedule'">
          <div class="secondary-wrap">
            <div class="secondary-search">
              <div class="field-box">
                <span>Origin</span>
                <el-select
                  v-model="scheduleForm.origin"
                  class="smart-select"
                  filterable
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                  placeholder="Select or type origin port"
                >
                  <el-option v-for="option in originOptions" :key="option" :label="option" :value="option" />
                </el-select>
              </div>
              <div class="field-box">
                <span>Destination</span>
                <el-select
                  v-model="scheduleForm.destination"
                  class="smart-select"
                  filterable
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                  placeholder="Select or type destination port"
                >
                  <el-option
                    v-for="option in destinationPortOptions"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </div>
              <button type="button" class="search-btn secondary-btn">
                <Promotion class="btn-icon" aria-hidden="true" />
                Search Schedule
              </button>
            </div>

            <div class="sample-list">
              <article v-for="item in scheduleSamples" :key="item.route" class="sample-card">
                <strong>{{ item.route }}</strong>
                <p>{{ item.service }}</p>
                <div class="result-meta">
                  <span>{{ item.eta }}</span>
                  <span>{{ item.cutoff }}</span>
                </div>
              </article>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="secondary-wrap">
            <div class="secondary-search tracking-search">
              <div class="field-box wide">
                <span>Tracking Number / Container / B/L No.</span>
                <input v-model="trackingForm.number" type="text" placeholder="Enter shipment number" />
              </div>
              <button type="button" class="search-btn secondary-btn" @click="goToTracking">
                <Search class="btn-icon" aria-hidden="true" />
                Track Cargo
              </button>
            </div>

            <div class="sample-list">
              <article v-for="item in trackingSamples" :key="item.time" class="sample-card">
                <strong>{{ item.status }}</strong>
                <p>{{ item.time }}</p>
                <small>{{ item.note }}</small>
              </article>
            </div>
          </div>
        </template>

        <div v-if="!isDdpService" class="footer-bar">
          <div class="footer-note">
            <span class="new-tag">NEW</span>
            <p>
              Quote page layout updated for direct rate search, sailing schedule lookup, and cargo tracking.
            </p>
          </div>
          <div class="footer-stat">
            <span>Quote Requests Served</span>
            <strong>2,137,913</strong>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.quote-page {
  min-height: calc(100vh - 60px);
  background:
    linear-gradient(180deg, rgba(220, 236, 255, 0.92) 0%, rgba(236, 244, 255, 0.96) 12%, #f8fbff 100%);
  color: #20314d;
}

.quote-shell {
  width: min(1180px, calc(100% - 24px));
  margin: 0 auto;
  padding: 36px 0 64px;
}

.hero-tabs {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding-left: 10px;
}

.hero-tab,
.service-tab,
.search-btn,
.hot-chip,
.inquiry-link {
  border: 0;
  cursor: pointer;
  font: inherit;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.hero-tab {
  min-width: 160px;
  height: 62px;
  padding: 0 18px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(180deg, #ffffff 0%, #eef4ff 100%);
  box-shadow: inset 0 0 0 1px rgba(111, 154, 221, 0.42);
  color: #3d506f;
  font-size: 17px;
  font-weight: 800;
}

.hero-tab.is-active {
  background: linear-gradient(180deg, #fff6ee 0%, #ffe4c7 100%);
  box-shadow: inset 0 0 0 2px #f48a20;
  color: #d86b00;
}

.quote-card {
  margin-top: -1px;
  padding: 14px 16px 12px;
  border-radius: 24px;
  border: 2px solid rgba(113, 177, 255, 0.62);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 246, 255, 0.94) 100%);
  box-shadow:
    0 16px 38px rgba(110, 154, 214, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.service-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px 10px 10px;
  border-bottom: 1px solid rgba(164, 192, 230, 0.42);
}

.service-tab {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.66);
  box-shadow: inset 0 0 0 1px rgba(189, 209, 236, 0.72);
  color: #324966;
  font-size: 15px;
  font-weight: 800;
  position: relative;
}

.service-tab.is-active {
  color: #f07813;
  background: linear-gradient(180deg, #fff8ef 0%, #ffe8cf 100%);
  box-shadow: inset 0 0 0 1px rgba(240, 120, 19, 0.22);
}

.service-tab.is-active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -11px;
  height: 3px;
  border-radius: 999px;
  background: #f07813;
}

.service-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 12px 12px;
}

.service-hero-ddp {
  padding: 10px 10px 4px;
}

.service-hero-copy h2 {
  margin: 4px 0 8px;
  color: #1c3152;
  font-size: 28px;
  line-height: 1.04;
  font-weight: 900;
}

.service-hero-copy p {
  max-width: 720px;
  margin: 0;
  color: #6881a3;
  font-size: 14px;
  line-height: 1.65;
}

.service-hero-ddp .service-hero-copy h2 {
  margin-top: 0;
  margin-bottom: 4px;
  font-size: 32px;
}

.service-hero-ddp .service-hero-copy p {
  max-width: 820px;
  color: #5d7698;
  font-size: 13px;
  line-height: 1.5;
}

.service-eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(240, 120, 19, 0.1);
  color: #e07713;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.service-hero-badge {
  min-width: 168px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff9f3 0%, #ffe7cb 100%);
  box-shadow: inset 0 0 0 1px rgba(240, 120, 19, 0.16);
  display: grid;
  gap: 5px;
}

.service-hero-badge span {
  color: #9d7c56;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.service-hero-badge strong {
  color: #1f3350;
  font-size: 16px;
  font-weight: 900;
}

.mode-switch {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 2px 10px 12px;
}

.service-hero-ddp + .mode-switch {
  padding-top: 2px;
}

.mode-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4f6485;
  font-size: 14px;
  font-weight: 700;
}

.mode-option input {
  margin: 0;
  accent-color: #f07813;
}

.mode-option.is-active span {
  color: #f07813;
}

.quote-workbench {
  padding: 6px 10px 0;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(242, 247, 255, 0.98) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(159, 190, 230, 0.24),
    0 10px 30px rgba(153, 182, 220, 0.14);
}

.ddp-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
  padding: 4px 8px 8px;
}

.ddp-form-card {
  display: grid;
  gap: 14px;
  padding: 16px 16px 14px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: inset 0 0 0 1px rgba(174, 198, 228, 0.22);
}

.ddp-field-row {
  display: grid;
  gap: 14px;
}

.ddp-field-row:first-child {
  grid-template-columns: 1.1fr 1fr 0.9fr;
}

.ddp-field-row:last-child {
  grid-template-columns: 1.25fr 0.9fr 0.9fr 0.9fr;
}

.ddp-field-box {
  min-width: 0;
}

.search-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 18px;
  align-items: start;
  padding: 10px 10px 0;
}

.search-fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.field-box {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.field-box-wide {
  grid-column: span 2;
}

.field-box-ddp-wide {
  grid-column: span 2;
}

.field-box span {
  color: #6d82a1;
  font-size: 12px;
  font-weight: 700;
}

.field-box input {
  width: 100%;
  min-width: 0;
  height: 58px;
  padding: 0 16px;
  border: 1px solid #d7e2f0;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  color: #21324d;
  font-size: 15px;
  outline: 0;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.field-box input:focus {
  border-color: #f49a3a;
  box-shadow: 0 0 0 3px rgba(244, 154, 58, 0.12);
}

.field-box-required-missing input {
  border-color: rgba(217, 115, 21, 0.55);
  box-shadow: 0 0 0 3px rgba(240, 120, 19, 0.08);
  animation: ddpWeightShake 0.48s ease;
}

.field-box-required-missing :deep(.smart-select .el-select__wrapper) {
  border-color: rgba(217, 115, 21, 0.55);
  box-shadow: 0 0 0 3px rgba(240, 120, 19, 0.08);
  animation: ddpWeightShake 0.48s ease;
}

.field-box :deep(.smart-select) {
  width: 100%;
}

.field-box :deep(.smart-select .el-select__wrapper) {
  min-height: 58px;
  border-radius: 14px;
  box-shadow: none;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #d7e2f0;
  padding: 0 16px;
}

.field-box :deep(.smart-select .el-select__wrapper.is-focused) {
  border-color: #f49a3a;
  box-shadow: 0 0 0 3px rgba(244, 154, 58, 0.12);
}

.field-box :deep(.smart-select .el-select__placeholder),
.field-box :deep(.smart-select .el-select__selected-item),
.field-box :deep(.smart-select .el-select__input) {
  color: #21324d;
  font-size: 15px;
}

.action-block {
  padding-top: 22px;
}

.action-card {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f4f8ff 0%, #edf4ff 100%);
  box-shadow: inset 0 0 0 1px rgba(160, 188, 226, 0.32);
  display: grid;
  gap: 12px;
}

.ddp-action-block {
  padding-top: 0;
}

.ddp-action-card {
  position: sticky;
  top: 18px;
  background: linear-gradient(180deg, #eef5ff 0%, #e6effc 100%);
  padding: 18px;
}

.action-card-title {
  color: #1d3352;
  font-size: 13px;
  font-weight: 900;
}

.action-note {
  margin: 0;
  color: #7086a7;
  font-size: 12px;
  line-height: 1.55;
}

.search-btn {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ff9f3f 0%, #f07813 100%);
  box-shadow: 0 10px 24px rgba(240, 120, 19, 0.26);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes ddpWeightShake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

.inquiry-link {
  min-height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px rgba(240, 120, 19, 0.16);
  color: #f07813;
  font-size: 15px;
  font-weight: 800;
}

.hot-lines {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 18px 10px 18px;
}

.hot-label {
  color: #6c809d;
  font-size: 14px;
  font-weight: 700;
}

.hot-chip {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #eef4fd 0%, #e1ebf9 100%);
  color: #48627f;
  font-size: 12px;
  font-weight: 700;
}

.result-area {
  padding: 16px 10px 0;
}

.result-area-ddp {
  padding-top: 14px;
}

.empty-state,
.result-card,
.sample-card {
  border-radius: 16px;
  border: 1px solid #deebf8;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 252, 255, 0.96) 100%);
  box-shadow: 0 10px 24px rgba(157, 182, 219, 0.1);
}

.empty-state {
  padding: 24px 22px;
  border-radius: 20px;
}

.empty-state strong,
.result-card strong,
.sample-card strong {
  color: #233554;
}

.empty-state p,
.result-card p,
.sample-card p,
.sample-card small {
  margin: 8px 0 0;
  color: #6c809d;
  line-height: 1.6;
}

.result-list,
.sample-list {
  display: grid;
  gap: 12px;
}

.result-card,
.sample-card {
  padding: 18px;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.result-title-block {
  display: grid;
  gap: 6px;
}

.result-title-block p {
  margin: 0;
  color: #667e9d;
  font-size: 14px;
}

.result-price-block {
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #fff8f1 0%, #ffedd9 100%);
  text-align: right;
  display: grid;
  gap: 4px;
}

.result-price-block small {
  margin: 0;
  color: #9b7a56;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.result-head span {
  color: #f07813;
  font-size: 17px;
  font-weight: 800;
}

.result-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.result-meta span {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f6f9fd;
  color: #59708f;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.result-card small {
  display: block;
  margin-top: 12px;
  color: #6c809d;
  line-height: 1.55;
}

.result-summary {
  margin: 10px 0 0;
  color: #536d8d;
  font-size: 13px;
  line-height: 1.7;
}

.ddp-result-list {
  gap: 14px;
}

.ddp-result-list .result-card {
  border-radius: 18px;
}

.ddp-quote-card {
  padding: 18px 20px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow:
    0 12px 28px rgba(157, 182, 219, 0.1),
    inset 0 0 0 1px rgba(221, 234, 248, 0.9);
}

.ddp-quote-sheet {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 14px;
  align-items: stretch;
}

.ddp-quote-table {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;
  border: 1px solid #e0ebf8;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5fd 100%);
}

.ddp-quote-column {
  padding: 16px 18px;
  display: grid;
  gap: 8px;
  position: relative;
}

.ddp-quote-column:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px;
  right: 0;
  bottom: 14px;
  width: 1px;
  background: rgba(179, 201, 230, 0.8);
}

.ddp-quote-column label,
.ddp-notes label {
  color: #7c90ad;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ddp-quote-column strong {
  color: #1d3352;
  font-size: 15px;
  line-height: 1.45;
}

.ddp-price-panel {
  min-width: 0;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff8ef 0%, #ffe7ca 100%);
  padding: 18px 18px 16px;
  display: grid;
  align-content: end;
  justify-items: end;
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(240, 120, 19, 0.12);
}

.ddp-price-panel small {
  margin: 0;
  color: #9b7a56;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ddp-price-panel span {
  color: #e87510;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 900;
}

.ddp-notes {
  margin-top: 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #fffdf9 0%, #fff6ea 100%);
  box-shadow: inset 0 0 0 1px rgba(240, 120, 19, 0.12);
}

.ddp-notes summary {
  list-style: none;
  cursor: pointer;
  padding: 14px 16px;
  color: #d97315;
  font-size: 13px;
  font-weight: 800;
}

.ddp-notes summary::-webkit-details-marker {
  display: none;
}

.ddp-notes-body {
  padding: 0 16px 14px;
}

.ddp-notes-copy {
  margin-top: 10px;
}

.ddp-notes small {
  margin-top: 8px;
}

.ddp-accuracy-chip {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff6eb 0%, #ffedd8 100%);
  color: #d97315;
  font-size: 12px;
  font-weight: 800;
}

.secondary-wrap {
  padding: 14px 12px 0;
}

.secondary-search {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  gap: 14px;
  align-items: end;
  padding: 8px 10px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(242, 247, 255, 0.98) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(159, 190, 230, 0.24),
    0 10px 30px rgba(153, 182, 220, 0.14);
}

.tracking-search {
  grid-template-columns: minmax(0, 1fr) auto;
}

.wide {
  grid-column: auto;
}

.secondary-btn {
  min-width: 160px;
}

.footer-bar {
  margin-top: 18px;
  padding: 18px 12px 4px;
  border-top: 1px solid rgba(155, 184, 225, 0.28);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-note {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-tag {
  min-width: 38px;
  height: 20px;
  border-radius: 999px;
  background: #ff7b31;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.footer-note p,
.footer-stat span {
  margin: 0;
  color: #7185a1;
  font-size: 13px;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-stat strong {
  color: #f07813;
  font-size: 22px;
  font-weight: 900;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.hero-tab:hover,
.service-tab:hover,
.search-btn:hover,
.hot-chip:hover,
.inquiry-link:hover {
  transform: translateY(-1px);
}

@media (max-width: 1080px) {
  .ddp-layout {
    grid-template-columns: 1fr;
  }

  .ddp-action-card {
    position: static;
  }

  .service-hero {
    flex-direction: column;
  }

  .search-strip,
  .secondary-search,
  .tracking-search {
    grid-template-columns: 1fr;
  }

  .action-block {
    padding-top: 0;
  }

  .action-card {
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .action-note {
    grid-column: 1 / -1;
  }

  .result-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-price-block {
    width: 100%;
    text-align: left;
  }

  .ddp-quote-sheet {
    grid-template-columns: 1fr;
  }

  .ddp-price-panel {
    justify-items: start;
  }

  .service-tabs {
    gap: 10px;
  }

  .ddp-quote-table {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ddp-quote-column:nth-child(3)::after {
    display: none;
  }
}

@media (max-width: 840px) {
  .search-fields {
    grid-template-columns: 1fr;
  }

  .field-box-wide {
    grid-column: auto;
  }

  .field-box-ddp-wide {
    grid-column: auto;
  }

  .ddp-field-row:first-child,
  .ddp-field-row:last-child {
    grid-template-columns: 1fr;
  }

  .hero-tabs {
    flex-wrap: wrap;
    padding-left: 0;
  }

  .hero-tab {
    flex: 1 1 180px;
  }

  .service-hero-copy h2 {
    font-size: 24px;
  }

  .action-card {
    grid-template-columns: 1fr;
  }

  .ddp-quote-table {
    grid-template-columns: 1fr;
  }

  .ddp-quote-column::after {
    display: none;
  }
}

@media (max-width: 560px) {
  .quote-shell {
    width: min(100% - 16px, 1180px);
    padding-top: 22px;
  }

  .quote-card {
    padding-left: 12px;
    padding-right: 12px;
  }

  .service-hero,
  .service-tabs {
    gap: 18px;
  }

  .service-tabs {
    padding-bottom: 12px;
  }

  .service-tab {
    width: 100%;
    justify-content: flex-start;
  }

  .action-block {
    flex-direction: column;
    align-items: stretch;
  }

  .search-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
