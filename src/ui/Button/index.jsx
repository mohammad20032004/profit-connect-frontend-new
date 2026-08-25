import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  ButtonGroup as MuiButtonGroup,
  CircularProgress,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

const customVariants = {
  primary: { variant: 'contained' },
  secondary: { variant: 'outlined' },
  text: { variant: 'text' },
  danger: { variant: 'contained', color: 'error' },
  gradient: { variant: 'contained' },
}

function Button({
  children,
  variant = 'primary',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  size = 'medium',
  disabled = false,
  sx,
  ...props
}) {
  const { startIcon: startIconProp, endIcon: endIconProp, ...cleanProps } = props
  const isCustomVariant = variant in customVariants
  const muiProps = isCustomVariant ? customVariants[variant] : { variant }
  const showIcon = !loading && icon
  const computedStartIcon = startIconProp || (showIcon && iconPosition === 'left' ? icon : undefined)
  const computedEndIcon = endIconProp || (showIcon && iconPosition === 'right' ? icon : undefined)

  return (
    <MuiButton
      {...muiProps}
      {...cleanProps}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={computedStartIcon}
      endIcon={computedEndIcon}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      sx={(theme) => ({
        ...(variant === 'primary' && {
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: '#fff',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          },
          '&:active': { background: theme.palette.secondary.dark },
        }),
        ...(variant === 'gradient' && {
          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          color: '#fff',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
          },
        }),
        ...(variant === 'danger' && {
          '&:hover': { backgroundColor: theme.palette.error.dark },
        }),
        '&.Mui-disabled': {
          background: alpha(theme.palette.action.disabled, 0.12),
          color: theme.palette.action.disabled,
          opacity: 1,
          boxShadow: 'none',
          border: 'none',
          WebkitTextFillColor: theme.palette.action.disabled,
          cursor: 'not-allowed',
        },
        borderRadius: 20,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.9rem',
        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
        minHeight: size === 'small' ? 36 : size === 'large' ? 48 : 44,
        minWidth: fullWidth ? '100%' : 44,
        transition: 'all 0.2s ease',
        ...sx,
      })}
    >
      {loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : children}
    </MuiButton>
  )
}

function IconBtn({ children, size = 'medium', color = 'default', sx, ...props }) {
  return (
    <MuiIconButton
      {...props}
      size={size}
      sx={(theme) => ({
        color: color === 'default' ? theme.palette.text.secondary : theme.palette[color]?.main || color,
        minWidth: 44,
        minHeight: 44,
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
        transition: 'all 0.2s ease',
        ...sx,
      })}
    >
      {children}
    </MuiIconButton>
  )
}

function ButtonGroup({ children, sx, ...props }) {
  return (
    <MuiButtonGroup
      {...props}
      sx={{
        '& .MuiButton-root': {
          borderRadius: '0 !important',
          '&:first-of-type': {
            borderTopLeftRadius: '999px !important',
            borderBottomLeftRadius: '999px !important',
          },
          '&:last-of-type': {
            borderTopRightRadius: '999px !important',
            borderBottomRightRadius: '999px !important',
          },
        },
        ...sx,
      }}
    >
      {children}
    </MuiButtonGroup>
  )
}

export { Button, IconBtn, ButtonGroup }
export default Button
