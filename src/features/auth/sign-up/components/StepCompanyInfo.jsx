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
  { value: 'web-development', en: 'Web Development', ar: 'تطوير المواقع' },
  { value: 'mobile-development', en: 'Mobile Development', ar: 'تطوير تطبيقات الجوال' },
  { value: 'frontend', en: 'Frontend Development', ar: 'تطوير الواجهات الأمامية' },
  { value: 'backend', en: 'Backend Development', ar: 'تطوير الخلفيات' },
  { value: 'fullstack', en: 'Full Stack Development', ar: 'تطوير شامل' },
  { value: 'devops', en: 'DevOps & Cloud', ar: 'DevOps والحوسبة السحابية' },
  { value: 'ai-ml', en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي والتعلم الآلي' },
  { value: 'data-science', en: 'Data Science & Analytics', ar: 'علوم البيانات والتحليلات' },
  { value: 'cybersecurity', en: 'Cybersecurity', ar: 'الأمن السيبراني' },
  { value: 'ui-ux', en: 'UI/UX Design', ar: 'تصميم واجهات وتجربة المستخدم' },
  { value: 'qa-testing', en: 'QA & Testing', ar: 'الجودة والاختبار' },
  { value: 'game-dev', en: 'Game Development', ar: 'تطوير الألعاب' },
  { value: 'blockchain', en: 'Blockchain & Web3', ar: 'بلوكتشين وويب 3' },
  { value: 'iot', en: 'IoT & Embedded Systems', ar: 'إنترنت الأشياء والأنظمة المدمجة' },
  { value: 'saas', en: 'SaaS Products', ar: 'منتجات SaaS' },
  { value: 'ecommerce-tech', en: 'E-commerce Tech', ar: 'تقنيات التجارة الإلكترونية' },
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
