import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function login({ email, password }) {
  const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
  return data
}
