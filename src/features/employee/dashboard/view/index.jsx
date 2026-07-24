import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha,
  Fade, Divider,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  WorkOutlineOutlined, ContentPasteOutlined, AnalyticsOutlined,
  TrendingUpOutlined, BusinessOutlined, AddOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getMyCompanyInfo, getEmployeeStats } from '@/services/employeeService'

export default function EmployeeDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const empProfile = user?.companyEmployeeProfile || {}
  const [companyInfo, setCompanyInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [compRes, statsRes] = await Promise.allSettled([
        getMyCompanyInfo(),
        empProfile.permissions?.canViewAnalytics ? getEmployeeStats() : Promise.resolve(null),
      ])
      if (compRes.status === 'fulfilled' && compRes.value?.success) {
        setCompanyInfo(compRes.value.data)
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [empProfile.permissions?.canViewAnalytics])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  const company = companyInfo?.company
  const permissions = empProfile.permissions || {}
  const permList = [
    { key: 'canPostJobs', icon: <WorkOutlineOutlined sx={{ fontSize: 18 }} /> },
    { key: 'canManageApplicants', icon: <ContentPasteOutlined sx={{ fontSize: 18 }} /> },
    { key: 'canViewAnalytics', icon: <AnalyticsOutlined sx={{ fontSize: 18 }} /> },
  ]

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {/* Welcome */}
          <Fade in timeout={400}>
            <Typography variant="h5" fontWeight="bold">
              {t('employeeDashboard.welcome', { name: user?.profile?.firstName || '' })}
            </Typography>
          </Fade>

          {/* Company Identity */}
          {company && (
            <Fade in timeout={500}>
              <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar src={company.logo} sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontSize: 20 }}>
                    {company.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>{company.name}</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip label={empProfile.position} size="small" color="primary" sx={{ fontWeight: 600 }} />
                      <Chip icon={<BusinessOutlined sx={{ fontSize: 14 }} />} label={company.industry || '—'} size="small" variant="outlined" />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Permissions */}
          <Fade in timeout={600}>
            <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('employeeDashboard.yourPermissions')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {permList.map((p) => (
                  <Chip
                    key={p.key}
                    icon={p.icon}
                    label={t(`employees.${p.key}`)}
                    size="small"
                    color={permissions[p.key] ? 'primary' : 'default'}
                    variant={permissions[p.key] ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Fade>

          {/* Stats (if canViewAnalytics) */}
          {permissions.canViewAnalytics && stats && (
            <Fade in timeout={700}>
              <Stack direction="row" spacing={1.5}>
                {[
                  { label: t('employeeDashboard.totalJobs'), value: stats.totalJobs ?? 0, color: 'primary.main' },
                  { label: t('employeeDashboard.openJobs'), value: stats.openJobs ?? 0, color: 'success.main' },
                  { label: t('employeeDashboard.totalApplicants'), value: stats.totalApplicants ?? 0, color: 'warning.main' },
                ].map((s) => (
                  <Paper key={s.label} sx={{
                    flex: 1, p: 2, borderRadius: 1.5, textAlign: 'center',
                    border: '1px solid', borderColor: 'divider',
                  }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Fade>
          )}

          {/* Actions */}
          <Fade in timeout={800}>
            <Stack spacing={1.5}>
              {permissions.canPostJobs && (
                <Button variant="contained" fullWidth startIcon={<AddOutlined />}
                  onClick={() => navigate('/employee/jobs/create')}>
                  {t('employeeDashboard.postNewJob')}
                </Button>
              )}
              {(permissions.canPostJobs || permissions.canManageApplicants) && (
                <Button variant="outlined" fullWidth startIcon={<WorkOutlineOutlined />}
                  onClick={() => navigate('/employee/jobs')}>
                  {t('employeeDashboard.manageJobs')}
                </Button>
              )}
            </Stack>
          </Fade>
        </Stack>
      </Container>
    </Box>
  )
}
