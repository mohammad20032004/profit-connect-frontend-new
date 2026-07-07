import React from 'react'
import { Stack, TextField, Box } from '@mui/material'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function StepPersonalInfo({ form, onChange, errors }) {
  return (
    <Stack spacing={2.5}>
      {['firstName', 'lastName', 'email', 'phoneNumber'].map((field, i) => (
        <Box key={field} sx={{ animation: 'fadeUp 0.4s ease', animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
          <TextField
            label={field === 'phoneNumber' ? 'Phone Number (optional)' : field === 'firstName' ? 'First Name' : field === 'lastName' ? 'Last Name' : 'Email Address'}
            type={field === 'email' ? 'email' : 'text'}
            value={form[field]}
            onChange={onChange(field)}
            required={field !== 'phoneNumber'}
            fullWidth
            error={!!errors[field]}
            helperText={errors[field]}
            sx={fieldSx}
          />
        </Box>
      ))}
    </Stack>
  )
}
