<script setup>
import { computed } from 'vue'
import { readAdminState } from '@/services/adminRepository'
import { eventLabels, formatLabel, sourceEntryLabels } from '@/utils/adminPresentation'

const state = readAdminState()

const statCards = computed(() => [
  {
    label: '活跃客户数',
    value: state.stats.activeCustomers,
    hint: '最近 24 小时内有行为记录',
    tone: 'blue',
  },
  {
    label: '今日查价',
    value: state.stats.quotesToday,
    hint: 'AI 与页面共用同一查价底座',
    tone: 'orange',
  },
  {
    label: '今日订单',
    value: state.stats.ordersToday,
    hint: '含页面与 AI 触发订单',
    tone: 'green',
  },
  {
    label: '待处理反馈',
    value: state.stats.feedbackOpen,
    hint: '需要客服或运营跟进',
    tone: 'red',
  },
  {
    label: '今日充值',
    value: `$${state.stats.rechargeToday}`,
    hint: '客户端与后台同步展示',
    tone: 'purple',
  },
])

const latestQuoteRecords = computed(() =>
  state.quoteRequests.slice(0, 5).map((item) => {
    const result = state.quoteResults.find((resultItem) => resultItem.quoteRequestId === item.id)
    return {
      ...item,
      finalPrice: result ? `${result.currency} ${result.finalPrice}` : '暂无命中',
      supplierName: result?.supplierName || '-',
      sourceLabel: formatLabel(item.sourceEntry, sourceEntryLabels),
    }
  }),
)

const syncEvents = computed(() =>
  state.businessEvents.slice(0, 5).map((item) => ({
    ...item,
    eventLabel: formatLabel(item.eventType, eventLabels),
    sourceLabel: formatLabel(item.source, sourceEntryLabels),
  })),
)

const feedbackBreakdown = computed(() => [
  { label: '价格问题', value: state.feedbackTickets.filter((item) => item.feedbackType === 'price issue').length },
  { label: '体验问题', value: state.feedbackTickets.filter((item) => item.feedbackType === 'ux issue').length },
  { label: '处理中', value: state.feedbackTickets.filter((item) => item.status === 'processing').length },
])
</script>

<template>
  <section class="admin-page">
    <div class="admin-grid admin-grid--stats">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="admin-panel admin-stat-card"
        :class="`tone-${card.tone}`"
      >
        <span class="admin-kicker">{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.hint }}</small>
      </article>
    </div>

    <div class="admin-hero">
      <article class="admin-panel admin-hero-panel">
        <div class="admin-section-head">
          <div>
            <span class="admin-kicker">实时查价流</span>
            <h3>统一查价底座的最新记录</h3>
          </div>
          <p>FCL/DDP 页面与 AI 助手只负责发起请求，真正的价格命中和结果归档都在同一条底座链路里完成。</p>
        </div>

        <div class="admin-list">
          <div v-for="item in latestQuoteRecords" :key="item.id" class="admin-row">
            <div class="admin-row-left">
              <strong class="admin-row-title">{{ item.origin }} -> {{ item.destination }}</strong>
              <span class="admin-row-meta">
                {{ item.sourceLabel }} | {{ item.customerName }} | {{ item.createdAt }}
              </span>
            </div>
            <div class="admin-row-right">
              <strong class="admin-row-title">{{ item.finalPrice }}</strong>
              <span class="admin-row-meta">{{ item.supplierName }}</span>
            </div>
          </div>
        </div>
      </article>

      <aside class="admin-spotlight">
        <article class="admin-panel admin-spotlight-card">
          <div class="admin-section-head">
            <div>
              <span class="admin-kicker">同步状态</span>
              <h3>三端共底座已启用</h3>
            </div>
            <p>当前后台展示的数据已经承接客户端页面查价记录，后续接 AI 与真实后端时可沿用同一结构。</p>
          </div>
          <div class="admin-chip-row">
            <span class="admin-chip is-success">客户端同步中</span>
            <span class="admin-chip is-info">后台可见</span>
            <span class="admin-chip is-warning">AI 待接真实接口</span>
          </div>
        </article>

        <article class="admin-panel admin-spotlight-card">
          <div class="admin-section-head">
            <div>
              <span class="admin-kicker">反馈概览</span>
              <h3>今日工单分布</h3>
            </div>
            <p>帮助运营快速判断今天是价格问题偏多，还是体验问题偏多。</p>
          </div>
          <div class="admin-chip-row">
            <span v-for="item in feedbackBreakdown" :key="item.label" class="admin-chip">
              {{ item.label }} {{ item.value }}
            </span>
          </div>
        </article>

        <article class="admin-panel admin-spotlight-card">
          <div class="admin-section-head">
            <div>
              <span class="admin-kicker">同步事件</span>
              <h3>最近业务事件</h3>
            </div>
            <p>统一事件流支撑后台刷新、客户行为追踪与后续审计回放。</p>
          </div>

          <div class="admin-timeline">
            <div v-for="event in syncEvents" :key="event.id" class="admin-timeline-item">
              <strong class="admin-row-title">{{ event.eventLabel }}</strong>
              <span class="admin-row-meta">{{ event.sourceLabel }} | {{ event.eventTime }}</span>
            </div>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>
