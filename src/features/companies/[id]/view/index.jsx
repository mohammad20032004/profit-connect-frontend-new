import { BRAND, RADIUS } from '@/theme/tokens'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Avatar, Chip, IconButton,
  Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert,
  alpha, LinearProgress,
} from '@mui/material'
import Button from '@/ui/Button'
import UserAvatar from '@/components/common/UserAvatar'
import LocationMap from '@/components/LocationMap'
import { resolveMediaPath, resolveCompanyMediaPath } from '@/services/profile'
import {
  ArrowBackOutlined, LocationOnOutlined,
  LanguageOutlined, EmailOutlined, LinkedIn, Twitter, FavoriteBorderOutlined, FavoriteOutlined,
  VerifiedOutlined, CalendarMonthOutlined,
  StarBorderOutlined, AdminPanelSettingsOutlined, EditOutlined, DeleteOutlineOutlined,
  StarRounded, PeopleAltOutlined, PaymentsOutlined, ContactSupportOutlined,
  DescriptionOutlined, DownloadOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanyById, toggleFollow, addAdmin, upsertRating, deleteMyRating, updateCompany, deleteCompany } from '@/services/companyService'

const INDUSTRY_COLORS = {
  'web-development': '#6366F1',
  'mobile-development': '#8B5CF6',
  'frontend': '#EC4899',
  'backend': '#14B8A6',
  'fullstack': '#5C3594',
  'devops': '#10B981',
  'ai-ml': '#F43F5E',
  'data-science': '#3B82F6',
  'cybersecurity': '#EF4444',
  'ui-ux': '#F59E0B',
  'qa-testing': '#0891B2',
  'game-dev': '#8B5CF6',
  'blockchain': '#F97316',
  'iot': '#0EA5E9',
  'saas': '#7C3AED',
  'ecommerce-tech': '#DB2777',
  'other': '#6B7280',
}

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const currentUserId = useSelector((state) => state.user.user?._id || state.user.user?.id)
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
  const [toastMsg, setToastMsg] = useState('')

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

  const fetchCompany = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setError('')
    try {
      const res = await getCompanyById(id)
      if (res?.success) {
        setCompany(res.data)
        setFollowersCount(res.data.followersCount)
        const isFollower = res.data.followers?.some((f) => {
          const fid = typeof f === 'string' ? f : f?._id || f?.id
          return fid && fid.toString() === currentUserId?.toString()
        })
        setFollowing(isFollower)
      }
    } catch (err) {
      if (showLoader) setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [id, currentUserId, t])

  useEffect(() => { fetchCompany() }, [id, fetchCompany])

  const isOwner = currentUserId && currentUserId === (company?.owner?._id || company?.owner?.id)
  const currentUserRating = company?.ratings?.find((r) => {
    const rid = r.user?._id || r.user?.id
    return rid && rid.toString() === currentUserId?.toString()
  })

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
    catch (err) { setToastMsg(err?.response?.data?.message || t('common.error')) }
    finally { setAdminLoading(false) }
  }

  const handleRatingSubmit = async () => {
    setRatingLoading(true)
    try { await upsertRating(id, { rating: ratingValue, review: ratingReview }); setRatingOpen(false); setRatingValue(5); setRatingReview(''); fetchCompany(false) }
    catch (err) { setToastMsg(err?.response?.data?.message || t('common.error')) }
    finally { setRatingLoading(false) }
  }

  const handleDeleteRating = async () => {
    try { await deleteMyRating(id); fetchCompany(false) }
    catch (err) { setToastMsg(err?.response?.data?.message || t('common.error')) }
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
      setToastMsg(err?.response?.data?.message || t('common.error'))
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
      setToastMsg(err?.response?.data?.message || t('common.error'))
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

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <LinearProgress sx={{ mb: 3, borderRadius: RADIUS, height: 3, bgcolor: alpha(BRAND, 0.08), '& .MuiLinearProgress-bar': { borderRadius: RADIUS, background: 'linear-gradient(90deg, BRAND, #1F3670)' } }} />
      <Box sx={{ height: 180, borderRadius: 3, bgcolor: alpha(BRAND, 0.06), animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Box sx={{ mt: -6, ml: 4, width: 96, height: 96, borderRadius: '50%', bgcolor: alpha(BRAND, 0.1), border: '4px solid #fff', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </Container>
  )

  if (!company) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error">{t('companies.notFound', 'Company not found')}</Typography>
      <Box component="span" onClick={() => navigate('/companies')} sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', display: 'inline-block' }}>
        {t('companies.back', 'Back to companies')}
      </Box>
    </Container>
  )

  const industryColor = INDUSTRY_COLORS[company.industry] || BRAND
  const coverPhoto = company.coverPhoto ? resolveCompanyMediaPath(company.coverPhoto) : null
  const logoSrc = company.logo ? resolveCompanyMediaPath(company.logo) : null
  const ownerAvatar = company.owner?.profile?.avatar ? resolveMediaPath(company.owner.profile.avatar) : null
  const openJobs = company.recentJobs?.filter((j) => j.status === 'Open').slice(0, 4) || []

  const heroStats = [
    { label: t('companies.followers', 'Followers'), value: followersCount?.toLocaleString() || '0', icon: <PeopleAltOutlined fontSize="small" /> },
    { label: t('companies.rating', 'Rating'), value: company.averageRating?.toFixed(1) || '-', icon: <StarRounded fontSize="small" sx={{ color: '#F59E0B' }} /> },
    { label: t('companies.founded', 'Founded'), value: company.foundedYear || '-', icon: <CalendarMonthOutlined fontSize="small" /> },
  ]

  const tagSx = { bgcolor: alpha(BRAND, 0.1), color: BRAND, fontWeight: 700, borderRadius: RADIUS, fontSize: '0.7rem' }

  return (
    <Container maxWidth={false} disableGutters sx={{ maxWidth: { xs: '100%', md: 1180, lg: 1480, xl: 1760 }, '@media (min-width: 1920px)': { maxWidth: 2200 }, '@media (min-width: 2560px)': { maxWidth: 3000 }, mx: 'auto', px: { xs: 0.75, sm: 2, md: 3 }, py: { xs: 1.5, md: 3 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><ArrowBackOutlined /></IconButton>
        <Typography variant="h5" fontWeight="bold" noWrap sx={{ flex: 1 }}>{t('companies.title', 'Companies')}</Typography>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: { xs: 0, md: 4 }, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 40px rgba(12,8,24,0.07)' }}>
        {/* Cover Banner */}
        <Box sx={{ position: 'relative', height: { xs: 150, md: 200 }, overflow: 'hidden' }}>
          {coverPhoto ? (
            <Box component="img" src={coverPhoto} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${industryColor} 0%, ${alpha(industryColor, 0.65)} 60%, #1F3670 100%)` }} />
          )}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)' }} />
          {/* Decorative pattern */}
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.12,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20h-2v-2h2v2zm0 0v-2h-2v2h2zm0 0v2h2v-2h-2zm0 0h2v2h-2v-2z\'/%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }} />
        </Box>

        {/* Header Card */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'center', sm: 'flex-end' } }}>
            <Avatar
              src={logoSrc}
              sx={{
                width: { xs: 96, sm: 112 }, height: { xs: 96, sm: 112 },
                mt: { xs: -6, sm: -7 },
                border: '4px solid', borderColor: 'background.paper',
                bgcolor: industryColor, fontSize: '2.5rem', fontWeight: 800, color: '#fff',
                boxShadow: `0 8px 24px ${alpha(industryColor, 0.3)}`, flexShrink: 0,
              }}
            >
              {company.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, minWidth: 0, pb: { xs: 0, sm: 1 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{company.name}</Typography>
                {company.isVerified && (
                  <VerifiedOutlined sx={{ color: 'secondary.main', fontSize: 26 }} />
                )}
              </Stack>
              {company.industry && (
                <Chip
                  label={company.industry}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: alpha(industryColor, 0.1), color: industryColor, fontWeight: 600, fontSize: '0.75rem', borderRadius: RADIUS }}
                />
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', sm: 'flex-end' }, pb: { xs: 0, sm: 1 }, flexWrap: 'wrap' }}>
              <Button
                variant={following ? 'outlined' : 'contained'}
                startIcon={following ? <FavoriteOutlined /> : <FavoriteBorderOutlined />}
                onClick={handleFollow}
                color={following ? 'error' : 'primary'}
                sx={{ borderRadius: RADIUS, px: 2.5 }}
              >
                {following ? t('companies.unfollow') : t('companies.follow')} ({followersCount})
              </Button>
              <Button variant="outlined" startIcon={<StarBorderOutlined />} onClick={() => setRatingOpen(true)} sx={{ borderRadius: RADIUS, px: 2.5 }}>
                {currentUserRating ? t('companies.updateRating') : t('companies.rate')}
              </Button>
            </Stack>
          </Stack>

          {/* Quick info stats */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, alignItems: 'stretch' }}>
            {heroStats.map((s) => (
              <Stack key={s.label} direction="row" spacing={0.75} alignItems="center"
                sx={{ px: 1.5, py: 0.75, borderRadius: RADIUS, bgcolor: alpha(BRAND, 0.06) }}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>{s.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} lineHeight={1}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {isOwner && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
              <Button variant="outlined" size="small" startIcon={<AdminPanelSettingsOutlined />} onClick={() => setAddAdminOpen(true)}>
                {t('companies.addAdmin')}
              </Button>
              <Button variant="outlined" size="small" startIcon={<EditOutlined />} onClick={openEdit}>
                {t('companies.edit', 'Edit')}
              </Button>
              <Button variant="outlined" size="small" color="error" startIcon={<DeleteOutlineOutlined />} onClick={() => setDeleteOpen(true)}>
                {t('companies.delete', 'Delete')}
              </Button>
            </Stack>
          )}
        </Box>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
      {/* Content */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Main column */}
        <Stack spacing={0} sx={{ flex: 1, minWidth: 0, order: { xs: 2, lg: 1 } }}>
          {/* About */}
          {company.description && (
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Box sx={{ width: 4, height: 20, borderRadius: RADIUS, bgcolor: industryColor }} />
                <Typography variant="h6" fontWeight={700}>{t('companies.about', lang === 'ar' ? 'نبذة عن الشركة' : 'About')}</Typography>
              </Stack>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>{company.description}</Typography>
            </Box>
          )}

          {/* Jobs */}
          {openJobs.length > 0 && (
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 4, height: 20, borderRadius: RADIUS, bgcolor: industryColor }} />
                <Typography variant="h6" fontWeight={700}>{t('companies.openJobs', 'Open Jobs')}</Typography>
                <Chip label={company.jobsCount} size="small" sx={{ ml: 0.5, bgcolor: alpha(industryColor, 0.1), color: industryColor, fontWeight: 700 }} />
              </Stack>
              <Stack spacing={1.5}>
                {openJobs.map((job) => (
                  <Box
                    key={job._id}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    sx={{
                      p: 2, borderRadius: RADIUS, border: '1px solid', borderColor: 'divider',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      '&:hover': { borderColor: alpha(industryColor, 0.35), boxShadow: `0 4px 16px ${alpha(industryColor, 0.08)}`, transform: 'translateY(-2px)' },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }}>{job.title}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.8 }}>
                      {job.location && (
                        <Chip icon={<LocationOnOutlined sx={{ fontSize: 13 }} />} label={job.location} size="small" sx={{ ...tagSx, height: 24 }} />
                      )}
                      {job.type && <Chip label={job.type} size="small" sx={tagSx} />}
                      {job.workLevel && <Chip label={job.workLevel} size="small" sx={tagSx} />}
                      {job.workPlace && <Chip label={job.workPlace} size="small" sx={tagSx} />}
                    </Stack>
                    {job.salary?.min && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                        <PaymentsOutlined fontSize="small" /> {job.salary.currency || 'USD'} {job.salary.min.toLocaleString()}{job.salary.max ? ` - ${job.salary.max.toLocaleString()}` : ''}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Ratings */}
          <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ width: 4, height: 20, borderRadius: RADIUS, bgcolor: industryColor }} />
              <Typography variant="h6" fontWeight={700}>{t('companies.ratings', 'Ratings')}</Typography>
              <Chip label={company.ratings?.length || 0} size="small" sx={{ ml: 0.5, bgcolor: alpha('#F59E0B', 0.12), color: '#F59E0B', fontWeight: 700 }} />
            </Stack>

            {currentUserRating && (
              <Box sx={{ mb: 2, p: 2, bgcolor: alpha(BRAND, 0.03), borderRadius: RADIUS, border: '1px solid', borderColor: alpha(BRAND, 0.08) }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={700} color="primary.main">{t('companies.yourRating', 'Your Rating')}</Typography>
                  </Stack>
                  <Button variant="text" size="small" color="error" onClick={handleDeleteRating} sx={{ fontSize: '0.75rem', minHeight: 0, p: 0.5 }}>{t('companies.deleteRating')}</Button>
                </Stack>
                <Rating value={currentUserRating.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                {currentUserRating.review && <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{currentUserRating.review}</Typography>}
              </Box>
            )}

            {(!company.ratings || company.ratings.length === 0) ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>{t('companies.noRatings')}</Typography>
            ) : (
              <Stack spacing={1.5}>
                {company.ratings.filter((r) => {
                  const rid = r.user?._id || r.user?.id
                  return !(rid && rid.toString() === currentUserId?.toString())
                }).concat(company.ratings.filter((r) => {
                  const rid = r.user?._id || r.user?.id
                  return rid && rid.toString() === currentUserId?.toString()
                })).map((r) => (
                  <Box key={r._id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <UserAvatar
                      src={r.user?.profile?.avatar}
                      name={`${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.trim()}
                      role={r.user?.role}
                      gender={r.user?.profile?.gender}
                      sx={{ width: 40, height: 40, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700}>{r.user?.profile?.firstName} {r.user?.profile?.lastName}</Typography>
                      {r.user?.profile?.headline && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{r.user.profile.headline}</Typography>}
                      <Rating value={r.rating} readOnly size="small" sx={{ my: 0.25 }} />
                      {r.review && <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{r.review}</Typography>}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        {/* Sidebar */}
        <Stack spacing={0} sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0, order: { xs: 1, lg: 2 } }}>
          {/* Contact & Location */}
          {(company.website || company.contactEmail || company.socialLinks?.linkedin || company.socialLinks?.twitter || company.location) && (
            <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider', order: 1 }}>
              {(company.website || company.contactEmail || company.socialLinks?.linkedin || company.socialLinks?.twitter) && (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <ContactSupportOutlined sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" fontWeight={800}>{t('companies.contact', lang === 'ar' ? 'التواصل' : 'Contact')}</Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {company.website && (
                      <Button fullWidth variant="text" startIcon={<Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: alpha(BRAND, 0.08), display: 'flex', color: 'primary.main' }}><LanguageOutlined fontSize="small" /></Box>} href={company.website} target="_blank" sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary', fontWeight: 600, px: 1 }}>
                        {company.website.replace(/^https?:\/\//, '')}
                      </Button>
                    )}
                    {company.contactEmail && (
                      <Button fullWidth variant="text" startIcon={<Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: alpha(BRAND, 0.08), display: 'flex', color: 'primary.main' }}><EmailOutlined fontSize="small" /></Box>} href={`mailto:${company.contactEmail}`} sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary', fontWeight: 600, px: 1 }}>
                        {company.contactEmail}
                      </Button>
                    )}
                    {company.socialLinks?.linkedin && (
                      <Button fullWidth variant="text" startIcon={<Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(10,102,194,0.1)', display: 'flex', color: '#0A66C2' }}><LinkedIn fontSize="small" /></Box>} href={company.socialLinks.linkedin} target="_blank" sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary', fontWeight: 600, px: 1 }}>
                        LinkedIn
                      </Button>
                    )}
                    {company.socialLinks?.twitter && (
                      <Button fullWidth variant="text" startIcon={<Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(29,161,242,0.1)', display: 'flex', color: '#1DA1F2' }}><Twitter fontSize="small" /></Box>} href={company.socialLinks.twitter} target="_blank" sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary', fontWeight: 600, px: 1 }}>
                        X (Twitter)
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {company.location && (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, mt: (company.website || company.contactEmail || company.socialLinks?.linkedin || company.socialLinks?.twitter) ? 3 : 0 }}>
                    <LocationOnOutlined sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" fontWeight={800}>{t('companies.location', 'Location')}</Typography>
                  </Stack>
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                    <LocationMap location={company.location} readonly height={180} controls={false} />
                  </Box>
                  <Stack spacing={1}>
                    {company.location.city && <Typography variant="body2"><Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>{lang === 'ar' ? 'المدينة: ' : 'City: '}</Box>{company.location.city}</Typography>}
                    {company.location.street && <Typography variant="body2"><Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>{lang === 'ar' ? 'الشارع: ' : 'Street: '}</Box>{company.location.street}</Typography>}
                    {company.location.buildingNumber && <Typography variant="body2"><Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>{lang === 'ar' ? 'المبنى: ' : 'Building: '}</Box>{company.location.buildingNumber}</Typography>}
                    {company.location.country && <Typography variant="body2"><Box component="span" fontWeight={700} sx={{ color: 'text.primary' }}>{lang === 'ar' ? 'الدولة: ' : 'Country: '}</Box>{company.location.country}</Typography>}
                  </Stack>
                </>
              )}
            </Box>
          )}

          {/* Owner */}
          {company.owner && (
            <Box sx={{ p: { xs: 2, md: 3 }, order: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{t('companies.leadership', lang === 'ar' ? 'فريق القيادة' : 'Leadership')}</Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <UserAvatar
                  src={ownerAvatar}
                  name={`${company.owner.profile?.firstName || ''} ${company.owner.profile?.lastName || ''}`.trim()}
                  role={company.owner.role}
                  gender={company.owner.profile?.gender}
                  sx={{ width: 56, height: 56, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800} noWrap>{company.owner.profile?.firstName} {company.owner.profile?.lastName}</Typography>
                  {company.owner.profile?.headline && <Typography variant="body2" color="text.secondary" noWrap display="block">{company.owner.profile.headline}</Typography>}
                </Box>
                </Stack>
            </Box>
          )}

          {/* Verification Documents */}
          {company.verificationDocs?.length > 0 && (
            <Box sx={{ p: { xs: 2, md: 3 }, order: 4 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <DescriptionOutlined sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={800}>
                  {lang === 'ar' ? 'وثائق التوثيق' : 'Verification Documents'}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {company.verificationDocs.map((docUrl, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <DescriptionOutlined sx={{ color: 'text.secondary', fontSize: 22, flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {lang === 'ar' ? `ملف ${idx + 1}` : `File ${idx + 1}`}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      sx={{
                        color: 'primary.main',
                        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) },
                      }}
                    >
                      <DownloadOutlined fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>
      </Box>
      </Paper>

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

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setToastMsg('')} sx={{ borderRadius: RADIUS }}>{toastMsg}</Alert>
      </Snackbar>
    </Container>
  )
}
