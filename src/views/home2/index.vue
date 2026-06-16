<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Microphone, Paperclip, Picture, RefreshRight, Search } from '@element-plus/icons-vue'

const router = useRouter()

const askInput = ref('')
const searchInputRef = ref(null)
const attachmentInputRef = ref(null)
const imageInputRef = ref(null)

const promptSets = [
  [
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
  ],
  [
    [
      'Ship 3 pallets from Ningbo to Dallas',
      'DDP sea shipping to New Jersey',
      'Compare air and sea freight to Canada',
      'FBA replenishment from Shenzhen',
      'Consolidate 1688 orders for export',
    ],
    [
      'Quote 10 cartons to Los Angeles',
      'Track container arrival update',
      'Warehouse inspection before shipment',
      'Customs-ready DDP delivery',
      'Door delivery to Amazon warehouse',
    ],
  ],
]

const activePromptSetIndex = ref(0)
const promptColumns = ref(promptSets[activePromptSetIndex.value])

const askAI = (text) => {
  const q = (text ?? askInput.value).trim()
  if (!q) return
  router.push({
    name: 'chat',
    query: {
      mode: 'ai',
      q,
    },
  })
  askInput.value = ''
}

const openAssistant = () => {
  router.push({
    name: 'chat',
    query: { mode: 'ai' },
  })
}

const refreshPrompts = () => {
  activePromptSetIndex.value = (activePromptSetIndex.value + 1) % promptSets.length
  promptColumns.value = promptSets[activePromptSetIndex.value]
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
          <div class="brand-art">
            <div class="brand-original" aria-label="CargoSoon">
              <img src="@/assets/logo/cargosoonLogo1.png" class="brand-original-mark" alt="" />
              <img src="@/assets/logo/cargosoonLogo2.png" class="brand-original-text" alt="CargoSoon" />
            </div>
          </div>
          <h1 class="sr-only">CargoSoon</h1>
        </div>

        <div id="ai-quote-box" class="search-shell">
          <div class="search-card">
            <textarea
              ref="searchInputRef"
              v-model="askInput"
              class="search-input"
              rows="3"
              placeholder="Enter your logistics request, e.g. Sea DDP to Los Angeles"
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
              </div>
              <button class="primary-btn" @click="askAI()">
                <Search class="primary-icon" aria-hidden="true" />
                AI Search
              </button>
            </div>
          </div>

          <div class="hero-promo">
            <button class="hero-promo-pill" @click="openAssistant">
              <span>AI Assistant</span>
              Get freight rates, tracking updates, and booking guidance
            </button>
          </div>

          <div class="prompt-board">
            <div class="prompt-board-head">
              <div class="prompt-board-title-wrap">
                <span class="prompt-board-title">CargoSoon Trending</span>
              </div>
              <button class="prompt-board-switch" @click="refreshPrompts">
                <RefreshRight class="prompt-refresh-icon" aria-hidden="true" />
                Refresh
              </button>
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
  </div>
</template>

<style scoped>
.hero-page {
  min-height: calc(100vh - 56px);
  background: #ffffff;
  color: #222222;
}

.hero-wrap {
  min-height: calc(100vh - 56px);
  padding: 34px 20px 10px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 980px);
  min-height: 118px;
}

.brand-original {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 10px;
}

.brand-original-mark {
  width: clamp(62px, 6vw, 80px);
  height: auto;
  display: block;
}

.brand-original-text {
  width: clamp(168px, 18vw, 246px);
  height: auto;
  display: block;
}

.search-shell {
  width: min(100%, 800px);
  margin: 18px auto 0;
}

.search-card {
  position: relative;
  padding: 14px 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(242, 106, 27, 0.32);
  box-shadow: 0 16px 38px rgba(242, 106, 27, 0.08);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-card:focus-within {
  border-color: rgba(242, 106, 27, 0.62);
  box-shadow: 0 18px 42px rgba(242, 106, 27, 0.13);
}

.search-input {
  width: 100%;
  min-height: 72px;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  border-radius: 14px;
  padding: 2px 234px 2px 4px;
  box-sizing: border-box;
  font-size: 15px;
  line-height: 1.25;
  color: #2a241f;
  caret-color: #f26a1b;
  text-align: left;
}

.search-input::placeholder {
  color: #a0a7b5;
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
  color: #61554d;
  opacity: 0.84;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.search-icon-btn:hover .search-icon,
.search-icon-btn:focus-visible .search-icon {
  color: #f26a1b;
  opacity: 1;
}

.primary-icon {
  width: 15px;
  height: 15px;
}

.primary-btn {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 28px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff9340 0%, #f37a24 64%, #eb691a 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(242, 106, 27, 0.2);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(242, 106, 27, 0.24);
}

.hero-promo {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.hero-promo-pill {
  border: 0;
  background: linear-gradient(180deg, #fff8f3 0%, #fff4ec 100%);
  color: #1f2430;
  font-size: 14px;
  line-height: 1.4;
  padding: 12px 20px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(242, 106, 27, 0.1);
}

.hero-promo-pill span {
  color: #f26a1b;
  font-weight: 700;
}

.prompt-board {
  width: min(100%, 780px);
  margin: 42px auto 0;
  text-align: left;
}

.prompt-board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.prompt-board-title-wrap {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.prompt-board-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
  color: #272a31;
}

.prompt-board-switch {
  border: 0;
  background: transparent;
  color: #8b95a7;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.prompt-refresh-icon {
  width: 14px;
  height: 14px;
}

.prompt-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 78px;
}

.prompt-column {
  display: grid;
  gap: 18px;
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
  color: #222222;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0;
  text-align: left;
  cursor: pointer;
  min-height: 28px;
}

.prompt-line:hover {
  color: #262a31;
}

.prompt-line:hover .prompt-line-text {
  color: #f26a1b;
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
  min-width: 0;
  overflow-wrap: anywhere;
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
  background: linear-gradient(135deg, #ff7f31, #ff5f1f);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

@media (max-width: 900px) {
  .hero-page,
  .hero-wrap {
    min-height: auto;
  }

  .hero-wrap {
    padding: 22px 16px 24px;
  }

  .hero-inner {
    max-width: 100%;
  }

  .brand-art {
    width: min(100%, 760px);
    min-height: 108px;
  }

  .search-card {
    padding: 10px 12px;
    border-radius: 16px;
  }

  .search-input {
    min-height: 74px;
    padding: 6px 10px 50px 2px;
    border-radius: 14px;
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
    margin-top: 26px;
  }

  .hero-promo {
    margin-top: 18px;
  }

  .prompt-board-title {
    font-size: 17px;
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

}

@media (max-width: 560px) {
  .hero-wrap {
    padding: 16px 14px 18px;
  }

  .search-shell {
    width: 100%;
  }

  .search-shell {
    margin-top: 16px;
  }

  .brand-original {
    gap: 8px;
  }

  .brand-original-mark {
    width: 48px;
  }

  .brand-original-text {
    width: min(46vw, 180px);
  }

  .search-input {
    min-height: 82px;
    font-size: 15px;
    line-height: 1.32;
  }

  .hero-promo {
    margin-top: 22px;
  }

  .prompt-board {
    margin-top: 24px;
  }

  .prompt-board-head {
    align-items: flex-start;
  }

  .prompt-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .prompt-column {
    gap: 8px;
  }

  .prompt-line {
    align-items: flex-start;
    gap: 5px;
    font-size: 13px;
    line-height: 1.2;
    min-height: 42px;
  }

  .prompt-rank {
    width: 16px;
    flex-basis: 16px;
    padding-top: 1px;
    font-size: 14px;
  }

  .prompt-badge {
    min-width: 20px;
    height: 16px;
    padding: 0 4px;
    margin-left: 0;
    font-size: 9px;
  }

  .prompt-line-text {
    white-space: normal;
  }
}
</style>
