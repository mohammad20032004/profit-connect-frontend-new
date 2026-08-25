import {
  Card as MuiCard,
  CardContent,
  CardHeader as MuiCardHeader,
  CardActions,
  CardMedia,
  Typography,
  Box,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

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
      sx={(theme) => ({
        borderRadius: 1,
        border: bordered ? `1px solid ${theme.palette.divider}` : 'none',
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        transition: hoverable ? 'all 0.25s ease' : 'none',
        ...(hoverable && {
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
            borderColor: alpha(theme.palette.primary.main, 0.12),
          },
        }),
        ...sx,
      })}
      {...props}
    >
      {media && <CardMedia component="img" height={mediaHeight} image={media} alt={title || ''} />}

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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} aria-label={`${value} ${label}`}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: 'text.primary' }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: trend > 0 ? 'success.main' : 'error.main',
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
          sx={(theme) => ({
            width: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          })}
        >
          {icon}
        </Box>
      )}
    </Box>
  )
}

export { Card, CardStat }
export default Card
