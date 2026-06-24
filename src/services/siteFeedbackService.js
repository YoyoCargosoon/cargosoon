const SITE_FEEDBACK_KEY = 'cargosoon-site-feedback'

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

const readFeedbackList = () => {
  const storage = getStorage()
  if (!storage) {
    return []
  }

  const raw = storage.getItem(SITE_FEEDBACK_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const submitSiteFeedback = (payload) => {
  const storage = getStorage()
  if (!storage) {
    return
  }

  const list = readFeedbackList()
  list.unshift({
    id: `feedback-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  })
  storage.setItem(SITE_FEEDBACK_KEY, JSON.stringify(list))
}
