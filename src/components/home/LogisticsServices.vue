<script setup>
const services = [
  { img: new URL('@/assets/icon/Ocean Freight.jpg', import.meta.url).href, name: 'Ocean Freight' },
  { img: new URL('@/assets/icon/Air Freight.jpg', import.meta.url).href, name: 'Air Freight' },
  { img: new URL('@/assets/icon/Warehousing.jpg', import.meta.url).href, name: 'Warehousing' },
  { img: new URL('@/assets/icon/Cargo Tracking.jpg', import.meta.url).href, name: 'Cargo Tracking' },
  { img: new URL('@/assets/icon/1688 Sourcing.jpg', import.meta.url).href, name: '1688 Sourcing' },
  { img: new URL('@/assets/icon/Dropshipping.jpg', import.meta.url).href, name: 'Dropshipping' },
]
</script>

<template>
  <div class="cards mt-5">
    <h2>Our Logistics Services</h2>
    <div class="mt-2 p-3 bg-white overflow-y-auto overflow-x-auto" style="height: 120px;">
      <div class="flex text-xs">
        <div v-for="(s, n) in services" :key="n" class="shrink-0 flex flex-col items-center mr-3">
          <img :src="s.img" class="w-16 h-16" :alt="s.name">
          <div>
            <div class="font-semibold text-orderHover">{{ s.name }}</div>
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
</style>
