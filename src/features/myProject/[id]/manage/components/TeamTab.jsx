import { useState } from 'react'
import {
  Box, Paper, Typography, Stack, Grid, Avatar, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, useMediaQuery, alpha,
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  AddOutlined, GroupOutlined, DeleteOutlined, EditOutlined, PersonOutlined,
  VerifiedOutlined, ScheduleOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField, Select } from '@/ui'
import { addTeamMember, updateTeamMember, removeTeamMember } from '@/services/projectService'
import { SectionHeader } from './ManageShared'
import { COLORS, formatDate } from './manageConstants'
import { staggerContainer } from '@/utils/animations'

const TEAM_STATUS = {
  Invited: { color: COLORS.navy },
  Working: { color: COLORS.success },
  Completed: { color: COLORS.purple },
  Removed: { color: COLORS.error },
}

export default function TeamTab({ id, overview, onChanged }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const team = overview.team || []

  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ freelancerId: '', role: '', status: 'Invited' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => {
    setEditing(null)
    setForm({ freelancerId: '', role: '', status: 'Invited' })
    setError('')
    setDialog(true)
  }

  const openEdit = (m) => {
    const user = m.freelancer || {}
    setEditing(m)
    setForm({ freelancerId: user._id || '', role: m.role || '', status: m.status || 'Invited' })
    setError('')
    setDialog(true)
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  const handleSave = async () => {
    if (editing && !form.role.trim()) {
      setError(t('manage.fillRequired', 'Please fill in all required fields'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { role: form.role.trim(), status: form.status }
      if (!editing) {
        if (!form.freelancerId.trim()) {
          setSaving(false)
          setError(t('manage.requireFreelancer', 'Freelancer ID is required'))
          return
        }
        payload.freelancerId = form.freelancerId.trim()
      }
      const res = editing
        ? await updateTeamMember(id, editing._id, payload)
        : await addTeamMember(id, payload)
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

  const handleRemove = async (m) => {
    if (!window.confirm(t('manage.removeMemberConfirm', 'Remove this member from the team?'))) return
    try {
      const res = await removeTeamMember(id, m._id)
      if (res?.success) onChanged()
    } catch { /* ignore */ }
  }

  const nameOf = (m) => {
    const user = m.freelancer || {}
    const prof = user.profile || {}
    return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.email || t('manage.anonymous', 'Anonymous')
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <SectionHeader icon={<GroupOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.team', 'Team')} />
        <Button size="small" variant="contained" onClick={openAdd} startIcon={<AddOutlined />}>
          {t('manage.addMember', 'Add Member')}
        </Button>
      </Stack>

      {team.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, borderStyle: 'dashed' }}>
          <PersonOutlined sx={{ fontSize: 44, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
          <Typography color="text.secondary">{t('manage.noTeam', 'No team members yet')}</Typography>
        </Paper>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Grid container spacing={2}>
            {team.map((m, i) => {
              const user = m.freelancer || {}
              const prof = user.profile || {}
              const name = nameOf(m)
              const cfg = TEAM_STATUS[m.status] || TEAM_STATUS.Invited
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={m._id}>
                  <motion.div
                    custom={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(31,10,59,0.1)' }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                  >
                    <Paper sx={{ p: 2, borderRadius: 1.5, height: '100%', position: 'relative', transition: 'border-color 0.2s' }}>
                      <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Tooltip title={t('manage.edit', 'Edit')}>
                          <IconButton size="small" onClick={() => openEdit(m)}>
                            <EditOutlined sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('manage.remove', 'Remove')}>
                          <IconButton size="small" color="error" onClick={() => handleRemove(m)}>
                            <DeleteOutlined sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar src={prof.avatar} sx={{ width: 48, height: 48 }}>{name.charAt(0)}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" fontWeight={700} noWrap>{name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{prof.headline || user.email || ''}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 2 }}>
                        <Chip label={m.role || t('manage.noRole', 'No role')} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }} />
                        <Chip label={t(`manage.teamStatus.${m.status}`, m.status)} size="small"
                          sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, color: cfg.color,my:1, bgcolor: alpha(cfg.color, 0.1) }} />
                      </Stack>
                      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <ScheduleOutlined sx={{ fontSize: 14, color: '#9E96B5' }} />
                          <Typography variant="caption" color="text.secondary">
                            {t('manage.joinedAt', 'Joined')}: {formatDate(m.joinedAt, lang)}
                          </Typography>
                        </Stack>
                        {m.proposalId && (
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <VerifiedOutlined sx={{ fontSize: 14, color: COLORS.success }} />
                            <Typography variant="caption" color="success.main">{t('manage.fromProposal', 'Hired via proposal')}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        </motion.div>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: 480 } }}>
        <DialogTitle>
          {editing ? t('manage.editMember', 'Edit Team Member') : t('manage.addMember', 'Add Team Member')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {!editing && (
              <TextField label={t('manage.freelancerId', 'Freelancer User ID')} value={form.freelancerId} onChange={set('freelancerId')}
                helperText={t('manage.freelancerIdHelp', 'Paste the user ID of the freelancer to add')} />
            )}
            <TextField label={t('manage.role', 'Role')} value={form.role} onChange={set('role')} placeholder={t('manage.rolePlaceholder', 'e.g. Backend Developer')} />
            <Select label={t('manage.status', 'Status')} value={form.status} onChange={set('status')}
              options={['Invited', 'Working', 'Completed', 'Removed'].map((s) => ({ value: s, label: t(`manage.teamStatus.${s}`, s) }))} />
          </Stack>
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
