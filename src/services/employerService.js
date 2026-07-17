import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function getMyCompany() {
  const { data } = await api.get('/companies/my')
  return data
}

export async function getReputationScore() {
  const { data } = await api.get('/user/reputation-score')
  return data
}

export async function getProfile() {
  const { data } = await api.get('/user/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/user/profile', payload)
  return data
}

export async function updateProfileAvatar(formData) {
  const { data } = await api.put('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
