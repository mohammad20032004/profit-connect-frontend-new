import { useState } from 'react'
import {
  Box, Paper, Typography, Stack, alpha, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Avatar, IconButton, Tooltip, LinearProgress, useMediaQuery,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AddOutlined, FlagOutlined, DeleteOutlined, EditOutlined,
  CalendarMonthOutlined, NotesOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField, Select, Slider } from '@/ui'
import ProjectDatePicker from '@/features/projects/create/components/ProjectDatePicker'
import { createMilestone, updateMilestone, deleteMilestone } from '@/services/projectService'
import { SectionHeader, StatusChip } from './ManageShared'
import { COLORS, formatDate } from './manageConstants'
import { scaleIn, staggerContainer } from '@/utils/animations'

const MILESTONE_STATUS = {
  NotStarted: { color: '#9E96B5' },
  InProgress: { color: COLORS.primary },
  Completed: { color: COLORS.success },
}

function emptyForm() {
  return { title: '', description: '', startDate: '', endDate: '', assignedTo: '', status: 'NotStarted', progress: 0 }
}

export default function MilestonesTab({ id, overview, onChanged }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const milestones = overview.milestones || []
  const team = overview.team || []

  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm())
    setError('')
    setDialog(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      title: m.title || '',
      description: m.description || '',
      startDate: m.startDate ? m.startDate.split('T')[0] : '',
      endDate: m.endDate ? m.endDate.split('T')[0] : '',
      assignedTo: m.assignedTo?._id || m.assignedTo || '',
      status: m.status || 'NotStarted',
      progress: m.progress ?? 0,
    })
    setError('')
    setDialog(true)
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError(t('manage.fillRequired', 'Please fill in all required fields'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        assignedTo: form.assignedTo || undefined,
        status: form.status,
        progress: Number(form.progress),
      }
      const res = editing
        ? await updateMilestone(id, editing._id, payload)
        : await createMilestone(id, payload)
      if (res?.success) {
        setDialog(false)
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

  const handleDelete = async (m) => {
    if (!window.confirm(t('manage.deleteMilestoneConfirm', 'Delete this milestone?'))) return
    try {
      const res = await deleteMilestone(id, m._id)
      if (res?.success) onChanged()
    } catch { /* ignore */ }
  }

  const memberOptions = team.map((m) => {
    const user = m.freelancer || {}
    const prof = user.profile || {}
    const name = [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.email || m._id
    return { value: user._id || m.freelancer?._id, label: name }
  }).filter((o) => o.value)

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <SectionHeader icon={<FlagOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.milestonesCount', 'Milestones')} />
        <Button size="small" variant="contained" onClick={openAdd} startIcon={<AddOutlined />}>
          {t('manage.addMilestone', 'Add Milestone')}
        </Button>
      </Stack>

      {milestones.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, borderStyle: 'dashed' }}>
          <FlagOutlined sx={{ fontSize: 44, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
          <Typography color="text.secondary">{t('manage.noMilestones', 'No milestones yet')}</Typography>
        </Paper>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}>
          <Box sx={{ position: 'relative', pl: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{
              position: 'absolute', left: { xs: 7, sm: 9 }, top: 0, bottom: 0, width: 3, borderRadius: 20,
              background: 'linear-gradient(180deg, #E4DCF2, #C4BBD9)',
            }} />
            <Stack spacing={2}>
              <AnimatePresence>
                {milestones.map((m, i) => {
                  const cfg = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.NotStarted
                  const assigned = m.assignedTo || {}
                  const prof = assigned.profile || {}
                  const assignedName = [prof.firstName, prof.lastName].filter(Boolean).join(' ') || assigned.email || 'â€”'
                  return (
                    <motion.div
                      key={m._id}
                      custom={i}
                      variants={scaleIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      layout
                    >
                      <Paper variant="outlined" sx={{
                        p: 2, borderRadius: 1.5, position: 'relative',
                        borderColor: m.status === 'Completed' ? alpha(COLORS.success, 0.35) : 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(theme.palette.primary.main, 0.3) },
                      }}>
                        <Box sx={{
                          position: 'absolute', left: { xs: -20, sm: -26 }, top: 26, transform: 'translateX(-50%)',
                          width: 16, height: 16, borderRadius: '50%',
                          bgcolor: cfg.color, border: '3px solid #fff', boxShadow: `0 0 0 2px ${alpha(cfg.color, 0.3)}`,
                          zIndex: 1,
                        }} />
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                              <Typography variant="body1" fontWeight={700}>{m.title}</Typography>
                              <StatusChip status={m.status} config={Object.fromEntries(
                                Object.entries(MILESTONE_STATUS).map(([k, v]) => [k, { label: t(`manage.msStatus.${k}`, k), color: v.color }]),
                              )} />
                            </Stack>
                            {m.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                <NotesOutlined sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.5 }} />
                                {m.description}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <CalendarMonthOutlined sx={{ fontSize: 15, color: '#5C5580' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(m.startDate, lang)} â€” {formatDate(m.endDate, lang)}
                                </Typography>
                              </Stack>
                              {m.assignedTo && (
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                  <Avatar src={prof.avatar} sx={{ width: 20, height: 20, fontSize: '0.6rem' }}>{assignedName.charAt(0)}</Avatar>
                                  <Typography variant="caption" color="text.secondary">{assignedName}</Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title={t('manage.edit', 'Edit')}>
                              <IconButton size="small" onClick={() => openEdit(m)}>
                                <EditOutlined sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('manage.delete', 'Delete')}>
                              <IconButton size="small" color="error" onClick={() => handleDelete(m)}>
                                <DeleteOutlined sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                        <Box sx={{ mt: 1.25 }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{t('manage.progress', 'Progress')}</Typography>
                            <Typography variant="caption" fontWeight={700}>{m.progress ?? 0}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={m.progress ?? 0}
                            sx={{ height: 7, '& .MuiLinearProgress-bar': { bgcolor: m.status === 'Completed' ? COLORS.success : cfg.color } }} />
                        </Box>
                      </Paper>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </Stack>
          </Box>
        </motion.div>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: 620 } }}>
        <DialogTitle>
          {editing ? t('manage.editMilestone', 'Edit Milestone') : t('manage.addMilestone', 'Add Milestone')}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label={t('manage.title', 'Title')} value={form.title} onChange={set('title')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label={t('manage.description', 'Description')} value={form.description} onChange={set('description')} multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ProjectDatePicker label={t('manage.startDate', 'Start Date')} value={form.startDate} onChange={set('startDate')} t={t} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ProjectDatePicker label={t('manage.endDate', 'End Date')} value={form.endDate} onChange={set('endDate')} t={t} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select label={t('manage.assignedTo', 'Assigned To')} value={form.assignedTo} onChange={set('assignedTo')} options={memberOptions} placeholder={t('manage.selectMember', 'Select member')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select label={t('manage.status', 'Status')} value={form.status} onChange={set('status')}
                options={['NotStarted', 'InProgress', 'Completed'].map((s) => ({ value: s, label: t(`manage.msStatus.${s}`, s) }))} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">{t('manage.progress', 'Progress')}: <strong>{form.progress}%</strong></Typography>
                <Slider value={Number(form.progress) || 0} onChange={(e, v) => setForm((prev) => ({ ...prev, progress: v }))} valueLabelDisplay="auto" />
              </Stack>
            </Grid>
          </Grid>
          {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDialog(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {editing ? t('manage.save', 'Save') : t('manage.add', 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
