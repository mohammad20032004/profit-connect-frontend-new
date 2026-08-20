import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Stack, Avatar, Chip, TextField, InputAdornment,
  MenuItem, Divider, Skeleton, Badge, IconButton, LinearProgress,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Button from '@/ui/Button'
import {
  BusinessOutlined, LocationOnOutlined, PeopleOutlined, Search as SearchIcon,
  StarOutlined, Star, FilterListOutlined, Verified, ArrowForward, WorkOutlineOutlined,
  ClearOutlined, TrendingUpOutlined, CancelOutlined, DomainOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanies } from '@/services/companyService'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerContainer, staggerFast, scaleIn } from '@/utils/animations'

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Box)

const INDUSTRY_OPTIONS = [
  'web-development', 'mobile-development', 'ai-ml', 'ui-ux-design', 'cybersecurity',
  'cloud-devops', 'data-science', 'blockchain', 'game-dev', 'marketing', 'finance', 'other',
]

const SORT_OPTIONS = ['sortRating', 'sortFollowers', 'sortNewest']

const INDUSTRY_COLORS = {
  'web-development': '#6366F1',
  'mobile-development': '#8B5CF6',
  'ai-ml': '#EC4899',
  'ui-ux-design': '#F59E0B',
  'cybersecurity': '#EF4444',
  'cloud-devops': '#10B981',
  'data-science': '#3B82F6',
  'blockchain': '#F97316',
  'game-dev': '#14B8A6',
  'marketing': '#A855F7',
  'finance': '#06B6D4',
  'other': '#6B7280',
}

const formatLocation = (loc) => {
  if (!loc) return ''
  if (typeof loc === 'string') return loc
  return [loc.city, loc.country].filter(Boolean).join(', ') || ''
}

const renderStars = (rating, size = 16) => {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const stars = []
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} sx={{ fontSize: size, color: '#F59E0B' }} />)
    } else if (i === full && hasHalf) {
      stars.push(<Star key={i} sx={{ fontSize: size, color: '#FCD34D' }} />)
    } else {
      stars.push(<StarOutlined key={i} sx={{ fontSize: size, color: 'action.disabled' }} />)
    }
  }
  return stars
}

function StatsBar({ companies, t }) {
  const theme = useTheme()
  const totalCompanies = companies.length
  const industries = useMemo(() => {
    const set = new Set(companies.map((c) => c.industry).filter(Boolean))
    return set.size
  }, [companies])
  const avgRating = useMemo(() => {
    if (totalCompanies === 0) return 0
    const sum = companies.reduce((acc, c) => acc + (c.averageRating || 0), 0)
    return (sum / totalCompanies).toFixed(1)
  }, [companies, totalCompanies])
  const totalFollowers = useMemo(() => {
    return companies.reduce((acc, c) => acc + (c.followersCount ?? c.followers?.length ?? 0), 0)
  }, [companies])

  const stats = [
    { label: t('companies.statsTotal'), value: totalCompanies, icon: <BusinessOutlined />, color: theme.palette.primary.main },
    { label: t('companies.statsIndustries'), value: industries, icon: <DomainOutlined />, color: theme.palette.secondary.main },
    { label: t('companies.statsAvgRating'), value: avgRating, icon: <Star sx={{ color: '#F59E0B' }} />, color: '#F59E0B' },
    { label: t('companies.statsFollowers'), value: totalFollowers.toLocaleString(), icon: <PeopleOutlined />, color: '#10B981' },
  ]

  return (
    <MotionBox variants={staggerFast} initial="hidden" animate="visible">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat, i) => (
          <MotionBox key={stat.label} variants={scaleIn} custom={i}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: alpha(stat.color, 0.3),
                  boxShadow: `0 4px 16px ${alpha(stat.color, 0.08)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(stat.color, 0.08),
                  color: stat.color,
                  '& svg': { fontSize: 20 },
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        ))}
      </Box>
    </MotionBox>
  )
}

function HeroCompanyCard({ company, t, navigate }) {
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.92)}, ${alpha(theme.palette.secondary.main, 0.88)})`,
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
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
            src={company.logo}
            sx={{
              width: { xs: 80, md: 110 },
              height: { xs: 80, md: 110 },
              bgcolor: alpha('#fff', 0.2),
              color: '#fff',
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
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
              <Typography sx={{ opacity: 0.88, fontSize: { xs: '0.875rem', md: '1rem' }, lineHeight: 1.5, maxWidth: 500, mb: 1.5 }} noWrap>
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
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', ml: 0.5 }}>
                  {(company.averageRating || 0).toFixed(1)}
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3 }}>{t('companies.rating')}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PeopleOutlined sx={{ fontSize: 20, opacity: 0.8 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                  {company.followersCount ?? company.followers?.length ?? 0}
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3 }}>{t('companies.followers_other', { count: '' }).trim()}</Typography>
            </Box>
            {company.jobsCount > 0 && (
              <>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <WorkOutlineOutlined sx={{ fontSize: 20, opacity: 0.8 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                      {company.jobsCount}
                    </Typography>
                  </Stack>
                  <Typography sx={{ opacity: 0.7, fontSize: '0.8rem', mt: 0.3 }}>{t('jobs.title')}</Typography>
                </Box>
              </>
            )}
          </Stack>
          <Button
            variant="contained"
            endIcon={<ArrowForward className="hero-arrow" sx={{ fontSize: '18px !important', transition: 'all 0.3s ease', transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.32)',
              },
              px: 3,
            }}
          >
            {t('companies.viewProfile')}
          </Button>
        </Stack>
      </Box>
    </MotionCard>
  )
}

function CompanyCard({ company, t, navigate, index }) {
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
        borderRadius: 2.5,
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.75)}, ${alpha(theme.palette.secondary.main, 0.65)}), url(${company.coverPhoto})`,
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
              src={company.logo}
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

function HeroSkeleton() {
  return (
    <Box sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
    </Box>
  )
}

function CardSkeleton({ hasCover = true }) {
  return (
    <Box sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {hasCover && <Skeleton variant="rounded" height={130} />}
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Skeleton variant="circular" width={60} height={60} sx={hasCover ? { mt: -5 } : {}} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={24} />
            <Skeleton variant="text" width="80%" height={18} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={85} height={24} sx={{ borderRadius: 5 }} />
          <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 5 }} />
        </Stack>
        <Skeleton variant="text" width="100%" sx={{ mt: 2 }} />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="20%" height={20} />
        </Stack>
      </Box>
    </Box>
  )
}

function StatsSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
            <Box>
              <Skeleton variant="text" width={48} height={28} />
              <Skeleton variant="text" width={72} height={16} />
            </Box>
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

export default function CompaniesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('sortRating')

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCompanies()
      if (res?.success) setCompanies(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const filteredCompanies = useMemo(() => {
    let list = [...companies]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        c.name?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        formatLocation(c.location)?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }

    if (industryFilter !== 'all') {
      list = list.filter((c) => c.industry === industryFilter)
    }

    switch (sortBy) {
      case 'sortRating':
        list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      case 'sortFollowers':
        list.sort((a, b) => (b.followersCount ?? b.followers?.length ?? 0) - (a.followersCount ?? a.followers?.length ?? 0))
        break
      case 'sortNewest':
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
    }

    return list
  }, [companies, search, industryFilter, sortBy])

  const topCompany = filteredCompanies.length > 0 ? filteredCompanies[0] : null
  const restCompanies = filteredCompanies.length > 1 ? filteredCompanies.slice(1) : []
  const hasActiveFilters = search.trim() || industryFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setIndustryFilter('all')
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <MotionBox variants={fadeUp} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ width: 4, height: 32, borderRadius: 2, background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }} />
            <Typography variant="h3" fontWeight={800}>
              {t('companies.title')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ ml: 1.5 }}>
            {t('companies.subtitle')}
          </Typography>
        </MotionBox>

        {/* Stats Bar */}
        {!loading && !error && companies.length > 0 && (
          <StatsBar companies={companies} t={t} />
        )}
        {loading && <StatsSkeleton />}

        {/* Search & Filters Bar */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: hasActiveFilters ? alpha(theme.palette.primary.main, 0.2) : 'divider',
            boxShadow: hasActiveFilters
              ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
              : `0 2px 8px ${alpha(theme.palette.primary.main, 0.03)}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              placeholder={t('companies.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')} sx={{ color: 'text.secondary' }}>
                        <ClearOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                select
                size="small"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                sx={{ minWidth: 160 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="all">{t('companies.filterAll')}</MenuItem>
                {INDUSTRY_OPTIONS.map((ind) => (
                  <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 150 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <TrendingUpOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{t(`companies.${opt}`)}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          {/* Active filter chips */}
          <AnimatePresence>
            {hasActiveFilters && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                sx={{ mt: 1.5, overflow: 'hidden' }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('companies.activeFilters')}:
                  </Typography>
                  {search.trim() && (
                    <Chip
                      label={`${t('companies.search')}: "${search}"`}
                      size="small"
                      onDelete={() => setSearch('')}
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                  {industryFilter !== 'all' && (
                    <Chip
                      label={industryFilter}
                      size="small"
                      onDelete={() => setIndustryFilter('all')}
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                  <Chip
                    label={t('companies.clearAll')}
                    size="small"
                    onClick={clearFilters}
                    sx={{ fontWeight: 600, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) }}
                  />
                </Stack>
              </MotionBox>
            )}
          </AnimatePresence>
        </MotionBox>

        {/* Loading Progress */}
        {loading && (
          <LinearProgress
            sx={{
              mb: 3,
              height: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          />
        )}

        {/* Error */}
        {error && (
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.03),
              border: `1px dashed ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.error.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CancelOutlined sx={{ fontSize: 36, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
              {t('companies.errorTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {error}
            </Typography>
            <Button variant="primary" onClick={fetchCompanies} sx={{ px: 4 }}>
              {t('companies.retry')}
            </Button>
          </MotionBox>
        )}

        {/* Loading */}
        {loading && !error && (
          <Box>
            <HeroSkeleton />
            <Box
              sx={{
                mt: 3,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)',
                },
                gap: 2.5,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <CardSkeleton key={i} hasCover={i % 2 === 0} />
              ))}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCompanies.length === 0 && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <BusinessOutlined sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.35) }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
              {search || industryFilter !== 'all' ? t('companies.noResults') : t('companies.noCompanies')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: hasActiveFilters ? 3 : 0, maxWidth: 420, mx: 'auto' }}>
              {hasActiveFilters
                ? t('companies.emptyFilteredHint')
                : t('companies.subtitle')}
            </Typography>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters} sx={{ mt: 1 }}>
                {t('companies.clearFilters')}
              </Button>
            )}
          </MotionBox>
        )}

        {/* Content */}
        {!loading && !error && filteredCompanies.length > 0 && (
          <>
            {/* Desktop xl+: Unified grid with hero spanning 2 cols */}
            <Box sx={{ display: { xs: 'none', xl: 'block' } }}>
              <MotionBox variants={staggerFast} initial="hidden" animate="visible">
                <Stack direction="row" alignItems="center" sx={{ mb: 2.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {t('companies.title')}
                  </Typography>
                  <Chip
                    label={filteredCompanies.length}
                    size="small"
                    sx={{ ml: 1, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                  />
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridAutoRows: 'auto',
                    gap: 2.5,
                  }}
                >
                  {filteredCompanies.map((company, i) => (
                    i === 0 ? (
                      <Box key={company._id || company.id} sx={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
                        <HeroCompanyCard company={company} t={t} navigate={navigate} />
                      </Box>
                    ) : (
                      <CompanyCard
                        key={company._id || company.id}
                        company={company}
                        t={t}
                        navigate={navigate}
                        index={i}
                      />
                    )
                  ))}
                </Box>
              </MotionBox>
            </Box>

            {/* Below xl: Original hero + grid layout */}
            <Box sx={{ display: { xs: 'block', xl: 'none' } }}>
              {topCompany && (
                <Box sx={{ mb: 3 }}>
                  <HeroCompanyCard company={topCompany} t={t} navigate={navigate} />
                </Box>
              )}

              {restCompanies.length > 0 && (
                <MotionBox variants={staggerFast} initial="hidden" animate="visible">
                  <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {t('companies.title')}
                    </Typography>
                    <Chip
                      label={restCompanies.length}
                      size="small"
                      sx={{ ml: 1, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                    />
                  </Stack>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                      },
                      gap: 2.5,
                    }}
                  >
                    {restCompanies.map((company, i) => (
                      <CompanyCard
                        key={company._id || company.id}
                        company={company}
                        t={t}
                        navigate={navigate}
                        index={i}
                      />
                    ))}
                  </Box>
                </MotionBox>
              )}
            </Box>
          </>
        )}
      </MotionBox>
    </Container>
  )
}
