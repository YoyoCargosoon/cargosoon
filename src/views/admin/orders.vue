<script setup>
import { computed, ref } from 'vue'
import { readAdminState } from '@/services/adminRepository'
import { formatLabel, sourceEntryLabels, statusLabels } from '@/utils/adminPresentation'

const state = readAdminState()
const statusFilter = ref('all')
const keyword = ref('')

const orders = computed(() =>
  state.orders
    .map((item) => ({
      ...item,
      statusLabel: formatLabel(item.status, statusLabels),
      sourceLabel: formatLabel(item.sourceEntry, sourceEntryLabels),
    }))
    .filter((item) => (statusFilter.value === 'all' ? true : item.status === statusFilter.value))
    .filter((item) => {
      const query = keyword.value.trim().toLowerCase()
      if (!query) return true
      return [item.orderNo, item.customerName, item.route].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    }),
)
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">订单台</span>
          <h3>客户端与 AI 产生的订单记录</h3>
        </div>
        <p>订单状态会通过统一事件链路回写客户端视图，方便运营、客服和客户看到一致状态。</p>
      </div>

      <div class="admin-toolbar">
        <input v-model="keyword" class="admin-input" placeholder="搜索订单号、客户名、路线" />
        <select v-model="statusFilter" class="admin-select">
          <option value="all">全部状态</option>
          <option value="pending confirmation">待确认</option>
          <option value="in transit">运输中</option>
        </select>
      </div>

      <div class="admin-list">
        <div v-for="order in orders" :key="order.id" class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">{{ order.orderNo }}</strong>
            <span class="admin-row-meta">{{ order.customerName }} | {{ order.orderType }} | {{ order.route }}</span>
            <div class="admin-chip-row">
              <span class="admin-chip is-info">{{ order.sourceLabel }}</span>
              <span class="admin-chip">{{ order.createdAt }}</span>
            </div>
          </div>
          <div class="admin-row-right">
            <strong class="admin-row-title">{{ order.currency }} {{ order.amount }}</strong>
            <span class="admin-chip" :class="order.status === 'in transit' ? 'is-success' : 'is-warning'">
              {{ order.statusLabel }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
