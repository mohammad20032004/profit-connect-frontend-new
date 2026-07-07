import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Button, Avatar, Chip, Divider, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip, TextField,
} from '@mui/material'
import {
  ArrowBackOutlined, AttachMoneyOutlined, AccessTimeOutlined, PersonOutlined,
  CodeOutlined, DesignServicesOutlined, WorkOutlineOutlined, CheckCircleOutlined, DeleteOutlined, CalendarMonthOutlined, StarBorderOutlined, VerifiedOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { getProjectById, getProposals, acceptProposal, rejectProposal, completeProject, deleteProject, submitProposal } from '@/services/projectService'

const categoryIcons = {
  'تطوير ويب': <CodeOutlined />, 'تطوير تطبيقات': <CodeOutlined />,
  'تصميم UI/UX': <DesignServicesOutlined />, 'تصميم جرافيك': <DesignServicesOutlined />,
  'تطوير خلفي': <CodeOutlined />, 'تطوير أمامي': <CodeOutlined />,
  'Web Development': <CodeOutlined />, 'Mobile Development': <CodeOutlined />,
  'UI/UX Design': <DesignServicesOutlined />, 'Graphic Design': <DesignServicesOutlined />,
  'Backend Development': <CodeOutlined />, 'Frontend Development': <CodeOutlined />,
}

const statusColors = { Open: 'success', InProgress: 'info', Completed: 'default', Cancelled: 'error' }

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme()
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsOpen, setProposalsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [proposalForm, setProposalForm] = useState({ bidAmount: '', deliveryTime: '', coverLetter: '' })
  const [submitting, setSubmitting] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)

  const fetchProject = async (showLoader = true) => {
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
  }

  useEffect(() => { fetchProject() }, [id])

  const handleOpenProposals = async () => {
    setProposalsOpen(true)
    setProposalsLoading(true)
    try {
      const r = await getProposals(id)
      if (r?.success) {
        console.log('Proposals:', JSON.stringify(r.data, null, 2))
        setProposals(r.data)
      }
    } catch (err) { console.error('Failed to fetch proposals:', err) } finally { setProposalsLoading(false) }
  }

  const isClient = currentUserId === project?.client?._id
  const isOpen = project?.status === 'Open'
  const isInProgress = project?.status === 'InProgress'

  const handleAcceptProposal = async (proposalId) => {
    try {
      const res = await acceptProposal(id, proposalId)
      if (res?.success) {
        fetchProject(false)
        setProposalsLoading(true)
        try {
          const r = await getProposals(id)
          if (r?.success) setProposals(r.data)
        } catch { /* ignore */ } finally { setProposalsLoading(false) }
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
    setDeleteLoading(true)
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  const handleSubmitProposal = async () => {
    if (!proposalForm.bidAmount || !proposalForm.deliveryTime || !proposalForm.coverLetter) return
    setSubmitting(true)
    try {
      const res = await submitProposal(id, {
        bidAmount: Number(proposalForm.bidAmount),
        deliveryTime: proposalForm.deliveryTime,
        coverLetter: proposalForm.coverLetter,
      })
      if (res?.success) {
        setProposalSent(true)
        setProposalForm({ bidAmount: '', deliveryTime: '', coverLetter: '' })
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (error) return (<Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><Typography color="error" sx={{ mb: 2 }}>{error}</Typography><Button variant="outlined" onClick={() => fetchProject()}>{t('projects.retry', 'Retry')}</Button></Container>)
  if (loading) return <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (!project) return (<Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><Typography color="text.secondary">{t('projects.notFound', 'Project not found')}</Typography><Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>{t('projects.back', 'Back to Projects')}</Button></Container>)

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 0.5 }}><ArrowBackOutlined /></Button>
        <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }} noWrap>{project.title}</Typography>
        <Chip label={t(`projects.statusOptions.${project.status}`, project.status)} color={statusColors[project.status] || 'default'} size="small" />
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
                    {categoryIcons[project.category] || <WorkOutlineOutlined />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{project.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{t(`projects.categoryOptions.${project.category}`, project.category)}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <AttachMoneyOutlined sx={{ fontSize: 22, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {project.budget ? `${project.budget.currency || 'SAR'} ${project.budget.min.toLocaleString()}${project.budget.max ? ` - ${project.budget.max.toLocaleString()}` : ''}` : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.budget', 'Budget')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <CalendarMonthOutlined sx={{ fontSize: 22, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.deadline', 'Deadline')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <PersonOutlined sx={{ fontSize: 22, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">{project.proposalsCount || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.proposals', 'Proposals')}</Typography>
                  </Box>
                </Stack>

                {project.skills?.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {project.skills.map((s) => (<Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.78rem' }} />))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            {project.description && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('projects.description', 'Description')}</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.description}</Typography>
              </Paper>
            )}


          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            {isClient && project?.status !== 'Completed' && project?.status !== 'Cancelled' && (
              <Button variant="contained" onClick={handleOpenProposals} startIcon={<PersonOutlined />} fullWidth
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
              >
                {t('projects.viewProposals', 'View Proposals')} {proposals.length > 0 && `(${proposals.length})`}
              </Button>
            )}

            {!isClient && isOpen && !proposalSent && (
              <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{t('projects.submitProposal', 'Submit Proposal')}</Typography>
                <Stack spacing={2}>
                  <TextField
                    label={t('projects.bidAmount', 'Bid Amount')}
                    type="number"
                    size="small"
                    fullWidth
                    value={proposalForm.bidAmount}
                    onChange={(e) => setProposalForm(p => ({ ...p, bidAmount: e.target.value }))}
                  />
                  <TextField
                    label={t('projects.deliveryTime', 'Delivery Time')}
                    placeholder={t('projects.deliveryTimePlaceholder', 'e.g. 2 weeks')}
                    size="small"
                    fullWidth
                    value={proposalForm.deliveryTime}
                    onChange={(e) => setProposalForm(p => ({ ...p, deliveryTime: e.target.value }))}
                  />
                  <TextField
                    label={t('projects.coverLetter', 'Cover Letter')}
                    placeholder={t('projects.coverLetterPlaceholder', 'Describe your experience and approach...')}
                    multiline
                    rows={4}
                    size="small"
                    fullWidth
                    value={proposalForm.coverLetter}
                    onChange={(e) => setProposalForm(p => ({ ...p, coverLetter: e.target.value }))}
                  />
                  <Button variant="contained" onClick={handleSubmitProposal} disabled={submitting} fullWidth
                    sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
                  >
                    {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.submitProposal', 'Submit Proposal')}
                  </Button>
                </Stack>
              </Paper>
            )}

            {!isClient && proposalSent && (
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" fontWeight="bold" color="success.main">{t('projects.proposalSent', 'Your proposal has been submitted!')}</Typography>
              </Paper>
            )}

            {project.client && (
              <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.client', 'Client')}</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar src={project.client.profile?.avatar} sx={{ width: 44, height: 44 }}>{project.client.profile?.firstName?.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{project.client.profile?.firstName} {project.client.profile?.lastName}</Typography>
                    {project.client.profile?.headline && <Typography variant="caption" color="text.secondary">{project.client.profile.headline}</Typography>}
                  </Box>
                </Stack>
              </Paper>
            )}

            {project.assignedTo && (
              <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: 'success.main' }}>{t('projects.freelancer', 'Freelancer')}</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar src={project.assignedTo.profile?.avatar} sx={{ width: 44, height: 44 }}>{project.assignedTo.profile?.firstName?.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{project.assignedTo.profile?.firstName} {project.assignedTo.profile?.lastName}</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {isClient && isInProgress && (
              <Button variant="contained" color="success" onClick={handleComplete} startIcon={<CheckCircleOutlined />} fullWidth>
                {t('projects.markComplete', 'Mark as Completed')}
              </Button>
            )}

            {isClient && (
              <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)} startIcon={<DeleteOutlined />} fullWidth>
                {t('projects.delete', 'Delete Project')}
              </Button>
            )}


          </Stack>
        </Grid>
      </Grid>

      <Dialog open={proposalsOpen} onClose={() => setProposalsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('projects.userProposals', 'User Proposals')}
          {proposals.length > 0 && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({proposals.length})</Typography>}
        </DialogTitle>
        <DialogContent dividers>
          {proposalsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : proposals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('projects.noProposals', 'No proposals yet')}</Typography>
          ) : (
            <Stack spacing={2}>
              {proposals.map((p, idx) => {
                const user = p.freelancer || p.userId || {}
                const prof = user.profile || {}
                const name = prof.firstName && prof.lastName ? `${prof.firstName} ${prof.lastName}` : user.email || user.name || t('projects.anonymous', 'Anonymous')
                return (
                  <Paper key={p._id} variant="outlined" sx={{
                    p: 2, borderRadius: 2,
                    borderColor: idx === 0 ? alpha('#16A34A', 0.3) : undefined,
                    bgcolor: idx === 0 ? alpha('#16A34A', 0.03) : undefined,
                  }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                      <Avatar src={prof.avatar} sx={{ width: 42, height: 42 }}>{name.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight="bold">{name}</Typography>
                          {idx === 0 && (
                            <Tooltip title={t('projects.lowestBid', 'Lowest bid')}>
                              <StarBorderOutlined sx={{ fontSize: 16, color: '#16A34A' }} />
                            </Tooltip>
                          )}
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
                          <Chip label={p.status} size="small"
                            color={p.status === 'Pending' ? 'warning' : p.status === 'Accepted' ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, ml: 'auto' }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.82rem' }}>{p.coverLetter}</Typography>
                        {p.status === 'Pending' && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                            <Button size="small" variant="contained" color="success"
                              onClick={() => handleAcceptProposal(p._id)}
                              startIcon={<VerifiedOutlined />}
                              sx={{ borderRadius: 999, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
                            >
                              {t('projects.accept', 'Accept')}
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              onClick={() => handleRejectProposal(p._id)}
                              sx={{ borderRadius: 999, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProposalsOpen(false)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('projects.deleteConfirmTitle', 'Delete this project?')}</DialogTitle>
        <DialogContent><Typography variant="body2">{t('projects.deleteConfirmBody', 'This action cannot be undone.')}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.delete', 'Delete Project')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
