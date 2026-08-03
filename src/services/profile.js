import { getProfile } from './authService'
import { setAuthData } from '@/redux/slices/userSlice'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export async function getTopUsers(limit = 10, role) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.get(`${API_BASE}/user/leaderboard/top-users`, {
    params: { limit, ...(role ? { role } : {}) },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export async function getUserById(userId) {
  const token = localStorage.getItem('profit_connect_token')
  const { data } = await axios.get(`${API_BASE}/user/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export function resolveMediaPath(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = new URL(API_BASE)
  const origin = base.origin
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}

export async function refreshProfile(dispatch) {
  try {
    const res = await getProfile()
    const data = res?.data || res
    if (data) {
      const token = localStorage.getItem('profit_connect_token')
      dispatch(setAuthData({ token, user: data }))
    }
  } catch {
    /* ignore */
  }
}
