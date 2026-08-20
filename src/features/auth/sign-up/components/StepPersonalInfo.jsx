import { Stack, TextField, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

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
      {['firstName', 'lastName', 'email'].map((field, i) => (
        <Box key={field} sx={{ animation: 'fadeUp 0.4s ease', animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
          <TextField
            label={field === 'firstName' ? 'First Name' : field === 'lastName' ? 'Last Name' : 'Email Address'}
            type={field === 'email' ? 'email' : 'text'}
            value={form[field]}
            onChange={onChange(field)}
            required
            fullWidth
            error={!!errors[field]}
            helperText={errors[field]}
            sx={fieldSx}
          />
        </Box>
      ))}

      <Box sx={{ animation: 'fadeUp 0.4s ease', animationDelay: '0.24s', animationFillMode: 'both' }}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={form.gender || ''}
            label="Gender"
            onChange={onChange('gender')}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease', animationDelay: '0.32s', animationFillMode: 'both' }}>
        <TextField
          label="Phone Number (optional)"
          type="text"
          value={form.phoneNumber}
          onChange={onChange('phoneNumber')}
          fullWidth
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          sx={fieldSx}
        />
      </Box>
    </Stack>
  )
}
