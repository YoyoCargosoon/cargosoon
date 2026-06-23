<script setup>
import { computed } from 'vue'
import { readAdminState } from '@/services/adminRepository'
import { formatLabel, statusLabels } from '@/utils/adminPresentation'

const state = readAdminState()
const recharges = computed(() =>
  state.recharges.map((item) => ({
    ...item,
    statusLabel: formatLabel(item.status, statusLabels),
  })),
)
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">充值中心</span>
          <h3>充值记录与支付状态</h3>
        </div>
        <p>客户支付成功后，充值记录、余额变化和后台列表都应保持实时或准实时一致。</p>
      </div>

      <div class="admin-list">
        <div v-for="item in recharges" :key="item.id" class="admin-row">
          <div class="admin-row-left">
            <strong class="admin-row-title">{{ item.rechargeNo }}</strong>
            <span class="admin-row-meta">{{ item.customerName }} | {{ item.paymentChannel }}</span>
            <div class="admin-chip-row">
              <span class="admin-chip">{{ item.paidAt }}</span>
            </div>
          </div>
          <div class="admin-row-right">
            <strong class="admin-row-title">{{ item.currency }} {{ item.amount }}</strong>
            <span class="admin-chip" :class="item.status === 'paid' ? 'is-success' : 'is-warning'">
              {{ item.statusLabel }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
