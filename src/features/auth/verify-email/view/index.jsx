import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Chip, Typography, TextField, Stack, Container, CircularProgress,IconButton,
  Link as MuiLink, useTheme,
} from '@mui/material'
import Button from '@/ui/Button'
import { keyframes } from '@mui/material/styles'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { verifyEmail, resendVerification } from '@/services/authService'
const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`
const OTP_LENGTH = 6

export default function VerifyEmailView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!email) navigate('/sign-up')
  }, [email, navigate])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const handleVerify = async () => {
    if (code.length < OTP_LENGTH) {
      setError(t('auth.required'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyEmail(email, code)
      setSuccess(true)
      setTimeout(() => navigate('/sign-in'), 2500)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.verifyEmailError')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return
    setResendLoading(true)
    try {
      await resendVerification(email)
      setResendTimer(60)
      setCode('')
      setError('')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || t('auth.forgotError')
      setError(msg)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden',
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
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
              <Chip label={`✦ ${t('auth.verifyHeroChip')}`}
                sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', animation: 'fadeUp 0.5s ease 0.1s both' }}
              />
              <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15 }}>
                  {t('auth.verifyHeroTitle')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                  {t('auth.verifyHeroSub')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeUp 0.5s ease 0.4s both' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✦</Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, color: '#fff' }}>{t('auth.verifyHeroTrusted')}</Typography>
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

              <Box sx={{
                p: { xs: 2.5, sm: 3.5 }, borderRadius: 1, bgcolor: isDark ? 'background.paper' : 'white',
                border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 24px rgba(12,8,24,0.06)',
              }}>
                {success ? (
                  <Stack spacing={3} sx={{ alignItems: 'center', py: 2 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', animation: 'fadeUp 0.5s ease both' }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                      {t('auth.verifySuccess')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', animation: 'fadeUp 0.4s ease 0.2s both' }}>
                      {t('auth.verifySuccessRedirect')}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={3} sx={{ alignItems: 'center' }}>
                    <Box sx={{ animation: 'fadeUp 0.5s ease both' }}>
                      <Box sx={{
                        width: 80, height: 80, borderRadius: '50%', mx: 'auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${theme.palette.primary.main}12`, border: `2px solid ${theme.palette.primary.main}25`,
                      }}>
                        <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
                        {t('auth.verifyPageTitle')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('auth.verifyPageDesc')} <strong>{email}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: 320, animation: 'fadeUp 0.4s ease 0.15s both' }}>
                      <TextField
                        inputRef={inputRef}
                        fullWidth
                        value={code}
                        onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH); setCode(v); if (error) setError('') }}
                        inputProps={{
                          maxLength: OTP_LENGTH,
                          inputMode: 'numeric',
                          style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5em', direction: 'ltr' },
                        }}
                        placeholder="------"
                        error={!!error}
                        helperText={error || t('auth.verifyEmailHint')}
                      />
                    </Box>

                    <Box sx={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
                      {resendTimer > 0 ? (
                        <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>
                          {t('auth.forgotResendIn')} {resendTimer}s
                        </Typography>
                      ) : (
                        <MuiLink
                          component="button"
                          variant="body2"
                          onClick={handleResend}
                          disabled={resendLoading}
                          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, '&.Mui-disabled': { opacity: 0.5 } }}
                        >
                          {resendLoading ? t('auth.forgotResending') : t('auth.forgotResend')}
                        </MuiLink>
                      )}
                    </Box>

                    <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease 0.25s both' }}>
                      <Button fullWidth variant="contained" onClick={handleVerify} disabled={loading}
                        sx={{
                          py: 1.5, fontWeight: 600,
                          transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { opacity: 0.6 },
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('auth.verifyBtn')}
                      </Button>
                    </Box>
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
