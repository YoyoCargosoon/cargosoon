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
  'Track my shipment',
  'Send goods to Amazon FBA',
  'Help me buy from 1688',
  'Need warehouse help',
]

const capabilities = [
  {
    key: 'freight',
    title: 'Freight from China',
    description: 'Ocean, air, rail, and truck freight',
    icon: Ship,
  },
  {
    key: 'sourcing',
    title: 'Buying & Sourcing',
    description: '1688 sourcing and quality inspection',
    icon: ShoppingCart,
  },
  {
    key: 'warehouse',
    title: 'Warehouse Support',
    description: 'Storage, inventory, and fulfillment',
    icon: House,
  },
  {
    key: 'tracking',
    title: 'Tracking & Delivery',
    description: 'Real-time tracking and delivery',
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
  jumpToAiChat(q)
  askInput.value = ''
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
              Shipping from China,
              <span>made simple</span>
            </h1>

            <p class="hero-subtitle">
              Check shipping prices, track your shipment, and get help buying and shipping from China.
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
                  rows="2"
                  placeholder="Check shipping prices, track your shipment, or ask for help shipping from China"
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
                    AI Assistant
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
  padding: 18px 18px 40px;
}

.hero-panel {
  max-width: 1240px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 250, 0.98) 100%);
  box-shadow: 0 20px 54px rgba(53, 41, 31, 0.08);
}

.hero-main {
  min-height: 0;
}

.hero-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 56px 26px;
}

.hero-title {
  max-width: 620px;
  margin: 0;
  color: #131b32;
  font-size: clamp(50px, 5.6vw, 64px);
  font-weight: 800;
  line-height: 0.97;
  letter-spacing: -0.03em;
}

.hero-title span {
  display: block;
  margin-top: 8px;
  color: #f26a1b;
}

.hero-subtitle {
  max-width: 500px;
  margin: 24px 0 0;
  color: #697387;
  font-size: 18px;
  line-height: 1.45;
}

.search-shell {
  max-width: 830px;
  margin-top: 30px;
}

.search-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid rgba(242, 106, 27, 0.34);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 36px rgba(242, 106, 27, 0.08);
}

.search-card:focus-within {
  border-color: rgba(242, 106, 27, 0.48);
  box-shadow: 0 20px 40px rgba(242, 106, 27, 0.12);
}

.search-leading {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3c4659;
}

.search-leading-icon {
  width: 23px;
  height: 23px;
}

.search-input {
  min-height: 52px;
  width: 100%;
  resize: none;
  border: 0;
  outline: 0;
  padding: 8px 0 0;
  background: transparent;
  color: #2d3442;
  font-size: 17px;
  line-height: 1.42;
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
  width: 20px;
  height: 20px;
  color: #4d5568;
  opacity: 0.86;
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
  min-height: 50px;
  padding: 0 22px;
  border: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 16px;
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
  gap: 12px 0;
  margin-top: 24px;
  color: #4f5768;
  font-size: 15px;
}

.prompt-label {
  margin-right: 18px;
  color: #7a8190;
}

.prompt-link {
  border: 0;
  padding: 0 18px;
  background: transparent;
  color: #374055;
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
  object-position: center center;
  opacity: 0.98;
}

.hero-image-band {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 116px;
  height: clamp(220px, 28vw, 360px);
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.hero-image-fade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 253, 250, 0.5) 24%, rgba(255, 253, 250, 0.08) 54%, rgba(255, 253, 250, 0) 100%),
    linear-gradient(90deg, rgba(255, 253, 250, 0.14) 0%, rgba(255, 253, 250, 0) 100%);
}

.capability-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 24px 18px 26px;
  border-top: 1px solid rgba(17, 26, 43, 0.06);
  background: rgba(255, 255, 255, 0.94);
  position: relative;
  z-index: 2;
  margin-top: clamp(180px, 24vw, 300px);
}

.capability-item {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 6px 20px;
  border-right: 1px solid rgba(17, 26, 43, 0.1);
}

.capability-item:last-child {
  border-right: 0;
}

.capability-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  color: #f26a1b;
}

.capability-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.capability-copy strong {
  color: #1f2638;
  font-size: 17px;
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
    padding: 56px 28px 28px;
  }

  .hero-image-band {
    bottom: 184px;
    height: clamp(200px, 34vw, 300px);
  }

  .capability-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 0;
    padding-top: 18px;
    margin-top: clamp(160px, 28vw, 240px);
  }

  .capability-item:nth-child(2n) {
    border-right: 0;
  }
}

@media (max-width: 760px) {
  .hero-wrap {
    padding: 12px 12px 28px;
  }

  .hero-panel {
    border-radius: 24px;
  }

  .hero-copy {
    padding: 34px 18px 26px;
  }

  .hero-title {
    font-size: 40px;
    line-height: 1.02;
  }

  .hero-subtitle {
    margin-top: 18px;
    font-size: 16px;
  }

  .search-card {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px 14px 16px;
  }

  .search-leading {
    display: none;
  }

  .search-input {
    min-height: 74px;
    font-size: 16px;
  }

  .search-actions {
    justify-content: space-between;
  }

  .prompt-strip {
    margin-top: 18px;
    gap: 10px 0;
    font-size: 14px;
  }

  .prompt-label {
    width: 100%;
    margin-right: 0;
  }

  .prompt-link {
    padding: 0 12px;
  }

  .prompt-link:first-of-type {
    padding-left: 0;
  }

  .hero-image-band {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    height: 200px;
    margin-top: 14px;
  }

  .capability-strip {
    grid-template-columns: 1fr;
    padding: 12px 6px 16px;
    margin-top: 0;
  }

  .capability-item,
  .capability-item:nth-child(2n) {
    border-right: 0;
    padding: 12px 12px;
  }
}
</style>
