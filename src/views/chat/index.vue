<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  ArrowRight,
  Back,
  ChatDotRound,
  Close,
  Clock,
  Headset,
  Microphone,
  Paperclip,
  Picture,
  Plus,
  Position,
  RefreshRight,
} from '@element-plus/icons-vue'
import { UAParser } from 'ua-parser-js'
import { sendAiMessage } from '@/api/ai'
import { getNoLoginId } from '@/api/user'
import { useWebSocket } from '@/composables/useWebSocket'
import { getLocal, removeLocal, setLocal } from '@/utils/common'

const AI_STORAGE_KEY = 'cargosoon_ai_conversations'
const SERVICE_STORAGE_KEY = 'cargosoon_service_conversations'

const route = useRoute()
const router = useRouter()

const inputValue = ref('')
const conversations = ref([])
const activeConversationId = ref('')
const loading = ref(false)
const errorMessage = ref('')
const retryQuestion = ref('')
const serviceNotice = ref('')
const messageListRef = ref(null)
const textareaRef = ref(null)
const handledInitialQuestion = ref('')
const fileInputRef = ref(null)
const imageInputRef = ref(null)
const attachedFiles = ref([])
const isListening = ref(false)
const voiceError = ref('')
const recentCollapsed = ref(false)
const serviceUserInfo = ref(null)
const serviceConnecting = ref(false)
const serviceConnectionError = ref('')
const pendingServiceMessages = ref([])
const queuedServiceMessages = ref([])

let recognition = null

const {
  chatList: serviceChatList,
  entering: serviceEntering,
  manage: serviceManage,
  connected: serviceConnected,
  connect: connectCustomerService,
  disconnect: disconnectCustomerService,
  sendChatMsg: sendCustomerServiceChatMsg,
  sendFile: sendCustomerServiceFile,
} = useWebSocket()

const starterPrompts = [
  'I need shipping from China to the USA',
  'Quote 100kg clothes from Shenzhen to Los Angeles by sea DDP',
  'Track container MSKU1234567',
  'I need 1688 sourcing and inspection',
]

const serviceStarterPrompts = [
  'I need a live freight quote',
  'Please check my shipment status',
  'I want to book a shipment',
  'I need help with warehouse or 1688 sourcing',
]

const sidebarShortcuts = [
  {
    key: 'freight',
    label: 'Freight Quote',
    prompt: 'I need a freight quote from China. Please help me collect the required details.',
  },
  {
    key: 'tracking',
    label: 'Tracking',
    prompt: 'I want to track my shipment. Please tell me what tracking details you need.',
  },
  {
    key: 'booking',
    label: 'Booking Help',
    prompt: 'I want to start a booking. Please guide me through the required shipment information.',
  },
]

const serviceSidebarShortcuts = [
  {
    key: 'live_quote',
    label: 'Live Quote',
    prompt: 'I need a live freight quote. Please connect me with a CargoSoon specialist.',
  },
  {
    key: 'shipment_help',
    label: 'Shipment Help',
    prompt: 'Please help me check my shipment status with a customer service specialist.',
  },
  {
    key: 'booking_service',
    label: 'Booking Support',
    prompt: 'I want customer service to help me start a booking.',
  },
]

const nowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createConversation = () => ({
  id: nowId(),
  title: 'New Chat',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
})

const activeConversation = computed(() => {
  return conversations.value.find((item) => item.id === activeConversationId.value) || conversations.value[0]
})

const recentChats = computed(() => {
  return conversations.value
    .filter((item) => item.messages.length)
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
})

const canSend = computed(() => {
  const hasContent = !!inputValue.value.trim() || attachedFiles.value.length > 0
  if (!hasContent || loading.value) return false
  return true
})
const isServiceMode = computed(() => route.query.mode === 'service')
const activeStorageKey = computed(() => AI_STORAGE_KEY)
const pageTitle = computed(() => (isServiceMode.value ? 'CargoSoon Customer Service' : 'CargoSoon AI Assistant'))
const pageSubtitle = computed(() => (
  isServiceMode.value
    ? 'AI replies instantly while a CargoSoon logistics specialist can follow up in the same chat.'
    : 'Ask for freight rates, tracking updates, booking guidance, or 1688 sourcing. Customer service can follow up here too.'
))
const emptyTitle = computed(() => (isServiceMode.value ? 'How can AI and customer service help?' : 'How can CargoSoon help today?'))
const activeStarterPrompts = computed(() => (isServiceMode.value ? serviceStarterPrompts : starterPrompts))
const activeSidebarShortcuts = computed(() => (isServiceMode.value ? serviceSidebarShortcuts : sidebarShortcuts))
const recentTitle = computed(() => 'Recent Chats')
const composerPlaceholder = computed(() => (isServiceMode.value ? 'Message CargoSoon Customer Service or AI...' : 'Message CargoSoon AI or Customer Service...'))
const serviceAvatarUrl = computed(() => serviceManage.value.image_url || '')
const serviceConnectionNotice = computed(() => {
  if (!isServiceMode.value) return ''
  if (serviceConnectionError.value) return serviceConnectionError.value
  if (serviceConnecting.value) return 'Connecting to CargoSoon Customer Service...'
  if (!serviceConnected.value) return 'Customer service is reconnecting. Messages can be sent after the connection is restored.'
  if (serviceManage.value.englishname) return `Connected to ${serviceManage.value.englishname}.`
  return 'Connected to CargoSoon Customer Service.'
})

const serviceHasHumanReply = computed(() => serviceAssistantMessages.value.length > 0)
const serviceHasCustomerMessage = computed(() => activeConversation.value?.messages.some((message) => message.role === 'user') || false)
const showAiSelfHelpPrompt = computed(() => isServiceMode.value && serviceHasCustomerMessage.value && !serviceHasHumanReply.value)
const latestServiceQuestion = computed(() => {
  const latest = [...(activeConversation.value?.messages || [])].reverse().find((message) => message.role === 'user' && message.content)
  return latest?.content || ''
})

const getAssistantAvatar = (message) => {
  if (message.assistantType === 'service') return message.avatarUrl || serviceAvatarUrl.value
  return ''
}

const getAssistantInitials = (message) => {
  return message.assistantType === 'service' ? 'CS' : 'AI'
}

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

const normalizeServiceMessageContent = (message) => {
  if (!message) return ''
  if (typeof message.msg === 'string') return stripHtml(message.msg)
  if (typeof message.msg === 'object' && message.msg) {
    return message.msg.content || message.msg.message || message.msg.file_name || 'Attachment'
  }
  return ''
}

const getMessageTime = (value, fallback = Date.now()) => {
  if (value === 0) return 0
  if (!value) return fallback
  if (typeof value === 'number') return value

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

const mapServiceMessage = (message, index) => {
  const isImage = message.msg_type === 1
  const isFile = message.msg_type === 2
  let attachment = null

  if (isImage && typeof message.msg === 'string') {
    attachment = {
      id: `service-image-${index}`,
      name: 'Image attachment',
      sizeLabel: '',
      type: 'image/*',
      kind: 'image',
      previewUrl: message.msg,
    }
  }

  if (isFile) {
    const rawFile = typeof message.msg === 'object' ? message.msg : {}
    attachment = {
      id: `service-file-${index}`,
      name: message.file_name || rawFile.file_name || 'File attachment',
      sizeLabel: rawFile.file_size || '',
      type: rawFile.file_type || 'application/octet-stream',
      kind: 'file',
      previewUrl: rawFile.image || '',
    }
  }

  return {
    id: `service-${message.date_entered || index}-${message.is_me}-${message.msg_type}`,
    role: message.is_me === 1 ? 'user' : 'assistant',
    assistantType: message.is_me === 0 ? 'service' : '',
    content: isImage || isFile ? '' : normalizeServiceMessageContent(message),
    attachments: attachment ? [attachment] : [],
    avatarUrl: message.is_me === 0 ? (message.head_img || serviceManage.value.image_url || '') : '',
    status: 'done',
    createdAt: getMessageTime(message.date_entered, 0),
  }
}

const serviceMessages = computed(() => {
  const mapped = serviceChatList.value
    .filter((message) => [0, 1, 2].includes(message.msg_type))
    .map(mapServiceMessage)

  return [...mapped, ...pendingServiceMessages.value]
})

const serviceAssistantMessages = computed(() => {
  const startedAt = activeConversation.value?.createdAt || 0

  return serviceMessages.value
    .filter((message) => message.role === 'assistant')
    .filter((message) => getMessageTime(message.createdAt) >= startedAt - 2000)
})

const activeMessages = computed(() => {
  const localMessages = activeConversation.value?.messages || []
  const mergedMessages = [...localMessages, ...serviceAssistantMessages.value]
  const seen = new Map()

  mergedMessages.forEach((message) => {
    if (!seen.has(message.id)) seen.set(message.id, message)
  })

  return [...seen.values()].sort((a, b) => getMessageTime(a.createdAt) - getMessageTime(b.createdAt))
})

const hasMessages = computed(() => activeMessages.value.length > 0)

const loadConversations = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(activeStorageKey.value) || '[]')
    conversations.value = Array.isArray(stored) && stored.length ? stored : [createConversation()]
  } catch (error) {
    conversations.value = [createConversation()]
  }

  activeConversationId.value = conversations.value[0].id
}

const saveConversations = () => {
  const saved = conversations.value
    .filter((item) => item.messages.length || item.id === activeConversationId.value)
    .map((conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => ({
        ...message,
        attachments: message.attachments?.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          sizeLabel: file.sizeLabel,
          type: file.type,
          kind: file.kind,
          previewUrl: '',
        })) || [],
      })),
    }))
    .slice(0, 20)

  localStorage.setItem(activeStorageKey.value, JSON.stringify(saved))
}

const goHome = () => {
  router.push({ name: 'home' })
}

const openCustomerService = () => {
  router.push({
    name: 'chat',
    query: { mode: 'service' },
  })
}

const openAiSelfService = () => {
  const q = latestServiceQuestion.value.trim()
  router.push({
    name: 'chat',
    query: q ? { mode: 'ai', q } : { mode: 'ai' },
  })
}

const initCustomerService = async () => {
  if (serviceConnecting.value || serviceUserInfo.value) return

  serviceConnecting.value = true
  serviceConnectionError.value = ''

  try {
    const token = getLocal('TOKEN')
    if (token) {
      const userInfo = JSON.parse(getLocal('userInfo'))
      serviceUserInfo.value = userInfo
      connectCustomerService(userInfo)
      return
    }

    const ua = new UAParser()
    const uaInfo = ua.getResult()
    const ruleForm = {
      browser: uaInfo.browser.name,
      sys: `${uaInfo.os.name || ''}${uaInfo.os.version || ''}`,
      machine: `${window.screen.width}*${window.screen.height}`,
    }
    const code = getLocal('invitation_codes')

    if (getLocal('chat_info') && !code) {
      const chatInfo = JSON.parse(getLocal('chat_info'))
      ruleForm.id = chatInfo.chat_id
      serviceUserInfo.value = {
        id: chatInfo.chat_id,
        manage: { id: chatInfo.manage.id },
        token: null,
      }
      setLocal('manageNew', chatInfo.manage)
      connectCustomerService(serviceUserInfo.value, ruleForm, chatInfo.manage)
      return
    }

    const res = await getNoLoginId({ type: 1, code })
    const data = res.data.data
    setLocal('chat_info', data)
    setLocal('manageNew', data.manage)
    removeLocal('invitation_codes')

    ruleForm.id = data.chat_id
    serviceUserInfo.value = {
      id: data.chat_id,
      manage: { id: data.manage.id },
      token: null,
    }
    connectCustomerService(serviceUserInfo.value, ruleForm, data.manage)
  } catch (error) {
    serviceConnectionError.value = 'Customer service connection failed. Please refresh or contact us on WhatsApp.'
  } finally {
    serviceConnecting.value = false
  }
}

const stopCustomerService = () => {
  disconnectCustomerService()
  serviceUserInfo.value = null
  serviceConnecting.value = false
  serviceConnectionError.value = ''
  pendingServiceMessages.value = []
  queuedServiceMessages.value = []
}

const toggleRecentChats = () => {
  recentCollapsed.value = !recentCollapsed.value
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const updateConversation = (updater) => {
  const target = activeConversation.value
  if (!target) return
  updater(target)
  target.updatedAt = Date.now()
  saveConversations()
}

const buildTitle = (message) => {
  const clean = message.replace(/\s+/g, ' ').trim()
  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean || 'New Chat'
}

const appendMessage = (message) => {
  updateConversation((conversation) => {
    conversation.messages.push(message)
    if (message.role === 'user' && conversation.title === 'New Chat') {
      conversation.title = buildTitle(message.content)
    }
  })
  scrollToBottom()
}

const replaceMessage = (id, patch) => {
  updateConversation((conversation) => {
    const index = conversation.messages.findIndex((item) => item.id === id)
    if (index !== -1) conversation.messages[index] = { ...conversation.messages[index], ...patch }
  })
}

const startNewChat = () => {
  const fresh = createConversation()
  conversations.value = [fresh, ...conversations.value.filter((item) => item.messages.length)]
  activeConversationId.value = fresh.id
  inputValue.value = ''
  clearAttachments()
  errorMessage.value = ''
  retryQuestion.value = ''
  serviceNotice.value = ''
  voiceError.value = ''
  saveConversations()
  nextTick(() => textareaRef.value?.focus())
}

const selectConversation = (id) => {
  activeConversationId.value = id
  errorMessage.value = ''
  retryQuestion.value = ''
  serviceNotice.value = ''
  scrollToBottom()
}

const openAction = (href) => {
  if (!href) return
  if (/^https?:\/\//i.test(href)) {
    window.open(href, '_blank', 'noopener')
    return
  }
  window.location.href = href
}

const formatFileSize = (size) => {
  if (!size) return '0 KB'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const addFiles = (fileList, kind) => {
  const nextFiles = Array.from(fileList || []).slice(0, 5)
  const mapped = nextFiles.map((file) => ({
    id: nowId(),
    name: file.name,
    size: file.size,
    sizeLabel: formatFileSize(file.size),
    type: file.type || 'application/octet-stream',
    kind: kind || (file.type?.startsWith('image/') ? 'image' : 'file'),
    previewUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file) : '',
    rawFile: file,
  }))

  attachedFiles.value = [...attachedFiles.value, ...mapped].slice(0, 6)
}

const handleFileSelect = (event) => {
  addFiles(event.target.files, 'file')
  event.target.value = ''
}

const handleImageSelect = (event) => {
  addFiles(event.target.files, 'image')
  event.target.value = ''
}

const removeAttachment = (id) => {
  const target = attachedFiles.value.find((item) => item.id === id)
  if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
  attachedFiles.value = attachedFiles.value.filter((item) => item.id !== id)
}

function clearAttachments() {
  attachedFiles.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
  attachedFiles.value = []
}

const buildAttachmentContext = (files) => {
  if (!files.length) return ''
  return files.map((file) => `${file.kind}: ${file.name} (${file.sizeLabel}, ${file.type})`).join('\n')
}

const prepareOutgoingAttachments = () => attachedFiles.value.map((file) => ({
  ...file,
  previewUrl: file.rawFile && file.previewUrl ? URL.createObjectURL(file.rawFile) : file.previewUrl,
}))

const sanitizeAttachments = (files) => files.map((file) => ({
  id: file.id,
  name: file.name,
  size: file.size,
  sizeLabel: file.sizeLabel,
  type: file.type,
  kind: file.kind,
  previewUrl: file.previewUrl,
}))

const uploadCustomerServiceAttachment = async (file) => {
  if (!file.rawFile) return null

  const formData = new FormData()
  formData.append('file', file.rawFile)

  const response = await fetch('https://mini.cargosoon.online/api/mini/Login/upload_chat', {
    method: 'POST',
    body: formData,
  })
  const data = await response.json()
  if (data.code !== '0') return null

  const rawPath = data.data.image
  const url = `https://mini.cargosoon.online/api${rawPath.substring(1)}`

  return {
    url,
    fileName: data.data.file_name || file.name,
    fileSize: data.data.file_size || file.sizeLabel,
    fileType: data.data.file_type || file.type,
    isImage: file.kind === 'image' || file.type?.startsWith('image/'),
  }
}

const sendCustomerServiceAttachments = async (files) => {
  for (const file of files) {
    const uploaded = await uploadCustomerServiceAttachment(file)
    if (!uploaded) continue

    if (uploaded.isImage) {
      sendCustomerServiceFile(1, uploaded.url)
    } else {
      sendCustomerServiceFile(2, uploaded.url, {
        file_name: uploaded.fileName,
        file_size: uploaded.fileSize,
        file_type: uploaded.fileType,
      })
    }
  }
}

const deliverLiveCustomerServiceMessage = async (question, outgoingAttachments) => {
  const attachmentContext = buildAttachmentContext(outgoingAttachments)
  const outboundText = attachmentContext ? `${question}\n\nUploaded attachments:\n${attachmentContext}` : question
  const sent = sendCustomerServiceChatMsg(outboundText, serviceUserInfo.value)

  if (!sent) {
    return false
  }

  pendingServiceMessages.value.push({
    id: `pending-service-${nowId()}`,
    role: 'user',
    content: question,
    rawContent: outboundText,
    attachments: sanitizeAttachments(outgoingAttachments),
    status: 'done',
    createdAt: Date.now(),
  })

  await scrollToBottom()

  if (outgoingAttachments.length) {
    sendCustomerServiceAttachments(outgoingAttachments).catch(() => {
      errorMessage.value = 'Message sent. Some attachments could not be uploaded, please resend them if needed.'
    })
  }

  return true
}

const queueCustomerServiceMessage = (question, outgoingAttachments) => {
  queuedServiceMessages.value.push({
    id: nowId(),
    question,
    attachments: outgoingAttachments,
  })
}

const sendLiveCustomerServiceMessage = async (question, outgoingAttachments) => {
  if (!serviceUserInfo.value && !serviceConnecting.value) {
    initCustomerService()
  }

  if (!serviceConnected.value || !serviceUserInfo.value) {
    queueCustomerServiceMessage(question, outgoingAttachments)
    serviceNotice.value = 'CargoSoon AI has replied first. Customer service is connecting and will receive this message once the live chat is ready.'
    return false
  }

  const delivered = await deliverLiveCustomerServiceMessage(question, outgoingAttachments)
  if (!delivered) {
    queueCustomerServiceMessage(question, outgoingAttachments)
    serviceNotice.value = 'CargoSoon AI has replied first. Customer service is reconnecting and will receive this message once connected.'
  }

  return delivered
}

const drainQueuedServiceMessages = async () => {
  if (!serviceConnected.value || !serviceUserInfo.value || !queuedServiceMessages.value.length) return

  const nextQueue = [...queuedServiceMessages.value]
  queuedServiceMessages.value = []

  for (const item of nextQueue) {
    const delivered = await deliverLiveCustomerServiceMessage(item.question, item.attachments)
    if (!delivered) {
      queuedServiceMessages.value = [item, ...nextQueue.slice(nextQueue.indexOf(item) + 1)]
      serviceNotice.value = 'CargoSoon AI has replied first. Customer service is reconnecting and will receive this message once connected.'
      return
    }
  }
}

const getSpeechRecognition = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition
}

const toggleVoiceInput = () => {
  voiceError.value = ''
  const SpeechRecognition = getSpeechRecognition()

  if (!SpeechRecognition) {
    voiceError.value = 'Voice recognition is not supported in this browser.'
    return
  }

  if (isListening.value && recognition) {
    recognition.stop()
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = true
  recognition.continuous = false

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || '')
      .join('')
      .trim()
    if (transcript) inputValue.value = transcript
  }

  recognition.onerror = () => {
    voiceError.value = 'Voice recognition stopped. Please try again.'
    isListening.value = false
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}

const askAssistant = async (text) => {
  const outgoingAttachments = prepareOutgoingAttachments()
  const question = (text || inputValue.value).trim() || (outgoingAttachments.length ? 'Please review the uploaded attachment and help with this logistics request.' : '')
  if (!question || loading.value) return

  errorMessage.value = ''
  retryQuestion.value = ''
  serviceNotice.value = ''
  voiceError.value = ''
  inputValue.value = ''
  clearAttachments()

  appendMessage({
    id: nowId(),
    role: 'user',
    content: question,
    attachments: outgoingAttachments,
    createdAt: Date.now(),
  })

  sendLiveCustomerServiceMessage(question, outgoingAttachments).catch(() => {
    serviceNotice.value = 'CargoSoon AI has replied first. Customer service can follow up here once the live connection is ready.'
  })

  const assistantId = nowId()
  appendMessage({
    id: assistantId,
    role: 'assistant',
    assistantType: 'ai',
    content: '',
    intent: '',
    actions: [],
    suggestions: [],
    status: 'loading',
    createdAt: Date.now(),
  })

  loading.value = true

  try {
    const requestPayload = {
      message: buildAttachmentContext(outgoingAttachments) ? `${question}\n\nUploaded attachments:\n${buildAttachmentContext(outgoingAttachments)}` : question,
      messages: activeMessages.value.filter((item) => item.status !== 'loading'),
      conversationId: activeConversationId.value,
      attachments: sanitizeAttachments(outgoingAttachments),
    }
    const reply = await sendAiMessage(requestPayload)

    if (reply.fallback && reply.serviceError) {
      serviceNotice.value = 'Live AI service is unavailable, so CargoSoon is showing an offline assistant reply.'
    }

    replaceMessage(assistantId, {
      content: reply.content,
      intent: reply.intent,
      actions: reply.actions || [],
      suggestions: reply.suggestions || [],
      source: reply.source,
      status: 'done',
    })
  } catch (error) {
    errorMessage.value = error.message || 'AI reply failed. Please try again.'
    retryQuestion.value = question
    replaceMessage(assistantId, {
      content: 'I could not complete this reply. Please retry the request.',
      status: 'error',
      actions: [],
      suggestions: [],
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const retryLastQuestion = () => {
  const question = retryQuestion.value
  if (!question) return
  retryQuestion.value = ''
  errorMessage.value = ''
  askAssistant(question)
}

const useSuggestion = (text) => {
  askAssistant(text)
}

const submitMessage = () => {
  askAssistant()
}

const insertLineBreak = (event) => {
  event.preventDefault()
  inputValue.value += '\n'
}

const handleInitialQuestion = () => {
  const query = Array.isArray(route.query.q) ? route.query.q[0] : route.query.q
  const clean = (query || '').trim()
  if (!clean || clean === handledInitialQuestion.value) return

  handledInitialQuestion.value = clean
  startNewChat()
  askAssistant(clean)
  router.replace({
    name: 'chat',
    query: isServiceMode.value ? { mode: 'service' } : {},
  })
}

watch(() => route.query.q, (value) => {
  if (!value) handledInitialQuestion.value = ''
  handleInitialQuestion()
})

watch(() => route.query.mode, () => {
  initCustomerService()
  loadConversations()
  inputValue.value = ''
  clearAttachments()
  errorMessage.value = ''
  retryQuestion.value = ''
  serviceNotice.value = ''
  voiceError.value = ''
  nextTick(() => textareaRef.value?.focus())
})

watch(serviceChatList, () => {
  if (!pendingServiceMessages.value.length) return

  pendingServiceMessages.value = pendingServiceMessages.value.filter((pending) => {
    return !serviceChatList.value.some((message) => {
      return message.is_me === 1 && normalizeServiceMessageContent(message) === pending.rawContent
    })
  })
}, { deep: true })

watch([serviceConnected, serviceUserInfo], () => {
  drainQueuedServiceMessages()
})

watch(activeMessages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  loadConversations()
  initCustomerService()
  handleInitialQuestion()
  nextTick(() => textareaRef.value?.focus())
})

onBeforeUnmount(() => {
  clearAttachments()
  stopCustomerService()
  recognition?.stop?.()
})
</script>

<template>
  <div class="ai-page">
    <aside class="ai-sidebar">
      <button class="home-btn" type="button" @click="goHome">
        <Back class="btn-icon" aria-hidden="true" />
        Home
      </button>

      <button class="new-chat-btn" type="button" @click="startNewChat">
        <Plus class="btn-icon" aria-hidden="true" />
        New Chat
      </button>

      <div class="sidebar-section">
        <button
          class="sidebar-title recent-toggle"
          type="button"
          :aria-expanded="!recentCollapsed"
          @click="toggleRecentChats"
        >
          <span class="sidebar-title-left">
            <Clock class="section-icon" aria-hidden="true" />
            {{ recentTitle }}
          </span>
          <span class="recent-count">{{ recentChats.length }}</span>
          <ArrowDown v-if="!recentCollapsed" class="section-icon" aria-hidden="true" />
          <ArrowRight v-else class="section-icon" aria-hidden="true" />
        </button>
        <div v-if="!recentCollapsed && recentChats.length" class="recent-list">
          <button
            v-for="item in recentChats"
            :key="item.id"
            :class="['recent-item', { active: item.id === activeConversationId }]"
            type="button"
            @click="selectConversation(item.id)"
          >
            {{ item.title }}
          </button>
        </div>
        <div v-else-if="!recentCollapsed" class="empty-history">No recent chats yet</div>
      </div>

      <div class="sidebar-section shortcut-section">
        <button
          v-for="item in activeSidebarShortcuts"
          :key="item.key"
          class="shortcut-btn"
          type="button"
          @click="askAssistant(item.prompt)"
        >
          <ChatDotRound class="section-icon" aria-hidden="true" />
          {{ item.label }}
        </button>
      </div>
    </aside>

    <main class="ai-main">
      <header class="ai-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
          <div v-if="isServiceMode" class="service-status">
            <span :class="['service-status-dot', { connected: serviceConnected }]"></span>
            <img v-if="serviceAvatarUrl" :src="serviceAvatarUrl" alt="">
            <span>{{ serviceConnectionNotice }}</span>
          </div>
        </div>
      </header>

      <div ref="messageListRef" class="message-list">
        <section v-if="!hasMessages" class="empty-state">
          <div class="empty-mark">
            <ChatDotRound aria-hidden="true" />
          </div>
          <h2>{{ emptyTitle }}</h2>
          <div class="starter-grid">
            <button
              v-for="prompt in activeStarterPrompts"
              :key="prompt"
              type="button"
              @click="useSuggestion(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </section>

        <div v-else class="messages">
          <article
            v-for="message in activeMessages"
            :key="message.id"
            :class="['message-row', message.role]"
          >
            <div
              v-if="message.role === 'assistant'"
              :class="['message-avatar', { 'has-image': getAssistantAvatar(message) }]"
            >
              <img
                v-if="getAssistantAvatar(message)"
                :src="getAssistantAvatar(message)"
                alt=""
              >
              <span v-else>{{ getAssistantInitials(message) }}</span>
            </div>
            <div class="message-bubble">
              <div v-if="message.status === 'loading'" class="typing-state">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <template v-else>
                <div class="message-content">{{ message.content }}</div>

                <div v-if="message.attachments?.length" class="message-attachments">
                  <div
                    v-for="file in message.attachments"
                    :key="file.id"
                    class="message-attachment"
                  >
                    <img
                      v-if="file.kind === 'image' && file.previewUrl"
                      :src="file.previewUrl"
                      :alt="file.name"
                    >
                    <div v-else class="file-thumb">
                      <Paperclip aria-hidden="true" />
                    </div>
                    <div class="attachment-meta">
                      <span>{{ file.name }}</span>
                      <small>{{ file.sizeLabel }}</small>
                    </div>
                  </div>
                </div>

                <div v-if="message.intent" class="intent-chip">{{ message.intent }}</div>

                <div v-if="message.actions?.length" class="message-actions">
                  <button
                    v-for="action in message.actions"
                    :key="action.label"
                    type="button"
                    @click="openAction(action.href)"
                  >
                    {{ action.label }}
                  </button>
                </div>

                <div v-if="message.suggestions?.length" class="suggestion-row">
                  <button
                    v-for="suggestion in message.suggestions"
                    :key="suggestion"
                    type="button"
                    @click="useSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </template>
            </div>
          </article>

          <div v-if="showAiSelfHelpPrompt" class="self-help-panel">
            <div>
              <strong>AI replied first. Customer service is reviewing.</strong>
              <span>Keep chatting here; AI answers instantly and a CargoSoon specialist can follow up in the same conversation.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="composer-wrap">
        <div v-if="serviceNotice" class="notice-line">
          {{ serviceNotice }}
        </div>
        <div v-if="voiceError" class="notice-line">
          {{ voiceError }}
        </div>
        <div v-if="errorMessage" class="error-line">
          <span>{{ errorMessage }}</span>
          <button type="button" @click="retryLastQuestion">
            <RefreshRight class="btn-icon" aria-hidden="true" />
            Retry
          </button>
        </div>

        <input
          ref="fileInputRef"
          class="hidden-input"
          type="file"
          multiple
          @change="handleFileSelect"
        >
        <input
          ref="imageInputRef"
          class="hidden-input"
          type="file"
          accept="image/*"
          multiple
          @change="handleImageSelect"
        >

        <div class="composer">
          <div v-if="attachedFiles.length" class="composer-attachments">
            <div
              v-for="file in attachedFiles"
              :key="file.id"
              class="composer-attachment"
            >
              <img
                v-if="file.kind === 'image' && file.previewUrl"
                :src="file.previewUrl"
                :alt="file.name"
              >
              <div v-else class="file-thumb">
                <Paperclip aria-hidden="true" />
              </div>
              <div class="attachment-meta">
                <span>{{ file.name }}</span>
                <small>{{ file.sizeLabel }}</small>
              </div>
              <button type="button" class="remove-file-btn" @click="removeAttachment(file.id)">
                <Close aria-hidden="true" />
              </button>
            </div>
          </div>

          <textarea
            ref="textareaRef"
            v-model="inputValue"
            rows="2"
            :placeholder="composerPlaceholder"
            @keydown.enter.exact.prevent="submitMessage"
            @keydown.ctrl.enter="insertLineBreak"
          ></textarea>

          <div class="composer-footer">
            <div class="composer-tools">
              <button
                type="button"
                class="tool-btn"
                :class="{ active: isListening }"
                title="Voice input"
                @click="toggleVoiceInput"
              >
                <Microphone aria-hidden="true" />
              </button>
              <button
                type="button"
                class="tool-btn"
                title="Upload file"
                @click="triggerFileUpload"
              >
                <Paperclip aria-hidden="true" />
              </button>
              <button
                type="button"
                class="tool-btn"
                title="Upload image"
                @click="triggerImageUpload"
              >
                <Picture aria-hidden="true" />
              </button>
              <button
                v-if="!isServiceMode"
                type="button"
                class="service-entry-btn"
                title="Customer service"
                @click="openCustomerService"
              >
                <Headset aria-hidden="true" />
                <span>Customer Service</span>
              </button>
            </div>

            <button
              class="send-btn"
              type="button"
              :disabled="!canSend"
              @click="submitMessage"
            >
              <Position class="send-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ai-page {
  height: 100vh;
  min-height: 640px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background: #ffffff;
  color: #0d0d0d;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
}

.ai-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 14px;
  border-right: 1px solid #e5e5e5;
  background: #f9f9f9;
  overflow-y: auto;
}

.home-btn,
.new-chat-btn,
.shortcut-btn,
.recent-item,
.error-line button,
.message-actions button,
.suggestion-row button,
.starter-grid button,
.tool-btn,
.remove-file-btn,
.send-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.home-btn {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border-radius: 10px;
  background: transparent;
  color: #40414f;
  font-size: 14px;
  transition: background 0.15s ease;
}

.home-btn:hover {
  background: #ececec;
}

.new-chat-btn {
  width: 100%;
  height: 40px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 10px;
  border-radius: 10px;
  background: #ffffff;
  color: #0d0d0d;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.18s ease, box-shadow 0.18s ease;
}

.new-chat-btn:hover {
  background: #ececec;
  box-shadow: none;
}

.btn-icon,
.section-icon,
.send-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.sidebar-section {
  margin-top: 22px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  width: 100%;
  padding: 0 8px 10px;
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.recent-toggle {
  background: transparent;
  cursor: pointer;
}

.sidebar-title-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.recent-count {
  margin-left: auto;
  color: #a3a3a3;
  font-size: 11px;
  font-weight: 500;
}

.recent-list,
.shortcut-section {
  display: grid;
  gap: 6px;
}

.recent-item,
.shortcut-btn {
  width: 100%;
  min-height: 38px;
  padding: 9px 10px;
  border-radius: 8px;
  background: transparent;
  color: #40414f;
  font-size: 13px;
  line-height: 1.35;
  text-align: left;
  transition: background 0.16s ease, color 0.16s ease;
}

.recent-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item:hover,
.recent-item.active,
.shortcut-btn:hover {
  background: #ececec;
  color: #0d0d0d;
}

.shortcut-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-history {
  padding: 8px;
  color: #98a2b3;
  font-size: 13px;
}

.ai-main {
  min-width: 0;
  height: 100vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.ai-header {
  flex: 0 0 auto;
  padding: 26px clamp(24px, 6vw, 72px) 16px;
  border-bottom: 1px solid #ececec;
}

.ai-header h1 {
  margin: 0;
  color: #0d0d0d;
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
}

.ai-header p {
  max-width: 680px;
  margin: 8px 0 0;
  color: #676767;
  font-size: 15px;
  line-height: 1.55;
}

.service-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 4px 9px 4px 7px;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
  background: #ffffff;
  color: #676767;
  font-size: 12px;
  line-height: 1.4;
}

.service-status img {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

.service-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c9c9c9;
}

.service-status-dot.connected {
  background: #20b26b;
}

.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px clamp(18px, 6vw, 72px) 168px;
}

.empty-state {
  max-width: 760px;
  margin: 7vh auto 0;
  text-align: center;
}

.empty-mark {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff3eb;
  color: #f26a1b;
}

.empty-mark svg {
  width: 26px;
  height: 26px;
}

.empty-state h2 {
  margin: 0 0 22px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: 0;
}

.starter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.starter-grid button {
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: #ffffff;
  color: #40414f;
  font-size: 14px;
  line-height: 1.35;
  text-align: left;
  transition: border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
}

.starter-grid button:hover {
  border-color: #d0d0d0;
  color: #0d0d0d;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.messages {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.message-row {
  display: flex;
  align-items: flex-start;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
  gap: 12px;
}

.message-avatar {
  width: 28px;
  height: 28px;
  margin-top: 2px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f26a1b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-avatar.has-image {
  background: #f4f4f4;
}

.message-bubble {
  max-width: min(720px, 88%);
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.message-row.user .message-bubble {
  background: #f4f4f4;
  color: #0d0d0d;
}

.message-row.assistant .message-bubble {
  max-width: min(760px, calc(100% - 40px));
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #0d0d0d;
  box-shadow: none;
}

.message-content {
  white-space: pre-wrap;
}

.message-attachments,
.composer-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  white-space: normal;
}

.message-attachment,
.composer-attachment {
  min-width: 210px;
  max-width: 280px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: #ffffff;
}

.message-attachment img,
.composer-attachment img {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 8px;
  object-fit: cover;
  background: #f4f4f4;
}

.file-thumb {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f4f4f4;
  color: #676767;
}

.file-thumb svg {
  width: 18px;
  height: 18px;
}

.attachment-meta {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.attachment-meta span {
  overflow: hidden;
  color: #0d0d0d;
  font-size: 13px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-meta small {
  color: #8a8a8a;
  font-size: 12px;
}

.typing-state {
  width: 54px;
  height: 24px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.typing-state span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f26a1b;
  opacity: 0.3;
  animation: typingPulse 1s infinite ease-in-out;
}

.typing-state span:nth-child(2) {
  animation-delay: 0.14s;
}

.typing-state span:nth-child(3) {
  animation-delay: 0.28s;
}

.intent-chip {
  display: inline-flex;
  margin-top: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fff3eb;
  color: #c24f10;
  font-size: 12px;
  line-height: 1.5;
}

.message-actions,
.suggestion-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  white-space: normal;
}

.message-actions button {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #0d0d0d;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.suggestion-row button {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
  background: #ffffff;
  color: #40414f;
  font-size: 12px;
}

.self-help-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 2px 0 6px 40px;
  padding: 12px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  background: #fafafa;
  color: #40414f;
}

.self-help-panel div {
  display: grid;
  gap: 2px;
}

.self-help-panel strong {
  color: #0d0d0d;
  font-size: 13px;
  font-weight: 600;
}

.self-help-panel span {
  font-size: 13px;
  line-height: 1.4;
}

.self-help-panel button {
  min-height: 34px;
  flex: 0 0 auto;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #0d0d0d;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
}

.composer-wrap {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 260px;
  padding: 12px clamp(18px, 6vw, 72px) 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 32%, #ffffff 100%);
}

.composer,
.error-line,
.notice-line {
  max-width: 820px;
  margin: 0 auto;
}

.notice-line,
.error-line {
  margin-bottom: 8px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.notice-line {
  padding: 9px 12px;
  background: #f7f7f7;
  color: #40414f;
}

.error-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px 8px 12px;
  background: #fff1f0;
  color: #b42318;
}

.error-line button {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 7px;
  background: #b42318;
  color: #ffffff;
  font-size: 12px;
}

.composer {
  min-height: 104px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.composer textarea {
  width: 100%;
  max-height: 140px;
  min-height: 48px;
  padding: 6px 2px;
  border: 0;
  outline: 0;
  resize: none;
  color: #1f2937;
  font: inherit;
  font-size: 15px;
  line-height: 1.45;
}

.composer textarea::placeholder {
  color: #98a2b3;
}

.hidden-input {
  display: none;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-btn,
.service-entry-btn,
.remove-file-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: #676767;
  transition: background 0.15s ease, color 0.15s ease;
}

.tool-btn:hover,
.tool-btn.active {
  background: #f4f4f4;
  color: #0d0d0d;
}

.tool-btn.active {
  color: #f26a1b;
}

.tool-btn svg,
.service-entry-btn svg,
.remove-file-btn svg {
  width: 18px;
  height: 18px;
}

.service-entry-btn {
  width: auto;
  height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  background: transparent;
  color: #676767;
  font-size: 13px;
  transition: background 0.15s ease, color 0.15s ease;
}

.service-entry-btn:hover {
  background: #f4f4f4;
  color: #0d0d0d;
}

.composer-attachments {
  width: 100%;
  margin-top: 0;
}

.composer-attachment {
  position: relative;
  padding-right: 38px;
}

.remove-file-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: #f4f4f4;
}

.send-btn {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #0d0d0d;
  color: #ffffff;
  transition: background 0.18s ease, opacity 0.18s ease;
}

.send-btn:disabled {
  cursor: default;
  opacity: 0.38;
}

.send-btn:not(:disabled):hover {
  background: #2f2f2f;
}

@keyframes typingPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 900px) {
  .ai-page {
    height: 100vh;
    min-height: 620px;
    grid-template-columns: 1fr;
  }

  .ai-sidebar {
    position: relative;
    top: auto;
    height: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-right: 0;
    border-bottom: 1px solid #ece7df;
    overflow-x: auto;
  }

  .new-chat-btn {
    width: auto;
    min-width: 116px;
    height: 38px;
    padding: 0 12px;
  }

  .sidebar-section {
    margin-top: 0;
  }

  .sidebar-title,
  .empty-history,
  .recent-list {
    display: none;
  }

  .shortcut-section {
    display: flex;
    gap: 8px;
  }

  .shortcut-btn {
    width: auto;
    min-width: max-content;
    min-height: 36px;
    padding: 8px 10px;
    border: 1px solid #ece7df;
    background: #ffffff;
  }

  .ai-header {
    padding: 20px 18px 14px;
  }

  .message-list {
    padding: 20px 14px 150px;
  }

  .composer-wrap {
    left: 0;
    padding: 10px 12px 16px;
  }
}

@media (max-width: 620px) {
  .ai-page {
    height: 100vh;
    min-height: 580px;
  }

  .ai-header h1 {
    font-size: 23px;
  }

  .ai-header p {
    font-size: 13px;
  }

  .starter-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    margin-top: 4vh;
  }

  .message-bubble {
    max-width: 92%;
    font-size: 14px;
  }

  .composer {
    min-height: 64px;
  }
}
</style>
