import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha, Grid,
  Divider, Snackbar, Alert,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/ui/Button'
import {
  CameraAltOutlined,
  CheckCircleOutlineOutlined, PendingOutlined, CancelOutlined,
  RocketLaunchOutlined, LocationOnOutlined, LanguageOutlined,
  LinkedIn, Twitter,
  VerifiedOutlined, GroupAddOutlined, WorkOutlineOutlined, PeopleOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompany, getReputationScore } from '@/services/employerService'
import { updateCompanyMedia } from '@/services/companyService'
import { resolveCompanyMediaPath } from '@/services/profile'
import LocationMap from '@/components/LocationMap'
import { extractCoordinates } from '@/utils/coordinates'
import EmployerStats from '../components/EmployerStats'
import { fadeUp, staggerContainer } from '@/utils/animations'

const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: <PendingOutlined sx={{ fontSize: 16 }} /> },
  Approved: { color: 'success', icon: <CheckCircleOutlineOutlined sx={{ fontSize: 16 }} /> },
  Rejected: { color: 'error', icon: <CancelOutlined sx={{ fontSize: 16 }} /> },
}

const INDUSTRIES = {
  'web-development': { en: 'Web Development', ar: 'تطوير المواقع' },
  'mobile-development': { en: 'Mobile Development', ar: 'تطوير تطبيقات الجوال' },
  'frontend': { en: 'Frontend Development', ar: 'تطوير الواجهات الأمامية' },
  'backend': { en: 'Backend Development', ar: 'تطوير الخلفيات' },
  'fullstack': { en: 'Full Stack Development', ar: 'تطوير شامل' },
  'devops': { en: 'DevOps & Cloud', ar: 'DevOps والحوسبة السحابية' },
  'ai-ml': { en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي والتعلم الآلي' },
  'data-science': { en: 'Data Science & Analytics', ar: 'علوم البيانات والتحليلات' },
  'cybersecurity': { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
  'ui-ux': { en: 'UI/UX Design', ar: 'تصميم واجهات وتجربة المستخدم' },
  'qa-testing': { en: 'QA & Testing', ar: 'الجودة والاختبار' },
  'game-dev': { en: 'Game Development', ar: 'تطوير الألعاب' },
  'blockchain': { en: 'Blockchain & Web3', ar: 'بلوكتشين وويب 3' },
  'iot': { en: 'IoT & Embedded Systems', ar: 'إنترنت الأشياء والأنظمة المدمجة' },
  'saas': { en: 'SaaS Products', ar: 'منتجات SaaS' },
  'ecommerce-tech': { en: 'E-commerce Tech', ar: 'تقنيات التجارة الإلكترونية' },
  'other': { en: 'Other', ar: 'أخرى' },
}

const COMPANY_SIZES = {
  '1-10': { en: '1-10 employees', ar: '1-10 موظفين' },
  '11-50': { en: '11-50 employees', ar: '11-50 موظف' },
  '51-200': { en: '51-200 employees', ar: '51-200 موظف' },
  '201-500': { en: '201-500 employees', ar: '201-500 موظف' },
  '501-1000': { en: '501-1000 employees', ar: '501-1000 موظف' },
  '1000+': { en: '1000+ employees', ar: '1000+ موظف' },
}

function formatLocation(loc) {
  if (!loc) return null
  if (typeof loc === 'string') return loc
  return [loc.city, loc.country].filter(Boolean).join(', ') || null
}

function SectionHeader({ icon, title }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.25 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: 1, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
      }}>
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.675rem', color: 'text.secondary' }}>
        {title}
      </Typography>
    </Stack>
  )
}

export default function EmployerDashboard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const [company, setCompany] = useState(user?.company || null)
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState('')
  const [notificationDismissed, setNotificationDismissed] = useState(false)
  const logoInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const handleMediaUpload = useCallback(async (field, file) => {
    if (!file || !company?._id) return
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(t('employer.dashboard.fileTooLarge') || 'File too large (max 5MB)')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError(t('employer.dashboard.invalidFileType') || 'Only JPG, PNG, WEBP allowed')
      return
    }
    setUploading(field)
    setError('')
    try {
      const fd = new FormData()
      fd.append(field, file)
      const res = await updateCompanyMedia(company._id, fd)
      if (res?.success && res?.data) {
        setCompany(res.data)
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setUploading('')
    }
  }, [company, t])

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleMediaUpload('logo', file)
    e.target.value = ''
  }, [handleMediaUpload])

  const handleCoverChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleMediaUpload('coverPhoto', file)
    e.target.value = ''
  }, [handleMediaUpload])

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const [companyRes, repRes] = await Promise.allSettled([
        getMyCompany(),
        getReputationScore(),
      ])
      if (companyRes.status === 'fulfilled' && companyRes.value?.success) {
        setCompany(companyRes.value.data)
      }
      if (repRes.status === 'fulfilled' && repRes.value?.success) {
        setReputation(repRes.value.data)
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        >
          <CircularProgress />
        </motion.div>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="secondary" onClick={() => fetchData()}>{t('companies.retry')}</Button>
      </Container>
    )
  }

  if (!company) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Paper sx={{
              p: { xs: 4, md: 6 }, borderRadius: 1, textAlign: 'center',
              border: '1px solid', borderColor: 'divider',
            }}>
              <Stack spacing={3} sx={{ alignItems: 'center' }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Box sx={{
                    width: 80, height: 80, borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                  }}>
                    <RocketLaunchOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </motion.div>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                    {t('employer.dashboard.noCompanyYet')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    {t('employer.dashboard.noCompanyDesc')}
                  </Typography>
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="primary" size="large" startIcon={<RocketLaunchOutlined />}
                    onClick={() => navigate('/employer/setup')} sx={{ px: 5 }}>
                    {t('employer.dashboard.createCompanyPage')}
                  </Button>
                </motion.div>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    )
  }

  const status = STATUS_CONFIG[company.status] || STATUS_CONFIG.Pending
  const statusKey = company.status?.toLowerCase() || 'pending'
  const locationStr = formatLocation(company.location)
  const industryLabel = company.industry ? INDUSTRIES[company.industry]?.[lang] : null
  const sizeLabel = company.companySize ? COMPANY_SIZES[company.companySize]?.[lang] : null
  const hasLocation = company.location && (locationStr || company.location.coordinates || extractCoordinates(company.location))

  const statusNotification = !notificationDismissed ? (() => {
    const map = {
      Pending: { severity: 'warning', message: t('employer.dashboard.pendingReview'), actionLabel: t('employer.dashboard.trackStatus'), actionPath: '/employer/pending', reason: null },
      Approved: { severity: 'success', message: t('employer.dashboard.approvedMessage'), actionLabel: null, actionPath: null, reason: null },
      Rejected: { severity: 'error', message: t('employer.dashboard.rejectedMessage'), actionLabel: t('employer.dashboard.resubmit'), actionPath: '/employer/setup', reason: company.rejectionReason },
    }
    return map[company.status] || null
  })() : null

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>

        {/* Hero + Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Paper sx={{
            borderRadius: 1, overflow: 'hidden', mb: 1.5,
            border: '1px solid', borderColor: 'divider',
          }}>
            {/* Cover Photo */}
            <Box
              onClick={() => coverInputRef.current?.click()}
              sx={{
                height: { xs: 100, md: 130, lg: 180 }, width: '100%',
                backgroundImage: company.coverPhoto ? `url(${resolveCompanyMediaPath(company.coverPhoto)})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                background: company.coverPhoto ? undefined : (t) => alpha(t.palette.primary.main, 0.06),
                position: 'relative',
                cursor: 'pointer',
                transition: 'filter 0.3s ease',
                '&:hover': { filter: 'brightness(0.85)' },
                '&:hover .cover-camera': { opacity: 1 },
                '&::after': company.coverPhoto ? {
                  content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.25))',
                } : {},
              }}
            >
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleCoverChange} />
              <motion.div
                className="cover-camera"
                whileHover={{ scale: 1.1 }}
                sx={{
                  position: 'absolute', top: 8, insetInlineEnd: 8,
                  width: 32, height: 32, borderRadius: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                  opacity: uploading === 'coverPhoto' ? 1 : 0,
                  transition: 'opacity 0.2s ease', zIndex: 1,
                }}
              >
                {uploading === 'coverPhoto' ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CameraAltOutlined sx={{ fontSize: 18 }} />}
              </motion.div>
            </Box>

            <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2, pt: 0 }}>
              <Stack direction="row" spacing={2} sx={{ mt: -4, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {/* Logo Avatar with Camera */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar
                      src={company.logo ? resolveCompanyMediaPath(company.logo) : undefined}
                      sx={{
                        width: { xs: 60, md: 72 }, height: { xs: 60, md: 72 },
                        bgcolor: 'primary.main', fontSize: 26,
                        border: '3px solid', borderColor: 'background.paper',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                      }}
                    >
                      {company.name?.charAt(0)}
                    </Avatar>
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Box
                        onClick={() => logoInputRef.current?.click()}
                        sx={{
                           position: 'absolute', bottom: 0, insetInlineEnd: -2,
                          width: 26, height: 26, borderRadius: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: 'primary.main', color: 'white',
                          border: '2px solid', borderColor: 'background.paper',
                          cursor: 'pointer',
                          transition: 'bgcolor 0.2s ease',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        {uploading === 'logo' ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CameraAltOutlined sx={{ fontSize: 14 }} />}
                      </Box>
                    </motion.div>
                    <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleLogoChange} />
                  </Box>
                </motion.div>

                <Box sx={{ flex: 1, minWidth: 200, pb: 0.25 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="h6" fontWeight={800} noWrap>{company.name}</Typography>
                      {company.isVerified && (
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6, delay: 0.8 }}>
                          <VerifiedOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                        </motion.div>
                      )}
                      <Chip icon={status.icon} label={t(`employer.status.${statusKey}`)} size="small" color={status.color}
                        sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
                      {industryLabel && (
                        <Chip label={industryLabel} size="small" variant="outlined"
                          sx={{ fontWeight: 500, fontSize: '0.65rem', height: 22 }} />
                      )}
                    </Stack>
                  </motion.div>
                </Box>
              </Stack>

              {/* Stats inline */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Box container spacing={0.5} sx={{ mt: 1.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <Box sx={{textAlign: 'center'}}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.8125rem" color="text.primary">
                      {company.followersCount ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {t('employer.dashboard.followers')}
                    </Typography>
                  </Box>
                  <Box sx={{textAlign: 'center'}}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.8125rem" color="text.primary">
                      {reputation?.score ?? company.averageRating ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {t('employer.dashboard.rScore')}
                    </Typography>
                  </Box>
                  <Box sx={{textAlign: 'center'}}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.8125rem" color="text.primary">
                      {reputation?.level || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {t('employer.dashboard.level')}
                    </Typography>
                  </Box>
                                      <Stack spacing={1} direction="row" sx={{ flex: 1, minWidth: 200, mt: 1 }}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="primary"
                          fullWidth
                          startIcon={<GroupAddOutlined />}
                          onClick={() => navigate('/employer/employees')}
                          sx={{
                            justifyContent: 'flex-start',
                            bgcolor: '#3D1C6E',
                            '&:hover': { bgcolor: '#2E1555' },
                          }}
                        >
                          {lang === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="primary"
                          fullWidth
                          startIcon={<WorkOutlineOutlined />}
                          onClick={() => navigate('/employer/jobs')}
                          sx={{
                            justifyContent: 'flex-start',
                            bgcolor: '#3D1C6E',
                            '&:hover': { bgcolor: '#2E1555' },
                          }}
                        >
                          {lang === 'ar' ? 'إدارة الوظائف' : 'Manage Jobs'}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="primary"
                          fullWidth
                          startIcon={<PeopleOutlined />}
                          onClick={() => navigate('/employer/applications')}
                          sx={{
                            justifyContent: 'flex-start',
                            bgcolor: '#3D1C6E',
                            '&:hover': { bgcolor: '#2E1555' },
                          }}
                        >
                          {lang === 'ar' ? 'طلبات التقديم' : 'Applications'}
                        </Button>
                      </motion.div>
                    </Stack>

                </Box>
              </motion.div>

              {/* Company Info Inside Hero */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={1.5}>
                  {company.description && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                        {t('companies.description')}
                      </Typography>
                      <Typography variant="body2" fontSize="0.8125rem" color="text.primary" sx={{ lineHeight: 1.5 }}>
                        {company.description}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                      {t('companies.industry')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" color="text.primary">
                      {industryLabel || '—'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                      {t('companies.companySize')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" color="text.primary">
                      {sizeLabel || '—'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                      {t('companies.foundedYear')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" color="text.primary">
                      {company.foundedYear || '—'}
                    </Typography>
                  </Grid>
                  {company.website && (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                        {t('companies.website')}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" color="primary.main" component="a" href={company.website} target="_blank" rel="noopener" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {company.website}
                      </Typography>
                    </Grid>
                  )}
                  {locationStr && (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
                        {t('companies.location')}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" color="text.primary">
                        {locationStr}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <Grid container spacing={1.5}>

            {/* Left Column */}
            <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
              <Stack spacing={1.5}>

                {/* Social Links */}
                {(company.socialLinks?.linkedin || company.socialLinks?.twitter) && (
                  <motion.div variants={fadeUp} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'border-color 0.2s ease', '&:hover': { borderColor: 'primary.main' } }}>
                      <SectionHeader icon={<LanguageOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={lang === 'ar' ? 'روابط التواصل' : 'Social Links'} />
                      <Divider sx={{ mb: 1.25 }} />
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        {company.socialLinks?.linkedin && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Chip icon={<LinkedIn sx={{ fontSize: 15 }} />} label="LinkedIn" component="a" href={company.socialLinks.linkedin}
                              target="_blank" rel="noopener" clickable size="small"
                              sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28, borderColor: alpha('#0A66C2', 0.2),
                                transition: 'all 0.2s ease',
                                '&:hover': { bgcolor: alpha('#0A66C2', 0.06), borderColor: '#0A66C2' } }} />
                          </motion.div>
                        )}
                        {company.socialLinks?.twitter && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Chip icon={<Twitter sx={{ fontSize: 15 }} />} label="Twitter / X" component="a" href={company.socialLinks.twitter}
                              target="_blank" rel="noopener" clickable size="small"
                              sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28, borderColor: alpha('#1DA1F2', 0.2),
                                transition: 'all 0.2s ease',
                                '&:hover': { bgcolor: alpha('#1DA1F2', 0.06), borderColor: '#1DA1F2' } }} />
                          </motion.div>
                        )}
                      </Stack>
                    </Paper>
                  </motion.div>
                )}

              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12 }}>
              <Stack spacing={1.5}>

                {/* Map + Location Details */}
                {hasLocation && (
                  <motion.div variants={fadeUp} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Paper sx={{ p: 2, border: 'none', bgcolor: 'transparent' }} elevation={0}>
                      <SectionHeader icon={<LocationOnOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('companies.location')} />
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 7 }}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <LocationMap location={company.location} readonly height={300} controls={false} />
                          </motion.div>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <Stack spacing={1.25}>
                              {(company.location?.country || company.location?.city) && (
                                <motion.div variants={fadeUp}>
                                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <LocationOnOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                          {lang === 'ar' ? 'الموقع' : 'Address'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} fontSize="0.8125rem">
                                          {[company.location?.city, company.location?.country].filter(Boolean).join(', ')}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </motion.div>
                              )}
                              {(company.location?.street || company.location?.buildingNumber) && (
                                <motion.div variants={fadeUp}>
                                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <LocationOnOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                          {lang === 'ar' ? 'الشارع' : 'Street'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} fontSize="0.8125rem">
                                          {[company.location.street, company.location.buildingNumber].filter(Boolean).join(', ')}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </motion.div>
                              )}
                              {company.location?.country && (
                                <motion.div variants={fadeUp}>
                                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <LocationOnOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                          {lang === 'ar' ? 'الدولة' : 'Country'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} fontSize="0.8125rem">{company.location.country}</Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </motion.div>
                              )}
                              {company.location?.city && (
                                <motion.div variants={fadeUp}>
                                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <LocationOnOutlined sx={{ fontSize: 16, color: 'secondary.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                          {lang === 'ar' ? 'المدينة' : 'City'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} fontSize="0.8125rem">{company.location.city}</Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </motion.div>
                              )}
                            </Stack>
                          </motion.div>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                )}

                {/* Cover Photo Full */}
                {!hasLocation && (
                  <motion.div variants={fadeUp}>
                    <Paper sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{
                          height: { xs: 160, md: 280 },
                          backgroundImage: company.coverPhoto ? `url(${resolveCompanyMediaPath(company.coverPhoto)})` : 'none',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          bgcolor: company.coverPhoto ? 'grey.200' : (t) => alpha(t.palette.primary.main, 0.06),
                        }} />
                      </motion.div>
                    </Paper>
                  </motion.div>
                )}
              </Stack>
            </Grid>
          </Grid>
        </motion.div>

        {/* Statistics Charts Section */}
        {company.status === 'Approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Box sx={{ mt: 1.5 }}>
              <EmployerStats companyId={company._id} />
            </Box>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block', py: 1.5, mt: 0.5, fontSize: '0.625rem' }}>
            {lang === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(company.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </motion.div>
      </Container>

      {/* Status Notification Snackbar */}
      <AnimatePresence>
        {statusNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ position: 'fixed', top: 16, insetInlineEnd: 16, zIndex: 1300 }}
          >
            <Snackbar
              open={!!statusNotification}
              autoHideDuration={8000}
              onClose={() => setNotificationDismissed(true)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                severity={statusNotification?.severity}
                onClose={() => setNotificationDismissed(true)}
                variant="filled"
                sx={{
                  width: '100%',
                  minWidth: 320,
                  borderRadius: 1,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="body2" fontWeight={700}>
                    {statusNotification?.message}
                  </Typography>
                  {statusNotification?.reason && (
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {statusNotification.reason}
                    </Typography>
                  )}
                  {statusNotification?.actionLabel && statusNotification?.actionPath && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate(statusNotification.actionPath)
                          setNotificationDismissed(true)
                        }}
                        sx={{
                          mt: 0.5, alignSelf: 'flex-start',
                          color: 'white', borderColor: 'rgba(255,255,255,0.5)',
                          fontSize: '0.75rem',
                          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        {statusNotification.actionLabel}
                      </Button>
                    </motion.div>
                  )}
                </Stack>
              </Alert>
            </Snackbar>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
