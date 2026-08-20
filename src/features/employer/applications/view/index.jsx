import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, Grid, Avatar, Chip, alpha,
  CircularProgress, Divider, InputBase, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Slide, useMediaQuery, useTheme,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  SearchOutlined, PeopleOutlined, WorkOutlineOutlined, LocationOnOutlined,
  AttachMoneyOutlined, CloseOutlined, OpenInNewOutlined, PhoneOutlined,
  EmailOutlined, StarOutlineOutlined, ArrowBackOutlined, FilterListOutlined,
  ExpandMoreOutlined, ExpandLessOutlined, DownloadOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/utils/animations'
import {
  getEmployerJobs, getEmployerApplications, updateApplicationStatus,
} from '@/services/employerService'

const STATUS_ACTIONS = {
  Pending: { labelKey: 'employerApplications.statusPending', variant: 'secondary' },
  Reviewed: { labelKey: 'employerApplications.review', variant: 'primary' },
  Shortlisted: { labelKey: 'employerApplications.shortlist', variant: 'primary' },
  Accepted: { labelKey: 'employerApplications.accept', variant: 'primary' },
  Rejected: { labelKey: 'employerApplications.reject', variant: 'secondary' },
}

const STATUS_COLORS = {
  Pending: { bg: '#FFF3E0', color: '#E65100', label: 'warning' },
  Reviewed: { bg: '#E3F2FD', color: '#1565C0', label: 'info' },
  Shortlisted: { bg: '#EDE7F6', color: '#3D1C6E', label: 'primary' },
  Accepted: { bg: '#E8F5E9', color: '#2E7D32', label: 'success' },
  Rejected: { bg: '#FFEBEE', color: '#C62828', label: 'error' },
}

const TYPE_COLORS = {
  'Full-time': { bg: '#EDE7F6', color: '#3D1C6E' },
  'Part-time': { bg: '#E3F2FD', color: '#1565C0' },
  'Freelance': { bg: '#E0F7FA', color: '#00838F' },
  'Internship': { bg: '#E8F5E9', color: '#2E7D32' },
  'Contract': { bg: '#FFF3E0', color: '#E65100' },
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

function nextStatuses(current) {
  const all = ['Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected']
  return all.filter((s) => s !== current)
}

const SlideTransition = (props) => <Slide direction="left" {...props} />

export default function EmployerApplications() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const user = useSelector((s) => s.user.user)

  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailApplicant, setDetailApplicant] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  const companyId = user?.company?._id || user?.company

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const params = {}
      if (companyId) params.companyId = companyId
      const res = await getEmployerJobs(params)
      if (res?.success) setJobs(res.data || [])
    } catch { /* ignore */ }
    finally { setLoadingJobs(false) }
  }, [companyId])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const fetchApplicants = useCallback(async (jobId) => {
    setLoadingApplicants(true)
    setApplicants([])
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await getEmployerApplications(jobId, params)
      if (res?.success) setApplicants(res.data || [])
    } catch { /* ignore */ }
    finally { setLoadingApplicants(false) }
  }, [statusFilter])

  useEffect(() => {
    if (selectedJob) fetchApplicants(selectedJob._id)
  }, [selectedJob, fetchApplicants])

  const handleStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      const res = await updateApplicationStatus(applicationId, status)
      if (res?.success) {
        setApplicants((prev) => prev.map((a) =>
          a._id === applicationId ? { ...a, status } : a
        ))
        if (detailApplicant?._id === applicationId) {
          setDetailApplicant((prev) => prev ? { ...prev, status } : null)
        }
      }
    } catch { /* ignore */ }
    finally { setUpdating(null) }
  }

  const filtered = applicants.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = `${app.applicant?.profile?.firstName || ''} ${app.applicant?.profile?.lastName || ''}`.toLowerCase()
      const email = app.applicant?.email?.toLowerCase() || ''
      const headline = app.applicant?.profile?.headline?.toLowerCase() || ''
      if (!name.includes(q) && !email.includes(q) && !headline.includes(q)) return false
    }
    return true
  })

  const selectedJobApplicants = applicants.length
  const totalApplicantsAcrossAll = applicants.length

  const SidebarContent = (
    <Stack spacing={0.5}>
      {/* All Jobs header */}
      <Box
        onClick={() => { setSelectedJob(null); if (isMobile) setSidebarOpen(false) }}
        sx={{
          p: 1.5, borderRadius: 1.5, cursor: 'pointer',
          bgcolor: !selectedJob ? alpha('#3D1C6E', 0.08) : 'transparent',
          border: '1px solid', borderColor: !selectedJob ? '#3D1C6E' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': { bgcolor: alpha('#3D1C6E', 0.04) },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <WorkOutlineOutlined sx={{ fontSize: 18, color: !selectedJob ? '#3D1C6E' : 'text.secondary' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} fontSize="0.8rem" noWrap>
              {t('employerApplications.allJobs')}
            </Typography>
          </Box>
          <Chip label={jobs.length} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
        </Stack>
      </Box>

      <Divider sx={{ my: 0.5 }} />

      {/* Job list */}
      {jobs.map((job) => {
        const tc = TYPE_COLORS[job.type] || { bg: '#F5F5F5', color: '#616161' }
        const isSelected = selectedJob?._id === job._id
        return (
          <Box
            key={job._id}
            onClick={() => { setSelectedJob(job); if (isMobile) setSidebarOpen(false) }}
            sx={{
              p: 1.25, borderRadius: 1.5, cursor: 'pointer',
              bgcolor: isSelected ? alpha('#3D1C6E', 0.08) : 'transparent',
              border: '1px solid', borderColor: isSelected ? '#3D1C6E' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: isSelected ? alpha('#3D1C6E', 0.08) : alpha('#000', 0.02) },
            }}
          >
            <Typography variant="body2" fontWeight={600} fontSize="0.78rem" noWrap sx={{ mb: 0.25 }}>
              {job.title}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.25 }}>
              {job.type && (
                <Chip label={job.type} size="small"
                  sx={{ height: 18, fontSize: '0.55rem', fontWeight: 600, bgcolor: tc.bg, color: tc.color }} />
              )}
              {job.status && (
                <Chip label={job.status} size="small"
                  sx={{
                    height: 18, fontSize: '0.55rem', fontWeight: 600,
                    bgcolor: job.status === 'Open' ? alpha('#16A34A', 0.1) : alpha('#6B7280', 0.1),
                    color: job.status === 'Open' ? '#16A34A' : '#6B7280',
                  }} />
              )}
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 } }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <IconButton size="small" onClick={() => navigate('/employer/dashboard')} sx={{ color: 'text.secondary' }}>
              <ArrowBackOutlined />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800}>
                {t('employerApplications.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {t('employerApplications.subtitle')}
              </Typography>
            </Box>
          </Stack>
        </motion.div>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>

          {/* Sidebar - Desktop */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 3 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Paper sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 88, maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
                    <FilterListOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                      {lang === 'ar' ? 'الوظائف' : 'Jobs'}
                    </Typography>
                    <Chip label={jobs.length} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700, ml: 'auto' }} />
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  {loadingJobs ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
                  ) : (
                    SidebarContent
                  )}
                </Paper>
              </motion.div>
            </Grid>
          )}

          {/* Mobile Sidebar Drawer */}
          <AnimatePresence>
            {isMobile && sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1200 }}
                />
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  style={{ position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1201, overflowY: 'auto', padding: 16 }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{lang === 'ar' ? 'الوظائف' : 'Jobs'}</Typography>
                    <IconButton size="medium" onClick={() => setSidebarOpen(false)} sx={{ minWidth: 44, minHeight: 44 }}>
                      <CloseOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                  {loadingJobs ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
                  ) : (
                    SidebarContent
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <Grid size={{ xs: 12, md: isMobile ? 12 : 9 }}>
            {!selectedJob ? (
              /* All Jobs View */
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                {loadingJobs ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
                ) : jobs.length === 0 ? (
                  <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <WorkOutlineOutlined sx={{ fontSize: 56, color: 'action.disabled', mb: 1.5 }} />
                    <Typography variant="h6" fontWeight={700}>{t('employerApplications.noJobs')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t('employerApplications.noJobsDesc')}</Typography>
                    <Button variant="primary" onClick={() => navigate('/employee/jobs/create')}>
                      {lang === 'ar' ? 'نشر وظيفة' : 'Post a Job'}
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {jobs.map((job, i) => {
                      const tc = TYPE_COLORS[job.type] || { bg: '#F5F5F5', color: '#616161' }
                      return (
                        <motion.div key={job._id} variants={fadeUp} initial="hidden" animate="visible"
                          transition={{ delay: i * 0.05 }}>
                          <Paper
                            onClick={() => setSelectedJob(job)}
                            sx={{
                              p: 2, borderRadius: 2, cursor: 'pointer',
                              border: '1px solid', borderColor: 'divider',
                              transition: 'all 0.2s ease',
                              '&:hover': { borderColor: '#3D1C6E', boxShadow: '0 4px 16px rgba(61,28,110,0.06)' },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E', fontSize: '0.85rem', fontWeight: 700, border: `1px solid ${alpha('#3D1C6E', 0.12)}` }}>
                                {job.title?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} noWrap>{job.title}</Typography>
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                  {job.type && (
                                    <Chip label={job.type} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: tc.bg, color: tc.color }} />
                                  )}
                                  {job.workPlace && (
                                    <Chip label={job.workPlace} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600 }} />
                                  )}
                                  {job.location && (
                                    <Chip icon={<LocationOnOutlined sx={{ fontSize: 10 }} />} label={job.location} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 500 }} />
                                  )}
                                </Stack>
                              </Box>
                              <Chip
                                icon={<PeopleOutlined sx={{ fontSize: 14 }} />}
                                label={job.applicantsCount ?? 0}
                                size="small"
                                sx={{
                                  height: 24, fontWeight: 700, fontSize: '0.7rem',
                                  bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                                }}
                              />
                            </Stack>
                          </Paper>
                        </motion.div>
                      )
                    })}
                  </Stack>
                )}
              </motion.div>
            ) : (
              /* Applicants View */
              <Stack spacing={2}>
                {/* Job Header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      {!isMobile && (
                        <IconButton size="small" onClick={() => setSelectedJob(null)} sx={{ color: 'text.secondary' }}>
                          <ArrowBackOutlined />
                        </IconButton>
                      )}
                      {isMobile && (
                        <IconButton size="small" onClick={() => setSidebarOpen(true)} sx={{ color: '#3D1C6E' }}>
                          <FilterListOutlined />
                        </IconButton>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>{selectedJob.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('employerApplications.applicantsCount', { count: applicants.length })}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </motion.div>

                {/* Search + Filters */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Paper sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <SearchOutlined sx={{ color: 'text.secondary', mr: 1 }} />
                      <InputBase
                        placeholder={t('employerApplications.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flex: 1, py: 0.75, fontSize: '0.85rem' }}
                      />
                    </Paper>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {['all', 'Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected'].map((s) => (
                        <Chip key={s}
                          label={s === 'all' ? t('employerApplications.all') : t(`employerApplications.status${s}`)}
                          size="small"
                          onClick={() => setStatusFilter(s)}
                          color={statusFilter === s ? (s === 'all' ? 'primary' : STATUS_COLORS[s]?.label || 'default') : 'default'}
                          variant={statusFilter === s ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600, fontSize: '0.7rem', height: 28 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </motion.div>

                {/* Applicants List */}
                {loadingApplicants ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                ) : filtered.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <PeopleOutlined sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700}>{t('employerApplications.noApplicants')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('employerApplications.noApplicantsDesc')}</Typography>
                  </Paper>
                ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                    <Stack spacing={1}>
                      {filtered.map((app) => {
                        const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Pending
                        return (
                          <motion.div key={app._id} variants={fadeUp} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                            <Paper
                              onClick={() => setDetailApplicant(app)}
                              sx={{
                                p: 2, borderRadius: 2, cursor: 'pointer',
                                border: '1px solid', borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': { borderColor: '#3D1C6E', boxShadow: '0 4px 16px rgba(61,28,110,0.06)' },
                              }}
                            >
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <Avatar
                                  src={app.applicant?.profile?.avatar}
                                  sx={{
                                    width: 44, height: 44, flexShrink: 0,
                                    bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                                    fontSize: '0.85rem', fontWeight: 700,
                                    border: `1px solid ${alpha('#3D1C6E', 0.12)}`,
                                  }}
                                >
                                  {app.applicant?.profile?.firstName?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                    <Typography variant="body1" fontWeight={700} fontSize="0.9rem" noWrap>
                                      {app.applicant?.profile?.firstName} {app.applicant?.profile?.lastName}
                                    </Typography>
                                    <Chip
                                      label={t(`employerApplications.status${app.status}`)}
                                      size="small"
                                      sx={{
                                        height: 20, fontSize: '0.6rem', fontWeight: 700,
                                        bgcolor: sc.bg, color: sc.color,
                                      }}
                                    />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }} noWrap>
                                    {app.applicant?.profile?.headline || app.applicant?.email}
                                  </Typography>
                                </Box>
                                <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                    {timeAgo(app.createdAt, lang)}
                                  </Typography>
                                  {app.applicant?.profile?.rScore != null && (
                                    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', mt: 0.25 }}>
                                      <StarOutlineOutlined sx={{ fontSize: 12, color: '#E65100' }} />
                                      <Typography variant="caption" fontWeight={700} fontSize="0.65rem" color="#E65100">
                                        {app.applicant.profile.rScore}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
                              </Stack>
                            </Paper>
                          </motion.div>
                        )
                      })}
                    </Stack>
                  </motion.div>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Applicant Detail Dialog */}
      <Dialog
        open={!!detailApplicant}
        onClose={() => setDetailApplicant(null)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        TransitionComponent={isMobile ? SlideTransition : undefined}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
      >
        {detailApplicant && (() => {
          const sc = STATUS_COLORS[detailApplicant.status] || STATUS_COLORS.Pending
          const app = detailApplicant
          const profile = app.applicant?.profile || {}
          const prof = app.applicant?.professional || {}
          return (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {isMobile && (
                    <IconButton size="medium" onClick={() => setDetailApplicant(null)} sx={{ minWidth: 44, minHeight: 44 }}>
                      <ArrowBackOutlined />
                    </IconButton>
                  )}
                  <Avatar
                    src={profile.avatar}
                    sx={{ width: 48, height: 48, bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E', fontSize: '1rem', fontWeight: 700, border: `2px solid ${alpha('#3D1C6E', 0.12)}` }}
                  >
                    {profile.firstName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {profile.headline || app.applicant?.email}
                      </Typography>
                      <Chip
                        label={t(`employerApplications.status${app.status}`)}
                        size="small"
                        sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }}
                      />
                    </Stack>
                  </Box>
                  {!isMobile && (
                    <IconButton size="small" onClick={() => setDetailApplicant(null)}>
                      <CloseOutlined />
                    </IconButton>
                  )}
                </Stack>
              </DialogTitle>

              <DialogContent dividers sx={{ pt: 2 }}>
                <Stack spacing={2.5}>

                  {/* Contact Info */}
                  <Box>
                    <SectionTitle>{t('employerApplications.contactInfo')}</SectionTitle>
                    <Grid container spacing={1.5}>
                      {app.applicant?.email && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem icon={<EmailOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />} label={t('employerApplications.email')} value={app.applicant.email} />
                        </Grid>
                      )}
                      {profile.phoneNumber && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem icon={<PhoneOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />} label={t('employerApplications.phone')} value={profile.phoneNumber} />
                        </Grid>
                      )}
                      {profile.location && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem icon={<LocationOnOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />} label={t('employerApplications.location')} value={profile.location} />
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Professional Info */}
                  <Box>
                    <SectionTitle>{t('employerApplications.professionalInfo')}</SectionTitle>
                    <Grid container spacing={1.5}>
                      {profile.headline && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem label={t('employerApplications.headline')} value={profile.headline} />
                        </Grid>
                      )}
                      {prof.industry && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem label={t('employerApplications.industry')} value={prof.industry} />
                        </Grid>
                      )}
                      {prof.yearsOfExperience != null && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem label={t('employerApplications.yearsExperience')} value={`${prof.yearsOfExperience} ${lang === 'ar' ? 'سنوات' : 'years'}`} />
                        </Grid>
                      )}
                      {profile.rScore != null && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoItem
                            icon={<StarOutlineOutlined sx={{ fontSize: 16, color: '#E65100' }} />}
                            label={t('employerApplications.rScore')}
                            value={<Typography component="span" fontWeight={700} color="#E65100">{profile.rScore}</Typography>}
                          />
                        </Grid>
                      )}
                    </Grid>
                    {prof.skills?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                          {t('employerApplications.skills')}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {prof.skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small"
                              sx={{
                                height: 24, fontSize: '0.7rem', fontWeight: 500,
                                bgcolor: alpha('#3D1C6E', 0.06), color: '#3D1C6E',
                                border: `1px solid ${alpha('#3D1C6E', 0.12)}`,
                              }} />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <Box>
                      <SectionTitle>{t('employerApplications.coverLetter')}</SectionTitle>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                          {app.coverLetter}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Resume */}
                  {app.resume && (
                    <Box>
                      <SectionTitle>{t('employerApplications.resume')}</SectionTitle>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="secondary"
                          size="small"
                          startIcon={<OpenInNewOutlined />}
                          href={app.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t('employerApplications.viewResume')}
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<DownloadOutlined />}
                          href={app.resume}
                          download
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t('employerApplications.downloadResume')}
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Application Info */}
                  <Box>
                    <SectionTitle>{t('employerApplications.applicationInfo')}</SectionTitle>
                    <Stack spacing={1}>
                      <InfoItem
                        label={t('employerApplications.appliedOn')}
                        value={new Date(app.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      />
                      {app.applicant?.createdAt && (
                        <InfoItem
                          label={lang === 'ar' ? 'تاريخ التسجيل' : 'Member since'}
                          value={new Date(app.applicant.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* View Profile Link */}
                  {app.applicant?._id && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setDetailApplicant(null)
                        navigate(`/user-profile/${app.applicant._id}`)
                      }}
                      sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                    >
                      {t('employerApplications.viewProfile')}
                    </Button>
                  )}
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
                {nextStatuses(app.status).map((ns) => {
                  const nsColor = STATUS_COLORS[ns] || {}
                  return (
                    <Button
                      key={ns}
                      variant={ns === 'Rejected' ? 'secondary' : 'primary'}
                      size="small"
                      loading={updating === app._id}
                      onClick={() => handleStatus(app._id, ns)}
                      sx={{
                        ...(ns === 'Rejected' && {
                          border: '1px solid', borderColor: alpha('#C62828', 0.3),
                          color: '#C62828',
                          '&:hover': { bgcolor: alpha('#C62828', 0.04), borderColor: '#C62828' },
                        }),
                        ...(ns === 'Accepted' && {
                          background: 'linear-gradient(135deg, #16A34A, #15803D)',
                          '&:hover': { background: 'linear-gradient(135deg, #15803D, #166534)' },
                        }),
                      }}
                    >
                      {t(`employerApplications.${ns.toLowerCase()}`)}
                    </Button>
                  )
                })}
              </DialogActions>
            </>
          )
        })()}
      </Dialog>
    </Box>
  )
}

function SectionTitle({ children }) {
  return (
    <Typography variant="caption" fontWeight={700} sx={{
      fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: 0.5,
      color: 'text.secondary', display: 'block', mb: 1,
    }}>
      {children}
    </Typography>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      {icon && <Box sx={{ mt: 0.25, flexShrink: 0 }}>{icon}</Box>}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}
