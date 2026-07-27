import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, Slide,
  useMediaQuery, useTheme, Grid, IconButton,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, PeopleOutlined, OpenInNewOutlined, PhoneOutlined,
  EmailOutlined, LocationOnOutlined, StarOutlineOutlined, CloseOutlined,
  DownloadOutlined, WorkOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getJobApplicants, updateApplicationStatus } from '@/services/employeeService'

const STATUS_ACTIONS = {
  Pending: { labelKey: 'applicants.statusPending', variant: 'secondary' },
  Reviewed: { labelKey: 'applicants.review', variant: 'primary' },
  Shortlisted: { labelKey: 'applicants.shortlist', variant: 'primary' },
  Accepted: { labelKey: 'applicants.accept', variant: 'primary' },
  Rejected: { labelKey: 'applicants.reject', variant: 'secondary' },
}

const STATUS_COLORS = {
  Pending: { bg: '#FFF3E0', color: '#E65100' },
  Reviewed: { bg: '#E3F2FD', color: '#1565C0' },
  Shortlisted: { bg: '#EDE7F6', color: '#3D1C6E' },
  Accepted: { bg: '#E8F5E9', color: '#2E7D32' },
  Rejected: { bg: '#FFEBEE', color: '#C62828' },
}

const SlideTransition = (props) => <Slide direction="left" {...props} />

export default function JobApplicants() {
  const { jobId } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await getJobApplicants(jobId, params)
      if (res?.success) setApplicants(res.data || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [jobId, statusFilter])

  useEffect(() => { fetchApplicants() }, [fetchApplicants])

  const handleStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      const res = await updateApplicationStatus(applicationId, status)
      if (res?.success) {
        setApplicants((prev) => prev.map((a) =>
          a._id === applicationId ? { ...a, status } : a
        ))
        if (detailOpen?._id === applicationId) {
          setDetailOpen((prev) => prev ? { ...prev, status } : null)
        }
      }
    } catch { /* ignore */ }
    finally { setUpdating(null) }
  }

  const nextStatuses = (current) => {
    const all = ['Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected']
    return all.filter((s) => s !== current)
  }

  const getProfile = (app) => app?.applicant?.profile || {}
  const getProfessional = (app) => app?.applicant?.professional || {}

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button variant="text" onClick={() => navigate('/employee/jobs')} sx={{ minWidth: 0, p: 1 }}>
              <ArrowBackOutlined />
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold">{t('applicants.title')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('jobs.applicantsCount', { count: applicants.length })}
              </Typography>
            </Box>
          </Stack>

          {/* Status Filter Chips */}
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {['all', 'Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected'].map((s) => {
              const sc = STATUS_COLORS[s] || {}
              return (
                <Chip
                  key={s}
                  label={s === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t(`applicants.status${s}`)}
                  size="small"
                  onClick={() => setStatusFilter(s)}
                  color={statusFilter === s ? (s === 'all' ? 'primary' : undefined) : 'default'}
                  variant={statusFilter === s ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600, fontSize: '0.7rem', height: 28,
                    ...(statusFilter === s && s !== 'all' && {
                      bgcolor: sc.bg, color: sc.color,
                      '&:hover': { bgcolor: sc.bg },
                    }),
                  }}
                />
              )
            })}
          </Stack>

          {/* Loading / Empty / List */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          ) : applicants.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <PeopleOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">{t('applicants.noApplicants')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('applicants.noApplicantsDesc')}</Typography>
            </Paper>
          ) : (
            applicants.map((app, i) => {
              const profile = getProfile(app)
              const professional = getProfessional(app)
              const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Pending
              return (
                <Paper
                  key={app._id || i}
                  sx={{
                    p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#3D1C6E', boxShadow: '0 4px 16px rgba(61,28,110,0.06)' },
                  }}
                  onClick={() => setDetailOpen(app)}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      src={profile.avatar}
                      sx={{
                        width: 44, height: 44, flexShrink: 0,
                        bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                        fontSize: '0.85rem', fontWeight: 700,
                        border: `1px solid ${alpha('#3D1C6E', 0.12)}`,
                      }}
                    >
                      {profile.firstName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {profile.firstName} {profile.lastName}
                        </Typography>
                        <Chip
                          label={t(`applicants.status${app.status}`)}
                          size="small"
                          sx={{
                            fontWeight: 600, height: 22, fontSize: '0.65rem',
                            bgcolor: sc.bg, color: sc.color,
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.75rem' }}>
                        {profile.headline || app.applicant?.email}
                      </Typography>
                      {professional.skills?.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                          {professional.skills.slice(0, 3).map((skill) => (
                            <Chip key={skill} label={skill} size="small"
                              sx={{
                                height: 18, fontSize: '0.55rem', fontWeight: 500,
                                bgcolor: alpha('#3D1C6E', 0.06), color: '#3D1C6E',
                                border: `1px solid ${alpha('#3D1C6E', 0.1)}`,
                              }} />
                          ))}
                          {professional.skills.length > 3 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', alignSelf: 'center' }}>
                              +{professional.skills.length - 3}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Box>
                    <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </Typography>
                      {profile.rScore != null && (
                        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', mt: 0.25 }}>
                          <StarOutlineOutlined sx={{ fontSize: 12, color: '#E65100' }} />
                          <Typography variant="caption" fontWeight={700} fontSize="0.65rem" color="#E65100">
                            {profile.rScore}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              )
            })
          )}
        </Stack>
      </Container>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailOpen}
        onClose={() => setDetailOpen(null)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        TransitionComponent={isMobile ? SlideTransition : undefined}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
      >
        {detailOpen && (() => {
          const profile = getProfile(detailOpen)
          const professional = getProfessional(detailOpen)
          const sc = STATUS_COLORS[detailOpen.status] || STATUS_COLORS.Pending
          return (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {isMobile && (
                    <IconButton size="small" onClick={() => setDetailOpen(null)}>
                      <ArrowBackOutlined />
                    </IconButton>
                  )}
                  <Avatar
                    src={profile.avatar}
                    sx={{
                      width: 48, height: 48,
                      bgcolor: alpha('#3D1C6E', 0.08), color: '#3D1C6E',
                      fontSize: '1rem', fontWeight: 700,
                      border: `2px solid ${alpha('#3D1C6E', 0.12)}`,
                    }}
                  >
                    {profile.firstName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {profile.headline || detailOpen.applicant?.email}
                      </Typography>
                      <Chip
                        label={t(`applicants.status${detailOpen.status}`)}
                        size="small"
                        sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }}
                      />
                    </Stack>
                  </Box>
                  {!isMobile && (
                    <IconButton size="small" onClick={() => setDetailOpen(null)}>
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
                    <Stack spacing={1.5}>
                      {detailOpen.applicant?.email && (
                        <InfoRow icon={<EmailOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />}
                          label={t('employerApplications.email')}
                          value={detailOpen.applicant.email} />
                      )}
                      {profile.phoneNumber && (
                        <InfoRow icon={<PhoneOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />}
                          label={t('employerApplications.phone')}
                          value={profile.phoneNumber} />
                      )}
                      {profile.location && (
                        <InfoRow icon={<LocationOnOutlined sx={{ fontSize: 16, color: '#3D1C6E' }} />}
                          label={t('employerApplications.location')}
                          value={profile.location} />
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Professional Info */}
                  <Box>
                    <SectionTitle>{t('employerApplications.professionalInfo')}</SectionTitle>
                    <Stack spacing={1.5}>
                      {profile.headline && (
                        <InfoRow label={t('employerApplications.headline')} value={profile.headline} />
                      )}
                      {professional.industry && (
                        <InfoRow label={t('employerApplications.industry')} value={professional.industry} />
                      )}
                      {professional.yearsOfExperience != null && (
                        <InfoRow label={t('employerApplications.yearsExperience')}
                          value={`${professional.yearsOfExperience} ${lang === 'ar' ? 'سنوات' : 'years'}`} />
                      )}
                      {profile.rScore != null && (
                        <InfoRow
                          icon={<StarOutlineOutlined sx={{ fontSize: 16, color: '#E65100' }} />}
                          label={t('employerApplications.rScore')}
                          value={<Typography component="span" fontWeight={700} color="#E65100">{profile.rScore}</Typography>}
                        />
                      )}
                    </Stack>
                    {professional.skills?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}
                          sx={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                          {t('employerApplications.skills')}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {professional.skills.map((skill) => (
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
                  {detailOpen.coverLetter && (
                    <Box>
                      <SectionTitle>{t('applicants.coverLetter')}</SectionTitle>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                          {detailOpen.coverLetter}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Resume */}
                  {detailOpen.resume && (
                    <Box>
                      <SectionTitle>{t('applicants.resume')}</SectionTitle>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="secondary"
                          size="small"
                          startIcon={<OpenInNewOutlined />}
                          href={detailOpen.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('employerApplications.viewResume')}
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<DownloadOutlined />}
                          href={detailOpen.resume}
                          download
                        >
                          {t('employerApplications.downloadResume')}
                        </Button>
                      </Stack>
                      {detailOpen.resume.endsWith('.pdf') && (
                        <Box sx={{
                          mt: 1.5, border: '1px solid', borderColor: 'divider',
                          borderRadius: 1.5, overflow: 'hidden', height: 400,
                        }}>
                          <iframe
                            src={detailOpen.resume}
                            title="Resume Preview"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Application Date */}
                  <Box>
                    <SectionTitle>{t('applicants.appliedOn')}</SectionTitle>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(detailOpen.createdAt).toLocaleDateString(
                        lang === 'ar' ? 'ar-SA' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                      )}
                    </Typography>
                  </Box>

                  {/* View Profile */}
                  {detailOpen.applicant?._id && (
                    <Button variant="text" size="small" onClick={() => {
                      setDetailOpen(null)
                      navigate(`/user-profile/${detailOpen.applicant._id}`)
                    }}>
                      {t('applicants.viewProfile')}
                    </Button>
                  )}
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
                {nextStatuses(detailOpen.status).map((ns) => {
                  const action = STATUS_ACTIONS[ns]
                  if (!action) return null
                  const nsColor = STATUS_COLORS[ns] || {}
                  return (
                    <Button
                      key={ns}
                      variant={ns === 'Rejected' ? 'secondary' : 'primary'}
                      size="small"
                      disabled={updating === detailOpen._id}
                      loading={updating === detailOpen._id}
                      onClick={() => handleStatus(detailOpen._id, ns)}
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
                      {t(action.labelKey)}
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

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      {icon && <Box sx={{ mt: 0.25, flexShrink: 0 }}>{icon}</Box>}
      <Box>
        <Typography variant="caption" color="text.secondary"
          sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}
