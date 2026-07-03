import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserProfile(state) {
      state.user = null
      state.profile = null
      state.isAuthenticated = false
    },
  },
})

export const { clearUserProfile } = userSlice.actions
export default userSlice.reducer
