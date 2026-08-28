﻿import { RADIUS } from '@/theme/tokens'
import { useState } from 'react'
import { formatMoney } from '@/utils/money'
import {
  TextField as MuiTextField,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  Radio as MuiRadio,
  RadioGroup,
  Switch as MuiSwitch,
  Select as MuiSelect,
  MenuItem,
  Slider as MuiSlider,
  Typography,
  Box,
  Stack,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

function TextField({ label, error, helperText, sx, ...props }) {
  return (
    <MuiTextField
      label={label}
      error={error}
      helperText={helperText}
      variant="outlined"
      fullWidth
      sx={(theme) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: RADIUS,
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.2s ease',
          '& fieldset': { borderColor: theme.palette.divider },
          '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
          '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 2 },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
        ...sx,
      })}
      {...props}
    />
  )
}

function PasswordField({ label, ...props }) {
  const [show, setShow] = useState(false)

  return (
    <TextField
      label={label}
      type={show ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShow(!show)}
                edge="end"
                size="small"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  )
}

function SearchInput({ placeholder = 'Search...', value, onChange, sx, ...props }) {
  return (
    <OutlinedInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      role="searchbox"
      aria-label={placeholder}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        </InputAdornment>
      }
      sx={(theme) => ({
        borderRadius: 20,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
        '&.Mui-focused': { borderColor: 'primary.main' },
        fontSize: '0.9rem',
        ...sx,
      })}
      {...props}
    />
  )
}

function TextArea({ label, rows = 4, sx, ...props }) {
  return (
    <TextField
      label={label}
      multiline
      rows={rows}
      sx={{
        '& .MuiOutlinedInput-root': { borderRadius: 3 },
        ...sx,
      }}
      {...props}
    />
  )
}

function Select({ label, options = [], value, onChange, placeholder, error, helperText, sx, ...props }) {
  return (
    <FormControl fullWidth error={error} sx={sx}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect
        value={value}
        onChange={onChange}
        label={label}
        displayEmpty={!!placeholder}
        sx={(theme) => ({
          borderRadius: RADIUS,
          backgroundColor: theme.palette.background.paper,
          '& fieldset': { borderColor: theme.palette.divider },
          '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
          '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 2 },
        })}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

function Checkbox({ label, checked, onChange, sx, ...props }) {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={onChange}
          sx={(theme) => ({
            color: alpha(theme.palette.primary.main, 0.3),
            '&.Mui-checked': { color: 'primary.main' },
            ...sx,
          })}
          {...props}
        />
      }
      label={label}
      sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', color: 'text.secondary' } }}
    />
  )
}

function RadioBtn({ label, value, checked, onChange, sx, ...props }) {
  const radio = (
    <MuiRadio
      checked={checked}
      onChange={onChange}
      value={value}
      aria-label={label || value}
      sx={(theme) => ({
        color: alpha(theme.palette.primary.main, 0.3),
        '&.Mui-checked': { color: 'primary.main' },
        ...sx,
      })}
      {...props}
    />
  )

  if (label) {
    return <FormControlLabel control={radio} label={label} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
  }
  return radio
}

function RadioGroupField({ label, name, value, onChange, options = [], row = true, sx, ...props }) {
  return (
    <FormControl sx={sx}>
      {label && <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.85rem', color: 'text.secondary' }}>{label}</Typography>}
      <RadioGroup name={name} value={value} onChange={onChange} row={row} {...props}>
        {options.map((opt) => (
          <RadioBtn key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

function Switch({ label, checked, onChange, sx, ...props }) {
  return (
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
          aria-label={label || undefined}
          sx={(theme) => ({
            '& .MuiSwitch-track': { borderRadius: 999 },
            '& .MuiSwitch-thumb': { boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.12)}` },
            '& .Mui-checked': {
              color: 'primary.main',
              '& + .MuiSwitch-track': { backgroundColor: 'primary.main' },
            },
            ...sx,
          })}
          {...props}
        />
      }
      label={label}
      sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }}
    />
  )
}

function Slider({ value, onChange, min = 0, max = 100, step = 1, marks, valueLabelDisplay = 'auto', sx, ...props }) {
  return (
    <MuiSlider
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      marks={marks}
      valueLabelDisplay={valueLabelDisplay}
      sx={(theme) => ({
        color: 'primary.main',
        '& .MuiSlider-track': { border: 'none' },
        '& .MuiSlider-thumb': {
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover, &.Mui-focusVisible': { boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}` },
        },
        ...sx,
      })}
      {...props}
    />
  )
}

function RangeSlider({
  label,
  valueMin,
  valueMax,
  onChange,
  min = 0,
  max = 100000,
  step = 500,
  currency = '',
  formatValue = (v, c) => formatMoney(v, c),
  sx,
  ...props
}) {
  const numMin = Number(valueMin) || 0
  const numMax = Number(valueMax) || 0
  const safeMax = Math.max(max, numMin, numMax, min + step)

  const current = [
    Math.min(numMin, safeMax),
    numMax > 0 ? Math.min(numMax, safeMax) : safeMax,
  ]

  const handleChange = (_, newValue) => {
    const [lo, hi] = newValue
    onChange(lo <= min ? '' : String(lo), hi >= safeMax ? '' : String(hi))
  }

  const hasValue = Boolean(valueMin || valueMax)
  const render = (v) => formatValue(v, currency)

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'baseline', minHeight: 20 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
          {hasValue && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
              {render(current[0])}{current[1] >= safeMax ? '+' : ` - ${render(current[1])}`}
            </Typography>
          )}
        </Stack>
      )}
      <MuiSlider
        value={current}
        onChange={handleChange}
        min={min}
        max={safeMax}
        step={step}
        valueLabelDisplay="auto"
        getAriaLabel={(index) => (index === 0 ? 'Minimum value' : 'Maximum value')}
        getAriaValueText={(v) => render(v)}
        valueLabelFormat={(v) => render(v)}
        sx={(theme) => ({
          color: 'primary.main',
          mt: 1,
          '& .MuiSlider-track': { border: 'none' },
          '& .MuiSlider-thumb': {
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}` },
          },
          ...sx,
        })}
        {...props}
      />
    </Box>
  )
}

function FileUpload({ label, onChange, accept, multiple, sx, ...props }) {
  return (
    <TextField
      label={label}
      type="file"
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { accept, multiple },
      }}
      onChange={onChange}
      sx={{
        '& input[type="file"]': { padding: '8px 0', fontSize: '0.85rem' },
        ...sx,
      }}
      {...props}
    />
  )
}

export {
  TextField,
  PasswordField,
  SearchInput,
  TextArea,
  Select,
  Checkbox,
  RadioBtn,
  RadioGroupField,
  Switch,
  Slider,
  RangeSlider,
  FileUpload,
}
