import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Stack, CircularProgress, Avatar, Chip, TextField, InputAdornment,
  MenuItem, Divider, Skeleton,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Button from '@/ui/Button'
import {
  BusinessOutlined, LocationOnOutlined, PeopleOutlined, Search as SearchIcon,
  StarOutlined, Star, FilterListOutlined, Verified, ArrowForward, WorkOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanies } from '@/services/companyService'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, staggerFast } from '@/utils/animations'

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Box)

const INDUSTRY_OPTIONS = [
  'web-development', 'mobile-development', 'ai-ml', 'ui-ux-design', 'cybersecurity',
  'cloud-devops', 'data-science', 'blockchain', 'game-dev', 'marketing', 'finance', 'other',
]

const SORT_OPTIONS = ['sortRating', 'sortFollowers', 'sortNewest']

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
        transition: 'all 0.35s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 50px ${alpha(theme.palette.primary.main, 0.35)}`,
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
            endIcon={<ArrowForward sx={{ fontSize: '18px !important', transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
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

  return (
    <MotionCard
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6, boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.12)}` }}
      whileTap={{ scale: 0.98 }}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.25) },
      }}
      onClick={() => navigate(`/companies/${company._id || company.id}`)}
    >
      {company.coverPhoto && (
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.secondary.main, 0.6)}), url(${company.coverPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={company.logo}
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1.3rem',
              mt: company.coverPhoto ? -4.5 : 0,
              border: '3px solid',
              borderColor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              flexShrink: 0,
            }}
          >
            {company.name?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6" fontWeight={700} noWrap sx={{ fontSize: '1rem' }}>
                {company.name}
              </Typography>
              {company.isVerified && (
                <Verified sx={{ fontSize: 16, color: 'success.main' }} />
              )}
            </Stack>
            {company.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }} noWrap>
                {company.description}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.8} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.6 }}>
          {company.industry && (
            <Chip
              icon={<BusinessOutlined sx={{ fontSize: 14 }} />}
              label={company.industry}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: '0.72rem' }}
            />
          )}
          {company.location && (
            <Chip
              icon={<LocationOnOutlined sx={{ fontSize: 14 }} />}
              label={formatLocation(company.location)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: '0.72rem' }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

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
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('companies.viewProfile')}
            <ArrowForward sx={{ fontSize: 14 }} />
          </Typography>
        </Stack>
      </Box>
    </MotionCard>
  )
}

function HeroSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      height={340}
      sx={{ borderRadius: 3, bgcolor: 'action.hover' }}
    />
  )
}

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'action.hover' }} />
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Skeleton variant="circular" width={56} height={56} sx={{ mt: -4.5 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 5 }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 5 }} />
        </Stack>
      </Box>
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

  const fetchCompanies = async () => {
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
  }

  useEffect(() => { fetchCompanies() }, [])

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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <MotionBox variants={fadeUp} sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
            {t('companies.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('companies.subtitle')}
          </Typography>
        </MotionBox>

        {/* Search & Filters Bar */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mb: 4,
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.04)}`,
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
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{t(`companies.${opt}`)}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </MotionBox>

        {/* Error */}
        {error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            <Button variant="outlined" onClick={fetchCompanies}>{t('companies.retry')}</Button>
          </Box>
        )}

        {/* Loading */}
        {loading && !error && (
          <Box>
            <HeroSkeleton />
            <Stack direction="row" spacing={2.5} sx={{ mt: 3 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ flex: 1, display: { xs: 'none', lg: 'block' } }}>
                  <CardSkeleton />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCompanies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <BusinessOutlined sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
              {search || industryFilter !== 'all' ? t('companies.noResults') : t('companies.noCompanies')}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {(search || industryFilter !== 'all') ? '' : t('companies.subtitle')}
            </Typography>
          </Box>
        )}

        {/* Content */}
        {!loading && !error && filteredCompanies.length > 0 && (
          <>
            {/* Hero: Top Rated Company */}
            {topCompany && (
              <Box sx={{ mb: 3 }}>
                <HeroCompanyCard company={topCompany} t={t} navigate={navigate} />
              </Box>
            )}

            {/* Rest: Grid */}
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
          </>
        )}
      </MotionBox>
    </Container>
  )
}
