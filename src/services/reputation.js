import { getReputationScore } from './authService'
import { updateReputation } from '@/redux/slices/userSlice'

export async function refreshReputation(dispatch) {
  try {
    const res = await getReputationScore()
    if (res?.success) {
      dispatch(updateReputation(res.data))
    }
  } catch { /* ignore */ }
}
