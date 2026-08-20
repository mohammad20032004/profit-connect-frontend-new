import { Paper, Typography, Stack, alpha, Chip } from '@mui/material'
import { EmojiEventsOutlined, StarBorderOutlined, PeopleAltOutlined, PersonOffOutlined, PersonAddAlt1Outlined } from '@mui/icons-material'
import Button from '@/ui/Button'
import UserAvatar from '@/components/common/UserAvatar'
import { COLORS, fullName } from './shared'

export default function TopUserCard({ user, rank, following, onToggleFollow, busyId, t, navigate, isRTL, sx }) {
  const name = fullName(user)
  const headline = user?.profile?.headline || ''
  const rScore = user?.profile?.rScore
  const followersCount = user?.profile?.followersCount
  const skills = (user?.professional?.skills || []).slice(0, 3)
  const roleLabel = user?.role ? t(`network.roles.${user.role}`, user.role) : ''
  const medalColor = rank === 1 ? '#D4AF37' : rank === 2 ? '#A9A9A9' : rank === 3 ? '#CD7F32' : null
  const corner = isRTL ? { left: 10 } : { right: 10 }

  return (
    <Paper variant="outlined" sx={{
      width: 200, flex: '0 0 auto', p: 2, borderRadius: 1.5, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
      position: 'relative', transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(31,10,59,0.1)', borderColor: alpha(COLORS.primary, 0.25), transform: 'translateY(-2px)',
      },
      ...(sx || {}),
    }}>
      {rank <= 3 ? (
        <EmojiEventsOutlined sx={{ fontSize: 22, color: medalColor, position: 'absolute', top: 10, ...corner }} />
      ) : (
        <Typography variant="caption" fontWeight={800} sx={{ position: 'absolute', top: 8, ...(isRTL ? { left: 12 } : { right: 12 }), color: 'text.disabled' }}>
          #{rank}
        </Typography>
      )}

      <UserAvatar
        src={user?.profile?.avatar}
        name={name}
        role={user?.role}
        gender={user?.profile?.gender}
        sx={{ width: 72, height: 72, mt: 1, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700, fontSize: '1.4rem' }}
      />

      <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ maxWidth: '100%', cursor: 'pointer', '&:hover': { color: COLORS.primary } }}
        onClick={() => navigate(`/user-profile/${user._id}`)}>
        {name}
      </Typography>

      {roleLabel && (
        <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, borderRadius: 0.5 }} />
      )}

      {headline && (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, height: 34, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {headline}
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
        {rScore != null && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
            <StarBorderOutlined sx={{ fontSize: 14, color: COLORS.warning }} />
            {rScore}
          </Typography>
        )}
        {followersCount != null && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
            <PeopleAltOutlined sx={{ fontSize: 14 }} />
            {followersCount}
          </Typography>
        )}
      </Stack>

      {skills.length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
          {skills.map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.6rem', borderRadius: 0.5 }} />
          ))}
        </Stack>
      )}

      <Button
        fullWidth
        size="small"
        variant={following ? 'outlined' : 'contained'}
        color={following ? 'error' : 'primary'}
        startIcon={following ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <PersonAddAlt1Outlined sx={{ fontSize: 15 }} />}
        onClick={() => onToggleFollow(user)}
        disabled={busyId === user._id}
        sx={{ mt: 'auto', pt: 0.75, pb: 0.75, textTransform: 'none', fontSize: '0.75rem', borderRadius: 1 }}
      >
        {following ? t('network.unfollow', 'Unfollow') : t('network.follow', 'Follow')}
      </Button>
    </Paper>
  )
}
