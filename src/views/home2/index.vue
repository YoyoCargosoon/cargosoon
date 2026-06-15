<script setup>
import { ref, onMounted, inject } from 'vue'
import { getStart, shipFromTo } from '@/api/tracking.js'

// global chat (provided by App.vue)
const sendToChat = inject('sendToChat', () => {})

// --- hero search ---
const askInput = ref('')
const tryAsking = [
  'Best way to ship 2 CBM to USA',
  'DDP to Germany cost',
  'Shipping time to Australia',
]
const askAI = (text) => {
  const q = (text ?? askInput.value).trim()
  if (!q) return
  sendToChat(q, 1)
  askInput.value = ''
}

// --- instant quote ---
const freightType = ref(1) // 1 ocean / 2 air / 3 rail
const reCity = ref([])
const destinationList = ref([])
const quoteFrom = ref('Shanghai, China (SHA)')
const quoteTo = ref('Los Angeles, USA (LAX)')
const cargoType = ref('General Goods')
const cargoTypes = ['General Goods', 'Battery', 'Liquid', 'Powder', 'Sensitive Goods']
const weight = ref(100)
const weightUnit = ref('KG')
const weightUnits = ['KG', 'CBM']

const getQuote = () => {
  window.open('/main/pricelist')
}

// --- popular routes (static) ---
const routes = [
  { from: 'Shanghai', fromC: 'China', fromFlag: '🇨🇳', to: 'Los Angeles', toC: 'USA', toFlag: '🇺🇸', mode: 'Ocean Freight', days: '20–24 days', price: 'USD 950', unit: '/CBM' },
  { from: 'Shenzhen', fromC: 'China', fromFlag: '🇨🇳', to: 'Felixstowe', toC: 'UK', toFlag: '🇬🇧', mode: 'Ocean Freight', days: '28–32 days', price: 'USD 1,180', unit: '/CBM' },
  { from: 'Ningbo', fromC: 'China', fromFlag: '🇨🇳', to: 'Hamburg', toC: 'Germany', toFlag: '🇩🇪', mode: 'Ocean Freight', days: '30–34 days', price: 'USD 1,250', unit: '/CBM' },
  { from: 'Shanghai', fromC: 'China', fromFlag: '🇨🇳', to: 'Sydney', toC: 'Australia', toFlag: '🇦🇺', mode: 'Ocean Freight', days: '10–18 days', price: 'USD 980', unit: '/CBM' },
  { from: 'Guangzhou', fromC: 'China', fromFlag: '🇨🇳', to: 'Dubai', toC: 'UAE', toFlag: '🇦🇪', mode: 'Air Freight', days: '3–5 days', price: 'USD 4.20', unit: '/KG' },
]

const trustItems = [
  { icon: 'M9 12l2 2 4-4', label: '10,000+ Businesses Trust Us' },
  { icon: 'M9 12l2 2 4-4', label: '98% On-time Delivery' },
  { icon: 'M9 12l2 2 4-4', label: '24/7 AI & Human Support' },
]

const features = ['Real-time Rates', 'Multiple Carriers', 'No Hidden Fees', 'Instant Confirmation']

onMounted(() => {
  getStart().then((res) => { reCity.value = res.data.data })
  shipFromTo().then((res) => { destinationList.value = res.data.data.endCountry })
})
</script>

<template>
  <div class="lp">
    <!-- ===== Hero ===== -->
    <section class="hero relative overflow-hidden">
      <img src="@/assets/icon/bg.webp" class="hero-bg select-none" alt="">
      <div class="relative z-10 px-10 pt-10 pb-6 max-w-[760px]">
        <div class="badge inline-flex items-center gap-1.5 text-xs font-semibold">
          <img src="@/assets/chat/rocket.svg" class="w-3.5" alt="">
          AI-POWERED LOGISTICS
        </div>

        <h1 class="mt-5 text-5xl font-extrabold leading-tight text-navy">
          Ship from China<br>
          to the World, <span class="text-orange">Smarter.</span>
        </h1>
        <p class="mt-4 text-gray-500 leading-relaxed max-w-md">
          AI-powered rates, real-time tracking, and end-to-end
          logistics solutions — all in one platform.
        </p>

        <!-- search -->
        <div class="ask-box mt-6 flex items-center bg-white rounded-2xl shadow p-2 max-w-xl">
          <input
            v-model="askInput"
            @keyup.enter="askAI()"
            type="text"
            class="flex-1 outline-none px-4 text-sm placeholder-gray-400"
            placeholder="Ask anything about shipping..."
          >
          <button @click="askAI()" class="ask-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
            <img src="@/assets/chat/rocket.svg" class="w-4" alt="">
            Ask AI
          </button>
        </div>

        <!-- try asking -->
        <div class="mt-4 flex items-center flex-wrap gap-2 text-xs">
          <span class="text-gray-400">Try asking:</span>
          <span
            v-for="(t, n) in tryAsking"
            :key="n"
            @click="askAI(t)"
            class="chip cursor-pointer px-3 py-1 rounded-full"
          >{{ t }}</span>
        </div>

        <!-- trust -->
        <div class="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
          <div v-for="(i, n) in trustItems" :key="n" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" stroke-width="1.6" />
              <path :d="i.icon" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ i.label }}
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Get Instant Quote ===== -->
    <section class="px-10 mt-8 mb-12 relative z-20">
      <div class="quote-card bg-white rounded-2xl shadow-lg px-6 py-8">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-2xl font-bold text-navy">Get Instant Quote</h2>
            <p class="text-gray-500 text-sm mt-1">Compare real-time rates from multiple carriers.</p>
          </div>
          <div class="flex gap-2 text-sm">
            <button
              :class="['ftab', freightType === 1 ? 'ftab-on' : '']"
              @click="freightType = 1"
            >🚢 Ocean Freight</button>
            <button
              :class="['ftab', freightType === 2 ? 'ftab-on' : '']"
              @click="freightType = 2"
            >✈️ Air Freight</button>
            <button
              :class="['ftab', freightType === 3 ? 'ftab-on' : '']"
              @click="freightType = 3"
            >🚆 Rail / Road</button>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-12 gap-4 items-end">
          <div class="col-span-3">
            <label class="lp-label">From</label>
            <el-select v-model="quoteFrom" filterable class="w-full" placeholder="Origin">
              <el-option v-for="item in reCity" :key="item.id" :label="item.pinyin" :value="item.pinyin" />
            </el-select>
          </div>
          <div class="col-span-3">
            <label class="lp-label">To</label>
            <el-select v-model="quoteTo" filterable class="w-full" placeholder="Destination">
              <el-option v-for="item in destinationList" :key="item.code_two" :label="item.en_nickname" :value="item.en_nickname" />
            </el-select>
          </div>
          <div class="col-span-2">
            <label class="lp-label">Cargo Type</label>
            <el-select v-model="cargoType" class="w-full">
              <el-option v-for="c in cargoTypes" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="col-span-2">
            <label class="lp-label">Weight / Volume</label>
            <div class="flex gap-2">
              <el-input v-model="weight" />
              <el-select v-model="weightUnit" style="width: 90px">
                <el-option v-for="u in weightUnits" :key="u" :label="u" :value="u" />
              </el-select>
            </div>
          </div>
          <div class="col-span-2">
            <button @click="getQuote" class="quote-btn w-full py-2.5 rounded-lg text-white font-semibold text-sm">
              Get Quote Now
            </button>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
          <div v-for="(f, n) in features" :key="n" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="1.6" />
              <path d="M9 12l2 2 4-4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ f }}
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Popular Routes ===== -->
    <section class="px-10 py-10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-navy">Popular Routes</h2>
          <p class="text-gray-500 text-sm mt-1">Most searched routes with competitive rates.</p>
        </div>
        <a href="/main/pricelist" class="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
          View all routes →
        </a>
      </div>

      <div class="mt-5 grid grid-cols-5 gap-4">
        <div v-for="(r, n) in routes" :key="n" class="route-card bg-white rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div class="text-center">
              <div class="text-2xl leading-none">{{ r.fromFlag }}</div>
              <div class="mt-1.5 font-semibold text-navy text-sm">{{ r.from }}</div>
              <div class="text-xs text-gray-400">{{ r.fromC }}</div>
            </div>
            <div class="text-blue-500 text-lg">→</div>
            <div class="text-center">
              <div class="text-2xl leading-none">{{ r.toFlag }}</div>
              <div class="mt-1.5 font-semibold text-navy text-sm">{{ r.to }}</div>
              <div class="text-xs text-gray-400">{{ r.toC }}</div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{{ r.mode }}</span>
            <span>{{ r.days }}</span>
          </div>
          <div class="mt-3 text-xs text-gray-400">From</div>
          <div class="text-orange font-bold text-lg">{{ r.price }}<span class="text-xs text-gray-400 font-normal"> {{ r.unit }}</span></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lp {
  background: linear-gradient(180deg, #eaf3fb 0%, #f6fafe 100%);
  min-width: 1280px;
}
.text-navy { color: #16284d; }
.text-orange { color: #f2670a; }

/* hero */
.hero {
  background: transparent;
  min-height: 440px;
}
.hero-bg {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 55%;
  object-fit: cover;
  object-position: left center;
  opacity: 0.95;
  pointer-events: none;
}
.badge {
  background: #fff;
  color: #2563eb;
  border: 1px solid #cfe0f5;
  padding: 5px 12px;
  border-radius: 999px;
}
.ask-box { box-shadow: 0 10px 30px rgba(22, 40, 77, 0.12); }
.ask-btn {
  background: linear-gradient(135deg, #ff8a3d 0%, #f2670a 100%);
  box-shadow: 0 4px 12px rgba(242, 103, 10, 0.3);
  transition: filter 0.2s ease;
}
.ask-btn:hover { filter: brightness(1.06); }
.chip {
  background: #e8f0fe;
  color: #2563eb;
}
.chip:hover { background: #d8e6fd; }

/* quote card */
.quote-card { box-shadow: 0 14px 40px rgba(22, 40, 77, 0.12); }
.lp-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}
.ftab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  background: #fff;
  transition: all 0.15s ease;
}
.ftab-on {
  border-color: #bcd5f7;
  background: #eef4fc;
  color: #2563eb;
  font-weight: 600;
}
.quote-btn {
  background: linear-gradient(135deg, #ff8a3d 0%, #f2670a 100%);
  box-shadow: 0 4px 12px rgba(242, 103, 10, 0.3);
  transition: filter 0.2s ease;
}
.quote-btn:hover { filter: brightness(1.06); }

/* routes */
.route-card {
  border: 1px solid #eef1f6;
  box-shadow: 0 4px 14px rgba(22, 40, 77, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.route-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(22, 40, 77, 0.12);
}
</style>
