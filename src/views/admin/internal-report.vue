<script setup>
import { computed, ref } from 'vue'
import { readAdminState } from '@/services/adminRepository'

const state = readAdminState()
const summaryGenerated = ref('')

const fallbackReport = {
  periodLabel: '2026-06-17 至 2026-06-23',
  summary:
    '本周客户反馈主要集中在价格一致性与页面体验，订单转化主要卡在报价确认阶段。',
  highlights: [
    '价格问题反馈 5 条，其中 Dallas DDP 占 2 条',
    '本周新增订单 21 单，FCL 占比更高',
    '客户最后停留页面主要集中在查价结果页和充值页',
  ],
  actions: [
    '优先复核 DDP Dallas 线路价格底座',
    '补充查价结果页到下单页的引导文案',
    '安排客服对高频反馈客户做一轮回访',
  ],
}

const baseReport = computed(() => state.internalReport || fallbackReport)
const sourceMessages = computed(() => state.internalMessages || [])
const feedbackTickets = computed(() => state.feedbackTickets || [])

const dynamicHighlights = computed(() => {
  const teamCount = sourceMessages.value.reduce((acc, item) => {
    acc[item.team] = (acc[item.team] || 0) + 1
    return acc
  }, {})

  return [
    `内部沟通总数 ${sourceMessages.value.length} 条`,
    `反馈工单总数 ${feedbackTickets.value.length} 条`,
    ...Object.entries(teamCount).map(([team, count]) => `${team} 本周同步 ${count} 条`),
  ]
})

const dynamicActions = computed(() => {
  const urgentMessages = sourceMessages.value.filter((item) =>
    /(优先|尽快|排查|汇总|提交)/.test(item.content),
  )

  if (!urgentMessages.length) {
    return baseReport.value.actions
  }

  return urgentMessages.slice(0, 3).map((item) => `${item.team} 跟进：${item.content}`)
})

const generateSummary = () => {
  const focus = dynamicHighlights.value.slice(0, 3).join('；')
  const actions = dynamicActions.value.slice(0, 2).join('；')
  summaryGenerated.value = `本周运营后台汇总：${baseReport.value.summary} 当前补充数据为${focus}。建议优先推进：${actions}。`
}
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">汇总报告</span>
          <h3>给上级看的周度汇总</h3>
        </div>
        <p>用于向上级汇报本周的客户反馈、价格问题、转化情况和下一步动作。</p>
      </div>

      <div class="admin-compose-actions admin-compose-actions--report">
        <button type="button" class="admin-post-btn" @click="generateSummary">一键生成汇报摘要</button>
      </div>

      <div v-if="summaryGenerated" class="admin-summary-box">
        {{ summaryGenerated }}
      </div>

      <div class="admin-list">
        <div class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">汇总周期</strong>
            <span class="admin-row-meta">{{ baseReport.periodLabel }}</span>
          </div>
          <div class="admin-row-right">
            <span class="admin-chip is-info">周报视图</span>
          </div>
        </div>

        <div class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">整体判断</strong>
            <p class="admin-caption">{{ baseReport.summary }}</p>
          </div>
        </div>

        <div class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">本周重点</strong>
            <div class="admin-chip-row">
              <span v-for="item in [...baseReport.highlights, ...dynamicHighlights]" :key="item" class="admin-chip">
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">建议动作</strong>
            <div class="admin-chip-row">
              <span v-for="item in dynamicActions" :key="item" class="admin-chip is-warning">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
