import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Snackbar, Alert, Typography, Box, Stack, IconButton, useTheme, alpha,
} from '@mui/material'
import { CloseOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlineOutlined, CancelOutlined, WorkOutlineOutlined,
  StarBorderOutlined, InfoOutlined, GppMaybeOutlined, RocketLaunchOutlined,
} from '@mui/icons-material'
import { getRecentNotifications } from '@/services/notificationService'
import { addNotifications } from '@/redux/slices/notificationSlice'

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
            actionUrl: cfg.actionUrl || null,
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
          action={
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {toast?.actionUrl && (
                <IconButton
                  size="small"
                  onClick={() => { window.location.href = toast.actionUrl; setToast(null) }}
                  sx={{
                    color: '#fff', bgcolor: alpha('#fff', 0.15),
                    fontSize: '0.7rem', fontWeight: 700, px: 1, borderRadius: 1,
                    '&:hover': { bgcolor: alpha('#fff', 0.25) },
                  }}
                >
                  <RocketLaunchOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                  {toast.actionLabel}
                </IconButton>
              )}
              <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit', opacity: 0.8, width: 35, height: 35, mx: 1.5 }}>
                <CloseOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          }
          sx={{
            width: '100%',
            minWidth: 320,
            maxWidth: 450,
            alignItems: 'flex-start',
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette[toast?.severity || 'info'].main, 0.35)}`,
            borderLeft: isRtl ? 'none' : `4px solid ${severityColor[toast?.severity || 'info']}`,
            borderRight: isRtl ? `4px solid ${severityColor[toast?.severity || 'info']}` : 'none',
            p: 0,
            overflow: 'hidden',
            '& .MuiAlert-icon': { display: 'none' },
            '& .MuiAlert-action': { pt: 0.5 },
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ p: 1.5, width: '100%' }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha('#fff', 0.2),
              color: '#fff',
            }}>
              {toast?.icon || <InfoOutlined sx={{ fontSize: 20 }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3, color: '#fff' }}>
                {toast?.title}
              </Typography>
              {toast?.msg && (
                <Typography variant="caption" sx={{ lineHeight: 1.4, color: alpha('#fff', 0.88), display: 'block', mt: 0.25 }}>
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
