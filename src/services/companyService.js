import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_BASE, timeout: 8000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function getCompanies() {
  const { data } = await api.get('/companies')
  return data
}

export async function getCompanyById(id) {
  const { data } = await api.get(`/companies/${id}`)
  return data
}

export async function createCompany(payload) {
  const { data } = await api.post('/companies', payload)
  return data
}

export async function toggleFollow(id) {
  const { data } = await api.post(`/companies/${id}/follow`)
  return data
}

export async function addAdmin(id, newAdminId) {
  const { data } = await api.post(`/companies/${id}/admins`, { newAdminId })
  return data
}

export async function upsertRating(id, { rating, review }) {
  const { data } = await api.post(`/companies/${id}/ratings`, { rating, review })
  return data
}

export async function getCompanyRatings(id) {
  const { data } = await api.get(`/companies/${id}/ratings`)
  return data
}

export async function deleteMyRating(id) {
  const { data } = await api.delete(`/companies/${id}/ratings`)
  return data
}

export async function updateCompany(id, payload) {
  const { data } = await api.put(`/companies/${id}`, payload)
  return data
}

export async function deleteCompany(id) {
  const { data } = await api.delete(`/companies/${id}`)
  return data
}

export async function getCompanyFollowers(id) {
  const { data } = await api.get(`/companies/${id}/followers`)
  return data
}

export async function createCompanyWithDocs(formData) {
  const { data } = await api.post('/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return data
}
