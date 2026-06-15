

<script setup>
import { ref } from 'vue'
import { assessmentList } from '@/api/user'

const AssList = ref([])
assessmentList().then((res) => {
  AssList.value = res.data.data.data
})
</script>

<template>
  <div class="flex">
    <img
      src="@/assets/icon/notice.svg"
      class="w-7 h-7 mr-3 ml-6"
      alt=""
    >
    <el-carousel
      height="30px"
      autoplay
      :direction="'vertical'"
      class="flex-1"
      indicator-position="none"
      interval="2000"
    >
      <el-carousel-item
        style="height: 30px"
        v-for="item in AssList"
        :key="item.id"
      >
        <div class="flex items-center">
          <img :src="item.img" class="w-7 h-7 rounded-full mr-2" alt="">
          <div class="mr-3">{{item.comment}}</div>
          <div>(Order: {{item.code}})</div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
</style>