<script setup></script>

<template>
  <div class="col-span-4 relative" style="border-radius: 8px;box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);grid-row-end: span 20 !important;">
    <div class="flex w-full h-full relative z-10">
      <div class="w-full text-white">
        <div class="flex absolute left-6 bottom-12 text-xl">
          <a class="mr-3" href="/main/pricelist">
            <button class="videobtn shadow-md" style="background-image: linear-gradient(to right, #F18B30, #DF832B);">Get a Quote</button>
          </a>
          <a href="/main/pricelist">
            <button class="videobtn shadow-md" style="background-image: linear-gradient(to right, #4264CF, #3355B7);">Start Shipping</button>
          </a>
        </div>
      </div>
      <div class="shrink-0 flex items-center z-10" style="width: 530px;">
        <img src="@/assets/icon/videoPC.png" class="absolute select-none" style="width: 500px;" alt="">
        <video
          :autoplay="true"
          :loop="true"
          muted
          preload="metadata"
          controls
          width="470px"
          height="270px"
          style="margin: 22px 12px;">
          <source id="videoSource" src="@/assets/icon/cargosoon.mp4" type="video/mp4">
        </video>
      </div>
    </div>
    <img src="@/assets/icon/bg.webp" class="absolute bottom-0 left-0 w-full h-full z-0 object-cover object-left-top select-none" style="border-radius: 8px;" alt="">
  </div>
</template>

<style scoped>
.videobtn {
  padding: 9px 26px;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
