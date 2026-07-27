import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, Grid, Avatar, Chip, alpha,
  Pagination, CircularProgress, Divider, InputBase, TextField, Button,
  FormControlLabel, Checkbox, Collapse, IconButton,
} from '@mui/material'
import {
  SearchOutlined, LocationOnOutlined, WorkOutlineOutlined,
  AttachMoneyOutlined, FilterListOutlined, CloseOutlined,
  ExpandMoreOutlined, ExpandLessOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { getJobs } from '@/services/jobService'
import { fadeUp, staggerContainer } from '@/utils/animations'

const PAGE_SIZE = 9

const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
const PLACE_OPTIONS = ['On-site', 'Remote', 'Hybrid']
const LEVEL_OPTIONS = ['Entry', 'Mid', 'Senior', 'Director', 'VP']

const TYPE_COLORS = {
  'Full-time': { bg: '#EDE7F6', color: '#3D1C6E' },
  'Part-time': { bg: '#E3F2FD', color: '#1565C0' },
  'Freelance': { bg: '#E0F7FA', color: '#00838F' },
  'Internship': { bg: '#E8F5E9', color: '#2E7D32' },
  'Contract': { bg: '#FFF3E0', color: '#E65100' },
}

const LEVEL_LABELS = { Entry: 'Entry', Mid: 'Mid', Senior: 'Senior', Director: 'Director', VP: 'VP' }
const PLACE_LABELS = { Remote: 'Remote', 'On-site': 'On-site', Hybrid: 'Hybrid' }

function formatSalary(salary) {
  if (!salary?.min && !salary?.max) return null
  const fmt = (n) => n?.toLocaleString()
  const cur = salary.currency || 'USD'
  if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)} ${cur}`
  if (salary.min) return `${fmt(salary.min)}+ ${cur}`
  return `Up to ${fmt(salary.max)} ${cur}`
}

function timeAgo(dateStr, lang) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'Just now'
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} د` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return lang === 'ar' ? `منذ ${hrs} س` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return lang === 'ar' ? `منذ ${days} ي` : `${days}d ago`
  return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
}

function FilterSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box sx={{ mb: 0.5 }}>
      <Button
        fullWidth
        onClick={() => setOpen(!open)}
        endIcon={open ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
        sx={{ justifyContent: 'space-between', textTransform: 'none', color: 'text.primary', fontWeight: 700, fontSize: '0.8rem', px: 0, py: 0.75, minWidth: 0 }}
      >
        {title}
      </Button>
      <Collapse in={open}>
        <Stack spacing={0.25} sx={{ pb: 1 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  )
}

export default function JobsView() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  // Filters
  const [types, setTypes] = useState([])
  const [places, setPlaces] = useState([])
  const [levels, setLevels] = useState([])
  const [country, setCountry] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const toggleFilter = (arr, setArr, val) => {
    setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val])
  }

  const hasActiveFilters = types.length > 0 || places.length > 0 || levels.length > 0 || country || minSalary || maxSalary

  const clearFilters = () => {
    setTypes([])
    setPlaces([])
    setLevels([])
    setCountry('')
    setMinSalary('')
    setMaxSalary('')
  }

  const fetchJobs = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = { page: pageNum, limit: PAGE_SIZE }
      if (types.length) params.type = types.join(',')
      if (places.length) params.workPlace = places.join(',')
      if (levels.length) params.workLevel = levels.join(',')
      if (country) params.country = country
      if (minSalary) params.minSalary = minSalary
      if (maxSalary) params.maxSalary = maxSalary
      const res = await getJobs(params)
      if (res?.success) {
        setJobs(res.data || [])
        setTotalPages(res.totalPages || Math.ceil((res.total || res.data?.length || 0) / PAGE_SIZE) || 1)
      }
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [types, places, levels, country, minSalary, maxSalary])

  useEffect(() => { fetchJobs(page) }, [page, fetchJobs])

  useEffect(() => { setPage(1) }, [types, places, levels, country, minSalary, maxSalary])

  const filtered = search
    ? jobs.filter((j) =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs

  const FiltersContent = (
    <Stack spacing={2}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <FilterListOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
          {lang === 'ar' ? 'الفلاتر' : 'Filters'}
        </Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={clearFilters} sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.7rem', color: 'error.main', minWidth: 0, py: 0 }}>
            {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
          </Button>
        )}
      </Stack>

      <Divider />

      {/* Job Type */}
      <FilterSection title={lang === 'ar' ? 'نوع العمل' : 'Job Type'}>
        {TYPE_OPTIONS.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                checked={types.includes(opt)}
                onChange={() => toggleFilter(types, setTypes, opt)}
                size="small"
                sx={{ py: 0.25, color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
              />
            }
            label={<Typography variant="body2" fontSize="0.8rem" fontWeight={types.includes(opt) ? 600 : 400}>{opt}</Typography>}
            sx={{ mx: 0, my: 0 }}
          />
        ))}
      </FilterSection>

      <Divider />

      {/* Work Place */}
      <FilterSection title={lang === 'ar' ? 'مكان العمل' : 'Work Place'}>
        {PLACE_OPTIONS.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                checked={places.includes(opt)}
                onChange={() => toggleFilter(places, setPlaces, opt)}
                size="small"
                sx={{ py: 0.25, color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
              />
            }
            label={<Typography variant="body2" fontSize="0.8rem" fontWeight={places.includes(opt) ? 600 : 400}>{opt}</Typography>}
            sx={{ mx: 0, my: 0 }}
          />
        ))}
      </FilterSection>

      <Divider />

      {/* Experience Level */}
      <FilterSection title={lang === 'ar' ? 'مستوى الخبرة' : 'Experience Level'}>
        {LEVEL_OPTIONS.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                checked={levels.includes(opt)}
                onChange={() => toggleFilter(levels, setLevels, opt)}
                size="small"
                sx={{ py: 0.25, color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
              />
            }
            label={<Typography variant="body2" fontSize="0.8rem" fontWeight={levels.includes(opt) ? 600 : 400}>{opt}</Typography>}
            sx={{ mx: 0, my: 0 }}
          />
        ))}
      </FilterSection>

      <Divider />

      {/* Country */}
      <FilterSection title={lang === 'ar' ? 'الدولة' : 'Country'}>
        <TextField
          size="small"
          fullWidth
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder={lang === 'ar' ? 'مثال: السعودية' : 'e.g. Saudi Arabia'}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.8rem' } }}
        />
      </FilterSection>

      <Divider />

      {/* Salary Range */}
      <FilterSection title={lang === 'ar' ? 'نطاق الراتب' : 'Salary Range'}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder={lang === 'ar' ? 'الحد الأدنى' : 'Min'}
            inputProps={{ min: 0 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder={lang === 'ar' ? 'الحد الأقصى' : 'Max'}
            inputProps={{ min: 0 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.8rem' } }}
          />
        </Stack>
      </FilterSection>
    </Stack>
  )

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>


        <Grid container spacing={3}>

          {/* Filters Sidebar - Desktop */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 88 }}>
                {FiltersContent}
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
                  style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, background: '#fff', zIndex: 1201, overflowY: 'auto', padding: 16 }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{lang === 'ar' ? 'الفلاتر' : 'Filters'}</Typography>
                    <IconButton size="small" onClick={() => setMobileFilterOpen(false)}>
                      <CloseOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                  {FiltersContent}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setMobileFilterOpen(false)}
                    sx={{ mt: 2, bgcolor: '#3D1C6E', '&:hover': { bgcolor: '#2E1555' }, textTransform: 'none', borderRadius: 1.5 }}
                  >
                    {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Jobs Content */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 0.5, mb: 2.5,
                border: '1px solid', borderColor: 'divider', borderRadius: 2,
              }}>
                <SearchOutlined sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder={lang === 'ar' ? 'ابحث عن وظيفة، شركة، أو موقع...' : 'Search job, company, or location...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ flex: 1, py: 1, fontSize: '0.9rem' }}
                />
              </Paper>
            </motion.div>

            {/* Active Filters Chips */}
            {hasActiveFilters && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                {types.map((v) => (
                  <Chip key={`t-${v}`} label={v} size="small" onDelete={() => toggleFilter(types, setTypes, v)}
                    sx={{ bgcolor: alpha('#3D1C6E', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                ))}
                {places.map((v) => (
                  <Chip key={`p-${v}`} label={v} size="small" onDelete={() => toggleFilter(places, setPlaces, v)}
                    sx={{ bgcolor: alpha('#1565C0', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                ))}
                {levels.map((v) => (
                  <Chip key={`l-${v}`} label={v} size="small" onDelete={() => toggleFilter(levels, setLevels, v)}
                    sx={{ bgcolor: alpha('#16A34A', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                ))}
                {country && (
                  <Chip label={country} size="small" onDelete={() => setCountry('')}
                    sx={{ bgcolor: alpha('#D97706', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                )}
                {minSalary && (
                  <Chip label={`Min: ${minSalary}`} size="small" onDelete={() => setMinSalary('')}
                    sx={{ bgcolor: alpha('#7C3AED', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                )}
                {maxSalary && (
                  <Chip label={`Max: ${maxSalary}`} size="small" onDelete={() => setMaxSalary('')}
                    sx={{ bgcolor: alpha('#7C3AED', 0.08), fontWeight: 600, fontSize: '0.7rem' }} />
                )}
                <Chip label={lang === 'ar' ? 'مسح الكل' : 'Clear all'} size="small" onClick={clearFilters}
                  sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { bgcolor: alpha('#DC2626', 0.08) } }} />
              </Stack>
            )}

            {/* Jobs Grid */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <WorkOutlineOutlined sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                <Typography color="text.secondary">{t('jobs.noJobs')}</Typography>
                {hasActiveFilters && (
                  <Button size="small" onClick={clearFilters} sx={{ mt: 1, textTransform: 'none' }}>
                    {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                  <Grid container spacing={2}>
                    {filtered.map((job) => {
                      const tc = TYPE_COLORS[job.type] || { bg: '#F5F5F5', color: '#616161' }
                      const salary = formatSalary(job.salary)
                      return (
                        <Grid key={job._id} size={{ xs: 12, sm: 6 }}>
                          <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                            <Paper
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              sx={{
                                p: 2.5, borderRadius: 2, cursor: 'pointer', height: '100%',
                                border: '1px solid', borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                display: 'flex', flexDirection: 'column',
                                '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                              }}
                            >
                              {/* Company Row */}
                              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
                                <Avatar
                                  src={job.company?.logo}
                                  alt={job.company?.name}
                                  sx={{
                                    width: 40, height: 40, flexShrink: 0,
                                    bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                                    fontSize: '0.85rem', fontWeight: 700,
                                    border: `1px solid ${alpha('#3D1C6E', 0.12)}`,
                                  }}
                                >
                                  {job.company?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', lineHeight: 1.2 }} noWrap>
                                    {job.company?.name}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                                    {job.company?.isVerified && (
                                      <Chip label={lang === 'ar' ? 'موثقة' : 'Verified'} size="small"
                                        sx={{ height: 16, fontSize: '0.55rem', fontWeight: 600, bgcolor: alpha('#16A34A', 0.1), color: '#16A34A' }} />
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>

                              {/* Title */}
                              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.75, lineHeight: 1.3, fontSize: '0.95rem' }} noWrap>
                                {job.title}
                              </Typography>

                              {/* Tags */}
                              <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                                {job.type && (
                                  <Chip label={job.type} size="small"
                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: tc.bg, color: tc.color }} />
                                )}
                                {job.workLevel && (
                                  <Chip label={LEVEL_LABELS[job.workLevel] || job.workLevel} size="small" variant="outlined"
                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600 }} />
                                )}
                                {job.workPlace && (
                                  <Chip label={PLACE_LABELS[job.workPlace] || job.workPlace} size="small" variant="outlined"
                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600 }} />
                                )}
                              </Stack>

                              <Box sx={{ flex: 1 }} />

                              {/* Bottom Row */}
                              <Divider sx={{ mb: 1.5 }} />
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                {job.location && (
                                  <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                                    <LocationOnOutlined sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{job.location}</Typography>
                                  </Stack>
                                )}
                                {salary && (
                                  <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                                    <AttachMoneyOutlined sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{salary}</Typography>
                                  </Stack>
                                )}
                                <Box sx={{ flex: 1 }} />
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', alignSelf: 'center' }}>
                                  {timeAgo(job.createdAt, lang)}
                                </Typography>
                              </Stack>
                            </Paper>
                          </motion.div>
                        </Grid>
                      )
                    })}
                  </Grid>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      color="primary"
                      shape="rounded"
                      size="medium"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
