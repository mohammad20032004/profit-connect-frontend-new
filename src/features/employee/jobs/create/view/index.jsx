﻿import { DANGER, RADIUS } from '@/theme/tokens'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, CircularProgress,
  Fade, Divider, IconButton, MenuItem, alpha, Stepper, Step, StepLabel,
} from '@mui/material'
import Button from '@/ui/Button'
import { RangeSlider } from '@/ui'
import {
  ArrowBackOutlined, AddOutlined, DeleteOutlineOutlined,
  ArrowForwardOutlined, ArrowBack,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createJob } from '@/services/employeeService'
import CountrySelect from '@/ui/CountrySelect'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADIUS,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.06)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

const CURRENCIES = ['USD']

export default function CreateJob() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const companyId = user?.company?._id || user?.company

  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    workLevel: '',
    workPlace: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
  })
  const [requirements, setRequirements] = useState([''])
  const [responsibilities, setResponsibilities] = useState([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    t('jobs.basicInfo', 'Basic Info'),
    t('jobs.details', 'Details'),
    t('jobs.requirements', 'Requirements'),
  ]

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const addListItem = (setter) => () => setter((p) => [...p, ''])
  const removeListItem = (setter) => (idx) => setter((p) => p.filter((_, i) => i !== idx))
  const updateListItem = (setter) => (idx) => (e) => setter((p) => p.map((v, i) => i === idx ? e.target.value : v))

  const validateStep = () => {
    if (activeStep === 0) {
      if (!form.title.trim()) {
        setError(t('jobs.titleRequired', 'Job title is required'))
        return false
      }
      if (!form.description.trim()) {
        setError(t('jobs.descriptionRequired', 'Description is required'))
        return false
      }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) setActiveStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleBack = () => {
    setError('')
    setActiveStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async () => {
    if (!companyId) {
      setError(lang === 'ar' ? 'يجب إنشاء ملف الشركة أولاً' : 'Please set up your company first')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        companyId,
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2.5}>
            <TextField label={`${t('jobs.jobTitle')} *`} value={form.title} onChange={set('title')}
              fullWidth size="small" sx={fieldSx} />
            <TextField label={`${t('jobs.description')} *`} value={form.description} onChange={set('description')}
              fullWidth multiline rows={4} size="small" sx={fieldSx} />
            <CountrySelect label={t('jobs.location')} value={form.location} onChange={set('location')} sx={fieldSx} />
          </Stack>
        )
      case 1:
        return (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.type')} value={form.type} onChange={set('type')} select fullWidth size="small" sx={fieldSx}>
                  <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((v) => (
                    <MenuItem key={v} value={v}>{t(`jobs.type${v.charAt(0).toUpperCase() + v.slice(1).replace('-', '')}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.workLevel')} value={form.workLevel} onChange={set('workLevel')} select fullWidth size="small" sx={fieldSx}>
                  <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                  {['Entry', 'Mid', 'Senior', 'Lead'].map((v) => (
                    <MenuItem key={v} value={v}>{t(`jobs.level${v}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.workPlace')} value={form.workPlace} onChange={set('workPlace')} select fullWidth size="small" sx={fieldSx}>
                  <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                  {['Remote', 'On-site', 'Hybrid'].map((v) => (
                    <MenuItem key={v} value={v}>{t(`jobs.place${v.replace('-', '')}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.currency')} value={form.currency} onChange={set('currency')} select fullWidth size="small" sx={fieldSx}>
                  {CURRENCIES.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                </TextField>
              </Grid>
            </Grid>
            <RangeSlider
              label={t('jobs.salary', 'Salary')}
              valueMin={form.salaryMin}
              valueMax={form.salaryMax}
              onChange={(min, max) => setForm((p) => ({ ...p, salaryMin: min, salaryMax: max }))}
              currency={form.currency}
              max={200000}
            />
          </Stack>
        )
      case 2:
        return (
          <Stack spacing={2.5}>
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

            <Divider sx={{ my: 1 }} />

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
        )
      default:
        return null
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

          <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Fade in>
              <Box sx={{ p: 1.5, borderRadius: RADIUS, bgcolor: alpha(DANGER, 0.06), border: '1px solid', borderColor: alpha(DANGER, 0.2) }}>
                <Typography variant="body2" color="error" fontWeight={500}>{error}</Typography>
              </Box>
            </Fade>
          )}

          <Paper sx={{ borderRadius: RADIUS, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Fade in timeout={300} key={activeStep}>
                {renderStepContent()}
              </Fade>
            </Box>
          </Paper>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
            <Button variant="text" onClick={() => navigate('/employee/jobs')}>
              {t('companies.cancel')}
            </Button>
            <Stack direction="row" spacing={1.5}>
              {activeStep > 0 && (
                <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack sx={{ fontSize: 16, transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }} />}>
                  {t('common.back', 'Back')}
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}
                  endIcon={<ArrowForwardOutlined sx={{ fontSize: 16, transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }} />}
                  sx={{ px: 4, fontWeight: 700 }}>
                  {t('common.next', 'Next')}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ px: 4, fontWeight: 700 }}>
                  {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('jobs.publish')}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
