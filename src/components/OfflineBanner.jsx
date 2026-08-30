import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Stack } from '@mui/material'
import WifiOffOutlined from '@mui/icons-material/WifiOffOutlined'

export default function OfflineBanner() {
  const { t } = useTranslation()
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <Box
      role="alert"
      sx={{
        bgcolor: 'error.main',
        color: '#fff',
        px: { xs: 2, sm: 3 },
        py: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <WifiOffOutlined sx={{ fontSize: 30, flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 800, lineHeight: 1.2 }}>
            {t('offline.title', 'No internet connection')}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, opacity: 0.95 }}>
            {t('offline.desc', 'Please check your connection and try again')}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
