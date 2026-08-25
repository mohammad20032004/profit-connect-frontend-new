
import { Stack, TextField, Box, MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

const COMPANY_SIZES = [
  { value: '1-10', en: '1-10 employees', ar: '1-10 موظفين' },
  { value: '11-50', en: '11-50 employees', ar: '11-50 موظف' },
  { value: '51-200', en: '51-200 employees', ar: '51-200 موظف' },
  { value: '201-500', en: '201-500 employees', ar: '201-500 موظف' },
  { value: '501-1000', en: '501-1000 employees', ar: '501-1000 موظف' },
  { value: '1000+', en: '1000+ employees', ar: '1000+ موظف' },
]

const CURRENT_YEAR = new Date().getFullYear()

export default function StepCompanyDetails({ form, onChange }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  return (
    <Stack spacing={2.5}>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {t('auth.companyDetailsSubtitle')}
        </Typography>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.05s both' }}>
        <TextField
          label={t('auth.website')}
          value={form.website || ''}
          onChange={onChange('website')}
          fullWidth
          placeholder="https://"
          sx={fieldSx}
        />
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <TextField
          label={t('auth.companySize')}
          value={form.companySize || ''}
          onChange={onChange('companySize')}
          select
          fullWidth
          sx={fieldSx}
        >
          <MenuItem value="">
            <em>{t('auth.selectSize')}</em>
          </MenuItem>
          {COMPANY_SIZES.map((size) => (
            <MenuItem key={size.value} value={size.value}>{size[lang]}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
        <TextField
          label={t('auth.foundedYear')}
          value={form.foundedYear || ''}
          onChange={onChange('foundedYear')}
          select
          fullWidth
          sx={fieldSx}
        >
          <MenuItem value="">
            <em>{t('auth.selectYear')}</em>
          </MenuItem>
          {Array.from({ length: 25 }, (_, i) => CURRENT_YEAR - i).map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </TextField>
      </Box>
    </Stack>
  )
}
