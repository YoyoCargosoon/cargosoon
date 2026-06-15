<script setup>
import { inject, nextTick, onMounted, ref } from 'vue'

const sendToChat = inject('sendToChat', () => {})

const askInput = ref('')
const searchInputRef = ref(null)
const attachmentInputRef = ref(null)
const imageInputRef = ref(null)

const promptColumns = [
  [
    'Sea DDP to Los Angeles',
    'Air freight to Germany',
    'Amazon FBA delivery to the UK',
    'Warehouse storage in Shenzhen',
    'DDP delivery to Amazon FBA',
  ],
  [
    'Best route to Sydney',
    'Track my shipment status',
    'Check my order from China',
    '1688 sourcing and inspection',
    'Sea freight to Europe',
  ],
]

const quickAccess = [
  {
    eyebrow: 'AI Freight Rates',
    title: 'Access freight rate search',
    body: 'Review sea freight, air freight, and DDP pricing scenarios from China.',
    action: 'Open Freight Rates',
    href: '/main/pricelist',
    items: ['Sea freight', 'Air freight', 'DDP freight'],
  },
  {
    eyebrow: 'Tracking & Orders',
    title: 'Access tracking and order updates',
    body: 'Review shipment milestones, tracking status, and order progress in one workflow.',
    action: 'Open Tracking',
    href: '/order/tracking',
    items: ['Shipment tracking', 'Order status', 'Latest updates'],
  },
  {
    eyebrow: 'Warehouse Services',
    title: 'Access warehouse operations',
    body: 'Review warehouse services for cargo handling before export and delivery.',
    action: 'Open Warehouse',
    href: '/warehouse/SKUManagement',
    items: ['Consolidation', 'Storage', 'Relabeling', 'Inspection'],
  },
  {
    eyebrow: '1688 Sourcing',
    title: 'Access sourcing and fulfillment support',
    body: 'Review supplier sourcing, inspection, and delivery planning from one service entry point.',
    action: 'Open 1688 Sourcing',
    href: 'https://codropshipping.com/',
    items: ['Product sourcing', 'Supplier verification', 'Quality inspection', 'Final delivery'],
  },
]

const trustPoints = [
  {
    title: '18+ years in international freight forwarding',
    body: 'Built on long-term experience in export logistics, customer coordination, and shipment execution from China.',
  },
  {
    title: 'Freight, warehousing, and sourcing in one operating model',
    body: 'Support rate inquiry, tracking, warehouse handling, and 1688 sourcing without splitting the service workflow across separate teams.',
  },
  {
    title: 'AI efficiency with operational follow-through',
    body: 'Use AI to accelerate inquiry and updates, backed by operational teams when booking, handling, and delivery need to move forward.',
  },
]

const askAI = (text) => {
  const q = (text ?? askInput.value).trim()
  if (!q) return
  sendToChat(q, 1)
  askInput.value = ''
}

const openQuickAccess = (href) => {
  window.open(href, '_blank')
}

const openAssistant = () => {
  window.open('/new/chat', '_blank')
}

const triggerAttachmentUpload = () => {
  attachmentInputRef.value?.click()
}

const triggerImageSearch = () => {
  imageInputRef.value?.click()
}

const startVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    askInput.value = 'Voice search request: '
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim() || ''
    if (transcript) askInput.value = transcript
  }
  recognition.start()
}

const handleAttachmentSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  askInput.value = `Attachment added: ${file.name}`
  event.target.value = ''
}

const handleImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  askInput.value = `Image search request: ${file.name}`
  event.target.value = ''
}

const promptBadge = (groupIndex, itemIndex) => {
  if (groupIndex === 0 && [1, 2, 4].includes(itemIndex)) return 'New'
  if (groupIndex === 1 && [0, 1].includes(itemIndex)) return 'Hot'
  return ''
}

const promptRankLabel = (groupIndex, itemIndex) => {
  if (groupIndex === 0 && itemIndex === 0) return ''
  return String(groupIndex === 0 ? itemIndex : itemIndex + 5)
}

const promptRankClass = (groupIndex, itemIndex) => {
  if (groupIndex === 0 && itemIndex === 0) return 'prompt-rank prompt-rank-top-word'
  const rank = groupIndex === 0 ? itemIndex + 1 : itemIndex + 5
  if (rank <= 3) return `prompt-rank prompt-rank-top-${rank}`
  return 'prompt-rank'
}

onMounted(() => {
  nextTick(() => {
    searchInputRef.value?.focus()
    searchInputRef.value?.setSelectionRange?.(0, 0)
  })
})
</script>

<template>
  <div class="hero-page">
    <section class="hero-wrap">
      <div class="hero-inner">
        <div class="hero-brand">
          <div class="brand-art" aria-hidden="true">
            <div class="brand-side brand-side-left">
              <div class="brand-side-icon brand-side-ship-icon"></div>
              <div class="brand-side-line"></div>
            </div>
            <div class="brand-word brand-word-left">Cargo</div>
            <div class="brand-center">
              <div class="brand-shadow"></div>
              <div class="brand-wave brand-wave-a"></div>
              <div class="brand-wave brand-wave-b"></div>
              <div class="brand-plane"></div>
              <div class="brand-ship"></div>
              <div class="brand-orbit"></div>
              <div class="brand-core">
                <img src="@/assets/logo/cargosoonLogo1.png" class="brand-core-icon" alt="">
              </div>
              <div class="brand-trail"></div>
              <div class="brand-trail brand-trail-b"></div>
            </div>
            <div class="brand-word brand-word-right">Soon</div>
            <div class="brand-side brand-side-right">
              <div class="brand-side-line"></div>
              <div class="brand-side-icon brand-side-plane-icon"></div>
            </div>
          </div>
        </div>

        <div id="ai-quote-box" class="search-shell">
          <div class="search-card">
            <textarea
              ref="searchInputRef"
              v-model="askInput"
              class="search-input"
              rows="3"
              placeholder="Ask for freight rates, tracking, or order updates from China"
              @keyup.enter.exact.prevent="askAI()"
              @keyup.ctrl.enter.stop
            ></textarea>

            <input
              ref="attachmentInputRef"
              class="search-hidden-input"
              type="file"
              @change="handleAttachmentSelect"
            >
            <input
              ref="imageInputRef"
              class="search-hidden-input"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
            >

            <div class="search-actions">
              <div class="search-icons">
                <button
                  class="search-icon-btn"
                  type="button"
                  title="Voice search"
                  aria-label="Voice search"
                  @click="startVoiceSearch"
                >
                  <svg class="search-icon search-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                    <path d="M6 11.5a6 6 0 0 0 12 0"></path>
                    <path d="M12 17v4"></path>
                    <path d="M9 21h6"></path>
                  </svg>
                </button>
                <button
                  class="search-icon-btn"
                  type="button"
                  title="Upload attachment"
                  aria-label="Upload attachment"
                  @click="triggerAttachmentUpload"
                >
                  <svg class="search-icon search-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9.5 12.5 15 7a3.5 3.5 0 1 1 5 5l-8.5 8.5a5 5 0 0 1-7-7L13 5"></path>
                  </svg>
                </button>
                <button
                  class="search-icon-btn"
                  type="button"
                  title="Search by image"
                  aria-label="Search by image"
                  @click="triggerImageSearch"
                >
                  <svg class="search-icon search-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                    <circle cx="9" cy="10" r="1.8"></circle>
                    <path d="m6 17 4.2-4.2a1 1 0 0 1 1.4 0L14 15l1.6-1.6a1 1 0 0 1 1.4 0L20 16.4"></path>
                  </svg>
                </button>
              </div>
              <button class="primary-btn" @click="askAI()">Search</button>
            </div>
          </div>

          <div class="hero-promo">
            <button class="hero-promo-pill" @click="openAssistant">
              AI assistant for freight rates, shipment tracking, and order updates
            </button>
          </div>

          <div class="prompt-board">
            <div class="prompt-board-head">
              <button class="prompt-board-title-wrap" @click="openQuickAccess('/main/pricelist')">
                <span class="prompt-board-title">Popular searches</span>
                <span class="prompt-board-title-arrow"></span>
              </button>
              <button class="prompt-board-switch" @click="openQuickAccess('/main/pricelist')">Refresh</button>
            </div>

            <div class="prompt-columns">
              <div
                v-for="(group, groupIndex) in promptColumns"
                :key="groupIndex"
                class="prompt-column"
              >
                <button
                  v-for="(item, itemIndex) in group"
                  :key="item"
                  class="prompt-line"
                  @click="askAI(item)"
                >
                  <span :class="promptRankClass(groupIndex, itemIndex)">
                    <span
                      v-if="groupIndex === 0 && itemIndex === 0"
                      class="prompt-rank-top-icon"
                      aria-hidden="true"
                    ></span>
                    {{ promptRankLabel(groupIndex, itemIndex) }}
                  </span>
                  <span class="prompt-line-text">{{ item }}</span>
                  <span v-if="promptBadge(groupIndex, itemIndex)" class="prompt-badge">
                    {{ promptBadge(groupIndex, itemIndex) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="capability-wrap">
        <div class="capability-inner">
          <div class="capability-head">
            <div class="section-badge">Quick Access</div>
            <h2>Access the service you need</h2>
            <p>
              Open the main service pages directly, with the core functions available inside each workflow.
            </p>
          </div>

          <div class="capability-grid">
            <article
              v-for="item in quickAccess"
              :key="item.title"
              class="capability-card"
            >
              <div class="capability-eyebrow">{{ item.eyebrow }}</div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
              <div class="tag-grid">
                <div
                  v-for="service in item.items"
                  :key="service"
                  class="service-tag-btn"
                >
                  {{ service }}
                </div>
              </div>
              <button class="card-link" @click="openQuickAccess(item.href)">{{ item.action }}</button>
            </article>
          </div>
        </div>
      </section>

    <section class="trust-wrap">
      <div class="trust-inner">
        <div class="trust-head">
          <div class="section-badge">Why CargoSoon</div>
          <h2>Built for buyers who value speed, clarity, and execution</h2>
        </div>

        <div class="trust-grid">
          <article
            v-for="item in trustPoints"
            :key="item.title"
            class="trust-card"
          >
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-page {
  background: #ffffff;
  color: #201914;
}

.hero-wrap {
  min-height: calc(100vh - 72px);
  padding: 48px 20px 72px;
  display: flex;
  align-items: flex-start;
}

.hero-inner {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  text-align: center;
}

.hero-brand {
  display: flex;
  justify-content: center;
}

.brand-art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 128px;
}

.brand-side {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.95;
}

.brand-side-left {
  margin-right: 12px;
}

.brand-side-right {
  margin-left: 12px;
}

.brand-side-line {
  width: 34px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(244, 149, 80, 0.12), rgba(236, 125, 56, 0.76));
}

.brand-side-icon {
  position: relative;
  flex: 0 0 auto;
}

.brand-side-ship-icon {
  width: 32px;
  height: 20px;
}

.brand-side-ship-icon::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 1px;
  width: 10px;
  height: 6px;
  border-radius: 4px 4px 0 0;
  background: #f38a42;
  box-shadow: 10px 0 0 0 rgba(243, 138, 66, 0.9);
}

.brand-side-ship-icon::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 1px;
  width: 32px;
  height: 10px;
  border-radius: 0 0 10px 10px;
  background: linear-gradient(135deg, #ffb881, #ea742f);
  transform: skewX(-24deg);
}

.brand-side-plane-icon {
  width: 34px;
  height: 18px;
  background: linear-gradient(135deg, #ffbf92, #ec7d38);
  clip-path: polygon(0 44%, 44% 44%, 72% 0, 82% 0, 74% 44%, 100% 44%, 100% 56%, 74% 56%, 82% 100%, 72% 100%, 44% 56%, 0 56%);
  transform: rotate(16deg);
  filter: drop-shadow(0 2px 4px rgba(228, 111, 47, 0.14));
}

.brand-word {
  font-size: clamp(32px, 4.2vw, 56px);
  line-height: 0.9;
  font-weight: 800;
  letter-spacing: -0.06em;
  background: linear-gradient(135deg, #ffb37c 0%, #f2853d 45%, #d95f27 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-word-left {
  margin-right: -4px;
  opacity: 0.95;
}

.brand-word-right {
  margin-left: -4px;
  opacity: 0.95;
}

.brand-center {
  position: relative;
  width: clamp(78px, 7vw, 102px);
  height: clamp(78px, 7vw, 102px);
  margin: 0 -2px 0;
}

.brand-shadow {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -6px;
  height: 14px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(191, 224, 154, 0.48), rgba(191, 224, 154, 0));
  filter: blur(3px);
}

.brand-wave {
  position: absolute;
  border-radius: 999px 999px 999px 999px;
  border-top: 2px solid rgba(234, 123, 53, 0.55);
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;
  border-bottom: 0;
  opacity: 0.8;
}

.brand-wave-a {
  width: 56px;
  height: 22px;
  left: -22px;
  bottom: 14px;
  transform: rotate(-6deg);
}

.brand-wave-b {
  width: 44px;
  height: 18px;
  right: -14px;
  bottom: 34px;
  transform: rotate(20deg);
}

.brand-ship {
  position: absolute;
  left: -50px;
  bottom: 10px;
  width: 42px;
  height: 18px;
  transform: rotate(-6deg);
}

.brand-ship::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  width: 10px;
  height: 6px;
  border-radius: 4px 4px 0 0;
  background: rgba(243, 132, 62, 0.96);
  box-shadow: 10px 0 0 0 rgba(243, 132, 62, 0.88);
}

.brand-ship::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 42px;
  height: 12px;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(135deg, #ffbe88, #e9712d);
  transform: skewX(-24deg);
}

.brand-plane {
  position: absolute;
  right: -30px;
  top: -12px;
  width: 34px;
  height: 18px;
  background: linear-gradient(135deg, #ffc8a1, #ec7d38);
  clip-path: polygon(0 44%, 45% 44%, 72% 0, 82% 0, 74% 44%, 100% 44%, 100% 56%, 74% 56%, 82% 100%, 72% 100%, 45% 56%, 0 56%);
  transform: rotate(18deg);
  filter: drop-shadow(0 2px 4px rgba(228, 111, 47, 0.14));
}

.brand-orbit {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 224, 198, 0.98), transparent 34%),
    linear-gradient(145deg, #ffbf93 0%, #f08b45 54%, #d95f27 100%);
  box-shadow: 0 10px 26px rgba(228, 111, 47, 0.14);
}

.brand-core {
  position: absolute;
  inset: 18%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(228, 111, 47, 0.12);
}

.brand-core-icon {
  width: 74%;
  opacity: 0.95;
}

.brand-trail {
  position: absolute;
  left: -54px;
  top: 14px;
  width: 82px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 196, 159, 0), rgba(247, 158, 98, 0.92));
  filter: blur(2px);
}

.brand-trail-b {
  left: auto;
  right: -18px;
  top: 36px;
  width: 32px;
  height: 10px;
  transform: rotate(24deg);
  opacity: 0.72;
}

.search-shell {
  width: min(100%, 738px);
  margin: 18px auto 0;
}

.search-card {
  position: relative;
  padding: 6px 12px 6px 12px;
  border-radius: 24px;
  background: #ffffff;
  border: 2px solid rgba(232, 114, 48, 0.58);
  box-shadow: 0 16px 34px rgba(122, 102, 76, 0.06);
}

.search-input {
  width: 100%;
  min-height: 36px;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  border-radius: 20px;
  padding: 3px 204px 3px 4px;
  box-sizing: border-box;
  font-size: clamp(14px, 1.12vw, 15px);
  line-height: 1.25;
  color: #231c16;
  caret-color: #e46f2f;
  text-align: left;
}

.search-input::placeholder {
  color: #c9c3bb;
}

.search-input:focus::placeholder {
  opacity: 0.82;
}

.search-actions {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icons {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 28px;
}

.search-hidden-input {
  display: none;
}

.search-icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-icon {
  width: 22px;
  height: 22px;
  color: #3d372f;
  opacity: 0.92;
}

.search-icon-svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.primary-btn {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.primary-btn {
  padding: 12px 28px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f08c47 0%, #e46f2f 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(228, 111, 47, 0.18);
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.hero-promo {
  margin-top: 36px;
  display: flex;
  justify-content: center;
}

.hero-promo-pill {
  border: 0;
  background: #f7f7f8;
  color: #544d46;
  font-size: 13px;
  line-height: 1.4;
  padding: 11px 18px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
}

.prompt-board {
  width: min(100%, 880px);
  margin: 50px auto 0;
  text-align: left;
}

.prompt-board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.prompt-board-title-wrap {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0;
  cursor: pointer;
}

.prompt-board-title {
  font-size: 19px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: #272a31;
}

.prompt-board-title-arrow {
  width: 11px;
  height: 11px;
  margin-left: 9px;
  border-top: 2px solid #9ca3b3;
  border-right: 2px solid #9ca3b3;
  transform: rotate(45deg) translateY(1px);
  flex-shrink: 0;
}

.prompt-board-switch {
  border: 0;
  background: transparent;
  color: #a3a9b7;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.prompt-board-switch::before {
  content: '';
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid #a4abbb;
  border-right-color: transparent;
  border-radius: 999px;
  display: inline-block;
}

.prompt-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 58px;
}

.prompt-column {
  display: grid;
  gap: 12px;
}

.prompt-column:nth-child(2) {
  padding-top: 1px;
}

.prompt-line {
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #32363f;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.025em;
  text-align: left;
  cursor: pointer;
  min-height: 34px;
}

.prompt-line:hover {
  color: #262a31;
}

.prompt-line:hover .prompt-line-text {
  color: #e46f2f;
}

.prompt-rank {
  width: 26px;
  flex: 0 0 26px;
  color: #9ca4b5;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  text-align: left;
}

.prompt-rank-top-word {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ff5568;
  font-size: 0;
  font-weight: 700;
  letter-spacing: 0;
}

.prompt-rank-top-icon {
  position: relative;
  display: inline-block;
  width: 15px;
  height: 20px;
}

.prompt-rank-top-icon::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 6px;
  width: 2px;
  height: 12px;
  border-radius: 999px;
  background: #ff5568;
}

.prompt-rank-top-icon::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 1px;
  width: 9px;
  height: 9px;
  border-left: 2px solid #ff5568;
  border-top: 2px solid #ff5568;
  transform: rotate(45deg);
}

.prompt-rank-top-1 {
  color: #ff4f66;
}

.prompt-rank-top-2 {
  color: #ff6d1f;
}

.prompt-rank-top-3 {
  color: #f2a11e;
}

.prompt-line-text {
  color: inherit;
  white-space: nowrap;
  transform: translateY(-0.5px);
}

.prompt-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 18px;
  padding: 0 6px;
  margin-left: 3px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff8d43, #ff5f40);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.capability-wrap {
  padding: 12px 20px 84px;
}

.capability-inner {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}

.capability-head {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.section-badge,
.capability-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-badge {
  padding: 8px 14px;
  background: rgba(228, 111, 47, 0.08);
  color: #d86a2d;
}

.capability-head h2 {
  margin: 18px 0 0;
  font-size: clamp(28px, 3.5vw, 42px);
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: #221a14;
}

.capability-head p {
  margin: 14px auto 0;
  max-width: 620px;
  color: #74685f;
  font-size: 16px;
  line-height: 1.7;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 36px;
}

.capability-card {
  padding: 26px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid rgba(228, 111, 47, 0.14);
  box-shadow: 0 18px 44px rgba(129, 83, 46, 0.06);
  text-align: left;
}

.capability-eyebrow {
  padding: 6px 10px;
  background: #fff4ea;
  color: #c05d26;
}

.capability-card h3 {
  margin: 16px 0 0;
  font-size: 24px;
  line-height: 1.2;
  color: #221a14;
  letter-spacing: -0.02em;
}

.capability-card p {
  margin: 12px 0 0;
  color: #74685f;
  font-size: 15px;
  line-height: 1.72;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.service-tag-btn {
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff8f1;
  color: #7a675b;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  cursor: default;
}

.card-link {
  margin-top: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #d86a2d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.trust-wrap {
  padding: 0 20px 96px;
}

.trust-inner {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}

.trust-head {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.trust-head h2 {
  margin: 18px 0 0;
  font-size: clamp(28px, 3.3vw, 40px);
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: #221a14;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
}

.trust-card {
  padding: 24px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid rgba(228, 111, 47, 0.12);
  box-shadow: 0 14px 34px rgba(129, 83, 46, 0.05);
}

.trust-card h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.26;
  color: #221a14;
  letter-spacing: -0.02em;
}

.trust-card p {
  margin: 12px 0 0;
  color: #74685f;
  font-size: 15px;
  line-height: 1.72;
}

@media (max-width: 900px) {
  .hero-page,
  .hero-wrap {
    min-height: auto;
  }

  .hero-wrap {
    min-height: calc(100vh - 68px);
    padding: 34px 16px 56px;
  }

  .hero-inner {
    max-width: 100%;
  }

  .brand-art {
    min-height: 108px;
    gap: 8px;
  }

  .brand-center {
    margin-bottom: 6px;
  }

  .search-card {
    padding: 8px 12px 8px 12px;
    border-radius: 22px;
  }

  .search-input {
    min-height: 74px;
    padding: 6px 10px 50px 2px;
    border-radius: 18px;
  }

  .search-actions {
    right: 12px;
    left: 12px;
    top: auto;
    bottom: 10px;
    transform: none;
    justify-content: space-between;
  }

  .search-icons {
    justify-content: center;
  }

  .prompt-board {
    width: min(100%, 620px);
    margin-top: 36px;
  }

  .hero-promo {
    margin-top: 22px;
  }

  .prompt-board-title,
  .prompt-board-title {
    font-size: 17px;
  }

  .prompt-board-title-arrow {
    width: 11px;
    height: 11px;
    margin-left: 8px;
  }

  .prompt-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .prompt-column {
    gap: 12px;
  }

  .prompt-column:nth-child(2) {
    padding-top: 0;
  }

  .capability-wrap {
    padding: 0 16px 60px;
  }

  .trust-wrap {
    padding: 0 16px 68px;
  }

  .capability-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 28px;
  }

  .capability-card {
    padding: 22px;
    border-radius: 24px;
  }

  .trust-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 28px;
  }

  .trust-card {
    padding: 22px;
  }

}

@media (max-width: 560px) {
  .search-shell {
    width: 100%;
  }

  .search-shell {
    margin-top: 24px;
  }

  .brand-word {
    font-size: 34px;
  }

  .brand-center {
    width: 62px;
    height: 62px;
  }

  .search-input {
    min-height: 82px;
    font-size: 15px;
    line-height: 1.32;
  }

  .hero-promo {
    margin-top: 28px;
  }

  .prompt-board-head {
    align-items: flex-start;
  }

  .prompt-line {
    gap: 8px;
    font-size: 15px;
    line-height: 1.2;
    min-height: 30px;
  }

  .prompt-rank {
    width: 20px;
    flex-basis: 20px;
    font-size: 17px;
  }

  .prompt-badge {
    min-width: 22px;
    height: 17px;
    font-size: 10px;
  }

  .prompt-line-text {
    white-space: normal;
  }
}
</style>
