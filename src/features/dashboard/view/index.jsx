import React, { useState, useEffect } from 'react'
import { Box, Container, Grid, Typography, Paper, Avatar, Chip, CircularProgress, Stack, Rating } from '@mui/material'
import { BusinessOutlined, LocationOnOutlined, ErrorOutlined } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import InfoSide from '../components/InfoSide'
import PostsSection from '../components/PostsSection'
import axios from 'axios'

function TopCompaniesSidebar() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('profit_connect_token')
        const { data } = await axios.get('http://localhost:5000/api/companies', {
          params: { limit: 100 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (data?.success) setCompanies(data.data)
        else setError('Failed to load')
      } catch {
        setError('Could not load')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <Paper sx={{ p: 2.5, height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Top Companies
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={28} /></Box>
      ) : error || companies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutlined sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {error || 'No companies yet'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {companies.map((c) => (
            <Box
              key={c._id}
              component={Link}
              to={`/companies/${c._id}`}
              sx={{
                display: 'flex', gap: 1.5, alignItems: 'flex-start', textDecoration: 'none',
                p: 1.2, borderRadius: 2, transition: 'background 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar src={c.logo} sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16 }}>
                {c.name?.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" noWrap>
                  {c.name}
                </Typography>
                {c.industry && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    <BusinessOutlined sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'text-top' }} />
                    {c.industry}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.3 }}>
                  <Rating value={c.averageRating} readOnly precision={0.1} size="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {c.averageRating?.toFixed(1)}
                  </Typography>
                </Stack>
                {c.location && (
                  <Chip
                    icon={<LocationOnOutlined sx={{ fontSize: 13 }} />}
                    label={c.location}
                    size="small"
                    sx={{ mt: 0.3, height: 22, fontSize: '0.7rem', maxWidth: '100%' }}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
          <Box
            component={Link}
            to="/companies"
            sx={{
              display: 'block', textAlign: 'center', py: 1, mt: 1,
              color: 'primary.main', fontWeight: 600, fontSize: '0.85rem',
              textDecoration: 'none', borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            View All
          </Box>
        </Stack>
      )}
    </Paper>
  )
}

function DashboardView() {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 88px)',
        overflow: 'hidden',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ height: '100%', py: 2 }}
      >
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', overflow: 'hidden', py: 'auto' }}>
            <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <InfoSide />
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ height: '100%', overflow: 'hidden' }}
          >
            <Box sx={{ height: '100%', overflow: 'hidden' }}>
              <PostsSection />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', overflow: 'hidden' }}>
            <TopCompaniesSidebar />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardView
