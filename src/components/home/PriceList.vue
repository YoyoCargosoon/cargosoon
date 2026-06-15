<script setup>
import { ref } from 'vue'

const props = defineProps({
  specialData: { type: Array, default: () => [] },
  doorData: { type: Array, default: () => [] },
})

const priceType = ref(1)

const viewPrice = () => {
  if (priceType.value == 1) {
    window.open('/main/pricelist')
  } else {
    window.open('/main/booking')
  }
}
</script>

<template>
  <div class="card price-list col-span-4">
    <a href="/main/booking">
      <h2>Customized Solutions</h2>
    </a>
    <div class="mt-4 p-3 bg-white" style="height: 316px;">
      <div class="flex justify-between items-center text-sm">
        <div class="flex">
          <div
            :class="[priceType == 1 ? 'bg-orderHover text-white border-orderHover' : 'bg-white text-orderHover hover:bg-gray-100 border-gray-300']"
            class="py-1.5 px-3 border cursor-pointer rounded-l-xs"
            @click="priceType = 1"
          >Ocean Freight</div>
          <div
            :class="[priceType == 2 ? 'bg-orderHover text-white border-orderHover' : 'bg-white text-orderHover hover:bg-gray-100 border-gray-300']"
            class="py-1.5 px-3 border cursor-pointer rounded-r-xs"
            @click="priceType = 2"
          >DDP/DDU Freight</div>
        </div>
        <div @click="viewPrice" class="text-cyan-500 font-semibold hover:underline cursor-pointer">View all</div>
      </div>
      <div class="mt-3 text-xs">
        <!-- Ocean freight -->
        <div v-show="priceType == 1" class="grid grid-cols-2 gap-3">
          <div v-for="(i, n) in specialData" :key="n" class="col-span-1 p-2 border border-gray-200 rounded-xs">
            <div class="flex items-center">
              <div>{{ i.start_port }}</div>
              <svg class="icon mx-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M640 128l0 256-640 0 0 128 640 0 0 256 384-323.84-384-316.16z" fill="#112f66"></path>
              </svg>
              <div>{{ i.end_port }}</div>
            </div>
            <div class="mt-2 flex bg-pricebg">
              <div class="w-1/10 p-2 flex justify-center items-center border-r border-white">
                <img :src="i.img" class="w-9" alt="">
              </div>
              <div class="w-1/5 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">20'GP</div>
                <div class="p-1.5 font-semibold">
                  <div v-if="i.super_gp20 > 0">${{ i.super_gp20 }}</div>
                  <div v-if="i.super_gp20 == 0">N/A</div>
                </div>
              </div>
              <div class="w-1/5 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">40'GP</div>
                <div class="p-1.5 font-semibold">
                  <div v-if="i.super_gp40 > 0">${{ i.super_gp40 }}</div>
                  <div v-if="i.super_gp40 == 0">N/A</div>
                </div>
              </div>
              <div class="w-1/5 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">40'HQ</div>
                <div class="p-1.5 font-semibold">
                  <div v-if="i.super_hq40 > 0">${{ i.super_hq40 }}</div>
                  <div v-if="i.super_hq40 == 0">N/A</div>
                </div>
              </div>
              <div class="w-3/10 text-center">
                <div class="p-1.5 border-b border-white">Estd. Transit Time</div>
                <div class="p-1.5">
                  <div>{{ i.air_day }} Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- DDP/DDU -->
        <div v-show="priceType == 2" class="grid grid-cols-2 gap-3">
          <div v-for="(i, n) in doorData" :key="n" class="col-span-1 p-2 border border-gray-200 rounded-xs">
            <div class="flex items-center">
              <div>China</div>
              <svg class="icon mx-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M640 128l0 256-640 0 0 128 640 0 0 256 384-323.84-384-316.16z" fill="#112f66"></path>
              </svg>
              <div>{{ i.code_two }}</div>
            </div>
            <div class="mt-2 flex bg-pricebg">
              <div class="w-1/12 p-2 flex justify-center items-center border-r border-white">
                <img :src="i.product_img" class="w-9 rounded" alt="">
              </div>
              <div class="w-3/12 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">Shipping</div>
                <div class="p-1.5">
                  <div>{{ i.product_name_e }}</div>
                </div>
              </div>
              <div class="w-3/12 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">Transit Time</div>
                <div class="p-1.5">
                  <div>{{ i.aging_start }}-{{ i.aging_end }} Days</div>
                </div>
              </div>
              <div class="w-2/12 text-center border-r border-white">
                <div class="p-1.5 border-b border-white">Freight</div>
                <div class="p-1.5 font-semibold">
                  <div>${{ i.add_unit_price }}</div>
                </div>
              </div>
              <div class="w-3/12 text-center">
                <div class="p-1.5 border-b border-white">Estimated Cost</div>
                <div class="p-1.5 font-semibold">
                  <div>${{ i.super_freight }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #e9eff5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  grid-row-end: span 20 !important;
}
.price-list {
  grid-row-end: span 20 !important;
}
h2 {
  font-size: 18px;
  color: #112f66;
  font-weight: 600;
}
</style>
