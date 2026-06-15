<script setup>
import { ref, watch, nextTick, getCurrentInstance, onBeforeUnmount } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { getLocal, setLocal, removeLocal } from '@/utils/common'
import { getNoLoginId } from '@/api/user.js'
import { UAParser } from 'ua-parser-js'
import 'github-markdown-css/github-markdown.css'
import router from '@/router'

const props = defineProps({
  // pass in after login; leave undefined for guest flow
  userInfo: {
    type: Object,
    default: null,
  },
  // full-page mode: render as a standalone full screen chat (no floating widget)
  fullpage: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['manage-ready', 'user-send'])

const {
  chatList, entering, manageAI, waitingAI, nologinHello, guessList, manage,
  connect, disconnect,
  sendChatMsg, sendEntering, sendCancelEntering, requestMsgList, sendFile,
  isBanEnter, setBanEnter,
} = useWebSocket()

const { proxy } = getCurrentInstance()

// --- UI state ---
const chatShow = ref(false)
const chatLarge = ref(false)
const chatNum = ref(0)
const emojiPanel = ref(false)
const imgPanel = ref(false)
const imgUrl = ref('')
const msg = ref('')
const manageNew = ref({})

const emojiList = [
  '🙂','😁','😂','😊','😍','😐','😕','😒','😢','😭',
  '🎉','❤','👌','👍','🙏','✊','✌','✋',
]

const bookingChat = ref(false)
const portChat = ref(false)
const orderChat = ref(false)
const bookingName = ref('')
const portName = ref('')
const orderName = ref('')

const chatPanels = ref(null)

let startPos = 0
let endPos = 0
let formData = null

// --- init ---
let _userInfo = {}

const initAsLogin = (info) => {
  _userInfo = info
  manageNew.value = info.manage
  connect(info)
}

const goChatpage = () => {
  router.push('/chat')
}

const initAsGuest = () => {
  const ua = new UAParser()
  const uaInfo = ua.getResult()
  const ruleForm = {
    browser: uaInfo.browser.name,
    sys: uaInfo.os.name + uaInfo.os.version,
    machine: window.screen.width + '*' + window.screen.height,
  }

  const code = getLocal('invitation_codes')
  if (getLocal('chat_info') && !code) {
    const chatInfo = JSON.parse(getLocal('chat_info'))
    manageNew.value = chatInfo.manage
    _userInfo = {
      id: chatInfo.chat_id,
      manage: { id: chatInfo.manage.id },
      token: null,
    }
    ruleForm.id = chatInfo.chat_id
    setLocal('manageNew', chatInfo.manage)
    connect(_userInfo, ruleForm, chatInfo.manage)
  } else {
    getNoLoginId({ type: 1, code }).then((res) => {
      const d = res.data.data
      setLocal('chat_info', d)
      manageNew.value = d.manage
      _userInfo = {
        id: d.chat_id,
        manage: { id: d.manage.id },
        token: null,
      }
      ruleForm.id = d.chat_id
      setLocal('manageNew', d.manage)
      removeLocal('invitation_codes')
      connect(_userInfo, ruleForm, d.manage)
    })
  }
}

if (props.userInfo) {
  initAsLogin(props.userInfo)
} else {
  initAsGuest()
}

// full-page mode is always open
if (props.fullpage) {
  chatShow.value = true
}

// expose manage to parent so it can show the avatar button
watch(manage, (val) => { emit('manage-ready', val) }, { immediate: true })
watch(manageNew, (val) => {
  if (!manage.value.englishname) emit('manage-ready', val)
}, { immediate: true })

// auto-scroll on new messages
watch(chatList, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

onBeforeUnmount(() => {
  disconnect()
})

// --- scroll ---
const scrollToBottom = () => {
  if (chatPanels.value) {
    chatPanels.value.scrollTop = chatPanels.value.scrollHeight
  }
}

// --- chat open/close ---
const chatOpen = () => {
  chatShow.value = true
  chatNum.value = 0
  requestMsgList()
}

const closeChat = () => {
  chatShow.value = false
}

// --- send ---
const sendMessage = (openAI) => {
  if (!msg.value.trim()) return
  if (isBanEnter()) {
    ElMessage('Chatting in progress, please wait for the end')
    return
  }
  sendChatMsg(msg.value, _userInfo)
  emit('user-send', msg.value)
  msg.value = ''
  if (manageAI.value) setBanEnter(true)
  if (openAI === 1) window.open('/new/chat')
}

const listenKey = () => {
  msg.value = msg.value + '\n'
}

// "猜你想问" — send a suggested question
const askGuess = (question) => {
  if (isBanEnter()) {
    ElMessage('Chatting in progress, please wait for the end')
    return
  }
  sendChatMsg(question, _userInfo)
  if (manageAI.value) setBanEnter(true)
  guessList.value = []
}

// --- emoji ---
const getCursorPosition = () => {
  const el = proxy.$refs.textArea
  if (el) {
    startPos = el.selectionStart
    endPos = el.selectionEnd
  }
}

const emojiChoose = async (emoji) => {
  const el = proxy.$refs.textArea
  const old = msg.value
  msg.value = old.substring(0, startPos) + emoji + old.substring(endPos)
  emojiPanel.value = false
  el?.focus()
  await nextTick()
  if (el) {
    el.selectionStart = startPos + emoji.length
    el.selectionEnd = startPos + emoji.length
  }
}

// --- file upload ---
const upload = () => {
  proxy.$refs.iptFileRef.click()
}

const uploads = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  formData = new FormData()
  formData.append('file', file)
  const isImage = file.type.includes('image')

  const res = await fetch('https://mini.cargosoon.online/api/mini/Login/upload_chat', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (data.code !== '0') return

  const rawPath = data.data.image
  const url = 'https://mini.cargosoon.online/api' + rawPath.substring(1)

  if (isImage) {
    sendFile(1, url)
  } else {
    sendFile(2, url, {
      file_name: data.data.file_name,
      file_size: data.data.file_size,
      file_type: data.data.file_type,
    })
  }
  // reset input so same file can be re-uploaded
  e.target.value = ''
}

// --- typing indicator ---
const onInput = () => {
  if (msg.value) {
    sendEntering()
  } else {
    getCursorPosition()
    sendCancelEntering()
  }
}

const onBlur = () => {
  getCursorPosition()
  sendCancelEntering()
}

// --- image preview ---
const openImg = (url) => {
  imgUrl.value = url
  imgPanel.value = true
}

const toPriceDetails = () => {}

// allow parent (index.vue AI query box) to send a message through this chat
const sendFromExternal = (text, openAI) => {
  msg.value = text
  sendMessage(openAI)
}

defineExpose({ sendFromExternal })
</script>

<template>
  <!-- floating trigger button -->
  <div
    @click="chatOpen"
    v-show="!chatShow && !fullpage"
    class="chat-fab fixed bottom-20 right-10 p-2 bg-white rounded-full shadow-xxx flex cursor-pointer z-[60]"
  >
    <div class="relative">
      <img :src="manageNew.image_url || manage.image_url" class="w-12 h-12 rounded-full" alt="">
      <div class="chat-fab-dot absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-400 rounded-full"></div>
    </div>
    <div class="hidden sm:block px-2">
      <div class="my-0.5 font-semibold">{{ manageNew.englishname || manage.englishname }}</div>
      <div class="text-xs text-gray-500">Account Manager</div>
    </div>
    <div
      v-show="chatNum > 0"
      class="absolute -top-1 py-1 px-1.5 bg-red-500 text-white rounded-full text-13 leading-3"
    >{{ chatNum }}</div>
  </div>

  <!-- chat window -->
  <div
    v-show="chatShow || fullpage"
    :class="['chat-window flex bg-white', fullpage ? 'chat-fullpage' : 'rounded-md shadow-xxx z-[60] fixed bottom-20 right-10']"
  >
    <!-- toolbar -->
    <div v-show="!fullpage" class="absolute top-1 right-1 flex items-center">
      <!-- expand -->
      <svg t="1678422228047" @click="goChatpage" v-show="!chatLarge"
        class="icon hidden lg:block cursor-pointer mr-1"
        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10741" width="24" height="24">
        <path d="M193.349046 210.094207v130.995519c0.084979 23.530755-6.042025 43.024996-29.555785 43.105726h-0.195452c-23.649726-0.025494-33.940714-19.53673-34.004448-43.207701v-169.916017a41.580349 41.580349 0 0 1 41.784299-41.809792h170.328166c23.641228 0.029743 42.795552 10.707386 42.825294 34.36561 0.029743 23.535004-19.009859 29.445311-42.523618 29.475054H210.344896a16.995851 16.995851 0 0 0-16.99585 16.99585z m620.306058-16.99585H681.992498c-23.513759-0.025494-42.549112-5.935801-42.523618-29.470805 0.029743-23.662473 19.184066-34.335867 42.825294-34.369859H852.78805a41.580349 41.580349 0 0 1 41.618589 41.809792v169.920266c-0.063734 23.666722-10.354722 43.182207-34.000199 43.21195h-0.199701c-23.513759-0.084979-29.636515-19.57922-29.555785-43.109975v-130.995519a16.995851 16.995851 0 0 0-16.99585-16.99585zM210.344896 830.09434H342.007502c23.513759 0.025494 42.553361 5.94005 42.523618 29.470805-0.029743 23.662473-19.184066 34.335867-42.825294 34.369859H171.21195a41.580349 41.580349 0 0 1-41.618589-41.809792v-169.916017c0.063734-23.670971 10.354722-43.186456 34.004448-43.21195h0.195452c23.513759 0.084979 29.636515 19.574971 29.555785 43.105726v130.995519a16.995851 16.995851 0 0 0 16.99585 16.99585z m620.306058-16.859884v-130.991269c-0.084979-23.535004 6.042025-43.024996 29.555785-43.109975h0.199701c23.645477 0.029743 33.936465 19.545228 34.000199 43.21195v169.916016a41.580349 41.580349 0 0 1-41.784299 41.809793h-170.328166c-23.641228-0.029743-42.795552-10.707386-42.825294-34.36561-0.025494-23.535004 19.009859-29.445311 42.523618-29.475054H813.655104a16.995851 16.995851 0 0 0 16.99585-16.995851z" fill="#7a7a7a" p-id="10742"></path>
      </svg>
      <!-- shrink -->
      <svg t="1678430872698" @click="chatLarge = false" v-show="chatLarge"
        class="icon hidden lg:block cursor-pointer mr-1"
        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1599" width="24" height="24">
        <path d="M319.978667 304.622933V173.085867c-0.085333-23.633067 6.0672-43.204267 29.678933-43.2896h0.196267c23.748267 0.029867 34.082133 19.626667 34.146133 43.392v170.624a41.7536 41.7536 0 0 1-41.9584 41.984H171.003733c-23.739733-0.029867-42.973867-10.752-43.003733-34.5088-0.029867-23.633067 19.089067-29.568 42.7008-29.597867H302.912a17.066667 17.066667 0 0 0 17.066667-17.066667z m0 418.346667a17.066667 17.066667 0 0 0-17.066667-17.066667H170.7008c-23.611733-0.0256-42.730667-5.960533-42.7008-29.5936 0.029867-23.761067 19.264-34.478933 43.003733-34.513066H342.208a41.7536 41.7536 0 0 1 41.792 41.984v170.628266c-0.064 23.765333-10.397867 43.362133-34.146133 43.392h-0.196267c-23.611733-0.085333-29.76-19.6608-29.678933-43.2896v-131.541333z m384.042666-418.346667a17.066667 17.066667 0 0 0 17.066667 17.066667H853.2992c23.611733 0.029867 42.730667 5.9648 42.7008 29.597867-0.029867 23.7568-19.264 34.478933-43.003733 34.5088H681.792a41.7536 41.7536 0 0 1-41.792-41.984v-170.624c0.064-23.765333 10.397867-43.362133 34.146133-43.392h0.196267c23.611733 0.085333 29.76 19.656533 29.678933 43.2896v131.541333z m0 418.346667v131.541333c0.085333 23.6288-6.0672 43.204267-29.678933 43.285334h-0.196267c-23.748267-0.0256-34.082133-19.618133-34.146133-43.387734v-170.624a41.7536 41.7536 0 0 1 41.9584-41.984h171.037867c23.739733 0.029867 42.973867 10.752 43.003733 34.5088 0.029867 23.633067-19.089067 29.568-42.7008 29.597867H721.088a17.066667 17.066667 0 0 0-17.066667 17.066667z" fill="#7a7a7a" p-id="1600"></path>
      </svg>
      <!-- close -->
      <svg t="1678422103952" @click="closeChat" class="icon cursor-pointer"
        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2580" width="26" height="26">
        <path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM512 832c-179.2 0-320-140.8-320-320s140.8-320 320-320 320 140.8 320 320S691.2 832 512 832z" p-id="2581" fill="#7a7a7a"></path>
        <path d="M672 352c-12.8-12.8-32-12.8-44.8 0L512 467.2 396.8 352C384 339.2 364.8 339.2 352 352S339.2 384 352 396.8L467.2 512 352 627.2c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0L512 556.8l115.2 115.2c12.8 12.8 32 12.8 44.8 0s12.8-32 0-44.8L556.8 512l115.2-115.2C684.8 384 684.8 364.8 672 352z" p-id="2582" fill="#7a7a7a"></path>
      </svg>
    </div>

    <!-- main panel -->
    <div :class="['chat-tech', fullpage ? 'flex-1 flex flex-col h-full' : (chatLarge ? 'w-700' : 'w-[410px]')]">
      <!-- header -->
      <div class="chat-header p-3 flex border-b border-gray-200 select-none">
        <div class="relative">
          <img draggable="false" :src="manage.image_url || manageNew.image_url" class="w-12 h-12 rounded-full" alt="">
          <div class="absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-400 rounded-full"></div>
        </div>
        <div class="pl-3 pr-5">
          <div class="my-0.5 font-semibold">{{ manage.englishname || manageNew.englishname }}</div>
          <div class="text-xs text-gray-500">Account Manager</div>
        </div>
      </div>

      <!-- messages -->
      <div ref="chatPanels" :class="['chat-body overflow-y-scroll', fullpage ? 'flex-1' : 'h-[460px]']">
        <div class="p-3">
          <!-- AI welcome -->
          <div v-show="manageAI" class="py-6 flex flex-col items-center">
            <img src="@/assets/chat/gptIcon.png" class="w-16" alt="">
            <div class="mt-3 text-lg">Hello, I am CargosoonAl assistant</div>
            <div class="mt-2.5 text-sm">How can I help you?</div>
          </div>

          <!-- message list -->
          <div v-for="(i, n) in chatList" :key="n">
            <!-- my messages (is_me === 1) -->
            <div v-if="i.is_me == 1" class="py-2 flex justify-end">
              <div class="pr-2 flex flex-col items-end" style="width:calc(100% - 80px)">
                <div class="flex items-end justify-end flex-wrap">
                  <div class="text-xs text-gray-500">{{ i.date_entered }}</div>
                  <div class="ml-2 text-sm">{{ i.nickname }}</div>
                </div>
                <!-- text -->
                <div v-if="i.msg_type == 0"
                  class="mt-1.5 px-3 py-1.5 text-13 text-white rounded-3xl bg-chatMsgs min-w-40px max-w-full relative break-words">
                  {{ i.msg }}
                  <div v-show="i.is_read == 1" class="absolute bottom-0 -left-6">
                    <svg t="1678437391950" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="30218" width="18" height="18">
                      <path d="M511.006881 64.592111c-247.195985 0-447.565479 200.369493-447.565479 447.566502 0 247.168356 200.369493 447.566502 447.565479 447.566502 247.168356 0 447.566502-200.398146 447.566502-447.566502C958.573383 264.961604 758.175237 64.592111 511.006881 64.592111zM511.006881 895.376551c-211.645304 0-383.217938-171.59924-383.217938-383.217938 0-211.646328 171.572634-383.217938 383.217938-383.217938s383.217938 171.572634 383.217938 383.217938C894.22482 723.776288 722.652186 895.376551 511.006881 895.376551z" fill="#7a7a7a" p-id="30219"></path>
                      <path d="M706.369338 385.719922c-11.580756 0-22.099321 4.700045-29.706579 12.308327L454.6135 620.581997l-137.570215-138.074705c-7.608282-7.609305-18.098193-12.308327-29.706579-12.308327-23.161512 0-41.958624 18.769482-41.958624 41.959647 0 11.580756 4.670369 22.043039 12.252045 29.622668l167.277818 167.837566c7.580652 7.580652 18.098193 12.308327 29.706579 12.308327 11.609409 0 22.099321-4.700045 29.707602-12.308327l0 0.028653 251.754814-252.343215c7.553023-7.580652 12.252045-18.070564 12.252045-29.65132C748.327962 404.491451 729.53085 385.719922 706.369338 385.719922z" fill="#7a7a7a" p-id="30220"></path>
                    </svg>
                  </div>
                </div>
                <!-- image -->
                <div v-if="i.msg_type == 1" class="mt-1.5 relative">
                  <img @click="openImg(i.msg)" :src="i.msg" class="rounded-md cursor-pointer max-w-20 min-w-20" alt="">
                </div>
                <!-- file -->
                <div v-if="i.msg_type == 2"
                  class="mt-1.5 px-3 py-1.5 text-13 rounded-3xl bg-chatMe min-w-40px max-w-full relative break-words text-blue-700">
                  <a :href="i.msg" target="_blank" class="cursor-pointer underline">{{ i.file_name }}</a>
                </div>
                <!-- dtd/ptp quote -->
                <div v-if="i.msg_type == 3 || i.msg_type == 4" class="mt-1.5 relative">
                  <div class="p-3 rounded-md bg-white shadow">
                    <div class="flex items-center mb-1.5">
                      <img v-show="i.msg.img" :src="i.msg.img" class="w-7 h-7 rounded-full mr-1" alt="">
                      <div class="text-sm font-semibold">{{ i.msg.name }}</div>
                    </div>
                    <div v-show="i.msg.date" class="flex items-center">
                      <img src="@/assets/chat/dtdtime.svg" class="w-3 h-3 mr-1" alt="">
                      <div class="text-xs">{{ i.msg.date }}</div>
                    </div>
                    <div class="flex items-center my-0.5">
                      <img src="@/assets/chat/dtdprice.svg" class="w-3 h-3 mr-1" alt="">
                      <div class="text-red-500 font-semibold">{{ i.msg.price }}</div>
                      <div v-show="i.msg_type == 3" class="text-xs">{{ i.msg.weight }}</div>
                    </div>
                    <div v-show="i.msg.destination" class="flex items-center">
                      <img src="@/assets/chat/dtdlocation.svg" class="w-3 h-3 mr-1" alt="">
                      <div class="text-xs">{{ i.msg.destination }}</div>
                    </div>
                  </div>
                </div>
                <!-- product card -->
                <div v-if="i.msg_type == 14" class="mt-1.5 relative shadow rounded-md">
                  <a :href="i.msgx.url" target="_blank">
                    <img :src="i.msgx.image" style="border-radius:6px 6px 0 0;max-width:180px;min-width:180px;" alt="">
                  </a>
                  <div style="width:180px;background-color:#ededed;padding:10px;border-radius:0 0 6px 6px;">
                    <a :href="i.msgx.url" target="_blank">
                      <div class="productTitleMsg text-13 break-words overflow-ellipsis overflow-hidden hover:underline h-10 cursor-pointer">{{ i.msgx.subject }}</div>
                    </a>
                    <div style="padding-top:6px;color:#e30101;font-weight:600;">${{ i.msgx.price_us }}</div>
                  </div>
                </div>
                <!-- inquiry -->
                <div v-if="i.msg_type == 21 || i.msg_type == 22" class="mt-1.5 relative text-13 w-60">
                  <div class="p-3 rounded-md bg-white shadow">
                    <div class="flex items-center">
                      <img src="@/assets/chat/inquiry.svg" class="w-7" alt="">
                      <div class="ml-3 font-semibold">Single Inquiry</div>
                    </div>
                    <div class="mt-2">Messages:</div>
                    <div class="text-gray-500 text-xs">{{ i.inquiry.message }}</div>
                    <template v-if="i.msg_type == 22">
                      <div class="mt-2 flex items-center">
                        <div>What'sapp:</div>
                        <div class="ml-2 text-gray-500 text-xs">{{ i.inquiry.whatsapp }}</div>
                      </div>
                      <div class="mt-2 flex items-center">
                        <div>Email:</div>
                        <div class="ml-2 text-gray-500 text-xs">{{ i.inquiry.email }}</div>
                      </div>
                    </template>
                    <div class="mt-2">files:</div>
                    <div class="flex" style="color:#100adb;">
                      <div class="rounded-md" style="background:#5cafff;">
                        <a :href="i.inquiry.file.image" download class="py-0.5 px-3 cursor-pointer underline">{{ i.inquiry.file.file_name }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <img :src="i.head_img" class="flex-shrink-0 w-8 h-8 rounded-full" alt="">
            </div>

            <!-- other side messages (is_me === 0) -->
            <div v-if="i.is_me == 0 && i.msg_type != 15" class="py-2 flex">
              <img :src="i.head_img" class="flex-shrink-0 w-8 h-8 rounded-full" alt="">
              <div class="pl-2 flex flex-col items-start" style="width:calc(100% - 80px)">
                <div class="flex items-start flex-wrap-reverse">
                  <div class="text-sm mr-2">{{ i.nickname }}</div>
                  <div class="text-xs text-gray-500">{{ i.date_entered }}</div>
                </div>
                <!-- text -->
                <div v-if="i.msg_type == 0"
                  class="mt-1.5 px-3 py-1.5 text-13 rounded-3xl bg-gray-200 min-w-40px max-w-full overflow-x-hidden break-words">{{ i.msg }}</div>
                <!-- image -->
                <div v-if="i.msg_type == 1" @click="openImg(i.msg)" class="flex text-sm mx-1 mt-1.5">
                  <img :src="i.msg" class="rounded-md cursor-pointer max-w-20 min-w-20" alt="">
                </div>
                <!-- file -->
                <div v-if="i.msg_type == 2"
                  class="mt-1.5 px-3 py-1.5 text-13 rounded-3xl bg-gray-200 min-w-40px max-w-full overflow-x-hidden break-words text-blue-700">
                  <a :href="i.msg" download class="cursor-pointer underline">{{ i.file_name }}</a>
                </div>
                <!-- dtd/ptp quote -->
                <div v-if="i.msg_type == 3 || i.msg_type == 4" class="mt-1.5 relative">
                  <div class="p-3 rounded-md bg-gray-100 shadow">
                    <div class="bg-white rounded-md shadow overflow-hidden">
                      <div v-show="i.msg_type == 4" class="text-13">
                        <div class="p-2">Cargo Consolidation</div>
                        <table class="w-full table-auto text-center border-t border-l">
                          <tbody>
                            <tr>
                              <th class="py-2 border-r border-b font-normal">Cabinet type</th>
                              <th class="py-2 border-r border-b font-normal">Volume</th>
                              <th class="py-2 border-r border-b font-normal">Unit price (cabinet)</th>
                            </tr>
                            <tr v-for="(ix, nx) in i.msg.price_list" :key="nx">
                              <td class="py-2 border-r border-b">{{ ix.type }}</td>
                              <td class="py-2 border-r border-b">{{ ix.volume }}</td>
                              <td class="py-2 border-r border-b">{{ ix.price }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="p-3">
                        <div class="flex items-center mb-1.5">
                          <img v-show="i.msg.img" :src="i.msg.img" class="w-7 h-7 rounded-full mr-1" alt="">
                          <div class="text-sm font-semibold">{{ i.msg.name }}</div>
                        </div>
                        <div v-show="i.msg.date" class="flex items-center">
                          <img src="@/assets/chat/dtdtime.svg" class="w-3 h-3 mr-1" alt="">
                          <div class="text-13">{{ i.msg.date }}</div>
                        </div>
                        <div v-show="i.msg.unit_price" class="flex items-center mt-0.5">
                          <img src="@/assets/chat/dtdprice.svg" class="w-3 h-3 mr-1" alt="">
                          <div class="text-13">${{ i.msg.unit_price }}/kg</div>
                        </div>
                        <div class="flex items-center my-0.5">
                          <img src="@/assets/chat/dtdprice.svg" class="w-3 h-3 mr-1" alt="">
                          <div class="flex items-center">
                            <template v-if="i.msg_type == 4">
                              <div class="text-red-500 font-semibold">USD {{ i.msg.total_price }}</div>
                              <div class="text-13 flex items-center">
                                (<div v-for="(it, nt) in i.msg.type_and_number" :key="nt">
                                  <span v-show="nt > 0">+</span>{{ it.number }} * {{ it.type }}
                                </div>)
                              </div>
                            </template>
                            <template v-if="i.msg_type == 3">
                              <div class="text-red-500 font-semibold">{{ i.msg.price }}</div>
                              <div class="text-13">{{ i.msg.weight }}</div>
                            </template>
                          </div>
                        </div>
                        <div v-show="i.msg.destination" class="flex items-center">
                          <img src="@/assets/chat/dtdlocation.svg" class="w-3 h-3 mr-1" alt="">
                          <div class="text-13">{{ i.msg.destination }}</div>
                        </div>
                        <div v-show="i.msg.tax == '1'" class="flex items-center mt-2.5">
                          <div class="py-0.5 px-3 rounded text-13" style="color:#5dba00;background-color:#ebf9ed;">Included Tax</div>
                        </div>
                      </div>
                    </div>
                    <div v-show="i.msg_type == 4" class="mt-4 text-gray-400 text-xs">Tips: Time: Includes route transportation time only</div>
                    <div class="flex justify-center text-sm">
                      <button class="mt-3 py-1.5 px-10 bg-orange hover:bg-orange1 text-white rounded-md"
                        @click="toPriceDetails(i.msg.detail_info, i.msg_type)">Get Discount</button>
                    </div>
                  </div>
                </div>
                <!-- guest greeting -->
                <div v-if="i.msg_type == 5"
                  class="mt-1.5 px-3 py-1.5 text-13 rounded-3xl bg-gray-200 min-w-40px max-w-full overflow-x-hidden break-words">
                  <div>{{ nologinHello[0] }}</div>
                  <div>{{ nologinHello[1] }}</div>
                  <div>{{ nologinHello[2] }}</div>
                  <div>{{ nologinHello[3] }}</div>
                  <div class="mt-2 pt-2 border-t border-gray-700">WhatsApp:{{ manageNew.whatsappp }}</div>
                  <div>e-mail:{{ manageNew.service_email }}</div>
                </div>
                <!-- consolidation msg_type 11 -->
                <div v-if="i.msg_type == 11" class="mt-1.5 relative text-13">
                  <div class="p-3 rounded-md bg-gray-100 shadow">
                    <div class="bg-white rounded-md shadow">
                      <div class="p-2">Cargo Consolidation</div>
                      <table v-if="i.msg_state == 0" class="w-full table-auto text-center border-t border-l">
                        <tbody>
                          <tr>
                            <th class="py-2 border-r border-b font-normal">Service name</th>
                            <th class="py-2 border-r border-b font-normal">Prices</th>
                          </tr>
                          <tr v-for="(ix, nx) in i.msg" :key="nx">
                            <td class="py-2 border-r border-b">{{ ix.service_name }}</td>
                            <td class="py-2 border-r border-b">{{ ix.prices }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="i.msg_state == 1" class="px-2 pb-2">
                        <div class="flex"><div class="text-gray-400 w-36">Warehouse address:</div><div>{{ i.msg.warehouse_address }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Total volume(CBM):</div><div>{{ i.msg.total_volume }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Cargo type:</div><div>{{ i.msg.cargo_type }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Of boxes:</div><div>{{ i.msg.of_boxes }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Inventory time:</div><div>{{ i.msg.inventory_time }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Fee days:</div><div>{{ i.msg.free_days }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Outbound service:</div><div>{{ i.msg.outbound_service }}</div></div>
                        <div class="flex items-center"><div class="text-gray-400 w-36">Prices:</div><div class="text-red-500 font-semibold text-base">${{ i.msg.free }}</div></div>
                      </div>
                    </div>
                    <div class="mt-4 text-gray-400 text-xs">
                      <div>Tips: Warehouse address</div>
                      <div>102 Building C, Hezhihe Industrial Park, No. 2990 Songbai Road, Shiyan, Baoan, Shenzhen</div>
                      <div>Customer service call: 0755-28225927/15323780975</div>
                      <div>Name:Andy</div>
                    </div>
                  </div>
                </div>
                <!-- consolidation msg_type 12 -->
                <div v-if="i.msg_type == 12" class="mt-1.5 relative text-13">
                  <div class="p-3 rounded-md bg-gray-100 shadow">
                    <div class="bg-white rounded-md shadow">
                      <div class="p-2">Cargo Consolidation</div>
                      <table v-if="i.msg_state == 0" class="table-auto text-center border-t border-l">
                        <tbody>
                          <tr>
                            <th class="border-r border-b font-normal">Total Volume(CBM)</th>
                            <th class="border-r border-b font-normal">Number of suppliers</th>
                            <th class="border-r border-b font-normal">Prices(kg)</th>
                          </tr>
                          <tr v-for="(ix, nx) in i.msg" :key="nx">
                            <td class="py-2 border-r border-b">{{ ix.volume }}</td>
                            <td class="py-2 border-r border-b">{{ ix.supplier }}</td>
                            <td class="py-2 border-r border-b">{{ ix.price }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="i.msg_state == 1" class="px-2 pb-2">
                        <div class="flex"><div class="text-gray-400 w-36">Total volume(CBM):</div><div>{{ i.msg.volume }}</div></div>
                        <div class="flex"><div class="text-gray-400 w-36">Number of suppliers:</div><div>{{ i.msg.suppliers }}</div></div>
                        <div class="flex items-center"><div class="text-gray-400 w-36">Prices:</div><div class="text-red-500 font-semibold text-base">${{ i.msg.price }}</div></div>
                      </div>
                    </div>
                    <div class="mt-4 text-gray-400 text-xs">
                      <div>Tips: Warehouse address</div>
                      <div>102 Building C, Hezhihe Industrial Park, No. 2990 Songbai Road, Shiyan, Baoan, Shenzhen</div>
                      <div>Customer service call: 0755-28225927/15323780975</div>
                      <div>Name:Andy</div>
                    </div>
                  </div>
                </div>
                <!-- AI reply -->
                <div v-if="i.msg_type == 13"
                  class="AI_msg markdown-body mt-1.5 pl-7 pr-5 py-1.5 text-13 rounded-3xl bg-gray-200 min-w-40px max-w-full overflow-x-hidden break-words"
                  v-html="i.msg"></div>
              </div>
            </div>

            <!-- system msg -->
            <div v-if="i.msg_type == 999" class="my-3 text-gray-400 text-center text-xs">{{ i.msg }}</div>
          </div>

          <div v-show="waitingAI" class="pt-5 text-gray-400 text-center text-xs">AI replies can take 5-10 seconds to reply</div>

          <!-- booking/port/order prompts -->
          <div v-show="bookingChat" class="mt-4 p-3 flex justify-between items-center rounded-md border border-orange relative">
            <svg t="1678422103952" @click="bookingChat = false" class="absolute right-0 -top-3.5 icon cursor-pointer" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2580" width="26" height="26">
              <path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM512 832c-179.2 0-320-140.8-320-320s140.8-320 320-320 320 140.8 320 320S691.2 832 512 832z" p-id="2581" fill="#7a7a7a"></path>
              <path d="M672 352c-12.8-12.8-32-12.8-44.8 0L512 467.2 396.8 352C384 339.2 364.8 339.2 352 352S339.2 384 352 396.8L467.2 512 352 627.2c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0L512 556.8l115.2 115.2c12.8 12.8 32 12.8 44.8 0s12.8-32 0-44.8L556.8 512l115.2-115.2C684.8 384 684.8 364.8 672 352z" p-id="2582" fill="#7a7a7a"></path>
            </svg>
            <div class="overflow-ellipsis overflow-hidden whitespace-nowrap text-sm">Do you want to consult {{ bookingName }}?</div>
            <button class="ml-3 px-5 py-1.5 bg-orange hover:bg-orange1 text-white rounded-md text-xs">Send</button>
          </div>
          <div v-show="portChat" class="mt-4 p-3 flex justify-between items-center rounded-md border border-orange relative">
            <svg t="1678422103952" @click="portChat = false" class="absolute right-0 -top-3.5 icon cursor-pointer" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2580" width="26" height="26">
              <path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM512 832c-179.2 0-320-140.8-320-320s140.8-320 320-320 320 140.8 320 320S691.2 832 512 832z" p-id="2581" fill="#7a7a7a"></path>
              <path d="M672 352c-12.8-12.8-32-12.8-44.8 0L512 467.2 396.8 352C384 339.2 364.8 339.2 352 352S339.2 384 352 396.8L467.2 512 352 627.2c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0L512 556.8l115.2 115.2c12.8 12.8 32 12.8 44.8 0s12.8-32 0-44.8L556.8 512l115.2-115.2C684.8 384 684.8 364.8 672 352z" p-id="2582" fill="#7a7a7a"></path>
            </svg>
            <div class="overflow-ellipsis overflow-hidden whitespace-nowrap text-sm">Do you want to inquire the price of {{ portName }}?</div>
            <button class="ml-3 px-5 py-1.5 bg-orange hover:bg-orange1 text-white rounded-md text-xs">Send</button>
          </div>
          <div v-show="orderChat" class="mt-4 p-3 flex justify-between items-center rounded-md border border-orange relative">
            <svg t="1678422103952" @click="orderChat = false" class="absolute right-0 -top-3.5 icon cursor-pointer" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2580" width="26" height="26">
              <path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM512 832c-179.2 0-320-140.8-320-320s140.8-320 320-320 320 140.8 320 320S691.2 832 512 832z" p-id="2581" fill="#7a7a7a"></path>
              <path d="M672 352c-12.8-12.8-32-12.8-44.8 0L512 467.2 396.8 352C384 339.2 364.8 339.2 352 352S339.2 384 352 396.8L467.2 512 352 627.2c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0L512 556.8l115.2 115.2c12.8 12.8 32 12.8 44.8 0s12.8-32 0-44.8L556.8 512l115.2-115.2C684.8 384 684.8 364.8 672 352z" p-id="2582" fill="#7a7a7a"></path>
            </svg>
            <div class="text-sm">You may want to inquire about order number {{ orderName }}?</div>
            <button class="ml-3 px-5 py-1.5 bg-orange hover:bg-orange1 text-white rounded-md text-xs">Send</button>
          </div>
        </div>
      </div>

      <!-- guess you want to ask (msg_type 15) — full-page only -->
      <div v-if="fullpage && guessList.length" class="guess-bar px-3 pt-2">
        <div class="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <img src="@/assets/chat/rocket.svg" class="w-3.5" alt="">
          猜你想问
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(q, n) in guessList"
            :key="n"
            @click="askGuess(q)"
            class="guess-chip cursor-pointer text-xs px-3 py-1.5 rounded-full"
          >{{ q }}</span>
        </div>
      </div>

      <!-- input area -->
      <div class="p-3 relative">
        <div v-show="entering" class="absolute -top-1 left-4 text-xs text-gray-500">The other is typing...</div>
        <div class="chat-input-box relative">
          <textarea
            @blur="onBlur"
            @input="onInput"
            @keyup.enter.exact="sendMessage()"
            @keyup.ctrl.enter="listenKey()"
            ref="textArea"
            v-model="msg"
            rows="3"
            class="w-full outline-none text-13 px-3 pt-3 pb-9 resize-none bg-transparent placeholder-gray-400"
            placeholder="Enter the shipment information to get details e.g. 21kg Shenzhen to USA"
          ></textarea>
          <!-- bottom-left tools -->
          <div class="absolute bottom-2 left-2 flex items-center">
            <div class="relative">
              <img @click="emojiPanel = !emojiPanel" src="@/assets/chat/emoji.svg"
                class="w-7 h-7 p-1 rounded hover:bg-gray-100 cursor-pointer" alt="">
              <div v-show="emojiPanel"
                class="absolute -top-28 -left-2 w-52 p-2 bg-white rounded-md shadow-md grid grid-cols-6 gap-1">
                <div v-for="(item, index) in emojiList" :key="index" @click="emojiChoose(item)"
                  class="p-1 col-span-1 cursor-pointer text-center hover:bg-gray-100 rounded-md">{{ item }}</div>
              </div>
            </div>
            <input type="file" style="display:none;" ref="iptFileRef" @change="uploads" />
            <img @click="upload" src="@/assets/chat/chatUpload.svg"
              class="ml-1 w-7 h-7 p-1 rounded hover:bg-gray-100 cursor-pointer" alt="">
          </div>
          <!-- bottom-right round send -->
          <button
            @click="sendMessage()"
            :class="['chat-send-round', msg.trim() ? 'is-active' : '']"
            class="absolute bottom-2 right-2 flex items-center justify-center cursor-pointer"
          >
            <img src="@/assets/chat/send.svg" class="w-4 h-4" alt="">
          </button>
        </div>
      </div>
    </div>

    <!-- sidebar (expanded mode) -->
    <div v-show="chatLarge" class="flex w-80 p-3 border-l border-gray-200 flex-col items-center">
      <img :src="manage.image_url || manageNew.image_url" class="mt-20 w-20 h-20 rounded-full" alt="">
      <div class="mt-4 font-semibold">{{ manage.englishname || manageNew.englishname }}</div>
      <div class="mt-2 text-sm">Account Manager</div>
      <div class="mt-4 flex items-center w-full rounded-3xl bg-gray-200">
        <div class="h-full flex items-center px-4 py-1.5 bg-green-500 rounded-3xl">
          <svg t="1678429918279" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18947" width="18" height="18">
            <path d="M520.124 64C277.21 64 80.268 259.402 80.268 500.464c0 82.46 23.064 159.58 63.118 225.374L64 960l243.528-77.364c63.016 34.57 135.49 54.292 212.596 54.292C763.07 936.928 960 741.498 960 500.464 960 259.402 763.07 64 520.124 64z m218.724 602.22c-10.348 25.654-57.148 49.066-77.798 50.144-20.628 1.094-21.216 15.988-133.68-32.868-112.45-48.868-180.104-167.688-185.438-175.34-5.338-7.624-43.56-62.094-41.498-116.91 2.076-54.826 32.094-80.692 42.808-91.45 10.702-10.774 22.972-12.704 30.464-12.826 8.856-0.144 14.592-0.264 21.146-0.022 6.548 0.248 16.384-1.37 24.9 21.278 8.512 22.646 28.886 78.306 31.492 83.978 2.604 5.678 4.216 12.252 0.204 19.542-4.024 7.306-6.084 11.87-11.922 18.166-5.87 6.296-12.348 14.084-17.584 18.898-5.84 5.33-11.94 11.144-5.8 22.538 6.136 11.386 27.306 48.712 59.558 79.472 41.45 39.542 77.196 52.658 88.196 58.634 11.03 6.008 17.612 5.34 24.452-1.858 6.808-7.198 29.278-31.492 37.192-42.338 7.91-10.876 15.322-8.746 25.484-4.658 10.156 4.104 64.314 33.112 75.346 39.102 11.02 5.978 18.386 9.058 21.02 13.8 2.634 4.76 1.802 27.062-8.542 52.718z" p-id="18948" fill="#ffffff"></path>
          </svg>
        </div>
        <div class="p-2 w-full text-sm leading-4 text-gray-500 text-center">{{ manage.whatsappp }}</div>
      </div>
      <div class="mt-2 flex items-center w-full rounded-3xl bg-gray-200">
        <div class="h-full flex items-center px-4 py-1.5 bg-blue-500 rounded-3xl">
          <svg t="1678430218216" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20170" width="18" height="18">
            <path d="M926.47619 355.644952V780.190476a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667a73.142857 73.142857 0 0 1-73.142857-73.142857V355.644952l304.103619 257.828572a170.666667 170.666667 0 0 0 220.745142 0L926.47619 355.644952zM853.333333 170.666667a74.044952 74.044952 0 0 1 26.087619 4.778666 72.704 72.704 0 0 1 30.622477 22.186667 73.508571 73.508571 0 0 1 10.678857 17.67619c3.169524 7.509333 5.12 15.652571 5.607619 24.210286L926.47619 243.809524v24.380952L559.469714 581.241905a73.142857 73.142857 0 0 1-91.306666 2.901333l-3.632762-2.925714L97.52381 268.190476v-24.380952a72.899048 72.899048 0 0 1 40.155428-65.292191A72.97219 72.97219 0 0 1 170.666667 170.666667h682.666666z" p-id="20171" fill="#ffffff"></path>
          </svg>
        </div>
        <div class="p-2 w-full text-sm leading-4 text-gray-500 text-center">{{ manage.service_email }}</div>
      </div>
    </div>
  </div>

  <!-- image preview dialog -->
  <el-dialog v-model="imgPanel">
    <img :src="imgUrl" class="mt-3 w-full" alt="">
  </el-dialog>
</template>

<style>
/* AI markdown content (rendered via v-html, needs global scope) */
.AI_msg a { color: #2563eb !important; }
.AI_msg ol { list-style-type: decimal !important; }
.AI_msg ol > li > ul { list-style-type: circle !important; }
.AI_msg > ul { list-style-type: disc !important; }
.AI_msg > ul > li > ul { list-style-type: circle !important; }
.markdown-body {
  box-sizing: border-box;
  margin: 6px 0 0;
  padding: 8px 12px;
  background-color: #eef4fc !important;
  font-size: 14px;
  color: #16284d !important;
  border-radius: 14px !important;
}
.markdown-body th { min-width: 100px; }
.markdown-body code {
  background: #dbe7fa !important;
  color: #2563eb !important;
  border-radius: 4px;
  padding: 1px 4px;
}
</style>

<style scoped>
.productTitleMsg {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* ===== Theme: navy + orange + soft blue (matches landing page) ===== */

/* floating trigger button */
.chat-fab {
  border: 1px solid #dbe7fa;
  box-shadow: 0 6px 18px rgba(22, 40, 77, 0.16);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.chat-fab:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(22, 40, 77, 0.22);
}
.chat-fab-dot {
  box-shadow: 0 0 0 2px #fff;
}

/* full-page mode: fill parent container */
.chat-fullpage {
  width: 100%;
  height: 100%;
  border-radius: 0 !important;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

/* chat window shell */
.chat-window {
  border-radius: 8px !important;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2ebf7;
  box-shadow: 0 16px 44px rgba(22, 40, 77, 0.18);
}

/* header: clean white */
.chat-header {
  background: #fff;
  border-bottom: 1px solid #eef1f6 !important;
}

/* messages area: very soft blue tint */
.chat-body {
  background-color: #f6f9fe;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(37, 99, 235, 0.25) transparent;
}

/* full-page: cap bubble width so messages don't span the whole width */
.chat-fullpage :deep(.bg-chatMsgs),
.chat-fullpage :deep(.bg-gray-200),
.chat-fullpage :deep(.markdown-body) {
  max-width: 620px !important;
}
/* wide markdown tables scroll inside the bubble instead of overflowing */
.chat-fullpage :deep(.markdown-body) {
  overflow-x: auto !important;
}
.chat-fullpage :deep(.markdown-body table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
}
.chat-body::-webkit-scrollbar {
  width: 6px;
}
.chat-body::-webkit-scrollbar-track {
  background: transparent;
}
.chat-body::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.22);
  border-radius: 6px;
}
.chat-body::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.45);
}

/* user (self) bubbles: brand blue */
.chat-tech :deep(.bg-chatMsgs) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: #fff !important;
  border-radius: 16px !important;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.22);
  font-size: 14px;
}

/* incoming text bubbles: soft blue tint, navy text */
.chat-tech :deep(.bg-gray-200) {
  background: #eef4fc !important;
  color: #16284d !important;
  border-radius: 16px !important;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(22, 40, 77, 0.1);
}

/* AI markdown bubble shadow */
.chat-tech :deep(.markdown-body) {
  box-shadow: 0 2px 8px rgba(22, 40, 77, 0.1);
}

/* guess-you-want-to-ask chips */
.guess-chip {
  background: #eef4fc;
  color: #2563eb;
  border: 1px solid #dbe7fa;
  transition: background 0.15s ease;
}
.guess-chip:hover {
  background: #dceafe;
}

/* input box: single rounded container */
.chat-input-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.2s ease;
}
.chat-input-box:focus-within {
  border-color: #c7d2e3;
}

/* round send button bottom-right */
.chat-send-round {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e9ebef;
  transition: background 0.2s ease, filter 0.2s ease;
}
.chat-send-round img {
  opacity: 0.55;
  transition: opacity 0.2s ease;
}
.chat-send-round.is-active {
  background: linear-gradient(135deg, #ff8a3d 0%, #f2670a 100%);
}
.chat-send-round.is-active img {
  opacity: 1;
}
.chat-send-round.is-active:hover {
  filter: brightness(1.06);
}
</style>
