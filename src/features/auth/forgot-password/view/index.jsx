import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Chip, Typography, TextField, InputAdornment, IconButton, Stack, Container,
  CircularProgress, Link as MuiLink, useTheme, Stepper, Step, StepLabel,
} from '@mui/material'
import Button from '@/ui/Button'
import { keyframes } from '@mui/material/styles'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { forgotPassword, verifyResetCode, resetPassword } from '@/services/authService'

const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`
const OTP_LENGTH = 6

export default function ForgotPasswordView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const codeInputRef = useRef(null)

  useEffect(() => {
    if (activeStep === 1) codeInputRef.current?.focus()
  }, [activeStep])

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const handleResendCode = async () => {
    if (resendTimer > 0 || resendLoading) return
    setResendLoading(true)
    try {
      await forgotPassword(email.trim())
      setResendTimer(60)
      setCode('')
      setErrors((p) => ({ ...p, code: '' }))
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.forgotError')
      setErrors({ code: msg })
    } finally {
      setResendLoading(false)
    }
  }

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const stepKeys = ['email', 'code', 'newPassword']
  const steps = stepKeys.map((key) => ({ key, label: t(`auth.forgotStep${key.charAt(0).toUpperCase() + key.slice(1)}`) }))

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setCode(val)
    if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
  }

  const handleCodePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    setCode(pasted)
    if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
  }

  const validateStep = () => {
    const e = {}
    if (activeStep === 0) {
      if (!email.trim()) e.email = t('auth.required')
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('auth.invalidEmail')
    }
    if (activeStep === 1) {
      const fullCode = code
      if (fullCode.length < OTP_LENGTH) e.code = t('auth.required')
    }
    if (activeStep === 2) {
      if (!newPassword) e.newPassword = t('auth.required')
      else if (newPassword.length < 6) e.newPassword = t('auth.minChars')
      if (newPassword !== confirmPassword) e.confirmPassword = t('auth.passwordMismatch')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSendEmail = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setDirection('forward')
      setActiveStep(1)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.forgotError')
      setErrors({ email: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const data = await verifyResetCode(email.trim(), code)
      const token = data?.resetToken
      if (token) {
        localStorage.setItem('profit_connect_reset_token', token)
        setResetToken(token)
      }
      setDirection('forward')
      setActiveStep(2)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.forgotCodeError')
      setErrors({ code: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const token = resetToken || localStorage.getItem('profit_connect_reset_token')
      await resetPassword(token, newPassword)
      localStorage.removeItem('profit_connect_reset_token')
      setSuccess(true)
      setTimeout(() => navigate('/sign-in'), 2500)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.forgotResetError')
      setErrors({ newPassword: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleStepAction = () => {
    if (activeStep === 0) return handleSendEmail()
    if (activeStep === 1) return handleVerifyCode()
    if (activeStep === 2) return handleResetPassword()
  }

  const stepAnim = direction === 'forward'
    ? { animation: 'slideInRight 0.35s ease both' }
    : { animation: 'slideInLeft 0.35s ease both' }

  const renderStepContent = () => {
    if (success) {
      return (
        <Stack spacing={3} sx={{ alignItems: 'center', py: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', animation: 'fadeUp 0.5s ease both' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            {t('auth.forgotSuccess')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            {t('auth.forgotSuccessRedirect')}
          </Typography>
        </Stack>
      )
    }

    if (activeStep === 0) {
      return (
        <Stack spacing={2.5}>
          <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${theme.palette.primary.main}12`, border: `2px solid ${theme.palette.primary.main}25`,
            }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('auth.forgotTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('auth.forgotDesc')}
            </Typography>
          </Box>
          <Box sx={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <TextField fullWidth label={t('auth.email')} type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })) }}
              error={!!errors.email} helperText={errors.email}
            />
          </Box>
          {errors.email && !errors.email.includes('@') && (
            <Typography color="error" variant="body2" sx={{ textAlign: 'center', bgcolor: isDark ? 'rgba(248,113,113,0.12)' : '#FEE2E2', p: 1.5, borderRadius: 2, animation: 'fadeUp 0.3s ease' }}>
              {errors.email}
            </Typography>
          )}
        </Stack>
      )
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${theme.palette.primary.main}12`, border: `2px solid ${theme.palette.primary.main}25`,
            }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('auth.forgotCodeTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('auth.forgotCodeDesc')} <strong>{email}</strong>
            </Typography>
          </Box>
          <Box sx={{ width: '100%', maxWidth: 320, animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <TextField
              inputRef={codeInputRef}
              fullWidth
              value={code}
              onChange={handleCodeChange}
              onPaste={handleCodePaste}
              inputProps={{
                maxLength: OTP_LENGTH,
                inputMode: 'numeric',
                style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5em', direction: 'ltr' },
              }}
              placeholder="------"
              error={!!errors.code}
              helperText={errors.code || t('auth.verifyEmailHint')}
            />
          </Box>
          {errors.code && (
            <Typography color="error" variant="body2" sx={{ animation: 'fadeUp 0.3s ease' }}>{errors.code}</Typography>
          )}
          <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.4s ease 0.25s both' }}>
            {resendTimer > 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                {t('auth.forgotResendIn')} {resendTimer}s
              </Typography>
            ) : (
              <MuiLink
                component="button"
                variant="body2"
                onClick={handleResendCode}
                disabled={resendLoading}
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, '&.Mui-disabled': { opacity: 0.5 } }}
              >
                {resendLoading ? t('auth.forgotResending') : t('auth.forgotResend')}
              </MuiLink>
            )}
          </Box>
        </Stack>
      )
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={2.5}>
          <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${theme.palette.primary.main}12`, border: `2px solid ${theme.palette.primary.main}25`,
            }}>
              <LockResetOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('auth.forgotNewTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('auth.forgotNewDesc')}
            </Typography>
          </Box>
          <Box sx={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <TextField fullWidth label={t('auth.newPassword')} type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' })) }}
              error={!!errors.newPassword} helperText={errors.newPassword || t('auth.passwordHelper')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <Box sx={{ animation: 'fadeUp 0.4s ease 0.18s both' }}>
            <TextField fullWidth label={t('auth.confirmPassword')} type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })) }}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
            />
          </Box>
        </Stack>
      )
    }
  }

  return (
    <Box sx={{
        minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden',
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '@keyframes slideInRight': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      }}>
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`, top: -100, insetInlineStart: -100, animation: `${float1} 12s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${theme.palette.secondary.main}15 0%, transparent 70%)`, bottom: -80, insetInlineEnd: -80, animation: `${float2} 10s ease-in-out infinite` }} />
      </Box>

      <IconButton onClick={toggleLang}
        sx={{
          position: 'fixed', top: 16, insetInlineEnd: 16, zIndex: 10,
          bgcolor: isDark ? 'background.paper' : 'white',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 2, px: 1.5, py: 0.5, transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.05) rotate(-4deg)' },
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
          border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(20px)',
          mx: { xs: 0, md: 4, lg: 8 }, animation: 'fadeUp 0.6s ease both',
        }}>
          <Box sx={{
            flex: { md: 1.1 }, position: 'relative',
            background: `linear-gradient(160deg, rgba(12,24,40,0.95) 0%, rgba(26,8,53,0.92) 42%, ${theme.palette.primary.main}bf 100%), url(/Images/login-photo.png)`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
            color: 'white', p: { md: 3.5, lg: 4.5 },
          }}>
            <Box>
              <Chip label={`✦ ${t('auth.forgotHeroChip')}`}
                sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', animation: 'fadeUp 0.5s ease 0.1s both' }}
              />
              <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15 }}>
                  {t('auth.forgotHeroTitle')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                  {t('auth.forgotHeroSub')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeUp 0.5s ease 0.4s both' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✦</Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, color: '#fff' }}>{t('auth.forgotHeroTrusted')}</Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>24k+ {t('auth.activeMembers')}</Typography>
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%', animation: `${shimmer} 3s linear infinite` }} />
          </Box>

          <Box sx={{
            flex: { md: 1 }, width: { xs: '100%', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? 'linear-gradient(180deg, #181230 0%, #0d0919 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8f6fc 100%)',
            p: { xs: 2.5, sm: 4, md: 2 }, overflowY: 'auto',
          }}>
            <Box sx={{ width: '100%', maxWidth: '520px', px: { xs: 0.5, sm: 2 }, py: 1, mx: 'auto', animation: 'fadeUp 0.5s ease 0.3s both' }}>

              {!success && (
                <>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 2.5, color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.2rem' }, lineHeight: 1.15 }}>
                    {t('auth.forgotPageTitle')}
                  </Typography>
                  <Stepper activeStep={activeStep} alternativeLabel
                    sx={{
                      my: 3,
                      '& .MuiStepLabel-label': { fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', mt: 0.5, transition: 'color 0.3s' },
                      '& .Mui-active .MuiStepLabel-label': { color: 'primary.main' },
                      '& .Mui-completed .MuiStepLabel-label': { color: 'success.main' },
                      '& .MuiStepIcon-root': { fontSize: '1.5rem', transition: 'all 0.3s ease' },
                      '& .Mui-active .MuiStepIcon-root': { color: 'primary.main', filter: 'drop-shadow(0 2px 8px rgba(61,28,110,0.3))' },
                      '& .Mui-completed .MuiStepIcon-root': { color: 'success.main' },
                    }}
                  >
                    {steps.map((step, i) => (
                      <Step key={step.key}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </>
              )}

              <Box sx={{
                p: { xs: 2.5, sm: 3.5 }, borderRadius: 1, bgcolor: isDark ? 'background.paper' : 'white',
                border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 24px rgba(12,8,24,0.06)',
              }}>
                <Box key={activeStep + (success ? 'done' : '')} sx={success ? { animation: 'fadeUp 0.5s ease both' } : stepAnim}>
                  {renderStepContent()}
                </Box>

                {!success && (
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mt: 3.5 }}>
                    <Button disabled={activeStep === 0} onClick={() => { setDirection('backward'); setActiveStep((s) => s - 1) }} variant="text"
                      sx={{ color: 'text.secondary', fontWeight: 600, px: 3, py: 1, '&:disabled': { opacity: 0.4 } }}
                    >
                      {t('auth.back')}
                    </Button>
                    <Button variant="contained" onClick={handleStepAction} disabled={loading}
                      sx={{
                        px: 4, py: 1, fontWeight: 600, minWidth: 140,
                        transition: 'all 0.25s ease',
                        '&:hover': { transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                        '&:active': { transform: 'scale(0.98)' },
                        '&:disabled': { opacity: 0.6 },
                      }}
                    >
                      {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (
                        activeStep === 2 ? t('auth.forgotResetBtn') : t('auth.next')
                      )}
                    </Button>
                  </Stack>
                )}
              </Box>

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
