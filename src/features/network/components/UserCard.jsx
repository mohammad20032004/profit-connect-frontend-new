import { Paper, Box, Typography, Stack, alpha, CircularProgress, Avatar, IconButton, Tooltip, Chip } from '@mui/material'
import {
  PersonAddOutlined, PersonAddAlt1Outlined, HourglassTopOutlined, PeopleAltOutlined, PersonOffOutlined,
  CheckOutlined, CloseOutlined, PersonRemoveOutlined, StarBorderOutlined, WorkOutlineOutlined,
} from '@mui/icons-material'
import Button from '@/ui/Button'
import { resolveMediaPath } from '@/services/profile'
import { COLORS, fullName } from './shared'

export default function UserCard({ user, status, following, onConnect, onAccept, onReject, onCancel, onRemove, onToggleFollow, busyId, t, navigate, sx }) {
  const avatarSrc = resolveMediaPath(user?.profile?.avatar)
  const name = fullName(user)
  const headline = user?.profile?.headline || user?.headline || ''
  const followersCount = user?.profile?.followersCount
  const rScore = user?.profile?.rScore
  const years = user?.professional?.yearsOfExperience
  const skills = user?.professional?.skills || []
  const role = user?.role
  const roleLabel = role ? t(`network.roles.${role}`, role) : ''

  return (
    <Paper variant="outlined" sx={{
      p: 1.75, borderRadius: 1.5, display: 'flex', gap: 1.5, alignItems: 'center',
      transition: 'all 0.2s ease',
      '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(COLORS.primary, 0.25), transform: 'translateY(-2px)' },
      ...(sx || {}),
    }}>
      <Avatar
        src={avatarSrc}
        sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700 }}
      >
        {name?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ cursor: 'pointer', '&:hover': { color: COLORS.primary } }}
          onClick={() => navigate(`/user-profile/${user._id}`)}>
          {name}
        </Typography>
        {headline && (
          <Typography variant="caption" color="text.secondary" noWrap>{headline}</Typography>
        )}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
          {roleLabel && (
            <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, borderRadius: 0.5 }} />
          )}
          {followersCount != null && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <PeopleAltOutlined sx={{ fontSize: 13 }} />
              {followersCount}
            </Typography>
          )}
          {rScore != null && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <StarBorderOutlined sx={{ fontSize: 13, color: COLORS.warning }} />
              {rScore}
            </Typography>
          )}
          {years != null && years > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <WorkOutlineOutlined sx={{ fontSize: 13 }} />
              {t('network.yearsExp', '{{count}}y', { count: years })}
            </Typography>
          )}
          {skills.slice(0, 3).map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.62rem', borderRadius: 0.5 }} />
          ))}
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {onToggleFollow && (
          <Button
            size="small"
            variant={following ? 'outlined' : 'contained'}
            color={following ? 'error' : 'primary'}
            startIcon={following ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <PersonAddAlt1Outlined sx={{ fontSize: 15 }} />}
            onClick={() => onToggleFollow(user)}
            disabled={busyId === user._id}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1 }}
          >
            {following ? t('network.unfollow', 'Unfollow') : t('network.follow', 'Follow')}
          </Button>
        )}

        {onConnect && (
          <Button
            size="small"
            variant={status === 'none' ? 'contained' : 'outlined'}
            disabled={busyId === user._id}
            startIcon={status === 'none' ? <PersonAddOutlined sx={{ fontSize: 15 }} /> : <HourglassTopOutlined sx={{ fontSize: 15 }} />}
            onClick={() => onConnect(user)}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1 }}
          >
            {status === 'connected'
              ? t('network.connected', 'Connected')
              : status === 'pending_sent'
                ? t('network.pending', 'Pending')
                : t('network.connect', 'Connect')}
          </Button>
        )}

        {onAccept && (
          <>
            <Tooltip title={t('network.accept', 'Accept')}>
              <span>
                <IconButton size="small" color="success" onClick={() => onAccept(user)} disabled={busyId === user._id}>
                  <CheckOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('network.reject', 'Reject')}>
              <span>
                <IconButton size="small" color="error" onClick={() => onReject(user)} disabled={busyId === user._id}>
                  <CloseOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {onCancel && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onCancel(user)}
            disabled={busyId === user._id}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1 }}
          >
            {t('network.cancel', 'Cancel')}
          </Button>
        )}

        {onRemove && (
          <Tooltip title={t('network.remove', 'Remove connection')}>
            <span>
              <IconButton size="small" color="error" onClick={() => onRemove(user)} disabled={busyId === user._id}>
                {busyId === user._id ? <CircularProgress size={16} /> : <PersonRemoveOutlined sx={{ fontSize: 18 }} />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  )
}
