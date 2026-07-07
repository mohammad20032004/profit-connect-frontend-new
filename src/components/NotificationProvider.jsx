import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Snackbar, Alert, Typography, Box } from '@mui/material'
import { getRecentNotifications } from '@/services/notificationService'
import { addNotifications } from '@/redux/slices/notificationSlice'

export default function NotificationProvider({ children }) {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((s) => s.user.isAuthenticated)
  const knownIds = useRef(new Set())
  const [toast, setToast] = useState(null)

  const poll = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await getRecentNotifications()
      if (res?.success && res.data.length > 0) {
        const newOnes = res.data.filter((n) => !knownIds.current.has(n._id))
        if (newOnes.length > 0) {
          newOnes.forEach((n) => knownIds.current.add(n._id))
          dispatch(addNotifications(res.data))

          const latest = newOnes[newOnes.length - 1]
          setToast({ key: latest._id, title: latest.title, message: latest.message })
        }
      }
    } catch { /* ignore */ }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    poll()
    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [poll, isAuthenticated])

  const handleClose = () => setToast(null)

  return (
    <>
      {children}
      <Snackbar open={!!toast} autoHideDuration={5000} onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ mt: 8 }}
      >
        <Alert onClose={handleClose} severity="info" variant="filled" sx={{ borderRadius: 2, minWidth: 280 }}>
          <Box>
            <Typography variant="body2" fontWeight={700}>{toast?.title}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>{toast?.message}</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </>
  )
}
