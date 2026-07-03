import React from 'react'
import {
  Card as MuiCard,
  CardContent,
  CardHeader as MuiCardHeader,
  CardActions,
  CardMedia,
  Typography,
  Box,
} from '@mui/material'

function Card({
  children,
  title,
  subtitle,
  action,
  media,
  mediaHeight = 200,
  actions,
  padding,
  hoverable = true,
  bordered = true,
  sx,
  ...props
}) {
  return (
    <MuiCard
      sx={{
        borderRadius: 4,
        border: bordered ? '1px solid rgba(31, 10, 59, 0.06)' : 'none',
        boxShadow: '0 4px 12px rgba(31, 10, 59, 0.04)',
        transition: hoverable ? 'all 0.25s ease' : 'none',
        ...(hoverable && {
          '&:hover': {
            boxShadow: '0 8px 24px rgba(31, 10, 59, 0.08)',
            borderColor: 'rgba(61, 28, 110, 0.12)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {media && <CardMedia component="img" height={mediaHeight} image={media} alt="" />}

      {(title || subtitle || action) && (
        <MuiCardHeader
          title={title}
          subheader={subtitle}
          action={action}
          titleTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
          subheaderTypographyProps={{ fontSize: '0.85rem' }}
        />
      )}

      {children && (
        <CardContent sx={{ padding: padding || 3, '&:last-child': { pb: padding || 3 } }}>
          {children}
        </CardContent>
      )}

      {actions && (
        <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  )
}

function CardStat({ label, value, icon, trend, trendLabel }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="body2" sx={{ color: '#5C5580', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1F0A3B' }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: trend > 0 ? '#16A34A' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              mt: 0.5,
            }}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            {trendLabel && ` ${trendLabel}`}
          </Typography>
        )}
      </Box>
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            backgroundColor: 'rgba(61, 28, 110, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3D1C6E',
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  )
}

export { Card, CardStat }
export default Card
