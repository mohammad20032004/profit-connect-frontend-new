import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getPosts(page = 1, limit = 10) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.get(`${API_BASE}/posts`, {
    params: { page, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}
