import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function login({ email, password }) {
  const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
  return data
}

export async function getMe() {
  const token = localStorage.getItem('profit_connect_token')
  if (!token) return null
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const { data } = await axios.get(`${API_BASE}/auth/me`)
  return data
}
