import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

function authHeaders() {
  const token = localStorage.getItem('profit_connect_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function translateText(text) {
  if (!text?.trim()) return ''

  try {
    const { data } = await axios.post(`${API_BASE}/translate`, { text }, { headers: authHeaders() })
    if (data?.success) {
      return data.data.translated
    }
    return text
  } catch {
    return text
  }
}
