import { Box, Container, Stack, Typography, Card, IconButton } from '@mui/material'
import Button from '@/ui/Button'
import { keyframes } from '@mui/system'
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined'
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined'
import BusinessCenterOutlined from '@mui/icons-material/BusinessCenterOutlined'
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined'
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined'
import RocketLaunchOutlined from '@mui/icons-material/RocketLaunchOutlined'
import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { alpha, useTheme } from '@mui/material/styles'

const palette = {
  ink: '#0a0715',
  deep: '#12082a',
  plum: '#1f0d42',
  berry: '#3d1c6e',
  navy: '#0c1828',
  navyMid: '#1a2d4a',
  sand: '#f4f2f8',
  line: 'rgba(31, 13, 66, 0.12)',
}

const subtleMove = keyframes`
  0% { transform: rotate(15deg) translate3d(0, 0, 0) scale(1); opacity: 0.18; }
  50% { transform: rotate(19deg) translate3d(-18px, -28px, 0) scale(1.08); opacity: 0.34; }
  100% { transform: rotate(15deg) translate3d(0, 0, 0) scale(1); opacity: 0.18; }
`

const floatCard = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -10px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`

const pulseGlow = keyframes`
  0% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
  100% { opacity: 0.35; transform: scale(1); }
`

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

function HeroSection() {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
        py: { xs: 12, md: 0 },
        background: 'linear-gradient(135deg, #f8f6fc 0%, #eeeaf8 58%, #e4e6f0 100%)',
      }}
    >
      <Container maxWidth="xl" sx={{ zIndex: 10, position: 'relative' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)' },
            gap: { xs: 6, lg: 5 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={3} sx={{ alignItems: { xs: 'center', lg: 'flex-start' }, textAlign: { xs: 'center', lg: 'start' } }}>
            <Card
              elevation={0}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                bgcolor: 'rgba(255,255,255,0.84)', color: palette.plum,
                border: `1px solid ${palette.line}`, fontWeight: 700,
                backdropFilter: 'blur(12px)', px: 2, py: 0.8,
                boxShadow: '0 16px 34px rgba(36, 16, 66, 0.06)', borderRadius: 20, fontSize: '0.85rem',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
              {t('landing.chip')}
            </Card>

            <Typography variant="h1" sx={{ fontWeight: 900, color: palette.deep, fontSize: { xs: '2.5rem', md: '3.8rem', lg: '4.2rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: 700 }}>
              {t('landing.heading')}{' '}
              <Box component="span" sx={{ color: palette.berry }}>{t('landing.headingHighlight')}</Box>
            </Typography>

            <Typography variant="h5" sx={{ color: '#5c5671', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 400, maxWidth: 600 }}>
              {t('landing.subheading')}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Button component={Link} to="/sign-up" variant="contained" size="large" sx={{ fontWeight: 700, px: 5, py: 1.4, background: `linear-gradient(135deg, ${palette.deep} 0%, ${palette.plum} 55%, ${palette.berry} 140%)`, boxShadow: '0px 10px 28px rgba(18,8,42,0.3)', fontSize: '1.05rem', borderRadius: 2, '&:hover': { boxShadow: '0px 14px 36px rgba(18,8,42,0.4)', transform: 'translateY(-2px)' } }}>
                {t('landing.cta')}
              </Button>
              <Button component={Link} to="/sign-in" variant="outlined" size="large" sx={{ fontWeight: 700, px: 4, py: 1.4, color: palette.navy, borderColor: 'rgba(12,24,40,0.2)', bgcolor: 'rgba(255,255,255,0.72)', fontSize: '1.05rem', borderRadius: 2 }}>
                {t('landing.signIn')}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 2 }}>
              {[
                { value: '10K+', label: t('landing.stat1') },
                { value: '500+', label: t('landing.stat2') },
                { value: '4.9', label: t('landing.stat3') },
              ].map((item) => (
                <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: palette.berry }}>{item.value}</Typography>
                  <Typography sx={{ color: '#6d6882', fontSize: '0.88rem' }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Box sx={{ position: 'relative', minHeight: { xs: 400, lg: 580 }, display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ position: 'absolute', inset: '3% 0 6% 2%', borderRadius: 3, background: `linear-gradient(160deg, ${palette.navy} 0%, rgba(26,8,53,0.96) 52%, rgba(61,28,110,0.92) 100%)`, boxShadow: '0 40px 80px rgba(36, 16, 66, 0.22)', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.26), rgba(255,255,255,0) 34%)' }} />
            </Box>

            <Card elevation={0} sx={{ position: 'relative', width: '86%', borderRadius: 3, p: 2.5, bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.55)', boxShadow: '0 24px 70px rgba(18, 15, 31, 0.22)' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f87171' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34d399' }} />
              </Stack>

              <Box sx={{ borderRadius: 2, bgcolor: '#f7f8fc', border: `1px solid ${palette.line}`, p: 2.5 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: palette.deep, mb: 2 }}>{t('landing.previewTitle')}</Typography>
                <Stack spacing={1.5}>
                  {[
                    { icon: <WorkOutlineOutlined sx={{ fontSize: 18, color: palette.berry }} />, text: t('landing.preview1'), badge: '+5' },
                    { icon: <AccountTreeOutlined sx={{ fontSize: 18, color: '#22c55e' }} />, text: t('landing.preview2'), badge: '+3' },
                    { icon: <PeopleOutlineOutlined sx={{ fontSize: 18, color: '#3b82f6' }} />, text: t('landing.preview3'), badge: '+12' },
                    { icon: <PaymentsOutlined sx={{ fontSize: 18, color: '#f59e0b' }} />, text: t('landing.preview4'), badge: '⚡' },
                  ].map((item, i) => (
                    <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.25, borderRadius: 1.5, bgcolor: '#ffffff', border: '1px solid rgba(31,13,66,0.06)', animation: `${floatCard} ${4 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(palette.berry, 0.08), flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#4b4561' }}>{item.text}</Typography>
                      <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: alpha(palette.berry, 0.08), color: palette.berry, fontSize: '0.7rem', fontWeight: 800 }}>{item.badge}</Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Card>

            <Box sx={{ position: 'absolute', insetInlineEnd: -10, top: 50, width: 150, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.line}`, backdropFilter: 'blur(16px)', textAlign: 'start', animation: `${floatCard} 5.2s ease-in-out infinite` }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.3 }}>{t('landing.floatingLabel')}</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: palette.plum }}>94%</Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box sx={{ position: 'absolute', zIndex: 1, width: { xs: '80%', md: '50%' }, height: '75%', bgcolor: palette.plum, borderRadius: '80px', top: { xs: '-10%', md: '-15%' }, insetInlineEnd: { xs: '-20%', md: '-10%' }, transform: 'rotate(15deg)', opacity: 0.4, filter: 'blur(80px)', animation: `${subtleMove} 12s ease-in-out infinite` }} />
      <Box sx={{ position: 'absolute', zIndex: 1, width: { xs: '60%', md: '40%' }, height: '75%', bgcolor: palette.navy, borderRadius: '80px', bottom: { xs: '-10%', md: '-15%' }, insetInlineStart: { xs: '-20%', md: '-10%' }, transform: 'rotate(15deg)', opacity: 0.42, filter: 'blur(82px)', animation: `${subtleMove} 14s ease-in-out infinite reverse` }} />
      <Box sx={{ position: 'absolute', inset: 'auto', width: { xs: 180, md: 260 }, height: { xs: 180, md: 260 }, borderRadius: '50%', insetInlineEnd: { xs: '10%', md: '18%' }, bottom: { xs: '12%', md: '18%' }, background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)', animation: `${pulseGlow} 6s ease-in-out infinite`, pointerEvents: 'none' }} />
    </Box>
  )
}

function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    { icon: <WorkOutlineOutlined sx={{ fontSize: 36 }} />, title: t('landing.f1Title'), desc: t('landing.f1Desc'), color: '#3b82f6' },
    { icon: <AccountTreeOutlined sx={{ fontSize: 36 }} />, title: t('landing.f2Title'), desc: t('landing.f2Desc'), color: '#22c55e' },
    { icon: <BusinessCenterOutlined sx={{ fontSize: 36 }} />, title: t('landing.f3Title'), desc: t('landing.f3Desc'), color: '#8b5cf6' },
    { icon: <PeopleOutlineOutlined sx={{ fontSize: 36 }} />, title: t('landing.f4Title'), desc: t('landing.f4Desc'), color: '#3b82f6' },
    { icon: <PaymentsOutlined sx={{ fontSize: 36 }} />, title: t('landing.f5Title'), desc: t('landing.f5Desc'), color: '#f59e0b' },
    { icon: <TrendingUpOutlined sx={{ fontSize: 36 }} />, title: t('landing.f6Title'), desc: t('landing.f6Desc'), color: '#ec4899' },
  ]

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 9 }, maxWidth: 700, mx: 'auto' }}>
          <Typography sx={{ color: palette.berry, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
            {t('landing.whyUs')}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: palette.deep, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2 }}>
            {t('landing.featuresHeading')}
          </Typography>
          <Typography sx={{ mt: 2, color: '#655f78', lineHeight: 1.8, fontSize: '1.05rem' }}>
            {t('landing.featuresSub')}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {features.map((f, i) => (
            <Card
              key={i}
              elevation={0}
              sx={{
                p: 4, borderRadius: 2, border: '1px solid rgba(36,0,70,0.06)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                transition: 'all 0.3s ease', animation: `${fadeInUp} 0.5s ease-out ${i * 0.08}s both`,
                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 40px rgba(36,0,70,0.08)', borderColor: alpha(f.color, 0.3) },
              }}
            >
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(f.color, 0.1), color: f.color, mb: 3 }}>
                {f.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: palette.deep, mb: 1.5, fontSize: '1.1rem' }}>{f.title}</Typography>
              <Typography sx={{ color: '#5b556f', fontSize: '0.95rem', lineHeight: 1.7 }}>{f.desc}</Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

function HowItWorksSection() {
  const { t } = useTranslation()

  const steps = [
    { num: '01', icon: <RocketLaunchOutlined sx={{ fontSize: 32 }} />, title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { num: '02', icon: <WorkOutlineOutlined sx={{ fontSize: 32 }} />, title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { num: '03', icon: <HandshakeOutlined sx={{ fontSize: 32 }} />, title: t('landing.step3Title'), desc: t('landing.step3Desc') },
    { num: '04', icon: <PaymentsOutlined sx={{ fontSize: 32 }} />, title: t('landing.step4Title'), desc: t('landing.step4Desc') },
  ]

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.sand }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 9 }, maxWidth: 650, mx: 'auto' }}>
          <Typography sx={{ color: palette.berry, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
            {t('landing.howItWorks')}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: palette.deep, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2 }}>
            {t('landing.stepsHeading')}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, position: 'relative' }}>
          {steps.map((s, i) => (
            <Card
              key={i}
              elevation={0}
              sx={{
                p: 3.5, borderRadius: 2, textAlign: 'center', position: 'relative',
                border: '1px solid rgba(36,0,70,0.06)', bgcolor: '#ffffff',
                transition: 'all 0.3s ease', animation: `${fadeInUp} 0.5s ease-out ${i * 0.1}s both`,
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(36,0,70,0.08)' },
              }}
            >
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: alpha(palette.berry, 0.1), mb: 1 }}>{s.num}</Typography>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(palette.berry, 0.08), color: palette.berry, mx: 'auto', mb: 2.5 }}>
                {s.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: palette.deep, mb: 1, fontSize: '1.05rem' }}>{s.title}</Typography>
              <Typography sx={{ color: '#6d6882', fontSize: '0.9rem', lineHeight: 1.7 }}>{s.desc}</Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default function LandingView() {
  const { i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
  }

  return (
    <div style={{ position: 'relative' }}>
      <IconButton onClick={toggleLang} aria-label={i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        sx={{
          position: 'fixed', top: 16, insetInlineEnd: 16, zIndex: 10,
          bgcolor: isDark ? 'background.paper' : 'white',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 2, px: 1.5, py: 0.5,
          transition: 'all 0.3s ease',
          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f0ecf6', transform: 'scale(1.05) rotate(-4deg)', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.12)' },
        }}
      >
        <Typography variant="caption" fontWeight="bold" sx={{ color: 'primary.main' }}>{i18n.language === 'en' ? 'AR' : 'EN'}</Typography>
      </IconButton>

      <Box sx={{ width: '100%', position: 'relative' }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </Box>
    </div>
  )
}
