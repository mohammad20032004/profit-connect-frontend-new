import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import {
  Container, Box, Typography, Stack, Chip, Stepper, Step, StepLabel, Paper, CircularProgress, IconButton,
  Link as MuiLink, useTheme,
} from '@mui/material'
import Button from '@/ui/Button'
import { keyframes } from '@mui/material/styles'
import { signup } from '@/services/authService'
import { setAuthData } from '@/redux/slices/userSlice'
import Logo from '@/components/common/Logo'
import StepPersonalInfo from '../components/StepPersonalInfo'
import StepAccount from '../components/StepAccount'
import StepProfessional from '../components/StepProfessional'
import StepAvatarReview from '../components/StepAvatarReview'
import StepCompanyInfo from '../components/StepCompanyInfo'
import StepCompanyDetails from '../components/StepCompanyDetails'

const STEP_TKEYS = {
  personal: 'auth.stepPersonal',
  account: 'auth.stepAccount',
  professional: 'auth.stepProfessional',
  companyInfo: 'auth.stepCompanyInfo',
  companyDetails: 'auth.stepCompanyDetails',
  photo: 'auth.stepPhoto',
}

const STEPS_BY_ROLE = {
  Employer: ['personal', 'account', 'companyInfo', 'companyDetails', 'photo'],
  default: ['personal', 'account', 'professional', 'photo'],
}

const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`

export default function SignUpView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    password: '', role: 'JobSeeker', gender: '',
    industry: '', yearsOfExperience: '', skills: [],
    companyName: '', companyDescription: '', companyIndustry: '', companyLocation: '',
    website: '', companySize: '', foundedYear: '',
    avatar: null,
  })

  const isEmployer = form.role === 'Employer'
  const stepKeys = isEmployer ? STEPS_BY_ROLE.Employer : STEPS_BY_ROLE.default
  const steps = stepKeys.map((key) => ({ key, label: t(STEP_TKEYS[key]) }))

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const handleChange = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStep = () => {
    const e = {}
    const stepKey = steps[activeStep]?.key
    if (stepKey === 'personal') {
      if (!form.firstName.trim()) e.firstName = t('auth.required')
      if (!form.lastName.trim()) e.lastName = t('auth.required')
      if (!form.email.trim()) e.email = t('auth.required')
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('auth.invalidEmail')
    }
    if (stepKey === 'account') {
      if (!form.password) e.password = t('auth.required')
      else if (form.password.length < 6) e.password = t('auth.minChars')
    }
    if (stepKey === 'companyInfo') {
      if (!form.companyName.trim()) e.companyName = t('auth.companyNameRequired')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep()) { setDirection('forward'); setActiveStep((s) => Math.min(s + 1, steps.length - 1)) }
  }

  const handleBack = () => { setDirection('backward'); setActiveStep((s) => Math.max(s - 1, 0)) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('firstName', form.firstName.trim())
      fd.append('lastName', form.lastName.trim())
      fd.append('email', form.email.trim())
      fd.append('password', form.password)
      fd.append('role', form.role)
      if (form.phoneNumber) fd.append('phoneNumber', form.phoneNumber)
      if (form.gender) fd.append('gender', form.gender)
      if (form.industry) fd.append('industry', form.industry)
      if (form.yearsOfExperience) fd.append('yearsOfExperience', String(form.yearsOfExperience))
      form.skills.forEach((s) => fd.append('skills[]', s))
      if (isEmployer) {
        if (form.companyName.trim()) fd.append('companyName', form.companyName.trim())
        if (form.companyDescription.trim()) fd.append('companyDescription', form.companyDescription.trim())
        if (form.companyIndustry) fd.append('companyIndustry', form.companyIndustry)
        if (form.companyLocation.trim()) fd.append('companyLocation', form.companyLocation.trim())
        if (form.website.trim()) fd.append('website', form.website.trim())
        if (form.companySize) fd.append('companySize', form.companySize)
        if (form.foundedYear) fd.append('foundedYear', String(form.foundedYear))
      }
      if (form.avatar) fd.append('avatar', form.avatar)

      const data = await signup(fd)
      const token = data?.token
      dispatch(setAuthData({ token, user: data?.user }))
      localStorage.setItem('profit_connect_token', token)
      if (data?.refreshToken) localStorage.setItem('profit_connect_refresh_token', data.refreshToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.signIn')
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  const stepAnim = direction === 'forward'
    ? { animation: 'slideInRight 0.35s ease both' }
    : { animation: 'slideInLeft 0.35s ease both' }

  return (
    <Box sx={{
        minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden',
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '@keyframes slideInRight': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes pulse': { '0%,100%': { transform: 'scale(1)', opacity: 0.15 }, '50%': { transform: 'scale(1.08)', opacity: 0.25 } },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`, top: -100, insetInlineStart: -100, animation: `${float1} 12s ease-in-out infinite` }} />
          <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${theme.palette.secondary.main}15 0%, transparent 70%)`, bottom: -80, insetInlineEnd: -80, animation: `${float2} 10s ease-in-out infinite` }} />
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: `radial-gradient(circle, ${theme.palette.primary.light}10 0%, transparent 70%)`, top: '40%', insetInlineEnd: '15%', animation: `${float1} 15s ease-in-out infinite reverse` }} />
        </Box>

        <IconButton onClick={toggleLang} aria-label={i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          sx={{
            position: 'fixed', top: 16, insetInlineEnd: 16, zIndex: 10,
            bgcolor: isDark ? 'background.paper' : 'white',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
            borderRadius: 2, px: 1.5, py: 0.5,
            transition: 'all 0.3s ease',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f0ecf6', transform: 'scale(1.05) rotate(-4deg)', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.12)' },
            animation: 'fadeUp 0.5s ease 0.2s both',
          }}
        >
          <Typography variant="caption" fontWeight="bold" sx={{ color: 'primary.main' }}>{i18n.language === 'en' ? 'AR' : 'EN'}</Typography>
        </IconButton>

        <Container maxWidth="xl" sx={{ minHeight: '100vh', py: { xs: 3, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: '90vh' }, minHeight: { md: '680px' }, width: '100%', maxWidth: '1320px',
            boxShadow: { xs: 'none', sm: '0 32px 80px rgba(12,8,24,0.18)' },
            borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden',
            bgcolor: isDark ? 'rgba(20,15,38,0.85)' : 'rgba(255,255,255,0.88)',
            border: '1px solid', borderColor: 'divider',
            backdropFilter: 'blur(20px)',
            mx: { xs: 0, md: 4, lg: 8 },
            animation: 'fadeUp 0.6s ease both',
          }}>
            <Box sx={{
              flex: { md: 1.1 }, position: 'relative',
              background: `linear-gradient(160deg, rgba(12,24,40,0.95) 0%, rgba(26,8,53,0.92) 42%, ${theme.palette.primary.main}bf 100%), url(/Images/login-photo.png)`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
              color: 'white', p: { md: 3.5, lg: 4.5 },
            }}>
              <Box>
                <Chip label={`✦ ${t('auth.joinChip')}`}
                  sx={{
                    mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.3,
                    animation: 'fadeUp 0.5s ease 0.1s both',
                  }}
                />
                <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    {t('auth.joinHeading')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                    {t('auth.joinSub')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeUp 0.5s ease 0.4s both' }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  transition: 'all 0.3s ease', '&:hover': { transform: 'rotate(90deg) scale(1.1)', borderColor: 'rgba(255,255,255,0.6)' },
                }}>
                  ✦
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, fontWeight: 400 ,color: '#fff'}}>{t('auth.joinTrusted')}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em',color: '#fff' }}>24k+ {t('auth.activeMembers')}</Typography>
                </Box>
              </Box>

              <Box sx={{
                position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%', animation: `${shimmer} 3s linear infinite`,
              }} />
            </Box>

            <Box sx={{
              flex: { md: 1 }, width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDark ? 'linear-gradient(180deg, #181230 0%, #0d0919 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8f6fc 100%)',
              p: { xs: 2.5, sm: 4, md: 2 }, overflowY: 'auto',
            }}>
              <Box sx={{ width: '100%', maxWidth: '520px', px: { xs: 0.5, sm: 2 }, py: 1, mx: 'auto', animation: 'fadeUp 0.5s ease 0.3s both' }}>

                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2.5, color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.2rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {t('auth.signUpTitle')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
                  {t('auth.signUpSub')}
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel
                  sx={{
                    mb: 3,
                    '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600, color: 'text.disabled', mt: 0.5, transition: 'color 0.3s' },
                    '& .Mui-active .MuiStepLabel-label': { color: 'primary.main' },
                    '& .Mui-completed .MuiStepLabel-label': { color: 'success.main' },
                    '& .MuiStepIcon-root': { fontSize: '1.6rem', transition: 'all 0.3s ease' },
                    '& .Mui-active .MuiStepIcon-root': { color: 'primary.main', filter: 'drop-shadow(0 2px 8px rgba(61,28,110,0.3))', animation: 'pulse 2s ease-in-out infinite' },
                    '& .Mui-completed .MuiStepIcon-root': { color: 'success.main' },
                  }}
                >
                  {steps.map((step, i) => (
                    <Step key={step.key} sx={{ '& .MuiStepLabel-iconContainer': { animation: `fadeUp 0.4s ease ${0.3 + i * 0.1}s both` } }}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Paper sx={{
                  p: { xs: 2.5, sm: 3.5 }, borderRadius: 1, bgcolor: isDark ? 'background.paper' : 'white',
                  border: '1px solid', borderColor: 'divider',
                  boxShadow: '0 4px 24px rgba(12,8,24,0.06)',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 32px rgba(12,8,24,0.1)' },
                }}>
                  <Box key={activeStep} sx={stepAnim}>
                    {steps[activeStep]?.key === 'personal' && <StepPersonalInfo form={form} onChange={handleChange} errors={errors} />}
                    {steps[activeStep]?.key === 'account' && <StepAccount form={form} onChange={handleChange} errors={errors} />}
                    {steps[activeStep]?.key === 'professional' && <StepProfessional form={form} onChange={handleChange} />}
                    {steps[activeStep]?.key === 'companyInfo' && <StepCompanyInfo form={form} onChange={handleChange} errors={errors} />}
                    {steps[activeStep]?.key === 'companyDetails' && <StepCompanyDetails form={form} onChange={handleChange} errors={errors} />}
                    {steps[activeStep]?.key === 'photo' && <StepAvatarReview form={form} setForm={setForm} />}
                  </Box>

                  {errors.submit && (
                      <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center', bgcolor: isDark ? 'rgba(248,113,113,0.12)' : '#FEE2E2', p: 1.5, borderRadius: 2, animation: 'fadeUp 0.3s ease' }}>
                      {errors.submit}
                    </Typography>
                  )}

                  {steps[activeStep]?.key === 'professional' && form.skills.length > 0 && (
                    <Box sx={{ mt: 2.5, animation: 'fadeUp 0.3s ease' }}>
                      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                        {t('auth.selectedSkills')} ({form.skills.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {form.skills.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="primary" variant="filled"
                            sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mt: 3.5 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack} variant="text"
                      sx={{
                        color: 'text.secondary', fontWeight: 600, px: 3, py: 1,
                        transition: 'all 0.25s ease',
                        '&:hover': { bgcolor: 'rgba(61,28,110,0.06)' },
                        '&:disabled': { opacity: 0.4 },
                      }}
                    >
                      {t('auth.back')}
                    </Button>
                    {activeStep < steps.length - 1 ? (
                      <Button variant="contained" onClick={handleNext}
                        sx={{
                          px: 4, py: 1, fontWeight: 600,
                          transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        {t('auth.next')}
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={handleSubmit} disabled={loading}
                        sx={{
                          px: 4, py: 1, fontWeight: 600, minWidth: 140, transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { opacity: 0.6 },
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('auth.createAccount')}
                      </Button>
                    )}
                  </Stack>
                </Paper>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                  {t('auth.hasAccount')}{' '}
                  <MuiLink component={Link} to="/sign-in" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t('auth.signInLink')}</MuiLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
  )
}
