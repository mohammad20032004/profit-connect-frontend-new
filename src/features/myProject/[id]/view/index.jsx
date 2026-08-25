import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, CircularProgress, Avatar, Chip, Divider, alpha, Tooltip, Dialog, DialogTitle, DialogContent, Grid, useMediaQuery, Snackbar, Alert, LinearProgress,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  AttachMoneyOutlined, AccessTimeOutlined, PersonOutlined, EditOutlined,
  CodeOutlined, DesignServicesOutlined, WorkOutlineOutlined, CalendarMonthOutlined, StarBorderOutlined, VerifiedOutlined, ManageSearchOutlined, GroupsOutlined, FlagOutlined, PaymentsOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import {
  getProjectFull, getProjectById, getProposals, acceptProposal, rejectProposal, updateProject,
} from '@/services/projectService'
import ProjectBasicFields from '@/features/projects/create/components/ProjectBasicFields'
import ProjectDetailFields from '@/features/projects/create/components/ProjectDetailFields'
import ProjectBudgetFields from '@/features/projects/create/components/ProjectBudgetFields'
import { formatMoney } from '@/utils/money'
import { formatDeadline } from '@/utils/deadline'
import { formatDate } from '@/features/myProject/[id]/manage/components/manageConstants'

const categoryIcons = {
  'تطوير ويب': <CodeOutlined />, 'تطوير تطبيقات': <CodeOutlined />,
  'تصميم UI/UX': <DesignServicesOutlined />, 'تصميم جرافيك': <DesignServicesOutlined />,
  'تطوير خلفي': <CodeOutlined />, 'تطوير أمامي': <CodeOutlined />,
  'Web Development': <CodeOutlined />, 'Mobile Development': <CodeOutlined />,
  'UI/UX Design': <DesignServicesOutlined />, 'Graphic Design': <DesignServicesOutlined />,
  'Backend Development': <CodeOutlined />, 'Frontend Development': <CodeOutlined />,
}

const statusColors = {
  Open: 'success', InProgress: 'primary', Completed: 'default', Cancelled: 'error',
  Working: 'primary', Pending: 'warning', Accepted: 'success', Rejected: 'error', Paid: 'success',
}

const fullName = (prof) => {
  if (!prof) return ''
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || prof.fullname || ''
}

export default function MyProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [data, setData] = useState(null)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({ title: '', category: '', description: '', skills: '', budgetMin: '', budgetMax: '', currency: 'USD', deadline: '' })
  const [toastMsg, setToastMsg] = useState('')

  const fetchFull = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const res = await getProjectFull(id)
      if (res?.success) {
        setData(res.data)
        setRole(res.data.role)
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [id, t])

  useEffect(() => { fetchFull() }, [fetchFull])

  const project = data?.project

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true)
    try {
      const r = await getProposals(id)
      if (r?.success) setProposals(r.data)
    } catch { /* ignore */ } finally { setProposalsLoading(false) }
  }, [id])

  useEffect(() => {
    if (role === 'owner') fetchProposals()
  }, [role, fetchProposals])

  useEffect(() => {
    const handler = (e) => { if (e.detail?.projectId === id) fetchProposals() }
    window.addEventListener('proposal:received', handler)
    return () => window.removeEventListener('proposal:received', handler)
  }, [id, fetchProposals])

  const openEdit = async () => {
    setEditError('')
    setEditLoading(true)
    try {
      const res = await getProjectById(id)
      const p = res?.data || project
      setEditForm({
        title: p.title || '',
        category: p.category || '',
        description: p.description || '',
        skills: (p.skills || []).join(', '),
        budgetMin: p.budget?.min?.toString() || '',
        budgetMax: p.budget?.max?.toString() || '',
        currency: p.budget?.currency || 'USD',
        deadline: p.deadline ? String(p.deadline) : '',
      })
    } catch {
      setEditForm({
        title: project?.title || '', category: project?.category || '', description: project?.description || '',
        skills: (project?.skills || []).join(', '), budgetMin: project?.budget?.min?.toString() || '',
        budgetMax: project?.budget?.max?.toString() || '', currency: project?.budget?.currency || 'USD',
        deadline: project?.deadline ? String(project.deadline) : '',
      })
    } finally {
      setEditLoading(false)
      setEditOpen(true)
    }
  }

  const handleEditChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleEditSubmit = async () => {
    if (!editForm.title.trim() || !editForm.category) {
      setEditError(t('projects.fillRequired', 'Please fill in all required fields'))
      return
    }
    setEditLoading(true)
    setEditError('')
    try {
      const payload = {
        title: editForm.title.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        skills: editForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        deadline: editForm.deadline ? Number(editForm.deadline) : undefined,
      }
      if (editForm.budgetMin) {
        payload.budget = { min: Number(editForm.budgetMin), currency: editForm.currency }
        if (editForm.budgetMax) payload.budget.max = Number(editForm.budgetMax)
      }
      const res = await updateProject(id, payload)
      if (res?.success) {
        setEditOpen(false)
        fetchFull(false)
      } else {
        setEditError(res?.message || t('common.error'))
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleAcceptProposal = async (proposalId) => {
    try {
      const res = await acceptProposal(id, proposalId)
      if (res?.success) { fetchFull(false); fetchProposals() }
    } catch (err) {
      setToastMsg(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleRejectProposal = async (proposalId) => {
    try {
      const res = await rejectProposal(id, proposalId)
      if (res?.success) setProposals((prev) => prev.map((p) => (p._id === proposalId ? { ...p, status: 'Rejected' } : p)))
    } catch (err) {
      setToastMsg(err?.response?.data?.message || t('common.error'))
    }
  }

  if (error) return (<Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}><Typography color="error">{error}</Typography><Button variant="outlined" onClick={() => fetchFull()}>{t('projects.retry', 'Retry')}</Button></Box>)
  if (loading) return <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
  if (!project) return (<Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}><Typography color="text.secondary">{t('projects.notFound', 'Project not found')}</Typography><Button variant="text" onClick={() => navigate('/projects')}>{t('projects.back', 'Back to Projects')}</Button></Box>)

  const budgetText = project.budget
    ? `${formatMoney(project.budget.min, project.budget.currency)} – ${formatMoney(project.budget.max, project.budget.currency)}`
    : '-'

  const stats = data.statistics || {}

  const PaymentCard = ({ p }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" fontWeight="bold">{p.title}</Typography>
        <Chip label={t(`projects.statusOptions.${p.status}`, p.status)} size="small" color={statusColors[p.status] || 'default'} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap', color: 'text.secondary' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight="bold" color="primary.main">{formatMoney(p.amount, p.currency || project.budget?.currency)}</Typography>
        </Stack>
        {p.method && <Typography variant="caption">{t('projects.freelanceView.paymentMethod')}: {p.method}</Typography>}
        {p.paidDate && <Typography variant="caption">{t('projects.freelanceView.paymentPaidDate')}: {formatDate(p.paidDate, lang)}</Typography>}
        {p.dueDate && <Typography variant="caption">{t('projects.freelanceView.paymentDueDate')}: {formatDate(p.dueDate, lang)}</Typography>}
      </Stack>
      {p.transactionRef && <Typography variant="caption" color="text.secondary">{t('projects.freelanceView.paymentRef')}: {p.transactionRef}</Typography>}
      {p.note && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{p.note}</Typography>}
    </Paper>
  )

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default', py: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
                {categoryIcons[project.category] || <WorkOutlineOutlined />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{project.title}</Typography>
                <Typography variant="body2" color="text.secondary">{t(`projects.categoryOptions.${project.category}`, project.category)}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip label={t(`projects.statusOptions.${project.status}`, project.status)} color={statusColors[project.status] || 'default'} />
              <Chip variant="outlined" label={role === 'owner' ? t('projects.freelanceView.owner') : t('projects.freelanceView.teamMember')} />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 90 }}>
              <AttachMoneyOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body1" fontWeight="bold">{budgetText}</Typography>
              <Typography variant="caption" color="text.secondary">{t('projects.budget')}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 90 }}>
              <CalendarMonthOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body1" fontWeight="bold">{project.deadline ? formatDeadline(project.deadline, lang) : '-'}</Typography>
              <Typography variant="caption" color="text.secondary">{t('projects.deadlineLabel')}</Typography>
            </Box>
            {typeof project.progress === 'number' && (
              <Box sx={{ textAlign: 'center', flex: 1, minWidth: 90 }}>
                <FlagOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">{project.progress}%</Typography>
                <Typography variant="caption" color="text.secondary">{t('projects.freelanceView.progress')}</Typography>
              </Box>
            )}
            {project.client && (
              <Box sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                <PersonOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">{fullName(project.client.profile) || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">{t('projects.client')}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {role === 'owner' && (
          <>
            {/* Statistics */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.statistics')}</Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<FlagOutlined />} label={t('projects.freelanceView.progress')} value={`${stats.progress ?? project.progress ?? 0}%`} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<CalendarMonthOutlined />} label={t('projects.freelanceView.duration')} value={stats.durationDays ? t('projects.freelanceView.durationDays', { count: stats.durationDays }) : '-'} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<FlagOutlined />} label={t('projects.freelanceView.milestonesCount', { count: stats.milestonesCount || 0 })} value={stats.milestonesCount || 0} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<GroupsOutlined />} label={t('projects.freelanceView.teamCount', { count: stats.teamCount || 0 })} value={stats.teamCount || 0} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<WorkOutlineOutlined />} label={t('projects.proposals')} value={stats.proposalsCount || 0} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<PaymentsOutlined />} label={t('projects.freelanceView.payments')} value={stats.paymentsCount || 0} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<AttachMoneyOutlined />} label={t('projects.freelanceView.paymentsTotal')} value={stats.paymentsSummary ? formatMoney(stats.paymentsSummary.total, project.budget?.currency) : '-'} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Stat icon={<AttachMoneyOutlined />} label={t('projects.freelanceView.paymentsPendingLabel')} value={stats.paymentsSummary ? formatMoney(stats.paymentsSummary.pending, project.budget?.currency) : '-'} /></Grid>
              </Grid>
            </Paper>

            {/* Team */}
            {data.team?.length > 0 && (
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.team')}</Typography>
                <Stack spacing={1.5}>
                  {data.team.map((m) => (
                    <Stack key={m._id || m.freelancer?._id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Avatar src={m.freelancer?.profile?.avatar} sx={{ width: 40, height: 40 }}>{fullName(m.freelancer?.profile).charAt(0)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="bold">{fullName(m.freelancer?.profile) || t('projects.anonymous')}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                      </Box>
                      <Chip size="small" label={t(`projects.statusOptions.${m.status}`, m.status)} color={statusColors[m.status] || 'default'} />
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Milestones */}
            {data.project?.milestones?.length > 0 && (
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.milestones')}</Typography>
                <Stack spacing={1.5}>
                  {data.project.milestones.map((m, i) => (
                    <Box key={m._id || i}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>{m.title}</Typography>
                        <Chip size="small" label={t(`projects.statusOptions.${m.status}`, m.status)} color={statusColors[m.status] || 'default'} />
                      </Stack>
                      <LinearProgress variant="determinate" value={m.progress || 0} sx={{ mt: 0.5, borderRadius: 2, height: 6 }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Payments */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.payments')}</Typography>
              {data.paymentsPaid?.length > 0 && (
                <>
                  <Typography variant="caption" color="success.main" fontWeight={700}>{t('projects.freelanceView.paymentsPaid')}</Typography>
                  <Stack spacing={1.5} sx={{ mt: 1, mb: 2 }}>
                    {data.paymentsPaid.map((p) => <PaymentCard key={p._id} p={p} />)}
                  </Stack>
                </>
              )}
              {data.paymentsPending?.length > 0 && (
                <>
                  <Typography variant="caption" color="warning.main" fontWeight={700}>{t('projects.freelanceView.paymentsPending')}</Typography>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {data.paymentsPending.map((p) => <PaymentCard key={p._id} p={p} />)}
                  </Stack>
                </>
              )}
              {!data.paymentsPaid?.length && !data.paymentsPending?.length && (
                <Typography variant="body2" color="text.secondary">{t('projects.freelanceView.noPayments')}</Typography>
              )}
            </Paper>

            {/* Proposals */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>{t('projects.proposals')} ({proposals.length})</Typography>
              {proposalsLoading ? (
                <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
              ) : proposals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <WorkOutlineOutlined sx={{ fontSize: 44, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
                  <Typography color="text.secondary">{t('projects.noProposals')}</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {proposals.map((p, idx) => {
                    const user = p.freelancer || p.userId || {}
                    const prof = user.profile || {}
                    const name = fullName(prof) || user.email || user.name || t('projects.anonymous')
                    return (
                      <Paper key={p._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                          <Avatar src={prof.avatar} sx={{ width: 44, height: 44 }}>{name.charAt(0)}</Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight="bold">{name}</Typography>
                              {idx === 0 && p.status === 'Pending' && <Tooltip title={t('projects.lowestBid')}><StarBorderOutlined sx={{ fontSize: 16, color: '#16A34A' }} /></Tooltip>}
                              <Chip label={t(`projects.proposalStatus.${p.status}`, p.status)} size="small"
                                color={p.status === 'Pending' ? 'warning' : p.status === 'Accepted' ? 'success' : 'default'}
                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, ml: 'auto' }}
                              />
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 0.5, mb: 0.5 }}>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight="bold" color="primary.main">{p.bidAmount?.toLocaleString()} {project.budget?.currency || 'USD'}</Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <AccessTimeOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                                <Typography variant="caption" color="text.secondary">{p.deliveryTime}</Typography>
                              </Stack>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.82rem' }}>{p.coverLetter}</Typography>
                            {p.status === 'Pending' && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                <Button size="small" variant="contained" color="success" onClick={() => handleAcceptProposal(p._id)} startIcon={<VerifiedOutlined />} sx={{ fontSize: '0.75rem' }}>{t('projects.accept')}</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleRejectProposal(p._id)} sx={{ fontSize: '0.75rem' }}>{t('projects.reject')}</Button>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              )}
            </Paper>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button size="small" variant="outlined" onClick={openEdit} startIcon={<EditOutlined />} sx={{ fontSize: '0.8rem', flex: 1 }}>{t('projects.edit')}</Button>
              <Button size="small" variant="contained" onClick={() => navigate(`/myProject/${id}/manage`)} startIcon={<ManageSearchOutlined />} sx={{ fontSize: '0.8rem', flex: 1 }}>{t('projects.freelanceView.viewManage')}</Button>
            </Stack>
          </>
        )}

        {role === 'team_member' && (
          <>
            {/* Your Assignment */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.yourAssignment')}</Typography>
              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ flexWrap: 'wrap' }}>
                <Box><Typography variant="caption" color="text.secondary" display="block">{t('projects.freelanceView.assignmentRole')}</Typography><Typography variant="body1" fontWeight="bold">{data.yourAssignment?.role || '-'}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary" display="block">{t('projects.freelanceView.assignmentStatus')}</Typography><Chip size="small" label={t(`projects.statusOptions.${data.yourAssignment?.status}`, data.yourAssignment?.status)} color={statusColors[data.yourAssignment?.status] || 'default'} /></Box>
                <Box><Typography variant="caption" color="text.secondary" display="block">{t('projects.freelanceView.assignmentJoined')}</Typography><Typography variant="body1" fontWeight="bold">{data.yourAssignment?.joinedAt ? formatDate(data.yourAssignment.joinedAt, lang) : '-'}</Typography></Box>
              </Stack>
            </Paper>

            {/* Milestones */}
            {((data.milestones || data.project?.milestones)?.length > 0) && (
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.milestones')}</Typography>
                <Stack spacing={1.5}>
                  {(data.milestones || data.project?.milestones).map((m, i) => (
                    <Box key={m._id || i}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>{m.title}</Typography>
                        <Chip size="small" label={t(`projects.statusOptions.${m.status}`, m.status)} color={statusColors[m.status] || 'default'} />
                      </Stack>
                      {m.assignedTo?.profile && (
                        <Typography variant="caption" color="text.secondary">{t('projects.freelanceView.assignedTo', 'Assigned to')}: {fullName(m.assignedTo.profile)}</Typography>
                      )}
                      <LinearProgress variant="determinate" value={m.progress || 0} sx={{ mt: 0.5, borderRadius: 2, height: 6 }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Payments */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.freelanceView.payments')}</Typography>
              {data.payments?.length > 0 ? (
                <Stack spacing={1.5}>
                  {data.payments.map((p) => <PaymentCard key={p._id} p={p} />)}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('projects.freelanceView.noPayments')}</Typography>
              )}
            </Paper>
          </>
        )}
      </Box>

      <Dialog open={editOpen} onClose={() => { if (!editLoading) setEditOpen(false) }} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: '90% !important', width: '90%' } }}
      >
        <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>{t('projects.editProject')}</DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <ProjectBasicFields form={editForm} onChange={handleEditChange} t={t} />
            <ProjectDetailFields form={editForm} onChange={handleEditChange} t={t} onImprove={() => {}} improving={false} rows={isMobile ? 5 : 7} />
            <ProjectBudgetFields form={editForm} onChange={handleEditChange} t={t} />
          </Grid>
          {editError && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2 }}>{editError}</Typography>}
          <Stack direction={isMobile ? 'column-reverse' : 'row'} spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
            <Button variant="outlined" onClick={() => setEditOpen(false)} disabled={editLoading} fullWidth={isMobile}>{t('projects.cancel')}</Button>
            <Button variant="contained" onClick={handleEditSubmit} disabled={editLoading} fullWidth={isMobile}>
              {editLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : t('projects.save')}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setToastMsg('')} sx={{ borderRadius: 1.5 }}>{toastMsg}</Alert>
      </Snackbar>
    </Box>
  )
}

function Stat({ icon, label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
      <Box sx={{ color: 'primary.main', mb: 0.5 }}>{icon}</Box>
      <Typography variant="body1" fontWeight="bold">{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  )
}
