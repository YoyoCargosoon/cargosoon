<script setup>
const props = defineProps({
  shipmentList: { type: Array, default: () => [] },
  transportStatus: { type: Array, default: () => [] },
})

const emit = defineEmits(['view-track'])

const toOrder = (id, box) => {
  if (box == null) {
    window.open(`/order/forwardingOrder/${id}`)
  } else {
    window.open(`/order/forwardingOrder/${id}?boxId=${box}`)
  }
}
</script>

<template>
  <div class="cards">
    <div class="flex items-center">
      <a href="/order/shippingOrder" class="mr-2">
        <h2 style="margin-right: 20px;">Shipment List</h2>
      </a>
      <a href="/order/tracking">
        <el-button color="#2A4577">My Tracking</el-button>
      </a>
    </div>

    <div v-if="shipmentList.length == 0" class="shipment-info relative overflow-y-auto">
      <div class="relative z-10 py-2">
        <h3 class="text-sm font-semibold" style="color: #112F66;">No order yet, Get A Quote</h3>
        <div class="text-13 grid grid-cols-3 gap-2">
          <div class="flex items-center">
            <img src="@/assets/icon/shipment_ddp.svg" class="w-9" alt="">
            <div class="ml-3 pl-3 border-l border-gray-300">
              <div>DDP/DDU</div>
              <a href="/main/pricelist" class="hover:underline">
                <div style="color: #112F66;">Check Price Now</div>
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <img src="@/assets/icon/shipment_fcl.svg" class="w-9 p-1" alt="">
            <div class="ml-3 pl-3 border-l border-gray-300">
              <div>Shipping FCL</div>
              <a href="/main/pricelist" class="hover:underline">
                <div style="color: #112F66;">Check Price Now</div>
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <img src="@/assets/icon/shipment_train.svg" class="w-9 p-1" alt="">
            <div class="ml-3 pl-3 border-l border-gray-300">
              <div>Train Transportation</div>
              <a href="/main/pricelist" class="hover:underline">
                <div style="color: #112F66;">Check Price Now</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="shipmentList.length > 0" class="shipment-info overflow-y-auto">
      <div
        v-for="(i, n) in shipmentList"
        :key="n"
        class="py-3 grid grid-cols-2 gap-2 text-sm"
        :class="[n < shipmentList.length - 1 ? 'border-b border-gray-200' : '']"
        style="width: 100%;"
      >
        <div class="col-span-1">
          <div class="flex">
            <img :src="transportStatus[i.iconType].img" class="w-9 h-9 mr-3" alt="">
            <div>
              <div
                @click="toOrder(i.freight_id, i.box_id)"
                class="tracking-number cursor-pointer"
                style="color: #0214ef;"
              >{{ i.booking_no }}</div>
              <div class="route">{{ i.start_city }} → {{ i.give_country }}</div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap">
            <div v-for="(item, index) in i.sku_info" :key="index">
              <el-tooltip class="box-item" effect="dark" :content="item.text_en" placement="top">
                <div class="mr-2 mb-1 py-0.5 px-2 rounded-md text-xs border border-gray-300 max-w-32 whitespace-nowrap text-ellipsis overflow-hidden">SKU: {{ item.text_en }}</div>
              </el-tooltip>
            </div>
            <div v-show="i.po_number" class="mr-2 mb-1 py-0.5 px-2 rounded-md text-xs border border-gray-300">PO: {{ i.po_number }}</div>
            <div v-show="i.fba_code != ''" class="mr-2 mb-1 py-0.5 px-2 rounded-md text-xs border border-gray-300">FBA Code: {{ i.fba_code }}</div>
          </div>
        </div>
        <div class="col-span-1 pl-3 flex flex-col justify-between text-xs">
          <div>{{ i.sale_address }}</div>
          <div class="mt-2.5 text-red-500 font-semibold">Amount: ${{ i.total_price }} (Paid:{{ i.pay_price }}/Unpaid:{{ i.no_payment_price }})</div>
          <div>
            <div class="flex">
              <div>ETD: {{ i.etd }}</div>
              <div class="ml-6">ETA: {{ i.eta }}</div>
            </div>
            <el-progress :percentage="i.statusIndex" color="#EE6A28" :show-text="false" style="margin: 4px 0;" />
            <div @click="emit('view-track', i.id)" class="text-orange-600 cursor-pointer underline flex">
              <div class="mr-2">{{ i.transport_no_info.msg }}</div>
              <div v-show="i.tail_no != ''">{{ i.tail_no }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards {
  background: #e9eff5;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
h2 {
  font-size: 18px;
  color: #112f66;
  font-weight: 600;
}
.shipment-info {
  margin-top: 8px;
  height: 136px;
  padding: 0 12px;
  background: white;
  border-radius: 4px;
}
</style>
