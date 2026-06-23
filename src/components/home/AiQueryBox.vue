<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  reCity: { type: Array, default: () => [] },
  destinationList: { type: Array, default: () => [] },
})

const emit = defineEmits(['send'])

const msg = ref('')
const textAreasRef = ref(null)
const AIRecommend = ref(false)
const AIRecommendList = ref([
  'What service you can provide?',
  'What is best quotation from Shenzhen to USA  100kgs clothes?',
  'I need Warehouse service ,include collect goods from differen factory /labels/package /inspect and so on.',
  'Could you pickup goods from my supplier ? He is in Yiwu.',
  '1*40HQ , Shenzhen to USA ,newyork port , what is your price?',
  'DDP sea/air price to poland.',
  'Our warehouse charge.',
])

const quickTitle = ref('')
const quickChat = ref(false)
const quickType = ref(1)
const chatProduct = ref('')
const chatPrice = ref(1)
const chatFrom = ref('Shenzhen')
const chatTo = ref('UNITED STATES')
const chatWeight = ref(21)
const chatShip = ref('Sea')
const shippingMethod = ref(['Sea', 'Air', 'Express'])
const chatTracking = ref('')

const sendMessage = (openAI) => {
  if (!msg.value.trim()) return
  emit('send', msg.value, openAI)
  msg.value = ''
}

const listenKey = () => {
  msg.value = msg.value + '\n'
}

const recommendSearch = (text) => {
  msg.value = text
  sendMessage(1)
}

const quickModal = (type, title) => {
  quickTitle.value = title
  if (type == 3) {
    chatFrom.value = 'China'
  } else if (type == 5) {
    chatFrom.value = 'Shenzhen, China'
  } else {
    chatFrom.value = 'Shenzhen'
  }
  quickType.value = type
  quickChat.value = true
}

const quickMsg = () => {
  let chatmsg = ''
  if (quickType.value == 1) {
    chatmsg = `Help me get a shipping quote:
From: ${chatFrom.value}
To: ${chatTo.value}
Weight: ${chatWeight.value}kg
Shipping Method: ${chatShip.value}
Please include total cost, transit time, and best option.`
  } else if (quickType.value == 2) {
    chatmsg = `Help me check the delivery time:
From: ${chatFrom.value}
To: ${chatTo.value}
Weight: ${chatWeight.value}kg
Shipping Method: ${chatShip.value}
Please show the exact transit time and estimated arrival date.`
  } else if (quickType.value == 3) {
    chatmsg = `Help me estimate the import cost:
Product: ${chatProduct.value}
Declared Value: $${chatPrice.value}
From: ${chatFrom.value}
To: ${chatTo.value}
Please include duties, taxes, and total landed cost.`
    chatFrom.value = 'Shenzhen'
  } else if (quickType.value == 4) {
    chatmsg = `
Track my shipment:
Tracking Number: ${chatTracking.value}
Please show current status, location, and estimated delivery date.`
  } else if (quickType.value == 5) {
    chatmsg = `Compare air freight and sea freight for this shipment:
From: ${chatFrom.value}
To: ${chatTo.value}
Weight: ${chatWeight.value}kg
Please compare cost, transit time, and recommend the best option.`
  }
  msg.value = chatmsg
  quickChat.value = false
  sendMessage(1)
}

const even = (e) => {
  if (textAreasRef.value && !textAreasRef.value.contains(e.target)) {
    AIRecommend.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', even, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', even, true)
})
</script>

<template>
  <div class="ai-query col-span-2">
    <div>
      <a href="/chat">
        <div class="text-gray-600"><span class="text-blue-500">Smart</span> AI</div>
      </a>
      <div class="py-4 text-2xl font-semibold text-gray-700">Your Smart Logistics Assistant</div>
      <div class="text-gray-500">Get instant quotes, delivery time & import cost in seconds.</div>
    </div>
    <div class="relative">
      <div class="mt-8 relative bg-white rounded-2xl shadow" style="padding-right: 54px;">
        <textarea
          @focus="AIRecommend = true"
          @keyup.enter.exact="sendMessage(1)"
          @keyup.ctrl.enter="listenKey()"
          ref="textAreasRef"
          v-model="msg"
          class="outline-0 placeholder-gray-400 w-full resize-none p-3"
          placeholder="Describe your needs... or choose a task below"
          rows="4"
        ></textarea>
        <div @click="sendMessage(1)" class="absolute bottom-2.5 right-3 bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-full">
          <img src="@/assets/chat/up.svg" class="w-5" alt="">
        </div>
      </div>
      <div class="overflow-x-auto mt-3 pb-1">
        <div class="flex flex-wrap text-xs">
          <div @click="quickModal(1,'Get Shipping Quote')" class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-white rounded-lg px-2 py-1 cursor-pointer border border-blue-100" style="background: #2683DF;">
            <img src="@/assets/chat/rocket.svg" class="w-4 mr-2" alt="">
            Get Shipping Quote
          </div>
          <div @click="quickModal(2,'Check Delivery Time')" class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-gray-600 rounded-lg px-2 py-1 cursor-pointer border border-gray-100 chatbtn">
            <img src="@/assets/chat/dtdtime.svg" class="w-4 mr-2" alt="">
            Check Delivery Time
          </div>
          <div @click="quickModal(3,'Estimate Import Cost')" class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-gray-600 rounded-lg px-2 py-1 cursor-pointer border border-gray-100 chatbtn">
            <img src="@/assets/chat/estimate.svg" class="w-4 mr-2" alt="">
            Estimate Import Cost
          </div>
          <div @click="quickModal(4,'Track My Shipment')" class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-gray-600 rounded-lg px-2 py-1 cursor-pointer border border-gray-100 chatbtn">
            <img src="@/assets/chat/tracking.svg" class="w-4 mr-2" alt="">
            Track My Shipment
          </div>
          <div @click="quickModal(5,'Compare Air vs Sea')" class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-gray-600 rounded-lg px-2 py-1 cursor-pointer border border-gray-100 chatbtn">
            <img src="@/assets/chat/compare.svg" class="w-4 mr-2" alt="">
            Compare Air vs Sea
          </div>
          <div class="flex-shrink-0 mr-3 mt-1.5 flex items-center text-gray-600 rounded-lg px-2 py-1 cursor-pointer border border-gray-100 chatbtn">
            <img src="@/assets/chat/chatUpload.svg" class="w-4 mr-2" alt="">
            More
          </div>
        </div>
        <div v-show="quickChat"
          class="absolute p-3 bg-white shadow border border-gray-200 z-20 rounded"
          style="top: 130px;left: 0;width: 700px;">
          <div class="font-semibold text-gray-700">{{ quickTitle }}</div>
          <div class="mt-4 flex text-13">
            <div v-show="quickType==3" class="mx-2">
              <div>Product</div>
              <el-input v-model="chatProduct" placeholder="e.g. electronics"></el-input>
            </div>
            <div v-show="quickType==3" class="mx-2">
              <div>Declared Value</div>
              <div class="flex items-center">
                <div class="mr-1">$</div>
                <el-input v-model="chatPrice" placeholder="" type="number" min="0"></el-input>
              </div>
            </div>
            <div v-show="quickType!=4" class="mx-2">
              <div>From</div>
              <el-select v-model="chatFrom" filterable placeholder="" :disabled="quickType==3||quickType==5">
                <el-option
                  v-for="item in reCity"
                  :key="item.id"
                  :label="item.pinyin"
                  :value="item.pinyin">
                </el-option>
              </el-select>
            </div>
            <div v-show="quickType!=4" class="mx-2">
              <div>To</div>
              <el-select v-model="chatTo" filterable placeholder="" style="width: 200px;">
                <el-option
                  v-for="item in destinationList"
                  :key="item.code_two"
                  :label="item.en_nickname"
                  :value="item.en_nickname">
                </el-option>
              </el-select>
            </div>
            <div v-show="quickType!=3 && quickType!=4" class="mx-2">
              <div>Weight</div>
              <div class="flex items-center">
                <el-input-number v-model="chatWeight" :min="1"></el-input-number>
                <div class="ml-1">kg</div>
              </div>
            </div>
            <div v-show="quickType==1 || quickType==2" class="mx-2">
              <div>Shipping Method</div>
              <el-select v-model="chatShip" filterable placeholder="">
                <el-option
                  v-for="item in shippingMethod"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </div>
            <div v-show="quickType==4" class="mx-2">
              <div>Track my shipment</div>
              <el-input v-model="chatTracking" placeholder="" style="width: 300px"></el-input>
            </div>
          </div>
          <div class="mt-10 flex justify-center">
            <el-button @click="quickChat = false">cancel</el-button>
            <el-button @click="quickMsg" color="#2A4577" style="margin-left: 20px;">confirm</el-button>
          </div>
        </div>
        <div
          v-show="AIRecommend"
          class="absolute w-full p-3 bg-white border border-gray-200 z-20"
          style="top: 44px;left: 0;width: 500px;display: none;"
        >
          <div class="font-semibold">Recommended</div>
          <div
            v-for="(i, n) in AIRecommendList"
            :key="n"
            @click="recommendSearch(i)"
            class="mt-1 p-1.5 flex items-center text-sm text-gray-500 rounded cursor-pointer hover:bg-gray-100"
          >
            <div class="flex-1">{{ i }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-query {
  background: #F8F8F8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  grid-row-end: span 20 !important;
}
.chatbtn {
  background: #fcfcfc;
}
.chatbtn:hover {
  background: #e6e6e6;
}
</style>
