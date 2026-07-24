import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, Stepper, Step, StepLabel,
  CircularProgress, Alert, IconButton, Chip, alpha, LinearProgress, MenuItem, Fade, Divider,
  Autocomplete,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, ArrowForwardOutlined, CloudUploadOutlined, DeleteOutlineOutlined,
  BusinessCenterOutlined, DescriptionOutlined, CheckCircleOutlineOutlined,
  LocationOnOutlined, PendingOutlined, CancelOutlined, DashboardOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createCompanyWithDocs } from '@/services/companyService'
import { getMyCompany } from '@/services/employerService'
import LocationMap from '@/components/LocationMap'
import { extractCoordinates } from '@/utils/coordinates'

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

const COUNTRIES = [
  {
    value: 'SA', en: 'Saudi Arabia', ar: 'المملكة العربية السعودية',
    cities: [
      { value: 'riyadh', en: 'Riyadh', ar: 'الرياض' },
      { value: 'jeddah', en: 'Jeddah', ar: 'جدة' },
      { value: 'mecca', en: 'Mecca', ar: 'مكة المكرمة' },
      { value: 'medina', en: 'Medina', ar: 'المدينة المنورة' },
      { value: 'dammam', en: 'Dammam', ar: 'الدمام' },
      { value: 'khobar', en: 'Khobar', ar: 'الخبر' },
      { value: 'dhahran', en: 'Dhahran', ar: 'الظهران' },
      { value: 'tabuk', en: 'Tabuk', ar: 'تبوك' },
      { value: 'abha', en: 'Abha', ar: 'أبها' },
      { value: 'buraidah', en: 'Buraidah', ar: 'بريدة' },
      { value: 'khamis_mushait', en: 'Khamis Mushait', ar: 'خميس مشيط' },
      { value: 'hail', en: 'Hail', ar: 'حائل' },
      { value: 'jizan', en: 'Jizan', ar: 'جازان' },
      { value: 'najran', en: 'Najran', ar: 'نجران' },
      { value: 'alkharj', en: 'Al Kharj', ar: 'الخرج' },
      { value: 'yanbu', en: 'Yanbu', ar: 'ينبع' },
      { value: 'sakaka', en: 'Sakaka', ar: 'سكاكا' },
      { value: 'al_jubail', en: 'Al Jubail', ar: 'الجبيل' },
      { value: 'ras_tanura', en: 'Ras Tanura', ar: 'رأس تنورة' },
    ],
  },
  {
    value: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة',
    cities: [
      { value: 'dubai', en: 'Dubai', ar: 'دبي' },
      { value: 'abu_dhabi', en: 'Abu Dhabi', ar: 'أبو ظبي' },
      { value: 'sharjah', en: 'Sharjah', ar: 'الشارقة' },
      { value: 'ajman', en: 'Ajman', ar: 'عجمان' },
      { value: 'ras_al_khaimah', en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
      { value: 'fujairah', en: 'Fujairah', ar: 'الفجيرة' },
      { value: 'umm_al_quwain', en: 'Umm Al Quwain', ar: 'أم القيوين' },
      { value: 'al_ain', en: 'Al Ain', ar: 'العين' },
    ],
  },
  {
    value: 'EG', en: 'Egypt', ar: 'مصر',
    cities: [
      { value: 'cairo', en: 'Cairo', ar: 'القاهرة' },
      { value: 'alexandria', en: 'Alexandria', ar: 'الإسكندرية' },
      { value: 'giza', en: 'Giza', ar: 'الجيزة' },
      { value: 'sharm_el_sheikh', en: 'Sharm El Sheikh', ar: 'شرم الشيخ' },
      { value: 'luxor', en: 'Luxor', ar: 'الأقصر' },
      { value: 'aswan', en: 'Aswan', ar: 'أسوان' },
      { value: 'port_said', en: 'Port Said', ar: 'بورسعيد' },
      { value: 'suez', en: 'Suez', ar: 'السويس' },
    ],
  },
  {
    value: 'JO', en: 'Jordan', ar: 'الأردن',
    cities: [
      { value: 'amman', en: 'Amman', ar: 'عمّان' },
      { value: 'irbid', en: 'Irbid', ar: 'إربد' },
      { value: 'zarqa', en: 'Zarqa', ar: 'الزرقاء' },
      { value: 'aqaba', en: 'Aqaba', ar: 'العقبة' },
      { value: 'maan', en: "Ma'an", ar: 'معان' },
      { value: 'salt', en: 'Salt', ar: 'السلط' },
    ],
  },
  {
    value: 'LB', en: 'Lebanon', ar: 'لبنان',
    cities: [
      { value: 'beirut', en: 'Beirut', ar: 'بيروت' },
      { value: 'tripoli', en: 'Tripoli', ar: 'طرابلس' },
      { value: 'sidon', en: 'Sidon', ar: 'صيدا' },
      { value: 'tyre', en: 'Tyre', ar: 'صور' },
      { value: 'byblos', en: 'Byblos', ar: 'جبيل' },
    ],
  },
  {
    value: 'KW', en: 'Kuwait', ar: 'الكويت',
    cities: [
      { value: 'kuwait_city', en: 'Kuwait City', ar: 'مدينة الكويت' },
      { value: 'hawalli', en: 'Hawalli', ar: 'حولي' },
      { value: 'salmiya', en: 'Salmiya', ar: 'السالمية' },
      { value: 'farwaniya', en: 'Farwaniya', ar: 'الفروانية' },
      { value: 'jahra', en: 'Jahra', ar: 'الجهراء' },
    ],
  },
  {
    value: 'QA', en: 'Qatar', ar: 'قطر',
    cities: [
      { value: 'doha', en: 'Doha', ar: 'الدوحة' },
      { value: 'al_wakrah', en: 'Al Wakrah', ar: 'الوكرة' },
      { value: 'al_khor', en: 'Al Khor', ar: 'الخور' },
      { value: 'duhan', en: 'Dukhan', ar: 'دخان' },
    ],
  },
  {
    value: 'BH', en: 'Bahrain', ar: 'البحرين',
    cities: [
      { value: 'manama', en: 'Manama', ar: 'المنامة' },
      { value: 'muharraq', en: 'Muharraq', ar: 'المحرق' },
      { value: 'riffa', en: 'Riffa', ar: 'الريف' },
      { value: 'hamad_town', en: 'Hamad Town', ar: 'مدينة حمد' },
    ],
  },
  {
    value: 'OM', en: 'Oman', ar: 'عُمان',
    cities: [
      { value: 'muscat', en: 'Muscat', ar: 'مسقط' },
      { value: 'salalah', en: 'Salalah', ar: 'صلالة' },
      { value: 'sohar', en: 'Sohar', ar: 'صحار' },
      { value: 'nizwa', en: 'Nizwa', ar: 'نزوى' },
      { value: 'sur', en: 'Sur', ar: 'صور' },
    ],
  },
  {
    value: 'IQ', en: 'Iraq', ar: 'العراق',
    cities: [
      { value: 'baghdad', en: 'Baghdad', ar: 'بغداد' },
      { value: 'basra', en: 'Basra', ar: 'البصرة' },
      { value: 'erbil', en: 'Erbil', ar: 'أربيل' },
      { value: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية' },
      { value: 'mosul', en: 'Mosul', ar: 'الموصل' },
    ],
  },
  {
    value: 'MA', en: 'Morocco', ar: 'المغرب',
    cities: [
      { value: 'casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
      { value: 'rabat', en: 'Rabat', ar: 'الرباط' },
      { value: 'marrakech', en: 'Marrakech', ar: 'مراكش' },
      { value: 'fes', en: 'Fes', ar: 'فاس' },
      { value: 'tangier', en: 'Tangier', ar: 'طنجة' },
    ],
  },
  {
    value: 'TN', en: 'Tunisia', ar: 'تونس',
    cities: [
      { value: 'tunis', en: 'Tunis', ar: 'تونس' },
      { value: 'sfax', en: 'Sfax', ar: 'صفاقس' },
      { value: 'sousse', en: 'Sousse', ar: 'سوسة' },
    ],
  },
  {
    value: 'DZ', en: 'Algeria', ar: 'الجزائر',
    cities: [
      { value: 'algiers', en: 'Algiers', ar: 'الجزائر' },
      { value: 'oran', en: 'Oran', ar: 'وهران' },
      { value: 'constantine', en: 'Constantine', ar: 'قسنطينة' },
    ],
  },
  {
    value: 'SD', en: 'Sudan', ar: 'السودان',
    cities: [
      { value: 'khartoum', en: 'Khartoum', ar: 'الخرطوم' },
      { value: 'omdurman', en: 'Omdurman', ar: 'الدومرمان' },
    ],
  },
  { value: 'other', en: 'Other', ar: 'أخرى', cities: [] },
]

const CURRENT_YEAR = new Date().getFullYear()
const MAX_DOCS = 5
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.06)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

const sectionTitleSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'text.secondary',
}

export default function EmployerSetup() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const profile = user?.employerProfile || {}

  const [existingCompany, setExistingCompany] = useState(user?.company || null)
  const [checkingCompany, setCheckingCompany] = useState(!user?.company)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: profile.companyName || '',
    description: profile.companyDescription || '',
    industry: profile.companyIndustry || '',
    location: {
      country: profile.companyLocation?.country || '',
      city: profile.companyLocation?.city || '',
      street: profile.companyLocation?.street || '',
      buildingNumber: profile.companyLocation?.buildingNumber || '',
      coordinates: profile.companyLocation?.coordinates || null,
    },
    website: profile.website || '',
    companySize: profile.companySize || '',
    foundedYear: profile.foundedYear || '',
    contactEmail: '',
  })
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (user?.company) {
      setExistingCompany(user.company)
      setCheckingCompany(false)
      return
    }
    const checkCompany = async () => {
      try {
        const res = await getMyCompany()
        if (res?.success && res?.data) {
          setExistingCompany(res.data)
        }
      } catch { /* no company */ }
      finally { setCheckingCompany(false) }
    }
    checkCompany()
  }, [])

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))
  const setLocationField = (key) => (e) => setForm((p) => ({ ...p, location: { ...p.location, [key]: e.target.value } }))
  const handleCoordinatesChange = (coords) => setForm((p) => ({ ...p, location: { ...p.location, coordinates: coords } }))

  const selectedCountry = COUNTRIES.find((c) => c.en === form.location.country || c.ar === form.location.country)

  const handleDocAdd = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_DOCS - documents.length
    const valid = files.slice(0, remaining).filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(t('employer.setup.unsupportedFile'))
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(t('employer.setup.fileTooLarge'))
        return false
      }
      return true
    })
    setDocuments((p) => [...p, ...valid])
    e.target.value = ''
  }

  const handleDocRemove = (i) => setDocuments((p) => p.filter((_, j) => j !== i))

  const handleStep = (dir) => {
    setStep((s) => dir === 'forward' ? Math.min(s + 1, 2) : Math.max(s - 1, 0))
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
      const locationObj = { country: form.location.country, city: form.location.city }
      if (form.location.street.trim()) locationObj.street = form.location.street.trim()
      if (form.location.buildingNumber.trim()) locationObj.buildingNumber = form.location.buildingNumber.trim()
      if (form.location.coordinates) locationObj.coordinates = form.location.coordinates
      fd.append('location', JSON.stringify(locationObj))
      if (form.website.trim()) fd.append('website', form.website.trim())
      if (form.companySize) fd.append('companySize', form.companySize)
      if (form.foundedYear) fd.append('foundedYear', String(form.foundedYear))
      if (form.contactEmail.trim()) fd.append('contactEmail', form.contactEmail.trim())
      documents.forEach((doc) => fd.append('documents', doc))
      const res = await createCompanyWithDocs(fd)
      if (res?.success) navigate('/employer/pending')
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { key: 'stepInfo', icon: <BusinessCenterOutlined /> },
    { key: 'stepLocation', icon: <LocationOnOutlined /> },
    { key: 'stepDocs', icon: <DescriptionOutlined /> },
  ]

  const stepValidation = [
    !!form.name.trim(),
    !!(form.location.country && form.location.city),
    true,
  ]

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 88px)', bgcolor: 'grey.50',
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      '@keyframes slideInRight': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
    }}>
      <Container maxWidth={(step === 1 && !existingCompany && !checkingCompany) ? 'lg' : 'md'} sx={{ py: 3, transition: 'max-width 0.3s ease' }}>
        {checkingCompany ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress />
          </Box>
        ) : existingCompany ? (
          <Fade in timeout={500}>
            <Box>
              <Paper sx={{ p: 4, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha('#3D1C6E', 0.08),
                  }}>
                    <BusinessCenterOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Box>

                  <Typography variant="h5" fontWeight="bold">{existingCompany.name}</Typography>

                  <Chip
                    icon={existingCompany.status === 'Approved' ? <CheckCircleOutlineOutlined /> :
                      existingCompany.status === 'Rejected' ? <CancelOutlined /> : <PendingOutlined />}
                    label={t(`employer.status.${existingCompany.status?.toLowerCase() || 'pending'}`)}
                    color={existingCompany.status === 'Approved' ? 'success' :
                      existingCompany.status === 'Rejected' ? 'error' : 'warning'}
                    sx={{ fontWeight: 600 }}
                  />

                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
                    {existingCompany.status === 'Pending'
                      ? t('employer.setup.companyExistsPending')
                      : existingCompany.status === 'Approved'
                        ? t('employer.setup.companyExistsApproved')
                        : t('employer.setup.companyExistsRejected')}
                  </Typography>

                  <Stack direction="row" spacing={1.5}>
                    {existingCompany.status === 'Approved' && (
                      <Button
                        variant="contained"
                        startIcon={<DashboardOutlined />}
                        onClick={() => navigate('/employer/dashboard')}
                        sx={{ px: 4, fontWeight: 700 }}
                      >
                        {t('employer.setup.dashboard')}
                      </Button>
                    )}
                    {existingCompany.status === 'Pending' && (
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/employer/pending')}
                        sx={{ px: 4 }}
                      >
                        {t('employer.setup.trackStatus')}
                      </Button>
                    )}
                    {existingCompany.status === 'Rejected' && (
                      <Button
                        variant="contained"
                        onClick={() => navigate('/employer/setup')}
                        sx={{ px: 4 }}
                      >
                        {t('employer.setup.editResubmit')}
                      </Button>
                    )}
                    <Button
                      variant="text"
                      onClick={() => navigate(-1)}
                      sx={{ color: 'text.secondary' }}
                    >
                      {t('employer.setup.goBack')}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Fade>
        ) : (
        <Fade in timeout={500}>
          <Box>
            {/* Stepper */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Stepper activeStep={step} sx={{
                '& .MuiStepLabel-label': { fontSize: '0.8rem', fontWeight: 600, mt: 0.5 },
                '& .Mui-active .MuiStepLabel-label': { color: 'primary.main' },
                '& .Mui-completed .MuiStepLabel-label': { color: 'success.main' },
                '& .MuiStepIcon-root': { fontSize: '1.6rem' },
                '& .Mui-active .MuiStepIcon-root': { color: 'primary.main', filter: 'drop-shadow(0 2px 6px rgba(61,28,110,0.3))' },
                '& .Mui-completed .MuiStepIcon-root': { color: 'success.main' },
              }}>
                {steps.map((s) => (
                  <Step key={s.key}>
                    <StepLabel>{t(`employer.setup.${s.key}`)}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Error */}
            {error && (
              <Fade in>
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 1 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {/* Form Card */}
            <Paper sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              {/* Step 0: Company Info */}
              {step === 0 && (
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {t('employer.setup.companyNameLabel')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('employer.setup.descriptionPlaceholder')}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  <Stack spacing={2}>
                    <TextField
                      label={t('employer.setup.companyName')}
                      value={form.name} onChange={set('name')}
                      required fullWidth size="small" sx={fieldSx}
                    />
                    <TextField
                      label={t('employer.setup.description')}
                      value={form.description} onChange={set('description')}
                      fullWidth multiline rows={2} size="small" sx={fieldSx}
                    />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t('employer.setup.industry')}
                          value={form.industry} onChange={set('industry')}
                          select fullWidth size="small" sx={fieldSx}
                        >
                          <MenuItem value="">
                            <em>{t('employer.setup.selectIndustry')}</em>
                          </MenuItem>
                          {INDUSTRIES.map((ind) => (
                            <MenuItem key={ind.value} value={ind.value}>{ind[lang]}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t('employer.setup.companySize')}
                          value={form.companySize} onChange={set('companySize')}
                          select fullWidth size="small" sx={fieldSx}
                        >
                          <MenuItem value="">
                            <em>{t('employer.setup.selectIndustry')}</em>
                          </MenuItem>
                          {COMPANY_SIZES.map((s) => (
                            <MenuItem key={s.value} value={s.value}>{s[lang]}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t('employer.setup.foundedYear')}
                          value={form.foundedYear} onChange={set('foundedYear')}
                          select fullWidth size="small" sx={fieldSx}
                        >
                          <MenuItem value="">
                            <em>{t('employer.setup.selectIndustry')}</em>
                          </MenuItem>
                          {Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i).map((y) => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t('employer.setup.website')}
                          value={form.website} onChange={set('website')}
                          fullWidth size="small" placeholder="https://" sx={fieldSx}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      label={t('employer.setup.contactEmail')}
                      value={form.contactEmail} onChange={set('contactEmail')}
                      fullWidth size="small" type="email" sx={fieldSx}
                    />
                  </Stack>
                </Box>
              )}

              {/* Step 1: Location */}
              {step === 1 && (
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {t('employer.setup.locationTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('employer.setup.locationDesc')}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch', flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Left: Info + Fields */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 380px' }, minWidth: 0 }}>
                      {/* Step 0 summary */}
                      <Box sx={{
                        p: 1.5, borderRadius: 1, mb: 2,
                        border: '1px solid', borderColor: 'divider',
                        bgcolor: alpha('#3D1C6E', 0.03),
                      }}>
                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t('employer.setup.companyInfoSummary')}
                        </Typography>
                        <Stack spacing={0.75}>
                          {[
                            { label: t('employer.setup.name'), value: form.name },
                            { label: t('employer.setup.industry'), value: form.industry ? INDUSTRIES.find((i) => i.value === form.industry)?.[lang] : '—' },
                            { label: t('employer.setup.size'), value: form.companySize ? COMPANY_SIZES.find((s) => s.value === form.companySize)?.[lang] : '—' },
                          ].map((item, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                              <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '60%', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                                {item.value || '—'}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* Location fields */}
                      <Stack spacing={1.75}>
                        <Autocomplete
                          freeSolo
                          options={COUNTRIES.map((c) => lang === 'ar' ? c.ar : c.en)}
                          inputValue={form.location.country}
                          onInputChange={(_, v) => {
                            setForm((p) => ({ ...p, location: { ...p.location, country: v, city: '' } }))
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label={t('employer.setup.country')} size="small" sx={fieldSx} />
                          )}
                          size="small"
                        />
                        <Autocomplete
                          freeSolo
                          options={selectedCountry?.cities?.map((c) => lang === 'ar' ? c.ar : c.en) || []}
                          inputValue={form.location.city}
                          onInputChange={(_, v) => {
                            setForm((p) => ({ ...p, location: { ...p.location, city: v } }))
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label={t('employer.setup.city')} size="small" sx={fieldSx} />
                          )}
                          size="small"
                        />
                        <TextField
                          label={t('employer.setup.street')}
                          value={form.location.street}
                          onChange={setLocationField('street')}
                          fullWidth size="small" sx={fieldSx}
                        />
                        <TextField
                          label={t('employer.setup.buildingNumber')}
                          value={form.location.buildingNumber}
                          onChange={setLocationField('buildingNumber')}
                          fullWidth size="small" sx={fieldSx}
                        />
                        {(() => {
                          const parsed = extractCoordinates(form.location.coordinates)
                          if (!parsed) return null
                          return (
                            <Stack direction="row" spacing={1}>
                              <Chip
                                icon={<LocationOnOutlined sx={{ fontSize: 14 }} />}
                                label={`Lat: ${parsed[1].toFixed(6)}`}
                                size="small" variant="outlined"
                                sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                              />
                              <Chip
                                icon={<LocationOnOutlined sx={{ fontSize: 14 }} />}
                                label={`Lng: ${parsed[0].toFixed(6)}`}
                                size="small" variant="outlined"
                                sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                              />
                            </Stack>
                          )
                        })()}
                      </Stack>
                    </Box>

                    {/* Right: Map */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                        {t('employer.setup.clickMap')}
                      </Typography>
                      <LocationMap
                        coordinates={form.location.coordinates}
                        onCoordinatesChange={handleCoordinatesChange}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {t('employer.setup.docsTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('employer.setup.docsDesc', { max: MAX_DOCS })}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  <Box
                    sx={{
                      border: '2px dashed', borderColor: 'divider', borderRadius: 1,
                      p: { xs: 3, md: 4 }, textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s ease', bgcolor: alpha('#3D1C6E', 0.02),
                      mb: 2.5,
                      '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#3D1C6E', 0.05) },
                    }}
                    component="label"
                  >
                    <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleDocAdd} />
                    <CloudUploadOutlined sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {t('employer.setup.clickToSelect')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      PDF, JPG, PNG — {t('employer.setup.fileLimit')}
                    </Typography>
                  </Box>

                  {documents.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(documents.length / MAX_DOCS) * 100}
                          sx={{ flex: 1, borderRadius: 5, height: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {documents.length}/{MAX_DOCS}
                        </Typography>
                      </Box>
                      <Stack spacing={1}>
                        {documents.map((doc, i) => (
                          <Fade in key={i} timeout={300}>
                            <Stack direction="row" spacing={1} sx={{
                              alignItems: 'center', p: 1, borderRadius: 1,
                              border: '1px solid', borderColor: 'divider',
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: alpha('#3D1C6E', 0.02) },
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
                    </Box>
                  )}

                  {documents.length === 0 && (
                    <Box sx={{ p: 3, borderRadius: 1, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: alpha('#3D1C6E', 0.02) }}>
                      <DescriptionOutlined sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
                      <Typography variant="body2" color="text.disabled">
                        {t('employer.setup.noDocuments')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>

            {/* Navigation */}
            <Stack direction="row" sx={{ mt: 2.5, justifyContent: 'space-between' }}>
              <Button
                variant="text"
                disabled={step === 0}
                onClick={() => handleStep('backward')}
                startIcon={<ArrowBackOutlined />}
                sx={{ color: 'text.secondary', fontWeight: 600, '&:disabled': { opacity: 0.3 } }}
              >
                {t('employer.setup.back')}
              </Button>
              {step < 2 ? (
                <Button
                  variant="contained"
                  onClick={() => handleStep('forward')}
                  endIcon={<ArrowForwardOutlined />}
                  disabled={!stepValidation[step]}
                  sx={{
                    px: 4, fontWeight: 600, borderRadius: 1,
                    '&:hover': { boxShadow: '0 4px 16px rgba(61,28,110,0.25)' },
                  }}
                >
                  {t('employer.setup.next')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !form.name.trim()}
                  sx={{
                    px: 4, fontWeight: 600, borderRadius: 1,
                    '&:hover': { boxShadow: '0 4px 16px rgba(61,28,110,0.25)' },
                    '&:disabled': { bgcolor: '#B5AECB' },
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: 'white' }} />
                    : (t('employer.setup.submit'))}
                </Button>
              )}
            </Stack>
          </Box>
        </Fade>
        )}
      </Container>
    </Box>
  )
}
