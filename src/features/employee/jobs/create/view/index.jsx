import { DANGER } from '@/theme/tokens'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, CircularProgress,
  Fade, Divider, MenuItem, alpha, Stepper, Step, StepLabel, Chip,
} from '@mui/material'
import Button from '@/ui/Button'
import { RangeSlider, SkillsModal } from '@/ui'
import RichTextEditor from '@/ui/RichTextEditor'
import {
  ArrowBackOutlined, AddOutlined,
  ArrowForwardOutlined, ArrowBack, WorkspacePremiumRounded,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createJob } from '@/services/employeeService'
import CountrySelect from '@/ui/CountrySelect'

const suggestedSkills = [
  'React', 'Node.js', 'Python', 'UI/UX Design', 'Graphic Design',
  'JavaScript', 'TypeScript', 'MongoDB', 'Docker', 'AWS',
  'Flutter', 'React Native', 'Vue.js', 'Angular', 'PHP',
]

const TYPE_OPTIONS = [
  { value: 'Full-time', key: 'typeFullTime' },
  { value: 'Part-time', key: 'typePartTime' },
  { value: 'Contract', key: 'typeContract' },
  { value: 'Internship', key: 'typeInternship' },
  { value: 'Freelance', key: 'typeFreelance' },
]

const LEVEL_OPTIONS = [
  { value: 'Entry', key: 'levelEntry' },
  { value: 'Mid', key: 'levelMid' },
  { value: 'Senior', key: 'levelSenior' },
  { value: 'Lead', key: 'levelLead' },
]

const PLACE_OPTIONS = [
  { value: 'Remote', key: 'placeRemote' },
  { value: 'On-site', key: 'placeOnsite' },
  { value: 'Hybrid', key: 'placeHybrid' },
]

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.06)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

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
  })
  const [requirements, setRequirements] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [skills, setSkills] = useState([])
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    t('jobs.basicInfo', 'Basic Info'),
    t('jobs.details', 'Details'),
    t('jobs.requirements', 'Requirements'),
  ]

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const toggleSkill = (skill) => {
    setSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill])
  }

  const htmlToList = (html) => {
    if (!html || html === '<p></p>') return []
    const div = document.createElement('div')
    div.innerHTML = html
    const items = []
    div.querySelectorAll('li').forEach((li) => {
      const text = li.textContent.trim()
      if (text) items.push(text)
    })
    if (items.length === 0) {
      const text = div.textContent.trim()
      if (text) items.push(text)
    }
    return items
  }

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
          currency: 'USD',
        },
        requirements: htmlToList(requirements),
        responsibilities: htmlToList(responsibilities),
        skills: skills,
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
                  {TYPE_OPTIONS.map(({ value, key }) => (
                    <MenuItem key={value} value={value}>{t(`jobs.${key}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.workLevel')} value={form.workLevel} onChange={set('workLevel')} select fullWidth size="small" sx={fieldSx}>
                  <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                  {LEVEL_OPTIONS.map(({ value, key }) => (
                    <MenuItem key={value} value={value}>{t(`jobs.${key}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={t('jobs.workPlace')} value={form.workPlace} onChange={set('workPlace')} select fullWidth size="small" sx={fieldSx}>
                  <MenuItem value=""><em>{lang === 'ar' ? 'اختر' : 'Select'}</em></MenuItem>
                  {PLACE_OPTIONS.map(({ value, key }) => (
                    <MenuItem key={value} value={value}>{t(`jobs.${key}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <RangeSlider
              label={t('jobs.salary', 'Salary')}
              valueMin={form.salaryMin}
              valueMax={form.salaryMax}
              onChange={(min, max) => setForm((p) => ({ ...p, salaryMin: min, salaryMax: max }))}
              currency="USD"
              max={200000}
            />
          </Stack>
        )
      case 2:
        return (
          <Stack spacing={2.5}>
            {/* Skills */}
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <WorkspacePremiumRounded sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>{t('jobs.skills')}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('jobs.skillsHint')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {suggestedSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    variant={skills.includes(skill) ? 'filled' : 'outlined'}
                    color={skills.includes(skill) ? 'primary' : 'default'}
                    onClick={() => toggleSkill(skill)}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 8px rgba(61,28,110,0.15)' },
                    }}
                  />
                ))}
                <Chip
                  label={t('jobs.addSkills')}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  icon={<AddOutlined />}
                  onClick={() => setSkillsModalOpen(true)}
                  sx={{
                    fontWeight: 700, transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 8px rgba(61,28,110,0.15)' },
                  }}
                />
              </Box>
              {skills.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onDelete={() => toggleSkill(skill)}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="subtitle2" fontWeight={700}>{t('jobs.requirements')}</Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <RichTextEditor
                content={requirements}
                onChange={setRequirements}
                placeholder={t('jobs.requirementsPlaceholder', 'Add job requirements...')}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" fontWeight={700}>{t('jobs.responsibilities')}</Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <RichTextEditor
                content={responsibilities}
                onChange={setResponsibilities}
                placeholder={t('jobs.responsibilitiesPlaceholder', 'Add job responsibilities...')}
              />
            </Box>

            <SkillsModal
              open={skillsModalOpen}
              onClose={() => setSkillsModalOpen(false)}
              selected={skills}
              onToggle={toggleSkill}
            />
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
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(DANGER, 0.06), border: '1px solid', borderColor: alpha(DANGER, 0.2) }}>
                <Typography variant="body2" color="error" fontWeight={500}>{error}</Typography>
              </Box>
            </Fade>
          )}

          <Paper sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
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
