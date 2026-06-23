import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ADMIN_SESSION_KEY } from '@/mock/adminData.js'
import { adminMenus } from '@/mock/adminConfig.js'
import { adminAuthService } from '@/services/adminAuthService'

const readSession = () => {
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeSession = (session) => {
  if (!session) {
    window.localStorage.removeItem(ADMIN_SESSION_KEY)
    return
  }
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export const useAdminStore = defineStore('admin', () => {
  const session = ref(readSession())
  const profile = ref(session.value?.profile || null)
  const isBootstrapping = ref(false)

  const currentUser = computed(() => {
    return profile.value?.user || null
  })

  const roleCodes = computed(() => currentUser.value?.roleCodes || [])
  const roleObjects = computed(() => profile.value?.roles || [])
  const permissions = computed(() => profile.value?.permissions || [])

  const hasPermission = (permission) =>
    permissions.value.includes('*') || permissions.value.includes(permission)

  const allowedMenus = computed(() =>
    adminMenus.filter((item) => hasPermission(item.permission)),
  )

  const persistSession = (payload) => {
    const nextSession = {
      userId: payload.user.id,
      loggedInAt: new Date().toISOString(),
      token: payload.token || '',
      refreshToken: payload.refreshToken || '',
      profile: {
        user: payload.user,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
      },
    }
    session.value = nextSession
    profile.value = nextSession.profile
    writeSession(nextSession)
  }

  const login = async ({ account, password }) => {
    const result = await adminAuthService.login({ account, password })
    if (!result.ok) {
      return result
    }

    persistSession(result)
    return { ok: true }
  }

  const bootstrap = async () => {
    if (!session.value?.userId || isBootstrapping.value) {
      return Boolean(session.value?.userId)
    }

    isBootstrapping.value = true
    try {
      const result = await adminAuthService.getProfile(session.value.userId)
      if (!result.ok) {
        session.value = null
        profile.value = null
        writeSession(null)
        return false
      }

      persistSession({
        ...result,
        token: session.value?.token,
        refreshToken: session.value?.refreshToken,
      })
      return true
    } finally {
      isBootstrapping.value = false
    }
  }

  const logout = async () => {
    await adminAuthService.logout()
    session.value = null
    profile.value = null
    writeSession(null)
  }

  return {
    session,
    profile,
    currentUser,
    allowedMenus,
    permissions,
    roleCodes,
    roleObjects,
    isBootstrapping,
    hasPermission,
    login,
    bootstrap,
    logout,
  }
})
