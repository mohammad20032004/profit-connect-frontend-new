import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha, Divider,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  BusinessOutlined, PeopleOutlined, StarOutlineOutlined, EditOutlined,
  CheckCircleOutlineOutlined, PendingOutlined, CancelOutlined, TrendingUpOutlined,
  RocketLaunchOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompany, getReputationScore } from '@/services/employerService'

const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: <PendingOutlined />, en: 'Pending Review', ar: 'قيد المراجعة' },
  Approved: { color: 'success', icon: <CheckCircleOutlineOutlined />, en: 'Approved', ar: 'معتمدة' },
  Rejected: { color: 'error', icon: <CancelOutlined />, en: 'Rejected', ar: 'مرفوضة' },
}

export default function EmployerDashboard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const [company, setCompany] = useState(null)
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const [companyRes, repRes] = await Promise.allSettled([
        getMyCompany(),
        getReputationScore(),
      ])
      if (companyRes.status === 'fulfilled' && companyRes.value?.success) {
        setCompany(companyRes.value.data)
      }
      if (repRes.status === 'fulfilled' && repRes.value?.success) {
        setReputation(repRes.value.data)
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={() => fetchData()}>{t('companies.retry', 'Retry')}</Button>
      </Container>
    )
  }

  if (!company) {
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
            <Typography variant="h5" fontWeight="bold">
              {lang === 'ar' ? 'لم تنشئ صفحة شركة بعد' : 'No company page yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
              {lang === 'ar'
                ? 'أنشئ صفحة شركتك لإظهارها للمتقدمين.'
                : 'Create your company page to showcase it to candidates.'}
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/employer/setup')} sx={{ px: 4 }}>
              {lang === 'ar' ? 'إنشاء صفحة الشركة' : 'Create Company Page'}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  const status = STATUS_CONFIG[company.status] || STATUS_CONFIG.Pending

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Typography>
            <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => navigate('/settings')}>
              {lang === 'ar' ? 'تعديل الملف' : 'Edit Profile'}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar src={company.logo} sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
              {company.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight="bold" noWrap>{company.name}</Typography>
              <Chip
                icon={status.icon}
                label={status[lang]}
                size="small"
                color={status.color}
                sx={{ mt: 0.3, fontWeight: 600 }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Paper sx={{
              flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center',
              border: '1px solid', borderColor: 'divider',
            }}>
              <PeopleOutlined sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight="bold">{company.followersCount ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                {lang === 'ar' ? 'المتابعون' : 'Followers'}
              </Typography>
            </Paper>

            <Paper sx={{
              flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center',
              border: '1px solid', borderColor: 'divider',
            }}>
              <StarOutlineOutlined sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight="bold">{reputation?.score ?? '—'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {lang === 'ar' ? 'نقاط السمعة' : 'R-Score'}
              </Typography>
            </Paper>

            <Paper sx={{
              flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center',
              border: '1px solid', borderColor: 'divider',
            }}>
              <TrendingUpOutlined sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight="bold">{reputation?.level || '—'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {lang === 'ar' ? 'المستوى' : 'Level'}
              </Typography>
            </Paper>
          </Stack>

          {company.status === 'Pending' && (
            <Paper sx={{
              p: 2.5, borderRadius: 3,
              bgcolor: alpha('#F59E0B', 0.06),
              border: '1px solid', borderColor: alpha('#F59E0B', 0.2),
            }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <PendingOutlined sx={{ color: 'warning.main', fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {lang === 'ar' ? 'طلبك قيد المراجعة' : 'Your application is under review'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lang === 'ar'
                      ? 'سيتم مراجعة طلبك من قبل فريق الدعم قريباً.'
                      : 'Your application will be reviewed by our support team soon.'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {company.status === 'Rejected' && company.rejectionReason && (
            <Paper sx={{
              p: 2.5, borderRadius: 3,
              bgcolor: alpha('#DC2626', 0.06),
              border: '1px solid', borderColor: alpha('#DC2626', 0.2),
            }}>
              <Typography variant="body2" fontWeight={600} color="error">
                {lang === 'ar' ? 'سبب الرفض:' : 'Rejection reason:'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {company.rejectionReason}
              </Typography>
            </Paper>
          )}

          {company.status === 'Approved' && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate(`/companies/${company._id}`)}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {lang === 'ar' ? 'عرض صفحة الشركة' : 'View Company Page'}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
