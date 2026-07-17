import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, Avatar, Chip, Divider, CircularProgress, alpha,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  BusinessOutlined, LocationOnOutlined, LanguageOutlined, GroupsOutlined,
  CalendarMonthOutlined, RocketLaunchOutlined, ArrowForwardOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getProfile } from '@/services/employerService'
import { setAuthData } from '@/redux/slices/userSlice'

export default function EmployerWelcome() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => s.user.user)
  const [loading, setLoading] = useState(true)
  const profile = user?.employerProfile || {}

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        const data = res?.data || res
        if (data) {
          const token = localStorage.getItem('profit_connect_token')
          dispatch(setAuthData({ token, user: data }))
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchProfile()
  }, [dispatch])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  const fields = [
    { key: 'companyName', icon: <BusinessOutlined />, label: { en: 'Company Name', ar: 'اسم الشركة' }, value: profile.companyName },
    { key: 'companyDescription', icon: <BusinessOutlined />, label: { en: 'Description', ar: 'الوصف' }, value: profile.companyDescription },
    { key: 'companyIndustry', icon: <BusinessOutlined />, label: { en: 'Industry', ar: 'المجال' }, value: profile.companyIndustry },
    { key: 'companyLocation', icon: <LocationOnOutlined />, label: { en: 'Location', ar: 'الموقع' }, value: profile.companyLocation },
    { key: 'website', icon: <LanguageOutlined />, label: { en: 'Website', ar: 'الموقع الإلكتروني' }, value: profile.website },
    { key: 'companySize', icon: <GroupsOutlined />, label: { en: 'Company Size', ar: 'حجم الشركة' }, value: profile.companySize },
    { key: 'foundedYear', icon: <CalendarMonthOutlined />, label: { en: 'Founded Year', ar: 'سنة التأسيس' }, value: profile.foundedYear },
  ]

  const filledFields = fields.filter((f) => f.value)

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha('#3D1C6E', 0.08),
          }}>
            <RocketLaunchOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {lang === 'ar' ? `مرحباً ${user?.profile?.firstName || ''}!` : `Welcome ${user?.profile?.firstName || ''}!`}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              {lang === 'ar'
                ? 'تم إنشاء حسابك بنجاح. يمكنك الآن إنشاء صفحة شركتك للبدء في التوظيف.'
                : 'Your account has been created successfully. You can now set up your company page to start hiring.'}
            </Typography>
          </Box>

          {filledFields.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 520 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                {lang === 'ar' ? 'بيانات شركتك من التسجيل' : 'Your company info from registration'}
              </Typography>
              <Stack spacing={1.5}>
                {fields.map((field) => (
                  <Stack key={field.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      {field.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {field.label[lang]}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {field.value || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}

          <Paper sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 520, border: '1px dashed', borderColor: 'divider' }}>
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {lang === 'ar'
                  ? 'أنشئ صفحة شركتك لإظهارها للمتقدمين والشركاء المحتملين.'
                  : 'Create your company page to showcase it to potential candidates and partners.'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate('/employer/setup')}
                sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                {lang === 'ar' ? 'أنشئ صفحة شركتك' : 'Create Your Company Page'}
              </Button>
            </Stack>
          </Paper>

          <Button variant="text" onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
            {lang === 'ar' ? 'تخطي، أفعل هذا لاحقاً' : 'Skip, do this later'}
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}
