import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Avatar, CircularProgress, Stack, Chip, alpha, Divider } from '@mui/material'
import { ErrorOutlined, WorkOutlineOutlined, LocationOnOutlined, ArrowForwardRounded } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { getLatestJobs } from '@/services/employeeService'

export default function LatestJobsSidebar() {
  const theme = useTheme()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLatestJobs(5)
        if (res?.success) setJobs(res.data)
        else setError('Failed to load')
      } catch {
        setError('Could not load')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const displayJobs = jobs.slice(0, 5)

  const typeColor = {
    'Full-time': 'primary',
    'Part-time': 'secondary',
    'Freelance': 'info',
    'Internship': 'success',
    Contract: 'warning',
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} role="complementary" aria-label="Latest Jobs">
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.85rem' }}>Latest Jobs</Typography>
      </Box>
      <Divider sx={{ mx: 2 }} />
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
        </Box>
      ) : error || displayJobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutlined sx={{ fontSize: 28, color: alpha(theme.palette.text.disabled, 0.5), mb: 0.5 }} />
          <Typography variant="caption" color="text.disabled">{error || 'No jobs yet'}</Typography>
        </Box>
      ) : (
        <Stack spacing={0} sx={{ py: 1 }}>
          {displayJobs.map((job) => (
            <Box key={job._id} component={Link} to={`/jobs/${job._id}`} role="listitem"
              sx={{
                display: 'flex', gap: 1.25, alignItems: 'flex-start', textDecoration: 'none',
                px: 2, py: 1, mx: 1, borderRadius: 1.5, transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '& .jobTitle': { color: 'primary.main' },
                  '& .jobArrow': { opacity: 1, transform: 'translateX(0)' },
                },
              }}>
              <Avatar
                src={job.company?.logo}
                alt={job.company?.name}
                sx={{
                  width: 36, height: 36, flexShrink: 0, mt: 0.25,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontSize: '0.8rem', fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                {job.company?.name?.charAt(0)?.toUpperCase() || <WorkOutlineOutlined sx={{ fontSize: 16 }} />}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography className="jobTitle" variant="body2" noWrap
                  sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3, transition: 'color 0.2s', color: 'text.primary' }}>
                  {job.title}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: 'text.secondary', mt: 0.25, lineHeight: 1.2 }}>
                  {job.company?.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.25 }}>
                  {job.location && (
                    <Chip
                      icon={<LocationOnOutlined sx={{ fontSize: 10 }} />}
                      label={job.location}
                      size="small"
                      sx={{ height: 18, fontSize: '0.55rem', fontWeight: 500, bgcolor: theme.palette.action.hover }}
                    />
                  )}
                  {job.type && (
                    <Chip
                      label={job.type}
                      size="small"
                      color={typeColor[job.type] || 'default'}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.55rem', fontWeight: 600 }}
                    />
                  )}
                </Stack>
              </Box>
              <Box sx={{ jobArrow: { opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }, display: 'flex', alignItems: 'center', pt: 0.5 }}>
                <ArrowForwardRounded className="jobArrow" sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Box>
            </Box>
          ))}
          {displayJobs.length > 0 && (
            <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
              <Divider sx={{ mb: 1 }} />
              <Box component={Link} to="/jobs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 0.75, color: 'primary.main', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', borderRadius: 1, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }}>
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
