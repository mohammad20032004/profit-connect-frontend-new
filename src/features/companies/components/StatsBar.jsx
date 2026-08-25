import { Box, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { BusinessOutlined, DomainOutlined, PeopleOutlined, Star } from '@mui/icons-material'
import { staggerFast, scaleIn } from '@/utils/animations'

const MotionBox = motion.create(Box)

export default function StatsBar({ companies, t }) {
  const theme = useTheme()
  const totalCompanies = companies.length
  const industries = new Set(companies.map((c) => c.industry).filter(Boolean)).size
  const avgRating = totalCompanies === 0
    ? 0
    : (companies.reduce((acc, c) => acc + (c.averageRating || 0), 0) / totalCompanies).toFixed(1)
  const totalFollowers = companies.reduce((acc, c) => acc + (c.followersCount ?? c.followers?.length ?? 0), 0)

  const stats = [
    { label: t('companies.statsTotal'), value: totalCompanies, icon: <BusinessOutlined />, color: theme.palette.primary.main },
    { label: t('companies.statsIndustries'), value: industries, icon: <DomainOutlined />, color: theme.palette.secondary.main },
    { label: t('companies.statsAvgRating'), value: avgRating, icon: <Star sx={{ color: '#F59E0B' }} />, color: '#F59E0B' },
    { label: t('companies.statsFollowers'), value: totalFollowers.toLocaleString(), icon: <PeopleOutlined />, color: '#10B981' },
  ]

  return (
    <MotionBox variants={staggerFast} initial="hidden" animate="visible">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat, i) => (
          <MotionBox key={stat.label} variants={scaleIn} custom={i}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: alpha(stat.color, 0.3),
                  boxShadow: `0 4px 16px ${alpha(stat.color, 0.08)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(stat.color, 0.08),
                  color: stat.color,
                  '& svg': { fontSize: 20 },
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        ))}
      </Box>
    </MotionBox>
  )
}
