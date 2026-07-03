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
    clearUserProfile(state) {
      state.user = null
      state.profile = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setAuthData, clearUserProfile } = userSlice.actions
export default userSlice.reducer
