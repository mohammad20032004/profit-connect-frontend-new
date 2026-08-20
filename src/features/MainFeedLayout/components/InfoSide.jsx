import { Box, Chip, Typography, Stack, alpha, Divider } from '@mui/material'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import {
  LocationOnOutlined,
  PeopleAltOutlined,
  PersonOutlineOutlined,
  PostAddOutlined,
  BookmarkBorderOutlined,
  PhotoLibraryOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import UserAvatar from '@/components/common/UserAvatar'

export default function InfoSide({ variant = 'default' }) {
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const { t } = useTranslation()
  const avatarSrc = profile?.avatar
  const Rscore = profile?.rScore || 0

  const surfaceSx = variant === 'plain'
    ? { width: '100%' }
    : { borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', minWidth: 280, maxWidth: 320, bgcolor: 'background.paper' }

  return (
    <Box sx={surfaceSx} role="complementary" aria-label={t('profile.profileCard', 'Profile Card')}>
      {/* Profile Header Section */}
      <Box sx={{ textAlign: 'center', pt: 3, pb: 2, px: 2.5 }}>
        <UserAvatar
          src={avatarSrc}
          name={fullName}
          role={user?.role}
          gender={profile?.gender}
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
        />

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


      {/* Gallery Link */}
      <Box component={Link} to="/gallery" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, textDecoration: 'none', color: 'text.primary', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover', '& .savedIcon': { color: 'primary.main' } } }}>
        <PhotoLibraryOutlined className="savedIcon" sx={{ color: 'text.secondary', fontSize: 18, transition: 'color 0.2s' }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          {t('profile.gallery', 'Gallery')}
        </Typography>
      </Box>


      {/* Saved Posts Link */}
      <Box component={Link} to="/profile/savedPosts" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, textDecoration: 'none', color: 'text.primary', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover', '& .savedIcon': { color: 'primary.main' } } }}>
        <BookmarkBorderOutlined className="savedIcon" sx={{ color: 'text.secondary', fontSize: 18, transition: 'color 0.2s' }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          {t('profile.savedPosts', 'Saved Posts')}
        </Typography>
      </Box>
    </Box>
  )
}
