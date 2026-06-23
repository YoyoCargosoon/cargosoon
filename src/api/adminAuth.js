import { axios } from './axios'

export const adminLoginRequest = (payload) => axios.post('/admin/auth/login', payload)

export const adminProfileRequest = () => axios.get('/admin/auth/me')

export const adminLogoutRequest = () => axios.post('/admin/auth/logout')
