import React, { useEffect, useState, useCallback } from 'react'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, alpha,
  Fade, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch,
  FormControlLabel, IconButton, Divider, Tooltip,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  GroupAddOutlined, EditOutlined, DeleteOutlineOutlined, PeopleOutlined,
  WorkOutlineOutlined, AnalyticsOutlined, ContentPasteOutlined, Close,
  ContentCopyOutlined, InfoOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getEmployees, addEmployee, updateEmployee, removeEmployee } from '@/services/employeeService'

const PERMISSION_FIELDS = [
  { key: 'canPostJobs', labelEn: 'Post Jobs', labelAr: 'نشر الوظائف', descEn: 'Create and publish job listings', descAr: 'إنشاء ونشر إعلانات التوظيف' },
  { key: 'canManageApplicants', labelEn: 'Manage Applicants', labelAr: 'إدارة المتقدمين', descEn: 'View and update applicant status', descAr: 'عرض وتحديث حالة المتقدمين' },
  { key: 'canViewAnalytics', labelEn: 'View Analytics', labelAr: 'عرض الإحصائيات', descEn: 'Access company statistics and reports', descAr: 'الوصول إلى إحصائيات وتقارير الشركة' },
]

const INITIAL_FORM = {
  email: '', password: '', firstName: '', lastName: '', position: '',
  permissions: { canPostJobs: false, canManageApplicants: false, canViewAnalytics: false },
}

export default function EmployeeManagement() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const user = useSelector((s) => s.user.user)
  const companyId = user?.company?._id

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [showCredentials, setShowCredentials] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchEmployees = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const res = await getEmployees(companyId)
      if (res?.success) setEmployees(res.data || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const openAdd = () => {
    setForm(INITIAL_FORM)
    setEditMode(false)
    setEditId(null)
    setDialogOpen(true)
  }

  const openEdit = (emp) => {
    setForm({
      email: emp.user?.email || '',
      password: '',
      firstName: emp.user?.profile?.firstName || '',
      lastName: emp.user?.profile?.lastName || '',
      position: emp.position || '',
      permissions: { ...emp.permissions },
    })
    setEditMode(true)
    setEditId(emp.user?._id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.position.trim()) return
    setSaving(true)
    try {
      if (editMode) {
        const res = await updateEmployee(companyId, editId, {
          position: form.position,
          permissions: form.permissions,
        })
        if (res?.success) {
          setEmployees((prev) => prev.map((e) =>
            e.user?._id === editId ? { ...e, position: form.position, permissions: { ...form.permissions } } : e
          ))
        }
      } else {
        const res = await addEmployee(companyId, {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          position: form.position,
          permissions: form.permissions,
        })
        if (res?.success) {
          setShowCredentials(res.data?.loginCredentials || { email: form.email, password: form.password })
          fetchEmployees()
        }
      }
      setDialogOpen(false)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const handleDelete = async (empId) => {
    try {
      const res = await removeEmployee(companyId, empId)
      if (res?.success) {
        setEmployees((prev) => prev.filter((e) => e.user?._id !== empId))
        setConfirmDelete(null)
      }
    } catch { /* ignore */ }
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {/* Header */}
          <Fade in timeout={400}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">
                {t('employees.title')}
              </Typography>
              <Button variant="contained" startIcon={<GroupAddOutlined />} onClick={openAdd} size="small">
                {t('employees.addEmployee')}
              </Button>
            </Stack>
          </Fade>

          {/* Employee List */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          ) : employees.length === 0 ? (
            <Fade in timeout={500}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <PeopleOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {t('employees.noEmployees')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('employees.noEmployeesDesc')}
                </Typography>
                <Button variant="contained" startIcon={<GroupAddOutlined />} onClick={openAdd}>
                  {t('employees.addEmployee')}
                </Button>
              </Paper>
            </Fade>
          ) : (
            employees.map((emp, i) => (
              <Fade in key={emp.user?._id || i} timeout={400 + i * 100}>
                <Paper sx={{
                  p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 8px rgba(61,28,110,0.06)' },
                  transition: 'all 0.2s ease',
                }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar src={emp.user?.profile?.avatar} sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: 16 }}>
                      {emp.user?.profile?.firstName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={600} noWrap>
                        {emp.user?.profile?.firstName} {emp.user?.profile?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {emp.position} · {emp.user?.email}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.3 }}>
                        {emp.permissions?.canPostJobs && (
                          <Chip icon={<WorkOutlineOutlined sx={{ fontSize: 12 }} />} label={t('employees.canPostJobs')} size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                        )}
                        {emp.permissions?.canManageApplicants && (
                          <Chip icon={<ContentPasteOutlined sx={{ fontSize: 12 }} />} label={t('employees.canManageApplicants')} size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                        )}
                        {emp.permissions?.canViewAnalytics && (
                          <Chip icon={<AnalyticsOutlined sx={{ fontSize: 12 }} />} label={t('employees.canViewAnalytics')} size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                        )}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('employees.editEmployee')}>
                        <IconButton size="small" onClick={() => openEdit(emp)}>
                          <EditOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('employees.removeEmployee')}>
                        <IconButton size="small" color="error" onClick={() => setConfirmDelete(emp)}>
                          <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              </Fade>
            ))
          )}
        </Stack>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? t('employees.editEmployee') : t('employees.addEmployee')}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {!editMode && (
              <>
                <TextField label={t('employees.firstName')} value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} fullWidth size="small" />
                <TextField label={t('employees.lastName')} value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} fullWidth size="small" />
                <TextField label={t('employees.email')} value={form.email} type="email"
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth size="small" />
                <TextField label={t('employees.password')} value={form.password} type="password"
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} fullWidth size="small" />
              </>
            )}
            <TextField label={t('employees.position')} value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              fullWidth size="small" placeholder={t('employees.positionPlaceholder')} />

            <Divider />
            <Typography variant="subtitle2" fontWeight={700}>{t('employees.permissions')}</Typography>
            {PERMISSION_FIELDS.map((pf) => (
              <FormControlLabel
                key={pf.key}
                control={
                  <Switch checked={form.permissions[pf.key]}
                    onChange={(e) => setForm((p) => ({
                      ...p, permissions: { ...p.permissions, [pf.key]: e.target.checked },
                    }))} color="primary" />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{pf[`label${lang === 'ar' ? 'Ar' : 'En'}`]}</Typography>
                    <Typography variant="caption" color="text.secondary">{pf[`desc${lang === 'ar' ? 'Ar' : 'En'}`]}</Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="text" onClick={() => setDialogOpen(false)}>{t('companies.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.position.trim()}>
            {saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : t('employees.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={!!showCredentials} onClose={() => setShowCredentials(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('employees.credentials')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">{t('employees.credentialsNote')}</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>{t('employees.email')}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{showCredentials?.email}</Typography>
                  <IconButton size="small" onClick={() => copyText(showCredentials?.email)}><ContentCopyOutlined sx={{ fontSize: 14 }} /></IconButton>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>{t('employees.password')}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{showCredentials?.password}</Typography>
                  <IconButton size="small" onClick={() => copyText(showCredentials?.password)}><ContentCopyOutlined sx={{ fontSize: 14 }} /></IconButton>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setShowCredentials(null)}>{t('companies.add')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{t('employees.removeEmployee')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('employees.removeConfirm')}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="text" onClick={() => setConfirmDelete(null)}>{t('companies.cancel')}</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(confirmDelete?.user?._id)}>
            {t('employees.removeEmployee')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
