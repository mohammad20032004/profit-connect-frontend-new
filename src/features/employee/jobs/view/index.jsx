import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Chip, alpha, Fade, Divider,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  AddOutlined, WorkOutlineOutlined, LocationOnOutlined, PeopleOutlined,
  AccessTimeOutlined, OpenInNewOutlined, CloseOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getEmployeeJobs } from '@/services/employeeService'

const TYPE_LABELS = {
  'Full-time': { en: 'Full-time', ar: 'دوام كامل' },
  'Part-time': { en: 'Part-time', ar: 'دوام جزئي' },
  'Contract': { en: 'Contract', ar: 'عقد' },
  'Internship': { en: 'Internship', ar: 'تدريب' },
  'Freelance': { en: 'Freelance', ar: 'عمل حر' },
}

const LEVEL_LABELS = {
  'Entry': { en: 'Entry', ar: 'مبتدئ' },
  'Mid': { en: 'Mid', ar: 'متوسط' },
  'Senior': { en: 'Senior', ar: 'Senior' },
  'Lead': { en: 'Lead', ar: 'قائد فريق' },
}

export default function EmployeeJobs() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.status = filter
      const res = await getEmployeeJobs(params)
      if (res?.success) setJobs(res.data || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Fade in timeout={400}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">{t('jobs.title')}</Typography>
              <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/employee/jobs/create')} size="small">
                {t('jobs.createJob')}
              </Button>
            </Stack>
          </Fade>

          {/* Filters */}
          <Fade in timeout={450}>
            <Stack direction="row" spacing={1}>
              {['all', 'Open', 'Closed'].map((f) => (
                <Chip key={f} label={f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t(`jobs.status${f}`)}
                  onClick={() => setFilter(f)} color={filter === f ? 'primary' : 'default'}
                  variant={filter === f ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />
              ))}
            </Stack>
          </Fade>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          ) : jobs.length === 0 ? (
            <Fade in timeout={500}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <WorkOutlineOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">{t('jobs.noJobs')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('jobs.noJobsDesc')}</Typography>
                <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/employee/jobs/create')}>
                  {t('jobs.createJob')}
                </Button>
              </Paper>
            </Fade>
          ) : (
            jobs.map((job, i) => (
              <Fade in key={job._id || i} timeout={400 + i * 80}>
                <Paper
                  sx={{
                    p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 12px rgba(61,28,110,0.08)' },
                  }}
                  onClick={() => navigate(`/employee/jobs/${job._id}/applicants`)}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={700}>{job.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('jobs.createdAt')}: {new Date(job.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        icon={job.status === 'Open' ? <OpenInNewOutlined sx={{ fontSize: 14 }} /> : <CloseOutlined sx={{ fontSize: 14 }} />}
                        label={t(`jobs.status${job.status}`)}
                        size="small"
                        color={job.status === 'Open' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {job.type && (
                        <Chip icon={<WorkOutlineOutlined sx={{ fontSize: 12 }} />}
                          label={TYPE_LABELS[job.type]?.[lang] || job.type}
                          size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      )}
                      {job.workLevel && (
                        <Chip label={LEVEL_LABELS[job.workLevel]?.[lang] || job.workLevel}
                          size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      )}
                      {job.workPlace && (
                        <Chip label={job.workPlace} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      )}
                      {job.location && (
                        <Chip icon={<LocationOnOutlined sx={{ fontSize: 12 }} />} label={job.location}
                          size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      )}
                      {job.salary && (
                        <Chip label={`${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} ${job.salary.currency || ''}`}
                          size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" noWrap sx={{ lineHeight: 1.5 }}>
                      {job.description?.length > 120 ? `${job.description.slice(0, 120)}...` : job.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Fade>
            ))
          )}
        </Stack>
      </Container>
    </Box>
  )
}
