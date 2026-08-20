import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, Avatar, Chip, alpha, Grid,
  CircularProgress, Divider, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
} from '@mui/material'
import {
  LocationOnOutlined, AccessTimeOutlined,
  AttachMoneyOutlined, CheckCircleOutlineOutlined, CloseOutlined,
  ArrowBackOutlined, UploadFileOutlined, SendOutlined,
  StarOutlineOutlined, PeopleOutlined, BusinessOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { getJobById, applyToJob } from '@/services/jobService'

const TYPE_COLORS = {
  'Full-time': { bg: '#EDE7F6', color: '#3D1C6E' },
  'Part-time': { bg: '#E3F2FD', color: '#1565C0' },
  'Freelance': { bg: '#E0F7FA', color: '#00838F' },
  'Internship': { bg: '#E8F5E9', color: '#2E7D32' },
  'Contract': { bg: '#FFF3E0', color: '#E65100' },
}

const LEVEL_LABELS = { Entry: lang => lang === 'ar' ? 'مبتدئ' : 'Entry', Mid: lang => lang === 'ar' ? 'متوسط' : 'Mid', Senior: lang => lang === 'ar' ? 'متقدم' : 'Senior', Lead: lang => lang === 'ar' ? 'قائد فريق' : 'Lead' }
const PLACE_LABELS = { Remote: lang => lang === 'ar' ? 'عن بُعد' : 'Remote', Onsite: lang => lang === 'ar' ? 'في المكتب' : 'On-site', Hybrid: lang => lang === 'ar' ? 'مختلط' : 'Hybrid' }

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

export default function JobDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const user = useSelector((s) => s.user.user)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [applyOpen, setApplyOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [applyError, setApplyError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getJobById(id)
        if (res?.success) setJob(res.data)
        else setError(t('common.notFound'))
      } catch {
        setError(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, t])

  const handleApply = async () => {
    if (!resumeFile) { setApplyError(lang === 'ar' ? 'يرجى رفع السيرة الذاتية' : 'Please upload your resume'); return }
    setApplying(true)
    setApplyError('')
    try {
      const fd = new FormData()
      fd.append('resume', resumeFile)
      if (coverLetter) fd.append('coverLetter', coverLetter)
      await applyToJob(id, fd)
      setApplySuccess(true)
    } catch (err) {
      setApplyError(err?.response?.data?.message || t('common.error'))
    } finally {
      setApplying(false)
    }
  }

  const handleCloseApply = () => {
    setApplyOpen(false)
    setApplySuccess(false)
    setCoverLetter('')
    setResumeFile(null)
    setApplyError('')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !job) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>{t('projects.back')}</Button>
      </Container>
    )
  }

  const tc = TYPE_COLORS[job.type] || { bg: '#F5F5F5', color: '#616161' }
  const salary = formatSalary(job.salary)
  const postedByName = [job.postedBy?.profile?.firstName, job.postedBy?.profile?.lastName].filter(Boolean).join(' ')

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>


        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Grid container>

              {/* ── Left: Main Content (scrollable) ── */}
              <Grid size={{ xs: 12, md: 7 }} sx={{ borderColor: 'divider' }}>
                <Box sx={{ p: { xs: 2.5, md: 3 }, overflow: 'auto', maxHeight: { md: 'calc(100vh - 140px)' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 } }}>

                  {/* Title + Company */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      src={job.company?.logo}
                      alt={job.company?.name}
                      sx={{
                        width: 48, height: 48, flexShrink: 0,
                        bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                        fontSize: '1.1rem', fontWeight: 700,
                        border: `1px solid ${alpha('#3D1C6E', 0.12)}`,
                      }}
                    >
                      {job.company?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3, mb: 0.25 }}>
                        {job.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {job.company?.name}
                        </Typography>
                        {job.company?.isVerified && (
                          <CheckCircleOutlineOutlined sx={{ fontSize: 14, color: 'primary.main' }} />
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Tags */}
                  <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 0.75 }}>
                    {job.type && (
                      <Chip label={job.type} size="small"
                        sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600, bgcolor: tc.bg, color: tc.color }} />
                    )}
                    {job.workLevel && (
                      <Chip label={LEVEL_LABELS[job.workLevel]?.(lang) || job.workLevel} size="small" variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
                    )}
                    {job.workPlace && (
                      <Chip label={PLACE_LABELS[job.workPlace]?.(lang) || job.workPlace} size="small" variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
                    )}
                    {job.status && (
                      <Chip label={job.status === 'Open' ? t('jobs.statusOpen') : t('jobs.statusClosed')} size="small"
                        sx={{
                          height: 24, fontSize: '0.7rem', fontWeight: 600,
                          bgcolor: job.status === 'Open' ? alpha('#16A34A', 0.1) : alpha('#DC2626', 0.1),
                          color: job.status === 'Open' ? '#16A34A' : '#DC2626',
                        }} />
                    )}
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Description */}
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                    {t('jobs.description')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3, whiteSpace: 'pre-line' }}>
                    {job.description}
                  </Typography>

                  {/* Requirements */}
                  {job.requirements?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                        {t('jobs.requirements')}
                      </Typography>
                      <Stack spacing={0.75}>
                        {job.requirements.map((req, i) => (
                          <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                            <CheckCircleOutlineOutlined sx={{ fontSize: 15, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
                              {req}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                        {t('jobs.responsibilities')}
                      </Typography>
                      <Stack spacing={0.75}>
                        {job.responsibilities.map((resp, i) => (
                          <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                            <CheckCircleOutlineOutlined sx={{ fontSize: 15, color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
                              {resp}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* ── Right: Sidebar Info (sticky) ── */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{
                  p: { xs: 2.5, md: 3 },
                  position: { md: 'sticky' },
                  top: { md: 80 },
                  maxHeight: { md: 'calc(100vh - 140px)' },
                  overflow: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 },
                }}>

                  {/* Quick Info */}
                  <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                    {job.location && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <LocationOnOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.85rem">{job.location}</Typography>
                      </Stack>
                    )}
                    {salary && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <AttachMoneyOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.85rem">{salary}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <AccessTimeOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                        {timeAgo(job.createdAt, lang)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Apply Button */}
                  <Button
                    variant="primary"
                    fullWidth
                    size="large"
                    startIcon={<SendOutlined />}
                    onClick={() => user ? setApplyOpen(true) : navigate('/sign-in')}
                    disabled={job.status !== 'Open'}
                    sx={{ py: 1.4, fontWeight: 700, fontSize: '0.95rem', textTransform: 'none', borderRadius: 1.5, mb: 0.75 }}
                  >
                    {job.status === 'Open' ? (lang === 'ar' ? 'تقدم للوظيفة' : 'Apply Now') : (lang === 'ar' ? 'الوظيفة مغلقة' : 'Job Closed')}
                  </Button>
                  {job.status === 'Open' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2.5, fontSize: '0.7rem' }}>
                      {lang === 'ar' ? 'سيتم إرسال سيرتك الذاتية مباشرة للشركة' : 'Your resume will be sent directly to the company'}
                    </Typography>
                  )}

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Company Info */}
                  <Box
                    onClick={() => navigate(`/companies/${job.company?._id || job.company?.id}`)}
                    sx={{ cursor: 'pointer', mb: 2.5, p: 1.5, borderRadius: 1, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha('#3D1C6E', 0.04) } }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        src={job.company?.logo}
                        sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {job.company?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>{job.company?.name}</Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.25 }}>
                          {job.company?.industry && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                              <BusinessOutlined sx={{ fontSize: 12 }} />
                              {job.company.industry}
                            </Typography>
                          )}
                          {job.company?.averageRating > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                              <StarOutlineOutlined sx={{ fontSize: 12, color: 'warning.main' }} />
                              {job.company.averageRating.toFixed(1)}
                            </Typography>
                          )}
                          {job.company?.followersCount > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                              <PeopleOutlined sx={{ fontSize: 12 }} />
                              {job.company.followersCount}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Posted By */}
                  {postedByName && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar
                          src={job.postedBy?.profile?.avatar}
                          sx={{ width: 32, height: 32, bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          {job.postedBy?.profile?.firstName?.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                            {t('jobs.postedBy')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.8rem" noWrap>
                            {postedByName}
                          </Typography>
                        </Box>
                      </Stack>
                      {job.postedBy?.profile?.headline && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          {job.postedBy.profile.headline}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Grid>

            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* Apply Dialog */}
      <AnimatePresence>
        {applyOpen && (
          <Dialog
            open={applyOpen}
            onClose={handleCloseApply}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
            TransitionComponent={motion}
            TransitionProps={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } }}
          >
            {applySuccess ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircleOutlineOutlined sx={{ fontSize: 64, color: 'success.main', mb: 1.5 }} />
                </motion.div>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  {lang === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Application Sent!'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {lang === 'ar' ? 'حظاً موفقاً' : 'Good luck!'}
                </Typography>
                <Button variant="primary" onClick={handleCloseApply}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </Box>
            ) : (
              <>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {lang === 'ar' ? 'تقديم على الوظيفة' : 'Apply for this job'}
                  </Typography>
                   <IconButton onClick={handleCloseApply} size="medium" sx={{ minWidth: 44, minHeight: 44 }}>
                     <CloseOutlined sx={{ fontSize: 20 }} />
                   </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                  <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75, fontSize: '0.85rem' }}>
                        {lang === 'ar' ? 'السيرة الذاتية *' : 'Resume *'}
                      </Typography>
                      <Paper
                        onClick={() => fileInputRef.current?.click()}
                        variant="outlined"
                        sx={{
                          p: 2, cursor: 'pointer', textAlign: 'center',
                          border: '2px dashed', borderColor: resumeFile ? 'primary.main' : 'divider',
                          borderRadius: 1.5, transition: 'all 0.2s',
                          bgcolor: resumeFile ? alpha('#3D1C6E', 0.03) : 'transparent',
                          '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#3D1C6E', 0.02) },
                        }}
                      >
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" hidden
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFile(f) }} />
                        {resumeFile ? (
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                            <UploadFileOutlined sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{resumeFile.name}</Typography>
                          </Stack>
                        ) : (
                          <>
                            <UploadFileOutlined sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              {lang === 'ar' ? 'اضغط لرفع PDF أو Word' : 'Click to upload PDF or Word'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                              {lang === 'ar' ? 'حد أقصى 10MB' : 'Max 10MB'}
                            </Typography>
                          </>
                        )}
                      </Paper>
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75, fontSize: '0.85rem' }}>
                        {lang === 'ar' ? 'رسالة التقديم (اختياري)' : 'Cover Letter (optional)'}
                      </Typography>
                      <TextField
                        multiline
                        rows={4}
                        fullWidth
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder={lang === 'ar' ? 'لماذا أنت مناسب لهذه الوظيفة؟' : 'Why are you a good fit for this role?'}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Box>

                    {applyError && (
                      <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>{applyError}</Typography>
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                  <Button onClick={handleCloseApply} sx={{ textTransform: 'none' }}>
                    {t('projects.cancel')}
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      onClick={handleApply}
                      disabled={applying}
                      startIcon={applying ? <CircularProgress size={16} /> : <SendOutlined />}
                      sx={{ textTransform: 'none' }}
                    >
                      {applying ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال الطلب' : 'Submit Application')}
                    </Button>
                  </motion.div>
                </DialogActions>
              </>
            )}
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  )
}
