import React from 'react'
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  ButtonGroup as MuiButtonGroup,
  CircularProgress,
} from '@mui/material'

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
      sx={{
        ...(variant === 'primary' && {
          background: 'linear-gradient(135deg, #3D1C6E, #1F3670)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #2D1055, #13294B)',
          },
          '&:active': { background: '#13294B' },
        }),
        ...(variant === 'gradient' && {
          background: 'linear-gradient(135deg, #6C3FB5, #3B5591)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #5C3594, #2E4782)',
          },
        }),
        ...(variant === 'danger' && {
          '&:hover': { backgroundColor: '#B91C1C' },
        }),
        '&.Mui-disabled': {
          background: 'rgba(122, 122, 140, 0.35)',
          color: '#fff',
          opacity: 1,
          boxShadow: 'none',
          border: 'none',
          '-webkit-text-fill-color': '#fff',
          cursor: 'not-allowed',
        },
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.9rem',
        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
        minWidth: fullWidth ? '100%' : undefined,
        transition: 'all 0.2s ease',
        ...sx,
      }}
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
      sx={{
        color: color === 'default' ? '#5C5580' : `${color}.main`,
        '&:hover': { backgroundColor: 'rgba(61, 28, 110, 0.08)' },
        transition: 'all 0.2s ease',
        ...sx,
      }}
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
