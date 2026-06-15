<script setup>
const props = defineProps({
  cateList: { type: Array, default: () => [] },
  recommendationList: { type: Array, default: () => [] },
})

const toDrop = () => {
  window.open('https://codropshipping.com/', '_blank')
}

const toDropshipping = (id) => {
  window.open('https://codropshipping.com/productDetail?id=' + id + '&source=1', '_blank')
}
</script>

<template>
  <div class="card recommendation col-span-6">
    <h2>Alibaba, 1688 buy on behalf of the purchase</h2>
    <div class="mt-1 py-2 flex overflow-x-auto cateList">
      <div @click="toDrop" class="cursor-pointer" style="flex-shrink: 0;color: #CD3830;border-bottom: 1px solid #CD3830;">
        Recommend
      </div>
      <div v-for="(i, n) in cateList" :key="n" style="flex-shrink: 0;margin-left: 30px;">
        <a
          :href="'https://codropshipping.com/searchResult?keyword=' + i.translatedName"
          target="_blank"
          class="hover:text-orange"
        >
          {{ i.translatedName }}
        </a>
      </div>
    </div>
    <div class="mt-4 grid grid-cols-8 gap-4 p-4 bg-gray-50 rounded">
      <div v-for="(i, n) in recommendationList" :key="n" class="col-span-1 bg-white rounded overflow-hidden shadow">
        <img @click="toDropshipping(i.offerId)" :src="i.imageUrl" class="w-full h-48 object-cover cursor-pointer" alt="">
        <div class="p-2">
          <div
            @click="toDropshipping(i.offerId)"
            class="productTitle hover:underline cursor-pointer"
            :title="i.subjectTrans"
          >{{ i.subjectTrans }}</div>
          <div class="pt-1.5 pb-2 text-orange-500 font-semibold">US ${{ i.usd }}</div>
          <div class="flex items-center text-sm">
            <img src="@/assets/logo/alibaba.svg" class="w-6 mr-1" alt="">
            <div>1688</div>
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
.recommendation {
  grid-column-end: span 3 !important;
  margin-bottom: 100px;
}
h2 {
  font-size: 18px;
  color: #112f66;
  font-weight: 600;
}
.productTitle {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  font-size: 14px;
}
.cateList::-webkit-scrollbar {
  width: 0px;
  height: 8px;
}
.cateList::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.3);
}
.cateList::-webkit-scrollbar-track {
  border-radius: 6px;
}
</style>
