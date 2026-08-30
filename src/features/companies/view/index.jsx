import { RADIUS } from '@/theme/tokens'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Stack, Chip, TextField, InputAdornment,
  IconButton, LinearProgress, Paper, Grid,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Button from '@/ui/Button'
import {
  Search as SearchIcon, ClearOutlined, CancelOutlined, CloseOutlined, TuneOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanies } from '@/services/companyService'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/utils/animations'
import { HeroCompanyCard, CompanyCard } from '../components/CompanyCard'
import StatsBar from '../components/StatsBar'
import { HeroSkeleton, CardSkeleton, StatsSkeleton } from '../components/Skeletons'
import CompaniesFilters from '../components/CompaniesFilters'
import { formatLocation } from '../components/shared'

const MotionBox = motion.create(Box)

export default function CompaniesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Sidebar filters
  const [industries, setIndustries] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('sortRating')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

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

  const toggleIndustry = (val) =>
    setIndustries((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val])

  const countActive = industries.length + (minRating ? 1 : 0)
  const hasActiveFilters = search.trim() || countActive > 0

  const clearFilters = () => {
    setSearch('')
    setIndustries([])
    setMinRating(0)
  }

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

    if (industries.length) {
      list = list.filter((c) => industries.includes(c.industry))
    }

    if (minRating) {
      list = list.filter((c) => (c.averageRating || 0) >= minRating)
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
  }, [companies, search, industries, minRating, sortBy])

  const topCompany = filteredCompanies.length > 0 ? filteredCompanies[0] : null
  const restCompanies = filteredCompanies.length > 1 ? filteredCompanies.slice(1) : []

  const filterProps = {
    industries,
    onToggleIndustry: toggleIndustry,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    clearFilters,
    countActive,
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <MotionBox variants={fadeUp} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ width: 4, height: 32, borderRadius: RADIUS, background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }} />
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

        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Filters Sidebar - Desktop */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{ p: 2.5, borderRadius: RADIUS, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 88 }}>
                <CompaniesFilters {...filterProps} />
              </Paper>
            </motion.div>
          </Grid>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1200 }}
                />
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  style={{ position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0, width: 300, background: '#fff', zIndex: 1201, overflowY: 'auto' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                        {t('companies.filtersTitle', 'الفلاتر')}
                      </Typography>
                      <IconButton size="medium" onClick={() => setMobileFilterOpen(false)} sx={{ color: 'text.secondary', minWidth: 44, minHeight: 44 }}>
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                    <CompaniesFilters {...filterProps} />
                  </Box>
                  <Box sx={{ position: 'sticky', bottom: 0, p: 2, bgcolor: '#fff', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setMobileFilterOpen(false)}
                      sx={{ bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }, textTransform: 'none', borderRadius: RADIUS, py: 1.25 }}
                    >
                      {t('companies.showResults', 'عرض النتائج')}
                      {countActive > 0 && ` (${countActive})`}
                    </Button>
                  </Box>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Content */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {/* Search & Mobile Filter Button */}
            <MotionBox
              variants={fadeUp}
              sx={{
                mb: 3,
                p: { xs: 2, md: 2.5 },
                borderRadius: RADIUS,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: hasActiveFilters ? alpha(primary, 0.2) : 'divider',
                boxShadow: hasActiveFilters
                  ? `0 4px 20px ${alpha(primary, 0.08)}`
                  : `0 2px 8px ${alpha(primary, 0.03)}`,
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
                <Button
                  variant="outlined"
                  startIcon={<TuneOutlined />}
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{
                    display: { xs: 'inline-flex', lg: 'none' },
                    textTransform: 'none', borderRadius: RADIUS, minWidth: 44,
                    borderColor: 'divider', color: 'text.primary',
                    '&:hover': { borderColor: 'rgba(0,0,0,0.4)', bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {t('companies.filtersTitle', 'الفلاتر')}
                  {countActive > 0 && (
                    <Box sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: RADIUS, bgcolor: 'rgba(0,0,0,0.08)', color: 'text.primary', fontSize: '0.7rem', fontWeight: 700 }}>
                      {countActive}
                    </Box>
                  )}
                </Button>
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
                        {t('companies.activeFilters', 'الفلاتر النشطة')}:
                      </Typography>
                      {search.trim() && (
                        <Chip
                          label={`${t('companies.search')}: "${search}"`}
                          size="small"
                          onDelete={() => setSearch('')}
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                      {industries.map((ind) => (
                        <Chip
                          key={ind}
                          label={ind}
                          size="small"
                          onDelete={() => toggleIndustry(ind)}
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                      {minRating > 0 && (
                        <Chip
                          label={`${minRating}+`}
                          size="small"
                          onDelete={() => setMinRating(0)}
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                      <Chip
                        label={t('companies.clearAll', 'مسح')}
                        size="small"
                        onClick={clearFilters}
                        sx={{ fontWeight: 600, color: 'primary.main', bgcolor: alpha(primary, 0.06) }}
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
                  borderRadius: RADIUS,
                  bgcolor: alpha(primary, 0.06),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: RADIUS,
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
                  bgcolor: alpha(primary, 0.02),
                  border: `1px dashed ${alpha(primary, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha(primary, 0.06),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <ClearOutlined sx={{ fontSize: 48, color: alpha(primary, 0.35) }} />
                </Box>
                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                  {search || countActive > 0 ? t('companies.noResults') : t('companies.noCompanies')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: hasActiveFilters ? 3 : 0, maxWidth: 420, mx: 'auto' }}>
                  {hasActiveFilters
                    ? t('companies.emptyFilteredHint')
                    : t('companies.subtitle')}
                </Typography>
                {hasActiveFilters && (
                  <Button variant="secondary" onClick={clearFilters} sx={{ mt: 1 }}>
                    {t('companies.clearFilters', 'مسح الفلاتر')}
                  </Button>
                )}
              </MotionBox>
            )}

            {/* Content */}
            {!loading && !error && filteredCompanies.length > 0 && (
              <>
                {/* Desktop xl+: Unified grid with hero spanning 2 cols */}
                <Box sx={{ display: { xs: 'none', xl: 'block' } }}>
                  <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
                    <Stack direction="row" alignItems="center" sx={{ mb: 2.5 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {t('companies.title')}
                      </Typography>
                      <Chip
                        label={filteredCompanies.length}
                        size="small"
                        sx={{ ml: 1, fontWeight: 600, bgcolor: alpha(primary, 0.08), color: 'primary.main' }}
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
                    <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
                      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {t('companies.title')}
                        </Typography>
                        <Chip
                          label={restCompanies.length}
                          size="small"
                          sx={{ ml: 1, fontWeight: 600, bgcolor: alpha(primary, 0.08), color: 'primary.main' }}
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
          </Grid>
        </Grid>
      </MotionBox>
    </Container>
  )
}
