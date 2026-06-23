<script setup>
import { computed, ref } from 'vue'
import { readAdminState } from '@/services/adminRepository'
import { eventLabels, formatLabel } from '@/utils/adminPresentation'

const state = readAdminState()
const countryFilter = ref('all')
const keyword = ref('')

const customers = computed(() =>
  state.customers
    .filter((item) => (countryFilter.value === 'all' ? true : item.countryCode === countryFilter.value))
    .filter((item) => {
      const query = keyword.value.trim().toLowerCase()
      if (!query) return true
      return [item.customerName, item.id, item.lastPage].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    }),
)

const events = computed(() =>
  state.userEvents.slice(0, 6).map((item) => ({
    ...item,
    eventLabel: formatLabel(item.eventName, eventLabels),
  })),
)
</script>

<template>
  <section class="admin-page">
    <div class="admin-grid admin-grid--two">
      <article class="admin-panel">
        <div class="admin-section-head">
          <div>
            <span class="admin-kicker">客户全景</span>
            <h3>客户实时账户快照</h3>
          </div>
          <p>这里聚合展示账号、国家、来源、最后停留页、停留时长和流失页，方便客户成功与运营快速判断状态。</p>
        </div>

        <div class="admin-toolbar">
          <input v-model="keyword" class="admin-input" placeholder="搜索客户名、账号 ID、最后停留页" />
          <select v-model="countryFilter" class="admin-select">
            <option value="all">全部国家</option>
            <option value="US">美国</option>
            <option value="CA">加拿大</option>
            <option value="GB">英国</option>
          </select>
        </div>

        <div class="admin-list">
          <div v-for="customer in customers" :key="customer.id" class="admin-row">
            <div class="admin-row-left">
              <strong class="admin-row-title">{{ customer.customerName }}（{{ customer.id }}）</strong>
              <span class="admin-row-meta">{{ customer.countryCode }} | {{ customer.sourceChannel }}</span>
              <div class="admin-chip-row">
                <span class="admin-chip is-info">最后停留：{{ customer.lastPage }}</span>
                <span class="admin-chip">{{ customer.dwellSeconds }} 秒</span>
              </div>
            </div>
            <div class="admin-row-right">
              <strong class="admin-row-title">{{ customer.lastActiveAt }}</strong>
              <span class="admin-row-meta">流失页：{{ customer.churnPage }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="admin-panel">
        <div class="admin-section-head">
          <div>
            <span class="admin-kicker">行为流</span>
            <h3>最近行为事件</h3>
          </div>
          <p>这些事件会用于后台的页面停留分析、退出页分析和后续转化漏斗分析。</p>
        </div>

        <div class="admin-list">
          <div v-for="event in events" :key="event.id" class="admin-row">
            <div class="admin-row-left">
              <strong class="admin-row-title">{{ event.customerName || event.userId }}</strong>
              <span class="admin-row-meta">{{ event.eventLabel }} | {{ event.countryCode }}</span>
            </div>
            <div class="admin-row-right">
              <strong class="admin-row-title">{{ event.pagePath }}</strong>
              <span class="admin-row-meta">{{ event.createdAt }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
