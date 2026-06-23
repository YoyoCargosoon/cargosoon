<script setup>
import { computed } from 'vue'
import { readAdminState } from '@/services/adminRepository'
import { formatLabel, sourceEntryLabels } from '@/utils/adminPresentation'

const state = readAdminState()

const quoteRows = computed(() =>
  state.quoteRequests.slice(0, 12).map((request) => {
    const result = state.quoteResults.find((item) => item.quoteRequestId === request.id)
    return {
      ...request,
      resultPrice: result ? `${result.currency} ${result.finalPrice}` : '暂无命中',
      supplierName: result?.supplierName || '-',
      channelName: result?.standardChannelName || '-',
      sourceLabel: formatLabel(request.sourceEntry, sourceEntryLabels),
    }
  }),
)
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">统一查价日志</span>
          <h3>AI 与 FCL/DDP 页面查价记录</h3>
        </div>
        <p>所有入口都通过同一查价底座返回结果，因此后台可以在一处统一查看来源、价格、供应商与命中渠道。</p>
      </div>

      <div class="admin-list">
        <div v-for="row in quoteRows" :key="row.id" class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">{{ row.origin }} -> {{ row.destination }}</strong>
            <span class="admin-row-meta">{{ row.sourceLabel }} | {{ row.quoteType }} | {{ row.createdAt }}</span>
          </div>
          <div class="admin-row-right">
            <strong class="admin-row-title">{{ row.resultPrice }}</strong>
            <span class="admin-row-meta">{{ row.supplierName }} / {{ row.channelName }}</span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
