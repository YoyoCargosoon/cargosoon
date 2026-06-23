<script setup>
import { RouterView } from 'vue-router'
import LandingHeader from '@/components/landing/LandingHeader.vue'
</script>

<template>
  <LandingHeader />
  <RouterView />
</template>

<style>
#app {
  font-family: 'Inter', 'Lato', 'Ubuntu', sans-serif;
  -moz-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
