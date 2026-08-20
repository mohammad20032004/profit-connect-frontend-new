import { Paper, Box, Typography, Stack, alpha, CircularProgress } from '@mui/material'
import {
  PersonAddAlt1Outlined, PersonOffOutlined, PersonAddOutlined, HourglassTopOutlined,
  PersonRemoveOutlined,
  CheckOutlined, CloseOutlined,
} from '@mui/icons-material'
import Button from '@/ui/Button'
import { getDefaultAvatar } from '@/services/profile'
import { COLORS, fullName } from './shared'

export default function ProfileCard({
  user, variant = 'request', busyId, t, navigate,
  onAccept, onReject, onConnect, onToggleFollow, onRemove, following, status,
  sx,
}) {
  const name = fullName(user)
  const busy = busyId === user._id
  const openProfile = () => navigate(`/user-profile/${user._id}`)
  const defaultImg = getDefaultAvatar(user?.role, user?.profile?.gender)

  const btnSx = { borderRadius: 0.75, py: 0.5, fontSize: '0.72rem' }

  const actionRows = []
  if (variant === 'request') {
    if (onAccept || onReject) {
      actionRows.push(
        <Stack key="respond" direction="row" spacing={0.75} sx={{ width: '100%' }}>
          {onAccept && (
            <Button fullWidth size="small" variant="contained"
              startIcon={<CheckOutlined sx={{ fontSize: 16 }} />}
              onClick={() => onAccept(user)} loading={busy}
              sx={btnSx}>
              {t('network.accept', 'قبول')}
            </Button>
          )}
          {onReject && (
            <Button fullWidth size="small" variant="secondary" color="error"
              startIcon={<CloseOutlined sx={{ fontSize: 16 }} />}
              onClick={() => onReject(user)} loading={busy}
              sx={{ ...btnSx, borderColor: alpha(COLORS.error, 0.4), color: COLORS.error, '&:hover': { bgcolor: alpha(COLORS.error, 0.08), borderColor: COLORS.error } }}>
              {t('network.reject', 'رفض')}
            </Button>
          )}
        </Stack>,
      )
    }
    actionRows.push(
      <Button key="view" fullWidth size="small" variant="outlined" onClick={openProfile}
        sx={btnSx}>
        {t('network.viewProfile', 'عرض الملف الشخصي')}
      </Button>,
    )
  } else {
    if (onToggleFollow || onConnect) {
      actionRows.push(
        <Stack key="follow-connect" direction="row" spacing={0.75} sx={{ width: '100%' }}>
          {onToggleFollow && (
            <Button size="small"
              variant={following ? 'outlined' : 'contained'}
              startIcon={following ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <PersonAddAlt1Outlined sx={{ fontSize: 15 }} />}
              onClick={() => onToggleFollow(user)} loading={busy}
              sx={following
                ? { ...btnSx, flex: 1, minWidth: 0, borderColor: COLORS.purple, color: COLORS.purple, '&:hover': { bgcolor: alpha(COLORS.purple, 0.08), borderColor: COLORS.purple } }
                : { ...btnSx, flex: 1, minWidth: 0, bgcolor: COLORS.purple, '&:hover': { bgcolor: alpha(COLORS.purple, 0.85) } }}>
              {following ? t('network.unfollow', 'إلغاء المتابعة') : t('network.follow', 'متابعة')}
            </Button>
          )}
          {onConnect && (
            <Button size="small"
              variant={status === 'none' ? (onToggleFollow ? 'outlined' : 'contained') : 'outlined'}
              startIcon={status === 'none' ? <PersonAddOutlined sx={{ fontSize: 15 }} /> : <HourglassTopOutlined sx={{ fontSize: 15 }} />}
              onClick={() => onConnect(user)} loading={busy}
              sx={status === 'none'
                ? { ...btnSx, flex: 1, minWidth: 0, bgcolor: COLORS.navy, color: '#fff', '&:hover': { bgcolor: alpha(COLORS.navy, 0.85), color: '#fff' } }
                : { ...btnSx, flex: 1, minWidth: 0, borderColor: COLORS.navy, color: COLORS.navy, '&:hover': { bgcolor: alpha(COLORS.navy, 0.08), borderColor: COLORS.navy } }}>
              {status === 'connected'
                ? t('network.connected', 'متصل')
                : status === 'pending_sent'
                  ? t('network.pending', 'معلق')
                  : t('network.connect', 'اتصال')}
            </Button>
          )}
        </Stack>,
      )
    }
    if (onRemove) {
      actionRows.push(
        <Button key="remove" fullWidth size="small" variant="secondary" color="error"
          startIcon={busy ? <CircularProgress size={15} sx={{ color: COLORS.error }} /> : <PersonRemoveOutlined sx={{ fontSize: 15 }} />}
          onClick={() => onRemove(user)} disabled={busy}
          sx={{ ...btnSx, borderColor: alpha(COLORS.error, 0.4), color: COLORS.error, '&:hover': { bgcolor: alpha(COLORS.error, 0.08), borderColor: COLORS.error } }}>
          {t('network.connectedRemove', 'إزالة')}
        </Button>,
      )
    }
    actionRows.push(
      <Button key="view" fullWidth size="small" variant="outlined" onClick={openProfile}
        sx={btnSx}>
        {t('network.viewProfile', 'عرض الملف الشخصي')}
      </Button>,
    )
  }

  return (
    <Paper variant="outlined" sx={{
      flex: { xs: '0 0 100%', sm: '0 0 240px' },
      maxWidth: { xs: '100%', sm: 250 },
      minWidth: { xs: 0, sm: 200 },
      borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s ease', height: '100%', alignSelf: 'flex-start',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(31,10,59,0.12)', borderColor: alpha(COLORS.primary, 0.3), transform: 'translateY(-2px)',
      },
      ...(sx || {}),
    }}>
      <Box
        onClick={openProfile}
        sx={{
          position: 'relative', width: '100%', paddingTop: '66.7%', bgcolor: alpha(COLORS.primary, 0.06),
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        {user?.profile?.avatar ? (
          <Box
            component="img"
            src={user.profile.avatar}
            alt={name}
            onError={(e) => { e.target.src = defaultImg }}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            component="img"
            src={defaultImg}
            alt={name}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </Box>

      <Box sx={{ p: 1.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
        <Typography
          variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.88rem', cursor: 'pointer', '&:hover': { color: COLORS.primary } }}
          onClick={openProfile}
        >
          {name}
        </Typography>

       

        {actionRows.length > 0 && (
          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {actionRows}
          </Box>
        )}
      </Box>
    </Paper>
  )
}