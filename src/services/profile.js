import { getProfile } from './authService'
import { setAuthData } from '@/redux/slices/userSlice'

export async function refreshProfile(dispatch) {
  try {
    const res = await getProfile()
    const data = res?.data || res
    if (data) {
      const token = localStorage.getItem('profit_connect_token')
      dispatch(setAuthData({ token, user: data }))
    }
  } catch {
    /* ignore */
  }
}
