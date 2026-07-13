import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getPosts(page = 1, limit = 10) {
  const { data } = await axios.get(`${API_BASE}/posts`, {
    params: { page, limit },
  })
  return data
}

export async function createPost(formData) {
  const { data } = await axios.post(`${API_BASE}/posts`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updatePost(postId, formData) {
  const { data } = await axios.put(`${API_BASE}/posts/${postId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deletePost(postId) {
  const { data } = await axios.delete(`${API_BASE}/posts/${postId}`)
  return data
}

export async function likePost(postId) {
  const { data } = await axios.post(`${API_BASE}/posts/${postId}/like`)
  return data
}

export async function addComment(postId, content) {
  const { data } = await axios.post(`${API_BASE}/posts/${postId}/comments`, { content })
  return data
}

export async function deleteComment(postId, commentId) {
  const { data } = await axios.delete(`${API_BASE}/posts/${postId}/comments/${commentId}`)
  return data
}

export async function getPostById(postId) {
  const { data } = await axios.get(`${API_BASE}/posts/${postId}`)
  return data
}

export async function savePost(postId) {
  const { data } = await axios.post(`${API_BASE}/user/saved-posts/${postId}`)
  return data
}

export async function unsavePost(postId) {
  const { data } = await axios.delete(`${API_BASE}/user/saved-posts/${postId}`)
  return data
}

export async function getSavedPosts() {
  const { data } = await axios.get(`${API_BASE}/user/saved-posts`)
  return data
}

