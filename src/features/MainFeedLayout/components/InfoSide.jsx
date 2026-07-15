import { Avatar, Box, Chip, Typography, Stack, alpha, Divider, Paper } from '@mui/material'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import {
  LocationOnOutlined,
  PeopleAltOutlined,
  PersonOutlineOutlined,
  PostAddOutlined,
  BuildOutlined,
  BookmarkBorderOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function InfoSide() {
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const { t } = useTranslation()
  const avatarSrc = profile?.avatar
  const Rscore = profile?.rScore || 0
  const skills = user?.professional?.skills || []

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', minWidth: 280, maxWidth: 320 }} role="complementary" aria-label={t('profile.profileCard', 'Profile Card')}>
      {/* Profile Header Section */}
      <Box sx={{ textAlign: 'center', pt: 3, pb: 2, px: 2.5 }}>
        <Avatar
          src={avatarSrc}
          alt={fullName}
          aria-label={t('profile.profilePicture', 'Profile Picture')}
          sx={(theme) => ({
            width: 88,
            height: 88,
            mx: 'auto',
            mb: 1.5,
            border: '3px solid',
            borderColor: alpha(theme.palette.primary.main, 0.25),
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.1)}`,
            fontSize: '1.75rem',
            fontWeight: 700,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          })}
        >
          {fullName?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {fullName}
        </Typography>

        {profile?.headline && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1, lineHeight: 1.4, display: 'block' }}>
            {profile.headline}
          </Typography>
        )}

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'center', mt: 1.25, flexWrap: 'wrap', gap: 0.5 }}>
          {user?.role && <Chip label={user.role} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />}
          {profile?.location && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '0.7rem' }}>
              <LocationOnOutlined sx={{ fontSize: 12 }} />
              {profile.location}
            </Typography>
          )}
        </Stack>

        <Chip
          icon={
            Rscore >= 4000
              ? <Box component="img" src="/Images/High-Score.gif" sx={{ width: 16, height: 16 }} />
              : <WorkspacePremiumRounded sx={{ color: 'primary.light', fontSize: 16 }} />
          }
          label={`${t('profile.rScore')}: ${Rscore}`}
          sx={{
            mt: 1.25,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            color: 'primary.dark',
            fontWeight: 700,
            fontSize: '0.75rem',
            height: 28,
            borderRadius: 1.5,
            '& .MuiChip-icon': { ml: 0.5 },
          }}
        />
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Stats Section */}
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ py: 1.5, px: 1 }}>
        <Box sx={{ flex: 1, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover', borderRadius: 1 }, transition: 'all 0.2s' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: 'text.primary' }}>{profile?.postsCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, fontSize: '0.68rem', mt: 0.25 }}>
            <PostAddOutlined sx={{ fontSize: 12 }} />
            {t('profile.posts')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover', borderRadius: 1 }, transition: 'all 0.2s' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: 'text.primary' }}>{profile?.followersCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, fontSize: '0.68rem', mt: 0.25 }}>
            <PeopleAltOutlined sx={{ fontSize: 12 }} />
            {t('profile.followers')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover', borderRadius: 1 }, transition: 'all 0.2s' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: 'text.primary' }}>{profile?.followingCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, fontSize: '0.68rem', mt: 0.25 }}>
            <PersonOutlineOutlined sx={{ fontSize: 12 }} />
            {t('profile.following')}
          </Typography>
        </Box>
      </Stack>

      {/* Skills Section */}
      {skills.length > 0 && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ px: 2, py: 1.75 }} role="list" aria-label={t('profile.skills', 'Skills')}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {skills.slice(0, 8).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  role="listitem"
                  icon={<BuildOutlined sx={{ fontSize: 12 }} aria-hidden="true" />}
                  sx={{ height: 26, fontSize: '0.72rem', fontWeight: 500, borderRadius: 1.5, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                />
              ))}
              {skills.length > 8 && (
                <Chip
                  component={Link}
                  to="/profile"
                  label={t('profile.more', 'More')}
                  size="small"
                  sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', cursor: 'pointer', '&:hover': { bgcolor: 'primary.dark' } }}
                />
              )}
            </Stack>
          </Box>
        </>
      )}

      <Divider sx={{ mx: 2 }} />

      {/* Saved Posts Link */}
      <Box component={Link} to="/profile/savedPosts" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, textDecoration: 'none', color: 'text.primary', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover', '& .savedIcon': { color: 'primary.main' } } }}>
        <BookmarkBorderOutlined className="savedIcon" sx={{ color: 'text.secondary', fontSize: 18, transition: 'color 0.2s' }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          {t('profile.savedPosts', 'Saved Posts')}
        </Typography>
      </Box>
    </Paper>
  )
}
