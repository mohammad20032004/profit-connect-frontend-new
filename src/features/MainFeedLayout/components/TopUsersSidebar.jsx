import { useState, useEffect } from 'react'
import { Box, Typography, Avatar, CircularProgress, Stack, alpha, Divider, Chip } from '@mui/material'
import { ErrorOutlined, WorkspacePremiumRounded, ArrowForwardRounded, EmojiEventsRounded } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { getTopUsers, resolveMediaPath } from '@/services/profile'

export default function TopUsersSidebar({ variant = 'default' }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTopUsers(10)
        if (res?.success) setUsers(res.data)
        else setError('Failed to load')
      } catch {
        setError('Could not load')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const displayUsers = users.slice(0, 3)
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']

  return (
    <Box
      sx={variant === 'plain'
        ? { width: '100%' }
        : {
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minWidth: 280,
            maxWidth: 320,
          }}
      role="complementary"
      aria-label={t('sidebar.topUsers')}
    >
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{
          width: 24, height: 24, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(theme.palette.warning.main, 0.12),
        }}>
          <EmojiEventsRounded sx={{ fontSize: 14, color: theme.palette.warning.main }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
          {t('sidebar.topUsers')}
        </Typography>
      </Box>


      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
        </Box>
      ) : error || users.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutlined sx={{ fontSize: 28, color: alpha(theme.palette.text.disabled, 0.5), mb: 0.5 }} />
          <Typography variant="caption" color="text.disabled">
            {error || t('sidebar.noUsers')}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0} sx={{ py: 1 }}>
          {displayUsers.map((user, index) => {
            const profile = user.profile || {}
            const fullName = profile.fullname || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.username
            const avatarSrc = resolveMediaPath(profile.avatar)
            const isTopThree = index < 3
            return (
              <Box
                key={user._id || user.id}
                component={Link}
                to={`/user-profile/${user._id || user.id}`}
                role="listitem"
                aria-label={`${fullName}, R-Score: ${profile.rScore ?? 'N/A'}`}
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  alignItems: 'center',
                  textDecoration: 'none',
                  px: 2,
                  py: 1,
                  mx: 1,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    '& .userName': { color: 'primary.main' },
                    '& .userArrow': { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                {/* Rank Medal */}
                {isTopThree ? (
                  <Box sx={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(medalColors[index], 0.15),
                    border: `1px solid ${alpha(medalColors[index], 0.4)}`,
                    fontSize: '0.6rem', fontWeight: 800, color: medalColors[index],
                  }}>
                    {index + 1}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{
                    width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: 'text.disabled',
                  }}>
                    {index + 1}
                  </Typography>
                )}

                <Avatar
                  src={avatarSrc}
                  alt={fullName}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  }}
                >
                  {fullName?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    className="userName"
                    variant="body2"
                    noWrap
                    sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3, transition: 'color 0.2s', color: 'text.primary' }}
                  >
                    {fullName}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ display: 'block', fontSize: '0.65rem', color: 'text.secondary', mt: 0.25, lineHeight: 1.2 }}>
                    {profile.headline || user.role || ''}
                  </Typography>
                </Box>

                <Chip
                  icon={<WorkspacePremiumRounded sx={{ fontSize: 12, color: theme.palette.warning.main }} />}
                  label={profile.rScore ?? 0}
                  size="small"
                  sx={{
                    height: 22, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.dark,
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />

                <ArrowForwardRounded
                  className="userArrow"
                  sx={{ fontSize: 16, color: 'text.disabled', opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s', flexShrink: 0 }}
                />
              </Box>
            )
          })}

          {users.length > 3 && (
            <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
              <Box
                component={Link}
                to="/network"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 0.75,
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
              >
                {t('sidebar.viewAll')}
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}
