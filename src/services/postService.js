import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

function authHeaders() {
  const token = localStorage.getItem('profit_connect_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getPosts(page = 1, limit = 10) {
  const { data } = await axios.get(`${API_BASE}/posts`, {
    params: { page, limit },
    headers: authHeaders(),
  })
  return data
}

export async function createPost({ content, visibility = 'public' }) {
  const { data } = await axios.post(
    `${API_BASE}/posts`,
    { content, visibility },
    { headers: authHeaders() },
  )
  return data
}
