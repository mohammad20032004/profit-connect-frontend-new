import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload
      state.unreadCount = action.payload.filter((n) => !n.read).length
    },
    addNotifications(state, action) {
      const existingIds = new Set(state.items.map((n) => n._id))
      const newOnes = action.payload.filter((n) => !existingIds.has(n._id))
      if (newOnes.length > 0) {
        state.items = [...newOnes, ...state.items]
        state.unreadCount = state.items.filter((n) => !n.read).length
      }
    },
    markRead(state, action) {
      const n = state.items.find((n) => n._id === action.payload)
      if (n) {
        n.read = true
        state.unreadCount = state.items.filter((n) => !n.read).length
      }
    },
  },
})

export const { setNotifications, addNotifications, markRead } = notificationSlice.actions
export default notificationSlice.reducer
