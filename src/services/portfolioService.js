import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('profit_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && window.location.pathname !== '/sign-in') {
      localStorage.removeItem('profit_connect_token')
      localStorage.removeItem('profit_connect_refresh_token')
      window.location.href = '/sign-in'
    }
    return Promise.reject(err)
  },
)

// --- Items ---

export async function getMyPortfolioItems({ page = 1, limit = 12, category, tag, featured } = {}) {
  const params = { page, limit }
  if (category) params.category = category
  if (tag) params.tag = tag
  if (featured) params.featured = true
  const { data } = await api.get('/portfolio/items', { params })
  return data
}

export async function getUserPortfolioItems(userId, { page = 1, limit = 12, category } = {}) {
  const params = { page, limit }
  if (category) params.category = category
  const { data } = await api.get(`/portfolio/users/${userId}/items`, { params })
  return data
}

export async function getPortfolioItemById(itemId) {
  const { data } = await api.get(`/portfolio/items/${itemId}`)
  return data
}

export async function createPortfolioItem(formData) {
  const { data } = await api.post('/portfolio/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updatePortfolioItem(itemId, body) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
  const { data } = await api.put(`/portfolio/items/${itemId}`, body, config)
  return data
}

export async function deletePortfolioItem(itemId) {
  const { data } = await api.delete(`/portfolio/items/${itemId}`)
  return data
}

export async function likePortfolioItem(itemId) {
  const { data } = await api.post(`/portfolio/items/${itemId}/like`)
  return data
}

// --- Collections ---

export async function getMyCollections() {
  const { data } = await api.get('/portfolio/collections')
  return data
}

export async function getUserCollections(userId) {
  const { data } = await api.get(`/portfolio/users/${userId}/collections`)
  return data
}

export async function getCollectionById(collectionId) {
  const { data } = await api.get(`/portfolio/collections/${collectionId}`)
  return data
}

export async function createCollection(payload) {
  const { data } = await api.post('/portfolio/collections', payload)
  return data
}

export async function updateCollection(collectionId, payload) {
  const { data } = await api.put(`/portfolio/collections/${collectionId}`, payload)
  return data
}

export async function deleteCollection(collectionId) {
  const { data } = await api.delete(`/portfolio/collections/${collectionId}`)
  return data
}

export async function addItemToCollection(collectionId, itemId) {
  const { data } = await api.post(`/portfolio/collections/${collectionId}/items/${itemId}`)
  return data
}

export async function removeItemFromCollection(collectionId, itemId) {
  const { data } = await api.delete(`/portfolio/collections/${collectionId}/items/${itemId}`)
  return data
}
