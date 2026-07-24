import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, CircularProgress,
  Fade, Divider, Chip, IconButton, MenuItem, Fade as FadeIn,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, AddOutlined, DeleteOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createJob } from '@/services/employeeService'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.06)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

const CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'EGP', 'JOD', 'KWD', 'QAR', 'BHD', 'OMR', 'LBP']

export default function CreateJob() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    workLevel: '',
    workPlace: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'SAR',
  })
  const [requirements, setRequirements] = useState([''])
  const [responsibilities, setResponsibilities] = useState([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const addListItem = (setter) => () => setter((p) => [...p, ''])
  const removeListItem = (setter) => (idx) => setter((p) => p.filter((_, i) => i !== idx))
  const updateListItem = (setter) => (idx) => (e) => setter((p) => p.map((v, i) => i === idx ? e.target.value : v))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError(t('jobs.fillRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        type: form.type,
        workLevel: form.workLevel,
        workPlace: form.workPlace,
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: form.currency,
        },
        requirements: requirements.filter((r) => r.trim()),
        responsibilities: responsibilities.filter((r) => r.trim()),
      }
      const res = await createJob(payload)
      if (res?.success) navigate('/employee/jobs')
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Fade in timeout={400}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button variant="text" onClick={() => navigate('/employee/jobs')} sx={{ minWidth: 0, p: 1 }}>
                <ArrowBackOutlined />
              </Button>
              <Typography variant="h5" fontWeight="bold">{t('jobs.createJob')}</Typography>
            </Stack>
          </Fade>

          {error && (
            <Fade in>
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha('#DC2626', 0.06), border: '1px solid', borderColor: alpha('#DC2626', 0.2) }}>
                <Typography variant="body2" color="error" fontWeight={500}>{error}</Typography>
              </Box>
            </Fade>
          )}

          {loading && <Box sx={{ mb: -1 }}><Fade in><Box sx={{ height: 3, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
            <Box sx={{ height: '100%', width: '40%', bgcolor: 'primary.main', animation: 'pulse 1.5s infinite', borderRadius: 2 }} />
          </Box></Fade></Box>}

          <Paper sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={2.5}>
                <TextField label={`${t('jobs.jobTitle')} *`} value={form.title} onChange={set('title')}
                  fullWidth size="small" sx={fieldSx} />

                <TextField label={`${t('jobs.description')} *`} value={form.description} onChange={set('description')}
                  fullWidth multiline rows={3} size="small" sx={fieldSx} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label={t('jobs.location')} value={form.location} onChange={set('location')}
                      fullWidth size="small" sx={fieldSx} placeholder={t('jobs.locationPlaceholder')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label={t('jobs.type')} value={form.type} onChange={set('type')} select fullWidth size="small" sx={fieldSx}>
                      <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                      {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((v) => (
                        <MenuItem key={v} value={v}>{t(`jobs.type${v.charAt(0).toUpperCase() + v.slice(1).replace('-', '')}`)}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField label={t('jobs.workLevel')} value={form.workLevel} onChange={set('workLevel')} select fullWidth size="small" sx={fieldSx}>
                      <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                      {['Entry', 'Mid', 'Senior', 'Lead'].map((v) => (
                        <MenuItem key={v} value={v}>{t(`jobs.level${v}`)}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label={t('jobs.workPlace')} value={form.workPlace} onChange={set('workPlace')} select fullWidth size="small" sx={fieldSx}>
                      <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                      {['Remote', 'Onsite', 'Hybrid'].map((v) => (
                        <MenuItem key={v} value={v}>{t(`jobs.place${v}`)}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label={t('jobs.currency')} value={form.currency} onChange={set('currency')} select fullWidth size="small" sx={fieldSx}>
                      {CURRENCIES.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label={t('jobs.salaryMin')} value={form.salaryMin} onChange={set('salaryMin')}
                      fullWidth size="small" type="number" sx={fieldSx} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label={t('jobs.salaryMax')} value={form.salaryMax} onChange={set('salaryMax')}
                      fullWidth size="small" type="number" sx={fieldSx} />
                  </Grid>
                </Grid>

                <Divider />

                {/* Requirements */}
                <Typography variant="subtitle2" fontWeight={700}>{t('jobs.requirements')}</Typography>
                {requirements.map((req, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField value={req} onChange={updateListItem(setRequirements)(i)}
                      fullWidth size="small" placeholder={`${t('jobs.requirementsPlaceholder')} #${i + 1}`} sx={fieldSx} />
                    <IconButton size="small" onClick={removeListItem(setRequirements)(i)} color="error"
                      disabled={requirements.length <= 1}>
                      <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                ))}
                <Button variant="text" startIcon={<AddOutlined />} onClick={addListItem(setRequirements)}
                  size="small" sx={{ alignSelf: 'flex-start' }}>
                  {t('jobs.addRequirement')}
                </Button>

                <Divider />

                {/* Responsibilities */}
                <Typography variant="subtitle2" fontWeight={700}>{t('jobs.responsibilities')}</Typography>
                {responsibilities.map((resp, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField value={resp} onChange={updateListItem(setResponsibilities)(i)}
                      fullWidth size="small" placeholder={`${t('jobs.responsibilitiesPlaceholder')} #${i + 1}`} sx={fieldSx} />
                    <IconButton size="small" onClick={removeListItem(setResponsibilities)(i)} color="error"
                      disabled={responsibilities.length <= 1}>
                      <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                ))}
                <Button variant="text" startIcon={<AddOutlined />} onClick={addListItem(setResponsibilities)}
                  size="small" sx={{ alignSelf: 'flex-start' }}>
                  {t('jobs.addResponsibility')}
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="text" onClick={() => navigate('/employee/jobs')}>
              {t('companies.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ px: 4, fontWeight: 700 }}>
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('jobs.publish')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
