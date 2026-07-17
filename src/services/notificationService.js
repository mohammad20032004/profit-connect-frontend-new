import axios from 'axios'

const API_BASE = `${import.meta.env.VITE_API_BASE}/projects`

export async function getNotifications() {
  const { data } = await axios.get(`${API_BASE}/notifications`)
  return data
}

export async function getRecentNotifications() {
  const { data } = await axios.get(`${API_BASE}/notifications/recent`)
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await axios.put(`${API_BASE}/notifications/${notificationId}/read`)
  return data
}
