import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, Stepper, Step, StepLabel,
  CircularProgress, Alert, IconButton, Chip, alpha, LinearProgress, MenuItem, Fade,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, ArrowForwardOutlined, CloudUploadOutlined, DeleteOutlineOutlined,
  BusinessCenterOutlined, DescriptionOutlined, CheckCircleOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createCompanyWithDocs } from '@/services/companyService'

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

const COMPANY_SIZES = [
  { value: '1-10', en: '1-10 employees', ar: '1-10 موظفين' },
  { value: '11-50', en: '11-50 employees', ar: '11-50 موظف' },
  { value: '51-200', en: '51-200 employees', ar: '51-200 موظف' },
  { value: '201-500', en: '201-500 employees', ar: '201-500 موظف' },
  { value: '501-1000', en: '501-1000 employees', ar: '501-1000 موظف' },
  { value: '1000+', en: '1000+ employees', ar: '1000+ موظف' },
]

const CURRENT_YEAR = new Date().getFullYear()
const MAX_DOCS = 5
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

const fadeUp = (delay = 0) => ({
  animation: `fadeUp 0.5s ease ${delay}s both`,
})

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: '0 4px 16px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 4px 20px rgba(61,28,110,0.14)' },
  },
  '& .MuiInputLabel-outlined': {
    transition: 'all 0.2s ease',
  },
}

const stepIcons = {
  0: <BusinessCenterOutlined />,
  1: <DescriptionOutlined />,
}

export default function EmployerSetup() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const profile = user?.employerProfile || {}

  const [step, setStep] = useState(0)
  const [slideDir, setSlideDir] = useState('forward')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: profile.companyName || '',
    description: profile.companyDescription || '',
    industry: profile.companyIndustry || '',
    location: profile.companyLocation || '',
    website: profile.website || '',
    companySize: profile.companySize || '',
    foundedYear: profile.foundedYear || '',
    contactEmail: '',
  })
  const [documents, setDocuments] = useState([])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleDocAdd = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_DOCS - documents.length
    const valid = files.slice(0, remaining).filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(lang === 'ar' ? 'الملف غير مدعوم. استخدم PDF أو JPG أو PNG' : 'Unsupported file. Use PDF, JPG, or PNG')
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(lang === 'ar' ? 'الملف كبير جداً. الحد الأقصى 10 ميغابايت' : 'File too large. Max 10MB')
        return false
      }
      return true
    })
    setDocuments((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  const handleDocRemove = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStep = (dir) => {
    setSlideDir(dir)
    setStep((s) => dir === 'forward' ? Math.min(s + 1, 1) : Math.max(s - 1, 0))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      if (form.description.trim()) fd.append('description', form.description.trim())
      if (form.industry) fd.append('industry', form.industry)
      if (form.location.trim()) fd.append('location', form.location.trim())
      if (form.website.trim()) fd.append('website', form.website.trim())
      if (form.companySize) fd.append('companySize', form.companySize)
      if (form.foundedYear) fd.append('foundedYear', String(form.foundedYear))
      if (form.contactEmail.trim()) fd.append('contactEmail', form.contactEmail.trim())
      documents.forEach((doc) => fd.append('documents', doc))

      const res = await createCompanyWithDocs(fd)
      if (res?.success) {
        navigate('/employer/pending')
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { en: 'Company Info', ar: 'معلومات الشركة', icon: <BusinessCenterOutlined /> },
    { en: 'Documents', ar: 'الوثائق', icon: <DescriptionOutlined /> },
  ]

  const slideAnim = slideDir === 'forward'
    ? { animation: 'slideInRight 0.4s ease both' }
    : { animation: 'slideInLeft 0.4s ease both' }

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default',
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      '@keyframes slideInRight': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
    }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, ...fadeUp(0) }}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{
              transition: 'all 0.2s',
              '&:hover': { transform: 'scale(1.1)', bgcolor: alpha('#3D1C6E', 0.08) },
            }}>
              <ArrowBackOutlined />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              {lang === 'ar' ? 'إنشاء صفحة الشركة' : 'Create Company Page'}
            </Typography>
          </Stack>

          {/* Stepper with icons */}
          <Paper sx={{
            p: 2, borderRadius: 3, ...fadeUp(0.1),
            border: '1px solid', borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,252,0.9) 100%)',
            backdropFilter: 'blur(10px)',
          }}>
            <Stepper activeStep={step} alternativeLabel sx={{
              '& .MuiStepLabel-label': { fontSize: '0.82rem', fontWeight: 600, mt: 0.5 },
              '& .Mui-active .MuiStepLabel-label': { color: 'primary.main' },
              '& .Mui-completed .MuiStepLabel-label': { color: 'success.main' },
              '& .MuiStepIcon-root': { fontSize: '1.8rem', transition: 'all 0.3s ease' },
              '& .Mui-active .MuiStepIcon-root': { color: 'primary.main', filter: 'drop-shadow(0 2px 8px rgba(61,28,110,0.3))' },
              '& .Mui-completed .MuiStepIcon-root': { color: 'success.main' },
            }}>
              {steps.map((s, i) => (
                <Step key={s.en}>
                  <StepLabel>{s[lang]}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
          {error && (
            <Fade in>
              <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* Main content area */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Left sidebar - summary */}
            <Paper sx={{
              width: 240, flexShrink: 0, borderRadius: 3, p: 2,
              border: '1px solid', borderColor: 'divider',
              display: { xs: 'none', md: 'block' },
              ...fadeUp(0.15),
            }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: 'primary.main' }}>
                {lang === 'ar' ? 'ملخص' : 'Summary'}
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: lang === 'ar' ? 'اسم الشركة' : 'Company Name', value: form.name, required: true },
                  { label: lang === 'ar' ? 'المجال' : 'Industry', value: form.industry ? INDUSTRIES.find((i) => i.value === form.industry)?.[lang] : '' },
                  { label: lang === 'ar' ? 'الموقع' : 'Location', value: form.location },
                  { label: lang === 'ar' ? 'الحجم' : 'Size', value: form.companySize },
                  { label: lang === 'ar' ? 'السنة' : 'Year', value: form.foundedYear },
                ].map((item, i) => (
                  <Box key={i} sx={{
                    p: 1, borderRadius: 1.5,
                    bgcolor: item.value ? alpha('#16A34A', 0.06) : alpha('#F59E0B', 0.06),
                    border: '1px solid',
                    borderColor: item.value ? alpha('#16A34A', 0.15) : alpha('#F59E0B', 0.15),
                    transition: 'all 0.3s ease',
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      {item.label} {item.required && '*'}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {item.value || '—'}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {step === 1 && (
                <Box sx={{ mt: 2, p: 1, borderRadius: 1.5, bgcolor: alpha('#3D1C6E', 0.04) }}>
                  <Typography variant="caption" color="text.secondary">
                    {lang === 'ar' ? 'الوثائق المرفقة' : 'Attached Documents'}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {documents.length}/{MAX_DOCS} {lang === 'ar' ? 'ملفات' : 'files'}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Main form */}
            <Paper sx={{
              flex: 1, borderRadius: 3, overflow: 'hidden',
              border: '1px solid', borderColor: 'divider',
            }}>
              {loading && <LinearProgress sx={{ borderRadius: 0 }} />}

              <Fade in key={step} timeout={400}>
                <Box sx={slideAnim}>
                  {step === 0 && (
                    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, ...fadeUp(0.1) }}>
                        {lang === 'ar' ? 'بيانات الشركة' : 'Company Information'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ...fadeUp(0.15) }}>
                        {lang === 'ar' ? 'أدخل البيانات الأساسية لشركتك' : 'Enter your company basic details'}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sx={fadeUp(0.15)}>
                          <TextField
                            label={lang === 'ar' ? 'اسم الشركة *' : 'Company Name *'}
                            value={form.name} onChange={set('name')}
                            required fullWidth sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} sx={fadeUp(0.2)}>
                          <TextField
                            label={lang === 'ar' ? 'وصف النشاط' : 'Description'}
                            value={form.description} onChange={set('description')}
                            fullWidth multiline rows={2} sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={fadeUp(0.25)}>
                          <TextField
                            label={lang === 'ar' ? 'المجال' : 'Industry'}
                            value={form.industry} onChange={set('industry')}
                            select fullWidth sx={fieldSx}
                          >
                            <MenuItem value="">
                              <em>{lang === 'ar' ? 'اختر المجال' : 'Select industry'}</em>
                            </MenuItem>
                            {INDUSTRIES.map((ind) => (
                              <MenuItem key={ind.value} value={ind.value}>{ind[lang]}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={fadeUp(0.3)}>
                          <TextField
                            label={lang === 'ar' ? 'الموقع' : 'Location'}
                            value={form.location} onChange={set('location')}
                            fullWidth sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4} sx={fadeUp(0.35)}>
                          <TextField
                            label={lang === 'ar' ? 'حجم الشركة' : 'Company Size'}
                            value={form.companySize} onChange={set('companySize')}
                            select fullWidth sx={fieldSx}
                          >
                            <MenuItem value="">
                              <em>{lang === 'ar' ? 'اختر' : 'Select'}</em>
                            </MenuItem>
                            {COMPANY_SIZES.map((s) => (
                              <MenuItem key={s.value} value={s.value}>{s[lang]}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={fadeUp(0.4)}>
                          <TextField
                            label={lang === 'ar' ? 'سنة التأسيس' : 'Founded Year'}
                            value={form.foundedYear} onChange={set('foundedYear')}
                            select fullWidth sx={fieldSx}
                          >
                            <MenuItem value="">
                              <em>{lang === 'ar' ? 'اختر' : 'Select'}</em>
                            </MenuItem>
                            {Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i).map((y) => (
                              <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={fadeUp(0.45)}>
                          <TextField
                            label={lang === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                            value={form.website} onChange={set('website')}
                            fullWidth placeholder="https://" sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} sx={fadeUp(0.5)}>
                          <TextField
                            label={lang === 'ar' ? 'البريد الإلكتروني للتواصل' : 'Contact Email'}
                            value={form.contactEmail} onChange={set('contactEmail')}
                            fullWidth type="email" sx={fieldSx}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {step === 1 && (
                    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, ...fadeUp(0.1) }}>
                        {lang === 'ar' ? 'الوثائق الرسمية' : 'Official Documents'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ...fadeUp(0.15) }}>
                        {lang === 'ar'
                          ? `ارفق السجل التجاري أو الرخصة — حتى ${MAX_DOCS} ملفات`
                          : `Upload Commercial Register or License — up to ${MAX_DOCS} files`}
                      </Typography>

                      <Box
                        sx={{
                          border: '2px dashed', borderColor: 'divider', borderRadius: 3,
                          p: 4, textAlign: 'center', cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          bgcolor: alpha('#3D1C6E', 0.02),
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: alpha('#3D1C6E', 0.06),
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(61,28,110,0.1)',
                          },
                          ...fadeUp(0.2),
                        }}
                        component="label"
                      >
                        <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleDocAdd} />
                        <CloudUploadOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 1, animation: 'pulse 2s ease-in-out infinite' }} />
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                          {lang === 'ar' ? 'اضغط لاختيار الملفات' : 'Click to select files'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          PDF, JPG, PNG — {lang === 'ar' ? 'حد أقصى 10 ميغابايت للملف' : 'Max 10MB per file'}
                        </Typography>
                      </Box>

                      {documents.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 2 }}>
                          {documents.map((doc, i) => (
                            <Fade in key={i} timeout={300}>
                              <Stack direction="row" spacing={1} sx={{
                                alignItems: 'center', p: 1, borderRadius: 2,
                                border: '1px solid', borderColor: 'divider',
                                bgcolor: 'background.paper',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha('#3D1C6E', 0.03) },
                              }}>
                                <CheckCircleOutlineOutlined sx={{ fontSize: 18, color: 'success.main' }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={500} noWrap>{doc.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                                  </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => handleDocRemove(i)} color="error"
                                  sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.2s' }}>
                                  <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Stack>
                            </Fade>
                          ))}
                        </Stack>
                      )}

                      {documents.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, ...fadeUp(0.3) }}>
                          <LinearProgress
                            variant="determinate"
                            value={(documents.length / MAX_DOCS) * 100}
                            sx={{ flex: 1, borderRadius: 10, height: 6 }}
                          />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {documents.length}/{MAX_DOCS}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Fade>
            </Paper>
          </Box>

          {/* Navigation buttons */}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', ...fadeUp(0.4) }}>
            <Button
              variant="text"
              disabled={step === 0}
              onClick={() => handleStep('backward')}
              startIcon={<ArrowBackOutlined />}
              sx={{
                color: 'text.secondary', fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(-4px)' },
                '&:disabled': { opacity: 0.3 },
              }}
            >
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => handleStep('forward')}
                endIcon={<ArrowForwardOutlined />}
                disabled={!form.name.trim()}
                sx={{
                  px: 4, fontWeight: 600, borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !form.name.trim()}
                sx={{
                  px: 4, fontWeight: 600, borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 6px 20px rgba(61,28,110,0.3)' },
                  '&:active': { transform: 'scale(0.98)' },
                  '&:disabled': { bgcolor: '#B5AECB' },
                }}
              >
                {loading
                  ? <CircularProgress size={20} sx={{ color: 'white' }} />
                  : (lang === 'ar' ? 'إرسال الطلب' : 'Submit Application')}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
