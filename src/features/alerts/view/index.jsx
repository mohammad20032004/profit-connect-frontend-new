﻿import { RADIUS } from '@/theme/tokens'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, IconButton, alpha, Chip, Skeleton,
} from '@mui/material'
import Button from '@/ui/Button'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import {
  NotificationsOutlined, CheckCircleOutlineOutlined, WorkOutlineOutlined,
  StarBorderOutlined, InfoOutlined, DoneAllOutlined, CancelOutlined,
  WarningOutlined, RocketLaunchOutlined, BadgeOutlined,
  PaymentsOutlined, AccountBalanceWalletOutlined, RestoreOutlined, VerifiedOutlined,
  PersonAddAlt1Outlined, PeopleAltOutlined,
} from '@mui/icons-material'
import { getNotifications, markNotificationRead } from '@/services/notificationService'
import { setNotifications, markRead } from '@/redux/slices/notificationSlice'

function getSenderName(n) {
  if (n.senderName) return n.senderName
  if (n.sender?.profile?.fullname) return n.sender.profile.fullname
  if (n.sender?.profile?.firstName || n.sender?.profile?.lastName) {
    return `${n.sender.profile.firstName || ''} ${n.sender.profile.lastName || ''}`.trim()
  }
  if (n.sender?.username) return n.sender.username
  return 'Someone'
}

function getNotificationDisplay(n, t) {
  const map = {
    proposal_accepted: {
      icon: <CheckCircleOutlineOutlined />,
      color: 'success',
      title: t('notif.accepted', 'طھظ… ظ‚ط¨ظˆظ„ ط¹ط±ط¶ظƒ'),
      msg: t('notif.acceptedMsg', 'ظپظٹ ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
    },
    proposal_rejected: {
      icon: <CancelOutlined />,
      color: 'error',
      title: t('notif.rejected', 'طھظ… ط±ظپط¶ ط¹ط±ط¶ظƒ'),
      msg: t('notif.rejectedMsg', 'ظ„ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
    },
    proposal_new: {
      icon: <WorkOutlineOutlined />,
      color: 'primary',
      title: t('notif.newProposal', 'ط¹ط±ط¶ ط¬ط¯ظٹط¯'),
      msg: t('notif.newProposalMsg', 'ظپظٹ ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
    },
    proposal_received: {
      icon: <WorkOutlineOutlined />,
      color: 'primary',
      title: t('notif.proposalReceived', 'ط¹ط±ط¶ ط¬ط¯ظٹط¯ ط¹ظ„ظ‰ ظ…ط´ط±ظˆط¹ظƒ'),
      msg: t('notif.proposalReceivedMsg', 'ظ‡ظ†ط§ظƒ ط¹ط±ط¶ ط¬ط¯ظٹط¯ ط¹ظ„ظ‰ ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
      actionUrl: n.projectId ? `/myProject/${n.projectId}` : null,
      actionLabel: t('notif.viewProposals', 'ط¹ط±ط¶ ط§ظ„ط¹ط±ظˆط¶'),
    },
    project_completed: {
      icon: <CheckCircleOutlineOutlined />,
      color: 'success',
      title: t('notif.completed', 'ط§ظƒطھظ…ط§ظ„ ط§ظ„ظ…ط´ط±ظˆط¹'),
      msg: t('notif.completedMsg', 'طھظ… ط§ظƒطھظ…ط§ظ„ ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
    },
    rating_received: {
      icon: <StarBorderOutlined />,
      color: 'warning',
      title: t('notif.rating', 'طھظ‚ظٹظٹظ… ط¬ط¯ظٹط¯'),
      msg: n.clientName
        ? t('notif.ratingMsgWith', 'ظ‚ط§ظ… {client} ط¨طھظ‚ظٹظٹظ…ظƒ ظپظٹ ظ…ط´ط±ظˆط¹ {name}', { client: n.clientName, name: n.projectName })
        : t('notif.ratingMsg', 'ظ‚ط§ظ… ط¹ظ…ظٹظ„ ط¨طھظ‚ظٹظٹظ…ظƒ ظپظٹ ظ…ط´ط±ظˆط¹ {name}', { name: n.projectName }),
    },
    ai_detected: {
      icon: <WarningOutlined />,
      color: 'warning',
      title: t('notif.aiDetected', 'طھظ†ط¨ظٹظ‡: ظƒط´ظپ ظ…ط­طھظˆظ‰ ط°ظƒط§ط، ط§طµط·ظ†ط§ط¹ظٹ'),
      msg: t('notif.aiDetectedMsg', 'طھظ… ط±طµط¯ ط£ظ† ظ…ظ†ط´ظˆط±ظƒ ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ظ…ط­طھظˆظ‰ ظ…ظˆظ„ظ‘ط¯ ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط¨ظ†ط³ط¨ط© {probability}% ظ…ظ…ط§ ظ‚ط¯ ظٹط¤ط«ط± ط³ظ„ط¨ط§ظ‹ ط¹ظ„ظ‰ ظ†ظ‚ط§ط· R-Score ط§ظ„ط®ط§طµط© ط¨ظƒ', { probability: n.aiProbability ?? 'â€”' }),
    },
    company_setup: {
      icon: <RocketLaunchOutlined />,
      color: 'primary',
      title: t('notif.companySetup', 'ط£ظƒظ…ظ„ ط¥ط¹ط¯ط§ط¯ طµظپط­ط© ط´ط±ظƒطھظƒ'),
      msg: t('notif.companySetupMsg', 'ط£ظƒظ…ظ„ ط¥ط¹ط¯ط§ط¯ طµظپط­ط© ط´ط±ظƒطھظƒ ظ„ظ†ط´ط± ظˆط¸ط§ط¦ظپظƒ ظˆظ…ط´ط§ط±ظٹط¹ظƒ ط¨ط³ظ‡ظˆظ„ط©'),
      actionUrl: '/employer/setup',
      actionLabel: t('notif.companySetupAction', 'ط¥ط¹ط¯ط§ط¯ ط§ظ„ط¢ظ†'),
    },
    job_application_status: {
      icon: <BadgeOutlined />,
      color: n.applicationStatus === 'Accepted' ? 'success' : n.applicationStatus === 'Rejected' ? 'error' : 'info',
      title: n.message || t('notif.jobApplicationStatus', 'طھط­ط¯ظٹط« ط­ط§ظ„ط© ط·ظ„ط¨ ط§ظ„طھظˆط¸ظٹظپ'),
      msg: n.message || '',
      actionUrl: n.jobId ? `/jobs/${n.jobId}` : null,
      actionLabel: t('notif.jobApplicationView', 'ط¹ط±ط¶ ط§ظ„ظˆط¸ظٹظپط©'),
    },
    payment_deposited: {
      icon: <PaymentsOutlined />,
      color: 'success',
      title: t('notif.paymentDeposited', 'ط¯ظپط¹ط© ظˆط§ط±ط¯ط©'),
      msg: t('notif.paymentDepositedMsg', 'طھظ… ط¥ظٹط¯ط§ط¹ {{amount}} {{currency}} ط¨ط§ط³ظ…ظƒ ظˆظ‡ظˆ ظ…ط­ط¬ظˆط² ظ„ط¯ظ‰ ط§ظ„ظ…ظ†طµط©.', { amount: n.amount ?? 'â€”', currency: n.currency || '', name: n.projectName }),
      actionUrl: n.projectId ? `/payments?projectId=${n.projectId}` : null,
      actionLabel: t('notif.viewPayments', 'ط¹ط±ط¶ ط§ظ„ط¯ظپط¹ط§طھ'),
    },
    payment_released: {
      icon: <AccountBalanceWalletOutlined />,
      color: 'success',
      title: t('notif.paymentReleased', 'طھظ… طھط­ط±ظٹط± ط§ظ„ط¯ظپط¹ط©'),
      msg: t('notif.paymentReleasedMsg', 'طھظ… طھط­ط±ظٹط± {{amount}} {{currency}} ط¥ظ„ظ‰ ظ…ط­ظپط¸طھظƒ.', { amount: n.amount ?? 'â€”', currency: n.currency || '', name: n.projectName }),
      actionUrl: n.projectId ? `/payments?projectId=${n.projectId}` : null,
      actionLabel: t('notif.viewPayments', 'ط¹ط±ط¶ ط§ظ„ط¯ظپط¹ط§طھ'),
    },
    payment_refunded: {
      icon: <RestoreOutlined />,
      color: 'warning',
      title: t('notif.paymentRefunded', 'ط¯ظپط¹ط© ظ…ط³طھط±ط¬ط¹ط©'),
      msg: t('notif.paymentRefundedMsg', 'طھظ… ط§ط³طھط±ط¬ط§ط¹ ط¯ظپط¹ط© ط¨ظ‚ظٹظ…ط© {{amount}} {{currency}}.', { amount: n.amount ?? 'â€”', currency: n.currency || '', name: n.projectName }),
      actionUrl: n.projectId ? `/payments?projectId=${n.projectId}` : null,
      actionLabel: t('notif.viewPayments', 'ط¹ط±ط¶ ط§ظ„ط¯ظپط¹ط§طھ'),
    },
    withdrawal_approved: {
      icon: <VerifiedOutlined />,
      color: 'success',
      title: t('notif.withdrawalApproved', 'طھظ…طھ ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ط§ظ„ط³ط­ط¨'),
      msg: t('notif.withdrawalApprovedMsg', 'طھظ…طھ ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ط·ظ„ط¨ ط³ط­ط¨ {{amount}} {{currency}}.', { amount: n.amount ?? 'â€”', currency: n.currency || '' }),
      actionUrl: '/profile',
      actionLabel: t('profile.wallet', 'ط§ظ„ظ…ط­ظپط¸ط©'),
    },
    withdrawal_rejected: {
      icon: <CancelOutlined />,
      color: 'error',
      title: t('notif.withdrawalRejected', 'تم رفض السحب'),
      msg: t('notif.withdrawalRejectedMsg', 'تم رفض طلب سحب {{amount}} {{currency}}.', { amount: n.amount ?? '—', currency: n.currency || '' }),
      actionUrl: '/profile',
      actionLabel: t('profile.wallet', 'المحفظة'),
    },
    connection_request: {
      icon: <PersonAddAlt1Outlined />,
      color: 'info',
      title: t('notif.connectionRequest', 'طلب اتصال جديد'),
      msg: t('notif.connectionRequestMsg', '{{name}} أرسل لك طلب اتصال', { name: getSenderName(n) }),
      actionUrl: '/network',
      actionLabel: t('network.viewRequests', 'عرض الطلبات'),
    },
    connection_accepted: {
      icon: <CheckCircleOutlineOutlined />,
      color: 'success',
      title: t('notif.connectionAccepted', 'تم قبول طلب الاتصال'),
      msg: t('notif.connectionAcceptedMsg', '{{name}} قبل طلب الاتصال الخاص بك', { name: getSenderName(n) }),
      actionUrl: '/network',
      actionLabel: t('network.viewConnections', 'عرض الشبكة'),
    },
    connection_rejected: {
      icon: <CancelOutlined />,
      color: 'warning',
      title: t('notif.connectionRejected', 'تم رفض طلب الاتصال'),
      msg: t('notif.connectionRejectedMsg', '{{name}} رفض طلب الاتصال الخاص بك', { name: getSenderName(n) }),
    },
    follow: {
      icon: <PeopleAltOutlined />,
      color: 'info',
      title: t('notif.follow', 'متابع جديد'),
      msg: n.message || t('notif.followMsg', '{{name}} بدأ بمتابعتك', { name: getSenderName(n) }),
      actionUrl: '/network',
      actionLabel: t('network.viewFollowers', 'عرض المتابعين'),
    },
  }
  return map[n.type] || {
    icon: <InfoOutlined />,
    color: 'info',
    title: t('notif.general', 'ط¥ط´ط¹ط§ط±'),
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
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, unreadCount } = useSelector((s) => s.notifications)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const ITEMS_PER_PAGE = 7

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

  const paginatedItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  return (
    <Box sx={{ height: 'calc(100vh - 88px)', overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 750, mx: 'auto', p: { xs: 2, sm: 3 } }}>
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
            onClick={() => Promise.all(items.filter(n => !n.read).map(n => handleMarkRead(n._id)))}
          >
            {t('dashboard.markAllRead', 'Mark all read')}
          </Button>
        </Stack>

        {loading ? (
          <Stack spacing={1}>
            {[1, 2, 3, 4, 5].map(i => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: RADIUS }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="45%" height={18} />
                    <Skeleton variant="text" width="80%" height={14} sx={{ mt: 0.5 }} />
                    <Skeleton variant="text" width="25%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: RADIUS }} role="status" aria-live="polite">
            <NotificationsOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
            <Typography color="text.secondary">{t('dashboard.noNotifications', 'No notifications yet')}</Typography>
          </Paper>
        ) : (
          <>
            <Stack spacing={1}>
              {paginatedItems.map((n) => {
                const display = getNotificationDisplay(n, t)
                return (
                  <Paper key={n._id} variant="outlined" sx={{
                    p: 2, borderRadius: RADIUS,
                    borderColor: n.read ? 'divider' : alpha(theme.palette[display.color].main, 0.25),
                    bgcolor: n.read ? 'transparent' : alpha(theme.palette[display.color].main, 0.04),
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  
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
                        {display.actionUrl && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<RocketLaunchOutlined sx={{ fontSize: 14 }} />}
                            onClick={(e) => { e.stopPropagation(); navigate(display.actionUrl) }}
                            sx={{
                              mt: 1, fontSize: '0.75rem', textTransform: 'none', fontWeight: 600,
                              color: '#fff', bgcolor: 'primary.main',
                              '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
                            }}
                          >
                            {display.actionLabel}
                          </Button>
                        )}
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
            {page > 0 && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button size="small" variant="text" onClick={() => setPage(p => p - 1)}>
                  {lang === 'ar' ? 'عرض أقل' : 'Show less'}
                </Button>
              </Box>
            )}
            {items.length > (page + 1) * ITEMS_PER_PAGE && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small" variant="outlined" onClick={() => setPage(p => p + 1)}>
                  {lang === 'ar' ? 'عرض المزيد' : 'Show more'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
