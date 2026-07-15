import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import {
  Container, Box, Typography, Stack, Chip, Stepper, Step, StepLabel, Paper, CircularProgress, IconButton,
} from '@mui/material'
import Button from '@/ui/Button'
import { ThemeProvider, createTheme, keyframes } from '@mui/material/styles'
import { signup } from '@/services/authService'
import { setAuthData } from '@/redux/slices/userSlice'
import Logo from '@/components/common/Logo'
import StepPersonalInfo from '../components/StepPersonalInfo'
import StepAccount from '../components/StepAccount'
import StepProfessional from '../components/StepProfessional'
import StepAvatarReview from '../components/StepAvatarReview'
import StepCompanyInfo from '../components/StepCompanyInfo'
import StepCompanyDetails from '../components/StepCompanyDetails'

const STEPS_BY_ROLE = {
  Employer: [
    { key: 'personal', en: 'Personal Info', ar: 'المعلومات الشخصية' },
    { key: 'account', en: 'Account', ar: 'الحساب' },
    { key: 'companyInfo', en: 'Company Info', ar: 'معلومات الشركة' },
    { key: 'companyDetails', en: 'Company Details', ar: 'تفاصيل الشركة' },
    { key: 'photo', en: 'Photo', ar: 'الصورة' },
  ],
  default: [
    { key: 'personal', en: 'Personal Info', ar: 'المعلومات الشخصية' },
    { key: 'account', en: 'Account', ar: 'الحساب' },
    { key: 'professional', en: 'Professional', ar: 'المعلومات المهنية' },
    { key: 'photo', en: 'Photo', ar: 'الصورة' },
  ],
}

const lightTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: { main: '#3D1C6E', light: '#5C3594', dark: '#2D1055' },
    secondary: { main: '#1F3670' },
    background: { default: '#F6F4FA', paper: '#FFFFFF' },
    text: { primary: '#1F0A3B', secondary: '#5C5580' },
    divider: 'rgba(31, 10, 59, 0.08)',
    success: { main: '#16A34A' },
    error: { main: '#DC2626' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
})

const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`

export default function SignUpView() {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [lang, setLang] = useState('en')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    password: '', role: 'JobSeeker',
    industry: '', yearsOfExperience: '', skills: [],
    companyName: '', companyDescription: '', companyIndustry: '', companyLocation: '',
    website: '', companySize: '', foundedYear: '',
    avatar: null,
  })

  const isEmployer = form.role === 'Employer'
  const stepsConfig = isEmployer ? STEPS_BY_ROLE.Employer : STEPS_BY_ROLE.default
  const steps = stepsConfig

  useEffect(() => {
    i18n.changeLanguage('en')
    document.documentElement.dir = 'ltr'
  }, [])

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
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
      if (!form.firstName.trim()) e.firstName = 'Required'
      if (!form.lastName.trim()) e.lastName = 'Required'
      if (!form.email.trim()) e.email = 'Required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    }
    if (stepKey === 'account') {
      if (!form.password) e.password = 'Required'
      else if (form.password.length < 6) e.password = 'At least 6 characters'
    }
    if (stepKey === 'companyInfo') {
      if (!form.companyName.trim()) e.companyName = lang === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required'
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Something went wrong'
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  const stepAnim = direction === 'forward'
    ? { animation: 'slideInRight 0.35s ease both' }
    : { animation: 'slideInLeft 0.35s ease both' }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{
        minHeight: '100vh', bgcolor: '#F6F4FA', position: 'relative', overflow: 'hidden',
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '@keyframes slideInRight': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes pulse': { '0%,100%': { transform: 'scale(1)', opacity: 0.15 }, '50%': { transform: 'scale(1.08)', opacity: 0.25 } },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #3D1C6E15 0%, transparent 70%)', top: -100, left: -100, animation: `${float1} 12s ease-in-out infinite` }} />
          <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #1F367015 0%, transparent 70%)', bottom: -80, right: -80, animation: `${float2} 10s ease-in-out infinite` }} />
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, #5C359410 0%, transparent 70%)', top: '40%', right: '15%', animation: `${float1} 15s ease-in-out infinite reverse` }} />
        </Box>

        <IconButton onClick={toggleLang}
          sx={{
            position: 'fixed', top: 16, right: 16, zIndex: 10, bgcolor: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, px: 1.5, py: 0.5,
            transition: 'all 0.3s ease',
            '&:hover': { bgcolor: '#f0ecf6', transform: 'scale(1.05) rotate(-4deg)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
            animation: 'fadeUp 0.5s ease 0.2s both',
          }}
        >
          <Typography variant="caption" fontWeight="bold" sx={{ color: '#3D1C6E' }}>{lang === 'en' ? 'AR' : 'EN'}</Typography>
        </IconButton>

        <Container maxWidth="xl" sx={{ minHeight: '100vh', py: { xs: 3, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: '90vh' }, minHeight: { md: '680px' }, width: '100%', maxWidth: '1320px',
            boxShadow: { xs: 'none', sm: '0 32px 80px rgba(12,8,24,0.18)' },
            borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(31, 13, 66, 0.1)',
            backdropFilter: 'blur(20px)',
            mx: { xs: 0, md: 4, lg: 8 },
            animation: 'fadeUp 0.6s ease both',
          }}>
            <Box sx={{
              flex: { md: 1.1 }, position: 'relative',
              background: 'linear-gradient(160deg, rgba(12,24,40,0.95) 0%, rgba(26,8,53,0.92) 42%, rgba(61,28,110,0.75) 100%), url(/Images/login-photo.png)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
              color: 'white', p: { md: 3.5, lg: 4.5 },
            }}>
              <Box>
                <Chip label={lang === 'en' ? '✦ Join Premium Network' : '✦ انضم للشبكة المتميزة'}
                  sx={{
                    mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.3,
                    animation: 'fadeUp 0.5s ease 0.1s both',
                  }}
                />
                <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    {lang === 'en' ? 'Start your premium journey.' : 'ابدأ رحلتك المتميزة.'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                    {lang === 'en' ? 'Create an account and unlock tailored opportunities, trusted connections, and a profile built for success.' : 'أنشئ حسابك وافتح فرصاً مصممة خصيصاً لك، واتصالات موثوقة، وملفاً شخصياً مبنيًا للنجاح.'}
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
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, fontWeight: 400 }}>{lang === 'en' ? 'Join thousands of ambitious professionals' : 'انضم لآلاف المحترفين الطموحين'}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>24k+ {lang === 'en' ? 'active members' : 'عضو نشط'}</Typography>
                </Box>
              </Box>

              <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%', animation: `${shimmer} 3s linear infinite`,
              }} />
            </Box>

            <Box sx={{
              flex: { md: 1 }, width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f6fc 100%)',
              p: { xs: 2.5, sm: 4, md: 2 }, overflowY: 'auto',
            }}>
              <Box sx={{ width: '100%', maxWidth: '520px', px: { xs: 0.5, sm: 2 }, py: 1, mx: 'auto', animation: 'fadeUp 0.5s ease 0.3s both' }}>
              
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2.5, color: '#1F0A3B', fontSize: { xs: '1.8rem', sm: '2.2rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {lang === 'en' ? 'Create account' : 'إنشاء حساب'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5C5580', mt: 0.5, mb: 2.5 }}>
                  {lang === 'en' ? 'Fill in your details to get started' : 'املأ بياناتك للبدء'}
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel
                  sx={{
                    mb: 3,
                    '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600, color: '#B5AECB', mt: 0.5, transition: 'color 0.3s' },
                    '& .Mui-active .MuiStepLabel-label': { color: '#3D1C6E' },
                    '& .Mui-completed .MuiStepLabel-label': { color: '#16A34A' },
                    '& .MuiStepIcon-root': { fontSize: '1.6rem', transition: 'all 0.3s ease' },
                    '& .Mui-active .MuiStepIcon-root': { color: '#3D1C6E', filter: 'drop-shadow(0 2px 8px rgba(61,28,110,0.3))', animation: 'pulse 2s ease-in-out infinite' },
                    '& .Mui-completed .MuiStepIcon-root': { color: '#16A34A' },
                  }}
                >
                  {steps.map((step, i) => (
                    <Step key={step.key} sx={{ '& .MuiStepLabel-iconContainer': { animation: `fadeUp 0.4s ease ${0.3 + i * 0.1}s both` } }}>
                      <StepLabel>{step[lang]}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Paper sx={{
                  p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, bgcolor: 'white',
                  border: '1px solid rgba(31, 13, 66, 0.06)',
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
                    <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center', bgcolor: '#FEE2E2', p: 1.5, borderRadius: 2, animation: 'fadeUp 0.3s ease' }}>
                      {errors.submit}
                    </Typography>
                  )}

                  {steps[activeStep]?.key === 'professional' && form.skills.length > 0 && (
                    <Box sx={{ mt: 2.5, animation: 'fadeUp 0.3s ease' }}>
                      <Typography variant="caption" fontWeight={600} sx={{ color: '#5C5580', mb: 0.5, display: 'block' }}>
                        {lang === 'en' ? `Selected skills (${form.skills.length})` : `المهارات المحددة (${form.skills.length})`}
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
                        color: '#5C5580', fontWeight: 600, px: 3, py: 1,
                        transition: 'all 0.25s ease',
                        '&:hover': { bgcolor: 'rgba(61,28,110,0.06)', transform: 'translateX(-2px)' },
                        '&:disabled': { opacity: 0.4 },
                      }}
                    >
                      {lang === 'en' ? 'Back' : 'رجوع'}
                    </Button>
                    {activeStep < steps.length - 1 ? (
                      <Button variant="contained" onClick={handleNext}
                        sx={{
                          px: 4, py: 1, fontWeight: 600, bgcolor: '#3D1C6E',
                          transition: 'all 0.25s ease',
                          '&:hover': { bgcolor: '#2D1055', transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        {lang === 'en' ? 'Next' : 'التالي'}
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={handleSubmit} disabled={loading}
                        sx={{
                          px: 4, py: 1, fontWeight: 600, bgcolor: '#3D1C6E', minWidth: 140, transition: 'all 0.25s ease',
                          '&:hover': { bgcolor: '#2D1055', transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { bgcolor: '#B5AECB' },
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (lang === 'en' ? 'Create Account' : 'إنشاء حساب')}
                      </Button>
                    )}
                  </Stack>
                </Paper>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: '#5C5580', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                  {lang === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟'}{' '}
                  <Link to="/sign-in" style={{ color: '#3D1C6E', fontWeight: 700, textDecoration: 'none' }}>{lang === 'en' ? 'Sign in' : 'تسجيل الدخول'}</Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
