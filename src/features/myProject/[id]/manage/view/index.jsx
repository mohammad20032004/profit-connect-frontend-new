import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, CircularProgress, Chip, Tabs, Tab, Snackbar, Alert,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowBackOutlined, DashboardOutlined, FlagOutlined, GroupOutlined,
  PaymentsOutlined, SettingsOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { getProjectOverview } from '@/services/projectService'
import OverviewTab from '../components/OverviewTab'
import MilestonesTab from '../components/MilestonesTab'
import TeamTab from '../components/TeamTab'
import PaymentsTab from '../components/PaymentsTab'
import SettingsTab from '../components/SettingsTab'

const statusColors = { Open: 'success', InProgress: 'info', Completed: 'default', Cancelled: 'error' }

export default function ManageProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState({ open: false, severity: 'success', msg: '' })

  const fetchOverview = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const res = await getProjectOverview(id)
      if (res?.success) {
        setOverview(res.data)
      } else {
        if (showLoader) setError(res?.message || t('common.error'))
      }
    } catch (err) {
      if (showLoader) setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [id, t])

  useEffect(() => { fetchOverview() }, [fetchOverview])

  const handleChanged = useCallback((msg) => {
    if (msg) setToast({ open: true, severity: 'success', msg })
    fetchOverview(false)
  }, [fetchOverview])

  const TAB_ITEMS = [
    { label: t('manage.tabOverview', 'Overview'), icon: <DashboardOutlined sx={{ fontSize: 18 }} /> },
    { label: t('manage.tabMilestones', 'Timeline'), icon: <FlagOutlined sx={{ fontSize: 18 }} /> },
    { label: t('manage.tabTeam', 'Team'), icon: <GroupOutlined sx={{ fontSize: 18 }} /> },
    { label: t('manage.tabPayments', 'Payments'), icon: <PaymentsOutlined sx={{ fontSize: 18 }} /> },
    { label: t('manage.tabSettings', 'Settings'), icon: <SettingsOutlined sx={{ fontSize: 18 }} /> },
  ]

  if (error) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <Typography color="error">{error}</Typography>
      <Button variant="outlined" onClick={() => fetchOverview()}>{t('projects.retry', 'Retry')}</Button>
      <Button variant="text" onClick={() => navigate(`/myProject/${id}`)}>{t('manage.backToProject', 'Back to Project')}</Button>
    </Box>
  )
  if (loading || !overview) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
        <CircularProgress />
      </motion.div>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Paper sx={{ p: 2, borderRadius: 3, mb: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 6px 20px rgba(31,10,59,0.04)' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="text" onClick={() => navigate(`/myProject/${id}`)} sx={{ minWidth: 0, p: 0.5 }}><ArrowBackOutlined /></Button>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight="bold" noWrap>{overview.title}</Typography>
              <Typography variant="caption" color="text.secondary">{t('manage.title', 'Project Management')} • {t(`projects.categoryOptions.${overview.category}`, overview.category)}</Typography>
            </Box>
            <Chip label={t(`projects.statusOptions.${overview.status}`, overview.status)} color={statusColors[overview.status] || 'default'} size="small" />
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mt: 1.5, borderTop: '1px solid', borderTopColor: 'divider', pt: 1,
              '& .MuiTab-root': { minHeight: 42, px: { xs: 1.5, sm: 2 } },
            }}
          >
            {TAB_ITEMS.map((item, i) => (
              <Tab key={i} icon={item.icon} iconPosition="start" label={item.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {tab === 0 && <OverviewTab overview={overview} />}
            {tab === 1 && <MilestonesTab id={id} overview={overview} onChanged={() => handleChanged(t('manage.milestonesSaved', 'Milestones updated'))} />}
            {tab === 2 && <TeamTab id={id} overview={overview} onChanged={() => handleChanged(t('manage.teamSaved', 'Team updated'))} />}
            {tab === 3 && <PaymentsTab id={id} overview={overview} onChanged={() => handleChanged(t('manage.paymentsSaved', 'Payments updated'))} />}
            {tab === 4 && <SettingsTab id={id} overview={overview} onChanged={() => handleChanged(t('manage.settingsSaved', 'Settings saved'))} />}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: 2, alignItems: 'center' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
