import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && window.location.pathname !== '/sign-in') {
      localStorage.removeItem('profit_connect_token')
      localStorage.removeItem('profit_connect_refresh_token')
      window.location.href = '/sign-in'
    }
    return Promise.reject(err)
  },
)

export async function getMyCompany() {
  const { data } = await api.get('/companies/me')
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

export async function getCompanyStats(companyId) {
  const { data } = await api.get(`/companies/${companyId}/stats`)
  return data
}

export async function getEmployerJobs(params = {}) {
  const { data } = await api.get('/employee/jobs', { params })
  return data
}

export async function getEmployerApplications(jobId, params = {}) {
  const { data } = await api.get(`/employee/jobs/${jobId}/applicants`, { params })
  return data
}

export async function updateApplicationStatus(applicationId, status) {
  const { data } = await api.put(`/employee/jobs/applications/${applicationId}/status`, { status })
  return data
}

export async function getEmployerApplicationsStats() {
  const { data } = await api.get('/employee/stats')
  return data
}
