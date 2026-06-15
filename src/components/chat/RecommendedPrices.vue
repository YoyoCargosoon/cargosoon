<script setup>
import { ref } from 'vue'

const props = defineProps({
  // ocean freight list (same shape as home PriceList specialData)
  oceanData: { type: Array, default: () => [] },
  // DDP/DDU list (same shape as home PriceList doorData)
  doorData: { type: Array, default: () => [] },
  // express list (same shape as doorData)
  expressData: { type: Array, default: () => [] },
})

const emit = defineEmits(['booking'])

const priceType = ref(1) // 1 ocean / 2 ddp / 3 express

const booking = (row) => {
  emit('booking', row)
}
</script>

<template>
  <div class="rec">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-navy text-lg">✦</span>
      <h2>Recommended Prices</h2>
    </div>

    <!-- tabs -->
    <div class="flex text-xs mb-3">
      <div
        :class="[priceType == 1 ? 'bg-orderHover text-white border-orderHover' : 'bg-white text-orderHover hover:bg-gray-100 border-gray-300']"
        class="py-1.5 px-3 border cursor-pointer rounded-l-xs"
        @click="priceType = 1"
      >Ocean Freight</div>
      <div
        :class="[priceType == 2 ? 'bg-orderHover text-white border-orderHover' : 'bg-white text-orderHover hover:bg-gray-100 border-gray-300']"
        class="py-1.5 px-3 border-t border-b cursor-pointer"
        @click="priceType = 2"
      >DDP/DDU</div>
      <div
        :class="[priceType == 3 ? 'bg-orderHover text-white border-orderHover' : 'bg-white text-orderHover hover:bg-gray-100 border-gray-300']"
        class="py-1.5 px-3 border cursor-pointer rounded-r-xs"
        @click="priceType = 3"
      >Express</div>
    </div>

    <div class="text-xs">
      <!-- Ocean freight -->
      <div v-show="priceType == 1">
        <div v-if="!oceanData.length" class="empty">No recommended ocean rates yet.</div>
        <div v-for="(i, n) in oceanData" :key="n" class="mb-3 p-2 border border-gray-200 rounded-xs">
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
                <div v-else>N/A</div>
              </div>
            </div>
            <div class="w-1/5 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">40'GP</div>
              <div class="p-1.5 font-semibold">
                <div v-if="i.super_gp40 > 0">${{ i.super_gp40 }}</div>
                <div v-else>N/A</div>
              </div>
            </div>
            <div class="w-1/5 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">40'HQ</div>
              <div class="p-1.5 font-semibold">
                <div v-if="i.super_hq40 > 0">${{ i.super_hq40 }}</div>
                <div v-else>N/A</div>
              </div>
            </div>
            <div class="w-3/10 text-center">
              <div class="p-1.5 border-b border-white">Estd. Transit Time</div>
              <div class="p-1.5">{{ i.air_day }} Days</div>
            </div>
          </div>
          <button class="book-btn" @click="booking(i)">Booking Now</button>
        </div>
      </div>

      <!-- DDP / DDU -->
      <div v-show="priceType == 2">
        <div v-if="!doorData.length" class="empty">No recommended DDP/DDU rates yet.</div>
        <div v-for="(i, n) in doorData" :key="n" class="mb-3 p-2 border border-gray-200 rounded-xs">
          <!-- <div class="flex items-center">
            <div>China</div>
            <svg class="icon mx-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M640 128l0 256-640 0 0 128 640 0 0 256 384-323.84-384-316.16z" fill="#112f66"></path>
            </svg>
            <div>{{ i.code_two }}</div>
          </div> -->
          <div class="mt-2 flex bg-pricebg">
            <div class="w-3/12 p-2 flex justify-center items-center border-r border-white">
              <img :src="i.product_img" class="w-9 rounded" alt="">
            </div>
            <div class="w-3/12 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">Shipping</div>
              <div class="p-1.5">{{ i.product_name_e }}</div>
            </div>
            <div class="w-3/12 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">Transit Time</div>
              <div class="p-1.5">{{ i.aging_start }}-{{ i.aging_end }} Days</div>
            </div>
            <div class="w-3/12 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">Freight(/KG)</div>
              <div class="p-1.5 font-semibold">${{ i.add_unit_price }}</div>
            </div>
            <!-- <div class="w-3/12 text-center">
              <div class="p-1.5 border-b border-white">Estimated Cost</div>
              <div class="p-1.5 font-semibold">${{ i.super_freight }}</div>
            </div> -->
          </div>
          <button class="book-btn" @click="booking(i)">Booking Now</button>
        </div>
      </div>

      <!-- Express -->
      <div v-show="priceType == 3">
        <div v-if="!expressData.length" class="empty">No recommended express rates yet.</div>
        <div v-for="(i, n) in expressData" :key="n" class="mb-3 p-2 border border-gray-200 rounded-xs">
          <!-- <div class="flex items-center">
            <div>China</div>
            <svg class="icon mx-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M640 128l0 256-640 0 0 128 640 0 0 256 384-323.84-384-316.16z" fill="#112f66"></path>
            </svg>
            <div>{{ i.code_two }}</div>
          </div> -->
          <div class="mt-2 flex bg-pricebg">
            <div class="w-3/12 p-2 flex justify-center items-center border-r border-white">
              <img :src="i.product_img" class="w-9 rounded" alt="">
            </div>
            <div class="w-3/12 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">Shipping</div>
              <div class="p-1.5">{{ i.product_name_e }}</div>
            </div>
            <div class="w-3/12 text-center border-r border-white">
              <div class="p-1.5 border-b border-white">Transit Time</div>
              <div class="p-1.5">{{ i.aging_start }}-{{ i.aging_end }} Days</div>
            </div>
            <div class="w-3/12 text-center">
              <div class="p-1.5 border-b border-white">Freight(/KG)</div>
              <div class="p-1.5 font-semibold">${{ i.add_unit_price }}</div>
            </div>
          </div>
          <button class="book-btn" @click="booking(i)">Booking Now</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-navy { color: #16284d; }
.rec { padding: 16px; }
h2 {
  font-size: 18px;
  color: #112f66;
  font-weight: 600;
}
.book-btn {
  width: 100%;
  margin-top: 8px;
  background: #16284d;
  color: #fff;
  font-size: 13px;
  padding: 7px 16px;
  border-radius: 6px;
  transition: filter 0.2s ease;
}
.book-btn:hover { filter: brightness(1.15); }
.empty {
  color: #9ca3af;
  font-size: 13px;
  padding: 16px 0;
}
</style>
