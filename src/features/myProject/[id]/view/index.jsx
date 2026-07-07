import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Paper, Typography, Stack, CircularProgress, Button, Avatar, Chip, Divider, alpha, Tooltip, Dialog, DialogTitle, DialogContent, Grid, useMediaQuery,
} from '@mui/material'
import {
  ArrowBackOutlined, AttachMoneyOutlined, AccessTimeOutlined, PersonOutlined, EditOutlined,
  CodeOutlined, DesignServicesOutlined, WorkOutlineOutlined, CheckCircleOutlined, DeleteOutlined, CalendarMonthOutlined, StarBorderOutlined, VerifiedOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { getProjectById, getProposals, acceptProposal, rejectProposal, completeProject, deleteProject, updateProject } from '@/services/projectService'
import ProjectBasicFields from '@/features/projects/create/components/ProjectBasicFields'
import ProjectDetailFields from '@/features/projects/create/components/ProjectDetailFields'
import ProjectBudgetFields from '@/features/projects/create/components/ProjectBudgetFields'

const categoryIcons = {
  'تطوير ويب': <CodeOutlined />, 'تطوير تطبيقات': <CodeOutlined />,
  'تصميم UI/UX': <DesignServicesOutlined />, 'تصميم جرافيك': <DesignServicesOutlined />,
  'تطوير خلفي': <CodeOutlined />, 'تطوير أمامي': <CodeOutlined />,
  'Web Development': <CodeOutlined />, 'Mobile Development': <CodeOutlined />,
  'UI/UX Design': <DesignServicesOutlined />, 'Graphic Design': <DesignServicesOutlined />,
  'Backend Development': <CodeOutlined />, 'Frontend Development': <CodeOutlined />,
}

const statusColors = { Open: 'success', InProgress: 'info', Completed: 'default', Cancelled: 'error' }

export default function MyProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({ title: '', category: '', description: '', skills: '', budgetMin: '', budgetMax: '', currency: 'SAR', deadline: '' })

  const fetchProject = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const res = await getProjectById(id)
      if (res?.success) setProject(res.data)
    } catch (err) {
      if (showLoader) setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [id, t])

  useEffect(() => { fetchProject() }, [fetchProject])

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true)
    try {
      const r = await getProposals(id)
      if (r?.success) setProposals(r.data)
    } catch { } finally { setProposalsLoading(false) }
  }, [id])

  useEffect(() => { fetchProposals() }, [fetchProposals])

  const isClient = currentUserId === project?.client?._id
  const isInProgress = project?.status === 'InProgress'

  const openEdit = () => {
    setEditForm({
      title: project.title || '',
      category: project.category || '',
      description: project.description || '',
      skills: (project.skills || []).join(', '),
      budgetMin: project.budget?.min?.toString() || '',
      budgetMax: project.budget?.max?.toString() || '',
      currency: project.budget?.currency || 'SAR',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    })
    setEditError('')
    setEditOpen(true)
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
        deadline: editForm.deadline || undefined,
      }
      if (editForm.budgetMin) {
        payload.budget = { min: Number(editForm.budgetMin), currency: editForm.currency }
        if (editForm.budgetMax) payload.budget.max = Number(editForm.budgetMax)
      }
      const res = await updateProject(id, payload)
      if (res?.success) {
        setEditOpen(false)
        fetchProject()
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
      if (res?.success) {
        fetchProject(false)
        fetchProposals()
      }
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleRejectProposal = async (proposalId) => {
    try {
      const res = await rejectProposal(id, proposalId)
      if (res?.success) {
        setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'Rejected' } : p))
      }
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleComplete = async () => {
    try {
      const res = await completeProject(id)
      if (res?.success) fetchProject(false)
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    }
  }

  if (error) return (<Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}><Typography color="error">{error}</Typography><Button variant="outlined" onClick={() => fetchProject()}>{t('projects.retry', 'Retry')}</Button></Box>)
  if (loading) return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
  if (!project) return (<Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}><Typography color="text.secondary">{t('projects.notFound', 'Project not found')}</Typography><Button onClick={() => navigate('/projects')}>{t('projects.back', 'Back to Projects')}</Button></Box>)

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Horizontal split: left = project info, right = proposals */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Project details — no scroll */}
        <Box sx={{ width: '42%', flexShrink: 0, p: 3, overflow: 'hidden'}}>
          <Stack spacing={2.5} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
                  {categoryIcons[project.category] || <WorkOutlineOutlined />}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{t(`projects.categoryOptions.${project.category}`, project.category)}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <AttachMoneyOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="bold">
                    {project.budget ? `${project.budget.currency || 'SAR'} ${project.budget.min.toLocaleString()}${project.budget.max ? ` - ${project.budget.max.toLocaleString()}` : ''}` : '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{t('projects.budget', 'Budget')}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <CalendarMonthOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('projects.deadline', 'Deadline')}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <PersonOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="bold">{proposals.length}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('projects.proposals', 'Proposals')}</Typography>
                </Box>
              </Stack>

              {project.skills?.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {project.skills.map((s) => (<Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />))}
                </Stack>
              )}
                <Button size="small" variant="outlined" onClick={openEdit} startIcon={<EditOutlined />} fullWidth
                  sx={{ mt: 1.5, borderRadius: 999, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {t('projects.edit', 'Edit')}
                </Button>
            </Paper>

            {project.description && (
              <Paper sx={{ p: 2.5, borderRadius: 3, overflow: 'auto', height: '40vh' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('projects.description', 'Description')}</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.description}</Typography>
              </Paper>
            )}


          </Stack>
        </Box>

        {/* Right: Proposals list — scrollable */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            {t('projects.proposals', 'Proposals')} ({proposals.length})
          </Typography>
          {proposalsLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
          ) : proposals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <WorkOutlineOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
              <Typography color="text.secondary">{t('projects.noProposals', 'No proposals yet')}</Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {proposals.map((p, idx) => {
                const user = p.freelancer || p.userId || {}
                const prof = user.profile || {}
                const name = prof.firstName && prof.lastName ? `${prof.firstName} ${prof.lastName}` : user.email || user.name || t('projects.anonymous', 'Anonymous')
                return (
                  <Paper key={p._id} variant="outlined" sx={{
                    p: 2, borderRadius: 2,
                    borderColor: idx === 0 && p.status === 'Pending' ? alpha('#16A34A', 0.3) : undefined,
                    bgcolor: idx === 0 && p.status === 'Pending' ? alpha('#16A34A', 0.03) : undefined,
                  }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                      <Avatar src={prof.avatar} sx={{ width: 44, height: 44 }}>{name.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight="bold">{name}</Typography>
                          {idx === 0 && p.status === 'Pending' && (
                            <Tooltip title={t('projects.lowestBid', 'Lowest bid')}>
                              <StarBorderOutlined sx={{ fontSize: 16, color: '#16A34A' }} />
                            </Tooltip>
                          )}
                          <Chip label={p.status} size="small"
                            color={p.status === 'Pending' ? 'warning' : p.status === 'Accepted' ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, ml: 'auto' }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 0.5, mb: 0.5 }}>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight="bold" color="primary.main">{p.bidAmount?.toLocaleString()} {project.budget?.currency || 'SAR'}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <AccessTimeOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                            <Typography variant="caption" color="text.secondary">{p.deliveryTime}</Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.82rem' }}>{p.coverLetter}</Typography>
                        {p.status === 'Pending' && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                            <Button size="small" variant="contained" color="success"
                              onClick={() => handleAcceptProposal(p._id)}
                              startIcon={<VerifiedOutlined />}
                              sx={{ borderRadius: 999, fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}
                            >
                              {t('projects.accept', 'Accept')}
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              onClick={() => handleRejectProposal(p._id)}
                              sx={{ borderRadius: 999, fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}
                            >
                              {t('projects.reject', 'Reject')}
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={editOpen} onClose={() => { if (!editLoading) setEditOpen(false) }} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: '90% !important', width: '90%' } }}
      >
        <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>{t('projects.editProject', 'Edit Project')}</DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <ProjectBasicFields form={editForm} onChange={handleEditChange} t={t} />
            <ProjectDetailFields form={editForm} onChange={handleEditChange} t={t} onImprove={() => {}} improving={false} rows={isMobile ? 5 : 7} />
            <ProjectBudgetFields form={editForm} onChange={handleEditChange} t={t} />
          </Grid>
          {editError && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2 }}>{editError}</Typography>}
          <Stack direction={isMobile ? 'column-reverse' : 'row'} spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
            <Button variant="outlined" onClick={() => setEditOpen(false)} disabled={editLoading} fullWidth={isMobile}>{t('projects.cancel', 'Cancel')}</Button>
            <Button variant="contained" onClick={handleEditSubmit} disabled={editLoading} fullWidth={isMobile}>
              {editLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : t('projects.save', 'Save')}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
