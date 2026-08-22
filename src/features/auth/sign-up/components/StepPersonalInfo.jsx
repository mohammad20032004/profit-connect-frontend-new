import { Stack, TextField, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function StepPersonalInfo({ form, onChange, errors }) {
  const { t } = useTranslation()

  const fields = [
    { key: 'firstName', label: t('auth.firstName'), type: 'text' },
    { key: 'lastName', label: t('auth.lastName'), type: 'text' },
    { key: 'email', label: t('auth.email'), type: 'email' },
  ]

  return (
    <Stack spacing={2.5}>
      {fields.map((f, i) => (
        <Box key={f.key} sx={{ animation: 'fadeUp 0.4s ease', animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
          <TextField
            label={f.label}
            type={f.type}
            value={form[f.key]}
            onChange={onChange(f.key)}
            required
            fullWidth
            error={!!errors[f.key]}
            helperText={errors[f.key]}
            sx={fieldSx}
          />
        </Box>
      ))}

      <Box sx={{ animation: 'fadeUp 0.4s ease', animationDelay: '0.24s', animationFillMode: 'both' }}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>{t('auth.gender')}</InputLabel>
          <Select
            value={form.gender || ''}
            label={t('auth.gender')}
            onChange={onChange('gender')}
          >
            <MenuItem value="male">{t('auth.male')}</MenuItem>
            <MenuItem value="female">{t('auth.female')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease', animationDelay: '0.32s', animationFillMode: 'both' }}>
        <TextField
          label={t('auth.phoneOptional')}
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
