import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setAuthData, clearUserProfile } from '@/redux/slices/userSlice'
import { getMe, refreshAccessToken } from '@/services/authService'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress } from '@mui/material'

let interceptorId = null

let isRefreshing = false
const refreshSubscribers = []

function subscribeTokenRefresh(resolve, reject) {
  refreshSubscribers.push({ resolve, reject })
}

function onRefreshed(token) {
  refreshSubscribers.forEach((s) => s.resolve(token))
  refreshSubscribers.length = 0
}

function onRefreshFailed(err) {
  refreshSubscribers.forEach((s) => s.reject(err))
  refreshSubscribers.length = 0
}

function clearSession() {
  localStorage.removeItem('profit_connect_token')
  localStorage.removeItem('profit_connect_refresh_token')
  delete axios.defaults.headers.common['Authorization']
}

async function tryRefreshSession() {
  const refreshToken = localStorage.getItem('profit_connect_refresh_token')
  if (!refreshToken) throw new Error('No refresh token available')
  const res = await refreshAccessToken(refreshToken)
  if (!res?.success || !res?.token) throw new Error('Refresh failed')
  localStorage.setItem('profit_connect_token', res.token)
  if (res.refreshToken) localStorage.setItem('profit_connect_refresh_token', res.refreshToken)
  axios.defaults.headers.common['Authorization'] = `Bearer ${res.token}`
  return res.token
}

function setupAxiosInterceptor(dispatch) {
  if (interceptorId !== null) return
  interceptorId = axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      const { response, config } = err
      if (!response || response.status !== 401) return Promise.reject(err)

      const url = config?.url || ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh')
      const alreadyOnSignIn = window.location.pathname === '/sign-in'
      const refreshToken = localStorage.getItem('profit_connect_refresh_token')

      // Never refresh login/signup/refresh endpoints, and never twice for the same request
      if (isAuthEndpoint || config?._retry) return Promise.reject(err)

      if (alreadyOnSignIn || !refreshToken) {
        clearSession()
        dispatch(clearUserProfile())
        if (!alreadyOnSignIn) {
          window.location.href = '/sign-in'
        }
        return Promise.reject(err)
      }

      // Another request is already refreshing — queue this one to retry with the new token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
            config._retry = true
            resolve(axios(config))
          }, reject)
        })
      }

      isRefreshing = true
      try {
        const newToken = await tryRefreshSession()
        onRefreshed(newToken)
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${newToken}`
        config._retry = true
        return axios(config)
      } catch (refreshErr) {
        onRefreshFailed(refreshErr)
        clearSession()
        dispatch(clearUserProfile())
        if (!alreadyOnSignIn) {
          window.location.href = '/sign-in'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
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
          dispatch(setAuthData({ token: localStorage.getItem('profit_connect_token'), user }))
          const lang = user?.settings?.language
          if (lang && ['en', 'ar'].includes(lang)) {
            i18n.changeLanguage(lang)
          }
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          clearSession()
          window.location.href = '/sign-in'
          return
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
