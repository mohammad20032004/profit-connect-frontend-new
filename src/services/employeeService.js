import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Owner/Admin: Employee Management
export async function getEmployees(companyId) {
  const { data } = await api.get(`/companies/${companyId}/employees`)
  return data
}

export async function addEmployee(companyId, payload) {
  const { data } = await api.post(`/companies/${companyId}/employees`, payload)
  return data
}

export async function updateEmployee(companyId, employeeId, payload) {
  const { data } = await api.put(`/companies/${companyId}/employees/${employeeId}`, payload)
  return data
}

export async function removeEmployee(companyId, employeeId) {
  const { data } = await api.delete(`/companies/${companyId}/employees/${employeeId}`)
  return data
}

// Employee: My Company
export async function getMyCompanyInfo() {
  const { data } = await api.get('/employee/my-company')
  return data
}

// Employee: Jobs
export async function getEmployeeJobs(params = {}) {
  const { data } = await api.get('/employee/jobs', { params })
  return data
}

export async function createJob(payload) {
  const { data } = await api.post('/employee/jobs', payload)
  return data
}

export async function updateJob(jobId, payload) {
  const { data } = await api.put(`/employee/jobs/${jobId}`, payload)
  return data
}

export async function deleteJob(jobId) {
  const { data } = await api.delete(`/employee/jobs/${jobId}`)
  return data
}

// Employee: Applicants
export async function getJobApplicants(jobId) {
  const { data } = await api.get(`/employee/jobs/${jobId}/applicants`)
  return data
}

export async function updateApplicationStatus(applicationId, status) {
  const { data } = await api.put(`/employee/jobs/applications/${applicationId}/status`, { status })
  return data
}

// Employee: Stats
export async function getEmployeeStats() {
  const { data } = await api.get('/employee/stats')
  return data
}
