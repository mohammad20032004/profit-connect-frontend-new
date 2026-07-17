import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  company: null,
  profile: null,
  reputation: null,
  loading: false,
  error: null,
}

const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {
    setEmployerData(state, action) {
      state.company = action.payload.company || state.company
      state.profile = action.payload.profile || state.profile
      state.reputation = action.payload.reputation || state.reputation
    },
    setCompany(state, action) {
      state.company = action.payload
    },
    setEmployerLoading(state, action) {
      state.loading = action.payload
    },
    setEmployerError(state, action) {
      state.error = action.payload
    },
    clearEmployer(state) {
      state.company = null
      state.profile = null
      state.reputation = null
      state.loading = false
      state.error = null
    },
  },
})

export const { setEmployerData, setCompany, setEmployerLoading, setEmployerError, clearEmployer } = employerSlice.actions
export default employerSlice.reducer
