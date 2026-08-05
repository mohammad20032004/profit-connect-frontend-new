import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export async function getWallet() {
  const { data } = await axios.get(`${API_BASE}/wallet`)
  return data
}

export async function requestWithdrawal(payload) {
  const { data } = await axios.post(`${API_BASE}/wallet/withdraw`, payload)
  return data
}

export async function getWithdrawals() {
  const { data } = await axios.get(`${API_BASE}/wallet/withdrawals`)
  return data
}

export async function cancelWithdrawal(id) {
  const { data } = await axios.post(`${API_BASE}/wallet/withdrawals/${id}/cancel`)
  return data
}
