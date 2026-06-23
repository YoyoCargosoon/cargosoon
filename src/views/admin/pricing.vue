<script setup>
import { computed } from 'vue'
import { readAdminState } from '@/services/adminRepository'

const state = readAdminState()

const supplierCards = computed(() => state.suppliers)
const latestSheets = computed(() => state.quoteSheets)
const mappings = computed(() => state.channelMappings)
</script>

<template>
  <section class="admin-page">
    <div class="admin-grid admin-grid--stats">
      <article
        v-for="supplier in supplierCards"
        :key="supplier.id"
        class="admin-panel admin-stat-card tone-blue"
      >
        <span class="admin-kicker">{{ supplier.updateCycle === 'weekly' ? '周更' : '双周更' }}</span>
        <strong>{{ supplier.supplierName }}</strong>
        <small>当前生效版本：{{ supplier.activeVersion }} ｜ 覆盖渠道：{{ supplier.channelCoverage }}</small>
      </article>
    </div>

    <div class="admin-grid admin-grid--two">
      <article class="admin-panel">
        <div class="admin-section-head">
          <div>
            <span class="admin-kicker">版本管理</span>
            <h3>最新报价版本</h3>
          </div>
          <p>新报价文件导入后会覆盖对外查询结果，但历史版本仍会保留以便回溯与核对。</p>
        </div>
        <div class="admin-list">
          <div v-for="sheet in latestSheets" :key="sheet.id" class="admin-row">
            <div class="admin-row-left">
              <strong class="admin-row-title">{{ sheet.sheetName }}</strong>
              <span class="admin-row-meta">{{ sheet.versionNo }} | {{ sheet.effectiveStartDate }} 至 {{ sheet.effectiveEndDate }}</span>
            </div>
            <div class="admin-row-right">
              <div class="admin-chip-row">
                <span class="admin-chip" :class="sheet.isActive ? 'is-success' : ''">
                  {{ sheet.isActive ? '生效中' : '已归档' }}
                </span>
              </div>
              <span class="admin-row-meta">{{ sheet.channels.join(' / ') }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="admin-panel">
        <div class="admin-section-head">
          <div>
            <span class="admin-kicker">渠道映射</span>
            <h3>标准渠道别名管理</h3>
          </div>
          <p>供应商原始渠道名称会先做归一，AI 与页面查价都只读取同一套标准渠道。</p>
        </div>
        <div class="admin-list">
          <div v-for="item in mappings" :key="item.id" class="admin-row">
            <div class="admin-row-left">
              <strong class="admin-row-title">{{ item.rawChannelName }}</strong>
              <span class="admin-row-meta">{{ item.confidence }}</span>
            </div>
            <div class="admin-row-right">
              <strong class="admin-row-title">{{ item.standardChannelName }}</strong>
              <span class="admin-row-meta">{{ item.mappingStatus }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
