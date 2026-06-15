import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNoticeStore = defineStore('notice', () => {
  const noticeList = ref([])
  const noRead = ref(0)
  function setList(list) {
    noticeList.value = list
  }

  function setRead(index) {
    noticeList.value[index].is_read = 1
  }

  function setNum(num){    
    noRead.value = num
  }

  function increment() {
    noRead.value++
  }

  function decrement() {
    noRead.value--
  }

  function clear(){
    noRead.value = 0
    noticeList.value.forEach(item=>item.is_read=1)

  }

  return { noticeList, noRead, setList, setNum, clear, decrement, increment, setRead }
})