
const getStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage || null
  } catch {
    return null
  }
}

export function setLocal(name, obj) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(name, JSON.stringify(obj))
}

export function getLocal(name) {
  const storage = getStorage()
  if (!storage) return null
  return storage.getItem(name)
}

export function clearLocal() {
  const storage = getStorage()
  if (!storage) return
  storage.clear()
}

export function removeLocal(name) {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(name)
}
