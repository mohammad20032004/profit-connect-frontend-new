import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Snackbar, Alert, Typography, Box, Stack, IconButton, Button, useTheme, alpha,
} from '@mui/material'
import { CloseOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlineOutlined, CancelOutlined, WorkOutlineOutlined,
  StarBorderOutlined, InfoOutlined, GppMaybeOutlined, RocketLaunchOutlined,
  PaymentsOutlined, AccountBalanceWalletOutlined, RestoreOutlined, VerifiedOutlined,
  PersonAddAlt1Outlined, PeopleAltOutlined,
} from '@mui/icons-material'
import { getRecentNotifications } from '@/services/notificationService'
import { addNotifications } from '@/redux/slices/notificationSlice'

function getSenderName(n) {
  if (n.senderName) return n.senderName
  if (n.sender?.profile?.fullname) return n.sender.profile.fullname
  if (n.sender?.profile?.firstName || n.sender?.profile?.lastName) {
    return `${n.sender.profile.firstName || ''} ${n.sender.profile.lastName || ''}`.trim()
  }
  if (n.sender?.username) return n.sender.username
  return 'Someone'
}

const TYPE_CONFIG = {
  proposal_accepted: {
    severity: 'success',
    icon: <CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.accepted',
    titleFallback: 'Proposal Accepted',
    msgKey: 'notif.acceptedMsg',
    msgFallback: 'Your proposal has been accepted',
    interpolate: (n) => ({ name: n.projectName }),
  },
  proposal_rejected: {
    severity: 'error',
    icon: <CancelOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.rejected',
    titleFallback: 'Proposal Rejected',
    msgKey: 'notif.rejectedMsg',
    msgFallback: 'Your proposal has been rejected',
    interpolate: (n) => ({ name: n.projectName }),
  },
  proposal_new: {
    severity: 'info',
    icon: <WorkOutlineOutlined sx={{ fontSize: 20 }} />,
    duration: 4000,
    titleKey: 'notif.newProposal',
    titleFallback: 'New Proposal',
    msgKey: 'notif.toastNewProposalMsg',
    msgFallback: 'A new proposal was submitted',
    interpolate: (n) => ({ name: n.projectName }),
  },
  proposal_received: {
    severity: 'info',
    icon: <WorkOutlineOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.proposalReceived',
    titleFallback: 'New Proposal on Your Project',
    msgKey: 'notif.proposalReceivedMsg',
    msgFallback: 'A new proposal was submitted on your project',
    interpolate: (n) => ({ name: n.projectName }),
    actionUrl: (n) => (n.projectId ? `/myProject/${n.projectId}` : null),
    actionLabelKey: 'notif.viewProposals',
    actionLabelFallback: 'View Proposals',
  },
  project_completed: {
    severity: 'success',
    icon: <CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.completed',
    titleFallback: 'Project Completed',
    msgKey: 'notif.completedMsg',
    msgFallback: 'Project has been completed',
    interpolate: (n) => ({ name: n.projectName }),
  },
  rating_received: {
    severity: 'warning',
    icon: <StarBorderOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.rating',
    titleFallback: 'New Rating',
    msgKey: 'notif.ratingMsg',
    msgFallback: 'A client rated you',
    interpolate: (n) => ({ name: n.projectName, client: n.clientName }),
  },
  ai_detected: {
    severity: 'warning',
    icon: <GppMaybeOutlined sx={{ fontSize: 20 }} />,
    duration: 8000,
    titleKey: 'notif.aiDetected',
    titleFallback: 'AI Content Detected',
    msgKey: 'notif.aiDetectedToast',
    msgFallback: 'AI-generated content detected — may affect R-Score',
    interpolate: (n) => ({ probability: n.aiProbability ?? '—' }),
  },
  company_setup: {
    severity: 'info',
    icon: <RocketLaunchOutlined sx={{ fontSize: 20 }} />,
    duration: 10000,
    titleKey: 'notif.companySetup',
    titleFallback: 'Complete Your Company Setup',
    msgKey: 'notif.companySetupMsg',
    msgFallback: 'Complete your company page to start posting jobs and projects',
    actionUrl: '/employer/setup',
    actionLabelKey: 'notif.companySetupAction',
    actionLabelFallback: 'Setup Now',
  },
  payment_deposited: {
    severity: 'success',
    icon: <PaymentsOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.paymentDeposited',
    titleFallback: 'Payment Deposited',
    msgKey: 'notif.paymentDepositedMsg',
    msgFallback: 'A payment has been deposited for you and is held in escrow',
    interpolate: (n) => ({ amount: n.amount ?? '—', currency: n.currency || '', name: n.projectName }),
    actionUrl: (n) => (n.projectId ? `/payments?projectId=${n.projectId}` : null),
    actionLabelKey: 'notif.viewPayments',
    actionLabelFallback: 'View Payments',
  },
  payment_released: {
    severity: 'success',
    icon: <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.paymentReleased',
    titleFallback: 'Payment Released',
    msgKey: 'notif.paymentReleasedMsg',
    msgFallback: 'A payment has been released to your wallet',
    interpolate: (n) => ({ amount: n.amount ?? '—', currency: n.currency || '', name: n.projectName }),
    actionUrl: (n) => (n.projectId ? `/payments?projectId=${n.projectId}` : null),
    actionLabelKey: 'notif.viewPayments',
    actionLabelFallback: 'View Payments',
  },
  payment_refunded: {
    severity: 'warning',
    icon: <RestoreOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.paymentRefunded',
    titleFallback: 'Payment Refunded',
    msgKey: 'notif.paymentRefundedMsg',
    msgFallback: 'A payment was refunded',
    interpolate: (n) => ({ amount: n.amount ?? '—', currency: n.currency || '', name: n.projectName }),
    actionUrl: (n) => (n.projectId ? `/payments?projectId=${n.projectId}` : null),
    actionLabelKey: 'notif.viewPayments',
    actionLabelFallback: 'View Payments',
  },
  withdrawal_approved: {
    severity: 'success',
    icon: <VerifiedOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.withdrawalApproved',
    titleFallback: 'Withdrawal Approved',
    msgKey: 'notif.withdrawalApprovedMsg',
    msgFallback: 'Your withdrawal has been approved',
    interpolate: (n) => ({ amount: n.amount ?? '—', currency: n.currency || '' }),
    actionUrl: '/profile',
    actionLabelKey: 'profile.wallet',
    actionLabelFallback: 'Wallet',
  },
  withdrawal_rejected: {
    severity: 'error',
    icon: <CancelOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.withdrawalRejected',
    titleFallback: 'Withdrawal Rejected',
    msgKey: 'notif.withdrawalRejectedMsg',
    msgFallback: 'Your withdrawal request was rejected',
    interpolate: (n) => ({ amount: n.amount ?? '—', currency: n.currency || '' }),
    actionUrl: '/profile',
    actionLabelKey: 'profile.wallet',
    actionLabelFallback: 'Wallet',
  },
  connection_request: {
    severity: 'info',
    icon: <PersonAddAlt1Outlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.connectionRequest',
    titleFallback: 'New Connection Request',
    msgKey: 'notif.connectionRequestMsg',
    msgFallback: '{{name}} sent you a connection request',
    interpolate: (n) => ({ name: getSenderName(n) }),
    actionUrl: '/network',
    actionLabelKey: 'network.viewRequests',
    actionLabelFallback: 'View Requests',
  },
  connection_accepted: {
    severity: 'success',
    icon: <CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />,
    duration: 6000,
    titleKey: 'notif.connectionAccepted',
    titleFallback: 'Connection Accepted',
    msgKey: 'notif.connectionAcceptedMsg',
    msgFallback: '{{name}} accepted your connection request',
    interpolate: (n) => ({ name: getSenderName(n) }),
    actionUrl: '/network',
    actionLabelKey: 'network.viewConnections',
    actionLabelFallback: 'View Network',
  },
  connection_rejected: {
    severity: 'warning',
    icon: <CancelOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.connectionRejected',
    titleFallback: 'Connection Request Declined',
    msgKey: 'notif.connectionRejectedMsg',
    msgFallback: '{{name}} declined your connection request',
    interpolate: (n) => ({ name: getSenderName(n) }),
  },
  follow: {
    severity: 'info',
    icon: <PeopleAltOutlined sx={{ fontSize: 20 }} />,
    duration: 5000,
    titleKey: 'notif.follow',
    titleFallback: 'New Follower',
    msgKey: 'notif.followMsg',
    msgFallback: '{{name}} started following you',
    interpolate: (n) => ({ name: getSenderName(n) }),
    actionUrl: '/network',
    actionLabelKey: 'network.viewFollowers',
    actionLabelFallback: 'View Followers',
  },
}

const FALLBACK = {
  severity: 'info',
  icon: <InfoOutlined sx={{ fontSize: 20 }} />,
  duration: 4000,
  titleKey: 'notif.general',
  titleFallback: 'Notification',
  msgKey: null,
  msgFallback: '',
  interpolate: () => ({}),
}

function getToastConfig(type) {
  return TYPE_CONFIG[type] || FALLBACK
}

export default function NotificationProvider({ children }) {
  const dispatch = useDispatch()
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
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

          newOnes.forEach((n) => {
            if ((n.type === 'proposal_received' || n.type === 'proposal_new') && n.projectId) {
              window.dispatchEvent(new CustomEvent('proposal:received', { detail: { projectId: n.projectId } }))
            }
          })

          const latest = newOnes[newOnes.length - 1]
          const cfg = getToastConfig(latest.type)
          setToast({
            key: latest._id,
            notification: latest,
            ...cfg,
            title: t(cfg.titleKey, cfg.titleFallback),
            msg: cfg.msgKey
              ? t(cfg.msgKey, cfg.msgFallback, cfg.interpolate(latest))
              : cfg.msgFallback,
            actionUrl: typeof cfg.actionUrl === 'function' ? cfg.actionUrl(latest) : (cfg.actionUrl || null),
            actionLabel: cfg.actionLabelKey
              ? t(cfg.actionLabelKey, cfg.actionLabelFallback)
              : cfg.actionLabelFallback || null,
          })
        }
      }
    } catch { /* ignore */ }
  }, [dispatch, isAuthenticated, t])

  useEffect(() => {
    if (!isAuthenticated) return
    poll()
    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [poll, isAuthenticated])

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return
    setToast(null)
  }

  const severityColor = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  }

  return (
    <>
      {children}
      <Snackbar
        open={!!toast}
        autoHideDuration={toast?.duration || 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: isRtl ? 'right' : 'left' }}
        sx={{ mt: 8, mx: 2 }}
      >
        <Alert
          onClose={handleClose}
          severity={toast?.severity || 'info'}
          variant="filled"
          icon={false}
          
          
          sx={{
            width: '100%',
            minWidth: 340,
            maxWidth: 460,
            alignItems: 'stretch',
            p: 0,
            overflow: 'hidden',
            borderRadius: 1,
            fontFamily: theme.typography.fontFamily,
            boxShadow: `0 8px 32px ${alpha(theme.palette[toast?.severity || 'info'].main, 0.35)}`,
            borderInlineStart: `4px solid ${severityColor[toast?.severity || 'info']}`,
            '& .MuiAlert-message': { flex: 1, minWidth: 0, p: 0 },
            '& .MuiAlert-action': { p: 0, my: 0, alignItems: 'stretch' },
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ p: 1.75, width: '100%', alignItems: 'flex-start' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              mx: 1.5
            }}>
              {toast?.icon || <InfoOutlined sx={{ fontSize: 21 }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.35, color: '#fff', fontFamily: 'inherit' }}>
                {toast?.title}
              </Typography>
              {toast?.msg && (
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: alpha('#fff', 0.9), display: 'block', mt: 0.5, fontFamily: 'inherit' }}>
                  {toast?.msg}
                </Typography>
              )}
            </Box>
          </Stack>
        </Alert>
      </Snackbar>
    </>
  )
}
