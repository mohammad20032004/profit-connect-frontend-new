import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha,
  Fade, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, PeopleOutlined, OpenInNewOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getJobApplicants, updateApplicationStatus } from '@/services/employeeService'

const STATUS_COLORS = {
  Pending: 'warning',
  Reviewed: 'info',
  Shortlisted: 'primary',
  Accepted: 'success',
  Rejected: 'error',
}

export default function JobApplicants() {
  const { jobId } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()

  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getJobApplicants(jobId)
      if (res?.success) setApplicants(res.data || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [jobId])

  useEffect(() => { fetchApplicants() }, [fetchApplicants])

  const handleStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      const res = await updateApplicationStatus(applicationId, status)
      if (res?.success) {
        setApplicants((prev) => prev.map((a) =>
          a._id === applicationId ? { ...a, status } : a
        ))
      }
    } catch { /* ignore */ }
    finally { setUpdating(null) }
  }

  const nextStatuses = (current) => {
    const flow = {
      Pending: ['Reviewed', 'Rejected'],
      Reviewed: ['Shortlisted', 'Rejected'],
      Shortlisted: ['Accepted', 'Rejected'],
      Accepted: [],
      Rejected: [],
    }
    return flow[current] || []
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Fade in timeout={400}>
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
          </Fade>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          ) : applicants.length === 0 ? (
            <Fade in timeout={500}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <PeopleOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">{t('applicants.noApplicants')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('applicants.noApplicantsDesc')}</Typography>
              </Paper>
            </Fade>
          ) : (
            applicants.map((app, i) => (
              <Fade in key={app._id || i} timeout={400 + i * 80}>
                <Paper
                  sx={{
                    p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 12px rgba(61,28,110,0.06)' },
                  }}
                  onClick={() => setDetailOpen(app)}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar src={app.applicant?.avatar} sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: 16 }}>
                      {app.applicant?.firstName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {app.applicant?.firstName} {app.applicant?.lastName}
                        </Typography>
                        <Chip
                          label={t(`applicants.status${app.status}`)}
                          size="small"
                          color={STATUS_COLORS[app.status] || 'default'}
                          sx={{ fontWeight: 600, height: 22 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {app.applicant?.headline || app.applicant?.email}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Paper>
              </Fade>
            ))
          )}
        </Stack>
      </Container>

      {/* Detail Dialog */}
      <Dialog open={!!detailOpen} onClose={() => setDetailOpen(null)} maxWidth="sm" fullWidth>
        {detailOpen && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar src={detailOpen.applicant?.avatar} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {detailOpen.applicant?.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    {detailOpen.applicant?.firstName} {detailOpen.applicant?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detailOpen.applicant?.headline || detailOpen.applicant?.email}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                {/* Status */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{t('applicants.status')}</Typography>
                  <Chip label={t(`applicants.status${detailOpen.status}`)} size="small"
                    color={STATUS_COLORS[detailOpen.status] || 'default'} sx={{ fontWeight: 600 }} />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{t('applicants.appliedOn')}</Typography>
                  <Typography variant="body2">
                    {new Date(detailOpen.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
                </Stack>

                {/* Resume */}
                {detailOpen.resumeLink && (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{t('applicants.resume')}</Typography>
                    <Button variant="outlined" size="small" startIcon={<OpenInNewOutlined />}
                      href={detailOpen.resumeLink} target="_blank" rel="noopener">
                      {t('applicants.resume')}
                    </Button>
                  </Stack>
                )}

                {/* Cover Letter */}
                {detailOpen.coverLetter && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {t('applicants.coverLetter')}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {detailOpen.coverLetter}
                      </Typography>
                    </Paper>
                  </Box>
                )}

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
              {nextStatuses(detailOpen.status).map((ns) => (
                <Button
                  key={ns}
                  variant={ns === 'Rejected' ? 'outlined' : 'contained'}
                  color={ns === 'Rejected' ? 'error' : ns === 'Accepted' ? 'success' : 'primary'}
                  size="small"
                  disabled={updating === detailOpen._id}
                  onClick={() => handleStatus(detailOpen._id, ns)}
                >
                  {updating === detailOpen._id ? <CircularProgress size={16} /> : t(`applicants.${ns.toLowerCase()}`)}
                </Button>
              ))}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
