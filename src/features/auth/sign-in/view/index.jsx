import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Chip, Typography, TextField, InputAdornment, IconButton, Stack, Container, CircularProgress,
  Link as MuiLink, useTheme,
} from '@mui/material'
import Button from '@/ui/Button'
import { keyframes } from '@mui/material/styles'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { login } from '@/services/authService'
import { setAuthData } from '@/redux/slices/userSlice'
import Logo from '@/components/common/Logo'

const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`

export default function SignInView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const errors = {}
    if (!formData.email.trim()) errors.email = t('auth.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('auth.invalidEmail')
    if (!formData.password) errors.password = t('auth.required')
    else if (formData.password.length < 6) errors.password = t('auth.minChars')
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setLoading(true)
    try {
      const data = await login(formData)
      const token = data?.token
      dispatch(setAuthData({ token, user: data?.user }))
      localStorage.setItem('profit_connect_token', token)
      if (data?.refreshToken) localStorage.setItem('profit_connect_refresh_token', data.refreshToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const userLang = data?.user?.settings?.language
      if (userLang && ['en', 'ar'].includes(userLang)) {
        i18n.changeLanguage(userLang)
      }
      navigate('/')
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.message || data?.error || data?.msg || err.message || t('auth.signIn')
      setError(msg)
    } finally {
      setLoading(false)
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
                <Chip label={`✦ ${t('auth.welcomeChip')}`}
                  sx={{
                    mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.3,
                    animation: 'fadeUp 0.5s ease 0.1s both',
                  }}
                />
                <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    {t('auth.welcomeHeading')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                    {t('auth.welcomeSub')}
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
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, fontWeight: 400, color: '#fff' }}>{t('auth.trustedBy')}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#fff' }}>24k+ {t('auth.activeMembers')}</Typography>
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
                  {t('auth.signInTitle')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
                  {t('auth.signInSub')}
                </Typography>

                <form noValidate onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
                      <TextField fullWidth label={t('auth.email')} type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData(prev => ({ ...prev, email: e.target.value })); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' })) }}
                        error={!!fieldErrors.email} helperText={fieldErrors.email}
                      />
                    </Box>
                    <Box sx={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
                      <TextField fullWidth label={t('auth.password')}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => { setFormData(prev => ({ ...prev, password: e.target.value })); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' })) }}
                        error={!!fieldErrors.password} helperText={fieldErrors.password}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(s => !s)} edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.4s ease 0.16s both' }}>
                      <MuiLink component={Link} to="/forgot-password" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', transition: 'opacity 0.2s', '&:hover': { textDecoration: 'underline' } }}
                        onMouseEnter={e => e.target.style.opacity = '0.7'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                      >
                        {t('auth.forgotPassword')}
                      </MuiLink>
                    </Box>

                    {error && (
                        <Typography color="error" variant="body2" role="alert" sx={{ textAlign: 'center', bgcolor: isDark ? 'rgba(248,113,113,0.12)' : '#FEE2E2', p: 1.5, borderRadius: 2, animation: 'fadeUp 0.3s ease' }}>
                        {error}
                      </Typography>
                    )}

                    <Box sx={{ animation: 'fadeUp 0.4s ease 0.24s both' }}>
                      <Button fullWidth variant="contained" type="submit" disabled={loading}
                        sx={{
                          py: 1.55, fontSize: '1rem', fontWeight: 600,
                          transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { opacity: 0.6 },
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('auth.signIn')}
                      </Button>
                    </Box>
                  </Stack>
                </form>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                  {t('auth.noAccount')}{' '}
                  <MuiLink component={Link} to="/sign-up" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t('auth.signUp')}</MuiLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
  )
}
