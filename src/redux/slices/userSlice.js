import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  token: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthData(state, action) {
      state.user = action.payload.user
      state.profile = action.payload.user?.profile || null
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    updateSettings(state, action) {
      if (state.user) {
        state.user.settings = { ...state.user.settings, ...action.payload }
      }
    },
    updateReputation(state, action) {
      if (state.profile) {
        state.profile.rScore = action.payload.score
        state.profile.rLevel = action.payload.level
      }
    },
    adjustPostsCount(state, action) {
      if (state.profile) {
        const next = (state.profile.postsCount || 0) + action.payload
        state.profile.postsCount = next > 0 ? next : 0
      }
    },
    clearUserProfile(state) {
      state.user = null
      state.profile = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setAuthData, updateSettings, updateReputation, adjustPostsCount, clearUserProfile } = userSlice.actions
export default userSlice.reducer
