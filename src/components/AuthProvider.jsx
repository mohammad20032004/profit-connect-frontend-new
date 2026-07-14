import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setAuthData, clearUserProfile } from '@/redux/slices/userSlice'
import { getMe } from '@/services/authService'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress } from '@mui/material'

let interceptorId = null

function setupAxiosInterceptor(dispatch) {
  if (interceptorId !== null) return
  interceptorId = axios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401) {
        localStorage.removeItem('profit_connect_token')
        delete axios.defaults.headers.common['Authorization']
        dispatch(clearUserProfile())
        window.location.href = '/sign-in'
      }
      return Promise.reject(err)
    },
  )
}

function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const checked = useRef(false)

  useEffect(() => {
    setupAxiosInterceptor(dispatch)
  }, [dispatch])

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const checkAuth = async () => {
      const token = localStorage.getItem('profit_connect_token')
      if (!token) {
        setLoading(false)
        return
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      try {
        const res = await getMe()
        let user = null

        if (res?.success && res?.data) {
          user = res.data
        } else if (res?.user) {
          user = res.user
        } else if (res?._id) {
          user = res
        }

        if (user) {
          dispatch(setAuthData({ token, user }))
          const lang = user?.settings?.language
          if (lang && ['en', 'ar'].includes(lang)) {
            i18n.changeLanguage(lang)
          }
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('profit_connect_token')
          delete axios.defaults.headers.common['Authorization']
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [dispatch, i18n])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return children
}

export default AuthProvider
