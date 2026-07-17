import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, alpha, Skeleton,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  PendingOutlined, CheckCircleOutlineOutlined, CancelOutlined,
  RefreshOutlined, DashboardOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompany } from '@/services/employerService'

const POLL_INTERVAL = 60000

export default function EmployerPending() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(true)

  const fetchStatus = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const res = await getMyCompany()
      if (res?.success) {
        setCompany(res.data)
        if (res.data.status !== 'Pending') {
          setPolling(false)
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!polling) return
    const interval = setInterval(() => fetchStatus(false), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [polling, fetchStatus])

  const status = company?.status || 'Pending'
  const isApproved = status === 'Approved'
  const isRejected = status === 'Rejected'

  const StatusIcon = isApproved
    ? <CheckCircleOutlineOutlined sx={{ fontSize: 72, color: 'success.main' }} />
    : isRejected
      ? <CancelOutlined sx={{ fontSize: 72, color: 'error.main' }} />
      : <PendingOutlined sx={{ fontSize: 72, color: 'warning.main' }} />

  const statusColor = isApproved ? 'success' : isRejected ? 'error' : 'warning'
  const statusText = {
    Pending: { en: 'Under Review', ar: 'قيد المراجعة' },
    Approved: { en: 'Approved', ar: 'تم الاعتماد' },
    Rejected: { en: 'Rejected', ar: 'مرفوض' },
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          {loading ? (
            <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
              <Skeleton variant="circular" width={72} height={72} />
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : (
            <>
              {StatusIcon}

              <Paper sx={{
                px: 3, py: 1.5, borderRadius: 10,
                bgcolor: alpha(`#${statusColor === 'success' ? '16A34A' : statusColor === 'error' ? 'DC2626' : 'F59E0B'}`, 0.1),
                border: `1px solid`, borderColor: alpha(`#${statusColor === 'success' ? '16A34A' : statusColor === 'error' ? 'DC2626' : 'F59E0B'}`, 0.25),
              }}>
                <Typography variant="body2" fontWeight={700} color={`${statusColor}.main`}>
                  {statusText[status]?.[lang] || status}
                </Typography>
              </Paper>

              <Typography variant="h5" fontWeight="bold" sx={{ textAlign: 'center' }}>
                {isApproved
                  ? (lang === 'ar' ? 'تم اعتماد شركتك!' : 'Your company has been approved!')
                  : isRejected
                    ? (lang === 'ar' ? 'تم رفض طلبك' : 'Your application was rejected')
                    : (lang === 'ar' ? 'طلبك قيد المراجعة' : 'Your application is under review')}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                {isApproved
                  ? (lang === 'ar' ? 'يمكنك الآن الوصول إلى لوحة التحكم وإدارة صفحتك.' : 'You can now access the dashboard and manage your page.')
                  : isRejected
                    ? (lang === 'ar'
                      ? `السبب: ${company?.rejectionReason || 'غير محدد'}. يمكنك تعديل البيانات وإعادة الإرسال.`
                      : `Reason: ${company?.rejectionReason || 'Not specified'}. You can edit your info and resubmit.`)
                    : (lang === 'ar'
                      ? 'نراجع طلبك حالياً. سيتم إشعارك عند اكتمال المراجعة.'
                      : 'We are currently reviewing your application. You will be notified when it is complete.')}
              </Typography>

              {polling && !isApproved && !isRejected && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">
                    {lang === 'ar' ? 'جاري التحقق تلقائياً...' : 'Auto-checking...'}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={1.5}>
                {isApproved && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DashboardOutlined />}
                    onClick={() => navigate('/employer/dashboard')}
                    sx={{ px: 4 }}
                  >
                    {lang === 'ar' ? 'لوحة التحكم' : 'Go to Dashboard'}
                  </Button>
                )}
                {isRejected && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/employer/setup')}
                    sx={{ px: 4 }}
                  >
                    {lang === 'ar' ? 'تعديل وإعادة الإرسال' : 'Edit & Resubmit'}
                  </Button>
                )}
                {!isApproved && !isRejected && (
                  <Button
                    variant="outlined"
                    startIcon={<RefreshOutlined />}
                    onClick={() => fetchStatus()}
                  >
                    {lang === 'ar' ? 'تحقق الآن' : 'Check Now'}
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
