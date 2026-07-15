import React from 'react'
import { Stack, TextField, Box, Typography, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

const INDUSTRIES = [
  { value: 'tech', en: 'Technology', ar: 'التكنولوجيا' },
  { value: 'finance', en: 'Finance', ar: 'المالية' },
  { value: 'healthcare', en: 'Healthcare', ar: 'الرعاية الصحية' },
  { value: 'education', en: 'Education', ar: 'التعليم' },
  { value: 'marketing', en: 'Marketing', ar: 'التسويق' },
  { value: 'design', en: 'Design', ar: 'التصميم' },
  { value: 'engineering', en: 'Engineering', ar: 'الهندسة' },
  { value: 'retail', en: 'Retail', ar: 'التجزئة' },
  { value: 'manufacturing', en: 'Manufacturing', ar: 'التصنيع' },
  { value: 'energy', en: 'Energy', ar: 'الطاقة' },
  { value: 'real-estate', en: 'Real Estate', ar: 'العقارات' },
  { value: 'media', en: 'Media', ar: 'الإعلام' },
  { value: 'consulting', en: 'Consulting', ar: 'الاستشارات' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
]

export default function StepCompanyInfo({ form, onChange, errors }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  return (
    <Stack spacing={2.5}>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
        <Typography variant="body2" sx={{ color: '#5C5580', mb: 0.5 }}>
          {lang === 'ar' ? 'أخبرنا عن شركتك' : 'Tell us about your company'}
        </Typography>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.05s both' }}>
        <TextField
          label={lang === 'ar' ? 'اسم الشركة *' : 'Company Name *'}
          value={form.companyName || ''}
          onChange={onChange('companyName')}
          required
          fullWidth
          error={!!errors.companyName}
          helperText={errors.companyName}
          sx={fieldSx}
        />
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <TextField
          label={lang === 'ar' ? 'وصف نشاط الشركة' : 'Company Description'}
          value={form.companyDescription || ''}
          onChange={onChange('companyDescription')}
          fullWidth
          multiline
          rows={3}
          sx={fieldSx}
        />
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
        <TextField
          label={lang === 'ar' ? 'مجال الشركة' : 'Industry'}
          value={form.companyIndustry || ''}
          onChange={onChange('companyIndustry')}
          select
          fullWidth
          sx={fieldSx}
        >
          <MenuItem value="">
            <em>{lang === 'ar' ? 'اختر المجال' : 'Select industry'}</em>
          </MenuItem>
          {INDUSTRIES.map((ind) => (
            <MenuItem key={ind.value} value={ind.value}>{ind[lang]}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
        <TextField
          label={lang === 'ar' ? 'مقر الشركة' : 'Company Location'}
          value={form.companyLocation || ''}
          onChange={onChange('companyLocation')}
          fullWidth
          sx={fieldSx}
        />
      </Box>
    </Stack>
  )
}
