import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha, Grid,
  Fade, Divider, keyframes, Snackbar, Alert,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  BusinessOutlined, PeopleOutlined, StarOutlineOutlined, CameraAltOutlined,
  CheckCircleOutlineOutlined, PendingOutlined, CancelOutlined, TrendingUpOutlined,
  RocketLaunchOutlined, LocationOnOutlined, LanguageOutlined,
  EmailOutlined, CalendarMonthOutlined, GroupsOutlined, LinkedIn, Twitter,
  VerifiedOutlined, GroupAddOutlined, WorkOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompany, getReputationScore } from '@/services/employerService'
import { updateCompanyMedia } from '@/services/companyService'
import LocationMap from '@/components/LocationMap'
import { extractCoordinates } from '@/utils/coordinates'
import EmployerStats from './EmployerStats'

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

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const SxCard = {
  animation: `${fadeInUp} 0.4s ease-out both`,
}

function formatLocation(loc) {
  if (!loc) return null
  if (typeof loc === 'string') return loc
  return [loc.city, loc.country].filter(Boolean).join(', ') || null
}

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', minWidth: 18 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3, fontSize: '0.625rem' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} fontSize="0.8125rem" noWrap>{value}</Typography>
      </Box>
    </Stack>
  )
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

function ActionCard({ icon, label, onClick }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5, borderRadius: 1, cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 1.25,
        transition: 'all 0.2s ease',
        ...SxCard,
        '&:hover': {
          borderColor: 'primary.main',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          '& .action-icon': { bgcolor: 'primary.main', color: 'white' },
        },
      }}
    >
      <Box className="action-icon" sx={{
        width: 32, height: 32, borderRadius: 1, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        color: 'primary.main',
        transition: 'all 0.2s ease',
      }}>
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={600} fontSize="0.8125rem">{label}</Typography>
    </Paper>
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
        <CircularProgress />
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
          <Paper sx={{
            p: { xs: 4, md: 6 }, borderRadius: 1, textAlign: 'center',
            border: '1px solid', borderColor: 'divider',
            ...SxCard,
          }}>
            <Stack spacing={3} sx={{ alignItems: 'center' }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
              }}>
                <RocketLaunchOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {t('employer.dashboard.noCompanyYet')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  {t('employer.dashboard.noCompanyDesc')}
                </Typography>
              </Box>
              <Button variant="primary" size="large" startIcon={<RocketLaunchOutlined />}
                onClick={() => navigate('/employer/setup')} sx={{ px: 5 }}>
                {t('employer.dashboard.createCompanyPage')}
              </Button>
            </Stack>
          </Paper>
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
  const coords = hasLocation ? extractCoordinates(company.location) : null

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
        <Fade in timeout={400}>
          <Paper sx={{
            borderRadius: 1, overflow: 'hidden', mb: 1.5,
            border: '1px solid', borderColor: 'divider',
            ...SxCard,
          }}>
            {/* Cover Photo */}
            <Box
              onClick={() => coverInputRef.current?.click()}
              sx={{
                height: { xs: 100, md: 130 },
                backgroundImage: company.coverPhoto ? `url(${company.coverPhoto})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                background: company.coverPhoto ? undefined : (t) => alpha(t.palette.primary.main, 0.06),
                position: 'relative',
                cursor: 'pointer',
                transition: 'filter 0.2s ease',
                '&:hover': { filter: 'brightness(0.85)' },
                '&:hover .cover-camera': { opacity: 1 },
                '&::after': company.coverPhoto ? {
                  content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.25))',
                } : {},
              }}
            >
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleCoverChange} />
              <Box className="cover-camera" sx={{
                position: 'absolute', top: 8, right: 8,
                width: 32, height: 32, borderRadius: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                opacity: uploading === 'coverPhoto' ? 1 : 0,
                transition: 'opacity 0.2s ease', zIndex: 1,
              }}>
                {uploading === 'coverPhoto' ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CameraAltOutlined sx={{ fontSize: 18 }} />}
              </Box>
            </Box>

            <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2, pt: 0 }}>
              <Stack direction="row" spacing={2} sx={{ mt: -4, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {/* Logo Avatar with Camera */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={company.logo}
                    sx={{
                      width: { xs: 60, md: 72 }, height: { xs: 60, md: 72 },
                      bgcolor: 'primary.main', fontSize: 26,
                      border: '3px solid', borderColor: 'background.paper',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    {company.name?.charAt(0)}
                  </Avatar>
                  <Box
                    onClick={() => logoInputRef.current?.click()}
                    sx={{
                      position: 'absolute', bottom: 0, right: -2,
                      width: 26, height: 26, borderRadius: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'primary.main', color: 'white',
                      border: '2px solid', borderColor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
                    }}
                  >
                    {uploading === 'logo' ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CameraAltOutlined sx={{ fontSize: 14 }} />}
                  </Box>
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleLogoChange} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 200, pb: 0.25 }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant="h6" fontWeight={800} noWrap>{company.name}</Typography>
                    {company.isVerified && <VerifiedOutlined sx={{ fontSize: 18, color: 'primary.main' }} />}
                    <Chip icon={status.icon} label={t(`employer.status.${statusKey}`)} size="small" color={status.color}
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
                    {industryLabel && (
                      <Chip label={industryLabel} size="small" variant="outlined"
                        sx={{ fontWeight: 500, fontSize: '0.65rem', height: 22 }} />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Stats inline */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                {[
                  { icon: <PeopleOutlined sx={{ fontSize: 18 }} />, value: company.followersCount ?? 0, label: t('employer.dashboard.followers'), color: '#3D1C6E' },
                  { icon: <StarOutlineOutlined sx={{ fontSize: 18 }} />, value: reputation?.score ?? company.averageRating ?? '—', label: t('employer.dashboard.rScore'), color: '#D97706' },
                  { icon: <TrendingUpOutlined sx={{ fontSize: 18 }} />, value: reputation?.level || '—', label: t('employer.dashboard.level'), color: '#16A34A' },
                ].map((s, i) => (
                  <Paper key={i} sx={{
                    flex: 1, py: 1.5, px: 1, borderRadius: 1, textAlign: 'center',
                    border: '1px solid', borderColor: 'divider',
                    borderTop: `3px solid ${s.color}`,
                    transition: 'all 0.2s ease',
                    ...SxCard,
                    animationDelay: `${i * 0.07}s`,
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
                  }}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                      <Typography variant="h6" fontWeight={800} fontSize="1rem" sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mt: 0.25, display: 'block' }}>
                      {s.label}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* Main Content Grid */}
        <Grid container spacing={1.5}>

          {/* Left Column */}
          <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
            <Stack spacing={1.5}>

              {/* Company Details */}
              <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', ...SxCard }}>
                <SectionHeader icon={<BusinessOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('employer.setup.companyInfoSummary')} />
                <Divider sx={{ mb: 1.25 }} />
                <Stack spacing={1.25}>
                  <InfoRow icon={<BusinessOutlined sx={{ fontSize: 16 }} />} label={t('companies.description')} value={company.description} />
                  <InfoRow icon={<BusinessOutlined sx={{ fontSize: 16 }} />} label={t('companies.industry')} value={industryLabel} />
                  <InfoRow icon={<GroupsOutlined sx={{ fontSize: 16 }} />} label={t('companies.companySize')} value={sizeLabel} />
                  <InfoRow icon={<CalendarMonthOutlined sx={{ fontSize: 16 }} />} label={t('companies.foundedYear')} value={company.foundedYear} />
                  <InfoRow icon={<LanguageOutlined sx={{ fontSize: 16 }} />} label={t('companies.website')} value={company.website} />
                  <InfoRow icon={<EmailOutlined sx={{ fontSize: 16 }} />} label={t('companies.contactEmail')} value={company.contactEmail} />
                  <InfoRow icon={<LocationOnOutlined sx={{ fontSize: 16 }} />} label={t('companies.location')} value={locationStr} />
                </Stack>
              </Paper>

              {/* Social Links */}
              {(company.socialLinks?.linkedin || company.socialLinks?.twitter) && (
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', ...SxCard }}>
                  <SectionHeader icon={<LanguageOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={lang === 'ar' ? 'روابط التواصل' : 'Social Links'} />
                  <Divider sx={{ mb: 1.25 }} />
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {company.socialLinks?.linkedin && (
                      <Chip icon={<LinkedIn sx={{ fontSize: 15 }} />} label="LinkedIn" component="a" href={company.socialLinks.linkedin}
                        target="_blank" rel="noopener" clickable size="small"
                        sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28, borderColor: alpha('#0A66C2', 0.2),
                          '&:hover': { bgcolor: alpha('#0A66C2', 0.06), borderColor: '#0A66C2' } }} />
                    )}
                    {company.socialLinks?.twitter && (
                      <Chip icon={<Twitter sx={{ fontSize: 15 }} />} label="Twitter / X" component="a" href={company.socialLinks.twitter}
                        target="_blank" rel="noopener" clickable size="small"
                        sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28, borderColor: alpha('#1DA1F2', 0.2),
                          '&:hover': { bgcolor: alpha('#1DA1F2', 0.06), borderColor: '#1DA1F2' } }} />
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Quick Actions */}
              <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', ...SxCard }}>
                <SectionHeader icon={<TrendingUpOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'} />
                <Divider sx={{ mb: 1.25 }} />
                <Stack spacing={1}>
                  <ActionCard icon={<GroupAddOutlined sx={{ fontSize: 16 }} />}
                    label={lang === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
                    onClick={() => navigate('/employer/employees')} />
                  <ActionCard icon={<WorkOutlineOutlined sx={{ fontSize: 16 }} />}
                    label={lang === 'ar' ? 'إدارة الوظائف' : 'Manage Jobs'}
                    onClick={() => navigate('/employee/jobs')} />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
            <Stack spacing={1.5}>

              {/* Map + Location Details */}
              {hasLocation && (
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', ...SxCard }}>
                  <SectionHeader icon={<LocationOnOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('companies.location')} />
                  <Divider sx={{ mb: 1.25 }} />
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <LocationMap location={company.location} readonly height={300} controls={false} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Stack spacing={1.25}>
                        {(company.location?.country || company.location?.city) && (
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider' }}>
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
                        )}
                        {(company.location?.street || company.location?.buildingNumber) && (
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider' }}>
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
                        )}
                        {company.location?.country && (
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider' }}>
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
                        )}
                        {company.location?.city && (
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider' }}>
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
                        )}
                        {coords && (
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip size="small" variant="outlined"
                                label={`Lat: ${coords[1].toFixed(6)}`}
                                sx={{ fontSize: '0.65rem', height: 22 }} />
                              <Chip size="small" variant="outlined"
                                label={`Lng: ${coords[0].toFixed(6)}`}
                                sx={{ fontSize: '0.65rem', height: 22 }} />
                            </Stack>
                          </Paper>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Cover Photo Full */}
              {!hasLocation && (
                <Paper sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', ...SxCard }}>
                  <Box sx={{
                    height: { xs: 160, md: 280 },
                    backgroundImage: company.coverPhoto ? `url(${company.coverPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    bgcolor: company.coverPhoto ? 'grey.200' : (t) => alpha(t.palette.primary.main, 0.06),
                  }} />
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Statistics Charts Section */}
        {company.status === 'Approved' && (
          <Box sx={{ mt: 1.5 }}>
            <EmployerStats companyId={company._id} />
          </Box>
        )}

        {/* Footer */}
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block', py: 1.5, mt: 0.5, fontSize: '0.625rem' }}>
          {lang === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(company.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Container>

      {/* Status Notification Snackbar */}
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
            )}
          </Stack>
        </Alert>
      </Snackbar>
    </Box>
  )
}
