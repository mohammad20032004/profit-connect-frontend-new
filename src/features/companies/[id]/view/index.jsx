import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, IconButton, Divider,
  Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined, LocationOnOutlined,
  LanguageOutlined, EmailOutlined, LinkedIn, Twitter, FavoriteBorderOutlined, FavoriteOutlined,
  VerifiedOutlined, CalendarMonthOutlined, GroupsOutlined,
  StarBorderOutlined, AdminPanelSettingsOutlined, EditOutlined, DeleteOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanyById, toggleFollow, addAdmin, upsertRating, deleteMyRating, updateCompany, deleteCompany } from '@/services/companyService'

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [addAdminOpen, setAddAdminOpen] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingReview, setRatingReview] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)

  const [editOpen, setEditOpen] = useState(false)

  const formatLocation = (loc) => {
    if (!loc) return ''
    if (typeof loc === 'string') return loc
    const parts = [loc.city, loc.country].filter(Boolean)
    return parts.join(', ') || ''
  }
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const INDUSTRIES = [
    { value: 'web-development', en: 'Web Development', ar: 'تطوير المواقع' },
    { value: 'mobile-development', en: 'Mobile Development', ar: 'تطوير تطبيقات الجوال' },
    { value: 'frontend', en: 'Frontend Development', ar: 'تطوير الواجهات الأمامية' },
    { value: 'backend', en: 'Backend Development', ar: 'تطوير الخلفيات' },
    { value: 'fullstack', en: 'Full Stack Development', ar: 'تطوير شامل' },
    { value: 'devops', en: 'DevOps & Cloud', ar: 'DevOps والحوسبة السحابية' },
    { value: 'ai-ml', en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي والتعلم الآلي' },
    { value: 'data-science', en: 'Data Science & Analytics', ar: 'علوم البيانات والتحليلات' },
    { value: 'cybersecurity', en: 'Cybersecurity', ar: 'الأمن السيبراني' },
    { value: 'ui-ux', en: 'UI/UX Design', ar: 'تصميم واجهات وتجربة المستخدم' },
    { value: 'qa-testing', en: 'QA & Testing', ar: 'الجودة والاختبار' },
    { value: 'game-dev', en: 'Game Development', ar: 'تطوير الألعاب' },
    { value: 'blockchain', en: 'Blockchain & Web3', ar: 'بلوكتشين وويب 3' },
    { value: 'iot', en: 'IoT & Embedded Systems', ar: 'إنترنت الأشياء والأنظمة المدمجة' },
    { value: 'saas', en: 'SaaS Products', ar: 'منتجات SaaS' },
    { value: 'ecommerce-tech', en: 'E-commerce Tech', ar: 'تقنيات التجارة الإلكترونية' },
    { value: 'other', en: 'Other', ar: 'أخرى' },
  ]

  const fetchCompany = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const res = await getCompanyById(id)
      if (res?.success) {
        setCompany(res.data)
        setFollowersCount(res.data.followersCount)
        const isFollower = res.data.followers?.some((f) => f?.toString() === currentUserId || f?._id === currentUserId)
        setFollowing(isFollower)
      }
    } catch (err) {
      if (showLoader) setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => { fetchCompany() }, [id])

  const isOwner = currentUserId === company?.owner?._id
  const currentUserRating = company?.ratings?.find((r) => r.user?._id === currentUserId)

  const handleFollow = async () => {
    const prev = following; const prevCount = followersCount
    setFollowing(!prev); setFollowersCount(prev ? prevCount - 1 : prevCount + 1)
    try { const res = await toggleFollow(id); setFollowing(res.isFollowing); setFollowersCount(res.followersCount) }
    catch { setFollowing(prev); setFollowersCount(prevCount) }
  }

  const handleAddAdmin = async () => {
    if (!adminId.trim()) return
    setAdminLoading(true)
    try { await addAdmin(id, adminId.trim()); setAddAdminOpen(false); setAdminId(''); fetchCompany(false) }
    catch (err) { alert(err?.response?.data?.message || t('common.error')) }
    finally { setAdminLoading(false) }
  }

  const handleRatingSubmit = async () => {
    setRatingLoading(true)
    try { await upsertRating(id, { rating: ratingValue, review: ratingReview }); setRatingOpen(false); setRatingValue(5); setRatingReview(''); fetchCompany(false) }
    catch (err) { alert(err?.response?.data?.message || t('common.error')) }
    finally { setRatingLoading(false) }
  }

  const handleDeleteRating = async () => {
    try { await deleteMyRating(id); fetchCompany(false) }
    catch (err) { alert(err?.response?.data?.message || t('common.error')) }
  }

  const openEdit = () => {
    setEditForm({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      location: formatLocation(company.location),
      companySize: company.companySize || '',
      foundedYear: company.foundedYear || '',
      website: company.website || '',
      contactEmail: company.contactEmail || '',
    })
    setEditOpen(true)
  }

  const handleEditChange = (key) => (e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))

  const handleEditSubmit = async () => {
    if (!editForm.name.trim()) return
    setEditLoading(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        industry: editForm.industry,
        location: editForm.location.trim(),
        companySize: editForm.companySize,
        foundedYear: editForm.foundedYear ? Number(editForm.foundedYear) : undefined,
        website: editForm.website.trim(),
        contactEmail: editForm.contactEmail.trim(),
      }
      const res = await updateCompany(id, payload)
      if (res?.success) {
        setEditOpen(false)
        fetchCompany(false)
      }
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteCompany = async () => {
    setDeleteLoading(true)
    try {
      await deleteCompany(id)
      navigate('/companies')
    } catch (err) {
      alert(err?.response?.data?.message || t('common.error'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (error) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      <Button variant="outlined" onClick={() => fetchCompany()}>{t('companies.retry', 'Retry')}</Button>
    </Container>
  )

  if (loading) return <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>

  if (!company) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error">{t('companies.notFound', 'Company not found')}</Typography>
      <Box component="span" onClick={() => navigate('/companies')} sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', display: 'inline-block' }}>
        {t('companies.back', 'Back to companies')}
      </Box>
    </Container>
  )

  const openJobs = company.recentJobs?.filter((j) => j.status === 'Open').slice(0, 5) || []

  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', py: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackOutlined /></IconButton>
        <Typography variant="h5" fontWeight="bold" noWrap sx={{ flex: 1 }}>{company.name}</Typography>
        {company.isVerified && <VerifiedOutlined sx={{ color: 'primary.main', fontSize: 22 }} />}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left card */}
        <Paper sx={{ width: 280, flexShrink: 0, borderRadius: 3, overflow: 'auto', p: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar src={company.logo} sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
              {company.name?.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontWeight="bold" noWrap>{company.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{company.industry || ''}</Typography>
            </Box>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {company.location && <Typography variant="caption" color="text.secondary"><LocationOnOutlined sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-top' }} />{formatLocation(company.location)}</Typography>}
            {company.companySize && <Typography variant="caption" color="text.secondary"><GroupsOutlined sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-top' }} />{company.companySize}</Typography>}
            {company.foundedYear && <Typography variant="caption" color="text.secondary"><CalendarMonthOutlined sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-top' }} />Founded {company.foundedYear}</Typography>}
          </Stack>

          <Button fullWidth variant={following ? 'outlined' : 'contained'} size="small" startIcon={following ? <FavoriteOutlined /> : <FavoriteBorderOutlined />} onClick={handleFollow} color={following ? 'error' : 'primary'} sx={{ mt: 1.5 }}>
            {following ? t('companies.unfollow') : t('companies.follow')} ({followersCount})
          </Button>
          <Button fullWidth variant="outlined" size="small" startIcon={<StarBorderOutlined />} onClick={() => setRatingOpen(true)} sx={{ mt: 0.5 }}>
            {currentUserRating ? t('companies.updateRating') : t('companies.rate')}
          </Button>
          {isOwner && (
            <Button fullWidth variant="outlined" size="small" startIcon={<AdminPanelSettingsOutlined />} onClick={() => setAddAdminOpen(true)} sx={{ mt: 0.5 }}>
              {t('companies.addAdmin')}
            </Button>
          )}
          {isOwner && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              <Button fullWidth variant="outlined" size="small" startIcon={<EditOutlined />} onClick={openEdit} sx={{ flex: 1 }}>
                {t('companies.edit', 'Edit')}
              </Button>
              <Button fullWidth variant="outlined" size="small" color="error" startIcon={<DeleteOutlineOutlined />} onClick={() => setDeleteOpen(true)} sx={{ flex: 1 }}>
                {t('companies.delete', 'Delete')}
              </Button>
            </Stack>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{t('companies.links')}</Typography>
          <Stack spacing={0.3} sx={{ mt: 0.5 }}>
            {company.website && <Button variant="text" size="small" startIcon={<LanguageOutlined />} href={company.website} target="_blank" sx={{ justifyContent: 'flex-start', fontSize: '0.78rem', color: 'primary.main', minHeight: 28 }}>{t('companies.website')}</Button>}
            {company.contactEmail && <Button variant="text" size="small" startIcon={<EmailOutlined />} href={`mailto:${company.contactEmail}`} sx={{ justifyContent: 'flex-start', fontSize: '0.78rem', color: 'primary.main', minHeight: 28, textOverflow: 'ellipsis', overflow: 'hidden' }}>{company.contactEmail}</Button>}
            {company.socialLinks?.linkedin && <Button variant="text" size="small" startIcon={<LinkedIn />} href={company.socialLinks.linkedin} target="_blank" sx={{ justifyContent: 'flex-start', fontSize: '0.78rem', color: '#0A66C2', minHeight: 28 }}>LinkedIn</Button>}
            {company.socialLinks?.twitter && <Button variant="text" size="small" startIcon={<Twitter />} href={company.socialLinks.twitter} target="_blank" sx={{ justifyContent: 'flex-start', fontSize: '0.78rem', color: '#1DA1F2', minHeight: 28 }}>X (Twitter)</Button>}
          </Stack>

          {company.owner && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{t('companies.companyOwner', 'Owner')}</Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                <Avatar src={company.owner.profile?.avatar} sx={{ width: 32, height: 32 }}>{company.owner.profile?.firstName?.charAt(0)}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="bold" noWrap>{company.owner.profile?.firstName} {company.owner.profile?.lastName}</Typography>
                  {company.owner.profile?.headline && <Typography variant="caption" color="text.secondary" noWrap>{company.owner.profile.headline}</Typography>}
                </Box>
              </Stack>
            </>
          )}
        </Paper>

        {/* Main content */}
        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          {/* Stats */}
          <Paper sx={{ p: 1.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ textAlign: 'center', flex: 1 }}><Typography variant="h6" fontWeight="bold">{followersCount}</Typography><Typography variant="caption" color="text.secondary">{t('companies.followers')}</Typography></Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}><Typography variant="h6" fontWeight="bold">{company.jobsCount ?? 0}</Typography><Typography variant="caption" color="text.secondary">{t('companies.openJobs', 'Open Jobs')}</Typography></Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">{company.averageRating?.toFixed(1) || '-'}</Typography>
                  <Rating value={company.averageRating || 0} readOnly precision={0.1} size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary">{t('companies.rating', 'Rating')} ({company.ratings?.length || 0})</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Content grid - horizontal sections */}
          <Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
            {/* About */}
            <Paper sx={{ flex: 1, borderRadius: 3, p: 2, overflow: 'auto' }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('companies.about')}</Typography>
              {company.description && <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{company.description}</Typography>}
            </Paper>

            {/* Jobs */}
            {openJobs.length > 0 && (
              <Paper sx={{ flex: 1, borderRadius: 3, p: 2, overflow: 'auto' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('companies.openJobs', 'Open Jobs')} ({company.jobsCount})</Typography>
                <Stack spacing={1}>
                  {openJobs.map((job) => (
                    <Box key={job._id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight="bold">{job.title}</Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.3, flexWrap: 'wrap' }}>
                        {job.location && <Typography variant="caption" color="text.secondary"><LocationOnOutlined sx={{ fontSize: 12, verticalAlign: 'text-top' }} />{job.location}</Typography>}
                        {job.type && <Chip label={job.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />}
                        {job.workLevel && <Chip label={job.workLevel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />}
                        {job.workPlace && <Chip label={job.workPlace} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />}
                      </Stack>
                      {job.salary?.min && <Typography variant="caption" color="primary" sx={{ mt: 0.3, display: 'block', fontWeight: 600 }}>{job.salary.currency || 'SAR'} {job.salary.min.toLocaleString()}{job.salary.max ? ` - ${job.salary.max.toLocaleString()}` : ''}</Typography>}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Ratings */}
            <Paper sx={{ flex: 1, borderRadius: 3, p: 2, overflow: 'auto' }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('companies.ratings', 'Ratings')} ({company.ratings?.length || 0})</Typography>
              {currentUserRating && (
                <Box sx={{ mb: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight="bold">{t('companies.yourRating')}</Typography>
                    <Button variant="text" size="small" color="error" onClick={handleDeleteRating} sx={{ fontSize: '0.68rem', minHeight: 0, p: 0 }}>{t('companies.deleteRating')}</Button>
                  </Stack>
                  <Rating value={currentUserRating.rating} readOnly size="small" />
                  {currentUserRating.review && <Typography variant="caption" sx={{ mt: 0.3, display: 'block' }}>{currentUserRating.review}</Typography>}
                </Box>
              )}
              {company.ratings?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">{t('companies.noRatings')}</Typography>
              ) : (
                <Stack spacing={1}>
                  {company.ratings.filter((r) => r.user?._id !== currentUserId).concat(company.ratings.filter((r) => r.user?._id === currentUserId)).map((r) => (
                    <Box key={r._id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Avatar src={r.user?.profile?.avatar} sx={{ width: 28, height: 28 }}>{r.user?.profile?.firstName?.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight="bold">{r.user?.profile?.firstName} {r.user?.profile?.lastName}</Typography>
                        {r.user?.profile?.headline && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{r.user.profile.headline}</Typography>}
                        <Rating value={r.rating} readOnly size="small" />
                        {r.review && <Typography variant="caption" sx={{ display: 'block' }}>{r.review}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Stack>
      </Stack>

      {/* Dialogs */}
      <Dialog open={addAdminOpen} onClose={() => setAddAdminOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('companies.addAdmin')}</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth label="User ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setAddAdminOpen(false)}>{t('companies.cancel')}</Button>
          <Button variant="contained" onClick={handleAddAdmin} disabled={adminLoading || !adminId.trim()}>{adminLoading ? <CircularProgress size={20} /> : t('companies.add')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ratingOpen} onClose={() => setRatingOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{currentUserRating ? t('companies.updateRating') : t('companies.rate')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Rating value={ratingValue} onChange={(_, v) => setRatingValue(v || 5)} size="large" />
            <TextField fullWidth multiline rows={3} label={t('companies.review', 'Review (optional)')} value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setRatingOpen(false)}>{t('companies.cancel')}</Button>
          <Button variant="contained" onClick={handleRatingSubmit} disabled={ratingLoading}>{ratingLoading ? <CircularProgress size={20} /> : t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle component="div">
          <Typography variant="h6" fontWeight="bold">
            {lang === 'ar' ? 'تعديل بيانات الشركة' : 'Edit Company'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={lang === 'ar' ? 'اسم الشركة *' : 'Company Name *'} value={editForm.name || ''} onChange={handleEditChange('name')} fullWidth required />
            <TextField label={lang === 'ar' ? 'الوصف' : 'Description'} value={editForm.description || ''} onChange={handleEditChange('description')} fullWidth multiline rows={3} />
            <TextField label={lang === 'ar' ? 'المجال' : 'Industry'} value={editForm.industry || ''} onChange={handleEditChange('industry')} select fullWidth>
              <MenuItem value="">
                <em>{lang === 'ar' ? 'اختر المجال' : 'Select industry'}</em>
              </MenuItem>
              {INDUSTRIES.map((ind) => (
                <MenuItem key={ind.value} value={ind.value}>{ind[lang]}</MenuItem>
              ))}
            </TextField>
            <TextField label={lang === 'ar' ? 'الموقع' : 'Location'} value={editForm.location || ''} onChange={handleEditChange('location')} fullWidth />
            <TextField label={lang === 'ar' ? 'الحجم' : 'Company Size'} value={editForm.companySize || ''} onChange={handleEditChange('companySize')} fullWidth placeholder="e.g. 51-200" />
            <TextField label={lang === 'ar' ? 'سنة التأسيس' : 'Founded Year'} value={editForm.foundedYear || ''} onChange={handleEditChange('foundedYear')} fullWidth type="number" />
            <TextField label={lang === 'ar' ? 'الموقع الإلكتروني' : 'Website'} value={editForm.website || ''} onChange={handleEditChange('website')} fullWidth placeholder="https://" />
            <TextField label={lang === 'ar' ? 'البريد الإلكتروني' : 'Contact Email'} value={editForm.contactEmail || ''} onChange={handleEditChange('contactEmail')} fullWidth type="email" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setEditOpen(false)}>{t('companies.cancel')}</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={editLoading || !editForm.name?.trim()}>
            {editLoading ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle component="div">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <DeleteOutlineOutlined sx={{ color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" color="error">
              {lang === 'ar' ? 'حذف الشركة' : 'Delete Company'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {lang === 'ar'
              ? 'هل أنت متأكد من حذف هذه الشركة؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to delete this company? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteOpen(false)}>{t('companies.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCompany} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : t('companies.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
