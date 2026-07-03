import React from 'react'
import { Box, Button, Chip, Container, Stack, Typography, Card } from '@mui/material'
import { keyframes } from '@mui/system'
import HubIcon from '@mui/icons-material/Hub'
import InsightsIcon from '@mui/icons-material/Insights'
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import SouthRoundedIcon from '@mui/icons-material/SouthRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
  50% { transform: translate3d(0, -12px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`

const pulseGlow = keyframes`
  0% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
  100% { opacity: 0.35; transform: scale(1); }
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
        py: { xs: 10, md: 0 },
        background: 'linear-gradient(135deg, #f8f6fc 0%, #eeeaf8 58%, #e4e6f0 100%)',
      }}
    >
      <Container maxWidth="xl" sx={{ zIndex: 10, position: 'relative' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.05fr) minmax(380px, 0.95fr)' },
            gap: { xs: 6, lg: 5 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={3.2} alignItems={{ xs: 'center', lg: 'flex-start' }} textAlign={{ xs: 'center', lg: 'left' }}>
            <Chip
              icon={<VerifiedRoundedIcon sx={{ color: `${palette.berry} !important` }} />}
              label={t('landing.chip', 'Professional networking, redesigned for clarity and momentum')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.84)',
                color: palette.plum,
                border: `1px solid ${palette.line}`,
                fontWeight: 700,
                backdropFilter: 'blur(12px)',
                px: 1,
                boxShadow: '0 16px 34px rgba(36, 16, 66, 0.06)',
              }}
            />

            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                color: palette.deep,
                mb: 1,
                fontSize: { xs: '2.9rem', md: '4.8rem' },
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
                maxWidth: 720,
              }}
            >
              {t('landing.heading', 'Grow your career with a network that feels premium, smart, and focused.')}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: '#5c5671',
                lineHeight: 1.8,
                px: { xs: 1, md: 0 },
                fontSize: { xs: '1.02rem', md: '1.18rem' },
                fontWeight: 400,
                maxWidth: 620,
              }}
            >
              {t('landing.subheading', 'Discover better roles, stronger connections, and real market insight through a cleaner professional experience built for modern talent.')}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1, width: '100%' }}>
              {[
                { value: '24k+', label: t('landing.stat1', 'active professionals') },
                { value: '91%', label: t('landing.stat2', 'faster profile completion') },
                { value: '4.9/5', label: t('landing.stat3', 'experience satisfaction') },
              ].map((item) => (
                <Card
                  key={item.label}
                  elevation={0}
                  sx={{
                    flex: 1,
                    px: 2.5,
                    py: 2.2,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.78)',
                    border: `1px solid ${palette.line}`,
                    boxShadow: '0 16px 40px rgba(36, 16, 66, 0.06)',
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: palette.deep }}>
                    {item.value}
                  </Typography>
                  <Typography sx={{ color: '#655f78', fontSize: '0.92rem' }}>
                    {item.label}
                  </Typography>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 440, lg: 620 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: '8% 0 0 0', lg: '3% 0 6% 2%' },
                borderRadius: 8,
                background: 'linear-gradient(160deg, rgba(12,24,40,1) 0%, rgba(26,8,53,0.96) 52%, rgba(61,28,110,0.92) 100%)',
                boxShadow: '0 40px 80px rgba(36, 16, 66, 0.22)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at top right, rgba(255,255,255,0.26), rgba(255,255,255,0) 34%)',
                }}
              />
            </Box>

            <Card
              elevation={0}
              sx={{
                position: 'relative',
                width: { xs: '94%', lg: '86%' },
                borderRadius: 7,
                p: 2.2,
                bgcolor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 24px 70px rgba(18, 15, 31, 0.22)',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f87171' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34d399' }} />
              </Stack>

              <Box
                sx={{
                  borderRadius: 6,
                  bgcolor: '#f7f8fc',
                  border: `1px solid ${palette.line}`,
                  p: 2.4,
                }}
              >
                <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ mb: 2 }}>
                  {['Profile Strength', 'Role Match', 'Network Growth'].map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{
                        bgcolor: 'rgba(61, 28, 110, 0.08)',
                        color: palette.plum,
                        border: '1px solid rgba(61, 28, 110, 0.18)',
                      }}
                    />
                  ))}
                </Stack>

                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: palette.deep, mb: 2 }}>
                  {t('landing.dashboardTitle', 'Your career dashboard, simplified')}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 1.5,
                  }}
                >
                  <Card elevation={0} sx={{ gridColumn: { xs: 'span 12', sm: 'span 7' }, p: 2.2, borderRadius: 5, bgcolor: '#ffffff' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ color: '#6d6882', fontSize: '0.85rem' }}>{t('landing.visibilityLabel', 'Profile visibility')}</Typography>
                        <Typography sx={{ color: palette.deep, fontSize: '1.8rem', fontWeight: 900 }}>87%</Typography>
                      </Box>
                      <AutoGraphRoundedIcon sx={{ fontSize: 34, color: palette.berry }} />
                    </Stack>
                    <Box sx={{ mt: 2, height: 10, borderRadius: 999, bgcolor: '#eef1f8', overflow: 'hidden' }}>
                      <Box sx={{ width: '87%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #1f0d42, #3d1c6e)' }} />
                    </Box>
                  </Card>

                  <Card elevation={0} sx={{ gridColumn: { xs: 'span 12', sm: 'span 5' }, p: 2.2, borderRadius: 5, bgcolor: '#ffffff' }}>
                    <Typography sx={{ color: '#6d6882', fontSize: '0.85rem', mb: 0.5 }}>{t('landing.opportunityLabel', 'Opportunity score')}</Typography>
                    <Typography sx={{ color: palette.deep, fontSize: '2rem', fontWeight: 900 }}>+32%</Typography>
                    <Typography sx={{ color: '#6d6882', fontSize: '0.88rem' }}>{t('landing.opportunityDesc', 'more relevant matches this week')}</Typography>
                  </Card>

                  <Card elevation={0} sx={{ gridColumn: 'span 12', p: 2.2, borderRadius: 5, bgcolor: '#ffffff' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                      <Typography sx={{ color: palette.deep, fontWeight: 800 }}>{t('landing.momentumTitle', 'Momentum highlights')}</Typography>
                      <Chip label="Live" size="small" sx={{ bgcolor: 'rgba(61, 28, 110, 0.12)', color: palette.berry }} />
                    </Stack>
                    <Stack spacing={1.2}>
                      {[
                        t('landing.momentum1', '3 high-fit opportunities recommended today'),
                        t('landing.momentum2', '2 recruiters viewed your profile this week'),
                        t('landing.momentum3', 'Your network reach increased by 18%'),
                      ].map((item) => (
                        <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: palette.berry }} />
                          <Typography sx={{ color: '#615b76', fontSize: '0.93rem' }}>{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Box>
              </Box>
            </Card>

            <Box
              sx={{
                position: 'absolute',
                right: { xs: 0, lg: -10 },
                top: { xs: -6, lg: 40 },
                width: { xs: 118, md: 165 },
                p: 2,
                borderRadius: 5,
                bgcolor: 'rgba(255,255,255,0.75)',
                border: `1px solid ${palette.line}`,
                backdropFilter: 'blur(16px)',
                textAlign: 'left',
                animation: `${floatCard} 5.2s ease-in-out infinite`,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography sx={{ fontSize: '0.8rem', color: '#666', mb: 0.6 }}>
                {t('landing.matchLabel', 'Match quality')}
              </Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: palette.plum }}>
                94%
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                {t('landing.matchDesc', 'aligned with your strongest skills')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: { xs: '80%', md: '50%' },
          height: '75%',
          bgcolor: palette.plum,
          borderRadius: '80px',
          top: { xs: '-10%', md: '-15%' },
          right: { xs: '-20%', md: '-10%' },
          transform: 'rotate(15deg)',
          opacity: 0.4,
          filter: 'blur(80px)',
          animation: `${subtleMove} 12s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: { xs: '60%', md: '40%' },
          height: '75%',
          bgcolor: palette.navy,
          borderRadius: '80px',
          bottom: { xs: '-10%', md: '-15%' },
          left: { xs: '-20%', md: '-10%' },
          transform: 'rotate(15deg)',
          opacity: 0.42,
          filter: 'blur(82px)',
          animation: `${subtleMove} 14s ease-in-out infinite reverse`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 'auto',
          width: { xs: 180, md: 260 },
          height: { xs: 180, md: 260 },
          borderRadius: '50%',
          right: { xs: '10%', md: '18%' },
          bottom: { xs: '12%', md: '18%' },
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
          animation: `${pulseGlow} 6s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}

function FloatButtons() {
  const { t } = useTranslation()

  return (
    <Box
      spacing={1.5}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: { xs: 24, md: 40 },
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          pointerEvents: 'auto',
          bgcolor: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(18px)',
          border: `1px solid ${palette.line}`,
          borderRadius: 9999,
          p: 1,
          boxShadow: '0 16px 40px rgba(52,17,63,0.16)',
        }}
      >
        <Button
          component={Link}
          to="/sign-in"
          variant="outlined"
          size="large"
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.3,
            borderRadius: 9999,
            textTransform: 'none',
            color: palette.navyMid,
            borderColor: 'rgba(12,24,40,0.16)',
            bgcolor: 'rgba(255,255,255,0.72)',
          }}
        >
          {t('landing.signIn', 'Sign In')}
        </Button>
        <Button
          component={Link}
          to="/sign-up"
          variant="contained"
          size="large"
          sx={{
            fontWeight: 700,
            px: 4,
            py: 1.3,
            borderRadius: 9999,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #12082a 0%, #1f0d42 55%, #3d1c6e 140%)',
            boxShadow: '0px 10px 28px rgba(18,8,42,0.3)',
            '&:hover': {
              boxShadow: '0px 14px 36px rgba(18,8,42,0.35)',
            },
          }}
        >
          {t('landing.createAccount', 'Create Account')}
        </Button>
      </Stack>
    </Box>
  )
}

function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <HubIcon sx={{ fontSize: 40 }} />,
      title: t('landing.feature1Title', 'Smart Matchmaking'),
      description: t('landing.feature1Desc', 'Connect based on actual skills and project history, not just job titles. Enter a lounge of curated experts.'),
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 40 }} />,
      title: t('landing.feature2Title', 'Transparent Market Data'),
      description: t('landing.feature2Desc', 'Know your exact worth with real-time salary insights, trend analysis, and positioning signals.'),
    },
    {
      icon: <WorkOutlineOutlined sx={{ fontSize: 40 }} />,
      title: t('landing.feature3Title', 'Curated Opportunities'),
      description: t('landing.feature3Desc', 'Say goodbye to generic job boards. Get matched with high-signal roles that fit your exact professional DNA.'),
    },
  ]

  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 }, maxWidth: 700, mx: 'auto' }}>
          <Typography
            sx={{
              color: palette.berry,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            {t('landing.whyChooseUs', 'Why Choose Us')}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: palette.deep,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2,
            }}
          >
            {t('landing.featureHeading', 'Premium tools that keep your next move in focus')}
          </Typography>
          <Typography sx={{ mt: 2, color: '#655f78', lineHeight: 1.8 }}>
            {t('landing.featureSub', 'Every section is structured to help users understand value faster, trust the product sooner, and take action with confidence.')}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
          {features.map((feature, index) => (
            <Card
              elevation={0}
              key={index}
              sx={{
                width: { xs: '100%', md: '30%', lg: '28%' },
                display: 'flex',
                flexDirection: 'column',
                minHeight: 380,
                p: { xs: 4, md: 4.5 },
                borderRadius: 6,
                border: '1px solid rgba(36, 0, 70, 0.08)',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(36, 0, 70, 0.08)',
                  borderColor: 'rgba(61, 28, 110, 0.3)',
                },
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(61, 28, 110, 0.1)',
                  color: palette.berry,
                  mb: 4,
                }}
              >
                {feature.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: palette.deep, mb: 2 }}>
                {feature.title}
              </Typography>
              <Typography sx={{ color: '#4b4561', fontSize: '1.05rem', lineHeight: 1.7, flexGrow: 1 }}>
                {feature.description}
              </Typography>
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
    {
      number: '01',
      title: t('landing.step1Title', 'Build Your Identity'),
      description: t('landing.step1Desc', 'Shape a profile around expertise, proof, and positioning so the right people understand your value in seconds.'),
    },
    {
      number: '02',
      title: t('landing.step2Title', 'Curate Your Feed'),
      description: t('landing.step2Desc', 'Follow the industries, operators, and conversations that matter instead of scrolling through generic noise.'),
    },
    {
      number: '03',
      title: t('landing.step3Title', 'Move with Confidence'),
      description: t('landing.step3Desc', 'Apply, connect, and negotiate using stronger visibility and clearer market signals.'),
    },
  ]

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #f5f3fa 0%, #eae6f4 100%)',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 }, maxWidth: 760, mx: 'auto' }}>
          <Typography
            sx={{
              color: palette.berry,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            {t('landing.howItWorks', 'How It Works')}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: palette.deep,
              fontSize: { xs: '2rem', md: '3.25rem' },
              lineHeight: 1.08,
              mb: 2,
            }}
          >
            {t('landing.stepsHeading', 'A simple path from profile clarity to real opportunity')}
          </Typography>
          <Typography sx={{ color: '#5b556f', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8 }}>
            {t('landing.stepsSub', 'Every step is designed to reduce noise, sharpen your signal, and move you faster toward the right connections and roles.')}
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: { xs: 2.5, lg: 0 },
          }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <Card
                elevation={0}
                sx={{
                  position: 'relative',
                  flex: 1,
                  minHeight: 320,
                  p: { xs: 3, md: 4.5 },
                  borderRadius: 7,
                  border: '1px solid rgba(36, 0, 70, 0.08)',
                  bgcolor: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 24px 50px rgba(36, 0, 70, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -18,
                    right: -12,
                    fontSize: { xs: '5rem', md: '7rem' },
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'rgba(61, 28, 110, 0.08)',
                    userSelect: 'none',
                  }}
                >
                  {step.number}
                </Box>
                <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: index === 1 ? 'rgba(31,13,66,0.08)' : 'rgba(61, 28, 110, 0.1)',
                      color: index === 1 ? '#1f0d42' : palette.berry,
                      border: '1px solid rgba(36, 0, 70, 0.08)',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: palette.deep,
                      fontSize: { xs: '1.45rem', md: '1.9rem' },
                      lineHeight: 1.15,
                      maxWidth: 260,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: '#4b4561', fontSize: '1.02rem', lineHeight: 1.85, maxWidth: 360 }}>
                    {step.description}
                  </Typography>
                </Stack>
              </Card>

              {index < steps.length - 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { lg: 2 },
                    py: { xs: 0.5, lg: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 56, lg: 72 },
                      height: { xs: 56, lg: 72 },
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      border: '1px solid rgba(61, 28, 110, 0.18)',
                      boxShadow: '0 12px 24px rgba(61, 28, 110, 0.12)',
                      color: palette.berry,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                      <SouthRoundedIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                      <EastRoundedIcon sx={{ fontSize: 30 }} />
                    </Box>
                  </Box>
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

function TrustSection() {
  const { t } = useTranslation()

  const items = [
    {
      icon: <AutoGraphRoundedIcon sx={{ fontSize: 32 }} />,
      title: t('landing.trust1Title', 'Clearer market signals'),
      description: t('landing.trust1Desc', 'Turn salary data and role insights into better career decisions without the guesswork.'),
    },
    {
      icon: <VerifiedRoundedIcon sx={{ fontSize: 32 }} />,
      title: t('landing.trust2Title', 'Stronger professional trust'),
      description: t('landing.trust2Desc', 'Present your profile with a polished structure that feels credible to recruiters and peers.'),
    },
    {
      icon: <BoltRoundedIcon sx={{ fontSize: 32 }} />,
      title: t('landing.trust3Title', 'Faster action flow'),
      description: t('landing.trust3Desc', 'Guide users from discovery to connection with less friction and more confidence.'),
    },
  ]

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="xl">
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0c1828 0%, #1a0835 54%, #2d1055 160%)',
            color: '#ffffff',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), rgba(255,255,255,0) 28%)' }} />
          <Box
            sx={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.1fr)' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.78, mb: 1.5 }}>
                {t('landing.trustLabel', 'Why this redesign works')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.08, mb: 2 }}>
                {t('landing.trustHeading', 'A more modern interface increases trust before users even click.')}
              </Typography>
              <Typography sx={{ opacity: 0.86, maxWidth: 560 }}>
                {t('landing.trustSub', 'The updated visual system combines premium gradients, softer glass surfaces, stronger layout rhythm, and clearer calls to action across the journey.')}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              {items.map((item) => (
                <Card
                  key={item.title}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    minHeight: 190,
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(12px)',
                    color: '#ffffff',
                  }}
                >
                  <Box sx={{ color: '#a78cd6', mb: 2 }}>{item.icon}</Box>
                  <Typography sx={{ fontWeight: 800, mb: 1.2 }}>{item.title}</Typography>
                  <Typography sx={{ opacity: 0.78, fontSize: '0.92rem' }}>{item.description}</Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}

export default function LandingView() {
  return (
    <div style={{ position: 'relative' }}>
      <Box sx={{ width: '100%', position: 'relative', pb: { xs: 12, md: 10 } }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
      </Box>
      <FloatButtons />
    </div>
  )
}
