import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import notificationReducer from './slices/notificationSlice'
import employerReducer from './slices/employerSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    notifications: notificationReducer,
    employer: employerReducer,
  },
})
