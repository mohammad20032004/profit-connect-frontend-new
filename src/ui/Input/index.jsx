import React, { useState } from 'react'
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
} from '@mui/material'
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
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          backgroundColor: '#fff',
          transition: 'all 0.2s ease',
          '& fieldset': { borderColor: 'rgba(31, 10, 59, 0.12)' },
          '&:hover fieldset': { borderColor: 'rgba(61, 28, 110, 0.3)' },
          '&.Mui-focused fieldset': { borderColor: '#3D1C6E', borderWidth: 2 },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#3D1C6E' },
        ...sx,
      }}
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
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow(!show)} edge="end" size="small">
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
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
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon sx={{ color: '#8F86AD', fontSize: 20 }} />
        </InputAdornment>
      }
      sx={{
        borderRadius: 999,
        backgroundColor: '#fff',
        border: '1px solid rgba(31, 10, 59, 0.12)',
        '&:hover': { borderColor: 'rgba(61, 28, 110, 0.3)' },
        '&.Mui-focused': { borderColor: '#3D1C6E' },
        fontSize: '0.9rem',
        ...sx,
      }}
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
        sx={{
          borderRadius: 3,
          backgroundColor: '#fff',
          '& fieldset': { borderColor: 'rgba(31, 10, 59, 0.12)' },
          '&:hover fieldset': { borderColor: 'rgba(61, 28, 110, 0.3)' },
          '&.Mui-focused fieldset': { borderColor: '#3D1C6E', borderWidth: 2 },
        }}
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
          sx={{
            color: 'rgba(31, 10, 59, 0.3)',
            '&.Mui-checked': { color: '#3D1C6E' },
            ...sx,
          }}
          {...props}
        />
      }
      label={label}
      sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', color: '#5C5580' } }}
    />
  )
}

function RadioBtn({ label, value, checked, onChange, sx, ...props }) {
  const radio = (
    <MuiRadio
      checked={checked}
      onChange={onChange}
      value={value}
      sx={{
        color: 'rgba(31, 10, 59, 0.3)',
        '&.Mui-checked': { color: '#3D1C6E' },
        ...sx,
      }}
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
      {label && <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.85rem', color: '#5C5580' }}>{label}</Typography>}
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
          sx={{
            '& .MuiSwitch-track': { borderRadius: 999 },
            '& .MuiSwitch-thumb': { boxShadow: '0 2px 4px rgba(31, 10, 59, 0.12)' },
            '& .Mui-checked': {
              color: '#3D1C6E',
              '& + .MuiSwitch-track': { backgroundColor: '#3D1C6E' },
            },
            ...sx,
          }}
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
      sx={{
        color: '#3D1C6E',
        '& .MuiSlider-track': { border: 'none' },
        '& .MuiSlider-thumb': {
          boxShadow: '0 2px 8px rgba(61, 28, 110, 0.3)',
          '&:hover, &.Mui-focusVisible': { boxShadow: '0 4px 16px rgba(61, 28, 110, 0.4)' },
        },
        ...sx,
      }}
      {...props}
    />
  )
}

function FileUpload({ label, value, onChange, accept, multiple, sx, ...props }) {
  return (
    <TextField
      label={label}
      type="file"
      InputLabelProps={{ shrink: true }}
      inputProps={{ accept, multiple }}
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
  FileUpload,
}
