import { adminUsers } from '@/mock/adminData.js'
import { adminRoleCatalog } from '@/mock/adminConfig.js'
import { adminLoginRequest, adminLogoutRequest, adminProfileRequest } from '@/api/adminAuth'

const ADMIN_AUTH_MODE = import.meta.env.VITE_ADMIN_AUTH_MODE || 'mock'

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const buildPermissionSnapshot = (user) => {
  const roles = adminRoleCatalog.filter((item) => user.roleCodes.includes(item.code))
  const permissions = roles.some((item) => item.permissions.includes('*'))
    ? ['*']
    : roles.flatMap((item) => item.permissions)

  return {
    user: {
      id: user.id,
      name: user.name,
      nameCn: user.nameCn,
      email: user.email,
      phone: user.phone,
      roleCodes: user.roleCodes,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp,
    },
    roles: roles.map((item) => ({
      code: item.code,
      name: item.name,
      dataScope: item.dataScope,
    })),
    permissions,
  }
}

const loginMock = async ({ account, password }) => {
  await sleep(220)
  const normalizedAccount = String(account || '').trim().toLowerCase()
  const match = adminUsers.find(
    (item) =>
      item.status === 'active' &&
      item.email.toLowerCase() === normalizedAccount &&
      item.password === password,
  )

  if (!match) {
    return {
      ok: false,
      message: 'Account or password is incorrect.',
    }
  }

  return {
    ok: true,
    token: `mock-admin-token-${match.id}`,
    refreshToken: `mock-admin-refresh-${match.id}`,
    ...buildPermissionSnapshot(match),
  }
}

const getProfileMock = async (userId) => {
  await sleep(120)
  const match = adminUsers.find((item) => item.id === userId)
  if (!match) {
    return {
      ok: false,
      message: 'Admin session is invalid.',
    }
  }

  return {
    ok: true,
    ...buildPermissionSnapshot(match),
  }
}

const logoutMock = async () => {
  await sleep(80)
  return { ok: true }
}

export const adminAuthService = {
  async login(payload) {
    if (ADMIN_AUTH_MODE === 'api') {
      const response = await adminLoginRequest(payload)
      const data = response?.data?.data || response?.data || {}
      return {
        ok: true,
        ...data,
      }
    }

    return loginMock(payload)
  },

  async getProfile(userId) {
    if (ADMIN_AUTH_MODE === 'api') {
      const response = await adminProfileRequest()
      const data = response?.data?.data || response?.data || {}
      return {
        ok: true,
        ...data,
      }
    }

    return getProfileMock(userId)
  },

  async logout() {
    if (ADMIN_AUTH_MODE === 'api') {
      await adminLogoutRequest()
      return { ok: true }
    }

    return logoutMock()
  },
}
