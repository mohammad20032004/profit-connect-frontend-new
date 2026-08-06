import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// --- Connections ---

export async function getConnections() {
  const { data } = await api.get('/network/connections')
  return data
}

export async function getIncomingRequests() {
  const { data } = await api.get('/network/requests')
  return data
}

export async function getSentRequests() {
  const { data } = await api.get('/network/sent-requests')
  return data
}

export async function getNetworkStats() {
  const { data } = await api.get('/network/stats')
  return data
}

export async function getConnectionStatus(userId) {
  const { data } = await api.get(`/network/status/${userId}`)
  return data
}

export async function sendConnectionRequest(userId) {
  const { data } = await api.post(`/network/connect/${userId}`)
  return data
}

export async function acceptConnectionRequest(requestId) {
  const { data } = await api.put(`/network/accept/${requestId}`)
  return data
}

export async function rejectConnectionRequest(requestId) {
  const { data } = await api.put(`/network/reject/${requestId}`)
  return data
}

export async function cancelConnectionRequest(userId) {
  const { data } = await api.delete(`/network/cancel/${userId}`)
  return data
}

export async function removeConnection(userId) {
  const { data } = await api.delete(`/network/remove/${userId}`)
  return data
}

// --- Search & Discover ---

export async function searchUsers(q, limit = 20) {
  const { data } = await api.get('/network/search', { params: { q, limit } })
  return data
}

export async function getDiscoverUsers(limit = 10, role, excludeFollowing = true) {
  const { data } = await api.get('/network/discover', {
    params: { limit, ...(role ? { role } : {}), excludeFollowing },
  })
  return data
}

// --- Leaderboard (public) ---

export async function getTopUsers(limit = 10, role) {
  const { data } = await api.get('/user/leaderboard/top-users', {
    params: { limit, ...(role ? { role } : {}) },
  })
  return data
}

// --- Follow (network shortcuts for self) ---

export async function getMyFollowers() {
  const { data } = await api.get('/network/followers')
  return data
}

export async function getMyFollowing() {
  const { data } = await api.get('/network/following')
  return data
}

// --- Follow (toggle / any user lists — recommended by backend) ---

export async function toggleFollowUser(userId) {
  const { data } = await api.post(`/user/${userId}/follow`)
  return data
}

export async function getUserFollowers(userId) {
  const { data } = await api.get(`/user/${userId}/followers`)
  return data
}

export async function getUserFollowing(userId) {
  const { data } = await api.get(`/user/${userId}/following`)
  return data
}
