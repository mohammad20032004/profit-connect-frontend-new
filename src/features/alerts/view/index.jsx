import { useEffect, useState, useCallback } from 'react'
import {
  Box, Paper, Typography, Stack, CircularProgress, Button, IconButton, alpha, Chip,
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import {
  NotificationsOutlined, CheckCircleOutlineOutlined, WorkOutlineOutlined,
  StarBorderOutlined, InfoOutlined, DoneAllOutlined,
} from '@mui/icons-material'
import { getNotifications, markNotificationRead } from '@/services/notificationService'
import { setNotifications, markRead } from '@/redux/slices/notificationSlice'

const typeIcons = {
  proposal: <WorkOutlineOutlined />,
  project: <InfoOutlined />,
  rating: <StarBorderOutlined />,
}

const typeColors = {
  proposal: 'primary',
  project: 'info',
  rating: 'warning',
}

function formatTime(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('time.justNow', 'Just now')
  if (mins < 60) return t('time.minutesAgo', '{{count}}m ago', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('time.hoursAgo', '{{count}}h ago', { count: hours })
  const days = Math.floor(hours / 24)
  return t('time.daysAgo', '{{count}}d ago', { count: days })
}

export default function AlertsView() {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useDispatch()
  const { items, unreadCount } = useSelector((s) => s.notifications)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const res = await getNotifications()
      if (res?.success) dispatch(setNotifications(res.data))
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      dispatch(markRead(id))
    } catch { /* ignore */ }
  }

  return (
    <Box sx={{ height: 'calc(100vh - 88px)', overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <NotificationsOutlined sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">{t('nav.alerts', 'Alerts')}</Typography>
            {unreadCount > 0 && (
              <Chip label={unreadCount} size="small" color="error" sx={{ fontWeight: 700, minWidth: 24, height: 22 }} />
            )}
          </Stack>
          <Button size="small" variant="outlined" startIcon={<DoneAllOutlined />}
            sx={{ borderRadius: 999, textTransform: 'none', fontSize: '0.8rem' }}
            onClick={() => items.filter(n => !n.read).forEach(n => handleMarkRead(n._id))}
          >
            {t('dashboard.markAllRead', 'Mark all read')}
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <NotificationsOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
            <Typography color="text.secondary">{t('dashboard.noNotifications', 'No notifications yet')}</Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {items.map((n) => (
              <Paper key={n._id} variant="outlined" sx={{
                p: 2, borderRadius: 2,
                borderColor: n.read ? 'divider' : alpha(theme.palette.primary.main, 0.25),
                bgcolor: n.read ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
              }}
                onClick={() => { if (!n.read) handleMarkRead(n._id) }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: n.read ? alpha(theme.palette.action.disabled, 0.08) : alpha(theme.palette[typeColors[n.type] || 'primary'].main, 0.1),
                    color: n.read ? 'text.disabled' : (theme.palette[typeColors[n.type] || 'primary'].main),
                    flexShrink: 0,
                  }}>
                    {typeIcons[n.type] || <InfoOutlined />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={n.read ? 400 : 700} sx={{ mb: 0.3 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.82rem' }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {formatTime(n.createdAt, t)}
                    </Typography>
                  </Box>
                  {!n.read && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id) }} sx={{ mt: -0.5, mr: -0.5 }}>
                      <CheckCircleOutlineOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                    </IconButton>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
