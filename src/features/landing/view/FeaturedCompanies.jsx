import React, { useState, useEffect } from 'react'
import { Box, Button, Chip, Container, Stack, Typography, Card, Avatar, CircularProgress, Rating } from '@mui/material'
import { keyframes } from '@mui/system'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined'
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const palette = {
  deep: '#12082a',
  berry: '#3d1c6e',
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

export default function FeaturedCompanies() {
  const { t } = useTranslation()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('profit_connect_token')
        const { data } = await axios.get('http://localhost:5000/api/companies', {
          params: { sort: 'top', limit: 6, status: 'Approved' },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (data?.success) setCompanies(data.data)
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #faf9fc 0%, #f4f1fa 50%, #eeebf5 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,28,110,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,28,110,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 }, maxWidth: 700, mx: 'auto' }}>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: palette.berry, opacity: 0.6 }} />
            <Typography
              sx={{
                color: palette.berry,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                opacity: 0.8,
              }}
            >
              {t('landing.topCompaniesLabel', 'Top Companies')}
            </Typography>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: palette.berry, opacity: 0.6 }} />
          </Stack>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: palette.deep,
              fontSize: { xs: '1.8rem', md: '3rem' },
              lineHeight: 1.15,
              mb: 2.5,
              letterSpacing: '-0.02em',
            }}
          >
            {t('landing.topCompaniesHeading', 'Discover the highest-rated companies on our platform')}
          </Typography>
          <Typography sx={{ color: '#6d6882', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            {t('landing.topCompaniesSub', 'Join thousands of professionals who trust the companies listed here. These top-rated organizations are vetted, reviewed, and recommended by your peers.')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
        ) : companies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#6d6882', fontSize: '1.1rem' }}>
              {t('landing.noTopCompanies', 'No companies yet')}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: 3.5,
            }}
          >
            {companies.map((c, i) => (
              <Card
                key={c._id}
                elevation={0}
                component={Link}
                to={`/companies/${c._id}`}
                sx={{
                  textDecoration: 'none',
                  p: 3.5,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'rgba(31, 13, 66, 0.06)',
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(31, 13, 66, 0.04)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  animation: `${fadeInUp} 0.6s ease-out ${i * 0.1}s both`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(31, 13, 66, 0.08)',
                    borderColor: 'rgba(61, 28, 110, 0.15)',
                  },
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      src={c.logo}
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: palette.berry,
                        fontSize: 20,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(61, 28, 110, 0.15)',
                      }}
                    >
                      {c.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: palette.deep, fontSize: '1rem', lineHeight: 1.3 }} noWrap>
                        {c.name}
                      </Typography>
                      {c.industry && (
                        <Typography sx={{ color: '#8a84a0', fontSize: '0.82rem', mt: 0.3 }}>
                          <BusinessOutlined sx={{ fontSize: 13, mr: 0.4, verticalAlign: 'text-top' }} />
                          {c.industry}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {c.description && (
                    <Typography sx={{ color: '#5b556f', fontSize: '0.88rem', lineHeight: 1.7 }}>
                      {c.description.length > 120 ? `${c.description.slice(0, 120)}...` : c.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', '& > *': { minWidth: 0 } }}>
                    {c.location && (
                      <Chip icon={<LocationOnOutlined sx={{ fontSize: 14 }} />} label={c.location} size="small" sx={{ color: '#6d6882', borderColor: 'rgba(31,13,66,0.1)', fontSize: '0.76rem', fontWeight: 500 }} variant="outlined" />
                    )}
                    <Chip icon={<PeopleOutlined sx={{ fontSize: 14 }} />} label={`${c.followersCount ?? 0}`} size="small" sx={{ color: '#6d6882', borderColor: 'rgba(31,13,66,0.1)', fontSize: '0.76rem', fontWeight: 500 }} variant="outlined" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                      <Rating value={c.averageRating} readOnly precision={0.1} size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
                      <Typography sx={{ color: '#8a84a0', fontSize: '0.76rem', fontWeight: 600 }}>
                        {c.averageRating?.toFixed(1)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/companies"
            variant="outlined"
            size="large"
            endIcon={<EastRoundedIcon />}
            sx={{
              fontWeight: 600,
              px: 5,
              py: 1.5,
              borderRadius: 9999,
              textTransform: 'none',
              borderColor: 'rgba(31,13,66,0.15)',
              color: palette.berry,
              fontSize: '0.95rem',
              '&:hover': {
                borderColor: palette.berry,
                bgcolor: 'rgba(61, 28, 110, 0.04)',
              },
            }}
          >
            {t('landing.viewAllCompanies', 'View All Companies')}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
