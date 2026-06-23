<script setup>
import { computed, ref } from 'vue'
import { pushFeedbackToInternalChat, readAdminState } from '@/services/adminRepository'
import {
  feedbackTypeLabels,
  formatLabel,
  priorityLabels,
  statusLabels,
} from '@/utils/adminPresentation'

const state = readAdminState()
const statusFilter = ref('all')
const moduleFilter = ref('all')
const keyword = ref('')

const moduleOptions = [
  { value: 'all', label: '全部来源' },
  { value: 'ai-assistant', label: 'AI 助手' },
  { value: 'home-page', label: '首页' },
  { value: 'ddp-page', label: 'DDP 页面' },
]

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'open', label: '待处理' },
  { value: 'processing', label: '处理中' },
]

const tickets = computed(() =>
  state.feedbackTickets
    .map((item) => ({
      ...item,
      feedbackTypeLabel: formatLabel(item.feedbackType, feedbackTypeLabels),
      statusLabel: formatLabel(item.status, statusLabels),
      priorityLabel: formatLabel(item.priority, priorityLabels),
    }))
    .filter((item) => (statusFilter.value === 'all' ? true : item.status === statusFilter.value))
    .filter((item) => (moduleFilter.value === 'all' ? true : item.sourceModule === moduleFilter.value))
    .filter((item) => {
      const query = keyword.value.trim().toLowerCase()
      if (!query) return true
      return [item.customerName, item.content, item.sourcePage].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    }),
)

const syncToInternal = (ticketId) => {
  pushFeedbackToInternalChat({
    ticketId,
    author: '客服转发',
  })
}
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">全站反馈</span>
          <h3>反馈工单队列</h3>
        </div>
        <p>来自首页、AI 助手、查价页等入口的反馈统一进入这里，也可以直接转成内部沟通话题。</p>
      </div>

      <div class="admin-toolbar">
        <input v-model="keyword" class="admin-input" placeholder="搜索客户、内容或来源页面" />
        <select v-model="moduleFilter" class="admin-select">
          <option v-for="option in moduleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <select v-model="statusFilter" class="admin-select">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="admin-list">
        <div v-for="ticket in tickets" :key="ticket.id" class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">{{ ticket.customerName }} | {{ ticket.feedbackTypeLabel }}</strong>
            <span class="admin-row-meta">{{ ticket.sourceModule }} | {{ ticket.sourcePage }}</span>
            <p class="admin-caption">{{ ticket.content }}</p>
          </div>
          <div class="admin-row-right">
            <div class="admin-chip-row">
              <span class="admin-chip" :class="ticket.status === 'processing' ? 'is-warning' : 'is-danger'">
                {{ ticket.statusLabel }}
              </span>
              <span class="admin-chip is-info">{{ ticket.priorityLabel }}</span>
            </div>
            <span class="admin-row-meta">处理人：{{ ticket.handlerName }}</span>
            <button type="button" class="admin-link-btn" @click="syncToInternal(ticket.id)">
              转内部沟通
            </button>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
