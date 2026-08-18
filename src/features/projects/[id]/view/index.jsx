import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, Divider, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip, TextField, Snackbar, Alert,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, AttachMoneyOutlined, AccessTimeOutlined, PersonOutlined,
  CodeOutlined, DesignServicesOutlined, AssignmentOutlined, CheckCircleOutlined, DeleteOutlined, CalendarMonthOutlined, RequestQuoteOutlined, VerifiedOutlined,
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
  const [toastMsg, setToastMsg] = useState('')

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
        setProposals(r.data)
      }
    } catch (err) { /* ignore */ } finally { setProposalsLoading(false) }
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
      setToastMsg(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleRejectProposal = async (proposalId) => {
    try {
      const res = await rejectProposal(id, proposalId)
      if (res?.success) {
        setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status: 'Rejected' } : p))
      }
    } catch (err) {
      setToastMsg(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleComplete = async () => {
    try {
      const res = await completeProject(id)
      if (res?.success) fetchProject(false)
    } catch (err) {
      setToastMsg(err?.response?.data?.message || t('common.error'))
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch (err) {
      setToastMsg(err?.response?.data?.message || t('common.error'))
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
      setToastMsg(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (error) return (<Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><Typography color="error" sx={{ mb: 2 }}>{error}</Typography><Button variant="outlined" onClick={() => fetchProject()}>{t('projects.retry', 'Retry')}</Button></Container>)
  if (loading) return <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (!project) return (<Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}><Typography color="text.secondary">{t('projects.notFound', 'Project not found')}</Typography><Button variant="text" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>{t('projects.back', 'Back to Projects')}</Button></Container>)

  const budgetText = project.budget ? `${project.budget.currency || 'SAR'} ${project.budget.min.toLocaleString()}${project.budget.max ? ` - ${project.budget.max.toLocaleString()}` : ''}` : '-'
  const deadlineText = project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>

        {/* Back Button */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Button variant="text" onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 0.5 }}><ArrowBackOutlined /></Button>
          <Chip label={t(`projects.statusOptions.${project.status}`, project.status)} color={statusColors[project.status] || 'default'} size="small" sx={{ ml: 'auto' }} />
        </Stack>

        {/* Single Horizontal Card */}
        <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Grid container>

            {/* ── Left: Main Content (scrollable) ── */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ borderColor: 'divider' }}>
              <Box sx={{ p: { xs: 2.5, md: 3 }, overflow: 'auto', maxHeight: { md: 'calc(100vh - 140px)' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 } }}>

                {/* Title + Category */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{
                    width: 48, height: 48, flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main',
                    fontSize: '1.1rem', fontWeight: 700,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  }}>
                    {categoryIcons[project.category] || <AssignmentOutlined />}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3, mb: 0.25 }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {t(`projects.categoryOptions.${project.category}`, project.category)}
                    </Typography>
                  </Box>
                </Stack>

                {/* Skills */}
                {project.skills?.length > 0 && (
                  <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 0.75 }}>
                    {project.skills.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
                    ))}
                  </Stack>
                )}

                <Divider sx={{ mb: 2.5 }} />

                {/* Stats Row */}
                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 3 }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <AttachMoneyOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                      {budgetText}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.budget', 'Budget')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <CalendarMonthOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>{deadlineText}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.deadline', 'Deadline')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <PersonOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>{project.proposalsCount || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('projects.proposals', 'Proposals')}</Typography>
                  </Box>
                </Stack>

                {/* Description */}
                {project.description && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                      {t('projects.description', 'Description')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {project.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* ── Right: Sidebar (sticky) ── */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{
                p: { xs: 2.5, md: 3 },
                position: { md: 'sticky' },
                top: { md: 80 },
                maxHeight: { md: 'calc(100vh - 140px)' },
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 },
              }}>

                {/* Client Actions */}
                {isClient && project?.status !== 'Completed' && project?.status !== 'Cancelled' && (
                  <Button variant="contained" onClick={handleOpenProposals} startIcon={<PersonOutlined />} fullWidth sx={{ mb: 2.5 }}>
                    {t('projects.viewProposals', 'View Proposals')} {proposals.length > 0 && `(${proposals.length})`}
                  </Button>
                )}

                {/* Freelancer: Submit Proposal Form */}
                {!isClient && isOpen && !proposalSent && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>{t('projects.submitProposal', 'Submit Proposal')}</Typography>
                    <Stack spacing={1.5}>
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
                        rows={3}
                        size="small"
                        fullWidth
                        value={proposalForm.coverLetter}
                        onChange={(e) => setProposalForm(p => ({ ...p, coverLetter: e.target.value }))}
                      />
                      <Button variant="contained" onClick={handleSubmitProposal} disabled={submitting} fullWidth>
                        {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.submitProposal', 'Submit Proposal')}
                      </Button>
                    </Stack>
                    <Divider sx={{ mt: 2.5 }} />
                  </Box>
                )}

                {/* Freelancer: Success */}
                {!isClient && proposalSent && (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, textAlign: 'center', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, mb: 2.5 }}>
                    <CheckCircleOutlined sx={{ fontSize: 36, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold" color="success.main">{t('projects.proposalSent', 'Your proposal has been submitted!')}</Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Paper>
                )}

                {/* Client Info */}
                {project.client && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                      {t('projects.client', 'Client')}
                    </Typography>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Avatar src={project.client.profile?.avatar} sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                        {project.client.profile?.firstName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} fontSize="0.85rem" noWrap>
                          {project.client.profile?.firstName} {project.client.profile?.lastName}
                        </Typography>
                        {project.client.profile?.headline && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {project.client.profile.headline}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Assigned Freelancer */}
                {project.assignedTo && (
                  <Box sx={{ mb: 2.5 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="caption" color="success.main" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                      {t('projects.freelancer', 'Freelancer')}
                    </Typography>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Avatar src={project.assignedTo.profile?.avatar} sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', fontSize: '0.8rem', fontWeight: 700 }}>
                        {project.assignedTo.profile?.firstName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} fontSize="0.85rem" noWrap>
                          {project.assignedTo.profile?.firstName} {project.assignedTo.profile?.lastName}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Client Actions */}
                {isClient && isInProgress && (
                  <Button variant="contained" color="success" onClick={handleComplete} startIcon={<CheckCircleOutlined />} fullWidth sx={{ mb: 1.5 }}>
                    {t('projects.markComplete', 'Mark as Completed')}
                  </Button>
                )}

                {isClient && (
                  <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)} startIcon={<DeleteOutlined />} fullWidth>
                    {t('projects.delete', 'Delete Project')}
                  </Button>
                )}
              </Box>
            </Grid>

          </Grid>
        </Paper>
      </Container>

      {/* Proposals Dialog */}
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
                              <RequestQuoteOutlined sx={{ fontSize: 16, color: '#16A34A' }} />
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
                          <Chip label={t(`projects.proposalStatus.${p.status}`, p.status)} size="small"
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
                              sx={{ fontSize: '0.78rem' }}
                            >
                              {t('projects.accept', 'Accept')}
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              onClick={() => handleRejectProposal(p._id)}
                              sx={{ fontSize: '0.78rem' }}
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
          <Button variant="text" onClick={() => setProposalsOpen(false)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('projects.deleteConfirmTitle', 'Delete this project?')}</DialogTitle>
        <DialogContent><Typography variant="body2">{t('projects.deleteConfirmBody', 'This action cannot be undone.')}</Typography></DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.delete', 'Delete Project')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert severity="error" variant="filled" onClose={() => setToastMsg('')} sx={{ borderRadius: 2, alignItems: 'center' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
