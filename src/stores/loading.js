import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('counter', () => {
  const showLoading = ref(false)
  function setLoading(val) {
    showLoading.value = val
  }

  return { showLoading, setLoading }
})
