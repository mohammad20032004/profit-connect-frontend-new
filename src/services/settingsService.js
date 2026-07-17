import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export async function updateSettings(payload) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.put(`${API_BASE}/user/settings`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function updateProfile(payload) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.put(`${API_BASE}/user/profile`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function updateAvatar(file) {
  const token = localStorage.getItem('profit_connect_token')
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await axios.put(`${API_BASE}/user/profile/avatar`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  })
  return data
}
