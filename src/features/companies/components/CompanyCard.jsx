import { RADIUS } from '@/theme/tokens'
import {
  Box, Avatar, Chip, Stack, Typography, Badge, Divider,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  BusinessOutlined, LocationOnOutlined, PeopleOutlined, WorkOutlineOutlined,
  Verified, ArrowForward, Star,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { fadeUp } from '@/utils/animations'
import { INDUSTRY_COLORS, formatLocation, renderStars } from './shared'
import { resolveCompanyMediaPath } from '@/services/profile'

const MotionCard = motion.create(Box)

export function HeroCompanyCard({ company, t, navigate }) {
  const theme = useTheme()
  const isRtl = theme.direction === 'rtl'

  return (
    <MotionCard
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        minHeight: 340,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 1)}, ${alpha(theme.palette.secondary.main, 0.88)})`,
        color: '#fff',
        transition: 'all 0.4s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 24px 60px ${alpha(theme.palette.primary.main, 0.35)}`,
          '& .hero-arrow': {
            transform: isRtl ? 'translateX(-4px)' : 'translateX(4px)',
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -80,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: alpha('#fff', 0.06),
          pointerEvents: 'none',
        },
      }}
      onClick={() => navigate(`/companies/${company._id || company.id}`)}
    >
      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }} gap={1}>
          <Chip
            icon={<Star sx={{ color: '#FCD34D !important', fontSize: 16 }} />}
            label={t('companies.heroBadge')}
            sx={{
              bgcolor: alpha('#FCD34D', 0.2),
              color: '#FCD34D',
              fontWeight: 700,
              fontSize: '0.75rem',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha('#FCD34D', 0.3)}`,
              mx: 2
            }}
          />
          {company.isVerified && (
            <Chip
              icon={<Verified sx={{ color: '#34D399 !important', fontSize: 16 }} />}
              label={t('companies.verified')}
              sx={{
                bgcolor: alpha('#34D399', 0.2),
                color: '#34D399',
                fontWeight: 600,
                fontSize: '0.75rem',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha('#34D399', 0.3)}`,
              }}
            />
          )}
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Avatar
            src={company.logo ? resolveCompanyMediaPath(company.logo) : undefined}
            sx={{
              width: { xs: 80, md: 110 },
              height: { xs: 80, md: 110 },
              bgcolor:'#fff',
              color: '#fff',
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          >
            {company.name?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              {company.name}
            </Typography>
            {company.description && (
              <Typography sx={{ opacity: 0.88, fontSize: { xs: '0.875rem', md: '1rem' }, color: '#fff', lineHeight: 1.5, maxWidth: 500, mb: 1.5 }} noWrap>
                {company.description}
              </Typography>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 0.8 }}>
              {company.industry && (
                <Chip
                  icon={<BusinessOutlined sx={{ color: 'rgba(255,255,255,0.8) !important' }} />}
                  label={company.industry}
                  size="small"
                  sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 500, backdropFilter: 'blur(4px)' }}
                />
              )}
              {company.location && (
                <Chip
                  icon={<LocationOnOutlined sx={{ color: 'rgba(255,255,255,0.8) !important' }} />}
                  label={formatLocation(company.location)}
                  size="small"
                  sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 500, backdropFilter: 'blur(4px)' }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mt: 3 }}>
          <Stack direction="row" spacing={4}>
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {renderStars(company.averageRating || 0, 20)}
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', ml: 0.5, color: '#fff' }}>
                  {(company.averageRating || 0).toFixed(1)}
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3, color: '#fff' }}>{t('companies.rating')}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PeopleOutlined sx={{ fontSize: 20, opacity: 0.8 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#fff' }}>
                  {company.followersCount ?? company.followers?.length ?? 0}
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3, color: '#fff' }}>{t('companies.followers_other', { count: '' }).trim()}</Typography>
            </Box>
            {company.jobsCount > 0 && (
              <>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <WorkOutlineOutlined sx={{ fontSize: 20, opacity: 0.8 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1.3rem',color: '#fff' }}>
                      {company.jobsCount}
                    </Typography>
                  </Stack>
                  <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3, color: '#fff' }}>{t('jobs.title')}</Typography>
                </Box>
              </>
            )}
          </Stack>
        </Stack>
      </Box>
    </MotionCard>
  )
}

export function CompanyCard({ company, t, navigate, index }) {
  const theme = useTheme()
  const isRtl = theme.direction === 'rtl'
  const industryColor = INDUSTRY_COLORS[company.industry] || theme.palette.primary.main

  return (
    <MotionCard
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6, boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.12)}` }}
      whileTap={{ scale: 0.98 }}
      sx={{
        borderRadius: RADIUS,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        position: 'relative',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.25),
          '& .card-cover-overlay': { opacity: 0.6 },
          '& .card-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
      onClick={() => navigate(`/companies/${company._id || company.id}`)}
    >
      {company.coverPhoto ? (
        <Box
          sx={{
            height: 130,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.75)}, ${alpha(theme.palette.secondary.main, 0.65)}), url(${resolveCompanyMediaPath(company.coverPhoto)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <Box className="card-cover-overlay" sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)', opacity: 0.8, transition: 'opacity 0.3s ease' }} />
        </Box>
      ) : (
        <Box
          sx={{
            height: 130,
            background: `linear-gradient(135deg, ${alpha(industryColor, 0.15)}, ${alpha(industryColor, 0.05)})`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessOutlined sx={{ fontSize: 48, color: alpha(industryColor, 0.2) }} />
          <Box className="card-cover-overlay" sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(industryColor, 0.08)}, transparent)`, opacity: 0.6, transition: 'opacity 0.3s ease' }} />
        </Box>
      )}
      <Box sx={{ p: 2.5, pt: company.coverPhoto ? 0 : 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mt: company.coverPhoto ? -5 : 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              company.isVerified ? (
                <Verified sx={{ fontSize: 16, color: '#10B981', bgcolor: 'background.paper', borderRadius: '50%', p: '2px' }} />
              ) : null
            }
          >
            <Avatar
              src={company.logo ? resolveCompanyMediaPath(company.logo) : undefined}
              sx={{
                width: 60,
                height: 60,
                bgcolor: alpha(industryColor, 0.1),
                color: industryColor,
                fontWeight: 700,
                fontSize: '1.4rem',
                border: '3px solid',
                borderColor: 'background.paper',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            >
              {company.name?.charAt(0)}
            </Avatar>
          </Badge>
          <Box sx={{ minWidth: 0, flex: 1, pt: company.coverPhoto ? 0.5 : 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
              {company.name}
            </Typography>
            {company.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.4 }} noWrap>
                {company.description}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.8} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.6 }}>
          {company.industry && (
            <Chip
              icon={<BusinessOutlined sx={{ fontSize: 13, color: `${industryColor} !important` }} />}
              label={company.industry}
              size="small"
              sx={{
                fontWeight: 500,
                fontSize: '0.72rem',
                bgcolor: alpha(industryColor, 0.06),
                color: industryColor,
                border: `1px solid ${alpha(industryColor, 0.15)}`,
                '& .MuiChip-icon': { color: `${industryColor} !important` },
              }}
            />
          )}
          {company.location && (
            <Chip
              icon={<LocationOnOutlined sx={{ fontSize: 13 }} />}
              label={formatLocation(company.location)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: '0.72rem' }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.8 }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Stack direction="row" spacing={0.3} alignItems="center">
              {renderStars(company.averageRating || 0, 15)}
              <Typography variant="body2" fontWeight={700} sx={{ ml: 0.3 }}>
                {(company.averageRating || 0).toFixed(1)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: 'text.secondary' }}>
              <PeopleOutlined sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={500}>
                {company.followersCount ?? company.followers?.length ?? 0}
              </Typography>
            </Stack>
            {(company.jobsCount ?? 0) > 0 && (
              <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: 'text.secondary' }}>
                <WorkOutlineOutlined sx={{ fontSize: 16 }} />
                <Typography variant="body2" fontWeight={500}>
                  {company.jobsCount}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Typography
            className="card-arrow"
            variant="body2"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              transition: 'all 0.25s ease',
              opacity: 0.7,
              transform: 'translateX(0)',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('companies.viewProfile')}
            <ArrowForward sx={{ fontSize: 14, transform: isRtl ? 'scaleX(-1)' : 'none' }} />
          </Typography>
        </Stack>
      </Box>
    </MotionCard>
  )
}
