import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function updateSettings(payload) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.put(`${API_BASE}/user/settings`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
