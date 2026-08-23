import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export async function login({ email, password }) {
  const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
  return data
}

export async function signup(formData) {
  const { data } = await axios.post(`${API_BASE}/auth/signup`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getMe() {
  const token = localStorage.getItem('profit_connect_token')
  if (!token) return null
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const { data } = await axios.get(`${API_BASE}/auth/me`)
  return data
}

export async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
  return data
}

export async function logoutRequest(refreshToken) {
  const { data } = await axios.post(`${API_BASE}/auth/logout`, { refreshToken })
  return data
}

export async function getReputationScore() {
  const token = localStorage.getItem('profit_connect_token')
  if (!token) return null
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const { data } = await axios.get(`${API_BASE}/user/reputation-score`)
  return data
}

export async function getProfile() {
  const token = localStorage.getItem('profit_connect_token')
  if (!token) return null
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const { data } = await axios.get(`${API_BASE}/user/profile`)
  return data
}

export async function forgotPassword(email) {
  const { data } = await axios.post(`${API_BASE}/auth/forgot-password`, { email })
  return data
}

export async function verifyResetCode(email, code) {
  const { data } = await axios.post(`${API_BASE}/auth/verify-reset-code`, { email, code })
  return data
}

export async function resetPassword(resetToken, newPassword) {
  const { data } = await axios.post(`${API_BASE}/auth/reset-password`, { resetToken, newPassword })
  return data
}

export async function verifyEmail(email, code) {
  const { data } = await axios.post(`${API_BASE}/auth/verify-email`, { email, code })
  return data
}

export async function resendVerification(email) {
  const { data } = await axios.post(`${API_BASE}/auth/resend-verification`, { email })
  return data
}

export async function sendVerification(email) {
  const { data } = await axios.post(`${API_BASE}/auth/send-verification`, { email })
  return data
}
