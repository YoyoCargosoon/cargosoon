import { reactive } from 'vue'
import { ADMIN_STORAGE_KEY, initialAdminState } from '@/mock/adminData'

const deepClone = (value) => JSON.parse(JSON.stringify(value))
const getStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage || null
  } catch {
    return null
  }
}

const pad = (value) => String(value).padStart(2, '0')

const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const createAdminState = () => {
  const storage = getStorage()
  if (!storage) {
    return deepClone(initialAdminState)
  }

  const raw = storage.getItem(ADMIN_STORAGE_KEY)
  if (!raw) {
    const fresh = deepClone(initialAdminState)
    storage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }

  try {
    return JSON.parse(raw)
  } catch {
    const fresh = deepClone(initialAdminState)
    storage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }
}

const adminState = reactive(createAdminState())

export const readAdminState = () => adminState

export const writeAdminState = (state) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state))
}

export const mutateAdminState = (updater) => {
  const snapshot = deepClone(adminState)
  const next = updater(snapshot) || snapshot

  Object.keys(adminState).forEach((key) => {
    delete adminState[key]
  })
  Object.assign(adminState, next)

  writeAdminState(adminState)
  return adminState
}

export const resetAdminState = () => {
  const fresh = deepClone(initialAdminState)
  Object.keys(adminState).forEach((key) => {
    delete adminState[key]
  })
  Object.assign(adminState, fresh)
  writeAdminState(adminState)
  return adminState
}

export const submitFeedbackTicket = (payload) => {
  const now = new Date()
  const createdAt = formatDateTime(now)

  return mutateAdminState((state) => {
    const ticket = {
      id: `fb-${Date.now()}`,
      userId: payload.userId || 'guest-user',
      customerName: payload.customerName || 'Guest User',
      sourcePage: payload.sourcePage || '/',
      sourceModule: payload.sourceModule || 'site-feedback',
      feedbackType: payload.feedbackType || 'other',
      content: payload.content || '',
      status: 'open',
      priority: payload.priority || 'medium',
      handlerName: payload.handlerName || 'Pending assignment',
      createdAt,
    }

    state.feedbackTickets.unshift(ticket)
    state.stats.feedbackOpen = state.feedbackTickets.filter((item) =>
      ['open', 'processing'].includes(item.status),
    ).length
    state.userEvents.unshift({
      id: `evt-feedback-${Date.now()}`,
      userId: ticket.userId,
      customerName: ticket.customerName,
      eventName: 'feedback_submit',
      pagePath: ticket.sourcePage,
      durationSeconds: 0,
      countryCode: payload.countryCode || 'N/A',
      createdAt,
    })

    return state
  })
}

export const addInternalMessage = (payload) => {
  const now = new Date()
  const createdAt = formatDateTime(now)

  return mutateAdminState((state) => {
    const message = {
      id: `msg-${Date.now()}`,
      author: payload.author || '未命名成员',
      team: payload.team || '未分组',
      topic: payload.topic || '内部同步',
      content: payload.content || '',
      createdAt,
      replies: payload.replies || [],
    }

    if (!Array.isArray(state.internalMessages)) {
      state.internalMessages = []
    }

    state.internalMessages.unshift(message)
    return state
  })
}

export const replyInternalMessage = ({ messageId, author, content }) => {
  const now = new Date()
  const createdAt = formatDateTime(now)

  return mutateAdminState((state) => {
    const message = (state.internalMessages || []).find((item) => item.id === messageId)
    if (!message) {
      return state
    }

    if (!Array.isArray(message.replies)) {
      message.replies = []
    }

    message.replies.push({
      id: `reply-${Date.now()}`,
      author: author || '未命名成员',
      content: content || '',
      createdAt,
    })

    return state
  })
}

export const pushFeedbackToInternalChat = ({ ticketId, author }) => {
  const state = readAdminState()
  const ticket = (state.feedbackTickets || []).find((item) => item.id === ticketId)
  if (!ticket) {
    return state
  }

  return addInternalMessage({
    author: author || '客服转发',
    team: '客服',
    topic: '客户反馈',
    content: `从反馈工单转入：${ticket.customerName} / ${ticket.feedbackType} / ${ticket.content}`,
    replies: [],
  })
}
