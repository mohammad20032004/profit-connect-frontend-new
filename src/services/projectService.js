import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export async function getProjects(params = {}) {
  const { data } = await axios.get(`${API_BASE}/projects`, { params })
  return data
}

export async function getProjectById(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}`)
  return data
}

export async function getProjectFull(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}/full`)
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

export async function getProjectOverview(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}/overview`)
  return data
}

export async function updateProjectManage(id, payload) {
  const { data } = await axios.put(`${API_BASE}/projects/${id}/manage`, payload)
  return data
}

export async function getTeam(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}/team`)
  return data
}

export async function addTeamMember(id, payload) {
  const { data } = await axios.post(`${API_BASE}/projects/${id}/team`, payload)
  return data
}

export async function updateTeamMember(id, memberId, payload) {
  const { data } = await axios.put(`${API_BASE}/projects/${id}/team/${memberId}`, payload)
  return data
}

export async function removeTeamMember(id, memberId) {
  const { data } = await axios.delete(`${API_BASE}/projects/${id}/team/${memberId}`)
  return data
}

export async function getMilestones(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}/milestones`)
  return data
}

export async function createMilestone(id, payload) {
  const { data } = await axios.post(`${API_BASE}/projects/${id}/milestones`, payload)
  return data
}

export async function updateMilestone(id, milestoneId, payload) {
  const { data } = await axios.put(`${API_BASE}/projects/${id}/milestones/${milestoneId}`, payload)
  return data
}

export async function deleteMilestone(id, milestoneId) {
  const { data } = await axios.delete(`${API_BASE}/projects/${id}/milestones/${milestoneId}`)
  return data
}

export async function getPayments(id) {
  const { data } = await axios.get(`${API_BASE}/projects/${id}/payments`)
  return data
}

export async function depositPayment(payload) {
  const { data } = await axios.post(`${API_BASE}/payments`, payload)
  return data
}

export async function getMyPayments(params = {}) {
  const { data } = await axios.get(`${API_BASE}/payments`, { params })
  return data
}

export async function releasePayment(paymentId) {
  const { data } = await axios.put(`${API_BASE}/payments/${paymentId}/release`)
  return data
}

export async function createPayment(id, payload) {
  const { data } = await axios.post(`${API_BASE}/projects/${id}/payments`, payload)
  return data
}

export async function updatePayment(id, paymentId, payload) {
  const { data } = await axios.put(`${API_BASE}/projects/${id}/payments/${paymentId}`, payload)
  return data
}

export async function deletePayment(id, paymentId) {
  const { data } = await axios.delete(`${API_BASE}/projects/${id}/payments/${paymentId}`)
  return data
}

export async function improveText(text) {
  const { data } = await axios.post(`${API_BASE}/improve`, { text })
  return data
}
