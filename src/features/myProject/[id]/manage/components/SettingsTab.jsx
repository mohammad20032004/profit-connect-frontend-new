import { useState } from 'react'
import {
  Box, Paper, Typography, Stack, Grid, Chip, alpha, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import {
  SettingsOutlined, SaveOutlined, CalendarMonthOutlined, SpeedOutlined, PaymentsOutlined, TuneOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField, Select, Switch, Slider } from '@/ui'
import ProjectDatePicker from '@/features/projects/create/components/ProjectDatePicker'
import { updateProjectManage } from '@/services/projectService'
import { SectionHeader } from './ManageShared'
import { COLORS, formatDate } from './manageConstants'

const PROJECT_STATUS = {
  Open: COLORS.success,
  InProgress: COLORS.primary,
  Completed: COLORS.purple,
  Cancelled: COLORS.error,
}

export default function SettingsTab({ id, overview, onChanged }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  const [form, setForm] = useState(() => ({
    publishedAt: overview.publishedAt ? overview.publishedAt.split('T')[0] : '',
    startDate: overview.startDate ? overview.startDate.split('T')[0] : '',
    endDate: overview.endDate ? overview.endDate.split('T')[0] : '',
    status: overview.status || 'Open',
    progress: overview.progress ?? 0,
    twoStage: overview.paymentsConfig?.twoStage ?? false,
    installmentsCount: overview.paymentsConfig?.installmentsCount ?? 1,
    totalAmount: overview.paymentsConfig?.totalAmount ?? overview.paymentsSummary?.total ?? 0,
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  const dirty = true

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        publishedAt: form.publishedAt || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        progress: Number(form.progress),
        paymentsConfig: {
          twoStage: form.twoStage,
          installmentsCount: Number(form.installmentsCount) || 1,
          totalAmount: Number(form.totalAmount) || 0,
        },
      }
      const res = await updateProjectManage(id, payload)
      if (res?.success) {
        setConfirmOpen(false)
        onChanged()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const statusColor = PROJECT_STATUS[form.status] || COLORS.primary

  return (
    <Stack spacing={2.5}>
      <SectionHeader icon={<SettingsOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.settings', 'Management Settings')} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 2 }}>
              <CalendarMonthOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>{t('manage.schedule', 'Schedule & Dates')}</Typography>
            </Stack>
            <Stack spacing={2}>
              <ProjectDatePicker label={t('manage.publishedAt', 'Published Date')} value={form.publishedAt} onChange={set('publishedAt')} t={t} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <ProjectDatePicker label={t('manage.startDate', 'Start Date')} value={form.startDate} onChange={set('startDate')} t={t} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <ProjectDatePicker label={t('manage.endDate', 'End Date')} value={form.endDate} onChange={set('endDate')} t={t} />
                </Grid>
              </Grid>
              <Select label={t('manage.status', 'Status')} value={form.status} onChange={set('status')}
                options={['Open', 'InProgress', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: t(`projects.statusOptions.${s}`, s) }))} />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 2 }}>
              <SpeedOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>{t('manage.progress', 'Progress')}</Typography>
            </Stack>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{t('manage.progress', 'Progress')}</Typography>
                  <Chip label={`${form.progress}%`} size="small" sx={{ color: statusColor, bgcolor: alpha(statusColor, 0.1), fontWeight: 700, height: 22 }} />
                </Stack>
                <Slider value={Number(form.progress) || 0} onChange={(e, v) => setForm((prev) => ({ ...prev, progress: v }))} valueLabelDisplay="auto" />
              </Stack>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(COLORS.navy, 0.05), border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manage.autoProgress', 'Progress is auto-calculated as the average of milestones when milestones exist.')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 2 }}>
              <PaymentsOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>{t('manage.paymentsConfig', 'Payments Configuration')}</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Switch label={t('manage.twoStage', 'Two-stage payment')} checked={form.twoStage} onChange={(e) => setForm((prev) => ({ ...prev, twoStage: e.target.checked }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label={t('manage.installmentsCount', 'Installments Count')} type="number" value={form.installmentsCount} onChange={set('installmentsCount')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label={t('manage.totalAmount', 'Total Amount')} type="number" value={form.totalAmount} onChange={set('totalAmount')} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>{error}</Typography>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => setConfirmOpen(true)} startIcon={<SaveOutlined />} disabled={!dirty}>
          {t('manage.saveSettings', 'Save Settings')}
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('manage.confirmSaveTitle', 'Save changes?')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="body2">{t('manage.confirmSaveBody', 'These settings affect the project timeline, progress and payments configuration.')}</Typography>
            {form.startDate && form.endDate && (
              <Typography variant="caption" color="text.secondary">
                {t('manage.dateRange', 'Project Period')}: {formatDate(form.startDate, lang)} â€” {formatDate(form.endDate, lang)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {t('manage.status', 'Status')}: {form.status} â€¢ {t('manage.progress', 'Progress')}: {form.progress}%
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={<TuneOutlined />}>
            {saving ? t('manage.saving', 'Saving...') : t('manage.confirmSave', 'Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
