import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getProjects(params = {}) {
  const { data } = await axios.get(`${API_BASE}/projects`, { params })
  return data
}

export async function getProjectById(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}`)
  return data
}

export async function createProject(payload) {
  const { data } = await axios.post(`${API_BASE}/projects`, payload)
  return data
}

export async function updateProject(id, payload) {
  const { data } = await axios.put(`${API_BASE}/projects/${id}`, payload)
  return data
}

export async function deleteProject(id) {
  const { data } = await axios.delete(`${API_BASE}/projects/${id}`)
  return data
}

export async function completeProject(id) {
  const { data } = await axios.patch(`${API_BASE}/projects/${id}/complete`)
  return data
}

export async function getProposals(projectId) {
  const { data } = await axios.get(`${API_BASE}/projects/${projectId}/proposals`)
  return data
}

export async function submitProposal(projectId, payload) {
  const { data } = await axios.post(`${API_BASE}/projects/${projectId}/proposals`, payload)
  return data
}

export async function acceptProposal(projectId, proposalId) {
  const { data } = await axios.post(`${API_BASE}/projects/${projectId}/proposals/${proposalId}/accept`)
  return data
}

export async function rejectProposal(projectId, proposalId) {
  const { data } = await axios.post(`${API_BASE}/projects/${projectId}/proposals/${proposalId}/reject`)
  return data
}

export async function getMyProposals() {
  const { data } = await axios.get(`${API_BASE}/projects/my-proposals`)
  return data
}

export async function getMyProjectsWithProposals() {
  const { data } = await axios.get(`${API_BASE}/projects/my-projects-with-proposals`)
  return data
}

export async function improveText(text) {
  const { data } = await axios.post(`${API_BASE}/improve`, { text })
  return data
}
