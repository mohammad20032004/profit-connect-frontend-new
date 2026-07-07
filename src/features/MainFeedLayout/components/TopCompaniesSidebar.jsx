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

  return (
    <Paper
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(8px)',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.15), borderRadius: 4 },
      }}
    >
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.95rem',
            letterSpacing: '-0.01em',
          }}
        >
          Top Companies
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block' }}>
          {companies.length} companies
        </Typography>
      </Box>

      <Divider sx={{ mx: 2.5, my: 2 }} />

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={26} sx={{ color: alpha(theme.palette.primary.main, 0.4) }} />
        </Box>
      ) : error || companies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <ErrorOutlined sx={{ fontSize: 32, color: alpha(theme.palette.text.disabled, 0.5), mb: 1 }} />
          <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.82rem' }}>
            {error || 'No companies yet'}
          </Typography>
        </Box>
      ) : (

<Stack spacing={0} sx={{ px: 2, py: 1.5 }}>
  {companies.map((c, index) => (
    <Box
      key={c._id}
      component={Link}
      to={`/companies/${c._id}`}
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        textDecoration: 'none',
        p: 1.5,
        mb: 0.5,
        borderRadius: 2,
        border: '1px solid transparent', // يمنع اهتزاز العنصر عند إضافة الحد عند التمرير
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // منحنى انتقال فاخر
        position: 'relative',
        '&:hover': {
          bgcolor: alpha(theme.palette.text.primary, 0.03), // لون خلفية ناعم جداً
          borderColor: alpha(theme.palette.divider, 0.5), // حد ناعم
          transform: 'translateY(-1px)', // رفع خفيف للعنصر
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          '& .companyName': { color: 'primary.main' },
          '& .companyArrow': { opacity: 1, transform: 'translateX(0)', color: 'primary.main' },
        },
      }}
    >
      <Avatar
        src={c.logo}
        sx={{
          width: 42,
          height: 42,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          fontSize: '0.95rem',
          fontWeight: 700,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' }, // تكبير خفيف للصورة عند التمرير
        }}
      >
        {c.name?.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          className="companyName"
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '0.875rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01em', // تقريب الحروف لمظهر أكثر احترافية
            transition: 'color 0.2s ease',
          }}
          noWrap
        >
          {c.name}
        </Typography>
        
        {/* شارة التقييم الفاخرة (Premium Rating Badge) بدلاً من النجوم التقليدية */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            px: 0.7,
            py: 0.2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
            width: 'fit-content',
          }}
        >
          <StarRounded sx={{ fontSize: 12, color: theme.palette.warning.main }} />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.warning.dark,
              fontWeight: 700,
              fontSize: '0.7rem',
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {c.averageRating?.toFixed(1)}
          </Typography>
        </Box>
      </Box>

      <ChevronRightRounded
        className="companyArrow"
        sx={{
          fontSize: 18,
          color: 'text.disabled',
          opacity: 0,
          transform: 'translateX(-6px)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      />
    </Box>
  ))}

  {/* فاصل أنيق قبل زر العرض الكل */}
      <Divider sx={{ mx: 2.5, my: 2 }} />

  <Box
    component={Link}
    to="/companies"
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.8,
      py: 1.25,
      color: 'primary.main',
      fontWeight: 600,
      fontSize: '0.82rem',
      textDecoration: 'none',
      borderRadius: 2,
      letterSpacing: '0.01em',
      transition: 'all 0.25s ease',
      border: '1px solid transparent',
      '&:hover': {
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderColor: alpha(theme.palette.primary.main, 0.1),
        '& .viewAllArrow': { transform: 'translateX(3px)' },
      },
    }}
  >
    View All
    <ArrowForwardRounded 
      className="viewAllArrow"
      sx={{ 
        fontSize: 16, 
        transition: 'transform 0.25s ease' 
      }} 
    />
  </Box>
</Stack>      )}
    </Paper>
  )
}
