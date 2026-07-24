import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha, Grid,
  Fade, Divider,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  BusinessOutlined, PeopleOutlined, StarOutlineOutlined, EditOutlined,
  CheckCircleOutlineOutlined, PendingOutlined, CancelOutlined, TrendingUpOutlined,
  RocketLaunchOutlined, InfoOutlined, LocationOnOutlined, LanguageOutlined,
  EmailOutlined, CalendarMonthOutlined, GroupsOutlined, LinkedIn, Twitter,
  VerifiedOutlined, GroupAddOutlined, WorkOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompany, getReputationScore } from '@/services/employerService'
import LocationMap from '@/components/LocationMap'
import { extractCoordinates } from '@/utils/coordinates'

const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: <PendingOutlined /> },
  Approved: { color: 'success', icon: <CheckCircleOutlineOutlined /> },
  Rejected: { color: 'error', icon: <CancelOutlined /> },
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

function formatLocation(loc, lang) {
  if (!loc) return null
  if (typeof loc === 'string') return loc
  const parts = [loc.city, loc.country].filter(Boolean)
  return parts.join(', ') || null
}

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', minWidth: 20 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} noWrap>{value}</Typography>
      </Box>
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
        <Button variant="outlined" onClick={() => fetchData()}>{t('companies.retry')}</Button>
      </Container>
    )
  }

  if (!company) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha('#3D1C6E', 0.08),
            }}>
              <RocketLaunchOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {t('employer.dashboard.noCompanyYet')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
              {t('employer.dashboard.noCompanyDesc')}
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/employer/setup')} sx={{ px: 4 }}>
              {t('employer.dashboard.createCompanyPage')}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  const status = STATUS_CONFIG[company.status] || STATUS_CONFIG.Pending
  const statusKey = company.status?.toLowerCase() || 'pending'
  const locationStr = formatLocation(company.location, lang)
  const industryLabel = company.industry ? INDUSTRIES[company.industry]?.[lang] : null
  const sizeLabel = company.companySize ? COMPANY_SIZES[company.companySize]?.[lang] : null
  const hasLocation = company.location && (locationStr || company.location.coordinates || extractCoordinates(company.location))

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>

          {/* Status Banners */}
          {company.status === 'Pending' && (
            <Fade in timeout={550}>
              <Paper sx={{
                p: 2.5, borderRadius: 1.5,
                bgcolor: alpha('#F59E0B', 0.05),
                border: '1px solid', borderColor: alpha('#F59E0B', 0.2),
              }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <PendingOutlined sx={{ color: 'warning.main', fontSize: 24 }} />
                    <Typography variant="body1" fontWeight={700} color="warning.dark">
                      {t('employer.dashboard.pendingReview')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {t('employer.dashboard.pendingDesc')}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('employer.dashboard.pendingAdmins')}
                    </Typography>
                  </Stack>
                  <Button variant="outlined" size="small" onClick={() => navigate('/employer/pending')} sx={{ alignSelf: 'flex-start' }}>
                    {t('employer.dashboard.trackStatus')}
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          )}

          {company.status === 'Rejected' && (
            <Fade in timeout={550}>
              <Paper sx={{
                p: 2.5, borderRadius: 1.5,
                bgcolor: alpha('#DC2626', 0.05),
                border: '1px solid', borderColor: alpha('#DC2626', 0.2),
              }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CancelOutlined sx={{ color: 'error.main', fontSize: 24 }} />
                    <Typography variant="body1" fontWeight={700} color="error.main">
                      {t('employer.dashboard.rejectedMessage')}
                    </Typography>
                  </Stack>
                  {company.rejectionReason && (
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {t('employer.dashboard.rejectionReason')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {company.rejectionReason}
                      </Typography>
                    </Box>
                  )}
                  <Button variant="contained" size="small" onClick={() => navigate('/employer/setup')} sx={{ alignSelf: 'flex-start' }}>
                    {t('employer.dashboard.resubmit')}
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          )}

          {company.status === 'Approved' && (
            <Fade in timeout={550}>
              <Paper sx={{
                p: 2, borderRadius: 1.5,
                bgcolor: alpha('#16A34A', 0.05),
                border: '1px solid', borderColor: alpha('#16A34A', 0.15),
              }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CheckCircleOutlineOutlined sx={{ color: 'success.main', fontSize: 22 }} />
                  <Typography variant="body2" color="success.dark" fontWeight={500}>
                    {t('employer.dashboard.approvedMessage')}
                  </Typography>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Two Column Layout */}
          <Fade in timeout={500}>
            <Grid container spacing={2.5}>

              {/* Left Column - Company Profile */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={2}>
                  {/* Cover + Logo + Name + Status */}
                  <Paper sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{
                      height: 100, bgcolor: 'grey.100',
                      backgroundImage: company.coverPhoto ? `url(${company.coverPhoto})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      bgcolor: !company.coverPhoto ? alpha('#3D1C6E', 0.06) : undefined,
                    }} />
                    <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5 }}>
                      <Stack direction="row" spacing={2} sx={{ mt: -4.5, alignItems: 'flex-end' }}>
                        <Avatar
                          src={company.logo}
                          sx={{
                            width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28,
                            border: '3px solid', borderColor: 'background.paper',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          {company.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0, pb: 0.5 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            <Typography variant="h6" fontWeight="bold" noWrap>{company.name}</Typography>
                            {company.isVerified && (
                              <VerifiedOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                            )}
                          </Stack>
                          <Chip
                            icon={status.icon}
                            label={t(`employer.status.${statusKey}`)}
                            size="small"
                            color={status.color}
                            sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Paper>

                  {/* Stats */}
                  <Stack direction="row" spacing={1.5}>
                    <Paper sx={{
                      flex: 1, p: 1.5, borderRadius: 1.5, textAlign: 'center',
                      border: '1px solid', borderColor: 'divider',
                    }}>
                      <PeopleOutlined sx={{ fontSize: 22, color: 'primary.main', mb: 0.2 }} />
                      <Typography variant="h6" fontWeight="bold">{company.followersCount ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('employer.dashboard.followers')}</Typography>
                    </Paper>
                    <Paper sx={{
                      flex: 1, p: 1.5, borderRadius: 1.5, textAlign: 'center',
                      border: '1px solid', borderColor: 'divider',
                    }}>
                      <StarOutlineOutlined sx={{ fontSize: 22, color: 'warning.main', mb: 0.2 }} />
                      <Typography variant="h6" fontWeight="bold">{reputation?.score ?? company.averageRating ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('employer.dashboard.rScore')}</Typography>
                    </Paper>
                    <Paper sx={{
                      flex: 1, p: 1.5, borderRadius: 1.5, textAlign: 'center',
                      border: '1px solid', borderColor: 'divider',
                    }}>
                      <TrendingUpOutlined sx={{ fontSize: 22, color: 'success.main', mb: 0.2 }} />
                      <Typography variant="h6" fontWeight="bold">{reputation?.level || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('employer.dashboard.level')}</Typography>
                    </Paper>
                  </Stack>

                  {/* Company Details */}
                  <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', color: 'text.secondary' }}>
                      {t('employer.setup.companyInfoSummary')}
                    </Typography>
                    <Stack spacing={1.75}>
                      <InfoRow
                        icon={<BusinessOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.description')}
                        value={company.description}
                      />
                      <InfoRow
                        icon={<BusinessOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.industry')}
                        value={industryLabel}
                      />
                      <InfoRow
                        icon={<GroupsOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.companySize')}
                        value={sizeLabel}
                      />
                      <InfoRow
                        icon={<CalendarMonthOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.foundedYear')}
                        value={company.foundedYear}
                      />
                      <InfoRow
                        icon={<LanguageOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.website')}
                        value={company.website}
                      />
                      <InfoRow
                        icon={<EmailOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.contactEmail')}
                        value={company.contactEmail}
                      />
                      <InfoRow
                        icon={<LocationOnOutlined sx={{ fontSize: 18 }} />}
                        label={t('companies.location')}
                        value={locationStr}
                      />
                    </Stack>
                  </Paper>

                  {/* Social Links */}
                  {(company.socialLinks?.linkedin || company.socialLinks?.twitter) && (
                    <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', color: 'text.secondary' }}>
                        {lang === 'ar' ? 'روابط التواصل' : 'Social Links'}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {company.socialLinks?.linkedin && (
                          <Chip
                            icon={<LinkedIn sx={{ fontSize: 16 }} />}
                            label="LinkedIn"
                            component="a"
                            href={company.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener"
                            clickable
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                        {company.socialLinks?.twitter && (
                          <Chip
                            icon={<Twitter sx={{ fontSize: 16 }} />}
                            label="Twitter"
                            component="a"
                            href={company.socialLinks.twitter}
                            target="_blank"
                            rel="noopener"
                            clickable
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Quick Actions */}
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" fullWidth startIcon={<GroupAddOutlined />}
                      onClick={() => navigate('/employer/employees')} size="small"
                      sx={{ borderRadius: 1.5 }}>
                      {lang === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<WorkOutlineOutlined />}
                      onClick={() => navigate('/employee/jobs')} size="small"
                      sx={{ borderRadius: 1.5 }}>
                      {lang === 'ar' ? 'إدارة الوظائف' : 'Manage Jobs'}
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              {/* Right Column - Map & Location */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2}>
                  {/* Cover Photo Full */}
                  <Paper sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{
                      height: 200, bgcolor: 'grey.100',
                      backgroundImage: company.coverPhoto ? `url(${company.coverPhoto})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      bgcolor: !company.coverPhoto ? alpha('#3D1C6E', 0.06) : undefined,
                    }} />
                  </Paper>

                  {/* Location Map */}
                  {hasLocation && (
                    <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', color: 'text.secondary' }}>
                        {t('companies.location')}
                      </Typography>
                      <LocationMap location={company.location} readonly height={280} controls={false} />
                      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                        {(company.location?.country || company.location?.city) && (
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <LocationOnOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight={500}>
                              {[company.location?.city, company.location?.country].filter(Boolean).join(', ')}
                            </Typography>
                          </Stack>
                        )}
                        {(company.location?.street || company.location?.buildingNumber) && (
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <LocationOnOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {[company.location.street, company.location.buildingNumber].filter(Boolean).join(', ')}
                            </Typography>
                          </Stack>
                        )}
                        {(() => {
                          const coords = extractCoordinates(company.location)
                          if (!coords) return null
                          return (
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Lat: {coords[1].toFixed(6)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Lng: {coords[0].toFixed(6)}
                              </Typography>
                            </Stack>
                          )
                        })()}
                      </Stack>
                    </Paper>
                  )}

                  {/* Country & City Info Cards */}
                  {hasLocation && (
                    <Stack direction="row" spacing={2}>
                      {company.location?.country && (
                        <Paper sx={{
                          flex: 1, p: 2, borderRadius: 1.5,
                          border: '1px solid', borderColor: 'divider', textAlign: 'center',
                        }}>
                          <LocationOnOutlined sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                            {lang === 'ar' ? 'الدولة' : 'Country'}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>{company.location.country}</Typography>
                        </Paper>
                      )}
                      {company.location?.city && (
                        <Paper sx={{
                          flex: 1, p: 2, borderRadius: 1.5,
                          border: '1px solid', borderColor: 'divider', textAlign: 'center',
                        }}>
                          <LocationOnOutlined sx={{ fontSize: 28, color: 'secondary.main', mb: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                            {lang === 'ar' ? 'المدينة' : 'City'}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>{company.location.city}</Typography>
                        </Paper>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Fade>

          {/* Created At */}
          <Fade in timeout={850}>
            <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block', py: 1 }}>
              {lang === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(company.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Fade>
        </Stack>
      </Container>
    </Box>
  )
}
