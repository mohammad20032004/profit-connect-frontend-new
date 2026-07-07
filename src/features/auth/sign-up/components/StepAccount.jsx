import React, { useState } from 'react'
import { Stack, TextField, MenuItem, InputAdornment, IconButton, Box } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const roles = ['Professional', 'Client', 'Student']

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function StepAccount({ form, onChange, errors }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Stack spacing={2.5}>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
        <TextField label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={onChange('password')} required fullWidth error={!!errors.password} helperText={errors.password || 'At least 6 characters'} sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <TextField label="Account Type" value={form.role} onChange={onChange('role')} select fullWidth sx={fieldSx}>
          {roles.map((r) => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
        </TextField>
      </Box>
    </Stack>
  )
}
