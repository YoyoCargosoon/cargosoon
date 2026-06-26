<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  House,
  Microphone,
  Paperclip,
  Picture,
  Search,
  Ship,
  ShoppingCart,
  Van,
} from '@element-plus/icons-vue'
import heroLogistics from '@/assets/homepage/hero-logistics.png'

const router = useRouter()

const askInput = ref('')
const searchInputRef = ref(null)
const attachmentInputRef = ref(null)
const imageInputRef = ref(null)

const promptItems = [
  'Sea DDP to Los Angeles',
  'Air freight to Germany',
  'Track my shipment',
  'Help me buy from 1688',
]

const capabilities = [
  {
    key: 'freight',
    title: 'Freight Rates',
    description: 'Sea, air and DDP shipping',
    icon: Ship,
  },
  {
    key: 'sourcing',
    title: '1688 Sourcing',
    description: 'Buying and supplier inspection',
    icon: ShoppingCart,
  },
  {
    key: 'warehouse',
    title: 'Warehousing',
    description: 'Storage, inventory and fulfillment',
    icon: House,
  },
  {
    key: 'tracking',
    title: 'Shipment Tracking',
    description: 'Track shipments in real time',
    icon: Van,
  },
]

const jumpToAiChat = (text = '') => {
  const query = { mode: 'ai' }
  const q = String(text || '').trim()
  if (q) query.q = q

  router.push({
    name: 'chat',
    query,
  })
}

const askAI = (text) => {
  const q = (text ?? askInput.value).trim()
  if (!q) return
  askInput.value = q
  jumpToAiChat(q)
}

const openCapability = (key) => {
  const routeMap = {
    freight: { name: 'fcl-ddp-freight' },
    sourcing: { name: 'chat', query: { mode: 'ai', q: 'Help me buy from 1688 and inspect my supplier' } },
    warehouse: { name: 'chat', query: { mode: 'ai', q: 'I need warehouse storage, inventory and fulfillment support in China' } },
    tracking: { name: 'track' },
  }

  router.push(routeMap[key] || { name: 'chat', query: { mode: 'ai' } })
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
    askInput.value = 'Check prices from Shenzhen to Los Angeles'
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
  askInput.value = `Help me review this file: ${file.name}`
  event.target.value = ''
}

const handleImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  askInput.value = `Help me review this cargo image: ${file.name}`
  event.target.value = ''
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
      <div class="hero-panel">
        <div class="hero-main">
          <div class="hero-copy">
            <h1 class="hero-title">
              Ask AI. Get Freight Rates from China
              <span>Instantly.</span>
            </h1>

            <p class="hero-subtitle">
              Check Sea, Air and DDP rates, track shipments, and manage sourcing from China - all in one place.
            </p>

            <div class="search-shell">
              <div class="search-card">
                <div class="search-leading">
                  <Search class="search-leading-icon" aria-hidden="true" />
                </div>

                <textarea
                  ref="searchInputRef"
                  v-model="askInput"
                  class="search-input"
                  rows="1"
                  wrap="off"
                  placeholder="Ship 300 kg from Shenzhen to Los Angeles"
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
                  <button
                    class="search-icon-btn"
                    type="button"
                    title="Voice search"
                    aria-label="Voice search"
                    @click="startVoiceSearch"
                  >
                    <Microphone class="search-icon" aria-hidden="true" />
                  </button>
                  <button
                    class="search-icon-btn"
                    type="button"
                    title="Upload attachment"
                    aria-label="Upload attachment"
                    @click="triggerAttachmentUpload"
                  >
                    <Paperclip class="search-icon" aria-hidden="true" />
                  </button>
                  <button
                    class="search-icon-btn"
                    type="button"
                    title="Search by image"
                    aria-label="Search by image"
                    @click="triggerImageSearch"
                  >
                    <Picture class="search-icon" aria-hidden="true" />
                  </button>

                  <div class="search-divider" aria-hidden="true"></div>

                  <button class="primary-btn" type="button" @click="askAI()">
                    <span class="primary-btn-star" aria-hidden="true">✦</span>
                    Get AI Quote
                  </button>
                </div>
              </div>

              <div class="prompt-strip">
                <span class="prompt-label">Try asking:</span>
                <button
                  v-for="prompt in promptItems"
                  :key="prompt"
                  type="button"
                  class="prompt-link"
                  @click="askAI(prompt)"
                >
                  {{ prompt }}
                  <ArrowRight class="prompt-link-icon" aria-hidden="true" />
                </button>
              </div>

            </div>
          </div>

        </div>

        <div class="hero-image-band" aria-hidden="true">
          <img :src="heroLogistics" alt="" class="hero-image" />
          <div class="hero-image-fade"></div>
        </div>

        <div class="capability-strip">
          <article
            v-for="item in capabilities"
            :key="item.key"
            class="capability-item"
            role="button"
            tabindex="0"
            @click="openCapability(item.key)"
            @keyup.enter="openCapability(item.key)"
          >
            <component :is="item.icon" class="capability-icon" aria-hidden="true" />
            <div class="capability-copy">
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-page {
  min-height: calc(100vh - 56px);
  background:
    radial-gradient(circle at top right, rgba(248, 165, 96, 0.1), transparent 24%),
    linear-gradient(180deg, #fffdfb 0%, #fffaf7 44%, #ffffff 100%);
  color: #161b26;
}

.hero-wrap {
  padding: 10px 0 14px;
}

.hero-panel {
  max-width: 1240px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: visible;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.hero-main {
  min-height: 0;
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px 28px;
}

.hero-title {
  max-width: none;
  margin: 0;
  color: #131b32;
  font-size: 50px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: 0;
  white-space: nowrap;
  text-align: center;
}

.hero-title span {
  display: inline;
  margin-top: 0;
  color: #f26a1b;
}

.hero-subtitle {
  max-width: none;
  margin: 16px 0 0;
  color: #697387;
  font-size: 16px;
  line-height: 1.45;
  white-space: nowrap;
  text-align: center;
}

.search-shell {
  width: 100%;
  max-width: 1030px;
  margin: 30px auto 0;
}

.search-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 21px 26px;
  border: 1px solid rgba(242, 106, 27, 0.34);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 38px rgba(242, 106, 27, 0.08);
}

.search-card:focus-within {
  border-color: rgba(242, 106, 27, 0.48);
  box-shadow: 0 20px 40px rgba(242, 106, 27, 0.12);
}

.search-leading {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3c4659;
}

.search-leading-icon {
  width: 24px;
  height: 24px;
}

.search-input {
  min-height: 56px;
  width: 100%;
  resize: none;
  border: 0;
  outline: 0;
  padding: 9px 0 0;
  background: transparent;
  color: #2d3442;
  font-size: 17px;
  line-height: 1.34;
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
}

.search-input::placeholder {
  color: #75809a;
}

.search-hidden-input {
  display: none;
}

.search-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.search-icon-btn {
  width: 30px;
  height: 30px;
  border: 0;
  padding: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-icon {
  width: 19px;
  height: 19px;
  color: #4d5568;
  opacity: 0.62;
}

.search-icon-btn:hover .search-icon {
  color: #f26a1b;
  opacity: 1;
}

.search-divider {
  width: 1px;
  height: 26px;
  margin: 0 4px 0 2px;
  background: rgba(17, 26, 43, 0.12);
}

.primary-btn {
  min-height: 52px;
  padding: 0 24px;
  border: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff8f35 0%, #f26a1b 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(242, 106, 27, 0.24);
}

.primary-btn-star {
  font-size: 14px;
  line-height: 1;
  transform: translateY(-1px);
}

.prompt-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px 0;
  margin: 22px auto 0;
  max-width: 1010px;
  color: #4f5768;
  font-size: 15px;
  line-height: 1.55;
}

.prompt-label {
  margin-right: 22px;
  color: #7a8190;
}

.prompt-link {
  border: 0;
  padding: 0 20px;
  background: transparent;
  color: #374055;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: inherit;
  cursor: pointer;
  border-right: 1px solid rgba(17, 26, 43, 0.12);
}

.prompt-link:first-of-type {
  padding-left: 0;
}

.prompt-link:last-child {
  padding-right: 0;
  border-right: 0;
}

.prompt-link:hover {
  color: #f26a1b;
}

.prompt-link-icon {
  width: 13px;
  height: 13px;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right bottom;
  opacity: 0.82;
  animation: heroFloat 18s ease-in-out infinite alternate;
}

.hero-image-band {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 108px;
  height: clamp(240px, 29vw, 350px);
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  border-radius: 0;
}

.hero-image-fade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 253, 250, 0.96) 0%, rgba(255, 253, 250, 0.72) 18%, rgba(255, 253, 250, 0.2) 52%, rgba(255, 253, 250, 0.03) 100%),
    linear-gradient(90deg, rgba(255, 253, 250, 0.9) 0%, rgba(255, 253, 250, 0.55) 34%, rgba(255, 253, 250, 0.08) 74%, rgba(255, 253, 250, 0) 100%);
}

.capability-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 18px 20px 18px;
  border-top: 0;
  background: rgba(255, 255, 255, 0.96);
  position: relative;
  z-index: 2;
  margin-top: auto;
  box-shadow: 0 -10px 28px rgba(28, 34, 48, 0.04);
}

@keyframes heroFloat {
  0% {
    transform: scale(1.01) translate3d(0, 0, 0);
  }
  100% {
    transform: scale(1.04) translate3d(-10px, -6px, 0);
  }
}

.capability-item {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  padding: 10px 22px;
  border-right: 1px solid rgba(17, 26, 43, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.capability-item:last-child {
  border-right: 0;
}

.capability-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  color: #f26a1b;
}

.capability-item:hover,
.capability-item:focus-visible {
  outline: 0;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: inset 0 0 0 1px rgba(242, 106, 27, 0.24), 0 12px 26px rgba(242, 106, 27, 0.08);
  transform: translateY(-1px);
}

.capability-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.capability-copy strong {
  color: #1f2638;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.capability-copy span {
  color: #808896;
  font-size: 14px;
  line-height: 1.35;
}

@media (max-width: 1100px) {
  .hero-copy {
    max-width: 100%;
    padding: 0 28px 24px;
  }

  .hero-title,
  .hero-subtitle {
    white-space: normal;
  }

  .hero-image-band {
    bottom: 146px;
    height: clamp(220px, 32vw, 280px);
  }

  .capability-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 0;
    padding-top: 14px;
    margin-top: auto;
  }

  .capability-item:nth-child(2n) {
    border-right: 0;
  }
}

@media (max-width: 760px) {
  .hero-wrap {
    padding: 8px 0 16px;
  }

  .hero-panel {
    min-height: auto;
    display: block;
    border-radius: 0;
  }

  .hero-main {
    display: block;
  }

  .hero-copy {
    padding: 36px 16px 18px;
  }

  .hero-title {
    font-size: 30px;
    line-height: 1.12;
    text-align: left;
  }

  .hero-title span {
    display: inline;
    margin-top: 0;
  }

  .hero-subtitle {
    margin-top: 14px;
    font-size: 16px;
    white-space: normal;
    text-align: left;
  }

  .search-card {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px 16px 18px;
  }

  .search-leading {
    display: none;
  }

  .search-input {
    min-height: 70px;
    font-size: 16px;
    white-space: normal;
    overflow-x: visible;
    text-overflow: clip;
  }

  .search-actions {
    justify-content: space-between;
  }

  .prompt-strip {
    justify-content: flex-start;
    margin-top: 18px;
    gap: 10px 0;
    max-width: none;
    font-size: 14px;
  }

  .prompt-label {
    width: 100%;
    margin-right: 0;
  }

  .prompt-link {
    padding: 7px 10px;
    border: 1px solid rgba(17, 26, 43, 0.08);
    border-radius: 999px;
  }

  .prompt-link:first-of-type {
    padding-left: 0;
  }

  .hero-image-band {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    height: 156px;
    margin-top: 8px;
  }

  .capability-strip {
    grid-template-columns: 1fr;
    padding: 10px 6px 12px;
    margin-top: 8px;
    background: rgba(255, 255, 255, 0.94);
  }

  .capability-item,
  .capability-item:nth-child(2n) {
    border-right: 0;
    padding: 12px 12px;
  }
}
</style>
