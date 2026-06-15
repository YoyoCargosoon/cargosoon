<script setup>
import { onMounted, ref, inject } from 'vue'
import { getRate, specialArea, getCategory } from '@/api/dropshipping.js'
import { trackList, trackDetail, transportPrice, getStart, shipFromTo } from '@/api/tracking.js'
import { getLocal } from '@/utils/common'
import demoData from './demo/data.js'
import { useLoadingStore } from '@/stores/loading'
import AiQueryBox from '@/components/home/AiQueryBox.vue'
import VideoBanner from '@/components/home/VideoBanner.vue'
import ShipmentList from '@/components/home/ShipmentList.vue'
import LogisticsServices from '@/components/home/LogisticsServices.vue'
import PriceList from '@/components/home/PriceList.vue'
import RecommendationList from '@/components/home/RecommendationList.vue'

const loadingStore = useLoadingStore()

const shipmentList = ref([])
const recommendationList = ref([])
const doorData = ref([])
const specialData = ref([])
const reCity = ref([])
const destinationList = ref([])
const cateList = ref([])

const transportStatus = ref([
  { img: new URL('@/assets/icon/shipment_fcl.svg', import.meta.url).href },
  { img: new URL('@/assets/icon/shipment_ddp.svg', import.meta.url).href },
  { img: new URL('@/assets/icon/shipment_parcel.png', import.meta.url).href },
  { img: new URL('@/assets/icon/shipment_truck.png', import.meta.url).href },
  { img: new URL('@/assets/icon/shipment_train.svg', import.meta.url).href },
])

// --- track dialog ---
const trackModal = ref(false)
const trackPanel = ref([])

// --- AI query box delegation to global ChatPanel (provided by App.vue) ---
const sendToChat = inject('sendToChat', () => {})
const onAiSend = (text, openAI) => {
  sendToChat(text, openAI)
}

const divide = (num1, num2) => {
  const result = (num1 * 100) / (num2 * 100)
  if (Math.round(result * 100) / 100 > 0) {
    return Math.round(result * 100) / 100
  }
  return 0.01
}

const buildShipment = (list) => {
  list.forEach((item) => {
    let nums = 0
    if (item.new_order_type == 1) {
      nums = 8
    } else if (item.new_order_type == 2 || item.new_order_type == 5 || item.new_order_type == 11) {
      nums = 7
    } else if (item.new_order_type == 12) {
      nums = 5
    } else if (item.new_order_type == 9 || item.new_order_type == 13 || item.new_order_type == 14 || item.new_order_type == 15) {
      nums = 6
    } else {
      nums = 4
    }
    let percents = Math.round((item.status / nums) * 100)
    if (percents > 100) percents = 100
    item.statusIndex = percents

    if (item.new_order_type == 2 || item.new_order_type == 11 || item.new_order_type == 12) {
      item.iconType = 1
    } else if (item.new_order_type == 3 || item.new_order_type == 4) {
      item.iconType = 2
    } else if (item.new_order_type == 17) {
      item.iconType = 3
    } else if (item.new_order_type == 5 || item.new_order_type == 13 || item.new_order_type == 14) {
      item.iconType = 4
    } else {
      item.iconType = 0
    }
  })
  return list
}

const getTrackDetails = (id) => {
  loadingStore.setLoading(true)
  trackDetail({ id }).then((res) => {
    let list = res.data.data.track.msg
    for (let i = 0; i < list.length; i++) {
      if (i == 0) {
        list[i].hollow = true
        list[i].type = 'primary'
      }
    }
    trackPanel.value = list
    trackModal.value = true
    loadingStore.setLoading(false)
  })
}

onMounted(() => {
  transportPrice().then((res) => {
    const list = res.data.data
    doorData.value = list.doorData
    specialData.value = list.specialData.length > 4 ? list.specialData.slice(0, 4) : list.specialData
  })

  getStart().then((res) => {
    reCity.value = res.data.data
  })

  shipFromTo().then((res) => {
    destinationList.value = res.data.data.endCountry
  })

  if (getLocal('TOKEN')) {
    trackList().then((res) => {
      shipmentList.value = buildShipment(res.data.data.list)
    })
  } else {
    shipmentList.value = demoData.shipmentList
  }

  getRate().then((req) => {
    const rate = req.data.data.exchange_rate
    specialArea({ class_id: 1, pageIndex: 1, pageCount: 8 }).then((res) => {
      const list = res.data.data.list
      list.forEach((item) => {
        item.usd = divide(parseFloat(item.priceInfo.price), rate)
      })
      recommendationList.value = list
    })
  })

  getCategory().then((res) => {
    cateList.value = res.data.data
  })
})
</script>

<template>
  <div>
    <div class="dashboard-container grid grid-cols-6">
      <AiQueryBox
        :reCity="reCity"
        :destinationList="destinationList"
        @send="onAiSend"
      />

      <VideoBanner />

      <div class="shipment-list col-span-2" style="grid-row-end: span 20 !important;">
        <ShipmentList
          :shipmentList="shipmentList"
          :transportStatus="transportStatus"
          @view-track="getTrackDetails"
        />
        <LogisticsServices />
      </div>

      <PriceList :specialData="specialData" :doorData="doorData" />

      <RecommendationList :cateList="cateList" :recommendationList="recommendationList" />
    </div>

    <div>
      <el-dialog v-model="trackModal" title="Tracking">
        <el-timeline>
          <el-timeline-item
            v-for="(i, n) in trackPanel"
            :key="n"
            :timestamp="i.status_date"
            placement="top"
            :hollow="i.hollow"
            :type="i.type"
          >
            {{ i.msg }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.dashboard-container {
  margin: unset !important;
  grid-auto-flow: row dense;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}
</style>

<style>
.dashboard-container ::-webkit-scrollbar {
  width: 6px;
  height: 8px;
}
.dashboard-container ::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.3);
}
.dashboard-container ::-webkit-scrollbar-track {
  border-radius: 6px;
  background: rgb(255, 255, 255);
}
</style>
