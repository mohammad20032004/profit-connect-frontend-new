import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Avatar, CircularProgress, Stack, Rating, alpha, Divider } from '@mui/material'
import { ErrorOutlined, StarRounded, ChevronRightRounded, ArrowForwardRounded } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import axios from 'axios'

export default function TopCompaniesSidebar() {
  const theme = useTheme()
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

  const displayCompanies = companies.slice(0, 3)

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
      role="complementary"
      aria-label="Top Companies"
    >
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
          Top Companies
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
        </Box>
      ) : error || companies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutlined sx={{ fontSize: 28, color: alpha(theme.palette.text.disabled, 0.5), mb: 0.5 }} />
          <Typography variant="caption" color="text.disabled">
            {error || 'No companies yet'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0} sx={{ py: 1 }}>
          {displayCompanies.map((c) => (
            <Box
              key={c._id}
              component={Link}
              to={`/companies/${c._id}`}
              role="listitem"
              aria-label={`${c.name}, Rating: ${c.averageRating > 0 ? c.averageRating.toFixed(1) : 'N/A'}`}
              sx={{
                display: 'flex',
                gap: 1.25,
                alignItems: 'center',
                textDecoration: 'none',
                px: 2,
                py: 1,
                mx: 1,
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '& .companyName': { color: 'primary.main' },
                  '& .companyArrow': { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <Avatar
                src={c.logo}
                alt={c.name}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                {c.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  className="companyName"
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3, transition: 'color 0.2s', color: 'text.primary' }}
                >
                  {c.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.15 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarRounded
                        key={star}
                        sx={{
                          fontSize: 10,
                          color: star <= Math.round(c.averageRating || 0)
                            ? theme.palette.warning.main
                            : theme.palette.action.disabled,
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem', color: 'text.secondary' }}>
                    ({c.averageRating > 0 ? c.averageRating.toFixed(1) : '0.0'})
                  </Typography>
                </Box>
              </Box>

              <ChevronRightRounded
                className="companyArrow"
                sx={{ fontSize: 16, color: 'text.disabled', opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }}
              />
            </Box>
          ))}

          {companies.length > 3 && (
            <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
              <Divider sx={{ mb: 1 }} />
              <Box
                component={Link}
                to="/companies"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 0.75,
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
              >
                View All
                <ArrowForwardRounded sx={{ fontSize: 14, transition: 'transform 0.2s', '&:hover': { transform: 'translateX(2px)' } }} />
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </Paper>
  )
}
