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
import Button from '@/ui/Button'

export default function InfoSide() {
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const { t } = useTranslation()
  const avatarSrc = profile?.avatar
  const Rscore = profile?.rScore || 0
  const skills = user?.professional?.skills || []

  return (
    <Paper elevation={0} sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', minWidth:300 }}>
      <Box sx={{ textAlign: 'center', pt: 4, pb: 2.5, px: 2 }}>
        <Avatar
          src={avatarSrc}
          sx={(theme) => ({
            width: 110,
            height: 110,
            mx: 'auto',
            mb: 2,
            border: '3px solid',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
          })}
        >
          {fullName?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
          {fullName}
        </Typography>

        {profile?.headline && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, px: 1, lineHeight: 1.4 }}>
            {profile.headline}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
          {user?.role && <Chip label={user.role} size="small" color="primary" variant="outlined" sx={{ height: 24 }} />}
          {profile?.location && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              {profile.location}
            </Typography>
          )}
        </Stack>

        <Chip
          icon={
            Rscore >= 4000
              ? <Box component="img" src="/Images/High-Score.gif" sx={{ width: 18, height: 18 }} />
              : <WorkspacePremiumRounded sx={{ color: 'primary.light', fontSize: 18 }} />
          }
          label={`${t('profile.rScore')}: ${Rscore}`}
          sx={{
            mt: 1.5,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.dark',
            fontWeight: 700,
            height: 30,
            borderRadius: 1.5,
            '& .MuiChip-icon': { ml: 0.5 },
          }}
        />
      </Box>

      <Divider />

      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ py: 1.5 }}>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{profile?.postsCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
            <PostAddOutlined sx={{ fontSize: 13 }} />
            {t('profile.posts')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{profile?.followersCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
            <PeopleAltOutlined sx={{ fontSize: 13 }} />
            {t('profile.followers')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{profile?.followingCount ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
            <PersonOutlineOutlined sx={{ fontSize: 13 }} />
            {t('profile.following')}
          </Typography>
        </Box>
      </Stack>

      {skills.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {skills.slice(0, 8).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  icon={<BuildOutlined sx={{ fontSize: 13 }} />}
                  sx={{ height: 26, borderRadius: 1.5 }}
                />
              ))}
              {skills.length > 8 && (
                <Button
                  component={Link}
                  to="/profile"
                  size="small"
                  sx={{ height: 26, borderRadius: 1.5, textTransform: 'none', px: 1.5 }}
                >
                  {t('profile.more', 'More')}
                </Button>
              )}
            </Stack>
          </Box>
        </>
      )}

      <Divider />

      <Box component={Link} to="/profile/savedPosts" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.8, textDecoration: 'none', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
        <BookmarkBorderOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="bold">
          {t('profile.savedPosts', 'Saved Posts')}
        </Typography>
      </Box>
    </Paper>
  )
}
