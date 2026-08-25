/* eslint-disable react-hooks/static-components */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, Grid, Avatar, Chip, alpha,
  Pagination, CircularProgress, Divider, InputBase, TextField, Button,
  Collapse, IconButton,
} from '@mui/material'
import {
  SearchOutlined, LocationOnOutlined, WorkOutlineOutlined,
  AttachMoneyOutlined, FilterListOutlined, CloseOutlined,
  ExpandMoreOutlined, ExpandLessOutlined,
  BusinessOutlined, SignalCellularAltOutlined, PublicOutlined,
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

function FilterSection({ title, icon, defaultOpen = false, count, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box sx={{ mb: 0.5, '&:last-child': { mb: 0 } }}>
      <Button
        fullWidth
        onClick={() => setOpen(!open)}
        sx={{
          justifyContent: 'space-between', textTransform: 'none',
          color: open ? '#3D1C6E' : 'text.secondary',
          fontWeight: 700, fontSize: '0.78rem', px: 1.5, py: 1, minWidth: 0,
          borderRadius: 1.5,
          bgcolor: open ? alpha('#3D1C6E', 0.04) : 'transparent',
          '&:hover': { bgcolor: alpha('#3D1C6E', 0.06) },
          transition: 'all 0.2s ease',
        }}
        endIcon={
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {count > 0 && (
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: '#3D1C6E', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
              }}>
                {count}
              </Box>
            )}
            {open ? <ExpandLessOutlined sx={{ fontSize: 18 }} /> : <ExpandMoreOutlined sx={{ fontSize: 18 }} />}
          </Stack>
        }
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {icon}
          <span>{title}</span>
        </Stack>
      </Button>
      <Collapse in={open}>
        <Stack spacing={0.5} sx={{ pb: 1, px: 1.5, pt: 0.5 }}>
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

  const countActive = types.length + places.length + levels.length + (country ? 1 : 0) + (minSalary ? 1 : 0) + (maxSalary ? 1 : 0)

  const FilterChips = ({ options, selected, onChange }) => (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map((opt) => {
        const on = selected.includes(opt)
        return (
          <Chip
            key={opt}
            label={opt}
            size="small"
            onClick={() => onChange(opt)}
            sx={{
              height: 28, minHeight: 36, fontSize: '0.7rem', fontWeight: on ? 700 : 500,
              bgcolor: on ? '#3D1C6E' : alpha('#3D1C6E', 0.06),
              color: on ? '#fff' : 'text.secondary',
              border: on ? 'none' : `1px solid ${alpha('#3D1C6E', 0.12)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: on ? '#2E1555' : alpha('#3D1C6E', 0.12),
              },
            }}
          />
        )
      })}
    </Stack>
  )

  const FiltersContent = (
    <Stack spacing={0.5}>
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1,
            bgcolor: alpha('#3D1C6E', 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FilterListOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.85rem' }}>
            {lang === 'ar' ? 'الفلاتر' : 'Filters'}
          </Typography>
          {countActive > 0 && (
            <Box sx={{
              ml: 'auto', px: 1, py: 0.25, borderRadius: 1,
              bgcolor: alpha('#3D1C6E', 0.08),
            }}>
              <Typography variant="caption" fontWeight={700} color="#3D1C6E" sx={{ fontSize: '0.65rem' }}>
                {countActive}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {countActive > 0 && (
        <Box sx={{ px: 1.5, pb: 0.5 }}>
          <Button
            size="small"
            onClick={clearFilters}
            sx={{
              textTransform: 'none', fontSize: '0.7rem', color: '#DC2626',
              fontWeight: 600, minWidth: 0, p: 0.5,
              '&:hover': { bgcolor: alpha('#DC2626', 0.06) },
            }}
          >
            {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
          </Button>
        </Box>
      )}

      <Divider sx={{ mx: 1.5 }} />

      {/* Job Type */}
      <FilterSection
        title={lang === 'ar' ? 'نوع العمل' : 'Job Type'}
        icon={<WorkOutlineOutlined sx={{ fontSize: 15 }} />}
        count={types.length}
        defaultOpen
      >
        <FilterChips options={TYPE_OPTIONS} selected={types} onChange={(v) => toggleFilter(types, setTypes, v)} />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Work Place */}
      <FilterSection
        title={lang === 'ar' ? 'مكان العمل' : 'Work Place'}
        icon={<BusinessOutlined sx={{ fontSize: 15 }} />}
        count={places.length}
      >
        <FilterChips options={PLACE_OPTIONS} selected={places} onChange={(v) => toggleFilter(places, setPlaces, v)} />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Experience Level */}
      <FilterSection
        title={lang === 'ar' ? 'مستوى الخبرة' : 'Experience Level'}
        icon={<SignalCellularAltOutlined sx={{ fontSize: 15 }} />}
        count={levels.length}
      >
        <FilterChips options={LEVEL_OPTIONS} selected={levels} onChange={(v) => toggleFilter(levels, setLevels, v)} />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Country */}
      <FilterSection
        title={lang === 'ar' ? 'الدولة' : 'Country'}
        icon={<PublicOutlined sx={{ fontSize: 15 }} />}
        count={country ? 1 : 0}
      >
        <TextField
          size="small"
          fullWidth
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder={lang === 'ar' ? 'مثال: السعودية' : 'e.g. Saudi Arabia'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5, fontSize: '0.8rem',
              bgcolor: alpha('#3D1C6E', 0.03),
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3D1C6E', borderWidth: 2 },
              },
            },
          }}
        />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Salary Range */}
      <FilterSection
        title={lang === 'ar' ? 'نطاق الراتب' : 'Salary Range'}
        icon={<AttachMoneyOutlined sx={{ fontSize: 15 }} />}
        count={(minSalary ? 1 : 0) + (maxSalary ? 1 : 0)}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder={lang === 'ar' ? 'الحد الأدنى' : 'Min'}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5, fontSize: '0.8rem',
                bgcolor: alpha('#3D1C6E', 0.03),
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3D1C6E', borderWidth: 2 },
                },
              },
            }}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder={lang === 'ar' ? 'الحد الأقصى' : 'Max'}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5, fontSize: '0.8rem',
                bgcolor: alpha('#3D1C6E', 0.03),
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3D1C6E', borderWidth: 2 },
                },
              },
            }}
          />
        </Stack>
      </FilterSection>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Divider />
      </Box>
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
                  style={{ position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0, width: 300, background: '#fff', zIndex: 1201, overflowY: 'auto' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#3D1C6E' }}>
                        {lang === 'ar' ? 'الفلاتر' : 'Filters'}
                      </Typography>
                      <IconButton size="medium" onClick={() => setMobileFilterOpen(false)} sx={{ color: 'text.secondary', minWidth: 44, minHeight: 44 }}>
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                    {FiltersContent}
                  </Box>
                  <Box sx={{ position: 'sticky', bottom: 0, p: 2, bgcolor: '#fff', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setMobileFilterOpen(false)}
                      sx={{ bgcolor: '#3D1C6E', '&:hover': { bgcolor: '#2E1555' }, textTransform: 'none', borderRadius: 1.5, py: 1.25 }}
                    >
                      {lang === 'ar' ? 'عرض النتائج' : 'Show Results'}
                      {countActive > 0 && ` (${countActive})`}
                    </Button>
                  </Box>
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
                <SearchOutlined sx={{ color: 'text.secondary', mril: 1 }} />
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
                    sx={{ bgcolor: alpha('#3D1C6E', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                ))}
                {places.map((v) => (
                  <Chip key={`p-${v}`} label={v} size="small" onDelete={() => toggleFilter(places, setPlaces, v)}
                    sx={{ bgcolor: alpha('#1565C0', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                ))}
                {levels.map((v) => (
                  <Chip key={`l-${v}`} label={v} size="small" onDelete={() => toggleFilter(levels, setLevels, v)}
                    sx={{ bgcolor: alpha('#16A34A', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                ))}
                {country && (
                  <Chip label={country} size="small" onDelete={() => setCountry('')}
                    sx={{ bgcolor: alpha('#D97706', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                )}
                {minSalary && (
                  <Chip label={`Min: ${minSalary}`} size="small" onDelete={() => setMinSalary('')}
                    sx={{ bgcolor: alpha('#7C3AED', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                )}
                {maxSalary && (
                  <Chip label={`Max: ${maxSalary}`} size="small" onDelete={() => setMaxSalary('')}
                    sx={{ bgcolor: alpha('#7C3AED', 0.08), fontWeight: 600, fontSize: '0.7rem', minHeight: 36, '& .MuiChip-deleteIcon': { width: 20, height: 20 } }} />
                )}
                <Chip label={lang === 'ar' ? 'مسح الكل' : 'Clear all'} size="small" onClick={clearFilters}
                  sx={{ fontWeight: 600, fontSize: '0.7rem', minHeight: 36, cursor: 'pointer', '&:hover': { bgcolor: alpha('#DC2626', 0.08) } }} />
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
