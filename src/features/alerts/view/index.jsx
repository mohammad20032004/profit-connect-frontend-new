import { useEffect, useState, useCallback } from 'react'
import {
  Box, Paper, Typography, Stack, CircularProgress, IconButton, alpha, Chip,
} from '@mui/material'
import Button from '@/ui/Button'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import {
  NotificationsOutlined, CheckCircleOutlineOutlined, WorkOutlineOutlined,
  StarBorderOutlined, InfoOutlined, DoneAllOutlined, CancelOutlined,
} from '@mui/icons-material'
import { getNotifications, markNotificationRead } from '@/services/notificationService'
import { setNotifications, markRead } from '@/redux/slices/notificationSlice'

function getNotificationDisplay(n, t) {
  const map = {
    proposal_accepted: {
      icon: <CheckCircleOutlineOutlined />,
      color: 'success',
      title: t('notif.accepted', 'تم قبول عرضك'),
      msg: t('notif.acceptedMsg', 'في مشروع {name}', { name: n.projectName }),
    },
    proposal_rejected: {
      icon: <CancelOutlined />,
      color: 'error',
      title: t('notif.rejected', 'تم رفض عرضك'),
      msg: t('notif.rejectedMsg', 'لمشروع {name}', { name: n.projectName }),
    },
    proposal_new: {
      icon: <WorkOutlineOutlined />,
      color: 'primary',
      title: t('notif.newProposal', 'عرض جديد'),
      msg: t('notif.newProposalMsg', 'في مشروع {name}', { name: n.projectName }),
    },
    project_completed: {
      icon: <CheckCircleOutlineOutlined />,
      color: 'success',
      title: t('notif.completed', 'اكتمال المشروع'),
      msg: t('notif.completedMsg', 'تم اكتمال مشروع {name}', { name: n.projectName }),
    },
    rating_received: {
      icon: <StarBorderOutlined />,
      color: 'warning',
      title: t('notif.rating', 'تقييم جديد'),
      msg: n.clientName
        ? t('notif.ratingMsgWith', 'قام {client} بتقييمك في مشروع {name}', { client: n.clientName, name: n.projectName })
        : t('notif.ratingMsg', 'قام عميل بتقييمك في مشروع {name}', { name: n.projectName }),
    },
  }
  return map[n.type] || {
    icon: <InfoOutlined />,
    color: 'info',
    title: t('notif.general', 'إشعار'),
    msg: '',
  }
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
            sx={{ fontSize: '0.8rem' }}
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
            {items.map((n) => {
              const display = getNotificationDisplay(n, t)
              return (
                <Paper key={n._id} variant="outlined" sx={{
                  p: 2, borderRadius: 2,
                  borderColor: n.read ? 'divider' : alpha(theme.palette[display.color].main, 0.25),
                  bgcolor: n.read ? 'transparent' : alpha(theme.palette[display.color].main, 0.04),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                }}
                  onClick={() => { if (!n.read) handleMarkRead(n._id) }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: n.read ? alpha(theme.palette.action.disabled, 0.08) : alpha(theme.palette[display.color].main, 0.12),
                      color: n.read ? 'text.disabled' : theme.palette[display.color].main,
                      flexShrink: 0,
                    }}>
                      {display.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={n.read ? 400 : 700} sx={{ mb: 0.3 }}>
                        {display.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.82rem' }}>
                        {display.msg}
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
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
