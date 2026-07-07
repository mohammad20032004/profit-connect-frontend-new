import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Chip, Typography, TextField, Button, InputAdornment, IconButton, Stack, Container, CircularProgress,
} from '@mui/material'
import { ThemeProvider, createTheme, keyframes } from '@mui/material/styles'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { login } from '@/services/authService'
import { setAuthData } from '@/redux/slices/userSlice'
import Logo from '@/components/common/Logo'

const lightTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: { main: '#3D1C6E', light: '#5C3594', dark: '#2D1055' },
    secondary: { main: '#1F3670' },
    background: { default: '#F6F4FA', paper: '#FFFFFF' },
    text: { primary: '#1F0A3B', secondary: '#5C5580' },
    divider: 'rgba(31, 10, 59, 0.08)',
    error: { main: '#DC2626' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
})

const float1 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}`
const float2 = keyframes`0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,25px) scale(1.08)}66%{transform:translate(20px,-15px) scale(0.92)}`
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function SignInView() {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useState('en')
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    document.documentElement.dir = 'ltr'
  }, [])

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!formData.email.trim() || !formData.password) {
      setError(lang === 'en' ? 'Please fill in all fields' : 'يرجى ملء جميع الحقول')
      return
    }
    setLoading(true)
    try {
      const data = await login(formData)
      const token = data?.token
      dispatch(setAuthData({ token, user: data?.user }))
      localStorage.setItem('profit_connect_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const userLang = data?.user?.settings?.language
      if (userLang && ['en', 'ar'].includes(userLang)) {
        i18n.changeLanguage(userLang)
      }
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || (lang === 'en' ? 'Something went wrong' : 'حدث خطأ')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{
        minHeight: '100vh', bgcolor: '#F6F4FA', position: 'relative', overflow: 'hidden',
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
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
                <Chip label={lang === 'en' ? '✦ Premium Career Experience' : '✦ تجربة مهنية متميزة'}
                  sx={{
                    mb: 4, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.3,
                    animation: 'fadeUp 0.5s ease 0.1s both',
                  }}
                />
                <Box sx={{ maxWidth: 500, py: { md: 1, lg: 5 }, animation: 'fadeUp 0.5s ease 0.2s both' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.2rem', lg: '3rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    {lang === 'en' ? 'Welcome back to a sharper way to grow your network.' : 'مرحباً بعودتك إلى طريقة أكثر ذكاءً لتنمية شبكتك.'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, fontSize: { md: '0.95rem', lg: '1.05rem' }, maxWidth: 440, lineHeight: 1.7 }}>
                    {lang === 'en' ? 'Access tailored opportunities, trusted connections, and a profile experience designed to make your next move feel effortless.' : 'استفد من الفرص المصممة خصيصاً، والاتصالات الموثوقة، وتجربة ملف شخصي تجعل خطوتك التالية سهلة.'}
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
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.7, fontWeight: 400 }}>{lang === 'en' ? 'Trusted by ambitious professionals' : 'موثوق من المحترفين الطموحين'}</Typography>
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
                  {lang === 'en' ? 'Sign in to continue' : 'تسجيل الدخول للمتابعة'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5C5580', mt: 0.5, mb: 2.5 }}>
                  {lang === 'en' ? 'Welcome back! Enter your credentials to access your account' : 'مرحباً بعودتك! أدخل بياناتك للوصول إلى حسابك'}
                </Typography>

                <form noValidate onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
                      <TextField fullWidth label={lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'} type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        sx={fieldSx}
                      />
                    </Box>
                    <Box sx={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
                      <TextField fullWidth label={lang === 'en' ? 'Password' : 'كلمة المرور'}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        sx={fieldSx}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(s => !s)} edge="end" sx={{ color: '#5C5580' }}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.4s ease 0.16s both' }}>
                      <Link to="#" style={{ color: '#3D1C6E', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.target.style.opacity = '0.7'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                      >
                        {lang === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
                      </Link>
                    </Box>

                    {error && (
                      <Typography color="error" variant="body2" sx={{ textAlign: 'center', bgcolor: '#FEE2E2', p: 1.5, borderRadius: 2, animation: 'fadeUp 0.3s ease' }}>
                        {error}
                      </Typography>
                    )}

                    <Box sx={{ animation: 'fadeUp 0.4s ease 0.24s both' }}>
                      <Button fullWidth variant="contained" type="submit" disabled={loading}
                        sx={{
                          py: 1.55, fontSize: '1rem', fontWeight: 600, borderRadius: 999, bgcolor: '#3D1C6E',
                          textTransform: 'none', transition: 'all 0.25s ease',
                          '&:hover': { bgcolor: '#2D1055', transform: 'translateY(-1px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { bgcolor: '#B5AECB' },
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (lang === 'en' ? 'Sign In' : 'تسجيل الدخول')}
                      </Button>
                    </Box>
                  </Stack>
                </form>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: '#5C5580', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                  {lang === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟'}{' '}
                  <Link to="/sign-up" style={{ color: '#3D1C6E', fontWeight: 700, textDecoration: 'none' }}>{lang === 'en' ? 'Sign up' : 'إنشاء حساب'}</Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
