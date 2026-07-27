import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function getJobs(params = {}) {
  const { data } = await api.get('/jobs', { params })
  return data
}

export async function getJobById(id) {
  const { data } = await api.get(`/jobs/${id}`)
  return data
}

export async function applyToJob(jobId, formData) {
  const { data } = await api.post(`/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return data
}
