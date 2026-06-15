<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getNotice, setNotice } from '@/api/user'
import { useNoticeStore } from '@/stores/notice'

let noticeInfo = useNoticeStore()

let newNotice = ''
const noticeMenu = ref(false)
const noRead = ref(0)
const noticeList = ref([])

const accessNotice = () => {
  newNotice = setInterval(() => {
    getNotice().then((res) => {
      if (res.data.msg) {
        res.data.is_read = 0
        noticeInfo.decrement()
        noticeInfo.setNum(res.data)
        let arr = noticeInfo.noticeList
        arr.unshift(res.data.data)
        noticeInfo.setList(arr)
      }
    })
  }, 60000)
}

onMounted(() => {
  accessNotice()
})

onUnmounted(() => {
  clearInterval(newNotice)
})
const readAll = () => {
  setNotice({
    customer_id: JSON.parse(localStorage.getItem('userId')),
    type: 2,
  }).then((res) => {
    noticeInfo.clear()
  })
}

const viewNotice = (item, index) => {
  if (noticeInfo.noRead > 0) {
    noticeInfo.decrement()
  }
  setNotice({
    customer_id: item.customer_id,
    msg_id: item.id,
    type: 1,
  }).then((res) => {
    noticeInfo.setRead(index)
    let num = 0
    for (let n = 0; n < noticeInfo.noticeList.length; n++) {
      if (noticeInfo.noticeList[n].is_read == 0) {
        num++
      }
    }
    noticeInfo.setNum(num)
    if (item.msg_link == 'super') {
      window.open('/account/Member', '_blank')
    } else if (item.msg_link.indexOf("co_warehouse_manage")!=-1) {
      window.open('/warehouse/CargoManagements', '_blank')
    } else {
      window.open(`/order/forwardingOrder/${item.freightOrderId}`, '_blank')
    }
  })
}
</script>

<template>
  <div
    class="mr-1 p-1 rounded cursor-pointer relative"
    @mouseenter="noticeMenu = true"
    @mouseleave="noticeMenu = false"
  >
    <img
      src="@/assets/logo/notice-1.svg"
      class="w-8 h-8"
      alt=""
    />
    <div
      v-show="noticeInfo.noRead>0"
      class="absolute top-0 right-0 w-4 h-4 leading-none bg-red-500 rounded-full text-xs text-white text-center"
    >
      {{noticeInfo.noRead}}
    </div>
    <div
      v-if="noticeMenu"
      class="text-black z-50 absolute bg-white text-sm rounded-md shadow-md overflow-hidden top-10 -right-16 w-100 cursor-default"
    >
      <div class="flex justify-between items-center bg-gray-50 dark:bg-darkMain py-2.5 px-5">
        <div>Notifications</div>
        <div
          @click="readAll"
          class="text-gray-500 text-xs cursor-pointer hover:underline"
        >Mark all as read</div>
      </div>
      <div
        ref="noticePanel"
        v-show="noticeInfo.noticeList.length>0"
        class="h-72 overflow-auto notiList"
      >
        <div
          v-for="(ni,nn) in noticeInfo.noticeList"
          :key="nn"
          class="border-t border-gray-200 dark:border-darkLine py-2.5 px-5 relative hover:bg-tableHover dark:hover:bg-darkLine"
        >
          <div class="flex justify-between text-xs">
            <div class="leading-tight ">{{ni.msg}}</div>
            <div class="text-gray-500 w-24 flex-shrink-0 text-right">{{ni.created_data}}</div>
          </div>
          <div class="mt-3 flex">
            <div
              @click="viewNotice(ni,nn)"
              class="text-blue-500 hover:underline cursor-pointer"
            >View details</div>
          </div>
          <div
            v-show="ni.is_read == 0"
            class="absolute top-3 left-2 w-2 h-2 bg-red-500 rounded-full"
          ></div>
        </div>
      </div>
      <div
        v-show="noticeInfo.noticeList.length==0"
        class="my-8"
      >
        <img
          src="@/assets/logo/noNotification.svg"
          class="w-28 h-28 mx-auto mb-1"
          alt=""
        >
        <div class="text-center">No notification</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>