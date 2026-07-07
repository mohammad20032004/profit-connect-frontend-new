import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Button, Avatar, Chip, Divider, TextField, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material'
import {
  ArrowBackOutlined, AttachMoneyOutlined, AccessTimeOutlined, PersonOutlined,
  CodeOutlined, DesignServicesOutlined, WorkOutlineOutlined, SendOutlined, CheckCircleOutlined, DeleteOutlined, CalendarMonthOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { getProjectById, submitProposal, getProposals, acceptProposal, completeProject, deleteProject } from '@/services/projectService'

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
  const [showProposals, setShowProposals] = useState(false)
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const isClient = currentUserId === project?.client?._id
  const isOpen = project?.status === 'Open'
  const isInProgress = project?.status === 'InProgress'

  const handleLoadProposals = async () => {
    setShowProposals(true)
    setProposalsLoading(true)
    try {
      const res = await getProposals(id)
      if (res?.success) setProposals(res.data)
    } catch { /* ignore */ } finally {
      setProposalsLoading(false)
    }
  }

  const handleSubmitProposal = async () => {
    if (!bidAmount || !deliveryTime.trim() || !coverLetter.trim()) return
    setSubmitLoading(true)
    setSubmitError('')
    try {
      const res = await submitProposal(id, {
        bidAmount: Number(bidAmount),
        deliveryTime: deliveryTime.trim(),
        coverLetter: coverLetter.trim(),
      })
      if (res?.success) {
        setSubmitted(true)
        setBidAmount(''); setDeliveryTime(''); setCoverLetter('')
      } else {
        setSubmitError(res?.message || t('common.error'))
      }
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleAcceptProposal = async (proposalId) => {
    try {
      const res = await acceptProposal(id, proposalId)
      if (res?.success) { fetchProject(false); handleLoadProposals() }
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

            {isClient && showProposals && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{t('projects.proposals', 'Proposals')}</Typography>
                {proposalsLoading ? <CircularProgress size={24} /> : proposals.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t('projects.noProposals', 'No proposals yet')}</Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {proposals.map((p) => (
                      <Paper key={p._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                          <Avatar src={p.freelancer?.profile?.avatar} sx={{ width: 36, height: 36 }}>{p.freelancer?.profile?.firstName?.charAt(0)}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">{p.freelancer?.profile?.firstName} {p.freelancer?.profile?.lastName}</Typography>
                            <Stack direction="row" spacing={1.5} sx={{ mt: 0.3 }}>
                              <Typography variant="caption" fontWeight="bold" color="primary.main">{p.bidAmount} {project.budget?.currency || 'SAR'}</Typography>
                              <Typography variant="caption" color="text.secondary">{p.deliveryTime}</Typography>
                              <Chip label={p.status} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{p.coverLetter}</Typography>
                            {p.status === 'Pending' && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleAcceptProposal(p._id)} sx={{ mt: 1, borderRadius: 999, fontSize: '0.78rem' }}>
                                {t('projects.accept', 'Accept')}
                              </Button>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
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

            {isClient && isOpen && (
              <Button variant="contained" onClick={handleLoadProposals} startIcon={<PersonOutlined />} fullWidth>
                {t('projects.viewProposals', 'View Proposals')}
              </Button>
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

            {!isClient && isOpen && !submitted && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{t('projects.submitProposal', 'Submit Proposal')}</Typography>
                <Stack spacing={2}>
                  <TextField label={t('projects.bidAmount', 'Bid Amount')} type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} fullWidth required size="small" />
                  <TextField label={t('projects.deliveryTime', 'Delivery Time')} placeholder={t('projects.deliveryTimePlaceholder', 'e.g. 2 weeks')} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} fullWidth required size="small" />
                  <TextField label={t('projects.coverLetter', 'Cover Letter')} placeholder={t('projects.coverLetterPlaceholder', 'Describe your experience and approach...')} multiline rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} fullWidth required size="small" />
                  {submitError && <Typography color="error" variant="caption">{submitError}</Typography>}
                  <Button variant="contained" endIcon={<SendOutlined />} onClick={handleSubmitProposal} disabled={submitLoading || !bidAmount || !deliveryTime.trim() || !coverLetter.trim()} fullWidth>
                    {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.submitProposal', 'Submit Proposal')}
                  </Button>
                </Stack>
              </Paper>
            )}

            {!isClient && submitted && (
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.04) }}>
                <Typography color="success.main" fontWeight="bold">{t('projects.proposalSent', 'Your proposal has been submitted!')}</Typography>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('projects.deleteConfirmTitle', 'Delete this project?')}</DialogTitle>
        <DialogContent><Typography variant="body2">{t('projects.deleteConfirmBody', 'This action cannot be undone.')}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('projects.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
