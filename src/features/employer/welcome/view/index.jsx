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
  PendingOutlined, CheckCircleOutlineOutlined, CancelOutlined,
  DashboardOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getProfile, getMyCompany } from '@/services/employerService'
import { setAuthData } from '@/redux/slices/userSlice'

const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: <PendingOutlined /> },
  Approved: { color: 'success', icon: <CheckCircleOutlineOutlined /> },
  Rejected: { color: 'error', icon: <CancelOutlined /> },
}

const STATUS_MESSAGES = {
  Pending: 'employer.welcome.pendingMsg',
  Approved: 'employer.welcome.approvedMsg',
  Rejected: 'employer.welcome.rejectedMsg',
}

export default function EmployerWelcome() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => s.user.user)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(user?.company || null)
  const profile = user?.employerProfile || {}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, companyRes] = await Promise.allSettled([
          getProfile(),
          getMyCompany(),
        ])
        if (profileRes.status === 'fulfilled') {
          const data = profileRes.value?.data || profileRes.value
          if (data) {
            const token = localStorage.getItem('profit_connect_token')
            dispatch(setAuthData({ token, user: data }))
          }
        }
        if (companyRes.status === 'fulfilled' && companyRes.value?.success && companyRes.value?.data) {
          setCompany(companyRes.value.data)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [dispatch])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (company) {
    const status = STATUS_CONFIG[company.status] || STATUS_CONFIG.Pending
    const statusKey = company.status?.toLowerCase() || 'pending'

    return (
      <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha('#3D1C6E', 0.08),
            }}>
              <BusinessOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {t('employer.welcome.greeting', { name: user?.profile?.firstName || '' })}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                {t('employer.welcome.hasCompany')}
              </Typography>
            </Box>

            <Paper sx={{
              p: 3, borderRadius: 2, width: '100%', maxWidth: 480,
              border: '1px solid', borderColor: 'divider',
            }}>
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                <Chip
                  icon={status.icon}
                  label={t(`employer.status.${statusKey}`)}
                  color={status.color}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t(STATUS_MESSAGES[company.status] || STATUS_MESSAGES.Pending)}
                </Typography>

                {company.status === 'Approved' && (
                  <Button
                    variant="contained"
                    startIcon={<DashboardOutlined />}
                    onClick={() => navigate('/employer/dashboard')}
                    sx={{ px: 4, fontWeight: 700 }}
                  >
                    {t('employer.pending.goToDashboard')}
                  </Button>
                )}
                {company.status === 'Pending' && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/employer/pending')}
                    sx={{ px: 4 }}
                  >
                    {t('employer.pending.checkNow')}
                  </Button>
                )}
                {company.status === 'Rejected' && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/employer/setup')}
                    sx={{ px: 4 }}
                  >
                    {t('employer.pending.editResubmit')}
                  </Button>
                )}
              </Stack>
            </Paper>

            <Button variant="text" onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
              {t('employer.welcome.backToHome')}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  const fields = [
    { key: 'companyName', icon: <BusinessOutlined />, label: t('companies.name'), value: profile.companyName },
    { key: 'companyDescription', icon: <BusinessOutlined />, label: t('companies.description'), value: profile.companyDescription },
    { key: 'companyIndustry', icon: <BusinessOutlined />, label: t('companies.industry'), value: profile.companyIndustry },
    { key: 'companyLocation', icon: <LocationOnOutlined />, label: t('companies.location'), value: profile.companyLocation },
    { key: 'website', icon: <LanguageOutlined />, label: t('companies.website'), value: profile.website },
    { key: 'companySize', icon: <GroupsOutlined />, label: t('companies.companySize'), value: profile.companySize },
    { key: 'foundedYear', icon: <CalendarMonthOutlined />, label: t('companies.foundedYear'), value: profile.foundedYear },
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
              {t('employer.welcome.greeting', { name: user?.profile?.firstName || '' })}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              {t('employer.welcome.companySetupCta')}
            </Typography>
          </Box>

          {filledFields.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 520 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                {t('employer.welcome.companyFromRegistration')}
              </Typography>
              <Stack spacing={1.5}>
                {fields.map((field) => (
                  <Stack key={field.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      {field.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {field.label}
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
                {t('employer.welcome.createPageDesc')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate('/employer/setup')}
                sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                {t('employer.welcome.createYourPage')}
              </Button>
            </Stack>
          </Paper>

          <Button variant="text" onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
            {t('employer.welcome.skip')}
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}
